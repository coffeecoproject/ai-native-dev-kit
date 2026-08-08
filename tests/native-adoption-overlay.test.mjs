import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  nativeAdoptionOperationalPolicy,
  nativeAdoptionActionCapability,
  normalizeNativeAdoptionMigrationDepth,
  resolveNativeAdoptionStage,
  selectedNativeBaselineReadiness,
  selectedNativeIndustrialReadiness,
  selectedNativeOverlayAssets,
} from "../scripts/lib/native-adoption-overlay.mjs";
import {
  requiredAgentGovernanceMarkers,
  selectedAgentGovernanceAppendix,
} from "../scripts/init-project/assets.mjs";
import {
  addSelectedBaselineAssetPlanActions,
  addSelectedDistributionPlanActions,
  buildCandidateStaticActivationPreflight,
  buildPlan,
} from "../scripts/init-project/plan.mjs";
import {
  validateHistoricalVerifiedApplyReceiptFile,
  validateVerifiedApplyReceiptFile,
} from "../scripts/lib/adoption-apply-chain.mjs";
import {
  resolveVerifiedInitialTaskIntakeProof,
  verifyProjectLocalBehavioralRoute,
} from "../scripts/lib/behavioral-adoption-activation.mjs";
import {
  controlledApplyProtocolArtifactRoots,
  isControlledApplyProtocolArtifactPath,
} from "../scripts/lib/evidence-authority.mjs";
import { gitWorktreeState } from "../scripts/lib/git.mjs";
import { validateRequestBoundLocalActionGraph } from "../scripts/lib/request-bound-apply-authority.mjs";

function projectFixture(t, { governed = true, historicalTasks = 0 } = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "intentos-native-overlay-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({
    name: "native-overlay-fixture",
    scripts: { test: "node --test", build: "node build.mjs" },
  }, null, 2)}\n`);
  if (governed) {
    fs.writeFileSync(path.join(root, "AGENTS.md"), [
      "# Project Rules",
      "",
      "- Run tests before completion.",
      "- Preserve release and rollback procedures.",
      "- Do not change production credentials.",
      "",
    ].join("\n"));
    fs.mkdirSync(path.join(root, "docs"));
    fs.writeFileSync(path.join(root, "docs", "release.md"), "# Release and rollback\n\nPreserve release, rollback, and production controls.\n");
  }
  if (historicalTasks > 0) {
    fs.mkdirSync(path.join(root, "tasks"));
    for (let index = 1; index <= historicalTasks; index += 1) {
      fs.writeFileSync(path.join(root, "tasks", `Task${String(index).padStart(3, "0")}.md`), `# Historical task ${index}\n\nStatus: done\n`);
    }
  }
  return root;
}

function industrialWorkflowFixture(t, { profiles, industrialPacks }) {
  const root = projectFixture(t, { governed: false });
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.writeFileSync(path.join(root, "docs", "project-profile.md"), [
    "# Project Profile",
    "",
    "## Selected Profiles",
    "",
    ...profiles.map((profile) => `- ${profile}`),
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(root, "docs", "baseline-selection.md"), [
    "# Baseline Selection",
    "",
    "## Baseline Level",
    "",
    "BL2_INDUSTRIAL",
    "",
    "## Selected Profiles",
    "",
    ...profiles.map((profile) => `- ${profile}`),
    "",
    "## Selected Industrial Packs",
    "",
    ...industrialPacks.map((packId) => `- ${packId}`),
    "",
  ].join("\n"));
  fs.writeFileSync(path.join(root, "docs", "baseline-evidence.md"), "# Baseline Evidence\n");

  const sourceRoot = path.resolve("industrial-packs");
  const targetRoot = path.join(root, ".intentos", "industrial-packs");
  fs.mkdirSync(targetRoot, { recursive: true });
  fs.copyFileSync(path.join(sourceRoot, "index.json"), path.join(targetRoot, "index.json"));
  const index = JSON.parse(fs.readFileSync(path.join(sourceRoot, "index.json"), "utf8"));
  for (const packId of industrialPacks) {
    const entry = index.packs.find((candidate) => candidate.id === packId);
    assert.ok(entry, packId);
    fs.cpSync(path.join(sourceRoot, entry.path), path.join(targetRoot, entry.path), { recursive: true });
  }
  return root;
}

test("selected native overlay is a strict capability-derived subset of the full target", () => {
  const assets = selectedNativeOverlayAssets();
  const targets = new Set(assets.map((asset) => asset.target));
  assert.ok(assets.length > 0);
  assert.ok(assets.length < 160, `selected overlay unexpectedly expanded to ${assets.length} assets`);
  assert.equal(targets.has(".intentos/intentos-manifest.json"), true);
  assert.equal(targets.has(".intentos/schemas/artifacts/apply-execution-receipt.schema.json"), true);
  assert.equal(targets.has(".intentos/schemas/artifacts/request-bound-apply-authority.schema.json"), true);
  assert.equal(targets.has("scripts/workflow-next.mjs"), true);
  assert.equal(targets.has("scripts/check-environment-baseline.mjs"), true);
  assert.equal(targets.has("scripts/resolve-task-governance.mjs"), true);
  assert.equal(targets.has("scripts/resolve-operating-loop.mjs"), false);
  assert.equal(targets.has(".github/pull_request_template.md"), false);
  assert.equal(targets.has("release-recipes/web-app.md"), false);
  assert.equal(targets.has(".intentos/profiles/web-app/baseline.json"), false);
  for (const asset of assets) {
    assert.ok(asset.source);
    assert.ok(asset.sourceGroups.length > 0);
    assert.ok(asset.capabilities.length > 0);
  }
});

test("plan metadata canonicalizes unordered baseline selections for strict replay", (t) => {
  const root = projectFixture(t, { governed: false });
  const goal = "adopt this existing web project without changing project-owned work";
  const plan = buildPlan(root, {
    starter: "generic-project",
    goal,
    projectEntryOrigin: "EXISTING_PROJECT",
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app,high-risk-change",
    baselineLevel: "BL2_INDUSTRIAL",
    industrialPacks: "web-app-industrial,high-risk-change-industrial",
    createdAt: "2030-01-01T00:00:00.000Z",
  });

  assert.equal(plan.arguments.industrialPacks, "high-risk-change-industrial,web-app-industrial");
  const replay = buildPlan(plan.targetRoot, {
    starter: plan.arguments.starter,
    update: plan.operation === "UPDATE_WORKFLOW_ASSETS",
    applyPrTemplateGovernance: plan.arguments.applyPrTemplateGovernance,
    applyAgentGovernance: plan.arguments.applyAgentGovernance,
    withIndustrialPacks: plan.arguments.withIndustrialPacks,
    industrialPacks: plan.arguments.selectedIndustrialPacks.join(","),
    profiles: plan.arguments.profiles.join(","),
    baselineLevel: plan.arguments.baselineLevel,
    standardPacks: plan.arguments.standardPacks.join(","),
    backupDir: plan.arguments.backupDir || "",
    goal: plan.arguments.goal,
    migrationDepth: plan.arguments.migrationDepth,
    nativeRuleDecisions: plan.arguments.nativeRuleDecisions || "",
    projectEntryOrigin: plan.arguments.projectEntryOrigin,
    createdAt: plan.createdAt,
  });

  assert.equal(replay.planDigest, plan.planDigest);
});

test("controlled apply protocol artifacts have one exact project-source boundary", () => {
  assert.deepEqual(controlledApplyProtocolArtifactRoots, [
    "apply-execution-plans",
    "approval-records",
    "release-approval-records",
    "apply-readiness-reports",
    "apply-receipts",
    ".intentos/apply-plans",
    ".intentos/apply-authorities",
    ".intentos/backups",
  ]);
  for (const root of controlledApplyProtocolArtifactRoots) {
    assert.equal(isControlledApplyProtocolArtifactPath(root), true, root);
    assert.equal(isControlledApplyProtocolArtifactPath(`${root}/retained-failure.json`), true, root);
  }
  for (const projectPath of [
    "src/apply-receipts/retained-failure.md",
    "apply-receipts-user/retained-failure.md",
    ".intentos/version.json",
    "requests/current.md",
  ]) {
    assert.equal(isControlledApplyProtocolArtifactPath(projectPath), false, projectPath);
  }
});

test("selected controlled updates replace only verified managed source drift", (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "intentos-selected-update-drift-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const runtimePath = "scripts/workflow-next.mjs";
  const baselinePath = ".intentos/profiles/web-app/profile.md";
  const oldRuntime = "// prior managed workflow runtime\n";
  const oldBaseline = "# Prior managed Web profile\n";
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(root, ".intentos", "profiles", "web-app"), { recursive: true });
  fs.writeFileSync(path.join(root, runtimePath), oldRuntime);
  fs.writeFileSync(path.join(root, baselinePath), oldBaseline);
  const digest = (content) => `sha256:${createHash("sha256").update(content).digest("hex")}`;
  const versionPath = path.join(root, ".intentos", "version.json");
  const version = {
    intentOSVersion: "1.112.0",
    workflowAssets: [runtimePath, baselinePath],
    managedAssetDigests: {
      [runtimePath]: digest(oldRuntime),
      [baselinePath]: digest(oldBaseline),
    },
  };
  fs.writeFileSync(versionPath, `${JSON.stringify(version, null, 2)}\n`);

  const updateActions = [];
  addSelectedDistributionPlanActions(updateActions, root, { update: true });
  addSelectedBaselineAssetPlanActions(updateActions, root, {
    profiles: ["web-app"],
    standardPacks: [],
  }, { update: true });
  for (const target of [runtimePath, baselinePath]) {
    const action = updateActions.find((candidate) => candidate.path === target);
    assert.equal(action.type, "UPDATE_MANAGED", target);
    assert.equal(action.willWrite, true, target);
    assert.equal(action.ownership.state, "VERIFIED_PRIOR_INTENTOS_MANAGED", target);
  }

  const adoptionActions = [];
  addSelectedDistributionPlanActions(adoptionActions, root, { update: false });
  addSelectedBaselineAssetPlanActions(adoptionActions, root, {
    profiles: ["web-app"],
    standardPacks: [],
  }, { update: false });
  for (const target of [runtimePath, baselinePath]) {
    const action = adoptionActions.find((candidate) => candidate.path === target);
    assert.equal(action.type, "SKIP_EXISTING", target);
    assert.equal(action.willWrite, false, target);
  }

  delete version.managedAssetDigests[runtimePath];
  fs.writeFileSync(versionPath, `${JSON.stringify(version, null, 2)}\n`);
  const unownedActions = [];
  addSelectedDistributionPlanActions(unownedActions, root, { update: true });
  const unownedRuntime = unownedActions.find((candidate) => candidate.path === runtimePath);
  assert.equal(unownedRuntime.type, "PRESERVE_UNMANAGED");
  assert.equal(unownedRuntime.willWrite, false);
});

