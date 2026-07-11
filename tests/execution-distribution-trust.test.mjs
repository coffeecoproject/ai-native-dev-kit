import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import test from "node:test";

const kitRoot = path.resolve(import.meta.dirname, "..");

function tempRoot(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function run(script, args = [], options = {}) {
  return spawnSync(process.execPath, [path.join(kitRoot, script), ...args], {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 40,
  });
}

function combined(result) {
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

test("strict evidence checks cannot be weakened by --allow-empty", () => {
  const root = tempRoot("intentos-198-empty-");
  for (const script of [
    "scripts/check-verification-plan.mjs",
    "scripts/check-test-evidence.mjs",
    "scripts/check-execution-assurance.mjs",
    "scripts/check-completion-evidence.mjs",
    "scripts/check-release-evidence-gate.mjs",
    "scripts/check-apply-execution-receipt.mjs",
  ]) {
    const result = run(script, [root, "--require-structured-evidence", "--allow-empty"]);
    assert.notEqual(result.status, 0, `${script} unexpectedly accepted missing strict evidence`);
  }
});

test("installed artifact schema replacement fails trusted loading", async () => {
  const root = tempRoot("intentos-198-schema-");
  for (const relative of [
    "scripts/lib/artifact-schema.mjs",
    "scripts/lib/evidence-authority.mjs",
    "scripts/lib/path-safety.mjs",
  ]) {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(kitRoot, relative), target);
  }
  const schemaRel = "schemas/artifacts/completion-evidence.schema.json";
  const schemaTarget = path.join(root, schemaRel);
  fs.mkdirSync(path.dirname(schemaTarget), { recursive: true });
  fs.writeFileSync(schemaTarget, `${fs.readFileSync(path.join(kitRoot, schemaRel), "utf8")}\n`);
  const moduleUrl = `${pathToFileURL(path.join(root, "scripts/lib/artifact-schema.mjs")).href}?test=${Date.now()}`;
  const { loadSchema } = await import(moduleUrl);
  assert.equal(loadSchema(root, schemaRel), null);
});

test("non-Git authority identity ignores generated evidence and target schema shadows", async () => {
  const root = tempRoot("intentos-198-authority-revision-");
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const value = 1;\n");
  const { projectIdentity } = await import(`${pathToFileURL(path.join(kitRoot, "scripts/lib/evidence-authority.mjs")).href}?test=${Date.now()}`);
  const before = projectIdentity(root);
  fs.mkdirSync(path.join(root, "verification-plans"));
  fs.writeFileSync(path.join(root, "verification-plans/001.md"), "# Generated evidence\n");
  fs.mkdirSync(path.join(root, "schemas/artifacts"), { recursive: true });
  fs.writeFileSync(path.join(root, "schemas/artifacts/verification-plan.schema.json"), "{}\n");
  assert.deepEqual(projectIdentity(root), before);
  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const value = 2;\n");
  assert.notDeepEqual(projectIdentity(root), before);
});

test("existing AGENTS authority can remain deferred only after core activation", async () => {
  const moduleUrl = `${pathToFileURL(path.join(kitRoot, "scripts/lib/adoption-apply-chain.mjs")).href}?test=${Date.now()}`;
  const { isWorkflowActivationState } = await import(moduleUrl);
  const plan = { actions: [{ path: "AGENTS.md", type: "HUMAN_ONLY", willWrite: false }] };
  assert.equal(isWorkflowActivationState({
    nextAction: "RUN_WORKFLOW_ASSET_UPDATE",
    missingWorkflowAssets: [],
    missingAgentSections: ["Mission"],
  }, plan), true);
  assert.equal(isWorkflowActivationState({
    nextAction: "RUN_WORKFLOW_ASSET_UPDATE",
    missingWorkflowAssets: ["scripts/workflow-next.mjs"],
    missingAgentSections: ["Mission"],
  }, plan), false);
});

test("controlled plan output rejects absolute and protected paths", () => {
  const root = tempRoot("intentos-198-plan-");
  const absolute = run("scripts/init-project.mjs", [
    "--starter", "codex-web-app", "--target", root,
    "--profiles", "web-app", "--baseline-level", "BL1_STANDARD",
    "--write-plan", path.join(root, "apply-execution-plans/absolute.json"),
  ]);
  assert.notEqual(absolute.status, 0);
  assert.match(combined(absolute), /project-local relative path/i);

  const protectedPath = run("scripts/init-project.mjs", [
    "--starter", "codex-web-app", "--target", root,
    "--profiles", "web-app", "--baseline-level", "BL1_STANDARD",
    "--write-plan", "AGENTS.md",
  ]);
  assert.notEqual(protectedPath.status, 0);
  assert.match(combined(protectedPath), /apply-execution-plans|\.intentos\/apply-plans/i);
});

test("baseline pack must apply to the selected platform profile", () => {
  const root = tempRoot("intentos-198-pack-");
  const result = run("scripts/init-project.mjs", [
    "--starter", "codex-web-app", "--target", root,
    "--profiles", "web-app", "--baseline-level", "BL1_STANDARD",
    "--standard-packs", "android-app-standard",
    "--write-plan", "apply-execution-plans/incompatible.json",
  ]);
  assert.notEqual(result.status, 0);
  assert.match(combined(result), /incompatible with selected profiles/i);
  assert.equal(fs.existsSync(path.join(root, "apply-execution-plans/incompatible.json")), false);
});

test("backend-only Node package is not classified as a Web frontend", () => {
  const root = tempRoot("intentos-198-backend-");
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
    name: "worker-service",
    type: "module",
    bin: { worker: "src/worker.mjs" },
    dependencies: { fastify: "1.0.0" },
  }));
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "src/worker.mjs"), "export const run = () => true;\n");
  const result = run("scripts/baseline-project.mjs", [root, "--json"]);
  assert.equal(result.status, 0, combined(result));
  const report = JSON.parse(result.stdout);
  assert.equal((report.detectedProfileCandidates || []).some((item) => item.id === "web-app"), false);
});

