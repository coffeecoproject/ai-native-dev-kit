import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { canonicalFileDigest } from "./evidence-authority.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath, resolveUnderRoot } from "./path-safety.mjs";
import { digestText, planSemanticErrors } from "./verification-runtime-trust.mjs";

export const LIFECYCLE_VERSION = "1.103.0";
export const LIFECYCLE_DECLARATION_REF = "file:.intentos/verification-runtime-lifecycle.json";

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
const SAFE_INHERITED_ENV = ["PATH", "HOME", "TMPDIR", "TMP", "TEMP", "LANG", "LC_ALL", "CI", "TERM"];
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
  if (!Number.isInteger(action?.timeout_ms) || action.timeout_ms < 100 || action.timeout_ms > 900000) errors.push("timeout_ms must be between 100 and 900000");
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
  if (JSON.stringify(plan?.actions || []) !== JSON.stringify(normalizeActions(declarationActions, plan?.run_id))) errors.push("actions must exactly replay the lifecycle declaration");
  const declarationResources = declaration?.value?.resources || [];
  if (JSON.stringify(plan?.resources || []) !== JSON.stringify(normalizeResources(declarationResources))) errors.push("resources must exactly replay the lifecycle declaration");
  for (const action of plan?.actions || []) errors.push(...safeLifecycleCommandErrors(action).map((error) => `action ${action.id} ${error}`));
  if (declaration) errors.push(...lifecycleDeclarationErrors(declaration.value, projectRoot).map((error) => `declaration ${error}`));

  if (plan?.environment_policy?.inherit_mode !== "MINIMAL_ALLOWLIST") errors.push("environment inheritance must use MINIMAL_ALLOWLIST");
  if (JSON.stringify(plan?.environment_policy?.allowed_inherited_names) !== JSON.stringify(SAFE_INHERITED_ENV)) errors.push("allowed inherited environment names must match the 1.103 allowlist");
  for (const [key, value] of Object.entries(plan?.boundaries || {})) if (value !== "No") errors.push(`boundary ${key} must remain No`);
  return errors;
}

export function normalizeActions(actions, runId) {
  const normalized = [...(actions || [])].map((action) => ({
      id: action.id,
      phase: action.phase,
      kind: action.kind,
      argv: [...action.argv],
      cwd: action.cwd || ".",
      timeout_ms: action.timeout_ms,
      environment: [...(action.environment || [])].map((item) => ({ name: item.name, value: item.value })),
      output_ref: `file:.intentos/runtime-runs/${runId}/outputs/${action.id}.log`,
      obligation_ids: [...(action.obligation_ids || [])],
      positive_path: action.positive_path || "No",
      negative_path: action.negative_path || "No",
      resource_ids: [...(action.resource_ids || [])],
      external_effect: "No",
      depends_on: [...(action.depends_on || [])],
    }));
  return orderActions(normalized);
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
    journal: [],
    children: [],
    resources: [],
    executions: [],
    serviceInstances: [],
    failure: null,
    interrupted: false,
    cleanupBlocked: false,
  };
  fs.mkdirSync(path.join(workspace, "outputs"), { recursive: true });
  fs.mkdirSync(path.join(workspace, "evidence"), { recursive: true });
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
    fs.writeFileSync(preflightFile, preflightText(plan));
    const executableErrors = preflightExecutableErrors(plan);
    if (executableErrors.length) throw new Error(executableErrors.join("; "));
    for (const action of plan.actions) record("EXECUTABLE_RESOLVED", { action_id: action.id, executable: resolveExecutable(action.argv[0], process.env.PATH || "") });
    record("PREFLIGHT_PASSED");
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
      if (!hasExited(observed.child)) {
        observed.child.kill("SIGTERM");
        await waitForExit(observed.child, 1500);
        if (!hasExited(observed.child)) {
          observed.child.kill("SIGKILL");
          await waitForExit(observed.child, 1500);
        }
      }
      writeObservedOutput(observed, ownerToken);
      observed.cleaned = hasExited(observed.child);
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

function preflightText(plan) {
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
    "",
  ].join("\n");
}

function resourceEvidenceText(plan, state, ownerMarkerDigest) {
  const lines = [`run_id=${plan.run_id}`, `owner_marker_digest=${ownerMarkerDigest}`];
  for (const item of state.resources) lines.push(`${item.resource_id}:${item.resource_type}:cleaned=${item.cleaned ? "Yes" : "No"}`);
  for (const item of state.children) lines.push(`process:${item.action.id}:pid=${item.child.pid}:cleaned=${item.cleaned ? "Yes" : "No"}`);
  lines.push("");
  return lines.join("\n");
}

function ownedResourcesRemaining(state) {
  return state.resources.filter((item) => !item.cleaned).length + state.children.filter((item) => !item.cleaned).length;
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
    const child = spawn(argv[0], argv.slice(1), { cwd: options.cwd, env: options.env, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    const chunks = [];
    let timedOut = false;
    let abortKillTimer;
    const collect = (chunk) => { if (chunks.reduce((sum, item) => sum + item.length, 0) < 8 * 1024 * 1024) chunks.push(Buffer.from(chunk)); };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    const timer = setTimeout(() => {
      timedOut = true;
      if (!hasExited(child)) child.kill("SIGTERM");
      setTimeout(() => { if (!hasExited(child)) child.kill("SIGKILL"); }, 1000).unref();
    }, options.timeoutMs);
    const abort = () => {
      if (!hasExited(child)) child.kill("SIGTERM");
      abortKillTimer = setTimeout(() => { if (!hasExited(child)) child.kill("SIGKILL"); }, 1000);
      abortKillTimer.unref();
    };
    options.signal?.addEventListener("abort", abort);
    child.on("error", (error) => {
      clearTimeout(timer);
      clearTimeout(abortKillTimer);
      options.signal?.removeEventListener("abort", abort);
      resolve({ exitCode: -1, timedOut, output: `${error.message}\n` });
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      clearTimeout(abortKillTimer);
      options.signal?.removeEventListener("abort", abort);
      resolve({ exitCode: Number.isInteger(code) ? code : -1, timedOut, output: `${Buffer.concat(chunks).toString("utf8")}\nprocess_signal=${signal || "none"}\n` });
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
