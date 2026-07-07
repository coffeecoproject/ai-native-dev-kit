#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest, extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "release-target",
  "release-candidate-ref",
  "source-revision",
  "dirty-worktree-status",
  "task-ref",
  "completion-evidence-ref",
  "test-evidence-ref",
  "execution-assurance-ref",
  "product-completeness-ref",
  "launch-review-ref",
  "release-plan-ref",
  "platform-recipe-ref",
  "release-handoff-ref",
  "existing-release-rule-ref",
  "existing-release-rule-state",
  "build-artifact-ref",
  "build-artifact-digest",
  "excluded-known-item",
  "release-owner",
  "release-owner-review-ref",
  "risk-owner",
  "environment-owner",
  "release-approval-ref",
  "runtime-smoke-ref",
  "runtime-smoke-digest",
  "runtime-smoke-type",
  "runtime-smoke-user-note-only",
  "rollback-ref",
  "rollback-digest",
  "rollback-window",
  "monitoring-ref",
  "monitoring-digest",
  "incident-owner-ref",
  "support-handoff-ref",
  "target-environment",
  "config-owner",
  "secrets-required",
  "dns-or-callback-required",
  "migration-required",
  "migration-plan-ref",
  "backup-or-restore-ref",
  "data-owner-ref",
  "cost-owner-ref",
  "quota-risk",
  "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._.slice(1).join(" ") || "prepare release owner review").trim();
const outputPath = args.out ? resolveOutputPath(projectRoot, args.out) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!["human", "json"].includes(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human or --json.");
  process.exit(1);
}

const report = buildReport(projectRoot);

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport(root) {
  const releaseTarget = normalizeReleaseTarget(args["release-target"]);
  const git = gitState(root);
  const sourceRevision = String(args["source-revision"] || git.revision || "unknown");
  const dirtyStatus = normalizeDirtyStatus(String(args["dirty-worktree-status"] || git.dirty || "unknown"));
  const releaseCandidateRef = String(args["release-candidate-ref"] || `artifact:release-candidates/001-${slugify(intent)}.md`);
  const taskRefs = splitList(args["task-ref"]);
  const completionRefs = splitList(args["completion-evidence-ref"]);
  const excluded = splitList(args["excluded-known-item"]);
  const buildArtifactRef = String(args["build-artifact-ref"] || "missing");
  const buildArtifactDigest = String(args["build-artifact-digest"] || artifactDigestOrEmpty(root, buildArtifactRef) || digest(`${releaseCandidateRef}:${sourceRevision}:${buildArtifactRef}`));
  const sourceChain = buildSourceChain(root, completionRefs);
  const completionEvidenceSet = buildCompletionEvidenceSet(root, completionRefs, taskRefs);
  const targetRequirements = requirementsFor(releaseTarget);
  const ownerState = ownerStateFor(releaseTarget);
  const runtime = runtimeReadiness(root);
  const rollback = rollbackReadiness(root, releaseTarget);
  const monitoring = monitoringReadiness(root, releaseTarget);
  const environment = environmentReadiness(releaseTarget);
  const migration = dataMigrationReadiness(releaseTarget);
  const costQuota = costQuotaReadiness(releaseTarget);
  const existingRules = existingReleaseRuleMapping();
  const missing = missingEvidenceFor({
    releaseTarget,
    releaseScope: { sourceRevision, dirtyStatus, completionRefs, buildArtifactRef },
    targetRequirements,
    ownerState,
    runtime,
    rollback,
    monitoring,
    environment,
    migration,
    sourceChain,
    existingRules,
  });
  const gateState = gateStateFor(releaseTarget, missing, ownerState);
  const canHandoff = ["READY_FOR_INTERNAL_TRIAL_REVIEW", "READY_FOR_RELEASE_OWNER_REVIEW"].includes(gateState) ? "Yes" : "No";
  const baseEvidence = {
    schema_version: "1.80.0",
    artifact_type: "release_evidence_gate",
    intent,
    intent_digest: digest(intent),
    release_evidence_digest: "",
    release_target: releaseTarget,
    release_scope: {
      release_candidate_ref: releaseCandidateRef,
      release_candidate_digest: digest(`${releaseCandidateRef}:${sourceRevision}:${completionRefs.join(",")}`),
      source_revision: sourceRevision,
      dirty_worktree_status: dirtyStatus,
      included_task_refs: taskRefs,
      included_completion_evidence_refs: completionRefs,
      excluded_known_items: excluded,
      build_artifact_ref: buildArtifactRef,
      build_artifact_digest: buildArtifactDigest,
    },
    gate_state: gateState,
    can_handoff_to_release_owner: canHandoff,
    release_or_production_approved: "No",
    source_chain: sourceChain,
    release_target_requirements: [targetRequirements],
    required_evidence: targetRequirements.required_evidence_ids,
    missing_evidence: missing,
    completion_evidence_set: completionEvidenceSet,
    owner_readiness: ownerState.owner_readiness,
    owner_decisions: ownerDecisionsFor(ownerState, releaseTarget, missing),
    runtime_readiness: runtime,
    rollback_readiness: rollback,
    monitoring_readiness: monitoring,
    environment_readiness: environment,
    data_migration_readiness: migration,
    cost_quota_readiness: costQuota,
    existing_release_rule_mapping: existingRules,
    forbidden_actions: forbiddenActions(),
    boundaries: boundariesFor(),
    next_step: nextStepFor(gateState, missing),
  };
  const structuredEvidence = {
    ...baseEvidence,
    release_evidence_digest: evidenceDigest(baseEvidence, ["release_evidence_digest"]),
  };
  return {
    reportType: "RELEASE_EVIDENCE_GATE",
    schemaVersion: "1.80.0",
    generatedBy: "scripts/resolve-release-evidence-gate.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      releaseTarget,
      releaseCandidateRef,
      gateState,
      canHandoffToReleaseOwner: canHandoff,
      releaseOrProductionApproved: "No",
      safeNextStep: structuredEvidence.next_step,
    },
    structuredEvidence,
    outcome: gateState,
  };
}

