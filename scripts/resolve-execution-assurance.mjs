#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import {
  createEvidenceAuthorityBinding,
  isFileEvidenceRef,
  isGovernedWorkflowOutputPath,
  resolveAuthoritativeEvidenceReference,
} from "./lib/evidence-authority.mjs";
import { resolveRuntimeTrustBinding, runtimeBindingMarkdown } from "./lib/verification-runtime-consumer.mjs";
import { controlEffectivenessBinding } from "./lib/control-effectiveness.mjs";
import {
  classifyUnexpectedExecutionFiles,
  collectGitChangedFiles,
  derivePreWriteRevalidation,
  isGovernedExecutionRuntimeOutput,
  resolvePlanningClosureForExecution,
} from "./lib/execution-assurance-consumer.mjs";
import {
  deriveWorkQueueTaskIdentity,
  normalizeTaskIntent,
  taskIntentDigest,
} from "./lib/task-entry-binding.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json", "format", "intent", "task", "kind", "base", "cached", "runtime-manifest-ref",
    "task-governance-ref", "work-queue-ref", "work-queue-item-id", "plan-review-ref", "planning-closure-ref", "out",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const schemaVersion = "1.113.0";
const outputPath = args.out ? resolveOutputPath(projectRoot, args.out) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildReport(projectRoot, {
  intent: String(args.intent || args._[1] || "verify execution completion"),
  task: String(args.task || "task:current"),
  kind: String(args.kind || ""),
  base: String(args.base || ""),
  cached: Boolean(args.cached),
  runtimeManifestRef: String(args["runtime-manifest-ref"] || ""),
  taskGovernanceRef: String(args["task-governance-ref"] || ""),
  workQueueRef: String(args["work-queue-ref"] || ""),
    workQueueItemId: String(args["work-queue-item-id"] || ""),
    planReviewRef: String(args["plan-review-ref"] || ""),
    planningClosureRef: String(args["planning-closure-ref"] || ""),
});

