# AI Native Dev Kit

这是一套给软件项目使用的 AI 协作工作流。

它不是“让 AI 多写代码”的提示词集合，而是让 AI 在项目里按同一套规则做事：先理解需求，再整理方案，再拆任务，再执行，再验证，再复盘。

适合两类项目：

- 新项目：从第一天开始就把需求、风险、验证和记录放好。
- 已有项目：不重写代码，先补上下文，再逐步接管新需求，慢慢治理历史问题。
- 已上线或已有强治理项目：先只读评估和映射现有治理，不直接初始化或覆盖。

详细说明见 [README.zh-CN.md](README.zh-CN.md)。快速上手见 [docs/quickstart.md](docs/quickstart.md)。心智模型见 [docs/mental-model.md](docs/mental-model.md)。Codex 使用路径见 [docs/codex-usage.md](docs/codex-usage.md)。

## 我该怎么选

先按项目风险选一条路，不要一开始把所有规则都打开：

```text
轻量试验：O0 + BL0 + core workflow
普通真实项目：O1 + selected profiles + BL1
生产、客户、权限、数据或发布风险项目：O2 + selected profiles + BL2 + selected industrial packs
```

Web 和微信小程序都有 BL2 dogfood 示例；小程序 BL2 现在适合真实项目受控试跑，但仍是 draft，不是 stable 工业标准。

## 一句话用法

在 Codex 里，把这个仓库地址或目录给它，然后说：

```text
请读取这套 AI Native Dev Kit，并自己判断当前项目状态，然后完成 workflow 配置。
```

Codex 会先判断你的意思：

- 你说“配置、接入、初始化、自己处理”，它就可以开始执行。
- 你说“先看看、先沟通、先评估、不要执行”，它只读取和分析，不改文件。

这个入口由 `prompts/bootstrap-agent.md` 约束。进入执行后，Codex 会通过 `scripts/workflow-next.mjs` 判断下一步；需要强制检查时可以用 `workflow-next --enforce`。

如果项目已经有 `agent.md` / `AGENTS.md`、CI、guard、baseline、evidence、release、rollback、production 或 dirty worktree，`workflow-next` 会自动进入 `READ_ONLY` 接入评估：

```text
ADOPTION_MODE: READ_ONLY
NEXT_ACTION: RUN_ADOPTION_ASSESSMENT
CAN_WRITE_WORKFLOW_ASSETS: no
```

这时 Codex 不应该运行初始化、更新 workflow assets、创建 migration report 或修改项目文件。它应该先使用 `templates/adoption-assessment.md` 和 `templates/existing-governance-map.md` 做只读评估，等人确认 adapter 接入方式。

如果项目已经接入 workflow，但同时是生产治理项目并且工作区有未提交变更，`workflow-next` 会进入 `REVIEW_DIRTY_WORKTREE`。这时 Codex 也要先停下来确认现有改动归属，不能直接创建新任务或继续执行。

## 它解决什么

很多项目接入 AI 后，真正的问题不是 AI 不会写代码，而是：

- 需求没说清楚就开始改。
- 项目边界、权限、发布风险没人记录。
- AI 不知道哪些地方不能碰。
- 做完以后没有证据证明它真的可用。
- 出过的问题没有沉淀，下次还会再发生。

这套 dev kit 做的事，就是给项目加一层可协作、可检查、可持续改进的规则。

## 核心原则

1. 先说清楚要解决什么，再写代码。
2. 先确定怎么验收，再开始实现。
3. 先做一条完整小流程，不一上来做大而全。
4. 人负责判断、选择、确认和风险接受。
5. AI 负责整理、执行、检查和记录。
6. 高风险动作必须有人明确批准。
7. 每次经验都可以沉淀下来，变成下一次项目的资产。

## 基本流程

```text
想法
  -> 项目上下文
  -> 需求卡
  -> 预检查
  -> 工程决策基线
  -> 规格说明
  -> 验收标准
  -> 任务卡
  -> AI 执行
  -> 验证
  -> 审查
  -> 发布
  -> 记录
  -> 复盘改进
```

