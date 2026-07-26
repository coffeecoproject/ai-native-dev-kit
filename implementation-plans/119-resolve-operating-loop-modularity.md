# IntentOS 1.119 Resolve Operating Loop Modularity Implementation Plan

Intent: modularize `scripts/resolve-operating-loop.mjs` into cohesive internal modules while preserving workflow state, public CLI arguments, command output, subprocess ordering, exit codes, generated-project distribution, and resolver behavior

Intent digest: `sha256:7c2e387d1e68deeaa956cdd690e69b3965d294aa1e7b4f65e4933002da307e4c`

Task ref: `task:8076c2a8a25ff7cf3510a05e8fe5654511690bc16aa43429a0b680daf0643630`

## Scope

Keep `scripts/resolve-operating-loop.mjs` as the single public entry and move classification, decision, identity, presentation, state, source execution, and source orchestration into explicit modules under `scripts/operating-loop/`. Register the complete module graph in the Manifest and workflow-version inventory, and make self-check consumers inspect the full modular source graph. The final full-chain review may also update `scripts/check-test-evidence.mjs`, `scripts/check-execution-assurance.mjs`, `scripts/check-completion-evidence.mjs`, `scripts/check-runtime-hygiene.mjs`, `scripts/check-business-universe-coverage.mjs`, `scripts/lib/release-trust.mjs`, `scripts/lib/release-topology-consumer.mjs`, and `tests/test-evidence-batch-authority.test.mjs` only to preserve historical batch evidence and its internal release or semantic-locator bindings without granting it current authority; explicit historical selection must remain current-strict. It may update `scripts/lib/evidence-authority.mjs` and its distribution-trust regression test solely to classify Release Review Provenance as governed workflow output, preventing the required review artifact from recursively changing the source identity it attests. The same review may consolidate report authority through `scripts/lib/report-authority.mjs`, migrate `scripts/check-plan-review.mjs`, `scripts/check-business-universe-coverage.mjs`, and `scripts/lib/plan-review-binding.mjs` to that shared rule, and update the two affected `package.json` verification routes. This consolidation is limited to removing filename-order authority and preserving explicit current selection versus historical batch audit semantics.

## Boundaries

This is a structure-preserving refactor. It does not add workflow states, change public arguments, reorder output or subprocesses, change release or production authority, implement Controlled Adoption, rewrite released evidence, commit, push, or perform external operations. The independent Controlled Adoption draft remains untracked and excluded.

## Implementation Sequence

1. Characterize the public resolver modes, output ordering, failure paths, and generated-project behavior.
2. Extract shared helpers and cohesive classification, state, presentation, execution, orchestration, decision, and identity modules.
3. Keep the public entry at or below 380 lines and each internal module at or below 500 lines with explicit acyclic imports.
4. Register all extracted modules in sourceRequired, scripts, copy rules, and workflow-version assets.
5. Update self-check consumers to inspect the complete modular graph rather than only thin public entries.
6. Preserve the already-published behavior characterization while correcting only stale or demonstrably pre-existing test-oracle defects, including the Test Evidence, Execution Assurance, Completion Evidence, and Runtime Hygiene batch/current authority distinctions found by the final full-chain review.
7. Keep required Release Review Provenance outside source identity and prove that classification through the distribution-trust regression suite.
8. Replace per-checker filename-order inference with the shared report-authority contract, including Plan Review, Business Universe Coverage, and their batch verification routes, and prove that filenames cannot grant current authority. Historical Business Universe semantic locators remain immutable recorded observations and are never reinterpreted as current-source locators.
9. Generate bounded governance evidence and one final trusted runtime; retain no standalone full-verification aggregate log.

## Business Universe Scenario Review

