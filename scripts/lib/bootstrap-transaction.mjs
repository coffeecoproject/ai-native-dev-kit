import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { evidenceDigest } from "./artifact-schema.mjs";
import { assertSafeWritePath } from "./path-safety.mjs";
import { inspectTargetTopology, recheckTargetTopology } from "./target-topology.mjs";

const WRITABLE_TOPOLOGIES = new Set(["ABSENT_LEAF", "EMPTY_DIRECTORY", "NONEMPTY_DIRECTORY"]);

export function createBootstrapTransaction(options = {}) {
  const topology = options.topology || inspectTargetTopology(options.targetRoot);
  const actions = normalizeActions(options.actions || []);
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
    plan_ref: String(options.planRef || "bootstrap:in-memory-plan"),
    plan_digest: requiredDigest(options.planDigest, "plan digest"),
    approval_ref: String(options.approvalRef || "bootstrap:original-request-approval"),
    approval_digest: requiredDigest(options.approvalDigest, "approval digest"),
    readiness_ref: String(options.readinessRef || "bootstrap:controlled-readiness"),
    readiness_digest: requiredDigest(options.readinessDigest, "readiness digest"),
    source_inventory_digest: requiredDigest(options.sourceInventoryDigest, "source inventory digest"),
    success_receipt_path: normalizeRequiredRelative(options.successReceiptPath || ".intentos/bootstrap-receipt.json", "success receipt path"),
    pending_journal_path: String(options.pendingJournalPath || `.intentos-bootstrap-${transactionId}.pending.json`),
    failure_receipt_path: String(options.failureReceiptPath || `.intentos-bootstrap-${transactionId}.failure.json`),
    actions,
    exact_action_ids: actions.map((item) => item.id),
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
  if (!normalizeRelative(transaction?.success_receipt_path)) errors.push("bootstrap success receipt path is unsafe");
  if (!safePendingJournalName(transaction?.pending_journal_path)) errors.push("bootstrap pending journal path is unsafe");
  if (!safeFailureReceiptName(transaction?.failure_receipt_path)) errors.push("bootstrap failure receipt path is unsafe");
  if (JSON.stringify(transaction?.exact_action_ids || []) !== JSON.stringify((transaction?.actions || []).map((item) => item.id))) {
    errors.push("bootstrap transaction action IDs do not match the exact action graph");
  }
  for (const action of transaction?.actions || []) {
    if (action.content_digest !== digestContent(Buffer.from(String(action.content_base64 || ""), "base64"))) errors.push(`bootstrap action ${action.id} content digest is invalid`);
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
  for (const field of ["goal_digest", "plan_digest", "approval_digest", "readiness_digest", "source_inventory_digest"]) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(receipt?.[field] || ""))) errors.push(`bootstrap receipt ${field} is not a canonical digest`);
  }
  for (const field of ["plan_ref", "approval_ref", "readiness_ref"]) {
    if (!String(receipt?.[field] || "").trim()) errors.push(`bootstrap receipt ${field} is missing`);
  }
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

  const targetRoot = transaction.target_root;
  const parent = path.dirname(targetRoot);
  let stageRoot = "";
  let backupRoot = "";
  const observed = [];
  const journal = [];
  const createdDirectories = new Set();
  let ownedAtomicTarget = false;
  let committedTreeDigest = "";
  let activation = { ok: false, state: "NOT_RUN", errors: ["activation verification was not reached"] };
  try {
    persistPendingJournal(transaction, {
      state: "PREPARED",
      stage_root: "",
      backup_root: "",
      committed_tree_digest: "",
    });
    stageRoot = fs.mkdtempSync(path.join(parent, `.intentos-stage-${transaction.transaction_id}-`));
    backupRoot = fs.mkdtempSync(path.join(parent, `.intentos-backup-${transaction.transaction_id}-`));
    stageActions(transaction, stageRoot);
    const stagedTreeDigest = directoryDigest(stageRoot);
    persistPendingJournal(transaction, {
      state: "STAGED",
      stage_root: stageRoot,
      backup_root: backupRoot,
      committed_tree_digest: stagedTreeDigest,
    });
    options.beforeCommit?.({ transaction, stageRoot, backupRoot });
    const finalCheck = recheckTargetTopology(transaction.topology);
    if (!finalCheck.ok) throw new Error(finalCheck.errors.join("; "));

    if (transaction.topology.state === "ABSENT_LEAF") {
      fs.renameSync(stageRoot, targetRoot);
      stageRoot = "";
      ownedAtomicTarget = true;
      committedTreeDigest = directoryDigest(targetRoot);
      for (const action of transaction.actions) {
        observed.push(applied(action, path.join(targetRoot, action.path)));
        options.afterAction?.({ transaction, action, target: path.join(targetRoot, action.path), observed });
      }
    } else if (transaction.topology.state === "EMPTY_DIRECTORY") {
      fs.rmdirSync(backupRoot);
      fs.renameSync(targetRoot, backupRoot);
      fs.renameSync(stageRoot, targetRoot);
      stageRoot = "";
      ownedAtomicTarget = true;
      committedTreeDigest = directoryDigest(targetRoot);
      for (const action of transaction.actions) {
        observed.push(applied(action, path.join(targetRoot, action.path)));
        options.afterAction?.({ transaction, action, target: path.join(targetRoot, action.path), observed });
      }
    } else {
      for (const action of transaction.actions) {
        applyJournaledAction(transaction, action, stageRoot, backupRoot, journal, createdDirectories);
        observed.push(applied(action, path.join(targetRoot, action.path)));
        options.afterAction?.({ transaction, action, target: path.join(targetRoot, action.path), observed });
      }
      committedTreeDigest = directoryDigest(targetRoot);
    }
    persistPendingJournal(transaction, {
      state: "TARGET_COMMITTED_PENDING_ACTIVATION",
      stage_root: stageRoot,
      backup_root: backupRoot,
      committed_tree_digest: committedTreeDigest,
    });

    activation = options.verifyActivation
      ? options.verifyActivation({ transaction, targetRoot, observed })
      : { ok: false, state: "NOT_RUN", errors: ["activation verification was not supplied"] };
    if (!activation?.ok) throw new Error((activation?.errors || [`activation state ${activation?.state || "UNKNOWN"} is not verified`]).join("; "));

    const successReceipt = receipt(transaction, "APPLY_VERIFIED", observed, [], "NOT_REQUIRED", [], activation);
    const finalActivation = options.finalizeActivation
      ? options.finalizeActivation({ transaction, targetRoot, receipt: successReceipt, verification: activation })
      : { ok: true };
    if (!finalActivation?.ok) throw new Error((finalActivation?.errors || ["behavioral activation finalization failed"]).join("; "));
    persistSuccessReceipt(transaction, successReceipt, backupRoot, journal, createdDirectories);
    safeRemove(stageRoot);
    safeRemove(backupRoot);
    clearPendingJournal(transaction);
    return successReceipt;
  } catch (error) {
    const rollback = rollbackTransaction(transaction, journal, createdDirectories, {
      ownedAtomicTarget,
      committedTreeDigest,
      backupRoot,
    });
    safeRemove(stageRoot);
    if (rollback.state === "ROLLED_BACK") safeRemove(backupRoot);
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
      persistFailureReceipt(transaction, failureReceipt);
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
    if (rollback.state === "ROLLED_BACK") clearPendingJournal(transaction);
    else {
      persistPendingJournal(transaction, {
        state: "ROLLBACK_INCOMPLETE",
        stage_root: stageRoot,
        backup_root: backupRoot,
        committed_tree_digest: committedTreeDigest,
        residual_paths: rollback.residualPaths,
      });
    }
    return failureReceipt;
  }
}

