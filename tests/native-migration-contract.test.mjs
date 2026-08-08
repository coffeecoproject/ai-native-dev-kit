import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  extractMachineReadableEvidence,
  loadSchema,
  validateVersionedArtifact,
} from "../scripts/lib/artifact-schema.mjs";
import { createNativeRuleBlockDecisionArtifact } from "../scripts/lib/native-rule-block-decisions.mjs";
import { validateNativeRuleBlockCoverage } from "../scripts/lib/native-rule-block-ledger.mjs";
import { createSyntheticNativeRuleExtraction } from "../scripts/lib/native-rule-extraction.mjs";
import { resolveProjectEntryTrust } from "../scripts/lib/project-entry-trust.mjs";
import { sameRunBindingFromTrust } from "../scripts/lib/same-run-evidence-envelope.mjs";
import { buildPlan } from "../scripts/init-project/plan.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nativeSchema = loadSchema(kitRoot, "schemas/artifacts/native-migration-plan.schema.json");
const decisionSchema = loadSchema(kitRoot, "schemas/artifacts/native-rule-block-decisions.schema.json");

function fixture(t, prefix) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return file;
}

function runNode(args, options = {}) {
  return spawnSync(process.execPath, args, {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    timeout: options.timeout || 120_000,
    maxBuffer: 256 * 1024 * 1024,
  });
}

