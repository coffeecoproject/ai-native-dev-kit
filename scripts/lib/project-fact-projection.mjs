import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { evidenceDigest } from "./artifact-schema.mjs";
import { projectIdentity } from "./evidence-authority.mjs";
import { collectCurrentWorkContinuity } from "./current-work-continuity.mjs";
import { loadVerifiedBootstrapReceipt } from "./bootstrap-transaction.mjs";
import { filterIntentOSManagedPaths, walkRelativePaths } from "./project-signals.mjs";

export function projectGoalProjection(goal, options = {}) {
  const normalizedGoal = String(goal || "inspect project state").trim().replace(/\s+/g, " ");
  const executionIntent = options.executionIntent || classifyExecutionIntent(normalizedGoal);
  const base = {
    schema_version: "1.109.0",
    original_goal: normalizedGoal,
    execution_intent: executionIntent,
    assumptions: [...new Set(options.assumptions || [])].sort(),
    unresolved_business_facts: [...new Set(options.unresolvedBusinessFacts || [])].sort(),
    unresolved_external_facts: [...new Set(options.unresolvedExternalFacts || [])].sort(),
    technical_decisions: [...new Set(options.technicalDecisions || [])].sort(),
    user_technical_choice_required: "No",
  };
  return { ...base, goal_digest: evidenceDigest(base, []) };
}

export function collectProjectFactProjection(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const topology = options.topology;
  const goal = options.goalProjection || projectGoalProjection(options.goal);
  const topologyAllowsRead = !topology || ["EMPTY_DIRECTORY", "NONEMPTY_DIRECTORY"].includes(topology.state);
  const targetExists = topologyAllowsRead && fs.existsSync(root) && fs.statSync(root).isDirectory();
  const currentWork = targetExists ? collectCurrentWorkContinuity(root) : emptyCurrentWork();
  const paths = targetExists
    ? filterIntentOSManagedPaths(root, walkRelativePaths(root, ".", { maxDepth: 1024, maxEntries: 1000000 }))
      .map(normalizePath)
    : [];
  const identity = targetExists ? safeIdentity(root) : absentIdentity(topology);
  const installedVersion = targetExists ? readJson(path.join(root, ".intentos", "version.json")) : null;
  const entryFiles = targetExists ? detectEntryFiles(root) : [];
  const authorityInventory = targetExists ? collectAuthorityInventory(root, paths, entryFiles) : emptyAuthorityInventory();
  const lifecycle = lifecycleProjection(root, installedVersion);
  const governance = governanceProjection(authorityInventory, entryFiles);
  const platforms = platformProjection(paths, root);
  const behavioral = behavioralProjection(root, installedVersion, entryFiles);
  const conflicts = scopedConflicts({ identity, lifecycle, governance, platforms, behavioral, currentWork, authorityInventory });
  const base = {
    schema_version: "1.109.0",
    artifact_type: "project_fact_projection",
    target_topology_digest: topology?.topology_digest || "N/A",
    goal_projection: goal,
    project_identity: identity,
    lifecycle,
    authority_inventory: authorityInventory,
    governance_authority_posture: governance,
    platform_surfaces: platforms,
    behavioral_adoption: behavioral,
    release_readiness: { state: "NOT_ASSESSED", evidence_refs: [], confidence: "UNKNOWN" },
    real_world_effect: realWorldEffect(goal.execution_intent),
    repository_evidence_mode: identity.kind === "GIT" ? "GIT_BOUND" : identity.kind === "NON_GIT" ? "CONTENT_DIGEST_BOUND" : "UNKNOWN",
    current_work_continuity: currentWork,
    conflicts,
  };
  return { ...base, projection_digest: evidenceDigest(base, []) };
}

export function hasGlobalTrustConflict(projection) {
  return (projection?.conflicts || []).some((item) => item.affected_scope === "GLOBAL_TRUST" && item.state === "BLOCKING");
}

