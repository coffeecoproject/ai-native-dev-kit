#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { sectionBody } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { extractMachineReadableEvidence, loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import { releaseEvidenceRequirementsFor } from "./lib/release-evidence-requirements.mjs";

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
const strictRequested = requireReport || requireStructuredEvidence || requireCurrentCompletion
  || strictSourceBinding || requirePlatformRecipe || requireReady || Boolean(args.report);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/release-evidence-gate.schema.json");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
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
  "Completion Evidence Set",
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
    if (allowEmpty && !strictRequested) pass("release evidence gate check skipped by explicit --allow-empty: no reports");
    else if (strictRequested) fail("no Release Evidence Gate reports found; run `release-evidence --out <relative-report-path>` first");
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
  checkMarkdownJsonConsistency(content, label, evidence);
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

function checkMarkdownJsonConsistency(content, label, evidence) {
  const scope = sectionBody(content, "Release Scope") || "";
  expectTableValue(scope, "Source Revision", evidence.release_scope?.source_revision, label, "Release Scope");
  expectTableValue(scope, "Dirty Worktree Status", evidence.release_scope?.dirty_worktree_status, label, "Release Scope");
  expectTableValue(scope, "Build Artifact", evidence.release_scope?.build_artifact_ref, label, "Release Scope");
  expectTableValue(scope, "Build Artifact Digest", evidence.release_scope?.build_artifact_digest, label, "Release Scope");
  expectTableValue(scope, "Completion Evidence Count", String((evidence.release_scope?.included_completion_evidence_refs || []).length), label, "Release Scope");

  const requirements = markdownListItems(sectionBody(content, "Release Target Requirements") || "");
  expectListValue(requirements, evidence.release_target_requirements?.[0]?.required_evidence_ids || [], label, "Release Target Requirements");

  const sourceRows = tableRows(sectionBody(content, "Source Chain") || "");
  const sources = evidence.source_chain || [];
  if (sourceRows.length === sources.length) pass(`${label} Source Chain row count matches structured evidence`);
  else fail(`${label} Source Chain row count ${sourceRows.length} does not match ${sources.length}`);
  for (let index = 0; index < Math.min(sourceRows.length, sources.length); index += 1) {
    const row = sourceRows[index];
    const source = sources[index];
    expectCell(row[0], source.name, label, `Source Chain row ${index + 1} source`);
    expectCell(row[1], source.status, label, `Source Chain row ${index + 1} status`);
    expectCell(row[2], source.ref || "not provided", label, `Source Chain row ${index + 1} ref`);
    expectCell(row[3], source.current_release_match, label, `Source Chain row ${index + 1} current release match`);
    expectCell(row[4], source.source_outcome || "not provided", label, `Source Chain row ${index + 1} outcome`);
  }

  const completionRows = tableRows(sectionBody(content, "Completion Evidence Set") || "")
    .filter((row) => !/^ref$/i.test(row[0] || ""));
  const completionSet = evidence.completion_evidence_set || [];
  if (completionRows.length === completionSet.length) pass(`${label} Completion Evidence Set row count matches structured evidence`);
  else fail(`${label} Completion Evidence Set row count ${completionRows.length} does not match ${completionSet.length}`);
  for (let index = 0; index < Math.min(completionRows.length, completionSet.length); index += 1) {
    const row = completionRows[index];
    const item = completionSet[index];
    expectCell(row[0], item.ref, label, `Completion Evidence Set row ${index + 1} ref`);
    expectCell(row[1], item.status, label, `Completion Evidence Set row ${index + 1} status`);
    expectCell(row[2], item.task_ref || "not provided", label, `Completion Evidence Set row ${index + 1} task ref`);
    expectCell(row[3], item.strict_check, label, `Completion Evidence Set row ${index + 1} strict check`);
    expectCell(row[4], item.current_release_match, label, `Completion Evidence Set row ${index + 1} current release match`);
    expectCell(row[5], item.task_ref_in_release_scope, label, `Completion Evidence Set row ${index + 1} task in release scope`);
  }

  const owner = sectionBody(content, "Owner And Approval") || "";
  expectTableValue(owner, "Release Owner Ref", evidence.owner_readiness?.release_owner_ref, label, "Owner And Approval");
  expectTableValue(owner, "Release Owner Review Ref", evidence.owner_readiness?.release_owner_review_ref, label, "Owner And Approval");
  expectTableValue(owner, "Risk Owner Ref", evidence.owner_readiness?.risk_owner_ref, label, "Owner And Approval");
  expectTableValue(owner, "Environment Owner Ref", evidence.owner_readiness?.environment_owner_ref, label, "Owner And Approval");
  expectTableValue(owner, "Release Approval Ref", evidence.owner_readiness?.release_approval_ref, label, "Owner And Approval");
  expectTableValue(owner, "Release Approval State", evidence.owner_readiness?.release_approval_state, label, "Owner And Approval");
  expectTableValue(owner, "Release Approval", evidence.release_or_production_approved, label, "Owner And Approval");
  expectTableValue(owner, "Owner Decisions", (evidence.owner_decisions || []).join("; "), label, "Owner And Approval");

  const environment = sectionBody(content, "Environment Readiness") || "";
  expectTableValue(environment, "Target Environment", evidence.environment_readiness?.target_environment, label, "Environment Readiness");
  expectTableValue(environment, "Config Owner", evidence.environment_readiness?.config_owner, label, "Environment Readiness");
  expectTableValue(environment, "Secrets Required", evidence.environment_readiness?.secrets_required, label, "Environment Readiness");
  expectTableValue(environment, "Secret Values Recorded", evidence.environment_readiness?.secrets_values_recorded, label, "Environment Readiness");
  expectTableValue(environment, "DNS Or Callback Changes Required", evidence.environment_readiness?.dns_or_callback_changes_required, label, "Environment Readiness");
  expectTableValue(environment, "Blocked By Environment Config", evidence.environment_readiness?.blocked_by_environment_config, label, "Environment Readiness");

  const runtime = sectionBody(content, "Runtime And Rollback") || "";
  expectTableValue(runtime, "Runtime Smoke Ref", evidence.runtime_readiness?.runtime_smoke_ref, label, "Runtime And Rollback");
  expectTableValue(runtime, "Runtime Smoke Digest", evidence.runtime_readiness?.runtime_smoke_digest, label, "Runtime And Rollback");
  expectTableValue(runtime, "Runtime Smoke User Note Only", evidence.runtime_readiness?.runtime_smoke_user_note_only, label, "Runtime And Rollback");
  expectTableValue(runtime, "Rollback Ref", evidence.rollback_readiness?.rollback_ref, label, "Runtime And Rollback");
  expectTableValue(runtime, "Rollback Digest", evidence.rollback_readiness?.rollback_digest, label, "Runtime And Rollback");
  expectTableValue(runtime, "Rollback Window", evidence.rollback_readiness?.rollback_window, label, "Runtime And Rollback");
  expectTableValue(runtime, "Monitoring Ref", evidence.monitoring_readiness?.monitoring_ref, label, "Runtime And Rollback");
  expectTableValue(runtime, "Monitoring Digest", evidence.monitoring_readiness?.monitoring_digest, label, "Runtime And Rollback");
  expectTableValue(runtime, "Incident Owner Ref", evidence.monitoring_readiness?.incident_owner_ref, label, "Runtime And Rollback");

  const migration = sectionBody(content, "Data Migration And Cost") || "";
  expectTableValue(migration, "Migration Required", evidence.data_migration_readiness?.migration_required, label, "Data Migration And Cost");
  expectTableValue(migration, "Migration Plan Ref", evidence.data_migration_readiness?.migration_plan_ref, label, "Data Migration And Cost");
  expectTableValue(migration, "Codex May Execute Migration", evidence.data_migration_readiness?.codex_may_execute_migration, label, "Data Migration And Cost");
  expectTableValue(migration, "Cost Owner Ref", evidence.cost_quota_readiness?.cost_owner_ref, label, "Data Migration And Cost");
  expectTableValue(migration, "Blocked By Unknown Quota", evidence.cost_quota_readiness?.blocked_by_unknown_quota, label, "Data Migration And Cost");

  const missing = markdownListItems(sectionBody(content, "Missing Evidence") || "");
  const expectedMissing = evidence.missing_evidence?.length ? evidence.missing_evidence : ["None."];
  expectListValue(missing, expectedMissing, label, "Missing Evidence");
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
  const trustedRequirements = releaseEvidenceRequirementsFor(evidence.release_target).required_evidence_ids;
  if (sameStringSet(requirements, trustedRequirements)) pass(`${label} target requirements match trusted IntentOS matrix`);
  else fail(`${label} target requirements do not match trusted IntentOS matrix`);

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
  if (completion?.status === "RECORDED" && completion.current_release_match === "Yes") {
    if ((scope.included_completion_evidence_refs || []).includes(completion.ref)) pass(`${label} Completion Evidence ref is included in release scope`);
    else fail(`${label} Completion Evidence source marked current release but not included in release scope: ${completion.ref}`);
  }

  checkCompletionEvidenceSet(label, evidence);

  if (strictSourceBinding || readyStates.has(evidence.gate_state)) {
    for (const source of evidence.source_chain || []) {
      if (source.status !== "RECORDED") continue;
      const resolved = resolveArtifact(String(source.ref || ""));
      if (resolved) pass(`${label} source ${source.name} resolves`);
      else fail(`${label} source ${source.name} does not resolve: ${source.ref || "<missing>"}`);
      if (source.digest && /^sha256:[a-f0-9]{64}$/.test(source.digest)) pass(`${label} source ${source.name} records digest`);
      else fail(`${label} source ${source.name} must record sha256 digest`);
      if (resolved && source.digest && /^sha256:[a-f0-9]{64}$/.test(source.digest)) {
        const actual = fileDigest(resolved);
        if (source.digest === actual) pass(`${label} source ${source.name} digest matches resolved artifact`);
        else fail(`${label} source ${source.name} digest ${source.digest} does not match resolved artifact ${actual}`);
      }
      if (source.current_release_match === "Yes" || source.current_release_match === "N/A") pass(`${label} source ${source.name} current release match is explicit`);
      else fail(`${label} source ${source.name} current release match must be Yes or N/A`);
    }
  }

  if (strictSourceBinding || readyStates.has(evidence.gate_state) || requireReady) {
    checkRequiredEvidenceArtifacts(label, evidence, new Set(requirements));
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
  checkOwnerReadiness(label, evidence, new Set(requirements));

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

function checkOwnerReadiness(label, evidence, requirements) {
  const owner = evidence.owner_readiness || {};
  const ready = readyStates.has(evidence.gate_state) || requireReady;
  const missing = new Set(evidence.missing_evidence || []);
  if (owner.release_or_production_approved === "No") pass(`${label} owner readiness does not approve release`);
  else fail(`${label} owner readiness must not approve release`);
  if (requirements.has("release-owner")) {
    if (isConcrete(owner.release_owner_ref)) pass(`${label} release owner ref is concrete`);
    else if (!ready && missing.has("release-owner")) pass(`${label} blocked report records missing release owner ref`);
    else fail(`${label} required release owner ref must be concrete`);
  }
  if (productionLikeTargets.has(evidence.release_target)) {
    if (isConcrete(owner.risk_owner_ref)) pass(`${label} production-like target has concrete risk owner ref`);
    else if (!ready && missing.has("risk-owner")) pass(`${label} blocked production-like report records missing risk owner ref`);
    else fail(`${label} production-like target requires concrete risk owner ref`);
    if (isConcrete(owner.environment_owner_ref)) pass(`${label} production-like target has concrete environment owner ref`);
    else if (!ready && missing.has("environment-owner")) pass(`${label} blocked production-like report records missing environment owner ref`);
    else fail(`${label} production-like target requires concrete environment owner ref`);
  } else {
    pass(`${label} risk/environment owner refs are not required for non-production-like target`);
  }
  if (["out_of_scope", "pending", "human_decision_recorded", "invalid"].includes(owner.release_approval_state)) {
    pass(`${label} release approval state is structured`);
  } else {
    fail(`${label} release approval state must be structured`);
  }
  const approvalRef = String(owner.release_approval_ref || "");
  const allowedApprovalRef = approvalRef === "out_of_scope" || approvalRef === "pending" || approvalRef.startsWith("human-decision:");
  if (allowedApprovalRef && owner.release_approval_state !== "invalid") pass(`${label} release approval ref is non-authorizing`);
  else fail(`${label} release approval ref must be out_of_scope, pending, or human-decision:* without approving release`);
}

function checkRequiredEvidenceArtifacts(label, evidence, requirements) {
  const scope = evidence.release_scope || {};
  if (requirements.has("build-or-preview-evidence")) {
    resolveRequiredArtifact(label, "build-or-preview-evidence", scope.build_artifact_ref, scope.build_artifact_digest);
  }
  if (requirements.has("runtime-smoke")) {
    resolveRequiredArtifact(label, "runtime-smoke", evidence.runtime_readiness?.runtime_smoke_ref, evidence.runtime_readiness?.runtime_smoke_digest);
  }
  if (requirements.has("rollback")) {
    resolveRequiredArtifact(label, "rollback", evidence.rollback_readiness?.rollback_ref, evidence.rollback_readiness?.rollback_digest);
  }
  if (requirements.has("monitoring")) {
    resolveRequiredArtifact(label, "monitoring", evidence.monitoring_readiness?.monitoring_ref, evidence.monitoring_readiness?.monitoring_digest);
  }
  if (requirements.has("release-handoff-pack")) {
    requireRecordedSourceArtifact(label, evidence, "release_handoff_pack");
  }
  if (requirements.has("platform-recipe")) {
    requireRecordedSourceArtifact(label, evidence, "platform_release_recipe");
  }
}

function checkCompletionEvidenceSet(label, evidence) {
  const scopeRefs = evidence.release_scope?.included_completion_evidence_refs || [];
  const taskRefs = evidence.release_scope?.included_task_refs || [];
  const set = evidence.completion_evidence_set || [];
  const mustStrictCheck = requireCurrentCompletion || readyStates.has(evidence.gate_state) || strictSourceBinding || requireReady;
  if (Array.isArray(set)) pass(`${label} records Completion Evidence set`);
  else {
    fail(`${label} must record Completion Evidence set`);
    return;
  }
  if (set.length === scopeRefs.length) pass(`${label} Completion Evidence set count matches release scope`);
  else fail(`${label} Completion Evidence set count ${set.length} does not match release scope count ${scopeRefs.length}`);
  const seen = new Set();
  for (const item of set) {
    seen.add(item.ref);
    if (scopeRefs.includes(item.ref)) pass(`${label} Completion Evidence set ref is included in release scope: ${item.ref}`);
    else fail(`${label} Completion Evidence set ref is not included in release scope: ${item.ref}`);
    if (item.current_release_match === "Yes") pass(`${label} Completion Evidence set current release match is Yes: ${item.ref}`);
    else fail(`${label} Completion Evidence set current release match must be Yes: ${item.ref}`);
    const resolved = resolveArtifact(String(item.ref || ""));
    if (resolved) pass(`${label} Completion Evidence set ref resolves: ${item.ref}`);
    else {
      fail(`${label} Completion Evidence set ref does not resolve: ${item.ref || "<missing>"}`);
      continue;
    }
    if (/^sha256:[a-f0-9]{64}$/.test(String(item.digest || ""))) pass(`${label} Completion Evidence set records digest: ${item.ref}`);
    else fail(`${label} Completion Evidence set must record sha256 digest: ${item.ref}`);
    if (item.digest === fileDigest(resolved)) pass(`${label} Completion Evidence set digest matches resolved artifact: ${item.ref}`);
    else fail(`${label} Completion Evidence set digest does not match resolved artifact: ${item.ref}`);
    const content = fs.readFileSync(resolved, "utf8");
    const extracted = extractMachineReadableEvidence(content);
    if (extracted?.ok) {
      const completionEvidence = extracted.value;
      if (item.task_ref === completionEvidence.task_ref) pass(`${label} Completion Evidence set task ref matches artifact: ${item.ref}`);
      else fail(`${label} Completion Evidence set task ref ${item.task_ref || "<empty>"} does not match artifact task ${completionEvidence.task_ref}`);
      if (item.intent_digest === completionEvidence.intent_digest) pass(`${label} Completion Evidence set intent digest matches artifact: ${item.ref}`);
      else fail(`${label} Completion Evidence set intent digest does not match artifact: ${item.ref}`);
      if (item.completion_state === completionEvidence.completion_state) pass(`${label} Completion Evidence set state matches artifact: ${item.ref}`);
      else fail(`${label} Completion Evidence set state does not match artifact: ${item.ref}`);
      if (item.can_claim_complete === completionEvidence.can_claim_complete) pass(`${label} Completion Evidence set claim flag matches artifact: ${item.ref}`);
      else fail(`${label} Completion Evidence set claim flag does not match artifact: ${item.ref}`);
      if (taskRefs.includes(completionEvidence.task_ref)) pass(`${label} Completion Evidence task is in release scope: ${completionEvidence.task_ref}`);
      else fail(`${label} Completion Evidence task must be included in release scope: ${completionEvidence.task_ref}`);
      if (item.task_ref_in_release_scope === "Yes") pass(`${label} Completion Evidence set records task in release scope: ${item.ref}`);
      else fail(`${label} Completion Evidence set must record task in release scope: ${item.ref}`);
    } else {
      fail(`${label} Completion Evidence set artifact must contain machine-readable evidence: ${item.ref}`);
    }
    if (mustStrictCheck) {
      if (item.strict_check === "PASS") pass(`${label} Completion Evidence set records strict check PASS: ${item.ref}`);
      else fail(`${label} Completion Evidence set must record strict check PASS for ready/strict release evidence: ${item.ref}`);
      checkCompletionRefStrict(label, item.ref, `Completion Evidence set ${item.ref}`);
    }
  }
  for (const ref of scopeRefs) {
    if (seen.has(ref)) pass(`${label} release scope Completion Evidence has set entry: ${ref}`);
    else fail(`${label} release scope Completion Evidence missing set entry: ${ref}`);
  }
}

function requireRecordedSourceArtifact(label, evidence, sourceName) {
  const source = (evidence.source_chain || []).find((item) => item.name === sourceName);
  if (source?.status !== "RECORDED") {
    fail(`${label} required source ${sourceName} must be recorded`);
    return;
  }
  const resolved = resolveArtifact(String(source.ref || ""));
  if (resolved) pass(`${label} required source ${sourceName} resolves`);
  else fail(`${label} required source ${sourceName} does not resolve: ${source.ref || "<missing>"}`);
  if (resolved && /^sha256:[a-f0-9]{64}$/.test(String(source.digest || ""))) {
    const actual = fileDigest(resolved);
    if (source.digest === actual) pass(`${label} required source ${sourceName} digest matches resolved artifact`);
    else fail(`${label} required source ${sourceName} digest ${source.digest} does not match resolved artifact ${actual}`);
  } else {
    fail(`${label} required source ${sourceName} must record sha256 digest`);
  }
}

function resolveRequiredArtifact(label, evidenceId, reference, digest = "") {
  if (!isConcrete(reference)) {
    fail(`${label} required evidence ${evidenceId} must record artifact ref`);
    return "";
  }
  const resolved = resolveArtifact(String(reference));
  if (resolved) pass(`${label} required evidence ${evidenceId} resolves`);
  else {
    fail(`${label} required evidence ${evidenceId} does not resolve: ${reference}`);
    return "";
  }
  if (digest) {
    if (!/^sha256:[a-f0-9]{64}$/.test(String(digest))) {
      fail(`${label} required evidence ${evidenceId} must record sha256 digest`);
      return resolved;
    }
    const actual = fileDigest(resolved);
    if (digest === actual) pass(`${label} required evidence ${evidenceId} digest matches resolved artifact`);
    else fail(`${label} required evidence ${evidenceId} digest ${digest} does not match resolved artifact ${actual}`);
  }
  return resolved;
}

function checkCompletionEvidenceStrict(label, completion) {
  if (!completion?.ref) {
    fail(`${label} --require-current-completion requires Completion Evidence ref`);
    return;
  }
  const resolved = resolveArtifact(String(completion.ref));
  if (!resolved) {
    fail(`${label} --require-current-completion could not resolve Completion Evidence: ${completion.ref}`);
    return;
  }
  const report = path.relative(realProjectRoot(), resolved);
  if (report.startsWith("..") || path.isAbsolute(report)) {
    fail(`${label} Completion Evidence report must stay inside target project`);
    return;
  }
  const completionChecker = path.join(scriptDir, "check-completion-evidence.mjs");
  const result = spawnSync(process.execPath, [
    completionChecker,
    projectRoot,
    "--report",
    report,
    "--require-structured-evidence",
    "--require-source-refs",
    "--require-ready",
  ], { encoding: "utf8" });
  if (result.status === 0) pass(`${label} Completion Evidence strict checker passed`);
  else fail(`${label} Completion Evidence strict checker failed: ${firstUsefulLine(result.stderr || result.stdout)}`);
}

function checkCompletionRefStrict(label, ref, context) {
  const resolved = resolveArtifact(String(ref || ""));
  if (!resolved) {
    fail(`${label} ${context} could not resolve Completion Evidence: ${ref || "<missing>"}`);
    return;
  }
  const report = path.relative(realProjectRoot(), resolved);
  if (report.startsWith("..") || path.isAbsolute(report)) {
    fail(`${label} ${context} report must stay inside target project`);
    return;
  }
  const completionChecker = path.join(scriptDir, "check-completion-evidence.mjs");
  const result = spawnSync(process.execPath, [
    completionChecker,
    projectRoot,
    "--report",
    report,
    "--require-structured-evidence",
    "--require-source-refs",
    "--require-ready",
  ], { encoding: "utf8" });
  if (result.status === 0) pass(`${label} ${context} strict checker passed`);
  else fail(`${label} ${context} strict checker failed: ${firstUsefulLine(result.stderr || result.stdout)}`);
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
    "examples/1.80-release-evidence-gate/web-preview-handoff/completion-evidence-reports/001-web-preview-completion.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/business-rule-closures/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/verification-plans/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/test-evidence-reports/001-service-time.md",
    "examples/1.80-release-evidence-gate/web-preview-handoff/execution-assurance-reports/001-service-time.md",
    "examples/1.80-release-evidence-gate/mini-program-review-handoff/release-evidence-gate-reports/001-mini-program-review.md",
    "examples/1.80-release-evidence-gate/mini-program-review-handoff/completion-evidence-reports/001-mini-program-completion.md",
    "examples/1.80-release-evidence-gate/admin-production-review-blocked/release-evidence-gate-reports/001-admin-production-blocked.md",
    "test-fixtures/bad/bad-release-evidence-release-approved-claim/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-no-release-owner/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-missing-rollback-production/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-user-note-treated-as-smoke/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-source-digest-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-runtime-smoke-unresolved/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-build-artifact-digest-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-runtime-smoke-digest-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-markdown-json-mismatch/release-evidence-gate-reports/001-bad.md",
    "test-fixtures/bad/bad-release-evidence-completion-evidence-strict-check-fails/release-evidence-gate-reports/001-bad.md",
    "releases/1.80.0/release-record.md",
    "releases/1.80.0/known-limitations.md",
    "releases/1.80.0/self-check-report.md",
    "releases/1.80.1/release-record.md",
    "releases/1.80.1/known-limitations.md",
    "releases/1.80.1/self-check-report.md",
    "releases/1.80.2/release-record.md",
    "releases/1.80.2/known-limitations.md",
    "releases/1.80.2/self-check-report.md",
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

function tableRows(body) {
  return String(body || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)) && !/^source$/i.test(cells[0] || ""));
}

function markdownListItems(body) {
  return String(body || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

function expectTableValue(body, field, expected, label, section) {
  const actual = tableValue(body, field);
  expectCell(actual, expected, label, `${section} ${field}`);
}

function expectListValue(actual, expected, label, section) {
  const actualText = (actual || []).join("\n");
  const expectedText = (expected || []).join("\n");
  if (actualText === expectedText) pass(`${label} ${section} matches structured evidence`);
  else fail(`${label} ${section} ${JSON.stringify(actual || [])} does not match ${JSON.stringify(expected || [])}`);
}

function expectCell(actual, expected, label, field) {
  const normalizedActual = normalizeMarkdownValue(actual);
  const normalizedExpected = normalizeMarkdownValue(expected);
  if (normalizedActual === normalizedExpected) pass(`${label} ${field} matches structured evidence`);
  else fail(`${label} ${field} ${normalizedActual || "<empty>"} does not match ${normalizedExpected || "<empty>"}`);
}

function normalizeMarkdownValue(value) {
  return String(value ?? "").trim().replace(/^`|`$/g, "");
}

function isConcrete(value) {
  return Boolean(value) && !/^(missing|unknown|n\/a|not_applicable|not provided|out_of_scope)$/i.test(String(value).trim());
}

function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}

function firstUsefulLine(output) {
  return String(output || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) || "no output";
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
  const value = String(reference || "").trim();
  if (!value || value === "missing" || value === "out_of_scope") return "";
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", value);
  return resolved.ok ? resolved.file : "";
}

function realProjectRoot() {
  return fs.existsSync(projectRoot) ? fs.realpathSync(projectRoot) : projectRoot;
}

function sameStringSet(left, right) {
  return JSON.stringify([...new Set(left)].sort()) === JSON.stringify([...new Set(right)].sort());
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
  } else if (!failed) {
    console.log("");
    console.log("Release Evidence Gate check passed.");
  }
  process.exit(failed ? 1 : 0);
}
