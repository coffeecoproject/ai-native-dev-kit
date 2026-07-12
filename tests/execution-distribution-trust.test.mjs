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

test("assisted release execution never assigns external effects to Codex", async () => {
  const moduleUrl = `${pathToFileURL(path.join(kitRoot, "scripts/lib/release-action-authority.mjs")).href}?test=${Date.now()}`;
  const { expectedReleaseStepExecutor, releaseStepAuthorityErrors } = await import(moduleUrl);
  const allowed = ["VERIFY", "BUILD", "HANDOFF_PREPARATION", "POST_RELEASE_READ_ONLY_SMOKE"];
  const blocked = ["PRODUCTION_DEPLOY", "STORE_SUBMISSION", "MINI_PROGRAM_RELEASE", "ROLLBACK_EXECUTION"];

  assert.equal(expectedReleaseStepExecutor("ASSISTED_EXECUTION", "VERIFY", allowed, blocked), "CODEX_MAY_RUN_AFTER_APPROVAL");
  assert.equal(expectedReleaseStepExecutor("ASSISTED_EXECUTION", "DEPLOY_OR_SUBMIT", allowed, blocked), "HUMAN_REQUIRED");
  assert.equal(expectedReleaseStepExecutor("ASSISTED_EXECUTION", "ROLLBACK_EXECUTION", allowed, blocked), "HUMAN_REQUIRED");
  assert.notEqual(releaseStepAuthorityErrors({
    mode: "ASSISTED_EXECUTION",
    stepAction: "DEPLOY_OR_SUBMIT",
    executor: "CODEX_MAY_RUN_AFTER_APPROVAL",
    allowedCodexActions: allowed,
    blockedActions: blocked,
  }).length, 0);
});

