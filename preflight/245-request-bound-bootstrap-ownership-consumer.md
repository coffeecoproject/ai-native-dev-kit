---
schema_version: 1.0
artifact_type: preflight
number: 245
slug: request-bound-bootstrap-ownership-consumer
title: "request bound bootstrap ownership consumer"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/245-request-bound-bootstrap-ownership-consumer.md
task_level: L2
---
# Preflight: 245-request-bound-bootstrap-ownership-consumer

## Source Request

`requests/245-request-bound-bootstrap-ownership-consumer.md`

## Clarity

READY

## Problem Summary

Planner 与 request-bound authority 对旧 bootstrap ownership 使用了两套消费者
逻辑，导致 planner 已证明的受管文件仍在 apply preflight 被拒绝。

## Missing Information

- None; source code、Task 244 证据和 Pawcode exact plan 已定位完整断链。

## Assumptions

- bootstrap plan/receipt 和当前文件 hash 仍是唯一可接受的 fallback 证据。
- 当前 request-bound action 必须携带与重新计算结果完全一致的 ownership。

## Direction Risks

- 若消费者只信任 action.ownership，伪造计划会扩大覆盖权限。
- 若复制一套稍有差异的验证逻辑，未来还会产生消费者漂移。

## Over-design Risks

- 不重构整个 apply authority 模型，不新增第二套 ownership 状态。

## MVP Recommendation

把严格 bootstrap managed-ownership 复核下沉到现有 bootstrap transaction
共享模块，让 planner 和 request-bound consumer 调用同一函数，并补消费者回归。

## Non-goals

- 不执行 Pawcode apply。
- 不更改 receipt/schema/authority 状态或 15 分钟请求绑定规则。
- 不扩大允许路径、动作类型或外部效果边界。

## Domain Model Draft

- Existing `action.ownership` remains plan evidence only.
- Shared verifier returns the existing `VERIFIED_PRIOR_INTENTOS_MANAGED` shape.

## Permission / Security Risks

- Permission-like risk is internal write authority only; fail closed on every mismatch.
- No user/resource data or production authority is involved.

## First Vertical Slice

```text
Pawcode exact plan -> shared bootstrap ownership verifier -> request-bound graph -> zero authority errors
```

## Suggested Specs

- `specs/245-request-bound-bootstrap-ownership-consumer.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The change is bounded, reversible, source-only, and fully derivable from exact
local evidence. No business fact or real-world consent is missing.
