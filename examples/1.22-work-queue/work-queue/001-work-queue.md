# Work Queue Report

## Human Decision Summary

Conclusion: One current task is active. One paused task can be resumed only after review, and one side request is parked.

Recommended choice: A. Continue current task

Can AI continue now: limited

What I need from you: Confirm before switching to the paused task or backlog item.

What happens if you do nothing: No task state changes; no code changes.

## Human Summary

The appointment booking slice remains the current task. The analytics dashboard request is paused, and the notification idea is parked for later.

## Queue Policy

- Only one `CURRENT` task is allowed.
- `PAUSED` tasks require resume review before execution.
- `BACKLOG` items are not execution permission.
- Work Queue records task state only; it does not approve implementation.

## Current Task

| Task ID | Title | State | Task / spec reference | Last evidence | Notes |
|---|---|---|---|---|---|
| T-001 | Appointment booking first slice | CURRENT | tasks/001-appointment-booking.md | review-loop-reports/001-appointment-booking.md | Continue only within existing task scope |

## Paused Tasks

| Task ID | Title | State | Pause reason | Last completed | Resume review needed |
|---|---|---|---|---|---|
| T-002 | Analytics dashboard cleanup | PAUSED | User switched to booking work | ai-logs/002-dashboard.md | Yes |

## Backlog / Parking Lot

| Task ID | Title | State | Source | Why parked | Promotion needed |
|---|---|---|---|---|---|
| T-003 | Notification copy variants | BACKLOG | Conversation follow-up | Not part of current booking slice | Human decision |

## Resume Review

- Resume requested: No
- Candidate task: None
- Current state checked: Yes
- Dirty worktree checked: N/A
- Last evidence still valid: Unclear
- Human resume decision: NOT_NEEDED
- Resume without review: No

## Work Items

| Task ID | Title | State | Task ref | Resume review | Owner | Notes |
|---|---|---|---|---|---|
| T-001 | Appointment booking first slice | CURRENT | tasks/001-appointment-booking.md | N/A | Codex + human | Stay inside current scope |
| T-002 | Analytics dashboard cleanup | PAUSED | tasks/002-dashboard.md | Required | human | Resume only after review |
| T-003 | Notification copy variants | BACKLOG | PENDING | Required before promotion | human | Parked side request |

## Human Decisions Needed

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| Switch away from current task | continue / pause and switch / park | continue | human | PENDING |
| Resume paused analytics task | resume after review / keep paused / cancel | keep paused | human | NOT_NEEDED |

## Boundary

- This report changes task state: No
- This report approves implementation: No
- This report approves target-project writes: No
- This report approves scope expansion: No
- This report approves release or production: No
- This report overrides task/spec/review loop: No
- This report resumes stale work without review: No

## Outcome

`WORK_QUEUE_RECORDED`
