#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { extractMachineReadableEvidence, loadSchema, validateEvidenceBlock, validateSchema } from "./lib/artifact-schema.mjs";
import { canonicalFileDigest, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { validateControlEffectivenessBinding } from "./lib/control-effectiveness.mjs";
import { validatePlanReviewSourceEvidence } from "./lib/plan-review-binding.mjs";
import { deriveConsumerOutcome } from "./lib/check-result.mjs";
import {
  planContainsCurrentIntent,
  requiredImplementationSources,
  validateTaskObligationProjection,
} from "./lib/task-obligations.mjs";
import {
  normalizeTaskIntent,
  resolveWorkQueueTaskIdentity,
  taskIntentDigest,
  validateTaskGovernanceLineage,
} from "./lib/task-entry-binding.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence", "require-current-task-lineage", "strict"]);
const unknown = unknownOptions(args, knownFlags);
const requestedProjectRoot = path.resolve(process.cwd(), args._[0] || ".");
const projectRoot = fs.existsSync(requestedProjectRoot) ? fs.realpathSync(requestedProjectRoot) : requestedProjectRoot;
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const requireCurrentTaskLineage = Boolean(args["require-current-task-lineage"] || args.strict);
const strictRequested = requireReport || requireStructuredEvidence || requireCurrentTaskLineage || Boolean(args.report);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/plan-review.schema.json");
const taskGovernanceSchema = loadSchema(projectRoot, "schemas/artifacts/task-governance.schema.json");
const businessUniverseSchema = loadSchema(projectRoot, "schemas/artifacts/business-universe-coverage.schema.json");
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
  "core/plan-review-gate.md",
  "docs/plan-review-gate.md",
  "templates/plan-review-report.md",
  "schemas/artifacts/plan-review.schema.json",
  "checklists/plan-review-gate-review.md",
  "prompts/plan-review-gate-agent.md",
  "scripts/resolve-plan-review.mjs",
  "scripts/check-plan-review.mjs",
];
const requiredDirectories = ["plan-review-reports"];
const requiredSections = [
  "Human Summary",
  "Plan Identity",
  "Task Governance Binding",
  "Review Surface Analysis",
  "Review Surface Matrix",
  "Source Chain",
  "Reviewed Surfaces",
  "Findings",
  "Revision Loop",
  "Verification Command Review",
  "Subagent Review Routing",
  "Boundaries",
  "Outcome",
  "Machine-Readable Evidence",
];
const states = new Set([
  "NO_PLAN_REQUIRED",
  "PLAN_REQUIRED",
  "PLAN_DRAFTED",
  "PLAN_REVIEW_REQUIRED",
  "PLAN_REVISION_REQUIRED",
  "PLAN_REVIEW_PASSED",
  "BLOCKED_BY_STALE_PLAN",
  "BLOCKED_BY_INCOMPLETE_REVIEW",
  "BLOCKED_BY_USER_DECISION",
  "BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE",
  "PLAN_REVIEW_REQUIRED_WITH_TASK_GOVERNANCE_RECHECK",
]);
const forbiddenUserBurden = [
  /Task Governance/i,
  /Review Surface/i,
  /Business Rule Closure/i,
  /Change Impact Coverage/i,
  /Verification Plan/i,
  /Plan Review Gate/i,
  /choose technical/i,
  /select review surfaces/i,
  /选择.*审查面/,
];

let failed = false;
const checks = [];
const observedStates = [];

if (!outputJson) {
  console.log("# Plan Review Gate Check");
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
  if (!shouldRequireAssets) return;
  const combined = [
    readResolved("core/plan-review-gate.md"),
    readResolved("docs/plan-review-gate.md"),
    readResolved("templates/plan-review-report.md"),
    readResolved("schemas/artifacts/plan-review.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Plan Review Gate",
    "PLAN_REVIEW_PASSED",
    "NO_PLAN_REQUIRED",
    "PLAN_REVISION_REQUIRED",
    "Task Governance remains the source of truth",
    "Review Surface Governance remains the source of truth",
    "A derived review-surface matrix is helper evidence only",
    "does not authorize implementation",
    "does not execute tests",
  ]) {
    if (combined.includes(marker)) pass(`plan review docs include ${marker}`);
    else fail(`plan review docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("plan-review-reports");
  if (files.length === 0) {
    if (allowEmpty && !strictRequested) pass("plan review check skipped by explicit --allow-empty: no reports");
    else if (strictRequested) fail("no Plan Review reports found");
    else pass("SKIPPED_NO_REPORT: no Plan Review reports found");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Plan Review report ${file}`);
      continue;
    }
    checkReport(file);
  }
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const section of requiredSections) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  if (/authorizes implementation:\s*Yes/i.test(content)
    || /approves release or production:\s*Yes/i.test(content)
    || /executes tests:\s*Yes/i.test(content)
    || /implementation approved/i.test(content)
    || /release approved/i.test(content)) {
    fail(`${label} contains forbidden authorization claim`);
  }
  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence || requireCurrentTaskLineage,
    digestField: "plan_review_digest",
  });
  if (!result.present && !requireStructuredEvidence && !requireCurrentTaskLineage) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  const evidence = result.value;
  observedStates.push(evidence.plan_review_state);
  pass(`${label} has valid structured evidence`);
  checkStructuredEvidence(content, label, file, evidence);
}

function checkStructuredEvidence(content, label, file, evidence) {
  const normalizedIntent = normalizeTaskIntent(evidence.intent);
  if (evidence.intent === normalizedIntent && evidence.intent_digest === taskIntentDigest(normalizedIntent)) {
    pass(`${label} intent text and digest are canonical`);
  } else if (evidence.schema_version === "1.113.0") {
    fail(`${label} 1.113 intent_digest must be recomputed from normalized intent`);
  }
  checkWorkQueueTaskLineage(label, file, evidence);
  if (reportRefCandidates(file).includes(evidence.plan_review_ref)) pass(`${label} plan_review_ref points to this report`);
  else fail(`${label} plan_review_ref ${evidence.plan_review_ref || "<missing>"} must point to this report`);
  if (states.has(evidence.plan_review_state)) pass(`${label} has valid plan_review_state`);
  else fail(`${label} has invalid plan_review_state`);
  if (evidence.outcome === evidence.plan_review_state) pass(`${label} outcome matches plan_review_state`);
  else fail(`${label} outcome must match plan_review_state`);
  if (stripMarkdown(sectionBody(content, "Outcome") || "").includes(evidence.outcome)) pass(`${label} Markdown outcome matches structured outcome`);
  else fail(`${label} Markdown Outcome must include structured outcome`);

  checkBoundaries(label, evidence);
  checkUserFacingText(label, evidence);
  checkPlanIdentity(label, file, evidence);
  checkPlanContentReview(content, label, evidence);
  checkTaskGovernance(label, file, evidence);
  checkBusinessUniverseBinding(label, file, evidence);
  checkControlEffectivenessBinding(label, file, evidence);
  checkSkipRules(label, evidence);
  checkReviewSurfaces(label, evidence);
  checkSourceChain(label, evidence);
  const sourceValidation = validatePlanReviewSourceEvidence(projectRoot, file, evidence, {
    requireCurrentTaskLineage,
  });
  sourceValidation.errors.forEach((error) => fail(`${label} ${error}`));
  if (sourceValidation.ok) pass(`${label} source refs resolve and digests match project files`);
  checkFindings(label, evidence);
  checkSubagents(label, evidence);
  checkVerificationReview(label, evidence);
  checkRevisionLoop(label, evidence);
  checkPassRules(label, evidence);
  checkMarkdownConsistency(content, label, evidence);
}