function buildCompletionEvidenceSet(root, completionRefs, taskRefs) {
  return completionRefs.map((ref) => {
    const resolved = resolveArtifact(root, ref);
    if (!resolved) {
      return {
        ref,
        status: "UNRESOLVED",
        digest: "",
        task_ref: "",
        intent_digest: "",
        completion_state: "",
        can_claim_complete: "No",
        strict_check: "FAIL",
        current_release_match: "Yes",
        task_ref_in_release_scope: "Unknown",
        reason: "Completion Evidence reference did not resolve to a local artifact.",
      };
    }
    const content = fs.readFileSync(resolved, "utf8");
    const extracted = extractMachineReadableEvidence(content);
    const evidence = extracted?.ok ? extracted.value : null;
    const taskRef = String(evidence?.task_ref || "");
    const strict = runCompletionStrictCheck(root, resolved);
    return {
      ref,
      status: evidence ? "RECORDED" : "INVALID",
      digest: fileDigest(resolved),
      task_ref: taskRef,
      intent_digest: String(evidence?.intent_digest || ""),
      completion_state: String(evidence?.completion_state || ""),
      can_claim_complete: yesNo(evidence?.can_claim_complete === "Yes"),
      strict_check: strict.ok ? "PASS" : "FAIL",
      current_release_match: "Yes",
      task_ref_in_release_scope: taskRefs.length === 0 ? "Unknown" : yesNo(taskRefs.includes(taskRef)),
      reason: strict.ok
        ? "Completion Evidence resolves and strict checker passes."
        : `Completion Evidence strict checker failed: ${strict.reason}`,
    };
  });
}

function buildSourceChain(root, completionRefs) {
  const sources = [
    ["completion_evidence", completionRefs[0] || ""],
    ["test_evidence", args["test-evidence-ref"]],
    ["execution_assurance", args["execution-assurance-ref"]],
    ["product_completeness", args["product-completeness-ref"]],
    ["launch_review_view", args["launch-review-ref"]],
    ["release_plan", args["release-plan-ref"]],
    ["platform_release_recipe", args["platform-recipe-ref"]],
    ["release_handoff_pack", args["release-handoff-ref"]],
    ["existing_release_rule", args["existing-release-rule-ref"]],
    ["human_decision", args["release-owner-review-ref"] || args["release-approval-ref"]],
  ];
  return sources.map(([name, refValue]) => sourceFor(root, name, refValue, completionRefs));
}

