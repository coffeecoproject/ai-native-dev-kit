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
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".ai-native", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/hook-orchestration.md",
  "docs/hook-orchestration.md",
  "templates/hook-orchestration-plan.md",
  "checklists/hook-orchestration-review.md",
  "prompts/hook-orchestration-agent.md",
  "scripts/resolve-hook-orchestration.mjs",
  "scripts/check-hook-orchestration.mjs",
];

const requiredDirectories = [
  "hook-orchestration-plans",
];

const reportSections = [
  "Human Decision Summary",
  "Human Summary",
  "Existing Hook / CI Inventory",
  "Proposed Hook Candidates",
  "Auto-Allow Candidates",
  "Approval-Required Candidates",
  "Forbidden Automatic Actions",
  "Rollback / Disable Plan",
  "Human Decisions Needed",
  "Boundary",
  "Outcome",
];

const allowedLevels = new Set([
  "H0_AUTO_READ_ONLY",
  "H1_AUTO_SUGGESTION",
  "H2_REQUIRES_CONFIRMATION",
  "H3_EXPLICIT_APPROVAL_REQUIRED",
]);

const allowedOutcomes = new Set([
  "HOOK_PLAN_RECORDED",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);

const forbiddenClaims = [
  /\bhooks?\s+(installed|enabled|activated)\b/i,
  /\binstalled\s+automatically\b/i,
  /\bCI\s+(was\s+)?(modified|changed|updated)\b/i,
  /\bblocking\s+gate\s+(added|enabled|activated)\b/i,
  /\bexternal\s+API\s+(enabled|called|configured)\b/i,
  /\bauto-?fix\s+(enabled|approved|authorized)\b/i,
  /\bhook\s+output\s+(is\s+)?human\s+approval\b/i,
  /\bapproved\s+by\s+Codex\b/i,
  /\brelease\s+(approved|authorized|ready)\b/i,
  /\bproduction\s+(approved|authorized|ready)\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Hook Orchestration Check");
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
else pass("source-only 1.23 hook orchestration evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/hook-orchestration.md");
  if (!core) return;
  for (const marker of [
    "Hook Orchestration Governance",
    "Hook orchestration is plan-first",
    "H0_AUTO_READ_ONLY",
    "H1_AUTO_SUGGESTION",
    "H2_REQUIRES_CONFIRMATION",
    "H3_EXPLICIT_APPROVAL_REQUIRED",
    "Codex must not automatically install hooks",
    "This plan installs hooks: No",
    "This plan modifies CI: No",
    "This plan adds blocking gates: No",
  ]) {
    if (core.includes(marker)) pass(`hook orchestration core includes ${marker}`);
    else fail(`hook orchestration core missing ${marker}`);
  }
}

function checkReports() {
  const files = markdownFiles("hook-orchestration-plans");
  if (files.length === 0) {
    pass("hook orchestration check skipped: no Hook Orchestration Plans");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);

    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    const scanContent = contentForForbiddenScan(content);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(scanContent)) fail(`${label} contains forbidden hook orchestration claim: ${pattern.source}`);
    }

    requireHookCandidateLevels(content, label);
    requireApprovalBoundaries(content, label);
    requireForbiddenAutomaticActions(content, label);
    requireRollbackPlan(content, label);
    requireBoundaryNo(content, label, "This plan installs hooks");
    requireBoundaryNo(content, label, "This plan modifies CI");
    requireBoundaryNo(content, label, "This plan adds blocking gates");
    requireBoundaryNo(content, label, "This plan calls external APIs");
    requireBoundaryNo(content, label, "This plan changes target-project files");
    requireBoundaryNo(content, label, "This plan enables auto-fix");
    requireBoundaryNo(content, label, "This plan approves implementation, release, or production");
    requireBoundaryNo(content, label, "This plan treats hook output as human approval");

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function requireHookCandidateLevels(content, label) {
  const candidates = tableRows(sectionBody(content, "Proposed Hook Candidates"));
  const levels = [];
  for (const cells of candidates) {
    const level = strip(cells[3] || "");
    if (level) levels.push(level);
    if (level && !allowedLevels.has(level)) fail(`${label} has invalid hook level: ${level}`);
    const installation = strip(cells[4] || "");
    const blocking = strip(cells[5] || "");
    const externalApi = strip(cells[6] || "");
    if (/^(Installed|Enabled|Activated|Yes)$/i.test(installation)) fail(`${label} candidate ${cells[0]} must not be installed by plan`);
    if (/^(Enabled|Activated|Yes)$/i.test(blocking)) fail(`${label} candidate ${cells[0]} must not enable blocking behavior by plan`);
    if (/^(Enabled|Called|Configured|Yes)$/i.test(externalApi)) fail(`${label} candidate ${cells[0]} must not call external API by plan`);
  }
  if (levels.length === 0) fail(`${label} must include at least one hook candidate`);
  else if (levels.every((level) => allowedLevels.has(level))) pass(`${label} records valid hook levels`);
}

