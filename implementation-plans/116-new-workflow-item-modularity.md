# IntentOS 1.116 `new-workflow-item` Structural Modularity Plan

Intent: modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes

Task reference: task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf

## Scope

Reduce the 2,349-line executable to a thin public entry and focused internal modules. Preserve the ordered 63-type registry, all 223 aliases, argument parsing, canonicalization, names and paths, explicit and inferred references, review-context binding, template choice, placeholder filling, frontmatter, safe-write checks, terminal streams and messages, and process exit status.

The reviewed execution scope also includes the task handoff record `work-queue-transitions/004-init-project-to-new-workflow-item-modularity.md`, which transfers the current structural-governance lane without changing runtime behavior.

The task-specific evidence scope includes `tests/116-new-workflow-item-governance-obligations.test.mjs` for the conservative queue-transition and recovery obligations; public CLI parity remains owned by `tests/new-workflow-item-characterization.test.mjs`.

## Boundaries

This is a repository-local structural refactor. It does not change artifact schemas, workflow semantics, public commands, data, permissions, release policy, CI, hosted automation, or production. It does not authorize commit, push, release, or external operations. The two independent untracked drafts under `docs/plans/` remain excluded and untouched.

## Module Boundaries

1. `scripts/new-workflow-item.mjs` remains the only executable public entry and delegates once to the CLI module.
2. `scripts/new-workflow-item/registry.mjs` owns the ordered canonical type registry, alias registry, and canonical type lookup. It does not parse process arguments or write files.
3. `scripts/new-workflow-item/references.mjs` owns reference validation, inference, digest and review-context binding. It does not select templates or emit terminal output.
4. `scripts/new-workflow-item/fillers.mjs` owns deterministic template/frontmatter placeholder filling for every canonical artifact type. It does not choose output paths or write files.
5. `scripts/new-workflow-item/cli.mjs` owns argument parsing, orchestration, safe target resolution, the single write, messages, and exit selection. It consumes the other modules without duplicating their registries or filler dispatch.

If extraction reveals a cycle or a broad shared mutable context, keep the cohesive functions together and record the narrower boundary. Do not create a generic catch-all utility module.

## Implementation Sequence

1. Keep the passing 63-type/223-alias characterization test as the immutable behavior oracle.
2. Extract the canonical registries and lookup without changing declaration order or aliases; replay characterization.
3. Extract reference inference and authority helpers by moving bodies intact; replay characterization.
4. Extract filler dispatch and filler functions without cleanup, renaming, or reordering; replay characterization.
5. Move CLI orchestration last and leave the executable as a thin awaited delegation; replay characterization.
6. Register new source files in Manifest and syntax checks, then verify source and installed-project distribution parity.
7. Stop on the first path, content, output, exit, registry-digest, or alias-digest mismatch and correct the boundary before continuing.

## Business Universe Scenario Review

- `coverage-scenario:5d5dd7253dea631fb8dd1d9c` / `ORIGIN_OR_ENTRY` / `PROJECT_RUNTIME_PATH`: No registered type may disappear, reorder, or silently change its target contract.
- `coverage-scenario:a23f1d0a5d1c735956d2048a` / `ELIGIBILITY_OR_VALIDATION` / `PROJECT_RUNTIME_PATH`: Unknown types remain rejected and aliases may not redirect to a different canonical type.
- `coverage-scenario:6cfe1456fd67ead5f7a09c69` / `PROCESSING_OR_TRANSITION` / `PROJECT_RUNTIME_PATH`: Missing or mismatched references retain their existing failure or fallback behavior.
- `coverage-scenario:4e651a6e949e86963dba46f4` / `DERIVED_RESULT` / `PROJECT_RUNTIME_PATH`: No filler may omit fields, change ordering, or introduce cross-type content drift.
- `coverage-scenario:fca470fa395fd308540374ea` / `MUTATION_OR_CORRECTION` / `PROJECT_RUNTIME_PATH`: Existing targets, unsafe paths, and invalid writes remain fail-closed without partial output.
- `coverage-scenario:bb941a6ee7bc281b6819b2ed` / `FAILURE_RETRY_OR_RECOVERY` / `PROJECT_RUNTIME_PATH`: A failed invocation may not report success or leave a retry-obscuring partial artifact.
- `coverage-scenario:75d81144f6ee703273185d04` / `OBSERVATION_OR_AUDIT` / `PROJECT_NATIVE_AUTOMATION`: Static structure alone cannot substitute for executable behavior parity.

## Generic High-Impact Surface Review

Permission existence leakage and error priority are not applicable: this local generator has no actor lookup or authorization branch, and the refactor preserves the same local validation order. Historical associations, audit-before-delete, and destructive deletion are not applicable: the command creates one new file and already refuses overwrite; the candidate adds no delete operation. Frontend/backend consistency is not applicable: there is no frontend or backend split; backend authority and backend capability are absent, and the sole authority remains the same local CLI entry plus project-local authority libraries. Release and production behavior remain explicitly out of scope.

## Verification

- `node --test tests/new-workflow-item-characterization.test.mjs`
- `npm run verify:syntax`
- project Manifest authority and generated-project parity checks
- `npm run verify:consumer-chain:final`
- strict Verification Runtime Manifest replay
- final Change Boundary, Change Impact, Test Evidence, Execution Assurance, Completion, Closure, Runtime Hygiene, Release Topology, and Release Evidence checks
- `git diff --cached --check` before any later commit request

## Rollback And Recovery

Before commit, reverse only the explicit structural patch if characterization fails. Do not weaken the test, change expected digests to accommodate drift, bypass path or authority checks, or retain a partial extraction. No production rollback path is involved.

## Completion Boundary

Completion requires exact Git-bound scope, all 18 verification obligations mapped to current evidence, source and installed parity, full workflow replay, and no unexpected unstaged or untracked files beyond the two preserved drafts. This plan does not approve commit or push.
