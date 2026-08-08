import { evidenceDigest } from "./artifact-schema.mjs";

const schemaVersion = "1.0.0";
const completeRuleScanStates = new Set([
  "COMPLETE_NO_ACTIONABLE_RULES",
  "COMPLETE_ACTIONABLE_RULES",
]);
const currentProfileStates = new Set(["CURRENT", "NOT_APPLICABLE"]);
const currentPlanStates = new Set(["CURRENT", "READY"]);
const verifiedApplyStates = new Set(["APPLY_VERIFIED", "VERIFIED"]);
const verifiedActivationStates = new Set([
  "READY_FOR_INTENTOS_OPERATION",
  "VERIFIED_ACTIVE",
]);

export const existingProjectAdoptionStates = Object.freeze({
  READ_ONLY_DISCOVERY_REQUIRED: "READ_ONLY_DISCOVERY_REQUIRED",
  PROFILE_RECONCILIATION_REQUIRED: "PROFILE_RECONCILIATION_REQUIRED",
  PROFILE_RECONCILIATION_BLOCKED: "PROFILE_RECONCILIATION_BLOCKED",
  ADOPTION_SAFETY_BOUNDARY_REQUIRED: "ADOPTION_SAFETY_BOUNDARY_REQUIRED",
  SELECTED_ASSETS_PLAN_REQUIRED: "SELECTED_ASSETS_PLAN_REQUIRED",
  CONTROLLED_APPLY_REQUIRED: "CONTROLLED_APPLY_REQUIRED",
  ACTIVATION_VERIFICATION_REQUIRED: "ACTIVATION_VERIFICATION_REQUIRED",
  VERIFIED_ACTIVE: "VERIFIED_ACTIVE",
  BLOCKED_INVALID_PROJECT_BINDING: "BLOCKED_INVALID_PROJECT_BINDING",
  BLOCKED_NO_PROGRESS: "BLOCKED_NO_PROGRESS",
});

export const existingProjectGovernanceStates = Object.freeze({
  GOVERNANCE_SCAN_PENDING: "GOVERNANCE_SCAN_PENDING",
  GOVERNANCE_DECISION_BACKLOG: "GOVERNANCE_DECISION_BACKLOG",
  GOVERNANCE_DECISIONS_INVALID: "GOVERNANCE_DECISIONS_INVALID",
  GOVERNANCE_CURRENT: "GOVERNANCE_CURRENT",
});

export const existingProjectGovernanceReadinessStates = Object.freeze({
  CURRENT: "CURRENT",
  BOUNDED_NON_BLOCKING: "BOUNDED_NON_BLOCKING",
  BLOCKED_UNBOUNDED: "BLOCKED_UNBOUNDED",
});

export function assessExistingProjectGovernanceBacklog(input = {}) {
  const coverage = input.reconciliationCoverage || {};
  const nativeEvidence = input.nativeEvidence || {};
  const packet = input.packet;
  const omittedRules = nonNegativeInteger(coverage.omittedRules);
  const scanState = stateToken(coverage.scanState, "UNKNOWN");
  const decisionState = stateToken(input.blockDecisionResolution?.state, "NOT_PROVIDED");

  if (decisionState === "INVALID") {
    return governanceReadiness(
      existingProjectGovernanceReadinessStates.BLOCKED_UNBOUNDED,
      omittedRules,
      ["The native-rule decision artifact is invalid or stale."],
    );
  }

  if (completeRuleScanStates.has(scanState) && omittedRules === 0) {
    return governanceReadiness(
      existingProjectGovernanceReadinessStates.CURRENT,
      0,
      ["Existing project governance discovery is complete."],
    );
  }

  const packetErrors = validateBoundedGovernancePacket(packet, nativeEvidence, omittedRules);
  if (scanState === "INCOMPLETE_RULE_SCAN" && packetErrors.length === 0) {
    return governanceReadiness(
      existingProjectGovernanceReadinessStates.BOUNDED_NON_BLOCKING,
      packet.required_decisions,
      ["Every unresolved semantic block is preserved in one current project-bound governance backlog."],
      packet.packet_digest,
    );
  }

  return governanceReadiness(
    existingProjectGovernanceReadinessStates.BLOCKED_UNBOUNDED,
    omittedRules,
    [
      "Existing project governance discovery is incomplete without an exact current backlog boundary.",
      ...packetErrors,
    ],
  );
}

