import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { evidenceDigest, extractMachineReadableEvidence } from "./artifact-schema.mjs";
import { validateVerifiedApplyReceiptFile } from "./adoption-apply-chain.mjs";
import { projectGoalProjection } from "./project-fact-projection.mjs";
import {
  normalizeTaskIntent,
  resolveWorkQueueTaskIdentity,
  taskIntentDigest,
  validateTaskGovernanceLineage,
} from "./task-entry-binding.mjs";

export function recommendBehavioralAdoption(options = {}) {
  const facts = options.projectFactProjection || {};
  const topology = options.targetTopology || {};
  const governance = facts.governance_authority_posture?.state || "LIGHT";
  const currentWork = facts.current_work_continuity?.state || "NO_CURRENT_WORK";
  const blockers = [];
  if ((facts.conflicts || []).some((item) => item.affected_scope === "GLOBAL_TRUST" && item.state === "BLOCKING")) blockers.push("GLOBAL_PROJECT_TRUST_BLOCKED");
  if (currentWork === "CURRENT_CONFLICTED") blockers.push("CURRENT_WORK_CONFLICTED");

  let path = "INTENTOS_NATIVE_GOVERNANCE";
  if (topology.state === "ABSENT_LEAF" || topology.state === "EMPTY_DIRECTORY") path = "CONTROLLED_NEW_PROJECT_SETUP";
  else if (["DECLARED_STRONG_GOVERNED", "DECLARED_GOVERNED"].includes(governance)) path = "SELECTED_NATIVE_OVERLAY";

  const base = {
    schema_version: "1.109.0",
    artifact_type: "behavioral_adoption_recommendation",
    project_binding: facts.project_identity || {},
    target_topology_digest: topology.topology_digest || "N/A",
    recommended_path: blockers.length > 0 ? "READ_ONLY_REPAIR" : path,
    target_behavioral_state: "VERIFIED_ACTIVE",
    preserve_project_authority: path === "SELECTED_NATIVE_OVERLAY" ? "Yes" : "As applicable",
    derive_missing_governance: path === "INTENTOS_NATIVE_GOVERNANCE" ? "Yes" : "No",
    current_work_handling: currentWork === "NO_CURRENT_WORK" ? "NO_CURRENT_WORK" : "MAP_AND_PRESERVE",
    user_technical_choice_required: "No",
    blockers,
    boundaries: {
      authorizes_apply: "No",
      replaces_project_release_authority: "No",
      proves_activation: "No",
    },
  };
  return { ...base, recommendation_digest: evidenceDigest(base, []) };
}

export function resolveBehavioralAdoptionActivation(options = {}) {
  const route = options.routeCalibration || {};
  const coldStart = options.coldStart || {};
  const receipt = options.applyReceipt || {};
  const firstTask = options.firstTask || null;
  const blockers = [];

  if (sourceState(receipt) !== "APPLY_VERIFIED") blockers.push("APPLY_RECEIPT_NOT_VERIFIED");
  if (sourceState(coldStart) !== "COLD_START_VERIFIED") blockers.push("PROJECT_LOCAL_COLD_START_NOT_VERIFIED");
  if (sourceState(route) !== "ROUTE_VERIFIED") blockers.push("INTENTOS_ROUTE_NOT_VERIFIED");
  if (coldStart.source_tree_unchanged !== "Yes") blockers.push("SOURCE_TREE_UNCHANGED_NOT_PROVED");
  if (route.project_work_queue_unchanged !== "Yes") blockers.push("PROJECT_WORK_QUEUE_UNCHANGED_NOT_PROVED");
  if (route.synthetic_current_items_created !== "No") blockers.push("SYNTHETIC_CURRENT_WORK_DETECTED");
  if (route.work_queue_takeover_state !== "VERIFIED") blockers.push("WORK_QUEUE_TAKEOVER_NOT_VERIFIED");
  if (route.task_governance_binding_state !== "VERIFIED") blockers.push("CURRENT_TASK_GOVERNANCE_NOT_VERIFIED");
  if (route.durable_takeover_state === "BLOCKED") blockers.push("DURABLE_EXISTING_PROJECT_TAKEOVER_NOT_VERIFIED");
  if (route.fresh_process_resume_state !== "VERIFIED") blockers.push("FRESH_PROCESS_CURRENT_TASK_RESUME_NOT_VERIFIED");
  if (route.current_intent_binding_state !== "VERIFIED") blockers.push("CURRENT_TASK_INTENT_NOT_BOUND_TO_ACTIVATION");
  if (route.current_task_binding_state !== "VERIFIED") blockers.push("CURRENT_TASK_INSTANCE_NOT_BOUND_TO_ACTIVATION");
  if (route.project_revision_binding_state !== "VERIFIED") blockers.push("PROJECT_REVISION_NOT_BOUND_TO_ACTIVATION");
  if (route.agent_authority_state !== "CURRENT") blockers.push("AGENT_AUTHORITY_NOT_CURRENT");
  for (const [label, value] of [["apply receipt", receipt], ["cold start", coldStart], ["route calibration", route]]) {
    if (!validSource(value)) blockers.push(`${label.toUpperCase().replaceAll(" ", "_")}_SOURCE_INVALID`);
  }

  const activationState = blockers.length === 0 ? "VERIFIED_ACTIVE" : "BLOCKED";
  const firstTaskState = activationState !== "VERIFIED_ACTIVE"
    ? "NOT_STARTED"
    : sourceState(firstTask) === "STRICT_FINISH_VERIFIED"
      ? "VERIFIED"
      : firstTask?.state ? "BLOCKED" : "NOT_STARTED";
  const base = {
    schema_version: "1.109.0",
    artifact_type: "behavioral_adoption_activation",
    project_binding: options.projectBinding || {},
    goal_digest: String(options.goalDigest || "N/A"),
    apply_receipt: source(receipt),
    cold_start: source(coldStart),
    route_calibration: source(route),
    activation_state: activationState,
    first_task_state: firstTaskState,
    first_task: firstTask ? source(firstTask) : { ref: "N/A", digest: "N/A", state: "NOT_STARTED" },
    blockers,
    boundaries: {
      changes_work_queue: "No",
      proves_product_correctness: "No",
      proves_release_readiness: "No",
      authorizes_production: "No",
    },
    outcome: activationState,
  };
  return { ...base, activation_digest: evidenceDigest(base, []) };
}

export function validateBehavioralActivation(value, options = {}) {
  const errors = [];
  const { activation_digest: _digest, ...base } = value || {};
  if (value?.activation_digest !== evidenceDigest(base, [])) errors.push("activation digest is not canonical");
  if (options.projectBinding !== undefined && JSON.stringify(value?.project_binding) !== JSON.stringify(options.projectBinding)) errors.push("activation belongs to another project or revision");
  if (options.goalDigest !== undefined && value?.goal_digest !== options.goalDigest) errors.push("activation belongs to another goal");
  if (value?.activation_state === "VERIFIED_ACTIVE" && (value.blockers || []).length > 0) errors.push("verified activation cannot retain blockers");
  if (value?.first_task_state === "VERIFIED" && value?.activation_state !== "VERIFIED_ACTIVE") errors.push("first task cannot be verified before activation");
  for (const field of ["apply_receipt", "cold_start", "route_calibration"]) {
    if (!validNormalizedSource(value?.[field])) errors.push(`${field} must bind one exact current source`);
  }
  if (value?.first_task_state === "VERIFIED" && !validNormalizedSource(value?.first_task)) errors.push("verified first task must bind one exact source");
  return { ok: errors.length === 0, errors };
}

