# AI Native Dev Kit 中文说明

`ai-native-dev-kit` 是一套面向新项目和既有项目的 AI Native 软件开发工作流底座。

它的目标不是“让 AI 多写代码”，而是把软件开发拆成可沟通、可决策、可执行、可验证、可审查、可复盘的过程。

快速开始见 [docs/quickstart.md](docs/quickstart.md)，心智模型见 [docs/mental-model.md](docs/mental-model.md)，Codex 使用路径见 [docs/codex-usage.md](docs/codex-usage.md)。

## Codex 一句话入口

在 Codex 中，你可以把这个 dev-kit 的 Git 地址、目录或文件给 Codex，然后说：

```text
请读取这套 AI Native Dev Kit，并自己判断当前项目状态，然后完成 workflow 配置。
```

Codex 应先用 `prompts/bootstrap-agent.md` 判断你的意图：

- 如果你说的是“配置、接入、初始化、自己处理”，Codex 可以执行 workflow 配置。
- 如果你说的是“先看看、沟通、评估、不要执行”，Codex 只能读取和分析，不能写文件。

进入执行配置后，Codex 再运行 `scripts/workflow-next.mjs` 判断当前项目是新项目、旧项目还是已接入项目，并按 `NEXT_ACTION` 处理。

如果项目已经上线、已有强治理，或当前工作区有未提交改动，Codex 不应直接配置。`workflow-next` 会自动进入只读接入评估：

```text
ADOPTION_MODE: READ_ONLY
NEXT_ACTION: RUN_ADOPTION_ASSESSMENT
CAN_WRITE_WORKFLOW_ASSETS: no
```

这时 Codex 只能做 `adoption-assessment` 和 `existing-governance-map`，先把 AI Native 概念映射到现有治理资产，等人确认后再决定是否 adapter 接入。

如果项目已经接入 workflow，但它是生产治理项目并且当前工作区有未提交变更，`workflow-next` 会返回 `REVIEW_DIRTY_WORKTREE`。这时 Codex 要先停下来确认这些改动是谁的、是否要继续、是否要先提交或拆分，不能直接继续执行任务。

## 三条使用路径

先按项目风险选一条路，不要一开始把所有规则都打开：

```text
轻量试验：O0 + BL0 + core workflow
普通真实项目：O1 + selected profiles + BL1
生产、客户、权限、数据或发布风险项目：O2 + selected profiles + BL2 + selected industrial packs
```

Web 和微信小程序都有 BL2 dogfood 示例。微信小程序 BL2 现在适合真实项目受控试跑，但仍是 draft，不是 stable 工业标准。

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
  -> Engineering Baseline
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

## Engineering Baseline

Engineering Baseline 是 Codex 写代码前的工程决策基线。

它不规定统一目录，也不是代码风格大全。它只回答：

- 代码应该放哪里
- 类型谁是源头
- DTO / schema / domain model 怎么分
- enum / string / lookup / state machine 怎么决策
- API contract、generated types、权限、migration、跨模块状态由谁决定
- Codex 缺少规则时能不能自己决定

项目入口文件：

```text
docs/engineering-baseline.md
```

检查命令：

```bash
node scripts/check-engineering-baseline.mjs .
node scripts/check-engineering-baseline.mjs . --strict
```

默认模式是 advisory。它可以提示 `PENDING`，但不会阻断低风险局部改动。`--strict` 只适合项目已经决定把工程基线作为强门禁时使用。

核心规则：

```text
Codex 可以沿用已有局部模式。
Codex 不能自己创造或升级项目级工程规范。
```

## Governance Hardening

从 `0.30.0` 开始，这套 dev-kit 进入治理硬化阶段。

这一步不是给真实项目增加更多默认门禁，而是先把 dev-kit 自己打磨稳定：

```text
好例子证明正确路径
坏例子证明 checker 能拦问题
fixture runner 证明失败原因稳定
```

路线文档：

