import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  beginControlledApplyJournal as beginControlledApplyJournalRaw,
  commitControlledApplyAction,
  completeControlledApplyJournal,
  markControlledApplyActionApplied,
  markControlledApplyMutationComplete,
  prepareControlledApplyAction,
  recoverInterruptedControlledApply as recoverInterruptedControlledApplyRaw,
  rollbackControlledApply,
  writeControlledApplyReceipt,
} from "../scripts/lib/controlled-apply-transaction.mjs";
import { evidenceDigest } from "../scripts/lib/artifact-schema.mjs";

const testRoot = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(testRoot, "..");
const transactionModuleUrl = pathToFileURL(path.join(kitRoot, "scripts/lib/controlled-apply-transaction.mjs")).href;

function fixture(t) {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), "intentos-controlled-apply-"));
  const target = path.join(parent, "project");
  fs.mkdirSync(path.join(target, ".intentos"), { recursive: true });
  t.after(() => fs.rmSync(parent, { recursive: true, force: true }));
  return { parent, target };
}

function digest(content) {
  return `sha256:${crypto.createHash("sha256").update(content).digest("hex")}`;
}

const recoveryBindings = new Map();

function testRecoveryAuthority(planDigest, receiptPath, actions = []) {
  const authorityPath = `.intentos/apply-authorities/test-${planDigest.slice(-12)}.json`;
  return {
    requestDigest: digest(`request:${planDigest}`),
    authorityMode: "REQUEST_BOUND_LOCAL",
    authorityPath,
    authorityDigest: digest(`authority:${planDigest}`),
    receiptPath,
    authorizedPaths: [...new Set([
      authorityPath,
      receiptPath,
      ...actions.flatMap((action) => [action.path, action.backupPath].filter(Boolean)),
    ])].sort(),
  };
}

function beginControlledApplyJournal(options) {
  const recoveryBinding = options.recoveryBinding
    || testRecoveryAuthority(options.planDigest, options.receiptPath, options.actions);
  const handle = beginControlledApplyJournalRaw({ ...options, recoveryBinding });
  recoveryBindings.set(fs.realpathSync(options.targetRoot), {
    ...recoveryBinding,
    planDigest: options.planDigest,
    receiptPath: options.receiptPath,
  });
  return handle;
}

function recoverInterruptedControlledApply(targetRoot, options = {}) {
  const binding = options.binding || recoveryBindings.get(fs.realpathSync(targetRoot));
  return recoverInterruptedControlledApplyRaw(targetRoot, { ...options, binding });
}

function writePreparedTarget(targetRoot, entry, content) {
  const target = path.join(targetRoot, entry.path);
  const temporary = path.join(targetRoot, entry.transaction_temp_path);
  fs.mkdirSync(path.dirname(temporary), { recursive: true });
  fs.writeFileSync(temporary, content, { flag: "wx" });
  fs.renameSync(temporary, target);
}

function prepareInterruptedRollback(target, suffix) {
  const original = `original ${suffix}\n`;
  const replacement = `replacement ${suffix}\n`;
  fs.writeFileSync(path.join(target, "authority.md"), original);
  const action = {
    id: "A-001",
    path: "authority.md",
    backupPath: `.intentos/backups/${suffix}/authority.md`,
    hashBefore: digest(original),
    expectedHashAfter: digest(replacement),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest(`plan-${suffix}`),
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
  });
  const entry = prepareControlledApplyAction(handle, action);
  writePreparedTarget(target, entry, replacement);
  markControlledApplyActionApplied(handle, action.id, action.expectedHashAfter);
  markControlledApplyMutationComplete(handle);
  return { original, action, handle };
}

