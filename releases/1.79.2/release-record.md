# IntentOS 1.79.2 Release Record

## Theme

User Delivery Console Current Task Binding.

## What Changed

1. `status --intent` now requires strict Completion Evidence to match the
   current request intent before returning task-done status.
2. Valid completion records for other requests now produce
   `PROJECT_HAS_OTHER_COMPLETION_RECORD` instead of current-task done.
3. User-facing status cards render plain-language states instead of raw internal
   enums.
4. `status-check` required asset checks now support `.intentos/` installed
   assets.
5. Generated-project smoke now writes a status card with `--out` and checks the
   same card.

## Allowed Claims

- IntentOS can show a plain-language status card for the current request.
- `status` can distinguish a current-request completion record from another
  task's completion record.
- `status-check` can validate saved User Delivery Console cards without
  requiring root-level source assets when the project uses `.intentos/`.

## Forbidden Claims

- This release does not add a new completion gate.
- This release does not replace Completion Evidence, Execution Assurance,
  Release Plan, Launch Review, or lower-level source systems.
- This release does not write target files.
- This release does not approve implementation.
- This release does not approve commit or push.
- This release does not approve release or production.
- This release does not mutate CI or hooks.
- This release does not prove real-user stability.
- This release does not approve security, privacy, compliance, payment,
  permission, migration, legal, tax, finance, or production-risk decisions.

## Evidence Status

- Resolver checks strict Completion Evidence and current intent digest before
  task-done status.
- Checker rejects raw internal status enums in user-facing sections.
- Generated-project smoke writes and checks one generated status card.
- Manifest and version sources are updated to `1.79.2`.

## Known Limitations

- See `releases/1.79.2/known-limitations.md`.
- Intent matching is digest-based and intentionally conservative.
- Semantically similar but textually different intents may need the user or
  Codex to restate the canonical task intent.

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

User Delivery Console remains a derived status view. Completion Evidence remains
the lower-level source system for task-completion claims.

It does not write target files, authorize apply, approve implementation,
approve commit or push, approve release or production, mutate CI or hooks,
replace lower-level evidence systems, prove real-user stability, or approve
high-risk decisions.
