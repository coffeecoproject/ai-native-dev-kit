import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { evidenceDigest, extractMachineReadableEvidence } from "./artifact-schema.mjs";
import { evaluateVerifiedAdoptionApplyChain } from "./adoption-apply-chain.mjs";
import { canonicalFileDigest } from "./evidence-authority.mjs";
import { validateVerifiedBootstrapReceipt } from "./bootstrap-transaction.mjs";
import { inspectTargetTopology } from "./target-topology.mjs";
import { collectProjectFactProjection, hasGlobalTrustConflict, projectGoalProjection } from "./project-fact-projection.mjs";
import {
  analyzeActiveGuidanceConflicts,
  effectiveGuidanceGraph,
  loadReviewContextAuthority,
  reviewContextBinding,
} from "./review-context-authority.mjs";

export function resolveProjectEntryTrust(options = {}) {
  const targetRoot = path.resolve(options.projectRoot || ".");
  const sourceRoot = path.resolve(options.sourceRoot || targetRoot);
  const topology = inspectTargetTopology(targetRoot);
  const goalProjection = projectGoalProjection(options.goal, options.goalOptions);
  const facts = collectProjectFactProjection(targetRoot, { topology, goalProjection });
  const identity = installedIdentity(targetRoot, sourceRoot, topology, facts);
  const guidance = guidanceBindingFor({ targetRoot, sourceRoot, identity });
  const blockers = [];
  if (["UNSAFE", "NON_DIRECTORY"].includes(topology.state)) blockers.push("TARGET_TOPOLOGY_UNSAFE");
  if (identity.state === "CONFLICTED") blockers.push("PROJECT_IDENTITY_CONFLICTED");
  if (guidance.state !== "CURRENT") blockers.push("GUIDANCE_AUTHORITY_INVALID");
  if (hasGlobalTrustConflict(facts)) blockers.push("PROJECT_FACT_GLOBAL_CONFLICT");

  const entryState = blockers.length > 0
    ? "BLOCKED_REPAIR_REQUIRED"
    : identity.state === "UNBOOTSTRAPPED" && ["ABSENT_LEAF", "EMPTY_DIRECTORY"].includes(topology.state)
      ? "READY_FOR_CONTROLLED_SETUP"
      : identity.state === "INSTALLED_CURRENT" || identity.state === "BRIDGE_CURRENT"
        ? "READY_FOR_INTENTOS_OPERATION"
        : "READY_FOR_READ_ONLY_ASSESSMENT";
  const base = {
    schema_version: "1.109.0",
    artifact_type: "project_entry_trust",
    target_topology: topology,
    goal_projection: goalProjection,
    project_identity: identity,
    project_fact_projection: facts,
    guidance_authority: guidance,
    entry_state: entryState,
    blockers: [...new Set(blockers)],
    allowed_operation: allowedOperation(entryState, goalProjection.execution_intent),
    user_technical_choice_required: "No",
    boundaries: {
      writes_target_files: "No",
      authorizes_apply: "No",
      authorizes_release_or_production: "No",
      proves_activation: "No",
    },
  };
  return { ...base, entry_trust_digest: evidenceDigest(base, []) };
}

export function requireTrustedProjectEntry(trust, operation = "READ_ONLY") {
  const errors = [];
  if (!trust?.entry_state) errors.push("PROJECT_ENTRY_TRUST_UNAVAILABLE");
  if (operation === "READ_ONLY") return { ok: errors.length === 0, errors };
  if (trust?.blockers?.length) errors.push(...trust.blockers);
  if (operation === "ROUTINE_TASK" && trust?.entry_state !== "READY_FOR_INTENTOS_OPERATION") errors.push("PROJECT_ENTRY_NOT_READY_FOR_ROUTINE_WORK");
  if (operation === "CONTROLLED_SETUP" && trust?.entry_state !== "READY_FOR_CONTROLLED_SETUP") errors.push("PROJECT_ENTRY_NOT_READY_FOR_CONTROLLED_SETUP");
  if (operation === "CONTROLLED_APPLY" && !["READY_FOR_CONTROLLED_SETUP", "READY_FOR_READ_ONLY_ASSESSMENT"].includes(trust?.entry_state)) errors.push("PROJECT_ENTRY_NOT_READY_FOR_CONTROLLED_APPLY_REVIEW");
  return { ok: errors.length === 0, errors };
}