test("selected operational policy is explicit and fails closed on an incomplete declared closure", () => {
  const required = [
    ".intentos/intentos-manifest.json",
    ".intentos/schemas/artifacts/apply-execution-receipt.schema.json",
    ".intentos/schemas/artifacts/approval-record.schema.json",
    ".intentos/schemas/artifacts/controlled-apply-readiness.schema.json",
    ".intentos/schemas/artifacts/request-bound-apply-authority.schema.json",
    ".intentos/schemas/artifacts/unified-apply-plan.schema.json",
    ".intentos/version.json",
    "AGENTS.md",
    "scripts/check-baseline-installation.mjs",
    "scripts/resolve-task-governance.mjs",
    "scripts/resolve-work-queue.mjs",
    "scripts/workflow-next.mjs",
  ];
  const ready = nativeAdoptionOperationalPolicy({
    projectEntryOrigin: "EXISTING_PROJECT",
    assetMigrationDepth: "SELECTED_ASSETS",
    workflowAssets: required,
  });
  assert.equal(ready.profile, "SELECTED_EXISTING_PROJECT");
  assert.equal(ready.selected, true);
  assert.equal(ready.valid, true);
  assert.deepEqual(ready.missingRequiredAssets, []);

  const incomplete = nativeAdoptionOperationalPolicy({
    projectEntryOrigin: "EXISTING_PROJECT",
    assetMigrationDepth: "SELECTED_ASSETS",
    workflowAssets: required.filter((relative) => relative !== "scripts/resolve-task-governance.mjs"),
  });
  assert.equal(incomplete.valid, false);
  assert.deepEqual(incomplete.missingRequiredAssets, ["scripts/resolve-task-governance.mjs"]);

  const full = nativeAdoptionOperationalPolicy({
    projectEntryOrigin: "NEW_PROJECT",
    assetMigrationDepth: "FULL_NATIVE",
    workflowAssets: [],
  });
  assert.equal(full.profile, "FULL_NATIVE_PROJECT");
  assert.equal(full.selected, false);
  assert.equal(full.defersFullProjectOnboarding, false);
  assert.equal(full.defersBaselineSatisfaction, false);
});

test("selected baseline mapping keeps incomplete project evidence explicit and task-bound", () => {
  const policy = { selected: true, valid: true, missingRequiredAssets: [] };
  const ready = selectedNativeBaselineReadiness(policy, {
    selectedProfiles: ["web-app"],
    missingProfiles: [],
    incompatibleStarters: [],
    rawState: "BASELINE_DOCS_MISSING",
    baselineInstallationState: "READY",
    standardPackEvidenceState: "READY",
    environmentBaseline: { required: true, state: "READY" },
  });
  assert.equal(ready.ready, true);
  assert.equal(ready.state, "SELECTED_BASELINE_MAPPING_READY");
  assert.deepEqual(ready.deferredEvidence, []);

  const mappedWithDeferredEvidence = selectedNativeBaselineReadiness(policy, {
    selectedProfiles: ["web-app"],
    missingProfiles: [],
    incompatibleStarters: [],
    rawState: "BASELINE_DOCS_MISSING",
    baselineInstallationState: "READY",
    standardPackEvidenceState: "EVIDENCE_INCOMPLETE",
    environmentBaseline: { required: true, state: "INCOMPLETE" },
  });
  assert.equal(mappedWithDeferredEvidence.ready, true);
  assert.equal(mappedWithDeferredEvidence.state, "SELECTED_BASELINE_MAPPING_READY");
  assert.deepEqual(mappedWithDeferredEvidence.deferredEvidence, [
    "standard-pack evidence: EVIDENCE_INCOMPLETE",
    "environment baseline: INCOMPLETE",
  ]);

  for (const broken of [
    { rawState: "PROFILE_INVALID" },
    { baselineInstallationState: "INCOMPLETE" },
  ]) {
    const result = selectedNativeBaselineReadiness(policy, {
      selectedProfiles: ["web-app"],
      missingProfiles: [],
      incompatibleStarters: [],
      rawState: "BASELINE_DOCS_MISSING",
      baselineInstallationState: "READY",
      standardPackEvidenceState: "READY",
      environmentBaseline: { required: true, state: "READY" },
      ...broken,
    });
    assert.equal(result.ready, false, JSON.stringify(broken));
    assert.equal(result.state, "SELECTED_BASELINE_MAPPING_INCOMPLETE");
  }
});