function checkWorkQueueTaskLineage(label, file, evidence) {
  if (!requireCurrentTaskLineage && (!evidence.work_queue_item_ref || evidence.work_queue_item_ref === "N/A")) {
    pass(`${label} Work Queue task lineage is optional in historical compatibility mode`);
    return;
  }
  const task = resolveWorkQueueTaskIdentity(projectRoot, evidence.work_queue_item_ref, { fromFile: file, requireCurrent: true });
  if (!task.ok) {
    if (requireCurrentTaskLineage) fail(`${label} ${task.error}`);
    else pass(`${label} historical Work Queue binding is not current task authority`);
    return;
  }
  if (evidence.work_queue_item_digest === task.identity.work_queue_item_digest) pass(`${label} Work Queue item digest binds the exact task instance`);
  else fail(`${label} work_queue_item_digest must match the exact Work Queue task instance`);
  if (evidence.task_ref === task.identity.task_ref
    && evidence.intent === task.identity.intent
    && evidence.intent_digest === task.identity.intent_digest) {
    pass(`${label} Work Queue, task_ref, intent text, and intent_digest are exact`);
  } else {
    fail(`${label} Work Queue task identity must match Plan Review exactly`);
  }
}

function checkBusinessUniverseBinding(label, reportFile, evidence) {
  const binding = evidence.business_universe_binding;
  if (!["1.108.0", "1.110.0", "1.113.0"].includes(evidence.schema_version)) return;
  if (!binding) {
    fail(`${label} 1.108 plan review requires business_universe_binding`);
    return;
  }
  if (binding.required === "No") {
    if (binding.routing_result === "NOT_REQUIRED_WITH_REASON"
      && binding.business_universe_ref === "N/A"
      && binding.business_universe_digest === "N/A"
      && binding.coverage_mapping_status === "NOT_REQUIRED"
      && binding.scenario_review_status === "NOT_REQUIRED"
      && (evidence.plan_scenario_reviews || []).length === 0) pass(`${label} non-required Business Universe uses a bounded N/A binding`);
    else fail(`${label} non-required Business Universe must use N/A ref and digest`);
    return;
  }
  if (binding.required === "Unknown") {
    if (binding.routing_result === "TECHNICAL_INSPECTION_REQUIRED"
      && binding.coverage_mapping_status === "BLOCKED"
      && binding.scenario_review_status === "BLOCKED"
      && evidence.plan_review_state === "BLOCKED_BY_INCOMPLETE_REVIEW") {
      pass(`${label} unresolved Business Universe inspection blocks Plan Review`);
    } else {
      fail(`${label} unresolved Business Universe inspection must remain blocked`);
    }
    return;
  }
  if (binding.routing_result !== "REQUIRED_WITH_EVIDENCE") fail(`${label} required Business Universe must use evidence-backed routing`);
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, reportFile, binding.business_universe_ref);
  if (!resolved.ok) {
    fail(`${label} Business Universe ref is unsafe or unresolved: ${binding.business_universe_ref}`);
    return;
  }
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok || extracted.value?.artifact_type !== "business_universe_coverage") {
    fail(`${label} Business Universe ref has no valid structured evidence`);
    return;
  }
  const universe = extracted.value;
  const validation = validateSchema(universe, businessUniverseSchema, { label: `${label} Business Universe` });
  if (validation.ok) pass(`${label} Business Universe structured evidence is valid`);
  else validation.errors.forEach(fail);
  const checker = path.join(path.dirname(fileURLToPath(import.meta.url)), "check-business-universe-coverage.mjs");
  const universeReportRef = resolved.relativePath;
  const checkResult = spawnSync(process.execPath, [checker, projectRoot, "--report", universeReportRef, "--require-structured-evidence", "--require-ready"], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  if (checkResult.status === 0) pass(`${label} Business Universe passes strict ready validation`);
  else fail(`${label} Business Universe failed strict ready validation: ${(checkResult.stderr || checkResult.stdout).trim()}`);
  if (binding.business_universe_digest === universe.coverage_digest && binding.business_universe_state === universe.outcome) {
    pass(`${label} Business Universe ref, digest, and state are exact`);
  } else {
    fail(`${label} Business Universe digest or state does not match the referenced report`);
  }
  if (universe.outcome === "COVERAGE_READY") pass(`${label} Business Universe is COVERAGE_READY`);
  else fail(`${label} required Business Universe must be COVERAGE_READY`);
  if (universe.task_ref === evidence.task_ref) pass(`${label} Business Universe task matches Plan Review task`);
  else fail(`${label} Business Universe task must match Plan Review task`);
  const universeScenarioIds = uniqueStrings((universe.coverage_scenarios || []).map((item) => item.coverage_scenario_id));
  if (sameStringSet(binding.coverage_scenario_ids, universeScenarioIds) && universeScenarioIds.length > 0) {
    pass(`${label} Plan Review binds the exact Business Universe scenario set`);
  } else {
    fail(`${label} Plan Review must bind the exact non-empty Business Universe scenario set`);
  }
  const reviews = evidence.plan_scenario_reviews || [];
  const mappedScenarioIds = uniqueStrings(reviews.flatMap((item) => item.source_coverage_scenario_ids || []));
  if (sameStringSet(mappedScenarioIds, universeScenarioIds) && reviews.length > 0) {
    pass(`${label} every Business Universe scenario has a Plan Review row`);
  } else {
    fail(`${label} Plan Review scenario rows must cover every and only Business Universe scenario`);
  }
  const knownSurfaces = new Set((evidence.review_surface_matrix || []).map((item) => item.surface));
  if (reviews.every((item) => item.review_state === "REVIEWED"
    && item.lifecycle_reviewed === "Yes"
    && item.provenance_reviewed === "Yes"
    && item.negative_or_reverse_reviewed === "Yes"
    && (item.reviewed_surfaces || []).length > 0
    && item.reviewed_surfaces.every((surface) => knownSurfaces.has(surface)))) {
    pass(`${label} Plan Review covers lifecycle, provenance, reverse behavior, and declared review surfaces`);
  } else {
    fail(`${label} every Business Universe scenario requires complete lifecycle, provenance, reverse, and surface review`);
  }
  if ([binding.coverage_mapping_status, binding.scenario_review_status, binding.lifecycle_review_status, binding.provenance_review_status]
    .every((status) => status === "COMPLETE")) {
    pass(`${label} Business Universe review projections are complete`);
  } else {
    fail(`${label} all Business Universe review projections must be COMPLETE`);
  }
  const expectedChallengerRequired = universe.challenger_review?.required === "Yes" ? "Yes" : "No";
  const expectedChallengerStatus = universe.challenger_review?.status || "NOT_REQUIRED";
  if (binding.challenger_required !== expectedChallengerRequired || binding.challenger_status !== expectedChallengerStatus) {
    fail(`${label} Challenger projection must match Business Universe evidence`);
  } else if (binding.challenger_required === "Yes" && binding.challenger_status !== "PASSED") {
    fail(`${label} required Business Universe Challenger must pass`);
  } else {
    pass(`${label} Challenger projection is exact and non-blocking`);
  }
  const chain = (evidence.source_chain || []).find((item) => item.source_kind === "business_universe_coverage");
  const sameRef = chain && normalizeEvidenceRef(chain.source_ref) === normalizeEvidenceRef(binding.business_universe_ref);
  if (sameRef && chain.source_digest === canonicalFileDigest(resolved.file)) {
    pass(`${label} source_chain preserves Business Universe binding`);
  } else {
    fail(`${label} source_chain must include the exact Business Universe report and file digest`);
  }
}

