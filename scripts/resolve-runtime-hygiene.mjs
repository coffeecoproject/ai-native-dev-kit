#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "intent",
  "operation",
  "gate-output",
  "gate-output-ref",
  "ci-log",
  "ci-log-ref",
  "release-lane",
  "release-event",
  "release-event-ref",
  "artifact-error",
  "artifact-error-ref",
  "bundle-summary",
  "bundle-summary-ref",
  "retry-policy-allowed",
  "production-side-effect-checked",
  "task-ref",
  "work-queue-item-ref",
  "work-queue-item-digest",
  "work-queue-item-state",
  "work-queue-item-current-task-match",
  "task-governance-ref",
  "task-governance-digest",
  "task-governance-tier",
  "task-governance-task-match",
  "task-governance-review-level",
  "json",
  "format",
  "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const intent = String(args.intent || args._.slice(1).join(" ") || "review runtime delivery blocker");
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

const evidence = buildEvidence();

if (outputFormat === "json") {
  const json = JSON.stringify(evidence, null, 2);
  if (outputPath) writeOutput(outputPath, json);
  console.log(json);
} else {
  const markdown = renderMarkdown(evidence);
  if (outputPath) writeOutput(outputPath, markdown);
  console.log(markdown);
}

function buildEvidence() {
  const gateText = readOptionalText(args["gate-output"]);
  const ciText = readOptionalText(args["ci-log"]);
  const artifactText = readOptionalText(args["artifact-error"]);
  const bundleText = readOptionalText(args["bundle-summary"]);
  const releaseEventText = readOptionalText(args["release-event"]);
  const releaseLane = String(args["release-lane"] || "");
  const runtimeSourceTrace = runtimeSourceTraceFor({ gateText, ciText, artifactText, bundleText, releaseEventText });
  const ci = ciContext(ciText);
  const operation = operationFor({ explicit: args.operation, intent, gateText, ciText, artifactText, bundleText, releaseLane, releaseEventText });
  const runtimeClass = runtimeClassFor({ operation, intent, gateText, ciText, artifactText, bundleText, releaseLane, releaseEventText });
  const decisionState = decisionStateFor(runtimeClass, releaseLane, ci);
  const git = gitContext(projectRoot, runtimeClass);
  const gate = gateContext(runtimeClass, gateText);
  const release = releaseContext(runtimeClass, releaseLane);
  const artifact = artifactContext(runtimeClass, artifactText);
  const bundle = bundleContext(runtimeClass, bundleText);
  const approval = approvalFor(runtimeClass, release, artifact, git);
  const taskContinuation = taskContinuationFor(runtimeClass, decisionState);
  const runtimeRef = outputPath
    ? path.relative(projectRoot, outputPath).replaceAll(path.sep, "/")
    : "runtime-hygiene-reports/generated.md";
  const baseEvidence = {
    schema_version: "1.86.1",
    artifact_type: "runtime_hygiene",
    runtime_hygiene_ref: runtimeRef,
    runtime_hygiene_digest: "sha256:pending",
    task_ref: String(args["task-ref"] || "task:current"),
    work_queue_item_ref: String(args["work-queue-item-ref"] || "N/A"),
    task_governance_ref: String(args["task-governance-ref"] || "N/A"),
    task_entry_binding: taskEntryBinding(),
    operation,
    runtime_class: runtimeClass,
    decision_state: decisionState,
    plain_user_summary: plainSummary(runtimeClass),
    plain_next_step: plainNextStep(runtimeClass),
    technical_terms_required: "No",
    git_context: git,
    gate_context: gate,
    ci_context: ci,
    release_context: release,
    artifact_context: artifact,
    bundle_context: bundle,
    runtime_source_trace: runtimeSourceTrace,
    boundaries: {
      writes_target_files: "No",
      approves_commit_or_push: "No",
      approves_release_or_production: "No",
      bypasses_gates: "No",
      deletes_artifacts: "No",
      changes_production: "No",
      force_pushes: "No",
    },
    required_approval: approval,
    task_continuation: taskContinuation,
    outcome: decisionState,
  };
  baseEvidence.runtime_hygiene_digest = evidenceDigest(baseEvidence, ["runtime_hygiene_digest"]);
  return baseEvidence;
}

