# Existing Project Work Queue Takeover

Existing Project Work Queue Takeover is the task-entry governance layer for old projects whose task records are missing, stale, duplicated, or unsafe to use as the execution source of truth.

It exists so Codex does not start work from messy TODOs, old session notes, issue fragments, AI logs, or chat memory without first creating a reliable task queue entry.

## Core Rule

If an existing project's task system is `MESSY_TASK_SYSTEM` or `MISSING_TASK_SYSTEM`, IntentOS Work Queue becomes the future task authority.

Old records are preserved as sources. They are not deleted, overwritten, or blindly activated.

## Task-System Classes

`RELIABLE_EXISTING_TASK_SYSTEM`

The project already has one current task or a clear no-current-task state, stable task ids, task states, source refs, owners, recovery points, blockers, and close-out evidence. IntentOS may map this system instead of replacing it.

`MESSY_TASK_SYSTEM`

Task records exist, but they are stale, duplicated, ownerless, mixed with ideas, missing status, missing recovery points, or disconnected from evidence. IntentOS should establish Work Queue authority and migrate valid items.

`MISSING_TASK_SYSTEM`

No usable task-continuity system exists. IntentOS should establish Work Queue authority.

`UNSAFE_TO_TAKE_OVER`

The project state is unsafe for task takeover: dirty/unclear work, production incident, release conflict, owner conflict, or unresolved high-risk state. Codex must stop before takeover.

## Source Discovery

Codex may read task sources such as:

- `TODO.md`, `TASKS.md`, `ROADMAP.md`
- session and handoff docs
- follow-up proposals
- AI logs and final reports
- existing Work Queue reports
- local issue exports
- docs that contain pending or follow-up sections

Codex must not call external services or mutate files during discovery by default.

## Migration Dispositions

Every old source item must receive exactly one disposition:

- `MIGRATE_CURRENT`
- `MIGRATE_BACKLOG`
- `MIGRATE_PAUSED`
- `MIGRATE_BLOCKED`
- `MERGE_DUPLICATE`
- `MARK_DONE_WITH_EVIDENCE`
- `MARK_STALE`
- `NEEDS_CLARIFICATION`
- `ARCHIVE_SOURCE_ONLY`

`ACTIVATE_ALL` is forbidden.

## Work Queue Binding

Every migrated Work Queue item must keep source identity:

- `source_digest` records the old task source content at review time.
- `source_item_digest` on queue items must match the source inventory.
- `STALE` and `RISKY` sources cannot become `CURRENT`.
- `MIGRATE_CURRENT` is only a candidate current task, not permission to start work.

Every execution-eligible Work Queue item must bind to Task Governance:

- `CURRENT` requires `task_governance_ref`.
- `CURRENT` starts with `task_governance_binding_status: PENDING`.
- `execution_eligible` remains `No` until Task Governance is verified.
- `execution_review_eligible_after_task_governance` may be `Yes` for a pending `CURRENT` item.
- `PAUSED` requires resume review before execution; Task Governance must be present before resume.
- `BACKLOG` is not execution permission.
- `BLOCKED` records why execution cannot continue.
- `DONE` requires evidence or source reason.
- `CANCELLED` cannot be resumed as-is.

## User Experience

The user should not need to understand TODO models, Work Queue internals, schema names, or migration dispositions.

Codex should lead with plain language:

```text
I found the old task records are not reliable enough to execute from.
I will establish an IntentOS Work Queue.
Old records stay as history, and future work starts from the queue.
```

## Boundary

Every Work Queue Takeover report must state:

- This report is takeover-review ready: Yes/No
- This report writes target files: No
- This report deletes old task sources: No
- This report approves implementation: No
- This report approves completion: No
- This report approves commit or push: No
- This report approves release or production: No
- This report claims full adoption: No
- This report installs native assets: No
