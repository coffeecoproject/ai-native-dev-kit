---
schema_version: 1.0
artifact_type: preflight
number: 251
slug: verification-runtime-interruption-test-readiness
title: "verification runtime interruption test readiness"
status: ready
created_at: 2026-08-02
intentos_version: 1.113.0
request: requests/251-verification-runtime-interruption-test-readiness.md
task_level: L1
---
# Preflight: 251-verification-runtime-interruption-test-readiness

## Source Request

`requests/251-verification-runtime-interruption-test-readiness.md`

## Clarity

READY

## Problem Summary

测试把“经过 700ms”错误地当成“后代进程已经启动”。这两个事实在高负载下不等价，造成测试时序竞态，而不是运行时清理失败。

## Missing Information

- None. 失败测试、生命周期 journal、输出日志和无残留进程检查足以确定边界。

## Assumptions

- `descendant.pid` 由测试夹具在 `spawn()` 返回后同步写入，可作为该场景明确的就绪信号。
- 由 `mkdtempSync` 创建并登记的路径只包含本测试套件生成的临时资产。

## Direction Risks

- 单纯提高 700ms 会继续依赖机器速度。
- 删除 PID 断言会弱化后代进程清理证明。
- 修改生产运行时会把测试竞态扩大成行为变更。

## Over-design Risks

- 不新增通用进程协调协议或生产事件接口。
- 不重构 Verification Runtime Lifecycle 执行器。

## MVP Recommendation

由测试启动生命周期 Promise，轮询等待 `descendant.pid` 出现并设置有界超时；就绪后立即 abort，再验证既有清理结果。统一登记该测试文件创建的临时根目录，并在套件结束时回收。

## Non-goals

- 不改变生产信号、grace period、process-group 或资源清理逻辑。
- 不处理其他测试文件或全量自检性能。
- 不修改 Task 250 身份实现。

## Domain Model Draft

- Fixture readiness: explicit file handshake.
- Fixture ownership: exact `mkdtempSync` roots created by this test module.

## Permission / Security Risks

- 无新增权限或外部数据访问。
- 清理仅作用于测试模块自己创建并登记的精确临时根目录。

## First Vertical Slice

```text
start lifecycle -> wait for descendant.pid -> abort -> verify process/resource cleanup -> remove owned fixture roots
```

## Suggested Specs

- `specs/251-verification-runtime-interruption-test-readiness.md`

## Suggested Task Level

L1

## Decision

READY_FOR_SPEC

## Rationale

根因、就绪信号、清理所有权和禁止进入的生产边界都已从当前代码与失败 journal 中确定。
