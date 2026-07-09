# IntentOS 中文说明

面向 AI 协作开发的项目交付系统。

当前版本：`1.88.3`。

发布记录：[releases/1.88.3/release-record.md](releases/1.88.3/release-record.md)。

IntentOS 是给 AI 编码代理使用的软件交付治理系统：让 AI 能规划、执行、复查和收口，但不能绕过人的决策、风险接受、发布审批和项目既有规则。

它不是提示词合集，也不是代码模板、框架脚手架或部署工具。它是一套给 Codex 和其他 AI 编程助手使用的工作流与治理底座。

> 你说目标，AI 判断路径；你做确认，项目按规则推进。

## 30 秒开始

多数用户直接用自然语言开始：

```text
我想做一个预约 App，你帮我开始。
```

需要命令行证据时，先用这些入口：

```bash
node scripts/cli.mjs start <project>
node scripts/cli.mjs adopt <老项目> --intent "<接入这个项目>"
node scripts/cli.mjs adopt-review <老项目> --intent "<评估是否进一步接入>"
node scripts/cli.mjs queue-takeover <老项目> --intent "<继续处理老项目任务>"
node scripts/cli.mjs next <project>
node scripts/cli.mjs doctor <project>
node scripts/cli.mjs status <project> --intent "<你想做什么>"
node scripts/cli.mjs plan-review <project> --plan <plan.md> --intent "<审查这个计划>"
node scripts/cli.mjs release-channel <project> --intent "<判断发布通道策略>"
```

这些命令都是只读入口，不批准实现、发布、生产、CI、hook、密钥、迁移、支付、权限或治理替换。

`start` 只负责看项目和判断状态，不写计划、不应用工作流资产。老项目要进入
安全接入流程时，用 `adopt`。

如果老项目已经能用 IntentOS 的只读工作方式，但你想知道是否要进一步接入，
用 `adopt-review`。它会由 Codex 判断项目治理成熟度，推荐是保持部分接入、
先修治理，还是准备更深接入计划；仍然不写项目文件。

如果老项目的 TODO、session 或任务记录很乱，用 `queue-takeover`。它会判断
项目是否已有可靠任务体系、是否需要建立 IntentOS Work Queue、是否因为风险
必须停止接管。它只决定未来任务入口，不授权实现。

`runtime-hygiene` 是交付运行时检查。它会判断分支历史、提交范围、本地门禁、
CI、发布通道、制品配额和发布包体积问题，但不批准提交、推送、发布、生产、
删除制品、绕过门禁或强推。

`release-channel` 用来区分“代码和证据放在哪里”和“到底通过什么方式发布”。
GitHub 可以继续放代码、tag 和证据，但 GitHub Release 资产、GitHub Actions
制品、平台部署、镜像仓库、包仓库、小程序/应用商店提交、发布负责人、成本负责人
和保留策略必须分开判断。

`plan-review` 用来在写代码前审查实现计划。对权限、删除、流程状态、业务规则、
数据、接口或发布相关任务来说，“写了计划”不等于“可以开始实现”。计划必须先通过
预实现审查门，Codex 才能进入实现评审。

`1.86.1` 加强了这部分：如果是 CI 环境问题，只有在项目允许重试并确认没有
生产副作用时，Codex 才能自动继续；严格模式下还会检查这个阻断是否真的属于
当前任务，并记录日志、门禁、制品或发布事件的来源证据。

先读这几页：

- [Start Here](docs/start-here.md)
- [Minimal Adoption](docs/minimal-adoption.md)
- [Source-Only Adoption](docs/source-only-adoption.md)
- [For Existing Projects](docs/for-existing-projects.md)
- [For Maintainers](docs/for-maintainers.md)

命名说明：**IntentOS** 是产品、工作流体系、CLI、manifest 和生成资产的统一名称。公开命令只使用 `intentos`。

1.88.3 加严 Plan Review consumer binding：下游消费者现在会重新计算被引用
Plan Review 报告的 digest，并确认自己使用的 plan 引用或 plan digest 与通过
Plan Review 的计划一致。Completion Evidence 还会检查自己的 Plan Review
binding 是否和引用的 Execution Assurance binding 一致。

1.88.3 仍然不授权执行。它只验证证据身份和计划一致性，不批准代码实现、apply、
提交、推送、发布、生产、测试、迁移或项目负责人决策。