```text
docs/governance-hardening-roadmap.md
```

自检命令：

```bash
node scripts/check-fixtures.mjs
node scripts/score-output-quality.mjs examples/next-step-boundary-suggestions --min-score 80
node scripts/check-glossary-usage.mjs .
```

这些检查只用于 dev-kit 自身，不会注入到目标项目。

`0.30.1` 继续强化这层：fixture 失败时会给出命令和修复建议，并补充更多坏例子，覆盖 pending 工程决策、AUTO_FIX 超过 2 轮、RISK_DECISION 没有进入人工决策队列等问题。

`0.30.2` 继续补输出质量和术语一致性：检查报告是否有人话摘要、下一步边界、证据和审计记录，也检查关键术语是否有普通人能理解的解释。

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
- 补齐缺失的 `AGENTS.md`
- 补齐缺失的 workflow 目录
- 生成 `AGENTS.md` governance 迁移报告
- 生成 PR template governance 迁移报告

更新模式不会覆盖已有项目文档、specs、tasks、logs 或业务代码。

如果已有项目已经有 `AGENTS.md`，但缺少 workflow governance 标记，默认不会直接修改这个文件。它会生成：

```text
.ai-native/migration-reports/agents-governance.md
```

人工确认后再显式应用：

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --apply-agent-governance
```

如果已有项目已经有 `.github/pull_request_template.md`，但缺少 workflow governance 标记，默认不会直接修改这个文件。它会生成：

```text
.ai-native/migration-reports/pr-template-governance.md
```

人工确认后再显式应用：

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --apply-pr-template-governance
```

## 项目生成后包含什么

```text
AGENTS.md
README.md
.ai-native/
  core/
  templates/
  prompts/
  checklists/
  profiles/
  industrial-packs/
docs/
  ai-workflow.md
  project-onboarding.md
  engineering-baseline.md
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
  verification-matrix.md
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
review-packets/
gpt-review-prompts/
review-loop-reports/
follow-up-proposals/
final-reports/
status-reports/
decision-briefs/
review-summaries/
customer-handoffs/
releases/
scripts/
  verify.sh
  check-ai-workflow.mjs
  check-project-onboarding.mjs
  check-engineering-baseline.mjs
  check-platform-baseline.mjs
  resolve-platform-baseline.mjs
  check-industrial-pack.mjs
  resolve-industrial-baseline.mjs
  check-industrial-baseline.mjs
  check-workflow-artifacts.mjs
  check-workflow-version.mjs
  new-workflow-item.mjs
  summarize-ai-logs.mjs
  workflow-daily-summary.mjs
  workflow-next.mjs
.github/pull_request_template.md
.github/workflows/ai-workflow-checks.yml
```

## 输出体验层

这套东西越来越完整后，输出不能只给工程师看。

所以新增了 Output Experience Layer：所有复杂状态先说人话，再放技术细节。

核心文件：

```text
core/output-protocol.md
core/glossary.md
prompts/reporter-agent.md
templates/human-status-report.md
templates/decision-brief.md
templates/plain-review-summary.md
templates/customer-handoff.md
```

它要求 Codex 先说明：

```text
现在能不能继续
为什么
需要你决定什么
下一步建议是什么
AI 现在可以做什么
AI 现在不能做什么
```

技术字段、脚本输出、审计记录仍然保留，但放在后面。

`workflow-next` 默认会先输出 Human Summary，再输出技术状态：

```bash
node scripts/workflow-next.mjs .
node scripts/workflow-next.mjs . --format human
node scripts/workflow-next.mjs . --format technical
node scripts/workflow-next.mjs . --format json
```

需要沉淀成文件时可以生成：

```bash
node scripts/new-workflow-item.mjs --type human-status-report --name workflow-next
node scripts/new-workflow-item.mjs --type decision-brief --name baseline-selection
node scripts/new-workflow-item.mjs --type plain-review-summary --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type customer-handoff --name release-001
```

## 日常使用顺序

