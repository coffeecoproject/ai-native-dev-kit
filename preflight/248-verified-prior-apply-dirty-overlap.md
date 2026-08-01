---
schema_version: 1.0
artifact_type: preflight
number: 248
slug: verified-prior-apply-dirty-overlap
title: "verified prior apply dirty overlap"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/248-verified-prior-apply-dirty-overlap.md
task_level: L2
---
# Preflight: 248-verified-prior-apply-dirty-overlap

## Source Request

`requests/248-verified-prior-apply-dirty-overlap.md`

## Clarity

READY

## Problem Summary

连续受控更新缺少一条从“上一份当前有效 receipt 的精确动作结果”到“下一份计划 dirty fingerprint”的受控所有权投影，导致安全事务路径被零重叠规则误判。

## Missing Information

- None. v4 计划、v3 receipt、当前 hashes 和源码门禁均可本地验证。

## Assumptions

- 当前有效 receipt 是最近一份能通过完整项目绑定、动作图、hash 与激活证据校验的 receipt。
- 只有 receipt 中实际 `APPLIED` 且当前仍保持 `hash_after` 的文件可作为事务自有路径。

## Direction Risks

- 若只按路径名或版本文件自声明放宽，会允许伪造或用户改动穿过门禁。
- 若允许目录祖先/后代重叠，会扩大到未证明文件。

## Over-design Risks

- 不设计一般化 dirty merge、三方合并或历史 receipt 联合信任。

## MVP Recommendation

先计算当前 dirty 路径与当前计划写路径的精确文件级交集，再由最近有效 receipt 及其原执行计划逐项证明该交集；canonical fingerprint 绑定 receipt、plan、action ID 与 hash，激活规则要求证明路径与交集完全相等。

## Non-goals

- 不放宽普通项目改动或业务文件重叠。
- 不修改 receipt schema、状态机、权限、发布或生产行为。
- 不执行 Pawcode 计划作为本 Task 的实现步骤。

## Domain Model Draft

- `verifiedPriorApplyOverlap`: 当前 dirty/write 精确交集的结构化证明；包含 prior receipt/plan 引用与 digest，以及每个路径的 prior action ID 和 `hash_after`。任何一项无法证明时整体为 `null`。

## Permission / Security Risks

- 伪造 plan 字段必须被 canonical-plan 重建拒绝。
- 无效、陈旧、复制或 hash 漂移 receipt 不得贡献路径。
- 目录级 dirty 项不得因子文件被证明而放行。

## First Vertical Slice

```text
valid prior receipt -> canonical target fingerprint -> exact dirty/write overlap check -> controlled apply activation
```

## Suggested Specs

- `specs/248-verified-prior-apply-dirty-overlap.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

范围、证据、失败关闭条件、回滚和测试路径均已明确；无需业务事实或外部授权。
