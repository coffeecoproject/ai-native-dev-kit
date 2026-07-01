#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { analyzeRiskSurfaces } from "./lib/risk-surfaces.mjs";

const args = parseArgs(process.argv.slice(2));
const unknown = unknownOptions(args, new Set(["json", "goal", "platform", "audience"]));
const { projectRoot, goal } = resolveTargetAndGoal(args);
const platform = String(args.platform || inferPlatform(projectRoot, goal)).trim();
const audience = String(args.audience || "first users").trim();

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

const card = buildCard(projectRoot, goal, platform, audience);
if (args.json) console.log(JSON.stringify(card, null, 2));
else printCard(card);

function resolveTargetAndGoal(parsedArgs) {
  const positionals = parsedArgs._ || [];
  if (parsedArgs.goal) {
    return {
      projectRoot: path.resolve(process.cwd(), positionals[0] || "."),
      goal: String(parsedArgs.goal || "").trim(),
    };
  }
  if (positionals.length === 0) return { projectRoot: path.resolve(process.cwd(), "."), goal: "" };
  if (positionals.length === 1) {
    const only = String(positionals[0] || "");
    if (looksLikePath(only)) return { projectRoot: path.resolve(process.cwd(), only), goal: "" };
    return { projectRoot: path.resolve(process.cwd(), "."), goal: only.trim() };
  }
  return {
    projectRoot: path.resolve(process.cwd(), positionals[0]),
    goal: positionals.slice(1).join(" ").trim(),
  };
}

function buildCard(root, userGoal, selectedPlatform, targetAudience) {
  const risk = riskFor(userGoal, root);
  const product = productName(userGoal);
  const coreFlow = coreFlowFor(userGoal);
  const firstVersion = risk.high
    ? `先只定义 ${product} 的第一版范围和风险边界，不进入实现。`
    : `做一个可本地试用的 ${product} 第一版，完成 ${coreFlow}。`;
  const questions = risk.high
    ? [
      "这次是否涉及真实用户、真实数据或线上环境？",
      "是否可以先只读整理第一版范围，不直接实现？",
      "哪些风险项必须排除在第一版之外？",
    ]
    : [
      "第一版主要给谁用？",
      `第一版是否先做 ${selectedPlatform}？`,
      "是否先排除支付、登录、短信、发布和复杂权限？",
    ];
  return {
    reportType: "ORDINARY_USER_FIRST_SLICE_CARD",
    generatedBy: "scripts/resolve-first-slice.mjs",
    projectRoot: root,
    readOnly: true,
    goal: userGoal || "not provided",
    platform: selectedPlatform,
    riskLevel: risk.high ? "needs-review" : "low",
    riskSurfaces: risk.surfaces,
    riskReasons: risk.reasons,
    humanSummary: {
      understood: userGoal || "你还没有说明想做什么。",
      firstVersion,
      canCodexWriteFilesNow: "No",
      needFromHuman: questions.join(" / "),
    },
    firstVersionScope: {
      targetUser: targetAudience,
      coreFlow,
      platform: selectedPlatform,
      data: risk.high ? "not decided" : "local demo data first",
    },
    questionsForHuman: questions,
    safeNextActions: risk.high
      ? ["先只读整理风险和第一版范围。", "把高风险项放到人工决策队列。"]
      : ["创建最小任务范围。", "实现本地可试用第一版。", "运行核心流程验证。"],
    backlog: backlogFor(userGoal, risk),
    verificationPlan: [
      { check: "Core flow", method: "complete one happy-path run", evidence: "final report or smoke output" },
      { check: "Out-of-scope risk", method: "confirm backlog excludes high-risk items", evidence: "first-slice card" },
    ],
    boundaries: {
      writesTargetFiles: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      changesCiOrHooks: "No",
      touchesPaymentSecretsProductionMigrationOrPermissions: "No",
      enablesBl2OrIndustrialPacks: "No",
    },
    outcome: userGoal ? "FIRST_SLICE_RECORDED" : "NEEDS_HUMAN_DECISION",
  };
}

function inferPlatform(root, userGoal) {
  const text = `${userGoal || ""}\n${packageSignals(root)}`.toLowerCase();
  if (/小程序|miniprogram|wechat/.test(text)) return "Mini Program";
  if (/ios|iphone|swift/.test(text)) return "iOS";
  if (/android|kotlin/.test(text)) return "Android";
  if (/api|server|backend/.test(text)) return "Backend";
  return "Web";
}

