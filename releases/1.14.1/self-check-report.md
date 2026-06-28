# Release 1.14.1 Self-Check Report

## Human Summary

1.14.1 verifies that the 1.14 standard baseline registry hardening is present and bounded.

## Checks

| Check | Status | Evidence |
|---|---|---|
| Version files updated | PASS | `VERSION.md`, `package.json`, `dev-kit-manifest.json`, `templates/workflow-version.json` |
| Lower-level resolver deprecation | PASS | `scripts/resolve-baseline-packs.mjs` |
| Strict standard pack metadata | PASS | `standard-baseline-packs/schema/standard-pack.schema.json`, `scripts/check-standard-baseline-pack.mjs` |
| Selected profile validation | PASS | `scripts/check-standard-baseline-selection.mjs` |
| URL false-positive calibration | PASS | `scripts/check-standard-baseline-pack.mjs` |
| Negative fixtures | PASS | `test-fixtures/bad/bad-standard-pack-unknown-field`, `test-fixtures/bad/bad-standard-selection-unknown-profile` |
| Full verification | PASS | `node scripts/check-fixtures.mjs`, `node scripts/check-manifest.mjs`, `node scripts/check-dev-kit.mjs`, `npm run verify`, `git diff --check` |

## Boundary

- No new packs.
- No draft promotion.
- No BL2 default.
- No target-project writes.
- No implementation, release, production, compliance, security, or privacy approval.
