# Work Queue Takeover Review

Use this checklist when reviewing Work Queue Takeover reports.

## Required Checks

- The report is read-only and non-authorizing.
- Old task sources are preserved, not deleted.
- Every old source item has exactly one disposition.
- `ACTIVATE_ALL` is not used.
- `MESSY_TASK_SYSTEM` and `MISSING_TASK_SYSTEM` recommend `INTENTOS_WORK_QUEUE` authority.
- `RELIABLE_EXISTING_TASK_SYSTEM` maps existing task authority instead of duplicating it.
- `UNSAFE_TO_TAKE_OVER` blocks takeover.
- There is at most one `CURRENT` queue item.
- Every executable `CURRENT` item has Task Governance ref and digest.
- `BACKLOG` is not treated as execution permission.
- Human summary is plain language.

## Reject If

- The report claims full adoption.
- The report approves implementation, completion, commit, push, release, or production.
- The report deletes or rewrites old task sources.
- The report activates all old TODOs.
- The report promotes a stale item without evidence.
- The report lets Codex execute directly from old TODO.
