#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { hasProjectSignals } from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "intent", "task"]);
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
  const release = sources.find((item) => item.name === "RELEASE_GUIDE")?.value || null;
  const adoption = sources.find((item) => item.name === "ADOPTION_AUTOPILOT")?.value || null;
  const sourceFailure = sources.some((item) => item.readStatus === "FAILED");
  const dirtyWorktree = projectState === "DIRTY_WORKTREE_PROJECT" || projectStateTags.includes("DIRTY_WORKTREE_PROJECT");
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
  });
  const evidenceTrace = buildEvidenceTrace(sources, operation, taskGovernance, deliveryStatus, closure, release, adoption);
  const authorityRecommendation = authorityFor(operation, intent, taskImpact, sourceFailure);
  const nextSafeAction = nextActionFor({
    operation,
    operatingState,
    taskGovernance,
    closure,
    release,
    adoption,
    sourceFailure,
  });
  const userDecision = decisionFor({
    operation,
    operatingState,
    authorityRecommendation,
    dirtyWorktree,
    sourceFailure,
  });

  return {
    reportType: "INTENTOS_OPERATING_STATE",
    schemaVersion: "1.95.0",
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
    humanSummary: {
      conclusion: conclusionFor(operation, operatingState, projectEntry, outputLanguage),
      currentState: plainStateFor(operatingState, outputLanguage),
      nextSafeAction,
      decisionNeeded: userDecision,
      internalCommandKnowledgeRequired: "No",
    },
    evidenceTrace,
    authorityRecommendation,
    sourceSystemTrace: sources.map(toSourceTrace),
    boundaries: {
      derivedViewOnly: "Yes",
      writesTargetFiles: "No",
      changesTaskState: "No",
      authorizesImplementation: "No",
      authorizesApply: "No",
      approvesReleaseOrProduction: "No",
      changesProjectAuthority: "No",
      replacesSourceSystems: "No",
      provesProductCorrectness: "No",
    },
    outcome: sourceFailure ? "BLOCKED_BY_SOURCE_FAILURE" : operatingState,
  };
}

function addOperationSources(sources, operation) {
  if (["START_PROJECT", "CONTINUE_TASK"].includes(operation)) {
    sources.push(runSource("BEGINNER_ENTRY", "scripts/resolve-beginner-entry.mjs", [projectRoot, intent, "--json"]));
  }
  if (["CONTINUE_TASK", "CHECK_STATUS", "FINISH_TASK"].includes(operation)) {
    sources.push(runSource("TASK_GOVERNANCE", "scripts/resolve-task-governance.mjs", [projectRoot, "--intent", intent, "--json"]));
  }
  if (["CHECK_STATUS", "FINISH_TASK", "PREPARE_RELEASE"].includes(operation)) {
    sources.push(runSource("USER_DELIVERY_CONSOLE", "scripts/resolve-user-delivery-console.mjs", [projectRoot, "--intent", intent, "--json"]));
  }
  if (operation === "FINISH_TASK") {
    const closureArgs = [projectRoot, "--intent", intent, "--json"];
    if (taskRef) closureArgs.push("--task", taskRef);
    sources.push(runSource("UNIFIED_CLOSURE", "scripts/resolve-closure-decision.mjs", closureArgs));
  }
  if (operation === "PREPARE_RELEASE") {
    sources.push(runSource("RELEASE_GUIDE", "scripts/resolve-release-guide.mjs", [projectRoot, "--intent", intent, "--json"]));
  }
  if (operation === "ADOPT_PROJECT") {
    sources.push(runSource("ADOPTION_AUTOPILOT", "scripts/resolve-existing-project-adoption-autopilot.mjs", [projectRoot, "--intent", intent, "--json"]));
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
      value: null,
      error: firstUsefulLine(result.stderr || result.stdout || "source resolver failed"),
    };
  }
  try {
    const value = JSON.parse(result.stdout);
    return {
      name,
      script,
      readStatus: "CURRENT_RUN",
      outcome: sourceOutcome(value),
      ref: sourceRef(value, script),
      value,
      error: "",
    };
  } catch (error) {
    return {
      name,
      script,
      readStatus: "FAILED",
      outcome: "BLOCKED_BY_INVALID_SOURCE",
      ref: `generated:${script}`,
      value: null,
      error: `invalid JSON: ${error.message}`,
    };
  }
}

