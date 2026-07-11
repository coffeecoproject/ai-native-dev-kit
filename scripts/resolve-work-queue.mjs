#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  defaultIgnoredDirs,
  walkRelativePaths,
} from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const allowedFormats = new Set(["human", "json"]);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!allowedFormats.has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human, --format json, or --json.");
  process.exit(1);
}

const report = buildWorkQueueRecommendation(projectRoot);

if (outputFormat === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

function buildWorkQueueRecommendation(root) {
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
  const items = inferWorkItems(queueReports, taskCards, activeThreads, parkingArtifacts);
  const current = items.filter((item) => item.state === "CURRENT");
  const paused = items.filter((item) => item.state === "PAUSED");
  const backlog = items.filter((item) => item.state === "BACKLOG");
  const blocked = items.filter((item) => item.state === "BLOCKED");
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
    },
    currentTaskCount: current.length,
    currentTaskCandidates: current,
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
    recommendedQueueActions: actionsFor({ exists, current, paused, backlog, blocked, queueReports, taskCards, gitState }),
    humanDecisionsNeeded: decisionsFor({ exists, current, paused, backlog, blocked }),
    boundary: {
      changesTaskState: "No",
      approvesImplementation: "No",
      approvesTargetProjectWrites: "No",
      approvesScopeExpansion: "No",
      approvesReleaseOrProduction: "No",
      overridesTaskSpecOrReviewLoop: "No",
      resumesStaleWorkWithoutReview: "No",
    },
    outcome: outcomeFor({ exists, current, paused, queueReports }),
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

  return dedupeItems(items);
}

function parseWorkItems(report) {
  const items = [];
  const lines = report.content.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    if (/^\|\s*-+\s*\|/.test(line)) continue;
    if (/\|\s*Task ID\s*\|/i.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => strip(cell));
    if (cells.length < 3) continue;
    const stateIndex = cells.findIndex((cell) => stateFor(cell));
    if (stateIndex === -1) continue;
    const taskId = cells[0] || idFromPath(report.path);
    const title = cells[1] || report.title;
    const state = stateFor(cells[stateIndex]);
    const taskRef = normalizedTaskRef(cells[stateIndex + 1]);
    const intentDigest = normalizedIntentDigest(cells[stateIndex + 2]);
    items.push({
      taskId,
      taskRef,
      intentDigest,
      title,
      state,
      source: report.path,
      evidence: "Work Queue report row",
      resumeReview: cells[stateIndex + 2] || "PENDING",
      notes: cells[cells.length - 1] || "",
    });
  }
  return dedupeItems(items);
}

function stateFor(value) {
  const normalized = strip(value).toUpperCase();
  return ["CURRENT", "PAUSED", "BLOCKED", "BACKLOG", "DONE", "CANCELLED"].includes(normalized)
    ? normalized
    : null;
}

function dedupeItems(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = `${item.taskRef || item.taskId}:${item.state}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
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

function intentDigestFromContent(content) {
  const match = String(content || "").match(/(?:^|\|)\s*(?:Intent digest|intent_digest)\s*(?:\||:)\s*`?(sha256:[a-f0-9]{64})`?/im);
  return match ? match[1].toLowerCase() : "";
}

function actionsFor({ exists, current, paused, backlog, blocked, queueReports, taskCards, gitState }) {
  if (!exists) return ["Provide a valid project path before queue review."];
  const actions = [];
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

function decisionsFor({ exists, current, paused, backlog, blocked }) {
  if (!exists) {
    return [decision("Target path", "provide valid path / stop", "provide valid path", "PENDING")];
  }
  const decisions = [];
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

function outcomeFor({ exists, current, paused, queueReports }) {
  if (!exists) return "BLOCKED";
  if (current.length > 1) return "NEEDS_HUMAN_DECISION";
  if (queueReports.length === 0 || current.length === 0 || paused.length > 0) return "NEEDS_HUMAN_DECISION";
  return "WORK_QUEUE_RECORDED";
}

function summaryFor({ exists, queueReports, taskCards, current, paused, backlog, gitState }) {
  if (!exists) {
    return {
      conclusion: "Target path does not exist.",
      recommendedChoice: "E. Stop",
      canAiContinueNow: "no",
      needFromHuman: "Provide a valid project path.",
      ifNothing: "No project files are changed.",
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
