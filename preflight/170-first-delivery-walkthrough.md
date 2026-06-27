# Preflight: 170-first-delivery-walkthrough

## Source Request

`requests/170-first-delivery-walkthrough.md`

## Clarity

READY

## Problem Summary

AI Native Dev Kit 已经具备多层治理能力，但缺少一条完整、低风险、可审查的“第一版交付彩排”。这条彩排要让基础用户看到 Codex 如何从一句产品想法开始推进，而不是要求用户先理解全部流程文件。

## Missing Information

- 没有真实目标项目。
- 没有真实用户数据、生产环境或上线结果。
- 没有外部 GPT/API 参与。

## Assumptions

- “预约 App / 小程序”适合作为低风险模拟题材。
- 本轮只验证 workflow 行为，不交付真实业务代码。
- payment、生产发布、真实隐私合规属于漂移或后续决策，不进入当前第一版。
- subagent 只读拆解和复审即可，不需要多写者并行改文件。

## Direction Risks

- 把模拟结果写成真实生产验证。
- 把用户的自然语言愿望扩大成完整平台建设。
- subagent 编排变成形式化文档，而没有关闭和复审证据。
- 下一步建议越界，变成默认继续执行。

## Over-design Risks

- 为一个演示场景默认启用工业包或 BL2。
- 为每个项目强制生成 adoption trial report。
- 把 First Delivery Walkthrough 做成新的审批层。
- 把模拟项目当成正式项目管理模板。

## MVP Recommendation

先补 1.7 First Delivery Walkthrough：核心说明、使用文档、模板、检查器、坏例子、CLI/CI/manifest 接入，以及一个完整的预约场景模拟。范围停在“可审查的交付彩排”，不进入真实项目试跑。

## Non-goals

- 不修改真实项目代码。
- 不创建自动 GPT review hook。
- 不提升为生产发布门禁。
- 不替代工程基线、平台基线或工业包。

## Domain Model Draft

- `First Delivery Walkthrough`: 从想法到第一版建议的完整彩排。
- `Adoption Trial Report`: 一次试跑的证据汇总。
- `Walkthrough Scenario`: 模拟或真实试跑场景。
- `Subagent Run Plan`: helper agents 的角色、状态和关闭证据。
- `Review Loop Report`: 复审、自动修复和剩余问题记录。
- `Launch Readiness`: Demo / Pilot / Production 的边界判断。

## Permission / Security Risks

- 不能读取或记录真实敏感业务数据。
- 不能把真实上线、支付、隐私合规默认为已批准。
- 不能让 helper agent 在主线程交付后保持 `RUNNING`。
- 不能把后续建议当成当前任务授权。

## First Vertical Slice

```text
plain user idea -> request card -> preflight -> spec -> eval -> task -> goal card -> subagent run plan -> drift example -> review loop -> launch readiness -> final report -> adoption trial report
```

## Suggested Specs

- `specs/170-first-delivery-walkthrough.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

需求清晰、范围可控、风险主要来自过度承诺和边界漂移。通过模拟而不接入真实项目，可以先验证流程完整性，再把真实项目试跑留给后续明确授权。
