#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateSchema,
} from "./lib/artifact-schema.mjs";
import {
  createEvidenceAuthorityBinding,
  resolveAuthoritativeEvidenceReference,
  validateEvidenceAuthorityBinding,
} from "./lib/evidence-authority.mjs";
import {
  BUSINESS_UNIVERSE_LIFECYCLE_STAGES,
  boundBusinessUniverseDiscovery,
  challengerRequired,
  coverageScenarioIdentity,
  deriveBusinessUniverseRouting,
  discoverBusinessUniverseEvidence,
  validateBusinessUniverseChallenger,
} from "./lib/business-universe.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json", "format", "intent", "task-governance-ref", "work-queue-ref",
  "work-queue-item-id", "challenger-ref", "semantic-review-ref", "resume-from", "source-paths", "max-files", "max-bytes", "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = canonicalProjectRoot(path.resolve(process.cwd(), args._[0] || "."));
const intent = String(args.intent || args._.slice(1).join(" ") || "").trim();
const outputFormat = args.json ? "json" : String(args.format || "human");
const taskGovernanceRef = normalizeArtifactRef(args["task-governance-ref"] || "");
const workQueueRef = normalizeArtifactRef(args["work-queue-ref"] || "");
const workQueueItemId = String(args["work-queue-item-id"] || "").trim();
const challengerRef = normalizeArtifactRef(args["challenger-ref"] || "");
const semanticReviewRef = normalizeArtifactRef(args["semantic-review-ref"] || "");
const resumeFromRef = normalizeArtifactRef(args["resume-from"] || "");
const boundedSourcePaths = String(args["source-paths"] || "").split(",").map((item) => item.trim()).filter(Boolean);
const maxFiles = positiveInteger(args["max-files"], 8000, "--max-files");
const maxBytes = positiveInteger(args["max-bytes"], 16 * 1024 * 1024, "--max-bytes");
const outputPath = args.out ? resolveOutputPath(projectRoot, String(args.out)) : "";

if (unknown.length > 0) failNow(`unknown option: --${unknown.join(", --")}`);
if (!intent) failNow("--intent is required for Business Universe Coverage");
if (!["human", "json"].includes(outputFormat)) failNow(`unknown --format: ${outputFormat}`);

const report = buildReport();
const output = outputFormat === "json" ? `${JSON.stringify(report, null, 2)}\n` : renderMarkdown(report);
if (outputPath && report.structuredEvidence) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}
process.stdout.write(output);

