import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { evidenceDigest, extractMachineReadableEvidence } from "./artifact-schema.mjs";
import { assertSafeRelativePath, assertSafeWritePath } from "./path-safety.mjs";

const JOURNAL_PREFIX = ".intentos-controlled-apply-";
const JOURNAL_SUFFIX = ".pending.json";
const MAX_RECEIPT_BACKUP_BYTES = 4 * 1024 * 1024;
const BACKUP_PREFIX = ".intentos/backups/";
const ROLLBACK_RESTORED_STATE = "ROLLBACK_RESTORED_PENDING_CLEANUP";
const ROLLBACK_CLEANUP_STATE = "ROLLBACK_CLEANUP_COMPLETE_PENDING_CLOSE";
const TARGET_LOCK_RELATIVE_PATH = ".intentos-controlled-apply.lock.json";
const RECOVERY_CLAIM_RELATIVE_PATH = ".intentos-controlled-apply.recovery.lock.json";
const RESERVED_TRANSACTION_PATHS = new Set([
  TARGET_LOCK_RELATIVE_PATH,
  RECOVERY_CLAIM_RELATIVE_PATH,
]);

function isReservedTransactionPath(relativePath) {
  return relativePath.startsWith(JOURNAL_PREFIX)
    || [...RESERVED_TRANSACTION_PATHS].some((reserved) => (
    relativePath === reserved || relativePath.startsWith(`${reserved}/`)
    ));
}

export function recoverInterruptedControlledApply(targetRoot, options = {}) {
  const root = canonicalTargetRoot(targetRoot);
  let expectedBinding;
  try {
    expectedBinding = normalizeExpectedRecoveryBinding(root, options.binding);
  } catch (error) {
    return {
      ok: false,
      recovered: false,
      state: "CONTROLLED_APPLY_RECOVERY_UNBOUND",
      errors: [error.message],
    };
  }
  const lockFile = targetLockPath(root);
  const lock = readLock(lockFile);
  if (!lock) return noRecovery("NO_PENDING_CONTROLLED_APPLY");
  const lockValidation = validateTargetLock(lock, root, { binding: expectedBinding });
  if (!lockValidation.ok) {
    return { ok: false, recovered: false, state: "CONTROLLED_APPLY_RECOVERY_INVALID", errors: lockValidation.errors };
  }
  if (processAlive(lock.owner_pid) && Number(lock.owner_pid) !== process.pid) {
    return {
      ok: false,
      recovered: false,
      state: "ACTIVE_CONTROLLED_APPLY",
      errors: [`controlled apply ${lock.transaction_id} is still active`],
    };
  }

  const file = journalPath(root, lock.transaction_id);
  const journalRead = readRecoveryJournal(file);
  if (journalRead.state === "MISSING") {
    releaseTargetLock(lockFile, lock.transaction_id, { root, lock, mutationHooks: options.mutationHooks });
    return { ok: true, recovered: true, state: "STALE_CONTROLLED_APPLY_LOCK_RELEASED", planDigest: lock.plan_digest };
  }
  if (journalRead.state === "INVALID") {
    return {
      ok: false,
      recovered: false,
      state: "CONTROLLED_APPLY_RECOVERY_INVALID",
      errors: [journalRead.error],
    };
  }
  const journal = journalRead.journal;
  const validation = validateJournal(journal, root, { binding: expectedBinding, lock });
  if (!validation.ok) {
    return { ok: false, recovered: false, state: "CONTROLLED_APPLY_RECOVERY_INVALID", errors: validation.errors };
  }

  const recovery = acquireRecoveryClaim(root, lock, options.mutationHooks);
  const context = {
    file,
    lockFile,
    record: journal,
    recoveryClaimFile: recovery.file,
    recoveryMode: true,
    mutationHooks: options.mutationHooks,
  };
  try {
    if (verifiedReceiptMatches(journal, root)
      && trustedReceiptValidation(options.validateVerifiedReceipt, journal, root).ok
      && validateOwnedBackups(journal, root).ok) {
      cleanupTransactionTemps(journal, root, context);
      removeJournalFile(file, root, context);
      releaseTargetLock(lockFile, journal.transaction_id, context);
      fsyncDirectory(root);
      return {
        ok: true,
        recovered: true,
        state: "CONTROLLED_APPLY_SUCCESS_RECOVERED",
        receiptPath: journal.receipt_path,
        planDigest: journal.plan_digest,
      };
    }

    const rollback = rollbackJournal(journal, root, context);
    if (!rollback.ok) {
      persistJournal(file, {
        ...journal,
        owner_pid: process.pid,
        state: "ROLLBACK_INCOMPLETE",
        recovery_errors: rollback.errors,
        updated_at: new Date().toISOString(),
      }, { context });
      return {
        ok: false,
        recovered: false,
        state: "CONTROLLED_APPLY_RECOVERY_BLOCKED",
        errors: rollback.errors,
      };
    }
    let recoveredJournal = persistRollbackState(file, journal, ROLLBACK_RESTORED_STATE, {
      rollback_restored_at: journal.rollback_restored_at || new Date().toISOString(),
      recovery_errors: [],
    }, context);
    context.record = recoveredJournal;
    options.afterRollbackRestored?.({ journal: recoveredJournal, targetRoot: root });
    try {
      cleanupRollbackBackups(recoveredJournal, root, {}, context);
    } catch (error) {
      persistJournal(file, {
        ...recoveredJournal,
        owner_pid: process.pid,
        state: ROLLBACK_RESTORED_STATE,
        recovery_errors: [error.message],
        updated_at: new Date().toISOString(),
      }, { context });
      return {
        ok: false,
        recovered: false,
        state: "CONTROLLED_APPLY_RECOVERY_BLOCKED",
        errors: [error.message],
      };
    }
    options.afterRollbackCleanup?.({ journal: recoveredJournal, targetRoot: root });
    recoveredJournal = persistRollbackState(file, recoveredJournal, ROLLBACK_CLEANUP_STATE, {
      rollback_cleanup_completed_at: recoveredJournal.rollback_cleanup_completed_at || new Date().toISOString(),
      recovery_errors: [],
    }, context);
    context.record = recoveredJournal;
    writeRecoveryReceipt(root, recoveredJournal, rollback);
    removeJournalFile(file, root, context);
    releaseTargetLock(lockFile, recoveredJournal.transaction_id, context);
    fsyncDirectory(root);
    return {
      ok: true,
      recovered: true,
      state: "INTERRUPTED_CONTROLLED_APPLY_ROLLED_BACK",
      receiptPath: journal.receipt_path,
      planDigest: journal.plan_digest,
    };
  } finally {
    releaseRecoveryClaim(recovery, root, options.mutationHooks);
  }
}

export function beginControlledApplyJournal(options = {}) {
  const root = canonicalTargetRoot(options.targetRoot);
  const planDigest = requiredDigest(options.planDigest, "controlled apply plan digest");
  const receiptPath = assertSafeRelativePath(String(options.receiptPath || ""), "controlled apply receipt path");
  const actions = (options.actions || []).map(normalizeAction);
  validateExactActionPaths(actions, receiptPath);
  const backupRunRoot = exactBackupRunRoot(actions);
  const transactionId = `apply-${planDigest.slice("sha256:".length, "sha256:".length + 16)}-${crypto.randomUUID()}`;
  const parent = path.dirname(root);
  const file = journalPath(root, transactionId);
  const recoveryBinding = createRecoveryBinding(root, {
    ...options.recoveryBinding,
    planDigest,
    receiptPath,
    actions,
  });
  const lockFile = acquireTargetLock(root, { transactionId, planDigest, recoveryBinding }, options.mutationHooks);
  const lock = readLock(lockFile);
  const transactionContext = {
    file,
    lockFile,
    record: { transaction_id: transactionId, target_root: root, plan_digest: planDigest, recovery_binding: recoveryBinding },
    mutationHooks: options.mutationHooks,
  };
  let receiptBefore;
  try {
    receiptBefore = captureReceiptBefore(root, receiptPath, transactionContext);
  } catch (error) {
    releaseTargetLock(lockFile, transactionId, transactionContext);
    throw error;
  }
  const now = new Date().toISOString();
  const record = {
    schema_version: "1.113.0",
    artifact_type: "controlled_apply_pending_journal",
    transaction_id: transactionId,
    owner_pid: process.pid,
    target_root: root,
    plan_digest: planDigest,
    recovery_binding: recoveryBinding,
    receipt_path: receiptPath,
    receipt_before: receiptBefore,
    receipt_journal: [],
    created_at: now,
    updated_at: now,
    state: "PREPARED",
    backup_run_root: backupRunRoot,
    backup_root_ownership: backupRunRoot ? "UNOWNED" : "NOT_REQUIRED",
    expected_actions: actions,
    action_journal: actions.map((action) => ({
      ...action,
      state: "PREPARED",
      backup_ownership: action.hash_before ? "UNOWNED" : "NOT_REQUIRED",
      backup_observed_hash: null,
      backup_owned_at: null,
      transaction_temp_path: transactionTempPath(transactionId, action.path, action.id),
    })),
    recovery_errors: [],
  };
  let journalPersisted = false;
  try {
    assertBackupPathsAbsent(root, actions);
    persistJournal(file, record, { exclusive: true, context: transactionContext });
    journalPersisted = true;
    const handle = {
      file,
      lockFile,
      lock,
      record: readJournal(file),
      preparedActionIds: new Set(),
      mutationHooks: options.mutationHooks,
    };
    if (backupRunRoot) {
      const backupRoot = assertSafeWritePath(root, backupRunRoot, "controlled apply backup run root");
      ensureDirectoryTree(root, backupRoot, "controlled apply backup run root", handle);
      handle.record.backup_root_ownership = "BACKUP_OWNED";
      refresh(handle);
    }
    return handle;
  } catch (error) {
    if (!journalPersisted) releaseTargetLock(lockFile, transactionId, transactionContext);
    throw error;
  }
}

