#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateSchema } from "./lib/artifact-schema.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "require-structured-evidence",
  "require-evidence-refs",
  "require-review",
  "require-actual-diff",
  "require-precise-evidence",
  "allow-empty",
  "report",
  "mode",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const requireEvidenceRefs = Boolean(args["require-evidence-refs"]);
const requireReview = Boolean(args["require-review"]);
const requireActualDiff = Boolean(args["require-actual-diff"]);
const requirePreciseEvidence = Boolean(args["require-precise-evidence"]);
const allowEmptyReports = Boolean(args["allow-empty"]);
const explicitReport = args.report ? path.resolve(projectRoot, String(args.report)) : "";
const schemaVersion = "1.74.0";
const schemaPath = "schemas/artifacts/execution-assurance.schema.json";
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/execution-assurance-chain.md",
  "docs/execution-assurance-chain.md",
  "templates/execution-assurance-report.md",
  "schemas/artifacts/execution-assurance.schema.json",
  "checklists/execution-assurance-review.md",
  "prompts/execution-assurance-agent.md",
  "scripts/resolve-execution-assurance.mjs",
  "scripts/check-execution-assurance.mjs",
];
const requiredDirectories = ["execution-assurance-reports"];
const requiredSections = [
  "Human Summary",
  "Execution Kind",
  "Intent Lock",
  "Completion Contract",
  "Planned Impact Map",
  "Execution Plan Binding",
  "Actual Diff Binding",
  "Evidence Binding",
  "Independent Review Binding",
  "Patch Assessment",
  "Source System Trace",
  "Closure Decision",
  "Pending Human Decisions",
  "Forbidden Claims",
  "Boundary",
];
const allowedStates = new Set([
  "VERIFIED_DONE",
  "PARTIAL_DONE",
  "BLOCKED_BY_MISSING_EVIDENCE",
  "BLOCKED_BY_UNEXPECTED_DIFF",
  "BLOCKED_BY_PATCH_SMELL",
  "BLOCKED_BY_SCOPE_DRIFT",
  "BLOCKED_BY_RISK",
  "NEEDS_HUMAN_DECISION",
]);
const allowedKinds = new Set([
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
const allowedPatchStates = new Set(["NOT_A_PATCH", "SAFE_PATCH", "CONTROLLED_PATCH", "PATCH_SMELL", "BLOCKED_PATCH"]);
const forbiddenClaims = [
  /\bproduction approved\b/i,
  /\brelease approved\b/i,
  /\bapproved for production\b/i,
  /\bCodex will deploy\b/i,
  /\bCodex will publish\b/i,
  /\bCodex approves commit\b/i,
  /\bCodex approves push\b/i,
  /\bThis report writes target files:\s*Yes\b/i,
  /\bThis report authorizes target-file writes:\s*Yes\b/i,
  /\bThis report approves commit or push:\s*Yes\b/i,
  /\bThis report approves release or production:\s*Yes\b/i,
  /\bThis report replaces source systems:\s*Yes\b/i,
  /\bThis report proves product correctness:\s*Yes\b/i,
  /批准(发布|生产|上线|提交)/,
  /(Codex|AI|IntentOS|本报告).{0,16}(自动)?(发布|上线|部署|提交)/,
];
const knownCheckerRefs = new Set([
  "checker:impact-coverage",
  "checker:execution-closure",
  "checker:closure-decision",
  "checker:review-loop",
  "checker:adoption-assurance",
  "checker:convergence",
  "checker:release-plan",
  "checker:document-lifecycle",
  "checker:baseline-decision",
  "checker:apply-candidate",
  "checker:apply-readiness",
  "checker:check-intentos",
  "checker:source-system-review",
]);

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Execution Assurance Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }
  for (const dir of requiredDirectories) {
    const resolved = resolveDirectory(dir);
    if (resolved) pass(`${displayAsset(dir, resolved)} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkReports();
emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/execution-assurance-chain.md"),
    readResolved("docs/execution-assurance-chain.md"),
    readResolved("templates/execution-assurance-report.md"),
    readResolved("schemas/artifacts/execution-assurance.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Execution Assurance Chain",
    "No evidence chain, no verified completion",
    "execution_assurance_report",
    "VERIFIED_DONE",
    "PARTIAL_DONE",
    "PATCH_SMELL",
    "Actual Diff Binding",
    "Independent Review Binding",
    "Source systems remain authoritative",
    "This report approves release or production: No",
  ]) {
    if (combined.includes(marker)) pass(`execution assurance docs include ${marker}`);
    else fail(`execution assurance docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("execution-assurance-reports");
  if (files.length === 0) {
    if (allowEmptyReports) {
      pass("execution assurance check skipped by explicit --allow-empty: no reports");
    } else {
      fail("no execution assurance reports found; run `execution-assurance --out <relative-report-path>` or pass `--allow-empty` only for asset-only checks");
    }
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit execution assurance report ${file}`);
      continue;
    }
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden execution assurance claim: ${pattern.source}`);
    }
    if (!content.includes("read-only derived verification view")) fail(`${label} must state read-only derived verification view boundary`);
    else pass(`${label} states read-only derived verification view boundary`);
    for (const section of requiredSections) requireSection(content, section, label);
    if (requireStructuredEvidence) requireSection(content, "Machine-Readable Evidence", label);
    const summary = checkSummary(content, label);
    const evidence = checkStructuredEvidence(content, label);
    checkCrossConsistency(content, label, summary, evidence);
    checkStateRules(content, label, summary, evidence);
  }
}

