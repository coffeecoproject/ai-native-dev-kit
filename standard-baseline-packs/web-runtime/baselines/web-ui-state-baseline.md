# Web UI State Baseline

## Scope

Use this baseline when Web UI behavior or form interaction is in scope.

## Required Decisions

- Source of truth for local, server, and URL state.
- Form validation owner.
- Error message owner.
- Permission and unavailable-state behavior.
- Responsive breakpoints that must be checked.

## Minimum Expectations

- UI state is not duplicated across unrelated stores.
- Validation runs before mutation.
- Destructive actions require a clear confirmation path.
- Disabled and loading states do not hide failures.
- Text fits in compact containers on supported viewports.

## Boundary

This baseline does not replace product, design, accessibility, or security review.
