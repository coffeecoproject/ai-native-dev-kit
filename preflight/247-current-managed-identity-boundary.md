---
schema_version: 1.0
artifact_type: preflight
number: 247
slug: current-managed-identity-boundary
title: "current managed identity boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/247-current-managed-identity-boundary.md
task_level: L2
---
# Preflight: 247-current-managed-identity-boundary

## Source Request

`requests/247-current-managed-identity-boundary.md`

## Clarity

READY

## Problem Summary

Project Entry 用硬编码 `.intentos` 与 `scripts` 根目录压缩当前资产集合，导致历史回执中的退役文件也必须永久匹配。Pawcode 当前 `workflowAssets` 不含 `scripts/verify.sh`，但该文件的用户改动仍使 cold start 失败。

## Missing Information

- None; v3 plan、bootstrap receipt、apply receipt、current version 和 cold-start 输出均可复现。

## Assumptions

- `workflowAssets` 是当前 managed identity 的权威资产集合。
- `AGENTS.md` 与 `.intentos/version.json` 仍是必要身份文件。

## Direction Risks

- 若过滤过宽，当前受管资产篡改可能漏检。
- 若继续按历史目录校验，退役资产会永久阻塞安全更新。

## Over-design Risks

- 不重构 Project Entry；只收窄身份资产根集合并增加回归。

## MVP Recommendation

移除硬编码的整个 `.intentos`/`scripts` 历史目录根，仅从当前 `workflowAssets` 加必要身份文件派生验证根；用受控更新集成测试证明退役 `scripts/verify.sh` 可保留、当前 `.intentos` 资产篡改仍失败。

## Non-goals

- 不修改 Pawcode。
- 不接受缺失、无证据或哈希漂移的当前身份资产。
- 不改变 workflow-next 状态、回执 schema、动作图或 apply 权威。

## Domain Model Draft

- Current identity asset set: `workflowAssets` plus `AGENTS.md` and `.intentos/version.json`.
- Historical receipt evidence remains usable only for assets still in that current set.

## Permission / Security Risks

- 纯项目本地身份信任；无用户、权限、数据或生产风险。

## First Vertical Slice

```text
current workflowAssets -> bootstrap/update evidence merge -> exact current hashes -> Project Entry trust
```

## Suggested Specs

- `specs/247-current-managed-identity-boundary.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

根因、边界、最小修复、失败关闭要求和真实复现均已确定，无需用户技术选择。