export function prepareControlledApplyAction(handle, action) {
  assertTransactionLock(handle);
  const entry = normalizeAction(action);
  const expected = handle.record.expected_actions.find((item) => item.id === entry.id);
  if (!expected || JSON.stringify(expected) !== JSON.stringify(entry)) {
    throw new Error(`controlled apply action ${entry.id} is not in the exact journal graph`);
  }
  handle.preparedActionIds ||= new Set();
  if (handle.preparedActionIds.has(entry.id)) {
    throw new Error(`controlled apply action ${entry.id} was already journaled`);
  }
  const prepared = handle.record.action_journal.find((item) => item.id === entry.id);
  if (!prepared || prepared.state !== "PREPARED") {
    throw new Error(`controlled apply action ${entry.id} is not in a prepared journal state`);
  }
  handle.record.state = "MUTATION_IN_PROGRESS";
  if (prepared.hash_before) {
    createOwnedBackup(handle.record.target_root, prepared, handle);
    prepared.state = "BACKUP_OWNED";
    prepared.backup_ownership = "BACKUP_OWNED";
    prepared.backup_observed_hash = prepared.hash_before;
    prepared.backup_owned_at = new Date().toISOString();
  } else {
    const target = assertSafeWritePath(handle.record.target_root, prepared.path, `controlled apply ${prepared.id} target`);
    if (pathEntryExists(target)) throw new Error(`controlled apply action ${prepared.id} expected an absent target`);
    prepared.state = "MUTATION_INTENT";
    prepared.backup_ownership = "NOT_REQUIRED";
  }
  refresh(handle);
  handle.preparedActionIds.add(entry.id);
  return handle.record.action_journal.find((item) => item.id === entry.id);
}

export function commitControlledApplyAction(handle, actionId, content) {
  assertTransactionLock(handle);
  const entry = handle.record.action_journal.find((item) => item.id === actionId);
  if (!entry || !handle.preparedActionIds?.has(actionId)
    || !["BACKUP_OWNED", "MUTATION_INTENT"].includes(entry.state)) {
    throw new Error(`controlled apply action ${actionId} has no durable prepared mutation intent`);
  }
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
  if (digestContent(buffer) !== entry.expected_hash_after) {
    throw new Error(`controlled apply action ${actionId} staged content does not match its exact graph`);
  }
  const root = handle.record.target_root;
  let target = assertSafeWritePath(root, entry.path, `controlled apply ${actionId} target`);
  ensureDirectoryTree(root, path.dirname(target), `controlled apply ${actionId} target parent`, handle);
  target = assertSafeWritePath(root, entry.path, `controlled apply ${actionId} target after parent creation`);
  const temporary = assertSafeWritePath(root, entry.transaction_temp_path, `controlled apply ${actionId} transaction temp`);
  if (path.dirname(temporary) !== path.dirname(target)) {
    throw new Error(`controlled apply action ${actionId} transaction temp must share the target directory`);
  }
  guardedWriteNewFile(
    handle,
    root,
    temporary,
    buffer,
    `controlled apply ${actionId} transaction temp`,
    "action-temp-write",
  );
  fsyncFile(temporary);
  try {
    const currentHash = fileDigest(target);
    if (currentHash !== (entry.hash_before || null)) {
      throw new Error(`controlled apply action ${actionId} target precondition changed before commit`);
    }
    if (entry.hash_before) {
      guardedUnlink(
        handle,
        root,
        target,
        `controlled apply ${actionId} prior target`,
        "action-target-unlink",
        entry.hash_before,
      );
      fsyncDirectory(path.dirname(target));
    }
    guardedLink(
      handle,
      root,
      temporary,
      target,
      `controlled apply ${actionId} commit`,
      "action-target-link",
      entry.expected_hash_after,
    );
    fsyncFile(target);
    fsyncDirectory(path.dirname(target));
  } finally {
    if (pathEntryExists(temporary)) {
      guardedUnlink(
        handle,
        root,
        temporary,
        `controlled apply ${actionId} transaction temp cleanup`,
        "action-temp-unlink",
        entry.expected_hash_after,
      );
      fsyncDirectory(path.dirname(temporary));
    }
  }
  return entry.expected_hash_after;
}

export function markControlledApplyActionApplied(handle, actionId, observedHash) {
  assertTransactionLock(handle);
  const entry = handle.record.action_journal.find((item) => item.id === actionId);
  if (!entry || !handle.preparedActionIds?.has(actionId)) {
    throw new Error(`controlled apply action ${actionId} was not prepared`);
  }
  if (observedHash !== entry.expected_hash_after) {
    throw new Error(`controlled apply action ${actionId} observed digest does not match its exact graph`);
  }
  if (!['BACKUP_OWNED', 'MUTATION_INTENT'].includes(entry.state)) {
    throw new Error(`controlled apply action ${actionId} has no durable mutation intent`);
  }
  const target = assertSafeWritePath(handle.record.target_root, entry.path, `controlled apply ${actionId} applied target`);
  if (fileDigest(target) !== observedHash) throw new Error(`controlled apply action ${actionId} target is not an exact regular file`);
  entry.state = "APPLIED";
  entry.observed_hash_after = observedHash;
  refresh(handle);
}

export function markControlledApplyMutationComplete(handle) {
  assertTransactionLock(handle);
  const applied = new Set(handle.record.action_journal.filter((item) => item.state === "APPLIED").map((item) => item.id));
  const missing = handle.record.expected_actions.filter((item) => !applied.has(item.id));
  if (missing.length > 0) throw new Error(`controlled apply mutation graph is incomplete: ${missing.map((item) => item.id).join(", ")}`);
  handle.record.state = "TARGET_MUTATION_COMPLETE_PENDING_ACTIVATION";
  refresh(handle);
}

export function writeControlledApplyReceipt(handle, content, phase) {
  assertTransactionLock(handle);
  const phaseId = String(phase || "").trim();
  if (!/^[a-z][a-z0-9-]{1,40}$/.test(phaseId)) throw new Error(`controlled apply receipt phase is invalid: ${phaseId || "<empty>"}`);
  if (handle.record.receipt_journal.some((item) => item.phase === phaseId)) {
    throw new Error(`controlled apply receipt phase was already used: ${phaseId}`);
  }
  const targetWasRolledBack = [ROLLBACK_RESTORED_STATE, ROLLBACK_CLEANUP_STATE].includes(handle.record.state);
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
  const entry = {
    phase: phaseId,
    state: "PREPARED",
    expected_hash_after: digestContent(buffer),
    transaction_temp_path: transactionTempPath(
      handle.record.transaction_id,
      handle.record.receipt_path,
      `receipt-${phaseId}`,
    ),
  };
  handle.record.receipt_journal.push(entry);
  handle.record.state = "RECEIPT_WRITE_IN_PROGRESS";
  refresh(handle);

  const target = assertSafeWritePath(handle.record.target_root, handle.record.receipt_path, `controlled apply ${phaseId} receipt`);
  const temporary = assertSafeWritePath(handle.record.target_root, entry.transaction_temp_path, `controlled apply ${phaseId} receipt temp`);
  const priorApplied = [...handle.record.receipt_journal]
    .reverse()
    .find((item) => item.phase !== phaseId && item.state === "APPLIED");
  const expectedCurrentHash = targetWasRolledBack
    ? handle.record.receipt_before?.hash || null
    : priorApplied?.observed_hash_after || handle.record.receipt_before?.hash || null;
  const observedCurrentHash = fileDigest(target);
  if (observedCurrentHash !== expectedCurrentHash) {
    throw new Error(`controlled apply ${phaseId} receipt changed outside the current transaction`);
  }
  atomicWrite(target, buffer, temporary, handle.record.target_root, handle, `controlled apply ${phase} receipt`);
  const observed = fileDigest(target);
  if (observed !== entry.expected_hash_after) throw new Error(`controlled apply ${phaseId} receipt digest mismatch`);

  const current = handle.record.receipt_journal.find((item) => item.phase === phaseId);
  current.state = "APPLIED";
  current.observed_hash_after = observed;
  refresh(handle);
  return observed;
}

export function markControlledApplyRollbackIncomplete(handle, errors = []) {
  assertTransactionLock(handle);
  handle.record.state = "ROLLBACK_INCOMPLETE";
  handle.record.recovery_errors = errors.map(String);
  refresh(handle);
}

export function rollbackControlledApply(handle) {
  assertTransactionLock(handle);
  const rollback = rollbackJournal(handle.record, handle.record.target_root, handle);
  if (!rollback.ok) {
    handle.record.state = "ROLLBACK_INCOMPLETE";
    handle.record.recovery_errors = rollback.errors;
    refresh(handle);
    return rollback;
  }
  handle.record.state = ROLLBACK_RESTORED_STATE;
  handle.record.rollback_restored_at ||= new Date().toISOString();
  handle.record.recovery_errors = [];
  refresh(handle);
  return rollback;
}

export function completeControlledApplyJournal(handle, options = {}) {
  assertTransactionLock(handle);
  const outcome = String(options.outcome || "");
  if (outcome === "APPLY_VERIFIED") {
    try {
      if (!verifiedReceiptMatches(handle.record, handle.record.target_root)
        || !trustedReceiptValidation(options.validateVerifiedReceipt, handle.record, handle.record.target_root).ok) {
        throw new Error("controlled apply journal cannot close without an exact verified receipt");
      }
      const backups = validateOwnedBackups(handle.record, handle.record.target_root);
      if (!backups.ok) throw new Error(`controlled apply journal cannot close without exact rollback backups: ${backups.errors.join("; ")}`);
      cleanupTransactionTemps(handle.record, handle.record.target_root, handle);
    } catch (closeoutError) {
      const rollback = rollbackControlledApply(handle);
      if (!rollback.ok) {
        throw new Error(`${closeoutError.message}; immediate rollback failed: ${rollback.errors.join("; ")}`);
      }
      try {
        finalizeRolledBackTransaction(handle, rollback, { includeReceipt: true });
      } catch (rollbackCloseError) {
        throw new Error(`${closeoutError.message}; project preimages were restored but rollback closeout failed: ${rollbackCloseError.message}`);
      }
      throw new Error(`${closeoutError.message}; controlled apply was immediately rolled back and verified in this command`);
    }
  } else if (["APPLY_FAILED_ROLLED_BACK", "APPLY_FAILED_NO_WRITE"].includes(outcome)) {
    const validation = validateRestoredPreimages(handle.record, handle.record.target_root, { includeReceipt: false });
    if (!validation.ok) throw new Error(`controlled apply rollback state is not exact: ${validation.errors.join("; ")}`);
    handle.record.state = ROLLBACK_RESTORED_STATE;
    handle.record.rollback_restored_at ||= new Date().toISOString();
    handle.record.recovery_errors = [];
    refresh(handle);
    cleanupRollbackBackups(handle.record, handle.record.target_root, { includeReceipt: false }, handle);
    handle.record.state = ROLLBACK_CLEANUP_STATE;
    handle.record.rollback_cleanup_completed_at ||= new Date().toISOString();
    refresh(handle);
  } else {
    throw new Error(`controlled apply journal cannot close for outcome ${outcome || "<empty>"}`);
  }
  cleanupTransactionTemps(handle.record, handle.record.target_root, handle);
  removeJournalFile(handle.file, handle.record.target_root, handle);
  releaseTargetLock(handle.lockFile || targetLockPath(handle.record.target_root), handle.record.transaction_id, handle);
  fsyncDirectory(path.dirname(handle.file));
}

