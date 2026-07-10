#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { normalizeBaselineLevel } from "./lib/baseline-selection.mjs";
import { assertInsideRoot, assertNoSymlinkInPath } from "./lib/path-safety.mjs";
import { resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "require-selection", "allow-pending-receipt"]);
const unknown = unknownOptions(args, knownFlags);
if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireSelection = Boolean(args["require-selection"]);
const allowPendingReceipt = Boolean(args["allow-pending-receipt"]);
const checks = [];
let failed = false;
let pending = false;

function record(status, message) {
  checks.push({ status, message });
  if (!outputJson) {
    const writer = status === "FAIL" ? console.error : console.log;
    writer(`${status} ${message}`);
  }
}

function pass(message) {
  record("PASS", message);
}

function fail(message) {
  failed = true;
  record("FAIL", message);
}

function wait(message) {
  pending = true;
  record("PENDING", message);
}

function readText(rel) {
  const file = path.join(projectRoot, rel);
  try {
    assertInsideRoot(projectRoot, file, `baseline installation asset ${rel}`);
    assertNoSymlinkInPath(projectRoot, file, `baseline installation asset ${rel}`);
  } catch (error) {
    fail(error.message);
    return null;
  }
  return fs.existsSync(file) && fs.statSync(file).isFile() ? fs.readFileSync(file, "utf8") : null;
}

function readJson(rel) {
  const content = readText(rel);
  if (content === null) return null;
  try {
    return JSON.parse(content);
  } catch (error) {
    fail(`${rel} is invalid JSON: ${error.message}`);
    return null;
  }
}

function list(body) {
  return [...new Set(String(body || "").split("\n")
    .map((line) => line.match(/^\s*-\s+([a-z0-9][a-z0-9-]*)\s*$/i)?.[1])
    .filter((value) => value && !/^(none|n\/a|pending|tbd)$/i.test(value)))].sort();
}

function singleBaselineLevel(content) {
  const tokens = sectionBody(content, "Baseline Level")
    .match(/\bBL[0-2](?:_(?:LIGHTWEIGHT|STANDARD|INDUSTRIAL))?\b/gi) || [];
  const normalized = [...new Set(tokens.map(normalizeBaselineLevel).filter(Boolean))];
  return normalized.length === 1 ? normalized[0] : null;
}

function ensureInstalledRegistryPack(registry, packId, indexById) {
  const entry = indexById.get(packId);
  if (!entry) {
    fail(`selected ${registry} pack is absent from installed registry: ${packId}`);
    return;
  }
  const manifestRel = `.intentos/${registry}/${entry.path}/pack.json`;
  if (readText(manifestRel) === null) {
    fail(`selected ${registry} pack is not installed: ${packId} (${manifestRel})`);
    return;
  }
  pass(`selected ${registry} pack installed: ${packId} (${entry.maturityStage || entry.status || "unknown"})`);
}

function sameList(left, right) {
  return JSON.stringify([...(left || [])].sort()) === JSON.stringify([...(right || [])].sort());
}

function receiptFiles() {
  const dir = path.join(projectRoot, "apply-receipts");
  if (!fs.existsSync(dir)) return [];
  try {
    assertInsideRoot(projectRoot, dir, "apply receipt directory");
    assertNoSymlinkInPath(projectRoot, dir, "apply receipt directory");
  } catch (error) {
    fail(error.message);
    return [];
  }
  if (!fs.statSync(dir).isDirectory()) {
    fail("apply-receipts must be a directory");
    return [];
  }
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("."))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function planMatchesSelection(plan, selection) {
  const planArgs = plan?.arguments || {};
  return planArgs.baselineLevel === selection.baselineLevel
    && sameList(planArgs.profiles, selection.profiles)
    && sameList(planArgs.standardPacks, selection.standardPacks)
    && sameList(planArgs.selectedIndustrialPacks, selection.industrialPacks);
}

function matchingVerifiedReceipt(selection) {
  const receiptChecker = path.join(projectRoot, "scripts", "check-apply-execution-receipt.mjs");
  if (!fs.existsSync(receiptChecker)) {
    fail("installed apply receipt checker is missing");
    return null;
  }

  for (const receiptFile of receiptFiles()) {
    let extracted;
    try {
      assertNoSymlinkInPath(projectRoot, receiptFile, "apply receipt");
      extracted = extractMachineReadableEvidence(fs.readFileSync(receiptFile, "utf8"));
    } catch (error) {
      fail(error.message);
      continue;
    }
    if (!extracted?.ok || extracted.value?.receipt_state !== "APPLY_VERIFIED") continue;
    const planRef = extracted.value?.execution_plan?.path;
    const resolvedPlan = resolveAuthoritativeEvidenceReference(projectRoot, receiptFile, planRef);
    if (!resolvedPlan.ok) continue;
    let plan;
    try {
      plan = JSON.parse(fs.readFileSync(resolvedPlan.file, "utf8"));
    } catch {
      continue;
    }
    if (!planMatchesSelection(plan, selection)) continue;

    const receiptRel = path.relative(projectRoot, receiptFile).split(path.sep).join("/");
    const result = spawnSync(process.execPath, [
      receiptChecker,
      projectRoot,
      "--require-structured-evidence",
      "--receipt",
      receiptRel,
    ], {
      cwd: projectRoot,
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 20,
    });
    if (result.status === 0) return { receiptRel, planRel: resolvedPlan.relativePath };
  }
  return null;
}

