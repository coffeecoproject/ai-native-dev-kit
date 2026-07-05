#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "out"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const outputPath = args.out ? resolveOutputPath(projectRoot, args.out) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildReport(projectRoot, {
  intent: String(args.intent || "converge existing project governance"),
});

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport(root, options) {
  const workflowNext = resolveSource("Workflow Next", "workflow-next.mjs", root, ["--json"]);
  const nativeMigration = resolveSource("Native Migration", "resolve-native-migration.mjs", root, ["--json"]);
  const ruleReconciliation = resolveSource("Existing Rule Reconciliation", "resolve-existing-rule-reconciliation.mjs", root, ["--auto-native", "--json"]);
  const releasePlan = resolveSource("Release Plan", "resolve-release-plan.mjs", root, ["--intent", options.intent, "--json"]);

  const nativeEvidence = nativeMigration.data?.structuredEvidence || {};
  const reconciliationEvidence = ruleReconciliation.data?.structuredEvidence || {};
  const releaseEvidence = releasePlan.data?.machineReadableEvidence || {};
  const projectState = projectStateFor(nativeEvidence, ruleReconciliation.data, workflowNext.data);
  const coverage = reconciliationEvidence.rule_reconciliation_coverage || {};
  const omittedRules = Number.isInteger(coverage.omitted_rules) ? coverage.omitted_rules : 0;
  const dirty = projectState === "DIRTY_WORKTREE_PROJECT" || hasDirtySignal(workflowNext.data);
  const sourceSystems = [workflowNext, nativeMigration, ruleReconciliation, releasePlan];
  const blocked = blockedReasons({ dirty, omittedRules, releaseEvidence, reconciliationEvidence, sourceSystems });
  const convergenceState = convergenceStateFor({ dirty, omittedRules, blocked, projectState });
  const dimensions = dimensionsFor({ dirty, omittedRules, projectState, reconciliationEvidence, releaseEvidence });
  const nextSafeStep = nextSafeStepFor(convergenceState);

  const structuredEvidence = {
    schema_version: "1.70.1",
    artifact_type: "governance_convergence_report",
    project_state: projectState,
    intentos_operating_mode: "ACTIVE",
    operating_mode_grants_write_permission: "No",
    can_codex_write_now: "No",
    convergence_state: convergenceState,
    source_systems: sourceSystemsEvidence({ workflowNext, nativeMigration, ruleReconciliation, releasePlan }),
    dimensions,
    audit_bridge: {
      historical_evidence_status: "preserve",
      convergence_anchor_required: "Yes",
      post_adoption_evidence_model: "IntentOS artifacts",
      rewrite_history: "No",
    },
    ai_log_policy: {
      write_ai_logs_by_default: "No",
      allowed_for_governance_decisions: "Yes",
      routine_task_logging: "No",
      routine_command_logging: "No",
    },
    blocked,
    next_safe_step: nextSafeStep,
    boundary: {
      writes_target_files: "No",
      authorizes_target_file_writes: "No",
      approves_governance_replacement: "No",
      approves_release_or_production: "No",
      modifies_ci_or_hooks: "No",
      rewrites_history: "No",
      routine_ai_log_spam: "No",
      maximizes_migration: "No",
    },
    outcome: convergenceState,
  };

  return {
    reportType: "GOVERNANCE_CONVERGENCE_REPORT",
    schemaVersion: "1.70.1",
    generatedBy: "scripts/resolve-governance-convergence.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    intent: options.intent,
    readOnly: true,
    humanSummary: {
      projectState,
      intentosOperatingMode: "ACTIVE",
      operatingModeGrantsWritePermission: "No",
      convergenceState,
      canCodexWriteNow: "No",
      convergenceAuthority: "DERIVED_READ_ONLY",
      approvesGovernanceReplacement: "No",
      approvesReleaseOrProduction: "No",
      rewritesHistory: "No",
    },
    sourceSystems,
    dimensions,
    auditBridge: structuredEvidence.audit_bridge,
    aiLogPolicy: structuredEvidence.ai_log_policy,
    protectedAuthority: protectedAuthorityRows(),
    proposedNextStep: nextSafeStep,
    boundaries: structuredEvidence.boundary,
    structuredEvidence,
    outcome: convergenceState,
  };
}

