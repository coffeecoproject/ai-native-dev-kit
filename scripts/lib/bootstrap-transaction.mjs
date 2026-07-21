import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { evidenceDigest } from "./artifact-schema.mjs";
import { assertSafeWritePath } from "./path-safety.mjs";
import { inspectTargetTopology, recheckTargetTopology } from "./target-topology.mjs";

// A non-empty target is writable only when it is an exact, digest-bound shell
// containing this bootstrap's plan, approval, and readiness evidence. Existing
// projects remain on the separately approved controlled-update executor.
const WRITABLE_TOPOLOGIES = new Set(["ABSENT_LEAF", "EMPTY_DIRECTORY", "NONEMPTY_DIRECTORY"]);
const BOOTSTRAP_JOURNAL_VERSION = "1.113.0";
const ROLLBACK_RESTORED_STATE = "ROLLBACK_RESTORED_PENDING_CLEANUP";
const ROLLBACK_CLEANUP_STATE = "ROLLBACK_CLEANUP_COMPLETE_PENDING_CLOSE";

export function createBootstrapTransaction(options = {}) {
  const topology = options.topology || inspectTargetTopology(options.targetRoot);
  const actions = normalizeActions(options.actions || []);
  const preservedControlFiles = normalizePreservedControlFiles(options.preservedControlFiles || []);
  const transactionId = options.transactionId || `bootstrap-${crypto.randomUUID()}`;
  const createdAt = options.createdAt || new Date().toISOString();
  const base = {
    schema_version: "1.109.0",
    artifact_type: "bootstrap_transaction_envelope",
    transaction_id: transactionId,
    owner_pid: Number(options.ownerPid || process.pid),
    created_at: createdAt,
    expires_at: options.expiresAt || new Date(Date.parse(createdAt) + 30 * 60 * 1000).toISOString(),
    topology,
    target_root: topology.canonical_target,
    goal_digest: requiredDigest(options.goalDigest, "goal digest"),
    plan_ref: normalizeRequiredRelative(options.planRef || ".intentos/bootstrap-plan.json", "bootstrap plan ref"),
    plan_digest: requiredDigest(options.planDigest, "plan digest"),
    approval_ref: String(options.approvalRef || "bootstrap:original-request-approval"),
    approval_digest: requiredDigest(options.approvalDigest, "approval digest"),
    readiness_ref: String(options.readinessRef || "bootstrap:controlled-readiness"),
    readiness_digest: requiredDigest(options.readinessDigest, "readiness digest"),
    source_inventory_digest: requiredDigest(options.sourceInventoryDigest, "source inventory digest"),
    success_receipt_path: normalizeRequiredRelative(options.successReceiptPath || ".intentos/bootstrap-receipt.json", "success receipt path"),
    pending_journal_path: String(options.pendingJournalPath || `.intentos-bootstrap-${transactionId}.pending.json`),
    failure_receipt_path: String(options.failureReceiptPath || `.intentos-bootstrap-${transactionId}.failure.json`),
    preserved_control_files: preservedControlFiles,
    actions,
    exact_action_ids: actions.filter((item) => item.receipt_required !== false).map((item) => item.id),
    state: "PLANNED",
    writes_performed: "No",
  };
  return { ...base, envelope_digest: evidenceDigest(base, []) };
}

