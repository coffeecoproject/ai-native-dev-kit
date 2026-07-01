# IntentOS

An AI-native system for guided software delivery.

Formerly: **AI Native Dev Kit**.

Current release: `1.48.0`.

Naming note: **IntentOS** is the product and workflow-system name. `AI Native Dev Kit` is the historical repository/package lineage. The `intentos` command alias is available; `ai-native` remains as a compatibility alias.

Version note: `1.4.0` was the historical Project Memory phase. The current line is `1.48.x`, focused on change impact coverage so business-rule changes do not stop at one layer.

1.48.0 adds Change Impact Coverage: when a task changes validation, input rules, API behavior, backend logic, data, permissions, or user-facing messages, Codex records which related surfaces must be handled, ruled out, or sent back for human decision.

> You describe the goal. AI reads the project, recommends the path, asks for the few decisions that matter, and only then helps move the work forward.

IntentOS is not a prompt collection, a code template, or a framework starter. It is a workflow and governance layer for Codex and other AI coding agents.

It helps AI avoid the most common failure mode in software projects: changing code before it understands the project, the risk, the current task, and the human decision boundary.

## 3 分钟理解

IntentOS 把 AI 协作开发拆成一条可控路径：

```text
用户目标 -> 读项目 -> 判断状态 -> 推荐路径 -> 人确认关键决策 -> 计划写入 -> 执行 -> 验证 -> 复查 -> 收口
```

| 项目状态 | 默认方式 |
|---|---|
| 新项目 | 先确认目标、平台、基线和第一版范围，再开始搭建 |
| 已有项目 | 先读现有代码、文档和规则，再接管新增需求 |
| 已上线项目 | 默认只读接入，先映射现有治理，不覆盖发布和回滚流程 |

核心原则很简单：

- 用户负责目标、取舍、风险接受和发布确认。
- AI 负责读取、整理、生成计划、执行、验证和记录。
- 所有可能写入项目的动作，都必须先变成可确认的计划。

## Start With One Sentence

Most users should start here:

```text
我想做一个预约 App，你帮我开始。
```

Codex should treat a natural-language project goal as the default IntentOS entry and route it through Beginner Entry behavior.

For maintainers, CI, or explicit command-line evidence, the equivalent command is:

```bash
node scripts/cli.mjs ask ../my-project "我想做一个预约 App"
```

或者在当前项目里：

```bash
node scripts/cli.mjs ask "我想把当前项目接入 IntentOS"
```

`ask` 会输出一张 Beginner Entry Card，说明：

- AI 理解了什么；
- 建议先走哪条路径；
- 需要你确认哪几个问题；
- Codex 下一步可以安全做什么；
- Codex 现在不能做什么。

你不需要先知道 `workflow-map`、`baseline-decision`、`apply-plan`、`BL2` 或 hook policy 是什么。Codex 会自己选择内部路径，并把结果翻译成人能判断的内容。

1.37 adds Conversation-Native Ask: the command is implementation evidence, not something the user must know before starting.

## When To Use It

| 场景 | IntentOS 会怎么处理 |
|---|---|
| 从 0 做一个产品 | 先确认平台、目标用户、第一条核心流程和工程基线 |
| 进行中的项目 | 先检查当前状态、未完成任务、基线缺口和可写入范围 |
| 老项目接入 AI | 先做 existing workflow mapping，不直接复制整套规则 |
| 已上线项目 | 默认 read-only adapter，保护现有 CI、发布、回滚和证据链 |
| 任务做到一半被打断 | 用 Work Queue / Todo 记录当前任务、暂停任务和恢复入口 |
| 想加 hook 或自动化 | 先生成 hook plan / hook policy，不自动安装、不改 CI |
| 复杂问题怕被补丁化 | 先做 patch classification，再决定是小修、结构治理还是人工决策 |

## Project Levels

IntentOS 不鼓励一上来启用最重治理。它按项目风险分层：

