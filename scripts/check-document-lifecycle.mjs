#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "intentos-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".intentos", "intentos-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".intentos", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/document-lifecycle.md",
  "docs/document-lifecycle.md",
  "templates/document-lifecycle-report.md",
  "checklists/document-lifecycle-review.md",
  "prompts/document-lifecycle-agent.md",
  "scripts/resolve-document-lifecycle.mjs",
  "scripts/check-document-lifecycle.mjs",
];

const requiredDirectories = [
  "doc-lifecycle-reports",
];

const reportSections = [
  "Human Decision Summary",
  "Human Summary",
  "Document Inventory",
  "Source Of Truth Map",
  "Duplicate / Stale Candidates",
  "Archive Suggestions",
  "Deprecation Suggestions",
  "What Not To Delete",
  "Human Decisions Needed",
  "Boundary",
  "Outcome",
];

const allowedStates = new Set([
  "ACTIVE_SOURCE_OF_TRUTH",
  "ACTIVE_REFERENCE",
  "DUPLICATE_CANDIDATE",
  "STALE_CANDIDATE",
  "ARCHIVE_CANDIDATE",
  "DEPRECATION_CANDIDATE",
  "RETIRED_REFERENCE",
  "UNKNOWN_NEEDS_OWNER",
]);

const allowedOutcomes = new Set([
  "DOCUMENT_LIFECYCLE_RECORDED",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED",
]);

const forbiddenClaims = [
  /\bdeletion\s+(approved|authorized)\b/i,
  /\bdelete\s+(approved|authorized|now)\b/i,
  /\bsafe\s+to\s+delete\b/i,
  /\bfiles?\s+(were\s+)?deleted\b/i,
  /\bfiles?\s+(were\s+)?removed\b/i,
  /\bfiles?\s+(were\s+)?moved\b/i,
  /\bfiles?\s+(were\s+)?archived\b/i,
  /\bsource\s+of\s+truth\s+(changed|updated|replaced)\b/i,
  /\bdocumentation\s+(is\s+)?fully\s+(current|cleaned|deduplicated)\b/i,
  /\bcleanup\s+(approved|complete|completed)\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Document Lifecycle Check");
  console.log("");
}

if (shouldRequireAssets) {
  for (const file of requiredAssets) {
    const resolved = resolveAsset(file);
    if (resolved) pass(`${displayAsset(file, resolved)} exists`);
    else fail(`missing ${file}`);
  }
  for (const dir of requiredDirectories) {
    const resolved = resolveDirectory(dir);
    if (resolved) pass(`${displayAsset(dir, resolved)} exists`);
    else fail(`missing ${dir}`);
  }
} else {
  pass("asset completeness check skipped for standalone example or fixture");
}

checkCoreContent();
checkReports();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.21 document lifecycle evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/document-lifecycle.md");
  if (!core) return;
  for (const marker of [
    "Document Lifecycle Governance",
    "Codex must recommend archive review before recommending deletion",
    "ACTIVE_SOURCE_OF_TRUTH",
    "DUPLICATE_CANDIDATE",
    "ARCHIVE_CANDIDATE",
    "DEPRECATION_CANDIDATE",
    "Source Of Truth Rules",
    "What Not To Touch",
    "The report does not delete files",
    "The report does not authorize deletion",
    "The report does not move or archive files",
    "The report does not change source of truth",
  ]) {
    if (core.includes(marker)) pass(`document lifecycle core includes ${marker}`);
    else fail(`document lifecycle core missing ${marker}`);
  }
}

