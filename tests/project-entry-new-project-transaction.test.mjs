import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";
import {
  createBootstrapTransaction,
  executeBootstrapTransaction,
  recoverInterruptedBootstrap,
  validateVerifiedBootstrapReceipt,
} from "../scripts/lib/bootstrap-transaction.mjs";
import { inspectTargetTopology } from "../scripts/lib/target-topology.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function fixture(t, prefix = "intentos-bootstrap-transaction-") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return fs.realpathSync(root);
}

function transaction(targetRoot, transactionId, actions = defaultActions()) {
  return createBootstrapTransaction({
    topology: inspectTargetTopology(targetRoot),
    transactionId,
    actions,
    goalDigest: evidenceDigest("create an appointment app", []),
    planDigest: evidenceDigest("exact plan", []),
    approvalDigest: evidenceDigest("original request", []),
    readinessDigest: evidenceDigest("ready", []),
    sourceInventoryDigest: evidenceDigest("source inventory", []),
  });
}

function defaultActions() {
  return [
    { id: "A-001", path: "README.md", content: "# Generated project\n" },
    { id: "A-002", path: "src/index.mjs", content: "export const ready = true;\n" },
  ];
}

function verifiedActivation() {
  return { ok: true, state: "VERIFIED_ACTIVE", errors: [] };
}

function combined(result) {
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

function runInit(args, cwd = kitRoot) {
  return spawnSync(process.execPath, [path.join(kitRoot, "scripts/init-project.mjs"), ...args], {
    cwd,
    encoding: "utf8",
    timeout: 90_000,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function treeObservation(root) {
  if (!fs.existsSync(root)) return evidenceDigest({ state: "ABSENT" }, []);
  const rows = [];
  walk(root, root, rows);
  return evidenceDigest(rows, []);
}

function walk(root, current, rows) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(current, entry.name);
    const relative = path.relative(root, full).replaceAll(path.sep, "/");
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) rows.push({ path: relative, type: "symlink", target: fs.readlinkSync(full) });
    else if (stat.isDirectory()) {
      rows.push({ path: relative, type: "directory" });
      walk(root, full, rows);
    } else if (stat.isFile()) {
      rows.push({
        path: relative,
        type: "file",
        digest: evidenceDigest(fs.readFileSync(full).toString("base64"), []),
        size: stat.size,
      });
    }
  }
}

function writeOrphanJournal(parent, target, transactionId, committedTreeDigest, overrides = {}) {
  const base = {
    schema_version: "1.109.0",
    artifact_type: "bootstrap_pending_journal",
    transaction_id: transactionId,
    owner_pid: 2_147_483_647,
    target_root: target,
    original_topology: "ABSENT_LEAF",
    topology_digest: evidenceDigest("topology", []),
    envelope_digest: evidenceDigest("envelope", []),
    plan_digest: evidenceDigest("plan", []),
    approval_digest: evidenceDigest("approval", []),
    readiness_digest: evidenceDigest("readiness", []),
    success_receipt_path: ".intentos/bootstrap-receipt.json",
    updated_at: new Date().toISOString(),
    state: "TARGET_COMMITTED_PENDING_ACTIVATION",
    stage_root: "",
    backup_root: "",
    committed_tree_digest: committedTreeDigest,
    ...overrides,
  };
  const journal = { ...base, journal_digest: evidenceDigest(base, []) };
  const file = path.join(parent, `.intentos-bootstrap-${transactionId}.pending.json`);
  fs.writeFileSync(file, `${JSON.stringify(journal, null, 2)}\n`);
  return file;
}

test("bootstrap transaction atomically creates an absent target and verifies its receipt", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "absent-project");
  const tx = transaction(target, "absent-success");

  const result = executeBootstrapTransaction(tx, { verifyActivation: verifiedActivation });

  assert.equal(result.state, "APPLY_VERIFIED", result.errors.join("; "));
  assert.equal(fs.readFileSync(path.join(target, "README.md"), "utf8"), "# Generated project\n");
  assert.equal(fs.readFileSync(path.join(target, "src/index.mjs"), "utf8"), "export const ready = true;\n");
  assert.equal(validateVerifiedBootstrapReceipt(result, target, { transactionId: tx.transaction_id }).ok, true);
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${tx.transaction_id}.pending.json`)), false);
});

test("bootstrap transaction atomically replaces and preserves an originally empty directory", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "empty-project");
  fs.mkdirSync(target);
  const original = fs.statSync(target);
  const tx = transaction(target, "empty-success");

  const result = executeBootstrapTransaction(tx, { verifyActivation: verifiedActivation });

  assert.equal(result.state, "APPLY_VERIFIED", result.errors.join("; "));
  assert.equal(inspectTargetTopology(target).state, "NONEMPTY_DIRECTORY");
  assert.ok(fs.statSync(target).ino !== original.ino || process.platform === "win32");
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${tx.transaction_id}.pending.json`)), false);
});

test("a mid-transaction activation failure restores the exact empty-directory topology", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "empty-project");
  fs.mkdirSync(target);
  const original = fs.statSync(target);
  const tx = transaction(target, "empty-rollback");

  const result = executeBootstrapTransaction(tx, {
    verifyActivation: () => ({ ok: false, state: "BLOCKED", errors: ["injected activation failure"] }),
  });

  assert.equal(result.state, "APPLY_FAILED_ROLLED_BACK");
  assert.equal(result.rollback_state, "ROLLED_BACK");
  assert.deepEqual(fs.readdirSync(target), []);
  assert.equal(fs.statSync(target).ino, original.ino);
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${tx.transaction_id}.failure.json`)), true);
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${tx.transaction_id}.pending.json`)), false);
});