function buildReport() {
  const taskGovernance = readEvidenceRef(taskGovernanceRef);
  const impact = taskGovernance.evidence?.impact_classification?.task_impact || "POSSIBLE_HIGH";
  const taskKind = taskGovernance.evidence?.impact_classification?.task_kind || "unknown";
  const routing = taskGovernance.evidence?.business_universe_routing
    || deriveBusinessUniverseRouting({ projectRoot, intent, taskImpact: impact, taskKind });
  if (routing.routing_result !== "REQUIRED_WITH_EVIDENCE") {
    return {
      reportType: "BUSINESS_UNIVERSE_ROUTING_VIEW",
      schemaVersion: "1.108.0",
      generatedBy: "scripts/resolve-business-universe-coverage.mjs",
      generatedAt: new Date().toISOString(),
      projectRoot,
      readOnly: true,
      routing,
      outcome: routing.routing_result,
      humanSummary: routing.routing_result === "NOT_REQUIRED_WITH_REASON"
        ? "我已经核对过，这个任务不需要额外建立业务全集报告。"
        : "我还在继续检查项目结构，技术判断没有交给你。",
      boundaries: boundaries(),
    };
  }

  const taskRef = taskGovernance.evidence?.task_ref || `tasks/001-${slugify(intent)}.md`;
  const intentDigest = digest(intent);
  const resumeEvidence = readResumeEvidence(resumeFromRef, taskRef, intentDigest);
  let discovery = discoverBusinessUniverseEvidence(projectRoot, {
    intent,
    maxFiles,
    maxBytes,
    resumeFrom: resumeEvidence?.discovery_projection || null,
  });
  const bounded = boundBusinessUniverseDiscovery(discovery, boundedSourcePaths);
  if (!bounded.ok) failNow(bounded.errors.join("; "));
  discovery = bounded.discovery;
  const coverageRef = outputPath
    ? `artifact:${relative(outputPath)}`
    : `artifact:business-universe-coverage-reports/001-${slugify(intent)}.md`;
  const workQueue = readWorkQueue(workQueueRef, workQueueItemId);
  const taskEntryBinding = taskEntryBindingFor({ taskGovernance, workQueue, impact });
  const locators = discovery.candidate_sources.map((item) => item.locator);
  const governanceLocator = taskGovernance.file ? locatorForReport(taskGovernance.file, "TASK_GOVERNANCE_ROUTING") : null;
  if (governanceLocator) locators.push(governanceLocator);
  const evidenceLocators = uniqueBy(locators, (item) => item.locator_id);
  const retainedLocatorIds = new Set(evidenceLocators.map((item) => item.locator_id));
  const fallbackLocatorRefs = evidenceLocators.map((item) => item.locator_id).slice(0, 1);
  const relationships = (routing.preflight?.structural_relationships || [])
    .filter((item) => (routing.relationship_ids || []).includes(item.relationship_id))
    .map((item) => {
      const retainedRefs = item.evidence_locator_refs.filter((ref) => retainedLocatorIds.has(ref));
      return {
        relationship_id: item.relationship_id,
        reason_code: item.reason_code,
        summary: item.summary,
        evidence_locator_refs: retainedRefs.length > 0 ? retainedRefs : fallbackLocatorRefs,
      };
    });
  if (relationships.length === 0) {
    for (const reasonCode of routing.reason_codes.filter((item) => item !== "HIGH_RISK_OMISSION_AMPLIFIER")) {
      relationships.push({
        relationship_id: `relationship:${slugify(reasonCode)}`,
        reason_code: reasonCode,
        summary: "Task Governance found a structural omission risk that still requires semantic inspection.",
        evidence_locator_refs: fallbackLocatorRefs,
      });
    }
  }

  const candidateRows = discovery.candidate_sources.length > 0
    ? discovery.candidate_sources
    : [{ source_ref: taskGovernanceRef || "artifact:task-governance-reports/current.md", path_provenance: "UNKNOWN_PATH", evidence_locator_refs: fallbackLocatorRefs }];
  const semanticReview = readSemanticReview(semanticReviewRef, {
    taskRef,
    intentDigest,
    discoveryBoundaryDigest: discovery.projection.discovery_boundary_digest,
    candidateRows,
  });
  const semanticReviewLocator = semanticReview.ok
    ? locatorForReview(semanticReview.file, semanticReviewRef, "BUSINESS_UNIVERSE_SEMANTIC_REVIEW")
    : null;
  if (semanticReviewLocator) evidenceLocators.push(semanticReviewLocator);
  const categories = candidateRows.map((item, index) => ({
    category_id: `category:candidate-${index + 1}`,
    name: semanticReview.rows[index]?.name || `candidate behavior ${index + 1}`,
    disposition: "REQUIRED",
    semantic_state: semanticReview.ok ? "EVIDENCE_BOUND" : "CANDIDATE",
    evidence_locator_refs: unique([
      ...(item.evidence_locator_refs || fallbackLocatorRefs),
      semanticReviewLocator?.locator_id,
    ]),
    exclusion_basis_locator_refs: [],
    notes: semanticReview.ok
      ? semanticReview.rows[index].notes
      : "Automatic discovery is candidate-only. Codex must replace this row with semantically inspected, task-relevant evidence.",
  }));
  const origins = categories.map((category, index) => ({
    origin_id: `origin:candidate-${index + 1}`,
    name: semanticReview.rows[index]?.origin_name || `candidate origin ${index + 1}`,
    category_ids: [category.category_id],
    participant_ids: [],
    path_provenance: semanticReview.rows[index]?.path_provenance || candidateRows[index]?.path_provenance || "UNKNOWN_PATH",
    semantic_state: semanticReview.ok ? "EVIDENCE_BOUND" : "CANDIDATE",
    evidence_locator_refs: category.evidence_locator_refs,
  }));
  const processingPaths = categories.map((category, index) => ({
    processing_path_id: `processing-path:candidate-${index + 1}`,
    name: semanticReview.rows[index]?.processing_path_name || `candidate project path ${index + 1}`,
    category_ids: [category.category_id],
    origin_ids: [origins[index].origin_id],
    path_provenance: semanticReview.rows[index]?.path_provenance || candidateRows[index]?.path_provenance || "UNKNOWN_PATH",
    semantic_state: semanticReview.ok ? "EVIDENCE_BOUND" : "CANDIDATE",
    evidence_locator_refs: category.evidence_locator_refs,
  }));
  const selectionPoints = routing.reason_codes.includes("SELECTIVE_INCLUSION_OR_FANOUT") && semanticReview.ok
    ? [{
      selection_point_id: "selection-point:retention-deduplication",
      name: "Forward-only evidence retention and deduplication",
      affected_category_ids: categories.map((category) => category.category_id),
      handling: "DEDUPLICATE",
      evidence_locator_refs: semanticReviewLocator ? [semanticReviewLocator.locator_id] : fallbackLocatorRefs,
    }]
    : [];
  const scenarios = categories.map((category, index) => {
    const base = {
      category_ids: [category.category_id],
      participant_ids: [],
      origin_ids: [origins[index].origin_id],
      lifecycle_stage: semanticReview.rows[index]?.lifecycle_stage || "ORIGIN_OR_ENTRY",
      processing_path_ids: [processingPaths[index].processing_path_id],
      selection_point_ids: selectionPoints.map((item) => item.selection_point_id),
      consistency_group_ids: [],
      path_provenance: processingPaths[index].path_provenance,
      required_proof_strength: semanticReview.rows[index]?.required_proof_strength || "STRUCTURAL_SOURCE_PROOF",
      expected_behavior: semanticReview.rows[index]?.expected_behavior || "Codex must replace this candidate with the exact task-relevant expected behavior.",
      negative_or_reverse_behavior: semanticReview.rows[index]?.negative_or_reverse_behavior || "Codex must record the relevant negative, reverse, or not-applicable behavior.",
      source_locator_refs: category.evidence_locator_refs,
    };
    return { ...coverageScenarioIdentity(base), ...base };
  });
  const lifecycleCoverage = categories.flatMap((category, index) => {
    const requiredStage = scenarios[index].lifecycle_stage;
    const stages = semanticReview.ok ? BUSINESS_UNIVERSE_LIFECYCLE_STAGES : [requiredStage];
    return stages.map((stage) => {
      const required = stage === requiredStage;
      return {
        lifecycle_coverage_id: `lifecycle:candidate-${index + 1}-${stage.toLowerCase().replaceAll("_", "-")}`,
        category_ids: [category.category_id],
        lifecycle_stage: stage,
        disposition: semanticReview.ok
          ? (required ? "REQUIRED" : "NOT_APPLICABLE_WITH_EVIDENCE")
          : "TECHNICAL_INSPECTION_REQUIRED",
        reason: semanticReview.ok
          ? (required
            ? semanticReview.rows[index].lifecycle_reason
            : "The reviewed source has no separate task-relevant behavior for this lifecycle stage; its reverse or failure behavior is covered by the retained scenario.")
          : "Automatic discovery records only the observed entry candidate. Codex must inspect relevant lifecycle branches without generating a category-by-stage matrix.",
        evidence_locator_refs: category.evidence_locator_refs,
        coverage_scenario_ids: required ? [scenarios[index].coverage_scenario_id] : [],
      };
    });
  });
  const challengerIsRequired = challengerRequired(routing, impact);
  const challenger = challengerEvidence(challengerRef, challengerIsRequired, {
    taskRef,
    intentDigest,
    discoveryBoundaryDigest: discovery.projection.discovery_boundary_digest,
    scenarios,
  });
  const unresolved = [];
  if (!semanticReview.ok) unresolved.push(unresolvedItem("technical:semantic-inspection", "TECHNICAL_INSPECTION", semanticReview.errors.join("; ") || "Candidate sources require semantic inspection before coverage can be ready."));
  if (!taskGovernance.evidence) unresolved.push(unresolvedItem("technical:task-governance", "TECHNICAL_INSPECTION", "A current Task Governance report is required."));
  if (!workQueue.item) unresolved.push(unresolvedItem("technical:work-queue", "TECHNICAL_INSPECTION", "The exact current Work Queue item is not bound."));
  if (challengerIsRequired && challenger.status !== "PASSED") unresolved.push(unresolvedItem("technical:challenger", "TECHNICAL_INSPECTION", "Required Challenger review is not complete."));
  const authoritySourceRefs = unique([
    ...evidenceLocators.map((item) => item.source_ref),
    taskGovernanceRef,
    workQueueRef,
    challengerRef,
    semanticReviewRef,
    resumeFromRef,
  ].filter(Boolean));
  const evidenceBase = {
    schema_version: "1.108.0",
    artifact_type: "business_universe_coverage",
    task_ref: taskRef,
    intent,
    intent_digest: intentDigest,
    coverage_id: `business-universe:${slugify(intent)}`,
    coverage_ref: coverageRef,
    coverage_digest: "",
    task_entry_binding: taskEntryBinding,
    preliminary_routing: {
      routing_result: "REQUIRED_WITH_EVIDENCE",
      reason_codes: routing.reason_codes,
      relationship_ids: routing.relationship_ids,
      trigger_evidence_locator_refs: unique(relationships.flatMap((item) => item.evidence_locator_refs)),
      preflight_digest: routing.preflight?.preflight_digest || zeroDigest(),
      discovery_boundary_digest: routing.preflight?.discovery_boundary_digest || discovery.projection.discovery_boundary_digest,
    },
    trigger: {
      reason_codes: routing.reason_codes,
      structural_relationships: relationships,
    },
    discovery_projection: discovery.projection,
    evidence_locators: evidenceLocators,
    categories,
    participants: [],
    origins,
    processing_paths: processingPaths,
    lifecycle_coverage: lifecycleCoverage,
    selection_points: selectionPoints,
    consistency_groups: [],
    coverage_scenarios: scenarios,
    fact_dependencies: [],
    unresolved_items: unresolved,
    challenger_review: challenger,
    authority_binding: createEvidenceAuthorityBinding(projectRoot, {
      taskRef,
      intentDigest,
      sourceRefs: authoritySourceRefs,
    }),
    outcome: semanticReview.ok && (!challengerIsRequired || challenger.status === "PASSED") && taskGovernance.evidence && workQueue.item
      ? "COVERAGE_READY"
      : "BLOCKED_INCOMPLETE_UNIVERSE",
    boundaries: boundaries(),
  };
  const structuredEvidence = {
    ...evidenceBase,
    coverage_digest: evidenceDigest(evidenceBase, ["coverage_digest"]),
  };
  return {
    reportType: "BUSINESS_UNIVERSE_COVERAGE",
    schemaVersion: "1.108.0",
    generatedBy: "scripts/resolve-business-universe-coverage.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot,
    readOnly: true,
    humanSummary: structuredEvidence.outcome === "COVERAGE_READY"
      ? "我已经完成受信扫描、逐项语义复核和 Challenger 反向检查；当前业务全集覆盖可以进入后续证据链。"
      : (resumeEvidence
        ? "我已经从同一项目和任务的受信扫描状态继续核对，当前仍需完成语义、生命周期和真实生成路径检查。"
        : "我已经找到候选业务路径，但还需要继续核对语义、生命周期和真实生成路径，当前不会宣称覆盖完整。"),
    structuredEvidence,
    outcome: structuredEvidence.outcome,
  };
}

