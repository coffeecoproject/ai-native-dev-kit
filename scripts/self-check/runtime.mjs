#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { sourceRequiredPaths } from "../lib/manifest.mjs";
import { walkFiles as walkProjectFiles } from "../lib/project-signals.mjs";
import { analyzeRiskSurfaces } from "../lib/risk-surfaces.mjs";
import { evidenceDigest, extractMachineReadableEvidence, validateSchema } from "../lib/artifact-schema.mjs";
import { initExecutableActions } from "../lib/adoption-apply-chain.mjs";
import { loadVerifiedBootstrapReceipt } from "../lib/bootstrap-transaction.mjs";
import {
  buildCurrentTrustFixture,
  prepareCurrentTrustFixtureSource,
} from "../lib/current-trust-fixture.mjs";
import { canonicalFileDigest, createEvidenceAuthorityBinding, projectIdentity } from "../lib/evidence-authority.mjs";
import { resolveProjectEntryTrust } from "../lib/project-entry-trust.mjs";
import { sectionBody, stripMarkdown } from "../lib/markdown.mjs";
import {
  loadReviewContextAuthority,
  reviewContextBindingFromMarkdown,
  validateReviewContextBinding,
} from "../lib/review-context-authority.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const kitRoot = path.resolve(__dirname, "../..");

export let failed = false;

export { fs, path, crypto, spawnSync, os, sourceRequiredPaths, walkProjectFiles, analyzeRiskSurfaces, evidenceDigest, extractMachineReadableEvidence, validateSchema, initExecutableActions, loadVerifiedBootstrapReceipt, buildCurrentTrustFixture, prepareCurrentTrustFixtureSource, canonicalFileDigest, createEvidenceAuthorityBinding, projectIdentity, resolveProjectEntryTrust, sectionBody, stripMarkdown, loadReviewContextAuthority, reviewContextBindingFromMarkdown, validateReviewContextBinding };

export function approvedInitProjectApplyArgs(planPath, extraArgs = []) {
  const originalPlan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  fs.mkdirSync(originalPlan.targetRoot, { recursive: true });
  const localPlanDir = path.join(originalPlan.targetRoot, "apply-execution-plans");
  fs.mkdirSync(localPlanDir, { recursive: true });
  const localPlanPath = path.join(localPlanDir, path.basename(planPath));
  if (path.resolve(planPath) !== path.resolve(localPlanPath)) fs.copyFileSync(planPath, localPlanPath);
  return [
    path.join(kitRoot, "scripts", "init-project.mjs"),
    "--apply-plan",
    localPlanPath,
    "--goal",
    originalPlan.arguments?.goal || "apply the exact current request-bound local plan",
    ...extraArgs,
  ];
}
export function checkRiskSurfaceCalibration() {
  const benign = analyzeRiskSurfaces({
    intent: "update product workflow label, key metric copy, and package display text",
    paths: ["examples/mvp-cli-note-tool/README.md"],
  });
  if (!benign.high) pass("1.47 risk calibration keeps benign workflow/key/package copy low-risk");
  else fail(`1.47 risk calibration false positive: ${benign.reasons.join("; ")}`);

  const secret = analyzeRiskSurfaces({
    intent: "update API key and secret token handling",
    paths: ["src/example.js"],
  });
  if (secret.high && secret.surfaces.includes("environment-secret")) pass("1.47 risk calibration detects secret key context");
  else fail("1.47 risk calibration must detect secret key context");

  const ciWorkflow = analyzeRiskSurfaces({
    intent: "update GitHub workflow file",
    paths: [".github/workflows/intentos-release-checks.yml"],
  });
  if (ciWorkflow.high && ciWorkflow.reasons.some((reason) => reason.includes("CI workflow path") || reason.includes("ci-hook-automation"))) pass("1.47 risk calibration detects CI workflow context");
  else fail("1.47 risk calibration must detect CI workflow context");

  const dataMigration = analyzeRiskSurfaces({
    intent: "change database migration for payment permissions",
    paths: ["src/domain.js"],
  });
  if (dataMigration.high && dataMigration.surfaces.includes("database-migration") && dataMigration.surfaces.includes("payment-billing") && dataMigration.surfaces.includes("auth-permission")) pass("1.47 risk calibration detects migration payment permission context");
  else fail("1.47 risk calibration must detect migration payment permission context");
}
export function currentVersion() {
  const content = read("VERSION.md");
  const match = content.match(/Current version:\s*`([^`]+)`/);
  return match ? match[1] : null;
}
export function exists(relativePath) {
  return fs.existsSync(path.join(kitRoot, relativePath));
}
export function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}
export function fileDigest(file) {
  return `sha256:${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}`;
}
export function generatedExecutionAssuranceReportText({ taskRef, testEvidenceRef, testEvidenceDigest, authorityBinding }) {
  return `# Execution Assurance Report

