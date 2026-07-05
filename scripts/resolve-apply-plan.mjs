#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "action",
  "targets",
  "risk",
  "from-guidance",
  "from-workflow-map",
  "from-baseline-decision",
  "from-standard-baseline",
  "from-baseline-pack-selection",
  "from-archive-apply",
  "from-hook-plan",
  "from-hook-policy",
  "from-review-surface",
  "from-change-boundary",
  "from-debt-handoff",
  "from-closure",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const plan = buildPlan(projectRoot, args);
if (outputFormat === "json") console.log(JSON.stringify(plan, null, 2));
else printHuman(plan);

function buildPlan(root, options) {
  const intent = String(options.intent || "").trim();
  const targetExists = fs.existsSync(root);
  const git = readGitState(root);
  const evidence = buildEvidence(root, options);
  const actions = buildActions(options, intent);
  const highRiskActions = actions.filter((action) => action.highRisk);
  const missingEvidence = evidence.filter((item) => item.status === "missing");
  const readiness = applyReadiness({
    targetExists,
    git,
    actions,
    highRiskActions,
    missingEvidence,
  });

  return {
    reportType: "UNIFIED_APPLY_PLAN",
    generatedBy: "scripts/resolve-apply-plan.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    intent: intent || "not provided",
    humanDecisionSummary: {
      conclusion: readiness.conclusion,
      recommendedChoice: readiness.recommendedChoice,
      canCodexWriteNow: "No",
      needFromHuman: readiness.needFromHuman,
      ifNothing: "No project files are written, no hooks or CI are changed, and no apply action is approved.",
    },
    applyReadiness: readiness,
    sourceEvidence: evidence,
    plannedActions: actions,
    humanOnlyOrBlockedActions: humanOnlyActions(actions, readiness),
    preconditions: preconditionsFor(targetExists, git, evidence, actions),
    backupRollbackPlan: backupRollbackPlan(actions),
    verificationPlan: verificationPlan(actions),
    humanDecisionsNeeded: decisionsFor(readiness, actions),
    boundary: {
      writesFilesNow: "No",
      authorizesApply: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      modifiesCiOrHooksNow: "No",
      deletesOrArchivesFilesNow: "No",
      changesSourceOfTruthNow: "No",
      grantsPermissionBeyondScope: "No",
    },
    outcome: readiness.outcome,
  };
}

function buildEvidence(root, options) {
  return [
    evidenceRef(root, "Workflow Guidance Card", options["from-guidance"]),
    evidenceRef(root, "Workflow Adoption Map", options["from-workflow-map"]),
    evidenceRef(root, "Baseline Decision Card", options["from-baseline-decision"]),
    evidenceRef(root, "Standard Baseline Selection Report", options["from-standard-baseline"]),
    evidenceRef(root, "Baseline Pack Selection Report", options["from-baseline-pack-selection"]),
    evidenceRef(root, "Document Archive Apply Plan", options["from-archive-apply"]),
    evidenceRef(root, "Hook Orchestration Plan", options["from-hook-plan"]),
    evidenceRef(root, "Project Hook Policy", options["from-hook-policy"]),
    evidenceRef(root, "Review Surface Card", options["from-review-surface"]),
    evidenceRef(root, "Change Boundary Report", options["from-change-boundary"]),
    evidenceRef(root, "Debt & Knowledge Handoff Report", options["from-debt-handoff"]),
    evidenceRef(root, "Execution Closure Report", options["from-closure"]),
  ];
}

function evidenceRef(root, evidence, refValue) {
  if (!refValue || refValue === true) return { evidence, ref: "not provided", status: "not applicable" };
  const ref = String(refValue);
  const resolved = path.isAbsolute(ref) ? ref : path.resolve(root, ref);
  return {
    evidence,
    ref,
    status: fs.existsSync(resolved) ? "present" : "missing",
  };
}

function buildActions(options, intent) {
  const requested = splitList(options.action);
  const inferred = requested.length > 0 ? requested : inferActions(intent);
  const targets = splitList(options.targets);
  const actions = inferred.map((raw, index) => actionFor(raw, targets, index));
  return actions.length > 0 ? actions : [noAction()];
}

