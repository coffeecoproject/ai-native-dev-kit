#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { createEvidenceAuthorityBinding, isFileEvidenceRef } from "./lib/evidence-authority.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "task", "kind", "base", "cached", "out"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const schemaVersion = "1.74.0";
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
  intent: String(args.intent || args._[1] || "verify execution completion"),
  task: String(args.task || "task:current"),
  kind: String(args.kind || ""),
  base: String(args.base || ""),
  cached: Boolean(args.cached),
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
  const executionKind = classifyExecutionKind(root, options);
  const actualDiff = collectActualDiff(root, options);
  const sourceSystems = collectSourceSystems(root, options);
  const patchAssessment = assessPatch(executionKind, actualDiff, options);
  const completionContract = buildCompletionContract(executionKind, options);
  const plannedImpactMap = buildImpactMap(executionKind, sourceSystems);
  const evidenceBindings = buildEvidenceBindings(completionContract);
  const review = buildReview(root, executionKind, sourceSystems);
  const state = chooseState({ executionKind, actualDiff, sourceSystems, patchAssessment, completionContract, plannedImpactMap, evidenceBindings, review });
  const canClaimDone = state === "VERIFIED_DONE" ? "Yes" : "No";
  const safeNextStep = nextStepFor(state);
  const structuredEvidence = {
    schema_version: schemaVersion,
    artifact_type: "execution_assurance_report",
    execution_kind: executionKind,
    task_ref: options.task,
    intent_digest: digest(options.intent),
    assurance_state: state,
    can_claim_done: canClaimDone,
    can_codex_write_now: "No",
    intent_lock: {
      user_intent: options.intent,
      normalized_intent: normalizeIntent(options.intent, executionKind),
      in_scope: scopeFor(executionKind),
      out_of_scope: ["release approval", "production deploy", "secrets", "payment", "legal/compliance decision"],
    },
    completion_contract: completionContract,
    planned_impact_map: plannedImpactMap,
    execution_plan: {
      plan_ref: options.task,
      planned_target_paths: actualDiff.changed_files.length > 0 ? ["REQUIRES_EXPLICIT_EXECUTION_PLAN"] : ["N/A"],
      risk_classification: riskFor(executionKind),
      approval_refs: [],
      restore_strategy: "Use task-scoped revert or reviewed restore plan if verification fails.",
    },
    actual_diff: actualDiff,
    evidence_bindings: evidenceBindings,
    review,
    patch_assessment: patchAssessment,
    source_systems: sourceSystems,
    pending_human_decisions: pendingDecisionsFor(state),
    forbidden_claims: [],
    boundary: {
      writes_target_files: "No",
      authorizes_target_file_writes: "No",
      approves_implementation_beyond_recorded_scope: "No",
      approves_commit_or_push: "No",
      approves_release_or_production: "No",
      replaces_source_systems: "No",
      proves_product_correctness: "No",
      transfers_project_authority_to_intentos: "No",
    },
    outcome: state,
  };
  structuredEvidence.authority_binding = createEvidenceAuthorityBinding(root, {
    fromFile: outputPath,
    taskRef: structuredEvidence.task_ref,
    intentDigest: structuredEvidence.intent_digest,
    sourceRefs: collectFileEvidenceRefs(structuredEvidence),
  });
  return {
    reportType: "EXECUTION_ASSURANCE",
    schemaVersion,
    generatedBy: "scripts/resolve-execution-assurance.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      executionKind,
      assuranceState: state,
      canClaimDone,
      canCodexWriteNow: "No",
      safeNextStep,
    },
    structuredEvidence,
    outcome: state,
  };
}

function collectFileEvidenceRefs(value) {
  const refs = new Set();
  const visit = (item, key = "") => {
    if (key === "authority_binding") return;
    if (typeof item === "string") {
      if (isFileEvidenceRef(item)) refs.add(item);
      return;
    }
    if (Array.isArray(item)) {
      item.forEach((child) => visit(child));
      return;
    }
    if (item && typeof item === "object") {
      Object.entries(item).forEach(([childKey, child]) => visit(child, childKey));
    }
  };
  visit(value);
  return [...refs];
}

