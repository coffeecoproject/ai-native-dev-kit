import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  requiresOperatingBaselineConsumption,
  validateBaselineEnforcementConsumption,
} from "../scripts/lib/planning-closure.mjs";

const root = path.resolve(import.meta.dirname, "..");
const resolver = path.join(root, "scripts/resolve-planning-closure.mjs");
const checker = path.join(root, "scripts/check-planning-closure.mjs");
const contractChecker = path.join(root, "scripts/check-execution-entry-contract.mjs");
const cli = path.join(root, "scripts/cli.mjs");
const lowSource = path.join(root, "examples/1.83-task-governance/low-copy-change/task-governance-reports/001-task-governance.md");
const possibleHighIntent = "possibly change list filter rule may touch data state";

test("operating baseline consumption preserves LOW advisories after strict baselines pass", () => {
  const result = validateBaselineEnforcementConsumption({
    baselineLevel: "BL1",
    mode: "implementation",
    checkStatus: "PENDING",
    checks: [
      { status: "PASS", message: "platform baseline strict state is BASELINE_READY" },
      { status: "PASS", message: "industrial baseline strict state is NOT_APPLICABLE" },
      { status: "PENDING", message: "No task cards found; baseline reference enforcement is skipped until a task exists." },
      { status: "PENDING", message: "No review packets found; skipped until review evidence exists." },
    ],
  });

  assert.equal(result.ok, true);
  assert.equal(result.outcome, "BASELINE_READY");
  assert.equal(result.advisoryCount, 2);
  assert.equal(requiresOperatingBaselineConsumption({ behavioralAdoptionState: "VERIFIED_ACTIVE", operation: "CONTINUE_TASK" }), true);
  assert.equal(requiresOperatingBaselineConsumption({ behavioralAdoptionState: "VERIFIED_ACTIVE", operation: "FINISH_TASK" }), true);
  assert.equal(requiresOperatingBaselineConsumption({ behavioralAdoptionState: "VERIFIED_ACTIVE", operation: "CHECK_STATUS" }), false);
  assert.equal(requiresOperatingBaselineConsumption({ behavioralAdoptionState: "READ_ONLY_ASSESSED", operation: "CONTINUE_TASK" }), false);
});

test("operating baseline consumption rejects missing, stale, and incomplete baseline authority", () => {
  for (const message of [
    "platform baseline is not implementation-ready (BASELINE_DOCS_MISSING): missing docs/test-strategy.md",
    "platform baseline is not implementation-ready (PROFILE_INVALID): project profile and baseline selection are stale",
    "platform baseline is not implementation-ready (BASELINE_INSTALLATION_INCOMPLETE): web-runtime-standard is not installed",
  ]) {
    const result = validateBaselineEnforcementConsumption({
      baselineLevel: "BL1",
      mode: "implementation",
      checkStatus: "FAIL",
      checks: [
        { status: "FAIL", message },
        { status: "PASS", message: "industrial baseline strict state is NOT_APPLICABLE" },
      ],
    });
    assert.equal(result.ok, false, message);
    assert.equal(result.outcome, "BASELINE_BLOCKED", message);
    assert.equal(result.remediationAction, "RUN_PLATFORM_BASELINE_SETUP", message);
    assert.match(result.reason, /platform baseline is not implementation-ready/i, message);
  }

  const industrial = validateBaselineEnforcementConsumption({
    baselineLevel: "BL2",
    mode: "implementation",
    checkStatus: "FAIL",
    checks: [
      { status: "PASS", message: "platform baseline strict state is BASELINE_READY" },
      { status: "FAIL", message: "industrial baseline is not implementation-ready (EVIDENCE_INVALID)" },
    ],
  });
  assert.equal(industrial.ok, false);
  assert.equal(industrial.remediationAction, "RUN_INDUSTRIAL_BASELINE_SETUP");
});

test("LOW planning emits one non-authorizing Execution Entry Contract", () => {
  const fixture = createFixture(lowSource);
  const result = resolveFixture(fixture);
  assert.equal(result.status, 0, combined(result));
  const report = JSON.parse(result.stdout);
  assert.equal(report.outcome, "PLANNING_READY");
  assert.equal(report.structuredEvidence.execution_entry_contract.authorizes_implementation, "No");
  assert.equal(report.structuredEvidence.execution_entry_contract.authorizes_project_writes, "No");
  const check = run(checker, [fixture.root, "--report", "planning-closure-reports/current.md", "--require-ready"]);
  assert.equal(check.status, 0, combined(check));
  const contract = run(contractChecker, [fixture.root, "--report", "planning-closure-reports/current.md", "--require-contract"]);
  assert.equal(contract.status, 0, combined(contract));
  const publicContract = run(cli, ["execution-entry-contract-check", fixture.root, "--require-contract"]);
  assert.equal(publicContract.status, 0, combined(publicContract));
  assert.match(combined(publicContract), /selected current Planning Closure report planning-closure-reports\/current\.md/);
});

test("implicit Execution Entry Contract selection fails closed when current reports are ambiguous", () => {
  const fixture = createFixture(lowSource);
  assert.equal(resolveFixture(fixture).status, 0);
  fs.copyFileSync(
    path.join(fixture.root, "planning-closure-reports/current.md"),
    path.join(fixture.root, "planning-closure-reports/duplicate.md"),
  );
  const contract = run(cli, ["execution-entry-contract-check", fixture.root, "--require-contract"]);
  assert.notEqual(contract.status, 0);
  assert.match(combined(contract), /multiple current Planning Closure reports are valid/);
});

