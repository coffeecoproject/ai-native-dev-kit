# Guided Decision Summary: 001-status-model

## Human Decision Summary

| Recommended choice | What it means | Can AI continue now? | Writes project files? | Risk | What happens if you do nothing |
|---|---|---|---|---|---|
| A | Use a simple fixed first version | Yes, after confirmation | Spec/task/app files when approved | low | The first slice waits |
| B | Design configurable statuses now | No | Decision/spec only | medium | More setup before demo |
| C | Stop for expert review | No | No | medium | No status model is chosen |

Recommended choice: A

Decision needed from human: confirm that the first demo only needs simple appointment statuses.

## Human Summary

For the first demo, the user does not need to choose enum, string, lookup table, or state machine. Codex recommends a simple fixed status model and parks configurable statuses for later.

## Decision Level

```text
D1
```

Why this level: Codex can recommend the technical default, but the user owns whether the first demo can stay simple.

## Recommendation

I recommend: simple fixed appointment statuses for the first slice.

Why: the demo only needs to show submitted and recorded appointments.

What this does now: keeps the first slice small.

What this avoids now: configurable admin status, state machine design, and operator workflow complexity.

## What We Should Do Now

- Use simple visible statuses in the first slice.
- Document configurable statuses as a parked follow-up.

## What We Should Not Do Now

- Build a status management admin page.
- Add a workflow engine.
- Treat this as a production status model.

## Options

| Option | Human meaning | Codex action | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Simple first demo | Use fixed statuses in the spec/task | Yes, after task approval | low | First slice only needs demo flow |
| B | Operator-configurable later | Create follow-up proposal | Proposal only | medium | Statuses must be editable |
| C | Workflow control now | Create decision brief | Decision only | medium/high | Complex lifecycle is required now |

## Human Choice Needed

The human only needs to decide:

```text
Can the first demo use a simple fixed status model?
```

Do not ask the human to decide:

```text
enum vs lookup vs state machine
```

## Technical Translation

If the human confirms the recommendation, Codex will translate it into:

- request / spec / eval / task
- engineering baseline note
- follow-up proposal

Technical consequence: a simple first-slice status model, not a production workflow engine.

## Risk / Owner Boundary

Expert or accountable owner needed:

```text
No
```

Reason: the recommendation excludes production workflow and configurable operations.

Stop conditions:

- payment enters scope
- operator-configurable status enters scope
- production release is requested

## Next Safe Action

Next action: create first-slice request/spec/eval/task after human confirmation.

Can AI do it now: limited

Required entry point: confirmed first-slice direction

## Audit Notes

Evidence refs:

- simulated example

Commands run:

```text
none
```
