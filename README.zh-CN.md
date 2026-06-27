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

## 最小开始方式

先让 Codex 判断项目状态：

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
- 人负责风险接受、业务取舍和发布确认；AI 负责整理、执行、检查和记录。

## 完整说明

- [Operator Manual](docs/operator-manual.md)：完整操作手册
- [Quickstart](docs/quickstart.md)：快速开始
- [Codex Usage](docs/codex-usage.md)：Codex 使用路径
- [Mental Model](docs/mental-model.md)：整体心智模型
- [Artifact Decision Tree](docs/artifact-decision-tree.md)：什么时候用哪个文件
- [Goal + Subagent Usage](docs/goal-subagent-usage.md)：目标和 subagent 编排
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

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). Commercial use, resale, paid redistribution, or use as part of commercial consulting/service delivery is not permitted without prior written permission.