function checkSummary(content, label) {
  const body = sectionBody(content, "Human Summary") || "";
  const kind = tableValue(body, "Execution Kind");
  const state = tableValue(body, "Assurance State");
  const canClaimDone = tableValue(body, "Can Claim Done");
  const canWrite = tableValue(body, "Can Codex Write Now");
  if (allowedKinds.has(kind)) pass(`${label} summary execution kind is allowed`);
  else fail(`${label} summary execution kind invalid: ${kind || "<empty>"}`);
  if (allowedStates.has(state)) pass(`${label} summary assurance state is allowed`);
  else fail(`${label} summary assurance state invalid: ${state || "<empty>"}`);
  if (["Yes", "No"].includes(canClaimDone)) pass(`${label} summary claim flag is bounded`);
  else fail(`${label} summary claim flag invalid: ${canClaimDone || "<empty>"}`);
  if (canWrite === "No") pass(`${label} summary can codex write now is No`);
  else fail(`${label} summary can codex write now must be No`);
  return { kind, state, canClaimDone, canWrite };
}

function checkStructuredEvidence(content, label) {
  const body = sectionBody(content, "Machine-Readable Evidence", { fallback: "" }) || "";
  if (!body.trim()) {
    if (requireStructuredEvidence) fail(`${label} must include Machine-Readable Evidence in strict mode`);
    return null;
  }
  const jsonText = fencedJson(body);
  if (!jsonText) {
    fail(`${label} Machine-Readable Evidence must contain a fenced json block`);
    return null;
  }
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
    pass(`${label} Machine-Readable Evidence parses as JSON`);
  } catch (error) {
    fail(`${label} Machine-Readable Evidence JSON invalid: ${error.message}`);
    return null;
  }
  if (requireStructuredEvidence) {
    const schema = loadSchema(projectRoot, schemaPath);
    if (!schema) {
      fail(`${label} Machine-Readable Evidence schema is missing`);
    } else {
      const validation = validateSchema(parsed, schema, { label: `${label} Machine-Readable Evidence` });
      if (validation.ok) pass(`${label} Machine-Readable Evidence matches schema`);
      else for (const error of validation.errors) fail(error);
    }
  }
  const required = [
    "schema_version",
    "artifact_type",
    "execution_kind",
    "task_ref",
    "assurance_state",
    "can_claim_done",
    "can_codex_write_now",
    "intent_lock",
    "completion_contract",
    "planned_impact_map",
    "execution_plan",
    "actual_diff",
    "evidence_bindings",
    "review",
    "patch_assessment",
    "source_systems",
    "pending_human_decisions",
    "forbidden_claims",
    "boundary",
    "outcome",
  ];
  for (const field of required) {
    if (Object.prototype.hasOwnProperty.call(parsed, field)) pass(`${label} evidence includes ${field}`);
    else fail(`${label} evidence missing ${field}`);
  }
  if (parsed.schema_version === schemaVersion) pass(`${label} evidence schema_version is ${schemaVersion}`);
  else fail(`${label} evidence schema_version must be ${schemaVersion}`);
  if (parsed.artifact_type === "execution_assurance_report") pass(`${label} evidence artifact_type is execution_assurance_report`);
  else fail(`${label} evidence artifact_type invalid`);
  if (allowedKinds.has(parsed.execution_kind)) pass(`${label} evidence execution_kind is allowed`);
  else fail(`${label} evidence execution_kind invalid`);
  if (allowedStates.has(parsed.assurance_state)) pass(`${label} evidence assurance_state is allowed`);
  else fail(`${label} evidence assurance_state invalid: ${parsed.assurance_state || "<empty>"}`);
  if (parsed.outcome === parsed.assurance_state) pass(`${label} evidence outcome matches assurance_state`);
  else fail(`${label} evidence outcome must match assurance_state`);
  if (parsed.can_codex_write_now === "No") pass(`${label} evidence can_codex_write_now is No`);
  else fail(`${label} evidence can_codex_write_now must be No`);
  checkIntentLock(parsed, label);
  checkCompletionContract(parsed, label);
  checkPlannedImpact(parsed, label);
  checkExecutionPlan(parsed, label);
  checkActualDiff(parsed, label);
  checkEvidenceBindings(parsed, label);
  checkReview(parsed, label);
  checkPatchAssessment(parsed, label);
  checkSourceSystems(parsed, label);
  checkBoundary(parsed, label);
  return parsed;
}