function classifyExecutionKind(root, options) {
  const explicit = options.kind.toUpperCase();
  const allowed = new Set([
    "FEATURE_IMPLEMENTATION",
    "BUG_FIX",
    "SAFE_PATCH",
    "CONTROLLED_PATCH",
    "ADOPTION_MIGRATION",
    "BASELINE_SETUP",
    "DOCUMENT_GOVERNANCE",
    "RELEASE_PREPARATION",
    "WORKFLOW_CAPABILITY",
    "UNKNOWN",
  ]);
  if (allowed.has(explicit)) return explicit;
  const text = `${options.intent} ${options.task}`.toLowerCase();
  if (/adoption|intentos|migration|老项目|接入/.test(text)) return "ADOPTION_MIGRATION";
  if (/baseline|基线/.test(text)) return "BASELINE_SETUP";
  if (/document|archive|doc|文档|归档/.test(text)) return "DOCUMENT_GOVERNANCE";
  if (/release|launch|上线|发布/.test(text)) return "RELEASE_PREPARATION";
  if (/bug|fix|repair|修复/.test(text)) return "BUG_FIX";
  if (/patch|copy|typo|文案/.test(text)) return "SAFE_PATCH";
  if (fs.existsSync(path.join(root, "intentos-manifest.json")) && fs.existsSync(path.join(root, "core", "workflow.md"))) {
    return "WORKFLOW_CAPABILITY";
  }
  if (/feature|add|新增|实现/.test(text)) return "FEATURE_IMPLEMENTATION";
  return "UNKNOWN";
}

function collectActualDiff(root, options) {
  if (!isGitRepo(root)) {
    return {
      diff_source: "not-git-repo",
      changed_files: [],
      unexpected_files: [],
      target_diff_status: "UNKNOWN",
    };
  }
  const diffArgs = ["diff", "--name-only"];
  if (options.cached) diffArgs.splice(1, 0, "--cached");
  else if (options.base) diffArgs.push(options.base);
  const result = spawnSync("git", diffArgs, { cwd: root, encoding: "utf8" });
  const changed = result.status === 0
    ? result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : [];
  const unexpected = changed.filter((file) => /(^|\/)\.DS_Store$|(^|\/)(\.env|secrets?|local-secrets)|\.log$|\.tmp$/i.test(file));
  return {
    diff_source: options.cached ? "git:cached" : options.base ? `git:${options.base}` : "git:working-tree",
    changed_files: changed,
    unexpected_files: unexpected,
    target_diff_status: unexpected.length > 0
      ? "UNEXPECTED_DIFF"
      : changed.length > 0
        ? "REQUIRES_EXPLICIT_EXECUTION_PLAN"
        : "UNCHANGED_FOR_READ_ONLY",
  };
}

function isGitRepo(root) {
  const result = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: root, encoding: "utf8" });
  return result.status === 0 && result.stdout.trim() === "true";
}

function collectSourceSystems(root, options) {
  const systems = [
    ["change_impact_coverage", "change-impact-coverage-reports"],
    ["execution_closure", "execution-closures"],
    ["closure_decision", "closure-decisions"],
    ["review_loop", "review-loop-reports"],
    ["adoption_assurance", "adoption-assurance-reports"],
    ["governance_convergence", "governance-convergence-reports"],
    ["release_plan", "release-plans"],
    ["document_lifecycle", "doc-lifecycle-reports"],
    ["work_queue", "work-queue"],
    ["approval_record", "approval-records"],
  ];
  return systems.map(([name, dir]) => {
    const files = markdownFiles(path.join(root, dir));
    if (files.length > 0) {
      const file = files[0];
      const relative = path.relative(root, file);
      const content = fs.readFileSync(file, "utf8");
      const sourceEvidence = extractMachineReadableEvidence(content);
      const sourceTaskRef = String(sourceEvidence?.task_ref || "UNKNOWN");
      const sourceOutcome = String(sourceEvidence?.outcome || sourceEvidence?.assurance_state || "RECORDED");
      return {
        name,
        status: "RECORDED",
        ref: `artifact:${relative}`,
        source_system_ref: `artifact:${relative}`,
        source_task_ref: sourceTaskRef,
        source_outcome: sourceOutcome,
        current_task_match: sourceTaskRef === options.task ? "Yes" : "No",
        report_digest: digest(content),
        contribution: `${dir} evidence present.`,
      };
    }
    return {
      name,
      status: "NEEDS_INPUT",
      ref: dir,
      source_system_ref: dir,
      source_task_ref: options.task,
      source_outcome: "NEEDS_INPUT",
      current_task_match: "No",
      evidence_digest: digest(`${name}:${dir}:${options.task}:missing`),
      contribution: `${dir} evidence not recorded for ${options.task}.`,
    };
  });
}

function extractMachineReadableEvidence(content) {
  const match = String(content || "").match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
  return files.sort();
}

