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
  challengerRequired,
  coverageScenarioIdentity,
  deriveBusinessUniverseRouting,
  discoverBusinessUniverseEvidence,
  validateBusinessUniverseChallenger,
} from "./lib/business-universe.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json", "format", "intent", "task-governance-ref", "work-queue-ref",
  "work-queue-item-id", "challenger-ref", "resume-from", "max-files", "max-bytes", "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = canonicalProjectRoot(path.resolve(process.cwd(), args._[0] || "."));
const intent = String(args.intent || args._.slice(1).join(" ") || "").trim();
const outputFormat = args.json ? "json" : String(args.format || "human");
const taskGovernanceRef = normalizeArtifactRef(args["task-governance-ref"] || "");
const workQueueRef = normalizeArtifactRef(args["work-queue-ref"] || "");
const workQueueItemId = String(args["work-queue-item-id"] || "").trim();
const challengerRef = normalizeArtifactRef(args["challenger-ref"] || "");
const resumeFromRef = normalizeArtifactRef(args["resume-from"] || "");
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
  const discovery = discoverBusinessUniverseEvidence(projectRoot, {
    intent,
    maxFiles,
    maxBytes,
    resumeFrom: resumeEvidence?.discovery_projection || null,
  });
  const coverageRef = outputPath
    ? `artifact:${relative(outputPath)}`
    : `artifact:business-universe-coverage-reports/001-${slugify(intent)}.md`;
  const workQueue = readWorkQueue(workQueueRef, workQueueItemId);
  const taskEntryBinding = taskEntryBindingFor({ taskGovernance, workQueue, impact });
  const locators = discovery.candidate_sources.map((item) => item.locator);
  const governanceLocator = taskGovernance.file ? locatorForReport(taskGovernance.file, "TASK_GOVERNANCE_ROUTING") : null;
  if (governanceLocator) locators.push(governanceLocator);
  const evidenceLocators = uniqueBy(locators, (item) => item.locator_id);
  const fallbackLocatorRefs = evidenceLocators.map((item) => item.locator_id).slice(0, 1);
  const relationships = (routing.preflight?.structural_relationships || [])
    .filter((item) => (routing.relationship_ids || []).includes(item.relationship_id))
    .map((item) => ({
      relationship_id: item.relationship_id,
      reason_code: item.reason_code,
      summary: item.summary,
      evidence_locator_refs: item.evidence_locator_refs.length > 0 ? item.evidence_locator_refs : fallbackLocatorRefs,
    }));
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
  const categories = candidateRows.map((item, index) => ({
    category_id: `category:candidate-${index + 1}`,
    name: `candidate behavior ${index + 1}`,
    disposition: "REQUIRED",
    semantic_state: "CANDIDATE",
    evidence_locator_refs: item.evidence_locator_refs || fallbackLocatorRefs,
    exclusion_basis_locator_refs: [],
    notes: "Automatic discovery is candidate-only. Codex must replace this row with semantically inspected, task-relevant evidence.",
  }));
  const origins = categories.map((category, index) => ({
    origin_id: `origin:candidate-${index + 1}`,
    name: `candidate origin ${index + 1}`,
    category_ids: [category.category_id],
    participant_ids: [],
    path_provenance: candidateRows[index]?.path_provenance || "UNKNOWN_PATH",
    semantic_state: "CANDIDATE",
    evidence_locator_refs: category.evidence_locator_refs,
  }));
  const processingPaths = categories.map((category, index) => ({
    processing_path_id: `processing-path:candidate-${index + 1}`,
    name: `candidate project path ${index + 1}`,
    category_ids: [category.category_id],
    origin_ids: [origins[index].origin_id],
    path_provenance: candidateRows[index]?.path_provenance || "UNKNOWN_PATH",
    semantic_state: "CANDIDATE",
    evidence_locator_refs: category.evidence_locator_refs,
  }));
  const scenarios = categories.map((category, index) => {
    const base = {
      category_ids: [category.category_id],
      participant_ids: [],
      origin_ids: [origins[index].origin_id],
      lifecycle_stage: "ORIGIN_OR_ENTRY",
      processing_path_ids: [processingPaths[index].processing_path_id],
      selection_point_ids: [],
      consistency_group_ids: [],
      path_provenance: processingPaths[index].path_provenance,
      required_proof_strength: "STRUCTURAL_SOURCE_PROOF",
      expected_behavior: "Codex must replace this candidate with the exact task-relevant expected behavior.",
      negative_or_reverse_behavior: "Codex must record the relevant negative, reverse, or not-applicable behavior.",
      source_locator_refs: category.evidence_locator_refs,
    };
    return { ...coverageScenarioIdentity(base), ...base };
  });
  const lifecycleCoverage = categories.map((category, index) => ({
    lifecycle_coverage_id: `lifecycle:candidate-${index + 1}-origin-or-entry`,
    category_ids: [category.category_id],
    lifecycle_stage: "ORIGIN_OR_ENTRY",
    disposition: "TECHNICAL_INSPECTION_REQUIRED",
    reason: "Automatic discovery records only the observed entry candidate. Codex must inspect relevant lifecycle branches without generating a category-by-stage matrix.",
    evidence_locator_refs: category.evidence_locator_refs,
    coverage_scenario_ids: [scenarios[index].coverage_scenario_id],
  }));
  const challengerIsRequired = challengerRequired(routing, impact);
  const challenger = challengerEvidence(challengerRef, challengerIsRequired, {
    taskRef,
    intentDigest,
    discoveryBoundaryDigest: discovery.projection.discovery_boundary_digest,
    scenarios,
  });
  const unresolved = [
    unresolvedItem("technical:semantic-inspection", "TECHNICAL_INSPECTION", "Candidate sources require semantic inspection before coverage can be ready."),
  ];
  if (!taskGovernance.evidence) unresolved.push(unresolvedItem("technical:task-governance", "TECHNICAL_INSPECTION", "A current Task Governance report is required."));
  if (!workQueue.item) unresolved.push(unresolvedItem("technical:work-queue", "TECHNICAL_INSPECTION", "The exact current Work Queue item is not bound."));
  if (challengerIsRequired && challenger.status !== "PASSED") unresolved.push(unresolvedItem("technical:challenger", "TECHNICAL_INSPECTION", "Required Challenger review is not complete."));
  const authoritySourceRefs = unique([
    ...evidenceLocators.map((item) => item.source_ref),
    taskGovernanceRef,
    workQueueRef,
    challengerRef,
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
    selection_points: [],
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
    outcome: "BLOCKED_INCOMPLETE_UNIVERSE",
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
    humanSummary: resumeEvidence
      ? "我已经从同一项目和任务的受信扫描状态继续核对，当前仍需完成语义、生命周期和真实生成路径检查。"
      : "我已经找到候选业务路径，但还需要继续核对语义、生命周期和真实生成路径，当前不会宣称覆盖完整。",
    structuredEvidence,
    outcome: structuredEvidence.outcome,
  };
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

Candidate rows are recorded in Machine-Readable Evidence and require semantic inspection before readiness.

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
${JSON.stringify(evidence, null, 2)}
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
