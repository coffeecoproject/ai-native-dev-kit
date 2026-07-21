#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { evidenceDigest } from "./lib/artifact-schema.mjs";
import { deriveBusinessUniverseRouting } from "./lib/business-universe.mjs";
import { deriveControlEffectivenessRouting } from "./lib/control-effectiveness.mjs";
import { applyMonotonicTaskDepth, minimumTaskObligations, taskBehaviorClass } from "./lib/task-obligations.mjs";
import {
  normalizeTaskIntent,
  resolveWorkQueueTaskIdentity,
  TASK_IDENTITY_VERSION,
  taskIntentDigest,
} from "./lib/task-entry-binding.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "out", "task-kind", "work-queue-item"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = normalizeTaskIntent(args.intent || args._.slice(1).join(" ") || "classify task governance");
const explicitTaskKind = args["task-kind"] ? String(args["task-kind"]) : "";
const outputPath = args.out ? resolveOutputPath(projectRoot, String(args.out)) : "";
const workQueueItemRef = String(args["work-queue-item"] || "").trim();

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!["human", "json"].includes(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human or --json.");
  process.exit(1);
}

const report = buildReport();

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport() {
  const taskGovernanceRef = outputPath
    ? path.relative(projectRoot, outputPath).replaceAll(path.sep, "/")
    : "task-governance-reports/generated.md";
  const taskIdentity = taskIdentityFor(taskGovernanceRef);
  let classification = classifyIntent(intent, explicitTaskKind);
  classification = enforceTaskKindFloor(classification);
  const adoptionReview = adoptionReviewFor(projectRoot);
  let businessUniverseRouting = deriveBusinessUniverseRouting({
    intent,
    projectRoot,
    taskImpact: classification.task_impact,
    taskKind: classification.task_kind,
  });
  classification = stabilizeClassification(classification, businessUniverseRouting);
  businessUniverseRouting = deriveBusinessUniverseRouting({
    intent,
    projectRoot,
    taskImpact: classification.task_impact,
    taskKind: classification.task_kind,
    preflight: businessUniverseRouting.preflight,
  });
  const controlEffectivenessRouting = deriveControlEffectivenessRouting({
    intent,
    projectRoot,
    taskImpact: classification.task_impact,
  });
  const obligations = applyMonotonicTaskDepth(minimumTaskObligations({
    taskImpact: classification.task_impact,
    taskKind: classification.task_kind,
  }), {
    businessUniverseRequired: businessUniverseRouting.required,
    controlEffectivenessRequired: controlEffectivenessRouting.required,
  });
  const requiredBeforeImplementation = obligations.beforeImplementation;
  const requiredBeforeCompletion = obligations.beforeCompletion;
  const existingProjectMapping = existingProjectMappingFor(classification.task_impact);
  const blockedBy = blockersFor(classification.task_impact, adoptionReview, requiredBeforeImplementation, requiredBeforeCompletion, existingProjectMapping, businessUniverseRouting, controlEffectivenessRouting);
  const baseEvidence = {
    schema_version: "1.113.0",
    artifact_type: "task_governance",
    intent,
    intent_digest: taskIntentDigest(intent),
    task_governance_ref: taskGovernanceRef,
    task_governance_digest: "",
    task_ref: taskIdentity.task_ref,
    task_lineage: taskIdentity.task_lineage,
    project_adoption_mode: projectAdoptionModeFor(adoptionReview),
    adoption_review: adoptionReview,
    impact_classification: classification,
    business_universe_routing: businessUniverseRouting,
    control_effectiveness_routing: controlEffectivenessRouting,
    required_before_implementation_review: requiredBeforeImplementation,
    required_before_completion_claim: requiredBeforeCompletion,
    review_policy: reviewPolicyFor(classification.task_impact, businessUniverseRouting, controlEffectivenessRouting),
    source_chain: sourceChainFor(intent, classification, adoptionReview, controlEffectivenessRouting),
    existing_project_mapping: existingProjectMapping,
    readiness: {
      governance_prerequisites_satisfied: blockedBy.length === 0 ? "Yes" : "No",
      ready_for_implementation_review: blockedBy.length === 0 && classification.task_impact !== "POSSIBLE_HIGH" ? "Yes" : "No",
      implementation_authorized_by_this_report: "No",
      can_claim_done: "No",
      blocked_by: blockedBy,
    },
    lightweight_closeout: lightweightCloseoutFor(classification.task_impact),
    user_prompt: {
      plain_user_summary: plainUserSummaryFor(classification.task_impact),
      plain_next_step: plainNextStepFor(classification.task_impact),
      technical_terms_required: "No",
    },
    boundaries: boundaryFor(),
    outcome: outcomeFor(classification.task_impact, adoptionReview),
  };
  const structuredEvidence = {
    ...baseEvidence,
    task_governance_digest: evidenceDigest(baseEvidence, ["task_governance_digest"]),
  };
  return {
    reportType: "TASK_GOVERNANCE",
    schemaVersion: "1.113.0",
    generatedBy: "scripts/resolve-task-governance.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot,
    readOnly: true,
    humanSummary: {
      taskImpact: classification.task_impact,
      plainNextStep: structuredEvidence.user_prompt.plain_next_step,
      readyForImplementationReview: structuredEvidence.readiness.ready_for_implementation_review,
      implementationAuthorizedByThisReport: "No",
      canClaimDone: "No",
    },
    impactClassification: classification,
    businessUniverseRouting,
    controlEffectivenessRouting,
    requiredBeforeImplementation,
    requiredBeforeCompletion,
    reviewPolicy: structuredEvidence.review_policy,
    sourceChain: structuredEvidence.source_chain,
    existingProjectMapping: structuredEvidence.existing_project_mapping,
    readiness: structuredEvidence.readiness,
    boundaries: structuredEvidence.boundaries,
    structuredEvidence,
    outcome: structuredEvidence.outcome,
  };
}

