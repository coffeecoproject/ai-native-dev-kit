---
schema_version: 1.0
artifact_type: request
number: 250
slug: current-project-identity-reconciliation
title: "current project identity reconciliation"
status: ready
created_at: 2026-08-02
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 250-current-project-identity-reconciliation

## Raw Request

原始需求：使用 Pawcode 只读验证 IntentOS；发现公开 `work` 入口把已完成接入并已有业务内容的 Pawcode 仍称为“新项目”后，开始治理 IntentOS 自身，不写入 Pawcode。

## User / Customer

通过源码仓库让 Codex 直接读取并使用 IntentOS 的外部项目用户。

## Problem

一次已发布源码的只读运行同时报告：

- `sourceProjectState: BOOTSTRAPPED_PROJECT`;
- `behavioralAdoptionState: VERIFIED_ACTIVE`;
- `worktreePosture: DIRTY`;
- `projectEntryOrigin: NEW_PROJECT`;
- `projectKind: NEW_PROJECT` and the human sentence “这是一个新项目”.

持久化接入来源被错误呈现为当前项目类型，即使当前项目已经有自己的产品源码和工作记录。

## Current Workflow

`work` 从 `projectEntryOrigin=NEW_PROJECT` 推导 `NEW_PROJECT_ENTRY`，身份投影再把它转为 `projectKind=NEW_PROJECT`；`start`、`next`、`doctor` 则按当前状态识别为已接入项目，形成冲突。

## Desired Outcome

- Keep `projectEntryOrigin` unchanged as provenance.
- Keep a scaffold-only initialized target on the new-project route.
- Classify a bootstrapped target with current project-owned content as an
  existing project.
- Preserve read-only behavior, dirty-worktree protection, operation routing,
  exit codes, and target-project contents.
- Keep project-information status on the project identity/queue-information
  route instead of starting current-task completion evidence processing.
- Use Pawcode only for a final zero-write validation.

## Constraints

- 不写 Pawcode 或其他目标项目。
- 不修改 init/apply/receipt/ownership、依赖、托管 CI、发布或生产路径。
- 新脚手架必须继续保持新项目语义。
- 不重构 User Delivery Console 或通用子进程执行器；只修正已经存在的
  project-information/current-task 状态边界。
- 发现新的无关问题即停止，不扩大修复范围。

## Priority

P1

## Suggested Task Level

L2

## Deadline

在本次 IntentOS 可用性模拟收口前完成。

## Notes

不授权生产、发布、部署、账号或任何外部操作。Pawcode 仅作为带前后不可变快照的只读样本。
