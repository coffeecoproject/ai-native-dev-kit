#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["file", "json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const explicitFile = args.file ? path.resolve(process.cwd(), String(args.file)) : null;
const outputJson = Boolean(args.json);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const currentVersion = readCurrentVersion(projectRoot);
const releaseRecord = currentVersion ? path.join(projectRoot, "releases", currentVersion, "release-record.md") : null;
const defaultFiles = [
  "README.md",
  "README.zh-CN.md",
  "VERSION.md",
  releaseRecord ? path.relative(projectRoot, releaseRecord) : null,
  "final-reports/130-guided-delivery-baseline.md",
].filter(Boolean);

const forbiddenPatterns = [
  { pattern: /\bguaranteed\s+(safe|production|delivery|launch)\b/i, reason: "guaranteed safety or delivery claim" },
  { pattern: /\bproduction[-\s]?proven\b/i, reason: "production-proven claim without required evidence boundary" },
  { pattern: /\bsuitable\s+for\s+every\s+project\b/i, reason: "unbounded every-project claim" },
  { pattern: /\bno\s+human\s+approval\s+required\b/i, reason: "human approval bypass claim" },
  { pattern: /\breport\s+(approves|approved)\s+(release|launch|risk|scope)\b/i, reason: "report-as-approval claim" },
  { pattern: /\bsimulated\s+dogfood\s+proves\s+production\s+readiness\b/i, reason: "simulation-to-production overclaim" },
  { pattern: /\bdraft\s+pack\s+is\s+stable\b/i, reason: "draft-to-stable overclaim" },
  { pattern: /\ball\s+industrial\s+packs\s+(are\s+)?enabled\s+by\s+default\b/i, reason: "default all-pack overclaim" },
  { pattern: /\bAI\s+can\s+(accept\s+risk|approve\s+launch|approve\s+release)\b/i, reason: "AI authority overclaim" },
];

const requiredReleaseSections = [
  "Allowed Claims",
  "Forbidden Claims",
  "Evidence Status",
  "Known Limitations",
  "Verification",
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Claim Control Check");
  console.log("");
}

const files = explicitFile ? [explicitFile] : defaultFiles.map((file) => path.join(projectRoot, file));
for (const file of files) {
  if (!fs.existsSync(file)) {
    record("PENDING", `skipped missing optional claim artifact: ${rel(file)}`);
    continue;
  }
  checkFile(file);
}

if (releaseRecord && fs.existsSync(releaseRecord)) checkReleaseRecord(releaseRecord);

emitAndExit();

function checkFile(file) {
  const content = fs.readFileSync(file, "utf8");
  const scanContent = contentForForbiddenScan(content);
  const label = rel(file);
  let hasForbiddenClaim = false;
  for (const entry of forbiddenPatterns) {
    if (entry.pattern.test(scanContent)) {
      hasForbiddenClaim = true;
      record("FAIL", `${label} contains forbidden claim: ${entry.reason}`);
    }
  }
  if (!hasForbiddenClaim) record("PASS", `${label} has no forbidden claim wording`);

  if (/final-reports\/|customer-handoffs\//.test(label)) {
    if (/does not approve (release|risk|scope expansion|future work)/i.test(content)
      || /does not approve release, risk, scope expansion, or future work/i.test(content)) {
      record("PASS", `${label} keeps report authority bounded`);
    } else {
      record("FAIL", `${label} must state that the report does not approve release, risk, scope expansion, or future work`);
    }
    if (containsAssumptionSignals(content) && !/## Assumption Register/i.test(content)) {
      record("FAIL", `${label} contains inferred or assumption-sensitive wording without Assumption Register`);
    } else {
      record("PASS", `${label} assumption-sensitive wording is bounded`);
    }
  }
}

function checkReleaseRecord(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  for (const section of requiredReleaseSections) {
    const body = sectionBody(content, section);
    if (body && meaningfulSectionBody(body)) {
      record("PASS", `${label} includes meaningful ${section}`);
    } else {
      record("FAIL", `${label} missing required meaningful claim-control section: ${section}`);
    }
  }
}

function meaningfulSectionBody(body) {
  const normalized = String(body || "")
    .replace(/```[a-zA-Z0-9_-]*\n?/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/[#>*_`|:\-\s]/g, "");
  return normalized.length >= 20;
}

function readCurrentVersion(root) {
  const versionPath = path.join(root, "VERSION.md");
  if (!fs.existsSync(versionPath)) return null;
  const match = fs.readFileSync(versionPath, "utf8").match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : null;
}

function containsAssumptionSignals(content) {
  return /\b(assume|assumed|assuming|inferred|likely|appears to|production-like|staging|rollback)\b/i.test(content);
}

function contentForForbiddenScan(content) {
  const kept = [];
  let skipping = false;
  for (const line of String(content).split("\n")) {
    if (/^## Forbidden Claims\s*$/i.test(line)) {
      skipping = true;
      continue;
    }
    if (skipping && /^##\s+/.test(line)) {
      skipping = false;
    }
    if (!skipping) kept.push(line);
  }
  return kept.join("\n");
}

function record(status, message) {
  checks.push({ status, message });
  if (status === "FAIL") failed = true;
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function rel(file) {
  return path.relative(projectRoot, file).replace(/\\/g, "/") || path.basename(file);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      status: failed ? "FAIL" : "PASS",
      checkedFiles: files.map((file) => rel(file)),
      checks,
    }, null, 2));
  }
  if (failed) process.exit(1);
  if (!outputJson) {
    console.log("");
    console.log("Claim control check passed.");
  }
}
