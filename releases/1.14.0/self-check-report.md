# Release 1.14.0 Self-Check Report

## Scope

Standard Baseline Pack Registry.

## Checks

```bash
node scripts/check-standard-baseline-pack.mjs .
node scripts/check-standard-baseline-selection.mjs .
node scripts/cli.mjs standard-baseline .
node scripts/cli.mjs baseline-packs .
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Result

PASS.

Validated in the release working session:

- `node scripts/check-standard-baseline-pack.mjs .`
- `node scripts/check-standard-baseline-selection.mjs .`
- `node scripts/check-standard-baseline-selection.mjs examples/1.14-standard-baseline-registry --strict --compare-resolver`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-manifest.mjs`
- `node scripts/check-dev-kit.mjs`
- `npm run verify`

Observed fixture coverage: 78 cases passed, including standard baseline good and bad cases.

## Boundary

This self-check does not claim production validation or commercial delivery readiness.
