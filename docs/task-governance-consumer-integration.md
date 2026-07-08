# Task Governance Consumer Integration

This is the user-facing guide for IntentOS 1.85.

In plain language:

```text
Before Codex says a task is done, the "done" proof must match the active task.
```

That means the final answer must line up with:

- the current Work Queue item;
- the Task Governance classification;
- the proof that the queue item and classification point to each other;
- the required review strength;
- the required verification evidence.

## Why This Exists

1.83 classifies a task.

1.84 makes old-project work start from a reliable queue.

1.85 makes the downstream proof chain consume those decisions. Codex should not
be able to classify a task as high risk, or migrate a current queue item, and
then later say "done" using unrelated or weaker evidence.

1.85.1 tightens this further: strict checks validate the referenced Work Queue
and Task Governance reports, require them to be jointly bound, require task
refs for closure/status views, and require structured resume-review evidence
when a paused or non-current item is resumed.

## What Users See

Users should still see a simple answer:

```text
This task is done.
```

or:

```text
Not done yet. This task still needs targeted verification.
```

Users should not need to choose internal systems such as Execution Assurance,
Completion Evidence, Unified Closure, Task Governance, or Work Queue.

## Maintainer Commands

Strict task-consumer checks are opt-in so historical evidence remains
compatible:

```bash
node scripts/check-execution-assurance.mjs <project> \
  --require-task-governance \
  --require-work-queue \
  --strict-task-consumer

node scripts/check-completion-evidence.mjs <project> \
  --require-task-governance \
  --require-work-queue \
  --strict-task-consumer

node scripts/check-closure-decision.mjs <project> --strict-task-consumer
node scripts/check-user-delivery-console.mjs <project> --strict-task-consumer
```

## What This Does Not Do

It does not authorize implementation. It does not authorize code changes,
commit, push, release, production, CI, hooks, migrations, secrets, permissions,
or business decisions.

It does not approve release or production.

It only checks that task completion claims are bound to the current governed
task.
