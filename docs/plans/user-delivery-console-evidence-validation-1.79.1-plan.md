# IntentOS 1.79.1 User Delivery Console Evidence Validation Plan

## Goal

Tighten User Delivery Console so ordinary users are not misled by stale,
text-only, or incomplete completion signals.

The patch keeps `status` as a derived view. It does not add a new completion
gate and does not replace lower-level source systems.

## Scope

1. Treat task-done status as valid only when strict Completion Evidence checks
   pass.
2. Separate verification planning from actual test/check evidence in the
   user-facing Task Completion section.
3. Align generated-project PR smoke with the Execution Assurance
   `intent_digest` contract.
4. Add README capability visibility for User Delivery Console.
5. Add release evidence and self-check coverage for the patch.

## Out Of Scope

- Creating missing lower-level evidence.
- Running project tests.
- Approving implementation, commit, push, release, production, CI, hooks, or
  high-risk decisions.
- Turning User Delivery Console into an authoritative gate.

## Execution Plan

1. Update `resolve-user-delivery-console.mjs` to call
   `check-completion-evidence.mjs` with strict flags before returning task-done
   status.
2. Update Task Completion output fields:
   - verification plan prepared;
   - test/check evidence recorded;
   - final completion record strict-check status.
3. Update `check-user-delivery-console.mjs` to require the split fields and
   reject the old merged verification-evidence field.
4. Update templates, examples, bad fixtures, docs, checklist, and prompt.
5. Patch PR generated-project smoke Execution Assurance JSON with top-level
   `intent_digest`.
6. Update version files, manifest, release records, and self-check expectations.

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

- `status` does not claim task done from ready-looking text alone.
- Completion Evidence strict checker failures result in a non-done state.
- User-facing output distinguishes plan prepared from evidence recorded.
- The generated-project PR smoke Execution Assurance matches the current schema.
- Full IntentOS verification passes.
