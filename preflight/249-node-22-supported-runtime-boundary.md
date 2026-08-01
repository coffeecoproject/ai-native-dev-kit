---
schema_version: 1.0
artifact_type: preflight
number: 249
slug: node-22-supported-runtime-boundary
title: "node 22 supported runtime boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/249-node-22-supported-runtime-boundary.md
task_level: L2
---
# Preflight: 249-node-22-supported-runtime-boundary

## Source Request

`requests/249-node-22-supported-runtime-boundary.md`

## Clarity

READY

## Problem Summary

仓库的实际正式验收运行时是 Node 22，但公开支持声明写成 `>=22`，错误包含了尚未完成完整验收的 Node 23。

## Missing Information

- None. CI 配置、Task 248 运行证据、当前 package engine 与公开文档均可本地核对。

## Assumptions

- Node 22.x 是当前支持边界；具体补丁版本由 Node 22 LTS 线和 CI 解析决定。
- Node 23 普通入口可工作不等于完整维护者验收已受支持。

## Direction Risks

- 只改文档而不改 package engine 和自检，会继续向工具链发送错误兼容信号。
- 把 Node 23 的 shutdown deadlock 当成本任务修复会重新扩大范围。

## Over-design Risks

- 不增加运行时包装器、版本管理器文件或 checker DAG 重构。

## MVP Recommendation

将 `package.json` engine 收紧为 `>=22 <23`，同步三处用户/采用入口与维护者/贡献说明，并让源码自检严格核对该范围。现有 CI 的 `node-version: 22` 保持不变。

## Non-goals

- 不修复或宣称支持 Node 23。
- 不改变 source-only adoption、apply、receipt 或外部项目业务行为。
- 不发布 tag、release 或 hosted workflow。

## Domain Model Draft

- Supported verification runtime: Node 22.x.
- Unsupported/unverified maintainer runtime: Node 23.x and later until separate evidence closes it.

## Permission / Security Risks

- 无权限、数据或外部系统风险；主要风险是支持声明与实际验收环境再次漂移。

## First Vertical Slice

```text
public runtime contract -> package engine -> maintainer guidance -> self-check -> Node 22 verification
```

## Suggested Specs

- `specs/249-node-22-supported-runtime-boundary.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

范围、证据、回滚方式和验证命令明确；不需要额外业务事实或现实世界授权。