function finalizeRolledBackTransaction(handle, rollback, options = {}) {
  cleanupRollbackBackups(handle.record, handle.record.target_root, {
    includeReceipt: options.includeReceipt !== false,
  }, handle);
  handle.record.state = ROLLBACK_CLEANUP_STATE;
  handle.record.rollback_cleanup_completed_at ||= new Date().toISOString();
  refresh(handle);
  writeRecoveryReceipt(handle.record.target_root, handle.record, rollback);
  removeJournalFile(handle.file, handle.record.target_root, handle);
  releaseTargetLock(handle.lockFile || targetLockPath(handle.record.target_root), handle.record.transaction_id, handle);
  fsyncDirectory(path.dirname(handle.file));
}

function normalizeAction(action) {
  const id = String(action?.id || "");
  if (!/^A-[0-9]{3,}$/.test(id)) throw new Error(`controlled apply journal action id is invalid: ${id || "<empty>"}`);
  const targetPath = assertSafeRelativePath(String(action?.path || ""), `controlled apply action ${id} path`);
  const hashBefore = action?.hashBefore || null;
  const expectedHashAfter = requiredDigest(action?.expectedHashAfter, `controlled apply action ${id} expected digest`);
  const backupPath = action?.backupPath
    ? normalizeBackupPath(String(action.backupPath), targetPath, id)
    : null;
  if (hashBefore && !/^sha256:[a-f0-9]{64}$/.test(hashBefore)) throw new Error(`controlled apply action ${id} prior digest is invalid`);
  if (hashBefore && !backupPath) throw new Error(`controlled apply action ${id} requires a rollback backup path`);
  return {
    id,
    path: targetPath,
    backup_path: backupPath,
    hash_before: hashBefore,
    expected_hash_after: expectedHashAfter,
    receipt_required: action?.receiptRequired !== false,
  };
}

function createRecoveryBinding(root, options = {}) {
  const authority = normalizeRecoveryAuthority(options);
  const receiptPath = assertSafeRelativePath(String(options.receiptPath || ""), "controlled apply recovery receipt path");
  const actionGraph = {
    receipt_path: receiptPath,
    actions: (options.actions || []).map((action) => normalizeAction({
      id: action.id,
      path: action.path,
      backupPath: action.backup_path,
      hashBefore: action.hash_before,
      expectedHashAfter: action.expected_hash_after,
      receiptRequired: action.receipt_required,
    })),
  };
  const authorizedPaths = new Set(authority.authorized_paths);
  for (const relative of [
    receiptPath,
    ...actionGraph.actions.flatMap((action) => [action.path, action.backup_path].filter(Boolean)),
  ]) {
    if (!authorizedPaths.has(relative)) {
      throw new Error(`controlled apply recovery authority does not authorize transaction path ${relative}`);
    }
  }
  const base = {
    target_root: root,
    plan_digest: requiredDigest(options.planDigest, "controlled apply recovery plan digest"),
    request_digest: authority.request_digest,
    authority_mode: authority.authority_mode,
    authority_path: authority.authority_path,
    authority_digest: authority.authority_digest,
    authority_scope_digest: authority.authority_scope_digest,
    receipt_path: receiptPath,
    action_graph_digest: evidenceDigest(actionGraph, []),
  };
  return { ...base, binding_digest: evidenceDigest(base, []) };
}

function normalizeExpectedRecoveryBinding(root, value = {}) {
  const authority = normalizeRecoveryAuthority(value);
  return {
    target_root: root,
    plan_digest: requiredDigest(value?.planDigest, "controlled apply recovery plan digest"),
    request_digest: authority.request_digest,
    authority_mode: authority.authority_mode,
    authority_path: authority.authority_path,
    authority_digest: authority.authority_digest,
    authority_scope_digest: authority.authority_scope_digest,
    receipt_path: assertSafeRelativePath(String(value?.receiptPath || ""), "controlled apply recovery receipt path"),
  };
}

function normalizeRecoveryAuthority(value = {}) {
  const authorityMode = String(value?.authorityMode || "").trim();
  if (!/^[A-Z][A-Z0-9_]{2,63}$/.test(authorityMode)) {
    throw new Error("controlled apply recovery authority mode is missing or invalid");
  }
  const authorityPath = assertSafeRelativePath(
    String(value?.authorityPath || ""),
    "controlled apply recovery authority path",
  );
  if (isReservedTransactionPath(authorityPath)) {
    throw new Error("controlled apply recovery authority path uses a reserved transaction path");
  }
  const authorizedPaths = [...new Set((value?.authorizedPaths || []).map((item) => (
    assertSafeRelativePath(String(item || ""), "controlled apply recovery authorized path")
  )))].sort();
  if (authorizedPaths.length === 0) throw new Error("controlled apply recovery authority has no authorized target paths");
  if (authorizedPaths.some(isReservedTransactionPath)) {
    throw new Error("controlled apply recovery authority may not grant transaction coordination paths");
  }
  return {
    request_digest: requiredDigest(value?.requestDigest, "controlled apply recovery request digest"),
    authority_mode: authorityMode,
    authority_path: authorityPath,
    authority_digest: requiredDigest(value?.authorityDigest, "controlled apply recovery authority digest"),
    authorized_paths: authorizedPaths,
    authority_scope_digest: evidenceDigest(authorizedPaths, []),
  };
}

function validateRecoveryBinding(binding, root, expected = {}) {
  const errors = [];
  const { binding_digest: _digest, ...base } = binding || {};
  if (binding?.binding_digest !== evidenceDigest(base, [])) errors.push("controlled apply recovery binding digest is invalid");
  if (binding?.target_root !== root) errors.push("controlled apply recovery binding target does not match");
  for (const field of ["plan_digest", "request_digest", "authority_digest", "authority_scope_digest", "action_graph_digest"]) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(binding?.[field] || ""))) {
      errors.push(`controlled apply recovery binding ${field} is invalid`);
    }
  }
  if (!/^[A-Z][A-Z0-9_]{2,63}$/.test(String(binding?.authority_mode || ""))) {
    errors.push("controlled apply recovery binding authority mode is invalid");
  }
  try {
    const authorityPath = assertSafeRelativePath(String(binding?.authority_path || ""), "controlled apply recovery binding authority path");
    if (isReservedTransactionPath(authorityPath)) errors.push("controlled apply recovery binding authority path is reserved");
    assertSafeRelativePath(String(binding?.receipt_path || ""), "controlled apply recovery binding receipt path");
  } catch (error) {
    errors.push(error.message);
  }
  for (const [field, value] of Object.entries(expected || {})) {
    if (value !== undefined && binding?.[field] !== value) {
      errors.push(`controlled apply recovery binding ${field} does not match the current plan/request authority`);
    }
  }
  return { ok: errors.length === 0, errors };
}

function normalizeBackupPath(value, targetPath, actionId) {
  const backupPath = assertSafeRelativePath(value, `controlled apply action ${actionId} backup path`);
  if (!backupPath.startsWith(BACKUP_PREFIX)) {
    throw new Error(`controlled apply action ${actionId} backup path must use ${BACKUP_PREFIX}<run>/`);
  }
  const remainder = backupPath.slice(BACKUP_PREFIX.length);
  const separator = remainder.indexOf("/");
  const run = separator > 0 ? remainder.slice(0, separator) : "";
  const backedUpTarget = separator > 0 ? remainder.slice(separator + 1) : "";
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(run) || backedUpTarget !== targetPath) {
    throw new Error(`controlled apply action ${actionId} backup path must exactly mirror ${targetPath} below a transaction run directory`);
  }
  return backupPath;
}

function validateExactActionPaths(actions, receiptPath) {
  const occupied = new Set([receiptPath, ...RESERVED_TRANSACTION_PATHS]);
  if (isReservedTransactionPath(receiptPath)) {
    throw new Error(`controlled apply receipt path is reserved for transaction coordination: ${receiptPath}`);
  }
  for (const action of actions) {
    for (const relative of [action.path, action.backup_path].filter(Boolean)) {
      if (isReservedTransactionPath(relative)) {
        throw new Error(`controlled apply exact graph uses reserved transaction path ${relative}`);
      }
      if (occupied.has(relative)) throw new Error(`controlled apply exact graph duplicates path ${relative}`);
      occupied.add(relative);
    }
    if (action.path.startsWith(BACKUP_PREFIX)) {
      throw new Error(`controlled apply target ${action.path} is inside the transaction backup namespace`);
    }
  }
}

function exactBackupRunRoot(actions) {
  const roots = new Set(actions.filter((action) => action.backup_path).map((action) => {
    const [intentos, backups, run] = action.backup_path.split("/");
    return `${intentos}/${backups}/${run}`;
  }));
  if (roots.size > 1) throw new Error("controlled apply backups must share one transaction run directory");
  return [...roots][0] || null;
}

function assertBackupPathsAbsent(root, actions) {
  const backupRunRoot = exactBackupRunRoot(actions);
  if (backupRunRoot) {
    const backupRoot = assertSafeWritePath(root, backupRunRoot, "controlled apply initial backup run root");
    if (pathEntryExists(backupRoot)) throw new Error(`controlled apply backup run already exists: ${backupRunRoot}`);
  }
  for (const action of actions) {
    if (!action.backup_path) continue;
    const backup = assertSafeWritePath(root, action.backup_path, `controlled apply ${action.id} initial backup`);
    if (pathEntryExists(backup)) throw new Error(`controlled apply backup path already exists for ${action.id}: ${action.backup_path}`);
  }
}

function createOwnedBackup(root, entry, context) {
  const target = assertSafeWritePath(root, entry.path, `controlled apply ${entry.id} backup source`);
  const backup = assertSafeWritePath(root, entry.backup_path, `controlled apply ${entry.id} backup target`);
  if (fileDigest(target) !== entry.hash_before) throw new Error(`controlled apply action ${entry.id} source changed before backup`);
  if (pathEntryExists(backup)) throw new Error(`controlled apply backup path already exists for ${entry.id}: ${entry.backup_path}`);
  ensureDirectoryTree(root, path.dirname(backup), `controlled apply ${entry.id} backup parent`, context);
  assertSafeWritePath(root, entry.backup_path, `controlled apply ${entry.id} exact backup target`);
  guardedLink(
    context,
    root,
    target,
    backup,
    `controlled apply ${entry.id} rollback backup`,
    "backup-link",
    entry.hash_before,
  );
  fsyncFile(backup);
  fsyncDirectory(path.dirname(backup));
  entry.backup_observed_hash = entry.hash_before;
  const validation = validateExactBackup(root, entry);
  if (!validation.ok) throw new Error(validation.error);
}