test("POSSIBLE_HIGH remains discovery-only and emits no contract", () => {
  const fixture = createGeneratedFixture(possibleHighIntent);
  const result = resolveFixture(fixture);
  assert.equal(result.status, 0, combined(result));
  const report = JSON.parse(result.stdout);
  assert.equal(report.outcome, "PLANNING_DISCOVERY_NEEDED");
  assert.equal(report.structuredEvidence.execution_entry_contract, null);
  const check = run(checker, [fixture.root, "--report", "planning-closure-reports/current.md", "--require-structured-evidence"]);
  assert.equal(check.status, 0, combined(check));
});

test("task mismatch fails closed and cannot emit a contract", () => {
  const fixture = createFixture(lowSource);
  const result = run(resolver, [fixture.root, "--task-ref", "task:different", "--intent-digest", fixture.intentDigest, "--entry-state", "READY_FOR_INTENTOS_OPERATION", "--task-governance-report", fixture.taskGovernanceReport, "--out", "planning-closure-reports/current.md", "--json"]);
  assert.equal(result.status, 0, combined(result));
  const report = JSON.parse(result.stdout);
  assert.equal(report.outcome, "PLANNING_INVALID");
  assert.equal(report.structuredEvidence.execution_entry_contract, null);
});

test("strict checker fails with no report while explicit distribution smoke may skip", () => {
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-planning-empty-"));
  assert.notEqual(run(checker, [empty, "--require-report"]).status, 0);
  assert.equal(run(checker, [empty, "--allow-empty"]).status, 0);
  assert.notEqual(run(checker, [empty, "--allow-empty", "--require-report"]).status, 0);
  assert.equal(run(contractChecker, [empty, "--allow-empty"]).status, 0);
  assert.notEqual(run(contractChecker, [empty, "--allow-empty", "--require-contract"]).status, 0);
});

test("source drift invalidates an existing ready report", () => {
  const fixture = createFixture(lowSource);
  assert.equal(resolveFixture(fixture).status, 0);
  fs.appendFileSync(path.join(fixture.root, fixture.taskGovernanceReport), "\n<!-- drift -->\n");
  const check = run(checker, [fixture.root, "--report", "planning-closure-reports/current.md", "--require-ready"]);
  assert.notEqual(check.status, 0);
  assert.match(combined(check), /authority_binding|digest does not match/i);
});

function createFixture(source) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-planning-"));
  fs.mkdirSync(path.join(rootDir, "task-governance-reports"), { recursive: true });
  const taskGovernanceReport = `task-governance-reports/${path.basename(source)}`;
  fs.copyFileSync(source, path.join(rootDir, taskGovernanceReport));
  return finalizeFixture(rootDir, taskGovernanceReport);
}

function createGeneratedFixture(intent) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-planning-"));
  const taskGovernanceReport = "task-governance-reports/001-task-governance.md";
  const generated = run(path.join(root, "scripts/resolve-task-governance.mjs"), [rootDir, "--intent", intent, "--out", taskGovernanceReport]);
  assert.equal(generated.status, 0, combined(generated));
  return finalizeFixture(rootDir, taskGovernanceReport);
}

function finalizeFixture(rootDir, taskGovernanceReport) {
  const evidence = machineEvidence(fs.readFileSync(path.join(rootDir, taskGovernanceReport), "utf8"));
  fs.mkdirSync(path.join(rootDir, "work-queue"), { recursive: true });
  fs.writeFileSync(path.join(rootDir, "work-queue/current.md"), workQueue(evidence.task_ref, evidence.intent_digest));
  runGit(rootDir, ["init"]);
  runGit(rootDir, ["config", "user.email", "intentos@example.invalid"]);
  runGit(rootDir, ["config", "user.name", "IntentOS Test"]);
  runGit(rootDir, ["add", "."]);
  runGit(rootDir, ["commit", "-m", "fixture"]);
  return { root: rootDir, taskRef: evidence.task_ref, intentDigest: evidence.intent_digest, taskGovernanceReport };
}

function resolveFixture(fixture) {
  return run(resolver, [fixture.root, "--task-ref", fixture.taskRef, "--intent-digest", fixture.intentDigest, "--entry-state", "READY_FOR_INTENTOS_OPERATION", "--task-governance-report", fixture.taskGovernanceReport, "--out", "planning-closure-reports/current.md", "--json"]);
}

function workQueue(taskRef, intentDigest) {
  return `# Work Queue\n\n## Work Items\n\n| Task ID | Title | State | Task Ref | Intent Digest | Notes |\n|---|---|---|---|---|---|\n| q-001 | Current task | CURRENT | ${taskRef} | ${intentDigest} | bounded fixture |\n`;
}

function machineEvidence(content) {
  const match = content.match(/## Machine-Readable Evidence[\s\S]*?```json\s*([\s\S]*?)```/i);
  return JSON.parse(match[1]);
}

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: "utf8", maxBuffer: 1024 * 1024 * 32 });
}

function runGit(cwd, args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, combined(result));
}

function combined(result) {
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}
