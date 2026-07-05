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
  "core/guided-closure-experience.md",
  "docs/guided-closure-experience.md",
  "templates/guided-closure-card.md",
  "checklists/guided-closure-review.md",
  "prompts/guided-closure-agent.md",
  "scripts/resolve-guided-closure.mjs",
  "scripts/check-guided-closure.mjs",
];
const requiredDirectories = ["guided-closure-cards"];
const reportSections = [
  "Human Decision Summary",
  "Plain Close-Out Status",
  "What I Checked",
  "What Is Still Needed",
  "What Codex Can Do Next",
  "What Needs Human Decision",
  "Technical Details",
  "Boundaries",
  "Outcome",
];
const allowedStates = new Set([
  "NO_TASK_TO_CLOSE",
  "NEEDS_VERIFICATION",
  "NEEDS_IMPACT_COVERAGE",
  "NEEDS_HUMAN_DECISION",
  "READY_FOR_REVIEW",
  "CLOSE_WITH_LIMITATIONS",
  "BLOCKED",
]);
const allowedOutcomes = new Set(["CLOSURE_GUIDANCE_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const userSurfaceJargon = [
  /--require-precise-evidence/i,
  /--resolve-evidence-refs/i,
  /--strict-evidence/i,
  /check-change-impact-coverage/i,
  /check-execution-closure/i,
  /\bartifact:/i,
  /\bhuman-decision:/i,
  /Machine-Readable Evidence/i,
];
const forbiddenClaims = [
  /\bThis card writes target files:\s*Yes\b/i,
  /\bThis card authorizes apply:\s*Yes\b/i,
  /\bThis card approves implementation:\s*Yes\b/i,
  /\bThis card approves commit or push:\s*Yes\b/i,
  /\bThis card approves release or production:\s*Yes\b/i,
  /\bThis card modifies CI or hooks:\s*Yes\b/i,
  /\bThis card changes task state:\s*Yes\b/i,
  /\bThis card forgives debt:\s*Yes\b/i,
  /\bThis card replaces Review Loop:\s*Yes\b/i,
  /\bThis card replaces Safe Launch:\s*Yes\b/i,
  /\bThis card approves security\/privacy\/compliance\/payment\/migration decisions:\s*Yes\b/i,
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
  console.log("# Guided Closure Check");
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
checkGuidedClosureCards();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.52 guided closure evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/guided-closure-experience.md");
  if (!core) return;
  for (const marker of [
    "Guided Closure Experience",
    "Users should not need to choose",
    "Guided Closure Card",
    "NO_TASK_TO_CLOSE",
    "NEEDS_IMPACT_COVERAGE",
    "A Guided Closure Card does not",
  ]) {
    if (core.includes(marker)) pass(`guided closure core includes ${marker}`);
    else fail(`guided closure core missing ${marker}`);
  }
}

function checkGuidedClosureCards() {
  const files = markdownFiles("guided-closure-cards");
  if (files.length === 0) {
    pass("guided closure check skipped: no Guided Closure Cards");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden guided closure claim: ${pattern.source}`);
    }

    const state = codeOrTextValue(sectionBody(content, "Plain Close-Out Status"));
    if (allowedStates.has(state)) pass(`${label} has valid closure state`);
    else fail(`${label} has invalid closure state: ${state || "<empty>"}`);

    const userSurface = [
      sectionBody(content, "Human Decision Summary"),
      sectionBody(content, "Plain Close-Out Status"),
      sectionBody(content, "What I Checked"),
      sectionBody(content, "What Is Still Needed"),
      sectionBody(content, "What Codex Can Do Next"),
      sectionBody(content, "What Needs Human Decision"),
    ].join("\n");
    const leaking = userSurfaceJargon.filter((pattern) => pattern.test(userSurface));
    if (leaking.length === 0) pass(`${label} user surface avoids internal close-out command burden`);
    else fail(`${label} user surface exposes internal close-out command burden: ${leaking.map((item) => item.source).join(", ")}`);

    const decisions = numberedItems(sectionBody(content, "What Needs Human Decision"));
    const highRisk = /high-risk|payment|permission|migration|production|security|privacy|compliance/i.test(userSurface);
    const maxDecisions = highRisk ? 5 : 3;
    if (decisions.length <= maxDecisions) pass(`${label} human decision count within limit`);
    else fail(`${label} asks too many human decisions: ${decisions.length} > ${maxDecisions}`);

    for (const boundary of [
      "This card writes target files",
      "This card authorizes apply",
      "This card approves implementation",
      "This card approves commit or push",
      "This card approves release or production",
      "This card modifies CI or hooks",
      "This card changes task state",
      "This card forgives debt",
      "This card replaces Review Loop",
      "This card replaces Safe Launch",
      "This card approves security/privacy/compliance/payment/migration decisions",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }

    const checked = sectionBody(content, "What I Checked");
    for (const marker of ["Task intent", "Changed files", "Verification", "Related surfaces", "Evidence freshness"]) {
      if (checked.includes(marker)) pass(`${label} checked area includes ${marker}`);
      else fail(`${label} missing checked area ${marker}`);
    }

    const technical = sectionBody(content, "Technical Details");
    for (const marker of ["Intent", "Changed files detected", "Impact coverage reports found", "Execution closure reports found", "Verification provided", "Internal checks selected"]) {
      if (technical.includes(marker)) pass(`${label} technical details include ${marker}`);
      else fail(`${label} technical details missing ${marker}`);
    }

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/guided-closure-experience-1.52-plan.md",
    "examples/1.52-guided-closure-experience/README.md",
    "examples/1.52-guided-closure-experience/guided-closure-cards/001-booking-validation.md",
    "test-fixtures/bad/bad-guided-closure-technical-burden/guided-closure-cards/001-bad.md",
    "test-fixtures/bad/bad-guided-closure-overclaim/guided-closure-cards/001-bad.md",
    "releases/1.52.0/release-record.md",
    "releases/1.52.0/known-limitations.md",
    "releases/1.52.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.52 guided closure source evidence exists ${file}`);
    else fail(`1.52 guided closure source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-guided-closure.mjs", ".", "--intent", "maintain IntentOS close-out experience", "--verification", "npm run verify passed"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Guided Closure Card")
    && resolver.stdout.includes("This card writes target files: No")) {
    pass("1.52 guided closure resolver prints safe card");
  } else {
    fail(`1.52 guided closure resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-guided-closure.mjs", ".", "--intent", "maintain IntentOS close-out experience", "--verification", "npm run verify passed", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "GUIDED_CLOSURE_CARD"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.plainCloseOutStatus?.closureState) {
        pass("1.52 guided closure resolver JSON includes boundaries and state");
      } else {
        fail(`1.52 guided closure resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.52 guided closure resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.52 guided closure resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  pass("1.52 guided closure checker is executing source repo checks");

  const example = runNode(["scripts/check-guided-closure.mjs", "examples/1.52-guided-closure-experience"]);
  if (example.status === 0 && example.stdout.includes("Guided Closure check passed")) {
    pass("1.52 guided closure example passes checker");
  } else {
    fail(`1.52 guided closure example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["technical burden", "test-fixtures/bad/bad-guided-closure-technical-burden", "internal close-out command burden"],
    ["overclaim", "test-fixtures/bad/bad-guided-closure-overclaim", "forbidden guided closure claim"],
  ]) {
    const result = runNode(["scripts/check-guided-closure.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.52 guided closure rejects ${name}`);
    else fail(`1.52 guided closure must reject ${name}: ${output}`);
  }
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Guided Closure check failed." : "Guided Closure check passed.");
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
  const intentOS = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(intentOS) && fs.statSync(intentOS).isFile()) return intentOS;
  const intentOSWithoutCore = path.join(projectRoot, ".intentos", relativePath.replace(/^core\//, "core/"));
  if (fs.existsSync(intentOSWithoutCore) && fs.statSync(intentOSWithoutCore).isFile()) return intentOSWithoutCore;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const intentOS = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(intentOS) && fs.statSync(intentOS).isDirectory()) return intentOS;
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
  const dirs = [path.join(projectRoot, relativeDir), path.join(projectRoot, ".intentos", relativeDir)]
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

function numberedItems(body) {
  return String(body || "").split("\n").filter((line) => /^\s*\d+\.\s+/.test(line));
}

function codeOrTextValue(body) {
  const text = String(body || "");
  const code = text.match(/`([A-Z0-9_]+)`/);
  if (code) return code[1];
  const row = text.split("\n").find((line) => /\|\s*Closure state\s*\|/i.test(line));
  if (row) {
    const cells = row.split("|").slice(1, -1).map((item) => item.trim().replace(/`/g, ""));
    return cells[1] || "";
  }
  return text.trim().replace(/`/g, "");
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