export function assessExistingProjectProfileReconciliation(input = {}) {
  const declaredProfiles = list(input.declaredProfiles);
  const observedProfiles = list(input.projectEvidence?.profiles);
  const proposedProfiles = list(input.proposedProfiles?.length > 0
    ? input.proposedProfiles
    : [...declaredProfiles, ...observedProfiles]);
  const additions = proposedProfiles.filter((profile) => !declaredProfiles.includes(profile));
  const removals = declaredProfiles.filter((profile) => !proposedProfiles.includes(profile));
  const unsupportedAdditions = additions.filter((profile) => !observedProfiles.includes(profile));
  const inspectionStatus = stateToken(input.projectEvidence?.inspectionStatus, "NOT_RUN");
  let state = "CURRENT";
  let reason = "Documented and proposed profiles already match.";
  if (inspectionStatus !== "COMPLETE") {
    state = "INCOMPLETE";
    reason = "Project profile evidence inspection is incomplete.";
  } else if (removals.length > 0 || unsupportedAdditions.length > 0) {
    state = "CONFLICT";
    reason = "The proposed profile selection is subtractive or lacks exact observed project evidence.";
  } else if (additions.length > 0) {
    state = "ADDITIVE_RECONCILIATION_REQUIRED";
    reason = "Observed project evidence supports an additive profile reconciliation.";
  }
  const base = {
    state,
    declared_profiles: declaredProfiles,
    observed_profiles: observedProfiles,
    proposed_profiles: proposedProfiles,
    additions,
    removals,
    unsupported_additions: unsupportedAdditions,
    inspection_status: inspectionStatus,
    evidence: profileEvidenceFor(input.projectEvidence?.profileSignals, additions),
    human_decision_required: state === "CONFLICT" ? "Yes" : "No",
    reason,
  };
  return { ...base, assessment_digest: evidenceDigest(base, []) };
}

export function resolveExistingProjectAdoptionCheckpoint(input = {}) {
  const normalized = normalizeInput(input);
  const inputDigest = evidenceDigest(normalized.evidence, []);
  const transition = resolveTransition(normalized.evidence);
  const governance = resolveGovernanceState(normalized.evidence.rules);
  const base = {
    schema_version: schemaVersion,
    artifact_type: "existing_project_adoption_checkpoint",
    project_binding: normalized.evidence.binding.project_binding,
    project_fact_digest: normalized.evidence.binding.project_fact_digest,
    source_revision: normalized.evidence.binding.source_revision,
    state: transition.state,
    operational_state: transition.state,
    next_action: transition.next_action,
    operational_next_action: transition.next_action,
    must_stop_automation: transition.must_stop_automation,
    must_stop_for_human: transition.must_stop_for_human,
    write_scope: transition.write_scope,
    reasons: transition.reasons,
    governance_state: governance.state,
    governance_next_action: governance.next_action,
    governance_backlog_count: governance.backlog_count,
    governance_blocks_operation: governance.blocks_operation,
    governance_reasons: governance.reasons,
    input_digest: inputDigest,
  };
  const checkpoint = {
    ...base,
    state_digest: evidenceDigest(base, []),
    progress_state: "CURRENT",
  };

  if (!normalized.transition_attempted || !sameCheckpoint(input.previousCheckpoint, checkpoint)) {
    return checkpoint;
  }

  const blocked = {
    ...base,
    state: existingProjectAdoptionStates.BLOCKED_NO_PROGRESS,
    operational_state: existingProjectAdoptionStates.BLOCKED_NO_PROGRESS,
    next_action: "STOP_REPEATED_ADOPTION_STATE",
    operational_next_action: "STOP_REPEATED_ADOPTION_STATE",
    must_stop_automation: "Yes",
    must_stop_for_human: "No",
    write_scope: "NONE",
    reasons: [
      `A transition was attempted without changing ${checkpoint.state} evidence.`,
      "Diagnose the unchanged blocker instead of creating another adoption run.",
    ],
    blocked_state: checkpoint.state,
    blocked_next_action: checkpoint.next_action,
    input_digest: inputDigest,
    previous_state_digest: checkpoint.state_digest,
  };
  return {
    ...blocked,
    state_digest: evidenceDigest(blocked, []),
    progress_state: "NO_PROGRESS",
  };
}

