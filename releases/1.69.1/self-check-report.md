# 1.69.1 Self-Check Report

## Status

Passed.

## Checks Run

- `node --check scripts/cli.mjs`
- `node --check scripts/resolve-existing-rule-reconciliation.mjs`
- `node --check scripts/check-existing-rule-reconciliation.mjs`
- `node --check scripts/check-intentos.mjs`
- `node scripts/cli.mjs --version`
- `node scripts/check-manifest.mjs`
- `node scripts/check-existing-rule-reconciliation.mjs examples/1.66-existing-rule-reconciliation/governed-web-admin --require-structured-evidence`
- `node scripts/cli.mjs reconcile-rules . --auto-native`
- `node scripts/check-existing-rule-reconciliation.mjs .`
- `npm --silent run verify:governance`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Result

Passed.

## Notes

- `node scripts/check-intentos.mjs` passed, including the truncated extracted-rule reconciliation case that blocks selected native adoption.
- `node scripts/cli.mjs doctor examples/1.67-release-core-model/governed-existing-project-readonly --dry-run` showed the old-project adoption diagnosis path and skipped full missing-asset checks.
- `npm --silent run verify:governance` passed.
