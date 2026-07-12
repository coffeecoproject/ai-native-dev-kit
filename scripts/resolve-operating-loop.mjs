#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { projectIdentity } from "./lib/evidence-authority.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import { hasProjectSignals } from "./lib/project-signals.mjs";
import { buildSoloOperatingModel } from "./lib/solo-operating-model.mjs";

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
  "completion-evidence",
]);
const unknown = unknownOptions(args, knownFlags);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const kitRoot = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const intent = String(args.intent || args._.slice(1).join(" ") || "").trim();
const taskRef = String(args.task || "").trim();
const outputFormat = args.json ? "json" : String(args.format || "human");
const outputLanguage = /[\u3400-\u9fff]/.test(intent) ? "zh" : "en";

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

const state = buildOperatingState();

if (outputFormat === "json") console.log(JSON.stringify(state, null, 2));
else printHuman(state);

function buildOperatingState() {
  const workflowNext = runSource("WORKFLOW_NEXT", "scripts/workflow-next.mjs", [
    projectRoot,
    "--json",
  ]);
  const guidance = runSource("WORKFLOW_GUIDANCE", "scripts/resolve-workflow-guidance.mjs", [
    projectRoot,
    "--deep",
    "--mode",
    "plain",
    "--intent",
    intent,
    "--json",
  ]);
  const projectState = workflowNext.value?.projectState
    || guidance.value?.projectReading?.projectState
    || "UNKNOWN_PROJECT";
  const projectStateTags = Array.isArray(workflowNext.value?.projectStateTags)
    ? workflowNext.value.projectStateTags
    : [];
  const projectEntryOrigin = readProjectEntryOrigin(projectRoot);
  const projectEntry = projectEntryFor(projectState, projectRoot, projectStateTags, projectEntryOrigin);
  const operation = operationFor(intent, projectEntry);
  const sources = [workflowNext, guidance];

  if (intent) addOperationSources(sources, operation);

  const taskGovernance = sources.find((item) => item.name === "TASK_GOVERNANCE")?.value || null;
  const deliveryStatus = sources.find((item) => item.name === "USER_DELIVERY_CONSOLE")?.value || null;
  const closure = sources.find((item) => item.name === "UNIFIED_CLOSURE")?.value || null;
  const completionEvidence = sources.find((item) => item.name === "COMPLETION_EVIDENCE")?.value || null;
  const workQueue = sources.find((item) => item.name === "WORK_QUEUE")?.value || null;
  const release = sources.find((item) => item.name === "RELEASE_GUIDE")?.value || null;
  const adoption = sources.find((item) => item.name === "ADOPTION_AUTOPILOT")?.value || null;
  const currentGit = gitWorktreeState(projectRoot);
  const sourceFailure = sources.some((item) => item.readStatus === "FAILED") || currentGit.observationStatus === "FAILED";
  const dirtyWorktree = currentGit.isDirty
    || projectState === "DIRTY_WORKTREE_PROJECT"
    || projectStateTags.includes("DIRTY_WORKTREE_PROJECT");
  const taskImpact = taskGovernance?.impactClassification?.task_impact
    || taskGovernance?.structuredEvidence?.impact_classification?.task_impact
    || "NOT_APPLICABLE";
  const operatingState = operatingStateFor({
    operation,
    sourceFailure,
    dirtyWorktree,
    productionSensitive: projectEntry === "PRODUCTION_SENSITIVE_ENTRY",
    taskImpact,
    taskGovernance,
    closure,
    completionEvidence,
    workQueue,
    discussionOnly: operation === "DISCUSS_ONLY",
    resumeRequested: operation === "RESUME_TASK",
  });
  const evidenceTrace = buildEvidenceTrace(sources, operation, taskGovernance, deliveryStatus, closure, release, adoption);
  const sourceSystemTrace = sources.map(toSourceTrace);
  const projectIdentityProjection = buildProjectIdentityProjection({
    workflowNext,
    guidance,
    projectEntry,
    projectState,
    projectStateTags,
    sourceFailure,
    currentGit,
  });
  const operatingDecision = buildOperatingDecision({
    operation,
    operatingState,
    projectEntry,
    taskImpact,
    taskGovernance,
    closure,
    completionEvidence,
    workQueue,
    sourceFailure,
    dirtyWorktree,
    evidenceTrace,
    sourceSystemTrace,
    projectIdentityProjection,
    selectedProfiles: workflowNext.value?.selectedProfiles || [],
  });
  const decisionResponsibility = operatingDecision.decisionResponsibility;

  return {
    reportType: "INTENTOS_OPERATING_STATE",
    schemaVersion: "1.99.0",
    generatedBy: "scripts/resolve-operating-loop.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot,
    readOnly: true,
    intent: intent || "NOT_PROVIDED",
    taskRef: taskRef || "N/A",
    projectEntry: {
      state: projectEntry,
      sourceProjectState: projectState,
      sourceProjectStateTags: projectStateTags,
      projectEntryOrigin,
      entryIsLifecycleStage: "No",
      commonTaskLifecycleAfterEntry: "Yes",
    },
    projectIdentityProjection,
    operatingLoop: {
      operation,
      lifecyclePhase: lifecyclePhaseFor(operation),
      state: operatingState,
      taskImpact,
      projectBaselineControlsTaskImpact: "No",
      taskImpactMayRaiseProcessDepth: "Yes",
      stricterApplicableProjectRuleRequirement: "PRESERVE_WHEN_APPLICABLE",
      stricterApplicableProjectRuleVerifiedByThisView: "No",
    },
    operatingDecision,
    humanSummary: {
      conclusion: conclusionFor(operation, operatingState, projectEntry, outputLanguage),
      projectIdentity: projectIdentitySummaryFor(projectIdentityProjection, outputLanguage),
      currentState: plainStateFor(operatingState, outputLanguage),
      nextSafeAction: operatingDecision.plainAction,
      decisionNeeded: humanDecisionSummaryFor(operatingDecision, outputLanguage),
      userResponsibility: decisionResponsibility.publicPrompt,
      technicalDecisionRequiredFromUser: "No",
      internalCommandKnowledgeRequired: "No",
    },
    evidenceTrace,
    decisionResponsibility,
    sourceSystemTrace,
    boundaries: {
      derivedViewOnly: "Yes",
      writesTargetFiles: "No",
      changesTaskState: "No",
      authorizesImplementation: "No",
      requiresSeparateTechnicalApprovalAfterInternalGates: "No",
      authorizesApply: "No",
      approvesReleaseOrProduction: "No",
      changesProjectAuthority: "No",
      replacesSourceSystems: "No",
      provesProductCorrectness: "No",
    },
    outcome: operation === "FINISH_TASK" ? operatingState : sourceFailure ? "BLOCKED_BY_SOURCE_FAILURE" : operatingState,
  };
}

