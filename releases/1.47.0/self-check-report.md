# Self-Check Report 1.47.0

## Checks

```bash
node scripts/check-low-risk-apply-candidate.mjs examples/1.45-low-risk-apply-candidate --require-structured-evidence
node scripts/resolve-product-completeness.mjs examples/mvp-booking-web-app --evidence evidence/smoke-output.json
node scripts/resolve-product-completeness.mjs examples/mvp-cli-note-tool --evidence evidence/smoke-output.json
node scripts/check-mvp-example.mjs examples/mvp-booking-web-app
node scripts/check-mvp-example.mjs examples/mvp-dashboard-web-app
node scripts/check-mvp-example.mjs examples/mvp-cli-note-tool
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Result

Passed.

Additional checks run during close-out:

```bash
node scripts/check-product-completeness.mjs .
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-claim-control.mjs .
```

One calibration issue was found and fixed during review: `permissions` plural was added to the high-risk auth/permission surface so `database migration for payment permissions` is still classified as high-risk.

## Boundary

This self-check does not approve apply, implementation, release, production, CI changes, hooks, secrets, payment, permissions, migration, data changes, or Change Impact Coverage.
