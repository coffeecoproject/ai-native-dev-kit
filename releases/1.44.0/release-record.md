# Release 1.44.0: Real MVP Example Evidence

## Summary

1.44.0 adds a runnable local MVP example so the ordinary-user path is tested against product code, not only workflow records.

## What Changed

- Added Real MVP Example Evidence governance, docs, template, checklist, and prompt.
- Added `mvp-example-check`.
- Added `examples/mvp-booking-web-app` with static web app code and smoke test.

## Boundary

- The MVP example is local demo evidence only.
- It does not approve production release.
- It does not prove real-user adoption.

## Allowed Claims

- This release includes a runnable local booking MVP example.
- The example has a smoke test.

## Forbidden Claims

- Do not claim this proves production readiness.
- Do not claim this proves real-user adoption.

## Evidence Status

| Evidence | Status |
|---|---|
| MVP example files | Local repository evidence |
| Smoke test | Local repository evidence |
| MVP checker | Local repository evidence |
| Full verification | See `releases/1.44.0/self-check-report.md` |

## Known Limitations

- The example is deliberately simple and local.
- It does not include persistence, auth, payments, SMS, backend, or deployment.

## Verification

- `node scripts/check-mvp-example.mjs examples/mvp-booking-web-app`
- `npm test --prefix examples/mvp-booking-web-app`
- `node scripts/check-dev-kit.mjs`
