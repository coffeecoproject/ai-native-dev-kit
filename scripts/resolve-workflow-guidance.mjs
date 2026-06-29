#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  defaultIgnoredDirs,
  hasProjectSignals,
  walkRelativePaths,
} from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const knownFlags = new Set(["json", "format", "mode"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const userMode = String(args.mode || "plain").toLowerCase();
const allowedFormats = new Set(["human", "json"]);
const allowedModes = new Set(["plain", "developer", "maintainer"]);

if (unknown.length > 0) {
  console.error(`FAIL unknown option: --${unknown.join(", --")}`);
  process.exit(1);
}

if (!allowedFormats.has(outputFormat)) {
  console.error(`FAIL unknown --format: ${outputFormat}`);
  console.error("Use --format human or --json.");
  process.exit(1);
}

if (!allowedModes.has(userMode)) {
  console.error(`FAIL unknown --mode: ${userMode}`);
  console.error("Use --mode plain, --mode developer, or --mode maintainer.");
  process.exit(1);
}

const guidance = buildWorkflowGuidance(projectRoot, userMode);

if (outputFormat === "json") {
  console.log(JSON.stringify(guidance, null, 2));
} else {
  printHuman(guidance);
}

function buildWorkflowGuidance(root, mode) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : null;
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 4,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const pathSet = new Set(paths);
  const signals = collectSignals(root, exists, pathSet);
  const project = classifyProject(root, exists, git, signals);
  const delivery = deliveryStateFor(project, signals);
  const questions = questionsFor(project, signals, delivery);
  const routing = routingFor(project, signals, delivery);

  return {
    reportType: "WORKFLOW_GUIDANCE_CARD",
    generatedBy: "scripts/resolve-workflow-guidance.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    userMode: mode,
    humanDecisionSummary: {
      conclusion: conclusionFor(project, delivery),
      recommendedNextStep: recommendedNextStep(project, delivery),
      canAiContinueNow: canContinue(project, delivery),
      needFromHuman: questions.length > 0 ? questions.join(" / ") : "No decision needed for read-only guidance.",
      ifNothing: "No files are changed. No CI, hook, document, task state, release, or production behavior is changed.",
    },
    plainSummary: plainSummary(project, delivery),
    projectReading: {
      userMode: mode,
      projectState: project.state,
      existingUsersAssumed: project.existingUsersAssumed,
      canWriteFilesNow: "No",
      riskLevel: project.riskLevel,
      reason: project.reason,
    },
    deliveryPathState: {
      current: delivery.current,
      next: delivery.next,
    },
    recommendedNextStep: recommendedNextStep(project, delivery),
    distanceToUsefulUse: distanceToUsefulUse(project, signals, delivery),
    questionsForHuman: questions,
    internalRouting: routing,
    boundaries: {
      writesTargetFiles: "No",
      modifiesCi: "No",
      installsHooks: "No",
      deletesOrArchivesDocuments: "No",
      changesTaskState: "No",
      approvesImplementation: "No",
      approvesReleaseOrProduction: "No",
      approvesHighRiskDecisions: "No",
    },
    outcome: outcomeFor(project, delivery),
  };
}

function collectSignals(root, exists, pathSet) {
  const paths = [...pathSet];
  const joined = paths.join("\n");
  const packageJson = readJsonIfExists(path.join(root, "package.json"));
  const packageText = JSON.stringify({
    dependencies: packageJson?.dependencies || {},
    devDependencies: packageJson?.devDependencies || {},
    scripts: packageJson?.scripts || {},
  });
  const has = (rel) => pathSet.has(rel) || fs.existsSync(path.join(root, rel));
  const hasPrefix = (prefix) => paths.some((item) => item === prefix || item.startsWith(`${prefix}/`));

  return {
    exists,
    hasProjectSignals: exists ? hasProjectSignals(root) : false,
    isEmptyish: exists && paths.filter((item) => !item.startsWith(".git/")).length <= 3,
    isDevKit: has("dev-kit-manifest.json") && hasPrefix("core"),
    hasAiNativeAssets: hasPrefix(".ai-native") || hasPrefix("workflow-adoption-maps") || hasPrefix("baseline-decision-cards"),
    hasGovernance: has("AGENTS.md") || hasPrefix("docs") || hasPrefix(".github/workflows") || hasPrefix("scripts/guard"),
    hasDocs: hasPrefix("docs") || paths.some((item) => /\.md$/i.test(item)),
    hasWorkQueueSignals: hasPrefix("work-queue") || hasPrefix("active-work-threads") || hasPrefix("tasks"),
    hasHookOrCiSignals: hasPrefix(".github/workflows") || hasPrefix(".husky") || has(".pre-commit-config.yaml") || has(".pre-commit-config.yml"),
    hasReleaseSignals: /\b(prod|production|deploy|release|rollback|staging|incident|runbook)\b/i.test(joined),
    hasRiskSignals: /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance)\b/i.test(`${joined}\n${packageText}`),
    hasRunnableSignals: Boolean(packageJson) || has("go.mod") || has("pyproject.toml") || has("Package.swift") || has("build.gradle"),
    hasTestSignals: /\b(test|spec|e2e|playwright|vitest|jest|xctest|junit)\b/i.test(`${joined}\n${packageText}`),
    pathCount: paths.length,
  };
}