function readSemanticReview(ref, expected) {
  if (!ref) return { ok: false, rows: [], errors: ["A current semantic review is required."] };
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", ref);
  if (!resolved.ok) return { ok: false, rows: [], errors: [resolved.error] };
  let value;
  try {
    value = JSON.parse(fs.readFileSync(resolved.file, "utf8"));
  } catch (error) {
    return { ok: false, rows: [], errors: [`Semantic review must be valid JSON: ${error.message}`] };
  }
  const errors = [];
  if (value.schema_version !== "1.118.0" || value.artifact_type !== "business_universe_semantic_review") errors.push("Semantic review identity is invalid.");
  if (value.task_ref !== expected.taskRef || value.intent_digest !== expected.intentDigest) errors.push("Semantic review task or intent binding is stale.");
  if (value.discovery_boundary_digest !== expected.discoveryBoundaryDigest) errors.push("Semantic review discovery boundary is stale.");
  if (value.outcome !== "PASSED") errors.push("Semantic review outcome must be PASSED.");
  const rows = Array.isArray(value.reviewed_sources) ? value.reviewed_sources : [];
  const bySource = new Map(rows.map((row) => [String(row?.source_ref || ""), row]));
  const expectedRefs = expected.candidateRows.map((row) => row.source_ref);
  if (rows.length !== expectedRefs.length || bySource.size !== rows.length || expectedRefs.some((sourceRef) => !bySource.has(sourceRef))) {
    errors.push("Semantic review must cover every bounded candidate source exactly once.");
  }
  const orderedRows = expectedRefs.map((sourceRef) => bySource.get(sourceRef) || {});
  for (const row of orderedRows) {
    for (const field of ["name", "origin_name", "processing_path_name", "notes", "lifecycle_reason", "expected_behavior", "negative_or_reverse_behavior"]) {
      if (!String(row[field] || "").trim()) errors.push(`Semantic review field ${field} is required for ${row.source_ref || "an expected source"}.`);
    }
    if (!new Set(["PROJECT_RUNTIME_PATH", "PROJECT_NATIVE_AUTOMATION", "EXTERNAL_SYSTEM_PATH", "FIXTURE_OR_SEED_PATH", "MOCK_OR_STUB_PATH", "MANUAL_ONLY_PATH", "UNKNOWN_PATH"]).has(row.path_provenance)) errors.push(`Semantic review path provenance is invalid for ${row.source_ref || "an expected source"}.`);
    if (!new Set(["ORIGIN_OR_ENTRY", "ELIGIBILITY_OR_VALIDATION", "PROCESSING_OR_TRANSITION", "PROPAGATION_OR_SIDE_EFFECT", "DERIVED_RESULT", "MUTATION_OR_CORRECTION", "FAILURE_RETRY_OR_RECOVERY", "TERMINATION_REVERSAL_OR_COMPENSATION", "OBSERVATION_OR_AUDIT"]).has(row.lifecycle_stage)) errors.push(`Semantic review lifecycle stage is invalid for ${row.source_ref || "an expected source"}.`);
    if (!new Set(["STRUCTURAL_SOURCE_PROOF", "PROJECT_NATIVE_BEHAVIOR_PROOF", "RUNTIME_TRUSTED_BEHAVIOR_PROOF", "EXTERNAL_FACT_PROOF"]).has(row.required_proof_strength)) errors.push(`Semantic review proof strength is invalid for ${row.source_ref || "an expected source"}.`);
  }
  const boundaries = value.boundaries || {};
  for (const field of ["writes_target_files", "authorizes_implementation", "approves_completion", "replaces_unified_closure"]) {
    if (boundaries[field] !== "No") errors.push(`Semantic review boundary ${field} must be No.`);
  }
  return { ok: errors.length === 0, rows: orderedRows, errors, file: resolved.file };
}