if (outputFormat === "json") {
  const output = `${JSON.stringify(report, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanReportText(report);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildReport(root, options) {
  const executionKind = classifyExecutionKind(root, options);
  let actualDiff = collectActualDiff(root, options);
  const sourceSystems = collectSourceSystems(root, options);
  const runtimeTrustRequired = Boolean(options.runtimeManifestRef)
    || runtimeTrustRequiredFor(root, sourceSystems, options);
  const runtimeTrust = resolveRuntimeTrustBinding(root, {
    required: runtimeTrustRequired,
    notRequiredReason: "The current Test Evidence and scenario obligations do not require runtime-trusted behavior proof.",
    manifestRef: options.runtimeManifestRef,
    taskRef: options.task,
    intentDigest: digest(options.intent),
  });
  if (runtimeTrust.manifest) {
    sourceSystems.push({
      name: "verification_run_manifest",
      status: "RECORDED",
      ref: runtimeTrust.binding.run_manifest_ref,
      source_system_ref: runtimeTrust.binding.run_manifest_ref,
      source_task_ref: runtimeTrust.binding.task_ref,
      source_outcome: runtimeTrust.manifest.outcome,
      current_task_match: "Yes",
      report_digest: digest(fs.readFileSync(runtimeTrust.file, "utf8")),
      contribution: "Authoritative current-run runtime evidence.",
    });
  }
  const businessUniverse = businessUniverseAssuranceFor(root, sourceSystems, options);
  const controlEffectiveness = controlEffectivenessAssuranceFor(root, sourceSystems, options);
  const planReviewBinding = planReviewBindingFor(root, options);
  const planningClosure = resolvePlanningClosureForExecution({
    projectRoot: root,
    explicitRef: options.planningClosureRef,
    expectedTaskRef: options.task,
    expectedIntentDigest: digest(options.intent),
    expectedCandidateBaseRevision: actualDiff.base_revision,
  });
  const taskEntryBinding = taskEntryBindingFor(root, options, {
    sourceSystems,
    actualDiff,
    runtimeTrust: runtimeTrust.binding,
    businessUniverse: businessUniverse.binding,
    controlEffectiveness: controlEffectiveness.binding,
    planReviewBinding,
    planningClosureBinding: planningClosure.binding,
  });
  appendAuthoritySources(root, sourceSystems, taskEntryBinding, planReviewBinding, planningClosure.binding, options);
  const completionContract = buildCompletionContract(executionKind, options, {
    sourceSystems,
    planReviewBinding,
    taskEntryBinding,
    planningClosure,
  });
  const plannedImpactMap = buildImpactMap(executionKind, sourceSystems, planReviewBinding, taskEntryBinding);
  const evidenceBindings = buildEvidenceBindings(completionContract);
  if (planningClosure.binding?.planning_closure_ref?.startsWith("artifact:")) {
    evidenceBindings.push({
      criterion_id: "criterion:planning-closure",
      evidence_ref: planningClosure.binding.planning_closure_ref,
      resolved: planningClosure.binding.status === "VERIFIED" ? "Yes" : "No",
      current_task_match: planningClosure.binding.current_task_match,
    });
  }
  if (runtimeTrust.manifest) {
    evidenceBindings.push({
      criterion_id: "criterion:runtime-trust",
      evidence_ref: runtimeTrust.binding.run_manifest_ref,
      resolved: "Yes",
      current_task_match: "Yes",
    });
  }
  const review = buildReview(planReviewBinding);
  const executionPlan = buildExecutionPlan(root, actualDiff, sourceSystems, planReviewBinding, taskEntryBinding, executionKind, options);
  actualDiff = {
    ...actualDiff,
    unexpected_files: executionPlan.unexpectedFiles,
    target_diff_status: executionPlan.targetDiffStatus,
  };
  const preWriteRevalidation = derivePreWriteRevalidation({
    projectRoot: root,
    planningClosure,
    actualDiff,
    plannedTargetPaths: executionPlan.plan.planned_target_paths,
  });
  const patchAssessment = assessPatch(executionKind, actualDiff, options);
  const state = chooseState({
    executionKind,
    actualDiff,
    sourceSystems,
    patchAssessment,
    completionContract,
    plannedImpactMap,
    evidenceBindings,
    review,
    runtimeTrustBinding: runtimeTrust.binding,
    businessUniverse,
    controlEffectiveness,
    taskEntryBinding,
    planReviewBinding,
    planningClosureBinding: planningClosure.binding,
    preWriteRevalidation,
  });
  const canClaimDone = state === "VERIFIED_DONE" ? "Yes" : "No";
  const safeNextStep = nextStepFor(state);
  const structuredEvidence = {
    schema_version: schemaVersion,
    artifact_type: "execution_assurance_report",
    execution_kind: executionKind,
    task_ref: options.task,
    intent_digest: digest(options.intent),
    assurance_state: state,
    can_claim_done: canClaimDone,
    can_codex_write_now: "No",
    intent_lock: {
      user_intent: options.intent,
      normalized_intent: normalizeIntent(options.intent, executionKind),
      in_scope: scopeFor(executionKind),
      out_of_scope: ["release approval", "production deploy", "secrets", "payment", "legal/compliance decision"],
    },
    completion_contract: completionContract,
    planned_impact_map: plannedImpactMap,
    execution_plan: executionPlan.plan,
    actual_diff: actualDiff,
    evidence_bindings: evidenceBindings,
    review,
    patch_assessment: patchAssessment,
    source_systems: sourceSystems,
    runtime_trust_binding: runtimeTrust.binding,
    business_universe_binding: businessUniverse.binding,
    control_effectiveness_binding: controlEffectiveness.binding,
    scenario_assurance_map: businessUniverse.scenarios,
    task_entry_binding: taskEntryBinding,
    ...(planReviewBinding ? { plan_review_binding: planReviewBinding } : {}),
    planning_closure_binding: planningClosure.binding,
    pre_write_revalidation: preWriteRevalidation,
    pending_human_decisions: pendingDecisionsFor(state),
    forbidden_claims: [],
    boundary: {
      writes_target_files: "No",
      authorizes_target_file_writes: "No",
      approves_implementation_beyond_recorded_scope: "No",
      approves_commit_or_push: "No",
      approves_release_or_production: "No",
      replaces_source_systems: "No",
      proves_product_correctness: "No",
      transfers_project_authority_to_intentos: "No",
    },
    outcome: state,
  };
  structuredEvidence.authority_binding = createEvidenceAuthorityBinding(root, {
    fromFile: outputPath,
    taskRef: structuredEvidence.task_ref,
    intentDigest: structuredEvidence.intent_digest,
    sourceRefs: collectFileEvidenceRefs(structuredEvidence),
  });
  return {
    reportType: "EXECUTION_ASSURANCE",
    schemaVersion,
    generatedBy: "scripts/resolve-execution-assurance.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      executionKind,
      assuranceState: state,
      canClaimDone,
      canCodexWriteNow: "No",
      safeNextStep,
    },
    structuredEvidence,
    outcome: state,
  };
}

function taskEntryBindingFor(root, options, context) {
  const normalizedIntent = normalizeTaskIntent(options.intent);
  const expectedIntentDigest = taskIntentDigest(normalizedIntent);
  const governanceArtifact = exactStructuredArtifact(root, {
    explicitRef: options.taskGovernanceRef,
    candidateRefs: ["artifact:task-governance-reports/current.md"],
    artifactType: "task_governance",
    taskRef: options.task,
    intentDigest: expectedIntentDigest,
  });
  const governance = governanceArtifact?.evidence;
  const tier = governance?.impact_classification?.task_impact || "POSSIBLE_HIGH";
  const reviewLevel = governance?.review_policy?.review_level || "BLOCKING_CLARIFICATION";
  const queueArtifact = exactStructuredArtifact(root, {
    explicitRef: options.workQueueRef,
    candidateRefs: [
      "artifact:work-queue-takeover-reports/current.md",
      "artifact:work-queue-takeover-reports/113-current.md",
    ],
    artifactType: "work_queue_takeover",
    taskRef: options.task,
    intentDigest: expectedIntentDigest,
    allowMissingTaskRef: true,
  });
  const currentItems = (queueArtifact?.evidence?.queue_items || []).filter((item) => {
    if (options.workQueueItemId && item.item_id !== options.workQueueItemId) return false;
    return item.state === "CURRENT"
      && governance
      && item.task_governance_digest === governance.task_governance_digest;
  });
  const queueItem = currentItems.length === 1 ? currentItems[0] : null;
  const queueIdentity = queueArtifact && queueItem
    ? deriveWorkQueueTaskIdentity({
        workQueueItemRef: `${queueArtifact.ref}#${queueItem.item_id}`,
        item: queueItem,
        intent: normalizedIntent,
      })
    : null;
  const testEvidence = context.sourceSystems.find((source) => source.name === "test_evidence"
    && source.status === "RECORDED"
    && source.current_task_match === "Yes"
    && source.source_outcome === "TEST_EVIDENCE_COMPLETE");
  const testRequired = governance?.required_before_completion_claim?.test_evidence_required === "Yes";
  const planRequired = governance?.required_before_implementation_review?.short_plan_required === "Yes";
  const expectedPlanState = planRequired ? "PLAN_REVIEW_PASSED" : "NO_PLAN_REQUIRED";
  const planReady = context.planReviewBinding?.plan_review_state === expectedPlanState
    && context.planReviewBinding?.current_task_match === "Yes";
  const runtimeReady = context.runtimeTrust?.requirement !== "REQUIRED" || context.runtimeTrust?.status === "VERIFIED";
  const universeReady = context.businessUniverse?.required !== "Yes"
    || (context.businessUniverse?.business_universe_state === "COVERAGE_READY"
      && context.businessUniverse?.coverage_mapping_status === "COMPLETE");
  const controlReady = context.controlEffectiveness?.requirement !== "REQUIRED"
    || context.controlEffectiveness?.status === "VERIFIED";
  const verificationReady = !testRequired || Boolean(testEvidence);
  const planningReady = context.planningClosureBinding?.status === "VERIFIED"
    && context.planningClosureBinding?.planning_closure_outcome === "PLANNING_READY"
    && context.planningClosureBinding?.current_project_match === "Yes"
    && context.planningClosureBinding?.current_task_match === "Yes"
    && context.planningClosureBinding?.current_intent_match === "Yes";
  const exactAuthority = Boolean(governanceArtifact
    && queueArtifact
    && queueItem
    && queueIdentity?.ok
    && queueIdentity.task_ref === options.task
    && context.planReviewBinding
    && context.planningClosureBinding);
  const tierResolved = tier !== "POSSIBLE_HIGH";
  const requirementsSatisfied = exactAuthority && tierResolved && planReady
    && verificationReady && runtimeReady && universeReady && controlReady && planningReady;
  const blockers = [];
  if (!governanceArtifact) blockers.push("Current Task Governance evidence is missing or does not match the exact task and intent.");
  if (!queueArtifact || !queueItem) blockers.push("Exactly one current Work Queue item is not bound to the current Task Governance evidence.");
  else if (!queueIdentity?.ok || queueIdentity.task_ref !== options.task) blockers.push("The current Work Queue item does not bind the exact task instance.");
  if (!context.planReviewBinding) blockers.push("Current-task Plan Review evidence is missing.");
  if (!planningReady) blockers.push("Current-task Planning Closure and its non-authorizing Execution Entry Contract are not verified.");
  if (!tierResolved) blockers.push("POSSIBLE_HIGH task impact must be resolved before completion.");
  if (!planReady) blockers.push("Required current-task Plan Review is not ready.");
  if (!verificationReady) blockers.push("Required current-task Test Evidence is not complete.");
  if (!runtimeReady) blockers.push("Required current-run Runtime Trust evidence is not verified.");
  if (!universeReady) blockers.push("Required Business Universe scenario coverage is incomplete.");
  if (!controlReady) blockers.push("Required Control Effectiveness evidence is not verified.");
  const binding = {
    work_queue_item_ref: queueArtifact && queueItem
      ? `${queueArtifact.ref}#${queueItem.item_id}`
      : "N/A",
    work_queue_item_digest: queueIdentity?.ok ? queueIdentity.work_queue_item_digest : zeroDigest(),
    work_queue_item_state: queueItem?.state || "BLOCKED",
    work_queue_item_current_task_match: queueItem ? "Yes" : "No",
    approved_resume_review: "No",
    resume_review_ref: "N/A",
    resume_review_digest: "N/A",
    resume_review_owner: "N/A",
    resume_review_task_match: "N/A",
    task_governance_ref: governanceArtifact?.ref || "N/A",
    task_governance_digest: governance?.task_governance_digest || zeroDigest(),
    task_governance_tier: tier,
    task_governance_review_level: reviewLevel,
    task_governance_task_match: governanceArtifact ? "Yes" : "No",
    minimal_verification_status: tier === "LOW"
      ? (requirementsSatisfied ? "RECORDED" : "NOT_RUN")
      : "NOT_APPLICABLE_WITH_REASON",
    targeted_verification_status: tier === "MEDIUM"
      ? (verificationReady ? "RECORDED" : "NOT_RUN")
      : "NOT_APPLICABLE_WITH_REASON",
    high_impact_evidence_chain_complete: tier === "HIGH" ? (requirementsSatisfied ? "Yes" : "No") : "N/A",
    task_governance_blocks_completion: requirementsSatisfied ? "No" : "Yes",
    tier_completion_requirements_satisfied: requirementsSatisfied ? "Yes" : "No",
    unresolved_task_governance_blockers: blockers,
    plain_user_blocker: requirementsSatisfied
      ? "N/A"
      : "我还在完成当前任务所需的技术验证，尚不能把任务当作完成。",
  };
  Object.defineProperties(binding, {
    _taskKind: { value: governance?.impact_classification?.task_kind || "" },
    _queueItem: { value: queueItem },
  });
  return binding;
}

