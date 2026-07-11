#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import { analyzeRiskSurfaces } from "./lib/risk-surfaces.mjs";
import { extractMachineReadableEvidence } from "./lib/artifact-schema.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "verification", "out"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._.slice(1).join(" ") || "").trim();
const verification = String(args.verification || "").trim();
const outputPath = args.out ? resolveOutputPath(projectRoot, args.out) : "";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const card = buildCard(projectRoot);

if (outputFormat === "json") {
  const output = `${JSON.stringify(card, null, 2)}\n`;
  writeOutputIfRequested(output);
  process.stdout.write(output);
} else {
  const output = humanCard(card);
  writeOutputIfRequested(output);
  process.stdout.write(output);
}

function buildCard(root) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : null;
  const files = exists ? listFiles(root) : [];
  const counts = reportCounts(root);
  const risk = exists ? analyzeRiskSurfaces({ intent, projectRoot: root, includeProjectSignals: true }) : { high: false, surfaces: [], reasons: [] };
  const sourceSignals = sourceSignalStatus(root, intent);
  const completionEvidence = completionEvidenceStatus(root, intent);
  const completionReady = completionEvidence.ready;
  const launchReviewReady = reportHas(root, "launch-review-views", /READY_FOR_RELEASE_REVIEW|READY_FOR_INTERNAL_TRIAL/i)
    || reportHas(root, "release-plans", /READY_FOR_(PREVIEW|STAGING|PRODUCTION|LOCAL)_HANDOFF|READY_FOR_HANDOFF_REVIEW/i);
  const hasFirstVersion = counts["ordinary-first-slices"] > 0 || counts["beginner-entry-cards"] > 0 || files.some((item) => /(^src\/|^app\/|^pages\/|^index\.html$|^package\.json$)/.test(item));
  const hasNeedClarity = sourceSignals.businessRuleClosure.currentCount > 0 || counts["ordinary-first-slices"] > 0 || counts["beginner-entry-cards"] > 0;
  const hasSurfaceCheck = sourceSignals.changeImpactCoverage.currentCount > 0;
  const hasVerificationPlan = sourceSignals.verificationPlan.currentCount > 0;
  const hasTestEvidence = sourceSignals.testEvidence.currentCount > 0;
  const hasUserVerificationNote = Boolean(verification);
  const userVerificationNoteStatus = verificationStatus(verification);
  const hasExecutionProof = sourceSignals.executionAssurance.currentCount > 0;
  const state = classifyState({
    exists,
    git,
    counts,
    risk,
    completionReady,
    launchReviewReady,
    hasFirstVersion,
    hasNeedClarity,
    hasSurfaceCheck,
    hasVerificationPlan,
    hasTestEvidence,
    hasUserVerificationNote,
    hasExecutionProof,
    completionEvidence,
  });
  const firstVersion = firstVersionFor(intent, hasFirstVersion);
  const missing = missingItemsFor(state, {
    hasNeedClarity,
    hasSurfaceCheck,
    hasVerificationPlan,
    hasTestEvidence,
    hasExecutionProof,
    completionReady,
    completionEvidence,
    sourceSignals,
    launchReviewReady,
    risk,
    exists,
  });
  const safeActions = safeActionsFor(state, missing);
  const decisions = humanDecisionsFor(state, risk, missing);

  return {
    reportType: "USER_DELIVERY_CONSOLE_CARD",
    schemaVersion: "1.79.4",
    generatedBy: "scripts/resolve-user-delivery-console.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    intent: intent || "Not provided",
    humanSummary: {
      conclusion: conclusionFor(state),
      currentStatus: state.label,
      canThisTaskBeTreatedAsDone: completionReady ? "Yes, with recorded evidence" : "No",
      canMoveTowardLaunchReview: launchReviewReady ? "Yes, for review only" : "No",
      recommendedNextStep: safeActions[0],
      needFromHuman: decisions[0],
    },
    deliveryStatus: {
      firstVersion,
      currentState: state.name,
      currentStateLabel: state.label,
      plainReason: state.reason,
    },
    taskCompletion: {
      needClear: yesNo(hasNeedClarity),
      affectedAreasChecked: yesNo(hasSurfaceCheck),
      verificationPlanPrepared: yesNo(hasVerificationPlan),
      testCheckEvidenceRecorded: yesNo(hasTestEvidence),
      userVerificationNoteProvided: yesNo(hasUserVerificationNote),
      userVerificationNoteStatus,
      executionProofRecorded: yesNo(hasExecutionProof),
      canCurrentTaskBeTreatedAsDone: completionReady ? "Yes" : "No",
      completionEvidenceStrictCheck: completionEvidence.status,
      currentIntentMatch: Boolean(completionEvidence.currentIntentMatch),
    },
    productReadiness: {
      firstUsefulVersion: yesNo(hasFirstVersion),
      trialReady: launchReviewReady ? "Review environment or handoff evidence is present" : "Not yet shown",
      productionApproval: "No",
    },
    launchReadiness: {
      canMoveTowardLaunchReview: launchReviewReady ? "Yes" : "No",
      blocker: launchReviewReady ? "No blocker found in this status pass" : "Launch review evidence is not recorded yet",
      releaseOrProductionAuthorizedByThisCard: "No",
    },
    missingItems: missing,
    safeNextActions: safeActions,
    humanDecisions: decisions,
    technicalTrace: technicalTraceRows(counts, {
      sourceSignals,
      completionReady,
      launchReviewReady,
      hasFirstVersion,
      hasNeedClarity,
      hasSurfaceCheck,
      hasVerificationPlan,
      hasTestEvidence,
      hasUserVerificationNote,
      userVerificationNoteStatus,
      hasExecutionProof,
      completionEvidence,
    }),
    sourceSignals: sourceSignalSummary(sourceSignals),
    boundaries: {
      writesTargetFiles: "No",
      authorizesApply: "No",
      approvesImplementation: "No",
      approvesCommitOrPush: "No",
      approvesReleaseOrProduction: "No",
      changesCiOrHooks: "No",
      replacesLowerLevelEvidenceSystems: "No",
      provesRealUserStability: "No",
      approvesHighRiskDecisions: "No",
    },
    outcome: state.name,
  };
}

