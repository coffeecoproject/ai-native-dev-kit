#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import { resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import {
  deriveWorkQueueTaskIdentity,
  normalizeTaskIntent,
  taskIntentDigest,
  validateTaskGovernanceLineage,
} from "./lib/task-entry-binding.mjs";
import { validateTaskObligationProjection } from "./lib/task-obligations.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  canonicalizeWorkQueueItems,
  parseWorkQueueReport,
} from "./resolve-work-queue.mjs";
import {
  defaultIgnoredDirs,
  walkRelativePaths,
} from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["intent", "json", "format", "out", "task-governance-ref", "current-item-id"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const intent = normalizeTaskIntent(args.intent || args._.slice(1).join(" ") || "review existing project task records");
const outputFormat = args.json ? "json" : String(args.format || "human");
const outputPath = args.out ? resolveOutputPath(projectRoot, String(args.out)) : null;
const taskGovernanceRef = String(args["task-governance-ref"] || "").trim();
const currentItemId = String(args["current-item-id"] || "").trim();

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildReport();

if (outputFormat === "json") {
  const json = JSON.stringify(report.evidence, null, 2);
  if (outputPath) writeOutput(outputPath, json);
  console.log(json);
} else {
  const markdown = renderMarkdown(report.evidence);
  if (outputPath) writeOutput(outputPath, markdown);
  console.log(markdown);
}

function buildReport() {
  const exists = fs.existsSync(projectRoot);
  const taskSourceIgnoredDirs = new Set([
    ...defaultIgnoredDirs,
    "examples",
    "test-fixtures",
    "fixtures",
  ]);
  const paths = exists ? walkRelativePaths(projectRoot, ".", {
    maxDepth: 1024,
    maxEntries: 1000000,
    ignoredDirs: taskSourceIgnoredDirs,
  }) : [];
  const discovery = exists ? discoverTaskSources(projectRoot, paths) : { sources: [], rejected: [] };
  const taskSources = discovery.sources;
  const sourceInventory = taskSources.map(sourceEvidence);
  const gitState = exists ? gitWorktreeState(projectRoot) : { isGitRepository: false, isDirty: false };
  const explicitUnsafe = discovery.rejected.length > 0
    || discovery.multipleCurrentCount > 1
    || taskSources.some((source) => isBlockingTaskAuthoritySource(source)
    && (source.status === "RISKY"
      || /UNSAFE_TO_TAKE_OVER|production incident|release conflict/i.test(source.summary)));
  const rootGitDirty = fs.existsSync(path.join(projectRoot, ".git")) && gitState.isDirty;
  const hasExistingQueue = taskSources.some((source) => source.source_type === "work_queue");
  const hasTaskSources = taskSources.length > 0;
  const taskClass = classFor({
    exists,
    explicitUnsafe,
    rootGitDirty,
    hasExistingQueue,
    hasTaskSources,
    sourceInventory: taskSources,
    hasTaskGovernanceRef: Boolean(taskGovernanceRef),
  });
  const recommendedAction = actionFor(taskClass);
  const futureAuthority = authorityFor(taskClass);
  const dispositions = dispositionsFor(taskClass, taskSources);
  const queueItems = queueItemsFor(taskClass, dispositions, taskSources);
  const takeoverRef = outputPath
    ? path.relative(projectRoot, outputPath).replaceAll(path.sep, "/")
    : "work-queue-takeover-reports/generated.md";
  const reviewBlockedBy = blockedByFor({ exists, taskClass, rootGitDirty, explicitUnsafe });
  reviewBlockedBy.push(...discovery.rejected.map((item) => `unsafe task evidence source ${item.ref}: ${item.error}`));
  if (discovery.multipleCurrentCount > 1) {
    reviewBlockedBy.push(`multiple CURRENT task rows detected: ${discovery.multipleCurrentRefs.join(", ")}`);
  }
  const governanceBinding = bindCurrentTaskGovernance(queueItems, takeoverRef);
  const blockedBy = [...reviewBlockedBy];
  if (!governanceBinding.ok) blockedBy.push(governanceBinding.error);
  const baseEvidence = {
    schema_version: "1.84.1",
    artifact_type: "work_queue_takeover",
    work_queue_takeover_ref: takeoverRef,
    work_queue_takeover_digest: "sha256:pending",
    intent,
    intent_digest: taskIntentDigest(intent),
    project_task_system_class: taskClass,
    recommended_action: recommendedAction,
    future_task_authority: futureAuthority,
    plain_user_summary: plainSummaryFor(taskClass),
    source_inventory: sourceInventory,
    reliability_assessment: reliabilityFor(taskClass, taskSources),
    migration_dispositions: dispositions,
    queue_items: queueItems,
    readiness: {
      takeover_ready: blockedBy.length === 0 ? "Yes" : "No",
      takeover_review_ready: reviewBlockedBy.length === 0 ? "Yes" : "No",
      can_codex_write_now: "No",
      can_execute_from_old_todo_directly: "No",
      blocked_by: blockedBy,
    },
    boundaries: {
      writes_target_files: "No",
      deletes_old_task_sources: "No",
      approves_implementation: "No",
      approves_completion: "No",
      approves_commit_or_push: "No",
      approves_release_or_production: "No",
      claims_full_adoption: "No",
      installs_native_assets: "No",
    },
    outcome: outcomeFor(taskClass),
  };
  baseEvidence.work_queue_takeover_digest = evidenceDigest(baseEvidence, ["work_queue_takeover_digest"]);
  return { evidence: baseEvidence };
}

function bindCurrentTaskGovernance(queueItems, takeoverRef) {
  if (!taskGovernanceRef) return { ok: false, error: "Task Governance binding was not requested." };
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", taskGovernanceRef, { markdownOnly: true });
  if (!resolved.ok) return { ok: false, error: `Task Governance reference is unsafe or unresolved: ${resolved.error}` };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok || extracted.value?.artifact_type !== "task_governance") {
    return { ok: false, error: "Task Governance reference does not contain valid structured Task Governance evidence." };
  }
  const governance = extracted.value;
  const digestValid = governance.task_governance_digest === evidenceDigest(governance, ["task_governance_digest"]);
  if (!digestValid) return { ok: false, error: "Task Governance digest is invalid." };
  if (governance.intent !== intent || governance.intent_digest !== taskIntentDigest(intent)) {
    return { ok: false, error: "Task Governance intent text and digest do not match the Work Queue takeover intent." };
  }
  if (governance.task_lineage?.authority !== "WORK_QUEUE_ITEM") {
    return { ok: false, error: "Task Governance binding requires strict WORK_QUEUE_ITEM lineage; UNBOUND_COMPATIBILITY is not accepted." };
  }
  if (governance.impact_classification?.task_impact === "POSSIBLE_HIGH"
    || !validateTaskObligationProjection(governance).ok) {
    return { ok: false, error: "Task Governance has unresolved task classification or weakened minimum obligations." };
  }
  if (queueItems.length === 0) {
    queueItems.push({
      item_id: "WQ-001",
      state: "CURRENT",
      title: cleanCell(intent).slice(0, 120),
      source_item: "intent:current",
      source_item_digest: digest(intent),
      task_governance_ref: "N/A",
      task_governance_digest: "N/A",
      task_governance_binding_status: "PENDING",
      execution_review_eligible_after_task_governance: "Yes",
      execution_eligible: "No",
      reason: "The project had no task system; the exact current intent becomes the first governed Work Queue item.",
    });
  }
  const allCurrent = queueItems.filter((item) => item.state === "CURRENT");
  if (allCurrent.length !== 1) {
    return { ok: false, error: `Exactly one CURRENT Work Queue item is required before selection, observed ${allCurrent.length}.` };
  }
  const candidates = allCurrent.filter((item) => !currentItemId || item.item_id === currentItemId);
  if (candidates.length !== 1) {
    return { ok: false, error: `Exactly one CURRENT Work Queue item must be selected, observed ${candidates.length}.` };
  }
  const current = candidates[0];
  const identity = deriveWorkQueueTaskIdentity({
    workQueueItemRef: `artifact:${takeoverRef}#${current.item_id}`,
    item: current,
    intent,
  });
  if (!identity.ok) return { ok: false, error: identity.error };
  if (governance.task_ref !== identity.task_ref) {
    return { ok: false, error: "Task Governance task_ref does not match the exact Work Queue task instance." };
  }
  if (governance.task_lineage?.work_queue_item_ref !== identity.work_queue_item_ref
    || governance.task_lineage?.work_queue_item_digest !== identity.work_queue_item_digest) {
    return { ok: false, error: "Task Governance lineage does not bind the exact Work Queue item ref and digest." };
  }
  const lineage = validateTaskGovernanceLineage(projectRoot, governance, {
    fromFile: resolved.file,
    requireCurrent: true,
  });
  if (!lineage.ok) {
    return { ok: false, error: `Task Governance strict Work Queue lineage is invalid: ${lineage.errors.join("; ")}` };
  }
  current.task_governance_ref = resolved.relativePath;
  current.task_governance_digest = governance.task_governance_digest;
  current.task_governance_binding_status = "VERIFIED";
  current.execution_review_eligible_after_task_governance = "Yes";
  current.execution_eligible = "Yes";
  current.reason = "The exact current Task Governance report and intent digest were verified by the public takeover resolver.";
  return { ok: true, error: "" };
}

