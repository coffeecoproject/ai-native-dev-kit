# IntentOS 1.79.0 Release Record

## Theme

User Delivery Console.

## What Changed

1. Added `status` / `status-check` as the ordinary-user delivery status entry.
2. Added `delivery-status-cards/` as the saved status-card artifact directory.
3. Added User Delivery Console core docs, user docs, template, checklist, and agent prompt.
4. Added resolver and checker scripts for plain-language status, missing items, safe next actions, limited human decisions, technical trace, and no-authority boundaries.
5. Added positive and bad fixtures so the checker rejects internal jargon, overclaiming, and excessive user-decision burden.

## Allowed Claims

- IntentOS can summarize existing delivery evidence into one ordinary-user
  status card.
- `status` can answer where work stands, whether the current task can be
  treated as done within recorded evidence, what is missing, and what Codex can
  safely do next.
- `status-check` can validate saved User Delivery Console cards for required
  sections, plain-language user surface, limited decisions, technical trace,
  and no-authority boundaries.

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

- Resolver and checker assets are present.
- Source-repo self-check requires `status`, `status-check`, example validation,
  and bad fixture rejection.
- Manifest and workflow version assets include the new status card assets.
- Final command results are recorded in `releases/1.79.0/self-check-report.md`.

## Known Limitations

- See `releases/1.79.0/known-limitations.md`.
- User Delivery Console classifies from available source signals; missing
  lower-level evidence remains missing rather than inferred.
- Launch review readiness is not release approval.

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

User Delivery Console is a derived view only. It does not replace Completion Evidence, Execution Assurance, Release Plan, Launch Review, or any source evidence system.

It does not write target files, authorize apply, approve implementation, approve commit or push, approve release or production, mutate CI or hooks, replace lower-level evidence systems, prove real-user stability, or approve high-risk decisions.

## Acceptance

- Syntax checks include `resolve-user-delivery-console.mjs` and `check-user-delivery-console.mjs`.
- Governance verification runs `status` and `status-check`.
- Example verification runs the 1.79 appointment app status card.
- Bad fixtures reject internal jargon, overclaiming, and too many user decisions.
