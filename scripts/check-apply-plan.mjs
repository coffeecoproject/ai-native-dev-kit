#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json", "require-structured-evidence"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".ai-native", "version.json"));
const structuredEvidenceSchema = loadSchema(projectRoot, "schemas/artifacts/unified-apply-plan.schema.json");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/unified-apply-plan.md",
  "docs/unified-apply-plan.md",
  "templates/unified-apply-plan.md",
  "checklists/unified-apply-plan-review.md",
  "prompts/apply-plan-agent.md",
  "scripts/resolve-apply-plan.mjs",
  "scripts/check-apply-plan.mjs",
  "schemas/artifacts/unified-apply-plan.schema.json",
];
const requiredDirectories = ["apply-plans"];
const reportSections = [
  "Human Decision Summary",
  "Apply Readiness",
  "Source Evidence",
  "Planned Actions",
  "Human-Only / Blocked Actions",
  "Preconditions",
  "Backup / Rollback Plan",
  "Verification Plan",
  "Human Decisions Needed",
  "Boundary",
  "Outcome",
];
const allowedStates = new Set([
  "NO_APPLY_ACTION_READY",
  "PLAN_ONLY",
  "NEEDS_HUMAN_APPROVAL",
  "BLOCKED_BY_MISSING_EVIDENCE",
  "BLOCKED_BY_DIRTY_WORK",
  "BLOCKED_BY_RISK",
  "BLOCKED_BY_MISSING_TARGET",
]);
const allowedOutcomes = new Set(["APPLY_PLAN_RECORDED", "NEEDS_HUMAN_DECISION", "BLOCKED"]);
const forbiddenClaims = [
  /\bThis plan writes files now:\s*Yes\b/i,
  /\bThis plan authorizes apply:\s*Yes\b/i,
  /\bThis plan approves implementation:\s*Yes\b/i,
  /\bThis plan approves release or production:\s*Yes\b/i,
  /\bThis plan modifies CI or hooks now:\s*Yes\b/i,
  /\bThis plan deletes or archives files now:\s*Yes\b/i,
  /\bThis plan changes source of truth now:\s*Yes\b/i,
  /\bThis plan grants Codex permission to continue beyond scope:\s*Yes\b/i,
  /\bfiles?\s+(were\s+)?(written|applied|modified|deleted|archived|moved)\b/i,
  /\bapply\s+(is\s+)?(approved|complete|completed|authorized)\b/i,
  /\bsafe\s+to\s+apply\b/i,
  /\bCodex\s+may\s+(execute|apply|write)\b/i,
  /\bproduction\s+(is\s+)?approved\b/i,
  /\brelease\s+(is\s+)?approved\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Unified Apply Plan Check");
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
else pass("source-only 1.34 unified apply plan evidence checks skipped for target project");
emitAndExit();

function checkCoreContent() {
  const core = readResolved("core/unified-apply-plan.md");
  if (!core) return;
  for (const marker of [
    "Unified Apply Plan Governance",
    "Apply States",
    "High-Risk Action Rules",
    "The plan writes files now: No",
    "The plan authorizes apply: No",
    "The plan approves implementation: No",
    "The plan approves release or production: No",
  ]) {
    if (core.includes(marker)) pass(`unified apply plan core includes ${marker}`);
    else fail(`unified apply plan core missing ${marker}`);
  }
}

function checkPlans() {
  const files = markdownFiles("apply-plans");
  if (files.length === 0) {
    pass("unified apply plan check skipped: no apply plans");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    checkStructuredEvidence(content, label);
    for (const section of reportSections) requireSection(content, section, label);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    const scanContent = contentForForbiddenScan(content);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(scanContent)) fail(`${label} contains forbidden apply plan claim: ${pattern.source}`);
    }
    requireReadiness(content, label);
    requirePlannedActions(content, label);
    requireHumanOnlyActions(content, label);
    requireBackupRollback(content, label);
    requireVerification(content, label);
    requireBoundaryNo(content, label, "This plan writes files now");
    requireBoundaryNo(content, label, "This plan authorizes apply");
    requireBoundaryNo(content, label, "This plan approves implementation");
    requireBoundaryNo(content, label, "This plan approves release or production");
    requireBoundaryNo(content, label, "This plan modifies CI or hooks now");
    requireBoundaryNo(content, label, "This plan deletes or archives files now");
    requireBoundaryNo(content, label, "This plan changes source of truth now");
    requireBoundaryNo(content, label, "This plan grants Codex permission to continue beyond scope");
    const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
    if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
    else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
  }
}