function assessPatch(executionKind, actualDiff, options) {
  const text = options.intent.toLowerCase();
  if (/backend-only|后端.*(前端|ui).*未|bypass|hardcod|try\/catch|skip test|跳过测试/.test(text)) {
    return { state: "PATCH_SMELL", reason: "Intent contains patch-smell markers." };
  }
  if (actualDiff.unexpected_files.length > 0) {
    return { state: "BLOCKED_PATCH", reason: "Unexpected local-only, secret, log, or temp files are present." };
  }
  if (executionKind === "SAFE_PATCH") {
    const broad = actualDiff.changed_files.length > 4;
    return broad
      ? { state: "CONTROLLED_PATCH", reason: "Patch has broader diff than a narrow safe patch; requires controlled evidence." }
      : { state: "SAFE_PATCH", reason: "Narrow low-risk patch candidate with bounded diff." };
  }
  return { state: "NOT_A_PATCH", reason: "Normal planned execution." };
}

function buildCompletionContract(executionKind, options) {
  return {
    criteria: [
      {
        id: `criterion:${slug(executionKind)}`,
        status: "PENDING",
        evidence_refs: [`checker:${sourceCheckerFor(executionKind)}`],
      },
    ],
  };
}

function buildImpactMap(executionKind, sourceSystems) {
  const source = sourceSystems.find((item) => item.name === "change_impact_coverage" && item.status === "RECORDED");
  return {
    surfaces: surfacesFor(executionKind).map((surface) => ({
      surface,
      expected: "Yes",
      status: source ? "DONE" : "PENDING",
      evidence_refs: [source ? source.ref : `checker:${sourceCheckerFor(executionKind)}`],
    })),
  };
}

function buildEvidenceBindings(contract) {
  return contract.criteria.flatMap((criterion) => criterion.evidence_refs.map((ref) => ({
    criterion_id: criterion.id,
    evidence_ref: ref,
    resolved: ref.startsWith("checker:") ? "Yes" : "No",
    current_task_match: "No",
  })));
}

function buildReview(root, executionKind, sourceSystems) {
  const reviewSource = sourceSystems.find((item) => item.name === "review_loop" && item.status === "RECORDED");
  const checkerBacked = sourceSystems.some((item) => item.status === "RECORDED" && ["adoption_assurance", "release_plan", "execution_closure", "closure_decision"].includes(item.name));
  if (reviewSource || checkerBacked || executionKind === "SAFE_PATCH") {
    return {
      review_required: executionKind === "SAFE_PATCH" ? "No" : "Yes",
      review_refs: [reviewSource?.ref || "checker:source-system-review"],
      all_reviewers_closed: "Yes",
    };
  }
  return {
    review_required: "Yes",
    review_refs: [],
    all_reviewers_closed: "No",
  };
}

function chooseState({ executionKind, actualDiff, sourceSystems, patchAssessment, completionContract, plannedImpactMap, evidenceBindings, review }) {
  if (executionKind === "UNKNOWN") return "NEEDS_HUMAN_DECISION";
  if (actualDiff.target_diff_status === "UNEXPECTED_DIFF") return "BLOCKED_BY_UNEXPECTED_DIFF";
  if (["PATCH_SMELL", "BLOCKED_PATCH"].includes(patchAssessment.state)) return "BLOCKED_BY_PATCH_SMELL";
  if (review.review_required === "Yes" && (review.review_refs.length === 0 || review.all_reviewers_closed !== "Yes")) return "PARTIAL_DONE";
  const hasBlockingSource = sourceSystems.some((source) => source.status === "BLOCKED");
  if (hasBlockingSource) return "BLOCKED_BY_MISSING_EVIDENCE";
  const allCriteriaDone = completionContract.criteria.every((item) => item.status === "DONE");
  const allSurfacesDone = plannedImpactMap.surfaces.every((item) => item.status === "DONE" || item.status === "OUT_OF_SCOPE_WITH_REASON");
  const allEvidenceCurrent = evidenceBindings.every((item) => item.resolved === "Yes" && item.current_task_match === "Yes");
  if (allCriteriaDone && allSurfacesDone && allEvidenceCurrent) return "VERIFIED_DONE";
  return "PARTIAL_DONE";
}

function normalizeIntent(intent, executionKind) {
  return `${executionKind}: ${String(intent || "").trim() || "verify execution completion"}`;
}

