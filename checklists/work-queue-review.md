# Work Queue Review Checklist

Use this checklist when reviewing a Work Queue Report.

## Required

- There is at most one `CURRENT` task.
- Paused tasks are not treated as executable without resume review.
- Backlog items are not treated as permission to execute.
- The report states whether human input is needed.
- The report names what happens if the user does nothing.
- The report does not approve implementation, scope expansion, release, or production.
- The report does not override task cards, specs, Review Loop, or launch gates.

## Resume Review

For any paused task that may resume, confirm:

- current project state was checked
- dirty worktree was checked or marked N/A
- last evidence validity was checked
- human resume decision is recorded
- "Resume without review" is `No`

## Stop Conditions

Stop for human decision if:

- more than one task is marked `CURRENT`
- a paused task is requested for resume but current-state evidence is missing
- the user asks to switch tasks without pausing or closing the current task
- the Work Queue report claims it approved code changes
- the queue conflicts with the current task card or project risk policy