function checkReceiptBinding(selection) {
  const match = matchingVerifiedReceipt(selection);
  if (match) {
    pass(`baseline installation is bound to verified apply receipt: ${match.receiptRel}`);
    pass(`verified apply receipt binds exact baseline plan: ${match.planRel}`);
    return;
  }
  if (allowPendingReceipt) {
    wait("baseline structure is installed but the post-apply receipt is not available yet");
    return;
  }
  fail("no valid current-project Apply Receipt binds the exact installed baseline selection and current target hashes");
}

const selectionRel = "docs/baseline-selection.md";
const selection = readText(selectionRel);

if (selection === null) {
  if (requireSelection) fail(`required baseline selection is missing: ${selectionRel}`);
  else wait(`baseline selection is not configured: ${selectionRel}`);
} else {
  pass(`baseline selection exists: ${selectionRel}`);
  const baselineLevel = singleBaselineLevel(selection);
  const profiles = list(sectionBody(selection, "Selected Profiles"));
  const standardPacks = list(sectionBody(selection, "Selected Standard Packs"));
  const industrialPacks = list(sectionBody(selection, "Selected Industrial Packs"));

  if (baselineLevel) pass(`canonical baseline level: ${baselineLevel}`);
  else fail("baseline selection must contain exactly one canonical BL0/BL1/BL2 level");

  if (profiles.length > 0) pass(`selected profiles: ${profiles.join(", ")}`);
  else fail("baseline selection must contain at least one selected profile");

  const projectProfile = readText("docs/project-profile.md");
  const baselineEvidence = readText("docs/baseline-evidence.md");
  if (projectProfile === null) fail("docs/project-profile.md is missing");
  else {
    const profileDocProfiles = list(sectionBody(projectProfile, "Selected Profiles"));
    if (JSON.stringify(profileDocProfiles) === JSON.stringify(profiles)) pass("project profile matches baseline selected profiles");
    else fail("project profile selected profiles do not match baseline selection");
  }
  if (baselineEvidence === null) fail("docs/baseline-evidence.md is missing");
  else pass("baseline evidence document exists");

  for (const profile of profiles) {
    const rel = `.intentos/profiles/${profile}/profile.md`;
    if (readText(rel) === null) fail(`selected profile asset is not installed: ${profile}`);
    else pass(`selected profile asset installed: ${profile}`);
  }

  const standardIndex = readJson(".intentos/standard-baseline-packs/index.json");
  const standardById = new Map((standardIndex?.packs || []).map((entry) => [entry.id, entry]));
  if (!standardIndex) fail("installed standard baseline pack index is missing");
  if (["BL1_STANDARD", "BL2_INDUSTRIAL"].includes(baselineLevel) && standardPacks.length === 0) {
    fail(`${baselineLevel} requires at least one selected standard baseline pack`);
  }
  for (const packId of standardPacks) ensureInstalledRegistryPack("standard-baseline-packs", packId, standardById);

  const industrialIndex = readJson(".intentos/industrial-packs/index.json");
  const industrialById = new Map((industrialIndex?.packs || []).map((entry) => [entry.id, entry]));
  if (!industrialIndex) fail("installed industrial pack index is missing");
  if (baselineLevel === "BL2_INDUSTRIAL" && industrialPacks.length === 0) {
    fail("BL2_INDUSTRIAL requires at least one selected industrial pack");
  }
  if (baselineLevel !== "BL2_INDUSTRIAL" && industrialPacks.length > 0) {
    fail(`industrial packs cannot be selected for ${baselineLevel || "an unknown baseline level"}`);
  }
  for (const packId of industrialPacks) ensureInstalledRegistryPack("industrial-packs", packId, industrialById);

  const version = readJson(".intentos/version.json");
  if (!version) {
    fail(".intentos/version.json is missing");
  } else if (!version.baselineSelection) {
    fail(".intentos/version.json does not bind the installed baseline selection");
  } else {
    const bound = version.baselineSelection;
    const matches = bound.level === baselineLevel
      && JSON.stringify([...(bound.profiles || [])].sort()) === JSON.stringify(profiles)
      && JSON.stringify([...(bound.standardPacks || [])].sort()) === JSON.stringify(standardPacks)
      && JSON.stringify([...(bound.industrialPacks || [])].sort()) === JSON.stringify(industrialPacks);
    if (matches) pass("managed version record matches installed baseline selection");
    else fail("managed version record baseline selection does not match project documents");
  }

  if (!failed) {
    checkReceiptBinding({ baselineLevel, profiles, standardPacks, industrialPacks });
  }
}

const status = failed ? "FAIL" : pending ? "PENDING" : "PASS";
if (outputJson) {
  console.log(JSON.stringify({ projectRoot, status, requireSelection, allowPendingReceipt, checks }, null, 2));
} else {
  console.log("");
  console.log(`Baseline installation status: ${status}`);
}

if (failed) process.exit(1);
