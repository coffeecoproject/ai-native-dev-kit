#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { readReleaseApprovalRecord } from "./lib/release-trust.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence", "require-approved"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"] || args["require-structured-evidence"] || args["require-approved"]);
const requireApproved = Boolean(args["require-approved"]);
const explicitReport = args.report ? safeReportPath(String(args.report)) : "";
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));
let failures = 0;
const checks = [];

if (unknown.length > 0) fail(`unknown option: --${unknown.join(", --")}`);
if (!outputJson) console.log("# Release Approval Record Check\n");

if (shouldRequireAssets) {
  for (const file of [
    "core/release-approval-record.md",
    "docs/release-approval-record.md",
    "templates/release-approval-record.md",
    "schemas/artifacts/release-approval-record.schema.json",
    "scripts/lib/release-trust.mjs",
    "scripts/check-release-approval-record.mjs",
  ]) {
    if (resolveAsset(file)) pass(`${file} exists`);
    else fail(`missing ${file}`);
  }
  if (resolveDirectory("release-approval-records")) pass("release-approval-records exists");
  else fail("missing release-approval-records");
}

const reports = explicitReport ? [explicitReport] : markdownFiles(path.join(projectRoot, "release-approval-records"));
if (reports.length === 0) {
  if (requireReport && !allowEmpty) fail("release approval record is required but no report exists");
  else pass("release approval record check skipped: no reports");
} else {
  for (const report of reports) checkReport(report);
}

if (outputJson) console.log(JSON.stringify({ status: failures ? "FAIL" : "PASS", checks }, null, 2));
if (failures > 0) {
  if (!outputJson) console.error(`Release Approval Record check failed with ${failures} issue(s).`);
  process.exit(1);
}
if (!outputJson) console.log("Release Approval Record check passed.");

function checkReport(file) {
  const relative = path.relative(projectRoot, file).replaceAll(path.sep, "/");
  const result = readReleaseApprovalRecord(projectRoot, `artifact:${relative}`, { requireApproved });
  if (!result.ok) {
    for (const error of result.errors) fail(`${relative}: ${error}`);
    return;
  }
  pass(`${relative} matches current project, revision, candidate, and trust sources`);
  if (requireApproved) runUpstreamChecks(relative, result);
}

function runUpstreamChecks(label, result) {
  const sources = result.resolvedSources;
  runAuthorityChecker(label, "Release Evidence Gate", "check-release-evidence-gate.mjs", sources.releaseEvidence, [
    "--require-report", "--require-structured-evidence", "--require-ready", "--strict-source-binding",
    ...(result.evidence.trust_sources?.platform_recipe?.required === "Yes" ? ["--require-platform-recipe"] : []),
  ]);
  runAuthorityChecker(label, "Runtime Hygiene", "check-runtime-hygiene.mjs", sources.runtimeHygiene, [
    "--require-report", "--require-structured-evidence", "--require-runtime-sources",
  ]);
  runAuthorityChecker(label, "Release Channel Policy", "check-release-channel-policy.mjs", sources.releaseChannel, [
    "--require-report", "--require-structured-evidence", "--strict-source-binding",
  ]);
  if (sources.platformRecipe) runAuthorityChecker(label, "Platform Release Recipe", "check-platform-release-recipe.mjs", sources.platformRecipe, ["--require-report", "--strict"]);
  if (sources.releaseHandoff) runAuthorityChecker(label, "Release Handoff Pack", "check-release-handoff-pack.mjs", sources.releaseHandoff, ["--require-report", "--require-structured-evidence"]);
}

function runAuthorityChecker(label, authority, script, source, extra) {
  if (!source?.relativePath) {
    fail(`${label}: ${authority} source is missing`);
    return;
  }
  const result = spawnSync(process.execPath, [
    path.join(scriptDir, script),
    projectRoot,
    "--report",
    source.relativePath,
    ...extra,
  ], { encoding: "utf8" });
  if (result.status === 0) pass(`${label} ${authority} strict checker passed`);
  else fail(`${label}: ${authority} strict checker failed: ${firstUsefulLine(result.stderr || result.stdout)}`);
}

function safeReportPath(value) {
  const full = path.resolve(projectRoot, value);
  const relative = path.relative(projectRoot, full);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !/\.md$/i.test(full)) {
    console.error("FAIL --report must be a project-relative Markdown file");
    process.exit(1);
  }
  return full;
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs.readdirSync(dir)
    .filter((name) => name.endsWith(".md") && !name.startsWith("."))
    .map((name) => path.join(dir, name))
    .filter((file) => fs.statSync(file).isFile())
    .sort();
}

function resolveAsset(relative) {
  for (const candidate of [path.join(projectRoot, relative), path.join(projectRoot, ".intentos", relative)]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return "";
}

function resolveDirectory(relative) {
  for (const candidate of [path.join(projectRoot, relative), path.join(projectRoot, ".intentos", relative)]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
  }
  return "";
}

function firstUsefulLine(value) {
  return String(value || "").split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "unknown failure";
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failures += 1;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}
