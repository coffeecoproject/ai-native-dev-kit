import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { canonicalFileDigest, projectIdentity, resolveAuthoritativeEvidenceReference } from "./evidence-authority.mjs";
import { loadSchema, validateEvidenceBlock } from "./artifact-schema.mjs";
import { validateReleaseTopologySource } from "./release-topology-consumer.mjs";

export const MIGRATION_STAGES = [
  "DISCOVERY", "PLAN", "APPLY_REVIEW", "REHEARSAL", "CUTOVER_READINESS",
  "CUTOVER_REVIEW", "POST_CUTOVER_PROOF", "RETIREMENT_REVIEW",
];

export function migrationDigest(value) {
  const copy = structuredClone(value);
  delete copy.migration_digest;
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(sortObject(copy))).digest("hex")}`;
}

export function candidateDigest(value) {
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(sortObject(value))).digest("hex")}`;
}

export function buildReleaseTopologyMigration(projectRoot, options = {}) {
  const intent = String(options.intent || "prepare a safe release topology migration").trim();
  const stage = MIGRATION_STAGES.includes(options.stage) ? options.stage : "PLAN";
  const topologyRef = normalizeRef(options.topologyRef || latestTopologyRef(projectRoot));
  const topologySource = sourceFromRef(projectRoot, "", topologyRef);
  const checked = validateReleaseTopologySource(projectRoot, "", topologySource, {
    requireReady: stage !== "DISCOVERY",
  });
  if (!checked.ok) throw new Error(`Current Release Execution Topology is not valid: ${checked.errors.join("; ")}`);
  const current = checked.evidence;
  const candidate = {
    candidate_id: String(options.targetCandidateId || `candidate:${current.recommendation.state.toLowerCase()}`),
    summary: String(options.targetSummary || current.recommendation.plain_summary),
    capability_state: current.outcome === "RELEASE_TOPOLOGY_RECORDED" ? "COMPLETE" : "INCOMPLETE",
  };
  candidate.candidate_digest = candidateDigest(candidate);
  const value = {
    schema_version: "1.107.0",
    artifact_type: "release_topology_migration",
    migration_ref: String(options.migrationRef || "release-topology-migrations/generated.md"),
    migration_digest: "sha256:" + "0".repeat(64),
    intent,
    intent_digest: textDigest(intent),
    project_identity: projectIdentity(projectRoot),
    stage,
    current_topology: {
      ref: topologySource.ref,
      digest: topologySource.digest,
      topology_digest: current.topology_digest,
    },
    target_topology: candidate,
    dependency_map: Object.entries(current.planes).map(([plane, item]) => ({
      plane,
      current_identity_ref: item.identity_ref,
      target_identity_ref: stage === "DISCOVERY" ? "not_selected" : item.identity_ref,
      change_kind: stage === "DISCOVERY" ? "UNKNOWN" : "KEEP",
      evidence_ref: item.evidence_ref,
    })),
    apply_chain: refs(options, ["planReview", "applyPlan", "approval", "readiness", "receipt", "rollback"]),
    rehearsal: {
      status: "NOT_STARTED", environment: "N/A",
      runtime_plan: ref(options.runtimePlanRef, options.runtimePlanDigest),
      run_manifest: ref(options.runManifestRef, options.runManifestDigest),
      package_identity: ref(options.packageIdentityRef, options.packageIdentityDigest),
      duplicate_production_effect: "Unknown",
      cleanup_proof: ref(options.cleanupProofRef, options.cleanupProofDigest),
    },
    cutover: {
      readiness_status: "NOT_READY",
      consent: ref(options.cutoverConsentRef, options.cutoverConsentDigest),
      release_consent: ref(options.releaseConsentRef, options.releaseConsentDigest),
      rollback_ref: String(options.rollbackRef || "N/A"),
      external_effect: String(options.externalEffect || "N/A"),
    },
    post_cutover: {
      status: "NOT_STARTED",
      target_active_proof: ref(options.targetActiveProofRef, options.targetActiveProofDigest),
      old_backend_nonpublish_proof: ref(options.oldBackendProofRef, options.oldBackendProofDigest),
      source_package_binding: ref(options.sourcePackageBindingRef, options.sourcePackageBindingDigest),
    },
    retirement: {
      status: "NOT_STARTED",
      authority: ref(options.retirementAuthorityRef, options.retirementAuthorityDigest),
      fallback_evidence: ref(options.fallbackEvidenceRef, options.fallbackEvidenceDigest),
      historical_evidence_preserved: "Unknown",
    },
    recommendation: recommendation(stage, current),
    boundaries: {
      writes_project_files: "No", approves_apply: "No", executes_rehearsal: "No",
      approves_cutover: "No", executes_cutover: "No", approves_release: "No",
      retires_legacy_backend: "No", moves_secrets: "No",
      treats_embedded_consent_as_authority: "No",
    },
    outcome: stage === "DISCOVERY" ? "MIGRATION_DISCOVERED" : "MIGRATION_PLAN_READY",
  };
  value.migration_digest = migrationDigest(value);
  return value;
}