对应到仓库中，主要会看到这些目录：

```text
requests/              需求入口
preflight/             开始前的判断
specs/                 规格说明
evals/                 验收标准
tasks/                 给 AI 执行的小任务
ai-logs/               执行记录
workflow-retros/       复盘
workflow-improvements/ 流程改进
skill-candidates/      适合沉淀成 Skill 的候选
automation-proposals/  适合自动化的候选
dev-kit-proposals/     需要回写到这套 dev kit 的建议
review-packets/        给人或第二模型复查的稳定输入包
gpt-review-prompts/    给 GPT Pro 或独立 reviewer 的只读审查提示
review-loop-reports/   审查、多轮自动修复、复审和人工决策记录
follow-up-proposals/   当前任务之外的后续建议提案
final-reports/         需要留档的任务最终报告
status-reports/        人能直接看懂的状态报告
decision-briefs/       需要人决策时的简报
review-summaries/      复审结果的人话摘要
customer-handoffs/     交付或里程碑摘要
releases/              发布和证据记录
```

## 工程决策基线

从 `0.29.0` 开始，新增 Engineering Baseline Entry。

它解决的不是“代码格式怎么写”，而是 Codex 写代码前能不能替项目做工程决策：

```text
代码放哪里
类型谁是源头
DTO / schema / domain model 怎么分
enum / string / lookup / state machine 怎么决策
API contract、generated types、权限、migration、跨模块状态由谁决定
```

项目入口文件：

```text
docs/engineering-baseline.md
```

检查命令：

```bash
node scripts/check-engineering-baseline.mjs .
```

默认检查是 advisory：可以提示 `PENDING`，但不会阻断低风险局部改动。涉及结构、contract、schema、权限、migration、依赖或跨模块状态时，如果工程基线缺失，Codex 必须提决策或记录 gap，不能自己发明项目标准。

## 输出体验层

从 `0.25.0` 开始，复杂状态默认先用人能理解的话说明，再给技术细节。

核心规则在 `core/output-protocol.md`，后续建议边界在 `core/next-step-boundary.md`，术语翻译在 `core/glossary.md`，转换输出的 agent 提示在 `prompts/reporter-agent.md`。

它解决的是这个问题：

```text
不要先让人看 NEXT_ACTION / BL2 / EVIDENCE_MISSING
先告诉人：现在能不能继续、为什么、要你确认什么、AI 能做什么、AI 不能做什么
```

常用模板：

```text
templates/human-status-report.md
templates/decision-brief.md
templates/plain-review-summary.md
templates/customer-handoff.md
```

也可以用脚本生成：

```bash
node scripts/new-workflow-item.mjs --type human-status-report --name workflow-next
node scripts/new-workflow-item.mjs --type decision-brief --name baseline-selection
node scripts/new-workflow-item.mjs --type plain-review-summary --task tasks/001-first-slice.md
node scripts/new-workflow-item.mjs --type customer-handoff --name release-001
```

`workflow-next` 默认就是人话 + 技术细节双层输出：

```bash
node scripts/workflow-next.mjs .
node scripts/workflow-next.mjs . --format human
node scripts/workflow-next.mjs . --format technical
node scripts/workflow-next.mjs . --format json
```

这层不降低治理要求，也不隐藏技术字段。它只是把顺序改成：

```text
Human Summary
Current Status
Decision Needed
Recommended Next Step
What AI Can Do Safely
What AI Must Not Do
Technical Details
Audit Notes
Machine-readable Output
```

## Artifact 怎么选

不要每个任务都创建所有文件。先看当前缺的是需求、规格、审查、决策、报告还是交付说明。

详细导航见 `docs/artifact-decision-tree.md`。它把常见场景对应到具体 artifact：

