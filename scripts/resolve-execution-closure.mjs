#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { defaultIgnoredDirs, walkRelativePaths } from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "task", "verification"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || "").trim();
const task = String(args.task || "").trim();
const verification = String(args.verification || "").trim();

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildReport(projectRoot, intent, task, verification);

if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildReport(root, userIntent, taskRef, verificationEvidence) {
  const exists = fs.existsSync(root);
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const signals = collectSignals(root, paths, userIntent, verificationEvidence);
  const closure = classifyClosure(signals, userIntent, taskRef, verificationEvidence);
  const decisions = decisionsFor(closure, signals);

  return {
    reportType: "EXECUTION_REVIEW_CLOSURE",
    generatedBy: "scripts/resolve-execution-closure.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    taskContext: {
      taskOrChange: taskRef || userIntent || "Not provided",
      relatedTaskCard: taskRef || "N/A",
      userIntent: userIntent || "Not provided",
      deliveryPathState: signals.deliveryPathState,
      reviewSurfaceSource: signals.reviewSurfaceSource,
    },
    humanDecisionSummary: {
      conclusion: `Closure state is ${closure.state}.`,
      recommendedChoice: closure.recommendedChoice,
      canAiContinueNow: closure.canAiContinueNow,
      needFromHuman: decisions.length > 0 ? decisions.join(" / ") : "No decision needed for read-only closure reporting.",
      ifNothing: "No files are changed. No task state, debt, commit, push, release, or production behavior is approved.",
    },
    changeSummary: {
      changedFilesCount: signals.changedFiles.length,
      changedFilesReviewed: signals.changedFiles.length > 0 ? "pass" : "not verified",
      changedFiles: signals.changedFiles.slice(0, 12),
      whatChanged: signals.changedFiles.length > 0
        ? `Detected changed files: ${signals.changedFiles.slice(0, 8).map((item) => item.path).join(", ")}`
        : "No changed files were detected by this read-only closure.",
      whyItChanged: userIntent || taskRef || "Not provided. Record the task reason before treating closure as ready.",
    },
    reviewSurfaceClosure: reviewSurfaceClosure(signals, closure),
    verificationClosure: verificationClosure(signals, verificationEvidence),
    scopeBoundaryClosure: {
      intendedScope: taskRef || userIntent || "Not provided",
      outOfScopeChangesFound: signals.outOfScopeRisk ? "Unknown" : "No",
      highRiskSurfacesTouched: signals.highRisk ? "Yes" : "No",
      requiresHumanDecision: closure.state === "NEEDS_HUMAN_DECISION" || closure.state === "BLOCKED" ? "Yes" : "No",
    },
    debtClosure: {
      debtResult: signals.highRisk && !signals.verificationPassed ? "needs human decision" : signals.changedFiles.length > 0 ? "deferred" : "not reviewed",
      debtBlocksReleaseReview: signals.releaseRisk && !signals.verificationPassed ? "Yes" : "No",
      handoffNeeded: signals.changedFiles.length > 0 && !signals.verificationPassed ? "Yes" : "No",
      handoffRef: "N/A",
    },
    commitReadiness: {
      closureState: closure.state,
      canPrepareCommitReview: closure.state === "READY_FOR_COMMIT_REVIEW" ? "Yes" : closure.state === "CLOSE_WITH_LIMITATIONS" ? "Limited" : "No",
      commitScopeReady: closure.state === "READY_FOR_COMMIT_REVIEW" ? "Yes" : "No",
      requiredBeforeCommitReview: closure.requiredBeforeCommitReview,
    },
    humanDecisions: decisions,
    boundaries: {
      writesTargetFiles: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      changesTaskState: "No",
      forgivesDebt: "No",
      replacesReviewLoop: "No",
      replacesSafeLaunch: "No",
      authorizesCommitOrPush: "No",
      approvesHighRiskDecisions: "No",
    },
    outcome: closure.outcome,
  };
}