export function migrationSemanticErrors(projectRoot, fromFile, value, options = {}) {
  const errors = [];
  if (migrationDigest(value) !== value.migration_digest) errors.push("migration canonical digest mismatch");
  if (JSON.stringify(value.project_identity) !== JSON.stringify(projectIdentity(projectRoot))) errors.push("migration project identity is stale, copied, or belongs to another project");
  const topology = validateReleaseTopologySource(projectRoot, fromFile, {
    ref: value.current_topology?.ref,
    digest: value.current_topology?.digest,
  }, {
    requireReady: value.stage !== "DISCOVERY",
    expectedSourceRevision: value.project_identity?.revision,
  });
  if (!topology.ok) errors.push(...topology.errors.map((item) => `current topology: ${item}`));
  if (topology.evidence && topology.evidence.topology_digest !== value.current_topology?.topology_digest) errors.push("current topology canonical identity mismatch");
  if (candidateDigest({
    candidate_id: value.target_topology?.candidate_id,
    summary: value.target_topology?.summary,
    capability_state: value.target_topology?.capability_state,
  }) !== value.target_topology?.candidate_digest) errors.push("target topology candidate digest mismatch");
  if (new Set((value.dependency_map || []).map((item) => item.plane)).size !== 6) errors.push("dependency map must cover all six release topology planes exactly once");
  const stageIndex = MIGRATION_STAGES.indexOf(value.stage);
  if (stageIndex < 0) errors.push("unknown migration stage");
  if (stageIndex >= MIGRATION_STAGES.indexOf("APPLY_REVIEW")) {
    for (const key of ["plan_review", "apply_plan", "approval", "readiness", "rollback"]) validateRef(projectRoot, fromFile, value.apply_chain?.[key], `apply_chain.${key}`, errors);
  }
  if (stageIndex >= MIGRATION_STAGES.indexOf("REHEARSAL")) {
    validateRef(projectRoot, fromFile, value.apply_chain?.receipt, "apply_chain.receipt", errors);
    if (value.rehearsal?.environment !== "NON_PRODUCTION") errors.push("rehearsal must use a non-production environment");
    if (value.rehearsal?.status !== "PASSED") errors.push("rehearsal stage requires passed rehearsal evidence");
    if (value.rehearsal?.duplicate_production_effect !== "No") errors.push("rehearsal must prove no duplicate production effect");
    for (const key of ["runtime_plan", "run_manifest", "package_identity", "cleanup_proof"]) validateRef(projectRoot, fromFile, value.rehearsal?.[key], `rehearsal.${key}`, errors);
  }
  if (stageIndex >= MIGRATION_STAGES.indexOf("CUTOVER_READINESS")) {
    if (value.cutover?.readiness_status !== "READY_FOR_REVIEW") errors.push("cutover readiness must be independently ready for review");
    if (!value.cutover?.rollback_ref || value.cutover.rollback_ref === "N/A") errors.push("cutover readiness requires a current rollback reference");
  }
  if (stageIndex >= MIGRATION_STAGES.indexOf("CUTOVER_REVIEW")) {
    validateRef(projectRoot, fromFile, value.cutover?.consent, "cutover.consent", errors);
    if (!value.cutover?.external_effect || value.cutover.external_effect === "N/A") errors.push("cutover review requires one exact prepared external effect");
    if (value.recommendation?.user_input_class !== "REAL_WORLD_CONSENT_NEEDED") errors.push("cutover review must expose only exact real-world consent");
  }
  if (stageIndex >= MIGRATION_STAGES.indexOf("POST_CUTOVER_PROOF")) {
    if (value.post_cutover?.status !== "OBSERVED") errors.push("post-cutover stage requires observed proof");
    for (const key of ["target_active_proof", "old_backend_nonpublish_proof", "source_package_binding"]) validateRef(projectRoot, fromFile, value.post_cutover?.[key], `post_cutover.${key}`, errors);
  }
  if (stageIndex >= MIGRATION_STAGES.indexOf("RETIREMENT_REVIEW")) {
    validateRef(projectRoot, fromFile, value.retirement?.authority, "retirement.authority", errors);
    validateRef(projectRoot, fromFile, value.retirement?.fallback_evidence, "retirement.fallback_evidence", errors);
    if (value.retirement?.historical_evidence_preserved !== "Yes") errors.push("retirement must preserve historical evidence");
  }
  if (!new Set(["NO_USER_ACTION", "BUSINESS_FACT_NEEDED", "REAL_WORLD_CONSENT_NEEDED", "EXTERNAL_FACT_NEEDED"]).has(value.recommendation?.user_input_class)) errors.push("technical choice was delegated to the user");
  if (Object.values(value.boundaries || {}).some((item) => item !== "No")) errors.push("migration report must remain read-only and non-authorizing");
  if (options.requireReady && value.outcome === "MIGRATION_BLOCKED") errors.push("migration report is blocked");
  return errors;
}

