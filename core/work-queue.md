# Work Queue Governance

Work Queue Governance is the task-state layer for interrupted work, long-running work, pause/resume, and side-task parking.

It exists so Codex can keep the main delivery thread stable when a user changes topic, pauses work, or asks for a long-running item to continue later.

## Core Rule

There must be at most one `CURRENT` task.

Everything else must be one of:

- `PAUSED`
- `BLOCKED`
- `BACKLOG`
- `DONE`
- `CANCELLED`

If more than one task appears as `CURRENT`, Codex must stop and ask for a human decision before continuing execution.

## What This Layer Does

Work Queue Governance records:

- the current task, if one exists
- paused tasks
- blocked tasks
- backlog / parking lot items
- resume candidates
- what evidence must be checked before resuming
- what human decision is needed

It helps Codex answer:

- Should I continue the current task?
- Should I pause the current task before switching?
- Is the new user request a side task, scope change, or new current task?
- Can a paused task be resumed safely?
- What must be rechecked before resuming stale work?

## What This Layer Does Not Do

The Work Queue does not:

- approve implementation
- approve target-project writes
- approve scope expansion
- approve release or production
- override a task card, spec, Review Loop, launch gate, or risk policy
- mark paused work safe to resume without current-state evidence
- run hooks
- delete or archive documents

The Work Queue is a routing and state ledger. It is not execution permission.

## State Definitions

`CURRENT`

The one task Codex is actively allowed to discuss or execute, subject to the task card, risk policy, and current user instruction.

`PAUSED`

A task intentionally stopped before completion. It may be resumed only after a resume review checks current state, stale assumptions, dirty worktree, changed files, and human intent.

`BLOCKED`

A task that cannot continue until a named blocker is resolved.

`BACKLOG`

A future or parked item. It is not authorized for execution until promoted.

`DONE`

Completed and closed with evidence.

`CANCELLED`

No longer active. It must not be resumed as-is; create a new task or decision record if needed.

## Resume Review Rules

Before resuming a `PAUSED` task, Codex must check:

- what was last completed
- what remains
- whether the project state changed
- whether dependencies, risks, or assumptions changed
- whether the previous task card/spec/review evidence is still valid
- whether the human wants to resume that task now

If any of these are unclear, the outcome is `NEEDS_HUMAN_DECISION`.

## Interruption Rules

When the user changes topic while a task is active:

1. Classify the new turn.
2. Decide whether it is clarification, scope change, side task, emergency, or new task.
3. If switching tasks, record the current task as `PAUSED` or `BLOCKED`.
4. Promote only one task to `CURRENT`.
5. Do not treat "next-step suggestions" or backlog notes as permission to execute them.

## Long-Running Task Rules

For long-running work:

- keep a visible current task
- keep parked items out of the current execution path
- update status after meaningful checkpoints
- record blockers instead of silently changing direction
- close with a final report or handoff when the task ends

## Boundary

Every Work Queue Report must state:

- This report changes task state: No
- This report approves implementation: No
- This report approves target-project writes: No
- This report approves scope expansion: No
- This report approves release or production: No
- This report overrides task/spec/review loop: No
- This report resumes stale work without review: No
