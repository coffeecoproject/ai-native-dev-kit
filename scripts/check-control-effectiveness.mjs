#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { validateControlEffectivenessEvidence } from "./lib/control-effectiveness.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json", "allow-empty", "report", "require-report", "require-structured-evidence",
  "require-effective", "task-ref", "intent-digest", "required-claims",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = canonicalRoot(path.resolve(process.cwd(), args._[0] || "."));
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"] || args["require-effective"] || args["require-structured-evidence"]);
const requireEffective = Boolean(args["require-effective"]);
const explicitReport = args.report ? safeReport(String(args.report)) : "";
const requiredClaimIds = String(args["required-claims"] || "").split(",").map((item) => item.trim()).filter(Boolean);
const schema = loadSchema(projectRoot, "schemas/artifacts/control-effectiveness.schema.json");
const checks = [];
let failed = false;

if (unknown.length > 0) abort(`unknown option: --${unknown.join(", --")}`);
if (args.report && !explicitReport) abort("--report must be a project-relative control-effectiveness-reports/*.md path");
if (!outputJson) console.log("# Control Effectiveness Check\n");

checkAssets();
checkReports();
emit();

function checkAssets() {
  if (!isIntentOSProject()) return;
  for (const relative of [
    "core/control-effectiveness.md",
    "docs/control-effectiveness.md",
    "templates/control-effectiveness-report.md",
    "checklists/control-effectiveness-review.md",
    "prompts/control-effectiveness-agent.md",
    "schemas/artifacts/control-effectiveness.schema.json",
    "scripts/lib/control-effectiveness.mjs",
    "scripts/resolve-control-effectiveness.mjs",
    "scripts/check-control-effectiveness.mjs",
  ]) {
    if (resolveAsset(relative)) pass(`${relative} exists`);
    else fail(`missing ${relative}`);
  }
}

function checkReports() {
  const reports = explicitReport ? [explicitReport] : reportFiles();
  if (reports.length === 0) {
    if (requireReport) fail("no Control Effectiveness reports found");
    else if (allowEmpty) pass("Control Effectiveness skipped by explicit --allow-empty: no reports");
    else pass("SKIPPED_NO_REPORT: no Control Effectiveness reports found");
    return;
  }
  reports.forEach(checkReport);
}

function checkReport(file) {
  const label = path.relative(projectRoot, file).split(path.sep).join("/");
  if (!safeRegularFile(file)) {
    fail(`${label} must be a regular non-symlink file`);
    return;
  }
  const content = fs.readFileSync(file, "utf8");
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  else pass(`${label} contains no secret-like content`);
  for (const section of [
    "Human Summary", "Assessment Purpose", "Control Claims", "Scope And Exclusions",
    "Semantic And Failure Proof", "Evidence Identity And Freshness",
    "Dynamic Assessment Safety", "Dependent Consumers", "Limitations",
    "Boundaries", "Machine-Readable Evidence", "Outcome",
  ]) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  const checked = validateEvidenceBlock(content, schema, label, { require: true, digestField: "report_digest" });
  if (!checked.ok) {
    checked.errors.forEach(fail);
    return;
  }
  pass(`${label} has valid strict 1.110 structured evidence`);
  const semantic = validateControlEffectivenessEvidence(projectRoot, file, checked.value, {
    taskRef: args["task-ref"] ? String(args["task-ref"]) : "",
    intentDigest: args["intent-digest"] ? String(args["intent-digest"]) : "",
    requiredClaimIds: requiredClaimIds.length > 0 ? requiredClaimIds : checked.value.required_claim_ids,
  });
  if (semantic.ok) pass(`${label} binds current implementation, scope, semantics, evidence identity, failure capability, result integrity, and safety`);
  else semantic.errors.forEach((error) => fail(`${label}: ${error}`));
  if (requireEffective && checked.value.outcome !== "CONTROL_PROVEN_EFFECTIVE") fail(`${label} strict reliance requires CONTROL_PROVEN_EFFECTIVE`);
  else if (checked.value.outcome === "CONTROL_PROVEN_EFFECTIVE") pass(`${label} required claims are proven effective`);
  else pass(`${label} remains visibly non-effective and cannot satisfy strict reliance`);
}

function reportFiles() {
  const files = [];
  for (const dir of [path.join(projectRoot, "control-effectiveness-reports"), path.join(projectRoot, ".intentos", "control-effectiveness-reports")]) {
    if (!safeDirectory(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".md")) files.push(path.join(dir, entry.name));
    }
  }
  return files.sort();
}

function safeReport(value) {
  const normalized = value.replaceAll("\\", "/").replace(/^(?:artifact|file):/, "");
  if (!/^(?:\.intentos\/)?control-effectiveness-reports\/[a-zA-Z0-9._/-]+\.md$/.test(normalized) || normalized.split("/").includes("..")) return "";
  const file = path.resolve(projectRoot, normalized);
  return file.startsWith(`${projectRoot}${path.sep}`) ? file : "";
}

function isIntentOSProject() {
  return fs.existsSync(path.join(projectRoot, "intentos-manifest.json")) || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"));
}

function resolveAsset(relative) {
  for (const file of [path.join(projectRoot, relative), path.join(projectRoot, ".intentos", relative)]) {
    if (safeRegularFile(file)) return file;
  }
  return "";
}

function safeRegularFile(file) {
  try {
    const stat = fs.lstatSync(file);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function safeDirectory(dir) {
  try {
    const stat = fs.lstatSync(dir);
    return stat.isDirectory() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function canonicalRoot(root) {
  try {
    return fs.realpathSync(root);
  } catch {
    abort(`project root does not exist: ${root}`);
  }
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
  if (outputJson) process.stdout.write(`${JSON.stringify({ status: failed ? "FAIL" : "PASS", checks }, null, 2)}\n`);
  process.exit(failed ? 1 : 0);
}

function abort(message) {
  if (outputJson) process.stdout.write(`${JSON.stringify({ status: "FAIL", checks: [{ status: "FAIL", message }] }, null, 2)}\n`);
  else console.error(`FAIL ${message}`);
  process.exit(1);
}
