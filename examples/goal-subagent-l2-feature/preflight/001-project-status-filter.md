# Preflight: Project Status Filter

## Source Request

Request: `requests/001-project-status-filter.md`

## Clarity

READY

## Problem Summary

The feature is clear: add a single-select status filter to the project list and map selected values to the existing API query boundary.

## Missing Information

No blocking information is missing for this simulated task.

## Assumptions

- Existing API accepts `status=active`, `status=paused`, and `status=done`.
- Existing list rendering can handle an empty result state.
- Status labels are controlled locally for this task.

## Direction Risks

- Mixing raw API strings into UI logic could weaken type boundaries.
- Treating status options as backend-managed now would expand scope.
- Review findings could become unbounded future work if not classified.

## Over-design Risks

Building a status administration UI or a database lookup model would be too broad for this task.

## MVP Recommendation

Add a local status option table, parse API query values into `ProjectStatus`, and show selected, loading, and empty states.

## Non-goals

- No backend-managed lookup table.
- No schema change.
- No permission change.
- No release workflow change.

## Domain Model Draft

`ProjectStatus = active | paused | done`

The UI filter uses this domain type. The URL query remains a string and is parsed before domain use.

## Permission / Security Risks

No permission or security policy changes are planned. The feature must not reveal projects outside the existing list API behavior.

## First Vertical Slice

Implement one status filter control, one query mapping path, one empty state, and one focused test set.

## Suggested Specs

Spec: `specs/001-project-status-filter.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The request has clear user value and bounded scope. It is L2 because it touches domain typing, API boundary mapping, UI states, review loop closure, and follow-up routing.
