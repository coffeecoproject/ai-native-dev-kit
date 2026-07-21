#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  defaultIgnoredDirs,
  walkRelativePaths,
} from "./lib/project-signals.mjs";
import {
  normalizeTaskIntent,
  resolveWorkQueueTaskIdentity,
  taskIntentDigest,
  validateTaskGovernanceLineage,
} from "./lib/task-entry-binding.mjs";

const isMain = process.argv[1] && sameFile(process.argv[1], fileURLToPath(import.meta.url));

if (isMain) runCli();

function sameFile(left, right) {
  try {
    return fs.realpathSync(left) === fs.realpathSync(right);
  } catch {
    return path.resolve(left) === path.resolve(right);
  }
}

function runCli() {
  const args = parseArgs(process.argv.slice(2));
  const knownFlags = new Set(["json", "format"]);
  const unknown = unknownOptions(args, knownFlags);
  const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
  const outputFormat = args.json ? "json" : String(args.format || "human");

  if (unknown.length > 0) {
    console.error(`FAIL unknown option: --${unknown.join(", --")}`);
    process.exit(1);
  }

  if (!new Set(["human", "json"]).has(outputFormat)) {
    console.error(`FAIL unknown --format: ${outputFormat}`);
    console.error("Use --format human, --format json, or --json.");
    process.exit(1);
  }

  const report = buildWorkQueueRecommendation(projectRoot);
  if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
  else printHuman(report);
}

