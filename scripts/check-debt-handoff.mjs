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
  "core/debt-knowledge-handoff.md",
  "docs/debt-knowledge-handoff.md",
  "templates/debt-knowledge-handoff-report.md",
  "checklists/debt-knowledge-handoff-review.md",
  "prompts/debt-handoff-agent.md",
  "scripts/resolve-debt-handoff.mjs",
  "scripts/check-debt-handoff.mjs",
];

const requiredDirectories = ["debt-handoff-reports"];
const reportSections = [
  "Human Decision Summary",
  "Task Context",
  "Debt Register",
  "Knowledge Handoff",
  "Verification Notes",
  "Files To Revisit",
  "Human Decisions",
  "Boundaries",
  "Outcome",
];
const allowedLevels = new Set([
  "D0_NO_DEBT_FOUND",
  "D1_ACCEPTABLE_SMALL_DEBT",
  "D2_MAINTENANCE_DEBT",
  "D3_RELEASE_BLOCKING_DEBT",
  "D4_HIGH_RISK_DEBT",
]);
const allowedOutcomes = new Set(["HANDOFF_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const forbiddenClaims = [
  /\bforgives debt:\s*Yes\b/i,
  /\bapproves implementation:\s*Yes\b/i,
  /\bapproves release or production:\s*Yes\b/i,
  /\bchanges task state:\s*Yes\b/i,
  /\bchanges source of truth:\s*Yes\b/i,
  /\breplaces Review Loop:\s*Yes\b/i,
  /\breplaces Safe Launch:\s*Yes\b/i,
  /\bdebt accepted\b/i,
  /\bdebt forgiven\b/i,
  /\brelease approved\b/i,
  /\bproduction ready\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Debt & Knowledge Handoff Check");
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
else pass("source-only 1.27 debt handoff evidence checks skipped for target project");
emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/debt-knowledge-handoff.md");
  if (!core) return;
  for (const marker of [
    "Debt & Knowledge Handoff",
    "D0_NO_DEBT_FOUND",
    "D4_HIGH_RISK_DEBT",
    "This report forgives debt: No",
    "This report replaces Safe Launch: No",
  ]) {
    if (core.includes(marker)) pass(`debt handoff core includes ${marker}`);
    else fail(`debt handoff core missing ${marker}`);
  }
}

function checkReports() {
  const files = markdownFiles("debt-handoff-reports");
  if (files.length === 0) {
    pass("debt handoff check skipped: no Debt & Knowledge Handoff Reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden debt handoff claim: ${pattern.source}`);
    }
    const levels = [...sectionBody(content, "Debt Register").matchAll(/\bD[0-4]_[A-Z0-9_]+\b/g)].map((item) => item[0]);
    if (levels.length > 0) pass(`${label} includes debt level`);
    else fail(`${label} must include at least one debt level`);
    for (const level of levels) {
      if (allowedLevels.has(level)) pass(`${label} uses allowed debt level ${level}`);
      else fail(`${label} has invalid debt level: ${level}`);
    }
    const handoff = sectionBody(content, "Knowledge Handoff");
    for (const marker of ["What Changed", "Why It Changed", "How To Verify", "Where To Start Next Time", "Do Not Touch Without Approval"]) {
      if (handoff.includes(marker)) pass(`${label} handoff includes ${marker}`);
      else fail(`${label} handoff missing ${marker}`);
    }
    if (levels.includes("D3_RELEASE_BLOCKING_DEBT") || levels.includes("D4_HIGH_RISK_DEBT")) {
      if (/Blocks release review\?\s*\|\s*Yes/i.test(sectionBody(content, "Debt Register")) || /Blocks release review\?\s*\|.*\|\s*Yes\s*\|/i.test(sectionBody(content, "Debt Register"))) {
        pass(`${label} blocks release review for D3/D4`);
      } else {
        fail(`${label} D3/D4 debt must block release review`);
      }
    }
    requireBoundaryNo(content, label, "This report forgives debt");
    requireBoundaryNo(content, label, "This report approves implementation");
    requireBoundaryNo(content, label, "This report approves release or production");
    requireBoundaryNo(content, label, "This report changes task state");
    requireBoundaryNo(content, label, "This report changes source of truth");
    requireBoundaryNo(content, label, "This report replaces Review Loop");
    requireBoundaryNo(content, label, "This report replaces Safe Launch");
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.27-debt-knowledge-handoff/README.md",
    "examples/1.27-debt-knowledge-handoff/debt-handoff-reports/001-booking-handoff.md",
    "releases/1.27.0/release-record.md",
    "releases/1.27.0/known-limitations.md",
    "releases/1.27.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.27 debt handoff source evidence exists ${file}`);
    else fail(`1.27 debt handoff source evidence missing ${file}`);
  }
  const resolver = runNode(["scripts/resolve-debt-handoff.mjs", "."]);
  if (resolver.status === 0 && resolver.stdout.includes("Debt & Knowledge Handoff Report") && resolver.stdout.includes("This report forgives debt: No")) {
    pass("1.27 debt handoff resolver prints safe report");
  } else {
    fail(`1.27 debt handoff resolver failed: ${resolver.stderr || resolver.stdout}`);
  }
  const resolverJson = runNode(["scripts/resolve-debt-handoff.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DEBT_KNOWLEDGE_HANDOFF_REPORT"
        && parsed.boundaries?.forgivesDebt === "No"
        && parsed.debtRegister?.[0]?.level
        && parsed.knowledgeHandoff?.howToVerify) {
        pass("1.27 debt handoff resolver JSON includes debt, handoff, and boundaries");
      } else {
        fail(`1.27 debt handoff resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.27 debt handoff resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.27 debt handoff resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }
  const example = runNode(["scripts/check-debt-handoff.mjs", "examples/1.27-debt-knowledge-handoff"]);
  if (example.status === 0 && example.stdout.includes("Debt & Knowledge Handoff check passed")) pass("1.27 debt handoff example passes checker");
  else fail(`1.27 debt handoff example failed: ${example.stderr || example.stdout}`);
  for (const [name, target, expected] of [
    ["debt forgiven", "test-fixtures/bad/bad-debt-handoff-forgives-debt", "forbidden debt handoff claim"],
    ["missing handoff", "test-fixtures/bad/bad-debt-handoff-missing-handoff", "handoff missing How To Verify"],
  ]) {
    const result = runNode(["scripts/check-debt-handoff.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.27 debt handoff rejects ${name}`);
    else fail(`1.27 debt handoff must reject ${name}: ${output}`);
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
  if (outputJson) console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", projectRoot, results: checks }, null, 2));
  else if (!failed) {
    console.log("");
    console.log("Debt & Knowledge Handoff check passed.");
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
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
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
  return spawnSync(process.execPath, args, { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 8 });
}

function codeOrTextValue(body) {
  const text = strip(body);
  const code = text.match(/`([^`]+)`/);
  return code ? code[1].trim() : text.split(/\s+/)[0] || "";
}

function strip(value) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
