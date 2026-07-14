import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { evidenceDigest } from "./artifact-schema.mjs";

export function recommendBehavioralAdoption(options = {}) {
  const facts = options.projectFactProjection || {};
  const topology = options.targetTopology || {};
  const governance = facts.governance_authority_posture?.state || "LIGHT";
  const currentWork = facts.current_work_continuity?.state || "NO_CURRENT_WORK";
  const blockers = [];
  if ((facts.conflicts || []).some((item) => item.affected_scope === "GLOBAL_TRUST" && item.state === "BLOCKING")) blockers.push("GLOBAL_PROJECT_TRUST_BLOCKED");
  if (currentWork === "CURRENT_CONFLICTED") blockers.push("CURRENT_WORK_CONFLICTED");

  let path = "INTENTOS_NATIVE_GOVERNANCE";
  if (topology.state === "ABSENT_LEAF" || topology.state === "EMPTY_DIRECTORY") path = "CONTROLLED_NEW_PROJECT_SETUP";
  else if (["DECLARED_STRONG_GOVERNED", "DECLARED_GOVERNED"].includes(governance)) path = "SELECTED_NATIVE_OVERLAY";

  const base = {
    schema_version: "1.109.0",
    artifact_type: "behavioral_adoption_recommendation",
    project_binding: facts.project_identity || {},
    target_topology_digest: topology.topology_digest || "N/A",
    recommended_path: blockers.length > 0 ? "READ_ONLY_REPAIR" : path,
    target_behavioral_state: "VERIFIED_ACTIVE",
    preserve_project_authority: path === "SELECTED_NATIVE_OVERLAY" ? "Yes" : "As applicable",
    derive_missing_governance: path === "INTENTOS_NATIVE_GOVERNANCE" ? "Yes" : "No",
    current_work_handling: currentWork === "NO_CURRENT_WORK" ? "NO_CURRENT_WORK" : "MAP_AND_PRESERVE",
    user_technical_choice_required: "No",
    blockers,
    boundaries: {
      authorizes_apply: "No",
      replaces_project_release_authority: "No",
      proves_activation: "No",
    },
  };
  return { ...base, recommendation_digest: evidenceDigest(base, []) };
}

export function resolveBehavioralAdoptionActivation(options = {}) {
  const route = options.routeCalibration || {};
  const coldStart = options.coldStart || {};
  const receipt = options.applyReceipt || {};
  const firstTask = options.firstTask || null;
  const blockers = [];

  if (sourceState(receipt) !== "APPLY_VERIFIED") blockers.push("APPLY_RECEIPT_NOT_VERIFIED");
  if (sourceState(coldStart) !== "COLD_START_VERIFIED") blockers.push("PROJECT_LOCAL_COLD_START_NOT_VERIFIED");
  if (sourceState(route) !== "ROUTE_VERIFIED") blockers.push("INTENTOS_ROUTE_NOT_VERIFIED");
  if (coldStart.source_tree_unchanged !== "Yes") blockers.push("SOURCE_TREE_UNCHANGED_NOT_PROVED");
  if (route.project_work_queue_unchanged !== "Yes") blockers.push("PROJECT_WORK_QUEUE_UNCHANGED_NOT_PROVED");
  if (route.synthetic_current_items_created !== "No") blockers.push("SYNTHETIC_CURRENT_WORK_DETECTED");
  for (const [label, value] of [["apply receipt", receipt], ["cold start", coldStart], ["route calibration", route]]) {
    if (!validSource(value)) blockers.push(`${label.toUpperCase().replaceAll(" ", "_")}_SOURCE_INVALID`);
  }

  const activationState = blockers.length === 0 ? "VERIFIED_ACTIVE" : "BLOCKED";
  const firstTaskState = activationState !== "VERIFIED_ACTIVE"
    ? "NOT_STARTED"
    : sourceState(firstTask) === "STRICT_FINISH_VERIFIED"
      ? "VERIFIED"
      : firstTask?.state ? "BLOCKED" : "NOT_STARTED";
  const base = {
    schema_version: "1.109.0",
    artifact_type: "behavioral_adoption_activation",
    project_binding: options.projectBinding || {},
    goal_digest: String(options.goalDigest || "N/A"),
    apply_receipt: source(receipt),
    cold_start: source(coldStart),
    route_calibration: source(route),
    activation_state: activationState,
    first_task_state: firstTaskState,
    first_task: firstTask ? source(firstTask) : { ref: "N/A", digest: "N/A", state: "NOT_STARTED" },
    blockers,
    boundaries: {
      changes_work_queue: "No",
      proves_product_correctness: "No",
      proves_release_readiness: "No",
      authorizes_production: "No",
    },
    outcome: activationState,
  };
  return { ...base, activation_digest: evidenceDigest(base, []) };
}

