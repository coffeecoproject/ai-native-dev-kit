#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { deriveConsumerOutcome } from "./lib/check-result.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["report", "task", "base", "cached", "json", "pre-implementation-manifest", "require-report"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const reportArg = args.report ? normalizePath(String(args.report)) : null;
const preImplementationManifest = Boolean(args["pre-implementation-manifest"]);
const requireReport = Boolean(args["require-report"]);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

let failed = false;
let blockedDisposition = false;
const checks = [];

if (!outputJson) {
  console.log("# Change Boundary Check");
  console.log("");
}

const reports = reportArg
  ? [path.join(projectRoot, reportArg)]
  : markdownFiles("change-boundary-reports");

if (reports.length === 0) {
  if (requireReport) fail("required change-boundary report is missing");
  else pass("SKIPPED_NO_REPORT: no change-boundary reports found; no boundary-readiness claim made");
  emitAndExit();
}

const liveChangedFiles = liveDiffFiles();
if ((args.cached || args.base) && liveChangedFiles.length === 0) {
  fail(`git ${args.cached ? "cached" : "base"} diff is empty; exact changed-file verification cannot pass`);
}
for (const report of reports) checkReport(report, liveChangedFiles);

emitAndExit();

function checkReport(file, liveFiles) {
  if (!fs.existsSync(file)) {
    fail(`change-boundary report not found: ${rel(file)}`);
    return;
  }
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  const requiredSections = ["Task Ref", "Boundary Level", "Intended Scope", "Boundary Result", "Claim Boundary"];
  if (!preImplementationManifest) requiredSections.splice(3, 0, "Actual Changed Files");
  for (const section of requiredSections) {
    if (meaningful(sectionBody(content, section))) pass(`${label} includes ${section}`);
    else fail(`${label} missing meaningful ${section}`);
  }

  if (args.task) {
    const actualTask = firstCodeOrText(sectionBody(content, "Task Ref"));
    if (actualTask === String(args.task)) pass(`${label} matches current task ${actualTask}`);
    else fail(`${label} task mismatch: expected ${args.task}, observed ${actualTask || "<empty>"}`);
  }

  const boundaryLevel = firstCodeOrText(sectionBody(content, "Boundary Level"));
  if (!["CB0_ADVISORY", "CB1_RECORDED", "CB2_CHECKED", "CB3_HUMAN_APPROVED"].includes(boundaryLevel)) {
    fail(`${label} has invalid Boundary Level: ${boundaryLevel || "<empty>"}`);
  }

  const intended = sectionBody(content, "Intended Scope") || "";
  const allowedPaths = preImplementationManifest
    ? codeBlockPaths(intended, /^Allowed\b/i)
    : listAfterLabel(intended, "Allowed paths");
  const forbiddenPaths = preImplementationManifest
    ? codeBlockPaths(intended, /^Forbidden paths\b/i)
    : listAfterLabel(intended, "Forbidden paths");
  const forbiddenTypes = listAfterLabel(intended, "Forbidden change types");
  const changedRows = parseTable(sectionBody(content, "Actual Changed Files"));
  const changedFiles = changedRows.map((row) => stripMarkdown(row.file || "")).filter((value) => value && !isPlaceholder(value));
  const disposition = firstCodeOrText(sectionBody(content, "Boundary Result"));
  if (disposition === "PASS") {
    pass(`${label} disposition PASS is consumer-ready when all checks pass`);
  } else if (/^NEEDS_[A-Z0-9_]+$/.test(disposition)) {
    blockedDisposition = true;
    pass(`${label} disposition ${disposition} is valid but blocks readiness`);
  } else {
    fail(`${label} has unknown Boundary Result disposition: ${disposition || "<empty>"}`);
  }

  if (!preImplementationManifest && changedFiles.length === 0) fail(`${label} must list actual changed files`);
  for (const changedFile of changedFiles) {
    if (matchesAny(changedFile, forbiddenPaths)) fail(`${label} changed forbidden path: ${changedFile}`);
    if (allowedPaths.length > 0 && !matchesAny(changedFile, allowedPaths)) fail(`${label} changed file outside allowed paths: ${changedFile}`);
  }

  for (const row of changedRows) {
    const changedFile = stripMarkdown(row.file || "");
    if (!changedFile || isPlaceholder(changedFile)) continue;
    const changeType = stripMarkdown(row.change_type || "");
    const inside = stripMarkdown(row.inside_boundary || "");
    if (forbiddenTypes.some((type) => changeType.toLowerCase().includes(type.toLowerCase()))) {
      fail(`${label} uses forbidden change type for ${changedFile}: ${changeType}`);
    }
    if (/^no$/i.test(inside) && disposition === "PASS") {
      fail(`${label} cannot mark PASS when ${changedFile} is outside boundary`);
    }
  }

  const outOfScopeRows = parseTable(sectionBody(content, "Out-of-Scope Changes"));
  const meaningfulOutOfScope = outOfScopeRows.some((row) => Object.values(row).some((value) => value && !isPlaceholder(value)));
  if (!preImplementationManifest && meaningfulOutOfScope && disposition === "PASS") {
    fail(`${label} cannot mark PASS when out-of-scope changes are listed`);
  }

  if (boundaryLevel === "CB3_HUMAN_APPROVED") {
    const approval = sectionBody(content, "Human Approval") || "";
    if (!/Status:\s*Approved/i.test(approval)) fail(`${label} CB3 requires approved Human Approval`);
  }

  if (preImplementationManifest) {
    checkPlanBinding(content, label);
    if (allowedPaths.length === 0) fail(`${label} pre-implementation manifest has no allowed paths`);
    else pass(`${label} pre-implementation manifest declares ${allowedPaths.length} allowed paths`);
    if (disposition === "PASS") pass(`${label} pre-implementation manifest disposition is PASS`);
    else if (/^NEEDS_[A-Z0-9_]+$/.test(disposition)) pass(`${label} pre-implementation manifest remains blocked by ${disposition}`);
  }

  if (liveFiles.length > 0) {
    const liveSet = new Set(liveFiles);
    const reportedSet = new Set(changedFiles);
    if (reportedSet.size !== changedFiles.length) fail(`${label} lists duplicate actual changed files`);
    for (const liveFile of liveFiles) {
      if (!reportedSet.has(liveFile)) fail(`${label} missing live changed file from report: ${liveFile}`);
    }
    for (const reportedFile of reportedSet) {
      if (!liveSet.has(reportedFile)) fail(`${label} reports stale or non-current changed file: ${reportedFile}`);
    }
    if (reportedSet.size === liveSet.size && [...liveSet].every((fileName) => reportedSet.has(fileName))) {
      pass(`${label} actual changed files exactly match the live candidate in both directions`);
    }
  }
}

