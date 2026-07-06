# IntentOS

An AI-native system for guided software delivery.

Current release: `1.79.0`.

Release record: [releases/1.79.0/release-record.md](releases/1.79.0/release-record.md).

IntentOS helps AI coding agents plan, review, migrate, and close software delivery work without bypassing human authority.

It is not a prompt collection, code template, framework starter, or deploy tool. It is a workflow and governance layer for Codex and other AI coding agents.

> You describe the goal. AI reads the project, recommends the path, asks for the few decisions that matter, and only then helps move the work forward.

## Start In 30 Seconds

Most users should start with natural language:

```text
I want to build a booking app. Start this project for me.
```

When command evidence is useful, use only these first:

```bash
node scripts/cli.mjs start <project>
node scripts/cli.mjs next <project>
node scripts/cli.mjs doctor <project>
node scripts/cli.mjs status <project> --intent "<what you want>"
```

Those commands are read-only. They do not approve implementation, release, production, CI, hooks, secrets, migrations, payment, permissions, or governance replacement.

Start here:

- [Start Here](docs/start-here.md)
- [Minimal Adoption](docs/minimal-adoption.md)
- [Source-Only Adoption](docs/source-only-adoption.md)
- [For Existing Projects](docs/for-existing-projects.md)
- [For Maintainers](docs/for-maintainers.md)

Naming note: **IntentOS** is the product, workflow-system, CLI, manifest, and generated-asset identity. The public command is `intentos`.

1.79.0 adds User Delivery Console: Codex can answer "where are we now, is this task done, what is missing, and what can you safely do next?" through one plain-language `status` card. It summarizes existing evidence systems without replacing them, writing target files, approving implementation, approving commit/push, approving release/production, or proving real-user stability.

1.78.3 documents the 1.78 Completion Evidence compatibility contract: strict completion checks require canonical task intent to stay consistent across Business Rule Closure, Verification Plan, Test Evidence, Execution Assurance, and Completion Evidence; older 1.78.0/1.78.1 Completion Evidence reports need `source_chain[].intent_digest`, and strict Execution Assurance sources need top-level `intent_digest`. It is a docs/reference patch, not a new gate.

1.78.2 closes the Completion Evidence contract: `source_chain[].intent_digest` is now part of the schema contract, Execution Assurance exposes a top-level `intent_digest`, and Completion Evidence checks Execution Assurance intent directly instead of relying only on task/source-system indirection. It remains a completion-claim gate, not a test runner, release gate, or production approval.

1.78.1 tightens Completion Evidence Gate: completion claims now require source-chain cross-binding, source digest checks, source schema validation, and intent digest matching across Business Rule Closure, Verification Plan, Test Evidence, and Execution Assurance. It still does not run tests, approve commits, approve release, or prove production behavior.

1.78.0 adds Completion Evidence Gate: Codex can only claim a task is complete when Business Rule Closure, Verification Plan, Test Evidence, and Execution Assurance are all recorded, ready, and bound to the same task. It catches missing test evidence, stale or wrong-task reports, and execution summaries that say done without the full proof chain. It still does not run tests, approve commits, approve release, or prove production behavior.

1.77.2 synchronizes Test Evidence installation and schema contracts: the stricter Test Evidence report shape is now explicitly schema `1.77.1`; source examples and fixtures are regenerated; PR generated-project smoke visibly runs BRC -> CIC -> Verification Plan -> Test Evidence strict binding; Markdown/JSON reason fields are compared. It still does not run tests or approve release.

1.77.1 tightens Test Evidence Binding: command/test-report evidence now records `exit_code` and `failure_reason`; passed evidence must resolve to a real artifact with matching digest; required Verification Plan test-quality controls must be preserved in Test Evidence. It still does not run tests or approve release.

1.77.0 adds Test Evidence Binding: after a Verification Plan says what must be checked, Codex can bind real command/manual/report evidence to every required obligation. It catches missing frontend/backend/API coverage, stale reports, skipped or failed evidence, broad commands treated as proof, and ownerless manual evidence. It does not run tests or approve release.