function resolveSource(name, script, root, extraArgs) {
  const result = spawnSync(process.execPath, [
    path.join(scriptDir, script),
    root,
    ...extraArgs,
  ], {
    cwd: path.resolve(scriptDir, ".."),
    encoding: "utf8",
  });
  const parsed = parseJson(result.stdout);
  const ok = result.status === 0 && parsed;
  return {
    name,
    status: ok ? sourceStatusFor(name, parsed) : "BLOCKED",
    ref: ok ? `generated:${script.replace(/^resolve-/, "").replace(/\.mjs$/, "")}` : script,
    contribution: ok ? sourceContribution(name, parsed) : normalizeLine(result.stderr || result.stdout || `${name} unavailable`),
    data: ok ? parsed : null,
  };
}

function sourceStatusFor(name, parsed) {
  if (hasDirtyProjectState(parsed)) return "NEEDS_INPUT";
  if (name === "Workflow Next") {
    const stopActions = new Set([
      "SELECT_OR_CREATE_TARGET",
      "REVIEW_GOVERNANCE_MIGRATION",
      "RUN_ADOPTION_ASSESSMENT",
      "REVIEW_DIRTY_WORKTREE",
      "REVIEW_EXISTING_GOVERNANCE_MAP",
      "WAIT_FOR_ADAPTER_CONFIRMATION",
    ]);
    return parsed.mustStopForHuman === "yes" && stopActions.has(parsed.nextAction) ? "NEEDS_INPUT" : "RECORDED";
  }
  if (name === "Native Migration") {
    const posture = parsed.posture || parsed.migrationMode || parsed.structuredEvidence?.posture;
    const state = parsed.projectState?.state || parsed.structuredEvidence?.project_state;
    return /BLOCKED|NEEDS_OWNER/i.test(`${posture || ""} ${state || ""}`) ? "NEEDS_INPUT" : "RECORDED";
  }
  if (name === "Existing Rule Reconciliation") {
    const recommendation = parsed.structuredEvidence?.native_adoption_decision?.recommendation || parsed.outcome || "";
    const coverage = parsed.structuredEvidence?.rule_reconciliation_coverage || {};
    const omittedRules = Number.isInteger(coverage.omitted_rules) ? coverage.omitted_rules : 0;
    return omittedRules > 0 || /^(BLOCKED|NEEDS_)/i.test(String(recommendation)) ? "NEEDS_INPUT" : "RECORDED";
  }
  if (name === "Release Plan") {
    const state = parsed.machineReadableEvidence?.release_plan?.state || parsed.humanSummary?.releasePlanState || parsed.outcome || "";
    return /^(BLOCKED|NEEDS_)/i.test(String(state)) ? "NEEDS_INPUT" : "RECORDED";
  }
  return "RECORDED";
}

function hasDirtyProjectState(parsed) {
  const states = [
    parsed.projectState,
    parsed.projectState?.state,
    parsed.structuredEvidence?.project_state,
    parsed.humanSummary?.projectState,
  ].filter(Boolean).map(String);
  const tags = Array.isArray(parsed.projectStateTags) ? parsed.projectStateTags.map(String) : [];
  return [...states, ...tags].includes("DIRTY_WORKTREE_PROJECT");
}

