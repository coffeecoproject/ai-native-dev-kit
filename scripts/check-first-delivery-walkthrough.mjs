#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

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
  "core/first-delivery-walkthrough.md",
  "templates/adoption-trial-report.md",
  "checklists/first-delivery-walkthrough-review.md",
  "prompts/walkthrough-agent.md",
  "docs/first-delivery-walkthrough.md",
  "scripts/check-first-delivery-walkthrough.mjs",
];

const requiredDirectories = [
  "adoption-trial-reports",
];

const reportSections = [
  "Human Summary",
  "Scenario",
  "User Starting Point",
  "Codex Routing",
  "Baseline Path",
  "Artifact Path",
  "Human Decisions",
  "Subagent Orchestration",
  "Drift Events",
  "Verification Evidence",
  "Launch Readiness",
  "Final Report",
  "Observations",
  "Outcome",
];

const allowedOutcomes = new Set([
  "SIMULATED_READY_FOR_DEMO",
  "REAL_TRIAL_RECORDED",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);

const forbiddenClaims = [
  /\bproduction[- ]ready\b/i,
  /\brelease approved\b/i,
  /\bfully safe\b/i,
  /\bguaranteed compliant\b/i,
  /\bsecurity approved\b/i,
  /\blegal approved\b/i,
  /\bcompliance approved\b/i,
  /\bpayment approved\b/i,
  /\bcustomer accepted\b/i,
  /\breal[- ]project validated\b/i,
  /\bproduction[- ]proven\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# First Delivery Walkthrough Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }

  for (const dir of requiredDirectories) {
    if (exists(dir)) pass(`${dir} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkAdoptionTrialReports();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.7 release and example checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/first-delivery-walkthrough.md");
  if (!core) return;
  for (const marker of [
    "Human idea",
    "Lightweight Path",
    "Adoption Trial Report",
    "Forbidden Claims",
  ]) {
    if (core.includes(marker)) pass(`first delivery core includes ${marker}`);
    else fail(`first delivery core missing ${marker}`);
  }
}

function checkAdoptionTrialReports() {
  const files = markdownFiles("adoption-trial-reports");
  if (files.length === 0) {
    pass("first delivery check skipped: no adoption trial reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) {
      requireSection(content, section, label);
    }

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (!allowedOutcomes.has(outcome)) {
      fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
    } else {
      pass(`${label} has valid Outcome`);
    }

    requireArtifactReference(content, label, "Request", /requests\/[^)\s`|]+\.md/);
    requireArtifactReference(content, label, "Task", /tasks\/[^)\s`|]+\.md/);
    requireArtifactReference(content, label, "Launch Readiness", /launch-readiness\/[^)\s`|]+\.md/);
    requireArtifactReference(content, label, "Final Report", /final-reports\/[^)\s`|]+\.md/);
    requireHumanBoundary(content, label);
    requireSubagentClosure(content, label);

    if (outcome === "SIMULATED_READY_FOR_DEMO") {
      const verification = sectionBody(content, "Verification Evidence");
      if (!/\bsimulated\b/i.test(verification)) {
        fail(`${label} simulated outcome must label verification evidence as simulated`);
      } else {
        pass(`${label} labels simulated verification evidence`);
      }
      if (/\breal[- ]project\b/i.test(content) && !/\bnot real[- ]project\b/i.test(content)) {
        fail(`${label} simulated walkthrough must not claim real-project evidence`);
      }
    }

    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden walkthrough overclaim: ${pattern.source}`);
    }
  }
}

