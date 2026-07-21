#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import { defaultIgnoredDirs, walkRelativePaths } from "./lib/project-signals.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "verification"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._[1] || "").trim();
const verification = String(args.verification || "").trim();

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const card = buildGuidedClosureCard(projectRoot, intent, verification);

if (outputFormat === "json") console.log(JSON.stringify(card, null, 2));
else printHuman(card);

function buildGuidedClosureCard(root, userIntent, verificationNote) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : {
    isGitRepository: false,
    isDirty: false,
    changedFileCount: 0,
    changedFilesSample: [],
  };
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const signals = collectSignals(root, exists, paths, git, userIntent, verificationNote);
  const internal = collectInternalSignals(root, userIntent, verificationNote, signals);
  const state = classifyClosureState(signals, internal);
  const decisions = humanDecisionsFor(state, signals, internal);
  const missing = missingItemsFor(state, signals, internal);
  const nextActions = nextActionsFor(state, signals, internal);

  return {
    reportType: "GUIDED_CLOSURE_CARD",
    generatedBy: "scripts/resolve-guided-closure.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanDecisionSummary: {
      conclusion: conclusionFor(state, signals, internal),
      recommendedNextStep: nextActions[0] || "Record the close-out result and keep the task limited to the evidence shown.",
      canAiContinueNow: canAiContinue(state, signals),
      needFromHuman: decisions.length > 0 ? decisions.join(" / ") : "No decision needed for this read-only close-out card.",
      ifNothing: "No files are changed. No task state, commit, push, release, production, CI, hook, or approval behavior is changed.",
    },
    plainCloseOutStatus: {
      closureState: state.name,
      canCountAsDone: state.canCountAsDone,
      plainReason: state.reason,
    },
    whatIChecked: whatIChecked(signals, internal),
    whatIsStillNeeded: missing,
    whatCodexCanDoNext: nextActions,
    whatNeedsHumanDecision: decisions.length > 0 ? decisions : ["NO_USER_ACTION: Codex owns the remaining technical close-out work."],
    technicalDetails: {
      intent: userIntent || "Not provided",
      changedFilesDetected: git.changedFileCount,
      impactCoverageReportsFound: internal.impactReportCount,
      executionClosureReportsFound: internal.closureReportCount,
      verificationProvided: verificationStatus(verificationNote) === "pass" ? "Yes" : "No",
      internalChecksSelected: internal.selectedChecks.map((item) => item.plainName).join(", ") || "Project existence and task context",
      workflowGuidanceStatus: internal.workflowGuidance.status,
      executionClosureStatus: internal.executionClosure.status,
      finalClosureAuthority: "UNIFIED_CLOSURE_DECISION",
    },
    boundaries: {
      writesTargetFiles: "No",
      authorizesApply: "No",
      approvesImplementation: "No",
      approvesCommitOrPush: "No",
      approvesReleaseOrProduction: "No",
      modifiesCiOrHooks: "No",
      changesTaskState: "No",
      forgivesDebt: "No",
      replacesReviewLoop: "No",
      replacesSafeLaunch: "No",
      approvesHighRiskDecisions: "No",
    },
    outcome: state.outcome,
  };
}

function collectSignals(root, exists, paths, git, userIntent, verificationNote) {
  const allText = [
    userIntent,
    git.changedFilesSample.join("\n"),
    paths.join("\n"),
  ].join("\n");
  return {
    exists,
    hasIntent: Boolean(userIntent),
    verification: verificationStatus(verificationNote),
    verificationNote,
    git,
    highRisk: /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance|production|release|secret|token|ci|workflow|hook)\b|登录|权限|支付|财务|税务|迁移|数据库|上线|发布|生产|密钥|合规|安全/i.test(allText),
    behaviorChange: /\b(rule|validation|api|backend|frontend|contract|schema|permission|copy|error|flow|behavior)\b|规则|校验|限制|接口|前端|后端|文案|流程|权限/i.test(allText),
    hasProjectFiles: paths.some((item) => /(^package\.json$|^src\/|^app\/|^pages\/|^docs\/|^README)/i.test(item)),
  };
}