test("a failure after the atomic absent-target commit removes only the transaction-owned target", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "absent-project");
  const ancestorMarker = path.join(parent, "keep-me.txt");
  fs.writeFileSync(ancestorMarker, "unrelated ancestor content\n");
  const tx = transaction(target, "absent-rollback");

  const result = executeBootstrapTransaction(tx, {
    afterAction: ({ action }) => {
      if (action.id === "A-001") throw new Error("injected action observation failure");
    },
    verifyActivation: verifiedActivation,
  });

  assert.equal(result.state, "APPLY_FAILED_ROLLED_BACK");
  assert.equal(result.rollback_state, "ROLLED_BACK");
  assert.equal(fs.existsSync(target), false);
  assert.equal(fs.readFileSync(ancestorMarker, "utf8"), "unrelated ancestor content\n");
});

test("missing goal and unsafe direct-init targets are blocked with zero target mutation", (t) => {
  const parent = fixture(t);
  const absent = path.join(parent, "missing-goal");
  const beforeParent = treeObservation(parent);
  const noGoal = runInit(["--target", absent, "--starter", "generic-project"]);
  assert.equal(noGoal.status, 2, combined(noGoal));
  assert.match(combined(noGoal), /needs the product goal/i);
  assert.equal(fs.existsSync(absent), false);
  assert.equal(treeObservation(parent), beforeParent);

  const nonempty = path.join(parent, "nonempty");
  fs.mkdirSync(nonempty);
  fs.writeFileSync(path.join(nonempty, "keep.txt"), "keep\n");
  const file = path.join(parent, "file-target");
  fs.writeFileSync(file, "keep file\n");
  const symlink = path.join(parent, "symlink-target");
  fs.symlinkSync(nonempty, symlink, "dir");

  for (const target of [nonempty, file, symlink]) {
    const before = treeObservation(parent);
    const blocked = runInit([
      "--target", target,
      "--starter", "generic-project",
      "--goal", "build a local appointment app",
    ]);
    assert.notEqual(blocked.status, 0, `${target}\n${combined(blocked)}`);
    assert.equal(treeObservation(parent), before, `blocked init mutated ${target}`);
  }
});

test("orphaned pending journal rolls back transaction-owned content", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "orphan-owned");
  fs.mkdirSync(path.join(target, "src"), { recursive: true });
  fs.writeFileSync(path.join(target, "src/index.mjs"), "owned by interrupted transaction\n");
  const transactionId = "orphan-owned";
  const journal = writeOrphanJournal(parent, target, transactionId, treeObservation(target));

  const recovered = recoverInterruptedBootstrap(target);

  assert.deepEqual(recovered, {
    ok: true,
    recovered: true,
    state: "INTERRUPTED_BOOTSTRAP_ROLLED_BACK",
  });
  assert.equal(fs.existsSync(target), false);
  assert.equal(fs.existsSync(journal), false);
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${transactionId}.failure.json`)), true);
});

test("orphan recovery never deletes content added outside the recorded transaction", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "orphan-unowned");
  fs.mkdirSync(target);
  fs.writeFileSync(path.join(target, "owned.txt"), "transaction content\n");
  const ownedDigest = treeObservation(target);
  const transactionId = "orphan-unowned";
  const journal = writeOrphanJournal(parent, target, transactionId, ownedDigest);
  fs.writeFileSync(path.join(target, "user-content.txt"), "must never be deleted\n");

  const recovered = recoverInterruptedBootstrap(target);

  assert.equal(recovered.ok, false);
  assert.equal(recovered.state, "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT");
  assert.equal(fs.readFileSync(path.join(target, "user-content.txt"), "utf8"), "must never be deleted\n");
  assert.equal(fs.existsSync(journal), true);
});

test("pre-commit PREPARED and STAGED journals clean only transaction-owned temporary roots", (t) => {
  for (const state of ["PREPARED", "STAGED"]) {
    const parent = fixture(t, `intentos-bootstrap-${state.toLowerCase()}-`);
    const target = path.join(parent, "untouched-target");
    const transactionId = `orphan-${state.toLowerCase()}`;
    const stageRoot = path.join(parent, `.intentos-stage-${transactionId}-owned`);
    const backupRoot = path.join(parent, `.intentos-backup-${transactionId}-owned`);
    fs.mkdirSync(stageRoot);
    fs.mkdirSync(backupRoot);
    fs.writeFileSync(path.join(stageRoot, "staged.txt"), "owned staged content\n");
    fs.writeFileSync(path.join(backupRoot, "backup.txt"), "owned backup content\n");
    const journal = writeOrphanJournal(parent, target, transactionId, "", {
      state,
      stage_root: stageRoot,
      backup_root: backupRoot,
    });

    const recovered = recoverInterruptedBootstrap(target);

    assert.deepEqual(recovered, {
      ok: true,
      recovered: true,
      state: "INTERRUPTED_BOOTSTRAP_PRECOMMIT_CLEANED",
    });
    assert.equal(fs.existsSync(target), false);
    assert.equal(fs.existsSync(stageRoot), false);
    assert.equal(fs.existsSync(backupRoot), false);
    assert.equal(fs.existsSync(journal), false);
    assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${transactionId}.failure.json`)), true);
  }
});
