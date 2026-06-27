# 1.3.0 Self-check Report

## Human Summary

Final verification for 1.3.0 Guided Delivery Baseline.

## Required Checks

```bash
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
git diff --check
```

## Result

Passed.

## Verified On

2026-06-27.

## Results

| Check | Result |
|---|---|
| `node scripts/check-product-baseline.mjs .` | PASS |
| `node scripts/check-claim-control.mjs .` | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-fixtures.mjs` | PASS |
| `node scripts/check-dev-kit.mjs` | PASS |
| `git diff --check` | PASS |

## Notes

- Bad fixtures reject overclaimed release wording.
- Bad fixtures reject report-as-approval wording.
- Bad fixtures reject inferred environment/release assumptions without Assumption Register.
- Generated-project smoke includes product baseline and claim control checks.
