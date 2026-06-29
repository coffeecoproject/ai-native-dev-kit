# AI Native Dev Kit

`ai-native-dev-kit` 是一套让 Codex 或其他 AI 安全接入软件项目的工作流底座。

它不是提示词合集，也不是代码模板。它解决的是一个更现实的问题：AI 进入项目后，应该先理解项目、确认边界、写下计划，再执行、验证和复查，而不是一上来改代码。

## 3 分钟理解

可以把它理解成一层“AI 协作治理”。

| 项目类型 | 默认做法 |
|---|---|
| 新项目 | 从第一天开始沉淀需求、风险、工程规则、验证和记录 |
| 已有项目 | 先读现有代码和规则，再让新增需求走统一流程 |
| 已上线项目 | 先只读评估现有治理，不直接初始化、不覆盖原规则 |

核心顺序是：

```text
读项目 -> 判断状态 -> 推荐路径 -> 人确认关键决策 -> AI 按计划执行
```

所有需要判断的输出，会先给“推荐选项、备选方案、是否写文件、风险、不处理会怎样”，再给技术细节。用户只需要做选择和确认，不需要先看懂内部状态码。

## 它解决什么

- 避免 AI 没读懂项目就直接改代码。
- 把工程规范、运行环境、发布边界先说清楚。
- 把“人做判断”和“AI 做执行”分开。
- 避免聊天、讨论、临时想法被误当成执行许可。
- 修复杂问题前先判断修复尺度，避免小补丁掩盖结构问题。
- 对真实强治理项目，先映射已有规则，而不是复制一套新规则进去。

## 怎么选

不要一开始把所有能力都打开，先按项目风险选。

| 项目状态 | 推荐方式 |
|---|---|
| 试验、小工具、低风险功能 | `O0 + BL0 + core workflow` |
| 普通 Web、中台、小程序、App、后台服务 | `O1 + selected profiles + BL1 + selected standard packs` |
| 有客户、生产数据、权限、支付、发布风险 | `O2 + selected profiles + BL2 + selected standard packs + selected industrial overlays` |

平台 profile 负责区分 Web、iOS、Android、微信小程序、后端、内部管理系统、高风险变更等工程差异。

标准基线包是普通项目的工程护栏。工业包是生产敏感、高风险、客户数据、支付、发布等增强护栏。默认先推荐最小标准基线；工业包只作为可选增强，不默认启用，`draft` 不等于生产稳定。

## 最小开始方式

第一步，让 Codex 只读判断项目状态：

```bash
node scripts/cli.mjs start ../my-project
```

第二步，让 Codex 判断需要哪些工程基线和环境基线：

```bash
node scripts/cli.mjs baseline ../my-project
```

第三步，让 Codex 用白话给出“基线决策卡”，用户只确认项目状态、风险和是否允许继续：

```bash
node scripts/cli.mjs baseline-decision ../my-project
```

第四步，如果项目可能涉及平台、后台、权限、数据、支付或发布风险，让 Codex 只读推荐基线包：

```bash
node scripts/cli.mjs standard-baseline ../my-project
node scripts/cli.mjs baseline-packs ../my-project
```

如果要看更底层的工作流状态：

```bash
node scripts/cli.mjs next ../my-project
```

新项目初始化：

```bash
node scripts/cli.mjs init --starter generic-project --target ../my-project
```

已有项目先预览，不直接写入：

```bash
node scripts/cli.mjs update --target ../my-project --dry-run
```

旧版本升级先生成迁移计划：

```bash
node scripts/cli.mjs migrate --target ../my-project --from 0.33.0 --to 1.0.0 --dry-run
```

检查项目：

```bash
node scripts/cli.mjs check ../my-project --mode core
node scripts/cli.mjs doctor ../my-project
```

## Codex 一句话入口

把仓库地址、目录或文件给 Codex，然后说：

```text
请读取这套 AI Native Dev Kit，并自己判断当前项目状态，然后完成 workflow 配置。
```