export function verifyProjectLocalBehavioralRoute(options = {}) {
  const targetRoot = path.resolve(options.targetRoot || ".");
  const sourceRoot = options.sourceRoot ? path.resolve(options.sourceRoot) : "";
  const sourceInventory = Array.isArray(options.sourceInventory) ? options.sourceInventory : [];
  const allowProjectLocalExecution = options.allowProjectLocalExecution === true;
  const executionRoot = allowProjectLocalExecution ? targetRoot : sourceRoot;
  const goal = String(options.goal || "start the first ordinary product task").trim();
  const expectedGoalDigest = String(options.expectedGoalDigest || projectGoalProjection(goal).goal_digest);
  const targetBefore = directoryObservation(targetRoot);
  const projectRevisionBefore = projectRevisionObservation(targetRoot);
  const expectedProjectRevision = String(options.expectedProjectRevision || projectRevisionBefore);
  const sharedSourceAndTarget = Boolean(sourceRoot && sourceRoot === targetRoot);
  const sourceBefore = sourceRoot
    ? (sharedSourceAndTarget ? targetBefore : sourceObservation(sourceRoot, sourceInventory))
    : "N/A";
  const isolation = createActivationRuntimeIsolation();
  const activationEnv = {
    INTENTOS_BOOTSTRAP_ACTIVATION_TRANSACTION: String(options.transaction?.transaction_id || ""),
    INTENTOS_BOOTSTRAP_ACTIVATION_ENVELOPE_DIGEST: String(options.transaction?.envelope_digest || ""),
    ...(options.activationEnvironment || {}),
    ...isolation.environment,
  };
  const requireCurrentIntentBinding = options.requireCurrentIntentBinding === true
    || Boolean(options.transaction?.transaction_id)
    || Boolean(options.requestBoundInitialQueue);
  const deniedSourceRoot = allowProjectLocalExecution && sourceRoot && sourceRoot !== targetRoot ? sourceRoot : "";
  const deniedExecutionRoot = !allowProjectLocalExecution && sourceRoot && sourceRoot !== targetRoot ? targetRoot : "";
  const accessDenyPreload = deniedSourceRoot || deniedExecutionRoot
    ? createActivationBoundaryPreload({
        deniedSourceRoot,
        deniedExecutionRoot,
        isolationRoot: isolation.root,
      })
    : "";
  const unavailable = (name) => ({ name, exit_code: -1, parsed: null, output_digest: evidenceDigest("missing trusted execution root", []), error: "trusted execution root is unavailable" });
  const run = (name, relativeScript, args) => executionRoot
    ? runProjectLocalResolver(targetRoot, executionRoot, name, relativeScript, args, activationEnv, accessDenyPreload)
    : unavailable(name);
  let workflow;
  let queue;
  let governance;
  let planning;
  let review;
  let verification;
  let finish;
  let resumeQueue;
  try {
    workflow = run("workflow-next", "scripts/workflow-next.mjs", [targetRoot, "--json", "--intent", goal]);
    queue = run("work-queue", "scripts/resolve-work-queue.mjs", [targetRoot, "--json"]);
    const queueIntent = resolveCurrentQueueIntent(targetRoot, queue.parsed);
    const requestBoundInitialQueue = inspectRequestBoundInitialQueue(
      targetRoot,
      queueIntent,
      options.requestBoundInitialQueue,
    );
    const strictRoute = resolveGovernedCurrentTaskRoute({ targetRoot, queueReport: queue.parsed });
    const governedIntent = strictRoute.intent || queueIntent.intent || goal;
    const strictRequired = requiresDurableExistingProjectTakeover(targetRoot);
    governance = strictRoute.state === "VERIFIED"
      ? run("task-governance", "scripts/resolve-task-governance.mjs", [
          targetRoot,
          "--json",
          "--intent", governedIntent,
          "--work-queue-item", strictRoute.work_queue_item_ref,
        ])
      : requestBoundInitialQueue.state === "VERIFIED"
        // The exact initial request and queue files are already part of the
        // approved adoption action graph. Activation may classify that first
        // task before its durable takeover report exists; no unrelated or
        // compatibility-only queue receives this exception.
        ? run("task-governance", "scripts/resolve-task-governance.mjs", [
            targetRoot,
            "--json",
            "--intent", governedIntent,
          ])
      : strictRequired
        ? unavailable("task-governance", `strict current-task route is unavailable: ${strictRoute.blockers.join("; ")}`)
        : run("task-governance", "scripts/resolve-task-governance.mjs", [targetRoot, "--json", "--intent", governedIntent]);
    const planningArgs = [targetRoot, "--json", "--intent", governedIntent];
    if (strictRoute.state === "VERIFIED") {
      planningArgs.push(
        "--task-ref", strictRoute.task_ref,
        "--intent-digest", strictRoute.intent_digest,
        "--task-governance-report", strictRoute.task_governance_ref,
      );
    }
    planning = run("planning-closure", "scripts/resolve-planning-closure.mjs", planningArgs);
    review = run("review-surface", "scripts/resolve-review-surface.mjs", [targetRoot, "--json", "--intent", governedIntent]);
    verification = run("verification-plan", "scripts/resolve-verification-plan.mjs", [targetRoot, "--json", "--intent", governedIntent, "--project-level", "BL1", "--platform", "generic"]);
    finish = run("strict-finish-guard", "scripts/resolve-closure-decision.mjs", [targetRoot, "--json", "--intent", governedIntent]);
    resumeQueue = run("work-queue-resume-probe", "scripts/resolve-work-queue.mjs", [targetRoot, "--json"]);
  } finally {
    isolation.cleanup();
  }
  const results = [workflow, queue, governance, review, verification, finish];
  const targetAfter = directoryObservation(targetRoot);
  const sourceAfter = sourceRoot
    ? (sharedSourceAndTarget ? targetAfter : sourceObservation(sourceRoot, sourceInventory))
    : "N/A";
  const workflowTrust = workflow?.parsed?.projectEntryTrust;
  const workQueueTakeover = inspectGovernedWorkQueueTakeover({
    targetRoot,
    goal,
    expectedGoalDigest,
    requireCurrentIntentBinding,
    requestBoundInitialQueue: options.requestBoundInitialQueue,
    queueReport: queue.parsed,
    taskGovernanceReport: governance.parsed,
    resumeQueueReport: resumeQueue.parsed,
  });
  const targetUnchanged = targetBefore === targetAfter;
  const sourceUnchanged = sourceBefore === sourceAfter;
  const projectRevisionAfter = projectRevisionObservation(targetRoot);
  const projectRevisionBindingState = projectRevisionBefore === expectedProjectRevision
    && projectRevisionAfter === expectedProjectRevision
    ? "VERIFIED"
    : "BLOCKED";
  const workflowReady = workflow?.exit_code === 0
    && workflow?.parsed?.projectEntryTrust?.entry_state === "READY_FOR_INTENTOS_OPERATION"
    && ["INSTALLED_CURRENT", "BRIDGE_CURRENT"].includes(workflow?.parsed?.projectEntryTrust?.project_identity?.state);
  const routeReady = queue?.exit_code === 0
    && governance?.exit_code === 0
    && planning?.exit_code === 0
    && review?.exit_code === 0
    && verification?.exit_code === 0
    && finish?.exit_code === 0
    && resumeQueue?.exit_code === 0
    && queue.parsed?.reportType === "WORK_QUEUE_RECOMMENDATION"
    && governance.parsed?.reportType === "TASK_GOVERNANCE"
    && planning.parsed?.reportType === "PLANNING_CLOSURE"
    && review.parsed?.reportType === "REVIEW_SURFACE_CARD"
    && verification.parsed?.reportType === "VERIFICATION_PLAN"
    && finish.parsed?.closureDecision?.canCountAsDone === "No"
    && workQueueTakeover.state === "VERIFIED"
    && projectRevisionBindingState === "VERIFIED"
    && workflowTrust?.guidance_authority?.agent_authority_state === "CURRENT";
  const errors = [];
  if (!workflowReady) {
    const detail = [
      workflow?.error,
      workflow?.outcome,
      workflowTrust?.entry_state,
      workflowTrust?.project_identity?.reason,
      workflowTrust?.guidance_authority?.reason,
      ...(workflowTrust?.guidance_authority?.invalid_nodes || []).map((item) => `${item.path}:${item.state}:${(item.conflict_codes || []).join(",")}`),
      ...(workflowTrust?.guidance_authority?.cycles || []).map((item) => `guidance-cycle:${Array.isArray(item) ? item.join(" -> ") : String(item)}`),
      ...(workflowTrust?.blockers || []),
    ].filter(Boolean).join("; ");
    errors.push(`generated project cold start failed: ${detail || "invalid workflow-next state"}`);
  }
  if (!routeReady) {
    const routeFailures = results.flatMap((item) => {
      const expectedType = {
        "work-queue": "WORK_QUEUE_RECOMMENDATION",
        "task-governance": "TASK_GOVERNANCE",
        "review-surface": "REVIEW_SURFACE_CARD",
        "verification-plan": "VERIFICATION_PLAN",
      }[item.name];
      const actualType = item.parsed?.reportType || "MISSING_REPORT_TYPE";
      if (item.name === "strict-finish-guard") {
        return item.exit_code === 0 && item.parsed?.closureDecision?.canCountAsDone === "No"
          ? []
          : [`${item.name}:exit=${item.exit_code}:canCountAsDone=${item.parsed?.closureDecision?.canCountAsDone || "UNKNOWN"}:${item.error || item.outcome}`];
      }
      if (!expectedType) return [];
      return item.exit_code === 0 && actualType === expectedType
        ? []
        : [`${item.name}:exit=${item.exit_code}:type=${actualType}:${item.error || item.outcome}`];
    });
    const queueFailures = workQueueTakeover.blockers || [];
    if (resumeQueue?.exit_code !== 0) routeFailures.push(`work-queue-resume-probe:exit=${resumeQueue?.exit_code}:${resumeQueue?.error || resumeQueue?.outcome}`);
    errors.push(`generated project did not route through a governed Work Queue takeover, Task Governance, review, verification, and a fail-closed finish guard${routeFailures.length > 0 || queueFailures.length > 0 ? ` (${[...routeFailures, ...queueFailures].join("; ")})` : ""}`);
  }
  if (!targetUnchanged) errors.push("generated-project route calibration changed target files");
  if (!sourceUnchanged) errors.push("generated-project route calibration changed the IntentOS source tree");
  if (projectRevisionBindingState !== "VERIFIED") errors.push("generated-project route calibration did not preserve the exact activation project revision");
  const projectLocalRoute = allowProjectLocalExecution && executionRoot === targetRoot;
  const coldBase = {
    ref: "runtime:generated-project-cold-start",
    state: workflowReady && targetUnchanged && sourceUnchanged
      ? projectLocalRoute ? "COLD_START_VERIFIED" : "SOURCE_DRIVEN_READ_ONLY_VERIFIED"
      : "BLOCKED",
    exit_code: workflow?.exit_code ?? -1,
    project_entry_state: workflow?.parsed?.projectEntryTrust?.entry_state || "UNKNOWN",
    source_tree_unchanged: sourceUnchanged ? "Yes" : "No",
    target_tree_unchanged: targetUnchanged ? "Yes" : "No",
    output_digest: workflow?.output_digest || evidenceDigest("not-run", []),
  };
  const coldStart = { ...coldBase, digest: evidenceDigest(coldBase, []) };
  const routeBase = {
    ref: "runtime:generated-project-route-calibration",
    state: routeReady && targetUnchanged
      ? projectLocalRoute ? "ROUTE_VERIFIED" : "SOURCE_DRIVEN_ROUTE_VERIFIED"
      : "BLOCKED",
    project_work_queue_unchanged: targetUnchanged ? "Yes" : "No",
    synthetic_current_items_created: "No",
    work_queue_takeover_state: workQueueTakeover.state,
    current_item_ref: workQueueTakeover.current_item_ref,
    current_item_digest: workQueueTakeover.current_item_digest,
    task_governance_binding_state: workQueueTakeover.task_governance_binding_state,
    task_governance_digest: workQueueTakeover.task_governance_digest,
    durable_takeover_state: workQueueTakeover.durable_takeover_state,
    durable_takeover_ref: workQueueTakeover.durable_takeover_ref,
    fresh_process_resume_state: workQueueTakeover.fresh_process_resume_state,
    current_intent_binding_state: workQueueTakeover.current_intent_binding_state,
    current_task_binding_state: workQueueTakeover.current_task_binding_state,
    activation_goal_digest: expectedGoalDigest,
    activation_task_digest: workQueueTakeover.current_item_digest,
    project_revision: expectedProjectRevision,
    project_revision_binding_state: projectRevisionBindingState,
    agent_authority_state: workflowTrust?.guidance_authority?.agent_authority_state || "INVALID",
    agent_authority_digest: workflowTrust?.guidance_authority?.agent_authority_digest || "N/A",
    source_refs: [...results, resumeQueue].map((item) => `${item.name}:${item.output_digest}`),
    public_task_route: {
      state: workQueueTakeover.public_task_route_state,
      sequence: workQueueTakeover.public_task_route,
      planning_closure_ref: planning?.parsed?.structuredEvidence?.report_ref || "runtime:planning-closure",
      planning_closure_digest: planning?.parsed?.structuredEvidence?.report_digest || planning?.output_digest || "N/A",
    },
  };
  routeBase.source_refs.push(`planning-closure:${planning?.output_digest || "N/A"}`);
  const routeCalibration = { ...routeBase, digest: evidenceDigest(routeBase, []) };
  return {
    ok: errors.length === 0,
    state: errors.length === 0 ? projectLocalRoute ? "VERIFIED_ACTIVE" : "READ_ONLY_SIMULATION_PASSED" : "BLOCKED",
    coldStart,
    routeCalibration,
    workQueueTakeover,
    results: results.map((item) => ({
      name: item.name,
      exit_code: item.exit_code,
      output_digest: item.output_digest,
      outcome: item.outcome,
      error: item.error,
    })),
    errors,
  };
}

