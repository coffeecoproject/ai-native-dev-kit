export const projectAssetLifecycles = Object.freeze({
  INTENTOS_MANAGED_REFRESH: "INTENTOS_MANAGED_REFRESH",
  PROJECT_OWNED_AFTER_BOOTSTRAP: "PROJECT_OWNED_AFTER_BOOTSTRAP",
});

export const projectOwnedPreservationAction = "PRESERVE_PROJECT_OWNED";

export const projectOwnedAfterBootstrapPaths = Object.freeze([
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
  "docs/verification-matrix.md",
  "docs/engineering-baseline.md",
  "docs/environment-baseline.md",
  "docs/baseline-selection.md",
  "docs/baseline-evidence.md",
]);

const projectOwnedAfterBootstrapPathSet = new Set(projectOwnedAfterBootstrapPaths);

function normalizeProjectAssetPath(value) {
  return String(value || "")
    .replaceAll("\\", "/")
    .replace(/^\.\//, "")
    .replace(/\/$/, "");
}

export function isProjectOwnedAfterBootstrapPath(value) {
  return projectOwnedAfterBootstrapPathSet.has(normalizeProjectAssetPath(value));
}

export function projectAssetLifecycle(value) {
  return isProjectOwnedAfterBootstrapPath(value)
    ? projectAssetLifecycles.PROJECT_OWNED_AFTER_BOOTSTRAP
    : projectAssetLifecycles.INTENTOS_MANAGED_REFRESH;
}