export function recoverInterruptedBootstrap(targetRoot) {
  const topology = inspectTargetTopology(targetRoot);
  const target = topology.canonical_target;
  const parent = path.dirname(target);
  if (!fs.existsSync(parent)) return { ok: true, recovered: false, state: "NO_PARENT" };
  const journals = fs.readdirSync(parent)
    .filter((name) => /^\.intentos-bootstrap-.+\.pending\.json$/.test(name))
    .map((name) => path.join(parent, name));
  for (const file of journals) {
    let journal;
    try { journal = JSON.parse(fs.readFileSync(file, "utf8")); } catch { continue; }
    if (path.resolve(String(journal.target_root || "")) !== target) continue;
    if (processAlive(journal.owner_pid) && Number(journal.owner_pid) !== process.pid) {
      return { ok: false, recovered: false, state: "ACTIVE_TRANSACTION", errors: [`bootstrap transaction ${journal.transaction_id} is still active`] };
    }
    const receiptFile = path.join(target, String(journal.success_receipt_path || ".intentos/bootstrap-receipt.json"));
    const success = readJson(receiptFile);
    if (validateVerifiedBootstrapReceipt(success, target, { transactionId: journal.transaction_id }).ok) {
      safeRemoveOwnedTemp(parent, journal.stage_root, `.intentos-stage-${journal.transaction_id}-`);
      safeRemoveOwnedTemp(parent, journal.backup_root, `.intentos-backup-${journal.transaction_id}-`);
      fs.rmSync(file, { force: true });
      return { ok: true, recovered: true, state: "COMMITTED_SUCCESS_RECOVERED" };
    }
    if (["PREPARED", "STAGED"].includes(String(journal.state || ""))) {
      safeRemoveOwnedTemp(parent, journal.stage_root, `.intentos-stage-${journal.transaction_id}-`);
      safeRemoveOwnedTemp(parent, journal.backup_root, `.intentos-backup-${journal.transaction_id}-`);
      const failurePath = path.join(parent, `.intentos-bootstrap-${journal.transaction_id}.failure.json`);
      if (!fs.existsSync(failurePath)) {
        fs.writeFileSync(failurePath, `${JSON.stringify({
          schema_version: "1.109.0",
          artifact_type: "bootstrap_recovery_receipt",
          transaction_id: journal.transaction_id,
          target_root: target,
          state: "INTERRUPTED_BOOTSTRAP_PRECOMMIT_CLEANED",
          recovered_at: new Date().toISOString(),
        }, null, 2)}\n`, { flag: "wx" });
      }
      fs.rmSync(file, { force: true });
      return { ok: true, recovered: true, state: "INTERRUPTED_BOOTSTRAP_PRECOMMIT_CLEANED" };
    }
    if (fs.existsSync(target)) {
      const observed = directoryDigest(target);
      if (!journal.committed_tree_digest || observed !== journal.committed_tree_digest) {
        return { ok: false, recovered: false, state: "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT", errors: ["interrupted bootstrap target contains content that is not owned by the recorded transaction"] };
      }
      fs.rmSync(target, { recursive: true, force: true });
    }
    if (journal.original_topology === "EMPTY_DIRECTORY" && journal.backup_root && fs.existsSync(journal.backup_root)) {
      fs.renameSync(journal.backup_root, target);
    } else {
      safeRemoveOwnedTemp(parent, journal.backup_root, `.intentos-backup-${journal.transaction_id}-`);
    }
    safeRemoveOwnedTemp(parent, journal.stage_root, `.intentos-stage-${journal.transaction_id}-`);
    const failurePath = path.join(parent, `.intentos-bootstrap-${journal.transaction_id}.failure.json`);
    if (!fs.existsSync(failurePath)) {
      fs.writeFileSync(failurePath, `${JSON.stringify({
        schema_version: "1.109.0",
        artifact_type: "bootstrap_recovery_receipt",
        transaction_id: journal.transaction_id,
        target_root: target,
        state: "INTERRUPTED_BOOTSTRAP_ROLLED_BACK",
        recovered_at: new Date().toISOString(),
      }, null, 2)}\n`, { flag: "wx" });
    }
    fs.rmSync(file, { force: true });
    return { ok: true, recovered: true, state: "INTERRUPTED_BOOTSTRAP_ROLLED_BACK" };
  }
  return { ok: true, recovered: false, state: "NO_PENDING_TRANSACTION" };
}