function readEvidenceRef(ref) {
  if (!ref) return { file: "", evidence: null };
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", ref);
  if (!resolved.ok) return { file: "", evidence: null };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  return { file: resolved.file, evidence: extracted?.ok ? extracted.value : null };
}

function readResumeEvidence(ref, taskRef, intentDigest) {
  if (!ref) return null;
  const report = readEvidenceRef(ref);
  const evidence = report.evidence;
  if (!report.file || !evidence || evidence.artifact_type !== "business_universe_coverage") {
    failNow("--resume-from must resolve to a structured Business Universe Coverage report");
  }
  if (outputPath && path.resolve(outputPath) === path.resolve(report.file)) {
    failNow("--resume-from must be preserved; write the resumed result to a different report path");
  }
  const schema = loadSchema(projectRoot, "schemas/artifacts/business-universe-coverage.schema.json");
  const validation = schema ? validateSchema(evidence, schema, { label: "Business Universe resume evidence" }) : { ok: false, errors: ["trusted schema is unavailable"] };
  if (!validation.ok) failNow(`--resume-from is invalid: ${validation.errors.join("; ")}`);
  if (evidence.coverage_digest !== evidenceDigest(evidence, ["coverage_digest"])) {
    failNow("--resume-from coverage digest is invalid");
  }
  if (evidence.task_ref !== taskRef || evidence.intent_digest !== intentDigest) {
    failNow("--resume-from does not belong to the current task and intent");
  }
  const sourceRefs = (evidence.authority_binding?.sources || []).map((item) => item.ref);
  const authority = validateEvidenceAuthorityBinding(projectRoot, evidence.authority_binding, {
    taskRef,
    intentDigest,
    sourceRefs,
  });
  if (!authority.ok) failNow(`--resume-from authority is stale: ${authority.errors.join("; ")}`);
  if (evidence.discovery_projection?.support_status !== "PARTIAL"
    || evidence.discovery_projection?.budget_exhausted !== "Yes") {
    failNow("--resume-from is allowed only for a current partial budget-bounded discovery");
  }
  return evidence;
}

