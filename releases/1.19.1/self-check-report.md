# 1.19.1 Self-Check Report

## Scope

1.19.1 validates Baseline Selection Precision Metrics hardening.

## Validated Checks

| Check | Result |
|---|---|
| `node scripts/check-baseline-selection-precision.mjs .` | PASS |
| `node scripts/check-baseline-selection-precision.mjs . --skip-fixtures` | PASS |
| `node scripts/check-baseline-selection-precision.mjs . --json` | PASS |
| `node scripts/check-baseline-selection-precision.mjs test-fixtures/bad/bad-baseline-selection-scoreboard --scoreboard baseline-calibration-reports/scoreboard.md --skip-fixtures` | EXPECTED_FAIL |
| `npm run verify:syntax` | PASS |
| `npm run verify:baseline` | PASS |
| `npm run verify:release` | PASS |
| `npm run verify` | PASS |
| `git diff --check` | PASS |

## Verification Notes

- The bad scoreboard fixture failed as expected because it omits the Summary
  Metrics section, uses an invalid case id, and contains invalid
  `falsePositive` and `fixStatus` values.
- `node scripts/check-baseline-selection-precision.mjs . --json` produced
  machine-readable summary metrics for 12 total cases and 8 fixture cases.
- Remote GitHub Actions evidence still needs a run URL after push.

## Boundary Confirmation

- Summary metrics are calibration evidence only.
- The fixture registry does not approve target-project writes.
- JSON summary output does not prove production validation.
- BL2 is still candidate-only.
- No new pack, BL2 activation, target-project write approval, implementation
  approval, release approval, production claim, or real-project production
  validation was added.