function sourceFor(root, name, refValue, completionRefs) {
  const ref = String(refValue || "").trim();
  if (!ref) {
    return {
      name,
      status: name === "completion_evidence" ? "NOT_PROVIDED" : "OPTIONAL",
      ref: "",
      digest: "",
      source_outcome: "",
      current_release_match: "N/A",
      reason: name === "completion_evidence" ? "Completion Evidence is required for release review." : "Optional source was not provided.",
    };
  }
  const resolved = resolveArtifact(root, ref);
  if (!resolved) {
    return {
      name,
      status: "UNRESOLVED",
      ref,
      digest: "",
      source_outcome: "",
      current_release_match: "Unknown",
      reason: "Source reference did not resolve to a local artifact.",
    };
  }
  const content = fs.readFileSync(resolved, "utf8");
  const extracted = extractMachineReadableEvidence(content);
  const evidence = extracted?.ok ? extracted.value : null;
  return {
    name,
    status: extracted?.ok || name === "existing_release_rule" || name === "human_decision" ? "RECORDED" : "INVALID",
    ref,
    digest: fileDigest(resolved),
    source_outcome: sourceOutcomeFor(name, evidence, content),
    current_release_match: completionRefs.includes(ref) || name !== "completion_evidence" ? "Yes" : "Unknown",
    reason: extracted?.ok
      ? "Source artifact has machine-readable evidence."
      : "Source artifact is recorded; machine-readable evidence is unavailable or not required for this source.",
  };
}

function missingEvidenceFor(input) {
  const missing = [];
  const required = new Set(input.targetRequirements.required_evidence_ids);
  if (required.has("completion-evidence") && input.releaseScope.completionRefs.length === 0) missing.push("completion-evidence");
  if (required.has("build-or-preview-evidence") && !isConcrete(input.releaseScope.buildArtifactRef)) missing.push("build-or-preview-evidence");
  if (required.has("release-owner") && input.ownerState.releaseOwnerIdentified !== "Yes") missing.push("release-owner");
  if (required.has("risk-owner") && input.ownerState.riskOwnerIdentified !== "Yes") missing.push("risk-owner");
  if (required.has("environment-owner") && input.ownerState.environmentOwnerIdentified !== "Yes") missing.push("environment-owner");
  if (required.has("runtime-smoke") && !isConcrete(input.runtime.runtime_smoke_ref)) missing.push("runtime-smoke");
  if (required.has("rollback") && input.rollback.blocked_by_missing_rollback === "Yes") missing.push("rollback");
  if (required.has("monitoring") && input.monitoring.blocked_by_missing_monitoring === "Yes") missing.push("monitoring");
  if (required.has("incident-owner") && !isConcrete(input.monitoring.incident_owner_ref)) missing.push("incident-owner");
  if (required.has("environment-config") && input.environment.blocked_by_environment_config === "Yes") missing.push("environment-config");
  if (required.has("platform-recipe") && !hasRecordedSource(input.sourceChain, "platform_release_recipe")) missing.push("platform-recipe");
  if (required.has("release-handoff-pack") && !hasRecordedSource(input.sourceChain, "release_handoff_pack")) missing.push("release-handoff-pack");
  if (required.has("data-migration-decision") && input.migration.migration_required === "Unknown") missing.push("data-migration-decision");
  if (isProductionLike(input.releaseTarget) && input.releaseScope.dirtyStatus !== "clean") missing.push("clean-source-revision");
  if (isProductionLike(input.releaseTarget) && input.releaseScope.sourceRevision === "unknown") missing.push("known-source-revision");
  for (const source of input.sourceChain) {
    if (source.name === "completion_evidence" && source.status !== "RECORDED") missing.push("completion-evidence-source");
  }
  for (const mapping of input.existingRules) {
    if (["PROJECT_STRONGER_RULE", "NEEDS_OWNER", "MISSING"].includes(mapping.mapping_state)) {
      missing.push(`existing-rule:${mapping.intentos_requirement}`);
    }
  }
  return Array.from(new Set(missing));
}