function operationFor({ explicit, intent: intentText, gateText, ciText, artifactText, bundleText, releaseLane, releaseEventText }) {
  if (explicit) {
    const value = String(explicit);
    if (new Set(["commit", "push", "ci", "release", "artifact-cleanup", "bundle-slimming"]).has(value)) return value;
  }
  const combined = `${intentText}\n${gateText}\n${ciText}\n${artifactText}\n${bundleText}\n${releaseLane}\n${releaseEventText}`;
  if (/bundle|slim|large|oversized/i.test(combined)) return "bundle-slimming";
  if (/artifact|quota|storage/i.test(combined)) return "artifact-cleanup";
  if (/release|deploy|preflight|prod/i.test(combined)) return "release";
  if (/ci|github actions|runner|workflow/i.test(combined)) return "ci";
  if (/push|pre-push|gate|lint|typecheck|structure/i.test(combined)) return "push";
  return "commit";
}

function runtimeClassFor({ operation, intent: intentText, gateText, ciText, artifactText, bundleText, releaseLane, releaseEventText }) {
  const combined = `${intentText}\n${gateText}\n${ciText}\n${artifactText}\n${bundleText}\n${releaseLane}\n${releaseEventText}`;
  if (/production side effect|prod touched|deploy started|deploy done/i.test(combined)) return "PRODUCTION_SIDE_EFFECT_PRESENT";
  if (/unknown production|cannot prove production|unclear production/i.test(combined)) return "PRODUCTION_SIDE_EFFECT_UNKNOWN";
  if (/artifact.*quota|quota.*artifact|storage.*full|storage quota|exceeded.*storage/i.test(artifactText || combined)) return "ARTIFACT_QUOTA_BLOCKED";
  if (/bundle|evidence archive|docs\/evidence|screenshots|videos|oversized|too large/i.test(bundleText || combined)) return "RELEASE_BUNDLE_OVERSIZED";
  if (/structure budget|structure gate|large file|file too large/i.test(gateText || combined)) return "STRUCTURE_BUDGET_EXCEEDED";
  if (/pre-push|lint|typecheck|test failed|gate failed|generated docs|docs consistency/i.test(gateText || combined)) return "PRE_PUSH_GATE_FAILED";
  if (/ci.*code|test failure|unit test|integration test/i.test(combined)) return "CI_CODE_FAILURE";
  if (/ci|runner|cache|permission|network|provider|github actions/i.test(combined) || operation === "ci") return "CI_ENVIRONMENT_FAILURE";
  if (/old branch|stale branch|mixed commit|ahead|behind|lineage|already merged/i.test(combined)) return "GIT_LINEAGE_DIRTY";
  if (/mixed scope|unrelated change|unrelated task/i.test(combined)) return "COMMIT_SCOPE_MIXED";
  if (/release|preflight/i.test(combined) || operation === "release") return "RELEASE_PREFLIGHT_FAILED";
  return "GIT_LINEAGE_DIRTY";
}

function decisionStateFor(runtimeClass, releaseLane, ci) {
  if (runtimeClass === "PRE_PUSH_GATE_FAILED" || runtimeClass === "STRUCTURE_BUDGET_EXCEEDED" || runtimeClass === "CI_CODE_FAILURE") {
    return "CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR";
  }
  if (runtimeClass === "CI_ENVIRONMENT_FAILURE") {
    if (ci.retry_policy_allowed === "Yes" && ci.production_side_effect_checked === "Yes") {
      return "CAN_CONTINUE_AUTOMATICALLY";
    }
    return "NEEDS_PLAIN_USER_APPROVAL";
  }
  if (runtimeClass === "RELEASE_PREFLIGHT_FAILED") {
    return "CAN_CONTINUE_AUTOMATICALLY";
  }
  if (runtimeClass === "ARTIFACT_QUOTA_BLOCKED") return "NEEDS_RELEASE_OWNER_APPROVAL";
  if (runtimeClass === "RELEASE_BUNDLE_OVERSIZED") return "NEEDS_PLAIN_USER_APPROVAL";
  if (runtimeClass === "PRODUCTION_SIDE_EFFECT_UNKNOWN" || /UNKNOWN/i.test(releaseLane || "")) return "BLOCKED_BY_PRODUCTION_SIDE_EFFECT";
  if (runtimeClass === "PRODUCTION_SIDE_EFFECT_PRESENT") return "BLOCKED_BY_PRODUCTION_SIDE_EFFECT";
  if (runtimeClass === "GIT_LINEAGE_DIRTY" || runtimeClass === "COMMIT_SCOPE_MIXED") return "BLOCKED_BY_UNCLEAR_TASK_SCOPE";
  return "CAN_CONTINUE_AUTOMATICALLY";
}