function sourceContribution(name, parsed) {
  if (name === "Native Migration") {
    return `project_state=${parsed.structuredEvidence?.project_state || parsed.projectState || "unknown"}`;
  }
  if (name === "Existing Rule Reconciliation") {
    const coverage = parsed.structuredEvidence?.rule_reconciliation_coverage || {};
    const decision = parsed.structuredEvidence?.native_adoption_decision?.recommendation || parsed.outcome || "recorded";
    return `recommendation=${decision}; omitted_rules=${coverage.omitted_rules ?? 0}`;
  }
  if (name === "Release Plan") {
    return `release_plan_state=${parsed.humanSummary?.releasePlanState || parsed.outcome || "recorded"}`;
  }
  return parsed.outcome || parsed.nextAction || parsed.projectState || parsed.reportType || "recorded";
}

function projectStateFor(nativeEvidence, reconciliation, workflowNext) {
  if (nativeEvidence.project_state) return nativeEvidence.project_state;
  if (reconciliation?.projectState) return reconciliation.projectState;
  if (workflowNext?.projectState) return workflowNext.projectState;
  if (hasOldProjectSignals(projectRoot)) return "EXISTING_GOVERNED_PROJECT";
  return "EXISTING_PROJECT";
}

function hasDirtySignal(data) {
  return JSON.stringify(data || {}).includes("DIRTY_WORKTREE");
}

function hasOldProjectSignals(root) {
  return [
    "AGENTS.md",
    ".github/workflows",
    "scripts/guard",
    "docs/WEB_ENGINEERING_BASELINE.md",
    "docs/WEB_ENVIRONMENT_BASELINE.md",
    "docs/WEB_RELEASE_ROLLBACK_BASELINE.md",
  ].some((marker) => fs.existsSync(path.join(root, marker)));
}

function sourceSystemsEvidence({ workflowNext, nativeMigration, ruleReconciliation, releasePlan }) {
  return {
    workflow_next: sourceEvidence(workflowNext),
    native_migration: sourceEvidence(nativeMigration),
    existing_rule_reconciliation: sourceEvidence(ruleReconciliation),
    release_plan: sourceEvidence(releasePlan),
  };
}

function sourceEvidence(source) {
  return {
    status: source.status,
    ref: source.ref,
    contribution: source.contribution,
  };
}

function blockedReasons(context) {
  const blocked = [];
  if (context.dirty) blocked.push("dirty worktree");
  if (context.omittedRules > 0) blocked.push("omitted extracted rules");
  for (const source of context.sourceSystems || []) {
    if (source.status === "BLOCKED" || source.status === "NEEDS_INPUT") {
      blocked.push(`upstream source requires input: ${source.name}`);
    }
  }
  const releaseText = JSON.stringify(context.releaseEvidence || {});
  if (/release owner.*missing|rollback.*missing|monitoring.*missing/i.test(releaseText)) {
    blocked.push("release owner / rollback / monitoring mapping incomplete");
  }
  const decision = context.reconciliationEvidence?.native_adoption_decision?.recommendation || "";
  if (String(decision).startsWith("BLOCKED")) blocked.push(`native adoption decision: ${decision}`);
  return [...new Set(blocked)];
}

function convergenceStateFor({ dirty, omittedRules, blocked, projectState }) {
  if (dirty || projectState === "DIRTY_WORKTREE_PROJECT") return "CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE";
  if (omittedRules > 0) return "CONVERGENCE_BLOCKED_BY_RULE_COVERAGE";
  if (blocked.some((item) => /owner|authority|BLOCKED_NEEDS_OWNER/i.test(item))) return "CONVERGENCE_BLOCKED_BY_PROJECT_AUTHORITY";
  if (blocked.some((item) => /upstream source requires input/i.test(item))) return "CONVERGENCE_BLOCKED_BY_UPSTREAM_EVIDENCE";
  if (/EXISTING_GOVERNED_PROJECT|EXISTING_PRODUCTION_PROJECT/.test(projectState)) return "CONVERGENCE_READY_FOR_PLAN";
  return "CONVERGENCE_PARTIAL";
}

