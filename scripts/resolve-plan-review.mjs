#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import { canonicalFileDigest, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import { resolveCurrentControlEffectivenessBinding } from "./lib/control-effectiveness.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "out",
  "plan",
  "task-governance",
  "business-universe",
  "control-effectiveness",
  "business-rule",
  "impact",
  "verification-plan",
  "review-surface",
  "work-queue-item",
  "mode",
  "source",
  "revised-plan-out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || "review implementation plan before coding").trim();
const planArg = args.plan ? String(args.plan) : "";
const taskGovernanceArg = args["task-governance"] ? String(args["task-governance"]) : "";
const businessUniverseArg = args["business-universe"] ? String(args["business-universe"]) : "";
const controlEffectivenessArg = args["control-effectiveness"] ? String(args["control-effectiveness"]) : "";
const businessRuleArg = args["business-rule"] ? String(args["business-rule"]) : "";
const impactArg = args.impact ? String(args.impact) : "";
const verificationPlanArg = args["verification-plan"] ? String(args["verification-plan"]) : "";
const reviewSurfaceArg = args["review-surface"] ? String(args["review-surface"]) : "";
const workQueueArg = args["work-queue-item"] ? String(args["work-queue-item"]) : "";
const mode = String(args.mode || "review");
const outputPath = args.out ? resolveOutputPath(projectRoot, String(args.out)) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!["human", "json"].includes(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human or --json.");
  process.exit(1);
}

if (!["draft", "review", "rereview"].includes(mode)) {
  console.error(`FAIL unknown --mode: ${mode}`);
  console.error("Use --mode draft, --mode review, or --mode rereview.");
  process.exit(1);
}

if (args["revised-plan-out"]) {
  console.error("FAIL --revised-plan-out is reserved for a future explicit documentation write mode.");
  process.exit(1);
}

const report = buildReport();

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport() {
  const plan = readPlan(projectRoot, planArg);
  const classification = classify(intent, plan.content);
  const taskGovernance = taskGovernanceFor(classification);
  classification.task_impact = taskGovernance.task_impact;
  classification.plan_review_required = taskGovernance.plan_review_required;
  classification.task_ref = taskGovernance.task_ref;
  const businessUniverse = businessUniverseFor(taskGovernance);
  const surfaces = surfacesFor(classification, plan.content, businessUniverse);
  const findings = findingsFor(classification, plan, surfaces);
  const planScenarioReviews = planScenarioReviewsFor(businessUniverse, plan.content, surfaces);
  const businessUniverseBinding = businessUniverseBindingFor(businessUniverse, planScenarioReviews);
  const controlEffectivenessBinding = controlEffectivenessFor(taskGovernance);
  const sourceAuthority = sourceAuthorityFor(classification, surfaces, taskGovernance, businessUniverse);
  const state = stateFor(classification, plan, findings, businessUniverse, businessUniverseBinding, controlEffectivenessBinding, sourceAuthority);
  const prerequisiteSatisfied = state === "PLAN_REVIEW_PASSED" ? "Yes" : "No";
  const planReviewRef = outputPath
    ? path.relative(projectRoot, outputPath).replaceAll(path.sep, "/")
    : "plan-review-reports/generated.md";
  const sourceChain = sourceChainFor(sourceAuthority);
  if (controlEffectivenessBinding.requirement === "REQUIRED") {
    sourceChain.push(controlEffectivenessSource(controlEffectivenessBinding));
  }
  const subagent = subagentRoutingFor(classification, surfaces, state);
  const skip = skipReviewFor(classification, state);
  const baseEvidence = {
    schema_version: "1.110.0",
    artifact_type: "plan_review",
    plan_review_ref: planReviewRef,
    plan_review_digest: "",
    task_ref: taskGovernance.task_ref,
    work_queue_item_ref: workQueueArg || "N/A",
    work_queue_item_digest: workQueueArg ? digest(workQueueArg) : "N/A",
    review_surface_analysis: reviewSurfaceAnalysisFor(classification, plan, sourceAuthority.reviewSurface),
    task_governance: taskGovernance,
    business_universe_binding: businessUniverseBinding,
    control_effectiveness_binding: controlEffectivenessBinding,
    plan_scenario_reviews: planScenarioReviews,
    source_chain: sourceChain,
    plan_ref: plan.ref,
    plan_digest: plan.digest,
    plan_task_match: plan.exists ? "Yes" : (state === "NO_PLAN_REQUIRED" ? "N/A" : "Unknown"),
    plan_review_state: state,
    pre_implementation_review_prerequisite_satisfied: prerequisiteSatisfied,
    ready_for_implementation_review: prerequisiteSatisfied,
    implementation_authorized_by_this_report: "No",
    implementation_allowed_by_full_authority: "Unknown",
    task_impact: classification.task_impact,
    skip_review: skip,
    required_review_surfaces: surfaces.map((item) => item.surface),
    review_surface_matrix: surfaces,
    subagent_review_routing: subagent,
    reviewed_surfaces: surfaces.map((item) => ({
      surface: item.surface,
      reviewed: item.reviewed,
      finding_count: findings.filter((finding) => finding.surface === item.surface).length,
      notes: item.reviewed === "Yes" ? "Surface was reviewed against the plan." : "Surface still needs review.",
    })),
    findings,
    revision_loop: {
      round: state === "PLAN_REVISION_REQUIRED" ? 1 : 0,
      max_auto_rounds: 2,
      requires_revision: state === "PLAN_REVISION_REQUIRED" ? "Yes" : "No",
      previous_plan_digest: state === "PLAN_REVISION_REQUIRED" ? plan.digest : "N/A",
      rewrites_original_plan: "No",
      revised_plan_ref: "N/A",
    },
    verification_command_review: verificationCommandReviewFor(plan.content, state),
    plain_user_summary: plainSummaryFor(state, classification, findings),
    plain_next_step: plainNextStepFor(state),
    technical_terms_required: "No",
    boundaries: boundaries(),
    outcome: state,
  };
  const structuredEvidence = {
    ...baseEvidence,
    plan_review_digest: evidenceDigest(baseEvidence, ["plan_review_digest"]),
  };
  return {
    reportType: "PLAN_REVIEW",
    schemaVersion: "1.110.0",
    generatedBy: "scripts/resolve-plan-review.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot,
    readOnly: true,
    humanSummary: {
      planReviewState: state,
      plainNextStep: structuredEvidence.plain_next_step,
      readyForImplementationReview: structuredEvidence.ready_for_implementation_review,
      implementationAuthorizedByThisReport: "No",
    },
    plan: {
      ref: structuredEvidence.plan_ref,
      digest: structuredEvidence.plan_digest,
      exists: plan.exists,
    },
    taskGovernance: structuredEvidence.task_governance,
    reviewSurfaceAnalysis: structuredEvidence.review_surface_analysis,
    reviewSurfaceMatrix: structuredEvidence.review_surface_matrix,
    findings: structuredEvidence.findings,
    boundaries: structuredEvidence.boundaries,
    structuredEvidence,
    outcome: structuredEvidence.outcome,
  };
}

