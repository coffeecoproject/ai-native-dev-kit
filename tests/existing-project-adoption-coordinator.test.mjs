import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assessExistingProjectGovernanceBacklog,
  assessExistingProjectProfileReconciliation,
  existingProjectAdoptionStates,
  existingProjectGovernanceStates,
  existingProjectGovernanceReadinessStates,
  resolveExistingProjectAdoptionCheckpoint,
} from "../scripts/lib/existing-project-adoption-coordinator.mjs";
import { deriveProfilesFromProjectEvidence } from "../scripts/lib/baseline-selection.mjs";
import { createNativeRuleDecisionWorkPacket } from "../scripts/lib/native-rule-decision-work-packet.mjs";

const digest = (value) => `sha256:${String(value).repeat(64).slice(0, 64)}`;

function currentInput(overrides = {}) {
  return {
    binding: {
      state: "CURRENT",
      projectBinding: { project_root: "/private/tmp/unchanged-existing-project" },
      projectFactDigest: digest("1"),
      sourceRevision: digest("2"),
    },
    discovery: { state: "CURRENT", evidenceDigest: digest("3") },
    profile: {
      state: "CURRENT",
      declaredProfiles: ["wechat-miniprogram"],
      observedProfiles: ["wechat-miniprogram"],
      proposedProfiles: ["wechat-miniprogram"],
      evidenceDigest: digest("4"),
    },
    rules: {
      scanState: "COMPLETE_NO_ACTIONABLE_RULES",
      unresolvedBlocks: 0,
      decisionState: "NOT_REQUIRED",
      operationalBoundaryState: "CURRENT",
      evidenceDigest: digest("5"),
    },
    selectedAssetsPlan: { state: "CURRENT", planDigest: digest("6") },
    apply: { state: "APPLY_VERIFIED", receiptDigest: digest("7") },
    activation: { state: "READY_FOR_INTENTOS_OPERATION", evidenceDigest: digest("8") },
    ...overrides,
  };
}

test("high-confidence additive profile drift routes to a controlled profile reconciliation", () => {
  const result = resolveExistingProjectAdoptionCheckpoint(currentInput({
    profile: {
      state: "ADDITIVE_RECONCILIATION_REQUIRED",
      declaredProfiles: [
        "backend-api",
        "high-risk-change",
        "internal-admin",
        "wechat-miniprogram",
      ],
      observedProfiles: [
        "backend-api",
        "high-risk-change",
        "internal-admin",
        "web-app",
        "wechat-miniprogram",
      ],
      proposedProfiles: [
        "backend-api",
        "high-risk-change",
        "internal-admin",
        "web-app",
        "wechat-miniprogram",
      ],
      evidenceDigest: digest("9"),
    },
  }));

  assert.equal(result.state, existingProjectAdoptionStates.PROFILE_RECONCILIATION_REQUIRED);
  assert.equal(result.next_action, "PREPARE_CONTROLLED_PROFILE_RECONCILIATION");
  assert.equal(result.write_scope, "PROJECT_PROFILE_SELECTED_PROFILES_SECTION");
  assert.equal(result.must_stop_for_human, "No");
});

test("an existing mini program with a real admin web entry reproduces additive web-app drift", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-profile-drift-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "docs"));
  fs.mkdirSync(path.join(root, "admin"));
  fs.writeFileSync(path.join(root, "project.config.json"), "{}\n");
  fs.writeFileSync(path.join(root, "admin", "index.html"), "<!doctype html><title>Admin</title>\n");
  fs.writeFileSync(path.join(root, "docs", "project-profile.md"), [
    "# Project Profile",
    "",
    "## Selected Profiles",
    "",
    "- wechat-miniprogram",
    "- backend-api",
    "- internal-admin",
    "- high-risk-change",
    "",
  ].join("\n"));

  const projectEvidence = deriveProfilesFromProjectEvidence(root);
  const assessment = assessExistingProjectProfileReconciliation({
    declaredProfiles: ["wechat-miniprogram", "backend-api", "internal-admin", "high-risk-change"],
    projectEvidence,
  });

  assert.equal(projectEvidence.inspectionStatus, "COMPLETE");
  assert.deepEqual(projectEvidence.profiles, ["internal-admin", "web-app", "wechat-miniprogram"]);
  assert.equal(assessment.state, "ADDITIVE_RECONCILIATION_REQUIRED");
  assert.deepEqual(assessment.additions, ["web-app"]);
  assert.equal(assessment.human_decision_required, "No");
  assert.match(JSON.stringify(assessment.evidence), /web entrypoint/);
});

