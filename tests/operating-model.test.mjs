import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(testDir, "..");

function runNode(args) {
  return spawnSync(process.execPath, args, {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 60_000,
    maxBuffer: 1024 * 1024 * 32,
  });
}

function runWork(root, intent, extraArgs = []) {
  const intentArgs = intent ? ["--intent", intent] : [];
  const result = runNode(["scripts/resolve-operating-loop.mjs", root, ...intentArgs, ...extraArgs, "--json"]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.equal(report.schemaVersion, "1.98.0");
  assert.equal(report.operatingDecision.contractVersion, "1.98.0");
  assert.equal(report.operatingDecision.derivedOnly, "Yes");
  assert.equal(report.operatingDecision.materialActionAuthorized, "No");
  assert.equal(report.projectIdentityProjection.contractVersion, "1.98.0");
  assert.equal(report.projectIdentityProjection.derivedOnly, "Yes");
  assert.equal(report.projectIdentityProjection.grantsAuthority, "No");
  assert.equal(report.projectIdentityProjection.writesProjectFiles, "No");
  assert.match(report.projectIdentityProjection.projectionDigest, /^sha256:[a-f0-9]{64}$/);
  assert.match(report.projectIdentityProjection.evidenceIdentity.fingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.ok(report.projectIdentityProjection.sourceInputs.every((source) => /^sha256:[a-f0-9]{64}$/.test(source.semanticDigest)));
  assert.ok(report.humanSummary.projectIdentity);
  assert.equal(report.humanSummary.nextSafeAction, report.operatingDecision.plainAction);
  assert.match(report.operatingDecision.decisionDigest, /^sha256:[a-f0-9]{64}$/);
  const sourceNames = new Set(report.sourceSystemTrace.map((source) => source.sourceSystem));
  assert.ok(report.operatingDecision.sourceInputs.every((source) => sourceNames.has(source.sourceSystem)));
  assert.ok(report.operatingDecision.sourceInputs.every((source) => /^sha256:[a-f0-9]{64}$/.test(source.semanticDigest)));
  return report;
}

function withRoot(prefix, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  try {
    return callback(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function makeExistingProject(root) {
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "existing-project", private: true }, null, 2));
  fs.writeFileSync(path.join(root, "src/index.js"), "export const ready = true;\n");
}

function runGit(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function snapshot(root) {
  const rows = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).split(path.sep).join("/");
      if (entry.isDirectory()) visit(full);
      else rows.push(`${rel}:${fs.readFileSync(full).toString("base64")}`);
    }
  };
  visit(root);
  return rows.sort();
}

test("new project goal enters the shared operating loop through START_PROJECT", () => withRoot("intentos-operating-new-", (root) => {
  const report = runWork(root, "我想从零做一个预约 App");
  assert.equal(report.projectEntry.state, "NEW_PROJECT_ENTRY");
  assert.equal(report.projectIdentityProjection.projectKind, "NEW_PROJECT");
  assert.equal(report.projectIdentityProjection.governancePosture, "NOT_ESTABLISHED");
  assert.equal(report.operatingLoop.operation, "START_PROJECT");
  assert.equal(report.operatingLoop.lifecyclePhase, "PROJECT_ENTRY");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_PROJECT_PLAN");
  assert.equal(report.boundaries.writesTargetFiles, "No");
}));

