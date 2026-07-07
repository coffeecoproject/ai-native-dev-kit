# IntentOS 1.79.3 Release Record

## Theme

User Delivery Console Verification Note Polish.

## What Changed

1. `testCheckEvidenceRecorded` now depends only on real
   `test-evidence-reports/` artifacts.
2. `--verification` free text is shown as a separate user verification note.
3. User Delivery Console cards include an explicit user verification note row.
4. `status-check` and `check-intentos` verify that user notes do not count as
   Test Evidence.
5. `1.79.2` self-check evidence now records `git diff --check`.

## Allowed Claims

- IntentOS can distinguish a user verification note from formal Test Evidence.
- `status` can show that a user note exists without claiming test/check evidence
  has been recorded.
- `status-check` can validate that the user-facing card keeps those concepts
  separate.

## Forbidden Claims

- This release does not add a new completion gate.
- This release does not replace Test Evidence.
- This release does not replace Completion Evidence, Execution Assurance,
  Release Plan, Launch Review, or lower-level source systems.
- This release does not run tests.
- This release does not write target files.
- This release does not approve implementation.
- This release does not approve commit or push.
- This release does not approve release or production.
- This release does not mutate CI or hooks.
- This release does not prove real-user stability.

## Evidence Status

- Resolver schema is updated to `1.79.3`.
- User-facing card includes the user verification note row.
- Checker validates the new row and JSON field.
- Checker regression proves `--verification "npm run verify passed"` does not
  set `testCheckEvidenceRecorded` to `Yes` without a Test Evidence report.
- Manifest and version sources are updated to `1.79.3`.

## Known Limitations

- See `releases/1.79.3/known-limitations.md`.
- A user verification note remains context only. It is not command evidence and
  is not a substitute for Test Evidence Binding.

## Verification

Expected local verification:

```bash
node --check scripts/resolve-user-delivery-console.mjs
node --check scripts/check-user-delivery-console.mjs
node scripts/cli.mjs status . --intent "维护 IntentOS 普通用户交付状态"
node scripts/cli.mjs status . --intent "maintain IntentOS ordinary user delivery status" --verification "npm run verify passed" --json
node scripts/cli.mjs status-check .
node scripts/check-user-delivery-console.mjs examples/1.79-user-delivery-console/appointment-app
node scripts/check-user-delivery-console.mjs .
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Boundary

User Delivery Console remains a derived status view. Test Evidence and
Completion Evidence remain the lower-level source systems for verification and
task-completion claims.
