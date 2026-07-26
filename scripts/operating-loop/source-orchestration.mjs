import fs from "node:fs";
import path from "node:path";
import {
  resolveGovernedCurrentTaskRoute,
  resolveVerifiedInitialTaskIntake,
} from "../lib/behavioral-adoption-activation.mjs";
import { validateTaskResumeDecision } from "../lib/task-entry-binding.mjs";
import { normalizeProjectRef } from "./source-execution.mjs";
import { arrayValue, sha256, unique } from "./shared.mjs";

export function addOperationSources(sources, operation, context = {}) {
  const { args, intent, projectRoot, requestedTaskRef, runFinalDecision, runGateSource, runSource } = context;
  const selectGate = (...values) => pushSelectedGate(...values, { projectRoot, runGateSource });
  let route = null;
  let initialTaskIntake = null;
  let strictRouteRequired = false;
  let resumeDecision = null;
  if (context.baselineConsumptionRequired) {
    sources.push(runGateSource("BASELINE_ENFORCEMENT_CHECK", "scripts/check-baseline-enforcement.mjs", [
      projectRoot,
      "--mode", "implementation",
      "--json",
    ]));
  }
  if (["START_PROJECT", "CONTINUE_TASK"].includes(operation)) {
    sources.push(runSource("BEGINNER_ENTRY", "scripts/resolve-beginner-entry.mjs", [projectRoot, intent, "--json"]));
  }
  if (["CONTINUE_TASK", "CHECK_STATUS", "FINISH_TASK", "RESUME_TASK", "DISCUSS_ONLY"].includes(operation)) {
    sources.push(runSource("WORK_QUEUE", "scripts/resolve-work-queue.mjs", [projectRoot, "--json"]));
  }
  if (["CONTINUE_TASK", "RESUME_TASK"].includes(operation)) {
    const workQueueSource = sources.find((item) => item.name === "WORK_QUEUE");
    route = resolveGovernedCurrentTaskRoute({
      targetRoot: projectRoot,
      queueReport: workQueueSource?.value || {},
    });
    strictRouteRequired = context.projectEntryOrigin === "EXISTING_PROJECT"
      || fs.existsSync(path.join(projectRoot, ".intentos-bridge.json"));
    initialTaskIntake = route.state === "VERIFIED" || !strictRouteRequired
      ? null
      : resolveVerifiedInitialTaskIntake({
          targetRoot: projectRoot,
          queueReport: workQueueSource?.value || {},
        });
    const governedIntent = route.state === "VERIFIED"
      ? route.intent
      : initialTaskIntake?.state === "VERIFIED"
        ? initialTaskIntake.intent
        : intent;
    const governanceSource = route.state === "VERIFIED"
      ? runSource("TASK_GOVERNANCE", "scripts/resolve-task-governance.mjs", [
          projectRoot,
          "--intent", governedIntent,
          "--work-queue-item", route.work_queue_item_ref,
          "--json",
        ])
      : strictRouteRequired && initialTaskIntake?.state !== "VERIFIED"
        ? missingResolverSource(
            "TASK_GOVERNANCE",
            "scripts/resolve-task-governance.mjs",
            `strict Work Queue current-task lineage is unavailable: ${route.blockers.join("; ")}`,
          )
        : runSource("TASK_GOVERNANCE", "scripts/resolve-task-governance.mjs", [projectRoot, "--intent", governedIntent, "--json"]);
    sources.push(governanceSource);

    if (operation === "RESUME_TASK") {
      resumeDecision = inspectResumeDecision(route, { args, projectRoot });
      sources.push(resumeDecision.source);
    }

    if (route.state === "VERIFIED") {
      sources.push(runSource("PLANNING_CLOSURE", "scripts/resolve-planning-closure.mjs", [
        projectRoot,
        "--intent", route.intent,
        "--task-ref", route.task_ref,
        "--intent-digest", route.intent_digest,
        "--task-governance-report", route.task_governance_ref,
        "--json",
      ]));
    } else if (!strictRouteRequired || initialTaskIntake?.state === "VERIFIED") {
      const currentQueueTask = workQueueSource?.value?.currentTaskCandidates?.[0] || null;
      if (currentQueueTask) {
        const planningArgs = [
          projectRoot,
          "--intent", String(currentQueueTask.title || intent),
          "--task-ref", String(currentQueueTask.taskRef || currentQueueTask.taskId || ""),
          "--json",
        ];
        if (currentQueueTask.intentDigest) planningArgs.push("--intent-digest", currentQueueTask.intentDigest);
        sources.push(runSource("PLANNING_CLOSURE", "scripts/resolve-planning-closure.mjs", planningArgs));
      }
    } else {
      sources.push(missingResolverSource(
        "PLANNING_CLOSURE",
        "scripts/resolve-planning-closure.mjs",
        "Planning Closure requires the selected strict Work Queue and Task Governance lineage.",
      ));
    }
  }
  if (operation === "CHECK_STATUS" && context.taskStatusRequired) {
    const workQueue = sources.find((item) => item.name === "WORK_QUEUE")?.value || null;
    const currentQueueTask = workQueue?.currentTaskCount === 1
      ? workQueue.currentTaskCandidates?.[0] || null
      : null;
    if (currentQueueTask) {
      const governedIntent = String(workQueue.canonicalCurrentTaskIdentity?.intent || currentQueueTask.title || intent);
      const governanceArgs = [projectRoot, "--intent", governedIntent, "--json"];
      sources.push(runSource("TASK_GOVERNANCE", "scripts/resolve-task-governance.mjs", governanceArgs));
      const planningArgs = [
        projectRoot,
        "--intent", governedIntent,
        "--task-ref", String(currentQueueTask.taskRef || currentQueueTask.taskId || ""),
        "--json",
      ];
      if (currentQueueTask.intentDigest) planningArgs.push("--intent-digest", currentQueueTask.intentDigest);
      sources.push(runSource("PLANNING_CLOSURE", "scripts/resolve-planning-closure.mjs", planningArgs));
    }
  }
  if (["CHECK_STATUS", "FINISH_TASK", "PREPARE_RELEASE"].includes(operation)) {
    sources.push(runSource("USER_DELIVERY_CONSOLE", "scripts/resolve-user-delivery-console.mjs", [projectRoot, "--intent", intent, "--json"]));
  }
  if (operation === "FINISH_TASK") {
    const workQueue = sources.find((item) => item.name === "WORK_QUEUE")?.value || null;
    const currentQueueTask = workQueue?.currentTaskCandidates?.[0] || null;
    const identity = workQueue?.canonicalCurrentTaskIdentity || null;
    const identityReady = identity?.status === "READY";
    const effectiveTaskRef = requestedTaskRef || (identityReady ? identity.taskRef : "");
    const currentTaskIntent = String(identityReady ? identity.intent : currentQueueTask?.title || intent).trim();
    const selectedCompletionRef = String(args["completion-evidence"] || (identityReady ? identity.sourceRefs?.completionEvidence : "") || "").trim();

    sources.push(currentTaskIdentitySource(identity, {
      requestedTaskRef,
      selectedCompletionRef,
    }));
    sources.push(runGateSource("WORK_QUEUE_CHECK", "scripts/check-work-queue.mjs", [
      projectRoot,
      "--json",
      "--require-report",
    ]));

    selectGate(sources, "WORK_QUEUE_TAKEOVER_CHECK", "scripts/check-work-queue-takeover.mjs", identity?.sourceRefs?.takeover, [
      "--require-report",
      "--require-structured-evidence",
      "--require-current-task-lineage",
    ]);
    selectGate(sources, "TASK_GOVERNANCE_CHECK", "scripts/check-task-governance.mjs", identity?.sourceRefs?.taskGovernance, [
      "--require-report",
      "--require-structured-evidence",
      "--require-current-task-lineage",
    ]);

    if (identity?.businessUniverseRequired) {
      selectGate(sources, "BUSINESS_UNIVERSE_COVERAGE_CHECK", "scripts/check-business-universe-coverage.mjs", identity.sourceRefs?.businessUniverse, [
        "--require-report",
        "--require-structured-evidence",
        "--require-ready",
      ]);
    }
    if (identity?.controlEffectivenessRequired) {
      const controlArgs = [
        "--require-report",
        "--require-structured-evidence",
        "--require-effective",
      ];
      if (effectiveTaskRef) controlArgs.push("--task-ref", effectiveTaskRef);
      if (identity?.intentDigest) controlArgs.push("--intent-digest", identity.intentDigest);
      if (identity?.requiredControlClaimIds?.length > 0) {
        controlArgs.push("--required-claims", identity.requiredControlClaimIds.join(","));
      }
      selectGate(sources, "CONTROL_EFFECTIVENESS_CHECK", "scripts/check-control-effectiveness.mjs", identity.sourceRefs?.controlEffectiveness, controlArgs);
    }

    const planReviewRequired = identity?.planReviewRequired === true;
    if (planReviewRequired) {
      selectGate(sources, "PLAN_REVIEW_CHECK", "scripts/check-plan-review.mjs", identity.sourceRefs?.planReview, [
        "--require-report",
        "--require-structured-evidence",
        "--require-current-task-lineage",
      ]);
    }

    const executionArgs = [
      "--require-structured-evidence",
      "--require-evidence-refs",
      "--require-review",
      "--require-actual-diff",
      "--require-precise-evidence",
      "--require-evidence-authority",
      "--require-task-governance",
      "--require-work-queue",
      "--strict-task-consumer",
    ];
    if (planReviewRequired) executionArgs.push("--require-plan-review");
    selectGate(sources, "EXECUTION_ASSURANCE_CHECK", "scripts/check-execution-assurance.mjs", identity?.sourceRefs?.executionAssurance, executionArgs);

    const completionArgs = [
      "--require-report",
      "--require-structured-evidence",
      "--require-source-refs",
      "--require-ready",
      "--require-evidence-authority",
      "--require-task-governance",
      "--require-work-queue",
      "--strict-task-consumer",
    ];
    if (planReviewRequired) completionArgs.push("--require-plan-review");
    selectGate(sources, "COMPLETION_EVIDENCE", "scripts/check-completion-evidence.mjs", selectedCompletionRef, completionArgs);

    const closureArgs = [projectRoot, "--intent", currentTaskIntent, "--json"];
    if (effectiveTaskRef) closureArgs.push("--task", effectiveTaskRef);
    if (identityReady && identity.intentDigest) closureArgs.push("--intent-digest", identity.intentDigest);
    if (selectedCompletionRef) closureArgs.push("--completion-evidence", selectedCompletionRef);
    for (const flag of ["verification", "impact-report", "execution-closure", "guided-closure", "human-decision", "runtime-manifest"]) {
      if (args[flag]) closureArgs.push(`--${flag}`, String(args[flag]));
    }
    sources.push(runFinalDecision("UNIFIED_CLOSURE", "scripts/resolve-closure-decision.mjs", closureArgs));
  }
  if (operation === "PREPARE_RELEASE") {
    sources.push(runSource("RELEASE_GUIDE", "scripts/resolve-release-guide.mjs", [projectRoot, "--intent", intent, "--json"]));
    sources.push(runGateSource("RELEASE_CHANNEL_POLICY_CHECK", "scripts/check-release-channel-policy.mjs", [
      projectRoot,
      "--json",
      "--require-report",
      "--require-structured-evidence",
      "--strict-source-binding",
    ]));
    sources.push(runGateSource("RELEASE_EXECUTION_TOPOLOGY_CHECK", "scripts/check-release-execution-topology.mjs", [
      projectRoot,
      "--json",
      "--require-report",
      "--require-structured-evidence",
      "--require-current-project",
      "--require-ready",
    ]));
    sources.push(runGateSource("RUNTIME_HYGIENE_CHECK", "scripts/check-runtime-hygiene.mjs", [
      projectRoot,
      "--json",
      "--require-report",
      "--require-structured-evidence",
      "--strict-task-entry",
      "--require-runtime-sources",
      "--require-release-topology",
    ]));
    sources.push(runGateSource("RELEASE_EVIDENCE_GATE_CHECK", "scripts/check-release-evidence-gate.mjs", [
      projectRoot,
      "--json",
      "--require-report",
      "--require-structured-evidence",
      "--require-current-completion",
      "--strict-source-binding",
      "--require-platform-recipe",
      "--require-release-topology",
      "--require-ready",
    ]));
  }
  if (operation === "ADOPT_PROJECT") {
    sources.push(runSource("ADOPTION_AUTOPILOT", "scripts/resolve-existing-project-adoption-autopilot.mjs", [projectRoot, "--intent", intent, "--json"]));
    sources.push(runSource("NATIVE_MIGRATION", "scripts/resolve-native-migration.mjs", [projectRoot, "--intent", intent, "--json"]));
    sources.push(runSource("WORK_QUEUE_TAKEOVER", "scripts/resolve-work-queue-takeover.mjs", [projectRoot, "--intent", intent, "--json"]));
  }
  return {
    route,
    initialTaskIntake,
    strictRouteRequired,
    resumeDecision,
    publicRoute: buildPublicOperatingRoute(operation, route, strictRouteRequired, sources, initialTaskIntake),
  };
}
function currentTaskIdentitySource(identity, selection) {
  const blockers = [...arrayValue(identity?.blockers)];
  if (identity?.status !== "READY") {
    blockers.push("No unique current typed task identity is available.");
  }
  if (selection.requestedTaskRef && selection.requestedTaskRef !== identity?.taskRef) {
    blockers.push("The requested task does not match the canonical current task.");
  }
  const canonicalCompletionRef = normalizeProjectRef(identity?.sourceRefs?.completionEvidence);
  if (selection.selectedCompletionRef
    && canonicalCompletionRef
    && normalizeProjectRef(selection.selectedCompletionRef) !== canonicalCompletionRef) {
    blockers.push("The selected Completion Evidence does not belong to the canonical current task chain.");
  }
  const ready = blockers.length === 0;
  const semanticValue = {
    status: identity?.status || "MISSING",
    taskRef: identity?.taskRef || "",
    intentDigest: identity?.intentDigest || "",
    sourceRefs: identity?.sourceRefs || {},
    requestedTaskRef: selection.requestedTaskRef || "",
    selectedCompletionRef: normalizeProjectRef(selection.selectedCompletionRef),
    blockers,
  };
  return {
    name: "CURRENT_TASK_IDENTITY",
    script: "scripts/resolve-work-queue.mjs",
    sourceKind: "GATE",
    sourceContract: "CURRENT_WORK_QUEUE_TYPED_EVIDENCE_CHAIN",
    readStatus: ready ? "CURRENT_RUN" : "FAILED",
    outcome: ready ? "READY" : "INVALID",
    ref: identity?.sourceRefs?.takeover ? `artifact:${identity.sourceRefs.takeover}` : "generated:scripts/resolve-work-queue.mjs",
    semanticDigest: `sha256:${sha256(JSON.stringify(semanticValue))}`,
    value: semanticValue,
    error: ready ? "" : blockers[0],
  };
}

