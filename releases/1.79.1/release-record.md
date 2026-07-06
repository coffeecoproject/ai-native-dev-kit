# IntentOS 1.79.1 Release Record

## Theme

User Delivery Console Evidence Validation.

## What Changed

1. `status` no longer treats text-only Completion Evidence signals as task done.
2. User Delivery Console now calls the strict Completion Evidence checker before returning `TASK_DONE_WITH_EVIDENCE`.
3. Task Completion now separates verification planning from actual test/check evidence.
4. PR generated-project smoke Execution Assurance now includes the top-level `intent_digest` required by the 1.78.2 contract.
5. README capability tables now list User Delivery Console as a first-class capability.

## Allowed Claims

- IntentOS can show an ordinary-user delivery status card through `status`.
- `status` can classify task done only when a strict Completion Evidence report passes.
- `status` can distinguish a prepared verification plan from recorded test/check evidence.
- `status-check` can reject cards that merge verification planning and actual evidence into one user-facing field.

## Forbidden Claims

- This release does not add a new completion gate.
- This release does not replace Completion Evidence, Execution Assurance, Release Plan, Launch Review, or lower-level source systems.
- This release does not write target files.
- This release does not approve implementation.
- This release does not approve commit or push.
- This release does not approve release or production.
- This release does not mutate CI or hooks.
- This release does not prove real-user stability.
- This release does not approve security, privacy, compliance, payment, permission, migration, legal, tax, finance, or production-risk decisions.

## Evidence Status

- Resolver uses strict Completion Evidence checks before returning task-done status.
- Checker requires split task-completion fields for verification plan, test/check evidence, and strict completion status.
- Positive and bad 1.79 User Delivery Console fixtures are updated to the split field model.
- PR generated-project smoke aligns with the Execution Assurance `intent_digest` schema contract.

## Known Limitations

- See `releases/1.79.1/known-limitations.md`.
- User Delivery Console remains a derived view and still depends on lower-level records being present and valid.
- Launch review readiness remains review preparation, not release approval.

## Verification

Expected local verification:

```bash
node --check scripts/resolve-user-delivery-console.mjs
node --check scripts/check-user-delivery-console.mjs
node scripts/cli.mjs status . --intent "维护 IntentOS 普通用户交付状态"
node scripts/cli.mjs status-check .
node scripts/check-user-delivery-console.mjs examples/1.79-user-delivery-console/appointment-app
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Boundary

User Delivery Console remains a derived status view. Strict Completion Evidence remains the lower-level source system for task-completion claims.

It does not write target files, authorize apply, approve implementation, approve commit or push, approve release or production, mutate CI or hooks, replace lower-level evidence systems, prove real-user stability, or approve high-risk decisions.
