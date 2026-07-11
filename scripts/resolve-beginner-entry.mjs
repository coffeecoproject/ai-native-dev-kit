#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { buildSoloOperatingModel } from "./lib/solo-operating-model.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "goal", "mode"]);
const unknown = unknownOptions(args, knownFlags);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kitRoot = path.resolve(__dirname, "..");
const { projectRoot, userGoal } = resolveTargetAndGoal(args);
const outputFormat = args.json ? "json" : String(args.format || "human");
const userMode = String(args.mode || "plain").toLowerCase();

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!new Set(["human", "json"]).has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  process.exit(1);
}

if (!new Set(["plain", "developer", "maintainer"]).has(userMode)) {
  console.error(`FAIL unknown --mode: ${userMode}`);
  process.exit(1);
}

const card = buildBeginnerEntryCard(projectRoot, userGoal, userMode);

if (outputFormat === "json") console.log(JSON.stringify(card, null, 2));
else printHuman(card);

function buildBeginnerEntryCard(root, goal, mode) {
  const guidance = readWorkflowGuidance(root, goal, mode);
  const route = routeFromGuidance(guidance, goal);
  const soloOperatingModel = buildSoloOperatingModel({
    intent: goal,
    operation: operationForRoute(route),
    actionCode: actionForRoute(route),
    sourceFailure: guidance?.outcome === "BLOCKED",
    language: /[\u3400-\u9fff]/.test(goal) ? "zh" : "en",
    selectedProfiles: guidance?.projectReading?.selectedProfiles || [],
  });
  const questions = questionsFor(guidance, goal, route, soloOperatingModel);
  const safeActions = safeActionsFor(guidance, goal, route);
  const blockedActions = blockedActionsFor(route);
  const outcome = outcomeFor(guidance, goal);

  return {
    reportType: "BEGINNER_ENTRY_CARD",
    generatedBy: "scripts/resolve-beginner-entry.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    userMode: mode,
    operatingModel: soloOperatingModel.operatingModel,
    decisionResponsibility: soloOperatingModel,
    userGoal: goal || "not provided",
    humanDecisionSummary: {
      conclusion: conclusionFor(guidance, goal, route),
      recommendedPath: route.recommendedPath,
      canCodexChangeFilesNow: "No",
      separateTechnicalApprovalRequired: "No",
      needFromHuman: questions.length > 0 ? questions.join(" / ") : "No technical decision is required. Codex can continue after internal checks.",
      ifNothing: "This entry remains read-only. Ordinary engineering can continue after internal gates without another technical approval; real-world external effects remain disabled without explicit consent.",
    },
    whatIUnderstood: understoodFor(guidance, goal, route),
    recommendedPath: route.recommendedPath,
    questionsForHuman: questions,
    whatCodexCanDoNext: safeActions,
    whatCodexMustNotDoYet: blockedActions,
    routingEvidence: {
      plainRoute: route.plainRoute,
      technicalRouteCount: Array.isArray(guidance?.internalRouting) ? guidance.internalRouting.length : 0,
      technicalEvidenceAvailable: guidance ? "yes" : "no",
      deliveryState: guidance?.deliveryPathState?.current || "unknown",
      intentClassification: guidance?.intentUnderstanding?.classification || "NOT_PROVIDED",
      hiddenTechnicalRoutes: Array.isArray(guidance?.internalRouting)
        ? guidance.internalRouting.map((item) => item.internalCapability).filter(Boolean)
        : [],
    },
    boundary: {
      writesTargetFiles: "No",
      authorizesApply: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      modifiesCiOrHooks: "No",
      deletesArchivesOrRewritesDocuments: "No",
      changesTaskState: "No",
      enablesBaselineOrIndustrialPacks: "No",
      approvesHighRiskDecisions: "No",
      grantsPermissionBeyondGoal: "No",
      requiresTechnicalChoiceFromUser: "No",
      requiresWorkflowKnowledgeFromUser: "No",
      requiresMultiplePeople: "No",
    },
    outcome,
  };
}

