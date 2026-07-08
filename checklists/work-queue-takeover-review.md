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
- Source inventory records `source_digest`.
- Migration dispositions carry matching `source_digest`.
- Queue items carry matching `source_item_digest`.
- There is at most one `CURRENT` queue item.
- Stale or risky sources are not promoted to `CURRENT`.
- Migrated `CURRENT` items are not executable until Task Governance is verified.
- Pending `CURRENT` items use `task_governance_binding_status: PENDING`,
  `task_governance_digest: N/A`, and `execution_eligible: No`.
- `takeover_review_ready` is treated as review readiness, not implementation permission.
- `BACKLOG` is not treated as execution permission.
- Human summary is plain language.

## Reject If

- The report claims full adoption.
- The report approves implementation, completion, commit, push, release, or production.
- The report deletes or rewrites old task sources.
- The report activates all old TODOs.
- The report promotes a stale or risky item to `CURRENT`.
- The report invents Task Governance digest evidence before a real report exists.
- The report marks a pending `CURRENT` item execution eligible.
- The report lets Codex execute directly from old TODO.
