import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { extractMachineReadableEvidence } from "./artifact-schema.mjs";
import {
  canonicalFileDigest,
  resolveAuthoritativeEvidenceReference,
} from "./evidence-authority.mjs";
import { defaultIgnoredDirs, filterIntentOSManagedPaths } from "./project-signals.mjs";

export const BUSINESS_UNIVERSE_REASON_CODES = Object.freeze([
  "MULTI_CLASS_OR_ORIGIN",
  "DERIVED_OUTPUT_DEPENDENCY",
  "SELECTIVE_INCLUSION_OR_FANOUT",
  "LIFECYCLE_BRANCH_OR_RECOVERY",
  "PATH_PROVENANCE_AMBIGUITY",
  "DOMAIN_COMPLETENESS_CLAIM",
  "EXISTING_PROJECT_CLOSURE_AUDIT",
  "HIGH_RISK_OMISSION_AMPLIFIER",
]);

export const BUSINESS_UNIVERSE_LIFECYCLE_STAGES = Object.freeze([
  "ORIGIN_OR_ENTRY",
  "ELIGIBILITY_OR_VALIDATION",
  "PROCESSING_OR_TRANSITION",
  "PROPAGATION_OR_SIDE_EFFECT",
  "DERIVED_RESULT",
  "MUTATION_OR_CORRECTION",
  "FAILURE_RETRY_OR_RECOVERY",
  "TERMINATION_REVERSAL_OR_COMPENSATION",
  "OBSERVATION_OR_AUDIT",
]);

export const BUSINESS_UNIVERSE_PATH_PROVENANCE = Object.freeze([
  "PROJECT_RUNTIME_PATH",
  "PROJECT_NATIVE_AUTOMATION",
  "EXTERNAL_SYSTEM_PATH",
  "FIXTURE_OR_SEED_PATH",
  "MOCK_OR_STUB_PATH",
  "MANUAL_ONLY_PATH",
  "UNKNOWN_PATH",
]);

export const BUSINESS_UNIVERSE_PROOF_STRENGTH = Object.freeze([
  "STRUCTURAL_SOURCE_PROOF",
  "PROJECT_NATIVE_BEHAVIOR_PROOF",
  "RUNTIME_TRUSTED_BEHAVIOR_PROOF",
  "EXTERNAL_FACT_PROOF",
]);

const sourceExtensions = new Set([
  ".c", ".cc", ".cpp", ".cs", ".dart", ".ex", ".exs", ".go", ".graphql",
  ".h", ".hpp", ".java", ".js", ".jsx", ".kt", ".kts", ".m", ".mm",
  ".php", ".prisma", ".py", ".rb", ".rs", ".scala", ".sql", ".swift",
  ".ts", ".tsx", ".vue", ".xml", ".yaml", ".yml", ".json",
]);
const semanticDocumentNames = new Set([
  "project-profile.md", "business-spec-index.md", "domain-model.md", "permission-model.md",
  "risk-policy.md", "architecture.md", "openapi.yaml", "openapi.yml", "schema.graphql",
]);
const generatedDirectories = new Set([
  ...defaultIgnoredDirs,
  ".idea", ".vscode", ".xcodeproj", ".xcworkspace", "DerivedData", "Pods",
  "vendor", "target", "out", "generated", "archives", "releases",
]);
const structuralPatterns = Object.freeze({
  MULTI_CLASS_OR_ORIGIN: [
    /\b(?:one|same|shared|common)\b[^\n]{0,100}\b(?:rule|behavior|flow|path)\b/i,
    /(?:同一|共同|统一|共享)[^。；\n]{0,80}(?:规则|行为|流程|路径)/,
  ],
  DERIVED_OUTPUT_DEPENDENCY: [
    /\b(?:derive|aggregate|combine|contribute|calculate)\w*\b[^\n]{0,100}\b(?:result|output|total|view|state)\b/i,
    /(?:派生|聚合|合并|共同产生|计算)[^。；\n]{0,80}(?:结果|输出|总量|状态)/,
  ],
  SELECTIVE_INCLUSION_OR_FANOUT: [
    /\b(?:filter|exclude|eligible|route|branch|fan[- ]?out|deduplicat|prioriti)\w*\b/i,
    /(?:筛选|排除|资格|路由|分支|分流|去重|优先级)/,
  ],
  LIFECYCLE_BRANCH_OR_RECOVERY: [
    /\b(?:correct|amend|retry|recover|fail|terminate|reverse|compensat|cancel)\w*\b/i,
    /(?:修正|更正|重试|恢复|失败|终止|撤销|冲正|补偿)/,
  ],
  PATH_PROVENANCE_AMBIGUITY: [
    /\b(?:fixture|seed|mock|stub|manual)\b[^\n]{0,120}\b(?:runtime|real|actual|automatic|project)\b/i,
    /(?:样例|种子|模拟|桩|手工)[^。；\n]{0,100}(?:真实路径|运行路径|自动生成|项目路径)/,
  ],
  DOMAIN_COMPLETENESS_CLAIM: [
    /\b(?:all|every|entire|complete|exhaustive|without omission)\b\s+(?!tests?\b|files?\b|docs?\b)[\p{L}\p{N}_-]+/iu,
    /(?:全部|所有|任何|完整覆盖|无遗漏)(?!测试|文件|文档)[\p{Script=Han}A-Za-z0-9_-]{1,24}/u,
  ],
  EXISTING_PROJECT_CLOSURE_AUDIT: [
    /\b(?:existing|legacy|current)\b[^\n]{0,100}\b(?:business|behavior|end[- ]to[- ]end)\b[^\n]{0,80}\b(?:audit|closure|coverage|review)\b/i,
    /(?:现有|已有|老项目)[^。；\n]{0,80}(?:业务|行为|端到端)[^。；\n]{0,60}(?:闭环|覆盖|审查)/,
  ],
});

