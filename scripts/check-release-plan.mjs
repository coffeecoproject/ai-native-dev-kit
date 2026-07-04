#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody, stripMarkdown, splitMarkdownRow } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "require-structured-evidence"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const isSourceRepo = fs.existsSync(path.join(projectRoot, "dev-kit-manifest.json"))
  && fs.existsSync(path.join(projectRoot, "core", "workflow.md"));
const shouldRequireAssets = isSourceRepo
  || fs.existsSync(path.join(projectRoot, ".ai-native", "dev-kit-manifest.json"))
  || fs.existsSync(path.join(projectRoot, ".ai-native", "version.json"));
const schema = loadSchema(projectRoot, "schemas/artifacts/release-plan.schema.json");

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const requiredAssets = [
  "core/release-core-model.md",
  "docs/release-core-model.md",
  "templates/release-plan.md",
  "schemas/artifacts/release-plan.schema.json",
  "checklists/release-plan-review.md",
  "prompts/release-plan-agent.md",
  "scripts/resolve-release-plan.mjs",
  "scripts/check-release-plan.mjs",
];
const requiredDirectories = ["release-plans"];
const requiredSections = [
  "Human Summary",
  "Release Decision View",
  "Release Plan Trace",
  "Source System Inputs",
  "Existing Project Decision Summary",
  "Existing Project Rule Comparison",
  "Codex May Do",
  "Human Must Decide",
  "External System Actions",
  "Evidence Requirements",
  "Rollback / Monitoring / Smoke",
  "Conflicts",
  "Boundaries",
  "Outcome",
];
const allowedOutcomes = new Set([
  "NEEDS_RELEASE_SHAPE",
  "NEEDS_PLATFORM_RECIPE",
  "NEEDS_LAUNCH_REVIEW",
  "NEEDS_STRUCTURED_APPROVAL",
  "READY_FOR_HANDOFF_REVIEW",
  "READY_FOR_LOCAL_ASSIST",
  "READY_FOR_PREVIEW_HANDOFF",
  "READY_FOR_STAGING_HANDOFF",
  "READY_FOR_PRODUCTION_HANDOFF",
  "BLOCKED_BY_HUMAN_DECISION",
  "BLOCKED_BY_EXTERNAL_SYSTEM",
  "BLOCKED_BY_HIGH_RISK_SURFACE",
  "BLOCKED_BY_PROJECT_AUTHORITY",
  "RELEASE_PLAN_RECORDED",
]);
const allowedRecommendations = new Set([
  "KEEP_EXISTING",
  "KEEP_EXISTING_AS_STRICTER",
  "ADOPT_INTENTOS_GAP",
  "MERGE_AFTER_REVIEW",
  "GAP_SUGGESTION",
  "NEEDS_HUMAN_DECISION",
  "BLOCKED_BY_PROJECT_AUTHORITY",
]);
const forbiddenClaims = [
  /\brelease approved\b/i,
  /\bproduction approved\b/i,
  /\bapproved for production\b/i,
  /\bCodex will deploy\b/i,
  /\bCodex deploys\b/i,
  /\bCodex will publish\b/i,
  /\bCodex will submit\b/i,
  /\bautomatically deploy(s|ed)?\b/i,
  /\bautomatically publish(es|ed)?\b/i,
  /\bRelease Plan is the source of truth\b/i,
  /\bRelease Plan replaces\b/i,
  /\btrace controls execution\b/i,
  /\bstate drives execution\b/i,
  /\bignore existing rules\b/i,
  /\bskip existing rule comparison\b/i,
  /\bThis plan approves release:\s*Yes\b/i,
  /\bThis plan approves production:\s*Yes\b/i,
  /\bThis plan writes target-project files:\s*Yes\b/i,
  /\bThis plan changes command behavior:\s*Yes\b/i,
  /\bThis plan lets trace control execution:\s*Yes\b/i,
  /\bThis plan lets summary state drive execution:\s*Yes\b/i,
  /\bThis plan treats IntentOS Operating Mode as write permission:\s*Yes\b/i,
  /\bThis plan makes Codex the release owner:\s*Yes\b/i,
  /\bThis plan replaces existing governance:\s*Yes\b/i,
  /\bThis plan modifies CI or hooks:\s*Yes\b/i,
  /\bThis plan asks for or stores secrets:\s*Yes\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Release Plan Check");
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
checkReleasePlans();

if (isSourceRepo) checkSourceEvidence();
else pass("source-only 1.67 release plan evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/release-core-model.md"),
    readResolved("docs/release-core-model.md"),
    readResolved("templates/release-plan.md"),
    readResolved("schemas/artifacts/release-plan.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Release Core Model",
    "pure view model",
    "Source Systems Stay Authoritative",
    "IntentOS Operating Mode",
    "Project Asset Migration Depth",
    "Existing Rule Comparison Contract",
    "trace_controls_execution",
    "summary_state_drives_execution",
    "release_plan_evidence",
  ]) {
    if (combined.includes(marker)) pass(`release plan docs include ${marker}`);
    else fail(`release plan docs missing ${marker}`);
  }
}

