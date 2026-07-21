import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

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

function transaction(targetRoot, transactionId, actions = defaultActions(), options = {}) {
  return createBootstrapTransaction({
    topology: inspectTargetTopology(targetRoot),
    transactionId,
    actions,
    goalDigest: evidenceDigest("create an appointment app", []),
    planDigest: evidenceDigest("exact plan", []),
    approvalDigest: evidenceDigest("original request", []),
    readinessDigest: evidenceDigest("ready", []),
    sourceInventoryDigest: evidenceDigest("source inventory", []),
    preservedControlFiles: options.preservedControlFiles || [],
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

function rawFileDigest(file) {
  return `sha256:${createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function nodeIdentity(file) {
  const stat = fs.lstatSync(file);
  return { dev: String(stat.dev), ino: String(stat.ino), mode: String(stat.mode) };
}

function ownedDirectoryRecord(root) {
  const entries = [];
  walkOwnership(root, root, entries);
  return {
    identity: nodeIdentity(root),
    tree_digest: treeObservation(root),
    entries,
  };
}

function walkOwnership(root, current, entries) {
  for (const name of fs.readdirSync(current).sort()) {
    const full = path.join(current, name);
    const relative = path.relative(root, full).replaceAll(path.sep, "/");
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) {
      entries.push({ path: relative, type: "directory", identity: nodeIdentity(full) });
      walkOwnership(root, full, entries);
    } else if (stat.isFile()) {
      entries.push({
        path: relative,
        type: "file",
        identity: nodeIdentity(full),
        content_digest: rawFileDigest(full),
      });
    }
  }
}

function controlShell(target) {
  const files = [
    ["apply-execution-plans/init.json", "{\"plan\":true}\n"],
    ["approval-records/init.md", "# Approval\n"],
    ["apply-readiness-reports/init.md", "# Readiness\n"],
  ];
  for (const [relative, content] of files) {
    const file = path.join(target, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  return files.map(([relative]) => ({ path: relative, digest: rawFileDigest(path.join(target, relative)) }));
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

test("1.113 dry-run emits complete large JSON and preserves the selected platform starter baseline", (t) => {
  const parent = fixture(t, "intentos-ios-starter-plan-");
  const target = path.join(parent, "ios-app");
  const result = runInit([
    "--target", target,
    "--starter", "codex-ios-app",
    "--goal", "Build an iOS appointment app with login and production release readiness",
    "--dry-run",
  ]);

  assert.equal(result.status, 0, combined(result));
  assert.ok(Buffer.byteLength(result.stdout) > 64 * 1024, "fixture must exercise output larger than the former single-write boundary");
  const plan = JSON.parse(result.stdout);
  const engineeringBaseline = plan.actions.find((action) => action.path === "docs/engineering-baseline.md");
  assert.equal(engineeringBaseline?.source, "starters/codex-ios-app/docs/engineering-baseline.md");
  assert.equal(engineeringBaseline?.reason, "starter asset");
  assert.equal(plan.arguments.baselineLevel, "BL2_INDUSTRIAL");
});

test("1.113 existing BL1 project receives a monotonic controlled BL2 reconciliation plan", (t) => {
  const root = fixture(t, "intentos-baseline-upgrade-");
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  fs.mkdirSync(path.join(root, ".intentos"), { recursive: true });
  fs.writeFileSync(path.join(root, "package.json"), `${JSON.stringify({
    name: "existing-web-project",
    dependencies: { next: "1.0.0" },
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, ".intentos/version.json"), `${JSON.stringify({
    starter: "codex-web-app",
    workflowAssets: [],
    managedAssetDigests: {},
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "docs/project-profile.md"), [
    "# Project Profile", "", "## Selected Profiles", "", "- web-app", "",
  ].join("\n"));
  fs.writeFileSync(path.join(root, "docs/baseline-selection.md"), [
    "# Baseline Selection", "", "## Baseline Level", "", "BL1_STANDARD", "",
    "## Selected Profiles", "", "- web-app", "",
    "## Selected Standard Packs", "", "- environment-standard", "- release-rollback-standard", "- web-runtime-standard", "",
    "## Selected Industrial Packs", "", "- none", "",
  ].join("\n"));

  const result = runInit([
    "--target", root,
    "--starter", "codex-web-app",
    "--goal", "Add authentication and production release readiness to this web app",
    "--update-workflow-assets",
    "--dry-run",
  ]);

  assert.equal(result.status, 0, combined(result));
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.arguments.baselineLevel, "BL2_INDUSTRIAL");
  assert.deepEqual(plan.arguments.selectedIndustrialPacks, ["auth-permission-industrial", "web-app-industrial"]);
  const selection = plan.actions.find((action) => action.path === "docs/baseline-selection.md");
  assert.equal(selection?.type, "RECONCILE_PRESERVE");
  assert.equal(selection?.willWrite, true);
  assert.match(selection?.reason || "", /Codex-derived technical baseline reconciliation/);
  assert.ok(selection?.backupPath?.startsWith(".intentos/backups/"));
  assert.ok(plan.actions.some((action) => action.path === "docs/environment-baseline.md"));
  const reconciliation = plan.actions.find((action) => action.path === "baseline-gap-reports/intentos-baseline-reconciliation.md");
  assert.equal(reconciliation?.type, "CREATE");
  const content = Buffer.from(reconciliation.inlineContentBase64, "base64").toString("utf8");
  assert.match(content, /BL1_STANDARD_TO_BL2_INDUSTRIAL/);
  assert.match(content, /User technical choice required: No/);
  assert.match(content, /Existing profiles removed: No/);
});

function writeOrphanJournal(parent, target, transactionId, committedTreeDigest, overrides = {}) {
  const state = overrides.state || "TARGET_COMMITTED_PENDING_ACTIVATION";
  const stageRoot = overrides.stage_root || path.join(parent, `.intentos-stage-${transactionId}-owned`);
  const backupRoot = overrides.backup_root || path.join(parent, `.intentos-backup-${transactionId}-owned`);
  const prepared = state === "PREPARED";
  const stageState = prepared ? "UNOWNED" : state === "STAGED" ? "STAGE_OWNED" : "CONSUMED";
  const backupState = prepared ? "UNOWNED" : "BACKUP_OWNED";
  const originalTopology = overrides.original_topology || "ABSENT_LEAF";
  const targetOwnership = fs.existsSync(target) && fs.lstatSync(target).isDirectory()
    ? ownedDirectoryRecord(target)
    : null;
  const stageOwnership = !prepared && fs.existsSync(stageRoot)
    ? ownedDirectoryRecord(stageRoot)
    : !prepared ? targetOwnership : null;
  const backupOwnership = !prepared && fs.existsSync(backupRoot)
    ? ownedDirectoryRecord(backupRoot)
    : !prepared ? targetOwnership : null;
  const preservedControlFiles = overrides.preserved_control_files || [];
  const preservedControlBindings = preservedControlFiles.flatMap((item) => {
    const file = path.join(target, item.path);
    return fs.existsSync(file) ? [{ path: item.path, content_digest: item.digest, identity: nodeIdentity(file) }] : [];
  });
  const exactActions = overrides.exact_actions || [
    { id: "A-001", path: "README.md", content_digest: evidenceDigest("README", []), receipt_required: true },
    { id: "A-002", path: "src/index.mjs", content_digest: evidenceDigest("source", []), receipt_required: true },
  ];
  const writtenPaths = exactActions.flatMap((action) => {
    const file = path.join(target, action.path);
    return fs.existsSync(file) && fs.lstatSync(file).isFile()
      ? [{ id: action.id, path: action.path, content_digest: rawFileDigest(file), identity: nodeIdentity(file) }]
      : [];
  });
  const base = {
    schema_version: "1.113.0",
    artifact_type: "bootstrap_pending_journal",
    transaction_id: transactionId,
    owner_pid: 2_147_483_647,
    target_root: target,
    original_topology: originalTopology,
    topology_digest: evidenceDigest("topology", []),
    envelope_digest: evidenceDigest("envelope", []),
    plan_digest: evidenceDigest("plan", []),
    approval_digest: evidenceDigest("approval", []),
    readiness_digest: evidenceDigest("readiness", []),
    success_receipt_path: ".intentos/bootstrap-receipt.json",
    preserved_control_files: preservedControlFiles,
    exact_actions: exactActions,
    updated_at: new Date().toISOString(),
    state,
    parent_identity: nodeIdentity(parent),
    original_target_identity: originalTopology === "ABSENT_LEAF" ? null : targetOwnership?.identity || null,
    preserved_control_bindings: preservedControlBindings,
    stage_root: stageRoot,
    stage_state: stageState,
    stage_tree_digest: prepared ? "" : overrides.stage_tree_digest || committedTreeDigest,
    stage_ownership: stageOwnership,
    backup_root: backupRoot,
    backup_state: backupState,
    backup_contains_original: false,
    backup_tree_digest: backupOwnership?.tree_digest || "",
    backup_ownership: backupOwnership,
    committed_tree_digest: committedTreeDigest,
    committed_target_identity: targetOwnership?.identity || null,
    committed_target_ownership: targetOwnership,
    written_paths: writtenPaths,
    created_directories: [],
    failure_receipt_binding: null,
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

test("a reviewed new-project control shell is the only writable non-empty bootstrap topology", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "reviewed-project");
  const preservedControlFiles = controlShell(target);
  const tx = transaction(target, "control-shell-success", defaultActions(), { preservedControlFiles });

  const result = executeBootstrapTransaction(tx, { verifyActivation: verifiedActivation });

  assert.equal(result.state, "APPLY_VERIFIED", result.errors.join("; "));
  assert.equal(fs.readFileSync(path.join(target, "README.md"), "utf8"), "# Generated project\n");
  for (const item of preservedControlFiles) assert.equal(rawFileDigest(path.join(target, item.path)), item.digest);
});

test("an unrelated file blocks non-empty bootstrap before any project mutation", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "unsafe-shell");
  const preservedControlFiles = controlShell(target);
  fs.writeFileSync(path.join(target, "unrelated.txt"), "must not be absorbed\n");
  const tx = transaction(target, "control-shell-extra", defaultActions(), { preservedControlFiles });

  const result = executeBootstrapTransaction(tx, { verifyActivation: verifiedActivation });

  assert.equal(result.state, "APPLY_BLOCKED_BEFORE_WRITE");
  assert.match(result.errors.join("; "), /unexpected file unrelated\.txt/);
  assert.equal(fs.existsSync(path.join(target, "README.md")), false);
  assert.equal(fs.readFileSync(path.join(target, "unrelated.txt"), "utf8"), "must not be absorbed\n");
});

test("a bootstrap action cannot replace an ancestor directory containing preserved control evidence", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "ancestor-overlap-shell");
  const protectedFile = path.join(target, "approval-records", "approved.md");
  fs.mkdirSync(path.dirname(protectedFile), { recursive: true });
  fs.writeFileSync(protectedFile, "# Approved control evidence\n");
  const preservedControlFiles = [{
    path: "approval-records/approved.md",
    digest: rawFileDigest(protectedFile),
  }];
  const tx = transaction(target, "ancestor-overlap", [
    { id: "A-001", path: "approval-records", content: "must not replace the directory\n" },
  ], { preservedControlFiles });

  const result = executeBootstrapTransaction(tx, { verifyActivation: verifiedActivation });

  assert.equal(result.state, "APPLY_BLOCKED_BEFORE_WRITE");
  assert.match(result.errors.join("; "), /overlaps preserved control evidence/);
  assert.equal(fs.readFileSync(protectedFile, "utf8"), "# Approved control evidence\n");
});

test("an unbound control-looking file cannot join the reviewed bootstrap shell", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "unbound-control-shell");
  const preservedControlFiles = controlShell(target);
  const unboundApproval = path.join(target, "apply-execution-plans", "init.json.approval.md");
  fs.writeFileSync(unboundApproval, "# Unbound approval-shaped evidence\n");
  const tx = transaction(target, "control-shell-unbound-evidence", defaultActions(), { preservedControlFiles });

  const result = executeBootstrapTransaction(tx, { verifyActivation: verifiedActivation });

  assert.equal(result.state, "APPLY_BLOCKED_BEFORE_WRITE");
  assert.match(result.errors.join("; "), /unexpected file apply-execution-plans\/init\.json\.approval\.md/);
  assert.equal(fs.existsSync(path.join(target, "README.md")), false);
  assert.equal(fs.readFileSync(unboundApproval, "utf8"), "# Unbound approval-shaped evidence\n");
});

test("a failed non-empty bootstrap rolls back generated files and preserves control evidence", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "control-shell-rollback");
  const preservedControlFiles = controlShell(target);
  const tx = transaction(target, "control-shell-rollback", defaultActions(), { preservedControlFiles });

  const result = executeBootstrapTransaction(tx, {
    verifyActivation: () => ({ ok: false, state: "BLOCKED", errors: ["injected activation failure"] }),
  });

  assert.equal(result.state, "APPLY_FAILED_ROLLED_BACK");
  assert.equal(fs.existsSync(path.join(target, "README.md")), false);
  assert.equal(fs.existsSync(path.join(target, "src/index.mjs")), false);
  for (const item of preservedControlFiles) assert.equal(rawFileDigest(path.join(target, item.path)), item.digest);
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

test("rollback preserves a content-equivalent file replacement with a different identity", (t) => {
  const parent = fixture(t, "intentos-bootstrap-equivalent-file-attack-");
  const target = path.join(parent, "reviewed-project");
  const preservedControlFiles = controlShell(target);
  const tx = transaction(target, "equivalent-file-attack", defaultActions(), { preservedControlFiles });
  const generated = path.join(target, "README.md");
  const displaced = path.join(parent, "transaction-owned-readme.md");
  let transactionIdentity;

  const result = executeBootstrapTransaction(tx, {
    mutationHooks: {
      beforeMutation: ({ operation, target: mutationTarget }) => {
        if (transactionIdentity || operation !== "bootstrap-rollback-action-unlink" || mutationTarget !== generated) return;
        transactionIdentity = nodeIdentity(generated);
        fs.renameSync(generated, displaced);
        fs.writeFileSync(generated, "# Generated project\n", { flag: "wx" });
      },
    },
    verifyActivation: () => ({ ok: false, state: "BLOCKED", errors: ["force ownership-bound rollback"] }),
  });

  assert.equal(result.state, "APPLY_FAILED_ROLLBACK_INCOMPLETE");
  assert.equal(result.rollback_state, "ROLLBACK_INCOMPLETE");
  assert.match(result.errors.join("; "), /digest or identity changed|identity changed/);
  assert.equal(fs.readFileSync(generated, "utf8"), "# Generated project\n");
  assert.notDeepEqual(nodeIdentity(generated), transactionIdentity);
  assert.equal(fs.readFileSync(displaced, "utf8"), "# Generated project\n");
});

test("atomic rollback preserves a content-equivalent target directory replacement", (t) => {
  const parent = fixture(t, "intentos-bootstrap-equivalent-target-attack-");
  const target = path.join(parent, "project");
  const displaced = path.join(parent, "transaction-owned-project");
  const tx = transaction(target, "equivalent-target-attack");
  let transactionIdentity;

  const result = executeBootstrapTransaction(tx, {
    afterAction: ({ action }) => {
      if (action.id !== "A-001") return;
      transactionIdentity = nodeIdentity(target);
      fs.renameSync(target, displaced);
      fs.cpSync(displaced, target, { recursive: true });
      throw new Error("content-equivalent target replacement attack");
    },
    verifyActivation: verifiedActivation,
  });

  assert.equal(result.state, "APPLY_FAILED_ROLLBACK_INCOMPLETE");
  assert.match(result.errors.join("; "), /digest or identity changed/);
  assert.notDeepEqual(nodeIdentity(target), transactionIdentity);
  assert.equal(fs.readFileSync(path.join(target, "README.md"), "utf8"), "# Generated project\n");
  assert.equal(fs.readFileSync(path.join(displaced, "README.md"), "utf8"), "# Generated project\n");
});

test("bootstrap write fails closed when the checked parent becomes a symlink", (t) => {
  const parent = fixture(t, "intentos-bootstrap-parent-symlink-attack-");
  const target = path.join(parent, "reviewed-project");
  const outside = path.join(parent, "outside");
  const displaced = path.join(target, "src-transaction-owned");
  fs.mkdirSync(outside);
  const preservedControlFiles = controlShell(target);
  const tx = transaction(target, "parent-symlink-attack", defaultActions(), { preservedControlFiles });
  let attacked = false;

  const result = executeBootstrapTransaction(tx, {
    mutationHooks: {
      beforeMutation: ({ operation, target: mutationTarget }) => {
        if (attacked || operation !== "bootstrap-action-target-rename" || mutationTarget !== path.join(target, "src/index.mjs")) return;
        attacked = true;
        fs.renameSync(path.join(target, "src"), displaced);
        fs.symlinkSync(outside, path.join(target, "src"), "dir");
      },
    },
    verifyActivation: verifiedActivation,
  });

  assert.equal(attacked, true);
  assert.equal(result.state, "APPLY_FAILED_ROLLBACK_INCOMPLETE");
  assert.match(result.errors.join("; "), /parent chain|symlink/);
  assert.equal(fs.existsSync(path.join(outside, "index.mjs")), false);
  assert.equal(fs.lstatSync(path.join(target, "src")).isSymbolicLink(), true);
  assert.equal(fs.existsSync(displaced), true);
});

test("bootstrap rollback fails closed when an owned file parent becomes a symlink", (t) => {
  const parent = fixture(t, "intentos-bootstrap-rollback-parent-symlink-");
  const target = path.join(parent, "reviewed-project");
  const outside = path.join(parent, "outside");
  const displaced = path.join(target, "src-transaction-owned");
  fs.mkdirSync(outside);
  const preservedControlFiles = controlShell(target);
  const tx = transaction(target, "rollback-parent-symlink", defaultActions(), { preservedControlFiles });
  let attacked = false;

  const result = executeBootstrapTransaction(tx, {
    mutationHooks: {
      beforeMutation: ({ operation, target: mutationTarget }) => {
        if (attacked || operation !== "bootstrap-rollback-action-unlink" || mutationTarget !== path.join(target, "src/index.mjs")) return;
        attacked = true;
        fs.renameSync(path.join(target, "src"), displaced);
        fs.symlinkSync(outside, path.join(target, "src"), "dir");
      },
    },
    verifyActivation: () => ({ ok: false, state: "BLOCKED", errors: ["force guarded rollback"] }),
  });

  assert.equal(attacked, true);
  assert.equal(result.state, "APPLY_FAILED_ROLLBACK_INCOMPLETE");
  assert.match(result.errors.join("; "), /parent chain|symlink/);
  assert.equal(fs.existsSync(path.join(outside, "index.mjs")), false);
  assert.equal(fs.readFileSync(path.join(displaced, "index.mjs"), "utf8"), "export const ready = true;\n");
  assert.equal(fs.lstatSync(path.join(target, "src")).isSymbolicLink(), true);
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
  fs.mkdirSync(path.join(parent, `.intentos-backup-${transactionId}-owned`));
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

test("a hard process interruption leaves no verified receipt and the next invocation recovers atomically", (t) => {
  const parent = fixture(t, "intentos-bootstrap-hard-interrupt-");
  const target = path.join(parent, "interrupted-project");
  const transactionId = "hard-interrupt";
  const bootstrapUrl = pathToFileURL(path.join(kitRoot, "scripts/lib/bootstrap-transaction.mjs")).href;
  const topologyUrl = pathToFileURL(path.join(kitRoot, "scripts/lib/target-topology.mjs")).href;
  const artifactUrl = pathToFileURL(path.join(kitRoot, "scripts/lib/artifact-schema.mjs")).href;
  const child = spawnSync(process.execPath, [
    "--input-type=module",
    "-e",
    [
      `import { createBootstrapTransaction, executeBootstrapTransaction } from ${JSON.stringify(bootstrapUrl)};`,
      `import { inspectTargetTopology } from ${JSON.stringify(topologyUrl)};`,
      `import { evidenceDigest } from ${JSON.stringify(artifactUrl)};`,
      `const target = ${JSON.stringify(target)};`,
      "const transaction = createBootstrapTransaction({",
      "  topology: inspectTargetTopology(target),",
      `  transactionId: ${JSON.stringify(transactionId)},`,
      "  actions: [",
      "    { id: 'A-001', path: 'README.md', content: '# Interrupted project\\n' },",
      "    { id: 'A-002', path: 'src/index.mjs', content: 'export const ready = true;\\n' },",
      "  ],",
      "  goalDigest: evidenceDigest('hard interruption goal', []),",
      "  planDigest: evidenceDigest('hard interruption plan', []),",
      "  approvalDigest: evidenceDigest('hard interruption approval', []),",
      "  readinessDigest: evidenceDigest('hard interruption readiness', []),",
      "  sourceInventoryDigest: evidenceDigest('hard interruption sources', []),",
      "});",
      "executeBootstrapTransaction(transaction, {",
      "  afterAction: () => process.exit(91),",
      "  verifyActivation: () => ({ ok: true, state: 'VERIFIED_ACTIVE', errors: [] }),",
      "});",
    ].join("\n"),
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 30_000,
  });

  assert.equal(child.status, 91, combined(child));
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${transactionId}.pending.json`)), true);
  assert.equal(fs.existsSync(path.join(target, ".intentos/bootstrap-receipt.json")), false);
  assert.equal(fs.existsSync(target), true);

  const recovered = recoverInterruptedBootstrap(target);
  assert.deepEqual(recovered, {
    ok: true,
    recovered: true,
    state: "INTERRUPTED_BOOTSTRAP_ROLLED_BACK",
  });
  assert.equal(fs.existsSync(target), false);
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${transactionId}.pending.json`)), false);
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${transactionId}.failure.json`)), true);
});