export function deriveBusinessUniverseRouting({
  intent = "",
  projectRoot = "",
  taskImpact = "POSSIBLE_HIGH",
  taskKind = "unknown",
  preflight = null,
} = {}) {
  const effectiveTaskKind = taskKind === "unknown" && isBoundedNonBehavioralIntent(intent)
    ? inferredNonBehavioralTaskKind(intent)
    : taskKind;
  const inspection = preflight || runBusinessUniversePreflight({ projectRoot, intent, taskKind: effectiveTaskKind });
  if (inspection.task_kind_evidence.classification === "NON_BEHAVIORAL"
    && inspection.task_kind_evidence.confidence === "HIGH"
    && inspection.discovery_projection.support_status === "SUPPORTED") {
    return notRequiredRouting(inspection, "Project evidence confirms that the requested change does not alter business behavior.");
  }

  const evidenced = inspection.structural_relationships.filter((item) => item.evidence_state === "EVIDENCE_BOUND");
  const candidates = inspection.structural_relationships.filter((item) => item.evidence_state !== "EVIDENCE_BOUND");
  if (evidenced.length === 0) {
    if (candidates.length > 0) {
      return inspectionRouting(inspection, "Structural omission-risk candidates need further project inspection.");
    }
    const supportedBehavioralRead = inspection.task_kind_evidence.classification === "BEHAVIORAL"
      && inspection.task_kind_evidence.confidence === "HIGH"
      && inspection.task_kind_evidence.evidence_refs.length > 0
      && inspection.discovery_projection.support_status === "SUPPORTED"
      && inspection.discovery_projection.truncated === "No"
      && inspection.discovery_projection.budget_exhausted === "No";
    if (supportedBehavioralRead) {
      return notRequiredRouting(
        inspection,
        "The bounded task-kind and project-evidence read found no supported structural omission signal in the requested behavior.",
      );
    }
    return inspectionRouting(
      inspection,
      "The task is behavioral or ambiguous, but the bounded preflight lacks enough task-relevant project evidence to rule out a structural omission risk.",
    );
  }

  const reasonCodes = unique(evidenced.map((item) => item.reason_code));
  if (taskImpact === "HIGH") reasonCodes.push("HIGH_RISK_OMISSION_AMPLIFIER");
  return {
    required: "Yes",
    routing_result: "REQUIRED_WITH_EVIDENCE",
    reason_codes: BUSINESS_UNIVERSE_REASON_CODES.filter((code) => reasonCodes.includes(code)),
    relationship_ids: evidenced.map((item) => item.relationship_id),
    trigger_evidence_locator_refs: unique(evidenced.flatMap((item) => item.evidence_locator_refs)),
    preflight: inspection,
    not_required_reason: "",
    technical_inspection_reason: "",
    technical_terms_required_from_user: "No",
  };
}

export function runBusinessUniversePreflight({ projectRoot = "", intent = "", taskKind = "unknown" } = {}) {
  const discovery = boundedNonBehavioralTask(taskKind, intent)
    ? boundedNonBehavioralDiscovery(intent)
    : discoverBusinessUniverseEvidence(projectRoot, { intent });
  const taskKindEvidence = classifyTaskKind({ intent, taskKind, discovery });
  const intentRelationships = structuralRelationshipsFromIntent(intent);
  const projectRelationships = structuralRelationshipsFromProject(intent, discovery);
  const structuralRelationships = mergeRelationships([...intentRelationships, ...projectRelationships]);
  const base = {
    preflight_version: "1.108.0",
    task_kind_evidence: taskKindEvidence,
    structural_relationships: structuralRelationships,
    candidate_evidence_refs: unique(discovery.candidate_sources.map((item) => item.source_ref)),
    discovery_projection: discovery.projection,
    discovery_boundary_digest: discovery.projection.discovery_boundary_digest,
  };
  return {
    ...base,
    preflight_digest: digest(base),
  };
}

function boundedNonBehavioralTask(taskKind, intent) {
  return new Set(["docs_only", "test_docs_only", "copy", "visual_only"]).has(String(taskKind || ""))
    && isBoundedNonBehavioralIntent(intent);
}

function inferredNonBehavioralTaskKind(intent) {
  const text = String(intent || "");
  if (/(?:readme|markdown|文档|错别字|typo|format)/i.test(text)) return "docs_only";
  if (/(?:颜色|间距|排版|style|spacing|visual)/i.test(text)) return "visual_only";
  return "copy";
}

function boundedNonBehavioralDiscovery(intent) {
  const inventoryDigest = digest({
    discovery_mode: "BOUNDED_NON_BEHAVIORAL",
    intent: normalizedText(intent),
  });
  const resumeStateDigest = resumeStateDigestFor({
    inventoryDigest,
    nextFileIndex: 0,
    candidateSources: [],
    unsupportedConstructs: [],
  });
  const projectionBase = {
    adapter_kind: "BOUNDED_NON_BEHAVIORAL",
    support_status: "SUPPORTED",
    inspected_roots: [],
    ignore_sources: ["task-kind:bounded-non-behavioral"],
    candidate_sources: [],
    unsupported_constructs: [],
    truncated: "No",
    budget_exhausted: "No",
    scan_segments: [],
    completed_segment_ids: [],
    remaining_segment_ids: [],
    inventory_digest: inventoryDigest,
    next_file_index: 0,
    total_semantic_files: 0,
    resumed: "No",
    resume_from_state_digest: "N/A",
    resume_state_digest: resumeStateDigest,
  };
  return {
    projection: {
      ...projectionBase,
      discovery_boundary_digest: digest(projectionBase),
    },
    candidate_sources: [],
  };
}

