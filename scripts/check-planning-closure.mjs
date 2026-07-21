#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { deriveConsumerOutcome } from "./lib/check-result.mjs";
import { validatePlanningClosureEvidence } from "./lib/planning-closure.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence", "require-ready", "task-ref", "intent-digest", "post-write-consumer"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = canonicalRoot(path.resolve(process.cwd(), args._[0] || "."));
const outputJson = Boolean(args.json);
const strict = Boolean(args["require-report"] || args["require-structured-evidence"] || args["require-ready"] || args.report);
const allowEmpty = Boolean(args["allow-empty"]);
const explicitReport = args.report ? safeReport(String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/planning-closure.schema.json");
const checks = [];
let failed = false;
let reportCount = 0;
let readyCount = 0;

if (unknown.length > 0) abort(`unknown option: --${unknown.join(", --")}`);
if (args.report && !explicitReport) abort("--report must be a project-relative planning-closure-reports/*.md path");
if (allowEmpty && strict) abort("--allow-empty cannot be combined with strict Planning Closure flags");
if (!outputJson) console.log("# Planning Closure Check\n");

checkAssets();
checkReports();
emit();

function checkAssets() {
  if (!isIntentOSProject()) return;
  for (const relative of [
    "core/understanding-planning-closure.md",
    "docs/understanding-planning-closure.md",
    "templates/planning-closure-report.md",
    "checklists/planning-closure-review.md",
    "prompts/planning-closure-agent.md",
    "schemas/artifacts/planning-closure.schema.json",
    "scripts/lib/planning-closure.mjs",
    "scripts/resolve-planning-closure.mjs",
    "scripts/check-planning-closure.mjs",
    "scripts/check-execution-entry-contract.mjs",
  ]) {
    if (resolveAsset(relative)) pass(`${relative} exists`);
    else fail(`missing ${relative}`);
  }
}

function checkReports() {
  const reports = explicitReport ? [explicitReport] : reportFiles();
  reportCount = reports.length;
  if (reports.length === 0) {
    if (strict) fail("no Planning Closure reports found");
    else if (allowEmpty) pass("Planning Closure skipped by explicit --allow-empty: no reports");
    else pass("SKIPPED_NO_REPORT: no Planning Closure reports found");
    return;
  }
  reports.forEach(checkReport);
}

function checkReport(file) {
  const label = rel(file);
  if (!safeRegularFile(file)) return fail(`${label} must be a regular non-symlink file`);
  const content = fs.readFileSync(file, "utf8");
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  else pass(`${label} contains no secret-like content`);
  for (const section of ["Plain Summary", "Current Task", "Required Planning Sources", "First Blocker And Next Step", "Execution Entry Contract", "Boundaries", "Machine-Readable Evidence", "Outcome"]) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }
  const checked = validateEvidenceBlock(content, schema, label, { require: true, digestField: "report_digest" });
  if (!checked.ok) return checked.errors.forEach(fail);
  pass(`${label} has valid strict 1.111 structured evidence`);
  const semantic = validatePlanningClosureEvidence(projectRoot, file, checked.value, {
    allowRevisionAdvance: Boolean(args["post-write-consumer"]),
  });
  if (semantic.ok) pass(`${label} binds current project, task, intent, source reports, and non-authorizing contract semantics`);
  else semantic.errors.forEach((error) => fail(`${label}: ${error}`));
  if (args["task-ref"] && checked.value.task_ref !== String(args["task-ref"])) fail(`${label} does not match --task-ref`);
  else if (args["task-ref"]) pass(`${label} matches --task-ref`);
  if (args["intent-digest"] && checked.value.intent_digest !== String(args["intent-digest"])) fail(`${label} does not match --intent-digest`);
  else if (args["intent-digest"]) pass(`${label} matches --intent-digest`);
  if (args["require-ready"] && checked.value.outcome !== "PLANNING_READY") fail(`${label} strict readiness requires PLANNING_READY`);
  else if (checked.value.outcome === "PLANNING_READY") {
    readyCount += 1;
    pass(`${label} planning is ready with a non-authorizing contract`);
  }
  else pass(`${label} remains visibly ${checked.value.outcome} and emits no contract`);
  if (checked.value.technical_decision_required_from_user === "No") pass(`${label} keeps technical decisions inside IntentOS/Codex`);
  else fail(`${label} delegates a technical decision to the user`);
}

function reportFiles() {
  const files = [];
  for (const dir of [path.join(projectRoot, "planning-closure-reports"), path.join(projectRoot, ".intentos", "planning-closure-reports")]) {
    if (!safeDirectory(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) if (entry.isFile() && entry.name.endsWith(".md")) files.push(path.join(dir, entry.name));
  }
  return files.sort();
}

function safeReport(value) {
  const normalized = String(value).replace(/^(?:artifact|file):/, "").replaceAll("\\", "/");
  if (!/^(?:\.intentos\/)?planning-closure-reports\/[a-zA-Z0-9._/-]+\.md$/.test(normalized) || normalized.split("/").includes("..")) return "";
  const file = path.resolve(projectRoot, normalized);
  return file.startsWith(`${projectRoot}${path.sep}`) ? file : "";
}

function isIntentOSProject() {
  return fs.existsSync(path.join(projectRoot, "intentos-manifest.json")) || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"));
}

function resolveAsset(relative) {
  for (const file of [path.join(projectRoot, relative), path.join(projectRoot, ".intentos", relative)]) if (safeRegularFile(file)) return file;
  return "";
}

function safeRegularFile(file) { try { const stat = fs.lstatSync(file); return stat.isFile() && !stat.isSymbolicLink(); } catch { return false; } }
function safeDirectory(dir) { try { const stat = fs.lstatSync(dir); return stat.isDirectory() && !stat.isSymbolicLink(); } catch { return false; } }
function canonicalRoot(root) { try { return fs.realpathSync(root); } catch { abort(`project root does not exist: ${root}`); } }
function rel(file) { return path.relative(projectRoot, file).split(path.sep).join("/"); }
function pass(message) { checks.push({ status: "PASS", message }); if (!outputJson) console.log(`PASS ${message}`); }
function fail(message) { failed = true; checks.push({ status: "FAIL", message }); if (!outputJson) console.log(`FAIL ${message}`); }
function emit() {
  const consumerOutcome = deriveConsumerOutcome({
    hasArtifact: reportCount > 0,
    invalid: failed,
    blocked: reportCount > 0 && readyCount !== reportCount,
    ready: !failed && reportCount > 0 && readyCount === reportCount,
  });
  if (outputJson) process.stdout.write(`${JSON.stringify({ status: failed ? "FAIL" : "PASS", consumerOutcome, checks }, null, 2)}\n`);
  process.exit(failed ? 1 : 0);
}
function abort(message) { if (outputJson) process.stdout.write(`${JSON.stringify({ status: "FAIL", checks: [{ status: "FAIL", message }] }, null, 2)}\n`); else console.error(`FAIL ${message}`); process.exit(1); }
