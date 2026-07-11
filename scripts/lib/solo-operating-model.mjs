import { createHash } from "node:crypto";

export const SOLO_OPERATING_MODEL = "ZERO_EXPERIENCE_SOLO_DEVELOPER";

export const userResponsibilityClasses = Object.freeze([
  "NO_USER_ACTION",
  "BUSINESS_FACT_NEEDED",
  "REAL_WORLD_CONSENT_NEEDED",
  "EXTERNAL_FACT_NEEDED",
]);

const businessFactActions = new Set([
  "REQUEST_GOAL",
  "REPAIR_WORK_QUEUE",
  "REVIEW_TASK_SWITCH",
]);

const engineeringPreparationActions = new Set([
  "REVIEW_CURRENT_WORK",
  "PREPARE_WORK_QUEUE",
  "REVIEW_PAUSED_TASK",
  "PREPARE_PROJECT_PLAN",
  "RUN_ADOPTION_REVIEW",
  "INSPECT_TASK_RISK",
  "RESOLVE_ADOPTION_BLOCKER",
  "PREPARE_BUSINESS_RULE_CLOSURE",
  "PREPARE_CHANGE_IMPACT_COVERAGE",
  "PREPARE_EXECUTION_PLAN",
  "PREPARE_VERIFICATION_PLAN",
  "COMPLETE_TASK_GOVERNANCE_PREREQUISITES",
  "PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW",
  "PREPARE_IMPLEMENTATION_REVIEW",
  "COMPLETE_CLOSURE_EVIDENCE",
  "PREPARE_RELEASE_REVIEW",
]);

export function responsibilityDomainsFor(intent, operation = "") {
  const text = String(intent || "").toLowerCase();
  const domains = new Set(["ENGINEERING"]);
  if (/数据|数据库|迁移|删除|清理|恢复|备份|database|\bdb\b|migration|delete|restore|backup/.test(text)) domains.add("DATA_SAFETY");
  if (/权限|角色|认证|授权|登录|auth|permission|role|security|安全/.test(text)) domains.add("ACCESS_CONTROL");
  if (/发布|上线|部署|应用商店|小程序审核|release|deploy|production|app\s*store|play\s*store/.test(text) || operation === "PREPARE_RELEASE") domains.add("RELEASE_SAFETY");
  if (/费用|付费|订阅|账单|成本|charge|billing|paid|cost|subscription/.test(text)) domains.add("COST");
  if (/通知|短信|邮件|推送|真实用户|notification|sms|email|push|real users?/.test(text)) domains.add("REAL_USER_COMMUNICATION");
  if (/云平台|应用商店|小程序平台|provider|dns|external system|app\s*store|play\s*store/.test(text)) domains.add("EXTERNAL_PROVIDER");
  if (/法律|税务|合规|隐私政策|监管|legal|tax|compliance|regulat|privacy policy/.test(text)) domains.add("EXTERNAL_POLICY");
  return [...domains];
}

export function buildSoloOperatingModel(context = {}) {
  const intent = String(context.intent || "").trim();
  const operation = String(context.operation || "");
  const actionCode = String(context.actionCode || "");
  const domains = responsibilityDomainsFor(intent, operation);
  const capabilityCoverage = capabilityCoverageFor(intent, context.selectedProfiles || []);
  const externalFact = domains.includes("EXTERNAL_POLICY");
  const realWorldEffect = hasRealWorldEffect(intent, operation, actionCode);
  const userClass = externalFact
    ? "EXTERNAL_FACT_NEEDED"
    : realWorldEffect
      ? "REAL_WORLD_CONSENT_NEEDED"
      : businessFactActions.has(actionCode)
        ? "BUSINESS_FACT_NEEDED"
        : "NO_USER_ACTION";
  const sourceBlocked = context.sourceFailure === true;
  const discussionOnly = actionCode === "DISCUSS_WITHOUT_EXECUTION" || operation === "DISCUSS_ONLY";
  const canContinueEngineering = !sourceBlocked && !discussionOnly;
  const prompt = promptFor({ userClass, actionCode, intent, language: context.language || "en" });
  const payload = {
    contractVersion: "1.99.0",
    operatingModel: SOLO_OPERATING_MODEL,
    userResponsibilityClass: userClass,
    responsibilityDomains: domains,
    capabilityCoverage,
    actionCode,
    operation,
    sourceBlocked,
    discussionOnly,
  };
  return {
    contractVersion: "1.99.0",
    operatingModel: SOLO_OPERATING_MODEL,
    defaultUserAssumption: "ONE_ZERO_EXPERIENCE_USER",
    userResponsibilityClass: userClass,
    userActionRequiredNow: userActionRequiredNow(userClass, actionCode) ? "Yes" : "No",
    technicalDecisionRequiredFromUser: "No",
    workflowKnowledgeRequiredFromUser: "No",
    internalRoleSelectionRequiredFromUser: "No",
    separateTechnicalApprovalRequired: "No",
    naturalLanguageTaskIntentObserved: intent ? "Yes" : "No",
    routineEngineeringMayProceedAfterInternalGates: canContinueEngineering ? "Yes" : "No",
    unaffectedEngineeringMayContinue: sourceBlocked || discussionOnly ? "No" : "Yes",
    responsibilityDomains: domains,
    domainsArePeople: "No",
    capabilityCoverage,
    publicPrompt: prompt,
    businessFactRule: "Ask only for a real business fact that remains unavailable after project reading.",
    realWorldConsentRule: "Ask only after the safe path, evidence, backup, rollback, cost, interruption, and exact external effect are prepared.",
    externalFactRule: "Keep only the dependent capability or claim disabled; continue unaffected engineering.",
    silenceCountsAsConsent: "No",
    grantsExternalAuthority: "No",
    responsibilityDigest: `sha256:${sha256(JSON.stringify(payload))}`,
  };
}