function classifyState(input) {
  if (!input.exists) return state("NO_PROJECT", "Project cannot be read", "The project path does not exist or is not readable.");
  if (input.completionReady && input.launchReviewReady) return state("READY_FOR_LAUNCH_REVIEW", "Ready for launch review preparation", "The task has completion evidence and launch-review evidence is present.");
  if (input.completionReady) return state("TASK_DONE_WITH_EVIDENCE", "Task can be treated as done", "The task has a recorded final completion record.");
  if (input.completionEvidence.otherReadyCount > 0) return state("PROJECT_HAS_OTHER_COMPLETION_RECORD", "Project has a completion record for another task", "A strict completion record exists, but it does not match the current request.");
  if (input.completionEvidence.count > 0) return state("NEEDS_COMPLETION_EVIDENCE_CHECK", "Final completion record needs strict checking", "A final completion record exists, but it has not passed the strict completion check.");
  if (input.risk.high && !input.hasExecutionProof) return state("BLOCKED_BY_RISK", "Risk boundary needs confirmation", "This appears to involve higher-risk surfaces, so Codex should stop for a bounded decision.");
  if (input.hasExecutionProof || input.counts["test-evidence-reports"] > 0) return state("NEEDS_COMPLETION_EVIDENCE", "Final completion record is missing", "Work evidence exists, but the final completion record is not recorded.");
  if (input.hasTestEvidence || input.hasVerificationPlan || input.hasSurfaceCheck) return state("NEEDS_VERIFICATION", "Check evidence is still needed", "Planning evidence exists, but current check evidence or execution proof is missing.");
  if (input.hasNeedClarity || input.hasFirstVersion) return state("FIRST_VERSION_DEFINED", "First version is defined", "A first version or task direction exists, but delivery evidence is not complete yet.");
  if (input.git?.isDirty || intent) return state("IN_PROGRESS", "Work appears to be in progress", "There is a current request or changed work, but completion evidence is not present.");
  return state("IDEA_ONLY", "Idea only", "No delivery evidence was found yet.");
}