function checkIntentLock(parsed, label) {
  const lock = parsed.intent_lock || {};
  if (String(lock.user_intent || "").trim()) pass(`${label} intent lock has user intent`);
  else fail(`${label} intent lock missing user intent`);
  if (String(lock.normalized_intent || "").trim()) pass(`${label} intent lock has normalized intent`);
  else fail(`${label} intent lock missing normalized intent`);
  if (Array.isArray(lock.in_scope) && lock.in_scope.length > 0) pass(`${label} intent lock has in-scope list`);
  else fail(`${label} intent lock must include in-scope list`);
}

function checkCompletionContract(parsed, label) {
  const criteria = Array.isArray(parsed.completion_contract?.criteria) ? parsed.completion_contract.criteria : [];
  if (criteria.length > 0) pass(`${label} completion contract has criteria`);
  else fail(`${label} completion contract must include criteria`);
  for (const item of criteria) {
    if (String(item.id || "").trim()) pass(`${label} criterion ${item.id || "<unknown>"} has id`);
    else fail(`${label} criterion missing id`);
    if (["DONE", "PENDING", "BLOCKED", "OUT_OF_SCOPE_WITH_REASON"].includes(item.status)) pass(`${label} criterion ${item.id} status is allowed`);
    else fail(`${label} criterion ${item.id || "<unknown>"} status invalid`);
    if (Array.isArray(item.evidence_refs) && item.evidence_refs.length > 0) pass(`${label} criterion ${item.id} has evidence refs`);
    else fail(`${label} criterion ${item.id || "<unknown>"} must include evidence refs`);
  }
}

function checkPlannedImpact(parsed, label) {
  const surfaces = Array.isArray(parsed.planned_impact_map?.surfaces) ? parsed.planned_impact_map.surfaces : [];
  if (surfaces.length > 0) pass(`${label} planned impact map has surfaces`);
  else fail(`${label} planned impact map must include surfaces`);
  for (const item of surfaces) {
    if (String(item.surface || "").trim()) pass(`${label} surface ${item.surface || "<unknown>"} has name`);
    else fail(`${label} planned impact surface missing name`);
    if (["DONE", "PENDING", "BLOCKED", "OUT_OF_SCOPE_WITH_REASON"].includes(item.status)) pass(`${label} surface ${item.surface} status is allowed`);
    else fail(`${label} surface ${item.surface || "<unknown>"} status invalid`);
    if (Array.isArray(item.evidence_refs) && item.evidence_refs.length > 0) pass(`${label} surface ${item.surface} has evidence refs`);
    else fail(`${label} surface ${item.surface || "<unknown>"} must include evidence refs`);
  }
}

function checkExecutionPlan(parsed, label) {
  const plan = parsed.execution_plan || {};
  if (String(plan.plan_ref || "").trim()) pass(`${label} execution plan has plan ref`);
  else fail(`${label} execution plan missing plan ref`);
  const strictPlanBinding = requirePreciseEvidence || parsed.assurance_state === "VERIFIED_DONE";
  if (strictPlanBinding) {
    checkPlanRef(plan.plan_ref, parsed, label);
    const approvalRefs = Array.isArray(plan.approval_refs) ? plan.approval_refs : [];
    for (const ref of approvalRefs) checkApprovalRef(ref, parsed, label);
  }
  const paths = Array.isArray(plan.planned_target_paths) ? plan.planned_target_paths : [];
  if (paths.length > 0) pass(`${label} execution plan has planned target paths`);
  else fail(`${label} execution plan must include planned target paths`);
  const invalidPaths = paths.filter((item) => !isAllowedPlannedTargetPath(item));
  if (invalidPaths.length > 0) fail(`${label} execution plan has unsupported or broad target path: ${invalidPaths.join(", ")}`);
  else pass(`${label} execution plan uses explicit planned target paths`);
}

function checkActualDiff(parsed, label) {
  const diff = parsed.actual_diff || {};
  if (String(diff.diff_source || "").trim()) pass(`${label} actual diff has source`);
  else fail(`${label} actual diff missing source`);
  if (Array.isArray(diff.changed_files)) pass(`${label} actual diff lists changed files`);
  else fail(`${label} actual diff must list changed files`);
  if (Array.isArray(diff.unexpected_files)) pass(`${label} actual diff lists unexpected files`);
  else fail(`${label} actual diff must list unexpected files`);
  if (requireActualDiff && !String(diff.target_diff_status || "").trim()) fail(`${label} actual diff status required`);
  if ((diff.unexpected_files || []).length > 0 && parsed.assurance_state === "VERIFIED_DONE") {
    fail(`${label} VERIFIED_DONE cannot include unexpected diff`);
  }
  for (const file of diff.changed_files || []) {
    if (/\.DS_Store$|\.env|secret|password|\.log$|\.tmp$/i.test(String(file))) {
      fail(`${label} changed file is local-only, secret-like, log, or temp artifact: ${file}`);
    }
  }
  const needsPlanCoverage = requireActualDiff || requirePreciseEvidence || parsed.assurance_state === "VERIFIED_DONE";
  if (needsPlanCoverage && Array.isArray(diff.changed_files) && diff.changed_files.length > 0) {
    const plannedPaths = Array.isArray(parsed.execution_plan?.planned_target_paths) ? parsed.execution_plan.planned_target_paths : [];
    const uncovered = diff.changed_files.filter((file) => !isChangedFileCoveredByPlan(file, plannedPaths));
    if (uncovered.length > 0) {
      fail(`${label} actual diff changed files are outside planned target paths: ${uncovered.join(", ")}; use BLOCKED_BY_SCOPE_DRIFT or record a reviewed execution plan`);
    } else {
      pass(`${label} actual diff changed files are covered by planned target paths`);
    }
  }
}

