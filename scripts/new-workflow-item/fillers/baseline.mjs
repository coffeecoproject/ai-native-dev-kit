import { setSection, setTitle } from "../references.mjs";

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


export {
  fillChangeBoundaryReport,
  fillBaselineStateReport,
  fillBaselinePackSelectionReport,
  fillStandardBaselineSelectionReport,
  fillBaselineDecisionCard,
  fillApprovalRecord,
};