export function inspectGovernedWorkQueueTakeover(options = {}) {
  const targetRoot = path.resolve(options.targetRoot || ".");
  const queue = options.queueReport || {};
  const resumeQueue = options.resumeQueueReport || {};
  const governanceReport = options.taskGovernanceReport || {};
  const blockers = [];
  const currentResolution = resolveCurrentQueueIntent(targetRoot, queue);
  blockers.push(...currentResolution.blockers);
  const requestBoundInitialQueue = inspectRequestBoundInitialQueue(
    targetRoot,
    currentResolution,
    options.requestBoundInitialQueue,
  );
  const requireDurableGovernance = (options.requireDurableGovernance === true
    || requiresDurableExistingProjectTakeover(targetRoot))
    && requestBoundInitialQueue.state !== "VERIFIED";

  const inventory = queue.queueInventory || {};
  if (queue.reportType !== "WORK_QUEUE_RECOMMENDATION") blockers.push("WORK_QUEUE_REPORT_TYPE_INVALID");
  if (!Number.isInteger(inventory.queueReportCount) || inventory.queueReportCount < 1) blockers.push("WORK_QUEUE_HAS_NO_DURABLE_REPORT");
  if (!Number.isInteger(inventory.parsedRowCount) || inventory.parsedRowCount < 1) blockers.push("WORK_QUEUE_HAS_NO_STRUCTURED_ITEM");
  if (inventory.canonicalizationConflictCount !== 0 || (queue.canonicalizationConflicts || []).length > 0) blockers.push("WORK_QUEUE_CANONICALIZATION_CONFLICT");
  if (queue.currentTaskCount !== 1 || (queue.currentTaskCandidates || []).length !== 1) blockers.push("WORK_QUEUE_REQUIRES_EXACTLY_ONE_CURRENT");

  const current = currentResolution.item;
  if (current) {
    if (!stableTaskId(current.taskId)) blockers.push("CURRENT_ITEM_ID_INVALID");
    if (!meaningfulValue(current.title)) blockers.push("CURRENT_ITEM_TITLE_INVALID");
    if (!meaningfulValue(current.evidence)) blockers.push("CURRENT_ITEM_EVIDENCE_INVALID");
    if (!Array.isArray(current.representedBy) || current.representedBy.length === 0) blockers.push("CURRENT_ITEM_HAS_NO_STRUCTURED_SOURCE_ROW");
  }

  const governance = governanceReport.structuredEvidence || {};
  const governanceErrors = [];
  if (governanceReport.reportType !== "TASK_GOVERNANCE" || governance.artifact_type !== "task_governance") {
    governanceErrors.push("CURRENT_ITEM_TASK_GOVERNANCE_MISSING");
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(String(governance.task_governance_digest || ""))
    || governance.task_governance_digest !== evidenceDigest(governance, ["task_governance_digest"])) {
    governanceErrors.push("CURRENT_ITEM_TASK_GOVERNANCE_DIGEST_INVALID");
  }
  if (!currentResolution.intent
    || normalizeIntent(governance.intent) !== normalizeIntent(currentResolution.intent)
    || governance.intent_digest !== rawSha256(currentResolution.intent)) {
    governanceErrors.push("CURRENT_ITEM_TASK_GOVERNANCE_INTENT_MISMATCH");
  }
  if (!/^task:[a-f0-9]{64}$/.test(String(governance.task_ref || ""))) governanceErrors.push("CURRENT_ITEM_TASK_GOVERNANCE_REF_INVALID");
  if (path.resolve(String(governanceReport.projectRoot || "")) !== targetRoot) governanceErrors.push("CURRENT_ITEM_TASK_GOVERNANCE_PROJECT_MISMATCH");
  if (governance.readiness?.implementation_authorized_by_this_report !== "No"
    || governance.readiness?.can_claim_done !== "No") {
    governanceErrors.push("CURRENT_ITEM_TASK_GOVERNANCE_BOUNDARY_INVALID");
  }
  const discoveredDurableBinding = inspectDurableTakeoverBinding(targetRoot, currentResolution);
  const durableBinding = requireDurableGovernance || discoveredDurableBinding.state === "VERIFIED"
    ? discoveredDurableBinding
    : requestBoundInitialQueue.state === "VERIFIED"
      ? {
          state: "VERIFIED_REQUEST_BOUND_INITIAL_QUEUE",
          takeoverRef: requestBoundInitialQueue.queueRef,
          taskGovernanceRef: "runtime:task-governance",
          taskGovernanceDigest: governance.task_governance_digest || "N/A",
          blockers: [],
        }
      : {
          state: "NOT_REQUIRED_NEW_PROJECT",
          takeoverRef: "N/A",
          taskGovernanceRef: governance.task_governance_ref || "runtime:task-governance",
          taskGovernanceDigest: governance.task_governance_digest || "N/A",
          blockers: [],
        };
  if (durableBinding.state === "VERIFIED") {
    const runtimeLineage = validateTaskGovernanceLineage(targetRoot, governance, {
      requireCurrent: true,
      requireWorkQueueAuthority: true,
    });
    governanceErrors.push(...runtimeLineage.errors.map((error) => `CURRENT_ITEM_TASK_GOVERNANCE_LINEAGE_INVALID:${error}`));
    if (runtimeLineage.ok
      && (runtimeLineage.workQueue.identity.work_queue_item_ref !== durableBinding.workQueueItemRef
        || runtimeLineage.workQueue.identity.work_queue_item_digest !== durableBinding.workQueueItemDigest
        || governance.task_ref !== durableBinding.taskRef
        || governance.intent_digest !== durableBinding.intentDigest)) {
      governanceErrors.push("CURRENT_ITEM_TASK_GOVERNANCE_LINEAGE_MISMATCH");
    }
  } else if (requireDurableGovernance && governance.task_lineage?.authority !== "WORK_QUEUE_ITEM") {
    governanceErrors.push("CURRENT_ITEM_TASK_GOVERNANCE_REJECTED_UNBOUND_COMPATIBILITY");
  }
  if (requireDurableGovernance && durableBinding.state !== "VERIFIED") {
    governanceErrors.push(...durableBinding.blockers);
  }
  blockers.push(...governanceErrors);

  const firstProjection = stableQueueProjection(queue);
  const resumeProjection = stableQueueProjection(resumeQueue);
  const freshProcessResumeState = resumeQueue.reportType === "WORK_QUEUE_RECOMMENDATION"
    && firstProjection
    && firstProjection === resumeProjection
    ? "VERIFIED"
    : "BLOCKED";
  if (freshProcessResumeState !== "VERIFIED") blockers.push("FRESH_PROCESS_DID_NOT_RESOLVE_SAME_CURRENT_ITEM");

  const expectedGoalDigest = String(options.expectedGoalDigest || projectGoalProjection(options.goal).goal_digest);
  const currentIntentMatches = Boolean(currentResolution.intent)
    && normalizeIntent(currentResolution.intent) === normalizeIntent(options.goal)
    && currentResolution.item?.intentDigest === expectedGoalDigest;
  const currentIntentBindingState = options.requireCurrentIntentBinding === true
    ? currentIntentMatches ? "VERIFIED" : "BLOCKED"
    : "NOT_REQUIRED";
  if (options.requireCurrentIntentBinding === true && !currentIntentMatches) blockers.push("CURRENT_ITEM_DOES_NOT_MATCH_ACTIVATION_INTENT");
  const currentTaskBindingState = governanceErrors.length === 0
    && /^task:[a-f0-9]{64}$/.test(String(governance.task_ref || ""))
    && (durableBinding.taskRef === undefined || durableBinding.taskRef === governance.task_ref)
    ? "VERIFIED"
    : "BLOCKED";
  if (currentTaskBindingState !== "VERIFIED") blockers.push("CURRENT_ITEM_TASK_INSTANCE_MISMATCH");

  const uniqueBlockers = [...new Set(blockers)];
  const publicTaskRouteState = ["VERIFIED", "VERIFIED_REQUEST_BOUND_INITIAL_QUEUE"].includes(durableBinding.state)
    && governanceErrors.length === 0
    ? "VERIFIED"
    : requireDurableGovernance ? "BLOCKED" : "COMPATIBILITY_NEW_PROJECT";
  const publicTaskRoute = publicRouteSteps(currentResolution, durableBinding);
  const base = {
    state: uniqueBlockers.length === 0 ? "VERIFIED" : "BLOCKED",
    current_item_ref: currentResolution.currentItemRef,
    current_item_digest: currentResolution.currentItemDigest,
    current_task_ref: current?.taskRef || "N/A",
    current_intent_digest: current?.intentDigest || "N/A",
    task_governance_binding_state: governanceErrors.length === 0 ? "VERIFIED" : "BLOCKED",
    task_governance_ref: durableBinding.taskGovernanceRef,
    task_governance_digest: durableBinding.taskGovernanceDigest,
    durable_takeover_state: durableBinding.state,
    durable_takeover_ref: durableBinding.takeoverRef,
    fresh_process_resume_state: freshProcessResumeState,
    current_intent_binding_state: currentIntentBindingState,
    current_task_binding_state: currentTaskBindingState,
    public_task_route_state: publicTaskRouteState,
    public_task_route: publicTaskRoute,
    blockers: uniqueBlockers,
  };
  return { ...base, takeover_digest: evidenceDigest(base, []) };
}

