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

const report = buildHookRecommendation(projectRoot);

if (outputFormat === "json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

function buildHookRecommendation(root) {
  const exists = fs.existsSync(root);
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: new Set([...defaultIgnoredDirs].filter((item) => item !== ".git")),
  }) : [];
  const inventory = exists ? hookInventory(root, paths) : emptyInventory();
  const candidates = exists ? candidateHooks(inventory) : [];
  const h0h1 = candidates.filter((item) => item.level === "H0_AUTO_READ_ONLY" || item.level === "H1_AUTO_SUGGESTION");
  const h2h3 = candidates.filter((item) => item.level === "H2_REQUIRES_CONFIRMATION" || item.level === "H3_EXPLICIT_APPROVAL_REQUIRED");
  const gitState = exists ? gitWorktreeState(root) : null;
  const summary = summaryFor(exists, inventory, candidates, gitState);

  return {
    reportType: "HOOK_ORCHESTRATION_RECOMMENDATION",
    generatedBy: "scripts/resolve-hook-orchestration.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanDecisionSummary: summary,
    inventory,
    proposedHookCandidates: candidates,
    autoAllowCandidates: h0h1,
    approvalRequiredCandidates: h2h3,
    humanDecisionsNeeded: decisionsFor(exists, h2h3),
    rollbackOrDisableNeeds: h2h3.map((item) => ({
      hookId: item.hookId,
      requiredBeforeInstall: "Rollback / disable plan required before any installation.",
      owner: "human",
    })),
    gitState: gitState || {
      isGitRepository: false,
      isDirty: false,
      currentBranch: null,
      changedFileCount: 0,
      changedFilesSample: [],
    },
    boundary: {
      installsHooks: "No",
      modifiesCi: "No",
      addsBlockingGates: "No",
      callsExternalApis: "No",
      changesTargetProjectFiles: "No",
      enablesAutoFix: "No",
      approvesImplementationReleaseOrProduction: "No",
      treatsHookOutputAsHumanApproval: "No",
    },
    outcome: outcomeFor(exists, h2h3),
  };
}

