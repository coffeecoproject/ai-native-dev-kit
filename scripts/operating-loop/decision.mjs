import { buildSoloOperatingModel } from "../lib/solo-operating-model.mjs";
import { plainActionFor } from "./presentation.mjs";
import { arrayValue, humanDecisionTexts, sha256, unique } from "./shared.mjs";

export function buildEvidenceTrace(sources, operation, taskGovernance, planningClosure, deliveryStatus, closure, release, adoption) {
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
export function buildOperatingDecision(context) {
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
    intent: context.intent,
    operation: context.operation,
    actionCode: selected.actionCode,
    sourceFailure: context.sourceFailure,
    language: context.outputLanguage,
    selectedProfiles: context.selectedProfiles,
  });
  const humanDecision = humanDecisionFor(selected.actionCode, decisionResponsibility, context.outputLanguage);
  const digestPayload = {
    contractVersion: "1.99.0",
    intentDigest: sha256(context.intent),
    projectRootDigest: sha256(context.projectRoot),
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
    plainAction: plainActionFor(selected.actionCode, context.outputLanguage),
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

function humanDecisionFor(actionCode, responsibility, outputLanguage) {
  const zh = outputLanguage === "zh";
  return {
    required: responsibility.userActionRequiredNow === "Yes",
    prompt: responsibility.publicPrompt || (zh ? "不需要你做技术判断。" : "No technical decision is required from you."),
  };
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
