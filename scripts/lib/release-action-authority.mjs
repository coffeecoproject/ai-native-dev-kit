const codexActionForStep = new Map([
  ["VERIFY", "VERIFY"],
  ["BUILD", "BUILD"],
  ["PACKAGE", "PACKAGE"],
  ["EVIDENCE_CAPTURE", "EVIDENCE_CAPTURE"],
  ["HANDOFF_PREPARATION", "HANDOFF_PREPARATION"],
  ["POST_LAUNCH_SMOKE", "POST_RELEASE_READ_ONLY_SMOKE"],
  ["ROLLBACK_READY", "HANDOFF_PREPARATION"],
]);

export const externallyOwnedReleaseSteps = new Set([
  "DEPLOY_OR_SUBMIT",
  "PRODUCTION_DEPLOY",
  "STORE_SUBMISSION",
  "MINI_PROGRAM_RELEASE",
  "PRODUCTION_MIGRATION",
  "ROLLBACK_EXECUTION",
]);

export function normalizedReleaseAction(value) {
  return String(value || "").trim().replaceAll("`", "").toUpperCase();
}

export function expectedReleaseStepExecutor(mode, stepAction, allowedCodexActions = [], blockedActions = []) {
  const action = normalizedReleaseAction(stepAction);
  if (mode !== "ASSISTED_EXECUTION") return "HUMAN_REQUIRED";
  if (externallyOwnedReleaseSteps.has(action)) return "HUMAN_REQUIRED";

  const requiredAction = codexActionForStep.get(action);
  if (!requiredAction) return "HUMAN_REQUIRED";
  const allowed = new Set((allowedCodexActions || []).map(normalizedReleaseAction));
  const blocked = new Set((blockedActions || []).map(normalizedReleaseAction));
  if (!allowed.has(requiredAction) || blocked.has(requiredAction) || blocked.has(action)) return "HUMAN_REQUIRED";
  return "CODEX_MAY_RUN_AFTER_APPROVAL";
}

export function releaseStepAuthorityErrors({ mode, stepAction, executor, allowedCodexActions, blockedActions }) {
  const action = normalizedReleaseAction(stepAction);
  const actual = normalizedReleaseAction(executor);
  const expected = expectedReleaseStepExecutor(mode, action, allowedCodexActions, blockedActions);
  const errors = [];

  if (actual !== expected) {
    errors.push(`release step ${action || "<missing>"} executor ${actual || "<missing>"} must be ${expected}`);
  }
  if (externallyOwnedReleaseSteps.has(action) && actual !== "HUMAN_REQUIRED") {
    errors.push(`release step ${action} is an external real-world effect and cannot be assigned to Codex`);
  }
  return errors;
}
