import {
  insertSectionBefore,
  refLine,
  sectionRange,
  setSection,
  setTitle,
} from "../references.mjs";

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}

const allowedGoalModes = new Set([
  "DISCUSS_ONLY",
  "ADOPT_PROJECT",
  "DEFINE_WORK",
  "IMPLEMENT_TASK",
  "REVIEW_TASK",
  "REPAIR_TASK",
  "BASELINE_DECISION",
  "HANDOFF_OR_REPORT",
]);

function normalizedGoalMode(value) {
  const mode = String(value || "DEFINE_WORK").trim().toUpperCase().replace(/-/g, "_");
  if (!allowedGoalModes.has(mode)) fail(`invalid goal mode: ${value}`);
  return mode;
}

function fillGoalCard(content, context) {
  const goalMode = normalizedGoalMode(context.goalMode);
  let output = setTitle(content, `# Goal Card: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Decision Summary",
    [
      `Conclusion: IntentOS routes ${context.title} through ${goalMode}.`,
      "",
      `Codex-selected route: ${goalMode}`,
      "",
      "Can AI continue now: limited",
      "",
      "Permitted input needed: NO_USER_ACTION unless project evidence proves a missing business fact, exact real-world consent, or external fact.",
      "",
      "Reason: Codex owns the technical route and must satisfy its internal gates before execution.",
      "",
      "What happens if you do nothing: no external effect is executed.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      `${context.title} is routed through ${goalMode}. This card selects the workflow path; it is not implementation approval.`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Goal",
    [
      `Goal: ${context.title}`,
      "",
      context.taskRef ? `Source: \`${context.taskRef}\`` : "Source: Human conversation.",
      "",
      "Non-goals: Do not implement, approve risk, approve release, or bypass required artifacts from this card alone.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Goal Mode",
    [
      `Selected: ${goalMode}`,
      "",
      "Why: Select the smallest safe workflow route before creating artifacts, implementing, reviewing, repairing, deciding, or reporting.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Project State",
    [
      "Project state:",
      "",
      "Workflow state:",
      "",
      "Adoption mode:",
      "",
      "Current `workflow-next` result:",
      "",
      "```text",
      "NEXT_ACTION:",
      "CAN_WRITE_WORKFLOW_ASSETS:",
      "MUST_STOP_FOR_HUMAN:",
      "```",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Risk And Level",
    [
      `Task level: ${context.level || "L1"}`,
      "",
      "Baseline level: BL0_LIGHTWEIGHT / BL1_STANDARD / BL2_INDUSTRIAL / not selected",
      "",
      "Risk reason:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Engineering Baseline Touch",
    [
      "Does this goal touch project-wide engineering decisions: Yes / No",
      "",
      "If yes, related decision area:",
      "",
      "- structure / module boundary",
      "- DTO / schema / domain boundary",
      "- enum / string / lookup / state-machine",
      "- API contract / generated type",
      "- permission / migration / dependency / cross-module state",
      "",
      "Engineering baseline status:",
      "",
      "Decision Brief needed: Yes / No",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Required Artifacts",
    [
      "| Artifact | Required | Path / Status | Reason |",
      "|---|---|---|---|",
      `| Request | ${goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.requestRef ? `\`${context.requestRef}\`` : ""} |  |`,
      `| Preflight | ${goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.preflightRef ? `\`${context.preflightRef}\`` : ""} |  |`,
      `| Spec | ${goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.specRef ? `\`${context.specRef}\`` : ""} |  |`,
      `| Eval | ${goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.evalRef ? `\`${context.evalRef}\`` : ""} |  |`,
      `| Task | ${goalMode === "IMPLEMENT_TASK" || goalMode === "DEFINE_WORK" ? "Yes" : "No"} | ${context.taskRef ? `\`${context.taskRef}\`` : ""} |  |`,
      `| Review Packet | ${goalMode === "REVIEW_TASK" || (context.level || "").match(/^L[23]$/) ? "Yes" : "No"} | ${context.reviewPacketRef ? `\`${context.reviewPacketRef}\`` : ""} |  |`,
      `| Review Loop Report | ${goalMode === "REPAIR_TASK" || (context.level || "").match(/^L[23]$/) ? "Yes" : "No"} | ${context.reviewLoopReportRef ? `\`${context.reviewLoopReportRef}\`` : ""} |  |`,
      `| Decision Brief | ${goalMode === "BASELINE_DECISION" ? "Yes" : "No"} |  |  |`,
      `| Final Report / Handoff | ${goalMode === "HANDOFF_OR_REPORT" ? "Yes" : "No"} | ${context.finalReportRef ? `\`${context.finalReportRef}\`` : ""} |  |`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Allowed Actions",
    [
      "- Read project and workflow files needed to route the goal.",
      "- Create or update only the artifacts listed as required after the selected mode permits writes.",
      "- Run non-destructive local checks referenced by the selected route.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Forbidden Actions",
    [
      "- Do not treat this Goal Card as approval to implement.",
      "- Do not bypass request, preflight, spec, eval, task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.",
      "- Do not widen business scope without evidence, and do not change architecture, dependencies, migrations, permissions, production configuration, release, or rollback until applicable technical gates and the permitted user-input class are satisfied.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Human Decisions Needed",
    [
      "Compatibility heading: list only permitted user-input classes; technical choices remain Codex-owned.",
      "",
      "| Input class / blocker | Source | Needed Before | Current Status |",
      "|---|---|---|---|",
      "| NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED | project evidence / user / external authority | dependent action | Pending / Not needed |",
    ].join("\n"),
  );
  output = setSection(output, "Next Safe Step", "Next action:");
  output = setSection(
    output,
    "Technical Details",
    [
      "Related files:",
      "",
      context.taskRef ? `- \`${context.taskRef}\`` : "- ",
      context.specRef ? `- \`${context.specRef}\`` : "- ",
      context.evalRef ? `- \`${context.evalRef}\`` : "- ",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
    ].join("\n"),
  );
  return output;
}

const allowedSubagentModes = new Set([
  "READ_ONLY_RESEARCH",
  "PLAN_THEN_BUILD",
  "REVIEW_LOOP",
  "AUTO_FIX_REPAIR",
  "REPORTING",
]);

function normalizedSubagentMode(value) {
  const mode = String(value || "READ_ONLY_RESEARCH").trim().toUpperCase().replace(/-/g, "_");
  if (!allowedSubagentModes.has(mode)) fail(`invalid subagent mode: ${value}`);
  return mode;
}

function fillSubagentRunPlan(content, context) {
  const subagentMode = normalizedSubagentMode(context.subagentMode);
  let output = setTitle(content, `# Subagent Run Plan: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      `${context.title} helper-agent run is planned. Subagents must be closed or skipped before final response.`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Goal",
    [
      `Goal: ${context.title}`,
      "",
      context.taskRef ? `Related task: \`${context.taskRef}\`` : "Related task: not selected yet",
      "",
      context.specRef ? `Related spec: \`${context.specRef}\`` : "Related spec:",
      "",
      context.evalRef ? `Related eval: \`${context.evalRef}\`` : "Related eval:",
      "",
      "Non-goals: Do not use helper agents as approval, release authority, risk acceptance, or hidden background execution.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Orchestration Mode",
    [
      `Selected: ${subagentMode}`,
      "",
      "Why: Use the smallest helper-agent pattern needed for the current goal. Main thread remains the owner.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Role Roster",
    [
      "| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |",
      "|---|---|---|---|---|---|---|",
      "| A1 | Goal Planner | READ_ONLY | SKIPPED | none | no helper needed yet | No subagent launched; plan is draft |",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Writer Control",
    [
      "Many readers, one writer: Yes",
      "",
      "Current writer: main thread",
      "",
      "Single active writer: Yes",
      "",
      "Disjoint write ownership used: No",
      "",
      "Human-approved owner / expiry if disjoint ownership is used:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Lifecycle Closure",
    [
      "All subagents closed: Yes",
      "",
      "Closure required before final response: Yes",
      "",
      "No background or standing agents: Yes",
      "",
      "No subagent left occupying a slot after handoff: Yes",
      "",
      "Closure notes: No subagent is running. If a subagent is launched, update the roster to CLOSED or SKIPPED with evidence before final response.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Dispatch Hygiene",
    [
      "Before dispatch checked: Yes",
      "",
      "Idle subagents recovered: N/A",
      "",
      "Completed subagents closed: N/A",
      "",
      "Unused planned subagents skipped: Yes",
      "",
      "Stale task subagents closed or skipped: Yes",
      "",
      "Task drift checked: Yes",
      "",
      "Active writer count: 0",
      "",
      "Dispatch allowed: Yes",
      "",
      "Dispatch block reason: N/A",
      "",
      "Recovery notes: No helper is currently running. If the user switches tasks, create or update a run plan before dispatch.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Allowed Actions",
    [
      "- Use read-only helper agents to inspect files, summarize findings, or review artifacts.",
      "- Use at most one writer at a time, owned by the main thread unless a human-approved disjoint owner and expiry are recorded.",
      "- Close each subagent immediately after its handoff is consumed.",
      "- Run `node scripts/check-subagent-orchestration.mjs .` after the plan is closed.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Forbidden Actions",
    [
      "- Do not leave subagents running after handoff.",
      "- Do not send a final response while RUNNING agents exist.",
      "- Do not keep standby subagents open.",
      "- Do not run multiple active writers.",
      "- Do not let reviewer agents edit files.",
      "- Do not use subagents to resolve NEEDS_HUMAN_DECISION items.",
      "- Do not create persistent monitors, automations, hooks, or external GPT/API reviewer calls from this plan.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Handoff / Findings",
    [
      "| Agent ID | Handoff Summary | Findings / Output Ref | Main Thread Decision |",
      "|---|---|---|---|",
      "| A1 | No helper launched yet | none | no action |",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Human Decisions Needed",
    [
      "| Decision | Owner | Needed Before | Current Status |",
      "|---|---|---|---|",
      "| Approve any scope, risk, architecture, dependency, migration, production config, release, or automation change | human | execution | Not needed yet |",
    ].join("\n"),
  );
  output = setSection(output, "Next Safe Step", "Next action: Launch only the minimum needed helper agent, then close it after handoff.");
  output = setSection(
    output,
    "Technical Details",
    [
      "Related files:",
      "",
      context.taskRef ? `- \`${context.taskRef}\`` : "- ",
      context.specRef ? `- \`${context.specRef}\`` : "- ",
      context.evalRef ? `- \`${context.evalRef}\`` : "- ",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
    ].join("\n"),
  );
  return output;
}


export { fillGoalCard, fillSubagentRunPlan, normalizedGoalMode, normalizedSubagentMode };