function checkEvidenceBindings(parsed, label) {
  const bindings = Array.isArray(parsed.evidence_bindings) ? parsed.evidence_bindings : [];
  if (bindings.length > 0) pass(`${label} evidence bindings are present`);
  else fail(`${label} evidence bindings must not be empty`);
  for (const item of bindings) {
    if (String(item.criterion_id || "").trim()) pass(`${label} evidence binding has criterion id`);
    else fail(`${label} evidence binding missing criterion id`);
    checkEvidenceRef(item.evidence_ref, parsed, label);
    if (["Yes", "No"].includes(item.resolved)) pass(`${label} evidence binding resolved flag is bounded`);
    else fail(`${label} evidence binding resolved flag invalid`);
    if (item.resolved === "Yes" && isFileOrArtifactRef(item.evidence_ref) && !evidenceRefExists(item.evidence_ref)) {
      fail(`${label} evidence binding claims resolved but local evidence is missing: ${item.evidence_ref}`);
    }
    if (requirePreciseEvidence && item.current_task_match !== "Yes" && parsed.assurance_state === "VERIFIED_DONE") {
      fail(`${label} VERIFIED_DONE requires current_task_match Yes for all evidence`);
    }
  }
  if (requireEvidenceRefs) {
    const refs = collectEvidenceRefs(parsed);
    if (refs.length > 0) pass(`${label} has evidence refs`);
    else fail(`${label} must include evidence refs`);
    for (const ref of refs) checkEvidenceRef(ref, parsed, label);
  }
}

function checkReview(parsed, label) {
  const review = parsed.review || {};
  if (["Yes", "No"].includes(review.review_required)) pass(`${label} review required flag is bounded`);
  else fail(`${label} review required flag invalid`);
  const refs = Array.isArray(review.review_refs) ? review.review_refs : [];
  if (requireReview || parsed.assurance_state === "VERIFIED_DONE") {
    if (refs.length > 0) pass(`${label} review refs are present`);
    else fail(`${label} review refs required`);
    if (review.all_reviewers_closed === "Yes") pass(`${label} all reviewers are closed`);
    else fail(`${label} all reviewers must be closed`);
  }
}

function checkPatchAssessment(parsed, label) {
  const patch = parsed.patch_assessment || {};
  if (allowedPatchStates.has(patch.state)) pass(`${label} patch state is allowed`);
  else fail(`${label} patch state invalid: ${patch.state || "<empty>"}`);
  if (String(patch.reason || "").trim()) pass(`${label} patch assessment has reason`);
  else fail(`${label} patch assessment missing reason`);
  if (["PATCH_SMELL", "BLOCKED_PATCH"].includes(patch.state) && parsed.assurance_state === "VERIFIED_DONE") {
    fail(`${label} VERIFIED_DONE cannot include ${patch.state}`);
  }
  if (patch.state === "SAFE_PATCH" && (parsed.actual_diff?.changed_files || []).length > 4) {
    fail(`${label} SAFE_PATCH cannot include broad diff`);
  }
  if (patch.state === "CONTROLLED_PATCH") {
    const refs = collectEvidenceRefs(parsed);
    if (refs.some((ref) => /debt-handoff|handoff/i.test(ref))) pass(`${label} controlled patch has debt/handoff evidence`);
    else fail(`${label} CONTROLLED_PATCH requires debt/handoff evidence`);
  }
}

