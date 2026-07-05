# 1.17.0 Self-Check Report

## Scope

1.17.0 adds Guided Baseline Selection Entry.

The release is complete only if the new entry is readable for users and bounded for Codex.

## Validated Checks

| Check | Result |
|---|---|
| `node --check scripts/resolve-guided-baseline-selection.mjs` | PASS |
| `node --check scripts/check-guided-baseline-selection.mjs` | PASS |
| `node scripts/cli.mjs baseline-decision .` | PASS |
| `node scripts/cli.mjs baseline-decision-check .` | PASS |
| 1.17 examples strict check | PASS |
| bad fixtures | PASS: unsafe cards fail for expected reasons |
| `node scripts/check-fixtures.mjs` | PASS |
| `node scripts/check-manifest.mjs` | PASS |
| `node scripts/check-intentos.mjs` | PASS |
| `npm run verify` | PASS |
| `git diff --check` | PASS |

## Boundary Confirmation

- BL2 is not default.
- Standard packs are not all selected by default.
- Industrial packs are candidate-only.
- Decision cards do not approve target-project writes.
- Decision cards do not approve implementation.
- Decision cards do not approve release or production.
- Decision cards do not approve high-risk domain decisions.
- Existing governed projects stay read-only first.
- Production-sensitive projects do not get direct init/update recommendations.
- Dirty worktrees stop before writes.
