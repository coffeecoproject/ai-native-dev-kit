import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  activeGuidancePaths,
  analyzeActiveGuidanceConflicts,
  effectiveGuidanceGraph,
  loadReviewContextAuthority,
  USER_DECISION_CLASSES,
} from "../scripts/lib/review-context-authority.mjs";

const root = path.resolve(".");
const authority = loadReviewContextAuthority(root);

test("1.104.1 exposes exactly four non-technical user decision classes", () => {
  assert.deepEqual(USER_DECISION_CLASSES, [
    "NO_USER_ACTION",
    "BUSINESS_FACT_NEEDED",
    "REAL_WORLD_CONSENT_NEEDED",
    "EXTERNAL_FACT_NEEDED",
  ]);
  assert.deepEqual(authority.currentProductContract.userDecisionClasses, USER_DECISION_CLASSES);
});

test("1.104.1 rejects prose, question, menu, table, slogan, and approval-gate drift", () => {
  const bad = [
    "The user must choose the architecture and test strategy.",
    "Which platform profile should apply?",
    "Choose BL0, BL1, or BL2 before continuing.",
    "| Technical choice | User action |\n|---|---|\n| Platform profile | User confirms the selection |",
    "AI drafts. Humans decide.",
    "Humans decide. AI drafts.",
    "After human review, apply the proposed governance appendix.",
    "The human chooses native migration, docs-only adoption, or pause.",
    "Codex drafts. Humans confirm.",
    "The human decides:\n\n- platform profile\n- baseline level\n- industrial pack selection",
    "If any Risk Gate item is checked, Human Approval must be recorded before implementation.",
  ];
  for (const content of bad) {
    assert.notEqual(analyzeActiveGuidanceConflicts(content).length, 0, content);
  }
});

test("1.107.1 resolves referenced and generated effective guidance", () => {
  const graph = effectiveGuidanceGraph(authority, false, root);
  const onboarding = graph.nodes.find((node) => node.source === "core/project-onboarding.md");
  const generator = graph.nodes.find((node) => node.source === "scripts/init-project.mjs");
  assert.equal(onboarding?.registration, "REFERENCE");
  assert.ok(onboarding?.discoveredFrom);
  assert.equal(generator?.registration, "GENERATOR");
  assert.ok(graph.nodes.some((node) => node.source === "platforms/codex/quickstart.md"));
  assert.ok(graph.nodes.some((node) => node.source === "platforms/codex/skill/SKILL.md"));
  assert.ok(graph.nodes.some((node) => node.source === "standard-baseline-packs/selection-guide.md"));
  assert.ok(graph.nodes.some((node) => node.source === "industrial-packs/selection-guide.md"));
});

test("1.107.1 keeps Codex formal and Claude/Cursor compatibility-only", () => {
  assert.deepEqual(authority.currentProductContract.formalAgentPlatforms, ["CODEX"]);
  assert.deepEqual(authority.currentProductContract.compatibilityAgentPlatforms, ["CLAUDE", "CURSOR"]);
});

test("1.104.1 permits explicit technical ownership and bounded real-world input", () => {
  const good = [
    "Codex selects the profile, baseline, verification, and review path.",
    "Do not ask the user to confirm architecture or industrial packs.",
    "Ask which refund period the business requires.",
    "Ask for consent only before the prepared production action with rollback evidence.",
    "Ask for the provider fact only when project evidence cannot prove it.",
  ];
  for (const content of good) assert.deepEqual(analyzeActiveGuidanceConflicts(content), [], content);
});

test("1.113 rejects technical recovery menus and hidden Human Decision authority", () => {
  const bad = [
    "## Human Decision Summary\n\nRecommended choice: A / B\n\n- A: add a new dependency\n- B: change the architecture",
    "| Option | When to choose |\n|---|---|\n| A | Keep the current stack |\n| B | Change the migration strategy |\n\nAsk the user to choose A or B.",
    "## Human Approval\n\n- migration design\n- verification strategy\n- release readiness",
    "Fix requires a new dependency, so stop and ask for Human Approval.",
    "Verification failed repeatedly for the same reason; route the retry strategy to a Human Decision.",
    "A technical scope expansion requires a user decision before Codex continues.",
    "Human Decision: choose the migration mechanics and review depth.",
    "## Stop Conditions\n\nStop and ask the human when any condition appears:\n\n- Same finding appears twice.\n- Fix requires a new dependency.\n- Verification fails repeatedly for the same reason.",
  ];
  for (const content of bad) {
    assert.notEqual(analyzeActiveGuidanceConflicts(content).length, 0, content);
  }
});

test("1.113 keeps technical recovery internal and permits only bounded user input", () => {
  const good = [
    "Codex evaluates new dependencies, migration mechanics, and architecture through internal planning and evidence.",
    "Repeated verification failure stops automatic repair and triggers Codex root-cause analysis; it does not create a user decision.",
    "## User Input Summary\n\nUser input class: BUSINESS_FACT_NEEDED\n\nPlain-language question: How long may a customer cancel an appointment?",
    "User input class: REAL_WORLD_CONSENT_NEEDED. Ask for exact consent only after the production action and rollback are prepared.",
  ];
  for (const content of good) assert.deepEqual(analyzeActiveGuidanceConflicts(content), [], content);
});

test("1.113 Review Loop guidance keeps zero-experience responsibility boundaries", () => {
  for (const relativePath of ["core/review-loop.md", "templates/review-loop-report.md"]) {
    const content = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.deepEqual(analyzeActiveGuidanceConflicts(content), [], relativePath);
    assert.doesNotMatch(content, /Recommended choice:\s*A\s*\/\s*B|Choose for .*architecture|Fix requires a new dependency\.|Verification fails repeatedly for the same reason\./i);
    if (relativePath === "templates/review-loop-report.md") {
      assert.match(content, /## Human Decision Queue\n\nCompatibility heading: semantically this is the bounded `User Input Queue`/);
    }
  }
});

test("1.104.1 registered source guidance has no semantic responsibility conflict", () => {
  for (const relativePath of activeGuidancePaths(authority, false, root)) {
    const content = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.deepEqual(analyzeActiveGuidanceConflicts(content), [], relativePath);
  }
});

test("1.104.1 public runtime does not render technical choice menus", () => {
  for (const relativePath of [
    "scripts/start-project.mjs",
    "scripts/workflow-next.mjs",
    "scripts/baseline-project.mjs",
    "scripts/resolve-guided-baseline-selection.mjs",
  ]) {
    const content = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.match(content, /Decision Responsibility Summary|User Input Needed/);
    assert.doesNotMatch(content, /console\.log\([^\n]*(?:Which Platform Profile|Choose BL|Select Industrial Pack)/i);
  }
});
