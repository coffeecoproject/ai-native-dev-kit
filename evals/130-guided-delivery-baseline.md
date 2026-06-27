# Eval 130: Guided Delivery Baseline

## Human Summary

The phase is successful if Dev Kit can prove its product boundary and claim boundary with deterministic checks.

## Acceptance Checks

| Check | Command / Evidence | Expected |
|---|---|---|
| Product baseline | `node scripts/check-product-baseline.mjs .` | PASS |
| Claim control | `node scripts/check-claim-control.mjs .` | PASS |
| Manifest | `node scripts/check-manifest.mjs` | PASS |
| Fixtures | `node scripts/check-fixtures.mjs` | PASS |
| Dev Kit self-check | `node scripts/check-dev-kit.mjs` | PASS |
| Syntax | `node --check scripts/check-product-baseline.mjs` and `node --check scripts/check-claim-control.mjs` | PASS |

## Negative Checks

| Bad Fixture | Expected Failure |
|---|---|
| `test-fixtures/bad/bad-overclaimed-release` | overclaimed production / guarantee wording rejected |
| `test-fixtures/bad/bad-report-as-approval` | report-as-approval rejected |
| `test-fixtures/bad/bad-unmarked-assumption` | missing assumption register rejected |