export function resolveGovernedCurrentTaskRoute(options = {}) {
  const targetRoot = path.resolve(options.targetRoot || ".");
  const currentResolution = resolveCurrentQueueIntent(targetRoot, options.queueReport || {});
  const durable = inspectDurableTakeoverBinding(targetRoot, currentResolution);
  const blockers = [...new Set([...currentResolution.blockers, ...durable.blockers])];
  const base = {
    state: blockers.length === 0 && durable.state === "VERIFIED" ? "VERIFIED" : "BLOCKED",
    intent: durable.intent || currentResolution.intent || "",
    intent_digest: durable.intentDigest || "N/A",
    work_queue_ref: currentResolution.queueRef,
    work_queue_digest: currentResolution.queueDigest,
    current_item_ref: currentResolution.currentItemRef,
    current_item_digest: currentResolution.currentItemDigest,
    takeover_ref: durable.takeoverRef,
    takeover_digest: durable.takeoverDigest,
    work_queue_item_ref: durable.workQueueItemRef,
    work_queue_item_digest: durable.workQueueItemDigest,
    task_ref: durable.taskRef || "N/A",
    task_governance_ref: durable.taskGovernanceRef,
    task_governance_digest: durable.taskGovernanceDigest,
    public_route: publicRouteSteps(currentResolution, durable),
    blockers,
  };
  return { ...base, route_digest: evidenceDigest(base, []) };
}

