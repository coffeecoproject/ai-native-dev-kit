import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const requiredBudgetFields = [
  "standalone_raw_evidence_bytes",
  "durable_runtime_output_bytes",
  "raw_evidence_per_task_bytes",
  "structured_report_bytes",
  "duplicate_comparison_min_bytes",
];

export function loadEvidenceRetentionPolicy(projectRoot, policyRef = ".intentos/evidence-retention-policy.json") {
  const root = path.resolve(projectRoot);
  const file = path.resolve(root, policyRef);
  if (!inside(root, file)) return { ok: false, errors: ["policy path escapes the project root"] };
  if (!fs.existsSync(file)) return { ok: false, errors: [`evidence retention policy is missing: ${relative(root, file)}`] };
  try {
    const policy = JSON.parse(fs.readFileSync(file, "utf8"));
    const errors = evidenceRetentionPolicyErrors(policy);
    return { ok: errors.length === 0, policy, file, errors };
  } catch (error) {
    return { ok: false, errors: [`evidence retention policy is invalid JSON: ${error.message}`] };
  }
}

export function evidenceRetentionPolicyErrors(policy) {
  const errors = [];
  if (policy?.schema_version !== "1.118.0") errors.push("schema_version must be 1.118.0");
  if (policy?.policy_id !== "intentos-forward-evidence-retention") errors.push("policy_id must identify the canonical IntentOS policy");
  if (!Number.isInteger(policy?.applies_from_task_number) || policy.applies_from_task_number < 1) errors.push("applies_from_task_number must be a positive integer");
  if (policy?.historical_evidence?.before_task_number !== policy?.applies_from_task_number) errors.push("historical cutoff must match applies_from_task_number");
  if (policy?.historical_evidence?.mutation !== "FORBIDDEN") errors.push("historical evidence mutation must remain FORBIDDEN");
  if (policy?.retention?.durable_runtime_archives_per_task !== 1) errors.push("exactly one durable runtime archive must be retained per task");
  if (policy?.retention?.standalone_full_verification_logs !== "FORBIDDEN") errors.push("standalone full verification logs must be FORBIDDEN");
  if (policy?.retention?.duplicate_raw_content !== "FORBIDDEN") errors.push("duplicate raw evidence content must be FORBIDDEN");
  if (policy?.retention?.require_complete_manifest_for_durable_runtime !== true) errors.push("durable runtime archives must require a complete manifest");
  for (const field of requiredBudgetFields) {
    if (!Number.isInteger(policy?.budgets?.[field]) || policy.budgets[field] < 1) errors.push(`budget ${field} must be a positive integer`);
  }
  if (!Array.isArray(policy?.structured_report_directories) || policy.structured_report_directories.length === 0) errors.push("structured_report_directories must be a non-empty array");
  else if (new Set(policy.structured_report_directories).size !== policy.structured_report_directories.length) errors.push("structured_report_directories must not contain duplicates");
  for (const [field, value] of Object.entries(policy?.boundaries || {})) if (value !== false) errors.push(`boundary ${field} must remain false`);
  for (const field of ["automatically_deletes_evidence", "silently_truncates_output", "uses_external_evidence_storage", "rewrites_released_evidence"]) {
    if (!(field in (policy?.boundaries || {}))) errors.push(`boundary ${field} is required`);
  }
  return errors;
}