function checkSourceSystems(parsed, label) {
  const sources = Array.isArray(parsed.source_systems) ? parsed.source_systems : [];
  if (sources.length > 0) pass(`${label} source systems are present`);
  else fail(`${label} source systems must not be empty`);
  const strictSourceBinding = requirePreciseEvidence || parsed.assurance_state === "VERIFIED_DONE";
  for (const item of sources) {
    if (String(item.name || "").trim()) pass(`${label} source system has name`);
    else fail(`${label} source system missing name`);
    if (["RECORDED", "NEEDS_INPUT", "BLOCKED"].includes(item.status)) pass(`${label} source system ${item.name} status is allowed`);
    else fail(`${label} source system ${item.name || "<unknown>"} status invalid`);
    if (String(item.ref || "").trim()) pass(`${label} source system ${item.name} has ref`);
    else fail(`${label} source system ${item.name || "<unknown>"} missing ref`);
    if (String(item.contribution || "").trim()) pass(`${label} source system ${item.name} has contribution`);
    else fail(`${label} source system ${item.name || "<unknown>"} missing contribution`);
    if (String(item.source_system_ref || "").trim()) pass(`${label} source system ${item.name} has source_system_ref`);
    else fail(`${label} source system ${item.name || "<unknown>"} missing source_system_ref`);
    if (String(item.source_task_ref || "").trim()) pass(`${label} source system ${item.name} has source_task_ref`);
    else fail(`${label} source system ${item.name || "<unknown>"} missing source_task_ref`);
    if (String(item.source_outcome || "").trim()) pass(`${label} source system ${item.name} has source_outcome`);
    else fail(`${label} source system ${item.name || "<unknown>"} missing source_outcome`);
    if (["Yes", "No"].includes(item.current_task_match)) pass(`${label} source system ${item.name} current_task_match is bounded`);
    else fail(`${label} source system ${item.name || "<unknown>"} current_task_match invalid`);
    if (item.status === "RECORDED") {
      if (item.ref) checkEvidenceRef(item.ref, parsed, label);
      if (item.source_system_ref && item.source_system_ref !== item.ref) checkEvidenceRef(item.source_system_ref, parsed, label);
    }
    checkSourceDigest(item, parsed, label, strictSourceBinding);
    if (strictSourceBinding && item.status === "RECORDED") {
      if (item.current_task_match === "Yes") pass(`${label} source system ${item.name} matches current task`);
      else fail(`${label} source system ${item.name} must match current task in precise mode`);
      if (item.source_task_ref === parsed.task_ref) pass(`${label} source system ${item.name} source task matches report task`);
      else fail(`${label} source system ${item.name} source_task_ref must match current report task_ref`);
      if (/BLOCKED|NEEDS_INPUT|FAILED|ERROR|STALE/i.test(String(item.source_outcome || ""))) {
        fail(`${label} source system ${item.name} has non-completing source outcome: ${item.source_outcome}`);
      } else {
        pass(`${label} source system ${item.name} source outcome is usable`);
      }
    }
    if (parsed.assurance_state === "VERIFIED_DONE" && item.status !== "RECORDED") {
      fail(`${label} VERIFIED_DONE requires all source systems to be RECORDED`);
    }
  }
}

function checkBoundary(parsed, label) {
  const boundary = parsed.boundary || {};
  for (const field of [
    "writes_target_files",
    "authorizes_target_file_writes",
    "approves_implementation_beyond_recorded_scope",
    "approves_commit_or_push",
    "approves_release_or_production",
    "replaces_source_systems",
    "proves_product_correctness",
    "transfers_project_authority_to_intentos",
  ]) {
    if (boundary[field] === "No") pass(`${label} boundary ${field} is No`);
    else fail(`${label} boundary ${field} must be No`);
  }
}

function checkCrossConsistency(content, label, summary, evidence) {
  if (!evidence) return;
  if (summary.kind === evidence.execution_kind) pass(`${label} summary kind matches structured evidence`);
  else fail(`${label} summary kind does not match structured evidence`);
  if (summary.state === evidence.assurance_state) pass(`${label} summary state matches structured evidence`);
  else fail(`${label} summary state does not match structured evidence`);
  if (summary.canClaimDone === evidence.can_claim_done) pass(`${label} summary claim flag matches structured evidence`);
  else fail(`${label} summary claim flag does not match structured evidence`);
  const closure = firstCodeValue(sectionBody(content, "Closure Decision") || "");
  if (closure === evidence.outcome) pass(`${label} Closure Decision matches evidence outcome`);
  else fail(`${label} Closure Decision ${closure || "<empty>"} does not match evidence outcome ${evidence.outcome || "<empty>"}`);
  checkExecutionPlanTableConsistency(content, label, evidence);
  checkActualDiffTableConsistency(content, label, evidence);
  checkEvidenceBindingTableConsistency(content, label, evidence);
}

function checkExecutionPlanTableConsistency(content, label, evidence) {
  const body = sectionBody(content, "Execution Plan Binding") || "";
  const plan = evidence.execution_plan || {};
  compareScalar(label, "Execution Plan Binding Plan Ref", tableValue(body, "Plan Ref"), plan.plan_ref);
  compareScalar(label, "Execution Plan Binding Risk Classification", tableValue(body, "Risk Classification"), plan.risk_classification);
  compareList(label, "Execution Plan Binding Planned Target Paths", tableListValue(body, "Planned Target Paths"), plan.planned_target_paths || []);
  compareList(label, "Execution Plan Binding Approval Ref", tableListValue(body, "Approval Ref"), plan.approval_refs || []);
}

function checkActualDiffTableConsistency(content, label, evidence) {
  const body = sectionBody(content, "Actual Diff Binding") || "";
  const diff = evidence.actual_diff || {};
  compareScalar(label, "Actual Diff Binding Diff Source", tableValue(body, "Diff Source"), diff.diff_source);
  compareList(label, "Actual Diff Binding Changed Files", tableListValue(body, "Changed Files"), diff.changed_files || []);
  compareList(label, "Actual Diff Binding Unexpected Files", tableListValue(body, "Unexpected Files"), diff.unexpected_files || []);
  compareScalar(label, "Actual Diff Binding Target Diff Status", tableValue(body, "Target Diff Status"), diff.target_diff_status);
}

