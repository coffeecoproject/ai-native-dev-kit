#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { extractMachineReadableEvidence, loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import {
  canonicalFileDigest,
  isFileEvidenceRef,
  projectIdentity,
  resolveAuthoritativeEvidenceReference,
  validateEvidenceAuthorityBinding,
} from "./lib/evidence-authority.mjs";
import { sectionBody, stripMarkdown } from "./lib/markdown.mjs";
import { isSafeRelativePath } from "./lib/path-safety.mjs";
import { containsSecretLikeValue } from "./lib/risk-surfaces.mjs";
import {
  lifecycleManifestReplayErrors,
  planSemanticErrors,
  runManifestSemanticErrors,
} from "./lib/verification-runtime-trust.mjs";
import { lifecyclePlanSemanticErrors, readLifecycleDeclaration } from "./lib/verification-runtime-lifecycle.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "allow-empty", "report", "require-report", "require-structured-evidence", "require-complete"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputJson = Boolean(args.json);
const allowEmpty = Boolean(args["allow-empty"]);
const requireReport = Boolean(args["require-report"] || args.report);
const requireStructured = Boolean(args["require-structured-evidence"] || args.report);
const requireComplete = Boolean(args["require-complete"]);
const explicitReport = args.report ? resolveReportPath(String(args.report)) : "";
const schema = loadSchema(projectRoot, "schemas/artifacts/verification-run-manifest.schema.json");
let failed = false;
const checks = [];

if (unknown.length) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}
if (!outputJson) console.log("# Verification Run Manifest Check\n");
checkReports();
emit();