function checkSourceEvidence() {
  for (const file of [
    "releases/1.7.0/release-record.md",
    "releases/1.7.0/known-limitations.md",
    "releases/1.7.0/self-check-report.md",
    "examples/1.7-first-delivery-walkthrough/README.md",
    "examples/1.7-first-delivery-walkthrough/adoption-trial-reports/001-booking-app-simulation.md",
    "examples/1.7-first-delivery-walkthrough/launch-readiness/001-booking-app-demo.md",
    "examples/1.7-first-delivery-walkthrough/final-reports/001-booking-app.md",
  ]) {
    if (exists(file)) pass(`first delivery source evidence exists ${file}`);
    else fail(`first delivery source evidence missing ${file}`);
  }

  const example = runSelf(["examples/1.7-first-delivery-walkthrough"]);
  if (example.status === 0 && example.stdout.includes("First delivery walkthrough check passed")) {
    pass("first delivery walkthrough example passes checker");
  } else {
    fail(`first delivery walkthrough example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["missing final report", "test-fixtures/bad/bad-first-delivery-missing-final", "must reference Final Report"],
    ["missing launch readiness", "test-fixtures/bad/bad-first-delivery-missing-launch", "must reference Launch Readiness"],
    ["overclaim", "test-fixtures/bad/bad-first-delivery-overclaim", "forbidden walkthrough overclaim"],
  ]) {
    const result = runSelf([target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`first delivery rejects ${name}`);
    } else {
      fail(`first delivery must reject ${name}: ${output}`);
    }
  }
}

function requireArtifactReference(content, label, name, pattern) {
  if (pattern.test(content)) {
    pass(`${label} references ${name}`);
  } else {
    fail(`${label} must reference ${name}`);
  }
}

function requireHumanBoundary(content, label) {
  const body = sectionBody(content, "Human Decisions");
  if (!body || !/(Not Approved|Pending|Deferred|Approved)/i.test(body)) {
    fail(`${label} must record human decisions`);
    return;
  }
  if (!/(production|release|payment|privacy|security|risk|scope)/i.test(body + "\n" + content)) {
    fail(`${label} must include human-owned risk or release boundary`);
    return;
  }
  pass(`${label} records human decision boundary`);
}

function requireSubagentClosure(content, label) {
  const body = sectionBody(content, "Subagent Orchestration");
  if (!body) {
    fail(`${label} missing subagent orchestration boundary`);
    return;
  }
  if (/\bRUNNING\b/i.test(body)) {
    fail(`${label} must not leave subagents RUNNING`);
    return;
  }
  if (!/\b(NOT_USED|CLOSED|SKIPPED)\b/i.test(body)) {
    fail(`${label} must mark subagents NOT_USED, CLOSED, or SKIPPED`);
    return;
  }
  pass(`${label} closes or skips subagents`);
}

function markdownFiles(dir) {
  const resolved = resolveDirectory(dir);
  if (!resolved) return [];
  const files = [];
  walk(resolved, (file) => {
    if (file.endsWith(".md")) files.push(file);
  });
  return files.sort();
}

function walk(dir, visit) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else visit(full);
  }
}

function exists(relativePath) {
  return Boolean(resolveAsset(relativePath) || resolveDirectory(relativePath));
}

function resolveAsset(relativePath) {
  const candidates = assetCandidates(relativePath);
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

function resolveDirectory(relativePath) {
  const candidates = assetCandidates(relativePath);
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) || null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function assetCandidates(relativePath) {
  const normalized = relativePath.replace(/^\.\//, "");
  const candidates = [path.join(projectRoot, normalized)];
  if (!isSourceRepo && !normalized.startsWith(".ai-native/")) {
    candidates.push(path.join(projectRoot, ".ai-native", normalized));
  }
  return candidates;
}

function displayAsset(expected, resolved) {
  return rel(resolved) === expected ? expected : `${expected} (${rel(resolved)})`;
}

function requireSection(content, section, label) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "m");
  if (pattern.test(content)) pass(`${label} includes section ${section}`);
  else fail(`${label} missing section ${section}`);
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*\\n([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, "m");
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}

function codeOrTextValue(body) {
  const code = body.match(/`([^`]+)`/);
  if (code) return code[1].trim();
  return body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)[0] || "";
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/") || ".";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runSelf(extraArgs) {
  return spawnSync(process.execPath, [new URL(import.meta.url).pathname, ...extraArgs], {
    cwd: projectRoot,
    encoding: "utf8",
  });
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
      target: projectRoot,
      checks,
    }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "First delivery walkthrough check failed" : "First delivery walkthrough check passed");
  }
  process.exit(failed ? 1 : 0);
}
