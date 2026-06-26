# Engineering Baseline

## Human Summary

This example uses a confirmed engineering baseline so the simulated L2 task can focus on workflow closure. Status values are domain types inside the app, plain strings at the API boundary, and UI labels are mapped in one local table.

## Status

Baseline status: CONFIRMED

Human decision status: APPROVED_FOR_EXAMPLE

Scope: Simulated L2 feature example only.

## Scope

This baseline covers the simulated status filter feature in this example directory.

It does not define a reusable baseline for real projects.

## Code Structure Boundary

- Domain type: `ProjectStatus`
- API query input: string value mapped to `ProjectStatus`
- UI mapping: one local status option table
- Test target: status query mapping, empty state copy, selected option rendering

## Frontend Boundary

The UI may add a compact filter control above the list. The task must not redesign navigation, layout system, or shared shell components.

## Type Source of Truth

`ProjectStatus` is the source of truth for internal status handling.

Allowed values:

- `active`
- `paused`
- `done`

## DTO / Schema / Domain Rules

- DTO values crossing the API boundary stay as strings.
- Domain code must parse API strings into `ProjectStatus`.
- Unknown API status values render as unselected filter state and are not silently added to the domain type.
- UI code must not compare raw status strings outside the mapping boundary.

## API Contract Source

The simulated API contract is:

```text
GET /api/projects?status=active
GET /api/projects?status=paused
GET /api/projects?status=done
```

No endpoint shape changes are authorized by this example.

## Enum / String / Lookup / State Machine Decision Matrix

| Decision Area | Choice | Reason | Change Rule |
|---|---|---|---|
| Internal status | union type | Small stable set used by UI and query mapping | Change through engineering baseline update |
| API query | string | URL query values are strings at the boundary | Parse before domain use |
| UI options | local mapping table | Keeps labels and order explicit for this task | Follow-up required before backend management |
| Backend lookup | not part of this task | Requires owner decision and backend contract | Use follow-up proposal |
| State machine | not needed | Status filter is stateless selection | Revisit only if transitions are introduced |

## Schema / Migration Rules

No schema change and no migration are authorized by this example.

## Engineering Decision Required When

- Adding a new status value.
- Moving status labels or order to backend configuration.
- Replacing the union type with generated types.
- Sharing the status model across modules.
- Changing API query contract or response shape.

## Codex Behavior

Codex may implement local status mapping and tests inside the approved task scope.

Codex must not create or upgrade project-wide engineering conventions without a documented project source of truth or human approval.

Codex must not convert this example into a real project baseline.

## Open Engineering Decisions

| Decision | Status | Owner | Route |
|---|---|---|---|
| Should status options be backend-managed | Deferred outside this task | Product owner | `follow-up-proposals/001-status-filter-lookup-admin.md` |
