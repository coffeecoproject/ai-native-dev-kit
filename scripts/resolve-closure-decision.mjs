#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import { resolveRuntimeTrustBinding } from "./lib/verification-runtime-consumer.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set([
  "json",
  "format",
  "intent",
  "intent-digest",
  "task",
  "verification",
  "impact-report",
  "execution-closure",
  "guided-closure",
  "human-decision",
  "runtime-manifest",
]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const intent = String(args.intent || args._[1] || "").trim();
const intentDigest = String(args["intent-digest"] || "").trim();
const task = String(args.task || "").trim();
const verification = String(args.verification || "").trim();
const refs = {
  impactReport: stringArg("impact-report"),
  executionClosure: stringArg("execution-closure"),
  guidedClosure: stringArg("guided-closure"),
  humanDecision: stringArg("human-decision"),
  runtimeManifest: stringArg("runtime-manifest"),
};

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const decision = buildClosureDecision(projectRoot, { intent, intentDigest, task, verification, refs });

if (outputFormat === "json") console.log(JSON.stringify(decision, null, 2));
else printHuman(decision);

function buildClosureDecision(root, context) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : fallbackGit();
  const inputs = collectInputs(root, context, git);
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
      taskRef: context.task || "N/A",
      intentDigest: context.intentDigest || "N/A",
    },
    decisionInputs: inputs.map((item) => ({
      input: item.name,
      status: item.status,
      ref: item.ref || "N/A",
      finding: item.finding,
      required: item.required || "No",
      verified: item.verified || "N/A",
      checker: item.checker || "N/A",
      intentDigest: item.intentDigest || "N/A",
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
    inputVerification: inputVerification(inputs),
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

function collectInputs(root, context, git) {
  const taskScopeText = [
    context.intent,
    context.task,
    git.changedFilesSample.join("\n"),
  ].join("\n");
  const behaviorChange = /\b(rule|validation|api|backend|frontend|contract|schema|permission|copy|error|flow|behavior)\b|规则|校验|限制|接口|前端|后端|文案|流程|权限/i.test(taskScopeText);
  const highRisk = /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance|production|release|secret|token|ci|workflow|hook)\b|登录|权限|支付|财务|税务|迁移|数据库|上线|发布|生产|密钥|合规|安全/i.test(taskScopeText);
  const verificationStatus = classifyVerification(context.verification);
  const executionClosures = markdownFiles(root, "execution-closures");
  const guidedClosures = markdownFiles(root, "guided-closure-cards");
  const requestedExecutionRef = resolveRef(root, context.refs.executionClosure);
  const candidateExecutionRef = requestedExecutionRef || latestRef(root, executionClosures);
  const guidedRef = resolveRef(root, context.refs.guidedClosure) || latestRef(root, guidedClosures);
  const humanRef = resolveRef(root, context.refs.humanDecision);
  const inspectedExecution = inspectExecutionClosure(root, candidateExecutionRef, context);
  const autoSelectedUnmatchedExecution = !requestedExecutionRef && candidateExecutionRef && inspectedExecution.taskMatches === false;
  const executionRef = autoSelectedUnmatchedExecution ? "" : candidateExecutionRef;
  const executionInput = autoSelectedUnmatchedExecution
    ? missingCurrentTaskExecutionClosure()
    : inspectedExecution;
  const linkedImpactRef = executionInput.linkedImpactRef || "";
  const requestedImpactRef = resolveRef(root, context.refs.impactReport);
  const impactSelectionConflict = Boolean(requestedImpactRef && linkedImpactRef && requestedImpactRef !== linkedImpactRef);
  const impactRef = requestedImpactRef || linkedImpactRef;
  const impactInput = inspectImpactCoverage(root, impactRef, context, executionInput, {
    required: behaviorChange,
    selectionConflict: impactSelectionConflict,
  });
  const humanInput = inspectHumanDecision(root, humanRef, {
    required: highRisk,
    reservedRefs: [executionRef, impactRef, guidedRef],
  });
  const runtimeTrust = resolveRuntimeTrustBinding(root, {
    manifestRef: context.refs.runtimeManifest,
    taskRef: context.task,
    intentDigest: context.intentDigest,
  });
  const runtimeInput = input(
    "Runtime Trust",
    runtimeTrust.ok ? "PASS" : "MISSING",
    runtimeTrust.binding.run_manifest_ref,
    runtimeTrust.binding.reason,
    {
      required: "Yes",
      verified: runtimeTrust.ok ? "Yes" : "No",
      checker: runtimeTrust.binding.checker,
      intentDigest: runtimeTrust.binding.intent_digest,
    },
  );

  return [
    input("Project path", fs.existsSync(root) ? "PASS" : "FAIL", root, fs.existsSync(root) ? "Project path is readable." : "Project path cannot be read."),
    input("Task intent", context.task && /^sha256:[a-f0-9]{64}$/i.test(context.intentDigest) ? "PASS" : "MISSING", context.task || "N/A", context.task && context.intentDigest ? "Canonical task reference and intent digest are present." : "Canonical task reference or intent digest is missing.", { required: "Yes", verified: context.task && context.intentDigest ? "Yes" : "No", checker: "work-queue-task-identity", intentDigest: context.intentDigest }),
    input("Verification", verificationStatus === "pass" ? "PASS" : verificationStatus === "fail" ? "FAIL" : "MISSING", context.verification || "N/A", verificationFinding(verificationStatus), { required: "Yes", verified: verificationStatus === "pass" ? "Yes" : "No", checker: "explicit-verification-summary" }),
    runtimeInput,
    input("Change Impact Coverage", impactInput.status, impactRef || "N/A", impactInput.finding, impactInput),
    input("Execution Closure", executionInput.status, executionRef || "N/A", executionInput.finding, executionInput),
    input("Guided Closure", guidedRef ? "PASS" : "OPTIONAL", guidedRef || "N/A", guidedRef ? "Guided user-facing close-out summary exists." : "Guided summary is optional after the unified decision.", { required: "No", verified: guidedRef ? "Yes" : "N/A", checker: guidedRef ? "project-local-ref" : "N/A" }),
    input("Human Decision", humanInput.status, humanRef || "N/A", humanInput.finding, humanInput),
    input("Git worktree", git.isGitRepository ? (git.isDirty ? "NEEDS_REVIEW" : "PASS") : "N/A", git.currentBranch || "N/A", git.isGitRepository ? `${git.changedFileCount} changed file(s) detected.` : "Not a Git worktree."),
  ];
}

function inspectExecutionClosure(root, ref, context) {
  if (!ref) {
    return {
      status: "MISSING",
      required: "Yes",
      verified: "No",
      checker: "check-execution-closure --report --require-impact-coverage --require-precise-evidence",
      finding: "Execution closure evidence is missing.",
      linkedImpactRef: "",
      taskMatches: false,
    };
  }
  const file = resolveProjectFile(root, ref);
  if (!file) {
    return {
      status: "FAIL",
      required: "Yes",
      verified: "No",
      checker: "project-local-ref",
      finding: "Execution closure reference is unsafe or cannot be read.",
      linkedImpactRef: "",
      taskMatches: false,
    };
  }

  const content = fs.readFileSync(file, "utf8");
  const taskMatches = matchesCurrentTask(context, [
    tableValue(content, "Task / change"),
    tableValue(content, "Related task card"),
    tableValue(content, "User intent"),
  ]);
  const linkedImpactRef = linkedEvidenceRef(root, file, content, "Change Impact Coverage Report");
  const check = runKitChecker(root, "check-execution-closure.mjs", [
    "--report",
    ref,
    "--require-impact-coverage",
    "--require-precise-evidence",
  ]);
  if (check.status !== 0) {
    return {
      status: "FAIL",
      required: "Yes",
      verified: "No",
      checker: "check-execution-closure --report --require-impact-coverage --require-precise-evidence",
      finding: `Execution closure failed strict validation: ${firstFailure(check)}.`,
      linkedImpactRef,
      taskMatches,
    };
  }
  if (!taskMatches) {
    return {
      status: "FAIL",
      required: "Yes",
      verified: "No",
      checker: "check-execution-closure + task-match",
      finding: "Execution closure does not match the current task or intent.",
      linkedImpactRef,
      taskMatches: false,
    };
  }
  return {
    status: "PASS",
    required: "Yes",
    verified: "Yes",
    checker: "check-execution-closure --report --require-impact-coverage --require-precise-evidence",
    finding: "Execution closure passes strict validation and matches the current task.",
    linkedImpactRef,
    taskMatches: true,
  };
}

function missingCurrentTaskExecutionClosure() {
  return {
    status: "MISSING",
    required: "Yes",
    verified: "No",
    checker: "check-execution-closure --report --require-impact-coverage --require-precise-evidence",
    finding: "No Execution Closure matching the current task is available; unrelated historical records were not used.",
    linkedImpactRef: "",
    taskMatches: false,
  };
}

function inspectImpactCoverage(root, ref, context, executionInput, options = {}) {
  const required = Boolean(options.required);
  if (options.selectionConflict) {
    return {
      status: "FAIL",
      required: required ? "Yes" : "No",
      verified: "No",
      checker: "execution-closure impact binding",
      finding: "Requested Change Impact Coverage does not match the Execution Closure evidence link.",
    };
  }
  if (!ref) {
    return {
      status: required ? "MISSING" : "N/A",
      required: required ? "Yes" : "No",
      verified: required ? "No" : "N/A",
      checker: required ? "check-change-impact-coverage --report --require-precise-evidence" : "N/A",
      finding: required ? "Behavior change detected without related-surface coverage." : "No cross-surface behavior signal detected.",
    };
  }
  const file = resolveProjectFile(root, ref);
  if (!file) {
    return {
      status: "FAIL",
      required: required ? "Yes" : "No",
      verified: "No",
      checker: "project-local-ref",
      finding: "Change Impact Coverage reference is unsafe or cannot be read.",
    };
  }
  const check = runKitChecker(root, "check-change-impact-coverage.mjs", [
    "--report",
    ref,
    "--require-structured-evidence",
    "--mode",
    "closure",
    "--strict-evidence",
    "--resolve-evidence-refs",
    "--require-precise-evidence",
  ]);
  if (check.status !== 0) {
    return {
      status: "FAIL",
      required: required ? "Yes" : "No",
      verified: "No",
      checker: "check-change-impact-coverage --report --require-precise-evidence",
      finding: `Change Impact Coverage failed strict validation: ${firstFailure(check)}.`,
    };
  }
  const content = fs.readFileSync(file, "utf8");
  const sourceMatches = matchesCurrentTask(context, [
    markdownListValue(content, "Task ref"),
    markdownListValue(content, "Request"),
    tableValue(content, "Task / change"),
  ]);
  if (!sourceMatches) {
    return {
      status: "FAIL",
      required: required ? "Yes" : "No",
      verified: "No",
      checker: "check-change-impact-coverage + task-match",
      finding: "Change Impact Coverage does not match the current task or intent.",
    };
  }
  if (executionInput.status === "PASS" && executionInput.linkedImpactRef && executionInput.linkedImpactRef !== ref) {
    return {
      status: "FAIL",
      required: required ? "Yes" : "No",
      verified: "No",
      checker: "execution-closure impact binding",
      finding: "Change Impact Coverage is not the exact report linked by the verified Execution Closure.",
    };
  }
  return {
    status: "PASS",
    required: required ? "Yes" : "No",
    verified: "Yes",
    checker: "check-change-impact-coverage --report --require-precise-evidence",
    finding: "Change Impact Coverage passes strict validation and matches the current task.",
  };
}

function inspectHumanDecision(root, ref, options = {}) {
  const required = Boolean(options.required);
  if (!required) {
    return {
      status: "N/A",
      required: "No",
      verified: "N/A",
      checker: "N/A",
      finding: "No high-risk decision signal detected.",
    };
  }
  if (!ref) {
    return {
      status: "MISSING",
      required: "Yes",
      verified: "No",
      checker: "distinct-project-local-human-decision",
      finding: "High-risk scope needs a distinct human decision record.",
    };
  }
  const file = resolveProjectFile(root, ref);
  if (!file || options.reservedRefs.includes(ref)) {
    return {
      status: "FAIL",
      required: "Yes",
      verified: "No",
      checker: "distinct-project-local-human-decision",
      finding: "Human decision evidence must be a distinct, project-local record.",
    };
  }
  const content = fs.readFileSync(file, "utf8").trim();
  if (content.length < 40 || !/(human|owner|decision|approve|confirm|确认|决定|负责人)/i.test(content)) {
    return {
      status: "FAIL",
      required: "Yes",
      verified: "No",
      checker: "distinct-project-local-human-decision",
      finding: "Human decision record is too weak to support a high-risk close-out.",
    };
  }
  return {
    status: "PASS",
    required: "Yes",
    verified: "Yes",
    checker: "distinct-project-local-human-decision",
    finding: "A distinct project-local human decision record is available.",
  };
}

function chooseDecision(inputs) {
  const byName = Object.fromEntries(inputs.map((item) => [item.name, item]));
  if (byName["Project path"]?.status === "FAIL") return makeDecision("BLOCKED", "The project path cannot be read.");
  if (byName.Verification?.status === "FAIL") return makeDecision("BLOCKED", "Verification appears to have failed.");
  if (byName["Runtime Trust"]?.status !== "PASS") return makeDecision("NEEDS_EVIDENCE", "Current-task runtime evidence is missing or invalid.");
  if (byName["Human Decision"]?.status === "FAIL") return makeDecision("NEEDS_HUMAN_DECISION", "Human decision evidence is not valid for this close-out.");
  if (byName["Human Decision"]?.status === "MISSING") return makeDecision("NEEDS_HUMAN_DECISION", "A high-risk boundary needs explicit human decision.");
  if (byName["Change Impact Coverage"]?.status === "FAIL") return makeDecision("NEEDS_IMPACT_COVERAGE", "Related-surface evidence failed validation or does not match this task.");
  if (byName["Change Impact Coverage"]?.status === "MISSING") return makeDecision("NEEDS_IMPACT_COVERAGE", "Related surfaces have not been checked.");
  if (byName.Verification?.status !== "PASS") return makeDecision("NEEDS_EVIDENCE", "Passing verification evidence is missing.");
  if (byName["Execution Closure"]?.status === "FAIL") return makeDecision("NEEDS_EVIDENCE", "Execution closure evidence failed strict validation or does not match this task.");
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
    NEEDS_EVIDENCE: byName["Runtime Trust"]?.status !== "PASS" ? "Runtime Trust" : byName.Verification?.status !== "PASS" ? "Verification" : "Execution Closure",
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
  const trace = inputs.map((item, index) => ({
    step: String(index + 1),
    input: item.name,
    status: item.status,
    effect: traceEffect(item, decisionValue, dominantReason),
  }));
  if (dominantReason.input === "Required inputs") {
    trace.push({
      step: String(trace.length + 1),
      input: "Required inputs",
      status: "PASS",
      effect: "Dominant reason: all required inputs passed verified close-out checks, so this task can count as done.",
    });
  }
  return trace;
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

function input(name, status, ref, finding, metadata = {}) {
  return {
    name,
    status,
    ref,
    finding,
    required: metadata.required || "No",
    verified: metadata.verified || "N/A",
    checker: metadata.checker || "N/A",
    intentDigest: metadata.intentDigest || "N/A",
  };
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
    .filter((item) => ["Change Impact Coverage", "Execution Closure", "Verification", "Runtime Trust", "Human Decision"].includes(item.name))
    .map((item) => ({
      evidence: item.name,
      status: item.status,
      ref: item.ref || "N/A",
      verified: item.verified || "N/A",
      checker: item.checker || "N/A",
    }));
}

function inputVerification(inputs) {
  return inputs
    .filter((item) => ["Change Impact Coverage", "Execution Closure", "Verification", "Runtime Trust", "Human Decision"].includes(item.name))
    .map((item) => ({
      input: item.name,
      required: item.required || "No",
      verified: item.verified || "N/A",
      ref: item.ref || "N/A",
      checker: item.checker || "N/A",
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
  if (missing.includes("Runtime Trust")) return "Nothing technical. Codex must complete the bounded verification run and evidence binding.";
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
  const full = resolveProjectFile(root, ref);
  return full ? path.relative(root, full).replaceAll(path.sep, "/") : "";
}

function resolveProjectFile(root, ref) {
  const normalized = String(ref || "").trim().replaceAll("\\", "/");
  if (!normalized || path.isAbsolute(normalized) || normalized.includes("\0") || normalized.split("/").some((part) => !part || part === "." || part === "..")) return null;
  const candidate = path.resolve(root, normalized);
  const relative = path.relative(root, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) return null;
  try {
    const realRoot = fs.realpathSync(root);
    const realFile = fs.realpathSync(candidate);
    const realRelative = path.relative(realRoot, realFile);
    if (realRelative.startsWith("..") || path.isAbsolute(realRelative)) return null;
  } catch {
    return null;
  }
  return candidate;
}

function linkedEvidenceRef(root, sourceFile, content, evidenceName) {
  const evidenceBody = sectionBody(content, "Evidence Links");
  for (const line of evidenceBody.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/`/g, ""));
    if (cells.length < 3 || cells[0].toLowerCase() !== evidenceName.toLowerCase()) continue;
    if (!/^(found|pass)$/i.test(cells[2])) return "";
    const ref = cells[1];
    const resolved = resolveProjectFile(root, ref)
      || resolveProjectFile(root, path.relative(root, path.resolve(path.dirname(sourceFile), ref)));
    return resolved ? path.relative(root, resolved).replaceAll(path.sep, "/") : "";
  }
  return "";
}

function matchesCurrentTask(context, sourceValues) {
  const currentValues = [context.task].map(normalizeComparable).filter(Boolean);
  const candidates = sourceValues.map(normalizeComparable).filter(Boolean);
  if (currentValues.length === 0) return false;
  if (candidates.length === 0) return false;
  return currentValues.some((current) => candidates.some((candidate) => current === candidate));
}

function textMatches(left, right) {
  if (left === right || left.includes(right) || right.includes(left)) return true;
  const leftTokens = meaningfulTokens(left);
  const rightTokens = meaningfulTokens(right);
  const overlap = leftTokens.filter((token) => rightTokens.includes(token));
  return overlap.length >= Math.min(2, leftTokens.length, rightTokens.length);
}

function meaningfulTokens(value) {
  return [...new Set(String(value || "").toLowerCase().match(/[a-z0-9_]{3,}|[\u4e00-\u9fff]{2,}/g) || [])];
}

function normalizeComparable(value) {
  return String(value || "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function markdownListValue(content, label) {
  const match = String(content || "").match(new RegExp(`^\\s*-\\s*${escapeRegExp(label)}\\s*:\\s*(.+)$`, "im"));
  return match ? match[1].trim() : "";
}

function tableValue(content, key) {
  const pattern = new RegExp(`\\|\\s*${escapeRegExp(key)}\\s*\\|\\s*([^|]+?)\\s*\\|`, "i");
  const match = String(content || "").match(pattern);
  return match ? match[1].trim().replace(/`/g, "") : "";
}

function sectionBody(content, section) {
  const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
  const match = String(content || "").match(pattern);
  if (!match) return "";
  const rest = String(content).slice(match.index + match[0].length);
  const next = rest.search(/^##\s+/m);
  return next === -1 ? rest : rest.slice(0, next);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function runKitChecker(root, script, flags) {
  return spawnSync(process.execPath, [path.join(scriptDir, script), root, ...flags], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16,
  });
}

function firstFailure(result) {
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  const failure = output.split(/\r?\n/).find((line) => /^FAIL\s+/i.test(line));
  return failure ? failure.replace(/^FAIL\s+/i, "") : "checker did not pass";
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
  console.log(`| Task ref | \`${report.closureDecision.taskRef}\` |`);
  console.log(`| Intent digest | \`${report.closureDecision.intentDigest}\` |`);
  console.log("");
  console.log("## Decision Inputs");
  console.log("");
  console.log("| Input | Status | Required | Verified | Ref | Checker | Finding |");
  console.log("|---|---|---|---|---|---|---|");
  for (const item of report.decisionInputs) {
    console.log(`| ${item.input} | \`${item.status}\` | ${item.required} | ${item.verified} | ${item.ref} | ${item.checker} | ${item.finding} |`);
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
  console.log("## Input Verification");
  console.log("");
  console.log("| Input | Required | Verified | Evidence ref | Checker |");
  console.log("|---|---|---|---|---|");
  for (const item of report.inputVerification) {
    console.log(`| ${item.input} | ${item.required} | ${item.verified} | ${item.ref} | ${item.checker} |`);
  }
  console.log("");
  console.log("## Evidence Map");
  console.log("");
  console.log("| Evidence | Status | Verified | Ref | Checker |");
  console.log("|---|---|---|---|");
  for (const item of report.evidenceMap) {
    console.log(`| ${item.evidence} | \`${item.status}\` | ${item.verified} | ${item.ref} | ${item.checker} |`);
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
