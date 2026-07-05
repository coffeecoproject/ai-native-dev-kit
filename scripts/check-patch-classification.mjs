#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue, matchesHighRiskSurface } from "./lib/risk-surfaces.mjs";

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
  "core/patch-classification.md",
  "templates/patch-classification-report.md",
  "templates/patch-classification-false-positive.md",
  "checklists/patch-classification-review.md",
  "prompts/patch-classifier-agent.md",
  "scripts/check-patch-classification.mjs",
  "scripts/lib/risk-surfaces.mjs",
];

const requiredDirectories = [
  "patch-classifications",
  "patch-classification-false-positives",
];

const reportSections = [
  "Human Summary",
  "Classification Status",
  "Repair Classification",
  "Why Not Another Type",
  "Patch Risk",
  "Rollback / Recovery Impact",
  "Affected Baselines",
  "Affected Surfaces",
  "Required Evidence",
  "Required Human Decisions",
  "Verification Plan",
  "Implementation Authorization",
  "Outcome",
];

const allowedTypes = new Set([
  "SAFE_LOCAL_FIX",
  "BASELINE_ALIGNED_HARDCUT",
  "STRUCTURAL_REMEDIATION",
  "NEEDS_HUMAN_DECISION",
  "DO_NOT_PATCH",
]);

const allowedOutcomes = new Set([
  "CLASSIFIED_ONLY",
  "NEEDS_HUMAN_DECISION",
  "DO_NOT_PATCH",
]);

const falsePositiveSections = [
  "Human Summary",
  "Classification Status",
  "Trigger",
  "Why It Was Flagged",
  "Why It May Be A False Positive",
  "Safety Check",
  "Calibration Decision",
  "Required Human Decisions",
  "Outcome",
];

const allowedFalsePositiveStatuses = new Set([
  "DRAFT",
  "REVIEWED",
  "ACCEPTED",
  "REJECTED",
]);

const allowedCalibrationDecisions = new Set([
  "KEEP_CONSERVATIVE",
  "ADJUST_KEYWORD",
  "DOCUMENT_EXCEPTION",
  "REJECT_FALSE_POSITIVE",
]);

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Patch Classification Check");
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
checkPatchReports();
checkFalsePositiveReports();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.8 patch classification evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/patch-classification.md");
  if (!core) return;
  for (const marker of [
    "Patch Classification Governance",
    "SAFE_LOCAL_FIX",
    "BASELINE_ALIGNED_HARDCUT",
    "STRUCTURAL_REMEDIATION",
    "NEEDS_HUMAN_DECISION",
    "DO_NOT_PATCH",
    "Patch classification does not authorize implementation",
    "heuristic and structure-based",
  ]) {
    if (core.includes(marker)) pass(`patch classification core includes ${marker}`);
    else fail(`patch classification core missing ${marker}`);
  }
}

function checkPatchReports() {
  const files = markdownFiles("patch-classifications");
  if (files.length === 0) {
    pass("patch classification check skipped: no patch classification reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);

    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    requireImplementationBoundary(content, label);

    const type = tableValue(content, "Type");
    if (allowedTypes.has(type)) pass(`${label} has valid repair classification`);
    else fail(`${label} has invalid repair classification: ${type || "<empty>"}`);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);

    if (type === "DO_NOT_PATCH" && outcome !== "DO_NOT_PATCH") {
      fail(`${label} DO_NOT_PATCH classification must use DO_NOT_PATCH outcome`);
    }

    if (type === "DO_NOT_PATCH" && /\b(completed|done|implemented|fixed|shipped)\b/i.test(content)) {
      fail(`${label} DO_NOT_PATCH must not be marked as completed work`);
    }

    requireFilledTableValue(content, label, "Why this type");
    requireFilledTableValue(content, label, "Why not SAFE_LOCAL_FIX");
    requireWhyNotAnotherType(content, label);
    requirePatchRisk(content, label);
    requireNonEmptySection(content, label, "Rollback / Recovery Impact");
    requireNonEmptySection(content, label, "Affected Baselines");
    requireNonEmptySection(content, label, "Affected Surfaces");
    requireNonEmptySection(content, label, "Required Evidence");
    requireNonEmptySection(content, label, "Verification Plan");

    const riskText = [
      sectionBody(content, "Human Summary"),
      sectionBody(content, "Repair Classification"),
      sectionBody(content, "Affected Baselines"),
      sectionBody(content, "Affected Surfaces"),
      sectionBody(content, "Rollback / Recovery Impact"),
      sectionBody(content, "Required Evidence"),
      sectionBody(content, "Verification Plan"),
    ].join("\n");
    const highRisk = matchesHighRiskSurface(riskText);
    if (type === "SAFE_LOCAL_FIX" && highRisk) {
      fail(`${label} labels high-risk surface as SAFE_LOCAL_FIX`);
    } else if (type === "SAFE_LOCAL_FIX") {
      pass(`${label} SAFE_LOCAL_FIX has no high-risk surface markers`);
    }

    if (highRisk && type === "SAFE_LOCAL_FIX") {
      fail(`${label} high-risk surfaces require non-SAFE_LOCAL_FIX classification`);
    } else if (highRisk) {
      pass(`${label} high-risk surfaces are not classified as SAFE_LOCAL_FIX`);
    }

    if (type === "NEEDS_HUMAN_DECISION" || type === "DO_NOT_PATCH" || /Human decision required/i.test(content)) {
      requireHumanDecisionBoundary(content, label);
    }
  }
}

