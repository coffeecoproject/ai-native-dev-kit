#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, loadSchema, validateEvidenceBlock } from "./lib/artifact-schema.mjs";
import { createEvidenceAuthorityBinding, projectIdentity, resolveAuthoritativeEvidenceReference } from "./lib/evidence-authority.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath, resolveUnderRoot } from "./lib/path-safety.mjs";
import { planSemanticErrors } from "./lib/verification-runtime-trust.mjs";
import {
  environmentPolicy,
  lifecycleBoundaries,
  lifecycleExecutionMode,
  lifecyclePlanSemanticErrors,
  normalizeActions,
  normalizeResources,
  readLifecycleDeclaration,
} from "./lib/verification-runtime-lifecycle.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["runtime-plan-ref", "run-id", "out", "json"]));
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
if (unknown.length) fail(`unknown option: --${unknown.join(", --")}`);

const runtimePlanRef = String(args["runtime-plan-ref"] || latestPlanRef() || "");
if (!runtimePlanRef) fail("--runtime-plan-ref is required when no Verification Runtime Plan exists");
const runtimePlan = loadRuntimePlan(runtimePlanRef);
const declaration = readLifecycleDeclaration(projectRoot);
const runId = String(args["run-id"] || generatedRunId());
if (!/^vrun-[a-z0-9][a-z0-9-]{5,80}$/.test(runId)) fail("--run-id is invalid");
const outputRelative = String(args.out || `verification-runtime-lifecycle-plans/${runId}.md`);
if (!isSafeRelativePath(outputRelative) || !/^verification-runtime-lifecycle-plans\/[a-zA-Z0-9._/-]+\.md$/.test(outputRelative)) {
  fail("--out must be a safe Markdown path under verification-runtime-lifecycle-plans/");
}
const outputFile = resolveUnderRoot(projectRoot, outputRelative, "Verification Runtime Lifecycle Plan output");
assertNoSymlinkInPath(projectRoot, outputFile, "Verification Runtime Lifecycle Plan output");

const mode = lifecycleExecutionMode(runtimePlan.adapter_selection.adapter_kind, runtimePlan.task_tier, declaration.status === "RECORDED" ? declaration.value : null);
const declarationRef = declaration.status === "RECORDED" ? "file:.intentos/verification-runtime-lifecycle.json" : "N/A";
const plan = {
  schema_version: "1.103.0",
  artifact_type: "verification_runtime_lifecycle_plan",
  lifecycle_plan_ref: outputRelative,
  lifecycle_plan_digest: "sha256:pending",
  run_id: runId,
  task_ref: runtimePlan.task_ref,
  intent_digest: runtimePlan.intent_digest,
  task_tier: runtimePlan.task_tier,
  runtime_trust_level: runtimePlan.runtime_trust_level,
  runtime_plan_ref: normalizeRef(runtimePlanRef),
  runtime_plan_digest: runtimePlan.runtime_plan_digest,
  adapter_contract_digest: runtimePlan.adapter_selection.contract_digest,
  adapter_kind: runtimePlan.adapter_selection.adapter_kind,
  declaration_source: {
    status: declaration.status,
    ref: declarationRef,
    digest: declaration.digest || "N/A",
    current_project_match: declaration.status === "RECORDED" ? "Yes" : "No",
  },
  execution_mode: mode,
  actions: declaration.status === "RECORDED" ? normalizeActions(declaration.value.actions, runId) : [],
  resources: declaration.status === "RECORDED" ? normalizeResources(declaration.value.resources) : [],
  environment_policy: environmentPolicy(),
  run_workspace: `.intentos/runtime-runs/${runId}`,
  authority_binding: createEvidenceAuthorityBinding(projectRoot, {
    taskRef: runtimePlan.task_ref,
    intentDigest: runtimePlan.intent_digest,
    sourceRefs: [normalizeRef(runtimePlanRef), declarationRef],
  }),
  boundaries: lifecycleBoundaries(),
  outcome: ["NO_MANAGED_RUNTIME", "LOCAL_CONTROLLED"].includes(mode) ? "LIFECYCLE_PLAN_READY" : "LIFECYCLE_PLAN_BLOCKED",
  next_step: ["NO_MANAGED_RUNTIME", "LOCAL_CONTROLLED"].includes(mode)
    ? "Run the bounded local lifecycle executor; it must preserve the journal and cleanup proof."
    : declaration.status === "MISSING"
      ? "Codex must prepare the project-owned lifecycle declaration before execution."
      : "Resolve the recorded lifecycle blocker without asking the user for a technical choice.",
};
plan.lifecycle_plan_digest = evidenceDigest(plan, ["lifecycle_plan_digest"]);

