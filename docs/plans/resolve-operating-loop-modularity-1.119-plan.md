# IntentOS 1.119 Resolve Operating Loop Modularity Plan

## Status

Active governed structural-refactor plan.

## Intent

Modularize `scripts/resolve-operating-loop.mjs` into cohesive internal modules while preserving workflow state, public CLI arguments, command output, subprocess ordering, exit codes, generated-project distribution, and resolver behavior.

## Why This File Needs A Split

The resolver had grown to 2,015 lines and mixed CLI orchestration, source execution, identity checks, state inspection, decision logic, classification, and presentation. Those responsibilities change for different reasons and make local review unnecessarily broad.

## Target Boundary

- Keep `scripts/resolve-operating-loop.mjs` as the single public CLI entry.
- Move cohesive responsibilities under `scripts/operating-loop/`.
- Keep the entry at or below 380 lines and each internal module at or below 500 lines.
- Require explicit imports and exports and an acyclic internal dependency direction.
- Preserve exact decision semantics, output sections and order, subprocess order, and exit codes.
- Install every internal module into generated projects through the Manifest and workflow-version inventory.

## Non-Goals

- No product behavior change.
- No new workflow state or command.
- No change to release or production authority.
- No unrelated refactor of extracted modules.
- No implementation of the Controlled Adoption draft.
- No rewrite of released evidence.

## Final Governance Consolidation

The final review also consolidates current-versus-historical report authority into one shared rule. Explicit current report selection remains strict; historical batch audit remains read-only; filename order can never grant current authority. This bounded correction includes the Plan Review binding, Business Universe Coverage, Release Execution Topology, and the affected package verification routes because full-chain replay exposed their prior implicit ordering dependency. Historical semantic locators and historical topology source refs are checked as safe recorded references, not re-digested against later source and misrepresented as current evidence. The final independent review report is retained as the human-readable review record for this governed batch.

## Verification Fixture Hygiene

The final runtime review also makes `tests/execution-distribution-trust.test.mjs` reclaim every `intentos-*` temporary root that it creates. Cleanup runs after each test, including failed tests, accepts only direct children of the operating-system temporary directory with an IntentOS-owned name, and reports cleanup failure as a test failure. This is limited to the distribution-trust fixture lifecycle; it does not introduce a general-purpose or system-wide cleanup service.

The project-owned governance-core and operating-core runtime actions run their fixture-heavy Node test files with `--test-concurrency=1`. Each file retains its own internal test behavior; only file-level concurrency is bounded so temporary repositories and subprocesses cannot exhaust one another during the trusted runtime replay. The existing 30-minute action timeouts remain unchanged. The operating-core rule is backed by an isolated reproduction: its failing baseline case passed in about 25 seconds alone and the complete serial batch passed 67/67, while the parallel batch stretched that same case beyond its 180-second child-process timeout.

## Verification

1. Syntax-check the entry and all extracted modules.
2. Enforce size, export, dependency, Manifest, workflow-version, and copy-rule constraints.
3. Run operating-model characteristic tests covering all public modes and failure paths.
4. Run generated-project parity tests and both generated-project fixture suites.
5. Run the strict IntentOS checker and `git diff --cached --check`.
6. Confirm the only untracked exception is the preserved Controlled Adoption draft.
7. Batch-check historical Test Evidence, Execution Assurance, Completion Evidence, Runtime Hygiene, and Business Universe Coverage as immutable historical records with internally valid source bindings, while keeping explicit old-report selection strict against the current project identity.
8. Prove with focused negative tests that lexicographically later historical filenames cannot become current authority.
9. Prove Release Execution Topology batch audit remains historical while explicit selected reports remain current-strict.
10. Run `node --test tests/execution-distribution-trust.test.mjs` and confirm the suite leaves no newly created `intentos-*` temporary roots behind.
11. Run the four governance-core test files with `--test-concurrency=1` and confirm all assertions finish within the unchanged action timeout.
12. Run the task-bound Data Model obligation test against the exact `3a51657..candidate` path set and fail if it introduces a product database, persistence model, migration, seed, storage, SQL, or Prisma path; governance evidence schemas are not product persisted data.

## Completion Rule

The batch is complete only when the entry is a thin orchestration shell, every installed project receives the same module graph, all characteristic and full workflow checks pass, no public behavior changes, and no unrelated file is modified.
