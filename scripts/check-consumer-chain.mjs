#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";
import { requireAcceptedOutcome } from "./lib/check-result.mjs";
import { isGovernedWorkflowOutputPath, projectIdentity } from "./lib/evidence-authority.mjs";
import { implementationCoverageOmissions } from "./lib/execution-assurance-consumer.mjs";
import {
  normalizeTaskIntent,
  resolveWorkQueueTaskIdentity,
  taskIntentDigest,
} from "./lib/task-entry-binding.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["base", "json", "phase"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const explicitBase = args.base || process.env.INTENTOS_CONSUMER_BASE;
const base = String(explicitBase || defaultConsumerBase());
const outputJson = Boolean(args.json);
const phase = String(args.phase || "final").trim().toLowerCase();
const checks = [];
let failed = false;

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}
if (!new Set(["candidate", "final"]).has(phase)) {
  console.error("FAIL --phase must be candidate or final");
  process.exit(1);
}

const stagedCandidate = hasStagedCandidate();
if (stagedCandidate && !stagedCandidateMatchesWorktree()) {
  fail("staged candidate differs from the worktree or has untracked executable/configuration inputs; consumer verification refuses mixed evidence");
  finish();
}
const changedResult = run("git", [
  "diff",
  ...(stagedCandidate ? ["--cached"] : []),
  "--name-only",
  "--diff-filter=ACDMRTUXB",
  base,
  "--",
]);
if (changedResult.status !== 0) {
  fail(`cannot determine changed files from ${base}: ${message(changedResult)}`);
  finish();
}

const changed = changedResult.stdout.split("\n").map(normalize).filter(Boolean);
const taskGovernedFiles = changed.filter(isTaskGovernedFile);
const closureFiles = changed.filter((file) => /^closure-decisions\/[^/]+\.md$/.test(file));
const releaseFiles = changed.filter(isReleaseFile);

