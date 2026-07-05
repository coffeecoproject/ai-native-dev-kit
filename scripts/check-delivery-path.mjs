#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
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
  "core/delivery-path-governance.md",
  "docs/delivery-path-governance.md",
  "templates/delivery-path-report.md",
  "checklists/delivery-path-review.md",
  "prompts/delivery-path-agent.md",
  "scripts/resolve-delivery-path.mjs",
  "scripts/check-delivery-path.mjs",
];

const requiredDirectories = [
  "delivery-path-reports",
];

const reportSections = [
  "Human Decision Summary",
  "Project Reading",
  "Delivery Path State",
  "Distance To Useful Use",
  "State Evidence",
  "Blockers",
  "Next Safe Action",
  "User Decisions",
  "Boundaries",
  "Outcome",
];

const allowedStates = new Set([
  "IDEA_ONLY",
  "NEEDS_PROJECT_READING",
  "READY_FOR_PLAN",
  "READY_FOR_LOCAL_BUILD",
  "READY_FOR_SELF_TEST",
  "READY_FOR_INTERNAL_TRIAL",
  "READY_FOR_RELEASE_REVIEW",
  "BLOCKED_BY_RISK",
  "BLOCKED_BY_DIRTY_WORK",
  "BLOCKED_BY_MISSING_DECISION",
  "N/A",
]);