function readPlan(root, relPath) {
  if (!relPath) return {
    exists: false,
    ref: "N/A",
    digest: "N/A",
    content: "",
  };
  if (path.isAbsolute(relPath) || relPath.includes("..")) {
    return {
      exists: false,
      ref: relPath,
      digest: "N/A",
      content: "",
    };
  }
  const fullPath = path.resolve(root, relPath);
  const relative = path.relative(root, fullPath);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    return {
      exists: false,
      ref: relPath,
      digest: "N/A",
      content: "",
    };
  }
  const content = fs.readFileSync(fullPath, "utf8");
  return {
    exists: true,
    ref: relative.replaceAll(path.sep, "/"),
    digest: fileDigest(fullPath),
    content,
  };
}

function classify(userIntent, planContent) {
  const text = `${userIntent}\n${planContent}`.toLowerCase();
  const highSignals = [
    "permission",
    "authorization",
    "auth",
    "role",
    "delete",
    "destructive",
    "audit",
    "workflow state",
    "settlement",
    "payment",
    "finance",
    "tax",
    "schema",
    "migration",
    "production",
    "release",
    "权限",
    "删除",
    "审核",
    "结算",
    "支付",
    "财务",
    "迁移",
    "生产",
    "发布",
  ];
  const mediumSignals = ["api", "ui", "frontend", "backend", "form", "list", "filter", "页面", "接口"];
  const lowSignals = ["docs", "readme", "copy", "文档", "说明", "文案"];
  if (highSignals.some((signal) => text.includes(signal))) return {
    task_impact: "HIGH",
    plan_review_required: "Yes",
    task_ref: `task:${slug(userIntent)}`,
  };
  if (mediumSignals.some((signal) => text.includes(signal))) return {
    task_impact: "MEDIUM",
    plan_review_required: "Yes",
    task_ref: `task:${slug(userIntent)}`,
  };
  if (lowSignals.some((signal) => text.includes(signal))) return {
    task_impact: "LOW",
    plan_review_required: "No",
    task_ref: `task:${slug(userIntent)}`,
  };
  return {
    task_impact: "POSSIBLE_HIGH",
    plan_review_required: "Yes",
    task_ref: `task:${slug(userIntent)}`,
  };
}

function taskGovernanceFor(classification) {
  const resolved = readStructuredArtifact(taskGovernanceArg, "task_governance");
  if (resolved.evidence) {
    const result = {
      ref: taskGovernanceArg,
      digest: resolved.evidence.task_governance_digest,
      task_ref: resolved.evidence.task_ref,
      task_impact: resolved.evidence.impact_classification?.task_impact || classification.task_impact,
      plan_review_required: resolved.evidence.requirements_before_implementation?.plan_review_required || classification.plan_review_required,
      current_task_match: "Yes",
    };
    Object.defineProperty(result, "_businessUniverseRouting", {
      value: resolved.evidence.business_universe_routing || null,
      enumerable: false,
    });
    Object.defineProperty(result, "_controlEffectivenessRouting", {
      value: resolved.evidence.control_effectiveness_routing || null,
      enumerable: false,
    });
    Object.defineProperty(result, "_intentDigest", {
      value: resolved.evidence.intent_digest || "",
      enumerable: false,
    });
    Object.defineProperty(result, "_artifact", { value: resolved, enumerable: false });
    return result;
  }
  return {
    ref: taskGovernanceArg || "artifact:task-governance-reports/generated.md",
    digest: taskGovernanceArg ? digest(taskGovernanceArg) : digest(`${classification.task_ref}:${classification.task_impact}`),
    task_ref: classification.task_ref,
    task_impact: classification.task_impact,
    plan_review_required: classification.plan_review_required,
    current_task_match: "Yes",
  };
}