if (taskGovernedFiles.length > 0) {
  pass(`task-governed project change detected: ${taskGovernedFiles.join(", ")}`);
  const taskChain = {};
  taskChain.workQueue = checkCurrentReport("Work Queue Takeover", "work-queue-takeover-reports", "scripts/check-work-queue-takeover.mjs", ["--require-report", "--require-structured-evidence", "--require-current-task-lineage"]);
  const taskGovernanceReport = checkCurrentReport("Task Governance", "task-governance-reports", "scripts/check-task-governance.mjs", ["--require-report", "--require-structured-evidence", "--require-current-task-lineage"]);
  taskChain.taskGovernance = taskGovernanceReport;
  const taskImpact = currentTaskImpact(taskGovernanceReport);
  const taskRef = currentTaskRef(taskGovernanceReport);
  const intentDigest = String(taskGovernanceReport?.evidence?.intent_digest || "").trim();
  checkCurrentReport("Change Boundary", "change-boundary-reports", "scripts/check-change-boundary.mjs", [
    "--require-report", "--base", base,
    ...(taskRef ? ["--task", taskRef] : []),
  ], true);
  const impactRequired = taskGovernanceReport?.evidence?.required_before_implementation_review?.change_impact_coverage_required === "Yes";
  const businessRuleRequired = taskGovernanceReport?.evidence?.required_before_implementation_review?.business_rule_closure_required === "Yes";
  const verificationRequired = taskGovernanceReport?.evidence?.required_before_implementation_review?.verification_plan_required === "Yes";
  if (businessRuleRequired) {
    taskChain.businessRule = checkCurrentReport("Business Rule Closure", "business-rule-closures", "scripts/check-business-rule-closure.mjs", [
      "--require-report", "--require-structured-evidence", "--require-business-rule-closure", "--require-task-lineage",
    ]);
  } else {
    pass("current Task Governance does not require Business Rule Closure");
  }
  if (impactRequired) {
    taskChain.changeImpact = checkCurrentReport("Change Impact Coverage", "change-impact-coverage-reports", "scripts/check-change-impact-coverage.mjs", [
      "--require-structured-evidence", "--require-business-rule-ready", "--require-precise-evidence", "--require-task-lineage", "--mode", "closure",
    ], false, {
      evidenceFilter: (evidence) => evidence?.mode === "closure",
      selectionLabel: "closure-mode report",
    });
  } else {
    pass("current Task Governance does not require Change Impact Coverage");
  }
  if (verificationRequired) {
    taskChain.verificationPlan = checkCurrentReport("Verification Plan", "verification-plans", "scripts/check-verification-plan.mjs", [
      "--require-report", "--require-structured-evidence", "--strict-source-binding", "--require-evidence-authority", "--require-task-lineage",
    ]);
  } else {
    pass("current Task Governance does not require Verification Plan");
  }
  const planReviewRequired = new Set(["MEDIUM", "HIGH", "POSSIBLE_HIGH"]).has(taskImpact);
  if (planReviewRequired) {
    taskChain.planReview = checkCurrentReport("Plan Review", "plan-review-reports", "scripts/check-plan-review.mjs", ["--require-report", "--require-structured-evidence", "--require-current-task-lineage"], true);
  } else if (taskImpact === "LOW") {
    pass("LOW task does not require Plan Review");
  } else {
    fail("Task Governance does not provide a recognized current task impact");
  }
  taskChain.planningClosure = checkCurrentReport("Planning Closure", "planning-closure-reports", "scripts/check-planning-closure.mjs", [
    "--require-report", "--require-structured-evidence", "--require-ready", "--post-write-consumer",
    ...(taskRef ? ["--task-ref", taskRef] : []),
    ...(intentDigest ? ["--intent-digest", intentDigest] : []),
  ], true);
  const executionFlags = [
    "--require-structured-evidence", "--require-evidence-refs", "--require-actual-diff",
    "--require-precise-evidence", "--require-task-governance", "--require-work-queue",
    "--strict-task-consumer", "--require-evidence-authority", "--require-planning-closure",
  ];
  const completionFlags = [
    "--require-report", "--require-structured-evidence", "--require-source-refs", "--require-ready",
    "--require-task-governance", "--require-work-queue", "--strict-task-consumer", "--require-evidence-authority",
  ];
  if (planReviewRequired) {
    executionFlags.push("--require-plan-review");
    completionFlags.push("--require-plan-review");
  }
  taskChain.executionAssurance = checkCurrentReport("Execution Assurance", "execution-assurance-reports", "scripts/check-execution-assurance.mjs", executionFlags);
  taskChain.completionEvidence = checkCurrentReport("Completion Evidence", "completion-evidence-reports", "scripts/check-completion-evidence.mjs", completionFlags);
  taskChain.closureDecision = checkCurrentClosureDecision();
  checkSameTaskConsumerChain(taskChain, {
    businessRuleRequired,
    impactRequired,
    verificationRequired,
    planReviewRequired,
  });
} else if (closureFiles.length > 0) {
  pass(`closure-only change detected: ${closureFiles.join(", ")}`);
  checkCurrentClosureDecision();
} else {
  pass("no task-governed project change requires the task completion consumer chain");
}

if (releaseFiles.length > 0) {
  pass(`release preparation change detected: ${releaseFiles.join(", ")}`);
  if (phase === "final") checkCurrentReleaseAcceptance();
  else pass("candidate phase defers independent Release Acceptance until the final release gate");
  const runtime = checkCurrentReport("Runtime Hygiene", "runtime-hygiene-reports", "scripts/check-runtime-hygiene.mjs", ["--require-report", "--require-structured-evidence", "--require-task-entry", "--require-runtime-sources"]);
  const channel = checkCurrentReport("Release Channel Policy", "release-channel-policies", "scripts/check-release-channel-policy.mjs", ["--require-report", "--require-structured-evidence", "--strict-source-binding"]);
  const sourceOnly = channel?.evidence?.effective_release_channel?.channel === "source_only";
  const releaseEvidence = checkCurrentReport("Release Evidence", "release-evidence-gate-reports", "scripts/check-release-evidence-gate.mjs", [
    "--require-report", "--require-structured-evidence", "--require-current-completion", "--strict-source-binding",
    ...(sourceOnly ? [] : ["--require-platform-recipe"]),
  ]);
  const execution = checkCurrentReport("Release Execution", "release-execution-plans", "scripts/check-release-execution.mjs", [
    "--require-report", "--require-structured-evidence",
    ...(sourceOnly ? [] : ["--require-release-trust"]),
  ]);
  if (sourceOnly) checkSourceOnlyReleaseChain({ runtime, channel, releaseEvidence, execution });
} else {
  pass("no release preparation change requires the release consumer chain");
}