export function validateBehavioralActivation(value, options = {}) {
  const errors = [];
  const { activation_digest: _digest, ...base } = value || {};
  if (value?.activation_digest !== evidenceDigest(base, [])) errors.push("activation digest is not canonical");
  if (options.projectBinding !== undefined && JSON.stringify(value?.project_binding) !== JSON.stringify(options.projectBinding)) errors.push("activation belongs to another project or revision");
  if (options.goalDigest !== undefined && value?.goal_digest !== options.goalDigest) errors.push("activation belongs to another goal");
  if (value?.activation_state === "VERIFIED_ACTIVE" && (value.blockers || []).length > 0) errors.push("verified activation cannot retain blockers");
  if (value?.first_task_state === "VERIFIED" && value?.activation_state !== "VERIFIED_ACTIVE") errors.push("first task cannot be verified before activation");
  for (const field of ["apply_receipt", "cold_start", "route_calibration"]) {
    if (!validNormalizedSource(value?.[field])) errors.push(`${field} must bind one exact current source`);
  }
  if (value?.first_task_state === "VERIFIED" && !validNormalizedSource(value?.first_task)) errors.push("verified first task must bind one exact source");
  return { ok: errors.length === 0, errors };
}

export function verifyProjectLocalBehavioralRoute(options = {}) {
  const targetRoot = path.resolve(options.targetRoot || ".");
  const sourceRoot = options.sourceRoot ? path.resolve(options.sourceRoot) : "";
  const sourceInventory = Array.isArray(options.sourceInventory) ? options.sourceInventory : [];
  const allowProjectLocalExecution = options.allowProjectLocalExecution === true;
  const executionRoot = allowProjectLocalExecution ? targetRoot : sourceRoot;
  const goal = String(options.goal || "start the first ordinary product task").trim();
  const targetBefore = directoryObservation(targetRoot);
  const sharedSourceAndTarget = Boolean(sourceRoot && sourceRoot === targetRoot);
  const sourceBefore = sourceRoot
    ? (sharedSourceAndTarget ? targetBefore : sourceObservation(sourceRoot, sourceInventory))
    : "N/A";
  const commands = [
    ["workflow-next", "scripts/workflow-next.mjs", [targetRoot, "--json", "--intent", goal]],
    ["work-queue", "scripts/resolve-work-queue.mjs", [targetRoot, "--json"]],
    ["task-governance", "scripts/resolve-task-governance.mjs", [targetRoot, "--json", "--intent", goal]],
    ["review-surface", "scripts/resolve-review-surface.mjs", [targetRoot, "--json", "--intent", goal]],
    ["verification-plan", "scripts/resolve-verification-plan.mjs", [targetRoot, "--json", "--intent", goal, "--project-level", "BL1", "--platform", "generic"]],
    ["strict-finish-guard", "scripts/resolve-closure-decision.mjs", [targetRoot, "--json", "--intent", goal]],
  ];
  const activationEnv = {
    INTENTOS_BOOTSTRAP_ACTIVATION_TRANSACTION: String(options.transaction?.transaction_id || ""),
    INTENTOS_BOOTSTRAP_ACTIVATION_ENVELOPE_DIGEST: String(options.transaction?.envelope_digest || ""),
  };
  const deniedSourceRoot = allowProjectLocalExecution && sourceRoot && sourceRoot !== targetRoot ? sourceRoot : "";
  const accessDenyPreload = deniedSourceRoot ? createSourceAccessDenyPreload(deniedSourceRoot) : "";
  const results = executionRoot
    ? commands.map(([name, relativeScript, args]) => runProjectLocalResolver(targetRoot, executionRoot, name, relativeScript, args, activationEnv, accessDenyPreload))
    : commands.map(([name]) => ({ name, exit_code: -1, parsed: null, output_digest: evidenceDigest("missing trusted execution root", []), error: "trusted execution root is unavailable" }));
  if (accessDenyPreload) fs.rmSync(accessDenyPreload, { force: true });
  const targetAfter = directoryObservation(targetRoot);
  const sourceAfter = sourceRoot
    ? (sharedSourceAndTarget ? targetAfter : sourceObservation(sourceRoot, sourceInventory))
    : "N/A";
  const workflow = results.find((item) => item.name === "workflow-next");
  const queue = results.find((item) => item.name === "work-queue");
  const governance = results.find((item) => item.name === "task-governance");
  const review = results.find((item) => item.name === "review-surface");
  const verification = results.find((item) => item.name === "verification-plan");
  const finish = results.find((item) => item.name === "strict-finish-guard");
  const workflowTrust = workflow?.parsed?.projectEntryTrust;
  const targetUnchanged = targetBefore === targetAfter;
  const sourceUnchanged = sourceBefore === sourceAfter;
  const workflowReady = workflow?.exit_code === 0
    && workflow?.parsed?.projectEntryTrust?.entry_state === "READY_FOR_INTENTOS_OPERATION"
    && ["INSTALLED_CURRENT", "BRIDGE_CURRENT"].includes(workflow?.parsed?.projectEntryTrust?.project_identity?.state);
  const routeReady = queue?.exit_code === 0
    && governance?.exit_code === 0
    && review?.exit_code === 0
    && verification?.exit_code === 0
    && finish?.exit_code === 0
    && queue.parsed?.reportType === "WORK_QUEUE_RECOMMENDATION"
    && governance.parsed?.reportType === "TASK_GOVERNANCE"
    && review.parsed?.reportType === "REVIEW_SURFACE_CARD"
    && verification.parsed?.reportType === "VERIFICATION_PLAN"
    && finish.parsed?.closureDecision?.canCountAsDone === "No";
  const errors = [];
  if (!workflowReady) {
    const detail = [
      workflow?.error,
      workflow?.outcome,
      workflowTrust?.entry_state,
      workflowTrust?.project_identity?.reason,
      workflowTrust?.guidance_authority?.reason,
      ...(workflowTrust?.guidance_authority?.invalid_nodes || []).map((item) => `${item.path}:${item.state}:${(item.conflict_codes || []).join(",")}`),
      ...(workflowTrust?.guidance_authority?.cycles || []).map((item) => `guidance-cycle:${Array.isArray(item) ? item.join(" -> ") : String(item)}`),
      ...(workflowTrust?.blockers || []),
    ].filter(Boolean).join("; ");
    errors.push(`generated project cold start failed: ${detail || "invalid workflow-next state"}`);
  }
  if (!routeReady) errors.push("generated project did not route through Work Queue, Task Governance, review, verification, and a fail-closed finish guard");
  if (!targetUnchanged) errors.push("generated-project route calibration changed target files");
  if (!sourceUnchanged) errors.push("generated-project route calibration changed the IntentOS source tree");
  const projectLocalRoute = allowProjectLocalExecution && executionRoot === targetRoot;
  const coldBase = {
    ref: "runtime:generated-project-cold-start",
    state: workflowReady && targetUnchanged && sourceUnchanged
      ? projectLocalRoute ? "COLD_START_VERIFIED" : "SOURCE_DRIVEN_READ_ONLY_VERIFIED"
      : "BLOCKED",
    exit_code: workflow?.exit_code ?? -1,
    project_entry_state: workflow?.parsed?.projectEntryTrust?.entry_state || "UNKNOWN",
    source_tree_unchanged: sourceUnchanged ? "Yes" : "No",
    target_tree_unchanged: targetUnchanged ? "Yes" : "No",
    output_digest: workflow?.output_digest || evidenceDigest("not-run", []),
  };
  const coldStart = { ...coldBase, digest: evidenceDigest(coldBase, []) };
  const routeBase = {
    ref: "runtime:generated-project-route-calibration",
    state: routeReady && targetUnchanged
      ? projectLocalRoute ? "ROUTE_VERIFIED" : "SOURCE_DRIVEN_ROUTE_VERIFIED"
      : "BLOCKED",
    project_work_queue_unchanged: targetUnchanged ? "Yes" : "No",
    synthetic_current_items_created: "No",
    source_refs: results.map((item) => `${item.name}:${item.output_digest}`),
  };
  const routeCalibration = { ...routeBase, digest: evidenceDigest(routeBase, []) };
  return {
    ok: errors.length === 0,
    state: errors.length === 0 ? projectLocalRoute ? "VERIFIED_ACTIVE" : "READ_ONLY_SIMULATION_PASSED" : "BLOCKED",
    coldStart,
    routeCalibration,
    results: results.map((item) => ({
      name: item.name,
      exit_code: item.exit_code,
      output_digest: item.output_digest,
      outcome: item.outcome,
      error: item.error,
    })),
    errors,
  };
}

