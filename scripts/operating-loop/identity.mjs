import { arrayValue, sha256 } from "./shared.mjs";

export function buildProjectIdentityProjection(context) {
  const workflow = context.workflowNext.value || {};
  const facts = workflow.projectFactProjection || {};
  const evidenceIdentity = facts.project_identity || { kind: "UNKNOWN", fingerprint: "", revision: "" };
  const projectKind = projectKindForEntry(context.projectEntry);
  const behavioralAdoptionState = String(facts.behavioral_adoption?.state || "UNKNOWN");
  const governanceState = String(facts.governance_authority_posture?.state || "UNKNOWN");
  const governancePosture = behavioralAdoptionState === "VERIFIED_ACTIVE"
    ? "INTENTOS_ACTIVE_GOVERNANCE"
    : projectKind === "NEW_PROJECT"
      ? "NOT_ESTABLISHED"
    : projectKind === "INTENTOS_SOURCE"
      ? "INTENTOS_SOURCE_GOVERNANCE"
      : governanceState === "DECLARED_STRONG_GOVERNED"
        ? "PRODUCTION_GOVERNED"
        : governanceState === "DECLARED_GOVERNED" ? "GOVERNED"
          : governanceState === "LIGHT" ? "LIGHT_GOVERNANCE" : "UNKNOWN";
  const lifecycle = facts.lifecycle || { state: "UNKNOWN", confidence: "UNKNOWN" };
  const productionPosture = lifecycle.state === "PRODUCTION_ACTIVE"
    ? lifecycle.confidence === "DECLARED" ? "POSSIBLE_PRODUCTION" : "PRODUCTION_SENSITIVE"
    : projectKind === "NEW_PROJECT" ? "NOT_ESTABLISHED" : projectKind === "INTENTOS_SOURCE" ? "NOT_APPLICABLE" : "NOT_ASSESSED";
  const git = facts.current_work_continuity?.git || {};
  const worktreePosture = git.observation_status === "FAILED"
    ? "UNKNOWN"
    : git.mode === "GIT" ? ((git.changed_paths || []).length > 0 ? "DIRTY" : "CLEAN") : "NON_GIT";
  const conflicts = (facts.conflicts || []).map((item) => item.reason || item.conflict_id).filter(Boolean);
  const projectionStatus = context.sourceFailure
    ? "BLOCKED_BY_SOURCE_READ"
    : projectKind === "UNKNOWN_PROJECT" ? "UNKNOWN"
      : conflicts.length > 0 ? "CONFLICTED" : "CURRENT";
  const confidence = projectionStatus !== "CURRENT" ? "LOW" : facts.projection_digest ? "HIGH" : "LOW";
  const sourceInputs = [
    {
      sourceSystem: "PROJECT_FACT_PROJECTION",
      ref: "workflow-next:projectFactProjection",
      outcome: facts.projection_digest ? "CURRENT" : "MISSING",
      readStatus: facts.projection_digest ? "CURRENT_RUN" : "FAILED",
      semanticDigest: String(facts.projection_digest || "N/A"),
    },
  ];
  const authoritySources = facts.authority_inventory?.sources || [];
  const productionRefs = authoritySources
    .filter((item) => /release|rollback|production|deploy/i.test(String(item.source_ref || "")))
    .map((item) => item.source_ref);
  const observedSignals = {
    governanceSignalCount: authoritySources.length,
    productionSignalCount: productionRefs.length,
    governanceRefs: authoritySources.map((item) => item.source_ref).sort().slice(0, 12),
    productionRefs: productionRefs.sort().slice(0, 12),
  };
  const intentosPosture = {
    workflowState: String(workflow.workflowState || "UNKNOWN"),
    versionState: String(workflow.versionState || "UNKNOWN"),
    operatingMode: String(workflow.intentosOperatingMode || (projectKind === "INTENTOS_SOURCE" ? "NOT_APPLICABLE" : "UNKNOWN")),
    adoptionMode: String(workflow.adoptionMode || "UNKNOWN"),
    assetMigrationDepth: String(workflow.projectAssetMigrationDepth || "UNKNOWN"),
  };
  const baselinePosture = {
    onboardingState: String(workflow.onboardingState || "UNKNOWN"),
    platformBaselineState: String(workflow.platformBaselineState || "UNKNOWN"),
    industrialBaselineState: String(workflow.industrialBaselineState || "UNKNOWN"),
    baselineLevel: String(workflow.baselineLevel || "NOT_SELECTED"),
    selectedProfiles: arrayValue(workflow.selectedProfiles).sort(),
    selectedIndustrialPacks: arrayValue(workflow.selectedIndustrialPacks).sort(),
  };
  const digestPayload = {
    contractVersion: "1.109.0",
    projectKind,
    entryState: context.projectEntry,
    governancePosture,
    behavioralAdoptionState,
    productionPosture,
    worktreePosture,
    intentosPosture,
    baselinePosture,
    evidenceIdentity,
    observedSignals,
    projectionStatus,
    confidence,
    conflicts,
    sourceInputs,
  };
  return {
    contractVersion: "1.109.0",
    derivedOnly: "Yes",
    grantsAuthority: "No",
    writesProjectFiles: "No",
    projectKind,
    entryState: context.projectEntry,
    governancePosture,
    behavioralAdoptionState,
    productionPosture,
    worktreePosture,
    intentosPosture,
    baselinePosture,
    evidenceIdentity,
    observedSignals,
    projectionStatus,
    confidence,
    conflicts,
    sourceInputs,
    projectionDigest: `sha256:${sha256(JSON.stringify(digestPayload))}`,
    invalidationConditions: [
      "project root or Git revision changes",
      "project entry or observed governance signals change",
      "worktree cleanliness changes",
      "selected platform or baseline state changes",
      "a source input digest changes or source read fails",
    ],
  };
}
export function projectKindForEntry(entryState) {
  if (entryState === "NEW_PROJECT_ENTRY") return "NEW_PROJECT";
  if (["EXISTING_PROJECT_ENTRY", "GOVERNED_PROJECT_ENTRY", "PRODUCTION_SENSITIVE_ENTRY"].includes(entryState)) return "EXISTING_PROJECT";
  if (entryState === "INTENTOS_SOURCE_ENTRY") return "INTENTOS_SOURCE";
  return "UNKNOWN_PROJECT";
}

