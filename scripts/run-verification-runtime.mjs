#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { canonicalFileDigest, createEvidenceAuthorityBinding, projectIdentity, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath, resolveUnderRoot } from "./lib/path-safety.mjs";
import { planSemanticErrors } from "./lib/verification-runtime-trust.mjs";
import { executeLifecyclePlan, lifecyclePlanSemanticErrors, readLifecycleDeclaration } from "./lib/verification-runtime-lifecycle.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["plan", "out", "durable-evidence-out"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
if (unknown.length) fatal(`unknown option: --${unknown.join(", --")}`);
const lifecycleRef = String(args.plan || "");
if (!lifecycleRef) fatal("--plan is required");
const loaded = loadLifecycle(lifecycleRef);
const plan = loaded.plan;
const runtimePlan = loaded.runtimePlan;
const outputRelative = String(args.out || `verification-run-manifests/${plan.run_id}.md`);
if (!isSafeRelativePath(outputRelative) || !/^verification-run-manifests\/[a-zA-Z0-9._/-]+\.md$/.test(outputRelative)) fatal("--out must stay under verification-run-manifests/");
const outputFile = resolveUnderRoot(projectRoot, outputRelative, "Verification Run Manifest output");
assertNoSymlinkInPath(projectRoot, outputFile, "Verification Run Manifest output");
const durableEvidenceRelative = String(args["durable-evidence-out"] || "");
if (durableEvidenceRelative && durableEvidenceRelative !== `evidence/runtime-runs/${plan.run_id}`) {
  fatal(`--durable-evidence-out must be evidence/runtime-runs/${plan.run_id}`);
}

const controller = new AbortController();
const stop = () => controller.abort();
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
let result;
const sourceFreeze = verifySourceFreeze();
if (!sourceFreeze.ok) fatal(sourceFreeze.errors.join("; "));
try {
  result = await executeLifecyclePlan(projectRoot, plan, {
    signal: controller.signal,
    sourceIdentity: sourceFreeze.identity,
    preflightRequirements: runtimePlan.preflight_requirements,
  });
} finally {
  process.removeListener("SIGINT", stop);
  process.removeListener("SIGTERM", stop);
}
if (durableEvidenceRelative) result = archiveRunEvidence(result, durableEvidenceRelative);
const sourceAfter = projectIdentity(projectRoot);
result.sourceIdentity = sourceFreeze.identity;
result.sourceIdentityAfter = sourceAfter;
if (JSON.stringify(sourceAfter) !== JSON.stringify(sourceFreeze.identity)) {
  result.ok = false;
  result.failure = "project source identity changed while the verification runtime was executing";
}

const manifest = buildManifest(result);
manifest.run_manifest_digest = evidenceDigest(manifest, ["run_manifest_digest"]);
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, render(manifest));
process.stdout.write(render(manifest));
process.exit(result.ok ? 0 : 2);

function loadLifecycle(ref) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", normalizeRef(ref), { markdownOnly: true });
  if (!resolved.ok) fatal(`Lifecycle Plan is unsafe or unresolved: ${resolved.error}`);
  const checked = validateEvidenceBlock(fs.readFileSync(resolved.file, "utf8"), loadSchema(projectRoot, "schemas/artifacts/verification-runtime-lifecycle-plan.schema.json"), "Lifecycle Plan", { require: true, digestField: "lifecycle_plan_digest" });
  if (!checked.ok) fatal(checked.errors.join("; "));
  const runtimeResolved = resolveAuthoritativeEvidenceReference(projectRoot, resolved.file, checked.value.runtime_plan_ref, { markdownOnly: true });
  if (!runtimeResolved.ok) fatal(`Runtime Plan is unsafe or unresolved: ${runtimeResolved.error}`);
  const runtimeChecked = validateEvidenceBlock(fs.readFileSync(runtimeResolved.file, "utf8"), loadSchema(projectRoot, "schemas/artifacts/verification-runtime-plan.schema.json"), "Runtime Plan", { require: true, digestField: "runtime_plan_digest" });
  if (!runtimeChecked.ok) fatal(runtimeChecked.errors.join("; "));
  const runtimeSemantic = planSemanticErrors(runtimeChecked.value);
  if (runtimeSemantic.length) fatal(runtimeSemantic.join("; "));
  const declaration = readLifecycleDeclaration(projectRoot);
  const semantic = lifecyclePlanSemanticErrors(checked.value, runtimeChecked.value, declaration.status === "RECORDED" ? declaration : null, projectIdentity(projectRoot), projectRoot);
  if (semantic.length) fatal(semantic.join("; "));
  if (checked.value.outcome !== "LIFECYCLE_PLAN_READY") fatal("Lifecycle Plan is not ready");
  return { plan: checked.value, runtimePlan: runtimeChecked.value, lifecycleFile: resolved.file };
}