function checkControlEffectivenessBinding(label, reportFile, evidence) {
  if (!["1.110.0", "1.113.0"].includes(evidence.schema_version)) return;
  if (!sectionBody(fs.readFileSync(reportFile, "utf8"), "Control Effectiveness Binding")) {
    fail(`${label} 1.110 plan review missing Control Effectiveness Binding section`);
  }
  const required = evidence.control_effectiveness_binding?.requirement === "REQUIRED";
  const validation = validateControlEffectivenessBinding(projectRoot, evidence.control_effectiveness_binding, {
    required,
    fromFile: reportFile,
    taskRef: evidence.task_ref,
  });
  if (validation.ok) pass(`${label} Control Effectiveness binding is exact, current, and strict`);
  else validation.errors.forEach((error) => fail(`${label} ${error}`));
  const chain = (evidence.source_chain || []).find((item) => item.source_kind === "control_effectiveness");
  if (!required && !chain) {
    pass(`${label} source_chain does not fabricate non-required Control Effectiveness evidence`);
  } else if (required
    && chain
    && chain.source_ref === evidence.control_effectiveness_binding.report_ref
    && chain.source_digest === evidence.control_effectiveness_binding.report_digest
    && chain.source_state === evidence.control_effectiveness_binding.assessment_outcome) {
    pass(`${label} source_chain preserves the exact required Control Effectiveness binding`);
  } else {
    fail(`${label} source_chain must contain exactly the required Control Effectiveness evidence`);
  }
  if (required && evidence.control_effectiveness_binding.status !== "VERIFIED" && evidence.plan_review_state === "PLAN_REVIEW_PASSED") {
    fail(`${label} cannot pass Plan Review while a relied-on control is unproven`);
  }
}

function normalizeEvidenceRef(value) {
  return String(value || "").trim().replace(/^(artifact|file):/, "");
}

function uniqueStrings(values) {
  return [...new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean))].sort();
}

