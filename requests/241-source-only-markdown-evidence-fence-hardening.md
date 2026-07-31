---
schema_version: 1.0
artifact_type: request
number: 241
slug: source-only-markdown-evidence-fence-hardening
title: "source only markdown evidence fence hardening"
status: ready
created_at: 2026-07-31
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 241-source-only-markdown-evidence-fence-hardening

## Raw Request

原始需求：

以 `codex/source-only-external-adoption-hardening` 为准，修复 Pawcode 的 IntentOS source-only 外部采用问题；保留 Pawcode dirty worktree 和项目原生规则。

## User / Customer

从 IntentOS 源仓库诊断或采用既有项目的零经验独立开发者与 Codex。

## Problem

项目规则摘录可能包含字面量三反引号。Native Migration 把结构化证据放进 Markdown `json` fence 时，字面量三反引号会被证据提取器误认为结束 fence，导致同轮 Rule Reconciliation、Convergence 和 Adoption Assurance 伪失败。

## Current Workflow

用户运行 source-only `work` / `adopt`。当前 Pawcode 复现为 `FAILED_INVALID_EVIDENCE`，即使原始 JSON 输出有效且项目规则没有缺失。

## Desired Outcome

所有同轮采用生产者都以 Markdown-safe、JSON 语义等价的形式输出结构化证据；严格检查和同轮 envelope 消费链可处理包含三反引号的真实项目源码。

## Constraints

- 仅修改 IntentOS 源分支和回归证据。
- 不修改 Pawcode 业务代码、业务文档、`AGENTS.md`、CI、hooks 或 release 配置。
- 不新增依赖，不弱化严格检查，不改变解析后的证据值或 digest 语义。
- 失败仍必须 fail closed。

## Priority

P1

## Suggested Task Level

L2

## Deadline

当前 Pawcode UI 工作继续前完成。

## Notes

真实复现摘录来自项目脚本中的 `.replace(/```[\\s\\S]*?```/g, " ")`。Pawcode 当前工作区约 180 个已有改动或未跟踪文件，本任务不得触碰。
