# Self-Check Report: 1.12.0

## Human Summary

1.12.0 verification passed. The release has source assets, manifest coverage, standalone 1.12 checker examples, negative fixtures, full intentos self-check, and release-level verify coverage.

## Commands

```bash
node --check scripts/check-guided-delivery-loop.mjs
node --check scripts/check-change-boundary.mjs
node --check scripts/check-baseline-state.mjs
node scripts/check-guided-delivery-loop.mjs examples/1.12-change-boundary-baseline-state
node scripts/check-change-boundary.mjs examples/1.12-change-boundary-baseline-state --report change-boundary-reports/001-appointment-first-slice.md
node scripts/check-baseline-state.mjs examples/1.12-change-boundary-baseline-state --report baseline-state-reports/001-no-code-baseline.md
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Result

Status: PASS

## Notes

- `node scripts/check-intentos.mjs` passed.
- `npm run verify` passed.
- Positive examples passed.
- Negative fixtures failed for the expected reasons.
- `git diff --check` passed.
