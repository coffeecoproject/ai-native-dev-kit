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
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "task",
  "verification",
  "impact-report",
  "execution-closure",
  "guided-closure",
  "human-decision",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._[1] || "").trim();
const task = String(args.task || "").trim();
const verification = String(args.verification || "").trim();
const refs = {
  impactReport: stringArg("impact-report"),
  executionClosure: stringArg("execution-closure"),
  guidedClosure: stringArg("guided-closure"),
  humanDecision: stringArg("human-decision"),
};

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const decision = buildClosureDecision(projectRoot, { intent, task, verification, refs });

if (outputFormat === "json") console.log(JSON.stringify(decision, null, 2));
else printHuman(decision);

function buildClosureDecision(root, context) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : fallbackGit();
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 5,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const inputs = collectInputs(root, context, git, paths);
  const decision = chooseDecision(inputs);
  const dominantReason = dominantReasonFor(decision, inputs);
  const conflictSummary = summarizeConflicts(decision, inputs, dominantReason);
  const decisionTrace = buildDecisionTrace(inputs, decision, dominantReason);
  return {
    reportType: "UNIFIED_CLOSURE_DECISION",
    generatedBy: "scripts/resolve-closure-decision.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    humanSummary: {
      conclusion: humanConclusion(decision),
      recommendedNextStep: nextAction(decision),
      needFromHuman: needFromHuman(decision, inputs),
      ifNothing: "No files are changed. No task state, apply, commit, push, release, production, CI, hook, or approval behavior is changed.",
    },
    closureDecision: {
      decision: decision.name,
      canCountAsDone: decision.name === "DONE" ? "Yes" : "No",
      plainReason: decision.reason,
      finalClosureSource: "UNIFIED_CLOSURE_DECISION",
    },
    decisionInputs: inputs.map((item) => ({
      input: item.name,
      status: item.status,
      ref: item.ref || "N/A",
      finding: item.finding,
    })),
    decisionTrace,
    dominantReason,
    conflictSummary,
    singleSourceRule: {
      thisDecisionIsSingleClosureSource: "Yes",
      stricterResultWinsWhenInputsDisagree: "Yes",
    },
    requiredNextAction: requiredActions(decision, inputs),
    evidenceMap: evidenceMap(inputs),
    boundaries: {
      writesTargetFiles: "No",
      authorizesApply: "No",
      approvesImplementation: "No",
      approvesCommitOrPush: "No",
      approvesReleaseOrProduction: "No",
      modifiesCiOrHooks: "No",
      changesTaskState: "No",
      replacesReviewLoop: "No",
      replacesSafeLaunch: "No",
      approvesHighRiskDecisions: "No",
    },
    outcome: "CLOSURE_DECISION_RECORDED",
  };
}

function collectInputs(root, context, git, paths) {
  const allText = [
    context.intent,
    context.task,
    git.changedFilesSample.join("\n"),
    paths.join("\n"),
  ].join("\n");
  const behaviorChange = /\b(rule|validation|api|backend|frontend|contract|schema|permission|copy|error|flow|behavior)\b|规则|校验|限制|接口|前端|后端|文案|流程|权限/i.test(allText);
  const highRisk = /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance|production|release|secret|token|ci|workflow|hook)\b|登录|权限|支付|财务|税务|迁移|数据库|上线|发布|生产|密钥|合规|安全/i.test(allText);
  const verificationStatus = classifyVerification(context.verification);
  const impactReports = markdownFiles(root, "change-impact-coverage-reports");
  const executionClosures = markdownFiles(root, "execution-closures");
  const guidedClosures = markdownFiles(root, "guided-closure-cards");
  const impactRef = resolveRef(root, context.refs.impactReport) || latestRef(root, impactReports);
  const executionRef = resolveRef(root, context.refs.executionClosure) || latestRef(root, executionClosures);
  const guidedRef = resolveRef(root, context.refs.guidedClosure) || latestRef(root, guidedClosures);
  const humanRef = resolveRef(root, context.refs.humanDecision);

  return [
    input("Project path", fs.existsSync(root) ? "PASS" : "FAIL", root, fs.existsSync(root) ? "Project path is readable." : "Project path cannot be read."),
    input("Task intent", context.intent || context.task ? "PASS" : "MISSING", context.task || "N/A", context.intent || context.task ? "Task intent is present." : "Task intent is missing."),
    input("Verification", verificationStatus === "pass" ? "PASS" : verificationStatus === "fail" ? "FAIL" : "MISSING", context.verification || "N/A", verificationFinding(verificationStatus)),
    input("Change Impact Coverage", impactRef ? "PASS" : behaviorChange ? "MISSING" : "N/A", impactRef || "N/A", impactRef ? "Related surface coverage exists." : behaviorChange ? "Behavior change detected without related-surface coverage." : "No cross-surface behavior signal detected."),
    input("Execution Closure", executionRef ? "PASS" : "MISSING", executionRef || "N/A", executionRef ? "Execution closure evidence exists." : "Execution closure evidence is missing."),
    input("Guided Closure", guidedRef ? "PASS" : "OPTIONAL", guidedRef || "N/A", guidedRef ? "Guided user-facing close-out summary exists." : "Guided summary is optional after the unified decision."),
    input("Human Decision", humanRef ? "PASS" : highRisk ? "MISSING" : "N/A", humanRef || "N/A", humanRef ? "Human decision evidence exists." : highRisk ? "High-risk scope needs human decision." : "No high-risk decision signal detected."),
    input("Git worktree", git.isGitRepository ? (git.isDirty ? "NEEDS_REVIEW" : "PASS") : "N/A", git.currentBranch || "N/A", git.isGitRepository ? `${git.changedFileCount} changed file(s) detected.` : "Not a Git worktree."),
  ];
}