function operationFor(value, projectEntry) {
  const text = String(value || "").toLowerCase();
  if (/(?:接入|采用|迁移到|切换到|整合).{0,20}intentos|intentos.{0,20}(?:接入|采用|迁移|工作模式)|\b(?:adopt|migrate|connect).{0,24}\bintentos\b|\bwork under intentos\b/.test(text)) return "ADOPT_PROJECT";
  if (/(?:任务|这个|这项|工作).{0,12}(?:做完|完成).{0,6}(?:吗|没有|了没|\?|？)|(?:能否|是否|可以).{0,12}(?:算|视为|认为)?(?:做完|完成|收口)|\b(?:is|can|has).{0,24}(?:done|finished|complete|close[ -]?out)\b/.test(text)) return "FINISH_TASK";
  if (/(?:查看|检查|告诉我|当前|现在|请问).{0,20}(?:进度|做到哪|完成情况|任务状态|项目状态)|(?:进度|任务状态|项目状态).{0,8}(?:如何|怎样|是什么|吗|\?|？)|\b(?:check|show|review|what is|where are we).{0,24}\b(?:status|progress)\b/.test(text)) return "CHECK_STATUS";
  if (/(?:准备|开始|执行|安排|帮我|我要|需要|可以|怎么|如何).{0,16}(?:发布|上线|提交审核)|(?:发布|上线).{0,12}(?:准备|计划|流程|执行|审核)|\b(?:prepare|start|perform|how to|ready for).{0,16}\b(?:release|deployment|publish)\b/.test(text)) return "PREPARE_RELEASE";
  if (/新项目|从\s*0|从零|\bnew project\b|\bbuild.{0,40}from scratch\b|(?:我想|帮我|请).{0,8}(?:创建|搭建|开发|做一个).{0,24}(?:app|应用|网站|系统)(?:\s|$|[，。,.!?！？])/.test(text)) return "START_PROJECT";
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
  if (context.sourceFailure) return "BLOCKED_BY_SOURCE_FAILURE";
  if (context.dirtyWorktree && ["START_PROJECT", "CONTINUE_TASK"].includes(context.operation)) {
    return "NEEDS_CURRENT_WORK_REVIEW";
  }
  if (context.operation === "START_PROJECT") return "READY_FOR_PROJECT_PLAN";
  if (context.operation === "CHECK_STATUS") return "STATUS_AVAILABLE";
  if (context.operation === "ADOPT_PROJECT") return "ADOPTION_REVIEW_ACTIVE";
  if (context.operation === "PREPARE_RELEASE") return "RELEASE_REVIEW_ONLY";
  if (context.operation === "FINISH_TASK") {
    return context.closure?.closureDecision?.decision === "DONE" ? "READY_TO_REPORT_DONE" : "NOT_DONE";
  }
  const impact = context.taskImpact || "POSSIBLE_HIGH";
  const ready = context.taskGovernance?.readiness?.ready_for_implementation_review === "Yes";
  if (impact === "POSSIBLE_HIGH") return "NEEDS_READ_ONLY_RISK_REVIEW";
  if (!ready) return "NEEDS_GOVERNANCE_EVIDENCE";
  if (context.productionSensitive) return "READY_FOR_PROJECT_GOVERNED_WORK_REVIEW";
  return impact === "LOW" ? "READY_FOR_LIGHTWEIGHT_WORK_REVIEW" : "READY_FOR_IMPLEMENTATION_REVIEW";
}