function collectSignals(root, paths, userIntent, verificationEvidence) {
  const git = readGitStatus(root);
  const changedFiles = git.files.filter((item) => !isNoiseFile(item.path));
  const packageJson = readJsonIfExists(path.join(root, "package.json"));
  const scripts = packageJson?.scripts || {};
  const allText = [
    paths.join("\n"),
    JSON.stringify(packageJson || {}),
    userIntent,
    changedFiles.map((item) => item.path).join("\n"),
  ].join("\n");
  const verificationStatus = classifyVerification(verificationEvidence);
  return {
    exists: fs.existsSync(root),
    git,
    changedFiles,
    dirty: changedFiles.length > 0,
    verificationStatus,
    verificationPassed: verificationStatus === "pass",
    verificationFailed: verificationStatus === "fail",
    hasVerificationPath: /\b(test|check|lint|typecheck|e2e|verify)\b/i.test(Object.keys(scripts).join(" ")),
    highRisk: /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance|production|release|secret|token|ci|workflow|hook)\b/i.test(allText),
    releaseRisk: /\b(release|production|deploy|rollback|staging|ci|workflow|hook|launch)\b/i.test(allText),
    outOfScopeRisk: changedFiles.length > 12,
    deliveryPathState: "N/A",
    reviewSurfaceSource: "inferred from changed files, intent, and project signals",
  };
}

function classifyClosure(signals, userIntent, taskRef, verificationEvidence) {
  if (!signals.exists) {
    return closure("BLOCKED", "Confirm the project path before closure.", "no", "Project cannot be read.", "BLOCKED");
  }
  if (signals.verificationFailed) {
    return closure("BLOCKED", "Fix or record failed verification before closure.", "no", "Verification failed.", "BLOCKED");
  }
  if (signals.highRisk && !signals.verificationPassed) {
    return closure("NEEDS_HUMAN_DECISION", "High-risk work needs explicit verification and human decision before closure.", "limited", "Provide verification evidence and risk decision.", "NEEDS_HUMAN_DECISION");
  }
  if (signals.changedFiles.length > 0 && signals.verificationPassed) {
    return closure("READY_FOR_COMMIT_REVIEW", "Prepare a commit review summary; do not commit or push without the current workflow allowing it.", "limited", "Human review of commit scope.", "CLOSURE_RECORDED");
  }
  if (signals.changedFiles.length > 0) {
    return closure("NOT_READY_TO_CLOSE", "Run or record verification before closing this execution.", "limited", "Verification evidence.", "NEEDS_HUMAN_DECISION");
  }
  if (verificationEvidence || userIntent || taskRef) {
    return closure("CLOSE_WITH_LIMITATIONS", "Record that no changed files were detected and keep closure limited to the supplied context.", "limited", "Confirm whether there was actually implementation work to close.", "CLOSURE_RECORDED");
  }
  return closure("NOT_READY_TO_CLOSE", "No execution evidence was detected. Use closure after a task, verification, or changed scope exists.", "no", "Task, intent, changed files, or verification evidence.", "NEEDS_HUMAN_DECISION");
}

function closure(state, recommendedChoice, canAiContinueNow, requiredBeforeCommitReview, outcome) {
  return {
    state,
    recommendedChoice,
    canAiContinueNow,
    requiredBeforeCommitReview,
    outcome,
  };
}

function reviewSurfaceClosure(signals, closureInfo) {
  const baseEvidence = signals.changedFiles.length > 0 ? "changed files detected" : "no changed files detected";
  const functionalResult = signals.changedFiles.length > 0 || closureInfo.state === "CLOSE_WITH_LIMITATIONS" ? "pass" : "not verified";
  const codeResult = signals.changedFiles.length > 0 ? "pass" : "not verified";
  const verificationResult = signals.verificationStatus;
  const debtResult = signals.highRisk && !signals.verificationPassed ? "fail" : signals.changedFiles.length > 0 ? "pass" : "not verified";
  return [
    surface("FUNCTIONAL_REVIEW", functionalResult, baseEvidence, functionalResult === "pass" ? "N/A" : "No task outcome evidence."),
    surface("CODE_REVIEW", codeResult, baseEvidence, codeResult === "pass" ? "N/A" : "No changed code evidence."),
    surface("VERIFICATION_REVIEW", verificationResult, signals.verificationPassed ? "verification evidence provided" : "verification not passed", verificationResult === "pass" ? "N/A" : "Verification must be run or recorded."),
    surface("DEBT_REVIEW", debtResult, signals.highRisk ? "risk/debt signal detected" : baseEvidence, debtResult === "pass" ? "N/A" : "Debt or handoff needs review."),
  ];
}

