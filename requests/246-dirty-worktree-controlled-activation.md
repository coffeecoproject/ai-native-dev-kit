---
schema_version: 1.0
artifact_type: request
number: 246
slug: dirty-worktree-controlled-activation
title: "dirty worktree controlled activation"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 246-dirty-worktree-controlled-activation

## Raw Request

原始需求：

以 `codex/source-only-external-adoption-hardening` 为准修复 Pawcode 的
IntentOS 采用与激活问题，同时保留现有 dirty worktree，不改业务代码。

## User / Customer

Codex 代表零经验单人开发者在已有 dirty 项目中执行受控 IntentOS 更新。

## Problem

精确受控更新已证明与原 dirty 路径零重叠，但安装后 `workflow-next`
按设计返回 `REVIEW_DIRTY_WORKTREE`；激活门只接受 `READY_*`，导致事务
错误回滚并永远无法在安全 dirty 项目中达到 `VERIFIED_ACTIVE`。

## Current Workflow

Codex 生成精确计划、验证请求权威图和 dirty 重叠、执行受控更新；写入
完成后激活检查拒绝 `REVIEW_DIRTY_WORKTREE` 并回滚全部治理写入。

## Desired Outcome

仅当受控更新的原始 dirty 清单完整、计划写入与其零重叠且没有所有权冲突
时，把 `REVIEW_DIRTY_WORKTREE` 识别为有效安装状态；其他情况继续失败关闭。

## Constraints

- 只修改源仓激活状态判定和聚焦回归测试。
- 不弱化 ready 状态、项目入口信任、行为路由或收据校验。
- 不覆盖 Pawcode 原 dirty 文件，不新增依赖，不触及发布/生产。
- 失败必须事务回滚；同一验证失败两次停止。

## Priority

P1

## Suggested Task Level

L2

## Deadline

当前采用任务内立即修复。

## Notes

Pawcode v2 收据 `apply-receipts/2026-07-31t22-51-03-101z.md`
证明首次真实执行为 `APPLY_FAILED_ROLLED_BACK`，changed action count 为 0。