如果你说“先看下、先沟通、先评估、不要执行”，Codex 只能分析，不能改文件。

## 核心能力

| 能力 | 作用 |
|---|---|
| 引导式接入 | 先判断项目是新项目、已有项目、强治理项目、生产敏感项目、dirty worktree，还是已接入项目 |
| 基线决策卡 | 把 BL0/BL1/BL2、标准包、工业包候选、风险和下一步翻译成用户可确认的短卡片 |
| 工程/环境基线 | 明确代码结构、数据库、API、权限、运行环境、构建测试、发布回滚和密钥边界 |
| 标准基线包 | 先按平台、后台、发布回滚等普通工程需要推荐最小标准基线 |
| 工业增强包 | 只在 BL2、高风险、生产敏感、客户数据、支付或发布风险存在时作为可选叠加 |
| Goal + Subagent | 只有需要时才使用目标卡和 helper agent，并要求用完关闭 |
| Review Loop | 任务完成后复查，限制自动修复，把风险问题交给人判断 |
| 项目记忆治理 | Git 和已确认文档优先于聊天记录、模型记忆和 AI 推断 |
| 安全交付判断 | 区分可以演示、可以交接、可以进入发布审查，还是还不 ready |
| 对话偏移控制 | 识别讨论、范围变化、新想法和风险问题，避免误执行 |
| 首次交付演练 | 从一句想法走完一次需求、规格、任务、验证、复查和交付边界 |
| 真实项目只读接入 | 对已上线或强治理项目，先映射现有治理，不覆盖原流程 |
| 补丁分类 | 修复杂问题前先判断是安全小修、结构治理、需要人决策，还是不能补丁化处理 |

`real-adoption` 和 `patch-classification` 检查的是已经记录好的证据，不会自动扫描真实项目、写入桥接文件或批准实现。

## Dev Kit 自检

维护 Dev Kit 自身时，可以检查产品边界和声明口径：

```bash
npm run verify
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-launch-readiness.mjs .
node scripts/check-conversation-drift.mjs .
node scripts/check-guided-delivery-loop.mjs .
node scripts/check-first-delivery-walkthrough.mjs .
node scripts/check-real-adoption-trial.mjs .
node scripts/check-patch-classification.mjs .
node scripts/check-change-boundary.mjs .
node scripts/check-baseline-state.mjs .
node scripts/resolve-guided-baseline-selection.mjs .
node scripts/check-guided-baseline-selection.mjs .
node scripts/resolve-standard-baseline.mjs .
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-standard-baseline-selection.mjs .
node scripts/resolve-baseline-packs.mjs .
node scripts/check-baseline-pack-selection.mjs .
node scripts/check-guided-adoption.mjs .
```

## 重要边界

- 不是每次都要开 Goal Card 或 subagent；按任务风险决定。
- 不是每次改动都走最重流程；任务完成后再进入 Review Loop。
- 不是所有标准包或工业包都装进项目；只启用项目需要且被人确认的部分。
- 已上线或强治理项目不要直接初始化；先走只读接入评估。
- `baseline` 默认只生成建议，不直接改目标项目。
- `migrate` 当前只生成计划，不直接改目标项目。
- 人负责风险接受、业务取舍和发布确认；AI 负责整理、执行、检查和记录。
- 不要把模拟 dogfood、生成项目 smoke、首次交付演练说成真实生产验证。
- 不要把 AI 推断出的环境、发布、回滚、监控信息当成已确认事实。
- 不要把 Codex 观察到的内容直接当成项目记忆；必须先做人确认。
- 不要把 `READY_FOR_DEMO`、`READY_FOR_INTERNAL_HANDOFF` 或 `READY_FOR_RELEASE_REVIEW` 当成生产上线批准。
- 不要把讨论、范围变化、旁路问题或风险问题直接当成继续当前任务的许可。
- 不要把真实项目只读接入报告当成允许写入项目。
- 不要把补丁分类报告当成允许实现；它只判断修复尺度。
- 不要把基线决策卡当成写入、实现、发布或 BL2 启用授权；它只帮助用户确认路径。
- 不要把标准基线包推荐当成已经选择、写入授权或具体实现任务批准。
- 不要把工业包推荐当成已经选择或已经批准；BL2、draft 包和风险包都需要人确认。

