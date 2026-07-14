import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { verifyProjectLocalBehavioralRoute } from "../scripts/lib/behavioral-adoption-activation.mjs";
import { loadVerifiedBootstrapReceipt } from "../scripts/lib/bootstrap-transaction.mjs";
import { resolveProjectEntryTrust } from "../scripts/lib/project-entry-trust.mjs";

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
    "scripts/lib/behavioral-adoption-activation.mjs",
    "starters/generic-project/AGENTS.md",
    "intentos-manifest.json",
  ];
  return Object.fromEntries(paths.map((relative) => [relative, fileDigest(path.join(kitRoot, relative))]));
}

function fileDigest(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
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
  assert.equal(work.status, 0, combined(work));
  const workResult = JSON.parse(work.stdout);
  assert.ok(workResult.projectEntryTrust || workResult.projectEntry || workResult.operatingLoop, work.stdout);

  const finish = runProject(target, "scripts/resolve-closure-decision.mjs", [
    target,
    "--json",
    "--intent", "add an appointment cancellation rule",
  ]);
  assert.equal(finish.status, 0, combined(finish));
  assert.equal(JSON.parse(finish.stdout).closureDecision.canCountAsDone, "No");
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
    "--approval-record", evidence.approvalPath,
    "--readiness-report", evidence.readinessPath,
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
