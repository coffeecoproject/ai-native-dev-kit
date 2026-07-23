import { setSection, setTitle } from "../references.mjs";

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

export {
  fillAdoptionAssessment,
  fillGovernanceMap,
  fillHumanStatusReport,
  fillDecisionBrief,
  fillPlainReviewSummary,
  fillCustomerHandoff,
  fillFollowUpProposal,
  fillFinalReport,
};