function requirementsFor(target) {
  const matrix = {
    preview: ["completion-evidence", "build-or-preview-evidence", "runtime-smoke", "release-owner"],
    internal_trial: ["completion-evidence", "runtime-smoke", "rollback", "release-owner"],
    staging: ["completion-evidence", "environment-config", "runtime-smoke", "monitoring", "rollback", "release-owner"],
    production_review: ["completion-evidence", "release-owner", "risk-owner", "environment-owner", "rollback", "monitoring", "runtime-smoke", "incident-owner", "data-migration-decision", "release-handoff-pack"],
    app_store_review: ["completion-evidence", "platform-recipe", "release-owner", "risk-owner", "environment-owner", "runtime-smoke", "rollback", "release-handoff-pack"],
    mini_program_review: ["completion-evidence", "platform-recipe", "release-owner", "risk-owner", "environment-owner", "runtime-smoke", "rollback", "release-handoff-pack"],
    unknown: ["release-target", "release-owner"],
  };
  return {
    target,
    required_evidence_ids: matrix[target] || matrix.unknown,
  };
}

function ownerStateFor(target) {
  const releaseOwner = String(args["release-owner"] || "").trim();
  const riskOwner = String(args["risk-owner"] || "").trim();
  const environmentOwner = String(args["environment-owner"] || "").trim();
  const releaseOwnerReviewRef = String(args["release-owner-review-ref"] || (isConcrete(releaseOwner) ? "pending" : "missing"));
  const releaseApprovalRef = String(args["release-approval-ref"] || "out_of_scope");
  const riskOwnerRef = isConcrete(riskOwner) ? riskOwner : (isProductionLike(target) ? "missing" : "not_applicable");
  const environmentOwnerRef = isConcrete(environmentOwner) ? environmentOwner : (isProductionLike(target) ? "missing" : "not_applicable");
  return {
    releaseOwnerIdentified: isConcrete(releaseOwner) ? "Yes" : "No",
    releaseOwnerReviewRef,
    riskOwnerIdentified: isConcrete(riskOwner) ? "Yes" : "No",
    environmentOwnerIdentified: isConcrete(environmentOwner) ? "Yes" : "No",
    releaseApprovalRef,
    owner_readiness: {
      release_owner_ref: isConcrete(releaseOwner) ? releaseOwner : "missing",
      release_owner_review_ref: releaseOwnerReviewRef,
      risk_owner_ref: riskOwnerRef,
      environment_owner_ref: environmentOwnerRef,
      release_approval_ref: releaseApprovalRef,
      release_approval_state: releaseApprovalStateFor(releaseApprovalRef),
      release_or_production_approved: "No",
    },
  };
}

function runtimeReadiness(root) {
  const runtimeSmokeRef = String(args["runtime-smoke-ref"] || "missing");
  return {
    runtime_smoke_ref: runtimeSmokeRef,
    runtime_smoke_digest: artifactDigestOrEmpty(root, runtimeSmokeRef, args["runtime-smoke-digest"]),
    runtime_smoke_evidence_type: normalizeRuntimeSmokeType(args["runtime-smoke-type"]),
    runtime_smoke_user_note_only: yesNo(args["runtime-smoke-user-note-only"], "No"),
  };
}

function rollbackReadiness(root, target) {
  const rollbackRef = String(args["rollback-ref"] || "missing");
  const rollbackWindow = normalizeRollbackWindow(args["rollback-window"]);
  return {
    rollback_ref: rollbackRef,
    rollback_digest: artifactDigestOrEmpty(root, rollbackRef, args["rollback-digest"]),
    rollback_window: rollbackWindow,
    blocked_by_missing_rollback: isProductionLike(target) || target === "staging" || target === "internal_trial"
      ? yesNo(!isConcrete(rollbackRef) || rollbackWindow === "missing")
      : "No",
  };
}

function monitoringReadiness(root, target) {
  const monitoringRef = String(args["monitoring-ref"] || "missing");
  const incidentOwnerRef = String(args["incident-owner-ref"] || "missing");
  const supportHandoffRef = String(args["support-handoff-ref"] || "missing");
  const blocked = isProductionLike(target) || target === "staging"
    ? !isConcrete(monitoringRef) || !isConcrete(incidentOwnerRef)
    : false;
  return {
    monitoring_ref: monitoringRef,
    monitoring_digest: artifactDigestOrEmpty(root, monitoringRef, args["monitoring-digest"]),
    incident_owner_ref: incidentOwnerRef,
    support_handoff_ref: supportHandoffRef,
    blocked_by_missing_monitoring: yesNo(blocked),
  };
}