```text
需要独立审查 -> review-packet
需要 GPT Pro / 第二模型审查 -> gpt-review-prompt
需要多轮复审闭环 -> review-loop-report
当前任务外的后续建议 -> follow-up-proposal
需要持久化任务结果 -> final-report
需要人拍板 -> decision-brief
需要人话状态 -> status-report / plain-review-summary / customer-handoff
```

## 治理硬化路线

从 `0.30.0` 开始，dev-kit 开始进入 Fixture-driven Governance Hardening。

这一步不是给真实项目增加新负担，而是先把 dev-kit 自己打磨得更稳定：

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
```

`check-fixtures` 只用于 dev-kit 自身，不会作为目标项目 workflow asset 注入。

## 新项目怎么用

推荐让 Codex 自己读取并配置。你也可以手动运行初始化脚本：

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --starter generic-project \
  --target ../my-new-project
```

也可以选择更贴近平台的 starter：

```bash
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-web-app --target ../my-web-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-ios-app --target ../my-ios-app
node ai-native-dev-kit/scripts/init-project.mjs --starter codex-android-app --target ../my-android-app
```

初始化完成后，先不要急着写功能。先做 `project-onboarding`，让 AI 根据沟通补齐项目上下文，再由人确认方向、技术栈、风险边界和第一条完整小流程。

项目上下文分三档：

- `O0`：轻量试验。
- `O1`：普通项目。
- `O2`：高风险、生产敏感或长期维护项目。

检查命令：

```bash
node scripts/check-project-onboarding.mjs .
node scripts/check-engineering-baseline.mjs .
```

## 已有项目怎么用

已有项目更适合渐进接入，不建议一上来重构。

推荐顺序是：

```text
先不改代码
先补项目上下文
再约束新需求
最后逐步治理旧问题
```

接入命令：

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets
```

它会补齐工作流需要的文件和脚本，但不会覆盖你的业务代码、已有规格、已有任务或已有记录。

如果已有项目已经有 `AGENTS.md` 或 PR 模板，默认只会生成 `migration-reports`，让人确认后再合并。需要明确应用时再使用：

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --apply-agent-governance

node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../existing-project \
  --update-workflow-assets \
  --apply-pr-template-governance
```

## 平台和基线

这套 workflow 是统一的，但不同平台的工程要求不同。

所以它把两层拆开：

- `platforms/`：Codex、Cursor、Claude、GitHub 这些执行环境怎么接入。
- `profiles/`：Web、Backend、iOS、Android、微信小程序、内部管理后台、高风险变更这些项目类型的 platform baseline。

项目里会在 `docs/project-profile.md` 的 `Selected Profiles` 里选择适用 profile。

可选 profile 包括：

```text
profiles/web-app
profiles/backend-api
profiles/ios-app
profiles/android-app
profiles/wechat-miniprogram
profiles/internal-admin
profiles/high-risk-change
```

检查命令：

```bash
node scripts/check-platform-baseline.mjs .
node scripts/resolve-platform-baseline.mjs .
```

## 工业级工程包

如果项目要求更高，可以选择 BL 级别：

- `BL0`：轻量项目。
- `BL1`：标准项目。
- `BL2`：更严格的工业级项目。

`industrial-packs/` 里放的是可组合的工业级工程包，比如 Web、iOS、Android、微信小程序、后端接口、权限、数据存储、支付或高风险变更。

不是只有 Web 包。Web 目前仍是 dogfood 最完整的 draft 包；微信小程序已经补到独立 BL2 样板层，Backend、Auth、Data、Internal Admin、iOS、Android 等也都有 draft 包。选择时先看 [industrial-packs/selection-guide.md](industrial-packs/selection-guide.md)，按项目实际运行端、能力和风险组合，不要默认全选。

小程序项目如果带后台，不把后台并入小程序包本体；按实际范围组合 `wechat-miniprogram-industrial`、`internal-admin-industrial`、`backend-api-industrial` 或 `cloudbase-industrial`、`auth-permission-industrial`、`data-storage-industrial`，涉及支付时再加 `payment-value-transfer-industrial`。