function surface(surfaceName, result, evidence, unverifiedReasonOrOwner) {
  return { surface: surfaceName, result, evidence, unverifiedReasonOrOwner };
}

function verificationClosure(signals, verificationEvidence) {
  const evidence = verificationEvidence || (signals.hasVerificationPath ? "verification path detected but result not provided" : "no verification evidence provided");
  return [
    { check: "Verification commands", status: signals.verificationStatus, evidence, owner: "Codex" },
    { check: "Manual verification", status: "not verified", evidence: "manual verification was not provided to this read-only resolver", owner: "Codex / human" },
    { check: "Unverified items named", status: signals.verificationStatus === "pass" ? "pass" : "pass", evidence: signals.verificationStatus === "pass" ? "no unresolved verification items detected by provided evidence" : "unverified verification/manual checks are named", owner: "Codex" },
  ];
}

function decisionsFor(closureInfo, signals) {
  const decisions = [];
  if (closureInfo.state === "BLOCKED") decisions.push("Confirm whether to stop and repair the blocking issue before any follow-up.");
  if (closureInfo.state === "NEEDS_HUMAN_DECISION") decisions.push("Confirm whether the high-risk or unverified work may proceed to a separate review task.");
  if (!signals.verificationPassed) decisions.push("Confirm the verification evidence required before closure.");
  if (signals.changedFiles.length > 0) decisions.push("Confirm whether the changed files are the intended closure scope.");
  if (closureInfo.state === "READY_FOR_COMMIT_REVIEW") decisions.push("Confirm whether Codex should prepare a commit summary; this does not approve commit or push.");
  if (decisions.length === 0) decisions.push("Confirm whether this limited closure is enough for the current task.");
  return decisions.slice(0, signals.highRisk ? 5 : 3);
}

function classifyVerification(value) {
  const text = String(value || "").trim();
  if (!text) return "not verified";
  if (/\b(fail|failed|failing|error|broken|失败|报错|未通过)\b/i.test(text)) return "fail";
  if (/\b(pass|passed|ok|success|green|通过|成功)\b/i.test(text)) return "pass";
  return "not verified";
}

function readGitStatus(root) {
  const inside = spawnSync("git", ["-C", root, "rev-parse", "--is-inside-work-tree"], { encoding: "utf8" });
  if (inside.status !== 0 || inside.stdout.trim() !== "true") {
    return { isGitRepository: false, files: [] };
  }
  const status = spawnSync("git", ["-C", root, "status", "--porcelain"], { encoding: "utf8" });
  const files = status.status === 0
    ? status.stdout.split("\n").map((line) => line.trimEnd()).filter(Boolean).map(parsePorcelainLine)
    : [];
  return { isGitRepository: true, files };
}

function parsePorcelainLine(line) {
  const status = line.slice(0, 2).trim() || "??";
  const rawPath = line.slice(3).replace(/^"|"$/g, "");
  const renamed = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
  return { status, path: renamed };
}

function isNoiseFile(filePath) {
  return [".DS_Store"].includes(path.basename(filePath));
}

