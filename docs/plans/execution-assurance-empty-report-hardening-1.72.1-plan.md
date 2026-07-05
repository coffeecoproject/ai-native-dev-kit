# Execution Assurance Empty-Report Hardening 1.72.1 Plan

## Purpose

1.72.1 closes a completion-check gap in 1.72.0.

1.72.0 added Execution Assurance Chain, but the checker allowed an empty project with no `execution-assurance-reports/*.md` to pass as a skipped check. That behavior is acceptable only for explicit asset-only maintenance checks, not for user-facing completion verification.

Core rule:

```text
No recorded Execution Assurance Report, no verified execution check.
```

## Scope

In scope:

- make `check-execution-assurance.mjs` fail by default when no reports exist;
- add explicit `--allow-empty` for asset-only maintenance checks;
- keep `done-check` and `verify-execution` strict by default;
- update self-checks so no-report checks are rejected;
- update package verification to avoid false green checks;
- move proof-chain commands out of the public first-step README command list;
- add release evidence for 1.72.1.

Out of scope:

- changing Execution Assurance report schema `1.72.0`;
- adding a new workflow layer;
- authorizing writes, commit, push, release, production, CI, hooks, secrets, migrations, payment, or provider actions;
- changing target-project behavior outside explicit workflow asset updates.

## Execution Plan

1. Update checker behavior.
   - Add `--allow-empty`.
   - Fail no-report checks by default.
   - Keep explicit reports strict.

2. Update self-check coverage.
   - Verify no-report target fails.
   - Verify `--allow-empty` remains available for source asset checks.
   - Verify CLI check aliases run against a target with recorded reports.

3. Update verification wiring.
   - Avoid source-root no-report success in `verify:governance`.
   - Keep strict examples and bad fixtures.

4. Update public documentation.
   - Keep first-step commands focused on `start`, `next`, and `doctor`.
   - Document saved report flow with `--out`.

5. Validate.
   - Run syntax checks.
   - Run no-report negative check.
   - Run strict positive examples.
   - Run bad fixtures.
   - Run `check-manifest`, `check-dev-kit`, and `npm run verify`.

## Acceptance Criteria

- `node scripts/cli.mjs done-check <empty-project>` fails.
- `node scripts/cli.mjs verify-execution <empty-project>` fails.
- `node scripts/check-execution-assurance.mjs <empty-project>` fails.
- `node scripts/check-execution-assurance.mjs <empty-project> --allow-empty` passes for asset-only maintenance checks.
- `node scripts/check-dev-kit.mjs` verifies the default no-report failure.
- `npm run verify` passes without relying on no-report success.
- README first-step commands do not require ordinary users to choose proof-chain commands.

## Boundary

This patch tightens verification behavior only. It does not approve implementation, target-project writes, commit, push, release, production, CI/hook mutation, secrets, migrations, payment, provider actions, or project authority transfer.
