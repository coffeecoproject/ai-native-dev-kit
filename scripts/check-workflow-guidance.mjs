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
  "core/natural-language-orchestrator.md",
  "docs/natural-language-orchestrator.md",
  "templates/workflow-guidance-card.md",
  "templates/user-decision-card.md",
  "checklists/workflow-guidance-review.md",
  "prompts/workflow-concierge-agent.md",
  "scripts/resolve-workflow-guidance.mjs",
  "scripts/check-workflow-guidance.mjs",
];

const requiredDirectories = [
  "workflow-guidance-cards",
];

const reportSections = [
  "Human Decision Summary",
  "Plain Summary",
  "Project Reading",
  "Delivery Path State",
  "Recommended Next Step",
  "Distance To Useful Use",
  "Questions For Human",
  "Internal Routing",
  "Boundaries",
  "Outcome",
];

const allowedModes = new Set(["plain", "developer", "maintainer"]);
const allowedDeliveryStates = new Set([
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
]);
const allowedOutcomes = new Set(["GUIDANCE_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const plainForbidden = [
  /\bBL2\b/i,
  /\bindustrial overlay\b/i,
  /\bworkflow-map\b/i,
  /\bhook orchestration\b/i,
  /\bsource of truth\b/i,
  /\bdirty worktree\b/i,
  /\badapter\b/i,
];
const forbiddenClaims = [
  /\bwrites target files:\s*Yes\b/i,
  /\bmodifies CI:\s*Yes\b/i,
  /\binstalls hooks:\s*Yes\b/i,
  /\bdeletes or archives documents:\s*Yes\b/i,
  /\bchanges task state:\s*Yes\b/i,
  /\bapproves implementation:\s*Yes\b/i,
  /\bapproves release or production:\s*Yes\b/i,
  /\bproduction ready\b/i,
  /\bproduction approved\b/i,
  /\brelease approved\b/i,
  /\bsafe to launch\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Workflow Guidance Check");
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
checkGuidanceCards();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.24 workflow guidance evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/natural-language-orchestrator.md");
  if (!core) return;
  for (const marker of [
    "Natural Language Workflow Orchestrator",
    "Users should not need to choose commands",
    "Default output mode is `plain`",
    "Delivery Path State",
    "Codex may ask at most 3 questions by default",
    "A Workflow Guidance Card does not",
  ]) {
    if (core.includes(marker)) pass(`workflow guidance core includes ${marker}`);
    else fail(`workflow guidance core missing ${marker}`);
  }
}

function checkGuidanceCards() {
  const files = markdownFiles("workflow-guidance-cards");
  if (files.length === 0) {
    pass("workflow guidance check skipped: no Workflow Guidance Cards");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden workflow guidance claim: ${pattern.source}`);
    }

    const mode = strip(tableValue(content, "User mode"));
    if (allowedModes.has(mode)) pass(`${label} has valid user mode`);
    else fail(`${label} has invalid user mode: ${mode || "<empty>"}`);

    const state = codeOrTextValue(sectionBody(content, "Delivery Path State"));
    if (allowedDeliveryStates.has(state)) pass(`${label} has valid Delivery Path State`);
    else fail(`${label} has invalid Delivery Path State: ${state || "<empty>"}`);

    const questions = numberedItems(sectionBody(content, "Questions For Human"));
    const riskLevel = strip(tableValue(content, "Risk level")).toLowerCase();
    const maxQuestions = riskLevel === "high" || state === "BLOCKED_BY_RISK" ? 5 : 3;
    if (questions.length <= maxQuestions) pass(`${label} question count within limit`);
    else fail(`${label} asks too many questions: ${questions.length} > ${maxQuestions}`);

    if (mode === "plain") {
      const plainSurface = [
        sectionBody(content, "Plain Summary"),
        sectionBody(content, "Recommended Next Step"),
        sectionBody(content, "Questions For Human"),
      ].join("\n");
      for (const pattern of plainForbidden) {
        if (pattern.test(plainSurface)) fail(`${label} plain mode exposes internal jargon: ${pattern.source}`);
      }
      if (!plainForbidden.some((pattern) => pattern.test(plainSurface))) pass(`${label} plain mode avoids internal jargon`);
    }

    for (const boundary of [
      "This guidance writes target files",
      "This guidance modifies CI",
      "This guidance installs hooks",
      "This guidance deletes or archives documents",
      "This guidance changes task state",
      "This guidance approves implementation",
      "This guidance approves release or production",
      "This guidance approves security/privacy/compliance/payment/migration decisions",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }

    const distance = sectionBody(content, "Distance To Useful Use");
    for (const marker of ["Goal clarity", "Project can run locally", "Core function complete", "Tests or checks run", "High-risk scope clear", "Can someone else try it"]) {
      if (distance.includes(marker)) pass(`${label} distance includes ${marker}`);
      else fail(`${label} distance missing ${marker}`);
    }

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.24-natural-language-orchestrator/README.md",
    "examples/1.24-natural-language-orchestrator/workflow-guidance-cards/001-existing-project.md",
    "releases/1.24.0/release-record.md",
    "releases/1.24.0/known-limitations.md",
    "releases/1.24.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.24 workflow guidance source evidence exists ${file}`);
    else fail(`1.24 workflow guidance source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-workflow-guidance.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Workflow Guidance Card")
    && resolver.stdout.includes("This guidance writes target files: No")) {
    pass("1.24 workflow guidance resolver prints safe card");
  } else {
    fail(`1.24 workflow guidance resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "WORKFLOW_GUIDANCE_CARD"
        && parsed.boundaries?.writesTargetFiles === "No"
        && parsed.deliveryPathState?.current) {
        pass("1.24 workflow guidance resolver JSON includes boundaries and delivery state");
      } else {
        fail(`1.24 workflow guidance resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.24 workflow guidance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.24 workflow guidance resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const deepResolver = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--deep"]);
  if (deepResolver.status === 0
    && deepResolver.stdout.includes("Workflow Guidance Card")
    && (deepResolver.stdout.includes("What I Checked") || deepResolver.stdout.includes("Deep Orchestration"))
    && deepResolver.stdout.includes("This guidance writes target files: No")) {
    pass("1.30 deep workflow guidance resolver prints safe card");
  } else {
    fail(`1.30 deep workflow guidance resolver failed: ${deepResolver.stderr || deepResolver.stdout}`);
  }

  const deepResolverJson = runNode(["scripts/resolve-workflow-guidance.mjs", ".", "--deep", "--json"]);
  if (deepResolverJson.status === 0) {
    try {
      const parsed = JSON.parse(deepResolverJson.stdout);
      const selected = parsed.deepOrchestration?.selectedCapabilities || [];
      const summaries = parsed.deepOrchestration?.summaries || [];
      const allReadOnly = summaries.every((item) => item.readOnly === true);
      if (parsed.deepOrchestration?.enabled === true
        && selected.includes("review-surface")
        && selected.includes("delivery-path")
        && parsed.deepOrchestration?.boundaries?.writesTargetFiles === "No"
        && allReadOnly) {
        pass("1.30 deep workflow guidance resolver JSON includes selective read-only orchestration");
      } else {
        fail(`1.30 deep workflow guidance resolver JSON missing expected orchestration fields: ${deepResolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.30 deep workflow guidance resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.30 deep workflow guidance resolver JSON failed: ${deepResolverJson.stderr || deepResolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-workflow-guidance.mjs", "examples/1.24-natural-language-orchestrator"]);
  if (example.status === 0 && example.stdout.includes("Workflow guidance check passed")) {
    pass("1.24 workflow guidance example passes checker");
  } else {
    fail(`1.24 workflow guidance example failed: ${example.stderr || example.stdout}`);
  }

  const deepExample = runNode(["scripts/check-workflow-guidance.mjs", "examples/1.30-deep-guide-orchestration"]);
  if (deepExample.status === 0 && deepExample.stdout.includes("Workflow guidance check passed")) {
    pass("1.30 deep workflow guidance example passes checker");
  } else if (exists("examples/1.30-deep-guide-orchestration/README.md")) {
    fail(`1.30 deep workflow guidance example failed: ${deepExample.stderr || deepExample.stdout}`);
  } else {
    pass("1.30 deep workflow guidance example not present yet");
  }

  for (const [name, target, expected] of [
    ["too many questions", "test-fixtures/bad/bad-workflow-guidance-too-many-questions", "too many questions"],
    ["overclaim", "test-fixtures/bad/bad-workflow-guidance-overclaim", "forbidden workflow guidance claim"],
  ]) {
    const result = runNode(["scripts/check-workflow-guidance.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.24 workflow guidance rejects ${name}`);
    } else {
      fail(`1.24 workflow guidance must reject ${name}: ${output}`);
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
    console.log("Workflow guidance check passed.");
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
