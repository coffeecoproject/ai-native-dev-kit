const PROJECT_SETUP_ACTIONS = new Set([
  "RUN_PROJECT_ONBOARDING",
  "RUN_PLATFORM_BASELINE_SETUP",
  "RUN_INDUSTRIAL_BASELINE_SETUP",
]);

const PROJECT_SETUP_ACTIONS_BY_OPERATION = new Map([
  ["CONTINUE_TASK", PROJECT_SETUP_ACTIONS],
  ["RESUME_TASK", PROJECT_SETUP_ACTIONS],
  ["FINISH_TASK", PROJECT_SETUP_ACTIONS],
]);

export function projectSetupActionFor(context) {
  const allowedActions = PROJECT_SETUP_ACTIONS_BY_OPERATION.get(context.operation);
  if (!allowedActions) return null;
  if (context.baselineSetupAction) return context.baselineSetupAction;
  if (!allowedActions.has(context.workflowNextAction)) return null;
  return context.projectEntryOperationBlocked || context.behavioralAdoptionState !== "VERIFIED_ACTIVE"
    ? context.workflowNextAction
    : null;
}

export function operatingStateFor(context) {
  if (!context.intent) return "NEEDS_GOAL";
  if (context.sourceFailure) return "BLOCKED_BY_SOURCE_FAILURE";
  if (context.projectEntryTrustBlocked) return "NEEDS_PROJECT_ENTRY_REPAIR";
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

export function workQueueStateFor(context) {
  const requestedTaskRef = context.requestedTaskRef;
  const intent = context.intent;
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

export function clearlyDifferentTaskIntent(currentIntent, currentTask) {
  const request = String(currentIntent || "").trim();
  const title = String(currentTask?.title || "").trim();
  if (!request || !title || /^(?:current\s+)?test\s+task$/i.test(title)) return false;
  if (/(?:继续|接着|完成当前|这个任务|刚才|恢复).{0,12}(?:任务|工作|处理)?|\b(?:continue|resume|finish)\b.{0,24}\b(?:current|this|previous)?\s*(?:task|work)?\b/i.test(request)) return false;
  const requestTerms = meaningfulIntentTerms(request);
  const taskTerms = meaningfulIntentTerms(`${title} ${currentTask?.taskRef || ""}`);
  if (requestTerms.size < 1 || taskTerms.size < 1) return false;
  return ![...requestTerms].some((term) => taskTerms.has(term));
}

export function meaningfulIntentTerms(value) {
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

export function completionMatchesCurrentTask(context) {
  const reports = Array.isArray(context.completionEvidence?.reports) ? context.completionEvidence.reports : [];
  if (reports.length !== 1) return false;
  const expected = context.effectiveTaskRef || "";
  if (!expected || reports[0].taskRef !== expected) return false;
  const expectedIntentDigest = context.canonicalTaskIdentity?.intentDigest || "";
  if (!expectedIntentDigest || reports[0].intentDigest !== expectedIntentDigest) return false;
  return reports[0].completionState === "COMPLETION_EVIDENCE_READY"
    && reports[0].canClaimComplete === "Yes";
}

export function closureMatchesCurrentTask(context) {
  const decision = context.closure?.closureDecision;
  if (!decision || decision.decision !== "DONE" || decision.canCountAsDone !== "Yes") return false;
  const expectedTaskRef = context.effectiveTaskRef || "";
  const expectedIntentDigest = context.canonicalTaskIdentity?.intentDigest || "";
  return Boolean(expectedTaskRef && expectedIntentDigest)
    && decision.taskRef === expectedTaskRef
    && decision.intentDigest === expectedIntentDigest;
}

export function lifecyclePhaseFor(operation) {
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