function sameStringSet(left, right) {
  const a = uniqueStrings(left);
  const b = uniqueStrings(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function checkBoundaries(label, evidence) {
  const boundaries = evidence.boundaries || {};
  for (const [field, expected] of [
    ["writes_target_files", "No"],
    ["authorizes_implementation", "No"],
    ["approves_commit_or_push", "No"],
    ["approves_release_or_production", "No"],
    ["executes_tests", "No"],
    ["changes_production", "No"],
  ]) {
    if (boundaries[field] === expected) pass(`${label} boundary ${field} is ${expected}`);
    else fail(`${label} boundary ${field} must be ${expected}`);
  }
  if (evidence.implementation_authorized_by_this_report === "No") pass(`${label} implementation_authorized_by_this_report is No`);
  else fail(`${label} implementation_authorized_by_this_report must be No`);
}

function checkUserFacingText(label, evidence) {
  const text = `${evidence.plain_user_summary || ""}\n${evidence.plain_next_step || ""}`;
  if (text.trim()) pass(`${label} has plain user summary and next step`);
  else fail(`${label} must include plain user summary and next step`);
  if (evidence.technical_terms_required === "No") pass(`${label} technical_terms_required is No`);
  else fail(`${label} technical_terms_required must be No`);
  for (const pattern of forbiddenUserBurden) {
    if (pattern.test(text)) fail(`${label} user-facing text exposes technical workflow burden: ${pattern.source}`);
  }
}

function checkPlanIdentity(label, file, evidence) {
  if (evidence.plan_review_state === "NO_PLAN_REQUIRED") {
    if (evidence.plan_ref === "N/A" && evidence.plan_digest === "N/A") pass(`${label} NO_PLAN_REQUIRED uses N/A plan identity`);
    else fail(`${label} NO_PLAN_REQUIRED must use plan_ref=N/A and plan_digest=N/A`);
    return;
  }
  if (!evidence.plan_ref || evidence.plan_ref === "N/A") {
    if (["PLAN_REQUIRED", "PLAN_REVIEW_REQUIRED", "PLAN_DRAFTED"].includes(evidence.plan_review_state)) pass(`${label} missing plan ref is compatible with required/drafted state`);
    else fail(`${label} must include concrete plan_ref unless no plan is required`);
    return;
  }
  const planPath = resolveRelativeFile(evidence.plan_ref);
  if (!planPath) {
    if (["PLAN_REQUIRED", "BLOCKED_BY_STALE_PLAN"].includes(evidence.plan_review_state)) pass(`${label} unresolved plan ref is blocked`);
    else fail(`${label} plan_ref does not resolve: ${evidence.plan_ref}`);
    return;
  }
  const actual = fileDigest(planPath);
  if (evidence.plan_digest === actual) pass(`${label} plan_digest matches plan file`);
  else if (evidence.plan_review_state === "BLOCKED_BY_STALE_PLAN") pass(`${label} stale plan digest is blocked`);
  else fail(`${label} plan_digest does not match plan file`);
  if (evidence.schema_version === "1.113.0") {
    const observed = planContainsCurrentIntent(fs.readFileSync(planPath, "utf8"), {
      intent: evidence.intent,
      intentDigest: evidence.intent_digest,
    }) ? "Yes" : "No";
    if (evidence.plan_task_match === observed) pass(`${label} plan_task_match is derived from current intent evidence`);
    else fail(`${label} plan_task_match ${evidence.plan_task_match || "<missing>"} does not match current plan content (${observed})`);
    if (evidence.plan_review_state === "PLAN_REVIEW_PASSED" && observed !== "Yes") {
      fail(`${label} PLAN_REVIEW_PASSED requires the plan to contain the exact current intent digest`);
    }
  }
}

function checkPlanContentReview(reportContent, label, evidence) {
  if (evidence.schema_version !== "1.113.0") return;
  const recorded = evidence.plan_content_review || {};
  if (!sectionBody(reportContent, "Plan Content Review")) {
    fail(`${label} current Plan Review must expose Plan Content Review in Markdown`);
  }
  if (evidence.plan_review_state === "NO_PLAN_REQUIRED") {
    if (recorded.status === "NOT_REQUIRED") pass(`${label} LOW no-plan task records Plan Content Review as NOT_REQUIRED`);
    else fail(`${label} NO_PLAN_REQUIRED must record Plan Content Review as NOT_REQUIRED`);
    return;
  }
  const planPath = resolveRelativeFile(evidence.plan_ref);
  if (!planPath) return;
  const observed = derivePlanContentReview(fs.readFileSync(planPath, "utf8"), true);
  if (JSON.stringify(recorded) === JSON.stringify(observed)) {
    pass(`${label} Plan Content Review is recomputed from the exact plan`);
  } else {
    fail(`${label} Plan Content Review does not match the exact plan content`);
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED" && observed.status !== "COMPLETE") {
    fail(`${label} PLAN_REVIEW_PASSED requires complete scope, boundaries, implementation sequence, verification, rollback/recovery, and target refs`);
  } else if (evidence.plan_review_state === "PLAN_REVIEW_PASSED") {
    pass(`${label} PLAN_REVIEW_PASSED has complete plan semantics`);
  }
}

function checkTaskGovernance(label, reportFile, evidence) {
  const taskGovernance = evidence.task_governance || {};
  if (evidence.task_impact !== taskGovernance.task_impact) {
    fail(`${label} plan review must not override Task Governance task impact`);
  } else {
    pass(`${label} task impact matches Task Governance`);
  }
  if (taskGovernance.task_ref === evidence.task_ref) pass(`${label} Task Governance task_ref matches report task_ref`);
  else fail(`${label} Task Governance task_ref must match report task_ref`);
  if (taskGovernance.current_task_match === "Yes" || evidence.plan_review_state === "NO_PLAN_REQUIRED") pass(`${label} Task Governance current task match is acceptable`);
  else fail(`${label} Task Governance current_task_match must be Yes`);
  if (["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact)) {
    if (taskGovernance.ref && taskGovernance.ref !== "N/A") pass(`${label} high-impact review includes Task Governance ref`);
    else fail(`${label} high-impact review requires Task Governance ref`);
    if (taskGovernance.digest && /^sha256:[a-f0-9]{64}$/.test(taskGovernance.digest)) pass(`${label} high-impact review includes Task Governance digest`);
    else fail(`${label} high-impact review requires Task Governance digest`);
    if (taskGovernance.plan_review_required === "Yes") pass(`${label} high-impact Task Governance requires plan review`);
    else fail(`${label} high-impact Task Governance must require plan review`);
  }
  if (taskGovernance.digest === zeroDigest()) fail(`${label} Task Governance digest mismatch sentinel is blocked`);
  if (evidence.schema_version !== "1.113.0") return;
  if (taskGovernance.intent_digest === evidence.intent_digest) pass(`${label} Task Governance intent_digest matches Plan Review`);
  else fail(`${label} Task Governance intent_digest must match Plan Review intent_digest`);
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, reportFile, taskGovernance.ref, { markdownOnly: true });
  if (!resolved.ok) {
    fail(`${label} Task Governance ref is unsafe or unresolved: ${taskGovernance.ref || "<missing>"}`);
    return;
  }
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok || extracted.value?.artifact_type !== "task_governance") {
    fail(`${label} Task Governance ref must contain task_governance structured evidence`);
    return;
  }
  const authority = extracted.value;
  const validation = validateSchema(authority, taskGovernanceSchema, { label: `${label} Task Governance` });
  if (validation.ok) pass(`${label} Task Governance structured evidence is valid`);
  else validation.errors.forEach((error) => fail(error));
  const normalizedAuthorityIntent = normalizeTaskIntent(authority.intent);
  if (authority.task_ref === evidence.task_ref
    && authority.intent === normalizedAuthorityIntent
    && authority.intent === evidence.intent
    && authority.intent_digest === taskIntentDigest(normalizedAuthorityIntent)
    && authority.intent_digest === evidence.intent_digest) {
    pass(`${label} Task Governance binds the exact current task, intent text, and digest`);
  } else {
    fail(`${label} Task Governance must bind the exact current task, intent text, and digest`);
  }
  const currentAuthorityRequired = requireCurrentTaskLineage
    || (evidence.schema_version === "1.113.0" && ["PLAN_REVIEW_PASSED", "NO_PLAN_REQUIRED"].includes(evidence.plan_review_state));
  const lineage = validateTaskGovernanceLineage(projectRoot, authority, {
    fromFile: resolved.file,
    requireCurrent: currentAuthorityRequired,
  });
  if (lineage.ok) pass(`${label} Task Governance lineage resolves to its exact Work Queue task instance`);
  else lineage.errors.forEach((error) => fail(`${label} ${error}`));
  if (lineage.current) {
    const authorityLineage = authority.task_lineage || {};
    if (normalizeEvidenceRef(evidence.work_queue_item_ref) === normalizeEvidenceRef(authorityLineage.work_queue_item_ref)
      && evidence.work_queue_item_digest === authorityLineage.work_queue_item_digest) {
      pass(`${label} Plan Review and Task Governance bind the same Work Queue item lineage`);
    } else {
      fail(`${label} Plan Review Work Queue lineage must match Task Governance exactly`);
    }
  }
  if (taskGovernance.digest === authority.task_governance_digest) pass(`${label} Task Governance digest matches authoritative evidence`);
  else fail(`${label} Task Governance digest must match authoritative evidence`);
  if (taskGovernance.outcome === authority.outcome) pass(`${label} Task Governance outcome matches authoritative evidence`);
  else fail(`${label} Task Governance outcome must match authoritative evidence`);
  const exactProjection = JSON.stringify(taskGovernance.required_before_implementation_review)
      === JSON.stringify(authority.required_before_implementation_review)
    && JSON.stringify(taskGovernance.required_before_completion_claim)
      === JSON.stringify(authority.required_before_completion_claim);
  if (exactProjection) pass(`${label} Task Governance obligation projection matches authoritative evidence`);
  else fail(`${label} Task Governance obligation projection must match authoritative evidence`);
  const obligations = validateTaskObligationProjection(authority);
  if (obligations.ok && taskGovernance.obligations_valid === "Yes") pass(`${label} Task Governance minimum obligations are monotonic`);
  else fail(`${label} Task Governance minimum obligations are incomplete: ${obligations.missing.join(", ") || "projection marked invalid"}`);
  if (["BLOCKED_BY_ADOPTION_REVIEW", "POSSIBLE_HIGH_NEEDS_CLARIFICATION"].includes(authority.outcome)
    && evidence.plan_review_state === "PLAN_REVIEW_PASSED") {
    fail(`${label} unresolved Task Governance outcome cannot produce PLAN_REVIEW_PASSED`);
  }
}

function checkSkipRules(label, evidence) {
  if (evidence.plan_review_state !== "NO_PLAN_REQUIRED") return;
  const skip = evidence.skip_review || {};
  if (evidence.task_impact === "LOW" && evidence.task_governance?.task_impact === "LOW") pass(`${label} NO_PLAN_REQUIRED is backed by LOW Task Governance`);
  else fail(`${label} NO_PLAN_REQUIRED requires LOW Task Governance`);
  if (skip.skip_allowed === "Yes" && skip.skip_source === "task_governance" && skip.skip_reason && skip.skip_reason !== "N/A") {
    pass(`${label} NO_PLAN_REQUIRED has structured skip reason`);
  } else {
    fail(`${label} NO_PLAN_REQUIRED requires structured Task Governance skip reason`);
  }
}

function checkReviewSurfaces(label, evidence) {
  if (evidence.plan_review_state === "NO_PLAN_REQUIRED") {
    pass(`${label} review surface matrix is informational for NO_PLAN_REQUIRED`);
    return;
  }
  const matrix = evidence.review_surface_matrix || [];
  const required = evidence.required_review_surfaces || [];
  if (["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact)) {
    if (matrix.length > 0) pass(`${label} high-impact review has review surface matrix`);
    else fail(`${label} high-impact review requires review surface matrix`);
    if (evidence.review_surface_analysis?.ref && evidence.review_surface_analysis.ref !== "N/A") pass(`${label} high-impact review has review surface analysis`);
    else fail(`${label} high-impact review requires review surface analysis or derived matrix`);
    if (evidence.review_surface_analysis?.user_selected_surfaces === "No") pass(`${label} review surfaces are not delegated to user selection`);
    else fail(`${label} must not ask user to choose technical review surfaces`);
  }
  const surfaceMap = new Map(matrix.map((item) => [item.surface, item]));
  if (evidence.schema_version === "1.113.0"
    && evidence.plan_review_state === "PLAN_REVIEW_PASSED"
    && matrix.some((item) => item.human_decision_needed === "Yes")) {
    fail(`${label} current solo Plan Review cannot pass while technical review surfaces are delegated to a human`);
  } else if (evidence.schema_version === "1.113.0" && evidence.plan_review_state === "PLAN_REVIEW_PASSED") {
    pass(`${label} current solo Plan Review keeps technical review surfaces Codex-owned`);
  }
  for (const item of matrix) {
    if (item.required === "Yes" && !required.includes(item.surface)) {
      fail(`${label} required review surface matrix entry is missing from required_review_surfaces: ${item.surface}`);
    }
  }
  for (const surface of required) {
    const item = surfaceMap.get(surface);
    if (!item) {
      fail(`${label} required review surface missing from matrix: ${surface}`);
      continue;
    }
    if (item.required === "Yes" && item.reviewed === "Yes") pass(`${label} required surface reviewed: ${surface}`);
    else if (evidence.plan_review_state === "BLOCKED_BY_INCOMPLETE_REVIEW") pass(`${label} incomplete surface is blocked: ${surface}`);
    else fail(`${label} required surface not reviewed: ${surface}`);
  }
  if ((evidence.reviewed_surfaces || []).some((item) => item.surface === "review_surface_card_approval")) {
    fail(`${label} treats Review Surface Card as implementation approval`);
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED" && ["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact)) {
    const analysis = evidence.review_surface_analysis || {};
    const sourceKinds = new Set((evidence.source_chain || []).map((source) => source.source_kind));
    const hasAuthoritativeSurfaceSource = ["review_surface_card", "project_native_review_surface", "project_native_equivalent"]
      .some((kind) => sourceKinds.has(kind))
      || ["review_surface_card", "project_native_equivalent"].includes(analysis.source);
    if (analysis.source === "derived_plan_review_matrix" || analysis.derived_by_plan_review === "Yes") {
      if (hasAuthoritativeSurfaceSource) {
        pass(`${label} derived review surface matrix is backed by project-native Review Surface source`);
      } else {
        fail(`${label} derived review surface matrix cannot satisfy high-impact PLAN_REVIEW_PASSED without project-native Review Surface source`);
      }
    } else if (hasAuthoritativeSurfaceSource) {
      pass(`${label} high-impact pass has project-native Review Surface source`);
    } else {
      fail(`${label} high-impact PLAN_REVIEW_PASSED requires project-native Review Surface source`);
    }
  }
}

function checkSourceChain(label, evidence) {
  const chain = evidence.source_chain || [];
  const kinds = new Set(chain.map((source) => source.source_kind));
  if (evidence.schema_version === "1.113.0" && evidence.plan_review_state === "PLAN_REVIEW_PASSED") {
    const sourceKindByObligation = {
      business_universe: "business_universe_coverage",
      business_rule_closure: "business_rule_closure",
      change_impact_coverage: "change_impact_coverage",
      verification_plan: "verification_plan",
    };
    for (const obligation of requiredImplementationSources(evidence.task_governance)) {
      const sourceKind = sourceKindByObligation[obligation.source];
      if (!sourceKind) continue;
      if (kinds.has(sourceKind)) pass(`${label} current Task Governance obligation ${obligation.field} has source ${sourceKind}`);
      else fail(`${label} PLAN_REVIEW_PASSED requires ${sourceKind} for Task Governance obligation ${obligation.field}`);
    }
  }
  if (["HIGH", "POSSIBLE_HIGH"].includes(evidence.task_impact) && evidence.plan_review_state === "PLAN_REVIEW_PASSED") {
    if (chain.length > 0) pass(`${label} high-impact pass has source chain`);
    else fail(`${label} high-impact PLAN_REVIEW_PASSED requires source chain`);
    for (const requiredKind of ["task_governance", "verification_plan"]) {
      if (kinds.has(requiredKind)) pass(`${label} high-impact pass has source_chain kind ${requiredKind}`);
      else fail(`${label} high-impact PLAN_REVIEW_PASSED requires source_chain kind ${requiredKind}`);
    }
    if (["review_surface_card", "project_native_review_surface", "project_native_equivalent"].some((kind) => kinds.has(kind))) {
      pass(`${label} high-impact pass has source_chain Review Surface authority`);
    } else {
      fail(`${label} high-impact PLAN_REVIEW_PASSED requires source_chain Review Surface authority`);
    }
    const requiredSurfaces = new Set(evidence.required_review_surfaces || []);
    if (requiredSurfaces.has("business_rule")) {
      if (kinds.has("business_rule_closure")) pass(`${label} business-rule surface has source_chain business_rule_closure`);
      else fail(`${label} business-rule surface requires source_chain business_rule_closure`);
    }
    if (requiredSurfaces.has("data_destructive") || requiredSurfaces.has("frontend_backend_consistency")) {
      if (kinds.has("change_impact_coverage")) pass(`${label} impact-sensitive surface has source_chain change_impact_coverage`);
      else fail(`${label} impact-sensitive surface requires source_chain change_impact_coverage`);
    }
  }
  const seenKinds = new Set();
  for (const source of chain) {
    if (seenKinds.has(source.source_kind)) fail(`${label} duplicate source_chain kind ${source.source_kind}`);
    else seenKinds.add(source.source_kind);
    if (/^sha256:[a-f0-9]{64}$/.test(source.source_digest)) pass(`${label} source ${source.source_kind} has sha256 digest`);
    else fail(`${label} source ${source.source_kind} must have sha256 digest`);
    if (source.source_ref === "N/A" || path.isAbsolute(source.source_ref) || source.source_ref.includes("..")) {
      fail(`${label} source ${source.source_kind} has unsafe source_ref`);
    }
    if (source.current_task_match === "Yes" || source.current_task_match === "N/A") pass(`${label} source ${source.source_kind} current task match is acceptable`);
    else fail(`${label} source ${source.source_kind} current_task_match must be Yes or N/A`);
    if (source.source_digest === zeroDigest()) fail(`${label} source ${source.source_kind} digest mismatch sentinel is blocked`);
    if (/STALE|EXPIRED|OUTDATED/i.test(source.source_state)) fail(`${label} source ${source.source_kind} is stale`);
    if (source.contradicts_plan === "Yes") fail(`${label} source ${source.source_kind} contradicts plan`);
    if (source.source_kind === "business_rule_closure" && source.owner === "codex") {
      fail(`${label} business_rule_closure source cannot be owned by Codex`);
    }
  }
}

function checkFindings(label, evidence) {
  const findings = evidence.findings || [];
  const blocking = findings.filter((finding) => ["P0", "P1"].includes(finding.severity) && finding.resolved !== "Yes");
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED" && blocking.length > 0) {
    fail(`${label} PLAN_REVIEW_PASSED has unresolved P0/P1 findings`);
  }
  for (const finding of findings) {
    if (finding.severity === "P2" && finding.resolved !== "Yes" && finding.accepted === "Yes") {
      const ref = finding.accepted_by_ref || "";
      if (/^(human-decision|owner-decision|domain-owner):/.test(ref)
        && finding.acceptance_reason !== "N/A"
        && finding.acceptance_scope !== "N/A"
        && finding.expires_at !== "N/A"
        && finding.allowed_for_task_impact !== "N/A") {
        pass(`${label} P2 finding ${finding.id} has structured owner acceptance`);
      } else {
        fail(`${label} P2 finding ${finding.id} acceptance is not structured owner acceptance`);
      }
    }
    if (finding.severity === "P2" && finding.accepted === "Yes" && /^codex:/i.test(finding.accepted_by_ref || "")) {
      fail(`${label} Codex cannot accept blocking P2 finding ${finding.id}`);
    }
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED"
    && evidence.task_impact === "HIGH"
    && findings.some((finding) => finding.severity === "P2" && finding.resolved !== "Yes" && finding.accepted !== "Yes")) {
    fail(`${label} high-impact PLAN_REVIEW_PASSED has unaccepted P2 findings`);
  }
}

