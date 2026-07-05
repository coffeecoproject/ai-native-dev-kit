# 1.18.0 Self-Check Report

## Scope

1.18.0 validates Guided Baseline Selection calibration after read-only project
trials.

## Validated Checks

| Check | Result |
|---|---|
| `node scripts/cli.mjs baseline-decision .` | PASS |
| `node scripts/cli.mjs baseline .` | PASS |
| `node scripts/cli.mjs baseline-decision-check .` | PASS |
| `node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict` | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-intentos.mjs` | PASS |
| `npm run verify` | PASS |
| `git diff --check` | PASS |

## Boundary Confirmation

- BL2 is still candidate-only.
- Current safe action and target candidate level are separate.
- Platform states do not approve platform activation.
- Mini Program cloud functions do not force a backend baseline.
- Internal-admin detection requires stronger admin-console evidence.
- No new pack, BL2 activation, target-project write approval, implementation
  approval, release approval, production claim, or real-project production
  validation was added.