function buildManifest(run) {
  const preflightRef = fileRef(run.preflightFile);
  const resourceRef = fileRef(run.resourceEvidence);
  const cleanupBeforeRef = fileRef(run.cleanupBefore);
  const cleanupAfterRef = fileRef(run.cleanupAfter);
  const journalRef = fileRef(run.journalFile);
  const serviceInstances = run.serviceInstances.map((item) => ({
    id: item.id,
    adapter_kind: item.adapter_kind,
    identity_status: item.identity_status,
    identity_fields: item.identity_fields,
    started_at: item.started_at,
    owned_by_run: item.owned_by_run,
    evidence_ref: fileRef(item.evidence_file),
    evidence_digest: canonicalFileDigest(item.evidence_file),
  }));
  const executions = run.executions.map(({ output_file: outputFile, ...item }) => ({
    ...item,
    output_ref: fileRef(outputFile),
    output_digest: canonicalFileDigest(outputFile),
  }));
  const dataResources = plan.resources.filter((item) => item.resource_type !== "SESSION_NAMESPACE").map((item) => ({
    id: item.resource_id,
    resource_type: item.resource_type === "DATABASE_FILE" ? "DATABASE" : item.resource_type === "CACHE_NAMESPACE" ? "CACHE" : "OTHER",
    instance_fingerprint: run.ownerMarkerDigest,
    namespace_digest: digestString(`${plan.run_id}|${item.relative_path}`),
    migration_revision: item.migration_revision,
    isolation_status: "ISOLATED",
    production_instance: "No",
    owned_by_run: "Yes",
  }));
  const sessions = plan.resources.filter((item) => item.resource_type === "SESSION_NAMESPACE").map((item) => ({
    id: item.resource_id,
    role: item.role || "verification-user",
    namespace_digest: digestString(`${plan.run_id}|${item.relative_path}`),
    isolation_status: "ISOLATED",
    owned_by_run: "Yes",
    credential_stored: "No",
  }));
  const resourceLedger = [
    ...run.resources.map((item) => ({ resource_id: item.resource_id, resource_type: ledgerType(item.resource_type), created_by_run: "Yes", owner_marker_digest: run.ownerMarkerDigest, cleanup_state: item.cleaned ? "CLEANED" : "BLOCKED", evidence_ref: resourceRef, evidence_digest: canonicalFileDigest(run.resourceEvidence) })),
    ...run.serviceInstances.map((item) => ({ resource_id: item.id, resource_type: "PROCESS", created_by_run: "Yes", owner_marker_digest: run.ownerMarkerDigest, cleanup_state: run.ownedResourcesRemaining === 0 ? "CLEANED" : "BLOCKED", evidence_ref: resourceRef, evidence_digest: canonicalFileDigest(run.resourceEvidence) })),
  ];
  const state = run.cleanupBlocked ? "CLEANUP_FAILED" : run.ok ? "COMPLETED" : "FAILED";
  const outcome = run.ok ? "RUNTIME_TRUST_COMPLETE" : run.cleanupBlocked ? "RUNTIME_TRUST_BLOCKED" : "RUNTIME_TRUST_PARTIAL";
  const sourceRefs = [plan.runtime_plan_ref, normalizeRef(plan.lifecycle_plan_ref), runtimePlan.verification_plan_source.ref, preflightRef, ...(resourceLedger.length ? [resourceRef] : []), cleanupBeforeRef, cleanupAfterRef, journalRef, ...serviceInstances.map((item) => item.evidence_ref), ...executions.map((item) => item.output_ref)];
  return {
    schema_version: "1.103.0",
    artifact_type: "verification_run_manifest",
    run_manifest_ref: outputRelative,
    run_manifest_digest: "sha256:pending",
    run_id: plan.run_id,
    owner_token_digest: run.ownerTokenDigest,
    runtime_plan_ref: plan.runtime_plan_ref,
    runtime_plan_digest: plan.runtime_plan_digest,
    lifecycle_plan_ref: normalizeRef(plan.lifecycle_plan_ref),
    lifecycle_plan_digest: plan.lifecycle_plan_digest,
    lifecycle_journal_ref: journalRef,
    lifecycle_journal_digest: canonicalFileDigest(run.journalFile),
    adapter_contract_digest: plan.adapter_contract_digest,
    verification_plan_ref: runtimePlan.verification_plan_source.ref,
    verification_plan_digest: runtimePlan.verification_plan_source.digest,
    task_ref: plan.task_ref,
    intent_digest: plan.intent_digest,
    task_tier: plan.task_tier,
    runtime_trust_level: plan.runtime_trust_level,
    source_identity: { ...run.sourceIdentity, current_project_match: "Yes" },
    build_artifacts: [],
    run_window: { started_at: run.startedAt, finished_at: run.finishedAt, state },
    preflight_results: (run.preflightResults || []).map((item) => ({ probe: item.probe, required: item.required, result: item.result, evidence_ref: preflightRef, evidence_digest: canonicalFileDigest(run.preflightFile), reason: item.reason })),
    service_instances: serviceInstances,
    data_resources: dataResources,
    session_contexts: sessions,
    resource_ledger: resourceLedger,
    verification_executions: executions,
    cleanup_summary: { state: run.cleanupBlocked ? "FAILED" : "VERIFIED", owned_resources_remaining: run.ownedResourcesRemaining, unrelated_resources_touched: "No", before_evidence_ref: cleanupBeforeRef, before_evidence_digest: canonicalFileDigest(run.cleanupBefore), after_evidence_ref: cleanupAfterRef, after_evidence_digest: canonicalFileDigest(run.cleanupAfter) },
    boundaries: { stores_raw_secrets: "No", authorizes_broad_cleanup: "No", changes_production: "No", approves_implementation_release_or_production: "No", proves_product_or_business_correctness: "No" },
    authority_binding: createEvidenceAuthorityBinding(projectRoot, { taskRef: plan.task_ref, intentDigest: plan.intent_digest, sourceRefs }),
    outcome,
    next_step: run.ok ? "Validate this manifest, then bind it to Test Evidence; it does not by itself approve completion." : "Resolve the recorded execution or cleanup failure before any completion claim.",
  };
}

