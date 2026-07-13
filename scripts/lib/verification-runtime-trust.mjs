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