1.76.3 closes Verification Plan consistency: Markdown tables are now checked both ways against JSON evidence, Test Correctness Controls are cross-checked, and READY plans require recorded BRC/CIC source systems.

1.76.2 tightens Verification Plan report consistency: the Markdown sections users read now must match the machine-readable JSON evidence for source systems, identity, project calibration, affected surfaces, verification obligations, manual checks, not-applicable items, and outcome.

1.76.1 tightens Verification Plan source chains: strict checks now prove the Change Impact Coverage report consumed the same Business Rule Closure referenced by the Verification Plan, and `source_systems[]` must match the top-level refs, digests, and outcomes.

1.76.0 adds Verification Plan Governance: after Business Rule Closure and Change Impact Coverage, Codex now produces a source-bound verification plan that says what must be checked, how test correctness is reviewed, which manual checks need owners, and why broad commands such as `npm test` are not enough proof for business-rule or cross-surface changes. It plans verification only; it does not execute tests, approve implementation, or approve release/production.

1.75.2 closes the Business Rule Closure binding gap: strict business-rule flags now require machine-readable Change Impact Coverage evidence, generated Business Rule Closure reports self-reference their actual `--out` path, and generated-project smoke proves the saved BRC -> CIC strict binding chain.

1.75.1 tightens Business Rule Closure binding: a closure report must self-reference the current report, and Change Impact Coverage strict mode can verify that `business_rule_ref` resolves to a READY Business Rule Closure with matching digest and state.

1.75.0 adds Business Rule Closure: before Codex turns a user request into implementation, it summarizes the business rule, closes required dimensions, applies safe defaults, asks only the few decisions that matter, and links the closed rule into Change Impact Coverage. This is a generic task-communication layer; contract, tax, finance, HR, or legal wording is only an example or risk signal, not the default business domain.

1.74.3 closes the 1.74 line with Execution Assurance log and Markdown consistency hardening: self-check output now names the full 1.72-1.74 assurance line, and checker validation cross-checks human-readable Execution Plan, Actual Diff, and Evidence Binding tables against the machine-readable JSON evidence.

1.74.2 removes the remaining legacy uppercase runtime vocabulary from source-repository routing and tightens Execution Assurance so `VERIFIED_DONE` must reference a resolvable execution plan. Generated-project smoke now writes an assurance report and checks that same recorded file.

1.74.1 syncs the 1.74 Execution Assurance release: resolver vocabulary, JSON schema enum values, runtime IntentOS tags, README command tables, docs, and generated-project smoke now point to the same behavior. It does not add a new workflow layer or require ordinary users to learn internal proof-chain commands.

1.74.0 tightens Execution Assurance: when Codex says execution work is done, the source systems, evidence, actual diff, and reviewed plan must match the current task. It blocks stale evidence, wrong-task reports, unplanned changed files, and vague `review:` / `command:` proof from being treated as precise completion evidence.

1.73.0 completes the IntentOS naming hardcut: public docs, package metadata, CLI help, manifests, generated workflow assets, CI workflow names, templates, and active checks now use the IntentOS identity. Existing projects with old workflow assets must go through an explicit migration plan before any target-project file is moved or rewritten.

1.72.1 hardens Execution Assurance: completion checks now fail when no recorded Execution Assurance Report exists, unless maintainers explicitly pass `--allow-empty` for asset-only checks. The public first-step README no longer asks users to choose internal proof-chain commands.

1.72.0 adds Execution Assurance Chain: before Codex claims execution-class work is complete, it must bind the user intent, completion contract, planned impact, actual diff, evidence, review result, and patch classification into one checkable report.

1.71.3 closes old-project adoption assurance evidence gaps: generated reports can be saved with explicit `--out`, every surface evidence ref must appear in `evidence_refs`, and unknown evidence prefixes fail instead of being silently ignored.

1.71.2 tightens old-project adoption assurance evidence: every passed simulation step must record exit code, read-only status, target diff status, no-write evidence, and output digest; upstream source status is derived from typed fields instead of broad text matching.

1.71.1 hardens old-project adoption assurance: Codex can no longer claim IntentOS is fully active from static text, placeholder directories, or unrelated evidence; the report must include consistent structured evidence and a real read-only simulation trace.