export function resolveVerifiedInitialTaskIntake(options = {}) {
  const targetRoot = path.resolve(options.targetRoot || ".");
  const currentResolution = resolveCurrentQueueIntent(targetRoot, options.queueReport || {});
  const receipts = durableMarkdownFiles(targetRoot, "apply-receipts");
  const matches = new Map();
  const blockers = [];
  for (const receiptRef of receipts) {
    let validation;
    try {
      validation = validateVerifiedApplyReceiptFile(targetRoot, receiptRef);
    } catch {
      continue;
    }
    if (!validation.ok || validation.value?.execution_plan?.operation_kind !== "NATIVE_ADOPTION") continue;
    const receipt = validation.value;
    const planFile = readDurableProjectFile(targetRoot, receipt.execution_plan.path, {
      requiredPrefix: "apply-execution-plans/",
      label: "initial intake apply plan",
    });
    if (!planFile.ok) continue;
    let plan;
    try { plan = JSON.parse(planFile.content); } catch { continue; }
    if (plan.planDigest !== receipt.execution_plan.plan_digest
      || plan.arguments?.projectEntryOrigin !== "EXISTING_PROJECT"
      || !normalizeIntent(plan.arguments?.goal)
      || !/^sha256:[a-f0-9]{64}$/.test(String(plan.arguments?.goalDigest || ""))) continue;
    const applied = (receipt.actions || []).filter((action) => action.result === "APPLIED");
    const requestActions = applied.filter((action) => (action.target_paths || [])
      .some((value) => /^requests\/[A-Za-z0-9._-]+\.md$/.test(String(value))));
    const queueActions = applied.filter((action) => (action.target_paths || [])
      .some((value) => /^work-queue\/[A-Za-z0-9._-]+\.md$/.test(String(value))));
    if (requestActions.length !== 1 || queueActions.length !== 1) continue;
    const requestPath = requestActions[0].target_paths.find((value) => /^requests\/[A-Za-z0-9._-]+\.md$/.test(String(value)));
    const queuePath = queueActions[0].target_paths.find((value) => /^work-queue\/[A-Za-z0-9._-]+\.md$/.test(String(value)));
    const proof = {
      intent: plan.arguments.goal,
      intent_digest: plan.arguments.goalDigest,
      request_path: requestPath,
      request_digest: requestActions[0].hash_after,
      queue_path: queuePath,
      queue_digest: queueActions[0].hash_after,
    };
    const inspected = inspectRequestBoundInitialQueue(targetRoot, currentResolution, proof);
    if (inspected.state !== "VERIFIED") continue;
    const key = [queuePath, proof.queue_digest, requestPath, proof.request_digest, proof.intent_digest].join("\n");
    matches.set(key, {
      state: "VERIFIED",
      intent: normalizeIntent(proof.intent),
      intent_digest: proof.intent_digest,
      current_item_ref: currentResolution.currentItemRef,
      current_item_digest: currentResolution.currentItemDigest,
      queue_ref: currentResolution.queueRef,
      queue_digest: currentResolution.queueDigest,
      receipt_ref: receiptRef,
      receipt_digest: rawSha256(fs.readFileSync(path.join(targetRoot, receiptRef), "utf8")),
      blockers: [],
    });
  }
  const selected = [...matches.values()];
  if (selected.length !== 1) blockers.push(selected.length === 0
    ? "VERIFIED_INITIAL_TASK_INTAKE_MISSING"
    : "VERIFIED_INITIAL_TASK_INTAKE_AMBIGUOUS");
  const base = selected[0] || {
    state: "BLOCKED",
    intent: "",
    intent_digest: "N/A",
    current_item_ref: currentResolution.currentItemRef,
    current_item_digest: currentResolution.currentItemDigest,
    queue_ref: currentResolution.queueRef,
    queue_digest: currentResolution.queueDigest,
    receipt_ref: "N/A",
    receipt_digest: "N/A",
    blockers,
  };
  return { ...base, intake_digest: evidenceDigest(base, []) };
}

function inspectRequestBoundInitialQueue(root, currentResolution, proof) {
  if (!proof || typeof proof !== "object") return { state: "NOT_PROVIDED", queueRef: "N/A" };
  const queueRef = normalizeProjectRelativePath(proof.queue_path);
  const requestRef = normalizeProjectRelativePath(proof.request_path);
  if (!/^work-queue\/[A-Za-z0-9._-]+\.md$/.test(queueRef)
    || !/^requests\/[A-Za-z0-9._-]+\.md$/.test(requestRef)) {
    return { state: "BLOCKED", queueRef: queueRef || "N/A" };
  }
  const queue = readDurableProjectFile(root, queueRef, { requiredPrefix: "work-queue/", label: "request-bound Work Queue" });
  const request = readDurableProjectFile(root, requestRef, { requiredPrefix: "requests/", label: "request-bound task request" });
  const current = currentResolution.item;
  const expectedIntent = normalizeIntent(proof.intent);
  const valid = queue.ok
    && request.ok
    && rawSha256(queue.content) === proof.queue_digest
    && rawSha256(request.content) === proof.request_digest
    && current?.source === queueRef
    && current?.taskRef === requestRef
    && current?.intentDigest === proof.intent_digest
    && normalizeIntent(currentResolution.intent) === expectedIntent
    && projectGoalProjection(expectedIntent).goal_digest === proof.intent_digest;
  return { state: valid ? "VERIFIED" : "BLOCKED", queueRef };
}

