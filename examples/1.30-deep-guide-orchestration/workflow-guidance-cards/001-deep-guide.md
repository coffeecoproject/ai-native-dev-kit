# Workflow Guidance Card

## Human Decision Summary

Conclusion: I read this as an existing project with rules already present. Deep guide checked 5 read-only area(s). Current delivery state is READY_FOR_PLAN.

Recommended next step: 先按这张卡确认目标、风险和审查面，再进入最小可验证的一步。

Can AI continue now: limited

What I need from you: 这个项目现在是否已经有人在用？ / 是否允许我先生成计划，不直接改文件？ / 你希望先做到本地可跑、自己试用，还是上线前检查？

What happens if you do nothing: No files are changed. No CI, hook, document, task state, release, or production behavior is changed.

## Plain Summary

这个项目已经有一些规则和文档。现在最安全的是先读清楚现有做法，再给出一份计划，不直接改文件。

## Project Reading

| Field | Value |
|---|---|
| User mode | `plain` |
| Project state | `EXISTING_GOVERNED_PROJECT` |
| Existing users assumed | Unknown treated as Yes |
| Can write files now | No |
| Risk level | medium |

## Delivery Path State

`READY_FOR_PLAN`

Next state: `READY_FOR_LOCAL_BUILD`

## Recommended Next Step

先按这张卡确认目标、风险和审查面，再进入最小可验证的一步。

## Distance To Useful Use

| Check | Status | What is missing |
|---|---|---|
| Goal clarity | partly clear | 确认这次要服务谁、先做哪条核心路径 |
| Project can run locally | unknown | 需要实际运行或构建证据 |
| Core function complete | unknown | 需要任务计划和完成证据 |
| Tests or checks run | not run | 需要运行检查并记录结果 |
| High-risk scope clear | unknown | 需要确认登录、支付、数据、发布或迁移风险 |
| Can someone else try it | not yet | 需要达到下一阶段并留下验证证据 |

## Questions For Human

1. 这个项目现在是否已经有人在用？
2. 是否允许我先生成计划，不直接改文件？
3. 你希望先做到本地可跑、自己试用，还是上线前检查？

## Internal Routing

| Situation | Internal capability | User-facing meaning | Run now |
|---|---|---|---|
| Existing project | hidden in plain mode | Read existing rules before changing anything | Yes |
| Documents may need review | hidden in plain mode | Mark stale or duplicate docs without deleting them | Yes |
| Automation or CI exists | hidden in plain mode | Review automatic trigger risk without installing anything | Yes |

## What I Checked

| Area | Status | Finding | Next action |
|---|---|---|---|
| 判断这次工作完成后要检查哪些方面 | PASS | 已选出 8 个需要复查的方面。 | 执行前确认审查面，执行后逐项关闭。 |
| 判断离可用还差多远 | PASS | 当前交付状态是 READY_FOR_PLAN，下一步目标是 READY_FOR_LOCAL_BUILD。 | 先补齐下一阶段所需证据。 |
| 确认当前任务、暂停任务和待办 | PASS | 发现 1 个当前任务、0 个暂停任务、3 个待办。 | 先确认当前主线任务，再切换或推进。 |
| 判断文档是否可能过期、重复或需要归档建议 | PASS | 扫描到 28 份文档，可能有过期、重复或归档候选。 | 只提出归档建议，不删除、不移动文档。 |
| 判断自动触发和 CI 相关规则是否需要先定边界 | PASS | 已检查自动触发和 CI 相关规则，当前不能安装 hook 或改 CI。 | 如需新增自动化，先确认允许范围、审批人和回滚方式。 |

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