function checkReleasePlans() {
  const files = markdownFiles("release-plans");
  if (files.length === 0) {
    pass("release plan check skipped: no Release Plans");
    return;
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const label = rel(file);
    if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
    for (const pattern of forbiddenClaims) {
      if (pattern.test(content)) fail(`${label} contains forbidden release plan claim: ${pattern.source}`);
    }
    for (const section of requiredSections) requireSection(content, section, label);
    if (requireStructuredEvidence) requireSection(content, "Machine-Readable Evidence", label);
    checkSummary(content, label);
    checkTrace(content, label);
    checkExistingProject(content, label);
    checkBoundaries(content, label);
    checkOutcome(content, label);
    checkStructuredEvidence(content, label);
  }
}

function checkSummary(content, label) {
  const summary = sectionBody(content, "Human Summary") || "";
  const state = tableValue(summary, "Release Plan State");
  const summaryKind = tableValue(summary, "Summary State Kind");
  const pureView = tableValue(summary, "Release Plan Is Pure View");
  const operatingMode = tableValue(summary, "IntentOS Operating Mode");
  const migrationDepth = tableValue(summary, "Project Asset Migration Depth");
  if (allowedOutcomes.has(state)) pass(`${label} records valid Release Plan State`);
  else fail(`${label} invalid Release Plan State: ${state || "<empty>"}`);
  if (summaryKind === "SUMMARY_ONLY") pass(`${label} records SUMMARY_ONLY state kind`);
  else fail(`${label} must record Summary State Kind as SUMMARY_ONLY`);
  if (pureView === "Yes") pass(`${label} records pure view summary`);
  else fail(`${label} must state Release Plan Is Pure View = Yes`);
  if (operatingMode === "ACTIVE") pass(`${label} records IntentOS Operating Mode active`);
  else fail(`${label} must record IntentOS Operating Mode ACTIVE`);
  if (migrationDepth && !/^FULL_INTENTOS_NATIVE_CANDIDATE$/i.test(migrationDepth)) {
    pass(`${label} avoids maximizing migration depth by default`);
  } else if (/EXISTING_GOVERNED_PROJECT|production|governed/i.test(content)) {
    fail(`${label} governed existing project must not default to FULL_INTENTOS_NATIVE_CANDIDATE`);
  } else {
    pass(`${label} migration depth recorded`);
  }
}

function checkTrace(content, label) {
  const body = sectionBody(content, "Release Plan Trace") || "";
  const rows = tableRows(body);
  if (rows.length >= 3) pass(`${label} records release plan trace`);
  else fail(`${label} must record at least three trace rows`);
  for (const row of rows) {
    const cols = splitRow(row);
    const source = stripMarkdown(cols[0] || "");
    const authority = stripMarkdown(cols[4] || "");
    if (source) pass(`${label} trace row records source system ${source}`);
    else fail(`${label} trace row missing source system`);
    if (authority === "No") pass(`${label} trace row has no control authority`);
    else fail(`${label} trace row must set Control Authority to No`);
  }
}