test("existing project normal task uses CONTINUE_TASK without forcing high governance", () => withRoot("intentos-operating-existing-", (root) => {
  makeExistingProject(root);
  const report = runWork(root, "修改首页按钮文案");
  assert.match(report.projectEntry.state, /EXISTING_PROJECT_ENTRY|GOVERNED_PROJECT_ENTRY/);
  assert.equal(report.projectIdentityProjection.projectKind, "EXISTING_PROJECT");
  assert.equal(report.projectIdentityProjection.governancePosture, "LIGHT_GOVERNANCE");
  assert.equal(report.projectIdentityProjection.evidenceIdentity.kind, "NON_GIT");
  assert.equal(report.operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(report.operatingLoop.taskImpact, "LOW");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW");
  assert.equal(report.operatingLoop.projectBaselineControlsTaskImpact, "No");
  assert.ok(report.evidenceTrace.dependencies.every((item) => item.to === "OPERATING_STATE" && item.relation === "INPUT_TO_DERIVED_VIEW"));
  assert.equal(report.authorityRecommendation.namedOwnerResolution, "NOT_EVALUATED_BY_OPERATING_VIEW");
}));

test("existing project adoption is a project-entry review and remains read-only", () => withRoot("intentos-operating-adopt-", (root) => {
  makeExistingProject(root);
  const before = snapshot(root);
  const report = runWork(root, "把这个老项目接入 IntentOS");
  assert.equal(report.operatingLoop.operation, "ADOPT_PROJECT");
  assert.equal(report.operatingLoop.lifecyclePhase, "PROJECT_ENTRY");
  assert.equal(report.operatingDecision.actionCode, "RUN_ADOPTION_REVIEW");
  assert.equal(report.authorityRecommendation.grantsAuthority, "No");
  assert.deepEqual(snapshot(root), before);
}));

test("release intent recommends release authority without approving release", () => withRoot("intentos-operating-release-", (root) => {
  makeExistingProject(root);
  const report = runWork(root, "准备发布内部测试版本");
  assert.equal(report.operatingLoop.operation, "PREPARE_RELEASE");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_RELEASE_REVIEW");
  assert.ok(report.authorityRecommendation.recommendedRoles.includes("RELEASE_OWNER"));
  assert.equal(report.authorityRecommendation.materialActionAllowedByThisView, "No");
  assert.equal(report.boundaries.approvesReleaseOrProduction, "No");
}));

test("permission task recommends domain and security owners", () => withRoot("intentos-operating-permission-", (root) => {
  makeExistingProject(root);
  const report = runWork(root, "新增管理员权限并限制敏感数据访问");
  assert.equal(report.operatingLoop.operation, "CONTINUE_TASK");
  assert.match(report.operatingLoop.taskImpact, /HIGH|POSSIBLE_HIGH/);
  assert.equal(report.operatingDecision.actionCode, "PREPARE_BUSINESS_RULE_CLOSURE");
  assert.ok(report.authorityRecommendation.recommendedRoles.includes("DOMAIN_OWNER"));
  assert.ok(report.authorityRecommendation.recommendedRoles.includes("SECURITY_OWNER"));
  assert.equal(report.authorityRecommendation.grantsAuthority, "No");
}));

test("BL2 project still permits a genuinely low task classification", () => withRoot("intentos-operating-bl2-low-", (root) => {
  makeExistingProject(root);
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, "docs/baseline-selection.md"), [
    "# Baseline Selection", "", "## Baseline Level", "", "BL2_INDUSTRIAL", "",
  ].join("\n"));
  const report = runWork(root, "修正文档中的一个错别字");
  assert.equal(report.operatingLoop.taskImpact, "LOW");
  assert.equal(report.operatingLoop.projectBaselineControlsTaskImpact, "No");
  assert.equal(report.operatingLoop.stricterApplicableProjectRuleRequirement, "PRESERVE_WHEN_APPLICABLE");
  assert.equal(report.operatingLoop.stricterApplicableProjectRuleVerifiedByThisView, "No");
}));

