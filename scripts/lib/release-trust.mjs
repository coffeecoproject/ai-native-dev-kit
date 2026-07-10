import fs from "node:fs";
import path from "node:path";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
} from "./artifact-schema.mjs";
import {
  canonicalFileDigest,
  projectIdentity,
  resolveAuthoritativeEvidenceReference,
} from "./evidence-authority.mjs";
import { sectionBody } from "./markdown.mjs";

export const REQUIRED_BLOCKED_RELEASE_ACTIONS = [
  "PRODUCTION_DEPLOY",
  "STORE_SUBMISSION",
  "MINI_PROGRAM_RELEASE",
  "PRODUCTION_MIGRATION",
  "SECRETS",
  "DNS",
  "PAYMENT",
  "PERMISSIONS",
  "PRODUCTION_CONFIG",
  "ROLLBACK_EXECUTION",
];

const productionLikeTargets = new Set(["production_review", "app_store_review", "mini_program_review"]);
const platformRecipeTargets = new Set(["app_store_review", "mini_program_review"]);

export function readReleaseApprovalRecord(projectRoot, reference, options = {}) {
  const root = path.resolve(projectRoot);
  const resolved = resolveAuthoritativeEvidenceReference(root, options.fromFile || "", normalizeArtifactRef(reference), { markdownOnly: true });
  if (!resolved.ok) return { ok: false, errors: [`release approval record is unsafe or unresolved: ${resolved.error}`], file: "", relativePath: "", evidence: null, resolvedSources: {} };
  const content = fs.readFileSync(resolved.file, "utf8");
  const schema = loadSchema(root, "schemas/artifacts/release-approval-record.schema.json");
  const checked = validateEvidenceBlock(content, schema, resolved.relativePath, {
    require: true,
    digestField: "release_approval_digest",
  });
  if (!checked.ok) return { ok: false, errors: checked.errors, file: resolved.file, relativePath: resolved.relativePath, evidence: checked.value || null, resolvedSources: {} };
  const validation = validateReleaseApprovalTrust(root, resolved.file, checked.value, options);
  return {
    ...validation,
    file: resolved.file,
    relativePath: resolved.relativePath,
    evidence: checked.value,
  };
}