function gitContext(root, runtimeClass) {
  const branch = git(["branch", "--show-current"], root).stdout.trim() || "N/A";
  const upstream = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"], root);
  const upstreamName = upstream.status === 0 ? upstream.stdout.trim() || "N/A" : "N/A";
  let ahead = 0;
  let behind = 0;
  if (upstreamName !== "N/A") {
    const counts = git(["rev-list", "--left-right", "--count", `${upstreamName}...HEAD`], root);
    if (counts.status === 0) {
      const [behindText, aheadText] = counts.stdout.trim().split(/\s+/);
      behind = Number.parseInt(behindText || "0", 10) || 0;
      ahead = Number.parseInt(aheadText || "0", 10) || 0;
    }
  }
  return {
    branch,
    upstream: upstreamName,
    origin_main_fresh: "Unknown",
    ahead_count: ahead,
    behind_count: behind,
    current_task_commit_isolated: runtimeClass === "GIT_LINEAGE_DIRTY" || runtimeClass === "COMMIT_SCOPE_MIXED" ? "No" : "Unknown",
    force_push_required: runtimeClass === "GIT_LINEAGE_DIRTY" ? "Unknown" : "No",
  };
}

function gateContext(runtimeClass, gateText) {
  const gateName = gateText ? inferGateName(gateText) : "N/A";
  const failed = ["PRE_PUSH_GATE_FAILED", "STRUCTURE_BUDGET_EXCEEDED", "CI_CODE_FAILURE"].includes(runtimeClass);
  return {
    gate_name: gateName,
    exit_code: failed ? "nonzero" : "Unknown",
    failure_class: failed ? runtimeClass : "N/A",
    current_task_related: failed ? "Yes" : "Unknown",
    bypass_recommended: "No",
  };
}

function ciContext(ciText) {
  return {
    retry_policy_allowed: normalizeYesNoUnknown(args["retry-policy-allowed"]),
    production_side_effect_checked: normalizeYesNoUnknown(args["production-side-effect-checked"]),
    ci_log_ref: sourceRef(args["ci-log-ref"], ciText, "ci_log"),
    ci_log_digest: digestText(ciText),
  };
}

function releaseContext(runtimeClass, releaseLane) {
  const lane = normalizeLane(releaseLane);
  const productionTouched = runtimeClass === "PRODUCTION_SIDE_EFFECT_PRESENT" || lane === "PROD_DEPLOY_STARTED" || lane === "PROD_DEPLOY_DONE" ? "Yes"
    : runtimeClass === "PRODUCTION_SIDE_EFFECT_UNKNOWN" || lane === "UNKNOWN" ? "Unknown"
      : "No";
  const ownerRequired = productionTouched !== "No" || runtimeClass === "ARTIFACT_QUOTA_BLOCKED" ? "Yes" : "No";
  const reusable = productionTouched === "No" && ["PREFLIGHT_ONLY", "BUNDLE_CREATED"].includes(lane) ? "Yes"
    : productionTouched === "Yes" ? "No"
      : "Unknown";
  return {
    lane_state: lane,
    production_touched: productionTouched,
    release_id_reusable: reusable,
    release_owner_required: ownerRequired,
  };
}