export function discoverBusinessUniverseEvidence(projectRoot, options = {}) {
  const root = path.resolve(projectRoot || ".");
  const maxFiles = Number.isInteger(options.maxFiles) ? options.maxFiles : 8000;
  const maxBytes = Number.isInteger(options.maxBytes) ? options.maxBytes : 16 * 1024 * 1024;
  const maxInventoryFiles = Number.isInteger(options.maxInventoryFiles) ? options.maxInventoryFiles : 100000;
  const inventory = projectFileInventory(root, maxInventoryFiles);
  const semanticFiles = inventory.files.filter(isSemanticCandidate);
  const inventoryDigest = digest({ files: semanticFiles, truncated: inventory.truncated });
  const resume = prepareDiscoveryResume(root, semanticFiles, inventoryDigest, options.intent || "", options.resumeFrom);
  const candidateSources = [...resume.candidateSources];
  const unsupportedConstructs = [...resume.unsupportedConstructs];
  let bytesRead = 0;
  let filesRead = 0;
  let nextFileIndex = resume.nextFileIndex;

  while (nextFileIndex < semanticFiles.length && filesRead < maxFiles) {
    const relativePath = semanticFiles[nextFileIndex];
    const file = path.join(root, relativePath);
    let stat;
    try {
      stat = fs.statSync(file);
    } catch {
      unsupportedConstructs.push(`unreadable:${portable(relativePath)}`);
      nextFileIndex += 1;
      filesRead += 1;
      continue;
    }
    if (stat.size > 1024 * 1024) {
      unsupportedConstructs.push(`oversized:${portable(relativePath)}`);
      nextFileIndex += 1;
      filesRead += 1;
      continue;
    }
    if (bytesRead + stat.size > maxBytes) {
      break;
    }
    bytesRead += stat.size;
    filesRead += 1;
    nextFileIndex += 1;
    const text = readText(file);
    if (text === null) {
      unsupportedConstructs.push(`binary-or-unreadable:${portable(relativePath)}`);
      continue;
    }
    const candidate = sourceCandidate(root, relativePath, text, options.intent || "");
    if (candidate) candidateSources.push(candidate);
  }

  const uniqueCandidateSources = uniqueCandidates(candidateSources);
  const segments = discoverySegments(semanticFiles, nextFileIndex, inventory.truncated);
  const completedSegments = segments.filter((item) => item.status === "COMPLETE").map((item) => item.segment_id);
  const remainingSegments = segments.filter((item) => item.status !== "COMPLETE").map((item) => item.segment_id);
  const budgetExhausted = nextFileIndex < semanticFiles.length;
  const supportStatus = unsupportedConstructs.length > 0 || budgetExhausted || inventory.truncated
    ? "PARTIAL"
    : "SUPPORTED";
  const projectionBase = {
    adapter_kind: adapterKindFor(inventory.files),
    support_status: supportStatus,
    inspected_roots: unique(semanticFiles.slice(0, nextFileIndex).map((relative) => relative.split("/")[0])).sort(),
    ignore_sources: inventory.ignoreSources,
    candidate_sources: uniqueCandidateSources.map((item) => item.source_ref),
    unsupported_constructs: unique(unsupportedConstructs),
    truncated: inventory.truncated ? "Yes" : "No",
    budget_exhausted: budgetExhausted ? "Yes" : "No",
    scan_segments: segments,
    completed_segment_ids: completedSegments,
    remaining_segment_ids: remainingSegments,
    inventory_digest: inventoryDigest,
    next_file_index: nextFileIndex,
    total_semantic_files: semanticFiles.length,
    resumed: resume.used ? "Yes" : "No",
    resume_from_state_digest: resume.used ? resume.resumeFromStateDigest : "N/A",
    resume_state_digest: resumeStateDigestFor({
      inventoryDigest,
      nextFileIndex,
      candidateSources: uniqueCandidateSources.map((item) => item.source_ref),
      unsupportedConstructs: unique(unsupportedConstructs),
    }),
  };
  const projection = {
    ...projectionBase,
    discovery_boundary_digest: digest(projectionBase),
  };
  return { projection, candidate_sources: uniqueCandidateSources };
}

export function challengerRequired(routing, taskImpact = "") {
  const reasons = new Set(routing?.reason_codes || []);
  return taskImpact === "HIGH"
    || reasons.has("DOMAIN_COMPLETENESS_CLAIM")
    || reasons.has("DERIVED_OUTPUT_DEPENDENCY")
    || reasons.has("LIFECYCLE_BRANCH_OR_RECOVERY")
    || reasons.has("PATH_PROVENANCE_AMBIGUITY");
}

export function coverageScenarioIdentity(scenario) {
  const canonicalKey = {
    category_ids: sorted(scenario.category_ids),
    participant_ids: sorted(scenario.participant_ids),
    origin_ids: sorted(scenario.origin_ids),
    lifecycle_stage: scenario.lifecycle_stage,
    processing_path_ids: sorted(scenario.processing_path_ids),
    selection_point_ids: sorted(scenario.selection_point_ids),
    consistency_group_ids: sorted(scenario.consistency_group_ids),
    path_provenance: scenario.path_provenance,
    required_proof_strength: scenario.required_proof_strength,
    expected_behavior: normalizedText(scenario.expected_behavior),
    negative_or_reverse_behavior: normalizedText(scenario.negative_or_reverse_behavior),
  };
  const semantic = digest(canonicalKey);
  return {
    coverage_scenario_id: `coverage-scenario:${semantic.slice("sha256:".length, "sha256:".length + 24)}`,
    scenario_digest: semantic,
  };
}

export function businessUniverseChallengerDigest(value) {
  const { challenger_digest: _ignored, ...base } = value || {};
  return digest({
    ...base,
    reviewed_scenarios: [...(base.reviewed_scenarios || [])]
      .map((item) => ({
        coverage_scenario_id: String(item?.coverage_scenario_id || ""),
        scenario_digest: String(item?.scenario_digest || ""),
      }))
      .sort((left, right) => left.coverage_scenario_id.localeCompare(right.coverage_scenario_id)),
  });
}