function controlEffectivenessFor(taskGovernance) {
  const routing = taskGovernance._controlEffectivenessRouting;
  if (!routing || routing.required === "No") {
    return resolveCurrentControlEffectivenessBinding(projectRoot, {
      required: false,
      reason: routing?.not_required_reason || "No strict plan claim currently relies on a technical control.",
    });
  }
  if (routing.required !== "Yes") {
    return resolveCurrentControlEffectivenessBinding(projectRoot, {
      required: true,
      reportRef: controlEffectivenessArg || "artifact:control-effectiveness-reports/unresolved.md",
      taskRef: taskGovernance.task_ref,
      intentDigest: taskGovernance._intentDigest,
      requiredClaimIds: routing.required_claim_ids || [],
      fromFile: outputPath,
    });
  }
  return resolveCurrentControlEffectivenessBinding(projectRoot, {
    required: true,
    reportRef: controlEffectivenessArg || undefined,
    taskRef: taskGovernance.task_ref,
    intentDigest: taskGovernance._intentDigest,
    requiredClaimIds: routing.required_claim_ids || [],
    fromFile: outputPath,
  });
}

function businessUniverseFor(taskGovernance) {
  const routing = taskGovernance._businessUniverseRouting;
  if (!routing) {
    const low = taskGovernance.task_impact === "LOW";
    return {
      required: low ? "No" : "Unknown",
      routingResult: low ? "NOT_REQUIRED_WITH_REASON" : "TECHNICAL_INSPECTION_REQUIRED",
      reasonCodes: [],
      ref: "N/A",
      digest: "N/A",
      state: low ? "NOT_REQUIRED_WITH_REASON" : "TECHNICAL_INSPECTION_REQUIRED",
      scenarios: [],
      challengerRequired: false,
      challengerStatus: "NOT_REQUIRED",
    };
  }
  if (routing.required !== "Yes") return {
    required: routing.required,
    routingResult: routing.routing_result,
    reasonCodes: routing.reason_codes || [],
    ref: "N/A",
    digest: "N/A",
    state: routing.routing_result,
    scenarios: [],
    challengerRequired: false,
    challengerStatus: "NOT_REQUIRED",
  };
  const resolved = findStructuredArtifact(
    businessUniverseArg,
    "business-universe-coverage-reports",
    "business_universe_coverage",
    taskGovernance.task_ref,
  );
  const result = {
    required: "Yes",
    routingResult: "REQUIRED_WITH_EVIDENCE",
    reasonCodes: routing.reason_codes || [],
    ref: businessUniverseArg || "N/A",
    digest: resolved.evidence?.coverage_digest || "N/A",
    state: resolved.evidence?.outcome || "UNRESOLVED",
    scenarios: resolved.evidence?.coverage_scenarios || [],
    challengerRequired: resolved.evidence?.challenger_review?.required === "Yes",
    challengerStatus: resolved.evidence?.challenger_review?.status || "PENDING",
  };
  Object.defineProperty(result, "_artifact", { value: resolved, enumerable: false });
  return result;
}

function planScenarioReviewsFor(businessUniverse, planContent, surfaces) {
  if (businessUniverse.required !== "Yes") return [];
  const planText = String(planContent || "");
  const reviewedSurfaces = surfaces.filter((item) => item.reviewed === "Yes").map((item) => item.surface);
  return businessUniverse.scenarios.map((scenario, index) => {
    const scenarioPresent = planText.includes(scenario.coverage_scenario_id);
    const lifecycleReviewed = scenarioPresent && planText.includes(scenario.lifecycle_stage);
    const provenanceReviewed = scenarioPresent && planText.includes(scenario.path_provenance);
    const negativeReviewed = scenarioPresent
      && String(scenario.negative_or_reverse_behavior || "").trim().length > 0
      && planText.includes(String(scenario.negative_or_reverse_behavior));
    const complete = scenarioPresent && lifecycleReviewed && provenanceReviewed && negativeReviewed && reviewedSurfaces.length > 0;
    return {
      plan_scenario_review_id: `plan-scenario-review:${index + 1}-${scenario.coverage_scenario_id.slice(-8)}`,
      source_coverage_scenario_ids: [scenario.coverage_scenario_id],
      reviewed_surfaces: reviewedSurfaces.length > 0 ? reviewedSurfaces : ["scope"],
      lifecycle_reviewed: lifecycleReviewed ? "Yes" : "No",
      provenance_reviewed: provenanceReviewed ? "Yes" : "No",
      negative_or_reverse_reviewed: negativeReviewed ? "Yes" : "No",
      review_state: complete ? "REVIEWED" : "BLOCKED",
    };
  });
}

