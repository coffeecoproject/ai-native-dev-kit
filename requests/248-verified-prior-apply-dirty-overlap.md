---
schema_version: 1.0
artifact_type: request
number: 248
slug: verified-prior-apply-dirty-overlap
title: "verified prior apply dirty overlap"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 248-verified-prior-apply-dirty-overlap

## Raw Request

原始需求：

以 `codex/source-only-external-adoption-hardening` 分支为准，修复 Pawcode 在连续受控工作流更新中因上一份已验证事务写入 `.intentos/version.json` 而被 dirty-overlap 门禁再次阻断的问题；保留现有 dirty worktree，不改业务代码。

## User / Customer

使用 IntentOS 对已有 dirty 项目执行连续、受控工作流资产更新的维护者。

## Problem

第一份受控更新已由当前有效 Apply Receipt 精确证明，但第二份计划仍把该事务写入路径视为普通项目改动。零重叠激活门禁因此拒绝安全的连续更新，尽管唯一重叠路径的当前 hash 正是上一事务的 `hash_after`。

## Current Workflow

当前只能停在第二份只读计划，或冒险放宽整个 dirty-worktree 门禁；后者不可接受。

## Desired Outcome

计划 fingerprint 只记录“当前 dirty 路径 ∩ 当前计划写路径”中可由上一份当前有效 receipt 精确证明的事务写入，并同时绑定 receipt、原执行计划、动作 ID 与前后 hash。dirty 激活仅允许该结构化证明中的精确文件级重叠；无证明、hash 漂移、目录级或业务文件重叠继续失败关闭。

## Constraints

- 仅修改 IntentOS 源码、测试与 Task 248 证据。
- Pawcode v4 是按旧 canonical fingerprint 生成的诊断计划，永久保持不执行；源码验证通过后也必须重新生成新计划，不能复用 v4。
- 不改 Pawcode 业务代码，不整理现有 dirty worktree，不新增依赖、CI、hook、发布或外部效果。
- 只信任通过当前严格 validator 的上一份 Apply Receipt，且路径当前 hash 必须仍与 receipt 一致。

## Priority

P1

## Suggested Task Level

L2

## Deadline

当前采用修复链内立即完成，无外部截止时间。

## Notes

Pawcode v4 计划共有 1031 个动作，仅 2 个托管更新和 1 个 receipt 写入；唯一 dirty/write 重叠为 `.intentos/version.json`。v3 receipt `apply-receipts/2026-08-01t00-38-32-212z.md` 通过当前严格校验，并记录该文件 `hash_after` 等于 v4 `hashBefore`。这些事实只用于确认根因；v4 缺少新的结构化证明，必须继续失败关闭。