function inferActions(intent) {
  const text = intent.toLowerCase();
  const actions = [];
  if (/init|update|bootstrap|workflow|接入|初始化|更新|工作流/.test(text)) actions.push("workflow-assets");
  if (/baseline|基线|engineering|environment/.test(text)) actions.push("baseline-docs");
  if (/agent|agents|agENTs|规则|治理迁移/.test(intent)) actions.push("agents-governance");
  if (/pr template|pull request|pr模板|pr 模板/.test(text)) actions.push("pr-template-governance");
  if (/archive|归档|清理文档/.test(text)) actions.push("document-archive");
  if (/hook|ci|workflow|自动化|定时|触发/.test(text)) actions.push("hook-or-ci");
  if (/bl2|industrial|工业|高风险包/.test(text)) actions.push("industrial-pack");
  if (/business code|业务代码|实现|feature|功能/.test(text)) actions.push("business-code");
  return [...new Set(actions)];
}

function actionFor(rawType, explicitTargets, index) {
  const type = normalizeActionType(rawType);
  const defaults = defaultTargetsFor(type);
  const targetPaths = explicitTargets.length > 0 ? explicitTargets : defaults;
  const highRisk = isHighRiskAction(type, targetPaths);
  return {
    id: `A-${String(index + 1).padStart(3, "0")}`,
    actionType: type,
    targetPaths,
    reason: reasonFor(type),
    status: highRisk ? "HUMAN_APPROVAL_REQUIRED" : "PLAN_ONLY",
    willWriteNow: "No",
    approvalRequired: "Yes",
    rollbackRequired: targetPaths.includes("N/A") ? "No" : "Yes",
    highRisk,
  };
}

function noAction() {
  return {
    id: "A-000",
    actionType: "NO_ACTION",
    targetPaths: ["N/A"],
    reason: "No concrete apply action was requested or inferred.",
    status: "NOT_APPLICABLE",
    willWriteNow: "No",
    approvalRequired: "No",
    rollbackRequired: "No",
    highRisk: false,
  };
}

function normalizeActionType(value) {
  const text = String(value || "").trim().toLowerCase();
  const map = new Map([
    ["workflow", "WORKFLOW_ASSET_UPDATE"],
    ["workflow-assets", "WORKFLOW_ASSET_UPDATE"],
    ["workflow_asset_update", "WORKFLOW_ASSET_UPDATE"],
    ["init", "WORKFLOW_ASSET_UPDATE"],
    ["update", "WORKFLOW_ASSET_UPDATE"],
    ["baseline", "BASELINE_DOC_WRITE"],
    ["baseline-docs", "BASELINE_DOC_WRITE"],
    ["engineering-baseline", "BASELINE_DOC_WRITE"],
    ["environment-baseline", "BASELINE_DOC_WRITE"],
    ["agents", "AGENTS_GOVERNANCE"],
    ["agents-governance", "AGENTS_GOVERNANCE"],
    ["agent-governance", "AGENTS_GOVERNANCE"],
    ["pr", "PR_TEMPLATE_GOVERNANCE"],
    ["pr-template", "PR_TEMPLATE_GOVERNANCE"],
    ["pr-template-governance", "PR_TEMPLATE_GOVERNANCE"],
    ["document-archive", "DOCUMENT_ARCHIVE_APPLY"],
    ["archive", "DOCUMENT_ARCHIVE_APPLY"],
    ["archive-apply", "DOCUMENT_ARCHIVE_APPLY"],
    ["hook", "HOOK_OR_CI_CHANGE"],
    ["hooks", "HOOK_OR_CI_CHANGE"],
    ["ci", "HOOK_OR_CI_CHANGE"],
    ["hook-or-ci", "HOOK_OR_CI_CHANGE"],
    ["industrial", "INDUSTRIAL_PACK_ENABLE"],
    ["industrial-pack", "INDUSTRIAL_PACK_ENABLE"],
    ["bl2", "INDUSTRIAL_PACK_ENABLE"],
    ["business-code", "BUSINESS_CODE_CHANGE"],
    ["code", "BUSINESS_CODE_CHANGE"],
    ["existing-bridge", "EXISTING_PROJECT_BRIDGE_DOC"],
    ["governance-map", "EXISTING_PROJECT_BRIDGE_DOC"],
    ["automation", "AUTOMATION_CHANGE"],
    ["migration", "DATA_OR_MIGRATION_CHANGE"],
    ["secret", "SECRET_OR_ENV_CHANGE"],
    ["env", "SECRET_OR_ENV_CHANGE"],
    ["production-config", "PRODUCTION_CONFIG_CHANGE"],
    ["payment", "PAYMENT_OR_VALUE_TRANSFER_CHANGE"],
    ["security", "SECURITY_PRIVACY_COMPLIANCE_CHANGE"],
    ["legal", "LEGAL_LICENSE_POLICY_CHANGE"],
  ]);
  return map.get(text) || text.toUpperCase().replace(/[^A-Z0-9]+/g, "_") || "NO_ACTION";
}

