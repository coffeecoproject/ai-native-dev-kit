import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  activeGuidancePaths,
  analyzeActiveGuidanceConflicts,
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
    "Codex drafts. Humans confirm.",
    "If any Risk Gate item is checked, Human Approval must be recorded before implementation.",
  ];
  for (const content of bad) {
    assert.notEqual(analyzeActiveGuidanceConflicts(content).length, 0, content);
  }
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
