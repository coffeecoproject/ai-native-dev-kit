#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json")) && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const checks = [];
let failed = false;

const requiredAssets = [
  "core/ordinary-user-first-slice.md",
  "docs/ordinary-user-first-slice.md",
  "templates/ordinary-user-first-slice-card.md",
  "checklists/ordinary-user-first-slice-review.md",
  "prompts/ordinary-user-first-slice-agent.md",
  "scripts/resolve-first-slice.mjs",
  "scripts/check-first-slice.mjs",
];

if (!outputJson) {
  console.log("# Ordinary User First-Slice Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    if (exists(file)) pass(`${file} exists`);
    else fail(`missing ${file}`);
  }
  if (resolveDirectory("ordinary-first-slices")) pass("ordinary-first-slices exists");
  else fail("missing ordinary-first-slices");
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCards();
if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.42 first-slice evidence checks skipped for target project");
emit();

function checkCards() {
  const files = markdownFiles("ordinary-first-slices");
  if (files.length === 0) {
    pass("first-slice check skipped: no first-slice cards");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of [
      "Human Summary",
      "First Version Scope",
      "Questions For Human",
      "What Codex Can Do Next",
      "Backlog / Later",
      "Verification Plan",
      "Boundaries",
      "Outcome",
    ]) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);

    const userSurface = [
      sectionBody(content, "Human Summary", { fallback: "" }),
      sectionBody(content, "First Version Scope", { fallback: "" }),
      sectionBody(content, "Questions For Human", { fallback: "" }),
      sectionBody(content, "What Codex Can Do Next", { fallback: "" }),
      sectionBody(content, "Backlog / Later", { fallback: "" }),
    ].join("\n");
    const jargon = [/\bworkflow-map\b/i, /\bapply-plan\b/i, /\bBL2\b/i, /\bindustrial overlay\b/i, /\bdigest\b/i, /\bsource of truth\b/i]
      .filter((pattern) => pattern.test(userSurface));
    if (jargon.length === 0) pass(`${label} user surface avoids internal jargon`);
    else fail(`${label} user surface exposes internal jargon`);

    const questions = numberedItems(sectionBody(content, "Questions For Human", { fallback: "" }));
    if (questions.length > 0 && questions.length <= 3) pass(`${label} asks at most three questions`);
    else fail(`${label} must ask 1-3 questions`);

    const backlog = sectionBody(content, "Backlog / Later", { fallback: "" });
    if (backlog.includes("|") && /later|not needed|后续|暂不|Not needed/i.test(backlog)) pass(`${label} separates backlog from first version`);
    else fail(`${label} must separate backlog from first version`);

    const verification = sectionBody(content, "Verification Plan", { fallback: "" });
    if (/Core flow|核心|manual|command|smoke|验证|Evidence/i.test(verification)) pass(`${label} includes verification plan`);
    else fail(`${label} must include verification plan`);

    for (const boundary of [
      "This card writes target files",
      "This card approves implementation",
      "This card approves release or production",
      "This card changes CI or hooks",
      "This card touches payment, secrets, production, migration, or permissions",
      "This card enables BL2 or industrial packs",
    ]) requireBoundaryNo(content, label, boundary);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome", { fallback: "" }));
    if (["FIRST_SLICE_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"].includes(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/roadmaps/ordinary-user-product-loop-1.42-1.45.md",
    "examples/1.42-ordinary-user-first-slice/README.md",
    "examples/1.42-ordinary-user-first-slice/ordinary-first-slices/001-booking-app.md",
    "test-fixtures/bad/bad-first-slice-authorizes-write/ordinary-first-slices/001-bad.md",
    "test-fixtures/bad/bad-first-slice-jargon/ordinary-first-slices/001-bad.md",
    "test-fixtures/bad/bad-first-slice-too-many-questions/ordinary-first-slices/001-bad.md",
    "releases/1.42.0/release-record.md",
    "releases/1.42.0/known-limitations.md",
    "releases/1.42.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.42 first-slice source evidence exists ${file}`);
    else fail(`1.42 first-slice source evidence missing ${file}`);
  }
  const result = runNode(["scripts/resolve-first-slice.mjs", ".", "我想做一个预约 App"]);
  if (result.status === 0 && result.stdout.includes("Ordinary User First-Slice Card") && result.stdout.includes("This card writes target files: No")) {
    pass("1.42 first-slice resolver prints safe owner card");
  } else {
    fail(`1.42 first-slice resolver failed: ${result.stderr || result.stdout}`);
  }
  const example = runNode(["scripts/check-first-slice.mjs", "examples/1.42-ordinary-user-first-slice"]);
  if (example.status === 0 && example.stdout.includes("Ordinary User First-Slice check passed")) pass("1.42 first-slice example passes checker");
  else fail(`1.42 first-slice example failed: ${example.stderr || example.stdout}`);
  for (const [name, target, expected] of [
    ["authorizes write", "test-fixtures/bad/bad-first-slice-authorizes-write", "boundary This card writes target files must be No"],
    ["jargon", "test-fixtures/bad/bad-first-slice-jargon", "internal jargon"],
    ["too many questions", "test-fixtures/bad/bad-first-slice-too-many-questions", "must ask 1-3 questions"],
  ]) {
    const bad = runNode(["scripts/check-first-slice.mjs", target]);
    const output = `${bad.stdout}\n${bad.stderr}`;
    if (bad.status !== 0 && output.includes(expected)) pass(`1.42 first-slice rejects ${name}`);
    else fail(`1.42 first-slice must reject ${name}: ${output}`);
  }
}

function requireSection(content, section, label) {
  if (sectionBody(content, section, { fallback: null }) !== null) pass(`${label} has ${section}`);
  else fail(`${label} missing ${section}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`-\\s*${escapeRegExp(boundary)}:\\s*No\\b`, "i");
  if (pattern.test(content)) pass(`${label} boundary ${boundary}: No`);
  else fail(`${label} boundary ${boundary} must be No`);
}

function numberedItems(body) {
  return String(body || "").split(/\n/).filter((line) => /^\s*\d+\.\s+/.test(line));
}

function codeOrTextValue(value) {
  return String(value || "").replace(/`/g, "").trim().split(/\s+/)[0] || "";
}

function markdownFiles(dir) {
  const base = resolveDirectory(dir);
  if (!base) return [];
  return walk(base).filter((file) => file.endsWith(".md"));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function resolveDirectory(dir) {
  for (const candidate of [path.join(projectRoot, dir), path.join(projectRoot, ".intentos", dir)]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
  }
  return null;
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function rel(file) {
  return path.relative(projectRoot, file);
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 8 });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function emit() {
  if (outputJson) console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  else {
    console.log("");
    console.log(failed ? "Ordinary User First-Slice check failed." : "Ordinary User First-Slice check passed.");
  }
  process.exit(failed ? 1 : 0);
}