function defaultTargetsFor(type) {
  const defaults = {
    WORKFLOW_ASSET_UPDATE: [".intentos", "scripts/*", ".github/workflows/ai-workflow-checks.yml"],
    BASELINE_DOC_WRITE: ["docs/engineering-baseline.md", "docs/environment-baseline.md"],
    AGENTS_GOVERNANCE: ["AGENTS.md"],
    PR_TEMPLATE_GOVERNANCE: [".github/pull_request_template.md"],
    DOCUMENT_ARCHIVE_APPLY: ["docs/archive/*", "docs/archive/index.md"],
    HOOK_OR_CI_CHANGE: [".github/workflows/*", "hooks/*"],
    INDUSTRIAL_PACK_ENABLE: ["docs/baseline-selection.md", ".intentos/industrial-packs/*"],
    BUSINESS_CODE_CHANGE: ["src/*"],
    EXISTING_PROJECT_BRIDGE_DOC: ["docs/governance/intentos-adoption-v1.md"],
    AUTOMATION_CHANGE: ["automation-proposals/*"],
    DATA_OR_MIGRATION_CHANGE: ["migrations/*", "schema/*"],
    SECRET_OR_ENV_CHANGE: [".env*", "docs/environment-baseline.md"],
    PRODUCTION_CONFIG_CHANGE: ["deploy/*", ".github/workflows/*"],
    PAYMENT_OR_VALUE_TRANSFER_CHANGE: ["src/*", "docs/risk-policy.md"],
    SECURITY_PRIVACY_COMPLIANCE_CHANGE: ["docs/security.md", "docs/privacy.md"],
    LEGAL_LICENSE_POLICY_CHANGE: ["LICENSE.md", "NOTICE.md"],
    NO_ACTION: ["N/A"],
  };
  return defaults[type] || ["PENDING_TARGET_CONFIRMATION"];
}

function reasonFor(type) {
  const reasons = {
    WORKFLOW_ASSET_UPDATE: "Install or update IntentOS workflow assets.",
    BASELINE_DOC_WRITE: "Record engineering or environment baseline decisions.",
    AGENTS_GOVERNANCE: "Apply agent governance text after review.",
    PR_TEMPLATE_GOVERNANCE: "Apply PR template governance text after review.",
    DOCUMENT_ARCHIVE_APPLY: "Convert archive suggestions into controlled archive actions later.",
    HOOK_OR_CI_CHANGE: "Change automatic triggers, CI, gates, or hook behavior.",
    INDUSTRIAL_PACK_ENABLE: "Enable optional high-risk / industrial baseline overlays.",
    BUSINESS_CODE_CHANGE: "Modify product or implementation code.",
    EXISTING_PROJECT_BRIDGE_DOC: "Bridge IntentOS workflow to an existing governed project without replacing it.",
    AUTOMATION_CHANGE: "Create or update automation proposal files before any automation is enabled.",
  };
  return reasons[type] || "Apply-related change requested by user or inferred from intent.";
}

