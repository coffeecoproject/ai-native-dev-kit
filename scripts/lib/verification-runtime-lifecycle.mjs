import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { loadSchema, validateEvidenceBlock } from "./artifact-schema.mjs";
import {
  canonicalFileDigest,
  projectIdentity,
  resolveAuthoritativeEvidenceReference,
  validateEvidenceAuthorityBinding,
} from "./evidence-authority.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath, resolveUnderRoot } from "./path-safety.mjs";
import { digestText, planSemanticErrors } from "./verification-runtime-trust.mjs";

export const LIFECYCLE_VERSION = "1.103.0";
export const LIFECYCLE_DECLARATION_REF = "file:.intentos/verification-runtime-lifecycle.json";
export const CURRENT_REQUIRED_OBLIGATIONS = "$CURRENT_REQUIRED_OBLIGATIONS";
export const CURRENT_RUNTIME_OBLIGATIONS = "$CURRENT_RUNTIME_OBLIGATIONS";
export const CURRENT_NON_RUNTIME_OBLIGATIONS = "$CURRENT_NON_RUNTIME_OBLIGATIONS";
const OBLIGATION_SELECTORS = new Set([
  CURRENT_REQUIRED_OBLIGATIONS,
  CURRENT_RUNTIME_OBLIGATIONS,
  CURRENT_NON_RUNTIME_OBLIGATIONS,
]);