function ensureDirectoryTree(root, directory, label, context) {
  const pending = [];
  let current = directory;
  while (current !== root && !pathEntryExists(current)) {
    pending.push(current);
    current = path.dirname(current);
  }
  if (current !== root) {
    const stat = lstatIfExists(current);
    if (!stat || stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`${label} has a non-directory ancestor`);
  }
  for (const item of pending.reverse()) {
    guardedMkdir(context, root, item, label, "directory-create");
    fsyncDirectory(path.dirname(item));
  }
}

function rollbackJournal(journal, root, context) {
  const errors = [];
  const backupRootValidation = validateBackupRoot(journal, root, { allowMissing: true });
  if (!backupRootValidation.ok) return { ok: false, errors: backupRootValidation.errors };
  try {
    rollbackReceipt(journal, root, context);
  } catch (error) {
    errors.push(`receipt: ${error.message}`);
  }
  for (const entry of [...journal.action_journal].reverse()) {
    try {
      rollbackEntry(root, entry, context);
    } catch (error) {
      errors.push(`${entry.id}: ${error.message}`);
    }
  }
  const restored = validateRestoredPreimages(journal, root);
  if (!restored.ok) errors.push(...restored.errors);
  return { ok: errors.length === 0, errors };
}

function rollbackEntry(root, entry, context) {
  removeOwnedTemp(root, entry.transaction_temp_path, `controlled apply recovery ${entry.id} temp`, context);
  const target = assertSafeWritePath(root, entry.path, `controlled apply recovery ${entry.id} target`);
  const currentHash = fileDigest(target);
  if (entry.hash_before) {
    const backup = assertSafeWritePath(root, entry.backup_path, `controlled apply recovery ${entry.id} backup`);
    if (entry.backup_ownership !== "BACKUP_OWNED"
      || !["BACKUP_OWNED", "APPLIED"].includes(entry.state)) {
      if (pathEntryExists(backup)) throw new Error("backup exists without durable BACKUP_OWNED authority");
      if (currentHash !== entry.hash_before) throw new Error("target changed without a durable rollback backup");
      return;
    }
    if (currentHash === entry.hash_before) {
      if (pathEntryExists(backup)) {
        const backupValidation = validateExactBackup(root, entry);
        if (!backupValidation.ok) throw new Error(backupValidation.error);
      }
      return;
    }
    const backupValidation = validateExactBackup(root, entry);
    if (!backupValidation.ok) throw new Error(backupValidation.error);
    if (currentHash && currentHash !== entry.expected_hash_after) {
      throw new Error("target changed outside the interrupted controlled apply");
    }
    if (currentHash === entry.expected_hash_after) {
      guardedUnlink(
        context,
        root,
        target,
        `controlled apply recovery ${entry.id} applied target`,
        "rollback-target-unlink",
        entry.expected_hash_after,
      );
      fsyncDirectory(path.dirname(target));
    }
    try {
      guardedLink(
        context,
        root,
        backup,
        target,
        `controlled apply recovery ${entry.id} restore`,
        "rollback-target-link",
        entry.hash_before,
      );
      fsyncFile(target);
      fsyncDirectory(path.dirname(target));
    } catch (error) {
      throw new Error(`cannot restore rollback backup without overwriting another file: ${error.message}`);
    }
    if (fileDigest(target) !== entry.hash_before) throw new Error("restored target digest does not match the pre-apply state");
    return;
  }
  if (entry.state === "PREPARED") {
    if (pathEntryExists(target)) throw new Error("target exists without durable mutation intent");
    return;
  }
  if (!["MUTATION_INTENT", "APPLIED"].includes(entry.state)) throw new Error("action has no durable mutation intent");
  if (currentHash && currentHash !== entry.expected_hash_after) {
    throw new Error("new target changed outside the interrupted controlled apply");
  }
  if (currentHash) {
    guardedUnlink(
      context,
      root,
      target,
      `controlled apply recovery ${entry.id} new target`,
      "rollback-target-unlink",
      entry.expected_hash_after,
    );
    fsyncDirectory(path.dirname(target));
  }
  pruneEmptyParents(root, path.dirname(target), "", context);
}

function rollbackReceipt(journal, root, context) {
  for (const entry of journal.receipt_journal || []) {
    removeOwnedTemp(root, entry.transaction_temp_path, `controlled apply receipt ${entry.phase} temp`, context);
  }
  const target = assertSafeWritePath(root, journal.receipt_path, "controlled apply recovery receipt target");
  const currentHash = fileDigest(target);
  const beforeHash = journal.receipt_before?.hash || null;
  if (currentHash === beforeHash) return;
  const transactionHashes = new Set((journal.receipt_journal || []).flatMap((entry) => [
    entry.expected_hash_after,
    entry.observed_hash_after,
  ]).filter(Boolean));
  if (currentHash && !transactionHashes.has(currentHash)) {
    throw new Error("receipt changed outside the interrupted controlled apply");
  }
  if (journal.receipt_before?.existed) {
    const content = Buffer.from(String(journal.receipt_before.content_base64 || ""), "base64");
    if (digestContent(content) !== beforeHash) throw new Error("receipt rollback preimage digest is invalid");
    atomicWrite(target, content, "", root, context, "controlled apply receipt rollback");
    if (fileDigest(target) !== beforeHash) throw new Error("receipt rollback did not restore the exact pre-apply content");
  } else if (currentHash) {
    guardedUnlink(
      context,
      root,
      target,
      "controlled apply receipt rollback target",
      "rollback-receipt-unlink",
      currentHash,
    );
    fsyncDirectory(path.dirname(target));
    pruneEmptyParents(root, path.dirname(target), "", context);
  }
}

function verifiedReceiptMatches(journal, root) {
  const receipt = assertSafeWritePath(root, journal.receipt_path, "controlled apply recovery receipt");
  const receiptStat = lstatIfExists(receipt);
  if (!receiptStat || receiptStat.isSymbolicLink() || !receiptStat.isFile()) return false;
  const extracted = extractMachineReadableEvidence(fs.readFileSync(receipt, "utf8"));
  if (!extracted?.ok) return false;
  const value = extracted.value;
  if (value?.artifact_type !== "apply_execution_receipt"
    || value?.receipt_state !== "APPLY_VERIFIED"
    || value?.outcome !== "APPLY_VERIFIED"
    || value?.execution_plan?.plan_digest !== journal.plan_digest
    || value?.activation?.status !== "VERIFIED"
    || (value?.boundary?.only_authorized_actions_executed !== true
      && value?.boundary?.only_approved_actions_executed !== true)) return false;
  const results = new Map((value.actions || []).map((item) => [item.id, item]));
  return journal.expected_actions.every((action) => {
    const targetMatches = fileDigest(assertSafeWritePath(root, action.path, `controlled apply receipt ${action.id}`)) === action.expected_hash_after;
    if (action.receipt_required === false) return targetMatches;
    const result = results.get(action.id);
    return result?.result === "APPLIED"
      && result.hash_after === action.expected_hash_after
      && targetMatches;
  });
}

function trustedReceiptValidation(validator, journal, root) {
  if (typeof validator !== "function") return { ok: false, errors: ["trusted apply receipt validator was not supplied"] };
  try {
    const result = validator({
      projectRoot: root,
      receiptPath: journal.receipt_path,
      planDigest: journal.plan_digest,
      expectedActions: journal.expected_actions,
    });
    if (result === true) return { ok: true, errors: [] };
    if (result?.ok === true) return result;
    return { ok: false, errors: result?.errors || ["trusted apply receipt validation failed"] };
  } catch (error) {
    return { ok: false, errors: [error.message] };
  }
}

function validateRestoredPreimages(journal, root, options = {}) {
  const errors = [];
  if (options.includeReceipt !== false) {
    const receipt = assertSafeWritePath(root, journal.receipt_path, "controlled apply rollback receipt validation");
    const expectedReceipt = journal.receipt_before?.hash || null;
    if (fileDigest(receipt) !== expectedReceipt) errors.push("receipt preimage was not restored");
  }
  for (const action of journal.expected_actions || []) {
    const observed = fileDigest(assertSafeWritePath(root, action.path, `controlled apply rollback validation ${action.id}`));
    if (observed !== (action.hash_before || null)) errors.push(`${action.id} target was not restored`);
  }
  return { ok: errors.length === 0, errors };
}

function cleanupRollbackBackups(journal, root, options = {}, context) {
  const restored = validateRestoredPreimages(journal, root, options);
  if (!restored.ok) throw new Error(restored.errors.join("; "));
  for (const entry of journal.action_journal || []) {
    if (!entry.backup_path) continue;
    const backup = assertSafeWritePath(root, entry.backup_path, `controlled apply ${entry.id} rollback backup cleanup`);
    if (!pathEntryExists(backup)) continue;
    if (entry.backup_ownership !== "BACKUP_OWNED") {
      throw new Error(`${entry.id} backup exists without durable BACKUP_OWNED authority`);
    }
    const validation = validateExactBackup(root, entry);
    if (!validation.ok) throw new Error(`${entry.id}: ${validation.error}`);
    guardedUnlink(
      context,
      root,
      backup,
      `controlled apply ${entry.id} rollback backup cleanup`,
      "rollback-backup-unlink",
      entry.hash_before,
    );
    fsyncDirectory(path.dirname(backup));
    pruneEmptyParents(root, path.dirname(backup), ownedBackupRootPath(root, entry), context);
  }
  cleanupOwnedBackupRoot(journal, root, context);
}

function validateBackupRoot(journal, root, options = {}) {
  const errors = [];
  if (!journal.backup_run_root) {
    if (journal.backup_root_ownership !== "NOT_REQUIRED") errors.push("backup root ownership must be NOT_REQUIRED");
    return { ok: errors.length === 0, errors };
  }
  let relative;
  try {
    relative = assertSafeRelativePath(journal.backup_run_root, "controlled apply backup run root");
  } catch (error) {
    return { ok: false, errors: [error.message] };
  }
  if (!relative.startsWith(BACKUP_PREFIX) || relative.split("/").length !== 3) errors.push("backup run root is outside the fixed transaction namespace");
  if (journal.backup_root_ownership !== "BACKUP_OWNED") {
    try {
      const candidate = assertSafeWritePath(root, relative, "controlled apply unowned backup run root");
      if (pathEntryExists(candidate)) errors.push("backup run root exists without durable BACKUP_OWNED authority");
    } catch (error) {
      errors.push(error.message);
    }
    return { ok: errors.length === 0, errors };
  }
  let candidate;
  try {
    candidate = assertSafeWritePath(root, relative, "controlled apply owned backup run root");
  } catch (error) {
    return { ok: false, errors: [...errors, error.message] };
  }
  const stat = lstatIfExists(candidate);
  if (!stat) {
    if (!options.allowMissing) errors.push("transaction-owned backup run root is missing");
  } else if (stat.isSymbolicLink() || !stat.isDirectory()) {
    errors.push("transaction-owned backup run root is not a non-symlink directory");
  } else if (fs.realpathSync(candidate) !== candidate) {
    errors.push("transaction-owned backup run root does not resolve to its exact path");
  }
  return { ok: errors.length === 0, errors };
}