function checkReports() {
  const files = explicitReport ? [explicitReport] : markdownFiles("verification-run-manifests");
  if (files.length === 0) {
    if (allowEmpty) pass("no run manifests; skipped by explicit --allow-empty");
    else if (requireReport) fail("no Verification Run Manifest found");
    else pass("SKIPPED_NO_REPORT: no Verification Run Manifest found");
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
  for (const pattern of [
    /\bpkill\b/i,
    /kill (the )?(port owner|process on port)/i,
    /clear (the )?shared database/i,
    /approves? (implementation|release|production)\s*:\s*(yes|approved)/i,
    /proves? (product|business) correctness\s*:\s*yes/i,
  ]) {
    if (pattern.test(withoutMachineEvidence(content))) fail(`${label} contains unsafe or forbidden claim: ${pattern.source}`);
  }
  for (const section of [
    "Human Summary", "Run Binding", "Source Identity", "Run Window", "Environment Preflight",
    "Service Instances", "Data And Session Isolation", "Resource Ownership Ledger",
    "Verification Executions", "Cleanup Proof", "Boundaries", "Evidence Authority",
    "Machine-Readable Evidence", "Outcome", "Next Step",
  ]) {
    if (sectionBody(content, section)) pass(`${label} includes ${section}`);
    else fail(`${label} missing ${section}`);
  }

  const result = validateEvidenceBlock(content, schema, label, { require: requireStructured, digestField: "run_manifest_digest" });
  if (!result.present && !requireStructured) return pass(`${label} structured evidence is optional`);
  if (!result.ok) {
    result.errors.forEach(fail);
    return;
  }
  pass(`${label} has valid structured evidence and digest`);
  const manifest = result.value;
  if (reportRefCandidates(file).has(manifest.run_manifest_ref)) pass(`${label} run_manifest_ref points to this report`);
  else fail(`${label} run_manifest_ref must point to this report`);

  const plan = loadRuntimePlan(manifest, file, label);
  if (plan) {
    const semanticErrors = runManifestSemanticErrors(manifest, plan, projectIdentity(projectRoot));
    if (semanticErrors.length === 0) pass(`${label} runtime tier, identity, isolation, execution, and cleanup are coherent`);
    else semanticErrors.forEach((error) => fail(`${label} ${error}`));
    if (manifest.schema_version === "1.103.0") checkLifecyclePlan(manifest, plan, file, label);
  }
  checkEvidenceRefs(manifest, file, label);
  const sourceRefs = collectedSourceRefs(manifest);
  const authority = validateEvidenceAuthorityBinding(projectRoot, manifest.authority_binding, {
    taskRef: manifest.task_ref,
    intentDigest: manifest.intent_digest,
    sourceRefs,
    fromFile: file,
  });
  if (authority.ok) pass(`${label} Evidence Authority matches current project, task, intent, plan, and run evidence`);
  else authority.errors.forEach((error) => fail(`${label} ${error}`));

  if (manifest.outcome === "RUNTIME_TRUST_COMPLETE" && manifest.run_window.state !== "COMPLETED") fail(`${label} complete runtime trust requires a completed run`);
  if (requireComplete && manifest.outcome !== "RUNTIME_TRUST_COMPLETE") fail(`${label} --require-complete requires RUNTIME_TRUST_COMPLETE`);
  const markdownOutcome = stripMarkdown(sectionBody(content, "Outcome") || "");
  if (markdownOutcome === manifest.outcome) pass(`${label} Markdown outcome matches structured evidence`);
  else fail(`${label} Markdown outcome must match ${manifest.outcome}`);
}

function checkLifecyclePlan(manifest, runtimePlan, fromFile, label) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, manifest.lifecycle_plan_ref, { markdownOnly: true });
  if (!resolved.ok) return fail(`${label} lifecycle plan ref is unsafe or unresolved: ${resolved.error}`);
  const lifecycleSchema = loadSchema(projectRoot, "schemas/artifacts/verification-runtime-lifecycle-plan.schema.json");
  const checked = validateEvidenceBlock(fs.readFileSync(resolved.file, "utf8"), lifecycleSchema, `${label} Lifecycle Plan`, { require: true, digestField: "lifecycle_plan_digest" });
  if (!checked.ok) return checked.errors.forEach(fail);
  if (checked.value.lifecycle_plan_digest !== manifest.lifecycle_plan_digest || checked.value.run_id !== manifest.run_id) return fail(`${label} lifecycle plan digest or run ID mismatch`);
  const declaration = readLifecycleDeclaration(projectRoot);
  const semantic = lifecyclePlanSemanticErrors(checked.value, runtimePlan, declaration.status === "RECORDED" ? declaration : null, projectIdentity(projectRoot), projectRoot);
  if (semantic.length) semantic.forEach((error) => fail(`${label} Lifecycle Plan ${error}`));
  else pass(`${label} referenced Lifecycle Plan is valid and current`);
  const journalRows = loadLifecycleJournal(manifest, fromFile, label);
  if (!journalRows) return;
  const replayErrors = lifecycleManifestReplayErrors(manifest, checked.value, journalRows);
  if (replayErrors.length) replayErrors.forEach((error) => fail(`${label} Lifecycle Replay ${error}`));
  else {
    pass(`${label} Lifecycle Plan, journal, executions, services, resources, and cleanup replay exactly`);
    pass(`${label} lifecycle replay proves current local consistency, not external signing or malicious-candidate attestation`);
  }
}

function loadLifecycleJournal(manifest, fromFile, label) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, manifest.lifecycle_journal_ref);
  if (!resolved.ok) {
    fail(`${label} lifecycle journal ref is unsafe or unresolved: ${resolved.error}`);
    return null;
  }
  const rows = [];
  const lines = fs.readFileSync(resolved.file, "utf8").split(/\r?\n/);
  for (const [index, raw] of lines.entries()) {
    if (!raw.trim()) continue;
    try {
      const row = JSON.parse(raw);
      if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("row must be a JSON object");
      rows.push(row);
    } catch (error) {
      fail(`${label} lifecycle journal line ${index + 1} is invalid JSONL: ${error.message}`);
      return null;
    }
  }
  if (!rows.length) {
    fail(`${label} lifecycle journal must contain observed JSONL events`);
    return null;
  }
  return rows;
}

function resolveReportPath(value) {
  if (!isSafeRelativePath(value) || !/^verification-run-manifests\/[a-zA-Z0-9._/-]+\.md$/.test(value)) {
    console.error("FAIL --report must be a safe project-relative Markdown path under verification-run-manifests/");
    process.exit(1);
  }
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", `artifact:${value}`, { markdownOnly: true });
  if (!resolved.ok) {
    console.error(`FAIL Verification Run Manifest report is unsafe or unresolved: ${resolved.error}`);
    process.exit(1);
  }
  return resolved.file;
}