## 完整说明

先读这些：

- [中文说明](README.zh-CN.md)
- [Operator Manual](docs/operator-manual.md)：完整操作手册
- [Quickstart](docs/quickstart.md)：快速开始
- [First Hour](docs/first-hour.md)：第一次接入项目时怎么走
- [Codex Usage](docs/codex-usage.md)：Codex 使用路径
- [Mental Model](docs/mental-model.md)：整体心智模型

使用工作流：

- [Artifact Decision Tree](docs/artifact-decision-tree.md)：什么时候用哪个文件
- [Goal + Subagent Usage](docs/goal-subagent-usage.md)：目标和 subagent 编排
- [Guided Delivery Baseline](docs/guided-delivery-baseline.md)：引导式交付基准
- [Product Baseline](docs/product-baseline.md)：产品边界
- [Claim Control](docs/claim-control.md)：声明口径控制
- [Project Memory](docs/project-memory.md)：项目记忆与上下文治理
- [Git Boundary](docs/git-boundary.md)：哪些内容应该进 Git
- [Context Governance Usage](docs/context-governance-usage.md)：上下文治理怎么用
- [Minimal Commit Set](docs/minimal-commit-set.md)：提交时只提交什么
- [Safe Launch](docs/safe-launch.md)：交付前判断能不能演示、交接或进入发布审查
- [Conversation Drift Control](docs/conversation-drift-control.md)：对话偏移和范围变化控制
- [First Delivery Walkthrough](docs/first-delivery-walkthrough.md)：从一句想法到首个 demo 边界的完整演练
- [Guided Decision & Delivery Loop](docs/guided-decision-delivery-loop.md)：让 Codex 推荐最小安全路径，用户只确认目标、取舍和风险
- [Guided Baseline Selection Entry](docs/guided-baseline-selection-entry.md)：把基线选择变成用户看得懂的决策卡
- [Standard Baseline Pack Registry](docs/standard-baseline-pack-registry.md)：先选普通工程标准基线，再看是否需要工业增强
- [Platform Standard Baseline Packs](docs/platform-standard-baseline-packs.md)：按 Web、小程序、iOS、Android、中台等平台推荐普通标准基线
- [Change Boundary](docs/change-boundary.md)：检查实际改动是否仍在本次任务边界内
- [Baseline State](docs/baseline-state.md)：区分基线是建议、待确认、需证据，还是已确认
- [Guided Delivery Check](docs/guided-delivery-check.md)：检查当前主线、停车场和 D0-D4 决策边界
- [Real Adoption Usage](docs/real-adoption-usage.md)：真实项目只读接入怎么用
- [Baseline Pack System](docs/baseline-pack-system.md)：按项目级别、平台、能力和风险选择基线包

接入项目：

- [Baseline Setup](docs/baseline-setup.md)：工程基线与环境基线设置
- [New Project Playbook](docs/adoption-playbooks/new-project.md)：新项目接入
- [Existing Light Project Playbook](docs/adoption-playbooks/existing-light-project.md)：已有轻治理项目接入
- [Governed Read-Only Playbook](docs/adoption-playbooks/governed-project-read-only.md)：强治理项目只读接入
- [Production Project Adapter Playbook](docs/adoption-playbooks/production-project-adapter.md)：已上线项目 adapter 接入

查规范：