function checkSourceOnlyReleaseChain({ runtime, channel, releaseEvidence, execution }) {
  const runtimeEvidence = runtime?.evidence;
  const channelEvidence = channel?.evidence;
  const gateEvidence = releaseEvidence?.evidence;
  const executionEvidence = execution?.evidence;
  if (!runtimeEvidence || !channelEvidence || !gateEvidence || !executionEvidence) {
    fail("source-only release consumer chain requires readable current Runtime, Channel, Evidence, and Execution reports");
    return;
  }
  expectEqual("Source-only release channel", channelEvidence.effective_release_channel?.channel, "source_only");
  expectEqual("Source-only release target", gateEvidence.release_target, "source_review");
  expectEqual("Source-only Release Execution mode", executionEvidence.execution_mode?.mode, "PLAN_ONLY");
  expectEqual("Source-only Release Execution authority", executionEvidence.execution_mode?.real_release_execution_allowed, "No");
  expectEqual("Source-only Release Execution outcome", executionEvidence.outcome, "RELEASE_EXECUTION_PLAN_RECORDED");
  if (JSON.stringify(executionEvidence.project_identity) === JSON.stringify(projectIdentity(projectRoot))) {
    pass("Source-only Release Execution matches the current project revision");
  } else {
    fail("Source-only Release Execution project identity or revision is stale");
  }
  const runtimeBinding = runtimeEvidence.release_trust_binding || {};
  const gateScope = gateEvidence.release_scope || {};
  expectEqual("Source-only candidate ref", normalizeRef(gateScope.release_candidate_ref), normalizeRef(runtimeBinding.release_candidate_ref));
  expectEqual("Source-only candidate digest", gateScope.release_candidate_digest, runtimeBinding.release_candidate_digest);
  expectEqual("Source-only candidate revision", gateScope.source_revision, runtimeBinding.source_revision);
  expectEqual("Source-only Runtime decision", runtimeEvidence.decision_state, "CAN_CONTINUE_TO_RELEASE_REVIEW");
  expectEqual("Source-only gate authority", gateEvidence.release_or_production_approved, "No");
}

finish();

function checkCurrentReport(label, directory, script, flags, requireReadyOutcome = false, options = {}) {
  const candidates = changed
    .filter((file) => file.startsWith(`${directory}/`) && file.endsWith(".md"))
    .filter((file) => fs.existsSync(path.join(projectRoot, file)));
  const reports = typeof options.evidenceFilter === "function"
    ? candidates.filter((file) => {
      const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(projectRoot, file), "utf8"));
      return extracted?.ok && options.evidenceFilter(extracted.value);
    })
    : candidates;
  if (reports.length !== 1) {
    const selection = options.selectionLabel ? ` ${options.selectionLabel}` : " current report";
    fail(`${label} requires exactly one changed${selection} under ${directory}; found ${reports.length}`);
    return null;
  }
  const report = reports[0];
  const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(projectRoot, report), "utf8"));
  const result = run(process.execPath, [script, projectRoot, "--report", reports[0], ...flags, "--json"]);
  if (result.status !== 0) {
    fail(`${label} current report failed: ${reports[0]}: ${message(result)}`);
    return { path: report, evidence: extracted?.ok ? extracted.value : null };
  }
  if (requireReadyOutcome) {
    const parsed = parseJson(result.stdout);
    const accepted = requireAcceptedOutcome(parsed);
    if (!accepted.ok) {
      fail(`${label} current report is not consumer-ready: ${reports[0]}: ${accepted.reason}`);
      return { path: report, evidence: extracted?.ok ? extracted.value : null };
    }
  }
  pass(`${label} current report passed: ${reports[0]}`);
  return { path: report, evidence: extracted?.ok ? extracted.value : null };
}