function state(name, label, reason) {
  return { name, label, reason };
}

function firstVersionFor(userIntent, hasFirstVersion) {
  if (userIntent) return userIntent;
  if (hasFirstVersion) return "A first useful version is present or recorded.";
  return "Not defined yet.";
}

function hasOtherSourceRecords(signals) {
  if (!signals) return false;
  return Object.values(signals).some((signal) => signal.intentBound && signal.currentCount === 0 && signal.otherCount > 0);
}

function missingItemsFor(stateValue, input) {
  if (!input.exists) return ["Confirm the project path."];
  const missing = [];
  if (!input.hasNeedClarity) missing.push("Confirm what the first useful version should do.");
  if (hasOtherSourceRecords(input.sourceSignals)) missing.push("Create or select source evidence that matches the current request.");
  if (!input.hasSurfaceCheck) missing.push("Check all affected areas before saying the task is complete.");
  if (!input.hasVerificationPlan) missing.push("Prepare a check plan for the current task.");
  if (!input.hasTestEvidence) missing.push("Record actual check evidence for the current task.");
  if (!input.hasExecutionProof) missing.push("Record proof that Codex executed the task as planned.");
  if (input.completionEvidence.count > 0 && !input.completionReady) {
    if (input.completionEvidence.otherReadyCount > 0) {
      missing.push("Create or select a final completion record that matches this request.");
    } else {
      missing.push("Fix the final completion record until it passes strict completion checks.");
    }
  } else if (!input.completionReady) {
    missing.push("Create the final completion record before claiming the task is done.");
  }
  if (!input.launchReviewReady) missing.push("Prepare launch review evidence before moving toward release.");
  if (input.risk.high) missing.push("Let Codex complete the stricter risk, verification, review, evidence, and rollback checks for sensitive surfaces.");
  if (stateValue.name === "TASK_DONE_WITH_EVIDENCE" && missing.length === 0) return ["No task-completion blocker found; this is still not release or production approval."];
  return missing.slice(0, 6);
}

function safeActionsFor(stateValue, missing) {
  if (stateValue.name === "NO_PROJECT") return ["Confirm the project path, then rerun status."];
  if (stateValue.name === "BLOCKED_BY_RISK") return ["Pause file changes while Codex completes the stricter risk boundary and verification plan."];
  if (stateValue.name === "PROJECT_HAS_OTHER_COMPLETION_RECORD") return ["Match the request to the correct completion record before calling this task done."];
  if (stateValue.name === "NEEDS_COMPLETION_EVIDENCE_CHECK") return ["Review the final completion record and fix any failed strict completion checks."];
  if (stateValue.name === "TASK_DONE_WITH_EVIDENCE") return ["Prepare review summary or launch-review input without approving release."];
  if (stateValue.name === "READY_FOR_LAUNCH_REVIEW") return ["Codex can prepare the release review evidence; ask for consent only before a concrete production or external-platform effect."];
  if (missing.length > 0) return [`Handle this first: ${missing[0]}`];
  return ["Keep the next step read-only until a bounded task is selected."];
}

function humanDecisionsFor(stateValue, risk, missing) {
  const decisions = [];
  if (stateValue.name === "NO_PROJECT") decisions.push("Confirm the project path.");
  if (missing.some((item) => /first useful version/i.test(item))) decisions.push("Confirm the first useful version.");
  if (risk.high) decisions.push("No technical risk decision is required from you; provide only missing business facts or consent to a concrete real-world effect.");
  if (missing.some((item) => /launch review/i.test(item))) decisions.push("No decision is needed yet; Codex should prepare launch-review evidence first.");
  if (decisions.length === 0) decisions.push("No decision needed for this read-only status card.");
  return decisions.slice(0, risk.high ? 5 : 3);
}