function checkSubagents(label, evidence) {
  const routing = evidence.subagent_review_routing || {};
  if (routing.subagent_output_is_authority === "No") pass(`${label} subagent output is not authority`);
  else fail(`${label} subagent output must not be authority`);
  if (routing.writer_subagent_used === "No") pass(`${label} no writer subagent used for plan review`);
  else fail(`${label} plan review must not use writer subagent`);
  if (routing.subagent_review_recommended === "Yes") {
    if (routing.run_plan_required === "Yes") pass(`${label} recommended subagent review requires run plan`);
    else fail(`${label} recommended subagent review must require a run plan`);
    if (routing.run_plan_ref && routing.run_plan_ref !== "N/A") pass(`${label} recommended subagent review has run_plan_ref`);
    else fail(`${label} recommended subagent review requires run_plan_ref`);
    if (routing.all_subagents_read_only === "Yes") pass(`${label} recommended subagent review is read-only`);
    else fail(`${label} recommended subagent review must be read-only`);
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED"
    && routing.subagent_review_recommended === "Yes"
    && routing.all_subagents_closed_or_skipped !== "Yes"
    && !(routing.fallback_used === "Yes" && routing.fallback_reason && routing.fallback_reason !== "N/A")) {
    fail(`${label} PLAN_REVIEW_PASSED cannot leave recommended subagent review unknown`);
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED"
    && routing.subagent_review_recommended === "Yes"
    && routing.fallback_used === "Yes") {
    fail(`${label} PLAN_REVIEW_PASSED cannot use fallback as substitute for recommended subagent review`);
  }
}