检查命令：

```bash
node scripts/check-industrial-pack.mjs . --selected-only
node scripts/resolve-industrial-baseline.mjs .
node scripts/check-industrial-baseline.mjs . --bl2-only
```

BL2 不只看“有没有写文档”，还要求证据真实存在。`docs/baseline-evidence.md` 里的 `Done` 必须有项目内文件作为证据引用；`Not applicable` 必须写清楚为什么不适用。

默认初始化只放工业包索引和 schema，不会把所有平台的工业包都塞进项目。需要 BL2 时，再按项目选择安装：

```bash
node ai-native-dev-kit/scripts/init-project.mjs \
  --target ../my-project \
  --update-workflow-assets \
  --industrial-packs web-app-industrial,backend-api-industrial
```

证据分三层：`baseline evidence` 是项目级证据索引，`task evidence` 是当前任务触发的证据，`release evidence` 是发布前需要看的证据。单个任务不需要默认背完整工业包证据目录。

## 每次需求怎么走

先创建需求入口：

```bash
node scripts/new-workflow-item.mjs --type request --name first-change
```

然后按顺序补齐 request、preflight、spec、eval、task。

实现前检查：

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready
```

只检查某张任务卡：

```bash
node scripts/check-workflow-artifacts.mjs . --mode implementation --task tasks/001-first-change.md
```

CI 里可以只检查本次变更：

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready --changed-only --base origin/main
```

如果任务卡里勾选了风险项，`Human Approval` 必须写清楚是否批准，并补上 `Approval scope`。进入 implementation 模式时，高风险任务必须已经批准。

如果高风险词只是作为明确的非目标或排除范围出现，可以在任务卡写 `Risk Gate Exclusions`，说明为什么不勾选，并由人确认。这样不用为了过检查把文本写得含糊。
如果同一任务接受了超过 3 个 Risk Gate Exclusions，ready 模式会提醒；进入 implementation 模式时，`Human Approval` 的 `Approval scope` 必须明确覆盖这些排除项。

如果需要让 GPT Pro、第二模型或人类复查一次变更，可以生成 Review Packet：

```bash
node scripts/new-workflow-item.mjs --type review-packet --task tasks/001-first-change.md
```

它会把需求、规格、任务、风险、人工批准、证据、diff 摘要、已知风险和开放问题放进一个文件。Review Packet 只是复查输入，不代表批准。

如果任务是 `L2` / `L3`，或者复查发现需要闭环的问题，再生成 Review Loop Report：

```bash
node scripts/new-workflow-item.mjs --type review-loop-report --task tasks/001-first-change.md
```

如果需要 GPT Pro 或第二模型参与，生成只读提示：

```bash
node scripts/new-workflow-item.mjs --type gpt-review-prompt --task tasks/001-first-change.md
```

Review Loop 的规则很简单：reviewer 只读审查；Codex 只自动修确定性、低风险、任务范围内的问题；最多自动修 2 轮；范围、风险、权限、架构、依赖、迁移、生产配置、发布和回滚决策交给人。

可以用语义检查器检查 Review Loop 是否真的闭环：

```bash
node scripts/check-review-loop.mjs . --task tasks/001-first-change.md
```

如果 Codex 在最终报告里提出下一步，不再用一句笼统的“建议继续做”。它必须按 Bounded Next-Step 分类：

```text
IN_SCOPE_NEXT_STEP
DIRECT_FOLLOW_UP
RISK_DECISION
OUT_OF_SCOPE_OBSERVATION
DO_NOT_PROCEED
```

只有 `IN_SCOPE_NEXT_STEP` 可以在当前任务内继续处理。其它类型需要新 request、follow-up proposal、人工决策，或者明确不继续。

需要把后续建议或最终结果留档时，可以生成：

