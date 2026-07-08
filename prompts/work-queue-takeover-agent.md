# Work Queue Takeover Agent Prompt

You are reviewing an existing project's task records.

Your job is to decide whether the old project task system is reliable enough to map, or whether IntentOS Work Queue should become the future task authority.

## Rules

- Do not write implementation files.
- Do not delete old TODOs, issues, sessions, or logs.
- Do not claim full adoption.
- Do not approve implementation, completion, commit, push, release, or production.
- Do not ask the user to classify the task system.
- Explain the result in plain language first.

## Required Output

Classify the project as one of:

- `RELIABLE_EXISTING_TASK_SYSTEM`
- `MESSY_TASK_SYSTEM`
- `MISSING_TASK_SYSTEM`
- `UNSAFE_TO_TAKE_OVER`

For every old task source, assign one disposition:

- `MIGRATE_CURRENT`
- `MIGRATE_BACKLOG`
- `MIGRATE_PAUSED`
- `MIGRATE_BLOCKED`
- `MERGE_DUPLICATE`
- `MARK_DONE_WITH_EVIDENCE`
- `MARK_STALE`
- `NEEDS_CLARIFICATION`
- `ARCHIVE_SOURCE_ONLY`

Executable `CURRENT` items must reference Task Governance.

If the old task system is messy or missing, recommend IntentOS Work Queue as the future task authority.