function installedIdentity(root, sourceRoot, topology, facts) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return {
    state: "UNBOOTSTRAPPED",
    form: "NONE",
    canonical_root: topology.canonical_target,
    source_version: "N/A",
    identity_ref: "N/A",
  };
  const versionRef = path.join(root, ".intentos", "version.json");
  const sourceManifest = readJson(path.join(root, "intentos-manifest.json"));
  const sourcePackage = readJson(path.join(root, "package.json"));
  if (sourceManifest?.mode === "authoritative" && sourcePackage?.name === "intentos") {
    return { state: "INSTALLED_CURRENT", form: "SOURCE", canonical_root: topology.canonical_target, source_version: sourcePackage.version || sourceManifest.intentOSVersion || "UNKNOWN", identity_ref: "intentos-manifest.json", repository_identity: facts.project_identity };
  }
  const bridge = bridgeIdentity(root, sourceRoot, topology);
  if (fs.existsSync(versionRef)) {
    const pathIssue = identityPathIssue(root, versionRef);
    if (pathIssue) {
      return { state: "CONFLICTED", form: "INSTALLED", canonical_root: topology.canonical_target, source_version: "UNKNOWN", identity_ref: ".intentos/version.json", reason: pathIssue };
    }
    let version;
    try { version = JSON.parse(fs.readFileSync(versionRef, "utf8")); } catch {
      return { state: "CONFLICTED", form: "INSTALLED", canonical_root: topology.canonical_target, source_version: "UNKNOWN", identity_ref: ".intentos/version.json", reason: "Installed identity JSON is invalid." };
    }
    if (!/^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(String(version.intentOSVersion || ""))
      || !Array.isArray(version.workflowAssets)
      || version.workflowAssets.length === 0
      || !["NEW_PROJECT", "EXISTING_PROJECT", "UNKNOWN_PROJECT_ORIGIN"].includes(version.projectEntryOrigin)) {
      return { state: "CONFLICTED", form: "INSTALLED", canonical_root: topology.canonical_target, source_version: version.intentOSVersion || "UNKNOWN", identity_ref: ".intentos/version.json", reason: "Installed identity is missing required version, origin, or managed-asset bindings." };
    }
    const recordedRoot = version.projectRoot ? path.resolve(root, version.projectRoot) : topology.canonical_target;
    if (recordedRoot !== topology.canonical_target) return { state: "CONFLICTED", form: "INSTALLED", canonical_root: topology.canonical_target, source_version: version.intentOSVersion || "UNKNOWN", identity_ref: ".intentos/version.json", reason: "Installed identity root does not match the canonical project root." };
    const pendingUpdateActivation = validPendingControlledUpdateIdentity(root, topology.canonical_target);
    if (version.projectEntryOrigin === "NEW_PROJECT") {
      const receiptRef = ".intentos/bootstrap-receipt.json";
      const receiptFile = path.join(root, receiptRef);
      const receiptIssue = identityPathIssue(root, receiptFile);
      const receipt = receiptIssue ? null : readJson(receiptFile);
      const pendingActivation = validPendingActivationIdentity(root, topology.canonical_target);
      const currentBootstrap = !receiptIssue && validBootstrapReceipt(receipt, topology.canonical_target, version.workflowAssets);
      const currentUpdatedIdentity = !receiptIssue && validVerifiedUpdateIdentity(
        root,
        sourceRoot,
        topology.canonical_target,
        version.workflowAssets,
        receipt,
      );
      if (!currentBootstrap
        && !currentUpdatedIdentity.ok
        && !pendingActivation.ok
        && !pendingUpdateActivation.ok) {
        return {
          state: "CONFLICTED",
          form: "INSTALLED",
          canonical_root: topology.canonical_target,
          source_version: version.intentOSVersion || "UNKNOWN",
          identity_ref: ".intentos/version.json",
          reason: receiptIssue || currentUpdatedIdentity.reason || pendingUpdateActivation.reason || pendingActivation.reason || "New-project identity has no valid APPLY_VERIFIED behavioral activation receipt.",
        };
      }
    } else {
      const applyChain = evaluateVerifiedAdoptionApplyChain(root, { schemasRoot: sourceRoot });
      if (applyChain.status !== "VERIFIED" && !pendingUpdateActivation.ok) {
        return {
          state: "CONFLICTED",
          form: "INSTALLED",
          canonical_root: topology.canonical_target,
          source_version: version.intentOSVersion || "UNKNOWN",
          identity_ref: ".intentos/version.json",
          reason: "Existing-project identity has no verified project-bound apply and activation receipt.",
          evidence_refs: applyChain.refs || [],
        };
      }
    }
    return { state: "INSTALLED_CURRENT", form: "INSTALLED", canonical_root: topology.canonical_target, source_version: version.intentOSVersion || "UNKNOWN", identity_ref: ".intentos/version.json", repository_identity: facts.project_identity };
  }
  if (bridge.state === "CURRENT") return { state: "BRIDGE_CURRENT", form: "BRIDGE", canonical_root: topology.canonical_target, source_version: bridge.source_version, identity_ref: bridge.agent_ref, evidence_refs: bridge.evidence_refs, bridge_digest: bridge.bridge_digest, repository_identity: facts.project_identity };
  if (bridge.state === "CONFLICTED") return { state: "CONFLICTED", form: "BRIDGE", canonical_root: topology.canonical_target, source_version: "UNKNOWN", identity_ref: bridge.agent_ref, reason: bridge.reason, repository_identity: facts.project_identity };
  return { state: "UNBOOTSTRAPPED", form: "NONE", canonical_root: topology.canonical_target, source_version: "N/A", identity_ref: "N/A", repository_identity: facts.project_identity };
}