function readWorkQueue(ref, itemId) {
  const report = readEvidenceRef(ref);
  const items = report.evidence?.queue_items || [];
  const item = itemId
    ? items.find((candidate) => candidate.item_id === itemId)
    : items.find((candidate) => candidate.state === "CURRENT");
  return { ...report, item: item || null };
}

function taskEntryBindingFor({ taskGovernance, workQueue, impact }) {
  const item = workQueue.item;
  const governance = taskGovernance.evidence;
  const reviewLevel = governance?.review_policy?.review_level || reviewLevelFor(impact);
  const blockers = unique([
    ...(governance?.readiness?.blocked_by || []),
    "Business Universe semantic inspection is not complete.",
  ]);
  return {
    work_queue_item_ref: item && workQueueRef ? `${workQueueRef}#${item.item_id}` : (workQueueRef || "artifact:work-queue-takeover-reports/current.md#CURRENT"),
    work_queue_item_digest: item?.source_item_digest || zeroDigest(),
    work_queue_item_state: item?.state || "BLOCKED",
    work_queue_item_current_task_match: item && governance && item.task_governance_digest === governance.task_governance_digest ? "Yes" : "No",
    approved_resume_review: "No",
    resume_review_ref: "",
    resume_review_digest: "",
    resume_review_owner: "",
    resume_review_task_match: "N/A",
    task_governance_ref: taskGovernanceRef || "artifact:task-governance-reports/current.md",
    task_governance_digest: governance?.task_governance_digest || zeroDigest(),
    task_governance_tier: impact,
    task_governance_review_level: reviewLevel,
    task_governance_task_match: governance ? "Yes" : "No",
    minimal_verification_status: impact === "LOW" ? "REQUIRED" : "N/A",
    targeted_verification_status: impact === "MEDIUM" ? "REQUIRED" : "N/A",
    high_impact_evidence_chain_complete: impact === "HIGH" ? "No" : "N/A",
    task_governance_blocks_completion: "Yes",
    tier_completion_requirements_satisfied: "No",
    unresolved_task_governance_blockers: blockers,
    plain_user_blocker: "我还在核对业务覆盖范围，尚不能把任务当作完成。",
  };
}

