import assert from "node:assert/strict";
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
  selectedNativeOverlayAssets,
} from "../scripts/lib/native-adoption-overlay.mjs";
import {
  requiredAgentGovernanceMarkers,
  selectedAgentGovernanceAppendix,
} from "../scripts/init-project/assets.mjs";
import { buildPlan } from "../scripts/init-project/plan.mjs";
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
  });
});

test("existing-project default and docs-bridge plans are diagnostic-only", (t) => {
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
  assert.equal(bridge.adoptionAssessment.assessment_state, "READY_FOR_SELECTED_ASSETS");
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

test("structured reconciliation blocker becomes a diagnostic plan instead of a source failure", (t) => {
  const root = projectFixture(t, { governed: false });
  fs.writeFileSync(path.join(root, "AGENTS.md"), "# Agent Rules\n\nRun tests before review.\n");
  fs.mkdirSync(path.join(root, "docs"));
  fs.writeFileSync(path.join(root, "docs", "Governance.md"), [
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
  ].join("\n"));

  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: "adopt this project under IntentOS",
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
    createdAt: "2030-01-01T00:00:00.000Z",
  });
  assert.equal(plan.adoptionAssessment.assessment_state, "BLOCKED");
  assert.equal(plan.adoptionAssessment.rule_reconciliation.coverage.scanState, "INCOMPLETE_RULE_SCAN");
  assert.match(plan.adoptionAssessment.blockers.join("\n"), /Rule Reconciliation outcome is BLOCKED/);
  assert.equal(plan.executionState, "DIAGNOSTIC_ONLY");
  assert.equal(plan.actions.some((action) => action.willWrite), false);
});

test("selected overlay controlled apply verifies without changing historical task files", (t) => {
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

  const goal = "adopt this governed project while preserving project release authority";
  const plan = buildPlan(root, {
    starter: "generic-project",
    goal,
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
  });
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
  assert.equal(state.operationalProfile, "SELECTED_EXISTING_PROJECT");
  assert.equal(state.onboardingState, "SELECTED_PROJECT_MAPPING_READY");
  assert.equal(state.platformBaselineState, "SELECTED_BASELINE_MAPPING_READY");
  assert.equal(state.nextAction, "READY_FOR_TASK_EXECUTION");
  assert.ok(state.deferredProjectDocs.includes("docs/product-vision.md"));
  assert.ok(state.deferredBaselineEvidence.includes("standard-pack evidence: EVIDENCE_INCOMPLETE"));
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
});