1.71.0 adds Adoption Execution Assurance: old-project adoption can only be claimed as complete when required surfaces are checked from evidence and a read-only simulated task proves Codex would route through IntentOS.

1.70.1 hardens Existing Project Governance Convergence evidence: reports now cross-check the human summary, Markdown dimensions, machine-readable evidence, upstream source status, and final outcome before a convergence claim can pass strict checks.

1.70.0 adds Existing Project Governance Convergence: old projects can move closer to the new-project IntentOS daily workflow through read-only comparison of workflow, baseline, audit, release, CI/hooks, documents, work queue, AI log policy, and protected authority. It does not write target files, replace project rules, rewrite history, or approve production.

## 3 分钟理解

IntentOS 把 AI 协作开发拆成一条可控路径：

```text
用户目标 -> 读项目 -> 判断状态 -> 推荐路径 -> 人确认关键决策 -> 计划写入 -> 执行 -> 验证 -> 复查 -> 收口
```

| 项目状态 | 默认方式 |
|---|---|
| 新项目 | 先确认目标、平台、基线和第一版范围，再开始搭建 |
| 已有项目 | 先读现有代码、文档和规则；如果要接入 IntentOS，进入原生迁移计划 |
| 已上线项目 | 先只读映射现有治理，再做生产安全的原生迁移计划，不覆盖发布和回滚流程 |

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
| 老项目接入 AI | 先做 existing workflow mapping，再用 native migration plan 规划原生接入，不直接复制整套规则 |
| 已上线项目 | 默认先只读，再走 production-safe native overlay，保护现有 CI、发布、回滚和证据链 |
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
| Native-First Migration | 老项目不再停在笼统 adapter 建议；先分类旧规则和权力边界，再计划接入 IntentOS |
| Existing Rule Reconciliation | 对比旧项目规则和 IntentOS 规则，只输出建议，不直接替换旧治理 |
| Governance Convergence | 老项目可以按 IntentOS 日常工作方式收敛，但基线、发布、CI、hook、历史证据和旧规则必须先比较再计划 |
| Adoption Assurance | 验证老项目是否真的按 IntentOS 工作，需要证据和只读模拟支撑，而不是只靠“已接入”的说法 |
| Baseline Decision | 用白话确认 BL0 / BL1 / BL2、平台和风险 |
| Ordinary First Slice | 把普通用户的一句话目标整理成第一版范围、问题、延期项和验证方式 |
| Product Completeness | 判断现在是想法、第一版范围、可本地运行 MVP、内测候选还是阻塞 |
| Real MVP Example | 用内置预约和看板 Web MVP 样例证明这条链路可以本地跑通 |
| Standard Baseline Packs | 为不同平台提供普通工程基线 |
| Industrial Overlays | 为生产、客户数据、权限、支付、发布等风险提供增强治理 |
| Review Surface | 执行前判断任务完成后需要审哪些面 |
| Business Rule Closure | 在写代码前把业务规则说清楚，AI 先补齐角色、触发条件、成功/失败路径、默认处理和待确认问题，用户只确认关键判断 |
| Change Impact Coverage | 防止业务规则只改一层，要求前端、API、后端、文案、测试和交接等相关面逐项收口 |
| Verification Plan Governance | 根据业务规则和影响面生成任务绑定的验证义务，说明哪些测试或检查足以支持后续收口；不执行测试，不批准实现或发布 |
| Test Evidence Binding | 把真实命令、报告、人工或日志证据绑定到 Verification Plan 的每个必验证项；检查退出码、证据文件、digest、任务匹配和测试质量控制，不执行测试、不批准发布 |
| Completion Evidence Gate | 最终说“任务完成”前，检查 Business Rule Closure、Verification Plan、Test Evidence、Execution Assurance 是否 recorded、ready、同 task、同 source chain；不运行测试、不批准发布 |
| Review Loop | 任务完成后复查、自动修复可修项、把风险交给人 |
| Unified Closure | 用户问“能算完成了吗”时，AI 给出唯一收口结论，避免多个检查给出不同答案 |
| Launch Review View | 用户问“能不能上线/提交审核”时，把收口结果、Safe Launch 标签和上线缺口整理成一张评审视图 |
| Guided Release Adapter | 用户想上线但不懂发布流程时，Codex 自动发现项目发布方式并生成小白可读的发布适配卡 |
| Release Guide | 用户说“帮我上线”时，Codex 用一个入口判断应该走发布适配、上线评审、结构化审批还是发布执行计划 |
| Platform Release Recipes | 根据 Web、后端、小程序等平台给出发布前通常需要的准备清单，但不执行发布 |
| Release Handoff Packs | 把平台配方和结构化审批变成可交接的发布包，明确 Codex、人和外部系统各自负责什么 |
| Release Path Hardening | 防止上线交接包过早生成，并用结构化证据证明交接包不是发布批准 |
| Release Execution | 用户确认发布后，把执行步骤、负责人、停止条件和证据要求整理成受控发布执行计划 |
| Release Plan | 把多条发布相关结果汇总成一个只读视图；老项目默认按 IntentOS 工作，但资产迁移必须先做规则对比和审批 |
| Unified Apply Plan | 所有写入动作先进入一张可审查计划 |
| Controlled Apply Readiness | 判断计划是否具备未来“人工批准后受控执行”的条件 |
| Low-Risk Apply Candidate | 判断一个小改动是否足够窄、可回滚、可验证，能否进入后续人工批准计划 |
| Approval Record | 记录人明确批准了哪些 action、哪些路径、到什么时候过期 |
| Work Queue / Todo | 管理当前任务、暂停任务、停车场和恢复入口 |
| Document Lifecycle | 识别过期、重复、废弃文档和 source of truth，默认建议归档，不默认删除 |
| Hook Policy | 定义项目允许哪些 hook、谁确认、怎么禁用和回滚 |
| Execution Assurance Chain | 执行类工作说“完成”前，必须把意图、计划、实际改动、证据、复查和补丁判断串成可检查证明链 |
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
| 看更完整的下一步建议 | `node scripts/cli.mjs guide ../my-project --deep --intent "我要加支付预约"` |
| 判断任务能不能收口 | `node scripts/cli.mjs finish ../my-project --intent "新增合同录入限制" --verification "npm run verify passed"` |
| 准备发布路径 | `node scripts/cli.mjs release-guide ../my-project --intent "帮我上线"` |
| 看统一发布视图 | `node scripts/cli.mjs release-plan ../my-project --intent "帮我上线"` |
| 写入前生成统一计划 | `node scripts/cli.mjs apply-plan ../my-project --intent "接入 IntentOS"` |