function collectInternalSignals(root, userIntent, verificationNote, signals) {
  const impactReports = markdownFiles(root, "change-impact-coverage-reports");
  const closureReports = markdownFiles(root, "execution-closures");
  const selectedChecks = [
    { id: "workflow-guidance", plainName: "project path guidance" },
    { id: "execution-closure", plainName: "close-out readiness" },
  ];
  if (signals.behaviorChange || impactReports.length > 0) {
    selectedChecks.push({ id: "impact-coverage", plainName: "related surface coverage" });
  }
  if (signals.highRisk) {
    selectedChecks.push({ id: "human-decision-boundary", plainName: "risk decision boundary" });
  }

  const workflowGuidance = runJson("resolve-workflow-guidance.mjs", [
    root,
    "--deep",
    ...(userIntent ? ["--intent", userIntent] : []),
    "--json",
  ]);
  const executionClosure = runJson("resolve-execution-closure.mjs", [
    root,
    ...(userIntent ? ["--intent", userIntent] : []),
    ...(verificationNote ? ["--verification", verificationNote] : []),
    "--json",
  ]);

  return {
    selectedChecks,
    impactReportCount: impactReports.length,
    closureReportCount: closureReports.length,
    hasImpactReport: impactReports.length > 0,
    hasClosureReport: closureReports.length > 0,
    workflowGuidance,
    executionClosure,
  };
}

function classifyClosureState(signals, internal) {
  if (!signals.exists) {
    return state("BLOCKED", "No", "The project path cannot be read.", "BLOCKED");
  }
  if (!signals.hasIntent && !signals.git.isDirty && !signals.verificationNote && !internal.hasClosureReport) {
    return state("NO_TASK_TO_CLOSE", "No", "I could not identify a concrete task or execution result to close.", "NEEDS_HUMAN_DECISION");
  }
  if (signals.verification === "fail") {
    return state("BLOCKED", "No", "Verification appears to have failed, so this should not be closed as done.", "BLOCKED");
  }
  if (signals.behaviorChange && !internal.hasImpactReport) {
    return state("NEEDS_IMPACT_COVERAGE", "No", "This looks like a behavior or rule change, so related surfaces still need to be checked.", "NEEDS_HUMAN_DECISION");
  }
  if (signals.highRisk) {
    return state("NEEDS_VERIFICATION", "No", "A high-risk area is involved, so Codex must complete stricter verification and independent review before closure.", "CLOSURE_GUIDANCE_RECORDED");
  }
  if (signals.verification !== "pass") {
    return state("NEEDS_VERIFICATION", "No", "The task has not shown passing verification evidence yet.", "NEEDS_HUMAN_DECISION");
  }
  if (signals.git.isDirty || signals.hasIntent || internal.hasClosureReport) {
    return state("READY_FOR_REVIEW", "No", "The task can move to review summary, but only Unified Closure can decide whether it counts as done.", "CLOSURE_GUIDANCE_RECORDED");
  }
  return state("CLOSE_WITH_LIMITATIONS", "No", "A limited summary can be recorded, but only Unified Closure can decide whether the task counts as done.", "CLOSURE_GUIDANCE_RECORDED");
}

function state(name, canCountAsDone, reason, outcome) {
  return { name, canCountAsDone, reason, outcome };
}

function verificationStatus(text) {
  const value = String(text || "");
  if (!value.trim()) return "missing";
  if (/\b(fail|failed|error|crash|broken|not pass)\b|失败|报错|未通过/i.test(value)) return "fail";
  if (/\b(pass|passed|ok|success|green|verified)\b|通过|成功|已验证/i.test(value)) return "pass";
  return "provided";
}