function checkExistingProject(content, label) {
  const summary = sectionBody(content, "Existing Project Decision Summary") || "";
  const operatingMode = tableValue(summary, "IntentOS Operating Mode");
  const writePermission = tableValue(summary, "Operating Mode Grants Write Permission");
  const migrationDepth = tableValue(summary, "Project Asset Migration Depth");
  const ruleComparisonRequired = tableValue(summary, "Rule Comparison Required");
  if (operatingMode === "ACTIVE") pass(`${label} activates IntentOS Operating Mode`);
  else fail(`${label} must activate IntentOS Operating Mode`);
  if (writePermission === "No") pass(`${label} separates operating mode from write permission`);
  else fail(`${label} must state Operating Mode Grants Write Permission = No`);
  if (ruleComparisonRequired === "Yes") pass(`${label} requires rule comparison`);
  else fail(`${label} must require rule comparison for existing project handling`);
  if (/EXISTING_GOVERNED_PROJECT|production|governed/i.test(summary) && migrationDepth === "FULL_INTENTOS_NATIVE_CANDIDATE") {
    fail(`${label} must not maximize asset migration for governed existing project`);
  }

  const matrix = sectionBody(content, "Existing Project Rule Comparison") || "";
  const rows = tableRows(matrix);
  if (rows.length > 0) pass(`${label} records existing project rule comparison`);
  else fail(`${label} must include existing project rule comparison rows`);
  for (const row of rows) {
    const cols = splitRow(row);
    const recommendation = stripMarkdown(cols[3] || "");
    const humanDecision = stripMarkdown(cols[5] || "");
    if (allowedRecommendations.has(recommendation)) pass(`${label} rule comparison recommendation ${recommendation} is valid`);
    else fail(`${label} invalid rule comparison recommendation: ${recommendation || "<empty>"}`);
    if (humanDecision === "Yes") pass(`${label} rule comparison requires human decision`);
    else fail(`${label} rule comparison must require human decision`);
    if (/Release|production|CI|hook|secret|payment|migration|security|privacy|compliance|legal|tax|finance|HR|customer|permission/i.test(row)
      && /ADOPT_INTENTOS_GAP/.test(recommendation)) {
      fail(`${label} protected or release surfaces cannot directly adopt IntentOS gap`);
    }
  }
}

function checkBoundaries(content, label) {
  for (const boundary of [
    "This plan approves release",
    "This plan approves production",
    "This plan writes target-project files",
    "This plan changes command behavior",
    "This plan lets trace control execution",
    "This plan lets summary state drive execution",
    "This plan treats IntentOS Operating Mode as write permission",
    "This plan makes Codex the release owner",
    "This plan replaces existing governance",
    "This plan modifies CI or hooks",
    "This plan asks for or stores secrets",
  ]) {
    requireBoundaryNo(content, label, boundary);
  }
}

function checkOutcome(content, label) {
  const outcome = codeOrTextValue(sectionBody(content, "Outcome"));
  if (allowedOutcomes.has(outcome)) pass(`${label} has valid Outcome`);
  else fail(`${label} has invalid Outcome: ${outcome || "<empty>"}`);
}