function planReviewBindingFor(root, options) {
  const report = exactStructuredArtifact(root, {
    explicitRef: options.planReviewRef,
    candidateRefs: ["artifact:plan-review-reports/current.md"],
    artifactType: "plan_review",
    taskRef: options.task,
    intentDigest: digest(options.intent),
  });
  if (!report) return null;
  const evidence = report.evidence;
  return {
    required: evidence.plan_review_state === "NO_PLAN_REQUIRED" ? "No" : "Yes",
    plan_review_ref: report.ref,
    plan_review_digest: evidence.plan_review_digest,
    plan_review_state: evidence.plan_review_state,
    plan_ref: evidence.plan_ref,
    plan_digest: evidence.plan_digest,
    task_ref: evidence.task_ref,
    current_task_match: evidence.plan_task_match === "Yes" || evidence.plan_review_state === "NO_PLAN_REQUIRED" ? "Yes" : "No",
    ready_for_implementation_review: evidence.ready_for_implementation_review,
    implementation_authorized_by_this_report: "No",
    reason: "Execution Assurance consumes the exact current-task Plan Review as a non-authorizing implementation review prerequisite.",
  };
}

function exactStructuredArtifact(root, {
  explicitRef = "",
  candidateRefs = [],
  artifactType,
  taskRef,
  intentDigest,
  allowMissingTaskRef = false,
}) {
  const refs = explicitRef ? [explicitRef] : candidateRefs;
  for (const ref of refs) {
    const resolved = resolveAuthoritativeEvidenceReference(root, "", ref, { markdownOnly: true });
    if (!resolved.ok) continue;
    const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
    const evidence = extracted?.ok ? extracted.value : null;
    if (!evidence || evidence.artifact_type !== artifactType) continue;
    if (!allowMissingTaskRef && evidence.task_ref !== taskRef) continue;
    if (allowMissingTaskRef && evidence.task_ref && evidence.task_ref !== taskRef) continue;
    if (evidence.intent_digest !== intentDigest) continue;
    return {
      file: resolved.file,
      ref: `artifact:${resolved.relativePath}`,
      evidence,
    };
  }
  return null;
}

function zeroDigest() {
  return `sha256:${"0".repeat(64)}`;
}

function asArtifactRef(value) {
  const ref = String(value || "").trim();
  if (!ref || ref === "N/A" || /^(artifact|file|checker):/.test(ref)) return ref;
  return `artifact:${ref}`;
}

function collectFileEvidenceRefs(value) {
  const refs = new Set();
  const visit = (item, key = "") => {
    if (key === "authority_binding") return;
    if (typeof item === "string") {
      if (isFileEvidenceRef(item)) refs.add(item);
      return;
    }
    if (Array.isArray(item)) {
      item.forEach((child) => visit(child));
      return;
    }
    if (item && typeof item === "object") {
      Object.entries(item).forEach(([childKey, child]) => visit(child, childKey));
    }
  };
  visit(value);
  return [...refs];
}

function classifyExecutionKind(root, options) {
  const explicit = options.kind.toUpperCase();
  const allowed = new Set([
    "FEATURE_IMPLEMENTATION",
    "BUG_FIX",
    "SAFE_PATCH",
    "CONTROLLED_PATCH",
    "ADOPTION_MIGRATION",
    "BASELINE_SETUP",
    "DOCUMENT_GOVERNANCE",
    "RELEASE_PREPARATION",
    "WORKFLOW_CAPABILITY",
    "UNKNOWN",
  ]);
  if (allowed.has(explicit)) return explicit;
  const text = `${options.intent} ${options.task}`.toLowerCase();
  if (/\badopt(?:ion)?\b|\bmigration\b|老项目|接入/.test(text)) return "ADOPTION_MIGRATION";
  if (fs.existsSync(path.join(root, "intentos-manifest.json")) && fs.existsSync(path.join(root, "core", "workflow.md"))) {
    return "WORKFLOW_CAPABILITY";
  }
  if (/baseline|基线/.test(text)) return "BASELINE_SETUP";
  if (/document|archive|doc|文档|归档/.test(text)) return "DOCUMENT_GOVERNANCE";
  if (/release|launch|上线|发布/.test(text)) return "RELEASE_PREPARATION";
  if (/bug|fix|repair|修复/.test(text)) return "BUG_FIX";
  if (/patch|copy|typo|文案/.test(text)) return "SAFE_PATCH";
  if (/feature|add|新增|实现/.test(text)) return "FEATURE_IMPLEMENTATION";
  return "FEATURE_IMPLEMENTATION";
}

function collectActualDiff(root, options) {
  if (!isGitRepo(root)) {
    return {
      diff_source: "not-git-repo",
      changed_files: [],
      unexpected_files: [],
      target_diff_status: "UNKNOWN",
    };
  }
  const diffSource = options.cached ? "git:cached" : options.base ? `git:${options.base}` : "git:working-tree";
  const observed = collectGitChangedFiles(root, diffSource);
  const head = spawnSync("git", ["rev-parse", "--verify", "HEAD^{commit}"], { cwd: root, encoding: "utf8" });
  const changed = observed.ok ? observed.files : [];
  const unexpected = classifyUnexpectedExecutionFiles(changed, []);
  return {
    diff_source: diffSource,
    base_revision: head.status === 0 ? head.stdout.trim() : "N/A",
    changed_files: changed,
    unexpected_files: unexpected,
    target_diff_status: unexpected.length > 0
      ? "UNEXPECTED_DIFF"
      : changed.length > 0
        ? "REQUIRES_EXPLICIT_EXECUTION_PLAN"
        : "UNCHANGED_FOR_READ_ONLY",
  };
}

function isGitRepo(root) {
  const result = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: root, encoding: "utf8" });
  return result.status === 0 && result.stdout.trim() === "true";
}

