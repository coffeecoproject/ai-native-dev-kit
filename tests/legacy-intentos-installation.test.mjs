import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  inspectLegacyIntentOSInstallation,
  resolveLegacyAgentReconciliation,
  resolveLegacyManagedAssetOwnership,
} from "../scripts/lib/legacy-intentos-installation.mjs";
import { collectProjectAgentAuthority } from "../scripts/lib/project-entry-trust.mjs";
import {
  addSelectedDistributionPlanActions,
  buildPlan,
} from "../scripts/init-project/plan.mjs";
import { selectedAgentGovernanceAppendix } from "../scripts/lib/native-adoption-overlay.mjs";
import { validateRequestBoundLocalActionGraph } from "../scripts/lib/request-bound-apply-authority.mjs";

const sourceRoot = path.resolve(import.meta.dirname, "..");
const sourceRevision = "bb83080e43596ee8846fb2f1ff90092ef3a8111f";
const runtimePath = "scripts/workflow-next.mjs";
const projectPrefix = "# Project Rules\n\nKeep the project's business and release rules.\n\n";
const verifiedLegacySuffix = [
  "# AI Native Workflow Governance Appendix",
  "",
  "## Core Rules",
  "",
  "1. Perform preflight before coding when the request is vague, large, cross-module, or high-risk.",
  "2. Every non-trivial change must have acceptance criteria before implementation.",
  "3. Prefer vertical slices over broad rewrites.",
  "4. Keep changes minimal and scoped.",
  "5. Do not add production dependencies without explicit approval.",
  "6. Do not modify auth, permission, migration, production config, secrets, high-risk, safety-critical, or security-sensitive logic without a risk report and explicit approval.",
  "7. Every implementation must include tests or explain why tests are not applicable.",
  "8. If the same verification failure repeats twice, stop and report instead of blindly retrying.",
  "9. After implementation, produce a final report with changed files, tests run, remaining risks, and next step.",
  "",
].join("\n");
const ambiguousLegacyProjectOnboardingSection = [
  "## Project Onboarding",
  "",
  "Before the first non-trivial implementation, run project onboarding.",
  "",
  "Use `.ai-native/prompts/project-onboarding-agent.md` and `.ai-native/core/project-onboarding.md` to draft project onboarding docs. AI drafts; humans decide.",
  "",
  "Run:",
  "",
  "```bash",
  "node scripts/check-project-onboarding.mjs .",
  "node scripts/check-project-onboarding.mjs . --strict",
  "```",
  "",
].join("\n");

function historicalFile(relativePath) {
  const result = spawnSync("git", ["-C", sourceRoot, "show", `${sourceRevision}:${relativePath}`], {
    encoding: null,
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr?.toString("utf8"));
  return result.stdout;
}

function legacyFixture(t, options = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "intentos-legacy-installation-")));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, ".ai-native", "migration-reports"), { recursive: true });
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  fs.writeFileSync(path.join(root, ".ai-native", "dev-kit-manifest.json"), historicalFile("dev-kit-manifest.json"));
  fs.writeFileSync(path.join(root, ".ai-native", "version.json"), `${JSON.stringify({
    devKitVersion: "1.8.1",
    workflowAssets: [
      ".ai-native/dev-kit-manifest.json",
      "AGENTS.md",
      runtimePath,
    ],
  }, null, 2)}\n`);
  if (options.generatedAgent !== true) {
    fs.writeFileSync(path.join(root, ".ai-native", "migration-reports", "agents-governance.md"), [
      "# Migration Report: AGENTS.md Governance",
      "",
      "Status: APPLIED",
      "Dev kit version: 1.8.1",
      "",
    ].join("\n"));
  }
  fs.writeFileSync(path.join(root, runtimePath), historicalFile(runtimePath));
  if (options.generatedAgent === true) {
    fs.writeFileSync(path.join(root, "AGENTS.md"), historicalFile("platforms/codex/AGENTS.template.md"));
  } else {
    const suffix = options.includeAmbiguousProjectOnboarding === true
      ? `${verifiedLegacySuffix}${ambiguousLegacyProjectOnboardingSection}`
      : verifiedLegacySuffix;
    fs.writeFileSync(path.join(root, "AGENTS.md"), `${projectPrefix}${suffix}`);
  }
  return root;
}