export function validateBusinessUniverseChallenger(value, expected = {}) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, errors: ["Challenger evidence must be a structured object"] };
  }
  if (value.schema_version !== "1.108.0") errors.push("Challenger schema_version must be 1.108.0");
  if (value.artifact_type !== "business_universe_challenger") errors.push("Challenger artifact_type must be business_universe_challenger");
  if (value.task_ref !== expected.taskRef) errors.push("Challenger task_ref does not match the current Business Universe task");
  if (value.intent_digest !== expected.intentDigest) errors.push("Challenger intent_digest does not match the current Business Universe intent");
  if (value.discovery_boundary_digest !== expected.discoveryBoundaryDigest) errors.push("Challenger discovery boundary does not match the current Business Universe scan");
  if (!new Set(["ISOLATED_READ_ONLY_REVIEW", "PROJECT_NATIVE_READ_ONLY_REVIEW", "EXTERNAL_READ_ONLY_REVIEW"]).has(value.review_mode)) {
    errors.push("Challenger review_mode must identify a read-only review context");
  }
  if (!String(value.reviewer_ref || "").trim()) errors.push("Challenger reviewer_ref is required");
  if (!Array.isArray(value.checked_risks) || value.checked_risks.length === 0) errors.push("Challenger checked_risks must be non-empty");
  if (!Array.isArray(value.findings)) errors.push("Challenger findings must be an array");
  for (const finding of Array.isArray(value.findings) ? value.findings : []) {
    if (!finding || typeof finding !== "object"
      || !String(finding.finding_id || "").trim()
      || !String(finding.summary || "").trim()
      || !new Set(["RESOLVED", "NOT_APPLICABLE_WITH_EVIDENCE"]).has(finding.disposition)
      || !Array.isArray(finding.evidence_refs)
      || finding.evidence_refs.length === 0) {
      errors.push("Every Challenger finding must be resolved with exact evidence");
    }
  }
  const expectedRows = [...(expected.scenarios || [])]
    .map((item) => `${item.coverage_scenario_id}|${item.scenario_digest}`)
    .sort();
  const actualRows = Array.isArray(value.reviewed_scenarios)
    ? value.reviewed_scenarios.map((item) => `${item?.coverage_scenario_id || ""}|${item?.scenario_digest || ""}`).sort()
    : [];
  if (expectedRows.length === 0
    || actualRows.length !== new Set(actualRows).size
    || expectedRows.length !== actualRows.length
    || expectedRows.some((item, index) => item !== actualRows[index])) {
    errors.push("Challenger reviewed_scenarios must match every current coverage scenario and digest exactly once");
  }
  if (value.outcome !== "PASSED") errors.push("Challenger outcome must be PASSED");
  const boundaries = value.boundaries || {};
  for (const field of ["writes_target_files", "authorizes_implementation", "approves_completion", "replaces_unified_closure"]) {
    if (boundaries[field] !== "No") errors.push(`Challenger boundary ${field} must be No`);
  }
  if (value.challenger_digest !== businessUniverseChallengerDigest(value)) errors.push("Challenger digest does not match its current structured evidence");
  return { ok: errors.length === 0, errors };
}

export function resolveBoundBusinessUniverse(projectRoot, fromFile, consumerEvidence) {
  const binding = consumerEvidence?.business_universe_binding;
  if (!binding || binding.required !== "Yes") {
    return { required: false, binding: binding || null, file: "", relativePath: "", evidence: null, error: "" };
  }
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile || "", binding.business_universe_ref || binding.coverage_ref);
  if (!resolved.ok) return { required: true, binding, file: "", relativePath: "", evidence: null, error: resolved.error };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok || extracted.value?.artifact_type !== "business_universe_coverage") {
    return { required: true, binding, file: resolved.file, relativePath: resolved.relativePath, evidence: null, error: "Business Universe reference has no valid structured evidence" };
  }
  return { required: true, binding, file: resolved.file, relativePath: resolved.relativePath, evidence: extracted.value, error: "" };
}

export function universeScenarioProjection(universeEvidence) {
  return (universeEvidence?.coverage_scenarios || []).map((scenario) => ({
    coverage_scenario_id: scenario.coverage_scenario_id,
    scenario_digest: scenario.scenario_digest,
    category_ids: [...scenario.category_ids],
    lifecycle_stage: scenario.lifecycle_stage,
    path_provenance: scenario.path_provenance,
    required_proof_strength: scenario.required_proof_strength,
  }));
}

export function coverageVerificationProjection(universeEvidence, scenario, platformProfiles = [], pathKind = "expected") {
  const locatorById = new Map((universeEvidence?.evidence_locators || []).map((item) => [item.locator_id, item]));
  const sourcePaths = (scenario?.source_locator_refs || [])
    .map((locatorId) => locatorById.get(locatorId)?.source_ref || "")
    .filter(Boolean)
    .map((value) => value.toLowerCase());
  const profiles = new Set((platformProfiles || []).map((value) => String(value).toLowerCase()));
  const sourceText = sourcePaths.join("\n");
  const surface = coverageVerificationSurface(sourceText, profiles);
  const proofStrength = scenario?.required_proof_strength || "STRUCTURAL_SOURCE_PROOF";
  return {
    source_surface: surface,
    verification_type: coverageVerificationType(surface, proofStrength, pathKind),
    source_paths: sourcePaths,
  };
}

export function compactUniverseBinding(universeEvidence, ref = "N/A") {
  if (!universeEvidence) {
    return {
      required: "No",
      business_universe_ref: "N/A",
      business_universe_digest: "N/A",
      business_universe_state: "NOT_REQUIRED_WITH_REASON",
      coverage_scenario_ids: [],
      coverage_mapping_status: "NOT_REQUIRED",
    };
  }
  return {
    required: "Yes",
    business_universe_ref: ref,
    business_universe_digest: universeEvidence.coverage_digest,
    business_universe_state: universeEvidence.outcome,
    coverage_scenario_ids: (universeEvidence.coverage_scenarios || []).map((item) => item.coverage_scenario_id),
    coverage_mapping_status: universeEvidence.outcome === "COVERAGE_READY" ? "COMPLETE" : "BLOCKED",
  };
}