- [Scripts Reference](docs/reference/scripts.md)：命令说明
- [Artifacts Reference](docs/reference/artifacts.md)：文件说明
- [Checkers Reference](docs/reference/checkers.md)：检查器说明
- [Standard Baseline Packs Reference](docs/reference/standard-baseline-packs.md)：标准基线包说明
- [Platform Standard Baseline Matrix](docs/reference/platform-standard-baseline-matrix.md)：平台标准基线矩阵
- [Industrial Packs Reference](docs/reference/industrial-packs.md)：工业包说明
- [Migration Index](docs/migrations/index.md)：迁移入口
- [0.33 to 1.0 Migration](docs/migrations/0.33-to-1.0.md)：0.33 到 1.0 迁移说明
- [Troubleshooting](docs/troubleshooting.md)：常见问题处理
- [FAQ](docs/faq.md)：问答

版本记录：

- [1.19.1 Release Record](releases/1.19.1/release-record.md)：1.19.1 基线选择指标校验
- [1.19 Release Record](releases/1.19.0/release-record.md)：1.19 基线选择准确性校准
- [1.18.1 Release Record](releases/1.18.1/release-record.md)：1.18.1 基线选择检查收口
- [1.18 Release Record](releases/1.18.0/release-record.md)：1.18 基线选择校准
- [1.17.1 Release Record](releases/1.17.1/release-record.md)：1.17.1 基线决策卡校准
- [1.17 Release Record](releases/1.17.0/release-record.md)：1.17 引导式基线决策卡入口
- [1.16 Release Record](releases/1.16.0/release-record.md)：1.16 BL2 工业基线深化
- [1.15.1 Release Record](releases/1.15.1/release-record.md)：1.15.1 标准包注册表硬化
- [1.15 Release Record](releases/1.15.0/release-record.md)：1.15 平台标准基线包
- [1.14.1 Release Record](releases/1.14.1/release-record.md)：1.14.1 标准基线包校验硬化
- [1.14 Release Record](releases/1.14.0/release-record.md)：1.14 标准基线包注册表
- [1.13 Release Record](releases/1.13.0/release-record.md)：1.13 基线包选择系统
- [1.12.1 Release Record](releases/1.12.1/release-record.md)：1.12.1 manifest、README 自检入口和 fallback 同步
- [1.12 Release Record](releases/1.12.0/release-record.md)：1.12 变更边界、引导式交付检查与基线状态保护
- [1.11 Release Record](releases/1.11.0/release-record.md)：1.11 治理硬化与漂移防护
- [1.10 Release Record](releases/1.10.0/release-record.md)：1.10 引导式决策与交付闭环
- [1.9 Release Record](releases/1.9.0/release-record.md)：1.9 人类决策摘要
- [1.8.1 Release Record](releases/1.8.1/release-record.md)：1.8.1 真实项目接入校准
- [1.8 Release Record](releases/1.8.0/release-record.md)：1.8 真实项目只读接入与补丁分类治理
- [1.7 Release Record](releases/1.7.0/release-record.md)：1.7 首次交付演练
- [1.6 Release Record](releases/1.6.0/release-record.md)：1.6 对话偏移控制
- [1.5 Release Record](releases/1.5.0/release-record.md)：1.5 安全交付就绪
- [1.4.1 Release Record](releases/1.4.1/release-record.md)：1.4.1 上下文治理使用修整
- [1.4 Release Record](releases/1.4.0/release-record.md)：1.4 项目记忆与上下文治理
- [1.3 Release Record](releases/1.3.0/release-record.md)：1.3 引导式交付基准
- [1.2 Release Record](releases/1.2.0/release-record.md)：1.2 基线引导设置
- [1.1 Release Record](releases/1.1.0/release-record.md)：1.1 引导式接入入口
- [1.0 Release Record](releases/1.0.0/release-record.md)：1.0 发布边界
- [Productization Hardcut Plan](docs/productization-hardcut-1.0-plan.md)

治理说明：

- `.github/CODEOWNERS` 当前只记录 owner 规则待确认，不声明假 owner；代码所有权强制审查需要维护者账号确认后再启用。

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). See [LICENSE.md](LICENSE.md), [LICENSE-FAQ.md](LICENSE-FAQ.md), and [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md).