test("legacy 1.8.1 ownership accepts only the exact historical installation", (t) => {
  const root = legacyFixture(t);
  const installation = inspectLegacyIntentOSInstallation(root, sourceRoot);
  assert.equal(installation.state, "VERIFIED");
  assert.equal(installation.legacyVersion, "1.8.1");
  assert.equal(installation.sourceRevision, sourceRevision);
  assert.match(installation.versionRecordDigest, /^sha256:[a-f0-9]{64}$/);

  const ownership = resolveLegacyManagedAssetOwnership(root, sourceRoot, runtimePath, null, installation);
  assert.equal(ownership.state, "VERIFIED_LEGACY_INTENTOS_MANAGED");
  assert.equal(ownership.source_revision, sourceRevision);
  assert.equal(ownership.source_path, runtimePath);

  fs.appendFileSync(path.join(root, runtimePath), "\n// project drift\n");
  assert.equal(
    resolveLegacyManagedAssetOwnership(root, sourceRoot, runtimePath).state,
    "UNPROVEN_PROJECT_OWNED",
  );
});

test("selected adoption updates an exact legacy runtime without enabling generic overwrite", (t) => {
  const root = legacyFixture(t);
  const actions = [];
  addSelectedDistributionPlanActions(actions, root, { update: false });
  const runtime = actions.find((action) => action.path === runtimePath);
  assert.equal(runtime.type, "UPDATE_MANAGED");
  assert.equal(runtime.willWrite, true);
  assert.equal(runtime.ownership.state, "VERIFIED_LEGACY_INTENTOS_MANAGED");

  fs.appendFileSync(path.join(root, runtimePath), "\n// project-owned divergence\n");
  const driftedActions = [];
  addSelectedDistributionPlanActions(driftedActions, root, { update: false });
  const driftedRuntime = driftedActions.find((action) => action.path === runtimePath);
  assert.equal(driftedRuntime.type, "SKIP_EXISTING");
  assert.equal(driftedRuntime.willWrite, false);
  assert.equal(driftedRuntime.ownership.state, "UNPROVEN_PROJECT_OWNED");
});

test("legacy AGENTS reconciliation preserves the project prefix and fails closed on suffix drift", (t) => {
  const root = legacyFixture(t);
  const reconciliation = resolveLegacyAgentReconciliation(root, sourceRoot);
  assert.equal(reconciliation.state, "VERIFIED_LEGACY_AGENT_SUFFIX");
  assert.equal(reconciliation.projectPrefix, projectPrefix);
  assert.equal(reconciliation.sections.length, 1);
  assert.equal(reconciliation.sections[0].name, "Core Rules");
  const nativeAuthority = collectProjectAgentAuthority(root, { sourceRoot });
  assert.equal(nativeAuthority.state, "CURRENT", JSON.stringify(nativeAuthority, null, 2));
  assert.deepEqual(nativeAuthority.sources.map((item) => item.path), ["AGENTS.md"]);
  assert.equal(nativeAuthority.sources[0].content_digest, reconciliation.projectPrefixDigest);

  fs.appendFileSync(path.join(root, "AGENTS.md"), "\n## Project Custom Rule\n\nDo not replace this.\n");
  const drifted = resolveLegacyAgentReconciliation(root, sourceRoot);
  assert.equal(drifted.state, "BLOCKED");
  assert.match(drifted.errors.join("\n"), /unknown or drifted legacy appendix section/);
});

test("selected adoption replaces only the verified legacy AGENTS suffix", (t) => {
  const root = legacyFixture(t);
  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: "adopt this legacy IntentOS project while preserving its project rules",
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
  });
  assert.equal(plan.executionState, "EXECUTABLE");
  const agent = plan.actions.find((action) => action.path === "AGENTS.md" && action.willWrite);
  assert.ok(agent);
  assert.equal(agent.preservation.mode, "EXACT_PREFIX_REPLACE_VERIFIED_LEGACY_SUFFIX");
  const proposed = Buffer.from(agent.inlineContentBase64, "base64").toString("utf8");
  assert.equal(proposed, `${projectPrefix}${selectedAgentGovernanceAppendix().trim()}\n`);
  assert.equal(proposed.includes("AI drafts; humans decide."), false);
  assert.deepEqual(validateRequestBoundLocalActionGraph(plan), []);

  fs.appendFileSync(path.join(root, "AGENTS.md"), "\n## Local drift\n\nPreserve me.\n");
  assert.notDeepEqual(validateRequestBoundLocalActionGraph(plan), []);
});