function pushSelectedGate(sources, name, script, reportRef, flags, { projectRoot, runGateSource }) {
  const normalizedRef = normalizeProjectRef(reportRef);
  if (!normalizedRef) {
    sources.push(missingGateSource(name, script, "The canonical current task chain does not provide this required report."));
    return;
  }
  sources.push(runGateSource(name, script, [
    projectRoot,
    "--json",
    "--report", normalizedRef,
    ...flags,
  ]));
}

function missingGateSource(name, script, reason) {
  return {
    name,
    script,
    sourceKind: "GATE",
    sourceContract: "REQUIRED_CURRENT_TASK_REPORT",
    readStatus: "FAILED",
    outcome: "MISSING",
    ref: `generated:${script}`,
    semanticDigest: `sha256:${sha256(`${name}:${reason}`)}`,
    value: null,
    error: reason,
  };
}

function missingResolverSource(name, script, reason) {
  return {
    name,
    script,
    sourceKind: "RESOLVER",
    sourceContract: "STRICT_CURRENT_TASK_ROUTE",
    readStatus: "FAILED",
    outcome: "BLOCKED_BY_SOURCE_FAILURE",
    ref: `generated:${script}`,
    semanticDigest: `sha256:${sha256(`${name}:${reason}`)}`,
    value: null,
    error: reason,
  };
}