function checkStructuredEvidence(content, label) {
  const block = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
  });
  if (!block.ok) {
    for (const error of block.errors) fail(error);
    return;
  }
  if (!block.present) {
    pass(`${label} structured evidence optional`);
    return;
  }
  const evidence = block.value;
  const boundary = evidence.release_plan_boundary || {};
  const mode = evidence.existing_project_intentos_mode || {};
  for (const [field, expected] of Object.entries({
    pure_view_model: true,
    approves_release: false,
    approves_production: false,
    writes_target_files: false,
    changes_command_behavior: false,
    trace_controls_execution: false,
    summary_state_drives_execution: false,
    operating_mode_grants_write_permission: false,
    codex_release_owner: false,
    replaces_existing_governance: false,
    modifies_ci_or_hooks: false,
    asks_for_or_stores_secrets: false,
  })) {
    if (boundary[field] === expected) pass(`${label} structured boundary ${field} is ${expected}`);
    else fail(`${label} structured boundary ${field} must be ${expected}`);
  }
  if (mode.operating_mode_active === true && mode.operating_mode_grants_write_permission === false) {
    pass(`${label} structured evidence separates IntentOS mode from write permission`);
  } else {
    fail(`${label} structured evidence must separate IntentOS mode from write permission`);
  }
  if (mode.rule_comparison_required === true && Array.isArray(evidence.existing_rule_comparison) && evidence.existing_rule_comparison.length > 0) {
    pass(`${label} structured evidence requires and records rule comparison`);
  } else {
    fail(`${label} structured evidence must require and record rule comparison`);
  }
  for (const trace of evidence.trace || []) {
    if (trace.control_authority === false) pass(`${label} structured trace has no control authority`);
    else fail(`${label} structured trace must not have control authority`);
  }
  if (/GOVERNED|PRODUCTION/i.test(content) && mode.migration_depth === "FULL_INTENTOS_NATIVE_CANDIDATE") {
    fail(`${label} structured evidence must not maximize governed existing project migration`);
  }
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/release-core-model-consolidation-1.67-plan.md",
    "core/release-core-model.md",
    "docs/release-core-model.md",
    "templates/release-plan.md",
    "schemas/artifacts/release-plan.schema.json",
    "checklists/release-plan-review.md",
    "prompts/release-plan-agent.md",
    "release-plans/.gitkeep",
    "scripts/resolve-release-plan.mjs",
    "scripts/check-release-plan.mjs",
    "examples/1.67-release-core-model/web-preview/release-plans/001-web-preview.md",
    "examples/1.67-release-core-model/governed-existing-project-readonly/release-plans/001-governed-existing-project.md",
    "test-fixtures/bad/bad-release-plan-approves-production/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-missing-trace/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-state-drives-execution/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-operating-mode-writes-files/release-plans/001-bad.md",
    "test-fixtures/bad/bad-release-plan-ignores-existing-rules/release-plans/001-bad.md",
    "releases/1.67.0/release-record.md",
    "releases/1.67.0/known-limitations.md",
    "releases/1.67.0/self-check-report.md",
  ]) {
    if (exists(file)) pass(`1.67 release plan source evidence exists ${file}`);
    else fail(`1.67 release plan source evidence missing ${file}`);
  }

  const resolver = runNode(["scripts/resolve-release-plan.mjs", ".", "--intent", "help me launch"]);
  if (resolver.status === 0
    && resolver.stdout.includes("# Release Plan")
    && resolver.stdout.includes("## Release Plan Trace")
    && resolver.stdout.includes("## Existing Project Rule Comparison")
    && resolver.stdout.includes("This plan approves release: No")
    && resolver.stdout.includes("This plan treats IntentOS Operating Mode as write permission: No")) {
    pass("1.67 release plan resolver prints safe pure-view plan");
  } else {
    fail(`1.67 release plan resolver failed: ${resolver.stderr || resolver.stdout}`);
  }

  const resolverJson = runNode(["scripts/resolve-release-plan.mjs", ".", "--intent", "help me launch", "--json"]);
  if (resolverJson.status === 0) {
    try {
      const parsed = JSON.parse(resolverJson.stdout);
      if (parsed.reportType === "RELEASE_PLAN"
        && parsed.humanSummary?.summaryStateKind === "SUMMARY_ONLY"
        && parsed.humanSummary?.intentosOperatingMode === "ACTIVE"
        && parsed.boundaries?.approvesRelease === "No"
        && parsed.boundaries?.treatsIntentosOperatingModeAsWritePermission === "No"
        && parsed.releasePlanTrace?.every((item) => item.controlAuthority === "No")
        && parsed.existingProjectRuleComparison?.length > 0) {
        pass("1.67 release plan resolver JSON includes pure view, trace, and rule comparison");
      } else {
        fail(`1.67 release plan resolver JSON missing expected fields: ${resolverJson.stdout}`);
      }
    } catch (error) {
      fail(`1.67 release plan resolver JSON invalid: ${error.message}`);
    }
  } else {
    fail(`1.67 release plan resolver JSON failed: ${resolverJson.stderr || resolverJson.stdout}`);
  }

  const exampleTargets = [
    "examples/1.67-release-core-model/web-preview",
    "examples/1.67-release-core-model/governed-existing-project-readonly",
  ];
  for (const target of exampleTargets) {
    const result = runNode(["scripts/check-release-plan.mjs", target, "--require-structured-evidence"]);
    if (result.status === 0 && result.stdout.includes("Release Plan check passed")) {
      pass(`1.67 release plan example passes checker ${target}`);
    } else {
      fail(`1.67 release plan example failed ${target}: ${result.stderr || result.stdout}`);
    }
  }

  for (const [name, target, expected] of [
    ["approves production", "test-fixtures/bad/bad-release-plan-approves-production", "forbidden release plan claim"],
    ["missing trace", "test-fixtures/bad/bad-release-plan-missing-trace", "at least three trace rows"],
    ["state drives execution", "test-fixtures/bad/bad-release-plan-state-drives-execution", "forbidden release plan claim"],
    ["operating mode writes files", "test-fixtures/bad/bad-release-plan-operating-mode-writes-files", "forbidden release plan claim"],
    ["ignores existing rules", "test-fixtures/bad/bad-release-plan-ignores-existing-rules", "forbidden release plan claim"],
  ]) {
    const result = runNode(["scripts/check-release-plan.mjs", target]);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 && output.includes(expected)) {
      pass(`1.67 release plan rejects ${name}`);
    } else {
      fail(`1.67 release plan must reject ${name}: ${output}`);
    }
  }
}

