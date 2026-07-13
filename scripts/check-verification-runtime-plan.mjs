#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { extractMachineReadableEvidence, loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import {
  canonicalFileDigest,
  isFileEvidenceRef,
  resolveAuthoritativeEvidenceReference,
  validateEvidenceAuthorityBinding,
} from "./lib/evidence-authority.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath, resolveUnderRoot } from "./lib/path-safety.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import { planSemanticErrors } from "./lib/verification-runtime-trust.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"] || args.report);
const requireStructured = Boolean(args["require-structured-evidence"] || args.report);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/verification-runtime-plan.schema.json");
const isManaged = fs.existsSync(path.join(projectRoot, "intentos-manifest.json")) || fs.existsSync(path.join(projectRoot, ".intentos/version.json"));
let failed = false;
const checks = [];

if (unknown.length) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}
if (!outputJson) console.log("# Verification Runtime Plan Check\n");

if (isManaged) checkAssets();
checkReports();
emit();

function checkAssets() {
  for (const relative of [
    "core/verification-runtime-trust.md",
    "core/verification-runtime-adapters.md",
    "docs/verification-runtime-trust.md",
    "docs/verification-runtime-adapters.md",
    "templates/verification-runtime-plan.md",
    "templates/verification-run-manifest.md",
    "schemas/artifacts/verification-runtime-plan.schema.json",
    "schemas/artifacts/verification-run-manifest.schema.json",
    "checklists/verification-runtime-trust-review.md",
    "checklists/verification-runtime-adapter-review.md",
    "scripts/lib/verification-runtime-adapters.mjs",
    "scripts/lib/verification-runtime-trust.mjs",
    "scripts/resolve-verification-runtime-plan.mjs",
    "scripts/check-verification-runtime-plan.mjs",
    "scripts/check-verification-run-manifest.mjs",
  ]) {
    if (resolveAsset(relative)) pass(`${relative} exists`);
    else fail(`missing ${relative}`);
  }
  for (const relative of ["verification-runtime-plans", "verification-run-manifests"]) {
    if (resolveDirectory(relative)) pass(`${relative} exists`);
    else fail(`missing ${relative}`);
  }
}

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("verification-runtime-plans");
  if (files.length === 0) {
    if (allowEmpty) pass("no runtime plans; skipped by explicit --allow-empty");
    else if (requireReport) fail("no Verification Runtime Plan found");
    else pass("SKIPPED_NO_REPORT: no Verification Runtime Plan found");
    return;
  }
  for (const file of files) checkReport(file);
}

