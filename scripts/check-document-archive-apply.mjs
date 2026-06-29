#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".ai-native", "version.json"));

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/document-archive-apply.md",
  "docs/document-archive-apply.md",
  "templates/document-archive-apply-plan.md",
  "templates/archive-index.md",
  "checklists/document-archive-apply-review.md",
  "prompts/document-archive-agent.md",
  "scripts/resolve-document-archive-apply.mjs",
  "scripts/check-document-archive-apply.mjs",
];
const requiredDirectories = ["archive-apply-plans"];
const reportSections = [
  "Human Decision Summary",
  "Archive Readiness",
  "Source Evidence",
  "Archive Action Plan",
  "Link Check Plan",
  "Archive Index",
  "Rollback Plan",
  "What Not To Archive",
  "Human Decisions Needed",
  "Boundary",
  "Outcome",
];
const allowedStates = new Set([
  "NO_LIFECYCLE_EVIDENCE",
  "NO_ARCHIVE_ACTION_READY",
  "PLAN_ONLY",
  "NEEDS_APPROVAL",
  "BLOCKED_BY_SOURCE_OF_TRUTH",
  "BLOCKED_BY_LINK_RISK",
]);
const allowedOutcomes = new Set(["ARCHIVE_PLAN_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const forbiddenClaims = [
  /\bdeletes files:\s*Yes\b/i,
  /\bmoves or archives files now:\s*Yes\b/i,
  /\bauthorizes archive apply:\s*Yes\b/i,
  /\bchanges source of truth:\s*Yes\b/i,
  /\bchanges links automatically:\s*Yes\b/i,
  /\breplaces Document Lifecycle:\s*Yes\b/i,
  /\bapproves cleanup completion:\s*Yes\b/i,
  /\bfiles?\s+(were\s+)?(archived|moved|deleted)\b/i,
  /\barchive apply\s+(approved|complete|completed)\b/i,
  /\bsafe\s+to\s+delete\b/i,
  /\blinks?\s+(were\s+)?fixed\b/i,
  /\bcleanup\s+(complete|completed|approved)\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Document Archive Apply Check");
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
checkPlans();
if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.28 document archive apply evidence checks skipped for target project");
emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/document-archive-apply.md");
  if (!core) return;
  for (const marker of [
    "Document Archive Apply Governance",
    "Archive Apply States",
    "Link Check Rules",
    "Archive Index Rules",
    "Rollback Rules",
    "The plan deletes files: No",
    "The plan authorizes archive apply: No",
  ]) {
    if (core.includes(marker)) pass(`document archive apply core includes ${marker}`);
    else fail(`document archive apply core missing ${marker}`);
  }
}

function checkPlans() {
  const files = markdownFiles("archive-apply-plans");
  if (files.length === 0) {
    pass("document archive apply check skipped: no archive apply plans");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    const scanContent = contentForForbiddenScan(content);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(scanContent)) fail(`${label} contains forbidden archive apply claim: ${pattern.source}`);
    }
    requireReadiness(content, label);
    requireActionPlan(content, label);
    requireLinkCheckPlan(content, label);
    requireArchiveIndex(content, label);
    requireRollbackPlan(content, label);
    requireNoTouchCoverage(content, label);
    requireBoundaryNo(content, label, "This plan deletes files");
    requireBoundaryNo(content, label, "This plan moves or archives files now");
    requireBoundaryNo(content, label, "This plan authorizes archive apply");
    requireBoundaryNo(content, label, "This plan changes source of truth");
    requireBoundaryNo(content, label, "This plan changes links automatically");
    requireBoundaryNo(content, label, "This plan replaces Document Lifecycle");
    requireBoundaryNo(content, label, "This plan approves cleanup completion");
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function requireReadiness(content, label) {
  const readiness = sectionBody(content, "Archive Readiness");
  const states = [...readiness.matchAll(/\b(NO_LIFECYCLE_EVIDENCE|NO_ARCHIVE_ACTION_READY|PLAN_ONLY|NEEDS_APPROVAL|BLOCKED_BY_SOURCE_OF_TRUTH|BLOCKED_BY_LINK_RISK)\b/g)].map((item) => item[1]);
  if (states.length === 0) fail(`${label} must include archive readiness state`);
  else if (states.every((state) => allowedStates.has(state))) pass(`${label} uses valid archive readiness state`);
  else fail(`${label} has invalid archive readiness state`);
  if (/Can apply archive now\?\s*\|\s*No/i.test(readiness)) pass(`${label} states archive cannot apply now`);
  else fail(`${label} must state archive cannot apply now`);
}

function requireActionPlan(content, label) {
  const body = sectionBody(content, "Archive Action Plan");
  for (const marker of ["PLAN_ONLY", "Approval needed", "Link check required", "Rollback required"]) {
    if (new RegExp(marker, "i").test(body)) pass(`${label} action plan includes ${marker}`);
    else fail(`${label} action plan missing ${marker}`);
  }
  if (/\|\s*Yes\s*\|\s*Yes\s*\|\s*Yes\s*\|/i.test(body)
    || /Yes before any future archive/i.test(body)) {
    pass(`${label} action plan requires approval, link check, and rollback`);
  } else {
    fail(`${label} action plan must require approval, link check, and rollback`);
  }
}

function requireLinkCheckPlan(content, label) {
  const body = sectionBody(content, "Link Check Plan");
  for (const marker of ["Pre-apply reference search", "Post-apply reference search", "Broken-link handling"]) {
    if (body.includes(marker)) pass(`${label} link check plan includes ${marker}`);
    else fail(`${label} link check plan missing ${marker}`);
  }
}

function requireArchiveIndex(content, label) {
  const body = sectionBody(content, "Archive Index");
  for (const marker of ["Index path", "Original path", "Archive path", "Replacement", "Rollback path"]) {
    if (new RegExp(marker, "i").test(body)) pass(`${label} archive index includes ${marker}`);
    else fail(`${label} archive index missing ${marker}`);
  }
}

function requireRollbackPlan(content, label) {
  const body = sectionBody(content, "Rollback Plan");
  for (const marker of ["Restore step", "Link restore step", "Evidence needed"]) {
    if (body.includes(marker)) pass(`${label} rollback plan includes ${marker}`);
    else fail(`${label} rollback plan missing ${marker}`);
  }
}

function requireNoTouchCoverage(content, label) {
  const noTouch = sectionBody(content, "What Not To Archive");
  for (const marker of ["Source-of-truth", "AGENTS", "CI", "hooks", "release", "Legal", "security", "Production", "evidence", "customer", "secrets"]) {
    if (new RegExp(marker, "i").test(noTouch)) pass(`${label} What Not To Archive protects ${marker}`);
    else fail(`${label} What Not To Archive must mention ${marker}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "examples/1.28-document-archive-apply/README.md",
    "examples/1.28-document-archive-apply/archive-apply-plans/001-archive-plan.md",
    "releases/1.28.0/release-record.md",
    "releases/1.28.0/known-limitations.md",
    "releases/1.28.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.28 document archive apply source evidence exists ${file}`);
    else fail(`1.28 document archive apply source evidence missing ${file}`);
  }
  const resolver = runNode(["scripts/resolve-document-archive-apply.mjs", "."]);
  if (resolver.status === 0
    && resolver.stdout.includes("Document Archive Apply Plan")
    && resolver.stdout.includes("This plan authorizes archive apply: No")) {
    pass("1.28 document archive apply resolver prints safe plan");
  } else {
    fail(`1.28 document archive apply resolver failed: ${resolver.stderr || resolver.stdout}`);
  }
  const resolverJson = runNode(["scripts/resolve-document-archive-apply.mjs", ".", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "DOCUMENT_ARCHIVE_APPLY_PLAN"
        && parsed.boundaries?.authorizesArchiveApply === "No"
        && parsed.archiveIndex?.indexPath
        && Array.isArray(parsed.linkCheckPlan)) {
        pass("1.28 document archive apply resolver JSON includes index, links, and boundaries");
      } else {
        fail(`1.28 document archive apply resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.28 document archive apply resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.28 document archive apply resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }
  const example = runNode(["scripts/check-document-archive-apply.mjs", "examples/1.28-document-archive-apply"]);
  if (example.status === 0 && example.stdout.includes("Document Archive Apply check passed")) pass("1.28 document archive apply example passes checker");
  else fail(`1.28 document archive apply example failed: ${example.stderr || example.stdout}`);
  for (const [name, target, expected] of [
    ["authorizes archive", "test-fixtures/bad/bad-archive-apply-authorizes-archive", "forbidden archive apply claim"],
    ["missing index", "test-fixtures/bad/bad-archive-apply-missing-index", "missing Archive Index"],
  ]) {
    const result = runNode(["scripts/check-document-archive-apply.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.28 document archive apply rejects ${name}`);
    else fail(`1.28 document archive apply must reject ${name}: ${output}`);
  }
}

function contentForForbiddenScan(content) {
  return String(content)
    .replace(/^- This plan deletes files: No$/gim, "")
    .replace(/^- This plan moves or archives files now: No$/gim, "")
    .replace(/^- This plan authorizes archive apply: No$/gim, "")
    .replace(/^- This plan changes source of truth: No$/gim, "")
    .replace(/^- This plan changes links automatically: No$/gim, "")
    .replace(/^- This plan replaces Document Lifecycle: No$/gim, "")
    .replace(/^- This plan approves cleanup completion: No$/gim, "");
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
  if (outputJson) console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", projectRoot, results: checks }, null, 2));
  else if (!failed) {
    console.log("");
    console.log("Document Archive Apply check passed.");
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
  const rest = content.slice(match.index + match[0].length);
  const next = /^##\s+/m.exec(rest);
  return next ? rest.slice(0, next.index).trim() : rest.trim();
}

function markdownFiles(dir) {
  const base = resolveDirectory(dir);
  if (!base) return [];
  const files = [];
  walk(base, files);
  return files.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct)) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relPath);
  if (fs.existsSync(aiNative)) return aiNative;
  return null;
}

function resolveDirectory(relPath) {
  const direct = path.join(projectRoot, relPath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relPath);
  if (fs.existsSync(aiNative) && fs.statSync(aiNative).isDirectory()) return aiNative;
  return null;
}

function readResolved(relPath) {
  const resolved = resolveAsset(relPath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function exists(relPath) {
  return fs.existsSync(path.join(projectRoot, relPath));
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/") || ".";
}

function displayAsset(relPath, resolved) {
  const direct = path.join(projectRoot, relPath);
  return path.resolve(resolved) === path.resolve(direct) ? relPath : `.ai-native/${relPath}`;
}

function runNode(argv) {
  return spawnSync(process.execPath, argv, { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 8 });
}

function codeOrTextValue(body) {
  const text = strip(body);
  const code = text.match(/`([^`]+)`/);
  return code ? code[1].trim() : text.split(/\s+/)[0] || "";
}

function strip(value) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
