#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { checkTaskEntryBinding } from "./lib/task-entry-binding.mjs";
import { canonicalFileDigest, projectIdentity, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "allow-empty",
  "report",
  "require-report",
  "require-structured-evidence",
  "require-task-entry",
  "strict-task-entry",
  "require-runtime-sources",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"]);
const requireStructuredEvidence = Boolean(args["require-structured-evidence"]);
const requireTaskEntry = Boolean(args["require-task-entry"] || args["strict-task-entry"]);
const strictTaskEntry = Boolean(args["strict-task-entry"]);
const requireRuntimeSources = Boolean(args["require-runtime-sources"]);
const explicitReport = args.report ? path.resolve(projectRoot, String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/runtime-hygiene.schema.json");
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
  "core/execution-release-runtime-hygiene.md",
  "docs/execution-release-runtime-hygiene.md",
  "templates/runtime-hygiene-report.md",
  "schemas/artifacts/runtime-hygiene.schema.json",
  "checklists/runtime-hygiene-review.md",
  "prompts/runtime-hygiene-agent.md",
  "scripts/resolve-runtime-hygiene.mjs",
  "scripts/check-runtime-hygiene.mjs",
];
const requiredDirectories = ["runtime-hygiene-reports"];
const requiredSections = [
  "Human Summary",
  "Task Binding",
  "Git Context",
  "Gate Context",
  "Release Context",
  "Artifact Context",
  "Bundle Context",
  "Boundaries",
  "Required Approval",
  "Task Continuation",
  "Machine-Readable Evidence",
  "Outcome",
];
const forbiddenClaims = [
  /\b(approve|approves|approved|authorize|authorizes|authorized)\s+(commit|push|release|production)\b/i,
  /\b(force\s+push|force-push)\s*:\s*yes\b/i,
  /\b(delete|deletes|deleted)\s+(artifact|artifacts|evidence)\s*:\s*yes\b/i,
  /\bbypass(es|ed)?\s+(gate|gates|ci|pre-push)\b/i,
  /\bproduction\s+(safe|ready|approved)\b/i,
];

let failed = false;
const checks = [];

if (!outputJson) {
  console.log("# Runtime Hygiene Check");
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
emitAndExit();

function checkCoreContent() {
  const combined = [
    readResolved("core/execution-release-runtime-hygiene.md"),
    readResolved("docs/execution-release-runtime-hygiene.md"),
    readResolved("templates/runtime-hygiene-report.md"),
    readResolved("schemas/artifacts/runtime-hygiene.schema.json"),
    readResolved("scripts/resolve-runtime-hygiene.mjs"),
    readResolved("scripts/check-runtime-hygiene.mjs"),
  ].join("\n");
  if (!combined.trim()) return;
  for (const marker of [
    "Execution And Release Runtime Hygiene",
    "runtime_hygiene",
    "runtime-hygiene",
    "runtime-hygiene-check",
    "GIT_LINEAGE_DIRTY",
    "PRE_PUSH_GATE_FAILED",
    "STRUCTURE_BUDGET_EXCEEDED",
    "CI_ENVIRONMENT_FAILURE",
    "ARTIFACT_QUOTA_BLOCKED",
    "RELEASE_BUNDLE_OVERSIZED",
    "PRODUCTION_SIDE_EFFECT_UNKNOWN",
    "CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR",
    "NEEDS_RELEASE_OWNER_APPROVAL",
    "BLOCKED_BY_PRODUCTION_SIDE_EFFECT",
    "does not approve commit",
    "deletes artifacts: No",
    "force pushes: No",
    "runtime_source_trace",
    "task_entry_binding",
    "retry_policy_allowed",
    "production_side_effect_checked",
  ]) {
    if (combined.includes(marker)) pass(`runtime hygiene docs include ${marker}`);
    else fail(`runtime hygiene docs missing ${marker}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("runtime-hygiene-reports");
  if (files.length === 0) {
    if (allowEmpty) pass("runtime hygiene check skipped by explicit --allow-empty: no reports");
    else if (requireReport || explicitReport) fail("no Runtime Hygiene reports found");
    else pass("SKIPPED_NO_REPORT: no Runtime Hygiene reports found");
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`missing explicit Runtime Hygiene report ${file}`);
      continue;
    }
    checkReport(file);
  }
}

function checkReport(file) {
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const section of requiredSections) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing section ${section}`);
  }

  const scanContent = contentForForbiddenScan(content);
  for (const pattern of forbiddenClaims) {
    if (pattern.test(scanContent)) fail(`${label} contains forbidden runtime claim: ${pattern.source}`);
  }

  const result = validateEvidenceBlock(content, schema, label, {
    require: requireStructuredEvidence,
    digestField: "runtime_hygiene_digest",
  });
  if (!result.present && !requireStructuredEvidence) {
    pass(`${label} structured evidence optional and not present`);
    return;
  }
  if (!result.ok) {
    result.errors.forEach((error) => fail(error));
    return;
  }
  pass(`${label} has valid structured evidence`);
  checkStructuredEvidence(content, label, file, result.value);
}

function checkStructuredEvidence(content, label, file, evidence) {
  if (reportRefCandidates(file).includes(evidence.runtime_hygiene_ref)) pass(`${label} runtime_hygiene_ref points to this report`);
  else fail(`${label} runtime_hygiene_ref ${evidence.runtime_hygiene_ref || "<missing>"} must point to this report`);

  if (evidence.artifact_type === "runtime_hygiene") pass(`${label} artifact_type is runtime_hygiene`);
  else fail(`${label} artifact_type must be runtime_hygiene`);
  if (["1.86.0", "1.86.1", "1.93.0"].includes(evidence.schema_version)) pass(`${label} schema_version is supported`);
  else fail(`${label} schema_version must be 1.86.0, 1.86.1, or 1.93.0`);
  if (evidence.outcome === evidence.decision_state) pass(`${label} outcome matches decision_state`);
  else fail(`${label} outcome must match decision_state`);
  if (stripMarkdown(sectionBody(content, "Outcome") || "").includes(evidence.outcome)) pass(`${label} Outcome includes structured state`);
  else fail(`${label} Outcome must include structured state`);

  for (const [field, expected] of [
    ["writes_target_files", "No"],
    ["approves_commit_or_push", "No"],
    ["approves_release_or_production", "No"],
    ["bypasses_gates", "No"],
    ["deletes_artifacts", "No"],
    ["changes_production", "No"],
    ["force_pushes", "No"],
  ]) {
    if (evidence.boundaries?.[field] === expected) pass(`${label} boundary ${field} is ${expected}`);
    else fail(`${label} boundary ${field} must be ${expected}`);
  }

  if (evidence.technical_terms_required === "No") pass(`${label} technical_terms_required is No`);
  else fail(`${label} technical_terms_required must be No`);
  if (!hasTechnicalBurden(evidence.plain_user_summary)) pass(`${label} plain summary avoids raw technical burden`);
  else fail(`${label} plain summary must not require raw technical terms`);
  if (evidence.task_continuation?.task_remains_open === "Yes") pass(`${label} task remains open`);
  else fail(`${label} runtime hygiene must keep the task open`);

  checkRuntimeConsistency(label, evidence);
  checkRuntimeSourceTrace(label, evidence);
  checkTaskEntryBinding({
    content,
    evidence,
    label,
    projectRoot,
    consumer: "runtime_hygiene",
    requireTaskGovernance: requireTaskEntry,
    requireWorkQueue: requireTaskEntry,
    strictTaskConsumer: strictTaskEntry,
    pass,
    fail,
  });
}

function checkRuntimeConsistency(label, evidence) {
  const gateFailed = evidence.gate_context?.exit_code && evidence.gate_context.exit_code !== "0" && evidence.gate_context.exit_code !== "Unknown";
  if (gateFailed) {
    if (evidence.gate_context.bypass_recommended === "No") pass(`${label} gate failure does not recommend bypass`);
    else fail(`${label} gate failure must not recommend bypass`);
    if (evidence.task_continuation?.task_remains_open === "Yes") pass(`${label} gate failure keeps task open`);
    else fail(`${label} gate failure must keep task open`);
    if (evidence.decision_state !== "CAN_CONTINUE_AUTOMATICALLY") pass(`${label} gate failure is not auto-completed`);
    else fail(`${label} gate failure must not use CAN_CONTINUE_AUTOMATICALLY`);
  }

  if (evidence.runtime_class === "PRE_PUSH_GATE_FAILED" || evidence.runtime_class === "STRUCTURE_BUDGET_EXCEEDED" || evidence.runtime_class === "CI_CODE_FAILURE") {
    requireDecision(label, evidence, "CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR", `${evidence.runtime_class} decision`);
  }
  if (evidence.runtime_class === "CI_ENVIRONMENT_FAILURE") {
    if (evidence.decision_state === "CAN_CONTINUE_AUTOMATICALLY") {
      if (evidence.ci_context?.retry_policy_allowed === "Yes") pass(`${label} CI retry policy allows automatic retry`);
      else fail(`${label} CI_ENVIRONMENT_FAILURE cannot continue automatically without retry policy evidence`);
      if (evidence.ci_context?.production_side_effect_checked === "Yes") pass(`${label} CI retry has production side-effect check`);
      else fail(`${label} CI_ENVIRONMENT_FAILURE cannot continue automatically without production side-effect check`);
    } else {
      pass(`${label} CI environment failure is not automatically continued without complete safety proof`);
    }
  }
  if (evidence.runtime_class === "RELEASE_PREFLIGHT_READY") {
    requireDecision(label, evidence, "CAN_CONTINUE_TO_RELEASE_REVIEW", "release preflight ready decision");
    if (evidence.operation === "release") pass(`${label} release preflight ready operation is release`);
    else fail(`${label} RELEASE_PREFLIGHT_READY requires release operation`);
    if (evidence.gate_context?.exit_code === "0") pass(`${label} release preflight gate passed`);
    else fail(`${label} RELEASE_PREFLIGHT_READY requires gate exit code 0`);
    if (evidence.release_context?.production_touched === "No" && new Set(["PREFLIGHT_ONLY", "BUNDLE_CREATED"]).has(evidence.release_context?.lane_state)) {
      pass(`${label} release preflight stayed before production`);
    } else {
      fail(`${label} RELEASE_PREFLIGHT_READY requires a pre-production lane with production untouched`);
    }
    if (evidence.git_context?.current_task_commit_isolated === "Yes" && evidence.git_context?.force_push_required === "No") {
      pass(`${label} release preflight uses an isolated non-force-push revision`);
    } else {
      fail(`${label} RELEASE_PREFLIGHT_READY requires isolated task revision and no force push`);
    }
    checkReleaseTrustBinding(label, evidence);
  }
  if (evidence.runtime_class === "RELEASE_PREFLIGHT_FAILED" && evidence.decision_state === "CAN_CONTINUE_AUTOMATICALLY") {
    fail(`${label} failed release preflight must not continue automatically`);
  }
  if (evidence.runtime_class === "ARTIFACT_QUOTA_BLOCKED") {
    requireDecision(label, evidence, "NEEDS_RELEASE_OWNER_APPROVAL", "artifact quota decision");
    requireApproval(label, evidence, "Artifact quota cleanup");
    if (evidence.artifact_context?.artifact_deletion_irreversible === "Yes") pass(`${label} artifact deletion is marked irreversible`);
    else fail(`${label} artifact quota must mark deletion irreversible`);
  }
  if (evidence.runtime_class === "RELEASE_BUNDLE_OVERSIZED") {
    requireDecision(label, evidence, "NEEDS_PLAIN_USER_APPROVAL", "bundle bloat decision");
    if (evidence.bundle_context?.evidence_removed === "No") pass(`${label} bundle hygiene preserves evidence`);
    else fail(`${label} bundle hygiene must not remove evidence`);
    if (evidence.bundle_context?.bundle_slimming_recommended === "Yes") pass(`${label} bundle slimming is recommended`);
    else fail(`${label} oversized bundle must recommend slimming`);
  }
  if (evidence.runtime_class === "GIT_LINEAGE_DIRTY" || evidence.runtime_class === "COMMIT_SCOPE_MIXED") {
    requireDecision(label, evidence, "BLOCKED_BY_UNCLEAR_TASK_SCOPE", `${evidence.runtime_class} decision`);
    if (evidence.git_context?.current_task_commit_isolated !== "Yes") pass(`${label} unclear task scope is not treated as isolated`);
    else fail(`${label} unclear task scope must not claim isolated current task`);
  }

  if (evidence.git_context?.force_push_required === "Yes") {
    if (evidence.required_approval?.approval_required === "Yes") pass(`${label} force push requirement requires approval`);
    else fail(`${label} force push requirement must require approval`);
    if (evidence.decision_state !== "CAN_CONTINUE_AUTOMATICALLY") pass(`${label} force push requirement is not automatic`);
    else fail(`${label} force push requirement must not continue automatically`);
  }

  const productionTouched = evidence.release_context?.production_touched;
  const lane = evidence.release_context?.lane_state;
  if (productionTouched === "Unknown" || lane === "UNKNOWN") {
    requireDecision(label, evidence, "BLOCKED_BY_PRODUCTION_SIDE_EFFECT", "unknown production side effect decision");
  }
  if (productionTouched === "Yes" || lane === "PROD_DEPLOY_STARTED" || lane === "PROD_DEPLOY_DONE") {
    requireDecision(label, evidence, "BLOCKED_BY_PRODUCTION_SIDE_EFFECT", "production side effect decision");
    if (evidence.release_context?.release_id_reusable !== "Yes") pass(`${label} release id is not reused after production side effect`);
    else fail(`${label} release id must not be reusable after production side effect`);
  }

  if (evidence.artifact_context?.artifact_deletion_required === "Yes") {
    if (evidence.required_approval?.approval_required === "Yes") pass(`${label} artifact deletion requires approval`);
    else fail(`${label} artifact deletion must require approval`);
  }
  if (evidence.artifact_context?.preserve_evidence_artifacts === "Yes") pass(`${label} evidence artifacts are preserved`);
  else fail(`${label} preserve_evidence_artifacts must be Yes`);
}

function checkRuntimeSourceTrace(label, evidence) {
  const sources = Array.isArray(evidence.runtime_source_trace) ? evidence.runtime_source_trace : [];
  if (sources.length === 0) {
    if (requireRuntimeSources) fail(`${label} requires runtime_source_trace`);
    else pass(`${label} runtime source trace is optional in compatibility mode`);
    return;
  }
  const sourceByKind = new Map();
  for (const source of sources) {
    sourceByKind.set(source.source_kind, source);
    if (source.source_ref && source.source_ref !== "N/A") pass(`${label} source ${source.source_kind} has ref`);
    else if (source.source_present === "Yes") fail(`${label} present source ${source.source_kind} requires a source_ref`);
    if (/^sha256:[a-f0-9]{64}$/.test(String(source.source_digest || ""))) pass(`${label} source ${source.source_kind} has sha256 digest`);
    else fail(`${label} source ${source.source_kind} requires sha256 digest`);
    if (requireRuntimeSources && source.source_present === "Yes") {
      const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", source.source_ref || "");
      if (!resolved.ok) {
        fail(`${label} source ${source.source_kind} is unsafe or unresolved: ${resolved.error}`);
      } else if (canonicalFileDigest(resolved.file) === source.source_digest) {
        pass(`${label} source ${source.source_kind} digest matches current file`);
      } else {
        fail(`${label} source ${source.source_kind} digest does not match current file`);
      }
    }
  }
  if (!requireRuntimeSources) return;
  for (const kind of requiredSourceKindsFor(evidence.runtime_class)) {
    const source = sourceByKind.get(kind);
    if (source?.source_present === "Yes") pass(`${label} required runtime source present: ${kind}`);
    else fail(`${label} requires runtime source for ${kind}`);
  }
}

function requiredSourceKindsFor(runtimeClass) {
  if (runtimeClass === "CI_ENVIRONMENT_FAILURE" || runtimeClass === "CI_CODE_FAILURE") return ["ci_log"];
  if (runtimeClass === "PRE_PUSH_GATE_FAILED" || runtimeClass === "STRUCTURE_BUDGET_EXCEEDED") return ["gate_output"];
  if (runtimeClass === "ARTIFACT_QUOTA_BLOCKED") return ["artifact_error"];
  if (runtimeClass === "RELEASE_BUNDLE_OVERSIZED") return ["bundle_summary"];
  if (runtimeClass === "RELEASE_PREFLIGHT_READY" || runtimeClass === "RELEASE_PREFLIGHT_FAILED" || runtimeClass === "PRODUCTION_SIDE_EFFECT_UNKNOWN" || runtimeClass === "PRODUCTION_SIDE_EFFECT_PRESENT") return ["release_event"];
  return [];
}

function checkReleaseTrustBinding(label, evidence) {
  const binding = evidence.release_trust_binding || {};
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", binding.release_candidate_ref || "");
  if (!resolved.ok) {
    fail(`${label} release candidate is unsafe or unresolved: ${resolved.error}`);
    return;
  }
  if (canonicalFileDigest(resolved.file) === binding.release_candidate_digest) pass(`${label} release candidate digest matches`);
  else fail(`${label} release candidate digest does not match current file`);
  if (projectIdentity(projectRoot).revision === binding.source_revision) pass(`${label} release candidate source revision matches current project`);
  else fail(`${label} release candidate source revision does not match current project`);
}

function requireDecision(label, evidence, expected, context) {
  if (evidence.decision_state === expected) pass(`${label} ${context} is ${expected}`);
  else fail(`${label} ${context} must be ${expected}`);
}

function requireApproval(label, evidence, context) {
  if (evidence.required_approval?.approval_required === "Yes") pass(`${label} ${context} requires approval`);
  else fail(`${label} ${context} must require approval`);
}

function hasTechnicalBurden(summary) {
  return /\b(ahead\/behind|merge base|rev-list|rebase -i|sha256|exit code|stack trace)\b/i.test(String(summary || ""));
}

function contentForForbiddenScan(content) {
  return content
    .split(/^## Machine-Readable Evidence\s*$/im)[0]
    .replace(/It does not approve commit, push, release, production, artifact deletion, gate bypass, or force push\./gi, "")
    .replace(/does not approve (commit|push|release|production)/gi, "")
    .replace(/This report approves commit or push: No/gi, "")
    .replace(/This report approves release or production: No/gi, "")
    .replace(/This report bypasses gates: No/gi, "")
    .replace(/This report deletes artifacts: No/gi, "")
    .replace(/This report force pushes: No/gi, "");
}

function markdownFiles(directory) {
  const root = path.join(projectRoot, directory);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return [];
  const files = [];
  walk(root, files);
  return files.filter((file) => file.endsWith(".md")).sort();
}

function walk(directory, files) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".gitkeep") continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function resolveAsset(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isFile()) return managed;
  return null;
}

function resolveDirectory(relativePath) {
  const direct = path.join(projectRoot, relativePath);
  if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct;
  const managed = path.join(projectRoot, ".intentos", relativePath);
  if (fs.existsSync(managed) && fs.statSync(managed).isDirectory()) return managed;
  return null;
}

function readResolved(relativePath) {
  const file = resolveAsset(relativePath);
  return file ? fs.readFileSync(file, "utf8") : "";
}

function reportRefCandidates(file) {
  const relative = rel(file);
  return [
    relative,
    `file:${relative}`,
    path.basename(file),
    `runtime-hygiene-reports/${path.basename(file)}`,
  ];
}

function displayAsset(expected, resolved) {
  return rel(resolved) === expected ? expected : `${expected} (${rel(resolved)})`;
}

function rel(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
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
  if (outputJson) console.log(JSON.stringify({ ok: !failed, checks }, null, 2));
  if (failed) process.exit(1);
  if (!outputJson) console.log("\nRuntime hygiene check passed.");
}