1.88.2 把 Plan Review Gate 接到下游执行链路：Execution Assurance、
Completion Evidence 和 Controlled Apply Readiness 可以使用严格
`--require-plan-review` 模式，要求绑定同一任务的 `PLAN_REVIEW_PASSED`
报告后，才能说执行完成、任务完成或 apply readiness 通过。

1.88.2 仍然不授权执行。它只是消费计划审查证据，不批准代码实现、apply、
提交、推送、发布、生产、测试、迁移或项目负责人决策。

1.88.1 加严 Plan Review Gate：高影响任务如果要达到 `PLAN_REVIEW_PASSED`，
必须有 Task Governance、Review Surface 权威、Verification Plan，以及必要的
Business Rule / Change Impact 来源证据。单靠计划审查自己推导出的审查面不够；
推荐的 subagent 审查也不能用 fallback 代替。

1.88.1 仍然不授权执行。它只是加严计划审查证据，不批准代码实现、提交、推送、
发布、生产、测试、迁移或项目负责人决策。

1.88.0 新增 Plan Review Gate：实现计划会成为可审查的产物。高影响任务不能从
“计划已写”直接进入“写代码”，必须先审查计划、处理阻断问题、覆盖必要审查面，
并达到 `PLAN_REVIEW_PASSED`。

1.88.0 仍然不授权执行。`PLAN_REVIEW_PASSED` 只表示“计划审查这个前置条件已满足”，
不批准代码实现、提交、推送、发布、生产、测试、迁移或项目负责人决策。

1.87.1 加严 Release Channel Decoupling：严格来源绑定会解析项目内
`file:` 引用并重新计算 source digest；没有发布通道风险的 source-only 项目
不再默认要求发布负责人或成本负责人；发布负责人也区分“记录策略时是否需要”
和“进入发布评审前必须需要”。

1.87.1 仍然不授权执行。它不执行发布、不上传 GitHub Release 资产、不运行
GitHub-hosted 发布 workflow、不删除制品、不改 CI、不改生产、不碰密钥、
不批准发布，也不批准成本。

1.87.0 新增 Release Channel Decoupling：Git、tag 和 GitHub 可以继续作为
源码与证据系统，但 Codex 不能默认把 GitHub Release、GitHub Actions 制品、
平台部署、镜像/包仓库、应用商店/小程序提交或服务器脚本当作发布通道。它会
先检查发布负责人、成本负责人、保留策略和发布包身份。

1.87.0 仍然不授权执行。它不执行发布、不上传 GitHub Release 资产、不运行
GitHub-hosted 发布 workflow、不删除制品、不改 CI、不改生产、不碰密钥、
不批准发布，也不批准成本。

1.86.1 加严 Execution And Release Runtime Hygiene：运行时报告可以记录门禁输出、
CI 日志、制品错误、发布包摘要和发布事件的来源引用与 digest；严格检查可以把
阻断绑定到当前 Work Queue 任务和 Task Governance 记录；CI 环境失败只有在重试
策略和生产无副作用检查都记录后，才允许自动继续。

1.86.1 仍然不授权执行。它不写目标项目文件、不批准提交/推送、不批准发布/生产、
不绕过项目门禁、不删除制品、不强推，也不移除证据。

1.86.0 新增 Execution And Release Runtime Hygiene：当任务已经实现或准备交付时，
Codex 可以判断分支过旧、提交混杂、本地门禁失败、CI 失败、发布预检、制品配额、
发布包过大和生产副作用不明等问题。

1.86.0 仍然不授权执行。它不写目标项目文件、不批准提交/推送、不批准发布/生产、
不绕过项目门禁、不删除制品、不强推，也不移除证据。

1.85.1 加严 Task Governance Consumer Integration：严格任务消费检查会验证
被引用的 Work Queue 和 Task Governance 来源证据，证明 Work Queue item 和同一份
Task Governance 记录互相绑定；Closure 和 User Delivery 视图也必须带任务引用；
非当前任务要继续执行时，必须有结构化 resume review 证据。

1.85.1 仍然不授权实现。它不新增收口系统、不写目标项目文件、不批准实现、
不单独批准完成、不批准提交/推送、不批准发布/生产，也不替代项目原有审核人。

1.85.0 新增 Task Governance Consumer Integration：Execution Assurance、
Completion Evidence、Unified Closure 和 User Delivery Console 可以进入严格任务消费模式，
检查“完成/状态”结论是否绑定到当前 Work Queue 任务和匹配的 Task Governance 记录。