| 级别 | 适合项目 | 默认建议 |
|---|---|---|
| O0 / BL0 | 试验、小工具、低风险功能 | 轻量流程和最小基线 |
| O1 / BL1 | 普通 Web、中台、小程序、App、后台服务 | 标准流程、平台 profile、标准基线包 |
| O2 / BL2 | 有客户、生产数据、权限、支付、发布风险 | 标准基线 + 按需工业增强包 + 更严格证据 |

平台 profile 用来区分 Web、iOS、Android、微信小程序、后端、内部管理系统和高风险变更。标准基线包处理普通工程质量；工业增强包只在 BL2、高风险或生产敏感场景下按需启用。

## What Is Included

IntentOS 当前包含这些核心能力：

| 能力 | 作用 |
|---|---|
| Conversation-Native Ask | 用户直接说目标，Codex 自动按入口流程判断 |
| Beginner Entry | 用户只说目标，AI 给出可确认的下一步 |
| Guided Adoption | 判断项目是新项目、老项目、强治理项目还是生产敏感项目 |
| Baseline Decision | 用白话确认 BL0 / BL1 / BL2、平台和风险 |
| Ordinary First Slice | 把普通用户的一句话目标整理成第一版范围、问题、延期项和验证方式 |
| Product Completeness | 判断现在是想法、第一版范围、可本地运行 MVP、内测候选还是阻塞 |
| Real MVP Example | 用内置预约和看板 Web MVP 样例证明这条链路可以本地跑通 |
| Standard Baseline Packs | 为不同平台提供普通工程基线 |
| Industrial Overlays | 为生产、客户数据、权限、支付、发布等风险提供增强治理 |
| Review Surface | 执行前判断任务完成后需要审哪些面 |
| Change Impact Coverage | 防止业务规则只改一层，要求前端、API、后端、文案、测试和交接等相关面逐项收口 |
| Review Loop | 任务完成后复查、自动修复可修项、把风险交给人 |
| Unified Apply Plan | 所有写入动作先进入一张可审查计划 |
| Controlled Apply Readiness | 判断计划是否具备未来“人工批准后受控执行”的条件 |
| Low-Risk Apply Candidate | 判断一个小改动是否足够窄、可回滚、可验证，能否进入后续人工批准计划 |
| Approval Record | 记录人明确批准了哪些 action、哪些路径、到什么时候过期 |
| Work Queue / Todo | 管理当前任务、暂停任务、停车场和恢复入口 |
| Document Lifecycle | 识别过期、重复、废弃文档和 source of truth，默认建议归档，不默认删除 |
| Hook Policy | 定义项目允许哪些 hook、谁确认、怎么禁用和回滚 |
| Execution Closure | 收口改动范围、验证结果、债务和提交前证据 |
| Project Memory | 让 Git 和已确认文档优先于聊天记录、模型记忆和 AI 推断 |

## User Entry

Most users only need this pattern:

```text
Tell Codex the project goal in plain language.
Codex reads the project, recommends the path, and asks for the few decisions that matter.
```

For durable command-line evidence, use:

| 你想做什么 | 命令 |
|---|---|
| 用一句话开始 | `node scripts/cli.mjs ask ../my-project "我想做一个预约 App"` |
| 明确第一版范围 | `node scripts/cli.mjs first-slice ../my-project "我想做一个预约 App"` |
| 判断是否像一个产品 | `node scripts/cli.mjs product-completeness ../my-project --evidence evidence/smoke-output.txt` |
| 看更完整的下一步建议 | `node scripts/cli.mjs guide ../my-project --deep --intent "我要加支付预约"` |
| 检查一次规则变更会影响哪些面 | `node scripts/cli.mjs impact-coverage ../my-project --intent "新增合同录入限制"` |
| 写入前生成统一计划 | `node scripts/cli.mjs apply-plan ../my-project --intent "接入 IntentOS"` |
| 判断小改动能否进入后续人工批准计划 | `node scripts/cli.mjs apply-candidate ../my-project --intent "update local demo copy" --path src/example.js` |

You do not need to choose internal workflow commands before starting.

## Maintainer And Evidence Commands

These commands are for maintainers, CI, audits, and explicit evidence:

