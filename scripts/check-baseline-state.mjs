#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody, splitMarkdownRow, stripMarkdown } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["report", "json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowedStates = new Set(["PROPOSED", "PENDING_CONFIRMATION", "EVIDENCE_REQUIRED", "CONFIRMED", "NOT_APPLICABLE", "SUPERSEDED"]);
const noCodeModes = new Set(["NO_CODE", "NEW_PROJECT"]);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

let failed = false;
const checks = [];
const reportArg = args.report ? String(args.report) : null;
const reports = reportArg ? [path.isAbsolute(reportArg) ? reportArg : path.join(projectRoot, reportArg)] : markdownFiles("baseline-state-reports");

if (!outputJson) {
  console.log("# Baseline State Check");
  console.log("");
}

if (reports.length === 0) {
  pass("baseline state check skipped: no baseline-state reports");
  emitAndExit();
}

for (const report of reports) checkReport(report);

emitAndExit();

function checkReport(file) {
  if (!fs.existsSync(file)) {
    fail(`baseline-state report not found: ${rel(file)}`);
    return;
  }
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  for (const section of ["Project Mode", "Baseline Recommendation", "Implementation Permission", "What Codex Must Not Claim", "Claim Boundary"]) {
    if (meaningful(sectionBody(content, section))) pass(`${label} includes ${section}`);
    else fail(`${label} missing meaningful ${section}`);
  }

  const projectMode = firstCodeOrText(sectionBody(content, "Project Mode"));
  const rows = parseTable(sectionBody(content, "Baseline Recommendation"));
  if (rows.length === 0) fail(`${label} must include baseline recommendation rows`);

  let hasUnconfirmed = false;
  for (const row of rows) {
    const area = stripMarkdown(row.area || "baseline item");
    const state = stripMarkdown(row.state || "").toUpperCase();
    const evidence = stripMarkdown(row.evidence_ref || "");
    const humanDecision = stripMarkdown(row.human_decision_needed || "");
    if (!allowedStates.has(state)) {
      fail(`${label} ${area} has invalid baseline state: ${state || "<empty>"}`);
      continue;
    }
    if (["PROPOSED", "PENDING_CONFIRMATION", "EVIDENCE_REQUIRED"].includes(state)) hasUnconfirmed = true;
    if (noCodeModes.has(projectMode) && state === "CONFIRMED" && !hasEvidenceOrHumanSource(evidence, humanDecision)) {
      fail(`${label} no-code/new-project ${area} cannot be CONFIRMED without evidence or human-confirmed source`);
    }
    if (state === "CONFIRMED" && !hasEvidenceOrHumanSource(evidence, humanDecision)) {
      fail(`${label} ${area} CONFIRMED state requires evidence ref or human-confirmed source`);
    }
    if (/industrial/i.test(area) && state === "CONFIRMED" && /draft/i.test([row.recommendation, evidence, humanDecision].join(" "))) {
      fail(`${label} draft industrial baseline must not be CONFIRMED`);
    }
  }

  const implementation = sectionBody(content, "Implementation Permission") || "";
  if (hasUnconfirmed && /Can AI implement against this baseline now:\s*Yes/i.test(implementation)) {
    fail(`${label} must not allow full implementation against proposed or evidence-required baseline`);
  }
  const forbiddenClaims = [content].join("\n");
  if (/\b(production-ready|industrial-grade|BASELINE_READY|verified baseline)\b/i.test(forbiddenClaims)
    && !/must not|not claim|not prove|forbidden/i.test(forbiddenClaims)) {
    fail(`${label} contains overclaim wording for baseline readiness`);
  }
}

function hasEvidenceOrHumanSource(evidence, humanDecision) {
  return Boolean(evidence && !isPlaceholder(evidence)) || /\b(approved|confirmed|human|source of truth)\b/i.test(humanDecision);
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
  }).filter((row) => Object.values(row).some((value) => value && !isPlaceholder(value)));
}

function firstCodeOrText(body) {
  const text = stripMarkdown(String(body || ""));
  const code = text.match(/\b[A-Z][A-Z0-9_]+(?:_[A-Z0-9]+)*\b/);
  return code ? code[0] : text.split(/\s+/)[0] || "";
}

function isPlaceholder(value) {
  return !value || /^(proposed\s*\/|pending\s*\/|evidence_required\s*\/|confirmed\s*\/|no\s*\/|limited\s*\/|<)/i.test(value);
}

function markdownFiles(dir) {
  const fullDir = path.join(projectRoot, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => path.join(fullDir, entry.name)).sort();
}

function meaningful(value) {
  const text = stripMarkdown(String(value || "")).replace(/[|:\-\s]/g, "");
  return text.length >= 8;
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
    console.log("Baseline state check passed.");
  }
}