test("hard interruption recovery returns a reviewed non-empty target to its exact control shell", (t) => {
  const parent = fixture(t, "intentos-bootstrap-control-interrupt-");
  const target = path.join(parent, "reviewed-project");
  const preservedControlFiles = controlShell(target);
  const transactionId = "control-shell-interrupt";
  const bootstrapUrl = pathToFileURL(path.join(kitRoot, "scripts/lib/bootstrap-transaction.mjs")).href;
  const topologyUrl = pathToFileURL(path.join(kitRoot, "scripts/lib/target-topology.mjs")).href;
  const artifactUrl = pathToFileURL(path.join(kitRoot, "scripts/lib/artifact-schema.mjs")).href;
  const child = spawnSync(process.execPath, [
    "--input-type=module",
    "-e",
    [
      `import { createBootstrapTransaction, executeBootstrapTransaction } from ${JSON.stringify(bootstrapUrl)};`,
      `import { inspectTargetTopology } from ${JSON.stringify(topologyUrl)};`,
      `import { evidenceDigest } from ${JSON.stringify(artifactUrl)};`,
      `const target = ${JSON.stringify(target)};`,
      "const transaction = createBootstrapTransaction({",
      "  topology: inspectTargetTopology(target),",
      `  transactionId: ${JSON.stringify(transactionId)},`,
      `  preservedControlFiles: ${JSON.stringify(preservedControlFiles)},`,
      "  actions: [",
      "    { id: 'A-001', path: 'README.md', content: '# Interrupted project\\n' },",
      "    { id: 'A-002', path: 'src/index.mjs', content: 'export const ready = true;\\n' },",
      "  ],",
      "  goalDigest: evidenceDigest('hard interruption goal', []),",
      "  planDigest: evidenceDigest('hard interruption plan', []),",
      "  approvalDigest: evidenceDigest('hard interruption approval', []),",
      "  readinessDigest: evidenceDigest('hard interruption readiness', []),",
      "  sourceInventoryDigest: evidenceDigest('hard interruption sources', []),",
      "});",
      "executeBootstrapTransaction(transaction, {",
      "  afterAction: () => process.exit(92),",
      "  verifyActivation: () => ({ ok: true, state: 'VERIFIED_ACTIVE', errors: [] }),",
      "});",
    ].join("\n"),
  ], {
    cwd: kitRoot,
    encoding: "utf8",
    timeout: 30_000,
  });

  assert.equal(child.status, 92, combined(child));
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${transactionId}.pending.json`)), true);
  assert.equal(fs.existsSync(path.join(target, "README.md")), true);

  const recovered = recoverInterruptedBootstrap(target);
  assert.deepEqual(recovered, {
    ok: true,
    recovered: true,
    state: "INTERRUPTED_BOOTSTRAP_ROLLED_BACK_TO_CONTROL_SHELL",
  });
  assert.equal(fs.existsSync(path.join(target, "README.md")), false);
  assert.equal(fs.existsSync(path.join(target, "src/index.mjs")), false);
  for (const item of preservedControlFiles) assert.equal(rawFileDigest(path.join(target, item.path)), item.digest);
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${transactionId}.pending.json`)), false);
  assert.equal(fs.existsSync(path.join(parent, `.intentos-bootstrap-${transactionId}.failure.json`)), true);
});

