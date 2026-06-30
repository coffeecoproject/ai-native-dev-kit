#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "plan", "approval", "git-state"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");

const lowRiskActionsSet = new Set([
  "WORKFLOW_ASSET_UPDATE",
  "BASELINE_DOC_WRITE",
  "EXISTING_PROJECT_BRIDGE_DOC",
  "PR_TEMPLATE_GOVERNANCE",
  "AGENTS_GOVERNANCE",
]);

const humanOnlyActionsSet = new Set([
  "BUSINESS_CODE_CHANGE",
  "HOOK_OR_CI_CHANGE",
  "AUTOMATION_CHANGE",
  "DOCUMENT_ARCHIVE_APPLY",
  "INDUSTRIAL_PACK_ENABLE",
  "DATA_OR_MIGRATION_CHANGE",
  "SECRET_OR_ENV_CHANGE",
  "PRODUCTION_CONFIG_CHANGE",
  "PAYMENT_OR_VALUE_TRANSFER_CHANGE",
  "SECURITY_PRIVACY_COMPLIANCE_CHANGE",
  "LEGAL_LICENSE_POLICY_CHANGE",
]);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildReport(projectRoot, args);
if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildReport(root, options) {
  const planRef = stringArg(options.plan);
  const plan = readPlan(root, planRef);
  const git = readGitState(root, options["git-state"]);
  const approval = classifyApproval(options.approval);
  const actionTypes = plan.exists ? extractActionTypes(plan.content) : [];
  const highRiskActions = actionTypes.filter(isHumanOnlyAction);
  const lowRiskActions = actionTypes.filter((item) => lowRiskActionsSet.has(item));
  const targetPathsBounded = plan.exists && hasBoundedTargets(plan.content);
  const backupReady = plan.exists && /Backup \/ Rollback Plan/i.test(plan.content) && /Rollback/i.test(plan.content);
  const verificationReady = plan.exists && /Verification Plan/i.test(plan.content) && /Required after apply|Post-apply/i.test(plan.content);
  const planSafe = plan.exists
    && /This plan authorizes apply:\s*No/i.test(plan.content)
    && /This plan writes files now:\s*No/i.test(plan.content)
    && (/Can Codex write now:\s*No/i.test(plan.content) || /Can AI write now\?\s*\|\s*No/i.test(plan.content));

  const blockers = [];
  if (!fs.existsSync(root)) blockers.push("Target project path is missing.");
  if (!plan.exists) blockers.push("Unified Apply Plan is missing or unreadable.");
  if (plan.exists && !planSafe) blockers.push("Unified Apply Plan does not preserve no-write / no-apply boundaries.");
  if (git.dirty) blockers.push("Git worktree is dirty or not proven safe.");
  if (plan.exists && !targetPathsBounded) blockers.push("Target paths are not bounded.");
  if (plan.exists && !backupReady) blockers.push("Backup / rollback readiness is missing.");
  if (plan.exists && !verificationReady) blockers.push("Verification readiness is missing.");
  if (highRiskActions.length > 0) blockers.push("Plan contains human-only high-risk actions.");

  const state = readinessState({ plan, blockers, highRiskActions, lowRiskActions });
  const candidate = state === "READY_FOR_HUMAN_APPROVED_APPLY" ? "Yes" : "No";

  return {
    reportType: "CONTROLLED_APPLY_READINESS",
    generatedBy: "scripts/resolve-controlled-apply-readiness.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanDecisionSummary: {
      conclusion: state,
      recommendedChoice: recommendedChoiceFor(state),
      canCodexApplyNow: "No",
      needFromHuman: needFromHumanFor(state, approval),
    },
    applyPlanReference: {
      unifiedApplyPlan: plan.ref || "not provided",
      planReadable: plan.exists ? "Yes" : "No",
      planAuthorizesApply: plan.exists && /This plan authorizes apply:\s*Yes/i.test(plan.content) ? "Yes" : "No",
      planWritesFilesNow: plan.exists && /This plan writes files now:\s*Yes/i.test(plan.content) ? "Yes" : "No",
      planSaysCodexCanWriteNow: plan.exists && /Can (Codex|AI) write now:?\s*Yes/i.test(plan.content) ? "Yes" : "No",
    },
    readinessState: {
      state,
      candidateForHumanApprovedApply: candidate,
      requiresExplicitHumanApproval: "Yes",
      canProceedWithoutNewApproval: "No",
    },
    actionClassification: actionTypes.length > 0
      ? actionTypes.map((type) => classifyAction(type, plan.content))
      : [classifyAction("NO_ACTION", plan.content)],
    preconditions: {
      applyPlanExists: plan.exists ? "pass" : "fail",
      gitStateSafe: git.dirty ? "fail" : "pass",
      targetPathsBounded: targetPathsBounded ? "pass" : "fail",
      backupPlanExists: backupReady ? "pass" : "fail",
      rollbackPlanExists: backupReady ? "pass" : "fail",
      verificationPlanExists: verificationReady ? "pass" : "fail",
      humanApprovalRecorded: approval === "explicit" ? "pass" : "fail",
    },
    humanOnlyOrBlockedItems: humanOnlyOrBlockedItems(blockers, highRiskActions),
    backupRollbackReadiness: {
      backupRequired: plan.exists && !plan.content.includes("| Backup required | No |") ? "Yes" : "No",
      backupPath: extractTableValue(plan.content, "Backup path") || "not provided",
      rollbackStep: extractTableValue(plan.content, "Rollback step") || "not provided",
      rollbackVerification: extractTableValue(plan.content, "Rollback verification") || "not provided",
    },
    verificationReadiness: {
      preApplyVerification: extractVerification(plan.content, "pre") || "not provided",
      postApplyVerification: extractVerification(plan.content, "post") || "not provided",
      evidencePath: extractTableValue(plan.content, "Evidence path") || "not provided",
      missingVerification: verificationReady ? "No" : "Yes",
    },
    boundary: {
      writesFilesNow: "No",
      authorizesApply: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      installsHooksOrChangesCi: "No",
      changesSourceOfTruth: "No",
      enablesHighRiskActions: "No",
    },
    outcome: state === "BLOCKED" || state === "NO_APPLY_PLAN" ? "BLOCKED" : state === "READY_FOR_HUMAN_APPROVED_APPLY" ? "READINESS_RECORDED" : "NEEDS_HUMAN_DECISION",
  };
}