function checkStructuredEvidence(content, label) {
  const result = validateEvidenceBlock(content, structuredEvidenceSchema, label, {
    digestField: "plan_digest",
    require: requireStructuredEvidence,
  });
  if (!result.ok) {
    for (const error of result.errors) fail(error);
    return;
  }
  if (!result.present) return;

  const evidence = result.value;
  pass(`${label} structured apply plan evidence matches schema`);
  pass(`${label} structured apply plan digest matches canonical evidence`);

  if (evidence.can_apply_now === false) pass(`${label} structured evidence states apply cannot run now`);
  else fail(`${label} structured evidence must state can_apply_now false`);
  if (evidence.can_codex_write_now === false) pass(`${label} structured evidence states Codex cannot write now`);
  else fail(`${label} structured evidence must state can_codex_write_now false`);
  if (Array.isArray(evidence.actions) && evidence.actions.every((action) => action.will_write_now === false)) {
    pass(`${label} structured actions do not write now`);
  } else {
    fail(`${label} structured actions must not write now`);
  }
  if (evidence.boundary && Object.values(evidence.boundary).every((value) => value === false)) {
    pass(`${label} structured boundary keeps apply non-authorizing`);
  } else {
    fail(`${label} structured boundary must keep all authority flags false`);
  }
}

function requireReadiness(content, label) {
  const body = sectionBody(content, "Apply Readiness");
  const states = [...body.matchAll(/\b(NO_APPLY_ACTION_READY|PLAN_ONLY|NEEDS_HUMAN_APPROVAL|BLOCKED_BY_MISSING_EVIDENCE|BLOCKED_BY_DIRTY_WORK|BLOCKED_BY_RISK|BLOCKED_BY_MISSING_TARGET)\b/g)].map((item) => item[1]);
  if (states.length === 0) fail(`${label} must include apply readiness state`);
  else if (states.every((state) => allowedStates.has(state))) pass(`${label} uses valid apply readiness state`);
  else fail(`${label} has invalid apply readiness state`);
  if (/Can apply now\?\s*\|\s*No/i.test(body)) pass(`${label} states apply cannot run now`);
  else fail(`${label} must state apply cannot run now`);
  if (/Can (AI|Codex) write now\?\s*\|\s*No/i.test(body) || /Can Codex write now:\s*No/i.test(content)) pass(`${label} states Codex cannot write now`);
  else fail(`${label} must state Codex cannot write now`);
}

function requirePlannedActions(content, label) {
  const body = sectionBody(content, "Planned Actions");
  for (const marker of ["Action type", "Target paths", "Status", "Will write now", "Approval required", "Rollback required"]) {
    if (new RegExp(marker, "i").test(body)) pass(`${label} planned actions include ${marker}`);
    else fail(`${label} planned actions missing ${marker}`);
  }
  if (/Will write now\s*\|/i.test(body) && !/\|\s*Yes\s*\|/i.test(plannedActionWriteColumn(body))) {
    pass(`${label} planned actions do not write now`);
  } else {
    fail(`${label} planned actions must not write now`);
  }
  for (const risk of ["HOOK_OR_CI_CHANGE", "PRODUCTION_CONFIG_CHANGE", "SECRET_OR_ENV_CHANGE", "DATA_OR_MIGRATION_CHANGE", "PAYMENT_OR_VALUE_TRANSFER_CHANGE", "SECURITY_PRIVACY_COMPLIANCE_CHANGE", "LEGAL_LICENSE_POLICY_CHANGE", "INDUSTRIAL_PACK_ENABLE", "BUSINESS_CODE_CHANGE"]) {
    if (!body.includes(risk)) continue;
    if (new RegExp(`${risk}.*(HUMAN_APPROVAL_REQUIRED|HUMAN_ONLY|BLOCKED)`, "is").test(body)) pass(`${label} high-risk ${risk} is not auto-applied`);
    else fail(`${label} high-risk ${risk} must be human-only, approval-required, or blocked`);
  }
}

