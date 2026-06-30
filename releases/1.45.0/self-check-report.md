# Release 1.45.0 Self-Check Report

## Scope

1.45 adds a low-risk controlled apply candidate layer.

## Verification

- `node --check scripts/resolve-low-risk-apply-candidate.mjs`
- `node --check scripts/check-low-risk-apply-candidate.mjs`
- `node scripts/check-low-risk-apply-candidate.mjs examples/1.45-low-risk-apply-candidate`
- `node scripts/check-low-risk-apply-candidate.mjs test-fixtures/bad/bad-apply-candidate-authorizes-run`
- `node scripts/check-low-risk-apply-candidate.mjs test-fixtures/bad/bad-apply-candidate-broad-path`
- `node scripts/check-low-risk-apply-candidate.mjs test-fixtures/bad/bad-apply-candidate-high-risk`
- `node scripts/check-low-risk-apply-candidate.mjs .`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-dev-kit.mjs`
- `npm run verify`

## Result

Passed as part of the 1.42-1.45 integrated verification run.
