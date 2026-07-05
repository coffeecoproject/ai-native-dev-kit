#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { escapeRegExp, sectionBody } from "./lib/markdown.mjs";
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
  "core/beginner-entry.md",
  "docs/beginner-entry.md",
  "templates/beginner-entry-card.md",
  "checklists/beginner-entry-review.md",
  "prompts/beginner-entry-agent.md",
  "scripts/resolve-beginner-entry.mjs",
  "scripts/check-beginner-entry.mjs",
];
const requiredDirectories = ["beginner-entry-cards"];
const reportSections = [
  "Human Decision Summary",
  "What I Understood",
  "Recommended Path",
  "What I Need From You",
  "What Codex Can Do Next",
  "What Codex Must Not Do Yet",
  "Routing Evidence",
  "Boundary",
  "Outcome",
];
const allowedOutcomes = new Set(["ENTRY_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const userSurfaceJargon = [
  /\bBL2\b/i,
  /\bworkflow-map\b/i,
  /\bbaseline-decision\b/i,
  /\bapply-plan\b/i,
  /\bhook orchestration\b/i,
  /\bsource of truth\b/i,
  /\bdirty worktree\b/i,
  /\badapter\b/i,
  /\bindustrial overlay\b/i,
];
const forbiddenClaims = [
  /\bThis entry writes target files:\s*Yes\b/i,
  /\bThis entry authorizes apply:\s*Yes\b/i,
  /\bThis entry approves implementation:\s*Yes\b/i,
  /\bThis entry approves release or production:\s*Yes\b/i,
  /\bThis entry modifies CI or hooks:\s*Yes\b/i,
  /\bThis entry deletes, archives, or rewrites documents:\s*Yes\b/i,
  /\bThis entry changes task state:\s*Yes\b/i,
  /\bThis entry enables baseline or industrial packs:\s*Yes\b/i,
  /\bThis entry approves high-risk decisions:\s*Yes\b/i,
  /\bproduction ready\b/i,
  /\brelease approved\b/i,
  /\bsafe to launch\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Beginner Entry Check");
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
checkBeginnerEntryCards();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.35 beginner entry evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/beginner-entry.md");
  if (!core) return;
  for (const marker of [
    "Beginner Entry Governance",
    "users who should not need to know IntentOS workflow commands",
    "Codex should not ask the user to choose between",
    "ask at most 3 human questions by default",
    "A Beginner Entry Card does not",
    "Unified Apply Plan",
  ]) {
    if (core.includes(marker)) pass(`beginner entry core includes ${marker}`);
    else fail(`beginner entry core missing ${marker}`);
  }
}

function checkBeginnerEntryCards() {
  const files = markdownFiles("beginner-entry-cards");
  if (files.length === 0) {
    pass("beginner entry check skipped: no Beginner Entry Cards");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden beginner entry claim: ${pattern.source}`);
    }

    const userSurface = [
      sectionBody(content, "Human Decision Summary"),
      sectionBody(content, "What I Understood"),
      sectionBody(content, "Recommended Path"),
      sectionBody(content, "What I Need From You"),
      sectionBody(content, "What Codex Can Do Next"),
      sectionBody(content, "What Codex Must Not Do Yet"),
    ].join("\n");
    const leaking = userSurfaceJargon.filter((pattern) => pattern.test(userSurface));
    if (leaking.length === 0) pass(`${label} user surface avoids internal workflow jargon`);
    else fail(`${label} user surface exposes internal workflow jargon: ${leaking.map((item) => item.source).join(", ")}`);

    const questions = numberedItems(sectionBody(content, "What I Need From You"));
    if (questions.length <= 3) pass(`${label} question count within beginner limit`);
    else fail(`${label} asks too many questions: ${questions.length} > 3`);

    for (const boundary of [
      "This entry writes target files",
      "This entry authorizes apply",
      "This entry approves implementation",
      "This entry approves release or production",
      "This entry modifies CI or hooks",
      "This entry deletes, archives, or rewrites documents",
      "This entry changes task state",
      "This entry enables baseline or industrial packs",
      "This entry approves high-risk decisions",
    ]) {
      requireBoundaryNo(content, label, boundary);
    }

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/beginner-entry-1.35-plan.md",
    "examples/1.35-beginner-entry/README.md",
    "examples/1.35-beginner-entry/beginner-entry-cards/001-appointment-app.md",
    "test-fixtures/bad/bad-beginner-entry-authorizes-write/beginner-entry-cards/001-bad.md",
    "test-fixtures/bad/bad-beginner-entry-jargon/beginner-entry-cards/001-bad.md",
    "test-fixtures/bad/bad-beginner-entry-too-many-questions/beginner-entry-cards/001-bad.md",
    "releases/1.35.0/release-record.md",
    "releases/1.35.0/known-limitations.md",
    "releases/1.35.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.35 beginner entry source evidence exists ${file}`);
    else fail(`1.35 beginner entry source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-beginner-entry.mjs", ".", "我要维护 IntentOS 自然语言入口"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Beginner Entry Card")
    && resolver.stdout.includes("This entry writes target files: No")) {
    pass("1.35 beginner entry resolver prints safe card");
  } else {
    fail(`1.35 beginner entry resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-beginner-entry.mjs", ".", "--goal", "我要维护 IntentOS 自然语言入口", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "BEGINNER_ENTRY_CARD"
        && parsed.boundary?.writesTargetFiles === "No"
        && parsed.routingEvidence?.technicalEvidenceAvailable === "yes") {
        pass("1.35 beginner entry resolver JSON includes boundaries and routing evidence");
      } else {
        fail(`1.35 beginner entry resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.35 beginner entry resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.35 beginner entry resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  pass("1.35 beginner entry checker is executing source repo checks");

  const example = runNode(["scripts/check-beginner-entry.mjs", "examples/1.35-beginner-entry"]);
  if (example.status === 0 && example.stdout.includes("Beginner Entry check passed")) {
    pass("1.35 beginner entry example passes checker");
  } else {
    fail(`1.35 beginner entry example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["authorizes write", "test-fixtures/bad/bad-beginner-entry-authorizes-write", "forbidden beginner entry claim"],
    ["jargon", "test-fixtures/bad/bad-beginner-entry-jargon", "internal workflow jargon"],
    ["too many questions", "test-fixtures/bad/bad-beginner-entry-too-many-questions", "too many questions"],
  ]) {
    const result = runNode(["scripts/check-beginner-entry.mjs", target]);
    const output = result.stdout + result.stderr;
    if (result.status !== 0 && output.includes(expected)) pass(`1.35 beginner entry rejects ${name}`);
    else fail(`1.35 beginner entry must reject ${name}: ${output}`);
  }
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Beginner Entry check failed." : "Beginner Entry check passed.");
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
  if (relativePath.startsWith("core/") || relativePath.startsWith("docs/") || relativePath.startsWith("templates/") || relativePath.startsWith("checklists/") || relativePath.startsWith("prompts/")) {
    const managed = path.join(projectRoot, ".intentos", relativePath);
    if (fs.existsSync(managed) && fs.statSync(managed).isFile()) return managed;
  }
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function displayAsset(relativePath, resolved) {
  return rel(resolved) === relativePath ? relativePath : `${relativePath} (${rel(resolved)})`;
}

function markdownFiles(relativeDir) {
  const dir = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(dir)) return [];
  const files = [];
  walk(dir, files);
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
  if (new RegExp(`^## ${escapeRegExp(section)}\\s*$`, "m").test(content)) pass(`${label} includes ${section}`);
  else fail(`${label} missing ${section}`);
}

function numberedItems(content) {
  return content.split(/\r?\n/).filter((line) => /^\s*\d+\.\s+\S/.test(line));
}

function requireBoundaryNo(content, label, boundary) {
  const regex = new RegExp(`${escapeRegExp(boundary)}:\\s*No\\b`, "i");
  if (regex.test(content)) pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} missing boundary ${boundary}: No`);
}

function codeOrTextValue(content) {
  const match = content.match(/`([^`]+)`/);
  if (match) return match[1].trim();
  return content.trim().split(/\s+/)[0] || "";
}

function runNode(childArgs) {
  return spawnSync(process.execPath, childArgs, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 24,
  });
}

function rel(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, "/");
}