function addOperationSources(sources, operation) {
  if (["START_PROJECT", "CONTINUE_TASK"].includes(operation)) {
    sources.push(runSource("BEGINNER_ENTRY", "scripts/resolve-beginner-entry.mjs", [projectRoot, intent, "--json"]));
  }
  if (["CONTINUE_TASK", "CHECK_STATUS", "FINISH_TASK", "RESUME_TASK"].includes(operation)) {
    sources.push(runSource("TASK_GOVERNANCE", "scripts/resolve-task-governance.mjs", [projectRoot, "--intent", intent, "--json"]));
  }
  if (["CONTINUE_TASK", "CHECK_STATUS", "FINISH_TASK", "RESUME_TASK", "DISCUSS_ONLY"].includes(operation)) {
    sources.push(runSource("WORK_QUEUE", "scripts/resolve-work-queue.mjs", [projectRoot, "--json"]));
  }
  if (["CHECK_STATUS", "FINISH_TASK", "PREPARE_RELEASE"].includes(operation)) {
    sources.push(runSource("USER_DELIVERY_CONSOLE", "scripts/resolve-user-delivery-console.mjs", [projectRoot, "--intent", intent, "--json"]));
  }
  if (operation === "FINISH_TASK") {
    const currentQueueTask = sources.find((item) => item.name === "WORK_QUEUE")?.value?.currentTaskCandidates?.[0] || null;
    const effectiveTaskRef = taskRef || currentQueueTask?.taskRef || currentQueueTask?.taskId || "";
    const closureArgs = [projectRoot, "--intent", intent, "--json"];
    if (effectiveTaskRef) closureArgs.push("--task", effectiveTaskRef);
    if (currentQueueTask?.intentDigest) closureArgs.push("--intent-digest", currentQueueTask.intentDigest);
    for (const flag of ["verification", "impact-report", "execution-closure", "guided-closure", "human-decision"]) {
      if (args[flag]) closureArgs.push(`--${flag}`, String(args[flag]));
    }
    sources.push(runSource("UNIFIED_CLOSURE", "scripts/resolve-closure-decision.mjs", closureArgs));
    sources.push(runGateSource("WORK_QUEUE_CHECK", "scripts/check-work-queue.mjs", [
      projectRoot,
      "--json",
      "--require-report",
    ]));
    sources.push(runGateSource("TASK_GOVERNANCE_CHECK", "scripts/check-task-governance.mjs", [
      projectRoot,
      "--json",
      "--require-report",
      "--require-structured-evidence",
    ]));
    const impact = sources.find((item) => item.name === "TASK_GOVERNANCE")?.value
      ?.structuredEvidence?.impact_classification?.task_impact || "POSSIBLE_HIGH";
    const planReviewRequired = new Set(["MEDIUM", "HIGH"]).has(impact);
    if (planReviewRequired) {
      sources.push(runGateSource("PLAN_REVIEW_CHECK", "scripts/check-plan-review.mjs", [
        projectRoot,
        "--json",
        "--require-report",
        "--require-structured-evidence",
      ]));
    }
    const executionArgs = [
      projectRoot,
      "--json",
      "--require-structured-evidence",
      "--require-evidence-refs",
      "--require-review",
      "--require-actual-diff",
      "--require-precise-evidence",
      "--require-evidence-authority",
      "--require-task-governance",
      "--require-work-queue",
      "--strict-task-consumer",
    ];
    if (planReviewRequired) executionArgs.push("--require-plan-review");
    sources.push(runGateSource("EXECUTION_ASSURANCE_CHECK", "scripts/check-execution-assurance.mjs", executionArgs));
    const completionArgs = [
      projectRoot,
      "--json",
      "--require-report",
      "--require-structured-evidence",
      "--require-source-refs",
      "--require-ready",
      "--require-evidence-authority",
      "--require-task-governance",
      "--require-work-queue",
      "--strict-task-consumer",
    ];
    if (planReviewRequired) completionArgs.push("--require-plan-review");
    if (args["completion-evidence"]) completionArgs.push("--report", String(args["completion-evidence"]));
    sources.push(runGateSource("COMPLETION_EVIDENCE", "scripts/check-completion-evidence.mjs", completionArgs));
  }
  if (operation === "PREPARE_RELEASE") {
    sources.push(runSource("RELEASE_GUIDE", "scripts/resolve-release-guide.mjs", [projectRoot, "--intent", intent, "--json"]));
  }
  if (operation === "ADOPT_PROJECT") {
    sources.push(runSource("ADOPTION_AUTOPILOT", "scripts/resolve-existing-project-adoption-autopilot.mjs", [projectRoot, "--intent", intent, "--json"]));
    sources.push(runSource("NATIVE_MIGRATION", "scripts/resolve-native-migration.mjs", [projectRoot, "--intent", intent, "--json"]));
    sources.push(runSource("WORK_QUEUE_TAKEOVER", "scripts/resolve-work-queue-takeover.mjs", [projectRoot, "--intent", intent, "--json"]));
  }
}

function runSource(name, script, childArgs) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...childArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32,
  });
  if (result.status !== 0) {
    return {
      name,
      script,
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_SOURCE_FAILURE",
      ref: `generated:${script}`,
      semanticDigest: `sha256:${sha256(result.stderr || result.stdout || "source resolver failed")}`,
      value: null,
      error: firstUsefulLine(result.stderr || result.stdout || "source resolver failed"),
    };
  }
  try {
    const value = JSON.parse(result.stdout);
    const nestedFailures = name === "WORKFLOW_GUIDANCE"
      ? (value.deepOrchestration?.failures || [])
      : [];
    const semanticValue = { ...value };
    delete semanticValue.generatedAt;
    return {
      name,
      script,
      readStatus: nestedFailures.length > 0 ? "FAILED" : "CURRENT_RUN",
      outcome: nestedFailures.length > 0 ? "BLOCKED_BY_NESTED_SOURCE_FAILURE" : sourceOutcome(value),
      ref: sourceRef(value, script),
      semanticDigest: `sha256:${sha256(JSON.stringify(semanticValue))}`,
      value,
      error: nestedFailures.length > 0
        ? nestedFailures.map((item) => `${item.id}: ${item.reason}`).join("; ")
        : "",
    };
  } catch (error) {
    return {
      name,
      script,
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_INVALID_SOURCE",
      ref: `generated:${script}`,
      semanticDigest: `sha256:${sha256(result.stdout || error.message)}`,
      value: null,
      error: `invalid JSON: ${error.message}`,
    };
  }
}

function runGateSource(name, script, childArgs) {
  const result = spawnSync(process.execPath, [path.join(kitRoot, script), ...childArgs], {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 32,
  });
  try {
    const value = JSON.parse(result.stdout);
    return {
      name,
      script,
      readStatus: value.ok === true ? "CURRENT_RUN" : "FAILED",
      outcome: value.ok === true ? "PASS" : "FAIL",
      ref: args["completion-evidence"] ? `artifact:${String(args["completion-evidence"])}` : `generated:${script}`,
      semanticDigest: `sha256:${sha256(JSON.stringify(value))}`,
      value,
      error: value.ok === true ? "" : firstUsefulLine(value.checks?.find((item) => item.status === "FAIL")?.message || "gate failed"),
    };
  } catch (error) {
    return {
      name,
      script,
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_INVALID_SOURCE",
      ref: `generated:${script}`,
      semanticDigest: `sha256:${sha256(result.stderr || result.stdout || error.message)}`,
      value: null,
      error: firstUsefulLine(result.stderr || result.stdout || error.message),
    };
  }
}

