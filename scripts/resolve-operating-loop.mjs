#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import {
  entryAllowsOperation,
  operationFor,
  projectEntryFor,
  readProjectEntryOrigin,
  requiresActiveIntentOSOperation,
  statusRequestRequiresCurrentTask,
} from "./operating-loop/classification.mjs";
import { buildEvidenceTrace, buildOperatingDecision } from "./operating-loop/decision.mjs";
import { createSourceExecution, operatingExitCode, toSourceTrace } from "./operating-loop/source-execution.mjs";
import { addOperationSources, notApplicablePublicTaskRoute } from "./operating-loop/source-orchestration.mjs";
import { buildProjectIdentityProjection } from "./operating-loop/identity.mjs";
import {
  conclusionFor,
  humanDecisionSummaryFor,
  plainActionFor,
  plainBlockerExplanationFor,
  plainStateFor,
  printHuman,
  projectIdentitySummaryFor,
} from "./operating-loop/presentation.mjs";
import { arrayValue, sha256, unique } from "./operating-loop/shared.mjs";
import { lifecyclePhaseFor, operatingStateFor } from "./operating-loop/state.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  requiresOperatingBaselineConsumption,
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
const { runFinalDecision, runGateSource, runSource } = createSourceExecution(kitRoot);
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
else printHuman(state, { intent, outputLanguage });
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
  let operation = forcedOperation || operationFor(intent, projectEntry, projectRoot);
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
        args,
        intent,
        projectRoot,
        requestedTaskRef,
        runFinalDecision,
        runGateSource,
        runSource,
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
    intent,
    requestedTaskRef,
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
    intent,
    projectRoot,
    outputLanguage,
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
