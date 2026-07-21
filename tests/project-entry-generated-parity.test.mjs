import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { verifyProjectLocalBehavioralRoute } from "../scripts/lib/behavioral-adoption-activation.mjs";
import { evaluateVerifiedAdoptionApplyChain } from "../scripts/lib/adoption-apply-chain.mjs";
import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";
import { loadVerifiedBootstrapReceipt } from "../scripts/lib/bootstrap-transaction.mjs";
import {
  beginControlledApplyJournal,
  markControlledApplyActionApplied,
  markControlledApplyMutationComplete,
  prepareControlledApplyAction,
  writeControlledApplyReceipt,
} from "../scripts/lib/controlled-apply-transaction.mjs";
import {
  renderBaselineEvidence,
  renderBaselineSelection,
  renderEnvironmentBaseline,
  resolveBaselineConfiguration,
} from "../scripts/lib/baseline-selection.mjs";
import { resolveProjectEntryTrust } from "../scripts/lib/project-entry-trust.mjs";
import { validateRequestBoundLocalActionGraph } from "../scripts/lib/request-bound-apply-authority.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-generated-parity-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return fs.realpathSync(root);
}

function combined(result) {
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

function runProject(root, relativeScript, args) {
  return spawnSync(process.execPath, [path.join(root, relativeScript), ...args], {
    cwd: root,
    env: sanitizedEnvironment(),
    encoding: "utf8",
    timeout: 90_000,
    maxBuffer: 50 * 1024 * 1024,
  });
}

function sanitizedEnvironment() {
  const env = {};
  for (const key of ["HOME", "PATH", "LANG", "LC_ALL", "LC_CTYPE", "TMPDIR", "TMP", "TEMP", "SYSTEMROOT", "COMSPEC", "PATHEXT"]) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return { ...env, INTENTOS_SOURCE_ROOT: "", INTENTOS_GENERATED_COLD_START: "1" };
}

function sourceSnapshot() {
  const paths = [
    "scripts/init-project.mjs",
    "scripts/workflow-next.mjs",
    "scripts/resolve-work-queue.mjs",
    "scripts/resolve-task-governance.mjs",
    "scripts/resolve-review-surface.mjs",
    "scripts/resolve-verification-plan.mjs",
    "scripts/resolve-closure-decision.mjs",
    "scripts/lib/project-entry-trust.mjs",
    "scripts/lib/bootstrap-transaction.mjs",
    "scripts/lib/controlled-apply-transaction.mjs",
    "scripts/lib/behavioral-adoption-activation.mjs",
    "starters/generic-project/AGENTS.md",
    "intentos-manifest.json",
  ];
  return Object.fromEntries(paths.map((relative) => [relative, fileDigest(path.join(kitRoot, relative))]));
}

function fileDigest(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function contentDigest(content) {
  return `sha256:${crypto.createHash("sha256").update(content).digest("hex")}`;
}

function executableActions(plan) {
  return (plan.actions || [])
    .filter((action) => action.willWrite === true)
    .map((action) => ({
      id: action.id,
      targetPaths: [action.path, action.backupPath].filter(Boolean),
    }));
}

function writeEvidenceDocument(file, title, evidence) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, [
    `# ${title}`,
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(evidence, null, 2),
    "```",
    "",
  ].join("\n"));
}

function workflowStepScript(workflow, stepName) {
  const lines = workflow.split("\n");
  const stepIndex = lines.findIndex((line) => line === `      - name: ${stepName}`);
  assert.notEqual(stepIndex, -1, `missing workflow step: ${stepName}`);
  const runIndex = lines.findIndex((line, index) => index > stepIndex && line === "        run: |");
  assert.notEqual(runIndex, -1, `missing run script for workflow step: ${stepName}`);
  const script = [];
  for (let index = runIndex + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith("          ")) {
      script.push(lines[index].slice(10));
      continue;
    }
    if (lines[index] === "") {
      script.push("");
      continue;
    }
    break;
  }
  return script.join("\n");
}