function checkCurrentReleaseAcceptance() {
  const reports = changed
    .filter((file) => /^releases\/\d+\.\d+\.\d+\/independent-review-report\.md$/.test(file))
    .filter((file) => fs.existsSync(path.join(projectRoot, file)));
  if (reports.length !== 1) {
    fail(`Release Acceptance requires exactly one changed independent review report; found ${reports.length}`);
    return null;
  }
  const report = reports[0];
  const extracted = extractMachineReadableEvidence(fs.readFileSync(path.join(projectRoot, report), "utf8"));
  const evidence = extracted?.ok ? extracted.value : null;
  const version = String(evidence?.release_version || report.split("/")[1] || "");
  const candidateDigest = String(evidence?.candidate?.candidate_digest || "");
  const head = run("git", ["rev-parse", "HEAD"]);
  const result = run(process.execPath, [
    "scripts/check-release-acceptance.mjs",
    projectRoot,
    "--report", report,
    "--version", version,
    "--candidate-git-revision", head.status === 0 ? head.stdout.trim() : "",
    "--candidate-digest", candidateDigest,
    "--require-dispatch-binding",
    "--require-accepted",
    "--json",
  ]);
  if (result.status !== 0) {
    fail(`Release Acceptance current report failed: ${report}: ${message(result)}`);
    return { path: report, evidence };
  }
  pass(`Release Acceptance current report passed: ${report}`);
  return { path: report, evidence };
}

function checkCurrentClosureDecision() {
  const reports = closureFiles.filter((file) => fs.existsSync(path.join(projectRoot, file)));
  if (reports.length !== 1) {
    fail(`Closure Decision requires exactly one changed current report under closure-decisions; found ${reports.length}`);
    return null;
  }
  const report = reports[0];
  const result = run(process.execPath, [
    "scripts/check-closure-decision.mjs",
    projectRoot,
    "--report", report,
    "--require-report",
    "--require-current-authority",
    "--require-done",
    "--json",
  ]);
  const content = fs.readFileSync(path.join(projectRoot, report), "utf8");
  if (result.status !== 0) {
    fail(`Closure Decision current report failed: ${report}: ${message(result)}`);
  } else {
    pass(`Closure Decision current finish authority passed: ${report}`);
  }
  return { path: report, evidence: parseClosureDecision(content) };
}

function currentTaskImpact(report) {
  return String(report?.evidence?.impact_classification?.task_impact || "").trim().toUpperCase();
}

function currentTaskRef(report) {
  return String(report?.evidence?.task_ref || "").trim();
}

