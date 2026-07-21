#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { CONSUMER_OUTCOMES } from "./lib/check-result.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import {
  canonicalizeWorkQueueItems,
  parseWorkQueueReport,
} from "./resolve-work-queue.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "require-report"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireReport = Boolean(args["require-report"]);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/work-queue.md",
  "docs/work-queue.md",
  "templates/work-queue-report.md",
  "checklists/work-queue-review.md",
  "prompts/work-queue-agent.md",
  "scripts/resolve-work-queue.mjs",
  "scripts/check-work-queue.mjs",
];

const requiredDirectories = [
  "work-queue",
];

const reportSections = [
  "Human Decision Summary",
  "Human Summary",
  "Queue Policy",
  "Current Task",
  "Paused Tasks",
  "Backlog / Parking Lot",
  "Resume Review",
  "Work Items",
  "Human Decisions Needed",
  "Boundary",
  "Outcome",
];

const allowedStates = new Set([
  "CURRENT",
  "PAUSED",
  "BLOCKED",
  "BACKLOG",
  "DONE",
  "CANCELLED",
]);

const allowedOutcomes = new Set([
  "WORK_QUEUE_RECORDED",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);

const forbiddenClaims = [
  /\bimplementation\s+(approved|authorized)\b/i,
  /\btarget-project\s+writes?\s+(approved|authorized)\b/i,
  /\bscope\s+expansion\s+(approved|authorized)\b/i,
  /\brelease\s+(approved|authorized|ready)\b/i,
  /\bproduction\s+(approved|authorized|ready)\b/i,
  /\bresume\s+(approved|authorized)\s+without\s+review\b/i,
  /\bresume\s+without\s+review:\s*yes\b/i,
  /\bmultiple\s+current\s+(tasks?\s+)?allowed\b/i,
  /\bbacklog\s+approved\s+for\s+execution\b/i,
];

let failed = false;
const checks = [];
const queueStats = {
  reportCount: 0,
  currentTaskCount: 0,
  currentTaskCandidates: [],
  canonicalizationConflicts: [],
};

if (!outputJson) {
  console.log("# Work Queue Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }
  for (const dir of requiredDirectories) {
    const resolved = resolveDirectory(dir);
    if (resolved) pass(`${displayAsset(dir, resolved)} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkReports();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.22 work queue evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/work-queue.md");
  if (!core) return;
  for (const marker of [
    "Work Queue Governance",
    "There must be at most one `CURRENT` task",
    "PAUSED",
    "BACKLOG",
    "Resume Review Rules",
    "Interruption Rules",
    "The Work Queue is a routing and state ledger",
    "This report approves implementation: No",
    "This report resumes stale work without review: No",
  ]) {
    if (core.includes(marker)) pass(`work queue core includes ${marker}`);
    else fail(`work queue core missing ${marker}`);
  }
}

function checkReports() {
  const files = markdownFiles("work-queue");
  queueStats.reportCount = files.length;
  if (files.length === 0) {
    if (requireReport) fail("no Work Queue reports found");
    else pass("SKIPPED_NO_REPORT: no Work Queue reports found");
    return;
  }

  const allItems = [];
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);

    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    const scanContent = contentForForbiddenScan(content);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(scanContent)) fail(`${label} contains forbidden work queue claim: ${pattern.source}`);
    }

    const parsed = parseWorkQueueReport({ path: label, title: label, content });
    const canonical = canonicalizeWorkQueueItems(parsed.items);
    allItems.push(...parsed.items);
    if (parsed.items.length === 0) fail(`${label} must record at least one work item state`);
    else if (parsed.invalidRows.length > 0) {
      fail(`${label} has invalid work item state: ${parsed.invalidRows.map((row) => row.state || "<empty>").join(", ")}`);
    } else if (parsed.items.every((item) => allowedStates.has(item.state))) {
      pass(`${label} records valid work item states`);
    } else {
      fail(`${label} has invalid work item state`);
    }
    for (const conflict of canonical.conflicts) {
      fail(`${label} has conflicting ${conflict.code} representations for ${conflict.itemKey}: ${conflict.values.join(", ")}`);
    }

    const currentCount = canonical.items.filter((item) => item.state === "CURRENT").length;
    if (currentCount <= 1) pass(`${label} has at most one CURRENT task`);
    else fail(`${label} has multiple CURRENT tasks`);

    requireQueuePolicy(content, label);
    requireResumeReview(content, label);
    requireBoundaryNo(content, label, "This report changes task state");
    requireBoundaryNo(content, label, "This report approves implementation");
    requireBoundaryNo(content, label, "This report approves target-project writes");
    requireBoundaryNo(content, label, "This report approves scope expansion");
    requireBoundaryNo(content, label, "This report approves release or production");
    requireBoundaryNo(content, label, "This report overrides task/spec/review loop");
    requireBoundaryNo(content, label, "This report resumes stale work without review");

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }

  const canonical = canonicalizeWorkQueueItems(allItems);
  const current = canonical.items.filter((item) => item.state === "CURRENT");
  queueStats.currentTaskCount = current.length;
  queueStats.currentTaskCandidates = current;
  queueStats.canonicalizationConflicts = canonical.conflicts;
  for (const conflict of canonical.conflicts) {
    fail(`Work Queue reports have conflicting ${conflict.code} representations for ${conflict.itemKey}: ${conflict.values.join(", ")}`);
  }
  if (current.length <= 1) pass("all Work Queue reports together have at most one canonical CURRENT task");
  else fail(`all Work Queue reports together have ${current.length} canonical CURRENT tasks`);
}

function requireQueuePolicy(content, label) {
  const policy = sectionBody(content, "Queue Policy");
  for (const marker of [
    "Only one",
    "CURRENT",
    "PAUSED",
    "resume review",
    "BACKLOG",
    "not execution permission",
    "does not approve implementation",
  ]) {
    if (new RegExp(marker, "i").test(policy)) pass(`${label} Queue Policy includes ${marker}`);
    else fail(`${label} Queue Policy must mention ${marker}`);
  }
}

function requireResumeReview(content, label) {
  const body = sectionBody(content, "Resume Review");
  const pausedRows = sectionBody(content, "Paused Tasks");
  const workItems = sectionBody(content, "Work Items");
  const hasPaused = /\|\s*[^|\n]+\s*\|\s*[^|\n]+\s*\|\s*`?PAUSED`?\s*\|/i.test(`${pausedRows}\n${workItems}`);
  const resumeRequested = valueForBullet(body, "Resume requested");
  const currentChecked = valueForBullet(body, "Current state checked");
  const dirtyChecked = valueForBullet(body, "Dirty worktree checked");
  const evidenceValid = valueForBullet(body, "Last evidence still valid");
  const humanDecision = valueForBullet(body, "Human resume decision");
  const withoutReview = valueForBullet(body, "Resume without review");

  if (withoutReview === "No") pass(`${label} records Resume without review: No`);
  else fail(`${label} must record Resume without review: No`);

  if (hasPaused) {
    if (/Yes|No/i.test(resumeRequested)) pass(`${label} records paused-task resume request state`);
    else fail(`${label} must record Resume requested for paused tasks`);
    if (currentChecked === "Yes") pass(`${label} checked current state before paused-task resume`);
    else fail(`${label} must check current state before paused-task resume`);
    if (/^(Yes|N\/A)$/i.test(dirtyChecked)) pass(`${label} checked dirty worktree before paused-task resume`);
    else fail(`${label} must check dirty worktree before paused-task resume`);
    if (/^(Yes|No|Unclear)$/i.test(evidenceValid)) pass(`${label} records last evidence validity`);
    else fail(`${label} must record last evidence validity`);
    if (/^(APPROVED|PENDING|REJECTED|NOT_NEEDED)$/i.test(humanDecision)) pass(`${label} records human resume decision`);
    else fail(`${label} must record human resume decision`);
  } else {
    pass(`${label} has no paused task requiring resume review`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.22-work-queue/README.md",
    "examples/1.22-work-queue/work-queue/001-work-queue.md",
    "releases/1.22.0/release-record.md",
    "releases/1.22.0/known-limitations.md",
    "releases/1.22.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.22 work queue source evidence exists ${file}`);
    else fail(`1.22 work queue source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-work-queue.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Work Queue Recommendation")
    && resolver.stdout.includes("CURRENT task count")
    && resolver.stdout.includes("This report approves implementation: No")) {
    pass("1.22 work queue resolver prints read-only recommendation");
  } else {
    fail(`1.22 work queue resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-work-queue.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "WORK_QUEUE_RECOMMENDATION"
        && parsed.boundary?.approvesImplementation === "No"
        && Number.isFinite(parsed.currentTaskCount)) {
        pass("1.22 work queue resolver JSON includes boundary and current task count");
      } else {
        fail(`1.22 work queue resolver JSON missing required fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.22 work queue resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.22 work queue resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-work-queue.mjs", "examples/1.22-work-queue"]);
  if (example.status === 0 && example.stdout.includes("Work queue check passed")) {
    pass("1.22 work queue example passes checker");
  } else {
    fail(`1.22 work queue example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["multiple current", "test-fixtures/bad/bad-work-queue-multiple-current", "multiple CURRENT"],
    ["resume without review", "test-fixtures/bad/bad-work-queue-resume-without-review", "Resume without review"],
  ]) {
    const result = runNode(["scripts/check-work-queue.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.22 work queue rejects ${name}`);
    } else {
      fail(`1.22 work queue must reject ${name}: ${output}`);
    }
  }
}

function contentForForbiddenScan(content) {
  return String(content)
    .replace(/^- This report changes task state: No$/gim, "")
    .replace(/^- This report approves implementation: No$/gim, "")
    .replace(/^- This report approves target-project writes: No$/gim, "")
    .replace(/^- This report approves scope expansion: No$/gim, "")
    .replace(/^- This report approves release or production: No$/gim, "")
    .replace(/^- This report overrides task\/spec\/review loop: No$/gim, "")
    .replace(/^- This report resumes stale work without review: No$/gim, "");
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      status: failed ? "FAIL" : "PASS",
      consumerOutcome: workQueueConsumerOutcome(),
      projectRoot,
      results: checks,
      currentTaskCount: queueStats.currentTaskCount,
      currentTaskCandidates: queueStats.currentTaskCandidates,
      canonicalizationConflicts: queueStats.canonicalizationConflicts,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Work queue check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function workQueueConsumerOutcome() {
  if (queueStats.reportCount === 0) return CONSUMER_OUTCOMES.MISSING;
  if (queueStats.canonicalizationConflicts.length > 0 || queueStats.currentTaskCount > 1) {
    return CONSUMER_OUTCOMES.BLOCKED;
  }
  if (failed) return CONSUMER_OUTCOMES.INVALID;
  return queueStats.currentTaskCount === 1
    ? CONSUMER_OUTCOMES.READY
    : CONSUMER_OUTCOMES.VALID;
}

function requireSection(content, section, label) {
  const body = sectionBody(content, section);
  if (body.trim()) pass(`${label} has ${section}`);
  else fail(`${label} missing ${section}`);
}

function requireBoundaryNo(content, label, key) {
  const pattern = new RegExp(`^-\\s*${escapeRegExp(key)}:\\s*No\\s*$`, "im");
  if (pattern.test(content)) pass(`${label} boundary ${key}: No`);
  else fail(`${label} missing boundary ${key}: No`);
}

function extractStates(body) {
  return Array.from(String(body || "").matchAll(/\|\s*[^|\n]+\s*\|\s*[^|\n]+\s*\|\s*`?([A-Z_]+)`?\s*\|/g))
    .map((match) => match[1])
    .filter((state) => state !== "State");
}

function valueForBullet(body, key) {
  const pattern = new RegExp("^-\\s*" + escapeRegExp(key) + ":\\s*`?([^`\\n]+)`?\\s*$", "im");
  const match = pattern.exec(body || "");
  return match ? match[1].trim() : "";
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
  const match = pattern.exec(content);
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index).trim() : rest.trim();
}

function codeOrTextValue(body) {
  const code = String(body || "").match(/`([A-Z_]+)`/);
  if (code) return code[1];
  const text = String(body || "").trim().split(/\s+/)[0];
  return text ? text.replace(/[^A-Z_]/gi, "").toUpperCase() : "";
}

function markdownFiles(dir) {
  const rootDir = path.join(projectRoot, dir);
  if (!fs.existsSync(rootDir)) return [];
  const files = [];
  walk(rootDir, files);
  return files.filter((file) => /\.md$/i.test(file)).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(file) {
  const targetAsset = path.join(projectRoot, file);
  if (fs.existsSync(targetAsset)) return targetAsset;
  const nativeAsset = path.join(projectRoot, ".intentos", file);
  if (fs.existsSync(nativeAsset)) return nativeAsset;
  return null;
}

function resolveDirectory(dir) {
  const targetDir = path.join(projectRoot, dir);
  if (fs.existsSync(targetDir) && fs.statSync(targetDir).isDirectory()) return targetDir;
  return null;
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
}

function displayAsset(expected, resolved) {
  const relative = rel(resolved);
  return relative || expected;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, {
    cwd: projectRoot,
    encoding: "utf8",
  });
}