const SAFE_EXECUTABLES = new Set([
  "node", "npm", "npx", "pnpm", "yarn", "bun", "deno",
  "go", "cargo", "swift", "xcodebuild", "gradle", "gradlew", "java",
  "dotnet", "ruby", "bundle", "rake",
]);
const SAFE_SERVICE_EXECUTABLES = new Set(["node", "bun", "deno", "java", "dotnet", "ruby"]);
const FORBIDDEN_EXECUTABLES = new Set([
  "sh", "bash", "zsh", "fish", "csh", "tcsh", "pwsh", "powershell", "cmd",
  "sudo", "su", "ssh", "scp", "sftp", "rsync", "rm", "rmdir", "pkill",
  "kill", "killall", "launchctl", "systemctl", "terraform", "pulumi",
  "ansible", "kubectl", "helm", "serverless", "vercel", "netlify", "wrangler",
  "aws", "gcloud", "az", "fly", "doctl", "gh", "docker", "podman",
]);
const SAFE_INHERITED_ENV = ["PATH", "LANG", "LC_ALL", "CI", "TERM"];
const BLOCKED_ENV_PATTERN = /(SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|CREDENTIAL|AUTH|COOKIE|SESSION|DATABASE_URL|REDIS_URL|PRODUCTION|PROD_)/i;
const SHELL_TOKEN_PATTERN = /(?:&&|\|\||;|`|\$\(|\$\{|\n|\r|(^|\s)[<>](\s|$))/;
const EXTERNAL_EFFECT_PATTERN = /(?:^|[-_])(prod|production|deploy|release|submit|publish|destroy|apply)(?:$|[-_])/i;

export function lifecycleExecutionMode(adapterKind, taskTier, declaration) {
  if (taskTier === "POSSIBLE_HIGH") return "UNRESOLVED";
  if (adapterKind === "COMMAND_ONLY") return declaration ? "NO_MANAGED_RUNTIME" : "UNRESOLVED";
  if (["KUBERNETES_WORKLOAD", "SERVERLESS_DEPLOYMENT", "DOCKER_CONTAINER"].includes(adapterKind)) {
    return "EXTERNAL_EFFECT_BLOCKED";
  }
  if (["LOCAL_PROCESS", "STATIC_BUILD", "PROJECT_NATIVE"].includes(adapterKind)) {
    return declaration ? "LOCAL_CONTROLLED" : "UNRESOLVED";
  }
  return "UNRESOLVED";
}

export function readLifecycleDeclaration(projectRoot) {
  const root = path.resolve(projectRoot);
  const relative = ".intentos/verification-runtime-lifecycle.json";
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) return { status: "MISSING", file: "", relative, digest: "", value: null, errors: [] };
  try {
    assertNoSymlinkInPath(root, file, "verification runtime lifecycle declaration");
    if (!fs.lstatSync(file).isFile()) throw new Error("lifecycle declaration must be a regular file");
    const raw = fs.readFileSync(file, "utf8");
    const value = JSON.parse(raw);
    const errors = lifecycleDeclarationErrors(value, root);
    return {
      status: errors.length ? "INVALID" : "RECORDED",
      file,
      relative,
      digest: canonicalFileDigest(file),
      value,
      errors,
    };
  } catch (error) {
    return { status: "INVALID", file, relative, digest: "", value: null, errors: [error.message] };
  }
}

export function lifecycleDeclarationErrors(value, projectRoot = ".") {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) return ["lifecycle declaration must be an object"];
  const allowedRoot = new Set(["version", "adapter_kind", "actions", "resources"]);
  for (const key of Object.keys(value)) if (!allowedRoot.has(key)) errors.push(`unknown lifecycle declaration field ${key}`);
  if (value.version !== LIFECYCLE_VERSION) errors.push(`lifecycle declaration version must be ${LIFECYCLE_VERSION}`);
  if (!["COMMAND_ONLY", "LOCAL_PROCESS", "STATIC_BUILD", "PROJECT_NATIVE"].includes(value.adapter_kind)) {
    errors.push("lifecycle declaration adapter_kind is not executable by the 1.103 local lifecycle core");
  }
  if (!Array.isArray(value.actions) || value.actions.length === 0) errors.push("lifecycle declaration actions must be a non-empty array");
  if (!Array.isArray(value.resources)) errors.push("lifecycle declaration resources must be an array");

  const ids = new Set();
  for (const action of value.actions || []) {
    const prefix = action?.id ? `action ${action.id}` : "action <unknown>";
    if (!/^[a-zA-Z0-9:_-]+$/.test(action?.id || "")) errors.push(`${prefix} id is invalid`);
    if (ids.has(action?.id)) errors.push(`${prefix} id is duplicated`);
    ids.add(action?.id);
    if (!["PREPARE", "START_SERVICE", "VERIFY"].includes(action?.phase)) errors.push(`${prefix} phase is invalid`);
    if (!["COMMAND", "SERVICE", "PROBE"].includes(action?.kind)) errors.push(`${prefix} kind is invalid`);
    if (action?.phase === "START_SERVICE" && action?.kind !== "SERVICE") errors.push(`${prefix} START_SERVICE must use SERVICE kind`);
    if (action?.kind === "SERVICE" && action?.phase !== "START_SERVICE") errors.push(`${prefix} SERVICE must use START_SERVICE phase`);
    if (action?.kind === "SERVICE" && !SAFE_SERVICE_EXECUTABLES.has(path.basename(action?.argv?.[0] || "").toLowerCase())) {
      errors.push(`${prefix} SERVICE must use a direct long-lived runtime executable`);
    }
    errors.push(...safeLifecycleCommandErrors(action).map((error) => `${prefix} ${error}`));
    if ((action?.obligation_ids || []).some((item) => OBLIGATION_SELECTORS.has(item))
      && action.obligation_ids.length !== 1) {
      errors.push(`${prefix} current obligation expansion must be the only declared obligation selector`);
    }
  }

  const resourceIds = new Set();
  for (const resource of value.resources || []) {
    const prefix = resource?.resource_id ? `resource ${resource.resource_id}` : "resource <unknown>";
    if (!/^[a-zA-Z0-9:_-]+$/.test(resource?.resource_id || "")) errors.push(`${prefix} id is invalid`);
    if (resourceIds.has(resource?.resource_id)) errors.push(`${prefix} id is duplicated`);
    resourceIds.add(resource?.resource_id);
    if (!["DATABASE_FILE", "CACHE_NAMESPACE", "SESSION_NAMESPACE", "FILE_NAMESPACE"].includes(resource?.resource_type)) errors.push(`${prefix} type is invalid`);
    if (!isSafeRunRelativePath(resource?.relative_path)) errors.push(`${prefix} relative_path must stay inside the run workspace`);
    if (!/^[A-Z_][A-Z0-9_]*$/.test(resource?.environment_name || "")) errors.push(`${prefix} environment_name is invalid`);
    if (BLOCKED_ENV_PATTERN.test(resource?.environment_name || "")) errors.push(`${prefix} environment_name is sensitive or ambiguous`);
    if (resource?.production_instance !== "No" || resource?.shared_resource !== "No") errors.push(`${prefix} must be non-production and non-shared`);
    if (resource?.cleanup_strategy !== "REMOVE_OWNED_PATH") errors.push(`${prefix} cleanup_strategy must be REMOVE_OWNED_PATH in 1.103`);
    if (!ids.has(resource?.created_by_action) && resource?.created_by_action !== "executor:preflight") errors.push(`${prefix} created_by_action is unresolved`);
  }

  for (const action of value.actions || []) {
    for (const dependency of action.depends_on || []) if (!ids.has(dependency)) errors.push(`action ${action.id} depends on unknown action ${dependency}`);
    for (const resourceId of action.resource_ids || []) if (!resourceIds.has(resourceId)) errors.push(`action ${action.id} references unknown resource ${resourceId}`);
  }
  if (hasDependencyCycle(value.actions || [])) errors.push("lifecycle declaration action graph contains a cycle");

  const root = path.resolve(projectRoot);
  for (const action of value.actions || []) {
    const cwd = path.resolve(root, action.cwd || ".");
    if (!inside(root, cwd)) errors.push(`action ${action.id} cwd escapes the project`);
    if (fs.existsSync(cwd)) {
      try { assertNoSymlinkInPath(root, cwd, `action ${action.id} cwd`); } catch (error) { errors.push(error.message); }
    }
  }
  return errors;
}

export function safeLifecycleCommandErrors(action) {
  const errors = [];
  if (!Array.isArray(action?.argv) || action.argv.length === 0 || action.argv.some((item) => typeof item !== "string" || !item.trim())) {
    return ["argv must be a non-empty string array"];
  }
  const executable = path.basename(action.argv[0]).toLowerCase();
  if (action.argv[0] !== path.basename(action.argv[0])) errors.push("executable must be a bare allowlisted name without a path");
  if (FORBIDDEN_EXECUTABLES.has(executable)) errors.push(`executable ${executable} is forbidden`);
  if (!SAFE_EXECUTABLES.has(executable)) errors.push(`executable ${executable} is not in the bounded local allowlist`);
  if (action.argv.some((item) => SHELL_TOKEN_PATTERN.test(item))) errors.push("argv contains shell control syntax");
  if (action.argv.some((item) => EXTERNAL_EFFECT_PATTERN.test(item))) errors.push("argv contains a release, production, deploy, publish, apply, or destroy effect marker");
  if (!isSafeCwd(action?.cwd || ".")) errors.push("cwd must be project-relative");
  if (!Number.isInteger(action?.timeout_ms) || action.timeout_ms < 100 || action.timeout_ms > 1_800_000) errors.push("timeout_ms must be between 100 and 1800000");
  if (!Array.isArray(action?.environment)) errors.push("environment must be an array");
  for (const entry of action?.environment || []) {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(entry?.name || "")) errors.push("environment name is invalid");
    if (entry?.name === "PATH") errors.push("environment PATH cannot be overridden by a lifecycle action");
    if (BLOCKED_ENV_PATTERN.test(entry?.name || "")) errors.push(`environment name ${entry.name} is blocked`);
    if (typeof entry?.value !== "string" || entry.value.length > 500) errors.push(`environment ${entry?.name || "<unknown>"} value is invalid`);
    if (looksSecretLike(entry?.value || "")) errors.push(`environment ${entry?.name || "<unknown>"} value looks secret-like or credential-bearing`);
  }
  if (!Array.isArray(action?.obligation_ids) || !Array.isArray(action?.resource_ids) || !Array.isArray(action?.depends_on)) errors.push("obligation_ids, resource_ids, and depends_on must be arrays");
  if (!/^(Yes|No)$/.test(action?.positive_path || "") || !/^(Yes|No)$/.test(action?.negative_path || "")) errors.push("positive_path and negative_path must be Yes or No");
  if (action?.external_effect !== "No") errors.push("external_effect must be No");
  return errors;
}

export function lifecyclePlanSemanticErrors(plan, runtimePlan, declaration, currentIdentity, projectRoot = ".") {
  const errors = [];
  if (!runtimePlan) return ["referenced Verification Runtime Plan is required"];
  if (plan?.schema_version !== LIFECYCLE_VERSION) errors.push(`schema_version must be ${LIFECYCLE_VERSION}`);
  if (plan?.artifact_type !== "verification_runtime_lifecycle_plan") errors.push("artifact_type must be verification_runtime_lifecycle_plan");
  if (runtimePlan?.outcome !== "RUNTIME_PLAN_READY") errors.push("referenced Verification Runtime Plan must be ready");
  errors.push(...planSemanticErrors(runtimePlan).map((error) => `referenced Runtime Plan ${error}`));
  for (const field of ["task_ref", "intent_digest", "task_tier", "runtime_trust_level"]) {
    if (plan?.[field] !== runtimePlan?.[field]) errors.push(`${field} must match the Runtime Plan`);
  }
  if (plan?.runtime_plan_digest !== runtimePlan?.runtime_plan_digest) errors.push("runtime_plan_digest must match the Runtime Plan");
  if (plan?.adapter_contract_digest !== runtimePlan?.adapter_selection?.contract_digest) errors.push("adapter_contract_digest must match the Runtime Plan");
  if (plan?.adapter_kind !== runtimePlan?.adapter_selection?.adapter_kind) errors.push("adapter_kind must match the Runtime Plan");
  const expectedMode = lifecycleExecutionMode(plan?.adapter_kind, plan?.task_tier, declaration);
  if (plan?.execution_mode !== expectedMode) errors.push(`execution_mode must be ${expectedMode}`);
  const expectedOutcome = ["NO_MANAGED_RUNTIME", "LOCAL_CONTROLLED"].includes(expectedMode) ? "LIFECYCLE_PLAN_READY" : "LIFECYCLE_PLAN_BLOCKED";
  if (plan?.outcome !== expectedOutcome) errors.push(`outcome must be ${expectedOutcome}`);
  if (!/^vrun-[a-z0-9][a-z0-9-]{5,80}$/.test(plan?.run_id || "")) errors.push("run_id is invalid");
  if (plan?.run_workspace !== `.intentos/runtime-runs/${plan?.run_id}`) errors.push("run_workspace must be the current run-scoped workspace");
  if (currentIdentity && JSON.stringify(plan?.authority_binding?.project) !== JSON.stringify(currentIdentity)) errors.push("authority project identity must match current project identity");

  if (!declaration || plan?.declaration_source?.status !== "RECORDED") errors.push("runtime execution requires a valid lifecycle declaration");
  if (declaration && plan?.declaration_source?.digest !== declaration.digest) errors.push("lifecycle declaration digest must match the current file");
  if (declaration?.value?.adapter_kind !== plan?.adapter_kind) errors.push("lifecycle declaration adapter_kind must match the Runtime Plan");

  const declarationActions = declaration?.value?.actions || [];
  const obligationResolution = verificationObligationSelectors(projectRoot, runtimePlan);
  if (!obligationResolution.ok) errors.push(...obligationResolution.errors);
  const expectedActions = normalizeActions(declarationActions, plan?.run_id, obligationResolution);
  if (JSON.stringify(plan?.actions || []) !== JSON.stringify(expectedActions)) errors.push("actions must exactly replay the lifecycle declaration and current required Verification Plan obligations");
  const coveredObligations = new Set((plan?.actions || []).flatMap((action) => action.obligation_ids || []));
  for (const id of obligationResolution.runtimeIds) {
    if (!coveredObligations.has(id)) errors.push(`runtime-required Verification Plan obligation ${id} is not covered by the lifecycle plan`);
  }
  const declarationResources = declaration?.value?.resources || [];
  if (JSON.stringify(plan?.resources || []) !== JSON.stringify(normalizeResources(declarationResources))) errors.push("resources must exactly replay the lifecycle declaration");
  for (const action of plan?.actions || []) errors.push(...safeLifecycleCommandErrors(action).map((error) => `action ${action.id} ${error}`));
  if (declaration) errors.push(...lifecycleDeclarationErrors(declaration.value, projectRoot).map((error) => `declaration ${error}`));

  if (plan?.environment_policy?.inherit_mode !== "MINIMAL_ALLOWLIST") errors.push("environment inheritance must use MINIMAL_ALLOWLIST");
  if (JSON.stringify(plan?.environment_policy?.allowed_inherited_names) !== JSON.stringify(SAFE_INHERITED_ENV)) errors.push("allowed inherited environment names must match the 1.103 allowlist");
  for (const [key, value] of Object.entries(plan?.boundaries || {})) if (value !== "No") errors.push(`boundary ${key} must remain No`);
  return errors;
}

export function normalizeActions(actions, runId, obligationSelectors = []) {
  const selectors = Array.isArray(obligationSelectors)
    ? { ids: obligationSelectors, runtimeIds: obligationSelectors, nonRuntimeIds: [] }
    : obligationSelectors;
  const normalized = [...(actions || [])].map((action) => ({
      id: action.id,
      phase: action.phase,
      kind: action.kind,
      argv: [...action.argv],
      cwd: action.cwd || ".",
      timeout_ms: action.timeout_ms,
      environment: [...(action.environment || [])].map((item) => ({ name: item.name, value: item.value })),
      output_ref: `file:.intentos/runtime-runs/${runId}/outputs/${action.id}.log`,
      obligation_ids: expandObligationIds(action.obligation_ids, selectors),
      positive_path: action.positive_path || "No",
      negative_path: action.negative_path || "No",
      resource_ids: [...(action.resource_ids || [])],
      external_effect: "No",
      depends_on: [...(action.depends_on || [])],
    }));
  return orderActions(normalized);
}

export function requiredVerificationObligationIds(projectRoot, runtimePlan) {
  const result = verificationObligationSelectors(projectRoot, runtimePlan);
  return { ok: result.ok, ids: result.ids, errors: result.errors };
}

export function verificationObligationSelectors(projectRoot, runtimePlan) {
  const source = runtimePlan?.verification_plan_source || {};
  if (source.status !== "RECORDED") return { ok: true, ids: [], runtimeIds: [], nonRuntimeIds: [], errors: [] };
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", source.ref, { markdownOnly: true });
  if (!resolved.ok) return { ok: false, ids: [], runtimeIds: [], nonRuntimeIds: [], errors: [`Verification Plan obligation source is unsafe or unresolved: ${resolved.error}`] };
  const checked = validateEvidenceBlock(
    fs.readFileSync(resolved.file, "utf8"),
    loadSchema(projectRoot, "schemas/artifacts/verification-plan.schema.json"),
    "Verification Plan obligation source",
    { require: true, digestField: "verification_plan_digest" },
  );
  if (!checked.ok || checked.value?.artifact_type !== "verification_plan") {
    return { ok: false, ids: [], runtimeIds: [], nonRuntimeIds: [], errors: ["Verification Plan obligation source must contain valid verification_plan evidence"] };
  }
  if (checked.value.verification_plan_digest !== source.digest) return { ok: false, ids: [], runtimeIds: [], nonRuntimeIds: [], errors: ["Verification Plan obligation source digest is stale"] };
  if (checked.value.task_ref !== runtimePlan.task_ref || checked.value.intent_digest !== runtimePlan.intent_digest) {
    return { ok: false, ids: [], runtimeIds: [], nonRuntimeIds: [], errors: ["Verification Plan obligation source does not match the current runtime task and intent"] };
  }
  if (checked.value.authority_binding) {
    const authority = validateEvidenceAuthorityBinding(projectRoot, checked.value.authority_binding, {
      taskRef: checked.value.task_ref,
      intentDigest: checked.value.intent_digest,
      fromFile: resolved.file,
      sourceRefs: (checked.value.authority_binding.sources || []).map((item) => item.ref),
    });
    if (!authority.ok) {
      return { ok: false, ids: [], runtimeIds: [], nonRuntimeIds: [], errors: authority.errors.map((error) => `Verification Plan obligation authority is stale: ${error}`) };
    }
  }
  const obligations = (checked.value.verification_obligations || []).filter((item) => item?.required === "Yes");
  const runtimeIds = obligations
    .filter(runtimeTrustRequiredForObligation)
    .map((item) => String(item.id || "").trim())
    .filter(Boolean);
  const nonRuntimeIds = obligations
    .filter((item) => !runtimeTrustRequiredForObligation(item))
    .map((item) => String(item.id || "").trim())
    .filter(Boolean);
  return {
    ok: true,
    ids: [...new Set([...runtimeIds, ...nonRuntimeIds])].sort(),
    runtimeIds: [...new Set(runtimeIds)].sort(),
    nonRuntimeIds: [...new Set(nonRuntimeIds)].sort(),
    errors: [],
  };
}

function expandObligationIds(values, selectors) {
  const expanded = [];
  for (const value of values || []) {
    if (value === CURRENT_REQUIRED_OBLIGATIONS) expanded.push(...(selectors.ids || []));
    else if (value === CURRENT_RUNTIME_OBLIGATIONS) expanded.push(...(selectors.runtimeIds || []));
    else if (value === CURRENT_NON_RUNTIME_OBLIGATIONS) expanded.push(...(selectors.nonRuntimeIds || []));
    else expanded.push(value);
  }
  return [...new Set(expanded)].sort();
}

function runtimeTrustRequiredForObligation(obligation) {
  return obligation?.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF"
    || obligation?.source_surface === "RUNTIME_BEHAVIOR";
}

export function normalizeResources(resources) {
  return [...(resources || [])]
    .map((resource) => ({
      resource_id: resource.resource_id,
      resource_type: resource.resource_type,
      relative_path: resource.relative_path,
      environment_name: resource.environment_name,
      created_by_action: resource.created_by_action || "executor:preflight",
      cleanup_strategy: "REMOVE_OWNED_PATH",
      production_instance: "No",
      shared_resource: "No",
      owner_marker_required: "Yes",
      role: resource.role || "",
      migration_revision: resource.migration_revision || "not-recorded",
    }))
    .sort((left, right) => left.resource_id.localeCompare(right.resource_id));
}

export function environmentPolicy() {
  return {
    inherit_mode: "MINIMAL_ALLOWLIST",
    allowed_inherited_names: [...SAFE_INHERITED_ENV],
    blocked_name_patterns: ["SECRET", "TOKEN", "PASSWORD", "CREDENTIAL", "AUTH", "COOKIE", "DATABASE_URL", "REDIS_URL", "PRODUCTION"],
    inject_run_id: "Yes",
    inject_owner_token: "CHILD_MEMORY_ONLY",
    stores_raw_secrets: "No",
  };
}

export function lifecycleBoundaries() {
  return {
    uses_shell: "No",
    permits_external_effect: "No",
    permits_production: "No",
    permits_broad_cleanup: "No",
    stores_raw_owner_token: "No",
    asks_user_for_technical_choice: "No",
    approves_completion_or_release: "No",
  };
}

export function preflightExecutableErrors(plan, searchPath = process.env.PATH || "") {
  const errors = [];
  for (const action of plan?.actions || []) {
    if (!resolveExecutable(action.argv?.[0], searchPath)) errors.push(`action ${action.id} executable ${action.argv?.[0] || "<missing>"} is unavailable in the executor PATH`);
  }
  return errors;
}

export async function executeLifecyclePlan(projectRoot, plan, options = {}) {
  const root = path.resolve(projectRoot);
  const workspace = resolveUnderRoot(root, plan.run_workspace, "verification runtime run workspace");
  assertNoSymlinkInPath(root, path.dirname(workspace), "verification runtime run workspace parent");
  if (fs.existsSync(workspace)) throw new Error("run workspace already exists; refusing resource reuse");

  const ownerToken = crypto.randomBytes(32).toString("hex");
  const ownerTokenDigest = digestText(ownerToken);
  const ownerMarkerDigest = digestText(`${plan.run_id}|${ownerTokenDigest}`);
  const startedAt = new Date().toISOString();
  const state = {
    workspace,
    isolatedHome: null,
    journal: [],
    children: [],
    resources: [],
    executions: [],
    serviceInstances: [],
    failure: null,
    interrupted: false,
    cleanupBlocked: false,
    preflightPassed: false,
    preflightResults: [],
  };
  fs.mkdirSync(path.join(workspace, "outputs"), { recursive: true });
  fs.mkdirSync(path.join(workspace, "evidence"), { recursive: true });
  createIsolatedHome(state, ownerMarkerDigest, plan.run_id);
  const journalFile = path.join(workspace, "lifecycle-journal.jsonl");
  const cleanupBefore = path.join(workspace, "evidence", "cleanup-before.txt");
  const cleanupAfter = path.join(workspace, "evidence", "cleanup-after.txt");
  const record = (event, details = {}) => {
    const row = { at: new Date().toISOString(), event, ...details };
    state.journal.push(row);
    fs.appendFileSync(journalFile, `${JSON.stringify(row)}\n`);
  };

  const abortHandler = () => { state.interrupted = true; };
  options.signal?.addEventListener("abort", abortHandler);

  try {
    record("PREFLIGHT_RUNNING", { run_id: plan.run_id });
    const preflightFile = path.join(workspace, "evidence", "preflight.txt");
    const executableErrors = preflightExecutableErrors(plan);
    const preflight = await evaluateRuntimePreflight(root, plan, options.preflightRequirements || [], {
      sourceIdentity: options.sourceIdentity,
      workspaceWasAbsent: true,
      executableErrors,
    });
    state.preflightResults = preflight.results;
    fs.writeFileSync(preflightFile, preflightText(plan, preflight.results));
    for (const item of preflight.results) record("PREFLIGHT_PROBE_OBSERVED", { probe: item.probe, result: item.result, reason: item.reason });
    if (!preflight.ok) throw new Error(preflight.errors.join("; "));
    for (const action of plan.actions) record("EXECUTABLE_RESOLVED", { action_id: action.id, executable: resolveExecutable(action.argv[0], process.env.PATH || "") });
    record("PREFLIGHT_PASSED");
    state.preflightPassed = true;
    createOwnedResources(root, plan, state, ownerMarkerDigest, record);

    const completed = new Set();
    for (const action of plan.actions) {
      if (state.interrupted || options.signal?.aborted) throw new Error("verification runtime lifecycle interrupted");
      for (const dependency of action.depends_on) if (!completed.has(dependency)) throw new Error(`action ${action.id} dependency ${dependency} is incomplete`);
      if (action.kind === "SERVICE") {
        const observation = await startService(root, plan, action, state, ownerToken, ownerTokenDigest, record, options.signal);
        state.serviceInstances.push(observation);
      } else {
        const execution = await runCommand(root, plan, action, state, ownerToken, record, options.signal);
        state.executions.push(execution);
        if (execution.result !== "PASSED") throw new Error(`action ${action.id} failed with exit code ${execution.exit_code}`);
      }
      completed.add(action.id);
    }
  } catch (error) {
    state.failure = error;
    record(state.interrupted || options.signal?.aborted ? "INTERRUPTED" : "EXECUTION_FAILED", { reason: error.message });
  } finally {
    fs.writeFileSync(cleanupBefore, `run_id=${plan.run_id}\nresources_before_cleanup=${state.resources.filter((item) => !item.cleaned).length + state.children.filter((item) => !item.cleaned).length}\n`);
    record("CLEANUP_EVIDENCE_BEFORE_RECORDED");
    await cleanupOwnedResources(state, ownerMarkerDigest, ownerToken, record);
    options.signal?.removeEventListener("abort", abortHandler);
  }

  const finishedAt = new Date().toISOString();
  const resourceEvidence = path.join(workspace, "evidence", "resources.txt");
  fs.writeFileSync(cleanupAfter, `run_id=${plan.run_id}\nowned_resources_remaining=${ownedResourcesRemaining(state)}\nunrelated_resources_touched=0\ncleanup_blocked=${state.cleanupBlocked ? 1 : 0}\n`);
  fs.writeFileSync(resourceEvidence, resourceEvidenceText(plan, state, ownerMarkerDigest));
  record(state.cleanupBlocked ? "CLEANUP_BLOCKED" : state.failure ? (state.interrupted ? "INTERRUPTED_CLEANED" : "FAILED_CLEANED") : "COMPLETED");

  return {
    ok: !state.failure && !state.cleanupBlocked && ownedResourcesRemaining(state) === 0,
    interrupted: state.interrupted,
    failure: state.failure?.message || "",
    ownerTokenDigest,
    ownerMarkerDigest,
    startedAt,
    finishedAt,
    workspace,
    journalFile,
    preflightFile: path.join(workspace, "evidence", "preflight.txt"),
    cleanupBefore,
    cleanupAfter,
    resourceEvidence,
    serviceInstances: state.serviceInstances,
    executions: state.executions,
    resources: state.resources,
    cleanupBlocked: state.cleanupBlocked,
    preflightPassed: state.preflightPassed,
    preflightResults: state.preflightResults,
    ownedResourcesRemaining: ownedResourcesRemaining(state),
  };
}

async function startService(root, plan, action, state, ownerToken, ownerTokenDigest, record, signal) {
  record("ACTION_STARTING", { action_id: action.id, phase: action.phase, kind: action.kind });
  const cwd = boundedCwd(root, action.cwd, action.id);
  const outputFile = resolveOutputRef(root, action.output_ref);
  const child = spawn(action.argv[0], action.argv.slice(1), {
    cwd,
    env: childEnvironment(action, plan, state, ownerToken),
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
    detached: ownsProcessGroup(),
  });
  const observed = { child, action, outputFile, chunks: [], cleaned: false, startedAt: new Date().toISOString() };
  state.children.push(observed);
  child.on("error", (error) => { observed.spawnError = error; });
  child.stdout.on("data", (chunk) => collectChunk(observed, chunk));
  child.stderr.on("data", (chunk) => collectChunk(observed, chunk));
  const delay = Math.min(1000, Math.max(100, Math.floor(action.timeout_ms / 10)));
  await wait(delay, signal);
  if (observed.spawnError) {
    writeObservedOutput(observed, ownerToken);
    throw new Error(`service action ${action.id} failed to start: ${observed.spawnError.message}`);
  }
  if (hasExited(child)) {
    writeObservedOutput(observed, ownerToken);
    throw new Error(`service action ${action.id} exited before verification with code ${child.exitCode ?? child.signalCode}`);
  }
  record("SERVICE_OBSERVED", { action_id: action.id, pid: child.pid });
  return {
    id: `service:${action.id}`,
    adapter_kind: plan.adapter_kind,
    identity_status: "VERIFIED",
    identity_fields: serviceIdentityFields(plan.adapter_kind, child, action, cwd, ownerTokenDigest),
    started_at: observed.startedAt,
    owned_by_run: "Yes",
    evidence_file: outputFile,
  };
}

async function runCommand(root, plan, action, state, ownerToken, record, signal) {
  record("ACTION_STARTING", { action_id: action.id, phase: action.phase, kind: action.kind });
  const cwd = boundedCwd(root, action.cwd, action.id);
  const outputFile = resolveOutputRef(root, action.output_ref);
  const startedAt = new Date().toISOString();
  const result = await spawnBounded(action.argv, {
    cwd,
    env: childEnvironment(action, plan, state, ownerToken),
    timeoutMs: action.timeout_ms,
    signal,
  });
  const finishedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, redact(result.output, ownerToken));
  record("ACTION_FINISHED", { action_id: action.id, exit_code: result.exitCode, timed_out: result.timedOut });
  return {
    id: action.id,
    result: result.exitCode === 0 && !result.timedOut ? "PASSED" : "FAILED",
    command_digest: digestText(JSON.stringify(action.argv)),
    started_at: startedAt,
    finished_at: finishedAt,
    exit_code: result.exitCode,
    output_file: outputFile,
    covers_obligations: [...action.obligation_ids],
    service_instance_ids: state.serviceInstances.map((item) => item.id),
    resource_ids: [...action.resource_ids],
    positive_path: action.positive_path,
    negative_path: action.negative_path,
  };
}

async function cleanupOwnedResources(state, ownerMarkerDigest, ownerToken, record) {
  record("CLEANING_UP");
  for (const observed of [...state.children].reverse()) {
    if (observed.cleaned) continue;
    try {
      await stopOwnedProcessTree(observed.child, 1500);
      writeObservedOutput(observed, ownerToken);
      observed.cleaned = hasExited(observed.child) && !ownedProcessGroupAlive(observed.child);
      if (!observed.cleaned) state.cleanupBlocked = true;
      record(observed.cleaned ? "PROCESS_CLEANED" : "PROCESS_CLEANUP_BLOCKED", { action_id: observed.action.id, pid: observed.child.pid });
    } catch (error) {
      state.cleanupBlocked = true;
      record("PROCESS_CLEANUP_BLOCKED", { action_id: observed.action.id, reason: error.message });
    }
  }
  for (const resource of [...state.resources].reverse()) {
    if (resource.cleaned) continue;
    try {
      const marker = fs.existsSync(resource.markerFile) ? fs.readFileSync(resource.markerFile, "utf8").trim() : "";
      if (marker !== ownerMarkerDigest) throw new Error("owner marker mismatch");
      assertNoSymlinkInPath(state.workspace, resource.path, `resource ${resource.resource_id}`);
      fs.rmSync(resource.path, { recursive: true, force: false });
      resource.cleaned = !fs.existsSync(resource.path);
      record(resource.cleaned ? "RESOURCE_CLEANED" : "RESOURCE_CLEANUP_BLOCKED", { resource_id: resource.resource_id });
      if (!resource.cleaned) state.cleanupBlocked = true;
    } catch (error) {
      state.cleanupBlocked = true;
      record("RESOURCE_CLEANUP_BLOCKED", { resource_id: resource.resource_id, reason: error.message });
    }
  }
  cleanupIsolatedHome(state, ownerMarkerDigest);
}

function createIsolatedHome(state, ownerMarkerDigest, runId) {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const runSlug = String(runId || "run").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 48) || "run";
  const homePath = fs.mkdtempSync(path.join(tempRoot, `intentos-runtime-${runSlug}-`));
  const markerFile = path.join(homePath, ".intentos-owner");
  fs.writeFileSync(markerFile, `${ownerMarkerDigest}\n`);
  state.isolatedHome = { path: homePath, markerFile, tempRoot, cleaned: false };
}

function cleanupIsolatedHome(state, ownerMarkerDigest) {
  const home = state.isolatedHome;
  if (!home || home.cleaned) return;
  try {
    const marker = fs.existsSync(home.markerFile) ? fs.readFileSync(home.markerFile, "utf8").trim() : "";
    if (marker !== ownerMarkerDigest) throw new Error("isolated HOME owner marker mismatch");
    if (!inside(home.tempRoot, home.path)) throw new Error("isolated HOME escaped the executor temp root");
    assertNoSymlinkInPath(home.tempRoot, home.path, "verification runtime isolated HOME");
    fs.rmSync(home.path, { recursive: true, force: false });
    home.cleaned = !fs.existsSync(home.path);
    if (!home.cleaned) state.cleanupBlocked = true;
  } catch {
    state.cleanupBlocked = true;
  }
}

function createOwnedResources(root, plan, state, ownerMarkerDigest, record) {
  for (const resource of plan.resources) {
    const resourcePath = path.resolve(state.workspace, resource.relative_path);
    if (!inside(state.workspace, resourcePath)) throw new Error(`resource ${resource.resource_id} escapes the run workspace`);
    if (fs.existsSync(resourcePath)) throw new Error(`resource ${resource.resource_id} already exists`);
    fs.mkdirSync(resourcePath, { recursive: true });
    const markerFile = path.join(resourcePath, ".intentos-owner");
    fs.writeFileSync(markerFile, `${ownerMarkerDigest}\n`);
    state.resources.push({ ...resource, path: resourcePath, markerFile, cleaned: false });
    record("RESOURCE_CREATED", { resource_id: resource.resource_id, resource_type: resource.resource_type });
  }
}

function childEnvironment(action, plan, state, ownerToken) {
  const env = {};
  for (const name of SAFE_INHERITED_ENV) if (process.env[name] !== undefined) env[name] = process.env[name];
  env.HOME = state.isolatedHome.path;
  env.XDG_CACHE_HOME = state.isolatedHome.path;
  env.TMPDIR = state.isolatedHome.path;
  env.TMP = state.isolatedHome.path;
  env.TEMP = state.isolatedHome.path;
  for (const entry of action.environment) env[entry.name] = entry.value;
  env.INTENTOS_RUN_ID = plan.run_id;
  env.INTENTOS_OWNER_TOKEN = ownerToken;
  for (const resource of state.resources) env[resource.environment_name] = resource.path;
  return env;
}

function serviceIdentityFields(adapterKind, child, action, cwd, ownerTokenDigest) {
  const values = {
    pid: String(child.pid),
    argv: JSON.stringify(action.argv),
    cwd,
    build_id: `${action.id}:${ownerTokenDigest}`,
    target_id: action.id,
    artifact_digest: digestText(JSON.stringify(action.argv)),
    build_digest: digestText(JSON.stringify(action.argv)),
    serve_origin: "local-run-owned-process",
  };
  const required = adapterKind === "PROJECT_NATIVE"
    ? ["build_id", "target_id", "artifact_digest"]
    : adapterKind === "STATIC_BUILD"
      ? ["build_digest", "serve_origin"]
      : ["pid", "argv", "cwd"];
  return required.map((name) => ({ name, value_digest: digestText(values[name]), redacted_display: `${name}:<recorded>` }));
}

function preflightText(plan, results = []) {
  return [
    `run_id=${plan.run_id}`,
    `runtime_plan_digest=${plan.runtime_plan_digest}`,
    `adapter_contract_digest=${plan.adapter_contract_digest}`,
    `adapter_kind=${plan.adapter_kind}`,
    `execution_mode=${plan.execution_mode}`,
    "external_effect=No",
    "production=No",
    "shell=No",
    "pre_existing_run_workspace=No",
    "sensitive_environment_forwarded=No",
    ...results.map((item) => `probe=${JSON.stringify(item)}`),
    "",
  ].join("\n");
}

async function evaluateRuntimePreflight(root, plan, requirements, observations = {}) {
  const results = [];
  const add = (probe, required, pass, reason) => {
    results.push({ probe, required, result: pass ? "PASS" : "BLOCKED", reason });
  };
  add(
    "EXECUTABLE_AVAILABILITY",
    "Yes",
    observations.executableErrors.length === 0,
    observations.executableErrors.length === 0
      ? `all ${plan.actions.length} declared executables resolved in the bounded executor PATH`
      : observations.executableErrors.join("; "),
  );

  const identity = observations.sourceIdentity || projectIdentity(root);
  const expectedIdentity = plan?.authority_binding?.project || null;
  const identityMatches = !expectedIdentity || JSON.stringify(identity) === JSON.stringify(expectedIdentity);
  const ports = declaredPorts(plan);
  const portObservations = await Promise.all(ports.map(async (port) => ({ port, available: await portIsAvailable(port) })));
  const oldProcessObservation = observeExistingServiceProcesses(plan);
  const resourcePaths = (plan.resources || []).map((item) => path.resolve(plan.run_workspace ? path.join(root, plan.run_workspace) : root, item.relative_path));

  for (const item of requirements) {
    const required = item.required === "Yes" ? "Yes" : "No";
    switch (item.probe) {
      case "SOURCE_IDENTITY":
        add(item.probe, required, identityMatches, identityMatches ? `current project identity matches ${identity.revision || "the bound source revision"}` : "current project identity does not match the lifecycle authority binding");
        break;
      case "WORKTREE_STATE":
        add(item.probe, required, identityMatches, identityMatches ? "the exact pre-run worktree identity was captured for post-run comparison" : "the pre-run worktree differs from the reviewed lifecycle plan");
        break;
      case "OLD_PROCESS":
        add(
          item.probe,
          required,
          observations.workspaceWasAbsent === true && oldProcessObservation.matches.length === 0,
          oldProcessObservation.matches.length > 0
            ? `pre-existing declared service process detected: ${oldProcessObservation.matches.join(", ")}`
            : oldProcessObservation.available
              ? "no process with an exact declared SERVICE argv was running before this run"
              : `${oldProcessObservation.reason}; the run workspace is new, every service is spawned with a fresh owner token, and reusable network endpoints are independently bind-probed`,
        );
        break;
      case "PORT_CONFLICT": {
        const unavailable = portObservations.filter((entry) => !entry.available).map((entry) => entry.port);
        add(item.probe, required, unavailable.length === 0, ports.length === 0 ? "no network port is declared or reused by this lifecycle" : unavailable.length === 0 ? `declared ports were bind-probed and are available: ${ports.join(", ")}` : `declared ports are unavailable: ${unavailable.join(", ")}`);
        break;
      }
      case "SENSITIVE_ENVIRONMENT": {
        const forwarded = [...SAFE_INHERITED_ENV, ...(plan.actions || []).flatMap((action) => (action.environment || []).map((entry) => entry.name))].filter((name) => BLOCKED_ENV_PATTERN.test(name));
        add(item.probe, required, forwarded.length === 0, forwarded.length === 0 ? `child environment is rebuilt from the non-sensitive allowlist: ${SAFE_INHERITED_ENV.join(", ")}` : `sensitive environment names would be forwarded: ${forwarded.join(", ")}`);
        break;
      }
      case "DATA_IDENTITY": {
        const unsafe = (plan.resources || []).filter((resource, index) => resource.production_instance !== "No" || resource.shared_resource !== "No" || !inside(path.join(root, plan.run_workspace), resourcePaths[index]) || fs.existsSync(resourcePaths[index]));
        add(item.probe, required, unsafe.length === 0 && observations.workspaceWasAbsent === true, unsafe.length === 0 ? `all ${(plan.resources || []).length} declared resources are new run-scoped, non-production, and non-shared paths` : `unsafe or pre-existing resource declarations: ${unsafe.map((entry) => entry.resource_id).join(", ")}`);
        break;
      }
      case "SESSION_RESIDUE": {
        const sessions = (plan.resources || []).filter((resource) => resource.resource_type === "SESSION_NAMESPACE");
        const residue = sessions.filter((resource) => fs.existsSync(path.resolve(path.join(root, plan.run_workspace), resource.relative_path)));
        add(item.probe, required, observations.workspaceWasAbsent === true && residue.length === 0, residue.length === 0 ? `no run-scoped session namespace existed before execution (${sessions.length} declared)` : `pre-existing session namespaces detected: ${residue.map((entry) => entry.resource_id).join(", ")}`);
        break;
      }
      case "PRODUCTION_RESOURCE_GUARD": {
        const unsafeActions = (plan.actions || []).filter((action) => action.external_effect !== "No" || (action.argv || []).some((part) => EXTERNAL_EFFECT_PATTERN.test(part)));
        const unsafeResources = (plan.resources || []).filter((resource) => resource.production_instance !== "No" || resource.shared_resource !== "No");
        add(item.probe, required, unsafeActions.length === 0 && unsafeResources.length === 0, unsafeActions.length === 0 && unsafeResources.length === 0 ? "all actions and resources are explicitly non-production and contain no external-effect command marker" : "a production, shared, or external-effect declaration is present");
        break;
      }
      default:
        add(item.probe, required, required !== "Yes", required === "Yes" ? "required preflight probe has no trusted executor implementation" : "optional probe is not implemented");
    }
  }
  const errors = results.filter((item) => item.required === "Yes" && item.result !== "PASS").map((item) => `${item.probe}: ${item.reason}`);
  return { ok: errors.length === 0, results, errors };
}

function declaredPorts(plan) {
  const ports = new Set();
  for (const action of plan.actions || []) {
    for (const entry of action.environment || []) {
      if (/(^|_)PORT$/i.test(entry.name || "") && /^\d+$/.test(entry.value || "")) ports.add(Number(entry.value));
    }
    for (let index = 0; index < (action.argv || []).length; index += 1) {
      const value = action.argv[index];
      const inline = String(value || "").match(/^--?port=(\d+)$/i);
      if (inline) ports.add(Number(inline[1]));
      if (/^(?:--port|-p)$/i.test(String(value || "")) && /^\d+$/.test(String(action.argv[index + 1] || ""))) ports.add(Number(action.argv[index + 1]));
    }
  }
  return [...ports].filter((port) => Number.isInteger(port) && port > 0 && port <= 65535).sort((left, right) => left - right);
}

function portIsAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => server.close(() => resolve(true)));
  });
}

function observeExistingServiceProcesses(plan) {
  const services = (plan.actions || []).filter((action) => action.kind === "SERVICE");
  if (services.length === 0) return { available: true, matches: [], reason: "no service process is declared" };
  if (process.platform === "win32") return { available: false, matches: [], reason: "process inventory is unavailable on this executor" };
  const observed = spawnSync("ps", ["-axo", "pid=,command="], { encoding: "utf8", timeout: 5000 });
  if (observed.status !== 0) return { available: false, matches: [], reason: "process inventory probe is unavailable on this executor" };
  const lines = String(observed.stdout || "").split(/\r?\n/).filter(Boolean);
  const matches = services.flatMap((action) => {
    const signature = action.argv.join(" ");
    return lines.filter((line) => line.includes(signature) && !line.includes("ps -axo")).map((line) => line.trim().split(/\s+/, 1)[0]);
  });
  return { available: true, matches, reason: "process inventory was observed" };
}

function resourceEvidenceText(plan, state, ownerMarkerDigest) {
  const lines = [`run_id=${plan.run_id}`, `owner_marker_digest=${ownerMarkerDigest}`];
  for (const item of state.resources) lines.push(`${item.resource_id}:${item.resource_type}:cleaned=${item.cleaned ? "Yes" : "No"}`);
  for (const item of state.children) lines.push(`process:${item.action.id}:pid=${item.child.pid}:cleaned=${item.cleaned ? "Yes" : "No"}`);
  lines.push("");
  return lines.join("\n");
}

function ownedResourcesRemaining(state) {
  return state.resources.filter((item) => !item.cleaned).length
    + state.children.filter((item) => !item.cleaned).length
    + (state.isolatedHome && !state.isolatedHome.cleaned ? 1 : 0);
}

function boundedCwd(root, relative, actionId) {
  if (!isSafeCwd(relative || ".")) throw new Error(`action ${actionId} cwd is unsafe`);
  const cwd = path.resolve(root, relative || ".");
  if (!inside(root, cwd) || !fs.existsSync(cwd) || !fs.lstatSync(cwd).isDirectory()) throw new Error(`action ${actionId} cwd is unavailable`);
  assertNoSymlinkInPath(root, cwd, `action ${actionId} cwd`);
  return cwd;
}

function resolveOutputRef(root, ref) {
  const relative = String(ref || "").replace(/^file:/, "");
  if (!isSafeRelativePath(relative) || !/^\.intentos\/runtime-runs\/vrun-[a-z0-9-]+\/outputs\/[a-zA-Z0-9:_-]+\.log$/.test(relative)) {
    throw new Error("action output_ref must stay in the current run outputs directory");
  }
  return resolveUnderRoot(root, relative, "verification runtime action output");
}

function compareActions(left, right) {
  const phaseRank = { PREPARE: 10, START_SERVICE: 20, VERIFY: 30 };
  return (phaseRank[left.phase] || 99) - (phaseRank[right.phase] || 99) || left.id.localeCompare(right.id);
}

function orderActions(actions) {
  const byId = new Map(actions.map((item) => [item.id, item]));
  const remainingDependencies = new Map(actions.map((item) => [item.id, new Set(item.depends_on || [])]));
  const ordered = [];
  while (ordered.length < actions.length) {
    const ready = actions
      .filter((item) => !ordered.includes(item) && remainingDependencies.get(item.id).size === 0)
      .sort(compareActions);
    if (!ready.length) return [...actions].sort(compareActions);
    for (const item of ready) {
      ordered.push(item);
      for (const dependencies of remainingDependencies.values()) dependencies.delete(item.id);
    }
  }
  return ordered;
}

function hasDependencyCycle(actions) {
  const byId = new Map(actions.map((item) => [item.id, item]));
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) return true;
    if (visited.has(id) || !byId.has(id)) return false;
    visiting.add(id);
    for (const dependency of byId.get(id).depends_on || []) if (visit(dependency)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return [...byId.keys()].some(visit);
}

function spawnBounded(argv, options) {
  return new Promise((resolve) => {
    const child = spawn(argv[0], argv.slice(1), {
      cwd: options.cwd,
      env: options.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      detached: ownsProcessGroup(),
    });
    const chunks = [];
    let timedOut = false;
    let abortKillTimer;
    const collect = (chunk) => { if (chunks.reduce((sum, item) => sum + item.length, 0) < 8 * 1024 * 1024) chunks.push(Buffer.from(chunk)); };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    const timer = setTimeout(() => {
      timedOut = true;
      if (!hasExited(child)) signalOwnedProcess(child, "SIGTERM");
      setTimeout(() => { if (!hasExited(child)) signalOwnedProcess(child, "SIGKILL"); }, 1000).unref();
    }, options.timeoutMs);
    const abort = () => {
      if (!hasExited(child)) signalOwnedProcess(child, "SIGTERM");
      abortKillTimer = setTimeout(() => { if (!hasExited(child)) signalOwnedProcess(child, "SIGKILL"); }, 1000);
      abortKillTimer.unref();
    };
    options.signal?.addEventListener("abort", abort);
    child.on("error", (error) => {
      clearTimeout(timer);
      clearTimeout(abortKillTimer);
      options.signal?.removeEventListener("abort", abort);
      resolve({ exitCode: -1, timedOut, output: `${error.message}\n` });
    });
    child.on("close", async (code, signal) => {
      clearTimeout(timer);
      clearTimeout(abortKillTimer);
      options.signal?.removeEventListener("abort", abort);
      let cleanupError = "";
      try {
        await stopOwnedProcessTree(child, 250);
      } catch (error) {
        cleanupError = `\nprocess_tree_cleanup_error=${error.message}`;
      }
      resolve({ exitCode: cleanupError ? -1 : Number.isInteger(code) ? code : -1, timedOut, output: `${Buffer.concat(chunks).toString("utf8")}\nprocess_signal=${signal || "none"}${cleanupError}\n` });
    });
  });
}

function collectChunk(observed, chunk) {
  const current = observed.chunks.reduce((sum, item) => sum + item.length, 0);
  if (current < 8 * 1024 * 1024) observed.chunks.push(Buffer.from(chunk));
}

function writeObservedOutput(observed, ownerToken) {
  fs.mkdirSync(path.dirname(observed.outputFile), { recursive: true });
  const processState = hasExited(observed.child) ? "exited" : "running";
  const output = `${Buffer.concat(observed.chunks).toString("utf8")}\nprocess_state=${processState}\nprocess_exit_code=${observed.child.exitCode ?? "none"}\nprocess_signal=${observed.child.signalCode ?? "none"}\n`;
  fs.writeFileSync(observed.outputFile, redact(output, ownerToken));
}

function redact(value, ownerToken) {
  return ownerToken ? String(value).split(ownerToken).join("[REDACTED_OWNER_TOKEN]") : String(value);
}

function wait(milliseconds, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("verification runtime lifecycle interrupted"));
    const finish = () => { signal?.removeEventListener("abort", abort); resolve(); };
    const timer = setTimeout(finish, milliseconds);
    const abort = () => { clearTimeout(timer); reject(new Error("verification runtime lifecycle interrupted")); };
    signal?.addEventListener("abort", abort, { once: true });
  });
}

function waitForExit(child, milliseconds) {
  if (hasExited(child)) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, milliseconds);
    child.once("close", () => { clearTimeout(timer); resolve(); });
  });
}

function hasExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

function ownsProcessGroup() {
  return process.platform !== "win32";
}

function signalOwnedProcess(child, signal) {
  if (!child || !Number.isInteger(child.pid) || child.pid <= 0) return;
  if (ownsProcessGroup()) {
    try {
      process.kill(-child.pid, signal);
      return;
    } catch (error) {
      if (error?.code !== "ESRCH") throw error;
    }
  }
  try {
    child.kill(signal);
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

async function stopOwnedProcessTree(child, graceMs) {
  if (!child) return;
  if (!hasExited(child) || ownedProcessGroupAlive(child)) signalOwnedProcess(child, "SIGTERM");
  await waitForExit(child, graceMs);
  if (ownsProcessGroup()) await waitForProcessGroupExit(child, graceMs);
  if (!hasExited(child) || ownedProcessGroupAlive(child)) signalOwnedProcess(child, "SIGKILL");
  await waitForExit(child, graceMs);
  if (ownsProcessGroup()) await waitForProcessGroupExit(child, graceMs);
}

function ownedProcessGroupAlive(child) {
  if (!ownsProcessGroup() || !child || !Number.isInteger(child.pid) || child.pid <= 0) return false;
  try {
    process.kill(-child.pid, 0);
    return true;
  } catch (error) {
    if (error?.code === "ESRCH") return false;
    throw error;
  }
}

function waitForProcessGroupExit(child, milliseconds) {
  if (!ownedProcessGroupAlive(child)) return Promise.resolve();
  return new Promise((resolve) => {
    const deadline = Date.now() + milliseconds;
    const poll = () => {
      if (!ownedProcessGroupAlive(child) || Date.now() >= deadline) resolve();
      else setTimeout(poll, 25);
    };
    poll();
  });
}

function looksSecretLike(value) {
  return /(?:https?:\/\/[^\s/:]+:[^\s/@]+@|-----BEGIN [A-Z ]+PRIVATE KEY-----|\b(?:ghp|github_pat|sk_live|sk_test)_[A-Za-z0-9_-]{8,})/.test(String(value));
}

function resolveExecutable(executable, searchPath) {
  if (!executable || executable !== path.basename(executable)) return "";
  const extensions = process.platform === "win32" ? String(process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";") : [""];
  for (const directory of String(searchPath || "").split(path.delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = path.join(directory, `${executable}${extension}`);
      try {
        fs.accessSync(candidate, fs.constants.X_OK);
        if (fs.lstatSync(candidate).isFile() || fs.lstatSync(candidate).isSymbolicLink()) return fs.realpathSync(candidate);
      } catch {
        // Continue through the bounded PATH search.
      }
    }
  }
  return "";
}

function isSafeRunRelativePath(value) {
  return isSafeRelativePath(value || "") && !String(value).startsWith(".intentos/") && !String(value).startsWith("verification-run-manifests/");
}

function isSafeCwd(value) {
  return value === "." || isSafeRelativePath(value);
}

function inside(root, candidate) {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