test("unknown release package identity blocks release review", () => {
  const root = tempRoot("intentos-198-release-package-");
  const report = "release-channel-policies/unknown.md";
  const result = run("scripts/resolve-release-channel-policy.mjs", [
    root, "--intent", "prepare provider release", "--project-type", "existing_project",
    "--channel", "provider_direct_deploy", "--package-identity-type", "unknown",
    "--release-owner-ref", "human:owner", "--cost-owner-ref", "human:cost-owner",
    "--out", report,
  ]);
  assert.equal(result.status, 0, combined(result));
  assert.match(result.stdout, /BLOCKED_RELEASE_CHANNEL_POLICY/);
  const check = run("scripts/check-release-channel-policy.mjs", [
    root, "--report", report, "--require-report", "--require-structured-evidence",
  ]);
  assert.notEqual(check.status, 0);
  assert.match(combined(check), /must not be unknown/i);
});

test("generated project installs and runs release-channel command", () => {
  const root = tempRoot("intentos-198-generated-");
  const init = run("scripts/init-project.mjs", ["--target", root]);
  assert.equal(init.status, 0, combined(init));
  for (const relative of [
    "scripts/resolve-release-channel-policy.mjs",
    "scripts/check-release-channel-policy.mjs",
    "scripts/lib/release-evidence-requirements.mjs",
    ".intentos/docs/release-channel-decoupling.md",
  ]) {
    assert.equal(fs.existsSync(path.join(root, relative)), true, `missing generated asset ${relative}`);
  }
  const cli = spawnSync(process.execPath, [
    path.join(root, "scripts/cli.mjs"), "release-channel", root,
    "--intent", "review source-only channel", "--project-type", "new_project",
    "--channel", "source_only", "--package-identity-type", "none",
    "--package-identity-ref", "not_applicable", "--package-digest-or-id", "not_applicable", "--json",
  ], { cwd: root, encoding: "utf8", maxBuffer: 1024 * 1024 * 40 });
  assert.equal(cli.status, 0, combined(cli));
  assert.equal(JSON.parse(cli.stdout).outcome, "RELEASE_CHANNEL_POLICY_RECORDED");
  const operating = spawnSync(process.execPath, [
    path.join(root, "scripts/resolve-operating-loop.mjs"), root,
    "--intent", "I want to build a booking app", "--json",
  ], { cwd: root, encoding: "utf8", maxBuffer: 1024 * 1024 * 40 });
  assert.equal(operating.status, 0, combined(operating));
  const state = JSON.parse(operating.stdout);
  assert.equal(state.projectEntry.state, "NEW_PROJECT_ENTRY");
  assert.equal(state.operatingLoop.operation, "START_PROJECT");
});

test("release approval alone cannot replace Launch Review", () => {
  const source = fs.readFileSync(path.join(kitRoot, "scripts/resolve-release-execution.mjs"), "utf8");
  assert.doesNotMatch(source, /if \(approval\.verified\) \{[\s\S]{0,300}READY_FOR_RELEASE_REVIEW/);
  assert.match(source, /launch-review-views\//);
  assert.match(source, /source: "missing"/);
});

test("current 1.x migration routes to controlled update planning", () => {
  const root = tempRoot("intentos-198-migrate-");
  fs.mkdirSync(path.join(root, ".intentos"));
  fs.writeFileSync(path.join(root, ".intentos/version.json"), JSON.stringify({ intentOSVersion: "1.80.2" }));
  const version = fs.readFileSync(path.join(kitRoot, "VERSION.md"), "utf8")
    .match(/Current version:\s*`([^`]+)`/i)?.[1];
  const result = run("scripts/migrate-project.mjs", [
    "--target", root, "--from", "1.80.2", "--to", version, "--dry-run", "--json",
  ]);
  assert.equal(result.status, 0, combined(result));
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.migrationKind, "CONTROLLED_1X_UPDATE");
  assert.equal(plan.blockedApply, true);
  assert.match(plan.nextCommand, /apply-execution-plans\//);
});