function resolveTargetAndGoal(parsedArgs) {
  const positionals = parsedArgs._ || [];
  if (parsedArgs.goal) {
    return {
      projectRoot: path.resolve(process.cwd(), positionals[0] || "."),
      userGoal: String(parsedArgs.goal || "").trim(),
    };
  }
  if (positionals.length === 0) {
    return { projectRoot: path.resolve(process.cwd(), "."), userGoal: "" };
  }
  if (positionals.length === 1) {
    const only = String(positionals[0] || "");
    if (looksLikePath(only)) {
      return { projectRoot: path.resolve(process.cwd(), only), userGoal: "" };
    }
    return { projectRoot: path.resolve(process.cwd(), "."), userGoal: only.trim() };
  }
  return {
    projectRoot: path.resolve(process.cwd(), positionals[0]),
    userGoal: positionals.slice(1).join(" ").trim(),
  };
}

function looksLikePath(value) {
  const text = String(value || "");
  if (!text) return false;
  if (text === "." || text === ".." || text.startsWith("/") || text.startsWith("./") || text.startsWith("../") || text.startsWith("~/")) return true;
  if (text.includes("/") || text.includes("\\")) return true;
  return fsExists(path.resolve(process.cwd(), text));
}

function fsExists(filePath) {
  try {
    return Boolean(filePath) && fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function readWorkflowGuidance(root, goal, mode) {
  const script = path.join(kitRoot, "scripts", "resolve-workflow-guidance.mjs");
  const childArgs = [script, root, "--deep", "--json", "--mode", mode];
  if (goal) childArgs.push("--intent", goal);
  const result = spawnSync(process.execPath, childArgs, {
    cwd: kitRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 24,
  });

  if (result.status !== 0) {
    return {
      reportType: "WORKFLOW_GUIDANCE_UNAVAILABLE",
      readOnly: true,
      outcome: "BLOCKED",
      error: (result.stderr || result.stdout || "Workflow guidance failed.").trim(),
      deliveryPathState: { current: "BLOCKED_BY_GUIDANCE_FAILURE" },
      intentUnderstanding: {
        classification: goal ? "GENERAL_CHANGE" : "NOT_PROVIDED",
        userGoalSummary: goal || "No user goal provided.",
        riskLevel: "unknown",
      },
      internalRouting: [],
      questionsForHuman: ["请确认这次你想先推进什么目标。"],
    };
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    return {
      reportType: "WORKFLOW_GUIDANCE_INVALID",
      readOnly: true,
      outcome: "BLOCKED",
      error: `Workflow guidance JSON invalid: ${error.message}`,
      deliveryPathState: { current: "BLOCKED_BY_GUIDANCE_FAILURE" },
      intentUnderstanding: {
        classification: goal ? "GENERAL_CHANGE" : "NOT_PROVIDED",
        userGoalSummary: goal || "No user goal provided.",
        riskLevel: "unknown",
      },
      internalRouting: [],
      questionsForHuman: ["请确认这次你想先推进什么目标。"],
    };
  }
}

function routeFromGuidance(guidance, goal) {
  const state = guidance?.projectReading?.projectState || "UNKNOWN_PROJECT";
  const intent = guidance?.intentUnderstanding?.classification || "NOT_PROVIDED";
  const delivery = guidance?.deliveryPathState?.current || "NEEDS_PROJECT_READING";
  const highRisk = guidance?.intentUnderstanding?.riskLevel === "high"
    || state === "PRODUCTION_SENSITIVE_PROJECT"
    || delivery === "BLOCKED_BY_RISK";

  if (!goal) {
    return {
      plainRoute: "need-goal",
      recommendedPath: "先告诉我你想做成什么，我再帮你判断最安全的第一步。",
    };
  }
  if (state === "DIRTY_WORKTREE_PROJECT" || delivery === "BLOCKED_BY_DIRTY_WORK") {
    return {
      plainRoute: "review-current-work",
      recommendedPath: "先确认当前未完成改动属于哪个任务，再决定继续、暂停或切换。",
    };
  }
  if (intent === "EXECUTION_REVIEW_CLOSURE") {
    return {
      plainRoute: "close-current-work",
      recommendedPath: "先做执行后收口，确认改动范围、验证结果和遗留问题，再进入提交审查。",
    };
  }
  if (intent === "RELEASE_OR_DEPLOY") {
    return {
      plainRoute: "release-guide-first",
      recommendedPath: "Codex 先自动准备构建、验证、备份、回滚和发布材料；真正产生外部影响前再说明现实影响。",
    };
  }
  if (intent === "TASK_SWITCH_OR_RESUME") {
    return {
      plainRoute: "manage-interrupted-work",
      recommendedPath: "先整理当前任务、暂停任务和恢复点，再决定是否切换。",
    };
  }
  if (intent === "DOCUMENT_GOVERNANCE") {
    return {
      plainRoute: "review-documents",
      recommendedPath: "先只读检查文档状态，给出归档建议，不移动也不删除。",
    };
  }
  if (highRisk) {
    return {
      plainRoute: "risk-first-plan",
      recommendedPath: "Codex 先自动识别风险边界、影响范围和验证要求，再选择安全实现方案。",
    };
  }
  if (state === "NEW_PROJECT" || intent === "BUILD_NEW_PRODUCT") {
    return {
      plainRoute: "new-project-first-slice",
      recommendedPath: "Codex 根据业务目标自动选择技术架构和工程基线，并围绕第一个完整业务流程开始实现。",
    };
  }
  if (state === "EXISTING_GOVERNED_PROJECT" || state === "PRODUCTION_SENSITIVE_PROJECT") {
    return {
      plainRoute: "read-existing-rules-first",
      recommendedPath: "Codex 先自动读取已有代码、规则和发布边界，再把后续工作统一到 IntentOS，不要求你选择接入模式。",
    };
  }
  return {
    plainRoute: "small-safe-plan",
    recommendedPath: "Codex 自动整理完整影响范围、实现方案和验证路径，然后按内部门禁推进。",
  };
}

function questionsFor(guidance, goal, route, soloOperatingModel) {
  if (!goal) return ["你想先做成什么？"];
  const preferred = [];

  if (route.plainRoute === "new-project-first-slice") {
    preferred.push("第一版主要给谁用？");
    preferred.push("第一版只需要先完成哪一个核心流程？");
  }
  if (route.plainRoute === "release-guide-first") {
    if (!/(预览|测试|内部|正式|preview|test|internal|production)/i.test(goal)) {
      preferred.push("你希望先自己试用，还是准备给真实用户使用？");
    }
  }
  if (route.plainRoute === "review-current-work" || route.plainRoute === "manage-interrupted-work") {
    preferred.push("当前未完成内容是继续、暂停，还是先切换任务？");
  }
  if (soloOperatingModel.userResponsibilityClass === "EXTERNAL_FACT_NEEDED") {
    preferred.push("这项外部政策事实目前是否已有明确结论？没有也可以，Codex 会先完成不受影响的部分。");
  }
  return unique(preferred).slice(0, 2);
}

function safeActionsFor(guidance, goal, route) {
  if (!goal) return ["等待你补充目标后，再只读判断项目状态。"];
  const actions = [];
  if (route.plainRoute === "new-project-first-slice") {
    actions.push("自动识别平台、技术架构、项目档位和完整工程基线。");
    actions.push("围绕第一个完整业务流程准备实现、测试和验收。");
  } else if (route.plainRoute === "read-existing-rules-first") {
    actions.push("自动梳理已有代码、规则、任务、发布边界和风险点。");
    actions.push("保留更严格的有效规则，并准备受控接入和后续执行。");
  } else if (route.plainRoute === "review-current-work" || route.plainRoute === "manage-interrupted-work") {
    actions.push("自动整理当前任务、暂停任务和恢复点，并保留全部进度。");
    actions.push("能安全恢复时直接继续；业务目标冲突时只询问优先级。");
  } else if (route.plainRoute === "close-current-work") {
    actions.push("只读检查改动范围、验证证据和遗留问题。");
    actions.push("判断是否可以进入提交审查。");
  } else if (route.plainRoute === "release-guide-first") {
    actions.push("自动准备构建、测试、备份、回滚、监控和发布证据。");
    actions.push("真正产生外部影响前，用白话说明影响并记录明确同意。");
  } else if (route.plainRoute === "review-documents") {
    actions.push("只读列出可能过期、重复或需要归档建议的文档。");
    actions.push("先给建议，不移动、不删除。");
  } else {
    actions.push("自动读取项目并整理完整影响范围、实现方案和验证路径。");
    actions.push("通过内部门禁后继续工程执行，不要求额外技术确认。");
  }
  if (guidance?.outcome === "BLOCKED") actions.unshift("先解决只读判断里的阻塞。");
  return unique(actions).slice(0, 3);
}

function blockedActionsFor(route) {
  const common = [
    "这张入口卡本身只读；后续普通工程由 Codex 通过内部门禁后执行。",
    "不能把业务事实、真实费用、生产影响或不可逆外部操作当作已默认同意。",
  ];
  if (route.plainRoute === "review-documents") common.push("不能直接移动、删除或重写文档。");
  if (route.plainRoute === "read-existing-rules-first" || route.plainRoute === "risk-first-plan") {
    common.push("不能覆盖已有规则、发布配置或自动触发器。");
  }
  if (route.plainRoute === "release-guide-first") {
    common.push("不能在没有明确现实影响同意时调用云平台、使用真实账号或提交应用商店审核。");
  }
  return common.slice(0, 3);
}

function conclusionFor(guidance, goal, route) {
  if (!goal) return "I need the user's goal before choosing a safe path.";
  const state = guidance?.projectReading?.projectState || "UNKNOWN_PROJECT";
  return `I understood the goal and read the project as ${state}.`;
}

function understoodFor(guidance, goal, route) {
  if (!goal) return "你还没有说明要做成什么，所以我只能先停在目标确认。";
  const intent = guidance?.intentUnderstanding?.userGoalSummary || goal;
  const state = guidance?.projectReading?.projectState || "UNKNOWN_PROJECT";
  const stateText = {
    NEW_PROJECT: "项目更像是新项目或还没成型的项目",
    EXISTING_LIGHT_PROJECT: "项目已经存在，但治理信号不强",
    EXISTING_GOVERNED_PROJECT: "项目已经有自己的规则和治理",
    PRODUCTION_SENSITIVE_PROJECT: "项目可能涉及真实使用、发布、数据或权限风险",
    DIRTY_WORKTREE_PROJECT: "项目里有未完成改动",
    INTENTOS_REPOSITORY: "这是 IntentOS 自身仓库",
    UNKNOWN_PROJECT: "项目状态还不清楚",
  }[state] || "项目状态还不清楚";
  return `你想做的是：${intent}。我读到的状态是：${stateText}。`;
}

function outcomeFor(guidance, goal) {
  if (!goal) return "NEEDS_HUMAN_DECISION";
  if (guidance?.outcome === "BLOCKED") return "BLOCKED";
  if (guidance?.outcome === "NEEDS_HUMAN_DECISION") return "NEEDS_HUMAN_DECISION";
  return "ENTRY_RECORDED";
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function printHuman(card) {
  console.log("# Beginner Entry Card");
  console.log("");
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`Conclusion: ${card.humanDecisionSummary.conclusion}`);
  console.log("");
  console.log(`Recommended path: ${card.humanDecisionSummary.recommendedPath}`);
  console.log("");
  console.log(`Can Codex change files now: ${card.humanDecisionSummary.canCodexChangeFilesNow}`);
  console.log("");
  console.log(`What I need from you: ${card.humanDecisionSummary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${card.humanDecisionSummary.ifNothing}`);
  console.log("");
  console.log("## What I Understood");
  console.log("");
  console.log(card.whatIUnderstood);
  console.log("");
  console.log("## Recommended Path");
  console.log("");
  console.log(card.recommendedPath);
  console.log("");
  console.log("## What I Need From You");
  console.log("");
  card.questionsForHuman.forEach((question, index) => {
    console.log(`${index + 1}. ${question}`);
  });
  console.log("");
  console.log("## What Codex Can Do Next");
  console.log("");
  for (const action of card.whatCodexCanDoNext) console.log(`- ${action}`);
  console.log("");
  console.log("## What Codex Must Not Do Yet");
  console.log("");
  for (const action of card.whatCodexMustNotDoYet) console.log(`- ${action}`);
  console.log("");
  console.log("## Routing Evidence");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Plain route | ${card.routingEvidence.plainRoute} |`);
  console.log(`| Technical route count | ${card.routingEvidence.technicalRouteCount} |`);
  console.log(`| Technical evidence available | ${card.routingEvidence.technicalEvidenceAvailable} |`);
  console.log(`| Delivery state | ${card.routingEvidence.deliveryState} |`);
  console.log(`| Intent classification | ${card.routingEvidence.intentClassification} |`);
  console.log("");
  console.log("## Boundary");
  console.log("");
  console.log(`- This entry writes target files: ${card.boundary.writesTargetFiles}`);
  console.log(`- This entry authorizes apply: ${card.boundary.authorizesApply}`);
  console.log(`- This entry approves implementation: ${card.boundary.approvesImplementation}`);
  console.log(`- This entry approves release or production: ${card.boundary.approvesReleaseOrProduction}`);
  console.log(`- This entry modifies CI or hooks: ${card.boundary.modifiesCiOrHooks}`);
  console.log(`- This entry deletes, archives, or rewrites documents: ${card.boundary.deletesArchivesOrRewritesDocuments}`);
  console.log(`- This entry changes task state: ${card.boundary.changesTaskState}`);
  console.log(`- This entry enables baseline or industrial packs: ${card.boundary.enablesBaselineOrIndustrialPacks}`);
  console.log(`- This entry approves high-risk decisions: ${card.boundary.approvesHighRiskDecisions}`);
  console.log(`- This entry requires technical choices from the user: ${card.boundary.requiresTechnicalChoiceFromUser}`);
  console.log(`- This entry requires multiple people: ${card.boundary.requiresMultiplePeople}`);
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${card.outcome}\``);
}

function operationForRoute(route) {
  if (route.plainRoute === "new-project-first-slice") return "START_PROJECT";
  if (route.plainRoute === "release-guide-first") return "PREPARE_RELEASE";
  if (route.plainRoute === "manage-interrupted-work") return "RESUME_TASK";
  if (route.plainRoute === "need-goal") return "START_PROJECT";
  return "CONTINUE_TASK";
}

function actionForRoute(route) {
  const actions = {
    "need-goal": "REQUEST_GOAL",
    "review-current-work": "REVIEW_CURRENT_WORK",
    "close-current-work": "COMPLETE_CLOSURE_EVIDENCE",
    "release-guide-first": "PREPARE_RELEASE_REVIEW",
    "manage-interrupted-work": "REVIEW_PAUSED_TASK",
    "review-documents": "PREPARE_EXECUTION_PLAN",
    "risk-first-plan": "INSPECT_TASK_RISK",
    "new-project-first-slice": "PREPARE_PROJECT_PLAN",
    "read-existing-rules-first": "RUN_ADOPTION_REVIEW",
    "small-safe-plan": "PREPARE_EXECUTION_PLAN",
  };
  return actions[route.plainRoute] || "PREPARE_EXECUTION_PLAN";
}