function stringArg(value) {
  if (!value || value === true) return "";
  return String(value).trim();
}

function readPlan(root, planRef) {
  if (!planRef) return { ref: "", exists: false, content: "" };
  const resolved = path.isAbsolute(planRef) ? planRef : path.resolve(root, planRef);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return { ref: planRef, exists: false, content: "" };
  return { ref: planRef, exists: true, content: fs.readFileSync(resolved, "utf8") };
}

function readGitState(root, override) {
  if (override === "clean") return { dirty: false, source: "override-clean" };
  if (override === "dirty") return { dirty: true, source: "override-dirty" };
  if (!fs.existsSync(root)) return { dirty: true, source: "missing-target" };
  const result = spawnSync("git", ["-C", root, "status", "--short"], { encoding: "utf8" });
  if (result.status !== 0) return { dirty: false, source: "not-git-or-unavailable" };
  return { dirty: result.stdout.trim().length > 0, source: "git status --short" };
}

function classifyApproval(value) {
  const text = stringArg(value).toLowerCase();
  if (/^(explicit|approved|human-approved|yes)$/.test(text)) return "explicit";
  return "missing";
}

function extractActionTypes(content) {
  const matches = [...String(content || "").matchAll(/\b[A-Z][A-Z0-9_]{2,}\b/g)]
    .map((item) => item[0])
    .filter((item) => lowRiskActionsSet.has(item) || humanOnlyActionsSet.has(item));
  return [...new Set(matches)];
}

