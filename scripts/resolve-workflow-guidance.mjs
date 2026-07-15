#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs, unknownOptions } from "./lib/args.mjs";
import { gitWorktreeState } from "./lib/git.mjs";
import {
  defaultIgnoredDirs,
  hasProjectSignals,
  walkRelativePaths,
} from "./lib/project-signals.mjs";

const args = parseArgs(process.argv.slice(2));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knownFlags = new Set(["json", "format", "mode", "deep", "intent"]);
const unknown = unknownOptions(args, knownFlags);
const projectRoot = path.resolve(process.cwd(), args._[0] || ".");
const outputFormat = args.json ? "json" : String(args.format || "human");
const userMode = String(args.mode || "plain").toLowerCase();
const deepMode = Boolean(args.deep);
const userIntent = String(args.intent || "").trim();
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

const guidance = buildWorkflowGuidance(projectRoot, userMode, { deep: deepMode, intent: userIntent });

if (outputFormat === "json") {
  console.log(JSON.stringify(guidance, null, 2));
} else {
  printHuman(guidance);
}

function buildWorkflowGuidance(root, mode, options = {}) {
  const exists = fs.existsSync(root);
  const git = exists ? gitWorktreeState(root) : null;
  const paths = exists ? walkRelativePaths(root, ".", {
    maxDepth: 4,
    ignoredDirs: defaultIgnoredDirs,
  }) : [];
  const pathSet = new Set(paths);
  const intent = classifyIntent(options.intent || "");
  const signals = collectSignals(root, exists, pathSet, intent);
  const project = classifyProject(root, exists, git, signals);
  const delivery = deliveryStateFor(project, signals);
  const questions = questionsFor(project, signals, delivery, intent);
  const routing = routingFor(project, signals, delivery, intent);
  const deepOrchestration = options.deep ? buildDeepOrchestration(root, project, signals, delivery, intent) : null;
  const effectiveDelivery = effectiveDeliveryFromDeep(delivery, deepOrchestration);
  const nextStep = deepOrchestration
    ? recommendedNextStepFromDeep(project, effectiveDelivery, deepOrchestration, intent)
    : recommendedNextStep(project, effectiveDelivery);

  return {
    reportType: "WORKFLOW_GUIDANCE_CARD",
    generatedBy: "scripts/resolve-workflow-guidance.mjs",
    generatedAt: new Date().toISOString(),
    projectRoot: root,
    readOnly: true,
    userMode: mode,
    intentUnderstanding: intent,
    humanDecisionSummary: {
      conclusion: conclusionFor(project, effectiveDelivery, deepOrchestration, intent),
      recommendedNextStep: nextStep,
      canAiContinueNow: canContinue(project, effectiveDelivery),
      needFromHuman: questions.length > 0 ? questions.join(" / ") : "No decision needed for read-only guidance.",
      ifNothing: "No files are changed. No CI, hook, document, task state, release, or production behavior is changed.",
    },
    plainSummary: plainSummary(project, effectiveDelivery, intent),
    projectReading: {
      userMode: mode,
      projectState: project.state,
      existingUsersAssumed: project.existingUsersAssumed,
      canWriteFilesNow: "No",
      riskLevel: project.riskLevel,
      reason: project.reason,
    },
    deliveryPathState: {
      current: effectiveDelivery.current,
      next: effectiveDelivery.next,
    },
    recommendedNextStep: nextStep,
    distanceToUsefulUse: distanceToUsefulUse(project, signals, effectiveDelivery),
    questionsForHuman: questions,
    internalRouting: routing,
    deepOrchestration,
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
    outcome: outcomeFor(project, effectiveDelivery),
  };
}