function ownedBackupRootPath(root, entry) {
  const relative = exactBackupRunRoot([{ backup_path: entry.backup_path }]);
  return assertSafeWritePath(root, relative, `controlled apply ${entry.id} backup run root`);
}

function cleanupOwnedBackupRoot(journal, root, context) {
  if (!journal.backup_run_root) return;
  const validation = validateBackupRoot(journal, root, { allowMissing: true });
  if (!validation.ok) throw new Error(validation.errors.join("; "));
  const backupRoot = assertSafeWritePath(root, journal.backup_run_root, "controlled apply backup root cleanup");
  if (!pathEntryExists(backupRoot)) return;
  const inventory = [];
  const directories = [];
  const walk = (directory) => {
    directories.push(directory);
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isSymbolicLink() || !entry.isDirectory()) inventory.push(full);
      else walk(full);
    }
  };
  walk(backupRoot);
  if (inventory.length > 0) throw new Error(`transaction-owned backup root still contains entries: ${inventory.join(", ")}`);
  for (const directory of directories.reverse()) {
    guardedRmdir(context, root, directory, "controlled apply backup directory cleanup", "rollback-backup-directory-remove");
  }
  fsyncDirectory(path.dirname(backupRoot));
}

function validateOwnedBackups(journal, root) {
  const errors = [];
  for (const action of journal.action_journal || []) {
    if (!action.hash_before) continue;
    if (action.backup_ownership !== "BACKUP_OWNED" || action.state !== "APPLIED") {
      errors.push(`${action.id} has no durable BACKUP_OWNED record`);
      continue;
    }
    const validation = validateExactBackup(root, action);
    if (!validation.ok) errors.push(`${action.id}: ${validation.error}`);
  }
  return { ok: errors.length === 0, errors };
}

function validateExactBackup(root, entry) {
  const backup = assertSafeWritePath(root, entry.backup_path, `controlled apply ${entry.id} exact backup`);
  const stat = lstatIfExists(backup);
  if (!stat) return { ok: false, error: "exact rollback backup is missing" };
  if (stat.isSymbolicLink() || !stat.isFile()) return { ok: false, error: "rollback backup is not a non-symlink regular file" };
  const resolvedRoot = fs.realpathSync(root);
  const resolvedBackup = fs.realpathSync(backup);
  if (resolvedBackup !== backup
    || (resolvedBackup !== resolvedRoot && !resolvedBackup.startsWith(`${resolvedRoot}${path.sep}`))) {
    return { ok: false, error: "rollback backup resolves outside its exact project path" };
  }
  const expectedPath = normalizeBackupPath(entry.backup_path, entry.path, entry.id);
  if (path.relative(resolvedRoot, resolvedBackup).replaceAll(path.sep, "/") !== expectedPath) {
    return { ok: false, error: "rollback backup path does not match the journal" };
  }
  const observed = digestContent(fs.readFileSync(resolvedBackup));
  if (observed !== entry.hash_before || entry.backup_observed_hash !== entry.hash_before) {
    return { ok: false, error: "rollback backup digest does not match the pre-apply target" };
  }
  return { ok: true, error: "" };
}

function validateJournal(journal, root, options = {}) {
  const errors = [];
  const { journal_digest: _digest, ...base } = journal || {};
  if (journal?.artifact_type !== "controlled_apply_pending_journal") errors.push("controlled apply journal artifact type is invalid");
  if (journal?.schema_version !== "1.113.0") errors.push("controlled apply journal schema version is invalid");
  if (journal?.journal_digest !== evidenceDigest(base, [])) errors.push("controlled apply journal digest is invalid");
  if (path.resolve(String(journal?.target_root || "")) !== root) errors.push("controlled apply journal target does not match");
  if (!/^apply-[A-Za-z0-9._-]+$/.test(String(journal?.transaction_id || ""))) errors.push("controlled apply journal transaction id is invalid");
  if (!Number.isInteger(Number(journal?.owner_pid)) || Number(journal.owner_pid) < 1) errors.push("controlled apply journal owner PID is invalid");
  if (!Number.isFinite(Date.parse(String(journal?.created_at || ""))) || !Number.isFinite(Date.parse(String(journal?.updated_at || "")))) {
    errors.push("controlled apply journal timestamps are invalid");
  }
  if (!["PREPARED", "MUTATION_IN_PROGRESS", "TARGET_MUTATION_COMPLETE_PENDING_ACTIVATION", "RECEIPT_WRITE_IN_PROGRESS", "ROLLBACK_INCOMPLETE", ROLLBACK_RESTORED_STATE, ROLLBACK_CLEANUP_STATE].includes(String(journal?.state || ""))) {
    errors.push("controlled apply journal state is invalid");
  }
  if ([ROLLBACK_RESTORED_STATE, ROLLBACK_CLEANUP_STATE].includes(journal?.state)
    && !Number.isFinite(Date.parse(String(journal?.rollback_restored_at || "")))) {
    errors.push("controlled apply journal rollback restoration time is invalid");
  }
  if (journal?.state === ROLLBACK_CLEANUP_STATE
    && !Number.isFinite(Date.parse(String(journal?.rollback_cleanup_completed_at || "")))) {
    errors.push("controlled apply journal rollback cleanup time is invalid");
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(String(journal?.plan_digest || ""))) errors.push("controlled apply journal plan digest is invalid");
  const bindingValidation = validateRecoveryBinding(journal?.recovery_binding, root, options.binding);
  errors.push(...bindingValidation.errors);
  if (journal?.recovery_binding?.plan_digest !== journal?.plan_digest) {
    errors.push("controlled apply journal plan does not match its recovery binding");
  }
  try { assertSafeRelativePath(String(journal?.receipt_path || ""), "controlled apply journal receipt"); } catch (error) { errors.push(error.message); }
  if (!Array.isArray(journal?.expected_actions)) errors.push("controlled apply journal exact action graph is invalid");
  if (!Array.isArray(journal?.action_journal)) errors.push("controlled apply journal action log is invalid");
  if (!Array.isArray(journal?.receipt_journal)) errors.push("controlled apply journal receipt log is invalid");
  if (journal?.receipt_before?.existed && digestContent(Buffer.from(String(journal.receipt_before.content_base64 || ""), "base64")) !== journal.receipt_before.hash) {
    errors.push("controlled apply journal receipt preimage is invalid");
  }
  const expectedById = new Map();
  const expectedPaths = new Set();
  for (const action of journal?.expected_actions || []) {
    try {
      const normalized = normalizeAction({ id: action.id, path: action.path, backupPath: action.backup_path, hashBefore: action.hash_before, expectedHashAfter: action.expected_hash_after, receiptRequired: action.receipt_required });
      if (expectedById.has(normalized.id)) errors.push(`controlled apply journal duplicates expected action ${normalized.id}`);
      if (expectedPaths.has(normalized.path)) errors.push(`controlled apply journal duplicates expected target ${normalized.path}`);
      expectedById.set(normalized.id, normalized);
      expectedPaths.add(normalized.path);
    } catch (error) { errors.push(error.message); }
  }
  try {
    const expectedBackupRoot = exactBackupRunRoot([...expectedById.values()]);
    if ((journal?.backup_run_root || null) !== expectedBackupRoot) errors.push("controlled apply journal backup run root does not match its exact graph");
    const allowedOwnership = expectedBackupRoot ? ["UNOWNED", "BACKUP_OWNED"] : ["NOT_REQUIRED"];
    if (!allowedOwnership.includes(journal?.backup_root_ownership)) errors.push("controlled apply journal backup root ownership is invalid");
  } catch (error) {
    errors.push(error.message);
  }
  const journaledIds = new Set();
  for (const action of journal?.action_journal || []) {
    try {
      const normalized = normalizeAction({ id: action.id, path: action.path, backupPath: action.backup_path, hashBefore: action.hash_before, expectedHashAfter: action.expected_hash_after, receiptRequired: action.receipt_required });
      const expected = expectedById.get(normalized.id);
      if (!expected || JSON.stringify(expected) !== JSON.stringify(normalized)) errors.push(`controlled apply journal action ${normalized.id} is outside its exact graph`);
      if (journaledIds.has(normalized.id)) errors.push(`controlled apply journal duplicates action log ${normalized.id}`);
      journaledIds.add(normalized.id);
      if (!["PREPARED", "MUTATION_INTENT", "BACKUP_OWNED", "APPLIED"].includes(action.state)) errors.push(`controlled apply journal action ${normalized.id} state is invalid`);
      const expectedTemp = transactionTempPath(journal.transaction_id, normalized.path, normalized.id);
      if (action.transaction_temp_path !== expectedTemp) errors.push(`controlled apply journal action ${normalized.id} temp path is invalid`);
      if (action.state === "APPLIED" && action.observed_hash_after !== normalized.expected_hash_after) {
        errors.push(`controlled apply journal action ${normalized.id} observed digest is invalid`);
      }
      if (normalized.hash_before) {
        const owned = ["BACKUP_OWNED", "APPLIED"].includes(action.state);
        if (action.backup_ownership !== (owned ? "BACKUP_OWNED" : "UNOWNED")) {
          errors.push(`controlled apply journal action ${normalized.id} backup ownership is invalid`);
        }
        if (owned && (action.backup_observed_hash !== normalized.hash_before
          || !Number.isFinite(Date.parse(String(action.backup_owned_at || ""))))) {
          errors.push(`controlled apply journal action ${normalized.id} BACKUP_OWNED evidence is invalid`);
        }
        if (action.state === "MUTATION_INTENT") errors.push(`controlled apply journal action ${normalized.id} skipped BACKUP_OWNED`);
      } else if (action.backup_ownership !== "NOT_REQUIRED"
        || action.backup_observed_hash !== null
        || action.backup_owned_at !== null
        || action.state === "BACKUP_OWNED") {
        errors.push(`controlled apply journal action ${normalized.id} has unexpected backup ownership`);
      }
    } catch (error) { errors.push(error.message); }
  }
  if (journaledIds.size !== expectedById.size) errors.push("controlled apply journal action log does not match the exact graph");
  const receiptPhases = new Set();
  for (const receipt of journal?.receipt_journal || []) {
    const phase = String(receipt?.phase || "");
    if (!/^[a-z][a-z0-9-]{1,40}$/.test(phase)) errors.push(`controlled apply journal receipt phase is invalid: ${phase || "<empty>"}`);
    if (receiptPhases.has(phase)) errors.push(`controlled apply journal duplicates receipt phase ${phase}`);
    receiptPhases.add(phase);
    if (!["PREPARED", "APPLIED"].includes(receipt?.state)) errors.push(`controlled apply journal receipt ${phase || "<empty>"} state is invalid`);
    if (!/^sha256:[a-f0-9]{64}$/.test(String(receipt?.expected_hash_after || ""))) errors.push(`controlled apply journal receipt ${phase || "<empty>"} digest is invalid`);
    const expectedTemp = transactionTempPath(journal.transaction_id, journal.receipt_path, `receipt-${phase}`);
    if (receipt?.transaction_temp_path !== expectedTemp) errors.push(`controlled apply journal receipt ${phase || "<empty>"} temp path is invalid`);
    if (receipt?.state === "APPLIED" && receipt?.observed_hash_after !== receipt?.expected_hash_after) {
      errors.push(`controlled apply journal receipt ${phase || "<empty>"} observed digest is invalid`);
    }
  }
  const actionGraph = {
    receipt_path: journal?.receipt_path,
    actions: [...expectedById.values()],
  };
  if (journal?.recovery_binding?.receipt_path !== journal?.receipt_path) {
    errors.push("controlled apply journal receipt does not match its recovery binding");
  }
  if (journal?.recovery_binding?.action_graph_digest !== evidenceDigest(actionGraph, [])) {
    errors.push("controlled apply journal action graph does not match its recovery binding");
  }
  if (options.lock
    && JSON.stringify(journal?.recovery_binding) !== JSON.stringify(options.lock?.recovery_binding)) {
    errors.push("controlled apply journal recovery binding does not match the project-local lock");
  }
  return { ok: errors.length === 0, errors };
}