1. 运行 project onboarding，让 AI 根据沟通生成项目上下文草案。
2. 人确认项目方向、技术栈、高风险边界、第一条 vertical slice。
3. 在 `docs/project-profile.md` 里确认 `Selected Profiles`，例如 `web-app`、`backend-api`、`ios-app`、`wechat-miniprogram`。
4. 运行 `node scripts/check-platform-baseline.mjs .`，需要看合成结果时运行 `node scripts/resolve-platform-baseline.mjs .`。
5. 不确定该创建哪个 artifact 时，先看 `docs/artifact-decision-tree.md`。
6. 创建 `requests/` 下的需求入口。
7. 大需求先做 preflight。
8. 写 spec 和 eval。
9. 拆 task card。
10. 运行 `node scripts/check-workflow-artifacts.mjs . --mode ready`。高风险任务在实现前运行 `node scripts/check-workflow-artifacts.mjs . --mode implementation --task <task-card>`，并在 `Human Approval` 中记录 `Approval scope`。如果风险词只是明确的非目标或排除范围，写入 `Risk Gate Exclusions`，说明原因并由人确认；如果同一任务排除项超过 3 个，实现前必须由人明确批准这些排除项。
11. AI 只执行一个 task card。
12. 跑 verification。
13. 人审查 diff、风险和证据。
14. 如果需要更强复查，生成 `review-packets/`，交给 GPT Pro、第二模型或人类 reviewer。
15. 如果复查需要闭环，生成 `review-loop-reports/`，记录 findings、自动修复、复审和人工决策，并运行 `node scripts/check-review-loop.mjs . --task <task-card>`。
16. 如果需要 GPT Pro 或第二模型参与，生成 `gpt-review-prompts/` 作为只读审查提示。
17. 如果 Codex 提出后续建议，运行 `node scripts/check-next-step-boundary.mjs . --task <task-card>`，确认建议没有越界。
18. 合并后写 AI task log。
19. 阶段性复盘进入 workflow retros。
20. 重复问题进入 workflow improvements。
21. 重复执行模式进入 skill candidates，但不能自动启用 active Skill。

## Platform Baseline

`platforms/` 是 Codex、Cursor、Claude、GitHub 这些 AI 执行平台适配。
`profiles/` 是 Web、Backend、iOS、Android、WeChat Mini Program 等目标运行平台基线。

项目可以选择多个 profile：

```md
## Selected Profiles

- web-app
- backend-api
```

resolver 会合成 selected profiles 的 required docs、task level 升级规则、风险门禁映射、验证证据、发布检查和 AI 边界。profile 不改变统一 workflow，只影响默认 task level、风险门禁、验证证据和发布要求。

## Industrial Baseline Packs

`industrial-packs/` 是 BL2 工业级工程标准层。

三套等级含义分开：

```text
O-level  = onboarding 深度：O0 / O1 / O2
L-level  = 单个 task 风险等级：L0 / L1 / L2 / L3
BL-level = 项目工程治理强度：BL0 / BL1 / BL2
```

当前内置 11 个 draft pack：

```text
industrial-packs/web-app
industrial-packs/ios-app
industrial-packs/android-app
industrial-packs/wechat-miniprogram
industrial-packs/backend-api
industrial-packs/internal-admin
industrial-packs/data-storage
industrial-packs/cloudbase
industrial-packs/auth-permission
industrial-packs/payment-value-transfer
industrial-packs/high-risk-change
```

不是只有 Web。Web 目前仍是 dogfood 最完整的 draft pack；微信小程序已经补到独立 BL2 样板层，Backend、Auth、Data、Internal Admin、iOS、Android 等也都有 draft pack。选择时先看 `industrial-packs/selection-guide.md`，按项目真实运行端、能力和风险组合，不要默认全选。