function resolveCurrentQueueIntent(targetRoot, queue) {
  const blockers = [];
  const candidates = Array.isArray(queue?.currentTaskCandidates) ? queue.currentTaskCandidates : [];
  const item = candidates.length === 1 ? candidates[0] : null;
  if (!item) return {
    item: null,
    intent: "",
    queueRef: "N/A",
    queueDigest: "N/A",
    currentItemRef: "N/A",
    currentItemDigest: "N/A",
    sourceTakeoverDigest: "N/A",
    blockers,
  };

  const source = readDurableProjectFile(targetRoot, artifactPath(item.source), {
    requiredPrefix: "work-queue/",
    label: "CURRENT Work Queue source",
  });
  if (!source.ok) blockers.push(source.error);
  const task = readDurableProjectFile(targetRoot, artifactPath(item.taskRef), {
    label: "CURRENT task source",
  });
  let intent = task.ok ? extractTaskIntent(task.content) : "";
  const titleIntent = normalizeTaskIntent(item.title);
  if (!intent && titleIntent && [taskIntentDigest(titleIntent), projectGoalProjection(titleIntent).goal_digest].includes(item.intentDigest)) {
    intent = titleIntent;
  }
  if (!intent) {
    if (!task.ok) blockers.push(task.error);
    blockers.push("CURRENT_TASK_SOURCE_HAS_NO_EXPLICIT_INTENT");
  }
  const projectedDigest = intent ? projectGoalProjection(intent).goal_digest : "";
  const directDigest = intent ? taskIntentDigest(intent) : "";
  if (!/^sha256:[a-f0-9]{64}$/.test(String(item.intentDigest || ""))) {
    blockers.push("CURRENT_ITEM_INTENT_DIGEST_INVALID");
  } else if (intent && ![projectedDigest, directDigest].includes(item.intentDigest)) {
    blockers.push("CURRENT_ITEM_INTENT_DIGEST_DOES_NOT_MATCH_TASK_SOURCE");
  }
  const currentItemRef = source.ok && stableTaskId(item.taskId)
    ? `${source.relativePath}#${item.taskId}`
    : "N/A";
  const currentItemDigest = source.ok && intent
    ? evidenceDigest({
        item: stableCurrentItem(item),
        queue_source_digest: source.digest,
        task_source_digest: task.ok ? task.digest : taskIntentDigest(intent),
      }, [])
    : "N/A";
  const sourceTakeoverDigest = source.ok && currentItemRef !== "N/A"
    ? rawSha256(`${currentItemRef}\n${source.content}`)
    : "N/A";
  return {
    item,
    intent,
    queueRef: source.ok ? source.relativePath : "N/A",
    queueDigest: source.ok ? source.digest : "N/A",
    currentItemRef,
    currentItemDigest,
    sourceTakeoverDigest,
    blockers,
  };
}

function inspectDurableTakeoverBinding(root, currentResolution) {
  const blockers = [];
  if (!currentResolution.item || !currentResolution.intent) {
    return emptyDurableBinding(["DURABLE_TAKEOVER_HAS_NO_CURRENT_ITEM"]);
  }
  const takeoverFiles = durableMarkdownFiles(root, "work-queue-takeover-reports");
  if (takeoverFiles.length === 0) blockers.push("DURABLE_WORK_QUEUE_TAKEOVER_REPORT_MISSING");
  const matches = new Map();
  for (const takeoverFile of takeoverFiles) {
    const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(root, takeoverFile), "utf8"));
    const evidence = extracted?.ok ? extracted.value : null;
    if (!evidence || evidence.artifact_type !== "work_queue_takeover") continue;
    if (evidence.work_queue_takeover_digest !== evidenceDigest(evidence, ["work_queue_takeover_digest"])) continue;
    if (artifactPath(evidence.work_queue_takeover_ref) !== takeoverFile) continue;
    const currentItems = (evidence.queue_items || []).filter((item) => item.state === "CURRENT");
    if (currentItems.length !== 1) continue;
    const current = currentItems[0];
    if (canonicalItemReference(current.source_item) !== canonicalItemReference(currentResolution.currentItemRef)) continue;
    if (current.source_item_digest !== currentResolution.sourceTakeoverDigest) continue;
    if (evidence.intent_digest !== taskIntentDigest(currentResolution.intent)
      || normalizeTaskIntent(evidence.intent) !== normalizeTaskIntent(currentResolution.intent)) continue;
    if (evidence.readiness?.takeover_ready !== "Yes"
      || current.task_governance_binding_status !== "VERIFIED"
      || current.execution_eligible !== "Yes") continue;
    const workQueueItemRef = `artifact:${takeoverFile}#${current.item_id}`;
    const workQueue = resolveWorkQueueTaskIdentity(root, workQueueItemRef, { requireCurrent: true });
    if (!workQueue.ok) continue;
    const governanceRef = artifactPath(current.task_governance_ref);
    const governanceFile = readDurableProjectFile(root, governanceRef, {
      requiredPrefix: "task-governance-reports/",
      label: "durable Task Governance",
    });
    if (!governanceFile.ok) continue;
    const governanceExtracted = extractMachineReadableEvidence(governanceFile.content);
    const governance = governanceExtracted?.ok ? governanceExtracted.value : null;
    if (!governance || governance.artifact_type !== "task_governance") continue;
    if (governance.task_governance_digest !== evidenceDigest(governance, ["task_governance_digest"])
      || governance.task_governance_digest !== current.task_governance_digest) continue;
    if (artifactPath(governance.task_governance_ref) !== governanceRef) continue;
    const lineage = validateTaskGovernanceLineage(root, governance, {
      fromFile: path.join(root, governanceFile.relativePath),
      requireCurrent: true,
      requireWorkQueueAuthority: true,
    });
    if (!lineage.ok
      || lineage.workQueue.identity.work_queue_item_ref !== workQueue.identity.work_queue_item_ref
      || lineage.workQueue.identity.work_queue_item_digest !== workQueue.identity.work_queue_item_digest
      || governance.task_ref !== workQueue.identity.task_ref
      || governance.intent_digest !== workQueue.identity.intent_digest) continue;
    const match = {
      takeoverRef: takeoverFile,
      takeoverDigest: evidence.work_queue_takeover_digest,
      workQueueItemRef: workQueue.identity.work_queue_item_ref,
      workQueueItemDigest: workQueue.identity.work_queue_item_digest,
      taskGovernanceRef: governanceRef,
      taskGovernanceDigest: governance.task_governance_digest,
      taskRef: governance.task_ref,
      intent: governance.intent,
      intentDigest: governance.intent_digest,
    };
    const lineageKey = [
      match.workQueueItemRef,
      match.workQueueItemDigest,
      match.taskGovernanceRef,
      match.taskGovernanceDigest,
    ].join("\n");
    if (!matches.has(lineageKey)) matches.set(lineageKey, match);
  }
  const selectedMatches = [...matches.values()];
  if (selectedMatches.length !== 1) blockers.push(selectedMatches.length === 0
    ? "DURABLE_CURRENT_TASK_GOVERNANCE_BINDING_MISSING"
    : "DURABLE_CURRENT_TASK_GOVERNANCE_BINDING_AMBIGUOUS");
  const match = selectedMatches[0] || {};
  return {
    state: blockers.length === 0 ? "VERIFIED" : "BLOCKED",
    takeoverRef: match.takeoverRef || "N/A",
    takeoverDigest: match.takeoverDigest || "N/A",
    workQueueItemRef: match.workQueueItemRef || "N/A",
    workQueueItemDigest: match.workQueueItemDigest || "N/A",
    taskGovernanceRef: match.taskGovernanceRef || "N/A",
    taskGovernanceDigest: match.taskGovernanceDigest || "N/A",
    taskRef: match.taskRef,
    intent: match.intent || "",
    intentDigest: match.intentDigest || "N/A",
    blockers,
  };
}

function durableMarkdownFiles(root, relativeDirectory) {
  const directory = path.join(root, relativeDirectory);
  try { fs.accessSync(directory); } catch { return []; }
  const files = [];
  const visit = (current, rows) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) continue;
      const relative = path.relative(root, full).replaceAll(path.sep, "/");
      if (isArchivedAuthorityPath(relative)) continue;
      if (entry.isDirectory()) visit(full, rows);
      else if (entry.isFile() && entry.name.endsWith(".md") && durableContent(fs.readFileSync(full, "utf8"))) {
        rows.push(relative);
      }
    }
  };
  visit(directory, files);
  return files.sort();
}

