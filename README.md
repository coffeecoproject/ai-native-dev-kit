# AI Native Dev Kit

中文详细说明见 [README.zh-CN.md](README.zh-CN.md)。

快速开始见 [docs/quickstart.md](docs/quickstart.md)，Codex 使用路径见 [docs/codex-usage.md](docs/codex-usage.md)。

## 定位

`ai-native-dev-kit` 是一套新项目启动时可复用的 AI Native 软件开发工作流底座。

它不是某个业务项目，也不是某个 AI 工具的专用 prompt。它负责把模糊需求转成可执行、可验证、可审查、可回滚、可复盘的软件变更。

核心原则：

1. Spec before code.
2. Eval before implementation.
3. Vertical slice first.
4. Human owns judgment, AI owns execution.
5. Small task, hard boundary.
6. Cost-aware by default.
7. Trace everything.

## 完整工作流

```text
Intent
  -> Project Onboarding
  -> Intake / Request Card
  -> Preflight Gate
  -> Spec Pack
  -> Eval Pack
  -> Task Cards
  -> Agent Execution
  -> Verification Gate
  -> Review Gate
  -> Release Gate
  -> AI Task Log
  -> Workflow Improvement
  -> Skill Candidate when justified
```

## 目录结构

```text
ai-native-dev-kit/
  core/          通用流程、任务分级、门禁和平台策略
  templates/     可复制到项目中的标准模板
  prompts/       不同 AI agent 角色的稳定 prompt
  checklists/    scope、risk、verification、release 等检查清单
  scripts/       初始化和工作流完整性检查脚本
  docs/          quickstart 和 Codex 使用说明
  platforms/     Codex、Cursor、Claude、GitHub 等平台适配
  profiles/      Web、Backend、iOS、Android、Internal Admin、高风险变更等可选 profile
  starters/      供 init-project 使用的新项目骨架，不建议手动直接复制
  examples/      纯工作流示例，不作为业务模板
```

## 新项目推荐用法

第一阶段先用 `init-project.mjs` 初始化，不急着做 Skill 或复杂 CLI。

不要手动直接复制 `starters/<name>/`。starter 只是骨架，完整项目还需要初始化脚本注入 `.ai-native/`、workflow scripts 和 CI workflow。

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --starter generic-project \
  --target ../my-new-project
```

可选 starter:

```bash
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-web-app --target ../my-web-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-ios-app --target ../my-ios-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-android-app --target ../my-android-app
```

更新已有项目的工作流资产：

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets
```

该更新模式会更新或补齐：

- `.ai-native/`
- `scripts/check-ai-workflow.mjs`
- `scripts/summarize-ai-logs.mjs`
- `scripts/check-workflow-version.mjs`
- `scripts/workflow-daily-summary.mjs`
- `scripts/check-project-onboarding.mjs`
- `scripts/check-workflow-artifacts.mjs`
- `scripts/new-workflow-item.mjs`
- 缺失的 `docs/project-onboarding.md`
- 缺失的 `docs/project-profile.md`
- 缺失的 `docs/tech-stack-strategy.md`
- 缺失的 `docs/business-spec-index.md`
- 缺失的 `docs/sample-policy.md`
- 缺失的 `docs/onboarding-decisions.md`
- `.github/workflows/ai-workflow-checks.yml`

不会修改业务代码，不会覆盖已有项目 docs，不会覆盖既有 requests、specs、tasks、ai-logs 等工作记录；只会补齐缺失的 onboarding docs 和工作流目录。

初始化后，新项目会得到：

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
  summarize-ai-logs.mjs
  check-workflow-version.mjs
  workflow-daily-summary.mjs
  check-project-onboarding.mjs
  check-workflow-artifacts.mjs
  new-workflow-item.mjs