export function capabilityCoverageFor(intent, selectedProfiles = []) {
  const text = String(intent || "").toLowerCase();
  const capabilities = new Set();
  const profiles = new Set((Array.isArray(selectedProfiles) ? selectedProfiles : []).map(String));
  if (/网页|网站|管理后台|中台|web|dashboard|admin/.test(text)) {
    capabilities.add("WEB_RUNTIME");
    profiles.add(/管理后台|中台|dashboard|admin/.test(text) ? "internal-admin" : "web-app");
  }
  if (/小程序|mini\s*program|wechat/.test(text)) {
    capabilities.add("MINIPROGRAM_RUNTIME");
    profiles.add("wechat-miniprogram");
  }
  if (/ios|iphone|ipad/.test(text)) {
    capabilities.add("IOS_RUNTIME");
    profiles.add("ios-app");
  }
  if (/安卓|android/.test(text)) {
    capabilities.add("ANDROID_RUNTIME");
    profiles.add("android-app");
  }
  if (/接口|后端|服务端|api|backend|server/.test(text)) {
    capabilities.add("BACKEND_API");
    profiles.add("backend-api");
  }
  if (/数据|数据库|存储|记录|预约|订单|合同|database|storage|record|booking|order|contract/.test(text)) capabilities.add("DATA_STORAGE");
  if (/登录|用户|权限|角色|认证|auth|permission|role|account/.test(text)) capabilities.add("AUTH_PERMISSION");
  if (/发布|上线|部署|release|deploy|production/.test(text)) capabilities.add("RELEASE_ROLLBACK");
  if (/监控|日志|告警|可观测|monitor|logging|alert|observab/.test(text)) capabilities.add("OBSERVABILITY");
  if (/支付|退款|转账|金额|payment|refund|transfer|money/.test(text)) capabilities.add("PAYMENT_VALUE_TRANSFER");
  if (/删除|迁移|生产|密钥|合规|法律|税务|delete|migration|production|secret|compliance|legal|tax/.test(text)) capabilities.add("HIGH_RISK_CHANGE");
  if (capabilities.size === 0) capabilities.add("GENERAL_PRODUCT_ENGINEERING");

  const packRecommendations = new Set(["environment-standard"]);
  for (const profile of profiles) {
    if (profile === "web-app") packRecommendations.add("web-runtime-standard");
    if (profile === "internal-admin") packRecommendations.add("internal-admin-standard");
    if (profile === "wechat-miniprogram") packRecommendations.add("miniprogram-runtime-standard");
    if (profile === "ios-app") packRecommendations.add("ios-app-standard");
    if (profile === "android-app") packRecommendations.add("android-app-standard");
    if (profile === "backend-api") packRecommendations.add("backend-api-standard");
  }
  if (capabilities.has("DATA_STORAGE")) packRecommendations.add("data-storage-industrial");
  if (capabilities.has("AUTH_PERMISSION")) packRecommendations.add("auth-permission-industrial");
  if (capabilities.has("PAYMENT_VALUE_TRANSFER")) packRecommendations.add("payment-value-transfer-industrial");
  if (capabilities.has("HIGH_RISK_CHANGE")) packRecommendations.add("high-risk-change-industrial");
  if (capabilities.has("RELEASE_ROLLBACK")) packRecommendations.add("release-rollback-standard");

  return {
    derivedOnly: "Yes",
    userSelectsProfilesOrPacks: "No",
    inferredCapabilities: [...capabilities].sort(),
    inferredProfiles: [...profiles].sort(),
    internalPackRecommendations: [...packRecommendations].sort(),
    evidenceRequirement: "Codex must confirm selected packs against actual project code and task surfaces before treating coverage as ready.",
    missingCoverageIsUserDecision: "No",
    nextTechnicalAction: "Codex reconciles inferred capabilities with installed profiles, baselines, and project evidence.",
  };
}

