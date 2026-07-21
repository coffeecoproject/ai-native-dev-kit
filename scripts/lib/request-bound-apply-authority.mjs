import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { evidenceDigest } from "./artifact-schema.mjs";
import { normalizePathList, sameSet } from "./approval-record-validation.mjs";

const REQUEST_AUTHORITY_VERSION = "1.113.0";
const REQUEST_AUTHORITY_MODE = "REQUEST_BOUND_LOCAL";
const REQUEST_READINESS_STATE = "READY_FOR_REQUEST_BOUND_LOCAL_APPLY";
const authorityLifetimeMs = 15 * 60 * 1000;
export const requestBoundPlanLifetimeMs = authorityLifetimeMs;
const CONSUMPTION_RECORD_VERSION = "1.113.0";

const forbiddenPathPatterns = [
  /^\.github\//,
  /^\.git\//,
  /^\.husky\//,
  /(^|\/)hooks?\//,
  /(^|\/)migrations?\//,
  /(^|\/)(deploy|deployment|infra|production|prod)\//,
  /(^|\/)(src|app|apps|services|packages)\//,
  /(^|\/)\.env(?:\.|$)/,
  /(^|\/)(secrets?|credentials?|certificates?|keys?)\//,
  /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/,
  /(^|\/)package\.json$/,
];

const generatedProjectDocs = new Set([
  "docs/project-onboarding.md",
  "docs/project-profile.md",
  "docs/tech-stack-strategy.md",
  "docs/business-spec-index.md",
  "docs/sample-policy.md",
  "docs/onboarding-decisions.md",
  "docs/verification-matrix.md",
  "docs/engineering-baseline.md",
  "docs/environment-baseline.md",
  "docs/baseline-selection.md",
  "docs/baseline-evidence.md",
]);

export function requestBoundTaskRef(goalDigest) {
  const hex = String(goalDigest || "").replace(/^sha256:/, "");
  return /^[a-f0-9]{64}$/.test(hex) ? `task:${hex}` : "N/A";
}

export function requestBoundSupportPaths(plan) {
  const suffix = runSuffix(plan);
  return [
    `.intentos/apply-authorities/request-${suffix}.json`,
    `apply-readiness-reports/request-${suffix}.md`,
  ];
}

export function requestBoundAuthorityConsumptionState(projectRoot, authorityDigest) {
  const file = requestBoundAuthorityConsumptionPath(projectRoot, authorityDigest);
  if (!fs.existsSync(file)) return { consumed: false, file, record: null, errors: [] };
  const errors = [];
  let record = null;
  try {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error("consumption record is not a non-symlink regular file");
    record = JSON.parse(fs.readFileSync(file, "utf8"));
    if (record?.schema_version !== CONSUMPTION_RECORD_VERSION) errors.push("consumption record schema version is invalid");
    if (record?.artifact_type !== "request_bound_apply_authority_consumption") errors.push("consumption record artifact type is invalid");
    if (record?.authority_digest !== authorityDigest) errors.push("consumption record authority digest mismatch");
    if (record?.project_root_digest !== digestContent(fs.realpathSync(projectRoot))) errors.push("consumption record project root mismatch");
    const { record_digest: _digest, ...base } = record || {};
    if (record?.record_digest !== evidenceDigest(base, [])) errors.push("consumption record digest is not canonical");
  } catch (error) {
    errors.push(error.message);
  }
  return { consumed: true, file, record, errors };
}