function discoverTaskSources(root, paths) {
  const candidates = [];
  const rejected = [];
  for (const relativePath of paths) {
    if (!/\.(md|txt)$/i.test(relativePath)) continue;
    if (!isTaskSourcePath(relativePath)) continue;
    const resolved = resolveAuthoritativeEvidenceReference(root, "", relativePath);
    if (!resolved.ok) {
      rejected.push({ ref: relativePath, error: resolved.error });
      continue;
    }
    const content = readFile(resolved.file);
    const report = {
      path: relativePath,
      title: summaryForSource(relativePath, content),
      content,
    };
    const parsed = parseWorkQueueReport(report);
    const canonical = canonicalizeWorkQueueItems(parsed.items);
    for (const invalid of parsed.invalidRows) {
      rejected.push({
        ref: `${relativePath}#row-${invalid.row}`,
        error: `task table row has unsupported state ${invalid.state || "<empty>"}`,
      });
    }
    if (canonical.items.length > 0) {
      const conflictedKeys = new Set(canonical.conflicts.map((item) => item.itemKey));
      for (const [index, item] of canonical.items.entries()) {
        const sourceRef = `${relativePath}#${taskFragment(item.taskId, index)}`;
        const itemKey = canonicalTaskKey(item);
        candidates.push({
          source_ref: sourceRef,
          source_digest: digest(`${sourceRef}\n${content}`),
          source_type: sourceTypeFor(relativePath),
          status: conflictedKeys.has(itemKey) ? "RISKY" : sourceStatusForQueueState(item.state),
          summary: cleanCell(item.title || item.taskId || summaryForSource(relativePath, content)).slice(0, 180),
          queue_state: item.state,
          task_id: item.taskId,
          task_ref: item.taskRef,
          intent_digest: item.intentDigest,
          evidence: item.evidence,
          structured_row: true,
        });
      }
      continue;
    }
    candidates.push({
      source_ref: relativePath,
      source_digest: digest(`${relativePath}\n${content}`),
      source_type: sourceTypeFor(relativePath),
      status: statusForSource(relativePath, content),
      summary: summaryForSource(relativePath, content),
      queue_state: "",
      task_id: "",
      task_ref: "",
      intent_digest: "",
      evidence: "",
      structured_row: false,
    });
  }
  const structuredQueueRows = candidates.filter((source) => source.structured_row && source.source_type === "work_queue");
  const currentAuthority = structuredQueueRows.length > 0
    ? structuredQueueRows
    : candidates.filter((source) => isBlockingTaskAuthoritySource(source));
  const current = currentAuthority.filter((source) => source.status === "CURRENT");
  return {
    sources: candidates,
    rejected,
    multipleCurrentCount: current.length,
    multipleCurrentRefs: current.map((source) => source.source_ref).sort(),
  };
}

