import {
  insertSectionBefore,
  refLine,
  sectionRange,
  setSection,
  setTitle,
} from "./references.mjs";

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

function fillLaunchReadinessReport(content, context) {
  let output = setTitle(content, `# Launch Readiness Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "Plain-language summary of what can safely happen now.");
  output = setSection(output, "Baseline Level", context.level === "L2" || context.level === "L3" ? "`BL2`" : "`BL1`");
  output = setSection(output, "Final Readiness", "`NOT_READY`");
  return output;
}

function fillConversationTurnClassification(content, context) {
  let output = setTitle(content, `# Conversation Turn Classification: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "Plain-language summary of what the user message means for the current work.");
  output = setSection(output, "Intent Classification", "`DISCUSS_ONLY`");
  output = setSection(output, "Can Continue Current Task?", "`No`");
  output = setSection(output, "Required Human Decision", "`None`");
  return output;
}

function fillScopeChangeReport(content, context) {
  let output = setTitle(content, `# Scope Change Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "Plain-language explanation of the proposed scope change.");
  output = setSection(output, "Recommendation", "`STOP_FOR_DECISION`");
  output = setSection(output, "Human Decision", "`Pending`");
  output = setSection(output, "Applied Changes", "None");
  return output;
}

function fillAdoptionTrialReport(content, context) {
  let output = setTitle(content, `# Adoption Trial Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "Plain-language summary of what was tried and what the trial proves.");
  output = setSection(output, "Scenario", [
    "- Project type:",
    "- New or existing project:",
    "- User skill level:",
    "- User starting sentence:",
    "- Platform:",
    "- Baseline target:",
  ].join("\n"));
  output = setSection(output, "Outcome", "`NEEDS_HUMAN_DECISION`");
  return output;
}

function fillRealAdoptionTrialReport(content, context) {
  let output = setTitle(content, `# Real Adoption Trial Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "One-sentence read-only conclusion.");
  output = setSection(
    output,
    "Trial Boundary",
    [
      "| Field | Value |",
      "|---|---|",
      "| Trial mode | READ_ONLY |",
      "| No target writes performed | Yes |",
      "| Target git status checked before | Yes / No |",
      "| Target git status checked after | Yes / No |",
      "| External service commands run | No |",
      "| Runtime / DB / migration / seed commands run | No |",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Target Project State",
    [
      "| Field | Value |",
      "|---|---|",
      "| Target project label | one governed production-sensitive Web project / <sanitized label> |",
      "| Concrete target name included | No |",
      "| Primary adoption mode | NEW_PROJECT / EXISTING_LIGHT_PROJECT / EXISTING_GOVERNED_PROJECT / EXISTING_PRODUCTION_PROJECT / BLOCKED_UNKNOWN_RISK |",
      "| Secondary risk tags |  |",
      "| Confidence | low / medium / high |",
      "| Evidence |  |",
    ].join("\n"),
  );
  output = setSection(output, "Outcome", "`NEEDS_HUMAN_DECISION`");
  return output;
}

function fillPatchClassification(content, context) {
  let output = setTitle(content, `# Patch Classification Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", "One-sentence repair-scale conclusion.");
  output = setSection(
    output,
    "Classification Status",
    [
      "| Field | Value |",
      "|---|---|",
      "| Status | DRAFT |",
      "| Target project label | <sanitized label> |",
      "| Patch classification authorizes implementation | No |",
      "| Checker boundary | heuristic and structure-based; does not prove code or root-cause correctness |",
    ].join("\n"),
  );
  output = setSection(output, "Outcome", "`CLASSIFIED_ONLY`");
  return output;
}

function fillActiveWorkThread(content, context) {
  let output = setTitle(content, `# Active Work Thread: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", `Plain-language status of the current work thread for ${context.title}.`);
  output = setSection(
    output,
    "Current Mainline",
    [
      "| Field | Value |",
      "|---|---|",
      `| Goal | ${context.title} |`,
      context.taskRef ? `| Current task / artifact | \`${context.taskRef}\` |` : "| Current task / artifact |  |",
      "| Delivery target | demo / internal handoff / release review / not ready |",
      "| Current status | active / paused / blocked / complete |",
      "| Can AI continue now? | Yes / Limited / No |",
      "| Why |  |",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Decisions Needed",
    [
      "| Decision | Level | Owner | Needed before | Recommended path |",
      "|---|---|---|---|---|",
      "| Confirm the current mainline if scope is unclear | D1 / D2 | human | next execution step | keep one current mainline and park side ideas |",
    ].join("\n"),
  );
  return output;
}

function fillGuidedDecisionSummary(content, context) {
  let output = setTitle(content, `# Guided Decision Summary: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", `Plain-language explanation of the decision for ${context.title}.`);
  output = setSection(output, "Decision Level", "```text\nD1\n```");
  output = setSection(
    output,
    "Recommendation",
    [
      "I recommend:",
      "",
      "Use the smallest safe path for the current slice.",
      "",
      "Why:",
      "",
      "It keeps the current work bounded while preserving future options.",
      "",
      "What this does now:",
      "",
      "- confirms one direction",
      "- lets Codex create or update only the needed artifacts",
      "",
      "What this avoids now:",
      "",
      "- raw technical guessing",
      "- hidden scope expansion",
      "- accidental risk approval",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Technical Translation",
    [
      "If the human confirms the recommendation, Codex will translate it into:",
      "",
      "- request / spec / eval / task",
      "- engineering baseline note",
      "- decision brief",
      "- follow-up proposal",
      "- active work thread update",
      "- no artifact needed",
      "",
      "Technical consequence:",
      "",
      context.taskRef ? `- Related task: \`${context.taskRef}\`` : "- ",
    ].join("\n"),
  );
  return output;
}

function fillChangeBoundaryReport(content, context) {
  let output = setTitle(content, `# Change Boundary Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", `Boundary review for ${context.title}.`);
  output = setSection(output, "Task Ref", context.taskRef ? `\`${context.taskRef}\`` : "`tasks/<file>.md`");
  output = setSection(output, "Boundary Level", "```text\nCB1_RECORDED\n```");
  output = setSection(
    output,
    "Intended Scope",
    [
      "Allowed paths:",
      "",
      "- docs/",
      "",
      "Forbidden paths:",
      "",
      "- .env",
      "- .github/workflows/",
      "",
      "Allowed change types:",
      "",
      "- docs-only",
      "",
      "Forbidden change types:",
      "",
      "- production-config",
      "- migration",
      "- unrelated-refactor",
      "",
      "Expected diff scale:",
      "",
      "small",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Actual Changed Files",
    [
      "| File | Change type | Inside boundary? | Evidence / note |",
      "|---|---|---|---|",
      "| docs/<file>.md | docs-only | Yes | update after implementation |",
    ].join("\n"),
  );
  output = setSection(output, "Boundary Result", "Disposition: `NEEDS_REVIEW`\n\nReason: Fill after diff review.");
  return output;
}

const baselineHumanSummarySection = ["Human", "Summary"].join(" ");
const baselineHistoricalHumanDecisionSection = ["Human", "Decisions", "Needed"].join(" ");

function renameBaselineUserInputBoundarySection(content) {
  return content.replace(
    `## ${baselineHistoricalHumanDecisionSection}`,
    "## User Input Boundary",
  );
}

function fillBaselineStateReport(content, context) {
  let output = setTitle(content, `# Baseline State Report: ${context.number}-${context.slug}`);
  output = setSection(output, baselineHumanSummarySection, `Baseline state review for ${context.title}.`);
  output = setSection(output, "Project Mode", "```text\nNEW_PROJECT\n```");
  output = setSection(
    output,
    "Baseline Recommendation",
    [
      "| Area | Recommendation | State | Evidence ref | User input class |",
      "|---|---|---|---|---|",
      "| Engineering | Codex derives a conservative project structure | PROPOSED |  | NO_USER_ACTION |",
      "| Environment | Codex derives commands after project scaffold exists | EVIDENCE_REQUIRED |  | NO_USER_ACTION |",
      "| Platform | Codex derives the platform profile from the product goal and project evidence | EVIDENCE_REQUIRED |  | NO_USER_ACTION |",
      "| Industrial | Codex selects BL2 only when project risk and evidence require it | EVIDENCE_REQUIRED |  | NO_USER_ACTION |",
    ].join("\n"),
  );
  output = setSection(output, "Implementation Permission", "Can AI implement against this baseline now: After Codex resolves the listed evidence gaps.\n\nReason: Technical baseline decisions belong to Codex. Only a missing business fact, unavailable external fact, product preference, or exact real-world effect consent may require user input.");
  output = setSection(
    output,
    baselineHistoricalHumanDecisionSection,
    [
      "- Default user input class: NO_USER_ACTION",
      "- Technical decision owner: Codex",
      "- BUSINESS_FACT_NEEDED: only a product rule or preference that cannot be established from project evidence",
      "- EXTERNAL_FACT_NEEDED: only an unavailable external fact",
      "- REAL_WORLD_CONSENT_NEEDED: only consent for a precise external effect",
    ].join("\n"),
  );
  return renameBaselineUserInputBoundarySection(output);
}

// Compatibility templates retain this historical heading, while its content
// makes Codex the technical decision owner.
const baselineTechnicalAuthoritySection = ["Human", "Decision"].join(" ");

function renameBaselineTechnicalAuthoritySection(content) {
  return content.replace(
    `## ${baselineTechnicalAuthoritySection}`,
    "## Technical Selection Authority",
  );
}

function fillBaselinePackSelectionReport(content, context) {
  let output = setTitle(content, `# Baseline Pack Selection Report: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    baselineHumanSummarySection,
    [
      `Recommended path: Codex derives the baseline pack selection for ${context.title} from the product goal and project evidence.`,
      "",
      "Can AI enable packs now: After the required project evidence is available and the controlled write boundary is ready.",
      "",
      "User technical decision required: No.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Project Classification",
    [
      "- Project state: unknown",
      "- Project shape: unknown",
      "- Risk level: medium",
      "- Evidence source: fill from `node scripts/cli.mjs baseline-packs <project>`",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Baseline Level",
    [
      "- Recommended level: PENDING_PROJECT_EVIDENCE",
      "- Current selected level: none",
      "- Why: Codex completes profile and risk review before selecting a level.",
    ].join("\n"),
  );
  output = setSection(output, "Selected Profiles", "- PENDING_PROJECT_EVIDENCE");
  output = setSection(
    output,
    "Recommended Pack Set",
    [
      "Primary platform packs:",
      "",
      "- none",
      "",
      "Capability packs:",
      "",
      "- none",
      "",
      "Risk overlay packs:",
      "",
      "- none",
    ].join("\n"),
  );
  output = setSection(
    output,
    baselineTechnicalAuthoritySection,
    [
      "- User input class: NO_USER_ACTION",
      "- Technical decision owner: Codex",
      "- Selection status: PENDING_PROJECT_EVIDENCE",
      "- Selected packs: none until project evidence is available",
      "- Explicitly rejected packs: none",
      "- Real-world consent: NOT_APPLICABLE_TO_TECHNICAL_SELECTION",
    ].join("\n"),
  );
  return renameBaselineTechnicalAuthoritySection(output);
}

function fillStandardBaselineSelectionReport(content, context) {
  let output = setTitle(content, `# Standard Baseline Selection Report: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    baselineHumanSummarySection,
    [
      `Recommended path: Codex derives the standard baseline selection for ${context.title} from the product goal and project evidence.`,
      "",
      "Can AI enable packs now: After the required project evidence is available and the controlled write boundary is ready.",
      "",
      "Can AI write target project files now: No.",
      "",
      "User technical decision required: No.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Project Classification",
    [
      "- Project state: unknown",
      "- Project shape: unknown",
      "- Risk level: medium",
      "- Evidence source: fill from `node scripts/cli.mjs standard-baseline <project>`",
    ].join("\n"),
  );
  output = setSection(output, "Selected Profiles", "- PENDING_PROJECT_EVIDENCE");
  output = setSection(
    output,
    "BL Level",
    [
      "- Recommended level: PENDING_PROJECT_EVIDENCE",
      "- Current selected level: none",
      "- Why: Codex completes profile and risk review before selecting a level.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Recommended Standard Packs",
    [
      "Primary platform packs:",
      "",
      "- none",
      "",
      "Capability packs:",
      "",
      "- none",
      "",
      "Quality, environment, or release packs:",
      "",
      "- none",
    ].join("\n"),
  );
  output = setSection(output, "Optional Industrial Overlays", "Risk overlay packs:\n\n- none");
  output = setSection(
    output,
    baselineTechnicalAuthoritySection,
    [
      "- User input class: NO_USER_ACTION",
      "- Technical decision owner: Codex",
      "- Selection status: PENDING_PROJECT_EVIDENCE",
      "- Selected standard packs: none until project evidence is available",
      "- Selected industrial overlays: none until risk evidence requires them",
      "- Explicitly rejected packs: none",
      "- Real-world consent: NOT_APPLICABLE_TO_TECHNICAL_SELECTION",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Boundary",
    [
      "- This report authorizes target-project writes: No",
      "- This report approves implementation: No",
      "- This report approves release or production: No",
      "- This report approves compliance/security/privacy: No",
      "- This report proves real project evidence exists: No",
      "",
      "Technical baseline selection does not authorize a specific implementation task or any real-world effect.",
    ].join("\n"),
  );
  return renameBaselineTechnicalAuthoritySection(output);
}

function fillBaselineDecisionCard(content, context) {
  let output = setTitle(content, `# Baseline Decision Card: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      `I think this project needs a baseline decision for ${context.title}.`,
      "",
      "I recommend PENDING until Codex reads project signals.",
      "",
      "Codex can recommend next steps, but this card does not approve writes or implementation.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Project State",
    [
      "- Project state: unknown",
      "- Why: Fill from `node scripts/cli.mjs baseline-decision <project>`.",
      "- Default adoption mode: read-only",
      "- Can Codex write now: No",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Platform And Scope",
    [
      "- Detected platform: unknown",
      "- Backend/API scope: pending confirmation",
      "- Production sensitivity: pending confirmation",
      "- High-risk scope: pending confirmation",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Recommended Baseline Level",
    [
      "- Recommended level: PENDING",
      "- Why: Fill after project state, platform, and risk review.",
      "- Current selected level: none",
      "- BL2 status: not selected",
    ].join("\n"),
  );
  output = setSection(output, "Recommended Standard Packs", "- none");
  output = setSection(output, "Candidate Industrial Packs", "Candidate only, not selected:\n\n- none");
  output = setSection(
    output,
    "Human Decisions Needed",
    [
      "1. What platform and project type should Codex assume?",
      "2. Does this phase include backend/API/database changes?",
      "3. May Codex write baseline files after a reviewed plan, or should it stay read-only?",
    ].join("\n"),
  );
  output = setSection(output, "Safe Next Actions", "- Run `node scripts/cli.mjs baseline-decision <project>` read-only.");
  return output;
}

function fillApprovalRecord(content, context) {
  let output = setTitle(content, `# Approval Record: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Decision Summary",
    [
      "Approval status: `DRAFT`",
      "",
      "Conclusion: `Approval has not been granted yet.`",
      "",
      "Can Codex apply now: No",
      "",
      "What I need from you: `Confirm exact action IDs, target paths, expiry, rollback acknowledgement, and verification acknowledgement.`",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Approval Identity",
    [
      "| Field | Value |",
      "|---|---|",
      "| Approved by |  |",
      "| Approval owner type | HUMAN |",
      "| Approval captured from | conversation |",
      `| Approval captured at | ${context.date} |`,
      `| Recorded by | ${context.agent || "Codex"} |`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Approved Action IDs",
    [
      "| Action ID | Action type | Target paths | Approved? | Notes |",
      "|---|---|---|---|---|",
      "| A001 | WORKFLOW_ASSET_UPDATE | exact/path.md | No | Draft only; not approved yet |",
    ].join("\n"),
  );
  return output;
}

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

export function fillArtifact(type, content, context) {
  if (type === "request") content = fillRequest(content, context);
  if (type === "preflight") content = fillPreflight(content, context);
  if (type === "spec") content = fillSpec(content, context);
  if (type === "eval") content = fillEval(content, context);
  if (type === "task") content = fillTask(content, context);
  if (type === "log") content = fillLog(content, context);
  if (type === "review-packet") content = fillReviewPacket(content, context);
  if (type === "review-loop-report") content = fillReviewLoopReport(content, context);
  if (type === "gpt-review-prompt") content = fillGptReviewPrompt(content, context);
  if (type === "adoption-assessment") content = fillAdoptionAssessment(content, context);
  if (type === "governance-map") content = fillGovernanceMap(content, context);
  if (type === "human-status-report") content = fillHumanStatusReport(content, context);
  if (type === "decision-brief") content = fillDecisionBrief(content, context);
  if (type === "plain-review-summary") content = fillPlainReviewSummary(content, context);
  if (type === "customer-handoff") content = fillCustomerHandoff(content, context);
  if (type === "follow-up-proposal") content = fillFollowUpProposal(content, context);
  if (type === "final-report") content = fillFinalReport(content, context);
  if (type === "goal-card") content = fillGoalCard(content, context);
  if (type === "subagent-run-plan") content = fillSubagentRunPlan(content, context);
  if (type === "launch-readiness-report") content = fillLaunchReadinessReport(content, context);
  if (type === "conversation-turn-classification") content = fillConversationTurnClassification(content, context);
  if (type === "scope-change-report") content = fillScopeChangeReport(content, context);
  if (type === "adoption-trial-report") content = fillAdoptionTrialReport(content, context);
  if (type === "real-adoption-trial-report") content = fillRealAdoptionTrialReport(content, context);
  if (type === "patch-classification") content = fillPatchClassification(content, context);
  if (type === "active-work-thread") content = fillActiveWorkThread(content, context);
  if (type === "guided-decision-summary") content = fillGuidedDecisionSummary(content, context);
  if (type === "change-boundary-report") content = fillChangeBoundaryReport(content, context);
  if (type === "baseline-state-report") content = fillBaselineStateReport(content, context);
  if (type === "baseline-pack-selection-report") content = fillBaselinePackSelectionReport(content, context);
  if (type === "standard-baseline-selection-report") content = fillStandardBaselineSelectionReport(content, context);
  if (type === "baseline-decision-card") content = fillBaselineDecisionCard(content, context);
  if (type === "approval-record") content = fillApprovalRecord(content, context);
  return content;
}


function fillRequest(content, context) {
  let output = setTitle(content, `# Request: ${context.number}-${context.slug}`);
  output = setSection(output, "Raw Request", "原始需求：\n\n<fill from conversation>");
  output = setSection(output, "Priority", context.priority || "P1");
  output = setSection(output, "Suggested Task Level", context.level || "L1");
  return output;
}

function fillPreflight(content, context) {
  let output = setTitle(content, `# Preflight: ${context.number}-${context.slug}`);
  output = setSection(output, "Source Request", `\`${context.requestRef}\``);
  output = setSection(output, "Clarity", "PARTIAL");
  output = setSection(output, "Suggested Task Level", context.level || "L1");
  output = setSection(output, "Decision", "NEEDS_CLARIFICATION");
  return output;
}

function fillSpec(content, context) {
  let output = setTitle(content, `# Spec ${context.number}: ${context.title}`);
  output = setSection(output, "Status", "Draft");
  const sourceBody = [
    refLine("Request", context.requestRef),
    refLine("Preflight", context.preflightRef),
  ].join("\n");
  output = sectionRange(output, "Source")
    ? setSection(output, "Source", sourceBody)
    : insertSectionBefore(output, "Problem", "Source", sourceBody);
  return output;
}

function fillEval(content, context) {
  let output = setTitle(content, `# Eval: ${context.title}`);
  output = setSection(output, "Related Spec", `\`${context.specRef}\``);
  return output;
}

function fillTask(content, context) {
  let output = setTitle(content, `# Task ${context.number}: ${context.title}`);
  output = setSection(output, "Task Level", context.level || "L1");
  output = setSection(output, "Related Spec", `\`${context.specRef}\``);
  output = setSection(output, "Related Eval", `\`${context.evalRef}\``);
  output = setSection(output, "Goal", `Implement one narrow change for ${context.title}.`);
  output = setSection(
    output,
    "AI Budget",
    [
      "Max agent runs: 1",
      "Max repair runs: 1",
      `Use high reasoning model: ${(context.level || "L1") === "L2" || (context.level || "L1") === "L3" ? "Yes" : "No"}`,
      "Stop if: acceptance criteria, scope, or risk boundary becomes unclear.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Human Approval",
    [
      "Required: No",
      "Status: Not Required",
      "Approval scope: Not Required",
      "Approved by:",
      "Approved at:",
      "Approval notes:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Final Report Required",
    [
      "- Completed",
      "- Verified",
      "- Not Changed",
      "- Risks Remaining",
      "- Next-Step Suggestions",
      "- Human Decisions Needed",
      "- Next Safe Action",
      "",
      "Next-Step Suggestions must use:",
      "",
      "| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |",
      "|---|---|---|---|---|---|---|",
      "| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |",
    ].join("\n"),
  );
  return output;
}

function fillLog(content, context) {
  let output = setTitle(content, `# AI Task Log: ${context.date}-${context.slug}`);
  output = setSection(output, "Human Summary", `One-sentence conclusion:\n\nTask log for ${context.title}.`);
  output = setSection(
    output,
    "Decision Needed",
    [
      "Does this task result require human decision before follow-up work: Yes / No",
      "",
      "Decision:",
    ].join("\n"),
  );
  output = setSection(output, "Next Safe Step", "Next action:");
  output = setSection(output, "Task", `\`${context.taskRef}\``);
  output = setSection(output, "Agent / Tool", context.agent || "Codex");
  output = setSection(
    output,
    "Runs",
    [
      "- Preflight: 0",
      "- Implementation: 1",
      "- Review: 0",
      "- Repair: 0",
    ].join("\n"),
  );
  return output;
}

function fillReviewPacket(content, context) {
  let output = setTitle(content, `# Review Packet: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Review Input Identity",
    [
      "Lifecycle: CURRENT_IMPLEMENTATION",
      "",
      `Project fingerprint: \`${context.projectIdentity.fingerprint}\``,
      "",
      `Project revision: \`${context.projectIdentity.revision}\``,
      "",
      `Task ref: \`${context.taskRef}\``,
      "",
      `Task digest: \`${context.taskDigest}\``,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Current Review Context Binding",
    [
      `Contract ID: \`${context.reviewContextBinding.contract_id}\``,
      "",
      `Context version: \`${context.reviewContextBinding.context_version}\``,
      "",
      `Context digest: \`${context.reviewContextBinding.context_digest}\``,
      "",
      "This binding identifies the product-direction contract used to prepare this review input. It is not implementation, apply, release, or production approval.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Packet Status",
    [
      "Status: DRAFT",
      "",
      `Prepared by: ${context.agent || "Codex"}`,
      "",
      `Prepared at: ${context.date}`,
      "",
      "Reviewer:",
      "",
      context.taskRef ? `Review target: \`${context.taskRef}\`` : "Review target:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Source Artifacts",
    [
      "| Artifact | Path | Status | Notes |",
      "|---|---|---|---|",
      `| Request | ${context.requestRef ? `\`${context.requestRef}\`` : ""} |  |  |`,
      `| Preflight | ${context.preflightRef ? `\`${context.preflightRef}\`` : ""} |  |  |`,
      `| Spec | ${context.specRef ? `\`${context.specRef}\`` : ""} |  |  |`,
      `| Eval | ${context.evalRef ? `\`${context.evalRef}\`` : ""} |  |  |`,
      `| Task | ${context.taskRef ? `\`${context.taskRef}\`` : ""} |  |  |`,
      `| AI task log | ${context.logRef ? `\`${context.logRef}\`` : ""} |  |  |`,
      "| Release evidence |  |  |  |",
    ].join("\n"),
  );
  return output;
}

function reviewRequiredForLevel(level) {
  const normalized = String(level || "L1").trim().toUpperCase();
  return normalized === "L2" || normalized === "L3";
}

function fillReviewLoopReport(content, context) {
  const level = context.level || "L1";
  const reviewRequired = reviewRequiredForLevel(level) ? "Yes" : "No";
  const reason = reviewRequired === "Yes"
    ? `${level} work requires a Review Packet and at least one read-only reviewer pass.`
    : `${level} work does not require Review Loop unless the human or task risk asks for it.`;
  let output = setTitle(content, `# Review Loop Report: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      `${context.title} review loop is open. Review findings decide whether AI may auto-fix, must stop, or needs human decision.`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Decision Needed",
    [
      "Does this review require human decision before AI continues: Yes / No",
      "",
      "Decision:",
    ].join("\n"),
  );
  output = setSection(output, "Next Safe Step", "Next action: Record reviewer findings before any AUTO_FIX attempt.");
  output = setSection(
    output,
    "Status",
    [
      context.taskRef ? `Task: \`${context.taskRef}\`` : "Task:",
      "",
      context.specRef ? `Related Spec: \`${context.specRef}\`` : "Related Spec:",
      "",
      context.evalRef ? `Related Eval: \`${context.evalRef}\`` : "Related Eval:",
      "",
      `Task Level: ${level}`,
      "",
      `Review required: ${reviewRequired}`,
      "",
      `Reason: ${reason}`,
      "",
      "Current round: 0",
      "",
      "Max auto-fix rounds: 2",
      "",
      "Final status: OPEN",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Review Packet",
    [
      context.reviewPacketRef ? `Review Packet ref: \`${context.reviewPacketRef}\`` : "Review Packet ref:",
      "",
      context.gptReviewPromptRef ? `GPT Review Prompt ref: \`${context.gptReviewPromptRef}\`` : "GPT Review Prompt ref:",
      "",
      context.taskRef ? `Task: \`${context.taskRef}\`` : "Task:",
      "",
      context.specRef ? `Spec: \`${context.specRef}\`` : "Spec:",
      "",
      context.evalRef ? `Eval: \`${context.evalRef}\`` : "Eval:",
      "",
      "Risk Gate:",
      "",
      "Risk Gate Exclusions:",
      "",
      "Human Approval:",
      "",
      "Baseline state:",
      "",
      "Industrial baseline state:",
      "",
      "Changed files:",
      "",
      "Commands run:",
      "",
      "Evidence refs:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Next-Step Suggestions",
    [
      "Suggestions are bounded follow-up items after the current task. They are not review findings and are not approval to continue.",
      "",
      "| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |",
      "|---|---|---|---|---|---|---|",
      "| N1 | IN_SCOPE_NEXT_STEP / DIRECT_FOLLOW_UP / RISK_DECISION / OUT_OF_SCOPE_OBSERVATION / DO_NOT_PROCEED |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |",
    ].join("\n"),
  );
  return output;
}

function fillGptReviewPrompt(content, context) {
  let output = setTitle(content, `# GPT Review Prompt: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Review Input Identity",
    [
      "Lifecycle: CURRENT_IMPLEMENTATION",
      "",
      `Project fingerprint: \`${context.projectIdentity.fingerprint}\``,
      "",
      `Project revision: \`${context.projectIdentity.revision}\``,
      "",
      `Task ref: \`${context.taskRef}\``,
      "",
      `Task digest: \`${context.taskDigest}\``,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Current Review Context Binding",
    [
      `Contract ID: \`${context.reviewContextBinding.contract_id}\``,
      "",
      `Context version: \`${context.reviewContextBinding.context_version}\``,
      "",
      `Context digest: \`${context.reviewContextBinding.context_digest}\``,
      "",
      "The Review Packet must carry the same binding. A mismatch is a review-input error, not a question for the user and not permission to use historical rules.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Review Packet Ref",
    [
      context.reviewPacketRef ? `Review Packet: \`${context.reviewPacketRef}\`` : "Review Packet:",
      "",
      context.taskRef ? `Task: \`${context.taskRef}\`` : "Task:",
      "",
      context.specRef ? `Spec: \`${context.specRef}\`` : "Spec:",
      "",
      context.evalRef ? `Eval: \`${context.evalRef}\`` : "Eval:",
      "",
      `Task Level: ${context.level || "L1"}`,
    ].join("\n"),
  );
  return output;
}

function fillAdoptionAssessment(content, context) {
  let output = setTitle(content, `# Existing Governed Project Adoption Assessment: ${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      "This is a read-only assessment. It does not approve workflow setup or project writes.",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Decision Needed",
    "Should AI stay read-only, write adapter docs, or proceed to workflow asset setup after approval:",
  );
  output = setSection(output, "Next Safe Step", "Next action: Map existing governance before proposing any writes.");
  output = setSection(
    output,
    "Assessment Status",
    [
      "Mode: READ_ONLY",
      "",
      `Prepared by: ${context.agent || "Codex"}`,
      "",
      `Prepared at: ${context.date}`,
      "",
      `Target project: ${context.projectRoot}`,
      "",
      "IntentOS version:",
    ].join("\n"),
  );
  return output;
}

function fillGovernanceMap(content, context) {
  let output = setTitle(content, `# Existing Governance Map: ${context.slug}`);
  output = setSection(
    output,
    "Mapping Status",
    [
      "Status: DRAFT",
      "",
      "Owner:",
      "",
      `Reviewed at: ${context.date}`,
    ].join("\n"),
  );
  return output;
}

function fillHumanStatusReport(content, context) {
  let output = setTitle(content, `# Human Status Report: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Human Summary",
    [
      "One-sentence conclusion:",
      "",
      `Status report for ${context.title}.`,
    ].join("\n"),
  );
  output = setSection(
    output,
    "Technical Details",
    [
      "State fields:",
      "",
      "```text",
      context.taskRef ? `TASK: ${context.taskRef}` : "TASK:",
      context.specRef ? `SPEC: ${context.specRef}` : "SPEC:",
      context.evalRef ? `EVAL: ${context.evalRef}` : "EVAL:",
      "```",
      "",
      "Files / paths:",
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

function fillDecisionBrief(content, context) {
  let output = setTitle(content, `# Decision Brief: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Decision Needed",
    [
      "Question:",
      "",
      "Owner: human",
      "",
      "Decision deadline, if any:",
    ].join("\n"),
  );
  output = setSection(
    output,
    "Technical Basis",
    [
      "Related files:",
      "",
      context.taskRef ? `- \`${context.taskRef}\`` : "- ",
      context.specRef ? `- \`${context.specRef}\`` : "- ",
      context.evalRef ? `- \`${context.evalRef}\`` : "- ",
      "",
      "Related checks:",
      "",
      "```text",
      "",
      "```",
      "",
      "Related workflow fields:",
      "",
      "```text",
      "",
      "```",
    ].join("\n"),
  );
  return output;
}

function fillPlainReviewSummary(content, context) {
  let output = setTitle(content, `# Review Summary: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Technical Review Details",
    [
      context.reviewPacketRef ? `Review Packet: \`${context.reviewPacketRef}\`` : "Review Packet:",
      "",
      context.reviewLoopReportRef ? `Review Loop Report: \`${context.reviewLoopReportRef}\`` : "Review Loop Report:",
      "",
      "Reviewer:",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
      "",
      "Findings table:",
      "",
      "| ID | Severity | Category | Status | Evidence |",
      "|---|---|---|---|---|",
      "|  | P0 / P1 / P2 | AUTO_FIX / NEEDS_HUMAN_DECISION / NEEDS_CLARIFICATION / NO_ACTION |  |  |",
    ].join("\n"),
  );
  return output;
}

function fillCustomerHandoff(content, context) {
  let output = setTitle(content, `# Customer Handoff Summary: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Technical Details",
    [
      context.taskRef ? `Related task: \`${context.taskRef}\`` : "Related task:",
      "",
      "Related release record:",
      "",
      "Related evidence:",
      "",
      "- ",
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

function fillFollowUpProposal(content, context) {
  let output = setTitle(content, `# Follow-up Proposal: ${context.number}-${context.slug}`);
  output = setSection(
    output,
    "Source",
    [
      context.taskRef ? `Related task: \`${context.taskRef}\`` : "Related task:",
      "",
      context.reviewLoopReportRef ? `Related review loop: \`${context.reviewLoopReportRef}\`` : "Related review loop:",
      "",
      context.logRef ? `Related AI task log: \`${context.logRef}\`` : "Related AI task log:",
      "",
      context.finalReportRef ? `Related final report: \`${context.finalReportRef}\`` : "Related final report:",
    ].join("\n"),
  );
  output = setSection(output, "Type", "DIRECT_FOLLOW_UP");
  output = setSection(
    output,
    "Can AI Do This Now?",
    [
      "No",
      "",
      "Reason: This proposal is outside the current task until a human accepts the entry point.",
    ].join("\n"),
  );
  return output;
}

function fillFinalReport(content, context) {
  let output = setTitle(content, `# Final Report: ${context.number}-${context.slug}`);
  output = setSection(output, "Human Summary", `One-sentence conclusion:\n\nFinal report for ${context.title}.`);
  output = setSection(
    output,
    "Technical Details",
    [
      context.taskRef ? `Task: \`${context.taskRef}\`` : "Task:",
      "",
      context.specRef ? `Spec: \`${context.specRef}\`` : "Spec:",
      "",
      context.evalRef ? `Eval: \`${context.evalRef}\`` : "Eval:",
      "",
      context.reviewPacketRef ? `Review Packet: \`${context.reviewPacketRef}\`` : "Review Packet:",
      "",
      context.reviewLoopReportRef ? `Review Loop Report: \`${context.reviewLoopReportRef}\`` : "Review Loop Report:",
      "",
      "Commands run:",
      "",
      "```text",
      "",
      "```",
      "",
      "Changed files:",
      "",
      "- ",
      "",
      "Evidence refs:",
      "",
      "- ",
    ].join("\n"),
  );
  return output;
}