test("selected industrial mapping defers evidence but blocks structural pack failures", () => {
  const policy = { selected: true, valid: true, missingRequiredAssets: [] };
  const deferred = selectedNativeIndustrialReadiness(policy, {
    baselineLevel: "BL2_INDUSTRIAL",
    state: "EVIDENCE_INVALID",
    selectedIndustrialPacks: ["high-risk-change-industrial", "web-app-industrial"],
    unknownPacks: [],
    plannedPacks: [],
    invalidPacks: [],
    incompatiblePacks: [],
  });
  assert.equal(deferred.ready, true);
  assert.equal(deferred.state, "SELECTED_INDUSTRIAL_MAPPING_READY");
  assert.deepEqual(deferred.deferredEvidence, ["industrial baseline evidence: EVIDENCE_INVALID"]);

  const blocked = selectedNativeIndustrialReadiness(policy, {
    baselineLevel: "BL2_INDUSTRIAL",
    state: "PACKS_INCOMPATIBLE",
    selectedIndustrialPacks: ["web-app-industrial"],
    unknownPacks: [],
    plannedPacks: [],
    invalidPacks: [],
    incompatiblePacks: ["web-app-industrial"],
  });
  assert.equal(blocked.ready, false);
  assert.equal(blocked.state, "SELECTED_INDUSTRIAL_MAPPING_INCOMPLETE");
  assert.match(blocked.reasons.join("\n"), /not structurally ready|incompatible/);

  const profileConflict = selectedNativeIndustrialReadiness(policy, {
    baselineLevel: "BL2_INDUSTRIAL",
    state: "EVIDENCE_INVALID",
    selectedIndustrialPacks: ["web-app-industrial"],
    unknownPacks: [],
    plannedPacks: [],
    invalidPacks: [],
    incompatiblePacks: [],
    profileDocuments: {
      conflict: { reason: "project profile and baseline selection differ" },
    },
  });
  assert.equal(profileConflict.ready, false);
  assert.equal(profileConflict.state, "SELECTED_INDUSTRIAL_MAPPING_INCOMPLETE");
  assert.match(profileConflict.reasons.join("\n"), /profile documents conflict/);
});