1.85.0 仍然不授权实现。它不新增收口系统、不写目标项目文件、不批准实现、
不单独批准完成、不批准提交/推送、不批准发布/生产，也不替代项目原有审核人。
它只负责阻止下游报告拿错任务、过期队列项、未解决的 `POSSIBLE_HIGH` 或缺失
分级证据时宣称 done。

1.84.1 加严 Existing Project Work Queue Takeover：旧任务来源会记录 digest；
过期或风险来源不能被提升为 `CURRENT`；迁移出来的 `CURRENT` 任务在真实
Task Governance 证据记录并通过检查前，仍然不可执行。`takeover_review_ready`
只表示报告可进入评审，不表示 Codex 可以开始实现。

1.84.1 仍然不授权实现。它不写目标项目文件、不删除旧任务来源、不批准实现、
不批准完成、不批准提交/推送、不批准发布/生产、不宣称完整接入、不安装原生
资产，也不允许直接执行旧 TODO。

1.84.0 新增 Existing Project Work Queue Takeover：老项目如果任务记录混乱或
几乎没有任务体系，Codex 可以先判断现有任务体系属于可靠、混乱、缺失还是危险
状态，再决定是映射原有任务体系，还是建议由 IntentOS Work Queue 成为未来任务
入口。旧 TODO/session 只作为来源保留，不能直接当作执行许可。

1.84.0 仍然不授权实现。它不写目标项目文件、不删除旧任务来源、不批准实现、
不批准完成、不批准提交/推送、不批准发布/生产、不宣称完整接入，也不安装原生
资产。

1.83.3 加严真实任务执行前的任务治理：验证字段不再默认写成“已完成”，而是记录
required/recorded 状态；`--out` 报告只能写在目标项目内；LOW/MEDIUM 报告会直接
扫描原始需求，避免隐藏 API、权限、支付、审批等高风险词；有效的项目原生证据会
清除对应 readiness blocker；用户可见摘要必须保持白话。

1.83.3 仍然不授权实现。它不写实现改动、不批准完成、不批准提交/推送、
不批准发布/生产，也不替代项目原有审核人。

1.83.2 明确任务分级后的审查策略：`LOW` 不是无审查，而是轻量自检；
`MEDIUM` 要做定向审查或 checker 验证；`POSSIBLE_HIGH` 必须先澄清或只读检查；
`HIGH` 才进入完整审查和证据链。这样避免“分级”被误解成“可以跳过审查”。

1.83.2 仍然不授权实现。它不写目标项目文件、不批准实现、不批准完成、
不批准提交/推送、不批准发布，也不替代项目原有审核人。

1.83.1 加严老项目任务治理里的“项目原生证据绑定”：老项目可以继续使用
自己的 RFC、QA 清单、session、工程基线、发布 SOP 和 gate 证据，但 IntentOS
现在会要求这些记录具备可解析 artifact 引用、匹配 digest、负责人、适用范围、
当前任务匹配和白话摘要，不能只写一句“已有文档”就算通过。

1.83.1 仍然不授权实现。它不写目标项目文件、不安装 `.intentos/`、不替换
`AGENTS.md`、不改 CI/hook/发布规则、不批准实现、提交、推送、发布或生产，
也不宣称任务完成。

1.83.0 新增 Behavior-Complete Existing Project Adoption 的任务治理入口：
老项目或部分接入项目开始做任务前，Codex 可以先把任务判断为 `LOW`、
`MEDIUM`、`POSSIBLE_HIGH` 或 `HIGH`，再自动选择对应治理强度。小修和中等
变更保持轻量；高影响任务会进入 Business Rule Closure、Change Impact
Coverage、Verification Plan、Test Evidence、Execution Assurance 和
Completion Evidence 这条既有证据链。

1.83.0 只是分类和路由，不是新的完成系统。它不写目标项目文件、不安装
`.intentos/`、不替换 `AGENTS.md`、不改 CI/hook/发布规则、不授权实现、
不批准提交或发布，也不宣称任务完成。

1.82.1 加严 Controlled Native Adoption Review：上游 source blocker 只有确认属于目标项目时才会驱动阻断；治理成熟度和推荐结果必须符合统一矩阵；轻量低风险需要明确低生产敏感性；source trace 会记录 ref、digest、outcome 和 blocker class，方便复查。

