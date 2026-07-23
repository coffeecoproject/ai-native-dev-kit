import { setSection, setTitle } from "../references.mjs";

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


export { fillReviewPacket, fillReviewLoopReport, fillGptReviewPrompt };