export function publicSoloPrompt(model, language = "en") {
  if (model?.publicPrompt) return model.publicPrompt;
  return language === "zh"
    ? "不需要你做技术判断，Codex 会按项目证据继续。"
    : "No technical decision is required from you; Codex will continue from project evidence.";
}

function hasRealWorldEffect(intent, operation, actionCode) {
  const text = String(intent || "").toLowerCase();
  if (!/(现在|立即|直接|正式|真实|生产|付费|购买|删除|发送|发布|提交|执行|now|immediately|directly|production|paid|purchase|delete|send|publish|submit|execute)/.test(text)) return false;
  if (/生产|正式上线|正式发布|部署到生产|应用商店|小程序审核|production|deploy\s+to\s+production|app\s*store|play\s*store|store submission/.test(text)) return true;
  if (/删除.{0,8}(真实|生产|全部)?数据|清空.{0,8}数据|delete.{0,16}(real|production|all)?\s*data|drop\s+(table|database)/.test(text)) return true;
  if (/购买|付费|产生费用|升级套餐|purchase|paid|incur cost|upgrade plan/.test(text)) return true;
  if (/(发送|推送).{0,12}(真实用户|短信|邮件|通知)|send.{0,16}(real users?|sms|email|notification)/.test(text)) return true;
  return operation === "PREPARE_RELEASE" || operation === "EXECUTE_RELEASE" || actionCode === "EXECUTE_EXTERNAL_EFFECT";
}

function userActionRequiredNow(userClass, actionCode) {
  if (userClass === "BUSINESS_FACT_NEEDED") return businessFactActions.has(actionCode);
  if (userClass === "REAL_WORLD_CONSENT_NEEDED") return actionCode === "EXECUTE_EXTERNAL_EFFECT";
  return false;
}

function promptFor({ userClass, actionCode, intent, language }) {
  const zh = language === "zh";
  if (userClass === "EXTERNAL_FACT_NEEDED") {
    return zh
      ? "这项能力依赖代码无法证明的外部政策事实。Codex 会继续完成不受影响的工程工作，并准备一份可直接确认的问题清单；在结论补齐前只关闭相关能力。"
      : "This capability depends on an external policy fact that code cannot prove. Codex will continue unaffected engineering, prepare a plain question set, and keep only the dependent capability disabled.";
  }
  if (userClass === "REAL_WORLD_CONSENT_NEEDED") {
    return zh
      ? "Codex 会先准备验证、备份、回滚、费用和影响说明；真正执行外部或不可逆操作前，只会请你确认该现实影响。"
      : "Codex will first prepare verification, backup, rollback, cost, and impact evidence; before the real external or irreversible action, you only consent to that concrete effect.";
  }
  if (userClass === "BUSINESS_FACT_NEEDED") {
    if (actionCode === "REQUEST_GOAL") return zh ? "请直接说你想做成什么。" : "Describe the outcome you want.";
    if (actionCode === "REPAIR_WORK_QUEUE" || actionCode === "REVIEW_TASK_SWITCH") {
      return zh
        ? "Codex 会保留所有进度并整理优先顺序，你只需说明现在更想先完成哪个业务目标。"
        : "Codex will preserve all progress and prepare the order; you only state which business outcome should come first.";
    }
    return zh
      ? "Codex 会先从项目中推断现有规则；如果仍缺信息，只会问一个真实业务问题。"
      : "Codex will infer existing rules first and ask only one real business question if a fact remains missing.";
  }
  if (actionCode === "DISCUSS_WITHOUT_EXECUTION") {
    return zh ? "按你的要求只沟通，不修改项目。" : "Discussion only as requested; no project changes.";
  }
  if (actionCode === "REPAIR_SOURCE_READ") {
    return zh ? "不需要你判断技术原因，Codex 会先定位并修复读取问题。" : "No technical diagnosis is required from you; Codex will locate and repair the source-read problem.";
  }
  return zh
    ? `不需要你做技术判断。Codex 会根据“${intent || "当前目标"}”自动完成下一项工程工作和内部验证。`
    : `No technical decision is required from you. Codex will select and verify the next engineering step for “${intent || "the current goal"}”.`;
}

function sha256(value) {
  return createHash("sha256").update(String(value || "")).digest("hex");
}