1.82.0 新增 Controlled Native Adoption Review：`adopt` 之后，如果老项目想进一步接入，`adopt-review` 会让 Codex 判断项目治理成熟度并推荐最安全的接入深度。强治理项目可以继续部分接入；弱治理或混乱项目先修治理；轻量项目可以准备更深接入计划。它仍然只读，不安装 `.intentos/`、不替换 `AGENTS.md`、不改 CI，也不宣称完整接入。

1.81.3 优化老项目接入结果卡：`adopt` 的 Human Summary 不再直接显示
内部枚举，而是用白话说明当前状态和可用工作方式。原始状态仍保留在 JSON、
Outcome 和技术追踪里，方便审计。脚本参考和能力表也补上了 `adopt` /
`adopt-check` 与老项目安全接入自动判断。

1.81.2 收紧公开入口语义：`start` 只保持只读识别，不写计划文件、不应用工作流资产；`adopt` 才是老项目进入安全接入流程的公开入口。这样用户只是让 Codex 读取项目时，不会误触发迁移。

1.81.0 新增老项目安全接入自动判断：`adopt` 会把老项目接入判断汇总成一张只读结果卡，不再要求用户理解内部接入命令。它可以说明 IntentOS 是否能作为安全工作方式使用，但不写项目文件、不安装 `.intentos/`、不改变项目权威，也不宣称完整接入。

1.80.3 加严 Release Evidence Gate 的 owner 和 completion 绑定：一个 release candidate 如果包含多份 Completion Evidence，严格检查会逐份校验，确认每份 completion 的 task 都属于本次 release scope，并要求 release/risk/environment owner readiness 和非授权 approval ref 都进入结构化证据。它仍然不批准发布、不部署生产、不提交应用商店或小程序审核、不执行迁移、不记录密钥、不改 DNS/支付/CI，也不证明真实用户稳定可用。

1.80.2 收口 Release Evidence Gate 精度缺口：runtime smoke、rollback、monitoring 证据现在都有 digest 字段，严格检查会从真实 artifact 重新计算；Release Evidence 报告也会检查关键 Markdown 表格和机器 JSON 是否一致。README 能力表也把 Release Evidence Gate 作为一等能力列出。它仍然不批准发布、不部署生产、不提交应用商店或小程序审核、不执行迁移、不记录密钥、不改 DNS/支付/CI，也不证明真实用户稳定可用。

1.80.1 加严 Release Evidence Gate：严格检查现在会重新计算 source-chain 文件 digest，解析必须的 build/runtime/rollback/monitoring 证据，并在要求当前 completion 时运行严格 Completion Evidence 校验。生成项目 smoke 也会验证 `release-evidence` 和 `release-evidence-check` 已安装且可用。它仍然不批准发布、不部署生产、不提交应用商店或小程序审核、不执行迁移、不记录密钥、不改 DNS/支付/CI，也不证明真实用户稳定可用。

1.80.0 新增 Release Evidence Gate：在任务完成证据和用户状态卡之后，Codex 可以准备一份发布评审证据包，判断这个 release candidate 是否可以交给人类 release owner 做正式评审。它会记录版本范围、发布目标、证据链 digest、owner/approval 拆分、运行 smoke、回滚、监控、环境、迁移、成本配额和老项目发布 SOP 映射。它仍然不批准发布、不部署生产、不提交应用商店或小程序审核、不执行迁移、不记录密钥、不改 DNS/支付/CI，也不证明真实用户稳定可用。

1.79.4 把 User Delivery Console 的中间证据信号也校准到当前请求：Business Rule Closure、Change Impact Coverage、Verification Plan、Test Evidence、Execution Assurance 只有匹配当前 `--intent` 时，才会让用户面显示 Yes；其他任务的记录只留在 trace 中，不会误当成当前任务证据。同时补了 1.80 Release Evidence Gate 方案。它仍然不写项目文件，不批准实现、提交、推送、发布或生产，也不证明真实用户稳定可用。

1.79.3 把 User Delivery Console 里的用户验证备注和正式 Test Evidence 分开：`--verification` 自由文本只会显示为用户备注，不会让“测试/检查证据已记录”变成 Yes；只有真实的 `test-evidence-reports/` 才算正式测试证据。同时发布证据补记 `git diff --check`。它仍然不写项目文件，不批准实现、提交、推送、发布或生产，也不证明真实用户稳定可用。