export function projectKindForSourceState(state) {
  if (state === "NEW_PROJECT") return "NEW_PROJECT";
  if (state === "INTENTOS_REPOSITORY") return "INTENTOS_SOURCE";
  if ([
    "EXISTING_PROJECT",
    "EXISTING_LIGHT_PROJECT",
    "EXISTING_GOVERNED_PROJECT",
    "PRODUCTION_SENSITIVE_PROJECT",
    "DIRTY_WORKTREE_PROJECT",
    "BOOTSTRAPPED_PROJECT",
    "PARTIALLY_BOOTSTRAPPED_PROJECT",
  ].includes(state)) return "EXISTING_PROJECT";
  return "UNKNOWN_PROJECT";
}

export function governancePostureFor(entryState, projectStateTags, signals) {
  if (entryState === "INTENTOS_SOURCE_ENTRY") return "INTENTOS_SOURCE_GOVERNANCE";
  if (entryState === "NEW_PROJECT_ENTRY") return "NOT_ESTABLISHED";
  if (projectStateTags.includes("PRODUCTION_GOVERNED_PROJECT") || signals?.isProductionGoverned) return "PRODUCTION_GOVERNED";
  if (projectStateTags.includes("GOVERNED_EXISTING_PROJECT") || signals?.isGovernedExisting) return "GOVERNED";
  if (["EXISTING_PROJECT_ENTRY", "GOVERNED_PROJECT_ENTRY", "PRODUCTION_SENSITIVE_ENTRY"].includes(entryState)) return "LIGHT_GOVERNANCE";
  return "UNKNOWN";
}

export function productionPostureFor(projectKind, governancePosture, projectStateTags, signals) {
  if (projectKind === "INTENTOS_SOURCE") return "NOT_APPLICABLE";
  if (projectKind === "NEW_PROJECT") return "NOT_ESTABLISHED";
  if (governancePosture === "PRODUCTION_GOVERNED"
    || projectStateTags.includes("PRODUCTION_GOVERNED_PROJECT")
    || signals?.isProductionGoverned
    || arrayValue(signals?.productionSignals).length > 0) return "PRODUCTION_SENSITIVE";
  if (projectKind === "EXISTING_PROJECT") return "NO_PRODUCTION_EVIDENCE";
  return "UNKNOWN";
}

export function projectIdentityConflicts(context) {
  const conflicts = [];
  const guidanceKind = projectKindForSourceState(String(context.guidanceProjectState || "UNKNOWN_PROJECT"));
  if (guidanceKind !== "UNKNOWN_PROJECT" && context.projectKind !== "UNKNOWN_PROJECT" && guidanceKind !== context.projectKind) {
    conflicts.push(`Workflow Guidance describes ${guidanceKind} while Project Entry describes ${context.projectKind}`);
  }
  if (context.projectKind === "NEW_PROJECT" && arrayValue(context.governanceSignals?.basicSignals).length > 0) {
    conflicts.push("New-project entry conflicts with observed project-owned governance signals");
  }
  if (context.productionPosture === "PRODUCTION_SENSITIVE"
    && arrayValue(context.governanceSignals?.productionSignals).length === 0) {
    conflicts.push("Production-sensitive posture has no current production-signal reference");
  }
  if ((context.evidenceIdentity.kind === "GIT") !== Boolean(context.git.isGitRepository)) {
    conflicts.push("Evidence Authority and current Git observation disagree on repository kind");
  }
  return conflicts;
}

export function confidenceForProjection(context) {
  if (context.projectionStatus !== "CURRENT" || context.projectKind === "UNKNOWN_PROJECT") return "LOW";
  if (context.governancePosture === "UNKNOWN") return "MEDIUM";
  if (!["BASELINE_READY", "NOT_APPLICABLE"].includes(context.platformBaselineState)
    && context.projectKind === "EXISTING_PROJECT") return "MEDIUM";
  return "HIGH";
}
