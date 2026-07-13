#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import {
  canonicalFileDigest,
  createEvidenceAuthorityBinding,
  resolveAuthoritativeEvidenceReference,
} from "./lib/evidence-authority.mjs";
import { assertNoSymlinkInPath, isSafeRelativePath } from "./lib/path-safety.mjs";
import {
  digestText,
  effectiveTaskTier,
  expectedPlanOutcome,
  normalizeTaskTier,
  preflightRequirementsForTier,
  requiredControlsForTier,
  resourceIsolationPlanForTier,
  runtimeTrustLevelForTier,
  selectRuntimeAdapter,
} from "./lib/verification-runtime-trust.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "intent",
  "task-ref",
  "task-tier",
  "task-governance-ref",
  "verification-plan-ref",
  "json",
  "format",
  "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const requestedIntent = String(args.intent || args._.slice(1).join(" ") || "verify current task in a trusted runtime").trim();
const outputFormat = args.json ? "json" : String(args.format || "human");
const outputPath = args.out ? resolveOutputPath(projectRoot, String(args.out)) : null;

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}
if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const taskGovernance = taskGovernanceSource();
const verificationPlan = verificationPlanSource(taskGovernance);
const taskTier = effectiveTaskTier(taskGovernance.tier, args["task-tier"]);
const taskRef = String(args["task-ref"] || verificationPlan.task_ref || taskGovernance.task_ref || "task:current");
const intent = verificationPlan.intent || taskGovernance.intent || requestedIntent;
const intentDigest = verificationPlan.intent_digest || taskGovernance.intent_digest || digestText(intent);
const adapter = selectRuntimeAdapter(projectRoot, taskTier);
const runtimeRef = outputPath
  ? path.relative(projectRoot, outputPath).split(path.sep).join("/")
  : "verification-runtime-plans/generated.md";

const evidence = {
  schema_version: "1.102.0",
  artifact_type: "verification_runtime_plan",
  runtime_plan_ref: runtimeRef,
  runtime_plan_digest: "sha256:pending",
  task_ref: taskRef,
  intent,
  intent_digest: intentDigest,
  task_tier: taskTier,
  task_governance_source: {
    status: taskGovernance.status,
    ref: taskGovernance.ref,
    digest: taskGovernance.digest,
    tier: taskTier,
    current_task_match: taskGovernance.task_ref && taskGovernance.task_ref !== taskRef ? "No" : "Yes",
  },
  verification_plan_source: {
    status: verificationPlan.status,
    ref: verificationPlan.ref,
    digest: verificationPlan.digest,
    state: verificationPlan.state,
    current_task_match: verificationPlan.status === "NOT_REQUIRED" ? "Not applicable"
      : verificationPlan.task_ref === taskRef && verificationPlan.intent_digest === intentDigest ? "Yes" : "No",
  },
  runtime_trust_level: runtimeTrustLevelForTier(taskTier),
  adapter_selection: adapter,
  required_controls: requiredControlsForTier(taskTier),
  preflight_requirements: preflightRequirementsForTier(taskTier),
  resource_isolation_plan: resourceIsolationPlanForTier(taskTier),
  boundaries: {
    starts_services: "No",
    executes_tests: "No",
    creates_or_deletes_resources: "No",
    changes_production: "No",
    asks_user_for_technical_choices: "No",
    approves_implementation_release_or_production: "No",
    proves_real_environment_behavior: "No",
  },
  authority_binding: createEvidenceAuthorityBinding(projectRoot, {
    taskRef,
    intentDigest,
    sourceRefs: [taskGovernance.ref, verificationPlan.ref, ...adapter.discovery_sources.map((item) => item.ref)],
  }),
  outcome: "RUNTIME_PLAN_BLOCKED",
  next_step: "Resolve runtime planning blockers before starting a verification run.",
};
evidence.outcome = expectedPlanOutcome(taskTier, adapter, evidence.verification_plan_source);
evidence.next_step = nextStep(evidence.outcome, taskTier, adapter);
evidence.runtime_plan_digest = evidenceDigest(evidence, ["runtime_plan_digest"]);

const output = outputFormat === "json" ? `${JSON.stringify(evidence, null, 2)}\n` : renderMarkdown(evidence);
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}
process.stdout.write(output);

