# Web API Client Baseline

## Scope

Use this baseline when Web UI calls backend APIs or cloud functions.

## Required Decisions

- API client location.
- Request and response typing boundary.
- Error normalization.
- Auth token or session handling boundary.
- Retry, idempotency, and cancellation behavior where needed.

## Minimum Expectations

- UI code does not duplicate low-level request handling.
- API failures are surfaced as bounded UI states.
- Response shape assumptions are either typed or documented.
- Mutations declare success and failure behavior.
- Client-side authorization assumptions do not replace server-side authorization.

## Boundary

This baseline does not approve backend contract changes.
