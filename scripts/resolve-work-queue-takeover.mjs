#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  defaultIgnoredDirs,
  walkRelativePaths,
} from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["intent", "json", "format", "out"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const intent = String(args.intent || args._.slice(1).join(" ") || "review existing project task records");
const outputFormat = args.json ? "json" : String(args.format || "human");
const outputPath = args.out ? resolveOutputPath(projectRoot, String(args.out)) : null;

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
  const paths = exists ? walkRelativePaths(projectRoot, ".", {
    maxDepth: 6,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const sourceInventory = exists ? discoverTaskSources(projectRoot, paths) : [];
  const gitState = exists ? gitWorktreeState(projectRoot) : { isGitRepository: false, isDirty: false };
  const explicitUnsafe = sourceInventory.some((source) => source.status === "RISKY"
    || /UNSAFE_TO_TAKE_OVER|production incident|dirty worktree|release conflict/i.test(source.summary));
  const rootGitDirty = fs.existsSync(path.join(projectRoot, ".git")) && gitState.isDirty;
  const hasExistingQueue = sourceInventory.some((source) => source.source_type === "work_queue");
  const hasTaskSources = sourceInventory.length > 0;
  const taskClass = classFor({ exists, explicitUnsafe, rootGitDirty, hasExistingQueue, hasTaskSources, sourceInventory });
  const recommendedAction = actionFor(taskClass);
  const futureAuthority = authorityFor(taskClass);
  const dispositions = dispositionsFor(taskClass, sourceInventory);
  const queueItems = queueItemsFor(taskClass, dispositions);
  const takeoverRef = outputPath
    ? path.relative(projectRoot, outputPath).replaceAll(path.sep, "/")
    : "work-queue-takeover-reports/generated.md";
  const blockedBy = blockedByFor({ exists, taskClass, rootGitDirty, explicitUnsafe });
  const baseEvidence = {
    schema_version: "1.84.0",
    artifact_type: "work_queue_takeover",
    work_queue_takeover_ref: takeoverRef,
    work_queue_takeover_digest: "sha256:pending",
    intent,
    intent_digest: digest(intent),
    project_task_system_class: taskClass,
    recommended_action: recommendedAction,
    future_task_authority: futureAuthority,
    plain_user_summary: plainSummaryFor(taskClass),
    source_inventory: sourceInventory,
    reliability_assessment: reliabilityFor(taskClass, sourceInventory),
    migration_dispositions: dispositions,
    queue_items: queueItems,
    readiness: {
      takeover_ready: blockedBy.length === 0 ? "Yes" : "No",
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

function discoverTaskSources(root, paths) {
  const candidates = [];
  for (const relativePath of paths) {
    if (!/\.(md|txt)$/i.test(relativePath)) continue;
    if (!isTaskSourcePath(relativePath)) continue;
    const fullPath = path.join(root, relativePath);
    const content = readFile(fullPath);
    candidates.push({
      source_ref: relativePath,
      source_type: sourceTypeFor(relativePath),
      status: statusForSource(relativePath, content),
      summary: summaryForSource(relativePath, content),
    });
  }
  return candidates.slice(0, 40);
}

function isTaskSourcePath(relativePath) {
  const normalized = relativePath.toLowerCase();
  const base = path.basename(normalized);
  if (normalized.includes("work-queue-takeover-reports/")) return false;
  if (normalized.includes("task-governance-reports/")) return false;
  if (["todo.md", "tasks.md", "task.md", "roadmap.md", "handoff.md"].includes(base)) return true;
  if (/^(work-queue|docs\/sessions|sessions|ai-logs|final-reports|follow-up-proposals|decision-briefs|active-work-threads)\//i.test(relativePath)) return true;
  if (/\b(todo|pending|follow-up|backlog|handoff|session|roadmap)\b/i.test(relativePath)) return true;
  return false;
}

function sourceTypeFor(relativePath) {
  const normalized = relativePath.toLowerCase();
  const base = path.basename(normalized);
  if (base.includes("todo") || base.includes("tasks")) return "todo";
  if (normalized.startsWith("work-queue/")) return "work_queue";
  if (normalized.includes("session")) return "session";
  if (normalized.includes("ai-logs")) return "ai_log";
  if (normalized.includes("handoff")) return "handoff";
  if (normalized.includes("roadmap")) return "roadmap";
  if (normalized.includes("issue")) return "issue_export";
  return "other";
}

function statusForSource(relativePath, content) {
  if (/UNSAFE_TO_TAKE_OVER|production incident|dirty worktree|release conflict/i.test(content)) return "RISKY";
  if (/CURRENT|active task|in progress/i.test(content)) return "CURRENT";
  if (/done|completed|closed/i.test(content)) return "STALE";
  if (/stale|archive|archived|deprecated/i.test(content)) return "STALE";
  return "UNKNOWN";
}

function summaryForSource(relativePath, content) {
  const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const firstTask = content.match(/^\s*[-*]\s+\[?\s?\]?\s*(.+)$/m)?.[1]?.trim();
  return cleanCell(title || firstTask || `Task source detected at ${relativePath}`).slice(0, 180);
}

function classFor({ exists, explicitUnsafe, rootGitDirty, hasExistingQueue, hasTaskSources, sourceInventory }) {
  if (!exists || explicitUnsafe || rootGitDirty) return "UNSAFE_TO_TAKE_OVER";
  if (hasExistingQueue && appearsReliable(sourceInventory)) return "RELIABLE_EXISTING_TASK_SYSTEM";
  if (!hasTaskSources) return "MISSING_TASK_SYSTEM";
  return "MESSY_TASK_SYSTEM";
}

function appearsReliable(sourceInventory) {
  const queueSources = sourceInventory.filter((source) => source.source_type === "work_queue");
  if (queueSources.length === 0) return false;
  const currentCount = queueSources.filter((source) => source.status === "CURRENT").length;
  return currentCount <= 1;
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
    return sources.map((source) => ({
      source_item: source.source_ref,
      disposition: "ARCHIVE_SOURCE_ONLY",
      target_queue_state: "N/A",
      reason: "Existing task system appears reliable and can be mapped without duplicate migration.",
    }));
  }
  if (taskClass === "UNSAFE_TO_TAKE_OVER") {
    return sources.map((source) => ({
      source_item: source.source_ref,
      disposition: source.status === "RISKY" ? "NEEDS_CLARIFICATION" : "ARCHIVE_SOURCE_ONLY",
      target_queue_state: "N/A",
      reason: "Project state is unsafe for task takeover; sources remain read-only evidence.",
    }));
  }
  return sources.slice(0, 20).map((source, index) => {
    if (index === 0) return disposition(source, "MIGRATE_CURRENT", "CURRENT", "Use the first viable source as the candidate current task after Task Governance binding.");
    if (source.status === "STALE") return disposition(source, "MARK_STALE", "N/A", "Source looks stale or completed; preserve as history.");
    if (/blocked|needs|unclear|unknown/i.test(source.summary)) return disposition(source, "NEEDS_CLARIFICATION", "BLOCKED", "Source is ambiguous and should not be executed directly.");
    return disposition(source, "MIGRATE_BACKLOG", "BACKLOG", "Source remains useful but is not execution permission.");
  });
}

function disposition(source, dispositionValue, state, reason) {
  return {
    source_item: source.source_ref,
    disposition: dispositionValue,
    target_queue_state: state,
    reason,
  };
}

function queueItemsFor(taskClass, dispositions) {
  if (taskClass === "UNSAFE_TO_TAKE_OVER") return [];
  return dispositions
    .filter((item) => ["MIGRATE_CURRENT", "MIGRATE_BACKLOG", "MIGRATE_PAUSED", "MIGRATE_BLOCKED"].includes(item.disposition))
    .map((item, index) => {
      const state = item.target_queue_state === "N/A" ? "BACKLOG" : item.target_queue_state;
      const executable = state === "CURRENT" ? "Yes" : "No";
      return {
        item_id: `WQ-${String(index + 1).padStart(3, "0")}`,
        state,
        title: titleFromSource(item.source_item),
        source_item: item.source_item,
        task_governance_ref: state === "CURRENT" ? "task-governance-reports/001-current-task.md" : "N/A",
        task_governance_digest: state === "CURRENT" ? digest(`task-governance:${item.source_item}`) : "N/A",
        execution_eligible: executable,
        reason: executable === "Yes"
          ? "Executable only after the referenced Task Governance report is recorded and checked."
          : "Not execution permission until promoted and governed.",
      };
    });
}

function reliabilityFor(taskClass, sources) {
  const hasSources = sources.length > 0;
  const hasQueue = sources.some((source) => source.source_type === "work_queue");
  const currentCount = sources.filter((source) => source.status === "CURRENT").length;
  return [
    criterion("One current task", hasQueue && currentCount <= 1 ? "Yes" : hasSources ? "Unknown" : "No", hasQueue ? "Existing queue source found." : "No reliable queue source found."),
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
  if (rootGitDirty) blockers.push("root git worktree is dirty");
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
| Can Codex write now | \`${evidence.readiness.can_codex_write_now}\` |
| Can Codex execute tasks from old TODO directly | \`${evidence.readiness.can_execute_from_old_todo_directly}\` |

## Source Inventory

| Source | Type | Status | Summary |
| --- | --- | --- | --- |
${rows(evidence.source_inventory, (item) => `| ${escapeCell(item.source_ref)} | ${item.source_type} | ${item.status} | ${escapeCell(item.summary)} |`, "| None | other | MISSING | No task source found. |")}

## Reliability Assessment

| Criterion | Result | Reason |
| --- | --- | --- |
${rows(evidence.reliability_assessment, (item) => `| ${escapeCell(item.criterion)} | ${item.result} | ${escapeCell(item.reason)} |`)}

## Migration Dispositions

| Source Item | Disposition | Target Queue State | Reason |
| --- | --- | --- | --- |
${rows(evidence.migration_dispositions, (item) => `| ${escapeCell(item.source_item)} | ${item.disposition} | ${item.target_queue_state} | ${escapeCell(item.reason)} |`, "| None | ARCHIVE_SOURCE_ONLY | N/A | No old source item found. |")}

## Queue Items

| Item ID | State | Title | Source Item | Task Governance Ref | Task Governance Digest | Execution Eligible | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows(evidence.queue_items, (item) => `| ${item.item_id} | ${item.state} | ${escapeCell(item.title)} | ${escapeCell(item.source_item)} | ${escapeCell(item.task_governance_ref)} | ${escapeCell(item.task_governance_digest)} | ${item.execution_eligible} | ${escapeCell(item.reason)} |`, "| None | BACKLOG | No queue item | N/A | N/A | N/A | No | No executable queue item. |")}

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
