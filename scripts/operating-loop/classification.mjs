import fs from "node:fs";
import path from "node:path";
import { hasProjectSignals } from "../lib/project-signals.mjs";

export function requiresActiveIntentOSOperation(operation) {
  return new Set(["CONTINUE_TASK", "RESUME_TASK"]).has(operation);
}

export function isReadOnlyProjectOperation(operation) {
  return new Set(["CHECK_STATUS", "FINISH_TASK", "PREPARE_RELEASE"]).has(operation);
}

export function entryAllowsOperation(trust, operation) {
  if (!trust?.entry_state) return false;
  if (trust.entry_state === "BLOCKED_REPAIR_REQUIRED") return false;
  if (["DISCUSS_ONLY", "ADOPT_PROJECT"].includes(operation)) return true;
  if (isReadOnlyProjectOperation(operation)) {
    return ["READY_FOR_READ_ONLY_ASSESSMENT", "READY_FOR_INTENTOS_OPERATION"].includes(trust.entry_state);
  }
  if (operation === "START_PROJECT") {
    return ["READY_FOR_CONTROLLED_SETUP", "READY_FOR_INTENTOS_OPERATION"].includes(trust.entry_state);
  }
  if (requiresActiveIntentOSOperation(operation)) return trust.entry_state === "READY_FOR_INTENTOS_OPERATION";
  return true;
}