function runtimeSourceTraceFor({ gateText, ciText, artifactText, bundleText, releaseEventText }) {
  return [
    sourceTraceRecord("gate_output", gateText, args["gate-output-ref"]),
    sourceTraceRecord("ci_log", ciText, args["ci-log-ref"]),
    sourceTraceRecord("artifact_error", artifactText, args["artifact-error-ref"]),
    sourceTraceRecord("bundle_summary", bundleText, args["bundle-summary-ref"]),
    sourceTraceRecord("release_event", releaseEventText, args["release-event-ref"]),
  ];
}

function sourceTraceRecord(sourceKind, text, explicitRef) {
  return {
    source_kind: sourceKind,
    source_ref: sourceRef(explicitRef, text, sourceKind),
    source_digest: digestText(text),
    source_present: text ? "Yes" : "No",
    current_task_match: "Unknown",
  };
}

function sourceRef(explicitRef, text, sourceKind) {
  if (explicitRef) return String(explicitRef);
  return text ? `inline:${sourceKind}` : "N/A";
}

function taskEntryBinding() {
  const taskGovernanceTier = String(args["task-governance-tier"] || "LOW").toUpperCase();
  const workQueueRef = String(args["work-queue-item-ref"] || "N/A");
  const taskGovernanceRef = String(args["task-governance-ref"] || "N/A");
  return {
    work_queue_item_ref: workQueueRef,
    work_queue_item_digest: String(args["work-queue-item-digest"] || digestText(workQueueRef)),
    work_queue_item_state: String(args["work-queue-item-state"] || "CURRENT"),
    work_queue_item_current_task_match: normalizeYesNoUnknown(args["work-queue-item-current-task-match"] || "Unknown"),
    approved_resume_review: "No",
    resume_review_ref: "N/A",
    resume_review_digest: digestText("N/A"),
    resume_review_owner: "N/A",
    resume_review_task_match: "No",
    task_governance_ref: taskGovernanceRef,
    task_governance_digest: String(args["task-governance-digest"] || digestText(taskGovernanceRef)),
    task_governance_task_match: normalizeYesNoUnknown(args["task-governance-task-match"] || "Unknown"),
    task_governance_tier: new Set(["LOW", "MEDIUM", "POSSIBLE_HIGH", "HIGH"]).has(taskGovernanceTier) ? taskGovernanceTier : "LOW",
    task_governance_review_level: String(args["task-governance-review-level"] || reviewLevelFor(taskGovernanceTier)),
    task_governance_blocks_completion: "No",
    unresolved_task_governance_blockers: [],
    tier_completion_requirements_satisfied: "Yes",
    minimal_verification_status: "RECORDED",
    targeted_verification_status: taskGovernanceTier === "MEDIUM" || taskGovernanceTier === "HIGH" ? "RECORDED" : "NOT_APPLICABLE_WITH_REASON",
    high_impact_evidence_chain_complete: taskGovernanceTier === "HIGH" ? "Yes" : "N/A",
    plain_user_blocker: "N/A",
  };
}

function reviewLevelFor(tier) {
  if (tier === "MEDIUM") return "TARGETED";
  if (tier === "HIGH") return "FULL";
  if (tier === "POSSIBLE_HIGH") return "BLOCKED_FOR_CLASSIFICATION";
  return "LIGHTWEIGHT";
}

function artifactContext(runtimeClass) {
  const quota = runtimeClass === "ARTIFACT_QUOTA_BLOCKED";
  return {
    artifact_quota_blocked: quota ? "Yes" : "No",
    artifact_deletion_required: quota ? "Yes" : "No",
    artifact_deletion_irreversible: quota ? "Yes" : "N/A",
    preserve_evidence_artifacts: "Yes",
    preserve_latest_production_bundle: quota ? "Yes" : "Unknown",
  };
}

function bundleContext(runtimeClass, bundleText) {
  const blocked = runtimeClass === "RELEASE_BUNDLE_OVERSIZED";
  return {
    bundle_size_status: blocked ? "BLOCKED" : "OK",
    suspected_non_runtime_content: blocked ? suspectedNonRuntimeContent(bundleText) : [],
    evidence_removed: "No",
    bundle_slimming_recommended: blocked ? "Yes" : "No",
  };
}