test("platform release recipe must support the selected release target", async () => {
  const moduleUrl = `${pathToFileURL(path.join(kitRoot, "scripts/lib/release-trust.mjs")).href}?test=${Date.now()}`;
  const { recipeSupportsReleaseTarget } = await import(moduleUrl);
  const webRecipe = fs.readFileSync(path.join(kitRoot, "release-recipes/web-hosted-preview.md"), "utf8");
  const miniRecipe = fs.readFileSync(path.join(kitRoot, "release-recipes/mini-program-review-handoff.md"), "utf8");
  assert.equal(recipeSupportsReleaseTarget(webRecipe, "preview"), true);
  assert.equal(recipeSupportsReleaseTarget(webRecipe, "app_store_review"), false);
  assert.equal(recipeSupportsReleaseTarget(miniRecipe, "mini_program_review"), true);
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

test("Git authority identity includes ignored project files and submodule state", async () => {
  const root = tempRoot("intentos-100-authority-extra-state-");
  const child = tempRoot("intentos-100-authority-submodule-");
  const { projectIdentity } = await import(`${pathToFileURL(path.join(kitRoot, "scripts/lib/evidence-authority.mjs")).href}?test=${Date.now()}`);
  for (const target of [root, child]) {
    for (const args of [["init"], ["config", "user.email", "test@example.invalid"], ["config", "user.name", "IntentOS Test"]]) {
      const result = spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0, combined(result));
    }
  }
  fs.writeFileSync(path.join(root, ".gitignore"), ".env.local\nnode_modules/\n");
  fs.writeFileSync(path.join(root, "tracked.txt"), "tracked\n");
  fs.writeFileSync(path.join(child, "child.txt"), "one\n");
  for (const [target, args] of [[root, ["add", "."]], [root, ["commit", "-m", "root"]], [child, ["add", "."]], [child, ["commit", "-m", "child"]]]) {
    const result = spawnSync("git", ["-C", target, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, combined(result));
  }
  const beforeIgnored = projectIdentity(root);
  fs.writeFileSync(path.join(root, ".env.local"), "TOKEN=first\n");
  const afterIgnored = projectIdentity(root);
  assert.notDeepEqual(afterIgnored, beforeIgnored);
  fs.mkdirSync(path.join(root, "node_modules", "pkg"), { recursive: true });
  fs.writeFileSync(path.join(root, "node_modules", "pkg", "index.js"), "ignored dependency\n");
  assert.deepEqual(projectIdentity(root), afterIgnored);
  for (const args of [["-c", "protocol.file.allow=always", "submodule", "add", child, "vendor/child"], ["commit", "-am", "submodule"]]) {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, combined(result));
  }
  const beforeSubmodule = projectIdentity(root);
  fs.writeFileSync(path.join(root, "vendor/child/child.txt"), "two\n");
  assert.notDeepEqual(projectIdentity(root), beforeSubmodule);
});

test("Git authority identity excludes governed evidence output while binding evidence by digest", async () => {
  const root = tempRoot("intentos-evidence-output-identity-");
  for (const args of [["init", "-q"], ["config", "user.email", "intentos-test@example.com"], ["config", "user.name", "IntentOS Test"]]) {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, combined(result));
  }
  fs.writeFileSync(path.join(root, "app.js"), "export const value = 1;\n");
  for (const args of [["add", "app.js"], ["commit", "-qm", "initial"]]) {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, combined(result));
  }

  const { createEvidenceAuthorityBinding } = await import(`${pathToFileURL(path.join(kitRoot, "scripts/lib/evidence-authority.mjs")).href}?test=${Date.now()}`);

  const before = createEvidenceAuthorityBinding(root, {
    taskRef: "tasks/001.md",
    intentDigest: "sha256:test",
  });
  fs.mkdirSync(path.join(root, "evidence"), { recursive: true });
  fs.writeFileSync(path.join(root, "evidence", "runtime-smoke.txt"), "PASS runtime smoke\n");
  const after = createEvidenceAuthorityBinding(root, {
    taskRef: "tasks/001.md",
    intentDigest: "sha256:test",
    sourceRefs: ["artifact:evidence/runtime-smoke.txt"],
  });

  assert.deepEqual(after.project, before.project);
  assert.equal(after.sources.length, 1);
  assert.match(after.sources[0].raw_file_digest, /^sha256:[a-f0-9]{64}$/);
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

test("platform starter cannot be paired with a different platform profile", () => {
  const root = tempRoot("intentos-100-starter-profile-");
  const result = run("scripts/init-project.mjs", [
    "--starter", "codex-web-app",
    "--target", root,
    "--profiles", "android-app",
    "--baseline-level", "BL1_STANDARD",
    "--write-plan", "apply-execution-plans/mismatch.json",
  ]);
  assert.notEqual(result.status, 0);
  assert.match(combined(result), /requires profile\(s\) web-app/);
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
    "scripts/check-consumer-chain.mjs",
    "scripts/lib/release-action-authority.mjs",
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
  const installedCi = fs.readFileSync(path.join(root, ".github/workflows/ai-workflow-checks.yml"), "utf8");
  assert.match(installedCi, /check-consumer-chain\.mjs/);
});

test("installed CI consumer chain blocks implementation without current evidence", () => {
  const root = tempRoot("intentos-100-installed-consumer-");
  const init = run("scripts/init-project.mjs", ["--target", root]);
  assert.equal(init.status, 0, combined(init));
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const value = 1;\n");
  fs.writeFileSync(path.join(root, "README.md"), "# Project\n");
  for (const args of [["init"], ["config", "user.email", "test@example.invalid"], ["config", "user.name", "IntentOS Test"], ["add", "."], ["commit", "-m", "initial"]]) {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, combined(result));
  }

  fs.writeFileSync(path.join(root, "src/index.mjs"), "export const value = 2;\n");
  const implementation = spawnSync(process.execPath, [path.join(root, "scripts/check-consumer-chain.mjs"), root, "--base", "HEAD"], { cwd: root, encoding: "utf8" });
  assert.notEqual(implementation.status, 0);
  assert.match(combined(implementation), /Work Queue requires exactly one changed current report/);

  const lowTaskReport = "task-governance-reports/001-low-copy.md";
  fs.mkdirSync(path.join(root, "task-governance-reports"), { recursive: true });
  fs.copyFileSync(
    path.join(kitRoot, "examples/1.83-task-governance/low-copy-change/task-governance-reports/001-task-governance.md"),
    path.join(root, lowTaskReport),
  );
  const stageLowTask = spawnSync("git", ["-C", root, "add", lowTaskReport], { encoding: "utf8" });
  assert.equal(stageLowTask.status, 0, combined(stageLowTask));
  const lowTaskConsumer = spawnSync(process.execPath, [path.join(root, "scripts/check-consumer-chain.mjs"), root, "--base", "HEAD"], { cwd: root, encoding: "utf8" });
  assert.match(combined(lowTaskConsumer), /LOW task does not require Plan Review/);
  assert.doesNotMatch(combined(lowTaskConsumer), /Plan Review requires exactly one changed current report/);

  const restore = spawnSync("git", ["-C", root, "restore", "src/index.mjs"], { encoding: "utf8" });
  assert.equal(restore.status, 0, combined(restore));
  fs.writeFileSync(path.join(root, "README.md"), "# Project\n\nDocumentation only.\n");
  const docsOnly = spawnSync(process.execPath, [path.join(root, "scripts/check-consumer-chain.mjs"), root, "--base", "HEAD"], { cwd: root, encoding: "utf8" });
  assert.equal(docsOnly.status, 0, combined(docsOnly));
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

test("existing-project discovery finds nested agent and CI governance", () => {
  const root = tempRoot("intentos-100-nested-governance-");
  fs.mkdirSync(path.join(root, "services/api/.github/workflows"), { recursive: true });
  fs.writeFileSync(path.join(root, "services/api/AGENTS.md"), "# Nested agent rules\n");
  fs.writeFileSync(path.join(root, "services/api/.github/workflows/quality.yml"), "name: quality\n");
  fs.writeFileSync(path.join(root, "package.json"), "{}\n");
  const result = run("scripts/resolve-native-migration.mjs", [root, "--json"]);
  assert.equal(result.status, 0, combined(result));
  const report = JSON.parse(result.stdout);
  const agent = report.existingGovernanceInventory.find((item) => item.area === "Agent rules");
  const ci = report.existingGovernanceInventory.find((item) => item.area === "CI / gates");
  assert.match(agent.source, /services\/api\/AGENTS\.md/);
  assert.match(ci.source, /services\/api\/\.github\/workflows\/quality\.yml/);
});
