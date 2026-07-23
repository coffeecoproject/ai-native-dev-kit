# IntentOS 1.118 Evidence Retention And Deduplication Implementation Plan

Intent: establish a forward-only evidence retention and deduplication rule for runtime state that preserves authoritative reports and the final trusted runtime while preventing duplicate aggregate logs, stale retry archives, and unbounded per-task evidence growth without rewriting released evidence

Intent digest: sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652

## Scope

Add a forward-only, repository-owned retention contract in `.intentos/evidence-retention-policy.json`; enforce it through `scripts/lib/evidence-retention.mjs` and `scripts/check-evidence-retention.mjs`; distribute those assets through `intentos-manifest.json` and `templates/workflow-version.json`; and characterize accepted and rejected states in `tests/evidence-retention.test.mjs`. The implementation also adds a bounded, semantically reviewed projection to `scripts/resolve-business-universe-coverage.mjs` so structured authority reports stay within the same policy budget without weakening full-repository discovery.

## Boundaries

This batch changes future repository-local evidence retention only. It does not rewrite released evidence, change business behavior, authorize external storage, CI, hooks, release, production, commit, or push. The independent Controlled Adoption draft remains untracked and excluded.

There is no permission model or remote actor in this local checker. Existence leakage, non-existence responses, and error priority are therefore not applicable; all findings expose repository-relative paths already visible to the local maintainer. There is no frontend/backend split: `scripts/lib/evidence-retention.mjs` is the backend authority for policy evaluation, while the CLI only renders its findings and exit status. No capability flag or UI-only decision can override it.

## Implementation Sequence

1. Record the 1.117-to-1.118 Work Queue transition.
2. Preserve released evidence before task 118 and establish current size observations without modifying those files.
3. Add `.intentos/evidence-retention-policy.json` with a forward-only cutoff and explicit budgets.
4. Add the pure evaluator `scripts/lib/evidence-retention.mjs` plus the strict entry `scripts/check-evidence-retention.mjs`.
5. Register source and generated-project distribution in `intentos-manifest.json`, `templates/workflow-version.json`, and `package.json`.
6. Add positive, negative, historical-preservation, bounded-report, and installed-project tests in `tests/evidence-retention.test.mjs`.
7. Generate current governance and verification evidence, with authority-bound semantic review rather than copied all-repository candidate payloads.
8. Retain only the final successful Runtime Trust archive and run the full closure chain.

## Business Universe Scenario Review

- `coverage-scenario:066f1fee0cdbf5f993e4686c` — `PROPAGATION_OR_SIDE_EFFECT`, `PROJECT_NATIVE_AUTOMATION`. Every newly generated project receives the retention policy, checker, documentation, and shared retention library through declared manifest projections. Reverse path reviewed: A missing or stale declaration must fail manifest or generated-project verification instead of silently omitting governance files.
- `coverage-scenario:a109f7bce060ab502118bb89` — `ELIGIBILITY_OR_VALIDATION`, `PROJECT_NATIVE_AUTOMATION`. The standard pre-runtime command invokes strict evidence-retention validation and propagates its non-zero exit status. Reverse path reviewed: An invalid retention state must stop pre-runtime verification; no alternate standard command may bypass the gate.
- `coverage-scenario:4959cf4953da04a02020517d` — `FAILURE_RETRY_OR_RECOVERY`, `PROJECT_NATIVE_AUTOMATION`. Evidence for tasks at or after 1.118 is checked for one final durable runtime, forbidden aggregate logs, exact raw duplicates, per-file limits, and task-total limits. Reverse path reviewed: Released evidence before 1.118 remains immutable and out of the new budget; the evaluator never deletes, truncates, uploads, or rewrites evidence.
- `coverage-scenario:c7983fd3a2b96b768140bff0` — `ORIGIN_OR_ENTRY`, `PROJECT_NATIVE_AUTOMATION`. The generated workflow contract names the retention policy, checker, documentation, and shared library as required project surfaces. Reverse path reviewed: Template drift or omission must be detected by manifest validation and generated-project characterization tests.
- `coverage-scenario:b378ce917c0d0bb34193ff31` — `OBSERVATION_OR_AUDIT`, `FIXTURE_OR_SEED_PATH`. Valid forward-only retention state and generated-project state pass deterministic tests and strict checking. Reverse path reviewed: Multiple final runs, aggregate logs, duplicate raw evidence, exceeded budgets, and unbound runtime directories each fail with a specific finding while preserving inputs.

## Verification

Run these project-native commands from the repository root after implementation and again in the final trusted runtime:

- `node --test tests/evidence-retention.test.mjs`
- `node --test tests/118-evidence-retention-governance-obligations.test.mjs`
- `node --test tests/business-universe-coverage.test.mjs`
- `node scripts/check-evidence-retention.mjs . --strict`
- `node scripts/check-manifest.mjs .`
- `npm run verify:pre-runtime`
- `npm run verify:candidate`
- `npm run verify:consumer-chain:final`
- `git diff --check`

## Failure Behavior

The checker reports every violating path and exits non-zero. It never deletes, truncates, rewrites, archives, or uploads evidence. Cleanup remains an explicit bounded task action after exact paths have been reviewed.

## Rollback And Recovery

Before commit, reverse only the explicit 1.118 implementation patch. Historical evidence is not a rollback target.

## Completion Boundary

Completion requires exact Git-bound scope, current-task Test Evidence, Execution Assurance, Completion Evidence, Closure, final Runtime Trust replay, final Consumer Chain, and no unexpected files beyond the preserved Controlled Adoption draft. This plan does not approve commit or push.