function classifyIntent(rawIntent) {
  const text = String(rawIntent || "").trim();
  const normalized = text.toLowerCase();
  const has = (pattern) => pattern.test(text) || pattern.test(normalized);
  const riskSignals = [];
  const reviewFocus = [];
  let classification = "NOT_PROVIDED";
  let deliveryTarget = "READY_FOR_PLAN";
  let riskLevel = "low";
  let userGoalSummary = "No user intent provided.";

  if (!text) {
    return {
      rawIntent: "",
      classification,
      userGoalSummary,
      riskLevel: "unknown",
      riskSignals,
      reviewFocus,
      deliveryTarget: "NEEDS_PROJECT_READING",
    };
  }

  classification = "GENERAL_CHANGE";
  userGoalSummary = text;

  const patterns = [
    {
      classification: "ADD_PAYMENT_OR_VALUE_TRANSFER",
      pattern: /\b(payment|billing|invoice|refund|checkout|stripe|finance|tax)\b|支付|收款|退款|订单|账单|发票|财务|税务/i,
      risk: "payment/value transfer",
      focus: ["data", "permission", "security/privacy", "release impact"],
      riskLevel: "high",
    },
    {
      classification: "ADD_AUTH_OR_PERMISSION",
      pattern: /\b(auth|login|permission|rbac|role|session|jwt|oauth|tenant|admin)\b|登录|权限|角色|认证|租户|管理员/i,
      risk: "auth/permission",
      focus: ["permission", "security/privacy", "data"],
      riskLevel: "high",
    },
    {
      classification: "DATA_OR_MIGRATION_CHANGE",
      pattern: /\b(database|schema|migration|sql|db|storage|model|api contract)\b|数据库|数据|迁移|表结构|字段|存储|接口/i,
      risk: "data/migration",
      focus: ["data", "verification", "release impact"],
      riskLevel: "high",
    },
    {
      classification: "RELEASE_OR_DEPLOY",
      pattern: /\b(release|deploy|production|launch|rollback|staging|go live)\b|上线|发布|部署|生产|回滚|灰度/i,
      risk: "release/production",
      focus: ["release impact", "verification", "security/privacy"],
      riskLevel: "high",
      deliveryTarget: "READY_FOR_RELEASE_REVIEW",
    },
    {
      classification: "AUTOMATION_OR_HOOK",
      pattern: /\b(hook|ci|workflow|github actions|cron|schedule|automation|auto-fix)\b|自动化|触发器|钩子|定时|流水线/i,
      risk: "automation/hook",
      focus: ["release impact", "existing governance", "verification"],
      riskLevel: "high",
    },
    {
      classification: "EXECUTION_REVIEW_CLOSURE",
      pattern: /\b(done|finish|finished|complete|closure|close|post[- ]?execution|commit|push|handoff result)\b|完成|做完|收口|闭环|复查结果|提交|推送/i,
      risk: "execution closure",
      focus: ["functional", "code", "verification", "debt", "scope boundary"],
      riskLevel: "medium",
    },
    {
      classification: "DOCUMENT_GOVERNANCE",
      pattern: /\b(document|docs|readme|archive|stale|duplicate|source of truth)\b|文档|归档|过期|重复|废弃|清理|准的/i,
      risk: "document lifecycle",
      focus: ["documentation", "existing governance"],
      riskLevel: "medium",
    },
    {
      classification: "TASK_SWITCH_OR_RESUME",
      pattern: /\b(todo|work queue|pause|resume|handoff|switch task|continue)\b|任务|待办|暂停|恢复|接着|继续|切换|交接/i,
      risk: "task continuity",
      focus: ["debt", "existing governance", "verification"],
      riskLevel: "medium",
    },
    {
      classification: "BUG_FIX",
      pattern: /\b(bug|fix|error|failed|failure|crash|broken|regression)\b|修复|报错|错误|失败|崩溃|回归/i,
      risk: "defect repair",
      focus: ["functional", "code", "verification", "debt"],
      riskLevel: "medium",
    },
    {
      classification: "BUILD_NEW_PRODUCT",
      pattern: /\b(new project|from zero|from scratch|build an app|create an app)\b|从零|新项目|新建|搭建|做一个|开发一个/i,
      risk: "new product scope",
      focus: ["baseline", "functional", "verification"],
      riskLevel: "low",
    },
    {
      classification: "ADD_FEATURE",
      pattern: /\b(feature|add|implement|build|create)\b|新增|增加|加一个|实现|开发/i,
      risk: "feature scope",
      focus: ["functional", "code", "verification"],
      riskLevel: "medium",
    },
  ];

  for (const item of patterns) {
    if (has(item.pattern)) {
      classification = item.classification;
      riskSignals.push(item.risk);
      reviewFocus.push(...item.focus);
      riskLevel = item.riskLevel;
      if (item.deliveryTarget) deliveryTarget = item.deliveryTarget;
      break;
    }
  }

  return {
    rawIntent: text,
    classification,
    userGoalSummary,
    riskLevel,
    riskSignals: [...new Set(riskSignals)],
    reviewFocus: [...new Set(reviewFocus)],
    deliveryTarget,
  };
}