function resolveTransition(input) {
  if (input.binding.state !== "CURRENT") {
    return transition(
      existingProjectAdoptionStates.BLOCKED_INVALID_PROJECT_BINDING,
      "REFRESH_PROJECT_BINDING",
      ["The adoption coordinator requires one current project and source binding."],
      { mustStopAutomation: "Yes" },
    );
  }

  if (input.discovery.state !== "CURRENT") {
    return transition(
      existingProjectAdoptionStates.READ_ONLY_DISCOVERY_REQUIRED,
      "RUN_READ_ONLY_ADOPTION_DISCOVERY",
      ["Current read-only discovery evidence is missing or stale."],
    );
  }

  if (input.profile.state === "ADDITIVE_RECONCILIATION_REQUIRED") {
    return transition(
      existingProjectAdoptionStates.PROFILE_RECONCILIATION_REQUIRED,
      "PREPARE_CONTROLLED_PROFILE_RECONCILIATION",
      ["Observed project profiles are a high-confidence additive superset of the documented profiles."],
      { writeScope: "PROJECT_PROFILE_SELECTED_PROFILES_SECTION" },
    );
  }

  if (!currentProfileStates.has(input.profile.state)) {
    return transition(
      existingProjectAdoptionStates.PROFILE_RECONCILIATION_BLOCKED,
      "REVIEW_PROFILE_RECONCILIATION_CONFLICT",
      ["Project profile evidence is incomplete, subtractive, or conflicting."],
      {
        mustStopAutomation: "Yes",
        mustStopForHuman: input.profile.human_decision_required,
      },
    );
  }

  if (input.rules.operational_boundary_state === existingProjectGovernanceReadinessStates.BLOCKED_UNBOUNDED) {
    return transition(
      existingProjectAdoptionStates.ADOPTION_SAFETY_BOUNDARY_REQUIRED,
      "COMPLETE_BOUNDED_GOVERNANCE_DISCOVERY",
      ["Operational adoption requires either a complete governance scan or one exact current non-writing backlog."],
    );
  }

  if (!currentPlanStates.has(input.selected_assets_plan.state)) {
    return transition(
      existingProjectAdoptionStates.SELECTED_ASSETS_PLAN_REQUIRED,
      "GENERATE_SELECTED_ASSETS_APPLY_PLAN",
      ["Rule reconciliation is complete, but no current selected-assets apply plan exists."],
    );
  }

  if (!verifiedApplyStates.has(input.apply.state)) {
    return transition(
      existingProjectAdoptionStates.CONTROLLED_APPLY_REQUIRED,
      "APPLY_REVIEWED_SELECTED_ASSETS_PLAN",
      ["A current selected-assets plan exists but has no verified apply receipt."],
      { writeScope: "EXACT_REVIEWED_APPLY_GRAPH" },
    );
  }

  if (!verifiedActivationStates.has(input.activation.state)) {
    return transition(
      existingProjectAdoptionStates.ACTIVATION_VERIFICATION_REQUIRED,
      "VERIFY_COLD_START_ACTIVATION",
      ["The controlled apply is verified, but cold-start activation is not yet verified."],
    );
  }

  return transition(
    existingProjectAdoptionStates.VERIFIED_ACTIVE,
    "READY_FOR_INTENTOS_OPERATION",
    ["Profile, selected-assets plan, apply, and activation evidence are current; governance backlog is reported separately."],
  );
}