小程序项目如果带后台，不把后台并入小程序 pack 本体；按实际范围组合 `wechat-miniprogram-industrial`、`internal-admin-industrial`、`backend-api-industrial` 或 `cloudbase-industrial`、`auth-permission-industrial`、`data-storage-industrial`，涉及支付时再加 `payment-value-transfer-industrial`。

`industrial-pack-candidates/` 保留为旧工业基线迁移候选区。

Web 工业包已经做了必要深化，但仍保持通用层边界。它覆盖：

- UI 状态
- 表单交互
- API 失败和恢复
- 权限和安全
- 响应式
- 可访问性
- 性能和资产影响
- 发布、回滚和监控证据

它不绑定 React、Vue、Next.js、Vercel、Cloudflare 或任何具体框架/部署平台。框架和部署专项应先进入 `industrial-pack-candidates/`，稳定后再提升为正式 pack。

每个工业包都带有 `packVersion`、`minimumDevKitVersion`、`lastReviewedAt` 和 `stabilityNotes`，用于区分 draft 成熟度和后续兼容要求。

当前还包含一个 Web BL2 dogfood 示例：

```text
examples/web-industrial-bl2-first-slice
```

也包含一个微信小程序 BL2 dogfood 示例：

```text
examples/miniprogram-industrial-bl2-first-slice
```

它展示 baseline selection、baseline evidence、request、preflight、spec、eval、task、runtime evidence、release record 和 AI task log 如何串成一条可检查链路。

真实项目试跑时，可以使用 `.ai-native/templates/dogfood-observation.md` 记录 workflow 成本、证据负担、风险误报漏报和 AI 协作质量。它是观察记录，不替代 request、spec、task、AI log、release evidence 或 workflow retro。

检查工业包自身：

```bash
node scripts/check-industrial-pack.mjs .
node scripts/check-industrial-pack.mjs . --json
node scripts/check-industrial-pack.mjs . --selected-only
node scripts/resolve-industrial-baseline.mjs .
node scripts/resolve-industrial-baseline.mjs . --json
node scripts/check-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs . --strict
node scripts/check-industrial-baseline.mjs . --json
node scripts/check-industrial-baseline.mjs . --bl2-only
```

`check-industrial-pack.mjs` 只证明 pack 结构健康，不证明真实项目已经工业达标。真实项目证据应进入 `docs/baseline-selection.md` 和 `docs/baseline-evidence.md`，再由 `resolve-industrial-baseline.mjs` 合成项目选择，由 `check-industrial-baseline.mjs` 检查 BL2 是否可执行。

默认初始化只注入工业包 registry 和 schema，不会把所有具体工业包复制到项目里。需要 BL2 时，用 `--industrial-packs web-app-industrial,backend-api-industrial` 安装项目选中的 pack。业务项目 CI 默认使用 `--selected-only` 和 `--bl2-only`，不会让 BL0/BL1 项目背 BL2 成本。

如果 `docs/baseline-selection.md` 已经选择了某个 pack，但项目里还没安装，`check-industrial-pack.mjs` 和 `check-industrial-baseline.mjs` 会直接提示安装修复命令。

`docs/baseline-evidence.md` 使用结构化 evidence index。`Status: Done` 的条目必须有真实存在的项目内 `Evidence Ref`；`Status: Not applicable` 的条目必须填写 `Reason if skipped`。默认检查允许 pending，`--strict` 会把缺失引用、未完成状态或缺少跳过理由视为失败。

证据分三层：baseline evidence 是项目级证据索引，task evidence 是当前任务触发的证据，release evidence 是发布前需要看的证据。单个任务不需要默认补完整工业包证据目录。

## 自检

修改 dev kit 后运行：

```bash
node ai-native-dev-kit/scripts/check-dev-kit.mjs
```

生成项目后运行：

