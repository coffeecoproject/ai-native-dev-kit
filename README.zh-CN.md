# IntentOS 中文说明

面向 AI 协作开发的项目交付系统。

当前版本：`1.99.3`。

发布记录：[releases/1.99.3/release-record.md](releases/1.99.3/release-record.md)。

IntentOS 面向零基础个人开发者：用户只描述真实业务、补充项目无法推断的业务事实，并在产生真实费用、生产、用户通信、账号平台或不可逆数据影响前表达同意；AI 负责全部技术判断、实现、测试、复查、证据、修复和交付组织。

它不是提示词合集，也不是代码模板、框架脚手架或部署工具。它是一套给 Codex 和其他 AI 编程助手使用的工作流与治理底座。

> 你只说真实业务；AI 做全部技术判断并完成内部流程。只有缺少业务事实或即将产生现实影响时，才需要你回应。

## 30 秒开始

前置要求：Node.js `>=22`。

多数用户直接用自然语言开始：

```text
我想做一个预约 App，你帮我开始。
```

需要命令行证据时，只用一个公开入口：

```bash
node scripts/cli.mjs work <project> "<你想做什么>"
```

`work` 会自己判断这是新项目、继续任务、查看进度、任务收口、准备发布，
还是老项目接入。入口本身只读；通过内部门禁后，普通、可逆、项目内工程工作
不需要再次进行技术审批。生产、费用、真实用户通信、真实账号平台和不可逆数据影响
仍必须先说明现实影响并获得明确同意。

维护者可用 `node scripts/cli.mjs --help-advanced` 查看底层命令；普通用户不需要选择。

先读这几页：

- [Start Here](docs/start-here.md)
- [Operating Model](docs/operating-model.md)
- [Minimal Adoption](docs/minimal-adoption.md)
- [Source-Only Adoption](docs/source-only-adoption.md)
- [For Existing Projects](docs/for-existing-projects.md)
- [For Maintainers](docs/for-maintainers.md)

命名说明：**IntentOS** 是产品、工作流体系、CLI、manifest 和生成资产的统一名称。公开命令只使用 `intentos`。

1.99.3 收口当前审查与执行可信链：审查输入绑定当前任务和项目，Plan Review
引用必须真实存在且摘要一致，完成、Apply、发布继续消费同一套严格要求，安装项目
只认自身已安装权威，没有真实验证路径时 starter 会明确失败。

1.99.2 让这套解释权真正 fail-closed：未分类的语义来源不能自动成为当前规则，
活跃入口中的直接冲突会被拦截，新生成的 Review Packet 和 GPT 审查提示会绑定
同一份上下文摘要。本次不增加用户模式，也不重复执行证据链。

1.99.1 明确规定：当前单人零经验产品契约的解释优先级高于旧版本措辞和
机器兼容字段。GPT、reviewer 和 subagent 审查会拒绝多人模式、把技术选择
交给用户、把 owner 字段直接理解成人员要求，以及因为已有工业能力就扩大
产品范围。历史审计记录继续保留，但不能定义当前方向。

1.99.0 把默认用户模型硬切为零基础个人开发者。公开入口不再让用户选择技术架构、
基线、工业包、数据库方案、测试方式、审查系统、工作流命令或企业负责人。
IntentOS 在内部自动判断责任领域和能力覆盖，通过内部门禁后继续普通可逆工程；
只在缺少真实业务事实或即将产生现实影响时询问用户。严格证据、Apply、回滚、
完成判断和发布可信链保持不变。

## 版本历史

当前行为只由当前产品契约和正在运行的规则定义，不由旧版本措辞定义。
完整审计历史保留在 [VERSION.md](VERSION.md) 和
[版本记录目录](releases/)。

早期记录可能保留 `owner`、`human approval` 等机器兼容字段。
在当前单人模式下，它们不表示用户需要组建团队或做技术判断。解释规则见
[审查上下文权威](core/review-context-authority.md)。