function challengerEvidence(ref, required, expected) {
  const evidence = readEvidenceRef(ref);
  const validation = evidence.file
    ? validateBusinessUniverseChallenger(evidence.evidence, expected)
    : { ok: false, errors: ["Required Challenger evidence is missing."] };
  const passed = Boolean(required && validation.ok);
  return {
    required: required ? "Yes" : "No",
    status: required ? (passed ? "PASSED" : "PENDING") : "NOT_REQUIRED",
    evidence_refs: evidence.file ? [ref] : [],
    checked_risks: passed ? [...evidence.evidence.checked_risks] : (required ? [
      "missing category or origin",
      "positive-only lifecycle coverage",
      "fixture, seed, mock, or manual path presented as project-runtime proof",
      "partial write or cross-module disagreement",
      "prose-only acceptance without verification evidence",
      "stale evidence or untraceable derived result",
    ] : []),
    findings: passed
      ? evidence.evidence.findings.map((item) => `${item.finding_id}: ${item.disposition}`)
      : (required ? validation.errors : []),
  };
}

function locatorForReport(file, relation) {
  const sourceRef = `file:${relative(file)}`;
  const content = fs.readFileSync(file, "utf8");
  return {
    locator_id: `locator:${digest(`${sourceRef}|${relation}`).slice(7, 31)}`,
    source_ref: sourceRef,
    authority_binding_ref: sourceRef,
    locator_kind: "PROJECT_NATIVE_ID",
    locator: relation,
    evidence_kind: "PROJECT_GOVERNANCE",
    relation,
    semantic_digest: digest(content),
  };
}

function locatorForReview(file, sourceRef, relation) {
  const content = fs.readFileSync(file, "utf8");
  return {
    locator_id: `locator:${digest(`${sourceRef}|${relation}`).slice(7, 31)}`,
    source_ref: sourceRef,
    authority_binding_ref: sourceRef,
    locator_kind: "PROJECT_NATIVE_ID",
    locator: relation,
    evidence_kind: "PROJECT_GOVERNANCE",
    relation,
    semantic_digest: digest(content),
  };
}

function unresolvedItem(id, type, summary) {
  return { unresolved_id: id, unresolved_type: type, summary, dependent_fact_ids: [], evidence_locator_refs: [] };
}

