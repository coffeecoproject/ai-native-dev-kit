#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "allow-empty",
  "report",
  "require-report",
  "require-structured-evidence",
  "require-current-completion",
  "strict-source-binding",
  "require-platform-recipe",
  "require-ready",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const requireCurrentCompletion = Boolean(args["require-current-completion"] || args["require-ready"]);
const strictSourceBinding = Boolean(args["strict-source-binding"] || args["require-ready"]);
const requirePlatformRecipe = Boolean(args["require-platform-recipe"]);
const requireReady = Boolean(args["require-ready"]);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/release-evidence-gate.schema.json");
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
  "core/release-evidence-gate.md",
  "docs/release-evidence-gate.md",
  "templates/release-evidence-gate-report.md",
  "schemas/artifacts/release-evidence-gate.schema.json",
  "checklists/release-evidence-gate-review.md",
  "prompts/release-evidence-gate-agent.md",
  "scripts/resolve-release-evidence-gate.mjs",
  "scripts/check-release-evidence-gate.mjs",
];
const requiredDirectories = ["release-evidence-gate-reports", "release-candidates"];
const requiredSections = [
  "Human Summary",
  "Release Scope",
  "Release Target Requirements",
  "Source Chain",
  "Owner And Approval",
  "Environment Readiness",
  "Runtime And Rollback",
  "Data Migration And Cost",
  "Existing Project Release Rules",
  "Missing Evidence",
  "Boundaries",
  "Machine-Readable Evidence",
  "Outcome",
  "Next Step",
];
const readyStates = new Set(["READY_FOR_INTERNAL_TRIAL_REVIEW", "READY_FOR_RELEASE_OWNER_REVIEW"]);
const productionLikeTargets = new Set(["production_review", "app_store_review", "mini_program_review"]);
const forbiddenClaims = [
  /\brelease approved\b/i,
  /\bapproved for production\b/i,
  /\bsafe to launch\b/i,
  /\bcan go live\b/i,
  /\bready to deploy production\b/i,
  /\bThis report approves release or production:\s*Yes\b/i,
  /\bThis report executes deployment:\s*Yes\b/i,
  /\bThis report executes migration:\s*Yes\b/i,
  /\bThis report uses or records secrets:\s*Yes\b/i,
  /\bThis report submits to app store or mini program:\s*Yes\b/i,
  /\bThis report changes DNS, payment, provider, or CI:\s*Yes\b/i,
  /批准(发布|生产|上线)/,
  /可以(正式)?上线/,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Release Evidence Gate Check");
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
else pass("source-only 1.80 release evidence gate evidence checks skipped for target project");

emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/release-evidence-gate.md"),
    readResolved("docs/release-evidence-gate.md"),
    readResolved("templates/release-evidence-gate-report.md"),
    readResolved("schemas/artifacts/release-evidence-gate.schema.json"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Release Evidence Gate",
    "release_evidence_gate",
    "release candidate",
    "human release owner",
    "not release approval",
    "User Delivery Console is not a source authority",
  ]) {
    if (combined.includes(marker)) pass(`release evidence gate docs include ${marker}`);
    else fail(`release evidence gate docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("release-evidence-gate-reports");
  if (files.length === 0) {
    if (allowEmpty) pass("release evidence gate check skipped by explicit --allow-empty: no reports");
    else if (requireReport || explicitReport) fail("no Release Evidence Gate reports found; run `release-evidence --out <relative-report-path>` first");
    else pass("SKIPPED_NO_REPORT: no Release Evidence Gate reports found; no release-review claim made");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Release Evidence Gate report ${file}`);
      continue;
    }
    checkReport(file);
  }
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const pattern of forbiddenClaims) {
    if (pattern.test(content)) fail(`${label} contains forbidden release evidence claim: ${pattern.source}`);
  }
  for (const section of requiredSections) requireSection(content, section, label);
  for (const boundary of [
    "This report writes target files",
    "This report approves release or production",
    "This report executes deployment",
    "This report executes migration",
    "This report uses or records secrets",
    "This report submits to app store or mini program",
    "This report changes DNS, payment, provider, or CI",
    "This report proves real-user stability",
  ]) {
    requireBoundaryNo(content, label, boundary);
  }

  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
    digestField: "release_evidence_digest",
  });
  if (!result.present && !requireStructuredEvidence) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  const evidence = result.value;
  pass(`${label} has valid structured evidence`);
  checkSummary(content, label, evidence);
  checkStructuredEvidence(label, evidence);
}

