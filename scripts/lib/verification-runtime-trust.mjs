import crypto from "node:crypto";
import {
  adapterSelectionSemanticErrors,
  selectRuntimeAdapter,
  serviceInstanceIdentityErrors,
} from "./verification-runtime-adapters.mjs";

export { selectRuntimeAdapter } from "./verification-runtime-adapters.mjs";

export const TASK_TIERS = new Set(["LOW", "MEDIUM", "POSSIBLE_HIGH", "HIGH"]);

export function normalizeTaskTier(value) {
  const tier = String(value || "").trim().toUpperCase();
  return TASK_TIERS.has(tier) ? tier : "POSSIBLE_HIGH";
}

export function runtimeTrustLevelForTier(value) {
  const tier = normalizeTaskTier(value);
  if (tier === "LOW") return "SOURCE_OUTPUT_BINDING";
  if (tier === "MEDIUM") return "TARGETED_SERVICE_IDENTITY";
  if (tier === "HIGH") return "ISOLATED_RUNTIME";
  return "BLOCKED_FOR_CLASSIFICATION";
}

export function effectiveTaskTier(derivedValue, requestedValue) {
  const derived = normalizeTaskTier(derivedValue);
  const requestedText = String(requestedValue || "").trim();
  if (!requestedText) return derived;
  const requested = normalizeTaskTier(requestedText);
  if (derived === "POSSIBLE_HIGH") return requested === "HIGH" ? "HIGH" : "POSSIBLE_HIGH";
  if (requested === "POSSIBLE_HIGH") return "POSSIBLE_HIGH";
  const rank = { LOW: 0, MEDIUM: 1, HIGH: 2 };
  return rank[requested] >= rank[derived] ? requested : derived;
}

export function requiredControlsForTier(value) {
  const tier = normalizeTaskTier(value);
  const requirement = (control) => {
    if (["SOURCE_IDENTITY", "OUTPUT_BINDING"].includes(control)) return "REQUIRED";
    if (tier === "POSSIBLE_HIGH") return "BLOCKED";
    if (tier === "LOW") return "NOT_REQUIRED";
    if (tier === "MEDIUM") {
      if (["SERVICE_IDENTITY", "RESOURCE_OWNERSHIP", "CLEANUP_PROOF", "POSITIVE_NEGATIVE_PATHS"].includes(control)) return "REQUIRED";
      return "CONDITIONAL";
    }
    return "REQUIRED";
  };
  return [
    "SOURCE_IDENTITY",
    "OUTPUT_BINDING",
    "SERVICE_IDENTITY",
    "DATA_ISOLATION",
    "SESSION_ISOLATION",
    "RESOURCE_OWNERSHIP",
    "CLEANUP_PROOF",
    "POSITIVE_NEGATIVE_PATHS",
  ].map((control) => ({
    control,
    requirement: requirement(control),
    reason: controlReason(control, requirement(control), tier),
  }));
}

export function preflightRequirementsForTier(value) {
  const tier = normalizeTaskTier(value);
  const required = new Set(["SOURCE_IDENTITY", "WORKTREE_STATE"]);
  if (["MEDIUM", "HIGH", "POSSIBLE_HIGH"].includes(tier)) {
    for (const probe of ["OLD_PROCESS", "PORT_CONFLICT", "SENSITIVE_ENVIRONMENT"]) required.add(probe);
  }
  if (["HIGH", "POSSIBLE_HIGH"].includes(tier)) {
    for (const probe of ["DATA_IDENTITY", "SESSION_RESIDUE", "PRODUCTION_RESOURCE_GUARD"]) required.add(probe);
  }
  return [
    "SOURCE_IDENTITY",
    "WORKTREE_STATE",
    "OLD_PROCESS",
    "PORT_CONFLICT",
    "SENSITIVE_ENVIRONMENT",
    "DATA_IDENTITY",
    "SESSION_RESIDUE",
    "PRODUCTION_RESOURCE_GUARD",
  ].map((probe) => ({
    probe,
    required: required.has(probe) ? "Yes" : "No",
    expected_result: "PASS",
    reason: required.has(probe)
      ? `${probe} must be observed before this task tier can count runtime evidence.`
      : `${probe} is not mandatory for ${tier} unless project facts make it relevant.`,
  }));
}