function businessUniverseBindingFor(businessUniverse, scenarioReviews) {
  if (businessUniverse.required === "No") {
    return {
      required: "No",
      routing_result: businessUniverse.routingResult,
      business_universe_ref: "N/A",
      business_universe_digest: "N/A",
      business_universe_state: "NOT_REQUIRED_WITH_REASON",
      coverage_scenario_ids: [],
      coverage_mapping_status: "NOT_REQUIRED",
      scenario_review_status: "NOT_REQUIRED",
      lifecycle_review_status: "NOT_REQUIRED",
      provenance_review_status: "NOT_REQUIRED",
      challenger_required: "No",
      challenger_status: "NOT_REQUIRED",
    };
  }
  if (businessUniverse.required === "Unknown") {
    return {
      required: "Unknown",
      routing_result: "TECHNICAL_INSPECTION_REQUIRED",
      business_universe_ref: "N/A",
      business_universe_digest: "N/A",
      business_universe_state: "TECHNICAL_INSPECTION_REQUIRED",
      coverage_scenario_ids: [],
      coverage_mapping_status: "BLOCKED",
      scenario_review_status: "BLOCKED",
      lifecycle_review_status: "BLOCKED",
      provenance_review_status: "BLOCKED",
      challenger_required: "No",
      challenger_status: "NOT_REQUIRED",
    };
  }
  const scenarioIds = businessUniverse.scenarios.map((item) => item.coverage_scenario_id);
  const exactMapping = scenarioIds.length > 0
    && sameStringSet(scenarioIds, scenarioReviews.flatMap((item) => item.source_coverage_scenario_ids));
  const completeReviews = exactMapping && scenarioReviews.every((item) => item.review_state === "REVIEWED");
  return {
    required: "Yes",
    routing_result: "REQUIRED_WITH_EVIDENCE",
    business_universe_ref: businessUniverse.ref,
    business_universe_digest: businessUniverse.digest,
    business_universe_state: businessUniverse.state,
    coverage_scenario_ids: scenarioIds,
    coverage_mapping_status: businessUniverse.state === "COVERAGE_READY" && scenarioIds.length > 0 ? "COMPLETE" : "BLOCKED",
    scenario_review_status: completeReviews ? "COMPLETE" : "BLOCKED",
    lifecycle_review_status: completeReviews && scenarioReviews.every((item) => item.lifecycle_reviewed === "Yes") ? "COMPLETE" : "BLOCKED",
    provenance_review_status: completeReviews && scenarioReviews.every((item) => item.provenance_reviewed === "Yes") ? "COMPLETE" : "BLOCKED",
    challenger_required: businessUniverse.challengerRequired ? "Yes" : "No",
    challenger_status: businessUniverse.challengerStatus,
  };
}

function sameStringSet(left, right) {
  const a = [...new Set((left || []).map(String))].sort();
  const b = [...new Set((right || []).map(String))].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function readStructuredArtifact(ref, artifactType) {
  if (!ref) return { file: "", evidence: null };
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", ref);
  if (!resolved.ok) return { file: "", evidence: null };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  const base = {
    file: resolved.file,
    ref: `artifact:${resolved.relativePath}`,
    fileDigest: canonicalFileDigest(resolved.file),
  };
  if (!extracted?.ok || extracted.value?.artifact_type !== artifactType) return { ...base, evidence: null };
  return { ...base, evidence: extracted.value };
}

function findStructuredArtifact(explicitRef, directory, artifactType, taskRef) {
  if (explicitRef) return readStructuredArtifact(explicitRef, artifactType);
  const root = path.join(projectRoot, directory);
  if (!fs.existsSync(root)) return { file: "", evidence: null };
  const candidates = fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(root, entry.name))
    .sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs);
  for (const file of candidates) {
    const ref = `artifact:${path.relative(projectRoot, file).replaceAll(path.sep, "/")}`;
    const artifact = readStructuredArtifact(ref, artifactType);
    if (artifact.evidence?.task_ref === taskRef) return artifact;
  }
  return { file: "", evidence: null };
}

function readProjectArtifact(ref) {
  if (!ref) return { file: "", ref: "", fileDigest: "", evidence: null };
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", ref, { markdownOnly: true });
  if (!resolved.ok) return { file: "", ref: "", fileDigest: "", evidence: null };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  return {
    file: resolved.file,
    ref: `artifact:${resolved.relativePath}`,
    fileDigest: canonicalFileDigest(resolved.file),
    evidence: extracted?.ok ? extracted.value : null,
  };
}

function sourceAuthorityFor(classification, surfaces, taskGovernance, businessUniverse) {
  const taskGovernanceArtifact = taskGovernance._artifact || { file: "", evidence: null };
  const reviewSurface = readProjectArtifact(reviewSurfaceArg);
  const businessRule = findStructuredArtifact(
    businessRuleArg,
    "business-rule-closures",
    "business_rule_closure",
    classification.task_ref,
  );
  const impact = findStructuredArtifact(
    impactArg,
    "change-impact-coverage-reports",
    "change_impact_coverage",
    classification.task_ref,
  );
  const verificationPlan = findStructuredArtifact(
    verificationPlanArg,
    "verification-plans",
    "verification_plan",
    classification.task_ref,
  );
  const required = new Set();
  if (["HIGH", "POSSIBLE_HIGH"].includes(classification.task_impact) || businessUniverse.required === "Yes") {
    required.add("taskGovernance");
    required.add("reviewSurface");
    required.add("verificationPlan");
  }
  if (surfaces.some((item) => item.surface === "permission" || item.surface === "business_rule")) required.add("businessRule");
  if (surfaces.some((item) => item.surface === "data_destructive" || item.surface === "frontend_backend_consistency")) required.add("impact");
  if (businessUniverse.required === "Yes") required.add("businessUniverse");
  const artifacts = {
    taskGovernance: taskGovernanceArtifact,
    reviewSurface,
    verificationPlan,
    businessRule,
    impact,
    businessUniverse: businessUniverse._artifact || { file: "", evidence: null },
  };
  return {
    ...artifacts,
    required,
    missingRequired: [...required].filter((name) => !artifacts[name]?.file),
  };
}