function emptyDurableBinding(blockers) {
  return {
    state: "BLOCKED",
    takeoverRef: "N/A",
    takeoverDigest: "N/A",
    workQueueItemRef: "N/A",
    workQueueItemDigest: "N/A",
    taskGovernanceRef: "N/A",
    taskGovernanceDigest: "N/A",
    taskRef: undefined,
    intent: "",
    intentDigest: "N/A",
    blockers,
  };
}

function publicRouteSteps(currentResolution, durableBinding) {
  return [
    {
      step: "WORK_QUEUE",
      ref: currentResolution.queueRef || "N/A",
      digest: currentResolution.queueDigest || "N/A",
    },
    {
      step: "EXACT_CURRENT_ITEM",
      ref: durableBinding.workQueueItemRef || currentResolution.currentItemRef || "N/A",
      digest: durableBinding.workQueueItemDigest || currentResolution.currentItemDigest || "N/A",
    },
    {
      step: "TASK_GOVERNANCE_LINEAGE",
      ref: durableBinding.taskGovernanceRef || "N/A",
      digest: durableBinding.taskGovernanceDigest || "N/A",
    },
    {
      step: "PLANNING_CLOSURE",
      ref: "runtime:planning-closure",
      digest: "RUNTIME_BINDING_REQUIRED",
    },
  ];
}

function artifactPath(value) {
  const raw = String(value || "").trim().replace(/^(?:artifact|file):/i, "");
  return normalizeProjectRelativePath(raw.split("#")[0]);
}

function canonicalItemReference(value) {
  const raw = String(value || "").trim().replace(/^(?:artifact|file):/i, "");
  const separator = raw.indexOf("#");
  const relative = normalizeProjectRelativePath(separator >= 0 ? raw.slice(0, separator) : raw);
  const fragment = separator >= 0 ? raw.slice(separator + 1).trim() : "";
  return relative && fragment ? `${relative}#${fragment}` : relative;
}

function isArchivedAuthorityPath(value) {
  const normalized = artifactPath(value).toLowerCase();
  const segments = normalized.split("/").filter(Boolean);
  return segments.some((segment) => /^(?:archive|archived|history|historical)(?:[-_.].*)?$/.test(segment))
    || /(?:^|[-_.])(?:archive|archived|historical)(?:[-_.]|$)/.test(path.posix.basename(normalized, ".md"));
}

function requiresDurableExistingProjectTakeover(root) {
  let version = null;
  try { version = JSON.parse(fs.readFileSync(path.join(root, ".intentos", "version.json"), "utf8")); } catch { version = null; }
  if (version && version.projectEntryOrigin !== "NEW_PROJECT") return true;
  return fs.existsSync(path.join(root, ".intentos-bridge.json"));
}

function readDurableProjectFile(root, relativeValue, options = {}) {
  const relative = normalizeProjectRelativePath(relativeValue);
  if (!relative || (options.requiredPrefix && !relative.startsWith(options.requiredPrefix))) {
    return { ok: false, error: `${options.label || "project evidence"} path is missing or outside ${options.requiredPrefix || "the project"}` };
  }
  const file = path.join(root, relative);
  let stat;
  try { stat = fs.lstatSync(file); } catch {
    return { ok: false, error: `${options.label || "project evidence"} is missing: ${relative}` };
  }
  if (stat.isSymbolicLink() || !stat.isFile()) return { ok: false, error: `${options.label || "project evidence"} is not a regular file: ${relative}` };
  const content = fs.readFileSync(file, "utf8");
  if (!durableContent(content)) return { ok: false, error: `${options.label || "project evidence"} has no durable content: ${relative}` };
  return {
    ok: true,
    relativePath: relative,
    content,
    digest: rawSha256(content),
  };
}