## 3 分钟理解

IntentOS 把 AI 协作开发拆成一条可控路径：

```text
用户目标 -> 读项目 -> 判断状态 -> 自动选技术路径 -> 必要时补业务事实/确认现实影响 -> 执行 -> 验证 -> 复查 -> 收口
```

| 项目状态 | 默认方式 |
|---|---|
| 新项目 | Codex 根据业务目标自动判断平台、基线和第一版范围；只有真实业务边界无法推断时才询问 |
| 已有项目 | 先读现有代码、文档和规则；如果要接入 IntentOS，进入原生迁移计划 |
| 已上线项目 | 先只读映射现有治理，再做生产安全的原生迁移计划，不覆盖发布和回滚流程 |

核心原则：

- 用户只负责真实业务目标、项目无法推断的业务事实，以及对已准备好现实影响的明确同意。
- AI 负责技术取舍、读取、计划、执行、测试、复查、修复、验证和记录。
- 项目内普通可逆工作通过内部门禁后自动继续；生产、费用、真实通信和不可逆影响必须先准备证据与回滚，再请求具体同意。

## 一句话开始

多数用户从这里开始就够了：

```text
我想做一个预约 App，你帮我开始。
```

Codex 应该把这种自然语言目标自动当成 IntentOS 入口，进入统一 Operating Model；
Beginner Entry 只在适用的新项目任务中作为内部来源使用。

如果需要命令行证据、CI 验证或维护者调试，等价命令是：

```bash
node scripts/cli.mjs work ../my-project "我想做一个预约 App"
```

或者在当前项目里：

```bash
node scripts/cli.mjs work . "我想把当前项目接入 IntentOS"
```

`work` 会输出统一的当前工作状态，说明：

- AI 理解了什么；
- 建议先走哪条路径；
- 是否仍缺一个无法从项目推断的业务事实，或一个已准备好的现实影响确认；
- Codex 下一步可以安全做什么；
- Codex 现在不能做什么。

你不需要先知道 `workflow-map`、`baseline-decision`、`apply-plan`、`BL2` 或 hook policy 是什么。Codex 会自己选择内部路径，并把结果翻译成人能判断的内容。

历史 `ask` 命令仍作为维护者可用的 Beginner Entry 底层来源命令保留，
不再是另一套普通用户入口。

## 适合什么场景

| 场景 | IntentOS 会怎么处理 |
|---|---|
| 从 0 做一个产品 | Codex 从业务目标推导平台、第一条核心流程和工程基线，只补问无法推断的业务事实 |
| 进行中的项目 | 先检查当前状态、未完成任务、基线缺口和可写入范围 |
| 老项目接入 AI | 先做 existing workflow mapping，再用 native migration plan 规划原生接入，不直接复制整套规则 |
| 已上线项目 | 默认先只读，再走 production-safe native overlay，保护现有 CI、发布、回滚和证据链 |
| 任务做到一半被打断 | 用 Work Queue / Todo 记录当前任务、暂停任务和恢复入口 |
| 想加 hook 或自动化 | 先生成 hook plan / hook policy，不自动安装、不改 CI |
| 复杂问题怕被补丁化 | 先做 patch classification，再由 IntentOS 决定小修或结构治理；只在缺业务事实或有现实影响时询问 |

## 项目分级

IntentOS 不鼓励一上来启用最重治理。它按项目风险分层：

| 级别 | 适合项目 | 默认建议 |
|---|---|---|
| O0 / BL0 | 试验、小工具、低风险功能 | 轻量流程和最小基线 |
| O1 / BL1 | 普通 Web、中台、小程序、App、后台服务 | 标准流程、平台 profile、标准基线包 |
| O2 / BL2 | 有客户、生产数据、权限、支付、发布风险 | 标准基线 + 按需工业增强包 + 更严格证据 |

平台 profile 用来区分 Web、iOS、Android、微信小程序、后端、内部管理系统和高风险变更。标准基线包处理普通工程质量；工业增强包只在 BL2、高风险或生产敏感场景下按需启用。

