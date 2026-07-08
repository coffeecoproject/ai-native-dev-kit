# User Delivery Console

User Delivery Console is the ordinary-user status card for IntentOS.

Use it when the user asks:

- "现在做到哪了？"
- "这个任务完成了吗？"
- "还差什么？"
- "能上线了吗？"
- "下一步你能做什么？"

Run:

```bash
node scripts/cli.mjs status <project> --intent "<what the user wants>"
node scripts/cli.mjs status-check <project>
```

The command is read-only by default. It does not ask the user for internal
artifact references.

## What It Shows

The card summarizes:

1. first version;
2. current state;
3. task completion;
4. product readiness;
5. launch readiness;
6. missing items;
7. safe next action.

Task completion separates:

- whether a verification plan is prepared;
- whether actual test/check evidence is recorded;
- whether the user supplied a verification note;
- whether the final completion record passed strict checks.

A `--verification` note is not the same thing as a Test Evidence report. The
console may show that the note exists, but it must not treat the note as
recorded test/check evidence.

## What It Does Not Do

It does not approve implementation, commit, push, release, production,
deployment, CI, hooks, secrets, migrations, payment, permissions, compliance, or
security decisions.

It does not prove real users can use the product.

## How It Uses Existing Evidence

The console reads or summarizes existing IntentOS source systems, then explains
them in plain language. The technical trace can mention the source systems, but
the user-facing summary should remain simple.

If the card says a task can be treated as done, that must be backed by valid
lower-level completion evidence that passes the strict Completion Evidence
checker and matches the current `--intent`. Otherwise it must say what is still
missing or that the project only has completion records for another request.

The same current-request rule applies to intermediate source signals. Existing
Business Rule Closure, Change Impact Coverage, Verification Plan, Test Evidence,
or Execution Assurance records from another task may appear in the technical
trace, but they do not make the current task's user-facing fields show `Yes`.

## Task Governance Consumer Integration

From 1.85.0, strict task-consumer mode lets the status card check Task Entry
Binding. If the current task still needs classification, targeted verification,
full high-impact evidence, or a current Work Queue item, the user-facing status
must say that plainly instead of claiming the task is done.