function validVerifiedUpdateIdentity(root, sourceRoot, canonicalRoot, workflowAssets, bootstrapReceipt) {
  const applyChain = evaluateVerifiedAdoptionApplyChain(root, { schemasRoot: sourceRoot });
  if (applyChain.status !== "VERIFIED") {
    return { ok: false, reason: "No verified controlled-update apply receipt can refresh the stale bootstrap identity." };
  }
  const receiptRef = (applyChain.refs || [])
    .map((ref) => String(ref || ""))
    .find((ref) => ref.startsWith("artifact:apply-receipts/"));
  if (!receiptRef) return { ok: false, reason: "Verified controlled-update identity has no apply receipt reference." };
  const relative = receiptRef.slice("artifact:".length);
  if (!safeProjectRelativePath(relative)) return { ok: false, reason: "Verified controlled-update receipt reference is unsafe." };
  const receiptFile = path.join(root, relative);
  const issue = identityPathIssue(root, receiptFile);
  if (issue) return { ok: false, reason: issue };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(receiptFile, "utf8"));
  if (!extracted?.ok || extracted.value?.receipt_state !== "APPLY_VERIFIED") {
    return { ok: false, reason: "Verified controlled-update receipt evidence is unavailable or invalid." };
  }
  const actionByPath = new Map();
  for (const action of bootstrapReceipt?.actions || []) {
    if (action?.path) actionByPath.set(action.path, { result: action.result, hash_after: action.hash_after });
  }
  for (const action of extracted.value.actions || []) {
    if (action?.result !== "APPLIED") continue;
    const [relativePath] = action.target_paths || [];
    if (relativePath) actionByPath.set(relativePath, { result: action.result, hash_after: action.hash_after });
  }
  return validManagedIdentityAssets(canonicalRoot, workflowAssets, actionByPath)
    ? { ok: true, reason: "" }
    : { ok: false, reason: "Verified controlled-update evidence does not cover the complete current managed identity." };
}

function validBootstrapReceipt(receipt, canonicalRoot, workflowAssets = []) {
  if (!validateVerifiedBootstrapReceipt(receipt, canonicalRoot).ok) return false;
  const actionByPath = new Map((receipt.actions || []).map((item) => [item.path, item]));
  return validManagedIdentityAssets(canonicalRoot, workflowAssets, actionByPath);
}