```bash
node scripts/check-ai-workflow.mjs .
node scripts/check-ai-workflow.mjs . --mode core
node scripts/check-project-onboarding.mjs .
node scripts/check-engineering-baseline.mjs .
node scripts/check-platform-baseline.mjs .
node scripts/resolve-platform-baseline.mjs .
node scripts/check-industrial-pack.mjs . --selected-only
node scripts/check-industrial-baseline.mjs . --bl2-only
node scripts/check-workflow-version.mjs .
node scripts/check-workflow-artifacts.mjs . --mode ready
node scripts/workflow-next.mjs .
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

## 示例

抽象结构示例：

```text
examples/generic-first-change/
```

Review Loop L2 dogfood 示例：

```text
examples/review-loop-l2-first-slice/
```

具体 first-slice 示例：

```text
examples/web-internal-admin-first-slice/
examples/web-industrial-bl2-first-slice/
examples/miniprogram-industrial-bl2-first-slice/
```

工程基线黄金样例：

```text
examples/engineering-baseline-enum-vs-lookup/
examples/engineering-baseline-api-dto-domain/
```

下一步建议边界样例：

```text
examples/next-step-boundary-suggestions/
```

反例 fixture：

```text
test-fixtures/
```

已有强治理项目接入模板：

```text
templates/adoption-assessment.md
templates/existing-governance-map.md
```

独立复查输入包：

```text
templates/review-packet.md
review-packets/
```

审查闭环：

```text
core/review-loop.md
templates/review-loop-report.md
templates/gpt-review-prompt.md
checklists/review-loop-review.md
review-loop-reports/
gpt-review-prompts/
```

后续建议边界：

```text
core/next-step-boundary.md
templates/follow-up-proposal.md
templates/final-report.md
checklists/next-step-boundary-review.md
follow-up-proposals/
final-reports/
```

Codex 可以提出下一步，但每条建议都要说明属于哪一类、和当前任务什么关系、AI 能不能现在做、需要什么入口、有没有风险或批准要求。

只有 `IN_SCOPE_NEXT_STEP` 可以在当前任务里继续处理。`DIRECT_FOLLOW_UP`、`RISK_DECISION`、`OUT_OF_SCOPE_OBSERVATION`、`DO_NOT_PROCEED` 都不能被当成当前任务授权。

输出体验层：

```text
core/output-protocol.md
core/glossary.md
prompts/reporter-agent.md
templates/human-status-report.md
templates/decision-brief.md
templates/plain-review-summary.md
templates/customer-handoff.md
status-reports/
decision-briefs/
review-summaries/
customer-handoffs/
```

## 生成 Workflow 文件

```bash
node scripts/new-workflow-item.mjs --type request --name first-slice
node scripts/new-workflow-item.mjs --type preflight --from requests/001-first-slice.md
node scripts/new-workflow-item.mjs --type spec --name first-slice --request requests/001-first-slice.md --preflight preflight/001-first-slice.md
node scripts/new-workflow-item.mjs --type eval --spec specs/001-first-slice.md
node scripts/new-workflow-item.mjs --type task --spec specs/001-first-slice.md --eval evals/001-first-slice.md --level L1
node scripts/new-workflow-item.mjs --type review-packet --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type gpt-review-prompt --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type review-loop-report --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type follow-up-proposal --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type final-report --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type human-status-report --name workflow-next
node scripts/new-workflow-item.mjs --type decision-brief --name baseline-selection
node scripts/new-workflow-item.mjs --type plain-review-summary --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type customer-handoff --name release-001
```

实现前检查 artifact 质量：

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready
```

如果任务是 L2/L3，进入 implementation 检查前需要有匹配的 `review-packets/` 和 `review-loop-reports/`。

复查和后续建议语义检查：

```bash
node scripts/check-review-loop.mjs . --task tasks/001-first-slice.md
node scripts/check-next-step-boundary.mjs . --task tasks/001-first-slice.md
```

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).

You may view, download, copy, adapt, and share this material for personal, educational, and non-commercial purposes with attribution.

Commercial use, resale, paid redistribution, or use as part of commercial consulting/service delivery is not permitted without prior written permission.

Commercial licensing is available on request.