function collectSourceSystems(root, options) {
  const systems = [
    ["change_impact_coverage", "change-impact-coverage-reports"],
    ["test_evidence", "test-evidence-reports"],
    ["execution_closure", "execution-closures"],
    ["closure_decision", "closure-decisions"],
    ["review_loop", "review-loop-reports"],
    ["adoption_assurance", "adoption-assurance-reports"],
    ["governance_convergence", "governance-convergence-reports"],
    ["release_plan", "release-plans"],
    ["document_lifecycle", "doc-lifecycle-reports"],
    ["work_queue", "work-queue"],
    ["approval_record", "approval-records"],
  ];
  return systems.flatMap(([name, dir]) => {
    const files = markdownFiles(path.join(root, dir));
    if (files.length > 0) {
      const records = files.map((file) => {
        const extracted = extractMachineReadableEvidence(fs.readFileSync(file, "utf8"));
        return { file, evidence: extracted?.ok ? extracted.value : null };
      });
      const intentDigest = digest(options.intent);
      const matching = records.filter((record) => sourceTaskRefFor(record.evidence) === options.task
        && sourceIntentDigestFor(record.evidence) === intentDigest);
      const selected = name === "change_impact_coverage"
        ? matching.find((record) => record.evidence?.mode === "closure")
        : matching[0];
      const stale = records.find((record) => sourceTaskRefFor(record.evidence) === options.task);
      if (!selected && !stale) return [];
      if (!selected && name === "change_impact_coverage" && matching.length > 0) {
        const preflight = matching[0];
        const relative = path.relative(root, preflight.file).replaceAll(path.sep, "/");
        return [{
          name,
          status: "BLOCKED",
          ref: `artifact:${relative}`,
          source_system_ref: `artifact:${relative}`,
          source_task_ref: options.task,
          source_outcome: "PREFLIGHT_ONLY",
          current_task_match: "Yes",
          report_digest: digest(fs.readFileSync(preflight.file, "utf8")),
          contribution: "Change Impact preflight evidence cannot prove post-write execution coverage.",
        }];
      }
      if (!selected && stale) {
        const relative = path.relative(root, stale.file).replaceAll(path.sep, "/");
        return [{
          name,
          status: "BLOCKED",
          ref: `artifact:${relative}`,
          source_system_ref: `artifact:${relative}`,
          source_task_ref: options.task,
          source_outcome: "STALE_INTENT_EVIDENCE",
          current_task_match: "No",
          report_digest: digest(fs.readFileSync(stale.file, "utf8")),
          contribution: `${dir} evidence belongs to the task id but not the current intent.`,
        }];
      }
      const file = selected.file;
      const relative = path.relative(root, file).replaceAll(path.sep, "/");
      const content = fs.readFileSync(file, "utf8");
      const sourceEvidence = selected.evidence;
      const sourceTaskRef = sourceTaskRefFor(sourceEvidence) || "UNKNOWN";
      const sourceOutcome = String(
        sourceEvidence?.outcome
          || sourceEvidence?.assurance_state
          || sourceEvidence?.test_evidence_state
          || sourceEvidence?.impact_state
          || sourceEvidence?.closure_decision
          || sourceEvidence?.decision
          || "RECORDED",
      );
      return [{
        name,
        status: "RECORDED",
        ref: `artifact:${relative}`,
        source_system_ref: `artifact:${relative}`,
        source_task_ref: sourceTaskRef,
        source_outcome: sourceOutcome,
        current_task_match: sourceTaskRef === options.task ? "Yes" : "No",
        report_digest: digest(content),
        contribution: `${dir} evidence present.`,
      }];
    }
    return [];
  });
}

function sourceTaskRefFor(evidence) {
  return String(evidence?.task_ref || evidence?.user_request?.task_ref || "").trim();
}

function sourceIntentDigestFor(evidence) {
  const direct = String(evidence?.intent_digest || evidence?.source_request_digest || "").trim();
  if (direct) return direct;
  return evidence?.user_request?.intent ? digest(evidence.user_request.intent) : "";
}

function appendAuthoritySources(root, sourceSystems, taskEntryBinding, planReviewBinding, planningClosureBinding, options) {
  const append = (name, ref, outcome) => {
    if (!ref || ref === "N/A" || sourceSystems.some((item) => item.name === name)) return;
    const resolved = resolveAuthoritativeEvidenceReference(root, "", ref, { markdownOnly: true });
    if (!resolved.ok) return;
    sourceSystems.push({
      name,
      status: "RECORDED",
      ref: `artifact:${resolved.relativePath}`,
      source_system_ref: `artifact:${resolved.relativePath}`,
      source_task_ref: options.task,
      source_outcome: outcome,
      current_task_match: "Yes",
      report_digest: digest(fs.readFileSync(resolved.file, "utf8")),
      contribution: `Exact current-task ${name.replaceAll("_", " ")} authority.`,
    });
  };
  append("task_governance", taskEntryBinding.task_governance_ref, "TASK_GOVERNANCE_RECORDED");
  append("plan_review", planReviewBinding?.plan_review_ref, planReviewBinding?.plan_review_state || "BLOCKED");
  append("planning_closure", planningClosureBinding?.planning_closure_ref, planningClosureBinding?.planning_closure_outcome || "PLANNING_INVALID");
}

function businessUniverseAssuranceFor(root, sourceSystems, options) {
  const fallback = {
    required: "Unknown",
    routing_result: "TECHNICAL_INSPECTION_REQUIRED",
    business_universe_ref: "N/A",
    business_universe_digest: "N/A",
    business_universe_state: "TECHNICAL_INSPECTION_REQUIRED",
    coverage_scenario_ids: [],
    coverage_mapping_status: "BLOCKED",
  };
  const source = sourceSystems.find((item) => item.name === "test_evidence" && item.status === "RECORDED");
  if (!source) {
    const governance = currentTaskGovernanceFor(root, options);
    if (governance?.business_universe_routing?.required === "No") {
      return {
        binding: {
          required: "No",
          routing_result: "NOT_REQUIRED_WITH_REASON",
          business_universe_ref: "N/A",
          business_universe_digest: "N/A",
          business_universe_state: "NOT_REQUIRED_WITH_REASON",
          coverage_scenario_ids: [],
          coverage_mapping_status: "NOT_REQUIRED",
        },
        scenarios: [],
      };
    }
    return { binding: fallback, scenarios: [] };
  }
  const resolved = resolveAuthoritativeEvidenceReference(root, "", source.ref, { markdownOnly: true });
  if (!resolved.ok) return { binding: fallback, scenarios: [] };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  const evidence = extracted?.ok ? extracted.value : null;
  if (!evidence || evidence.task_ref !== options.task || evidence.intent_digest !== digest(options.intent)) {
    return { binding: fallback, scenarios: [] };
  }
  const binding = evidence.business_universe_binding;
  if (!binding) return { binding: fallback, scenarios: [] };
  if (binding.required === "No") return { binding, scenarios: [] };
  if (binding.required !== "Yes") return { binding: { ...binding, coverage_mapping_status: "BLOCKED" }, scenarios: [] };
  const byId = new Map((evidence.scenario_coverage_map || []).map((item) => [item.coverage_scenario_id, item]));
  const scenarios = (binding.coverage_scenario_ids || []).map((scenarioId) => {
    const row = byId.get(scenarioId);
    const requiredIds = row?.required_obligation_ids || [];
    const coveredIds = row?.covered_obligation_ids || [];
    const evidenceIds = row?.evidence_ids || [];
    const exactCoverage = row
      && requiredIds.length >= 2
      && requiredIds.every((id) => coveredIds.includes(id))
      && evidenceIds.length > 0
      && row.coverage_state === "COVERED";
    const runtimeProofMissing = row?.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF"
      && evidence.runtime_trust_binding?.status !== "VERIFIED";
    return {
      coverage_scenario_id: scenarioId,
      required_obligation_ids: requiredIds,
      covered_obligation_ids: coveredIds,
      test_evidence_ids: evidenceIds,
      required_proof_strength: row?.required_proof_strength || "STRUCTURAL_SOURCE_PROOF",
      test_evidence_state: row?.coverage_state || "NOT_COVERED",
      assurance_state: !row
        ? "BLOCKED_SOURCE_MISMATCH"
        : runtimeProofMissing
          ? "BLOCKED_WEAK_PROOF"
          : exactCoverage
            ? "ASSURED"
            : "BLOCKED_MISSING_TEST_EVIDENCE",
    };
  });
  const exactScenarioSet = scenarios.length === (binding.coverage_scenario_ids || []).length
    && scenarios.every((item) => item.assurance_state === "ASSURED");
  return {
    binding: {
      ...binding,
      coverage_mapping_status: binding.business_universe_state === "COVERAGE_READY" && exactScenarioSet
        ? "COMPLETE"
        : "BLOCKED",
    },
    scenarios,
  };
}

function runtimeTrustRequiredFor(root, sourceSystems, options) {
  const source = sourceSystems.find((item) => item.name === "test_evidence" && item.status === "RECORDED");
  if (!source) return false;
  const resolved = resolveAuthoritativeEvidenceReference(root, "", source.ref, { markdownOnly: true });
  if (!resolved.ok) return false;
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  const evidence = extracted?.ok ? extracted.value : null;
  if (!evidence || evidence.task_ref !== options.task || evidence.intent_digest !== digest(options.intent)) return false;
  return evidence.runtime_trust_binding?.requirement === "REQUIRED"
    || (evidence.scenario_coverage_map || [])
      .some((item) => item.required_proof_strength === "RUNTIME_TRUSTED_BEHAVIOR_PROOF");
}