test("hard process interruption restores every journaled target and the prior receipt", (t) => {
  const { parent, target } = fixture(t);
  const original = "original project authority\n";
  const replacement = "updated by approved transaction\n";
  const generated = "new governed asset\n";
  const priorReceipt = "prior apply receipt\n";
  fs.writeFileSync(path.join(target, "authority.md"), original);
  fs.writeFileSync(path.join(target, ".intentos/apply-receipt.md"), priorReceipt);

  const actions = [
    {
      id: "A-001",
      path: "authority.md",
      backupPath: ".intentos/backups/interrupted/authority.md",
      hashBefore: digest(original),
      expectedHashAfter: digest(replacement),
    },
    {
      id: "A-002",
      path: "generated/asset.md",
      backupPath: null,
      hashBefore: null,
      expectedHashAfter: digest(generated),
    },
  ];
  const interruptedPlanDigest = digest("hard-interruption-plan");
  const interruptedRecoveryAuthority = testRecoveryAuthority(
    interruptedPlanDigest,
    ".intentos/apply-receipt.md",
    actions,
  );
  const script = `
    import fs from "node:fs";
    import path from "node:path";
    import {
      beginControlledApplyJournal,
      markControlledApplyActionApplied,
      markControlledApplyMutationComplete,
      prepareControlledApplyAction,
      writeControlledApplyReceipt,
    } from ${JSON.stringify(transactionModuleUrl)};
    const target = ${JSON.stringify(target)};
    const actions = ${JSON.stringify(actions)};
    const contents = [${JSON.stringify(replacement)}, ${JSON.stringify(generated)}];
    const handle = beginControlledApplyJournal({
      targetRoot: target,
      planDigest: ${JSON.stringify(interruptedPlanDigest)},
      receiptPath: ".intentos/apply-receipt.md",
      actions,
      recoveryBinding: ${JSON.stringify(interruptedRecoveryAuthority)},
    });
    for (let index = 0; index < actions.length; index += 1) {
      const action = actions[index];
      const entry = prepareControlledApplyAction(handle, action);
      const destination = path.join(target, action.path);
      const temporary = path.join(target, entry.transaction_temp_path);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(temporary, contents[index], { flag: "wx" });
      fs.renameSync(temporary, destination);
      markControlledApplyActionApplied(handle, action.id, action.expectedHashAfter);
    }
    markControlledApplyMutationComplete(handle);
    writeControlledApplyReceipt(handle, "pending activation receipt\\n", "pending-activation");
    process.exit(92);
  `;
  const child = spawnSync(process.execPath, ["--input-type=module", "-e", script], { encoding: "utf8" });
  assert.equal(child.status, 92, child.stderr || child.stdout);
  assert.equal(fs.readFileSync(path.join(target, "authority.md"), "utf8"), replacement);
  assert.equal(fs.existsSync(path.join(target, "generated/asset.md")), true);

  const recovery = recoverInterruptedControlledApply(target, {
    binding: {
      ...interruptedRecoveryAuthority,
      planDigest: interruptedPlanDigest,
    },
  });
  assert.equal(recovery.ok, true, (recovery.errors || []).join("; "));
  assert.equal(recovery.state, "INTERRUPTED_CONTROLLED_APPLY_ROLLED_BACK");
  assert.equal(fs.readFileSync(path.join(target, "authority.md"), "utf8"), original);
  assert.equal(fs.existsSync(path.join(target, "generated/asset.md")), false);
  assert.equal(fs.readFileSync(path.join(target, ".intentos/apply-receipt.md"), "utf8"), priorReceipt);
  assert.equal(fs.existsSync(path.join(target, ".intentos/backups/interrupted/authority.md")), false);
  assert.equal(fs.readdirSync(parent).some((name) => name.endsWith(".pending.json")), false);
  const recoveryReceiptName = fs.readdirSync(target).find((name) => name.endsWith(".failure.json"));
  assert.ok(recoveryReceiptName);
  const recoveryReceipt = JSON.parse(fs.readFileSync(path.join(target, recoveryReceiptName), "utf8"));
  assert.deepEqual(recoveryReceipt.actions.map((item) => [item.id, item.state]), [["A-001", "APPLIED"], ["A-002", "APPLIED"]]);
  assert.deepEqual(recoveryReceipt.receipt_phases.map((item) => [item.phase, item.state]), [["pending-activation", "APPLIED"]]);
  assert.equal(recoveryReceipt.lock.transaction_id, recoveryReceipt.transaction_id);
  assert.match(recoveryReceipt.recovery_digest, /^sha256:[a-f0-9]{64}$/);
});