function dimensionsFor({ dirty, omittedRules, projectState, reconciliationEvidence }) {
  const blockedByRules = omittedRules > 0;
  const dirtyRecommendation = dirty ? "BLOCKED_NEEDS_OWNER" : null;
  const hasEngineering = JSON.stringify(reconciliationEvidence || {}).includes("ENGINEERING_BASELINE");
  const releaseOwned = /PRODUCTION|GOVERNED/.test(projectState);
  return [
    dim("workflow", dirty ? "dirty worktree" : "old workflow present", "IntentOS daily workflow", dirtyRecommendation || "MERGE_AFTER_REVIEW"),
    dim("baseline", hasEngineering ? "engineering baseline exists" : "baseline needs mapping", "best available baseline rule", blockedByRules ? "BLOCKED_BY_RULE_COVERAGE" : "KEEP_EXISTING_STRICTER"),
    dim("audit", "pre-IntentOS history exists", "convergence anchor then IntentOS artifacts", "MAP_TO_INTENTOS_ARTIFACT"),
    dim("release", releaseOwned ? "release / production rules project-owned" : "release ownership unknown", "project-owned release with IntentOS view", releaseOwned ? "KEEP_PROJECT_OWNED" : "BLOCKED_NEEDS_OWNER"),
    dim("ci_hooks", "existing CI / hook guards may exist", "compare before mutation", "KEEP_PROJECT_OWNED"),
    dim("documents", "docs need source-of-truth mapping", "document lifecycle map", "MERGE_AFTER_REVIEW"),
    dim("work_queue", "old TODOs / interrupted work may exist", "IntentOS Work Queue", "MAP_TO_INTENTOS_ARTIFACT"),
    dim("ai_logs", "logging policy unclear", "important governance notes only", "NO_ACTION"),
    dim("risk_authority", "protected decisions project-owned", "preserve protected authority", "KEEP_PROJECT_OWNED"),
  ];
}

function dim(dimension, currentState, targetState, recommendation) {
  return {
    dimension,
    current_state: currentState,
    target_state: targetState,
    recommendation,
    human_decision_required: "Yes",
    write_requires_apply_plan: "Yes",
  };
}

function nextSafeStepFor(state) {
  if (state === "CONVERGENCE_BLOCKED_BY_DIRTY_WORKTREE") {
    return "classify current dirty worktree before convergence apply planning";
  }
  if (state === "CONVERGENCE_BLOCKED_BY_RULE_COVERAGE") {
    return "review omitted extracted rules before Unified Apply Plan";
  }
  if (state === "CONVERGENCE_BLOCKED_BY_PROJECT_AUTHORITY") {
    return "confirm project owners for protected authority before apply planning";
  }
  if (state === "CONVERGENCE_BLOCKED_BY_UPSTREAM_EVIDENCE") {
    return "resolve upstream source-system evidence before convergence apply planning";
  }
  return "review convergence report before Unified Apply Plan";
}

function protectedAuthorityRows() {
  return [
    { surface: "release / production", owner: "HUMAN_OR_EXTERNAL_SYSTEM", handling: "Keep project-owned SOP and release owner." },
    { surface: "CI / hooks", owner: "PROJECT_OWNED", handling: "Compare and plan before mutation." },
    { surface: "data / permission / compliance", owner: "PROJECT_OWNED", handling: "Block until owner confirms." },
  ];
}

function parseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function normalizeLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 240);
}

