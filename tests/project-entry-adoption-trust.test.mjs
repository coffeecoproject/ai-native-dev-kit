import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";
import {
  loadVerifiedBootstrapReceipt,
  validateVerifiedBootstrapReceipt,
} from "../scripts/lib/bootstrap-transaction.mjs";
import { resolveProjectEntryTrust } from "../scripts/lib/project-entry-trust.mjs";
import { inspectTargetTopology, recheckTargetTopology } from "../scripts/lib/target-topology.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fixture(t, prefix = "intentos-entry-trust-") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return fs.realpathSync(root);
}

function verifiedReceipt(targetRoot, overrides = {}) {
  const base = {
    schema_version: "1.109.0",
    artifact_type: "bootstrap_transaction_receipt",
    transaction_id: "bootstrap-entry-trust-001",
    target_root: targetRoot,
    original_topology: "ABSENT_LEAF",
    envelope_digest: evidenceDigest("envelope", []),
    goal_digest: evidenceDigest("goal", []),
    plan_ref: "bootstrap:generated-in-memory-plan",
    plan_digest: evidenceDigest("plan", []),
    approval_ref: "bootstrap:original-request-approval",
    approval_digest: evidenceDigest("approval", []),
    readiness_ref: "bootstrap:controlled-readiness",
    readiness_digest: evidenceDigest("readiness", []),
    source_inventory_digest: evidenceDigest("source inventory", []),
    state: "APPLY_VERIFIED",
    actions: [{ id: "A-001", path: "README.md", result: "APPLIED" }],
    errors: [],
    rollback_state: "NOT_REQUIRED",
    residual_paths: [],
    exact_action_ids: ["A-001"],
    activation: { ok: true, state: "VERIFIED_ACTIVE", errors: [] },
    ...overrides,
  };
  return {
    ...base,
    receipt_ref: ".intentos/bootstrap-receipt.json",
    receipt_digest: evidenceDigest(base, []),
  };
}

test("target topology distinguishes absent, empty, non-empty, file, and symlink targets", (t) => {
  const parent = fixture(t);
  const absent = path.join(parent, "absent-project");
  const empty = path.join(parent, "empty-project");
  const nonempty = path.join(parent, "nonempty-project");
  const file = path.join(parent, "project-file");
  const symlink = path.join(parent, "project-link");

  fs.mkdirSync(empty);
  fs.mkdirSync(nonempty);
  fs.writeFileSync(path.join(nonempty, "owned.txt"), "existing project content\n");
  fs.writeFileSync(file, "not a directory\n");
  fs.symlinkSync(empty, symlink, "dir");

  assert.equal(inspectTargetTopology(absent).state, "ABSENT_LEAF");
  assert.equal(inspectTargetTopology(empty).state, "EMPTY_DIRECTORY");
  assert.equal(inspectTargetTopology(nonempty).state, "NONEMPTY_DIRECTORY");
  assert.equal(inspectTargetTopology(file).state, "NON_DIRECTORY");
  assert.equal(inspectTargetTopology(symlink).state, "UNSAFE");
});

test("target topology snapshots fail closed when the target changes after preflight", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "project");
  const snapshot = inspectTargetTopology(target);

  fs.mkdirSync(target);
  fs.writeFileSync(path.join(target, "unexpected.txt"), "concurrent content\n");

  const recheck = recheckTargetTopology(snapshot);
  assert.equal(recheck.ok, false);
  assert.match(recheck.errors.join("\n"), /changed after preflight/i);
  assert.equal(recheck.current.state, "NONEMPTY_DIRECTORY");
});

