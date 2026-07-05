# Spec 001: First Capability Slice

## Status

Ready

## Source

- Request: `requests/001-first-capability-slice.md`
- Preflight: `preflight/001-first-capability-slice.md`

## Problem

The project needs one minimal capability to validate the implementation path and IntentOS workflow.

## User Story

As an actor,
I want to trigger one narrow operation,
so that the project has a verified end-to-end baseline.

## Scope

Included:

- one interface or command entry point
- one operation handler
- one minimal state/resource result
- one verification path
- one final report

## Non-goals

- No broad feature set
- No external service integration
- No production release
- No destructive operation
- No complex permission model

## Data Model Impact

New or changed entities/resources:

- Replace with project-specific resource if needed.

## API / Interface Contract

### Trigger Operation

Input:

```json
{
  "input": "string"
}
```

Output:

```json
{
  "result": "string",
  "status": "ok"
}
```

Errors:

- invalid input
- forbidden if the project has access control

## UI States

Use this section only if there is UI:

- Initial
- Loading
- Success
- Error

## Permission Rules

- If no permission model exists, document why this operation is local or low-risk.
- If permission exists, enforce it in the trusted execution layer.

## Observability

- Record safe success/failure evidence if the project has logging.
- Do not log secrets or sensitive inputs.

## Acceptance Criteria

- The operation can be triggered.
- The result can be observed.
- Invalid input is rejected or handled safely.
- Verification command runs.
- No unrelated modules are changed.

## Test Plan

- Unit: operation behavior.
- Integration: entry point to operation if applicable.
- Manual: trigger operation and observe result if applicable.

## Rollback Notes

Remove the first slice files or disable the operation if it must be reverted.

## Open Questions

- Which stack-specific verification commands should replace the starter `scripts/verify.sh`?