function targetLockPath(root) {
  return path.join(root, ...TARGET_LOCK_RELATIVE_PATH.split("/"));
}

function journalPath(root, transactionId) {
  return path.join(root, `${JOURNAL_PREFIX}${transactionId}${JOURNAL_SUFFIX}`);
}

function acquireTargetLock(root, binding, mutationHooks) {
  const file = targetLockPath(root);
  const lockParent = path.dirname(file);
  const parentStat = lstatIfExists(lockParent);
  if (!parentStat || parentStat.isSymbolicLink() || !parentStat.isDirectory() || fs.realpathSync(lockParent) !== lockParent) {
    throw new Error("controlled apply requires its target root to remain a canonical project-local lock directory");
  }
  if (pathEntryExists(path.join(root, ...RECOVERY_CLAIM_RELATIVE_PATH.split("/")))) {
    throw new Error("controlled apply recovery already owns the project-local transaction claim");
  }
  if (pathEntryExists(file)) {
    const existing = readLock(file);
    const validation = validateTargetLock(existing, root);
    if (!validation.ok) throw new Error(`controlled apply target lock is invalid: ${validation.errors.join("; ")}`);
    if (processAlive(existing.owner_pid)) throw new Error(`controlled apply target is already locked by ${existing.transaction_id}`);
    throw new Error(`controlled apply target has a stale lock for ${existing.transaction_id}; recover it before starting another apply`);
  }
  const base = {
    schema_version: "1.113.0",
    artifact_type: "controlled_apply_target_lock",
    target_root: root,
    transaction_id: binding.transactionId,
    plan_digest: binding.planDigest,
    recovery_binding: binding.recoveryBinding,
    root_identity: captureRootIdentity(root),
    owner_pid: process.pid,
    created_at: new Date().toISOString(),
  };
  const record = { ...base, lock_digest: evidenceDigest(base, []) };
  invokeMutationHook({ mutationHooks }, { operation: "target-lock-create", target: file });
  assertCanonicalDirectory(root, lockParent, "controlled apply target lock parent");
  if (!sameNodeIdentity(record.root_identity, captureRootIdentity(root))) {
    throw new Error("controlled apply target root identity changed before lock creation");
  }
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  fsyncFile(file);
  const observed = readLock(file);
  if (JSON.stringify(observed) !== JSON.stringify(record)) {
    throw new Error("controlled apply target lock changed while it was being acquired");
  }
  assertCanonicalDirectory(root, lockParent, "controlled apply target lock parent after create");
  if (!sameNodeIdentity(record.root_identity, captureRootIdentity(root))) {
    throw new Error("controlled apply target root identity changed during lock creation");
  }
  fsyncDirectory(path.dirname(file));
  return file;
}

function readLock(file) {
  if (!file || !pathEntryExists(file)) return null;
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile()) return {};
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return {}; }
}

function validateTargetLock(lock, root, expected = {}) {
  const errors = [];
  const { lock_digest: _digest, ...base } = lock || {};
  if (!lock || lock.artifact_type !== "controlled_apply_target_lock") errors.push("controlled apply target lock artifact type is invalid");
  if (lock?.schema_version !== "1.113.0") errors.push("controlled apply target lock schema version is invalid");
  if (lock?.lock_digest !== evidenceDigest(base, [])) errors.push("controlled apply target lock digest is invalid");
  if (path.resolve(String(lock?.target_root || "")) !== root) errors.push("controlled apply target lock target does not match");
  if (!/^apply-[A-Za-z0-9._-]+$/.test(String(lock?.transaction_id || ""))) errors.push("controlled apply target lock transaction id is invalid");
  if (!/^sha256:[a-f0-9]{64}$/.test(String(lock?.plan_digest || ""))) errors.push("controlled apply target lock plan digest is invalid");
  const bindingValidation = validateRecoveryBinding(lock?.recovery_binding, root, expected.binding);
  errors.push(...bindingValidation.errors);
  if (lock?.recovery_binding?.plan_digest !== lock?.plan_digest) errors.push("controlled apply target lock plan does not match its recovery binding");
  const currentRootIdentity = captureRootIdentity(root);
  if (!sameNodeIdentity(lock?.root_identity, currentRootIdentity)) errors.push("controlled apply target root identity changed after lock acquisition");
  if (!Number.isInteger(Number(lock?.owner_pid)) || Number(lock.owner_pid) < 1) errors.push("controlled apply target lock owner PID is invalid");
  if (!Number.isFinite(Date.parse(String(lock?.created_at || "")))) errors.push("controlled apply target lock creation time is invalid");
  if (expected.transactionId && lock?.transaction_id !== expected.transactionId) errors.push("controlled apply target lock transaction does not match its journal");
  if (expected.planDigest && lock?.plan_digest !== expected.planDigest) errors.push("controlled apply target lock plan does not match its journal");
  return { ok: errors.length === 0, errors };
}

function releaseTargetLock(file, transactionId, context = {}) {
  if (!file || !pathEntryExists(file)) return;
  const lock = readLock(file);
  if (!lock || lock.transaction_id !== transactionId) throw new Error("controlled apply target lock ownership changed before release");
  const validation = validateTargetLock(lock, path.resolve(lock.target_root));
  if (!validation.ok) throw new Error(`controlled apply target lock cannot be released: ${validation.errors.join("; ")}`);
  const snapshot = capturePathSnapshot(lock.target_root, file, "controlled apply target lock release");
  invokeMutationHook(context, { operation: "target-lock-release", target: file });
  assertPathSnapshotUnchanged(snapshot);
  fs.unlinkSync(file);
  assertPathMutationResult(snapshot, "absent");
  fsyncDirectory(path.dirname(file));
}

function acquireRecoveryClaim(root, lock, mutationHooks) {
  const file = path.join(root, ...RECOVERY_CLAIM_RELATIVE_PATH.split("/"));
  if (pathEntryExists(file)) {
    const existing = readLock(file);
    const valid = validateRecoveryClaim(existing, root, lock);
    if (!valid.ok) throw new Error(`controlled apply recovery claim is invalid: ${valid.errors.join("; ")}`);
    if (processAlive(existing.owner_pid)) throw new Error(`controlled apply recovery is already active in PID ${existing.owner_pid}`);
    const snapshot = capturePathSnapshot(root, file, "stale controlled apply recovery claim");
    invokeMutationHook({ mutationHooks }, { operation: "stale-recovery-claim-release", target: file });
    assertPathSnapshotUnchanged(snapshot);
    fs.unlinkSync(file);
    assertPathMutationResult(snapshot, "absent");
  }
  const base = {
    schema_version: "1.113.0",
    artifact_type: "controlled_apply_recovery_claim",
    target_root: root,
    transaction_id: lock.transaction_id,
    binding_digest: lock.recovery_binding.binding_digest,
    owner_pid: process.pid,
    created_at: new Date().toISOString(),
  };
  const record = { ...base, claim_digest: evidenceDigest(base, []) };
  const snapshot = capturePathSnapshot(root, file, "controlled apply recovery claim create");
  invokeMutationHook({ mutationHooks }, { operation: "recovery-claim-create", target: file });
  assertPathSnapshotUnchanged(snapshot);
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  fsyncFile(file);
  assertPathMutationResult(snapshot, "regular", digestContent(Buffer.from(`${JSON.stringify(record, null, 2)}\n`)));
  fsyncDirectory(path.dirname(file));
  return { file, record };
}

function validateRecoveryClaim(claim, root, lock) {
  const errors = [];
  const { claim_digest: _digest, ...base } = claim || {};
  if (claim?.artifact_type !== "controlled_apply_recovery_claim" || claim?.schema_version !== "1.113.0") {
    errors.push("controlled apply recovery claim type is invalid");
  }
  if (claim?.claim_digest !== evidenceDigest(base, [])) errors.push("controlled apply recovery claim digest is invalid");
  if (claim?.target_root !== root || claim?.transaction_id !== lock?.transaction_id) errors.push("controlled apply recovery claim transaction does not match");
  if (claim?.binding_digest !== lock?.recovery_binding?.binding_digest) errors.push("controlled apply recovery claim binding does not match");
  if (!Number.isInteger(Number(claim?.owner_pid)) || Number(claim.owner_pid) < 1) errors.push("controlled apply recovery claim PID is invalid");
  return { ok: errors.length === 0, errors };
}

function releaseRecoveryClaim(recovery, root, mutationHooks) {
  if (!recovery?.file || !pathEntryExists(recovery.file)) return;
  const observed = readLock(recovery.file);
  if (JSON.stringify(observed) !== JSON.stringify(recovery.record)) {
    throw new Error("controlled apply recovery claim ownership changed before release");
  }
  const snapshot = capturePathSnapshot(root, recovery.file, "controlled apply recovery claim release");
  invokeMutationHook({ mutationHooks }, { operation: "recovery-claim-release", target: recovery.file });
  assertPathSnapshotUnchanged(snapshot);
  fs.unlinkSync(recovery.file);
  assertPathMutationResult(snapshot, "absent");
  fsyncDirectory(path.dirname(recovery.file));
}