test("optional GitHub adapter binds the full PR range and fails closed without a manual base", (t) => {
  const workflow = fs.readFileSync(path.join(kitRoot, "platforms/github/ci-ai-workflow.yml"), "utf8");
  assert.match(workflow, /\n  pull_request:\n/);
  assert.match(workflow, /\n  workflow_dispatch:\n/);
  assert.match(workflow, /base_sha:\n\s+description:.*\n\s+required: true\n\s+type: string/);
  assert.match(workflow, /PR_BASE_SHA: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/);
  assert.match(workflow, /--base "\$\{\{ steps\.consumer-base\.outputs\.base \}\}"/);
  assert.doesNotMatch(workflow, /HEAD\^/);

  const root = fixture(t);
  const git = (...args) => {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, combined(result));
    return result.stdout.trim();
  };
  git("init");
  git("config", "user.email", "test@example.invalid");
  git("config", "user.name", "IntentOS Test");
  fs.writeFileSync(path.join(root, "base.txt"), "base\n");
  git("add", "base.txt");
  git("commit", "-m", "base");
  const prBase = git("rev-parse", "HEAD");
  fs.writeFileSync(path.join(root, "candidate-one.txt"), "candidate one\n");
  git("add", "candidate-one.txt");
  git("commit", "-m", "candidate one");
  fs.writeFileSync(path.join(root, "candidate-two.txt"), "candidate two\n");
  git("add", "candidate-two.txt");
  git("commit", "-m", "candidate two");

  const resolver = workflowStepScript(workflow, "Resolve comparison base");
  const output = path.join(root, "github-output.txt");
  const resolveBase = (eventName, prBaseSha, dispatchBaseSha) => {
    fs.writeFileSync(output, "");
    return spawnSync("bash", ["-c", resolver], {
      cwd: root,
      env: {
        ...sanitizedEnvironment(),
        EVENT_NAME: eventName,
        PR_BASE_SHA: prBaseSha,
        DISPATCH_BASE_SHA: dispatchBaseSha,
        GITHUB_OUTPUT: output,
      },
      encoding: "utf8",
    });
  };

  const pullRequest = resolveBase("pull_request", prBase, "");
  assert.equal(pullRequest.status, 0, combined(pullRequest));
  const resolvedBase = fs.readFileSync(output, "utf8").trim().replace(/^base=/, "");
  assert.equal(resolvedBase, prBase);
  assert.notEqual(resolvedBase, git("rev-parse", "HEAD^"), "multi-commit PR silently fell back to the last commit");
  assert.deepEqual(git("diff", "--name-only", resolvedBase, "HEAD").split("\n"), [
    "candidate-one.txt",
    "candidate-two.txt",
  ]);

  const manualWithoutBase = resolveBase("workflow_dispatch", "", "");
  assert.notEqual(manualWithoutBase.status, 0, combined(manualWithoutBase));
  assert.match(combined(manualWithoutBase), /requires the base_sha input/i);
  assert.equal(fs.readFileSync(output, "utf8"), "");
});