function runJson(script, root, args = []) {
  const result = runNode([path.join(kitRoot, script), root, ...args]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return JSON.parse(result.stdout);
}

function git(root, args) {
  const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function existingProject(t) {
  const root = fixture(t, "intentos-native-contract-");
  const reviewText = "This paragraph records architectural background and surrounding context without a deterministic directive. ".repeat(3);
  write(root, "package.json", `${JSON.stringify({
    name: "native-contract-fixture",
    private: true,
    scripts: { test: "node --test" },
  }, null, 2)}\n`);
  write(root, "src/business.mjs", "export const businessBehavior = 'preserve-me';\n");
  write(root, "README.md", "# Existing project\n");
  write(root, "AGENTS.md", `# Existing project authority\n\n${reviewText}\n`);
  git(root, ["init", "-q"]);
  git(root, ["add", "."]);
  git(root, ["-c", "user.name=IntentOS Tests", "-c", "user.email=intentos@example.invalid", "commit", "-qm", "fixture"]);
  return root;
}

test("synthetic Native Migration observations have deterministic exact ledger coverage", () => {
  const options = {
    sourceFile: "project scan",
    contextHeading: "project scan",
    sourceExcerpt: "No existing governance rule source detected.",
    warning: "No existing governance rule source detected.",
    classification: {
      rule_class: "UNKNOWN_AUTHORITY",
      authority: "Unresolved project authority",
      default_handling: "stop for classification",
      preserve_or_replace: "preserve until classified",
      reason: "No project-owned governance source was available for classification.",
      risk_surfaces: "workflow",
      target_action: "preserve project authority and stop before apply",
      human_decision_required: "No",
      confidence: "LOW",
    },
  };
  const first = createSyntheticNativeRuleExtraction(options);
  const second = createSyntheticNativeRuleExtraction(options);

  assert.deepEqual(first, second);
  assert.equal(first.rules.length, 1);
  assert.equal(first.coverage.rules_extracted, 1);
  assert.equal(first.coverage.lines_scanned, 0);
  assert.equal(first.coverage.block_ledger.length, 1);
  assert.equal(first.coverage.block_ledger[0].block_type, "SYNTHETIC_OBSERVATION");
  assert.equal(first.coverage.block_ledger[0].disposition, "EXTRACTED_RULE");
  assert.equal(first.coverage.block_ledger[0].rule_count, 1);
  assert.deepEqual(validateNativeRuleBlockCoverage(first.rules, first.coverage), []);

  const mismatched = structuredClone(first.coverage);
  mismatched.block_ledger[0].rule_count = 2;
  assert.match(validateNativeRuleBlockCoverage(first.rules, mismatched).join("\n"), /exactly match|rule count/i);
});

test("all producer-owned synthetic Native Migration branches publish exact typed ledger evidence", (t) => {
  const light = fixture(t, "intentos-native-synthetic-light-");
  write(light, "package.json", `${JSON.stringify({ name: "light-existing-project", private: true }, null, 2)}\n`);
  write(light, "src/index.js", "export const ready = true;\n");
  git(light, ["init", "-q"]);
  git(light, ["add", "."]);
  git(light, ["-c", "user.name=IntentOS Tests", "-c", "user.email=intentos@example.invalid", "commit", "-qm", "fixture"]);

  for (const report of [
    runJson("scripts/resolve-native-migration.mjs", light, ["--json", "--intent", "adopt this light project"]),
    runJson("scripts/resolve-native-migration.mjs", kitRoot, ["--json", "--intent", "inspect current source authority"]),
  ]) {
    const evidence = report.structuredEvidence;
    const validation = validateVersionedArtifact(evidence, nativeSchema, { requireCurrent: true });
    assert.equal(validation.ok, true, validation.errors.join("\n"));
    assert.equal(evidence.rule_extraction_coverage.length, 1);
    const coverage = evidence.rule_extraction_coverage[0];
    const rules = evidence.rule_classifications.filter((rule) => rule.source_file === coverage.source_file);
    assert.equal(coverage.block_ledger.length, 1);
    assert.equal(coverage.block_ledger[0].block_type, "SYNTHETIC_OBSERVATION");
    assert.deepEqual(validateNativeRuleBlockCoverage(rules, coverage), []);
  }
});

test("current Native Migration evidence is strict while historical evidence stays compatibility-readable", (t) => {
  const root = existingProject(t);
  const report = runJson("scripts/resolve-native-migration.mjs", root, [
    "--json",
    "--intent", "adopt this existing project without replacing project authority",
  ]);
  const evidence = report.structuredEvidence;
  const current = validateVersionedArtifact(evidence, nativeSchema, {
    label: "native migration plan",
    requireCurrent: true,
  });
  assert.equal(current.ok, true, current.errors.join("\n"));
  assert.equal(evidence.schema_version, nativeSchema.schemaVersion);

  for (const field of [
    "project_binding",
    "goal_digest",
    "authority_source_inventory",
    "block_decision_resolution",
    "human_decisions_needed",
  ]) {
    const invalid = structuredClone(evidence);
    delete invalid[field];
    assert.equal(
      validateVersionedArtifact(invalid, nativeSchema, { requireCurrent: true }).ok,
      false,
      `${field} was not enforced by the current contract`,
    );
  }

  const missingLedger = structuredClone(evidence);
  delete missingLedger.rule_extraction_coverage[0].block_ledger;
  assert.equal(validateVersionedArtifact(missingLedger, nativeSchema, { requireCurrent: true }).ok, false);

  const legacyFile = path.join(
    kitRoot,
    "examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual/native-migration-plans/001-mixed-domain-bilingual.md",
  );
  const legacy = extractMachineReadableEvidence(fs.readFileSync(legacyFile, "utf8"));
  assert.equal(legacy.ok, true);
  assert.equal(validateVersionedArtifact(legacy.value, nativeSchema).ok, true);
  assert.equal(validateVersionedArtifact(legacy.value, nativeSchema, { requireCurrent: true }).ok, false);
});

test("native block decision schema enforces disposition-specific structure", () => {
  const binding = {
    projectBinding: {
      canonical_root: "/tmp/native-contract",
      topology_digest: `sha256:${"1".repeat(64)}`,
      identity_kind: "GIT_REPOSITORY",
      identity_fingerprint: "fixture",
    },
    goalDigest: `sha256:${"2".repeat(64)}`,
    projectFactDigest: `sha256:${"3".repeat(64)}`,
    guidanceDigest: `sha256:${"4".repeat(64)}`,
    authorityInventoryDigest: `sha256:${"5".repeat(64)}`,
    sourceRevision: "fixture-revision",
  };
  const classification = {
    rule_class: "ENGINEERING_BASELINE",
    authority: "project architecture baseline",
    default_handling: "map after review",
    preserve_or_replace: "map",
    reason: "Preserve project-owned engineering context.",
    risk_surfaces: "engineering",
    target_action: "map without replacing project authority",
    confidence: "HIGH",
  };
  const artifact = createNativeRuleBlockDecisionArtifact({
    binding,
    decisions: [{
      block_id: `NB-${"a".repeat(24)}-1`,
      block_digest: `sha256:${"b".repeat(64)}`,
      source_file: "AGENTS.md",
      disposition: "CLASSIFY_AS_RULE",
      reason: "Project owner classified this review block.",
      classification,
    }],
  });
  assert.equal(validateVersionedArtifact(artifact, decisionSchema, { requireCurrent: true }).ok, true);

  const missingClassification = structuredClone(artifact);
  delete missingClassification.decisions[0].classification;
  assert.equal(validateVersionedArtifact(missingClassification, decisionSchema, { requireCurrent: true }).ok, false);

  const forbiddenClassification = structuredClone(artifact);
  forbiddenClassification.decisions[0].disposition = "PRESERVE_AS_CONTEXT";
  assert.equal(validateVersionedArtifact(forbiddenClassification, decisionSchema, { requireCurrent: true }).ok, false);

  const unknownField = structuredClone(artifact);
  unknownField.decisions[0].untrusted_extension = true;
  assert.equal(validateVersionedArtifact(unknownField, decisionSchema, { requireCurrent: true }).ok, false);
});

test("native migration emits one current project-bound Codex decision packet for unresolved blocks", (t) => {
  const root = existingProject(t);
  const intent = "adopt this existing project without replacing project authority";
  const report = runJson("scripts/resolve-native-migration.mjs", root, ["--json", "--intent", intent]);
  const packet = report.nativeRuleDecisionWorkPacket;
  const unresolved = report.ruleExtractionCoverage
    .flatMap((coverage) => coverage.blockLedger
      .filter((block) => block.disposition === "NEEDS_REVIEW"));

  assert.equal(packet.artifact_type, "native_rule_decision_work_packet");
  assert.equal(packet.required_decisions, unresolved.length);
  assert.ok(packet.required_decisions > 0);
  assert.deepEqual(packet.project_binding, report.structuredEvidence.project_binding);
  assert.equal(packet.goal_digest, report.structuredEvidence.goal_digest);
  assert.deepEqual(packet.blocks.map((block) => block.block_id), unresolved.map((block) => block.blockId));
  assert.equal(packet.decision_policy.may_write_target_files, "No");
  assert.equal(packet.decision_policy.may_authorize_apply, "No");

  write(root, "docs/project-profile.md", [
    "# Project Profile",
    "",
    "## Selected Profiles",
    "",
    "- web-app",
    "",
  ].join("\n"));
  git(root, ["add", "."]);
  git(root, ["-c", "user.name=IntentOS Tests", "-c", "user.email=intentos@example.invalid", "commit", "-qm", "profile"]);
  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: intent,
    migrationDepth: "READ_ONLY_DIAGNOSIS",
  });
  assert.equal(plan.executionState, "DIAGNOSTIC_ONLY");
  assert.equal(plan.adoptionAssessment.rule_reconciliation.source_mode, "SAME_RUN_ENVELOPE");
  assert.equal(plan.adoptionAssessment.adoption_checkpoint.state, "SELECTED_ASSETS_PLAN_REQUIRED");
  assert.equal(plan.adoptionAssessment.adoption_checkpoint.next_action, "GENERATE_SELECTED_ASSETS_APPLY_PLAN");
  assert.equal(plan.adoptionAssessment.adoption_checkpoint.governance_state, "GOVERNANCE_DECISION_BACKLOG");
  assert.equal(plan.adoptionAssessment.adoption_checkpoint.governance_next_action, "CODEX_REVIEW_NATIVE_RULE_DECISION_BACKLOG");
  assert.equal(plan.adoptionAssessment.adoption_checkpoint.governance_blocks_operation, "No");
  assert.ok(plan.adoptionAssessment.native_rule_decision_work_packet.required_decisions > 0);
});