function classifyProject(root, exists, git, signals) {
  if (!exists) {
    return {
      state: "UNKNOWN_PROJECT",
      reason: "Target path does not exist.",
      riskLevel: "unknown",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "Unknown",
    };
  }

  if (signals.isDevKit) {
    return {
      state: "DEV_KIT_REPOSITORY",
      reason: "This is the AI Native Dev Kit source repository.",
      riskLevel: git?.isDirty ? "medium" : "low",
      existingUsersAssumed: "No",
      dirty: git?.isDirty ? "Yes" : "No",
    };
  }

  if (git?.isDirty) {
    return {
      state: "DIRTY_WORKTREE_PROJECT",
      reason: "Project has unfinished changes. Do not mix a new task into the same context until reviewed.",
      riskLevel: "high",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "Yes",
    };
  }

  if (signals.hasReleaseSignals || signals.hasRiskSignals) {
    return {
      state: "PRODUCTION_SENSITIVE_PROJECT",
      reason: "Release, data, login, payment, migration, or other risk signals were detected.",
      riskLevel: "high",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "No",
    };
  }

  if (signals.isEmptyish || !signals.hasProjectSignals) {
    return {
      state: "NEW_PROJECT",
      reason: "No strong existing project structure was detected.",
      riskLevel: "low",
      existingUsersAssumed: "No",
      dirty: "No",
    };
  }

  if (signals.hasGovernance || signals.hasAiNativeAssets) {
    return {
      state: "EXISTING_GOVERNED_PROJECT",
      reason: "Existing docs, rules, CI, or AI Native assets were detected.",
      riskLevel: "medium",
      existingUsersAssumed: "Unknown treated as Yes",
      dirty: "No",
    };
  }

  return {
    state: "EXISTING_LIGHT_PROJECT",
    reason: "A project exists, but strong governance signals were not detected.",
    riskLevel: "medium",
    existingUsersAssumed: "Unknown treated as Yes",
    dirty: "No",
  };
}

function deliveryStateFor(project, signals) {
  if (project.state === "UNKNOWN_PROJECT") {
    return { current: "NEEDS_PROJECT_READING", next: "READY_FOR_PLAN" };
  }
  if (project.state === "DIRTY_WORKTREE_PROJECT") {
    return { current: "BLOCKED_BY_DIRTY_WORK", next: "READY_FOR_PLAN" };
  }
  if (project.state === "PRODUCTION_SENSITIVE_PROJECT") {
    return { current: "BLOCKED_BY_RISK", next: "READY_FOR_PLAN" };
  }
  if (project.state === "NEW_PROJECT") {
    return { current: "IDEA_ONLY", next: "READY_FOR_PLAN" };
  }
  if (signals.hasRunnableSignals && signals.hasTestSignals) {
    return { current: "READY_FOR_SELF_TEST", next: "READY_FOR_INTERNAL_TRIAL" };
  }
  if (signals.hasRunnableSignals) {
    return { current: "READY_FOR_LOCAL_BUILD", next: "READY_FOR_SELF_TEST" };
  }
  return { current: "READY_FOR_PLAN", next: "READY_FOR_LOCAL_BUILD" };
}

function questionsFor(project, signals, delivery) {
  const questions = [];
  if (project.existingUsersAssumed !== "No") questions.push("这个项目现在是否已经有人在用？");
  if (project.riskLevel === "high" || signals.hasRiskSignals) questions.push("这次是否涉及登录、支付、数据、发布或迁移？");
  if (project.state === "DIRTY_WORKTREE_PROJECT") questions.push("当前未完成改动是继续、暂停，还是先切换到新任务？");
  questions.push("是否允许我先生成计划，不直接改文件？");
  if (!questions.some((item) => item.includes("先做到"))) {
    questions.push("你希望先做到本地可跑、自己试用，还是上线前检查？");
  }
  const maxQuestions = project.riskLevel === "high" ? 5 : 3;
  return questions.slice(0, maxQuestions);
}