function requireApprovalBoundaries(content, label) {
  const candidates = tableRows(sectionBody(content, "Proposed Hook Candidates"));
  for (const cells of candidates) {
    const hookId = strip(cells[0] || "");
    const level = strip(cells[3] || "");
    const humanApproval = strip(cells[7] || "");
    if (level === "H2_REQUIRES_CONFIRMATION") {
      if (/Required/i.test(humanApproval)) pass(`${label} ${hookId} requires human confirmation`);
      else fail(`${label} ${hookId} must require human confirmation`);
    }
    if (level === "H3_EXPLICIT_APPROVAL_REQUIRED") {
      if (/Explicit required/i.test(humanApproval)) pass(`${label} ${hookId} requires explicit approval`);
      else fail(`${label} ${hookId} must require explicit approval`);
    }
    if ((level === "H0_AUTO_READ_ONLY" || level === "H1_AUTO_SUGGESTION") && /Approved|Installed|Enabled/i.test(humanApproval)) {
      fail(`${label} ${hookId} must not treat H0/H1 as approval or installation`);
    }
  }
}

function requireForbiddenAutomaticActions(content, label) {
  const forbidden = sectionBody(content, "Forbidden Automatic Actions");
  for (const key of [
    "Install Git hooks automatically",
    "Modify CI automatically",
    "Add blocking gates automatically",
    "Call external APIs automatically",
    "Store tokens or secrets automatically",
    "Enable auto-fix automatically",
    "Treat hook output as human approval",
  ]) {
    const pattern = new RegExp(`^-\\s*${escapeRegExp(key)}:\\s*No\\s*$`, "im");
    if (pattern.test(forbidden)) pass(`${label} forbids ${key}`);
    else fail(`${label} must forbid ${key}: No`);
  }
}

function requireRollbackPlan(content, label) {
  const approval = sectionBody(content, "Approval-Required Candidates");
  const rollback = sectionBody(content, "Rollback / Disable Plan");
  const hasApprovalCandidate = /\|\s*H-\d+/i.test(approval);
  if (!hasApprovalCandidate) {
    pass(`${label} has no approval-required hook candidate`);
    return;
  }
  if (/Disable path/i.test(rollback) && /H-\d+/i.test(rollback) && !/\|\s*H-\d+\s*\|\s*(none|n\/a)\s*\|/i.test(rollback)) {
    pass(`${label} includes rollback / disable plan for approval-required candidates`);
  } else {
    fail(`${label} must include rollback / disable plan for H2/H3 candidates`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.23-hook-orchestration/README.md",
    "examples/1.23-hook-orchestration/hook-orchestration-plans/001-hook-plan.md",
    "releases/1.23.0/release-record.md",
    "releases/1.23.0/known-limitations.md",
    "releases/1.23.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.23 hook orchestration source evidence exists ${file}`);
    else fail(`1.23 hook orchestration source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-hook-orchestration.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Hook Orchestration Recommendation")
    && resolver.stdout.includes("This plan installs hooks: No")
    && resolver.stdout.includes("Proposed Hook Candidates")) {
    pass("1.23 hook orchestration resolver prints plan-first recommendation");
  } else {
    fail(`1.23 hook orchestration resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-hook-orchestration.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "HOOK_ORCHESTRATION_RECOMMENDATION"
        && parsed.boundary?.installsHooks === "No"
        && Array.isArray(parsed.proposedHookCandidates)) {
        pass("1.23 hook orchestration resolver JSON includes candidates and boundary");
      } else {
        fail(`1.23 hook orchestration resolver JSON missing required fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.23 hook orchestration resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.23 hook orchestration resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-hook-orchestration.mjs", "examples/1.23-hook-orchestration"]);
  if (example.status === 0 && example.stdout.includes("Hook orchestration check passed")) {
    pass("1.23 hook orchestration example passes checker");
  } else {
    fail(`1.23 hook orchestration example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["installs hook", "test-fixtures/bad/bad-hook-orchestration-installs-hook", "installs hooks"],
    ["blocking gate", "test-fixtures/bad/bad-hook-orchestration-blocking-gate", "adds blocking gates"],
  ]) {
    const result = runNode(["scripts/check-hook-orchestration.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.23 hook orchestration rejects ${name}`);
    } else {
      fail(`1.23 hook orchestration must reject ${name}: ${output}`);
    }
  }
}

function contentForForbiddenScan(content) {
  return String(content)
    .replace(/^.*\b(no|none|not)\b.*\bhooks?\b.*\b(installed|enabled|activated)\b.*$/gim, "")
    .replace(/^- This plan installs hooks: No$/gim, "")
    .replace(/^- This plan modifies CI: No$/gim, "")
    .replace(/^- This plan adds blocking gates: No$/gim, "")
    .replace(/^- This plan calls external APIs: No$/gim, "")
    .replace(/^- This plan changes target-project files: No$/gim, "")
    .replace(/^- This plan enables auto-fix: No$/gim, "")
    .replace(/^- This plan approves implementation, release, or production: No$/gim, "")
    .replace(/^- This plan treats hook output as human approval: No$/gim, "");
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
    console.log("Hook orchestration check passed.");
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

function tableRows(body) {
  return String(body || "")
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .filter((line) => !/^\|\s*-+\s*\|/.test(line))
    .filter((line) => !/\|\s*Hook ID\s*\|/i.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => strip(cell)))
    .filter((cells) => cells.length > 0);
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
  const nativeAsset = path.join(projectRoot, ".ai-native", file);
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

function strip(value) {
  return String(value || "").replace(/`/g, "").replace(/\*\*/g, "").trim();
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
