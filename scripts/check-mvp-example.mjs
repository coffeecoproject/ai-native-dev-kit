#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateSchema } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json"]));
const targetRoot = path.resolve(process.cwd(), args._[0] || "examples/mvp-booking-web-app");
const outputJson = Boolean(args.json);
const productEvidenceSchema = loadSchema(targetRoot, "schemas/artifacts/product-completeness-evidence.schema.json");
let failed = false;
const checks = [];

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!outputJson) {
  console.log("# MVP Example Check");
  console.log("");
}

for (const file of [
  "README.md",
  "package.json",
  "scripts/smoke-test.mjs",
  "evidence/smoke-output.txt",
  "evidence/smoke-output.json",
  "docs/product-brief.md",
]) exists(file) ? pass(`${file} exists`) : fail(`missing ${file}`);

const readme = read("README.md");
if (/Original user goal/i.test(readme) && /Run/i.test(readme) && /Verify/i.test(readme)) pass("README includes original goal, run, and verify instructions");
else fail("README must include original goal, run, and verify instructions");

const packageJson = readJson("package.json");
if (packageJson?.scripts?.test) pass("package.json includes test script");
else fail("package.json must include test script");
const requiredAppFiles = Array.isArray(packageJson?.intentosExample?.requiredFiles) && packageJson.intentosExample.requiredFiles.length > 0
  ? packageJson.intentosExample.requiredFiles
  : ["src/index.html", "src/styles.css", "src/app.js"];
for (const file of requiredAppFiles) {
  exists(file) ? pass(`${file} exists`) : fail(`missing ${file}`);
}

const firstSlicePath = firstMarkdownPath("ordinary-first-slices");
const completenessPath = firstMarkdownPath("product-completeness-reports");
const finalReportPath = firstMarkdownPath("final-reports");
firstSlicePath ? pass(`${firstSlicePath} exists`) : fail("ordinary-first-slices must include one markdown record");
completenessPath ? pass(`${completenessPath} exists`) : fail("product-completeness-reports must include one markdown record");
finalReportPath ? pass(`${finalReportPath} exists`) : fail("final-reports must include one markdown record");

const app = requiredAppFiles.map((file) => read(file)).join("\n");
const markers = Array.isArray(packageJson?.intentosExample?.markers) && packageJson.intentosExample.markers.length > 0
  ? packageJson.intentosExample.markers
  : ["booking", "name", "phone", "date", "time", "operator"];
for (const marker of markers) {
  app.toLowerCase().includes(marker) ? pass(`app includes ${marker}`) : fail(`app missing ${marker}`);
}

const firstSlice = firstSlicePath ? read(firstSlicePath) : "";
if (/This card writes target files:\s*No/i.test(firstSlice) && /Backlog \/ Later/.test(firstSlice)) pass("first-slice card keeps boundaries and backlog");
else fail("first-slice card must keep boundaries and backlog");

const completeness = completenessPath ? read(completenessPath) : "";
if (/RUNNABLE_MVP/.test(completeness) && /This report approves release or production:\s*No/i.test(completeness)) pass("product completeness report records local runnable MVP without release approval");
else fail("product completeness report must record local runnable MVP without release approval");

const finalReport = finalReportPath ? read(finalReportPath) : "";
if (/local demo/i.test(finalReport) && /production/i.test(finalReport) && /not approved|No/i.test(finalReport)) pass("final report keeps local demo boundary");
else fail("final report must keep local demo boundary");

if (packageJson?.scripts?.test) {
  const result = spawnSync("npm", ["test"], { cwd: targetRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 4 });
  if (result.status === 0) pass("MVP example test script passes");
  else fail(`MVP example test script failed: ${result.stderr || result.stdout}`);
}

const smokeEvidence = read("evidence/smoke-output.txt");
if (/\b(pass|passed|success|ok)\b/i.test(smokeEvidence) && !/\b(fail|failed|failure|exception)\b|error:/i.test(smokeEvidence)) pass("smoke output evidence records a passing local check");
else fail("smoke output evidence must record a passing local check");

checkStructuredSmokeEvidence();

emit();

function exists(file) {
  return fs.existsSync(path.join(targetRoot, file));
}

function read(file) {
  const full = path.join(targetRoot, file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function readJson(file) {
  try {
    const content = read(file);
    return content ? JSON.parse(content) : null;
  } catch {
    return null;
  }
}

function checkStructuredSmokeEvidence() {
  const label = "evidence/smoke-output.json";
  const content = read(label);
  if (!content) {
    fail("structured smoke evidence missing");
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    fail(`structured smoke evidence JSON invalid: ${error.message}`);
    return;
  }
  if (!productEvidenceSchema) {
    fail("product completeness evidence schema missing");
    return;
  }
  const validation = validateSchema(parsed, productEvidenceSchema, { label });
  if (!validation.ok) {
    validation.errors.forEach((error) => fail(error));
    return;
  }
  if (parsed.status === "pass") pass("structured smoke evidence records pass status");
  else fail("structured smoke evidence must record pass status");
  if (parsed.authority?.approves_release_or_production === false && parsed.authority?.proves_real_users_can_use_product === false) pass("structured smoke evidence remains non-authorizing");
  else fail("structured smoke evidence must remain non-authorizing");
}

function firstMarkdownPath(dir) {
  const full = path.join(targetRoot, dir);
  if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) return "";
  const found = fs.readdirSync(full).find((entry) => entry.endsWith(".md"));
  return found ? `${dir}/${found}` : "";
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
    console.log(failed ? "MVP Example check failed." : "MVP Example check passed.");
  }
  process.exit(failed ? 1 : 0);
}
