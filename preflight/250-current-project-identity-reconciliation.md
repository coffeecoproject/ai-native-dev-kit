---
schema_version: 1.0
artifact_type: preflight
number: 250
slug: current-project-identity-reconciliation
title: "current project identity reconciliation"
status: ready
created_at: 2026-08-02
intentos_version: 1.113.0
request: requests/250-current-project-identity-reconciliation.md
task_level: L2
---
# Preflight: 250-current-project-identity-reconciliation

## Source Request

`requests/250-current-project-identity-reconciliation.md`

## Clarity

READY

## Problem Summary

历史接入来源与当前项目身份没有分工，导致已接入且已有产品内容的项目继续被公开入口称为新项目。最终验证还暴露出同一身份视图边界中的路由耦合：明确属于 `PROJECT_INFORMATION` 的请求仍启动当前任务的 User Delivery Console。

## Missing Information

- None. 新脚手架与 Pawcode 的当前结构化结果、项目内容边界和零写入快照都可在本地验证。

## Assumptions

- `.intentos/version.json#projectEntryOrigin` 是不可改写的历史来源。
- IntentOS 托管资产和工作流记录本身不等于项目自有产品内容。

## Direction Risks

- 把全部 `BOOTSTRAPPED_PROJECT` 直接改成已有项目会误伤刚初始化的脚手架。
- 只改中文文案会保留 JSON 身份冲突。
- 新增持久化成熟度状态会扩大到迁移和写入治理。

## Over-design Risks

- 不新增项目成熟度数据库、状态机或写入事务。
- 不重构 Project Entry、apply 或外部采用主流程。

## MVP Recommendation

在现有 Project Fact Projection 中增加只公开计数和摘要的当前项目内容事实，排除托管资产与工作流记录；Project Entry 使用这一事实协调当前身份，同时保留历史来源。同时让已经存在的状态范围分类真正控制来源编排：项目信息不读取任务完成链，只有存在唯一当前任务的任务状态才读取 User Delivery Console。

## Non-goals

- 不写目标项目。
- 不改变 apply、receipt、ownership、release 或 production 行为。
- 不根据自然语言任务内容判断项目身份。

## Domain Model Draft

- Entry origin: historical provenance.
- Project content state: current bounded observation.
- Project kind: current reconciled public identity.

## Permission / Security Risks

- 不新增权限或数据读取范围；公开身份不暴露项目路径，只暴露状态、计数和摘要。
- Pawcode 验证必须使用 `GIT_OPTIONAL_LOCKS=0` 并比较前后不可变快照。

## First Vertical Slice

```text
bounded project inventory -> managed/workflow exclusion -> current content state -> Project Entry -> public identity -> zero-write validation
```

## Suggested Specs

- `specs/250-current-project-identity-reconciliation.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

根因、当前权威来源、兼容边界、回归样本和回滚方式均已明确，不需要业务事实或外部授权。

## Root Cause

`projectEntryFor()` gives durable `projectEntryOrigin=NEW_PROJECT` priority over
current bootstrapped facts. `buildProjectIdentityProjection()` then derives
`projectKind` from that entry result. The public presentation faithfully renders
the resulting wrong current identity.

The final source check exposed a second direct cause inside the same public
identity view. `statusRequestRequiresCurrentTask()` already distinguishes
`PROJECT_INFORMATION` from `CURRENT_TASK`, but `addOperationSources()` ignored
that scope when selecting `USER_DELIVERY_CONSOLE`. On the IntentOS source
checkout this made a project-information request traverse historical task
completion checks until the 180-second test timeout. The timeout killed the
direct resolver before one descendant finished, which explains the temporary
orphan observed during diagnosis.

## Design Direction

Use the existing current-run Project Fact Projection as the sole place that
distinguishes IntentOS-managed scaffolding and workflow records from current
project-owned content. Project Entry consumes that bounded fact while retaining
the immutable origin as provenance.

## Invariants

1. `projectEntryOrigin` records how IntentOS first entered the project; it is
   not current project maturity.
2. A new, scaffold-only initialized target remains `NEW_PROJECT_ENTRY`.
3. A bootstrapped target with non-managed project content becomes an existing
   entry even when its origin is `NEW_PROJECT`.
4. Workflow evidence directories alone do not establish product content or
   invalidate the current Project Fact digest; source-only operation resolves
   those directories from the authoritative source Manifest.
5. `PROJECT_INFORMATION` status does not start current-task completion
   processing; `CURRENT_TASK` status starts it only when one current Work Queue
   item exists.
6. Source failure or conflicting trust still fails closed.
7. `work` remains read-only and never changes the target.

## Risk Review

This changes public identity semantics and therefore requires focused generated
project, established project, dirty worktree, source checkout, and failure-path
regression coverage. Status-scope routing also needs a focused timing and
source-trace regression because the prior project-information path exceeded
the test timeout. It does not change apply authority, receipts, ownership,
release, or production behavior.

## Stop Conditions

- a required fix enters apply or transaction code;
- a fresh scaffold can no longer use the new-project route;
- Pawcode changes during validation;
- a new unrelated failure appears during verification.