export function consumeRequestBoundApplyAuthority(authority, options = {}) {
  const validation = validateRequestBoundApplyAuthority(authority, options);
  if (!validation.ok) throw new Error(`request-bound apply authority cannot be consumed: ${validation.errors.join("; ")}`);
  const existing = requestBoundAuthorityConsumptionState(options.plan?.targetRoot, authority.authority_digest);
  if (existing.consumed) {
    throw new Error(`request-bound apply authority has already been consumed${existing.errors.length ? ` or its durable record is invalid: ${existing.errors.join("; ")}` : ""}`);
  }
  const base = {
    schema_version: CONSUMPTION_RECORD_VERSION,
    artifact_type: "request_bound_apply_authority_consumption",
    authority_digest: authority.authority_digest,
    project_root_digest: digestContent(fs.realpathSync(options.plan.targetRoot)),
    plan_digest: String(options.plan?.planDigest || ""),
    request_digest: String(authority?.request?.request_digest || ""),
    consumed_at: new Date(options.now || Date.now()).toISOString(),
    boundary: {
      project_local_effect_only: true,
      authorizes_replay: false,
      authorizes_external_effect: false,
    },
  };
  const record = { ...base, record_digest: evidenceDigest(base, []) };
  const file = existing.file;
  try {
    fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`, { flag: "wx", mode: 0o600 });
    const descriptor = fs.openSync(file, "r");
    try { fs.fsyncSync(descriptor); } finally { fs.closeSync(descriptor); }
    const parentDescriptor = fs.openSync(path.dirname(file), "r");
    try { fs.fsyncSync(parentDescriptor); } finally { fs.closeSync(parentDescriptor); }
  } catch (error) {
    if (error?.code === "EEXIST") throw new Error("request-bound apply authority has already been consumed");
    throw error;
  }
  return { file, record };
}

export function validateCurrentRequestForPlan(plan, options = {}) {
  const errors = [];
  const request = normalizeRequest(options.request);
  const plannedRequest = normalizeRequest(plan?.arguments?.goal);
  const requestDigest = String(options.requestDigest || "");
  const plannedDigest = String(plan?.arguments?.goalDigest || "");
  if (!request) errors.push("the active natural-language request is required for apply");
  if (!plannedRequest || !/^sha256:[a-f0-9]{64}$/.test(plannedDigest)) {
    errors.push("the apply plan has no exact original request binding");
  }
  if (request && plannedRequest && request !== plannedRequest) {
    errors.push("the active natural-language request does not exactly match the apply plan request");
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(requestDigest) || requestDigest !== plannedDigest) {
    errors.push("the active request digest does not exactly match the apply plan request digest");
  }

  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const createdAt = Date.parse(String(plan?.createdAt || ""));
  if (!Number.isFinite(createdAt)) {
    errors.push("the apply plan creation time is missing or invalid");
  } else if (createdAt > now + 60_000) {
    errors.push("the apply plan creation time is in the future");
  } else if (now - createdAt > requestBoundPlanLifetimeMs) {
    errors.push("the apply plan is stale for current request-bound authority");
  }
  return { ok: errors.length === 0, errors };
}

export function isRequestBoundLocalActionAllowed(action, plan, options = {}) {
  if (!action?.willWrite) return true;
  const target = normalizePath(action.path);
  const source = normalizePath(action.source);
  if (!target || forbiddenPathPatterns.some((pattern) => pattern.test(target))) return false;
  if (action.hashBefore
    && options.skipCurrentOwnershipCheck !== true
    && !hasVerifiedPriorOwnership(action, plan)) return false;
  if (action.type === "WRITE_APPLY_RECEIPT") {
    return target === normalizePath(plan?.receiptPath)
      && (target.startsWith("apply-receipts/") || target === ".intentos/bootstrap-receipt.json");
  }
  if (target.startsWith(".intentos/")) return true;
  if (target.endsWith("/.gitkeep")) return !target.startsWith("src/") && !target.startsWith("app/");
  if (target.startsWith("scripts/") || target.startsWith("release-recipes/")) {
    return Boolean(source) && source === target;
  }
  if (generatedProjectDocs.has(target)) {
    return !source || source === `templates/${path.posix.basename(target)}`;
  }
  if (/^(?:requests|work-queue)\/[A-Za-z0-9._-]+\.md$/.test(target)) {
    return action.type === "CREATE"
      && !source
      && !action.hashBefore
      && typeof action.inlineContentBase64 === "string"
      && action.inlineContentBase64.length > 0;
  }
  if (["AGENTS.md", "agent.md", ".agent.md"].includes(target)) {
    if (action.type === "CREATE") {
      if (target !== "AGENTS.md") return false;
      if (/^((starters\/[^/]+)|platforms\/codex)\/AGENTS(?:\.template)?\.md$/.test(source)) return true;
      if (source || !action.inlineContentBase64) return false;
      const proposed = Buffer.from(action.inlineContentBase64, "base64").toString("utf8");
      const legacyEntry = ["agent.md", ".agent.md"]
        .map((relative) => readProjectRegularFile(plan?.targetRoot, relative))
        .find(Boolean);
      if (!legacyEntry) return false;
      const current = legacyEntry.content.trimEnd();
      return proposed.startsWith(`${current}\n\n`)
        && proposed.includes("IntentOS")
        && proposed.includes("Zero-Experience Solo Developer");
    }
    if (!["RECONCILE_PRESERVE", "BACKUP_THEN_RECONCILE"].includes(action.type)
      || source
      || !action.inlineContentBase64
      || !action.hashBefore) return false;
    const currentEntry = readProjectRegularFile(plan?.targetRoot, target);
    if (!currentEntry) return false;
    const current = currentEntry.content.trimEnd();
    const proposed = Buffer.from(action.inlineContentBase64, "base64").toString("utf8");
    return proposed.startsWith(`${current}\n\n`)
      && proposed.includes("IntentOS")
      && proposed.includes("Zero-Experience Solo Developer");
  }
  return false;
}

export function validateRequestBoundLocalActionGraph(plan, options = {}) {
  const errors = [];
  for (const action of plan?.actions || []) {
    if (!action?.willWrite) continue;
    if (!isRequestBoundLocalActionAllowed(action, plan, options)) {
      const ownership = action?.hashBefore
        && options.skipCurrentOwnershipCheck !== true
        && !hasVerifiedPriorOwnership(action, plan)
        ? " (existing target has no verified prior IntentOS ownership digest or explicit preserving reconcile action)"
        : "";
      errors.push(`action ${action.id || "<unknown>"} is outside request-bound local authority: ${action.path || "<missing>"}${ownership}`);
    }
  }
  return errors;
}

export function createRequestBoundApplyAuthority(options = {}) {
  const plan = options.plan;
  const goalDigest = String(plan?.arguments?.goalDigest || "");
  const issuedAt = options.issuedAt || new Date().toISOString();
  const expiresAt = options.expiresAt || new Date(Date.parse(issuedAt) + authorityLifetimeMs).toISOString();
  const actions = executableActions(plan);
  const installsAbsentAgentEntry = (plan?.actions || []).some((action) => action.willWrite && action.path === "AGENTS.md" && action.type === "CREATE");
  const base = {
    schema_version: REQUEST_AUTHORITY_VERSION,
    artifact_type: "request_bound_apply_authority",
    artifact_id: options.artifactId || `request-authority-${runSuffix(plan)}`,
    authority_mode: REQUEST_AUTHORITY_MODE,
    authority_basis: "CURRENT_NATURAL_LANGUAGE_REQUEST",
    issued_by: "INTENTOS_POLICY",
    issued_at: issuedAt,
    expires_at: expiresAt,
    single_use: true,
    request: {
      request_digest: goalDigest,
      intent_digest: goalDigest,
      task_ref: requestBoundTaskRef(goalDigest),
      original_request_present: normalizeRequest(options.activeRequest ?? plan?.arguments?.goal) ? "Yes" : "No",
    },
    project: {
      fingerprint: String(plan?.projectIdentity?.fingerprint || ""),
      revision: String(plan?.projectIdentity?.revision || ""),
      source_state_digest: String(plan?.targetFingerprint?.sourceStateDigest || ""),
    },
    execution_plan: {
      path: String(options.planRelativePath || ""),
      plan_digest: String(plan?.planDigest || ""),
      operation_kind: String(plan?.operationKind || ""),
    },
    actions,
    effect_class: "REVERSIBLE_LOCAL_GOVERNANCE",
    external_effect: "NONE",
    boundary: {
      authorizes_business_implementation: false,
      authorizes_release_or_production: false,
      authorizes_ci_or_hook_changes: false,
      authorizes_secrets_or_paid_resources: false,
      authorizes_irreversible_data_changes: false,
      authorizes_unlisted_paths: false,
      authorizes_absent_intentos_agent_entry: installsAbsentAgentEntry,
    },
  };
  return { ...base, authority_digest: evidenceDigest(base, []) };
}

export function validateRequestBoundApplyAuthority(authority, options = {}) {
  const plan = options.plan;
  const errors = [];
  if (authority?.schema_version !== REQUEST_AUTHORITY_VERSION) errors.push(`authority schema_version must be ${REQUEST_AUTHORITY_VERSION}`);
  if (authority?.artifact_type !== "request_bound_apply_authority") errors.push("authority artifact_type is invalid");
  if (authority?.authority_mode !== REQUEST_AUTHORITY_MODE) errors.push(`authority_mode must be ${REQUEST_AUTHORITY_MODE}`);
  if (authority?.authority_basis !== "CURRENT_NATURAL_LANGUAGE_REQUEST") errors.push("authority must be bound to the current natural-language request");
  if (authority?.issued_by !== "INTENTOS_POLICY") errors.push("authority issuer must be IntentOS policy");
  if (authority?.single_use !== true) errors.push("authority must be single use");
  const issued = Date.parse(String(authority?.issued_at || ""));
  const expires = Date.parse(String(authority?.expires_at || ""));
  if (!Number.isFinite(issued) || !Number.isFinite(expires) || expires <= issued || expires - issued > authorityLifetimeMs) {
    errors.push("authority lifetime must be a valid bounded 15-minute window");
  }
  if (!options.allowExpired && expires <= (options.now || Date.now())) errors.push("authority is expired");
  const goalDigest = String(plan?.arguments?.goalDigest || "");
  if (!String(plan?.arguments?.goal || "").trim() || authority?.request?.original_request_present !== "Yes") errors.push("authority is missing the original natural-language request");
  if (authority?.request?.request_digest !== goalDigest || authority?.request?.intent_digest !== goalDigest) errors.push("authority request digest does not match the apply plan");
  if (authority?.request?.task_ref !== requestBoundTaskRef(goalDigest)) errors.push("authority task reference does not match the request");
  if (options.activeRequest !== undefined || options.activeRequestDigest !== undefined) {
    errors.push(...validateCurrentRequestForPlan(plan, {
      request: options.activeRequest,
      requestDigest: options.activeRequestDigest,
      now: options.now,
    }).errors);
  }
  if (authority?.project?.fingerprint !== plan?.projectIdentity?.fingerprint) errors.push("authority project fingerprint mismatch");
  if (authority?.project?.revision !== plan?.projectIdentity?.revision) errors.push("authority project revision mismatch");
  if (authority?.project?.source_state_digest !== plan?.targetFingerprint?.sourceStateDigest) errors.push("authority source state mismatch");
  if (authority?.execution_plan?.path !== options.planRelativePath) errors.push("authority plan path mismatch");
  if (authority?.execution_plan?.plan_digest !== plan?.planDigest) errors.push("authority plan digest mismatch");
  if (authority?.execution_plan?.operation_kind !== plan?.operationKind) errors.push("authority operation kind mismatch");
  if (authority?.effect_class !== "REVERSIBLE_LOCAL_GOVERNANCE" || authority?.external_effect !== "NONE") errors.push("authority must remain reversible, project-local, and free of external effects");
  const expectedAgentEntry = (plan?.actions || []).some((action) => action.willWrite && action.path === "AGENTS.md" && action.type === "CREATE");
  for (const [field, value] of Object.entries(authority?.boundary || {})) {
    if (field === "authorizes_absent_intentos_agent_entry") {
      if (value !== expectedAgentEntry) errors.push("authority agent-entry boundary does not match the exact action graph");
    } else if (value !== false) errors.push(`authority boundary expands ${field}`);
  }
  errors.push(...validateRequestBoundLocalActionGraph(plan, {
    skipCurrentOwnershipCheck: options.postApplyExactGraph === true,
  }));
  const expected = executableActions(plan);
  const observed = Array.isArray(authority?.actions) ? authority.actions : [];
  if (!sameSet(expected.map((item) => item.id), observed.map((item) => item.id))) errors.push("authority action IDs do not match the execution plan");
  const observedById = new Map(observed.map((item) => [item.id, item]));
  for (const item of expected) {
    const actual = observedById.get(item.id);
    if (!actual || !sameSet(actual.target_paths, item.target_paths)) errors.push(`authority target paths do not match ${item.id}`);
    if (actual?.classification !== "REVERSIBLE_LOCAL_GOVERNANCE") errors.push(`authority action ${item.id} has an invalid classification`);
  }
  const { authority_digest: _digest, ...base } = authority || {};
  if (authority?.authority_digest !== evidenceDigest(base, [])) errors.push("authority digest is not canonical");
  if ((options.usedAuthorityDigests || []).includes(authority?.authority_digest)) errors.push("authority has already been consumed");
  return { ok: errors.length === 0, errors };
}

export function createRequestBoundReadiness(options = {}) {
  const plan = options.plan;
  const authority = options.authority;
  const preflight = options.preflight || evaluateRequestBoundApplyPreflight({
    plan,
    authority,
    planRelativePath: options.planRelativePath,
  });
  const ready = preflight.ok === true;
  const changesProjectAuthority = (plan?.actions || []).some((action) => action.willWrite && action.path === "AGENTS.md" && action.type === "CREATE");
  return {
    schema_version: REQUEST_AUTHORITY_VERSION,
    artifact_type: "controlled_apply_readiness",
    artifact_id: options.artifactId || `request-readiness-${runSuffix(plan)}`,
    readiness_state: ready ? REQUEST_READINESS_STATE : "BLOCKED",
    can_codex_apply_now: ready,
    requires_explicit_human_approval: false,
    can_proceed_without_new_approval: ready,
    apply_plan: {
      path: String(options.planRelativePath || ""),
      plan_digest: String(plan?.planDigest || ""),
    },
    apply_authority: {
      path: String(options.authorityRelativePath || ""),
      artifact_id: String(authority?.artifact_id || ""),
      authority_mode: REQUEST_AUTHORITY_MODE,
      authority_digest: String(authority?.authority_digest || ""),
    },
    actions: executableActions(plan).map((item) => ({
      id: item.id,
      classification: "REQUEST_BOUND_LOCAL",
      target_paths: item.target_paths,
    })),
    preconditions: preflight.preconditions,
    rollback: {
      required: true,
      path: ".intentos/backups",
      step: "Restore only transaction-owned target paths from the controlled apply journal.",
      verification: "Recompute every pre-apply target digest and reject partial rollback.",
    },
    verification: {
      pre_apply: "Regenerate and compare the exact plan, request authority, project identity, revision, and source state.",
      post_apply: "Verify every target digest and the full project-local IntentOS behavioral route.",
      evidence_path: String(plan?.receiptPath || ""),
    },
    boundary: {
      writes_files_now: false,
      authorizes_apply: true,
      approves_implementation: false,
      approves_release_or_production: false,
      installs_hooks_or_changes_ci: false,
      enables_high_risk_actions: false,
      changes_project_authority: changesProjectAuthority,
    },
    outcome: ready ? "READINESS_RECORDED" : "BLOCKED",
  };
}

export function evaluateRequestBoundApplyPreflight(options = {}) {
  const plan = options.plan;
  const authority = options.authority;
  const checks = [];
  const add = (name, errors) => {
    const normalized = [...new Set((errors || []).filter(Boolean).map(String))];
    checks.push({ name, status: normalized.length === 0 ? "pass" : "fail", errors: normalized });
  };

  const authorityValidation = validateRequestBoundApplyAuthority(authority, {
    plan,
    planRelativePath: options.planRelativePath,
    activeRequest: options.activeRequest,
    activeRequestDigest: options.activeRequestDigest,
    now: options.now,
  });
  add("current request is bound", authorityValidation.errors.filter((error) => /request|authority|plan path|expired|lifetime/i.test(error)));
  add("project and revision are bound", authorityValidation.errors.filter((error) => /project|revision|source state/i.test(error)));

  const graphErrors = validateRequestBoundLocalActionGraph(plan);
  const filesystemErrors = validatePreflightFilesystem(plan, options.planRelativePath);
  add("exact action graph is reversible and project-local", [...graphErrors, ...filesystemErrors]);
  add("external effects are absent", graphErrors.filter((error) => /outside request-bound local authority/i.test(error)));

  const errors = checks.flatMap((check) => check.errors.map((error) => `${check.name}: ${error}`));
  return {
    ok: errors.length === 0,
    preconditions: checks.map(({ name, status }) => ({ name, status })),
    errors,
  };
}

function validatePreflightFilesystem(plan, planRelativePath) {
  const errors = [];
  const rootPath = path.resolve(String(plan?.targetRoot || ""));
  let root;
  try {
    const rootStat = fs.lstatSync(rootPath);
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return ["target root is not a non-symlink directory"];
    root = fs.realpathSync(rootPath);
  } catch (error) {
    return [`target root cannot be inspected: ${error.message}`];
  }
  if (!readProjectRegularFile(root, planRelativePath)) errors.push("execution plan is not an exact project-local regular file");
  for (const relative of requestBoundSupportPaths(plan)) {
    const support = projectPath(root, relative);
    if (!support || lstatIfExists(support)) errors.push(`request-bound support path already exists or is unsafe: ${relative}`);
  }
  const backupRoots = new Set();
  for (const action of plan?.actions || []) {
    if (!action?.willWrite) continue;
    const target = projectPath(root, action.path);
    if (!target) {
      errors.push(`action ${action.id || "<unknown>"} target path is unsafe`);
      continue;
    }
    const observed = regularFileDigest(target, errors, `action ${action.id || "<unknown>"} target`);
    if (observed !== (action.hashBefore || null)) errors.push(`action ${action.id || "<unknown>"} target precondition changed`);
    if (action.backupPath) {
      const backup = projectPath(root, action.backupPath);
      if (!backup) errors.push(`action ${action.id || "<unknown>"} backup path is unsafe`);
      else if (lstatIfExists(backup)) errors.push(`action ${action.id || "<unknown>"} backup path already exists`);
      backupRoots.add(normalizePath(action.backupPath).split("/").slice(0, 3).join("/"));
    }
  }
  for (const relative of backupRoots) {
    const backupRoot = projectPath(root, relative);
    if (!backupRoot || lstatIfExists(backupRoot)) errors.push(`backup run root already exists: ${relative}`);
  }
  return errors;
}

function projectPath(root, relativePath) {
  const normalized = normalizePath(relativePath);
  if (!normalized || normalized.startsWith("/") || normalized.split("/").some((part) => !part || part === "." || part === "..")) return null;
  const candidate = path.resolve(root, ...normalized.split("/"));
  const relative = path.relative(root, candidate);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative) ? candidate : null;
}

function requestBoundAuthorityConsumptionPath(projectRoot, authorityDigest) {
  if (!/^sha256:[a-f0-9]{64}$/.test(String(authorityDigest || ""))) throw new Error("request-bound authority digest is invalid");
  const rootPath = path.resolve(String(projectRoot || ""));
  const rootStat = fs.lstatSync(rootPath);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw new Error("request-bound authority target root is unsafe");
  const root = fs.realpathSync(rootPath);
  const parent = fs.realpathSync(path.dirname(root));
  const rootKey = createHash("sha256").update(root).digest("hex").slice(0, 16);
  const authorityKey = authorityDigest.slice("sha256:".length);
  const file = path.join(parent, `.intentos-request-authority-${rootKey}-${authorityKey}.consumed.json`);
  const parentStat = fs.lstatSync(parent);
  if (parentStat.isSymbolicLink() || !parentStat.isDirectory() || path.dirname(file) !== parent) {
    throw new Error("request-bound authority consumption parent is unsafe");
  }
  return file;
}

function regularFileDigest(file, errors, label) {
  const stat = lstatIfExists(file);
  if (!stat) return null;
  if (stat.isSymbolicLink() || !stat.isFile()) {
    errors.push(`${label} is not a non-symlink regular file`);
    return "NON_REGULAR";
  }
  const hash = createHash("sha256");
  hash.update(fs.readFileSync(file));
  return `sha256:${hash.digest("hex")}`;
}

function lstatIfExists(file) {
  try {
    return fs.lstatSync(file);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export function validateRequestBoundReadiness(readiness, options = {}) {
  const plan = options.plan;
  const authority = options.authority;
  const errors = [];
  if (readiness?.schema_version !== REQUEST_AUTHORITY_VERSION) errors.push(`readiness schema_version must be ${REQUEST_AUTHORITY_VERSION}`);
  if (readiness?.readiness_state !== REQUEST_READINESS_STATE) errors.push(`readiness_state must be ${REQUEST_READINESS_STATE}`);
  if (readiness?.can_codex_apply_now !== true) errors.push("request-bound readiness must allow Codex to apply the bounded local graph");
  if (readiness?.requires_explicit_human_approval !== false) errors.push("request-bound readiness must not ask the user for a technical approval");
  if (readiness?.can_proceed_without_new_approval !== true) errors.push("request-bound readiness must proceed from the current request");
  if (readiness?.apply_plan?.path !== options.planRelativePath || readiness?.apply_plan?.plan_digest !== plan?.planDigest) errors.push("readiness plan binding mismatch");
  if (readiness?.apply_authority?.path !== options.authorityRelativePath) errors.push("readiness authority path mismatch");
  if (readiness?.apply_authority?.authority_digest !== authority?.authority_digest) errors.push("readiness authority digest mismatch");
  if (readiness?.apply_authority?.authority_mode !== REQUEST_AUTHORITY_MODE) errors.push("readiness authority mode mismatch");
  const expectedAuthorityChange = (plan?.actions || []).some((action) => action.willWrite && action.path === "AGENTS.md" && action.type === "CREATE");
  for (const [field, value] of Object.entries(readiness?.boundary || {})) {
    if (field === "authorizes_apply") {
      if (value !== true) errors.push("request-bound readiness must authorize only its exact apply graph");
    } else if (field === "changes_project_authority") {
      if (value !== expectedAuthorityChange) errors.push("readiness project-authority impact does not match the exact action graph");
    } else if (value !== false) errors.push(`readiness boundary expands ${field}`);
  }
  if ((readiness?.preconditions || []).some((item) => item.status === "fail")) errors.push("readiness has a failed precondition");
  if (readiness?.rollback?.required !== true) errors.push("readiness must require rollback");
  if (readiness?.outcome !== "READINESS_RECORDED") errors.push("readiness outcome must be READINESS_RECORDED");
  const expected = executableActions(plan);
  const observed = Array.isArray(readiness?.actions) ? readiness.actions : [];
  if (!sameSet(expected.map((item) => item.id), observed.map((item) => item.id))) errors.push("readiness action IDs do not match the execution plan");
  const byId = new Map(observed.map((item) => [item.id, item]));
  for (const item of expected) {
    const actual = byId.get(item.id);
    if (!actual || !sameSet(item.target_paths, actual.target_paths)) errors.push(`readiness target paths do not match ${item.id}`);
    if (actual?.classification !== "REQUEST_BOUND_LOCAL") errors.push(`readiness action ${item.id} is not request-bound local`);
  }
  return { ok: errors.length === 0, errors };
}

function executableActions(plan) {
  const receiptActionId = plan?.receiptActionId
    || (plan?.actions || []).find((action) => action?.type === "WRITE_APPLY_RECEIPT")?.id;
  const supportPaths = requestBoundSupportPaths(plan);
  return (plan?.actions || [])
    .filter((action) => action?.willWrite === true)
    .map((action) => ({
      id: String(action.id || ""),
      classification: "REVERSIBLE_LOCAL_GOVERNANCE",
      target_paths: normalizePathList([
        action.path,
        action.backupPath,
        ...(action.id === receiptActionId ? supportPaths : []),
      ].filter(Boolean)),
    }));
}

function hasVerifiedPriorOwnership(action, plan) {
  if (!action?.hashBefore) return true;
  if (isExplicitPreservingReconcile(action, plan)) return true;
  const target = normalizePath(action.path);
  const versionEntry = readProjectRegularFile(plan?.targetRoot, ".intentos/version.json");
  if (!versionEntry) return false;
  let version;
  try { version = JSON.parse(versionEntry.content); } catch { return false; }
  if (target === ".intentos/version.json") {
    return /^\d+\.\d+\.\d+/.test(String(version.intentOSVersion || ""))
      && Array.isArray(version.workflowAssets)
      && version.workflowAssets.length > 0
      && digestContent(versionEntry.content) === action.hashBefore;
  }
  const recorded = version.managedAssetDigests?.[target];
  if (recorded !== action.hashBefore || !/^sha256:[a-f0-9]{64}$/.test(String(recorded || ""))) return false;
  const declared = (version.workflowAssets || []).map(normalizePath).filter(Boolean);
  return declared.some((managed) => target === managed || target.startsWith(`${managed}/`));
}

function isExplicitPreservingReconcile(action, plan) {
  if (!["RECONCILE_PRESERVE", "BACKUP_THEN_RECONCILE"].includes(String(action?.type || ""))) return false;
  const target = normalizePath(action.path);
  if (!["AGENTS.md", "agent.md", ".agent.md"].includes(target)
    || action.source
    || !action.inlineContentBase64
    || !action.hashBefore) return false;
  const current = readProjectRegularFile(plan?.targetRoot, target);
  if (!current || digestContent(current.content) !== action.hashBefore) return false;
  const proposed = Buffer.from(action.inlineContentBase64, "base64").toString("utf8");
  return proposed.startsWith(`${current.content.trimEnd()}\n\n`)
    && proposed.includes("IntentOS")
    && proposed.includes("Zero-Experience Solo Developer");
}

function normalizePath(value) {
  return String(value || "").trim().replaceAll("\\", "/");
}

function normalizeRequest(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function digestContent(value) {
  return `sha256:${createHash("sha256").update(String(value || "")).digest("hex")}`;
}

function readProjectRegularFile(projectRoot, relativePath) {
  try {
    const rootPath = path.resolve(String(projectRoot || ""));
    const rootStat = fs.lstatSync(rootPath);
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return null;
    const root = fs.realpathSync(rootPath);
    const candidate = path.resolve(root, ...normalizePath(relativePath).split("/"));
    const lexical = path.relative(root, candidate);
    if (!lexical || lexical.startsWith("..") || path.isAbsolute(lexical)) return null;
    const stat = fs.lstatSync(candidate);
    if (stat.isSymbolicLink() || !stat.isFile()) return null;
    const real = fs.realpathSync(candidate);
    const resolved = path.relative(root, real);
    if (!resolved || resolved.startsWith("..") || path.isAbsolute(resolved)) return null;
    return { file: real, content: fs.readFileSync(real, "utf8") };
  } catch {
    return null;
  }
}

function runSuffix(plan) {
  return String(plan?.planDigest || "sha256:missing").replace(/^sha256:/, "").slice(0, 16);
}
