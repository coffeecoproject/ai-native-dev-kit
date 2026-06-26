# AI Native Dev Kit

这是一套给软件项目使用的 AI 协作工作流。

它不是“让 AI 多写代码”的提示词集合，而是让 AI 在项目里按同一套规则做事：先理解需求，再整理方案，再拆任务，再执行，再验证，再复盘。

适合两类项目：

- 新项目：从第一天开始就把需求、风险、验证和记录放好。
- 已有项目：不重写代码，先补上下文，再逐步接管新需求，慢慢治理历史问题。

详细说明见 [README.zh-CN.md](README.zh-CN.md)。快速上手见 [docs/quickstart.md](docs/quickstart.md)。心智模型见 [docs/mental-model.md](docs/mental-model.md)。Codex 使用路径见 [docs/codex-usage.md](docs/codex-usage.md)。

## 一句话用法

在 Codex 里，把这个仓库地址或目录给它，然后说：

```text
请读取这套 AI Native Dev Kit，并自己判断当前项目状态，然后完成 workflow 配置。
```

Codex 会先判断你的意思：

- 你说“配置、接入、初始化、自己处理”，它就可以开始执行。
- 你说“先看看、先沟通、先评估、不要执行”，它只读取和分析，不改文件。

这个入口由 `prompts/bootstrap-agent.md` 约束。进入执行后，Codex 会通过 `scripts/workflow-next.mjs` 判断下一步；需要强制检查时可以用 `workflow-next --enforce`。

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
releases/              发布和证据记录
```

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

不是只有 Web 包。Web 目前是深化最完整的 draft 包；Backend、Auth、Data、Internal Admin、iOS、Android、微信小程序等也都有 draft 包。选择时先看 [industrial-packs/selection-guide.md](industrial-packs/selection-guide.md)，按项目实际运行端、能力和风险组合，不要默认全选。

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

## 这次更新了什么

当前版本见 [VERSION.md](VERSION.md)，本轮更新到 `0.20.0`。

新增内容：

- 新增 `industrial-packs/selection-guide.md`，说明工业包不是只有 Web，并给出主平台、能力包、风险覆盖包的选择和组合规则。
- 默认初始化改为轻量工业包入口，只注入 registry/schema，不默认塞入所有具体工业包。
- CI 模板改为 `--selected-only` 和 `--bl2-only`，BL0/BL1 项目不承担 BL2 检查成本。
- `workflow-next` 移除 Web pack 全局硬编码，具体 pack 由 BL2 selected packs 决定。
- 新增 `Risk Gate Exclusions`，让误报或明确非目标可以被人类接受并留下审计理由。
- `Risk Gate Exclusions` 增加防滥用约束，超过 3 项时需要在实现前明确人工批准范围。
- `check-ai-workflow.mjs` 增加 `--mode core` / `--mode full`，日常 CI 可只检查核心工作流，完整升级时再跑 full。
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

## 它会自我迭代吗

会，但不会自动乱改规则。

项目运行中可以把问题写入：

- `ai-logs/`
- `workflow-retros/`
- `workflow-improvements/`
- `skill-candidates/`
- `automation-proposals/`
- `dev-kit-proposals/`

是否真的升级成 Skill、自动化或 dev-kit 规则，需要人确认。

相关治理在 `core/self-iteration.md` 和 `core/skill-governance.md`。

## 快速索引

常用入口：

- `docs/quickstart.md`
- `docs/codex-usage.md`
- `docs/mental-model.md`
- `prompts/bootstrap-agent.md`
- `scripts/workflow-next.mjs`
- `scripts/check-project-onboarding.mjs`
- `scripts/check-platform-baseline.mjs`
- `scripts/resolve-platform-baseline.mjs`
- `scripts/check-industrial-pack.mjs`
- `scripts/resolve-industrial-baseline.mjs`
- `scripts/check-industrial-baseline.mjs`
- `scripts/check-workflow-artifacts.mjs`
- `scripts/new-workflow-item.mjs`
- `scripts/workflow-daily-summary.mjs`

示例：

- `examples/generic-first-change`
- `examples/web-internal-admin-first-slice`
- `examples/web-industrial-bl2-first-slice`

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
