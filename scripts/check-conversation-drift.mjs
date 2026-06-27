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
  "core/conversation-drift-control.md",
  "templates/conversation-turn-classification.md",
  "templates/scope-change-report.md",
  "checklists/conversation-drift-review.md",
  "prompts/conversation-router-agent.md",
  "docs/conversation-drift-control.md",
  "scripts/check-conversation-drift.mjs",
];

const requiredDirectories = [
  "conversation-turns",
  "scope-change-reports",
];

const turnSections = [
  "Human Summary",
  "User Message",
  "Active Work",
  "Intent Classification",
  "Relation To Current Task",
  "Risk / Scope Impact",
  "Selected Action",
  "Can Continue Current Task?",
  "Required Human Decision",
  "Audit Notes",
];

const scopeChangeSections = [
  "Human Summary",
  "Old Scope",
  "New Request",
  "Scope Impact",
  "Risk Impact",
  "Recommendation",
  "Human Decision",
  "Applied Changes",
];

const allowedIntents = new Set([
  "DISCUSS_ONLY",
  "ANSWER_TO_PENDING_QUESTION",
  "CONTINUE_CURRENT_TASK",
  "SCOPE_CHANGE",
  "NEW_TASK",
  "DIRECT_FOLLOW_UP",
  "RISK_DECISION",
  "PAUSE_OR_STOP",
  "REVIEW_ONLY",
  "MEMORY_CANDIDATE",
  "OUT_OF_SCOPE_OBSERVATION",
]);

const stopIntents = new Set(["DISCUSS_ONLY", "REVIEW_ONLY", "PAUSE_OR_STOP", "DIRECT_FOLLOW_UP"]);
const decisionIntents = new Set(["SCOPE_CHANGE", "NEW_TASK", "RISK_DECISION"]);
const scopeRecommendations = new Set([
  "CONTINUE_AS_IS",
  "CREATE_NEW_TASK",
  "UPDATE_CURRENT_TASK_AFTER_APPROVAL",
  "STOP_FOR_DECISION",
  "REJECT_AS_OUT_OF_SCOPE",
]);
const scopeDecisions = new Set(["Pending", "Approved", "Rejected", "Needs Revision"]);

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Conversation Drift Check");
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
checkConversationTurns();
checkScopeChangeReports();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.6 release and example checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/conversation-drift-control.md");
  if (!core) return;
  for (const marker of [
    "Classify before acting",
    "DISCUSS_ONLY",
    "SCOPE_CHANGE",
    "RISK_DECISION",
    "Codex may continue the current task only when",
  ]) {
    if (core.includes(marker)) pass(`conversation drift core includes ${marker}`);
    else fail(`conversation drift core missing ${marker}`);
  }
}

function checkConversationTurns() {
  const files = markdownFiles("conversation-turns");
  if (files.length === 0) {
    pass("conversation drift turn check skipped: no conversation turn classifications");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of turnSections) {
      requireSection(content, section, label);
    }

    const intent = codeOrTextValue(sectionBody(content, "Intent Classification"));
    if (!allowedIntents.has(intent)) {
      fail(`${label} has invalid Intent Classification: ${intent || "<empty>"}`);
    } else {
      pass(`${label} has valid Intent Classification`);
    }

    const canContinue = codeOrTextValue(sectionBody(content, "Can Continue Current Task?"));
    if (!["Yes", "No"].includes(canContinue)) {
      fail(`${label} has invalid Can Continue Current Task?: ${canContinue || "<empty>"}`);
    } else {
      pass(`${label} has valid Can Continue Current Task?`);
    }

    const decision = codeOrTextValue(sectionBody(content, "Required Human Decision"));
    const selectedAction = sectionBody(content, "Selected Action") || "";

    if (stopIntents.has(intent) && canContinue !== "No") {
      fail(`${label} ${intent} must not continue current task`);
    }

    if (decisionIntents.has(intent) && (!decision || decision === "None")) {
      fail(`${label} ${intent} must require human decision`);
    }

    if (decisionIntents.has(intent) && canContinue !== "No") {
      fail(`${label} ${intent} must not continue current task without approval`);
    }

    if (intent === "RISK_DECISION" && /\b(auto|continue|approved|release approved|go live)\b/i.test(selectedAction)) {
      fail(`${label} RISK_DECISION must not auto-continue or approve release`);
    }
  }
}