function checkSummary(content, label, evidence) {
  const summary = sectionBody(content, "Human Summary") || "";
  const state = tableValue(summary, "Gate State");
  const canHandoff = tableValue(summary, "Can Handoff To Release Owner");
  const approved = tableValue(summary, "Release Or Production Approved");
  if (state === evidence.gate_state) pass(`${label} summary gate state matches structured evidence`);
  else fail(`${label} summary gate state ${state || "<empty>"} does not match ${evidence.gate_state}`);
  if (canHandoff === evidence.can_handoff_to_release_owner) pass(`${label} summary handoff flag matches structured evidence`);
  else fail(`${label} summary handoff flag ${canHandoff || "<empty>"} does not match ${evidence.can_handoff_to_release_owner}`);
  if (approved === "No" && evidence.release_or_production_approved === "No") pass(`${label} summary keeps release approval No`);
  else fail(`${label} release approval must stay No`);
}

function checkStructuredEvidence(label, evidence) {
  if (evidence.release_or_production_approved === "No") pass(`${label} does not approve release or production`);
  else fail(`${label} must not approve release or production`);
  if (evidence.boundaries?.approves_release_or_production === "No") pass(`${label} boundary does not approve release`);
  else fail(`${label} boundary must not approve release`);

  const requirements = evidence.release_target_requirements?.[0]?.required_evidence_ids || [];
  if (requirements.length > 0) pass(`${label} records target-specific requirements`);
  else fail(`${label} must record target-specific requirements`);
  if (evidence.release_target_requirements?.[0]?.target === evidence.release_target) pass(`${label} target requirements match release target`);
  else fail(`${label} target requirements must match release target`);

  const scope = evidence.release_scope || {};
  if (isConcrete(scope.release_candidate_ref)) pass(`${label} records release candidate ref`);
  else fail(`${label} must record release candidate ref`);
  if (Array.isArray(scope.included_completion_evidence_refs)) pass(`${label} records included Completion Evidence refs`);
  else fail(`${label} must record included Completion Evidence refs`);

  const sourceByName = new Map((evidence.source_chain || []).map((source) => [source.name, source]));
  const completion = sourceByName.get("completion_evidence");
  if (completion?.status === "RECORDED") pass(`${label} includes recorded Completion Evidence source`);
  else if (requireCurrentCompletion || readyStates.has(evidence.gate_state)) fail(`${label} requires recorded Completion Evidence source`);
  else pass(`${label} Completion Evidence can be missing only for blocked reports`);

  if (requireCurrentCompletion || readyStates.has(evidence.gate_state)) {
    if ((scope.included_completion_evidence_refs || []).length > 0) pass(`${label} release scope includes Completion Evidence refs`);
    else fail(`${label} ready or strict release evidence requires included Completion Evidence refs`);
    if (completion?.current_release_match === "Yes") pass(`${label} Completion Evidence matches current release`);
    else fail(`${label} Completion Evidence must match current release`);
  }

  if (strictSourceBinding || readyStates.has(evidence.gate_state)) {
    for (const source of evidence.source_chain || []) {
      if (source.status !== "RECORDED") continue;
      const resolved = resolveArtifact(String(source.ref || ""));
      if (resolved) pass(`${label} source ${source.name} resolves`);
      else fail(`${label} source ${source.name} does not resolve: ${source.ref || "<missing>"}`);
      if (source.digest && /^sha256:[a-f0-9]{64}$/.test(source.digest)) pass(`${label} source ${source.name} records digest`);
      else fail(`${label} source ${source.name} must record sha256 digest`);
      if (source.current_release_match === "Yes" || source.current_release_match === "N/A") pass(`${label} source ${source.name} current release match is explicit`);
      else fail(`${label} source ${source.name} current release match must be Yes or N/A`);
    }
  }

  if (requirePlatformRecipe || ["app_store_review", "mini_program_review"].includes(evidence.release_target)) {
    const recipe = sourceByName.get("platform_release_recipe");
    if (recipe?.status === "RECORDED") pass(`${label} platform release recipe is recorded`);
    else fail(`${label} ${evidence.release_target} requires recorded platform release recipe`);
  }

  if (readyStates.has(evidence.gate_state)) {
    if (evidence.can_handoff_to_release_owner === "Yes") pass(`${label} ready state can hand off to release owner`);
    else fail(`${label} ready state must set can_handoff_to_release_owner Yes`);
    if ((evidence.missing_evidence || []).length === 0) pass(`${label} ready state has no missing evidence`);
    else fail(`${label} ready state cannot have missing evidence: ${evidence.missing_evidence.join(", ")}`);
  } else if (evidence.can_handoff_to_release_owner === "Yes") {
    fail(`${label} cannot hand off unless gate state is ready-for-review`);
  }

  if (requireReady && !readyStates.has(evidence.gate_state)) {
    fail(`${label} --require-ready requires a ready-for-review state`);
  }

  if (productionLikeTargets.has(evidence.release_target)) {
    checkProductionLike(label, evidence);
  }

  if (evidence.runtime_readiness?.runtime_smoke_user_note_only === "Yes") {
    fail(`${label} runtime smoke cannot be a user note only`);
  } else {
    pass(`${label} runtime smoke is not user-note-only`);
  }

  const strongerIgnored = (evidence.existing_release_rule_mapping || []).some((item) => item.mapping_state === "PROJECT_STRONGER_RULE" && (evidence.missing_evidence || []).length === 0);
  if (!strongerIgnored) pass(`${label} existing project stronger SOP is not silently ignored`);
  else fail(`${label} existing project stronger SOP must be mapped as missing or owner-needed evidence`);
}

