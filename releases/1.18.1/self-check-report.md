# 1.18.1 Self-Check Report

## Scope

1.18.1 validates Guided Baseline Selection check hardening.

## Validated Checks

| Check | Result |
|---|---|
| `npm run verify:syntax` | PASS |
| `npm run verify:baseline` | PASS |
| `npm run verify:industrial` | PASS |
| `npm run verify:examples` | PASS |
| `npm run verify:release` | PASS |
| `npm run verify` | PASS |
| `node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict` | PASS |
| `node scripts/check-guided-baseline-selection.mjs test-fixtures/bad/bad-guided-baseline-missing-platform-states` | EXPECTED_FAIL |
| `node scripts/check-guided-baseline-selection.mjs test-fixtures/bad/bad-guided-baseline-invalid-platform-state` | EXPECTED_FAIL |
| `git diff --check` | PASS |

## Verification Notes

- `npm run verify` completed locally after the 1.18.1 changes.
- The two bad fixtures failed with Platform States errors as expected.
- Remote GitHub Actions evidence still needs a run URL after push.

## Boundary Confirmation

- Platform States are required and checked.
- Platform States do not approve platform activation.
- BL2 is still candidate-only.
- The precision scoreboard does not prove production validation.
- No new pack, BL2 activation, target-project write approval, implementation
  approval, release approval, production claim, or real-project production
  validation was added.
