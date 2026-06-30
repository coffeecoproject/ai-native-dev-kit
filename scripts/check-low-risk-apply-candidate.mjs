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
  console.log("# Low-Risk Controlled Apply Candidate Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of [
    "core/low-risk-controlled-apply-candidate.md",
    "docs/low-risk-controlled-apply-candidate.md",
    "templates/low-risk-controlled-apply-candidate.md",
    "checklists/low-risk-controlled-apply-candidate-review.md",
    "prompts/low-risk-controlled-apply-candidate-agent.md",
    "scripts/resolve-low-risk-apply-candidate.mjs",
    "scripts/check-low-risk-apply-candidate.mjs",
  ]) exists(file) ? pass(`${file} exists`) : fail(`missing ${file}`);
  resolveDirectory("controlled-apply-candidates") ? pass("controlled-apply-candidates exists") : fail("missing controlled-apply-candidates");
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkReports();
if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.45 apply candidate evidence checks skipped for target project");
emit();

function checkReports() {
  const files = markdownFiles("controlled-apply-candidates");
  if (files.length === 0) {
    pass("low-risk apply candidate check skipped: no candidate records");
    return;
  }
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of ["Human Summary", "Candidate Scope", "Required Evidence", "Allowed Actions", "Forbidden Actions", "Verification And Rollback", "Boundaries", "Outcome"]) {
      requireSection(content, section, label);
    }
    const scope = sectionBody(content, "Candidate Scope", { fallback: "" });
    const paths = extractCodeValues(tableValue(scope, "Exact target paths"));
    if (paths.length > 0) pass(`${label} lists exact target paths`);
    else fail(`${label} must list exact target paths`);
    for (const candidatePath of paths) {
      isSafeTargetPath(candidatePath) ? pass(`${label} target path ${candidatePath} is bounded`) : fail(`${label} has unsafe target path: ${candidatePath}`);
    }
    const all = content.toLowerCase();
    if (/(payment|支付|billing|auth|login|权限|permission|secret|token|production|deploy|release|migration|database|schema|privacy|security|legal|ci|hook|线上|生产|迁移)/i.test(all)) {
      const boundaries = sectionBody(content, "Boundaries", { fallback: "" });
      if (/touches payment, secrets, production, migration, data, or permissions:\s*No/i.test(boundaries) && /changes CI or hooks:\s*No/i.test(boundaries)) {
        pass(`${label} mentions risk only inside no-authority boundaries`);
      } else {
        fail(`${label} mentions high-risk surface without explicit no-authority boundary`);
      }
    } else {
      pass(`${label} avoids high-risk surfaces`);
    }
    for (const boundary of [
      "This candidate writes files now",
      "This candidate authorizes apply",
      "This candidate approves implementation",
      "This candidate approves release or production",
      "This candidate changes CI or hooks",
      "This candidate touches payment, secrets, production, migration, data, or permissions",
    ]) requireBoundaryNo(content, label, boundary);
    const verification = sectionBody(content, "Verification And Rollback", { fallback: "" });
    if (/Verification:/i.test(verification) && /Rollback:/i.test(verification)) pass(`${label} includes verification and rollback`);
    else fail(`${label} must include verification and rollback`);
    const outcome = sectionBody(content, "Outcome", { fallback: "" }).replace(/`/g, "").trim().split(/\s+/)[0];
    if (["LOW_RISK_APPLY_CANDIDATE_RECORDED", "NOT_READY", "BLOCKED"].includes(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.45-low-risk-apply-candidate/README.md",
    "examples/1.45-low-risk-apply-candidate/controlled-apply-candidates/001-booking-demo.md",
    "test-fixtures/bad/bad-apply-candidate-authorizes-run/controlled-apply-candidates/001-bad.md",
    "test-fixtures/bad/bad-apply-candidate-broad-path/controlled-apply-candidates/001-bad.md",
    "test-fixtures/bad/bad-apply-candidate-high-risk/controlled-apply-candidates/001-bad.md",
    "releases/1.45.0/release-record.md",
    "releases/1.45.0/known-limitations.md",
    "releases/1.45.0/self-check-report.md",
  ]) exists(file) ? pass(`1.45 apply candidate source evidence exists ${file}`) : fail(`1.45 apply candidate source evidence missing ${file}`);
  const resolver = runNode(["scripts/resolve-low-risk-apply-candidate.mjs", ".", "--intent", "update local booking demo copy", "--path", "examples/mvp-booking-web-app/src/app.js"]);
  if (resolver.status === 0 && resolver.stdout.includes("Low-Risk Controlled Apply Candidate") && resolver.stdout.includes("This candidate authorizes apply: No")) pass("1.45 apply candidate resolver prints safe candidate");
  else fail(`1.45 apply candidate resolver failed: ${resolver.stderr || resolver.stdout}`);
  const example = runNode(["scripts/check-low-risk-apply-candidate.mjs", "examples/1.45-low-risk-apply-candidate"]);
  if (example.status === 0 && example.stdout.includes("Low-Risk Controlled Apply Candidate check passed")) pass("1.45 apply candidate example passes checker");
  else fail(`1.45 apply candidate example failed: ${example.stderr || example.stdout}`);
  for (const [name, target, expected] of [
    ["authorizes run", "test-fixtures/bad/bad-apply-candidate-authorizes-run", "boundary This candidate authorizes apply must be No"],
    ["broad path", "test-fixtures/bad/bad-apply-candidate-broad-path", "unsafe target path"],
    ["high risk", "test-fixtures/bad/bad-apply-candidate-high-risk", "mentions high-risk surface without explicit no-authority boundary"],
  ]) {
    const bad = runNode(["scripts/check-low-risk-apply-candidate.mjs", target]);
    const output = `${bad.stdout}\n${bad.stderr}`;
    if (bad.status !== 0 && output.includes(expected)) pass(`1.45 apply candidate rejects ${name}`);
    else fail(`1.45 apply candidate must reject ${name}: ${output}`);
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

function extractCodeValues(value) {
  const matches = [...String(value || "").matchAll(/`([^`]+)`/g)].map((match) => match[1].trim()).filter(Boolean);
  if (matches.length > 0) return matches;
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function isSafeTargetPath(value) {
  return Boolean(value) && value !== "/" && !value.startsWith("/") && !value.startsWith("~") && !value.includes("..") && !value.includes("*") && !value.includes("\\");
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
    console.log(failed ? "Low-Risk Controlled Apply Candidate check failed." : "Low-Risk Controlled Apply Candidate check passed.");
  }
  process.exit(failed ? 1 : 0);
}
