# Release 1.18.1: Guided Baseline Selection Check Hardening

## Human Summary

1.18.1 closes the review gaps from 1.18.0.

It makes Platform States enforceable, splits the long verify command into clear
phases, and starts a precision scoreboard for baseline-selection calibration.

## What Changed

- Made `Platform States` a required Baseline Decision Card section.
- Added Platform States validation for required profile rows.
- Added Platform States enum validation for:
  - `selected-confirmed`
  - `selected-inferred`
  - `present-needs-confirmation`
  - `present-inactive-or-deferred`
  - `not-detected`
- Added detected/selected profile consistency checks.
- Updated guided baseline examples to include Platform States.
- Added bad fixtures for missing and invalid Platform States.
- Split `npm run verify` into:
  - `verify:syntax`
  - `verify:baseline`
  - `verify:industrial`
  - `verify:examples`
  - `verify:release`
- Added `baseline-calibration-reports/scoreboard.md` as the precision scoreboard.

## Allowed Claims

- 1.18.1 makes Platform States checkable.
- 1.18.1 improves Baseline Decision Card completeness.
- 1.18.1 improves verify maintainability without removing release checks.
- 1.18.1 starts a precision scoreboard for calibration evidence.

## Forbidden Claims

- Do not claim 1.18.1 adds new baseline packs.
- Do not claim 1.18.1 promotes draft packs.
- Do not claim 1.18.1 makes BL2 default.
- Do not claim a BL2 candidate is selected or active.
- Do not claim target-project writes are approved.
- Do not claim implementation, release, production, security, privacy,
  compliance, payment, finance, tax, HR, migration, or irreversible data
  decisions are approved.
- Do not claim real-project production validation.

## Evidence Status

- Evidence is based on local repository checks, existing sanitized read-only
  calibration reports, synthetic fixtures, and the new precision scoreboard.
- No target project was modified by this release.
- No production or commercial readiness is claimed.

## Known Limitations

- Platform States are required and checked, but they remain recommendation
  evidence and still require human confirmation for real project adoption.
- The precision scoreboard records calibration status only; it is not
  production validation.
- Remote GitHub Actions evidence needs a run URL after this release is pushed
  and CI executes.

## CI Evidence

- Local verification is recorded in `releases/1.18.1/self-check-report.md`.
- Remote GitHub Actions run URL is not recorded in this pre-push local release
  record. Add the run URL after remote CI executes if this release is audited
  through GitHub Actions.

## Verification

Required checks:

```bash
npm run verify:syntax
npm run verify:baseline
npm run verify:industrial
npm run verify:examples
npm run verify:release
npm run verify
git diff --check
```

## Next

The next phase should continue precision calibration. Do not add more baseline
packs until selector precision is stable enough across sanitized read-only
cases.
