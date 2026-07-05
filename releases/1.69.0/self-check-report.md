# 1.69.0 Self-Check Report

## Status

Passed.

## Checks Run

- `node --check scripts/cli.mjs`
- `node --check scripts/resolve-existing-rule-reconciliation.mjs`
- `node --check scripts/check-intentos.mjs`
- `node scripts/cli.mjs --version`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Result

Passed.

## Notes

- `node scripts/check-intentos.mjs` passed, including governed existing-project `doctor` behavior.
- `node scripts/check-intentos.mjs` passed, including governed existing-project `reconcile-rules --auto-native` behavior.
- `reconcile-rules --auto-native` remains read-only and does not write `native-migration-plans/`.