function plannedActionWriteColumn(body) {
  const rows = markdownRows(body);
  if (rows.length === 0) return "";
  const header = rows[0].map((cell) => cell.toLowerCase());
  const index = header.findIndex((cell) => cell.includes("will write now"));
  if (index === -1) return "";
  return rows.slice(1).map((row) => `| ${row[index] || ""} |`).join("\n");
}

function requireHumanOnlyActions(content, label) {
  const body = sectionBody(content, "Human-Only / Blocked Actions");
  if (/HUMAN_APPROVAL_REQUIRED|HUMAN_ONLY|BLOCKED|NOT_APPLICABLE/i.test(body)) pass(`${label} records human-only or blocked action status`);
  else fail(`${label} must record human-only or blocked action status`);
}

function requireBackupRollback(content, label) {
  const body = sectionBody(content, "Backup / Rollback Plan");
  for (const marker of ["Backup required", "Backup path", "Rollback step", "Rollback verification"]) {
    if (new RegExp(marker, "i").test(body)) pass(`${label} backup/rollback includes ${marker}`);
    else fail(`${label} backup/rollback missing ${marker}`);
  }
}

function requireVerification(content, label) {
  const body = sectionBody(content, "Verification Plan");
  for (const marker of ["Command or method", "Required before apply", "Required after apply", "Evidence path", "Owner"]) {
    if (new RegExp(marker, "i").test(body)) pass(`${label} verification plan includes ${marker}`);
    else fail(`${label} verification plan missing ${marker}`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/unified-apply-plan-1.34-plan.md",
    "examples/1.34-unified-apply-plan/README.md",
    "examples/1.34-unified-apply-plan/apply-plans/001-existing-project.md",
    "test-fixtures/bad/bad-apply-plan-authorizes-apply/apply-plans/001-bad.md",
    "test-fixtures/bad/bad-apply-plan-writes-now/apply-plans/001-bad.md",
    "schemas/artifacts/unified-apply-plan.schema.json",
    "docs/plans/structured-evidence-schema-1.41-plan.md",
    "docs/structured-evidence-schema.md",
    "examples/1.41-structured-evidence-schema/README.md",
    "examples/1.41-structured-evidence-schema/apply-plans/001-structured-workflow-assets.md",
    "test-fixtures/bad/bad-structured-apply-plan-digest/apply-plans/001-bad.md",
    "releases/1.41.1/release-record.md",
    "releases/1.41.1/known-limitations.md",
    "releases/1.41.1/self-check-report.md",
    "releases/1.34.0/release-record.md",
    "releases/1.34.0/known-limitations.md",
    "releases/1.34.0/self-check-report.md",
    "releases/1.41.0/release-record.md",
    "releases/1.41.0/known-limitations.md",
    "releases/1.41.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`unified apply plan source evidence exists ${file}`);
    else fail(`unified apply plan source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-apply-plan.mjs", ".", "--intent", "maintain Dev Kit apply plan", "--action", "workflow-assets"]);
  if (resolver.status === 0
    && resolver.stdout.includes("Unified Apply Plan")
    && resolver.stdout.includes("This plan authorizes apply: No")
    && resolver.stdout.includes("Can Codex write now: No")) {
    pass("1.34 unified apply plan resolver prints safe plan");
  } else {
    fail(`1.34 unified apply plan resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-apply-plan.mjs", ".", "--intent", "maintain Dev Kit apply plan", "--action", "workflow-assets", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "UNIFIED_APPLY_PLAN"
        && parsed.boundary?.authorizesApply === "No"
        && parsed.boundary?.writesFilesNow === "No"
        && Array.isArray(parsed.plannedActions)
        && parsed.plannedActions.every((action) => action.willWriteNow === "No")) {
        pass("1.34 unified apply plan resolver JSON includes actions and boundaries");
      } else {
        fail(`1.34 unified apply plan resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.34 unified apply plan resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.34 unified apply plan resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const example = runNode(["scripts/check-apply-plan.mjs", "examples/1.34-unified-apply-plan"]);
  if (example.status === 0 && example.stdout.includes("Unified Apply Plan check passed")) pass("1.34 unified apply plan example passes checker");
  else fail(`1.34 unified apply plan example failed: ${example.stderr || example.stdout}`);

  const structuredExample = runNode(["scripts/check-apply-plan.mjs", "examples/1.41-structured-evidence-schema"]);
  if (structuredExample.status === 0 && structuredExample.stdout.includes("structured apply plan evidence matches schema")) {
    pass("1.41 structured apply plan example passes schema-backed checker");
  } else {
    fail(`1.41 structured apply plan example failed: ${structuredExample.stderr || structuredExample.stdout}`);
  }

  const strictStructuredExample = runNode(["scripts/check-apply-plan.mjs", "examples/1.41-structured-evidence-schema", "--require-structured-evidence"]);
  if (strictStructuredExample.status === 0 && strictStructuredExample.stdout.includes("structured apply plan evidence matches schema")) {
    pass("1.41.1 structured apply plan example passes strict checker");
  } else {
    fail(`1.41.1 strict structured apply plan example failed: ${strictStructuredExample.stderr || strictStructuredExample.stdout}`);
  }

  for (const [name, targetArgs, expected] of [
    ["authorizes apply", ["test-fixtures/bad/bad-apply-plan-authorizes-apply"], "forbidden apply plan claim"],
    ["writes now", ["test-fixtures/bad/bad-apply-plan-writes-now"], "planned actions must not write now"],
    ["structured digest", ["test-fixtures/bad/bad-structured-apply-plan-digest"], "plan_digest does not match canonical evidence digest"],
    ["strict missing structured evidence", ["examples/1.34-unified-apply-plan", "--require-structured-evidence"], "Machine-Readable Evidence is required"],
  ]) {
    const result = runNode(["scripts/check-apply-plan.mjs", ...targetArgs]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) pass(`1.34 unified apply plan rejects ${name}`);
    else fail(`1.34 unified apply plan must reject ${name}: ${output}`);
  }
}

function contentForForbiddenScan(content) {
  return String(content)
    .replace(/^- This plan writes files now: No$/gim, "")
    .replace(/^- This plan authorizes apply: No$/gim, "")
    .replace(/^- This plan approves implementation: No$/gim, "")
    .replace(/^- This plan approves release or production: No$/gim, "")
    .replace(/^- This plan modifies CI or hooks now: No$/gim, "")
    .replace(/^- This plan deletes or archives files now: No$/gim, "")
    .replace(/^- This plan changes source of truth now: No$/gim, "")
    .replace(/^- This plan grants Codex permission to continue beyond scope: No$/gim, "");
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
    console.log("Unified Apply Plan check passed.");
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

function markdownRows(section) {
  return String(section || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .filter((line) => !/^\|\s*-+/.test(line))
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length > 0);
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

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(aiNative)) return aiNative;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const aiNative = path.join(projectRoot, ".ai-native", relativePath);
  if (fs.existsSync(aiNative) && fs.statSync(aiNative).isDirectory()) return aiNative;
  return null;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/") || ".";
}

function displayAsset(relativePath, resolved) {
  const direct = path.join(projectRoot, relativePath);
  return path.resolve(resolved) === path.resolve(direct) ? relativePath : `.ai-native/${relativePath}`;
}

function runNode(nodeArgs) {
  return spawnSync(process.execPath, nodeArgs, { cwd: projectRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 8 });
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
