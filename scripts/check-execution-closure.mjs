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
  "core/execution-review-closure.md",
  "docs/execution-review-closure.md",
  "templates/execution-closure-report.md",
  "checklists/execution-review-closure-review.md",
  "prompts/execution-closure-agent.md",
  "scripts/resolve-execution-closure.mjs",
  "scripts/check-execution-closure.mjs",
];

const requiredDirectories = ["execution-closures"];
const reportSections = [
  "Human Decision Summary",
  "Task Context",
  "Change Summary",
  "Review Surface Closure",
  "Verification Closure",
  "Scope Boundary Closure",
  "Debt Closure",
  "Commit Readiness",
  "Human Decisions",
  "Boundaries",
  "Outcome",
];
const allowedStates = new Set([
  "NOT_READY_TO_CLOSE",
  "CLOSE_WITH_LIMITATIONS",
  "READY_FOR_COMMIT_REVIEW",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);
const allowedOutcomes = new Set(["CLOSURE_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const requiredSurfaces = [
  "FUNCTIONAL_REVIEW",
  "CODE_REVIEW",
  "VERIFICATION_REVIEW",
  "DEBT_REVIEW",
];
const forbiddenClaims = [
  /\bwrites target files:\s*Yes\b/i,
  /\bapproves implementation:\s*Yes\b/i,
  /\bapproves release or production:\s*Yes\b/i,
  /\bchanges task state:\s*Yes\b/i,
  /\bforgives debt:\s*Yes\b/i,
  /\breplaces Review Loop:\s*Yes\b/i,
  /\breplaces Safe Launch:\s*Yes\b/i,
  /\bauthorizes commit or push:\s*Yes\b/i,
  /\bapproves security\/privacy\/compliance\/payment\/migration decisions:\s*Yes\b/i,
  /\bimplementation approved\b/i,
  /\brelease approved\b/i,
  /\bproduction ready\b/i,
  /\bsafe to launch\b/i,
  /\bcommit approved\b/i,
  /\bpush approved\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Execution Review Closure Check");
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
else pass("source-only 1.32 execution closure evidence checks skipped for target project");
emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/execution-review-closure.md");
  if (!core) return;
  for (const marker of [
    "Execution Review Closure",
    "Execution Closure Report",
    "READY_FOR_COMMIT_REVIEW",
    "This closure approves implementation: No",
    "This closure authorizes commit or push: No",
    "This closure replaces Safe Launch: No",
  ]) {
    if (core.includes(marker)) pass(`execution closure core includes ${marker}`);
    else fail(`execution closure core missing ${marker}`);
  }
}

function checkReports() {
  const files = markdownFiles("execution-closures");
  if (files.length === 0) {
    pass("execution closure check skipped: no Execution Closure Reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden execution closure claim: ${pattern.source}`);
    }

    const reviewBody = sectionBody(content, "Review Surface Closure");
    for (const surface of requiredSurfaces) {
      if (reviewBody.includes(surface)) pass(`${label} includes required closure surface ${surface}`);
      else fail(`${label} missing required closure surface ${surface}`);
    }
    if (/\b(pass|fail|not verified)\b/i.test(reviewBody)) pass(`${label} includes review result statuses`);
    else fail(`${label} must include review result statuses`);

    const verificationBody = sectionBody(content, "Verification Closure");
    if (/Verification commands/i.test(verificationBody)) pass(`${label} includes verification commands row`);
    else fail(`${label} missing verification commands row`);
    if (/\b(pass|fail|not verified)\b/i.test(verificationBody)) pass(`${label} includes verification status`);
    else fail(`${label} must include verification status`);

    const closureState = strip(tableValue(content, "Closure state")).replace(/`/g, "");
    if (allowedStates.has(closureState)) pass(`${label} has valid closure state`);
    else fail(`${label} has invalid closure state: ${closureState || "<empty>"}`);

    if (closureState === "READY_FOR_COMMIT_REVIEW") {
      if (/\|\s*Verification commands\s*\|\s*pass\s*\|/i.test(verificationBody)) {
        pass(`${label} ready-for-commit has passing verification commands`);
      } else {
        fail(`${label} READY_FOR_COMMIT_REVIEW requires passing verification commands`);
      }
      if (!/\|\s*`?VERIFICATION_REVIEW`?\s*\|\s*not verified\s*\|/i.test(reviewBody)) {
        pass(`${label} ready-for-commit does not leave verification review unverified`);
      } else {
        fail(`${label} READY_FOR_COMMIT_REVIEW cannot leave VERIFICATION_REVIEW not verified`);
      }
    }

    requireBoundaryNo(content, label, "This closure writes target files");
    requireBoundaryNo(content, label, "This closure approves implementation");
    requireBoundaryNo(content, label, "This closure approves release or production");
    requireBoundaryNo(content, label, "This closure changes task state");
    requireBoundaryNo(content, label, "This closure forgives debt");
    requireBoundaryNo(content, label, "This closure replaces Review Loop");
    requireBoundaryNo(content, label, "This closure replaces Safe Launch");
    requireBoundaryNo(content, label, "This closure authorizes commit or push");
    requireBoundaryNo(content, label, "This closure approves security/privacy/compliance/payment/migration decisions");

    const decisions = numberedItems(sectionBody(content, "Human Decisions"));
    const highRisk = /High-risk surfaces touched\s*\|\s*Yes/i.test(sectionBody(content, "Scope Boundary Closure"));
    const maxDecisions = highRisk ? 5 : 3;
    if (decisions.length <= maxDecisions) pass(`${label} human decision count within limit`);
    else fail(`${label} asks too many human decisions: ${decisions.length} > ${maxDecisions}`);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.32-execution-review-closure/README.md",
    "examples/1.32-execution-review-closure/execution-closures/001-booking-validation-closure.md",
    "test-fixtures/bad/bad-execution-closure-approves-implementation/execution-closures/001-bad.md",
    "test-fixtures/bad/bad-execution-closure-missing-verification/execution-closures/001-bad.md",
    "releases/1.32.0/release-record.md",
    "releases/1.32.0/known-limitations.md",
    "releases/1.32.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.32 execution closure source evidence exists ${file}`);
    else fail(`1.32 execution closure source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-execution-closure.mjs", ".", "--intent", "finish Dev Kit closure", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Execution Closure Report")
    && resolver.stdout.includes("Commit Readiness")
    && resolver.stdout.includes("This closure authorizes commit or push: No")) {
    pass("1.32 execution closure resolver prints safe report");
  } else {
    fail(`1.32 execution closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-execution-closure.mjs", ".", "--intent", "finish Dev Kit closure", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "EXECUTION_REVIEW_CLOSURE"
        && parsed.boundaries?.authorizesCommitOrPush === "No"
        && parsed.commitReadiness?.closureState
        && Array.isArray(parsed.reviewSurfaceClosure)) {
        pass("1.32 execution closure resolver JSON includes closure state, surfaces, and boundary");
      } else {
        fail(`1.32 execution closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.32 execution closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.32 execution closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  pass("1.32 execution closure checker source repo checks are covered by the current process");

  const example = runNode(["scripts/check-execution-closure.mjs", "examples/1.32-execution-review-closure"]);
  if (example.status === 0 && example.stdout.includes("Execution Review Closure check passed")) {
    pass("1.32 execution closure example passes checker");
  } else {
    fail(`1.32 execution closure example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, args, expected] of [
    ["approval overclaim", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-approves-implementation"], "forbidden execution closure claim"],
    ["missing verification", ["scripts/check-execution-closure.mjs", "test-fixtures/bad/bad-execution-closure-missing-verification"], "requires passing verification commands"],
  ]) {
    const result = runNode(args);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.32 execution closure rejects ${name}`);
    } else {
      fail(`1.32 execution closure must reject ${name}: ${output}`);
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
  if (outputJson) console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", projectRoot, results: checks }, null, 2));
  else if (!failed) {
    console.log("");
    console.log("Execution Review Closure check passed.");
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

function resolveAsset(relativePath) {
  const candidates = [
    path.join(projectRoot, relativePath),
    path.join(projectRoot, ".ai-native", relativePath),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function resolveDirectory(relativePath) {
  const candidate = path.join(projectRoot, relativePath);
  return fs.existsSync(candidate) && fs.statSync(candidate).isDirectory() ? candidate : null;
}

function readResolved(relativePath) {
  const file = resolveAsset(relativePath);
  if (!file) {
    if (shouldRequireAssets) fail(`missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function displayAsset(expected, actual) {
  const relative = path.relative(projectRoot, actual).replaceAll(path.sep, "/");
  return relative || expected;
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
}

function tableValue(content, key) {
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(key)}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i");
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}

function numberedItems(value) {
  return String(value || "").split("\n").filter((line) => /^\s*\d+\.\s+/.test(line));
}

function codeOrTextValue(value) {
  const match = String(value || "").match(/`([^`]+)`/);
  if (match) return match[1].trim();
  return String(value || "").trim().split(/\s+/)[0] || "";
}

function strip(value) {
  return String(value || "").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function runNode(nodeArgs) {
  return spawnSync(process.execPath, nodeArgs, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
  });
}