## 包含哪些能力

| 能力 | 作用 |
|---|---|
| Conversation-Native Ask | 用户直接说目标，Codex 自动按入口流程判断 |
| Beginner Entry | 用户只说目标，AI 给出可确认的下一步 |
| Guided Adoption | 判断项目是新项目、老项目、强治理项目还是生产敏感项目 |
| Existing Project Safe Adoption Autopilot | 老项目说“接入 IntentOS”时，`adopt` 自动跑只读诊断、规则对比、收敛与验收摘要，输出白话结果卡；不写项目、不安装 `.intentos/`、不宣称完整接入 |
| Controlled Native Adoption Review | 老项目想进一步接入时，`adopt-review` 判断项目治理成熟度并推荐最安全接入深度：保持部分接入、先修治理，或准备更深接入计划；仍然只读、不写项目、不替换规则 |
| Task Governance | 老项目或部分接入项目执行任务前，先判断任务是小修、中等变更、疑似高风险还是高影响任务，再自动选择轻量、短计划或完整证据链；不授权实现、不宣称完成 |
| Native-First Migration | 老项目不再停在笼统 adapter 建议；先分类旧规则和权力边界，再计划接入 IntentOS |
| Existing Rule Reconciliation | 对比旧项目规则和 IntentOS 参考规则，只输出建议，不直接替换旧治理 |
| Governance Convergence | 老项目可以按 IntentOS 日常工作方式收敛，但基线、发布、CI、hook、历史证据和旧规则必须先比较再计划 |
| Adoption Assurance | 验证老项目是否真的按 IntentOS 工作，需要证据和只读模拟支撑，而不是只靠“已接入”的说法 |
| Baseline Decision | 用白话确认 BL0 / BL1 / BL2、平台和风险 |
| Ordinary First Slice | 把普通用户的一句话目标整理成第一版范围、问题、延期项和验证方式 |
| Product Completeness | 判断现在是想法、第一版范围、可本地运行 MVP、内测候选还是阻塞 |
| Real MVP Example | 用内置预约和看板 Web MVP 样例证明这条链路可以本地跑通 |
| Standard Baseline Packs | 为不同平台提供普通工程基线 |
| Industrial Overlays | 为生产、客户数据、权限、支付、发布等风险提供增强治理 |
| Review Surface | 执行前判断任务完成后需要审哪些面 |
| Business Rule Closure | 写代码前先把业务规则闭环，AI 负责补齐规则维度和默认建议，用户只确认少数关键判断 |
| Change Impact Coverage | 防止业务规则只改一层，要求前端、API、后端、文案、测试和交接等相关面逐项收口 |
| Verification Plan Governance | 根据业务规则和影响面生成任务绑定的验证义务，说明哪些测试或检查足以支持后续收口；不执行测试，不批准实现或发布 |
| Test Evidence Binding | 把真实命令、报告、界面观察或日志证据绑定到 Verification Plan 的每个必验证项；检查退出码、证据文件、digest、任务匹配和测试质量控制，不执行测试、不批准发布 |
| Completion Evidence Gate | 最终说“任务完成”前，检查 Business Rule Closure、Verification Plan、Test Evidence、Execution Assurance 是否 recorded、ready、同 task、同 source chain；不运行测试、不批准发布 |
| User Delivery Console | 用一张普通用户状态卡回答“做到哪、能不能算完成、能不能进上线评审、还缺什么、下一步能安全做什么”；只汇总下层证据，不替代下层证据系统 |
| Release Evidence Gate | 正式发布前，把 release candidate、Completion Evidence、runtime smoke、rollback、monitoring、现实影响同意、环境/迁移/成本和老项目发布规则汇成复查证据包；不批准发布、不执行上线 |
| Review Loop | 任务完成后复查、自动修复可修项、把风险交给人 |
| Unified Closure | 用户问“能算完成了吗”时，AI 给出唯一收口结论，避免多个检查给出不同答案 |
| Launch Review View | 用户问“能不能上线/提交审核”时，把收口结果、Safe Launch 标签和上线缺口整理成一张评审视图 |
| Guided Release Adapter | 用户想上线但不懂发布流程时，Codex 自动发现项目发布方式并生成小白可读的发布适配卡 |
| Release Guide | 用户说“帮我上线”时，Codex 用一个入口判断应该走发布适配、上线评审、结构化审批还是发布执行计划 |
| Platform Release Recipes | 根据 Web、后端、小程序等平台给出发布前通常需要的准备清单，但不执行发布 |
| Release Handoff Packs | 把平台配方和结构化审批变成可交接的发布包，明确 Codex、人和外部系统各自负责什么 |
| Release Path Hardening | 防止上线交接包过早生成，并用结构化证据证明交接包不是发布批准 |
| Release Execution | 用户同意已经说明的现实发布影响后，把执行步骤、执行边界、停止条件和证据要求整理成受控发布执行计划 |
| Release Plan | 把多条发布相关结果汇总成一个只读视图；老项目默认按 IntentOS 工作，但资产迁移必须先做规则对比和审批 |
| Unified Apply Plan | 所有写入动作先进入一张可审查计划 |
| Controlled Apply Readiness | 判断精确计划是否具备在必要现实影响确认后受控执行的条件 |
| Low-Risk Apply Candidate | 判断一个小改动是否足够窄、可回滚、可验证，能否进入受控执行计划 |
| Approval Record | 记录人明确批准了哪些 action、哪些路径、到什么时候过期 |
| Work Queue / Todo | 管理当前任务、暂停任务、停车场和恢复入口 |
| Document Lifecycle | 识别过期、重复、废弃文档和 source of truth，默认建议归档，不默认删除 |
| Hook Policy | 定义项目允许哪些 hook、谁确认、怎么禁用和回滚 |
| Execution Assurance Chain | 执行类工作说“完成”前，必须把意图、计划、实际改动、证据、复查和补丁判断串成可检查证明链 |
| Execution Closure | 收口改动范围、验证结果、债务和提交前证据 |
| Project Memory | 让 Git 和已确认文档优先于聊天记录、模型记忆和 AI 推断 |

