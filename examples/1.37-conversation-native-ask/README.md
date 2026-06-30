# 1.37 Conversation-Native Ask Example

This example shows the desired default experience:

```text
User: 我想做一个预约 App，你帮我开始。
Codex: I understand the goal and can first produce a safe entry card. I cannot change files yet.
```

The user does not need to know the `ask`, `guide`, `baseline-decision`, `apply-plan`, or `closure` command names before Codex can route the work.

The recorded card remains routing evidence only. It does not approve writes, apply, implementation, release, production, CI, hooks, document cleanup, task-state changes, baseline activation, or high-risk decisions.
