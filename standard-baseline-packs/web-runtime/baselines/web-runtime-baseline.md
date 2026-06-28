# Web Runtime Baseline

## Scope

Use this baseline for Web application runtime structure.

## Required Decisions

- App framework and router boundary are documented.
- Page, layout, and shared component ownership are documented.
- Runtime state ownership is documented.
- API client boundary is documented.
- Build, typecheck, lint, test, and preview commands are documented.

## Minimum Expectations

- Pages do not embed unrelated business workflows.
- Shared UI components avoid hidden data fetching unless documented.
- Environment reads are centralized.
- Loading, empty, error, and success states are covered for user-facing flows.
- Browser behavior is verified for changed routes before handoff.

## Boundary

This baseline is guidance. It does not approve a specific implementation task.
