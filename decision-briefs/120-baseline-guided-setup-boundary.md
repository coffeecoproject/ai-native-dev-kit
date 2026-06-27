# Decision Brief 120: Baseline Guided Setup Boundary

## Decision

1.2.0 adds baseline guided setup and artifact-level baseline enforcement.

It does not add full source-code governance, automatic environment discovery, automatic CI/deploy edits, secret handling, production automation, or default BL2.

## Reason

The workflow should keep humans responsible for risk and project-wide decisions while letting Codex recommend, draft, and check baseline setup.

## Accepted Boundary

- `start` remains the first entry.
- `baseline` is the second entry.
- `baseline` is read-only by default.
- Baseline writes require `write-plan -> review -> apply-plan`.
- Apply scope is limited to baseline docs and baseline report folders.
- Environment facts must be `CONFIRMED`, `PENDING_CONFIRMATION`, or `NOT_APPLICABLE`.
- Task refs are checked at artifact level first.

## Status

Approved for 1.2.0 implementation.