function surfacesFor(classification, planContent, businessUniverse) {
  const text = planContent.toLowerCase();
  const surfaces = new Map();
  const add = (surface, required = "Yes", reviewed = "Yes", human = "No") => {
    surfaces.set(surface, {
      surface,
      required,
      required_before_implementation: required,
      required_after_implementation: "Yes",
      reviewed,
      source: "task_governance",
      human_decision_needed: human,
      finding_count: 0,
      blocking: "No",
    });
  };
  add("scope", "Yes", planContent ? "Yes" : "No");
  add("verification", "Yes", planContent ? "Yes" : "No");
  if (classification.task_impact === "LOW") return [...surfaces.values()];

  if (classification.task_impact === "HIGH" || /permission|auth|role|权限/.test(text)) add("permission", "Yes", planContent ? "Yes" : "No", "Yes");
  if (classification.task_impact === "HIGH" || /delete|destructive|删除/.test(text)) add("data_destructive", "Yes", planContent ? "Yes" : "No", "Yes");
  if (classification.task_impact === "HIGH" || /business|workflow|state|审核|业务/.test(text)) add("business_rule", "Yes", planContent ? "Yes" : "No", "Yes");
  if (/frontend|backend|api|ui|button|capability|前端|后端|接口/.test(text)) add("frontend_backend_consistency", "Yes", planContent ? "Yes" : "No");
  if (/release|production|deploy|发布|上线|生产/.test(text)) add("release", "Yes", planContent ? "Yes" : "No", "Yes");
  if (businessUniverse.required === "Yes") add("business_universe_scenario_review", "Yes", businessUniverse.state === "COVERAGE_READY" && planContent ? "Yes" : "No");
  return [...surfaces.values()];
}

function findingsFor(classification, plan, surfaces) {
  if (!plan.exists) return [];
  const text = plan.content.toLowerCase();
  const findings = [];
  const add = (id, severity, surface, summary, requiredAction) => findings.push({
    id,
    severity,
    surface,
    summary,
    required_action: requiredAction,
    resolved: "No",
    accepted: "No",
    accepted_by_ref: "N/A",
    acceptance_reason: "N/A",
    acceptance_scope: "N/A",
    expires_at: "N/A",
    allowed_for_task_impact: "N/A",
  });
  if (classification.task_impact === "HIGH") {
    if (surfaces.some((item) => item.surface === "permission")
      && !/existence leakage|non-existence|404|error priority|存在性|错误优先级/.test(text)) {
      add("P1-001", "P1", "permission", "Permission plan does not cover existence leakage or error priority.", "Specify the unauthorized actor error order before coding.");
    }
    if (surfaces.some((item) => item.surface === "data_destructive")
      && !/history guard|historical|settlement|workflow history|audit before delete|历史|审计/.test(text)) {
      add("P1-002", "P1", "data_destructive", "Deletion plan does not cover historical associations and audit-before-delete.", "Specify historical guards and audit sequencing before coding.");
    }
    if (surfaces.some((item) => item.surface === "frontend_backend_consistency")
      && !/backend capability|backend authority|capability flag|后端权威/.test(text)) {
      add("P2-001", "P2", "frontend_backend_consistency", "Frontend/backend authority boundary is weak.", "Make backend authority and capability source explicit.");
    }
  }
  return findings;
}

function stateFor(classification, plan, findings, businessUniverse, businessUniverseBinding, controlEffectivenessBinding, sourceAuthority) {
  if (classification.task_impact === "LOW" && classification.plan_review_required === "No" && !plan.exists) return "NO_PLAN_REQUIRED";
  if (classification.plan_review_required === "Yes" && !plan.exists) return "PLAN_REQUIRED";
  if (businessUniverse.required === "Unknown") return "BLOCKED_BY_INCOMPLETE_REVIEW";
  if (businessUniverse.required === "Yes" && businessUniverse.state !== "COVERAGE_READY") return "BLOCKED_BY_INCOMPLETE_REVIEW";
  if (businessUniverse.required === "Yes" && [
    businessUniverseBinding.scenario_review_status,
    businessUniverseBinding.lifecycle_review_status,
    businessUniverseBinding.provenance_review_status,
  ].some((status) => status !== "COMPLETE")) return "BLOCKED_BY_INCOMPLETE_REVIEW";
  if (businessUniverse.challengerRequired && businessUniverse.challengerStatus !== "PASSED") return "BLOCKED_BY_INCOMPLETE_REVIEW";
  if (controlEffectivenessBinding.requirement === "REQUIRED" && controlEffectivenessBinding.status !== "VERIFIED") return "BLOCKED_BY_INCOMPLETE_REVIEW";
  if (sourceAuthority.missingRequired.length > 0) return "BLOCKED_BY_INCOMPLETE_REVIEW";
  if (plan.content.includes("STALE_PLAN_MARKER")) return "BLOCKED_BY_STALE_PLAN";
  if (findings.some((item) => ["P0", "P1"].includes(item.severity) && item.resolved !== "Yes")) return "PLAN_REVISION_REQUIRED";
  if (findings.some((item) => item.severity === "P2" && item.resolved !== "Yes" && item.accepted !== "Yes")) {
    return classification.task_impact === "HIGH" ? "PLAN_REVISION_REQUIRED" : "PLAN_REVIEW_PASSED";
  }
  return "PLAN_REVIEW_PASSED";
}