function checkVerificationReview(label, evidence) {
  const review = evidence.verification_command_review || {};
  if (evidence.plan_review_state !== "NO_PLAN_REQUIRED" && review.commands_reviewed === "Yes") pass(`${label} verification commands reviewed statically`);
  else if (evidence.plan_review_state === "NO_PLAN_REQUIRED") pass(`${label} verification command review skipped for no-plan low-risk task`);
  else fail(`${label} verification command review is required`);
  if (review.commands_executed_by_this_report === "No") pass(`${label} plan review does not claim tests were executed`);
  else fail(`${label} plan review must not claim tests were executed`);
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED" && review.fake_or_unstable_command_found === "Yes") {
    fail(`${label} PLAN_REVIEW_PASSED cannot contain fake or unstable verification command`);
  }
  if (evidence.schema_version !== "1.113.0" || evidence.plan_review_state === "NO_PLAN_REQUIRED") return;
  const planPath = resolveRelativeFile(evidence.plan_ref);
  if (!planPath) return;
  const observed = deriveVerificationCommandReview(fs.readFileSync(planPath, "utf8"));
  const aggregateMatches = review.commands_exist_in_project === observed.commands_exist_in_project
    && review.commands_are_project_native === observed.commands_are_project_native
    && review.commands_target_required_behavior === observed.commands_target_required_behavior
    && review.working_directory_verified === observed.working_directory_verified
    && review.all_commands_authoritative === observed.all_commands_authoritative
    && review.fake_or_unstable_command_found === observed.fake_or_unstable_command_found;
  if (aggregateMatches && JSON.stringify(review.commands || []) === JSON.stringify(observed.commands)) {
    pass(`${label} verification commands are recomputed from the exact plan and project`);
  } else {
    fail(`${label} verification command review does not match the exact plan and project`);
  }
  if (evidence.plan_review_state === "PLAN_REVIEW_PASSED") {
    if (observed.all_commands_authoritative === "Yes" && observed.commands.length > 0) {
      pass(`${label} PLAN_REVIEW_PASSED has concrete authoritative project-native verification commands`);
    } else {
      fail(`${label} PLAN_REVIEW_PASSED cannot rely on missing, unknown, unsafe, or non-project-native verification commands`);
    }
  }
}