function approvalFor(runtimeClass, release, artifact, gitCtx) {
  if (runtimeClass === "ARTIFACT_QUOTA_BLOCKED" || artifact.artifact_deletion_required === "Yes") {
    return {
      approval_required: "Yes",
      approval_reason: "Artifact cleanup is irreversible and must be approved before deletion.",
      approval_scope: "cleanup older non-authoritative release bundles while preserving evidence and latest production bundle",
    };
  }
  if (release.production_touched !== "No") {
    return {
      approval_required: "Yes",
      approval_reason: "Production side effect is present or unknown.",
      approval_scope: "release-owner decision",
    };
  }
  if (gitCtx.force_push_required === "Yes") {
    return {
      approval_required: "Yes",
      approval_reason: "History rewrite or force push may be required.",
      approval_scope: "branch cleanup approval",
    };
  }
  if (runtimeClass === "RELEASE_BUNDLE_OVERSIZED") {
    return {
      approval_required: "Yes",
      approval_reason: "Bundle contents need narrowing while preserving evidence.",
      approval_scope: "exclude non-runtime evidence archives from runtime bundle",
    };
  }
  return {
    approval_required: "No",
    approval_reason: "N/A",
    approval_scope: "N/A",
  };
}

function taskContinuationFor(runtimeClass, decisionState) {
  return {
    task_remains_open: "Yes",
    resume_action: plainNextStep(runtimeClass),
    work_queue_update_required: decisionState === "BLOCKED_BY_UNCLEAR_TASK_SCOPE" ? "Yes" : "No",
  };
}

function plainSummary(runtimeClass) {
  return {
    GIT_LINEAGE_DIRTY: "This branch is carrying history from an older task. I need to clean the task branch so the review only contains the current work.",
    COMMIT_SCOPE_MIXED: "This task appears mixed with unrelated changes. I need to split the work before it can be treated as ready.",
    PRE_PUSH_GATE_FAILED: "The code is not ready to push. The project blocked it with a local gate, so the task needs repair before push.",
    STRUCTURE_BUDGET_EXCEEDED: "The code is not ready to push. The project blocked it because too much logic is concentrated in large files.",
    CI_CODE_FAILURE: "The remote check failed because the code or tests still need repair.",
    CI_ENVIRONMENT_FAILURE: "The remote check failed for an environment or provider reason. The task stays open while I classify whether retry is safe.",
    RELEASE_PREFLIGHT_FAILED: "The release stopped before production was touched. I need to diagnose the preflight failure before trying again.",
    ARTIFACT_QUOTA_BLOCKED: "The release has not touched production. Storage for build bundles is full, and cleanup needs approval because deletion is irreversible.",
    RELEASE_BUNDLE_OVERSIZED: "The release bundle is too large because it appears to include non-runtime files. Evidence must be preserved outside the runtime bundle.",
    PRODUCTION_SIDE_EFFECT_UNKNOWN: "I cannot prove whether production was touched. The safe path is to stop and use the release-owner process.",
    PRODUCTION_SIDE_EFFECT_PRESENT: "Production may already have changed. The safe path is to stop and use the release-owner or incident process.",
  }[runtimeClass] || "A runtime delivery blocker needs classification before the task can move forward.";
}

