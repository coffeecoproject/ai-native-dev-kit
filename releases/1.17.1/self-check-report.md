# 1.17.1 Self-Check Report

## Scope

1.17.1 calibrates the 1.17 Guided Baseline Selection Entry after review.

## Validated Checks

| Check | Result |
|---|---|
| `node scripts/cli.mjs baseline-decision .` | PASS |
| `node scripts/cli.mjs baseline-decision-check .` | PASS |
| `node scripts/check-guided-baseline-selection.mjs examples/1.17-guided-baseline-selection/new-miniprogram --strict` | PASS |
| `node scripts/check-fixtures.mjs` | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-dev-kit.mjs` | PASS |
| `npm run verify` | PASS |
| `git diff --check` | PASS |

## Boundary Confirmation

- BL2 is phrased as a candidate path for human review.
- Baseline Decision Cards are printed by default and saved only through explicit artifact creation.
- PR and release CI include explicit baseline-decision visibility.
- CODEOWNERS declares active maintainer ownership for governance-sensitive areas.
- No new pack, BL2 activation, implementation approval, release approval, production claim, or real-project validation was added.