function checkRevisionLoop(label, evidence) {
  const loop = evidence.revision_loop || {};
  if (loop.rewrites_original_plan === "No") pass(`${label} review loop does not rewrite original plan`);
  else fail(`${label} review loop must not rewrite original plan by default`);
  if (loop.round > loop.max_auto_rounds && evidence.plan_review_state !== "BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE") {
    fail(`${label} repeated plan review failure must be blocked after max rounds`);
  }
}

function checkPassRules(label, evidence) {
  if (evidence.plan_review_state !== "PLAN_REVIEW_PASSED") return;
  if (evidence.pre_implementation_review_prerequisite_satisfied === "Yes") pass(`${label} pass satisfies pre-implementation prerequisite`);
  else fail(`${label} PLAN_REVIEW_PASSED requires pre_implementation_review_prerequisite_satisfied Yes`);
  if (evidence.ready_for_implementation_review === "Yes") pass(`${label} pass is ready for implementation review`);
  else fail(`${label} PLAN_REVIEW_PASSED requires ready_for_implementation_review Yes`);
  if (evidence.implementation_allowed_by_full_authority === "Unknown" || evidence.implementation_allowed_by_full_authority === "No") {
    pass(`${label} pass does not claim full implementation authority`);
  } else {
    fail(`${label} PLAN_REVIEW_PASSED must not claim full implementation authority`);
  }
}

function checkMarkdownConsistency(content, label, evidence) {
  const human = sectionBody(content, "Human Summary");
  if (human.includes(evidence.plan_review_state) && human.includes(evidence.ready_for_implementation_review)) {
    pass(`${label} Human Summary matches structured state`);
  } else {
    fail(`${label} Human Summary must include structured state and readiness`);
  }
  const boundaryText = sectionBody(content, "Boundaries");
  if (boundaryText.includes("This report authorizes implementation") && boundaryText.includes("No")) {
    pass(`${label} Markdown boundaries show non-authorization`);
  } else {
    fail(`${label} Markdown boundaries must show non-authorization`);
  }
}