test("recovery blocks when an interrupted transaction journal exists but is malformed", (t) => {
  const { target } = fixture(t);
  const { handle } = prepareInterruptedRollback(target, "malformed-journal");
  const changed = fs.readFileSync(path.join(target, "authority.md"), "utf8");
  fs.writeFileSync(handle.file, "{malformed\n");

  const recovery = recoverInterruptedControlledApply(target);

  assert.equal(recovery.ok, false);
  assert.equal(recovery.recovered, false);
  assert.equal(recovery.state, "CONTROLLED_APPLY_RECOVERY_INVALID");
  assert.match(recovery.errors.join("; "), /exists but is unreadable or malformed/);
  assert.equal(fs.readFileSync(path.join(target, "authority.md"), "utf8"), changed);
  assert.equal(fs.existsSync(handle.file), true);
  assert.equal(fs.existsSync(handle.lockFile), true);
});

test("recovery resumes safely after interruption immediately after rollback restoration", (t) => {
  const { target } = fixture(t);
  const { original } = prepareInterruptedRollback(target, "restored-window");

  assert.throws(() => recoverInterruptedControlledApply(target, {
    afterRollbackRestored: () => { throw new Error("simulated post-restore interruption"); },
  }), /simulated post-restore interruption/);
  assert.equal(fs.readFileSync(path.join(target, "authority.md"), "utf8"), original);

  const recovery = recoverInterruptedControlledApply(target);
  assert.equal(recovery.ok, true, JSON.stringify(recovery));
  assert.equal(recovery.state, "INTERRUPTED_CONTROLLED_APPLY_ROLLED_BACK");
  assert.equal(fs.readFileSync(path.join(target, "authority.md"), "utf8"), original);
});

test("recovery resumes safely after cleanup completed before close-out was persisted", (t) => {
  const { target } = fixture(t);
  const { original } = prepareInterruptedRollback(target, "cleanup-window");

  assert.throws(() => recoverInterruptedControlledApply(target, {
    afterRollbackCleanup: () => { throw new Error("simulated post-cleanup interruption"); },
  }), /simulated post-cleanup interruption/);
  assert.equal(fs.readFileSync(path.join(target, "authority.md"), "utf8"), original);

  const recovery = recoverInterruptedControlledApply(target);
  assert.equal(recovery.ok, true, JSON.stringify(recovery));
  assert.equal(recovery.state, "INTERRUPTED_CONTROLLED_APPLY_ROLLED_BACK");
  assert.equal(fs.readFileSync(path.join(target, "authority.md"), "utf8"), original);
});

test("recovery blocks instead of overwriting an unrelated post-crash change", (t) => {
  const { target } = fixture(t);
  const approved = "approved content\n";
  const unrelated = "different user content\n";
  const action = {
    id: "A-001",
    path: "generated.md",
    backupPath: null,
    hashBefore: null,
    expectedHashAfter: digest(approved),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest("unrelated-change-plan"),
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
  });
  const entry = prepareControlledApplyAction(handle, action);
  writePreparedTarget(target, entry, approved);
  markControlledApplyActionApplied(handle, action.id, action.expectedHashAfter);
  fs.writeFileSync(path.join(target, "generated.md"), unrelated);

  const recovery = recoverInterruptedControlledApply(target);
  assert.equal(recovery.ok, false);
  assert.equal(recovery.state, "CONTROLLED_APPLY_RECOVERY_BLOCKED");
  assert.match(recovery.errors.join("; "), /changed outside/);
  assert.equal(fs.readFileSync(path.join(target, "generated.md"), "utf8"), unrelated);
});

