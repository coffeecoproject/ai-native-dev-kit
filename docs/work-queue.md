# Work Queue

Work Queue is the layer that keeps work from drifting when a task is paused, interrupted, or too large to finish in one pass.

Plain-language rule:

> One current task. Everything else is parked, paused, blocked, done, or cancelled.

## When To Use

Use Work Queue when:

- the user interrupts an active task with another request
- a task will continue across multiple sessions
- work is paused halfway through
- several possible next tasks exist
- Codex needs to resume old work safely
- a side task should be captured without taking over the current task

## User Experience

The user should not need to manage a technical todo system.

Codex should present a short decision:

- continue current task
- pause current task and switch
- park new request for later
- resume a paused task after review
- stop because a human decision is needed

## Codex Behavior

Codex should:

- read the current Work Queue before switching task context
- keep only one `CURRENT` task
- record side tasks as `BACKLOG`
- record interrupted work as `PAUSED`
- run resume review before continuing paused work
- stop if multiple current tasks are detected
- keep Work Queue separate from implementation approval

Codex should not:

- execute a backlog item just because it was recorded
- resume stale work without checking current project state
- let a next-step suggestion become implicit permission
- use Work Queue to approve risky changes
- replace task cards, specs, Review Loop, or release readiness

## Commands

```bash
node scripts/resolve-work-queue.mjs .
node scripts/check-work-queue.mjs .
node scripts/resolve-work-queue-transition.mjs . \
  --predecessor work-queue/previous.md#WQ-001 \
  --successor work-queue/current.md#WQ-002 \
  --sequence 1 \
  --decision-ref user-confirmation:<date> \
  --out work-queue-transitions/001-previous-to-current.md
node scripts/check-work-queue-transition.mjs . --require-report
node scripts/new-workflow-item.mjs --type work-queue-report --name current-work
```

CLI aliases:

```bash
node scripts/cli.mjs work-queue .
node scripts/cli.mjs work-queue-check .
node scripts/cli.mjs work-queue-transition-check . --require-report
```

## Recommended Flow

1. Start or resume work.
2. If the task is interrupted, record it as `PAUSED`.
3. Park side requests as `BACKLOG`.
4. Keep only one task as `CURRENT`.
5. Before resuming a paused task, run resume review.
6. Close finished work as `DONE` with evidence.

For a published Work Queue snapshot, step 6 is represented by an append-only
state transition. Do not edit the historical snapshot merely to replace
`CURRENT` with `DONE`; the transition projection supplies the effective state
while preserving the old evidence digest.

## Relationship To Other Layers

Work Queue is independent from:

- Document Lifecycle
- Hook orchestration
- Baseline selection
- Review Loop
- Safe Launch

It can reference those layers, but it does not replace them.