function buildEvidenceTrace(sources, operation, taskGovernance, deliveryStatus, closure, release, adoption) {
  const nodes = sources.map((source) => ({
    id: source.name,
    ref: source.ref,
    readStatus: source.readStatus,
    outcome: source.outcome,
    relation: relationFor(source.name, operation),
    strictCheckerStatus: "NOT_EVALUATED_BY_OPERATING_VIEW",
    blocksCurrentOperation: source.readStatus === "FAILED" ? "Yes" : "No",
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
    ...arrayValue(adoption?.humanDecisions),
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

function authorityFor(operation, value, taskImpact, sourceFailure) {
  const text = String(value || "").toLowerCase();
  const roles = new Set();
  if (operation === "START_PROJECT" || operation === "ADOPT_PROJECT") roles.add("PROJECT_OWNER");
  if (["CONTINUE_TASK", "FINISH_TASK"].includes(operation) && ["HIGH", "POSSIBLE_HIGH"].includes(taskImpact)) roles.add("TASK_SCOPE_OWNER");
  if (/权限|角色|认证|授权|auth|permission|role|security|安全/.test(text)) {
    roles.add("DOMAIN_OWNER");
    roles.add("SECURITY_OWNER");
  }
  if (/数据|数据库|迁移|删除|清理|恢复|database|\bdb\b|migration|delete|restore/.test(text)) {
    roles.add("DATA_OWNER");
    roles.add("PRODUCTION_OWNER");
  }
  if (/隐私|合规|法律|税务|财务|支付|privacy|compliance|legal|tax|finance|payment/.test(text)) {
    roles.add("DOMAIN_OWNER");
    roles.add("COMPLIANCE_OWNER");
  }
  if (operation === "PREPARE_RELEASE") roles.add("RELEASE_OWNER");
  if (/生产|正式发布|production/.test(text)) roles.add("PRODUCTION_OWNER");
  if (/云平台|应用商店|app\s*store|provider|dns|外部系统/.test(text)) roles.add("EXTERNAL_SYSTEM_OWNER");
  const recommendedRoles = [...roles];
  return {
    derivedOnly: "Yes",
    grantsAuthority: "No",
    changesProjectAuthority: "No",
    currentReadOnlyActionAllowed: sourceFailure ? "No" : "Yes",
    materialActionAllowedByThisView: "No",
    recommendedRoles,
    recommendationReason: authorityReason(operation, taskImpact, recommendedRoles),
    namedOwnerResolution: "NOT_EVALUATED_BY_OPERATING_VIEW",
    projectRuleAuthorityResolution: "SOURCE_SYSTEMS_REMAIN_AUTHORITATIVE",
    existingApprovalEvidence: "NOT_EVALUATED_BY_OPERATING_VIEW",
    humanDecisionRequiredBeforeMaterialAction: recommendedRoles.length > 0 ? "Yes" : "OnlyIfProjectRulesRequireIt",
    requiredApprovalEvidence: operation === "PREPARE_RELEASE"
      ? "Current structured human Release Approval Record before release execution"
      : "Project-native approval or the existing IntentOS controlled approval chain when a material write is proposed",
  };
}

function lifecyclePhaseFor(operation) {
  const phases = {
    START_PROJECT: "PROJECT_ENTRY",
    ADOPT_PROJECT: "PROJECT_ENTRY",
    CONTINUE_TASK: "TASK_GOVERNANCE_AND_PLANNING",
    CHECK_STATUS: "TASK_STATUS",
    FINISH_TASK: "TASK_CLOSURE",
    PREPARE_RELEASE: "RELEASE_PREPARATION",
  };
  return phases[operation];
}

function nextActionFor(context) {
  const zh = outputLanguage === "zh";
  if (context.sourceFailure) return zh ? "Codex 先修复或说明读取失败，再继续处理。" : "Codex should explain or repair the failed source read before continuing.";
  if (context.operatingState === "NEEDS_GOAL") return zh ? "告诉 Codex 你想做成什么。" : "Tell Codex what outcome you want.";
  if (context.operatingState === "NEEDS_CURRENT_WORK_REVIEW") return zh ? "先把现有未提交改动对应到当前任务，不覆盖也不丢弃。" : "Map current uncommitted work to this task without overwriting or discarding it.";
  if (context.operation === "START_PROJECT") return zh ? "Codex 先准备项目方案和技术基线建议，不要求你选择内部编号。" : "Codex should prepare the project plan and technical baseline recommendation without asking you for internal IDs.";
  if (context.operation === "ADOPT_PROJECT") return zh ? "Codex 先完成只读接入判断，再决定是否需要受控写入计划。" : "Codex should complete the read-only adoption review before proposing any controlled write plan.";
  if (context.operation === "CHECK_STATUS") return zh ? "Codex 汇总当前证据，并用白话说明已完成、未完成和下一步。" : "Codex should summarize current evidence, what is done, what is missing, and the next step.";
  if (context.operation === "FINISH_TASK") {
    return context.operatingState === "READY_TO_REPORT_DONE"
      ? (zh ? "Codex 可以生成完成说明，但仍不代表发布或生产批准。" : "Codex may report task completion, but this is not release or production approval.")
      : (zh ? "Codex 先补齐缺失证据，再判断任务是否完成。" : "Codex should fill the missing evidence before deciding whether the task is done.");
  }
  if (context.operation === "PREPARE_RELEASE") return zh ? "Codex 先准备发布审查材料，不直接执行发布。" : "Codex should prepare release-review evidence without executing the release.";
  return context.taskGovernance?.humanSummary?.plainNextStep
    || (zh ? "Codex 按当前任务影响级别准备对应的实现审查。" : "Codex should prepare the implementation review required by the current task impact.");
}

function decisionFor(context) {
  const zh = outputLanguage === "zh";
  if (context.sourceFailure) return zh ? "暂时不需要产品判断，Codex 先说明读取失败原因。" : "No product decision is needed yet; Codex should explain the source-read failure first.";
  if (context.operatingState === "NEEDS_GOAL") return zh ? "你想做什么，或者想改变什么？" : "What do you want to build or change?";
  if (context.dirtyWorktree) return zh ? "当前未提交改动是否属于这次任务？" : "Do the current uncommitted changes belong to this task?";
  if (context.operation === "PREPARE_RELEASE") return zh ? "谁负责最终确认这次发布？" : "Who owns the final release decision?";
  if (context.authorityRecommendation.recommendedRoles.length > 0
    && ["CONTINUE_TASK", "FINISH_TASK"].includes(context.operation)) {
    return zh ? "实际执行前，Codex 会从项目证据中识别负责人；你不需要选择内部权限名称。" : "Before material execution, Codex must resolve the responsible owner from project evidence; you do not need to choose an internal role name.";
  }
  return zh ? "这一步是只读判断，不需要你额外决定。" : "This is a read-only decision; no additional choice is required from you.";
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
  if (language === "zh") return `${plainOperation(operation, language)}，当前状态：${plainStateFor(state, language)}。`;
  return `${plainOperation(operation, language)} for ${plainEntry(entry)} is in state: ${plainStateFor(state, language)}.`;
}

function plainOperation(operation, language = "en") {
  const values = language === "zh" ? {
    START_PROJECT: "开始新项目",
    CONTINUE_TASK: "继续当前任务",
    CHECK_STATUS: "检查当前状态",
    FINISH_TASK: "收口当前任务",
    PREPARE_RELEASE: "准备发布审查",
    ADOPT_PROJECT: "接入已有项目",
  } : {
    START_PROJECT: "Starting the project",
    CONTINUE_TASK: "Continuing the task",
    CHECK_STATUS: "Checking status",
    FINISH_TASK: "Finishing the task",
    PREPARE_RELEASE: "Preparing release",
    ADOPT_PROJECT: "Connecting the existing project",
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

function authorityReason(operation, taskImpact, roles) {
  if (roles.length === 0) return "The current step is read-only and no material owner decision is required now.";
  return `${operation} with task impact ${taskImpact} may require ${roles.join(", ")} before a material action. This view only recommends the route.`;
}

function arrayValue(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

function unique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function firstUsefulLine(value) {
  return String(value || "").split("\n").map((line) => line.trim()).find(Boolean) || "unknown error";
}

function printHuman(report) {
  const zh = outputLanguage === "zh";
  console.log(zh ? "# IntentOS 当前工作状态" : "# IntentOS Current Operating State");
  console.log("");
  console.log(`${zh ? "结论" : "Current status"}: ${report.humanSummary.currentState}`);
  console.log("");
  console.log(`${zh ? "我理解的是" : "Understood goal"}: ${intent || (zh ? "你还没有说明目标" : "No goal was provided")}`);
  console.log("");
  console.log(`${zh ? "下一步" : "Next safe step"}: ${report.humanSummary.nextSafeAction}`);
  console.log("");
  console.log(`${zh ? "需要你决定" : "Decision needed"}: ${report.humanSummary.decisionNeeded}`);
  console.log("");
  console.log(zh
    ? "这一步不会改文件，不会批准实现、发布或生产操作，也不会改变项目负责人。内部检查由 Codex 自己选择。"
    : "This step does not write files, approve implementation, release, or production, or change project authority. Codex chooses the internal checks.");
}
