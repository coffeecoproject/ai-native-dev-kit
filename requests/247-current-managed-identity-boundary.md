---
schema_version: 1.0
artifact_type: request
number: 247
slug: current-managed-identity-boundary
title: "current managed identity boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 247-current-managed-identity-boundary

## Raw Request

原始需求：

修复受控更新后 Project Entry 对已退役 IntentOS 资产的历史哈希误判，保持 Pawcode 既有 dirty worktree 与业务代码不变。

## User / Customer

使用 source-only IntentOS 更新既有 dirty 项目的 Codex 工作流。

## Problem

当前身份校验把历史 bootstrap 回执中的整个 `scripts/` 目录永久纳入当前 managed identity；已不在当前 `workflowAssets` 的 `scripts/verify.sh` 被用户修改后，会使已验证更新在 cold start 中误报身份冲突。

## Current Workflow

精确受控更新成功并生成 `APPLY_VERIFIED` 回执，但结构化回执重检和 cold start 停在 `REPAIR_PROJECT_ENTRY_TRUST`。

## Desired Outcome

当前身份只要求当前 manifest 声明的身份资产与必要身份文件保持精确证据；已退役资产不再影响当前身份，当前资产篡改仍失败关闭。

## Constraints

- 仅修改源分支的 Project Entry 身份校验与现有集成测试。
- 不改 Pawcode 业务代码，不覆盖 `scripts/verify.sh`，不放宽当前资产的哈希验证。
- 不新增状态、schema、依赖、CI/hook、发布或外部效果。

## Priority

P1

## Suggested Task Level

L2

## Deadline

当前 Pawcode IntentOS 激活闭环前完成。

## Notes

Pawcode v3 回执的动作图、目标哈希和行为激活已通过；唯一身份不匹配是已退役 `scripts/verify.sh` 的历史 bootstrap 哈希。