function plainNextStep(runtimeClass) {
  return {
    GIT_LINEAGE_DIRTY: "Prepare a branch cleanup plan and isolate the current task before any completion claim.",
    COMMIT_SCOPE_MIXED: "Split or amend the work so only the current task remains in scope.",
    PRE_PUSH_GATE_FAILED: "Repair the current task, rerun the project gate, then retry push only after the gate passes.",
    STRUCTURE_BUDGET_EXCEEDED: "Split the new logic structurally and rerun the structure gate.",
    CI_CODE_FAILURE: "Return to task repair and rerun the failing tests or checks.",
    CI_ENVIRONMENT_FAILURE: "Record the provider issue and retry only if project policy allows it.",
    RELEASE_PREFLIGHT_FAILED: "Fix the preflight issue and rerun release review before any handoff.",
    ARTIFACT_QUOTA_BLOCKED: "Ask the release owner to approve cleanup of old non-authoritative bundles while preserving evidence.",
    RELEASE_BUNDLE_OVERSIZED: "Narrow the runtime bundle and keep evidence indexed and hashed outside the bundle.",
    PRODUCTION_SIDE_EFFECT_UNKNOWN: "Stop and ask the release owner to determine the production state.",
    PRODUCTION_SIDE_EFFECT_PRESENT: "Stop and follow release-owner or incident handling.",
  }[runtimeClass] || "Keep the task open and record the blocker.";
}

function renderMarkdown(evidence) {
  return `# Runtime Hygiene Report

This report classifies Git, push, CI, artifact, bundle, or release-runtime blockers.

It does not approve commit, push, release, production, artifact deletion, gate bypass, or force push.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | ${cell(evidence.plain_user_summary)} |
| Plain next step | ${cell(evidence.plain_next_step)} |
| Operation | \`${evidence.operation}\` |
| Runtime class | \`${evidence.runtime_class}\` |
| Decision state | \`${evidence.decision_state}\` |
| Technical terms required | \`${evidence.technical_terms_required}\` |

## Task Binding

| Field | Value |
| --- | --- |
| Task ref | \`${evidence.task_ref}\` |
| Work Queue item ref | \`${evidence.work_queue_item_ref}\` |
| Task Governance ref | \`${evidence.task_governance_ref}\` |

## Git Context

| Field | Value |
| --- | --- |
| Branch | \`${evidence.git_context.branch}\` |
| Upstream | \`${evidence.git_context.upstream}\` |
| Origin main fresh | \`${evidence.git_context.origin_main_fresh}\` |
| Ahead count | \`${evidence.git_context.ahead_count}\` |
| Behind count | \`${evidence.git_context.behind_count}\` |
| Current task commit isolated | \`${evidence.git_context.current_task_commit_isolated}\` |
| Force push required | \`${evidence.git_context.force_push_required}\` |

## Gate Context

| Field | Value |
| --- | --- |
| Gate name | \`${evidence.gate_context.gate_name}\` |
| Exit code | \`${evidence.gate_context.exit_code}\` |
| Failure class | \`${evidence.gate_context.failure_class}\` |
| Current task related | \`${evidence.gate_context.current_task_related}\` |
| Bypass recommended | \`${evidence.gate_context.bypass_recommended}\` |

## CI Context

| Field | Value |
| --- | --- |
| Retry policy allowed | \`${evidence.ci_context.retry_policy_allowed}\` |
| Production side effect checked | \`${evidence.ci_context.production_side_effect_checked}\` |
| CI log ref | \`${evidence.ci_context.ci_log_ref}\` |
| CI log digest | \`${evidence.ci_context.ci_log_digest}\` |

## Release Context

| Field | Value |
| --- | --- |
| Lane state | \`${evidence.release_context.lane_state}\` |
| Production touched | \`${evidence.release_context.production_touched}\` |
| Release ID reusable | \`${evidence.release_context.release_id_reusable}\` |
| Release owner required | \`${evidence.release_context.release_owner_required}\` |

## Artifact Context

| Field | Value |
| --- | --- |
| Artifact quota blocked | \`${evidence.artifact_context.artifact_quota_blocked}\` |
| Artifact deletion required | \`${evidence.artifact_context.artifact_deletion_required}\` |
| Artifact deletion irreversible | \`${evidence.artifact_context.artifact_deletion_irreversible}\` |
| Preserve evidence artifacts | \`${evidence.artifact_context.preserve_evidence_artifacts}\` |
| Preserve latest production bundle | \`${evidence.artifact_context.preserve_latest_production_bundle}\` |

## Bundle Context

| Field | Value |
| --- | --- |
| Bundle size status | \`${evidence.bundle_context.bundle_size_status}\` |
| Suspected non-runtime content | \`${JSON.stringify(evidence.bundle_context.suspected_non_runtime_content)}\` |
| Evidence removed | \`${evidence.bundle_context.evidence_removed}\` |
| Bundle slimming recommended | \`${evidence.bundle_context.bundle_slimming_recommended}\` |

## Runtime Source Trace

| Source | Ref | Digest | Present | Current task match |
| --- | --- | --- | --- | --- |
${evidence.runtime_source_trace.map((source) => `| \`${source.source_kind}\` | \`${source.source_ref}\` | \`${source.source_digest}\` | \`${source.source_present}\` | \`${source.current_task_match}\` |`).join("\n")}

