#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
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
  "core/unified-closure-model.md",
  "docs/unified-closure-model.md",
  "templates/closure-decision.md",
  "checklists/closure-decision-review.md",
  "prompts/closure-decision-agent.md",
  "scripts/resolve-closure-decision.mjs",
  "scripts/check-closure-decision.mjs",
];
const requiredDirectories = ["closure-decisions"];
const sections = [
  "Human Summary",
  "Closure Decision",
  "Decision Inputs",
  "Single Source Rule",
  "Required Next Action",
  "Evidence Map",
  "Boundaries",
  "Outcome",
];
const allowedDecisions = new Set([
  "DONE",
  "NOT_DONE",
  "NEEDS_EVIDENCE",
  "NEEDS_IMPACT_COVERAGE",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);
const allowedOutcomes = new Set(["CLOSURE_DECISION_RECORDED"]);
const forbiddenClaims = [
  /\bThis decision writes target files:\s*Yes\b/i,
  /\bThis decision authorizes apply:\s*Yes\b/i,
  /\bThis decision approves implementation:\s*Yes\b/i,
  /\bThis decision approves commit or push:\s*Yes\b/i,
  /\bThis decision approves release or production:\s*Yes\b/i,
  /\bThis decision modifies CI or hooks:\s*Yes\b/i,
  /\bThis decision changes task state:\s*Yes\b/i,
  /\bThis decision replaces Review Loop:\s*Yes\b/i,
  /\bThis decision replaces Safe Launch:\s*Yes\b/i,
  /\bThis decision approves security\/privacy\/compliance\/payment\/migration decisions:\s*Yes\b/i,
  /\bcommit approved\b/i,
  /\bpush approved\b/i,
  /\brelease approved\b/i,
  /\bproduction ready\b/i,
  /\bsafe to launch\b/i,
  /\bimplementation approved\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Unified Closure Decision Check");
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
checkClosureDecisions();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.53 unified closure evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/unified-closure-model.md");
  if (!core) return;
  for (const marker of [
    "Unified Closure Model",
    "single final close-out decision",
    "Single Source Rule",
    "DONE",
    "NEEDS_IMPACT_COVERAGE",
    "These artifacts are inputs",
  ]) {
    if (core.includes(marker)) pass(`unified closure core includes ${marker}`);
    else fail(`unified closure core missing ${marker}`);
  }
}

function checkClosureDecisions() {
  const files = markdownFiles("closure-decisions");
  if (files.length === 0) {
    pass("unified closure decision check skipped: no Closure Decision records");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of sections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden unified closure claim: ${pattern.source}`);
    }

    const decision = tableValue(content, "Decision");
    if (allowedDecisions.has(decision)) pass(`${label} has valid closure decision`);
    else fail(`${label} has invalid closure decision: ${decision || "<empty>"}`);

    const finalSource = tableValue(content, "Final closure source");
    if (finalSource === "UNIFIED_CLOSURE_DECISION") pass(`${label} declares unified final closure source`);
    else fail(`${label} must declare UNIFIED_CLOSURE_DECISION as final closure source`);

    const singleSource = sectionBody(content, "Single Source Rule") || "";
    if (/single closure source for this task:\s*Yes/i.test(singleSource)) pass(`${label} confirms single closure source`);
    else fail(`${label} must confirm single closure source`);
    if (/stricter result:\s*Yes|stricter result.*Yes/i.test(singleSource)) pass(`${label} confirms stricter result wins`);
    else fail(`${label} must confirm stricter result wins`);

    if (decision === "DONE") requireDoneEvidence(content, label);

    for (const boundary of [
      "This decision writes target files",
      "This decision authorizes apply",
      "This decision approves implementation",
      "This decision approves commit or push",
      "This decision approves release or production",
      "This decision modifies CI or hooks",
      "This decision changes task state",
      "This decision replaces Review Loop",
      "This decision replaces Safe Launch",
      "This decision approves security/privacy/compliance/payment/migration decisions",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function requireDoneEvidence(content, label) {
  const evidence = sectionBody(content, "Evidence Map") || "";
  for (const marker of [
    "Verification | `PASS`",
    "Execution closure | `PASS`",
  ]) {
    if (evidence.includes(marker)) pass(`${label} DONE evidence includes ${marker}`);
    else fail(`${label} cannot be DONE without ${marker}`);
  }
  const impactRow = tableRow(evidence, "Impact coverage");
  if (/\|\s*`(PASS|N\/A)`\s*\|/i.test(impactRow)) pass(`${label} DONE impact coverage is PASS or N/A`);
  else fail(`${label} cannot be DONE with missing impact coverage`);
  const humanRow = tableRow(evidence, "Human decision");
  if (/\|\s*`(PASS|N\/A)`\s*\|/i.test(humanRow)) pass(`${label} DONE human decision is PASS or N/A`);
  else fail(`${label} cannot be DONE with missing human decision`);
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/unified-closure-model-1.53-plan.md",
    "examples/1.53-unified-closure-model/README.md",
    "examples/1.53-unified-closure-model/closure-decisions/001-booking-validation.md",
    "test-fixtures/bad/bad-closure-decision-done-without-evidence/closure-decisions/001-bad.md",
    "test-fixtures/bad/bad-closure-decision-split-truth/closure-decisions/001-bad.md",
    "releases/1.53.0/release-record.md",
    "releases/1.53.0/known-limitations.md",
    "releases/1.53.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.53 unified closure source evidence exists ${file}`);
    else fail(`1.53 unified closure source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure model", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Unified Closure Decision")
    && resolver.stdout.includes("This decision writes target files: No")) {
    pass("1.53 unified closure resolver prints safe decision");
  } else {
    fail(`1.53 unified closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-closure-decision.mjs", ".", "--intent", "maintain IntentOS closure model", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "UNIFIED_CLOSURE_DECISION"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.closureDecision?.finalClosureSource === "UNIFIED_CLOSURE_DECISION") {
        pass("1.53 unified closure resolver JSON includes single source decision and boundaries");
      } else {
        fail(`1.53 unified closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.53 unified closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.53 unified closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-closure-decision.mjs", "examples/1.53-unified-closure-model"]);
  if (example.status === 0 && example.stdout.includes("Unified Closure Decision check passed")) {
    pass("1.53 unified closure example passes checker");
  } else {
    fail(`1.53 unified closure example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["done without evidence", "test-fixtures/bad/bad-closure-decision-done-without-evidence", "cannot be DONE without"],
    ["split truth", "test-fixtures/bad/bad-closure-decision-split-truth", "must confirm single closure source"],
  ]) {
    const result = runNode(["scripts/check-closure-decision.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.53 unified closure rejects ${name}`);
    else fail(`1.53 unified closure must reject ${name}: ${output}`);
  }
}

function emitAndExit() {
  if (outputJson) console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  else {
    console.log("");
    console.log(failed ? "Unified Closure Decision check failed." : "Unified Closure Decision check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.log(`FAIL ${message}`);
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(aiNative) && fs.statSync(aiNative).isFile()) return aiNative;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(aiNative) && fs.statSync(aiNative).isDirectory()) return aiNative;
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function displayAsset(relativePath, resolved) {
  const normalized = rel(resolved);
  return normalized === relativePath ? relativePath : `${relativePath} (${normalized})`;
}

function markdownFiles(relativeDir) {
  const dirs = [path.join(projectRoot, relativeDir), path.join(projectRoot, ".ai-native", relativeDir)]
    .filter((dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory());
  const files = [];
  for (const dir of dirs) walk(dir, files);
  return files.filter((file) => file.endsWith(".md"));
}

function walk(current, files) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function requireSection(content, heading, label) {
  if (sectionBody(content, heading) !== null) pass(`${label} includes section ${heading}`);
  else fail(`${label} missing section ${heading}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`${escapeRegExp(boundary)}:\\s*No`, "i");
  if (pattern.test(content)) pass(`${label} boundary is No: ${boundary}`);
  else fail(`${label} boundary must be No: ${boundary}`);
}

function tableValue(content, label) {
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(label)}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i");
  const match = content.match(pattern);
  return match ? match[1].trim().replace(/`/g, "") : "";
}

function tableRow(content, label) {
  return String(content || "").split("\n").find((line) => line.includes(`| ${label} |`)) || "";
}

function codeOrTextValue(body) {
  const text = String(body || "");
  const code = text.match(/`([A-Z0-9_]+)`/);
  return code ? code[1] : text.trim().replace(/`/g, "");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runNode(commandArgs) {
  return spawnSync(process.execPath, commandArgs, {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

function rel(filePath) {
  return path.relative(projectRoot, filePath) || ".";
}