function loadRuntimePlan(manifest, fromFile, label) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, manifest.runtime_plan_ref, { markdownOnly: true });
  if (!resolved.ok) {
    fail(`${label} runtime plan ref is unsafe or unresolved: ${resolved.error}`);
    return null;
  }
  const planSchema = loadSchema(projectRoot, "schemas/artifacts/verification-runtime-plan.schema.json");
  const checked = validateEvidenceBlock(fs.readFileSync(resolved.file, "utf8"), planSchema, `${label} Verification Runtime Plan`, {
    require: true,
    digestField: "runtime_plan_digest",
  });
  if (!checked.ok) {
    checked.errors.forEach(fail);
    return null;
  }
  if (checked.value.runtime_plan_digest !== manifest.runtime_plan_digest) {
    fail(`${label} runtime_plan_digest does not match the referenced plan`);
    return null;
  }
  const semantic = planSemanticErrors(checked.value);
  if (semantic.length) {
    semantic.forEach((error) => fail(`${label} referenced runtime plan ${error}`));
    return null;
  }
  pass(`${label} referenced Verification Runtime Plan is valid and current`);
  return checked.value;
}

function checkEvidenceRefs(manifest, fromFile, label) {
  for (const item of evidencePairs(manifest)) {
    if (!isFileEvidenceRef(item.ref)) {
      if (item.required) fail(`${label} ${item.context} requires a project-local evidence ref`);
      continue;
    }
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, fromFile, item.ref);
    if (!resolved.ok) {
      fail(`${label} ${item.context} ref is unsafe or unresolved: ${resolved.error}`);
      continue;
    }
    const actual = canonicalFileDigest(resolved.file);
    if (item.digest === actual) pass(`${label} ${item.context} ref and digest are current`);
    else fail(`${label} ${item.context} digest must match ${actual}`);
  }
}

function evidencePairs(manifest) {
  const pairs = [];
  if (manifest.schema_version === "1.103.0") pairs.push({ context: "lifecycle journal", ref: manifest.lifecycle_journal_ref, digest: manifest.lifecycle_journal_digest, required: true });
  for (const item of manifest.build_artifacts || []) pairs.push({ context: `build artifact ${item.id}`, ref: item.ref, digest: item.digest, required: true });
  for (const item of manifest.preflight_results || []) pairs.push({ context: `preflight ${item.probe}`, ref: item.evidence_ref, digest: item.evidence_digest, required: item.required === "Yes" });
  for (const item of manifest.service_instances || []) pairs.push({ context: `service ${item.id}`, ref: item.evidence_ref, digest: item.evidence_digest, required: item.identity_status === "VERIFIED" });
  for (const item of manifest.resource_ledger || []) pairs.push({ context: `resource ${item.resource_id}`, ref: item.evidence_ref, digest: item.evidence_digest, required: item.created_by_run === "Yes" });
  for (const item of manifest.verification_executions || []) pairs.push({ context: `execution ${item.id}`, ref: item.output_ref, digest: item.output_digest, required: item.result === "PASSED" });
  const cleanup = manifest.cleanup_summary || {};
  pairs.push({ context: "cleanup before", ref: cleanup.before_evidence_ref, digest: cleanup.before_evidence_digest, required: cleanup.state === "VERIFIED" });
  pairs.push({ context: "cleanup after", ref: cleanup.after_evidence_ref, digest: cleanup.after_evidence_digest, required: cleanup.state === "VERIFIED" });
  return pairs;
}

function collectedSourceRefs(manifest) {
  return [manifest.runtime_plan_ref, manifest.lifecycle_plan_ref, manifest.verification_plan_ref, ...evidencePairs(manifest).map((item) => item.ref)].filter(isFileEvidenceRef);
}

function markdownFiles(relative) {
  const candidates = [path.join(projectRoot, relative), path.join(projectRoot, ".intentos", relative)];
  const dir = candidates.find((candidate) => fs.existsSync(candidate) && fs.lstatSync(candidate).isDirectory());
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
  const root = fs.existsSync(projectRoot) ? fs.realpathSync(projectRoot) : projectRoot;
  return path.relative(root, file).split(path.sep).join("/").replace(/^\.intentos\//, "");
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