```bash
node scripts/new-workflow-item.mjs --type follow-up-proposal --task tasks/001-first-change.md
node scripts/new-workflow-item.mjs --type final-report --task tasks/001-first-change.md
```

可以用语义检查器检查 next-step 是否越界：

```bash
node scripts/check-next-step-boundary.mjs . --task tasks/001-first-change.md
```

## 这次更新了什么

当前版本见 [VERSION.md](VERSION.md)，本轮更新到 `0.30.0`。

0.30.0 新增内容：

- 新增 `docs/governance-hardening-roadmap.md`，明确 0.30 Governance Hardening、0.31 Goal Mode、0.32 Subagent Orchestration 的顺序和边界。
- 新增 `scripts/check-fixtures.mjs`，用真实 checker 验证 golden examples 和 bad fixtures。
- 新增 `test-fixtures/`，把坏例子从 `check-dev-kit` 内联变异中抽出来，形成可复用的反例资产。
- 新增 Engineering Baseline golden examples：`examples/engineering-baseline-enum-vs-lookup` 和 `examples/engineering-baseline-api-dto-domain`。
- 新增 Next-Step Boundary golden example：`examples/next-step-boundary-suggestions`。
- `check-dev-kit` 现在会运行 fixture suite，保证好例子通过、坏例子因预期原因失败。

历史累计能力：