function checkFalsePositiveReports() {
  const files = markdownFiles("patch-classification-false-positives");
  if (files.length === 0) {
    pass("patch classification false-positive check skipped: no false-positive reports");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of falsePositiveSections) requireSection(content, section, label);

    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    if (/authorizes implementation:\s*Yes/i.test(content) || /approve[s]? implementation/i.test(content)) {
      fail(`${label} false-positive records must not approve implementation`);
    }

    const status = labeledValue(content, "Status").toUpperCase();
    if (allowedFalsePositiveStatuses.has(status)) pass(`${label} has valid false-positive status`);
    else fail(`${label} has invalid false-positive status: ${status || "<empty>"}`);

    const decision = labeledValue(content, "Decision").toUpperCase();
    if (allowedCalibrationDecisions.has(decision)) pass(`${label} has valid calibration decision`);
    else fail(`${label} has invalid calibration decision: ${decision || "<empty>"}`);

    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (outcome === "RECORD_ONLY") pass(`${label} false-positive outcome is RECORD_ONLY`);
    else fail(`${label} false-positive outcome must be RECORD_ONLY, got ${outcome || "<empty>"}`);

    requireNonEmptySection(content, label, "Why It Was Flagged");
    requireNonEmptySection(content, label, "Why It May Be A False Positive");
    requireHumanDecisionBoundary(content, label);
    requireFalsePositiveSafety(content, label, decision);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "patch-classifications/180-governed-web-repair-scale.md",
    "patch-classification-false-positives/181-risk-surface-calibration.md",
    "examples/1.8-real-project-readonly/patch-classifications/001-structural-remediation.md",
    "releases/1.8.0/release-record.md",
    "releases/1.8.0/known-limitations.md",
    "releases/1.8.0/self-check-report.md",
    "releases/1.8.1/release-record.md",
    "releases/1.8.1/known-limitations.md",
    "releases/1.8.1/self-check-report.md",
  ]) {
    if (exists(file)) pass(`patch classification source evidence exists ${file}`);
    else fail(`patch classification source evidence missing ${file}`);
  }

  for (const [name, target, expected] of [
    ["safe local high risk", "test-fixtures/bad/bad-patch-safe-local-high-risk", "SAFE_LOCAL_FIX"],
    ["authorizes implementation", "test-fixtures/bad/bad-patch-authorizes-implementation", "authorize implementation"],
    ["do not patch completed", "test-fixtures/bad/bad-patch-do-not-patch-done", "DO_NOT_PATCH"],
    ["unsafe false positive", "test-fixtures/bad/bad-patch-false-positive-unsafe", "false-positive cannot be accepted"],
  ]) {
    const result = runSelf([target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`patch classification rejects ${name}`);
    } else {
      fail(`patch classification must reject ${name}: ${output}`);
    }
  }
}

function requireImplementationBoundary(content, label) {
  const status = tableValue(content, "Patch classification authorizes implementation");
  const implementationBody = sectionBody(content, "Implementation Authorization");
  const hasNo = /^No$/i.test(status)
    || /Patch classification authorizes implementation:\s*No/i.test(implementationBody);
  if (hasNo && !/authorizes implementation:\s*Yes/i.test(content) && !/\|\s*Patch classification authorizes implementation\s*\|\s*Yes\s*\|/i.test(content)) {
    pass(`${label} states patch classification is not implementation authorization`);
  } else {
    fail(`${label} patch classification must not authorize implementation`);
  }
}

function requireWhyNotAnotherType(content, label) {
  const body = sectionBody(content, "Why Not Another Type");
  const missing = [...allowedTypes].filter((type) => !new RegExp(`\\|\\s*${type}\\s*\\|\\s*[^|]+\\|`, "i").test(body));
  if (missing.length === 0 && !/[<>]/.test(body)) {
    pass(`${label} explains why other repair types were not selected`);
  } else {
    fail(`${label} must explain why not another type: ${missing.join(", ") || "placeholder value"}`);
  }
}

function requirePatchRisk(content, label) {
  const hideRoot = tableValue(content, "Could this hide a root cause?");
  const weakenGate = tableValue(content, "Could this weaken a gate?");
  if (/^(Yes|No)$/i.test(hideRoot)) pass(`${label} records root-cause hiding risk`);
  else fail(`${label} must record whether patch could hide a root cause`);
  if (/^(Yes|No)$/i.test(weakenGate)) pass(`${label} records gate weakening risk`);
  else fail(`${label} must record whether patch could weaken a gate`);
}