function sourceEvidence(source) {
  return {
    source_ref: source.source_ref,
    source_digest: source.source_digest,
    source_type: source.source_type,
    status: source.status,
    summary: source.summary,
  };
}

function taskFragment(value, index) {
  const normalized = String(value || "").trim();
  if (/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(normalized)) return normalized;
  const fallback = normalized
    .normalize("NFKC")
    .replace(/[^A-Za-z0-9._:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return fallback && /^[A-Za-z0-9]/.test(fallback) ? fallback : `ROW-${index + 1}`;
}

function canonicalTaskKey(item) {
  const taskId = String(item?.taskId || "").trim().toLowerCase();
  if (taskId && !/^(?:n\/a|none|pending|unknown|<)/i.test(taskId)) return `id:${taskId}`;
  const taskRef = String(item?.taskRef || "").trim().toLowerCase();
  return taskRef ? `ref:${taskRef}` : `row:${item?.source || "unknown"}:${item?.sourceRow || "unknown"}`;
}

function sourceStatusForQueueState(state) {
  if (state === "CURRENT") return "CURRENT";
  if (["DONE", "CANCELLED"].includes(state)) return "STALE";
  return "UNKNOWN";
}

function isTaskSourcePath(relativePath) {
  const normalized = relativePath.toLowerCase();
  const base = path.basename(normalized);
  if (normalized.includes("work-queue-takeover-reports/")) return false;
  if (normalized.includes("task-governance-reports/")) return false;
  if (["todo.md", "tasks.md", "task.md", "roadmap.md", "handoff.md"].includes(base)) return true;
  if (/^(?:tasks?|work-items?)\//i.test(relativePath)) return true;
  if (/^(work-queue|docs\/sessions|sessions|ai-logs|final-reports|follow-up-proposals|decision-briefs|active-work-threads)\//i.test(relativePath)) return true;
  if (/\b(todo|pending|follow-up|backlog|handoff|session|roadmap)\b/i.test(relativePath)) return true;
  return false;
}

function sourceTypeFor(relativePath) {
  const normalized = relativePath.toLowerCase();
  const base = path.basename(normalized);
  if (normalized.startsWith("work-queue/")) return "work_queue";
  if (base.includes("todo") || base.includes("tasks")) return "todo";
  if (normalized.includes("session")) return "session";
  if (normalized.includes("ai-logs")) return "ai_log";
  if (normalized.includes("handoff")) return "handoff";
  if (normalized.includes("roadmap")) return "roadmap";
  if (normalized.includes("issue")) return "issue_export";
  return "other";
}

function statusForSource(relativePath, content) {
  if (sourceTypeFor(relativePath) === "work_queue") return statusForWorkQueue(content);
  const currentRows = String(content).split(/\r?\n/)
    .filter((line) => /\|\s*`?CURRENT`?\s*\|/i.test(line));
  const currentIds = new Set(currentRows
    .map((line) => line.split("|").slice(1, -1)[0]?.replace(/`/g, "").trim())
    .filter(Boolean));
  if (currentRows.length > 1 && currentIds.size !== 1) return "RISKY";
  if (/UNSAFE_TO_TAKE_OVER|production incident|release conflict|dirty worktree\s*[:|]\s*(yes|dirty|unreviewed)/i.test(content)) return "RISKY";
  if (/done|completed|closed/i.test(content)) return "STALE";
  if (/stale|archive|archived|deprecated/i.test(content)) return "STALE";
  if (/^\s*(?:status|state)\s*:\s*(?:current|active|in[ -]?progress)\s*$/im.test(content)
    || /^#{1,4}\s+(?:current|active)\s+task\b/im.test(content)) return "CURRENT";
  return "UNKNOWN";
}

function statusForWorkQueue(content) {
  const currentTask = markdownSection(content, "Current Task");
  const workItems = markdownSection(content, "Work Items");
  const currentRows = [currentTask, workItems]
    .flatMap((section) => String(section).split(/\r?\n/))
    .filter((line) => /\|[^\n]*\|\s*`?CURRENT`?\s*\|/i.test(line));
  const currentIds = new Set(currentRows
    .map((line) => line.split("|").slice(1, -1)[0]?.replace(/`/g, "").trim())
    .filter(Boolean));
  if (currentIds.size > 1) return "RISKY";
  if (currentIds.size === 1) return "CURRENT";
  if (/\bUNSAFE_TO_TAKE_OVER\b|production incident|release conflict/i.test(currentTask)) return "RISKY";
  if (/^\s*(?:none|no current task)\b/im.test(currentTask)
    || /\|[^\n]*\|\s*`?(?:DONE|CLOSED|ARCHIVED)`?\s*\|/i.test(workItems)) return "STALE";
  return "UNKNOWN";
}

function markdownSection(content, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(content).match(new RegExp(`^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|\\Z)`, "im"));
  return match?.[1]?.trim() || "";
}

function isBlockingTaskAuthoritySource(source) {
  return ["work_queue", "todo", "session"].includes(source.source_type)
    || /^(?:active-work-threads|tasks?|work-items?)\//i.test(source.source_ref);
}

function summaryForSource(relativePath, content) {
  const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const firstTask = content.match(/^\s*[-*]\s+\[?\s?\]?\s*(.+)$/m)?.[1]?.trim();
  return cleanCell(title || firstTask || `Task source detected at ${relativePath}`).slice(0, 180);
}

function classFor({ exists, explicitUnsafe, rootGitDirty, hasExistingQueue, hasTaskSources, sourceInventory, hasTaskGovernanceRef }) {
  const governedExistingQueueReview = rootGitDirty
    && hasTaskGovernanceRef
    && hasExistingQueue
    && appearsReliable(sourceInventory);
  if (!exists || explicitUnsafe || (rootGitDirty && !governedExistingQueueReview)) return "UNSAFE_TO_TAKE_OVER";
  if (hasExistingQueue && appearsReliable(sourceInventory)) return "RELIABLE_EXISTING_TASK_SYSTEM";
  if (!hasTaskSources) return "MISSING_TASK_SYSTEM";
  return "MESSY_TASK_SYSTEM";
}

function appearsReliable(sourceInventory) {
  const queueSources = sourceInventory.filter((source) => source.source_type === "work_queue");
  if (queueSources.length === 0) return false;
  if (queueSources.some((source) => source.status === "RISKY")) return false;
  const currentCount = queueSources.filter((source) => source.status === "CURRENT").length;
  return currentCount === 1;
}

function actionFor(taskClass) {
  if (taskClass === "RELIABLE_EXISTING_TASK_SYSTEM") return "MAP_EXISTING_TASK_SYSTEM";
  if (taskClass === "UNSAFE_TO_TAKE_OVER") return "BLOCK_TAKEOVER";
  return "ESTABLISH_INTENTOS_WORK_QUEUE";
}

function authorityFor(taskClass) {
  if (taskClass === "RELIABLE_EXISTING_TASK_SYSTEM") return "PROJECT_NATIVE_MAPPED";
  if (taskClass === "UNSAFE_TO_TAKE_OVER") return "BLOCKED";
  return "INTENTOS_WORK_QUEUE";
}

function dispositionsFor(taskClass, sources) {
  if (sources.length === 0) return [];
  if (taskClass === "RELIABLE_EXISTING_TASK_SYSTEM") {
    const hasStructuredQueueRows = sources.some((source) => source.structured_row && source.source_type === "work_queue");
    return sources.map((source) => dispositionForReliableSource(source, hasStructuredQueueRows));
  }
  if (taskClass === "UNSAFE_TO_TAKE_OVER") {
    return sources.map((source) => disposition(source, source.status === "RISKY" ? "NEEDS_CLARIFICATION" : "ARCHIVE_SOURCE_ONLY", "N/A", "Project state is unsafe for task takeover; sources remain read-only evidence."));
  }
  const currentCandidate = sources.find((source) => source.status === "CURRENT" && canPromoteToCurrent(source))
    || sources.find((source) => canPromoteToCurrent(source));
  return sources.map((source) => {
    if (source.queue_state === "PAUSED") return disposition(source, "MIGRATE_PAUSED", "PAUSED", "Preserve the exact paused task; a structured resume decision is required before it can become current.");
    if (source.queue_state === "BLOCKED") return disposition(source, "MIGRATE_BLOCKED", "BLOCKED", "Preserve the exact blocked task without treating it as execution permission.");
    if (source.queue_state === "BACKLOG") return disposition(source, "MIGRATE_BACKLOG", "BACKLOG", "Preserve the exact backlog task without promoting it.");
    if (source.queue_state === "DONE") return disposition(source, "MARK_DONE_WITH_EVIDENCE", "DONE", "Preserve the exact completed task as non-executable history.");
    if (source.queue_state === "CANCELLED") return disposition(source, "ARCHIVE_SOURCE_ONLY", "N/A", "Preserve the exact cancelled task as source history.");
    if (source.status === "STALE") return disposition(source, "MARK_STALE", "N/A", "Source looks stale or completed; preserve as history.");
    if (source.status === "RISKY") return disposition(source, "NEEDS_CLARIFICATION", "BLOCKED", "Source carries risk signals and cannot become the current task.");
    if (isAmbiguousSource(source)) return disposition(source, "NEEDS_CLARIFICATION", "BLOCKED", "Source is ambiguous and should not be executed directly.");
    if (source === currentCandidate) return disposition(source, "MIGRATE_CURRENT", "CURRENT", "Use the first viable non-stale, non-risky source as the candidate current task after Task Governance binding.");
    return disposition(source, "MIGRATE_BACKLOG", "BACKLOG", "Source remains useful but is not execution permission.");
  });
}

function dispositionForReliableSource(source, hasStructuredQueueRows) {
  if (hasStructuredQueueRows && !(source.structured_row && source.source_type === "work_queue")) {
    return disposition(source, "ARCHIVE_SOURCE_ONLY", "N/A", "A structured Work Queue row is current authority; this supporting source is retained without creating a duplicate task.");
  }
  const values = {
    CURRENT: ["MIGRATE_CURRENT", "CURRENT", "Map the exact current task into the governed queue projection without replacing project task authority."],
    BACKLOG: ["MIGRATE_BACKLOG", "BACKLOG", "Map the exact backlog task without promoting it to current."],
    PAUSED: ["MIGRATE_PAUSED", "PAUSED", "Map the exact paused task; resumption still requires a structured current decision."],
    BLOCKED: ["MIGRATE_BLOCKED", "BLOCKED", "Map the exact blocked task without granting execution permission."],
    DONE: ["MARK_DONE_WITH_EVIDENCE", "DONE", "Preserve the exact completed task as non-executable history."],
    CANCELLED: ["ARCHIVE_SOURCE_ONLY", "N/A", "Preserve the exact cancelled task as source history."],
  };
  const selected = values[source.queue_state];
  if (selected) return disposition(source, ...selected);
  if (source.status === "CURRENT") {
    return disposition(source, "MIGRATE_CURRENT", "CURRENT", "Map the existing reliable current-task source into the governed queue projection without replacing project task authority.");
  }
  return disposition(source, "ARCHIVE_SOURCE_ONLY", "N/A", "Existing task source remains project history and is not duplicated into the execution queue.");
}

function disposition(source, dispositionValue, state, reason) {
  return {
    source_item: source.source_ref,
    source_digest: source.source_digest,
    disposition: dispositionValue,
    target_queue_state: state,
    reason,
  };
}

function canPromoteToCurrent(source) {
  return !["STALE", "RISKY"].includes(source.status) && !isAmbiguousSource(source);
}

function isAmbiguousSource(source) {
  return /blocked|needs|unclear|unknown/i.test(source.summary);
}

function queueItemsFor(taskClass, dispositions, sources) {
  if (taskClass === "UNSAFE_TO_TAKE_OVER") return [];
  const sourceByRef = new Map(sources.map((source) => [source.source_ref, source]));
  return dispositions
    .filter((item) => ["MIGRATE_CURRENT", "MIGRATE_BACKLOG", "MIGRATE_PAUSED", "MIGRATE_BLOCKED", "MARK_DONE_WITH_EVIDENCE"].includes(item.disposition))
    .map((item, index) => {
      const state = item.target_queue_state === "N/A" ? "BACKLOG" : item.target_queue_state;
      const current = state === "CURRENT";
      const source = sourceByRef.get(item.source_item);
      return {
        item_id: `WQ-${String(index + 1).padStart(3, "0")}`,
        state,
        title: cleanCell(source?.summary || titleFromSource(item.source_item)).slice(0, 180),
        source_item: item.source_item,
        source_item_digest: item.source_digest,
        task_governance_ref: current ? "task-governance-reports/001-current-task.md" : "N/A",
        task_governance_digest: "N/A",
        task_governance_binding_status: current ? "PENDING" : "N/A",
        execution_review_eligible_after_task_governance: current ? "Yes" : "No",
        execution_eligible: "No",
        reason: current
          ? "Not executable yet. It only becomes execution-review eligible after a real Task Governance report is recorded and checked."
          : "Not execution permission until promoted and governed.",
      };
    });
}

function reliabilityFor(taskClass, sources) {
  const hasSources = sources.length > 0;
  const hasQueue = sources.some((source) => source.source_type === "work_queue");
  const structuredQueueRows = sources.filter((source) => source.structured_row && source.source_type === "work_queue");
  const currentAuthority = structuredQueueRows.length > 0
    ? structuredQueueRows
    : sources.filter((source) => isBlockingTaskAuthoritySource(source));
  const currentCount = currentAuthority.filter((source) => source.status === "CURRENT").length;
  return [
    criterion("One current task", hasQueue && currentCount === 1 ? "Yes" : currentCount > 1 ? "No" : hasSources ? "Unknown" : "No", currentCount > 1 ? "Multiple distinct CURRENT task rows block takeover." : hasQueue ? "Existing queue source found." : "No reliable queue source found."),
    criterion("Stable task ids", hasQueue ? "Yes" : "Unknown", hasQueue ? "Work Queue source can provide task ids." : "Old sources may not have stable ids."),
    criterion("Task states", hasQueue ? "Yes" : "No", hasQueue ? "Queue states are available." : "Old sources do not consistently expose task state."),
    criterion("Owners or source owners", taskClass === "RELIABLE_EXISTING_TASK_SYSTEM" ? "Yes" : "Unknown", "Owner evidence must be preserved or added during migration."),
    criterion("Resume checkpoints", taskClass === "RELIABLE_EXISTING_TASK_SYSTEM" ? "Yes" : "Unknown", "Paused work needs resume review before execution."),
    criterion("Verification or close-out evidence", taskClass === "RELIABLE_EXISTING_TASK_SYSTEM" ? "Yes" : "Unknown", "Completion evidence must be checked before done claims."),
    criterion("No uncontrolled duplication", taskClass === "MESSY_TASK_SYSTEM" ? "No" : "Unknown", "Messy sources may contain duplicates; takeover must classify each item."),
  ];
}

function criterion(name, result, reason) {
  return { criterion: name, result, reason };
}

function blockedByFor({ exists, taskClass, rootGitDirty, explicitUnsafe }) {
  const blockers = [];
  if (!exists) blockers.push("target path does not exist");
  if (rootGitDirty && taskClass === "UNSAFE_TO_TAKE_OVER") blockers.push("root git worktree is dirty");
  if (explicitUnsafe) blockers.push("task sources contain unsafe takeover signal");
  if (taskClass === "UNSAFE_TO_TAKE_OVER" && blockers.length === 0) blockers.push("project is unsafe for task takeover");
  return blockers;
}

function outcomeFor(taskClass) {
  if (taskClass === "RELIABLE_EXISTING_TASK_SYSTEM") return "MAPPED_EXISTING_SYSTEM";
  if (taskClass === "UNSAFE_TO_TAKE_OVER") return "TAKEOVER_BLOCKED";
  return "TAKEOVER_RECOMMENDED";
}

function plainSummaryFor(taskClass) {
  if (taskClass === "RELIABLE_EXISTING_TASK_SYSTEM") {
    return "我检查到项目已有可用的任务体系。我会把它映射到 IntentOS Work Queue，不重复建立一套新队列。";
  }
  if (taskClass === "MESSY_TASK_SYSTEM") {
    return "我检查到旧任务记录不够可靠。我会建立 IntentOS Work Queue，旧记录保留为来源，后续任务以新队列为准。";
  }
  if (taskClass === "MISSING_TASK_SYSTEM") {
    return "我没有发现可靠的任务体系。我会建立 IntentOS Work Queue，让后续任务有明确入口。";
  }
  return "我发现当前项目状态不适合接管任务队列。我会先停止接管，只保留只读诊断。";
}

function renderMarkdown(evidence) {
  return `# Work Queue Takeover Report

This report reviews old project task sources and recommends whether IntentOS Work Queue should become the future task entry.

It does not authorize implementation.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | ${escapeCell(evidence.plain_user_summary)} |
| Task system class | \`${evidence.project_task_system_class}\` |
| Recommended action | \`${evidence.recommended_action}\` |
| Future task authority | \`${evidence.future_task_authority}\` |
| Current task intent | ${escapeCell(evidence.intent)} |
| Current task intent digest | \`${evidence.intent_digest}\` |
| Can Codex write now | \`${evidence.readiness.can_codex_write_now}\` |
| Can Codex execute tasks from old TODO directly | \`${evidence.readiness.can_execute_from_old_todo_directly}\` |

## Source Inventory

| Source | Digest | Type | Status | Summary |
| --- | --- | --- | --- | --- |
${rows(evidence.source_inventory, (item) => `| ${escapeCell(item.source_ref)} | ${escapeCell(item.source_digest)} | ${item.source_type} | ${item.status} | ${escapeCell(item.summary)} |`, "| None | N/A | other | MISSING | No task source found. |")}

## Reliability Assessment

| Criterion | Result | Reason |
| --- | --- | --- |
${rows(evidence.reliability_assessment, (item) => `| ${escapeCell(item.criterion)} | ${item.result} | ${escapeCell(item.reason)} |`)}

## Migration Dispositions

| Source Item | Source Digest | Disposition | Target Queue State | Reason |
| --- | --- | --- | --- | --- |
${rows(evidence.migration_dispositions, (item) => `| ${escapeCell(item.source_item)} | ${escapeCell(item.source_digest)} | ${item.disposition} | ${item.target_queue_state} | ${escapeCell(item.reason)} |`, "| None | N/A | ARCHIVE_SOURCE_ONLY | N/A | No old source item found. |")}

## Queue Items

| Item ID | State | Title | Task Ref | Intent | Intent Digest | Work Queue Item Digest | Source Item | Source Digest | Task Governance Ref | Task Governance Digest | Binding Status | Execution Review Eligible After Task Governance | Execution Eligible | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows(evidence.queue_items, (item) => queueItemRow(evidence, item), "| None | BACKLOG | No queue item | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | No | No | No executable queue item. |")}

## Boundaries

- This report writes target files: ${evidence.boundaries.writes_target_files}
- This report deletes old task sources: ${evidence.boundaries.deletes_old_task_sources}
- This report approves implementation: ${evidence.boundaries.approves_implementation}
- This report approves completion: ${evidence.boundaries.approves_completion}
- This report approves commit or push: ${evidence.boundaries.approves_commit_or_push}
- This report approves release or production: ${evidence.boundaries.approves_release_or_production}
- This report claims full adoption: ${evidence.boundaries.claims_full_adoption}
- This report installs native assets: ${evidence.boundaries.installs_native_assets}

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

\`${evidence.outcome}\`
`;
}

function rows(items, renderer, empty = "") {
  if (!items || items.length === 0) return empty;
  return items.map(renderer).join("\n");
}

function queueItemRow(evidence, item) {
  const identity = deriveWorkQueueTaskIdentity({
    workQueueItemRef: `artifact:${evidence.work_queue_takeover_ref}#${item.item_id}`,
    item,
    intent: evidence.intent,
  });
  const taskRef = identity.ok ? identity.task_ref : "N/A";
  const itemDigest = identity.ok ? identity.work_queue_item_digest : "N/A";
  return `| ${item.item_id} | ${item.state} | ${escapeCell(item.title)} | ${taskRef} | ${escapeCell(evidence.intent)} | ${evidence.intent_digest} | ${itemDigest} | ${escapeCell(item.source_item)} | ${escapeCell(item.source_item_digest)} | ${escapeCell(item.task_governance_ref)} | ${escapeCell(item.task_governance_digest)} | ${item.task_governance_binding_status} | ${item.execution_review_eligible_after_task_governance} | ${item.execution_eligible} | ${escapeCell(item.reason)} |`;
}

function titleFromSource(source) {
  return path.basename(source, path.extname(source)).replace(/^\d+-/, "").replace(/[-_]+/g, " ");
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function cleanCell(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>");
}

function resolveOutputPath(root, requested) {
  if (path.isAbsolute(requested)) {
    console.error(`FAIL --out must be a relative path inside target project: ${requested}`);
    process.exit(1);
  }
  const resolved = path.resolve(root, requested);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error(`FAIL --out must stay inside target project: ${requested}`);
    process.exit(1);
  }
  return resolved;
}

function writeOutput(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}