function isHighRiskAction(type, targetPaths) {
  const highRiskTypes = new Set([
    "HOOK_OR_CI_CHANGE",
    "PRODUCTION_CONFIG_CHANGE",
    "SECRET_OR_ENV_CHANGE",
    "DATA_OR_MIGRATION_CHANGE",
    "PAYMENT_OR_VALUE_TRANSFER_CHANGE",
    "SECURITY_PRIVACY_COMPLIANCE_CHANGE",
    "LEGAL_LICENSE_POLICY_CHANGE",
    "INDUSTRIAL_PACK_ENABLE",
    "BUSINESS_CODE_CHANGE",
  ]);
  if (highRiskTypes.has(type)) return true;
  return targetPaths.some((targetPath) => /(^|\/)(\.github|hooks|deploy|migrations|schema|\.env|secrets?)(\/|$)|AGENTS\.md/i.test(targetPath));
}

function applyReadiness({ targetExists, git, actions, highRiskActions, missingEvidence }) {
  if (!targetExists) {
    return readiness("BLOCKED_BY_MISSING_TARGET", "Target project path does not exist.", "D - Provide a valid project path", "Provide a valid project path.", "BLOCKED");
  }
  if (actions.every((action) => action.actionType === "NO_ACTION")) {
    return readiness("NO_APPLY_ACTION_READY", "No concrete apply action is ready.", "A - Stay read-only", "Confirm the intended write action, or continue with read-only guidance.", "APPLY_PLAN_RECORDED");
  }
  if (missingEvidence.length > 0) {
    return readiness("BLOCKED_BY_MISSING_EVIDENCE", `${missingEvidence.length} referenced evidence item(s) are missing.`, "D - Gather evidence first", "Provide or regenerate the missing evidence before apply review.", "BLOCKED");
  }
  if (git.isRepo && git.dirty && actions.some((action) => action.actionType !== "NO_ACTION")) {
    return readiness("BLOCKED_BY_DIRTY_WORK", "Target project has existing uncommitted changes.", "C - Review current work first", "Confirm whether current changes belong to this apply scope.", "NEEDS_HUMAN_DECISION");
  }
  if (highRiskActions.length > 0) {
    return readiness("NEEDS_HUMAN_APPROVAL", `${highRiskActions.length} high-risk action(s) need explicit approval.`, "B - Review and narrow apply scope", "Approve, narrow, or reject each high-risk action.", "NEEDS_HUMAN_DECISION");
  }
  return readiness("PLAN_ONLY", "Apply scope is described but not approved.", "B - Review apply plan", "Approve, narrow, or reject the plan before any write command.", "NEEDS_HUMAN_DECISION");
}

function readiness(state, conclusion, recommendedChoice, needFromHuman, outcome) {
  return {
    state,
    canApplyNow: "No",
    canAiWriteNow: "No",
    conclusion,
    recommendedChoice,
    needFromHuman,
    outcome,
  };
}

function humanOnlyActions(actions, readinessState) {
  return actions
    .filter((action) => action.highRisk || action.status === "HUMAN_APPROVAL_REQUIRED" || readinessState.state.startsWith("BLOCKED"))
    .map((action) => ({
      id: action.id.replace(/^A-/, "H-"),
      actionType: action.actionType,
      reason: action.highRisk ? "High-risk apply action requires human owner approval." : readinessState.conclusion,
      requiredOwner: "human",
      status: readinessState.state.startsWith("BLOCKED") ? "BLOCKED" : "HUMAN_APPROVAL_REQUIRED",
    }));
}

function preconditionsFor(targetExists, git, evidence, actions) {
  return [
    { precondition: "Target project exists", status: targetExists ? "yes" : "no" },
    { precondition: "Existing project rules reviewed", status: evidence.some((item) => item.evidence === "Workflow Adoption Map" && item.status === "present") ? "yes" : "pending or not applicable" },
    { precondition: "Dirty work reviewed", status: git.isRepo ? (git.dirty ? "pending" : "clean") : "not a git repo or not checked" },
    { precondition: "Required evidence linked", status: evidence.some((item) => item.status === "missing") ? "missing evidence" : "linked or not applicable" },
    { precondition: "High-risk actions separated", status: actions.some((action) => action.highRisk) ? "yes" : "not applicable" },
  ];
}

