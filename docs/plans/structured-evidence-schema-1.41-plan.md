# Structured Evidence Schema 1.41 Plan

## Purpose

1.41.0 hardens the apply evidence chain by adding machine-readable schema evidence to the three artifacts that control writes:

- Unified Apply Plan
- Controlled Apply Readiness
- Approval Record

The goal is not to add another workflow layer. The goal is to make the existing high-risk chain easier to verify by machines while keeping Markdown readable for humans.

## Boundary

This release does not add a controlled apply runner, write target files, approve implementation, approve release or production, install hooks, change CI, enable BL2, or replace human approval.

Existing historical examples remain supported by Markdown semantic checks. New 1.41 examples and templates must include a `Machine-Readable Evidence` JSON block.

## Design

1. Add schemas under `schemas/artifacts/`.
2. Add a shared schema validation helper under `scripts/lib/`.
3. Teach apply/readiness/approval checkers to validate JSON evidence blocks when present.
4. Recompute Unified Apply Plan digests from canonical JSON when a structured plan is present.
5. Validate readiness and approval references against the referenced apply plan digest when the referenced plan file is available.
6. Keep Markdown sections as human-readable evidence and compatibility fallback.

## Human Experience

Users should still see a readable plan, readiness report, and approval record.

Codex and CI should additionally see:

- exact action IDs
- exact target paths
- risk classification
- approval scope
- expiry
- rollback and verification references
- a recomputable plan digest

## Acceptance

- 1.41 schemas exist and are copied with workflow assets.
- Templates include a machine-readable evidence block.
- Good 1.41 example passes all three checkers.
- Bad structured examples are rejected.
- `check-intentos`, `check-fixtures`, and governance verification pass.