test("bootstrap recovery resumes after interruption immediately after rollback restoration", (t) => {
  const parent = fixture(t, "intentos-bootstrap-restored-window-");
  const target = path.join(parent, "project");
  const current = transaction(target, "rollback-restored-window");

  assert.throws(() => executeBootstrapTransaction(current, {
    afterAction: () => { throw new Error("force bootstrap rollback"); },
    afterRollbackRestored: () => { throw new Error("simulated bootstrap post-restore interruption"); },
    verifyActivation: verifiedActivation,
  }), /simulated bootstrap post-restore interruption/);
  assert.equal(fs.existsSync(target), false);

  const recovered = recoverInterruptedBootstrap(target);
  assert.deepEqual(recovered, {
    ok: true,
    recovered: true,
    state: "INTERRUPTED_BOOTSTRAP_ROLLED_BACK",
  });
});

test("bootstrap recovery resumes after cleanup completed before close-out was persisted", (t) => {
  const parent = fixture(t, "intentos-bootstrap-cleanup-window-");
  const target = path.join(parent, "project");
  const current = transaction(target, "rollback-cleanup-window");

  const failure = executeBootstrapTransaction(current, {
    afterAction: () => { throw new Error("force bootstrap rollback"); },
    afterRollbackCleanup: () => { throw new Error("simulated bootstrap post-cleanup interruption"); },
    verifyActivation: verifiedActivation,
  });
  assert.equal(failure.state, "APPLY_FAILED_ROLLBACK_INCOMPLETE");
  assert.equal(fs.existsSync(target), false);

  const recovered = recoverInterruptedBootstrap(target);
  assert.deepEqual(recovered, {
    ok: true,
    recovered: true,
    state: "INTERRUPTED_BOOTSTRAP_ROLLED_BACK",
  });
});