function technicalTraceRows(counts, input) {
  const signals = input.sourceSignals;
  return [
    ["First Slice / Beginner Entry", input.hasFirstVersion ? "RECORDED" : "MISSING", `${counts["ordinary-first-slices"] + counts["beginner-entry-cards"]} first-version artifact(s) found`, "Source system only"],
    signalTraceRow("Business Rule Closure", signals.businessRuleClosure, "rule-clarity artifact"),
    signalTraceRow("Change Impact Coverage", signals.changeImpactCoverage, "affected-surface report"),
    signalTraceRow("Verification Plan", signals.verificationPlan, "verification plan"),
    signalTraceRow("Test Evidence", signals.testEvidence, "test evidence report"),
    ["User Verification Note", input.hasUserVerificationNote ? "PROVIDED" : "MISSING", input.hasUserVerificationNote ? `User note status: ${input.userVerificationNoteStatus}` : "No --verification note provided", "User note only; not Test Evidence"],
    signalTraceRow("Execution Assurance", signals.executionAssurance, "execution proof report"),
    ["Completion Evidence", input.completionReady ? "READY" : input.completionEvidence.status, input.completionEvidence.detail, "Source system only"],
    ["Launch / Release View", input.launchReviewReady ? "RECORDED" : "MISSING", `${counts["launch-review-views"]} launch view(s), ${counts["release-plans"]} release plan(s) found`, "Source system only"],
  ];
}

function signalTraceRow(label, signal, noun) {
  const plural = signal.total === 1 ? noun : `${noun}s`;
  if (!signal.intentBound) {
    return [label, signal.currentCount > 0 ? "RECORDED" : "MISSING", `${signal.total} ${plural} found`, "Project-level signal; provide --intent for current-task matching"];
  }
  if (signal.currentCount > 0) {
    return [label, "RECORDED", `${signal.currentCount} current-task ${plural}; ${signal.otherCount} other-task record(s)`, "Current intent match"];
  }
  if (signal.otherCount > 0) {
    return [label, "OTHER_TASK_ONLY", `0 current-task ${plural}; ${signal.otherCount} other-task record(s)`, "Not current-task evidence"];
  }
  return [label, "MISSING", `0 current-task ${plural} found`, "Source system only"];
}

function conclusionFor(stateValue) {
  if (stateValue.name === "TASK_DONE_WITH_EVIDENCE") return "The current task can be treated as done within the recorded evidence boundary.";
  if (stateValue.name === "PROJECT_HAS_OTHER_COMPLETION_RECORD") return "The project has a completion record, but not for this request.";
  if (stateValue.name === "READY_FOR_LAUNCH_REVIEW") return "The work can move toward launch review, but release is not approved.";
  if (stateValue.name === "BLOCKED_BY_RISK") return "This needs a risk decision before Codex continues.";
  if (stateValue.name === "NO_PROJECT") return "I cannot read the project yet.";
  return "The work is not ready to be called complete yet.";
}