function checkProductionLike(label, evidence) {
  const ready = readyStates.has(evidence.gate_state) || requireReady;
  const scope = evidence.release_scope || {};
  if (scope.dirty_worktree_status === "clean") pass(`${label} production-like target has clean source`);
  else if (ready) fail(`${label} production-like target requires clean source revision`);
  else pass(`${label} blocked production-like report records non-clean source as missing evidence`);
  if (scope.source_revision && scope.source_revision !== "unknown") pass(`${label} production-like target has known source revision`);
  else if (ready) fail(`${label} production-like target requires known source revision`);
  else pass(`${label} blocked production-like report records unknown source as missing evidence`);
  if (isConcrete(evidence.rollback_readiness?.rollback_ref) && evidence.rollback_readiness?.blocked_by_missing_rollback === "No") pass(`${label} production-like target has rollback evidence`);
  else if (ready) fail(`${label} production-like target requires rollback evidence`);
  else pass(`${label} blocked production-like report records missing rollback`);
  if (isConcrete(evidence.monitoring_readiness?.monitoring_ref) && isConcrete(evidence.monitoring_readiness?.incident_owner_ref)) pass(`${label} production-like target has monitoring and incident owner`);
  else if (ready) fail(`${label} production-like target requires monitoring and incident owner`);
  else pass(`${label} blocked production-like report records missing monitoring or incident owner`);
  if (evidence.environment_readiness?.secrets_values_recorded === "No") pass(`${label} does not record secret values`);
  else fail(`${label} must not record secret values`);
  if (evidence.data_migration_readiness?.codex_may_execute_migration === "No") pass(`${label} Codex may not execute migration`);
  else fail(`${label} Codex must not execute migration`);
  if (evidence.data_migration_readiness?.migration_required === "Unknown" && ready) fail(`${label} production-like target cannot leave migration requirement unknown`);
  else if (evidence.data_migration_readiness?.migration_required === "Unknown") pass(`${label} blocked production-like report records unknown migration decision`);
  else pass(`${label} production-like target has migration decision`);
}