function coverageVerificationSurface(sourceText, profiles) {
  const hasProfile = (...values) => values.some((value) => profiles.has(value));
  if (/\bcloudfunctions?\b|\/cloudfunctions?\//.test(sourceText)) return "MINI_PROGRAM_CLOUD_FUNCTION";
  if (/\b(?:worker|workers|jobs?|queues?|cron|pipelines?|scheduled|imports?)\b|\/(?:worker|workers|jobs?|queues?|cron|pipelines?|scheduled|imports?)\//.test(sourceText)) {
    return "WORKER_OR_DATA_PATH";
  }
  if (/\b(?:offline|local-storage|local_storage|cache|persistence)\b|\/(?:storage|cache|offline)\//.test(sourceText)) {
    return "LOCAL_STORAGE_OR_OFFLINE";
  }
  if (/\.swift\b|\.xcodeproj\b|\/sources\//.test(sourceText) || hasProfile("ios", "ios-app")) {
    return "IOS_LOCAL_BEHAVIOR";
  }
  if (/\.(?:kt|kts)\b|\/(?:android|app\/src\/main)\//.test(sourceText) || hasProfile("android", "android-app")) {
    return "ANDROID_LOCAL_BEHAVIOR";
  }
  if (/\.(?:wxml|wxss)\b|\bproject\.config\.json\b|(?:^|\/)miniprogram\//.test(sourceText)
    || hasProfile("mini-program", "miniprogram", "wechat-miniprogram")) {
    return "MINI_PROGRAM_BEHAVIOR";
  }
  if (/\/(?:admin|backoffice|operator)\//.test(sourceText) || hasProfile("internal-admin")) {
    return "INTERNAL_ADMIN_WORKFLOW";
  }
  if (/\/(?:api|server|services?|controllers?|handlers?)\//.test(sourceText)
    || hasProfile("backend", "backend-api")) {
    return "API_OR_SERVICE_BEHAVIOR";
  }
  if (/\.(?:tsx|jsx|vue|svelte)\b|\/(?:web|frontend|pages|components)\//.test(sourceText)
    || hasProfile("web", "web-app")) {
    return "WEB_CLIENT_BEHAVIOR";
  }
  return "PROJECT_NATIVE_BEHAVIOR";
}

function coverageVerificationType(surface, proofStrength, pathKind) {
  if (proofStrength === "EXTERNAL_FACT_PROOF") return "MANUAL_VERIFICATION_REQUIRED";
  if (proofStrength === "STRUCTURAL_SOURCE_PROOF") return "INTEGRATION_CONTRACT_CHECK";
  if (surface === "API_OR_SERVICE_BEHAVIOR") {
    return pathKind === "negative-or-reverse" ? "API_NEGATIVE_TEST" : "BACKEND_RULE_TEST";
  }
  if (["WEB_CLIENT_BEHAVIOR", "MINI_PROGRAM_BEHAVIOR", "INTERNAL_ADMIN_WORKFLOW"].includes(surface)) {
    return "UI_INTERACTION_TEST";
  }
  if (["IOS_LOCAL_BEHAVIOR", "ANDROID_LOCAL_BEHAVIOR", "PROJECT_NATIVE_BEHAVIOR"].includes(surface)) {
    return "UNIT_BEHAVIOR_TEST";
  }
  return "INTEGRATION_CONTRACT_CHECK";
}

function structuralRelationshipsFromIntent(intent) {
  const text = String(intent || "").trim();
  const rows = [];
  const explicitList = extractExplicitList(text);
  for (const [reasonCode, patterns] of Object.entries(structuralPatterns)) {
    const match = patterns.find((pattern) => pattern.test(text));
    if (!match) continue;
    const hasRelationship = intentRelationshipIsBound(reasonCode, text, explicitList);
    rows.push(relationship(reasonCode, hasRelationship ? "EVIDENCE_BOUND" : "CANDIDATE", [], `intent:${normalizedText(text)}`));
  }
  if (explicitList.length >= 2 && hasSharedBehaviorRelation(text)) {
    rows.push(relationship("MULTI_CLASS_OR_ORIGIN", "EVIDENCE_BOUND", [], `intent-list:${explicitList.join("|")}`));
  }
  return rows;
}

function structuralRelationshipsFromProject(intent, discovery) {
  const groups = new Map();
  for (const candidate of discovery.candidate_sources) {
    for (const reasonCode of candidate.reason_codes) {
      const values = groups.get(reasonCode) || [];
      values.push(candidate);
      groups.set(reasonCode, values);
    }
  }
  const rows = [];
  for (const [reasonCode, candidates] of groups) {
    const bound = candidates.filter((item) => item.intent_overlap === "Yes");
    const enough = reasonCode === "MULTI_CLASS_OR_ORIGIN" ? bound.length >= 2 : bound.length >= 1;
    rows.push(relationship(
      reasonCode,
      enough ? "EVIDENCE_BOUND" : "CANDIDATE",
      candidates.flatMap((item) => item.evidence_locator_refs),
      `project:${candidates.map((item) => item.source_ref).join("|")}`,
    ));
  }
  return rows;
}

function relationship(reasonCode, state, refs, identity) {
  return {
    relationship_id: `relationship:${digest(`${reasonCode}|${identity}`).slice(7, 31)}`,
    reason_code: reasonCode,
    evidence_state: state,
    evidence_locator_refs: unique(refs),
    summary: relationshipSummary(reasonCode),
  };
}

function relationshipSummary(reasonCode) {
  const summaries = {
    MULTI_CLASS_OR_ORIGIN: "Multiple task-relevant classes or origins share one behavior.",
    DERIVED_OUTPUT_DEPENDENCY: "A derived result depends on multiple contributors.",
    SELECTIVE_INCLUSION_OR_FANOUT: "Selection or fan-out can include, exclude, or divert task-relevant behavior.",
    LIFECYCLE_BRANCH_OR_RECOVERY: "The behavior has a non-forward lifecycle, failure, recovery, or termination branch.",
    PATH_PROVENANCE_AMBIGUITY: "Project-runtime behavior cannot yet be distinguished from fixture, mock, seed, or manual paths.",
    DOMAIN_COMPLETENESS_CLAIM: "The request makes a completeness claim about a task-relevant business subject.",
    EXISTING_PROJECT_CLOSURE_AUDIT: "The request audits end-to-end business closure in an existing project.",
  };
  return summaries[reasonCode] || "High impact strengthens an evidenced omission risk.";
}

function classifyTaskKind({ intent, taskKind, discovery }) {
  const explicit = String(taskKind || "unknown");
  const text = String(intent || "");
  const nonBehavioral = new Set(["docs_only", "test_docs_only", "copy", "visual_only"]);
  const ambiguousKinds = new Set(["unknown", "config_behavior", "release_behavior", "migration_behavior"]);
  const projectBehaviorCandidate = discovery.candidate_sources.some((item) => item.intent_overlap === "Yes");
  if (nonBehavioral.has(explicit) && isBoundedNonBehavioralIntent(text)) {
    return {
      classification: "NON_BEHAVIORAL",
      confidence: "HIGH",
      declared_task_kind: explicit,
      evidence_refs: [],
      reason: "The task kind and bounded project read show no changed runtime, contract, authorization, state, side-effect, audit, or verification-authority behavior.",
    };
  }
  return {
    classification: explicit === "code_behavior" || projectBehaviorCandidate ? "BEHAVIORAL" : "AMBIGUOUS",
    confidence: explicit === "code_behavior" ? "HIGH" : ambiguousKinds.has(explicit) ? "LOW" : "MEDIUM",
    declared_task_kind: explicit,
    evidence_refs: unique(discovery.candidate_sources.filter((item) => item.intent_overlap === "Yes").map((item) => item.source_ref)),
    reason: projectBehaviorCandidate
      ? "Current project evidence may participate in the requested behavior."
      : "Technical inspection is required before treating this task as behaviorally bounded.",
  };
}

function sourceCandidate(root, relativePath, text, intent) {
  const excerpt = firstSemanticExcerpt(text);
  if (!excerpt) return null;
  const intentTokens = domainTokens(intent);
  const lower = text.toLowerCase();
  const overlapCount = intentTokens.filter((token) => lower.includes(token.toLowerCase())).length;
  const overlap = overlapCount >= Math.min(2, intentTokens.length) && intentTokens.length > 0;
  const reasonCodes = [];
  for (const [reasonCode, patterns] of Object.entries(structuralPatterns)) {
    if (patterns.some((pattern) => pattern.test(excerpt.text))) reasonCodes.push(reasonCode);
  }
  const provenance = provenanceFor(relativePath, text);
  if (provenance !== "PROJECT_RUNTIME_PATH" && overlap) reasonCodes.push("PATH_PROVENANCE_AMBIGUITY");
  if (!overlap && reasonCodes.length === 0) return null;
  const sourceRef = `file:${portable(relativePath)}`;
  const locatorId = `locator:${digest(`${sourceRef}|${excerpt.start}|${excerpt.text}`).slice(7, 31)}`;
  return {
    source_ref: sourceRef,
    raw_file_digest: canonicalFileDigest(path.join(root, relativePath)),
    intent_overlap: overlap ? "Yes" : "No",
    reason_codes: unique(reasonCodes),
    path_provenance: provenance,
    evidence_locator_refs: [locatorId],
    locator: {
      locator_id: locatorId,
      source_ref: sourceRef,
      authority_binding_ref: sourceRef,
      locator_kind: "LINE_RANGE",
      locator: `L${excerpt.start}-L${excerpt.end}`,
      evidence_kind: "PROJECT_SOURCE",
      relation: "CANDIDATE_STRUCTURAL_EVIDENCE",
      semantic_digest: digest(normalizedText(excerpt.text)),
    },
  };
}

function projectFileInventory(root, maxFiles) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    return { files: [], truncated: true, segments: [], inspectedRoots: [], ignoreSources: [] };
  }
  const git = spawnSync("git", ["-C", root, "ls-files", "-co", "--exclude-standard", "-z"], {
    encoding: null,
    maxBuffer: 64 * 1024 * 1024,
  });
  let files;
  const ignoreSources = [];
  if (git.status === 0) {
    files = git.stdout.toString("utf8").split("\0").filter(Boolean).map(portable).sort();
    ignoreSources.push("git:exclude-standard");
  } else {
    files = recursiveInventory(root, maxFiles * 2);
    ignoreSources.push("intentos:default-ignore-set");
  }
  files = filterIntentOSManagedPaths(root, files)
    .filter((relative) => !isIgnoredPath(relative))
    .sort();
  const truncated = files.length > maxFiles;
  const selected = files.slice(0, maxFiles);
  return {
    files: selected,
    truncated,
    ignoreSources,
  };
}