function classifyExecutionIntent(goal) {
  if (/\b(?:review|inspect|read|compare|discuss|explain)\b|查看|检查|审查|只读|比较|沟通|解释/i.test(goal)) return "READ_ONLY";
  if (/\b(?:create|bootstrap|initialize|configure|adopt|migrate|install)\b|创建|新建|初始化|配置|接入|迁移|安装/i.test(goal)) return "REVERSIBLE_SETUP_REQUESTED";
  return "TASK_EXECUTION_REQUESTED";
}

function safeIdentity(root) {
  try {
    return { ...projectIdentity(root), state: "CURRENT" };
  } catch (error) {
    return { kind: "UNKNOWN", fingerprint: "", revision: "", state: "CONFLICTED", error: error.message };
  }
}

function absentIdentity(topology) {
  return {
    kind: "ABSENT_TARGET",
    fingerprint: topology?.topology_digest || "",
    revision: topology?.topology_digest || "",
    state: topology?.state === "ABSENT_LEAF" ? "UNBOOTSTRAPPED" : "UNKNOWN",
  };
}

function lifecycleProjection(root, version) {
  const explicit = String(version?.lifecycleStage || readLifecycleRecord(root) || "").toUpperCase();
  if (["NEW", "DEVELOPMENT", "INTERNAL_TRIAL", "PRODUCTION_ACTIVE"].includes(explicit)) {
    return {
      state: explicit,
      confidence: "DECLARED",
      evidence_refs: version?.lifecycleStage ? [".intentos/version.json"] : ["docs/project-profile.md"],
      proves_release_readiness: "No",
    };
  }
  return { state: "UNKNOWN", confidence: "UNKNOWN", evidence_refs: [], proves_release_readiness: "No" };
}

function readLifecycleRecord(root) {
  const file = path.join(root, "docs", "project-profile.md");
  if (!fs.existsSync(file)) return "";
  const match = fs.readFileSync(file, "utf8").match(/^Lifecycle(?: stage)?\s*:\s*`?([A-Za-z_]+)`?/im);
  return match?.[1] || "";
}

function governanceProjection(inventory, entryFiles) {
  const hasAgent = entryFiles.length > 0;
  const current = inventory.sources.filter((item) => item.lifecycle === "CURRENT" || item.lifecycle === "ACTIVE");
  const hasCi = current.some((item) => item.authority_kind === "CI_OR_GATE");
  const hasBaseline = current.some((item) => item.authority_kind === "BASELINE");
  const hasQueue = current.some((item) => item.authority_kind === "WORK_CONTINUITY");
  const signals = [hasAgent && "agent_entry", hasCi && "gates", hasBaseline && "baseline", hasQueue && "work_continuity"].filter(Boolean);
  const state = hasAgent && hasCi && (hasBaseline || hasQueue)
    ? "DECLARED_STRONG_GOVERNED"
    : signals.length > 0 ? "DECLARED_GOVERNED" : "LIGHT";
  return { state, confidence: signals.length > 0 ? "OBSERVED" : "LOW", evidence_kinds: signals, effectiveness_claimed: "No" };
}

function collectAuthorityInventory(root, paths, entryFiles) {
  const sources = [];
  const entryRefs = new Set(entryFiles.map((item) => item.ref));
  const currentVersion = String(readJson(path.join(root, "package.json"))?.version || "");
  for (const relative of paths) {
    const full = path.join(root, relative);
    let stat;
    try { stat = fs.lstatSync(full); } catch { continue; }
    if (!stat.isFile() && !stat.isSymbolicLink()) continue;
    const kind = authorityKind(relative, entryRefs);
    if (!kind) continue;
    const lifecycle = sourceLifecycle(relative, currentVersion);
    const row = {
      source_ref: relative,
      authority_kind: kind,
      lifecycle,
      parse_state: stat.isSymbolicLink() ? "UNRESOLVED_SYMLINK" : "ACCOUNTED",
      source_digest: stat.isSymbolicLink()
        ? evidenceDigest({ relative, symlink: fs.readlinkSync(full) }, [])
        : `sha256:${crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex")}`,
    };
    sources.push(row);
  }
  sources.sort((left, right) => left.source_ref.localeCompare(right.source_ref));
  const pageSize = 200;
  const pages = [];
  for (let index = 0; index < sources.length; index += pageSize) {
    const refs = sources.slice(index, index + pageSize).map((item) => item.source_ref);
    pages.push({ page: pages.length + 1, source_refs: refs, page_digest: evidenceDigest(refs, []) });
  }
  const base = {
    complete: sources.every((item) => item.parse_state === "ACCOUNTED") ? "Yes" : "No",
    total_sources: sources.length,
    accounted_sources: sources.filter((item) => item.parse_state === "ACCOUNTED").length,
    unresolved_sources: sources.filter((item) => item.parse_state !== "ACCOUNTED").map((item) => item.source_ref),
    page_size: pageSize,
    pages,
    sources,
  };
  return { ...base, inventory_digest: evidenceDigest(base, []) };
}

