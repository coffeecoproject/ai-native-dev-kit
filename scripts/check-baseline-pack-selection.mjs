#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const reportArg = args.report ? String(args.report) : null;
const outputJson = Boolean(args.json);
const strict = Boolean(args.strict);
const knownFlags = new Set(["report", "json", "strict"]);
const results = [];
let failed = false;
let pending = false;

for (const key of Object.keys(args)) {
  if (key !== "_" && !knownFlags.has(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

function record(status, message) {
  results.push({ status, message });
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function pass(message) {
  record("PASS", message);
}

function fail(message) {
  failed = true;
  record("FAIL", message);
}

function warn(message) {
  pending = true;
  if (strict) fail(message);
  else record("PENDING", message);
}

function reportFiles() {
  if (reportArg) return [path.resolve(projectRoot, reportArg)];
  const dir = path.join(projectRoot, "baseline-pack-selections");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => path.join(dir, file));
}

function bodyHasAny(content, patterns) {
  return patterns.some((pattern) => pattern.test(content));
}

function singleDecisionStatus(body) {
  const matches = body.match(/\b(PENDING|APPROVED|REJECTED)\b/g) || [];
  return [...new Set(matches)].length === 1 ? matches[0] : null;
}

function validateRequiredSections(content, rel) {
  const requiredSections = [
    "Human Summary",
    "Project Classification",
    "Baseline Level",
    "Selected Profiles",
    "Recommended Pack Set",
    "Not Selected",
    "Evidence Required",
    "Human Decision",
    "Boundary",
  ];
  for (const section of requiredSections) {
    const body = sectionBody(content, section);
    if (body.trim()) pass(`${rel} section ${section}`);
    else fail(`${rel} missing or empty section ${section}`);
  }
}

function validateBoundary(content, rel) {
  const boundary = sectionBody(content, "Boundary");
  for (const marker of [
    "authorizes target-project writes: No",
    "approves implementation: No",
    "approves release or production: No",
    "proves real project evidence exists: No",
  ]) {
    if (boundary.includes(marker)) pass(`${rel} boundary includes ${marker}`);
    else fail(`${rel} boundary missing ${marker}`);
  }
}

function validateOverclaims(content, rel) {
  const normalized = content.toLowerCase();
  const forbidden = [
    { label: "selects all packs by default", pattern: /\b(select|enable|install|use)\s+all\s+(industrial\s+)?packs\b/i },
    { label: "BL2 is default", pattern: /\bbl2\b.{0,40}\b(default|always|required for every project)\b/i },
    { label: "draft pack stable claim", pattern: /\bdraft\b.{0,80}\b(stable|production[- ]ready|validated for production)\b/i },
    { label: "pack files prove real evidence", pattern: /\b(pack files|industrial pack files)\b.{0,80}\b(prove|confirm|validate)\b.{0,80}\b(real project|production|evidence)\b/i },
    { label: "write authorization", pattern: /\b(authorizes target-project writes|can ai write now|target-project write approved)\s*:\s*yes\b/i },
    { label: "implementation approval", pattern: /\b(approves implementation|implementation approved)\s*:\s*yes\b/i },
    { label: "release approval", pattern: /\b(approves release|production approved|release approved)\s*:\s*yes\b/i },
  ];
  for (const item of forbidden) {
    if (item.pattern.test(content)) fail(`${rel} overclaims: ${item.label}`);
    else pass(`${rel} avoids ${item.label}`);
  }
  if (normalized.includes("stable default") || normalized.includes("production-ready baseline pack")) {
    fail(`${rel} overclaims pack maturity`);
  }
}

function validateDecision(content, rel) {
  const decision = sectionBody(content, "Human Decision");
  const status = singleDecisionStatus(decision);
  if (status) pass(`${rel} Human Decision status ${status}`);
  else fail(`${rel} Human Decision must contain exactly one status: PENDING, APPROVED, or REJECTED`);

  const recommended = sectionBody(content, "Recommended Pack Set");
  const hasIndustrialPack = /\b[a-z0-9][a-z0-9-]*-industrial\b/i.test(recommended);
  if (hasIndustrialPack && !decision.toLowerCase().includes("draft pack acceptance")) {
    warn(`${rel} recommends industrial packs but does not explicitly record draft pack acceptance`);
  }
}

function validateReport(file) {
  if (!fs.existsSync(file)) {
    fail(`baseline pack selection report not found: ${file}`);
    return;
  }
  const rel = path.relative(projectRoot, file).replaceAll(path.sep, "/");
  const content = fs.readFileSync(file, "utf8");
  validateRequiredSections(content, rel);
  validateBoundary(content, rel);
  validateOverclaims(content, rel);
  validateDecision(content, rel);
  if (bodyHasAny(content, [/\bprimary platform packs\b/i, /\bcapability packs\b/i, /\brisk overlay packs\b/i])) {
    pass(`${rel} separates pack types`);
  } else {
    fail(`${rel} must separate primary platform, capability, and risk overlay packs`);
  }
}

const reports = reportFiles();

if (!outputJson) {
  console.log("# Baseline Pack Selection Check");
  console.log("");
}

if (reports.length === 0) {
  pass("baseline pack selection check skipped: no reports");
} else {
  for (const file of reports) validateReport(file);
}

if (outputJson) {
  console.log(JSON.stringify({
    status: failed ? "FAIL" : pending ? "PENDING" : "PASS",
    projectRoot,
    report: reportArg,
    strict,
    results,
  }, null, 2));
}

if (failed) process.exit(1);

if (!outputJson) {
  console.log("");
  if (pending) console.log("Baseline pack selection has pending decisions.");
  else console.log("Baseline pack selection check passed.");
}

