# Gates

## Scope Gate

没有明确 scope，不准执行。

必须确认：

- 这个任务只做一个目标。
- 允许修改的文件或目录已列出。
- 禁止修改的模块已列出。
- 不允许顺手重构。
- 不允许新增未批准依赖。
- 不允许扩大需求。

## Cost Gate

没有预算，不准无限跑。

建议字段：

```text
Max agent runs:
Max repair runs:
Max tool calls:
Use high reasoning model:
Stop if:
```

默认规则：

- 同一个测试失败两次，停止并报告。
- 缺少关键上下文，停止并请求补充。
- 需要高风险决策，停止并请求人工确认。

## Risk Gate

触碰以下任一项，必须升级：

- auth
- permission
- regulated or irreversible operation
- value transfer
- safety-critical behavior
- migration
- data deletion
- production config
- external API with side effects
- secrets
- personal data
- regulated data

高风险任务默认需要人工批准、review gate 和 release gate。

## Verification Gate

没有验证证据，不准合并。

最低证据：

- lint
- typecheck
- relevant tests
- build if applicable
- spec alignment review
- scope review

UI / interface 任务还需要：

- desktop behavior check
- mobile behavior check
- loading / empty / error states
- no visible overlap or layout break

## Review Gate

Reviewer 必须优先看：

- 是否满足 spec
- 是否违反 non-goals
- 是否越过 task scope
- 是否缺测试
- 是否存在权限绕过
- 是否存在数据泄漏
- 是否引入不必要依赖
- 是否影响 rollback

## Release Gate

发布前必须确认：

- 是否需要 feature flag
- rollback plan
- migration plan
- monitoring / logs
- known issues
- owner
- post-release check

L3 任务没有 release gate 不允许进入生产。
