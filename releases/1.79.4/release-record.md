# IntentOS 1.79.4 Release Record

## Theme

User Delivery Console Source Signal Calibration.

## What Changed

1. User Delivery Console now computes current-task source signals from
   `--intent`.
2. Business Rule Closure, Change Impact Coverage, Verification Plan, Test
   Evidence, and Execution Assurance only make user-facing fields show `Yes`
   when they match the current request.
3. Other-task source records remain visible in Technical Trace and JSON
   `sourceSignals`, but no longer count as current-task evidence.
4. `status-check` and `check-intentos` include wrong-task source-signal
   regression coverage.
5. The `1.80` Release Evidence Gate execution and acceptance plan is added as a
   plan-only document.

## Allowed Claims

- IntentOS can distinguish current-task intermediate source evidence from
  other-task source records in User Delivery Console.
- `status` can show other-task records without making the current task appear
  more complete than it is.
- `sourceSignals` can be used as a read-only trace explaining why user-facing
  fields are `Yes` or `No`.

## Forbidden Claims

- This release does not add a new completion gate.
- This release does not implement the `1.80` Release Evidence Gate.
- This release does not replace lower-level source systems.
- This release does not write target files.
- This release does not approve implementation.
- This release does not approve commit or push.
- This release does not approve release or production.
- This release does not mutate CI or hooks.
- This release does not prove real-user stability.

## Evidence Status

- Resolver schema is updated to `1.79.4`.
- Resolver JSON includes `sourceSignals`.
- Wrong-task examples keep Verification Plan, Test Evidence, and Execution
  Assurance user-facing fields as `No`.
- Technical Trace distinguishes current-task and other-task source records.
- Manifest and version sources are updated to `1.79.4`.

## Known Limitations

- See `releases/1.79.4/known-limitations.md`.
- Intent matching is still digest-based and conservative.
- Source records without machine-readable evidence cannot be current-task
  matched.

## Verification

Expected local verification:

```bash
node --check scripts/resolve-user-delivery-console.mjs
node --check scripts/check-user-delivery-console.mjs
node scripts/cli.mjs status . --intent "维护 IntentOS 普通用户交付状态"
node scripts/resolve-user-delivery-console.mjs examples/1.78-completion-evidence-gate/appointment-service-time --intent "different task" --json
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

User Delivery Console remains a derived status view. It does not approve
implementation, commit, push, release, production, CI, hooks, secrets,
migrations, payment, permissions, compliance, or high-risk decisions.
