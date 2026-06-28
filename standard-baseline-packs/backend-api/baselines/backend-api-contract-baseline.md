# Backend API Contract Baseline

## Scope

Use this baseline when backend API behavior is in scope.

## Required Decisions

- API route and handler ownership.
- Request DTO, response DTO, and domain model boundary.
- Error model and status behavior.
- Authentication and authorization integration point.
- Idempotency expectations for mutations where needed.

## Minimum Expectations

- API contracts are documented or typed.
- Domain logic is not hidden inside transport-only code.
- Error responses are consistent enough for clients to handle.
- Mutations declare validation and failure behavior.
- Auth checks are enforced server-side where required.

## Boundary

This baseline does not approve schema, migration, or production data changes.
