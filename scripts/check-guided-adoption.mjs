#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["file", "json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const explicitFile = args.file ? path.resolve(process.cwd(), String(args.file)) : null;
const outputJson = Boolean(args.json);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredHeadings = [
  "# Guided Adoption Recommendation",
  "## Human Summary",
  "## Project Classification",
  "## Recommended Adoption Path",
  "## Why This Path",
  "## Decisions Needed From Human",
  "## Safe Next Actions",
  "## Actions AI Must Not Take Yet",
  "## Generated Plan / Report Refs",
  "## Technical Evidence",
  "## Final Recommendation",
];

const allowedProjectTypes = new Set([
  "NEW_PROJECT",
  "EXISTING_LIGHT_PROJECT",
  "GOVERNED_EXISTING_PROJECT",
  "PRODUCTION_SENSITIVE_PROJECT",
  "DIRTY_WORKTREE_PROJECT",
  "ALREADY_BOOTSTRAPPED_PROJECT",
  "UNKNOWN_NEEDS_DISCUSSION",
  "INTENTOS_REPOSITORY",
]);

const results = [];
let failed = false;

function pass(message) {
  results.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  results.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

const files = explicitFile ? [explicitFile] : adoptionRecommendationFiles(projectRoot);
if (files.length === 0) {
  pass("no adoption recommendation reports found");
  emitAndExit();
}

for (const file of files) validateReport(file);
emitAndExit();

function adoptionRecommendationFiles(root) {
  const dir = path.join(root, "adoption-recommendations");
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs.readdirSync(dir)
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.join(dir, entry))
    .sort();
}

function validateReport(file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    fail(`missing adoption recommendation report: ${rel(file)}`);
    return;
  }
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);

  for (const heading of requiredHeadings) {
    if (content.includes(heading)) pass(`${label} includes ${heading}`);
    else fail(`${label} missing ${heading}`);
  }

  const type = tableValue(content, "Project type");
  if (type && allowedProjectTypes.has(type)) {
    pass(`${label} project type ${type}`);
  } else {
    fail(`${label} has invalid or missing project type: ${type || "missing"}`);
  }

  const canWrite = tableValue(content, "Can AI write now");
  if (canWrite === "No") {
    pass(`${label} keeps start read-only`);
  } else {
    fail(`${label} must include 'Can AI write now | No'`);
  }

  if (/start is read-only by default/i.test(content)) {
    pass(`${label} states start is read-only by default`);
  } else {
    fail(`${label} must state that start is read-only by default`);
  }

  if (/target files written by start\s*\|\s*No/i.test(content)) {
    pass(`${label} records no target writes by start`);
  } else {
    fail(`${label} must record that start wrote no target files`);
  }

  if (/## Decisions Needed From Human[\s\S]*-\s+\S/.test(content)) {
    pass(`${label} lists human decisions`);
  } else {
    fail(`${label} must list at least one human decision`);
  }

  if (/Do not install all industrial packs by default|Do not default-enable all industrial packs/i.test(content)) {
    pass(`${label} prevents default industrial-pack expansion`);
  } else {
    fail(`${label} must prevent default industrial-pack expansion`);
  }

  if (/\bBL2\b|industrial pack/i.test(content)) {
    if (/explicit human confirmation|human confirmation/i.test(content)) {
      pass(`${label} gates BL2 or industrial packs behind human confirmation`);
    } else {
      fail(`${label} mentions BL2 or industrial packs without explicit human confirmation`);
    }
  }

  if (type && ["GOVERNED_EXISTING_PROJECT", "PRODUCTION_SENSITIVE_PROJECT", "DIRTY_WORKTREE_PROJECT"].includes(type)) {
    if (/read-only-first|read-only adoption|assessment first|write plan/i.test(content)) {
      pass(`${label} uses guarded adoption for ${type}`);
    } else {
      fail(`${label} must use read-only or plan-first adoption for ${type}`);
    }
    if (/direct init|direct update/i.test(content) && /Do not run direct init or direct update/i.test(content)) {
      pass(`${label} blocks direct setup for ${type}`);
    } else {
      fail(`${label} must block direct setup for ${type}`);
    }
  }
}

function tableValue(content, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i"));
  return match ? match[1].trim() : null;
}

function rel(file) {
  return path.relative(process.cwd(), file) || ".";
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      status: failed ? "FAIL" : "PASS",
      checkedFiles: files.map((file) => rel(file)),
      results,
    }, null, 2));
  }
  if (failed) process.exit(1);
  if (!outputJson) {
    console.log("");
    console.log("Guided adoption recommendation checks passed.");
  }
}
