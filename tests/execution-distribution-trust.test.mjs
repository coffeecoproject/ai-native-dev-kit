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

test("execution closure rejects arbitrary PASS prose without a passing Review Loop status", () => {
  const root = tempRoot("intentos-1993-closure-review-");
  fs.mkdirSync(path.join(root, "review-surface-cards"));
  fs.mkdirSync(path.join(root, "review-loop-reports"));
  fs.mkdirSync(path.join(root, "change-boundary-reports"));
  fs.mkdirSync(path.join(root, "debt-handoff-reports"));
  fs.writeFileSync(path.join(root, "review-surface-cards/001.md"), [
    "# Review Surface Card",
    "",
    "## Selected Review Surfaces",
    "",
    "| Surface | Reason |",
    "|---|---|",
    "| `FUNCTIONAL_REVIEW` | behavior changed |",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(root, "review-loop-reports/001.md"), [
    "# Review Loop Report",
    "",
    "The author wrote PASS in ordinary prose, but this is not closure evidence.",
    "",
    "## Status",
    "",
    "| Field | Value |",
    "|---|---|",
    "| Final status | OPEN |",
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(root, "change-boundary-reports/001.md"), "# Change Boundary\n\nDisposition: `PASS`\n");
  fs.writeFileSync(path.join(root, "debt-handoff-reports/001.md"), "# Debt Handoff\n\n| Debt result | deferred |\n");

  const result = run("scripts/resolve-execution-closure.mjs", [
    root,
    "--intent", "change booking behavior",
    "--verification", "tests passed",
    "--review-surface-ref", "review-surface-cards/001.md",
    "--review-loop-ref", "review-loop-reports/001.md",
    "--change-boundary-ref", "change-boundary-reports/001.md",
    "--debt-handoff-ref", "debt-handoff-reports/001.md",
    "--json",
  ]);
  assert.equal(result.status, 0, combined(result));
  const report = JSON.parse(result.stdout);
  assert.notEqual(report.commitReadiness.closureState, "READY_FOR_COMMIT_REVIEW");
  assert.equal(report.reviewSurfaceClosure.find((item) => item.surface === "FUNCTIONAL_REVIEW")?.result, "not verified");
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
  const afterSourceChange = projectIdentity(root);
  fs.mkdirSync(path.join(root, "specs"));
  fs.writeFileSync(path.join(root, "specs/product.json"), "{\"rule\":1}\n");
  assert.notDeepEqual(projectIdentity(root), afterSourceChange);
});

test("Git authority identity changes with staged, unstaged, and untracked business content", async () => {
  const root = tempRoot("intentos-198-git-authority-");
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const value = 1;\n");
  for (const args of [["init"], ["config", "user.email", "test@example.invalid"], ["config", "user.name", "IntentOS Test"], ["add", "."], ["commit", "-m", "initial"]]) {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, combined(result));
  }
  const { projectIdentity } = await import(`${pathToFileURL(path.join(kitRoot, "scripts/lib/evidence-authority.mjs")).href}?test=${Date.now()}`);
  const clean = projectIdentity(root);
  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const value = 2;\n");
  const unstaged = projectIdentity(root);
  assert.notDeepEqual(unstaged, clean);
  spawnSync("git", ["-C", root, "add", "src/index.mjs"]);
  const staged = projectIdentity(root);
  assert.notDeepEqual(staged, clean);
  fs.writeFileSync(path.join(root, "src/new.mjs"), "export const added = true;\n");
  assert.notDeepEqual(projectIdentity(root), staged);
  const beforeSpec = projectIdentity(root);
  fs.mkdirSync(path.join(root, "specs"));
  fs.writeFileSync(path.join(root, "specs/product.json"), "{\"rule\":1}\n");
  assert.notDeepEqual(projectIdentity(root), beforeSpec);
});

test("deferred agent authority cannot count as verified workflow activation", async () => {
  const moduleUrl = `${pathToFileURL(path.join(kitRoot, "scripts/lib/adoption-apply-chain.mjs")).href}?test=${Date.now()}`;
  const { isWorkflowActivationState } = await import(moduleUrl);
  const plan = { actions: [{ path: "AGENTS.md", type: "HUMAN_ONLY", willWrite: false }] };
  assert.equal(isWorkflowActivationState({
    nextAction: "RUN_WORKFLOW_ASSET_UPDATE",
    missingWorkflowAssets: [],
    missingAgentSections: ["Mission"],
  }, plan), false);
  assert.equal(isWorkflowActivationState({
    nextAction: "RUN_WORKFLOW_ASSET_UPDATE",
    missingWorkflowAssets: ["scripts/workflow-next.mjs"],
    missingAgentSections: ["Mission"],
  }, plan), false);
  const legacyPlan = { actions: [{ path: "agent.md", type: "HUMAN_ONLY", willWrite: false }] };
  assert.equal(isWorkflowActivationState({
    nextAction: "RUN_WORKFLOW_ASSET_UPDATE",
    missingWorkflowAssets: [],
    missingAgentSections: ["Mission"],
  }, legacyPlan), false);
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

test("baseline planning rejects incomplete environment and profile coverage", () => {
  const missingEnvironmentRoot = tempRoot("intentos-198-pack-noenv-");
  const missingEnvironment = run("scripts/init-project.mjs", [
    "--starter", "codex-web-app", "--target", missingEnvironmentRoot,
    "--profiles", "web-app", "--baseline-level", "BL1_STANDARD",
    "--standard-packs", "web-runtime-standard",
    "--write-plan", "apply-execution-plans/noenv.json",
  ]);
  assert.notEqual(missingEnvironment.status, 0);
  assert.match(combined(missingEnvironment), /requires an environment standard pack/i);

  const missingIndustrialRoot = tempRoot("intentos-198-pack-industrial-gap-");
  const missingIndustrial = run("scripts/init-project.mjs", [
    "--starter", "generic-project", "--target", missingIndustrialRoot,
    "--profiles", "web-app,backend-api", "--baseline-level", "BL2_INDUSTRIAL",
    "--industrial-packs", "web-app-industrial",
    "--write-plan", "apply-execution-plans/gap.json",
  ]);
  assert.notEqual(missingIndustrial.status, 0);
  assert.match(combined(missingIndustrial), /industrial baseline has no platform\/capability pack.*backend-api/i);
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
  const baselineDecision = spawnSync(process.execPath, [
    path.join(root, "scripts/cli.mjs"), "baseline-decision", root, "--json",
  ], { cwd: root, encoding: "utf8", maxBuffer: 1024 * 1024 * 40 });
  assert.equal(baselineDecision.status, 0, combined(baselineDecision));
  assert.notEqual(JSON.parse(baselineDecision.stdout).projectState.internal, "PRODUCTION_SENSITIVE_PROJECT");
  const version = spawnSync(process.execPath, [path.join(root, "scripts/cli.mjs"), "--version"], { cwd: root, encoding: "utf8" });
  assert.equal(version.status, 0, combined(version));
  assert.notEqual(version.stdout.trim(), "0.0.0");
  const sourceOnly = spawnSync(process.execPath, [path.join(root, "scripts/cli.mjs"), "self-check"], { cwd: root, encoding: "utf8" });
  assert.notEqual(sourceOnly.status, 0);
  assert.match(combined(sourceOnly), /source repository/i);
  const advanced = spawnSync(process.execPath, [path.join(root, "scripts/cli.mjs"), "--help-advanced"], { cwd: root, encoding: "utf8" });
  assert.equal(advanced.status, 0, combined(advanced));
  assert.doesNotMatch(advanced.stdout, /^\s+(?:init|update|migrate|fixtures|self-check)\s+/m);
  assert.match(advanced.stdout, /must run from the IntentOS source checkout/i);
});

test("strict baseline selection fails closed when no report exists", () => {
  const root = tempRoot("intentos-198-baseline-empty-");
  assert.notEqual(run("scripts/check-baseline-pack-selection.mjs", [root, "--strict"]).status, 0);
  assert.notEqual(run("scripts/check-standard-baseline-selection.mjs", [root, "--strict"]).status, 0);
});

test("strict target baseline checks do not borrow source registries", () => {
  const root = tempRoot("intentos-1993-baseline-isolation-");
  const fixture = path.join(kitRoot, "examples/1.14-standard-baseline-registry");
  fs.cpSync(path.join(fixture, "docs"), path.join(root, "docs"), { recursive: true });
  fs.cpSync(path.join(fixture, "standard-baseline-selections"), path.join(root, "standard-baseline-selections"), { recursive: true });
  const result = run("scripts/check-standard-baseline-selection.mjs", [root, "--strict"]);
  assert.notEqual(result.status, 0, combined(result));
  assert.match(combined(result), /unknown standard pack|installed registry|pack.*not found/i);
});

test("starter verification fails when no project verification path exists", () => {
  for (const starter of ["generic-project", "codex-web-app", "codex-ios-app", "codex-android-app"]) {
    const root = tempRoot(`intentos-1993-${starter}-verify-`);
    const result = spawnSync("bash", [path.join(kitRoot, "starters", starter, "scripts", "verify.sh")], {
      cwd: root,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0, `${starter} unexpectedly accepted an empty project`);
  }
});

test("existing agent.md remains the project authority during planning", () => {
  const root = tempRoot("intentos-198-agent-entry-");
  fs.writeFileSync(path.join(root, "agent.md"), "# Existing project authority\n");
  const result = run("scripts/init-project.mjs", ["--target", root, "--write-plan", "apply-execution-plans/agent.json"]);
  assert.equal(result.status, 0, combined(result));
  const plan = JSON.parse(fs.readFileSync(path.join(root, "apply-execution-plans/agent.json"), "utf8"));
  assert.equal(plan.actions.some((action) => action.path === "AGENTS.md" && action.willWrite), false);
  assert.equal(plan.actions.some((action) => action.path === "agent.md" && action.type === "HUMAN_ONLY"), true);
});

test("existing .agent.md remains the project authority during planning", () => {
  const root = tempRoot("intentos-198-dot-agent-entry-");
  fs.writeFileSync(path.join(root, ".agent.md"), "# Existing project authority\n");
  const result = run("scripts/init-project.mjs", ["--target", root, "--write-plan", "apply-execution-plans/agent.json"]);
  assert.equal(result.status, 0, combined(result));
  const plan = JSON.parse(fs.readFileSync(path.join(root, "apply-execution-plans/agent.json"), "utf8"));
  assert.equal(plan.actions.some((action) => action.path === "AGENTS.md" && action.willWrite), false);
  assert.equal(plan.actions.some((action) => action.path === ".agent.md" && action.type === "HUMAN_ONLY"), true);
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

  const outside = run("scripts/migrate-project.mjs", [
    "--target", root, "--from", "1.80.2", "--to", version, "--write-plan", path.join(root, "outside.json"),
  ]);
  assert.notEqual(outside.status, 0);
  const mismatch = run("scripts/migrate-project.mjs", [
    "--target", root, "--from", "1.80.1", "--to", version, "--dry-run",
  ]);
  assert.notEqual(mismatch.status, 0);
  assert.match(combined(mismatch), /does not match the installed IntentOS version/i);

  const external = tempRoot("intentos-198-migrate-external-");
  fs.symlinkSync(external, path.join(root, "apply-execution-plans"));
  const symlinkEscape = run("scripts/migrate-project.mjs", [
    "--target", root, "--from", "1.80.2", "--to", version,
    "--write-plan", "apply-execution-plans/escaped.json",
  ]);
  assert.notEqual(symlinkEscape.status, 0);
  assert.match(combined(symlinkEscape), /must not pass through or overwrite a symlink/i);
  assert.equal(fs.existsSync(path.join(external, "escaped.json")), false);
});