function controlledUpdateEvidence(planPath) {
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const actions = executableActions(plan);
  const planRef = path.relative(plan.targetRoot, planPath).replaceAll(path.sep, "/");
  const approvalPath = path.join(plan.targetRoot, "approval-records", "workflow-update.approval.md");
  const readinessPath = path.join(plan.targetRoot, "apply-readiness-reports", "workflow-update.readiness.md");
  writeEvidenceDocument(approvalPath, "Approval Record: controlled workflow update", {
    schema_version: "1.41.0",
    artifact_type: "approval_record",
    artifact_id: "workflow-update-approval",
    approval_status: "APPROVED",
    approved_by: "IntentOS project-entry regression fixture",
    approval_owner_type: "HUMAN",
    approved_plan: { path: planRef, plan_digest: plan.planDigest },
    approved_action_ids: actions.map((action) => action.id),
    approved_action_paths: actions.map((action) => ({ id: action.id, target_paths: action.targetPaths })),
    expires_at: "2099-12-31T23:59:00Z",
    plan_changed_after_approval: false,
    risk_acceptance: { high_risk_action_included: false, human_only_action_included: false },
    rollback_reviewed: true,
    verification_reviewed: true,
    boundary: {
      writes_files_now: false,
      authorizes_automatic_apply: false,
      approves_implementation: false,
      approves_release_or_production: false,
      installs_hooks_or_changes_ci: false,
      enables_high_risk_actions: false,
      lets_codex_proceed_without_readiness: false,
    },
  });
  writeEvidenceDocument(readinessPath, "Controlled Apply Readiness: workflow update", {
    schema_version: "1.41.0",
    artifact_type: "controlled_apply_readiness",
    artifact_id: "workflow-update-readiness",
    readiness_state: "READY_FOR_HUMAN_APPROVED_APPLY",
    can_codex_apply_now: false,
    requires_explicit_human_approval: true,
    can_proceed_without_new_approval: false,
    apply_plan: { path: planRef, plan_digest: plan.planDigest },
    actions: actions.map((action) => ({ id: action.id, classification: "LOW_RISK_CANDIDATE", target_paths: action.targetPaths })),
    preconditions: [
      { name: "Apply plan exists", status: "pass" },
      { name: "Git state safe", status: "pass" },
      { name: "Target paths bounded", status: "pass" },
      { name: "Rollback ready", status: "pass" },
      { name: "Verification ready", status: "pass" },
    ],
    rollback: { required: true, path: ".intentos/backups", step: "Restore exact plan-bound backups", verification: "Compare pre-apply hashes" },
    verification: { pre_apply: "validate exact graph", post_apply: "workflow-next --json", evidence_path: plan.receiptPath },
    boundary: {
      writes_files_now: false,
      authorizes_apply: false,
      approves_implementation: false,
      approves_release_or_production: false,
      installs_hooks_or_changes_ci: false,
      enables_high_risk_actions: false,
    },
    outcome: "READINESS_RECORDED",
  });
  return { plan, approvalPath, readinessPath };
}

function prepareTaskReadyProjectSetup(root) {
  const selectedBaseline = resolveBaselineConfiguration(kitRoot, {
    profiles: "backend-api",
    baselineLevel: "BL1_STANDARD",
  });
  const baseline = { ...selectedBaseline, evidencePending: false };
  const docs = {
    "project-onboarding.md": "# Project Onboarding\n\nCodex owns technical setup for this local backend API fixture.\n",
    "project-profile.md": "# Project Profile\n\n## Selected Profiles\n\n- backend-api\n\n## Purpose\n\nExercise the governed project-entry path.\n",
    "tech-stack-strategy.md": "# Tech Stack Strategy\n\nUse the existing local JavaScript runtime and project-native verification commands.\n",
    "business-spec-index.md": "# Business Spec Index\n\n- Current bounded product behavior is the source of truth.\n",
    "sample-policy.md": "# Sample Policy\n\nExamples and fixtures never replace current project evidence.\n",
    "onboarding-decisions.md": "# Onboarding Decisions\n\nAll technical setup decisions for this fixture are recorded by Codex.\n",
    "product-vision.md": "# Product Vision\n\nPreserve and evolve one bounded local product.\n",
    "engineering-principles.md": "# Engineering Principles\n\nPrefer explicit contracts, focused changes, and project-local verification.\n",
    "risk-policy.md": "# Risk Policy\n\nExternal effects and production changes remain prohibited in this fixture.\n",
    "architecture.md": "# Architecture\n\nA local backend API boundary owns the tested behavior.\n",
    "domain-model.md": "# Domain Model\n\nThe current project behavior defines the bounded domain model.\n",
    "permission-model.md": "# Permission Model\n\nNo external or production permission is granted.\n",
    "test-strategy.md": "# Test Strategy\n\nRun project-local contract and integration verification for changed behavior.\n",
    "verification-matrix.md": "# Verification Matrix\n\n| Surface | Verification |\n| --- | --- |\n| Backend API | Project-local contract and rejection-path checks |\n",
  };
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  const verificationEntry = path.join(root, "scripts", "verify.sh");
  if (!fs.existsSync(verificationEntry)) {
    fs.mkdirSync(path.dirname(verificationEntry), { recursive: true });
    fs.writeFileSync(verificationEntry, [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      "node --input-type=module -e \"import('./src/business.js').then(({ currentBehavior }) => { if (currentBehavior !== 'preserve-me') process.exit(1); })\"",
      "",
    ].join("\n"));
    fs.chmodSync(verificationEntry, 0o755);
  }
  for (const [name, content] of Object.entries(docs)) fs.writeFileSync(path.join(root, "docs", name), content);
  fs.writeFileSync(path.join(root, "docs", "baseline-selection.md"), renderBaselineSelection(baseline));
  fs.writeFileSync(path.join(root, "docs", "baseline-evidence.md"), renderBaselineEvidence(baseline));
  fs.writeFileSync(path.join(root, "docs", "environment-baseline.md"), renderEnvironmentBaseline(baseline, {
    projectName: path.basename(root),
    starter: "generic-project",
    projectRoot: root,
  }));
}