test("verified bootstrap receipts are project-bound and tamper-evident", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "project");
  fs.mkdirSync(path.join(target, ".intentos"), { recursive: true });

  const receipt = verifiedReceipt(target);
  const receiptFile = path.join(target, ".intentos/bootstrap-receipt.json");
  fs.writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`);

  assert.deepEqual(validateVerifiedBootstrapReceipt(receipt, target), { ok: true, errors: [] });
  const loaded = loadVerifiedBootstrapReceipt(target);
  assert.equal(loaded.ok, true, loaded.errors.join("; "));
  assert.equal(loaded.receipt.transaction_id, receipt.transaction_id);

  const wrongProject = validateVerifiedBootstrapReceipt(receipt, path.join(parent, "other-project"));
  assert.equal(wrongProject.ok, false);
  assert.match(wrongProject.errors.join("\n"), /target does not match/i);

  const tampered = { ...receipt, state: "APPLY_VERIFIED", plan_digest: evidenceDigest("different-plan", []) };
  fs.writeFileSync(receiptFile, `${JSON.stringify(tampered, null, 2)}\n`);
  const tamperedLoad = loadVerifiedBootstrapReceipt(target);
  assert.equal(tamperedLoad.ok, false);
  assert.match(tamperedLoad.errors.join("\n"), /digest is not canonical/i);
});

test("verified bootstrap receipts canonicalize project-root aliases", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "canonical-project");
  const alias = path.join(parent, "project-alias");
  fs.mkdirSync(path.join(target, ".intentos"), { recursive: true });
  fs.symlinkSync(target, alias, "dir");
  const receipt = verifiedReceipt(target);
  fs.writeFileSync(path.join(target, ".intentos/bootstrap-receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);

  const loaded = loadVerifiedBootstrapReceipt(alias);
  assert.equal(loaded.ok, true, loaded.errors.join("; "));
  assert.equal(loaded.receipt.target_root, target);
});

test("bootstrap receipt symlinks are rejected even when their contents are valid", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "project");
  const outside = path.join(parent, "outside-receipt.json");
  fs.mkdirSync(path.join(target, ".intentos"), { recursive: true });
  fs.writeFileSync(outside, `${JSON.stringify(verifiedReceipt(target), null, 2)}\n`);
  fs.symlinkSync(outside, path.join(target, ".intentos/bootstrap-receipt.json"));

  const loaded = loadVerifiedBootstrapReceipt(target);
  assert.equal(loaded.ok, false);
  assert.match(loaded.errors.join("\n"), /symbolic link/i);
});

test("marker text and installed-version metadata cannot bypass behavioral adoption proof", (t) => {
  const parent = fixture(t);
  const markerOnly = path.join(parent, "marker-only");
  fs.mkdirSync(markerOnly);
  fs.writeFileSync(path.join(markerOnly, "AGENTS.md"), "# IntentOS Collaboration Layer\n\nIntentOS Operating Mode\n");

  const markerTrust = resolveProjectEntryTrust({
    projectRoot: markerOnly,
    sourceRoot: kitRoot,
    goal: "Continue this existing project under IntentOS",
  });
  assert.equal(markerTrust.project_identity.state, "CONFLICTED");
  assert.equal(markerTrust.entry_state, "BLOCKED_REPAIR_REQUIRED");

  const installed = path.join(parent, "installed-without-activation");
  fs.mkdirSync(path.join(installed, ".intentos", "core"), { recursive: true });
  fs.writeFileSync(path.join(installed, ".intentos", "core", "workflow.md"), "# Workflow\n");
  fs.writeFileSync(path.join(installed, ".intentos", "version.json"), `${JSON.stringify({
    intentOSVersion: "1.109.0",
    projectEntryOrigin: "EXISTING_PROJECT",
    projectRoot: ".",
    workflowAssets: [".intentos/core"],
  }, null, 2)}\n`);

  const installedTrust = resolveProjectEntryTrust({
    projectRoot: installed,
    sourceRoot: kitRoot,
    goal: "Continue this existing project under IntentOS",
  });
  assert.equal(installedTrust.project_identity.state, "CONFLICTED");
  assert.match(installedTrust.project_identity.reason, /verified project-bound apply and activation receipt/i);
  assert.equal(installedTrust.entry_state, "BLOCKED_REPAIR_REQUIRED");
});

test("cached change-boundary verification fails closed when the staged diff is empty", (t) => {
  const root = fixture(t, "intentos-empty-cached-boundary-");
  const reportDir = path.join(root, "change-boundary-reports");
  fs.mkdirSync(reportDir, { recursive: true });
  fs.copyFileSync(
    path.join(kitRoot, "change-boundary-reports", "109-project-entry-adoption-trust.md"),
    path.join(reportDir, "109-project-entry-adoption-trust.md"),
  );
  for (const args of [
    ["init", "-q"],
    ["add", "."],
    ["-c", "user.name=IntentOS Tests", "-c", "user.email=intentos@example.invalid", "commit", "-qm", "fixture"],
  ]) {
    const git = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
    assert.equal(git.status, 0, `${git.stdout}\n${git.stderr}`);
  }

  const checked = spawnSync(process.execPath, [
    path.join(kitRoot, "scripts", "check-change-boundary.mjs"),
    root,
    "--report", "change-boundary-reports/109-project-entry-adoption-trust.md",
    "--cached",
  ], { cwd: kitRoot, encoding: "utf8" });
  assert.equal(checked.status, 1, `${checked.stdout}\n${checked.stderr}`);
  assert.match(`${checked.stdout}\n${checked.stderr}`, /cached diff is empty; exact changed-file verification cannot pass/i);
});