test("a complete scan with 86 unresolved tables keeps operation active and records governance backlog", () => {
  const result = resolveExistingProjectAdoptionCheckpoint(currentInput({
    rules: {
      scanState: "COMPLETE_ACTIONABLE_RULES",
      unresolvedBlocks: 86,
      decisionState: "NOT_PROVIDED",
      operationalBoundaryState: "BOUNDED_NON_BLOCKING",
      evidenceDigest: digest("a"),
    },
  }));

  assert.equal(result.state, existingProjectAdoptionStates.VERIFIED_ACTIVE);
  assert.equal(result.operational_state, existingProjectAdoptionStates.VERIFIED_ACTIVE);
  assert.equal(result.next_action, "READY_FOR_INTENTOS_OPERATION");
  assert.equal(result.governance_state, existingProjectGovernanceStates.GOVERNANCE_DECISION_BACKLOG);
  assert.equal(result.governance_next_action, "CODEX_REVIEW_NATIVE_RULE_DECISION_BACKLOG");
  assert.equal(result.governance_backlog_count, 86);
  assert.equal(result.governance_blocks_operation, "No");
  assert.equal(result.write_scope, "NONE");
  assert.match(result.governance_reasons.join("\n"), /86 exact existing-rule blocks/);
});

test("the coordinator stops a repeated transition with identical evidence", () => {
  const first = resolveExistingProjectAdoptionCheckpoint(currentInput({
    selectedAssetsPlan: { state: "MISSING", planDigest: "N/A" },
  }));
  const repeated = resolveExistingProjectAdoptionCheckpoint(currentInput({
    selectedAssetsPlan: { state: "MISSING", planDigest: "N/A" },
    transitionAttempted: true,
    previousCheckpoint: first,
  }));

  assert.equal(repeated.state, existingProjectAdoptionStates.BLOCKED_NO_PROGRESS);
  assert.equal(repeated.next_action, "STOP_REPEATED_ADOPTION_STATE");
  assert.equal(repeated.blocked_state, existingProjectAdoptionStates.SELECTED_ASSETS_PLAN_REQUIRED);
  assert.equal(repeated.progress_state, "NO_PROGRESS");
  assert.equal(repeated.must_stop_automation, "Yes");
});

test("an incomplete governance scan remains visible without replacing the operational next step", () => {
  const result = resolveExistingProjectAdoptionCheckpoint(currentInput({
    rules: {
      scanState: "INCOMPLETE_RULE_SCAN",
      unresolvedBlocks: null,
      decisionState: "NOT_PROVIDED",
      operationalBoundaryState: "BLOCKED_UNBOUNDED",
      evidenceDigest: digest("b"),
    },
    selectedAssetsPlan: { state: "MISSING", planDigest: "N/A" },
  }));

  assert.equal(result.state, existingProjectAdoptionStates.ADOPTION_SAFETY_BOUNDARY_REQUIRED);
  assert.equal(result.next_action, "COMPLETE_BOUNDED_GOVERNANCE_DISCOVERY");
  assert.equal(result.governance_state, existingProjectGovernanceStates.GOVERNANCE_SCAN_PENDING);
  assert.equal(result.governance_next_action, "RUN_BOUNDED_EXISTING_RULE_SCAN");
  assert.equal(result.governance_blocks_operation, "Yes");
});