- 新增 Engineering Baseline Entry，控制 Codex 写代码前能否替项目做工程决策。
- 新增 `core/engineering-baseline.md`、`templates/engineering-baseline.md`、`checklists/engineering-baseline-review.md` 和 `scripts/check-engineering-baseline.mjs`。
- 新项目和 workflow asset update 会补齐 `docs/engineering-baseline.md`，默认是 DRAFT/PENDING，不假装工程决策已完成。
- AGENTS、Builder/Reviewer、Cursor、Claude、GitHub PR 模板都补上 Engineering Baseline 规则：Codex 可以沿用局部模式，但不能创造或升级项目级工程规范。
- Review Packet 增加 Engineering Baseline checked/ref/gaps 字段，方便复审时检查是否违反工程决策来源。
- 新增 `examples/review-loop-l2-first-slice`，专门演示 L2 Review Loop 里的 `AUTO_FIX`、`NEEDS_HUMAN_DECISION`、`DIRECT_FOLLOW_UP` 和 `DO_NOT_PROCEED`。
- `check-dev-kit` 会对这个 Review Loop L2 dogfood 示例跑 workflow artifact、Review Loop 和 Next-Step 语义检查。
- 新增 `scripts/check-review-loop.mjs`，检查 Review Loop Report 的语义边界、AUTO_FIX 轮次、人类决策队列和修复后验证。
- 新增 `scripts/check-next-step-boundary.mjs`，检查 Next-Step Suggestions 的类型、能否当前执行、所需入口和风险/批准一致性。
- 新增 `docs/artifact-decision-tree.md`，说明什么时候用哪个 artifact，降低模板数量带来的使用成本。
- `init-project` 会把 artifact decision tree 安装到 `.ai-native/docs/artifact-decision-tree.md`。
- `check-workflow-artifacts --mode implementation` 对 L2/L3 task 要求匹配的 Review Packet 和 Review Loop Report。
- GitHub Actions 模板新增 Review Loop 和 Next-Step 语义检查。
- 现有 Web / 小程序 BL2 dogfood 示例补齐 Review Packet、Review Loop Report，并纳入语义自检。
- 新增 `core/next-step-boundary.md`，控制 Codex 如何提出后续建议，避免建议越界变成默认继续执行。
- 新增 `templates/follow-up-proposal.md`、`templates/final-report.md`、`checklists/next-step-boundary-review.md`。
- `new-workflow-item` 支持 `--type follow-up-proposal` 和 `--type final-report`。
- 生成项目和 starter 都新增 `follow-up-proposals/`、`final-reports/`。
- AGENTS、Cursor、Claude、GitHub PR 模板都补上 Bounded Next-Step 规则。
- Review Loop 明确区分 finding 和 suggestion：当前任务问题走 Review Loop，未来建议走 Next-Step Suggestions。
- 新增 `core/review-loop.md`，定义任务完成后的审查、自动修复、复审和人工决策分流协议。
- 新增 `templates/review-loop-report.md`、`templates/gpt-review-prompt.md`、`checklists/review-loop-review.md`。
- `new-workflow-item` 支持 `--type review-loop-report` 和 `--type gpt-review-prompt`，并会尽量从 task card 自动回填 spec/eval/task level。
- 生成项目和 starter 都新增 `review-loop-reports/`、`gpt-review-prompts/`。
- `workflow-daily-summary` 会观察 Review Loop Report，方便真实项目试跑后看审查成本和未闭环事项。
- 本版仍然是半自动 Review Loop：不接入 hook，不调用外部 API，不让 GPT 自动改代码。
- 新增 `templates/review-packet.md` 和 `review-packets/`，用于把一次变更打包给 GPT Pro、第二模型或人类复查。
- `new-workflow-item` 支持 `--type review-packet`、`--type adoption-assessment` 和 `--type governance-map`。
- `workflow-next` 对 dirty + production governed + ready 执行态增加 `REVIEW_DIRTY_WORKTREE`，避免在已有未确认改动上继续执行任务。
- 新增 `industrial-packs/selection-guide.md`，说明工业包不是只有 Web，并给出主平台、能力包、风险覆盖包的选择和组合规则。
- 默认初始化改为轻量工业包入口，只注入 registry/schema，不默认塞入所有具体工业包。
- CI 模板改为 `--selected-only` 和 `--bl2-only`，BL0/BL1 项目不承担 BL2 检查成本。
- `workflow-next` 移除 Web pack 全局硬编码，具体 pack 由 BL2 selected packs 决定。
- 新增 `Risk Gate Exclusions`，让误报或明确非目标可以被人类接受并留下审计理由。
- `Risk Gate Exclusions` 增加防滥用约束，超过 3 项时需要在实现前明确人工批准范围。
- `check-ai-workflow.mjs` 增加 `--mode core` / `--mode full`，日常 CI 可只检查核心工作流，完整升级时再跑 full。
- `check-industrial-pack` 和 `check-industrial-baseline` 在 selected pack 缺失时会直接给出安装修复命令。
- README 顶部补充三条使用路径，帮助项目先选轻量、普通或 BL2 受控试跑路线。
- 新增 Existing Governed Project Adoption：强治理、已上线或 dirty 项目会自动进入只读接入评估。
- `workflow-next` 新增 `PROJECT_STATE_TAGS`、`ADOPTION_MODE` 和 governance signal 输出。
- 新增 `templates/adoption-assessment.md` 和 `templates/existing-governance-map.md`，用于把 AI Native 概念映射到现有治理资产。
- 微信小程序工业包补齐 runtime、云函数/访问规则、权限隐私、支付、发布审核等 BL2 样板文件。
- 新增 `examples/miniprogram-industrial-bl2-first-slice`，串起小程序 baseline selection、evidence、task gate、release record 和 AI log。
- selection guide 补充“小程序 + 可选后台/后端/云开发”的组合方式，后台作为 `internal-admin` 等 companion packs 接入。
- 文档补清楚 baseline evidence、task evidence、release evidence 三层关系。
- BL2 证据改成结构化记录，不再只靠关键词。
- `Done` 状态必须有真实存在的证据文件。
- `Not applicable` 必须写清楚原因。
- 实现前检查会读取平台基线和工业基线，防止任务绕过风险约束。
- 任务级别不够、基线没准备好、验收证据不足时会被拦住。
- 新增微信小程序 profile，并绑定微信小程序工业包。
- 自检里补了缺失证据引用的失败用例，避免以后回退。
- Web 工业包补齐表单交互、API 失败、可访问性、性能和运行质量证据，但仍不绑定具体框架或部署平台。
- 实现前会检测 Risk Gate 漏勾：ready 模式提醒，implementation 模式拦截。
- 工业包 registry 和 pack manifest 会做一致性检查。
- 工业包新增版本和稳定性元数据，方便后续区分 draft 与 stable。
- 新增 mental model 文档，说明什么时候只用 workflow、什么时候选 profile、什么时候上 BL2。
- 新增 Web BL2 dogfood 示例，串起 baseline selection、evidence、task gate、release record 和 AI log。
- 新增 `templates/dogfood-observation.md`，真实项目试跑时可以记录 workflow 成本、证据负担、风险误报漏报和 AI 协作质量。

