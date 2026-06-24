# Spec 001: Admin Work Item List

## Status

Ready

## Source

- Request: `requests/001-admin-work-item-list.md`
- Preflight: `preflight/001-admin-work-item-list.md`

## Problem

Operators need a read-only internal-admin view that proves the project can load tenant-scoped operational data through the approved workflow.

## User Story

As an internal operator,
I want to view a read-only list of current-tenant work items,
so that I can confirm the admin baseline without relying on developer-only data inspection.

## Scope

Included:

- one admin list route
- trusted data loading for current-tenant work items
- loading, empty, success, error, and forbidden UI states
- row fields for title, status, owner, and updated time
- verification for rendering and tenant-scope behavior

## Non-goals

- No create, edit, delete, archive, export, bulk action, or workflow transition.
- No dashboard metrics or charts.
- No schema migration unless separately approved.
- No production configuration change.

## Data Model Impact

New or changed entities:

- No required schema change for the first slice.
- Use existing WorkItem or local seed data with id, title, status, ownerName, updatedAt, and tenantId.

## API / Interface Contract

### List Work Items

Input:

```json
{
  "tenantId": "current-session-tenant"
}
```

Output:

```json
{
  "items": [
    {
      "id": "wi_001",
      "title": "Review intake",
      "status": "open",
      "ownerName": "Operator",
      "updatedAt": "2026-06-24T09:00:00.000Z"
    }
  ]
}
```

Errors:

- forbidden when the current session has no admin access
- unavailable when the trusted data layer fails

## UI States

- Loading: show stable table skeleton or loading row.
- Empty: show an empty state when the current tenant has no work items.
- Success: show read-only rows with title, status, owner, and updated time.
- Error: show retry-safe error state without exposing internal details.
- Forbidden: show access-denied state without item count.

## Permission Rules

- Enforce tenant scope in the trusted data layer before data reaches the UI.
- Do not rely on frontend filtering for tenant isolation.
- Users without admin read access see the forbidden state.

## Observability

- Logs: safe failure reason for data load failure.
- Metrics: optional load success/failure counter if the project already has metrics.
- Audit events: not required for the read-only baseline.

## Acceptance Criteria

- The admin route renders without unrelated navigation changes.
- Loading, empty, success, error, and forbidden states are reachable in tests or local fixtures.
- Successful rows contain only current-tenant work items.
- No create, edit, delete, archive, export, or bulk action is introduced.
- Verification command completes and evidence is attached to the task report.

## Test Plan

- Unit: data loader applies tenant scope and maps row fields.
- Integration: admin route renders loading, empty, success, error, and forbidden states.
- E2E: operator can open the list route and see current-tenant rows.
- Manual: inspect the page at local dev URL if the project has a browser UI.

## Rollback Notes

Remove or disable the admin list route and associated read-only data loader. No data migration rollback is expected.

## Open Questions

- Should future slices add filters or row detail navigation after the baseline is accepted?