export function validateReleaseApprovalTrust(projectRoot, approvalFile, evidence, options = {}) {
  const errors = [];
  const resolvedSources = {};
  const currentIdentity = projectIdentity(projectRoot);
  if (JSON.stringify(evidence.project_identity) !== JSON.stringify(currentIdentity)) {
    errors.push("project_identity does not match the current project or Git revision");
  }
  if (evidence.release_approval_digest !== evidenceDigest(evidence, ["release_approval_digest"])) {
    errors.push("release_approval_digest does not match current evidence");
  }

  const approval = evidence.human_approval || {};
  if (/\b(ai|codex|agent|automation|bot)\b/i.test(String(approval.approved_by || ""))) {
    errors.push("approved_by must identify a human release decision owner");
  }
  const approvedAt = Date.parse(String(approval.approved_at || ""));
  const expiresAt = Date.parse(String(approval.expires_at || ""));
  if (!Number.isFinite(approvedAt)) errors.push("approved_at must be a valid timestamp");
  if (!Number.isFinite(expiresAt)) errors.push("expires_at must be a valid timestamp");
  if (Number.isFinite(approvedAt) && approvedAt > Date.now() + 5 * 60 * 1000) errors.push("approved_at must not be in the future");
  if (Number.isFinite(approvedAt) && Number.isFinite(expiresAt) && expiresAt <= approvedAt) errors.push("expires_at must be later than approved_at");
  if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) errors.push("release approval is expired");
  if (options.requireApproved && approval.approval_status !== "APPROVED") errors.push("release approval status must be APPROVED");
  const expectedOutcome = {
    PENDING: "RELEASE_APPROVAL_PENDING",
    APPROVED: "RELEASE_APPROVAL_VALID",
    REJECTED: "RELEASE_APPROVAL_REJECTED",
    EXPIRED: "RELEASE_APPROVAL_EXPIRED",
    INVALIDATED: "RELEASE_APPROVAL_INVALIDATED",
  }[approval.approval_status];
  if (evidence.outcome !== expectedOutcome) errors.push("outcome does not match approval status");

  for (const action of REQUIRED_BLOCKED_RELEASE_ACTIONS) {
    if (!(evidence.blocked_actions || []).includes(action)) errors.push(`blocked_actions must include ${action}`);
  }
  if (!/^(human|team|role):[^\s]+$/i.test(String(evidence.release_controls?.release_owner_ref || ""))) {
    errors.push("release_owner_ref must identify a concrete human, team, or role owner");
  }

  const candidate = resolveBoundFile(projectRoot, approvalFile, evidence.release_candidate?.candidate_ref, evidence.release_candidate?.candidate_digest, "release candidate", errors);
  if (candidate) resolvedSources.releaseCandidate = candidate;
  if (evidence.release_candidate?.source_revision !== currentIdentity.revision) errors.push("release candidate source_revision does not match current project revision");
  if (productionLikeTargets.has(evidence.release_candidate?.release_target) && currentIdentity.kind !== "GIT") {
    errors.push("production-like release approval requires a Git project identity");
  }

  const sourcePairs = [
    ["releaseEvidence", evidence.trust_sources?.release_evidence_gate, "Release Evidence Gate"],
    ["runtimeHygiene", evidence.trust_sources?.runtime_hygiene, "Runtime Hygiene"],
    ["releaseChannel", evidence.trust_sources?.release_channel_policy, "Release Channel Policy"],
  ];
  for (const [key, source, label] of sourcePairs) {
    const resolved = resolveBoundFile(projectRoot, approvalFile, source?.ref, source?.digest, label, errors);
    if (resolved) resolvedSources[key] = resolved;
  }
  for (const [key, source, label] of [
    ["platformRecipe", evidence.trust_sources?.platform_recipe, "Platform Release Recipe"],
    ["releaseHandoff", evidence.trust_sources?.release_handoff_pack, "Release Handoff Pack"],
  ]) {
    if (source?.required === "Yes") {
      const resolved = resolveBoundFile(projectRoot, approvalFile, source.ref, source.digest, label, errors);
      if (resolved) resolvedSources[key] = resolved;
    } else if (source?.ref !== "N/A" || source?.digest !== "N/A") {
      errors.push(`${label} must use N/A ref and digest when not required`);
    }
  }

  for (const [key, refField, digestField, label] of [
    ["releaseSop", "release_sop_ref", "release_sop_digest", "Release SOP"],
    ["rollback", "rollback_ref", "rollback_digest", "Rollback"],
    ["monitoring", "monitoring_ref", "monitoring_digest", "Monitoring"],
    ["postReleaseSmoke", "post_release_smoke_ref", "post_release_smoke_digest", "Post-release smoke"],
  ]) {
    const resolved = resolveBoundFile(projectRoot, approvalFile, evidence.release_controls?.[refField], evidence.release_controls?.[digestField], label, errors);
    if (resolved) resolvedSources[key] = resolved;
  }

  checkReleaseEvidence(evidence, resolvedSources.releaseEvidence, errors);
  checkRuntimeHygiene(evidence, resolvedSources.runtimeHygiene, errors);
  checkReleaseChannel(evidence, resolvedSources.releaseChannel, errors);
  checkPlatformRecipe(evidence, resolvedSources.platformRecipe, errors);
  checkReleaseHandoff(evidence, resolvedSources.releaseHandoff, errors);

  return { ok: errors.length === 0, errors, resolvedSources };
}

export function normalizeArtifactRef(value) {
  const text = String(value || "").trim();
  if (/^(artifact|file):/i.test(text)) return text;
  return `artifact:${text}`;
}

function resolveBoundFile(projectRoot, fromFile, reference, expectedDigest, label, errors) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, normalizeArtifactRef(reference));
  if (!resolved.ok) {
    errors.push(`${label} is unsafe or unresolved: ${resolved.error}`);
    return null;
  }
  const actualDigest = canonicalFileDigest(resolved.file);
  if (actualDigest !== expectedDigest) errors.push(`${label} digest does not match current file`);
  return { ...resolved, digest: actualDigest };
}

function readEvidence(resolved, label, errors) {
  if (!resolved) return null;
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok) {
    errors.push(`${label} must contain valid Machine-Readable Evidence`);
    return null;
  }
  return extracted.value;
}

function checkReleaseEvidence(approval, resolved, errors) {
  const evidence = readEvidence(resolved, "Release Evidence Gate", errors);
  if (!evidence) return;
  if (!new Set(["READY_FOR_INTERNAL_TRIAL_REVIEW", "READY_FOR_RELEASE_OWNER_REVIEW"]).has(evidence.gate_state)) errors.push("Release Evidence Gate must be ready for review");
  if (evidence.release_target !== approval.release_candidate.release_target) errors.push("Release Evidence Gate target does not match approval");
  if (normalizeComparableRef(evidence.release_scope?.release_candidate_ref) !== normalizeComparableRef(approval.release_candidate.candidate_ref)) errors.push("Release Evidence Gate candidate does not match approval");
  if (evidence.release_scope?.source_revision !== approval.release_candidate.source_revision) errors.push("Release Evidence Gate source revision does not match approval");
  if (evidence.can_handoff_to_release_owner !== "Yes") errors.push("Release Evidence Gate must allow release-owner handoff");
  const packageType = approval.release_candidate.package_identity_type;
  if (packageType === "none") {
    if (approval.release_candidate.package_identity_ref !== "not_applicable"
      || approval.release_candidate.package_identity_digest_or_id !== "not_applicable") {
      errors.push("package identity must be not_applicable when package_identity_type is none");
    }
  } else {
    if (normalizeComparableRef(evidence.release_scope?.build_artifact_ref) !== normalizeComparableRef(approval.release_candidate.package_identity_ref)) {
      errors.push("Release Evidence Gate build artifact ref does not match approval package identity");
    }
    if (evidence.release_scope?.build_artifact_digest !== approval.release_candidate.package_identity_digest_or_id) {
      errors.push("Release Evidence Gate build artifact digest or ID does not match approval package identity");
    }
  }
}

