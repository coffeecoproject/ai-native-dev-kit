import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { runStructuredJsonChildSync } from "../scripts/lib/structured-child-process.mjs";
import { createSourceExecution } from "../scripts/operating-loop/source-execution.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-structured-child-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function writeScript(root, name, source) {
  const file = path.join(root, name);
  fs.writeFileSync(file, source);
  return file;
}

test("structured JSON transport spools output beyond spawnSync's default buffer", (t) => {
  const root = fixture(t);
  const script = writeScript(root, "large-json.mjs", "console.log(JSON.stringify({ payload: 'x'.repeat(2 * 1024 * 1024) }));\n");
  const result = runStructuredJsonChildSync({ args: [script], cwd: root });

  assert.equal(result.state, "CURRENT_RUN", result.error);
  assert.equal(result.exitStatus, 0);
  assert.equal(result.value.payload.length, 2 * 1024 * 1024);
  assert.ok(result.stdoutBytes > 2 * 1024 * 1024);
  assert.match(result.stdoutDigest, /^sha256:[a-f0-9]{64}$/);
});

test("structured JSON transport reports invalid JSON without inventing an empty semantic result", (t) => {
  const root = fixture(t);
  const script = writeScript(root, "invalid-json.mjs", "console.log('not json');\n");
  const result = runStructuredJsonChildSync({ args: [script], cwd: root });

  assert.equal(result.state, "INVALID_JSON");
  assert.equal(result.value, null);
  assert.match(result.error, /invalid JSON/i);
});

test("WORKFLOW_NEXT preserves valid blocker JSON emitted with semantic exit 2", (t) => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, "scripts"));
  writeScript(root, "scripts/workflow-next.mjs", `
    console.log(JSON.stringify({
      nextAction: "REPAIR_PROJECT_ENTRY_TRUST",
      projectEntryTrust: { entry_state: "BLOCKED_REPAIR_REQUIRED", blockers: ["PROJECT_IDENTITY_STALE"] }
    }));
    process.exitCode = 2;
  `);
  const source = createSourceExecution(root).runSource("WORKFLOW_NEXT", "scripts/workflow-next.mjs", []);

  assert.equal(source.readStatus, "CURRENT_RUN");
  assert.equal(source.sourceContract, "SEMANTIC_BLOCKER_OUTPUT");
  assert.equal(source.outcome, "REPAIR_PROJECT_ENTRY_TRUST");
  assert.equal(source.value.projectEntryTrust.entry_state, "BLOCKED_REPAIR_REQUIRED");
});

test("unexpected nonzero resolver exits remain source failures even when JSON is parseable", (t) => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, "scripts"));
  writeScript(root, "scripts/other.mjs", "console.log(JSON.stringify({ outcome: 'READY' })); process.exitCode = 2;\n");
  const source = createSourceExecution(root).runSource("OTHER", "scripts/other.mjs", []);

  assert.equal(source.readStatus, "FAILED");
  assert.equal(source.sourceContract, "UNACCEPTED_RESOLVER_EXIT");
  assert.equal(source.value.outcome, "READY");
});

test("operating loop classifies blocked project entry as semantic repair instead of source read failure", (t) => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, "src"));
  fs.mkdirSync(path.join(root, "packages", "api"), { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "blocked-entry" }));
  fs.writeFileSync(path.join(root, "src", "index.js"), "export const ready = true;\n");
  fs.writeFileSync(path.join(root, "AGENTS.md"), "# Rules\n\nNever deploy to production.\n");
  fs.writeFileSync(path.join(root, "packages", "api", "AGENTS.md"), "# Rules\n\nAlways deploy to production.\n");

  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-operating-loop.mjs"),
    root,
    "--intent", "查看当前项目状态",
    "--json",
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  const workflowNext = report.sourceSystemTrace.find((source) => source.sourceSystem === "WORKFLOW_NEXT");

  assert.equal(workflowNext.readStatus, "CURRENT_RUN");
  assert.equal(workflowNext.sourceContract, "SEMANTIC_BLOCKER_OUTPUT");
  assert.equal(report.operatingLoop.state, "NEEDS_PROJECT_ENTRY_REPAIR");
  assert.equal(report.operatingDecision.actionCode, "REPAIR_PROJECT_ENTRY_TRUST");
  assert.notEqual(report.outcome, "BLOCKED_BY_SOURCE_FAILURE");
});

test("auto-native reconciliation consumes large structured evidence instead of inventing zero rules", { timeout: 120_000 }, (t) => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "large-rule-project" }));
  fs.writeFileSync(path.join(root, "src", "index.js"), "export const ready = true;\n");
  const rules = Array.from({ length: 4_000 }, (_, index) => (
    `- Codex must run test rule ${String(index + 1).padStart(4, "0")} before completing the matching workflow task.`
  ));
  fs.writeFileSync(path.join(root, "AGENTS.md"), `# Workflow Rules\n\n${rules.join("\n")}\n`);

  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/resolve-existing-rule-reconciliation.mjs"),
    root,
    "--auto-native",
    "--intent", "reconcile existing project rules",
    "--json",
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 128 * 1024 * 1024,
  });
  assert.ok([0, 1].includes(result.status), `${result.stdout.slice(0, 2_000)}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);

  assert.equal(report.nativeMigrationGeneration.state, "CURRENT_RUN");
  assert.ok(report.nativeMigrationGeneration.stdoutBytes > 1024 * 1024);
  assert.ok(report.ruleReconciliationCoverage.totalExtractedRules >= 4_000);
  assert.equal(report.ruleReconciliationCoverage.reconciledRules, report.ruleReconciliationCoverage.totalExtractedRules);
  assert.equal(report.existingRuleSet.length, report.ruleReconciliationCoverage.totalExtractedRules);
  assert.notEqual(report.nativeAdoptionDecision.recommendation, "READ_ONLY_DIAGNOSIS");
});
