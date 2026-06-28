#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["report", "task", "base", "cached", "json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const reportArg = args.report ? normalizePath(String(args.report)) : null;

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Change Boundary Check");
  console.log("");
}

const reports = reportArg
  ? [path.join(projectRoot, reportArg)]
  : markdownFiles("change-boundary-reports");

if (reports.length === 0) {
  pass("change boundary check skipped: no change-boundary reports");
  emitAndExit();
}

const liveChangedFiles = liveDiffFiles();
for (const report of reports) checkReport(report, liveChangedFiles);

emitAndExit();

function checkReport(file, liveFiles) {
  if (!fs.existsSync(file)) {
    fail(`change-boundary report not found: ${rel(file)}`);
    return;
  }
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  for (const section of ["Task Ref", "Boundary Level", "Intended Scope", "Actual Changed Files", "Boundary Result", "Claim Boundary"]) {
    if (meaningful(sectionBody(content, section))) pass(`${label} includes ${section}`);
    else fail(`${label} missing meaningful ${section}`);
  }

  const boundaryLevel = firstCodeOrText(sectionBody(content, "Boundary Level"));
  if (!["CB0_ADVISORY", "CB1_RECORDED", "CB2_CHECKED", "CB3_HUMAN_APPROVED"].includes(boundaryLevel)) {
    fail(`${label} has invalid Boundary Level: ${boundaryLevel || "<empty>"}`);
  }

  const intended = sectionBody(content, "Intended Scope") || "";
  const allowedPaths = listAfterLabel(intended, "Allowed paths");
  const forbiddenPaths = listAfterLabel(intended, "Forbidden paths");
  const forbiddenTypes = listAfterLabel(intended, "Forbidden change types");
  const changedRows = parseTable(sectionBody(content, "Actual Changed Files"));
  const changedFiles = changedRows.map((row) => stripMarkdown(row.file || "")).filter((value) => value && !isPlaceholder(value));
  const disposition = firstCodeOrText(sectionBody(content, "Boundary Result"));

  if (changedFiles.length === 0) fail(`${label} must list actual changed files`);
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
  if (meaningfulOutOfScope && disposition === "PASS") {
    fail(`${label} cannot mark PASS when out-of-scope changes are listed`);
  }

  if (boundaryLevel === "CB3_HUMAN_APPROVED") {
    const approval = sectionBody(content, "Human Approval") || "";
    if (!/Status:\s*Approved/i.test(approval)) fail(`${label} CB3 requires approved Human Approval`);
  }

  if (liveFiles.length > 0) {
    for (const liveFile of liveFiles) {
      if (!changedFiles.includes(liveFile)) fail(`${label} missing live changed file from report: ${liveFile}`);
    }
  }
}

function liveDiffFiles() {
  if (!args.cached && !args.base) return [];
  const gitArgs = args.cached ? ["diff", "--cached", "--name-only"] : ["diff", "--name-only", String(args.base)];
  const result = spawnSync("git", gitArgs, { cwd: projectRoot, encoding: "utf8" });
  if (result.status !== 0) {
    fail(`git diff failed: ${result.stderr || result.stdout}`);
    return [];
  }
  return result.stdout.split("\n").map((line) => normalizePath(line.trim())).filter(Boolean);
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
  if (outputJson) console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", checks }, null, 2));
  if (failed) process.exit(1);
  if (!outputJson) {
    console.log("");
    console.log("Change boundary check passed.");
  }
}