| 你想做什么 | 命令 |
|---|---|
| 判断项目状态 | `node scripts/cli.mjs start ../my-project` |
| 选择项目基线 | `node scripts/cli.mjs baseline-decision ../my-project` |
| 老项目先映射现有治理 | `node scripts/cli.mjs workflow-map ../my-project` |
| 判断计划是否具备受控执行条件 | `node scripts/cli.mjs apply-readiness ../my-project --plan apply-plans/001-example.md` |
| 检查人工批准记录 | `node scripts/cli.mjs approval-record-check ../my-project` |
| 处理中断任务 | `node scripts/cli.mjs work-queue ../my-project` |
| 检查文档生命周期 | `node scripts/cli.mjs doc-lifecycle ../my-project` |
| 检查变更影响覆盖报告 | `node scripts/cli.mjs impact-coverage-check ../my-project` |
| 规划 hook 而不安装 | `node scripts/cli.mjs hook-policy ../my-project` |
| 执行完成后收口 | `node scripts/cli.mjs closure ../my-project --intent "完成预约校验" --verification "npm run verify passed"` |
| 检查当前配置 | `node scripts/cli.mjs check ../my-project --mode core` |

完整命令见 [Scripts Reference](docs/reference/scripts.md)。

## Safety Boundaries

IntentOS 默认保护这些边界：

- 不因为一句话就写文件。
- 不把建议当成执行授权。
- 不自动改 CI、hook、发布流程或生产配置。
- 不自动启用 BL2 或工业增强包。
- 不自动删除、移动、归档或重写文档。
- 不替用户批准权限、支付、税务、法务、数据迁移、生产发布等高风险决策。
- 不覆盖已有强治理项目的规则；先只读映射，再决定是否选择性接入。

一句话：IntentOS 让 AI 更会推进项目，但不让 AI 替人做风险决定。

## New, Existing, And Production Projects

新项目可以直接从自然语言目标开始：

```bash
node scripts/cli.mjs ask ../new-project "我想做一个中小企业管理中台"
```

已有项目应该先读项目，再决定接入方式：

```bash
node scripts/cli.mjs start ../existing-project
node scripts/cli.mjs workflow-map ../existing-project
```

已上线或强治理项目默认只读：

```bash
node scripts/cli.mjs guide ../production-project --deep --intent "接入 IntentOS"
```

如果后续确实需要写入，先生成计划：

```bash
node scripts/cli.mjs apply-plan ../my-project --intent "接入 IntentOS 工作流"
```

## Verify This Repository

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
node scripts/check-low-risk-apply-candidate.mjs . --require-structured-evidence
node scripts/check-change-impact-coverage.mjs .
```

## Documentation

Start here:

- [Documentation Home](docs/README.md)
- [Documentation Index](docs/index.md)
- [Operator Manual](docs/operator-manual.md)
- [Quickstart](docs/quickstart.md)
- [First Hour](docs/first-hour.md)
- [Beginner Entry](docs/beginner-entry.md)
- [Conversation-Native Ask](docs/conversation-native-ask.md)
- [Natural Language Orchestrator](docs/natural-language-orchestrator.md)
- [Existing Project Workflow Adapter](docs/existing-project-workflow-adapter.md)

Core workflow:

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

Baselines and project adoption:

- [Baseline Pack System](docs/baseline-pack-system.md)
- [Standard Baseline Pack Registry](docs/standard-baseline-pack-registry.md)
- [Platform Standard Baseline Packs](docs/platform-standard-baseline-packs.md)
- [New Project Playbook](docs/adoption-playbooks/new-project.md)
- [Existing Light Project Playbook](docs/adoption-playbooks/existing-light-project.md)
- [Governed Read-Only Playbook](docs/adoption-playbooks/governed-project-read-only.md)
- [Production Project Adapter Playbook](docs/adoption-playbooks/production-project-adapter.md)

Reference:

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

Current release:

- [1.48.0 Release Record](releases/1.48.0/release-record.md)
- [1.47.0 Release Record](releases/1.47.0/release-record.md)
- [1.46.0 Release Record](releases/1.46.0/release-record.md)
- [Version History](VERSION.md)

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). See [LICENSE.md](LICENSE.md), [LICENSE-FAQ.md](LICENSE-FAQ.md), and [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md).
