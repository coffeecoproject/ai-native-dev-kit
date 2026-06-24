# AI Native Dev Kit 中文说明

`ai-native-dev-kit` 是一套面向新项目和既有项目的 AI Native 软件开发工作流底座。

它的目标不是“让 AI 多写代码”，而是把软件开发拆成可沟通、可决策、可执行、可验证、可审查、可复盘的过程。

## 核心原则

1. 先规格，后实现。
2. 先评估，后编码。
3. 先做垂直切片，不做大而全重写。
4. AI 负责草案、执行和一致性检查；人负责判断、选择、确认和风险接受。
5. 每个任务都要有边界、验证和停止条件。
6. 高风险动作必须显式人工确认。
7. 项目经验要能沉淀成 workflow improvement、Skill candidate 或 dev-kit proposal。

## 完整流程

```text
Intent
  -> Project Onboarding
  -> Request Card
  -> Preflight
  -> Spec
  -> Eval
  -> Task Card
  -> Agent Execution
  -> Verification
  -> Review
  -> Release
  -> AI Task Log
  -> Workflow Improvement
  -> Skill Candidate when justified
```

## Project Onboarding

项目初始化后不要直接进入功能开发。先运行 project onboarding。

Onboarding 的作用是把“我要做一个项目”变成项目级上下文：

- 项目类型
- 目标平台
- 技术栈策略
- 业务规格索引
- 样例生成策略
- 待决策项
- 第一条 vertical slice

AI 负责根据沟通生成草案并更新文档；人只负责确认、否决、选择、补充和风险接受。

相关文件：

```text
docs/project-onboarding.md
docs/project-profile.md
docs/tech-stack-strategy.md
docs/business-spec-index.md
docs/sample-policy.md
docs/onboarding-decisions.md
```

检查命令：

```bash
node scripts/check-project-onboarding.mjs .
node scripts/check-project-onboarding.mjs . --strict
```

普通模式检查 onboarding 资产是否存在。`--strict` 用于人确认决策之后；如果仍有占位符或 pending 决策，会失败。

## 新项目初始化

推荐通过初始化脚本创建项目，不要直接复制 `starters/<name>/`。

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --starter generic-project \
  --target ../my-new-project
```

可选 starter：

```bash
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-web-app --target ../my-web-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-ios-app --target ../my-ios-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-android-app --target ../my-android-app
```

## 更新已有项目

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets
```

更新模式会：

- 刷新 `.ai-native/`
- 刷新 workflow scripts
- 刷新 GitHub Actions workflow
- 补齐缺失的 onboarding docs
- 补齐缺失的 workflow 目录
- 给 PR template 追加缺失的 governance 标记

更新模式不会覆盖已有项目文档、specs、tasks、logs 或业务代码。

## 项目生成后包含什么

```text
AGENTS.md
README.md
.ai-native/
  core/
  templates/
  prompts/
  checklists/
docs/
  ai-workflow.md
  project-onboarding.md
  project-profile.md
  tech-stack-strategy.md
  business-spec-index.md
  sample-policy.md
  onboarding-decisions.md
  product-vision.md
  engineering-principles.md
  risk-policy.md
  architecture.md
  domain-model.md
  permission-model.md
  test-strategy.md
requests/
preflight/
specs/
evals/
tasks/
ai-logs/
workflow-retros/
workflow-improvements/
skill-candidates/
automation-proposals/
dev-kit-proposals/
releases/
scripts/
  verify.sh
  check-ai-workflow.mjs
  check-project-onboarding.mjs
  check-workflow-version.mjs
  summarize-ai-logs.mjs
  workflow-daily-summary.mjs
.github/pull_request_template.md
.github/workflows/ai-workflow-checks.yml
```

## 日常使用顺序

1. 运行 project onboarding，让 AI 根据沟通生成项目上下文草案。
2. 人确认项目方向、技术栈、高风险边界、第一条 vertical slice。
3. 创建 `requests/` 下的需求入口。
4. 大需求先做 preflight。
5. 写 spec 和 eval。
6. 拆 task card。
7. AI 只执行一个 task card。
8. 跑 verification。
9. 人审查 diff、风险和证据。
10. 合并后写 AI task log。
11. 阶段性复盘进入 workflow retros。
12. 重复问题进入 workflow improvements。
13. 重复执行模式进入 skill candidates，但不能自动启用 active Skill。

## 自检

修改 dev kit 后运行：

```bash
node ai-native-dev-kit/scripts/check-dev-kit.mjs
```

生成项目后运行：

```bash
node scripts/check-ai-workflow.mjs .
node scripts/check-project-onboarding.mjs .
node scripts/check-workflow-version.mjs .
node scripts/summarize-ai-logs.mjs .
node scripts/workflow-daily-summary.mjs .
```

## Skill Governance

Skill 是后期封装，不是第一约束。

重复执行模式可以先写入 `skill-candidates/`，但不能自动生成、安装、更新或启用 active Skill。任何 active Skill 变更都需要人工明确批准。

## Automation Governance

Codex 可以提出项目级 automation，但不能自行创建、更新、恢复、删除或启用 automation。

Automation proposal 必须写在 `automation-proposals/`，并明确：

- 项目根目录
- schedule
- prompt
- allowed writes
- forbidden actions
- initial status
- review cadence

每日 automation 应跟随具体项目，而不是挂到共享 dev-kit 或父目录。

## 平台适配

核心 workflow 不绑定平台。平台差异只放在适配层：

- Codex: `AGENTS.md`
- Cursor: rules / project instructions
- Claude: project instructions / commands
- GitHub: PR template / Actions

目标应用平台通过 profile 和 starter 区分：

- Web
- Backend API
- iOS
- Android
- Internal Admin
- High-risk Change

## 版本

当前版本见 [VERSION.md](VERSION.md)。

生成项目会包含 `.ai-native/version.json`，用于记录 dev-kit 版本、starter 和最近一次 workflow asset 更新时间。

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).

You may view, download, copy, adapt, and share this material for personal, educational, and non-commercial purposes with attribution.

Commercial use, resale, paid redistribution, or use as part of commercial consulting/service delivery is not permitted without prior written permission.