function controlEffectivenessAssuranceFor(root, sourceSystems, options) {
  const fallback = controlEffectivenessBinding({
    required: true,
    reason: "Current-task Test Evidence does not provide a Control Effectiveness decision.",
  });
  const source = sourceSystems.find((item) => item.name === "test_evidence" && item.status === "RECORDED");
  if (!source) {
    const governance = currentTaskGovernanceFor(root, options);
    if (governance?.control_effectiveness_routing?.required === "No") {
      return {
        binding: controlEffectivenessBinding({
          required: false,
          reason: "Current Task Governance does not require Control Effectiveness evidence for this task.",
        }),
      };
    }
    return { binding: fallback };
  }
  const resolved = resolveAuthoritativeEvidenceReference(root, "", source.ref, { markdownOnly: true });
  if (!resolved.ok) return { binding: fallback };
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  const evidence = extracted?.ok ? extracted.value : null;
  if (!evidence || evidence.task_ref !== options.task || evidence.intent_digest !== digest(options.intent)) return { binding: fallback };
  if (!evidence.control_effectiveness_binding) return { binding: fallback };
  return { binding: JSON.parse(JSON.stringify(evidence.control_effectiveness_binding)) };
}

function currentTaskGovernanceFor(root, options) {
  return exactStructuredArtifact(root, {
    explicitRef: options.taskGovernanceRef,
    candidateRefs: ["artifact:task-governance-reports/current.md"],
    artifactType: "task_governance",
    taskRef: options.task,
    intentDigest: digest(options.intent),
  })?.evidence || null;
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
  return files.sort();
}

function assessPatch(executionKind, actualDiff, options) {
  const text = options.intent.toLowerCase();
  if (/backend-only|后端.*(前端|ui).*未|bypass|hardcod|try\/catch|skip test|跳过测试/.test(text)) {
    return { state: "PATCH_SMELL", reason: "Intent contains patch-smell markers." };
  }
  if (actualDiff.unexpected_files.length > 0) {
    return { state: "BLOCKED_PATCH", reason: "Unexpected local-only, secret, log, or temp files are present." };
  }
  if (executionKind === "SAFE_PATCH") {
    const broad = actualDiff.changed_files.length > 4;
    return broad
      ? { state: "CONTROLLED_PATCH", reason: "Patch has broader diff than a narrow safe patch; requires controlled evidence." }
      : { state: "SAFE_PATCH", reason: "Narrow low-risk patch candidate with bounded diff." };
  }
  return { state: "NOT_A_PATCH", reason: "Normal planned execution." };
}

function buildCompletionContract(executionKind, options, context) {
  const sourceRef = completionEvidenceRef(context);
  return {
    criteria: [
      {
        id: `criterion:${slug(executionKind)}`,
        status: sourceRef ? "DONE" : "PENDING",
        evidence_refs: [sourceRef || `checker:${sourceCheckerFor(executionKind)}`],
      },
    ],
  };
}

function completionEvidenceRef({ sourceSystems, planReviewBinding, taskEntryBinding }) {
  const testSource = sourceSystems.find((item) => item.name === "test_evidence"
    && item.status === "RECORDED"
    && item.current_task_match === "Yes"
    && item.source_outcome === "TEST_EVIDENCE_COMPLETE");
  if (testSource) return testSource.ref;
  if (taskEntryBinding.task_governance_tier === "LOW"
    && planReviewBinding?.plan_review_state === "NO_PLAN_REQUIRED"
    && planReviewBinding?.current_task_match === "Yes") {
    return planReviewBinding.plan_review_ref;
  }
  return "";
}

function buildImpactMap(executionKind, sourceSystems, planReviewBinding, taskEntryBinding) {
  const source = sourceSystems.find((item) => item.name === "change_impact_coverage"
    && item.status === "RECORDED"
    && item.current_task_match === "Yes"
    && item.source_outcome === "CHANGE_IMPACT_RECORDED");
  const lowReviewRef = taskEntryBinding.task_governance_tier === "LOW"
    && planReviewBinding?.plan_review_state === "NO_PLAN_REQUIRED"
    ? planReviewBinding.plan_review_ref
    : "";
  const evidenceRef = source?.ref || lowReviewRef;
  return {
    surfaces: surfacesFor(executionKind).map((surface) => ({
      surface,
      expected: "Yes",
      status: evidenceRef ? "DONE" : "PENDING",
      evidence_refs: [evidenceRef || `checker:${sourceCheckerFor(executionKind)}`],
    })),
  };
}

function buildEvidenceBindings(contract) {
  return contract.criteria.flatMap((criterion) => criterion.evidence_refs.map((ref) => ({
    criterion_id: criterion.id,
    evidence_ref: ref,
    resolved: isFileEvidenceRef(ref) ? "Yes" : "No",
    current_task_match: isFileEvidenceRef(ref) ? "Yes" : "No",
  })));
}

function buildReview(planReviewBinding) {
  if (planReviewBinding
    && ["PLAN_REVIEW_PASSED", "NO_PLAN_REQUIRED"].includes(planReviewBinding.plan_review_state)
    && planReviewBinding.current_task_match === "Yes") {
    return {
      review_required: "Yes",
      review_refs: [planReviewBinding.plan_review_ref],
      all_reviewers_closed: "Yes",
    };
  }
  return {
    review_required: "Yes",
    review_refs: [],
    all_reviewers_closed: "No",
  };
}

function buildExecutionPlan(root, actualDiff, sourceSystems, planReviewBinding, taskEntryBinding, executionKind, options) {
  const impactSource = sourceSystems.find((item) => item.name === "change_impact_coverage"
    && item.status === "RECORDED"
    && item.current_task_match === "Yes"
    && item.source_outcome === "CHANGE_IMPACT_RECORDED");
  const reviewedImpactEvidence = readPlanReviewedImpactEvidence(root, planReviewBinding);
  const impactEvidence = reviewedImpactEvidence || (impactSource ? readSourceEvidence(root, impactSource) : null);
  let plannedTargetPaths = Array.isArray(impactEvidence?.changed_files)
    ? [...new Set(impactEvidence.changed_files.map((item) => String(item).replaceAll("\\", "/")))].sort()
    : [];
  if (taskEntryBinding.task_governance_tier === "LOW"
    && planReviewBinding?.plan_review_state === "NO_PLAN_REQUIRED") {
    plannedTargetPaths = lowPlannedTargetPaths(root, options, taskEntryBinding);
  }
  if (plannedTargetPaths.length === 0) plannedTargetPaths = ["N/A"];
  const concretePlannedPaths = plannedTargetPaths.filter((item) => item !== "N/A");
  const unexpectedFiles = classifyUnexpectedExecutionFiles(actualDiff.changed_files, concretePlannedPaths);
  const coversActualDiff = actualDiff.changed_files.length > 0
    && actualDiff.changed_files.every((file) => isExecutionFileCoveredByPlan(file, concretePlannedPaths));
  const targetDiffStatus = unexpectedFiles.length > 0
    ? "UNEXPECTED_DIFF"
    : actualDiff.changed_files.length === 0
      ? "UNCHANGED_FOR_READ_ONLY"
      : coversActualDiff
        ? "MATCHED_PLAN"
        : "REQUIRES_EXPLICIT_EXECUTION_PLAN";
  return {
    targetDiffStatus,
    unexpectedFiles,
    plan: {
      plan_ref: planReviewBinding?.plan_ref === "N/A"
        ? "N/A"
        : asArtifactRef(planReviewBinding?.plan_ref || "N/A"),
      planned_target_paths: plannedTargetPaths,
      risk_classification: taskEntryBinding.task_governance_tier || riskFor(executionKind),
      approval_refs: [],
      restore_strategy: "Use task-scoped revert or reviewed restore plan if verification fails.",
    },
  };
}

