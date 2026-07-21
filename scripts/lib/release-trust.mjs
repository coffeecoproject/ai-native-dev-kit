import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  evidenceDigest,
  extractMachineReadableEvidence,
  loadSchema,
  validateEvidenceBlock,
} from "./artifact-schema.mjs";
import {
  canonicalFileDigest,
  isGovernedWorkflowOutputPath,
  projectIdentity,
  resolveAuthoritativeEvidenceReference,
} from "./evidence-authority.mjs";
import { sectionBody } from "./markdown.mjs";
import { validateSpecificHumanApprover } from "./approval-record-validation.mjs";
import { validateReleaseTopologySource } from "./release-topology-consumer.mjs";
import { validateReleaseSurfaceEvidence } from "./release-surface-evidence.mjs";

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

export const STAGED_RELEASE_CANDIDATE_CHECK = "git diff --cached --check";
export const FULL_VERIFICATION_COMMAND = "npm run verify";

export function fullVerificationAuthorityErrors(authority) {
  const errors = [];
  if (authority?.test_evidence_state !== "TEST_EVIDENCE_COMPLETE") {
    errors.push("full verification requires TEST_EVIDENCE_COMPLETE authority");
    return errors;
  }
  const items = Array.isArray(authority.evidence_items) ? authority.evidence_items : [];
  const exact = items.filter((item) => String(item?.command || "").trim() === FULL_VERIFICATION_COMMAND);
  if (exact.length !== 1) {
    errors.push(`full verification requires exactly one ${FULL_VERIFICATION_COMMAND} command result`);
    return errors;
  }
  const item = exact[0];
  if (item.evidence_type !== "COMMAND_OUTPUT") errors.push("full verification must use COMMAND_OUTPUT evidence");
  if (item.result_state !== "PASSED" || item.exit_code !== 0) errors.push("full verification command must pass with exit code 0");
  if (item.ran_after_change !== "Yes" || item.current_task_match !== "Yes") {
    errors.push("full verification command must be current-task evidence recorded after the candidate change");
  }
  if (!/^artifact:evidence\/[A-Za-z0-9._/-]+$/.test(String(item.ref || ""))) {
    errors.push("full verification command must bind a project-local evidence artifact");
  }
  return errors;
}

export function releaseAcceptanceCandidateRevision(projectRoot, excludedReviewRefs) {
  const refs = Array.isArray(excludedReviewRefs) ? excludedReviewRefs : [excludedReviewRefs];
  const excluded = new Set(refs.map((ref) => normalizeCandidateExclusion(ref)));
  if (excluded.size === 0) {
    throw new Error("release acceptance review exclusions are required");
  }
  const indexed = runReadOnlyGit(projectRoot, ["ls-files", "--stage", "-z", "--", "."]);
  if (indexed.status !== 0) {
    throw new Error(`cannot inspect the release candidate Git index: ${firstUsefulLine(indexed.stderr || indexed.stdout)}`);
  }
  const rows = [];
  for (const entry of String(indexed.stdout || "").split("\0").filter(Boolean)) {
    const match = entry.match(/^([0-9]{6}) ([a-f0-9]{40,64}) ([0-3])\t(.+)$/);
    if (!match || match[3] !== "0") throw new Error(`cannot parse release candidate Git index entry: ${entry}`);
    const relative = match[4].replaceAll("\\", "/");
    if (excluded.has(relative)) continue;
    rows.push(`${match[1]} ${match[2]} ${relative}`);
  }
  return `sha256:${crypto.createHash("sha256").update(`release-acceptance-candidate:v1\n${rows.sort().join("\n")}`).digest("hex")}`;
}