test("initialized new project continues later tasks instead of restarting project entry", () => withRoot("intentos-operating-initialized-", (root) => {
  makeExistingProject(root);
  fs.mkdirSync(path.join(root, ".intentos"), { recursive: true });
  fs.writeFileSync(path.join(root, ".intentos/version.json"), JSON.stringify({
    intentOSVersion: "1.95.0",
    starter: "generic-project",
    projectEntryOrigin: "NEW_PROJECT",
  }, null, 2));
  const report = runWork(root, "继续完成预约规则");
  assert.equal(report.projectEntry.state, "NEW_PROJECT_ENTRY");
  assert.equal(report.operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(report.operatingDecision.actionCode, "INSPECT_TASK_RISK");
}));

test("business nouns do not hijack task routing", () => withRoot("intentos-operating-route-conflicts-", (root) => {
  makeExistingProject(root);
  for (const intent of [
    "接入微信支付",
    "新增订单状态字段",
    "修改发布页面按钮文案",
    "在现有系统中创建一个项目管理页面",
  ]) {
    assert.equal(runWork(root, intent).operatingLoop.operation, "CONTINUE_TASK", intent);
  }
}));

test("dirty worktree stops before task continuation", () => withRoot("intentos-operating-dirty-", (root) => {
  makeExistingProject(root);
  runGit(root, ["init"]);
  runGit(root, ["config", "user.email", "intentos-test@example.invalid"]);
  runGit(root, ["config", "user.name", "IntentOS Test"]);
  runGit(root, ["add", "."]);
  runGit(root, ["commit", "-m", "initial"]);
  fs.writeFileSync(path.join(root, "src/index.js"), "export const ready = false;\n");
  const report = runWork(root, "继续完成预约规则");
  assert.equal(report.operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(report.operatingLoop.state, "NEEDS_CURRENT_WORK_REVIEW");
  assert.equal(report.operatingDecision.actionCode, "REVIEW_CURRENT_WORK");
  assert.equal(report.projectIdentityProjection.worktreePosture, "DIRTY");
  assert.doesNotMatch(JSON.stringify(report.projectIdentityProjection), /src\/index\.js/);
}));

test("controlled plan records existing-project entry origin", () => withRoot("intentos-operating-plan-origin-", (root) => {
  makeExistingProject(root);
  const planPath = path.join(root, "apply-execution-plans", "init.json");
  fs.mkdirSync(path.dirname(planPath), { recursive: true });
  const result = runNode(["scripts/init-project.mjs", "--target", root, "--write-plan", path.relative(root, planPath)]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const versionAction = plan.actions.find((item) => item.path === ".intentos/version.json");
  assert.ok(versionAction?.inlineContentBase64);
  const version = JSON.parse(Buffer.from(versionAction.inlineContentBase64, "base64").toString("utf8"));
  assert.equal(version.projectEntryOrigin, "EXISTING_PROJECT");
  fs.mkdirSync(path.join(root, ".intentos"), { recursive: true });
  fs.writeFileSync(path.join(root, ".intentos/version.json"), `${JSON.stringify(version, null, 2)}\n`);
  assert.notEqual(runWork(root, "继续完成预约规则").projectEntry.state, "NEW_PROJECT_ENTRY");
}));

test("English intent receives an English human summary", () => withRoot("intentos-operating-english-", (root) => {
  makeExistingProject(root);
  assert.equal(runWork(root, "检查当前项目状态").operatingLoop.operation, "CHECK_STATUS");
  assert.equal(runWork(root, "检查当前项目状态").operatingDecision.actionCode, "SUMMARIZE_CURRENT_STATUS");
  const result = runNode(["scripts/resolve-operating-loop.mjs", root, "--intent", "check current task progress"]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /IntentOS Current Operating State/);
  assert.match(result.stdout, /Current status:/);
  assert.match(result.stdout, /Project reading:/);
  assert.doesNotMatch(result.stdout, /当前工作状态|需要你决定/);
}));

test("production signals override original new-project entry without changing task impact", () => withRoot("intentos-operating-production-origin-", (root) => {
  makeExistingProject(root);
  fs.mkdirSync(path.join(root, ".intentos"), { recursive: true });
  fs.mkdirSync(path.join(root, ".github", "workflows"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs", "runbooks"), { recursive: true });
  fs.writeFileSync(path.join(root, ".intentos/version.json"), JSON.stringify({
    intentOSVersion: "1.95.0",
    starter: "generic-project",
    projectEntryOrigin: "NEW_PROJECT",
  }, null, 2));
  fs.writeFileSync(path.join(root, ".github/workflows/release.yml"), "name: production release\n");
  fs.writeFileSync(path.join(root, "docs/runbooks/release.md"), "# Production release runbook\n");
  fs.writeFileSync(path.join(root, "Dockerfile"), "FROM scratch\n");
  const report = runWork(root, "修正文档中的一个错别字");
  assert.equal(report.projectEntry.state, "PRODUCTION_SENSITIVE_ENTRY");
  assert.equal(report.projectIdentityProjection.projectKind, "EXISTING_PROJECT");
  assert.equal(report.projectIdentityProjection.governancePosture, "PRODUCTION_GOVERNED");
  assert.equal(report.projectIdentityProjection.productionPosture, "PRODUCTION_SENSITIVE");
  assert.equal(report.operatingLoop.taskImpact, "LOW");
  assert.equal(report.operatingLoop.state, "READY_FOR_PROJECT_GOVERNED_WORK_REVIEW");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_IMPLEMENTATION_REVIEW");
}));

test("controlled plan records new-project entry origin", () => withRoot("intentos-operating-new-plan-origin-", (root) => {
  const target = path.join(root, "new-project");
  const planPath = path.join(target, "apply-execution-plans", "new-project-plan.json");
  const result = runNode(["scripts/init-project.mjs", "--target", target, "--write-plan", path.relative(target, planPath)]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const versionAction = plan.actions.find((item) => item.path === ".intentos/version.json");
  const version = JSON.parse(Buffer.from(versionAction.inlineContentBase64, "base64").toString("utf8"));
  assert.equal(version.projectEntryOrigin, "NEW_PROJECT");
}));

test("finish without valid completion evidence cannot report done", () => withRoot("intentos-operating-finish-", (root) => {
  makeExistingProject(root);
  const report = runWork(root, "这个任务做完了吗");
  assert.equal(report.operatingLoop.operation, "FINISH_TASK");
  assert.equal(report.operatingLoop.state, "NOT_DONE");
  assert.equal(report.operatingDecision.actionCode, "COMPLETE_CLOSURE_EVIDENCE");
  assert.equal(report.boundaries.provesProductCorrectness, "No");
  assert.ok(report.evidenceTrace.nodes.some((item) => item.id === "UNIFIED_CLOSURE"));
}));

test("source failure is visible and blocks the operating state", () => withRoot("intentos-operating-source-fail-", (root) => {
  const targetFile = path.join(root, "not-a-project-directory");
  fs.writeFileSync(targetFile, "not a directory\n");
  const report = runWork(targetFile, "继续任务");
  assert.equal(report.outcome, "BLOCKED_BY_SOURCE_FAILURE");
  assert.equal(report.projectIdentityProjection.projectionStatus, "BLOCKED_BY_SOURCE_READ");
  assert.equal(report.projectIdentityProjection.confidence, "LOW");
  assert.equal(report.operatingDecision.actionCode, "REPAIR_SOURCE_READ");
  assert.ok(report.sourceSystemTrace.some((item) => item.readStatus === "FAILED"));
  assert.equal(report.authorityRecommendation.currentReadOnlyActionAllowed, "No");
}));

test("default help is beginner-only while advanced help preserves lower-level commands", () => {
  const basic = runNode(["scripts/cli.mjs", "--help"]);
  const advanced = runNode(["scripts/cli.mjs", "--help-advanced"]);
  assert.equal(basic.status, 0, basic.stderr);
  assert.equal(advanced.status, 0, advanced.stderr);
  assert.match(basic.stdout, /One public operating loop/);
  assert.match(basic.stdout, /work/);
  assert.doesNotMatch(basic.stdout, /business-rule-check/);
  assert.doesNotMatch(basic.stdout, /execution-assurance-check/);
  assert.match(advanced.stdout, /business-rule-check/);
  assert.match(advanced.stdout, /execution-assurance-check/);
  assert.match(advanced.stdout, /self-check/);
});

test("missing goal selects one user-input decision", () => withRoot("intentos-operating-no-goal-", (root) => {
  const report = runWork(root, "");
  assert.equal(report.operatingLoop.state, "NEEDS_GOAL");
  assert.equal(report.operatingDecision.actionCode, "REQUEST_GOAL");
  assert.equal(report.operatingDecision.decisionStatus, "NEEDS_USER_INPUT");
  assert.equal(report.operatingDecision.requiresHumanDecisionNow, "Yes");
  assert.equal(report.operatingDecision.canCodexContinueReadOnly, "No");
}));

test("possible-high task selects read-only risk inspection", () => withRoot("intentos-operating-possible-high-", (root) => {
  makeExistingProject(root);
  const report = runWork(root, "调整预约限制规则");
  assert.equal(report.operatingLoop.taskImpact, "POSSIBLE_HIGH");
  assert.equal(report.operatingDecision.actionCode, "INSPECT_TASK_RISK");
  assert.equal(report.operatingDecision.decisionStatus, "READ_ONLY_ACTION_REQUIRED");
  assert.ok(report.operatingDecision.blockedBy.length > 0);
}));

test("medium task selects targeted implementation-review preparation", () => withRoot("intentos-operating-medium-", (root) => {
  makeExistingProject(root);
  const report = runWork(root, "调整局部列表筛选展示");
  assert.equal(report.operatingLoop.taskImpact, "MEDIUM");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_IMPLEMENTATION_REVIEW");
  assert.equal(report.operatingDecision.decisionStatus, "READY_FOR_REVIEW_PREPARATION");
}));

test("high task selects the first authoritative governance prerequisite", () => withRoot("intentos-operating-high-", (root) => {
  makeExistingProject(root);
  const report = runWork(root, "新增管理员权限");
  assert.equal(report.operatingLoop.taskImpact, "HIGH");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_BUSINESS_RULE_CLOSURE");
  assert.ok(report.operatingDecision.blockedBy.includes("missing affected-surface map"));
  assert.equal(report.operatingDecision.requiresHumanDecisionNow, "No");
}));

test("legacy closure cannot report completion without strict Completion Evidence", () => {
  const root = path.join(kitRoot, "examples/1.49-structured-impact-coverage/contract-input-rule");
  const report = runWork(root, "这个任务做完了吗", [
    "--task", "examples/1.49-structured-impact-coverage/contract-input-rule",
    "--verification", "strict checks passed",
    "--execution-closure", "execution-closures/001-contract-input-rule.md",
    "--impact-report", "change-impact-coverage-reports/001-contract-input-rule.md",
  ]);
  assert.notEqual(report.operatingLoop.state, "READY_TO_REPORT_DONE");
  assert.notEqual(report.operatingDecision.actionCode, "REPORT_TASK_COMPLETE");
  assert.notEqual(report.operatingDecision.decisionStatus, "READY_TO_REPORT");
  assert.equal(report.boundaries.approvesReleaseOrProduction, "No");
});

test("decision digest is stable across repeated reads with unchanged semantic inputs", () => withRoot("intentos-operating-digest-", (root) => {
  makeExistingProject(root);
  const first = runWork(root, "修正文档中的一个错别字");
  const second = runWork(root, "修正文档中的一个错别字");
  assert.equal(first.operatingDecision.decisionDigest, second.operatingDecision.decisionDigest);
  assert.equal(first.projectIdentityProjection.projectionDigest, second.projectIdentityProjection.projectionDigest);
  assert.notEqual(first.generatedAt, second.generatedAt);
}));

test("IntentOS source repository has a source-specific identity projection", () => {
  const report = runWork(kitRoot, "检查当前项目状态");
  assert.equal(report.projectIdentityProjection.projectKind, "INTENTOS_SOURCE");
  assert.equal(report.projectIdentityProjection.governancePosture, "INTENTOS_SOURCE_GOVERNANCE");
  assert.equal(report.projectIdentityProjection.productionPosture, "NOT_APPLICABLE");
  assert.equal(report.projectIdentityProjection.evidenceIdentity.kind, "GIT");
});

test("selected platform profiles are projected from structured Workflow Next output", () => withRoot("intentos-operating-profile-", (root) => {
  makeExistingProject(root);
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, "docs/project-profile.md"), [
    "# Project Profile", "", "## Selected Profiles", "", "- web-app", "- backend-api", "",
  ].join("\n"));
  const report = runWork(root, "修改首页按钮文案");
  assert.deepEqual(report.projectIdentityProjection.baselinePosture.selectedProfiles, ["backend-api", "web-app"]);
  assert.equal(report.projectIdentityProjection.baselinePosture.platformBaselineState, "PROFILE_INVALID");
}));

test("project posture changes invalidate the identity projection and operating decision", () => withRoot("intentos-operating-identity-change-", (root) => {
  makeExistingProject(root);
  runGit(root, ["init"]);
  runGit(root, ["config", "user.email", "intentos-test@example.invalid"]);
  runGit(root, ["config", "user.name", "IntentOS Test"]);
  runGit(root, ["add", "."]);
  runGit(root, ["commit", "-m", "initial"]);
  const clean = runWork(root, "修改首页按钮文案");
  fs.writeFileSync(path.join(root, "src/index.js"), "export const ready = false;\n");
  const dirty = runWork(root, "修改首页按钮文案");
  fs.writeFileSync(path.join(root, "src/index.js"), "export const ready = 'changed-again';\n");
  const changedAgain = runWork(root, "修改首页按钮文案");
  assert.equal(clean.projectIdentityProjection.worktreePosture, "CLEAN");
  assert.equal(dirty.projectIdentityProjection.worktreePosture, "DIRTY");
  assert.notEqual(clean.projectIdentityProjection.projectionDigest, dirty.projectIdentityProjection.projectionDigest);
  assert.notEqual(clean.operatingDecision.decisionDigest, dirty.operatingDecision.decisionDigest);
  assert.notEqual(dirty.projectIdentityProjection.projectionDigest, changedAgain.projectIdentityProjection.projectionDigest);
  assert.notEqual(dirty.operatingDecision.decisionDigest, changedAgain.operatingDecision.decisionDigest);
}));