function reviewSurfaceAnalysisFor(classification, plan, reviewSurface) {
  if (classification.task_impact === "LOW") return {
    ref: "N/A",
    digest: "N/A",
    source: "N/A",
    derived_by_plan_review: "No",
    current_task_match: "N/A",
    user_selected_surfaces: "No",
  };
  if (reviewSurface.file) return {
    ref: reviewSurface.ref,
    digest: reviewSurface.fileDigest,
    source: "review_surface_card",
    derived_by_plan_review: "No",
    current_task_match: "Yes",
    user_selected_surfaces: "No",
  };
  return {
    ref: plan.exists ? plan.ref : "N/A",
    digest: plan.exists ? plan.digest : "N/A",
    source: plan.exists ? "derived_plan_review_matrix" : "N/A",
    derived_by_plan_review: plan.exists ? "Yes" : "No",
    current_task_match: plan.exists ? "Unknown" : "N/A",
    user_selected_surfaces: "No",
  };
}

function sourceChainFor(sourceAuthority) {
  const definitions = [
    ["taskGovernance", "task_governance", "intentos-governance", "No"],
    ["reviewSurface", "review_surface_card", "project-review-evidence", "Yes"],
    ["verificationPlan", "verification_plan", "codex", "No"],
    ["businessRule", "business_rule_closure", "project-business-evidence", "No"],
    ["impact", "change_impact_coverage", "codex", "No"],
    ["businessUniverse", "business_universe_coverage", "codex", "No"],
  ];
  return definitions.flatMap(([name, kind, owner, projectNativeEquivalent]) => {
    const artifact = sourceAuthority[name];
    if (!sourceAuthority.required.has(name) || !artifact?.file) return [];
    return [{
      source_kind: kind,
      source_ref: artifact.ref,
      source_digest: artifact.fileDigest,
      source_state: artifactState(artifact.evidence),
      current_task_match: "Yes",
      project_native_equivalent: projectNativeEquivalent,
      owner,
      contradicts_plan: "No",
    }];
  });
}

function controlEffectivenessSource(binding) {
  return {
    source_kind: "control_effectiveness",
    source_ref: binding.report_ref,
    source_digest: binding.report_digest,
    source_state: binding.assessment_outcome,
    current_task_match: binding.current_task_match === "Yes" ? "Yes" : binding.current_task_match === "N/A" ? "N/A" : "Unknown",
    project_native_equivalent: "No",
    owner: "codex",
    contradicts_plan: binding.status === "BLOCKED" ? "Yes" : "No",
  };
}

function artifactState(value) {
  if (!value || typeof value !== "object") return "RECORDED";
  for (const field of ["outcome", "verification_plan_state", "rule_closure_state", "impact_state", "task_governance_state"]) {
    if (typeof value[field] === "string" && value[field]) return value[field];
  }
  return "RECORDED";
}

function verificationCommandReviewFor(planContent, state) {
  const hasCommand = /npm run|pnpm|node scripts|xcodebuild|go test|pytest|cargo test/i.test(planContent);
  const fake = /fake-test|todo-test|example-only-command/i.test(planContent);
  return {
    commands_reviewed: state === "NO_PLAN_REQUIRED" ? "No" : "Yes",
    commands_exist_in_project: hasCommand ? (fake ? "No" : "Unknown") : "Unknown",
    commands_are_project_native: hasCommand ? (fake ? "No" : "Unknown") : "Unknown",
    commands_target_required_behavior: fake ? "No" : (hasCommand ? "Unknown" : "Unknown"),
    commands_executed_by_this_report: "No",
    requires_test_evidence_later: state === "NO_PLAN_REQUIRED" ? "No" : "Yes",
    fake_or_unstable_command_found: fake ? "Yes" : "No",
    notes: hasCommand ? "Commands were statically reviewed only; no tests were executed by this report." : "No concrete command was found; later verification evidence remains required if work proceeds.",
  };
}

function subagentRoutingFor(classification, surfaces, state) {
  const recommended = classification.task_impact === "HIGH" || surfaces.length >= 5;
  const completedRecommendedReview = state === "PLAN_REVIEW_PASSED" && recommended;
  return {
    subagent_review_recommended: recommended ? "Yes" : "No",
    reason: recommended ? "High-impact or broad plan review benefits from independent read-only review." : "Main-thread structured review is enough for this task class.",
    run_plan_required: recommended ? "Yes" : "No",
    run_plan_ref: recommended ? "artifact:subagent-run-plans/generated.md" : "N/A",
    all_subagents_read_only: recommended ? "Yes" : "N/A",
    subagent_output_is_authority: "No",
    writer_subagent_used: "No",
    all_subagents_closed_or_skipped: completedRecommendedReview ? "Yes" : (recommended ? "Unknown" : "N/A"),
    fallback_used: completedRecommendedReview ? "No" : (recommended ? "Yes" : "No"),
    fallback_reason: completedRecommendedReview ? "N/A" : (recommended ? "Subagent review is recommended, but the plan is not yet in a passing state." : "N/A"),
  };
}