function environmentReadiness(target) {
  const targetEnvironment = normalizeTargetEnvironment(args["target-environment"], target);
  const configOwner = String(args["config-owner"] || "missing");
  const secretsRequired = normalizeYesNoUnknown(args["secrets-required"], targetEnvironment === "production-like" ? "Unknown" : "No");
  const dnsOrCallback = normalizeYesNoUnknown(args["dns-or-callback-required"], targetEnvironment === "production-like" ? "Unknown" : "No");
  const blocked = targetEnvironment === "production-like"
    && (!isConcrete(configOwner) || secretsRequired === "Unknown" || dnsOrCallback === "Unknown");
  return {
    target_environment: targetEnvironment,
    config_owner: configOwner,
    secrets_required: secretsRequired,
    secrets_values_recorded: "No",
    dns_or_callback_changes_required: dnsOrCallback,
    blocked_by_environment_config: yesNo(blocked),
  };
}

function dataMigrationReadiness(target) {
  const migrationRequired = normalizeYesNoUnknown(args["migration-required"], isProductionLike(target) ? "Unknown" : "No");
  return {
    migration_required: migrationRequired,
    migration_plan_ref: String(args["migration-plan-ref"] || "missing"),
    backup_or_restore_ref: String(args["backup-or-restore-ref"] || "missing"),
    data_owner_ref: String(args["data-owner-ref"] || "missing"),
    codex_may_execute_migration: "No",
  };
}

function costQuotaReadiness(target) {
  const quotaRisks = splitList(args["quota-risk"]);
  const costOwner = String(args["cost-owner-ref"] || (quotaRisks.length > 0 ? "missing" : "not_applicable"));
  return {
    cost_owner_ref: costOwner,
    quota_risks: quotaRisks,
    blocked_by_unknown_quota: yesNo(isProductionLike(target) && quotaRisks.length > 0 && !isConcrete(costOwner)),
  };
}

function existingReleaseRuleMapping() {
  const ref = String(args["existing-release-rule-ref"] || "").trim();
  if (!ref) return [{
    project_rule_ref: "not_applicable",
    intentos_requirement: "release evidence gate",
    mapping_state: "NOT_APPLICABLE",
  }];
  return [{
    project_rule_ref: ref,
    intentos_requirement: "release evidence gate",
    mapping_state: normalizeExistingRuleState(args["existing-release-rule-state"]),
  }];
}

function gateStateFor(target, missing, ownerState) {
  if (target === "unknown") return "NOT_READY_FOR_RELEASE_REVIEW";
  if (missing.length > 0) return "BLOCKED_BY_MISSING_RELEASE_EVIDENCE";
  if (ownerState.releaseOwnerIdentified !== "Yes") return "BLOCKED_BY_HUMAN_RELEASE_DECISION";
  if (target === "preview" || target === "internal_trial") return "READY_FOR_INTERNAL_TRIAL_REVIEW";
  return "READY_FOR_RELEASE_OWNER_REVIEW";
}

function ownerDecisionsFor(ownerState, target, missing) {
  const decisions = [];
  if (ownerState.releaseOwnerIdentified !== "Yes") decisions.push("Identify the human release owner.");
  if (isProductionLike(target) && ownerState.riskOwnerIdentified !== "Yes") decisions.push("Identify the risk owner.");
  if (isProductionLike(target) && ownerState.environmentOwnerIdentified !== "Yes") decisions.push("Identify the environment/config owner.");
  if (missing.includes("data-migration-decision")) decisions.push("Confirm whether data migration is required.");
  if (ownerState.releaseApprovalRef !== "out_of_scope" && ownerState.releaseApprovalRef !== "pending" && !ownerState.releaseApprovalRef.startsWith("human-decision:")) {
    decisions.push("Keep release approval outside this gate unless a human decision record exists.");
  }
  if (decisions.length === 0) decisions.push("No release approval is granted; handoff is for review only.");
  return decisions;
}