function resolveGovernanceState(rules) {
  if (!completeRuleScanStates.has(rules.scan_state) || rules.unresolved_blocks === null) {
    return governanceState(
      existingProjectGovernanceStates.GOVERNANCE_SCAN_PENDING,
      "RUN_BOUNDED_EXISTING_RULE_SCAN",
      rules.unresolved_blocks,
      ["Existing project governance discovery is incomplete or stale."],
      "Yes",
    );
  }
  if (rules.decision_state === "INVALID") {
    return governanceState(
      existingProjectGovernanceStates.GOVERNANCE_DECISIONS_INVALID,
      "REGENERATE_NATIVE_RULE_DECISION_WORK_PACKET",
      rules.unresolved_blocks,
      ["The native-rule decision artifact is invalid or stale."],
      "Yes",
    );
  }
  if (rules.unresolved_blocks > 0) {
    return governanceState(
      existingProjectGovernanceStates.GOVERNANCE_DECISION_BACKLOG,
      "CODEX_REVIEW_NATIVE_RULE_DECISION_BACKLOG",
      rules.unresolved_blocks,
      [`${rules.unresolved_blocks} exact existing-rule blocks remain in the governance backlog.`],
    );
  }
  return governanceState(
    existingProjectGovernanceStates.GOVERNANCE_CURRENT,
    "NONE",
    0,
    ["Existing project governance discovery has no unresolved semantic blocks."],
  );
}

function governanceState(state, nextAction, backlogCount, reasons, blocksOperation = "No") {
  return {
    state,
    next_action: nextAction,
    backlog_count: backlogCount,
    blocks_operation: blocksOperation,
    reasons,
  };
}

function governanceReadiness(state, backlogCount, reasons, packetDigest = "N/A") {
  return {
    state,
    backlog_count: backlogCount,
    packet_digest: packetDigest,
    blocks_operation: state === existingProjectGovernanceReadinessStates.BLOCKED_UNBOUNDED ? "Yes" : "No",
    next_action: state === existingProjectGovernanceReadinessStates.BOUNDED_NON_BLOCKING
      ? "REVIEW_GOVERNANCE_BACKLOG_AS_NEEDED"
      : state === existingProjectGovernanceReadinessStates.CURRENT
        ? "NONE"
        : "COMPLETE_BOUNDED_GOVERNANCE_DISCOVERY",
    reasons,
  };
}

function validateBoundedGovernancePacket(packet, nativeEvidence, omittedRules) {
  const errors = [];
  if (packet?.artifact_type !== "native_rule_decision_work_packet") {
    return ["A current native-rule decision work packet is missing."];
  }
  if (!Number.isSafeInteger(packet.required_decisions) || packet.required_decisions <= 0) {
    errors.push("The governance backlog count is invalid.");
  }
  if (omittedRules === null || packet.required_decisions !== omittedRules) {
    errors.push("The governance backlog does not cover every omitted reconciliation block.");
  }
  if (!Array.isArray(packet.blocks) || packet.blocks.length !== packet.required_decisions) {
    errors.push("The governance backlog block inventory is incomplete.");
  }
  if (packet.decision_policy?.may_write_target_files !== "No"
    || packet.decision_policy?.may_authorize_apply !== "No"
    || packet.decision_policy?.may_authorize_release_or_production !== "No") {
    errors.push("The governance backlog exceeds its read-only authority boundary.");
  }
  if (JSON.stringify(packet.project_binding || null) !== JSON.stringify(nativeEvidence.project_binding || null)) {
    errors.push("The governance backlog project binding is stale.");
  }
  for (const [packetField, evidenceField] of [
    ["goal_digest", "goal_digest"],
    ["project_fact_digest", "project_fact_digest"],
    ["guidance_digest", "guidance_digest"],
    ["authority_inventory_digest", "authority_inventory_digest"],
    ["source_revision", "source_revision"],
  ]) {
    if (!packet[packetField] || packet[packetField] !== nativeEvidence[evidenceField]) {
      errors.push(`The governance backlog ${packetField} is stale.`);
    }
  }
  return errors;
}