function collectSignals(root, exists, pathSet, intent) {
  const paths = [...pathSet];
  const joined = paths.join("\n");
  const packageJson = readJsonIfExists(path.join(root, "package.json"));
  const packageText = JSON.stringify({
    dependencies: packageJson?.dependencies || {},
    devDependencies: packageJson?.devDependencies || {},
    scripts: packageJson?.scripts || {},
  });
  const intentText = [
    intent.rawIntent,
    intent.classification,
    ...(intent.riskSignals || []),
    ...(intent.reviewFocus || []),
  ].join("\n");
  const allText = `${joined}\n${packageText}\n${intentText}`;
  const has = (rel) => pathSet.has(rel) || fs.existsSync(path.join(root, rel));
  const hasPrefix = (prefix) => paths.some((item) => item === prefix || item.startsWith(`${prefix}/`));

  return {
    exists,
    hasProjectSignals: exists ? hasProjectSignals(root) : false,
    isEmptyish: exists && paths.filter((item) => !item.startsWith(".git/")).length <= 3,
    isIntentOS: has("intentos-manifest.json") && hasPrefix("core"),
    hasIntentOSAssets: hasPrefix(".intentos") || hasPrefix("workflow-adoption-maps") || hasPrefix("baseline-decision-cards"),
    hasGovernance: ["AGENTS.md", "agent.md", ".agent.md"].some(has) || hasPrefix("docs") || hasPrefix(".github/workflows") || hasPrefix("scripts/guard"),
    hasDocs: hasPrefix("docs") || paths.some((item) => /\.md$/i.test(item)),
    hasWorkQueueSignals: hasPrefix("work-queue") || hasPrefix("active-work-threads") || hasPrefix("tasks"),
    hasHookOrCiSignals: hasPrefix(".github/workflows") || hasPrefix(".husky") || has(".pre-commit-config.yaml") || has(".pre-commit-config.yml"),
    hasReleaseSignals: /\b(prod|production|deploy|release|rollback|staging|incident|runbook)\b/i.test(joined),
    hasIntent: intent.classification !== "NOT_PROVIDED",
    intentRiskLevel: intent.riskLevel,
    hasPaymentIntent: intent.classification === "ADD_PAYMENT_OR_VALUE_TRANSFER",
    hasAuthIntent: intent.classification === "ADD_AUTH_OR_PERMISSION",
    hasDataIntent: intent.classification === "DATA_OR_MIGRATION_CHANGE",
    hasReleaseIntent: intent.classification === "RELEASE_OR_DEPLOY",
    hasDocumentIntent: intent.classification === "DOCUMENT_GOVERNANCE",
    hasTaskSwitchIntent: intent.classification === "TASK_SWITCH_OR_RESUME",
    hasAutomationIntent: intent.classification === "AUTOMATION_OR_HOOK",
    hasExecutionClosureIntent: intent.classification === "EXECUTION_REVIEW_CLOSURE",
    hasBugFixIntent: intent.classification === "BUG_FIX",
    hasNewProductIntent: intent.classification === "BUILD_NEW_PRODUCT",
    hasRiskSignals: /\b(auth|login|permission|rbac|payment|billing|finance|tax|migration|database|schema|privacy|security|compliance|production|release|deploy|hook|ci)\b/i.test(allText),
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

  if (signals.isIntentOS) {
    return {
      state: "INTENTOS_REPOSITORY",
      reason: "This is the IntentOS source repository.",
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

  if (signals.hasGovernance || signals.hasIntentOSAssets) {
    return {
      state: "EXISTING_GOVERNED_PROJECT",
      reason: "Existing docs, rules, CI, or IntentOS assets were detected.",
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

function questionsFor(project, signals, delivery, intent) {
  const questions = [];
  if (intent.classification === "NOT_PROVIDED") questions.push("这次你想先推进什么目标？");
  if (project.state === "DIRTY_WORKTREE_PROJECT") questions.push("当前未完成改动是继续、暂停，还是先切换到新任务？");
  return questions.slice(0, 1);
}

function routingFor(project, signals, delivery, intent) {
  const rows = [];
  if (project.state === "NEW_PROJECT" || signals.hasNewProductIntent) {
    rows.push(route("New project", "baseline decision + standard baseline", "Start small with basic rules", "Yes"));
  }
  if (project.state === "EXISTING_GOVERNED_PROJECT" || project.state === "EXISTING_LIGHT_PROJECT" || project.state === "PRODUCTION_SENSITIVE_PROJECT") {
    rows.push(route("Existing project", "workflow adoption map + baseline decision", "Read existing rules before changing anything", "Yes"));
  }
  if (project.state === "DIRTY_WORKTREE_PROJECT" || signals.hasWorkQueueSignals || signals.hasTaskSwitchIntent) {
    rows.push(route("Interrupted or unfinished work", "work queue", "Understand current and paused work before switching", "Yes"));
  }
  if (signals.hasDocs || signals.hasDocumentIntent) {
    rows.push(route("Documents may need review", "document lifecycle", "Mark stale or duplicate docs without deleting them", project.state === "NEW_PROJECT" ? "Later" : "Yes"));
  }
  if (signals.hasReleaseIntent) {
    rows.push(route("Release path requested", "release guide", "Use one launch entry before adapter, launch view, approval, or execution planning", "Yes"));
  }
  if (signals.hasHookOrCiSignals || project.state === "PRODUCTION_SENSITIVE_PROJECT" || signals.hasAutomationIntent || signals.hasReleaseIntent) {
    rows.push(route("Automation or CI exists", "hook plan", "Review automatic trigger risk without installing anything", "Yes"));
  }
  if (signals.hasPaymentIntent || signals.hasAuthIntent || signals.hasDataIntent || signals.hasBugFixIntent || intent.classification === "ADD_FEATURE") {
    rows.push(route("Intent needs scoped review", "review surface", "Check the right risk areas before execution", "Yes"));
  }
  if (project.state === "DIRTY_WORKTREE_PROJECT" || signals.hasExecutionClosureIntent) {
    rows.push(route("Execution needs closure", "execution closure", "Summarize changed scope, verification, debt, and commit readiness without approving commit", "Yes"));
  }
  if (delivery.current === "READY_FOR_SELF_TEST" || delivery.current === "READY_FOR_INTERNAL_TRIAL" || delivery.current === "READY_FOR_RELEASE_REVIEW") {
    rows.push(route("Near delivery", "launch readiness", "Check whether the project can be tried or reviewed for launch", "Yes"));
  }
  if (rows.length === 0) rows.push(route("Initial guidance", "start + baseline decision", "Read project state and propose a safe plan", "Yes"));
  return rows;
}

function buildDeepOrchestration(root, project, signals, delivery, intent) {
  const selected = selectDeepCapabilities(project, signals, delivery, intent);
  const skipped = deepCapabilities()
    .filter((capability) => !selected.some((item) => item.id === capability.id))
    .map((capability) => ({
      id: capability.id,
      userMeaning: capability.userMeaning,
      reason: capability.skipReason(project, signals, delivery, intent),
    }));
  const results = selected.map((capability) => runDeepCapability(root, capability, intent));
  const summaries = results.map((result) => summarizeDeepCapability(result));
  const failures = results
    .filter((result) => result.status !== "PASS")
    .map((result) => ({
      id: result.id,
      userMeaning: result.userMeaning,
      status: result.status,
      reason: result.error || "No result returned.",
    }));

  return {
    enabled: true,
    mode: "selective-read-only",
    intentAware: intent.classification !== "NOT_PROVIDED",
    intentClassification: intent.classification,
    selectedCapabilities: selected.map((capability) => capability.id),
    skippedCapabilities: skipped,
    summaries,
    failures,
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
  };
}

function effectiveDeliveryFromDeep(delivery, orchestration) {
  const deliverySummary = orchestration?.summaries?.find((item) => item.id === "delivery-path");
  const match = deliverySummary?.signal?.match(/\b([A-Z_]+)\s*->\s*([A-Z_]+)\b/);
  if (!match) return delivery;
  return { current: match[1], next: match[2] };
}

function deepCapabilities() {
  return [
    {
      id: "baseline-decision",
      script: "resolve-guided-baseline-selection.mjs",
      userMeaning: "选择新项目需要的基础规则",
      shouldRun: (project, signals) => project.state === "NEW_PROJECT" || project.state === "UNKNOWN_PROJECT" || signals.hasNewProductIntent,
      skipReason: () => "不是新项目入口，暂不需要先做基线选择。",
    },
    {
      id: "workflow-map",
      script: "resolve-existing-workflow.mjs",
      userMeaning: "先读清楚已有项目规则",
      shouldRun: (project, signals) => [
        "EXISTING_LIGHT_PROJECT",
        "EXISTING_GOVERNED_PROJECT",
        "PRODUCTION_SENSITIVE_PROJECT",
        "DIRTY_WORKTREE_PROJECT",
      ].includes(project.state) || signals.hasReleaseIntent,
      skipReason: () => "当前不是需要接入已有项目规则的场景。",
    },
    {
      id: "review-surface",
      script: "resolve-review-surface.mjs",
      acceptsIntent: true,
      userMeaning: "判断这次工作完成后要检查哪些方面",
      shouldRun: () => true,
      skipReason: () => "始终应选择审查面。",
    },
    {
      id: "delivery-path",
      script: "resolve-delivery-path.mjs",
      acceptsIntent: true,
      userMeaning: "判断离可用还差多远",
      shouldRun: () => true,
      skipReason: () => "始终应判断交付路径。",
    },
    {
      id: "release-guide",
      script: "resolve-release-guide.mjs",
      acceptsIntent: true,
      userMeaning: "把上线目标收敛成一张发布引导卡",
      shouldRun: (project, signals) => signals.hasReleaseIntent || project.state === "PRODUCTION_SENSITIVE_PROJECT",
      skipReason: () => "未发现上线、发布或生产环境目标。",
    },
    {
      id: "work-queue",
      script: "resolve-work-queue.mjs",
      userMeaning: "确认当前任务、暂停任务和待办",
      shouldRun: (project, signals) => project.state === "DIRTY_WORKTREE_PROJECT" || signals.hasWorkQueueSignals || signals.hasTaskSwitchIntent,
      skipReason: () => "未发现明显的暂停任务、任务队列或未完成工作信号。",
    },
    {
      id: "debt-handoff",
      script: "resolve-debt-handoff.mjs",
      acceptsIntent: true,
      userMeaning: "判断这次是否需要记录债务或交接上下文",
      shouldRun: (project, signals) => project.state === "DIRTY_WORKTREE_PROJECT" || signals.hasTaskSwitchIntent || signals.hasBugFixIntent,
      skipReason: () => "未发现明显的修复、暂停、切换或交接信号。",
    },
    {
      id: "execution-closure",
      script: "resolve-execution-closure.mjs",
      acceptsIntent: true,
      userMeaning: "判断本次执行是否可以收口、是否缺验证、是否能进入提交审查",
      shouldRun: (project, signals) => project.state === "DIRTY_WORKTREE_PROJECT" || signals.hasExecutionClosureIntent,
      skipReason: () => "未发现执行完成、提交、推送、收口或脏工作区信号。",
    },
    {
      id: "doc-lifecycle",
      script: "resolve-document-lifecycle.mjs",
      userMeaning: "判断文档是否可能过期、重复或需要归档建议",
      shouldRun: (project, signals) => signals.hasDocumentIntent || (project.state !== "NEW_PROJECT" && signals.hasDocs),
      skipReason: () => "当前没有足够文档信号，或新项目阶段暂不优先处理文档生命周期。",
    },
    {
      id: "hook-policy",
      script: "resolve-hook-policy.mjs",
      userMeaning: "判断自动触发和 CI 相关规则是否需要先定边界",
      shouldRun: (project, signals) => project.state === "PRODUCTION_SENSITIVE_PROJECT" || signals.hasHookOrCiSignals || signals.hasAutomationIntent || signals.hasReleaseIntent,
      skipReason: () => "未发现明显的 CI、hook 或自动触发风险信号。",
    },
  ];
}

function selectDeepCapabilities(project, signals, delivery, intent) {
  return deepCapabilities().filter((capability) => capability.shouldRun(project, signals, delivery, intent));
}

function runDeepCapability(root, capability, intent) {
  const scriptPath = path.join(__dirname, capability.script);
  if (!fs.existsSync(scriptPath)) {
    return {
      id: capability.id,
      userMeaning: capability.userMeaning,
      status: "SKIPPED",
      error: `Missing script ${capability.script}`,
    };
  }

  const childArgs = [scriptPath, root, "--json"];
  if (capability.acceptsIntent && intent.rawIntent) childArgs.push("--intent", intent.rawIntent);
  const result = spawnSync(process.execPath, childArgs, {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 12,
  });

  if (result.status !== 0) {
    return {
      id: capability.id,
      userMeaning: capability.userMeaning,
      status: "FAIL",
      error: (result.stderr || result.stdout || "Resolver failed.").trim(),
    };
  }

  try {
    return {
      id: capability.id,
      userMeaning: capability.userMeaning,
      status: "PASS",
      report: JSON.parse(result.stdout),
    };
  } catch (error) {
    return {
      id: capability.id,
      userMeaning: capability.userMeaning,
      status: "FAIL",
      error: `Resolver JSON invalid: ${error.message}`,
    };
  }
}

function summarizeDeepCapability(result) {
  if (result.status !== "PASS") {
    return {
      id: result.id,
      userMeaning: result.userMeaning,
      status: result.status,
      plainFinding: "读取失败，需要先修复这个只读检查。",
      nextAction: result.error || "Review resolver output.",
      readOnly: true,
    };
  }

  const report = result.report;
  const summary = {
    id: result.id,
    userMeaning: result.userMeaning,
    status: "PASS",
    reportType: report.reportType || "UNKNOWN",
    plainFinding: report.humanDecisionSummary?.conclusion || "已完成只读判断。",
    nextAction: report.humanDecisionSummary?.recommendedChoice
      || report.humanDecisionSummary?.recommendedNextStep
      || report.nextSafeAction
      || "按只读建议进入下一步。",
    readOnly: report.readOnly !== false,
  };

  if (result.id === "baseline-decision") {
    summary.signal = report.recommendedBaselineLevel?.level || report.recommendedBaselineLevel?.userLabel || "unknown";
    summary.plainFinding = `建议的基础规则档位是 ${summary.signal}。`;
    summary.nextAction = "Codex先从项目证据和产品目标判断项目类型、平台与档位，再配置相应基线。";
  }
  if (result.id === "workflow-map") {
    summary.signal = report.adapterMode || report.classification?.projectState || "unknown";
    summary.plainFinding = "已先读已有项目规则，避免直接覆盖现有治理。";
    summary.nextAction = "先按已有规则做映射，再决定是否接入新流程。";
  }
  if (result.id === "review-surface") {
    summary.signal = `${Array.isArray(report.selectedReviewSurfaces) ? report.selectedReviewSurfaces.length : 0} review surfaces`;
    summary.plainFinding = `已选出 ${Array.isArray(report.selectedReviewSurfaces) ? report.selectedReviewSurfaces.length : 0} 个需要复查的方面。`;
    summary.nextAction = "Codex在执行前选定审查面，执行后逐项验证并关闭。";
  }
  if (result.id === "delivery-path") {
    summary.signal = `${report.deliveryPathState?.currentState || "unknown"} -> ${report.deliveryPathState?.nextTargetState || "unknown"}`;
    summary.plainFinding = `当前交付状态是 ${report.deliveryPathState?.currentState || "unknown"}，下一步目标是 ${report.deliveryPathState?.nextTargetState || "unknown"}。`;
    summary.nextAction = "先补齐下一阶段所需证据。";
  }
  if (result.id === "release-guide") {
    summary.signal = report.humanSummary?.guideState || report.outcome || "unknown";
    summary.plainFinding = `上线引导状态是 ${summary.signal}。`;
    summary.nextAction = "先按 Release Guide 补齐发布目标、审批、证据和人工执行边界。";
  }
  if (result.id === "work-queue") {
    summary.signal = `${report.currentTaskCount || 0} current / ${Array.isArray(report.pausedTasks) ? report.pausedTasks.length : 0} paused`;
    summary.plainFinding = `发现 ${report.currentTaskCount || 0} 个当前任务、${Array.isArray(report.pausedTasks) ? report.pausedTasks.length : 0} 个暂停任务、${Array.isArray(report.backlogItems) ? report.backlogItems.length : 0} 个待办。`;
    summary.nextAction = "Codex先核对当前主线与暂停任务；只有业务优先级无法推断时才询问用户。";
  }
  if (result.id === "debt-handoff") {
    summary.signal = report.debtRegister?.[0]?.level || "unknown";
    summary.plainFinding = `债务/交接判断是 ${summary.signal}。`;
    summary.nextAction = "如有遗留问题，先记录验证方式和下次恢复点。";
  }
  if (result.id === "execution-closure") {
    summary.signal = report.commitReadiness?.closureState || "unknown";
    summary.plainFinding = `执行收口状态是 ${summary.signal}。`;
    summary.nextAction = "先关闭验证、范围和债务，再决定是否进入提交审查。";
  }
  if (result.id === "doc-lifecycle") {
    summary.signal = `${Array.isArray(report.documentInventory) ? report.documentInventory.length : 0} docs scanned`;
    summary.plainFinding = `扫描到 ${Array.isArray(report.documentInventory) ? report.documentInventory.length : 0} 份文档，可能有过期、重复或归档候选。`;
    summary.nextAction = "只提出归档建议，不删除、不移动文档。";
  }
  if (result.id === "hook-policy") {
    summary.signal = report.policyState?.policyState || "unknown";
    summary.plainFinding = "已检查自动触发和 CI 相关规则，当前不能安装 hook 或改 CI。";
    summary.nextAction = "如需新增自动化，Codex先界定允许范围、验证与回滚；仅在准备产生真实外部影响时请求具体同意。";
  }

  return summary;
}

function recommendedNextStepFromDeep(project, delivery, orchestration, intent) {
  if (orchestration.failures.length > 0) {
    return "先修复只读编排里失败的检查，再决定是否进入计划或实现。";
  }

  if (intent.classification === "RELEASE_OR_DEPLOY") {
    return "先走 Release Guide：把发布目标、审批、证据、人工执行边界和下一步安全动作放在一张卡里确认。";
  }

  if (intent.riskLevel === "high") {
    return "Codex先从证据推导高风险边界和审查面，再生成最小可验证计划。";
  }

  if (intent.classification === "DOCUMENT_GOVERNANCE") {
    return "先生成文档生命周期判断和归档建议，不移动、不删除文档。";
  }

  if (intent.classification === "TASK_SWITCH_OR_RESUME") {
    return "Codex先核对当前任务、暂停任务和恢复点；只有业务优先级无法推断时才询问用户。";
  }

  if (intent.classification === "EXECUTION_REVIEW_CLOSURE") {
    return "先做执行后收口，确认改动范围、验证证据和债务，再决定是否进入提交审查。";
  }

  const workQueue = orchestration.summaries.find((item) => item.id === "work-queue");
  if (workQueue?.signal && !workQueue.signal.startsWith("0 current")) {
    return "Codex先核对当前主线任务和暂停任务；只有业务优先级无法推断时才询问用户。";
  }

  const deliverySummary = orchestration.summaries.find((item) => item.id === "delivery-path");
  if (deliverySummary?.signal?.includes("BLOCKED")) {
    return "先处理交付路径里的阻塞项，不直接进入实现或发布。";
  }

  const reviewSurface = orchestration.summaries.find((item) => item.id === "review-surface");
  if (reviewSurface) {
    return "Codex按这张卡校验目标、风险和审查面，再进入最小可验证的一步。";
  }

  return recommendedNextStep(project, delivery);
}

function route(situation, internalCapability, userMeaning, runNow) {
  return { situation, internalCapability, userMeaning, runNow };
}

function conclusionFor(project, delivery, orchestration = null, intent) {
  const state = plainProjectState(project.state);
  const intentPart = intent?.classification && intent.classification !== "NOT_PROVIDED"
    ? ` Intent is ${intent.classification}.`
    : "";
  if (orchestration?.enabled) {
    return `I read the project as ${state}.${intentPart} Deep guide checked ${orchestration.summaries.length} read-only area(s). Current delivery state is ${delivery.current}.`;
  }
  return `I read the project as ${state}.${intentPart} Current delivery state is ${delivery.current}.`;
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

function plainSummary(project, delivery, intent) {
  const intentPrefix = intent?.classification && intent.classification !== "NOT_PROVIDED"
    ? `这次目标是：${intent.userGoalSummary}。`
    : "";
  if (project.state === "DIRTY_WORKTREE_PROJECT") {
    return `${intentPrefix}项目里有未完成改动。现在最安全的是先弄清楚这些改动属于哪个任务，再决定是否继续新工作。`;
  }
  if (project.state === "PRODUCTION_SENSITIVE_PROJECT") {
    return `${intentPrefix}这个项目可能已经接近真实使用或涉及高风险内容。现在应先只读评估，不直接改发布、数据或自动化配置。`;
  }
  if (project.state === "NEW_PROJECT") {
    return `${intentPrefix}这是一个适合从小目标开始的新项目。下一步应先确定第一版要给谁用、解决什么问题、如何验证。`;
  }
  if (project.state === "INTENTOS_REPOSITORY") {
    return `${intentPrefix}这是 IntentOS 自身仓库。下一步应按维护流程做计划、验证和记录。`;
  }
  return `${intentPrefix}这个项目可以先进入计划阶段。当前状态是 ${delivery.current}，下一步不要直接写文件，先确认目标和风险。`;
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
    INTENTOS_REPOSITORY: "the IntentOS repository",
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
  console.log("## User Intent");
  console.log("");
  console.log("| Field | Value |");
  console.log("|---|---|");
  console.log(`| Provided intent | ${sanitizeTableCell(report.intentUnderstanding.rawIntent || "Not provided")} |`);
  console.log(`| Intent classification | \`${report.intentUnderstanding.classification}\` |`);
  console.log(`| Intent risk level | ${report.intentUnderstanding.riskLevel} |`);
  console.log(`| Review focus | ${sanitizeTableCell((report.intentUnderstanding.reviewFocus || []).join(", ") || "N/A")} |`);
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
  if (report.deepOrchestration?.enabled) {
    console.log(report.userMode === "plain" ? "## What I Checked" : "## Deep Orchestration");
    console.log("");
    console.log("| Area | Status | Finding | Next action |");
    console.log("|---|---|---|---|");
    for (const item of report.deepOrchestration.summaries) {
      const area = report.userMode === "plain" ? item.userMeaning : item.id;
      const finding = report.userMode === "plain" ? item.plainFinding : `${item.signal || ""} ${item.plainFinding}`.trim();
      console.log(`| ${area} | ${item.status} | ${sanitizeTableCell(finding)} | ${sanitizeTableCell(item.nextAction)} |`);
    }
    if (report.deepOrchestration.summaries.length === 0) {
      console.log("| No extra area selected | PASS | Nothing else was needed for this read-only guidance. | Keep the plan small. |");
    }
    console.log("");
    if (report.userMode !== "plain") {
      console.log("Selected capabilities:");
      console.log("");
      for (const capability of report.deepOrchestration.selectedCapabilities) {
        console.log(`- \`${capability}\``);
      }
      console.log("");
    }
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

function sanitizeTableCell(value) {
  return String(value || "").replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}
