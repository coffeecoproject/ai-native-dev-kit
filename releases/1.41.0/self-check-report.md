# Self-Check Report: 1.41.0

## Scope

Structured evidence schema hardening for Unified Apply Plan, Controlled Apply Readiness, and Approval Record.

## Checks

- `node --check scripts/lib/artifact-schema.mjs`: passed
- `node --check scripts/check-apply-plan.mjs`: passed
- `node --check scripts/check-controlled-apply-readiness.mjs`: passed
- `node --check scripts/check-approval-record.mjs`: passed
- `node scripts/check-apply-plan.mjs examples/1.41-structured-evidence-schema`: passed
- `node scripts/check-controlled-apply-readiness.mjs examples/1.41-structured-evidence-schema`: passed
- `node scripts/check-approval-record.mjs examples/1.41-structured-evidence-schema`: passed
- `node scripts/check-manifest.mjs`: passed
- `node scripts/check-fixtures.mjs`: passed, 123 fixture cases
- `node scripts/check-product-baseline.mjs .`: passed
- `node scripts/check-claim-control.mjs .`: passed
- `node scripts/check-dev-kit.mjs`: passed
- `npm run verify:governance`: passed

## Negative Fixtures

- `test-fixtures/bad/bad-structured-apply-plan-digest`: rejected mismatched apply plan digest
- `test-fixtures/bad/bad-structured-readiness-plan-digest`: rejected mismatched readiness plan digest
- `test-fixtures/bad/bad-structured-approval-plan-digest`: rejected mismatched approval plan digest

## Final Command

- `git diff --check`: passed