function nextStepFor(state, missing) {
  if (state === "READY_FOR_RELEASE_OWNER_REVIEW") return "Hand the evidence package to the human release owner for formal review; do not deploy from this report.";
  if (state === "READY_FOR_INTERNAL_TRIAL_REVIEW") return "Hand the evidence package to the trial/review owner; do not treat it as production approval.";
  if (missing.length > 0) return `Collect or map missing release evidence first: ${missing.slice(0, 4).join(", ")}.`;
  return "Clarify the release target before preparing release review evidence.";
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  return `# Release Evidence Gate Report

## Human Summary

| Field | Value |
|---|---|
| Release Candidate | ${evidence.release_scope.release_candidate_ref} |
| Release Target | ${evidence.release_target} |
| Gate State | ${evidence.gate_state} |
| Can Handoff To Release Owner | ${evidence.can_handoff_to_release_owner} |
| Release Or Production Approved | ${evidence.release_or_production_approved} |

## Release Scope

| Field | Value |
|---|---|
| Source Revision | ${evidence.release_scope.source_revision} |
| Dirty Worktree Status | ${evidence.release_scope.dirty_worktree_status} |
| Build Artifact | ${evidence.release_scope.build_artifact_ref} |
| Build Artifact Digest | ${evidence.release_scope.build_artifact_digest} |
| Completion Evidence Count | ${evidence.release_scope.included_completion_evidence_refs.length} |

## Release Target Requirements

${markdownList(evidence.release_target_requirements[0].required_evidence_ids)}

## Source Chain

| Source | Status | Ref | Current Release Match | Outcome |
|---|---|---|---|---|
${evidence.source_chain.map((source) => `| ${source.name} | ${source.status} | ${source.ref || "not provided"} | ${source.current_release_match} | ${source.source_outcome || "not provided"} |`).join("\n")}

## Completion Evidence Set

| Ref | Status | Task Ref | Strict Check | Current Release Match | Task In Release Scope |
|---|---|---|---|---|---|
${evidence.completion_evidence_set.map((item) => `| ${item.ref} | ${item.status} | ${item.task_ref || "not provided"} | ${item.strict_check} | ${item.current_release_match} | ${item.task_ref_in_release_scope} |`).join("\n")}

## Owner And Approval

| Field | Value |
|---|---|
| Release Owner Identified | ${evidence.owner_decisions.some((item) => /Identify the human release owner/i.test(item)) ? "No" : "Yes"} |
| Release Owner Ref | ${evidence.owner_readiness.release_owner_ref} |
| Release Owner Review Ref | ${evidence.owner_readiness.release_owner_review_ref} |
| Risk Owner Ref | ${evidence.owner_readiness.risk_owner_ref} |
| Environment Owner Ref | ${evidence.owner_readiness.environment_owner_ref} |
| Release Approval Ref | ${evidence.owner_readiness.release_approval_ref} |
| Release Approval State | ${evidence.owner_readiness.release_approval_state} |
| Release Approval | ${evidence.release_or_production_approved} |
| Owner Decisions | ${evidence.owner_decisions.join("; ")} |

## Environment Readiness

| Field | Value |
|---|---|
| Target Environment | ${evidence.environment_readiness.target_environment} |
| Config Owner | ${evidence.environment_readiness.config_owner} |
| Secrets Required | ${evidence.environment_readiness.secrets_required} |
| Secret Values Recorded | ${evidence.environment_readiness.secrets_values_recorded} |
| DNS Or Callback Changes Required | ${evidence.environment_readiness.dns_or_callback_changes_required} |
| Blocked By Environment Config | ${evidence.environment_readiness.blocked_by_environment_config} |

## Runtime And Rollback

| Field | Value |
|---|---|
| Runtime Smoke Ref | ${evidence.runtime_readiness.runtime_smoke_ref} |
| Runtime Smoke Digest | ${evidence.runtime_readiness.runtime_smoke_digest} |
| Runtime Smoke User Note Only | ${evidence.runtime_readiness.runtime_smoke_user_note_only} |
| Rollback Ref | ${evidence.rollback_readiness.rollback_ref} |
| Rollback Digest | ${evidence.rollback_readiness.rollback_digest} |
| Rollback Window | ${evidence.rollback_readiness.rollback_window} |
| Monitoring Ref | ${evidence.monitoring_readiness.monitoring_ref} |
| Monitoring Digest | ${evidence.monitoring_readiness.monitoring_digest} |
| Incident Owner Ref | ${evidence.monitoring_readiness.incident_owner_ref} |

## Data Migration And Cost

| Field | Value |
|---|---|
| Migration Required | ${evidence.data_migration_readiness.migration_required} |
| Migration Plan Ref | ${evidence.data_migration_readiness.migration_plan_ref} |
| Codex May Execute Migration | ${evidence.data_migration_readiness.codex_may_execute_migration} |
| Cost Owner Ref | ${evidence.cost_quota_readiness.cost_owner_ref} |
| Blocked By Unknown Quota | ${evidence.cost_quota_readiness.blocked_by_unknown_quota} |

## Existing Project Release Rules

| Project Rule | IntentOS Requirement | Mapping State |
|---|---|---|
${evidence.existing_release_rule_mapping.map((item) => `| ${item.project_rule_ref} | ${item.intentos_requirement} | ${item.mapping_state} |`).join("\n")}

## Missing Evidence

${markdownList(evidence.missing_evidence)}

## Boundaries

| Boundary | Value |
|---|---|
| This report writes target files | ${evidence.boundaries.writes_target_files} |
| This report approves release or production | ${evidence.boundaries.approves_release_or_production} |
| This report executes deployment | ${evidence.boundaries.executes_deployment} |
| This report executes migration | ${evidence.boundaries.executes_migration} |
| This report uses or records secrets | ${evidence.boundaries.uses_or_records_secrets} |
| This report submits to app store or mini program | ${evidence.boundaries.submits_to_app_store_or_mini_program} |
| This report changes DNS, payment, provider, or CI | ${evidence.boundaries.changes_dns_payment_provider_or_ci} |
| This report proves real-user stability | ${evidence.boundaries.proves_real_user_stability} |

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

\`${evidence.gate_state}\`

## Next Step

${evidence.next_step}
`;
}

