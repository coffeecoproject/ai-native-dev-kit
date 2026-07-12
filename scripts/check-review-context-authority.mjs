#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  analyzeActiveGuidanceConflicts,
  analyzeReviewRecommendation,
  classifyReviewContextAsset,
  evaluateCurrentConversationAuthority,
  loadReviewContextAuthority,
  reviewContextBinding,
  reviewContextBindingFromMarkdown,
  REVIEW_CONTEXT_VERSION,
  validateReviewContextBinding,
} from "./lib/review-context-authority.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installedLayout = fs.existsSync(path.join(root, ".intentos", "core", "review-context-authority.json"));
let failed = false;

function pass(message) {
  console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function workflowPath(relativePath) {
  return installedLayout ? path.posix.join(".intentos", relativePath) : relativePath;
}

function check(condition, passMessage, failMessage = passMessage) {
  if (condition) pass(passMessage);
  else fail(failMessage);
}

const authority = loadReviewContextAuthority(root);
check(authority.schemaVersion === REVIEW_CONTEXT_VERSION, "review context registry version is current");
check(authority.contractId === "ZERO_EXPERIENCE_SOLO_DEVELOPER", "registry has one stable review context contract ID");
check(authority.classificationFallback === "UNCLASSIFIED", "unknown context sources fail closed as UNCLASSIFIED");
check(authority.currentProductContract?.operatingModel === "ZERO_EXPERIENCE_SOLO_DEVELOPER", "registry binds the solo operating model");
check(authority.currentProductContract?.defaultUserCount === 1, "registry binds one default user");
check(authority.currentProductContract?.technicalDecisionOwner === "INTENTOS_CODEX", "registry delegates technical decisions to IntentOS/Codex");
check(authority.currentProductContract?.industrialDepthImpliesMultiplePeople === false, "industrial depth does not imply people");
check(JSON.stringify(authority.precedence) === JSON.stringify([
  "CURRENT_PRODUCT_CONTRACT",
  "CURRENT_RUNTIME_AND_GATES",
  "COMPATIBILITY_SCHEMA",
  "HISTORICAL_RECORD",
]), "interpretation precedence is exact");

const classificationCases = [
  ["core/review-context-authority.md", "CURRENT"],
  ["prompts/reviewer-agent.md", "CURRENT"],
  ["releases/1.99.2/release-record.md", "CURRENT"],
  ["releases/1.99.1/release-record.md", "HISTORICAL"],
  ["releases/1.80.0/release-record.md", "HISTORICAL"],
  ["docs/plans/review-context-enforcement-1.99.2-plan.md", "CURRENT"],
  ["docs/plans/review-context-authority-1.99.1-plan.md", "HISTORICAL"],
  ["docs/plans/release-evidence-gate-1.80-plan.md", "HISTORICAL"],
  ["schemas/artifacts/approval-record.schema.json", "COMPATIBILITY"],
  ["test-fixtures/bad/bad-approval-record-ai-owner/approval-records/001-bad.md", "COMPATIBILITY"],
];
for (const [file, expected] of classificationCases) {
  check(classifyReviewContextAsset(file, authority) === expected, `${file} is ${expected}`);
}
check(classifyReviewContextAsset("docs/new-unregistered-product-direction.md", authority) === "UNCLASSIFIED", "unknown semantic path has no current authority");
check(
  classifyReviewContextAsset("prompts/new-unregistered-reviewer.md", authority, { productDirection: true }) === "UNCLASSIFIED",
  "unregistered current runtime prompt has no product-direction authority",
);

for (const row of authority.activeGuidance || []) {
  const file = installedLayout ? row.installed : row.source;
  if (!file) continue;
  if (!fs.existsSync(path.join(root, file))) {
    fail(`active guidance path is missing: ${file}`);
    continue;
  }
  const content = read(file);
  const classification = classifyReviewContextAsset(row.source, authority, { content, productDirection: true });
  check(classification === "CURRENT", `${file} is registered, current, and non-conflicting`, `${file} active guidance classification is ${classification}`);
}

const conflictingGuidance = "IntentOS supports Solo / Team / Enterprise modes.";
check(analyzeActiveGuidanceConflicts(conflictingGuidance).length > 0, "direct active-guidance contradiction is detected");
check(
  classifyReviewContextAsset("prompts/reviewer-agent.md", authority, { content: conflictingGuidance, productDirection: true }) === "CONFLICTING",
  "contradictory current guidance is classified CONFLICTING",
);
check(
  analyzeActiveGuidanceConflicts("IntentOS must not add Solo / Team / Enterprise modes.").length === 0,
  "explicit prohibition is not misclassified as conflicting guidance",
);

const expectedBinding = reviewContextBinding(authority);
check(/^sha256:[a-f0-9]{64}$/.test(expectedBinding.context_digest), "review context contract has a sha256 digest");
for (const relativePath of ["templates/review-packet.md", "templates/gpt-review-prompt.md"].map(workflowPath)) {
  const binding = reviewContextBindingFromMarkdown(read(relativePath));
  const validation = validateReviewContextBinding(binding, authority);
  check(validation.ok, `${relativePath} carries the current review context binding`, `${relativePath} binding mismatch: ${validation.errors.join("; ")}`);
}

for (const relativePath of ["prompts/reviewer-agent.md", "templates/gpt-review-prompt.md"]) {
  const file = workflowPath(relativePath);
  const content = read(file);
  const normalizedContent = content.toLowerCase();
  for (const marker of [
    "ZERO_EXPERIENCE_SOLO_DEVELOPER",
    "current product contracts",
    "Industrial depth does not imply",
    "North-Star Alignment",
    "Compatibility / History Notes",
  ]) {
    check(normalizedContent.includes(marker.toLowerCase()), `${file} includes ${marker}`);
  }
}

const badRecommendations = [
  "I recommend adding Solo / Team / Enterprise modes in 2.0.",
  "BL2 requires a security team and several responsible people.",
  "The user should choose the architecture and baseline before Codex continues.",
  "Please find a release owner and a technical expert before implementation.",
  "Because an old release record used owners, the next version should restore team setup.",
  "release_owner_ref means the user must appoint a release owner.",
  "Because every industrial pack exists, enable all capabilities.",
  "CURRENT_CONVERSATION_USER automatically approves production release.",
];
for (const recommendation of badRecommendations) {
  check(analyzeReviewRecommendation(recommendation).length > 0, `review drift rejected: ${recommendation}`);
}

const goodRecommendation = "Keep one zero-experience solo entry. Codex selects the technical safeguards, while the user is asked only for the missing refund rule and later consent to the exact production effect.";
check(analyzeReviewRecommendation(goodRecommendation).length === 0, "aligned review recommendation passes");

const unpreparedConsent = evaluateCurrentConversationAuthority({
  authorityKind: "REAL_WORLD_EFFECT_CONSENT",
  exactEffectBound: false,
  evidenceReady: false,
  rollbackPrepared: false,
});
check(unpreparedConsent.canRecordConsent === false, "unprepared user statement cannot record real-world consent");

const preparedConsent = evaluateCurrentConversationAuthority({
  authorityKind: "REAL_WORLD_EFFECT_CONSENT",
  exactEffectBound: true,
  evidenceReady: true,
  rollbackPrepared: true,
});
check(preparedConsent.canRecordConsent === true && preparedConsent.satisfiesExternalAuthority === false, "prepared consent is exact and non-universal");

for (const authorityKind of ["LEGAL_IDENTITY", "REGULATORY_FACT", "EXTERNAL_PROVIDER_AUTHORITY", "THIRD_PARTY_PERMISSION"]) {
  const result = evaluateCurrentConversationAuthority({ authorityKind, exactEffectBound: true, evidenceReady: true, rollbackPrepared: true });
  check(result.canRecordConsent === false && result.satisfiesExternalAuthority === false, `${authorityKind} cannot be inferred from current-user identity`);
}

if (!installedLayout) {
  const readme = read("README.md");
  const readmeZh = read("README.zh-CN.md");
  check(readme.toLowerCase().includes("release history") && readme.includes("releases/"), "English README routes audit history out of the current entry");
  check(readmeZh.includes("版本历史") && readmeZh.includes("releases/"), "Chinese README routes audit history out of the current entry");
  check(!readme.includes("Historical release notes below"), "English README does not mix inline history into current entry");
  check(!readmeZh.includes("下方历史版本说明"), "Chinese README does not mix inline history into current entry");

  for (const starter of ["generic-project", "codex-web-app", "codex-ios-app", "codex-android-app"]) {
    const starterAgent = read(`starters/${starter}/AGENTS.md`);
    check(starterAgent.includes("ZERO_EXPERIENCE_SOLO_DEVELOPER") || starterAgent.includes("Zero-Experience Solo Developer"), `${starter} preserves solo operating context`);
    check(starterAgent.includes("review-context-authority"), `${starter} points review to current context authority`);
  }
} else {
  const agent = read("AGENTS.md");
  check(agent.includes("Zero-Experience Solo Developer"), "installed project Agent preserves solo operating context");
  check(agent.includes("review-context-authority"), "installed project Agent points review to current context authority");
  check(fs.existsSync(path.join(root, ".intentos", "core", "review-context-authority.md")), "installed project contains review context contract");
}

if (failed) process.exit(1);
console.log("");
console.log("Review context authority check passed.");
