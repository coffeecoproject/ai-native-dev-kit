# Release 1.19.0: Baseline Selection Precision Calibration

## Human Summary

1.19.0 makes baseline selection accuracy measurable.

It keeps the same baseline-pack boundary, but adds a precision checker,
machine-checkable scoreboard rules, and synthetic calibration cases for known
recommendation-risk patterns.

## What Changed

- Added `scripts/check-baseline-selection-precision.mjs`.
- Made `baseline-calibration-reports/scoreboard.md` machine-checkable.
- Added synthetic calibration cases for:
  - Mini Program cloud functions
  - permission-only docs
  - active Web admin
  - production governed read-only projects
  - dirty worktrees with payment risk
  - monorepos with deferred platforms
  - backend data/API projects
  - empty unknown new projects
- Added `baseline-calibration-reports/2026-06-29-synthetic-precision-fixtures.md`.
- Added `docs/plans/baseline-selection-precision-calibration-1.19-plan.md`.
- Added a bad scoreboard fixture to prove invalid precision records fail.
- Integrated the precision checker into `npm run verify:baseline`.

## Allowed Claims

- 1.19.0 makes baseline-selection calibration more measurable.
- 1.19.0 checks false-positive, false-negative, and fix-status fields.
- 1.19.0 checks synthetic resolver cases for known baseline-selection risks.
- 1.19.0 improves evidence quality for future selector calibration.

## Forbidden Claims

- Do not claim 1.19.0 adds new baseline packs.
- Do not claim 1.19.0 promotes draft packs.
- Do not claim 1.19.0 makes BL2 default.
- Do not claim a BL2 candidate is selected or active.
- Do not claim target-project writes are approved.
- Do not claim implementation, release, production, security, privacy,
  compliance, payment, finance, tax, HR, migration, or irreversible data
  decisions are approved.
- Do not claim real-project production validation.

## Known Limitations

- Synthetic fixtures are useful calibration checks, but they are not real
  production validation.
- The scoreboard records expected versus actual selector behavior. It does not
  prove a real project is ready for BL2 or release.
- The checker covers known risk patterns; new project shapes can still require
  additional calibration rows and human review.
- Remote GitHub Actions evidence needs a run URL after this release is pushed
  and CI executes.

## Evidence Status

- Evidence is based on local repository checks, sanitized read-only reports,
  the precision scoreboard, and generated synthetic fixtures.
- No target project was modified by this release.
- No production or commercial readiness is claimed.

## Verification

Required checks:

```bash
node scripts/check-baseline-selection-precision.mjs .
node scripts/check-baseline-selection-precision.mjs . --skip-fixtures
npm run verify:baseline
npm run verify:release
npm run verify
git diff --check
```

## Next

Next work should use the precision scoreboard to decide whether a selector rule
needs calibration. Do not add more baseline packs until selector precision is
stable across recorded cases.
