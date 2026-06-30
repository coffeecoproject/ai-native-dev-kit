# Subagent Dispatch Hygiene

Subagent Dispatch Hygiene defines the cleanup rule Codex must apply before opening or reusing helper agents.

It extends Subagent Orchestration. It does not replace the main rule:

```text
Many readers, one writer.
```

## Core Rule

```text
Recover before dispatch.
```

Before a helper agent is opened or reused, Codex must confirm that no stale helper from the previous task, previous round, or interrupted work is still occupying a slot.

## What Must Be Checked

Record these checks in the Subagent Run Plan:

| Field | Required Meaning |
|---|---|
| `Before dispatch checked` | Codex checked current helper state before dispatch |
| `Idle subagents recovered` | idle helpers were closed/released, or none existed |
| `Completed subagents closed` | consumed helper outputs were closed before more work was sent |
| `Unused planned subagents skipped` | planned helpers that are no longer needed are `SKIPPED` |
| `Stale task subagents closed or skipped` | helpers from a different task are not reused silently |
| `Task drift checked` | current user intent still matches the run plan |
| `Active writer count` | no more than one writer exists |
| `Dispatch allowed` | `Yes` only when cleanup is complete |

## Dispatch Blocks

Dispatch must stop when:

- a helper is still `RUNNING` after handoff;
- a completed helper has not been closed or released;
- a planned helper is no longer needed but is not `SKIPPED`;
- a helper belongs to a previous or different task;
- task intent changed and no new run plan exists;
- more than one writer would be active;
- the run plan cannot explain who owns the next action.

## Allowed Cleanup

Codex may update the Subagent Run Plan to:

- mark consumed helpers `CLOSED`;
- mark unused helpers `SKIPPED`;
- record that no explicit close command exists and no further work will be sent;
- record the handoff destination for helper output;
- stop for a human decision when task drift changes the approved scope.

## Not Allowed

Dispatch Hygiene does not allow Codex to:

- keep standby helper agents open;
- create background agents;
- run multiple active writers;
- reuse a helper from an old task without a new run plan;
- bypass Goal Mode, Work Queue, Change Boundary, Review Loop, Unified Apply Plan, Human Approval, or Risk Gate;
- call external GPT/API reviewer automation;
- install hooks or schedulers;
- approve implementation, release, production, or high-risk decisions.

## Relationship To Work Queue

Work Queue owns current-task state.

Dispatch Hygiene must respect it:

- if there is a current task, helper dispatch must match that task;
- if the user switches topics, Codex must classify the turn before dispatching helpers;
- if long-running work is paused, stale helpers must be closed or skipped and resumed through a fresh run plan.

## Completion

A dispatch is clean only when:

- every previously consumed helper is `CLOSED` or `SKIPPED`;
- no helper is left occupying a slot after handoff;
- no stale task helper remains active;
- active writer count is at most one;
- task drift is checked;
- the next helper, if any, is the minimum needed helper for the current task.