export function resourceIsolationPlanForTier(value) {
  const tier = normalizeTaskTier(value);
  if (tier === "LOW") return [];
  const rows = [{
    resource_type: "SERVICE",
    requirement: tier === "POSSIBLE_HIGH" ? "CONDITIONAL" : "REQUIRED",
    isolation_strategy: "RUN_SCOPED_INSTANCE",
    production_allowed: "No",
    ownership_required: "Yes",
    reason: "The intended service or build instance must be attributable to this run.",
  }];
  for (const resourceType of ["DATABASE", "CACHE", "SESSION"]) {
    rows.push({
      resource_type: resourceType,
      requirement: tier === "HIGH" ? "REQUIRED" : "CONDITIONAL",
      isolation_strategy: tier === "HIGH" ? "RUN_SCOPED_NAMESPACE" : "PROJECT_NATIVE_ISOLATION",
      production_allowed: "No",
      ownership_required: tier === "HIGH" ? "Yes" : "No",
      reason: tier === "HIGH"
        ? `${resourceType} must use run-scoped non-production isolation.`
        : `${resourceType} isolation is required when the targeted behavior consumes it.`,
    });
  }
  return rows;
}

export function expectedPlanOutcome(taskTier, adapterSelection, verificationPlanSource) {
  const tier = normalizeTaskTier(taskTier);
  if (tier === "POSSIBLE_HIGH") return "RUNTIME_PLAN_BLOCKED";
  if (tier !== "LOW" && verificationPlanSource?.status !== "RECORDED") return "RUNTIME_PLAN_BLOCKED";
  if (adapterSelection?.status === "BLOCKED" || adapterSelection?.adapter_kind === "UNRESOLVED") return "RUNTIME_PLAN_BLOCKED";
  return "RUNTIME_PLAN_READY";
}