## 用户入口

多数用户只需要这样开始：

```text
直接告诉 Codex 你的项目目标。
Codex 读取项目、推荐路径，并只问少数真正需要你判断的问题。
```

需要命令行证据时，用：

| 你想做什么 | 命令 |
|---|---|
| 开始新项目 | `node scripts/cli.mjs work ../new-project "我想做一个预约 App"` |
| 继续当前任务 | `node scripts/cli.mjs work ../my-project "继续完成预约时间规则"` |
| 查看进度 | `node scripts/cli.mjs work ../my-project "检查当前任务做到哪里了"` |
| 判断任务能不能收口 | `node scripts/cli.mjs work ../my-project "这个任务做完了吗"` |
| 准备发布 | `node scripts/cli.mjs work ../my-project "准备发布内部测试版本"` |
| 接入老项目 | `node scripts/cli.mjs work ../old-project "让这个项目按 IntentOS 工作"` |

普通用户不需要先理解内部 workflow 命令。

## 维护者和证据命令

这些命令主要给维护者、CI、审计和显式证据使用：

| 你想做什么 | 命令 |
|---|---|
| 判断项目状态 | `node scripts/cli.mjs start ../my-project` |
| 查看底层工作流建议 | `node scripts/cli.mjs guide ../my-project` |
| 选择项目基线 | `node scripts/cli.mjs baseline-decision ../my-project` |
| 老项目先映射现有治理 | `node scripts/cli.mjs workflow-map ../my-project` |
| 老项目生成原生迁移计划 | `node scripts/cli.mjs native-migration ../my-project` |
| 检查原生迁移计划 | `node scripts/cli.mjs native-migration-check ../my-project` |
| 对齐旧规则和 IntentOS 参考规则 | `node scripts/cli.mjs reconcile-rules ../my-project` |
| 检查规则对齐报告 | `node scripts/cli.mjs reconcile-rules-check ../my-project` |
| 汇总老项目如何向 IntentOS 日常治理收敛 | `node scripts/cli.mjs convergence ../my-project` |
| 检查治理收敛报告 | `node scripts/cli.mjs convergence-check ../my-project` |
| 生成老项目接入验收报告 | `node scripts/cli.mjs adoption-assurance ../my-project --out adoption-assurance-reports/001.md` |
| 检查老项目接入是否真的生效 | `node scripts/cli.mjs adoption-assurance-check ../my-project` |
| 判断当前任务需要多重治理 | `node scripts/cli.mjs task-governance ../my-project --intent "新增审批状态规则"` |
| 检查任务治理报告 | `node scripts/cli.mjs task-governance-check ../my-project` |
| 汇总发布源系统为统一视图 | `node scripts/cli.mjs release-plan ../my-project --intent "帮我上线"` |
| 检查统一发布视图 | `node scripts/cli.mjs release-check ../my-project` |
| 判断计划是否具备受控执行条件 | `node scripts/cli.mjs apply-readiness ../my-project --plan apply-plans/001-example.md` |
| 生成受控写入计划 | `node scripts/cli.mjs apply-plan ../my-project --intent "更新工作流资产" --action workflow-assets` |
| 检查受控同意记录 | `node scripts/cli.mjs approval-record-check ../my-project` |
| 处理中断任务 | `node scripts/cli.mjs work-queue ../my-project` |
| 检查文档生命周期 | `node scripts/cli.mjs doc-lifecycle ../my-project` |
| 生成统一收口结论 | `node scripts/cli.mjs finish ../my-project --intent "完成预约校验" --verification "npm run verify passed"` |
| 检查统一收口结论 | `node scripts/cli.mjs finish-check ../my-project` |
| 生成上线评审视图 | `node scripts/cli.mjs launch-view ../my-project --intent "准备上线评审" --verification "npm run verify passed"` |
| 检查上线评审视图 | `node scripts/cli.mjs launch-view-check ../my-project` |
| 生成发布适配卡 | `node scripts/cli.mjs release-adapter ../my-project --intent "准备发布适配"` |
| 检查发布适配卡 | `node scripts/cli.mjs release-adapter-check ../my-project` |
| 生成统一发布引导 | `node scripts/cli.mjs release-guide ../my-project --intent "帮我上线"` |
| 检查统一发布引导 | `node scripts/cli.mjs release-guide-check ../my-project` |
| 选择平台发布配方 | `node scripts/cli.mjs release-recipe ../my-project --intent "帮我上线"` |
| 检查平台发布配方 | `node scripts/cli.mjs release-recipe-check ../my-project` |
| 生成发布交接包 | `node scripts/cli.mjs release-handoff ../my-project --intent "帮我上线"` |
| 检查发布交接包 | `node scripts/cli.mjs release-handoff-check ../my-project` |
| 生成发布执行计划 | `node scripts/cli.mjs release-execution ../my-project --intent "准备发布执行" --mode PLAN_ONLY` |
| 检查发布执行计划 | `node scripts/cli.mjs release-execution-check ../my-project` |
| 生成变更影响覆盖报告 | `node scripts/cli.mjs impact-coverage ../my-project --intent "新增合同录入限制"` |
| 检查变更影响覆盖报告 | `node scripts/cli.mjs impact-coverage-check ../my-project` |
| 生成执行完成证明链 | `node scripts/cli.mjs execution-assurance ../my-project --intent "新增合同录入限制" --out execution-assurance-reports/001.md` |
| 检查执行完成证明链 | `node scripts/cli.mjs execution-assurance-check ../my-project` |
| 用白话别名检查任务是否真正完成 | `node scripts/cli.mjs done-check ../my-project` |
| 用白话别名验证执行是否到位 | `node scripts/cli.mjs verify-execution ../my-project` |
| 严格检查变更影响闭环证据 | `node scripts/check-change-impact-coverage.mjs ../my-project --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs` |
| 严格检查执行收口是否引用正确影响覆盖 | `node scripts/check-execution-closure.mjs ../my-project --require-impact-coverage --require-precise-evidence` |
| 规划 hook 而不安装 | `node scripts/cli.mjs hook-policy ../my-project` |
| 执行完成后收口 | `node scripts/cli.mjs closure ../my-project --intent "完成预约校验" --verification "npm run verify passed"` |
| 检查当前配置 | `node scripts/cli.mjs check ../my-project --mode core` |