export function releaseCandidateContaminationErrors(projectRoot, excludedReviewRefs = []) {
  const excluded = new Set((Array.isArray(excludedReviewRefs) ? excludedReviewRefs : [excludedReviewRefs])
    .filter(Boolean)
    .map((ref) => normalizeCandidateExclusion(ref)));
  const errors = [];
  const unstaged = runReadOnlyGit(projectRoot, ["diff", "--name-only", "--diff-filter=ACDMRTUXB", "--", "."]);
  if (unstaged.status !== 0) {
    return [`cannot inspect unstaged candidate contamination: ${firstUsefulLine(unstaged.stderr || unstaged.stdout)}`];
  }
  for (const relative of String(unstaged.stdout || "").split(/\r?\n/).map(normalizeCandidatePath).filter(Boolean)) {
    if (!excluded.has(relative) && !isGovernedWorkflowOutputPath(relative)) {
      errors.push(`release candidate worktree contains unstaged project change ${relative}`);
    }
  }
  const untracked = runReadOnlyGit(projectRoot, ["ls-files", "--others", "--exclude-standard", "-z", "--", "."]);
  if (untracked.status !== 0) {
    return [...errors, `cannot inspect untracked candidate contamination: ${firstUsefulLine(untracked.stderr || untracked.stdout)}`];
  }
  for (const relative of String(untracked.stdout || "").split("\0").map(normalizeCandidatePath).filter(Boolean)) {
    if (excluded.has(relative) || isGovernedWorkflowOutputPath(relative) || isUnregisteredPlanningDraft(relative)) continue;
    errors.push(`release candidate worktree contains untracked project file ${relative}`);
  }
  return errors;
}

function normalizeCandidateExclusion(value) {
  const relative = String(value || "")
    .trim()
    .replace(/^(artifact|file):/i, "")
    .replaceAll("\\", "/")
    .replace(/^\.\//, "");
  if (!relative || path.isAbsolute(relative) || relative.split("/").includes("..")) {
    throw new Error("release acceptance review exclusion must be a safe project-relative path");
  }
  return relative;
}

function normalizeCandidatePath(value) {
  return String(value || "").trim().replaceAll("\\", "/").replace(/^\.\//, "");
}

function isUnregisteredPlanningDraft(relative) {
  return /^docs\/plans\/[A-Za-z0-9._/-]+\.md$/.test(relative);
}

const productionLikeTargets = new Set(["production_review", "app_store_review", "mini_program_review"]);
const platformRecipeTargets = new Set(["app_store_review", "mini_program_review"]);
const recipeTargetByReleaseTarget = new Map([
  ["preview", "preview"],
  ["internal_trial", "internal-testing"],
  ["staging", "staging"],
  ["production_review", "production"],
  ["app_store_review", "app-store"],
  ["mini_program_review", "review"],
]);
const effectRuleByReleaseTarget = new Map([
  ["preview", { environment: "preview", action: "PROVIDER_DEPLOY" }],
  ["internal_trial", { environment: "internal_trial", action: "PROVIDER_DEPLOY" }],
  ["staging", { environment: "staging", action: "PROVIDER_DEPLOY" }],
  ["production_review", { environment: "production", action: "PRODUCTION_DEPLOY" }],
  ["app_store_review", { environment: "app_store", action: "STORE_SUBMISSION" }],
  ["mini_program_review", { environment: "mini_program", action: "MINI_PROGRAM_RELEASE" }],
]);
const approvedEffectKeys = [
  "effect_id",
  "action",
  "platform",
  "environment",
  "candidate_ref",
  "candidate_digest",
  "package_identity_type",
  "package_identity_ref",
  "package_identity_digest_or_id",
  "command_or_request_digest",
  "cost_boundary",
  "rollback_ref",
  "rollback_digest",
];

export function validateReleasePreflightReceipt(projectRoot, reference, expected = {}) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, expected.fromFile || "", reference);
  if (!resolved.ok) {
    return { ok: false, errors: [`release preflight receipt is unsafe or unresolved: ${resolved.error}`], receipt: null };
  }
  let receipt;
  try {
    receipt = JSON.parse(fs.readFileSync(resolved.file, "utf8"));
  } catch (error) {
    return { ok: false, errors: [`release preflight receipt must be valid JSON: ${error.message}`], receipt: null };
  }
  const errors = [];
  if (receipt?.schema_version !== "1.113.0") errors.push("release preflight receipt schema_version must be 1.113.0");
  if (receipt?.artifact_type !== "release_preflight_receipt") errors.push("release preflight receipt artifact_type must be release_preflight_receipt");
  if (receipt?.operation !== "release_preflight") errors.push("release preflight receipt operation must be release_preflight");
  if (receipt?.result !== "PASS" || receipt?.exit_code !== 0) errors.push("release preflight receipt must record result PASS and exit_code 0");
  if (receipt?.command !== STAGED_RELEASE_CANDIDATE_CHECK) {
    errors.push(`release preflight receipt command must be the supported exact candidate check: ${STAGED_RELEASE_CANDIDATE_CHECK}`);
  } else {
    errors.push(...validateStagedReleaseCandidateCheck(projectRoot));
  }
  if (!new Set(["PREFLIGHT_ONLY", "BUNDLE_CREATED"]).has(receipt?.lane_state)) errors.push("release preflight receipt must remain in a pre-production lane");
  if (receipt?.external_effects_executed !== "No") errors.push("release preflight receipt must prove that no external effect was executed");
  if (receipt?.production_touched !== "No") errors.push("release preflight receipt must prove that production was not touched");
  if (!/^sha256:[a-f0-9]{64}$/.test(String(receipt?.release_candidate_digest || ""))) {
    errors.push("release preflight receipt requires a release_candidate_digest");
  }
  const candidate = resolveAuthoritativeEvidenceReference(projectRoot, resolved.file, receipt?.release_candidate_ref || "");
  if (!candidate.ok) {
    errors.push(`release preflight receipt release candidate is unsafe or unresolved: ${candidate.error}`);
  } else if (canonicalFileDigest(candidate.file) !== receipt?.release_candidate_digest) {
    errors.push("release preflight receipt release_candidate_digest does not match the current candidate file");
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(String(receipt?.receipt_digest || ""))) {
    errors.push("release preflight receipt requires receipt_digest");
  } else if (receipt.receipt_digest !== evidenceDigest(receipt, ["receipt_digest"])) {
    errors.push("release preflight receipt digest does not match its current content");
  }
  for (const [field, expectedValue] of [
    ["task_ref", expected.taskRef],
    ["intent_digest", expected.intentDigest],
    ["release_candidate_ref", expected.releaseCandidateRef],
    ["release_candidate_digest", expected.releaseCandidateDigest],
    ["source_revision", expected.sourceRevision],
    ["lane_state", expected.laneState],
  ]) {
    if (expectedValue && receipt?.[field] !== expectedValue) errors.push(`release preflight receipt ${field} does not match the current request`);
  }
  const currentRevision = projectIdentity(projectRoot).revision;
  if (receipt?.source_revision !== currentRevision) errors.push("release preflight receipt source_revision does not match the current project revision");
  return {
    ok: errors.length === 0,
    errors,
    receipt,
    file: resolved.file,
    relativePath: resolved.relativePath,
    digest: canonicalFileDigest(resolved.file),
  };
}

