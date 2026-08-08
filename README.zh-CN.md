# IntentOS

[English](README.md) | 简体中文

一个面向 Codex、以可信证据驱动软件交付的开源工作层。

当前版本：`1.113.0`。

发布记录：[releases/1.113.0/release-record.md](releases/1.113.0/release-record.md)。

IntentOS 让用户用自然语言说明真实产品目标或工程目标，由 Codex 处理项目理解、
技术规划、实现、验证、审查、修复、完成证据和发布准备。

> 你负责说明目标、真实业务事实，并对具体的现实世界影响作出授权；IntentOS
> 负责让技术过程保持连贯、可检查、可追溯。

IntentOS 已采用 [Apache License 2.0](LICENSE.md) 完全开源。任何人都可以在遵守
该许可证的前提下使用、修改和再分发，包括用于商业项目。

## IntentOS 是什么

IntentOS 是放在 AI 编码代理和项目仓库之间的一套项目本地工作流与治理系统：

```text
你的目标
  -> Codex 读取项目
  -> IntentOS 选择交付控制
  -> Codex 规划并实现
  -> IntentOS 检查证据和边界
  -> Codex 修复问题并准备安全交付
```

它不是新的大模型，不是自动操作生产环境的机器人，也不是托管服务或应用框架。
Codex 是目前正式支持的代理入口；Claude 和 Cursor 文件只是兼容性参考，不代表
已经具备相同行为。

## 当前分发状态

IntentOS 目前以源码形式提供：

- 需要 Node.js `22.x`，正式支持范围为 `>=22 <23`；
- 源码仓库和检查需要 Git 与 npm；
- Codex 是当前正式支持的交互代理；
- 目前还没有公开 npm 包、全局安装器、控制台或托管版 IntentOS 服务；
- 源码 CLI 可以只读检查目标项目并选择工作入口；
- 向老项目安装项目本地资产时，会使用可审查的精确计划、回滚机制和 apply receipt。

“完全开源”指任何人都可以依法使用和修改源码，不代表规划中的 npm/plugin 产品化
分发已经完成。

## 使用 Codex 开始

### 1. 克隆 IntentOS

```bash
git clone <当前仓库URL> intentos
cd intentos
node --version
```

### 2. 进入你要处理的项目

按照 [Codex CLI 官方说明](https://learn.chatgpt.com/docs/codex/cli)安装并登录，然后
从目标项目目录启动 Codex：

```bash
cd /你的项目路径
codex
```

告诉 Codex IntentOS 源码的位置：

```text
读取 /IntentOS源码路径/intentos，把 IntentOS 接入当前项目。
先只读检查，保留项目已有规则和业务代码；写入前展示精确计划，执行后验证项目本地入口。
```

如果当前目录是一个全新空项目，可以直接描述要做什么：

```text
读取 /IntentOS源码路径/intentos，使用 IntentOS 在当前目录创建一个预约应用。
根据目标自行选择技术方案，并验证第一个可用业务切片。
```

### 3. 后续继续正常使用 Codex

完成接入后，仍然直接用自然语言工作：

```text
继续当前任务。
```

```text
给预约流程增加取消规则，并验证所有受影响的端。
```

```text
这个任务真的完成了吗？把剩余风险告诉我。
```

接入后的项目拥有自己的 IntentOS 指引和项目本地脚本，日常进入项目时不需要每次都
依赖原始 IntentOS 源码仓库。

## 源码只读入口

如果只想从 IntentOS 源码仓库检查和路由一个项目，而不向目标项目安装任何文件：

```bash
node /IntentOS源码路径/intentos/scripts/cli.mjs \
  work /你的项目路径 \
  "检查这个项目并告诉我正确的下一步"
```

公开的 `work` 入口会理解开始、继续、检查、完成、准备发布和接入老项目等普通请求。
这个命令本身只读。维护者可以查看底层命令：

```bash
node scripts/cli.mjs --help-advanced
```

## IntentOS 覆盖什么

- 新项目和老项目入口；
- 当前任务与中断任务恢复；
- 业务规则闭环和跨端影响覆盖；
- 工程与平台基线选择；
- 实现计划和计划审查；
- 测试计划、执行证据、独立审查与修复；
- 完成证据和统一收口；
- 带精确动作与 receipt 的受控接入和更新；
- 发布准备、拓扑、运行时卫生和回滚证据。

内部机制可以很严格，但普通用户不需要选择 Profile ID、基线等级、检查命令、Schema、
Action ID 或审查角色。

## 老项目安全边界

IntentOS 会把已有仓库视为项目自己的资产：

- 写入前先检查；
- 保留更严格或已经在生产环境证明有效的项目规则；
- 不会为了安装工作流资产而随意覆盖业务代码；
- dirty worktree 只会在写入范围真正重叠并不安全时阻塞；
- 接入写入需要项目绑定计划、readiness、精确动作重放、回滚和可信 receipt；
- CI、hooks、密钥、供应商账号、发布、生产、付费资源、真实用户通信和不可逆数据操作
  不属于普通本地接入权限。

详细说明见[老项目接入](docs/for-existing-projects.md)和
[源码接入](docs/source-only-adoption.md)。

## 安全边界

IntentOS 不会：

- 编造业务、法律、税务、合规或供应商事实；
- 把用户沉默当作外部操作或不可逆操作的许可；
- 用过期或与当前任务无关的测试证据证明完成；
- 在缺少必要验证或收口证据时宣称任务完成；
- 把“已经准备好发布”当成生产操作授权；
- 因为 IntentOS 安装成功，就声称项目业务代码一定正确。

## 仓库结构

| 路径 | 用途 |
|---|---|
| `scripts/cli.mjs` | 公开源码入口 |
| `scripts/` | Resolver、Checker、受控写入和验证运行时 |
| `core/` | 当前工作流和治理契约 |
| `starters/` | 新项目 Starter 资产 |
| `profiles/` | 平台与项目类型基线 |
| `standard-baseline-packs/` | 可复用标准工程基线 |
| `industrial-packs/` | 更深入的行业和平台控制 |
| `schemas/` | 机器可读证据契约 |
| `tests/`、`test-fixtures/` | 行为与失败路径测试 |
| `examples/` | 示例证据和校准案例 |

## 验证仓库

维护者可以运行完整候选验收：

```bash
npm run verify
```

完整验收范围很广，执行时间可能较长。贡献要求和更小范围的检查见
[CONTRIBUTING.md](CONTRIBUTING.md)。

## 文档

- [开始使用](docs/start-here.md)
- [运行模型](docs/operating-model.md)
- [最小接入](docs/minimal-adoption.md)
- [源码接入](docs/source-only-adoption.md)
- [老项目接入](docs/for-existing-projects.md)
- [维护者说明](docs/for-maintainers.md)
- [文档索引](docs/index.md)
- [安全策略](SECURITY.md)

## 版本历史

当前行为由当前源码、产品契约和运行时定义。详细历史记录保存在
[VERSION.md](VERSION.md) 和 [releases/](releases/)；旧记录不会重新定义当前运行模型
或当前许可证。

## 参与贡献

欢迎提交 Issue、文档改进、测试和边界清晰的代码贡献。请先阅读
[CONTRIBUTING.md](CONTRIBUTING.md)。安全问题请按照 [SECURITY.md](SECURITY.md)
私下报告。

## 开源许可证

IntentOS 采用 [Apache License 2.0](LICENSE.md)。通俗说明和署名信息见
[LICENSE-FAQ.md](LICENSE-FAQ.md) 与 [NOTICE.md](NOTICE.md)。

以前已经分发的版本仍由对应分发物中附带的许可证管理。本说明不是法律意见。
