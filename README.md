# AI Native Dev Kit

这是一套给软件项目使用的 AI 协作工作流。

它不是提示词合集，也不是让 AI 直接重写项目。它做的事更简单：让 Codex 或其他 AI 在项目里先判断、再记录、再执行、再验证，避免一上来乱改代码。

## 3 分钟理解

你可以把它当成一层项目治理：

- 新项目：从第一天开始把需求、风险、验证和记录放好。
- 已有项目：先补上下文，再接管新增需求，慢慢治理旧问题。
- 已上线或已有强治理项目：先只读评估，不直接初始化、不覆盖原有规则。

## 选择哪条路

先按项目风险选，不要一开始把所有能力都打开。

| 场景 | 建议路径 |
|---|---|
| 轻量试验、本地工具、小功能 | `O0 + BL0 + core workflow` |
| 普通真实项目、内部系统、中台功能 | `O1 + selected profiles + BL1` |
| 生产、客户、权限、数据、支付、发布风险项目 | `O2 + selected profiles + BL2 + selected industrial packs` |

Web 和微信小程序已经有 BL2 演练示例，但工业包仍按 maturity 管理；`draft` 不等于生产稳定标准。

## 最小用法

先看当前项目应该怎么接：

```bash
node scripts/cli.mjs next ../my-project
```

新项目可以初始化：

```bash
node scripts/cli.mjs init --starter generic-project --target ../my-project
```

已有项目先生成计划：

```bash
node scripts/cli.mjs update --target ../my-project --dry-run
```

迁移旧版本时只生成计划，不直接改项目：

```bash
node scripts/cli.mjs migrate --target ../my-project --from 0.33.0 --to 1.0.0 --dry-run
```

检查项目：

```bash
node scripts/cli.mjs check ../my-project --mode core
node scripts/cli.mjs doctor ../my-project
```

## 给 Codex 的一句话

在 Codex 里，把这个仓库地址或目录给它，然后说：

```text
请读取这套 AI Native Dev Kit，并自己判断当前项目状态，然后完成 workflow 配置。
```

如果你说“先看看、先沟通、先评估、不要执行”，Codex 只能读取和分析，不能改文件。

## 不要怎么用

- 不要把它当成万能模板直接全量复制。
- 不要在已上线项目里跳过只读评估。
- 不要默认启用所有工业包。
- 不要让 migration 命令直接改项目；当前迁移只产出计划。
- 不要把 Goal Card、Review Loop 或 subagent 输出当成人的风险批准。
- 不要让 helper subagent 一直保持 `RUNNING`。

## 完整文档

- [中文说明](README.zh-CN.md)
- [Operator Manual](docs/operator-manual.md)
- [Quickstart](docs/quickstart.md)
- [Codex Usage](docs/codex-usage.md)
- [Mental Model](docs/mental-model.md)
- [Artifact Decision Tree](docs/artifact-decision-tree.md)
- [Goal + Subagent Usage](docs/goal-subagent-usage.md)
- [Scripts Reference](docs/reference/scripts.md)
- [Artifacts Reference](docs/reference/artifacts.md)
- [Checkers Reference](docs/reference/checkers.md)
- [Industrial Packs Reference](docs/reference/industrial-packs.md)
- [New Project Playbook](docs/adoption-playbooks/new-project.md)
- [Existing Light Project Playbook](docs/adoption-playbooks/existing-light-project.md)
- [Governed Read-Only Playbook](docs/adoption-playbooks/governed-project-read-only.md)
- [Production Project Adapter Playbook](docs/adoption-playbooks/production-project-adapter.md)
- [Migration Index](docs/migrations/index.md)
- [0.33 to 1.0 Migration](docs/migrations/0.33-to-1.0.md)
- [Troubleshooting](docs/troubleshooting.md)
- [FAQ](docs/faq.md)
- [Productization Hardcut Plan](docs/productization-hardcut-1.0-plan.md)

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). See [LICENSE.md](LICENSE.md), [LICENSE-FAQ.md](LICENSE-FAQ.md), and [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md).
