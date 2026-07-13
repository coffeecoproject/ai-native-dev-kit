import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { extractMachineReadableEvidence, loadSchema, validateEvidenceBlock } from "./artifact-schema.mjs";
import { resolveAuthoritativeEvidenceReference } from "./evidence-authority.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const checkerPath = path.resolve(__dirname, "..", "check-verification-run-manifest.mjs");
const bindingChecker = "scripts/check-verification-run-manifest.mjs --require-complete";

export function resolveRuntimeTrustBinding(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const candidates = runtimeManifestCandidates(root, options.manifestRef);
  if (candidates.length === 0) {
    return blockedBinding("No project-local Verification Run Manifest is available for the current task.");
  }

  const failures = [];
  for (const candidate of candidates) {
    const checked = checkCandidate(root, candidate, options);
    if (checked.ok) return checked;
    failures.push(checked.binding.reason);
    if (options.manifestRef) break;
  }
  return blockedBinding(failures[0] || "No current Verification Run Manifest passed Runtime Trust authority checks.");
}

export function validateRuntimeTrustBinding(projectRoot, binding, options = {}) {
  const errors = runtimeTrustBindingErrors(binding, options);
  if (errors.length > 0) return { ok: false, errors, binding: blockedBinding(errors[0]).binding };
  const resolved = resolveRuntimeTrustBinding(projectRoot, {
    ...options,
    manifestRef: binding.run_manifest_ref,
  });
  if (!resolved.ok) return { ok: false, errors: [resolved.binding.reason], binding: resolved.binding };
  const expected = resolved.binding;
  for (const key of runtimeIdentityKeys()) {
    if (binding[key] !== expected[key]) errors.push(`runtime_trust_binding.${key} does not match the authoritative current run`);
  }
  return { ok: errors.length === 0, errors, binding: expected, manifest: resolved.manifest, file: resolved.file };
}

export function runtimeTrustBindingErrors(binding, options = {}) {
  const errors = [];
  if (!binding || typeof binding !== "object" || Array.isArray(binding)) return ["runtime_trust_binding is required"];
  if (binding.requirement !== "REQUIRED") errors.push("runtime_trust_binding.requirement must be REQUIRED");
  if (binding.status !== "VERIFIED") errors.push("runtime_trust_binding.status must be VERIFIED");
  if (binding.checker !== bindingChecker) errors.push(`runtime_trust_binding.checker must be ${bindingChecker}`);
  for (const key of [
    "run_manifest_ref", "run_manifest_digest", "run_id", "task_ref", "intent_digest",
    "runtime_plan_ref", "runtime_plan_digest", "lifecycle_plan_ref", "lifecycle_plan_digest",
    "verification_plan_ref", "verification_plan_digest",
  ]) {
    if (!String(binding[key] || "").trim() || binding[key] === "N/A") errors.push(`runtime_trust_binding.${key} is required`);
  }
  for (const key of ["current_project_match", "current_task_match", "current_intent_match", "current_verification_plan_match"]) {
    if (binding[key] !== "Yes") errors.push(`runtime_trust_binding.${key} must be Yes`);
  }
  if (options.taskRef && binding.task_ref !== options.taskRef) errors.push("runtime_trust_binding.task_ref does not match the current consumer task");
  if (options.intentDigest && binding.intent_digest !== options.intentDigest) errors.push("runtime_trust_binding.intent_digest does not match the current consumer intent");
  if (options.verificationPlanRef && normalizeRef(binding.verification_plan_ref) !== normalizeRef(options.verificationPlanRef)) {
    errors.push("runtime_trust_binding.verification_plan_ref does not match the current Verification Plan");
  }
  if (options.verificationPlanDigest && binding.verification_plan_digest !== options.verificationPlanDigest) {
    errors.push("runtime_trust_binding.verification_plan_digest does not match the current Verification Plan");
  }
  return errors;
}