test("orphan recovery never deletes content added outside the recorded transaction", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "orphan-unowned");
  fs.mkdirSync(target);
  fs.writeFileSync(path.join(target, "owned.txt"), "transaction content\n");
  const ownedDigest = treeObservation(target);
  const transactionId = "orphan-unowned";
  fs.mkdirSync(path.join(parent, `.intentos-backup-${transactionId}-owned`));
  const journal = writeOrphanJournal(parent, target, transactionId, ownedDigest);
  fs.writeFileSync(path.join(target, "user-content.txt"), "must never be deleted\n");

  const recovered = recoverInterruptedBootstrap(target);

  assert.equal(recovered.ok, false);
  assert.equal(recovered.state, "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT");
  assert.equal(fs.readFileSync(path.join(target, "user-content.txt"), "utf8"), "must never be deleted\n");
  assert.equal(fs.existsSync(journal), true);
});

test("recovery rejects a journal with a non-canonical digest before touching target content", (t) => {
  const parent = fixture(t);
  const target = path.join(parent, "invalid-journal-project");
  fs.mkdirSync(target);
  const businessFile = path.join(target, "business.txt");
  fs.writeFileSync(businessFile, "must remain\n");
  const transactionId = "invalid-journal";
  const journal = writeOrphanJournal(parent, target, transactionId, treeObservation(target), {
    original_topology: "NONEMPTY_DIRECTORY",
    preserved_control_files: [{ path: "business.txt", digest: rawFileDigest(businessFile) }],
    exact_actions: [{ id: "A-001", path: "business.txt", content_digest: rawFileDigest(businessFile) }],
  });
  const value = JSON.parse(fs.readFileSync(journal, "utf8"));
  value.journal_digest = evidenceDigest("tampered", []);
  fs.writeFileSync(journal, `${JSON.stringify(value, null, 2)}\n`);

  const recovered = recoverInterruptedBootstrap(target);

  assert.equal(recovered.ok, false);
  assert.equal(recovered.state, "RECOVERY_BLOCKED_BY_INVALID_JOURNAL");
  assert.match(recovered.errors.join("; "), /journal digest is invalid/);
  assert.equal(fs.readFileSync(businessFile, "utf8"), "must remain\n");
  assert.equal(fs.existsSync(journal), true);
});

