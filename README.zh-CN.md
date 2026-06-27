# AI Native Dev Kit 中文说明

`ai-native-dev-kit` 是一套给软件项目接入 AI 协作的工作流底座。

它不是要求你理解很多专业概念，而是让 Codex 在项目里按固定顺序做事：先判断项目状态，先确认边界，再写规格、拆任务、执行、验证和复查。

## 适合什么项目

- 新项目：从一开始就有需求、风险、验证和记录。
- 已有项目：不重写旧代码，先补上下文，再让新增需求走规则。
- 已上线项目：先只读评估现有治理，再决定怎么接入。

## 怎么选

| 项目状态 | 推荐方式 |
|---|---|
| 试验、小工具、低风险功能 | `O0 + BL0 + core workflow` |
| 普通 Web、中台、小程序、App、后台服务 | `O1 + selected profiles + BL1` |
| 有客户、生产数据、权限、支付、发布风险 | `O2 + selected profiles + BL2 + selected industrial packs` |

平台 profile 负责区分 Web、iOS、Android、微信小程序、后端等工程差异。工业包只按需启用，不默认全开。

当前版本还补了两层保护：任务完成后先判断能不能演示、交接或进入发布审查；对话过程中如果用户只是讨论、改范围、提出新想法或问上线风险，Codex 要先识别边界，不能直接把聊天内容当成执行许可。

## 最小开始方式

第一步先让 Codex 判断这个项目怎么接：

```bash
node scripts/cli.mjs start ../my-project
```

这一步只读，不会写项目文件。它会告诉你当前项目更像新项目、已有项目、强治理项目、已上线风险项目、dirty worktree，还是已经接入过的项目。你只需要确认方向。

第二步让 Codex 判断这个项目需要什么工程基线和环境基线：

```bash
node scripts/cli.mjs baseline ../my-project
```

这一步也只读，不会写项目文件。它会把代码结构、数据库/API/权限规则、运行环境、构建测试、发布回滚、密钥边界里需要确认的内容列出来。真正写入基线文件时，必须先生成计划，再由人确认后应用。

如果要看更底层的状态：

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

保存过的接入建议可以检查：

```bash
node scripts/check-guided-adoption.mjs ../my-project
```

维护 Dev Kit 自身时，可以检查产品边界和声明口径：

```bash
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-context-governance.mjs .
node scripts/check-launch-readiness.mjs .
node scripts/check-conversation-drift.mjs .
```

## Codex 一句话入口

把仓库地址、目录或文件给 Codex，然后说：

```text
请读取这套 AI Native Dev Kit，并自己判断当前项目状态，然后完成 workflow 配置。
```

如果你说“先看下、先沟通、先评估、不要执行”，Codex 只能分析，不能改文件。

## 重要边界

- 不是每次都要开 Goal Card 或 subagent；按任务风险决定。
- 不是每次改动都走最重流程；任务完成后再进入 Review Loop。
- 不是所有工业包都装进项目；只启用项目需要的部分。
- 已上线或强治理项目不要直接初始化；先走只读接入评估。
- `migrate` 当前只生成计划，不直接改目标项目。
- `baseline` 默认只生成建议，不直接改目标项目。
- 人负责风险接受、业务取舍和发布确认；AI 负责整理、执行、检查和记录。
- 不要把模拟 dogfood 或生成项目 smoke 说成真实生产验证。
- 不要把 AI 推断出的环境、发布、回滚、监控信息当成已确认事实。
- 不要把 Codex 观察到的内容直接当成项目记忆；必须先做人确认。
- 不要把 `READY_FOR_DEMO`、`READY_FOR_INTERNAL_HANDOFF` 或 `READY_FOR_RELEASE_REVIEW` 当成生产上线批准。
- 不要把讨论、旁路问题、范围变化或风险问题直接当成继续当前任务的许可。

## 完整说明

- [Operator Manual](docs/operator-manual.md)：完整操作手册
- [Quickstart](docs/quickstart.md)：快速开始
- [First Hour](docs/first-hour.md)：第一次接入项目时怎么走
- [Codex Usage](docs/codex-usage.md)：Codex 使用路径
- [Mental Model](docs/mental-model.md)：整体心智模型
- [Artifact Decision Tree](docs/artifact-decision-tree.md)：什么时候用哪个文件
- [Goal + Subagent Usage](docs/goal-subagent-usage.md)：目标和 subagent 编排
- [Baseline Setup](docs/baseline-setup.md)：工程基线与环境基线设置
- [Guided Delivery Baseline](docs/guided-delivery-baseline.md)：引导式交付基准
- [Product Baseline](docs/product-baseline.md)：产品边界
- [Claim Control](docs/claim-control.md)：声明口径控制
- [Project Memory](docs/project-memory.md)：项目记忆与上下文治理
- [Git Boundary](docs/git-boundary.md)：哪些内容应该进 Git
- [Context Governance Usage](docs/context-governance-usage.md)：上下文治理怎么用
- [Minimal Commit Set](docs/minimal-commit-set.md)：提交时只提交什么
- [Safe Launch](docs/safe-launch.md)：交付前判断能不能演示、交接或进入发布审查
- [Conversation Drift Control](docs/conversation-drift-control.md)：对话偏移和范围变化控制
- [Scripts Reference](docs/reference/scripts.md)：命令说明
- [Artifacts Reference](docs/reference/artifacts.md)：文件说明
- [Checkers Reference](docs/reference/checkers.md)：检查器说明
- [Industrial Packs Reference](docs/reference/industrial-packs.md)：工业包说明
- [New Project Playbook](docs/adoption-playbooks/new-project.md)：新项目接入
- [Existing Light Project Playbook](docs/adoption-playbooks/existing-light-project.md)：已有轻治理项目接入
- [Governed Read-Only Playbook](docs/adoption-playbooks/governed-project-read-only.md)：强治理项目只读接入
- [Production Project Adapter Playbook](docs/adoption-playbooks/production-project-adapter.md)：已上线项目 adapter 接入
- [Migration Index](docs/migrations/index.md)：迁移入口
- [0.33 to 1.0 Migration](docs/migrations/0.33-to-1.0.md)：0.33 到 1.0 迁移说明
- [Troubleshooting](docs/troubleshooting.md)：常见问题处理
- [FAQ](docs/faq.md)：问答
- [1.6 Release Record](releases/1.6.0/release-record.md)：1.6 对话偏移控制
- [1.5 Release Record](releases/1.5.0/release-record.md)：1.5 安全交付就绪
- [1.4.1 Release Record](releases/1.4.1/release-record.md)：1.4.1 上下文治理使用修整
- [1.4 Release Record](releases/1.4.0/release-record.md)：1.4 项目记忆与上下文治理
- [1.3 Release Record](releases/1.3.0/release-record.md)：1.3 引导式交付基准
- [1.2 Release Record](releases/1.2.0/release-record.md)：1.2 基线引导设置
- [1.1 Release Record](releases/1.1.0/release-record.md)：1.1 引导式接入入口
- [1.0 Release Record](releases/1.0.0/release-record.md)：1.0 发布边界

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). Commercial use, resale, paid redistribution, or use as part of commercial consulting/service delivery is not permitted without prior written permission.