This report is a read-only derived verification view. It does not write target files, authorize writes, approve release, or replace source systems.

## Human Summary

| Field | Value |
| --- | --- |
| Execution Kind | \`FEATURE_IMPLEMENTATION\` |
| Assurance State | \`VERIFIED_DONE\` |
| Can Claim Done | \`Yes\` |
| Can Codex Write Now | \`No\` |
| Safe Next Step | Prepare a completion evidence gate before claiming the task is complete. |

## Execution Kind

\`FEATURE_IMPLEMENTATION\`

## Intent Lock

| Field | Value |
| --- | --- |
| User Intent | appointment requests must include a service time |
| Normalized Intent | Service time is required across user-visible and server-side entry paths. |
| Task Ref | \`${taskRef}\` |
| Drift Policy | Any new scheduling policy exits this task. |

## Completion Contract

| Criterion | Status | Evidence | Notes |
| --- | --- | --- | --- |
| criterion:test-evidence | \`DONE\` | \`${testEvidenceRef}\` | Test Evidence report is recorded. |

## Planned Impact Map

| Surface | Expected | Status | Evidence | Notes |
| --- | --- | --- | --- |
| USER_FLOW | \`Yes\` | \`DONE\` | \`${testEvidenceRef}\` | User flow covered by Test Evidence. |
| FRONTEND_UI | \`Yes\` | \`DONE\` | \`${testEvidenceRef}\` | Frontend covered by Test Evidence. |
| API_CONTRACT | \`Yes\` | \`DONE\` | \`${testEvidenceRef}\` | API covered by Test Evidence. |
| BACKEND_RULE | \`Yes\` | \`DONE\` | \`${testEvidenceRef}\` | Backend rule covered by Test Evidence. |

## Execution Plan Binding

| Field | Value |
| --- | --- |
| Plan Ref | \`artifact:${taskRef}\` |
| Risk Classification | \`NORMAL\` |
| Planned Target Paths | \`src/appointment/form.ts, src/appointment/api.ts, src/appointment/domain.ts, tests/appointment-service-time.test.ts\` |
| Approval Ref | \`N/A\` |
| Restore Strategy | Revert task-scoped diff if validation behavior regresses. |

## Actual Diff Binding

| Field | Value |
| --- | --- |
| Diff Source | \`git\` |
| Changed Files | \`src/appointment/form.ts, src/appointment/api.ts, src/appointment/domain.ts, tests/appointment-service-time.test.ts\` |
| Unexpected Files | \`none\` |
| Target Diff Status | \`MATCHED_PLAN\` |

## Evidence Binding

| Criterion | Evidence Ref | Resolved | Current Task Match |
| --- | --- | --- | --- |
| criterion:test-evidence | \`${testEvidenceRef}\` | \`Yes\` | \`Yes\` |

## Independent Review Binding

| Field | Value |
| --- | --- |
| Review Required | \`No\` |
| Review Refs | \`checker:generated-project-smoke\` |
| All Reviewers Closed | \`Yes\` |

## Patch Assessment

| Field | Value |
| --- | --- |
| Patch State | \`NOT_A_PATCH\` |
| Reason | Generated-project smoke covers a cross-surface task chain. |

## Source System Trace

| Source System | Status | Ref | Source Task | Source Outcome | Current Task Match | Digest | Contribution | Authority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| test_evidence | \`RECORDED\` | \`${testEvidenceRef}\` | \`${taskRef}\` | \`TEST_EVIDENCE_COMPLETE\` | \`Yes\` | \`${testEvidenceDigest}\` | Generated smoke Test Evidence. | Source system |

## Closure Decision

\`VERIFIED_DONE\`

## Pending Human Decisions

- None.

## Forbidden Claims

- This report writes target files: No
- This report authorizes target-file writes: No
- This report approves implementation beyond recorded scope: No
- This report approves commit or push: No
- This report approves release or production: No
- This report replaces source systems: No
- This report proves product correctness: No
- This report transfers project authority to IntentOS: No

## Boundary

Execution Assurance is derived from recorded evidence and project facts. Source systems remain authoritative.

## Machine-Readable Evidence

\`\`\`json
{
  "schema_version": "1.74.0",
  "artifact_type": "execution_assurance_report",
  "execution_kind": "FEATURE_IMPLEMENTATION",
  "task_ref": "${taskRef}",
  "intent_digest": "sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28",
  "assurance_state": "VERIFIED_DONE",
  "can_claim_done": "Yes",
  "can_codex_write_now": "No",
  "intent_lock": {
    "user_intent": "appointment requests must include a service time",
    "normalized_intent": "Service time is required across user-visible and server-side entry paths.",
    "in_scope": ["user flow", "frontend UI", "API contract", "backend rule", "verification"],
    "out_of_scope": ["payment", "production release", "new scheduling policy"]
  },
  "completion_contract": {
    "criteria": [
      {"id":"criterion:test-evidence","status":"DONE","evidence_refs":["${testEvidenceRef}"]}
    ]
  },
  "planned_impact_map": {
    "surfaces": [
      {"surface":"USER_FLOW","expected":"Yes","status":"DONE","evidence_refs":["${testEvidenceRef}"]},
      {"surface":"FRONTEND_UI","expected":"Yes","status":"DONE","evidence_refs":["${testEvidenceRef}"]},
      {"surface":"API_CONTRACT","expected":"Yes","status":"DONE","evidence_refs":["${testEvidenceRef}"]},
      {"surface":"BACKEND_RULE","expected":"Yes","status":"DONE","evidence_refs":["${testEvidenceRef}"]}
    ]
  },
  "execution_plan": {
    "plan_ref": "artifact:${taskRef}",
    "planned_target_paths": ["src/appointment/form.ts", "src/appointment/api.ts", "src/appointment/domain.ts", "tests/appointment-service-time.test.ts"],
    "risk_classification": "NORMAL",
    "approval_refs": [],
    "restore_strategy": "Revert task-scoped diff if validation behavior regresses."
  },
  "actual_diff": {
    "diff_source": "git",
    "changed_files": ["src/appointment/form.ts", "src/appointment/api.ts", "src/appointment/domain.ts", "tests/appointment-service-time.test.ts"],
    "unexpected_files": [],
    "target_diff_status": "MATCHED_PLAN"
  },
  "evidence_bindings": [
    {"criterion_id":"criterion:test-evidence","evidence_ref":"${testEvidenceRef}","resolved":"Yes","current_task_match":"Yes"}
  ],
  "review": {
    "review_required": "No",
    "review_refs": ["checker:generated-project-smoke"],
    "all_reviewers_closed": "Yes"
  },
  "patch_assessment": {
    "state": "NOT_A_PATCH",
    "reason": "Generated-project smoke covers a cross-surface task chain."
  },
  "source_systems": [
    {
      "name": "test_evidence",
      "status": "RECORDED",
      "ref": "${testEvidenceRef}",
      "source_system_ref": "${testEvidenceRef}",
      "source_task_ref": "${taskRef}",
      "source_outcome": "TEST_EVIDENCE_COMPLETE",
      "current_task_match": "Yes",
      "report_digest": "${testEvidenceDigest}",
      "contribution": "Generated smoke Test Evidence."
    }
  ],
  "authority_binding": ${JSON.stringify(authorityBinding, null, 2)},
  "pending_human_decisions": [],
  "forbidden_claims": [],
  "boundary": {
    "writes_target_files": "No",
    "authorizes_target_file_writes": "No",
    "approves_implementation_beyond_recorded_scope": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "replaces_source_systems": "No",
    "proves_product_correctness": "No",
    "transfers_project_authority_to_intentos": "No"
  },
  "outcome": "VERIFIED_DONE"
}
\`\`\`
`;
}
export function hasCompleteAdoptionAssuranceEvidence(parsed) {
  const requiredSurfaces = [
    "workflow_entry",
    "ai_rules_agents",
    "engineering_baseline",
    "environment_baseline",
    "release_rollback",
    "ci_hooks",
    "documents",
    "work_queue",
    "ai_logs_audit",
    "risk_authority",
    "apply_chain",
    "simulation_task",
  ];
  const surfaces = parsed.structuredEvidence?.surfaces;
  const surfaceNames = new Set(Array.isArray(surfaces) ? surfaces.map((surface) => surface.surface) : []);
  const hasAllSurfaces = requiredSurfaces.every((surface) => surfaceNames.has(surface));
  const simulation = parsed.structuredEvidence?.simulation || {};
  const simulationSteps = Array.isArray(simulation.steps) ? simulation.steps : [];
  const sourceSystems = parsed.structuredEvidence?.source_systems || {};
  const boundary = parsed.structuredEvidence?.boundary || {};
  return hasAllSurfaces
    && typeof simulation.state === "string"
    && simulationSteps.length > 0
    && simulationSteps.every((step) => Object.prototype.hasOwnProperty.call(step, "exit_code")
      && step.read_only === "Yes"
      && step.writes_target_files === "No"
      && typeof step.target_diff_status === "string"
      && typeof step.output_digest === "string")
    && (simulation.state !== "SIMULATION_PASSED" || simulationSteps.every((step) => step.exit_code === 0 && step.target_diff_status === "UNCHANGED"))
    && Object.keys(sourceSystems).length > 0
    && boundary.writes_target_files === "No"
    && boundary.approves_release_or_production === "No"
    && boundary.replaces_release_sop === "No";
}
export function hasCompleteGovernanceConvergenceEvidence(parsed) {
  const requiredDimensions = [
    "workflow",
    "baseline",
    "audit",
    "release",
    "ci_hooks",
    "documents",
    "work_queue",
    "ai_logs",
    "risk_authority",
  ];
  const dimensions = parsed.structuredEvidence?.dimensions;
  const dimensionNames = new Set(Array.isArray(dimensions) ? dimensions.map((dimension) => dimension.dimension) : []);
  const hasAllDimensions = requiredDimensions.every((dimension) => dimensionNames.has(dimension));
  const sourceSystems = parsed.structuredEvidence?.source_systems || {};
  const requiredSources = [
    "workflow_next",
    "native_migration",
    "existing_rule_reconciliation",
    "release_plan",
  ];
  const hasAllSources = requiredSources.every((source) => {
    const evidence = sourceSystems[source];
    return evidence
      && typeof evidence.status === "string"
      && typeof evidence.ref === "string"
      && typeof evidence.contribution === "string";
  });
  const blocked = Array.isArray(parsed.structuredEvidence?.blocked) ? parsed.structuredEvidence.blocked : [];
  const sourceStatuses = requiredSources
    .filter((source) => source !== "release_plan")
    .map((source) => sourceSystems[source]?.status);
  const needsUpstreamBlock = sourceStatuses.some((status) => status === "BLOCKED" || status === "NEEDS_INPUT");
  const recordsUpstreamBlock = blocked.some((reason) => reason.includes("upstream source requires input"));
  return hasAllDimensions && hasAllSources && (!needsUpstreamBlock || recordsUpstreamBlock);
}
export function mutateVerificationPlan(reportFile, mutate) {
  const content = fs.readFileSync(reportFile, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  if (!extracted?.ok) throw new Error(`invalid verification plan fixture ${reportFile}`);
  const evidence = structuredClone(extracted.value);
  mutate(evidence);
  evidence.verification_plan_digest = evidenceDigest(evidence, ["verification_plan_digest"]);
  const updated = content.replace(/```json\s*[\s\S]*?```/i, `\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\``);
  fs.writeFileSync(reportFile, updated);
}
export function pass(message) {
  console.log(`PASS ${message}`);
}
export function read(relativePath) {
  return fs.readFileSync(path.join(kitRoot, relativePath), "utf8");
}
export function rel(fullPath) {
  return path.relative(kitRoot, fullPath) || ".";
}
export function reportNameForTakeoverExample(example) {
  return {
    "reliable-existing-system": "reliable-existing-system",
    "messy-todo-migration": "messy-todo",
    "missing-task-system": "missing-task-system",
    "unsafe-dirty-project": "unsafe",
  }[example] || example;
}
export function rewriteMachineEvidence(file, mutate) {
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/```json\s*([\s\S]*?)```/i);
  if (!match) throw new Error(`Machine-Readable Evidence JSON block not found: ${file}`);
  const evidence = JSON.parse(match[1]);
  const nextEvidence = mutate(evidence) || evidence;
  const nextContent = content.replace(match[0], [
    "```json",
    JSON.stringify(nextEvidence, null, 2),
    "```",
  ].join("\n"));
  fs.writeFileSync(file, nextContent);
}
export function runNode(args, options = {}) {
  return spawnSync(process.execPath, args, {
    cwd: options.cwd || kitRoot,
    encoding: "utf8",
    maxBuffer: options.maxBuffer || 1024 * 1024 * 80,
  });
}
export function walkSourceFiles(dir) {
  return walkProjectFiles(path.join(kitRoot, dir));
}
export function writeInitProjectApprovalRecord(planPath, options = {}) {
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const actions = initExecutableActions(plan);
  const approvalPath = options.approvalPath || `${planPath}.approval.md`;
  let approval = {
    schema_version: "1.41.0",
    artifact_type: "approval_record",
    artifact_id: path.basename(approvalPath).replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "init-project-approval",
    approval_status: "APPROVED",
    approved_by: "IntentOS self-check human fixture",
    approval_owner_type: "HUMAN",
    approved_plan: {
      path: options.planRef || path.basename(planPath),
      plan_digest: plan.planDigest,
    },
    approved_action_ids: actions.map((action) => action.id),
    approved_action_paths: actions.map((action) => ({
      id: action.id,
      target_paths: action.targetPaths,
    })),
    expires_at: "2099-12-31T23:59:00Z",
    plan_changed_after_approval: false,
    risk_acceptance: {
      high_risk_action_included: false,
      human_only_action_included: false,
    },
    rollback_reviewed: true,
    verification_reviewed: true,
    boundary: {
      writes_files_now: false,
      authorizes_automatic_apply: false,
      approves_implementation: false,
      approves_release_or_production: false,
      installs_hooks_or_changes_ci: false,
      enables_high_risk_actions: false,
      lets_codex_proceed_without_readiness: false,
    },
  };
  if (typeof options.mutate === "function") {
    approval = options.mutate(approval, plan, actions) || approval;
  }
  fs.writeFileSync(approvalPath, [
    "# Approval Record: init-project self-check",
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(approval, null, 2),
    "```",
    "",
  ].join("\n"));
  return approvalPath;
}
export function writeInitProjectReadinessRecord(planPath, options = {}) {
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const actions = initExecutableActions(plan);
  const readinessPath = options.readinessPath || `${planPath}.readiness.md`;
  const readiness = {
    schema_version: "1.41.0",
    artifact_type: "controlled_apply_readiness",
    artifact_id: path.basename(readinessPath).replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "init-project-readiness",
    readiness_state: "READY_FOR_HUMAN_APPROVED_APPLY",
    can_codex_apply_now: false,
    requires_explicit_human_approval: true,
    can_proceed_without_new_approval: false,
    apply_plan: { path: options.planRef || path.basename(planPath), plan_digest: plan.planDigest },
    actions: actions.map((action) => ({ id: action.id, classification: "LOW_RISK_CANDIDATE", target_paths: action.targetPaths })),
    preconditions: [
      { name: "Apply plan exists", status: "pass" },
      { name: "Git state safe", status: "pass" },
      { name: "Target paths bounded", status: "pass" },
      { name: "Rollback ready", status: "pass" },
      { name: "Verification ready", status: "pass" }
    ],
    rollback: { required: true, path: ".intentos/backups", step: "Restore exact plan-bound backups", verification: "Compare pre-apply hashes" },
    verification: { pre_apply: "validate exact graph", post_apply: "workflow-next --json", evidence_path: plan.receiptPath },
    boundary: {
      writes_files_now: false,
      authorizes_apply: false,
      approves_implementation: false,
      approves_release_or_production: false,
      installs_hooks_or_changes_ci: false,
      enables_high_risk_actions: false,
    },
    outcome: "READINESS_RECORDED",
  };
  fs.writeFileSync(readinessPath, [
    "# Controlled Apply Readiness: init-project self-check",
    "",
    "## Machine-Readable Evidence",
    "",
    "```json",
    JSON.stringify(readiness, null, 2),
    "```",
    "",
  ].join("\n"));
  return readinessPath;
}

export function hasFailed() {
  return failed;
}