function validManagedIdentityAssets(canonicalRoot, workflowAssets, actionByPath) {
  const identityAssets = [
    ".intentos",
    "scripts",
    "AGENTS.md",
    ".intentos/version.json",
    ...workflowAssets.filter(isIdentityManagedAsset),
  ];
  return minimalAssetRoots(identityAssets).every((relative) => {
    const safe = String(relative || "").replaceAll("\\", "/").replace(/^\.\//, "");
    if (!safe || safe === "." || safe === ".." || safe.startsWith("../") || path.posix.isAbsolute(safe)) return false;
    const file = path.join(canonicalRoot, safe);
    if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink()) return false;
    if (fs.lstatSync(file).isDirectory()) {
      const prefix = `${safe}/`;
      const descendants = [...actionByPath.entries()].filter(([relativePath]) => relativePath.startsWith(prefix));
      return descendants.length > 0 && descendants.every(([relativePath, action]) => {
        const child = path.join(canonicalRoot, relativePath);
        return action?.result === "APPLIED"
          && /^sha256:[a-f0-9]{64}$/.test(String(action.hash_after || ""))
          && fs.existsSync(child)
          && !identityPathIssue(canonicalRoot, child)
          && canonicalFileDigest(child) === action.hash_after;
      });
    }
    const action = actionByPath.get(safe);
    return action?.result === "APPLIED"
      && /^sha256:[a-f0-9]{64}$/.test(String(action.hash_after || ""))
      && !identityPathIssue(canonicalRoot, file)
      && canonicalFileDigest(file) === action.hash_after;
  });
}