test("a predeclared action graph safely recovers a partially attempted batch", (t) => {
  const { target } = fixture(t);
  const existingPath = path.join(target, "existing.md");
  const existingBefore = "existing before\n";
  const existingAfter = "existing after\n";
  const untouchedPath = path.join(target, "never-attempted.md");
  fs.writeFileSync(existingPath, existingBefore);
  const actions = [
    {
      id: "A-001",
      path: "existing.md",
      backupPath: ".intentos/backups/partial-batch/existing.md",
      hashBefore: digest(existingBefore),
      expectedHashAfter: digest(existingAfter),
    },
    {
      id: "A-002",
      path: "never-attempted.md",
      backupPath: null,
      hashBefore: null,
      expectedHashAfter: digest("not written\n"),
    },
  ];
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest("partial-batch-plan"),
    receiptPath: ".intentos/apply-receipt.md",
    actions,
  });
  const persisted = JSON.parse(fs.readFileSync(handle.file, "utf8"));
  assert.deepEqual(persisted.action_journal.map((item) => item.id), ["A-001", "A-002"]);
  assert.ok(persisted.action_journal.every((item) => item.state === "PREPARED"));

  const entry = prepareControlledApplyAction(handle, actions[0]);
  writePreparedTarget(target, entry, existingAfter);
  markControlledApplyActionApplied(handle, actions[0].id, actions[0].expectedHashAfter);
  const appliedJournal = JSON.parse(fs.readFileSync(handle.file, "utf8"));
  assert.equal(appliedJournal.action_journal[0].state, "APPLIED");
  assert.equal(appliedJournal.action_journal[0].observed_hash_after, actions[0].expectedHashAfter);

  const recovery = recoverInterruptedControlledApply(target);
  assert.equal(recovery.ok, true, JSON.stringify(recovery));
  assert.equal(recovery.state, "INTERRUPTED_CONTROLLED_APPLY_ROLLED_BACK");
  assert.equal(fs.readFileSync(existingPath, "utf8"), existingBefore);
  assert.equal(fs.existsSync(untouchedPath), false);
});

test("receipt writing refuses to overwrite an external change made after transaction start", (t) => {
  const { target } = fixture(t);
  const receiptPath = path.join(target, ".intentos/apply-receipt.md");
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest("receipt-conflict-plan"),
    receiptPath: ".intentos/apply-receipt.md",
    actions: [],
  });
  fs.writeFileSync(receiptPath, "external receipt owner\n");

  assert.throws(
    () => writeControlledApplyReceipt(handle, "transaction receipt\n", "final-failure"),
    /changed outside the current transaction/,
  );
  assert.equal(fs.readFileSync(receiptPath, "utf8"), "external receipt owner\n");

  const recovery = recoverInterruptedControlledApply(target);
  assert.equal(recovery.ok, false);
  assert.equal(recovery.state, "CONTROLLED_APPLY_RECOVERY_BLOCKED");
  assert.match(recovery.errors.join("; "), /receipt changed outside/);
  assert.equal(fs.readFileSync(receiptPath, "utf8"), "external receipt owner\n");
});

