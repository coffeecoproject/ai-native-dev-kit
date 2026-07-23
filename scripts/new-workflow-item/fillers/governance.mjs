import { setSection, setTitle } from "../references.mjs";

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


export {
  fillLaunchReadinessReport,
  fillConversationTurnClassification,
  fillScopeChangeReport,
  fillAdoptionTrialReport,
  fillRealAdoptionTrialReport,
  fillPatchClassification,
  fillActiveWorkThread,
  fillGuidedDecisionSummary,
};