test("an imperative English product goal routes an absent target to controlled project setup", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "appointment-app");
  const result = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/cli.mjs"),
    "work",
    target,
    "--intent", "Build an appointment app",
    "--json",
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 60_000,
    maxBuffer: 50 * 1024 * 1024,
  });

  assert.equal(result.status, 0, combined(result));
  assert.equal(JSON.parse(result.stdout).operatingLoop.operation, "START_PROJECT");
  assert.equal(fs.existsSync(target), false, "read-only routing created the absent target");
});

test("generated project cold-starts from its own cwd and exercises the strict operating route", { timeout: 240_000 }, (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "generated-project");
  const sourceBefore = sourceSnapshot();
  const initialized = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--target", target,
    "--starter", "generic-project",
    "--goal", "build an appointment app that prevents overlapping bookings",
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 100 * 1024 * 1024,
  });

  assert.equal(initialized.status, 0, combined(initialized));
  assert.match(initialized.stdout, /VERIFIED_ACTIVE/);
  assert.deepEqual(sourceSnapshot(), sourceBefore, "project creation changed IntentOS source assets");
  assert.equal(fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"), fs.readFileSync(path.join(kitRoot, "starters/generic-project/AGENTS.md"), "utf8"));

  const receipt = loadVerifiedBootstrapReceipt(target);
  assert.equal(receipt.ok, true, receipt.errors.join("; "));
  assert.equal(receipt.receipt.activation.state, "VERIFIED_ACTIVE");

  const route = verifyProjectLocalBehavioralRoute({
    targetRoot: target,
    sourceRoot: target,
    goal: "add an appointment cancellation rule",
    allowProjectLocalExecution: true,
  });
  assert.equal(route.ok, true, route.errors.join("; "));
  assert.equal(route.state, "VERIFIED_ACTIVE");
  assert.equal(route.coldStart.source_tree_unchanged, "Yes");
  assert.equal(route.coldStart.target_tree_unchanged, "Yes");
  assert.equal(route.routeCalibration.project_work_queue_unchanged, "Yes");
  assert.equal(route.routeCalibration.synthetic_current_items_created, "No");
  assert.deepEqual(route.results.map((item) => item.name), [
    "workflow-next",
    "work-queue",
    "task-governance",
    "review-surface",
    "verification-plan",
    "strict-finish-guard",
  ]);
  assert.ok(route.results.every((item) => item.exit_code === 0), JSON.stringify(route.results, null, 2));

  const work = runProject(target, "scripts/cli.mjs", [
    "work",
    target,
    "--intent", "add an appointment cancellation rule",
    "--json",
  ]);
  assert.equal(work.status, 1, combined(work));
  const workResult = JSON.parse(work.stdout);
  assert.equal(workResult.operatingLoop.state, "NEEDS_PROJECT_SETUP");
  assert.equal(workResult.operatingLoop.projectBaselineConsumptionRequired, "Yes");
  assert.equal(workResult.operatingLoop.projectBaselineConsumptionState, "BASELINE_BLOCKED");
  assert.equal(workResult.operatingDecision.actionCode, "COMPLETE_PROJECT_SETUP");
  assert.equal(workResult.operatingDecision.decisionResponsibility.userActionRequiredNow, "No");
  assert.equal(workResult.operatingDecision.decisionResponsibility.technicalDecisionRequiredFromUser, "No");
  assert.match(workResult.operatingDecision.plainAction, /Codex should complete project understanding, platform detection, and the matching baseline/i);

  const finish = runProject(target, "scripts/resolve-closure-decision.mjs", [
    target,
    "--json",
    "--intent", "add an appointment cancellation rule",
  ]);
  assert.equal(finish.status, 0, combined(finish));
  assert.equal(JSON.parse(finish.stdout).closureDecision.canCountAsDone, "No");

  const unreadableProject = path.join(parent, "not-a-project-directory");
  fs.writeFileSync(unreadableProject, "not a directory\n");
  const guardedFinish = runProject(target, "scripts/resolve-operating-loop.mjs", [
    unreadableProject,
    "--intent", "is this task done",
    "--json",
  ]);
  assert.equal(guardedFinish.status, 2, combined(guardedFinish));
  const guardedFinishValue = JSON.parse(guardedFinish.stdout);
  assert.equal(guardedFinishValue.operatingLoop.state, "BLOCKED_BY_SOURCE_FAILURE");
  assert.equal(guardedFinishValue.operatingDecision.actionCode, "REPAIR_SOURCE_READ");
  assert.notEqual(guardedFinishValue.operatingDecision.actionCode, "REPORT_TASK_COMPLETE");
  assert.deepEqual(sourceSnapshot(), sourceBefore, "generated-project routing changed IntentOS source assets");

  const queueDir = path.join(target, "work-queue");
  const queueFile = fs.readdirSync(queueDir).find((entry) => entry.endsWith(".md"));
  assert.ok(queueFile, "generated project has no mutable Work Queue record");
  fs.appendFileSync(path.join(queueDir, queueFile), "\n<!-- current task progressed after activation -->\n");
  const afterTaskProgress = resolveProjectEntryTrust({
    projectRoot: target,
    sourceRoot: target,
    goal: "continue the current appointment task",
  });
  assert.equal(afterTaskProgress.entry_state, "READY_FOR_INTENTOS_OPERATION");

  fs.appendFileSync(
    path.join(target, ".intentos", "core", "project-entry-adoption-trust.md"),
    "\nunauthorized guidance mutation\n",
  );
  const afterGuidanceTamper = resolveProjectEntryTrust({
    projectRoot: target,
    sourceRoot: target,
    goal: "continue the current appointment task",
  });
  assert.equal(afterGuidanceTamper.entry_state, "BLOCKED_REPAIR_REQUIRED");
  assert.ok(afterGuidanceTamper.blockers.includes("PROJECT_IDENTITY_CONFLICTED"));
});