function taskIdentityFor(taskGovernanceRef) {
  if (workQueueItemRef) {
    const resolved = resolveWorkQueueTaskIdentity(projectRoot, workQueueItemRef, { requireCurrent: true });
    if (!resolved.ok) {
      console.error(`FAIL ${resolved.error}`);
      process.exit(1);
    }
    if (resolved.identity.intent !== intent || resolved.identity.intent_digest !== taskIntentDigest(intent)) {
      console.error("FAIL Task Governance intent text and digest must exactly match the selected Work Queue item.");
      process.exit(1);
    }
    return {
      task_ref: resolved.identity.task_ref,
      task_lineage: {
        identity_version: TASK_IDENTITY_VERSION,
        authority: "WORK_QUEUE_ITEM",
        work_queue_item_ref: resolved.identity.work_queue_item_ref,
        work_queue_item_digest: resolved.identity.work_queue_item_digest,
      },
    };
  }
  const compatibilityDigest = digest(JSON.stringify({
    identity_version: TASK_IDENTITY_VERSION,
    authority: "UNBOUND_COMPATIBILITY",
    project_root: projectRoot,
    task_governance_ref: taskGovernanceRef,
    intent_digest: taskIntentDigest(intent),
  }));
  return {
    task_ref: `task:${compatibilityDigest.slice("sha256:".length)}`,
    task_lineage: {
      identity_version: TASK_IDENTITY_VERSION,
      authority: "UNBOUND_COMPATIBILITY",
      work_queue_item_ref: "N/A",
      work_queue_item_digest: "N/A",
    },
  };
}

function classifyIntent(value, taskKindOverride) {
  const text = value.toLowerCase();
  const behaviorText = behaviorIntentTextFor(text);
  const inferredTaskKind = taskKindFor(text, behaviorText);
  const explicitKind = String(taskKindOverride || "").trim();
  const rejectedNonBehavioralOverride = explicitKind
    && taskBehaviorClass(inferredTaskKind) === "BEHAVIORAL"
    && taskBehaviorClass(explicitKind) === "NON_BEHAVIORAL";
  const taskKind = explicitKind
    && !rejectedNonBehavioralOverride
    ? explicitKind
    : inferredTaskKind;
  const behavioralTask = taskBehaviorClass(taskKind) === "BEHAVIORAL";
  const highMatches = matchPatterns(text, highImpactPatterns());
  const possibleMatches = matchPatterns(text, possibleHighPatterns());
  const mediumMatches = behavioralTask ? matchPatterns(behaviorText, mediumPatterns()) : [];
  const lowMatches = matchPatterns(text, lowPatterns());
  let taskImpact = behavioralTask ? "POSSIBLE_HIGH" : "LOW";
  let confidence = behavioralTask ? "low" : "medium";
  if (highMatches.length > 0) {
    taskImpact = "HIGH";
    confidence = "high";
  } else if (possibleMatches.length > 0) {
    taskImpact = "POSSIBLE_HIGH";
    confidence = "medium";
  } else if (mediumMatches.length > 0) {
    taskImpact = "MEDIUM";
    confidence = "medium";
  } else if (lowMatches.length > 0 && !behavioralTask) {
    taskImpact = "LOW";
    confidence = "high";
  }
  const unresolvedCodeBehavior = behavioralTask
    && highMatches.length === 0
    && possibleMatches.length === 0
    && mediumMatches.length === 0;
  const effectivePossibleMatches = unresolvedCodeBehavior
    ? ["unclassified code behavior"]
    : possibleMatches;
  const surfaces = surfacesFor(taskImpact, highMatches, mediumMatches, lowMatches, effectivePossibleMatches);
  return {
    task_impact: taskImpact,
    confidence,
    task_kind: taskKind,
    triggered_surfaces: surfaces,
    trigger_evidence: triggerEvidenceFor(taskImpact, highMatches, mediumMatches, lowMatches, effectivePossibleMatches),
    excluded_high_impact_surfaces: excludedHighImpactSurfacesFor(taskImpact, surfaces),
    low_impact_reason: taskImpact === "LOW" ? "Only local non-behavioral text, docs, or visual surface is indicated; no high-impact surface is detected." : "",
    medium_impact_reason: taskImpact === "MEDIUM" ? "The task appears bounded to one local behavior surface with no public API, DB, permission, runtime-state, release, or production impact." : "",
    possible_high_resolution: taskImpact === "POSSIBLE_HIGH"
      ? {
          initial_state: "POSSIBLE_HIGH",
          resolution: "NEEDS_CLARIFICATION_OR_READ_ONLY_INSPECTION",
          inspection_ref: "",
          inspection_digest: "",
          reason: unresolvedCodeBehavior
            ? "The request changes code behavior but does not provide enough evidence to safely classify it as low or medium impact."
            : "The intent contains credible high-impact signals but not enough evidence to safely downgrade.",
        }
      : {
          initial_state: "N/A",
          resolution: "N/A",
          inspection_ref: "",
          inspection_digest: "",
          reason: "",
        },
    upgrade_history: rejectedNonBehavioralOverride && taskImpact === "MEDIUM"
      ? ["LOW->MEDIUM: behavioral task-kind floor"]
      : [],
  };
}