function checkReports() {
  const files = markdownFiles("doc-lifecycle-reports");
  if (files.length === 0) {
    pass("document lifecycle check skipped: no document lifecycle reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);

    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    const scanContent = contentForForbiddenScan(content);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(scanContent)) fail(`${label} contains forbidden document lifecycle claim: ${pattern.source}`);
    }

    requireLifecycleState(content, label);
    requireSourceOfTruthMap(content, label);
    requireArchiveDefault(content, label);
    requireNoTouchCoverage(content, label);
    requireBoundaryNo(content, label, "This report deletes files");
    requireBoundaryNo(content, label, "This report authorizes deletion");
    requireBoundaryNo(content, label, "This report moves or archives files");
    requireBoundaryNo(content, label, "This report changes source of truth");
    requireBoundaryNo(content, label, "This report changes AGENTS, CI, hooks, release, legal, security, or production docs");
    requireBoundaryNo(content, label, "This report approves implementation or cleanup work");

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function requireLifecycleState(content, label) {
  const inventory = sectionBody(content, "Document Inventory");
  const seenStates = Array.from(inventory.matchAll(/\|\s*[^|\n]+\s*\|\s*[^|\n]+\s*\|\s*([A-Z_]+)\s*\|/g))
    .map((match) => match[1])
    .filter((state) => !["Lifecycle"].includes(state));
  const invalid = seenStates.filter((state) => !allowedStates.has(state));
  if (seenStates.length === 0) {
    fail(`${label} must record at least one lifecycle state`);
  } else if (invalid.length > 0) {
    fail(`${label} has invalid lifecycle state: ${invalid.join(", ")}`);
  } else {
    pass(`${label} records valid lifecycle states`);
  }
}

function requireSourceOfTruthMap(content, label) {
  const sourceMap = sectionBody(content, "Source Of Truth Map");
  if (/source.of.truth|Source-of-truth|PENDING_CONFIRMATION/i.test(sourceMap)
    && /Confidence/i.test(sourceMap)
    && /Human decision needed/i.test(sourceMap)) {
    pass(`${label} records source-of-truth map`);
  } else {
    fail(`${label} must record source-of-truth map with confidence and human decision`);
  }
}

function requireArchiveDefault(content, label) {
  const archive = sectionBody(content, "Archive Suggestions");
  const duplicate = sectionBody(content, "Duplicate / Stale Candidates");
  const combined = `${archive}\n${duplicate}`;
  if (/archive suggestion|Archive Suggestions|SUGGESTED|archive later/i.test(combined)
    && /Approval needed|Yes/i.test(combined)) {
    pass(`${label} uses archive suggestion before deletion`);
  } else {
    fail(`${label} must use archive suggestion with approval before deletion`);
  }
}

function requireNoTouchCoverage(content, label) {
  const noTouch = sectionBody(content, "What Not To Delete");
  for (const marker of [
    "Source-of-truth",
    "AGENTS",
    "CI",
    "hooks",
    "release",
    "Legal",
    "security",
    "Production",
    "evidence",
    "customer",
    "secrets",
  ]) {
    if (new RegExp(marker, "i").test(noTouch)) pass(`${label} What Not To Delete protects ${marker}`);
    else fail(`${label} What Not To Delete must mention ${marker}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.21-document-lifecycle/README.md",
    "examples/1.21-document-lifecycle/doc-lifecycle-reports/001-doc-lifecycle.md",
    "releases/1.21.0/release-record.md",
    "releases/1.21.0/known-limitations.md",
    "releases/1.21.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.21 document lifecycle source evidence exists ${file}`);
    else fail(`1.21 document lifecycle source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-document-lifecycle.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Document Lifecycle Recommendation")
    && resolver.stdout.includes("This report deletes files: No")
    && resolver.stdout.includes("Archive Suggestions")) {
    pass("1.21 document lifecycle resolver prints read-only recommendation");
  } else {
    fail(`1.21 document lifecycle resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-document-lifecycle.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DOCUMENT_LIFECYCLE_RECOMMENDATION"
        && parsed.boundary?.deletesFiles === "No"
        && Array.isArray(parsed.sourceOfTruthMap)) {
        pass("1.21 document lifecycle resolver JSON includes boundary and source-of-truth map");
      } else {
        fail(`1.21 document lifecycle resolver JSON missing required fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.21 document lifecycle resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.21 document lifecycle resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-document-lifecycle.mjs", "examples/1.21-document-lifecycle"]);
  if (example.status === 0 && example.stdout.includes("Document lifecycle check passed")) {
    pass("1.21 document lifecycle example passes checker");
  } else {
    fail(`1.21 document lifecycle example failed: ${example.stderr || example.stdout}`);
  }

  for (const [name, target, expected] of [
    ["authorizes deletion", "test-fixtures/bad/bad-document-lifecycle-authorizes-delete", "authorizes deletion"],
    ["missing source of truth", "test-fixtures/bad/bad-document-lifecycle-missing-source-of-truth", "source-of-truth map"],
  ]) {
    const result = runNode(["scripts/check-document-lifecycle.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.21 document lifecycle rejects ${name}`);
    } else {
      fail(`1.21 document lifecycle must reject ${name}: ${output}`);
    }
  }
}

function contentForForbiddenScan(content) {
  return String(content)
    .replace(/^- This report deletes files: No$/gim, "")
    .replace(/^- This report authorizes deletion: No$/gim, "")
    .replace(/^- This report moves or archives files: No$/gim, "")
    .replace(/^- This report changes source of truth: No$/gim, "")
    .replace(/^- This report approves implementation or cleanup work: No$/gim, "");
}

function pass(message) {
  checks.push({ status: "PASS", message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ status: "FAIL", message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emitAndExit() {
  if (outputJson) {
    console.log(JSON.stringify({
      status: failed ? "FAIL" : "PASS",
      projectRoot,
      results: checks,
    }, null, 2));
  } else if (!failed) {
    console.log("");
    console.log("Document lifecycle check passed.");
  }
  process.exit(failed ? 1 : 0);
}

function requireSection(content, section, label) {
  const body = sectionBody(content, section);
  if (body.trim()) pass(`${label} has ${section}`);
  else fail(`${label} missing ${section}`);
}

function requireBoundaryNo(content, label, key) {
  const pattern = new RegExp(`^-\\s*${escapeRegExp(key)}:\\s*No\\s*$`, "im");
  if (pattern.test(content)) pass(`${label} boundary ${key}: No`);
  else fail(`${label} missing boundary ${key}: No`);
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
  const match = pattern.exec(content);
  if (!match) return "";
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index).trim() : rest.trim();
}

function codeOrTextValue(body) {
  const code = String(body || "").match(/`([A-Z_]+)`/);
  if (code) return code[1];
  const text = String(body || "").trim().split(/\s+/)[0];
  return text ? text.replace(/[^A-Z_]/gi, "").toUpperCase() : "";
}

function markdownFiles(dir) {
  const rootDir = path.join(projectRoot, dir);
  if (!fs.existsSync(rootDir)) return [];
  const files = [];
  walk(rootDir, files);
  return files.filter((file) => /\.md$/i.test(file)).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(file) {
  const targetAsset = path.join(projectRoot, file);
  if (fs.existsSync(targetAsset)) return targetAsset;
  const nativeAsset = path.join(projectRoot, ".intentos", file);
  if (fs.existsSync(nativeAsset)) return nativeAsset;
  return null;
}

function resolveDirectory(dir) {
  const targetDir = path.join(projectRoot, dir);
  if (fs.existsSync(targetDir) && fs.statSync(targetDir).isDirectory()) return targetDir;
  return null;
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  if (!resolved) return "";
  return fs.readFileSync(resolved, "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
}

function displayAsset(expected, resolved) {
  const relative = rel(resolved);
  return relative || expected;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 80,
  });
}