export function statusRequestRequiresCurrentTask(value) {
  const text = String(value || "").toLowerCase();
  const explicitTaskStatus = /(?:任务|工作项|需求|功能).{0,16}(?:状态|进度|做到哪|完成情况)|(?:状态|进度|做到哪|完成情况).{0,16}(?:任务|工作项|需求|功能)|\b(?:task|work item|requirement|feature)\b.{0,24}\b(?:status|progress|completion)\b|\b(?:status|progress|completion)\b.{0,24}\b(?:task|work item|requirement|feature)\b/.test(text);
  if (explicitTaskStatus) return true;
  const explicitProjectInformation = /(?:项目|工程|仓库).{0,12}(?:状态|概况|信息|结构|接入情况)|\b(?:project|repository|repo)\b.{0,16}\b(?:status|overview|information|structure|setup)\b/.test(text);
  if (explicitProjectInformation) return false;
  return /(?:当前|现在|目前).{0,10}(?:进度|做到哪|完成情况)|(?:进度|做到哪|完成情况).{0,8}(?:如何|怎样|是什么|吗|\?|？)|\bwhere are we\b|\bwhat(?:'s| is) the (?:current )?progress\b/.test(text);
}

export function operationFor(value, projectEntry, projectRoot) {
  const text = String(value || "").toLowerCase();
  const existingEntry = ["EXISTING_PROJECT_ENTRY", "GOVERNED_PROJECT_ENTRY", "PRODUCTION_SENSITIVE_ENTRY"].includes(projectEntry);
  const negatedNewProject = /(?:不是|并非|不属于)新项目|\b(?:not|isn['’]?t)\s+(?:a\s+)?new project\b/.test(text);
  const explicitNewProject = !negatedNewProject && /新项目|从\s*0|从零|\bnew project\b|\bfrom scratch\b/.test(text);
  const implementationSignal = /(?:新增|增加|修改|调整|实现|开发|修复|重构|加入|添加)|\b(?:add|change|implement|build|fix|refactor|create)\b/.test(text);
  const implementationAlreadyComplete = /(?:已经|已|现已).{0,10}(?:完成|实现|修复|改好|做好)|(?:实现|修复|修改|开发).{0,10}(?:已经|已)?(?:完成|完毕|结束)|\b(?:implementation|fix|change|development)\s+(?:is\s+|has\s+been\s+)?(?:done|complete|completed|finished)\b|\b(?:implemented|fixed|completed)\b/.test(text);
  const releaseImperative = hasUnnegatedReleaseImperative(text);
  const adoptionSignal = /(?:接入|采用|迁移到|切换到|整合|按照|按).{0,20}intentos|intentos.{0,20}(?:接入|采用|迁移|工作模式|工作)|\b(?:adopt|migrate|connect).{0,24}\bintentos\b|\bwork under intentos\b/.test(text);
  const globalNoWrite = /\bdo not (?:implement|change|edit|write)(?:\s+(?:anything|any files?|code|the project))?\b|不要(?:实现|改代码|写代码|修改任何|改任何)/.test(text);
  const explicitReadOnlyDiscussion = /^\s*(?:\b(?:just|only)\s+(?:discuss|review|talk|look|read)\b|只(?:讨论|沟通|评审|看|查看|读)(?:一下)?(?:这个|这份|该|下)?(?:内容|方案|文件|结果)?|先(?:讨论|沟通|看|查看|读)(?:一下)?(?:这个|这份|该|下)?(?:内容|方案|文件|结果)?)/;
  if (globalNoWrite || (!implementationSignal && explicitReadOnlyDiscussion.test(text))) return "DISCUSS_ONLY";
  if (releaseImperative && implementationSignal && !implementationAlreadyComplete) return "CONTINUE_TASK";
  if (releaseImperative) return "PREPARE_RELEASE";
  if (adoptionSignal) return "ADOPT_PROJECT";
  if (/\bresume\b|\bcontinue the paused\b|恢复.{0,12}(?:暂停|任务)|继续.{0,12}暂停/.test(text)) return "RESUME_TASK";
  if (/(?:任务|这个|这项|工作).{0,12}(?:做完|完成).{0,6}(?:吗|没有|了没|\?|？)|(?:能否|是否|可以).{0,12}(?:算|视为|认为)?(?:做完|完成|收口)|\b(?:is|can|has).{0,24}(?:done|finished|complete|close[ -]?out)\b/.test(text)) return "FINISH_TASK";
  if (implementationSignal && /(?:检查|查看).{0,12}(?:进度|状态)|\b(?:check|show|review).{0,24}\b(?:status|progress)\b/.test(text)) return "CONTINUE_TASK";
  if (/(?:查看|检查|告诉我|当前|现在|请问).{0,20}(?:进度|做到哪|完成情况|任务状态|项目状态)|(?:进度|任务状态|项目状态).{0,8}(?:如何|怎样|是什么|吗|\?|？)|\b(?:check|show|review|what is|where are we).{0,24}\b(?:status|progress)\b/.test(text)) return "CHECK_STATUS";
  const startSignal = explicitNewProject
    || /\bbuild.{0,40}from scratch\b|\bi want to build\b|\bstart this project\b|^\s*(?:please\s+)?(?:build|create|develop|make|start)\s+(?:me\s+)?(?:an?\s+)?[^\n]{0,48}\b(?:app|application|website|site|system|service|tool)\b|(?:我想|帮我|请).{0,8}(?:创建|搭建|开发|做一个).{0,24}(?:app|应用|网站|系统)(?:\s|$|[，。,.!?！？])/.test(text);
  if (startSignal) return existingEntry && !explicitNewProject ? "CONTINUE_TASK" : "START_PROJECT";
  if (projectEntry === "NEW_PROJECT_ENTRY") {
    return fs.existsSync(path.join(projectRoot, ".intentos", "version.json")) ? "CONTINUE_TASK" : "START_PROJECT";
  }
  return "CONTINUE_TASK";
}

export function hasUnnegatedReleaseImperative(value) {
  const text = maskNegatedReleaseActions(String(value || "").toLowerCase());
  const englishImperative = [
    /(?:^|[.!?;]\s*|\b(?:and|then|please|now|immediately|directly|formally|also|next)\s+)(?:please\s+)?(?:deploy|publish|release)\b/,
    /\b(?:can|could|would|will)\s+you\s+(?:please\s+)?(?:deploy|publish|release)\b/,
    /\b(?:i|we)\s+(?:want|need|would like)\s+(?:you\s+)?to\s+(?:deploy|publish|release)\b/,
    /\b(?:help\s+me\s+|go\s+ahead\s+and\s+)?(?:deploy|publish|release)\s+(?:it|this|that|the|our|my|current|version|build|app|application|site|website|service|project|package|artifact|to|into|on|now|today|production|staging|preview)\b/,
    /\b(?:prepare|start|run|perform|execute|proceed\s+with)\s+(?:the\s+|a\s+)?(?:release|deployment|publication)\b/,
  ];
  if (englishImperative.some((pattern) => pattern.test(text))) return true;

  return [
    /(?:^|[，。；！？,;]\s*)(?:请|帮我|现在|立即|立刻|直接|正式)?\s*(?:发布|上线|部署|提交审核)(?:\s|$|[，。；！？,;]|到|至|当前|这个|本次|该|新|版本|构建|应用|网站|服务|项目|功能|后端|前端|小程序|生产|测试|预览|内部|灰度|候选)/,
    /(?:请|帮我|现在|立即|立刻|直接|正式|准备|开始|执行|安排|继续|然后|并且|并|再|后).{0,6}(?:发布|上线|部署|提交审核)(?:\s|$|[，。；！？,;]|到|至|当前|这个|本次|该|新|版本|构建|应用|网站|服务|项目|功能|后端|前端|小程序|生产|测试|预览|内部|灰度|候选)/,
    /(?:发布|上线|部署)(?:到|至)(?:生产|测试|预览|正式|线上|暂存|staging|production)/,
  ].some((pattern) => pattern.test(text));
}

export function maskNegatedReleaseActions(value) {
  return String(value || "")
    .replace(/\b(?:do\s+not|don['’]?t|never|not\s+ready\s+to|without)\s+(?:ever\s+)?(?:deploy|publish|release)(?:ment)?\b/g, " ")
    .replace(/(?:不要|别|勿|暂不|先不|不能|不可|不再|无需).{0,6}(?:发布|上线|部署|提交审核)/g, " ");
}

export function projectEntryFor(projectState, root, tags = [], projectEntryOrigin = "UNKNOWN_PROJECT_ORIGIN", projectFacts = null) {
  const lifecycleState = String(projectFacts?.lifecycle?.state || "UNKNOWN");
  const hasCurrentLifecycleProjection = lifecycleState !== "UNKNOWN";
  if (lifecycleState === "PRODUCTION_ACTIVE") return "PRODUCTION_SENSITIVE_ENTRY";
  if (projectEntryOrigin === "NEW_PROJECT") return "NEW_PROJECT_ENTRY";
  if (projectEntryOrigin === "EXISTING_PROJECT") {
    if (tags.includes("GOVERNED_EXISTING_PROJECT")) return "GOVERNED_PROJECT_ENTRY";
    return "EXISTING_PROJECT_ENTRY";
  }
  if (tags.includes("PRODUCTION_GOVERNED_PROJECT") && !hasCurrentLifecycleProjection) return "PRODUCTION_SENSITIVE_ENTRY";
  if (tags.includes("GOVERNED_EXISTING_PROJECT")) return "GOVERNED_PROJECT_ENTRY";
  if (projectState === "NEW_PROJECT" && hasProjectSignals(root)) return "EXISTING_PROJECT_ENTRY";
  const mapping = {
    NEW_PROJECT: "NEW_PROJECT_ENTRY",
    NEW_PROJECT_TARGET: "NEW_PROJECT_ENTRY",
    BOOTSTRAPPED_PROJECT: "NEW_PROJECT_ENTRY",
    PARTIALLY_BOOTSTRAPPED_PROJECT: "EXISTING_PROJECT_ENTRY",
    EXISTING_PROJECT: "EXISTING_PROJECT_ENTRY",
    EXISTING_LIGHT_PROJECT: "EXISTING_PROJECT_ENTRY",
    EXISTING_GOVERNED_PROJECT: "GOVERNED_PROJECT_ENTRY",
    PRODUCTION_SENSITIVE_PROJECT: hasCurrentLifecycleProjection ? "GOVERNED_PROJECT_ENTRY" : "PRODUCTION_SENSITIVE_ENTRY",
    DIRTY_WORKTREE_PROJECT: "EXISTING_PROJECT_ENTRY",
    INTENTOS_REPOSITORY: "INTENTOS_SOURCE_ENTRY",
  };
  return mapping[projectState] || "UNKNOWN_PROJECT_ENTRY";
}

export function readProjectEntryOrigin(root) {
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
