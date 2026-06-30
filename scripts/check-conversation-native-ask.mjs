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
  "core/conversation-native-ask.md",
  "docs/conversation-native-ask.md",
  "templates/conversation-ask-card.md",
  "checklists/conversation-native-ask-review.md",
  "prompts/conversation-native-ask-agent.md",
  "scripts/check-conversation-native-ask.mjs",
];
const requiredDirectories = ["conversation-ask-cards"];
const reportSections = [
  "Human Decision Summary",
  "User Goal",
  "Trigger Classification",
  "What I Understood",
  "Recommended Path",
  "What I Need From You",
  "What Codex Can Do Next",
  "What Codex Must Not Do Yet",
  "Internal Routing",
  "Boundary",
  "Outcome",
];
const allowedOutcomes = new Set(["ENTRY_ROUTED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const forbiddenClaims = [
  /\bCan Codex change files now:\s*Yes\b/i,
  /\bThis conversation ask writes target files:\s*Yes\b/i,
  /\bThis conversation ask authorizes apply:\s*Yes\b/i,
  /\bThis conversation ask approves implementation:\s*Yes\b/i,
  /\bThis conversation ask approves release or production:\s*Yes\b/i,
  /\bThis conversation ask modifies CI or hooks:\s*Yes\b/i,
  /\bThis conversation ask deletes, archives, or rewrites documents:\s*Yes\b/i,
  /\bThis conversation ask changes task state:\s*Yes\b/i,
  /\bThis conversation ask enables baseline or industrial packs:\s*Yes\b/i,
  /\bThis conversation ask approves high-risk decisions:\s*Yes\b/i,
  /\bproduction ready\b/i,
  /\brelease approved\b/i,
  /\bsafe to launch\b/i,
];
const cliBurdenPatterns = [
  /\bThis conversation ask requires the user to run CLI commands first:\s*Yes\b/i,
  /must run\s+`?node scripts\/cli\.mjs/i,
  /需要先运行\s+`?node scripts\/cli\.mjs/i,
  /必须先运行\s+`?node scripts\/cli\.mjs/i,
  /用户必须.*node scripts\/cli\.mjs/i,
];
const internalJargon = [
  /\bworkflow-map\b/i,
  /\bbaseline-decision\b/i,
  /\bapply-plan\b/i,
  /\bclosure\b/i,
  /\bBL2\b/i,
  /\bhook policy\b/i,
  /\bsource of truth\b/i,
  /\bdirty worktree\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Conversation-Native Ask Check");
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
checkConversationAskCards();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.37 conversation-native ask evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/conversation-native-ask.md");
  if (!core) return;
  for (const marker of [
    "Conversation-Native Ask Governance",
    "default conversational behavior",
    "Codex should not require the user to first run",
    "does not replace Beginner Entry",
    "A Conversation Ask Card does not",
    "Unified Apply Plan",
  ]) {
    if (core.includes(marker)) pass(`conversation-native ask core includes ${marker}`);
    else fail(`conversation-native ask core missing ${marker}`);
  }
}

function checkConversationAskCards() {
  const files = markdownFiles("conversation-ask-cards");
  if (files.length === 0) {
    pass("conversation-native ask check skipped: no Conversation Ask Cards");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);

    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden conversation ask claim: ${pattern.source}`);
    }
    for (const pattern of cliBurdenPatterns) {
      if (pattern.test(content)) fail(`${label} requires CLI command burden from the user: ${pattern.source}`);
    }

    const userSurface = [
      sectionBody(content, "Human Decision Summary"),
      sectionBody(content, "User Goal"),
      sectionBody(content, "What I Understood"),
      sectionBody(content, "Recommended Path"),
      sectionBody(content, "What I Need From You"),
      sectionBody(content, "What Codex Can Do Next"),
      sectionBody(content, "What Codex Must Not Do Yet"),
    ].join("\n");
    const leaking = internalJargon.filter((pattern) => pattern.test(userSurface));
    if (leaking.length === 0) pass(`${label} user surface avoids internal command burden`);
    else fail(`${label} user surface exposes internal command burden: ${leaking.map((item) => item.source).join(", ")}`);

    const questions = numberedItems(sectionBody(content, "What I Need From You"));
    if (questions.length <= 3) pass(`${label} question count within conversation-native ask limit`);
    else fail(`${label} asks too many questions: ${questions.length} > 3`);

    for (const boundary of [
      "This conversation ask writes target files",
      "This conversation ask authorizes apply",
      "This conversation ask approves implementation",
      "This conversation ask approves release or production",
      "This conversation ask modifies CI or hooks",
      "This conversation ask deletes, archives, or rewrites documents",
      "This conversation ask changes task state",
      "This conversation ask enables baseline or industrial packs",
      "This conversation ask approves high-risk decisions",
      "This conversation ask requires the user to run CLI commands first",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }

    const trigger = sectionBody(content, "Trigger Classification");
    if (/Trigger:\s*CONVERSATION_NATIVE_ASK\b/.test(trigger)) pass(`${label} has conversation-native trigger`);
    else fail(`${label} missing CONVERSATION_NATIVE_ASK trigger`);

    const routing = sectionBody(content, "Internal Routing");
    if (/Beginner Entry equivalent\s*\|\s*yes/i.test(routing)) pass(`${label} routes through Beginner Entry equivalent`);
    else fail(`${label} missing Beginner Entry equivalent routing`);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/conversation-native-ask-1.37-plan.md",
    "examples/1.37-conversation-native-ask/README.md",
    "examples/1.37-conversation-native-ask/conversation-ask-cards/001-appointment-app.md",
    "test-fixtures/bad/bad-conversation-ask-authorizes-write/conversation-ask-cards/001-bad.md",
    "test-fixtures/bad/bad-conversation-ask-cli-burden/conversation-ask-cards/001-bad.md",
    "test-fixtures/bad/bad-conversation-ask-too-many-questions/conversation-ask-cards/001-bad.md",
    "releases/1.37.0/release-record.md",
    "releases/1.37.0/known-limitations.md",
    "releases/1.37.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.37 conversation-native ask source evidence exists ${file}`);
    else fail(`1.37 conversation-native ask source evidence missing ${file}`);
  }

  const example = runNode(["scripts/check-conversation-native-ask.mjs", "examples/1.37-conversation-native-ask"]);
  if (example.status === 0 && example.stdout.includes("Conversation-Native Ask check passed")) {
    pass("1.37 conversation-native ask example passes checker");
  } else {
    fail(`1.37 conversation-native ask example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["authorizes write", "test-fixtures/bad/bad-conversation-ask-authorizes-write", "forbidden conversation ask claim"],
    ["CLI burden", "test-fixtures/bad/bad-conversation-ask-cli-burden", "requires CLI command burden"],
    ["too many questions", "test-fixtures/bad/bad-conversation-ask-too-many-questions", "too many questions"],
  ]) {
    const result = runNode(["scripts/check-conversation-native-ask.mjs", target]);
    const output = result.stdout + result.stderr;
    if (result.status !== 0 && output.includes(expected)) pass(`1.37 conversation-native ask rejects ${name}`);
    else fail(`1.37 conversation-native ask must reject ${name}: ${output}`);
  }
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Conversation-Native Ask check failed." : "Conversation-Native Ask check passed.");
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

function readResolved(relativePath) {
  const sourcePath = path.join(projectRoot, relativePath);
  if (fs.existsSync(sourcePath)) return fs.readFileSync(sourcePath, "utf8");
  const targetPath = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(targetPath)) return fs.readFileSync(targetPath, "utf8");
  return "";
}

function resolveAsset(relativePath) {
  const sourcePath = path.join(projectRoot, relativePath);
  if (fs.existsSync(sourcePath)) return sourcePath;
  const targetPath = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(targetPath)) return targetPath;
  return "";
}

function resolveDirectory(relativePath) {
  const sourcePath = path.join(projectRoot, relativePath);
  if (fs.existsSync(sourcePath) && fs.statSync(sourcePath).isDirectory()) return sourcePath;
  const targetPath = path.join(projectRoot, relativePath);
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) return targetPath;
  return "";
}

function displayAsset(requested, resolved) {
  if (rel(resolved) === requested) return requested;
  return `${requested} (${rel(resolved)})`;
}

function markdownFiles(relativeDir) {
  const dirs = [
    path.join(projectRoot, relativeDir),
    path.join(projectRoot, ".ai-native", relativeDir),
  ];
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    walk(dir, files);
  }
  return files.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function requireSection(content, section, label) {
  const body = sectionBody(content, section);
  if (body.trim()) pass(`${label} includes ${section}`);
  else fail(`${label} missing ${section}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`-\\s*${escapeRegExp(boundary)}:\\s*No\\b`, "i");
  if (pattern.test(content)) pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} missing boundary ${boundary}: No`);
}

function numberedItems(text) {
  return String(text || "")
    .split(/\r?\n/)
    .filter((line) => /^\s*\d+\.\s+\S/.test(line));
}

function codeOrTextValue(text) {
  const trimmed = String(text || "").trim();
  const code = trimmed.match(/`([^`]+)`/);
  return code ? code[1].trim() : trimmed.split(/\r?\n/)[0]?.trim();
}

function rel(file) {
  return path.relative(projectRoot, file).replace(/\\/g, "/");
}

function runNode(commandArgs) {
  return spawnSync(process.execPath, commandArgs, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 24,
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