function stabilizeClassification(classification, routing) {
  if (routing.routing_result !== "REQUIRED_WITH_EVIDENCE" || classification.task_impact !== "LOW") return classification;
  return {
    ...classification,
    task_impact: "MEDIUM",
    confidence: "medium",
    triggered_surfaces: [...new Set([...classification.triggered_surfaces, "evidence-backed business-universe coverage"])],
    trigger_evidence: [...new Set([...classification.trigger_evidence, "Lightweight omission-risk preflight found a structural relationship shared by task-relevant behavior."])],
    low_impact_reason: "",
    medium_impact_reason: "A structural omission-risk relationship upgrades the task from LOW to MEDIUM without forcing the HIGH artifact topology.",
    possible_high_resolution: {
      initial_state: "N/A",
      resolution: "N/A",
      inspection_ref: "",
      inspection_digest: "",
      reason: "",
    },
    upgrade_history: [...classification.upgrade_history, "LOW->MEDIUM: business-universe structural evidence"],
  };
}

function enforceTaskKindFloor(classification) {
  if (taskBehaviorClass(classification.task_kind) !== "BEHAVIORAL" || classification.task_impact !== "LOW") return classification;
  return {
    ...classification,
    task_impact: "MEDIUM",
    confidence: "medium",
    triggered_surfaces: [...new Set([...classification.triggered_surfaces, "behavioral implementation"])],
    trigger_evidence: [...new Set([...classification.trigger_evidence, "Behavioral task kinds cannot use the non-behavioral LOW path."])],
    low_impact_reason: "",
    medium_impact_reason: "The task changes behavior and therefore requires the minimum behavioral evidence chain even when its scope is local.",
    upgrade_history: [...classification.upgrade_history, "LOW->MEDIUM: behavioral task-kind floor"],
  };
}

function reviewPolicyFor(impact, businessUniverseRouting, controlEffectivenessRouting) {
  const controlCoverage = controlEffectivenessRouting.required === "Yes" ? ["control effectiveness"] : [];
  if (impact === "LOW") {
    return {
      review_level: "LIGHTWEIGHT",
      codex_self_check_required: "Yes",
      independent_review_required: "No",
      review_must_happen_before: "completion_claim",
      review_must_cover: [
        "scope unchanged",
        "excluded high-impact surfaces",
        "minimal verification or explicit reason",
        "unrelated edits check",
        ...controlCoverage,
      ],
      review_source: "codex_self_check",
      skip_full_review_reason: "LOW tasks use lightweight review only because no high-impact surface is detected.",
    };
  }
  if (impact === "MEDIUM") {
    const coverage = [
      ...(businessUniverseRouting.required === "Yes" ? ["business universe coverage"] : []),
      "business rule closure",
      "change impact coverage",
      "verification plan",
    ];
    return {
      review_level: "TARGETED",
      codex_self_check_required: "Yes",
      independent_review_required: "Conditional",
      review_must_happen_before: "completion_claim",
      review_must_cover: [
        "short plan",
        "bounded impact surface",
        ...coverage,
        ...controlCoverage,
        "excluded high-impact surfaces",
        "targeted verification",
        "unrelated edits check",
      ],
      review_source: "targeted_checker_or_project_review",
      skip_full_review_reason: "MEDIUM tasks do not require the full high-impact chain when the affected surface stays local and bounded.",
    };
  }
  if (impact === "POSSIBLE_HIGH") {
    const coverage = [
      ...(businessUniverseRouting.required === "Yes" ? ["business universe coverage"] : []),
      "business rule closure",
      "change impact coverage",
      "verification plan",
    ];
    return {
      review_level: "BLOCKING_CLARIFICATION",
      codex_self_check_required: "Yes",
      independent_review_required: "Yes",
      review_must_happen_before: "implementation_review",
      review_must_cover: [
        "clarification or read-only inspection",
        "high-impact surface decision",
        "upgrade or downgrade rationale",
        ...coverage,
        ...controlCoverage,
      ],
      review_source: "human_or_read_only_inspection",
      skip_full_review_reason: "POSSIBLE_HIGH tasks cannot skip full review until clarification proves the task is not high impact.",
    };
  }
  const fullCoverage = [
    ...(businessUniverseRouting.required === "Yes" ? ["business universe coverage"] : []),
    ...controlCoverage,
    "business rule closure",
    "change impact coverage",
    "execution plan",
    "verification plan",
    "test evidence",
    "execution assurance",
    "completion evidence",
  ];
  return {
    review_level: "FULL",
    codex_self_check_required: "Yes",
    independent_review_required: "Yes",
    review_must_happen_before: "implementation_and_completion",
    review_must_cover: fullCoverage,
    review_source: "review_loop_or_project_native_review",
    skip_full_review_reason: "HIGH tasks cannot skip the full review chain.",
  };
}