## 它会自我迭代吗

会，但不会自动乱改规则。

项目运行中可以把问题写入：

- `ai-logs/`
- `workflow-retros/`
- `workflow-improvements/`
- `skill-candidates/`
- `automation-proposals/`
- `dev-kit-proposals/`

真实项目试跑时，可以从 `.ai-native/templates/dogfood-observation.md` 复制一份到 `workflow-retros/` 或项目约定的观察记录位置，用来观察这套流程是否过重、哪里误报、哪里需要补规则。这个记录不替代 request、spec、task、AI log 或 release evidence。

是否真的升级成 Skill、自动化或 dev-kit 规则，需要人确认。

相关治理在 `core/self-iteration.md` 和 `core/skill-governance.md`。

## 快速索引

常用入口：

- `docs/quickstart.md`
- `docs/codex-usage.md`
- `docs/mental-model.md`
- `docs/artifact-decision-tree.md`
- `docs/governance-hardening-roadmap.md`
- `prompts/bootstrap-agent.md`
- `scripts/workflow-next.mjs`
- `templates/adoption-assessment.md`
- `templates/existing-governance-map.md`
- `templates/review-packet.md`
- `templates/gpt-review-prompt.md`
- `templates/review-loop-report.md`
- `templates/follow-up-proposal.md`
- `templates/final-report.md`
- `core/engineering-baseline.md`
- `templates/engineering-baseline.md`
- `checklists/engineering-baseline-review.md`
- `core/next-step-boundary.md`
- `checklists/next-step-boundary-review.md`
- `core/review-loop.md`
- `scripts/check-project-onboarding.mjs`
- `scripts/check-engineering-baseline.mjs`
- `scripts/check-platform-baseline.mjs`
- `scripts/resolve-platform-baseline.mjs`
- `scripts/check-industrial-pack.mjs`
- `scripts/resolve-industrial-baseline.mjs`
- `scripts/check-industrial-baseline.mjs`
- `scripts/check-workflow-artifacts.mjs`
- `scripts/check-review-loop.mjs`
- `scripts/check-next-step-boundary.mjs`
- `scripts/check-fixtures.mjs`
- `scripts/new-workflow-item.mjs`
- `scripts/workflow-daily-summary.mjs`

示例：

- `examples/generic-first-change`
- `examples/review-loop-l2-first-slice`
- `examples/web-internal-admin-first-slice`
- `examples/web-industrial-bl2-first-slice`
- `examples/miniprogram-industrial-bl2-first-slice`
- `examples/engineering-baseline-enum-vs-lookup`
- `examples/engineering-baseline-api-dto-domain`
- `examples/next-step-boundary-suggestions`

反例 fixture：

- `test-fixtures`

Starter：

- `generic-project`
- `codex-web-app`
- `codex-ios-app`
- `codex-android-app`

重要目录：

- `core/`
- `templates/`
- `profiles/`
- `platforms/`
- `industrial-packs/`
- `starters/`

## 自检

修改 dev kit 后运行：

```bash
node scripts/check-dev-kit.mjs
```

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).

You may view, download, copy, adapt, and share this material for personal, educational, and non-commercial purposes with attribution.

Commercial use, resale, paid redistribution, or use as part of commercial consulting/service delivery is not permitted without prior written permission.