test("selected adoption replaces an exact legacy generated AGENTS file without requiring an appendix report", { timeout: 420_000 }, (t) => {
  const root = legacyFixture(t, { generatedAgent: true });
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({
    name: "legacy-generated-agent-adoption-fixture",
    scripts: { test: "node --test" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "README.md"), "# Legacy generated-agent project\n");
  fs.mkdirSync(path.join(root, "src"));
  const businessFile = path.join(root, "src", "business.mjs");
  const businessContent = "export const projectBehavior = 'preserved';\n";
  fs.writeFileSync(businessFile, businessContent);
  const git = (...args) => spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  assert.equal(git("init", "-q").status, 0);
  assert.equal(git("add", ".").status, 0);
  const committed = git(
    "-c", "user.name=IntentOS Tests",
    "-c", "user.email=intentos@example.invalid",
    "commit", "-qm", "legacy generated-agent fixture",
  );
  assert.equal(committed.status, 0, committed.stderr || committed.stdout);

  const reconciliation = resolveLegacyAgentReconciliation(root, sourceRoot);
  assert.equal(reconciliation.state, "VERIFIED_LEGACY_GENERATED_AGENT");
  assert.equal(reconciliation.generatedAgentSourcePath, "platforms/codex/AGENTS.template.md");
  assert.equal(reconciliation.sourceDigest, reconciliation.generatedAgentDigest);

  const nativeAuthority = collectProjectAgentAuthority(root, { sourceRoot });
  assert.equal(nativeAuthority.state, "ABSENT", JSON.stringify(nativeAuthority, null, 2));

  const plan = buildPlan(root, {
    starter: "generic-project",
    goal: "adopt this generated legacy IntentOS project without changing project behavior",
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
  });
  assert.equal(plan.executionState, "EXECUTABLE");
  assert.equal(plan.candidateStaticActivationPreflight.state, "READY");
  const agent = plan.actions.find((action) => action.path === "AGENTS.md" && action.willWrite);
  assert.ok(agent);
  assert.equal(agent.preservation.mode, "REPLACE_VERIFIED_LEGACY_GENERATED_AGENT");
  assert.equal(
    Buffer.from(agent.inlineContentBase64, "base64").toString("utf8"),
    `${selectedAgentGovernanceAppendix().trim()}\n`,
  );
  assert.deepEqual(validateRequestBoundLocalActionGraph(plan), []);

  fs.appendFileSync(path.join(root, "AGENTS.md"), "\n# Project-owned drift\n");
  assert.equal(resolveLegacyAgentReconciliation(root, sourceRoot).state, "BLOCKED");
  assert.notDeepEqual(validateRequestBoundLocalActionGraph(plan), []);
  fs.writeFileSync(path.join(root, "AGENTS.md"), historicalFile("platforms/codex/AGENTS.template.md"));
  assert.deepEqual(validateRequestBoundLocalActionGraph(plan), []);

  const planRelative = "apply-execution-plans/legacy-generated-agent.json";
  fs.mkdirSync(path.join(root, "apply-execution-plans"));
  fs.writeFileSync(path.join(root, planRelative), `${JSON.stringify(plan, null, 2)}\n`);
  const applied = spawnSync(process.execPath, [
    "scripts/init-project.mjs",
    "--apply-plan", path.join(root, planRelative),
    "--goal", plan.arguments.goal,
  ], {
    cwd: sourceRoot,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    timeout: 300_000,
  });
  assert.equal(applied.status, 0, applied.stderr || applied.stdout);
  assert.match(fs.readFileSync(path.join(root, plan.receiptPath), "utf8"), /APPLY_VERIFIED/);
  assert.equal(fs.readFileSync(businessFile, "utf8"), businessContent);
  assert.equal(
    fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"),
    `${selectedAgentGovernanceAppendix().trim()}\n`,
  );
  assert.deepEqual(
    fs.readFileSync(path.join(root, agent.backupPath)),
    historicalFile("platforms/codex/AGENTS.template.md"),
  );
});

test("legacy compatibility fails closed when manifest identity drifts or version is unsupported", (t) => {
  const root = legacyFixture(t);
  fs.appendFileSync(path.join(root, ".ai-native", "dev-kit-manifest.json"), "\n");
  assert.equal(inspectLegacyIntentOSInstallation(root, sourceRoot).state, "DRIFTED");

  const versionFile = path.join(root, ".ai-native", "version.json");
  const version = JSON.parse(fs.readFileSync(versionFile, "utf8"));
  version.devKitVersion = "1.7.0";
  fs.writeFileSync(versionFile, `${JSON.stringify(version, null, 2)}\n`);
  assert.equal(inspectLegacyIntentOSInstallation(root, sourceRoot).state, "UNSUPPORTED_VERSION");
});

test("legacy adoption activation ignores its transaction-owned AGENTS rollback backup", { timeout: 420_000 }, (t) => {
  const root = legacyFixture(t, { includeAmbiguousProjectOnboarding: true });
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({
    name: "legacy-adoption-backup-boundary-fixture",
    scripts: { test: "node --test" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "README.md"), "# Legacy existing project\n");
  fs.mkdirSync(path.join(root, "src"));
  const businessFile = path.join(root, "src", "business.mjs");
  const businessContent = "export const projectBehavior = 'preserved';\n";
  fs.writeFileSync(businessFile, businessContent);

  const git = (...args) => spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
  assert.equal(git("init", "-q").status, 0);
  assert.equal(git("add", ".").status, 0);
  const committed = git(
    "-c", "user.name=IntentOS Tests",
    "-c", "user.email=intentos@example.invalid",
    "commit", "-qm", "legacy fixture",
  );
  assert.equal(committed.status, 0, committed.stderr || committed.stdout);

  const goal = "adopt this verified legacy IntentOS project without changing project behavior";
  const plan = buildPlan(root, {
    starter: "generic-project",
    goal,
    migrationDepth: "SELECTED_ASSETS",
    profiles: "web-app",
    baselineLevel: "BL1_STANDARD",
  });
  assert.equal(plan.executionState, "EXECUTABLE");
  assert.equal(plan.candidateStaticActivationPreflight.state, "READY");
  const agentAction = plan.actions.find((action) => action.path === "AGENTS.md" && action.willWrite);
  assert.ok(agentAction);
  assert.match(agentAction.backupPath, /^\.intentos\/backups\/[^/]+\/AGENTS\.md$/);

  const planRelative = "apply-execution-plans/legacy-backup-boundary.json";
  fs.mkdirSync(path.join(root, "apply-execution-plans"));
  fs.writeFileSync(path.join(root, planRelative), `${JSON.stringify(plan, null, 2)}\n`);
  const applied = spawnSync(process.execPath, [
    "scripts/init-project.mjs",
    "--apply-plan", path.join(root, planRelative),
    "--goal", goal,
  ], {
    cwd: sourceRoot,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    timeout: 300_000,
  });
  assert.equal(applied.status, 0, applied.stderr || applied.stdout);
  assert.match(fs.readFileSync(path.join(root, plan.receiptPath), "utf8"), /APPLY_VERIFIED/);
  assert.equal(fs.readFileSync(businessFile, "utf8"), businessContent);

  const retainedBackup = fs.readFileSync(path.join(root, agentAction.backupPath), "utf8");
  assert.match(retainedBackup, /AI drafts; humans decide\./);
  const inventory = collectProjectAgentAuthority(root);
  assert.equal(inventory.state, "CURRENT", JSON.stringify(inventory, null, 2));
  assert.deepEqual(inventory.sources.map((item) => item.path), ["AGENTS.md"]);

  const coldStart = spawnSync(process.execPath, [
    path.join(root, "scripts", "workflow-next.mjs"),
    root,
    "--json",
  ], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 120_000,
  });
  assert.equal(coldStart.status, 0, coldStart.stderr || coldStart.stdout);
  const state = JSON.parse(coldStart.stdout);
  assert.equal(state.projectEntryTrust.entry_state, "READY_FOR_INTENTOS_OPERATION");
  assert.equal(state.versionState, "CURRENT");
});
