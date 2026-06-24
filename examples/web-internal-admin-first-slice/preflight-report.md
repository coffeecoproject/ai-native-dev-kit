# Preflight: 001-admin-work-item-list

## Source Request

`requests/001-admin-work-item-list.md`

## Clarity

READY

## Problem Summary

The project needs a narrow read-only internal-admin slice that proves the UI, data boundary, tenant scope, and verification loop.

## Missing Information

- Exact production data model is not required for the baseline; use the existing mock or seed data layer.

## Assumptions

- Authentication already exists in the starter or can be represented by the current local session stub.
- Tenant scope is available through the trusted server or data access layer.
- The first slice may use local seed data if a real API is not available yet.

## Direction Risks

- The slice could grow into full work item management if edit actions are added too early.
- Permission checks could be placed only in the UI if the data access boundary is not explicit.

## Over-design Risks

- Adding filters, exports, bulk actions, workflow state machines, or custom dashboard widgets would exceed the first slice.

## MVP Recommendation

Build one read-only list route with five UI states and a trusted data query that returns only current-tenant items.

## Non-goals

- No create, edit, delete, archive, export, or bulk operation.
- No new analytics dashboard.
- No production deployment.
- No paid external service integration.

## Domain Model Draft

- WorkItem: id, title, status, ownerName, updatedAt, tenantId.
- Tenant scope: the current tenant id must be applied before data reaches the UI.

## Permission / Security Risks

- Tenant isolation must be enforced in the trusted data layer.
- Forbidden state must not reveal item counts from another tenant.

## First Vertical Slice

```text
operator opens admin route -> UI loads list -> trusted query applies tenant scope -> read-only rows render -> verification checks states and scope
```

## Suggested Specs

- `specs/001-admin-work-item-list.md`

## Suggested Task Level

L1

## Decision

READY_FOR_SPEC

## Rationale

The slice has a clear read-only boundary, limited UI states, no destructive action, and a concrete verification path.
