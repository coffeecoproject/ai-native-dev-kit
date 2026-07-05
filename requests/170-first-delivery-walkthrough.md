# Request: 170-first-delivery-walkthrough

## Raw Request

原始需求：完整模拟一个基础用户从“想做预约 App”开始，如何被 IntentOS 引导到可交付的第一版；过程中使用 subagent 编排，并避免主线漂移。

## User / Customer

IntentOS 的使用者，尤其是技术基础较弱、希望用自然语言让 Codex 协助开发项目的人。

## Problem

当前工具包已经有引导接入、目标模式、subagent 编排、安全交付、上下文治理和漂移控制，但缺少一条完整的“从一句想法到第一版交付建议”的示范路径。没有这条路径时，用户仍然需要理解很多文件和术语，难以判断真实使用时 Codex 会怎样推进。

## Current Workflow

用户需要先理解工作流文件，再手动判断该走哪个入口、是否需要基线、是否需要复审、什么时候停止。这对基础用户仍然偏重。

## Desired Outcome

补齐一套 First Delivery Walkthrough，让 Codex 可以用一个低风险模拟项目展示完整路径：识别意图、补请求卡、做预检、生成规格、拆任务、编排 subagent、处理漂移、做复审、形成交付建议，并明确这只是模拟证据，不是生产验证。

## Constraints

时间、技术、成本、权限、数据、合规限制：

- 不接入真实项目。
- 不调用外部 GPT/API。
- 不声称生产验证或真实上线能力已经被证明。
- 不把 1.7 做成新的重治理层。
- 不默认启用 BL2、工业包或发布审批。
- subagent 使用后必须关闭，不能留下占位。

## Priority

P1

## Suggested Task Level

L2

## Deadline

无明确外部截止时间；本轮以完成可审查模拟和治理自检为准。

## Notes

这次模拟用于验证 1.6 之后的 Guided Delivery 闭环是否可被普通用户理解，并为后续真实项目试跑提供低风险样板。