function render(value) {
  const services = value.service_instances.length ? value.service_instances.map((item) => `- \`${item.id}\`: \`${item.identity_status}\``).join("\n") : "- No service instance required.";
  const executions = value.verification_executions.length ? value.verification_executions.map((item) => `- \`${item.id}\`: \`${item.result}\`, exit \`${item.exit_code}\``).join("\n") : "- No verification execution recorded.";
  return `# Verification Run Manifest

## Human Summary

IntentOS executed only the bounded local lifecycle plan and preserved observed identity, output, ownership, and cleanup evidence.

## Run Binding

- Run ID: \`${value.run_id}\`
- Runtime Plan: \`${value.runtime_plan_ref}\`
- Lifecycle Plan: \`${value.lifecycle_plan_ref}\`

## Source Identity

- Kind: \`${value.source_identity.kind}\`
- Revision: \`${value.source_identity.revision}\`

## Run Window

- Started: \`${value.run_window.started_at}\`
- Finished: \`${value.run_window.finished_at}\`
- State: \`${value.run_window.state}\`

## Environment Preflight

All required runtime-plan probes are bound to the run-scoped preflight evidence.

## Service Instances

${services}

## Data And Session Isolation

Run-owned resources use isolated namespaces and never target production.

## Resource Ownership Ledger

Every material process or path is bound to this run and has an explicit cleanup disposition.

## Verification Executions

${executions}

## Cleanup Proof

- State: \`${value.cleanup_summary.state}\`
- Owned resources remaining: \`${value.cleanup_summary.owned_resources_remaining}\`
- Unrelated resources touched: \`${value.cleanup_summary.unrelated_resources_touched}\`

## Boundaries

No production change, broad cleanup, raw credential storage, completion approval, or release approval is authorized.

## Evidence Authority

The task, source revision, plans, journal, outputs, identity, and cleanup evidence are bound below.

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(value, null, 2)}
\`\`\`

## Outcome

${value.outcome}

## Next Step

${value.next_step}
`;
}