1.79.2 收紧 User Delivery Console 当前任务绑定：`status --intent` 只有在严格 Completion Evidence 检查通过且匹配当前请求时，才会把任务视为完成。用户看到的是白话状态，内部枚举只保留在 trace / JSON 中。它仍然不写项目文件，不批准实现、提交、推送、发布或生产，也不证明真实用户稳定可用。

1.78.3 补齐 1.78 Completion Evidence 的兼容性和 reference docs：严格完成校验要求 Business Rule Closure、Verification Plan、Test Evidence、Execution Assurance、Completion Evidence 使用同一条 canonical task intent；旧的 1.78.0/1.78.1 Completion Evidence 报告需要补 `source_chain[].intent_digest`，严格 Execution Assurance 来源需要顶层 `intent_digest`。这是文档/引用补丁，不新增 gate。

1.78.2 收口 Completion Evidence 合约：`source_chain[].intent_digest` 现在进入 schema 合约，Execution Assurance 暴露顶层 `intent_digest`，Completion Evidence 会直接校验 Execution Assurance intent，而不是只通过 task/source_systems 间接绑定。它仍然只是任务完成声明 gate，不执行测试、不批准发布、不证明生产环境结果。

1.78.1 加严 Completion Evidence Gate：Codex 不只检查四份报告都 ready，还会检查 BRC、Verification Plan、Test Evidence、Execution Assurance 是否真的形成同一条源证据链，并校验 source digest、source schema 和 intent digest。它仍然不执行测试、不批准提交、不批准发布，也不证明生产环境结果。

1.78.0 新增 Completion Evidence Gate：Codex 只有在 Business Rule Closure、Verification Plan、Test Evidence、Execution Assurance 都已记录、就绪，并且绑定同一个任务时，才能说“这个任务完成了”。它会拦截缺测试证据、复用旧任务报告、执行证明没完成却提前收口等问题。它仍然不执行测试、不批准提交、不批准发布，也不证明生产环境结果。

1.77.2 同步 Test Evidence 的安装烟测和 schema 合约：更严格的 Test Evidence 报告形状正式标记为 schema `1.77.1`；示例和坏例子重新生成；PR 里的生成项目 smoke 会可见地跑完 BRC -> CIC -> Verification Plan -> Test Evidence 严格绑定；Markdown/JSON 的 reason 字段也会对齐检查。它仍然不执行测试，也不批准发布。

1.77.1 收紧 Test Evidence Binding：命令/测试报告证据必须记录 `exit_code` 和 `failure_reason`；通过的证据必须能解析到真实 artifact 并匹配 digest；Verification Plan 要求的测试质量控制必须在 Test Evidence 中逐项继承。它仍然不执行测试，也不批准发布。

1.77.0 新增 Test Evidence Binding：Verification Plan 说清楚“哪些必须验证”之后，Codex 还要把真实命令、人工、报告等证据逐项绑定到每个验证义务。它会拦截前端/后端/API 漏测、过期报告、跳过或失败证据、只跑大命令就当证明、人工证据没有负责人等问题。它不执行测试，也不批准发布。

1.76.3 收口 Verification Plan 一致性：Markdown 表格现在会和 JSON 证据做双向检查，Test Correctness Controls 也会交叉校验，READY 状态的计划必须有已记录的 BRC/CIC source systems。

1.76.2 收紧 Verification Plan 报告一致性：用户阅读的 Markdown 正文现在必须和机器读取的 JSON 证据一致，覆盖 source systems、身份信息、项目校准、影响面、验证义务、人工验证、N/A 项和 outcome。

1.76.1 收紧 Verification Plan 证据链：严格检查现在会证明 Change Impact Coverage 消费的 Business Rule Closure，和 Verification Plan 引用的是同一份；`source_systems[]` 也必须和顶层 ref、digest、outcome 一致，避免来源链变成展示性说明。

1.76.0 新增 Verification Plan Governance：在 Business Rule Closure 和 Change Impact Coverage 之后，Codex 需要生成一份和当前任务、业务规则、影响面绑定的验证计划，说明哪些地方必须测、测试本身如何避免写错、哪些人工验证需要负责人，以及为什么单纯 `npm test` 这类大命令不能直接当作业务闭环证明。它只规划验证，不执行测试、不批准实现，也不批准发布或生产。

1.75.2 收紧业务规则绑定落地：严格业务规则检查现在会强制要求 Change Impact Coverage 具备机器可读证据；Business Rule Closure 使用 `--out` 生成时会自引用真实输出路径；生成项目 smoke 会验证同一份 BRC -> CIC 严格绑定链。