function chooseDecision(inputs) {
  const byName = Object.fromEntries(inputs.map((item) => [item.name, item]));
  if (byName["Project path"]?.status === "FAIL") return makeDecision("BLOCKED", "The project path cannot be read.");
  if (byName.Verification?.status === "FAIL") return makeDecision("BLOCKED", "Verification appears to have failed.");
  if (byName["Human Decision"]?.status === "MISSING") return makeDecision("NEEDS_HUMAN_DECISION", "A high-risk boundary needs explicit human decision.");
  if (byName["Change Impact Coverage"]?.status === "MISSING") return makeDecision("NEEDS_IMPACT_COVERAGE", "Related surfaces have not been checked.");
  if (byName.Verification?.status !== "PASS") return makeDecision("NEEDS_EVIDENCE", "Passing verification evidence is missing.");
  if (byName["Execution Closure"]?.status !== "PASS") return makeDecision("NEEDS_EVIDENCE", "Execution closure evidence is missing.");
  if (byName["Task intent"]?.status !== "PASS") return makeDecision("NOT_DONE", "No task intent is available to close.");
  return makeDecision("DONE", "Required close-out inputs are present for the current workflow scope.");
}

function makeDecision(name, reason) {
  return { name, reason };
}

function dominantReasonFor(decisionValue, inputs) {
  const byName = Object.fromEntries(inputs.map((item) => [item.name, item]));
  const dominantInputName = {
    BLOCKED: byName["Project path"]?.status === "FAIL" ? "Project path" : "Verification",
    NEEDS_HUMAN_DECISION: "Human Decision",
    NEEDS_IMPACT_COVERAGE: "Change Impact Coverage",
    NEEDS_EVIDENCE: byName.Verification?.status !== "PASS" ? "Verification" : "Execution Closure",
    NOT_DONE: "Task intent",
    DONE: "Required inputs",
  }[decisionValue.name] || "Unified Closure Decision";

  const dominantInput = byName[dominantInputName] || input("Required inputs", "PASS", "N/A", "Required close-out inputs are present.");
  return {
    input: dominantInput.name,
    status: dominantInput.status,
    result: decisionValue.name,
    whyThisDecides: whyDominant(decisionValue, dominantInput),
  };
}

function whyDominant(decisionValue, dominantInput) {
  if (decisionValue.name === "DONE") return "No stricter missing, failed, or human-decision input outranks completion.";
  if (decisionValue.name === "BLOCKED") return `${dominantInput.name} blocks close-out before any completion claim can be accepted.`;
  if (decisionValue.name === "NEEDS_HUMAN_DECISION") return "Human decision outranks implementation, verification, and evidence when high-risk scope is present.";
  if (decisionValue.name === "NEEDS_IMPACT_COVERAGE") return "Related-surface coverage outranks a completion claim when behavior or rule changes may affect more than one surface.";
  if (decisionValue.name === "NEEDS_EVIDENCE") return `${dominantInput.name} is required evidence before the task can count as done.`;
  if (decisionValue.name === "NOT_DONE") return "A task cannot be closed without a clear task intent.";
  return dominantInput.finding;
}