function checkRuntimeHygiene(approval, resolved, errors) {
  const evidence = readEvidence(resolved, "Runtime Hygiene", errors);
  if (!evidence) return;
  if (evidence.operation !== "release") errors.push("Runtime Hygiene operation must be release");
  if (evidence.runtime_class !== "RELEASE_PREFLIGHT_READY") errors.push("Runtime Hygiene must record RELEASE_PREFLIGHT_READY");
  if (evidence.decision_state !== "CAN_CONTINUE_TO_RELEASE_REVIEW" || evidence.outcome !== "CAN_CONTINUE_TO_RELEASE_REVIEW") errors.push("Runtime Hygiene must allow release review");
  if (evidence.release_context?.production_touched !== "No") errors.push("Runtime Hygiene must prove production was not touched");
  if (!new Set(["PREFLIGHT_ONLY", "BUNDLE_CREATED"]).has(evidence.release_context?.lane_state)) errors.push("Runtime Hygiene release lane must remain preflight-only or bundle-created");
  const binding = evidence.release_trust_binding || {};
  if (normalizeComparableRef(binding.release_candidate_ref) !== normalizeComparableRef(approval.release_candidate.candidate_ref)) errors.push("Runtime Hygiene candidate does not match approval");
  if (binding.release_candidate_digest !== approval.release_candidate.candidate_digest) errors.push("Runtime Hygiene candidate digest does not match approval");
  if (binding.source_revision !== approval.release_candidate.source_revision) errors.push("Runtime Hygiene source revision does not match approval");
}

function checkReleaseChannel(approval, resolved, errors) {
  const evidence = readEvidence(resolved, "Release Channel Policy", errors);
  if (!evidence) return;
  const pkg = evidence.release_package_identity || {};
  if (pkg.identity_type !== approval.release_candidate.package_identity_type) errors.push("Release Channel Policy package identity type does not match approval");
  if (pkg.identity_ref !== approval.release_candidate.package_identity_ref) errors.push("Release Channel Policy package identity ref does not match approval");
  if (pkg.digest_or_id !== approval.release_candidate.package_identity_digest_or_id) errors.push("Release Channel Policy package identity does not match approval");
  const matchingSource = (evidence.source_chain || []).some((source) => source.current_release_candidate_match === "Yes");
  if (!matchingSource) errors.push("Release Channel Policy must bind a current release candidate source");
}

function checkPlatformRecipe(approval, resolved, errors) {
  const requiredByTarget = platformRecipeTargets.has(approval.release_candidate.release_target);
  if (requiredByTarget && !resolved) {
    errors.push("release target requires a strict Platform Release Recipe");
    return;
  }
  if (!resolved) return;
  const content = fs.readFileSync(resolved.file, "utf8");
  if (tableValue(sectionBody(content, "Human Summary"), "Recipe Status") !== "STRICT") errors.push("Platform Release Recipe must be STRICT");
}

function checkReleaseHandoff(approval, resolved, errors) {
  const requiredByTarget = productionLikeTargets.has(approval.release_candidate.release_target);
  if (requiredByTarget && !resolved) {
    errors.push("production-like release target requires a Release Handoff Pack");
    return;
  }
  const evidence = readEvidence(resolved, "Release Handoff Pack", errors);
  if (!evidence) return;
  if (evidence.handoff_pack?.release_target !== approval.release_candidate.release_target) errors.push("Release Handoff Pack target does not match approval");
  if (evidence.handoff_pack?.handoff_review_only !== true) errors.push("Release Handoff Pack must remain review-only");
}

function normalizeComparableRef(value) {
  return String(value || "").trim().replace(/^(artifact|file):/i, "");
}

function tableValue(body, field) {
  const pattern = new RegExp(`^\\|\\s*${escapeRegExp(field)}\\s*\\|\\s*(.*?)\\s*\\|$`, "im");
  const match = String(body || "").match(pattern);
  return match ? match[1].replace(/`/g, "").trim() : "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