function checkScopeChangeReports() {
  const files = markdownFiles("scope-change-reports");
  if (files.length === 0) {
    pass("scope change report check skipped: no scope change reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of scopeChangeSections) {
      requireSection(content, section, label);
    }

    const recommendation = codeOrTextValue(sectionBody(content, "Recommendation"));
    if (!scopeRecommendations.has(recommendation)) {
      fail(`${label} has invalid Recommendation: ${recommendation || "<empty>"}`);
    } else {
      pass(`${label} has valid Recommendation`);
    }

    const decision = codeOrTextValue(sectionBody(content, "Human Decision"));
    if (!scopeDecisions.has(decision)) {
      fail(`${label} has invalid Human Decision: ${decision || "<empty>"}`);
    } else {
      pass(`${label} has valid Human Decision`);
    }

    if (recommendation === "UPDATE_CURRENT_TASK_AFTER_APPROVAL" && decision !== "Approved") {
      fail(`${label} cannot update current task before approval`);
    }
  }
}

function checkSourceEvidence() {
  for (const file of [
    "releases/1.6.0/release-record.md",
    "releases/1.6.0/known-limitations.md",
    "releases/1.6.0/self-check-report.md",
    "examples/1.6-conversation-drift-control/README.md",
    "examples/1.6-conversation-drift-control/conversation-turns/001-discuss-only.md",
    "examples/1.6-conversation-drift-control/scope-change-reports/001-add-release-gate.md",
  ]) {
    if (exists(file)) pass(`conversation drift source evidence exists ${file}`);
    else fail(`conversation drift source evidence missing ${file}`);
  }

  const example = runSelf(["examples/1.6-conversation-drift-control"]);
  if (example.status === 0 && example.stdout.includes("Conversation drift check passed")) {
    pass("conversation drift example passes checker");
  } else {
    fail(`conversation drift example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["discussion-only writes", "test-fixtures/bad/bad-conversation-discuss-only-writes", "DISCUSS_ONLY must not continue current task"],
    ["scope creep", "test-fixtures/bad/bad-conversation-scope-creep", "SCOPE_CHANGE must require human decision"],
    ["risk auto continue", "test-fixtures/bad/bad-conversation-risk-auto-continue", "RISK_DECISION must require human decision"],
  ]) {
    const result = runSelf([target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`conversation drift rejects ${name}`);
    } else {
      fail(`conversation drift must reject ${name}: ${output}`);
    }
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  if (relativePath.startsWith("core/") || relativePath.startsWith("templates/") || relativePath.startsWith("checklists/") || relativePath.startsWith("prompts/") || relativePath.startsWith("docs/")) {
    const nested = path.join(projectRoot, ".ai-native", relativePath);
    if (fs.existsSync(nested)) return nested;
  }
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function markdownFiles(relativeDir) {
  const root = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(root)) return [];
  return walk(root).filter((file) => file.endsWith(".md")).sort();
}

function walk(root) {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function requireSection(content, heading, label) {
  if (sectionBody(content, heading) === null) fail(`${label} missing section: ${heading}`);
  else pass(`${label} has section: ${heading}`);
}

function sectionBody(content, heading) {
  const match = content.match(new RegExp(`^## ${escapeRegExp(heading)}\\s*$`, "m"));
  if (!match) return null;
  const start = match.index;
  const lineEnd = content.indexOf("\n", start);
  const bodyStart = lineEnd === -1 ? content.length : lineEnd + 1;
  const next = content.slice(bodyStart).search(/^## /m);
  const bodyEnd = next === -1 ? content.length : bodyStart + next;
  return content.slice(bodyStart, bodyEnd).trim();
}

function codeOrTextValue(body) {
  const text = String(body || "").trim();
  const code = text.match(/`([^`]+)`/);
  if (code) return code[1].trim();
  return text.split(/\s+/)[0] || "";
}

function displayAsset(file, resolved) {
  const relative = path.relative(projectRoot, resolved).replaceAll(path.sep, "/");
  return relative || file;
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/");
}

function runSelf(extraArgs) {
  return spawnSync(process.execPath, [new URL(import.meta.url).pathname, ...extraArgs], {
    cwd: projectRoot,
    encoding: "utf8",
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", checks }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Conversation drift check passed");
  }
  process.exit(failed ? 1 : 0);
}