## Boundaries

- This report writes target files: No
- This report approves commit or push: No
- This report approves release or production: No
- This report bypasses gates: No
- This report deletes artifacts: No
- This report changes production: No
- This report force pushes: No

## Required Approval

| Field | Value |
| --- | --- |
| Approval required | \`${evidence.required_approval.approval_required}\` |
| Approval reason | ${cell(evidence.required_approval.approval_reason)} |
| Approval scope | ${cell(evidence.required_approval.approval_scope)} |

## Task Continuation

| Field | Value |
| --- | --- |
| Task remains open | \`${evidence.task_continuation.task_remains_open}\` |
| Resume action | ${cell(evidence.task_continuation.resume_action)} |
| Work Queue update required | \`${evidence.task_continuation.work_queue_update_required}\` |

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

\`${evidence.outcome}\`
`;
}

function normalizeLane(value) {
  const normalized = String(value || "").trim().toUpperCase().replace(/[-\s]+/g, "_");
  const allowed = new Set(["PREFLIGHT_ONLY", "BUNDLE_CREATED", "TEST_LANE_STARTED", "PROD_FREEZE_ENTERED", "PROD_DEPLOY_STARTED", "PROD_DEPLOY_DONE", "UNKNOWN"]);
  if (allowed.has(normalized)) return normalized;
  return "PREFLIGHT_ONLY";
}

function readOptionalText(value) {
  if (!value) return "";
  const text = String(value);
  const resolved = path.resolve(projectRoot, text);
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) return fs.readFileSync(resolved, "utf8");
  return text;
}

function normalizeYesNoUnknown(value) {
  const normalized = String(value || "Unknown").trim().toLowerCase();
  if (["yes", "true", "1", "allowed", "pass", "passed"].includes(normalized)) return "Yes";
  if (["no", "false", "0", "blocked", "fail", "failed"].includes(normalized)) return "No";
  return "Unknown";
}

function digestText(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value || "")).digest("hex")}`;
}

function inferGateName(text) {
  if (/structure/i.test(text)) return "structure-budget";
  if (/typecheck/i.test(text)) return "typecheck";
  if (/lint/i.test(text)) return "lint";
  if (/test/i.test(text)) return "test";
  if (/docs/i.test(text)) return "docs-consistency";
  return "project-gate";
}

function suspectedNonRuntimeContent(text) {
  const value = String(text || "");
  const items = [];
  if (/docs\/evidence|evidence/i.test(value)) items.push("docs/evidence");
  if (/screenshot|video|pdf/i.test(value)) items.push("screenshots/videos/PDFs");
  if (/cache|node_modules|dependency/i.test(value)) items.push("local caches/dependencies");
  return items.length > 0 ? items : ["non-runtime evidence archive"];
}

function git(gitArgs, root) {
  return spawnSync("git", ["-C", root, ...gitArgs], {
    encoding: "utf8",
  });
}

function cell(value) {
  return String(value ?? "N/A").replace(/\|/g, "\\|").replace(/\n/g, " ").trim() || "N/A";
}

function resolveOutputPath(root, relativePath) {
  if (path.isAbsolute(relativePath)) {
    console.error("FAIL --out must be a relative path inside the target project");
    process.exit(1);
  }
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error("FAIL --out must stay inside the target project");
    process.exit(1);
  }
  return resolved;
}

function writeOutput(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