function inspectResumeDecision(route, { args, projectRoot }) {
  const selectedRef = String(args["resume-decision"] || "").trim();
  const errors = [];
  let validation = null;
  if (route?.state !== "VERIFIED") {
    errors.push("resume decision cannot be evaluated without a strict current-task route");
  } else if (!selectedRef) {
    errors.push("a typed current task_resume_decision artifact is required");
  } else {
    validation = validateTaskResumeDecision(projectRoot, selectedRef, {
      requireApproved: true,
      expected: {
        workQueueItemRef: route.work_queue_item_ref,
        workQueueItemDigest: route.work_queue_item_digest,
        taskGovernanceRef: route.task_governance_ref,
        taskGovernanceDigest: route.task_governance_digest,
        taskRef: route.task_ref,
        intentDigest: route.intent_digest,
      },
    });
    errors.push(...validation.errors);
  }
  const approved = errors.length === 0 && validation?.approved === true;
  const digest = validation?.evidence?.resume_decision_digest || `sha256:${sha256(errors.join("\n") || "resume-decision-missing")}`;
  const ref = validation?.resolved?.relativePath ? `artifact:${validation.resolved.relativePath}` : selectedRef || "N/A";
  return {
    approved,
    digest,
    ref,
    errors,
    source: {
      name: "TASK_RESUME_DECISION",
      script: "scripts/lib/task-entry-binding.mjs",
      sourceKind: "DECISION",
      sourceContract: "STRUCTURED_CURRENT_TASK_RESUME_DECISION",
      readStatus: approved ? "CURRENT_RUN" : "FAILED",
      outcome: approved ? "APPROVED_CURRENT" : "REVIEW_REQUIRED",
      ref,
      semanticDigest: digest,
      value: validation?.evidence || null,
      error: errors[0] || "",
    },
  };
}