function captureReceiptBefore(root, relativePath, context) {
  const target = assertSafeWritePath(root, relativePath, "controlled apply receipt preimage");
  const stat = lstatIfExists(target);
  if (!stat) return { existed: false, hash: null, content_base64: "" };
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error("controlled apply receipt path must be a non-symlink regular file when it already exists");
  if (stat.size > MAX_RECEIPT_BACKUP_BYTES) throw new Error("controlled apply receipt preimage exceeds the bounded transaction limit");
  assertTransactionLock(context);
  const snapshot = capturePathSnapshot(root, target, "controlled apply receipt preimage");
  const content = fs.readFileSync(target);
  assertPathSnapshotUnchanged(snapshot);
  assertTransactionLock(context);
  return { existed: true, hash: digestContent(content), content_base64: content.toString("base64") };
}

function refresh(handle) {
  assertTransactionLock(handle);
  handle.record.owner_pid = process.pid;
  handle.record.updated_at = new Date().toISOString();
  persistJournal(handle.file, handle.record, { context: handle });
  handle.record = readJournal(handle.file);
  const validation = validateJournal(handle.record, handle.record.target_root, { lock: readLock(handle.lockFile) });
  if (!validation.ok) throw new Error(`controlled apply journal changed during refresh: ${validation.errors.join("; ")}`);
  assertTransactionLock(handle);
}

function persistJournal(file, value, options = {}) {
  const { journal_digest: _digest, ...base } = value;
  const record = { ...base, journal_digest: evidenceDigest(base, []) };
  const root = canonicalTargetRoot(record.target_root);
  if (file !== journalPath(root, record.transaction_id)) {
    throw new Error("controlled apply journal path is not the project-local path bound to its transaction");
  }
  const temporary = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  const content = Buffer.from(`${JSON.stringify(record, null, 2)}\n`);
  const contentDigest = digestContent(content);
  try {
    guardedWriteNewFile(
      options.context,
      root,
      temporary,
      content,
      "controlled apply journal temp",
      "journal-temp-write",
      { mode: 0o600 },
    );
    fsyncFile(temporary);
    if (options.exclusive) {
      guardedLink(
        options.context,
        root,
        temporary,
        file,
        "controlled apply journal create",
        "journal-create-link",
        contentDigest,
      );
      fsyncFile(file);
    } else {
      const priorDigest = fileDigest(file);
      if (!priorDigest || priorDigest === "NON_REGULAR") throw new Error("controlled apply journal is missing or replaced before persistence");
      guardedRename(
        options.context,
        root,
        temporary,
        file,
        "controlled apply journal refresh",
        "journal-refresh-rename",
        contentDigest,
        priorDigest,
      );
      fsyncFile(file);
    }
  } finally {
    if (pathEntryExists(temporary)) {
      guardedUnlink(
        options.context,
        root,
        temporary,
        "controlled apply journal temp cleanup",
        "journal-temp-unlink",
        contentDigest,
      );
    }
  }
  fsyncDirectory(path.dirname(file));
}

function persistRollbackState(file, journal, state, extra = {}, context) {
  persistJournal(file, {
    ...journal,
    ...extra,
    owner_pid: process.pid,
    state,
    updated_at: new Date().toISOString(),
  }, { context });
  return readJournal(file);
}

function readJournal(file) {
  try {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile()) return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function readRecoveryJournal(file) {
  let stat;
  try {
    stat = fs.lstatSync(file);
  } catch (error) {
    if (error?.code === "ENOENT") return { state: "MISSING" };
    return { state: "INVALID", error: `controlled apply journal cannot be inspected: ${error.message}` };
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    return { state: "INVALID", error: "controlled apply journal exists but is not a regular non-symlink file" };
  }
  try {
    return { state: "PRESENT", journal: JSON.parse(fs.readFileSync(file, "utf8")) };
  } catch (error) {
    return { state: "INVALID", error: `controlled apply journal exists but is unreadable or malformed: ${error.message}` };
  }
}

function removeJournalFile(file, root, context) {
  if (file !== journalPath(root, context?.record?.transaction_id)) {
    throw new Error("controlled apply journal removal path changed");
  }
  const observed = fileDigest(file);
  if (!observed || observed === "NON_REGULAR") throw new Error("controlled apply journal is missing or non-regular before removal");
  guardedUnlink(
    context,
    root,
    file,
    "controlled apply journal removal",
    "journal-unlink",
    observed,
  );
  fsyncDirectory(path.dirname(file));
}

function writeRecoveryReceipt(root, journal, rollback) {
  const file = path.join(root, `${JOURNAL_PREFIX}${journal.transaction_id}.failure.json`);
  if (fs.existsSync(file)) return;
  const lock = readLock(targetLockPath(journal.target_root));
  const base = {
    schema_version: "1.113.0",
    artifact_type: "controlled_apply_recovery_receipt",
    transaction_id: journal.transaction_id,
    target_root: journal.target_root,
    plan_digest: journal.plan_digest,
    journal_digest: journal.journal_digest,
    interrupted_state: journal.state,
    actions: (journal.action_journal || []).map((entry) => ({
      id: entry.id,
      path: entry.path,
      state: entry.state,
      hash_before: entry.hash_before,
      expected_hash_after: entry.expected_hash_after,
      observed_hash_after: entry.observed_hash_after || null,
    })),
    receipt_phases: (journal.receipt_journal || []).map((entry) => ({
      phase: entry.phase,
      state: entry.state,
      expected_hash_after: entry.expected_hash_after,
      observed_hash_after: entry.observed_hash_after || null,
    })),
    lock: lock ? {
      transaction_id: lock.transaction_id,
      plan_digest: lock.plan_digest,
      owner_pid: lock.owner_pid,
      created_at: lock.created_at,
      lock_digest: lock.lock_digest,
    } : null,
    state: "INTERRUPTED_CONTROLLED_APPLY_ROLLED_BACK",
    rollback_verified: rollback.ok,
    rollback_errors: rollback.errors,
    recovered_at: new Date().toISOString(),
  };
  const value = { ...base, recovery_digest: evidenceDigest(base, []) };
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  fsyncFile(file);
  fsyncDirectory(root);
}

function atomicWrite(target, content, temporaryPath = "", root = "", context, label = "controlled apply atomic write") {
  const controlledRoot = root || context?.record?.target_root;
  if (!controlledRoot) throw new Error(`${label} requires a controlled root`);
  ensureDirectoryTree(controlledRoot, path.dirname(target), `${label} parent`, context);
  const temporary = temporaryPath || path.join(
    path.dirname(target),
    `.${path.basename(target)}.intentos-recovery-${process.pid}-${crypto.randomUUID()}.tmp`,
  );
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
  const beforeHash = fileDigest(target);
  try {
    guardedWriteNewFile(context, controlledRoot, temporary, buffer, `${label} temp`, "atomic-temp-write");
    fsyncFile(temporary);
    guardedRename(
      context,
      controlledRoot,
      temporary,
      target,
      label,
      "atomic-target-rename",
      digestContent(buffer),
      beforeHash,
    );
    fsyncDirectory(path.dirname(target));
  } finally {
    if (pathEntryExists(temporary)) {
      guardedUnlink(
        context,
        controlledRoot,
        temporary,
        `${label} temp cleanup`,
        "atomic-temp-unlink",
        digestContent(buffer),
      );
      fsyncDirectory(path.dirname(temporary));
    }
  }
}

function transactionTempPath(transactionId, relativeTarget, label) {
  const safeLabel = String(label).replace(/[^0-9A-Za-z-]+/g, "-");
  const parsed = path.posix.parse(relativeTarget.replaceAll(path.sep, "/"));
  return assertSafeRelativePath(
    path.posix.join(parsed.dir, `.${parsed.base}.intentos-${transactionId}-${safeLabel}.tmp`),
    "controlled apply transaction temp path",
  );
}

function cleanupTransactionTemps(journal, root, context) {
  for (const entry of journal.action_journal || []) {
    removeOwnedTemp(root, entry.transaction_temp_path, `controlled apply ${entry.id} temp cleanup`, context);
  }
  for (const entry of journal.receipt_journal || []) {
    removeOwnedTemp(root, entry.transaction_temp_path, `controlled apply receipt ${entry.phase} temp cleanup`, context);
  }
}

function removeOwnedTemp(root, relativePath, label, context) {
  if (!relativePath) return;
  const target = assertSafeWritePath(root, relativePath, label);
  if (pathEntryExists(target)) {
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`${label} is not a transaction-owned regular file`);
    const observed = fileDigest(target);
    guardedUnlink(context, root, target, label, "transaction-temp-unlink", observed);
    fsyncDirectory(path.dirname(target));
  }
  pruneEmptyParents(root, path.dirname(target), "", context);
}

function pruneEmptyParents(root, directory, stopBefore = "", context) {
  let current = directory;
  while (current !== root && current !== stopBefore && current.startsWith(`${root}${path.sep}`)) {
    if (!fs.existsSync(current) || !fs.statSync(current).isDirectory() || fs.readdirSync(current).length > 0) break;
    const parent = path.dirname(current);
    guardedRmdir(context, root, current, "controlled apply empty directory cleanup", "empty-directory-remove");
    fsyncDirectory(parent);
    current = path.dirname(current);
  }
}