test("every supported starter reaches verified project-entry activation", { timeout: 360_000 }, (t) => {
  const parent = fixture(t);
  const starters = ["generic-project", "codex-web-app", "codex-ios-app", "codex-android-app"];

  for (const starter of starters) {
    const target = path.join(parent, starter);
    const initialized = spawnSync(process.execPath, [
      path.join(kitRoot, "scripts/init-project.mjs"),
      "--target", target,
      "--starter", starter,
      "--goal", `build a local appointment product with the ${starter} starter`,
    ], {
      cwd: kitRoot,
      encoding: "utf8",
      timeout: 180_000,
      maxBuffer: 100 * 1024 * 1024,
    });

    assert.equal(initialized.status, 0, `${starter}\n${combined(initialized)}`);
    assert.match(initialized.stdout, /VERIFIED_ACTIVE/, starter);
    assert.equal(
      fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"),
      fs.readFileSync(path.join(kitRoot, "starters", starter, "AGENTS.md"), "utf8"),
      `${starter} did not install its governed agent entry`,
    );
    assert.equal(fs.existsSync(path.join(target, "scripts", "verify.sh")), true, `${starter} lacks its verification entry`);

    const receipt = loadVerifiedBootstrapReceipt(target);
    assert.equal(receipt.ok, true, `${starter}: ${receipt.errors.join("; ")}`);
    assert.equal(receipt.receipt.activation.state, "VERIFIED_ACTIVE", starter);
  }
});