function requireSection(content, section, label) {
  if (sectionBody(content, section)) pass(`${label} includes ${section}`);
  else fail(`${label} missing section ${section}`);
}

function requireBoundaryNo(content, label, boundary) {
  const pattern = new RegExp(`-\\s*${escapeRegExp(boundary)}:\\s*No\\b`, "i");
  if (pattern.test(content)) pass(`${label} boundary is No: ${boundary}`);
  else fail(`${label} must state boundary as No: ${boundary}`);
}

function tableRows(body) {
  return String(body || "")
    .split(/\r?\n/)
    .filter((line) => /^\|/.test(line) && !/---/.test(line) && !/\|\s*(Field|Decision|Source System|System|Surface|Action|Evidence|Conflict)\s*\|/i.test(line));
}

function splitRow(row) {
  return splitMarkdownRow(row);
}

function tableValue(content, label) {
  const escaped = escapeRegExp(label);
  const regex = new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i");
  const match = String(content || "").match(regex);
  return match ? stripCode(match[1].trim()) : "";
}

function codeOrTextValue(body) {
  const lines = String(body || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const first = lines.find((line) => !line.startsWith("|"));
  return stripCode(first || "");
}

function stripCode(value) {
  return stripMarkdown(value).replace(/^`|`$/g, "").trim();
}

function markdownFiles(dir) {
  const base = path.join(projectRoot, dir);
  if (!fs.existsSync(base)) return [];
  const out = [];
  walk(base, out);
  return out.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
}

function resolveAsset(file) {
  if (fs.existsSync(path.join(projectRoot, file))) return file;
  if (fs.existsSync(path.join(projectRoot, ".ai-native", file))) return `.ai-native/${file}`;
  return "";
}

function resolveDirectory(dir) {
  if (fs.existsSync(path.join(projectRoot, dir))) return dir;
  if (fs.existsSync(path.join(projectRoot, ".ai-native", dir))) return `.ai-native/${dir}`;
  return "";
}

function readResolved(file) {
  const resolved = resolveAsset(file);
  return resolved ? fs.readFileSync(path.join(projectRoot, resolved), "utf8") : "";
}

function displayAsset(file, resolved) {
  return file === resolved ? file : `${file} via ${resolved}`;
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function rel(fullPath) {
  return path.relative(projectRoot, fullPath).replaceAll(path.sep, "/");
}

function runNode(nodeArgs) {
  return spawnSync(process.execPath, nodeArgs, { cwd: projectRoot, encoding: "utf8" });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  } else if (failed) {
    console.error("");
    console.error("Release Plan check failed.");
  } else {
    console.log("");
    console.log("Release Plan check passed.");
  }
  process.exit(failed ? 1 : 0);
}