// Node does not expose openat/renameat-style directory-fd mutations. These guards
// fail closed on observable path replacement before and after every mutation and
// the project-local lock serializes IntentOS writers. A hostile external process
// can still race inside the final path-based syscall window; callers must not
// treat these checks as absolute elimination of an OS-level TOCTOU race.
function capturePathSnapshot(root, target, label) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} resolves outside the controlled apply root`);
  }
  const directories = captureCanonicalDirectoryChain(resolvedRoot, path.dirname(resolvedTarget), label);
  const stat = lstatIfExists(resolvedTarget);
  if (stat?.isSymbolicLink()) throw new Error(`${label} target is a symlink`);
  return {
    root: resolvedRoot,
    rootIdentity: captureRootIdentity(resolvedRoot),
    target: resolvedTarget,
    targetIdentity: stat ? nodeIdentity(stat) : null,
    targetKind: stat ? nodeKind(stat) : "absent",
    directories,
    label,
  };
}

function captureCanonicalDirectoryChain(root, directory, label) {
  const relative = path.relative(root, directory);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`${label} parent resolves outside root`);
  const paths = [root];
  let current = root;
  for (const part of relative ? relative.split(path.sep) : []) {
    if (!part) continue;
    current = path.join(current, part);
    paths.push(current);
  }
  return paths.map((item) => {
    const stat = lstatIfExists(item);
    if (!stat || stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error(`${label} parent chain is missing, replaced, or non-directory: ${item}`);
    }
    if (fs.realpathSync(item) !== item) throw new Error(`${label} parent chain is not canonical: ${item}`);
    return { path: item, identity: nodeIdentity(stat) };
  });
}

function assertCanonicalDirectory(root, directory, label) {
  captureCanonicalDirectoryChain(path.resolve(root), path.resolve(directory), label);
}

function captureRootIdentity(root) {
  const stat = fs.lstatSync(root);
  if (stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(root) !== root) {
    throw new Error(`controlled apply target root is no longer its canonical directory: ${root}`);
  }
  return nodeIdentity(stat);
}

function nodeIdentity(stat) {
  return { dev: String(stat.dev), ino: String(stat.ino), mode: String(stat.mode) };
}

function sameNodeIdentity(left, right) {
  return Boolean(left && right
    && String(left.dev) === String(right.dev)
    && String(left.ino) === String(right.ino)
    && String(left.mode) === String(right.mode));
}

function nodeKind(stat) {
  if (stat.isFile()) return "regular";
  if (stat.isDirectory()) return "directory";
  return "non-regular";
}

function assertPathSnapshotUnchanged(snapshot) {
  if (!sameNodeIdentity(snapshot.rootIdentity, captureRootIdentity(snapshot.root))) {
    throw new Error(`${snapshot.label} target root identity changed before mutation`);
  }
  const currentDirectories = captureCanonicalDirectoryChain(snapshot.root, path.dirname(snapshot.target), snapshot.label);
  if (currentDirectories.length !== snapshot.directories.length
    || currentDirectories.some((item, index) => item.path !== snapshot.directories[index].path
      || !sameNodeIdentity(item.identity, snapshot.directories[index].identity))) {
    throw new Error(`${snapshot.label} canonical parent identity changed before mutation`);
  }
  const stat = lstatIfExists(snapshot.target);
  if (stat?.isSymbolicLink()) throw new Error(`${snapshot.label} target became a symlink before mutation`);
  const identity = stat ? nodeIdentity(stat) : null;
  const kind = stat ? nodeKind(stat) : "absent";
  if (kind !== snapshot.targetKind
    || (identity || snapshot.targetIdentity) && !sameNodeIdentity(identity, snapshot.targetIdentity)) {
    throw new Error(`${snapshot.label} target identity changed before mutation`);
  }
}

function assertPathMutationResult(snapshot, expectedKind, expectedDigest = undefined) {
  if (!sameNodeIdentity(snapshot.rootIdentity, captureRootIdentity(snapshot.root))) {
    throw new Error(`${snapshot.label} target root identity changed during mutation`);
  }
  const currentDirectories = captureCanonicalDirectoryChain(snapshot.root, path.dirname(snapshot.target), snapshot.label);
  if (currentDirectories.length !== snapshot.directories.length
    || currentDirectories.some((item, index) => item.path !== snapshot.directories[index].path
      || !sameNodeIdentity(item.identity, snapshot.directories[index].identity))) {
    throw new Error(`${snapshot.label} canonical parent identity changed during mutation`);
  }
  const stat = lstatIfExists(snapshot.target);
  if (stat?.isSymbolicLink()) throw new Error(`${snapshot.label} target became a symlink during mutation`);
  const kind = stat ? nodeKind(stat) : "absent";
  if (expectedKind === "unchanged") {
    if (kind !== snapshot.targetKind || !sameNodeIdentity(stat ? nodeIdentity(stat) : null, snapshot.targetIdentity)) {
      throw new Error(`${snapshot.label} target identity changed during mutation`);
    }
  } else if (kind !== expectedKind) {
    throw new Error(`${snapshot.label} expected ${expectedKind} after mutation, observed ${kind}`);
  }
  if (expectedDigest !== undefined && fileDigest(snapshot.target) !== expectedDigest) {
    throw new Error(`${snapshot.label} digest changed during mutation`);
  }
}

function invokeMutationHook(context, details) {
  context?.mutationHooks?.beforeMutation?.({ ...details });
}

function assertTransactionLock(context) {
  if (!context?.record && !context?.lock) return;
  const record = context.record || context.lock;
  const root = record.target_root || context.root;
  const file = context.lockFile || targetLockPath(root);
  if (file !== targetLockPath(root)) throw new Error("controlled apply transaction lock path changed");
  const lock = readLock(file);
  const validation = validateTargetLock(lock, root, {
    transactionId: record.transaction_id,
    planDigest: record.plan_digest,
  });
  if (!validation.ok) throw new Error(`controlled apply transaction lock changed: ${validation.errors.join("; ")}`);
  if (context.recoveryMode) {
    const claim = readLock(context.recoveryClaimFile);
    const claimValidation = validateRecoveryClaim(claim, root, lock);
    if (!claimValidation.ok || Number(claim?.owner_pid) !== process.pid) {
      throw new Error(`controlled apply recovery claim changed: ${claimValidation.errors.join("; ")}`);
    }
  } else if (Number(lock.owner_pid) !== process.pid) {
    throw new Error("controlled apply transaction lock is not owned by the current process");
  }
}

function prepareGuardedMutation(context, root, specs, operation) {
  assertTransactionLock(context);
  const snapshots = specs.map((spec) => capturePathSnapshot(root, spec.target, spec.label));
  for (let index = 0; index < specs.length; index += 1) {
    const spec = specs[index];
    if (spec.kind && snapshots[index].targetKind !== spec.kind) {
      throw new Error(`${spec.label} expected ${spec.kind} before mutation, observed ${snapshots[index].targetKind}`);
    }
    if (spec.digest !== undefined && fileDigest(spec.target) !== spec.digest) {
      throw new Error(`${spec.label} digest changed before mutation`);
    }
  }
  invokeMutationHook(context, { operation, targets: specs.map((spec) => spec.target), target: specs.at(-1)?.target });
  assertTransactionLock(context);
  snapshots.forEach(assertPathSnapshotUnchanged);
  for (const spec of specs) {
    if (spec.digest !== undefined && fileDigest(spec.target) !== spec.digest) {
      throw new Error(`${spec.label} digest or identity changed immediately before mutation`);
    }
  }
  return snapshots;
}

function finishGuardedMutation(context, snapshots, expectations) {
  snapshots.forEach((snapshot, index) => {
    const expectation = expectations[index] || {};
    assertPathMutationResult(snapshot, expectation.kind || "unchanged", expectation.digest);
  });
  assertTransactionLock(context);
}

function guardedWriteNewFile(context, root, target, content, label, operation, options = {}) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
  const snapshots = prepareGuardedMutation(context, root, [{ target, label, kind: "absent" }], operation);
  fs.writeFileSync(target, buffer, { flag: "wx", mode: options.mode });
  finishGuardedMutation(context, snapshots, [{ kind: "regular", digest: digestContent(buffer) }]);
}

function guardedUnlink(context, root, target, label, operation, expectedDigest = undefined) {
  const snapshots = prepareGuardedMutation(context, root, [{ target, label, kind: "regular", digest: expectedDigest }], operation);
  fs.unlinkSync(target);
  finishGuardedMutation(context, snapshots, [{ kind: "absent" }]);
}

function guardedLink(context, root, source, target, label, operation, expectedDigest) {
  const snapshots = prepareGuardedMutation(context, root, [
    { target: source, label: `${label} source`, kind: "regular", digest: expectedDigest },
    { target, label: `${label} target`, kind: "absent" },
  ], operation);
  fs.linkSync(source, target);
  finishGuardedMutation(context, snapshots, [
    { kind: "unchanged", digest: expectedDigest },
    { kind: "regular", digest: expectedDigest },
  ]);
}

function guardedRename(context, root, source, target, label, operation, sourceDigest, targetDigest) {
  const targetKind = targetDigest === null ? "absent" : "regular";
  const snapshots = prepareGuardedMutation(context, root, [
    { target: source, label: `${label} source`, kind: "regular", digest: sourceDigest },
    { target, label: `${label} target`, kind: targetKind, digest: targetDigest === null ? undefined : targetDigest },
  ], operation);
  fs.renameSync(source, target);
  finishGuardedMutation(context, snapshots, [
    { kind: "absent" },
    { kind: "regular", digest: sourceDigest },
  ]);
}

function guardedMkdir(context, root, directory, label, operation) {
  const snapshots = prepareGuardedMutation(context, root, [{ target: directory, label, kind: "absent" }], operation);
  fs.mkdirSync(directory);
  finishGuardedMutation(context, snapshots, [{ kind: "directory" }]);
}

function guardedRmdir(context, root, directory, label, operation) {
  if (fs.readdirSync(directory).length > 0) throw new Error(`${label} is not empty`);
  const snapshots = prepareGuardedMutation(context, root, [{ target: directory, label, kind: "directory" }], operation);
  if (fs.readdirSync(directory).length > 0) throw new Error(`${label} changed before removal`);
  fs.rmdirSync(directory);
  finishGuardedMutation(context, snapshots, [{ kind: "absent" }]);
}

function canonicalTargetRoot(value) {
  const resolved = path.resolve(String(value || ""));
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) throw new Error(`controlled apply target is not a directory: ${resolved}`);
  return fs.realpathSync(resolved);
}

function fileDigest(file) {
  const stat = lstatIfExists(file);
  if (!stat) return null;
  if (stat.isSymbolicLink() || !stat.isFile()) return "NON_REGULAR";
  const noFollow = fs.constants.O_NOFOLLOW || 0;
  let fd;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const before = fs.fstatSync(fd);
    if (!before.isFile() || !sameNodeIdentity(nodeIdentity(stat), nodeIdentity(before))) return "NON_REGULAR";
    const content = fs.readFileSync(fd);
    const after = fs.fstatSync(fd);
    if (!sameNodeIdentity(nodeIdentity(before), nodeIdentity(after))) return "NON_REGULAR";
    return digestContent(content);
  } catch (error) {
    if (["ELOOP", "ENOENT", "ENOTDIR"].includes(error?.code)) return "NON_REGULAR";
    throw error;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function lstatIfExists(file) {
  try {
    return fs.lstatSync(file);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function pathEntryExists(file) {
  return lstatIfExists(file) !== null;
}

function digestContent(content) {
  return `sha256:${crypto.createHash("sha256").update(content).digest("hex")}`;
}

function requiredDigest(value, label) {
  const digest = String(value || "");
  if (!/^sha256:[a-f0-9]{64}$/.test(digest)) throw new Error(`${label} is not a canonical digest`);
  return digest;
}

function processAlive(pid) {
  if (!Number.isInteger(Number(pid)) || Number(pid) < 1) return false;
  try { process.kill(Number(pid), 0); return true; } catch { return false; }
}

function fsyncFile(file) {
  const fd = fs.openSync(file, "r");
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}

function fsyncDirectory(directory) {
  let fd;
  try {
    fd = fs.openSync(directory, "r");
    fs.fsyncSync(fd);
  } catch {
    // Directory fsync is unavailable on some platforms; file fsync still ran.
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function noRecovery(state) {
  return { ok: true, recovered: false, state };
}