You do not need to choose internal workflow commands before starting.

## Maintainer And Evidence Commands

These commands are for maintainers, CI, audits, and explicit evidence:

| 你想做什么 | 命令 |
|---|---|
| 判断项目状态 | `node scripts/cli.mjs start ../my-project` |
| 选择项目基线 | `node scripts/cli.mjs baseline-decision ../my-project` |
| 老项目先映射现有治理 | `node scripts/cli.mjs workflow-map ../my-project` |
| 老项目生成原生迁移计划 | `node scripts/cli.mjs native-migration ../my-project` |
| 检查原生迁移计划 | `node scripts/cli.mjs native-migration-check ../my-project` |
| 对齐旧规则和 IntentOS 参考规则 | `node scripts/cli.mjs reconcile-rules ../my-project` |
| 检查规则对齐报告 | `node scripts/cli.mjs reconcile-rules-check ../my-project` |
| 汇总老项目如何向 IntentOS 日常治理收敛 | `node scripts/cli.mjs convergence ../my-project` |
| 检查治理收敛报告 | `node scripts/cli.mjs convergence-check ../my-project` |
| 生成老项目接入验收报告 | `node scripts/cli.mjs adoption-assurance ../my-project --out adoption-assurance-reports/001.md` |
| 检查老项目接入是否真的生效 | `node scripts/cli.mjs adoption-assurance-check ../my-project` |
| 汇总发布源系统为统一视图 | `node scripts/cli.mjs release-plan ../my-project --intent "帮我上线"` |
| 检查统一发布视图 | `node scripts/cli.mjs release-check ../my-project` |
| 判断计划是否具备受控执行条件 | `node scripts/cli.mjs apply-readiness ../my-project --plan apply-plans/001-example.md` |
| 检查人工批准记录 | `node scripts/cli.mjs approval-record-check ../my-project` |
| 处理中断任务 | `node scripts/cli.mjs work-queue ../my-project` |
| 检查文档生命周期 | `node scripts/cli.mjs doc-lifecycle ../my-project` |
| 生成统一收口结论 | `node scripts/cli.mjs finish ../my-project --intent "完成预约校验" --verification "npm run verify passed"` |
| 检查统一收口结论 | `node scripts/cli.mjs finish-check ../my-project` |
| 生成上线评审视图 | `node scripts/cli.mjs launch-view ../my-project --intent "准备上线评审" --verification "npm run verify passed"` |
| 检查上线评审视图 | `node scripts/cli.mjs launch-view-check ../my-project` |
| 生成发布适配卡 | `node scripts/cli.mjs release-adapter ../my-project --intent "准备发布适配"` |
| 检查发布适配卡 | `node scripts/cli.mjs release-adapter-check ../my-project` |
| 生成统一发布引导 | `node scripts/cli.mjs release-guide ../my-project --intent "帮我上线"` |
| 检查统一发布引导 | `node scripts/cli.mjs release-guide-check ../my-project` |
| 选择平台发布配方 | `node scripts/cli.mjs release-recipe ../my-project --intent "帮我上线"` |
| 检查平台发布配方 | `node scripts/cli.mjs release-recipe-check ../my-project` |
| 生成发布交接包 | `node scripts/cli.mjs release-handoff ../my-project --intent "帮我上线"` |
| 检查发布交接包 | `node scripts/cli.mjs release-handoff-check ../my-project` |
| 生成发布执行计划 | `node scripts/cli.mjs release-execution ../my-project --intent "准备发布执行" --mode PLAN_ONLY` |
| 检查发布执行计划 | `node scripts/cli.mjs release-execution-check ../my-project` |
| 生成变更影响覆盖报告 | `node scripts/cli.mjs impact-coverage ../my-project --intent "新增合同录入限制"` |
| 检查变更影响覆盖报告 | `node scripts/cli.mjs impact-coverage-check ../my-project` |
| 生成执行完成证明链 | `node scripts/cli.mjs execution-assurance ../my-project --intent "新增合同录入限制" --out execution-assurance-reports/001.md` |
| 检查执行完成证明链 | `node scripts/cli.mjs execution-assurance-check ../my-project` |
| 用白话别名检查任务是否真正完成 | `node scripts/cli.mjs done-check ../my-project` |
| 用白话别名验证执行是否到位 | `node scripts/cli.mjs verify-execution ../my-project` |
| 严格检查变更影响闭环证据 | `node scripts/check-change-impact-coverage.mjs ../my-project --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs` |
| 严格检查执行收口是否引用正确影响覆盖 | `node scripts/check-execution-closure.mjs ../my-project --require-impact-coverage --require-precise-evidence` |
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
node scripts/cli.mjs native-migration ../existing-project
node scripts/cli.mjs reconcile-rules ../existing-project
```

已上线或强治理项目默认只读：

```bash
node scripts/cli.mjs guide ../production-project --deep --intent "接入 IntentOS"
node scripts/cli.mjs native-migration ../production-project
node scripts/cli.mjs reconcile-rules ../production-project
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
node scripts/cli.mjs finish . --intent "维护 IntentOS 收口体验" --verification "npm run verify passed"
node scripts/check-closure-decision.mjs .
node scripts/check-guided-closure.mjs .
node scripts/check-launch-review-view.mjs .
node scripts/check-release-adapter.mjs .
node scripts/check-release-guide.mjs .
node scripts/check-platform-release-recipe.mjs .
node scripts/check-release-handoff-pack.mjs .
node scripts/check-release-execution.mjs .
node scripts/check-release-plan.mjs .
node scripts/check-low-risk-apply-candidate.mjs . --require-structured-evidence
node scripts/check-change-impact-coverage.mjs .
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --report change-impact-coverage-reports/001-contract-input-rule.md --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs --require-precise-evidence
node scripts/check-execution-closure.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-impact-coverage --require-precise-evidence
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
- [Unified Closure Model](docs/unified-closure-model.md)
- [Decision Explain Trace](docs/decision-explain-trace.md)
- [Guided Closure Experience](docs/guided-closure-experience.md)
- [Launch Review View](docs/launch-review-view.md)
- [Guided Release Adapter](docs/release-adapter.md)
- [Release Guide](docs/release-guide.md)
- [Platform Release Recipes](docs/platform-release-recipes.md)
- [Release Handoff Packs](docs/release-handoff-packs.md)
- [Release Execution Protocol](docs/release-execution-protocol.md)
- [Release Core Model](docs/release-core-model.md)
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
- [Execution Assurance Chain](docs/execution-assurance-chain.md)
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