- `coverage-scenario:54d5e4301d4c6638bf60f92e` — lifecycle `PROPAGATION_OR_SIDE_EFFECT`, provenance `PROJECT_NATIVE_AUTOMATION`: all eight internal modules must be installed. Negative/reverse: Omitting any module or copy rule must fail manifest closure or generated-project verification.
- `coverage-scenario:ecfcf7c958bb154d7ec23da9` — lifecycle `FAILURE_RETRY_OR_RECOVERY`, provenance `PROJECT_RUNTIME_PATH`: downstream source failures remain visible and ordered. Negative/reverse: A source failure remains fail-closed and cannot be hidden by the module boundary.
- `coverage-scenario:31cc3db857547fa9a3a9cbeb` — lifecycle `ORIGIN_OR_ENTRY`, provenance `PROJECT_RUNTIME_PATH`: public arguments, sections, decisions, and exit codes remain unchanged. Negative/reverse: Unknown modes and downstream failures retain the prior non-zero behavior and diagnostic ordering.
- `coverage-scenario:3ab1bd0537b3500e5517624a` — lifecycle `ELIGIBILITY_OR_VALIDATION`, provenance `PROJECT_NATIVE_AUTOMATION`: self-checks inspect the complete modular graph. Negative/reverse: Moving a forbidden marker into an extracted module must still fail the self-check.
- `coverage-scenario:9bf19075a1d696dfaa06199b` — lifecycle `OBSERVATION_OR_AUDIT`, provenance `FIXTURE_OR_SEED_PATH`: size, exports, dependency direction, and distribution remain bounded. Negative/reverse: Oversized modules, missing exports, dependency cycles, or missing distribution entries fail deterministically.

## Permission, Data, And Authority Exclusions

- Permission: there is no authenticated or unauthorized actor, resource-existence response, tenant boundary, or permission branch in this local CLI refactor. Existence leakage and unauthorized error priority are therefore not applicable; existing resolver failure ordering remains unchanged.
- Data/destructive behavior: the candidate does not create, migrate, mutate, or delete user data. Historical associations, audit-before-delete sequencing, and destructive recovery are not applicable. Repository rollback is limited to the explicit candidate patch before commit.
- Frontend/backend consistency: there is no frontend/backend split or capability flag. `scripts/resolve-operating-loop.mjs` remains the single public authority and its imported module graph cannot override CLI decisions, release authority, or workflow state semantics.
- Release: no CI, hook, deployment, production, commit, or push operation is introduced or authorized.

## Verification

- `node --test tests/resolve-operating-loop-modularity.test.mjs tests/self-check-modular-source-marker.test.mjs`
- `node --test tests/operating-model.test.mjs tests/project-entry-generated-parity.test.mjs`
- `node --test tests/init-project-modularity.test.mjs tests/new-workflow-item-characterization.test.mjs`
- `node --test tests/test-evidence-batch-authority.test.mjs`
- `npm run verify:business-universe`
- `node --test tests/control-effectiveness.test.mjs tests/test-evidence-batch-authority.test.mjs tests/unified-closure-batch-authority.test.mjs`
- `node --test tests/understanding-planning-closure.test.mjs`
- `node scripts/check-manifest.mjs .`
- `npm run verify:syntax`
- `npm run verify:candidate`
- `npm run verify:consumer-chain:final`
- strict Verification Runtime Manifest replay
- `node scripts/check-evidence-retention.mjs . --strict`
- `git diff --cached --check`

## Failure Behavior

Any mismatch in CLI behavior, module distribution, dependency direction, self-check visibility, generated-project behavior, runtime identity, or evidence binding blocks completion. No failing run is retained as final evidence.

## Rollback And Recovery

Before commit, reverse only the explicit 1.119 candidate patch. Released evidence and the protected Controlled Adoption draft are not rollback targets.

## Completion Boundary

Completion requires exact staged Git scope, complete Business Universe mapping, effective structural control proof, passing Test Evidence, Execution Assurance, Completion Evidence, Unified Closure, one final Runtime Trust archive, final Consumer Chain, evidence-retention compliance, and no unexpected files beyond the preserved draft. This plan does not approve commit or push.