function skipReviewFor(classification, state) {
  if (state === "NO_PLAN_REQUIRED") return {
    skip_allowed: "Yes",
    skip_source: "task_governance",
    skip_reason: "Task Governance classifies this as LOW and lightweight execution is allowed.",
    task_impact: classification.task_impact,
  };
  return {
    skip_allowed: "No",
    skip_source: "task_governance",
    skip_reason: "N/A",
    task_impact: classification.task_impact,
  };
}

function plainSummaryFor(state, classification, findings) {
  if (state === "NO_PLAN_REQUIRED") return "This looks low risk, so a heavy implementation plan review is not required.";
  if (state === "PLAN_REQUIRED") return "This work needs a plan before coding, but I did not find a plan yet.";
  if (state === "PLAN_REVISION_REQUIRED") return `The plan is not ready yet. I found ${findings.length} issue(s) that must be fixed before coding.`;
  if (state === "BLOCKED_BY_STALE_PLAN") return "The plan appears stale, so it must be refreshed before coding.";
  if (state === "PLAN_REVIEW_PASSED") return "The plan review passed. I can move to implementation review if the project workflow also allows it.";
  return `The plan review state is ${state}.`;
}

function plainNextStepFor(state) {
  if (state === "NO_PLAN_REQUIRED") return "Continue with the lightweight project workflow and still verify the final change.";
  if (state === "PLAN_REQUIRED") return "Write a bounded plan first, then run plan review again.";
  if (state === "PLAN_REVISION_REQUIRED") return "Update the plan to close the blocking gaps, then run the plan review again.";
  if (state === "BLOCKED_BY_STALE_PLAN") return "Refresh the plan and its source references, then run the plan review again.";
  if (state === "PLAN_REVIEW_PASSED") return "Move to implementation review under the approved project scope; this report still does not approve implementation by itself.";
  return "Review the blocker and keep the task in planning mode.";
}

