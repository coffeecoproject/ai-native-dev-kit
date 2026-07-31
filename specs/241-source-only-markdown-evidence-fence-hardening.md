---
schema_version: 1.0
artifact_type: spec
number: 241
slug: source-only-markdown-evidence-fence-hardening
title: "source only markdown evidence fence hardening"
status: ready
created_at: 2026-07-31
intentos_version: 1.113.0
request: requests/241-source-only-markdown-evidence-fence-hardening.md
preflight: preflight/241-source-only-markdown-evidence-fence-hardening.md
---
# Spec 241: source only markdown evidence fence hardening

## Status

Ready

## Source

- Request: `requests/241-source-only-markdown-evidence-fence-hardening.md`
- Preflight: `preflight/241-source-only-markdown-evidence-fence-hardening.md`

## Problem

同轮采用链从生产者的人类 Markdown 报告提取 `Machine-Readable Evidence`。证据对象中的项目原文可包含三反引号；普通 `JSON.stringify` 会原样输出该字符序列，现有 fence 提取器因而提前终止，造成合法证据伪损坏。

## User Story

As a source-only IntentOS adopter,
I want project-native rule text to survive Markdown evidence transport exactly,
so that adoption diagnosis fails only for real evidence defects rather than fence collisions.

## Scope

Included:

- 新增共享 Markdown-fence-safe JSON 序列化函数。
- 仅将 fence-sensitive 三反引号编码为 JSON Unicode escapes。
- 将治理标题下的 `none` / `N/A` 等占位声明记录为可审查的 low-signal block，而不是生成 checker 无法接受的伪规则。
- Native Migration checker 只从 `Boundaries` 章节读取边界声明，项目源码摘录中的同名文本不得覆盖真实边界。
- Rule Reconciliation 的禁止性声明扫描只检查报告自己产生的结论章节，不把受保护的项目原文误当成 IntentOS 声明。
- 接入四个 same-run adoption producer。
- 增加 helper 单元测试和 Adoption Assurance 集成测试。
- 在 Pawcode 上重跑只读采用链验证真实复现关闭。

## Non-goals

- 不改变 schema、字段、parsed value、digest 算法或采用状态规则。
- 不放宽 strict checker。
- 不更新 Pawcode 文件。
- 不新增依赖、CI、hook、release 或版本变更。

## Data Model Impact

无。

## API / Interface Contract

### `stringifyJsonForMarkdownFence(value, space = 2)`

Input:

任意 JSON 可序列化值及可选缩进。

Output:

返回合法 JSON 字符串。任何字面量三反引号均以三个 `\\u0060` escape 表示；`JSON.parse` 后恢复原值。

Errors:

- 非 JSON 可序列化输入遵循 `JSON.stringify` 原语义。

## UI States

不适用。

## Permission Rules

- 不改变权限。所有报告仍为只读、非授权证据。

## Observability

- Logs: 现有严格 checker 输出。
- Metrics: 不适用。
- Audit events: 现有 same-run source refs 和 digest。

## Acceptance Criteria

- 含三反引号的 evidence value 序列化后不包含可结束 Markdown fence 的字面量序列。
- 序列化结果可由 `JSON.parse` 恢复为深度相等的原始值。
- 占位声明不会产生空语义 rule classification，也不会被静默丢弃。
- 项目规则即使包含 `This plan modifies CI or hooks: No` 等报告标记，也不能污染边界解析。
- 项目原文中的 release / production 约束必须保留并分类，但不能触发“IntentOS 作出禁止声明”的伪阳性。
- Native Migration 和 Existing Rule Reconciliation 的严格检查接受含该摘录的报告。
- Adoption Assurance 为 Native Migration 和 Rule Reconciliation 生成 `same-run:` refs，而不是 `generated:*` 伪失败。
- 原有无效证据、遗漏规则和权限阻塞测试继续失败关闭。
- Pawcode 只读采用链不再报告 `strict checker failed` 或 `FAILED_INVALID_EVIDENCE`；dirty、identity、release 等真实阻塞仍被保留。

## Test Plan

- Unit: safe serializer round-trip 与 fence collision。
- Integration: `existing-adoption-activation-hardening.test.mjs` 的真实三反引号项目规则。
- E2E: source-only Adoption Assurance same-run chain。
- Manual: 对 Pawcode 重跑 `adopt` / `adoption-assurance`，确认 Git 状态不变。

## Rollback Notes

回退 helper、四个调用点和对应测试即可；无数据迁移或目标项目回滚。

## Open Questions

- 无。