function isExecutionFileCoveredByPlan(file, plannedPaths) {
  const changed = String(file || "").trim().replaceAll("\\", "/");
  if (!changed) return false;
  if (isGovernedExecutionRuntimeOutput(changed)) return true;
  return plannedPaths.includes(changed);
}

function readPlanReviewedImpactEvidence(root, planReviewBinding) {
  const ref = String(planReviewBinding?.plan_review_ref || "").trim();
  if (!ref || ref === "N/A") return null;
  const resolved = resolveAuthoritativeEvidenceReference(root, "", ref, { markdownOnly: true });
  if (!resolved.ok) return null;
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  if (!extracted?.ok) return null;
  const source = (extracted.value.source_chain || []).find((item) => item.source_kind === "change_impact_coverage"
    && item.current_task_match === "Yes"
    && item.source_state === "CHANGE_IMPACT_RECORDED");
  if (!source?.source_ref) return null;
  return readSourceEvidence(root, { ref: source.source_ref });
}

function lowPlannedTargetPaths(root, options, taskEntryBinding) {
  if (taskEntryBinding._taskKind !== "docs_only") return [];
  const scopeTexts = [String(options.intent || "")];
  const queueItem = taskEntryBinding._queueItem;
  if (queueItem?.title) scopeTexts.push(String(queueItem.title));
  const sourceItem = String(queueItem?.source_item || "").trim();
  const sourceDigest = String(queueItem?.source_item_digest || "").trim();
  if (sourceItem === "intent:current") {
    if (sourceDigest === digest(options.intent)) scopeTexts.push(String(options.intent || ""));
  } else if (sourceItem) {
    const sourceRef = /^(?:artifact|file):/i.test(sourceItem) ? sourceItem : `file:${sourceItem}`;
    const resolved = resolveAuthoritativeEvidenceReference(root, "", sourceRef);
    if (resolved.ok && !isGovernedWorkflowOutputPath(resolved.relativePath)) {
      const content = fs.readFileSync(resolved.file, "utf8");
      if (sourceDigest === digest(`${resolved.relativePath}\n${content}`)) scopeTexts.push(content);
    }
  }

  const scopeText = scopeTexts.join("\n").normalize("NFKC").toLowerCase().replaceAll("\\", "/");
  const committedPaths = committedProjectFiles(root).filter(isDocumentationTargetPath);
  const shortAliases = new Map();
  const registerAlias = (alias, relative) => {
    const normalized = String(alias || "").toLowerCase();
    if (!normalized) return;
    if (!shortAliases.has(normalized)) shortAliases.set(normalized, new Set());
    shortAliases.get(normalized).add(relative);
  };
  const targets = new Set();
  for (const relative of committedPaths) {
    const basename = path.posix.basename(relative);
    const stem = basename.replace(/\.(?:md|mdx|txt|rst|adoc)$/i, "");
    if (scopeMentionsAlias(scopeText, relative.toLowerCase())) targets.add(relative);
    registerAlias(basename, relative);
    registerAlias(stem, relative);
  }

  for (const [alias, paths] of shortAliases) {
    if (paths.size === 1 && scopeMentionsAlias(scopeText, alias)) targets.add([...paths][0]);
  }
  for (const match of scopeText.matchAll(/(?:^|[^a-z0-9._/-])((?:[a-z0-9._-]+\/)*[a-z0-9._-]+\.(?:md|mdx|txt|rst|adoc))(?=$|[^a-z0-9._/-])/gi)) {
    const candidate = normalizePlannedTargetPath(match[1]);
    if (candidate && isDocumentationTargetPath(candidate)) targets.add(candidate);
  }
  return [...targets].sort();
}

function committedProjectFiles(root) {
  const result = spawnSync("git", ["ls-tree", "-r", "--name-only", "-z", "HEAD", "--", "."], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) return [];
  return [...new Set(result.stdout.split("\0")
    .map(normalizePlannedTargetPath)
    .filter((item) => item && !isGovernedWorkflowOutputPath(item)))].sort();
}

function normalizePlannedTargetPath(value) {
  const normalized = String(value || "").trim().replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized || path.posix.isAbsolute(normalized) || normalized.includes("\0") || normalized.includes("*")) return "";
  const canonical = path.posix.normalize(normalized);
  if (canonical === ".." || canonical.startsWith("../")) return "";
  return canonical;
}

function isDocumentationTargetPath(value) {
  const normalized = normalizePlannedTargetPath(value);
  if (!normalized || isGovernedWorkflowOutputPath(normalized)) return false;
  const basename = path.posix.basename(normalized);
  return /\.(?:md|mdx|txt|rst|adoc)$/i.test(basename)
    || /^(?:readme|changelog|contributing|license|notice|authors)(?:\.[a-z0-9._-]+)?$/i.test(basename);
}