function blockersFor(impact, adoptionReview, beforeImplementation, beforeCompletion, existingProjectMapping = [], businessUniverseRouting = {}, controlEffectivenessRouting = {}) {
  const blocked = [];
  if (adoptionReview.blocks_task_governance === "Yes") blocked.push("blocked by current adoption review source");
  if (impact === "POSSIBLE_HIGH") blocked.push("needs clarification or read-only inspection before implementation");
  if (businessUniverseRouting.required === "Yes") blocked.push("missing evidence-backed Business Universe Coverage");
  if (businessUniverseRouting.routing_result === "TECHNICAL_INSPECTION_REQUIRED") blocked.push("Codex must continue read-only omission-risk inspection");
  if (controlEffectivenessRouting.required === "Yes") blocked.push("missing current effective proof for a relied-on technical control");
  if (controlEffectivenessRouting.routing_result === "TECHNICAL_INSPECTION_REQUIRED") blocked.push("Codex must continue read-only control dependency inspection");
  if (businessUniverseRouting.required === "Yes") {
    blocked.push("missing scenario mapping from Business Universe Coverage into the required evidence chain");
  }
  if (beforeImplementation.business_rule_closure_required === "Yes" && !hasMatchedProjectNativeBehavior(existingProjectMapping, "Business Rule Closure")) {
    blocked.push("missing clear business rule or project-native equivalent");
  }
  if (beforeImplementation.change_impact_coverage_required === "Yes") blocked.push("missing affected-surface map");
  if (beforeImplementation.verification_plan_required === "Yes" && !hasMatchedProjectNativeBehavior(existingProjectMapping, "Verification Plan")) {
    blocked.push("missing verification checklist");
  }
  if (beforeCompletion.test_evidence_required === "Yes") blocked.push("test proof is required before any done claim");
  if (impact === "HIGH") {
    if (beforeImplementation.execution_plan_required === "Yes") blocked.push("missing durable execution plan");
  }
  return blocked;
}

function hasMatchedProjectNativeBehavior(mappings, behavior) {
  return mappings.some((mapping) => mapping.required_behavior === behavior
    && ["MATCHED", "STRONGER"].includes(mapping.mapping_state)
    && mapping.project_native_task_match === "Yes");
}

function sourceChainFor(value, classification, adoptionReview, controlEffectivenessRouting) {
  const sources = [
    {
      name: "task_intent",
      status: "READY",
      ref: "intent:current-request",
      digest: digest(value),
      state: classification.task_impact,
      current_task_match: "Yes",
      not_applicable_reason: "",
    },
    {
      name: "adoption_review",
      status: adoptionReview.state === "N/A" ? "NOT_APPLICABLE" : adoptionReview.blocks_task_governance === "Yes" ? "BLOCKED" : "RECORDED",
      ref: adoptionReview.ref,
      digest: adoptionReview.digest,
      state: adoptionReview.state,
      current_task_match: adoptionReview.current_project_match === "Yes" ? "Yes" : "Unknown",
      not_applicable_reason: adoptionReview.state === "N/A" ? "No current Controlled Native Adoption Review report was found." : "",
    },
  ];
  sources.push({
    name: "control_effectiveness",
    status: controlEffectivenessRouting.required === "Yes" ? "MISSING" : controlEffectivenessRouting.required === "Unknown" ? "BLOCKED" : "NOT_APPLICABLE",
    ref: "control-effectiveness-reports/current-task.md",
    digest: "not provided",
    state: controlEffectivenessRouting.routing_result,
    current_task_match: controlEffectivenessRouting.required === "No" ? "N/A" : "Unknown",
    not_applicable_reason: controlEffectivenessRouting.not_required_reason,
  });
  return sources;
}

function adoptionReviewFor(root) {
  const files = markdownFiles(path.join(root, "native-adoption-review-reports"));
  if (files.length === 0) {
    return {
      ref: "N/A",
      digest: "N/A",
      state: "N/A",
      current_project_match: "Unknown",
      blocks_task_governance: "No",
    };
  }
  const latest = files.sort()[files.length - 1];
  const content = fs.readFileSync(latest, "utf8");
  const state = matchJsonField(content, "outcome") || matchJsonNestedState(content) || "RECORDED";
  const currentProjectMatch = content.includes('"current_project_match": "No"') ? "No" : content.includes('"current_project_match": "Yes"') ? "Yes" : "Unknown";
  const blocks = /BLOCKED_BY_PROJECT_AUTHORITY|BLOCKED_BY_UNSAFE_PROJECT_STATE|FAILED_INVALID_EVIDENCE/i.test(state)
    && currentProjectMatch !== "No";
  return {
    ref: `artifact:${path.relative(root, latest).replaceAll(path.sep, "/")}`,
    digest: digest(content),
    state,
    current_project_match: currentProjectMatch,
    blocks_task_governance: blocks ? "Yes" : "No",
  };
}

function existingProjectMappingFor(impact) {
  if (impact !== "HIGH") return [];
  return [
    {
      required_behavior: "Business Rule Closure",
      project_native_evidence_ref: "N/A",
      project_native_evidence_digest: "N/A",
      project_native_evidence_owner: "N/A",
      project_native_evidence_scope: "N/A",
      project_native_task_match: "N/A",
      project_native_evidence_summary: "No project-native business rule evidence was supplied to this classifier report.",
      mapping_state: "MISSING",
      stronger_project_rule_preserved: "N/A",
      reason: "No project-native business rule evidence was supplied to this classifier report.",
    },
    {
      required_behavior: "Verification Plan",
      project_native_evidence_ref: "N/A",
      project_native_evidence_digest: "N/A",
      project_native_evidence_owner: "N/A",
      project_native_evidence_scope: "N/A",
      project_native_task_match: "N/A",
      project_native_evidence_summary: "No project-native verification plan evidence was supplied to this classifier report.",
      mapping_state: "MISSING",
      stronger_project_rule_preserved: "N/A",
      reason: "No project-native verification plan evidence was supplied to this classifier report.",
    },
  ];
}

