# Release 1.19.1: Baseline Selection Precision Metrics

## Human Summary

1.19.1 hardens the 1.19 precision calibration layer.

It adds scoreboard summary metrics, externalizes the synthetic fixture registry,
adds JSON summary output, and makes the precision check visible as its own CI
step.

## What Changed

- Added `Summary Metrics` to `baseline-calibration-reports/scoreboard.md`.
- Updated `scripts/check-baseline-selection-precision.mjs` to recompute and
  validate scoreboard summary metrics.
- Added `baseline-calibration-reports/precision-fixtures.json` as the synthetic
  fixture registry.
- Updated the precision checker to load expected fixture case ids from the
  registry instead of keeping the required list inline.
- Added precision checker JSON summary output with computed metrics, registry
  path, expected fixture case ids, and executed fixture case ids.
- Added explicit `Baseline selection precision check` steps to PR and release
  workflows.

## Allowed Claims

- 1.19.1 makes precision scoreboard metrics checkable.
- 1.19.1 makes synthetic fixture case ids easier to extend.
- 1.19.1 makes precision evidence easier to inspect in CI.
- 1.19.1 improves JSON evidence for release review.

## Forbidden Claims

- Do not claim 1.19.1 adds new baseline packs.
- Do not claim 1.19.1 promotes draft packs.
- Do not claim 1.19.1 makes BL2 default.
- Do not claim a BL2 candidate is selected or active.
- Do not claim target-project writes are approved.
- Do not claim implementation, release, production, security, privacy,
  compliance, payment, finance, tax, HR, migration, or irreversible data
  decisions are approved.
- Do not claim real-project production validation.

## Known Limitations

- Summary metrics are derived from recorded calibration rows; they are not a
  substitute for real project review.
- The fixture registry lists expected cases, but the synthetic project builders
  still live in the checker implementation.
- Synthetic fixtures do not prove production readiness.
- Remote GitHub Actions evidence needs a run URL after this release is pushed
  and CI executes.

## Evidence Status

- Evidence is based on local repository checks, the precision scoreboard,
  synthetic fixtures, and CI workflow configuration.
- No target project was modified by this release.
- No production or commercial readiness is claimed.

## Verification

Required checks:

```bash
node scripts/check-baseline-selection-precision.mjs .
node scripts/check-baseline-selection-precision.mjs . --skip-fixtures
node scripts/check-baseline-selection-precision.mjs . --json
npm run verify:baseline
npm run verify:release
npm run verify
git diff --check
```

## Next

Next work should move to old-project runtime governance only after precision
metrics remain stable. Do not add more baseline packs until selector precision
continues to hold across recorded cases.