function derivePlanContentReview(content, planExists) {
  const scope = markdownPlanSection(content, /^(scope|implementation scope)$/i);
  const boundaries = markdownPlanSection(content, /^(boundaries|constraints|non-scope)$/i);
  const sequence = markdownPlanSection(content, /^(implementation sequence|implementation steps|execution sequence|execution steps)$/i);
  const verification = markdownPlanSection(content, /^(verification|acceptance|validation)$/i);
  const recovery = markdownPlanSection(content, /^(restore|rollback|rollback and recovery|recovery)$/i);
  const refs = [...new Set([...String(content || "").matchAll(/`([^`\n]+)`/g)]
    .map((match) => match[1].trim())
    .filter(isConcretePlanTargetRef))].sort();
  const stepCount = sequence
    ? sequence.split(/\r?\n/).filter((line) => /^\s*(?:\d+\.|[-*])\s+\S/.test(line)).length
    : 0;
  const checks = {
    scope: scope.trim().length >= 40,
    boundaries: boundaries.trim().length >= 40,
    implementation_sequence: sequence.trim().length >= 40 && stepCount > 0,
    verification: verification.trim().length >= 20,
    rollback_recovery: recovery.trim().length >= 20,
    concrete_target_refs: refs.length > 0,
  };
  const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  return {
    status: planExists && missing.length === 0 ? "COMPLETE" : "INCOMPLETE",
    scope_section_present: checks.scope ? "Yes" : "No",
    boundaries_section_present: checks.boundaries ? "Yes" : "No",
    implementation_sequence_present: checks.implementation_sequence ? "Yes" : "No",
    verification_section_present: checks.verification ? "Yes" : "No",
    rollback_recovery_section_present: checks.rollback_recovery ? "Yes" : "No",
    concrete_target_refs: refs,
    implementation_step_count: stepCount,
    missing_requirements: missing,
  };
}

function deriveVerificationCommandReview(planContent) {
  const commands = extractPlanVerificationCommands(planContent).map(reviewPlanVerificationCommand);
  const fake = commands.some((item) => /fake-test|todo-test|example-only-command/i.test(item.command));
  const allExist = commands.length > 0 && commands.every((item) => item.executable_or_script_exists === "Yes");
  const allNative = commands.length > 0 && commands.every((item) => item.project_native === "Yes");
  const allSafe = commands.length > 0 && commands.every((item) => item.working_directory_safe === "Yes");
  const allTarget = commands.length > 0 && commands.every((item) => item.targets_required_behavior === "Yes");
  return {
    commands_exist_in_project: allExist ? "Yes" : "No",
    commands_are_project_native: allNative ? "Yes" : "No",
    commands_target_required_behavior: allTarget ? "Yes" : "No",
    fake_or_unstable_command_found: fake ? "Yes" : "No",
    working_directory_verified: allSafe ? "Yes" : "No",
    all_commands_authoritative: allExist && allNative && allSafe && allTarget && !fake ? "Yes" : "No",
    commands,
  };
}

function markdownPlanSection(content, headingPattern) {
  const lines = String(content || "").split(/\r?\n/);
  let start = -1;
  let level = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (match && headingPattern.test(match[2])) {
      start = index + 1;
      level = match[1].length;
      break;
    }
  }
  if (start < 0) return "";
  let end = lines.length;
  for (let index = start; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join("\n").trim();
}

function isConcretePlanTargetRef(value) {
  if (!value || value.includes("..") || path.isAbsolute(value) || /\s/.test(value)) return false;
  if (/^(?:https?:|artifact:|human-decision:|command-output:)/i.test(value)) return false;
  return /^(?:\.?[a-z0-9_-]+\/)+[a-z0-9_.*{}-]+(?:\.[a-z0-9_-]+)?\/?$/i.test(value);
}

function extractPlanVerificationCommands(planContent) {
  const section = markdownPlanSection(planContent, /^(verification|acceptance|validation)$/i);
  if (!section) return [];
  const values = [];
  for (const match of section.matchAll(/`([^`\n]+)`/g)) values.push(match[1].trim());
  let fenced = false;
  for (const line of section.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced && line.trim()) values.push(line.trim());
  }
  return [...new Set(values.filter((value) => /^(?:npm|pnpm|node|xcodebuild|go\s+test|pytest|cargo\s+test|git\s+diff\s+--check)\b/i.test(value)))];
}

function reviewPlanVerificationCommand(command) {
  const unsafeWorkingDirectory = /(?:^|\s)cd\s|(?:^|\s)\/[^\s]|\.\.|[;&|<>]/.test(command);
  const base = {
    command,
    kind: "unsupported",
    executable_or_script_exists: "No",
    project_native: "No",
    working_directory_safe: unsafeWorkingDirectory ? "No" : "Yes",
    targets_required_behavior: /(?:verify|check|test|lint|typecheck|build|gate|smoke)/i.test(command) ? "Yes" : "No",
    reason: "Unsupported verification command.",
  };
  const packageMatch = command.match(/^(?:npm\s+run|pnpm(?:\s+run)?)\s+([a-z0-9:._-]+)/i)
    || command.match(/^(?:npm|pnpm)\s+(test|verify|lint|build|typecheck)\b/i);
  if (packageMatch) {
    const script = packageMatch[1];
    let scripts = {};
    try {
      scripts = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")).scripts || {};
    } catch {
      scripts = {};
    }
    const exists = typeof scripts[script] === "string" && scripts[script].trim().length > 0;
    return {
      ...base,
      kind: "package_script",
      executable_or_script_exists: exists ? "Yes" : "No",
      project_native: exists ? "Yes" : "No",
      reason: exists ? `package.json defines script ${script}.` : `package.json does not define script ${script}.`,
    };
  }
  const nodeTestMatch = command.match(/^node\s+--test\s+([^\s]+)/i);
  if (nodeTestMatch) {
    const target = nodeTestMatch[1].replace(/^['"]|['"]$/g, "");
    const safe = !path.isAbsolute(target) && !target.includes("..") && !unsafeWorkingDirectory;
    const exists = safe && fs.existsSync(path.join(projectRoot, target));
    return {
      ...base,
      kind: "project_tool",
      executable_or_script_exists: exists ? "Yes" : "No",
      project_native: exists ? "Yes" : "No",
      working_directory_safe: safe ? "Yes" : "No",
      reason: exists ? `Project-local Node test target ${target} exists.` : `Project-local Node test target ${target} is missing or unsafe.`,
    };
  }
  const nodeMatch = command.match(/^node\s+([^\s]+)/i);
  if (nodeMatch) {
    const script = nodeMatch[1].replace(/^['"]|['"]$/g, "");
    const safe = !path.isAbsolute(script) && !script.includes("..") && !unsafeWorkingDirectory;
    const exists = safe && fs.existsSync(path.join(projectRoot, script)) && fs.statSync(path.join(projectRoot, script)).isFile();
    return {
      ...base,
      kind: "node_script",
      executable_or_script_exists: exists ? "Yes" : "No",
      project_native: exists ? "Yes" : "No",
      working_directory_safe: safe ? "Yes" : "No",
      reason: exists ? `Project-local Node script ${script} exists.` : `Project-local Node script ${script} is missing or unsafe.`,
    };
  }
  const projectTool = planProjectToolMarker(command);
  return projectTool ? { ...base, ...projectTool } : base;
}

function planProjectToolMarker(command) {
  if (/^git\s+diff\s+--check\b/i.test(command)) return {
    kind: "project_tool",
    executable_or_script_exists: "Yes",
    project_native: "Yes",
    reason: "Git diff validation is bounded to the current project working tree.",
  };
  const definitions = [
    [/^xcodebuild\b/i, ["Package.swift"], [".xcodeproj", ".xcworkspace"]],
    [/^go\s+test\b/i, ["go.mod"], []],
    [/^pytest\b/i, ["pyproject.toml", "pytest.ini", "tox.ini"], []],
    [/^cargo\s+test\b/i, ["Cargo.toml"], []],
  ];
  for (const [pattern, files, suffixes] of definitions) {
    if (!pattern.test(command)) continue;
    const topLevel = fs.existsSync(projectRoot) ? fs.readdirSync(projectRoot) : [];
    const exists = files.some((file) => fs.existsSync(path.join(projectRoot, file)))
      || topLevel.some((entry) => suffixes.some((suffix) => entry.endsWith(suffix)));
    return {
      kind: "project_tool",
      executable_or_script_exists: exists ? "Yes" : "No",
      project_native: exists ? "Yes" : "No",
      reason: exists ? "Project-native tool marker exists." : "Required project-native tool marker is missing.",
    };
  }
  return null;
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isFile()) return managed;
  return null;
}

function resolveReportPath(value) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", value, { markdownOnly: true });
  if (!resolved.ok) {
    console.error(`FAIL --report must be a project-contained non-symlink Markdown file: ${resolved.error}`);
    process.exit(1);
  }
  return resolved.file;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isDirectory()) return managed;
  return null;
}

function resolveRelativeFile(relativePath) {
  if (!relativePath || relativePath === "N/A" || path.isAbsolute(relativePath) || relativePath.includes("..")) return null;
  const candidate = path.resolve(projectRoot, relativePath);
  const relative = path.relative(projectRoot, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function displayAsset(relativePath, resolved) {
  const normalized = resolved.replaceAll(path.sep, "/");
  return normalized.includes("/.intentos/") ? `.intentos/${relativePath}` : relativePath;
}

function markdownFiles(dir) {
  const roots = [path.join(projectRoot, dir), path.join(projectRoot, ".intentos", dir)];
  const files = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    walk(root, files);
  }
  return files.filter((file) => file.endsWith(".md")).sort();
}

function walk(current, files) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const fullPath = path.join(current, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (entry.isFile()) files.push(fullPath);
  }
}

function reportRefCandidates(file) {
  const relative = path.relative(projectRoot, file).replaceAll(path.sep, "/");
  const withoutIntentos = relative.startsWith(".intentos/") ? relative.slice(".intentos/".length) : relative;
  return [relative, withoutIntentos, `artifact:${withoutIntentos}`];
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function zeroDigest() {
  return `sha256:${"0".repeat(64)}`;
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/") || ".";
}

function pass(message) {
  checks.push({ ok: true, message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ ok: false, message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    const hasReport = observedStates.length > 0;
    const blocked = observedStates.some((state) => state !== "PLAN_REVIEW_PASSED" && state !== "NO_PLAN_REQUIRED");
    const notApplicableWithEvidence = hasReport && observedStates.every((state) => state === "NO_PLAN_REQUIRED");
    const ready = hasReport && observedStates.every((state) => state === "PLAN_REVIEW_PASSED");
    console.log(JSON.stringify({
      ok: !failed,
      consumerOutcome: deriveConsumerOutcome({
        hasArtifact: hasReport,
        invalid: failed,
        blocked,
        ready,
        notApplicableWithEvidence,
      }),
      checks,
    }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Plan review check failed." : "Plan review check passed.");
  }
  if (failed) process.exit(1);
}