function checkEvidenceBindingTableConsistency(content, label, evidence) {
  const body = sectionBody(content, "Evidence Binding") || "";
  const rows = tableRows(body);
  const markdownBindings = rows.map((row) => ({
    criterion_id: stripMarkdown(row[0] || ""),
    evidence_ref: stripMarkdown(row[1] || ""),
    resolved: stripMarkdown(row[2] || ""),
    current_task_match: stripMarkdown(row[3] || ""),
  })).filter((row) => row.criterion_id || row.evidence_ref || row.resolved || row.current_task_match);
  const jsonBindings = Array.isArray(evidence.evidence_bindings) ? evidence.evidence_bindings : [];
  if (markdownBindings.length === jsonBindings.length) pass(`${label} Evidence Binding row count matches structured evidence`);
  else fail(`${label} Evidence Binding row count ${markdownBindings.length} does not match structured evidence ${jsonBindings.length}`);
  for (const item of jsonBindings) {
    const row = markdownBindings.find((candidate) => candidate.criterion_id === item.criterion_id);
    if (!row) {
      fail(`${label} Evidence Binding missing markdown row for ${item.criterion_id || "<unknown>"}`);
      continue;
    }
    compareScalar(label, `Evidence Binding ${item.criterion_id} evidence ref`, row.evidence_ref, item.evidence_ref);
    compareScalar(label, `Evidence Binding ${item.criterion_id} resolved`, row.resolved, item.resolved);
    compareScalar(label, `Evidence Binding ${item.criterion_id} current task match`, row.current_task_match, item.current_task_match);
  }
}

function compareScalar(label, field, markdownValue, jsonValue) {
  const left = String(markdownValue || "").trim();
  const right = String(jsonValue || "").trim();
  if (left === right) pass(`${label} ${field} matches structured evidence`);
  else fail(`${label} ${field} ${left || "<empty>"} does not match structured evidence ${right || "<empty>"}`);
}

function compareList(label, field, markdownValues, jsonValues) {
  const left = normalizeList(markdownValues);
  const right = normalizeList(jsonValues);
  if (sameList(left, right)) pass(`${label} ${field} matches structured evidence`);
  else fail(`${label} ${field} ${left.join(", ") || "<empty>"} does not match structured evidence ${right.join(", ") || "<empty>"}`);
}

function checkStateRules(content, label, summary, evidence) {
  if (!evidence) return;
  if (evidence.execution_kind === "UNKNOWN" && evidence.assurance_state === "VERIFIED_DONE") {
    fail(`${label} UNKNOWN execution kind cannot be VERIFIED_DONE`);
  }
  const doneCriteria = evidence.completion_contract.criteria.every((item) => item.status === "DONE" || item.status === "OUT_OF_SCOPE_WITH_REASON");
  const doneSurfaces = evidence.planned_impact_map.surfaces.every((item) => item.status === "DONE" || item.status === "OUT_OF_SCOPE_WITH_REASON");
  const currentEvidence = evidence.evidence_bindings.every((item) => item.resolved === "Yes" && item.current_task_match === "Yes");
  const reviewOk = evidence.review.review_required === "No" || (evidence.review.review_refs.length > 0 && evidence.review.all_reviewers_closed === "Yes");
  if (evidence.assurance_state === "VERIFIED_DONE") {
    if (evidence.can_claim_done === "Yes") pass(`${label} verified done can claim done`);
    else fail(`${label} VERIFIED_DONE must set can_claim_done Yes`);
    if (doneCriteria) pass(`${label} verified done has complete criteria`);
    else fail(`${label} VERIFIED_DONE requires all criteria done or out of scope`);
    if (doneSurfaces) pass(`${label} verified done has complete surfaces`);
    else fail(`${label} VERIFIED_DONE requires all surfaces done or out of scope`);
    if (currentEvidence) pass(`${label} verified done has resolved current-task evidence`);
    else fail(`${label} VERIFIED_DONE requires resolved current-task evidence`);
    if (reviewOk) pass(`${label} verified done has review closure`);
    else fail(`${label} VERIFIED_DONE requires independent review closure`);
    const refs = collectEvidenceRefs(evidence).join("\n");
    const sourceNames = (evidence.source_systems || []).map((item) => item.name).join("\n");
    if (evidence.execution_kind === "ADOPTION_MIGRATION") {
      if (/adoption-assurance|adoption_assurance/.test(`${refs}\n${sourceNames}`)) pass(`${label} adoption migration has Adoption Assurance source`);
      else fail(`${label} ADOPTION_MIGRATION VERIFIED_DONE requires Adoption Assurance source evidence`);
    }
    if (evidence.execution_kind === "RELEASE_PREPARATION") {
      if (/release-plan|release_plan/.test(`${refs}\n${sourceNames}`)) pass(`${label} release preparation has Release Plan source`);
      else fail(`${label} RELEASE_PREPARATION VERIFIED_DONE requires Release Plan source evidence`);
    }
  } else if (summary.canClaimDone === "Yes" || evidence.can_claim_done === "Yes") {
    fail(`${label} cannot claim done unless state is VERIFIED_DONE`);
  }
  if (/fully complete|fully done|已完全完成|已全部完成/i.test(content) && evidence.assurance_state !== "VERIFIED_DONE") {
    fail(`${label} text claims full completion without VERIFIED_DONE`);
  }
}