function checkReport(file) {
  if (!fs.existsSync(file)) return fail(`missing report ${rel(file)}`);
  if (fs.lstatSync(file).isSymbolicLink()) return fail(`report must not be a symlink: ${rel(file)}`);
  const content = fs.readFileSync(file, "utf8");
  const label = rel(file);
  if (containsSecretLikeValue(content)) fail(`${label} contains secret-like content`);
  for (const section of [
    "Human Summary", "Task And Source Binding", "Runtime Trust Requirement",
    "Required Controls", "Environment Preflight", "Resource Isolation Plan",
    "Boundaries", "Evidence Authority", "Machine-Readable Evidence", "Outcome", "Next Step",
  ]) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing ${section}`);
  }
  for (const pattern of [
    /asks the user to (choose|select|decide).*(port|database|runtime|adapter|container|test)/i,
    /approves? (implementation|release|production)\s*:\s*(yes|approved)/i,
    /proves? (product|business) correctness\s*:\s*yes/i,
  ]) {
    if (pattern.test(withoutMachineEvidence(content))) fail(`${label} contains forbidden claim: ${pattern.source}`);
  }

  const result = validateEvidenceBlock(content, schema, label, { require: requireStructured, digestField: "runtime_plan_digest" });
  if (!result.present && !requireStructured) return pass(`${label} structured evidence is optional`);
  if (!result.ok) {
    result.errors.forEach(fail);
    return;
  }
  pass(`${label} has valid structured evidence and digest`);
  const plan = result.value;
  if (reportRefCandidates(file).has(plan.runtime_plan_ref)) pass(`${label} runtime_plan_ref points to this report`);
  else fail(`${label} runtime_plan_ref must point to this report`);

  const semanticErrors = planSemanticErrors(plan);
  for (const error of semanticErrors) fail(`${label} ${error}`);
  if (semanticErrors.length === 0) pass(`${label} tier, controls, preflight, adapter, and outcome are coherent`);

  checkAdapterSources(plan, file, label);
  const sourceRefs = [
    plan.task_governance_source?.ref,
    plan.verification_plan_source?.ref,
    ...(plan.adapter_selection?.discovery_sources || []).map((item) => item.ref),
  ].filter(isFileEvidenceRef);
  const authority = validateEvidenceAuthorityBinding(projectRoot, plan.authority_binding, {
    taskRef: plan.task_ref,
    intentDigest: plan.intent_digest,
    sourceRefs,
    fromFile: file,
  });
  if (authority.ok) pass(`${label} Evidence Authority matches current project, task, intent, and sources`);
  else authority.errors.forEach((error) => fail(`${label} ${error}`));

  checkTaskGovernanceSource(plan, file, label);
  checkVerificationPlanSource(plan, file, label);
  const markdownOutcome = stripMarkdown(sectionBody(content, "Outcome") || "");
  if (markdownOutcome === plan.outcome) pass(`${label} Markdown outcome matches structured evidence`);
  else fail(`${label} Markdown outcome must match ${plan.outcome}`);
}

function resolveReportPath(value) {
  if (!isSafeRelativePath(value) || !/^verification-runtime-plans\/[a-zA-Z0-9._/-]+\.md$/.test(value)) {
    console.error("FAIL --report must be a safe project-relative Markdown path under verification-runtime-plans/");
    process.exit(1);
  }
  const resolved = resolveUnderRoot(projectRoot, value, "Verification Runtime Plan report");
  assertNoSymlinkInPath(projectRoot, resolved, "Verification Runtime Plan report");
  return resolved;
}

function checkTaskGovernanceSource(plan, fromFile, label) {
  const source = plan.task_governance_source;
  if (source.status === "DERIVED_CURRENT_INTENT") {
    if (source.ref === "derived:task-governance/current-intent") pass(`${label} uses the current IntentOS task classifier`);
    else fail(`${label} derived Task Governance ref is invalid`);
    return;
  }
  if (source.status !== "RECORDED") return fail(`${label} Task Governance source is blocked`);
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, source.ref, { markdownOnly: true });
  if (!resolved.ok) return fail(`${label} Task Governance ref is unsafe or unresolved: ${resolved.error}`);
  const parsed = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  const value = parsed?.ok ? parsed.value : null;
  if (!value || value.artifact_type !== "task_governance") return fail(`${label} Task Governance source is not structured task governance`);
  if (value.task_governance_digest === source.digest
    && value.task_ref === plan.task_ref
    && value.intent_digest === plan.intent_digest
    && value.impact_classification?.task_impact === plan.task_tier) {
    pass(`${label} Task Governance digest, task, and intent match`);
  } else fail(`${label} Task Governance digest, task, or intent mismatch`);
}

function checkVerificationPlanSource(plan, fromFile, label) {
  const source = plan.verification_plan_source;
  if (source.status === "NOT_REQUIRED") {
    if (plan.task_tier === "LOW") pass(`${label} LOW task explicitly records Verification Plan not required`);
    else fail(`${label} only LOW may omit the Verification Plan`);
    return;
  }
  if (source.status !== "RECORDED") return fail(`${label} required Verification Plan is not recorded`);
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, source.ref, { markdownOnly: true });
  if (!resolved.ok) return fail(`${label} Verification Plan ref is unsafe or unresolved: ${resolved.error}`);
  const verificationSchema = loadSchema(projectRoot, "schemas/artifacts/verification-plan.schema.json");
  const checked = validateEvidenceBlock(fs.readFileSync(resolved.file, "utf8"), verificationSchema, `${label} Verification Plan`, {
    require: true,
    digestField: "verification_plan_digest",
  });
  if (!checked.ok) return checked.errors.forEach((error) => fail(error));
  const value = checked.value;
  if (value.verification_plan_digest === source.digest && value.task_ref === plan.task_ref && value.intent_digest === plan.intent_digest && value.verification_state === "VERIFICATION_PLAN_READY") {
    pass(`${label} Verification Plan schema, digest, task, intent, and state match`);
  } else fail(`${label} Verification Plan digest, task, intent, or state mismatch`);
}

function checkAdapterSources(plan, fromFile, label) {
  if (plan.schema_version !== "1.102.0") return;
  for (const source of plan.adapter_selection?.discovery_sources || []) {
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, source.ref);
    if (!resolved.ok) {
      fail(`${label} adapter discovery ref is unsafe or unresolved: ${resolved.error}`);
      continue;
    }
    const actual = canonicalFileDigest(resolved.file);
    if (source.digest === actual) pass(`${label} adapter discovery source ${source.ref} is current`);
    else fail(`${label} adapter discovery source ${source.ref} digest must match ${actual}`);
  }
}

function resolveAsset(relative) {
  for (const candidate of [path.join(projectRoot, relative), path.join(projectRoot, ".intentos", relative)]) {
    if (fs.existsSync(candidate) && fs.lstatSync(candidate).isFile()) return candidate;
  }
  return "";
}

function resolveDirectory(relative) {
  for (const candidate of [path.join(projectRoot, relative), path.join(projectRoot, ".intentos", relative)]) {
    if (fs.existsSync(candidate) && fs.lstatSync(candidate).isDirectory()) return candidate;
  }
  return "";
}

function markdownFiles(relative) {
  const dir = resolveDirectory(relative);
  if (!dir) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith(".md")).sort().map((name) => path.join(dir, name));
}

function reportRefCandidates(file) {
  const relative = rel(file);
  return new Set([relative, `artifact:${relative}`, `file:${relative}`]);
}

function withoutMachineEvidence(content) {
  return content.replace(/^## Machine-Readable Evidence[\s\S]*?(?=^## |$)/m, "");
}

function rel(file) {
  return path.relative(projectRoot, file).split(path.sep).join("/").replace(/^\.intentos\//, "");
}

function pass(message) {
  checks.push({ ok: true, message });
  if (!outputJson) console.log(`PASS ${message}`);
}

function fail(message) {
  failed = true;
  checks.push({ ok: false, message });
  if (!outputJson) console.error(`FAIL ${message}`);
}

function emit() {
  if (outputJson) process.stdout.write(`${JSON.stringify({ ok: !failed, checks }, null, 2)}\n`);
  process.exit(failed ? 1 : 0);
}