export function digestText(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value || "")).digest("hex")}`;
}

export function planSemanticErrors(plan) {
  const errors = [];
  const tier = normalizeTaskTier(plan?.task_tier);
  const expectedLevel = runtimeTrustLevelForTier(tier);
  if (plan?.runtime_trust_level !== expectedLevel) errors.push(`runtime_trust_level must be ${expectedLevel} for ${tier}`);
  if (plan?.task_governance_source?.tier !== tier) errors.push("task_governance_source tier must match task_tier");
  if (plan?.task_governance_source?.current_task_match !== "Yes") errors.push("Task Governance must match the current task");
  if (tier !== "LOW" && plan?.verification_plan_source?.status !== "RECORDED") errors.push(`${tier} requires a recorded Verification Plan`);
  if (tier === "LOW" && !["RECORDED", "NOT_REQUIRED"].includes(plan?.verification_plan_source?.status)) errors.push("LOW Verification Plan source must be recorded or explicitly not required");
  if (tier === "POSSIBLE_HIGH" && plan?.outcome !== "RUNTIME_PLAN_BLOCKED") errors.push("POSSIBLE_HIGH must remain blocked for classification");

  const controls = new Map((plan?.required_controls || []).map((item) => [item.control, item.requirement]));
  for (const item of requiredControlsForTier(tier)) {
    if (controls.get(item.control) !== item.requirement) errors.push(`${item.control} must be ${item.requirement} for ${tier}`);
  }
  const probes = new Map((plan?.preflight_requirements || []).map((item) => [item.probe, item.required]));
  for (const item of preflightRequirementsForTier(tier)) {
    if (probes.get(item.probe) !== item.required) errors.push(`${item.probe} required flag must be ${item.required} for ${tier}`);
  }
  const expectedOutcome = expectedPlanOutcome(tier, plan?.adapter_selection, plan?.verification_plan_source);
  if (plan?.outcome !== expectedOutcome) errors.push(`outcome must be ${expectedOutcome}`);
  if (plan?.adapter_selection?.selected_by !== "CODEX" || plan?.adapter_selection?.user_selection_required !== "No") {
    errors.push("runtime adapter must be selected by Codex without a technical user choice");
  }
  errors.push(...adapterSelectionSemanticErrors(plan?.adapter_selection, plan?.runtime_trust_level, plan?.schema_version));
  return errors;
}

export function runManifestSemanticErrors(manifest, runtimePlan, currentProjectIdentity) {
  const errors = [];
  if (!runtimePlan) return ["referenced Verification Runtime Plan is required"];
  for (const field of ["task_ref", "intent_digest", "task_tier", "runtime_trust_level"]) {
    if (manifest?.[field] !== runtimePlan?.[field]) errors.push(`${field} must match the Verification Runtime Plan`);
  }
  if (manifest?.runtime_plan_digest !== runtimePlan?.runtime_plan_digest) errors.push("runtime_plan_digest must match the referenced plan");
  if (runtimePlan?.schema_version === "1.102.0" && manifest?.adapter_contract_digest !== runtimePlan?.adapter_selection?.contract_digest) {
    errors.push("adapter_contract_digest must match the referenced runtime plan");
  }
  if (manifest?.schema_version === "1.103.0") {
    if (!manifest.lifecycle_plan_ref || !/^sha256:[a-f0-9]{64}$/.test(manifest.lifecycle_plan_digest || "")) errors.push("1.103 run manifest requires a lifecycle plan binding");
    if (!manifest.lifecycle_journal_ref || !/^sha256:[a-f0-9]{64}$/.test(manifest.lifecycle_journal_digest || "")) errors.push("1.103 run manifest requires a lifecycle journal binding");
  }
  if (manifest?.source_identity?.kind !== currentProjectIdentity?.kind
    || manifest?.source_identity?.fingerprint !== currentProjectIdentity?.fingerprint
    || manifest?.source_identity?.revision !== currentProjectIdentity?.revision
    || manifest?.source_identity?.current_project_match !== "Yes") {
    errors.push("source_identity must match the current project identity and revision");
  }
  if (manifest?.run_window?.state === "COMPLETED") {
    if (!validTimeOrder(manifest.run_window.started_at, manifest.run_window.finished_at)) errors.push("run_window must contain valid ordered timestamps");
    for (const probe of runtimePlan.preflight_requirements || []) {
      if (probe.required !== "Yes") continue;
      const result = (manifest.preflight_results || []).find((item) => item.probe === probe.probe);
      if (!result || result.result !== "PASS") errors.push(`required preflight ${probe.probe} must PASS`);
    }
  }
  const level = manifest?.runtime_trust_level;
  if (["TARGETED_SERVICE_IDENTITY", "ISOLATED_RUNTIME"].includes(level)) {
    const verified = (manifest.service_instances || []).filter((item) => item.identity_status === "VERIFIED" && item.identity_fields?.length > 0);
    if (!verified.length) {
      errors.push(`${level} requires a verified service instance identity`);
    }
    for (const instance of verified) errors.push(...serviceInstanceIdentityErrors(instance, runtimePlan?.adapter_selection, runtimePlan?.schema_version));
  }
  if (level === "ISOLATED_RUNTIME") {
    if (!(manifest.data_resources || []).some((item) => item.isolation_status === "ISOLATED" && item.production_instance === "No")) {
      errors.push("ISOLATED_RUNTIME requires an isolated non-production data resource");
    }
    if (!(manifest.session_contexts || []).some((item) => item.isolation_status === "ISOLATED" && item.owned_by_run === "Yes")) {
      errors.push("ISOLATED_RUNTIME requires an isolated run-owned session context");
    }
    const executions = manifest.verification_executions || [];
    if (!executions.some((item) => item.result === "PASSED" && item.positive_path === "Yes")) errors.push("ISOLATED_RUNTIME requires a passing positive path");
    if (!executions.some((item) => item.result === "PASSED" && item.negative_path === "Yes")) errors.push("ISOLATED_RUNTIME requires a passing negative path");
    if (manifest?.cleanup_summary?.state !== "VERIFIED") errors.push("ISOLATED_RUNTIME requires verified cleanup");
  }
  if (manifest?.cleanup_summary?.unrelated_resources_touched !== "No") errors.push("cleanup must not touch unrelated resources");
  if (manifest?.run_window?.state === "COMPLETED" && manifest?.cleanup_summary?.owned_resources_remaining !== 0) {
    errors.push("completed run must leave zero owned resources");
  }
  const ownedResources = (manifest.resource_ledger || []).filter((item) => item.created_by_run === "Yes");
  for (const item of ownedResources) {
    if (!/^sha256:[a-f0-9]{64}$/.test(item.owner_marker_digest || "")) errors.push(`owned resource ${item.resource_id} needs an owner marker digest`);
    if (!new Set(["CLEANED", "PRESERVED_WITH_REASON"]).has(item.cleanup_state)) errors.push(`owned resource ${item.resource_id} needs a safe cleanup disposition`);
  }
  if ((manifest.verification_executions || []).some((item) => item.result !== "PASSED") && manifest?.outcome === "RUNTIME_TRUST_COMPLETE") {
    errors.push("runtime trust cannot be complete when any verification execution is not passing");
  }
  return errors;
}

const LIFECYCLE_TERMINAL_EVENTS = new Set([
  "COMPLETED",
  "FAILED_CLEANED",
  "INTERRUPTED_CLEANED",
  "CLEANUP_BLOCKED",
]);
const LIFECYCLE_ACTION_EVENTS = new Set([
  "ACTION_STARTING",
  "ACTION_FINISHED",
  "SERVICE_OBSERVED",
]);
const LIFECYCLE_JOURNAL_EVENTS = new Set([
  "PREFLIGHT_RUNNING",
  "PREFLIGHT_PROBE_OBSERVED",
  "EXECUTABLE_RESOLVED",
  "PREFLIGHT_PASSED",
  "RESOURCE_CREATED",
  "ACTION_STARTING",
  "ACTION_FINISHED",
  "SERVICE_OBSERVED",
  "EXECUTION_FAILED",
  "INTERRUPTED",
  "CLEANUP_EVIDENCE_BEFORE_RECORDED",
  "CLEANING_UP",
  "PROCESS_CLEANED",
  "PROCESS_CLEANUP_BLOCKED",
  "RESOURCE_CLEANED",
  "RESOURCE_CLEANUP_BLOCKED",
  ...LIFECYCLE_TERMINAL_EVENTS,
]);

export function lifecycleManifestReplayErrors(manifest, lifecyclePlan, journalRows) {
  // This detects stale or internally inconsistent local evidence. External attestation is a separate trust boundary.
  const errors = [];
  const actions = Array.isArray(lifecyclePlan?.actions) ? lifecyclePlan.actions : [];
  const resources = Array.isArray(lifecyclePlan?.resources) ? lifecyclePlan.resources : [];
  const rows = Array.isArray(journalRows) ? journalRows : [];
  const actionById = new Map(actions.map((item) => [item.id, item]));
  const resourceById = new Map(resources.map((item) => [item.resource_id, item]));

  if (manifest?.run_id !== lifecyclePlan?.run_id) errors.push("lifecycle replay run_id must match the Lifecycle Plan");
  if (manifest?.adapter_contract_digest !== lifecyclePlan?.adapter_contract_digest) errors.push("lifecycle replay adapter_contract_digest must match the Lifecycle Plan");
  if (rows.length === 0) return [...errors, "lifecycle journal must contain observed events"];

  validateJournalEnvelope(manifest, rows, errors);
  const terminalEvent = terminalJournalEvent(rows);

  const preflightStarted = eventRows(rows, "PREFLIGHT_RUNNING");
  const preflightObserved = eventRows(rows, "PREFLIGHT_PROBE_OBSERVED");
  const preflightPassed = eventRows(rows, "PREFLIGHT_PASSED");
  if (preflightStarted.length !== 1) errors.push("lifecycle journal must contain exactly one PREFLIGHT_RUNNING event");
  if (terminalEvent === "COMPLETED" && preflightPassed.length !== 1) errors.push("completed lifecycle journal must contain exactly one PREFLIGHT_PASSED event");
  if (terminalEvent !== "COMPLETED" && preflightPassed.length > 1) errors.push("lifecycle journal must not contain duplicate PREFLIGHT_PASSED events");
  if (preflightStarted[0]?.row?.run_id !== lifecyclePlan?.run_id) errors.push("PREFLIGHT_RUNNING run_id must match the Lifecycle Plan");
  if (preflightStarted[0] && preflightPassed[0] && preflightStarted[0].index >= preflightPassed[0].index) {
    errors.push("PREFLIGHT_RUNNING must precede PREFLIGHT_PASSED");
  }
  compareExactSequence(
    preflightObserved.map(({ row }) => `${row.probe}:${row.result}:${row.reason}`),
    (manifest?.preflight_results || []).map((item) => `${item.probe}:${item.result}:${item.reason}`),
    "observed preflight probe results",
    errors,
  );
  if (preflightStarted[0] && preflightObserved.some(({ index }) => index <= preflightStarted[0].index)) {
    errors.push("all PREFLIGHT_PROBE_OBSERVED events must follow PREFLIGHT_RUNNING");
  }
  if (preflightPassed[0] && preflightObserved.some(({ index }) => index >= preflightPassed[0].index)) {
    errors.push("all PREFLIGHT_PROBE_OBSERVED events must precede PREFLIGHT_PASSED");
  }

  const executableRows = eventRows(rows, "EXECUTABLE_RESOLVED");
  if (preflightPassed.length === 1) {
    compareExactSequence(
      executableRows.map(({ row }) => row.action_id),
      actions.map((item) => item.id),
      "resolved lifecycle action ids",
      errors,
    );
  } else {
    comparePrefix(
      executableRows.map(({ row }) => row.action_id),
      actions.map((item) => item.id),
      "resolved lifecycle action ids",
      errors,
    );
  }
  if (preflightPassed[0] && executableRows.some(({ index }) => index >= preflightPassed[0].index)) {
    errors.push("all EXECUTABLE_RESOLVED events must precede PREFLIGHT_PASSED");
  }

  const actionEvents = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => LIFECYCLE_ACTION_EVENTS.has(row.event));
  const expectedActionEvents = actions.flatMap((action) => [
    `${action.id}:ACTION_STARTING`,
    `${action.id}:${action.kind === "SERVICE" ? "SERVICE_OBSERVED" : "ACTION_FINISHED"}`,
  ]);
  const actualActionEvents = actionEvents.map(({ row }) => `${row.action_id}:${row.event}`);
  if (terminalEvent === "COMPLETED") compareExactSequence(actualActionEvents, expectedActionEvents, "lifecycle action event sequence", errors);
  else comparePrefix(actualActionEvents, expectedActionEvents, "lifecycle action event sequence", errors);
  if (preflightPassed.length === 0 && actionEvents.length > 0) errors.push("lifecycle actions cannot run before PREFLIGHT_PASSED");
  if (preflightPassed[0] && actionEvents.some(({ index }) => index <= preflightPassed[0].index)) errors.push("all lifecycle actions must follow PREFLIGHT_PASSED");

  for (const { row } of actionEvents) {
    if (!actionById.has(row.action_id)) errors.push(`lifecycle journal contains unknown action ${row.action_id || "<missing>"}`);
  }
  for (const action of actions) {
    const starts = actionEvents.filter(({ row }) => row.event === "ACTION_STARTING" && row.action_id === action.id);
    const finishes = actionEvents.filter(({ row }) => row.event === "ACTION_FINISHED" && row.action_id === action.id);
    const observations = actionEvents.filter(({ row }) => row.event === "SERVICE_OBSERVED" && row.action_id === action.id);
    if (starts.length > 1) errors.push(`action ${action.id} has duplicate ACTION_STARTING events`);
    if (action.kind === "SERVICE" && observations.length > 1) errors.push(`service action ${action.id} has duplicate SERVICE_OBSERVED events`);
    if (action.kind !== "SERVICE" && finishes.length > 1) errors.push(`action ${action.id} has duplicate ACTION_FINISHED events`);
    if (finishes.length && action.kind === "SERVICE") errors.push(`service action ${action.id} must not emit ACTION_FINISHED`);
    if (observations.length && action.kind !== "SERVICE") errors.push(`non-service action ${action.id} must not emit SERVICE_OBSERVED`);
  }

  const observedServices = actionEvents
    .filter(({ row }) => row.event === "SERVICE_OBSERVED")
    .map(({ row, index }) => ({ actionId: row.action_id, id: `service:${row.action_id}`, row, index }));
  const finishedExecutions = actionEvents
    .filter(({ row }) => row.event === "ACTION_FINISHED")
    .map(({ row, index }) => ({ actionId: row.action_id, row, index }));

  const manifestServices = Array.isArray(manifest?.service_instances) ? manifest.service_instances : [];
  const manifestExecutions = Array.isArray(manifest?.verification_executions) ? manifest.verification_executions : [];
  compareExactSequence(manifestServices.map((item) => item.id), observedServices.map((item) => item.id), "manifest service instance ids", errors);
  compareExactSequence(manifestExecutions.map((item) => item.id), finishedExecutions.map((item) => item.actionId), "manifest verification execution ids", errors);

  const serviceById = new Map(manifestServices.map((item) => [item.id, item]));
  for (const observed of observedServices) {
    const action = actionById.get(observed.actionId);
    const service = serviceById.get(observed.id);
    if (!action || !service) continue;
    if (service.adapter_kind !== lifecyclePlan.adapter_kind) errors.push(`service ${service.id} adapter_kind must match the Lifecycle Plan`);
    if (service.owned_by_run !== "Yes") errors.push(`service ${service.id} must be owned by this run`);
    if (!replayEvidenceRefMatches(service.evidence_ref, action.output_ref, manifest.run_id)) {
      errors.push(`service ${service.id} evidence_ref must match action ${action.id} output_ref`);
    }
    if (!validTime(service.started_at) || Date.parse(service.started_at) < Date.parse(actionStartRow(actionEvents, action.id)?.at || "")
      || Date.parse(service.started_at) > Date.parse(observed.row.at || "")) {
      errors.push(`service ${service.id} started_at must be bounded by ACTION_STARTING and SERVICE_OBSERVED`);
    }
  }

  const executionById = new Map(manifestExecutions.map((item) => [item.id, item]));
  for (const finished of finishedExecutions) {
    const action = actionById.get(finished.actionId);
    const execution = executionById.get(finished.actionId);
    if (!action || !execution) continue;
    const expectedServices = observedServices.filter((item) => item.index < actionStartIndex(actionEvents, action.id)).map((item) => item.id);
    if (execution.command_digest !== digestText(JSON.stringify(action.argv))) errors.push(`execution ${action.id} command_digest must match lifecycle argv`);
    if (!replayEvidenceRefMatches(execution.output_ref, action.output_ref, manifest.run_id)) {
      errors.push(`execution ${action.id} output_ref must match lifecycle action`);
    }
    compareExactSequence(execution.covers_obligations, action.obligation_ids, `execution ${action.id} obligation ids`, errors);
    compareExactSequence(execution.resource_ids, action.resource_ids, `execution ${action.id} resource ids`, errors);
    compareExactSequence(execution.service_instance_ids, expectedServices, `execution ${action.id} service instance ids`, errors);
    if (execution.positive_path !== action.positive_path) errors.push(`execution ${action.id} positive_path must match lifecycle action`);
    if (execution.negative_path !== action.negative_path) errors.push(`execution ${action.id} negative_path must match lifecycle action`);
    if (execution.exit_code !== finished.row.exit_code) errors.push(`execution ${action.id} exit_code must match ACTION_FINISHED`);
    const expectedResult = finished.row.exit_code === 0 && finished.row.timed_out === false ? "PASSED" : "FAILED";
    if (execution.result !== expectedResult) errors.push(`execution ${action.id} result must match ACTION_FINISHED`);
    const started = actionStartRow(actionEvents, action.id);
    if (!validTime(execution.started_at) || !validTime(execution.finished_at)
      || Date.parse(execution.started_at) < Date.parse(started?.at || "")
      || Date.parse(execution.finished_at) > Date.parse(finished.row.at || "")
      || Date.parse(execution.started_at) > Date.parse(execution.finished_at)) {
      errors.push(`execution ${action.id} timestamps must be bounded by its lifecycle journal events`);
    }
  }

  validateResourceReplay(manifest, lifecyclePlan, rows, resourceById, observedServices, terminalEvent, errors);
  validateCleanupReplay(manifest, lifecyclePlan, rows, observedServices, terminalEvent, errors);

  return errors;
}

function replayEvidenceRefMatches(actual, planned, runId) {
  if (actual === planned) return true;
  const ephemeralPrefix = `file:.intentos/runtime-runs/${runId}/`;
  const durablePrefix = `file:evidence/runtime-runs/${runId}/`;
  return String(planned || "").startsWith(ephemeralPrefix)
    && actual === `${durablePrefix}${String(planned).slice(ephemeralPrefix.length)}`;
}

function validateJournalEnvelope(manifest, rows, errors) {
  let previous = Number.NEGATIVE_INFINITY;
  for (const [index, row] of rows.entries()) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push(`lifecycle journal row ${index + 1} must be an object`);
      continue;
    }
    if (!validTime(row.at)) {
      errors.push(`lifecycle journal row ${index + 1} has an invalid timestamp`);
      continue;
    }
    const current = Date.parse(row.at);
    if (current < previous) errors.push(`lifecycle journal timestamps must be nondecreasing at row ${index + 1}`);
    previous = current;
    if (typeof row.event !== "string" || !row.event) errors.push(`lifecycle journal row ${index + 1} requires an event`);
    else if (!LIFECYCLE_JOURNAL_EVENTS.has(row.event)) errors.push(`lifecycle journal row ${index + 1} contains unknown event ${row.event}`);
  }
  const terminalRows = rows.filter((row) => LIFECYCLE_TERMINAL_EVENTS.has(row.event));
  if (terminalRows.length !== 1) errors.push("lifecycle journal must contain exactly one terminal event");
  if (!LIFECYCLE_TERMINAL_EVENTS.has(rows.at(-1)?.event)) errors.push("lifecycle journal terminal event must be the final row");
  const terminal = terminalRows[0]?.event;
  const expected = terminal === "COMPLETED"
    ? { state: "COMPLETED", outcome: "RUNTIME_TRUST_COMPLETE" }
    : terminal === "CLEANUP_BLOCKED"
      ? { state: "CLEANUP_FAILED", outcome: "RUNTIME_TRUST_BLOCKED" }
      : terminal
        ? { state: "FAILED", outcome: "RUNTIME_TRUST_PARTIAL" }
        : null;
  if (expected && manifest?.run_window?.state !== expected.state) errors.push(`run_window.state must be ${expected.state} for terminal event ${terminal}`);
  if (expected && manifest?.outcome !== expected.outcome) errors.push(`outcome must be ${expected.outcome} for terminal event ${terminal}`);
  if (terminal === "COMPLETED" && rows.some((row) => ["EXECUTION_FAILED", "INTERRUPTED", "RESOURCE_CLEANUP_BLOCKED", "PROCESS_CLEANUP_BLOCKED"].includes(row.event))) {
    errors.push("completed lifecycle journal must not contain failure, interruption, or blocked cleanup events");
  }
  const firstAt = Date.parse(rows[0]?.at || "");
  const lastAt = Date.parse(rows.at(-1)?.at || "");
  const startedAt = Date.parse(manifest?.run_window?.started_at || "");
  const finishedAt = Date.parse(manifest?.run_window?.finished_at || "");
  if (!Number.isFinite(startedAt) || !Number.isFinite(finishedAt) || startedAt > firstAt || finishedAt > lastAt || startedAt > finishedAt) {
    errors.push("run_window must bound the lifecycle journal observation window");
  }
}

function validateResourceReplay(manifest, lifecyclePlan, rows, resourceById, observedServices, terminalEvent, errors) {
  const created = eventRows(rows, "RESOURCE_CREATED");
  const createdIds = created.map(({ row }) => row.resource_id);
  for (const { row } of created) {
    const planned = resourceById.get(row.resource_id);
    if (!planned) errors.push(`lifecycle journal contains unknown resource ${row.resource_id || "<missing>"}`);
    else if (row.resource_type !== planned.resource_type) errors.push(`resource ${row.resource_id} type must match the Lifecycle Plan`);
  }
  if (terminalEvent === "COMPLETED") compareExactSequence(createdIds, lifecyclePlan.resources.map((item) => item.resource_id), "created lifecycle resource ids", errors);
  else comparePrefix(createdIds, lifecyclePlan.resources.map((item) => item.resource_id), "created lifecycle resource ids", errors);
  const preflightPassed = eventRows(rows, "PREFLIGHT_PASSED")[0];
  const firstActionIndex = rows.findIndex((row) => row.event === "ACTION_STARTING");
  if (!preflightPassed && created.length) errors.push("lifecycle resources cannot be created before PREFLIGHT_PASSED");
  if (preflightPassed && created.some(({ index }) => index <= preflightPassed.index)) errors.push("all RESOURCE_CREATED events must follow PREFLIGHT_PASSED");
  if (firstActionIndex >= 0 && created.some(({ index }) => index >= firstActionIndex)) errors.push("all RESOURCE_CREATED events must precede lifecycle actions");

  const expectedLedgerIds = [...createdIds, ...observedServices.map((item) => item.id)];
  const ledger = Array.isArray(manifest?.resource_ledger) ? manifest.resource_ledger : [];
  compareExactSequence(ledger.map((item) => item.resource_id), expectedLedgerIds, "manifest resource ledger ids", errors);
  const ledgerById = new Map(ledger.map((item) => [item.resource_id, item]));
  const ownerMarkerDigest = digestText(`${manifest.run_id}|${manifest.owner_token_digest}`);
  for (const resourceId of createdIds) {
    const planned = resourceById.get(resourceId);
    const item = ledgerById.get(resourceId);
    if (!planned || !item) continue;
    if (item.resource_type !== ledgerResourceType(planned.resource_type)) errors.push(`resource ledger ${resourceId} type must match the Lifecycle Plan`);
    if (item.created_by_run !== "Yes") errors.push(`resource ledger ${resourceId} must be created by this run`);
    if (item.owner_marker_digest !== ownerMarkerDigest) errors.push(`resource ledger ${resourceId} owner marker must match this run`);
  }
  for (const service of observedServices) {
    const item = ledgerById.get(service.id);
    if (!item) continue;
    if (item.resource_type !== "PROCESS") errors.push(`service ledger ${service.id} must use PROCESS resource type`);
    if (item.created_by_run !== "Yes") errors.push(`service ledger ${service.id} must be created by this run`);
    if (item.owner_marker_digest !== ownerMarkerDigest) errors.push(`service ledger ${service.id} owner marker must match this run`);
  }

  const expectedSessionIds = createdIds.filter((id) => resourceById.get(id)?.resource_type === "SESSION_NAMESPACE");
  const expectedDataIds = createdIds.filter((id) => resourceById.get(id)?.resource_type !== "SESSION_NAMESPACE");
  const sessions = Array.isArray(manifest?.session_contexts) ? manifest.session_contexts : [];
  const data = Array.isArray(manifest?.data_resources) ? manifest.data_resources : [];
  compareExactSequence(sessions.map((item) => item.id), expectedSessionIds, "manifest session resource ids", errors);
  compareExactSequence(data.map((item) => item.id), expectedDataIds, "manifest data resource ids", errors);
  for (const item of [...sessions, ...data]) {
    const planned = resourceById.get(item.id);
    if (!planned) continue;
    const expectedNamespace = digestText(`${manifest.run_id}|${planned.relative_path}`);
    if (item.namespace_digest !== expectedNamespace) errors.push(`resource ${item.id} namespace digest must match the Lifecycle Plan`);
    if (item.owned_by_run !== "Yes") errors.push(`resource ${item.id} must be owned by this run`);
  }
}

function validateCleanupReplay(manifest, lifecyclePlan, rows, observedServices, terminalEvent, errors) {
  const before = eventRows(rows, "CLEANUP_EVIDENCE_BEFORE_RECORDED");
  const cleanup = eventRows(rows, "CLEANING_UP");
  if (before.length !== 1) errors.push("lifecycle journal must contain exactly one CLEANUP_EVIDENCE_BEFORE_RECORDED event");
  if (cleanup.length !== 1) errors.push("lifecycle journal must contain exactly one CLEANING_UP event");
  if (before[0] && cleanup[0] && before[0].index >= cleanup[0].index) errors.push("cleanup evidence before must precede CLEANING_UP");
  const lastActionIndex = rows.reduce((latest, row, index) => LIFECYCLE_ACTION_EVENTS.has(row.event) ? index : latest, -1);
  if (before[0] && before[0].index <= lastActionIndex) errors.push("cleanup evidence before must follow all lifecycle action events");
  if (cleanup[0]) {
    const cleanupDispositionRows = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => ["PROCESS_CLEANED", "PROCESS_CLEANUP_BLOCKED", "RESOURCE_CLEANED", "RESOURCE_CLEANUP_BLOCKED"].includes(row.event));
    if (cleanupDispositionRows.some(({ index }) => index <= cleanup[0].index)) errors.push("process and resource cleanup dispositions must follow CLEANING_UP");
  }

  if (terminalEvent !== "COMPLETED") return;
  const cleanupEvents = rows
    .filter((row) => ["PROCESS_CLEANED", "RESOURCE_CLEANED"].includes(row.event))
    .map((row) => row.event === "PROCESS_CLEANED" ? `process:${row.action_id}` : `resource:${row.resource_id}`);
  const expectedCleanup = [
    ...observedServices.slice().reverse().map((item) => `process:${item.actionId}`),
    ...lifecyclePlan.resources.slice().reverse().map((item) => `resource:${item.resource_id}`),
  ];
  compareExactSequence(cleanupEvents, expectedCleanup, "lifecycle cleanup event sequence", errors);
  const ledger = new Map((manifest?.resource_ledger || []).map((item) => [item.resource_id, item]));
  for (const id of [...lifecyclePlan.resources.map((item) => item.resource_id), ...observedServices.map((item) => item.id)]) {
    if (ledger.get(id)?.cleanup_state !== "CLEANED") errors.push(`completed lifecycle resource ${id} must be recorded CLEANED`);
  }
  if (manifest?.cleanup_summary?.state !== "VERIFIED"
    || manifest?.cleanup_summary?.owned_resources_remaining !== 0
    || manifest?.cleanup_summary?.unrelated_resources_touched !== "No") {
    errors.push("completed lifecycle cleanup summary must be verified with zero owned resources and no unrelated changes");
  }
}

function terminalJournalEvent(rows) {
  return rows.find((row) => LIFECYCLE_TERMINAL_EVENTS.has(row.event))?.event || "";
}

function eventRows(rows, event) {
  return rows.map((row, index) => ({ row, index })).filter(({ row }) => row.event === event);
}

function actionStartRow(actionEvents, actionId) {
  return actionEvents.find(({ row }) => row.event === "ACTION_STARTING" && row.action_id === actionId)?.row;
}

function actionStartIndex(actionEvents, actionId) {
  return actionEvents.find(({ row }) => row.event === "ACTION_STARTING" && row.action_id === actionId)?.index ?? Number.POSITIVE_INFINITY;
}

function compareExactSequence(actualValue, expectedValue, label, errors) {
  const actual = Array.isArray(actualValue) ? actualValue : [];
  const expected = Array.isArray(expectedValue) ? expectedValue : [];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) errors.push(`${label} must exactly match lifecycle replay; expected [${expected.join(", ")}], got [${actual.join(", ")}]`);
}

function comparePrefix(actualValue, expectedValue, label, errors) {
  const actual = Array.isArray(actualValue) ? actualValue : [];
  const expected = Array.isArray(expectedValue) ? expectedValue : [];
  if (actual.length > expected.length || actual.some((item, index) => item !== expected[index])) {
    errors.push(`${label} must be an ordered prefix of the Lifecycle Plan`);
  }
}

function ledgerResourceType(type) {
  if (type === "DATABASE_FILE") return "DATABASE";
  if (type === "CACHE_NAMESPACE") return "CACHE";
  if (type === "SESSION_NAMESPACE") return "SESSION";
  return "FILE";
}

function validTime(value) {
  return Number.isFinite(Date.parse(String(value || "")));
}

function controlReason(control, requirement, tier) {
  if (requirement === "BLOCKED") return `${control} cannot be resolved until POSSIBLE_HIGH classification is complete.`;
  if (requirement === "NOT_REQUIRED") return `${control} is not mandatory for ${tier} unless project facts raise the tier.`;
  if (requirement === "CONDITIONAL") return `${control} is required when the targeted behavior consumes that resource.`;
  return `${control} is required for ${tier} runtime trust.`;
}

function validTimeOrder(startValue, endValue) {
  const start = Date.parse(String(startValue || ""));
  const end = Date.parse(String(endValue || ""));
  return Number.isFinite(start) && Number.isFinite(end) && start <= end;
}