function isIdentityManagedAsset(relative) {
  const normalized = String(relative || "").replaceAll("\\", "/").replace(/^\.\//, "");
  return normalized === "AGENTS.md"
    || normalized === "scripts"
    || normalized.startsWith("scripts/")
    || normalized === ".intentos"
    || normalized.startsWith(".intentos/");
}

function minimalAssetRoots(values) {
  const normalized = [...new Set(values.map((value) => String(value || "").replaceAll("\\", "/").replace(/^\.\//, "")).filter(Boolean))]
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
  return normalized.filter((candidate, index) => !normalized.slice(0, index).some((parent) => candidate.startsWith(`${parent}/`)));
}

function validPendingActivationIdentity(root, canonicalRoot) {
  const transactionId = String(process.env.INTENTOS_BOOTSTRAP_ACTIVATION_TRANSACTION || "");
  const expectedEnvelope = String(process.env.INTENTOS_BOOTSTRAP_ACTIVATION_ENVELOPE_DIGEST || "");
  if (!transactionId || !/^sha256:[a-f0-9]{64}$/.test(expectedEnvelope)) return { ok: false, reason: "No bounded bootstrap activation context is active." };
  if (!/^[A-Za-z0-9._-]+$/.test(transactionId)) return { ok: false, reason: "Bootstrap activation transaction identity is unsafe." };
  const journalFile = path.join(path.dirname(root), `.intentos-bootstrap-${transactionId}.pending.json`);
  const issue = identityPathIssue(path.dirname(root), journalFile);
  const journal = issue ? null : readJson(journalFile);
  if (issue || !journal) return { ok: false, reason: issue || "Bootstrap activation journal is unavailable." };
  const { journal_digest: _digest, ...base } = journal;
  if (journal.journal_digest !== evidenceDigest(base, [])) return { ok: false, reason: "Bootstrap activation journal digest is invalid." };
  if (journal.transaction_id !== transactionId
    || journal.envelope_digest !== expectedEnvelope
    || journal.state !== "TARGET_COMMITTED_PENDING_ACTIVATION"
    || path.resolve(String(journal.target_root || "")) !== canonicalRoot) {
    return { ok: false, reason: "Bootstrap activation journal does not bind the current target and transaction." };
  }
  if (!processAlive(journal.owner_pid)) return { ok: false, reason: "Bootstrap activation owner process is no longer active." };
  if (journal.committed_tree_digest !== directoryDigest(root)) return { ok: false, reason: "Bootstrap activation target content changed after transaction commit." };
  return { ok: true, reason: "" };
}

function validPendingControlledUpdateIdentity(root, canonicalRoot) {
  const receiptRef = String(process.env.INTENTOS_CONTROLLED_UPDATE_ACTIVATION_RECEIPT || "");
  const capability = String(process.env.INTENTOS_CONTROLLED_UPDATE_ACTIVATION_CAPABILITY || "");
  const expectedRecordDigest = String(process.env.INTENTOS_CONTROLLED_UPDATE_ACTIVATION_RECORD_DIGEST || "");
  if (!receiptRef || !capability || !/^sha256:[a-f0-9]{64}$/.test(expectedRecordDigest)) {
    return { ok: false, reason: "No bounded controlled-update activation context is active." };
  }
  if (!safeProjectRelativePath(receiptRef)) return { ok: false, reason: "Controlled-update activation receipt path is unsafe." };
  const receiptFile = path.join(root, receiptRef);
  if (!fs.existsSync(receiptFile)) return { ok: false, reason: "Controlled-update activation receipt is unavailable." };
  const issue = identityPathIssue(root, receiptFile);
  const record = issue ? null : readJson(receiptFile);
  if (issue || !record) return { ok: false, reason: issue || "Controlled-update activation receipt is invalid." };
  const { record_digest: _digest, ...base } = record;
  if (record.record_digest !== expectedRecordDigest || record.record_digest !== evidenceDigest(base, [])) {
    return { ok: false, reason: "Controlled-update activation receipt digest is invalid." };
  }
  if (record.schema_version !== "1.109.0"
    || record.artifact_type !== "pending_controlled_update_activation"
    || path.resolve(String(record.canonical_root || "")) !== canonicalRoot
    || record.receipt_ref !== receiptRef
    || record.capability_digest !== rawSha256(capability)
    || record.boundary?.temporary_identity_only !== true
    || record.boundary?.authorizes_additional_writes !== false
    || record.boundary?.authorizes_release_or_production !== false) {
    return { ok: false, reason: "Controlled-update activation receipt is not bound to this target and capability." };
  }
  if (!processAlive(record.owner_pid)) return { ok: false, reason: "Controlled-update activation owner process is no longer active." };
  const expiresAt = Date.parse(String(record.expires_at || ""));
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || expiresAt - Date.now() > 5 * 60 * 1000) {
    return { ok: false, reason: "Controlled-update activation receipt is expired or has an invalid lifetime." };
  }
  const planBound = exactBoundJson(root, record.plan_ref, record.plan_file_digest);
  const approvalBound = exactBoundJson(root, record.approval_ref, record.approval_file_digest);
  const readinessBound = exactBoundJson(root, record.readiness_ref, record.readiness_file_digest);
  if (!planBound.ok || !approvalBound.ok || !readinessBound.ok) {
    return { ok: false, reason: planBound.error || approvalBound.error || readinessBound.error };
  }
  const plan = planBound.value;
  const approval = approvalBound.value;
  const readiness = readinessBound.value;
  let planCanonicalRoot = "";
  try { planCanonicalRoot = fs.realpathSync(String(plan.targetRoot || "")); } catch { planCanonicalRoot = ""; }
  if (plan.operation !== "UPDATE_WORKFLOW_ASSETS") return { ok: false, reason: "Controlled-update activation plan operation is invalid." };
  if (!["NEW_PROJECT", "EXISTING_PROJECT"].includes(plan.arguments?.projectEntryOrigin)) return { ok: false, reason: "Controlled-update activation plan origin is invalid." };
  if (planCanonicalRoot !== canonicalRoot) return { ok: false, reason: "Controlled-update activation plan target is invalid." };
  if (plan.receiptPath !== receiptRef) return { ok: false, reason: "Controlled-update activation receipt does not match the plan." };
  if (plan.planDigest !== record.plan_digest) return { ok: false, reason: "Controlled-update activation record does not match the plan digest." };
  if (plan.planDigest !== stablePlanDigest(plan)) return { ok: false, reason: "Controlled-update activation plan digest is invalid." };
  const executable = (plan.actions || []).filter((action) => action?.willWrite === true);
  const executableIds = executable.map((action) => action.id).sort();
  if (approval.approval_status !== "APPROVED"
    || approval.approved_plan?.plan_digest !== plan.planDigest
    || JSON.stringify([...(approval.approved_action_ids || [])].sort()) !== JSON.stringify(executableIds)
    || readiness.readiness_state !== "READY_FOR_HUMAN_APPROVED_APPLY"
    || readiness.apply_plan?.plan_digest !== plan.planDigest) {
    return { ok: false, reason: "Controlled-update activation approval or readiness binding is invalid." };
  }
  const expectedActions = executable
    .filter((action) => action.id !== plan.receiptActionId)
    .map((action) => ({ id: action.id, path: action.path, hash_after: action.expectedHashAfter, expected_hash_after: action.expectedHashAfter }));
  if (record.action_graph_digest !== evidenceDigest(record.applied_actions || [], [])
    || JSON.stringify(record.applied_actions || []) !== JSON.stringify(expectedActions)) {
    return { ok: false, reason: "Controlled-update activation action graph is invalid." };
  }
  for (const action of expectedActions) {
    if (!safeProjectRelativePath(action.path)) return { ok: false, reason: `Controlled-update action path is unsafe: ${action.path}` };
    const file = path.join(root, action.path);
    if (!fs.existsSync(file) || identityPathIssue(root, file) || canonicalFileDigest(file) !== action.hash_after) {
      return { ok: false, reason: `Controlled-update action is not applied exactly: ${action.id} ${action.path}` };
    }
  }
  return { ok: true, reason: "" };
}

function safeProjectRelativePath(value) {
  const normalized = String(value || "").replaceAll("\\", "/").replace(/^\.\//, "");
  return Boolean(normalized)
    && normalized !== "."
    && normalized !== ".."
    && !normalized.startsWith("../")
    && !path.posix.isAbsolute(normalized);
}

function rawSha256(value) {
  return `sha256:${createHash("sha256").update(String(value)).digest("hex")}`;
}

function stablePlanDigest(plan) {
  return rawSha256(JSON.stringify(sortStable(omitPlanDigest(plan))));
}

function omitPlanDigest(value) {
  if (Array.isArray(value)) return value.map(omitPlanDigest);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== "planDigest")
    .map(([key, child]) => [key, omitPlanDigest(child)]));
}

function sortStable(value) {
  if (Array.isArray(value)) return value.map(sortStable);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortStable(value[key])]));
}

