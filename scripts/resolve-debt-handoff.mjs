#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import { defaultIgnoredDirs, walkRelativePaths } from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "task"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || "").trim();
const task = String(args.task || "").trim();

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const report = buildReport(projectRoot, intent, task);

if (outputFormat === "json") console.log(JSON.stringify(report, null, 2));
else printHuman(report);

function buildReport(root, userIntent, taskRef) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : null;
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const signals = collectSignals(root, paths, userIntent, git);
  const debt = classifyDebt(signals);
  const decisions = decisionsFor(debt, signals);

  return {
    reportType: "DEBT_KNOWLEDGE_HANDOFF_REPORT",
    generatedBy: "scripts/resolve-debt-handoff.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    intent: userIntent || "Not provided",
    taskContext: {
      taskOrChange: taskRef || userIntent || "Not provided",
      relatedTaskCard: taskRef || "N/A",
      deliveryPathState: signals.deliveryPathState,
      reviewSurfaceDebtResult: signals.reviewSurfaceDebtResult,
    },
    humanDecisionSummary: {
      conclusion: `Debt level is ${debt.level}.`,
      recommendedChoice: debt.recommendedChoice,
      canAiContinueNow: debt.canAiContinueNow,
      needFromHuman: decisions.length > 0 ? decisions.join(" / ") : "No decision needed for read-only handoff reporting.",
      ifNothing: "No debt is forgiven. No files, task state, source of truth, release, or production behavior changes.",
    },
    debtRegister: [debt],
    knowledgeHandoff: {
      whatChanged: signals.changedFiles.length > 0 ? `Detected changed or relevant files: ${signals.changedFiles.slice(0, 8).join(", ")}` : "No changed files were detected by this read-only report.",
      whyItChanged: userIntent || "Not provided. Record the product or maintenance reason before treating this handoff as ready.",
      howToVerify: signals.hasTestScript ? "Run the project test/check script and record the result." : "Verification path is not confirmed; define a test, build, or manual check before closure.",
      whereToStartNextTime: signals.changedFiles[0] || "Start from the task card, review surface, or delivery path report.",
      doNotTouchWithoutApproval: signals.highRisk ? "Keep auth, permission, data, migration, payment, production, secrets, release, and CI/hook work inside the reviewed task boundary; exact external effects still need concrete consent." : "Do not expand into unrelated files, CI/hooks, release settings, source-of-truth docs, or high-risk surfaces.",
    },
    verificationNotes: [
      { check: "Changed files reviewed", status: signals.changedFiles.length > 0 ? "pass" : "not verified", evidence: signals.changedFiles.length > 0 ? "git status/file signals detected" : "no changed file evidence detected" },
      { check: "Verification path", status: signals.hasTestScript ? "pass" : "not verified", evidence: signals.hasTestScript ? "test/check script detected" : "no test/check script detected" },
      { check: "Release blocker check", status: debt.blocksReleaseReview === "Yes" ? "fail" : "pass", evidence: debt.blocksReleaseReview === "Yes" ? "D3/D4 debt blocks release review" : "no release-blocking debt classified" },
    ],
    filesToRevisit: filesToRevisit(signals, debt),
    humanDecisions: decisions,
    boundaries: {
      forgivesDebt: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      changesTaskState: "No",
      changesSourceOfTruth: "No",
      replacesReviewLoop: "No",
      replacesSafeLaunch: "No",
    },
    outcome: debt.outcome,
  };
}

function collectSignals(root, paths, userIntent, git) {
  const packageJson = readJsonIfExists(path.join(root, "package.json"));
  const scripts = packageJson?.scripts || {};
  const allText = `${paths.join("\n")}\n${JSON.stringify(packageJson || {})}\n${userIntent || ""}`;
  const changedFiles = git?.files?.map((item) => item.path).filter(Boolean) || [];
  const highRisk = /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance|production|release|secret|token)\b/i.test(allText);
  const releaseRisk = /\b(release|production|deploy|rollback|ci|workflow|launch)\b/i.test(allText);
  return {
    pathCount: paths.length,
    changedFiles,
    dirty: Boolean(git?.isDirty),
    highRisk,
    releaseRisk,
    hasTestScript: /\b(test|check|lint|typecheck|e2e)\b/i.test(Object.keys(scripts).join(" ")),
    deliveryPathState: "N/A",
    reviewSurfaceDebtResult: "not reviewed",
  };
}

function classifyDebt(signals) {
  if (signals.highRisk && signals.dirty) {
    return debt("D4_HIGH_RISK_DEBT", "High-risk surface has unfinished work.", "May affect security, privacy, data, payment, migration, release, or production.", "Yes", "Codex", "Codex splits and verifies a bounded remediation task; no technical user decision is required.", "Stop expansion and complete the Codex-owned remediation evidence.", "limited", "BLOCKED");
  }
  if (signals.releaseRisk && !signals.hasTestScript) {
    return debt("D3_RELEASE_BLOCKING_DEBT", "Release-related work lacks verified test/check path.", "Blocks release review until verification evidence exists.", "Yes", "Codex", "Codex adds and executes the verification path before release review.", "Keep release review blocked while Codex completes evidence.", "limited", "BLOCKED");
  }
  if (signals.dirty && signals.changedFiles.length > 5) {
    return debt("D2_MAINTENANCE_DEBT", "Several files changed and need a handoff trail.", "May affect maintainability if context is not recorded.", "No", "Codex", "Record handoff and revisit related files before expansion.", "Record handoff before expanding scope.", "limited", "HANDOFF_RECORDED");
  }
  if (signals.dirty || signals.changedFiles.length > 0) {
    return debt("D1_ACCEPTABLE_SMALL_DEBT", "Small follow-up or verification debt may remain.", "Does not block the next narrow task if recorded.", "No", "Codex", "Record and revisit when touching the same area.", "Continue only within the current approved scope.", "limited", "HANDOFF_RECORDED");
  }
  return debt("D0_NO_DEBT_FOUND", "No obvious debt detected by this read-only scan.", "No immediate impact detected.", "No", "Codex", "Record none.", "Continue with normal review and verification.", "yes", "HANDOFF_RECORDED");
}

