# Guided Closure Experience

Guided Closure Experience is the simple close-out entry for IntentOS.

Use it when the user asks:

```text
这个任务做完了吗？
帮我收口这个任务。
这个需求是不是前后端都处理完整了？
```

## What It Does

Codex reads the project and the task intent, then returns one Guided Closure Card.

The card explains:

- whether the task can be treated as done;
- what was checked;
- what is still missing;
- what Codex can safely do next;
- what needs a human decision;
- where technical evidence lives.

## Why It Exists

IntentOS has strict internal evidence tools:

- impact coverage
- execution closure
- structured evidence
- evidence reference resolution
- precise evidence matching

Those tools are useful, but users should not need to choose them manually.

Guided Closure keeps the strict checks inside the system and shows one plain result outside.

## Command

Normal conversation is preferred:

```text
帮我看下这个任务能不能收口。
```

For durable command-line evidence:

```bash
node scripts/cli.mjs finish ../my-project --intent "新增合同录入限制" --verification "npm run verify passed"
```

## Output States

| State | Meaning |
|---|---|
| `NO_TASK_TO_CLOSE` | No clear task or execution evidence was found |
| `NEEDS_VERIFICATION` | Work may exist, but verification is missing |
| `NEEDS_IMPACT_COVERAGE` | Related surfaces may be incomplete |
| `NEEDS_HUMAN_DECISION` | A risk, limitation, or acceptance decision is needed |
| `READY_FOR_REVIEW` | Evidence is enough to prepare a review summary, not to auto-commit |
| `CLOSE_WITH_LIMITATIONS` | Closure can be recorded with explicit gaps |
| `BLOCKED` | Closure should stop until a problem is resolved |

## Boundaries

Guided Closure is read-only.

It does not:

- write files;
- approve implementation;
- approve commit or push;
- approve release or production;
- modify CI or hooks;
- change task state;
- forgive debt;
- replace Review Loop or Safe Launch.

## Maintainer Notes

Strict low-level commands remain available for CI and audits.

The user-facing `finish` entry should hide the command burden. Technical details may mention which internal checks were selected, but the main user-facing sections should stay readable without workflow knowledge.
