# IntentOS Development Workflow

## 目标

把任意软件变更从模糊输入转成可执行、可验证、可审查、可回滚、可复盘的工程过程。

IntentOS 工作流不是让 AI 更自由，而是让 AI 在清晰边界里高效执行。

## 阶段

### 0. Goal Mode Entry

Goal Mode classifies the user goal before Codex chooses artifacts or writes code.

Modes:

```text
DISCUSS_ONLY
ADOPT_PROJECT
DEFINE_WORK
IMPLEMENT_TASK
REVIEW_TASK
REPAIR_TASK
BASELINE_DECISION
HANDOFF_OR_REPORT
```

Use a Goal Card when the route is broad, ambiguous, high-risk, or needs durable evidence:

```bash
node scripts/new-workflow-item.mjs --type goal-card --name <goal-name>
node scripts/check-goal-mode.mjs .
```

Goal Card is route selection only. It does not approve implementation, risk, release, Human Approval, Approval scope, or subagent orchestration.

### 0.5 Subagent Orchestration

Subagent Orchestration defines how Codex may use helper agents without losing control of scope, writes, review authority, or cleanup.

It is an execution organization layer, not permission to execute more work.

Default rule:

```text
Many readers, one writer.
```

Use a Subagent Run Plan when helper agents are used for planning, read-only research, review, repair analysis, or reporting:

```bash
node scripts/new-workflow-item.mjs --type subagent-run-plan --name <goal-name>
node scripts/check-subagent-orchestration.mjs .
```

Every subagent must be `CLOSED` or `SKIPPED` after handoff. Codex must not send a final response, commit, or mark work complete while any subagent is `RUNNING`, standing by, or occupying a slot after its output is consumed.

### 1. Project Onboarding

项目初始化后先做 onboarding，不直接进入开发。

Onboarding 的目标不是让人手动填表，而是让 AI 根据沟通生成草案，人只做确认、否决、选择和风险接受。

项目级产物：

```text
docs/project-onboarding.md
docs/project-profile.md
docs/tech-stack-strategy.md
docs/business-spec-index.md
docs/sample-policy.md
docs/onboarding-decisions.md
```

执行方式：

```text
Conversation
  -> AI draft
  -> human decision
  -> document update
  -> onboarding review
  -> first request card
```

在 onboarding 未完成前，不应该从模糊项目目标直接进入功能实现。

### 2. Project Constitution

项目启动前先建立基本规则：

- 项目目标
- 工程原则
- AI 使用边界
- 风险策略
- 验证命令
- 禁止修改区域
- 人工确认条件

项目级产物：

```text
AGENTS.md
docs/ai-workflow.md
docs/project-onboarding.md
docs/project-profile.md
docs/tech-stack-strategy.md
docs/business-spec-index.md
docs/sample-policy.md
docs/onboarding-decisions.md
docs/product-vision.md
docs/engineering-principles.md
docs/risk-policy.md
docs/architecture.md
docs/domain-model.md
docs/permission-model.md
docs/test-strategy.md
```

### 3. Intake / Request Card

需求入口必须先结构化，不能让 AI 直接实现模糊需求。

Request Card 至少回答：

- 原始需求是什么？
- 谁需要它？
- 解决什么问题？
- 现在怎么做？
- 期望结果是什么？
- 约束和优先级是什么？

### 4. Preflight

Preflight 只判断，不写代码。

它必须回答：

- 需求是否清楚？
- 是否太大？
- 是否方向错误？
- 是否有更简单方案？
- 风险在哪里？
- 第一条 vertical slice 是什么？
- 是否允许进入 spec 阶段？

结论只能是：

```text
READY_FOR_SPEC
NEEDS_CLARIFICATION
TOO_LARGE_SPLIT_REQUIRED
NOT_RECOMMENDED
```

### 5. Spec Pack

Spec 是工程约定，不是普通 PRD。

每个 spec 至少包含：

- Problem
- User story
- Scope
- Non-goals
- Data model impact
- API / interface contract
- UI states
- Permission rules
- Acceptance criteria
- Test plan
- Rollback notes

### 6. Eval Pack

Eval 定义如何证明做对了。

它至少包含：

- Must pass
- Manual review checklist
- Reject conditions
- Risk focus
- Required evidence

先写 eval，再实现。

### 7. Task Breakdown

大需求必须拆成小任务卡。

任务卡必须说明：

- 关联 spec 和 eval
- 单一目标
- 允许修改范围
- 禁止修改范围
- 验收标准
- 验证命令
- 停止条件

### 8. Agent Execution

AI 只执行明确 task card。

AI 必须遵守：