function renderMarkdown(report) {
  if (!report.structuredEvidence) {
    const detail = report.outcome === "NOT_REQUIRED_WITH_REASON"
      ? report.routing.not_required_reason
      : report.routing.technical_inspection_reason;
    return `# Business Universe Routing\n\n${report.humanSummary}\n\n- Outcome: \`${report.outcome}\`\n- Detail: ${detail}\n- User technical decision required: \`No\`\n- Report written: \`No\`\n`;
  }
  const evidence = report.structuredEvidence;
  return `# Business Universe Coverage Report

This is an internal evidence source. It does not authorize implementation, completion, release, or production.

## Human Summary

${report.humanSummary}

## Task Entry Binding

The exact Work Queue item and Task Governance report are recorded in Machine-Readable Evidence.

## Preliminary Routing

Task Governance routed this task to conditional Business Universe Coverage using project evidence.

## Structural Relationships

${evidence.trigger.structural_relationships.map((item) => `- \`${item.relationship_id}\`: ${item.summary}`).join("\n")}

## Discovery Boundary

- Adapter: \`${evidence.discovery_projection.adapter_kind}\`
- Support: \`${evidence.discovery_projection.support_status}\`
- Truncated: \`${evidence.discovery_projection.truncated}\`
- Budget exhausted: \`${evidence.discovery_projection.budget_exhausted}\`

## Categories, Participants, Origins, And Paths

${evidence.outcome === "COVERAGE_READY"
    ? "Every retained source row is semantically reviewed and evidence-bound."
    : "Candidate rows are recorded in Machine-Readable Evidence and require semantic inspection before readiness."}

## Lifecycle And Provenance

Lifecycle applicability, path provenance, and required proof strength are recorded per coverage scenario.

## Selection And Consistency

Selection points and consistency groups must be evidence-bound whenever their routing reasons apply.

## Coverage Scenarios

${evidence.coverage_scenarios.map((item) => `- \`${item.coverage_scenario_id}\` / \`${item.lifecycle_stage}\` / \`${item.path_provenance}\``).join("\n")}

## Fact Dependencies

${evidence.fact_dependencies.length > 0 ? "Fact dependencies are recorded in Machine-Readable Evidence." : "None recorded."}

## Unresolved Items

${evidence.unresolved_items.map((item) => `- ${item.summary}`).join("\n") || "None."}

## Challenger Review

- Required: \`${evidence.challenger_review.required}\`
- Status: \`${evidence.challenger_review.status}\`

## Boundaries

- Writes target files: \`No\`
- Authorizes implementation: \`No\`
- Approves completion: \`No\`
- Approves release or production: \`No\`
- Replaces Unified Closure: \`No\`
- Claims real-world completeness: \`No\`

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence)}
\`\`\`

## Outcome

\`${evidence.outcome}\`
`;
}

function reviewLevelFor(impact) {
  if (impact === "LOW") return "LIGHTWEIGHT";
  if (impact === "MEDIUM") return "TARGETED";
  if (impact === "HIGH") return "FULL";
  return "BLOCKING_CLARIFICATION";
}

function boundaries() {
  return {
    writes_target_files: "No",
    authorizes_implementation: "No",
    approves_completion: "No",
    approves_release_or_production: "No",
    replaces_unified_closure: "No",
    claims_real_world_completeness: "No",
  };
}

function resolveOutputPath(root, requested) {
  if (path.isAbsolute(requested)) failNow("--out must be project-relative");
  const resolved = path.resolve(root, requested);
  const relativePath = relative(resolved);
  if (relativePath.startsWith("../") || !/^business-universe-coverage-reports\/.+\.md$/i.test(relativePath)) {
    failNow("--out must be inside business-universe-coverage-reports/*.md");
  }
  return resolved;
}

function normalizeArtifactRef(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return /^(artifact|file):/.test(raw) ? raw : `artifact:${raw}`;
}

function slugify(value) {
  return String(value || "business-universe").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "business-universe";
}

function relative(file) {
  return path.relative(projectRoot, file).split(path.sep).join("/");
}

function canonicalProjectRoot(root) {
  return fs.existsSync(root) ? fs.realpathSync(root) : root;
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function zeroDigest() {
  return `sha256:${"0".repeat(64)}`;
}

function positiveInteger(value, fallback, label) {
  if (value === undefined || value === false || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) failNow(`${label} must be a positive integer`);
  return parsed;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueBy(values, keyFor) {
  const seen = new Set();
  return values.filter((value) => {
    if (!value) return false;
    const key = keyFor(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function failNow(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}