test("a rolled-back pending receipt can be replaced by the terminal failure receipt", (t) => {
  const { target } = fixture(t);
  const priorReceipt = "prior receipt\n";
  fs.writeFileSync(path.join(target, ".intentos/apply-receipt.md"), priorReceipt);
  const action = {
    id: "A-001",
    path: "generated/asset.md",
    backupPath: null,
    hashBefore: null,
    expectedHashAfter: digest("generated asset\n"),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest("rollback-receipt-plan"),
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
    recoveryBinding: testRecoveryAuthority(
      digest("rollback-receipt-plan"),
      ".intentos/apply-receipt.md",
      [action],
    ),
  });
  const entry = prepareControlledApplyAction(handle, action);
  writePreparedTarget(target, entry, "generated asset\n");
  markControlledApplyActionApplied(handle, action.id, action.expectedHashAfter);
  markControlledApplyMutationComplete(handle);
  writeControlledApplyReceipt(handle, "pending activation\n", "pending-activation");

  const rollback = rollbackControlledApply(handle);
  assert.equal(rollback.ok, true, (rollback.errors || []).join("; "));
  assert.equal(fs.readFileSync(path.join(target, ".intentos/apply-receipt.md"), "utf8"), priorReceipt);

  writeControlledApplyReceipt(handle, "terminal failure\n", "final-failure");
  assert.equal(fs.readFileSync(path.join(target, ".intentos/apply-receipt.md"), "utf8"), "terminal failure\n");
});

test("recovery rejects a structurally plausible receipt without trusted full-chain validation", (t) => {
  const { target } = fixture(t);
  const content = "verified governed asset\n";
  const planDigest = digest("verified-plan");
  const action = {
    id: "A-001",
    path: "governed.md",
    backupPath: null,
    hashBefore: null,
    expectedHashAfter: digest(content),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest,
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
  });
  const entry = prepareControlledApplyAction(handle, action);
  writePreparedTarget(target, entry, content);
  markControlledApplyActionApplied(handle, action.id, action.expectedHashAfter);
  markControlledApplyMutationComplete(handle);
  const evidence = {
    artifact_type: "apply_execution_receipt",
    receipt_state: "APPLY_VERIFIED",
    outcome: "APPLY_VERIFIED",
    execution_plan: { plan_digest: planDigest },
    activation: { status: "VERIFIED" },
    boundary: { only_approved_actions_executed: true },
    actions: [{ id: action.id, result: "APPLIED", hash_after: action.expectedHashAfter }],
  };
  const receipt = [
    "# Apply Execution Receipt",
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(evidence, null, 2),
    "```",
    "",
  ].join("\n");
  writeControlledApplyReceipt(handle, receipt, "final-success");

  const recovery = recoverInterruptedControlledApply(target);
  assert.equal(recovery.ok, true, (recovery.errors || []).join("; "));
  assert.equal(recovery.state, "INTERRUPTED_CONTROLLED_APPLY_ROLLED_BACK");
  assert.equal(recovery.planDigest, planDigest);
  assert.equal(fs.existsSync(path.join(target, "governed.md")), false);
});

test("recovery accepts an exact receipt only after a trusted validator closes the full chain", (t) => {
  const { target } = fixture(t);
  const content = "verified governed asset\n";
  const planDigest = digest("trusted-verified-plan");
  const action = {
    id: "A-001",
    path: "governed.md",
    backupPath: null,
    hashBefore: null,
    expectedHashAfter: digest(content),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest,
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
  });
  const entry = prepareControlledApplyAction(handle, action);
  writePreparedTarget(target, entry, content);
  markControlledApplyActionApplied(handle, action.id, action.expectedHashAfter);
  markControlledApplyMutationComplete(handle);
  const evidence = {
    artifact_type: "apply_execution_receipt",
    receipt_state: "APPLY_VERIFIED",
    outcome: "APPLY_VERIFIED",
    execution_plan: { plan_digest: planDigest },
    activation: { status: "VERIFIED" },
    boundary: { only_approved_actions_executed: true },
    actions: [{ id: action.id, result: "APPLIED", hash_after: action.expectedHashAfter }],
  };
  writeControlledApplyReceipt(handle, [
    "# Apply Execution Receipt", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(evidence, null, 2), "```", "",
  ].join("\n"), "final-success");

  const recovery = recoverInterruptedControlledApply(target, {
    validateVerifiedReceipt: () => ({ ok: true, errors: [] }),
  });
  assert.equal(recovery.ok, true, (recovery.errors || []).join("; "));
  assert.equal(recovery.state, "CONTROLLED_APPLY_SUCCESS_RECOVERED");
  assert.equal(fs.readFileSync(path.join(target, "governed.md"), "utf8"), content);
});