test("a generated project remains trusted during and after an exact controlled workflow update", { timeout: 240_000 }, (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "controlled-update-project");
  const initialized = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--target", target,
    "--starter", "generic-project",
    "--goal", "build an appointment app with a governed update path",
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 100 * 1024 * 1024,
  });
  assert.equal(initialized.status, 0, combined(initialized));
  prepareTaskReadyProjectSetup(target);

  const planPath = path.join(target, "apply-execution-plans", "workflow-update.json");
  const planned = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--target", target,
    "--update-workflow-assets",
    "--goal", "refresh the governed workflow assets",
    "--write-plan", "apply-execution-plans/workflow-update.json",
  ], {
    cwd: target,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 100 * 1024 * 1024,
  });
  assert.equal(planned.status, 0, combined(planned));
  const evidence = controlledUpdateEvidence(planPath);
  assert.equal(evidence.plan.operation, "UPDATE_WORKFLOW_ASSETS");

  const applied = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--apply-plan", planPath,
    "--goal", "refresh the governed workflow assets",
  ], {
    cwd: target,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 100 * 1024 * 1024,
  });
  assert.equal(applied.status, 0, combined(applied));
  const receipt = fs.readFileSync(path.join(target, evidence.plan.receiptPath), "utf8");
  assert.match(receipt, /APPLY_VERIFIED/);
  const trust = resolveProjectEntryTrust({
    projectRoot: target,
    sourceRoot: target,
    goal: "continue the appointment app",
  });
  assert.equal(trust.entry_state, "READY_FOR_INTENTOS_OPERATION", JSON.stringify(trust, null, 2));
});