function extractTaskIntent(content) {
  const text = String(content || "");
  const rawRequest = text.match(/^##\s+Raw Request\s*$\s*([\s\S]*?)(?=^##\s+|(?![\s\S]))/im)?.[1];
  if (rawRequest) return normalizeIntent(rawRequest);
  const frontmatter = text.match(/^---\s*\n([\s\S]*?)\n---/);
  const frontmatterIntent = frontmatter?.[1]?.match(/^intent\s*:\s*(.+)$/im)?.[1];
  if (frontmatterIntent) return normalizeIntent(frontmatterIntent.replace(/^['"]|['"]$/g, ""));
  const explicit = text.match(/^(?:Current\s+)?Intent\s*:\s*`?(.+?)`?\s*$/im)?.[1];
  return explicit ? normalizeIntent(explicit) : "";
}

function stableQueueProjection(queue) {
  if (queue?.reportType !== "WORK_QUEUE_RECOMMENDATION") return "";
  const value = {
    inventory: {
      queueReportCount: queue.queueInventory?.queueReportCount,
      parsedRowCount: queue.queueInventory?.parsedRowCount,
      canonicalItemCount: queue.queueInventory?.canonicalItemCount,
      canonicalizationConflictCount: queue.queueInventory?.canonicalizationConflictCount,
    },
    currentTaskCount: queue.currentTaskCount,
    current: (queue.currentTaskCandidates || []).map(stableCurrentItem),
    conflicts: queue.canonicalizationConflicts || [],
  };
  return evidenceDigest(value, []);
}

function stableCurrentItem(item) {
  return {
    taskId: String(item?.taskId || ""),
    taskRef: String(item?.taskRef || ""),
    intentDigest: String(item?.intentDigest || ""),
    title: String(item?.title || ""),
    state: String(item?.state || ""),
    source: String(item?.source || ""),
    evidence: String(item?.evidence || ""),
    representedBy: Array.isArray(item?.representedBy) ? item.representedBy : [],
  };
}

function stableTaskId(value) {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(normalized)
    && !/^(?:none|n\/a|pending|unknown|current)$/i.test(normalized);
}

function meaningfulValue(value) {
  const normalized = String(value || "").trim();
  return normalized.length >= 3 && !/^(?:none|n\/a|pending|unknown|todo|placeholder)$/i.test(normalized);
}

function durableContent(content) {
  const meaningful = String(content || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !/^[-|:\s]+$/.test(line));
  return meaningful.length > 0 && meaningful.join(" ").length >= 8;
}

function normalizeProjectRelativePath(value) {
  const normalized = String(value || "")
    .replace(/^(?:artifact|file):/i, "")
    .replaceAll("\\", "/")
    .replace(/^\.\//, "")
    .trim();
  if (!normalized || normalized === "." || normalized === ".." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) return "";
  return path.posix.normalize(normalized);
}

function normalizeIntent(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function rawSha256(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value || "")).digest("hex")}`;
}

function runProjectLocalResolver(root, executionRoot, name, relativeScript, args, activationEnv = {}, accessDenyPreload = "") {
  const script = path.join(executionRoot, relativeScript);
  if (!fs.existsSync(script)) return { name, exit_code: -1, parsed: null, output_digest: evidenceDigest("missing", []), error: `${relativeScript} is missing` };
  const nodeArgs = accessDenyPreload ? ["--require", accessDenyPreload, script, ...args] : [script, ...args];
  const result = spawnSync(process.execPath, nodeArgs, {
    cwd: root,
    env: sanitizedResolverEnvironment(activationEnv),
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
    timeout: 60000,
  });
  let parsed = null;
  try { parsed = JSON.parse(result.stdout); } catch { parsed = null; }
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  return {
    name,
    exit_code: Number.isInteger(result.status) ? result.status : -1,
    parsed,
    output_digest: evidenceDigest(output, []),
    outcome: parsed?.outcome || parsed?.nextAction || parsed?.reportType || "UNKNOWN",
    error: result.error?.message
      || result.stderr
      || (!parsed ? `invalid JSON output: ${String(result.stdout || "<empty>").trim().slice(0, 240)}` : ""),
  };
}

function createActivationRuntimeIsolation() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-activation-"));
  const home = path.join(root, "home");
  const temp = path.join(root, "tmp");
  fs.mkdirSync(home, { recursive: true, mode: 0o700 });
  fs.mkdirSync(temp, { recursive: true, mode: 0o700 });
  return {
    root,
    environment: {
      HOME: home,
      TMPDIR: temp,
      TMP: temp,
      TEMP: temp,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: os.devNull,
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0",
      GIT_CONFIG_COUNT: "3",
      GIT_CONFIG_KEY_0: "core.fsmonitor",
      GIT_CONFIG_VALUE_0: "false",
      GIT_CONFIG_KEY_1: "core.hooksPath",
      GIT_CONFIG_VALUE_1: os.devNull,
      GIT_CONFIG_KEY_2: "diff.external",
      GIT_CONFIG_VALUE_2: "",
    },
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

function createActivationBoundaryPreload(options = {}) {
  const sourceRoot = String(options.deniedSourceRoot || "");
  const executionRoot = String(options.deniedExecutionRoot || "");
  const isolationRoot = String(options.isolationRoot || "");
  const file = path.join(isolationRoot, `activation-boundary-${cryptoRandom()}.cjs`);
  const content = `
const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");
const { syncBuiltinESMExports } = require("node:module");
const denied = ${JSON.stringify(sourceRoot)} ? fs.realpathSync(${JSON.stringify(sourceRoot)}) : "";
const executionDenied = ${JSON.stringify(executionRoot)} ? fs.realpathSync(${JSON.stringify(executionRoot)}) : "";
const guarded = ["readFileSync", "readFile", "openSync", "open", "statSync", "stat", "lstatSync", "lstat", "readdirSync", "readdir", "accessSync", "access", "realpathSync", "realpath"];
const blocked = (value) => {
  if (!denied) return false;
  if (typeof value !== "string" && !Buffer.isBuffer(value) && !(value instanceof URL)) return false;
  const raw = value instanceof URL ? value.pathname : Buffer.isBuffer(value) ? value.toString() : value;
  const resolved = path.resolve(raw);
  return resolved === denied || resolved.startsWith(denied + path.sep);
};
const executionPath = (value, cwd) => {
  if (typeof value !== "string" && !Buffer.isBuffer(value) && !(value instanceof URL)) return "";
  const raw = value instanceof URL ? value.pathname : Buffer.isBuffer(value) ? value.toString() : value;
  return path.resolve(cwd || process.cwd(), raw);
};
const executionBlocked = (command, args, spawnOptions = {}) => {
  if (!executionDenied) return false;
  const cwd = spawnOptions && typeof spawnOptions.cwd === "string" ? spawnOptions.cwd : process.cwd();
  const commandPath = executionPath(command, cwd);
  if (commandPath === executionDenied || commandPath.startsWith(executionDenied + path.sep)) return true;
  const commandName = path.basename(String(command || "")).toLowerCase();
  if (!/^(?:node|nodejs)(?:\\.exe)?$/.test(commandName)) return false;
  const values = Array.isArray(args) ? args : [];
  let skipNext = false;
  for (const value of values) {
    const token = String(value || "");
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (["--require", "-r", "--import", "--loader", "--experimental-loader"].includes(token)) {
      skipNext = true;
      continue;
    }
    if (token.startsWith("-")) continue;
    const candidate = executionPath(token, cwd);
    return candidate === executionDenied || candidate.startsWith(executionDenied + path.sep);
  }
  return false;
};
for (const name of guarded) {
  const original = fs[name];
  if (typeof original !== "function") continue;
  fs[name] = function (...args) {
    if (blocked(args[0])) throw new Error("INTENTOS_SOURCE_ACCESS_DENIED:" + String(args[0]));
    return original.apply(this, args);
  };
}
for (const name of ["spawn", "spawnSync", "execFile", "execFileSync", "fork"]) {
  const original = childProcess[name];
  if (typeof original !== "function") continue;
  childProcess[name] = function (command, args, options, ...rest) {
    const normalizedArgs = Array.isArray(args) ? args : [];
    const normalizedOptions = Array.isArray(args) ? (options || {}) : (args || {});
    if (executionBlocked(command, normalizedArgs, normalizedOptions)) {
      throw new Error("INTENTOS_TARGET_EXECUTION_DENIED:" + String(command) + " " + normalizedArgs.join(" "));
    }
    return original.call(this, command, args, options, ...rest);
  };
}
syncBuiltinESMExports();
`;
  fs.writeFileSync(file, content, { flag: "wx", mode: 0o600 });
  return file;
}

function cryptoRandom() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function directoryObservation(root) {
  if (!fs.existsSync(root)) return evidenceDigest({ state: "ABSENT" }, []);
  const rows = [];
  walk(root, root, rows);
  return evidenceDigest(rows, []);
}

function projectRevisionObservation(root) {
  return directoryObservation(root);
}

function walk(root, current, rows) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if ([".git", "node_modules", ".next", "dist", "build", "coverage"].includes(entry.name)) continue;
    const full = path.join(current, entry.name);
    const relative = path.relative(root, full).replaceAll(path.sep, "/");
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) rows.push({ path: relative, type: "symlink", target: fs.readlinkSync(full) });
    else if (stat.isDirectory()) {
      rows.push({ path: relative, type: "directory" });
      walk(root, full, rows);
    } else if (stat.isFile()) rows.push({ path: relative, type: "file", size: stat.size, digest: evidenceDigest(fs.readFileSync(full).toString("base64"), []) });
  }
}

function sourceObservation(root, inventory = []) {
  if (inventory.length === 0) return directoryObservation(root);
  const rows = inventory.map((item) => {
    const ref = String(item?.source_ref || "");
    if (ref === "N/A") return { id: item.id, path: item.path, source_ref: ref, source_hash: item.source_hash };
    const normalized = ref.replaceAll("\\", "/").replace(/^\.\//, "");
    if (!normalized || normalized === ".." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) {
      return { id: item.id, path: item.path, source_ref: ref, state: "UNSAFE_SOURCE_REF" };
    }
    const file = path.join(root, normalized);
    if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || !fs.lstatSync(file).isFile()) {
      return { id: item.id, path: item.path, source_ref: normalized, state: "SOURCE_UNAVAILABLE" };
    }
    return {
      id: item.id,
      path: item.path,
      source_ref: normalized,
      source_hash: `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`,
    };
  });
  return evidenceDigest(rows, []);
}

function sanitizedResolverEnvironment(extra = {}) {
  const env = {};
  for (const key of ["HOME", "PATH", "LANG", "LC_ALL", "LC_CTYPE", "TMPDIR", "TMP", "TEMP", "SYSTEMROOT", "COMSPEC", "PATHEXT"]) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return {
    ...env,
    INTENTOS_SOURCE_ROOT: "",
    INTENTOS_GENERATED_COLD_START: "1",
    ...extra,
  };
}

function source(value) {
  return {
    ref: String(value?.ref || "N/A"),
    digest: String(value?.digest || "N/A"),
    state: sourceState(value),
  };
}

function sourceState(value) {
  return String(value?.state || value?.receipt_state || value?.assurance_state || value?.outcome || "UNKNOWN");
}

function validSource(value) {
  return Boolean(value?.ref && /^sha256:[a-f0-9]{64}$/.test(String(value?.digest || "")));
}

function validNormalizedSource(value) {
  return Boolean(value?.ref && value.ref !== "N/A" && /^sha256:[a-f0-9]{64}$/.test(String(value?.digest || "")) && value?.state && value.state !== "UNKNOWN");
}
