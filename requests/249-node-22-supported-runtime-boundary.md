---
schema_version: 1.0
artifact_type: request
number: 249
slug: node-22-supported-runtime-boundary
title: "node 22 supported runtime boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 249-node-22-supported-runtime-boundary

## Raw Request

原始需求：

用户确认先完成两件事：把 IntentOS 的正式验收运行时明确为 Node 22，并将已经通过外部项目模拟的 source-only adoption 修复分支合并进默认分支。

## User / Customer

从源码仓库运行或维护 IntentOS 的普通用户和维护者。

## Problem

CI 已经固定使用 Node 22，Task 248 的完整源码自检也只在 Node 22.22.3 下闭环，但公开文档和 `package.json` 仍声明 Node `>=22`。这个声明会把 Node 23 错误地包含在正式支持范围内，而 Node 23.11.0 已在超大型完整检查退出阶段出现 V8 worker shutdown deadlock。

## Current Workflow

用户可在任意 Node 22 以上版本直接运行源码；npm 也不会提示 Node 23 超出支持边界。普通外部项目入口在 Node 23 下已验证可用，但完整维护者验收的退出行为尚未得到支持证明。

## Desired Outcome

正式支持和验收边界明确为 Node 22.x。CI、`package.json`、中英文入口文档、source-only 文档、维护者说明和自检使用同一口径；Node 23 明确留作独立兼容性治理，不再被当前版本默认为已支持。

## Constraints

- 只收紧运行时支持声明和自检，不修改 Node 23、checker DAG 或业务逻辑。
- 不新增依赖、不修改 CI workflow、不执行 hosted release 或生产操作。
- 后续默认分支合并只在本任务通过 Node 22 验证后执行。
- 保留 Task 248 已验证的外部接入与连续更新行为。

## Priority

P1

## Suggested Task Level

L2

## Deadline

在本次默认分支收口前完成。

## Notes

GitHub PR 与 release workflows 已使用 `node-version: 22`。本任务只修正公开契约与自检之间的漂移。