完整命令见 [Scripts Reference](docs/reference/scripts.md)。

## 安全边界

IntentOS 默认保护这些边界：

- 不因为一句话就写文件。
- 不把建议当成执行授权。
- 不自动改 CI、hook、发布流程或生产配置。
- 不自动启用 BL2 或工业增强包。
- 不自动删除、移动、归档或重写文档。
- 不替用户批准权限、支付、税务、法务、数据迁移、生产发布等高风险决策。
- 不覆盖已有强治理项目的规则；先只读映射，再决定是否选择性接入。

一句话：IntentOS 让 AI 更会推进项目，但不让 AI 替人做风险决定。

## 新项目、老项目、上线项目

新项目可以直接从自然语言目标开始：

```bash
node scripts/cli.mjs work ../new-project "我想做一个中小企业管理中台"
```

已有项目也使用同一个入口，IntentOS 自己选择规则对比和接入来源：

```bash
node scripts/cli.mjs work ../existing-project "让这个项目按 IntentOS 工作"
```

已上线或强治理项目仍使用同一入口，但保持只读，直到受控证据允许下一步：

```bash
node scripts/cli.mjs work ../production-project "让这个已上线项目按 IntentOS 工作"
```

底层接入、规则对比和写入计划命令只用于维护者证据，不要求普通用户选择。