test("a current project-bound block decision survives plan write and controlled apply replay", { timeout: 480_000 }, (t) => {
  const root = existingProject(t);
  const intent = "adopt this existing project without replacing project authority";
  const businessBefore = fs.readFileSync(path.join(root, "src/business.mjs"), "utf8");
  const initial = runJson("scripts/resolve-native-migration.mjs", root, ["--json", "--intent", intent]);
  const coverage = initial.ruleExtractionCoverage.find((item) => item.sourceFile === "AGENTS.md");
  const block = coverage.blockLedger.find((item) => item.disposition === "NEEDS_REVIEW");
  assert.ok(block, JSON.stringify(coverage, null, 2));
  assert.equal(initial.nativeRuleDecisionWorkPacket.artifact_type, "native_rule_decision_work_packet");
  assert.equal(initial.nativeRuleDecisionWorkPacket.required_decisions, 1);
  assert.equal(initial.nativeRuleDecisionWorkPacket.blocks[0].block_id, block.blockId);
  assert.equal(initial.nativeRuleDecisionWorkPacket.blocks[0].block_digest, block.blockDigest);
  assert.equal(initial.nativeRuleDecisionWorkPacket.decision_policy.may_write_target_files, "No");

  const binding = sameRunBindingFromTrust(resolveProjectEntryTrust({
    projectRoot: root,
    sourceRoot: kitRoot,
    goal: intent,
  }));
  const artifact = createNativeRuleBlockDecisionArtifact({
    binding,
    decisions: [{
      block_id: block.blockId,
      block_digest: block.blockDigest,
      source_file: "AGENTS.md",
      disposition: "PRESERVE_AS_CONTEXT",
      reason: "Preserve this descriptive architecture text as project-owned context.",
    }],
  });
  const decisionRoot = fixture(t, "intentos-native-decision-");
  const decisionFile = write(decisionRoot, "decisions.json", `${JSON.stringify(artifact, null, 2)}\n`);
  const resolved = runJson("scripts/resolve-native-migration.mjs", root, [
    "--json", "--intent", intent, "--native-rule-decisions", decisionFile,
  ]);
  assert.equal(resolved.blockDecisionResolution.state, "APPLIED", JSON.stringify(resolved, null, 2));
  assert.equal(resolved.nativeRuleDecisionWorkPacket, null);
  assert.notEqual(resolved.outcome, "BLOCKED", JSON.stringify(resolved, null, 2));
  const statusBeforePlan = spawnSync("git", ["-C", root, "status", "--porcelain"], { encoding: "utf8" });
  assert.equal(statusBeforePlan.stdout, "", statusBeforePlan.stdout);
  const cwdResolvedResult = runNode([
    path.join(kitRoot, "scripts/resolve-native-migration.mjs"),
    root, "--json", "--intent", intent, "--native-rule-decisions", decisionFile,
  ], { cwd: root });
  assert.equal(cwdResolvedResult.status, 0, `${cwdResolvedResult.stdout}\n${cwdResolvedResult.stderr}`);
  const cwdResolved = JSON.parse(cwdResolvedResult.stdout);
  assert.notEqual(cwdResolved.outcome, "BLOCKED", JSON.stringify(cwdResolved, null, 2));
  const directPlan = buildPlan(root, {
    starter: "generic-project",
    goal: intent,
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
    nativeRuleDecisions: decisionFile,
  });
  assert.equal(directPlan.executionState, "EXECUTABLE", JSON.stringify(directPlan.adoptionAssessment, null, 2));
  const statusAfterDirectPlan = spawnSync("git", ["-C", root, "status", "--porcelain"], { encoding: "utf8" });
  assert.equal(statusAfterDirectPlan.stdout, "", statusAfterDirectPlan.stdout);
  const dryRun = runNode([
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--target", root,
    "--goal", intent,
    "--migration-depth", "SELECTED_ASSETS",
    "--profiles", "web-app",
    "--baseline-level", "BL1_STANDARD",
    "--native-rule-decisions", decisionFile,
    "--dry-run",
  ], { cwd: root });
  assert.equal(dryRun.status, 0, `${dryRun.stdout}\n${dryRun.stderr}`);
  const cliDryPlan = JSON.parse(dryRun.stdout);
  assert.equal(cliDryPlan.executionState, "EXECUTABLE", JSON.stringify(cliDryPlan.adoptionAssessment, null, 2));
  const planRelative = "apply-execution-plans/native-decision.json";
  const planned = runNode([
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--target", root,
    "--goal", intent,
    "--migration-depth", "SELECTED_ASSETS",
    "--profiles", "web-app",
    "--baseline-level", "BL1_STANDARD",
    "--native-rule-decisions", decisionFile,
    "--write-plan", planRelative,
  ], { cwd: root });
  assert.equal(planned.status, 0, `${planned.stdout}\n${planned.stderr}`);

  const planFile = path.join(root, planRelative);
  const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
  assert.equal(plan.executionState, "EXECUTABLE", JSON.stringify(plan.adoptionAssessment, null, 2));
  assert.equal(plan.arguments.nativeRuleDecisionDigest, artifact.decision_digest);
  assert.equal(plan.adoptionAssessment.native_migration.block_decision_resolution.state, "APPLIED");
  const postPlanNative = runNode([
    path.join(kitRoot, "scripts/resolve-native-migration.mjs"),
    root, "--json", "--intent", intent, "--native-rule-decisions", decisionFile,
  ], { cwd: root });
  assert.equal(postPlanNative.status, 0, `${postPlanNative.stdout}\n${postPlanNative.stderr}`);
  const postPlanNativeReport = JSON.parse(postPlanNative.stdout);
  assert.equal(postPlanNativeReport.blockDecisionResolution.state, "APPLIED", JSON.stringify(postPlanNativeReport, null, 2));

  const applied = runNode([
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--apply-plan", planFile,
    "--goal", intent,
  ], { cwd: root, timeout: 360_000 });
  assert.equal(applied.status, 0, `${applied.stdout}\n${applied.stderr}`);
  assert.equal(fs.readFileSync(path.join(root, "src/business.mjs"), "utf8"), businessBefore);
  const receipt = fs.readFileSync(path.join(root, plan.receiptPath), "utf8");
  assert.match(receipt, /APPLY_VERIFIED/);
});