1.75.1 加严 Business Rule Closure 绑定：规则闭合报告必须自引用当前报告；Change Impact Coverage 严格模式可以校验 `business_rule_ref` 是否指向 READY 的业务规则闭合报告，并匹配 digest 和 state。

1.75.0 新增 Business Rule Closure：在 Codex 把用户需求转成实现前，先由 AI 归纳业务规则、补齐角色、触发条件、成功/失败路径、默认处理、待确认问题和真实环境验证期待，再把闭环结果接到 Change Impact Coverage。它是通用需求沟通层，不是合同、税务、财务、人资或法务业务模板；这些词只作为示例或风险信号。

1.74.3 收口 1.74 Execution Assurance 线：self-check 输出现在明确覆盖 1.72-1.74 assurance 链路，checker 会把人看的 Execution Plan、Actual Diff、Evidence Binding 表格与机器 JSON 证据做一致性校验，避免报告正文和结构化证据不一致。

1.74.2 清理了 active runtime 里剩余的旧式大写状态命名，并加严 Execution Assurance：只有能解析到真实执行计划的 `VERIFIED_DONE` 才能通过。生成项目 smoke 现在会先保存一份 assurance report，再检查同一份记录。

1.74.1 同步 1.74 Execution Assurance 的落地细节：resolver 词汇、JSON schema 枚举、运行时 IntentOS 标签、README 命令表、文档和生成项目 smoke 现在都指向同一套行为。它不新增工作流层，也不要求普通用户学习内部证明链命令。

1.74.0 加严 Execution Assurance：Codex 说执行类工作“完成”时，来源系统、证据、实际改动和计划范围必须都绑定到当前任务。它会拦截过期证据、其他任务报告、超出计划的改动，以及只写 `review:` / `command:` 这种口头证明的完成声明。

1.73.0 完成 IntentOS 命名硬切：公开文档、包信息、CLI 帮助、manifest、生成工作流资产、CI workflow、模板和 active checks 都统一使用 IntentOS。已有项目如果还存在旧工作流资产，必须先生成明确迁移计划，再经确认后移动或改写目标项目文件。

1.72.1 加严 Execution Assurance：没有已记录的 Execution Assurance Report 时，完成校验会失败；只有维护者明确传入 `--allow-empty` 做资产级检查时才允许跳过。README 首屏也不再要求普通用户选择内部证明链命令。

1.72.0 新增 Execution Assurance Chain：所有执行类工作在 Codex 说“完成”前，都必须把用户意图、完成标准、影响面、实际改动、证据、复审结果和补丁判断串成一条可检查的证明链。

1.71.3 补齐老项目接入验收闭环：生成的验收报告可以用 `--out` 固定落盘，每个接入面的证据都必须进入 `evidence_refs`，未知证据前缀会失败，避免“看起来有证据但实际没法验证”。

1.71.2 继续加严老项目接入验收：通过的模拟步骤必须记录退出码、只读状态、目标文件 diff 状态、无写入证据和输出摘要；上游来源状态改为按结构化字段判断，避免因为文本里出现某个词就误判。

1.71.1 加严老项目接入验收：Codex 不能再只靠静态文字、占位目录或无关证据说“IntentOS 已完全生效”；报告必须有一致的结构化证据和真实只读模拟步骤。

1.71.0 新增老项目接入执行验收：老项目不能只靠 Codex 说“已接入”，必须检查关键接入面、有证据引用，并通过只读模拟任务证明 Codex 会按 IntentOS 工作流走。

1.70.1 加严老项目治理收敛证据：严格检查会同时核对人工摘要、Markdown 维度、机器可读证据、上游来源状态和最终 outcome，避免报告写了但证据不一致。

1.70.0 新增老项目治理收敛：老项目可以更接近新项目的 IntentOS 日常工作方式，但会先只读比较 workflow、基线、审计、发布、CI/hook、文档、任务队列、AI log 和保护性权力边界；它不会直接写项目文件、替换旧规则、重写历史或批准生产发布。

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

核心原则：

- 用户负责目标、取舍、风险接受和发布确认。
- AI 负责读取、整理、生成计划、执行、验证和记录。
- 所有可能写入项目的动作，都必须先变成可确认的计划。

## 一句话开始

多数用户从这里开始就够了：