function scopeMentionsAlias(scopeText, alias) {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9._/-])${escaped}(?=$|[^a-z0-9._/-])`, "i").test(scopeText);
}

function readSourceEvidence(root, source) {
  const resolved = resolveAuthoritativeEvidenceReference(root, "", source?.ref || "", { markdownOnly: true });
  if (!resolved.ok) return null;
  const extracted = extractMachineReadableEvidence(fs.readFileSync(resolved.file, "utf8"));
  return extracted?.ok ? extracted.value : null;
}

function chooseState({ executionKind, actualDiff, sourceSystems, patchAssessment, completionContract, plannedImpactMap, evidenceBindings, review, runtimeTrustBinding, businessUniverse, controlEffectiveness, taskEntryBinding, planReviewBinding, planningClosureBinding, preWriteRevalidation }) {
  if (planningClosureBinding?.status !== "VERIFIED"
    || planningClosureBinding?.planning_closure_outcome !== "PLANNING_READY") {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (preWriteRevalidation?.status !== "VERIFIED" || preWriteRevalidation?.result !== "PRE_WRITE_SNAPSHOT_REPLAYED") {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (taskEntryBinding.task_governance_blocks_completion !== "No"
    || taskEntryBinding.tier_completion_requirements_satisfied !== "Yes") {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (taskEntryBinding.task_governance_tier !== "LOW"
    && (!planReviewBinding || planReviewBinding.plan_review_state !== "PLAN_REVIEW_PASSED")) {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (controlEffectiveness.binding.requirement === "REQUIRED" && controlEffectiveness.binding.status !== "VERIFIED") {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (controlEffectiveness.binding.requirement === "NOT_REQUIRED" && controlEffectiveness.binding.status !== "NOT_REQUIRED") {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (runtimeTrustBinding?.requirement === "REQUIRED" && runtimeTrustBinding.status !== "VERIFIED") {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (runtimeTrustBinding?.requirement === "NOT_REQUIRED" && runtimeTrustBinding.status !== "NOT_REQUIRED") {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (businessUniverse.binding.required === "Unknown") return "BLOCKED_BY_MISSING_EVIDENCE";
  if (businessUniverse.binding.required === "Yes"
    && (businessUniverse.binding.coverage_mapping_status !== "COMPLETE"
      || businessUniverse.scenarios.some((item) => item.assurance_state !== "ASSURED"))) {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (executionKind === "UNKNOWN") return "NEEDS_HUMAN_DECISION";
  const recordedTestEvidence = sourceSystems.find((source) => source.name === "test_evidence" && source.status === "RECORDED");
  if (recordedTestEvidence && recordedTestEvidence.source_outcome !== "TEST_EVIDENCE_COMPLETE") {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (executionKind === "FEATURE_IMPLEMENTATION" && actualDiff.changed_files.length === 0) {
    return "BLOCKED_BY_MISSING_EVIDENCE";
  }
  if (actualDiff.target_diff_status === "UNEXPECTED_DIFF") return "BLOCKED_BY_UNEXPECTED_DIFF";
  if (actualDiff.target_diff_status === "REQUIRES_EXPLICIT_EXECUTION_PLAN") return "BLOCKED_BY_SCOPE_DRIFT";
  if (["PATCH_SMELL", "BLOCKED_PATCH"].includes(patchAssessment.state)) return "BLOCKED_BY_PATCH_SMELL";
  if (review.review_required === "Yes" && (review.review_refs.length === 0 || review.all_reviewers_closed !== "Yes")) return "PARTIAL_DONE";
  const hasBlockingSource = sourceSystems.some((source) => source.status === "BLOCKED");
  if (hasBlockingSource) return "BLOCKED_BY_MISSING_EVIDENCE";
  const allCriteriaDone = completionContract.criteria.every((item) => item.status === "DONE");
  const allSurfacesDone = plannedImpactMap.surfaces.every((item) => item.status === "DONE" || item.status === "OUT_OF_SCOPE_WITH_REASON");
  const allEvidenceCurrent = evidenceBindings.every((item) => item.resolved === "Yes" && item.current_task_match === "Yes");
  if (allCriteriaDone && allSurfacesDone && allEvidenceCurrent) return "VERIFIED_DONE";
  return "PARTIAL_DONE";
}

function normalizeIntent(intent, executionKind) {
  return `${executionKind}: ${String(intent || "").trim() || "verify execution completion"}`;
}

function scopeFor(executionKind) {
  const map = {
    FEATURE_IMPLEMENTATION: ["user flow", "frontend UI", "API contract", "backend rule", "tests", "docs"],
    BUG_FIX: ["regression surface", "root cause", "tests", "review"],
    SAFE_PATCH: ["changed file", "verification evidence"],
    CONTROLLED_PATCH: ["changed file", "verification evidence", "debt handoff"],
    ADOPTION_MIGRATION: ["native migration", "rule reconciliation", "governance convergence", "adoption assurance"],
    BASELINE_SETUP: ["baseline selection", "engineering baseline", "environment baseline"],
    DOCUMENT_GOVERNANCE: ["source of truth", "archive/deprecation suggestion", "link check"],
    RELEASE_PREPARATION: ["launch view", "release plan", "owner", "rollback", "monitoring"],
    WORKFLOW_CAPABILITY: ["intentos code", "fixtures", "docs", "release record", "self-check"],
    UNKNOWN: ["needs classification"],
  };
  return map[executionKind] || map.UNKNOWN;
}

function surfacesFor(executionKind) {
  if (executionKind === "ADOPTION_MIGRATION") return ["workflow", "baseline", "audit", "release", "risk_authority", "simulation"];
  if (executionKind === "RELEASE_PREPARATION") return ["release_target", "owner", "rollback", "monitoring", "handoff"];
  if (executionKind === "DOCUMENT_GOVERNANCE") return ["source_of_truth", "duplicates", "archive_index", "link_check"];
  if (executionKind === "BASELINE_SETUP") return ["platform", "engineering", "environment", "verification"];
  if (executionKind === "SAFE_PATCH") return ["changed_file", "verification"];
  return ["user_flow", "frontend_ui", "api_contract", "backend_rule", "tests", "docs"];
}

function sourceCheckerFor(executionKind) {
  const map = {
    ADOPTION_MIGRATION: "adoption-assurance",
    RELEASE_PREPARATION: "release-plan",
    DOCUMENT_GOVERNANCE: "document-lifecycle",
    BASELINE_SETUP: "baseline-decision",
    SAFE_PATCH: "apply-candidate",
    CONTROLLED_PATCH: "apply-readiness",
    WORKFLOW_CAPABILITY: "check-intentos",
  };
  return map[executionKind] || "impact-coverage";
}

function riskFor(executionKind) {
  if (["RELEASE_PREPARATION", "ADOPTION_MIGRATION"].includes(executionKind)) return "HIGH_PLAN_ONLY";
  if (executionKind === "SAFE_PATCH") return "LOW";
  return "NORMAL";
}

function pendingDecisionsFor(state) {
  if (state === "VERIFIED_DONE") return [];
  if (state === "BLOCKED_BY_SCOPE_DRIFT") return [];
  if (state === "NEEDS_HUMAN_DECISION") return ["Classify the execution kind before claiming completion."];
  if (state === "BLOCKED_BY_UNEXPECTED_DIFF") return ["Review unexpected diff and decide whether it is in scope."];
  if (state === "BLOCKED_BY_PATCH_SMELL") return ["Decide whether to expand scope or document a controlled patch with debt handoff."];
  return ["Add missing evidence, review, or task-bound source-system records before claiming done."];
}

function nextStepFor(state) {
  if (state === "VERIFIED_DONE") return "Prepare final response with evidence summary; do not claim release or production approval.";
  if (state === "BLOCKED_BY_UNEXPECTED_DIFF") return "Review unexpected files and either remove them from the task or record approved scope change.";
  if (state === "BLOCKED_BY_PATCH_SMELL") return "Expand impact coverage or classify the work as a controlled patch with debt handoff.";
  if (state === "BLOCKED_BY_SCOPE_DRIFT") return "Reclassify the task and establish reviewed target scope before evaluating completion again.";
  if (state === "NEEDS_HUMAN_DECISION") return "Ask for the missing decision in plain language.";
  return "Collect missing evidence and independent review before claiming completion.";
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function humanReportText(report) {
  const evidence = report.structuredEvidence;
  const lines = [];
  const push = (line = "") => lines.push(line);
  push("# Execution Assurance Report");
  push("");
  push("This report is a read-only derived verification view. It does not write target files, authorize writes, approve release, or replace source systems.");
  push("");
  push("## Human Summary");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Execution Kind | \`${report.humanSummary.executionKind}\` |`);
  push(`| Assurance State | \`${report.humanSummary.assuranceState}\` |`);
  push(`| Can Claim Done | \`${report.humanSummary.canClaimDone}\` |`);
  push(`| Can Codex Write Now | \`${report.humanSummary.canCodexWriteNow}\` |`);
  push(`| Safe Next Step | ${report.humanSummary.safeNextStep} |`);
  push("");
  push("## Execution Kind");
  push("");
  push(`\`${evidence.execution_kind}\``);
  push("");
  push("## Intent Lock");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| User Intent | ${evidence.intent_lock.user_intent} |`);
  push(`| Normalized Intent | ${evidence.intent_lock.normalized_intent} |`);
  push(`| Task Ref | \`${evidence.task_ref}\` |`);
  push("| Drift Policy | Scope changes require Work Queue or Conversation Drift review. |");
  push("");
  push("## Completion Contract");
  push("");
  push("| Criterion | Status | Evidence | Notes |");
  push("| --- | --- | --- | --- |");
  for (const item of evidence.completion_contract.criteria) {
    push(`| ${item.id} | \`${item.status}\` | \`${item.evidence_refs.join(", ")}\` | Bound to current task evidence. |`);
  }
  push("");
  push("## Planned Impact Map");
  push("");
  push("| Surface | Expected | Status | Evidence | Notes |");
  push("| --- | --- | --- | --- |");
  for (const item of evidence.planned_impact_map.surfaces) {
    push(`| ${item.surface} | \`${item.expected}\` | \`${item.status}\` | \`${item.evidence_refs.join(", ")}\` | Planned surface. |`);
  }
  push("");
  push("## Execution Plan Binding");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Plan Ref | \`${evidence.execution_plan.plan_ref}\` |`);
  push(`| Risk Classification | \`${evidence.execution_plan.risk_classification}\` |`);
  push(`| Planned Target Paths | \`${evidence.execution_plan.planned_target_paths.join(", ")}\` |`);
  push(`| Approval Ref | \`${evidence.execution_plan.approval_refs.join(", ") || "N/A"}\` |`);
  push(`| Restore Strategy | ${evidence.execution_plan.restore_strategy} |`);
  push("");
  push("## Actual Diff Binding");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Diff Source | \`${evidence.actual_diff.diff_source}\` |`);
  push(`| Base Revision | \`${evidence.actual_diff.base_revision || "N/A"}\` |`);
  push(`| Changed Files | \`${evidence.actual_diff.changed_files.join(", ") || "none"}\` |`);
  push(`| Unexpected Files | \`${evidence.actual_diff.unexpected_files.join(", ") || "none"}\` |`);
  push(`| Target Diff Status | \`${evidence.actual_diff.target_diff_status}\` |`);
  push("");
  push("## Pre-Write Revalidation");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Status | \`${evidence.pre_write_revalidation.status}\` |`);
  push(`| Checked At | \`${evidence.pre_write_revalidation.checked_at}\` |`);
  push(`| Planning Closure | \`${evidence.pre_write_revalidation.planning_closure_ref}\` |`);
  push(`| Source Revision | \`${evidence.pre_write_revalidation.source_revision_digest}\` |`);
  push(`| Candidate Base | \`${evidence.pre_write_revalidation.candidate_base_revision}\` |`);
  push(`| Planned Paths Digest | \`${evidence.pre_write_revalidation.planned_target_paths_digest}\` |`);
  push(`| Changed Paths Digest | \`${evidence.pre_write_revalidation.actual_changed_paths_digest}\` |`);
  push(`| Result | \`${evidence.pre_write_revalidation.result}\` |`);
  push(`| Reason | ${evidence.pre_write_revalidation.reason} |`);
  push("");
  push("## Evidence Binding");
  push("");
  push("| Criterion | Evidence Ref | Resolved | Current Task Match |");
  push("| --- | --- | --- | --- |");
  for (const item of evidence.evidence_bindings) {
    push(`| ${item.criterion_id} | \`${item.evidence_ref}\` | \`${item.resolved}\` | \`${item.current_task_match}\` |`);
  }
  push("");
  push("## Task Entry Binding");
  push("");
  push(`- Work Queue item: \`${evidence.task_entry_binding.work_queue_item_ref}\``);
  push(`- Task Governance: \`${evidence.task_entry_binding.task_governance_ref}\``);
  push(`- Task impact: \`${evidence.task_entry_binding.task_governance_tier}\``);
  push(`- Completion requirements satisfied: \`${evidence.task_entry_binding.tier_completion_requirements_satisfied}\``);
  push("");
  push("## Plan Review Binding");
  push("");
  if (evidence.plan_review_binding) {
    push(`- Review: \`${evidence.plan_review_binding.plan_review_ref}\``);
    push(`- State: \`${evidence.plan_review_binding.plan_review_state}\``);
    push(`- Current task match: \`${evidence.plan_review_binding.current_task_match}\``);
  } else {
    push("- No current-task Plan Review evidence was found; completion remains blocked where review is required.");
  }
  push("");
  push("## Runtime Trust Binding");
  push("");
  push(runtimeBindingMarkdown(evidence.runtime_trust_binding));

  push("## Control Effectiveness Binding");
  push("");
  push(`- Requirement: \`${evidence.control_effectiveness_binding.requirement}\``);
  push(`- Status: \`${evidence.control_effectiveness_binding.status}\``);
  push(`- Report: \`${evidence.control_effectiveness_binding.report_ref}\``);
  push(`- Report digest: \`${evidence.control_effectiveness_binding.report_digest}\``);
  push(`- Assessment outcome: \`${evidence.control_effectiveness_binding.assessment_outcome}\``);
  push(`- Reason: ${evidence.control_effectiveness_binding.reason}`);
  push("");
  push("## Business Universe Assurance");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Required | \`${evidence.business_universe_binding.required}\` |`);
  push(`| Routing Result | \`${evidence.business_universe_binding.routing_result}\` |`);
  push(`| Coverage Ref | \`${evidence.business_universe_binding.business_universe_ref}\` |`);
  push(`| Coverage State | \`${evidence.business_universe_binding.business_universe_state}\` |`);
  push(`| Mapping Status | \`${evidence.business_universe_binding.coverage_mapping_status}\` |`);
  push("");
  push("| Coverage Scenario | Required Obligations | Covered Obligations | Test Evidence | Required Proof | Test State | Assurance State |");
  push("| --- | --- | --- | --- | --- | --- | --- |");
  if (evidence.scenario_assurance_map.length === 0) {
    push("| N/A | N/A | N/A | N/A | N/A | N/A | NOT_REQUIRED |");
  } else {
    for (const item of evidence.scenario_assurance_map) {
      push(`| \`${item.coverage_scenario_id}\` | \`${item.required_obligation_ids.join(", ")}\` | \`${item.covered_obligation_ids.join(", ") || "none"}\` | \`${item.test_evidence_ids.join(", ") || "none"}\` | \`${item.required_proof_strength}\` | \`${item.test_evidence_state}\` | \`${item.assurance_state}\` |`);
    }
  }
  push("");
  push("## Independent Review Binding");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Review Required | \`${evidence.review.review_required}\` |`);
  push(`| Review Refs | \`${evidence.review.review_refs.join(", ") || "none"}\` |`);
  push(`| All Reviewers Closed | \`${evidence.review.all_reviewers_closed}\` |`);
  push("");
  push("## Patch Assessment");
  push("");
  push("| Field | Value |");
  push("| --- | --- |");
  push(`| Patch State | \`${evidence.patch_assessment.state}\` |`);
  push(`| Reason | ${evidence.patch_assessment.reason} |`);
  push("");
  push("## Source System Trace");
  push("");
  push("| Source System | Status | Ref | Source Task | Source Outcome | Current Task Match | Digest | Contribution | Authority |");
  push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const item of evidence.source_systems) {
    push(`| ${item.name} | \`${item.status}\` | \`${item.ref}\` | \`${item.source_task_ref}\` | \`${item.source_outcome}\` | \`${item.current_task_match}\` | \`${item.report_digest || item.evidence_digest || "none"}\` | ${item.contribution} | Source system |`);
  }
  push("");
  push("## Closure Decision");
  push("");
  push(`\`${evidence.outcome}\``);
  push("");
  push("## Pending Human Decisions");
  push("");
  if (evidence.pending_human_decisions.length === 0) push("- None.");
  else for (const item of evidence.pending_human_decisions) push(`- ${item}`);
  push("");
  push("## Forbidden Claims");
  push("");
  push("- This report writes target files: No");
  push("- This report authorizes target-file writes: No");
  push("- This report approves implementation beyond recorded scope: No");
  push("- This report approves commit or push: No");
  push("- This report approves release or production: No");
  push("- This report replaces source systems: No");
  push("- This report proves product correctness: No");
  push("- This report transfers project authority to IntentOS: No");
  push("");
  push("## Boundary");
  push("");
  push("Execution Assurance is derived from recorded evidence and project facts. Source systems remain authoritative.");
  push("");
  push("## Machine-Readable Evidence");
  push("");
  push("```json");
  push(JSON.stringify(evidence, null, 2));
  push("```");
  return `${lines.join("\n")}\n`;
}

function resolveOutputPath(root, value) {
  if (value === true || !String(value || "").trim()) {
    console.error("FAIL --out requires a relative report path");
    process.exit(1);
  }
  const raw = String(value);
  if (path.isAbsolute(raw) || raw.includes("..")) {
    console.error("FAIL --out must be a relative path inside the target project");
    process.exit(1);
  }
  return path.resolve(root, raw);
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output.endsWith("\n") ? output : `${output}\n`);
}