function hasBoundedTargets(content) {
  const text = String(content || "");
  if (/PENDING_TARGET_CONFIRMATION|Target paths\s*\|\s*(not provided|N\/A)/i.test(text)) return false;
  return /Target paths/i.test(text) && !/\bsrc\/\*\b/.test(text);
}

function isHumanOnlyAction(type) {
  return humanOnlyActionsSet.has(type);
}

function readinessState({ plan, blockers, highRiskActions, lowRiskActions }) {
  if (!plan.exists) return "NO_APPLY_PLAN";
  if (blockers.some((item) => /human-only high-risk/i.test(item)) || highRiskActions.length > 0) return "HUMAN_ONLY";
  if (blockers.length > 0) return "BLOCKED";
  if (lowRiskActions.length === 0) return "NOT_READY";
  return "READY_FOR_HUMAN_APPROVED_APPLY";
}

function classifyAction(type, content) {
  if (type === "NO_ACTION") {
    return {
      actionType: type,
      targetPaths: "N/A",
      classification: "BLOCKED",
      reason: "No apply action was found.",
    };
  }
  if (humanOnlyActionsSet.has(type)) {
    return {
      actionType: type,
      targetPaths: extractTargetPathsFor(type, content),
      classification: "HUMAN_ONLY",
      reason: "This action type is never eligible for Codex-controlled apply.",
    };
  }
  if (lowRiskActionsSet.has(type)) {
    return {
      actionType: type,
      targetPaths: extractTargetPathsFor(type, content),
      classification: "LOW_RISK_CANDIDATE",
      reason: "This action may be considered only after explicit human approval.",
    };
  }
  return {
    actionType: type,
    targetPaths: extractTargetPathsFor(type, content),
    classification: "BLOCKED",
    reason: "Unknown action type.",
  };
}

function extractTargetPathsFor(type, content) {
  const line = String(content || "").split("\n").find((item) => item.includes(type));
  if (!line) return "not provided";
  const cells = line.split("|").map((item) => item.trim()).filter(Boolean);
  return cells[2] || cells[1] || "not provided";
}

function humanOnlyOrBlockedItems(blockers, highRiskActions) {
  const items = blockers.map((blocker) => ({ item: blocker, reason: blocker, owner: "Human" }));
  for (const action of highRiskActions) {
    items.push({
      item: action,
      reason: "High-risk action is human-only.",
      owner: "Human",
    });
  }
  if (items.length === 0) {
    items.push({
      item: "Actual apply execution",
      reason: "Explicit human approval is still required before any future apply.",
      owner: "Human",
    });
  }
  return items;
}

function recommendedChoiceFor(state) {
  const choices = {
    NO_APPLY_PLAN: "Generate or provide one Unified Apply Plan first.",
    NOT_READY: "Complete missing readiness evidence before approval.",
    READY_FOR_HUMAN_APPROVED_APPLY: "Review the report and provide explicit approval only if you accept the bounded plan.",
    HUMAN_ONLY: "Assign the action to a human owner or specialized workflow.",
    BLOCKED: "Resolve blockers before considering apply.",
  };
  return choices[state] || "Review manually.";
}

function needFromHumanFor(state, approval) {
  if (state === "READY_FOR_HUMAN_APPROVED_APPLY" && approval !== "explicit") {
    return "Explicit approval is still required before any future controlled apply.";
  }
  if (state === "HUMAN_ONLY") return "A human owner must execute or redesign this action.";
  if (state === "BLOCKED" || state === "NOT_READY" || state === "NO_APPLY_PLAN") return "Resolve the missing or blocked readiness items.";
  return "Review the readiness report.";
}

