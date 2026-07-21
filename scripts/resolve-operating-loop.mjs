#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import { hasProjectSignals } from "./lib/project-signals.mjs";
import { buildSoloOperatingModel } from "./lib/solo-operating-model.mjs";
import { requireAcceptedOutcome } from "./lib/check-result.mjs";
import {
  resolveGovernedCurrentTaskRoute,
  resolveVerifiedInitialTaskIntake,
} from "./lib/behavioral-adoption-activation.mjs";
import { validateTaskResumeDecision } from "./lib/task-entry-binding.mjs";
import {
  requiresOperatingBaselineConsumption,
  validateBaselineEnforcementConsumption,
} from "./lib/planning-closure.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "task",
  "verification",
  "impact-report",
  "execution-closure",
  "guided-closure",
  "human-decision",
  "runtime-manifest",
  "completion-evidence",
  "resume-decision",
  "operation",
]);
const unknown = unknownOptions(args, knownFlags);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const intent = String(args.intent || args._.slice(1).join(" ") || "").trim();
const requestedTaskRef = String(args.task || "").trim();
const forcedOperation = String(args.operation || "").trim();
const outputFormat = args.json ? "json" : String(args.format || "human");
const outputLanguage = /[\u3400-\u9fff]/.test(intent) ? "zh" : "en";
const projectSetupActions = new Set([
  "RUN_PROJECT_ONBOARDING",
  "RUN_PLATFORM_BASELINE_SETUP",
  "RUN_INDUSTRIAL_BASELINE_SETUP",
]);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

if (forcedOperation && forcedOperation !== "FINISH_TASK") {
  console.error(`FAIL unsupported internal --operation: ${forcedOperation}`);
  process.exit(1);
}

const state = buildOperatingState();

if (outputFormat === "json") console.log(JSON.stringify(state, null, 2));
else printHuman(state);
process.exitCode = operatingExitCode(state);

function buildOperatingState() {
  const workflowNext = runSource("WORKFLOW_NEXT", "scripts/workflow-next.mjs", [
    projectRoot,
    "--json",
    "--intent",
    intent || "inspect project state",
  ]);
  const guidance = runSource("WORKFLOW_GUIDANCE", "scripts/resolve-workflow-guidance.mjs", [
    projectRoot,
    "--deep",
    "--mode",
    "plain",
    "--intent",
    intent,
    "--json",
  ]);
  const projectState = workflowNext.value?.projectState
    || guidance.value?.projectReading?.projectState
    || "UNKNOWN_PROJECT";
  const projectStateTags = Array.isArray(workflowNext.value?.projectStateTags)
    ? workflowNext.value.projectStateTags
    : [];
  const projectEntryOrigin = readProjectEntryOrigin(projectRoot);
  const projectEntry = projectEntryFor(
    projectState,
    projectRoot,
    projectStateTags,
    projectEntryOrigin,
    workflowNext.value?.projectFactProjection || null,
  );
  const behavioralAdoptionState = String(
    workflowNext.value?.projectFactProjection?.behavioral_adoption?.state || "UNKNOWN",
  );
  let operation = forcedOperation || operationFor(intent, projectEntry);
  const taskStatusRequired = operation === "CHECK_STATUS" && statusRequestRequiresCurrentTask(intent);
  const initialEntryTrust = workflowNext.value?.projectEntryTrust || null;
  if (requiresActiveIntentOSOperation(operation)
    && operation !== "RESUME_TASK"
    && initialEntryTrust?.entry_state === "READY_FOR_READ_ONLY_ASSESSMENT") {
    operation = "ADOPT_PROJECT";
  }
  const sources = [workflowNext, guidance];
  const baselineConsumptionRequired = requiresOperatingBaselineConsumption({
    behavioralAdoptionState,
    operation,
  });

  const taskRouteContext = intent
    ? addOperationSources(sources, operation, {
        projectEntryOrigin,
        taskStatusRequired,
        baselineConsumptionRequired,
      })
    : null;

  const taskGovernance = sources.find((item) => item.name === "TASK_GOVERNANCE")?.value || null;
  const deliveryStatus = sources.find((item) => item.name === "USER_DELIVERY_CONSOLE")?.value || null;
  const closure = sources.find((item) => item.name === "UNIFIED_CLOSURE")?.value || null;
  const completionEvidence = sources.find((item) => item.name === "COMPLETION_EVIDENCE")?.value || null;
  const workQueue = sources.find((item) => item.name === "WORK_QUEUE")?.value || null;
  const canonicalTaskIdentity = workQueue?.canonicalCurrentTaskIdentity || null;
  const effectiveTaskRef = requestedTaskRef
    || (taskRouteContext?.route?.state === "VERIFIED" ? taskRouteContext.route.task_ref : "")
    || (taskStatusRequired && workQueue?.currentTaskCount === 1
      ? workQueue.currentTaskCandidates?.[0]?.taskRef || workQueue.currentTaskCandidates?.[0]?.taskId || ""
      : "")
    || (canonicalTaskIdentity?.status === "READY" ? canonicalTaskIdentity.taskRef : "");
  const planningClosure = sources.find((item) => item.name === "PLANNING_CLOSURE")?.value || null;
  const release = sources.find((item) => item.name === "RELEASE_GUIDE")?.value || null;
  const adoption = sources.find((item) => item.name === "ADOPTION_AUTOPILOT")?.value || null;
  const resumeDecision = taskRouteContext?.resumeDecision || null;
  const currentGit = gitWorktreeState(projectRoot);
  const projectEntryTrust = workflowNext.value?.projectEntryTrust || null;
  const projectEntryTrustBlocked = Boolean(projectEntryTrust?.blockers?.length)
    || !entryAllowsOperation(projectEntryTrust, operation);
  const sourceFailure = sources.some((item) => ["RESOLVER", "FINAL_DECISION"].includes(item.sourceKind) && item.readStatus === "FAILED")
    || currentGit.observationStatus === "FAILED"
    || projectEntryTrustBlocked;
  const gateFailure = sources.some((item) => item.sourceKind === "GATE" && item.readStatus === "FAILED");
  const dirtyWorktree = currentGit.isDirty
    || projectState === "DIRTY_WORKTREE_PROJECT"
    || projectStateTags.includes("DIRTY_WORKTREE_PROJECT");
  const planningTaskImpact = planningClosure?.structuredEvidence?.task_impact;
  const taskImpact = (planningTaskImpact && planningTaskImpact !== "UNKNOWN" ? planningTaskImpact : "")
    || (operation === "FINISH_TASK" && canonicalTaskIdentity?.status === "READY" ? canonicalTaskIdentity.taskImpact : "")
    || taskGovernance?.impactClassification?.task_impact
    || taskGovernance?.structuredEvidence?.impact_classification?.task_impact
    || "NOT_APPLICABLE";
  const baselineEnforcement = sources.find((item) => item.name === "BASELINE_ENFORCEMENT_CHECK") || null;
  const baselineSetupAction = baselineConsumptionRequired && baselineEnforcement?.readStatus === "FAILED"
    ? baselineEnforcement.remediationAction || "RUN_PLATFORM_BASELINE_SETUP"
    : null;
  const projectSetupAction = baselineSetupAction || (behavioralAdoptionState !== "VERIFIED_ACTIVE"
    && projectSetupActions.has(workflowNext.value?.nextAction)
    ? workflowNext.value.nextAction
    : null);
  const operatingState = operatingStateFor({
    operation,
    sourceFailure,
    gateFailure,
    dirtyWorktree,
    productionSensitive: projectEntry === "PRODUCTION_SENSITIVE_ENTRY",
    taskImpact,
    taskGovernance,
    closure,
    completionEvidence,
    workQueue,
    canonicalTaskIdentity,
    effectiveTaskRef,
    finalDecisionIsLast: sources.at(-1)?.name === "UNIFIED_CLOSURE",
    planningClosure,
    projectSetupAction,
    discussionOnly: operation === "DISCUSS_ONLY",
    resumeRequested: operation === "RESUME_TASK" && resumeDecision?.approved !== true,
    publicTaskRoute: taskRouteContext?.publicRoute || null,
    taskStatusRequired,
  });
  const evidenceTrace = buildEvidenceTrace(sources, operation, taskGovernance, planningClosure, deliveryStatus, closure, release, adoption);
  const sourceSystemTrace = sources.map(toSourceTrace);
  const projectIdentityProjection = buildProjectIdentityProjection({
    workflowNext,
    guidance,
    projectEntry,
    projectState,
    projectStateTags,
    sourceFailure,
    currentGit,
  });
  const operatingDecision = buildOperatingDecision({
    operation,
    operatingState,
    projectEntry,
    taskImpact,
    taskGovernance,
    closure,
    completionEvidence,
    workQueue,
    canonicalTaskIdentity,
    effectiveTaskRef,
    planningClosure,
    projectSetupAction,
    sourceFailure,
    gateFailure,
    dirtyWorktree,
    evidenceTrace,
    sourceSystemTrace,
    projectIdentityProjection,
    projectEntryTrust,
    projectFactProjection: workflowNext.value?.projectFactProjection || null,
    selectedProfiles: workflowNext.value?.selectedProfiles || [],
    publicTaskRoute: taskRouteContext?.publicRoute || null,
  });
  const decisionResponsibility = operatingDecision.decisionResponsibility;

  return {
    reportType: "INTENTOS_OPERATING_STATE",
    schemaVersion: "1.99.0",
    generatedBy: "scripts/resolve-operating-loop.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot,
    readOnly: true,
    intent: intent || "NOT_PROVIDED",
    requestedTaskRef: requestedTaskRef || "N/A",
    taskRef: effectiveTaskRef || "N/A",
    canonicalCurrentTaskIdentity: canonicalTaskIdentity || {
      status: "NOT_AVAILABLE",
      resolution: "NO_WORK_QUEUE_SOURCE",
      taskRef: "",
      intent: "",
      intentDigest: "",
      sourceRefs: {},
      blockers: ["No Work Queue source was read for this operation."],
    },
    projectEntry: {
      state: projectEntry,
      sourceProjectState: projectState,
      sourceProjectStateTags: projectStateTags,
      projectEntryOrigin,
      entryIsLifecycleStage: "No",
      commonTaskLifecycleAfterEntry: "Yes",
    },
    projectIdentityProjection,
    operatingLoop: {
      operation,
      lifecyclePhase: lifecyclePhaseFor(operation),
      state: operatingState,
      statusScope: operation === "CHECK_STATUS"
        ? taskStatusRequired ? "CURRENT_TASK" : "PROJECT_INFORMATION"
        : "NOT_APPLICABLE",
      taskImpact,
      projectBaselineConsumptionRequired: baselineConsumptionRequired ? "Yes" : "No",
      projectBaselineConsumptionState: baselineConsumptionRequired
        ? baselineEnforcement?.outcome || "BASELINE_BLOCKED"
        : "NOT_REQUIRED",
      projectBaselineControlsTaskImpact: "No",
      taskImpactMayRaiseProcessDepth: "Yes",
      stricterApplicableProjectRuleRequirement: "PRESERVE_WHEN_APPLICABLE",
      stricterApplicableProjectRuleVerifiedByThisView: "No",
    },
    operatingDecision,
    humanSummary: {
      conclusion: conclusionFor(operation, operatingState, projectEntry, outputLanguage),
      projectIdentity: projectIdentitySummaryFor(projectIdentityProjection, outputLanguage),
      currentState: plainStateFor(operatingState, outputLanguage),
      blockerExplanation: plainBlockerExplanationFor(operatingDecision.blockedBy, outputLanguage),
      nextSafeAction: operatingDecision.plainAction,
      decisionNeeded: humanDecisionSummaryFor(operatingDecision, outputLanguage),
      userResponsibility: decisionResponsibility.publicPrompt,
      technicalDecisionRequiredFromUser: "No",
      internalCommandKnowledgeRequired: "No",
    },
    evidenceTrace,
    decisionResponsibility,
    sourceSystemTrace,
    publicTaskRoute: taskRouteContext?.publicRoute || notApplicablePublicTaskRoute(operation),
    resumeDecision: resumeDecision ? {
      ref: resumeDecision.ref,
      state: resumeDecision.approved ? "APPROVED_CURRENT" : "REVIEW_REQUIRED",
      digest: resumeDecision.digest,
      blockers: resumeDecision.errors,
    } : null,
    boundaries: {
      derivedViewOnly: "Yes",
      writesTargetFiles: "No",
      changesTaskState: "No",
      authorizesImplementation: "No",
      requiresSeparateTechnicalApprovalAfterInternalGates: "No",
      authorizesApply: "No",
      approvesReleaseOrProduction: "No",
      changesProjectAuthority: "No",
      replacesSourceSystems: "No",
      provesProductCorrectness: "No",
    },
    finalDecision: operation === "FINISH_TASK" ? {
      sourceSystem: "UNIFIED_CLOSURE",
      isLastConsumer: sourceSystemTrace.at(-1)?.sourceSystem === "UNIFIED_CLOSURE" ? "Yes" : "No",
      decision: closure?.closureDecision?.decision || "NOT_AVAILABLE",
      canCountAsDone: closure?.closureDecision?.canCountAsDone || "No",
    } : null,
    outcome: operation === "FINISH_TASK" ? operatingState : sourceFailure ? "BLOCKED_BY_SOURCE_FAILURE" : operatingState,
  };
}