function checkSameTaskConsumerChain(chain, {
  businessRuleRequired,
  impactRequired,
  verificationRequired,
  planReviewRequired,
}) {
  const governance = chain.taskGovernance?.evidence;
  if (!governance) {
    fail("same-task consumer chain requires readable current Task Governance evidence");
    return;
  }
  const taskRef = String(governance.task_ref || "").trim();
  const intent = String(governance.intent || "").trim();
  const intentDigest = String(governance.intent_digest || "").trim();
  if (!taskRef || !intentDigest) {
    fail("same-task consumer chain requires Task Governance task_ref and intent_digest");
    return;
  }

  const queueTask = resolveWorkQueueTaskIdentity(projectRoot, governance.task_lineage?.work_queue_item_ref, {
    fromFile: chain.taskGovernance.path,
    requireCurrent: true,
  });
  if (!queueTask.ok) {
    fail(`same-task consumer chain cannot resolve exact Work Queue task instance: ${queueTask.error}`);
    return;
  }
  const queue = chain.workQueue?.evidence;
  const queueItem = queueTask.item;
  expectEqual("Work Queue report ref", normalizeRef(queueTask.resolved.relativePath), normalizeRef(chain.workQueue?.path));
  expectEqual("Work Queue intent", queue?.intent, intent);
  expectEqual("Work Queue intent_digest", queue?.intent_digest, intentDigest);
  expectEqual("Work Queue task_ref", queueTask.identity.task_ref, taskRef);
  expectEqual("Work Queue item digest", queueTask.identity.work_queue_item_digest, governance.task_lineage?.work_queue_item_digest);
  if (queueItem?.state === "CURRENT" && sameRef(queueItem.task_governance_ref, chain.taskGovernance.path)) {
    pass("Work Queue CURRENT item binds the exact current Task Governance report");
  } else fail("Work Queue requires one CURRENT item bound to the exact current Task Governance report");
  if (queueItem) {
    expectEqual("Work Queue Task Governance digest", queueItem.task_governance_digest, governance.task_governance_digest);
    expectEqual("Work Queue Task Governance binding status", queueItem.task_governance_binding_status, "VERIFIED");
  }

  const businessRule = chain.businessRule?.evidence;
  if (businessRuleRequired && !businessRule) {
    fail("same-task consumer chain requires readable current Business Rule Closure evidence");
  }
  if (businessRule) {
    expectTaskIdentity("Business Rule Closure", businessRule, taskRef, intent, intentDigest);
  }

  const impact = chain.changeImpact?.evidence;
  if (impactRequired && !impact) {
    fail("same-task consumer chain requires readable current Change Impact Coverage evidence");
  }
  if (impact) {
    expectEqual("Change Impact task_ref", impact.user_request?.task_ref, taskRef);
    expectEqual("Change Impact intent", impact.user_request?.intent, intent);
    expectEqual("Change Impact intent_digest", taskIntentDigest(impact.user_request?.intent), intentDigest);
    if (businessRule) {
      expectEqual("Change Impact Business Rule ref", normalizeRef(impact.business_rule_ref), normalizeRef(chain.businessRule.path));
      expectEqual("Change Impact Business Rule digest", impact.business_rule_digest, businessRule.business_rule_digest);
    }
  }

  const verification = chain.verificationPlan?.evidence;
  if (verificationRequired && !verification) {
    fail("same-task consumer chain requires readable current Verification Plan evidence");
  }
  if (verification) {
    expectTaskIdentity("Verification Plan", verification, taskRef, intent, intentDigest);
    if (businessRule) {
      expectEqual("Verification Plan Business Rule ref", normalizeRef(verification.business_rule_ref), normalizeRef(chain.businessRule.path));
      expectEqual("Verification Plan Business Rule digest", verification.business_rule_digest, businessRule.business_rule_digest);
    }
    if (impact) checkPlanningAndClosureImpactChain({
      verification,
      closureImpact: impact,
      closureImpactPath: chain.changeImpact.path,
      businessRule,
      businessRulePath: chain.businessRule?.path,
      taskRef,
      intent,
      intentDigest,
    });
  }

  const plan = chain.planReview?.evidence;
  if (planReviewRequired && !plan) {
    fail("same-task consumer chain requires readable current Plan Review evidence");
  }
  if (plan) {
    expectTaskIdentity("Plan Review", plan, taskRef, intent, intentDigest);
    expectEqual("Plan Review Task Governance ref", normalizeRef(plan.task_governance?.ref), normalizeRef(chain.taskGovernance.path));
    expectEqual("Plan Review Task Governance digest", plan.task_governance?.digest, governance.task_governance_digest);
    if (verification?.impact_ref) {
      const impactSource = (plan.source_chain || []).find((item) => item.source_kind === "change_impact_coverage");
      expectEqual("Plan Review Change Impact ref", normalizeRef(impactSource?.source_ref), normalizeRef(verification.impact_ref));
    }
  }

  const planning = chain.planningClosure?.evidence;
  if (!planning) {
    fail("same-task consumer chain requires readable current Planning Closure evidence");
  } else {
    expectEqual("Planning Closure task_ref", planning.task_ref, taskRef);
    expectEqual("Planning Closure intent_digest", planning.intent_digest, intentDigest);
    expectEqual("Planning Closure outcome", planning.outcome, "PLANNING_READY");
    expectEqual("Planning Closure current task", planning.current_task?.current_task_match, "Yes");
    expectEqual("Planning Closure Task Governance ref", normalizeRef(planning.task_governance?.ref), normalizeRef(chain.taskGovernance.path));
    expectEqual("Planning Closure Task Governance digest", planning.task_governance?.digest, governance.task_governance_digest);
    if (plan) {
      const planSource = (planning.source_requirements || []).find((item) => item.source_kind === "PLAN_REVIEW" && item.required === "Yes");
      expectEqual("Planning Closure Plan Review ref", normalizeRef(planSource?.report_ref), normalizeRef(chain.planReview.path));
      expectEqual("Planning Closure Plan Review digest", planSource?.report_digest, plan.plan_review_digest);
    }
    if (verification?.impact_ref) {
      const impactSource = (planning.source_requirements || []).find((item) => item.source_kind === "CHANGE_IMPACT" && item.required === "Yes");
      expectEqual("Planning Closure preflight Impact ref", normalizeRef(impactSource?.report_ref), normalizeRef(verification.impact_ref));
    }
  }

  const execution = chain.executionAssurance?.evidence;
  if (execution) {
    expectTaskIdentity("Execution Assurance", execution, taskRef, intent, intentDigest);
    checkTaskEntryRefs("Execution Assurance", execution.task_entry_binding, chain, queueItem, governance);
    if (plan) checkPlanReviewRef("Execution Assurance", execution.plan_review_binding, chain.planReview, plan);
    if (planning) checkPlanningClosureRef("Execution Assurance", execution.planning_closure_binding, chain.planningClosure, planning);
  } else {
    fail("same-task consumer chain requires readable current Execution Assurance evidence");
  }

  const completion = chain.completionEvidence?.evidence;
  if (completion) {
    expectTaskIdentity("Completion Evidence", completion, taskRef, intent, intentDigest);
    checkTaskEntryRefs("Completion Evidence", completion.task_entry_binding, chain, queueItem, governance);
    if (plan) checkPlanReviewRef("Completion Evidence", completion.plan_review_binding, chain.planReview, plan);
    if (chain.executionAssurance?.path) {
      const source = (completion.source_chain || []).find((item) => item.name === "execution_assurance");
      expectEqual("Completion Evidence Execution Assurance ref", normalizeRef(source?.ref), normalizeRef(chain.executionAssurance.path));
      expectEqual("Completion Evidence Execution Assurance task_ref", source?.task_ref, taskRef);
      expectEqual("Completion Evidence Execution Assurance intent_digest", source?.intent_digest, intentDigest);
    }
  } else {
    fail("same-task consumer chain requires readable current Completion Evidence evidence");
  }

  const closure = chain.closureDecision?.evidence;
  if (!closure) {
    fail("same-task consumer chain requires readable current Closure Decision finish authority");
  } else {
    expectEqual("Closure Decision authority version", closure.authorityVersion, "1.113.0");
    expectEqual("Closure Decision authority marker", closure.authorityMarker, "CURRENT_FINISH_AUTHORITY");
    expectEqual("Closure Decision decision", closure.decision, "DONE");
    expectTaskIdentity("Closure Decision", closure, taskRef, intent, intentDigest);
    expectEqual("Closure Decision Completion Evidence ref", normalizeRef(closure.completionEvidenceRef), normalizeRef(chain.completionEvidence?.path));
  }
}