function stageActions(transaction, stageRoot) {
  for (const action of transaction.actions) {
    const stageFile = assertSafeWritePath(stageRoot, action.path, `bootstrap stage ${action.id}`);
    fs.mkdirSync(path.dirname(stageFile), { recursive: true });
    fs.writeFileSync(stageFile, Buffer.from(action.content_base64, "base64"), { flag: "wx" });
    if (fileDigest(stageFile) !== action.content_digest) throw new Error(`staged digest mismatch for ${action.id}`);
  }
}

function applyJournaledAction(transaction, action, stageRoot, backupRoot, journal, createdDirectories) {
  const target = assertSafeWritePath(transaction.target_root, action.path, `bootstrap action ${action.id}`);
  const backup = assertSafeWritePath(backupRoot, action.path, `bootstrap backup ${action.id}`);
  const entry = { action, target, backup, hadExisting: fs.existsSync(target), targetWritten: false };
  journal.push(entry);
  if (entry.hadExisting) {
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.renameSync(target, backup);
  }
  ensureParentDirectories(transaction.target_root, path.dirname(target), createdDirectories);
  fs.renameSync(assertSafeWritePath(stageRoot, action.path, `bootstrap staged action ${action.id}`), target);
  entry.targetWritten = true;
  if (fileDigest(target) !== action.content_digest) throw new Error(`post-write digest mismatch for ${action.id}`);
}