function requireFilledTableValue(content, label, field) {
  const value = tableValue(content, field);
  if (value && !/[<>]/.test(value) && !/^\s*$/.test(value)) pass(`${label} fills ${field}`);
  else fail(`${label} must fill ${field}`);
}

function requireNonEmptySection(content, label, section) {
  const body = sectionBody(content, section);
  const filled = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line !== "-" && !/[<>]/.test(line));
  if (filled.length > 0) pass(`${label} fills section ${section}`);
  else fail(`${label} must fill section ${section}`);
}

function requireHumanDecisionBoundary(content, label) {
  const body = sectionBody(content, "Required Human Decisions");
  if (!body || !/\b(PENDING|APPROVED|DEFERRED|NOT_APPROVED|Not Approved)\b/i.test(body)) {
    fail(`${label} must record required human decisions`);
    return;
  }
  pass(`${label} records human decision queue`);
}

function requireFalsePositiveSafety(content, label, decision) {
  const rows = parseMarkdownTable(sectionBody(content, "Safety Check"));
  if (rows.length === 0) {
    fail(`${label} must include concrete Safety Check rows`);
    return;
  }
  let unsafeYes = false;
  let invalidResult = false;
  for (const row of rows) {
    const result = String(row.result || "").trim();
    if (!/^(Yes|No)$/i.test(result)) invalidResult = true;
    if (/^Yes$/i.test(result)) unsafeYes = true;
  }
  if (invalidResult) {
    fail(`${label} Safety Check results must be Yes or No`);
    return;
  }
  if (unsafeYes && decision !== "REJECT_FALSE_POSITIVE") {
    fail(`${label} false-positive cannot be accepted when Safety Check records real high-risk impact`);
    return;
  }
  pass(`${label} false-positive safety check is bounded`);
}

function markdownFiles(dir) {
  const resolved = resolveDirectory(dir);
  if (!resolved) return [];
  const files = [];
  walk(resolved, (file) => {
    if (file.endsWith(".md")) files.push(file);
  });
  return files.sort();
}

function walk(dir, visit) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else visit(full);
  }
}

function exists(relativePath) {
  return Boolean(resolveAsset(relativePath) || resolveDirectory(relativePath));
}

function resolveAsset(relativePath) {
  const candidates = assetCandidates(relativePath);
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

function resolveDirectory(relativePath) {
  const candidates = assetCandidates(relativePath);
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) || null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function assetCandidates(relativePath) {
  const normalized = relativePath.replace(/^\.\//, "");
  const candidates = [path.join(projectRoot, normalized)];
  if (!isSourceRepo && !normalized.startsWith(".intentos/")) {
    candidates.push(path.join(projectRoot, ".intentos", normalized));
  }
  return candidates;
}

function displayAsset(expected, resolved) {
  return rel(resolved) === expected ? expected : `${expected} (${rel(resolved)})`;
}

function requireSection(content, section, label) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "m");
  if (pattern.test(content)) pass(`${label} includes section ${section}`);
  else fail(`${label} missing section ${section}`);
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*\\n([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, "m");
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}

function tableValue(content, field) {
  const pattern = new RegExp(`^\\|\\s*${escapeRegExp(field)}\\s*\\|\\s*([^|]+?)\\s*\\|\\s*$`, "mi");
  const match = content.match(pattern);
  return match ? match[1].trim().replace(/^`|`$/g, "") : "";
}

function labeledValue(content, field) {
  const pattern = new RegExp(`^${escapeRegExp(field)}:\\s*(.+?)\\s*$`, "mi");
  const match = content.match(pattern);
  return match ? match[1].trim().replace(/^`|`$/g, "") : "";
}

function parseMarkdownTable(body) {
  const lines = String(body || "").split(/\r?\n/).map((line) => line.trim()).filter((line) => line.startsWith("|"));
  if (lines.length < 2) return [];
  const header = splitRow(lines[0]).map((cell) => cell.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""));
  return lines.slice(2).map((line) => {
    const cells = splitRow(line);
    const row = {};
    header.forEach((key, index) => {
      row[key] = (cells[index] || "").replace(/`/g, "").trim();
    });
    return row;
  }).filter((row) => Object.values(row).some(Boolean));
}

function splitRow(line) {
  return line.split("|").slice(1, -1).map((cell) => cell.trim());
}

function codeOrTextValue(body) {
  const code = body.match(/`([^`]+)`/);
  if (code) return code[1].trim();
  return body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)[0] || "";
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/") || ".";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runSelf(extraArgs) {
  return spawnSync(process.execPath, [new URL(import.meta.url).pathname, ...extraArgs], {
    cwd: projectRoot,
    encoding: "utf8",
  });
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
      target: projectRoot,
      checks,
    }, null, 2));
  } else {
    console.log("");
    console.log(failed ? "Patch classification check failed" : "Patch classification check passed");
  }
  process.exit(failed ? 1 : 0);
}
