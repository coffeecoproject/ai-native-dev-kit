#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["base", "json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const base = String(args.base || "HEAD^");
const outputJson = Boolean(args.json);
const checks = [];
let failed = false;

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const changedResult = run("git", ["diff", "--name-only", "--diff-filter=ACMRTUXB", base, "--"]);
if (changedResult.status !== 0) {
  fail(`cannot determine changed files from ${base}: ${message(changedResult)}`);
  finish();
}

const changed = changedResult.stdout.split("\n").map(normalize).filter(Boolean);
const implementationFiles = changed.filter(isImplementationFile);
const releaseFiles = changed.filter(isReleaseFile);

if (implementationFiles.length > 0) {
  pass(`implementation change detected: ${implementationFiles.join(", ")}`);
  checkCurrentReport("Work Queue", "work-queue", "scripts/check-work-queue.mjs", ["--require-report", "--require-structured-evidence"]);
  const taskGovernanceReport = checkCurrentReport("Task Governance", "task-governance-reports", "scripts/check-task-governance.mjs", ["--require-report", "--require-structured-evidence"]);
  const taskImpact = currentTaskImpact(taskGovernanceReport);
  const planReviewRequired = new Set(["MEDIUM", "HIGH", "POSSIBLE_HIGH"]).has(taskImpact);
  if (planReviewRequired) {
    checkCurrentReport("Plan Review", "plan-review-reports", "scripts/check-plan-review.mjs", ["--require-report", "--require-structured-evidence"]);
  } else if (taskImpact === "LOW") {
    pass("LOW task does not require Plan Review");
  } else {
    fail("Task Governance does not provide a recognized current task impact");
  }
  const executionFlags = [
    "--require-structured-evidence", "--require-evidence-refs", "--require-actual-diff",
    "--require-precise-evidence", "--require-task-governance", "--require-work-queue",
    "--require-evidence-authority",
  ];
  const completionFlags = [
    "--require-report", "--require-structured-evidence", "--require-source-refs", "--require-ready",
    "--require-task-governance", "--require-work-queue", "--require-evidence-authority",
  ];
  if (planReviewRequired) {
    executionFlags.push("--require-plan-review");
    completionFlags.push("--require-plan-review");
  }
  checkCurrentReport("Execution Assurance", "execution-assurance-reports", "scripts/check-execution-assurance.mjs", executionFlags);
  checkCurrentReport("Completion Evidence", "completion-evidence-reports", "scripts/check-completion-evidence.mjs", completionFlags);
} else {
  pass("no implementation change requires the task completion consumer chain");
}

if (releaseFiles.length > 0) {
  pass(`release preparation change detected: ${releaseFiles.join(", ")}`);
  checkCurrentReport("Runtime Hygiene", "runtime-hygiene-reports", "scripts/check-runtime-hygiene.mjs", ["--require-report", "--require-structured-evidence", "--require-task-entry", "--require-runtime-sources"]);
  checkCurrentReport("Release Channel Policy", "release-channel-policies", "scripts/check-release-channel-policy.mjs", ["--require-report", "--require-structured-evidence", "--strict-source-binding"]);
  checkCurrentReport("Release Evidence", "release-evidence-gate-reports", "scripts/check-release-evidence-gate.mjs", ["--require-report", "--require-structured-evidence", "--require-current-completion", "--strict-source-binding", "--require-platform-recipe"]);
  checkCurrentReport("Release Execution", "release-execution-plans", "scripts/check-release-execution.mjs", ["--require-report", "--require-structured-evidence", "--require-release-trust"]);
} else {
  pass("no release preparation change requires the release consumer chain");
}

finish();

function checkCurrentReport(label, directory, script, flags) {
  const reports = changed
    .filter((file) => file.startsWith(`${directory}/`) && file.endsWith(".md"))
    .filter((file) => fs.existsSync(path.join(projectRoot, file)));
  if (reports.length !== 1) {
    fail(`${label} requires exactly one changed current report under ${directory}; found ${reports.length}`);
    return "";
  }
  const result = run(process.execPath, [script, projectRoot, "--report", reports[0], ...flags]);
  if (result.status === 0) pass(`${label} current report passed: ${reports[0]}`);
  else fail(`${label} current report failed: ${reports[0]}: ${message(result)}`);
  return reports[0];
}

function currentTaskImpact(report) {
  if (!report) return "";
  const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(projectRoot, report), "utf8"));
  return String(extracted.value?.impact_classification?.task_impact || "").trim().toUpperCase();
}

function isImplementationFile(file) {
  if (isGovernanceAsset(file) || isReleaseFile(file)) return false;
  const name = path.posix.basename(file);
  if (/^(Dockerfile|Containerfile|Makefile)$/i.test(name)) return true;
  return /\.(?:c|cc|cpp|cs|css|dart|go|graphql|h|html|java|js|jsx|kt|kts|m|mm|mjs|php|prisma|py|rb|rs|scss|sql|svelte|swift|ts|tsx|vue|wasm|yaml|yml)$/i.test(file);
}

function isGovernanceAsset(file) {
  const top = file.split("/")[0];
  if ([
    ".intentos", "ai-logs", "approval-records", "change-boundary-reports",
    "change-impact-coverage-reports", "completion-evidence-reports", "docs",
    "execution-assurance-reports", "plan-review-reports", "preflight", "requests",
    "review-loop-reports", "review-packets", "specs", "task-governance-reports",
    "tasks", "test-evidence-reports", "verification-plans", "work-queue",
  ].includes(top)) return true;
  return file === "AGENTS.md" || file === "agent.md" || file === ".github/workflows/ai-workflow-checks.yml";
}

function isReleaseFile(file) {
  return /^(?:release-candidates|release-evidence-gate-reports|release-execution-plans|release-channel-policies|runtime-hygiene-reports)\//.test(file)
    || /^(?:VERSION\.md|CHANGELOG\.md)$/.test(file);
}

function run(command, commandArgs) {
  return spawnSync(command, commandArgs, { cwd: projectRoot, encoding: "utf8" });
}

function message(result) {
  return String(result.stderr || result.stdout || `exit ${result.status}`).trim().replace(/\s+/g, " ");
}

function normalize(value) {
  return String(value || "").trim().replaceAll(path.sep, "/").replace(/^\.\//, "");
}

function pass(text) {
  checks.push({ status: "PASS", message: text });
  if (!outputJson) console.log(`PASS ${text}`);
}

function fail(text) {
  failed = true;
  checks.push({ status: "FAIL", message: text });
  if (!outputJson) console.error(`FAIL ${text}`);
}

function finish() {
  if (outputJson) console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", checks }, null, 2));
  process.exit(failed ? 1 : 0);
}