function prepareDiscoveryResume(root, semanticFiles, inventoryDigest, intent, resumeFrom) {
  if (!resumeFrom) {
    return {
      used: false,
      nextFileIndex: 0,
      candidateSources: [],
      unsupportedConstructs: [],
      resumeFromStateDigest: "N/A",
    };
  }
  const projection = resumeFrom.projection || resumeFrom.discovery_projection || resumeFrom;
  if (projection.inventory_digest !== inventoryDigest) {
    throw new Error("Business Universe resume inventory does not match the current project boundary");
  }
  if (!Number.isInteger(projection.next_file_index)
    || projection.next_file_index < 0
    || projection.next_file_index > semanticFiles.length) {
    throw new Error("Business Universe resume cursor is invalid for the current project boundary");
  }
  const expectedResumeDigest = resumeStateDigestFor({
    inventoryDigest: projection.inventory_digest,
    nextFileIndex: projection.next_file_index,
    candidateSources: projection.candidate_sources || [],
    unsupportedConstructs: projection.unsupported_constructs || [],
  });
  if (projection.resume_state_digest !== expectedResumeDigest) {
    throw new Error("Business Universe resume state digest is invalid");
  }
  const candidateSources = [];
  for (const ref of projection.candidate_sources || []) {
    if (!String(ref).startsWith("file:")) throw new Error("Business Universe resume candidate must be project-local file evidence");
    const relativePath = portable(String(ref).slice("file:".length));
    if (!semanticFiles.slice(0, projection.next_file_index).includes(relativePath)) {
      throw new Error(`Business Universe resume candidate is outside the completed scan prefix: ${relativePath}`);
    }
    const file = path.join(root, relativePath);
    const text = readText(file);
    const candidate = text === null ? null : sourceCandidate(root, relativePath, text, intent);
    if (!candidate) throw new Error(`Business Universe resume candidate is stale: ${relativePath}`);
    candidateSources.push(candidate);
  }
  return {
    used: true,
    nextFileIndex: projection.next_file_index,
    candidateSources,
    unsupportedConstructs: [...(projection.unsupported_constructs || [])],
    resumeFromStateDigest: projection.resume_state_digest,
  };
}