function whatIChecked(signals, internal) {
  return [
    {
      area: "Task intent",
      status: signals.hasIntent ? "PASS" : "NEEDS_REVIEW",
      finding: signals.hasIntent ? "A task intent was provided." : "No clear task intent was provided.",
      nextAction: signals.hasIntent ? "Keep closure tied to this task." : "Confirm which task is being closed.",
    },
    {
      area: "Changed files",
      status: signals.git.changedFileCount > 0 ? "NEEDS_REVIEW" : "SKIPPED",
      finding: signals.git.isGitRepository
        ? `${signals.git.changedFileCount} changed file(s) detected.`
        : "This path is not a Git worktree.",
      nextAction: signals.git.changedFileCount > 0
        ? "Review changed scope before commit review."
        : "Use task and evidence records if work happened elsewhere.",
    },
    {
      area: "Verification",
      status: signals.verification === "pass" ? "PASS" : signals.verification === "fail" ? "FAIL" : "NEEDS_REVIEW",
      finding: signals.verification === "pass"
        ? "Verification evidence was provided."
        : signals.verification === "fail"
          ? "Verification appears to have failed."
          : "Passing verification evidence is missing.",
      nextAction: signals.verification === "pass" ? "Keep the verification evidence with the close-out." : "Run or record verification.",
    },
    {
      area: "Related surfaces",
      status: signals.behaviorChange && !internal.hasImpactReport ? "NEEDS_REVIEW" : "PASS",
      finding: internal.hasImpactReport
        ? `${internal.impactReportCount} related-surface report(s) found.`
        : signals.behaviorChange
          ? "This may affect more than one layer."
          : "No cross-surface behavior signal was detected in this read-only pass.",
      nextAction: signals.behaviorChange && !internal.hasImpactReport
        ? "Prepare a related-surface coverage report before marking done."
        : "Keep closure scope limited to the checked surfaces.",
    },
    {
      area: "Evidence freshness",
      status: internal.hasClosureReport ? "NEEDS_REVIEW" : "SKIPPED",
      finding: internal.hasClosureReport
        ? `${internal.closureReportCount} close-out report(s) found.`
        : "No existing close-out report was found.",
      nextAction: internal.hasClosureReport
        ? "Make sure the close-out evidence belongs to this task."
        : "Create close-out evidence only after verification and coverage are clear.",
    },
  ];
}

function humanDecisionsFor(stateValue, signals) {
  const decisions = [];
  if (stateValue.name === "NO_TASK_TO_CLOSE") {
    decisions.push("BUSINESS_FACT_NEEDED: describe the business outcome or task that should be assessed.");
  }
  return decisions;
}

function missingItemsFor(stateValue, signals, internal) {
  const missing = [];
  if (!signals.hasIntent) missing.push("A clear task intent or task reference.");
  if (signals.verification !== "pass") missing.push("Passing verification evidence.");
  if (signals.behaviorChange && !internal.hasImpactReport) missing.push("Related-surface coverage for the changed behavior.");
  if (signals.highRisk) missing.push("Stricter Codex-owned verification and independent review for the high-risk surface.");
  if (missing.length === 0) missing.push("Nothing obvious from this read-only pass; keep review and release approval separate.");
  return missing;
}

function nextActionsFor(stateValue, signals) {
  if (stateValue.name === "BLOCKED") return ["Stop closure and fix the blocking issue first."];
  if (stateValue.name === "NO_TASK_TO_CLOSE") return ["Ask only for the missing business goal, then derive the canonical task identity."];
  if (stateValue.name === "NEEDS_VERIFICATION") return ["Codex runs or records the required verification before marking this task done."];
  if (stateValue.name === "NEEDS_IMPACT_COVERAGE") return ["Codex prepares related-surface coverage, then closes the task against that evidence."];
  if (stateValue.name === "NEEDS_HUMAN_DECISION") return ["Request only a classified business fact, external fact, or exact real-world consent."];
  if (stateValue.name === "READY_FOR_REVIEW") return ["Codex prepares a review summary with changed scope, verification, remaining debt, and evidence links."];
  if (signals.git.isDirty) return ["Record a limited close-out and keep commit review separate."];
  return ["Record a limited close-out if this was a documentation or planning-only task."];
}

function conclusionFor(stateValue) {
  const prefix = {
    NO_TASK_TO_CLOSE: "I cannot close this yet.",
    NEEDS_VERIFICATION: "This should not be treated as done yet.",
    NEEDS_IMPACT_COVERAGE: "This may be incomplete across related surfaces.",
    NEEDS_HUMAN_DECISION: "This needs a classified business fact, external fact, or exact real-world consent before close-out continues.",
    READY_FOR_REVIEW: "This can move to review summary.",
    CLOSE_WITH_LIMITATIONS: "This can be closed only with explicit limitations.",
    BLOCKED: "Close-out is blocked.",
  }[stateValue.name] || "Close-out guidance recorded.";
  return `${prefix} ${stateValue.reason}`;
}

function canAiContinue(stateValue) {
  if (stateValue.name === "BLOCKED") return "no";
  if (stateValue.name === "NO_TASK_TO_CLOSE") return "limited";
  return "yes";
}

