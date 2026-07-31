---
schema_version: 1.0
artifact_type: request
number: 245
slug: request-bound-bootstrap-ownership-consumer
title: "request bound bootstrap ownership consumer"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 245-request-bound-bootstrap-ownership-consumer

## Raw Request

原始需求：

在 Pawcode 中采用并激活 `codex/source-only-external-adoption-hardening`
分支的 IntentOS 工作流资产，保留现有 dirty worktree，不改业务代码。

## User / Customer

Pawcode 的零经验独立开发者，以及负责安全执行该采用流程的 Codex。

## Problem

Task 244 让 planner 能从严格 bootstrap plan/receipt 证据恢复旧版遗漏的
managed ownership，但 request-bound apply authority 仍只消费
`.intentos/version.json`，导致同一精确计划在执行前被再次误判为未受管。

## Current Workflow

只读 dry-run 已得到 0 ownership conflict 和 0 dirty-write overlap；写出的
精确计划在 request-bound authority graph 复核时被 A-754 假阻断，尚未执行。

## Desired Outcome

让 request-bound authority 复用并重新验证同一严格 bootstrap ownership
事实，使安全计划可执行，同时继续拒绝伪造证据、本地编辑、重复动作和计划漂移。

## Constraints

- 只改 IntentOS source 分支，不改 Pawcode 业务代码。
- 不降低现有 version-digest 主证据优先级。
- 不直接信任 plan 内自报的 ownership；消费者必须重新验证 plan/receipt。
- 不新增依赖、权限、CI/hooks、发布或外部效果。
- 保留 Pawcode dirty worktree；执行前仍须证明 0 写重叠。

## Priority

P0

## Suggested Task Level

L2

## Deadline

当前 Pawcode UI 工作开始前完成。

## Notes

失败发生在执行前，Pawcode 目前只新增了一份不可执行的精确计划证据。