function checkEvidenceRef(ref, parsed, label) {
  const value = String(ref || "").trim();
  if (!value) {
    fail(`${label} evidence ref is empty`);
    return;
  }
  if (/TODO|TBD|placeholder|<.*>|evidence:\s*yes/i.test(value)) fail(`${label} evidence ref is placeholder: ${value}`);
  if (/stale|old unrelated|another-task/i.test(value)) fail(`${label} evidence ref is stale or unrelated: ${value}`);
  const strictResolution = requirePreciseEvidence || parsed?.assurance_state === "VERIFIED_DONE";
  if (value.startsWith("file:") || value.startsWith("artifact:")) {
    const filePath = value.replace(/^(file|artifact):/, "");
    if (!filePath || path.isAbsolute(filePath) || filePath.includes("..")) {
      fail(`${label} evidence ref must be relative and safe: ${value}`);
    } else if (!strictResolution || evidenceRefExists(value)) {
      pass(`${label} resolves evidence ${value}`);
    } else {
      fail(`${label} unresolved evidence ${value}`);
    }
  } else if (value.startsWith("checker:")) {
    if (knownCheckerRefs.has(value)) pass(`${label} resolves checker evidence ${value}`);
    else fail(`${label} unknown checker evidence ref ${value}`);
  } else if (value.startsWith("human-decision:") || value.startsWith("review:") || value.startsWith("command:") || value.startsWith("git-diff:") || value.startsWith("generated:")) {
    if (requirePreciseEvidence || parsed?.assurance_state === "VERIFIED_DONE") {
      fail(`${label} precise evidence must resolve to file:, artifact:, or checker: record, not declarative ref ${value}`);
    } else {
      pass(`${label} records declarative evidence ${value}`);
    }
  } else {
    fail(`${label} unknown evidence ref prefix ${value}`);
  }
}

function checkPlanRef(ref, parsed, label) {
  const value = String(ref || "").trim();
  if (!value) {
    fail(`${label} execution plan ref is empty`);
    return;
  }
  if (value.startsWith("file:") || value.startsWith("artifact:") || value.startsWith("checker:")) {
    checkEvidenceRef(value, parsed, label);
  } else {
    fail(`${label} execution plan ref must resolve to file:, artifact:, or known checker: record in precise completion: ${value}`);
  }
}

function checkApprovalRef(ref, parsed, label) {
  const value = String(ref || "").trim();
  if (!value) {
    fail(`${label} approval ref is empty`);
    return;
  }
  if (/TODO|TBD|placeholder|<.*>/i.test(value)) {
    fail(`${label} approval ref is placeholder: ${value}`);
    return;
  }
  if (value.startsWith("file:") || value.startsWith("artifact:") || value.startsWith("checker:")) {
    checkEvidenceRef(value, parsed, label);
    return;
  }
  if (value.startsWith("human-decision:") || value.startsWith("approval:")) {
    const id = value.replace(/^(human-decision|approval):/, "");
    if (!id || path.isAbsolute(id) || id.includes("..")) fail(`${label} approval ref must be bounded and safe: ${value}`);
    else pass(`${label} records bounded approval ref ${value}`);
    return;
  }
  fail(`${label} approval ref has unsupported prefix ${value}`);
}

function checkSourceDigest(item, parsed, label, strictSourceBinding) {
  const reportDigest = String(item.report_digest || "").trim();
  const evidenceDigest = String(item.evidence_digest || "").trim();
  const sourceRef = String(item.source_system_ref || item.ref || "").trim();
  if (reportDigest) {
    if (isShaDigest(reportDigest)) pass(`${label} source system ${item.name} report_digest is sha256`);
    else fail(`${label} source system ${item.name} report_digest must be sha256`);
    if (isFileOrArtifactRef(sourceRef)) {
      const resolved = resolveEvidenceRefPath(sourceRef);
      if (!resolved) {
        fail(`${label} source system ${item.name} report_digest source is unresolved: ${sourceRef}`);
      } else {
        const actual = fileDigest(resolved);
        if (actual === reportDigest) pass(`${label} source system ${item.name} report_digest matches source file`);
        else fail(`${label} source system ${item.name} report_digest does not match source file`);
      }
    }
  }
  if (evidenceDigest) {
    if (isShaDigest(evidenceDigest)) pass(`${label} source system ${item.name} evidence_digest is sha256`);
    else fail(`${label} source system ${item.name} evidence_digest must be sha256`);
  }
  if (!strictSourceBinding || item.status !== "RECORDED") return;
  if (isFileOrArtifactRef(sourceRef)) {
    if (reportDigest) pass(`${label} source system ${item.name} has file-backed report digest`);
    else fail(`${label} source system ${item.name} requires report_digest for file-backed source evidence`);
  } else if (sourceRef.startsWith("checker:")) {
    if (evidenceDigest) pass(`${label} source system ${item.name} has checker-backed evidence digest`);
    else fail(`${label} source system ${item.name} requires evidence_digest for checker-backed source evidence`);
  } else {
    fail(`${label} source system ${item.name} must use file:, artifact:, or checker: source_system_ref in precise mode`);
  }
  if (!reportDigest && !evidenceDigest) {
    fail(`${label} source system ${item.name} requires report_digest or evidence_digest in precise mode`);
  }
}