```text
我想做一个预约 App，你帮我开始。
```

Codex 应该把这种自然语言目标自动当成 IntentOS 入口，内部按 Beginner Entry 处理。

如果需要命令行证据、CI 验证或维护者调试，等价命令是：

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

1.37 加入 Conversation-Native Ask：命令是实现和审查证据，不是普通用户开始前必须知道的东西。

## 适合什么场景

| 场景 | IntentOS 会怎么处理 |
|---|---|
| 从 0 做一个产品 | 先确认平台、目标用户、第一条核心流程和工程基线 |
| 进行中的项目 | 先检查当前状态、未完成任务、基线缺口和可写入范围 |
| 老项目接入 AI | 先做 existing workflow mapping，再用 native migration plan 规划原生接入，不直接复制整套规则 |
| 已上线项目 | 默认先只读，再走 production-safe native overlay，保护现有 CI、发布、回滚和证据链 |
| 任务做到一半被打断 | 用 Work Queue / Todo 记录当前任务、暂停任务和恢复入口 |
| 想加 hook 或自动化 | 先生成 hook plan / hook policy，不自动安装、不改 CI |
| 复杂问题怕被补丁化 | 先做 patch classification，再决定是小修、结构治理还是人工决策 |

## 项目分级

IntentOS 不鼓励一上来启用最重治理。它按项目风险分层：

| 级别 | 适合项目 | 默认建议 |
|---|---|---|
| O0 / BL0 | 试验、小工具、低风险功能 | 轻量流程和最小基线 |
| O1 / BL1 | 普通 Web、中台、小程序、App、后台服务 | 标准流程、平台 profile、标准基线包 |
| O2 / BL2 | 有客户、生产数据、权限、支付、发布风险 | 标准基线 + 按需工业增强包 + 更严格证据 |

平台 profile 用来区分 Web、iOS、Android、微信小程序、后端、内部管理系统和高风险变更。标准基线包处理普通工程质量；工业增强包只在 BL2、高风险或生产敏感场景下按需启用。

## 包含哪些能力

| 能力 | 作用 |
|---|---|
| Conversation-Native Ask | 用户直接说目标，Codex 自动按入口流程判断 |
| Beginner Entry | 用户只说目标，AI 给出可确认的下一步 |
| Guided Adoption | 判断项目是新项目、老项目、强治理项目还是生产敏感项目 |
| Existing Project Safe Adoption Autopilot | 老项目说“接入 IntentOS”时，`adopt` 自动跑只读诊断、规则对比、收敛与验收摘要，输出白话结果卡；不写项目、不安装 `.intentos/`、不宣称完整接入 |
| Controlled Native Adoption Review | 老项目想进一步接入时，`adopt-review` 判断项目治理成熟度并推荐最安全接入深度：保持部分接入、先修治理，或准备更深接入计划；仍然只读、不写项目、不替换规则 |
| Task Governance | 老项目或部分接入项目执行任务前，先判断任务是小修、中等变更、疑似高风险还是高影响任务，再自动选择轻量、短计划或完整证据链；不授权实现、不宣称完成 |
| Native-First Migration | 老项目不再停在笼统 adapter 建议；先分类旧规则和权力边界，再计划接入 IntentOS |
| Existing Rule Reconciliation | 对比旧项目规则和 IntentOS 参考规则，只输出建议，不直接替换旧治理 |
| Governance Convergence | 老项目可以按 IntentOS 日常工作方式收敛，但基线、发布、CI、hook、历史证据和旧规则必须先比较再计划 |
| Adoption Assurance | 验证老项目是否真的按 IntentOS 工作，需要证据和只读模拟支撑，而不是只靠“已接入”的说法 |
| Baseline Decision | 用白话确认 BL0 / BL1 / BL2、平台和风险 |
| Ordinary First Slice | 把普通用户的一句话目标整理成第一版范围、问题、延期项和验证方式 |
| Product Completeness | 判断现在是想法、第一版范围、可本地运行 MVP、内测候选还是阻塞 |
| Real MVP Example | 用内置预约和看板 Web MVP 样例证明这条链路可以本地跑通 |
| Standard Baseline Packs | 为不同平台提供普通工程基线 |
| Industrial Overlays | 为生产、客户数据、权限、支付、发布等风险提供增强治理 |
| Review Surface | 执行前判断任务完成后需要审哪些面 |
| Business Rule Closure | 写代码前先把业务规则闭环，AI 负责补齐规则维度和默认建议，用户只确认少数关键判断 |
| Change Impact Coverage | 防止业务规则只改一层，要求前端、API、后端、文案、测试和交接等相关面逐项收口 |
| Verification Plan Governance | 根据业务规则和影响面生成任务绑定的验证义务，说明哪些测试或检查足以支持后续收口；不执行测试，不批准实现或发布 |
| Test Evidence Binding | 把真实命令、报告、人工或日志证据绑定到 Verification Plan 的每个必验证项；检查退出码、证据文件、digest、任务匹配和测试质量控制，不执行测试、不批准发布 |
| Completion Evidence Gate | 最终说“任务完成”前，检查 Business Rule Closure、Verification Plan、Test Evidence、Execution Assurance 是否 recorded、ready、同 task、同 source chain；不运行测试、不批准发布 |
| User Delivery Console | 用一张普通用户状态卡回答“做到哪、能不能算完成、能不能进上线评审、还缺什么、下一步能安全做什么”；只汇总下层证据，不替代下层证据系统 |
| Release Evidence Gate | 正式发布前，把 release candidate、Completion Evidence、runtime smoke、rollback、monitoring、owner、环境/迁移/成本和老项目发布规则汇成 release owner review 证据包；不批准发布、不执行上线 |
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