function operationFor(value, projectEntry) {
  const text = String(value || "").toLowerCase();
  const existingEntry = ["EXISTING_PROJECT_ENTRY", "GOVERNED_PROJECT_ENTRY", "PRODUCTION_SENSITIVE_ENTRY"].includes(projectEntry);
  const negatedNewProject = /(?:不是|并非|不属于)新项目|\b(?:not|isn['’]?t)\s+(?:a\s+)?new project\b/.test(text);
  const explicitNewProject = !negatedNewProject && /新项目|从\s*0|从零|\bnew project\b|\bfrom scratch\b/.test(text);
  const implementationSignal = /(?:新增|增加|修改|调整|实现|开发|修复|重构|加入|添加)|\b(?:add|change|implement|build|fix|refactor|create)\b/.test(text);
  const releaseSignal = /(?:发布|上线|提交审核)|\b(?:release|deployment|deploy|publish)\b/.test(text);
  if (/(?:接入|采用|迁移到|切换到|整合|按照|按).{0,20}intentos|intentos.{0,20}(?:接入|采用|迁移|工作模式|工作)|\b(?:adopt|migrate|connect).{0,24}\bintentos\b|\bwork under intentos\b/.test(text)) return "ADOPT_PROJECT";
  const globalNoWrite = /\bdo not (?:implement|change|edit|write)(?:\s+(?:anything|any files?|code|the project))?\b|不要(?:实现|改代码|写代码|修改任何|改任何)/.test(text);
  const explicitReadOnlyDiscussion = /^\s*(?:\b(?:just|only)\s+(?:discuss|review|talk|look|read)\b|只(?:讨论|沟通|评审|看|查看|读)(?:一下)?(?:这个|这份|该|下)?(?:内容|方案|文件|结果)?|先(?:讨论|沟通|看|查看|读)(?:一下)?(?:这个|这份|该|下)?(?:内容|方案|文件|结果)?)/;
  if (globalNoWrite || (!implementationSignal && explicitReadOnlyDiscussion.test(text))) return "DISCUSS_ONLY";
  if (/\bresume\b|\bcontinue the paused\b|恢复.{0,12}(?:暂停|任务)|继续.{0,12}暂停/.test(text)) return "RESUME_TASK";
  if (/(?:任务|这个|这项|工作).{0,12}(?:做完|完成).{0,6}(?:吗|没有|了没|\?|？)|(?:能否|是否|可以).{0,12}(?:算|视为|认为)?(?:做完|完成|收口)|\b(?:is|can|has).{0,24}(?:done|finished|complete|close[ -]?out)\b/.test(text)) return "FINISH_TASK";
  if (implementationSignal && /(?:检查|查看).{0,12}(?:进度|状态)|\b(?:check|show|review).{0,24}\b(?:status|progress)\b/.test(text)) return "CONTINUE_TASK";
  if (/(?:查看|检查|告诉我|当前|现在|请问).{0,20}(?:进度|做到哪|完成情况|任务状态|项目状态)|(?:进度|任务状态|项目状态).{0,8}(?:如何|怎样|是什么|吗|\?|？)|\b(?:check|show|review|what is|where are we).{0,24}\b(?:status|progress)\b/.test(text)) return "CHECK_STATUS";
  if (/(?:现在|立即|立刻|直接|正式).{0,16}(?:发布|上线|部署|提交审核)|\b(?:now|immediately|directly)\b.{0,20}\b(?:release|deploy|publish|submit)\b/.test(text)) return "PREPARE_RELEASE";
  if (releaseSignal && /(?:当前|这个|本次|这一版|版本).{0,12}(?:发布|上线)|(?:发布|上线).{0,12}(?:当前|这个|本次|这一版|版本)|\b(?:release|publish)\s+(?:the\s+)?(?:current|this)\s+(?:version|build)\b/.test(text)) return "PREPARE_RELEASE";
  if (releaseSignal && implementationSignal) return "CONTINUE_TASK";
  if (/(?:准备|开始|执行|安排|帮我|我要|需要|可以|怎么|如何).{0,16}(?:发布|上线|提交审核)|(?:发布|上线).{0,12}(?:准备|计划|流程|执行|审核)|\b(?:prepare|start|perform|how to|ready for).{0,16}\b(?:release|deployment|publish)\b/.test(text)) return "PREPARE_RELEASE";
  const startSignal = explicitNewProject
    || /\bbuild.{0,40}from scratch\b|\bi want to build\b|\bstart this project\b|(?:我想|帮我|请).{0,8}(?:创建|搭建|开发|做一个).{0,24}(?:app|应用|网站|系统)(?:\s|$|[，。,.!?！？])/.test(text);
  if (startSignal) return existingEntry && !explicitNewProject ? "CONTINUE_TASK" : "START_PROJECT";
  if (projectEntry === "NEW_PROJECT_ENTRY") {
    return fs.existsSync(path.join(projectRoot, ".intentos", "version.json")) ? "CONTINUE_TASK" : "START_PROJECT";
  }
  return "CONTINUE_TASK";
}

function projectEntryFor(projectState, root, tags = [], projectEntryOrigin = "UNKNOWN_PROJECT_ORIGIN") {
  if (tags.includes("PRODUCTION_GOVERNED_PROJECT")) return "PRODUCTION_SENSITIVE_ENTRY";
  if (projectEntryOrigin === "NEW_PROJECT") return "NEW_PROJECT_ENTRY";
  if (projectEntryOrigin === "EXISTING_PROJECT") {
    if (tags.includes("GOVERNED_EXISTING_PROJECT")) return "GOVERNED_PROJECT_ENTRY";
    return "EXISTING_PROJECT_ENTRY";
  }
  if (tags.includes("GOVERNED_EXISTING_PROJECT")) return "GOVERNED_PROJECT_ENTRY";
  if (projectState === "NEW_PROJECT" && hasProjectSignals(root)) return "EXISTING_PROJECT_ENTRY";
  const mapping = {
    NEW_PROJECT: "NEW_PROJECT_ENTRY",
    BOOTSTRAPPED_PROJECT: "NEW_PROJECT_ENTRY",
    PARTIALLY_BOOTSTRAPPED_PROJECT: "EXISTING_PROJECT_ENTRY",
    EXISTING_PROJECT: "EXISTING_PROJECT_ENTRY",
    EXISTING_LIGHT_PROJECT: "EXISTING_PROJECT_ENTRY",
    EXISTING_GOVERNED_PROJECT: "GOVERNED_PROJECT_ENTRY",
    PRODUCTION_SENSITIVE_PROJECT: "PRODUCTION_SENSITIVE_ENTRY",
    DIRTY_WORKTREE_PROJECT: "EXISTING_PROJECT_ENTRY",
    INTENTOS_REPOSITORY: "INTENTOS_SOURCE_ENTRY",
  };
  return mapping[projectState] || "UNKNOWN_PROJECT_ENTRY";
}

function readProjectEntryOrigin(root) {
  const versionPath = path.join(root, ".intentos", "version.json");
  try {
    const stat = fs.lstatSync(versionPath);
    if (!stat.isFile() || stat.isSymbolicLink()) return "UNKNOWN_PROJECT_ORIGIN";
    const value = JSON.parse(fs.readFileSync(versionPath, "utf8"));
    return new Set(["NEW_PROJECT", "EXISTING_PROJECT"]).has(value.projectEntryOrigin)
      ? value.projectEntryOrigin
      : "UNKNOWN_PROJECT_ORIGIN";
  } catch {
    return "UNKNOWN_PROJECT_ORIGIN";
  }
}

function operatingStateFor(context) {
  if (!intent) return "NEEDS_GOAL";
  if (context.operation === "FINISH_TASK") {
    return context.closure?.closureDecision?.decision === "DONE"
      && context.completionEvidence?.ok === true
      && completionMatchesCurrentTask(context)
      ? "READY_TO_REPORT_DONE"
      : "NOT_DONE";
  }
  if (context.sourceFailure) return "BLOCKED_BY_SOURCE_FAILURE";
  if (context.dirtyWorktree && ["START_PROJECT", "CONTINUE_TASK"].includes(context.operation)) {
    return "NEEDS_CURRENT_WORK_REVIEW";
  }
  const queueState = workQueueStateFor(context);
  if (queueState === "AMBIGUOUS") return "BLOCKED_BY_WORK_QUEUE";
  if (queueState === "INTENT_MISMATCH") return "NEEDS_TASK_SWITCH_REVIEW";
  if (queueState === "MISSING_OR_MISMATCHED") return "NEEDS_WORK_QUEUE";
  if (context.discussionOnly) return "DISCUSSION_ONLY";
  if (context.resumeRequested) return "NEEDS_RESUME_REVIEW";
  if (context.operation === "START_PROJECT") return "READY_FOR_PROJECT_PLAN";
  if (context.operation === "CHECK_STATUS") return "STATUS_AVAILABLE";
  if (context.operation === "ADOPT_PROJECT") return "ADOPTION_REVIEW_ACTIVE";
  if (context.operation === "PREPARE_RELEASE") return "RELEASE_REVIEW_ONLY";
  const impact = context.taskImpact || "POSSIBLE_HIGH";
  const ready = context.taskGovernance?.readiness?.ready_for_implementation_review === "Yes";
  if (impact === "POSSIBLE_HIGH") return "NEEDS_READ_ONLY_RISK_REVIEW";
  if (!ready) return "NEEDS_GOVERNANCE_EVIDENCE";
  if (context.productionSensitive) return "READY_FOR_PROJECT_GOVERNED_WORK_REVIEW";
  return impact === "LOW" ? "READY_FOR_LIGHTWEIGHT_WORK_REVIEW" : "READY_FOR_IMPLEMENTATION_REVIEW";
}

function workQueueStateFor(context) {
  if (!new Set(["CONTINUE_TASK", "FINISH_TASK"]).has(context.operation)) return "NOT_REQUIRED";
  const queue = context.workQueue;
  if (!queue || queue.currentTaskCount !== 1) return queue?.currentTaskCount > 1 ? "AMBIGUOUS" : "MISSING_OR_MISMATCHED";
  if ((queue.queueInventory?.queueReportCount || 0) < 1) return "MISSING_OR_MISMATCHED";
  const current = Array.isArray(queue.currentTaskCandidates) ? queue.currentTaskCandidates[0] : null;
  if (taskRef && current?.taskRef !== taskRef && current?.source !== taskRef && current?.taskId !== taskRef) return "MISSING_OR_MISMATCHED";
  if (!taskRef && context.operation === "CONTINUE_TASK" && clearlyDifferentTaskIntent(intent, current)) return "INTENT_MISMATCH";
  return "READY";
}

function clearlyDifferentTaskIntent(currentIntent, currentTask) {
  const request = String(currentIntent || "").trim();
  const title = String(currentTask?.title || "").trim();
  if (!request || !title || /^(?:current\s+)?test\s+task$/i.test(title)) return false;
  if (/(?:继续|接着|完成当前|这个任务|刚才|恢复).{0,12}(?:任务|工作|处理)?|\b(?:continue|resume|finish)\b.{0,24}\b(?:current|this|previous)?\s*(?:task|work)?\b/i.test(request)) return false;
  const requestTerms = meaningfulIntentTerms(request);
  const taskTerms = meaningfulIntentTerms(`${title} ${currentTask?.taskRef || ""}`);
  if (requestTerms.size < 1 || taskTerms.size < 1) return false;
  return ![...requestTerms].some((term) => taskTerms.has(term));
}

function meaningfulIntentTerms(value) {
  const text = String(value || "").toLowerCase();
  const ignored = new Set([
    "app", "current", "task", "work", "change", "update", "modify", "fix", "add", "new",
    "当前", "任务", "工作", "处理", "继续", "接着", "完成", "修改", "新增", "增加", "功能", "问题", "项目", "开始", "进行",
  ]);
  const terms = new Set(
    (text.match(/[a-z0-9][a-z0-9_-]{2,}/g) || [])
      .map((term) => term.replace(/\.(?:md|json|js|ts|tsx|jsx)$/i, ""))
      .filter((term) => !ignored.has(term)),
  );
  for (const segment of text.match(/[\u3400-\u9fff]{2,}/g) || []) {
    for (let index = 0; index < segment.length - 1; index += 1) {
      const term = segment.slice(index, index + 2);
      if (!ignored.has(term)) terms.add(term);
    }
  }
  return terms;
}

function completionMatchesCurrentTask(context) {
  const reports = Array.isArray(context.completionEvidence?.reports) ? context.completionEvidence.reports : [];
  if (reports.length !== 1) return false;
  const current = Array.isArray(context.workQueue?.currentTaskCandidates)
    ? context.workQueue.currentTaskCandidates[0]
    : null;
  const expected = taskRef || current?.taskRef || current?.taskId || current?.source || "";
  if (!expected || reports[0].taskRef !== expected) return false;
  const closureTaskInput = (context.closure?.decisionInputs || []).find((item) => item.input === "Task intent") || {};
  if (closureTaskInput.ref !== expected) return false;
  const expectedIntentDigest = current?.intentDigest || "";
  if (!expectedIntentDigest || reports[0].intentDigest !== expectedIntentDigest || closureTaskInput.intentDigest !== expectedIntentDigest) return false;
  return reports[0].completionState === "COMPLETION_EVIDENCE_READY"
    && reports[0].canClaimComplete === "Yes";
}

function buildEvidenceTrace(sources, operation, taskGovernance, deliveryStatus, closure, release, adoption) {
  const nodes = sources.map((source) => ({
    id: source.name,
    ref: source.ref,
    readStatus: source.readStatus,
    outcome: source.outcome,
    relation: relationFor(source.name, operation),
    strictCheckerStatus: "NOT_EVALUATED_BY_OPERATING_VIEW",
    blocksCurrentOperation: source.readStatus === "FAILED" || source.outcome === "FAIL" ? "Yes" : "No",
  }));
  const dependencies = nodes.map((node) => ({
    from: node.id,
    to: "OPERATING_STATE",
    relation: "INPUT_TO_DERIVED_VIEW",
  }));
  const missing = unique([
    ...(taskGovernance?.readiness?.blocked_by || []),
    ...(deliveryStatus?.missingItems || []),
    ...(closure?.requiredNextAction || []),
    ...arrayValue(release?.humanDecisions),
    ...humanDecisionTexts(adoption?.humanDecisions),
  ]).filter((item) => !/^none|n\/a$/i.test(item));
  return {
    derivedOnly: "Yes",
    createsNewEvidenceArtifact: "No",
    aggregationTarget: "OPERATING_STATE",
    nodes,
    dependencies,
    missingOrBlocking: missing,
    freshnessMeaning: "CURRENT_RUN means the source was read now; it is not a strict checker pass.",
    invalidationConditions: [
      "project or Git revision changes",
      "task or intent changes",
      "referenced source digest changes or disappears",
      "target diff changes after review",
      "approval expires or authority changes",
      "release candidate or package identity changes",
    ],
  };
}

function lifecyclePhaseFor(operation) {
  const phases = {
    START_PROJECT: "PROJECT_ENTRY",
    ADOPT_PROJECT: "PROJECT_ENTRY",
    CONTINUE_TASK: "TASK_GOVERNANCE_AND_PLANNING",
    RESUME_TASK: "TASK_RESUME_REVIEW",
    DISCUSS_ONLY: "DISCUSSION_ONLY",
    CHECK_STATUS: "TASK_STATUS",
    FINISH_TASK: "TASK_CLOSURE",
    PREPARE_RELEASE: "RELEASE_PREPARATION",
  };
  return phases[operation];
}

function buildProjectIdentityProjection(context) {
  const workflow = context.workflowNext.value || {};
  const guidance = context.guidance.value || {};
  const evidenceIdentity = projectIdentity(projectRoot);
  const git = context.currentGit;
  const projectKind = projectKindForEntry(context.projectEntry);
  const governancePosture = governancePostureFor(context.projectEntry, context.projectStateTags, workflow.governanceSignals);
  const productionPosture = productionPostureFor(projectKind, governancePosture, context.projectStateTags, workflow.governanceSignals);
  const worktreePosture = git.observationStatus === "FAILED"
    ? "UNKNOWN"
    : git.isGitRepository ? (git.isDirty ? "DIRTY" : "CLEAN") : "NON_GIT";
  const conflicts = projectIdentityConflicts({
    projectKind,
    entryState: context.projectEntry,
    guidanceProjectState: guidance.projectReading?.projectState,
    governancePosture,
    productionPosture,
    evidenceIdentity,
    git,
    governanceSignals: workflow.governanceSignals,
  });
  const projectionStatus = context.sourceFailure
    ? "BLOCKED_BY_SOURCE_READ"
    : projectKind === "UNKNOWN_PROJECT" ? "UNKNOWN"
      : conflicts.length > 0 ? "CONFLICTED" : "CURRENT";
  const confidence = confidenceForProjection({
    projectionStatus,
    projectKind,
    governancePosture,
    platformBaselineState: workflow.platformBaselineState,
  });
  const sourceInputs = [
    ...[context.workflowNext, context.guidance].map(({ name, ref, outcome, readStatus, semanticDigest }) => ({
      sourceSystem: name,
      ref,
      outcome,
      readStatus,
      semanticDigest,
    })),
    {
      sourceSystem: "EVIDENCE_AUTHORITY",
      ref: "current:project-identity",
      outcome: evidenceIdentity.kind,
      readStatus: git.observationStatus === "FAILED" ? "FAILED" : "CURRENT_RUN",
      semanticDigest: `sha256:${sha256(JSON.stringify(evidenceIdentity))}`,
    },
    {
      sourceSystem: "LOCAL_GIT_STATE",
      ref: "current:project-worktree",
      outcome: worktreePosture,
      readStatus: "CURRENT_RUN",
      semanticDigest: `sha256:${sha256(JSON.stringify({
        isGitRepository: git.isGitRepository,
        isDirty: git.isDirty,
        changedFileCount: git.changedFileCount,
        changedFilesDigest: git.changedFilesDigest,
        observationStatus: git.observationStatus,
      }))}`,
    },
  ];
  const observedSignals = {
    governanceSignalCount: arrayValue(workflow.governanceSignals?.basicSignals).length,
    productionSignalCount: arrayValue(workflow.governanceSignals?.productionSignals).length,
    governanceRefs: arrayValue(workflow.governanceSignals?.basicSignals).sort().slice(0, 12),
    productionRefs: arrayValue(workflow.governanceSignals?.productionSignals).sort().slice(0, 12),
  };
  const intentosPosture = {
    workflowState: String(workflow.workflowState || "UNKNOWN"),
    versionState: String(workflow.versionState || "UNKNOWN"),
    operatingMode: String(workflow.intentosOperatingMode || (projectKind === "INTENTOS_SOURCE" ? "NOT_APPLICABLE" : "UNKNOWN")),
    adoptionMode: String(workflow.adoptionMode || "UNKNOWN"),
    assetMigrationDepth: String(workflow.projectAssetMigrationDepth || "UNKNOWN"),
  };
  const baselinePosture = {
    onboardingState: String(workflow.onboardingState || "UNKNOWN"),
    platformBaselineState: String(workflow.platformBaselineState || "UNKNOWN"),
    industrialBaselineState: String(workflow.industrialBaselineState || "UNKNOWN"),
    baselineLevel: String(workflow.baselineLevel || "NOT_SELECTED"),
    selectedProfiles: arrayValue(workflow.selectedProfiles).sort(),
    selectedIndustrialPacks: arrayValue(workflow.selectedIndustrialPacks).sort(),
  };
  const digestPayload = {
    contractVersion: "1.98.1",
    projectKind,
    entryState: context.projectEntry,
    governancePosture,
    productionPosture,
    worktreePosture,
    intentosPosture,
    baselinePosture,
    evidenceIdentity,
    observedSignals,
    projectionStatus,
    confidence,
    conflicts,
    sourceInputs,
  };
  return {
    contractVersion: "1.98.1",
    derivedOnly: "Yes",
    grantsAuthority: "No",
    writesProjectFiles: "No",
    projectKind,
    entryState: context.projectEntry,
    governancePosture,
    productionPosture,
    worktreePosture,
    intentosPosture,
    baselinePosture,
    evidenceIdentity,
    observedSignals,
    projectionStatus,
    confidence,
    conflicts,
    sourceInputs,
    projectionDigest: `sha256:${sha256(JSON.stringify(digestPayload))}`,
    invalidationConditions: [
      "project root or Git revision changes",
      "project entry or observed governance signals change",
      "worktree cleanliness changes",
      "selected platform or baseline state changes",
      "a source input digest changes or source read fails",
    ],
  };
}

function projectKindForEntry(entryState) {
  if (entryState === "NEW_PROJECT_ENTRY") return "NEW_PROJECT";
  if (["EXISTING_PROJECT_ENTRY", "GOVERNED_PROJECT_ENTRY", "PRODUCTION_SENSITIVE_ENTRY"].includes(entryState)) return "EXISTING_PROJECT";
  if (entryState === "INTENTOS_SOURCE_ENTRY") return "INTENTOS_SOURCE";
  return "UNKNOWN_PROJECT";
}

function projectKindForSourceState(state) {
  if (state === "NEW_PROJECT") return "NEW_PROJECT";
  if (state === "INTENTOS_REPOSITORY") return "INTENTOS_SOURCE";
  if ([
    "EXISTING_PROJECT",
    "EXISTING_LIGHT_PROJECT",
    "EXISTING_GOVERNED_PROJECT",
    "PRODUCTION_SENSITIVE_PROJECT",
    "DIRTY_WORKTREE_PROJECT",
    "BOOTSTRAPPED_PROJECT",
    "PARTIALLY_BOOTSTRAPPED_PROJECT",
  ].includes(state)) return "EXISTING_PROJECT";
  return "UNKNOWN_PROJECT";
}

function governancePostureFor(entryState, projectStateTags, signals) {
  if (entryState === "INTENTOS_SOURCE_ENTRY") return "INTENTOS_SOURCE_GOVERNANCE";
  if (entryState === "NEW_PROJECT_ENTRY") return "NOT_ESTABLISHED";
  if (projectStateTags.includes("PRODUCTION_GOVERNED_PROJECT") || signals?.isProductionGoverned) return "PRODUCTION_GOVERNED";
  if (projectStateTags.includes("GOVERNED_EXISTING_PROJECT") || signals?.isGovernedExisting) return "GOVERNED";
  if (["EXISTING_PROJECT_ENTRY", "GOVERNED_PROJECT_ENTRY", "PRODUCTION_SENSITIVE_ENTRY"].includes(entryState)) return "LIGHT_GOVERNANCE";
  return "UNKNOWN";
}

function productionPostureFor(projectKind, governancePosture, projectStateTags, signals) {
  if (projectKind === "INTENTOS_SOURCE") return "NOT_APPLICABLE";
  if (projectKind === "NEW_PROJECT") return "NOT_ESTABLISHED";
  if (governancePosture === "PRODUCTION_GOVERNED"
    || projectStateTags.includes("PRODUCTION_GOVERNED_PROJECT")
    || signals?.isProductionGoverned
    || arrayValue(signals?.productionSignals).length > 0) return "PRODUCTION_SENSITIVE";
  if (projectKind === "EXISTING_PROJECT") return "NO_PRODUCTION_EVIDENCE";
  return "UNKNOWN";
}

function projectIdentityConflicts(context) {
  const conflicts = [];
  const guidanceKind = projectKindForSourceState(String(context.guidanceProjectState || "UNKNOWN_PROJECT"));
  if (guidanceKind !== "UNKNOWN_PROJECT" && context.projectKind !== "UNKNOWN_PROJECT" && guidanceKind !== context.projectKind) {
    conflicts.push(`Workflow Guidance describes ${guidanceKind} while Project Entry describes ${context.projectKind}`);
  }
  if (context.projectKind === "NEW_PROJECT" && arrayValue(context.governanceSignals?.basicSignals).length > 0) {
    conflicts.push("New-project entry conflicts with observed project-owned governance signals");
  }
  const guidanceProduction = String(context.guidanceProjectState || "") === "PRODUCTION_SENSITIVE_PROJECT";
  const projectedProduction = context.productionPosture === "PRODUCTION_SENSITIVE";
  if (guidanceProduction !== projectedProduction && context.projectKind === "EXISTING_PROJECT") {
    conflicts.push(`Workflow Guidance production posture (${guidanceProduction ? "sensitive" : "not-sensitive"}) disagrees with observed project production posture (${context.productionPosture})`);
  }
  if (context.productionPosture === "PRODUCTION_SENSITIVE"
    && arrayValue(context.governanceSignals?.productionSignals).length === 0) {
    conflicts.push("Production-sensitive posture has no current production-signal reference");
  }
  if ((context.evidenceIdentity.kind === "GIT") !== Boolean(context.git.isGitRepository)) {
    conflicts.push("Evidence Authority and current Git observation disagree on repository kind");
  }
  return conflicts;
}

function confidenceForProjection(context) {
  if (context.projectionStatus !== "CURRENT" || context.projectKind === "UNKNOWN_PROJECT") return "LOW";
  if (context.governancePosture === "UNKNOWN") return "MEDIUM";
  if (!["BASELINE_READY", "NOT_APPLICABLE"].includes(context.platformBaselineState)
    && context.projectKind === "EXISTING_PROJECT") return "MEDIUM";
  return "HIGH";
}

function buildOperatingDecision(context) {
  const selected = selectOperatingAction(context);
  const sourceInputs = context.sourceSystemTrace.map(({ sourceSystem, ref, outcome, readStatus, semanticDigest }) => ({
    sourceSystem,
    ref,
    outcome,
    readStatus,
    semanticDigest,
  }));
  const blockedBy = decisionBlockers(context);
  const decisionResponsibility = buildSoloOperatingModel({
    intent,
    operation: context.operation,
    actionCode: selected.actionCode,
    sourceFailure: context.sourceFailure,
    language: outputLanguage,
    selectedProfiles: context.selectedProfiles,
  });
  const humanDecision = humanDecisionFor(selected.actionCode, decisionResponsibility);
  const digestPayload = {
    contractVersion: "1.99.0",
    intentDigest: sha256(intent),
    projectRootDigest: sha256(projectRoot),
    taskRef: taskRef || "N/A",
    projectEntry: context.projectEntry,
    projectIdentityProjectionDigest: context.projectIdentityProjection.projectionDigest,
    operation: context.operation,
    operatingState: context.operatingState,
    taskImpact: context.taskImpact,
    actionCode: selected.actionCode,
    actionClass: selected.actionClass,
    decisionStatus: selected.decisionStatus,
    reasonCode: selected.reasonCode,
    blockedBy,
    sourceInputs,
    responsibilityDigest: decisionResponsibility.responsibilityDigest,
  };
  return {
    contractVersion: "1.99.0",
    derivedOnly: "Yes",
    actionCode: selected.actionCode,
    actionClass: selected.actionClass,
    decisionStatus: selected.decisionStatus,
    reasonCode: selected.reasonCode,
    reason: reasonFor(selected.actionCode, blockedBy),
    blockedBy,
    sourceInputs,
    decisionResponsibility,
    requiresHumanDecisionNow: humanDecision.required ? "Yes" : "No",
    humanDecisionPrompt: humanDecision.prompt,
    canCodexContinueReadOnly: selected.canContinueReadOnly ? "Yes" : "No",
    materialActionAuthorized: "No",
    separateTechnicalApprovalRequired: "No",
    routineEngineeringMayProceedAfterInternalGates: decisionResponsibility.routineEngineeringMayProceedAfterInternalGates,
    plainAction: plainActionFor(selected.actionCode, outputLanguage),
    decisionDigest: `sha256:${sha256(JSON.stringify(digestPayload))}`,
    invalidationConditions: [...context.evidenceTrace.invalidationConditions],
  };
}

function selectOperatingAction(context) {
  if (context.operation === "FINISH_TASK") {
    return context.operatingState === "READY_TO_REPORT_DONE"
      ? action("REPORT_TASK_COMPLETE", "REPORTING", "READY_TO_REPORT", "CLOSURE_SUPPORTS_DONE", true)
      : action("COMPLETE_CLOSURE_EVIDENCE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "CLOSURE_EVIDENCE_INCOMPLETE", true);
  }
  if (context.sourceFailure) return action("REPAIR_SOURCE_READ", "BLOCKED_RECOVERY", "BLOCKED", "SOURCE_READ_FAILED", false);
  if (context.operatingState === "NEEDS_GOAL") return action("REQUEST_GOAL", "USER_INPUT", "NEEDS_USER_INPUT", "GOAL_REQUIRED", false);
  if (context.operatingState === "NEEDS_CURRENT_WORK_REVIEW") return action("REVIEW_CURRENT_WORK", "READ_ONLY_REVIEW", "NEEDS_USER_INPUT", "DIRTY_WORKTREE_REVIEW_REQUIRED", true);
  if (context.operatingState === "BLOCKED_BY_WORK_QUEUE") return action("REPAIR_WORK_QUEUE", "BLOCKED_RECOVERY", "BLOCKED", "MULTIPLE_CURRENT_TASKS", true);
  if (context.operatingState === "NEEDS_TASK_SWITCH_REVIEW") return action("REVIEW_TASK_SWITCH", "READ_ONLY_REVIEW", "NEEDS_USER_INPUT", "NEW_GOAL_DIFFERS_FROM_CURRENT_TASK", true);
  if (context.operatingState === "NEEDS_WORK_QUEUE") return action("PREPARE_WORK_QUEUE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "CURRENT_TASK_RECORD_REQUIRED", true);
  if (context.operatingState === "DISCUSSION_ONLY") return action("DISCUSS_WITHOUT_EXECUTION", "DISCUSSION", "READY_TO_DISCUSS", "DISCUSSION_ONLY_REQUESTED", true);
  if (context.operatingState === "NEEDS_RESUME_REVIEW") return action("REVIEW_PAUSED_TASK", "READ_ONLY_REVIEW", "NEEDS_USER_INPUT", "PAUSED_TASK_REVIEW_REQUIRED", true);
  if (context.operation === "START_PROJECT") return action("PREPARE_PROJECT_PLAN", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "PROJECT_PLAN_REQUIRED", true);
  if (context.operation === "ADOPT_PROJECT") return action("RUN_ADOPTION_REVIEW", "READ_ONLY_REVIEW", "READ_ONLY_ACTION_REQUIRED", "ADOPTION_REVIEW_REQUIRED", true);
  if (context.operation === "CHECK_STATUS") return action("SUMMARIZE_CURRENT_STATUS", "REPORTING", "READY_TO_REPORT", "STATUS_SUMMARY_REQUESTED", true);
  if (context.operation === "PREPARE_RELEASE") return action("PREPARE_RELEASE_REVIEW", "RELEASE_REVIEW_PREPARATION", "ACTION_REQUIRED", "RELEASE_REVIEW_REQUESTED", true);
  if (context.taskImpact === "POSSIBLE_HIGH") return action("INSPECT_TASK_RISK", "READ_ONLY_REVIEW", "READ_ONLY_ACTION_REQUIRED", "TASK_IMPACT_UNRESOLVED", true);

  const blockers = arrayValue(context.taskGovernance?.readiness?.blocked_by);
  if (blockers.length > 0) return actionForTaskBlocker(blockers);
  if (context.taskGovernance?.readiness?.ready_for_implementation_review === "Yes") {
    if (context.taskImpact === "LOW" && context.operatingState !== "READY_FOR_PROJECT_GOVERNED_WORK_REVIEW") {
      return action("PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW", "IMPLEMENTATION_REVIEW_PREPARATION", "READY_FOR_REVIEW_PREPARATION", "LOW_TASK_READY_FOR_REVIEW", true);
    }
    return action("PREPARE_IMPLEMENTATION_REVIEW", "IMPLEMENTATION_REVIEW_PREPARATION", "READY_FOR_REVIEW_PREPARATION", "TASK_READY_FOR_REVIEW", true);
  }
  return action("COMPLETE_TASK_GOVERNANCE_PREREQUISITES", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_UNRESOLVED", true);
}

function actionForTaskBlocker(blockers) {
  const joined = blockers.join("\n").toLowerCase();
  if (/adoption review/.test(joined)) return action("RESOLVE_ADOPTION_BLOCKER", "READ_ONLY_REVIEW", "READ_ONLY_ACTION_REQUIRED", "ADOPTION_BLOCKS_TASK_GOVERNANCE", true);
  if (/business rule/.test(joined)) return action("PREPARE_BUSINESS_RULE_CLOSURE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
  if (/affected-surface|surface map/.test(joined)) return action("PREPARE_CHANGE_IMPACT_COVERAGE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
  if (/execution plan/.test(joined)) return action("PREPARE_EXECUTION_PLAN", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
  if (/verification checklist|verification plan/.test(joined)) return action("PREPARE_VERIFICATION_PLAN", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
  return action("COMPLETE_TASK_GOVERNANCE_PREREQUISITES", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "TASK_GOVERNANCE_BLOCKED", true);
}

function action(actionCode, actionClass, decisionStatus, reasonCode, canContinueReadOnly) {
  return { actionCode, actionClass, decisionStatus, reasonCode, canContinueReadOnly };
}

function decisionBlockers(context) {
  if (context.sourceFailure) {
    return context.sourceSystemTrace
      .filter((source) => source.readStatus === "FAILED")
      .map((source) => `${source.sourceSystem}: ${source.error || "source read failed"}`);
  }
  if (context.operatingState === "NEEDS_CURRENT_WORK_REVIEW") return ["current worktree has uncommitted changes"];
  if (context.operatingState === "BLOCKED_BY_WORK_QUEUE") return ["Work Queue has more than one CURRENT task"];
  if (context.operatingState === "NEEDS_TASK_SWITCH_REVIEW") return ["the new goal does not match the single CURRENT task"];
  if (context.operatingState === "NEEDS_WORK_QUEUE") return ["one durable CURRENT Work Queue item matching this task is required"];
  if (context.operatingState === "NEEDS_RESUME_REVIEW") return ["paused task requires current-state, worktree, evidence, and resume review"];
  if (context.operation === "CONTINUE_TASK") return arrayValue(context.taskGovernance?.readiness?.blocked_by);
  if (context.operation === "FINISH_TASK" && context.operatingState !== "READY_TO_REPORT_DONE") {
    return arrayValue(context.closure?.requiredNextAction);
  }
  if (["ADOPT_PROJECT", "PREPARE_RELEASE"].includes(context.operation)) {
    return arrayValue(context.evidenceTrace.missingOrBlocking);
  }
  return [];
}

function humanDecisionFor(actionCode, responsibility) {
  const zh = outputLanguage === "zh";
  return {
    required: responsibility.userActionRequiredNow === "Yes",
    prompt: responsibility.publicPrompt || (zh ? "不需要你做技术判断。" : "No technical decision is required from you."),
  };
}

function humanDecisionSummaryFor(decision, language = "en") {
  if (decision.requiresHumanDecisionNow === "Yes") return decision.humanDecisionPrompt;
  return language === "zh"
    ? `不需要。${decision.humanDecisionPrompt}`
    : `No. ${decision.humanDecisionPrompt}`;
}

function reasonFor(actionCode, blockers) {
  const firstBlocker = blockers[0] || "no blocking source input";
  const values = {
    REPAIR_SOURCE_READ: `A required source failed: ${firstBlocker}.`,
    REQUEST_GOAL: "The Operating Model cannot select a safe route without a goal.",
    REVIEW_CURRENT_WORK: "The worktree contains uncommitted work that must be mapped before continuation.",
    REPAIR_WORK_QUEUE: `The Work Queue is ambiguous: ${firstBlocker}.`,
    REVIEW_TASK_SWITCH: `The requested goal appears different from the current task: ${firstBlocker}.`,
    PREPARE_WORK_QUEUE: `The Work Queue is not durably bound to the current task: ${firstBlocker}.`,
    DISCUSS_WITHOUT_EXECUTION: "The user explicitly requested discussion without implementation or project writes.",
    REVIEW_PAUSED_TASK: "Paused work requires a current-state, worktree, evidence, and human resume review.",
    PREPARE_PROJECT_PLAN: "The goal starts a project and requires a project plan and baseline recommendation.",
    RUN_ADOPTION_REVIEW: "The goal requests existing-project adoption, which starts with read-only review.",
    SUMMARIZE_CURRENT_STATUS: "The user requested current project or task status.",
    INSPECT_TASK_RISK: "Task Governance classified the task as POSSIBLE_HIGH and requires clarification.",
    RESOLVE_ADOPTION_BLOCKER: `Task Governance is blocked by adoption state: ${firstBlocker}.`,
    PREPARE_BUSINESS_RULE_CLOSURE: `Task Governance requires business-rule clarification: ${firstBlocker}.`,
    PREPARE_CHANGE_IMPACT_COVERAGE: `Task Governance requires an affected-surface map: ${firstBlocker}.`,
    PREPARE_EXECUTION_PLAN: `Task Governance requires a durable execution plan: ${firstBlocker}.`,
    PREPARE_VERIFICATION_PLAN: `Task Governance requires a verification plan: ${firstBlocker}.`,
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: `Task Governance is not ready: ${firstBlocker}.`,
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Task Governance classified the task as LOW and permits lightweight review preparation.",
    PREPARE_IMPLEMENTATION_REVIEW: "Task Governance prerequisites permit implementation-review preparation.",
    COMPLETE_CLOSURE_EVIDENCE: `Unified Closure does not support a done claim: ${firstBlocker}.`,
    REPORT_TASK_COMPLETE: "Unified Closure supports reporting the current task as done.",
    PREPARE_RELEASE_REVIEW: "The goal requests release preparation; release execution remains unauthorized.",
  };
  return values[actionCode] || `The safe next route is ${actionCode}.`;
}

function plainActionFor(actionCode, language = "en") {
  const zh = {
    REPAIR_SOURCE_READ: "Codex 先说明或修复来源读取失败，再继续。",
    REQUEST_GOAL: "告诉 Codex 你想做成什么。",
    REVIEW_CURRENT_WORK: "Codex 自动梳理现有未提交改动并绑定到正确任务，不需要你判断技术差异。",
    REPAIR_WORK_QUEUE: "Codex 先整理任务队列，只保留一个当前任务，再继续。",
    REVIEW_TASK_SWITCH: "Codex 先保留当前任务进度并整理任务切换建议，你只需确认先做哪一个。",
    PREPARE_WORK_QUEUE: "Codex 先建立唯一的当前任务记录，再继续任务治理或收口。",
    DISCUSS_WITHOUT_EXECUTION: "Codex 只沟通和分析，不进入实现、不修改项目。",
    REVIEW_PAUSED_TASK: "Codex 自动核对暂停任务的状态、改动和旧证据，安全时继续恢复。",
    PREPARE_PROJECT_PLAN: "Codex 自动准备项目方案、技术架构和完整基线，不要求你做技术选择。",
    RUN_ADOPTION_REVIEW: "Codex 自动读取并接入已有项目；需要写入时走内部受控计划，不要求你选择接入模式。",
    SUMMARIZE_CURRENT_STATUS: "Codex 汇总当前证据，并用白话说明已完成、未完成和下一步。",
    INSPECT_TASK_RISK: "Codex 先只读确认数据、状态、权限或接口影响，不直接改代码。",
    RESOLVE_ADOPTION_BLOCKER: "Codex 先解释并处理当前项目接入阻断，不改项目资产。",
    PREPARE_BUSINESS_RULE_CLOSURE: "Codex 先把业务规则、例外和完成条件梳理完整，再进入实现审查。",
    PREPARE_CHANGE_IMPACT_COVERAGE: "Codex 先补齐前端、后端、数据和运行面的影响范围，再进入实现审查。",
    PREPARE_EXECUTION_PLAN: "Codex 先准备完整执行计划，再进入实现审查。",
    PREPARE_VERIFICATION_PLAN: "Codex 先明确需要验证什么以及如何证明，再进入实现审查。",
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: "Codex 先补齐当前任务缺少的治理条件，再进入实现审查。",
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Codex 按低影响任务自动完成小范围实现、验证和复查。",
    PREPARE_IMPLEMENTATION_REVIEW: "Codex 按当前任务影响级别自动完成实现、验证和复查，不需要额外技术批准。",
    COMPLETE_CLOSURE_EVIDENCE: "Codex 先补齐缺失证据，再判断任务是否完成。",
    REPORT_TASK_COMPLETE: "Codex 可以生成任务完成说明，但这不代表发布或生产批准。",
    PREPARE_RELEASE_REVIEW: "Codex 自动准备发布、验证、备份和回滚材料；真正产生外部影响前再说明现实影响。",
  };
  const en = {
    REPAIR_SOURCE_READ: "Codex should explain or repair the failed source read before continuing.",
    REQUEST_GOAL: "Tell Codex what outcome you want.",
    REVIEW_CURRENT_WORK: "Codex should map current uncommitted work to the correct task without asking the user to judge technical differences.",
    REPAIR_WORK_QUEUE: "Codex should repair the queue so exactly one task remains current before continuing.",
    REVIEW_TASK_SWITCH: "Codex should preserve the current task and prepare a task-switch recommendation; the user only confirms which goal comes first.",
    PREPARE_WORK_QUEUE: "Codex should establish one durable current task record before task governance or close-out continues.",
    DISCUSS_WITHOUT_EXECUTION: "Codex should discuss and analyze only, without implementation or project writes.",
    REVIEW_PAUSED_TASK: "Codex should review current state, worktree, and prior evidence and resume safely when the evidence permits.",
    PREPARE_PROJECT_PLAN: "Codex should select the project plan, architecture, and complete technical baseline without asking the user to choose them.",
    RUN_ADOPTION_REVIEW: "Codex should read and connect the existing project automatically, using the internal controlled plan when writes are needed.",
    SUMMARIZE_CURRENT_STATUS: "Codex should summarize current evidence, completed work, missing work, and the next step.",
    INSPECT_TASK_RISK: "Codex should inspect possible data, state, permission, or API impact before changing code.",
    RESOLVE_ADOPTION_BLOCKER: "Codex should explain and resolve the adoption blocker without changing project assets.",
    PREPARE_BUSINESS_RULE_CLOSURE: "Codex should clarify business rules, exceptions, and completion conditions before implementation review.",
    PREPARE_CHANGE_IMPACT_COVERAGE: "Codex should map frontend, backend, data, and runtime impact before implementation review.",
    PREPARE_EXECUTION_PLAN: "Codex should prepare the complete execution plan before implementation review.",
    PREPARE_VERIFICATION_PLAN: "Codex should define what must be verified and how it will be proved before implementation review.",
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: "Codex should complete the missing task-governance prerequisites before implementation review.",
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Codex should complete the bounded implementation, verification, and review for this low-impact task.",
    PREPARE_IMPLEMENTATION_REVIEW: "Codex should complete implementation, verification, and review at the required depth without a separate technical approval.",
    COMPLETE_CLOSURE_EVIDENCE: "Codex should complete the missing evidence before deciding whether the task is done.",
    REPORT_TASK_COMPLETE: "Codex may report task completion, but this is not release or production approval.",
    PREPARE_RELEASE_REVIEW: "Codex should prepare release, verification, backup, and rollback evidence, then explain the real-world effect before external execution.",
  };
  return (language === "zh" ? zh : en)[actionCode] || actionCode;
}

function sha256(value) {
  return createHash("sha256").update(String(value || "")).digest("hex");
}

function sourceOutcome(value) {
  return String(
    value?.outcome
      || value?.closureDecision?.decision
      || value?.deliveryStatus?.currentState
      || value?.humanSummary?.adoptionState
      || value?.nextAction
      || value?.humanDecisionSummary?.conclusion
      || "READ_ONLY_RESULT",
  );
}

function sourceRef(value, script) {
  return String(
    value?.structuredEvidence?.task_governance_ref
      || value?.structuredEvidence?.adoption_autopilot_ref
      || value?.reportRef
      || `generated:${script}`,
  );
}

function toSourceTrace(source) {
  return {
    sourceSystem: source.name,
    ref: source.ref,
    readStatus: source.readStatus,
    outcome: source.outcome,
    error: source.error || "",
    semanticDigest: source.semanticDigest,
    authority: "SOURCE_SYSTEM_REMAINS_AUTHORITATIVE",
  };
}

function relationFor(name, operation) {
  if (name === "WORKFLOW_NEXT") return "PROJECT_ENTRY_STATE_INPUT";
  if (name === "WORKFLOW_GUIDANCE") return "PROJECT_AND_ROUTE_INPUT";
  if (name === "TASK_GOVERNANCE") return "TASK_IMPACT_INPUT";
  if (name === "USER_DELIVERY_CONSOLE") return "STATUS_INPUT";
  if (name === "UNIFIED_CLOSURE") return "CLOSURE_INPUT";
  if (name === "RELEASE_GUIDE") return "RELEASE_INPUT";
  if (name === "ADOPTION_AUTOPILOT") return "PROJECT_ENTRY_INPUT";
  return `${operation}_INPUT`;
}

function conclusionFor(operation, state, entry, language) {
  if (state === "NEEDS_GOAL") return language === "zh" ? "IntentOS 需要一个明确目标才能选择路径。" : "IntentOS needs one plain goal before choosing a route.";
  if (state === "BLOCKED_BY_SOURCE_FAILURE") return language === "zh" ? "IntentOS 无法安全读取必要来源，已经停止。" : "IntentOS could not safely read one required source and stopped.";
  if (language === "zh") return `${plainOperation(operation, language)}：${plainStateFor(state, language)}。`;
  return `${plainOperation(operation, language)} for ${plainEntry(entry)} is in state: ${plainStateFor(state, language)}.`;
}

function projectIdentitySummaryFor(projection, language = "en") {
  const dirtySuffix = projection.worktreePosture === "DIRTY"
    ? (language === "zh" ? "当前还有未提交改动。" : " The current worktree has uncommitted changes.")
    : "";
  if (language === "zh") {
    const values = {
      INTENTOS_SOURCE: "这是 IntentOS 源码仓库。",
      NEW_PROJECT: "这是一个新项目，工程治理尚未建立。",
      UNKNOWN_PROJECT: "当前项目身份还不能安全确定。",
    };
    if (values[projection.projectKind]) return `${values[projection.projectKind]}${dirtySuffix}`;
    if (projection.productionPosture === "PRODUCTION_SENSITIVE") {
      return `这是一个已有项目，已观察到生产相关治理；后续必须保留项目原有权威。${dirtySuffix}`;
    }
    if (projection.governancePosture === "GOVERNED") {
      return `这是一个已有项目，并且已经有自己的治理规则；IntentOS 不会直接覆盖它们。${dirtySuffix}`;
    }
    return `这是一个已有项目；当前没有观察到生产证据，但这不代表项目一定没有上线。${dirtySuffix}`;
  }
  const values = {
    INTENTOS_SOURCE: "This is the IntentOS source repository.",
    NEW_PROJECT: "This is a new project whose engineering governance is not established yet.",
    UNKNOWN_PROJECT: "The project identity cannot yet be determined safely.",
  };
  if (values[projection.projectKind]) return `${values[projection.projectKind]}${dirtySuffix}`;
  if (projection.productionPosture === "PRODUCTION_SENSITIVE") {
    return `This is an existing project with observed production governance; its project-owned authority must remain in force.${dirtySuffix}`;
  }
  if (projection.governancePosture === "GOVERNED") {
    return `This is an existing governed project; IntentOS will not overwrite its project-owned rules.${dirtySuffix}`;
  }
  return `This is an existing project. No production evidence was observed, which is not proof that the project is not live.${dirtySuffix}`;
}

function plainOperation(operation, language = "en") {
  const values = language === "zh" ? {
    START_PROJECT: "开始新项目",
    CONTINUE_TASK: "继续当前任务",
    CHECK_STATUS: "检查当前状态",
    FINISH_TASK: "收口当前任务",
    PREPARE_RELEASE: "准备发布审查",
    ADOPT_PROJECT: "接入已有项目",
    RESUME_TASK: "复核并恢复暂停任务",
    DISCUSS_ONLY: "只讨论，不执行",
  } : {
    START_PROJECT: "Starting the project",
    CONTINUE_TASK: "Continuing the task",
    CHECK_STATUS: "Checking status",
    FINISH_TASK: "Finishing the task",
    PREPARE_RELEASE: "Preparing release",
    ADOPT_PROJECT: "Connecting the existing project",
    RESUME_TASK: "Reviewing paused work before resumption",
    DISCUSS_ONLY: "Discussing without execution",
  };
  return values[operation] || operation;
}

function plainEntry(entry) {
  return {
    NEW_PROJECT_ENTRY: "a new project",
    EXISTING_PROJECT_ENTRY: "an existing project",
    GOVERNED_PROJECT_ENTRY: "an existing governed project",
    PRODUCTION_SENSITIVE_ENTRY: "a production-sensitive project",
    INTENTOS_SOURCE_ENTRY: "the IntentOS source project",
    UNKNOWN_PROJECT_ENTRY: "a project whose state is still unclear",
  }[entry];
}

function plainStateFor(state, language = "en") {
  const zh = {
    NEEDS_GOAL: "需要先说明目标",
    BLOCKED_BY_SOURCE_FAILURE: "读取失败，已经停止",
    NEEDS_CURRENT_WORK_REVIEW: "需要先确认当前未完成改动",
    BLOCKED_BY_WORK_QUEUE: "任务队列存在多个当前任务，已经停止",
    NEEDS_TASK_SWITCH_REVIEW: "新目标和当前任务不同，需要先整理任务切换",
    NEEDS_WORK_QUEUE: "需要先建立唯一的当前任务记录",
    DISCUSSION_ONLY: "只进行沟通和分析",
    NEEDS_RESUME_REVIEW: "恢复暂停任务前需要复核",
    READY_FOR_PROJECT_PLAN: "可以准备项目方案",
    STATUS_AVAILABLE: "当前状态已整理",
    ADOPTION_REVIEW_ACTIVE: "正在进行只读接入判断",
    RELEASE_REVIEW_ONLY: "只可准备发布审查，不能直接发布",
    READY_TO_REPORT_DONE: "证据支持任务完成结论",
    NOT_DONE: "证据还不足以认定完成",
    NEEDS_READ_ONLY_RISK_REVIEW: "需要先只读确认风险",
    NEEDS_GOVERNANCE_EVIDENCE: "需要补齐任务治理证据",
    READY_FOR_LIGHTWEIGHT_WORK_REVIEW: "可以进入轻量执行审查",
    READY_FOR_PROJECT_GOVERNED_WORK_REVIEW: "任务可继续，但必须保留生产项目原有门禁",
    READY_FOR_IMPLEMENTATION_REVIEW: "可以进入实现审查",
  };
  const en = {
    NEEDS_GOAL: "A goal is required",
    BLOCKED_BY_SOURCE_FAILURE: "Stopped because a required source could not be read",
    NEEDS_CURRENT_WORK_REVIEW: "Current uncommitted work must be reviewed first",
    BLOCKED_BY_WORK_QUEUE: "Stopped because the Work Queue has multiple current tasks",
    NEEDS_TASK_SWITCH_REVIEW: "The new goal differs from the current task and needs a task-switch review",
    NEEDS_WORK_QUEUE: "One durable current task record is required",
    DISCUSSION_ONLY: "Discussion and analysis only",
    NEEDS_RESUME_REVIEW: "Paused work requires review before resumption",
    READY_FOR_PROJECT_PLAN: "Ready for project planning",
    STATUS_AVAILABLE: "Current status is available",
    ADOPTION_REVIEW_ACTIVE: "Read-only adoption review is active",
    RELEASE_REVIEW_ONLY: "Release review only; release is not authorized",
    READY_TO_REPORT_DONE: "Evidence supports reporting this task as done",
    NOT_DONE: "Evidence is not sufficient to report done",
    NEEDS_READ_ONLY_RISK_REVIEW: "A read-only risk review is required",
    NEEDS_GOVERNANCE_EVIDENCE: "Task-governance evidence is required",
    READY_FOR_LIGHTWEIGHT_WORK_REVIEW: "Ready for lightweight implementation review",
    READY_FOR_PROJECT_GOVERNED_WORK_REVIEW: "Task may continue only under the production project's existing gates",
    READY_FOR_IMPLEMENTATION_REVIEW: "Ready for implementation review",
  };
  return (language === "zh" ? zh : en)[state] || state;
}

function arrayValue(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

function humanDecisionTexts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string" || item?.required_now === "Yes")
    .map((item) => typeof item === "string"
      ? item
      : item.plain_question || item.question || item.id || "human decision required")
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function firstUsefulLine(value) {
  return String(value || "").split("\n").map((line) => line.trim()).find(Boolean) || "unknown error";
}

function printHuman(report) {
  const zh = outputLanguage === "zh";
  const decisionLabel = report.operatingDecision.requiresHumanDecisionNow === "Yes"
    ? (zh ? "需要你决定" : "Decision needed")
    : (zh ? "当前无需你决定" : "No decision needed now");
  console.log(zh ? "# IntentOS 当前工作状态" : "# IntentOS Current Operating State");
  console.log("");
  console.log(`${zh ? "结论" : "Current status"}: ${report.humanSummary.currentState}`);
  console.log("");
  console.log(`${zh ? "我理解的是" : "Understood goal"}: ${intent || (zh ? "你还没有说明目标" : "No goal was provided")}`);
  console.log("");
  console.log(`${zh ? "项目识别" : "Project reading"}: ${report.humanSummary.projectIdentity}`);
  console.log("");
  console.log(`${zh ? "下一步" : "Next safe step"}: ${report.humanSummary.nextSafeAction}`);
  console.log("");
  console.log(`${decisionLabel}: ${report.humanSummary.decisionNeeded}`);
  console.log("");
  console.log(zh
    ? "你不需要选择技术方案、工作流、基线、测试或审查方式。这个入口本身只读；进入执行后由 Codex 完成内部门禁，真实外部影响仍需明确同意。"
    : "You do not choose the technical plan, workflow, baseline, tests, or review method. This entry is read-only; Codex handles internal gates during execution, while real external effects still require explicit consent.");
}
