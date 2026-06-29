# Work Queue Report

## Human Decision Summary

Conclusion: `<what is the current queue situation?>`

Recommended choice: `<A. Continue current task / B. Pause and switch / C. Park new request / D. Resume after review / E. Stop>`

Can AI continue now: `<yes / limited / no>`

What I need from you: `<decision needed, or none>`

What happens if you do nothing: `<no task state changes; no code changes>`

## Human Summary

`<plain-language summary of current task, paused work, and parked items>`

## Queue Policy

- Only one `CURRENT` task is allowed.
- `PAUSED` tasks require resume review before execution.
- `BACKLOG` items are not execution permission.
- Work Queue records task state only; it does not approve implementation.

## Current Task

| Task ID | Title | State | Task / spec reference | Last evidence | Notes |
|---|---|---|---|---|---|
| `<id>` | `<title>` | `CURRENT` | `<path or PENDING>` | `<path or PENDING>` | `<notes>` |

## Paused Tasks

| Task ID | Title | State | Pause reason | Last completed | Resume review needed |
|---|---|---|---|---|---|
| `<id>` | `<title>` | `PAUSED` | `<why paused>` | `<evidence>` | `Yes` |

## Backlog / Parking Lot

| Task ID | Title | State | Source | Why parked | Promotion needed |
|---|---|---|---|---|---|
| `<id>` | `<title>` | `BACKLOG` | `<conversation / request / issue>` | `<reason>` | `Human decision` |

## Resume Review

- Resume requested: `<Yes / No>`
- Candidate task: `<task id or None>`
- Current state checked: `<Yes / No>`
- Dirty worktree checked: `<Yes / No / N/A>`
- Last evidence still valid: `<Yes / No / Unclear>`
- Human resume decision: `<APPROVED / PENDING / REJECTED / NOT_NEEDED>`
- Resume without review: `No`

## Work Items

| Task ID | Title | State | Task ref | Resume review | Owner | Notes |
|---|---|---|---|---|---|
| `<id>` | `<title>` | `CURRENT` | `<path>` | `N/A` | `<owner>` | `<notes>` |
| `<id>` | `<title>` | `PAUSED` | `<path>` | `Required` | `<owner>` | `<notes>` |
| `<id>` | `<title>` | `BACKLOG` | `<path or PENDING>` | `Required before promotion` | `<owner>` | `<notes>` |

## Human Decisions Needed

| Decision | Options | Recommended | Owner | Status |
|---|---|---|---|---|
| `<decision>` | `<options>` | `<recommendation>` | `human` | `<PENDING / NOT_NEEDED / DECIDED>` |

## Boundary

- This report changes task state: No
- This report approves implementation: No
- This report approves target-project writes: No
- This report approves scope expansion: No
- This report approves release or production: No
- This report overrides task/spec/review loop: No
- This report resumes stale work without review: No

## Outcome

`<WORK_QUEUE_RECORDED / NEEDS_HUMAN_DECISION / BLOCKED>`
