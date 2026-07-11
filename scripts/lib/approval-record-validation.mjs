import path from "node:path";

export const nonHumanApproverPattern = /\b(Codex|AI|LLM|model|reviewer|subagent|automation|system|bot)\b/i;
export const ambiguousHumanApproverPattern = /^(human|owner|user|the user|someone|somebody|stakeholder|team|project team|approver|not specified|unknown|tbd|n\/a)$/i;
export const currentConversationUserIdentity = "CURRENT_CONVERSATION_USER";

const unsafePathPattern = /(^\/|^~\/|^[A-Za-z]:\\|(^|\/)\.\.(\/|$)|\\|[*?\[\]{}]|\bsymlink:)/i;

export function isSpecificHumanApprover(value) {
  const text = String(value || "").trim();
  if (text === currentConversationUserIdentity) return true;
  return Boolean(text) && !nonHumanApproverPattern.test(text) && !ambiguousHumanApproverPattern.test(text);
}

export function validateSpecificHumanApprover(value, label = "approval record") {
  if (isSpecificHumanApprover(value)) return [];
  return [`${label} approved_by must identify the current conversation user or another specific human confirmer`];
}

export function parseApprovalExpiry(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function validateFutureApprovalExpiry(value, label = "approval record") {
  const timestamp = parseApprovalExpiry(value);
  if (!Number.isFinite(timestamp)) return [`${label} expires_at must be a parseable date/time`];
  if (timestamp <= Date.now()) return [`${label} is expired and must be re-approved`];
  return [];
}

export function normalizePathList(paths) {
  return (Array.isArray(paths) ? paths : [])
    .map((item) => String(item || "").trim().replaceAll(path.sep, "/"))
    .filter(Boolean)
    .sort();
}

export function sameSet(left, right) {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

export function validateBoundedTargetPaths(paths, label = "approval record target paths") {
  const normalized = normalizePathList(paths);
  if (normalized.length === 0) return [`${label} must include at least one exact target path`];
  return normalized.flatMap((targetPath) => (isSafeRelativePath(targetPath) ? [] : [`${label} contains unsafe or non-exact path: ${targetPath}`]));
}

export function validateApprovalActionPathRows(approvalEvidence, options = {}) {
  const label = options.label || "approval record";
  const expectedActions = Array.isArray(options.expectedActions) ? options.expectedActions : null;
  const errors = [];
  const approvedIds = Array.isArray(approvalEvidence?.approved_action_ids)
    ? approvalEvidence.approved_action_ids.map(String).filter(Boolean)
    : [];
  const approvedPathRows = Array.isArray(approvalEvidence?.approved_action_paths)
    ? approvalEvidence.approved_action_paths
    : [];
  const pathRowIds = approvedPathRows.map((item) => String(item?.id || "")).filter(Boolean);

  if (!sameSet(approvedIds, pathRowIds)) {
    errors.push(`${label} approved_action_ids must exactly match approved_action_paths row IDs`);
  }

  for (const row of approvedPathRows) {
    errors.push(...validateBoundedTargetPaths(row?.target_paths, `${label} approved_action_paths[${String(row?.id || "<missing>")}]`));
  }

  if (expectedActions) {
    const expectedIds = expectedActions.map((action) => String(action.id || "")).filter(Boolean);
    if (!sameSet(expectedIds, approvedIds)) {
      errors.push(`${label} approved_action_ids must exactly match executable plan actions: expected ${expectedIds.join(", ") || "<none>"}`);
    }
    const approvedById = new Map(approvedPathRows.map((item) => [String(item?.id || ""), normalizePathList(item?.target_paths)]));
    for (const action of expectedActions) {
      const expectedPaths = normalizePathList(action.targetPaths);
      const approvedPaths = approvedById.get(String(action.id || "")) || [];
      if (!sameSet(expectedPaths, approvedPaths)) {
        errors.push(`${label} target paths for ${action.id} must exactly match plan paths: expected ${expectedPaths.join(", ")}`);
      }
    }
  }

  return errors;
}

export function validateApprovalEvidenceForActionSet(approvalEvidence, options = {}) {
  const label = options.label || "approval record";
  const errors = [];
  if (!approvalEvidence || typeof approvalEvidence !== "object") return [`${label} evidence is required`];

  if (approvalEvidence.approval_status !== "APPROVED") errors.push(`${label} must be APPROVED`);
  if (approvalEvidence.approval_owner_type !== "HUMAN") errors.push(`${label} approval_owner_type must be HUMAN`);
  errors.push(...validateSpecificHumanApprover(approvalEvidence.approved_by, label));

  if (options.planDigest && approvalEvidence.approved_plan?.plan_digest !== options.planDigest) {
    errors.push(`${label} approved_plan.plan_digest must match current apply plan digest`);
  }
  if (approvalEvidence.plan_changed_after_approval !== false) errors.push(`${label} must confirm plan_changed_after_approval is false`);
  if (approvalEvidence.rollback_reviewed !== true) errors.push(`${label} must acknowledge rollback review`);
  if (approvalEvidence.verification_reviewed !== true) errors.push(`${label} must acknowledge verification review`);
  if (approvalEvidence.risk_acceptance?.high_risk_action_included !== false) errors.push(`${label} must exclude high-risk actions`);
  if (approvalEvidence.risk_acceptance?.human_only_action_included !== false) errors.push(`${label} must exclude human-only actions`);
  errors.push(...validateFutureApprovalExpiry(approvalEvidence.expires_at, label));
  if (approvalEvidence.boundary && Object.values(approvalEvidence.boundary).some((value) => value !== false)) {
    errors.push(`${label} boundary must keep all authority flags false`);
  }
  errors.push(...validateApprovalActionPathRows(approvalEvidence, {
    label,
    expectedActions: options.expectedActions,
  }));
  return errors;
}

function isSafeRelativePath(value) {
  const text = String(value || "").trim();
  if (!text || unsafePathPattern.test(text)) return false;
  if (path.isAbsolute(text) || text.startsWith("~")) return false;
  const normalized = path.posix.normalize(text.replaceAll("\\", "/"));
  if (normalized === "." || normalized === ".." || normalized.startsWith("../") || normalized.includes("/../")) return false;
  return /[\w.-]+\/[\w./-]+|\.[\w./-]+|[\w.-]+\.[A-Za-z0-9]+/.test(text);
}
