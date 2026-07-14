#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, validateSchema } from "./lib/artifact-schema.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath, resolveUnderRoot } from "./lib/path-safety.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "report", "require-report"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const reportRef = String(args.report || "calibration-reports/project-entry-adoption-1.109.json");
const schemaRef = "schemas/artifacts/project-entry-calibration.schema.json";
const requiredConditions = new Set([
  "ABSENT_TARGET",
  "LIGHT_EXISTING",
  "STRONG_GOVERNED",
  "CURRENT_WORK_PRESENT",
]);
const forbiddenProjectFacts = [
  /\/Users\//,
  /\/private\//,
  /WorkControl/i,
  /AiCoffeeCo/i,
  /攀岩/,
];
const checks = [];
let failed = false;

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!isSafeRelativePath(reportRef) || !/^calibration-reports\/[a-zA-Z0-9._-]+\.json$/.test(reportRef)) {
  console.error("FAIL --report must be a safe project-relative JSON path under calibration-reports/");
  process.exit(1);
}

const reportFile = resolveUnderRoot(projectRoot, reportRef, "Project Entry calibration report");
const schemaFile = resolveUnderRoot(projectRoot, schemaRef, "Project Entry calibration schema");

try {
  assertNoSymlinkInPath(projectRoot, reportFile, "Project Entry calibration report");
  assertNoSymlinkInPath(projectRoot, schemaFile, "Project Entry calibration schema");
} catch (error) {
  fail(error.message);
}

if (!outputJson) console.log("# Project Entry Calibration Check\n");

if (!fs.existsSync(schemaFile)) fail(`missing ${schemaRef}`);
else pass(`${schemaRef} exists`);

if (!fs.existsSync(reportFile)) {
  if (args["require-report"] || args.report) fail(`missing ${reportRef}`);
  else pass("SKIPPED_NO_REPORT: no Project Entry calibration report found");
  emit();
}

let schema;
let report;
try {
  schema = JSON.parse(fs.readFileSync(schemaFile, "utf8"));
  report = JSON.parse(fs.readFileSync(reportFile, "utf8"));
} catch (error) {
  fail(`invalid calibration JSON: ${error.message}`);
  emit();
}

const validation = validateSchema(report, schema, { label: reportRef });
if (validation.ok) pass(`${reportRef} matches the calibration schema`);
else validation.errors.forEach(fail);

if (report.report_ref === reportRef) pass(`${reportRef} report_ref points to this report`);
else fail(`${reportRef} report_ref must point to this report`);

const expectedDigest = evidenceDigest(report, ["report_digest"]);
if (report.report_digest === expectedDigest) pass(`${reportRef} report_digest is canonical`);
else fail(`${reportRef} report_digest must match ${expectedDigest}`);

if (report.source_unchanged === "Yes" && report.source_before_digest === report.source_after_digest) {
  pass(`${reportRef} proves the source tree was unchanged during calibration`);
} else fail(`${reportRef} source before/after digests must match`);

const fixtureIds = new Set();
const observedConditions = new Set();
for (const fixture of report.fixtures || []) {
  if (fixtureIds.has(fixture.fixture_id)) fail(`${reportRef} repeats fixture_id ${fixture.fixture_id}`);
  else fixtureIds.add(fixture.fixture_id);
  observedConditions.add(fixture.condition);

  if (fixture.target_unchanged === "Yes" && fixture.target_before_digest === fixture.target_after_digest) {
    pass(`${reportRef} ${fixture.fixture_id} target remained unchanged`);
  } else fail(`${reportRef} ${fixture.fixture_id} target before/after digests must match`);

  for (const result of fixture.command_results || []) {
    if (!result.command.includes("<fixture>")) fail(`${reportRef} ${fixture.fixture_id} command must use the <fixture> placeholder`);
    for (const pattern of forbiddenProjectFacts) {
      if (pattern.test(result.command)) fail(`${reportRef} ${fixture.fixture_id} command contains project-specific data`);
    }
  }
}

for (const condition of requiredConditions) {
  if (observedConditions.has(condition)) pass(`${reportRef} covers ${condition}`);
  else fail(`${reportRef} missing required condition ${condition}`);
}

const serialized = JSON.stringify(report);
for (const pattern of forbiddenProjectFacts) {
  if (pattern.test(serialized)) fail(`${reportRef} contains project-specific calibration facts`);
}

const observationStates = (report.fixtures || []).flatMap((fixture) =>
  (fixture.command_results || []).map((result) => result.observation_state));
if (report.observation_scope === "PRE_IMPLEMENTATION_BASELINE") {
  if (report.outcome === "CALIBRATION_BASELINE_RECORDED"
    && report.boundaries?.proves_acceptance === "No"
    && observationStates.every((state) => state === "BASELINE_RECORDED")) {
    pass(`${reportRef} baseline evidence does not claim implementation acceptance`);
  } else fail(`${reportRef} pre-implementation baseline must remain non-accepting`);
} else if (report.outcome === "CALIBRATION_ACCEPTED"
  && report.boundaries?.proves_acceptance === "Yes"
  && observationStates.every((state) => state === "ACCEPTED" || state === "EXPECTED_BLOCK")) {
  pass(`${reportRef} post-implementation acceptance states are coherent`);
} else fail(`${reportRef} post-implementation evidence is not acceptance-complete`);

emit();

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emit() {
  if (outputJson) console.log(JSON.stringify({ ok: !failed, report: reportRef, checks }, null, 2));
  process.exit(failed ? 1 : 0);
}