function runProjectLocalResolver(root, executionRoot, name, relativeScript, args, activationEnv = {}, accessDenyPreload = "") {
  const script = path.join(executionRoot, relativeScript);
  if (!fs.existsSync(script)) return { name, exit_code: -1, parsed: null, output_digest: evidenceDigest("missing", []), error: `${relativeScript} is missing` };
  const nodeArgs = accessDenyPreload ? ["--require", accessDenyPreload, script, ...args] : [script, ...args];
  const result = spawnSync(process.execPath, nodeArgs, {
    cwd: root,
    env: sanitizedResolverEnvironment(activationEnv),
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
    timeout: 60000,
  });
  let parsed = null;
  try { parsed = JSON.parse(result.stdout); } catch { parsed = null; }
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  return {
    name,
    exit_code: Number.isInteger(result.status) ? result.status : -1,
    parsed,
    output_digest: evidenceDigest(output, []),
    outcome: parsed?.outcome || parsed?.nextAction || parsed?.reportType || "UNKNOWN",
    error: result.error?.message || result.stderr || (!parsed ? "invalid JSON output" : ""),
  };
}

function createSourceAccessDenyPreload(sourceRoot) {
  const file = path.join(os.tmpdir(), `intentos-source-deny-${process.pid}-${cryptoRandom()}.cjs`);
  const content = `
const fs = require("node:fs");
const path = require("node:path");
const { syncBuiltinESMExports } = require("node:module");
const denied = fs.realpathSync(${JSON.stringify(sourceRoot)});
const guarded = ["readFileSync", "readFile", "openSync", "open", "statSync", "stat", "lstatSync", "lstat", "readdirSync", "readdir", "accessSync", "access", "realpathSync", "realpath"];
const blocked = (value) => {
  if (typeof value !== "string" && !Buffer.isBuffer(value) && !(value instanceof URL)) return false;
  const raw = value instanceof URL ? value.pathname : Buffer.isBuffer(value) ? value.toString() : value;
  const resolved = path.resolve(raw);
  return resolved === denied || resolved.startsWith(denied + path.sep);
};
for (const name of guarded) {
  const original = fs[name];
  if (typeof original !== "function") continue;
  fs[name] = function (...args) {
    if (blocked(args[0])) throw new Error("INTENTOS_SOURCE_ACCESS_DENIED:" + String(args[0]));
    return original.apply(this, args);
  };
}
syncBuiltinESMExports();
`;
  fs.writeFileSync(file, content, { flag: "wx", mode: 0o600 });
  return file;
}