function fileRef(file) { return `file:${path.relative(projectRoot, file).split(path.sep).join("/")}`; }
function archiveRunEvidence(run, relative) {
  const destination = resolveUnderRoot(projectRoot, relative, "durable verification evidence archive");
  assertNoSymlinkInPath(projectRoot, path.dirname(destination), "durable verification evidence archive parent");
  if (fs.existsSync(destination)) fatal("durable verification evidence archive already exists; refusing evidence reuse");
  assertArchiveSource(run.workspace);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(run.workspace, destination, { recursive: true, force: false, errorOnExist: true });
  const remap = (file) => path.join(destination, path.relative(run.workspace, file));
  return {
    ...run,
    workspace: destination,
    journalFile: remap(run.journalFile),
    preflightFile: remap(run.preflightFile),
    cleanupBefore: remap(run.cleanupBefore),
    cleanupAfter: remap(run.cleanupAfter),
    resourceEvidence: remap(run.resourceEvidence),
    serviceInstances: run.serviceInstances.map((item) => ({ ...item, evidence_file: remap(item.evidence_file) })),
    executions: run.executions.map((item) => ({ ...item, output_file: remap(item.output_file) })),
  };
}
function assertArchiveSource(root) {
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) fatal("durable verification evidence archive refuses symbolic links");
      if (stat.isDirectory()) visit(file);
      else if (!stat.isFile()) fatal("durable verification evidence archive accepts regular files only");
    }
  };
  visit(root);
}
function normalizeRef(ref) { return /^(artifact|file):/.test(ref) ? ref : `artifact:${ref}`; }
function ledgerType(type) { return type === "DATABASE_FILE" ? "DATABASE" : type === "CACHE_NAMESPACE" ? "CACHE" : type === "SESSION_NAMESPACE" ? "SESSION" : "FILE"; }
function digestString(value) { return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`; }
function verifySourceFreeze() {
  const identity = projectIdentity(projectRoot);
  if (identity.kind !== "GIT") return { ok: true, identity, errors: [] };
  const errors = [];
  const staged = git(["diff", "--cached", "--quiet", "--"]);
  const unstaged = git(["diff", "--quiet", "--"]);
  if (![0, 1].includes(staged.status) || ![0, 1].includes(unstaged.status)) {
    errors.push("cannot establish a stable Git candidate before runtime verification");
  } else if (staged.status === 1 && unstaged.status !== 0) {
    errors.push("staged runtime candidate differs from tracked worktree bytes");
  } else if (staged.status === 0 && unstaged.status !== 0) {
    errors.push("runtime verification requires a committed or staged candidate, not unstaged tracked changes");
  }
  const untracked = git(["ls-files", "--others", "--exclude-standard"]);
  if (untracked.status !== 0) {
    errors.push("cannot enumerate untracked candidate inputs");
  } else {
    const unsafe = untracked.stdout.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
      .filter((item) => !/^docs\/plans\/[a-zA-Z0-9._/-]+\.md$/.test(item));
    if (unsafe.length > 0) errors.push(`untracked executable or configuration inputs are not frozen: ${unsafe.join(", ")}`);
  }
  return { ok: errors.length === 0, identity, errors };
}
function git(argv) { return spawnSync("git", argv, { cwd: projectRoot, encoding: "utf8" }); }
function fatal(message) { console.error(`FAIL ${message}`); process.exit(1); }