function humanReportText(report) {
  const lines = [];
  const push = (line = "") => lines.push(line);
  push("# Governance Convergence Report");
  push("");
  push("This report is a derived read-only view. It is not permission to change target project files.");
  push("");
  push("## Human Summary");
  pushTable(lines, ["Field", "Value"], [
    ["Project State", code(report.humanSummary.projectState)],
    ["IntentOS Operating Mode", code(report.humanSummary.intentosOperatingMode)],
    ["Operating Mode Grants Write Permission", code(report.humanSummary.operatingModeGrantsWritePermission)],
    ["Convergence State", code(report.humanSummary.convergenceState)],
    ["Can Codex write now", code(report.humanSummary.canCodexWriteNow)],
    ["Convergence Authority", code(report.humanSummary.convergenceAuthority)],
    ["Approves Governance Replacement", code(report.humanSummary.approvesGovernanceReplacement)],
    ["Approves Release Or Production", code(report.humanSummary.approvesReleaseOrProduction)],
    ["Rewrites History", code(report.humanSummary.rewritesHistory)],
  ]);
  push("");
  push("## Source Systems");
  pushTable(lines, ["Source System", "Ref", "Status", "Contribution"], report.sourceSystems.map((item) => [
    item.name,
    code(item.ref),
    code(item.status),
    item.contribution,
  ]));
  push("");
  push("## Convergence Dimensions");
  pushTable(lines, ["Dimension", "Current State", "Target State", "Recommendation", "Human Decision Required", "Write Requires Apply Plan"], report.dimensions.map((item) => [
    item.dimension,
    item.current_state,
    item.target_state,
    code(item.recommendation),
    code(item.human_decision_required),
    code(item.write_requires_apply_plan),
  ]));
  push("");
  push("## Audit Bridge");
  pushTable(lines, ["Field", "Value"], [
    ["Historical Evidence Status", code(report.auditBridge.historical_evidence_status)],
    ["Convergence Anchor Required", code(report.auditBridge.convergence_anchor_required)],
    ["Post-Adoption Evidence Model", code(report.auditBridge.post_adoption_evidence_model)],
    ["Rewrite History", code(report.auditBridge.rewrite_history)],
  ]);
  push("");
  push("## AI Log Policy");
  pushTable(lines, ["Field", "Value"], [
    ["Write AI Logs By Default", code(report.aiLogPolicy.write_ai_logs_by_default)],
    ["Allowed For Governance Decisions", code(report.aiLogPolicy.allowed_for_governance_decisions)],
    ["Routine Task Logging", code(report.aiLogPolicy.routine_task_logging)],
    ["Routine Command Logging", code(report.aiLogPolicy.routine_command_logging)],
  ]);
  push("");
  push("## Protected Authority");
  pushTable(lines, ["Surface", "Owner", "Handling"], report.protectedAuthority.map((item) => [
    item.surface,
    code(item.owner),
    item.handling,
  ]));
  push("");
  push("## Proposed Next Step");
  push("");
  push(report.proposedNextStep);
  push("");
  push("## Boundaries");
  push("");
  push("- This report writes target files: No");
  push("- This report authorizes target-file writes: No");
  push("- This report approves governance replacement: No");
  push("- This report approves implementation: No");
  push("- This report approves release or production: No");
  push("- This report modifies CI or hooks: No");
  push("- This report rewrites history: No");
  push("- This report turns ai-logs into routine command logs: No");
  push("- This report maximizes migration: No");
  push("");
  push("## Machine-Readable Evidence");
  push("");
  push("```json");
  push(JSON.stringify(report.structuredEvidence, null, 2));
  push("```");
  push("");
  push("## Outcome");
  push("");
  push(code(report.outcome));
  return `${lines.join("\n")}\n`;
}

function pushTable(lines, headers, rows) {
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) lines.push(`| ${row.join(" | ")} |`);
}

function code(value) {
  return `\`${String(value)}\``;
}

function resolveOutputPath(root, value) {
  if (value === true || !String(value || "").trim()) {
    console.error("FAIL --out requires a relative report path");
    process.exit(1);
  }
  const raw = String(value);
  if (path.isAbsolute(raw) || raw.includes("..")) {
    console.error("FAIL --out must be a relative path inside the target project");
    process.exit(1);
  }
  return path.resolve(root, raw);
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output.endsWith("\n") ? output : `${output}\n`);
}