test("an existing project enters IntentOS behavior in a fresh project-local session after controlled adoption", { timeout: 480_000 }, (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "existing-project");
  fs.mkdirSync(path.join(target, "src"), { recursive: true });
  fs.writeFileSync(path.join(target, "package.json"), `${JSON.stringify({ name: "existing-product", private: true }, null, 2)}\n`);
  fs.writeFileSync(path.join(target, "src", "business.js"), "export const currentBehavior = 'preserve-me';\n");
  const existingAgent = "# Existing Project Agent\n\nPreserve the current product rules and project-native verification.\n";
  fs.writeFileSync(path.join(target, "agent.md"), existingAgent);
  prepareTaskReadyProjectSetup(target);
  const businessDigestBefore = fileDigest(path.join(target, "src", "business.js"));

  const planPath = path.join(target, "apply-execution-plans", "existing-adoption.json");
  const planned = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--target", target,
    "--update-workflow-assets",
    "--goal", "continue this existing product under IntentOS without changing its business behavior",
    "--write-plan", "apply-execution-plans/existing-adoption.json",
  ], {
    cwd: target,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 100 * 1024 * 1024,
  });
  assert.equal(planned.status, 0, combined(planned));
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  assert.equal(plan.arguments.projectEntryOrigin, "EXISTING_PROJECT");
  assert.equal(plan.operationKind, "NATIVE_ADOPTION");
  assert.equal(plan.arguments.applyAgentGovernance, true);
  assert.deepEqual(validateRequestBoundLocalActionGraph(plan), [], "native adoption advertised an action graph that request-bound apply would reject");

  const applied = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--apply-plan", planPath,
    "--goal", "continue this existing product under IntentOS without changing its business behavior",
  ], {
    cwd: target,
    encoding: "utf8",
    timeout: 360_000,
    maxBuffer: 100 * 1024 * 1024,
  });
  assert.equal(applied.status, 0, combined(applied));
  const receiptContent = fs.readFileSync(path.join(target, plan.receiptPath), "utf8");
  assert.match(receiptContent, /APPLY_VERIFIED/);
  const receipt = JSON.parse(receiptContent.match(/```json\s*([\s\S]*?)```/i)?.[1] || "null");
  assert.equal(receipt.apply_authority.authority_mode, "REQUEST_BOUND_LOCAL");
  assert.equal(receipt.boundary.only_authorized_actions_executed, true);
  assert.equal(fs.readFileSync(path.join(target, "agent.md"), "utf8"), existingAgent, "native adoption modified the legacy agent source");
  const adoptedAgent = fs.readFileSync(path.join(target, "AGENTS.md"), "utf8");
  assert.ok(adoptedAgent.startsWith(existingAgent.trimEnd()), "native adoption replaced existing agent rules");
  assert.match(adoptedAgent, /Zero-Experience Solo Developer/);
  assert.equal(fileDigest(path.join(target, "src", "business.js")), businessDigestBefore, "controlled adoption changed existing business code");

  const validChain = evaluateVerifiedAdoptionApplyChain(target, { schemasRoot: kitRoot });
  assert.equal(validChain.status, "VERIFIED", validChain.errors.join("; "));
  const wrongReceiptRef = "apply-receipts/wrong-chain.md";
  const wrongReceipt = structuredClone(receipt);
  wrongReceipt.project_identity.root_digest = contentDigest("different-project-identity");
  writeEvidenceDocument(path.join(target, wrongReceiptRef), "Wrong Apply Receipt", wrongReceipt);
  const stillFindsValidChain = evaluateVerifiedAdoptionApplyChain(target, { schemasRoot: kitRoot });
  assert.equal(stillFindsValidChain.status, "VERIFIED", stillFindsValidChain.errors.join("; "));
  const exactWrongChain = evaluateVerifiedAdoptionApplyChain(target, {
    schemasRoot: kitRoot,
    receiptReference: `artifact:${wrongReceiptRef}`,
  });
  assert.notEqual(exactWrongChain.status, "VERIFIED", "an unrelated valid receipt satisfied the explicitly bound wrong chain");

  const nextSession = runProject(target, "scripts/cli.mjs", [
    "work",
    target,
    "--intent", "continue this existing product under IntentOS without changing its business behavior",
    "--json",
  ]);
  assert.equal(nextSession.status, 0, combined(nextSession));
  const result = JSON.parse(nextSession.stdout);
  assert.equal(result.projectEntry?.state, "EXISTING_PROJECT_ENTRY", nextSession.stdout);
  assert.equal(result.projectIdentityProjection?.intentosPosture?.operatingMode, "ACTIVE", nextSession.stdout);
  assert.equal(result.operatingLoop?.operation, "CONTINUE_TASK", nextSession.stdout);
  assert.equal(result.operatingDecision?.actionCode, "INSPECT_TASK_RISK", nextSession.stdout);
  assert.equal(result.operatingDecision?.reasonCode, "TASK_IMPACT_UNRESOLVED", nextSession.stdout);
  assert.equal(fs.existsSync(path.join(target, "requests", "001-intentos-adoption-goal.md")), true);
  assert.equal(fs.existsSync(path.join(target, "work-queue", "001-intentos-adoption-goal.md")), true);
  assert.equal(result.decisionResponsibility?.technicalDecisionRequiredFromUser, "No", nextSession.stdout);
  assert.equal(fileDigest(path.join(target, "src", "business.js")), businessDigestBefore, "fresh IntentOS session changed existing business code");
});

test("an existing-project plan expires when any project source changes outside its action graph", { timeout: 240_000 }, (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "stale-existing-project");
  fs.mkdirSync(path.join(target, "src"), { recursive: true });
  fs.writeFileSync(path.join(target, "package.json"), `${JSON.stringify({ name: "stale-existing-product", private: true }, null, 2)}\n`);
  const businessFile = path.join(target, "src", "business.js");
  fs.writeFileSync(businessFile, "export const rule = 'before-plan';\n");

  const planPath = path.join(target, "apply-execution-plans", "stale-adoption.json");
  const planned = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--target", target,
    "--update-workflow-assets",
    "--goal", "adopt this existing project without changing business behavior",
    "--write-plan", "apply-execution-plans/stale-adoption.json",
  ], {
    cwd: target,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 100 * 1024 * 1024,
  });
  assert.equal(planned.status, 0, combined(planned));
  const evidence = controlledUpdateEvidence(planPath);
  fs.writeFileSync(businessFile, "export const rule = 'changed-after-plan';\n");

  const applied = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--apply-plan", planPath,
    "--goal", "adopt this existing project without changing business behavior",
  ], {
    cwd: target,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 100 * 1024 * 1024,
  });

  assert.equal(applied.status, 2, combined(applied));
  assert.match(combined(applied), /project revision changed|source state changed/);
  assert.equal(fs.readFileSync(businessFile, "utf8"), "export const rule = 'changed-after-plan';\n");
  assert.equal(fs.existsSync(path.join(target, evidence.plan.receiptPath)), false);
});