test("workflow-next preserves authoritative industrial pack-pair incompatibility", (t) => {
  const root = industrialWorkflowFixture(t, {
    profiles: ["ios-app", "web-app"],
    industrialPacks: ["ios-app-industrial", "web-app-industrial"],
  });
  const result = spawnSync(process.execPath, [path.resolve("scripts/workflow-next.mjs"), root, "--json"], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  assert.ok(result.stdout, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.industrialBaselineState, "PACKS_INCOMPATIBLE");
});

test("workflow-next preserves authoritative rejection of selecting every industrial pack", (t) => {
  const root = industrialWorkflowFixture(t, {
    profiles: ["web-app"],
    industrialPacks: ["web-app-industrial"],
  });
  const indexPath = path.join(root, ".intentos", "industrial-packs", "index.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
  index.packs = index.packs.filter((entry) => entry.id === "web-app-industrial");
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);

  const result = spawnSync(process.execPath, [path.resolve("scripts/workflow-next.mjs"), root, "--json"], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  assert.ok(result.stdout, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.industrialBaselineState, "PACKS_INVALID");
});

test("native adoption migration depth is explicit and fails closed", () => {
  assert.equal(normalizeNativeAdoptionMigrationDepth(), "READ_ONLY_DIAGNOSIS");
  assert.equal(normalizeNativeAdoptionMigrationDepth("adapter_only"), "READ_ONLY_DIAGNOSIS");
  assert.equal(normalizeNativeAdoptionMigrationDepth("docs_bridge"), "DOCS_BRIDGE");
  assert.equal(normalizeNativeAdoptionMigrationDepth("selected_assets"), "SELECTED_ASSETS");
  assert.throws(() => normalizeNativeAdoptionMigrationDepth("FULL_NATIVE"), /must be one of/);
  assert.throws(() => normalizeNativeAdoptionMigrationDepth("full-with-history"), /must be one of/);
});

test("native adoption stages never authorize a write graph before selected assets", () => {
  const reconciliation = {
    recommendation: "SELECTED_NATIVE_ADOPTION",
    reconciliationPath: "DOCS_BRIDGE_THEN_SELECTED_ASSETS",
    canRecommendApplyPlanNow: "Yes",
    scanState: "COMPLETE_ACTIONABLE_RULES",
  };
  const diagnosis = resolveNativeAdoptionStage({
    ...reconciliation,
    requestedStage: "READ_ONLY_DIAGNOSIS",
  });
  assert.equal(diagnosis.state, "READ_ONLY_DIAGNOSIS_COMPLETE");
  assert.equal(diagnosis.next_stage, "DOCS_BRIDGE");
  assert.equal(diagnosis.write_graph_allowed, "No");
  assert.deepEqual(diagnosis.required_stages, ["READ_ONLY_DIAGNOSIS", "DOCS_BRIDGE", "SELECTED_ASSETS"]);
  assert.deepEqual(diagnosis.completed_stages, ["READ_ONLY_DIAGNOSIS"]);

  const bridge = resolveNativeAdoptionStage({
    ...reconciliation,
    requestedStage: "DOCS_BRIDGE",
  });
  assert.equal(bridge.state, "READY_FOR_SELECTED_ASSETS");
  assert.equal(bridge.next_stage, "SELECTED_ASSETS");
  assert.equal(bridge.write_graph_allowed, "No");
  assert.deepEqual(bridge.completed_stages, ["READ_ONLY_DIAGNOSIS", "DOCS_BRIDGE"]);

  const selected = resolveNativeAdoptionStage({
    ...reconciliation,
    requestedStage: "SELECTED_ASSETS",
  });
  assert.equal(selected.state, "SELECTED_ASSETS_READY");
  assert.equal(selected.write_graph_allowed, "Yes");
  assert.deepEqual(selected.completed_stages, ["READ_ONLY_DIAGNOSIS", "DOCS_BRIDGE"]);
  assert.deepEqual(selected.transition_evidence, {
    scan_state: "COMPLETE_ACTIONABLE_RULES",
    recommendation: "SELECTED_NATIVE_ADOPTION",
    reconciliation_path: "DOCS_BRIDGE_THEN_SELECTED_ASSETS",
    can_recommend_apply_plan_now: "Yes",
    profile_reconciliation_state: "NOT_EVALUATED",
    governance_backlog_state: "NOT_EVALUATED",
  });
});

test("native adoption authorizes only the pending additive profile section at docs bridge", () => {
  const reconciliation = {
    recommendation: "SELECTED_NATIVE_ADOPTION",
    reconciliationPath: "DOCS_BRIDGE_THEN_SELECTED_ASSETS",
    canRecommendApplyPlanNow: "Yes",
    scanState: "COMPLETE_ACTIONABLE_RULES",
  };
  const pending = resolveNativeAdoptionStage({
    ...reconciliation,
    requestedStage: "DOCS_BRIDGE",
    profileReconciliationState: "ADDITIVE_RECONCILIATION_REQUIRED",
  });
  assert.equal(pending.state, "DOCS_BRIDGE_READY");
  assert.equal(pending.next_stage, "DOCS_BRIDGE");
  assert.equal(pending.write_graph_allowed, "Yes");
  assert.equal(pending.selected_assets_eligible, "No");
  assert.deepEqual(pending.completed_stages, ["READ_ONLY_DIAGNOSIS"]);

  const current = resolveNativeAdoptionStage({
    ...reconciliation,
    requestedStage: "DOCS_BRIDGE",
    profileReconciliationState: "CURRENT",
  });
  assert.equal(current.state, "READY_FOR_SELECTED_ASSETS");
  assert.equal(current.next_stage, "SELECTED_ASSETS");
  assert.equal(current.write_graph_allowed, "No");
  assert.deepEqual(current.completed_stages, ["READ_ONLY_DIAGNOSIS", "DOCS_BRIDGE"]);

  const ruleDecisionsPending = resolveNativeAdoptionStage({
    requestedStage: "DOCS_BRIDGE",
    recommendation: "BLOCKED_NEEDS_OWNER",
    reconciliationPath: "READ_ONLY_DIAGNOSIS",
    canRecommendApplyPlanNow: "No",
    scanState: "INCOMPLETE_RULE_SCAN",
    profileReconciliationState: "ADDITIVE_RECONCILIATION_REQUIRED",
  });
  assert.equal(ruleDecisionsPending.state, "DOCS_BRIDGE_READY");
  assert.equal(ruleDecisionsPending.write_graph_allowed, "Yes");
  assert.equal(ruleDecisionsPending.next_stage, "DOCS_BRIDGE");
  assert.deepEqual(ruleDecisionsPending.blockers, []);
});

test("a current exact governance backlog does not block selected operational assets", () => {
  const selected = resolveNativeAdoptionStage({
    requestedStage: "SELECTED_ASSETS",
    recommendation: "BLOCKED_NEEDS_OWNER",
    reconciliationPath: "READ_ONLY_DIAGNOSIS",
    canRecommendApplyPlanNow: "No",
    scanState: "INCOMPLETE_RULE_SCAN",
    profileReconciliationState: "CURRENT",
    governanceBacklogState: "BOUNDED_NON_BLOCKING",
  });

  assert.equal(selected.state, "SELECTED_ASSETS_READY");
  assert.equal(selected.write_graph_allowed, "Yes");
  assert.equal(selected.selected_assets_eligible, "Yes");
  assert.deepEqual(selected.blockers, []);
  assert.deepEqual(selected.required_stages, ["READ_ONLY_DIAGNOSIS", "SELECTED_ASSETS"]);
});

test("existing-project default and incomplete docs-bridge plans are diagnostic-only", (t) => {
  const root = projectFixture(t);
  const options = {
    starter: "generic-project",
    goal: "adopt this governed project while preserving project release authority",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
    createdAt: "2030-01-01T00:00:00.000Z",
  };
  const diagnosis = buildPlan(root, options);
  assert.equal(diagnosis.arguments.migrationDepth, "READ_ONLY_DIAGNOSIS");
  assert.equal(diagnosis.adoptionAssessment.assessment_state, "READ_ONLY_DIAGNOSIS_COMPLETE");
  assert.equal(diagnosis.adoptionAssessment.adoption_stage.requested_stage, "READ_ONLY_DIAGNOSIS");
  assert.equal(diagnosis.adoptionAssessment.adoption_stage.write_graph_allowed, "No");
  assert.equal(diagnosis.executionState, "DIAGNOSTIC_ONLY");
  assert.equal(diagnosis.actions.some((action) => action.willWrite), false);

  const bridge = buildPlan(root, { ...options, migrationDepth: "DOCS_BRIDGE" });
  assert.equal(bridge.arguments.migrationDepth, "DOCS_BRIDGE");
  assert.equal(bridge.adoptionAssessment.assessment_state, "BLOCKED");
  assert.equal(bridge.adoptionAssessment.adoption_stage.requested_stage, "DOCS_BRIDGE");
  assert.equal(bridge.adoptionAssessment.adoption_stage.write_graph_allowed, "No");
  assert.equal(bridge.executionState, "DIAGNOSTIC_ONLY");
  assert.equal(bridge.actions.some((action) => action.willWrite), false);
});

test("existing-project full-native adoption is rejected before an action graph is built", (t) => {
  const root = projectFixture(t, { governed: false });
  assert.throws(() => buildPlan(root, {
    starter: "generic-project",
    goal: "adopt this existing project with IntentOS",
    migrationDepth: "FULL_NATIVE",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
  }), /must be one of: READ_ONLY_DIAGNOSIS, DOCS_BRIDGE, SELECTED_ASSETS/);
  assert.equal(fs.existsSync(path.join(root, ".intentos")), false);
});

test("selected adoption writes have a capability classification", () => {
  assert.equal(nativeAdoptionActionCapability("AGENTS.md"), "PROJECT_ENTRY");
  assert.equal(nativeAdoptionActionCapability("scripts/workflow-next.mjs"), "OPERATING_RUNTIME");
  assert.equal(nativeAdoptionActionCapability("requests/001-current.md"), "CURRENT_REQUEST_BRIDGE");
  assert.equal(nativeAdoptionActionCapability("docs/project-onboarding.md"), "PROJECT_MAPPING");
  assert.equal(nativeAdoptionActionCapability("src/business.mjs"), "UNCLASSIFIED");
});

test("selected native governance advertises only the installed local entry contract", () => {
  const appendix = selectedAgentGovernanceAppendix();
  for (const marker of requiredAgentGovernanceMarkers) assert.ok(appendix.includes(marker), marker);
  assert.match(appendix, /node scripts\/workflow-next\.mjs/);
  assert.match(appendix, /workflowAssets/);
  assert.doesNotMatch(appendix, /node scripts\/cli\.mjs/);
  assert.doesNotMatch(appendix, /\.intentos\/(?:checklists|docs|prompts|templates)\//);
});

test("ready selected overlay excludes historical task takeover and binds every write to reconciliation", (t) => {
  const root = projectFixture(t, { historicalTasks: 12 });
  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: "adopt this governed project while preserving project release authority",
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
    createdAt: "2030-01-01T00:00:00.000Z",
  });
  const writes = plan.actions.filter((action) => action.willWrite);
  assert.equal(plan.adoptionAssessment.assessment_state, "READY_FOR_REQUEST_BOUND_NATIVE_ADOPTION");
  assert.equal(plan.arguments.migrationDepth, "SELECTED_ASSETS");
  assert.equal(plan.arguments.historicalTaskMigration, "NOT_REQUESTED");
  assert.equal(plan.adoptionAssessment.historical_task_migration.scans_existing_task_history, "No");
  assert.ok(writes.length > 0 && writes.length < 500, `unexpected selected write count: ${writes.length}`);
  assert.equal(writes.some((action) => /^(?:tasks|task-archive|work-queue-takeover-reports)\//.test(action.path || "")), false);
  assert.equal(writes.some((action) => String(action.path || "").startsWith(".github/")), false);
  assert.equal(writes.filter((action) => /^(?:requests|work-queue)\//.test(action.path || "")).length, 2);
  for (const deferred of [
    "docs/project-onboarding.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
    "docs/engineering-baseline.md",
    "docs/verification-matrix.md",
  ]) {
    assert.equal(writes.some((action) => action.path === deferred), false, deferred);
  }
  for (const selectedMapping of [
    "docs/project-profile.md",
    "docs/baseline-selection.md",
    "docs/baseline-evidence.md",
    "docs/environment-baseline.md",
  ]) {
    assert.equal(writes.some((action) => action.path === selectedMapping), true, selectedMapping);
  }
  for (const action of writes) {
    assert.notEqual(action.capability, "UNCLASSIFIED", action.path);
    assert.equal(action.selectionEvidence, plan.adoptionAssessment.assessment_digest, action.path);
  }
});

test("ready selected overlay authorizes only the canonical missing AGENTS entry", (t) => {
  const root = projectFixture(t, { governed: false });
  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: "adopt this lightweight existing project under IntentOS",
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
    createdAt: "2030-01-01T00:00:00.000Z",
  });
  assert.equal(plan.adoptionAssessment.assessment_state, "READY_FOR_REQUEST_BOUND_NATIVE_ADOPTION");
  assert.equal(plan.executionState, "EXECUTABLE");
  assert.equal(plan.candidateStaticActivationPreflight.state, "READY");
  assert.equal(plan.candidateStaticActivationPreflight.guidance.state, "CURRENT");
  assert.equal(plan.candidateStaticActivationPreflight.runtime_identity.state, "READY");
  assert.equal(plan.candidateStaticActivationPreflight.operational_policy.state, "READY");
  const agent = plan.actions.find((action) => action.path === "AGENTS.md" && action.willWrite);
  assert.equal(agent?.type, "CREATE");
  assert.equal(agent?.capability, "PROJECT_ENTRY");
  assert.equal(agent?.selectionEvidence, plan.adoptionAssessment.assessment_digest);
  assert.equal(
    Buffer.from(agent.inlineContentBase64, "base64").toString("utf8"),
    `${selectedAgentGovernanceAppendix().trim()}\n`,
  );
  assert.deepEqual(validateRequestBoundLocalActionGraph(plan), []);

  const tampered = structuredClone(plan);
  const tamperedAgent = tampered.actions.find((action) => action.path === "AGENTS.md" && action.willWrite);
  tamperedAgent.inlineContentBase64 = Buffer.from("# Untrusted replacement\n").toString("base64");
  assert.match(validateRequestBoundLocalActionGraph(tampered).join("\n"), /outside request-bound local authority: AGENTS\.md/);

  const candidateConflict = structuredClone(plan);
  const managedGuidance = candidateConflict.actions.find((action) => action.path === ".intentos/core/project-onboarding.md");
  assert.ok(managedGuidance?.willWrite);
  const conflictContent = "用户必须确认技术基线。\n";
  const conflictDigest = `sha256:${createHash("sha256").update(conflictContent).digest("hex")}`;
  managedGuidance.source = null;
  managedGuidance.inlineContentBase64 = Buffer.from(conflictContent).toString("base64");
  managedGuidance.sourceHash = conflictDigest;
  managedGuidance.expectedHashAfter = conflictDigest;
  const blockedCandidate = buildCandidateStaticActivationPreflight(candidateConflict);
  assert.equal(blockedCandidate.state, "BLOCKED");
  assert.ok(blockedCandidate.invalid_nodes.some((item) => item.path === managedGuidance.path));

  const runtimeConflict = structuredClone(plan);
  const versionAction = runtimeConflict.actions.find((action) => action.path === ".intentos/version.json");
  const versionRecord = JSON.parse(Buffer.from(versionAction.inlineContentBase64, "base64").toString("utf8"));
  delete versionRecord.managedAssetDigests["scripts/workflow-next.mjs"];
  const versionContent = `${JSON.stringify(versionRecord, null, 2)}\n`;
  const versionDigest = `sha256:${createHash("sha256").update(versionContent).digest("hex")}`;
  versionAction.inlineContentBase64 = Buffer.from(versionContent).toString("base64");
  versionAction.sourceHash = versionDigest;
  versionAction.expectedHashAfter = versionDigest;
  const blockedRuntime = buildCandidateStaticActivationPreflight(runtimeConflict);
  assert.equal(blockedRuntime.state, "BLOCKED");
  assert.equal(blockedRuntime.runtime_identity.state, "BLOCKED");
  assert.ok(blockedRuntime.runtime_identity.errors.includes("WORKFLOW_NEXT_MANAGED_DIGEST_MISMATCH"));
});

test("blocked selected adoption emits a compact zero-write diagnostic graph", (t) => {
  const root = projectFixture(t, { governed: false, historicalTasks: 8 });
  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: "adopt this project without changing historical tasks",
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
    createdAt: "2030-01-01T00:00:00.000Z",
  });
  assert.equal(plan.adoptionAssessment.assessment_state, "BLOCKED");
  assert.equal(plan.executionState, "DIAGNOSTIC_ONLY");
  assert.equal(plan.actions.length, 1);
  assert.equal(plan.actions.some((action) => action.willWrite), false);
  assert.equal(JSON.stringify(plan).includes("work_queue_takeover"), false);
  assert.equal(JSON.stringify(plan).includes("Task001"), false);
});

test("profileless selected adoption stops at technical discovery before apply", (t) => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "intentos-profile-discovery-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const legacyAuthority = "# Existing project authority\n\nKeep the project-native verification gate.\n";
  fs.writeFileSync(path.join(root, ".agent.md"), legacyAuthority);

  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: "adopt this existing project with IntentOS",
    migrationDepth: "SELECTED_ASSETS",
  });
  assert.equal(plan.adoptionAssessment.rule_reconciliation.coverage.scanState, "COMPLETE_NO_ACTIONABLE_RULES");
  assert.equal(plan.adoptionAssessment.profile_mapping.state, "TECHNICAL_DISCOVERY_REQUIRED");
  assert.equal(plan.adoptionAssessment.profile_mapping.next_action, "RUN_TECHNICAL_DISCOVERY");
  assert.match(plan.adoptionAssessment.blockers.join("\n"), /derives? a project profile and baseline level/);
  assert.equal(plan.executionState, "DIAGNOSTIC_ONLY");
  assert.equal(plan.actions.some((action) => action.willWrite), false);

  const planDir = path.join(root, "apply-execution-plans");
  fs.mkdirSync(planDir);
  const planFile = path.join(planDir, "profileless.json");
  fs.writeFileSync(planFile, `${JSON.stringify(plan, null, 2)}\n`);
  const applied = spawnSync(process.execPath, [
    "scripts/init-project.mjs",
    "--apply-plan", planFile,
    "--goal", plan.arguments.goal,
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: 30_000,
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.notEqual(applied.status, 0, applied.stdout);
  assert.match(`${applied.stdout}\n${applied.stderr}`, /diagnostic plan cannot be applied/);
  assert.equal(fs.readFileSync(path.join(root, ".agent.md"), "utf8"), legacyAuthority);
  assert.equal(fs.existsSync(path.join(root, "AGENTS.md")), false);
  assert.equal(fs.existsSync(path.join(root, ".intentos")), false);
});

