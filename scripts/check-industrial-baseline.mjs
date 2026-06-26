#!/usr/bin/env node

import path from "node:path";
import { resolveIndustrialBaseline } from "./resolve-industrial-baseline.mjs";
import { parseArgs } from "./lib/args.mjs";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const strict = Boolean(args.strict);
const outputJson = Boolean(args.json);
const bl2Only = Boolean(args["bl2-only"]);
const checks = [];
const repairHints = [];
let failed = false;
let pending = false;

for (const key of Object.keys(args)) {
  if (!["_", "strict", "json", "bl2-only"].includes(key)) {
    console.error(`FAIL unknown option: --${key}`);
    process.exit(1);
  }
}

function record(status, message) {
  checks.push({ status, message });
  if (!outputJson) {
    const write = status === "FAIL" ? console.error : console.log;
    write(`${status} ${message}`);
  }
}

function pass(message) {
  record("PASS", message);
}

function fail(message) {
  failed = true;
  record("FAIL", message);
}

function warn(message) {
  pending = true;
  if (strict) fail(message);
  else record("PENDING", message);
}

function hint(message) {
  repairHints.push(message);
  if (!outputJson) console.error(`HINT ${message}`);
}

function installSelectedPacksCommand(packIds) {
  return [
    "node <ai-native-dev-kit>/scripts/init-project.mjs",
    `--target ${projectRoot}`,
    "--update-workflow-assets",
    `--industrial-packs ${[...new Set(packIds)].sort().join(",")}`,
  ].join(" ");
}

function missingInstalledPackIds(result) {
  return result.invalidPacks
    .filter((item) => /pack\.json not found/i.test(item.error || ""))
    .map((item) => item.packId);
}

function recordTermCoverage(kind, missing) {
  if (missing.length === 0) {
    pass(`${kind} coverage`);
  } else {
    warn(`${kind} coverage missing: ${missing.join(", ")}`);
  }
}

function recordEvidenceReferenceCoverage(issues) {
  if (!issues || issues.length === 0) {
    pass("baseline evidence references");
    return;
  }
  warn(`baseline evidence reference issues: ${issues.join("; ")}`);
}

const result = resolveIndustrialBaseline(projectRoot);

if (!outputJson) {
  console.log(`# Industrial Baseline Check (${strict ? "strict" : "baseline"})`);
  console.log("");
}

if (bl2Only && result.baselineLevel !== "BL2_INDUSTRIAL") {
  pass(`BL2 industrial baseline is not active: ${result.baselineLevel || "none"}`);
  if (outputJson) {
    console.log(JSON.stringify({
      ...result,
      checkMode: strict ? "strict" : "baseline",
      bl2Only,
      checkStatus: "PASS",
      repairHints,
      checks,
    }, null, 2));
  } else {
    console.log("");
    console.log("Industrial BL2 checks are skipped until BL2_INDUSTRIAL is selected.");
  }
  process.exit(0);
}

if (!result.baselineLevel) {
  warn("baseline level is not selected");
} else {
  pass(`baseline level: ${result.baselineLevel}`);
}

if (result.state === "NOT_APPLICABLE") {
  pass("industrial baseline is not required for the selected baseline level");
}

if (result.packIndexError) {
  fail(`industrial pack index is unavailable: ${result.packIndexError}`);
}

for (const packId of result.unknownPacks) {
  fail(`selected industrial pack is unknown: ${packId}`);
}

for (const item of result.invalidPacks) {
  fail(`selected industrial pack is invalid: ${item.packId} (${item.error})`);
}

const missingInstalledPacks = missingInstalledPackIds(result);
if (missingInstalledPacks.length > 0) {
  hint(`Install missing selected industrial pack(s): ${installSelectedPacksCommand(missingInstalledPacks)}`);
}

for (const packId of result.plannedPacks) {
  fail(`selected industrial pack is planned and not executable yet: ${packId}`);
}

for (const item of result.incompatiblePacks) {
  fail(`${item.packId} is incompatible with selected profiles: ${item.selectedProfiles.join(", ") || "none"}; applies to ${item.appliesToProfiles.join(", ")}`);
}

for (const item of result.conflicts) {
  fail(`${item.packId} conflicts with selected pack ${item.conflictsWith}`);
}

if (result.baselineLevel === "BL2_INDUSTRIAL") {
  if (result.selectedIndustrialPacks.length === 0) {
    warn("BL2_INDUSTRIAL selected but no industrial packs are selected");
  } else {
    pass(`selected industrial packs: ${result.selectedIndustrialPacks.join(", ")}`);
  }

  for (const pack of result.selectedPacks) {
    if (pack.available) pass(`industrial pack available: ${pack.id}`);
  }

  for (const rel of result.requiredProjectDocs) {
    if (result.missingProjectDocs.includes(rel)) {
      warn(`missing BL2 project doc: ${rel}`);
    } else {
      pass(`BL2 project doc: ${rel}`);
    }
  }

  if (result.humanApprovalStatus === "APPROVED") {
    pass("BL2 human approval is approved");
  } else {
    warn(`BL2 human approval is not approved: ${result.humanApprovalStatus || "none"}`);
  }

  recordTermCoverage("baseline evidence", result.missingEvidenceTerms);
  recordEvidenceReferenceCoverage(result.evidenceReferenceIssues);
}

if (result.baselineLevel === "BL0_LIGHTWEIGHT" || result.baselineLevel === "BL1_STANDARD") {
  if (result.selectedIndustrialPacks.length > 0) {
    warn(`industrial packs are selected while baseline level is ${result.baselineLevel}: ${result.selectedIndustrialPacks.join(", ")}`);
  }
}

if (outputJson) {
  const status = failed ? "FAIL" : pending ? "PENDING" : "PASS";
  console.log(JSON.stringify({
    ...result,
    checkMode: strict ? "strict" : "baseline",
    bl2Only,
    checkStatus: status,
    repairHints,
    checks,
  }, null, 2));
}

if (failed) {
  process.exit(1);
}

if (!outputJson) {
  console.log("");
  if (pending) {
    console.log("Industrial baseline can continue only as draft/pending; strict mode still requires decisions or evidence.");
  } else {
    console.log("Industrial baseline is ready.");
  }
}