export function buildWorkQueueRecommendation(root) {
  const exists = fs.existsSync(root);
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const queueReports = exists ? collectMarkdown(root, paths, /^work-queue\//i) : [];
  const taskCards = exists ? collectMarkdown(root, paths, /^tasks\//i) : [];
  const activeThreads = exists ? collectMarkdown(root, paths, /^active-work-threads\//i) : [];
  const parkingArtifacts = exists ? collectMarkdown(root, paths, /^(follow-up-proposals|status-reports|decision-briefs|scope-change-reports)\//i) : [];
  const gitState = exists ? gitWorktreeState(root) : null;
  const inference = inferWorkItems(queueReports, taskCards, activeThreads, parkingArtifacts);
  const items = inference.items;
  const current = items.filter((item) => item.state === "CURRENT");
  const paused = items.filter((item) => item.state === "PAUSED");
  const backlog = items.filter((item) => item.state === "BACKLOG");
  const blocked = items.filter((item) => item.state === "BLOCKED");
  const typedEvidence = exists ? collectTypedTaskEvidence(root, paths) : emptyTypedTaskEvidence();
  const canonicalCurrentTaskIdentity = resolveCanonicalCurrentTaskIdentity(root, current, typedEvidence);
  const resumeCandidates = paused.map((item) => ({
    taskId: item.taskId,
    title: item.title,
    resumeReviewNeeded: "Yes",
    requiredBeforeResume: [
      "Check current project state",
      "Check dirty worktree",
      "Check last evidence validity",
      "Confirm human resume decision",
    ],
  }));
  const summary = summaryFor({
    exists,
    queueReports,
    taskCards,
    activeThreads,
    current,
    paused,
    backlog,
    blocked,
    gitState,
    conflicts: inference.conflicts,
  });

  return {
    reportType: "WORK_QUEUE_RECOMMENDATION",
    generatedBy: "scripts/resolve-work-queue.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanDecisionSummary: summary,
    queueInventory: {
      queueReportCount: queueReports.length,
      taskCardCount: taskCards.length,
      activeWorkThreadCount: activeThreads.length,
      parkingArtifactCount: parkingArtifacts.length,
      parsedRowCount: inference.parsedRowCount,
      canonicalItemCount: items.length,
      canonicalizationConflictCount: inference.conflicts.length,
      typedTakeoverReportCount: typedEvidence.takeovers.length,
      typedTaskGovernanceReportCount: typedEvidence.governance.length,
      typedCompletionEvidenceReportCount: typedEvidence.completions.length,
      invalidTypedTaskReportCount: typedEvidence.invalid.length,
    },
    canonicalizationConflicts: inference.conflicts,
    currentTaskCount: current.length,
    currentTaskCandidates: current,
    canonicalCurrentTaskIdentity,
    pausedTasks: paused,
    blockedTasks: blocked,
    backlogItems: backlog,
    resumeCandidates,
    gitState: gitState || {
      isGitRepository: false,
      isDirty: false,
      currentBranch: null,
      changedFileCount: 0,
      changedFilesSample: [],
    },
    recommendedQueueActions: actionsFor({ exists, current, paused, backlog, blocked, queueReports, taskCards, gitState, conflicts: inference.conflicts }),
    humanDecisionsNeeded: decisionsFor({ exists, current, paused, backlog, blocked, conflicts: inference.conflicts }),
    boundary: {
      changesTaskState: "No",
      approvesImplementation: "No",
      approvesTargetProjectWrites: "No",
      approvesScopeExpansion: "No",
      approvesReleaseOrProduction: "No",
      overridesTaskSpecOrReviewLoop: "No",
      resumesStaleWorkWithoutReview: "No",
    },
    outcome: outcomeFor({ exists, current, paused, queueReports, conflicts: inference.conflicts }),
  };
}

function collectMarkdown(root, paths, pattern) {
  return paths
    .filter((relativePath) => pattern.test(relativePath) && /\.md$/i.test(relativePath))
    .map((relativePath) => {
      const fullPath = path.join(root, relativePath);
      return {
        path: relativePath,
        title: titleFromFile(fullPath, relativePath),
        content: readFile(fullPath),
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

function emptyTypedTaskEvidence() {
  return { takeovers: [], governance: [], completions: [], invalid: [] };
}

function collectTypedTaskEvidence(root, paths) {
  const result = emptyTypedTaskEvidence();
  const expectedTypes = new Map([
    ["work-queue-takeover-reports", ["work_queue_takeover", "takeovers"]],
    ["task-governance-reports", ["task_governance", "governance"]],
    ["completion-evidence-reports", ["completion_evidence_gate", "completions"]],
  ]);
  for (const relativePath of paths.filter((entry) => /^(?:work-queue-takeover-reports|task-governance-reports|completion-evidence-reports)\/.*\.md$/i.test(entry))) {
    const directory = relativePath.split("/")[0].toLowerCase();
    const [expectedType, bucket] = expectedTypes.get(directory) || [];
    const file = path.join(root, relativePath);
    const extracted = extractMachineReadableEvidence(readFile(file));
    if (!extracted?.ok || extracted.value?.artifact_type !== expectedType) {
      result.invalid.push({ ref: relativePath, reason: `missing typed ${expectedType || "task"} evidence` });
      continue;
    }
    result[bucket].push({ ref: relativePath, file, evidence: extracted.value });
  }
  return result;
}

function resolveCanonicalCurrentTaskIdentity(root, currentTasks, typedEvidence) {
  if (currentTasks.length !== 1) {
    return unavailableTaskIdentity(
      currentTasks.length > 1 ? "AMBIGUOUS" : "MISSING",
      currentTasks.length > 1
        ? "More than one task is marked current, so no completion identity can be selected."
        : "No single current task is recorded in the Work Queue.",
    );
  }

  const current = currentTasks[0];
  if (!current.intentDigest) {
    return unavailableTaskIdentity("MISSING", "The current Work Queue item has no canonical intent identity.");
  }

  const chains = [];
  const anchoredFailures = [];
  for (const takeoverRecord of typedEvidence.takeovers) {
    const takeover = takeoverRecord.evidence;
    const currentItems = arrayValue(takeover.queue_items).filter((item) => item?.state === "CURRENT");
    if (currentItems.length !== 1) continue;
    const item = currentItems[0];
    if (!takeoverAnchorsCurrentQueue(takeover, item, current)) continue;

    const takeoverRef = normalizeArtifactRef(takeover.work_queue_takeover_ref);
    if (takeoverRef !== takeoverRecord.ref
      || !validEvidenceDigest(takeover, "work_queue_takeover_digest")
      || takeover.readiness?.takeover_ready !== "Yes"
      || takeover.readiness?.takeover_review_ready !== "Yes"
      || item.task_governance_binding_status !== "VERIFIED") {
      anchoredFailures.push("The typed takeover record for the current task is invalid or not ready.");
      continue;
    }

    const resolvedTask = resolveWorkQueueTaskIdentity(
      root,
      `artifact:${takeoverRecord.ref}#${String(item.item_id || "")}`,
      { requireCurrent: true },
    );
    if (!resolvedTask.ok) {
      anchoredFailures.push(`The current takeover record is stale or unreadable: ${resolvedTask.error}`);
      continue;
    }

    const governanceMatches = typedEvidence.governance.filter((record) =>
      record.ref === normalizeArtifactRef(item.task_governance_ref)
      && record.evidence.task_governance_digest === item.task_governance_digest);
    if (governanceMatches.length !== 1) {
      anchoredFailures.push("The current takeover record does not bind exactly one typed Task Governance report.");
      continue;
    }
    const governanceRecord = governanceMatches[0];
    const governance = governanceRecord.evidence;
    const lineage = validateTaskGovernanceLineage(root, governance, {
      fromFile: governanceRecord.file,
      requireCurrent: true,
    });
    if (!validEvidenceDigest(governance, "task_governance_digest")
      || normalizeArtifactRef(governance.task_governance_ref) !== governanceRecord.ref
      || !canonicalIntent(governance)
      || !lineage.ok
      || governance.task_ref !== resolvedTask.identity.task_ref
      || governance.intent_digest !== current.intentDigest
      || governance.intent !== takeover.intent) {
      anchoredFailures.push("The current Task Governance report does not match the exact takeover task and intent.");
      continue;
    }

    const completionMatches = typedEvidence.completions.filter((record) =>
      completionMatchesTaskChain(record, resolvedTask.identity, governanceRecord, governance));
    for (const completionRecord of completionMatches) {
      chains.push(buildTaskIdentityChain(current, takeoverRecord, item, resolvedTask.identity, governanceRecord, governance, completionRecord));
    }
    if (completionMatches.length === 0) {
      anchoredFailures.push("No ready Completion Evidence matches the current Work Queue, takeover, Task Governance, task, and intent.");
    }
  }

  if (chains.length !== 1) {
    return unavailableTaskIdentity(
      chains.length > 1 ? "AMBIGUOUS" : "MISSING",
      chains.length > 1
        ? "More than one complete typed evidence chain matches the current task, so none can be selected automatically."
        : anchoredFailures[0] || "The current task is not bound to one matching typed takeover, Task Governance report, and ready Completion Evidence.",
      chains.length,
    );
  }
  return chains[0];
}

function takeoverAnchorsCurrentQueue(takeover, item, current) {
  const sourceRef = normalizeArtifactRef(item.source_item);
  const currentRefs = new Set([current.source, current.taskRef].map(normalizeArtifactRef).filter(Boolean));
  return currentRefs.has(sourceRef)
    && takeover.intent_digest === current.intentDigest
    && canonicalIntent(takeover);
}

function completionMatchesTaskChain(record, taskIdentity, governanceRecord, governance) {
  const completion = record.evidence;
  const binding = completion.task_entry_binding || {};
  return validEvidenceDigest(completion, "completion_gate_digest")
    && normalizeArtifactRef(completion.completion_evidence_ref) === record.ref
    && canonicalIntent(completion)
    && completion.task_ref === taskIdentity.task_ref
    && completion.intent === governance.intent
    && completion.intent_digest === governance.intent_digest
    && completion.completion_state === "COMPLETION_EVIDENCE_READY"
    && completion.can_claim_complete === "Yes"
    && normalizeArtifactRefWithFragment(binding.work_queue_item_ref) === normalizeArtifactRefWithFragment(taskIdentity.work_queue_item_ref)
    && binding.work_queue_item_digest === taskIdentity.work_queue_item_digest
    && binding.work_queue_item_state === "CURRENT"
    && binding.work_queue_item_current_task_match === "Yes"
    && normalizeArtifactRef(binding.task_governance_ref) === governanceRecord.ref
    && binding.task_governance_digest === governance.task_governance_digest
    && binding.task_governance_task_match === "Yes"
    && binding.task_governance_blocks_completion === "No";
}

function buildTaskIdentityChain(current, takeoverRecord, item, taskIdentity, governanceRecord, governance, completionRecord) {
  const completion = completionRecord.evidence;
  const sourceSystems = arrayValue(completion.source_chain);
  return {
    status: "READY",
    resolution: "CURRENT_WORK_QUEUE_TYPED_EVIDENCE_CHAIN",
    taskRef: taskIdentity.task_ref,
    intent: governance.intent,
    intentDigest: governance.intent_digest,
    workQueueTaskId: current.taskId,
    workQueueItemId: item.item_id,
    workQueueItemRef: taskIdentity.work_queue_item_ref,
    workQueueItemDigest: taskIdentity.work_queue_item_digest,
    taskImpact: String(governance.impact_classification?.task_impact || "POSSIBLE_HIGH"),
    sourceRefs: {
      workQueue: current.source,
      takeover: takeoverRecord.ref,
      taskGovernance: governanceRecord.ref,
      completionEvidence: completionRecord.ref,
      businessUniverse: normalizeArtifactRef(completion.business_universe_binding?.business_universe_ref),
      controlEffectiveness: normalizeArtifactRef(completion.control_effectiveness_binding?.report_ref),
      planReview: normalizeArtifactRef(completion.plan_review_binding?.plan_review_ref),
      executionAssurance: normalizeArtifactRef(sourceSystems.find((source) => source?.name === "execution_assurance")?.ref),
    },
    taskGovernanceDigest: governance.task_governance_digest,
    completionEvidenceDigest: completion.completion_gate_digest,
    businessUniverseRequired: governance.business_universe_routing?.required === "Yes",
    controlEffectivenessRequired: governance.control_effectiveness_routing?.required === "Yes",
    requiredControlClaimIds: arrayValue(governance.control_effectiveness_routing?.required_claim_ids).map(String),
    planReviewRequired: completion.plan_review_binding?.required === "Yes",
    matchingChainCount: 1,
    blockers: [],
  };
}

function unavailableTaskIdentity(status, reason, matchingChainCount = 0) {
  return {
    status,
    resolution: "FAIL_CLOSED",
    taskRef: "",
    intent: "",
    intentDigest: "",
    sourceRefs: {},
    matchingChainCount,
    blockers: [reason],
  };
}

function canonicalIntent(evidence) {
  const normalized = normalizeTaskIntent(evidence?.intent);
  return Boolean(normalized)
    && evidence.intent === normalized
    && evidence.intent_digest === taskIntentDigest(normalized);
}

function validEvidenceDigest(evidence, field) {
  return /^sha256:[a-f0-9]{64}$/.test(String(evidence?.[field] || ""))
    && evidence[field] === evidenceDigest(evidence, [field]);
}

function normalizeArtifactRef(value) {
  return String(value || "")
    .trim()
    .replace(/^(?:artifact|file):/i, "")
    .split("#")[0]
    .replaceAll("\\", "/");
}

function normalizeArtifactRefWithFragment(value) {
  return String(value || "")
    .trim()
    .replace(/^(?:artifact|file):/i, "")
    .replaceAll("\\", "/");
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function inferWorkItems(queueReports, taskCards, activeThreads, parkingArtifacts) {
  const reportItems = queueReports.flatMap((report) => parseWorkItems(report));
  const items = [...reportItems];
  for (const thread of activeThreads) {
    items.push({
      taskId: idFromPath(thread.path),
      taskRef: thread.path,
      intentDigest: intentDigestFromContent(thread.content),
      title: thread.title,
      state: "CURRENT",
      source: thread.path,
      evidence: "active-work-thread detected",
      resumeReview: "N/A",
      notes: "candidate only; confirm with human before execution",
    });
  }

  if (reportItems.length === 0 && activeThreads.length === 0 && taskCards.length > 0) {
    const first = taskCards[0];
    items.push({
      taskId: idFromPath(first.path),
      taskRef: first.path,
      intentDigest: intentDigestFromContent(first.content),
      title: first.title,
      state: "CURRENT",
      source: first.path,
      evidence: "task card detected; no Work Queue report exists",
      resumeReview: "N/A",
      notes: "candidate only; create Work Queue report before long-running work",
    });
    for (const task of taskCards.slice(1, 10)) {
      items.push({
        taskId: idFromPath(task.path),
        taskRef: task.path,
        intentDigest: intentDigestFromContent(task.content),
        title: task.title,
        state: "BACKLOG",
        source: task.path,
        evidence: "additional task card detected",
        resumeReview: "Required before promotion",
        notes: "parked until promoted by human decision",
      });
    }
  }

  for (const artifact of (reportItems.length === 0 ? parkingArtifacts : []).slice(0, 10)) {
    items.push({
      taskId: idFromPath(artifact.path),
      taskRef: artifact.path,
      intentDigest: intentDigestFromContent(artifact.content),
      title: artifact.title,
      state: "BACKLOG",
      source: artifact.path,
      evidence: "parking or decision artifact detected",
      resumeReview: "Required before promotion",
      notes: "not execution permission",
    });
  }

  const canonical = canonicalizeWorkQueueItems(items);
  return {
    ...canonical,
    parsedRowCount: items.length,
  };
}

export function parseWorkQueueReport(report) {
  const items = [];
  const invalidRows = [];
  const lines = report.content.split(/\r?\n/);
  let section = "Unsectioned";
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^##\s+(.+?)\s*$/);
    if (heading) {
      section = strip(heading[1]);
      continue;
    }
    if (!isTableHeader(lines, index)) continue;
    const headers = tableCells(lines[index]).map(normalizedHeader);
    const stateIndex = headerIndex(headers, ["state", "task state"]);
    const taskIdIndex = headerIndex(headers, ["task id", "item id", "id"]);
    if (stateIndex === -1 || taskIdIndex === -1) continue;
    const titleIndex = headerIndex(headers, ["title", "task", "work item"]);
    const taskRefIndex = headerIndex(headers, [
      "task ref",
      "task reference",
      "task spec reference",
      "task or spec reference",
      "source item",
    ]);
    const intentDigestIndex = headerIndex(headers, ["intent digest", "intent hash"]);
    const evidenceIndex = headerIndex(headers, ["evidence", "last evidence", "governance"]);
    const resumeIndex = headerIndex(headers, ["resume review", "resume review needed"]);
    const notesIndex = headerIndex(headers, ["notes", "reason"]);

    index += 2;
    while (index < lines.length && lines[index].trim().startsWith("|")) {
      const cells = tableCells(lines[index]);
      const rawState = cells[stateIndex] || "";
      const state = stateFor(rawState);
      if (!state) {
        invalidRows.push({
          source: report.path,
          section,
          row: index + 1,
          state: strip(rawState),
        });
        index += 1;
        continue;
      }
      const taskId = strip(cells[taskIdIndex]) || idFromPath(report.path);
      const rawTaskRef = taskRefIndex >= 0 ? normalizedTaskRef(cells[taskRefIndex]) : "";
      const evidence = evidenceIndex >= 0 ? strip(cells[evidenceIndex]) : "Work Queue report row";
      items.push({
        taskId,
        taskRef: isTaskIdentityRef(rawTaskRef) ? rawTaskRef : "",
        intentDigest: intentDigestIndex >= 0 ? normalizedIntentDigest(cells[intentDigestIndex]) : "",
        title: titleIndex >= 0 ? strip(cells[titleIndex]) || report.title : report.title,
        state,
        source: report.path,
        sourceView: section,
        sourceRow: index + 1,
        evidence: rawTaskRef && !isTaskIdentityRef(rawTaskRef) ? rawTaskRef : evidence || "Work Queue report row",
        resumeReview: resumeIndex >= 0 ? strip(cells[resumeIndex]) || "PENDING" : "PENDING",
        notes: notesIndex >= 0 ? strip(cells[notesIndex]) : "",
        viewPriority: workQueueViewPriority(section),
      });
      index += 1;
    }
    index -= 1;
  }
  return { items, invalidRows };
}

function parseWorkItems(report) {
  return parseWorkQueueReport(report).items;
}

function stateFor(value) {
  const normalized = strip(value).toUpperCase();
  return ["CURRENT", "PAUSED", "BLOCKED", "BACKLOG", "DONE", "CANCELLED"].includes(normalized)
    ? normalized
    : null;
}

export function canonicalizeWorkQueueItems(items) {
  const groups = new Map();
  for (const item of items) {
    const key = canonicalItemKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  const canonicalItems = [];
  const conflicts = [];
  for (const [key, representations] of groups) {
    const ordered = [...representations].sort((left, right) =>
      (right.viewPriority || 0) - (left.viewPriority || 0)
      || String(left.source || "").localeCompare(String(right.source || ""))
      || (left.sourceRow || 0) - (right.sourceRow || 0));
    const states = uniqueNonempty(ordered.map((item) => item.state));
    const intentDigests = uniqueNonempty(ordered.map((item) => item.intentDigest));
    const taskRefs = uniqueNonempty(ordered.map((item) => item.taskRef));
    if (states.length > 1) conflicts.push(canonicalConflict("STATE_MISMATCH", key, states, ordered));
    if (intentDigests.length > 1) conflicts.push(canonicalConflict("INTENT_DIGEST_MISMATCH", key, intentDigests, ordered));
    if (taskRefs.length > 1) conflicts.push(canonicalConflict("TASK_REF_MISMATCH", key, taskRefs, ordered));
    const preferred = ordered[0];
    canonicalItems.push({
      taskId: preferred.taskId,
      taskRef: firstNonempty(ordered.map((item) => item.taskRef)),
      intentDigest: firstNonempty(ordered.map((item) => item.intentDigest)),
      title: firstNonempty(ordered.map((item) => item.title)),
      state: preferred.state,
      source: preferred.source,
      evidence: firstNonempty(ordered.map((item) => item.evidence)) || "Work Queue report row",
      resumeReview: firstNonempty(ordered.map((item) => item.resumeReview)) || "PENDING",
      notes: firstNonempty(ordered.map((item) => item.notes)),
      representedBy: ordered.map((item) => ({
        source: item.source,
        section: item.sourceView || "inferred",
        row: item.sourceRow || null,
      })),
    });
  }
  return { items: canonicalItems, conflicts };
}

function normalizedTaskRef(value) {
  const text = strip(value);
  if (!text || /^(?:pending|n\/a|none|<)/i.test(text)) return "";
  return text.replace(/^artifact:/i, "");
}

function normalizedIntentDigest(value) {
  const text = strip(value);
  return /^sha256:[a-f0-9]{64}$/i.test(text) ? text.toLowerCase() : "";
}

function isTableHeader(lines, index) {
  return lines[index]?.trim().startsWith("|")
    && /^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(lines[index + 1] || "");
}

function tableCells(line) {
  const text = String(line || "").trim();
  if (!text.startsWith("|")) return [];
  return text.split("|").slice(1, -1).map((cell) => strip(cell));
}

function normalizedHeader(value) {
  return strip(value)
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, " ")
    .trim();
}

function headerIndex(headers, aliases) {
  const normalizedAliases = aliases.map(normalizedHeader);
  return headers.findIndex((header) => normalizedAliases.includes(header));
}

function isTaskIdentityRef(value) {
  const ref = String(value || "").replace(/^(artifact|file):/i, "");
  if (!ref) return false;
  if (/^task:/i.test(ref)) return true;
  if (/^(?:tasks?|requests?|issues?|work-items?)\//i.test(ref)) return true;
  return !/^(?:task-governance-reports?|work-queue-takeover-reports?|review-|evidence|reports?)\//i.test(ref)
    && /\.(?:md|json|ya?ml)$/i.test(ref);
}

function workQueueViewPriority(section) {
  const normalized = normalizedHeader(section);
  if (normalized === "current task") return 100;
  if (normalized === "work items") return 90;
  if (normalized === "paused tasks") return 80;
  if (normalized === "backlog parking lot") return 70;
  return 50;
}

function canonicalItemKey(item) {
  const taskId = strip(item.taskId).toLowerCase();
  if (taskId && !/^(?:n\/a|none|pending|unknown|<)/i.test(taskId)) return `id:${taskId}`;
  const taskRef = normalizedTaskRef(item.taskRef).toLowerCase();
  if (taskRef) return `ref:${taskRef}`;
  return `row:${item.source || "unknown"}:${item.sourceRow || "unknown"}`;
}

function canonicalConflict(code, key, values, representations) {
  return {
    code,
    itemKey: key,
    values,
    representations: representations.map((item) => ({
      source: item.source,
      section: item.sourceView || "inferred",
      row: item.sourceRow || null,
    })),
  };
}

function uniqueNonempty(values) {
  return [...new Set(values.filter(Boolean))];
}

function firstNonempty(values) {
  return values.find(Boolean) || "";
}

function intentDigestFromContent(content) {
  const match = String(content || "").match(/(?:^|\|)\s*(?:Intent digest|intent_digest)\s*(?:\||:)\s*`?(sha256:[a-f0-9]{64})`?/im);
  return match ? match[1].toLowerCase() : "";
}

function actionsFor({ exists, current, paused, backlog, blocked, queueReports, taskCards, gitState, conflicts }) {
  if (!exists) return ["Provide a valid project path before queue review."];
  const actions = [];
  if (conflicts.length > 0) actions.push("Repair conflicting representations of the same Work Queue item before continuing.");
  if (queueReports.length === 0) actions.push("Create a Work Queue report before long-running or interrupted work.");
  if (current.length === 0 && taskCards.length > 0) actions.push("Choose one task to become CURRENT.");
  if (current.length > 1) actions.push("Stop and ask the human to choose one CURRENT task.");
  if (paused.length > 0) actions.push("Run resume review before resuming any PAUSED task.");
  if (backlog.length > 0) actions.push("Keep BACKLOG items parked until promoted by human decision.");
  if (blocked.length > 0) actions.push("Resolve named blockers before continuing BLOCKED tasks.");
  if (gitState?.isDirty) actions.push("Review dirty worktree before pausing, switching, or resuming task context.");
  if (actions.length === 0) actions.push("No queue action needed; continue under the current task boundary.");
  return actions;
}

function decisionsFor({ exists, current, paused, backlog, blocked, conflicts }) {
  if (!exists) {
    return [decision("Target path", "provide valid path / stop", "provide valid path", "PENDING")];
  }
  const decisions = [];
  if (conflicts.length > 0) decisions.push(decision("Queue evidence conflict", "repair evidence / stop", "repair evidence", "PENDING"));
  if (current.length > 1) decisions.push(decision("Current task", "choose one / pause all / stop", "choose one", "PENDING"));
  if (current.length === 0) decisions.push(decision("Current task", "promote one / keep all parked / stop", "promote one", "PENDING"));
  if (paused.length > 0) decisions.push(decision("Paused task resume", "resume after review / keep paused / cancel", "keep paused until requested", "PENDING"));
  if (backlog.length > 0) decisions.push(decision("Backlog promotion", "promote / keep parked / cancel", "keep parked", "PENDING"));
  if (blocked.length > 0) decisions.push(decision("Blocked task", "resolve blocker / keep blocked / cancel", "keep blocked", "PENDING"));
  if (decisions.length === 0) decisions.push(decision("Queue action", "continue / pause / stop", "continue", "NOT_NEEDED"));
  return decisions;
}

function decision(name, options, recommended, status) {
  return {
    decision: name,
    options,
    recommended,
    owner: "human",
    status,
  };
}

function outcomeFor({ exists, current, paused, queueReports, conflicts }) {
  if (!exists) return "BLOCKED";
  if (conflicts.length > 0) return "BLOCKED";
  if (current.length > 1) return "NEEDS_HUMAN_DECISION";
  if (queueReports.length === 0 || current.length === 0 || paused.length > 0) return "NEEDS_HUMAN_DECISION";
  return "WORK_QUEUE_RECORDED";
}

function summaryFor({ exists, queueReports, taskCards, current, paused, backlog, gitState, conflicts }) {
  if (!exists) {
    return {
      conclusion: "Target path does not exist.",
      recommendedChoice: "E. Stop",
      canAiContinueNow: "no",
      needFromHuman: "Provide a valid project path.",
      ifNothing: "No project files are changed.",
    };
  }
  if (conflicts.length > 0) {
    return {
      conclusion: "Conflicting representations of the same Work Queue item were detected.",
      recommendedChoice: "E. Stop",
      canAiContinueNow: "no",
      needFromHuman: "Nothing technical. Codex must repair the mismatched queue evidence before continuing.",
      ifNothing: "No project files are changed; Codex must not continue execution.",
    };
  }
  if (current.length > 1) {
    return {
      conclusion: "More than one CURRENT task was detected.",
      recommendedChoice: "E. Stop",
      canAiContinueNow: "no",
      needFromHuman: "Choose one current task or pause the extras.",
      ifNothing: "No project files are changed; Codex must not continue execution.",
    };
  }
  if (queueReports.length === 0 && taskCards.length === 0) {
    return {
      conclusion: "No Work Queue report or task card was detected.",
      recommendedChoice: "C. Create queue record",
      canAiContinueNow: "limited",
      needFromHuman: "Confirm the current task before long-running work.",
      ifNothing: "No project files are changed.",
    };
  }
  return {
    conclusion: `${current.length} current task(s), ${paused.length} paused task(s), and ${backlog.length} backlog item(s) detected.`,
    recommendedChoice: current.length === 1 ? "A. Continue current task" : "C. Choose current task",
    canAiContinueNow: current.length === 1 && !gitState?.isDirty ? "limited" : "limited",
    needFromHuman: paused.length > 0
      ? "Confirm before resuming paused work or switching away from the current task."
      : "Confirm before switching tasks or promoting backlog items.",
    ifNothing: "No task state changes; no code changes.",
  };
}

function printHuman(report) {
  console.log("# Work Queue Recommendation");
  console.log("");
  printHumanDecisionSummary(report.humanDecisionSummary);
  printInventory(report);
  printCurrent(report);
  printPaused(report);
  printBacklog(report);
  printActions(report);
  printHumanDecisions(report);
  printBoundary(report);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function printHumanDecisionSummary(summary) {
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`Conclusion: ${summary.conclusion}`);
  console.log("");
  console.log(`Recommended choice: ${summary.recommendedChoice}`);
  console.log("");
  console.log(`Can AI continue now: ${summary.canAiContinueNow}`);
  console.log("");
  console.log(`What I need from you: ${summary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${summary.ifNothing}`);
  console.log("");
}

function printInventory(report) {
  console.log("## Queue Inventory");
  console.log("");
  console.log(`- Work Queue reports: ${report.queueInventory.queueReportCount}`);
  console.log(`- Task cards: ${report.queueInventory.taskCardCount}`);
  console.log(`- Active work threads: ${report.queueInventory.activeWorkThreadCount}`);
  console.log(`- Parking artifacts: ${report.queueInventory.parkingArtifactCount}`);
  console.log(`- Canonical queue items: ${report.queueInventory.canonicalItemCount}`);
  console.log(`- Canonicalization conflicts: ${report.queueInventory.canonicalizationConflictCount}`);
  console.log(`- CURRENT task count: ${report.currentTaskCount}`);
  console.log("");
}

function printCurrent(report) {
  console.log("## Current Task Candidates");
  console.log("");
  printItems(report.currentTaskCandidates, "No CURRENT task detected.");
}

function printPaused(report) {
  console.log("## Paused Tasks");
  console.log("");
  printItems(report.pausedTasks, "No PAUSED task detected.");
}

function printBacklog(report) {
  console.log("## Backlog / Parking Lot");
  console.log("");
  printItems(report.backlogItems, "No BACKLOG item detected.");
}

function printItems(items, empty) {
  console.log("| Task ID | Title | State | Source | Evidence | Resume review | Notes |");
  console.log("|---|---|---|---|---|---|---|");
  if (items.length === 0) {
    console.log(`| None | ${empty} | BACKLOG | n/a | n/a | Required before promotion | no files changed |`);
  } else {
    for (const item of items.slice(0, 30)) {
      console.log(`| ${escapeCell(item.taskId)} | ${escapeCell(item.title)} | ${item.state} | ${escapeCell(item.source)} | ${escapeCell(item.evidence)} | ${escapeCell(item.resumeReview)} | ${escapeCell(item.notes)} |`);
    }
  }
  console.log("");
}

function printActions(report) {
  console.log("## Recommended Queue Actions");
  console.log("");
  for (const item of report.recommendedQueueActions) console.log(`- ${item}`);
  console.log("");
}

function printHumanDecisions(report) {
  console.log("## Human Decisions Needed");
  console.log("");
  console.log("| Decision | Options | Recommended | Owner | Status |");
  console.log("|---|---|---|---|---|");
  for (const item of report.humanDecisionsNeeded) {
    console.log(`| ${escapeCell(item.decision)} | ${escapeCell(item.options)} | ${escapeCell(item.recommended)} | ${item.owner} | ${item.status} |`);
  }
  console.log("");
}

function printBoundary(report) {
  console.log("## Boundary");
  console.log("");
  console.log(`- This report changes task state: ${report.boundary.changesTaskState}`);
  console.log(`- This report approves implementation: ${report.boundary.approvesImplementation}`);
  console.log(`- This report approves target-project writes: ${report.boundary.approvesTargetProjectWrites}`);
  console.log(`- This report approves scope expansion: ${report.boundary.approvesScopeExpansion}`);
  console.log(`- This report approves release or production: ${report.boundary.approvesReleaseOrProduction}`);
  console.log(`- This report overrides task/spec/review loop: ${report.boundary.overridesTaskSpecOrReviewLoop}`);
  console.log(`- This report resumes stale work without review: ${report.boundary.resumesStaleWorkWithoutReview}`);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function titleFromFile(filePath, fallbackPath) {
  const content = readFile(filePath);
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return strip(heading[1]);
  return path.basename(fallbackPath, path.extname(fallbackPath)).replace(/^\d+-/, "").replace(/-/g, " ");
}

function idFromPath(relativePath) {
  const base = path.basename(relativePath, path.extname(relativePath));
  const number = base.match(/^(\d+)/)?.[1];
  return number ? `T-${number}` : base.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function strip(value) {
  return String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
}

function escapeCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>");
}