function routingFor(project, signals, delivery) {
  const rows = [];
  if (project.state === "NEW_PROJECT") {
    rows.push(route("New project", "baseline decision + standard baseline", "Start small with basic rules", "Yes"));
  }
  if (project.state === "EXISTING_GOVERNED_PROJECT" || project.state === "EXISTING_LIGHT_PROJECT" || project.state === "PRODUCTION_SENSITIVE_PROJECT") {
    rows.push(route("Existing project", "workflow adoption map + baseline decision", "Read existing rules before changing anything", "Yes"));
  }
  if (project.state === "DIRTY_WORKTREE_PROJECT" || signals.hasWorkQueueSignals) {
    rows.push(route("Interrupted or unfinished work", "work queue", "Understand current and paused work before switching", "Yes"));
  }
  if (signals.hasDocs) {
    rows.push(route("Documents may need review", "document lifecycle", "Mark stale or duplicate docs without deleting them", project.state === "NEW_PROJECT" ? "Later" : "Yes"));
  }
  if (signals.hasHookOrCiSignals || project.state === "PRODUCTION_SENSITIVE_PROJECT") {
    rows.push(route("Automation or CI exists", "hook plan", "Review automatic trigger risk without installing anything", "Yes"));
  }
  if (delivery.current === "READY_FOR_SELF_TEST" || delivery.current === "READY_FOR_INTERNAL_TRIAL" || delivery.current === "READY_FOR_RELEASE_REVIEW") {
    rows.push(route("Near delivery", "launch readiness", "Check whether the project can be tried or reviewed for launch", "Yes"));
  }
  if (rows.length === 0) rows.push(route("Initial guidance", "start + baseline decision", "Read project state and propose a safe plan", "Yes"));
  return rows;
}

function route(situation, internalCapability, userMeaning, runNow) {
  return { situation, internalCapability, userMeaning, runNow };
}

function conclusionFor(project, delivery) {
  const state = plainProjectState(project.state);
  return `I read the project as ${state}. Current delivery state is ${delivery.current}.`;
}

function recommendedNextStep(project, delivery) {
  if (project.state === "DIRTY_WORKTREE_PROJECT") {
    return "先确认当前未完成改动的归属，再决定继续、暂停还是切换任务。";
  }
  if (project.state === "PRODUCTION_SENSITIVE_PROJECT") {
    return "先只读整理现有规则和风险，不直接改代码、发布配置或自动触发器。";
  }
  if (project.state === "NEW_PROJECT") {
    return "先做一个最小可用计划，明确目标用户、核心功能和基础工程规则。";
  }
  if (project.state === "UNKNOWN_PROJECT") {
    return "先确认项目路径或提供项目目录，再做只读判断。";
  }
  return "先生成一份不改文件的计划，说明怎么安全推进到下一次可用检查。";
}

function canContinue(project) {
  if (project.state === "UNKNOWN_PROJECT") return "no";
  if (project.state === "DIRTY_WORKTREE_PROJECT" || project.state === "PRODUCTION_SENSITIVE_PROJECT") return "limited";
  return "limited";
}

function plainSummary(project, delivery) {
  if (project.state === "DIRTY_WORKTREE_PROJECT") {
    return "项目里有未完成改动。现在最安全的是先弄清楚这些改动属于哪个任务，再决定是否继续新工作。";
  }
  if (project.state === "PRODUCTION_SENSITIVE_PROJECT") {
    return "这个项目可能已经接近真实使用或涉及高风险内容。现在应先只读评估，不直接改发布、数据或自动化配置。";
  }
  if (project.state === "NEW_PROJECT") {
    return "这是一个适合从小目标开始的新项目。下一步应先确定第一版要给谁用、解决什么问题、如何验证。";
  }
  if (project.state === "DEV_KIT_REPOSITORY") {
    return "这是 Dev Kit 自身仓库。下一步应按维护流程做计划、验证和记录。";
  }
  return `这个项目可以先进入计划阶段。当前状态是 ${delivery.current}，下一步不要直接写文件，先确认目标和风险。`;
}

function distanceToUsefulUse(project, signals, delivery) {
  return [
    row("Goal clarity", project.state === "NEW_PROJECT" ? "needs confirmation" : "partly clear", "确认这次要服务谁、先做哪条核心路径"),
    row("Project can run locally", signals.hasRunnableSignals ? "unknown" : "not yet", signals.hasRunnableSignals ? "需要实际运行或构建证据" : "需要确认技术栈和本地启动方式"),
    row("Core function complete", "unknown", "需要任务计划和完成证据"),
    row("Tests or checks run", signals.hasTestSignals ? "not run" : "not applicable yet", signals.hasTestSignals ? "需要运行检查并记录结果" : "需要先建立最小验证方式"),
    row("High-risk scope clear", project.riskLevel === "high" ? "needs confirmation" : "unknown", "需要确认登录、支付、数据、发布或迁移风险"),
    row("Can someone else try it", usefulUseState(delivery), "需要达到下一阶段并留下验证证据"),
  ];
}

