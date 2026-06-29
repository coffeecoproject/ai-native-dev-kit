# Workflow Guidance Card

## Human Decision Summary

Conclusion: I read this as an existing project with rules already present. Intent is ADD_PAYMENT_OR_VALUE_TRANSFER. Deep guide checked 5 read-only area(s). Current delivery state is READY_FOR_PLAN.

Recommended next step: 先确认这个目标的高风险边界和审查面，再生成最小可验证计划。

Can AI continue now: limited

What I need from you: 这个目标是否涉及真实用户、真实数据、线上环境或不可回滚风险？ / 是否允许我先生成计划，不直接改文件？ / 你希望先做到本地可跑、自己试用，还是上线前检查？

What happens if you do nothing: No files are changed. No CI, hook, document, task state, release, or production behavior is changed.

## Plain Summary

这次目标是：我要加支付预约。这个项目已经有一些规则和文档。现在最安全的是先确认支付、数据、权限和上线影响，再给出一份计划，不直接改文件。

## User Intent

| Field | Value |
|---|---|
| Provided intent | 我要加支付预约 |
| Intent classification | `ADD_PAYMENT_OR_VALUE_TRANSFER` |
| Intent risk level | high |
| Review focus | data, permission, security/privacy, release impact |

## Project Reading

| Field | Value |
|---|---|
| User mode | `plain` |
| Project state | `EXISTING_GOVERNED_PROJECT` |
| Existing users assumed | Unknown treated as Yes |
| Can write files now | No |
| Risk level | high |

## Delivery Path State

`READY_FOR_PLAN`

Next state: `READY_FOR_LOCAL_BUILD`

## Recommended Next Step

先确认这个目标的高风险边界和审查面，再生成最小可验证计划。

## Distance To Useful Use

| Check | Status | What is missing |
|---|---|---|
| Goal clarity | partly clear | 确认这次要服务谁、先做哪条核心路径 |
| Project can run locally | unknown | 需要实际运行或构建证据 |
| Core function complete | unknown | 需要任务计划和完成证据 |
| Tests or checks run | not run | 需要运行检查并记录结果 |
| High-risk scope clear | needs confirmation | 需要确认登录、支付、数据、发布或迁移风险 |
| Can someone else try it | not yet | 需要达到下一阶段并留下验证证据 |

## Questions For Human

1. 这个目标是否涉及真实用户、真实数据、线上环境或不可回滚风险？
2. 是否允许我先生成计划，不直接改文件？
3. 你希望先做到本地可跑、自己试用，还是上线前检查？

## Internal Routing

| Situation | Internal capability | User-facing meaning | Run now |
|---|---|---|---|
| Existing project | hidden in plain mode | Read existing rules before changing anything | Yes |
| Intent needs scoped review | hidden in plain mode | Check the right risk areas before execution | Yes |
| Automation or CI exists | hidden in plain mode | Review automatic trigger risk without installing anything | Yes |

## What I Checked

| Area | Status | Finding | Next action |
|---|---|---|---|
| 判断这次工作完成后要检查哪些方面 | PASS | 已选出 9 个需要复查的方面。 | 执行前确认审查面，执行后逐项关闭。 |
| 判断离可用还差多远 | PASS | 当前交付状态是 READY_FOR_PLAN，下一步目标是 READY_FOR_LOCAL_BUILD。 | 先补齐下一阶段所需证据。 |
| 先读清楚已有项目规则 | PASS | 已先读已有项目规则，避免直接覆盖现有治理。 | 先按已有规则做映射，再决定是否接入新流程。 |
| 判断自动触发和 CI 相关规则是否需要先定边界 | PASS | 已检查自动触发和 CI 相关规则，当前不能安装 hook 或改 CI。 | 如需新增自动化，先确认允许范围、审批人和回滚方式。 |
| 确认当前任务、暂停任务和待办 | PASS | 发现 1 个当前任务、0 个暂停任务、3 个待办。 | 先确认当前主线任务，再切换或推进。 |

## Boundaries

- This guidance writes target files: No
- This guidance modifies CI: No
- This guidance installs hooks: No
- This guidance deletes or archives documents: No
- This guidance changes task state: No
- This guidance approves implementation: No
- This guidance approves release or production: No
- This guidance approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`GUIDANCE_RECORDED`