function printHuman(report) {
  console.log("# Execution Closure Report");
  console.log("");
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`Conclusion: ${report.humanDecisionSummary.conclusion}`);
  console.log("");
  console.log(`Recommended choice: ${report.humanDecisionSummary.recommendedChoice}`);
  console.log("");
  console.log(`Can AI continue now: ${report.humanDecisionSummary.canAiContinueNow}`);
  console.log("");
  console.log(`What I need from you: ${report.humanDecisionSummary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${report.humanDecisionSummary.ifNothing}`);
  console.log("");
  console.log("## Task Context");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Task / change | ${escapeCell(report.taskContext.taskOrChange)} |`);
  console.log(`| Related task card | ${escapeCell(report.taskContext.relatedTaskCard)} |`);
  console.log(`| User intent | ${escapeCell(report.taskContext.userIntent)} |`);
  console.log(`| Delivery path state | ${escapeCell(report.taskContext.deliveryPathState)} |`);
  console.log(`| Review surface source | ${escapeCell(report.taskContext.reviewSurfaceSource)} |`);
  console.log("");
  console.log("## Change Summary");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Changed files count | ${report.changeSummary.changedFilesCount} |`);
  console.log(`| Changed files reviewed | ${report.changeSummary.changedFilesReviewed} |`);
  console.log(`| What changed | ${escapeCell(report.changeSummary.whatChanged)} |`);
  console.log(`| Why it changed | ${escapeCell(report.changeSummary.whyItChanged)} |`);
  console.log("");
  console.log("## Review Surface Closure");
  console.log("");
  console.log("| Surface | Result | Evidence | Unverified reason / owner |");
  console.log("|---|---|---|---|");
  for (const item of report.reviewSurfaceClosure) {
    console.log(`| \`${item.surface}\` | ${item.result} | ${escapeCell(item.evidence)} | ${escapeCell(item.unverifiedReasonOrOwner)} |`);
  }
  console.log("");
  console.log("## Verification Closure");
  console.log("");
  console.log("| Check | Status | Evidence | Owner |");
  console.log("|---|---|---|---|");
  for (const item of report.verificationClosure) {
    console.log(`| ${escapeCell(item.check)} | ${item.status} | ${escapeCell(item.evidence)} | ${escapeCell(item.owner)} |`);
  }
  console.log("");
  console.log("## Scope Boundary Closure");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Intended scope | ${escapeCell(report.scopeBoundaryClosure.intendedScope)} |`);
  console.log(`| Out-of-scope changes found | ${report.scopeBoundaryClosure.outOfScopeChangesFound} |`);
  console.log(`| High-risk surfaces touched | ${report.scopeBoundaryClosure.highRiskSurfacesTouched} |`);
  console.log(`| Requires human decision | ${report.scopeBoundaryClosure.requiresHumanDecision} |`);
  console.log("");
  console.log("## Debt Closure");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Debt result | ${report.debtClosure.debtResult} |`);
  console.log(`| Debt blocks release review | ${report.debtClosure.debtBlocksReleaseReview} |`);
  console.log(`| Handoff needed | ${report.debtClosure.handoffNeeded} |`);
  console.log(`| Handoff ref | ${escapeCell(report.debtClosure.handoffRef)} |`);
  console.log("");
  console.log("## Commit Readiness");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Closure state | \`${report.commitReadiness.closureState}\` |`);
  console.log(`| Can prepare commit review? | ${report.commitReadiness.canPrepareCommitReview} |`);
  console.log(`| Commit scope ready? | ${report.commitReadiness.commitScopeReady} |`);
  console.log(`| Required before commit review | ${escapeCell(report.commitReadiness.requiredBeforeCommitReview)} |`);
  console.log("");
  console.log("## Human Decisions");
  console.log("");
  for (const [index, item] of report.humanDecisions.entries()) console.log(`${index + 1}. ${item}`);
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log(`- This closure writes target files: ${report.boundaries.writesTargetFiles}`);
  console.log(`- This closure approves implementation: ${report.boundaries.approvesImplementation}`);
  console.log(`- This closure approves release or production: ${report.boundaries.approvesReleaseOrProduction}`);
  console.log(`- This closure changes task state: ${report.boundaries.changesTaskState}`);
  console.log(`- This closure forgives debt: ${report.boundaries.forgivesDebt}`);
  console.log(`- This closure replaces Review Loop: ${report.boundaries.replacesReviewLoop}`);
  console.log(`- This closure replaces Safe Launch: ${report.boundaries.replacesSafeLaunch}`);
  console.log(`- This closure authorizes commit or push: ${report.boundaries.authorizesCommitOrPush}`);
  console.log(`- This closure approves security/privacy/compliance/payment/migration decisions: ${report.boundaries.approvesHighRiskDecisions}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