function persistSuccessReceipt(transaction, value, backupRoot, journal, createdDirectories) {
  const content = Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
  const action = {
    id: "TRANSACTION-RECEIPT",
    path: transaction.success_receipt_path,
    content_digest: digestContent(content),
  };
  const target = assertSafeWritePath(transaction.target_root, action.path, "bootstrap success receipt");
  const backup = assertSafeWritePath(backupRoot, action.path, "bootstrap success receipt backup");
  const entry = { action, target, backup, hadExisting: fs.existsSync(target), targetWritten: false };
  journal.push(entry);
  if (entry.hadExisting) {
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.renameSync(target, backup);
  }
  ensureParentDirectories(transaction.target_root, path.dirname(target), createdDirectories);
  const temporary = path.join(path.dirname(target), `.${path.basename(target)}.${transaction.transaction_id}.tmp`);
  fs.writeFileSync(temporary, content, { flag: "wx" });
  fs.renameSync(temporary, target);
  entry.targetWritten = true;
  if (fileDigest(target) !== action.content_digest) throw new Error("bootstrap success receipt digest mismatch");
}

function persistFailureReceipt(transaction, value) {
  const parent = path.dirname(transaction.target_root);
  const target = assertSafeWritePath(parent, transaction.failure_receipt_path, "bootstrap failure receipt");
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
}

