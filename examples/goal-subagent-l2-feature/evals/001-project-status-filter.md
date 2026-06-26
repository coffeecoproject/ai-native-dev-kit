# Eval: Project Status Filter

## Related Spec

Spec: `specs/001-project-status-filter.md`

## Must Pass

- Status values map through `ProjectStatus` before UI use.
- API query values remain strings at the boundary.
- Unknown status query values do not create domain values.
- Empty state reflects the selected status.
- The task includes Review Packet and Review Loop Report evidence.

## Spec Alignment

The implementation must stay inside the spec scope and must not add backend-managed status administration.

## Permission / Data Checks

- Existing list permission behavior remains unchanged.
- No schema, migration, production configuration, or release workflow change is allowed.
- No new persisted data is introduced.

## Manual Review Checklist

- Confirm the local status option table is the only UI label source for this task.
- Confirm raw API strings are not compared directly in UI rendering logic.
- Confirm the follow-up lookup-table decision is not implemented inside this task.

## Reject Conditions

- Adds backend status configuration.
- Adds a database table, migration, or generated schema change.
- Adds a new status value.
- Changes permission or release behavior.
- Marks a human-decision item as auto-fixed.

## Required Evidence

Workflow evidence: `tasks/001-project-status-filter.md`, `review-packets/001-project-status-filter.md`, and `review-loop-reports/001-project-status-filter.md`.

Type evidence: status parser covers active, paused, done, and unknown query input.

UI evidence: selected option and empty state checks are recorded in the Review Packet.

Boundary evidence: `follow-up-proposals/001-status-filter-lookup-admin.md` records the backend-managed lookup decision outside current scope.