test("a target lock prevents two controlled applies from starting concurrently", (t) => {
  const { target } = fixture(t);
  const action = {
    id: "A-001",
    path: "authority.md",
    hashBefore: null,
    expectedHashAfter: digest("first\n"),
  };
  const first = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest("plan-one"),
    receiptPath: "apply-receipts/one.md",
    actions: [action],
  });
  t.after(() => {
    if (fs.existsSync(first.file)) fs.rmSync(first.file, { force: true });
    if (first.lockFile && fs.existsSync(first.lockFile)) fs.rmSync(first.lockFile, { force: true });
  });

  assert.throws(() => beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest("plan-two"),
    receiptPath: "apply-receipts/two.md",
    actions: [{ ...action, expectedHashAfter: digest("second\n") }],
  }), /already locked|stale lock/);
});

test("recovery rejects a re-digested action log outside the exact graph", (t) => {
  const { target } = fixture(t);
  const protectedFile = path.join(target, "protected.md");
  fs.writeFileSync(protectedFile, "must remain untouched\n");
  const action = {
    id: "A-001",
    path: "approved.md",
    hashBefore: null,
    expectedHashAfter: digest("approved\n"),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest("exact-graph-plan"),
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
  });
  prepareControlledApplyAction(handle, action);

  const forged = JSON.parse(fs.readFileSync(handle.file, "utf8"));
  forged.action_journal[0].path = "protected.md";
  forged.action_journal[0].expected_hash_after = digest("must remain untouched\n");
  forged.action_journal[0].transaction_temp_path = ".protected.md.intentos-forged.tmp";
  const { journal_digest: _digest, ...base } = forged;
  forged.journal_digest = evidenceDigest(base, []);
  fs.writeFileSync(handle.file, `${JSON.stringify(forged, null, 2)}\n`);

  const recovery = recoverInterruptedControlledApply(target);
  assert.equal(recovery.ok, false);
  assert.equal(recovery.state, "CONTROLLED_APPLY_RECOVERY_INVALID");
  assert.match(recovery.errors.join("; "), /outside its exact graph|temp path is invalid/);
  assert.equal(fs.readFileSync(protectedFile, "utf8"), "must remain untouched\n");
});

test("parent-forged recovery journal and lock are never scanned without the project-local binding anchor", (t) => {
  const { parent, target } = fixture(t);
  const protectedFile = path.join(target, "protected.md");
  fs.writeFileSync(protectedFile, "current project content\n");
  const planDigest = digest("forged-parent-plan");
  const binding = {
    ...testRecoveryAuthority(planDigest, ".intentos/apply-receipt.md"),
    planDigest,
  };
  const transactionId = `apply-${planDigest.slice(7, 23)}-forged-parent`;
  const journalBase = {
    schema_version: "1.113.0",
    artifact_type: "controlled_apply_pending_journal",
    transaction_id: transactionId,
    owner_pid: 99999999,
    target_root: fs.realpathSync(target),
    plan_digest: planDigest,
    receipt_path: ".intentos/apply-receipt.md",
    expected_actions: [{
      id: "A-001",
      path: "protected.md",
      backup_path: null,
      hash_before: null,
      expected_hash_after: digest("current project content\n"),
      receipt_required: true,
    }],
    action_journal: [],
    receipt_journal: [],
  };
  const forgedJournal = {
    ...journalBase,
    journal_digest: evidenceDigest(journalBase, []),
  };
  const forgedJournalPath = path.join(parent, `.intentos-controlled-apply-${transactionId}.pending.json`);
  fs.writeFileSync(forgedJournalPath, `${JSON.stringify(forgedJournal, null, 2)}\n`);

  const lockBase = {
    schema_version: "1.113.0",
    artifact_type: "controlled_apply_target_lock",
    target_root: fs.realpathSync(target),
    transaction_id: transactionId,
    plan_digest: planDigest,
    owner_pid: 99999999,
    created_at: new Date().toISOString(),
  };
  const forgedParentLockPath = path.join(parent, ".intentos-controlled-apply.lock.json");
  fs.writeFileSync(forgedParentLockPath, `${JSON.stringify({
    ...lockBase,
    lock_digest: evidenceDigest(lockBase, []),
  }, null, 2)}\n`);

  const recovery = recoverInterruptedControlledApplyRaw(target, { binding });
  assert.equal(recovery.ok, true, JSON.stringify(recovery));
  assert.equal(recovery.recovered, false);
  assert.equal(recovery.state, "NO_PENDING_CONTROLLED_APPLY");
  assert.equal(fs.readFileSync(protectedFile, "utf8"), "current project content\n");
  assert.equal(fs.existsSync(forgedJournalPath), true);
  assert.equal(fs.existsSync(forgedParentLockPath), true);
});