function checkPlanBinding(content, label) {
  const body = sectionBody(content, "Plan Binding") || "";
  const planRef = body.match(/Plan:\s*`([^`]+)`/i)?.[1] || "";
  const recorded = body.match(/Plan digest:\s*`?(sha256:[a-f0-9]{64})`?/i)?.[1] || "";
  if (!planRef || !recorded) {
    fail(`${label} pre-implementation manifest is missing exact plan binding`);
    return;
  }
  const planFile = path.join(projectRoot, normalizePath(planRef));
  if (!fs.existsSync(planFile)) {
    fail(`${label} bound plan does not exist: ${planRef}`);
    return;
  }
  const actual = `sha256:${crypto.createHash("sha256").update(fs.readFileSync(planFile)).digest("hex")}`;
  if (actual !== recorded) fail(`${label} plan digest mismatch: expected ${recorded}, observed ${actual}`);
  else pass(`${label} binds the current plan digest`);
}

function codeBlockPaths(body, headingPattern) {
  const lines = String(body || "").split("\n");
  const output = [];
  let selected = false;
  let fenced = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!fenced && headingPattern.test(line)) {
      selected = true;
      continue;
    }
    if (!fenced && selected && /^(?:Allowed|Forbidden)\b/i.test(line)) {
      selected = headingPattern.test(line);
      continue;
    }
    if (line === "```text" || line === "```") {
      if (selected) fenced = !fenced;
      continue;
    }
    if (selected && fenced && line && !isPlaceholder(line)) output.push(normalizePath(line));
  }
  return [...new Set(output)];
}

function liveDiffFiles() {
  if (!args.cached && !args.base) return [];
  const staged = args.cached || (args.base && hasStagedCandidate());
  if (staged && !stagedCandidateMatchesWorktree()) {
    fail("staged candidate differs from the worktree or has untracked inputs; boundary verification refuses mixed evidence");
    return [];
  }
  const gitArgs = staged
    ? ["diff", "--cached", "--name-only", ...(args.base ? [String(args.base)] : [])]
    : ["diff", "--name-only", String(args.base)];
  const result = spawnSync("git", gitArgs, { cwd: projectRoot, encoding: "utf8" });
  if (result.status !== 0) {
    fail(`git diff failed: ${result.stderr || result.stdout}`);
    return [];
  }
  return result.stdout.split("\n").map((line) => normalizePath(line.trim())).filter(Boolean);
}

function hasStagedCandidate() {
  const result = spawnSync("git", ["diff", "--cached", "--quiet", "--"], { cwd: projectRoot, encoding: "utf8" });
  return result.status === 1;
}

function stagedCandidateMatchesWorktree() {
  const tracked = spawnSync("git", ["diff", "--quiet", "--"], { cwd: projectRoot, encoding: "utf8" });
  if (tracked.status !== 0) return false;
  const untracked = spawnSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd: projectRoot, encoding: "utf8" });
  return untracked.status === 0 && !untracked.stdout.trim();
}

function listAfterLabel(body, label) {
  const lines = String(body || "").split("\n");
  const output = [];
  let active = false;
  for (const line of lines) {
    if (new RegExp(`^${escapeRegExp(label)}\\s*:`, "i").test(line.trim())) {
      active = true;
      continue;
    }
    if (active && /^[A-Z][A-Za-z /-]+:\s*$/.test(line.trim())) break;
    if (active && /^\s*-\s+/.test(line)) {
      const value = stripMarkdown(line.replace(/^\s*-\s+/, ""));
      if (value && !isPlaceholder(value)) output.push(value);
    }
  }
  return output;
}

function matchesAny(file, patterns) {
  return patterns.some((pattern) => matchPattern(file, pattern));
}

function matchPattern(file, pattern) {
  const normalizedFile = normalizePath(file);
  const normalizedPattern = normalizePath(pattern);
  if (!normalizedPattern) return false;
  if (normalizedPattern.endsWith("/")) return normalizedFile.startsWith(normalizedPattern);
  if (normalizedPattern.includes("*")) {
    const regex = new RegExp(`^${escapeRegExp(normalizedPattern).replaceAll("\\*", ".*")}$`);
    return regex.test(normalizedFile);
  }
  return normalizedFile === normalizedPattern || normalizedFile.startsWith(`${normalizedPattern}/`);
}

function parseTable(body) {
  const lines = String(body || "").split("\n").map((line) => line.trim()).filter((line) => line.startsWith("|"));
  if (lines.length < 3) return [];
  const headers = splitMarkdownRow(lines[0]).map((header) => stripMarkdown(header).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""));
  return lines.slice(2).map((line) => {
    const row = {};
    splitMarkdownRow(line).forEach((cell, index) => {
      row[headers[index] || `col_${index}`] = stripMarkdown(cell);
    });
    return row;
  });
}

function firstCodeOrText(body) {
  const text = stripMarkdown(String(body || ""));
  const code = text.match(/\b[A-Z][A-Z0-9_]+(?:_[A-Z0-9]+)*\b/);
  return code ? code[0] : text.split(/\s+/)[0] || "";
}

function isPlaceholder(value) {
  return !value || /^(yes\s*\/|no\s*\/|pass\s*\/|tiny\s*\/|docs-only\s*\/|dependency\s*\/|not required\s*\/|<)/i.test(value);
}

function markdownFiles(dir) {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => path.join(fullDir, entry.name)).sort();
}

function meaningful(value) {
  const text = stripMarkdown(String(value || "")).replace(/[|:\-\s]/g, "");
  return text.length >= 4;
}

function normalizePath(value) {
  return String(value || "").replaceAll(path.sep, "/").replace(/^\.\//, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/") || path.basename(file);
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
  const consumerOutcome = deriveConsumerOutcome({
    hasArtifact: reports.length > 0,
    invalid: failed,
    blocked: !failed && blockedDisposition,
    ready: reports.length > 0 && !failed && !blockedDisposition,
  });
  if (outputJson) console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", consumerOutcome, checks }, null, 2));
  if (!outputJson) {
    console.log("");
    console.log(failed ? "Change boundary check failed." : blockedDisposition ? "Change boundary check is blocked." : "Change boundary check passed.");
  }
  process.exit(failed ? 1 : 0);
}