function cryptoRandom() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function directoryObservation(root) {
  if (!fs.existsSync(root)) return evidenceDigest({ state: "ABSENT" }, []);
  const rows = [];
  walk(root, root, rows);
  return evidenceDigest(rows, []);
}

function walk(root, current, rows) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if ([".git", "node_modules", ".next", "dist", "build", "coverage"].includes(entry.name)) continue;
    const full = path.join(current, entry.name);
    const relative = path.relative(root, full).replaceAll(path.sep, "/");
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink()) rows.push({ path: relative, type: "symlink", target: fs.readlinkSync(full) });
    else if (stat.isDirectory()) {
      rows.push({ path: relative, type: "directory" });
      walk(root, full, rows);
    } else if (stat.isFile()) rows.push({ path: relative, type: "file", size: stat.size, digest: evidenceDigest(fs.readFileSync(full).toString("base64"), []) });
  }
}

function sourceObservation(root, inventory = []) {
  if (inventory.length === 0) return directoryObservation(root);
  const rows = inventory.map((item) => {
    const ref = String(item?.source_ref || "");
    if (ref === "N/A") return { id: item.id, path: item.path, source_ref: ref, source_hash: item.source_hash };
    const normalized = ref.replaceAll("\\", "/").replace(/^\.\//, "");
    if (!normalized || normalized === ".." || normalized.startsWith("../") || path.posix.isAbsolute(normalized)) {
      return { id: item.id, path: item.path, source_ref: ref, state: "UNSAFE_SOURCE_REF" };
    }
    const file = path.join(root, normalized);
    if (!fs.existsSync(file) || fs.lstatSync(file).isSymbolicLink() || !fs.lstatSync(file).isFile()) {
      return { id: item.id, path: item.path, source_ref: normalized, state: "SOURCE_UNAVAILABLE" };
    }
    return {
      id: item.id,
      path: item.path,
      source_ref: normalized,
      source_hash: `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`,
    };
  });
  return evidenceDigest(rows, []);
}

function sanitizedResolverEnvironment(extra = {}) {
  const env = {};
  for (const key of ["HOME", "PATH", "LANG", "LC_ALL", "LC_CTYPE", "TMPDIR", "TMP", "TEMP", "SYSTEMROOT", "COMSPEC", "PATHEXT"]) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return {
    ...env,
    INTENTOS_SOURCE_ROOT: "",
    INTENTOS_GENERATED_COLD_START: "1",
    ...extra,
  };
}

function source(value) {
  return {
    ref: String(value?.ref || "N/A"),
    digest: String(value?.digest || "N/A"),
    state: sourceState(value),
  };
}

function sourceState(value) {
  return String(value?.state || value?.receipt_state || value?.assurance_state || value?.outcome || "UNKNOWN");
}

function validSource(value) {
  return Boolean(value?.ref && /^sha256:[a-f0-9]{64}$/.test(String(value?.digest || "")));
}

function validNormalizedSource(value) {
  return Boolean(value?.ref && value.ref !== "N/A" && /^sha256:[a-f0-9]{64}$/.test(String(value?.digest || "")) && value?.state && value.state !== "UNKNOWN");
}