function validateStagedReleaseCandidateCheck(projectRoot) {
  const errors = [];
  const changed = runReadOnlyGit(projectRoot, [
    "diff", "--cached", "--name-only", "--diff-filter=ACDMRTUXB",
  ]);
  if (changed.status !== 0) {
    errors.push(`release preflight receipt cannot inspect the staged candidate: ${firstUsefulLine(changed.stderr || changed.stdout)}`);
    return errors;
  }
  if (!String(changed.stdout || "").split(/\r?\n/).some((line) => line.trim())) {
    errors.push("release preflight receipt exact candidate check requires a non-empty staged diff");
    return errors;
  }
  const checked = runReadOnlyGit(projectRoot, ["diff", "--cached", "--check"]);
  if (checked.status !== 0) {
    errors.push(`release preflight receipt exact candidate check failed: ${firstUsefulLine(checked.stderr || checked.stdout)}`);
  }
  errors.push(...releaseCandidateContaminationErrors(projectRoot));
  return errors;
}

function runReadOnlyGit(projectRoot, args) {
  return spawnSync("git", ["-C", projectRoot, "--no-pager", ...args], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32,
    env: {
      ...process.env,
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0",
      GIT_PAGER: "cat",
      PAGER: "cat",
    },
  });
}

function firstUsefulLine(value) {
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "git command failed";
}

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
  errors.push(...validateSpecificHumanApprover(approval.approved_by, "release approval"));
  const approvedEffect = parseApprovedExternalEffect(approval.approved_scope);
  if (!approvedEffect.ok) errors.push(...approvedEffect.errors);
  else errors.push(...releaseApprovalEffectErrors(evidence, approvedEffect.value, options.expectedEffect || {}));
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
  const topologySource = evidence.trust_sources?.release_execution_topology;
  if (options.requireTopology && !topologySource) {
    errors.push("Release Execution Topology trust source is required");
  } else if (topologySource) {
    const topology = validateReleaseTopologySource(projectRoot, approvalFile, topologySource, {
      expectedSourceRevision: evidence.release_candidate?.source_revision,
      requireReady: true,
    });
    if (topology.ok) resolvedSources.releaseTopology = topology.resolved;
    else errors.push(...topology.errors);
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
    if (resolved) {
      const semantic = validateReleaseSurfaceEvidence(label, resolved);
      if (!semantic.ok) errors.push(...semantic.errors);
      resolvedSources[key] = resolved;
    }
  }

  checkReleaseEvidence(evidence, resolvedSources.releaseEvidence, errors);
  checkRuntimeHygiene(evidence, resolvedSources.runtimeHygiene, errors);
  checkReleaseChannel(evidence, resolvedSources.releaseChannel, errors);
  checkPlatformRecipe(evidence, resolvedSources.platformRecipe, errors);
  checkReleaseHandoff(evidence, resolvedSources.releaseHandoff, errors);
  checkTopologyAgreement(evidence, resolvedSources.releaseEvidence, resolvedSources.runtimeHygiene, errors, options.requireTopology);

  return { ok: errors.length === 0, errors, resolvedSources };
}

