#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { hasProjectSignals } from "./lib/project-signals.mjs";

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
  const sourceSystemTrace = sources.map(toSourceTrace);
  const operatingDecision = buildOperatingDecision({
    operation,
    operatingState,
    projectEntry,
    taskImpact,
    taskGovernance,
    closure,
    sourceFailure,
    dirtyWorktree,
    evidenceTrace,
    authorityRecommendation,
    sourceSystemTrace,
  });

  return {
    reportType: "INTENTOS_OPERATING_STATE",
    schemaVersion: "1.96.0",
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
    operatingDecision,
    humanSummary: {
      conclusion: conclusionFor(operation, operatingState, projectEntry, outputLanguage),
      currentState: plainStateFor(operatingState, outputLanguage),
      nextSafeAction: operatingDecision.plainAction,
      decisionNeeded: humanDecisionSummaryFor(operatingDecision, outputLanguage),
      internalCommandKnowledgeRequired: "No",
    },
    evidenceTrace,
    authorityRecommendation,
    sourceSystemTrace,
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
    for (const flag of ["verification", "impact-report", "execution-closure", "guided-closure", "human-decision"]) {
      if (args[flag]) closureArgs.push(`--${flag}`, String(args[flag]));
    }
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
      semanticDigest: `sha256:${sha256(result.stderr || result.stdout || "source resolver failed")}`,
      value: null,
      error: firstUsefulLine(result.stderr || result.stdout || "source resolver failed"),
    };
  }
  try {
    const value = JSON.parse(result.stdout);
    const semanticValue = { ...value };
    delete semanticValue.generatedAt;
    return {
      name,
      script,
      readStatus: "CURRENT_RUN",
      outcome: sourceOutcome(value),
      ref: sourceRef(value, script),
      semanticDigest: `sha256:${sha256(JSON.stringify(semanticValue))}`,
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
      semanticDigest: `sha256:${sha256(result.stdout || error.message)}`,
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
  const humanDecision = humanDecisionFor(context, selected.actionCode);
  const digestPayload = {
    contractVersion: "1.96.0",
    intentDigest: sha256(intent),
    projectRootDigest: sha256(projectRoot),
    taskRef: taskRef || "N/A",
    projectEntry: context.projectEntry,
    operation: context.operation,
    operatingState: context.operatingState,
    taskImpact: context.taskImpact,
    actionCode: selected.actionCode,
    actionClass: selected.actionClass,
    decisionStatus: selected.decisionStatus,
    reasonCode: selected.reasonCode,
    blockedBy,
    sourceInputs,
  };
  return {
    contractVersion: "1.96.0",
    derivedOnly: "Yes",
    actionCode: selected.actionCode,
    actionClass: selected.actionClass,
    decisionStatus: selected.decisionStatus,
    reasonCode: selected.reasonCode,
    reason: reasonFor(selected.actionCode, blockedBy),
    blockedBy,
    sourceInputs,
    requiresHumanDecisionNow: humanDecision.required ? "Yes" : "No",
    humanDecisionPrompt: humanDecision.prompt,
    canCodexContinueReadOnly: selected.canContinueReadOnly ? "Yes" : "No",
    materialActionAuthorized: "No",
    plainAction: plainActionFor(selected.actionCode, outputLanguage),
    decisionDigest: `sha256:${sha256(JSON.stringify(digestPayload))}`,
    invalidationConditions: [...context.evidenceTrace.invalidationConditions],
  };
}

function selectOperatingAction(context) {
  if (context.sourceFailure) return action("REPAIR_SOURCE_READ", "BLOCKED_RECOVERY", "BLOCKED", "SOURCE_READ_FAILED", false);
  if (context.operatingState === "NEEDS_GOAL") return action("REQUEST_GOAL", "USER_INPUT", "NEEDS_USER_INPUT", "GOAL_REQUIRED", false);
  if (context.operatingState === "NEEDS_CURRENT_WORK_REVIEW") return action("REVIEW_CURRENT_WORK", "READ_ONLY_REVIEW", "NEEDS_USER_INPUT", "DIRTY_WORKTREE_REVIEW_REQUIRED", true);
  if (context.operation === "START_PROJECT") return action("PREPARE_PROJECT_PLAN", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "PROJECT_PLAN_REQUIRED", true);
  if (context.operation === "ADOPT_PROJECT") return action("RUN_ADOPTION_REVIEW", "READ_ONLY_REVIEW", "READ_ONLY_ACTION_REQUIRED", "ADOPTION_REVIEW_REQUIRED", true);
  if (context.operation === "CHECK_STATUS") return action("SUMMARIZE_CURRENT_STATUS", "REPORTING", "READY_TO_REPORT", "STATUS_SUMMARY_REQUESTED", true);
  if (context.operation === "FINISH_TASK") {
    return context.operatingState === "READY_TO_REPORT_DONE"
      ? action("REPORT_TASK_COMPLETE", "REPORTING", "READY_TO_REPORT", "CLOSURE_SUPPORTS_DONE", true)
      : action("COMPLETE_CLOSURE_EVIDENCE", "GOVERNANCE_PREPARATION", "ACTION_REQUIRED", "CLOSURE_EVIDENCE_INCOMPLETE", true);
  }
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
  if (context.operation === "CONTINUE_TASK") return arrayValue(context.taskGovernance?.readiness?.blocked_by);
  if (context.operation === "FINISH_TASK" && context.operatingState !== "READY_TO_REPORT_DONE") {
    return arrayValue(context.closure?.requiredNextAction);
  }
  if (["ADOPT_PROJECT", "PREPARE_RELEASE"].includes(context.operation)) {
    return arrayValue(context.evidenceTrace.missingOrBlocking);
  }
  return [];
}

function humanDecisionFor(context, actionCode) {
  const zh = outputLanguage === "zh";
  if (actionCode === "REQUEST_GOAL") return {
    required: true,
    prompt: zh ? "你想做什么，或者想改变什么？" : "What do you want to build or change?",
  };
  if (actionCode === "REVIEW_CURRENT_WORK") return {
    required: true,
    prompt: zh ? "当前未提交改动是否属于这次任务？" : "Do the current uncommitted changes belong to this task?",
  };
  if (actionCode === "REPAIR_SOURCE_READ") return {
    required: false,
    prompt: zh ? "Codex 先说明来源读取失败的原因。" : "Codex should explain the source-read failure first.",
  };
  if (context.authorityRecommendation.recommendedRoles.length > 0) return {
    required: false,
    prompt: zh
      ? "Codex 会先从项目证据中识别负责人，再提出实质动作。"
      : "Codex must resolve the responsible owner from project evidence before proposing a material action.",
  };
  return {
    required: false,
    prompt: zh ? "Codex 可以按当前只读路径继续。" : "Codex can continue on the current read-only route.",
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
    REVIEW_CURRENT_WORK: "Codex 先只读梳理现有未提交改动，不覆盖也不丢弃。",
    PREPARE_PROJECT_PLAN: "Codex 先准备项目方案和技术基线建议，不要求你选择内部编号。",
    RUN_ADOPTION_REVIEW: "Codex 先完成只读接入判断，再决定是否需要受控写入计划。",
    SUMMARIZE_CURRENT_STATUS: "Codex 汇总当前证据，并用白话说明已完成、未完成和下一步。",
    INSPECT_TASK_RISK: "Codex 先只读确认数据、状态、权限或接口影响，不直接改代码。",
    RESOLVE_ADOPTION_BLOCKER: "Codex 先解释并处理当前项目接入阻断，不改项目资产。",
    PREPARE_BUSINESS_RULE_CLOSURE: "Codex 先把业务规则、例外和完成条件梳理完整，再进入实现审查。",
    PREPARE_CHANGE_IMPACT_COVERAGE: "Codex 先补齐前端、后端、数据和运行面的影响范围，再进入实现审查。",
    PREPARE_EXECUTION_PLAN: "Codex 先准备完整执行计划，再进入实现审查。",
    PREPARE_VERIFICATION_PLAN: "Codex 先明确需要验证什么以及如何证明，再进入实现审查。",
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: "Codex 先补齐当前任务缺少的治理条件，再进入实现审查。",
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Codex 按低影响任务准备小范围实现和最小验证审查。",
    PREPARE_IMPLEMENTATION_REVIEW: "Codex 按当前任务影响级别准备实现审查，暂不代表已获执行授权。",
    COMPLETE_CLOSURE_EVIDENCE: "Codex 先补齐缺失证据，再判断任务是否完成。",
    REPORT_TASK_COMPLETE: "Codex 可以生成任务完成说明，但这不代表发布或生产批准。",
    PREPARE_RELEASE_REVIEW: "Codex 先准备发布审查材料，不直接执行发布。",
  };
  const en = {
    REPAIR_SOURCE_READ: "Codex should explain or repair the failed source read before continuing.",
    REQUEST_GOAL: "Tell Codex what outcome you want.",
    REVIEW_CURRENT_WORK: "Codex should inspect and map current uncommitted work without overwriting or discarding it.",
    PREPARE_PROJECT_PLAN: "Codex should prepare the project plan and technical baseline recommendation without asking for internal IDs.",
    RUN_ADOPTION_REVIEW: "Codex should complete the read-only adoption review before proposing a controlled write plan.",
    SUMMARIZE_CURRENT_STATUS: "Codex should summarize current evidence, completed work, missing work, and the next step.",
    INSPECT_TASK_RISK: "Codex should inspect possible data, state, permission, or API impact before changing code.",
    RESOLVE_ADOPTION_BLOCKER: "Codex should explain and resolve the adoption blocker without changing project assets.",
    PREPARE_BUSINESS_RULE_CLOSURE: "Codex should clarify business rules, exceptions, and completion conditions before implementation review.",
    PREPARE_CHANGE_IMPACT_COVERAGE: "Codex should map frontend, backend, data, and runtime impact before implementation review.",
    PREPARE_EXECUTION_PLAN: "Codex should prepare the complete execution plan before implementation review.",
    PREPARE_VERIFICATION_PLAN: "Codex should define what must be verified and how it will be proved before implementation review.",
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: "Codex should complete the missing task-governance prerequisites before implementation review.",
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Codex should prepare a bounded implementation and minimal verification review for this low-impact task.",
    PREPARE_IMPLEMENTATION_REVIEW: "Codex should prepare implementation review for the current task impact; execution is not authorized by this view.",
    COMPLETE_CLOSURE_EVIDENCE: "Codex should complete the missing evidence before deciding whether the task is done.",
    REPORT_TASK_COMPLETE: "Codex may report task completion, but this is not release or production approval.",
    PREPARE_RELEASE_REVIEW: "Codex should prepare release-review evidence without executing the release.",
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
  const decisionLabel = report.operatingDecision.requiresHumanDecisionNow === "Yes"
    ? (zh ? "需要你决定" : "Decision needed")
    : (zh ? "当前无需你决定" : "No decision needed now");
  console.log(zh ? "# IntentOS 当前工作状态" : "# IntentOS Current Operating State");
  console.log("");
  console.log(`${zh ? "结论" : "Current status"}: ${report.humanSummary.currentState}`);
  console.log("");
  console.log(`${zh ? "我理解的是" : "Understood goal"}: ${intent || (zh ? "你还没有说明目标" : "No goal was provided")}`);
  console.log("");
  console.log(`${zh ? "下一步" : "Next safe step"}: ${report.humanSummary.nextSafeAction}`);
  console.log("");
  console.log(`${decisionLabel}: ${report.humanSummary.decisionNeeded}`);
  console.log("");
  console.log(zh
    ? "这一步不会改文件，不会批准实现、发布或生产操作，也不会改变项目负责人。内部检查由 Codex 自己选择。"
    : "This step does not write files, approve implementation, release, or production, or change project authority. Codex chooses the internal checks.");
}
