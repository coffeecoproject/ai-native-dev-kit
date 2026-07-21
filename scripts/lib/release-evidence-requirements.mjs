const matrix = Object.freeze({
  source_review: ["completion-evidence"],
  preview: ["completion-evidence", "build-or-preview-evidence", "runtime-smoke", "release-owner"],
  internal_trial: ["completion-evidence", "runtime-smoke", "rollback", "release-owner"],
  staging: ["completion-evidence", "environment-config", "runtime-smoke", "monitoring", "rollback", "release-owner"],
  production_review: ["completion-evidence", "release-owner", "risk-owner", "environment-owner", "rollback", "monitoring", "runtime-smoke", "incident-owner", "data-migration-decision", "release-handoff-pack"],
  app_store_review: ["completion-evidence", "platform-recipe", "release-owner", "risk-owner", "environment-owner", "runtime-smoke", "rollback", "release-handoff-pack"],
  mini_program_review: ["completion-evidence", "platform-recipe", "release-owner", "risk-owner", "environment-owner", "runtime-smoke", "rollback", "release-handoff-pack"],
  unknown: ["release-target", "release-owner"],
});

export function releaseEvidenceRequirementsFor(target) {
  const normalized = Object.hasOwn(matrix, target) ? target : "unknown";
  return {
    target,
    required_evidence_ids: [...matrix[normalized]],
  };
}
