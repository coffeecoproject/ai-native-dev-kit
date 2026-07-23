# IntentOS 1.115 `init-project` Structural Modularity Plan

Intent: modularize scripts/init-project.mjs into focused internal modules while preserving CLI arguments, output, plan and receipt formats, mutation ordering, rollback behavior, and exit codes

Task reference: task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e

## Scope

Split the current 4,651-line executable into focused internal modules while retaining `scripts/init-project.mjs` as the only public executable entry. Preserve every CLI route, serialized plan field and order, request-bound authority check, action and mutation order, receipt shape, stdout/stderr message, recovery rule, and process exit status.

## Boundaries

This is a repository-local structural refactor. It does not change product behavior, public API, database state, permissions, release policy, CI, hosted automation, or production. It does not authorize commit, push, release, or external operations. The two independent untracked drafts under `docs/plans/` remain excluded and untouched.

## Module Boundaries

1. `scripts/init-project.mjs` remains the executable shell and delegates exactly once to the CLI module.
2. `scripts/init-project/assets.mjs` owns starter/shared/governance asset selection, copy planning, baseline reconciliation, and version-record construction. It must not choose CLI routes or execute a controlled transaction.
3. `scripts/init-project/plan.mjs` owns deterministic plan/action construction, canonical IDs and digests, target fingerprints, and native-adoption assessment. It must not commit mutations.
4. `scripts/init-project/apply.mjs` owns apply validation, request-bound context, controlled update/bootstrap replay, journal/rollback/recovery orchestration, activation verification, and receipt construction. It must consume the exact plan and preserve transaction order.
5. `scripts/init-project/cli.mjs` owns argument routing, messages, output, and exit-code selection. It composes the modules without duplicating domain logic.

If dependency inspection shows that one proposed boundary would create a cycle or a broad shared-state object, keep that cohesive slice in its current owner and record the narrower boundary. Do not create a generic catch-all utility module.

## Implementation Sequence

1. Add a structural characteristic test proving one public entry, an explicit acyclic module graph, Manifest authority for every new source file, and no public import surface beyond the executable.
2. Extract deterministic plan construction and its directly required asset/configuration helpers, preserving function bodies and call order before attempting cleanup.
3. Extract controlled apply/bootstrap replay and receipt functions with explicit dependencies; preserve journal and mutation ordering exactly.
4. Move CLI routing last, after plan and apply contracts are stable, leaving the executable as a thin awaited delegation.
5. Add new modules to syntax and Manifest distribution checks without changing hosted automation defaults.
6. Run focused tests after each extraction; stop and correct the boundary on the first behavioral mismatch.

## Business Universe Scenario Review

- `coverage-scenario:8436e1d4a9c2ab91a6e545d4` — `ORIGIN_OR_ENTRY`, `PROJECT_RUNTIME_PATH`: No modular boundary may add, remove, rename, or reprioritize a CLI mode or change its usage exit status.
- `coverage-scenario:6b8a64e0ae567bd533f16b20` — `PROCESSING_OR_TRANSITION`, `PROJECT_RUNTIME_PATH`: A split module must not reorder or deduplicate actions differently or produce a different plan digest for the same source and target.
- `coverage-scenario:29c41b694e2a25b5fb5f6fb1` — `ELIGIBILITY_OR_VALIDATION`, `PROJECT_RUNTIME_PATH`: Refactoring must not weaken fail-closed checks, accept legacy file-authored approval, or authorize an unmatched plan.
- `coverage-scenario:53e237fc9cea90ed61e14285` — `MUTATION_OR_CORRECTION`, `PROJECT_RUNTIME_PATH`: No mutation may occur outside the approved graph or before its existing preconditions and journal state are established.
- `coverage-scenario:573d43f84fcad189e1e69a79` — `PROPAGATION_OR_SIDE_EFFECT`, `PROJECT_RUNTIME_PATH`: A non-empty or unsafe target must not be treated as a fresh project, and a partial bootstrap must not remain installed.
- `coverage-scenario:dca2a70d980c86f4a11c3ecc` — `DERIVED_RESULT`, `PROJECT_RUNTIME_PATH`: The split must not hide an error, move a message to the other stream, change a receipt field, or convert failure to success.
- `coverage-scenario:63fcddf585d8dd27f3a2b88d` — `OBSERVATION_OR_AUDIT`, `PROJECT_NATIVE_AUTOMATION`: Static import checks or fixture-only assertions cannot substitute for executable parity evidence.
- `coverage-scenario:6330c97be1602986d653660b` — `FAILURE_RETRY_OR_RECOVERY`, `PROJECT_RUNTIME_PATH`: Recovery must not accept a foreign journal, delete unrelated changes, overwrite a newer receipt, or report success before verification.
- `coverage-scenario:d93095e30021697e7b2145c0` — `TERMINATION_REVERSAL_OR_COMPENSATION`, `PROJECT_RUNTIME_PATH`: Rollback must not escape the target, remove unrelated content, or leave a partially activated project.

Generic high-impact surface review: existence leakage and error priority are not applicable because this local CLI refactor introduces no actor lookup or authorization result. Historical associations and audit before delete are not applicable because the candidate introduces no deletion rule or persisted business record. Backend authority is not applicable because the source of truth remains the same local executable and project-local transaction libraries; no frontend/backend capability boundary changes.

## Verification

- `node --test tests/project-entry-new-project-transaction.test.mjs`
- `node --test tests/controlled-apply-transaction.test.mjs`
- `node --test tests/project-entry-generated-parity.test.mjs`
- `npm run verify:project-entry`
- `npm run verify:consumer-chain:final`
- `npm run verify:syntax`
- `git diff --check`

These commands cover deterministic dry-run and plan-write parity; controlled apply authority, mutation order, rollback, interruption, and recovery; absent/empty/reviewed-non-empty bootstrap topology; activation, symlink race, orphan journals; generated-project distribution; Manifest syntax; and final Consumer Chain composition. The new structural characteristic test will be added during implementation and included in post-implementation Test Evidence.

## Rollback And Recovery

Before commit, reverse only this explicit structural patch if a characteristic or public-executable behavior test fails. Do not weaken a checker, change expected output to mask a regression, bypass request-bound authority, or delete a failed run to claim completion. No production rollback path is involved.

## Completion Boundary

Completion requires exact scope agreement, current post-implementation Test Evidence, Execution Assurance, Completion Evidence, Unified Closure, Manifest and Consumer Chain validation, strict runtime replay, and no unexpected unstaged or untracked files beyond the two preserved drafts. This plan does not approve commit or push.
