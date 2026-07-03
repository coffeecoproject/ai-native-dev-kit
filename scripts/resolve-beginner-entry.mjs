#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";

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
  const questions = questionsFor(guidance, goal, route);
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
    userGoal: goal || "not provided",
    humanDecisionSummary: {
      conclusion: conclusionFor(guidance, goal, route),
      recommendedPath: route.recommendedPath,
      canCodexChangeFilesNow: "No",
      needFromHuman: questions.join(" / "),
      ifNothing: "No files are changed. No CI, hooks, documents, task state, release, or production behavior is changed.",
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
      recommendedPath: "先做一张上线引导卡，把发布目标、人工审批、证据和哪些动作必须由人执行说清楚。",
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
      recommendedPath: "先确认风险边界和审查范围，再生成最小可验证计划。",
    };
  }
  if (state === "NEW_PROJECT" || intent === "BUILD_NEW_PRODUCT") {
    return {
      plainRoute: "new-project-first-slice",
      recommendedPath: "先把第一版目标、使用对象、核心流程和基础工程规则定清楚，再做最小可用版本。",
    };
  }
  if (state === "EXISTING_GOVERNED_PROJECT" || state === "PRODUCTION_SENSITIVE_PROJECT") {
    return {
      plainRoute: "read-existing-rules-first",
      recommendedPath: "先读已有规则和发布边界，把新流程映射进去，不直接覆盖项目。",
    };
  }
  return {
    plainRoute: "small-safe-plan",
    recommendedPath: "先整理一个不改文件的安全计划，再按最小可验证的一步推进。",
  };
}

function questionsFor(guidance, goal, route) {
  if (!goal) return ["你想先做成什么？"];
  const base = Array.isArray(guidance?.questionsForHuman) ? guidance.questionsForHuman : [];
  const cleaned = base
    .map((item) => simplifyQuestion(item))
    .filter(Boolean);
  const preferred = [];

  if (route.plainRoute === "new-project-first-slice") {
    preferred.push("第一版主要给谁用？");
    preferred.push("第一版只需要先完成哪一个核心流程？");
  }
  if (route.plainRoute === "release-guide-first") {
    preferred.push("这次是预览测试、内部试用，还是正式发布？");
    preferred.push("谁负责最终确认发布？");
  }
  if (route.plainRoute === "read-existing-rules-first" || route.plainRoute === "risk-first-plan") {
    preferred.push("这个项目现在是否已经有人在用？");
    preferred.push("这次是否涉及真实数据、线上环境或不可回滚风险？");
  }
  if (route.plainRoute === "review-current-work" || route.plainRoute === "manage-interrupted-work") {
    preferred.push("当前未完成内容是继续、暂停，还是先切换任务？");
  }
  preferred.push("是否允许我先只读整理计划，不直接改文件？");

  return unique([...preferred, ...cleaned]).slice(0, 3);
}

function safeActionsFor(guidance, goal, route) {
  if (!goal) return ["等待你补充目标后，再只读判断项目状态。"];
  const actions = [];
  if (route.plainRoute === "new-project-first-slice") {
    actions.push("把目标拆成第一版最小可用范围。");
    actions.push("只读推荐项目档位、平台和基础工程规则。");
  } else if (route.plainRoute === "read-existing-rules-first") {
    actions.push("只读梳理项目已有规则、发布边界和风险点。");
    actions.push("整理一份接入建议，不覆盖现有治理。");
  } else if (route.plainRoute === "review-current-work" || route.plainRoute === "manage-interrupted-work") {
    actions.push("只读整理当前任务、暂停任务和恢复点。");
    actions.push("给出继续、暂停或切换的建议。");
  } else if (route.plainRoute === "close-current-work") {
    actions.push("只读检查改动范围、验证证据和遗留问题。");
    actions.push("判断是否可以进入提交审查。");
  } else if (route.plainRoute === "release-guide-first") {
    actions.push("只读生成上线引导卡，整理发布目标、审批、证据和人工执行边界。");
    actions.push("判断是否可以进入发布执行计划，而不是直接发布。");
  } else if (route.plainRoute === "review-documents") {
    actions.push("只读列出可能过期、重复或需要归档建议的文档。");
    actions.push("先给建议，不移动、不删除。");
  } else {
    actions.push("只读读取项目并整理下一步安全计划。");
    actions.push("确认风险和审查范围后再推进。");
  }
  if (guidance?.outcome === "BLOCKED") actions.unshift("先解决只读判断里的阻塞。");
  return unique(actions).slice(0, 3);
}

function blockedActionsFor(route) {
  const common = [
    "不能因为这张卡就直接改项目文件。",
    "不能跳过确认直接进入实现、发布、自动化或高风险改动。",
  ];
  if (route.plainRoute === "review-documents") common.push("不能直接移动、删除或重写文档。");
  if (route.plainRoute === "read-existing-rules-first" || route.plainRoute === "risk-first-plan") {
    common.push("不能覆盖已有规则、发布配置或自动触发器。");
  }
  if (route.plainRoute === "release-guide-first") {
    common.push("不能替你批准发布、填写密钥、调用云平台或提交应用商店审核。");
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
    DEV_KIT_REPOSITORY: "这是 Dev Kit 自身仓库",
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

function simplifyQuestion(question) {
  return String(question || "")
    .replace("是否允许我先生成计划，不直接改文件？", "是否允许我先只读整理计划，不直接改文件？")
    .trim();
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
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${card.outcome}\``);
}