function hookInventory(root, paths) {
  const gitHooks = paths
    .filter((item) => /^\.git\/hooks\//.test(item))
    .filter((item) => !/\.sample$/i.test(item));
  const ciWorkflows = paths.filter((item) => /^\.github\/workflows\/.+\.(ya?ml)$/i.test(item));
  const packageJson = readJson(path.join(root, "package.json"));
  const scripts = Object.keys(packageJson?.scripts || {});
  const hookTooling = [];
  if (fs.existsSync(path.join(root, ".husky"))) hookTooling.push(".husky");
  if (fs.existsSync(path.join(root, "lefthook.yml")) || fs.existsSync(path.join(root, "lefthook.yaml"))) hookTooling.push("lefthook");
  if (fs.existsSync(path.join(root, ".pre-commit-config.yaml"))) hookTooling.push("pre-commit");
  if (packageJson?.["lint-staged"]) hookTooling.push("lint-staged");
  if (packageJson?.devDependencies?.husky || packageJson?.dependencies?.husky) hookTooling.push("husky package");
  const scheduledWorkflows = ciWorkflows.filter((file) => /schedule:/i.test(readFile(path.join(root, file))));

  return {
    gitHooks: gitHooks.map((file) => ({ path: file, detected: "Yes", notes: "local git hook file exists" })),
    ciWorkflows: ciWorkflows.map((file) => ({ path: file, detected: "Yes", notes: workflowNotes(readFile(path.join(root, file))) })),
    packageScripts: scripts.map((script) => ({ name: script, command: packageJson.scripts[script] })),
    hookTooling,
    scheduledWorkflows,
    summary: {
      gitHooksDetected: gitHooks.length,
      ciWorkflowsDetected: ciWorkflows.length,
      hookToolingDetected: hookTooling.length,
      scheduledWorkflowsDetected: scheduledWorkflows.length,
      packageScriptCount: scripts.length,
    },
  };
}

function emptyInventory() {
  return {
    gitHooks: [],
    ciWorkflows: [],
    packageScripts: [],
    hookTooling: [],
    scheduledWorkflows: [],
    summary: {
      gitHooksDetected: 0,
      ciWorkflowsDetected: 0,
      hookToolingDetected: 0,
      scheduledWorkflowsDetected: 0,
      packageScriptCount: 0,
    },
  };
}

function candidateHooks(inventory) {
  const hasVerify = inventory.packageScripts.some((item) => item.name === "verify");
  const hasWorkQueue = inventory.packageScripts.some((item) => /work-queue/i.test(item.command))
    || fs.existsSync(path.join(projectRoot, "scripts", "check-work-queue.mjs"));
  const candidates = [
    candidate("H-001", "task-complete", hasWorkQueue ? "run work-queue/review-loop/change-boundary checks" : "run existing read-only workflow checks", "H0_AUTO_READ_ONLY", "Not installed", "No", "No", "Not required for read-only run"),
    candidate("H-002", "task-complete", "generate hook recommendation for next task", "H1_AUTO_SUGGESTION", "Not installed", "No", "No", "Not required for suggestion"),
    candidate("H-003", "pre-push", hasVerify ? "run npm run verify" : "run project verification command after confirmation", "H2_REQUIRES_CONFIRMATION", "Proposed only", "No", "No", "Required"),
    candidate("H-004", "pull-request", "add or change CI workflow checks", "H3_EXPLICIT_APPROVAL_REQUIRED", "Proposed only", "Proposed only", "No", "Explicit required"),
    candidate("H-005", "external-review", "call GPT/API reviewer automatically", "H3_EXPLICIT_APPROVAL_REQUIRED", "Proposed only", "Proposed only", "Proposed only", "Explicit required"),
  ];
  if (inventory.scheduledWorkflows.length > 0) {
    candidates.push(candidate("H-006", "schedule", "review existing scheduled workflow before changes", "H3_EXPLICIT_APPROVAL_REQUIRED", "Proposed only", "Proposed only", "No", "Explicit required"));
  }
  return candidates;
}

function candidate(hookId, trigger, action, level, installation, blockingBehavior, externalApi, humanApproval) {
  return {
    hookId,
    trigger,
    action,
    level,
    installation,
    blockingBehavior,
    externalApi,
    humanApproval,
  };
}

function decisionsFor(exists, approvalRequired) {
  if (!exists) {
    return [decision("Target path", "provide valid path / stop", "provide valid path", "PENDING")];
  }
  const decisions = approvalRequired.map((item) => decision(
    `${item.hookId} ${item.trigger}`,
    "approve / reject / defer",
    "defer until a separate reviewed installation task exists",
    "PENDING",
  ));
  if (decisions.length === 0) decisions.push(decision("Hook plan", "keep read-only / stop", "keep read-only", "NOT_NEEDED"));
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

function outcomeFor(exists, approvalRequired) {
  if (!exists) return "BLOCKED";
  if (approvalRequired.length > 0) return "NEEDS_HUMAN_DECISION";
  return "HOOK_PLAN_RECORDED";
}

function summaryFor(exists, inventory, candidates, gitState) {
  if (!exists) {
    return {
      conclusion: "Target path does not exist.",
      recommendedChoice: "E. stop",
      canAiContinueNow: "no",
      needFromHuman: "Provide a valid project path.",
      ifNothing: "No hooks are installed; no files are changed.",
    };
  }
  const h2h3 = candidates.filter((item) => /H2|H3/.test(item.level)).length;
  return {
    conclusion: `${inventory.summary.gitHooksDetected} local hook(s), ${inventory.summary.ciWorkflowsDetected} CI workflow(s), and ${h2h3} approval-required candidate(s) detected.`,
    recommendedChoice: "B. generate plan only",
    canAiContinueNow: "limited",
    needFromHuman: "Confirm only if you want any H2/H3 hook to become a separate installation task.",
    ifNothing: "No hooks are installed; no CI is changed; no blocking gates are added.",
    dirtyWorktree: gitState?.isDirty ? "Yes" : "No",
  };
}

function printHuman(report) {
  console.log("# Hook Orchestration Recommendation");
  console.log("");
  printHumanDecisionSummary(report.humanDecisionSummary);
  printInventory(report.inventory);
  printCandidates(report.proposedHookCandidates);
  printDecisions(report.humanDecisionsNeeded);
  printBoundary(report.boundary);
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

function printInventory(inventory) {
  console.log("## Existing Hook / CI Inventory");
  console.log("");
  console.log("| Area | Detected | Evidence | Notes |");
  console.log("|---|---|---|---|");
  console.log(`| Git hooks | ${inventory.summary.gitHooksDetected > 0 ? "Yes" : "No"} | ${escapeCell(inventory.gitHooks.map((item) => item.path).join(", ") || "none detected")} | local hook files only; no changes made |`);
  console.log(`| CI workflows | ${inventory.summary.ciWorkflowsDetected > 0 ? "Yes" : "No"} | ${escapeCell(inventory.ciWorkflows.map((item) => item.path).join(", ") || "none detected")} | no CI changes made |`);
  console.log(`| Hook tooling | ${inventory.summary.hookToolingDetected > 0 ? "Yes" : "No"} | ${escapeCell(inventory.hookTooling.join(", ") || "none detected")} | no tooling installed |`);
  console.log(`| Scheduled jobs | ${inventory.summary.scheduledWorkflowsDetected > 0 ? "Yes" : "No"} | ${escapeCell(inventory.scheduledWorkflows.join(", ") || "none detected")} | no schedule changed |`);
  console.log("");
}

function printCandidates(candidates) {
  console.log("## Proposed Hook Candidates");
  console.log("");
  console.log("| Hook ID | Trigger | Action | Level | Installation | Blocking behavior | External API | Human approval |");
  console.log("|---|---|---|---|---|---|---|---|");
  for (const item of candidates) {
    console.log(`| ${item.hookId} | ${escapeCell(item.trigger)} | ${escapeCell(item.action)} | ${item.level} | ${item.installation} | ${item.blockingBehavior} | ${item.externalApi} | ${item.humanApproval} |`);
  }
  console.log("");
}

function printDecisions(decisions) {
  console.log("## Human Decisions Needed");
  console.log("");
  console.log("| Decision | Options | Recommended | Owner | Status |");
  console.log("|---|---|---|---|---|");
  for (const item of decisions) {
    console.log(`| ${escapeCell(item.decision)} | ${escapeCell(item.options)} | ${escapeCell(item.recommended)} | ${item.owner} | ${item.status} |`);
  }
  console.log("");
}

function printBoundary(boundary) {
  console.log("## Boundary");
  console.log("");
  console.log(`- This plan installs hooks: ${boundary.installsHooks}`);
  console.log(`- This plan modifies CI: ${boundary.modifiesCi}`);
  console.log(`- This plan adds blocking gates: ${boundary.addsBlockingGates}`);
  console.log(`- This plan calls external APIs: ${boundary.callsExternalApis}`);
  console.log(`- This plan changes target-project files: ${boundary.changesTargetProjectFiles}`);
  console.log(`- This plan enables auto-fix: ${boundary.enablesAutoFix}`);
  console.log(`- This plan approves implementation, release, or production: ${boundary.approvesImplementationReleaseOrProduction}`);
  console.log(`- This plan treats hook output as human approval: ${boundary.treatsHookOutputAsHumanApproval}`);
}

function workflowNotes(content) {
  const notes = [];
  if (/pull_request:/i.test(content)) notes.push("pull_request");
  if (/push:/i.test(content)) notes.push("push");
  if (/schedule:/i.test(content)) notes.push("schedule");
  if (/workflow_dispatch:/i.test(content)) notes.push("workflow_dispatch");
  return notes.join(", ") || "workflow file detected";
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function escapeCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "<br>");
}