function backupRollbackPlan(actions) {
  return actions.map((action) => ({
    action: action.id,
    backupRequired: action.rollbackRequired === "Yes" ? "Yes" : "No",
    backupPath: action.rollbackRequired === "Yes" ? ".intentos/backups/<approved-apply-id>/" : "N/A",
    rollbackStep: action.rollbackRequired === "Yes"
      ? `Restore ${action.targetPaths.join(", ")} from backup or version control.`
      : "No write action planned.",
    rollbackVerification: action.rollbackRequired === "Yes"
      ? "Run workflow checks and project verification after rollback."
      : "N/A",
  }));
}

function verificationPlan(actions) {
  const hasWorkflow = actions.some((action) => ["WORKFLOW_ASSET_UPDATE", "AGENTS_GOVERNANCE", "PR_TEMPLATE_GOVERNANCE"].includes(action.actionType));
  const hasBaseline = actions.some((action) => action.actionType === "BASELINE_DOC_WRITE" || action.actionType === "INDUSTRIAL_PACK_ENABLE");
  const hasArchive = actions.some((action) => action.actionType === "DOCUMENT_ARCHIVE_APPLY");
  const steps = [
    {
      step: "Pre-apply project state check",
      commandOrMethod: "node scripts/cli.mjs next .",
      requiredBeforeApply: "Yes",
      requiredAfterApply: "No",
      evidencePath: "apply-plans/<id>.md",
      owner: "Codex",
    },
  ];
  if (hasWorkflow) steps.push(verification("Workflow asset check", "node scripts/check-ai-workflow.mjs . --mode core"));
  if (hasBaseline) steps.push(verification("Baseline check", "node scripts/check-platform-baseline.mjs ."));
  if (hasArchive) steps.push(verification("Archive apply check", "node scripts/check-document-archive-apply.mjs ."));
  steps.push(verification("Post-apply verification", "<project verification command>"));
  return steps;
}

function verification(step, commandOrMethod) {
  return {
    step,
    commandOrMethod,
    requiredBeforeApply: "No",
    requiredAfterApply: "Yes",
    evidencePath: "final-reports/<id>.md",
    owner: "Codex",
  };
}

function decisionsFor(readinessState, actions) {
  const decisions = [
    {
      decision: "Approve apply scope",
      why: "Any write-capable action requires explicit approval.",
      options: "approve / narrow / reject",
      recommended: readinessState.state.startsWith("BLOCKED") ? "resolve blocker first" : "narrow if unclear",
      owner: "human",
      status: readinessState.outcome === "APPLY_PLAN_RECORDED" ? "NOT_REQUIRED" : "PENDING",
    },
  ];
  for (const action of actions.filter((item) => item.highRisk)) {
    decisions.push({
      decision: `Approve ${action.actionType}`,
      why: "This action touches a high-risk surface.",
      options: "approve separately / defer / reject",
      recommended: "defer unless owner approval exists",
      owner: "human",
      status: "PENDING",
    });
  }
  return decisions;
}

function readGitState(root) {
  if (!fs.existsSync(path.join(root, ".git"))) return { isRepo: false, dirty: false, summary: "not a git repo" };
  const result = spawnSync("git", ["-C", root, "status", "--porcelain"], { encoding: "utf8" });
  if (result.status !== 0) return { isRepo: true, dirty: false, summary: "git status unavailable" };
  const lines = result.stdout.split(/\r?\n/).filter(Boolean);
  return {
    isRepo: true,
    dirty: lines.length > 0,
    summary: lines.length > 0 ? `${lines.length} changed item(s)` : "clean",
  };
}

