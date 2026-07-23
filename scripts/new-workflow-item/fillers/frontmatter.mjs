import { normalizedGoalMode, normalizedSubagentMode } from "./routing.mjs";

export function frontmatterFor(type, context) {
  const common = {
    schema_version: "1.0",
    artifact_type: type,
    number: context.number,
    slug: context.slug,
    title: context.title,
    status: "draft",
    created_at: context.date,
    intentos_version: context.intentOSVersion,
  };
  if (type === "request") {
    return { ...common, priority: context.priority || "P1", task_level: context.level || "L1" };
  }
  if (type === "preflight") {
    return { ...common, request: context.requestRef, task_level: context.level || "L1" };
  }
  if (type === "spec") {
    return { ...common, request: context.requestRef, preflight: context.preflightRef };
  }
  if (type === "eval") {
    return { ...common, spec: context.specRef };
  }
  if (type === "task") {
    return { ...common, spec: context.specRef, eval: context.evalRef, task_level: context.level || "L1" };
  }
  if (type === "review-loop-report") {
    return {
      ...common,
      task: context.taskRef,
      spec: context.specRef,
      eval: context.evalRef,
      task_level: context.level || "L1",
      status: "open",
    };
  }
  if (type === "goal-card") {
    return {
      ...common,
      goal_mode: normalizedGoalMode(context.goalMode),
      task_level: context.level || "L1",
    };
  }
  if (type === "subagent-run-plan") {
    return {
      ...common,
      subagent_mode: normalizedSubagentMode(context.subagentMode),
    };
  }
  if (type === "active-work-thread" || type === "guided-decision-summary") {
    return {
      ...common,
      task: context.taskRef,
      decision_level: type === "guided-decision-summary" ? "D1" : undefined,
    };
  }
  if (type === "change-boundary-report" || type === "baseline-state-report" || type === "change-impact-coverage-report") {
    return {
      ...common,
      task: context.taskRef,
      status: "draft",
    };
  }
  if (type === "baseline-pack-selection-report") {
    return {
      ...common,
      baseline_decision: "PENDING",
      status: "draft",
    };
  }
  if (type === "approval-record") {
    return {
      ...common,
      approval_status: "DRAFT",
      status: "draft",
    };
  }
  return null;
}