## 验证这个仓库

维护 IntentOS 本身时，可以运行：

```bash
npm run verify
npm run verify:governance
node scripts/cli.mjs ask . "维护 IntentOS 小白入口"
node scripts/resolve-beginner-entry.mjs . --goal "维护 IntentOS 小白入口"
node scripts/check-beginner-entry.mjs .
node scripts/check-conversation-native-ask.mjs .
node scripts/check-controlled-apply-readiness.mjs .
node scripts/check-approval-record.mjs .
node scripts/check-workflow-guidance.mjs .
node scripts/check-first-slice.mjs .
node scripts/check-product-completeness.mjs .
node scripts/check-mvp-example.mjs examples/mvp-booking-web-app
node scripts/check-mvp-example.mjs examples/mvp-dashboard-web-app
node scripts/check-mvp-example.mjs examples/mvp-cli-note-tool
node scripts/cli.mjs finish . --intent "维护 IntentOS 收口体验" --verification "npm run verify passed"
node scripts/check-closure-decision.mjs .
node scripts/check-guided-closure.mjs .
node scripts/check-launch-review-view.mjs .
node scripts/check-release-adapter.mjs .
node scripts/check-release-guide.mjs .
node scripts/check-platform-release-recipe.mjs .
node scripts/check-release-handoff-pack.mjs .
node scripts/check-release-execution.mjs .
node scripts/check-release-plan.mjs .
node scripts/check-low-risk-apply-candidate.mjs . --require-structured-evidence
node scripts/check-change-impact-coverage.mjs .
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --report change-impact-coverage-reports/001-contract-input-rule.md --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs --require-precise-evidence
node scripts/check-execution-closure.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-impact-coverage --require-precise-evidence
```

## 文档入口

先读这些：

