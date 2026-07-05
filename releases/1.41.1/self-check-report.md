# Self-Check Report: 1.41.1

## Scope

Structured evidence hardening for strict checker mode, local plan reference resolution, and readiness action completeness.

## Checks

- `node --check scripts/check-apply-plan.mjs`: passed
- `node --check scripts/check-controlled-apply-readiness.mjs`: passed
- `node --check scripts/check-approval-record.mjs`: passed
- `node --check scripts/lib/artifact-schema.mjs`: passed
- `node scripts/check-apply-plan.mjs examples/1.41-structured-evidence-schema --require-structured-evidence`: passed
- `node scripts/check-controlled-apply-readiness.mjs examples/1.41-structured-evidence-schema --require-structured-evidence`: passed
- `node scripts/check-approval-record.mjs examples/1.41-structured-evidence-schema --require-structured-evidence`: passed
- `node scripts/check-fixtures.mjs`: passed, 129 fixture cases
- `node scripts/check-manifest.mjs`: passed
- `node scripts/check-product-baseline.mjs .`: passed
- `node scripts/check-claim-control.mjs .`: passed

## Negative Fixtures

- `examples/1.34-unified-apply-plan --require-structured-evidence`: rejected missing `Machine-Readable Evidence`
- `examples/1.38-controlled-apply-readiness --require-structured-evidence`: rejected missing `Machine-Readable Evidence`
- `examples/1.40-approval-record-governance --require-structured-evidence`: rejected missing `Machine-Readable Evidence`
- `test-fixtures/bad/bad-structured-readiness-missing-plan-ref --require-structured-evidence`: rejected unresolved local plan reference
- `test-fixtures/bad/bad-structured-approval-missing-plan-ref --require-structured-evidence`: rejected unresolved local plan reference
- `test-fixtures/bad/bad-structured-readiness-empty-actions`: rejected empty structured readiness actions

## Final Commands

- `node scripts/check-intentos.mjs`: passed
- `npm run verify:governance`: passed
- `npm run verify:syntax`: passed
- `git diff --check`: passed