function scopeFor(executionKind) {
  const map = {
    FEATURE_IMPLEMENTATION: ["user flow", "frontend UI", "API contract", "backend rule", "tests", "docs"],
    BUG_FIX: ["regression surface", "root cause", "tests", "review"],
    SAFE_PATCH: ["changed file", "verification evidence"],
    CONTROLLED_PATCH: ["changed file", "verification evidence", "debt handoff"],
    ADOPTION_MIGRATION: ["native migration", "rule reconciliation", "governance convergence", "adoption assurance"],
    BASELINE_SETUP: ["baseline selection", "engineering baseline", "environment baseline"],
    DOCUMENT_GOVERNANCE: ["source of truth", "archive/deprecation suggestion", "link check"],
    RELEASE_PREPARATION: ["launch view", "release plan", "owner", "rollback", "monitoring"],
    WORKFLOW_CAPABILITY: ["intentos code", "fixtures", "docs", "release record", "self-check"],
    UNKNOWN: ["needs classification"],
  };
  return map[executionKind] || map.UNKNOWN;
}

function surfacesFor(executionKind) {
  if (executionKind === "ADOPTION_MIGRATION") return ["workflow", "baseline", "audit", "release", "risk_authority", "simulation"];
  if (executionKind === "RELEASE_PREPARATION") return ["release_target", "owner", "rollback", "monitoring", "handoff"];
  if (executionKind === "DOCUMENT_GOVERNANCE") return ["source_of_truth", "duplicates", "archive_index", "link_check"];
  if (executionKind === "BASELINE_SETUP") return ["platform", "engineering", "environment", "verification"];
  if (executionKind === "SAFE_PATCH") return ["changed_file", "verification"];
  return ["user_flow", "frontend_ui", "api_contract", "backend_rule", "tests", "docs"];
}

function sourceCheckerFor(executionKind) {
  const map = {
    ADOPTION_MIGRATION: "adoption-assurance",
    RELEASE_PREPARATION: "release-plan",
    DOCUMENT_GOVERNANCE: "document-lifecycle",
    BASELINE_SETUP: "baseline-decision",
    SAFE_PATCH: "apply-candidate",
    CONTROLLED_PATCH: "apply-readiness",
    WORKFLOW_CAPABILITY: "check-intentos",
  };
  return map[executionKind] || "impact-coverage";
}

function riskFor(executionKind) {
  if (["RELEASE_PREPARATION", "ADOPTION_MIGRATION"].includes(executionKind)) return "HIGH_PLAN_ONLY";
  if (executionKind === "SAFE_PATCH") return "LOW";
  return "NORMAL";
}

function pendingDecisionsFor(state) {
  if (state === "VERIFIED_DONE") return [];
  if (state === "NEEDS_HUMAN_DECISION") return ["Classify the execution kind before claiming completion."];
  if (state === "BLOCKED_BY_UNEXPECTED_DIFF") return ["Review unexpected diff and decide whether it is in scope."];
  if (state === "BLOCKED_BY_PATCH_SMELL") return ["Decide whether to expand scope or document a controlled patch with debt handoff."];
  return ["Add missing evidence, review, or task-bound source-system records before claiming done."];
}