test("recovery refuses a live journal when the current plan/request authority binding differs", (t) => {
  const { target } = fixture(t);
  const content = "transaction-owned content\n";
  const planDigest = digest("bound-recovery-plan");
  const action = {
    id: "A-001",
    path: "bound.md",
    hashBefore: null,
    expectedHashAfter: digest(content),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest,
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
  });
  prepareControlledApplyAction(handle, action);
  const observed = commitControlledApplyAction(handle, action.id, content);
  markControlledApplyActionApplied(handle, action.id, observed);

  const expectedBinding = recoveryBindings.get(fs.realpathSync(target));
  const recovery = recoverInterruptedControlledApplyRaw(target, {
    binding: { ...expectedBinding, authorityDigest: digest("different-current-authority") },
  });
  assert.equal(recovery.ok, false);
  assert.equal(recovery.state, "CONTROLLED_APPLY_RECOVERY_INVALID");
  assert.match(recovery.errors.join("; "), /current plan\/request authority/);
  assert.equal(fs.readFileSync(path.join(target, "bound.md"), "utf8"), content);
  assert.equal(fs.existsSync(handle.file), true);
  assert.equal(fs.existsSync(handle.lockFile), true);
});

test("APPLY_VERIFIED closeout validation failure immediately rolls back and verifies preimages", (t) => {
  const { target } = fixture(t);
  const original = "pre-apply authority\n";
  const applied = "applied authority\n";
  const planDigest = digest("closeout-failure-plan");
  fs.writeFileSync(path.join(target, "authority.md"), original);
  const action = {
    id: "A-001",
    path: "authority.md",
    backupPath: ".intentos/backups/closeout-failure/authority.md",
    hashBefore: digest(original),
    expectedHashAfter: digest(applied),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest,
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
  });
  prepareControlledApplyAction(handle, action);
  const observed = commitControlledApplyAction(handle, action.id, applied);
  markControlledApplyActionApplied(handle, action.id, observed);
  markControlledApplyMutationComplete(handle);
  const evidence = {
    artifact_type: "apply_execution_receipt",
    receipt_state: "APPLY_VERIFIED",
    outcome: "APPLY_VERIFIED",
    execution_plan: { plan_digest: planDigest },
    activation: { status: "VERIFIED" },
    boundary: { only_authorized_actions_executed: true },
    actions: [{ id: action.id, result: "APPLIED", hash_after: action.expectedHashAfter }],
  };
  writeControlledApplyReceipt(handle, [
    "# Apply Execution Receipt", "", "## Machine-Readable Evidence", "", "```json",
    JSON.stringify(evidence, null, 2), "```", "",
  ].join("\n"), "final-success");

  assert.throws(
    () => completeControlledApplyJournal(handle, {
      outcome: "APPLY_VERIFIED",
      validateVerifiedReceipt: () => ({ ok: false, errors: ["simulated closeout chain failure"] }),
    }),
    /immediately rolled back and verified in this command/,
  );
  assert.equal(fs.readFileSync(path.join(target, "authority.md"), "utf8"), original);
  assert.equal(fs.existsSync(path.join(target, ".intentos/apply-receipt.md")), false);
  assert.equal(fs.existsSync(path.join(target, ".intentos/backups/closeout-failure/authority.md")), false);
  assert.equal(fs.existsSync(handle.file), false);
  assert.equal(fs.existsSync(handle.lockFile), false);
  const recovery = recoverInterruptedControlledApply(target);
  assert.equal(recovery.recovered, false);
  assert.equal(recovery.state, "NO_PENDING_CONTROLLED_APPLY");
});