function checkPlanningAndClosureImpactChain({
  verification,
  closureImpact,
  closureImpactPath,
  businessRule,
  businessRulePath,
  taskRef,
  intent,
  intentDigest,
}) {
  const plannedRef = normalizeRef(verification.impact_ref);
  const planned = readProjectEvidence(plannedRef);
  if (!planned) {
    fail(`Verification Plan preflight Impact ${plannedRef || "<missing>"} is not readable project evidence`);
    return;
  }
  expectEqual("Verification Plan preflight Impact mode", planned.mode, "preflight");
  expectEqual("Verification Plan preflight Impact digest", verification.impact_digest, planned.impact_digest);
  expectEqual("Verification Plan preflight Impact task_ref", planned.user_request?.task_ref, taskRef);
  expectEqual("Verification Plan preflight Impact intent", normalizeTaskIntent(planned.user_request?.intent), intent);
  expectEqual("Verification Plan preflight Impact intent_digest", taskIntentDigest(planned.user_request?.intent), intentDigest);
  if (businessRule) {
    expectEqual("Verification Plan preflight Business Rule ref", normalizeRef(planned.business_rule_ref), normalizeRef(businessRulePath));
    expectEqual("Verification Plan preflight Business Rule digest", planned.business_rule_digest, businessRule.business_rule_digest);
  }
  expectEqual("Completion Change Impact mode", closureImpact.mode, "closure");
  const omitted = implementationCoverageOmissions(planned.changed_files, closureImpact.changed_files);
  if (omitted.length === 0) pass("Completion Change Impact preserves every preflight implementation file");
  else fail(`Completion Change Impact ${closureImpactPath} omits preflight implementation files: ${omitted.join(", ")}`);
}