function transition(state, nextAction, reasons, options = {}) {
  return {
    state,
    next_action: nextAction,
    must_stop_automation: options.mustStopAutomation || "No",
    must_stop_for_human: options.mustStopForHuman || "No",
    write_scope: options.writeScope || "NONE",
    reasons,
  };
}

function normalizeInput(input) {
  return {
    evidence: {
      binding: {
        state: stateToken(input.binding?.state, "MISSING"),
        project_binding: object(input.binding?.projectBinding),
        project_fact_digest: scalar(input.binding?.projectFactDigest, "N/A"),
        source_revision: scalar(input.binding?.sourceRevision, "N/A"),
      },
      discovery: {
        state: stateToken(input.discovery?.state, "MISSING"),
        evidence_digest: scalar(input.discovery?.evidenceDigest, "N/A"),
      },
      profile: {
        state: stateToken(input.profile?.state, "MISSING"),
        declared_profiles: list(input.profile?.declaredProfiles),
        observed_profiles: list(input.profile?.observedProfiles),
        proposed_profiles: list(input.profile?.proposedProfiles),
        evidence_digest: scalar(input.profile?.evidenceDigest, "N/A"),
        human_decision_required: yesNo(input.profile?.humanDecisionRequired),
      },
      rules: {
        scan_state: stateToken(input.rules?.scanState, "UNKNOWN"),
        unresolved_blocks: nonNegativeInteger(input.rules?.unresolvedBlocks),
        decision_state: stateToken(input.rules?.decisionState, "NOT_PROVIDED"),
        operational_boundary_state: stateToken(
          input.rules?.operationalBoundaryState,
          existingProjectGovernanceReadinessStates.BLOCKED_UNBOUNDED,
        ),
        evidence_digest: scalar(input.rules?.evidenceDigest, "N/A"),
      },
      selected_assets_plan: {
        state: stateToken(input.selectedAssetsPlan?.state, "MISSING"),
        plan_digest: scalar(input.selectedAssetsPlan?.planDigest, "N/A"),
      },
      apply: {
        state: stateToken(input.apply?.state, "MISSING"),
        receipt_digest: scalar(input.apply?.receiptDigest, "N/A"),
      },
      activation: {
        state: stateToken(input.activation?.state, "MISSING"),
        evidence_digest: scalar(input.activation?.evidenceDigest, "N/A"),
      },
    },
    transition_attempted: input.transitionAttempted === true,
  };
}

function sameCheckpoint(previous, current) {
  return Boolean(previous
    && previous.state === current.state
    && previous.next_action === current.next_action
    && previous.input_digest === current.input_digest
    && previous.state_digest === current.state_digest);
}

function stateToken(value, fallback) {
  return String(value || fallback).trim().toUpperCase();
}

function scalar(value, fallback) {
  return String(value || fallback).trim();
}

function list(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean))].sort();
}

function object(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? structuredClone(value) : {};
}

function yesNo(value) {
  return String(value || "No").trim().toLowerCase() === "yes" ? "Yes" : "No";
}

function nonNegativeInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function profileEvidenceFor(signals, additions) {
  const additionsSet = new Set(additions);
  return (Array.isArray(signals) ? signals : [])
    .filter((item) => additionsSet.has(String(item?.profile || "")))
    .map((item) => ({
      profile: String(item.profile),
      evidence: (Array.isArray(item.evidence) ? item.evidence : []).map((entry) => ({
        source: String(entry?.source || ""),
        reason: String(entry?.reason || ""),
      })),
    }))
    .sort((left, right) => left.profile.localeCompare(right.profile));
}