export function inspectEvidenceRetention(projectRoot, policy) {
  const root = path.resolve(projectRoot);
  const cutoff = policy.applies_from_task_number;
  const violations = [];
  const observations = [];
  const rawByTask = new Map();
  const runtimeByTask = new Map();

  const evidenceRoot = path.join(root, "evidence");
  if (fs.existsSync(evidenceRoot)) {
    for (const file of regularFiles(evidenceRoot, violations, root)) {
      const rel = relative(root, file);
      const runtime = runtimeIdentity(rel);
      const directTask = directEvidenceTask(rel);
      const taskNumber = runtime?.taskNumber || directTask;
      if (!taskNumber || taskNumber < cutoff) continue;
      const size = fs.statSync(file).size;
      addRaw(rawByTask, taskNumber, { file, rel, size, digest: digest(file) });
      if (/^evidence\/[^/]*full-verification\.log$/i.test(rel)) violations.push(violation("FULL_VERIFICATION_LOG", rel, "standalone full verification logs are forbidden for current-policy tasks"));
      if (!runtime && size > policy.budgets.standalone_raw_evidence_bytes) violations.push(violation("STANDALONE_RAW_FILE_BUDGET", rel, `${size} bytes exceeds ${policy.budgets.standalone_raw_evidence_bytes}`));
      if (runtime && /\/outputs\/[^/]+\.log$/i.test(rel) && size > policy.budgets.durable_runtime_output_bytes) violations.push(violation("RUNTIME_OUTPUT_BUDGET", rel, `${size} bytes exceeds ${policy.budgets.durable_runtime_output_bytes}`));
      if (runtime) {
        const rows = runtimeByTask.get(runtime.taskKey) || new Map();
        rows.set(runtime.runId, runtime);
        runtimeByTask.set(runtime.taskKey, rows);
      }
    }
  }

  for (const [taskNumber, files] of rawByTask) {
    const total = files.reduce((sum, item) => sum + item.size, 0);
    observations.push({ task_number: taskNumber, raw_evidence_bytes: total, raw_evidence_files: files.length });
    if (total > policy.budgets.raw_evidence_per_task_bytes) violations.push(violation("TASK_RAW_EVIDENCE_BUDGET", `task:${taskNumber}`, `${total} bytes exceeds ${policy.budgets.raw_evidence_per_task_bytes}`));
    const byDigest = new Map();
    for (const item of files.filter((entry) => entry.size >= policy.budgets.duplicate_comparison_min_bytes)) {
      const rows = byDigest.get(item.digest) || [];
      rows.push(item.rel);
      byDigest.set(item.digest, rows);
    }
    for (const [contentDigest, paths] of byDigest) {
      if (paths.length > 1) violations.push(violation("DUPLICATE_RAW_CONTENT", paths.join(", "), `same content digest ${contentDigest}`));
    }
  }

  const manifests = manifestInventory(root);
  for (const [taskKey, runs] of runtimeByTask) {
    if (runs.size > policy.retention.durable_runtime_archives_per_task) violations.push(violation("MULTIPLE_DURABLE_RUNS", taskKey, `${runs.size} durable runtime archives are retained`));
    for (const run of runs.values()) {
      const binding = manifests.find((item) => item.runId === run.runId && item.complete && item.bindsDurableRun);
      if (!binding) violations.push(violation("UNBOUND_DURABLE_RUN", run.runId, "no complete Verification Run Manifest binds this durable archive"));
    }
  }

  for (const directory of policy.structured_report_directories) {
    const reportRoot = path.join(root, directory);
    if (!fs.existsSync(reportRoot)) continue;
    for (const file of regularFiles(reportRoot, violations, root)) {
      const taskNumber = numberedBasename(file);
      if (!taskNumber || taskNumber < cutoff) continue;
      const size = fs.statSync(file).size;
      if (size > policy.budgets.structured_report_bytes) violations.push(violation("STRUCTURED_REPORT_BUDGET", relative(root, file), `${size} bytes exceeds ${policy.budgets.structured_report_bytes}`));
    }
  }

  return {
    ok: violations.length === 0,
    policy_id: policy.policy_id,
    applies_from_task_number: cutoff,
    observations,
    violations,
    boundaries: policy.boundaries,
  };
}

function regularFiles(root, violations, projectRoot) {
  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) {
        violations.push(violation("SYMLINK_EVIDENCE", relative(projectRoot, file), "evidence scanning refuses symbolic links"));
      } else if (stat.isDirectory()) visit(file);
      else if (stat.isFile()) files.push(file);
      else violations.push(violation("NON_REGULAR_EVIDENCE", relative(projectRoot, file), "evidence must be a regular file"));
    }
  };
  visit(root);
  return files;
}

function runtimeIdentity(rel) {
  const match = rel.match(/^evidence\/runtime-runs\/(vrun-(\d+)-(.+)-r(\d+))(?:\/|$)/);
  if (!match) return null;
  return { runId: match[1], taskNumber: Number(match[2]), taskKey: `${match[2]}-${match[3]}` };
}

function directEvidenceTask(rel) {
  const match = rel.match(/^evidence\/(\d+)-[^/]+$/);
  return match ? Number(match[1]) : null;
}

function numberedBasename(file) {
  const match = path.basename(file).match(/^(\d+)-/);
  return match ? Number(match[1]) : null;
}

function manifestInventory(root) {
  const directory = path.join(root, "verification-run-manifests");
  if (!fs.existsSync(directory)) return [];
  return regularFiles(directory, [], root).filter((file) => file.endsWith(".md")).map((file) => {
    const content = fs.readFileSync(file, "utf8");
    const runId = content.match(/"run_id"\s*:\s*"([^"]+)"/)?.[1] || "";
    return {
      runId,
      complete: /"outcome"\s*:\s*"RUNTIME_TRUST_COMPLETE"/.test(content),
      bindsDurableRun: runId ? content.includes(`file:evidence/runtime-runs/${runId}/`) : false,
    };
  });
}

function addRaw(map, taskNumber, item) {
  const rows = map.get(taskNumber) || [];
  rows.push(item);
  map.set(taskNumber, rows);
}

function digest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function violation(code, pathValue, reason) { return { code, path: pathValue, reason }; }
function relative(root, file) { return path.relative(root, file).split(path.sep).join("/"); }
function inside(root, file) { const rel = path.relative(root, file); return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel)); }