function requiresActiveIntentOSOperation(operation) {
  return new Set(["CONTINUE_TASK", "RESUME_TASK"]).has(operation);
}

function isReadOnlyProjectOperation(operation) {
  return new Set(["CHECK_STATUS", "FINISH_TASK", "PREPARE_RELEASE"]).has(operation);
}

function entryAllowsOperation(trust, operation) {
  if (!trust?.entry_state) return false;
  if (trust.entry_state === "BLOCKED_REPAIR_REQUIRED") return false;
  if (["DISCUSS_ONLY", "ADOPT_PROJECT"].includes(operation)) return true;
  if (isReadOnlyProjectOperation(operation)) {
    return ["READY_FOR_READ_ONLY_ASSESSMENT", "READY_FOR_INTENTOS_OPERATION"].includes(trust.entry_state);
  }
  if (operation === "START_PROJECT") {
    return ["READY_FOR_CONTROLLED_SETUP", "READY_FOR_INTENTOS_OPERATION"].includes(trust.entry_state);
  }
  if (requiresActiveIntentOSOperation(operation)) return trust.entry_state === "READY_FOR_INTENTOS_OPERATION";
  return true;
}

function addOperationSources(sources, operation, context = {}) {
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
      resumeDecision = inspectResumeDecision(route);
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

    pushSelectedGate(sources, "WORK_QUEUE_TAKEOVER_CHECK", "scripts/check-work-queue-takeover.mjs", identity?.sourceRefs?.takeover, [
      "--require-report",
      "--require-structured-evidence",
      "--require-current-task-lineage",
    ]);
    pushSelectedGate(sources, "TASK_GOVERNANCE_CHECK", "scripts/check-task-governance.mjs", identity?.sourceRefs?.taskGovernance, [
      "--require-report",
      "--require-structured-evidence",
      "--require-current-task-lineage",
    ]);

    if (identity?.businessUniverseRequired) {
      pushSelectedGate(sources, "BUSINESS_UNIVERSE_COVERAGE_CHECK", "scripts/check-business-universe-coverage.mjs", identity.sourceRefs?.businessUniverse, [
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
      pushSelectedGate(sources, "CONTROL_EFFECTIVENESS_CHECK", "scripts/check-control-effectiveness.mjs", identity.sourceRefs?.controlEffectiveness, controlArgs);
    }

    const planReviewRequired = identity?.planReviewRequired === true;
    if (planReviewRequired) {
      pushSelectedGate(sources, "PLAN_REVIEW_CHECK", "scripts/check-plan-review.mjs", identity.sourceRefs?.planReview, [
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
    pushSelectedGate(sources, "EXECUTION_ASSURANCE_CHECK", "scripts/check-execution-assurance.mjs", identity?.sourceRefs?.executionAssurance, executionArgs);

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
    pushSelectedGate(sources, "COMPLETION_EVIDENCE", "scripts/check-completion-evidence.mjs", selectedCompletionRef, completionArgs);

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

function pushSelectedGate(sources, name, script, reportRef, flags) {
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

function inspectResumeDecision(route) {
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

function notApplicablePublicTaskRoute(operation) {
  const base = {
    state: "NOT_REQUIRED",
    operation,
    required_sequence: ["WORK_QUEUE", "EXACT_CURRENT_ITEM", "TASK_GOVERNANCE_LINEAGE", "PLANNING_CLOSURE"],
    sequence: [],
    blockers: [],
  };
  return { ...base, routeDigest: `sha256:${sha256(JSON.stringify(base))}` };
}

function runFinalDecision(name, script, childArgs) {
  const source = runSource(name, script, childArgs);
  return {
    ...source,
    sourceKind: "FINAL_DECISION",
    sourceContract: "UNIFIED_CLOSURE_AFTER_REQUIRED_CONSUMERS",
  };
}

function normalizeProjectRef(value) {
  return String(value || "")
    .trim()
    .replace(/^(?:artifact|file):/i, "")
    .split("#")[0]
    .replaceAll("\\", "/");
}

function runSource(name, script, childArgs) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...childArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32,
  });
  if (result.status !== 0) {
    return {
      name,
      script,
      sourceKind: "RESOLVER",
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_SOURCE_FAILURE",
      ref: `generated:${script}`,
      semanticDigest: `sha256:${sha256(result.stderr || result.stdout || "source resolver failed")}`,
      value: null,
      error: firstUsefulLine(result.stderr || result.stdout || "source resolver failed"),
    };
  }
  try {
    const value = JSON.parse(result.stdout);
    const nestedFailures = name === "WORKFLOW_GUIDANCE"
      ? (value.deepOrchestration?.failures || [])
      : [];
    const semanticValue = { ...value };
    delete semanticValue.generatedAt;
    return {
      name,
      script,
      sourceKind: "RESOLVER",
      readStatus: nestedFailures.length > 0 ? "FAILED" : "CURRENT_RUN",
      outcome: nestedFailures.length > 0 ? "BLOCKED_BY_NESTED_SOURCE_FAILURE" : sourceOutcome(value),
      ref: sourceRef(value, script),
      semanticDigest: `sha256:${sha256(JSON.stringify(semanticValue))}`,
      value,
      error: nestedFailures.length > 0
        ? nestedFailures.map((item) => `${item.id}: ${item.reason}`).join("; ")
        : "",
    };
  } catch (error) {
    return {
      name,
      script,
      sourceKind: "RESOLVER",
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_INVALID_SOURCE",
      ref: `generated:${script}`,
      semanticDigest: `sha256:${sha256(result.stdout || error.message)}`,
      value: null,
      error: `invalid JSON: ${error.message}`,
    };
  }
}

function runGateSource(name, script, childArgs) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...childArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32,
  });
  try {
    const value = JSON.parse(result.stdout);
    const contract = gateContractResult(name, value);
    const acceptedExitStatuses = Array.isArray(contract.acceptedExitStatuses)
      ? contract.acceptedExitStatuses
      : [0];
    const accepted = acceptedExitStatuses.includes(result.status) && contract.ok;
    const reportIndex = childArgs.indexOf("--report");
    const reportRef = reportIndex >= 0 ? normalizeProjectRef(childArgs[reportIndex + 1]) : "";
    return {
      name,
      script,
      sourceKind: "GATE",
      sourceContract: contract.contract,
      readStatus: accepted ? "CURRENT_RUN" : "FAILED",
      outcome: contract.outcome,
      ref: reportRef ? `artifact:${reportRef}` : `generated:${script}`,
      semanticDigest: `sha256:${sha256(JSON.stringify(value))}`,
      value,
      remediationAction: contract.remediationAction || "",
      error: accepted
        ? ""
        : firstUsefulLine(contract.reason || firstFailedGateMessage(value) || result.stderr || `checker exited ${result.status}`),
    };
  } catch (error) {
    return {
      name,
      script,
      sourceKind: "GATE",
      sourceContract: "INVALID_JSON",
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_INVALID_SOURCE",
      ref: `generated:${script}`,
      semanticDigest: `sha256:${sha256(result.stderr || result.stdout || error.message)}`,
      value: null,
      error: firstUsefulLine(result.stderr || result.stdout || error.message),
    };
  }
}

function gateContractResult(name, value) {
  if (name === "BASELINE_ENFORCEMENT_CHECK") {
    const baseline = validateBaselineEnforcementConsumption(value);
    return {
      ...baseline,
      contract: "IMPLEMENTATION_BASELINE_READINESS",
      acceptedExitStatuses: [0, 1],
    };
  }

  if (Object.prototype.hasOwnProperty.call(value || {}, "consumerOutcome")) {
    return {
      ...requireAcceptedOutcome(value),
      contract: "TYPED_CONSUMER_OUTCOME",
    };
  }

  if (name === "COMPLETION_EVIDENCE") {
    const checks = gateChecks(value);
    const reports = Array.isArray(value?.reports) ? value.reports : [];
    const ready = reports.length === 1
      && reports[0].completionState === "COMPLETION_EVIDENCE_READY"
      && reports[0].canClaimComplete === "Yes";
    const strict = strictCheckSet(checks, [/has valid structured evidence/i, /ready gate can claim complete/i]);
    return {
      ok: strict.ok && ready,
      outcome: strict.ok && ready ? "READY" : "INVALID",
      reason: strict.reason || (reports.length !== 1
        ? "strict Completion Evidence must resolve exactly one report"
        : "Completion Evidence is not ready to support a completion claim"),
      contract: "STRICT_COMPLETION_EVIDENCE",
    };
  }

  const requiredMarkers = {
    WORK_QUEUE_TAKEOVER_CHECK: [/has valid structured evidence/i, /Task Governance lineage binds this Work Queue task instance/i],
    TASK_GOVERNANCE_CHECK: [/has valid structured evidence/i, /task-instance lineage is valid/i],
    BUSINESS_UNIVERSE_COVERAGE_CHECK: [/has valid final 1\.108 structured evidence/i, /ready coverage has no unresolved items/i],
    CONTROL_EFFECTIVENESS_CHECK: [/has valid strict 1\.110 structured evidence/i, /required claims are proven effective/i],
    EXECUTION_ASSURANCE_CHECK: [/evidence artifact_type is execution_assurance_report/i, /VERIFIED_DONE satisfies current task completion obligations/i],
    RELEASE_CHANNEL_POLICY_CHECK: [/has valid structured evidence/i],
    RELEASE_EXECUTION_TOPOLOGY_CHECK: [/has valid strict topology evidence/i],
    RUNTIME_HYGIENE_CHECK: [/has valid structured evidence/i, /release preflight ready operation is release/i],
    RELEASE_EVIDENCE_GATE_CHECK: [/has valid structured evidence/i, /ready state can hand off to release owner/i],
  }[name];
  if (!requiredMarkers) {
    return {
      ok: false,
      outcome: "INVALID",
      reason: "gate result has no consumerOutcome and no source-specific strict contract",
      contract: "UNSUPPORTED_UNTYPED_RESULT",
    };
  }
  const strict = strictCheckSet(gateChecks(value), requiredMarkers);
  return {
    ...strict,
    outcome: strict.ok ? "READY" : "INVALID",
    contract: "SOURCE_SPECIFIC_STRICT_CHECKS",
  };
}

function gateChecks(value) {
  if (Array.isArray(value?.checks)) return value.checks;
  if (Array.isArray(value?.results)) return value.results;
  return [];
}

function strictCheckSet(checks, requiredMarkers) {
  if (checks.length === 0) return { ok: false, reason: "strict checker returned no check evidence" };
  const invalid = checks.find((item) => String(item?.status || "").toUpperCase() !== "PASS");
  if (invalid) return { ok: false, reason: invalid.message || "strict checker returned a non-PASS check" };
  const messages = checks.map((item) => String(item.message || "")).join("\n");
  const missing = requiredMarkers.find((marker) => !marker.test(messages));
  if (missing) return { ok: false, reason: `strict checker omitted required evidence marker ${missing}` };
  return { ok: true, reason: "" };
}

function firstFailedGateMessage(value) {
  return gateChecks(value).find((item) => item.status === "FAIL" || item.ok === false)?.message || "";
}

function operatingExitCode(report) {
  if (report.outcome === "BLOCKED_BY_SOURCE_FAILURE") return 2;
  const strictGateBlocked = report.sourceSystemTrace?.some(
    (source) => source.sourceKind === "GATE" && source.readStatus === "FAILED",
  );
  const baselineBlocked = report.sourceSystemTrace?.some(
    (source) => source.sourceSystem === "BASELINE_ENFORCEMENT_CHECK" && source.readStatus === "FAILED",
  );
  if (baselineBlocked && ["CONTINUE_TASK", "RESUME_TASK"].includes(report.operatingLoop?.operation)) return 1;
  if (report.operatingLoop?.operation === "FINISH_TASK"
    && (strictGateBlocked || report.operatingLoop.state !== "READY_TO_REPORT_DONE")) return 1;
  if (report.operatingLoop?.operation === "CHECK_STATUS"
    && report.operatingLoop.statusScope === "CURRENT_TASK"
    && report.operatingLoop.state !== "STATUS_AVAILABLE") return 1;
  return 0;
}

function statusRequestRequiresCurrentTask(value) {
  const text = String(value || "").toLowerCase();
  const explicitTaskStatus = /(?:任务|工作项|需求|功能).{0,16}(?:状态|进度|做到哪|完成情况)|(?:状态|进度|做到哪|完成情况).{0,16}(?:任务|工作项|需求|功能)|\b(?:task|work item|requirement|feature)\b.{0,24}\b(?:status|progress|completion)\b|\b(?:status|progress|completion)\b.{0,24}\b(?:task|work item|requirement|feature)\b/.test(text);
  if (explicitTaskStatus) return true;
  const explicitProjectInformation = /(?:项目|工程|仓库).{0,12}(?:状态|概况|信息|结构|接入情况)|\b(?:project|repository|repo)\b.{0,16}\b(?:status|overview|information|structure|setup)\b/.test(text);
  if (explicitProjectInformation) return false;
  return /(?:当前|现在|目前).{0,10}(?:进度|做到哪|完成情况)|(?:进度|做到哪|完成情况).{0,8}(?:如何|怎样|是什么|吗|\?|？)|\bwhere are we\b|\bwhat(?:'s| is) the (?:current )?progress\b/.test(text);
}

function operationFor(value, projectEntry) {
  const text = String(value || "").toLowerCase();
  const existingEntry = ["EXISTING_PROJECT_ENTRY", "GOVERNED_PROJECT_ENTRY", "PRODUCTION_SENSITIVE_ENTRY"].includes(projectEntry);
  const negatedNewProject = /(?:不是|并非|不属于)新项目|\b(?:not|isn['’]?t)\s+(?:a\s+)?new project\b/.test(text);
  const explicitNewProject = !negatedNewProject && /新项目|从\s*0|从零|\bnew project\b|\bfrom scratch\b/.test(text);
  const implementationSignal = /(?:新增|增加|修改|调整|实现|开发|修复|重构|加入|添加)|\b(?:add|change|implement|build|fix|refactor|create)\b/.test(text);
  const implementationAlreadyComplete = /(?:已经|已|现已).{0,10}(?:完成|实现|修复|改好|做好)|(?:实现|修复|修改|开发).{0,10}(?:已经|已)?(?:完成|完毕|结束)|\b(?:implementation|fix|change|development)\s+(?:is\s+|has\s+been\s+)?(?:done|complete|completed|finished)\b|\b(?:implemented|fixed|completed)\b/.test(text);
  const releaseImperative = hasUnnegatedReleaseImperative(text);
  const adoptionSignal = /(?:接入|采用|迁移到|切换到|整合|按照|按).{0,20}intentos|intentos.{0,20}(?:接入|采用|迁移|工作模式|工作)|\b(?:adopt|migrate|connect).{0,24}\bintentos\b|\bwork under intentos\b/.test(text);
  const globalNoWrite = /\bdo not (?:implement|change|edit|write)(?:\s+(?:anything|any files?|code|the project))?\b|不要(?:实现|改代码|写代码|修改任何|改任何)/.test(text);
  const explicitReadOnlyDiscussion = /^\s*(?:\b(?:just|only)\s+(?:discuss|review|talk|look|read)\b|只(?:讨论|沟通|评审|看|查看|读)(?:一下)?(?:这个|这份|该|下)?(?:内容|方案|文件|结果)?|先(?:讨论|沟通|看|查看|读)(?:一下)?(?:这个|这份|该|下)?(?:内容|方案|文件|结果)?)/;
  if (globalNoWrite || (!implementationSignal && explicitReadOnlyDiscussion.test(text))) return "DISCUSS_ONLY";
  if (releaseImperative && implementationSignal && !implementationAlreadyComplete) return "CONTINUE_TASK";
  if (releaseImperative) return "PREPARE_RELEASE";
  if (adoptionSignal) return "ADOPT_PROJECT";
  if (/\bresume\b|\bcontinue the paused\b|恢复.{0,12}(?:暂停|任务)|继续.{0,12}暂停/.test(text)) return "RESUME_TASK";
  if (/(?:任务|这个|这项|工作).{0,12}(?:做完|完成).{0,6}(?:吗|没有|了没|\?|？)|(?:能否|是否|可以).{0,12}(?:算|视为|认为)?(?:做完|完成|收口)|\b(?:is|can|has).{0,24}(?:done|finished|complete|close[ -]?out)\b/.test(text)) return "FINISH_TASK";
  if (implementationSignal && /(?:检查|查看).{0,12}(?:进度|状态)|\b(?:check|show|review).{0,24}\b(?:status|progress)\b/.test(text)) return "CONTINUE_TASK";
  if (/(?:查看|检查|告诉我|当前|现在|请问).{0,20}(?:进度|做到哪|完成情况|任务状态|项目状态)|(?:进度|任务状态|项目状态).{0,8}(?:如何|怎样|是什么|吗|\?|？)|\b(?:check|show|review|what is|where are we).{0,24}\b(?:status|progress)\b/.test(text)) return "CHECK_STATUS";
  const startSignal = explicitNewProject
    || /\bbuild.{0,40}from scratch\b|\bi want to build\b|\bstart this project\b|^\s*(?:please\s+)?(?:build|create|develop|make|start)\s+(?:me\s+)?(?:an?\s+)?[^\n]{0,48}\b(?:app|application|website|site|system|service|tool)\b|(?:我想|帮我|请).{0,8}(?:创建|搭建|开发|做一个).{0,24}(?:app|应用|网站|系统)(?:\s|$|[，。,.!?！？])/.test(text);
  if (startSignal) return existingEntry && !explicitNewProject ? "CONTINUE_TASK" : "START_PROJECT";
  if (projectEntry === "NEW_PROJECT_ENTRY") {
    return fs.existsSync(path.join(projectRoot, ".intentos", "version.json")) ? "CONTINUE_TASK" : "START_PROJECT";
  }
  return "CONTINUE_TASK";
}

function hasUnnegatedReleaseImperative(value) {
  const text = maskNegatedReleaseActions(String(value || "").toLowerCase());
  const englishImperative = [
    /(?:^|[.!?;]\s*|\b(?:and|then|please|now|immediately|directly|formally|also|next)\s+)(?:please\s+)?(?:deploy|publish|release)\b/,
    /\b(?:can|could|would|will)\s+you\s+(?:please\s+)?(?:deploy|publish|release)\b/,
    /\b(?:i|we)\s+(?:want|need|would like)\s+(?:you\s+)?to\s+(?:deploy|publish|release)\b/,
    /\b(?:help\s+me\s+|go\s+ahead\s+and\s+)?(?:deploy|publish|release)\s+(?:it|this|that|the|our|my|current|version|build|app|application|site|website|service|project|package|artifact|to|into|on|now|today|production|staging|preview)\b/,
    /\b(?:prepare|start|run|perform|execute|proceed\s+with)\s+(?:the\s+|a\s+)?(?:release|deployment|publication)\b/,
  ];
  if (englishImperative.some((pattern) => pattern.test(text))) return true;

  return [
    /(?:^|[，。；！？,;]\s*)(?:请|帮我|现在|立即|立刻|直接|正式)?\s*(?:发布|上线|部署|提交审核)(?:\s|$|[，。；！？,;]|到|至|当前|这个|本次|该|新|版本|构建|应用|网站|服务|项目|功能|后端|前端|小程序|生产|测试|预览|内部|灰度|候选)/,
    /(?:请|帮我|现在|立即|立刻|直接|正式|准备|开始|执行|安排|继续|然后|并且|并|再|后).{0,6}(?:发布|上线|部署|提交审核)(?:\s|$|[，。；！？,;]|到|至|当前|这个|本次|该|新|版本|构建|应用|网站|服务|项目|功能|后端|前端|小程序|生产|测试|预览|内部|灰度|候选)/,
    /(?:发布|上线|部署)(?:到|至)(?:生产|测试|预览|正式|线上|暂存|staging|production)/,
  ].some((pattern) => pattern.test(text));
}

function maskNegatedReleaseActions(value) {
  return String(value || "")
    .replace(/\b(?:do\s+not|don['’]?t|never|not\s+ready\s+to|without)\s+(?:ever\s+)?(?:deploy|publish|release)(?:ment)?\b/g, " ")
    .replace(/(?:不要|别|勿|暂不|先不|不能|不可|不再|无需).{0,6}(?:发布|上线|部署|提交审核)/g, " ");
}

function projectEntryFor(projectState, root, tags = [], projectEntryOrigin = "UNKNOWN_PROJECT_ORIGIN", projectFacts = null) {
  const lifecycleState = String(projectFacts?.lifecycle?.state || "UNKNOWN");
  const hasCurrentLifecycleProjection = lifecycleState !== "UNKNOWN";
  if (lifecycleState === "PRODUCTION_ACTIVE") return "PRODUCTION_SENSITIVE_ENTRY";
  if (projectEntryOrigin === "NEW_PROJECT") return "NEW_PROJECT_ENTRY";
  if (projectEntryOrigin === "EXISTING_PROJECT") {
    if (tags.includes("GOVERNED_EXISTING_PROJECT")) return "GOVERNED_PROJECT_ENTRY";
    return "EXISTING_PROJECT_ENTRY";
  }
  if (tags.includes("PRODUCTION_GOVERNED_PROJECT") && !hasCurrentLifecycleProjection) return "PRODUCTION_SENSITIVE_ENTRY";
  if (tags.includes("GOVERNED_EXISTING_PROJECT")) return "GOVERNED_PROJECT_ENTRY";
  if (projectState === "NEW_PROJECT" && hasProjectSignals(root)) return "EXISTING_PROJECT_ENTRY";
  const mapping = {
    NEW_PROJECT: "NEW_PROJECT_ENTRY",
    NEW_PROJECT_TARGET: "NEW_PROJECT_ENTRY",
    BOOTSTRAPPED_PROJECT: "NEW_PROJECT_ENTRY",
    PARTIALLY_BOOTSTRAPPED_PROJECT: "EXISTING_PROJECT_ENTRY",
    EXISTING_PROJECT: "EXISTING_PROJECT_ENTRY",
    EXISTING_LIGHT_PROJECT: "EXISTING_PROJECT_ENTRY",
    EXISTING_GOVERNED_PROJECT: "GOVERNED_PROJECT_ENTRY",
    PRODUCTION_SENSITIVE_PROJECT: hasCurrentLifecycleProjection ? "GOVERNED_PROJECT_ENTRY" : "PRODUCTION_SENSITIVE_ENTRY",
    DIRTY_WORKTREE_PROJECT: "EXISTING_PROJECT_ENTRY",
    INTENTOS_REPOSITORY: "INTENTOS_SOURCE_ENTRY",
  };
  return mapping[projectState] || "UNKNOWN_PROJECT_ENTRY";
}

function readProjectEntryOrigin(root) {
  const versionPath = path.join(root, ".intentos", "version.json");
  try {
    const stat = fs.lstatSync(versionPath);
    if (!stat.isFile() || stat.isSymbolicLink()) return "UNKNOWN_PROJECT_ORIGIN";
    const value = JSON.parse(fs.readFileSync(versionPath, "utf8"));
    return new Set(["NEW_PROJECT", "EXISTING_PROJECT"]).has(value.projectEntryOrigin)
      ? value.projectEntryOrigin
      : "UNKNOWN_PROJECT_ORIGIN";
  } catch {
    return "UNKNOWN_PROJECT_ORIGIN";
  }
}

function operatingStateFor(context) {
  if (!intent) return "NEEDS_GOAL";
  if (context.sourceFailure) return "BLOCKED_BY_SOURCE_FAILURE";
  if (context.operation === "FINISH_TASK" && context.projectSetupAction) return "NEEDS_PROJECT_SETUP";
  if (context.operation === "FINISH_TASK") {
    return context.gateFailure !== true
      && context.finalDecisionIsLast
      && workQueueStateFor(context) === "READY"
      && completionMatchesCurrentTask(context)
      && closureMatchesCurrentTask(context)
      ? "READY_TO_REPORT_DONE"
      : "NOT_DONE";
  }
  if (context.dirtyWorktree && ["START_PROJECT", "CONTINUE_TASK"].includes(context.operation)) {
    return "NEEDS_CURRENT_WORK_REVIEW";
  }
  if (context.projectSetupAction && ["START_PROJECT", "CONTINUE_TASK", "RESUME_TASK"].includes(context.operation)) {
    return "NEEDS_PROJECT_SETUP";
  }
  const queueState = workQueueStateFor(context);
  if (queueState === "AMBIGUOUS") return "BLOCKED_BY_WORK_QUEUE";
  if (queueState === "INTENT_MISMATCH") return "NEEDS_TASK_SWITCH_REVIEW";
  if (queueState === "MISSING_OR_MISMATCHED") return "NEEDS_WORK_QUEUE";
  if (context.discussionOnly) return "DISCUSSION_ONLY";
  if (context.resumeRequested) return "NEEDS_RESUME_REVIEW";
  if (context.operation === "START_PROJECT") return "READY_FOR_PROJECT_PLAN";
  if (context.operation === "CHECK_STATUS") return "STATUS_AVAILABLE";
  if (context.operation === "ADOPT_PROJECT") return "ADOPTION_REVIEW_ACTIVE";
  if (context.operation === "PREPARE_RELEASE") {
    return context.gateFailure
      ? "NEEDS_RELEASE_EVIDENCE"
      : "RELEASE_EVIDENCE_READY_FOR_CONSENT_REVIEW";
  }
  if (["CONTINUE_TASK", "RESUME_TASK"].includes(context.operation) && context.planningClosure) {
    const planningOutcome = context.planningClosure.outcome;
    if (planningOutcome === "PLANNING_INVALID") return "PLANNING_INVALID";
    if (planningOutcome === "PLANNING_DISCOVERY_NEEDED") return "NEEDS_READ_ONLY_RISK_REVIEW";
    if (planningOutcome === "PLANNING_INPUT_NEEDED") return "NEEDS_PLANNING_INPUT";
    if (planningOutcome !== "PLANNING_READY") return "NEEDS_PLANNING_EVIDENCE";
    if (context.productionSensitive) return "READY_FOR_PROJECT_GOVERNED_WORK_REVIEW";
    return context.planningClosure.structuredEvidence?.task_impact === "LOW"
      ? "READY_FOR_LIGHTWEIGHT_WORK_REVIEW"
      : "READY_FOR_IMPLEMENTATION_REVIEW";
  }
  const impact = context.taskImpact || "POSSIBLE_HIGH";
  const ready = context.taskGovernance?.readiness?.ready_for_implementation_review === "Yes";
  if (impact === "POSSIBLE_HIGH") return "NEEDS_READ_ONLY_RISK_REVIEW";
  if (!ready) return "NEEDS_GOVERNANCE_EVIDENCE";
  if (context.productionSensitive) return "READY_FOR_PROJECT_GOVERNED_WORK_REVIEW";
  return impact === "LOW" ? "READY_FOR_LIGHTWEIGHT_WORK_REVIEW" : "READY_FOR_IMPLEMENTATION_REVIEW";
}

function workQueueStateFor(context) {
  const required = new Set(["CONTINUE_TASK", "FINISH_TASK", "RESUME_TASK"]).has(context.operation)
    || (context.operation === "CHECK_STATUS" && context.taskStatusRequired === true);
  if (!required) return "NOT_REQUIRED";
  const queue = context.workQueue;
  if ((queue?.canonicalizationConflicts || []).length > 0) return "AMBIGUOUS";
  if (!queue || queue.currentTaskCount !== 1) return queue?.currentTaskCount > 1 ? "AMBIGUOUS" : "MISSING_OR_MISMATCHED";
  if ((queue.queueInventory?.queueReportCount || 0) < 1) return "MISSING_OR_MISMATCHED";
  const current = Array.isArray(queue.currentTaskCandidates) ? queue.currentTaskCandidates[0] : null;
  if (context.operation === "FINISH_TASK") {
    if (context.canonicalTaskIdentity?.status !== "READY") return "MISSING_OR_MISMATCHED";
    if (!context.effectiveTaskRef || context.effectiveTaskRef !== context.canonicalTaskIdentity.taskRef) {
      return "MISSING_OR_MISMATCHED";
    }
  }
  if (requestedTaskRef
    && ["CONTINUE_TASK", "RESUME_TASK"].includes(context.operation)
    && current?.taskRef !== requestedTaskRef
    && current?.source !== requestedTaskRef
    && current?.taskId !== requestedTaskRef
    && context.publicTaskRoute?.sequence?.[1]?.ref !== requestedTaskRef) return "MISSING_OR_MISMATCHED";
  if (!requestedTaskRef && ["CONTINUE_TASK", "RESUME_TASK"].includes(context.operation) && clearlyDifferentTaskIntent(intent, current)) return "INTENT_MISMATCH";
  return "READY";
}

function clearlyDifferentTaskIntent(currentIntent, currentTask) {
  const request = String(currentIntent || "").trim();
  const title = String(currentTask?.title || "").trim();
  if (!request || !title || /^(?:current\s+)?test\s+task$/i.test(title)) return false;
  if (/(?:继续|接着|完成当前|这个任务|刚才|恢复).{0,12}(?:任务|工作|处理)?|\b(?:continue|resume|finish)\b.{0,24}\b(?:current|this|previous)?\s*(?:task|work)?\b/i.test(request)) return false;
  const requestTerms = meaningfulIntentTerms(request);
  const taskTerms = meaningfulIntentTerms(`${title} ${currentTask?.taskRef || ""}`);
  if (requestTerms.size < 1 || taskTerms.size < 1) return false;
  return ![...requestTerms].some((term) => taskTerms.has(term));
}

function meaningfulIntentTerms(value) {
  const text = String(value || "").toLowerCase();
  const ignored = new Set([
    "app", "current", "task", "work", "change", "update", "modify", "fix", "add", "new",
    "当前", "任务", "工作", "处理", "继续", "接着", "完成", "修改", "新增", "增加", "功能", "问题", "项目", "开始", "进行",
  ]);
  const terms = new Set(
    (text.match(/[a-z0-9][a-z0-9_-]{2,}/g) || [])
      .map((term) => term.replace(/\.(?:md|json|js|ts|tsx|jsx)$/i, ""))
      .filter((term) => !ignored.has(term)),
  );
  for (const segment of text.match(/[\u3400-\u9fff]{2,}/g) || []) {
    for (let index = 0; index < segment.length - 1; index += 1) {
      const term = segment.slice(index, index + 2);
      if (!ignored.has(term)) terms.add(term);
    }
  }
  return terms;
}

function completionMatchesCurrentTask(context) {
  const reports = Array.isArray(context.completionEvidence?.reports) ? context.completionEvidence.reports : [];
  if (reports.length !== 1) return false;
  const expected = context.effectiveTaskRef || "";
  if (!expected || reports[0].taskRef !== expected) return false;
  const expectedIntentDigest = context.canonicalTaskIdentity?.intentDigest || "";
  if (!expectedIntentDigest || reports[0].intentDigest !== expectedIntentDigest) return false;
  return reports[0].completionState === "COMPLETION_EVIDENCE_READY"
    && reports[0].canClaimComplete === "Yes";
}

function closureMatchesCurrentTask(context) {
  const decision = context.closure?.closureDecision;
  if (!decision || decision.decision !== "DONE" || decision.canCountAsDone !== "Yes") return false;
  const expectedTaskRef = context.effectiveTaskRef || "";
  const expectedIntentDigest = context.canonicalTaskIdentity?.intentDigest || "";
  return Boolean(expectedTaskRef && expectedIntentDigest)
    && decision.taskRef === expectedTaskRef
    && decision.intentDigest === expectedIntentDigest;
}

function buildEvidenceTrace(sources, operation, taskGovernance, planningClosure, deliveryStatus, closure, release, adoption) {
  const nodes = sources.map((source) => ({
    id: source.name,
    ref: source.ref,
    readStatus: source.readStatus,
    outcome: source.outcome,
    relation: relationFor(source.name, operation),
    strictCheckerStatus: "NOT_EVALUATED_BY_OPERATING_VIEW",
    blocksCurrentOperation: source.readStatus === "FAILED" || source.outcome === "FAIL" ? "Yes" : "No",
  }));
  const dependencies = nodes.map((node) => ({
    from: node.id,
    to: "OPERATING_STATE",
    relation: "INPUT_TO_DERIVED_VIEW",
  }));
  const missing = unique([
    ...(taskGovernance?.readiness?.blocked_by || []),
    ...(Array.isArray(planningClosure?.blockers) ? planningClosure.blockers : []).map((item) => item?.summary || item?.code || String(item)),
    ...(deliveryStatus?.missingItems || []),
    ...(closure?.requiredNextAction || []),
    ...arrayValue(release?.humanDecisions),
    ...humanDecisionTexts(adoption?.humanDecisions),
  ]).filter((item) => !/^none|n\/a$/i.test(item));
  return {
    derivedOnly: "Yes",
    createsNewEvidenceArtifact: "No",
    aggregationTarget: "OPERATING_STATE",
    nodes,
    dependencies,
    missingOrBlocking: missing,
    freshnessMeaning: "CURRENT_RUN means the source was read now; it is not a strict checker pass.",
    invalidationConditions: [
      "project or Git revision changes",
      "task or intent changes",
      "referenced source digest changes or disappears",
      "target diff changes after review",
      "approval expires or authority changes",
      "release candidate or package identity changes",
    ],
  };
}

function lifecyclePhaseFor(operation) {
  const phases = {
    START_PROJECT: "PROJECT_ENTRY",
    ADOPT_PROJECT: "PROJECT_ENTRY",
    CONTINUE_TASK: "TASK_GOVERNANCE_AND_PLANNING",
    RESUME_TASK: "TASK_RESUME_REVIEW",
    DISCUSS_ONLY: "DISCUSSION_ONLY",
    CHECK_STATUS: "TASK_STATUS",
    FINISH_TASK: "TASK_CLOSURE",
    PREPARE_RELEASE: "RELEASE_PREPARATION",
  };
  return phases[operation];
}

function buildProjectIdentityProjection(context) {
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

function projectKindForEntry(entryState) {
  if (entryState === "NEW_PROJECT_ENTRY") return "NEW_PROJECT";
  if (["EXISTING_PROJECT_ENTRY", "GOVERNED_PROJECT_ENTRY", "PRODUCTION_SENSITIVE_ENTRY"].includes(entryState)) return "EXISTING_PROJECT";
  if (entryState === "INTENTOS_SOURCE_ENTRY") return "INTENTOS_SOURCE";
  return "UNKNOWN_PROJECT";
}

function projectKindForSourceState(state) {
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

function governancePostureFor(entryState, projectStateTags, signals) {
  if (entryState === "INTENTOS_SOURCE_ENTRY") return "INTENTOS_SOURCE_GOVERNANCE";
  if (entryState === "NEW_PROJECT_ENTRY") return "NOT_ESTABLISHED";
  if (projectStateTags.includes("PRODUCTION_GOVERNED_PROJECT") || signals?.isProductionGoverned) return "PRODUCTION_GOVERNED";
  if (projectStateTags.includes("GOVERNED_EXISTING_PROJECT") || signals?.isGovernedExisting) return "GOVERNED";
  if (["EXISTING_PROJECT_ENTRY", "GOVERNED_PROJECT_ENTRY", "PRODUCTION_SENSITIVE_ENTRY"].includes(entryState)) return "LIGHT_GOVERNANCE";
  return "UNKNOWN";
}

function productionPostureFor(projectKind, governancePosture, projectStateTags, signals) {
  if (projectKind === "INTENTOS_SOURCE") return "NOT_APPLICABLE";
  if (projectKind === "NEW_PROJECT") return "NOT_ESTABLISHED";
  if (governancePosture === "PRODUCTION_GOVERNED"
    || projectStateTags.includes("PRODUCTION_GOVERNED_PROJECT")
    || signals?.isProductionGoverned
    || arrayValue(signals?.productionSignals).length > 0) return "PRODUCTION_SENSITIVE";
  if (projectKind === "EXISTING_PROJECT") return "NO_PRODUCTION_EVIDENCE";
  return "UNKNOWN";
}

function projectIdentityConflicts(context) {
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

function confidenceForProjection(context) {
  if (context.projectionStatus !== "CURRENT" || context.projectKind === "UNKNOWN_PROJECT") return "LOW";
  if (context.governancePosture === "UNKNOWN") return "MEDIUM";
  if (!["BASELINE_READY", "NOT_APPLICABLE"].includes(context.platformBaselineState)
    && context.projectKind === "EXISTING_PROJECT") return "MEDIUM";
  return "HIGH";
}

function buildOperatingDecision(context) {
  const selected = selectOperatingAction(context);
  const sourceInputs = context.sourceSystemTrace.map(({ sourceSystem, ref, outcome, readStatus, semanticDigest }) => ({
    sourceSystem,
    ref,
    outcome,
    readStatus,
    semanticDigest,
  }));
  const blockedBy = decisionBlockers(context);
  const decisionResponsibility = buildSoloOperatingModel({
    intent,
    operation: context.operation,
    actionCode: selected.actionCode,
    sourceFailure: context.sourceFailure,
    language: outputLanguage,
    selectedProfiles: context.selectedProfiles,
  });
  const humanDecision = humanDecisionFor(selected.actionCode, decisionResponsibility);
  const digestPayload = {
    contractVersion: "1.99.0",
    intentDigest: sha256(intent),
    projectRootDigest: sha256(projectRoot),
    taskRef: context.effectiveTaskRef || "N/A",
    projectEntry: context.projectEntry,
    projectIdentityProjectionDigest: context.projectIdentityProjection.projectionDigest,
    operation: context.operation,
    operatingState: context.operatingState,
    taskImpact: context.taskImpact,
    actionCode: selected.actionCode,
    actionClass: selected.actionClass,
    decisionStatus: selected.decisionStatus,
    reasonCode: selected.reasonCode,
    blockedBy,
    sourceInputs,
    responsibilityDigest: decisionResponsibility.responsibilityDigest,
  };
  return {
    contractVersion: "1.99.0",
    derivedOnly: "Yes",
    actionCode: selected.actionCode,
    actionClass: selected.actionClass,
    decisionStatus: selected.decisionStatus,
    reasonCode: selected.reasonCode,
    reason: reasonFor(selected.actionCode, blockedBy),
    blockedBy,
    sourceInputs,
    decisionResponsibility,
    requiresHumanDecisionNow: humanDecision.required ? "Yes" : "No",
    humanDecisionPrompt: humanDecision.prompt,
    canCodexContinueReadOnly: selected.canContinueReadOnly ? "Yes" : "No",
    materialActionAuthorized: "No",
    separateTechnicalApprovalRequired: "No",
    routineEngineeringMayProceedAfterInternalGates: decisionResponsibility.routineEngineeringMayProceedAfterInternalGates,
    plainAction: plainActionFor(selected.actionCode, outputLanguage),
    decisionDigest: `sha256:${sha256(JSON.stringify(digestPayload))}`,
    invalidationConditions: [...context.evidenceTrace.invalidationConditions],
  };
}

function selectOperatingAction(context) {
  if (context.sourceFailure) return action("REPAIR_SOURCE_READ", "BLOCKED_RECOVERY", "BLOCKED", "SOURCE_READ_FAILED", false);
  if (context.operatingState === "NEEDS_PROJECT_SETUP") return action("COMPLETE_PROJECT_SETUP", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", context.projectSetupAction, true);
  if (context.operation === "FINISH_TASK") {
    return context.operatingState === "READY_TO_REPORT_DONE"
      ? action("REPORT_TASK_COMPLETE", "REPORTING", "READY_TO_REPORT", "CLOSURE_SUPPORTS_DONE", true)
      : action("COMPLETE_CLOSURE_EVIDENCE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "CLOSURE_EVIDENCE_INCOMPLETE", true);
  }
  if (context.operatingState === "NEEDS_GOAL") return action("REQUEST_GOAL", "USER_INPUT", "NEEDS_USER_INPUT", "GOAL_REQUIRED", false);
  if (context.operatingState === "NEEDS_CURRENT_WORK_REVIEW") return action("REVIEW_CURRENT_WORK", "READ_ONLY_REVIEW", "NEEDS_USER_INPUT", "DIRTY_WORKTREE_REVIEW_REQUIRED", true);
  if (context.operatingState === "BLOCKED_BY_WORK_QUEUE") return action("REPAIR_WORK_QUEUE", "BLOCKED_RECOVERY", "BLOCKED", "MULTIPLE_CURRENT_TASKS", true);
  if (context.operatingState === "NEEDS_TASK_SWITCH_REVIEW") return action("REVIEW_TASK_SWITCH", "READ_ONLY_REVIEW", "NEEDS_USER_INPUT", "NEW_GOAL_DIFFERS_FROM_CURRENT_TASK", true);
  if (context.operatingState === "NEEDS_WORK_QUEUE") return action("PREPARE_WORK_QUEUE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "CURRENT_TASK_RECORD_REQUIRED", true);
  if (context.operatingState === "DISCUSSION_ONLY") return action("DISCUSS_WITHOUT_EXECUTION", "DISCUSSION", "READY_TO_DISCUSS", "DISCUSSION_ONLY_REQUESTED", true);
  if (context.operatingState === "NEEDS_RESUME_REVIEW") return action("REVIEW_PAUSED_TASK", "READ_ONLY_REVIEW", "NEEDS_USER_INPUT", "PAUSED_TASK_REVIEW_REQUIRED", true);
  if (context.operation === "START_PROJECT") return action("PREPARE_PROJECT_PLAN", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "PROJECT_PLAN_REQUIRED", true);
  if (context.operation === "ADOPT_PROJECT") return action("RUN_ADOPTION_REVIEW", "READ_ONLY_REVIEW", "READ_ONLY_ACTION_REQUIRED", "ADOPTION_REVIEW_REQUIRED", true);
  if (context.operation === "CHECK_STATUS") return action("SUMMARIZE_CURRENT_STATUS", "REPORTING", "READY_TO_REPORT", "STATUS_SUMMARY_REQUESTED", true);
  if (context.operation === "PREPARE_RELEASE") {
    return context.operatingState === "NEEDS_RELEASE_EVIDENCE"
      ? action("COMPLETE_RELEASE_EVIDENCE", "RELEASE_EVIDENCE_PREPARATION", "ACTION_REQUIRED", "RELEASE_EVIDENCE_INCOMPLETE", true)
      : action("PREPARE_RELEASE_REVIEW", "RELEASE_REVIEW_PREPARATION", "READY_FOR_CONSENT_REVIEW", "RELEASE_EVIDENCE_READY", true);
  }
  if (context.operatingState === "PLANNING_INVALID") return action("REPAIR_PLANNING_EVIDENCE", "BLOCKED_RECOVERY", "BLOCKED", "PLANNING_EVIDENCE_INVALID", true);
  if (context.operatingState === "NEEDS_PLANNING_INPUT") return action("RESOLVE_PLANNING_INPUT", "BUSINESS_INPUT", "ACTION_REQUIRED", "PLANNING_INPUT_REQUIRED", true);
  if (context.planningClosure?.outcome === "PLANNING_READY") {
    if (context.taskImpact === "LOW" && context.operatingState !== "READY_FOR_PROJECT_GOVERNED_WORK_REVIEW") {
      return action("PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW", "IMPLEMENTATION_REVIEW_PREPARATION", "READY_FOR_REVIEW_PREPARATION", "PLANNING_CLOSURE_READY", true);
    }
    return action("PREPARE_IMPLEMENTATION_REVIEW", "IMPLEMENTATION_REVIEW_PREPARATION", "READY_FOR_REVIEW_PREPARATION", "PLANNING_CLOSURE_READY", true);
  }
  if (context.taskImpact === "POSSIBLE_HIGH") return action("INSPECT_TASK_RISK", "READ_ONLY_REVIEW", "READ_ONLY_ACTION_REQUIRED", "TASK_IMPACT_UNRESOLVED", true);

  const blockers = arrayValue(context.taskGovernance?.readiness?.blocked_by);
  if (blockers.length > 0) return actionForTaskBlocker(blockers);
  if (context.operatingState === "NEEDS_PLANNING_EVIDENCE") return action("COMPLETE_PLANNING_CLOSURE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "PLANNING_CLOSURE_INCOMPLETE", true);
  if (context.taskGovernance?.readiness?.ready_for_implementation_review === "Yes") {
    if (context.taskImpact === "LOW" && context.operatingState !== "READY_FOR_PROJECT_GOVERNED_WORK_REVIEW") {
      return action("PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW", "IMPLEMENTATION_REVIEW_PREPARATION", "READY_FOR_REVIEW_PREPARATION", "LOW_TASK_READY_FOR_REVIEW", true);
    }
    return action("PREPARE_IMPLEMENTATION_REVIEW", "IMPLEMENTATION_REVIEW_PREPARATION", "READY_FOR_REVIEW_PREPARATION", "TASK_READY_FOR_REVIEW", true);
  }
  return action("COMPLETE_TASK_GOVERNANCE_PREREQUISITES", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_UNRESOLVED", true);
}

function actionForTaskBlocker(blockers) {
  const joined = blockers.join("\n").toLowerCase();
  if (/adoption review/.test(joined)) return action("RESOLVE_ADOPTION_BLOCKER", "READ_ONLY_REVIEW", "READ_ONLY_ACTION_REQUIRED", "ADOPTION_BLOCKS_TASK_GOVERNANCE", true);
  if (/omission-risk inspection/.test(joined)) return action("INSPECT_BUSINESS_UNIVERSE_RISK", "READ_ONLY_REVIEW", "READ_ONLY_ACTION_REQUIRED", "BUSINESS_UNIVERSE_INSPECTION_REQUIRED", true);
  if (/business universe coverage/.test(joined)) return action("PREPARE_BUSINESS_UNIVERSE_COVERAGE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
  if (/control effectiveness|control proof|control enforcement/.test(joined)) return action("PREPARE_CONTROL_EFFECTIVENESS", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "CONTROL_EFFECTIVENESS_REQUIRED", true);
  if (/business rule/.test(joined)) return action("PREPARE_BUSINESS_RULE_CLOSURE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
  if (/affected-surface|surface map/.test(joined)) return action("PREPARE_CHANGE_IMPACT_COVERAGE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
  if (/execution plan/.test(joined)) return action("PREPARE_EXECUTION_PLAN", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
  if (/verification checklist|verification plan/.test(joined)) return action("PREPARE_VERIFICATION_PLAN", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
  return action("COMPLETE_TASK_GOVERNANCE_PREREQUISITES", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
}

function action(actionCode, actionClass, decisionStatus, reasonCode, canContinueReadOnly) {
  return { actionCode, actionClass, decisionStatus, reasonCode, canContinueReadOnly };
}

function decisionBlockers(context) {
  if (context.sourceFailure) {
    return context.sourceSystemTrace
      .filter((source) => source.readStatus === "FAILED")
      .map((source) => `${source.sourceSystem}: ${source.error || "source read failed"}`);
  }
  if (context.gateFailure) {
    return context.sourceSystemTrace
      .filter((source) => source.sourceKind === "GATE" && source.readStatus === "FAILED")
      .map((source) => `${source.sourceSystem}: ${source.error || "required gate failed"}`);
  }
  if (context.operatingState === "NEEDS_CURRENT_WORK_REVIEW") return ["current worktree has uncommitted changes"];
  if (context.operatingState === "BLOCKED_BY_WORK_QUEUE") return ["Work Queue has more than one CURRENT task"];
  if (context.operatingState === "NEEDS_TASK_SWITCH_REVIEW") return ["the new goal does not match the single CURRENT task"];
  if (context.operatingState === "NEEDS_WORK_QUEUE") return ["one durable CURRENT Work Queue item matching this task is required"];
  if (context.operatingState === "NEEDS_RESUME_REVIEW") return ["paused task requires current-state, worktree, evidence, and resume review"];
  if (["PLANNING_INVALID", "NEEDS_PLANNING_INPUT", "NEEDS_PLANNING_EVIDENCE"].includes(context.operatingState)) {
    return unique([
      ...(Array.isArray(context.planningClosure?.blockers) ? context.planningClosure.blockers : [])
        .map((item) => item?.summary || item?.code || String(item)),
      ...arrayValue(context.taskGovernance?.readiness?.blocked_by),
    ]);
  }
  if (context.operation === "CONTINUE_TASK") return arrayValue(context.taskGovernance?.readiness?.blocked_by);
  if (context.operation === "FINISH_TASK" && context.operatingState !== "READY_TO_REPORT_DONE") {
    return arrayValue(context.closure?.requiredNextAction);
  }
  if (["ADOPT_PROJECT", "PREPARE_RELEASE"].includes(context.operation)) {
    return arrayValue(context.evidenceTrace.missingOrBlocking);
  }
  return [];
}

function humanDecisionFor(actionCode, responsibility) {
  const zh = outputLanguage === "zh";
  return {
    required: responsibility.userActionRequiredNow === "Yes",
    prompt: responsibility.publicPrompt || (zh ? "不需要你做技术判断。" : "No technical decision is required from you."),
  };
}

function humanDecisionSummaryFor(decision, language = "en") {
  if (decision.requiresHumanDecisionNow === "Yes") return decision.humanDecisionPrompt;
  return language === "zh"
    ? `不需要。${decision.humanDecisionPrompt}`
    : `No. ${decision.humanDecisionPrompt}`;
}

function reasonFor(actionCode, blockers) {
  const firstBlocker = blockers[0] || "no blocking source input";
  const values = {
    REPAIR_SOURCE_READ: `A required source failed: ${firstBlocker}.`,
    REQUEST_GOAL: "The Operating Model cannot select a safe route without a goal.",
    REVIEW_CURRENT_WORK: "The worktree contains uncommitted work that must be mapped before continuation.",
    COMPLETE_PROJECT_SETUP: `Project setup is incomplete: ${firstBlocker}.`,
    REPAIR_WORK_QUEUE: `The Work Queue is ambiguous: ${firstBlocker}.`,
    REVIEW_TASK_SWITCH: `The requested goal appears different from the current task: ${firstBlocker}.`,
    PREPARE_WORK_QUEUE: `The Work Queue is not durably bound to the current task: ${firstBlocker}.`,
    DISCUSS_WITHOUT_EXECUTION: "The user explicitly requested discussion without implementation or project writes.",
    REVIEW_PAUSED_TASK: "Paused work requires a current-state, worktree, evidence, and human resume review.",
    PREPARE_PROJECT_PLAN: "The goal starts a project and requires a project plan and baseline recommendation.",
    RUN_ADOPTION_REVIEW: "The goal requests existing-project adoption, which starts with read-only review.",
    SUMMARIZE_CURRENT_STATUS: "The user requested current project or task status.",
    INSPECT_TASK_RISK: "Task Governance classified the task as POSSIBLE_HIGH and requires clarification.",
    RESOLVE_ADOPTION_BLOCKER: `Task Governance is blocked by adoption state: ${firstBlocker}.`,
    INSPECT_BUSINESS_UNIVERSE_RISK: `Task Governance requires a bounded omission-risk inspection: ${firstBlocker}.`,
    PREPARE_BUSINESS_UNIVERSE_COVERAGE: `Task Governance requires evidence-backed Business Universe Coverage: ${firstBlocker}.`,
    PREPARE_CONTROL_EFFECTIVENESS: `Task Governance relies on a control whose bounded enforcement proof is incomplete: ${firstBlocker}.`,
    PREPARE_BUSINESS_RULE_CLOSURE: `Task Governance requires business-rule clarification: ${firstBlocker}.`,
    PREPARE_CHANGE_IMPACT_COVERAGE: `Task Governance requires an affected-surface map: ${firstBlocker}.`,
    PREPARE_EXECUTION_PLAN: `Task Governance requires a durable execution plan: ${firstBlocker}.`,
    PREPARE_VERIFICATION_PLAN: `Task Governance requires a verification plan: ${firstBlocker}.`,
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: `Task Governance is not ready: ${firstBlocker}.`,
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Task Governance classified the task as LOW and permits lightweight review preparation.",
    PREPARE_IMPLEMENTATION_REVIEW: "Task Governance prerequisites permit implementation-review preparation.",
    COMPLETE_CLOSURE_EVIDENCE: `Unified Closure does not support a done claim: ${firstBlocker}.`,
    REPORT_TASK_COMPLETE: "Unified Closure supports reporting the current task as done.",
    COMPLETE_RELEASE_EVIDENCE: `Release preparation is missing strict evidence: ${firstBlocker}.`,
    PREPARE_RELEASE_REVIEW: "Strict release evidence is current; the exact external effect can now be prepared for consent review, but execution remains unauthorized.",
    REPAIR_PLANNING_EVIDENCE: `Planning sources are inconsistent or invalid: ${firstBlocker}.`,
    RESOLVE_PLANNING_INPUT: `Planning requires one business or external fact that the project cannot prove: ${firstBlocker}.`,
    COMPLETE_PLANNING_CLOSURE: `Planning is not ready for implementation review: ${firstBlocker}.`,
  };
  return values[actionCode] || `The safe next route is ${actionCode}.`;
}

function plainActionFor(actionCode, language = "en") {
  const zh = {
    REPAIR_SOURCE_READ: "Codex 先说明或修复来源读取失败，再继续。",
    REQUEST_GOAL: "告诉 Codex 你想做成什么。",
    REVIEW_CURRENT_WORK: "Codex 自动梳理现有未提交改动并绑定到正确任务，不需要你判断技术差异。",
    COMPLETE_PROJECT_SETUP: "Codex 先自动完成项目理解、平台识别和对应基线设置；完成前不会提前进入业务实现。",
    REPAIR_WORK_QUEUE: "Codex 先整理任务队列，只保留一个当前任务，再继续。",
    REVIEW_TASK_SWITCH: "Codex 先保留当前任务进度并整理任务切换建议，你只需确认先做哪一个。",
    PREPARE_WORK_QUEUE: "Codex 先建立唯一的当前任务记录，再继续任务治理或收口。",
    DISCUSS_WITHOUT_EXECUTION: "Codex 只沟通和分析，不进入实现、不修改项目。",
    REVIEW_PAUSED_TASK: "Codex 自动核对暂停任务的状态、改动和旧证据，安全时继续恢复。",
    PREPARE_PROJECT_PLAN: "Codex 自动准备项目方案、技术架构和完整基线，不要求你做技术选择。",
    RUN_ADOPTION_REVIEW: "Codex 自动读取并接入已有项目；需要写入时走内部受控计划，不要求你选择接入模式。",
    SUMMARIZE_CURRENT_STATUS: "Codex 汇总当前证据，并用白话说明已完成、未完成和下一步。",
    INSPECT_TASK_RISK: "Codex 先只读确认数据、状态、权限或接口影响，不直接改代码。",
    RESOLVE_ADOPTION_BLOCKER: "Codex 先解释并处理当前项目接入阻断，不改项目资产。",
    INSPECT_BUSINESS_UNIVERSE_RISK: "Codex 先只读核对相关业务类别、来源和路径是否可能遗漏，不需要你判断技术范围。",
    PREPARE_BUSINESS_UNIVERSE_COVERAGE: "Codex 先把相关业务类别、生命周期、真实路径和验证义务核对完整，再进入后续审查。",
    PREPARE_CONTROL_EFFECTIVENESS: "Codex 先验证当前任务依赖的检查或门禁是否真的覆盖并拦住对应问题，再继续实现或收口。",
    PREPARE_BUSINESS_RULE_CLOSURE: "Codex 先把业务规则、例外和完成条件梳理完整，再进入实现审查。",
    PREPARE_CHANGE_IMPACT_COVERAGE: "Codex 先补齐前端、后端、数据和运行面的影响范围，再进入实现审查。",
    PREPARE_EXECUTION_PLAN: "Codex 先准备完整执行计划，再进入实现审查。",
    PREPARE_VERIFICATION_PLAN: "Codex 先明确需要验证什么以及如何证明，再进入实现审查。",
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: "Codex 先补齐当前任务缺少的治理条件，再进入实现审查。",
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Codex 按低影响任务自动完成小范围实现、验证和复查。",
    PREPARE_IMPLEMENTATION_REVIEW: "Codex 按当前任务影响级别自动完成实现、验证和复查，不需要额外技术批准。",
    COMPLETE_CLOSURE_EVIDENCE: "Codex 先补齐缺失证据，再判断任务是否完成。",
    REPORT_TASK_COMPLETE: "Codex 可以生成任务完成说明，但这不代表发布或生产批准。",
    COMPLETE_RELEASE_EVIDENCE: "Codex 先自动补齐发布渠道、候选版本、运行环境、验证、备份和回滚证据；当前不会执行外部发布。",
    PREPARE_RELEASE_REVIEW: "严格发布证据已经齐全；Codex 现在只准备说明具体外部影响，仍未获得执行授权。",
    REPAIR_PLANNING_EVIDENCE: "Codex 先修复当前任务、意图和规划证据之间的不一致，再继续。",
    RESOLVE_PLANNING_INPUT: "Codex 已完成技术判断，现在只整理项目无法证明的业务或外部事实。",
    COMPLETE_PLANNING_CLOSURE: "Codex 先自动补齐当前任务缺少的规划、影响和验证证据，再进入实现审查。",
  };
  const en = {
    REPAIR_SOURCE_READ: "Codex should explain or repair the failed source read before continuing.",
    REQUEST_GOAL: "Tell Codex what outcome you want.",
    REVIEW_CURRENT_WORK: "Codex should map current uncommitted work to the correct task without asking the user to judge technical differences.",
    COMPLETE_PROJECT_SETUP: "Codex should complete project understanding, platform detection, and the matching baseline before implementation begins.",
    REPAIR_WORK_QUEUE: "Codex should repair the queue so exactly one task remains current before continuing.",
    REVIEW_TASK_SWITCH: "Codex should preserve the current task and prepare a task-switch recommendation; the user only confirms which goal comes first.",
    PREPARE_WORK_QUEUE: "Codex should establish one durable current task record before task governance or close-out continues.",
    DISCUSS_WITHOUT_EXECUTION: "Codex should discuss and analyze only, without implementation or project writes.",
    REVIEW_PAUSED_TASK: "Codex should review current state, worktree, and prior evidence and resume safely when the evidence permits.",
    PREPARE_PROJECT_PLAN: "Codex should select the project plan, architecture, and complete technical baseline without asking the user to choose them.",
    RUN_ADOPTION_REVIEW: "Codex should read and connect the existing project automatically, using the internal controlled plan when writes are needed.",
    SUMMARIZE_CURRENT_STATUS: "Codex should summarize current evidence, completed work, missing work, and the next step.",
    INSPECT_TASK_RISK: "Codex should inspect possible data, state, permission, or API impact before changing code.",
    RESOLVE_ADOPTION_BLOCKER: "Codex should explain and resolve the adoption blocker without changing project assets.",
    INSPECT_BUSINESS_UNIVERSE_RISK: "Codex should inspect task-relevant business classes, origins, and paths for omission risk without asking the user to judge technical scope.",
    PREPARE_BUSINESS_UNIVERSE_COVERAGE: "Codex should bind the relevant business classes, lifecycle paths, provenance, and verification duties before downstream review.",
    PREPARE_CONTROL_EFFECTIVENESS: "Codex should prove that each relied-on check or gate covers and blocks its exact claim before implementation or close-out continues.",
    PREPARE_BUSINESS_RULE_CLOSURE: "Codex should clarify business rules, exceptions, and completion conditions before implementation review.",
    PREPARE_CHANGE_IMPACT_COVERAGE: "Codex should map frontend, backend, data, and runtime impact before implementation review.",
    PREPARE_EXECUTION_PLAN: "Codex should prepare the complete execution plan before implementation review.",
    PREPARE_VERIFICATION_PLAN: "Codex should define what must be verified and how it will be proved before implementation review.",
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: "Codex should complete the missing task-governance prerequisites before implementation review.",
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Codex should complete the bounded implementation, verification, and review for this low-impact task.",
    PREPARE_IMPLEMENTATION_REVIEW: "Codex should complete implementation, verification, and review at the required depth without a separate technical approval.",
    COMPLETE_CLOSURE_EVIDENCE: "Codex should complete the missing evidence before deciding whether the task is done.",
    REPORT_TASK_COMPLETE: "Codex may report task completion, but this is not release or production approval.",
    COMPLETE_RELEASE_EVIDENCE: "Codex should complete release-channel, candidate, runtime, verification, backup, and rollback evidence without executing an external release.",
    PREPARE_RELEASE_REVIEW: "Strict release evidence is ready; Codex may now explain the exact external effect, but execution is still unauthorized.",
    REPAIR_PLANNING_EVIDENCE: "Codex should repair inconsistent task, intent, and planning evidence before continuing.",
    RESOLVE_PLANNING_INPUT: "Codex has completed the technical judgment and should surface only the business or external fact the project cannot prove.",
    COMPLETE_PLANNING_CLOSURE: "Codex should complete the missing planning, impact, and verification evidence before implementation review.",
  };
  return (language === "zh" ? zh : en)[actionCode] || actionCode;
}

function sha256(value) {
  return createHash("sha256").update(String(value || "")).digest("hex");
}

function sourceOutcome(value) {
  return String(
    value?.outcome
      || value?.closureDecision?.decision
      || value?.deliveryStatus?.currentState
      || value?.humanSummary?.adoptionState
      || value?.nextAction
      || value?.humanDecisionSummary?.conclusion
      || "READ_ONLY_RESULT",
  );
}

function sourceRef(value, script) {
  return String(
    value?.structuredEvidence?.report_ref
      || value?.structuredEvidence?.task_governance_ref
      || value?.structuredEvidence?.adoption_autopilot_ref
      || value?.reportRef
      || `generated:${script}`,
  );
}

function toSourceTrace(source) {
  return {
    sourceSystem: source.name,
    sourceKind: source.sourceKind,
    sourceContract: source.sourceContract || "RESOLVER_OUTPUT",
    ref: source.ref,
    readStatus: source.readStatus,
    outcome: source.outcome,
    error: source.error || "",
    semanticDigest: source.semanticDigest,
    authority: "SOURCE_SYSTEM_REMAINS_AUTHORITATIVE",
  };
}

function relationFor(name, operation) {
  if (name === "WORKFLOW_NEXT") return "PROJECT_ENTRY_STATE_INPUT";
  if (name === "WORKFLOW_GUIDANCE") return "PROJECT_AND_ROUTE_INPUT";
  if (name === "BASELINE_ENFORCEMENT_CHECK") return "PRE_OPERATION_BASELINE_AUTHORITY";
  if (name === "TASK_GOVERNANCE") return "TASK_IMPACT_INPUT";
  if (name === "TASK_RESUME_DECISION") return "TASK_RESUME_AUTHORITY_INPUT";
  if (name === "PLANNING_CLOSURE") return "PLANNING_READINESS_INPUT";
  if (name === "CONTROL_EFFECTIVENESS_CHECK") return "CONTROL_EFFECTIVENESS_INPUT";
  if (name === "USER_DELIVERY_CONSOLE") return "STATUS_INPUT";
  if (name === "UNIFIED_CLOSURE") return "DERIVED_CLOSURE_EXPLANATION_INPUT";
  if (name === "COMPLETION_EVIDENCE") return "FINAL_COMPLETION_AUTHORITY";
  if (name === "RELEASE_GUIDE") return "RELEASE_INPUT";
  if (name === "RELEASE_CHANNEL_POLICY_CHECK") return "RELEASE_CHANNEL_AUTHORITY_INPUT";
  if (name === "RELEASE_EXECUTION_TOPOLOGY_CHECK") return "RELEASE_TOPOLOGY_AUTHORITY_INPUT";
  if (name === "RUNTIME_HYGIENE_CHECK") return "RELEASE_RUNTIME_AUTHORITY_INPUT";
  if (name === "RELEASE_EVIDENCE_GATE_CHECK") return "FINAL_RELEASE_EVIDENCE_AUTHORITY";
  if (name === "ADOPTION_AUTOPILOT") return "PROJECT_ENTRY_INPUT";
  return `${operation}_INPUT`;
}

function conclusionFor(operation, state, entry, language) {
  if (state === "NEEDS_GOAL") return language === "zh" ? "IntentOS 需要一个明确目标才能选择路径。" : "IntentOS needs one plain goal before choosing a route.";
  if (state === "BLOCKED_BY_SOURCE_FAILURE") return language === "zh" ? "IntentOS 无法安全读取必要来源，已经停止。" : "IntentOS could not safely read one required source and stopped.";
  if (language === "zh") return `${plainOperation(operation, language)}：${plainStateFor(state, language)}。`;
  return `${plainOperation(operation, language)} for ${plainEntry(entry)} is in state: ${plainStateFor(state, language)}.`;
}

function projectIdentitySummaryFor(projection, language = "en") {
  const dirtySuffix = projection.worktreePosture === "DIRTY"
    ? (language === "zh" ? "当前还有未提交改动。" : " The current worktree has uncommitted changes.")
    : "";
  if (language === "zh") {
    const values = {
      INTENTOS_SOURCE: "这是 IntentOS 源码仓库。",
      NEW_PROJECT: projection.behavioralAdoptionState === "VERIFIED_ACTIVE"
        ? "这是一个新项目，IntentOS 工程治理已经激活。"
        : "这是一个新项目，工程治理尚未建立。",
      UNKNOWN_PROJECT: "当前项目身份还不能安全确定。",
    };
    if (values[projection.projectKind]) return `${values[projection.projectKind]}${dirtySuffix}`;
    if (projection.productionPosture === "PRODUCTION_SENSITIVE") {
      return `这是一个已有项目，已观察到生产相关治理；后续必须保留项目原有权威。${dirtySuffix}`;
    }
    if (projection.governancePosture === "GOVERNED") {
      return `这是一个已有项目，并且已经有自己的治理规则；IntentOS 不会直接覆盖它们。${dirtySuffix}`;
    }
    return `这是一个已有项目；当前没有观察到生产证据，但这不代表项目一定没有上线。${dirtySuffix}`;
  }
  const values = {
    INTENTOS_SOURCE: "This is the IntentOS source repository.",
    NEW_PROJECT: projection.behavioralAdoptionState === "VERIFIED_ACTIVE"
      ? "This is a new project with verified active IntentOS engineering governance."
      : "This is a new project whose engineering governance is not established yet.",
    UNKNOWN_PROJECT: "The project identity cannot yet be determined safely.",
  };
  if (values[projection.projectKind]) return `${values[projection.projectKind]}${dirtySuffix}`;
  if (projection.productionPosture === "PRODUCTION_SENSITIVE") {
    return `This is an existing project with observed production governance; its project-owned authority must remain in force.${dirtySuffix}`;
  }
  if (projection.governancePosture === "GOVERNED") {
    return `This is an existing governed project; IntentOS will not overwrite its project-owned rules.${dirtySuffix}`;
  }
  return `This is an existing project. No production evidence was observed, which is not proof that the project is not live.${dirtySuffix}`;
}

function plainOperation(operation, language = "en") {
  const values = language === "zh" ? {
    START_PROJECT: "开始新项目",
    CONTINUE_TASK: "继续当前任务",
    CHECK_STATUS: "检查当前状态",
    FINISH_TASK: "收口当前任务",
    PREPARE_RELEASE: "准备发布审查",
    ADOPT_PROJECT: "接入已有项目",
    RESUME_TASK: "复核并恢复暂停任务",
    DISCUSS_ONLY: "只讨论，不执行",
  } : {
    START_PROJECT: "Starting the project",
    CONTINUE_TASK: "Continuing the task",
    CHECK_STATUS: "Checking status",
    FINISH_TASK: "Finishing the task",
    PREPARE_RELEASE: "Preparing release",
    ADOPT_PROJECT: "Connecting the existing project",
    RESUME_TASK: "Reviewing paused work before resumption",
    DISCUSS_ONLY: "Discussing without execution",
  };
  return values[operation] || operation;
}

function plainEntry(entry) {
  return {
    NEW_PROJECT_ENTRY: "a new project",
    EXISTING_PROJECT_ENTRY: "an existing project",
    GOVERNED_PROJECT_ENTRY: "an existing governed project",
    PRODUCTION_SENSITIVE_ENTRY: "a production-sensitive project",
    INTENTOS_SOURCE_ENTRY: "the IntentOS source project",
    UNKNOWN_PROJECT_ENTRY: "a project whose state is still unclear",
  }[entry];
}

function plainStateFor(state, language = "en") {
  const zh = {
    NEEDS_GOAL: "需要先说明目标",
    BLOCKED_BY_SOURCE_FAILURE: "读取失败，已经停止",
    NEEDS_CURRENT_WORK_REVIEW: "需要先确认当前未完成改动",
    NEEDS_PROJECT_SETUP: "需要先由 Codex 完成项目工程设置",
    BLOCKED_BY_WORK_QUEUE: "任务队列存在多个当前任务，已经停止",
    NEEDS_TASK_SWITCH_REVIEW: "新目标和当前任务不同，需要先整理任务切换",
    NEEDS_WORK_QUEUE: "需要先建立唯一的当前任务记录",
    DISCUSSION_ONLY: "只进行沟通和分析",
    NEEDS_RESUME_REVIEW: "恢复暂停任务前需要复核",
    READY_FOR_PROJECT_PLAN: "可以准备项目方案",
    STATUS_AVAILABLE: "当前状态已整理",
    ADOPTION_REVIEW_ACTIVE: "正在进行只读接入判断",
    NEEDS_RELEASE_EVIDENCE: "发布证据尚未完整，不能进入外部动作确认",
    RELEASE_EVIDENCE_READY_FOR_CONSENT_REVIEW: "严格发布证据已齐全，可以准备具体外部动作说明，但尚未授权执行",
    READY_TO_REPORT_DONE: "证据支持任务完成结论",
    NOT_DONE: "证据还不足以认定完成",
    NEEDS_READ_ONLY_RISK_REVIEW: "需要先只读确认风险",
    NEEDS_GOVERNANCE_EVIDENCE: "需要补齐任务治理证据",
    PLANNING_INVALID: "规划证据不一致，需要先修复",
    NEEDS_PLANNING_INPUT: "缺少项目无法证明的业务或外部事实",
    NEEDS_PLANNING_EVIDENCE: "需要先补齐规划证据",
    READY_FOR_LIGHTWEIGHT_WORK_REVIEW: "可以进入轻量执行审查",
    READY_FOR_PROJECT_GOVERNED_WORK_REVIEW: "任务可继续，但必须保留生产项目原有门禁",
    READY_FOR_IMPLEMENTATION_REVIEW: "可以进入实现审查",
  };
  const en = {
    NEEDS_GOAL: "A goal is required",
    BLOCKED_BY_SOURCE_FAILURE: "Stopped because a required source could not be read",
    NEEDS_CURRENT_WORK_REVIEW: "Current uncommitted work must be reviewed first",
    NEEDS_PROJECT_SETUP: "Codex must complete the project engineering setup first",
    BLOCKED_BY_WORK_QUEUE: "Stopped because the Work Queue has multiple current tasks",
    NEEDS_TASK_SWITCH_REVIEW: "The new goal differs from the current task and needs a task-switch review",
    NEEDS_WORK_QUEUE: "One durable current task record is required",
    DISCUSSION_ONLY: "Discussion and analysis only",
    NEEDS_RESUME_REVIEW: "Paused work requires review before resumption",
    READY_FOR_PROJECT_PLAN: "Ready for project planning",
    STATUS_AVAILABLE: "Current status is available",
    ADOPTION_REVIEW_ACTIVE: "Read-only adoption review is active",
    NEEDS_RELEASE_EVIDENCE: "Release evidence is incomplete, so external-action consent cannot be requested yet",
    RELEASE_EVIDENCE_READY_FOR_CONSENT_REVIEW: "Strict release evidence is ready for exact external-effect review, but execution is not authorized",
    READY_TO_REPORT_DONE: "Evidence supports reporting this task as done",
    NOT_DONE: "Evidence is not sufficient to report done",
    NEEDS_READ_ONLY_RISK_REVIEW: "A read-only risk review is required",
    NEEDS_GOVERNANCE_EVIDENCE: "Task-governance evidence is required",
    PLANNING_INVALID: "Planning evidence is inconsistent and must be repaired",
    NEEDS_PLANNING_INPUT: "A business or external fact that the project cannot prove is required",
    NEEDS_PLANNING_EVIDENCE: "Planning evidence must be completed first",
    READY_FOR_LIGHTWEIGHT_WORK_REVIEW: "Ready for lightweight implementation review",
    READY_FOR_PROJECT_GOVERNED_WORK_REVIEW: "Task may continue only under the production project's existing gates",
    READY_FOR_IMPLEMENTATION_REVIEW: "Ready for implementation review",
  };
  return (language === "zh" ? zh : en)[state] || state;
}

function arrayValue(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

function humanDecisionTexts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string" || item?.required_now === "Yes")
    .map((item) => typeof item === "string"
      ? item
      : item.plain_question || item.question || item.id || "human decision required")
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function firstUsefulLine(value) {
  return String(value || "").split("\n").map((line) => line.trim()).find(Boolean) || "unknown error";
}

function printHuman(report) {
  const zh = outputLanguage === "zh";
  const decisionLabel = report.operatingDecision.requiresHumanDecisionNow === "Yes"
    ? (zh ? "需要你决定" : "Decision needed")
    : (zh ? "当前无需你决定" : "No decision needed now");
  console.log(zh ? "# IntentOS 当前工作状态" : "# IntentOS Current Operating State");
  console.log("");
  console.log(`${zh ? "我理解的是" : "Understood goal"}: ${intent || (zh ? "你还没有说明目标" : "No goal was provided")}`);
  console.log("");
  console.log(`${zh ? "结论" : "Current status"}: ${report.humanSummary.currentState}`);
  if (report.humanSummary.blockerExplanation) {
    console.log("");
    console.log(`${zh ? "还差什么" : "What is still missing"}: ${report.humanSummary.blockerExplanation}`);
  }
  console.log("");
  console.log(`${zh ? "项目识别" : "Project reading"}: ${report.humanSummary.projectIdentity}`);
  console.log("");
  console.log(`${zh ? "下一步" : "Next safe step"}: ${report.humanSummary.nextSafeAction}`);
  console.log("");
  console.log(`${decisionLabel}: ${report.humanSummary.decisionNeeded}`);
  console.log("");
  console.log(zh
    ? "你不需要选择技术方案、工作流、基线、测试或审查方式。这个入口本身只读；进入执行后由 Codex 完成内部门禁，真实外部影响仍需明确同意。"
    : "You do not choose the technical plan, workflow, baseline, tests, or review method. This entry is read-only; Codex handles internal gates during execution, while real external effects still require explicit consent.");
}

function plainBlockerExplanationFor(values, language = "en") {
  const blockers = unique(Array.isArray(values) ? values : []);
  if (blockers.length === 0) return "";
  const zh = {
    SOURCE_READ_FAILED: "IntentOS 还没有可靠读到当前项目资料。",
    WORK_QUEUE_REQUIRED: "当前任务还没有形成唯一、可恢复的记录。",
    TASK_GOVERNANCE_REQUIRED: "当前任务的影响范围和执行深度还没有被可靠确认。",
    PLAN_REVIEW_REQUIRED: "执行方案还没有通过独立复核。",
    EXECUTION_ASSURANCE_REQUIRED: "实际改动、测试和复查还没有形成同一条证据链。",
    COMPLETION_EVIDENCE_REQUIRED: "完成结论所需的当前任务证据还不完整。",
    RELEASE_EVIDENCE_REQUIRED: "发布前需要的候选版本、验证、回滚或运行证据还不完整。",
  };
  const en = {
    SOURCE_READ_FAILED: "IntentOS has not read the current project evidence reliably yet.",
    WORK_QUEUE_REQUIRED: "The current task does not yet have one durable, resumable record.",
    TASK_GOVERNANCE_REQUIRED: "The task impact and required execution depth are not yet bound reliably.",
    PLAN_REVIEW_REQUIRED: "The execution plan has not passed independent review yet.",
    EXECUTION_ASSURANCE_REQUIRED: "The actual changes, tests, and review are not yet bound into one evidence chain.",
    COMPLETION_EVIDENCE_REQUIRED: "The current task does not yet have complete close-out evidence.",
    RELEASE_EVIDENCE_REQUIRED: "The candidate, verification, rollback, or runtime evidence required before release is incomplete.",
  };
  const dictionary = language === "zh" ? zh : en;
  const rendered = blockers.map((value) => dictionary[value]).filter(Boolean);
  if (rendered.length > 0) return unique(rendered).join(language === "zh" ? "；" : " ");
  return language === "zh"
    ? "内部证据之间仍有不一致，Codex 会先修复再继续。"
    : "Internal evidence is still inconsistent; Codex must repair it before continuing.";
}