function humanCard(card) {
  const lines = [];
  lines.push("# User Delivery Console Card", "");
  lines.push("## Human Summary", "");
  lines.push(`Conclusion: ${card.humanSummary.conclusion}`, "");
  lines.push(`Current status: ${card.humanSummary.currentStatus}`, "");
  lines.push(`Can this task be treated as done: ${card.humanSummary.canThisTaskBeTreatedAsDone}`, "");
  lines.push(`Can this move toward launch review: ${card.humanSummary.canMoveTowardLaunchReview}`, "");
  lines.push(`Recommended next step: ${card.humanSummary.recommendedNextStep}`, "");
  lines.push(`What I need from you: ${card.humanSummary.needFromHuman}`, "");
  lines.push("## Delivery Status", "");
  lines.push("| Field | Value |", "|---|---|");
  lines.push(`| First version | ${card.deliveryStatus.firstVersion} |`);
  lines.push(`| Current state | ${card.deliveryStatus.currentStateLabel} |`);
  lines.push(`| Plain reason | ${card.deliveryStatus.plainReason} |`, "");
  lines.push("## Task Completion", "");
  lines.push("| Question | Answer |", "|---|---|");
  lines.push(`| Is the need clear? | ${card.taskCompletion.needClear} |`);
  lines.push(`| Are affected areas checked? | ${card.taskCompletion.affectedAreasChecked} |`);
  lines.push(`| Is the check plan prepared? | ${card.taskCompletion.verificationPlanPrepared} |`);
  lines.push(`| Is test/check evidence recorded? | ${card.taskCompletion.testCheckEvidenceRecorded} |`);
  lines.push(`| Is there a user verification note? | ${card.taskCompletion.userVerificationNoteProvided} |`);
  lines.push(`| Is execution proof recorded? | ${card.taskCompletion.executionProofRecorded} |`);
  lines.push(`| Did the final completion record pass required checks? | ${completionStatusDisplay(card.taskCompletion.completionEvidenceStrictCheck)} |`);
  lines.push(`| Can the current task be treated as done? | ${card.taskCompletion.canCurrentTaskBeTreatedAsDone} |`, "");
  lines.push("## Product Readiness", "");
  lines.push("| Question | Answer |", "|---|---|");
  lines.push(`| Is there a first useful version? | ${card.productReadiness.firstUsefulVersion} |`);
  lines.push(`| Can someone try it locally or in a review environment? | ${card.productReadiness.trialReady} |`);
  lines.push(`| Is this production approval? | ${card.productReadiness.productionApproval} |`, "");
  lines.push("## Launch Readiness", "");
  lines.push("| Question | Answer |", "|---|---|");
  lines.push(`| Can this move toward launch review? | ${card.launchReadiness.canMoveTowardLaunchReview} |`);
  lines.push(`| What blocks launch review? | ${card.launchReadiness.blocker} |`);
  lines.push(`| Does this card authorize release or production? | ${card.launchReadiness.releaseOrProductionAuthorizedByThisCard} |`, "");
  lines.push("## What Is Missing", "");
  card.missingItems.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  lines.push("", "## What Codex Can Safely Do Next", "");
  card.safeNextActions.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  lines.push("", "## What I Need From You", "");
  card.humanDecisions.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  lines.push("", "## Technical Trace", "");
  lines.push("| Source system | Status | Contribution | Authority |", "|---|---|---|---|");
  card.technicalTrace.forEach((row) => lines.push(`| ${row.map(escapeCell).join(" | ")} |`));
  lines.push("", "## Boundaries", "");
  lines.push("- This card writes target files: No");
  lines.push("- This card authorizes apply: No");
  lines.push("- This card approves implementation: No");
  lines.push("- This card approves commit or push: No");
  lines.push("- This card approves release or production: No");
  lines.push("- This card changes CI or hooks: No");
  lines.push("- This card replaces lower-level evidence systems: No");
  lines.push("- This card proves real-user stability: No");
  lines.push("- This card approves security/privacy/compliance/payment/permission/migration/legal/tax/finance/production-risk decisions: No");
  lines.push("", "## Outcome", "", `\`${card.outcome}\``, "");
  return lines.join("\n");
}

function reportCounts(root) {
  const dirs = [
    "ordinary-first-slices",
    "beginner-entry-cards",
    "business-rule-closures",
    "change-impact-coverage-reports",
    "verification-plans",
    "test-evidence-reports",
    "execution-assurance-reports",
    "completion-evidence-reports",
    "product-completeness-reports",
    "delivery-path-reports",
    "guided-closure-cards",
    "launch-review-views",
    "release-plans",
  ];
  return Object.fromEntries(dirs.map((dir) => [dir, markdownFiles(root, dir).length]));
}

function reportHas(root, dir, pattern) {
  return markdownFiles(root, dir).some((file) => pattern.test(safeRead(file)));
}