function summarizeConflicts(decisionValue, inputs, dominantReason) {
  const passingInputs = inputs.filter((item) => item.status === "PASS").map((item) => item.name);
  const stricterInputs = inputs
    .filter((item) => ["FAIL", "MISSING", "NEEDS_REVIEW"].includes(item.status))
    .map((item) => `${item.name}=${item.status}`);
  const hasConflict = passingInputs.length > 0 && stricterInputs.length > 0;
  const summary = hasConflict
    ? `Some inputs pass (${passingInputs.join(", ")}), but ${dominantReason.input} drives ${decisionValue.name}; stricter result wins.`
    : decisionValue.name === "DONE"
      ? "No lower-level conflict detected; required inputs support DONE."
      : `${dominantReason.input} drives ${decisionValue.name}; no passing input overrides that stricter result.`;
  return {
    inputsDisagree: hasConflict ? "Yes" : "No",
    stricterInput: dominantReason.input,
    summary,
  };
}

function buildDecisionTrace(inputs, decisionValue, dominantReason) {
  return inputs.map((item, index) => ({
    step: String(index + 1),
    input: item.name,
    status: item.status,
    effect: traceEffect(item, decisionValue, dominantReason),
  }));
}

function traceEffect(item, decisionValue, dominantReason) {
  if (item.name === dominantReason.input) {
    return `Dominant reason: this input sets final decision to ${decisionValue.name}.`;
  }
  if (["FAIL", "MISSING", "NEEDS_REVIEW"].includes(item.status)) {
    return `Stricter than done, but lower precedence than ${dominantReason.input}.`;
  }
  if (item.status === "PASS") return "Supports close-out but cannot override stricter inputs.";
  if (item.status === "OPTIONAL") return "Optional input; does not decide close-out.";
  return "No blocking signal for this decision.";
}

function input(name, status, ref, finding) {
  return { name, status, ref, finding };
}

function classifyVerification(value) {
  const text = String(value || "");
  if (!text.trim()) return "missing";
  if (/\b(fail|failed|error|crash|broken|not pass)\b|失败|报错|未通过/i.test(text)) return "fail";
  if (/\b(pass|passed|ok|success|green|verified)\b|通过|成功|已验证/i.test(text)) return "pass";
  return "provided";
}

function verificationFinding(status) {
  if (status === "pass") return "Passing verification was provided.";
  if (status === "fail") return "Verification appears to have failed.";
  if (status === "provided") return "Verification text was provided but does not clearly pass.";
  return "Passing verification is missing.";
}

function evidenceMap(inputs) {
  return inputs
    .filter((item) => ["Change Impact Coverage", "Execution Closure", "Verification", "Human Decision"].includes(item.name))
    .map((item) => ({
      evidence: item.name,
      status: item.status,
      ref: item.ref || "N/A",
    }));
}

function requiredActions(decisionValue, inputs) {
  if (decisionValue.name === "DONE") return ["Record the decision and keep commit, push, release, and production approval separate."];
  const missing = inputs.filter((item) => ["FAIL", "MISSING"].includes(item.status));
  if (missing.length === 0) return ["Review the closure decision before changing task state."];
  return missing.slice(0, 4).map((item) => `Resolve ${item.name}: ${item.finding}`);
}

function humanConclusion(decisionValue) {
  const prefix = {
    DONE: "This task can be treated as done for the current workflow scope.",
    NOT_DONE: "This task should not be treated as done yet.",
    NEEDS_EVIDENCE: "This task needs stronger evidence before close-out.",
    NEEDS_IMPACT_COVERAGE: "This task may be incomplete across related surfaces.",
    NEEDS_HUMAN_DECISION: "This task needs a human decision before close-out.",
    BLOCKED: "Close-out is blocked.",
  }[decisionValue.name] || "Closure decision recorded.";
  return `${prefix} ${decisionValue.reason}`;
}

function nextAction(decisionValue) {
  return {
    DONE: "Prepare a review summary if needed, but do not treat this as commit, push, release, or production approval.",
    NOT_DONE: "Confirm the task intent and continue only inside that scope.",
    NEEDS_EVIDENCE: "Record verification and execution closure evidence before marking done.",
    NEEDS_IMPACT_COVERAGE: "Prepare related-surface coverage and rerun close-out.",
    NEEDS_HUMAN_DECISION: "Ask for the specific human decision and record its scope.",
    BLOCKED: "Fix the blocker before attempting close-out again.",
  }[decisionValue.name] || "Keep the task limited to the recorded evidence.";
}

function needFromHuman(decisionValue, inputs) {
  if (decisionValue.name === "NEEDS_HUMAN_DECISION") return "Confirm the high-risk boundary and approval scope.";
  if (decisionValue.name === "NOT_DONE") return "Confirm which task is being closed.";
  const missing = inputs.filter((item) => item.status === "MISSING").map((item) => item.name);
  return missing.length > 0 ? `Confirm or provide: ${missing.join(", ")}.` : "No human decision is required by this read-only decision.";
}

function markdownFiles(root, dir) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return [];
  const files = [];
  walk(base, files);
  return files.filter((file) => file.endsWith(".md"));
}

