---
schema_version: 1.0
artifact_type: preflight
number: 241
slug: source-only-markdown-evidence-fence-hardening
title: "source only markdown evidence fence hardening"
status: ready
created_at: 2026-07-31
intentos_version: 1.113.0
request: requests/241-source-only-markdown-evidence-fence-hardening.md
task_level: L2
---
# Preflight: 241-source-only-markdown-evidence-fence-hardening

## Source Request

`requests/241-source-only-markdown-evidence-fence-hardening.md`

## Clarity

READY

## Problem Summary

Markdown fence 边界与 JSON 字符串内容没有隔离。包含三反引号的规则摘录会截断机器证据，使 source-only 外部采用同轮链错误地把有效项目证据判为缺失或损坏。

## Missing Information

- 无阻塞信息。真实 Pawcode 复现、失败字符位置、源分支调用链和受影响生产者均已定位。

## Assumptions

- 机器证据必须继续嵌入现有 Markdown `json` fence，以保持兼容性。
- 将 fence-sensitive 字符编码为等价 JSON Unicode escape，不改变 `JSON.parse` 后的业务值。

## Direction Risks

- 如果只修 Native Migration，下游生产者未来仍可能产生同类问题。
- 如果放宽 checker 或跳过同轮证据，会破坏 fail-closed 边界。

## Over-design Risks

- 不重写所有 Markdown 解析器；本切片只建立一个共享安全序列化器并接入四个同轮采用生产者。

## MVP Recommendation

在既有 `artifact-schema` 工具中新增 Markdown-fence-safe JSON 序列化函数，接入 Native Migration、Existing Rule Reconciliation、Governance Convergence 和 Controlled Native Adoption Review，并增加单元与同轮集成回归。

## Non-goals

- 不升级 IntentOS 版本或 manifest contract。
- 不改变证据 schema、digest、规则分类或项目权限。
- 不更新 Pawcode 已安装资产。
- 不清理或提交任何仓库。

## Domain Model Draft

- 无数据模型变化；仅改变 Markdown 中 JSON 的字符级表示，解析结果保持全等。

## Permission / Security Risks

- 不处理秘密或个人数据。
- 防止证据内容破坏结构边界；严格 checker 继续校验完整值和 schema。

## First Vertical Slice

```text
project rule with ``` -> native human report -> safe fenced JSON -> strict checker -> same-run envelope -> reconciliation / convergence / assurance
```

## Suggested Specs

- `specs/241-source-only-markdown-evidence-fence-hardening.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

问题可稳定复现，修复边界小且可回滚；无需用户技术选择或真实世界授权。