function lightweightCloseoutFor(impact) {
  if (impact === "LOW") {
    return {
      scope_unchanged: "Yes",
      minimal_verification_status: "REQUIRED",
      targeted_verification_status: "NOT_APPLICABLE_WITH_REASON",
      unrelated_edits: "No",
      remaining_risk: "Minimal verification is required before a completion claim; none is performed by this read-only classifier.",
    };
  }
  if (impact === "MEDIUM") {
    return {
      scope_unchanged: "Yes",
      minimal_verification_status: "NOT_APPLICABLE_WITH_REASON",
      targeted_verification_status: "REQUIRED",
      unrelated_edits: "No",
      remaining_risk: "Targeted verification is required before a completion claim; none is performed by this read-only classifier.",
    };
  }
  return {
    scope_unchanged: "N/A",
    minimal_verification_status: "NOT_APPLICABLE_WITH_REASON",
    targeted_verification_status: "NOT_APPLICABLE_WITH_REASON",
    unrelated_edits: "No",
    remaining_risk: impact === "POSSIBLE_HIGH" ? "Impact is not yet resolved." : "High-impact governance is required before implementation review.",
  };
}

function plainUserSummaryFor(impact) {
  if (impact === "LOW") return "这是小改动。我会保持范围很小，并在完成前做轻量检查。";
  if (impact === "MEDIUM") return "这是局部功能改动。我会先确认影响范围，再做针对性检查。";
  if (impact === "POSSIBLE_HIGH") return "这个需求可能影响数据、权限或流程状态。我会先只读确认影响范围，不直接改代码。";
  return "这个需求影响较大。我会先梳理业务规则、影响范围和验证方式，再进入实现。";
}

function plainNextStepFor(impact) {
  if (impact === "LOW") return "这个任务看起来是低影响变更。我会保持范围很小，并做最小验证。";
  if (impact === "MEDIUM") return "这个任务是局部行为变更。我会先写短计划，确认影响面，再做针对性验证。";
  if (impact === "POSSIBLE_HIGH") return "这个任务可能影响数据、状态或权限。我会先做只读检查确认影响范围，不直接改代码。";
  return "这个任务影响较大。我会先整理业务规则、影响面、执行计划和验证清单，再进入实现评审。";
}

function outcomeFor(impact, adoptionReview) {
  if (adoptionReview.blocks_task_governance === "Yes") return "BLOCKED_BY_ADOPTION_REVIEW";
  if (impact === "LOW") return "LOW_LIGHTWEIGHT_GOVERNANCE";
  if (impact === "MEDIUM") return "MEDIUM_TARGETED_GOVERNANCE";
  if (impact === "POSSIBLE_HIGH") return "POSSIBLE_HIGH_NEEDS_CLARIFICATION";
  return "HIGH_REQUIRES_FULL_GOVERNANCE";
}

function projectAdoptionModeFor(adoptionReview) {
  if (adoptionReview.state === "N/A") return "unknown";
  if (/STAY_PARTIAL|PARTIAL/i.test(adoptionReview.state)) return "partial";
  if (/SELECTED_NATIVE|FULL/i.test(adoptionReview.state)) return "behavior_complete";
  return "adapter_only";
}