function boundaries() {
  return {
    writes_target_files: "No",
    authorizes_implementation: "No",
    approves_commit_or_push: "No",
    approves_release_or_production: "No",
    executes_tests: "No",
    changes_production: "No",
  };
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  const lines = [
    "# Plan Review Report",
    "",
    "## Human Summary",
    "",
    `- Plain summary: ${evidence.plain_user_summary}`,
    `- Plain next step: ${evidence.plain_next_step}`,
    `- Plan review state: \`${evidence.plan_review_state}\``,
    `- Ready for implementation review: ${evidence.ready_for_implementation_review}`,
    "- This report authorizes implementation: No",
    "",
    "## Plan Identity",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Plan ref | ${evidence.plan_ref} |`,
    `| Plan digest | ${evidence.plan_digest} |`,
    `| Plan task match | ${evidence.plan_task_match} |`,
    `| Task ref | ${evidence.task_ref} |`,
    "",
    "## Task Governance Binding",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Task Governance ref | ${evidence.task_governance.ref} |`,
    `| Task Governance digest | ${evidence.task_governance.digest} |`,
    `| Task impact | ${evidence.task_governance.task_impact} |`,
    `| Plan review required | ${evidence.task_governance.plan_review_required} |`,
    `| Current task match | ${evidence.task_governance.current_task_match} |`,
    "",
    "## Business Universe Binding",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Required | ${evidence.business_universe_binding.required} |`,
    `| Routing result | ${evidence.business_universe_binding.routing_result} |`,
    `| Coverage ref | ${evidence.business_universe_binding.business_universe_ref} |`,
    `| Coverage digest | ${evidence.business_universe_binding.business_universe_digest} |`,
    `| Coverage state | ${evidence.business_universe_binding.business_universe_state} |`,
    `| Coverage scenarios | ${evidence.business_universe_binding.coverage_scenario_ids.join(", ") || "N/A"} |`,
    `| Scenario review | ${evidence.business_universe_binding.scenario_review_status} |`,
    `| Lifecycle review | ${evidence.business_universe_binding.lifecycle_review_status} |`,
    `| Provenance review | ${evidence.business_universe_binding.provenance_review_status} |`,
    `| Challenger required | ${evidence.business_universe_binding.challenger_required} |`,
    `| Challenger status | ${evidence.business_universe_binding.challenger_status} |`,
    "",
    "## Control Effectiveness Binding",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Requirement | ${evidence.control_effectiveness_binding.requirement} |`,
    `| Status | ${evidence.control_effectiveness_binding.status} |`,
    `| Report ref | ${evidence.control_effectiveness_binding.report_ref} |`,
    `| Report digest | ${evidence.control_effectiveness_binding.report_digest} |`,
    `| Required claims | ${evidence.control_effectiveness_binding.required_claim_ids.join(", ") || "N/A"} |`,
    `| Assessment outcome | ${evidence.control_effectiveness_binding.assessment_outcome} |`,
    `| Reason | ${evidence.control_effectiveness_binding.reason} |`,
    "",
    "## Business Universe Scenario Reviews",
    "",
    "| Review ID | Source scenarios | Surfaces | Lifecycle | Provenance | Negative/reverse | State |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...(evidence.plan_scenario_reviews.length
      ? evidence.plan_scenario_reviews.map((item) => `| ${item.plan_scenario_review_id} | ${item.source_coverage_scenario_ids.join(", ")} | ${item.reviewed_surfaces.join(", ")} | ${item.lifecycle_reviewed} | ${item.provenance_reviewed} | ${item.negative_or_reverse_reviewed} | ${item.review_state} |`)
      : ["| N/A | N/A | N/A | N/A | N/A | N/A | NOT_REQUIRED |"]),
    "",
    "## Review Surface Analysis",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Review surface ref | ${evidence.review_surface_analysis.ref} |`,
    `| Review surface digest | ${evidence.review_surface_analysis.digest} |`,
    `| Source | ${evidence.review_surface_analysis.source} |`,
    `| Derived by Plan Review | ${evidence.review_surface_analysis.derived_by_plan_review} |`,
    `| Current task match | ${evidence.review_surface_analysis.current_task_match} |`,
    `| User selected surfaces | ${evidence.review_surface_analysis.user_selected_surfaces} |`,
    "",
    "## Review Surface Matrix",
    "",
    "| Surface | Required | Before implementation | After implementation | Reviewed | Human decision needed | Findings | Blocking |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...evidence.review_surface_matrix.map((item) => `| ${item.surface} | ${item.required} | ${item.required_before_implementation} | ${item.required_after_implementation} | ${item.reviewed} | ${item.human_decision_needed} | ${item.finding_count} | ${item.blocking} |`),
    "",
    "## Source Chain",
    "",
    "| Source kind | Ref | Digest | State | Current task match | Project-native equivalent | Owner |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...(evidence.source_chain.length
      ? evidence.source_chain.map((item) => `| ${item.source_kind} | ${item.source_ref} | ${item.source_digest} | ${item.source_state} | ${item.current_task_match} | ${item.project_native_equivalent} | ${item.owner} |`)
      : ["| N/A | N/A | N/A | N/A | N/A | N/A | N/A |"]),
    "",
    "## Reviewed Surfaces",
    "",
    "| Surface | Reviewed | Finding count | Notes |",
    "| --- | --- | --- | --- |",
    ...evidence.reviewed_surfaces.map((item) => `| ${item.surface} | ${item.reviewed} | ${item.finding_count} | ${item.notes} |`),
    "",
    "## Findings",
    "",
    "| ID | Severity | Surface | Summary | Required action | Resolved | Accepted |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...(evidence.findings.length
      ? evidence.findings.map((item) => `| ${item.id} | ${item.severity} | ${item.surface} | ${item.summary} | ${item.required_action} | ${item.resolved} | ${item.accepted} |`)
      : ["| N/A | P3 | none | No blocking findings. | N/A | Yes | No |"]),
    "",
    "## Revision Loop",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Round | ${evidence.revision_loop.round} |`,
    `| Max automatic rounds | ${evidence.revision_loop.max_auto_rounds} |`,
    `| Requires revision | ${evidence.revision_loop.requires_revision} |`,
    `| Previous plan digest | ${evidence.revision_loop.previous_plan_digest} |`,
    `| Rewrites original plan | ${evidence.revision_loop.rewrites_original_plan} |`,
    "",
    "## Verification Command Review",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Commands reviewed | ${evidence.verification_command_review.commands_reviewed} |`,
    `| Commands exist in project | ${evidence.verification_command_review.commands_exist_in_project} |`,
    `| Commands are project-native | ${evidence.verification_command_review.commands_are_project_native} |`,
    `| Commands target required behavior | ${evidence.verification_command_review.commands_target_required_behavior} |`,
    `| Commands executed by this report | ${evidence.verification_command_review.commands_executed_by_this_report} |`,
    `| Requires Test Evidence later | ${evidence.verification_command_review.requires_test_evidence_later} |`,
    `| Fake or unstable command found | ${evidence.verification_command_review.fake_or_unstable_command_found} |`,
    "",
    "## Subagent Review Routing",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Subagent review recommended | ${evidence.subagent_review_routing.subagent_review_recommended} |`,
    `| Run plan required | ${evidence.subagent_review_routing.run_plan_required} |`,
    `| All subagents read-only | ${evidence.subagent_review_routing.all_subagents_read_only} |`,
    `| Subagent output is authority | ${evidence.subagent_review_routing.subagent_output_is_authority} |`,
    `| All subagents closed or skipped | ${evidence.subagent_review_routing.all_subagents_closed_or_skipped} |`,
    "",
    "## Boundaries",
    "",
    "| Boundary | Value |",
    "| --- | --- |",
    `| This report writes target files | ${evidence.boundaries.writes_target_files} |`,
    `| This report authorizes implementation | ${evidence.boundaries.authorizes_implementation} |`,
    `| This report approves commit or push | ${evidence.boundaries.approves_commit_or_push} |`,
    `| This report approves release or production | ${evidence.boundaries.approves_release_or_production} |`,
    `| This report executes tests | ${evidence.boundaries.executes_tests} |`,
    `| This report changes production | ${evidence.boundaries.changes_production} |`,
    "",
    "## Outcome",
    "",
    `\`${evidence.outcome}\``,
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(evidence, null, 2),
    "```",
    "",
  ];
  return `${lines.join("\n")}`;
}

function resolveOutputPath(root, requested) {
  if (path.isAbsolute(requested) || requested.includes("..")) {
    console.error("FAIL --out must be a relative path inside plan-review-reports/");
    process.exit(1);
  }
  const normalized = requested.replaceAll("\\", "/");
  if (!/^plan-review-reports\/[^/]+\.md$/.test(normalized)) {
    console.error("FAIL --out must match plan-review-reports/*.md");
    process.exit(1);
  }
  const resolved = path.resolve(root, normalized);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error("FAIL --out escapes target project");
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex")}`;
}

function slug(value) {
  return String(value || "task")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "task";
}
