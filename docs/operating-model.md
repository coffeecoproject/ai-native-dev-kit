# Using The IntentOS Operating Model

Tell Codex what you want in ordinary language. Codex uses the Operating Model
to choose the internal project-entry and task-lifecycle route.

```bash
node scripts/cli.mjs work . "继续完成预约时间规则"
node scripts/cli.mjs work . "检查这个任务做到哪里了"
node scripts/cli.mjs work . "这个任务做完了吗"
node scripts/cli.mjs work . "准备发布内部测试版本"
node scripts/cli.mjs work ../old-project "把这个项目接入 IntentOS"
```

The result contains one current state, one next safe action, and at most one
material user decision. Technical routing, evidence relationships, and owner
recommendations remain available to Codex in JSON:

```bash
node scripts/cli.mjs work . "检查当前状态" --json
```

The JSON response includes one `operatingDecision` with a stable action code,
reason, source inputs, blockers, human-decision state, digest, and invalidation
conditions. Codex uses that decision internally; ordinary users do not choose
the action code or lower-level command.

The decision is derived and read-only. An action such as
`PREPARE_BUSINESS_RULE_CLOSURE` means that business-rule clarification is the
next safe route. It does not mean the clarification exists or implementation
is approved.

The output is read-only. It does not approve implementation, apply, commit,
push, release, production, migration, secrets, permissions, payment, data, CI,
hooks, or external provider actions.

Existing lower-level commands remain available through:

```bash
node scripts/cli.mjs --help-advanced
```