export function validateBootstrapTransaction(transaction, options = {}) {
  const errors = [];
  const { envelope_digest: _digest, ...base } = transaction || {};
  if (transaction?.artifact_type !== "bootstrap_transaction_envelope") errors.push("bootstrap transaction artifact type is invalid");
  if (transaction?.envelope_digest !== evidenceDigest(base, [])) errors.push("bootstrap transaction digest is not canonical");
  if (!WRITABLE_TOPOLOGIES.has(transaction?.topology?.state)) errors.push(`unsupported target topology ${transaction?.topology?.state || "UNKNOWN"}`);
  if (!Number.isInteger(transaction?.owner_pid) || transaction.owner_pid < 1) errors.push("bootstrap transaction owner PID is invalid");
  if (options.requireCurrentOwner !== false && transaction?.owner_pid !== process.pid) errors.push("bootstrap transaction is not owned by the current process");
  const expiresAt = Date.parse(transaction?.expires_at || "");
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) errors.push("bootstrap transaction is expired or has invalid expiry");
  for (const field of ["goal_digest", "plan_digest", "approval_digest", "readiness_digest", "source_inventory_digest"]) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(transaction?.[field] || ""))) errors.push(`${field} is not a canonical digest`);
  }
  if (!Array.isArray(transaction?.actions) || transaction.actions.length === 0) errors.push("bootstrap transaction requires exact actions");
  const preserved = Array.isArray(transaction?.preserved_control_files) ? transaction.preserved_control_files : [];
  if (transaction?.topology?.state === "NONEMPTY_DIRECTORY" && preserved.length === 0) {
    errors.push("non-empty bootstrap requires exact preserved control evidence");
  }
  if (transaction?.topology?.state !== "NONEMPTY_DIRECTORY" && preserved.length > 0) {
    errors.push("preserved control evidence is allowed only for a non-empty bootstrap shell");
  }
  if (!normalizeRelative(transaction?.success_receipt_path)) errors.push("bootstrap success receipt path is unsafe");
  if (!normalizeRelative(transaction?.plan_ref) || normalizeRelative(transaction.plan_ref) !== transaction.plan_ref) errors.push("bootstrap plan ref is not a safe project-relative path");
  if (!safePendingJournalName(transaction?.pending_journal_path)) errors.push("bootstrap pending journal path is unsafe");
  if (!safeFailureReceiptName(transaction?.failure_receipt_path)) errors.push("bootstrap failure receipt path is unsafe");
  if (JSON.stringify(transaction?.exact_action_ids || []) !== JSON.stringify((transaction?.actions || [])
    .filter((item) => item.receipt_required !== false)
    .map((item) => item.id))) {
    errors.push("bootstrap transaction action IDs do not match the exact action graph");
  }
  for (const action of transaction?.actions || []) {
    if (action.content_digest !== digestContent(Buffer.from(String(action.content_base64 || ""), "base64"))) errors.push(`bootstrap action ${action.id} content digest is invalid`);
    if (typeof action.receipt_required !== "boolean") errors.push(`bootstrap action ${action.id} receipt classification is invalid`);
  }
  const preservedPaths = new Set();
  for (const item of preserved) {
    const relative = normalizeRelative(item?.path);
    if (!relative || relative !== item?.path) errors.push(`preserved control evidence path is unsafe: ${item?.path || "<empty>"}`);
    if (!/^sha256:[a-f0-9]{64}$/.test(String(item?.digest || ""))) errors.push(`preserved control evidence digest is invalid: ${item?.path || "<empty>"}`);
    if (preservedPaths.has(relative)) errors.push(`duplicate preserved control evidence path ${relative}`);
    preservedPaths.add(relative);
  }
  const actions = transaction?.actions || [];
  for (let index = 0; index < actions.length; index += 1) {
    const action = actions[index];
    for (const preservedPath of preservedPaths) {
      if (pathsOverlap(action.path, preservedPath)) {
        errors.push(`bootstrap action ${action.path} overlaps preserved control evidence ${preservedPath}`);
      }
    }
    for (const other of actions.slice(index + 1)) {
      if (pathsOverlap(action.path, other.path)) {
        errors.push(`bootstrap actions overlap by ancestry: ${action.path} and ${other.path}`);
      }
    }
    if (pathsOverlap(action.path, transaction?.success_receipt_path)) {
      errors.push(`bootstrap action ${action.path} overlaps bootstrap receipt path ${transaction.success_receipt_path}`);
    }
  }
  for (const preservedPath of preservedPaths) {
    if (pathsOverlap(preservedPath, transaction?.success_receipt_path)) {
      errors.push(`bootstrap receipt path overlaps preserved control evidence ${preservedPath}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function validateVerifiedBootstrapReceipt(receipt, canonicalRoot, options = {}) {
  const errors = [];
  const expectedRoot = fs.existsSync(canonicalRoot) ? fs.realpathSync(canonicalRoot) : path.resolve(canonicalRoot);
  if (!receipt || receipt.artifact_type !== "bootstrap_transaction_receipt") errors.push("bootstrap receipt artifact type is invalid");
  if (receipt?.state !== "APPLY_VERIFIED") errors.push("bootstrap receipt is not APPLY_VERIFIED");
  if (path.resolve(String(receipt?.target_root || "")) !== expectedRoot) errors.push("bootstrap receipt target does not match the canonical project root");
  if (receipt?.rollback_state !== "NOT_REQUIRED") errors.push("bootstrap receipt records a rollback state");
  if ((receipt?.residual_paths || []).length > 0) errors.push("bootstrap receipt records residual paths");
  if (receipt?.activation?.state !== "VERIFIED_ACTIVE" || receipt?.activation?.ok !== true) errors.push("bootstrap receipt does not contain verified behavioral activation");
  if (options.transactionId && receipt?.transaction_id !== options.transactionId) errors.push("bootstrap receipt transaction does not match the expected transaction");
  if (options.planDigest && receipt?.plan_digest !== options.planDigest) errors.push("bootstrap receipt plan digest does not match the expected transaction");
  for (const field of ["goal_digest", "plan_digest", "approval_digest", "readiness_digest", "source_inventory_digest"]) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(receipt?.[field] || ""))) errors.push(`bootstrap receipt ${field} is not a canonical digest`);
  }
  for (const field of ["plan_ref", "approval_ref", "readiness_ref"]) {
    if (!String(receipt?.[field] || "").trim()) errors.push(`bootstrap receipt ${field} is missing`);
  }
  if (!normalizeRelative(receipt?.plan_ref) || normalizeRelative(receipt.plan_ref) !== receipt.plan_ref) errors.push("bootstrap receipt plan ref is not a safe project-relative path");
  const { receipt_digest: _digest, receipt_ref: _ref, ...base } = receipt || {};
  if (receipt?.receipt_digest !== evidenceDigest(base, [])) errors.push("bootstrap receipt digest is not canonical");
  return { ok: errors.length === 0, errors };
}

export function loadVerifiedBootstrapReceipt(projectRoot) {
  const resolvedRoot = path.resolve(projectRoot);
  const root = fs.existsSync(resolvedRoot) ? fs.realpathSync(resolvedRoot) : resolvedRoot;
  const ref = ".intentos/bootstrap-receipt.json";
  const file = path.join(root, ref);
  if (!fs.existsSync(file)) return { ok: false, ref, receipt: null, errors: ["bootstrap receipt is missing"] };
  try {
    if (fs.lstatSync(file).isSymbolicLink()) return { ok: false, ref, receipt: null, errors: ["bootstrap receipt cannot be a symbolic link"] };
    const real = fs.realpathSync(file);
    if (real !== root && !real.startsWith(`${root}${path.sep}`)) return { ok: false, ref, receipt: null, errors: ["bootstrap receipt resolves outside the project root"] };
    const receipt = JSON.parse(fs.readFileSync(real, "utf8"));
    const validation = validateVerifiedBootstrapReceipt(receipt, root);
    return { ...validation, ref, receipt };
  } catch (error) {
    return { ok: false, ref, receipt: null, errors: [`bootstrap receipt cannot be read: ${error.message}`] };
  }
}

export function executeBootstrapTransaction(transaction, options = {}) {
  const validation = validateBootstrapTransaction(transaction, options);
  if (!validation.ok) return receipt(transaction, "APPLY_BLOCKED_BEFORE_WRITE", [], validation.errors, "NOT_REQUIRED");
  const topologyCheck = recheckTargetTopology(transaction.topology);
  if (!topologyCheck.ok) return receipt(transaction, "APPLY_BLOCKED_BEFORE_WRITE", [], topologyCheck.errors, "NOT_REQUIRED");
  const shellCheck = validatePreservedControlShell(transaction);
  if (!shellCheck.ok) return receipt(transaction, "APPLY_BLOCKED_BEFORE_WRITE", [], shellCheck.errors, "NOT_REQUIRED");

  const targetRoot = transaction.target_root;
  const parent = path.dirname(targetRoot);
  let mutationContext;
  let originalTargetOwnership;
  let preservedBindings;
  try {
    mutationContext = createMutationContext(parent, options.mutationHooks);
    originalTargetOwnership = transaction.topology.state === "ABSENT_LEAF"
      ? null
      : captureOwnedDirectory(targetRoot, "bootstrap original target");
    preservedBindings = capturePreservedBindings(transaction, mutationContext);
    assertTransactionPreimage(transaction, mutationContext, originalTargetOwnership, preservedBindings);
  } catch (error) {
    return receipt(transaction, "APPLY_BLOCKED_BEFORE_WRITE", [], [error.message], "NOT_REQUIRED");
  }
  const stageRoot = transactionTempRoot(parent, `.intentos-stage-${transaction.transaction_id}-`);
  const backupRoot = transactionTempRoot(parent, `.intentos-backup-${transaction.transaction_id}-`);
  const observed = [];
  const journal = [];
  const createdDirectories = new Map();
  let ownedAtomicTarget = false;
  let committedTreeDigest = "";
  let stageTreeDigest = "";
  let stageState = "UNOWNED";
  let backupState = "UNOWNED";
  let ownershipDurable = false;
  let backupContainsOriginal = false;
  let stageOwnership = null;
  let backupOwnership = null;
  let committedTargetOwnership = null;
  let committedTargetIdentity = transaction.topology.state === "NONEMPTY_DIRECTORY"
    ? originalTargetOwnership.identity
    : null;
  let pendingJournalBinding = null;
  let failureReceiptBinding = null;
  let activation = { ok: false, state: "NOT_RUN", errors: ["activation verification was not reached"] };
  const persistRuntime = (state, extra = {}) => {
    pendingJournalBinding = persistPendingJournal(transaction, {
      state,
      parent_identity: mutationContext.rootIdentity,
      original_target_identity: originalTargetOwnership?.identity || null,
      preserved_control_bindings: preservedBindings,
      stage_root: stageRoot,
      stage_state: stageState,
      stage_tree_digest: stageTreeDigest,
      stage_ownership: stageOwnership,
      backup_root: backupRoot,
      backup_state: backupState,
      backup_contains_original: backupContainsOriginal,
      backup_tree_digest: backupOwnership?.tree_digest || "",
      backup_ownership: backupOwnership,
      committed_tree_digest: committedTreeDigest,
      committed_target_identity: committedTargetIdentity,
      committed_target_ownership: committedTargetOwnership,
      written_paths: serializeWrittenPaths(transaction, journal),
      created_directories: serializeCreatedDirectories(transaction, createdDirectories),
      failure_receipt_binding: failureReceiptBinding,
      ...extra,
    }, mutationContext, pendingJournalBinding);
  };
  try {
    assertPathAbsent(stageRoot, "bootstrap stage root");
    assertPathAbsent(backupRoot, "bootstrap backup root");
    assertTransactionPreimage(transaction, mutationContext, originalTargetOwnership, preservedBindings);
    persistRuntime("PREPARED");
    guardedMkdir(mutationContext, stageRoot, "bootstrap stage root", "bootstrap-stage-create");
    stageState = "STAGE_OWNED";
    stageActions(transaction, stageRoot, mutationContext);
    stageOwnership = captureOwnedDirectory(stageRoot, "bootstrap staged tree");
    stageTreeDigest = stageOwnership.tree_digest;
    guardedMkdir(mutationContext, backupRoot, "bootstrap backup root", "bootstrap-backup-create");
    backupState = "BACKUP_OWNED";
    backupOwnership = captureOwnedDirectory(backupRoot, "bootstrap backup tree");
    persistRuntime("STAGED");
    ownershipDurable = true;
    options.beforeCommit?.({ transaction, stageRoot, backupRoot });
    assertTransactionPreimage(transaction, mutationContext, originalTargetOwnership, preservedBindings);
    persistRuntime("COMMIT_INTENT");

    if (transaction.topology.state === "ABSENT_LEAF") {
      guardedRename(mutationContext, stageRoot, targetRoot, "bootstrap atomic target commit", "bootstrap-target-commit", {
        sourceOwnership: stageOwnership,
        targetKind: "absent",
      });
      stageState = "CONSUMED";
      ownedAtomicTarget = true;
      committedTargetOwnership = captureOwnedDirectory(targetRoot, "bootstrap committed target");
      committedTargetIdentity = committedTargetOwnership.identity;
      committedTreeDigest = committedTargetOwnership.tree_digest;
      recordAtomicActionBindings(transaction, journal, mutationContext);
      persistRuntime("TARGET_COMMITTED_PENDING_ACTIVATION");
      for (const action of transaction.actions) {
        if (action.receipt_required !== false) observed.push(applied(action, path.join(targetRoot, action.path)));
        options.afterAction?.({ transaction, action, target: path.join(targetRoot, action.path), observed });
      }
    } else if (transaction.topology.state === "EMPTY_DIRECTORY") {
      guardedRmdir(mutationContext, backupRoot, "bootstrap empty backup placeholder", "bootstrap-backup-placeholder-remove", backupOwnership);
      guardedRename(mutationContext, targetRoot, backupRoot, "bootstrap empty target backup", "bootstrap-empty-target-backup", {
        sourceOwnership: originalTargetOwnership,
        targetKind: "absent",
      });
      backupContainsOriginal = true;
      backupOwnership = captureOwnedDirectory(backupRoot, "bootstrap original empty target backup");
      persistRuntime("COMMIT_INTENT");
      guardedRename(mutationContext, stageRoot, targetRoot, "bootstrap atomic target commit", "bootstrap-target-commit", {
        sourceOwnership: stageOwnership,
        targetKind: "absent",
      });
      stageState = "CONSUMED";
      ownedAtomicTarget = true;
      committedTargetOwnership = captureOwnedDirectory(targetRoot, "bootstrap committed target");
      committedTargetIdentity = committedTargetOwnership.identity;
      committedTreeDigest = committedTargetOwnership.tree_digest;
      recordAtomicActionBindings(transaction, journal, mutationContext);
      persistRuntime("TARGET_COMMITTED_PENDING_ACTIVATION");
      for (const action of transaction.actions) {
        if (action.receipt_required !== false) observed.push(applied(action, path.join(targetRoot, action.path)));
        options.afterAction?.({ transaction, action, target: path.join(targetRoot, action.path), observed });
      }
    } else {
      for (const action of transaction.actions) {
        assertCommittedTargetOwnership(transaction, mutationContext, {
          committedTargetIdentity,
          preservedBindings,
          journal,
        });
        applyJournaledAction(transaction, action, stageRoot, backupRoot, journal, createdDirectories, mutationContext);
        stageOwnership = captureOwnedDirectory(stageRoot, "bootstrap remaining staged tree");
        stageTreeDigest = stageOwnership.tree_digest;
        if (action.receipt_required !== false) observed.push(applied(action, path.join(targetRoot, action.path)));
        committedTreeDigest = directoryDigest(targetRoot);
        persistRuntime("APPLYING_NONEMPTY_CONTROL_SHELL", {
          applied_action_ids: observed.map((item) => item.id),
        });
        options.afterAction?.({ transaction, action, target: path.join(targetRoot, action.path), observed });
      }
      committedTreeDigest = directoryDigest(targetRoot);
    }
    assertCommittedTargetOwnership(transaction, mutationContext, {
      committedTargetIdentity,
      committedTargetOwnership,
      preservedBindings,
      journal,
    });
    persistRuntime("TARGET_COMMITTED_PENDING_ACTIVATION");

    activation = options.verifyActivation
      ? options.verifyActivation({ transaction, targetRoot, observed })
      : { ok: false, state: "NOT_RUN", errors: ["activation verification was not supplied"] };
    if (!activation?.ok) throw new Error((activation?.errors || [`activation state ${activation?.state || "UNKNOWN"} is not verified`]).join("; "));
    assertCommittedTargetOwnership(transaction, mutationContext, {
      committedTargetIdentity,
      committedTargetOwnership,
      preservedBindings,
      journal,
    });

    const successReceipt = receipt(transaction, "APPLY_VERIFIED", observed, [], "NOT_REQUIRED", [], activation);
    const finalActivation = options.finalizeActivation
      ? options.finalizeActivation({ transaction, targetRoot, receipt: successReceipt, verification: activation })
      : { ok: true };
    if (!finalActivation?.ok) throw new Error((finalActivation?.errors || ["behavioral activation finalization failed"]).join("; "));
    assertCommittedTargetOwnership(transaction, mutationContext, {
      committedTargetIdentity,
      committedTargetOwnership,
      preservedBindings,
      journal,
    });
    persistSuccessReceipt(transaction, successReceipt, backupRoot, journal, createdDirectories, mutationContext);
    committedTreeDigest = directoryDigest(targetRoot);
    if (committedTargetOwnership) {
      committedTargetOwnership = captureOwnedDirectory(targetRoot, "bootstrap committed target with receipt");
    }
    persistRuntime("RECEIPT_COMMITTED_PENDING_INSTALLATION_VALIDATION");
    const installation = options.verifyCommittedInstallation
      ? options.verifyCommittedInstallation({ transaction, targetRoot, receipt: successReceipt })
      : { ok: true };
    if (!installation?.ok) throw new Error((installation?.errors || ["committed bootstrap installation validation failed"]).join("; "));
    assertCommittedTargetOwnership(transaction, mutationContext, {
      committedTargetIdentity,
      committedTargetOwnership,
      preservedBindings,
      journal,
    });
    persistRuntime("INSTALLATION_VERIFIED_PENDING_CLOSE");
    safeRemoveOwnedTemp(mutationContext, stageRoot, `.intentos-stage-${transaction.transaction_id}-`, stageState !== "UNOWNED", stageOwnership);
    safeRemoveOwnedTemp(mutationContext, backupRoot, `.intentos-backup-${transaction.transaction_id}-`, ownershipDurable && backupState === "BACKUP_OWNED", backupOwnership);
    clearPendingJournal(transaction, mutationContext, pendingJournalBinding);
    return successReceipt;
  } catch (error) {
    let rollback = rollbackTransaction(transaction, journal, createdDirectories, {
      ownedAtomicTarget,
      committedTreeDigest,
      committedTargetIdentity,
      committedTargetOwnership,
      originalTargetOwnership,
      stageRoot,
      stageOwnership,
      backupRoot,
      backupOwned: ownershipDurable && backupState === "BACKUP_OWNED",
      backupContainsOriginal,
      backupOwnership,
      mutationContext,
    });
    if (rollback.state === "ROLLED_BACK") {
      persistRuntime(ROLLBACK_RESTORED_STATE, {
        rollback_restored_at: new Date().toISOString(),
        residual_paths: [],
      });
      options.afterRollbackRestored?.({ transaction, targetRoot, stageRoot, backupRoot });
      try {
        safeRemoveOwnedTemp(mutationContext, stageRoot, `.intentos-stage-${transaction.transaction_id}-`, stageState !== "UNOWNED", stageOwnership);
        safeRemoveOwnedTemp(mutationContext, backupRoot, `.intentos-backup-${transaction.transaction_id}-`, ownershipDurable && backupState === "BACKUP_OWNED", backupOwnership);
        options.afterRollbackCleanup?.({ transaction, targetRoot, stageRoot, backupRoot });
        persistRuntime(ROLLBACK_CLEANUP_STATE, {
          rollback_restored_at: new Date().toISOString(),
          rollback_cleanup_completed_at: new Date().toISOString(),
          residual_paths: [],
        });
      } catch (cleanupError) {
        rollback = {
          state: "ROLLBACK_INCOMPLETE",
          errors: [...rollback.errors, `rollback cleanup: ${cleanupError.message}`],
          residualPaths: [...new Set([...rollback.residualPaths, stageRoot, backupRoot].filter(pathEntryExists))],
        };
        persistRuntime(ROLLBACK_RESTORED_STATE, {
          rollback_restored_at: new Date().toISOString(),
          recovery_errors: rollback.errors,
          residual_paths: rollback.residualPaths,
        });
      }
    } else {
      persistRuntime("ROLLBACK_INCOMPLETE", {
        residual_paths: rollback.residualPaths,
      });
      try {
        safeRemoveOwnedTemp(mutationContext, stageRoot, `.intentos-stage-${transaction.transaction_id}-`, stageState !== "UNOWNED", stageOwnership);
      } catch (cleanupError) {
        rollback = {
          state: "ROLLBACK_INCOMPLETE",
          errors: [...rollback.errors, `rollback stage cleanup: ${cleanupError.message}`],
          residualPaths: [...new Set([...rollback.residualPaths, stageRoot].filter(pathEntryExists))],
        };
      }
    }
    let failureReceipt = receipt(
      transaction,
      rollback.state === "ROLLED_BACK" ? "APPLY_FAILED_ROLLED_BACK" : "APPLY_FAILED_ROLLBACK_INCOMPLETE",
      observed,
      [error.message, ...rollback.errors],
      rollback.state,
      rollback.residualPaths,
      activation,
    );
    try {
      failureReceiptBinding = persistFailureReceipt(transaction, failureReceipt, mutationContext);
    } catch (receiptError) {
      failureReceipt = receipt(
        transaction,
        failureReceipt.state,
        observed,
        [...failureReceipt.errors, `failure receipt persistence failed: ${receiptError.message}`],
        rollback.state,
        rollback.residualPaths,
        activation,
      );
    }
    if (rollback.state === "ROLLED_BACK") clearPendingJournal(transaction, mutationContext, pendingJournalBinding);
    else {
      const currentState = readJson(pendingJournalFile(transaction))?.state === ROLLBACK_RESTORED_STATE
        ? ROLLBACK_RESTORED_STATE
        : "ROLLBACK_INCOMPLETE";
      persistRuntime(currentState, {
        ...(currentState === ROLLBACK_RESTORED_STATE ? { rollback_restored_at: new Date().toISOString() } : {}),
        residual_paths: rollback.residualPaths,
      });
    }
    return failureReceipt;
  }
}

export function recoverInterruptedBootstrap(targetRoot, options = {}) {
  const topology = inspectTargetTopology(targetRoot);
  const target = topology.canonical_target;
  const parent = path.dirname(target);
  if (!fs.existsSync(parent)) return { ok: true, recovered: false, state: "NO_PARENT" };
  let mutationContext;
  try {
    mutationContext = createMutationContext(parent, options.mutationHooks);
  } catch (error) {
    return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors: [error.message] };
  }
  const journals = fs.readdirSync(parent)
    .filter((name) => /^\.intentos-bootstrap-.+\.pending\.json$/.test(name))
    .map((name) => path.join(parent, name));
  for (const file of journals) {
    const observedJournal = readBoundJson(file, "bootstrap pending journal");
    if (!observedJournal.ok) continue;
    const journal = observedJournal.value;
    if (path.resolve(String(journal.target_root || "")) !== target) continue;
    mutationContext.journalBinding = observedJournal.binding;
    const journalValidation = validatePendingBootstrapJournal(journal, target, file, mutationContext);
    if (!journalValidation.ok) {
      return {
        ok: false,
        recovered: false,
        state: "RECOVERY_BLOCKED_BY_INVALID_JOURNAL",
        errors: journalValidation.errors,
      };
    }
    if (processAlive(journal.owner_pid) && Number(journal.owner_pid) !== process.pid) {
      return { ok: false, recovered: false, state: "ACTIVE_TRANSACTION", errors: [`bootstrap transaction ${journal.transaction_id} is still active`] };
    }
    const receiptFile = path.join(target, String(journal.success_receipt_path || ".intentos/bootstrap-receipt.json"));
    const success = readJson(receiptFile);
    if (journal.state === "INSTALLATION_VERIFIED_PENDING_CLOSE"
      && validateVerifiedBootstrapReceipt(success, target, {
        transactionId: journal.transaction_id,
        planDigest: journal.plan_digest,
      }).ok) {
      if (!journalTargetOwnershipMatches(target, journal)) {
        return {
          ok: false,
          recovered: false,
          state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT",
          errors: ["verified bootstrap target digest or identity changed before recovery close-out"],
        };
      }
      try {
        cleanupJournalTemps(mutationContext, journal);
      } catch (error) {
        return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors: [error.message] };
      }
      guardedUnlink(mutationContext, file, "bootstrap committed recovery journal", "bootstrap-recovery-journal-close", mutationContext.journalBinding);
      return { ok: true, recovered: true, state: "COMMITTED_SUCCESS_RECOVERED" };
    }
    if (journal.state === "PREPARED") {
      return recoverPreparedBootstrap(mutationContext, target, file, journal);
    }
    if ([ROLLBACK_RESTORED_STATE, ROLLBACK_CLEANUP_STATE].includes(journal.state)) {
      return finishRestoredBootstrapRecovery(mutationContext, target, file, journal, options);
    }
    if (journal.original_topology === "NONEMPTY_DIRECTORY") {
      if (["STAGED", "COMMIT_INTENT"].includes(journal.state)) {
        const shell = validateRecordedControlShell(target, journal);
        const stage = inspectRecordedStage(journal);
        if (shell.ok && matchesOriginalTopology(target, journal) && stage.ok && stage.present && !recordedActionExists(target, journal)) {
          try {
            cleanupJournalTemps(mutationContext, journal);
            return finishBootstrapRecovery(mutationContext, file, journal, "INTERRUPTED_BOOTSTRAP_PRECOMMIT_CLEANED");
          } catch (error) {
            return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors: [error.message] };
          }
        }
      }
      return recoverNonemptyControlShell(mutationContext, target, file, journal);
    }
    return recoverAtomicBootstrap(mutationContext, target, file, journal, options);
  }
  return { ok: true, recovered: false, state: "NO_PENDING_TRANSACTION" };
}

function recoverPreparedBootstrap(context, target, journalFile, journal) {
  const errors = [];
  if (pathEntryExists(journal.stage_root)) errors.push("prepared bootstrap stage exists without durable STAGE_OWNED authority");
  if (pathEntryExists(journal.backup_root)) errors.push("prepared bootstrap backup exists without durable BACKUP_OWNED authority");
  if (!matchesOriginalTopology(target, journal)) errors.push("prepared bootstrap target no longer matches its recorded original topology");
  if (errors.length > 0) return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors };
  return finishBootstrapRecovery(context, journalFile, journal, "INTERRUPTED_BOOTSTRAP_PRECOMMIT_CLEANED");
}

function recoverAtomicBootstrap(context, target, journalFile, journal, options = {}) {
  const stage = inspectRecordedStage(journal);
  const backup = inspectRecordedBackup(journal);
  const targetStat = lstatIfExists(target);
  const expectedTargetDigest = journal.committed_tree_digest || journal.stage_tree_digest;
  const targetIsExpected = Boolean(targetStat
    && targetStat.isDirectory()
    && !targetStat.isSymbolicLink()
    && directoryDigest(target) === expectedTargetDigest
    && matchesOwnedDirectory(target, journal.committed_target_ownership));
  const errors = [...stage.errors, ...backup.errors];
  if (targetStat && (targetStat.isSymbolicLink() || !targetStat.isDirectory())) errors.push("bootstrap target is not a non-symlink directory during recovery");
  if (errors.length > 0) return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors };

  try {
    if (journal.original_topology === "ABSENT_LEAF") {
      if (!targetStat && stage.present) {
        cleanupJournalTemps(context, journal);
        return finishBootstrapRecovery(context, journalFile, journal, "INTERRUPTED_BOOTSTRAP_PRECOMMIT_CLEANED");
      }
      if (targetIsExpected && !stage.present) {
        guardedRemoveOwnedDirectory(context, target, "interrupted bootstrap committed target", "bootstrap-recovery-target-remove", journal.committed_target_ownership);
        return finishRestoredBootstrapRecovery(context, target, journalFile, journal, options);
      }
      if (!targetStat && !stage.present) {
        return finishRestoredBootstrapRecovery(context, target, journalFile, journal, options);
      }
    } else if (journal.original_topology === "EMPTY_DIRECTORY") {
      const targetIsOriginal = Boolean(targetStat
        && targetStat.isDirectory()
        && sameNodeIdentity(nodeIdentity(targetStat), journal.original_target_identity)
        && fs.readdirSync(target).length === 0);
      if (targetIsOriginal && stage.present && !journal.backup_contains_original) {
        cleanupJournalTemps(context, journal);
        return finishBootstrapRecovery(context, journalFile, journal, "INTERRUPTED_BOOTSTRAP_PRECOMMIT_CLEANED");
      }
      if (!targetStat && stage.present && backup.present && backup.empty) {
        restoreEmptyAtomicTarget(target, journal.backup_root, context, journal.backup_ownership);
        return finishRestoredBootstrapRecovery(context, target, journalFile, journal, options);
      }
      if (targetIsExpected && !stage.present && backup.present && backup.empty) {
        guardedRemoveOwnedDirectory(context, target, "interrupted bootstrap committed target", "bootstrap-recovery-target-remove", journal.committed_target_ownership);
        restoreEmptyAtomicTarget(target, journal.backup_root, context, journal.backup_ownership);
        return finishRestoredBootstrapRecovery(context, target, journalFile, journal, options);
      }
      if (targetIsOriginal && !stage.present) {
        return finishRestoredBootstrapRecovery(context, target, journalFile, journal, options);
      }
      if (!targetStat && !stage.present && backup.present && backup.empty) {
        restoreEmptyAtomicTarget(target, journal.backup_root, context, journal.backup_ownership);
        return finishRestoredBootstrapRecovery(context, target, journalFile, journal, options);
      }
    }
  } catch (error) {
    return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors: [error.message] };
  }
  return {
    ok: false,
    recovered: false,
    state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT",
    errors: ["bootstrap COMMIT_INTENT topology does not match a verified precommit or committed transition"],
  };
}

function restoreEmptyAtomicTarget(target, backupRoot, context, backupOwnership) {
  const stat = lstatIfExists(backupRoot);
  if (!stat || stat.isSymbolicLink() || !stat.isDirectory() || fs.readdirSync(backupRoot).length > 0) {
    throw new Error("empty-target rollback backup is missing or invalid");
  }
  guardedRename(context, backupRoot, target, "empty-target rollback restore", "bootstrap-recovery-empty-target-restore", {
    sourceOwnership: backupOwnership,
    targetKind: "absent",
  });
}

function inspectRecordedStage(journal) {
  const stat = lstatIfExists(journal.stage_root);
  if (!stat) return { ok: true, present: false, errors: [] };
  const errors = [];
  if (journal.stage_state !== "STAGE_OWNED") errors.push("stage root exists without durable STAGE_OWNED authority");
  if (stat.isSymbolicLink() || !stat.isDirectory()) errors.push("recorded stage root is not a non-symlink directory");
  else if (directoryDigest(journal.stage_root) !== journal.stage_tree_digest) errors.push("recorded stage tree digest changed");
  if (!matchesOwnedDirectory(journal.stage_root, journal.stage_ownership)) errors.push("recorded stage tree identity changed");
  return { ok: errors.length === 0, present: true, errors };
}

function inspectRecordedBackup(journal) {
  const stat = lstatIfExists(journal.backup_root);
  if (!stat) return { ok: true, present: false, empty: false, errors: [] };
  const errors = [];
  if (journal.backup_state !== "BACKUP_OWNED") errors.push("backup root exists without durable BACKUP_OWNED authority");
  if (stat.isSymbolicLink() || !stat.isDirectory()) errors.push("recorded backup root is not a non-symlink directory");
  if (!matchesOwnedDirectory(journal.backup_root, journal.backup_ownership)) errors.push("recorded backup tree digest or identity changed");
  const empty = errors.length === 0 && fs.readdirSync(journal.backup_root).length === 0;
  if (journal.original_topology === "EMPTY_DIRECTORY" && !empty) errors.push("empty-target bootstrap backup is not empty");
  return { ok: errors.length === 0, present: true, empty, errors };
}

function matchesOriginalTopology(target, journal) {
  if (journal.original_topology === "ABSENT_LEAF") return !pathEntryExists(target);
  if (journal.original_topology === "EMPTY_DIRECTORY") {
    const stat = lstatIfExists(target);
    return Boolean(stat
      && stat.isDirectory()
      && !stat.isSymbolicLink()
      && sameNodeIdentity(nodeIdentity(stat), journal.original_target_identity)
      && fs.readdirSync(target).length === 0);
  }
  const stat = lstatIfExists(target);
  return Boolean(stat
    && stat.isDirectory()
    && !stat.isSymbolicLink()
    && sameNodeIdentity(nodeIdentity(stat), journal.original_target_identity)
    && validateRecordedControlShell(target, journal).ok
    && bindingsMatch(target, journal.preserved_control_bindings || []));
}

function validateRecordedControlShell(target, journal) {
  return validatePreservedControlShell({
    target_root: target,
    topology: { state: "NONEMPTY_DIRECTORY" },
    preserved_control_files: journal.preserved_control_files || [],
  });
}

function recordedActionExists(target, journal) {
  return (journal.exact_actions || []).some((action) => pathEntryExists(assertSafeWritePath(target, action.path, "bootstrap recovery action path")));
}

function cleanupJournalTemps(context, journal) {
  if (journal.stage_state === "UNOWNED") {
    if (pathEntryExists(journal.stage_root)) throw new Error("stage root exists without durable STAGE_OWNED authority");
  } else if (journal.stage_state === "CONSUMED") {
    if (pathEntryExists(journal.stage_root)) throw new Error("consumed stage path was recreated outside the transaction");
  } else {
    safeRemoveOwnedTemp(context, journal.stage_root, `.intentos-stage-${journal.transaction_id}-`, true, journal.stage_ownership);
  }
  if (journal.backup_state === "UNOWNED") {
    if (pathEntryExists(journal.backup_root)) throw new Error("backup root exists without durable BACKUP_OWNED authority");
  } else {
    safeRemoveOwnedTemp(context, journal.backup_root, `.intentos-backup-${journal.transaction_id}-`, true, journal.backup_ownership);
  }
}

function finishRestoredBootstrapRecovery(context, target, journalFile, journal, options = {}) {
  if (!matchesOriginalTopology(target, journal)) {
    return {
      ok: false,
      recovered: false,
      state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT",
      errors: ["bootstrap target does not match its recorded preimage after rollback"],
    };
  }
  let recoveredJournal = journal;
  if (journal.state !== ROLLBACK_CLEANUP_STATE) {
    recoveredJournal = persistRecoveredBootstrapJournal(context, journalFile, journal, ROLLBACK_RESTORED_STATE, {
      rollback_restored_at: journal.rollback_restored_at || new Date().toISOString(),
      recovery_errors: [],
      residual_paths: [],
    });
    options.afterRollbackRestored?.({ journal: recoveredJournal, targetRoot: target });
  }
  try {
    cleanupJournalTemps(context, recoveredJournal);
  } catch (error) {
    return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors: [error.message] };
  }
  options.afterRollbackCleanup?.({ journal: recoveredJournal, targetRoot: target });
  if (recoveredJournal.state !== ROLLBACK_CLEANUP_STATE) {
    recoveredJournal = persistRecoveredBootstrapJournal(context, journalFile, recoveredJournal, ROLLBACK_CLEANUP_STATE, {
      rollback_restored_at: recoveredJournal.rollback_restored_at || new Date().toISOString(),
      rollback_cleanup_completed_at: new Date().toISOString(),
      recovery_errors: [],
      residual_paths: [],
    });
  }
  const state = recoveredJournal.original_topology === "NONEMPTY_DIRECTORY"
    ? "INTERRUPTED_BOOTSTRAP_ROLLED_BACK_TO_CONTROL_SHELL"
    : "INTERRUPTED_BOOTSTRAP_ROLLED_BACK";
  return finishBootstrapRecovery(context, journalFile, recoveredJournal, state);
}

function finishBootstrapRecovery(context, journalFile, journal, state) {
  persistRecoveryFailureReceipt(context, journal, state);
  guardedUnlink(context, journalFile, "bootstrap recovery journal", "bootstrap-recovery-journal-close", context.journalBinding);
  return { ok: true, recovered: true, state };
}

function validatePendingBootstrapJournal(journal, target, journalFile, context) {
  const errors = [];
  const { journal_digest: _digest, ...base } = journal || {};
  if (journal?.schema_version !== BOOTSTRAP_JOURNAL_VERSION) errors.push("bootstrap pending journal schema version is invalid");
  if (journal?.artifact_type !== "bootstrap_pending_journal") errors.push("bootstrap pending journal artifact type is invalid");
  if (journal?.journal_digest !== evidenceDigest(base, [])) errors.push("bootstrap pending journal digest is invalid");
  if (path.resolve(String(journal?.target_root || "")) !== target) errors.push("bootstrap pending journal target does not match");
  const transactionId = String(journal?.transaction_id || "");
  if (!/^[A-Za-z0-9._-]+$/.test(transactionId)) errors.push("bootstrap pending journal transaction id is invalid");
  if (path.basename(journalFile) !== `.intentos-bootstrap-${transactionId}.pending.json`) {
    errors.push("bootstrap pending journal filename does not match its transaction id");
  }
  if (!Number.isInteger(Number(journal?.owner_pid)) || Number(journal.owner_pid) < 1) errors.push("bootstrap pending journal owner PID is invalid");
  if (!validNodeIdentity(journal?.parent_identity)) errors.push("bootstrap pending journal parent identity is invalid");
  if (validNodeIdentity(journal?.parent_identity) && !sameNodeIdentity(journal.parent_identity, context?.rootIdentity)) {
    errors.push("bootstrap pending journal parent identity changed");
  }
  if (!["ABSENT_LEAF", "EMPTY_DIRECTORY", "NONEMPTY_DIRECTORY"].includes(String(journal?.original_topology || ""))) {
    errors.push("bootstrap pending journal original topology is invalid");
  }
  if (!["PREPARED", "STAGED", "COMMIT_INTENT", "APPLYING_NONEMPTY_CONTROL_SHELL", "TARGET_COMMITTED_PENDING_ACTIVATION", "RECEIPT_COMMITTED_PENDING_INSTALLATION_VALIDATION", "INSTALLATION_VERIFIED_PENDING_CLOSE", "ROLLBACK_INCOMPLETE", ROLLBACK_RESTORED_STATE, ROLLBACK_CLEANUP_STATE].includes(String(journal?.state || ""))) {
    errors.push("bootstrap pending journal state is invalid");
  }
  if ([ROLLBACK_RESTORED_STATE, ROLLBACK_CLEANUP_STATE].includes(journal?.state)
    && !Number.isFinite(Date.parse(String(journal?.rollback_restored_at || "")))) {
    errors.push("bootstrap pending journal rollback restoration time is invalid");
  }
  if (journal?.state === ROLLBACK_CLEANUP_STATE
    && !Number.isFinite(Date.parse(String(journal?.rollback_cleanup_completed_at || "")))) {
    errors.push("bootstrap pending journal rollback cleanup time is invalid");
  }
  for (const field of ["topology_digest", "envelope_digest", "plan_digest", "approval_digest", "readiness_digest"]) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(journal?.[field] || ""))) errors.push(`bootstrap pending journal ${field} is invalid`);
  }
  if (!normalizeRelative(journal?.success_receipt_path)) errors.push("bootstrap pending journal receipt path is unsafe");
  if (!Number.isFinite(Date.parse(String(journal?.updated_at || "")))) errors.push("bootstrap pending journal update time is invalid");
  if (!["UNOWNED", "STAGE_OWNED", "CONSUMED"].includes(String(journal?.stage_state || ""))) errors.push("bootstrap pending journal stage ownership is invalid");
  if (!["UNOWNED", "BACKUP_OWNED"].includes(String(journal?.backup_state || ""))) errors.push("bootstrap pending journal backup ownership is invalid");
  if (journal?.state === "PREPARED" && (journal.stage_state !== "UNOWNED" || journal.backup_state !== "UNOWNED")) {
    errors.push("prepared bootstrap journal cannot claim temporary ownership");
  }
  if (!["PREPARED", "ROLLBACK_INCOMPLETE"].includes(journal?.state)
    && (journal.stage_state === "UNOWNED" || journal.backup_state !== "BACKUP_OWNED")) {
    errors.push("bootstrap journal advanced without durable stage and BACKUP_OWNED evidence");
  }
  if (journal?.state !== "PREPARED" && !/^sha256:[a-f0-9]{64}$/.test(String(journal?.stage_tree_digest || ""))) {
    errors.push("bootstrap pending journal staged tree digest is invalid");
  }
  if (journal?.original_topology === "ABSENT_LEAF") {
    if (journal?.original_target_identity !== null) errors.push("absent bootstrap target cannot record an original identity");
  } else if (!validNodeIdentity(journal?.original_target_identity)) {
    errors.push("bootstrap pending journal original target identity is invalid");
  }
  if (journal?.stage_state !== "UNOWNED" && !validOwnedDirectoryRecord(journal?.stage_ownership)) {
    errors.push("bootstrap pending journal stage ownership record is invalid");
  }
  if (journal?.backup_state === "BACKUP_OWNED" && !validOwnedDirectoryRecord(journal?.backup_ownership)) {
    errors.push("bootstrap pending journal backup ownership record is invalid");
  }
  if (journal?.committed_target_identity !== null && !validNodeIdentity(journal?.committed_target_identity)) {
    errors.push("bootstrap pending journal committed target identity is invalid");
  }
  if (journal?.committed_target_ownership !== null && !validOwnedDirectoryRecord(journal?.committed_target_ownership)) {
    errors.push("bootstrap pending journal committed target ownership is invalid");
  }
  for (const binding of Array.isArray(journal?.written_paths) ? journal.written_paths : []) {
    if (!normalizeRelative(binding?.path) || !validNodeIdentity(binding?.identity)
      || !/^sha256:[a-f0-9]{64}$/.test(String(binding?.content_digest || ""))) {
      errors.push(`bootstrap pending journal written path binding is invalid: ${binding?.path || "<empty>"}`);
    }
  }
  for (const binding of Array.isArray(journal?.created_directories) ? journal.created_directories : []) {
    if (!normalizeRelative(binding?.path) || !validNodeIdentity(binding?.identity)) {
      errors.push(`bootstrap pending journal created directory binding is invalid: ${binding?.path || "<empty>"}`);
    }
  }
  if (journal?.failure_receipt_binding !== null
    && (!validNodeIdentity(journal?.failure_receipt_binding?.identity)
      || !/^sha256:[a-f0-9]{64}$/.test(String(journal?.failure_receipt_binding?.content_digest || "")))) {
    errors.push("bootstrap pending journal failure receipt binding is invalid");
  }
  const exactActions = Array.isArray(journal?.exact_actions) ? journal.exact_actions : [];
  if (exactActions.length === 0) errors.push("bootstrap pending journal exact action graph is missing");
  const ids = new Set();
  const paths = new Set();
  for (const action of exactActions) {
    const id = String(action?.id || "");
    const relative = normalizeRelative(action?.path);
    if (!/^A-[0-9]{3,}$/.test(id)) errors.push(`bootstrap pending journal action id is invalid: ${id || "<empty>"}`);
    if (!relative || relative !== action?.path) errors.push(`bootstrap pending journal action path is unsafe: ${action?.path || "<empty>"}`);
    if (!/^sha256:[a-f0-9]{64}$/.test(String(action?.content_digest || ""))) errors.push(`bootstrap pending journal action digest is invalid: ${id || "<empty>"}`);
    if (typeof action?.receipt_required !== "boolean") errors.push(`bootstrap pending journal action receipt classification is invalid: ${id || "<empty>"}`);
    if (ids.has(id)) errors.push(`bootstrap pending journal action id is duplicated: ${id}`);
    if (paths.has(relative)) errors.push(`bootstrap pending journal action path is duplicated: ${relative}`);
    ids.add(id);
    paths.add(relative);
  }
  const preserved = Array.isArray(journal?.preserved_control_files) ? journal.preserved_control_files : [];
  if (journal?.original_topology === "NONEMPTY_DIRECTORY" && preserved.length === 0) {
    errors.push("non-empty bootstrap pending journal lacks preserved control evidence");
  }
  for (const item of preserved) {
    const relative = normalizeRelative(item?.path);
    if (!relative || relative !== item?.path) errors.push(`bootstrap pending journal preserved path is unsafe: ${item?.path || "<empty>"}`);
    if (!/^sha256:[a-f0-9]{64}$/.test(String(item?.digest || ""))) errors.push(`bootstrap pending journal preserved digest is invalid: ${item?.path || "<empty>"}`);
    for (const actionPath of paths) {
      if (pathsOverlap(actionPath, relative)) {
        errors.push(`bootstrap pending journal action ${actionPath} overlaps preserved control evidence: ${relative}`);
      }
    }
  }
  const preservedBindings = Array.isArray(journal?.preserved_control_bindings) ? journal.preserved_control_bindings : [];
  if (journal?.original_topology === "NONEMPTY_DIRECTORY" && preservedBindings.length !== preserved.length) {
    errors.push("non-empty bootstrap pending journal lacks exact preserved control identities");
  }
  for (const binding of preservedBindings) {
    if (!normalizeRelative(binding?.path) || !validNodeIdentity(binding?.identity)
      || !/^sha256:[a-f0-9]{64}$/.test(String(binding?.content_digest || ""))) {
      errors.push(`bootstrap pending journal preserved control binding is invalid: ${binding?.path || "<empty>"}`);
    }
  }
  const actionPaths = [...paths];
  for (let index = 0; index < actionPaths.length; index += 1) {
    for (const other of actionPaths.slice(index + 1)) {
      if (pathsOverlap(actionPaths[index], other)) {
        errors.push(`bootstrap pending journal actions overlap by ancestry: ${actionPaths[index]} and ${other}`);
      }
    }
  }
  const parent = path.dirname(target);
  for (const [field, prefix] of [["stage_root", `.intentos-stage-${transactionId}-`], ["backup_root", `.intentos-backup-${transactionId}-`]]) {
    const value = String(journal?.[field] || "");
    if (!value) {
      errors.push(`bootstrap pending journal ${field} is missing`);
      continue;
    }
    const resolved = path.resolve(value);
    if (path.dirname(resolved) !== parent || !path.basename(resolved).startsWith(prefix)) {
      errors.push(`bootstrap pending journal ${field} is outside its owned transaction path`);
    }
  }
  if (typeof journal?.backup_contains_original !== "boolean") errors.push("bootstrap pending journal backup topology marker is invalid");
  if (journal?.committed_tree_digest && !/^sha256:[a-f0-9]{64}$/.test(String(journal.committed_tree_digest))) {
    errors.push("bootstrap pending journal committed tree digest is invalid");
  }
  return { ok: errors.length === 0, errors };
}

function recoverNonemptyControlShell(context, target, journalFile, journal) {
  const errors = [];
  const preserved = new Map((journal.preserved_control_files || []).map((item) => [item.path, item.digest]));
  const actions = new Map((journal.exact_actions || []).map((item) => [item.path, item.content_digest]));
  const written = new Map((journal.written_paths || []).map((item) => [item.path, item]));
  const targetStat = lstatIfExists(target);
  if (!targetStat || targetStat.isSymbolicLink() || !targetStat.isDirectory()
    || !sameNodeIdentity(nodeIdentity(targetStat), journal.committed_target_identity || journal.original_target_identity)) {
    errors.push("interrupted bootstrap target identity changed during recovery");
  }
  if (errors.length > 0) {
    return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors };
  }
  if (!bindingsMatch(target, journal.preserved_control_bindings || [])) {
    errors.push("preserved control digest or identity changed during recovery");
  }
  if (errors.length > 0) {
    return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors };
  }
  if (preserved.size === 0 || actions.size === 0) {
    return {
      ok: false,
      recovered: false,
      state: "RECOVERY_BLOCKED_BY_INVALID_CONTROL_SHELL_JOURNAL",
      errors: ["non-empty bootstrap journal does not record preserved controls and exact actions"],
    };
  }
  const receiptPath = normalizeRelative(journal.success_receipt_path);
  const receiptTempPath = receiptPath
    ? path.posix.join(path.posix.dirname(receiptPath), `.${path.posix.basename(receiptPath)}.${journal.transaction_id}.tmp`)
    : "";
  const receiptRollbackOwned = [
    "RECEIPT_COMMITTED_PENDING_INSTALLATION_VALIDATION",
    "INSTALLATION_VERIFIED_PENDING_CLOSE",
  ].includes(journal.state)
    && validateVerifiedBootstrapReceipt(readJson(path.join(target, receiptPath)), target, {
      transactionId: journal.transaction_id,
      planDigest: journal.plan_digest,
    }).ok;
  const receiptBinding = written.get(receiptPath);
  const inventory = fs.existsSync(target) ? treeInventory(target) : [];
  for (const item of inventory) {
    if (item.type === "symlink") {
      errors.push(`interrupted bootstrap target contains symbolic link ${item.path}`);
      continue;
    }
    if (item.type !== "file") continue;
    if (preserved.has(item.path)) {
      if (preserved.get(item.path) !== item.digest) errors.push(`preserved control evidence changed during recovery: ${item.path}`);
      continue;
    }
    if (actions.has(item.path)) {
      const binding = written.get(item.path);
      if (actions.get(item.path) !== item.digest
        || !binding
        || binding.content_digest !== item.digest
        || !sameNodeIdentity(binding.identity, item.identity)) {
        errors.push(`transaction action digest or identity changed during recovery: ${item.path}`);
      }
      continue;
    }
    if (item.path === receiptPath && receiptRollbackOwned && receiptBinding
      && receiptBinding.content_digest === item.digest
      && sameNodeIdentity(receiptBinding.identity, item.identity)) continue;
    if (item.path === receiptTempPath) {
      errors.push("unbound bootstrap receipt temporary file blocks automatic recovery");
      continue;
    }
    errors.push(`interrupted bootstrap target contains content outside the exact transaction: ${item.path}`);
  }
  for (const [relative] of preserved) {
    if (!inventory.some((item) => item.type === "file" && item.path === relative)) errors.push(`preserved control evidence is missing during recovery: ${relative}`);
  }
  if (receiptPath && inventory.some((item) => item.type === "file" && item.path === receiptPath) && !receiptRollbackOwned) {
    errors.push("an invalid or mismatched bootstrap receipt blocks automatic recovery");
  }
  if (errors.length > 0) {
    return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors };
  }

  for (const relative of [...actions.keys(), receiptRollbackOwned ? receiptPath : ""].filter(Boolean)) {
    const file = assertSafeWritePath(target, relative, "interrupted bootstrap owned path");
    if (!pathEntryExists(file)) continue;
    const binding = written.get(relative);
    if (!binding) {
      return {
        ok: false,
        recovered: false,
        state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT",
        errors: [`interrupted bootstrap path lacks durable identity ownership: ${relative}`],
      };
    }
    try {
      guardedUnlink(context, file, `interrupted bootstrap owned path ${relative}`, "bootstrap-recovery-action-unlink", binding);
    } catch (error) {
      return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors: [error.message] };
    }
  }
  try {
    removeEmptyOwnedDirectories(context, target, journal.created_directories || []);
  } catch (error) {
    return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors: [error.message] };
  }
  const shellValidation = validatePreservedControlShell({
    target_root: target,
    topology: { state: "NONEMPTY_DIRECTORY" },
    preserved_control_files: [...preserved].map(([pathValue, digest]) => ({ path: pathValue, digest })),
  });
  if (!shellValidation.ok) {
    return {
      ok: false,
      recovered: false,
      state: "RECOVERY_BLOCKED_BY_CONTROL_SHELL_DRIFT",
      errors: shellValidation.errors,
    };
  }
  try {
    cleanupJournalTemps(context, journal);
  } catch (error) {
    return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors: [error.message] };
  }
  return finishBootstrapRecovery(context, journalFile, journal, "INTERRUPTED_BOOTSTRAP_ROLLED_BACK_TO_CONTROL_SHELL");
}

function removeEmptyOwnedDirectories(context, root, bindings) {
  for (const binding of [...bindings].sort((left, right) => right.path.length - left.path.length)) {
    const directory = assertSafeWritePath(root, binding.path, "bootstrap owned cleanup directory");
    if (!pathEntryExists(directory)) continue;
    guardedRmdir(context, directory, `bootstrap owned cleanup directory ${binding.path}`, "bootstrap-recovery-directory-remove", {
      identity: binding.identity,
      tree_digest: evidenceDigest([], []),
      entries: [],
    });
  }
}

function persistRecoveryFailureReceipt(context, journal, state) {
  const parent = context.root;
  const failurePath = assertSafeWritePath(parent, `.intentos-bootstrap-${journal.transaction_id}.failure.json`, "bootstrap recovery failure receipt");
  if (pathEntryExists(failurePath)) {
    const expected = journal.failure_receipt_binding;
    if (!expected) throw new Error("bootstrap recovery failure receipt appeared without durable transaction ownership");
    const observed = captureFileBinding(failurePath, expected.content_digest, "bootstrap recovery failure receipt");
    if (!sameNodeIdentity(observed.identity, expected.identity)) {
      throw new Error("bootstrap recovery failure receipt digest or identity changed");
    }
    return;
  }
  const content = Buffer.from(`${JSON.stringify({
    schema_version: "1.113.0",
    artifact_type: "bootstrap_recovery_receipt",
    transaction_id: journal.transaction_id,
    target_root: journal.target_root,
    state,
    recovered_at: new Date().toISOString(),
  }, null, 2)}\n`);
  guardedWriteNewFile(context, failurePath, content, "bootstrap recovery failure receipt", "bootstrap-recovery-receipt-write");
}

function stageActions(transaction, stageRoot, context) {
  const stagedDirectories = new Map();
  for (const action of transaction.actions) {
    const stageFile = assertSafeWritePath(stageRoot, action.path, `bootstrap stage ${action.id}`);
    ensureParentDirectories(stageRoot, path.dirname(stageFile), stagedDirectories, context, "bootstrap-stage-parent-create");
    const binding = guardedWriteNewFile(
      context,
      stageFile,
      Buffer.from(action.content_base64, "base64"),
      `bootstrap stage ${action.id}`,
      "bootstrap-stage-action-write",
    );
    if (binding.content_digest !== action.content_digest) throw new Error(`staged digest mismatch for ${action.id}`);
  }
}

function applyJournaledAction(transaction, action, stageRoot, backupRoot, journal, createdDirectories, context) {
  const target = assertSafeWritePath(transaction.target_root, action.path, `bootstrap action ${action.id}`);
  const backup = assertSafeWritePath(backupRoot, action.path, `bootstrap backup ${action.id}`);
  const entry = { action, target, backup, source: "", hadExisting: pathEntryExists(target), targetWritten: false, targetIdentity: null };
  journal.push(entry);
  if (entry.hadExisting) {
    throw new Error(`bootstrap action ${action.id} target appeared after the exact shell preflight`);
  }
  ensureParentDirectories(transaction.target_root, path.dirname(target), createdDirectories, context, "bootstrap-action-parent-create");
  const staged = assertSafeWritePath(stageRoot, action.path, `bootstrap staged action ${action.id}`);
  const sourceBinding = captureFileBinding(staged, action.content_digest, `bootstrap staged action ${action.id}`);
  entry.source = staged;
  entry.targetIdentity = sourceBinding.identity;
  const result = guardedRename(context, staged, target, `bootstrap action ${action.id}`, "bootstrap-action-target-rename", {
    sourceBinding,
    targetKind: "absent",
  });
  entry.targetWritten = true;
  entry.targetIdentity = result.identity;
  if (result.content_digest !== action.content_digest) throw new Error(`post-write digest mismatch for ${action.id}`);
}

function persistSuccessReceipt(transaction, value, backupRoot, journal, createdDirectories, context) {
  const content = Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
  const action = {
    id: "TRANSACTION-RECEIPT",
    path: transaction.success_receipt_path,
    content_digest: digestContent(content),
  };
  const target = assertSafeWritePath(transaction.target_root, action.path, "bootstrap success receipt");
  const backup = assertSafeWritePath(backupRoot, action.path, "bootstrap success receipt backup");
  const entry = { action, target, backup, source: "", hadExisting: pathEntryExists(target), targetWritten: false, targetIdentity: null };
  journal.push(entry);
  if (entry.hadExisting) {
    throw new Error("bootstrap success receipt appeared outside the current transaction");
  }
  ensureParentDirectories(transaction.target_root, path.dirname(target), createdDirectories, context, "bootstrap-receipt-parent-create");
  const temporary = path.join(path.dirname(target), `.${path.basename(target)}.${transaction.transaction_id}.tmp`);
  const temporaryBinding = guardedWriteNewFile(context, temporary, content, "bootstrap success receipt temporary", "bootstrap-receipt-temp-write");
  entry.source = temporary;
  entry.targetIdentity = temporaryBinding.identity;
  const result = guardedRename(context, temporary, target, "bootstrap success receipt", "bootstrap-receipt-commit", {
    sourceBinding: temporaryBinding,
    targetKind: "absent",
  });
  entry.targetWritten = true;
  entry.targetIdentity = result.identity;
  if (result.content_digest !== action.content_digest) throw new Error("bootstrap success receipt digest mismatch");
}

function persistFailureReceipt(transaction, value, context) {
  const parent = path.dirname(transaction.target_root);
  const target = assertSafeWritePath(parent, transaction.failure_receipt_path, "bootstrap failure receipt");
  return guardedWriteNewFile(
    context,
    target,
    Buffer.from(`${JSON.stringify(value, null, 2)}\n`),
    "bootstrap failure receipt",
    "bootstrap-failure-receipt-write",
  );
}

function rollbackTransaction(transaction, journal, createdDirectories, atomic = {}) {
  const errors = [];
  const residualPaths = [];
  const context = atomic.mutationContext;
  try {
    assertMutationRoot(context);
  } catch (error) {
    return { state: "ROLLBACK_INCOMPLETE", errors: [error.message], residualPaths: [transaction.target_root] };
  }
  if (atomic.backupRoot && pathEntryExists(atomic.backupRoot) && atomic.backupOwned !== true) {
    return {
      state: "ROLLBACK_INCOMPLETE",
      errors: ["bootstrap backup exists without durable BACKUP_OWNED authority"],
      residualPaths: [atomic.backupRoot],
    };
  }
  const observedAtomicOwnership = !atomic.ownedAtomicTarget
    && atomic.stageOwnership
    && atomic.stageRoot
    && !pathEntryExists(atomic.stageRoot)
    && matchesOwnedDirectory(transaction.target_root, atomic.stageOwnership)
    ? atomic.stageOwnership
    : null;
  const targetOwnership = atomic.committedTargetOwnership || observedAtomicOwnership;
  const ownsAtomicTarget = atomic.ownedAtomicTarget || Boolean(observedAtomicOwnership);
  if (["ABSENT_LEAF", "EMPTY_DIRECTORY"].includes(transaction.topology.state)
    && (ownsAtomicTarget || atomic.backupContainsOriginal)) {
    if (ownsAtomicTarget && pathEntryExists(transaction.target_root)) {
      try {
        if (!targetOwnership
          || atomic.committedTargetIdentity && !sameNodeIdentity(atomic.committedTargetIdentity, targetOwnership.identity)
          || atomic.committedTreeDigest && targetOwnership.tree_digest !== atomic.committedTreeDigest) {
          throw new Error("bootstrap committed target lacks exact digest and identity ownership");
        }
        guardedRemoveOwnedDirectory(
          context,
          transaction.target_root,
          "bootstrap rollback committed target",
          "bootstrap-rollback-target-remove",
          targetOwnership,
        );
      } catch (error) {
        errors.push(error.message);
        residualPaths.push(transaction.target_root);
      }
    }
    if (transaction.topology.state === "EMPTY_DIRECTORY" && errors.length === 0) {
      try {
        if (!atomic.backupRoot || !pathEntryExists(atomic.backupRoot)) throw new Error("empty-target backup is missing");
        const backupStat = fs.lstatSync(atomic.backupRoot);
        if (backupStat.isSymbolicLink() || !backupStat.isDirectory() || fs.readdirSync(atomic.backupRoot).length > 0) {
          throw new Error("empty-target backup is not an exact empty directory");
        }
        if (!atomic.backupOwnership || !sameNodeIdentity(nodeIdentity(backupStat), atomic.backupOwnership.identity)) {
          throw new Error("empty-target backup identity changed before rollback");
        }
        guardedRename(context, atomic.backupRoot, transaction.target_root, "bootstrap empty target rollback", "bootstrap-rollback-empty-target-restore", {
          sourceOwnership: atomic.backupOwnership,
          targetKind: "absent",
        });
      } catch (error) {
        errors.push(error.message);
        residualPaths.push(atomic.backupRoot || transaction.target_root);
      }
    }
    return { state: errors.length ? "ROLLBACK_INCOMPLETE" : "ROLLED_BACK", errors, residualPaths };
  }
  for (const entry of [...journal].reverse()) {
    try {
      assertTargetDirectoryIdentity(transaction.target_root, atomic.committedTargetIdentity, `bootstrap rollback ${entry.action.id}`);
      if (pathEntryExists(entry.target)) {
        if (!entry.targetWritten && (!entry.source || pathEntryExists(entry.source))) {
          throw new Error("bootstrap target appeared before its guarded transaction rename completed");
        }
        guardedUnlink(context, entry.target, `bootstrap rollback ${entry.action.id}`, "bootstrap-rollback-action-unlink", {
          identity: entry.targetIdentity,
          content_digest: entry.action.content_digest,
        });
      }
      if (entry.hadExisting) {
        throw new Error("bootstrap rollback encountered an unsupported existing target preimage");
      }
    } catch (error) {
      errors.push(`${entry.action.id}: ${error.message}`);
      residualPaths.push(entry.target);
    }
  }
  for (const [directory, identity] of [...createdDirectories].sort((left, right) => right[0].length - left[0].length)) {
    try {
      if (pathEntryExists(directory)) {
        guardedRmdir(context, directory, `bootstrap rollback created directory ${directory}`, "bootstrap-rollback-directory-remove", {
          identity,
          tree_digest: evidenceDigest([], []),
          entries: [],
        });
      }
    } catch (error) {
      errors.push(`created directory ${directory}: ${error.message}`);
      residualPaths.push(directory);
    }
  }
  if (transaction.topology.state === "EMPTY_DIRECTORY") {
    try {
      const entries = fs.readdirSync(transaction.target_root);
      if (entries.length > 0) {
        errors.push(`empty target rollback left entries: ${entries.join(", ")}`);
        residualPaths.push(...entries.map((item) => path.join(transaction.target_root, item)));
      }
    } catch (error) {
      errors.push(`empty target rollback check failed: ${error.message}`);
      residualPaths.push(transaction.target_root);
    }
  }
  return { state: errors.length ? "ROLLBACK_INCOMPLETE" : "ROLLED_BACK", errors, residualPaths: [...new Set(residualPaths)] };
}

function ensureParentDirectories(root, directory, createdDirectories, context, operation) {
  const pending = [];
  let current = directory;
  while (current !== root && !fs.existsSync(current)) {
    pending.push(current);
    current = path.dirname(current);
  }
  if (current !== root && !current.startsWith(`${root}${path.sep}`)) throw new Error("bootstrap parent escapes target root");
  for (const item of pending.reverse()) {
    const binding = guardedMkdir(context, item, `bootstrap parent directory ${item}`, operation);
    createdDirectories.set(item, binding.identity);
  }
}

function normalizeActions(actions) {
  const ids = new Set();
  const paths = new Set();
  return actions.map((item, index) => {
    const id = String(item.id || `A-${String(index + 1).padStart(3, "0")}`);
    const relative = normalizeRelative(item.path);
    if (ids.has(id)) throw new Error(`duplicate bootstrap action id ${id}`);
    if (paths.has(relative)) throw new Error(`duplicate bootstrap action path ${relative}`);
    ids.add(id);
    paths.add(relative);
    if (!relative) throw new Error(`unsafe bootstrap action path ${item.path || "<empty>"}`);
    const content = Buffer.isBuffer(item.content) ? item.content : Buffer.from(String(item.content ?? ""));
    return {
      id,
      path: relative,
      content_base64: content.toString("base64"),
      content_digest: digestContent(content),
      receipt_required: item.receiptRequired !== false,
    };
  });
}

function normalizePreservedControlFiles(items) {
  const seen = new Set();
  return items.map((item) => {
    const relative = normalizeRequiredRelative(item?.path, "preserved control evidence path");
    if (seen.has(relative)) throw new Error(`duplicate preserved control evidence path ${relative}`);
    seen.add(relative);
    return { path: relative, digest: requiredDigest(item?.digest, `preserved control evidence ${relative}`) };
  }).sort((left, right) => left.path.localeCompare(right.path));
}

function validatePreservedControlShell(transaction) {
  if (transaction?.topology?.state !== "NONEMPTY_DIRECTORY") return { ok: true, errors: [] };
  const errors = [];
  const root = transaction.target_root;
  if (!fs.existsSync(root) || !fs.lstatSync(root).isDirectory() || fs.lstatSync(root).isSymbolicLink()) {
    return { ok: false, errors: ["non-empty bootstrap control shell is missing or unsafe"] };
  }
  const expectedFiles = new Map((transaction.preserved_control_files || []).map((item) => [item.path, item.digest]));
  const expectedDirectories = expectedDirectoryPaths(expectedFiles.keys());
  const inventory = treeInventory(root);
  for (const item of inventory) {
    if (item.type === "symlink") errors.push(`bootstrap control shell contains symbolic link ${item.path}`);
    else if (item.type === "directory" && !expectedDirectories.has(item.path)) errors.push(`bootstrap control shell contains unexpected directory ${item.path}`);
    else if (item.type === "file") {
      const expected = expectedFiles.get(item.path);
      if (!expected) errors.push(`bootstrap control shell contains unexpected file ${item.path}`);
      else if (expected !== item.digest) errors.push(`bootstrap control evidence changed: ${item.path}`);
    }
  }
  for (const [relative] of expectedFiles) {
    if (!inventory.some((item) => item.type === "file" && item.path === relative)) errors.push(`bootstrap control evidence is missing: ${relative}`);
  }
  return { ok: errors.length === 0, errors };
}

function expectedDirectoryPaths(filePaths) {
  const directories = new Set();
  for (const relative of filePaths) {
    let current = path.posix.dirname(relative);
    while (current && current !== ".") {
      directories.add(current);
      current = path.posix.dirname(current);
    }
  }
  return directories;
}

function treeInventory(root) {
  const rows = [];
  walkDirectory(root, root, rows);
  return rows.map((item) => {
    const file = path.join(root, item.path);
    const stat = fs.lstatSync(file);
    if (item.type === "file") return { ...item, identity: nodeIdentity(stat), digest: fileDigest(file) };
    if (item.type === "directory") return { ...item, identity: nodeIdentity(stat) };
    return item;
  });
}

function normalizeRelative(value) {
  const normalized = path.posix.normalize(String(value || "").replaceAll("\\", "/").replace(/^\.\//, ""));
  if (!normalized || normalized === "." || normalized === ".." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) return "";
  return normalized;
}

function pathsOverlap(left, right) {
  const a = normalizeRelative(left);
  const b = normalizeRelative(right);
  if (!a || !b) return false;
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

function normalizeRequiredRelative(value, label) {
  const normalized = normalizeRelative(value);
  if (!normalized) throw new Error(`${label} is unsafe`);
  return normalized;
}

function safeFailureReceiptName(value) {
  const name = String(value || "");
  return /^\.intentos-bootstrap-[A-Za-z0-9._-]+\.failure\.json$/.test(name) && !name.includes("..");
}

function safePendingJournalName(value) {
  const name = String(value || "");
  return /^\.intentos-bootstrap-[A-Za-z0-9._-]+\.pending\.json$/.test(name) && !name.includes("..");
}

function pendingJournalFile(transaction) {
  return assertSafeWritePath(path.dirname(transaction.target_root), transaction.pending_journal_path, "bootstrap pending journal");
}

function persistPendingJournal(transaction, state = {}, context, expectedBinding = null) {
  const target = pendingJournalFile(transaction);
  const recordBase = {
    schema_version: BOOTSTRAP_JOURNAL_VERSION,
    artifact_type: "bootstrap_pending_journal",
    transaction_id: transaction.transaction_id,
    owner_pid: transaction.owner_pid,
    target_root: transaction.target_root,
    original_topology: transaction.topology.state,
    topology_digest: transaction.topology.topology_digest,
    envelope_digest: transaction.envelope_digest,
    plan_digest: transaction.plan_digest,
    approval_digest: transaction.approval_digest,
    readiness_digest: transaction.readiness_digest,
    success_receipt_path: transaction.success_receipt_path,
    preserved_control_files: transaction.preserved_control_files || [],
    exact_actions: (transaction.actions || []).map((item) => ({
      id: item.id,
      path: item.path,
      content_digest: item.content_digest,
      receipt_required: item.receipt_required,
    })),
    updated_at: new Date().toISOString(),
    ...state,
  };
  const record = { ...recordBase, journal_digest: evidenceDigest(recordBase, []) };
  const content = Buffer.from(`${JSON.stringify(record, null, 2)}\n`);
  const temporary = `${target}.${process.pid}.${crypto.randomUUID()}.tmp`;
  const temporaryBinding = guardedWriteNewFile(context, temporary, content, "bootstrap pending journal temporary", "bootstrap-journal-temp-write");
  return guardedRename(context, temporary, target, "bootstrap pending journal", "bootstrap-journal-commit", {
    sourceBinding: temporaryBinding,
    targetKind: expectedBinding ? "regular" : "absent",
    targetBinding: expectedBinding,
  });
}

function persistRecoveredBootstrapJournal(context, target, journal, state, extra = {}) {
  const { journal_digest: _digest, ...base } = journal;
  const recordBase = {
    ...base,
    ...extra,
    owner_pid: process.pid,
    state,
    updated_at: new Date().toISOString(),
  };
  const record = { ...recordBase, journal_digest: evidenceDigest(recordBase, []) };
  const temporary = `${target}.${process.pid}.${crypto.randomUUID()}.tmp`;
  const temporaryBinding = guardedWriteNewFile(
    context,
    temporary,
    Buffer.from(`${JSON.stringify(record, null, 2)}\n`),
    "bootstrap recovered journal temporary",
    "bootstrap-recovery-journal-temp-write",
  );
  context.journalBinding = guardedRename(context, temporary, target, "bootstrap recovered journal", "bootstrap-recovery-journal-commit", {
    sourceBinding: temporaryBinding,
    targetKind: "regular",
    targetBinding: context.journalBinding,
  });
  return record;
}

function clearPendingJournal(transaction, context, binding) {
  const target = pendingJournalFile(transaction);
  if (!pathEntryExists(target)) return;
  guardedUnlink(context, target, "bootstrap pending journal close", "bootstrap-journal-close", binding);
}

function directoryDigest(root) {
  if (!root || !pathEntryExists(root)) return evidenceDigest({ state: "ABSENT" }, []);
  const before = fs.lstatSync(root);
  if (before.isSymbolicLink() || !before.isDirectory()) throw new Error(`bootstrap directory digest requires a non-symlink directory: ${root}`);
  const rows = [];
  walkDirectory(root, root, rows);
  const after = fs.lstatSync(root);
  if (!sameNodeIdentity(nodeIdentity(before), nodeIdentity(after))) throw new Error(`bootstrap directory identity changed while hashing: ${root}`);
  return evidenceDigest(rows, []);
}

function walkDirectory(root, current, rows) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(current, entry.name);
    const relative = path.relative(root, full).replaceAll(path.sep, "/");
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) rows.push({ path: relative, type: "symlink", target: fs.readlinkSync(full) });
    else if (stat.isDirectory()) {
      rows.push({ path: relative, type: "directory" });
      walkDirectory(root, full, rows);
    } else if (stat.isFile()) rows.push({ path: relative, type: "file", digest: evidenceDigest(fs.readFileSync(full).toString("base64"), []), size: stat.size });
  }
}

function safeRemoveOwnedTemp(context, value, expectedPrefix, owned = false, ownership = null) {
  const candidate = String(value || "");
  if (!candidate) return;
  const resolved = path.resolve(candidate);
  if (path.dirname(resolved) !== context.root || !path.basename(resolved).startsWith(expectedPrefix)) {
    throw new Error(`bootstrap temporary path is outside its transaction namespace: ${resolved}`);
  }
  if (!pathEntryExists(resolved)) return;
  if (!owned) throw new Error(`bootstrap temporary path exists without durable ownership: ${resolved}`);
  if (!ownership) throw new Error(`bootstrap temporary path lacks digest and identity ownership: ${resolved}`);
  guardedRemoveOwnedDirectory(context, resolved, "bootstrap owned temporary root", "bootstrap-temp-remove", ownership);
}

// Node has no openat/renameat API. These guards close observable replacement
// windows by binding every path mutation to a canonical parent chain and inode.
// A hostile process can still race the final path-based syscall itself.
function createMutationContext(root, mutationHooks) {
  const resolved = path.resolve(root);
  const stat = lstatIfExists(resolved);
  if (!stat || stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(resolved) !== resolved) {
    throw new Error(`bootstrap transaction parent is not a canonical non-symlink directory: ${resolved}`);
  }
  return {
    root: resolved,
    rootIdentity: nodeIdentity(stat),
    mutationHooks,
    journalBinding: null,
  };
}

function assertMutationRoot(context) {
  if (!context?.root || !validNodeIdentity(context.rootIdentity)) throw new Error("bootstrap mutation context is invalid");
  const stat = lstatIfExists(context.root);
  if (!stat || stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(context.root) !== context.root) {
    throw new Error(`bootstrap transaction parent became non-canonical or a symlink: ${context.root}`);
  }
  if (!sameNodeIdentity(context.rootIdentity, nodeIdentity(stat))) {
    throw new Error(`bootstrap transaction parent identity changed before mutation: ${context.root}`);
  }
}

function captureCanonicalParentChain(context, target, label) {
  assertMutationRoot(context);
  const resolved = path.resolve(target);
  const relative = path.relative(context.root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`${label} resolves outside the bootstrap transaction parent`);
  const directory = path.dirname(resolved);
  const directoryRelative = path.relative(context.root, directory);
  if (directoryRelative.startsWith("..") || path.isAbsolute(directoryRelative)) throw new Error(`${label} parent resolves outside the bootstrap transaction parent`);
  const chain = [{ path: context.root, identity: context.rootIdentity }];
  let current = context.root;
  for (const part of directoryRelative ? directoryRelative.split(path.sep) : []) {
    if (!part) continue;
    current = path.join(current, part);
    const stat = lstatIfExists(current);
    if (!stat || stat.isSymbolicLink() || !stat.isDirectory()) {
      throw new Error(`${label} parent chain is missing, replaced, or a symlink: ${current}`);
    }
    if (fs.realpathSync(current) !== current) throw new Error(`${label} parent chain is not canonical: ${current}`);
    chain.push({ path: current, identity: nodeIdentity(stat) });
  }
  return chain;
}

function captureMutationSnapshot(context, target, label) {
  const resolved = path.resolve(target);
  const parents = captureCanonicalParentChain(context, resolved, label);
  const stat = lstatIfExists(resolved);
  if (stat?.isSymbolicLink()) throw new Error(`${label} target is a symlink`);
  return {
    target: resolved,
    label,
    parents,
    kind: stat ? nodeKind(stat) : "absent",
    identity: stat ? nodeIdentity(stat) : null,
  };
}

function assertMutationSnapshotUnchanged(context, snapshot) {
  const current = captureMutationSnapshot(context, snapshot.target, snapshot.label);
  if (current.parents.length !== snapshot.parents.length
    || current.parents.some((item, index) => item.path !== snapshot.parents[index].path
      || !sameNodeIdentity(item.identity, snapshot.parents[index].identity))) {
    throw new Error(`${snapshot.label} canonical parent identity changed immediately before mutation`);
  }
  if (current.kind !== snapshot.kind
    || Boolean(current.identity || snapshot.identity) && !sameNodeIdentity(current.identity, snapshot.identity)) {
    throw new Error(`${snapshot.label} target identity changed immediately before mutation`);
  }
}

function verifyMutationSpec(spec, snapshot) {
  if (spec.kind && snapshot.kind !== spec.kind) {
    throw new Error(`${spec.label} expected ${spec.kind}, observed ${snapshot.kind}`);
  }
  if (spec.binding) {
    if (snapshot.kind !== "regular" || !sameNodeIdentity(snapshot.identity, spec.binding.identity)) {
      throw new Error(`${spec.label} digest or identity changed before mutation`);
    }
    const binding = captureFileBinding(spec.target, spec.binding.content_digest, spec.label);
    if (!sameNodeIdentity(binding.identity, spec.binding.identity)) {
      throw new Error(`${spec.label} digest or identity changed before mutation`);
    }
  }
  if (spec.ownership && !matchesOwnedDirectory(spec.target, spec.ownership)) {
    throw new Error(`${spec.label} directory digest or identity changed before mutation`);
  }
}

function prepareGuardedMutation(context, specs, operation) {
  const snapshots = specs.map((spec) => captureMutationSnapshot(context, spec.target, spec.label));
  specs.forEach((spec, index) => verifyMutationSpec(spec, snapshots[index]));
  context?.mutationHooks?.beforeMutation?.({
    operation,
    target: specs.at(-1)?.target,
    targets: specs.map((spec) => spec.target),
  });
  assertMutationRoot(context);
  snapshots.forEach((snapshot) => assertMutationSnapshotUnchanged(context, snapshot));
  specs.forEach((spec, index) => verifyMutationSpec(spec, snapshots[index]));
  return snapshots;
}

function finishGuardedMutation(context, snapshots, expectations) {
  assertMutationRoot(context);
  for (let index = 0; index < snapshots.length; index += 1) {
    const snapshot = snapshots[index];
    const expectation = expectations[index] || {};
    const current = captureMutationSnapshot(context, snapshot.target, snapshot.label);
    if (current.parents.length !== snapshot.parents.length
      || current.parents.some((item, parentIndex) => item.path !== snapshot.parents[parentIndex].path
        || !sameNodeIdentity(item.identity, snapshot.parents[parentIndex].identity))) {
      throw new Error(`${snapshot.label} canonical parent identity changed during mutation`);
    }
    if (expectation.kind && current.kind !== expectation.kind) {
      throw new Error(`${snapshot.label} expected ${expectation.kind} after mutation, observed ${current.kind}`);
    }
    if (expectation.identity && !sameNodeIdentity(current.identity, expectation.identity)) {
      throw new Error(`${snapshot.label} identity changed during mutation`);
    }
    if (expectation.content_digest !== undefined) {
      captureFileBinding(snapshot.target, expectation.content_digest, snapshot.label);
    }
    if (expectation.ownership && !matchesOwnedDirectory(snapshot.target, expectation.ownership)) {
      throw new Error(`${snapshot.label} directory digest or identity changed during mutation`);
    }
  }
  assertMutationRoot(context);
}

function guardedWriteNewFile(context, target, content, label, operation) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
  const snapshots = prepareGuardedMutation(context, [{ target, label, kind: "absent" }], operation);
  fs.writeFileSync(target, buffer, { flag: "wx" });
  fsyncFile(target);
  finishGuardedMutation(context, snapshots, [{ kind: "regular", content_digest: digestContent(buffer) }]);
  fsyncDirectory(path.dirname(target));
  return captureFileBinding(target, digestContent(buffer), label);
}

function guardedMkdir(context, target, label, operation) {
  const snapshots = prepareGuardedMutation(context, [{ target, label, kind: "absent" }], operation);
  fs.mkdirSync(target);
  finishGuardedMutation(context, snapshots, [{ kind: "directory" }]);
  fsyncDirectory(path.dirname(target));
  return captureOwnedDirectory(target, label);
}

function guardedRename(context, source, target, label, operation, options = {}) {
  const sourceKind = options.sourceOwnership ? "directory" : "regular";
  const sourceIdentity = options.sourceOwnership?.identity || options.sourceBinding?.identity;
  if (!sourceIdentity) throw new Error(`${label} source lacks durable identity ownership`);
  const specs = [
    {
      target: source,
      label: `${label} source`,
      kind: sourceKind,
      binding: options.sourceBinding,
      ownership: options.sourceOwnership,
    },
    {
      target,
      label: `${label} target`,
      kind: options.targetKind || "absent",
      binding: options.targetBinding,
      ownership: options.targetOwnership,
    },
  ];
  const snapshots = prepareGuardedMutation(context, specs, operation);
  fs.renameSync(source, target);
  fsyncDirectory(path.dirname(source));
  if (path.dirname(target) !== path.dirname(source)) fsyncDirectory(path.dirname(target));
  finishGuardedMutation(context, snapshots, [
    { kind: "absent" },
    sourceKind === "directory"
      ? { kind: "directory", identity: sourceIdentity, ownership: options.sourceOwnership }
      : { kind: "regular", identity: sourceIdentity, content_digest: options.sourceBinding.content_digest },
  ]);
  return sourceKind === "directory"
    ? captureOwnedDirectory(target, label)
    : captureFileBinding(target, options.sourceBinding.content_digest, label);
}

function guardedUnlink(context, target, label, operation, binding) {
  if (!binding || !validNodeIdentity(binding.identity) || !/^sha256:[a-f0-9]{64}$/.test(String(binding.content_digest || ""))) {
    throw new Error(`${label} lacks durable digest and identity ownership`);
  }
  const snapshots = prepareGuardedMutation(context, [{ target, label, kind: "regular", binding }], operation);
  fs.unlinkSync(target);
  finishGuardedMutation(context, snapshots, [{ kind: "absent" }]);
  fsyncDirectory(path.dirname(target));
}

function guardedRmdir(context, target, label, operation, ownership) {
  if (!ownership || ownership.entries?.length !== 0 || fs.readdirSync(target).length !== 0) {
    throw new Error(`${label} is not an exact owned empty directory`);
  }
  const snapshots = prepareGuardedMutation(context, [{ target, label, kind: "directory", ownership }], operation);
  if (fs.readdirSync(target).length !== 0) throw new Error(`${label} changed before removal`);
  fs.rmdirSync(target);
  finishGuardedMutation(context, snapshots, [{ kind: "absent" }]);
  fsyncDirectory(path.dirname(target));
}

function guardedRemoveOwnedDirectory(context, target, label, operation, ownership) {
  if (!ownership || !validOwnedDirectoryRecord(ownership)) throw new Error(`${label} lacks durable tree digest and identity ownership`);
  const snapshots = prepareGuardedMutation(context, [{ target, label, kind: "directory", ownership }], operation);
  fs.rmSync(target, { recursive: true });
  finishGuardedMutation(context, snapshots, [{ kind: "absent" }]);
  fsyncDirectory(path.dirname(target));
}

function captureOwnedDirectory(root, label) {
  const resolved = path.resolve(root);
  const stat = lstatIfExists(resolved);
  if (!stat || stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(resolved) !== resolved) {
    throw new Error(`${label} is not a canonical non-symlink directory: ${resolved}`);
  }
  const identity = nodeIdentity(stat);
  const entries = [];
  captureOwnedDirectoryEntries(resolved, resolved, entries, label);
  const after = fs.lstatSync(resolved);
  if (!sameNodeIdentity(identity, nodeIdentity(after))) throw new Error(`${label} identity changed while it was observed`);
  return { identity, tree_digest: directoryDigest(resolved), entries };
}

function captureOwnedDirectoryEntries(root, current, entries, label) {
  for (const name of fs.readdirSync(current).sort()) {
    const full = path.join(current, name);
    const relative = path.relative(root, full).replaceAll(path.sep, "/");
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) throw new Error(`${label} contains symbolic link ${relative}`);
    if (stat.isDirectory()) {
      entries.push({ path: relative, type: "directory", identity: nodeIdentity(stat) });
      captureOwnedDirectoryEntries(root, full, entries, label);
    } else if (stat.isFile()) {
      const binding = captureFileBinding(full, undefined, `${label} ${relative}`);
      entries.push({ path: relative, type: "file", identity: binding.identity, content_digest: binding.content_digest });
    } else {
      throw new Error(`${label} contains unsupported entry ${relative}`);
    }
  }
}

function matchesOwnedDirectory(root, expected) {
  if (!validOwnedDirectoryRecord(expected)) return false;
  try { return JSON.stringify(captureOwnedDirectory(root, "bootstrap owned directory")) === JSON.stringify(expected); } catch { return false; }
}

function validOwnedDirectoryRecord(value) {
  if (!value || !validNodeIdentity(value.identity) || !/^sha256:[a-f0-9]{64}$/.test(String(value.tree_digest || "")) || !Array.isArray(value.entries)) return false;
  return value.entries.every((entry) => normalizeRelative(entry?.path)
    && ["file", "directory"].includes(entry?.type)
    && validNodeIdentity(entry?.identity)
    && (entry.type !== "file" || /^sha256:[a-f0-9]{64}$/.test(String(entry.content_digest || ""))));
}

function captureFileBinding(file, expectedDigest, label) {
  const observed = readStableFile(file, label);
  const contentDigest = digestContent(observed.content);
  if (expectedDigest !== undefined && contentDigest !== expectedDigest) throw new Error(`${label} digest changed`);
  return { identity: observed.identity, content_digest: contentDigest };
}

function readStableFile(file, label) {
  const stat = lstatIfExists(file);
  if (!stat || stat.isSymbolicLink() || !stat.isFile()) throw new Error(`${label} is not a regular non-symlink file`);
  const noFollow = fs.constants.O_NOFOLLOW || 0;
  let fd;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const before = fs.fstatSync(fd);
    if (!before.isFile() || !sameNodeIdentity(nodeIdentity(stat), nodeIdentity(before))) throw new Error(`${label} identity changed while opening`);
    const content = fs.readFileSync(fd);
    const after = fs.fstatSync(fd);
    if (!sameNodeIdentity(nodeIdentity(before), nodeIdentity(after))) throw new Error(`${label} identity changed while reading`);
    return { content, identity: nodeIdentity(after) };
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function readBoundJson(file, label) {
  try {
    const observed = readStableFile(file, label);
    return {
      ok: true,
      value: JSON.parse(observed.content.toString("utf8")),
      binding: { identity: observed.identity, content_digest: digestContent(observed.content) },
    };
  } catch (error) {
    return { ok: false, value: null, binding: null, error: error.message };
  }
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

function validNodeIdentity(value) {
  return Boolean(value
    && /^\d+$/.test(String(value.dev || ""))
    && /^\d+$/.test(String(value.ino || ""))
    && /^\d+$/.test(String(value.mode || "")));
}

function nodeKind(stat) {
  if (stat.isFile()) return "regular";
  if (stat.isDirectory()) return "directory";
  return "non-regular";
}

function capturePreservedBindings(transaction, context) {
  if (transaction.topology.state !== "NONEMPTY_DIRECTORY") return [];
  assertMutationRoot(context);
  return (transaction.preserved_control_files || []).map((item) => {
    const file = assertSafeWritePath(transaction.target_root, item.path, "bootstrap preserved control binding");
    const binding = captureFileBinding(file, item.digest, `bootstrap preserved control ${item.path}`);
    return { path: item.path, content_digest: item.digest, identity: binding.identity };
  });
}

function bindingsMatch(root, bindings) {
  try {
    for (const binding of bindings || []) {
      const file = assertSafeWritePath(root, binding.path, "bootstrap identity-bound path");
      const observed = captureFileBinding(file, binding.content_digest, `bootstrap identity-bound path ${binding.path}`);
      if (!sameNodeIdentity(observed.identity, binding.identity)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function journalTargetOwnershipMatches(target, journal) {
  if (["ABSENT_LEAF", "EMPTY_DIRECTORY"].includes(journal.original_topology)) {
    return matchesOwnedDirectory(target, journal.committed_target_ownership);
  }
  const stat = lstatIfExists(target);
  return Boolean(stat
    && !stat.isSymbolicLink()
    && stat.isDirectory()
    && fs.realpathSync(target) === target
    && sameNodeIdentity(nodeIdentity(stat), journal.committed_target_identity)
    && bindingsMatch(target, journal.preserved_control_bindings || [])
    && bindingsMatch(target, journal.written_paths || []));
}

function assertTransactionPreimage(transaction, context, originalTargetOwnership, preservedBindings) {
  assertMutationRoot(context);
  const topology = recheckTargetTopology(transaction.topology);
  if (!topology.ok) throw new Error(topology.errors.join("; "));
  if (transaction.topology.state === "ABSENT_LEAF") {
    if (pathEntryExists(transaction.target_root)) throw new Error("bootstrap target appeared after preflight");
    return;
  }
  if (!matchesOwnedDirectory(transaction.target_root, originalTargetOwnership)) {
    throw new Error("bootstrap target digest or identity changed after preflight");
  }
  const shell = validatePreservedControlShell(transaction);
  if (!shell.ok) throw new Error(shell.errors.join("; "));
  if (!bindingsMatch(transaction.target_root, preservedBindings)) {
    throw new Error("bootstrap preserved control digest or identity changed after preflight");
  }
}

function assertTargetDirectoryIdentity(target, identity, label) {
  const stat = lstatIfExists(target);
  if (!stat || stat.isSymbolicLink() || !stat.isDirectory() || fs.realpathSync(target) !== target
    || !sameNodeIdentity(nodeIdentity(stat), identity)) {
    throw new Error(`${label} target directory identity changed`);
  }
}

function assertCommittedTargetOwnership(transaction, context, options) {
  assertMutationRoot(context);
  assertTargetDirectoryIdentity(transaction.target_root, options.committedTargetIdentity, "bootstrap committed target");
  if (options.committedTargetOwnership && !matchesOwnedDirectory(transaction.target_root, options.committedTargetOwnership)) {
    throw new Error("bootstrap committed target tree digest or identity changed");
  }
  if (!bindingsMatch(transaction.target_root, options.preservedBindings || [])) {
    throw new Error("bootstrap preserved control digest or identity changed after write");
  }
  for (const entry of options.journal || []) {
    if (!entry.targetWritten) continue;
    const observed = captureFileBinding(entry.target, entry.action.content_digest, `bootstrap written path ${entry.action.id}`);
    if (!sameNodeIdentity(observed.identity, entry.targetIdentity)) {
      throw new Error(`bootstrap written path digest or identity changed: ${entry.action.id}`);
    }
  }
}

function recordAtomicActionBindings(transaction, journal, context) {
  for (const action of transaction.actions) {
    const target = assertSafeWritePath(transaction.target_root, action.path, `bootstrap committed action ${action.id}`);
    captureCanonicalParentChain(context, target, `bootstrap committed action ${action.id}`);
    const binding = captureFileBinding(target, action.content_digest, `bootstrap committed action ${action.id}`);
    journal.push({
      action,
      target,
      backup: "",
      hadExisting: false,
      targetWritten: true,
      targetIdentity: binding.identity,
    });
  }
}

function serializeWrittenPaths(transaction, journal) {
  return journal.filter((entry) => entry.targetWritten).map((entry) => {
    const relative = path.relative(transaction.target_root, entry.target).replaceAll(path.sep, "/");
    if (!normalizeRelative(relative) || !validNodeIdentity(entry.targetIdentity)) {
      throw new Error(`bootstrap written path lacks an exact identity: ${entry.action.id}`);
    }
    return {
      id: entry.action.id,
      path: relative,
      content_digest: entry.action.content_digest,
      identity: entry.targetIdentity,
    };
  });
}

function serializeCreatedDirectories(transaction, createdDirectories) {
  return [...createdDirectories].map(([directory, identity]) => {
    const relative = path.relative(transaction.target_root, directory).replaceAll(path.sep, "/");
    if (!normalizeRelative(relative) || !validNodeIdentity(identity)) {
      throw new Error(`bootstrap created directory lacks an exact identity: ${directory}`);
    }
    return { path: relative, identity };
  });
}

function transactionTempRoot(parent, prefix) {
  return path.join(parent, `${prefix}${crypto.randomUUID()}`);
}

function assertPathAbsent(file, label) {
  if (pathEntryExists(file)) throw new Error(`${label} must not exist before the transaction starts: ${file}`);
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

function processAlive(pid) {
  if (!Number.isInteger(Number(pid)) || Number(pid) < 1) return false;
  try { process.kill(Number(pid), 0); return true; } catch { return false; }
}

function readJson(file) {
  if (!file || !fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function fsyncDirectory(directory) {
  try {
    const fd = fs.openSync(directory, "r");
    try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  } catch {
    // Some filesystems do not support directory fsync; file fsync still preserves the journal contents.
  }
}

function fsyncFile(file) {
  const fd = fs.openSync(file, "r");
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}

function applied(action, target) {
  return { id: action.id, path: action.path, result: "APPLIED", hash_after: fileDigest(target) };
}

function receipt(transaction, state, actions, errors, rollbackState, residualPaths = [], activation = null) {
  const base = {
    schema_version: "1.109.0",
    artifact_type: "bootstrap_transaction_receipt",
    transaction_id: transaction?.transaction_id || "UNKNOWN",
    target_root: transaction?.target_root || "",
    original_topology: transaction?.topology?.state || "UNKNOWN",
    envelope_digest: transaction?.envelope_digest || "",
    goal_digest: transaction?.goal_digest || "",
    plan_ref: transaction?.plan_ref || "",
    plan_digest: transaction?.plan_digest || "",
    approval_ref: transaction?.approval_ref || "",
    approval_digest: transaction?.approval_digest || "",
    readiness_ref: transaction?.readiness_ref || "",
    readiness_digest: transaction?.readiness_digest || "",
    source_inventory_digest: transaction?.source_inventory_digest || "",
    preserved_control_files: transaction?.preserved_control_files || [],
    state,
    actions,
    errors,
    rollback_state: rollbackState,
    residual_paths: residualPaths,
    exact_action_ids: transaction?.exact_action_ids || [],
    activation: activation || { ok: false, state: "NOT_RUN" },
  };
  return { ...base, receipt_ref: transaction?.success_receipt_path || "N/A", receipt_digest: evidenceDigest(base, []) };
}

function requiredDigest(value, label) {
  const digest = String(value || "");
  if (!/^sha256:[a-f0-9]{64}$/.test(digest)) throw new Error(`${label} must be a canonical sha256 digest`);
  return digest;
}

function digestContent(content) {
  return `sha256:${crypto.createHash("sha256").update(content).digest("hex")}`;
}

function fileDigest(file) {
  return captureFileBinding(file, undefined, `bootstrap file ${file}`).content_digest;
}