const semantic = lifecyclePlanSemanticErrors(plan, runtimePlan, declaration.status === "RECORDED" ? declaration : null, projectIdentity(projectRoot), projectRoot);
if (plan.outcome === "LIFECYCLE_PLAN_READY" && semantic.length) fail(`generated lifecycle plan is invalid: ${semantic.join("; ")}`);
const markdown = render(plan);
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, markdown);
process.stdout.write(args.json ? `${JSON.stringify(plan, null, 2)}\n` : markdown);

function loadRuntimePlan(ref) {
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", normalizeRef(ref), { markdownOnly: true });
  if (!resolved.ok) fail(`Verification Runtime Plan is unsafe or unresolved: ${resolved.error}`);
  const checked = validateEvidenceBlock(fs.readFileSync(resolved.file, "utf8"), loadSchema(projectRoot, "schemas/artifacts/verification-runtime-plan.schema.json"), "Verification Runtime Plan", { require: true, digestField: "runtime_plan_digest" });
  if (!checked.ok) fail(checked.errors.join("; "));
  const semantic = planSemanticErrors(checked.value);
  if (semantic.length) fail(`Verification Runtime Plan is invalid: ${semantic.join("; ")}`);
  if (checked.value.outcome !== "RUNTIME_PLAN_READY") fail("Verification Runtime Plan is not ready");
  return checked.value;
}

function latestPlanRef() {
  const candidates = [path.join(projectRoot, "verification-runtime-plans"), path.join(projectRoot, ".intentos", "verification-runtime-plans")];
  const dir = candidates.find((item) => fs.existsSync(item) && fs.lstatSync(item).isDirectory());
  if (!dir) return "";
  const names = fs.readdirSync(dir).filter((name) => name.endsWith(".md")).sort();
  return names.length ? `artifact:verification-runtime-plans/${names.at(-1)}` : "";
}

function normalizeRef(ref) {
  return /^(artifact|file):/.test(ref) ? ref : `artifact:${ref}`;
}

function generatedRunId() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  return `vrun-${stamp}-${crypto.randomBytes(4).toString("hex")}`;
}

function render(value) {
  const actions = value.actions.length ? value.actions.map((item) => `| \`${item.id}\` | \`${item.phase}\` | \`${item.kind}\` | \`${item.argv.join(" ")}\` |`).join("\n") : "| `none` | `N/A` | `N/A` | No action is authorized. |";
  const resources = value.resources.length ? value.resources.map((item) => `| \`${item.resource_id}\` | \`${item.resource_type}\` | \`${item.relative_path}\` | \`${item.cleanup_strategy}\` |`).join("\n") : "| `none` | `N/A` | `N/A` | `NOT_REQUIRED` |";
  return `# Verification Runtime Lifecycle Plan

## Human Summary

IntentOS derived a bounded \`${value.execution_mode}\` lifecycle. Codex selected the technical commands and isolation details; this plan does not authorize production or external effects.

## Task And Runtime Binding

- Task ref: \`${value.task_ref}\`
- Runtime Plan: \`${value.runtime_plan_ref}\`
- Runtime Plan digest: \`${value.runtime_plan_digest}\`
- Run ID: \`${value.run_id}\`
- Declaration: \`${value.declaration_source.status}\`

## Execution Actions

| Action | Phase | Kind | Exact argv |
|---|---|---|---|
${actions}

## Owned Resources

| Resource | Type | Run-relative path | Cleanup |
|---|---|---|---|
${resources}

## Environment And Cleanup Policy

- Environment inheritance: \`${value.environment_policy.inherit_mode}\`
- Owner token: \`${value.environment_policy.inject_owner_token}\`
- Run workspace: \`${value.run_workspace}\`
- Broad cleanup: \`${value.boundaries.permits_broad_cleanup}\`

## Boundaries

This plan uses no shell, permits no external or production effect, stores no raw owner token, and does not approve completion or release.

## Evidence Authority

Project, task, Runtime Plan, lifecycle declaration, and current source revision are bound in the structured evidence below.

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

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exit(1);
}