test("staged write fails closed when its checked parent is swapped to an out-of-root symlink", (t) => {
  const { parent, target } = fixture(t);
  const nested = path.join(target, "nested");
  const displaced = path.join(target, "nested-displaced");
  const outside = path.join(parent, "outside");
  fs.mkdirSync(nested);
  fs.mkdirSync(outside);
  const content = "must stay inside project\n";
  const action = {
    id: "A-001",
    path: "nested/generated.md",
    hashBefore: null,
    expectedHashAfter: digest(content),
  };
  let swapped = false;
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest("staged-parent-swap-plan"),
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
    mutationHooks: {
      beforeMutation: ({ operation }) => {
        if (operation !== "action-target-link" || swapped) return;
        swapped = true;
        fs.renameSync(nested, displaced);
        fs.symlinkSync(outside, nested, "dir");
      },
    },
  });
  prepareControlledApplyAction(handle, action);

  assert.throws(
    () => commitControlledApplyAction(handle, action.id, content),
    /parent chain|canonical|symlink/,
  );
  assert.equal(swapped, true);
  assert.equal(fs.existsSync(path.join(outside, "generated.md")), false);
  assert.equal(fs.readFileSync(path.join(target, ".intentos-controlled-apply.lock.json"), "utf8").includes(handle.record.transaction_id), true);
});

test("rollback refuses to delete a target whose inode is replaced after validation", (t) => {
  const { target } = fixture(t);
  const original = "rollback original\n";
  const applied = "rollback applied\n";
  const external = "replacement owned outside the transaction\n";
  const targetFile = path.join(target, "authority.md");
  const displaced = path.join(target, "authority.applied-displaced.md");
  fs.writeFileSync(targetFile, original);
  const action = {
    id: "A-001",
    path: "authority.md",
    backupPath: ".intentos/backups/rollback-replacement/authority.md",
    hashBefore: digest(original),
    expectedHashAfter: digest(applied),
  };
  const handle = beginControlledApplyJournal({
    targetRoot: target,
    planDigest: digest("rollback-target-replacement-plan"),
    receiptPath: ".intentos/apply-receipt.md",
    actions: [action],
  });
  prepareControlledApplyAction(handle, action);
  const observed = commitControlledApplyAction(handle, action.id, applied);
  markControlledApplyActionApplied(handle, action.id, observed);
  let replaced = false;

  const recovery = recoverInterruptedControlledApply(target, {
    mutationHooks: {
      beforeMutation: ({ operation }) => {
        if (operation !== "rollback-target-unlink" || replaced) return;
        replaced = true;
        fs.renameSync(targetFile, displaced);
        fs.writeFileSync(targetFile, external, { flag: "wx" });
      },
    },
  });
  assert.equal(replaced, true);
  assert.equal(recovery.ok, false);
  assert.equal(recovery.state, "CONTROLLED_APPLY_RECOVERY_BLOCKED");
  assert.match(recovery.errors.join("; "), /identity changed|target was not restored/);
  assert.equal(fs.readFileSync(targetFile, "utf8"), external);
  assert.equal(fs.readFileSync(displaced, "utf8"), applied);
});