function discoverySegments(semanticFiles, nextFileIndex, inventoryTruncated) {
  const rows = new Map();
  semanticFiles.forEach((relative, index) => {
    const [root = "."] = relative.split("/");
    const segmentId = `segment:${root}`;
    const row = rows.get(segmentId) || { segment_id: segmentId, root, status: "PARTIAL", file_count: 0, inspected: 0 };
    row.file_count += 1;
    if (index < nextFileIndex) row.inspected += 1;
    rows.set(segmentId, row);
  });
  const segments = [...rows.values()].map(({ inspected, ...row }) => ({
    ...row,
    status: inspected === row.file_count ? "COMPLETE" : "PARTIAL",
  }));
  if (inventoryTruncated) {
    segments.push({ segment_id: "segment:inventory-remainder", root: "inventory-remainder", status: "PARTIAL", file_count: 0 });
  }
  return segments.sort((a, b) => a.segment_id.localeCompare(b.segment_id));
}

function resumeStateDigestFor({ inventoryDigest, nextFileIndex, candidateSources, unsupportedConstructs }) {
  return digest({
    inventory_digest: inventoryDigest,
    next_file_index: nextFileIndex,
    candidate_sources: [...candidateSources].sort(),
    unsupported_constructs: [...unsupportedConstructs].sort(),
  });
}

function uniqueCandidates(rows) {
  return [...new Map(rows.map((item) => [item.source_ref, item])).values()]
    .sort((a, b) => a.source_ref.localeCompare(b.source_ref));
}

function recursiveInventory(root, maxEntries) {
  const rows = [];
  const stack = [""];
  while (stack.length > 0 && rows.length < maxEntries) {
    const relativeDir = stack.pop();
    const full = path.join(root, relativeDir);
    let entries;
    try {
      entries = fs.readdirSync(full, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (generatedDirectories.has(entry.name)) continue;
      const relative = portable(path.join(relativeDir, entry.name));
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) stack.push(relative);
      else if (entry.isFile()) rows.push(relative);
      if (rows.length >= maxEntries) break;
    }
  }
  return rows.sort();
}

function isSemanticCandidate(relative) {
  const normalized = portable(relative);
  const base = path.posix.basename(normalized);
  return sourceExtensions.has(path.posix.extname(base).toLowerCase())
    || semanticDocumentNames.has(base.toLowerCase());
}

function isIgnoredPath(relative) {
  const parts = portable(relative).split("/");
  return parts.some((part) => generatedDirectories.has(part))
    || /(?:^|\/)(?:docs\/plans|examples|test-fixtures|fixtures\/generated)(?:\/|$)/.test(portable(relative));
}

function provenanceFor(relativePath, text) {
  const value = `${portable(relativePath)}\n${text.slice(0, 2000)}`;
  if (/(?:^|\/)(?:fixtures?|seeds?)(?:\/|\.)|\b(?:fixture|seed)\b/i.test(value)) return "FIXTURE_OR_SEED_PATH";
  if (/(?:^|\/)(?:mocks?|stubs?)(?:\/|\.)|\b(?:mock|stub)\b/i.test(value)) return "MOCK_OR_STUB_PATH";
  if (/\b(?:webhook|external provider|third[- ]party|remote service)\b/i.test(value)) return "EXTERNAL_SYSTEM_PATH";
  if (/\b(?:cron|scheduler|worker|queue consumer|background job)\b/i.test(value)) return "PROJECT_NATIVE_AUTOMATION";
  if (/\bmanual(?:ly)?\b|手工|人工/.test(value)) return "MANUAL_ONLY_PATH";
  return "PROJECT_RUNTIME_PATH";
}

function firstSemanticExcerpt(text) {
  const lines = String(text || "").split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || /^\s*(?:\/\/|#|\*)?\s*(?:import|include|package)\b/.test(line)) continue;
    if (/\b(?:class|struct|enum|interface|type|schema|model|route|handler|controller|service|workflow|state|event|command|validate|filter|retry|recover|compensat|audit)\w*\b/i.test(line)
      || /(?:规则|状态|流程|事件|校验|筛选|重试|恢复|补偿|审计)/.test(line)) {
      return { start: index + 1, end: index + 1, text: line.slice(0, 800) };
    }
  }
  return null;
}

function adapterKindFor(files) {
  const extensions = new Set(files.map((item) => path.posix.extname(item).toLowerCase()));
  if (extensions.has(".swift")) return "SWIFT_PROJECT";
  if (extensions.has(".kt") || extensions.has(".kts")) return "JVM_OR_ANDROID_PROJECT";
  if (extensions.has(".go")) return "GO_PROJECT";
  if (extensions.has(".py")) return "PYTHON_PROJECT";
  if ([".js", ".jsx", ".ts", ".tsx", ".vue"].some((ext) => extensions.has(ext))) return "JS_TS_PROJECT";
  return "GENERIC_SOURCE_PROJECT";
}