function boundaryFor() {
  return {
    writes_target_files: "No",
    authorizes_implementation: "No",
    approves_commit_or_push: "No",
    approves_release_or_production: "No",
    executes_tests: "No",
    executes_migrations: "No",
    changes_ci_or_hooks: "No",
  };
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  const impact = evidence.impact_classification;
  const excludedRows = impact.excluded_high_impact_surfaces.map((item) => `| ${item.surface} | ${item.excluded} | ${item.reason} |`).join("\n") || "| N/A | N/A | N/A |";
  const mappingRows = evidence.existing_project_mapping.map((item) => `| ${item.required_behavior} | ${item.project_native_evidence_ref} | ${item.project_native_evidence_digest} | ${item.project_native_evidence_owner} | ${item.project_native_evidence_scope} | ${item.project_native_task_match} | ${item.mapping_state} | ${item.stronger_project_rule_preserved} | ${item.reason} |`).join("\n") || "| N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |";
  const sourceRows = evidence.source_chain.map((item) => `| ${item.name} | ${item.status} | ${item.ref} | ${item.current_task_match} |`).join("\n");
  return `# Task Governance Report

This report classifies task impact and routes required governance. It does not authorize implementation or completion.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | ${evidence.user_prompt.plain_user_summary} |
| Task impact | \`${impact.task_impact}\` |
| Plain next step | ${evidence.user_prompt.plain_next_step} |
| Ready for implementation review | \`${evidence.readiness.ready_for_implementation_review}\` |
| Implementation authorized by this report | \`${evidence.readiness.implementation_authorized_by_this_report}\` |
| Can claim done | \`${evidence.readiness.can_claim_done}\` |
| Review level | \`${evidence.review_policy.review_level}\` |

## Impact Classification

| Field | Value |
| --- | --- |
| Confidence | \`${impact.confidence}\` |
| Task kind | \`${impact.task_kind}\` |
| Triggered surfaces | ${impact.triggered_surfaces.join(", ") || "none"} |
| Low impact reason | ${impact.low_impact_reason || "N/A"} |
| Medium impact reason | ${impact.medium_impact_reason || "N/A"} |
| Upgrade history | ${impact.upgrade_history.join(", ") || "none"} |

## Excluded High-Impact Surfaces

| Surface | Excluded | Reason |
| --- | --- | --- |
${excludedRows}

## Business Universe Routing

| Field | Value |
| --- | --- |
| Required | \`${evidence.business_universe_routing.required}\` |
| Routing result | \`${evidence.business_universe_routing.routing_result}\` |
| Reason codes | ${evidence.business_universe_routing.reason_codes.join(", ") || "none"} |
| Relationship IDs | ${evidence.business_universe_routing.relationship_ids.join(", ") || "none"} |
| Trigger evidence locators | ${evidence.business_universe_routing.trigger_evidence_locator_refs.join(", ") || "none"} |
| Preflight digest | \`${evidence.business_universe_routing.preflight.preflight_digest}\` |
| Not-required reason | ${evidence.business_universe_routing.not_required_reason || "N/A"} |
| Technical inspection reason | ${evidence.business_universe_routing.technical_inspection_reason || "N/A"} |
| Technical terms required from user | \`${evidence.business_universe_routing.technical_terms_required_from_user}\` |

## Control Effectiveness Routing

| Field | Value |
| --- | --- |
| Required | \`${evidence.control_effectiveness_routing.required}\` |
| Routing result | \`${evidence.control_effectiveness_routing.routing_result}\` |
| Candidate controls | ${evidence.control_effectiveness_routing.control_candidates.map((item) => `\`${item.control_id}\``).join(", ") || "none"} |
| Required claims | ${evidence.control_effectiveness_routing.required_claim_ids.map((item) => `\`${item}\``).join(", ") || "none"} |
| Not-required reason | ${evidence.control_effectiveness_routing.not_required_reason || "N/A"} |
| Technical inspection reason | ${evidence.control_effectiveness_routing.technical_inspection_reason || "N/A"} |
| Technical terms required from user | \`${evidence.control_effectiveness_routing.technical_terms_required_from_user}\` |

## Required Before Implementation Review

| Requirement | Required |
| --- | --- |
| Scope check | \`${evidence.required_before_implementation_review.scope_check_required}\` |
| Short plan | \`${evidence.required_before_implementation_review.short_plan_required}\` |
| Business Universe Coverage | \`${evidence.required_before_implementation_review.business_universe_coverage_required}\` |
| Control Effectiveness | \`${evidence.required_before_implementation_review.control_effectiveness_required}\` |
| Business Rule Closure | \`${evidence.required_before_implementation_review.business_rule_closure_required}\` |
| Change Impact Coverage | \`${evidence.required_before_implementation_review.change_impact_coverage_required}\` |
| Execution Plan | \`${evidence.required_before_implementation_review.execution_plan_required}\` |
| Verification Plan | \`${evidence.required_before_implementation_review.verification_plan_required}\` |

## Required Before Completion Claim

| Requirement | Required |
| --- | --- |
| Test Evidence | \`${evidence.required_before_completion_claim.test_evidence_required}\` |
| Execution Assurance | \`${evidence.required_before_completion_claim.execution_assurance_required}\` |
| Completion Evidence | \`${evidence.required_before_completion_claim.completion_evidence_required}\` |

## Review Policy

| Field | Value |
| --- | --- |
| Review level | \`${evidence.review_policy.review_level}\` |
| Codex self-check required | \`${evidence.review_policy.codex_self_check_required}\` |
| Independent review required | \`${evidence.review_policy.independent_review_required}\` |
| Review must happen before | \`${evidence.review_policy.review_must_happen_before}\` |
| Review source | \`${evidence.review_policy.review_source}\` |
| Review must cover | ${evidence.review_policy.review_must_cover.join("; ")} |
| Skip full review reason | ${evidence.review_policy.skip_full_review_reason} |

## Existing Project Mapping

| Required Behavior | Project-Native Evidence | Digest | Owner | Scope | Task Match | State | Stronger Rule Preserved | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${mappingRows}

## Source Chain

| Source | Status | Ref | Task Match |
| --- | --- | --- | --- |
${sourceRows}

## Lightweight Close-Out

| Field | Value |
| --- | --- |
| Scope unchanged | \`${evidence.lightweight_closeout.scope_unchanged}\` |
| Minimal verification status | \`${evidence.lightweight_closeout.minimal_verification_status}\` |
| Targeted verification status | \`${evidence.lightweight_closeout.targeted_verification_status}\` |
| Unrelated edits | \`${evidence.lightweight_closeout.unrelated_edits}\` |
| Remaining risk | ${evidence.lightweight_closeout.remaining_risk || "none"} |

## Readiness

| Field | Value |
| --- | --- |
| Governance prerequisites satisfied | \`${evidence.readiness.governance_prerequisites_satisfied}\` |
| Ready for implementation review | \`${evidence.readiness.ready_for_implementation_review}\` |
| Implementation authorized by this report | \`${evidence.readiness.implementation_authorized_by_this_report}\` |
| Can claim done | \`${evidence.readiness.can_claim_done}\` |
| Blocked by | ${evidence.readiness.blocked_by.length > 0 ? evidence.user_prompt.plain_next_step : "none"} |

## Boundaries

| Boundary | Value |
| --- | --- |
| Writes target files | \`${evidence.boundaries.writes_target_files}\` |
| Authorizes implementation | \`${evidence.boundaries.authorizes_implementation}\` |
| Approves commit or push | \`${evidence.boundaries.approves_commit_or_push}\` |
| Approves release or production | \`${evidence.boundaries.approves_release_or_production}\` |
| Executes tests | \`${evidence.boundaries.executes_tests}\` |
| Executes migrations | \`${evidence.boundaries.executes_migrations}\` |
| Changes CI or hooks | \`${evidence.boundaries.changes_ci_or_hooks}\` |

## Machine-Readable Evidence

\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

## Outcome

\`${evidence.outcome}\`
`;
}

