# 1.67.2 Self-Check Report

## Status

Passed.

## Verified Checks

- `node --check scripts/check-release-plan.mjs`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/web-preview --require-structured-evidence`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/mini-program-review --require-structured-evidence`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/backend-api-handoff --require-structured-evidence`
- `node scripts/check-release-plan.mjs examples/1.67-release-core-model/governed-existing-project-readonly --require-structured-evidence`
- `node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-extra-dangerous-field`
- `node scripts/check-release-plan.mjs test-fixtures/bad/bad-release-plan-chinese-forbidden-claim`
- `node scripts/check-release-plan.mjs .`
- `node scripts/check-manifest.mjs`
- `npm --silent run verify:examples`
- `npm --silent run verify:governance`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Result

Pass. 1.67.2 rejects unsupported extra structured evidence fields, blocks Chinese unsafe release-plan claims, preserves strict positive example compatibility, passes source Release Plan and manifest checks, and keeps private governed-project smoke checks as optional local calibration rather than public required verification.