const allowedOutcomes = new Set([
  "DELIVERY_PATH_RECORDED",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);

const forbiddenClaims = [
  /\bwrites target files:\s*Yes\b/i,
  /\bchanges CI or hooks:\s*Yes\b/i,
  /\bchanges task state:\s*Yes\b/i,
  /\bapproves implementation:\s*Yes\b/i,
  /\bapproves release or production:\s*Yes\b/i,
  /\breplaces Safe Launch:\s*Yes\b/i,
  /\bproves real users can use the product:\s*Yes\b/i,
  /\bproduction ready\b/i,
  /\brelease approved\b/i,
  /\bsafe to launch\b/i,
  /\bready for real users\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Delivery Path Check");
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
else pass("source-only 1.26 delivery path evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/delivery-path-governance.md");
  if (!core) return;
  for (const marker of [
    "Delivery Path Governance",
    "Delivery Path States",
    "BLOCKED_BY_DIRTY_WORK",
    "This report approves release or production: No",
    "This report replaces Safe Launch: No",
  ]) {
    if (core.includes(marker)) pass(`delivery path core includes ${marker}`);
    else fail(`delivery path core missing ${marker}`);
  }
}

function checkReports() {
  const files = markdownFiles("delivery-path-reports");
  if (files.length === 0) {
    pass("delivery path check skipped: no Delivery Path Reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);

    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden delivery path claim: ${pattern.source}`);
    }

    const currentState = strip(tableValue(content, "Current state")).replace(/`/g, "");
    const nextState = strip(tableValue(content, "Next target state")).replace(/`/g, "");
    if (allowedStates.has(currentState)) pass(`${label} has valid current state`);
    else fail(`${label} has invalid current state: ${currentState || "<empty>"}`);
    if (allowedStates.has(nextState)) pass(`${label} has valid next target state`);
    else fail(`${label} has invalid next target state: ${nextState || "<empty>"}`);

    const distanceItems = numberedItems(sectionBody(content, "Distance To Useful Use"));
    if (distanceItems.length > 0) pass(`${label} explains distance to useful use`);
    else fail(`${label} must explain distance to useful use`);

    const evidenceBody = sectionBody(content, "State Evidence");
    if (/pass|fail|not verified/i.test(evidenceBody)) pass(`${label} includes state evidence status`);
    else fail(`${label} must include state evidence status`);

    const nextAction = sectionBody(content, "Next Safe Action").trim();
    if (nextAction.length >= 10) pass(`${label} has concrete next safe action`);
    else fail(`${label} missing concrete next safe action`);

    const decisions = numberedItems(sectionBody(content, "User Decisions"));
    const riskLevel = strip(tableValue(content, "Risk level")).toLowerCase();
    const maxDecisions = riskLevel === "high" ? 5 : 3;
    if (decisions.length <= maxDecisions) pass(`${label} user decision count within limit`);
    else fail(`${label} asks too many user decisions: ${decisions.length} > ${maxDecisions}`);

    requireBoundaryNo(content, label, "This report writes target files");
    requireBoundaryNo(content, label, "This report changes CI or hooks");
    requireBoundaryNo(content, label, "This report changes task state");
    requireBoundaryNo(content, label, "This report approves implementation");
    requireBoundaryNo(content, label, "This report approves release or production");
    requireBoundaryNo(content, label, "This report replaces Safe Launch");
    requireBoundaryNo(content, label, "This report proves real users can use the product");

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/roadmaps/delivery-governance-roadmap-1.26-1.29.md",
    "examples/1.26-delivery-path-governance/README.md",
    "examples/1.26-delivery-path-governance/delivery-path-reports/001-booking-delivery-path.md",
    "releases/1.26.0/release-record.md",
    "releases/1.26.0/known-limitations.md",
    "releases/1.26.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.26 delivery path source evidence exists ${file}`);
    else fail(`1.26 delivery path source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-delivery-path.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Delivery Path Report")
    && resolver.stdout.includes("This report writes target files: No")) {
    pass("1.26 delivery path resolver prints safe report");
  } else {
    fail(`1.26 delivery path resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-delivery-path.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DELIVERY_PATH_REPORT"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.deliveryPathState?.currentState) {
        pass("1.26 delivery path resolver JSON includes state and boundaries");
      } else {
        fail(`1.26 delivery path resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.26 delivery path resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.26 delivery path resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-delivery-path.mjs", "examples/1.26-delivery-path-governance"]);
  if (example.status === 0 && example.stdout.includes("Delivery path check passed")) {
    pass("1.26 delivery path example passes checker");
  } else {
    fail(`1.26 delivery path example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["release overclaim", "test-fixtures/bad/bad-delivery-path-release-overclaim", "forbidden delivery path claim"],
    ["missing state", "test-fixtures/bad/bad-delivery-path-missing-state", "invalid current state"],
  ]) {
    const result = runNode(["scripts/check-delivery-path.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.26 delivery path rejects ${name}`);
    } else {
      fail(`1.26 delivery path must reject ${name}: ${output}`);
    }
  }
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
      projectRoot,
      results: checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Delivery path check passed.");
  }
  process.exit(failed ? 1 : 0);
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

function tableValue(content, label) {
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(label)}\\s*\\|\\s*([^|]+)\\|`, "i");
  const match = content.match(pattern);
  return match ? strip(match[1]) : "";
}

function numberedItems(body) {
  return String(body || "")
    .split(/\r?\n/)
    .filter((line) => /^\s*\d+\.\s+/.test(line));
}

function codeOrTextValue(body) {
  const text = strip(body);
  const code = text.match(/`([^`]+)`/);
  return code ? code[1].trim() : text.split(/\s+/)[0] || "";
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
  const match = content.match(pattern);
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index).trim() : rest.trim();
}

function markdownFiles(dir) {
  const base = resolveDirectory(dir);
  if (!base) return [];
  const files = [];
  walk(base, files);
  return files.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct)) return direct;
  const intentOS = path.join(projectRoot, ".intentos", relPath);
  if (fs.existsSync(intentOS)) return intentOS;
  return null;
}

function resolveDirectory(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const intentOS = path.join(projectRoot, ".intentos", relPath);
  if (fs.existsSync(intentOS) && fs.statSync(intentOS).isDirectory()) return intentOS;
  return null;
}

function readResolved(relPath) {
  const resolved = resolveAsset(relPath);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(projectRoot, relPath));
}

function displayAsset(relPath, resolved) {
  const direct = path.join(projectRoot, relPath);
  return path.resolve(resolved) === path.resolve(direct) ? relPath : `.intentos/${relPath}`;
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath) || ".";
}

function runNode(args) {
  return spawnSync(process.execPath, args, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 8,
  });
}

function strip(value) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