function isFileOrArtifactRef(ref) {
  const value = String(ref || "").trim();
  return value.startsWith("file:") || value.startsWith("artifact:");
}

function isAllowedPlannedTargetPath(value) {
  const item = String(value || "").trim();
  if (!item) return false;
  if (item === "N/A") return true;
  if (["*", "**", "/*", "/", "REQUIRES_EXPLICIT_EXECUTION_PLAN"].includes(item)) return false;
  if (path.isAbsolute(item) || item.includes("..")) return false;
  if (item.includes("*") && !item.endsWith("/**")) return false;
  if (item.endsWith("/**")) {
    const base = item.slice(0, -3);
    return Boolean(base) && !base.includes("*") && !path.isAbsolute(base) && !base.includes("..");
  }
  return true;
}

function isChangedFileCoveredByPlan(file, plannedPaths) {
  const changed = String(file || "").trim();
  if (!changed || path.isAbsolute(changed) || changed.includes("..")) return false;
  for (const item of plannedPaths || []) {
    const planned = String(item || "").trim();
    if (!isAllowedPlannedTargetPath(planned) || planned === "N/A") continue;
    if (planned.endsWith("/**")) {
      const base = planned.slice(0, -3);
      if (changed === base || changed.startsWith(`${base}/`)) return true;
    } else if (changed === planned) {
      return true;
    }
  }
  return false;
}

function evidenceRefExists(ref) {
  return Boolean(resolveEvidenceRefPath(ref));
}

function resolveEvidenceRefPath(ref) {
  const value = String(ref || "").trim();
  if (!isFileOrArtifactRef(value)) return "";
  const filePath = value.replace(/^(file|artifact):/, "");
  if (!filePath || path.isAbsolute(filePath) || filePath.includes("..")) return "";
  const direct = path.join(projectRoot, filePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const managed = path.join(projectRoot, ".intentos", filePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isFile()) return managed;
  return "";
}

function isShaDigest(value) {
  return /^sha256:[a-f0-9]{64}$/.test(String(value || ""));
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function collectEvidenceRefs(parsed) {
  const refs = [];
  for (const item of parsed.completion_contract?.criteria || []) refs.push(...(item.evidence_refs || []));
  for (const item of parsed.planned_impact_map?.surfaces || []) refs.push(...(item.evidence_refs || []));
  for (const item of parsed.evidence_bindings || []) refs.push(item.evidence_ref);
  refs.push(...(parsed.review?.review_refs || []));
  return refs.filter(Boolean);
}

function requireSection(content, section, label) {
  if (sectionBody(content, section) !== null) pass(`${label} includes ${section}`);
  else fail(`${label} missing ${section}`);
}

function tableRows(body) {
  return body
    .split(/\r?\n/)
    .filter((line) => /^\s*\|/.test(line) && !/^\s*\|\s*-+/.test(line))
    .slice(1)
    .map(splitMarkdownRow);
}

function tableValue(body, field) {
  for (const row of tableRows(body)) {
    if (stripMarkdown(row[0] || "") === field) return stripMarkdown(row[1] || "");
  }
  return "";
}

function tableListValue(body, field) {
  return normalizeList(tableValue(body, field));
}

function normalizeList(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(",");
  return source
    .map((item) => stripMarkdown(String(item || "")).trim())
    .filter(Boolean)
    .filter((item) => !/^(N\/A|none)$/i.test(item));
}

function sameList(left, right) {
  if (left.length !== right.length) return false;
  return left.every((item, index) => item === right[index]);
}

function fencedJson(body) {
  const match = body.match(/```json\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : "";
}

function firstCodeValue(body) {
  const match = body.match(/`([^`]+)`/);
  return match ? match[1].trim() : "";
}

function markdownFiles(dir) {
  const roots = [
    path.join(projectRoot, dir),
    path.join(projectRoot, ".intentos", dir),
  ];
  const files = [];
  for (const root of roots) collectMarkdown(root, files);
  return [...new Set(files)].sort();
}

function collectMarkdown(dir, files) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectMarkdown(full, files);
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed)) return managed;
  return "";
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isDirectory()) return managed;
  return "";
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function displayAsset(relativePath, resolved) {
  return resolved.includes(`${path.sep}.intentos${path.sep}`) ? `.intentos/${relativePath}` : relativePath;
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath) || ".";
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", checks }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Execution assurance check passed.");
  }
  process.exit(failed ? 1 : 0);
}