function authorityKind(relative, entryRefs) {
  if (entryRefs.has(relative) || /(^|\/)(?:AGENTS|agent)\.md$/i.test(relative)) return "AGENT_ENTRY";
  if (relative.startsWith(".github/workflows/") || /(^|\/)scripts\/(?:guard|ci)\//.test(relative)) return "CI_OR_GATE";
  if (/(?:engineering|environment|release|risk|security|test|verification)[-_ ].*baseline|baseline[-_ ].*(?:engineering|environment|release|risk|security|test|verification)/i.test(relative)) return "BASELINE";
  if (relative.startsWith("work-queue/") || relative.startsWith("docs/sessions/") || /^(?:todo|todos|tasks?|task[-_ ]?queue|work[-_ ]?queue)(?:\.[^.]+)?$/i.test(path.basename(relative))) return "WORK_CONTINUITY";
  if (/(?:governance|policy|authority|release|rollback|sop|permission)/i.test(relative)) return "PROJECT_AUTHORITY";
  return "";
}

function sourceLifecycle(relative, currentVersion) {
  const value = relative.toLowerCase();
  const release = value.match(/^(?:docs\/)?releases\/([^/]+)\//);
  if (release) return release[1] === currentVersion.toLowerCase() ? "CURRENT" : "HISTORICAL";
  if (/(^|\/)(?:archive|archived|historical|history)(\/|$)/.test(value)) return "ARCHIVED";
  if (/(?:deprecated|retired|obsolete)/.test(value)) return "RETIRED";
  if (/(^|\/)(?:legacy)(\/|$)|legacy[-_.]/.test(value)) return "LEGACY";
  if (/(^|\/)(?:drafts?|proposals?)(\/|$)|\.draft\./.test(value)) return "DRAFT";
  if (/(^|\/)(?:templates?|examples?|fixtures?|vendor)(\/|$)/.test(value)) return "GENERATED_OR_VENDOR";
  return "CURRENT";
}

function emptyAuthorityInventory() {
  const base = { complete: "Yes", total_sources: 0, accounted_sources: 0, unresolved_sources: [], page_size: 200, pages: [], sources: [] };
  return { ...base, inventory_digest: evidenceDigest(base, []) };
}

function platformProjection(paths, root) {
  const rows = [];
  const pkg = readJson(path.join(root, "package.json"));
  const pkgText = JSON.stringify({ dependencies: pkg?.dependencies || {}, devDependencies: pkg?.devDependencies || {} });
  if (paths.some((item) => /^(?:src|app|pages|web|frontend)\//.test(item)) || /"(?:react|next|vue|vite|svelte)"/.test(pkgText)) rows.push(surface("web", "IN_PROGRESS"));
  if (paths.some((item) => item.endsWith(".xcodeproj") || item.endsWith(".xcworkspace") || item === "Package.swift" || item.startsWith("ios/"))) rows.push(surface("ios", "IN_PROGRESS"));
  if (paths.some((item) => item === "build.gradle" || item === "settings.gradle" || item.startsWith("android/"))) rows.push(surface("android", "IN_PROGRESS"));
  if (paths.some((item) => item === "project.config.json" || item.startsWith("miniprogram/") || item.startsWith("cloudfunctions/"))) rows.push(surface("wechat-miniprogram", "IN_PROGRESS"));
  if (paths.some((item) => /^(?:server|backend|services)\//.test(item)) || /"(?:express|fastify|@nestjs\/core|prisma)"/.test(pkgText)) rows.push(surface("backend", "IN_PROGRESS"));
  return rows.length > 0 ? rows : [surface("unknown", "UNKNOWN")];
}

function behavioralProjection(root, version, entryFiles) {
  const installed = Boolean(version?.intentOSVersion);
  const bridge = entryFiles.some((item) => item.kind === "INTENTOS_BRIDGE");
  const activation = installed ? loadVerifiedBootstrapReceipt(root) : { ok: false, ref: "N/A" };
  return {
    state: activation.ok ? "VERIFIED_ACTIVE" : installed ? "APPLIED_PENDING_VERIFICATION" : bridge ? "READ_ONLY_ASSESSED" : "NOT_ADOPTED",
    identity_form: installed ? "INSTALLED" : bridge ? "BRIDGE" : "NONE",
    entry_refs: [...new Set([...entryFiles.map((item) => item.ref), ...(activation.ok ? [activation.ref] : [])])],
    activation_claimed: activation.ok ? "Yes" : "No",
  };
}

function detectEntryFiles(root) {
  const candidates = ["AGENTS.md", "agent.md", ".intentos/version.json"];
  return candidates.filter((ref) => fs.existsSync(path.join(root, ref))).map((ref) => {
    const content = fs.readFileSync(path.join(root, ref), "utf8");
    return { ref, kind: /IntentOS Collaboration Layer|IntentOS Operating Mode/i.test(content) ? "INTENTOS_BRIDGE" : ref === ".intentos/version.json" ? "INSTALLED_IDENTITY" : "PROJECT_AUTHORITY" };
  });
}

function scopedConflicts({ identity, currentWork, authorityInventory }) {
  const rows = [];
  if (identity.state === "CONFLICTED") rows.push(conflict("identity-conflict", "GLOBAL_TRUST", identity.error || "Project identity cannot be established."));
  if (currentWork.state === "CURRENT_CONFLICTED") rows.push(conflict("multiple-current-tasks", "CURRENT_TASK", "More than one current task is recorded."));
  if (currentWork.git?.observation_status === "FAILED") rows.push(conflict("git-observation-failed", "GLOBAL_TRUST", "Repository identity could not be observed safely."));
  if (authorityInventory.complete !== "Yes") rows.push(conflict("authority-inventory-incomplete", "GLOBAL_TRUST", `Authority inventory has ${authorityInventory.unresolved_sources.length} unresolved source(s).`));
  return rows;
}

function conflict(id, affectedScope, reason) {
  return { conflict_id: id, affected_scope: affectedScope, dependent_actions: affectedScope === "GLOBAL_TRUST" ? ["all-routine-work"] : ["current-task-transition"], state: "BLOCKING", reason };
}

function realWorldEffect(intent) {
  return { state: intent === "REVERSIBLE_SETUP_REQUESTED" ? "REVERSIBLE_PROJECT_LOCAL" : "NONE", consent_required: "No" };
}

function emptyCurrentWork() {
  const base = { schema_version: "1.109.0", state: "NO_CURRENT_WORK", queue_candidates: [], current_task_refs: [], git: { mode: "NOT_PRESENT", revision: "", changed_paths: [], status_digest: "", observation_status: "OBSERVED" }, write_overlap_state: "NOT_EVALUATED", concurrent_change_state: "NOT_EVALUATED" };
  return { ...base, continuity_digest: evidenceDigest(base, []) };
}

function surface(id, state) {
  return { id, state, confidence: state === "UNKNOWN" ? "UNKNOWN" : "OBSERVED", evidence_refs: [] };
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function normalizePath(value) {
  return String(value || "").replaceAll(path.sep, "/").replace(/^\.\//, "");
}