export function commandOrRequestDigest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value || "")).digest("hex")}`;
}

export function parseApprovedExternalEffect(value) {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return {
        ok: false,
        value: null,
        errors: ["approved_scope must be a JSON object that binds one concrete external effect; arbitrary text is not approval"],
      };
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, value: null, errors: ["approved_scope must resolve to one structured external effect object"] };
  }
  const keys = Object.keys(parsed).sort();
  const expectedKeys = [...approvedEffectKeys].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    return {
      ok: false,
      value: parsed,
      errors: [`approved_scope fields must be exactly: ${approvedEffectKeys.join(", ")}`],
    };
  }
  return { ok: true, value: parsed, errors: [] };
}

export function releaseApprovalEffectErrors(approvalEvidence, effect, expectedEffect = {}) {
  const errors = [];
  const candidate = approvalEvidence.release_candidate || {};
  const controls = approvalEvidence.release_controls || {};
  const rule = effectRuleByReleaseTarget.get(candidate.release_target);
  if (!/^[a-z0-9][a-z0-9._:-]*$/i.test(String(effect.effect_id || ""))) errors.push("approved_scope.effect_id must be a stable external effect identifier");
  if (!rule) errors.push(`approved_scope cannot bind unsupported release target ${candidate.release_target || "<missing>"}`);
  else {
    if (effect.action !== rule.action) errors.push(`approved_scope.action must be ${rule.action} for ${candidate.release_target}`);
    if (effect.environment !== rule.environment) errors.push(`approved_scope.environment must be ${rule.environment} for ${candidate.release_target}`);
  }
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(String(effect.platform || ""))) errors.push("approved_scope.platform must identify one concrete platform");
  if (normalizeComparableRef(effect.candidate_ref) !== normalizeComparableRef(candidate.candidate_ref)) errors.push("approved_scope candidate_ref does not match release_candidate");
  if (effect.candidate_digest !== candidate.candidate_digest) errors.push("approved_scope candidate_digest does not match release_candidate");
  if (effect.package_identity_type !== candidate.package_identity_type) errors.push("approved_scope package_identity_type does not match release_candidate");
  if (normalizeComparableRef(effect.package_identity_ref) !== normalizeComparableRef(candidate.package_identity_ref)) errors.push("approved_scope package_identity_ref does not match release_candidate");
  if (effect.package_identity_digest_or_id !== candidate.package_identity_digest_or_id) errors.push("approved_scope package identity does not match release_candidate");
  if (!/^sha256:[a-f0-9]{64}$/.test(String(effect.command_or_request_digest || ""))) errors.push("approved_scope.command_or_request_digest must bind the exact command or provider request");
  if (normalizeComparableRef(effect.rollback_ref) !== normalizeComparableRef(controls.rollback_ref)) errors.push("approved_scope rollback_ref does not match release controls");
  if (effect.rollback_digest !== controls.rollback_digest) errors.push("approved_scope rollback_digest does not match release controls");
  errors.push(...costBoundaryErrors(effect.cost_boundary));

  for (const [field, expected] of Object.entries(expectedEffect || {})) {
    if (expected === undefined || expected === null || expected === "") continue;
    if (effect[field] !== expected) errors.push(`approved_scope.${field} does not match the concrete execution request`);
  }
  return errors;
}

function costBoundaryErrors(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return ["approved_scope.cost_boundary must be structured"];
  const keys = Object.keys(value).sort();
  const expected = ["cost_class", "currency", "maximum_amount"].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) return ["approved_scope.cost_boundary fields must be exactly cost_class, currency, maximum_amount"];
  const allowed = new Set(["NO_INCREMENTAL_COST", "WITHIN_APPROVED_BUDGET", "VARIABLE_COST_APPROVED"]);
  const errors = [];
  if (!allowed.has(value.cost_class)) errors.push("approved_scope.cost_boundary.cost_class is invalid");
  if (value.cost_class === "NO_INCREMENTAL_COST") {
    if (value.currency !== "N/A" || value.maximum_amount !== "N/A") errors.push("NO_INCREMENTAL_COST must use N/A currency and maximum_amount");
  } else {
    if (!/^[A-Z]{3}$/.test(String(value.currency || ""))) errors.push("approved_scope cost currency must be an ISO-style three-letter code");
    if (!/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,2})?$/.test(String(value.maximum_amount || ""))) errors.push("approved_scope maximum_amount must be a non-negative decimal boundary");
  }
  return errors;
}

function checkTopologyAgreement(approval, releaseEvidenceResolved, runtimeResolved, errors, required) {
  const expected = approval.trust_sources?.release_execution_topology;
  if (!expected) return;
  for (const [label, resolved] of [["Release Evidence Gate", releaseEvidenceResolved], ["Runtime Hygiene", runtimeResolved]]) {
    const evidence = readEvidence(resolved, label, errors);
    const actual = label === "Release Evidence Gate"
      ? (evidence?.source_chain || []).find((item) => item.name === "release_execution_topology")
      : evidence?.release_trust_binding && {
        ref: evidence.release_trust_binding.release_execution_topology_ref,
        digest: evidence.release_trust_binding.release_execution_topology_digest,
      };
    if (!actual?.ref || !actual?.digest) {
      if (required) errors.push(`${label} does not bind Release Execution Topology`);
      continue;
    }
    if (normalizeComparableRef(actual.ref) !== normalizeComparableRef(expected.ref) || actual.digest !== expected.digest) {
      errors.push(`${label} Release Execution Topology binding does not match approval`);
    }
  }
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
  if (evidence.release_scope?.release_candidate_digest !== approval.release_candidate.candidate_digest) errors.push("Release Evidence Gate candidate digest does not match approval");
  if (evidence.release_scope?.source_revision !== approval.release_candidate.source_revision) errors.push("Release Evidence Gate source revision does not match approval");
  if (evidence.can_handoff_to_release_owner !== "Yes") errors.push("Release Evidence Gate must allow release-owner handoff");
  const packageType = approval.release_candidate.package_identity_type;
  if (packageType === "none") {
    if (approval.release_candidate.package_identity_ref !== "not_applicable"
      || approval.release_candidate.package_identity_digest_or_id !== "not_applicable") {
      errors.push("package identity must be not_applicable when package_identity_type is none");
    }
    if (approval.release_candidate.release_target !== "preview") {
      errors.push("package identity none is allowed only for preview release review");
    }
  } else if (approval.release_candidate.package_identity_ref === "not_applicable"
    || approval.release_candidate.package_identity_digest_or_id === "not_applicable") {
    errors.push("concrete package identity cannot use not_applicable values");
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
  if (evidence.effective_release_channel?.blocked === "Yes"
    || evidence.effective_release_channel?.recommendation_class === "BLOCK_RELEASE_CHANNEL_POLICY") {
    errors.push("Release Channel Policy is blocked and cannot authorize release review");
  }
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
  if (!recipeSupportsReleaseTarget(content, approval.release_candidate.release_target)) {
    errors.push(`Platform Release Recipe does not support release target ${approval.release_candidate.release_target}`);
  }
}

export function recipeSupportsReleaseTarget(content, releaseTarget) {
  const supportedTargets = tableColumnValues(sectionBody(content, "Supported Targets"), "Target");
  const requiredTarget = recipeTargetByReleaseTarget.get(String(releaseTarget || ""));
  return Boolean(requiredTarget && supportedTargets.has(requiredTarget));
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

function tableColumnValues(body, columnName) {
  const lines = String(body || "").split(/\r?\n/).filter((line) => /^\s*\|/.test(line));
  if (lines.length < 3) return new Set();
  const headers = splitTableRow(lines[0]);
  const index = headers.findIndex((value) => value === columnName);
  if (index < 0) return new Set();
  return new Set(lines.slice(2).map(splitTableRow).map((row) => row[index]).filter(Boolean));
}

function splitTableRow(line) {
  return String(line || "").trim().replace(/^\||\|$/g, "").split("|").map((value) => value.replace(/`/g, "").trim());
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