function extractTableValue(content, key) {
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(key)}\\s*\\|\\s*([^|]+)\\|`, "i");
  const match = String(content || "").match(pattern);
  return match ? match[1].trim() : "";
}

function extractVerification(content, kind) {
  const text = String(content || "");
  const pattern = kind === "pre"
    ? /\|\s*Pre-apply[^|]*\|\s*([^|]+)\|/i
    : /\|\s*Post-apply[^|]*\|\s*([^|]+)\|/i;
  const match = text.match(pattern);
  if (match) return match[1].trim();
  if (/Verification Plan/i.test(text)) return "See Unified Apply Plan verification table";
  return "";
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function printHuman(report) {
  console.log("# Controlled Apply Readiness Report");
  console.log("");
  section("Human Decision Summary");
  table([
    ["Conclusion", code(report.humanDecisionSummary.conclusion)],
    ["Recommended choice", report.humanDecisionSummary.recommendedChoice],
    ["Can Codex apply now", report.humanDecisionSummary.canCodexApplyNow],
    ["What I need from you", report.humanDecisionSummary.needFromHuman],
  ]);
  section("Apply Plan Reference");
  table([
    ["Unified Apply Plan", report.applyPlanReference.unifiedApplyPlan],
    ["Plan readable", report.applyPlanReference.planReadable],
    ["Plan authorizes apply", report.applyPlanReference.planAuthorizesApply],
    ["Plan writes files now", report.applyPlanReference.planWritesFilesNow],
    ["Plan says Codex can write now", report.applyPlanReference.planSaysCodexCanWriteNow],
  ]);
  section("Readiness State");
  table([
    ["State", code(report.readinessState.state)],
    ["Candidate for human-approved apply", report.readinessState.candidateForHumanApprovedApply],
    ["Requires explicit human approval", report.readinessState.requiresExplicitHumanApproval],
    ["Can proceed without new approval", report.readinessState.canProceedWithoutNewApproval],
  ]);
  section("Action Classification");
  markdownTable(["Action type", "Target paths", "Classification", "Reason"], report.actionClassification.map((item) => [
    code(item.actionType),
    item.targetPaths,
    item.classification,
    item.reason,
  ]));
  section("Preconditions");
  markdownTable(["Precondition", "Status", "Evidence"], Object.entries(report.preconditions).map(([key, value]) => [
    key,
    value,
    key === "applyPlanExists" ? report.applyPlanReference.unifiedApplyPlan : "readiness resolver",
  ]));
  section("Human-Only / Blocked Items");
  markdownTable(["Item", "Reason", "Owner"], report.humanOnlyOrBlockedItems.map((item) => [item.item, item.reason, item.owner]));
  section("Backup / Rollback Readiness");
  table([
    ["Backup required", report.backupRollbackReadiness.backupRequired],
    ["Backup path", report.backupRollbackReadiness.backupPath],
    ["Rollback step", report.backupRollbackReadiness.rollbackStep],
    ["Rollback verification", report.backupRollbackReadiness.rollbackVerification],
  ]);
  section("Verification Readiness");
  table([
    ["Pre-apply verification", report.verificationReadiness.preApplyVerification],
    ["Post-apply verification", report.verificationReadiness.postApplyVerification],
    ["Evidence path", report.verificationReadiness.evidencePath],
    ["Missing verification", report.verificationReadiness.missingVerification],
  ]);
  section("Boundary");
  console.log("- This readiness report writes files now: No");
  console.log("- This readiness report authorizes apply: No");
  console.log("- This readiness report approves implementation: No");
  console.log("- This readiness report approves release or production: No");
  console.log("- This readiness report installs hooks or changes CI: No");
  console.log("- This readiness report changes source of truth: No");
  console.log("- This readiness report enables high-risk actions: No");
  section("Outcome");
  console.log(code(report.outcome));
}

function section(name) {
  console.log("");
  console.log(`## ${name}`);
  console.log("");
}

function table(rows) {
  markdownTable(["Field", "Value"], rows);
}

function markdownTable(headers, rows) {
  console.log(`| ${headers.join(" | ")} |`);
  console.log(`|${headers.map(() => "---").join("|")}|`);
  for (const row of rows) console.log(`| ${row.join(" | ")} |`);
}

function code(value) {
  return `\`${value}\``;
}