function bridgeIdentity(root, sourceRoot, topology) {
  const bridgeRef = ".intentos-bridge.json";
  const bridgeFile = path.join(root, bridgeRef);
  const markerRefs = ["AGENTS.md", "agent.md"].filter((ref) => {
    const file = path.join(root, ref);
    if (!fs.existsSync(file) || identityPathIssue(root, file)) return false;
    return /IntentOS Collaboration Layer|IntentOS Operating Mode/i.test(fs.readFileSync(file, "utf8"));
  });
  if (!fs.existsSync(bridgeFile)) {
    return markerRefs.length > 0
      ? { state: "CONFLICTED", agent_ref: markerRefs[0], evidence_refs: [], reason: "IntentOS marker text is not an approved collaboration-bridge identity." }
      : { state: "ABSENT", agent_ref: "N/A", evidence_refs: [] };
  }
  const issue = identityPathIssue(root, bridgeFile);
  if (issue) return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: issue };
  const record = readJson(bridgeFile);
  if (!record || record.schema_version !== "1.109.0" || record.artifact_type !== "intentos_collaboration_bridge") {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: "Collaboration bridge record is missing or malformed." };
  }
  const required = ["canonical_root", "intentos_source_version", "entry_ref", "entry_digest", "guidance_digest", "approval_ref", "approval_digest", "apply_receipt_ref", "apply_receipt_digest", "invalidation_conditions", "bridge_digest"];
  if (required.some((field) => record[field] === undefined)) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: "Collaboration bridge record is incomplete." };
  }
  const canonicalRoot = topology.canonical_target;
  if (path.resolve(String(record.canonical_root)) !== canonicalRoot) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: "Collaboration bridge canonical root does not match the target." };
  }
  const sourceVersion = readJson(path.join(sourceRoot, "package.json"))?.version || "UNKNOWN";
  if (String(record.intentos_source_version) !== String(sourceVersion)) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: "Collaboration bridge IntentOS version is stale." };
  }
  const entryRef = String(record.entry_ref);
  if (!markerRefs.includes(entryRef)) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: "Collaboration bridge entry is not the current project-owned Agent entry." };
  }
  const entryFile = path.join(root, entryRef);
  if (digestFile(entryFile) !== record.entry_digest) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: "Collaboration bridge entry content changed after approval." };
  }
  let currentGuidance;
  try {
    const authority = loadReviewContextAuthority(sourceRoot);
    const graph = effectiveGuidanceGraph(authority, false, sourceRoot);
    const invalidNodes = graph.nodes.filter((node) => node.file_state !== "CURRENT");
    const guidanceBase = {
      state: invalidNodes.length === 0 ? "CURRENT" : "INVALID",
      source: "INTENTOS_SOURCE",
      binding: reviewContextBinding(authority),
      graph_digest: evidenceDigest(graph, []),
      active_path_count: graph.activePaths.length,
      missing_paths: invalidNodes.map((node) => node.path),
      invalid_nodes: invalidNodes.map((node) => ({ path: node.path, state: node.file_state })),
      cycles: graph.cycles || [],
    };
    currentGuidance = evidenceDigest(guidanceBase, []);
  } catch (error) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: `Collaboration bridge Guidance cannot be resolved: ${error.message}` };
  }
  if (record.guidance_digest !== currentGuidance) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: "Collaboration bridge Guidance digest is stale." };
  }
  const approval = exactBoundJson(root, record.approval_ref, record.approval_digest);
  const receipt = exactBoundJson(root, record.apply_receipt_ref, record.apply_receipt_digest);
  if (!approval.ok || approval.value?.artifact_type !== "approval_record" || approval.value?.approval_status !== "APPROVED" || Date.parse(approval.value?.expires_at || "") <= Date.now()) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: `Collaboration bridge approval is invalid: ${approval.error || "not current and approved"}` };
  }
  if (!receipt.ok || receipt.value?.artifact_type !== "apply_execution_receipt" || receipt.value?.receipt_state !== "APPLY_VERIFIED" || receipt.value?.outcome !== "APPLY_VERIFIED") {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: `Collaboration bridge apply receipt is invalid: ${receipt.error || "apply was not verified"}` };
  }
  const approvedPaths = (approval.value.approved_action_paths || []).flatMap((item) => item.target_paths || []);
  const appliedPaths = (receipt.value.actions || []).filter((item) => ["APPLIED", "SKIPPED"].includes(item.result)).flatMap((item) => item.target_paths || []);
  if (!approvedPaths.includes(entryRef) || !appliedPaths.includes(entryRef)) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: "Collaboration bridge entry is not bound to the approved and verified action graph." };
  }
  const base = { ...record };
  delete base.bridge_digest;
  if (record.bridge_digest !== evidenceDigest(base, [])) {
    return { state: "CONFLICTED", agent_ref: bridgeRef, evidence_refs: [], reason: "Collaboration bridge digest is not canonical." };
  }
  return {
    state: "CURRENT",
    agent_ref: entryRef,
    evidence_refs: [bridgeRef, String(record.approval_ref), String(record.apply_receipt_ref)],
    source_version: sourceVersion,
    bridge_digest: record.bridge_digest,
  };
}