function sourceSignalStatus(root, userIntent) {
  const expectedIntentDigest = userIntent ? digest(userIntent) : "";
  const businessRuleClosure = sourceSignal(root, "business-rule-closures", expectedIntentDigest, (evidence) => {
    return evidence.source_request_digest === expectedIntentDigest || evidence.intent_digest === expectedIntentDigest;
  });
  const currentBusinessRuleRefs = new Set(businessRuleClosure.currentRecords.map((record) => record.evidence.business_rule_ref).filter(Boolean));
  const currentBusinessRuleDigests = new Set(businessRuleClosure.currentRecords.map((record) => record.evidence.business_rule_digest).filter(Boolean));

  const changeImpactCoverage = sourceSignal(root, "change-impact-coverage-reports", expectedIntentDigest, (evidence) => {
    const intentValue = evidence.user_request && typeof evidence.user_request === "object" ? evidence.user_request.intent : "";
    return digestMatch(intentValue, expectedIntentDigest)
      || currentBusinessRuleRefs.has(evidence.business_rule_ref)
      || currentBusinessRuleDigests.has(evidence.business_rule_digest);
  });
  const verificationPlan = sourceSignal(root, "verification-plans", expectedIntentDigest, (evidence) => {
    return evidence.intent_digest === expectedIntentDigest
      || currentBusinessRuleRefs.has(evidence.business_rule_ref)
      || currentBusinessRuleDigests.has(evidence.business_rule_digest);
  });
  const currentVerificationPlanRefs = new Set(verificationPlan.currentRecords.map((record) => record.evidence.verification_plan_ref).filter(Boolean));
  const currentVerificationPlanDigests = new Set(verificationPlan.currentRecords.map((record) => record.evidence.verification_plan_digest).filter(Boolean));

  const testEvidence = sourceSignal(root, "test-evidence-reports", expectedIntentDigest, (evidence) => {
    return evidence.intent_digest === expectedIntentDigest
      || currentVerificationPlanRefs.has(evidence.verification_plan_ref)
      || currentVerificationPlanDigests.has(evidence.verification_plan_digest);
  });
  const currentTestEvidenceRefs = new Set(testEvidence.currentRecords.map((record) => record.evidence.test_evidence_ref).filter(Boolean));

  const executionAssurance = sourceSignal(root, "execution-assurance-reports", expectedIntentDigest, (evidence) => {
    return evidence.intent_digest === expectedIntentDigest
      || (Array.isArray(evidence.source_systems) && evidence.source_systems.some((source) => source.name === "test_evidence" && currentTestEvidenceRefs.has(source.ref)));
  });

  return {
    businessRuleClosure,
    changeImpactCoverage,
    verificationPlan,
    testEvidence,
    executionAssurance,
  };
}

function sourceSignal(root, dir, expectedIntentDigest, matcher) {
  const files = markdownFiles(root, dir);
  const records = files.map((file) => {
    const extracted = extractMachineReadableEvidence(safeRead(file));
    return {
      file,
      ref: `artifact:${path.relative(root, file).split(path.sep).join("/")}`,
      evidence: extracted?.ok ? extracted.value : {},
    };
  });
  if (!expectedIntentDigest) {
    return {
      intentBound: false,
      total: records.length,
      currentCount: records.length,
      otherCount: 0,
      currentRecords: records,
      currentRefs: records.map((record) => record.ref).slice(0, 5),
    };
  }
  const currentRecords = records.filter((record) => matcher(record.evidence, record));
  return {
    intentBound: true,
    total: records.length,
    currentCount: currentRecords.length,
    otherCount: Math.max(0, records.length - currentRecords.length),
    currentRecords,
    currentRefs: currentRecords.map((record) => record.ref).slice(0, 5),
  };
}

function sourceSignalSummary(signals) {
  return Object.fromEntries(Object.entries(signals).map(([name, signal]) => [name, {
    intentBound: signal.intentBound,
    totalRecords: signal.total,
    currentTaskMatches: signal.currentCount,
    otherTaskRecords: signal.otherCount,
    currentRefs: signal.currentRefs,
  }]));
}

function digestMatch(value, expectedDigest) {
  return Boolean(value && expectedDigest && digest(value) === expectedDigest);
}