test("PREPARED recovery refuses unowned temporary roots", (t) => {
  const parent = fixture(t, "intentos-bootstrap-prepared-");
  const target = path.join(parent, "untouched-target");
  const transactionId = "orphan-prepared";
  const stageRoot = path.join(parent, `.intentos-stage-${transactionId}-owned`);
  const backupRoot = path.join(parent, `.intentos-backup-${transactionId}-owned`);
  fs.mkdirSync(stageRoot);
  fs.mkdirSync(backupRoot);
  const journal = writeOrphanJournal(parent, target, transactionId, "", {
    state: "PREPARED",
    stage_root: stageRoot,
    backup_root: backupRoot,
  });

  const recovered = recoverInterruptedBootstrap(target);

  assert.equal(recovered.ok, false);
  assert.equal(recovered.state, "RECOVERY_BLOCKED_BY_UNOWNED_CONTENT");
  assert.equal(fs.existsSync(stageRoot), true);
  assert.equal(fs.existsSync(backupRoot), true);
  assert.equal(fs.existsSync(journal), true);
});

test("STAGED recovery cleans only digest-bound transaction-owned temporary roots", (t) => {
  const parent = fixture(t, "intentos-bootstrap-staged-");
  const target = path.join(parent, "untouched-target");
  const transactionId = "orphan-staged";
  const stageRoot = path.join(parent, `.intentos-stage-${transactionId}-owned`);
  const backupRoot = path.join(parent, `.intentos-backup-${transactionId}-owned`);
  fs.mkdirSync(stageRoot);
  fs.mkdirSync(backupRoot);
  fs.writeFileSync(path.join(stageRoot, "staged.txt"), "owned staged content\n");
  const journal = writeOrphanJournal(parent, target, transactionId, "", {
    state: "STAGED",
    stage_root: stageRoot,
    stage_state: "STAGE_OWNED",
    stage_tree_digest: treeObservation(stageRoot),
    backup_root: backupRoot,
    backup_state: "BACKUP_OWNED",
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
});
