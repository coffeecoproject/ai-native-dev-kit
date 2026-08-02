---
schema_version: 1.0
artifact_type: request
number: 251
slug: verification-runtime-interruption-test-readiness
title: "verification runtime interruption test readiness"
status: ready
created_at: 2026-08-02
intentos_version: 1.113.0
priority: P1
task_level: L1
---
# Request: 251-verification-runtime-interruption-test-readiness

## Raw Request

原始需求：在最终全量自检发现 Verification Runtime Lifecycle 中断测试偶发读取不到 `descendant.pid` 后，用户确认开始处理；处理应保持独立边界，避免继续叠加生产补丁。

## User / Customer

维护 IntentOS 源码并依赖完整自检判断候选是否可用的维护者。

## Problem

中断清理测试固定在启动 700ms 后发送 abort，却没有先确认被测命令已经创建其后代进程和就绪文件。系统负载较高时，服务预备阶段占用大部分窗口，被测命令尚未写出 `descendant.pid` 就收到中断。运行时完成了清理，但测试随后无条件读取不存在的文件并报 `ENOENT`。

同一测试文件创建的临时项目目录也没有套件级回收，因此失败现场会留在系统临时目录。

## Current Workflow

测试使用固定时间猜测子进程已经启动，然后从 `descendant.pid` 读取 PID 来验证进程组清理。测试完成后不统一回收 `project()` 和预执行 PATH 夹具生成的临时目录。

## Desired Outcome

- 在确认后代进程就绪后再触发中断，不依赖机器速度。
- 就绪等待必须有明确、较短的上限，失败时给出可诊断错误。
- 无论测试成功或失败，套件都回收自己创建的临时目录。
- 保留原有进程组清理、资源所有权、日志脱敏和中断时延断言。

## Constraints

- 只改测试同步与测试夹具生命周期。
- 不改 Verification Runtime 生产执行器、超时、信号或清理语义。
- 不降低或删除任何中断清理断言。
- 不新增依赖，不写 Pawcode，不执行发布、生产或外部操作。

## Priority

P1

## Suggested Task Level

L1

## Deadline

在恢复 Task 250 最终全量自检前完成。

## Notes

失败日志已证明服务在约 536ms 后就绪、verify 在约 556ms 后启动，而 abort 在约 700ms 发生；被测脚本仅获得约 144ms，未写出就绪文件。运行日志同时包含 `PROCESS_CLEANED`、`RESOURCE_CLEANED` 和 `INTERRUPTED_CLEANED`。