function buildPublicOperatingRoute(operation, route, strictRequired, sources, initialTaskIntake = null) {
  const routed = new Set(["CONTINUE_TASK", "RESUME_TASK"]);
  if (!routed.has(operation)) return notApplicablePublicTaskRoute(operation);
  const governanceSource = sources.find((item) => item.name === "TASK_GOVERNANCE");
  const planningSource = sources.find((item) => item.name === "PLANNING_CLOSURE");
  const governance = governanceSource?.value?.structuredEvidence || {};
  const planning = planningSource?.value?.structuredEvidence || {};
  const blockers = [...arrayValue(route?.blockers)];
  const strictGovernance = route?.state === "VERIFIED"
    && governanceSource?.readStatus === "CURRENT_RUN"
    && governance.task_lineage?.authority === "WORK_QUEUE_ITEM"
    && governance.task_lineage?.work_queue_item_ref === route.work_queue_item_ref
    && governance.task_lineage?.work_queue_item_digest === route.work_queue_item_digest
    && governance.task_ref === route.task_ref
    && governance.intent_digest === route.intent_digest;
  if (route?.state === "VERIFIED" && !strictGovernance) blockers.push("runtime Task Governance did not preserve the exact WORK_QUEUE_ITEM lineage");
  const planningBound = route?.state === "VERIFIED"
    && planningSource?.readStatus === "CURRENT_RUN"
    && planning.artifact_type === "planning_closure"
    && planning.task_ref === route.task_ref
    && planning.intent_digest === route.intent_digest
    && normalizeProjectRef(planning.task_governance?.ref) === normalizeProjectRef(route.task_governance_ref)
    && planning.task_governance?.digest === route.task_governance_digest;
  if (route?.state === "VERIFIED" && !planningBound) blockers.push("Planning Closure did not bind the selected Task Governance lineage");
  const verified = route?.state === "VERIFIED" && strictGovernance && planningBound;
  const sequence = Array.isArray(route?.public_route)
    ? route.public_route.map((step) => step.step === "PLANNING_CLOSURE"
      ? {
          ...step,
          ref: planning.report_ref || "runtime:planning-closure",
          digest: planning.report_digest || planningSource?.semanticDigest || "N/A",
        }
      : step)
    : [];
  const base = {
    state: verified
      ? "VERIFIED"
      : initialTaskIntake?.state === "VERIFIED"
        ? "INITIAL_TASK_GOVERNANCE_REQUIRED"
        : strictRequired ? "BLOCKED" : "COMPATIBILITY_NEW_PROJECT",
    required_sequence: ["WORK_QUEUE", "EXACT_CURRENT_ITEM", "TASK_GOVERNANCE_LINEAGE", "PLANNING_CLOSURE"],
    sequence,
    blockers: initialTaskIntake?.state === "VERIFIED"
      ? ["The verified initial task still requires durable Task Governance lineage before implementation review."]
      : unique(blockers),
  };
  return { ...base, routeDigest: `sha256:${sha256(JSON.stringify(base))}` };
}

export function notApplicablePublicTaskRoute(operation) {
  const base = {
    state: "NOT_REQUIRED",
    operation,
    required_sequence: ["WORK_QUEUE", "EXACT_CURRENT_ITEM", "TASK_GOVERNANCE_LINEAGE", "PLANNING_CLOSURE"],
    sequence: [],
    blockers: [],
  };
  return { ...base, routeDigest: `sha256:${sha256(JSON.stringify(base))}` };
}
