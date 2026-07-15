import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(testDir, "..");

function runNode(args) {
  return spawnSync(process.execPath, args, {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 1024 * 1024 * 32,
  });
}

function runWork(root, intent, extraArgs = [], options = {}) {
  const intentArgs = intent ? ["--intent", intent] : [];
  const result = runNode(["scripts/resolve-operating-loop.mjs", root, ...intentArgs, ...extraArgs, "--json"]);
  assert.equal(result.status, options.expectedStatus ?? 0, `${result.stdout}\n${result.stderr}`);
  const report = JSON.parse(result.stdout);
  assert.equal(report.schemaVersion, "1.99.0");
  assert.equal(report.operatingDecision.contractVersion, "1.99.0");
  assert.equal(report.operatingDecision.derivedOnly, "Yes");
  assert.equal(report.operatingDecision.materialActionAuthorized, "No");
  assert.equal(report.operatingDecision.separateTechnicalApprovalRequired, "No");
  assert.equal(report.decisionResponsibility.operatingModel, "ZERO_EXPERIENCE_SOLO_DEVELOPER");
  assert.equal(report.decisionResponsibility.technicalDecisionRequiredFromUser, "No");
  assert.equal(report.decisionResponsibility.workflowKnowledgeRequiredFromUser, "No");
  assert.equal(report.decisionResponsibility.internalRoleSelectionRequiredFromUser, "No");
  assert.equal(report.decisionResponsibility.domainsArePeople, "No");
  assert.match(report.decisionResponsibility.responsibilityDigest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(report.projectIdentityProjection.contractVersion, "1.109.0");
  assert.equal(report.projectIdentityProjection.derivedOnly, "Yes");
  assert.equal(report.projectIdentityProjection.grantsAuthority, "No");
  assert.equal(report.projectIdentityProjection.writesProjectFiles, "No");
  assert.match(report.projectIdentityProjection.projectionDigest, /^sha256:[a-f0-9]{64}$/);
  if ((options.expectedStatus ?? 0) === 0) {
    assert.match(report.projectIdentityProjection.evidenceIdentity.fingerprint, /^sha256:[a-f0-9]{64}$/);
    assert.ok(report.projectIdentityProjection.sourceInputs.every((source) => /^sha256:[a-f0-9]{64}$/.test(source.semanticDigest)));
  }
  assert.ok(report.humanSummary.projectIdentity);
  assert.equal(report.humanSummary.nextSafeAction, report.operatingDecision.plainAction);
  assert.equal(report.humanSummary.technicalDecisionRequiredFromUser, "No");
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

let trustedProjectTemplate = "";

test.after(() => {
  if (trustedProjectTemplate) fs.rmSync(trustedProjectTemplate, { recursive: true, force: true });
});

function makeTrustedProject(root) {
  if (!trustedProjectTemplate) {
    trustedProjectTemplate = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-operating-trusted-template-"));
    const initialized = spawnSync(process.execPath, [
      path.join(kitRoot, "scripts/init-project.mjs"),
      "--target", trustedProjectTemplate,
      "--starter", "generic-project",
      "--goal", "build a local test project",
    ], {
      cwd: kitRoot,
      encoding: "utf8",
      timeout: 180_000,
      maxBuffer: 1024 * 1024 * 100,
    });
    assert.equal(initialized.status, 0, `${initialized.stdout}\n${initialized.stderr}`);
  }

  fs.cpSync(trustedProjectTemplate, root, { recursive: true, force: true });
  const receiptFile = path.join(root, ".intentos", "bootstrap-receipt.json");
  const receipt = JSON.parse(fs.readFileSync(receiptFile, "utf8"));
  receipt.target_root = fs.realpathSync(root);
  const { receipt_digest: _digest, receipt_ref: _ref, ...base } = receipt;
  receipt.receipt_digest = evidenceDigest(base, []);
  fs.writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`);
  fs.mkdirSync(path.join(root, "src"), { recursive: true });
  fs.writeFileSync(path.join(root, "src/index.js"), "export const ready = true;\n");
}

function makeCurrentWorkQueue(root, taskId = "TASK-001", title = "Current test task") {
  fs.rmSync(path.join(root, "work-queue"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "active-work-threads"), { recursive: true, force: true });
  fs.mkdirSync(path.join(root, "work-queue"), { recursive: true });
  fs.writeFileSync(path.join(root, "work-queue/current.md"), [
    "# Work Queue", "", "| Task ID | Title | State | Evidence | Resume Review | Notes |", "|---|---|---|---|---|---|",
    `| ${taskId} | ${title} | CURRENT | test setup | N/A | current |`, "",
  ].join("\n"));
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
  assert.equal(report.decisionResponsibility.userResponsibilityClass, "NO_USER_ACTION");
  assert.equal(report.decisionResponsibility.userActionRequiredNow, "No");
  assert.equal(report.boundaries.writesTargetFiles, "No");
}));

test("unbootstrapped existing project normal task enters adoption review", () => withRoot("intentos-operating-existing-", (root) => {
  makeExistingProject(root);
  makeCurrentWorkQueue(root);
  const report = runWork(root, "修改首页按钮文案");
  assert.match(report.projectEntry.state, /EXISTING_PROJECT_ENTRY|GOVERNED_PROJECT_ENTRY/);
  assert.equal(report.projectIdentityProjection.projectKind, "EXISTING_PROJECT");
  assert.equal(report.projectIdentityProjection.governancePosture, "GOVERNED");
  assert.equal(report.projectIdentityProjection.evidenceIdentity.kind, "NON_GIT");
  assert.equal(report.operatingLoop.operation, "ADOPT_PROJECT");
  assert.equal(report.operatingDecision.actionCode, "RUN_ADOPTION_REVIEW");
  assert.equal(report.operatingDecision.materialActionAuthorized, "No");
  assert.equal(report.operatingDecision.canCodexContinueReadOnly, "Yes");
}));

test("trusted initialized project normal task completes Planning Closure before implementation review", () => withRoot("intentos-operating-trusted-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root);
  const report = runWork(root, "修改首页按钮文案");
  assert.equal(report.projectEntry.state, "NEW_PROJECT_ENTRY");
  assert.equal(report.projectIdentityProjection.projectKind, "NEW_PROJECT");
  assert.equal(report.projectIdentityProjection.governancePosture, "NOT_ESTABLISHED");
  assert.equal(report.projectIdentityProjection.evidenceIdentity.kind, "NON_GIT");
  assert.equal(report.operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(report.operatingLoop.taskImpact, "LOW");
  assert.equal(report.operatingDecision.actionCode, "COMPLETE_PLANNING_CLOSURE");
  assert.equal(report.operatingLoop.state, "NEEDS_PLANNING_EVIDENCE");
  assert.equal(report.operatingLoop.projectBaselineControlsTaskImpact, "No");
  assert.ok(report.evidenceTrace.dependencies.every((item) => item.to === "OPERATING_STATE" && item.relation === "INPUT_TO_DERIVED_VIEW"));
  assert.equal(report.decisionResponsibility.userResponsibilityClass, "NO_USER_ACTION");
  assert.equal(report.operatingDecision.routineEngineeringMayProceedAfterInternalGates, "Yes");
}));

test("existing project adoption is a project-entry review and remains read-only", () => withRoot("intentos-operating-adopt-", (root) => {
  makeExistingProject(root);
  makeCurrentWorkQueue(root);
  const before = snapshot(root);
  const report = runWork(root, "把这个老项目接入 IntentOS");
  assert.equal(report.operatingLoop.operation, "ADOPT_PROJECT");
  assert.equal(report.operatingLoop.lifecyclePhase, "PROJECT_ENTRY");
  assert.equal(report.operatingDecision.actionCode, "RUN_ADOPTION_REVIEW");
  assert.equal(report.decisionResponsibility.grantsExternalAuthority, "No");
  assert.equal(report.decisionResponsibility.internalRoleSelectionRequiredFromUser, "No");
  assert.deepEqual(snapshot(root), before);
}));

test("release preparation remains automatic while real-world consent stays explicit", () => withRoot("intentos-operating-release-", (root) => {
  makeTrustedProject(root);
  const report = runWork(root, "准备发布内部测试版本");
  assert.equal(report.operatingLoop.operation, "PREPARE_RELEASE");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_RELEASE_REVIEW");
  assert.ok(report.decisionResponsibility.responsibilityDomains.includes("RELEASE_SAFETY"));
  assert.equal(report.decisionResponsibility.userResponsibilityClass, "REAL_WORLD_CONSENT_NEEDED");
  assert.equal(report.decisionResponsibility.userActionRequiredNow, "No");
  assert.equal(report.decisionResponsibility.technicalDecisionRequiredFromUser, "No");
  assert.equal(report.boundaries.approvesReleaseOrProduction, "No");
}));

test("permission task remains a technical responsibility domain instead of a people-selection task", () => withRoot("intentos-operating-permission-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root);
  fs.writeFileSync(
    path.join(root, "src/administrator-permission.js"),
    "export function validateAdministratorPermissionAndSensitiveDatabaseAccess() { return true; }\n",
  );
  const report = runWork(root, "Add administrator permission and restrict sensitive database access");
  assert.equal(report.operatingLoop.operation, "CONTINUE_TASK");
  assert.match(report.operatingLoop.taskImpact, /HIGH|POSSIBLE_HIGH/);
  assert.equal(report.operatingDecision.actionCode, "PREPARE_BUSINESS_RULE_CLOSURE");
  assert.ok(report.decisionResponsibility.responsibilityDomains.includes("ACCESS_CONTROL"));
  assert.ok(report.decisionResponsibility.responsibilityDomains.includes("DATA_SAFETY"));
  assert.equal(report.decisionResponsibility.userResponsibilityClass, "NO_USER_ACTION");
  assert.equal(report.decisionResponsibility.internalRoleSelectionRequiredFromUser, "No");
}));

test("continuation without a durable current Work Queue item stops before implementation review", () => withRoot("intentos-operating-no-queue-", (root) => {
  makeTrustedProject(root);
  fs.rmSync(path.join(root, "work-queue"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "tasks"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "active-work-threads"), { recursive: true, force: true });
  const report = runWork(root, "修改首页按钮文案");
  assert.equal(report.operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(report.operatingLoop.state, "NEEDS_WORK_QUEUE");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_WORK_QUEUE");
}));

test("multiple CURRENT Work Queue items fail closed", () => withRoot("intentos-operating-queue-conflict-", (root) => {
  makeTrustedProject(root);
  fs.rmSync(path.join(root, "work-queue"), { recursive: true, force: true });
  fs.rmSync(path.join(root, "active-work-threads"), { recursive: true, force: true });
  fs.mkdirSync(path.join(root, "work-queue"), { recursive: true });
  fs.writeFileSync(path.join(root, "work-queue/current.md"), [
    "# Work Queue", "", "| Task ID | Title | State |", "|---|---|---|",
    "| TASK-001 | First | CURRENT |", "| TASK-002 | Second | CURRENT |", "",
  ].join("\n"));
  const report = runWork(root, "继续任务");
  assert.equal(report.operatingLoop.state, "BLOCKED_BY_WORK_QUEUE");
  assert.equal(report.operatingDecision.actionCode, "REPAIR_WORK_QUEUE");
}));

test("a clearly different goal does not silently continue the current task", () => withRoot("intentos-operating-task-switch-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root, "TASK-BOOKING", "完善预约时间校验");
  const switched = runWork(root, "新增财务发票导出功能");
  assert.equal(switched.operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(switched.operatingLoop.state, "NEEDS_TASK_SWITCH_REVIEW");
  assert.equal(switched.operatingDecision.actionCode, "REVIEW_TASK_SWITCH");
  assert.equal(switched.operatingDecision.requiresHumanDecisionNow, "Yes");
  assert.equal(switched.decisionResponsibility.userResponsibilityClass, "BUSINESS_FACT_NEEDED");

  const continued = runWork(root, "继续完善预约时间校验");
  assert.notEqual(continued.operatingLoop.state, "NEEDS_TASK_SWITCH_REVIEW");
}));

test("Work Queue preserves canonical task identity and exposes active-thread conflicts", () => withRoot("intentos-operating-queue-identity-", (root) => {
  const digest = `sha256:${"1".repeat(64)}`;
  fs.mkdirSync(path.join(root, "work-queue"), { recursive: true });
  fs.mkdirSync(path.join(root, "tasks"), { recursive: true });
  fs.mkdirSync(path.join(root, "active-work-threads"), { recursive: true });
  fs.writeFileSync(path.join(root, "tasks/profile-copy.md"), "# Profile copy task\n");
  fs.writeFileSync(path.join(root, "work-queue/current.md"), [
    "# Work Queue", "", "| Task ID | Title | State | Task ref | Intent digest | Resume review | Notes |", "|---|---|---|---|---|---|---|",
    `| TASK-A | Fix profile copy | CURRENT | tasks/profile-copy.md | ${digest} | N/A | current |`, "",
  ].join("\n"));
  let result = runNode(["scripts/resolve-work-queue.mjs", root, "--json"]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  let report = JSON.parse(result.stdout);
  assert.equal(report.currentTaskCandidates[0].taskRef, "tasks/profile-copy.md");
  assert.equal(report.currentTaskCandidates[0].intentDigest, digest);

  fs.writeFileSync(path.join(root, "active-work-threads/task-b.md"), "# Another active task\n");
  result = runNode(["scripts/resolve-work-queue.mjs", root, "--json"]);
  report = JSON.parse(result.stdout);
  assert.equal(report.currentTaskCount, 2);
}));

test("discussion, resume, compound release implementation, and scoped no-database language route explicitly", () => withRoot("intentos-operating-routing-hardening-", (root) => {
  makeTrustedProject(root);
  assert.equal(runWork(root, "先沟通一下，不要改代码").operatingLoop.operation, "DISCUSS_ONLY");
  assert.equal(runWork(root, "先看一下这个内容").operatingLoop.operation, "DISCUSS_ONLY");
  assert.equal(runWork(root, "只查看这个方案").operatingLoop.operation, "DISCUSS_ONLY");
  assert.equal(runWork(root, "恢复暂停的任务").operatingLoop.operation, "RESUME_TASK");
  assert.equal(runWork(root, "发布当前版本").operatingLoop.operation, "PREPARE_RELEASE");
  assert.equal(runWork(root, "Release the current version").operatingLoop.operation, "PREPARE_RELEASE");
  assert.equal(runWork(root, "实现修复并准备发布").operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(runWork(root, "不要修改数据库，只改前端").operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(runWork(root, "Review the authentication flow, but do not edit anything").operatingLoop.operation, "DISCUSS_ONLY");
  assert.equal(runWork(root, "This is not a new project; fix login").operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(runWork(root, "check status and implement the login fix").operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(runWork(root, "Just review login, then implement billing deletion").operatingLoop.operation, "CONTINUE_TASK");
}));

test("Closure cannot authorize DONE from fuzzy intent text without canonical task identity", () => {
  const root = path.join(kitRoot, "examples/1.49-structured-impact-coverage/contract-input-rule");
  const result = runNode([
    "scripts/resolve-closure-decision.mjs", root,
    "--intent", "change contract input icon color",
    "--verification", "strict checks passed",
    "--execution-closure", "execution-closures/001-contract-input-rule.md",
    "--impact-report", "change-impact-coverage-reports/001-contract-input-rule.md",
    "--json",
  ]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.notEqual(JSON.parse(result.stdout).closureDecision.decision, "DONE");
});

test("BL2 project still permits a genuinely low task classification", () => withRoot("intentos-operating-bl2-low-", (root) => {
  makeTrustedProject(root);
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
  makeTrustedProject(root);
  makeCurrentWorkQueue(root);
  const report = runWork(root, "继续完成预约规则");
  assert.equal(report.projectEntry.state, "NEW_PROJECT_ENTRY");
  assert.equal(report.operatingLoop.operation, "CONTINUE_TASK");
  assert.equal(report.operatingDecision.actionCode, "INSPECT_TASK_RISK");
}));

test("business nouns do not hijack task routing", () => withRoot("intentos-operating-route-conflicts-", (root) => {
  makeTrustedProject(root);
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
  makeTrustedProject(root);
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
  assert.equal(report.operatingDecision.requiresHumanDecisionNow, "No");
  assert.equal(report.decisionResponsibility.userResponsibilityClass, "NO_USER_ACTION");
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
  const blocked = runWork(root, "继续完成预约规则", [], { expectedStatus: 2 });
  assert.notEqual(blocked.projectEntry.state, "NEW_PROJECT_ENTRY");
  assert.equal(blocked.outcome, "BLOCKED_BY_SOURCE_FAILURE");
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

test("production vocabulary does not override original new-project entry or task impact", () => withRoot("intentos-operating-production-origin-", (root) => {
  makeTrustedProject(root);
  fs.mkdirSync(path.join(root, ".github", "workflows"), { recursive: true });
  fs.mkdirSync(path.join(root, "docs", "runbooks"), { recursive: true });
  fs.writeFileSync(path.join(root, ".github/workflows/release.yml"), "name: production release\n");
  fs.writeFileSync(path.join(root, "docs/runbooks/release.md"), "# Production release runbook\n");
  fs.writeFileSync(path.join(root, "Dockerfile"), "FROM scratch\n");
  makeCurrentWorkQueue(root);
  const report = runWork(root, "修正文档中的一个错别字");
  assert.equal(report.projectEntry.state, "NEW_PROJECT_ENTRY");
  assert.equal(report.projectIdentityProjection.projectKind, "NEW_PROJECT");
  assert.equal(report.projectIdentityProjection.governancePosture, "NOT_ESTABLISHED");
  assert.equal(report.projectIdentityProjection.productionPosture, "NOT_ESTABLISHED");
  assert.equal(report.operatingLoop.taskImpact, "LOW");
  assert.equal(report.operatingLoop.state, "NEEDS_PLANNING_EVIDENCE");
  assert.equal(report.operatingDecision.actionCode, "COMPLETE_PLANNING_CLOSURE");
}));

test("controlled plan records new-project entry origin", () => withRoot("intentos-operating-new-plan-origin-", (root) => {
  const target = path.join(root, "new-project");
  fs.mkdirSync(target);
  const planPath = path.join(target, "apply-execution-plans", "new-project-plan.json");
  const goal = "build a governed appointment application";
  const result = runNode([
    "scripts/init-project.mjs",
    "--target", target,
    "--goal", goal,
    "--write-plan", path.relative(target, planPath),
  ]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const versionAction = plan.actions.find((item) => item.path === ".intentos/version.json");
  const version = JSON.parse(Buffer.from(versionAction.inlineContentBase64, "base64").toString("utf8"));
  assert.equal(plan.arguments.projectEntryOrigin, "NEW_PROJECT");
  assert.equal(plan.arguments.goal, goal);
  assert.match(plan.arguments.goalDigest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(version.projectEntryOrigin, "NEW_PROJECT");
}));

test("finish without valid completion evidence cannot report done", () => withRoot("intentos-operating-finish-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root);
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
  const report = runWork(targetFile, "继续任务", [], { expectedStatus: 2 });
  assert.equal(report.outcome, "BLOCKED_BY_SOURCE_FAILURE");
  assert.equal(report.projectIdentityProjection.projectionStatus, "BLOCKED_BY_SOURCE_READ");
  assert.equal(report.projectIdentityProjection.confidence, "LOW");
  assert.equal(report.operatingDecision.actionCode, "REPAIR_SOURCE_READ");
  assert.ok(report.sourceSystemTrace.some((item) => item.readStatus === "FAILED"));
  assert.equal(report.decisionResponsibility.routineEngineeringMayProceedAfterInternalGates, "No");
  assert.equal(report.decisionResponsibility.technicalDecisionRequiredFromUser, "No");
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
  makeTrustedProject(root);
  makeCurrentWorkQueue(root);
  const report = runWork(root, "调整预约限制规则");
  assert.equal(report.operatingLoop.taskImpact, "POSSIBLE_HIGH");
  assert.equal(report.operatingDecision.actionCode, "INSPECT_TASK_RISK");
  assert.equal(report.operatingDecision.decisionStatus, "READ_ONLY_ACTION_REQUIRED");
  assert.ok(report.operatingDecision.blockedBy.length > 0);
}));

test("medium task completes durable Planning Closure before implementation-review preparation", () => withRoot("intentos-operating-medium-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root);
  fs.writeFileSync(
    path.join(root, "src/local-panel.js"),
    "export function handler() { const localPanelInteraction = 'bounded local behavior'; return localPanelInteraction; }\n",
  );
  const report = runWork(root, "Update local panel handler interaction");
  assert.equal(report.operatingLoop.taskImpact, "MEDIUM");
  assert.equal(report.operatingDecision.actionCode, "COMPLETE_PLANNING_CLOSURE");
  assert.equal(report.operatingDecision.decisionStatus, "ACTION_REQUIRED");
}));

test("medium selection behavior pauses for bounded omission-risk inspection", () => withRoot("intentos-operating-medium-inspection-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root);
  const report = runWork(root, "调整局部列表筛选展示");
  assert.equal(report.operatingLoop.taskImpact, "MEDIUM");
  assert.equal(report.operatingDecision.actionCode, "INSPECT_BUSINESS_UNIVERSE_RISK");
  assert.equal(report.operatingDecision.decisionStatus, "READ_ONLY_ACTION_REQUIRED");
  assert.equal(report.operatingDecision.requiresHumanDecisionNow, "No");
}));

test("evidenced medium shared behavior prepares Business Universe before Business Rule", () => withRoot("intentos-operating-medium-universe-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root);
  fs.writeFileSync(
    path.join(root, "src/member-guest-list.js"),
    "export function filterMemberAndGuestListWithSharedDisplayRule() { return true; }\n",
  );
  const report = runWork(root, "Member and guest use the same local list filter");
  assert.equal(report.operatingLoop.taskImpact, "MEDIUM");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_BUSINESS_UNIVERSE_COVERAGE");
  assert.equal(report.operatingDecision.decisionStatus, "ACTION_REQUIRED");
}));

test("high task selects the first authoritative governance prerequisite", () => withRoot("intentos-operating-high-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root);
  fs.writeFileSync(
    path.join(root, "src/administrator-permission.js"),
    "export function validateAdministratorPermission() { return true; }\n",
  );
  const report = runWork(root, "Add administrator permission validation");
  assert.equal(report.operatingLoop.taskImpact, "HIGH");
  assert.equal(report.operatingDecision.actionCode, "PREPARE_BUSINESS_RULE_CLOSURE");
  assert.ok(report.operatingDecision.blockedBy.includes("missing affected-surface map"));
  assert.equal(report.operatingDecision.requiresHumanDecisionNow, "No");
}));

test("external policy facts block only the dependent claim and never become a technical-choice prompt", () => withRoot("intentos-operating-external-fact-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root, "TASK-TAX", "实现税务发票规则");
  const report = runWork(root, "实现税务发票规则并满足当地合规要求");
  assert.equal(report.decisionResponsibility.userResponsibilityClass, "EXTERNAL_FACT_NEEDED");
  assert.ok(report.decisionResponsibility.responsibilityDomains.includes("EXTERNAL_POLICY"));
  assert.equal(report.decisionResponsibility.unaffectedEngineeringMayContinue, "Yes");
  assert.equal(report.decisionResponsibility.technicalDecisionRequiredFromUser, "No");
  assert.match(report.decisionResponsibility.publicPrompt, /外部政策事实/);
}));

test("zero-experience solo model never requires multiple internal people", () => withRoot("intentos-operating-solo-roles-", (root) => {
  makeTrustedProject(root);
  makeCurrentWorkQueue(root, "TASK-SAFE-RELEASE", "升级权限数据并准备发布");
  const report = runWork(root, "升级权限数据并准备正式发布");
  assert.deepEqual(report.decisionResponsibility.responsibilityDomains.sort(), ["ACCESS_CONTROL", "DATA_SAFETY", "ENGINEERING", "RELEASE_SAFETY"].sort());
  assert.equal(report.decisionResponsibility.domainsArePeople, "No");
  assert.equal(report.decisionResponsibility.internalRoleSelectionRequiredFromUser, "No");
  assert.doesNotMatch(JSON.stringify(report.decisionResponsibility), /DATA_OWNER|SECURITY_OWNER|RELEASE_OWNER|DOMAIN_OWNER/);
}));

test("real-world effects are expressed as consent to impact, not approval of a technical strategy", () => withRoot("intentos-operating-real-world-consent-", (root) => {
  makeTrustedProject(root);
  const report = runWork(root, "现在部署到生产环境并向真实用户发送通知");
  assert.equal(report.operatingLoop.operation, "PREPARE_RELEASE");
  assert.equal(report.decisionResponsibility.userResponsibilityClass, "REAL_WORLD_CONSENT_NEEDED");
  assert.ok(report.decisionResponsibility.responsibilityDomains.includes("REAL_USER_COMMUNICATION"));
  assert.equal(report.decisionResponsibility.technicalDecisionRequiredFromUser, "No");
  assert.equal(report.decisionResponsibility.silenceCountsAsConsent, "No");
  assert.match(report.decisionResponsibility.publicPrompt, /现实影响/);
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
  makeTrustedProject(root);
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
