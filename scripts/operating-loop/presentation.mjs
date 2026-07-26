import { firstUsefulLine, unique } from "./shared.mjs";

export function humanDecisionSummaryFor(decision, language = "en") {
  if (decision.requiresHumanDecisionNow === "Yes") return decision.humanDecisionPrompt;
  return language === "zh"
    ? `不需要。${decision.humanDecisionPrompt}`
    : `No. ${decision.humanDecisionPrompt}`;
}

export function plainActionFor(actionCode, language = "en") {
  const zh = {
    REPAIR_SOURCE_READ: "Codex 先说明或修复来源读取失败，再继续。",
    REQUEST_GOAL: "告诉 Codex 你想做成什么。",
    REVIEW_CURRENT_WORK: "Codex 自动梳理现有未提交改动并绑定到正确任务，不需要你判断技术差异。",
    COMPLETE_PROJECT_SETUP: "Codex 先自动完成项目理解、平台识别和对应基线设置；完成前不会提前进入业务实现。",
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
    INSPECT_BUSINESS_UNIVERSE_RISK: "Codex 先只读核对相关业务类别、来源和路径是否可能遗漏，不需要你判断技术范围。",
    PREPARE_BUSINESS_UNIVERSE_COVERAGE: "Codex 先把相关业务类别、生命周期、真实路径和验证义务核对完整，再进入后续审查。",
    PREPARE_CONTROL_EFFECTIVENESS: "Codex 先验证当前任务依赖的检查或门禁是否真的覆盖并拦住对应问题，再继续实现或收口。",
    PREPARE_BUSINESS_RULE_CLOSURE: "Codex 先把业务规则、例外和完成条件梳理完整，再进入实现审查。",
    PREPARE_CHANGE_IMPACT_COVERAGE: "Codex 先补齐前端、后端、数据和运行面的影响范围，再进入实现审查。",
    PREPARE_EXECUTION_PLAN: "Codex 先准备完整执行计划，再进入实现审查。",
    PREPARE_VERIFICATION_PLAN: "Codex 先明确需要验证什么以及如何证明，再进入实现审查。",
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: "Codex 先补齐当前任务缺少的治理条件，再进入实现审查。",
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Codex 按低影响任务自动完成小范围实现、验证和复查。",
    PREPARE_IMPLEMENTATION_REVIEW: "Codex 按当前任务影响级别自动完成实现、验证和复查，不需要额外技术批准。",
    COMPLETE_CLOSURE_EVIDENCE: "Codex 先补齐缺失证据，再判断任务是否完成。",
    REPORT_TASK_COMPLETE: "Codex 可以生成任务完成说明，但这不代表发布或生产批准。",
    COMPLETE_RELEASE_EVIDENCE: "Codex 先自动补齐发布渠道、候选版本、运行环境、验证、备份和回滚证据；当前不会执行外部发布。",
    PREPARE_RELEASE_REVIEW: "严格发布证据已经齐全；Codex 现在只准备说明具体外部影响，仍未获得执行授权。",
    REPAIR_PLANNING_EVIDENCE: "Codex 先修复当前任务、意图和规划证据之间的不一致，再继续。",
    RESOLVE_PLANNING_INPUT: "Codex 已完成技术判断，现在只整理项目无法证明的业务或外部事实。",
    COMPLETE_PLANNING_CLOSURE: "Codex 先自动补齐当前任务缺少的规划、影响和验证证据，再进入实现审查。",
  };
  const en = {
    REPAIR_SOURCE_READ: "Codex should explain or repair the failed source read before continuing.",
    REQUEST_GOAL: "Tell Codex what outcome you want.",
    REVIEW_CURRENT_WORK: "Codex should map current uncommitted work to the correct task without asking the user to judge technical differences.",
    COMPLETE_PROJECT_SETUP: "Codex should complete project understanding, platform detection, and the matching baseline before implementation begins.",
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
    INSPECT_BUSINESS_UNIVERSE_RISK: "Codex should inspect task-relevant business classes, origins, and paths for omission risk without asking the user to judge technical scope.",
    PREPARE_BUSINESS_UNIVERSE_COVERAGE: "Codex should bind the relevant business classes, lifecycle paths, provenance, and verification duties before downstream review.",
    PREPARE_CONTROL_EFFECTIVENESS: "Codex should prove that each relied-on check or gate covers and blocks its exact claim before implementation or close-out continues.",
    PREPARE_BUSINESS_RULE_CLOSURE: "Codex should clarify business rules, exceptions, and completion conditions before implementation review.",
    PREPARE_CHANGE_IMPACT_COVERAGE: "Codex should map frontend, backend, data, and runtime impact before implementation review.",
    PREPARE_EXECUTION_PLAN: "Codex should prepare the complete execution plan before implementation review.",
    PREPARE_VERIFICATION_PLAN: "Codex should define what must be verified and how it will be proved before implementation review.",
    COMPLETE_TASK_GOVERNANCE_PREREQUISITES: "Codex should complete the missing task-governance prerequisites before implementation review.",
    PREPARE_LIGHTWEIGHT_IMPLEMENTATION_REVIEW: "Codex should complete the bounded implementation, verification, and review for this low-impact task.",
    PREPARE_IMPLEMENTATION_REVIEW: "Codex should complete implementation, verification, and review at the required depth without a separate technical approval.",
    COMPLETE_CLOSURE_EVIDENCE: "Codex should complete the missing evidence before deciding whether the task is done.",
    REPORT_TASK_COMPLETE: "Codex may report task completion, but this is not release or production approval.",
    COMPLETE_RELEASE_EVIDENCE: "Codex should complete release-channel, candidate, runtime, verification, backup, and rollback evidence without executing an external release.",
    PREPARE_RELEASE_REVIEW: "Strict release evidence is ready; Codex may now explain the exact external effect, but execution is still unauthorized.",
    REPAIR_PLANNING_EVIDENCE: "Codex should repair inconsistent task, intent, and planning evidence before continuing.",
    RESOLVE_PLANNING_INPUT: "Codex has completed the technical judgment and should surface only the business or external fact the project cannot prove.",
    COMPLETE_PLANNING_CLOSURE: "Codex should complete the missing planning, impact, and verification evidence before implementation review.",
  };
  return (language === "zh" ? zh : en)[actionCode] || actionCode;
}