- `AGENTS.md`
- 关联 spec
- 关联 eval
- task scope
- stop conditions

AI 不得自行扩大需求、绕过测试、修改高风险模块或引入未批准依赖。

### 9. Verification Gate

实现完成后先跑机器验证：

- lint
- typecheck
- unit test
- integration test
- e2e test
- build
- security / dependency checks

还要检查：

- 是否只改允许文件？
- 是否新增依赖？
- 是否触碰高风险模块？
- 是否满足 acceptance criteria？
- 是否违反 non-goals？

### 10. Review Gate

人类审查重点：

- 方向是否正确
- 架构是否合理
- 权限是否安全
- 数据是否隔离
- 边界是否清晰
- 测试是否覆盖关键风险
- 是否值得合并

当一次变更需要交给 GPT Pro、第二模型或人类做独立复查时，先生成 Review Packet。Review Packet 不是批准记录，而是把 request、preflight、spec、eval、task、risk gate、human approval、baseline state、证据、diff 摘要、已知风险和开放问题打包成稳定输入。

### 10.1 Review Loop Gate

当任务是 `L2` / `L3`，或复查产生需要闭环的 finding 时，使用 `core/review-loop.md`。

资产分工必须保持清楚：

- Review Packet：复查输入。
- GPT Review Prompt：给 GPT Pro、第二模型或独立 reviewer 的只读提示。
- Review Loop Report：记录审查轮次、AUTO_FIX、复审结果、停止条件和人工决策。

Codex 只能自动修确定性、低风险、任务范围内的问题，最多 2 轮。

以下内容不能自动修，必须转为人工决策：

- 扩大范围
- 新增依赖
- 架构调整
- 权限模型调整
- 支付或价值转移动作
- 数据迁移
- 生产配置
- 发布或回滚策略
- Human Approval 或 Approval scope
- 风险接受或 Risk Gate 绕过

如果同一问题重复出现两次、自动修引入新的 P0/P1、验证重复失败、reviewer 输出不结构化，停止并交给人判断。

### 10.2 Bounded Next-Step Gate

当 Codex 在 final report、Review Loop Report、status report 或 PR 中提出下一步建议时，使用 `core/next-step-boundary.md`。

建议必须被分类：

- `IN_SCOPE_NEXT_STEP`：当前任务范围内、无需新批准的最小安全动作。
- `DIRECT_FOLLOW_UP`：相关但不在当前任务范围内，需要新 request 或 follow-up proposal。
- `RISK_DECISION`：需要人判断范围、风险、权限、数据、依赖、架构、迁移、生产配置、发布、回滚、支付或价值转移。
- `OUT_OF_SCOPE_OBSERVATION`：只作为背景记录，不作为立即要做的事。
- `DO_NOT_PROCEED`：当前范围下不安全或未授权，不能执行。

Codex 只能在当前任务内处理 `IN_SCOPE_NEXT_STEP`。其它类型必须进入新入口、人工决策或停止记录。

### 11. Release Gate

发布前检查：

- 是否需要 feature flag？
- 是否有 rollback plan？
- 是否涉及 migration？
- 是否有日志和监控？
- 是否影响现有用户？
- 是否需要灰度？

### 12. Retrospective / Learning

每个 AI task 完成后记录：

- AI 跑了几轮？
- 哪里返工？
- 哪个 spec 字段缺失？
- 哪个 eval 漏检？
- 人工 review 发现什么？
- 下次模板怎么改？
- 是否出现值得沉淀为 Skill candidate 的重复执行模式？

复盘结果要回收到 intentos，而不是散落在聊天记录里。

Skill candidate 只能作为候选沉淀，不能自动生成、更新、安装或启用 active Skill。详见 `core/skill-governance.md`。

Daily automation may run `scripts/workflow-daily-summary.mjs` to decide whether a daily retro or candidate draft is needed. It should create no workflow files when the decision is `NO_ACTION`.

Project automations may be proposed during setup or release preparation, but Codex must not create, update, resume, delete, or enable recurring automations without explicit human approval. See `core/automation-governance.md`.

## 工作流图

```text
Request Card
  -> Preflight Gate
  -> Spec Pack
  -> Eval Pack
  -> Task Card
  -> Agent Execution
  -> Verification Gate
  -> Review Gate
  -> Review Packet when independent review is needed
  -> Review Loop Report when findings need closure
  -> Bounded Next-Step Suggestions when follow-up is reported
  -> Release Gate
  -> AI Task Log
  -> Workflow Improvement
  -> Skill Candidate when repeated execution wrapper is justified
  -> IntentOS Improvement
```
