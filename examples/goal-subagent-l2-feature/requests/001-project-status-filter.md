# Request: Project Status Filter

## Raw Request

Add a status filter to the project list so users can view active, paused, or done projects.

## User / Customer

Internal operators who need to scan project records by status.

## Problem

The list currently shows all projects together. Operators must manually scan status labels, which slows repeated review work.

## Desired Outcome

Users can choose one status filter, see the list update from the API query, and understand empty results without losing the current page context.

## Constraints

- Keep internal status handling typed as `ProjectStatus`.
- Keep API query values as strings at the boundary.
- Use a local UI mapping table for this task.
- Do not add backend-managed status configuration in this task.
- Do not change authorization, release flow, schema, or production configuration.

## Priority

P1

## Suggested Task Level

L2