function extractExplicitList(text) {
  const normalized = String(text || "");
  const sharedBehaviorBoundary = normalized.match(/^(.{2,120}?)(?=(?:使用|适用|遵循|执行|进入|汇入|共同|统一|共享|\b(?:share|follow|use|apply|feed|contribute|produce|enter)\b))/iu)?.[1];
  const candidate = sharedBehaviorBoundary || normalized.match(/([\p{L}\p{N}_-]{2,24}(?:\s*[,、]\s*[\p{L}\p{N}_-]{2,24})+)(?:\s*(?:and|or|以及|和|与)\s*[\p{L}\p{N}_-]{2,24})?/u)?.[0];
  if (!candidate) return [];
  return unique(candidate.split(/\s*(?:,|、|\band\b|\bor\b|以及|和|与)\s*/iu)
    .map(normalizedText)
    .filter((item) => item.length >= 2 && item.length <= 32));
}

function hasSharedBehaviorRelation(text) {
  return /\b(?:share|follow|use|apply|feed|contribute|produce|enter|route|handle)\w*\b/i.test(text)
    || /(?:共同|统一|使用同一|适用|进入|遵循|汇入|贡献|产生|处理|分流)/.test(text);
}

function intentRelationshipIsBound(reasonCode, text, explicitList) {
  if (reasonCode === "MULTI_CLASS_OR_ORIGIN") return explicitList.length >= 2 && hasSharedBehaviorRelation(text);
  if (reasonCode === "DERIVED_OUTPUT_DEPENDENCY") return explicitList.length >= 2;
  if (reasonCode === "SELECTIVE_INCLUSION_OR_FANOUT") return explicitList.length >= 2;
  if (reasonCode === "LIFECYCLE_BRANCH_OR_RECOVERY") {
    const branchMatches = String(text || "").match(/\b(?:correct|amend|retry|recover|fail|terminate|reverse|compensat|cancel)\w*\b|(?:修正|更正|重试|恢复|失败|终止|撤销|冲正|补偿)/gi) || [];
    return branchMatches.length >= 2 && /\b(?:then|later|after|when|or)\b|(?:之后|随后|失败时|或者|并且)/i.test(text);
  }
  if (reasonCode === "PATH_PROVENANCE_AMBIGUITY") {
    return /\b(?:fixture|seed|mock|stub|manual)\b|(?:样例|种子|模拟|桩|手工)/i.test(text)
      && /\b(?:runtime|real|actual|automatic|project)\b|(?:真实路径|运行路径|自动生成|项目路径)/i.test(text);
  }
  if (reasonCode === "EXISTING_PROJECT_CLOSURE_AUDIT") return true;
  return false;
}

function domainTokens(text) {
  const stop = new Set([
    "about", "after", "all", "change", "current", "ensure", "every", "from", "into",
    "make", "must", "project", "should", "that", "the", "this", "update", "with",
  ]);
  const latin = String(text || "").toLowerCase().match(/[a-z][a-z0-9_-]{3,}/g) || [];
  const han = String(text || "").match(/[\p{Script=Han}]{2,12}/gu) || [];
  return unique([...latin.filter((item) => !stop.has(item)), ...han]).slice(0, 32);
}

function isBoundedNonBehavioralIntent(text) {
  return /(?:readme|markdown|文档|文案|错别字|排版|颜色|间距|label|copy|typo|format|style)/i.test(text)
    && !/(?:runtime|api|schema|permission|state|workflow|validation|audit|test authority|运行|接口|数据结构|权限|状态|流程|校验|审计|测试权威)/i.test(text);
}

function mergeRelationships(rows) {
  const byReason = new Map();
  for (const row of rows) {
    const current = byReason.get(row.reason_code);
    if (!current) {
      byReason.set(row.reason_code, row);
      continue;
    }
    byReason.set(row.reason_code, {
      ...current,
      evidence_state: [current.evidence_state, row.evidence_state].includes("EVIDENCE_BOUND") ? "EVIDENCE_BOUND" : "CANDIDATE",
      evidence_locator_refs: unique([...current.evidence_locator_refs, ...row.evidence_locator_refs]),
    });
  }
  return BUSINESS_UNIVERSE_REASON_CODES.filter((code) => byReason.has(code)).map((code) => byReason.get(code));
}

function inspectionRouting(preflight, reason) {
  return {
    required: "Unknown",
    routing_result: "TECHNICAL_INSPECTION_REQUIRED",
    reason_codes: unique(preflight.structural_relationships.map((item) => item.reason_code)),
    relationship_ids: preflight.structural_relationships.map((item) => item.relationship_id),
    trigger_evidence_locator_refs: unique(preflight.structural_relationships.flatMap((item) => item.evidence_locator_refs)),
    preflight,
    not_required_reason: "",
    technical_inspection_reason: reason,
    technical_terms_required_from_user: "No",
  };
}

function notRequiredRouting(preflight, reason) {
  return {
    required: "No",
    routing_result: "NOT_REQUIRED_WITH_REASON",
    reason_codes: [],
    relationship_ids: [],
    trigger_evidence_locator_refs: [],
    preflight,
    not_required_reason: reason,
    technical_inspection_reason: "",
    technical_terms_required_from_user: "No",
  };
}

function readText(file) {
  try {
    const buffer = fs.readFileSync(file);
    if (buffer.includes(0)) return null;
    return buffer.toString("utf8");
  } catch {
    return null;
  }
}

function normalizedText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function digest(value) {
  const text = typeof value === "string" ? value : JSON.stringify(canonicalize(value));
  return `sha256:${crypto.createHash("sha256").update(text).digest("hex")}`;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function sorted(values) {
  return [...new Set((values || []).filter(Boolean))].sort();
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function portable(value) {
  return String(value || "").split(path.sep).join("/").replace(/^\.\//, "");
}