function uiActivationPattern() {
  return /\b(?:click(?:s|ed|ing|able|ability)?|press(?:es|ed|ing|able)?|tap(?:s|ped|ping|pable)?)\b|可点击|点击|按下|按压|按一下|可点按|点按|可轻触|轻触/;
}

function behaviorIntentTextFor(text) {
  return text
    .replace(/\b(?:without|do not|don't|does not|doesn't|must not|mustn't)\s+(?:change|changing|alter|altering|affect|affecting|modify|modifying|impact|impacting)\s+(?:(?:any|the|its|existing|current|other)\s+)*(?:(?:click(?:s|ed|ing|able)?|press(?:es|ed|ing|able)?|tap(?:s|ped|ping|pable)?)\s+)?(?:behavio(?:u)?r|functionality|interaction)s?\b/gi, " ")
    .replace(/\bno\s+changes?\s+to\s+(?:(?:the|its|existing|current)\s+)*(?:(?:click(?:s|ed|ing|able)?|press(?:es|ed|ing|able)?|tap(?:s|ped|ping|pable)?)\s+)?(?:behavio(?:u)?r|functionality|interaction)s?\b/gi, " ")
    .replace(/\b(?:behavio(?:u)?r|functionality|interaction)s?\s+(?:remains?|stays?)\s+unchanged\b/gi, " ")
    .replace(/不\s*(?:改变|修改|影响|涉及)\s*(?:任何|现有|当前|原有|其他)?\s*(?:可点击|点击|按下|按压|按一下|可点按|点按|可轻触|轻触)?\s*(?:行为|功能|交互)/g, " ")
    .replace(/(?:行为|功能|交互)\s*不变/g, " ");
}

function taskKindFor(text, behaviorText = behaviorIntentTextFor(text)) {
  if (/\b(?:deploy|release|ci|hook|rollback)\b|生产|发布|上线/.test(text)) return "release_behavior";
  if (/\b(?:migration|schema|backfill)\b|迁移|表结构/.test(text)) return "migration_behavior";
  if (/\b(?:config|env|docker)\b|配置|环境/.test(text)) return "config_behavior";
  const explicitlyScopedDocumentationContent = /\b(?:readme|docs?|documentation)\s+(?:copy|text|wording|link|typo)\b|\b(?:copy|text|wording|link|typo)\s+(?:in|inside|within)\s+(?:the\s+)?(?:readme|docs?|documentation)\b|(?:文档|说明)(?:文案|文字|措辞|链接|错别字)/.test(text);
  const mixedDocumentationAndBehavior = /\b(?:and|plus)\b[^.\n]{0,80}\b(?:implement|change|modify|fix|refactor|add|remove)\b[^.\n]{0,40}\b(?:validate|validation|logic|handler|behavior|function|workflow|api|database)\b|(?:并|并且|以及|同时).{0,40}(?:修改|实现|新增|删除|重构|修复).{0,30}(?:校验|验证|逻辑|处理器|行为|函数|流程|接口|数据库)/.test(text);
  if (explicitlyScopedDocumentationContent && !mixedDocumentationAndBehavior) return "docs_only";
  const behaviorSignal = uiActivationPattern().test(behaviorText)
    || /\b(submit|handler|validate|validation|logic|behavior|function|method|event|state|request|response|route|endpoint|component|hook|callback|workflow|api|database|query|mutation)\b|提交|处理器|校验|验证|逻辑|行为|函数|方法|事件|状态|请求|响应|路由|接口|组件|回调|流程|数据库|查询/.test(behaviorText);
  if (behaviorSignal) return "code_behavior";
  if (/\b(readme|doc|docs|documentation|link|typo)\b|文档|错别字|链接/.test(text)) return "docs_only";
  if (/\btest name|test title|测试名称|测试文案\b/.test(text)) return "test_docs_only";
  if (/\bcopy|text|label|wording\b|文案|标签/.test(text)) return "copy";
  if (/\b(spacing|style|visual|css|colou?rs?|padding|margin|font|border)\b|颜色|间距|样式/.test(text)) return "visual_only";
  return "code_behavior";
}

function highImpactPatterns() {
  return [
    ["DB / migration", /\b(db|database|schema|migration|backfill|sql|postgres)\b|数据库|迁移|表结构/],
    ["API contract", /\b(api contract|public api|dto|domain boundary|compatibility|endpoint)\b|接口契约|对外接口|兼容/],
    ["runtime workflow state", /\b(state machine|workflow state|runtime state|transition|final step|last step)\b|状态机|状态推进|流程状态|最后一步/],
    ["review approval settlement", /\b(review|approval|settlement|billing|payment|finance|tax|hr)\b|审批|审核|结算|支付|财务|税务|人资/],
    ["permission security", /\b(auth|permission|role|rbac|audit|privacy|customer data|security)\b|权限|角色|审计|隐私|客户数据|安全/],
    ["release production", /\b(release|deploy|production|rollback|ci|hook|environment|docker)\b|发布|上线|生产|回滚|环境|钩子/],
    ["scheduled jobs", /\b(cron|scheduled|recurring|background job|queue|worker|snapshot)\b|定时|周期|后台任务|队列|快照/],
  ];
}

function possibleHighPatterns() {
  return [
    ["uncertain data impact", /\b(maybe|possible|might|unknown|unclear)\b.*\b(data|state|permission|api)\b|可能.*(数据|状态|权限|接口)/],
    ["rule change", /\b(rule|restriction|limit|policy)\b|规则|限制|策略/],
  ];
}

function mediumPatterns() {
  return [
    ["local UI activation", uiActivationPattern()],
    ["local frontend interaction", /\b(local|component|frontend|interaction|modal|tab|form)\b|局部|组件|前端交互/],
    ["list filter display", /\b(filter|sort|display|list)\b|筛选|排序|展示/],
    ["internal parameter", /\binternal query|display parameter|non-critical parameter\b|内部参数/],
  ];
}

function lowPatterns() {
  return [
    ["copy docs visual", /\b(copy|text|typo|readme|docs|documentation|label|spacing|style|visual|link|colou?rs?|padding|margin|font|border)\b|文案|错别字|说明|标签|颜色|间距|样式|链接/],
  ];
}

function matchPatterns(text, patterns) {
  return patterns.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

function surfacesFor(impact, highMatches, mediumMatches, lowMatches, possibleMatches) {
  if (impact === "HIGH") return highMatches;
  if (impact === "POSSIBLE_HIGH") return possibleMatches;
  if (impact === "MEDIUM") return mediumMatches;
  return lowMatches.length > 0 ? ["local text/docs/visual surface"] : ["small local surface"];
}

function triggerEvidenceFor(impact, highMatches, mediumMatches, lowMatches, possibleMatches) {
  if (impact === "HIGH") return highMatches.map((item) => `Intent matched high-impact surface: ${item}`);
  if (impact === "POSSIBLE_HIGH") return possibleMatches.map((item) => `Intent matched possible high-impact signal: ${item}`);
  if (impact === "MEDIUM") return mediumMatches.map((item) => `Intent matched bounded behavior signal: ${item}`);
  return lowMatches.length > 0 ? lowMatches.map((item) => `Intent matched low-impact signal: ${item}`) : ["No high-impact signal detected."];
}

function excludedHighImpactSurfacesFor(impact, triggeredSurfaces) {
  const surfaces = ["DB", "API contract", "runtime state", "permission", "business rule", "release/production", "CI/hooks"];
  const triggeredCategories = triggeredHighSurfaceCategories(triggeredSurfaces);
  return surfaces.map((surface) => ({
    surface,
    excluded: impact === "LOW" || impact === "MEDIUM" ? "Yes" : triggeredCategories.has(surface) ? "No" : "Yes",
    reason: impact === "LOW" || impact === "MEDIUM"
      ? `No ${surface} impact is indicated by the task intent.`
      : triggeredCategories.has(surface)
        ? `${surface} is part of the triggered high-impact surface.`
        : `No ${surface} impact is indicated by the current classification.`,
  }));
}

function triggeredHighSurfaceCategories(triggeredSurfaces) {
  const categories = new Set();
  for (const item of triggeredSurfaces) {
    const value = item.toLowerCase();
    if (/db|database|schema|migration/.test(value)) categories.add("DB");
    if (/api|contract|dto|domain/.test(value)) categories.add("API contract");
    if (/runtime|workflow state|state|scheduled|queue|worker|job/.test(value)) categories.add("runtime state");
    if (/permission|security|auth|role|rbac|audit|privacy/.test(value)) categories.add("permission");
    if (/review|approval|settlement|billing|payment|finance|tax|hr|business/.test(value)) categories.add("business rule");
    if (/release|production|deploy|rollback|environment|docker/.test(value)) categories.add("release/production");
    if (/ci|hook|release|production|deploy|rollback/.test(value)) categories.add("CI/hooks");
  }
  return categories;
}

function matchJsonField(content, field) {
  const pattern = new RegExp(`"${field}"\\s*:\\s*"([^"]+)"`);
  return content.match(pattern)?.[1] || "";
}

function matchJsonNestedState(content) {
  return content.match(/"adoption_recommendation"\s*:\s*\{[\s\S]*?"state"\s*:\s*"([^"]+)"/)?.[1] || "";
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.join(dir, entry))
    .filter((file) => fs.statSync(file).isFile());
}

function resolveOutputPath(root, requested) {
  if (path.isAbsolute(requested)) {
    console.error(`FAIL --out must be a relative path inside target project: ${requested}`);
    process.exit(1);
  }
  const resolved = path.resolve(root, requested);
  const relative = path.relative(root, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    console.error(`FAIL --out must stay inside target project: ${requested}`);
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "task";
}
