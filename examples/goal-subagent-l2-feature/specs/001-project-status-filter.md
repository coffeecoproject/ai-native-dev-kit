# Spec: Project Status Filter

## Status

Ready

## Source

Request: `requests/001-project-status-filter.md`

Preflight: `preflight/001-project-status-filter.md`

Engineering baseline: `docs/engineering-baseline.md`

## Problem

Operators need to quickly narrow the project list by status without scanning every row manually.

## User Story

As an internal operator, I want to filter the project list by active, paused, or done status so I can focus on the records I need to review.

## Scope

Included:

- Add a single-select status filter above the project list.
- Use `ProjectStatus` for internal status state.
- Map API query string values to the domain type.
- Render selected, loading, and empty states.
- Add tests for query mapping and empty state behavior.

Excluded:

- Backend-managed status lookup table.
- New status values.
- Schema or migration changes.
- Authorization or permission changes.
- Release workflow changes.

## Non-goals

This task does not create a status administration surface, does not change project lifecycle rules, and does not define a reusable platform baseline.

## Data Model Impact

No persisted data model change. The only data model impact is local domain typing for status filter state.

## API / Interface Contract

The list query may include one optional status query value:

```text
GET /api/projects?status=active
GET /api/projects?status=paused
GET /api/projects?status=done
```

Unknown status query values are ignored by the UI filter and must not create new domain values.

## UI States

- All projects selected.
- Active selected.
- Paused selected.
- Done selected.
- Loading after status change.
- Empty result for a selected status.
- Query failure keeps the selected status visible and shows existing error handling.

## Permission Rules

Use the existing project list API permission behavior. This task must not broaden access or introduce new permission checks.

## Observability

No new telemetry is required. Existing request logs should include the status query value when the API receives it.

## Acceptance Criteria

- Status filter options are generated from one local mapping table.
- Internal UI state uses `ProjectStatus`.
- API query boundary uses strings and parses into domain state.
- Empty results show a selected-status empty message.
- Tests cover valid statuses, unknown query values, and empty state rendering.
- Review loop records auto-fix and human-decision outcomes.

## Test Plan

- Unit test status parser for `active`, `paused`, `done`, and unknown values.
- Component test selected option rendering.
- Component test empty result message for a selected status.
- Review artifact checks for workflow, review loop, next-step boundary, and output quality.

## Rollback Notes

Remove the local filter control and query mapping. No schema rollback, data rollback, or release rollback is part of this task.