function taskGovernanceSource() {
  const explicit = String(args["task-governance-ref"] || "").trim();
  if (explicit) {
    const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", explicit, { markdownOnly: true });
    if (!resolved.ok) return blockedGovernance(explicit, `unresolved:${digestText(resolved.error)}`);
    const parsed = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
    const value = parsed?.ok ? parsed.value : null;
    if (!value || value.artifact_type !== "task_governance") return blockedGovernance(explicit, canonicalFileDigest(resolved.file));
    return {
      status: "RECORDED",
      ref: asArtifactRef(resolved.relativePath),
      digest: value.task_governance_digest || canonicalFileDigest(resolved.file),
      tier: normalizeTaskTier(value.impact_classification?.task_impact),
      task_ref: value.task_ref,
      intent: value.intent,
      intent_digest: value.intent_digest,
    };
  }

  const result = spawnSync(process.execPath, [path.join(path.dirname(fileURLToPath(import.meta.url)), "resolve-task-governance.mjs"), projectRoot, "--intent", requestedIntent, "--json"], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
  });
  if (result.status !== 0) return blockedGovernance("derived:task-governance/current-intent", digestText(result.stderr || result.stdout || "task governance failed"));
  const report = JSON.parse(result.stdout);
  const tier = normalizeTaskTier(report.impactClassification?.task_impact);
  const taskRef = String(args["task-ref"] || report.taskIdentity?.task_ref || report.taskRef || "task:current");
  const intentDigest = digestText(requestedIntent);
  return {
    status: "DERIVED_CURRENT_INTENT",
    ref: "derived:task-governance/current-intent",
    digest: digestText(JSON.stringify({ tier, classification: report.impactClassification, requirements: report.requiredBeforeCompletionClaim })),
    tier,
    task_ref: taskRef,
    intent: requestedIntent,
    intent_digest: intentDigest,
  };
}

function verificationPlanSource(governance) {
  const explicit = String(args["verification-plan-ref"] || "").trim();
  const candidate = explicit || latestMarkdown("verification-plans");
  if (!candidate) {
    if (effectiveTaskTier(governance.tier, args["task-tier"]) === "LOW") {
      return { status: "NOT_REQUIRED", ref: "N/A", digest: "N/A", state: "NOT_APPLICABLE_WITH_REASON", task_ref: "", intent: "", intent_digest: "" };
    }
    return { status: "BLOCKED", ref: "N/A", digest: "N/A", state: "MISSING", task_ref: "", intent: "", intent_digest: "" };
  }
  const ref = explicit || `artifact:${candidate}`;
  const resolved = resolveAuthoritativeEvidenceReference(projectRoot, "", ref, { markdownOnly: true });
  if (!resolved.ok) return { status: "BLOCKED", ref, digest: "N/A", state: "UNRESOLVED", task_ref: "", intent: "", intent_digest: "" };
  const parsed = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  const value = parsed?.ok ? parsed.value : null;
  if (!value || value.artifact_type !== "verification_plan") {
    return { status: "BLOCKED", ref: asArtifactRef(resolved.relativePath), digest: canonicalFileDigest(resolved.file), state: "INVALID", task_ref: "", intent: "", intent_digest: "" };
  }
  return {
    status: value.verification_state === "VERIFICATION_PLAN_READY" ? "RECORDED" : "BLOCKED",
    ref: asArtifactRef(resolved.relativePath),
    digest: value.verification_plan_digest,
    state: value.verification_state,
    task_ref: value.task_ref,
    intent: value.intent,
    intent_digest: value.intent_digest,
  };
}

function blockedGovernance(ref, digest) {
  return { status: "BLOCKED", ref, digest, tier: "POSSIBLE_HIGH", task_ref: "", intent: "", intent_digest: "" };
}

function latestMarkdown(relativeDir) {
  const dir = path.join(projectRoot, relativeDir);
  if (!fs.existsSync(dir)) return "";
  const files = fs.readdirSync(dir).filter((name) => name.endsWith(".md") && name !== ".gitkeep").sort();
  return files.length ? `${relativeDir}/${files.at(-1)}` : "";
}