function normalizeReleaseTarget(value) {
  const normalized = String(value || "unknown").trim().toLowerCase().replace(/-/g, "_");
  const allowed = new Set(["preview", "internal_trial", "staging", "production_review", "app_store_review", "mini_program_review", "unknown"]);
  if (allowed.has(normalized)) return normalized;
  if (/prod/.test(normalized)) return "production_review";
  if (/mini|wechat|weixin/.test(normalized)) return "mini_program_review";
  if (/store|testflight|play/.test(normalized)) return "app_store_review";
  return "unknown";
}

function normalizeDirtyStatus(value) {
  const normalized = String(value || "unknown").toLowerCase();
  if (["clean", "dirty", "unknown"].includes(normalized)) return normalized;
  return "unknown";
}

function normalizeRuntimeSmokeType(value) {
  const normalized = String(value || "missing").toLowerCase().replace(/_/g, "-");
  if (normalized === "command-output") return "command-output";
  if (normalized === "manual-report") return "manual-report";
  if (normalized === "artifact") return "artifact";
  if (normalized === "not-applicable") return "not_applicable";
  return "missing";
}

function normalizeRollbackWindow(value) {
  const normalized = String(value || "missing").toLowerCase().replace(/-/g, "_");
  if (normalized === "defined" || normalized === "missing" || normalized === "not_applicable") return normalized;
  return "missing";
}

function normalizeTargetEnvironment(value, target) {
  const normalized = String(value || "").toLowerCase().replace(/-/g, "_");
  if (normalized === "preview" || normalized === "staging" || normalized === "unknown") return normalized;
  if (normalized === "production_like" || normalized === "production-like") return "production-like";
  if (isProductionLike(target)) return "production-like";
  if (target === "staging") return "staging";
  if (target === "preview" || target === "internal_trial") return "preview";
  return "unknown";
}

function normalizeYesNoUnknown(value, fallback) {
  const normalized = String(value || fallback || "Unknown").toLowerCase();
  if (normalized === "yes") return "Yes";
  if (normalized === "no") return "No";
  return "Unknown";
}

function normalizeExistingRuleState(value) {
  const normalized = String(value || "NEEDS_OWNER").trim().toUpperCase();
  const allowed = new Set(["PROJECT_STRONGER_RULE", "PROJECT_WEAKER_RULE", "MATCHED", "MISSING", "NEEDS_OWNER", "NOT_APPLICABLE"]);
  return allowed.has(normalized) ? normalized : "NEEDS_OWNER";
}

