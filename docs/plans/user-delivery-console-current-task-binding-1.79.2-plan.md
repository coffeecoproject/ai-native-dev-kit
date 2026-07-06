# IntentOS 1.79.2 User Delivery Console Current Task Binding Plan

## Goal

Prevent User Delivery Console from treating another task's valid completion
record as the current request's completion record.

## Scope

1. Bind `status --intent` to strict Completion Evidence by `intent_digest`.
2. Show other valid completion records as other-task records, not current-task
   done.
3. Remove raw internal state enums from the user-facing status card.
4. Let `status-check` validate assets installed under `.intentos/`.
5. Verify generated status cards through same-card `status --out` and
   `status-check` smoke.

## Out Of Scope

- Adding a new completion gate.
- Replacing Completion Evidence.
- Adding release approval, production approval, CI mutation, hook installation,
  or target-project writes.
- Solving fuzzy intent matching between semantically similar but textually
  different requests.

## Execution Plan

1. Update `resolve-user-delivery-console.mjs` so strict-passing Completion
   Evidence must match the current `--intent` digest before the card can return
   task-done status.
2. Add `PROJECT_HAS_OTHER_COMPLETION_RECORD` for projects that have valid
   completion records for another request.
3. Render user-facing current state and final check status as plain language.
4. Update `check-user-delivery-console.mjs` to reject raw internal enums in
   user-facing sections and to resolve required assets from `.intentos/`.
5. Update generated-project PR smoke and self-check smoke to write and check
   the same generated status card.
6. Update versions, manifest, release records, docs, templates, examples, and
   bad fixtures.

## Acceptance Plan

Run:

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

## Success Criteria

- A strict-passing Completion Evidence report for a different request does not
  make the current request done.
- User-facing sections avoid raw internal status enums.
- `.intentos/` installed assets are accepted by `status-check`.
- Generated-project smoke proves `status --out` and `status-check` work on the
  same card.