- [Documentation Home](docs/README.md)
- [Documentation Index](docs/index.md)
- [Operator Manual](docs/operator-manual.md)
- [Quickstart](docs/quickstart.md)
- [First Hour](docs/first-hour.md)
- [Beginner Entry](docs/beginner-entry.md)
- [Conversation-Native Ask](docs/conversation-native-ask.md)
- [Natural Language Orchestrator](docs/natural-language-orchestrator.md)
- [Unified Closure Model](docs/unified-closure-model.md)
- [Decision Explain Trace](docs/decision-explain-trace.md)
- [Guided Closure Experience](docs/guided-closure-experience.md)
- [Launch Review View](docs/launch-review-view.md)
- [Guided Release Adapter](docs/release-adapter.md)
- [Release Guide](docs/release-guide.md)
- [Platform Release Recipes](docs/platform-release-recipes.md)
- [Release Handoff Packs](docs/release-handoff-packs.md)
- [Release Execution Protocol](docs/release-execution-protocol.md)
- [Release Core Model](docs/release-core-model.md)
- [Existing Project Workflow Adapter](docs/existing-project-workflow-adapter.md)

核心流程：

- [Repository Structure](docs/repository-structure.md)
- [Document Ownership](docs/document-ownership.md)
- [Artifact Decision Tree](docs/artifact-decision-tree.md)
- [Artifact Lifecycle Map](docs/artifact-lifecycle.md)
- [O0 / BL0 Lightweight Path](docs/o0-bl0-lightweight-path.md)
- [Subagent Dispatch Hygiene](docs/subagent-dispatch-hygiene.md)
- [Guided Delivery Baseline](docs/guided-delivery-baseline.md)
- [Product Baseline](docs/product-baseline.md)
- [Claim Control](docs/claim-control.md)
- [Project Memory](docs/project-memory.md)
- [Git Boundary](docs/git-boundary.md)
- [Context Governance Usage](docs/context-governance-usage.md)
- [Minimal Commit Set](docs/minimal-commit-set.md)
- [Safe Launch](docs/safe-launch.md)
- [Conversation Drift Control](docs/conversation-drift-control.md)
- [First Delivery Walkthrough](docs/first-delivery-walkthrough.md)
- [Change Boundary](docs/change-boundary.md)
- [Baseline State](docs/baseline-state.md)
- [Guided Delivery Check](docs/guided-delivery-check.md)
- [Review Surface Governance](docs/review-surface-governance.md)
- [Change Impact Coverage](docs/change-impact-coverage.md)
- [Execution Assurance Chain](docs/execution-assurance-chain.md)
- [Delivery Path Governance](docs/delivery-path-governance.md)
- [Debt & Knowledge Handoff](docs/debt-knowledge-handoff.md)
- [Unified Apply Plan](docs/unified-apply-plan.md)
- [Controlled Apply Readiness](docs/controlled-apply-readiness.md)
- [Approval Record Governance](docs/approval-record-governance.md)
- [Structured Evidence Schema](docs/structured-evidence-schema.md)
- [Work Queue](docs/work-queue.md)
- [Document Lifecycle](docs/document-lifecycle.md)
- [Document Archive Apply](docs/document-archive-apply.md)
- [Hook Orchestration](docs/hook-orchestration.md)
- [Project Hook Policy](docs/hook-policy.md)

基线和项目接入：

- [Baseline Pack System](docs/baseline-pack-system.md)
- [Standard Baseline Pack Registry](docs/standard-baseline-pack-registry.md)
- [Platform Standard Baseline Packs](docs/platform-standard-baseline-packs.md)
- [New Project Playbook](docs/adoption-playbooks/new-project.md)
- [Existing Light Project Playbook](docs/adoption-playbooks/existing-light-project.md)
- [Governed Read-Only Playbook](docs/adoption-playbooks/governed-project-read-only.md)
- [Production Project Adapter Playbook](docs/adoption-playbooks/production-project-adapter.md)

查规范：