test("one deterministic packet carries 86 exact multi-file rule decisions without target writes", () => {
  const extractions = [29, 29, 28].map((count, fileIndex) => {
    const sourceFile = `docs/governance/source-${fileIndex + 1}.md`;
    const blockLedger = [];
    const skippedBlocks = [];
    for (let index = 0; index < count; index += 1) {
      const line = 10 + index * 4;
      const suffix = String(fileIndex * 100 + index + 1).padStart(24, "0");
      const risky = fileIndex === 0 && index === 0;
      blockLedger.push({
        block_id: `NB-${suffix}-1`,
        block_digest: digest(String((index % 6) + 1)),
        block_type: "TABLE",
        source_start_line: line,
        source_end_line: line + 2,
        context_heading: risky ? "Production release controls" : `Business table ${index + 1}`,
        disposition: "NEEDS_REVIEW",
        rule_count: 0,
        reason: "Markdown table requires semantic classification.",
      });
      skippedBlocks.push({
        source_file: sourceFile,
        source_start_line: line,
        source_end_line: line + 2,
        context_heading: risky ? "Production release controls" : `Business table ${index + 1}`,
        excerpt: risky ? "Production deployment requires rollback approval." : `Table row ${index + 1}`,
        reason: "Markdown table skipped by deterministic extractor; classify before migration.",
      });
    }
    return {
      rules: [],
      coverage: {
        source_file: sourceFile,
        rules_extracted: 0,
        unclassified_blocks: [],
        skipped_blocks: skippedBlocks,
        low_signal_blocks: [],
        block_ledger: blockLedger,
      },
    };
  });
  const binding = {
    projectBinding: { project_root: "/private/tmp/unchanged-existing-project" },
    goalDigest: digest("1"),
    projectFactDigest: digest("2"),
    guidanceDigest: digest("3"),
    authorityInventoryDigest: digest("4"),
    sourceRevision: digest("5"),
  };

  const packet = createNativeRuleDecisionWorkPacket(extractions, binding);
  const reversed = createNativeRuleDecisionWorkPacket([...extractions].reverse(), binding);

  assert.equal(packet.required_decisions, 86);
  assert.equal(packet.packet_digest, reversed.packet_digest);
  assert.equal(packet.decision_policy.may_write_target_files, "No");
  assert.equal(packet.blocks[0].source_file, "docs/governance/source-1.md");
  assert.equal(packet.blocks[0].source_start_line, 10);
  assert.equal(packet.blocks[0].review_constraint, "FAIL_CLOSED_HIGH_RISK");
  assert.deepEqual(packet.blocks[0].risk_signals, ["RELEASE_OR_PRODUCTION"]);
  assert.ok(packet.blocks.slice(1).every((block) => block.review_constraint === "SEMANTIC_CLASSIFICATION_REQUIRED"));
  assert.ok(packet.blocks.slice(1).every((block) => !block.risk_signals.includes("DESTRUCTIVE_OR_IRREVERSIBLE")));
  assert.ok(packet.blocks.every((block) => block.block_id && block.block_digest && block.excerpt));

  const nativeEvidence = {
    project_binding: binding.projectBinding,
    goal_digest: binding.goalDigest,
    project_fact_digest: binding.projectFactDigest,
    guidance_digest: binding.guidanceDigest,
    authority_inventory_digest: binding.authorityInventoryDigest,
    source_revision: binding.sourceRevision,
  };
  const readiness = assessExistingProjectGovernanceBacklog({
    reconciliationCoverage: { scanState: "INCOMPLETE_RULE_SCAN", omittedRules: 86 },
    nativeEvidence,
    packet,
    blockDecisionResolution: { state: "NOT_PROVIDED" },
  });
  assert.equal(readiness.state, existingProjectGovernanceReadinessStates.BOUNDED_NON_BLOCKING);
  assert.equal(readiness.blocks_operation, "No");
  assert.equal(readiness.backlog_count, 86);

  const stale = structuredClone(packet);
  stale.project_binding = { project_root: "/private/tmp/another-project" };
  const rejected = assessExistingProjectGovernanceBacklog({
    reconciliationCoverage: { scanState: "INCOMPLETE_RULE_SCAN", omittedRules: 86 },
    nativeEvidence,
    packet: stale,
    blockDecisionResolution: { state: "NOT_PROVIDED" },
  });
  assert.equal(rejected.state, existingProjectGovernanceReadinessStates.BLOCKED_UNBOUNDED);
  assert.equal(rejected.blocks_operation, "Yes");
  assert.match(rejected.reasons.join("\n"), /project binding is stale/);
});

test("a native rule decision packet rejects missing current project binding", () => {
  assert.throws(
    () => createNativeRuleDecisionWorkPacket([], {}),
    /requires a current project binding/,
  );
});