export function conclusionFor(operation, state, entry, language) {
  if (state === "NEEDS_GOAL") return language === "zh" ? "IntentOS 需要一个明确目标才能选择路径。" : "IntentOS needs one plain goal before choosing a route.";
  if (state === "BLOCKED_BY_SOURCE_FAILURE") return language === "zh" ? "IntentOS 无法安全读取必要来源，已经停止。" : "IntentOS could not safely read one required source and stopped.";
  if (language === "zh") return `${plainOperation(operation, language)}：${plainStateFor(state, language)}。`;
  return `${plainOperation(operation, language)} for ${plainEntry(entry)} is in state: ${plainStateFor(state, language)}.`;
}

export function projectIdentitySummaryFor(projection, language = "en") {
  const dirtySuffix = projection.worktreePosture === "DIRTY"
    ? (language === "zh" ? "当前还有未提交改动。" : " The current worktree has uncommitted changes.")
    : "";
  if (language === "zh") {
    const values = {
      INTENTOS_SOURCE: "这是 IntentOS 源码仓库。",
      NEW_PROJECT: projection.behavioralAdoptionState === "VERIFIED_ACTIVE"
        ? "这是一个新项目，IntentOS 工程治理已经激活。"
        : "这是一个新项目，工程治理尚未建立。",
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
    NEW_PROJECT: projection.behavioralAdoptionState === "VERIFIED_ACTIVE"
      ? "This is a new project with verified active IntentOS engineering governance."
      : "This is a new project whose engineering governance is not established yet.",
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

export function plainOperation(operation, language = "en") {
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

export function plainEntry(entry) {
  return {
    NEW_PROJECT_ENTRY: "a new project",
    EXISTING_PROJECT_ENTRY: "an existing project",
    GOVERNED_PROJECT_ENTRY: "an existing governed project",
    PRODUCTION_SENSITIVE_ENTRY: "a production-sensitive project",
    INTENTOS_SOURCE_ENTRY: "the IntentOS source project",
    UNKNOWN_PROJECT_ENTRY: "a project whose state is still unclear",
  }[entry];
}

export function plainStateFor(state, language = "en") {
  const zh = {
    NEEDS_GOAL: "需要先说明目标",
    BLOCKED_BY_SOURCE_FAILURE: "读取失败，已经停止",
    NEEDS_CURRENT_WORK_REVIEW: "需要先确认当前未完成改动",
    NEEDS_PROJECT_SETUP: "需要先由 Codex 完成项目工程设置",
    BLOCKED_BY_WORK_QUEUE: "任务队列存在多个当前任务，已经停止",
    NEEDS_TASK_SWITCH_REVIEW: "新目标和当前任务不同，需要先整理任务切换",
    NEEDS_WORK_QUEUE: "需要先建立唯一的当前任务记录",
    DISCUSSION_ONLY: "只进行沟通和分析",
    NEEDS_RESUME_REVIEW: "恢复暂停任务前需要复核",
    READY_FOR_PROJECT_PLAN: "可以准备项目方案",
    STATUS_AVAILABLE: "当前状态已整理",
    ADOPTION_REVIEW_ACTIVE: "正在进行只读接入判断",
    NEEDS_RELEASE_EVIDENCE: "发布证据尚未完整，不能进入外部动作确认",
    RELEASE_EVIDENCE_READY_FOR_CONSENT_REVIEW: "严格发布证据已齐全，可以准备具体外部动作说明，但尚未授权执行",
    READY_TO_REPORT_DONE: "证据支持任务完成结论",
    NOT_DONE: "证据还不足以认定完成",
    NEEDS_READ_ONLY_RISK_REVIEW: "需要先只读确认风险",
    NEEDS_GOVERNANCE_EVIDENCE: "需要补齐任务治理证据",
    PLANNING_INVALID: "规划证据不一致，需要先修复",
    NEEDS_PLANNING_INPUT: "缺少项目无法证明的业务或外部事实",
    NEEDS_PLANNING_EVIDENCE: "需要先补齐规划证据",
    READY_FOR_LIGHTWEIGHT_WORK_REVIEW: "可以进入轻量执行审查",
    READY_FOR_PROJECT_GOVERNED_WORK_REVIEW: "任务可继续，但必须保留生产项目原有门禁",
    READY_FOR_IMPLEMENTATION_REVIEW: "可以进入实现审查",
  };
  const en = {
    NEEDS_GOAL: "A goal is required",
    BLOCKED_BY_SOURCE_FAILURE: "Stopped because a required source could not be read",
    NEEDS_CURRENT_WORK_REVIEW: "Current uncommitted work must be reviewed first",
    NEEDS_PROJECT_SETUP: "Codex must complete the project engineering setup first",
    BLOCKED_BY_WORK_QUEUE: "Stopped because the Work Queue has multiple current tasks",
    NEEDS_TASK_SWITCH_REVIEW: "The new goal differs from the current task and needs a task-switch review",
    NEEDS_WORK_QUEUE: "One durable current task record is required",
    DISCUSSION_ONLY: "Discussion and analysis only",
    NEEDS_RESUME_REVIEW: "Paused work requires review before resumption",
    READY_FOR_PROJECT_PLAN: "Ready for project planning",
    STATUS_AVAILABLE: "Current status is available",
    ADOPTION_REVIEW_ACTIVE: "Read-only adoption review is active",
    NEEDS_RELEASE_EVIDENCE: "Release evidence is incomplete, so external-action consent cannot be requested yet",
    RELEASE_EVIDENCE_READY_FOR_CONSENT_REVIEW: "Strict release evidence is ready for exact external-effect review, but execution is not authorized",
    READY_TO_REPORT_DONE: "Evidence supports reporting this task as done",
    NOT_DONE: "Evidence is not sufficient to report done",
    NEEDS_READ_ONLY_RISK_REVIEW: "A read-only risk review is required",
    NEEDS_GOVERNANCE_EVIDENCE: "Task-governance evidence is required",
    PLANNING_INVALID: "Planning evidence is inconsistent and must be repaired",
    NEEDS_PLANNING_INPUT: "A business or external fact that the project cannot prove is required",
    NEEDS_PLANNING_EVIDENCE: "Planning evidence must be completed first",
    READY_FOR_LIGHTWEIGHT_WORK_REVIEW: "Ready for lightweight implementation review",
    READY_FOR_PROJECT_GOVERNED_WORK_REVIEW: "Task may continue only under the production project's existing gates",
    READY_FOR_IMPLEMENTATION_REVIEW: "Ready for implementation review",
  };
  return (language === "zh" ? zh : en)[state] || state;
}

export function printHuman(report, { intent, outputLanguage }) {
  const zh = outputLanguage === "zh";
  const decisionLabel = report.operatingDecision.requiresHumanDecisionNow === "Yes"
    ? (zh ? "需要你决定" : "Decision needed")
    : (zh ? "当前无需你决定" : "No decision needed now");
  console.log(zh ? "# IntentOS 当前工作状态" : "# IntentOS Current Operating State");
  console.log("");
  console.log(`${zh ? "我理解的是" : "Understood goal"}: ${intent || (zh ? "你还没有说明目标" : "No goal was provided")}`);
  console.log("");
  console.log(`${zh ? "结论" : "Current status"}: ${report.humanSummary.currentState}`);
  if (report.humanSummary.blockerExplanation) {
    console.log("");
    console.log(`${zh ? "还差什么" : "What is still missing"}: ${report.humanSummary.blockerExplanation}`);
  }
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

export function plainBlockerExplanationFor(values, language = "en") {
  const blockers = unique(Array.isArray(values) ? values : []);
  if (blockers.length === 0) return "";
  const zh = {
    SOURCE_READ_FAILED: "IntentOS 还没有可靠读到当前项目资料。",
    WORK_QUEUE_REQUIRED: "当前任务还没有形成唯一、可恢复的记录。",
    TASK_GOVERNANCE_REQUIRED: "当前任务的影响范围和执行深度还没有被可靠确认。",
    PLAN_REVIEW_REQUIRED: "执行方案还没有通过独立复核。",
    EXECUTION_ASSURANCE_REQUIRED: "实际改动、测试和复查还没有形成同一条证据链。",
    COMPLETION_EVIDENCE_REQUIRED: "完成结论所需的当前任务证据还不完整。",
    RELEASE_EVIDENCE_REQUIRED: "发布前需要的候选版本、验证、回滚或运行证据还不完整。",
  };
  const en = {
    SOURCE_READ_FAILED: "IntentOS has not read the current project evidence reliably yet.",
    WORK_QUEUE_REQUIRED: "The current task does not yet have one durable, resumable record.",
    TASK_GOVERNANCE_REQUIRED: "The task impact and required execution depth are not yet bound reliably.",
    PLAN_REVIEW_REQUIRED: "The execution plan has not passed independent review yet.",
    EXECUTION_ASSURANCE_REQUIRED: "The actual changes, tests, and review are not yet bound into one evidence chain.",
    COMPLETION_EVIDENCE_REQUIRED: "The current task does not yet have complete close-out evidence.",
    RELEASE_EVIDENCE_REQUIRED: "The candidate, verification, rollback, or runtime evidence required before release is incomplete.",
  };
  const dictionary = language === "zh" ? zh : en;
  const rendered = blockers.map((value) => dictionary[value]).filter(Boolean);
  if (rendered.length > 0) return unique(rendered).join(language === "zh" ? "；" : " ");
  return language === "zh"
    ? "内部证据之间仍有不一致，Codex 会先修复再继续。"
    : "Internal evidence is still inconsistent; Codex must repair it before continuing.";
}