export function validateMigrationFile(projectRoot, file, options = {}) {
  const schema = loadSchema(projectRoot, "schemas/artifacts/release-topology-migration.schema.json");
  const checked = validateEvidenceBlock(fs.readFileSync(file, "utf8"), schema, path.relative(projectRoot, file), {
    require: true, digestField: "migration_digest",
  });
  if (!checked.ok) return { ok: false, errors: checked.errors, value: null };
  const errors = migrationSemanticErrors(projectRoot, file, checked.value, options);
  return { ok: errors.length === 0, errors, value: checked.value };
}

function recommendation(stage, topology) {
  if (stage === "DISCOVERY") return { state: "NEEDS_PROJECT_FACT_DISCOVERY", plain_summary: "IntentOS is verifying the current release path before recommending a change.", user_input_class: "NO_USER_ACTION", next_step: "Complete read-only topology discovery." };
  const keep = topology.recommendation.state === "KEEP_CURRENT_TOPOLOGY";
  return { state: keep ? "KEEP_CURRENT_TOPOLOGY" : "PREPARE_BOUNDED_PLAN", plain_summary: keep ? "The current release path remains the safest technically valid choice." : "IntentOS prepared one bounded technical migration path for internal review.", user_input_class: "NO_USER_ACTION", next_step: keep ? "Keep the current topology and monitor its evidence." : "Prepare Plan Review and controlled apply evidence without production effects." };
}
function refs(options, names) {
  return Object.fromEntries(names.map((name) => [name.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`), ref(options[`${name}Ref`], options[`${name}Digest`])]));
}
function ref(value, digest) { return { ref: String(value || "N/A"), digest: String(digest || "N/A") }; }
function normalizeRef(value) { return /^(artifact|file):/.test(value) ? value : `artifact:${value}`; }
function latestTopologyRef(projectRoot) {
  const dir = path.join(projectRoot, "release-execution-topologies");
  if (!fs.existsSync(dir)) throw new Error("No Release Execution Topology report exists");
  const names = fs.readdirSync(dir).filter((name) => name.endsWith(".md")).sort();
  if (!names.length) throw new Error("No Release Execution Topology report exists");
  return `artifact:release-execution-topologies/${names.at(-1)}`;
}
function sourceFromRef(projectRoot, fromFile, value) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, value, { markdownOnly: true });
  if (!resolved.ok) throw new Error(`Topology reference is unsafe or unresolved: ${resolved.error}`);
  return { ref: value, digest: canonicalFileDigest(resolved.file) };
}
function validateRef(projectRoot, fromFile, source, label, errors) {
  if (!source?.ref || source.ref === "N/A" || !source.digest || source.digest === "N/A") return errors.push(`${label} requires an exact ref and digest`);
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, source.ref);
  if (!resolved.ok) return errors.push(`${label} is unsafe or unresolved: ${resolved.error}`);
  if (canonicalFileDigest(resolved.file) !== source.digest) errors.push(`${label} digest mismatch`);
}
function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortObject(value[key])]));
}
function textDigest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}