function walk(current, files) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function latestRef(root, files) {
  if (files.length === 0) return "";
  const latest = files
    .map((file) => ({ file, mtime: fs.statSync(file).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0].file;
  return path.relative(root, latest).replaceAll(path.sep, "/");
}

function resolveRef(root, ref) {
  if (!ref) return "";
  const full = path.resolve(root, ref);
  if (!full.startsWith(root)) return "";
  return fs.existsSync(full) ? path.relative(root, full).replaceAll(path.sep, "/") : "";
}

function stringArg(name) {
  const value = args[name];
  return typeof value === "string" ? value.trim() : "";
}

function fallbackGit() {
  return {
    isGitRepository: false,
    isDirty: false,
    currentBranch: null,
    changedFileCount: 0,
    changedFilesSample: [],
  };
}

function printHuman(report) {
  console.log("# Unified Closure Decision");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  console.log(`Conclusion: ${report.humanSummary.conclusion}`);
  console.log("");
  console.log(`Recommended next step: ${report.humanSummary.recommendedNextStep}`);
  console.log("");
  console.log(`What I need from you: ${report.humanSummary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${report.humanSummary.ifNothing}`);
  console.log("");
  console.log("## Closure Decision");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Decision | \`${report.closureDecision.decision}\` |`);
  console.log(`| Can count as done | ${report.closureDecision.canCountAsDone} |`);
  console.log(`| Plain reason | ${report.closureDecision.plainReason} |`);
  console.log(`| Final closure source | \`${report.closureDecision.finalClosureSource}\` |`);
  console.log("");
  console.log("## Decision Inputs");
  console.log("");
  console.log("| Input | Status | Ref | Finding |");
  console.log("|---|---|---|---|");
  for (const item of report.decisionInputs) {
    console.log(`| ${item.input} | \`${item.status}\` | ${item.ref} | ${item.finding} |`);
  }
  console.log("");
  console.log("## Decision Trace");
  console.log("");
  console.log("| Step | Input | Status | Effect |");
  console.log("|---|---|---|---|");
  for (const item of report.decisionTrace) {
    console.log(`| ${item.step} | ${item.input} | \`${item.status}\` | ${item.effect} |`);
  }
  console.log("");
  console.log("## Dominant Reason");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Input | ${report.dominantReason.input} |`);
  console.log(`| Status | \`${report.dominantReason.status}\` |`);
  console.log(`| Result | \`${report.dominantReason.result}\` |`);
  console.log(`| Why this decides | ${report.dominantReason.whyThisDecides} |`);
  console.log("");
  console.log("## Conflict Summary");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Inputs disagree | ${report.conflictSummary.inputsDisagree} |`);
  console.log(`| Stricter input | ${report.conflictSummary.stricterInput} |`);
  console.log(`| Summary | ${report.conflictSummary.summary} |`);
  console.log("");
  console.log("## Single Source Rule");
  console.log("");
  console.log(`This decision is the single closure source for this task: ${report.singleSourceRule.thisDecisionIsSingleClosureSource}`);
  console.log("");
  console.log(`If lower-level close-out artifacts disagree, this decision uses the stricter result: ${report.singleSourceRule.stricterResultWinsWhenInputsDisagree}`);
  console.log("");
  console.log("## Required Next Action");
  console.log("");
  report.requiredNextAction.forEach((item, index) => console.log(`${index + 1}. ${item}`));
  console.log("");
  console.log("## Evidence Map");
  console.log("");
  console.log("| Evidence | Status | Ref |");
  console.log("|---|---|---|");
  for (const item of report.evidenceMap) {
    console.log(`| ${item.evidence} | \`${item.status}\` | ${item.ref} |`);
  }
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log(`- This decision writes target files: ${report.boundaries.writesTargetFiles}`);
  console.log(`- This decision authorizes apply: ${report.boundaries.authorizesApply}`);
  console.log(`- This decision approves implementation: ${report.boundaries.approvesImplementation}`);
  console.log(`- This decision approves commit or push: ${report.boundaries.approvesCommitOrPush}`);
  console.log(`- This decision approves release or production: ${report.boundaries.approvesReleaseOrProduction}`);
  console.log(`- This decision modifies CI or hooks: ${report.boundaries.modifiesCiOrHooks}`);
  console.log(`- This decision changes task state: ${report.boundaries.changesTaskState}`);
  console.log(`- This decision replaces Review Loop: ${report.boundaries.replacesReviewLoop}`);
  console.log(`- This decision replaces Safe Launch: ${report.boundaries.replacesSafeLaunch}`);
  console.log(`- This decision approves security/privacy/compliance/payment/migration decisions: ${report.boundaries.approvesHighRiskDecisions}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}
