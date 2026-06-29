# 1.19.0 Self-Check Report

## Scope

1.19.0 validates Baseline Selection Precision Calibration.

## Validated Checks

| Check | Result |
|---|---|
| `node scripts/check-baseline-selection-precision.mjs .` | PASS |
| `node scripts/check-baseline-selection-precision.mjs . --skip-fixtures` | PASS |
| `node scripts/check-baseline-selection-precision.mjs test-fixtures/bad/bad-baseline-selection-scoreboard --scoreboard baseline-calibration-reports/scoreboard.md --skip-fixtures` | EXPECTED_FAIL |
| `npm run verify:syntax` | PASS |
| `npm run verify:baseline` | PASS |
| `npm run verify:release` | PASS |
| `npm run verify` | PASS |
| `git diff --check` | PASS |

## Verification Notes

- `npm run verify` completed locally after the 1.19.0 changes.
- The bad scoreboard fixture failed with invalid case id, invalid
  `falsePositive`, and invalid `fixStatus` errors as expected.
- Remote GitHub Actions evidence still needs a run URL after push.

## Boundary Confirmation

- Precision fixtures are calibration checks only.
- The scoreboard does not prove production validation.
- BL2 is still candidate-only.
- No new pack, BL2 activation, target-project write approval, implementation
  approval, release approval, production claim, or real-project production
  validation was added.