## 用户入口

多数用户只需要这样开始：

```text
直接告诉 Codex 你的项目目标。
Codex 读取项目、推荐路径，并只问少数真正需要你判断的问题。
```

需要命令行证据时，用：

| 你想做什么 | 命令 |
|---|---|
| 用一句话开始 | `node scripts/cli.mjs ask ../my-project "我想做一个预约 App"` |
| 看更完整的下一步建议 | `node scripts/cli.mjs guide ../my-project --deep --intent "我要加支付预约"` |
| 判断任务能不能收口 | `node scripts/cli.mjs finish ../my-project --intent "新增合同录入限制" --verification "npm run verify passed"` |
| 准备发布路径 | `node scripts/cli.mjs release-guide ../my-project --intent "帮我上线"` |
| 看统一发布视图 | `node scripts/cli.mjs release-plan ../my-project --intent "帮我上线"` |
| 写入前生成统一计划 | `node scripts/cli.mjs apply-plan ../my-project --intent "接入 IntentOS"` |

普通用户不需要先理解内部 workflow 命令。

## 维护者和证据命令

这些命令主要给维护者、CI、审计和显式证据使用：

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
| 判断当前任务需要多重治理 | `node scripts/cli.mjs task-governance ../my-project --intent "新增审批状态规则"` |
| 检查任务治理报告 | `node scripts/cli.mjs task-governance-check ../my-project` |
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

## 安全边界

IntentOS 默认保护这些边界：

- 不因为一句话就写文件。
- 不把建议当成执行授权。
- 不自动改 CI、hook、发布流程或生产配置。
- 不自动启用 BL2 或工业增强包。
- 不自动删除、移动、归档或重写文档。
- 不替用户批准权限、支付、税务、法务、数据迁移、生产发布等高风险决策。
- 不覆盖已有强治理项目的规则；先只读映射，再决定是否选择性接入。

一句话：IntentOS 让 AI 更会推进项目，但不让 AI 替人做风险决定。

## 新项目、老项目、上线项目

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

## 验证这个仓库

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

## 文档入口

先读这些：

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

核心流程：

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

基线和项目接入：

- [Baseline Pack System](docs/baseline-pack-system.md)
- [Standard Baseline Pack Registry](docs/standard-baseline-pack-registry.md)
- [Platform Standard Baseline Packs](docs/platform-standard-baseline-packs.md)
- [New Project Playbook](docs/adoption-playbooks/new-project.md)
- [Existing Light Project Playbook](docs/adoption-playbooks/existing-light-project.md)
- [Governed Read-Only Playbook](docs/adoption-playbooks/governed-project-read-only.md)
- [Production Project Adapter Playbook](docs/adoption-playbooks/production-project-adapter.md)

查规范：

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

当前版本：

- [1.81.0 Release Record](releases/1.81.0/release-record.md)
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

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). Commercial use, resale, paid redistribution, or use as part of commercial consulting/service delivery is not permitted without prior written permission. See [LICENSE.md](LICENSE.md), [LICENSE-FAQ.md](LICENSE-FAQ.md), and [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md).