function exactBoundJson(root, relativeRef, expectedDigest) {
  const ref = String(relativeRef || "");
  const file = path.join(root, ref);
  if (!ref || !fs.existsSync(file)) return { ok: false, value: null, error: `${ref || "evidence ref"} is missing` };
  const issue = identityPathIssue(root, file);
  if (issue) return { ok: false, value: null, error: issue };
  if (digestFile(file) !== expectedDigest) return { ok: false, value: null, error: `${ref} digest mismatch` };
  const value = readJsonOrFencedJson(file);
  return value ? { ok: true, value, error: "" } : { ok: false, value: null, error: `${ref} does not contain one JSON object` };
}

function readJsonOrFencedJson(file) {
  const content = fs.readFileSync(file, "utf8");
  try { return JSON.parse(content); } catch {
    const matches = [...content.matchAll(/```json\s*([\s\S]*?)```/gi)];
    if (matches.length !== 1) return null;
    try { return JSON.parse(matches[0][1]); } catch { return null; }
  }
}

function digestFile(file) {
  return evidenceDigest(fs.readFileSync(file).toString("base64"), []);
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function guidanceBindingFor({ targetRoot, sourceRoot, identity }) {
  const installed = identity.form === "INSTALLED";
  const authorityRoot = installed ? targetRoot : sourceRoot;
  try {
    const authority = loadReviewContextAuthority(authorityRoot);
    const graph = effectiveGuidanceGraph(authority, installed, authorityRoot);
    const invalidNodes = graph.nodes.flatMap((node) => {
      if (node.file_state !== "CURRENT") return [{ ...node, conflict_codes: [] }];
      const file = path.join(authorityRoot, node.path);
      const conflicts = analyzeActiveGuidanceConflicts(fs.readFileSync(file, "utf8"));
      return conflicts.length > 0
        ? [{ ...node, file_state: "SEMANTIC_CONFLICT", conflict_codes: conflicts.map((item) => item.code) }]
        : [];
    });
    const missing = invalidNodes.map((node) => node.path);
    const cycles = graph.cycles || [];
    const base = {
      state: invalidNodes.length === 0 && cycles.length === 0 ? "CURRENT" : "INVALID",
      source: installed ? "PROJECT_INSTALLED" : "INTENTOS_SOURCE",
      binding: reviewContextBinding(authority),
      graph_digest: evidenceDigest(graph, []),
      active_path_count: graph.activePaths.length,
      missing_paths: missing,
      invalid_nodes: invalidNodes.map((node) => ({ path: node.path, state: node.file_state, conflict_codes: node.conflict_codes || [] })),
      cycles,
    };
    return { ...base, guidance_digest: evidenceDigest(base, []) };
  } catch (error) {
    return { state: "INVALID", source: installed ? "PROJECT_INSTALLED" : "INTENTOS_SOURCE", binding: null, graph_digest: "", active_path_count: 0, missing_paths: [], guidance_digest: "", reason: error.message };
  }
}

function identityPathIssue(root, file) {
  const canonicalRoot = fs.realpathSync(root);
  const relative = path.relative(root, file);
  if (!relative || relative === "." || relative.startsWith("..") || path.isAbsolute(relative)) {
    return "Identity source escapes the canonical project root.";
  }
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) {
      return `Identity source cannot be inspected safely: ${error.message}`;
    }
    if (stat.isSymbolicLink()) return `Identity source contains a symbolic-link component: ${path.relative(root, current)}`;
  }
  const finalStat = fs.lstatSync(file);
  if (!finalStat.isFile()) return "Identity source must be a regular file.";
  const realFile = fs.realpathSync(file);
  if (realFile !== canonicalRoot && !realFile.startsWith(`${canonicalRoot}${path.sep}`)) {
    return "Identity source resolves outside the canonical project root.";
  }
  return "";
}