function riskFor(userGoal, root) {
  const risk = analyzeRiskSurfaces({
    intent: userGoal,
    projectRoot: root,
    includeProjectSignals: true,
  });
  return {
    high: risk.high,
    surfaces: risk.surfaces,
    reasons: risk.reasons,
  };
}

function productName(userGoal) {
  if (!userGoal) return "产品";
  if (/预约|booking|appointment/i.test(userGoal)) return "预约产品";
  if (/admin|中台|管理/i.test(userGoal)) return "管理工具";
  if (/dashboard|看板/i.test(userGoal)) return "看板工具";
  return "产品";
}

function coreFlowFor(userGoal) {
  if (/预约|booking|appointment/i.test(userGoal || "")) return "用户提交预约，管理者查看预约";
  if (/admin|中台|管理/i.test(userGoal || "")) return "用户查看列表并处理一条记录";
  if (/dashboard|看板/i.test(userGoal || "")) return "用户查看关键指标和明细";
  return "一个最小核心流程";
}

function backlogFor(userGoal, risk) {
  const common = ["支付", "短信通知", "复杂登录权限", "生产发布"];
  if (risk.high) return ["所有高风险实现", ...common].slice(0, 4);
  if (/预约|booking|appointment/i.test(userGoal || "")) return common;
  return ["复杂权限", "线上发布", "支付或真实交易", "高级报表"];
}

function printCard(card) {
  console.log("# Ordinary User First-Slice Card");
  console.log("");
  console.log("## Human Summary");
  console.log("");
  console.log(`I understand you want: ${card.humanSummary.understood}`);
  console.log("");
  console.log(`I suggest the first version: ${card.humanSummary.firstVersion}`);
  console.log("");
  console.log(`Can Codex write files now: ${card.humanSummary.canCodexWriteFilesNow}`);
  console.log("");
  console.log(`What I need from you: ${card.humanSummary.needFromHuman}`);
  console.log("");
  console.log("## First Version Scope");
  console.log("");
  console.log("| Item | Included now? | Notes |");
  console.log("|---|---|---|");
  console.log(`| Target user | Yes | ${card.firstVersionScope.targetUser} |`);
  console.log(`| Core flow | Yes | ${card.firstVersionScope.coreFlow} |`);
  console.log(`| Platform | Yes | ${card.firstVersionScope.platform} |`);
  console.log(`| Data | ${card.firstVersionScope.data === "local demo data first" ? "Local only" : "Not decided"} | ${card.firstVersionScope.data} |`);
  console.log("");
  console.log("## Questions For Human");
  console.log("");
  card.questionsForHuman.forEach((question, index) => console.log(`${index + 1}. ${question}`));
  console.log("");
  console.log("## What Codex Can Do Next");
  console.log("");
  card.safeNextActions.forEach((action, index) => console.log(`${index + 1}. ${action}`));
  console.log("");
  console.log("## Backlog / Later");
  console.log("");
  console.log("| Item | Why later |");
  console.log("|---|---|");
  card.backlog.forEach((item) => console.log(`| ${item} | Not needed for the first local version |`));
  console.log("");
  console.log("## Verification Plan");
  console.log("");
  console.log("| Check | Method | Evidence |");
  console.log("|---|---|---|");
  card.verificationPlan.forEach((item) => console.log(`| ${item.check} | ${item.method} | ${item.evidence} |`));
  console.log("");
  console.log("## Boundaries");
  console.log("");
  console.log("- This card writes target files: No");
  console.log("- This card approves implementation: No");
  console.log("- This card approves release or production: No");
  console.log("- This card changes CI or hooks: No");
  console.log("- This card touches payment, secrets, production, migration, or permissions: No");
  console.log("- This card enables BL2 or industrial packs: No");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${card.outcome}\``);
}

function looksLikePath(value) {
  if (!value) return false;
  return value === "." || value === ".." || value.startsWith("/") || value.startsWith("./") || value.startsWith("../") || value.includes("/");
}

function safeRead(filePath) {
  try {
    return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  } catch {
    return "";
  }
}

function packageSignals(root) {
  try {
    const content = safeRead(path.join(root, "package.json"));
    if (!content) return "";
    const pkg = JSON.parse(content);
    return [
      pkg.name,
      Object.keys(pkg.dependencies || {}).join("\n"),
      Object.keys(pkg.devDependencies || {}).join("\n"),
      Object.keys(pkg.peerDependencies || {}).join("\n"),
    ].filter(Boolean).join("\n");
  } catch {
    return "";
  }
}
