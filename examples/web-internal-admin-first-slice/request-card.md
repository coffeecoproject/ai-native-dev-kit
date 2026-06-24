# Request: 001-admin-work-item-list

## Raw Request

原始需求：

Build the first internal-admin web slice: a signed-in operator can view a read-only list of work items for the current tenant.

## User / Customer

Internal operator responsible for reviewing operational work items.

## Problem

The project needs a small end-to-end slice that proves routing, data loading, tenant scoping, UI states, and verification can work together.

## Current Workflow

Operators currently cannot inspect work items through the admin UI. Developers use local data inspection when checking the baseline.

## Desired Outcome

A read-only admin page lists work items with loading, empty, success, error, and forbidden states. The page does not allow creation, editing, deletion, export, or bulk actions.

## Constraints

Use existing starter structure, existing verification command, no new dependency, no schema migration unless explicitly approved, and no production data access.

## Priority

P1

## Suggested Task Level

L1

## Deadline

No fixed deadline. This is the first vertical slice for workflow validation.

## Notes

Keep the implementation narrow. This slice is a baseline for future admin screens, not a full operations module.