function readProjectEvidence(relativeRef) {
  if (!relativeRef || relativeRef.split("/").includes("..")) return null;
  const candidate = path.resolve(projectRoot, relativeRef);
  const relative = path.relative(projectRoot, candidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  try {
    const stat = fs.lstatSync(candidate);
    if (!stat.isFile() || stat.isSymbolicLink()) return null;
    const extracted = extractMachineReadableEvidence(fs.readFileSync(candidate, "utf8"));
    return extracted?.ok ? extracted.value : null;
  } catch {
    return null;
  }
}

function checkTaskEntryRefs(label, binding, chain, queueItem, governance) {
  expectEqual(`${label} Task Governance ref`, normalizeRef(binding?.task_governance_ref), normalizeRef(chain.taskGovernance?.path));
  expectEqual(`${label} Task Governance digest`, binding?.task_governance_digest, governance.task_governance_digest);
  if (chain.workQueue?.path && queueItem) {
    expectEqual(`${label} Work Queue ref`, normalizeRef(binding?.work_queue_item_ref), normalizeRef(`${chain.workQueue.path}#${queueItem.item_id}`));
    expectEqual(`${label} Work Queue item digest`, binding?.work_queue_item_digest, governance.task_lineage?.work_queue_item_digest);
  }
}

function checkPlanReviewRef(label, binding, report, evidence) {
  expectEqual(`${label} Plan Review ref`, normalizeRef(binding?.plan_review_ref), normalizeRef(report.path));
  expectEqual(`${label} Plan Review digest`, binding?.plan_review_digest, evidence.plan_review_digest);
  expectEqual(`${label} Plan Review task_ref`, binding?.task_ref, evidence.task_ref);
}

function checkPlanningClosureRef(label, binding, report, evidence) {
  expectEqual(`${label} Planning Closure ref`, normalizeRef(binding?.planning_closure_ref), normalizeRef(report.path));
  expectEqual(`${label} Planning Closure report digest`, binding?.planning_closure_report_digest, evidence.report_digest);
  expectEqual(`${label} Planning Closure core digest`, binding?.planning_closure_core_digest, evidence.closure_core_digest);
  expectEqual(`${label} Planning Closure task_ref`, binding?.task_ref, evidence.task_ref);
  expectEqual(`${label} Planning Closure intent_digest`, binding?.intent_digest, evidence.intent_digest);
  expectEqual(`${label} Planning Closure status`, binding?.status, "VERIFIED");
}

function expectTaskIdentity(label, evidence, taskRef, intent, intentDigest) {
  expectEqual(`${label} task_ref`, evidence?.task_ref, taskRef);
  const observedIntent = typeof evidence?.intent === "string"
    ? evidence.intent
    : typeof evidence?.user_request === "string"
      ? evidence.user_request
      : typeof evidence?.user_request?.intent === "string"
        ? evidence.user_request.intent
        : evidence?.intent_lock?.user_intent;
  expectEqual(`${label} intent`, normalizeTaskIntent(observedIntent), intent);
  const observedIntentDigest = evidence?.intent_digest
    || evidence?.source_request_digest
    || (observedIntent ? taskIntentDigest(observedIntent) : "");
  expectEqual(`${label} intent_digest`, observedIntentDigest, intentDigest);
}

function parseClosureDecision(content) {
  const evidenceBody = section(content, "Evidence Map");
  const completionRow = evidenceBody.split("\n")
    .find((line) => /^\|\s*Completion Evidence\s*\|/i.test(line));
  const cells = completionRow
    ? completionRow.split("|").slice(1, -1).map((cell) => cell.trim().replace(/`/g, ""))
    : [];
  return {
    authorityVersion: tableValue(content, "Authority version"),
    authorityMarker: tableValue(content, "Authority marker"),
    decision: tableValue(content, "Decision"),
    task_ref: tableValue(content, "Task ref"),
    intent: tableValue(content, "Intent"),
    intent_digest: tableValue(content, "Intent digest"),
    completionEvidenceRef: cells[3] || "",
  };
}

function tableValue(content, key) {
  const match = String(content || "").match(new RegExp(`\\|\\s*${escapeRegExp(key)}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i"));
  return match ? match[1].trim().replace(/`/g, "") : "";
}

function section(content, heading) {
  const match = String(content || "").match(new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "im"));
  if (!match) return "";
  const rest = String(content).slice(match.index + match[0].length);
  const next = rest.search(/^##\s+/m);
  return next < 0 ? rest : rest.slice(0, next);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function expectEqual(label, actual, expected) {
  if (actual === expected && expected !== undefined && expected !== "") pass(`${label} matches the current task chain`);
  else fail(`${label} ${actual || "<missing>"} must match ${expected || "<missing>"}`);
}

function sameRef(left, right) {
  return normalizeRef(left) === normalizeRef(right);
}

function normalizeRef(value) {
  return String(value || "").trim().replace(/^(artifact|file):/i, "");
}

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isTaskGovernedFile(file) {
  return !isGovernedWorkflowOutputPath(file);
}

function isReleaseFile(file) {
  const normalized = normalize(file);
  const name = path.posix.basename(normalized);
  if (/^scripts\/self-check\/[^/]+\.mjs$/.test(normalized)) return false;
  if (/^(?:launch-review-views|release-adapters|release-approval-records|release-candidates|release-channel-policies|release-evidence-gate-reports|release-execution-plans|release-execution-topologies|release-guides|release-handoff-packs|release-plans|release-recipes|release-topology-migrations|releases|runtime-hygiene-reports)\//.test(normalized)) return true;
  if (/^(?:VERSION\.md|CHANGELOG\.md)$/i.test(normalized)) return true;
  if (/\.(?:tf|tfvars|hcl)$/i.test(normalized)) return true;
  if (/^(?:\.github\/workflows\/|scripts\/)/.test(normalized) && /(?:^|[-_.])(deploy|deployment|publish|release|production|prod|rollback|submit)(?:[-_.]|$)/i.test(name)) return true;
  if (/^(?:charts|deploy|deployment|helm|infra|infrastructure|k8s|kubernetes|ops|terraform)\//i.test(normalized)) return true;
  if (/^(?:docker-compose|compose)(?:\.[^.]+)*\.ya?ml$/i.test(name)) return true;
  return false;
}

function defaultConsumerBase() {
  const emptyTree = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
  const head = run("git", ["rev-parse", "--verify", "HEAD"]);
  if (head.status !== 0) return emptyTree;

  const currentTrackedDiff = run("git", ["diff", "--quiet", "HEAD", "--"]);
  if (currentTrackedDiff.status === 1) return "HEAD";
  if (currentTrackedDiff.status !== 0) return "HEAD";

  const parent = run("git", ["rev-parse", "--verify", "HEAD^"]);
  return parent.status === 0 ? "HEAD^" : emptyTree;
}

function hasStagedCandidate() {
  const result = run("git", ["diff", "--cached", "--quiet", "--"]);
  return result.status === 1;
}

function stagedCandidateMatchesWorktree() {
  const tracked = run("git", ["diff", "--quiet", "--"]);
  if (tracked.status !== 0) return false;
  const untracked = run("git", ["ls-files", "--others", "--exclude-standard"]);
  if (untracked.status !== 0) return false;
  return untracked.stdout.split(/\r?\n/).map(normalize).filter(Boolean)
    .every((file) => /^docs\/plans\/[a-zA-Z0-9._/-]+\.md$/.test(file));
}

function run(command, commandArgs) {
  return spawnSync(command, commandArgs, { cwd: projectRoot, encoding: "utf8" });
}

function message(result) {
  return String(result.stderr || result.stdout || `exit ${result.status}`).trim().replace(/\s+/g, " ");
}

function normalize(value) {
  return String(value || "").trim().replaceAll(path.sep, "/").replace(/^\.\//, "");
}

function pass(text) {
  checks.push({ status: "PASS", message: text });
  if (!outputJson) console.log(`PASS ${text}`);
}

function fail(text) {
  failed = true;
  checks.push({ status: "FAIL", message: text });
  if (!outputJson) console.error(`FAIL ${text}`);
}

function finish() {
  if (outputJson) console.log(JSON.stringify({ status: failed ? "FAIL" : "PASS", phase, checks }, null, 2));
  process.exit(failed ? 1 : 0);
}