- [1.74.3 Release Record](releases/1.74.3/release-record.md)
- [1.74.2 Release Record](releases/1.74.2/release-record.md)
- [1.74.1 Release Record](releases/1.74.1/release-record.md)
- [1.74.0 Release Record](releases/1.74.0/release-record.md)
- [1.73.0 Release Record](releases/1.73.0/release-record.md)
- [1.72.1 Release Record](releases/1.72.1/release-record.md)
- [1.72.0 Release Record](releases/1.72.0/release-record.md)
- [1.71.3 Release Record](releases/1.71.3/release-record.md)
- [1.71.2 Release Record](releases/1.71.2/release-record.md)
- [1.71.1 Release Record](releases/1.71.1/release-record.md)
- [1.71.0 Release Record](releases/1.71.0/release-record.md)
- [1.70.1 Release Record](releases/1.70.1/release-record.md)
- [1.70.0 Release Record](releases/1.70.0/release-record.md)
- [1.69.2 Release Record](releases/1.69.2/release-record.md)
- [1.69.1 Release Record](releases/1.69.1/release-record.md)
- [1.69.0 Release Record](releases/1.69.0/release-record.md)
- [1.68.2 Release Record](releases/1.68.2/release-record.md)
- [1.68.1 Release Record](releases/1.68.1/release-record.md)
- [1.68.0 Release Record](releases/1.68.0/release-record.md)
- [1.67.2 Release Record](releases/1.67.2/release-record.md)
- [1.67.1 Release Record](releases/1.67.1/release-record.md)
- [1.67.0 Release Record](releases/1.67.0/release-record.md)
- [1.66.0 Release Record](releases/1.66.0/release-record.md)
- [1.65.0 Release Record](releases/1.65.0/release-record.md)
- [1.64.0 Release Record](releases/1.64.0/release-record.md)
- [1.63.0 Release Record](releases/1.63.0/release-record.md)
- [1.62.0 Release Record](releases/1.62.0/release-record.md)
- [1.61.0 Release Record](releases/1.61.0/release-record.md)
- [1.60.0 Release Record](releases/1.60.0/release-record.md)
- [1.59.0 Release Record](releases/1.59.0/release-record.md)
- [1.58.0 Release Record](releases/1.58.0/release-record.md)
- [1.57.0 Release Record](releases/1.57.0/release-record.md)
- [1.56.0 Release Record](releases/1.56.0/release-record.md)
- [1.55.0 Release Record](releases/1.55.0/release-record.md)
- [1.54.0 Release Record](releases/1.54.0/release-record.md)
- [1.53.0 Release Record](releases/1.53.0/release-record.md)
- [1.51.0 Release Record](releases/1.51.0/release-record.md)
- [1.49.0 Release Record](releases/1.49.0/release-record.md)
- [1.48.0 Release Record](releases/1.48.0/release-record.md)
- [1.47.0 Release Record](releases/1.47.0/release-record.md)
- [1.46.0 Release Record](releases/1.46.0/release-record.md)
- [Version History](VERSION.md)

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). See [LICENSE.md](LICENSE.md), [LICENSE-FAQ.md](LICENSE-FAQ.md), and [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md).