function printHuman(plan) {
  console.log("# Unified Apply Plan");
  console.log("");
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`One-sentence conclusion: ${plan.humanDecisionSummary.conclusion}`);
  console.log("");
  console.log(`Recommended choice: ${plan.humanDecisionSummary.recommendedChoice}`);
  console.log("");
  console.log(`Can Codex write now: ${plan.humanDecisionSummary.canCodexWriteNow}`);
  console.log("");
  console.log(`Need from human: ${plan.humanDecisionSummary.needFromHuman}`);
  console.log("");
  console.log(`If nothing is approved: ${plan.humanDecisionSummary.ifNothing}`);
  console.log("");
  console.log("## Apply Readiness");
  console.log("");
  printTable([
    ["Field", "Value"],
    ["State", code(plan.applyReadiness.state)],
    ["Can apply now?", plan.applyReadiness.canApplyNow],
    ["Can AI write now?", plan.applyReadiness.canAiWriteNow],
    ["Why", plan.applyReadiness.conclusion],
    ["Recommended next step", plan.applyReadiness.recommendedChoice],
  ]);
  console.log("");
  console.log("## Source Evidence");
  console.log("");
  printTable([
    ["Evidence", "Ref", "Status"],
    ...plan.sourceEvidence.map((item) => [item.evidence, item.ref, item.status]),
  ]);
  console.log("");
  console.log("## Planned Actions");
  console.log("");
  printTable([
    ["ID", "Action type", "Target paths", "Reason", "Status", "Will write now", "Approval required", "Rollback required"],
    ...plan.plannedActions.map((action) => [
      action.id,
      action.actionType,
      action.targetPaths.join(", "),
      action.reason,
      action.status,
      action.willWriteNow,
      action.approvalRequired,
      action.rollbackRequired,
    ]),
  ]);
  console.log("");
  console.log("## Human-Only / Blocked Actions");
  console.log("");
  printTable([
    ["ID", "Action type", "Reason", "Required owner", "Status"],
    ...(plan.humanOnlyOrBlockedActions.length > 0
      ? plan.humanOnlyOrBlockedActions.map((action) => [action.id, action.actionType, action.reason, action.requiredOwner, action.status])
      : [["None", "N/A", "No human-only or blocked actions were inferred.", "human", "NOT_APPLICABLE"]]),
  ]);
  console.log("");
  console.log("## Preconditions");
  console.log("");
  printTable([
    ["Precondition", "Status"],
    ...plan.preconditions.map((item) => [item.precondition, item.status]),
  ]);
  console.log("");
  console.log("## Backup / Rollback Plan");
  console.log("");
  printTable([
    ["Action", "Backup required", "Backup path", "Rollback step", "Rollback verification"],
    ...plan.backupRollbackPlan.map((item) => [item.action, item.backupRequired, item.backupPath, item.rollbackStep, item.rollbackVerification]),
  ]);
  console.log("");
  console.log("## Verification Plan");
  console.log("");
  printTable([
    ["Step", "Command or method", "Required before apply", "Required after apply", "Evidence path", "Owner"],
    ...plan.verificationPlan.map((item) => [item.step, item.commandOrMethod, item.requiredBeforeApply, item.requiredAfterApply, item.evidencePath, item.owner]),
  ]);
  console.log("");
  console.log("## Human Decisions Needed");
  console.log("");
  printTable([
    ["Decision", "Why it matters", "Options", "Recommended option", "Owner", "Status"],
    ...plan.humanDecisionsNeeded.map((item) => [item.decision, item.why, item.options, item.recommended, item.owner, item.status]),
  ]);
  console.log("");
  console.log("## Boundary");
  console.log("");
  console.log(`- This plan writes files now: ${plan.boundary.writesFilesNow}`);
  console.log(`- This plan authorizes apply: ${plan.boundary.authorizesApply}`);
  console.log(`- This plan approves implementation: ${plan.boundary.approvesImplementation}`);
  console.log(`- This plan approves release or production: ${plan.boundary.approvesReleaseOrProduction}`);
  console.log(`- This plan modifies CI or hooks now: ${plan.boundary.modifiesCiOrHooksNow}`);
  console.log(`- This plan deletes or archives files now: ${plan.boundary.deletesOrArchivesFilesNow}`);
  console.log(`- This plan changes source of truth now: ${plan.boundary.changesSourceOfTruthNow}`);
  console.log(`- This plan grants Codex permission to continue beyond scope: ${plan.boundary.grantsPermissionBeyondScope}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(code(plan.outcome));
}

function printTable(rows) {
  if (rows.length === 0) return;
  console.log(`| ${rows[0].map((cell) => escapeCell(cell)).join(" | ")} |`);
  console.log(`| ${rows[0].map(() => "---").join(" | ")} |`);
  for (const row of rows.slice(1)) console.log(`| ${row.map((cell) => escapeCell(cell)).join(" | ")} |`);
}

function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function splitList(value) {
  if (!value || value === true) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function code(value) {
  return `\`${value}\``;
}