function rollbackTransaction(transaction, journal, createdDirectories, atomic = {}) {
  const errors = [];
  const residualPaths = [];
  if (["ABSENT_LEAF", "EMPTY_DIRECTORY"].includes(transaction.topology.state) && atomic.ownedAtomicTarget) {
    if (fs.existsSync(transaction.target_root)) {
      try {
        const observed = directoryDigest(transaction.target_root);
        if (!atomic.committedTreeDigest || observed !== atomic.committedTreeDigest) {
          throw new Error("target contains content not owned by the bootstrap transaction");
        }
        fs.rmSync(transaction.target_root, { recursive: true, force: true });
      } catch (error) {
        errors.push(error.message);
        residualPaths.push(transaction.target_root);
      }
    }
    if (transaction.topology.state === "EMPTY_DIRECTORY" && errors.length === 0) {
      try {
        if (!atomic.backupRoot || !fs.existsSync(atomic.backupRoot)) throw new Error("empty-target backup is missing");
        fs.renameSync(atomic.backupRoot, transaction.target_root);
      } catch (error) {
        errors.push(error.message);
        residualPaths.push(atomic.backupRoot || transaction.target_root);
      }
    }
    return { state: errors.length ? "ROLLBACK_INCOMPLETE" : "ROLLED_BACK", errors, residualPaths };
  }
  for (const entry of [...journal].reverse()) {
    try {
      if (entry.targetWritten && fs.existsSync(entry.target)) fs.rmSync(entry.target, { recursive: true, force: true });
      if (entry.hadExisting) {
        if (!fs.existsSync(entry.backup)) throw new Error("expected rollback backup is missing");
        fs.mkdirSync(path.dirname(entry.target), { recursive: true });
        fs.renameSync(entry.backup, entry.target);
      }
    } catch (error) {
      errors.push(`${entry.action.id}: ${error.message}`);
      residualPaths.push(entry.target);
    }
  }
  for (const directory of [...createdDirectories].sort((left, right) => right.length - left.length)) {
    try {
      if (fs.existsSync(directory) && fs.statSync(directory).isDirectory() && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
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

function ensureParentDirectories(root, directory, createdDirectories) {
  const pending = [];
  let current = directory;
  while (current !== root && !fs.existsSync(current)) {
    pending.push(current);
    current = path.dirname(current);
  }
  if (current !== root && !current.startsWith(`${root}${path.sep}`)) throw new Error("bootstrap parent escapes target root");
  for (const item of pending.reverse()) {
    fs.mkdirSync(item);
    createdDirectories.add(item);
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
    return { id, path: relative, content_base64: content.toString("base64"), content_digest: digestContent(content) };
  });
}

function normalizeRelative(value) {
  const normalized = path.posix.normalize(String(value || "").replaceAll("\\", "/").replace(/^\.\//, ""));
  if (!normalized || normalized === "." || normalized === ".." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) return "";
  return normalized;
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

function persistPendingJournal(transaction, state = {}) {
  const target = pendingJournalFile(transaction);
  const recordBase = {
    schema_version: "1.109.0",
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
    updated_at: new Date().toISOString(),
    ...state,
  };
  const record = { ...recordBase, journal_digest: evidenceDigest(recordBase, []) };
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx" });
  const fd = fs.openSync(temporary, "r");
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  fs.renameSync(temporary, target);
  fsyncDirectory(path.dirname(target));
}

function clearPendingJournal(transaction) {
  const target = pendingJournalFile(transaction);
  fs.rmSync(target, { force: true });
  fsyncDirectory(path.dirname(target));
}

function directoryDigest(root) {
  if (!root || !fs.existsSync(root)) return evidenceDigest({ state: "ABSENT" }, []);
  const rows = [];
  walkDirectory(root, root, rows);
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

function safeRemoveOwnedTemp(parent, value, expectedPrefix) {
  const candidate = String(value || "");
  if (!candidate) return;
  const resolved = path.resolve(candidate);
  if (path.dirname(resolved) !== path.resolve(parent) || !path.basename(resolved).startsWith(expectedPrefix)) return;
  fs.rmSync(resolved, { recursive: true, force: true });
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
  return digestContent(fs.readFileSync(file));
}

function safeRemove(value) {
  if (!value || path.dirname(value) === value || !path.basename(value).startsWith(".intentos-")) return;
  try { fs.rmSync(value, { recursive: true, force: true }); } catch { /* cleanup is best effort after a durable receipt */ }
}
