# Existing Project Work Queue Takeover

This layer is for existing projects where the old task list is unreliable.

Plain rule:

> If the old TODO/task system is messy or missing, Codex creates an IntentOS Work Queue and future tasks start there.

## What It Solves

Old projects often have task records spread across:

- TODO files
- session notes
- issues
- AI logs
- handoff docs
- old PR notes
- chat history

Those records may be stale, duplicated, incomplete, or already done.

Codex should not execute from them directly.

## What Codex Does

Codex should:

1. Read old task sources.
2. Decide whether the project task system is reliable, messy, missing, or unsafe.
3. If messy or missing, recommend IntentOS Work Queue authority.
4. Give every old task source one disposition.
5. Record source digests so later reviews can detect stale or reused task sources.
6. Mark any migrated `CURRENT` item as non-executable until Task Governance is recorded and checked.
7. Keep old records as history unless a controlled apply path later changes them.

## User Experience

The user should see a short result:

```text
The old task records are not reliable enough.
I will use IntentOS Work Queue as the task entry from now on.
Old TODOs are preserved as history, and unclear items are not executed automatically.
```

If the old project already has a reliable task system:

```text
The project already has a reliable task system.
I will map it to IntentOS Work Queue instead of creating a duplicate queue.
```

## Commands

```bash
node scripts/cli.mjs queue-takeover <project> --intent "continue this old project safely"
node scripts/cli.mjs queue-takeover-check <project>
```

Lower-level scripts:

```bash
node scripts/resolve-work-queue-takeover.mjs <project>
node scripts/check-work-queue-takeover.mjs <project>
```

## Boundaries

This layer does not:

- delete old TODO files
- install `.intentos/`
- replace `AGENTS.md`
- modify CI, hooks, release, API, DB, Web, Docker, production, secrets, payments, or runtime behavior
- approve implementation
- approve completion
- approve release or production
- claim full adoption

It only decides whether task entry should be mapped or recommended for takeover by IntentOS Work Queue.
`takeover_review_ready` means the report can be reviewed; it is not permission
to implement, commit, release, or execute old TODOs.