function releaseApprovalStateFor(value) {
  const ref = String(value || "out_of_scope");
  if (ref === "out_of_scope") return "out_of_scope";
  if (ref === "pending") return "pending";
  if (ref.startsWith("human-decision:")) return "human_decision_recorded";
  return "invalid";
}

function sourceOutcomeFor(name, evidence, content) {
  if (evidence) {
    return String(
      evidence.completion_state
      || evidence.test_evidence_state
      || evidence.assurance_state
      || evidence.release_plan_state
      || evidence.launch_review_state
      || evidence.outcome
      || "RECORDED"
    );
  }
  if (/READY_FOR_HANDOFF_REVIEW|HANDOFF_PACK_RECORDED/i.test(content)) return "HANDOFF_PACK_RECORDED";
  if (/PROJECT_STRONGER_RULE|MATCHED|NEEDS_OWNER/i.test(content)) return "EXISTING_RULE_RECORDED";
  return "RECORDED";
}

function gitState(root) {
  const result = spawnSync("git", ["-C", root, "rev-parse", "--is-inside-work-tree"], { encoding: "utf8" });
  if (result.status !== 0) return { revision: "unknown", dirty: "unknown" };
  const rev = spawnSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" });
  const status = spawnSync("git", ["-C", root, "status", "--short"], { encoding: "utf8" });
  return {
    revision: rev.status === 0 ? `git:${rev.stdout.trim()}` : "unknown",
    dirty: status.status === 0 && status.stdout.trim() === "" ? "clean" : "dirty",
  };
}

function resolveArtifact(root, reference) {
  const value = String(reference || "").replace(/^artifact:/, "");
  if (!value || value === "missing" || value === "pending" || value === "out_of_scope") return "";
  if (path.isAbsolute(value)) return "";
  const candidates = [
    path.resolve(root, value),
    path.resolve(process.cwd(), value),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return "";
}

function artifactDigestOrEmpty(root, reference, provided) {
  const explicit = String(provided || "").trim();
  if (explicit) return explicit;
  const resolved = resolveArtifact(root, reference);
  return resolved ? fileDigest(resolved) : "";
}

function runCompletionStrictCheck(root, resolved) {
  const report = path.relative(root, resolved);
  if (report.startsWith("..") || path.isAbsolute(report)) {
    return { ok: false, reason: "Completion Evidence report is outside the target project." };
  }
  const checker = path.join(path.dirname(new URL(import.meta.url).pathname), "check-completion-evidence.mjs");
  const result = spawnSync(process.execPath, [
    checker,
    root,
    "--report",
    report,
    "--require-structured-evidence",
    "--require-source-refs",
    "--require-ready",
  ], { encoding: "utf8" });
  return {
    ok: result.status === 0,
    reason: firstUsefulLine(result.stderr || result.stdout),
  };
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function resolveOutputPath(root, requested) {
  const candidate = path.resolve(root, String(requested));
  const relative = path.relative(root, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error(`FAIL --out must stay inside target project: ${requested}`);
    process.exit(1);
  }
  return candidate;
}

function splitList(value) {
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function isConcrete(value) {
  return Boolean(value) && !/^(missing|unknown|n\/a|not_applicable|not provided|out_of_scope)$/i.test(String(value).trim());
}

function hasRecordedSource(sources, name) {
  return sources.some((source) => source.name === name && source.status === "RECORDED");
}

function isProductionLike(target) {
  return ["production_review", "app_store_review", "mini_program_review"].includes(target);
}

function yesNo(value, fallback = "") {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "yes") return "Yes";
    if (normalized === "no") return "No";
  }
  if (fallback) return fallback;
  return value ? "Yes" : "No";
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
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

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "release-review";
}

function markdownList(items) {
  if (!items || items.length === 0) return "- None.";
  return items.map((item) => `- ${item}`).join("\n");
}

function forbiddenActions() {
  return [
    "release approval",
    "production deployment",
    "provider or DNS mutation",
    "payment or secret changes",
    "migration execution",
    "app store or mini-program submission",
    "CI/CD mutation",
  ];
}

function boundariesFor() {
  return {
    writes_target_files: "No",
    approves_release_or_production: "No",
    executes_deployment: "No",
    executes_migration: "No",
    uses_or_records_secrets: "No",
    submits_to_app_store_or_mini_program: "No",
    changes_dns_payment_provider_or_ci: "No",
    proves_real_user_stability: "No",
  };
}
