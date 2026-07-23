# IntentOS 1.117 `fillers` Structural Modularity Plan

Intent: modularize scripts/new-workflow-item/fillers.mjs into cohesive internal filler modules while preserving workflow state, the public fillArtifact and frontmatterFor interfaces, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes

Task reference: task:eb30b49e331932c47887de0c020071cf667e9d4fafdb2a10eff7b024852d8303

## Scope

Reduce the 1,572-line filler implementation to a thin dispatcher and cohesive internal families. Preserve the exact 63-type registry, 223 aliases, frontmatter, template transformations, reference behavior, generated paths and bytes, terminal streams, and exit status.

## Boundaries

This is a repository-local structural refactor. It changes no schema, workflow meaning, public command, data, permission, release policy, CI, hosted automation, or production behavior. The two independent untracked drafts remain excluded and untouched.

## Module Boundaries

1. `fillers.mjs` remains the only public filler entry and exports only `fillArtifact` and `frontmatterFor`.
2. `fillers/routing.mjs` owns Goal Card and Subagent Run Plan routing templates and their bounded mode normalization.
3. `fillers/governance.mjs` owns launch, conversation, scope, adoption-trial, patch, active-thread, and guided-decision templates.
4. `fillers/baseline.mjs` owns Change Boundary, baseline selection/state, and Approval Record templates.
5. `fillers/frontmatter.mjs` owns deterministic frontmatter selection.
6. `fillers/workflow.mjs` owns Request, Preflight, Spec, Eval, Task, and Log templates.
7. `fillers/review.mjs` owns Review Packet, Review Loop, and GPT Review Prompt templates.
8. `fillers/reporting.mjs` owns adoption assessment, governance map, status, decision, review summary, handoff, follow-up, and final report templates.

No module writes files, parses process arguments, selects output paths, or emits terminal output.

## Implementation Sequence

1. Replay the unchanged 63-type/223-alias characterization baseline.
2. Move contiguous filler bodies without text cleanup, semantic rewriting, or condition reordering.
3. Keep the public dispatcher and exports stable.
4. Register every module in syntax, installation, manifest, and package distribution surfaces.
5. Replay exact generated-path, file-content, stdout, stderr, and exit-code characterization.
6. Stop on the first digest, path, content, or output mismatch.

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

- `node --test tests/new-workflow-item-characterization.test.mjs tests/117-fillers-modularity-governance-obligations.test.mjs`
- `node --test tests/active-guidance-distribution-closeout.test.mjs`
- `npm run verify:syntax`
- npm package file inventory includes all filler modules
- strict current-task Runtime Trust replay and final Consumer Chain
- `git diff --cached --check`

## Rollback And Recovery

Before commit, reverse only this explicit structural patch if characterization fails. Do not weaken the oracle, update expected behavior to accept drift, or keep a partial split.

## Completion Boundary

Completion requires exact Git-bound scope, current task evidence, source and installed-project parity, full workflow replay, and no unexpected files beyond the two preserved drafts. This plan does not approve commit or push.