function directoryDigest(root) {
  if (!fs.existsSync(root)) return evidenceDigest({ state: "ABSENT" }, []);
  const rows = [];
  walkDirectory(root, root, rows);
  return evidenceDigest(rows, []);
}

function walkDirectory(root, current, rows) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === ".git") continue;
    const full = path.join(current, entry.name);
    const relative = path.relative(root, full).replaceAll(path.sep, "/");
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) rows.push({ path: relative, type: "symlink", target: fs.readlinkSync(full) });
    else if (stat.isDirectory()) {
      rows.push({ path: relative, type: "directory" });
      walkDirectory(root, full, rows);
    } else if (stat.isFile()) rows.push({ path: relative, type: "file", size: stat.size, digest: evidenceDigest(fs.readFileSync(full).toString("base64"), []) });
  }
}

function processAlive(pid) {
  if (!Number.isInteger(Number(pid)) || Number(pid) < 1) return false;
  try { process.kill(Number(pid), 0); return true; } catch { return false; }
}

function allowedOperation(entryState, executionIntent) {
  if (entryState === "BLOCKED_REPAIR_REQUIRED") return "READ_ONLY_REPAIR";
  if (entryState === "READY_FOR_CONTROLLED_SETUP") return executionIntent === "READ_ONLY" ? "READ_ONLY_ASSESSMENT" : "CONTROLLED_SETUP_OR_ADOPTION_REVIEW";
  if (entryState === "READY_FOR_INTENTOS_OPERATION") return "ROUTINE_INTENTOS_OPERATION";
  return "READ_ONLY_ASSESSMENT";
}