export function runtimeTrustBindingsAgree(bindings) {
  const present = bindings.filter(Boolean);
  if (present.length < 2) return { ok: true, errors: [] };
  const errors = [];
  const expected = present[0];
  for (const binding of present.slice(1)) {
    for (const key of runtimeIdentityKeys()) {
      if (binding[key] !== expected[key]) errors.push(`Runtime Trust consumers disagree on ${key}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function runtimeEvidenceItems(manifest) {
  if (!manifest || !Array.isArray(manifest.verification_executions)) return [];
  return manifest.verification_executions.map((execution) => ({
    id: `runtime:${execution.id}`,
    evidence_type: "COMMAND_OUTPUT",
    result_state: execution.result,
    ref: asArtifactRef(execution.output_ref),
    command: `runtime-command-digest:${execution.command_digest}`,
    owner: "IntentOS bounded verification runtime",
    environment: manifest.runtime_trust_level,
    ran_at: execution.finished_at,
    exit_code: execution.exit_code,
    ran_after_change: "Yes",
    current_task_match: "Yes",
    covers_obligations: execution.covers_obligations,
    output_digest: execution.output_digest,
    failure_reason: execution.result === "PASSED" ? "N/A" : `Runtime execution ended as ${execution.result}.`,
    limitations: "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window.",
  }));
}

export function asArtifactRef(value) {
  const relative = String(value || "").trim().replace(/^(artifact|file):/i, "");
  return relative ? `artifact:${relative}` : "";
}

export function runtimeBindingMarkdown(binding) {
  return [
    "| Field | Value |",
    "| --- | --- |",
    `| Requirement | \`${binding.requirement}\` |`,
    `| Status | \`${binding.status}\` |`,
    `| Run Manifest | \`${binding.run_manifest_ref}\` |`,
    `| Run ID | \`${binding.run_id}\` |`,
    `| Task Ref | \`${binding.task_ref}\` |`,
    `| Intent Digest | \`${binding.intent_digest}\` |`,
    `| Runtime Trust Level | \`${binding.runtime_trust_level}\` |`,
    `| Current Project Match | \`${binding.current_project_match}\` |`,
    `| Current Task Match | \`${binding.current_task_match}\` |`,
    `| Current Intent Match | \`${binding.current_intent_match}\` |`,
    `| Current Verification Plan Match | \`${binding.current_verification_plan_match}\` |`,
    `| Reason | ${binding.reason} |`,
  ].join("\n");
}

function checkCandidate(root, candidate, options) {
  const resolved = resolveAuthoritativeEvidenceReference(root, options.fromFile || "", candidate.ref, { markdownOnly: true });
  if (!resolved.ok) return blockedBinding(`Verification Run Manifest is unsafe or unresolved: ${resolved.error}`);
  const relativeForChecker = resolved.relativePath.replace(/^\.intentos\//, "");
  if (!/^verification-run-manifests\/[a-zA-Z0-9._/-]+\.md$/.test(relativeForChecker)) {
    return blockedBinding("Verification Run Manifest must be under verification-run-manifests/.");
  }
  const result = spawnSync(process.execPath, [checkerPath, root, "--report", relativeForChecker, "--require-complete", "--json"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = checkerFailureReason(result.stdout, result.stderr);
    return blockedBinding(`Verification Run Manifest failed the authoritative checker${detail ? `: ${detail}` : "."}`);
  }
  const schema = loadSchema(root, "schemas/artifacts/verification-run-manifest.schema.json");
  const content = fs.readFileSync(resolved.file, "utf8");
  const checked = validateEvidenceBlock(content, schema, relativeForChecker, { require: true, digestField: "run_manifest_digest" });
  if (!checked.ok) return blockedBinding(checked.errors[0] || "Verification Run Manifest structured evidence is invalid.");
  const manifest = checked.value;
  if (manifest.schema_version !== "1.103.0") return blockedBinding("Strict Runtime Trust consumption requires Verification Run Manifest schema 1.103.0.");
  const mismatches = manifestMismatches(manifest, options);
  if (mismatches.length > 0) return blockedBinding(mismatches[0]);
  return {
    ok: true,
    file: resolved.file,
    manifest,
    binding: {
      requirement: "REQUIRED",
      status: "VERIFIED",
      run_manifest_ref: `artifact:${resolved.relativePath}`,
      run_manifest_digest: manifest.run_manifest_digest,
      run_id: manifest.run_id,
      task_ref: manifest.task_ref,
      intent_digest: manifest.intent_digest,
      runtime_trust_level: manifest.runtime_trust_level,
      runtime_plan_ref: manifest.runtime_plan_ref,
      runtime_plan_digest: manifest.runtime_plan_digest,
      lifecycle_plan_ref: manifest.lifecycle_plan_ref,
      lifecycle_plan_digest: manifest.lifecycle_plan_digest,
      verification_plan_ref: manifest.verification_plan_ref,
      verification_plan_digest: manifest.verification_plan_digest,
      current_project_match: "Yes",
      current_task_match: "Yes",
      current_intent_match: "Yes",
      current_verification_plan_match: "Yes",
      checker: bindingChecker,
      reason: "The exact current run passed the authoritative checker and consumer identity checks.",
    },
  };
}

function runtimeManifestCandidates(root, explicitRef) {
  if (explicitRef) return [{ ref: String(explicitRef) }];
  const files = [];
  for (const dir of [path.join(root, "verification-run-manifests"), path.join(root, ".intentos", "verification-run-manifests")]) {
    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory() || fs.lstatSync(dir).isSymbolicLink()) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const file = path.join(dir, entry.name);
      files.push({
        ref: `artifact:${path.relative(root, file).split(path.sep).join("/")}`,
        mtimeMs: fs.statSync(file).mtimeMs,
      });
    }
  }
  return files.sort((a, b) => b.mtimeMs - a.mtimeMs || b.ref.localeCompare(a.ref));
}

function manifestMismatches(manifest, options) {
  const errors = [];
  if (options.taskRef && manifest.task_ref !== options.taskRef) errors.push("Verification Run Manifest belongs to a different task.");
  if (options.intentDigest && manifest.intent_digest !== options.intentDigest) errors.push("Verification Run Manifest belongs to a different intent.");
  if (options.verificationPlanRef && normalizeRef(manifest.verification_plan_ref) !== normalizeRef(options.verificationPlanRef)) {
    errors.push("Verification Run Manifest references a different Verification Plan.");
  }
  if (options.verificationPlanDigest && manifest.verification_plan_digest !== options.verificationPlanDigest) {
    errors.push("Verification Run Manifest has a different Verification Plan digest.");
  }
  return errors;
}

function blockedBinding(reason) {
  return {
    ok: false,
    file: "",
    manifest: null,
    binding: {
      requirement: "REQUIRED",
      status: "BLOCKED",
      run_manifest_ref: "N/A",
      run_manifest_digest: "N/A",
      run_id: "N/A",
      task_ref: "N/A",
      intent_digest: "N/A",
      runtime_trust_level: "N/A",
      runtime_plan_ref: "N/A",
      runtime_plan_digest: "N/A",
      lifecycle_plan_ref: "N/A",
      lifecycle_plan_digest: "N/A",
      verification_plan_ref: "N/A",
      verification_plan_digest: "N/A",
      current_project_match: "Unknown",
      current_task_match: "Unknown",
      current_intent_match: "Unknown",
      current_verification_plan_match: "Unknown",
      checker: bindingChecker,
      reason,
    },
  };
}

function runtimeIdentityKeys() {
  return [
    "run_manifest_ref", "run_manifest_digest", "run_id", "task_ref", "intent_digest",
    "runtime_plan_ref", "runtime_plan_digest", "lifecycle_plan_ref", "lifecycle_plan_digest",
    "verification_plan_ref", "verification_plan_digest", "runtime_trust_level",
  ];
}

function normalizeRef(value) {
  return String(value || "").trim().replace(/^(artifact|file):/i, "").replace(/^\.intentos\//, "");
}

function checkerFailureReason(stdout, stderr) {
  try {
    const parsed = JSON.parse(String(stdout || ""));
    const failed = Array.isArray(parsed.checks) ? parsed.checks.find((item) => item && item.ok === false) : null;
    if (failed?.message) return failed.message;
  } catch {
    // Fall through to bounded stderr/stdout text.
  }
  return String(stderr || stdout || "").trim().split(/\r?\n/).find(Boolean)?.slice(0, 300) || "";
}