function row(check, status, missing) {
  return { check, status, missing };
}

function usefulUseState(delivery) {
  if (delivery.current === "READY_FOR_SELF_TEST") return "self-test";
  if (delivery.current === "READY_FOR_INTERNAL_TRIAL") return "internal trial";
  if (delivery.current === "READY_FOR_RELEASE_REVIEW") return "release review";
  return "not yet";
}

function outcomeFor(project, delivery) {
  if (project.state === "UNKNOWN_PROJECT") return "BLOCKED";
  if (delivery.current.startsWith("BLOCKED")) return "NEEDS_HUMAN_DECISION";
  return "GUIDANCE_RECORDED";
}

function plainProjectState(state) {
  const labels = {
    NEW_PROJECT: "a new or not-yet-shaped project",
    EXISTING_LIGHT_PROJECT: "an existing project with light governance",
    EXISTING_GOVERNED_PROJECT: "an existing project with rules already present",
    PRODUCTION_SENSITIVE_PROJECT: "a risk-sensitive existing project",
    DIRTY_WORKTREE_PROJECT: "a project with unfinished changes",
    DEV_KIT_REPOSITORY: "the Dev Kit repository",
    UNKNOWN_PROJECT: "an unreadable or missing project",
  };
  return labels[state] || state;
}

function printHuman(report) {
  console.log("# Workflow Guidance Card");
  console.log("");
  console.log("## Human Decision Summary");
  console.log("");
  console.log(`Conclusion: ${report.humanDecisionSummary.conclusion}`);
  console.log("");
  console.log(`Recommended next step: ${report.humanDecisionSummary.recommendedNextStep}`);
  console.log("");
  console.log(`Can AI continue now: ${report.humanDecisionSummary.canAiContinueNow}`);
  console.log("");
  console.log(`What I need from you: ${report.humanDecisionSummary.needFromHuman}`);
  console.log("");
  console.log(`What happens if you do nothing: ${report.humanDecisionSummary.ifNothing}`);
  console.log("");
  console.log("## Plain Summary");
  console.log("");
  console.log(report.plainSummary);
  console.log("");
  console.log("## Project Reading");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| User mode | \`${report.userMode}\` |`);
  console.log(`| Project state | \`${report.projectReading.projectState}\` |`);
  console.log(`| Existing users assumed | ${report.projectReading.existingUsersAssumed} |`);
  console.log(`| Can write files now | ${report.projectReading.canWriteFilesNow} |`);
  console.log(`| Risk level | ${report.projectReading.riskLevel} |`);
  console.log("");
  console.log("## Delivery Path State");
  console.log("");
  console.log(`\`${report.deliveryPathState.current}\``);
  console.log("");
  console.log(`Next state: \`${report.deliveryPathState.next}\``);
  console.log("");
  console.log("## Recommended Next Step");
  console.log("");
  console.log(report.recommendedNextStep);
  console.log("");
  console.log("## Distance To Useful Use");
  console.log("");
  console.log("| Check | Status | What is missing |");
  console.log("|---|---|---|");
  for (const item of report.distanceToUsefulUse) {
    console.log(`| ${item.check} | ${item.status} | ${item.missing} |`);
  }
  console.log("");
  console.log("## Questions For Human");
  console.log("");
  report.questionsForHuman.forEach((question, index) => {
    console.log(`${index + 1}. ${question}`);
  });
  console.log("");
  if (report.userMode !== "plain") {
    console.log("## Internal Routing");
    console.log("");
    console.log("| Situation | Internal capability | User-facing meaning | Run now |");
    console.log("|---|---|---|---|");
    for (const row of report.internalRouting) {
      console.log(`| ${row.situation} | ${row.internalCapability} | ${row.userMeaning} | ${row.runNow} |`);
    }
    console.log("");
  } else {
    console.log("## Internal Routing");
    console.log("");
    console.log("| Situation | Internal capability | User-facing meaning | Run now |");
    console.log("|---|---|---|---|");
    for (const row of report.internalRouting) {
      console.log(`| ${row.situation} | hidden in plain mode | ${row.userMeaning} | ${row.runNow} |`);
    }
    console.log("");
  }
  console.log("## Boundaries");
  console.log("");
  console.log("- This guidance writes target files: No");
  console.log("- This guidance modifies CI: No");
  console.log("- This guidance installs hooks: No");
  console.log("- This guidance deletes or archives documents: No");
  console.log("- This guidance changes task state: No");
  console.log("- This guidance approves implementation: No");
  console.log("- This guidance approves release or production: No");
  console.log("- This guidance approves security/privacy/compliance/payment/migration decisions: No");
  console.log("");
  console.log("## Outcome");
  console.log("");
  console.log(`\`${report.outcome}\``);
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}