function runJson(script, commandArgs) {
  const result = spawnSync(process.execPath, [path.join(scriptDir, script), ...commandArgs], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return {
      status: "failed",
      error: result.stderr || result.stdout || "unknown error",
    };
  }
  try {
    return {
      status: "pass",
      data: JSON.parse(result.stdout),
    };
  } catch (error) {
    return {
      status: "failed",
      error: error.message,
    };
  }
}

function markdownFiles(root, dir) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base)) return [];
  const result = [];
  walk(base, result);
  return result.filter((file) => file.endsWith(".md"));
}

function walk(current, result) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) walk(full, result);
    else result.push(full);
  }
}

function printHuman(card) {
  console.log("# Guided Closure Card");
  console.log("");
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`Conclusion: ${card.humanDecisionSummary.conclusion}`);
  console.log("");
  console.log(`Recommended next step: ${card.humanDecisionSummary.recommendedNextStep}`);
  console.log("");
  console.log(`Can AI continue now: ${card.humanDecisionSummary.canAiContinueNow}`);
  console.log("");
  console.log(`What I need from you: ${card.humanDecisionSummary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${card.humanDecisionSummary.ifNothing}`);
  console.log("");
  console.log("## Plain Close-Out Status");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Closure state | \`${card.plainCloseOutStatus.closureState}\` |`);
  console.log(`| Can count as done | ${card.plainCloseOutStatus.canCountAsDone} |`);
  console.log(`| Plain reason | ${card.plainCloseOutStatus.plainReason} |`);
  console.log("");
  console.log("## What I Checked");
  console.log("");
  console.log("| Area | Status | Finding | Next action |");
  console.log("|---|---|---|---|");
  for (const item of card.whatIChecked) {
    console.log(`| ${item.area} | \`${item.status}\` | ${item.finding} | ${item.nextAction} |`);
  }
  console.log("");
  printNumbered("What Is Still Needed", card.whatIsStillNeeded);
  printNumbered("What Codex Can Do Next", card.whatCodexCanDoNext);
  printNumbered("What Needs Human Decision", card.whatNeedsHumanDecision);
  console.log("## Technical Details");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Intent | \`${card.technicalDetails.intent}\` |`);
  console.log(`| Changed files detected | \`${card.technicalDetails.changedFilesDetected}\` |`);
  console.log(`| Impact coverage reports found | \`${card.technicalDetails.impactCoverageReportsFound}\` |`);
  console.log(`| Execution closure reports found | \`${card.technicalDetails.executionClosureReportsFound}\` |`);
  console.log(`| Verification provided | \`${card.technicalDetails.verificationProvided}\` |`);
  console.log(`| Internal checks selected | ${card.technicalDetails.internalChecksSelected} |`);
  console.log(`| Workflow guidance status | \`${card.technicalDetails.workflowGuidanceStatus}\` |`);
  console.log(`| Execution closure status | \`${card.technicalDetails.executionClosureStatus}\` |`);
  console.log(`| Final closure authority | \`${card.technicalDetails.finalClosureAuthority}\` |`);
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log(`- This card writes target files: ${card.boundaries.writesTargetFiles}`);
  console.log(`- This card authorizes apply: ${card.boundaries.authorizesApply}`);
  console.log(`- This card approves implementation: ${card.boundaries.approvesImplementation}`);
  console.log(`- This card approves commit or push: ${card.boundaries.approvesCommitOrPush}`);
  console.log(`- This card approves release or production: ${card.boundaries.approvesReleaseOrProduction}`);
  console.log(`- This card modifies CI or hooks: ${card.boundaries.modifiesCiOrHooks}`);
  console.log(`- This card changes task state: ${card.boundaries.changesTaskState}`);
  console.log(`- This card forgives debt: ${card.boundaries.forgivesDebt}`);
  console.log(`- This card replaces Review Loop: ${card.boundaries.replacesReviewLoop}`);
  console.log(`- This card replaces Safe Launch: ${card.boundaries.replacesSafeLaunch}`);
  console.log(`- This card approves security/privacy/compliance/payment/migration decisions: ${card.boundaries.approvesHighRiskDecisions}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${card.outcome}\``);
}

function printNumbered(heading, items) {
  console.log(`## ${heading}`);
  console.log("");
  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`);
  });
  console.log("");
}