function completionEvidenceStatus(root, userIntent) {
  const reports = markdownFiles(root, "completion-evidence-reports");
  if (reports.length === 0) {
    return {
      ready: false,
      status: "MISSING",
      count: 0,
      otherReadyCount: 0,
      currentIntentMatch: false,
      report: "",
      detail: "0 final completion record(s) found",
    };
  }
  const checker = path.join(root, "scripts", "check-completion-evidence.mjs");
  if (!fs.existsSync(checker)) {
    return {
      ready: false,
      status: "STRICT_CHECK_UNAVAILABLE",
      count: reports.length,
      otherReadyCount: 0,
      currentIntentMatch: false,
      report: "",
      detail: `${reports.length} final completion record(s) found; strict completion checker is not installed`,
    };
  }
  const expectedIntentDigest = userIntent ? digest(userIntent) : "";
  const attempts = reports.map((file) => {
    const report = path.relative(root, file).split(path.sep).join("/");
    const result = spawnSync(process.execPath, [
      checker,
      root,
      "--report",
      report,
      "--require-structured-evidence",
      "--require-source-refs",
      "--require-ready",
    ], { cwd: root, encoding: "utf8" });
    const evidence = extractMachineReadableEvidence(safeRead(file));
    const reportIntentDigest = evidence?.ok ? String(evidence.value?.intent_digest || "") : "";
    return {
      file,
      report,
      result,
      reportIntentDigest,
      currentIntentMatch: Boolean(expectedIntentDigest && reportIntentDigest === expectedIntentDigest),
    };
  });
  const strictPassing = attempts.filter((attempt) => attempt.result.status === 0);
  const passing = strictPassing.find((attempt) => attempt.currentIntentMatch);
  if (passing) {
    return {
      ready: true,
      status: "STRICT_CHECK_PASSED",
      count: reports.length,
      otherReadyCount: Math.max(0, strictPassing.length - 1),
      currentIntentMatch: true,
      report: passing.report,
      detail: `${reports.length} final completion record(s) found; ${passing.report} passed strict completion checks and matches this request`,
    };
  }
  if (strictPassing.length > 0) {
    return {
      ready: false,
      status: expectedIntentDigest ? "STRICT_CHECK_PASSED_FOR_OTHER_TASK" : "STRICT_CHECK_PASSED_WITHOUT_CURRENT_INTENT",
      count: reports.length,
      otherReadyCount: strictPassing.length,
      currentIntentMatch: false,
      report: strictPassing[0].report,
      detail: expectedIntentDigest
        ? `${strictPassing.length} strict completion record(s) found, but none match this request`
        : `${strictPassing.length} strict completion record(s) found; provide --intent to match the current request`,
    };
  }
  return {
    ready: false,
    status: "STRICT_CHECK_FAILED",
    count: reports.length,
    otherReadyCount: 0,
    currentIntentMatch: false,
    report: attempts[0]?.report || "",
    detail: `${reports.length} final completion record(s) found; none passed strict completion checks`,
  };
}

function completionStatusDisplay(status) {
  if (status === "STRICT_CHECK_PASSED") return "Passed for this request";
  if (status === "STRICT_CHECK_PASSED_FOR_OTHER_TASK") return "Passed for another request";
  if (status === "STRICT_CHECK_PASSED_WITHOUT_CURRENT_INTENT") return "Passed, but no current request was provided";
  if (status === "STRICT_CHECK_FAILED") return "Not passed";
  if (status === "STRICT_CHECK_UNAVAILABLE") return "Cannot check in this project";
  return "Not recorded";
}

function digest(value) {
  return `sha256:${crypto.createHash("sha256").update(String(value)).digest("hex")}`;
}

function markdownFiles(root, dir) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return [];
  return walk(base).filter((file) => file.endsWith(".md"));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function listFiles(root) {
  const ignored = new Set([".git", "node_modules", ".next", "dist", "build"]);
  function scan(dir, prefix = "") {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      if (ignored.has(entry.name)) return [];
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? scan(full, rel) : [rel];
    });
  }
  return scan(root).slice(0, 800);
}

function verificationStatus(value) {
  const text = String(value || "");
  if (/\b(pass|passed|ok|success|verified)\b|通过|成功|已验证/i.test(text)) return "pass";
  if (/\b(fail|failed|error|broken)\b|失败|报错|未通过/i.test(text)) return "fail";
  return text.trim() ? "provided" : "missing";
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function safeRead(file) {
  try {
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  } catch {
    return "";
  }
}

function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function resolveOutputPath(root, rawPath) {
  const resolved = path.resolve(root, String(rawPath || ""));
  const rel = path.relative(root, resolved);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    console.error("--out requires a relative report path inside the project");
    process.exit(1);
  }
  return resolved;
}

function writeOutputIfRequested(output) {
  if (!outputPath) return;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, output);
}