function resolveOutputPath(root, value) {
  if (!isSafeRelativePath(value) || !/^verification-runtime-plans\/[a-zA-Z0-9._/-]+\.(md|json)$/.test(value)) {
    console.error("FAIL --out must be a safe path under verification-runtime-plans/");
    process.exit(1);
  }
  const resolved = path.resolve(root, value);
  assertNoSymlinkInPath(root, resolved, "verification runtime plan output");
  return resolved;
}

function asArtifactRef(relativePath) {
  return `artifact:${relativePath}`;
}

function nextStep(outcome, tier, adapter) {
  if (tier === "POSSIBLE_HIGH") return "Complete read-only task classification before runtime execution.";
  if (adapter.status === "BLOCKED") return "Codex must select or implement a compatible project runtime adapter.";
  if (outcome === "RUNTIME_PLAN_READY") return "Use a supported adapter to perform preflight and create a Verification Run Manifest.";
  return "Resolve the recorded runtime plan blockers.";
}

function renderMarkdown(value) {
  const controls = value.required_controls.map((item) => `| \`${item.control}\` | \`${item.requirement}\` | ${item.reason} |`).join("\n");
  const probes = value.preflight_requirements.map((item) => `| \`${item.probe}\` | \`${item.required}\` | \`${item.expected_result}\` | ${item.reason} |`).join("\n");
  const resources = value.resource_isolation_plan.length
    ? value.resource_isolation_plan.map((item) => `| \`${item.resource_type}\` | \`${item.isolation_strategy}\` | \`${item.production_allowed}\` | \`${item.ownership_required}\` | ${item.reason} |`).join("\n")
    : "| `none` | `NOT_REQUIRED` | `No` | `No` | No managed resource is required by the current tier. |";
  const adapterSources = value.adapter_selection.discovery_sources.length
    ? value.adapter_selection.discovery_sources.map((item) => `| \`${item.signal}\` | \`${item.ref}\` | \`${item.digest}\` |`).join("\n")
    : "| `NOT_REQUIRED` | `N/A` | `N/A` |";
  const identityFields = value.adapter_selection.required_identity_fields.length
    ? value.adapter_selection.required_identity_fields.map((item) => `\`${item}\``).join(", ")
    : "None beyond source/output binding";
  return `# Verification Runtime Plan

## Human Summary

IntentOS classified this task as \`${value.task_tier}\` and selected \`${value.adapter_selection.adapter_kind}\` without asking the user to make technical choices. The required runtime trust level is \`${value.runtime_trust_level}\`.

## Task And Source Binding

- Task ref: \`${value.task_ref}\`
- Intent digest: \`${value.intent_digest}\`
- Task tier: \`${value.task_tier}\`
- Task Governance ref: \`${value.task_governance_source.ref}\`
- Verification Plan ref: \`${value.verification_plan_source.ref}\`
- Verification Plan digest: \`${value.verification_plan_source.digest}\`

## Runtime Trust Requirement

- Required level: \`${value.runtime_trust_level}\`
- Selected adapter: \`${value.adapter_selection.adapter_kind}\`
- Selection reason: ${value.adapter_selection.reason}
- Adapter contract: \`${value.adapter_selection.contract_digest}\`
- Adapter lifecycle: \`${value.adapter_selection.lifecycle_mode}\`
- Required identity fields: ${identityFields}
- Ready for runtime execution: ${value.outcome === "RUNTIME_PLAN_READY" ? "Yes" : "No"}

### Adapter Discovery Evidence

| Signal | Source | Digest |
|---|---|---|
${adapterSources}

## Required Controls

| Control | Requirement | Reason |
|---|---|---|
${controls}

## Environment Preflight

| Probe | Required | Expected Result | Reason |
|---|---|---|---|
${probes}

## Resource Isolation Plan

| Resource | Isolation Strategy | Production Allowed | Ownership Required | Reason |
|---|---|---|---|---|
${resources}

## Boundaries

- This plan starts services: No
- This plan executes tests: No
- This plan creates or deletes resources: No
- This plan changes production: No
- This plan asks the user for technical choices: No
- This plan approves implementation, release, or production: No
- This plan proves real-environment behavior: No

## Evidence Authority

Project, task, intent, and file-backed sources are bound in the structured record.

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(value, null, 2)}
\`\`\`

## Outcome

\`${value.outcome}\`

## Next Step

${value.next_step}
`;
}