.github/pull_request_template.md
.github/workflows/ai-workflow-checks.yml
```

已有项目可以用同一个初始化脚本补齐或更新 workflow 资产：

```bash
node ai-native-dev-kit/scripts/init-project.mjs --target <project> --update-workflow-assets
```

更新模式会刷新共享 `.ai-native/` 资产、workflow scripts、workflow CI，补齐缺失的 onboarding docs、workflow 目录和 PR template governance 标记。它不会覆盖已有业务文档、specs、tasks、logs 或业务代码。

然后按这个节奏工作：

1. 用 `.ai-native/prompts/project-onboarding-agent.md` 做项目 onboarding。
2. AI 根据沟通草拟 `docs/project-onboarding.md`、project profile、tech stack strategy、business spec index、sample policy 和 decision log。
3. 人只做确认、否决、选择、补充和风险接受，不手工填完整套文档。
4. 运行 `node scripts/check-project-onboarding.mjs .` 检查 baseline；决策确认后可运行 `node scripts/check-project-onboarding.mjs . --strict`。
5. 用 `node scripts/new-workflow-item.mjs --type request --name <name>` 创建第一张需求入口。
6. 用 Preflight Agent 生成 `preflight/`。
7. 用 `.ai-native/templates/` 写 `specs/` 和 `evals/`。
8. 用 `.ai-native/templates/task-card.md` 拆成 `tasks/` 中的小任务卡。
9. 跑 `node scripts/check-workflow-artifacts.mjs .` 检查 artifact 质量。
10. 让 AI 只执行一个 task card。
11. 跑 `scripts/verify.sh`。
12. 审查 diff 和 risk gate。
13. 合并后写 `ai-logs/`。
14. 阶段性写 `workflow-retros/`。
15. 重复问题写 `workflow-improvements/`。
16. 重复执行模式适合封装时写 `skill-candidates/`，但不能自动启用 Skill。
17. 项目需要定时自动化时，先写 `automation-proposals/` 并获得人工确认。
18. 需要回写共享 dev-kit 时写 `dev-kit-proposals/`。

可以先参考 [examples/generic-first-change](examples/generic-first-change) 写第一组 request/preflight/spec/eval/task。该示例只表达工作流结构，不绑定任何业务域。

更具体的 first-slice 示例见 [examples/web-internal-admin-first-slice](examples/web-internal-admin-first-slice)。

## Dev Kit 自检

修改 dev-kit 自身时运行：

```bash
node ai-native-dev-kit/scripts/check-dev-kit.mjs
```

它会检查：

- 默认 starter 是否仍是 `generic-project`
- core/templates/prompts/checklists/default starter/default example 是否保持业务中立
- profile 是否满足必填章节
- starter 是否包含必备文件
- Skill governance 是否进入 core、template、checklist 和 generated project baseline
- Automation governance 是否进入 core、template、checklist 和 generated project baseline
- Project onboarding 是否进入 core、template、prompt、checklist、generated project baseline 和 CI
- workflow item generator 和 artifact quality checker 是否进入 generated project baseline 和 CI
- init-project 是否能生成完整项目并更新 workflow assets
- workflow-daily-summary 是否能在生成项目中运行
- 脚本语法是否可解析

## 版本

当前 dev-kit 版本记录在 [VERSION.md](VERSION.md)。生成项目会得到 `.ai-native/version.json`，用于记录初始化版本、starter 和最近一次 workflow assets 更新时间。

## 自我迭代闭环

详见 [core/self-iteration.md](core/self-iteration.md)。

项目运行时用这条链路沉淀工作流经验：

```text
ai-logs/
  -> workflow-retros/
  -> workflow-improvements/
  -> skill-candidates/
  -> automation-proposals/
  -> dev-kit-proposals/
```

汇总命令：

```bash
node scripts/summarize-ai-logs.mjs .
```

每日巡检命令：

```bash
node scripts/workflow-daily-summary.mjs . --write-state
```

`workflow-daily-summary.mjs` 只判断是否有新证据或待处理项。没有信号时输出 `NO_ACTION`，有信号时输出 `ACTION_REQUIRED` 和建议动作。它不修改业务代码，也不创建或启用 active Skill。

Codex automation 应该按项目单独创建，`cwd` 指向具体项目根目录。不要默认把 automation 绑到共享 dev-kit 或父目录扫描多个项目；只有明确需要多项目监控时才这么做。

版本检查：

```bash
node scripts/check-workflow-version.mjs .
```

原则：

- 项目可以产生改进建议。
- 项目可以产生 Skill 候选。
- 项目可以产生 automation proposal。
- 共享 dev-kit 不能被项目自动无审查修改。
- Skill 候选不能自动生成、更新、安装或启用 active Skill。
- 每日 automation 应跟随具体项目，而不是跟随共享 dev-kit。
- Codex 可以提出项目级 automation，但创建、更新、启用必须人工确认。
- 回写 dev-kit 必须经过 proposal、review 和 `check-dev-kit.mjs`。
- 一次性项目偏好不能直接进入 core。

## 平台是否区分

区分，但只在适配层区分。

```text
workflow = 统一
templates = 统一
gates = 统一
verification = 统一
platform adapters = 分平台
```

Codex 使用 `AGENTS.md` 和可选 Skill。
Cursor 使用 rules / project instructions。
Claude 使用 project instructions / commands。
GitHub 使用 PR template 和 Actions。

目标平台通过 profile/starter 区分：

```text
profiles/web-app
profiles/backend-api
profiles/ios-app
profiles/android-app
profiles/internal-admin
profiles/high-risk-change
```

不要让平台决定工作流。应该让工作流决定平台如何接入。

## 任务分级

不是每个任务都需要完整流程。默认分四级：

| Level | 场景 | 所需流程 |
|---|---|---|
| L0 | 文案、样式、小 bug | 直接修改 + verification |
| L1 | 普通功能 | Spec + Task + Verification |
| L2 | 涉及权限、数据、架构、跨模块 | Preflight + Spec + Eval + Review |
| L3 | 涉及不可逆、受监管、敏感数据、生产迁移、删除、价值转移或安全关键变更 | 完整流程 + 人工确认 + 审计 + 回滚 |

详见 [core/task-levels.md](core/task-levels.md)。

## 与 Skill 的关系

Skill 是后期封装，不是第一约束。

防止工作流跑偏的优先级：

1. `AGENTS.md`
2. `templates/`
3. `scripts/` 和 CI
4. PR template / Review gate
5. Codex Skill / Cursor Rules / Claude instructions

Skill 可以帮助 AI 更稳定地执行流程，但真正的硬约束来自脚本、CI、测试、门禁和人工批准。

## 维护方式

每完成一个项目或阶段，把有效经验回收到 dev-kit：

- 哪个 spec 字段反复缺失？
- 哪个 eval 漏检？
- 哪类任务 AI 容易跑偏？
- 哪个 prompt 最稳定？
- 哪个 risk gate 需要升级？

这个 kit 应该像产品一样版本化迭代。

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).

You may view, download, copy, adapt, and share this material for personal, educational, and non-commercial purposes with attribution.

Commercial use, resale, paid redistribution, or use as part of commercial consulting/service delivery is not permitted without prior written permission.

Commercial licensing is available on request.