test("recovery of a verified older plan cannot satisfy a different current apply request", { timeout: 240_000 }, (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "different-plan-project");
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, "package.json"), `${JSON.stringify({ name: "different-plan", private: true }, null, 2)}\n`);
  const oldContent = "old verified action\n";
  const oldPlanDigest = contentDigest("old-plan");
  const oldAction = {
    id: "A-001",
    path: "old-governed.md",
    backupPath: null,
    hashBefore: null,
    expectedHashAfter: contentDigest(oldContent),
  };
  const oldAuthorityPath = ".intentos/apply-authorities/old-plan.json";
  const oldReceiptPath = ".intentos/old-apply-receipt.md";
  const oldRecoveryBinding = {
    requestDigest: contentDigest("old-request"),
    authorityMode: "REQUEST_BOUND_LOCAL",
    authorityPath: oldAuthorityPath,
    authorityDigest: contentDigest("old-authority"),
    receiptPath: oldReceiptPath,
    authorizedPaths: [oldAction.path, oldAuthorityPath, oldReceiptPath].sort(),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: oldPlanDigest,
    receiptPath: oldReceiptPath,
    actions: [oldAction],
    recoveryBinding: oldRecoveryBinding,
  });
  const entry = prepareControlledApplyAction(handle, oldAction);
  const temporary = path.join(target, entry.transaction_temp_path);
  fs.mkdirSync(path.dirname(temporary), { recursive: true });
  fs.writeFileSync(temporary, oldContent, { flag: "wx" });
  fs.renameSync(temporary, path.join(target, oldAction.path));
  markControlledApplyActionApplied(handle, oldAction.id, oldAction.expectedHashAfter);
  markControlledApplyMutationComplete(handle);
  writeControlledApplyReceipt(handle, [
    "# Apply Execution Receipt", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify({
      artifact_type: "apply_execution_receipt",
      receipt_state: "APPLY_VERIFIED",
      outcome: "APPLY_VERIFIED",
      execution_plan: { plan_digest: oldPlanDigest },
      activation: { status: "VERIFIED" },
      boundary: { only_approved_actions_executed: true },
      actions: [{ id: oldAction.id, result: "APPLIED", hash_after: oldAction.expectedHashAfter }],
    }, null, 2),
    "```", "",
  ].join("\n"), "final-success");
  for (const file of [handle.file, handle.lockFile]) {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    value.owner_pid = 2_147_483_647;
    if (file === handle.file) {
      const { journal_digest: _digest, ...base } = value;
      value.journal_digest = evidenceDigest(base, []);
    } else {
      const { lock_digest: _digest, ...base } = value;
      value.lock_digest = evidenceDigest(base, []);
    }
    fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  }

  const newPlanPath = path.join(target, "apply-execution-plans", "different-plan.json");
  const planned = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--target", target,
    "--update-workflow-assets",
    "--goal", "prepare a different controlled workflow update",
    "--write-plan", "apply-execution-plans/different-plan.json",
  ], {
    cwd: target,
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 100 * 1024 * 1024,
  });
  assert.equal(planned.status, 0, combined(planned));

  const applied = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts/init-project.mjs"),
    "--apply-plan", newPlanPath,
    "--goal", "prepare a different controlled workflow update",
  ], {
    cwd: target,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 100 * 1024 * 1024,
  });

  assert.equal(applied.status, 2, combined(applied));
  assert.match(combined(applied), /project revision changed|source state changed|recovery binding .*does not match/i);
  assert.doesNotMatch(combined(applied), /Recovered verified controlled apply/);
  assert.equal(fs.readFileSync(path.join(target, oldAction.path), "utf8"), oldContent);
  assert.equal(fs.existsSync(handle.file), true, "the old journal remains for its exact request authority to recover");
  assert.equal(handle.lockFile ? fs.existsSync(handle.lockFile) : false, true);
});
