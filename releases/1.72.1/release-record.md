# Release 1.72.1 - Execution Assurance Empty-Report Hardening

## Summary

1.72.1 hardens Execution Assurance checks after 1.72.0.

1.72.0 introduced the proof chain for execution-class work. 1.72.1 closes the gap where a no-report target could pass because the checker skipped report validation.

Core rule:

```text
No recorded Execution Assurance Report, no verified execution check.
```

## Changed

- `check-execution-assurance.mjs` now fails by default when no recorded `execution-assurance-reports/*.md` files exist.
- `execution-assurance-check`, `done-check`, and `verify-execution` inherit the stricter default behavior.
- `--allow-empty` is available only for explicit asset-only maintenance checks.
- `check-intentos` now verifies that no-report targets fail by default.
- CLI alias checks now run against a target with recorded reports instead of relying on source-root empty checks.
- Public README first-step commands now stay focused on `start`, `next`, and `doctor`.

## Allowed Claims

- IntentOS 1.72.1 can reject execution completion checks when no Execution Assurance Report exists.
- IntentOS 1.72.1 can still run explicit asset-only checks with `--allow-empty`.
- IntentOS 1.72.1 keeps 1.72.0 report schema compatibility.

## Forbidden Claims

- 1.72.1 does not prove product correctness.
- 1.72.1 does not approve implementation beyond recorded scope.
- 1.72.1 does not approve target-project writes, commit, push, release, production, deployment, CI mutation, hook mutation, migration, secrets, payment, provider action, or project authority transfer.
- `--allow-empty` is not proof that execution work is done.

## Evidence Status

- Checker behavior now distinguishes default completion verification from explicit asset-only checks.
- No-report targets fail by default in `check-execution-assurance.mjs`, `execution-assurance-check`, `done-check`, and `verify-execution`.
- `--allow-empty` remains explicit so source maintenance checks can verify installed assets without implying execution completion.
- `check-intentos` includes a negative no-report check and validates CLI aliases against an example that has a recorded Execution Assurance Report.
- `npm run verify` uses explicit `--allow-empty` only for source asset maintenance and relies on strict examples plus self-checks for completion evidence.

## Known Limitations

- 1.72.1 keeps the `execution_assurance_report` schema at `1.72.0`; it changes checker behavior, not report shape.
- Execution Assurance still validates recorded evidence. It does not independently inspect every runtime behavior or prove product correctness.
- `--allow-empty` is a maintenance escape hatch only. It must not be used as evidence that a task is complete.
- A passing report check does not approve commit, push, release, production, CI/hook mutation, secrets, migrations, provider actions, or follow-up work.

## Verification

Expected verification surface:

```bash
node --check scripts/check-execution-assurance.mjs
node scripts/check-execution-assurance.mjs /private/tmp/intentos-empty-review
node scripts/check-execution-assurance.mjs /private/tmp/intentos-empty-review --allow-empty
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-intentos.mjs
node scripts/check-manifest.mjs
npm run verify
git diff --check
```

## Boundary

This release changes verification behavior only. It does not write target files, approve implementation, approve commit or push, approve release or production, mutate CI/hooks, touch secrets, run migrations, call providers, or transfer project authority.