function debt(level, description, impact, blocksReleaseReview, owner, nextHandling, recommendedChoice, canAiContinueNow, outcome) {
  return {
    debtId: "D-001",
    level,
    description,
    impact,
    blocksReleaseReview,
    owner,
    nextHandling,
    recommendedChoice,
    canAiContinueNow,
    outcome,
  };
}

function decisionsFor(debtItem, signals) {
  const decisions = [];
  if (debtItem.level === "D4_HIGH_RISK_DEBT") decisions.push("NO_USER_ACTION: Codex must split, review, and verify the high-risk remediation.");
  if (debtItem.level === "D3_RELEASE_BLOCKING_DEBT") decisions.push("NO_USER_ACTION: Codex keeps release review blocked until verification evidence exists.");
  if (!signals.hasTestScript) decisions.push("NO_USER_ACTION: Codex derives or adds the verification path for this area.");
  if (signals.changedFiles.length > 0) decisions.push("Confirm whether the listed files are the intended handoff scope.");
  if (decisions.length === 0) decisions.push("Confirm whether this handoff can be recorded as D0.");
  return decisions.slice(0, debtItem.level === "D4_HIGH_RISK_DEBT" ? 5 : 3);
}

function filesToRevisit(signals, debtItem) {
  const files = signals.changedFiles.slice(0, 8);
  if (files.length === 0) {
    return [{ fileOrArea: "N/A", why: "No changed files detected.", when: "Before related implementation." }];
  }
  return files.map((file) => ({
    fileOrArea: file,
    why: debtItem.level === "D0_NO_DEBT_FOUND" ? "context reference" : "handoff or debt context",
    when: debtItem.blocksReleaseReview === "Yes" ? "before release review" : "when touching this area again",
  }));
}

function printHuman(report) {
  console.log("# Debt & Knowledge Handoff Report");
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
  console.log(`| Delivery path state | ${escapeCell(report.taskContext.deliveryPathState)} |`);
  console.log(`| Review surface debt result | ${escapeCell(report.taskContext.reviewSurfaceDebtResult)} |`);
  console.log("");
  console.log("## Debt Register");
  console.log("");
  console.log("| Debt ID | Level | Description | Impact | Blocks release review? | Owner | Next handling |");
  console.log("|---|---|---|---|---|---|---|");
  for (const item of report.debtRegister) {
    console.log(`| ${item.debtId} | \`${item.level}\` | ${escapeCell(item.description)} | ${escapeCell(item.impact)} | ${item.blocksReleaseReview} | ${escapeCell(item.owner)} | ${escapeCell(item.nextHandling)} |`);
  }
  console.log("");
  console.log("## Knowledge Handoff");
  console.log("");
  console.log("### What Changed");
  console.log("");
  console.log(report.knowledgeHandoff.whatChanged);
  console.log("");
  console.log("### Why It Changed");
  console.log("");
  console.log(report.knowledgeHandoff.whyItChanged);
  console.log("");
  console.log("### How To Verify");
  console.log("");
  console.log(report.knowledgeHandoff.howToVerify);
  console.log("");
  console.log("### Where To Start Next Time");
  console.log("");
  console.log(report.knowledgeHandoff.whereToStartNextTime);
  console.log("");
  console.log("### Do Not Touch Without Approval");
  console.log("");
  console.log(report.knowledgeHandoff.doNotTouchWithoutApproval);
  console.log("");
  console.log("## Verification Notes");
  console.log("");
  console.log("| Check | Status | Evidence |");
  console.log("|---|---|---|");
  for (const item of report.verificationNotes) console.log(`| ${escapeCell(item.check)} | ${item.status} | ${escapeCell(item.evidence)} |`);
  console.log("");
  console.log("## Files To Revisit");
  console.log("");
  console.log("| File or area | Why | When |");
  console.log("|---|---|---|");
  for (const item of report.filesToRevisit) console.log(`| ${escapeCell(item.fileOrArea)} | ${escapeCell(item.why)} | ${escapeCell(item.when)} |`);
  console.log("");
  console.log("## Human Decisions");
  console.log("");
  for (const [index, item] of report.humanDecisions.entries()) console.log(`${index + 1}. ${item}`);
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log(`- This report forgives debt: ${report.boundaries.forgivesDebt}`);
  console.log(`- This report approves implementation: ${report.boundaries.approvesImplementation}`);
  console.log(`- This report approves release or production: ${report.boundaries.approvesReleaseOrProduction}`);
  console.log(`- This report changes task state: ${report.boundaries.changesTaskState}`);
  console.log(`- This report changes source of truth: ${report.boundaries.changesSourceOfTruth}`);
  console.log(`- This report replaces Review Loop: ${report.boundaries.replacesReviewLoop}`);
  console.log(`- This report replaces Safe Launch: ${report.boundaries.replacesSafeLaunch}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.debtRegister[0].outcome}\``);
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
