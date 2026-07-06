# Task: Appointment Requests Must Include A Service Time

## Intent

Appointment requests must include a service time across the user flow, frontend UI, API contract, backend rule, tests, error copy, and handoff documentation.

## Planned Target Paths

- `src/appointment/form.ts`
- `src/appointment/api.ts`
- `src/appointment/domain.ts`
- `tests/appointment-service-time.test.ts`
- `docs/appointment-service-time.md`

## Restore Strategy

Revert the task-scoped diff if service-time validation regresses.