- [Historical Plans](docs/plans/README.md)
- [Roadmaps](docs/roadmaps/README.md)
- [Scripts Reference](docs/reference/scripts.md)
- [Artifacts Reference](docs/reference/artifacts.md)
- [Checkers Reference](docs/reference/checkers.md)
- [Standard Baseline Packs Reference](docs/reference/standard-baseline-packs.md)
- [Industrial Packs Reference](docs/reference/industrial-packs.md)
- [Migration Index](docs/migrations/index.md)
- [Troubleshooting](docs/troubleshooting.md)
- [FAQ](docs/faq.md)

当前版本：

- [1.81.0 Release Record](releases/1.81.0/release-record.md)
- [1.74.3 Release Record](releases/1.74.3/release-record.md)
- [1.74.2 Release Record](releases/1.74.2/release-record.md)
- [1.74.1 Release Record](releases/1.74.1/release-record.md)
- [1.74.0 Release Record](releases/1.74.0/release-record.md)
- [1.73.0 Release Record](releases/1.73.0/release-record.md)
- [1.72.1 Release Record](releases/1.72.1/release-record.md)
- [1.72.0 Release Record](releases/1.72.0/release-record.md)
- [1.71.3 Release Record](releases/1.71.3/release-record.md)
- [1.71.2 Release Record](releases/1.71.2/release-record.md)
- [1.71.1 Release Record](releases/1.71.1/release-record.md)
- [1.71.0 Release Record](releases/1.71.0/release-record.md)
- [1.70.1 Release Record](releases/1.70.1/release-record.md)
- [1.70.0 Release Record](releases/1.70.0/release-record.md)
- [1.69.2 Release Record](releases/1.69.2/release-record.md)
- [1.69.1 Release Record](releases/1.69.1/release-record.md)
- [1.69.0 Release Record](releases/1.69.0/release-record.md)
- [1.68.2 Release Record](releases/1.68.2/release-record.md)
- [1.68.1 Release Record](releases/1.68.1/release-record.md)
- [1.68.0 Release Record](releases/1.68.0/release-record.md)
- [1.67.2 Release Record](releases/1.67.2/release-record.md)
- [1.67.1 Release Record](releases/1.67.1/release-record.md)
- [1.67.0 Release Record](releases/1.67.0/release-record.md)
- [1.66.0 Release Record](releases/1.66.0/release-record.md)
- [1.65.0 Release Record](releases/1.65.0/release-record.md)
- [1.64.0 Release Record](releases/1.64.0/release-record.md)
- [1.63.0 Release Record](releases/1.63.0/release-record.md)
- [1.62.0 Release Record](releases/1.62.0/release-record.md)
- [1.61.0 Release Record](releases/1.61.0/release-record.md)
- [1.60.0 Release Record](releases/1.60.0/release-record.md)
- [1.59.0 Release Record](releases/1.59.0/release-record.md)
- [1.58.0 Release Record](releases/1.58.0/release-record.md)
- [1.57.0 Release Record](releases/1.57.0/release-record.md)
- [1.56.0 Release Record](releases/1.56.0/release-record.md)
- [1.55.0 Release Record](releases/1.55.0/release-record.md)
- [1.54.0 Release Record](releases/1.54.0/release-record.md)
- [1.53.0 Release Record](releases/1.53.0/release-record.md)
- [1.51.0 Release Record](releases/1.51.0/release-record.md)
- [1.49.0 Release Record](releases/1.49.0/release-record.md)
- [1.48.0 Release Record](releases/1.48.0/release-record.md)
- [1.47.0 Release Record](releases/1.47.0/release-record.md)
- [1.46.0 Release Record](releases/1.46.0/release-record.md)
- [Version History](VERSION.md)

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). Commercial use, resale, paid redistribution, or use as part of commercial consulting/service delivery is not permitted without prior written permission. See [LICENSE.md](LICENSE.md), [LICENSE-FAQ.md](LICENSE-FAQ.md), and [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md).