function checkSourceEvidence() {
  for (const file of [
    "docs/plans/release-evidence-gate-1.80-plan.md",
    "core/release-evidence-gate.md",
    "docs/release-evidence-gate.md",
    "templates/release-evidence-gate-report.md",
    "schemas/artifacts/release-evidence-gate.schema.json",
    "examples/1.80-release-evidence-gate/README.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/release-evidence-gate-reports/001-web-preview.md",
    "examples/1.80-release-evidence-gate/mini-program-review-handoff/release-evidence-gate-reports/001-mini-program-review.md",
    "examples/1.80-release-evidence-gate/admin-production-review-blocked/release-evidence-gate-reports/001-admin-production-blocked.md",
    "test-fixtures/bad/bad-release-evidence-release-approved-claim/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-no-release-owner/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-missing-rollback-production/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-user-note-treated-as-smoke/release-evidence-gate-reports/001-bad.md",
    "releases/1.80.0/release-record.md",
    "releases/1.80.0/known-limitations.md",
    "releases/1.80.0/self-check-report.md",
  ]) {
    if (fs.existsSync(path.join(projectRoot, file))) pass(`source evidence exists: ${file}`);
    else fail(`missing source evidence: ${file}`);
  }
}

function requireSection(content, section, label) {
  if (sectionBody(content, section) !== null) pass(`${label} includes ${section}`);
  else fail(`${label} missing section ${section}`);
}

function requireBoundaryNo(content, label, boundary) {
  const body = sectionBody(content, "Boundaries") || "";
  const value = tableValue(body, boundary);
  if (value === "No") pass(`${label} boundary ${boundary} is No`);
  else fail(`${label} boundary ${boundary} must be No`);
}

function tableValue(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(body || "").match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i"));
  return match ? match[1].trim().replace(/^`|`$/g, "") : "";
}

function isConcrete(value) {
  return Boolean(value) && !/^(missing|unknown|n\/a|not_applicable|not provided|out_of_scope)$/i.test(String(value).trim());
}

function markdownFiles(dir) {
  const root = resolveDirectory(dir);
  if (!root) return [];
  const results = [];
  walk(root, results);
  return results.filter((file) => file.endsWith(".md")).sort();
}

function walk(dir, results) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else results.push(full);
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct)) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed)) return managed;
  return "";
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isDirectory()) return managed;
  return "";
}

function resolveArtifact(reference) {
  const value = String(reference || "").replace(/^artifact:/, "");
  if (!value || value === "missing" || value === "out_of_scope") return "";
  if (path.isAbsolute(value)) return "";
  const candidates = [
    path.join(projectRoot, value),
    path.join(projectRoot, ".intentos", value),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return "";
}

function resolveReportPath(value) {
  const candidate = path.resolve(projectRoot, value);
  const relative = path.relative(projectRoot, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error(`FAIL --report must stay inside target project: ${value}`);
    process.exit(1);
  }
  return candidate;
}

function readResolved(relativePath) {
  const resolved = resolveAsset(relativePath);
  return resolved ? fs.readFileSync(resolved, "utf8") : "";
}

function displayAsset(file, resolved) {
  return path.relative(projectRoot, resolved) || file;
}

function rel(file) {
  return path.relative(projectRoot, file) || ".";
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
      ok: !failed,
      check: "release-evidence-gate",
      projectRoot,
      checks,
    }, null, 2));
  }
  process.exit(failed ? 1 : 0);
}