test("an exact project-bound governance backlog permits operational adoption without resolving project semantics", (t) => {
  const root = projectFixture(t, { governed: false });
  const existingPackage = fs.readFileSync(path.join(root, "package.json"), "utf8");
  const existingAgentRules = "# Agent Rules\n\nRun tests before review.\n";
  fs.writeFileSync(path.join(root, "AGENTS.md"), existingAgentRules);
  fs.mkdirSync(path.join(root, "docs"));
  const existingGovernance = [
    "# Governance",
    "",
    "This descriptive context has no classified authority yet.",
    "",
    "```text",
    "node scripts/workflow-next.mjs .",
    "```",
    "",
    "Run tests before review.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(root, "docs", "Governance.md"), existingGovernance);

  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: "adopt this project under IntentOS",
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
  });
  assert.equal(plan.adoptionAssessment.assessment_state, "READY_FOR_REQUEST_BOUND_NATIVE_ADOPTION");
  assert.equal(plan.adoptionAssessment.rule_reconciliation.coverage.scanState, "INCOMPLETE_RULE_SCAN");
  assert.equal(plan.adoptionAssessment.governance_backlog.state, "BOUNDED_NON_BLOCKING");
  assert.equal(plan.adoptionAssessment.governance_backlog.blocks_operation, "No");
  assert.ok(plan.adoptionAssessment.governance_backlog.backlog_count > 0);
  assert.deepEqual(plan.adoptionAssessment.blockers, []);
  assert.equal(plan.executionState, "EXECUTABLE");
  assert.equal(plan.actions.some((action) => action.willWrite), true);
  assert.equal(plan.actions.some((action) => action.path === "docs/Governance.md" && action.willWrite), false);
  const agentAction = plan.actions.find((action) => action.path === "AGENTS.md");
  assert.equal(agentAction.type, "RECONCILE_PRESERVE");
  assert.equal(agentAction.willWrite, true);
  assert.ok(Buffer.from(agentAction.inlineContentBase64, "base64").toString("utf8").startsWith(existingAgentRules));
  assert.equal(plan.adoptionAssessment.native_rule_decision_work_packet.decision_policy.may_authorize_apply, "No");

  const planRelative = "apply-execution-plans/governance-backlog.json";
  fs.mkdirSync(path.join(root, "apply-execution-plans"));
  fs.writeFileSync(path.join(root, planRelative), `${JSON.stringify(plan, null, 2)}\n`);
  const applied = spawnSync(process.execPath, [
    "scripts/init-project.mjs",
    "--apply-plan", path.join(root, planRelative),
    "--goal", plan.arguments.goal,
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    timeout: 300_000,
  });
  assert.equal(applied.status, 0, applied.stderr || applied.stdout);
  assert.equal(validateVerifiedApplyReceiptFile(root, plan.receiptPath).ok, true);
  assert.match(fs.readFileSync(path.join(root, plan.receiptPath), "utf8"), /APPLY_VERIFIED/);

  const runWorkflowNext = () => spawnSync(process.execPath, [
    path.join(root, "scripts", "workflow-next.mjs"),
    root,
    "--json",
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  const firstColdStart = runWorkflowNext();
  assert.equal(firstColdStart.status, 0, firstColdStart.stderr || firstColdStart.stdout);
  const firstState = JSON.parse(firstColdStart.stdout);
  assert.equal(firstState.projectEntryTrust.entry_state, "READY_FOR_INTENTOS_OPERATION");
  assert.equal(firstState.versionState, "CURRENT");

  const secondColdStart = runWorkflowNext();
  assert.equal(secondColdStart.status, 0, secondColdStart.stderr || secondColdStart.stdout);
  assert.equal(secondColdStart.stdout, firstColdStart.stdout);

  assert.equal(fs.readFileSync(path.join(root, "package.json"), "utf8"), existingPackage);
  assert.equal(fs.readFileSync(path.join(root, "docs", "Governance.md"), "utf8"), existingGovernance);
  assert.ok(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8").startsWith(existingAgentRules));
});

test("selected BL2 overlay controlled apply defers evidence without changing historical task files", (t) => {
  const outer = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "intentos-native-overlay-apply-")));
  const root = path.join(outer, "project");
  fs.mkdirSync(root);
  t.after(() => fs.rmSync(outer, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({
    name: "native-overlay-apply-fixture",
    scripts: { test: "node --test", build: "node build.mjs" },
  }, null, 2)}\n`);
  fs.mkdirSync(path.join(root, "docs"));
  fs.writeFileSync(path.join(root, "docs", "release.md"), "# Release and rollback\n\nPreserve release, rollback, and production controls.\n");
  fs.mkdirSync(path.join(root, "tasks"));
  const historical = new Map();
  for (let index = 1; index <= 8; index += 1) {
    const relative = `tasks/Task${String(index).padStart(3, "0")}.md`;
    const content = `# Historical task ${index}\n\nStatus: done\n`;
    fs.writeFileSync(path.join(root, relative), content);
    historical.set(relative, content);
  }
  fs.mkdirSync(path.join(root, "src"));
  fs.writeFileSync(path.join(root, "src", "current-work.ts"), "export const currentWork = 1;\n");
  for (const args of [
    ["init", "-q"],
    ["add", "."],
    ["-c", "user.name=IntentOS Tests", "-c", "user.email=intentos@example.invalid", "commit", "-qm", "fixture"],
  ]) {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  }
  const dirtyBusiness = new Map([
    ["src/current-work.ts", "export const currentWork = 2;\n"],
    ["src/untracked-work.ts", "export const untrackedWork = true;\n"],
  ]);
  for (const [relative, content] of dirtyBusiness) fs.writeFileSync(path.join(root, relative), content);

  const goal = "adopt this governed project while preserving project release authority";
  const selectedProfiles = "web-app,high-risk-change";
  const selectedIndustrialPacks = "web-app-industrial,high-risk-change-industrial";
  const plan = buildPlan(root, {
    starter: "generic-project",
    goal,
    migrationDepth: "SELECTED_ASSETS",
    profiles: selectedProfiles,
    baselineLevel: "BL2_INDUSTRIAL",
    industrialPacks: selectedIndustrialPacks,
  });
  assert.equal(plan.arguments.industrialPacks, "high-risk-change-industrial,web-app-industrial");
  assert.equal(plan.targetFingerprint.isDirty, true);
  assert.equal(plan.candidateStaticActivationPreflight.dirty_activation.state, "READY");
  assert.equal(plan.candidateStaticActivationPreflight.dirty_activation.mode, "NATIVE_ADOPTION_ZERO_OVERLAP");
  const planRelative = "apply-execution-plans/selected-native.json";
  fs.mkdirSync(path.join(root, "apply-execution-plans"));
  fs.writeFileSync(path.join(root, planRelative), `${JSON.stringify(plan, null, 2)}\n`);
  const applied = spawnSync(process.execPath, [
    "scripts/init-project.mjs",
    "--apply-plan", path.join(root, planRelative),
    "--goal", goal,
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    timeout: 300_000,
  });
  assert.equal(applied.status, 0, applied.stderr || applied.stdout);
  const version = JSON.parse(fs.readFileSync(path.join(root, ".intentos", "version.json"), "utf8"));
  assert.equal(version.assetMigrationDepth, "SELECTED_ASSETS");
  assert.ok(version.workflowAssets.length > 0 && version.workflowAssets.length < 500);
  assert.equal(version.initialTaskIntake.state, "REQUEST_BOUND_INITIAL_TASK");
  assert.equal(version.initialTaskIntake.intent, goal);
  const initialIntake = resolveVerifiedInitialTaskIntakeProof({ targetRoot: root });
  assert.equal(initialIntake.state, "VERIFIED");
  assert.equal(initialIntake.request_bound_proof.intent, goal);
  const strictWithoutIntake = verifyProjectLocalBehavioralRoute({
    targetRoot: root,
    sourceRoot: process.cwd(),
    goal: "refresh installed IntentOS assets",
    allowProjectLocalExecution: true,
  });
  assert.equal(strictWithoutIntake.state, "BLOCKED");
  const maintenanceWithoutIntake = verifyProjectLocalBehavioralRoute({
    targetRoot: root,
    sourceRoot: process.cwd(),
    goal: "refresh installed IntentOS assets",
    allowProjectLocalExecution: true,
    activationMode: "CONTROLLED_UPDATE_MAINTENANCE",
  });
  assert.equal(maintenanceWithoutIntake.state, "MAINTENANCE_VERIFIED");
  assert.equal(maintenanceWithoutIntake.routeCalibration.state, "ROUTE_VERIFIED");
  assert.equal(maintenanceWithoutIntake.workQueueTakeover.state, "BLOCKED");
  const firstReceiptFile = path.join(root, plan.receiptPath);
  const firstReceiptContent = fs.readFileSync(firstReceiptFile, "utf8");
  fs.writeFileSync(firstReceiptFile, firstReceiptContent.replaceAll("APPLY_VERIFIED", "APPLY_FAILED_NO_WRITE"));
  assert.equal(resolveVerifiedInitialTaskIntakeProof({ targetRoot: root }).state, "BLOCKED");
  fs.writeFileSync(firstReceiptFile, firstReceiptContent);
  const updatePlan = buildPlan(root, {
    starter: "generic-project",
    update: true,
    goal,
    profiles: selectedProfiles,
    baselineLevel: "BL2_INDUSTRIAL",
    industrialPacks: selectedIndustrialPacks,
  });
  assert.equal(updatePlan.operationKind, "CONTROLLED_UPDATE");
  assert.equal(updatePlan.arguments.migrationDepth, "SELECTED_ASSETS");
  assert.equal(updatePlan.candidateStaticActivationPreflight.state, "READY");
  assert.equal(
    updatePlan.candidateStaticActivationPreflight.dirty_activation.mode,
    "CONTROLLED_UPDATE_VERIFIED_PRIOR_OVERLAP",
  );
  const updateVersionAction = updatePlan.actions.find((action) => action.path === ".intentos/version.json");
  const updateVersion = JSON.parse(Buffer.from(updateVersionAction.inlineContentBase64, "base64").toString("utf8"));
  assert.equal(updateVersion.assetMigrationDepth, "SELECTED_ASSETS");
  assert.ok(updateVersion.workflowAssets.length > 0 && updateVersion.workflowAssets.length < 500);
  assert.equal(updatePlan.actions.some((action) => action.path === ".github/pull_request_template.md"), false);
  assert.equal(updateVersion.workflowAssets.includes(".github/pull_request_template.md"), false);
  for (const action of updatePlan.actions.filter((entry) => entry.type === "HUMAN_ONLY")) {
    assert.equal(updateVersion.workflowAssets.includes(action.path), false, action.path);
  }
  for (const deferred of [
    "docs/project-onboarding.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
  ]) {
    assert.equal(updatePlan.actions.some((action) => action.path === deferred && action.willWrite), false, deferred);
  }
  assert.equal(
    fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"),
    `${selectedAgentGovernanceAppendix().trim()}\n`,
  );
  assert.equal(fs.readdirSync(path.join(root, "apply-receipts")).filter((name) => name.endsWith(".md")).length, 1);
  const next = spawnSync(process.execPath, [path.join(root, "scripts", "workflow-next.mjs"), root, "--json"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  assert.equal(next.status, 0, next.stderr || next.stdout);
  const state = JSON.parse(next.stdout);
  assert.equal(state.versionState, "CURRENT");
  assert.equal(state.operationalProfile, "SELECTED_EXISTING_PROJECT");
  assert.equal(state.onboardingState, "SELECTED_PROJECT_MAPPING_READY");
  assert.equal(state.platformBaselineState, "SELECTED_BASELINE_MAPPING_READY");
  assert.equal(state.industrialBaselineState, "EVIDENCE_MISSING");
  assert.equal(state.nextAction, "REVIEW_DIRTY_WORKTREE");
  assert.ok(state.deferredProjectDocs.includes("docs/product-vision.md"));
  assert.ok(state.deferredBaselineEvidence.includes("standard-pack evidence: EVIDENCE_INCOMPLETE"));
  assert.ok(state.deferredBaselineEvidence.includes("industrial baseline evidence: EVIDENCE_MISSING"));
  assert.doesNotMatch(state.suggestedCommand, /project-onboarding-agent|check-project-onboarding|check-platform-baseline/);
  for (const deferred of [
    "docs/project-onboarding.md",
    "docs/tech-stack-strategy.md",
    "docs/business-spec-index.md",
    "docs/sample-policy.md",
    "docs/onboarding-decisions.md",
  ]) {
    assert.equal(fs.existsSync(path.join(root, deferred)), false, deferred);
  }
  for (const [relative, content] of historical) {
    assert.equal(fs.readFileSync(path.join(root, relative), "utf8"), content, relative);
  }
  for (const [relative, content] of dirtyBusiness) {
    assert.equal(fs.readFileSync(path.join(root, relative), "utf8"), content, relative);
  }

  const updatePlanRelative = "apply-execution-plans/selected-update.json";
  fs.writeFileSync(path.join(root, updatePlanRelative), `${JSON.stringify(updatePlan, null, 2)}\n`);
  const updated = spawnSync(process.execPath, [
    "scripts/init-project.mjs",
    "--apply-plan", path.join(root, updatePlanRelative),
    "--goal", goal,
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    timeout: 300_000,
  });
  assert.equal(updated.status, 0, updated.stderr || updated.stdout);
  assert.equal(fs.readdirSync(path.join(root, "apply-receipts")).filter((name) => name.endsWith(".md")).length, 2);
  assert.equal(validateVerifiedApplyReceiptFile(root, plan.receiptPath).ok, false);
  assert.equal(validateHistoricalVerifiedApplyReceiptFile(root, plan.receiptPath).ok, true);
  const persistedInitialIntake = resolveVerifiedInitialTaskIntakeProof({ targetRoot: root });
  assert.equal(persistedInitialIntake.state, "VERIFIED");
  assert.equal(persistedInitialIntake.request_bound_proof.intent, goal);
  assert.equal(persistedInitialIntake.receipt_ref, updatePlan.receiptPath);
  const postUpdateNext = spawnSync(process.execPath, [path.join(root, "scripts", "workflow-next.mjs"), root, "--json"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  assert.equal(postUpdateNext.status, 0, postUpdateNext.stderr || postUpdateNext.stdout);
  const postUpdateState = JSON.parse(postUpdateNext.stdout);
  assert.equal(postUpdateState.versionState, "CURRENT");
  assert.equal(postUpdateState.workflowState, "BOOTSTRAPPED");
  assert.equal(postUpdateState.missingWorkflowAssets.includes(".github/pull_request_template.md"), false);
  assert.equal(postUpdateState.nextAction, "REVIEW_DIRTY_WORKTREE");

  const secondUpdatePlan = buildPlan(root, {
    starter: "generic-project",
    update: true,
    goal: "perform another controlled workflow refresh without changing project work",
    profiles: selectedProfiles,
    baselineLevel: "BL2_INDUSTRIAL",
    industrialPacks: selectedIndustrialPacks,
  });
  assert.equal(secondUpdatePlan.operationKind, "CONTROLLED_UPDATE");
  const secondUpdatePlanRelative = "apply-execution-plans/selected-update-second.json";
  fs.writeFileSync(path.join(root, secondUpdatePlanRelative), `${JSON.stringify(secondUpdatePlan, null, 2)}\n`);
  const secondUpdated = spawnSync(process.execPath, [
    "scripts/init-project.mjs",
    "--apply-plan", path.join(root, secondUpdatePlanRelative),
    "--goal", secondUpdatePlan.arguments.goal,
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    timeout: 300_000,
  });
  assert.equal(secondUpdated.status, 0, secondUpdated.stderr || secondUpdated.stdout);
  assert.equal(fs.readdirSync(path.join(root, "apply-receipts")).filter((name) => name.endsWith(".md")).length, 3);
  const twiceUpdatedInitialIntake = resolveVerifiedInitialTaskIntakeProof({ targetRoot: root });
  assert.equal(twiceUpdatedInitialIntake.state, "VERIFIED");
  assert.equal(twiceUpdatedInitialIntake.receipt_ref, secondUpdatePlan.receiptPath);
  for (const [relative, content] of historical) {
    assert.equal(fs.readFileSync(path.join(root, relative), "utf8"), content, relative);
  }
  for (const [relative, content] of dirtyBusiness) {
    assert.equal(fs.readFileSync(path.join(root, relative), "utf8"), content, relative);
  }
});

test("a clean selected project can update with retained failed apply protocol evidence", { timeout: 420_000 }, (t) => {
  const outer = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "intentos-clean-protocol-retry-")));
  const root = path.join(outer, "project");
  fs.mkdirSync(root);
  t.after(() => fs.rmSync(outer, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({
    name: "clean-protocol-retry-fixture",
    scripts: { test: "node --test", build: "node build.mjs" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "AGENTS.md"), [
    "# Project Rules",
    "",
    "- Run tests before completion.",
    "- Preserve release and rollback procedures.",
    "- Do not change production credentials.",
    "",
  ].join("\n"));
  fs.mkdirSync(path.join(root, "docs"));
  fs.writeFileSync(path.join(root, "docs", "release.md"), "# Release and rollback\n\nPreserve release, rollback, and production controls.\n");
  fs.mkdirSync(path.join(root, "src"));
  const businessPath = path.join(root, "src", "business.ts");
  const businessContent = "export const stableBusinessBehavior = true;\n";
  fs.writeFileSync(businessPath, businessContent);

  const git = (...args) => {
    const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  };
  git("init", "-q");
  git("add", ".");
  git("-c", "user.name=IntentOS Tests", "-c", "user.email=intentos@example.invalid", "commit", "-qm", "business baseline");

  const adoptionGoal = "adopt this clean project while preserving its business behavior";
  const adoptionPlan = buildPlan(root, {
    starter: "generic-project",
    goal: adoptionGoal,
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
  });
  assert.equal(adoptionPlan.executionState, "EXECUTABLE");
  assert.equal(adoptionPlan.targetFingerprint.isDirty, false);
  const adoptionPlanRelative = "apply-execution-plans/clean-adoption.json";
  fs.mkdirSync(path.join(root, "apply-execution-plans"));
  fs.writeFileSync(path.join(root, adoptionPlanRelative), `${JSON.stringify(adoptionPlan, null, 2)}\n`);
  const adopted = spawnSync(process.execPath, [
    "scripts/init-project.mjs",
    "--apply-plan", path.join(root, adoptionPlanRelative),
    "--goal", adoptionGoal,
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    timeout: 300_000,
  });
  assert.equal(adopted.status, 0, adopted.stderr || adopted.stdout);
  assert.match(fs.readFileSync(path.join(root, adoptionPlan.receiptPath), "utf8"), /APPLY_VERIFIED/);
  assert.equal(fs.readFileSync(businessPath, "utf8"), businessContent);

  git("add", ".");
  git("-c", "user.name=IntentOS Tests", "-c", "user.email=intentos@example.invalid", "commit", "-qm", "verified IntentOS adoption");
  assert.equal(gitWorktreeState(root).isDirty, false);

  const retainedPlanRelative = "apply-execution-plans/retained-failed-attempt.json";
  const retainedReceiptRelative = "apply-receipts/retained-failed-attempt.md";
  const retainedPlan = `${JSON.stringify({ outcome: "APPLY_FAILED_ROLLED_BACK", retained_for_diagnosis: true }, null, 2)}\n`;
  const retainedReceipt = [
    "# Retained Failed Apply Receipt",
    "",
    "Outcome: `APPLY_FAILED_ROLLED_BACK`",
    "",
    "This diagnostic evidence must survive a later controlled update.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(root, retainedPlanRelative), retainedPlan);
  fs.writeFileSync(path.join(root, retainedReceiptRelative), retainedReceipt);

  const rawBefore = gitWorktreeState(root);
  const sourceBefore = gitWorktreeState(root, { excludeControlledApplyProtocolArtifacts: true });
  assert.equal(rawBefore.isDirty, true);
  assert.deepEqual(rawBefore.changedPaths, [retainedPlanRelative, retainedReceiptRelative]);
  assert.equal(sourceBefore.isDirty, false);
  assert.deepEqual(sourceBefore.changedPaths, []);
  assert.deepEqual(sourceBefore.ignoredChangedPaths, [retainedPlanRelative, retainedReceiptRelative]);

  const updateGoal = "refresh IntentOS while retaining failed apply diagnostics";
  const updatePlan = buildPlan(root, {
    starter: "generic-project",
    update: true,
    goal: updateGoal,
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
  });
  assert.equal(updatePlan.operationKind, "CONTROLLED_UPDATE");
  assert.equal(updatePlan.targetFingerprint.isDirty, false);
  assert.equal(updatePlan.candidateStaticActivationPreflight.state, "READY");
  const updatePlanRelative = "apply-execution-plans/clean-update-after-failure.json";
  fs.writeFileSync(path.join(root, updatePlanRelative), `${JSON.stringify(updatePlan, null, 2)}\n`);
  const updated = spawnSync(process.execPath, [
    "scripts/init-project.mjs",
    "--apply-plan", path.join(root, updatePlanRelative),
    "--goal", updateGoal,
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    timeout: 300_000,
  });
  assert.equal(updated.status, 0, updated.stderr || updated.stdout);
  assert.match(fs.readFileSync(path.join(root, updatePlan.receiptPath), "utf8"), /APPLY_VERIFIED/);
  assert.equal(fs.readFileSync(path.join(root, retainedPlanRelative), "utf8"), retainedPlan);
  assert.equal(fs.readFileSync(path.join(root, retainedReceiptRelative), "utf8"), retainedReceipt);
  assert.equal(fs.readFileSync(businessPath, "utf8"), businessContent);

  const ordinaryNext = spawnSync(process.execPath, [path.join(root, "scripts", "workflow-next.mjs"), root, "--json"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  assert.equal(ordinaryNext.status, 0, ordinaryNext.stderr || ordinaryNext.stdout);
  const ordinaryState = JSON.parse(ordinaryNext.stdout);
  assert.equal(ordinaryState.nextAction, "REVIEW_DIRTY_WORKTREE");
  assert.equal(ordinaryState.governanceSignals.git.observedIsDirty, true);
  assert.ok(ordinaryState.governanceSignals.git.observedChangedPaths.includes(retainedPlanRelative));
  assert.ok(ordinaryState.governanceSignals.git.observedChangedPaths.includes(retainedReceiptRelative));
  assert.deepEqual(ordinaryState.governanceSignals.git.retainedProtocolArtifactChangedPaths, []);

  const sourceAfter = gitWorktreeState(root, { excludeControlledApplyProtocolArtifacts: true });
  assert.equal(sourceAfter.isDirty, true);
  assert.deepEqual(sourceAfter.changedPaths, [".intentos/version.json"]);
  fs.writeFileSync(businessPath, `${businessContent}export const userDraft = true;\n`);
  const sourceWithBusinessChange = gitWorktreeState(root, { excludeControlledApplyProtocolArtifacts: true });
  assert.equal(sourceWithBusinessChange.isDirty, true);
  assert.deepEqual(sourceWithBusinessChange.changedPaths, [".intentos/version.json", "src/business.ts"]);
});
