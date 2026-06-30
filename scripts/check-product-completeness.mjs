#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json")) && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"));
let failed = false;
const checks = [];

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!outputJson) {
  console.log("# Product Completeness Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of [
    "core/product-completeness-gate.md",
    "docs/product-completeness-gate.md",
    "templates/product-completeness-report.md",
    "checklists/product-completeness-gate-review.md",
    "prompts/product-completeness-agent.md",
    "scripts/resolve-product-completeness.mjs",
    "scripts/check-product-completeness.mjs",
  ]) exists(file) ? pass(`${file} exists`) : fail(`missing ${file}`);
  resolveDirectory("product-completeness-reports") ? pass("product-completeness-reports exists") : fail("missing product-completeness-reports");
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkReports();
if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.43 product completeness evidence checks skipped for target project");
emit();

function checkReports() {
  const files = markdownFiles("product-completeness-reports");
  if (files.length === 0) {
    pass("product completeness check skipped: no Product Completeness Reports");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of ["Human Summary", "Product State", "Product Completeness Checklist", "Trial / Run Evidence", "Gaps", "Next Actions", "Boundaries", "Outcome"]) requireSection(content, section, label);
    const state = tableValue(sectionBody(content, "Product State", { fallback: "" }), "State").replace(/`/g, "").trim();
    if (["IDEA_ONLY", "FIRST_SLICE_DEFINED", "RUNNABLE_MVP", "INTERNAL_TRIAL_READY", "RELEASE_REVIEW_NEEDED", "BLOCKED"].includes(state)) pass(`${label} has valid product state`);
    else fail(`${label} has invalid product state: ${state || "<empty>"}`);
    const checklist = sectionBody(content, "Product Completeness Checklist", { fallback: "" });
    for (const surface of ["Target user", "Core flow", "Screen/API/data surface", "Permission and risk boundary", "Empty and error states", "Local run or demo instructions", "Verification evidence", "Trial or handoff instructions", "Feedback or issue capture", "Next version backlog"]) {
      if (checklist.includes(surface)) pass(`${label} checklist includes ${surface}`);
      else fail(`${label} checklist missing ${surface}`);
    }
    for (const boundary of [
      "This report writes target files",
      "This report approves implementation",
      "This report approves release or production",
      "This report replaces Safe Launch",
      "This report proves real users can use the product",
    ]) requireBoundaryNo(content, label, boundary);
    const outcome = sectionBody(content, "Outcome", { fallback: "" }).replace(/`/g, "").trim().split(/\s+/)[0];
    if (outcome === "PRODUCT_COMPLETENESS_RECORDED") pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.43-product-completeness-gate/README.md",
    "examples/1.43-product-completeness-gate/product-completeness-reports/001-booking-mvp.md",
    "test-fixtures/bad/bad-product-completeness-release-overclaim/product-completeness-reports/001-bad.md",
    "test-fixtures/bad/bad-product-completeness-missing-run/product-completeness-reports/001-bad.md",
    "releases/1.43.0/release-record.md",
    "releases/1.43.0/known-limitations.md",
    "releases/1.43.0/self-check-report.md",
  ]) exists(file) ? pass(`1.43 product completeness source evidence exists ${file}`) : fail(`1.43 product completeness source evidence missing ${file}`);
  const example = runNode(["scripts/check-product-completeness.mjs", "examples/1.43-product-completeness-gate"]);
  if (example.status === 0 && example.stdout.includes("Product Completeness check passed")) pass("1.43 product completeness example passes checker");
  else fail(`1.43 product completeness example failed: ${example.stderr || example.stdout}`);
  const resolver = runNode(["scripts/resolve-product-completeness.mjs", "examples/1.43-product-completeness-gate"]);
  if (resolver.status === 0 && resolver.stdout.includes("Product Completeness Report") && resolver.stdout.includes("This report approves release or production: No")) pass("1.43 product completeness resolver prints safe report");
  else fail(`1.43 product completeness resolver failed: ${resolver.stderr || resolver.stdout}`);
  for (const [name, target, expected] of [
    ["release overclaim", "test-fixtures/bad/bad-product-completeness-release-overclaim", "boundary This report approves release or production must be No"],
    ["missing run surface", "test-fixtures/bad/bad-product-completeness-missing-run", "checklist missing Local run or demo instructions"],
  ]) {
    const bad = runNode(["scripts/check-product-completeness.mjs", target]);
    const output = `${bad.stdout}\n${bad.stderr}`;
    if (bad.status !== 0 && output.includes(expected)) pass(`1.43 product completeness rejects ${name}`);
    else fail(`1.43 product completeness must reject ${name}: ${output}`);
  }
}

function requireSection(content, section, label) {
  sectionBody(content, section, { fallback: null }) !== null ? pass(`${label} has ${section}`) : fail(`${label} missing ${section}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`-\\s*${escapeRegExp(boundary)}:\\s*No\\b`, "i");
  pattern.test(content) ? pass(`${label} boundary ${boundary}: No`) : fail(`${label} boundary ${boundary} must be No`);
}

function tableValue(body, key) {
  const row = String(body || "").split(/\n/).find((line) => line.toLowerCase().includes(`| ${key.toLowerCase()} |`));
  if (!row) return "";
  return row.split("|").map((item) => item.trim())[2] || "";
}

function markdownFiles(dir) {
  const base = resolveDirectory(dir);
  if (!base) return [];
  return walk(base).filter((file) => file.endsWith(".md"));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function resolveDirectory(dir) {
  for (const candidate of [path.join(projectRoot, dir), path.join(projectRoot, ".ai-native", dir)]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
  }
  return null;
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 8 });
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function rel(file) {
  return path.relative(projectRoot, file);
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
    console.log(failed ? "Product Completeness check failed." : "Product Completeness check passed.");
  }
  process.exit(failed ? 1 : 0);
}