function nextStepFor(state) {
  if (state === "VERIFIED_DONE") return "Prepare final response with evidence summary; do not claim release or production approval.";
  if (state === "BLOCKED_BY_UNEXPECTED_DIFF") return "Review unexpected files and either remove them from the task or record approved scope change.";
  if (state === "BLOCKED_BY_PATCH_SMELL") return "Expand impact coverage or classify the work as a controlled patch with debt handoff.";
  if (state === "NEEDS_HUMAN_DECISION") return "Ask for the missing decision in plain language.";
  return "Collect missing evidence and independent review before claiming completion.";
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  const lines = [];
  const push = (line = "") => lines.push(line);
  push("# Execution Assurance Report");
  push("");
  push("This report is a read-only derived verification view. It does not write target files, authorize writes, approve release, or replace source systems.");
  push("");
  push("## Human Summary");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Execution Kind | \`${report.humanSummary.executionKind}\` |`);
  push(`| Assurance State | \`${report.humanSummary.assuranceState}\` |`);
  push(`| Can Claim Done | \`${report.humanSummary.canClaimDone}\` |`);
  push(`| Can Codex Write Now | \`${report.humanSummary.canCodexWriteNow}\` |`);
  push(`| Safe Next Step | ${report.humanSummary.safeNextStep} |`);
  push("");
  push("## Execution Kind");
  push("");
  push(`\`${evidence.execution_kind}\``);
  push("");
  push("## Intent Lock");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| User Intent | ${evidence.intent_lock.user_intent} |`);
  push(`| Normalized Intent | ${evidence.intent_lock.normalized_intent} |`);
  push(`| Task Ref | \`${evidence.task_ref}\` |`);
  push("| Drift Policy | Scope changes require Work Queue or Conversation Drift review. |");
  push("");
  push("## Completion Contract");
  push("");
  push("| Criterion | Status | Evidence | Notes |");
  push("| --- | --- | --- | --- |");
  for (const item of evidence.completion_contract.criteria) {
    push(`| ${item.id} | \`${item.status}\` | \`${item.evidence_refs.join(", ")}\` | Bound to current task evidence. |`);
  }
  push("");
  push("## Planned Impact Map");
  push("");
  push("| Surface | Expected | Status | Evidence | Notes |");
  push("| --- | --- | --- | --- |");
  for (const item of evidence.planned_impact_map.surfaces) {
    push(`| ${item.surface} | \`${item.expected}\` | \`${item.status}\` | \`${item.evidence_refs.join(", ")}\` | Planned surface. |`);
  }
  push("");
  push("## Execution Plan Binding");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Plan Ref | \`${evidence.execution_plan.plan_ref}\` |`);
  push(`| Risk Classification | \`${evidence.execution_plan.risk_classification}\` |`);
  push(`| Planned Target Paths | \`${evidence.execution_plan.planned_target_paths.join(", ")}\` |`);
  push(`| Approval Ref | \`${evidence.execution_plan.approval_refs.join(", ") || "N/A"}\` |`);
  push(`| Restore Strategy | ${evidence.execution_plan.restore_strategy} |`);
  push("");
  push("## Actual Diff Binding");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Diff Source | \`${evidence.actual_diff.diff_source}\` |`);
  push(`| Changed Files | \`${evidence.actual_diff.changed_files.join(", ") || "none"}\` |`);
  push(`| Unexpected Files | \`${evidence.actual_diff.unexpected_files.join(", ") || "none"}\` |`);
  push(`| Target Diff Status | \`${evidence.actual_diff.target_diff_status}\` |`);
  push("");
  push("## Evidence Binding");
  push("");
  push("| Criterion | Evidence Ref | Resolved | Current Task Match |");
  push("| --- | --- | --- | --- |");
  for (const item of evidence.evidence_bindings) {
    push(`| ${item.criterion_id} | \`${item.evidence_ref}\` | \`${item.resolved}\` | \`${item.current_task_match}\` |`);
  }
  push("");
  push("## Independent Review Binding");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Review Required | \`${evidence.review.review_required}\` |`);
  push(`| Review Refs | \`${evidence.review.review_refs.join(", ") || "none"}\` |`);
  push(`| All Reviewers Closed | \`${evidence.review.all_reviewers_closed}\` |`);
  push("");
  push("## Patch Assessment");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Patch State | \`${evidence.patch_assessment.state}\` |`);
  push(`| Reason | ${evidence.patch_assessment.reason} |`);
  push("");
  push("## Source System Trace");
  push("");
  push("| Source System | Status | Ref | Source Task | Source Outcome | Current Task Match | Digest | Contribution | Authority |");
  push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const item of evidence.source_systems) {
    push(`| ${item.name} | \`${item.status}\` | \`${item.ref}\` | \`${item.source_task_ref}\` | \`${item.source_outcome}\` | \`${item.current_task_match}\` | \`${item.report_digest || item.evidence_digest || "none"}\` | ${item.contribution} | Source system |`);
  }
  push("");
  push("## Closure Decision");
  push("");
  push(`\`${evidence.outcome}\``);
  push("");
  push("## Pending Human Decisions");
  push("");
  if (evidence.pending_human_decisions.length === 0) push("- None.");
  else for (const item of evidence.pending_human_decisions) push(`- ${item}`);
  push("");
  push("## Forbidden Claims");
  push("");
  push("- This report writes target files: No");
  push("- This report authorizes target-file writes: No");
  push("- This report approves implementation beyond recorded scope: No");
  push("- This report approves commit or push: No");
  push("- This report approves release or production: No");
  push("- This report replaces source systems: No");
  push("- This report proves product correctness: No");
  push("- This report transfers project authority to IntentOS: No");
  push("");
  push("## Boundary");
  push("");
  push("Execution Assurance is derived from recorded evidence and project facts. Source systems remain authoritative.");
  push("");
  push("## Machine-Readable Evidence");
  push("");
  push("```json");
  push(JSON.stringify(evidence, null, 2));
  push("```");
  return `${lines.join("\n")}\n`;
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
