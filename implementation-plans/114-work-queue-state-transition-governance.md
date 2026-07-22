# IntentOS 1.114 Work Queue State Transition Governance Plan

Intent: Add append-only Work Queue task state transitions so published task snapshots remain immutable while exactly one successor becomes current.

Task reference: task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739

## Scope

Introduce one append-only, digest-bound Work Queue handoff artifact; validate its linear graph; and project the validated predecessor and successor into the existing Work Queue and takeover consumers. Distribute the schema, checker, resolver, template, checklist, and CLI commands through the current Manifest without changing published 1.113 snapshots.

## Boundaries

This is repository-local governance tooling only. It does not authorize production, release, commit, push, external operations, permission changes, destructive data changes, or historical snapshot rewrites. The unrelated 1.114 drafts and the frozen `scripts/check-intentos.mjs` modularity refactor remain outside the candidate. Permission existence leakage, non-existence/404 ordering, and error priority are not applicable because no actor authorization path changes. History guard, historical association handling, and audit before delete are not applicable because no deletion path is introduced.

## Retrospective Governance Recovery

The initial implementation slice existed before this full HIGH evidence chain was completed. This plan records the exact reviewed candidate and recovery sequence; it does not claim that the plan preceded the code. No completion claim is allowed until the regenerated chain and final Git-bound checks pass.

## Implementation Sequence

1. Define the trusted `schemas/artifacts/work-queue-state-transition.schema.json` contract and canonical source/digest rules.
2. Implement `scripts/lib/work-queue-transition.mjs` as the shared fail-closed loader, graph validator, and derived-state projector.
3. Add `scripts/resolve-work-queue-transition.mjs` and `scripts/check-work-queue-transition.mjs` without granting implementation or release authority.
4. Integrate validated derived states into `scripts/resolve-work-queue.mjs` and `scripts/resolve-work-queue-takeover.mjs`.
5. Add focused positive and tamper tests in `tests/work-queue-transition.test.mjs`.
6. Add Manifest, CLI, documentation, template, and checklist distribution entries.
7. Generate the exact 1.113-to-1.114 handoff and rebuild downstream governance evidence against the current candidate.

## Source Authority And Consumer Consistency

The backend authority and capability source are the Node resolver/checker and shared transition library. Markdown snapshots and reports are evidence inputs; they cannot override source validation. Work Queue and takeover consumers must agree on the exact single CURRENT item, intent digest, and transition reference.

## Business Universe Scenario Review

### coverage-scenario:62567cdf836ba48477a8f448

- Lifecycle: `ORIGIN_OR_ENTRY`
- Provenance: `PROJECT_NATIVE_AUTOMATION`
- Expected: Published predecessor and successor snapshots are content-bound and remain unchanged after a handoff record is created. Lifecycle stage: ORIGIN_OR_ENTRY.
- Negative or reverse: A missing, altered, stale, or self-referential snapshot fails closed and cannot update effective task state. Lifecycle stage: ORIGIN_OR_ENTRY.

### coverage-scenario:740a71757b14288ae4141c50

- Lifecycle: `FAILURE_RETRY_OR_RECOVERY`
- Provenance: `PROJECT_NATIVE_AUTOMATION`
- Expected: Published predecessor and successor snapshots are content-bound and remain unchanged after a handoff record is created. Lifecycle stage: FAILURE_RETRY_OR_RECOVERY.
- Negative or reverse: A missing, altered, stale, or self-referential snapshot fails closed and cannot update effective task state. Lifecycle stage: FAILURE_RETRY_OR_RECOVERY.

### coverage-scenario:d7545e8b22bb9bfa081a836f

- Lifecycle: `TERMINATION_REVERSAL_OR_COMPENSATION`
- Provenance: `PROJECT_NATIVE_AUTOMATION`
- Expected: Published predecessor and successor snapshots are content-bound and remain unchanged after a handoff record is created. Lifecycle stage: TERMINATION_REVERSAL_OR_COMPENSATION.
- Negative or reverse: A missing, altered, stale, or self-referential snapshot fails closed and cannot update effective task state. Lifecycle stage: TERMINATION_REVERSAL_OR_COMPENSATION.

### coverage-scenario:c8256b97414d3a4b1abf3bf4

- Lifecycle: `ORIGIN_OR_ENTRY`
- Provenance: `PROJECT_RUNTIME_PATH`
- Expected: One positive, unique sequence links the exact predecessor to the exact successor with a decision reference and canonical digest. Lifecycle stage: ORIGIN_OR_ENTRY.
- Negative or reverse: A duplicate, forked, non-linear, non-positive, stale, or digest-invalid handoff is rejected without rewriting history. Lifecycle stage: ORIGIN_OR_ENTRY.

### coverage-scenario:cfd07c06b02bfbc6d630cfd9

- Lifecycle: `FAILURE_RETRY_OR_RECOVERY`
- Provenance: `PROJECT_RUNTIME_PATH`
- Expected: One positive, unique sequence links the exact predecessor to the exact successor with a decision reference and canonical digest. Lifecycle stage: FAILURE_RETRY_OR_RECOVERY.
- Negative or reverse: A duplicate, forked, non-linear, non-positive, stale, or digest-invalid handoff is rejected without rewriting history. Lifecycle stage: FAILURE_RETRY_OR_RECOVERY.

### coverage-scenario:ffb9bbaca3043be408850f5d

- Lifecycle: `TERMINATION_REVERSAL_OR_COMPENSATION`
- Provenance: `PROJECT_RUNTIME_PATH`
- Expected: One positive, unique sequence links the exact predecessor to the exact successor with a decision reference and canonical digest. Lifecycle stage: TERMINATION_REVERSAL_OR_COMPENSATION.
- Negative or reverse: A duplicate, forked, non-linear, non-positive, stale, or digest-invalid handoff is rejected without rewriting history. Lifecycle stage: TERMINATION_REVERSAL_OR_COMPENSATION.

### coverage-scenario:79c17acfcbaca9b2d0e72ece

- Lifecycle: `ORIGIN_OR_ENTRY`
- Provenance: `PROJECT_NATIVE_AUTOMATION`
- Expected: Consumers apply the validated chain in sequence, mark the predecessor DONE in the derived view, and expose exactly one successor as CURRENT. Lifecycle stage: ORIGIN_OR_ENTRY.
- Negative or reverse: An invalid chain, ambiguous item reference, or intent mismatch preserves the original source state and blocks takeover readiness. Lifecycle stage: ORIGIN_OR_ENTRY.

### coverage-scenario:eb423e2eba675f15d896a585

- Lifecycle: `FAILURE_RETRY_OR_RECOVERY`
- Provenance: `PROJECT_NATIVE_AUTOMATION`
- Expected: Consumers apply the validated chain in sequence, mark the predecessor DONE in the derived view, and expose exactly one successor as CURRENT. Lifecycle stage: FAILURE_RETRY_OR_RECOVERY.
- Negative or reverse: An invalid chain, ambiguous item reference, or intent mismatch preserves the original source state and blocks takeover readiness. Lifecycle stage: FAILURE_RETRY_OR_RECOVERY.

### coverage-scenario:067b89b0642246adf9542c4e

- Lifecycle: `TERMINATION_REVERSAL_OR_COMPENSATION`
- Provenance: `PROJECT_NATIVE_AUTOMATION`
- Expected: Consumers apply the validated chain in sequence, mark the predecessor DONE in the derived view, and expose exactly one successor as CURRENT. Lifecycle stage: TERMINATION_REVERSAL_OR_COMPENSATION.
- Negative or reverse: An invalid chain, ambiguous item reference, or intent mismatch preserves the original source state and blocks takeover readiness. Lifecycle stage: TERMINATION_REVERSAL_OR_COMPENSATION.

## Verification

Run these project-native commands from the repository root:

- `npm run verify:work-queue-transition`
- `node scripts/check-work-queue-transition.mjs . --require-report`
- `node scripts/check-work-queue.mjs . --require-report`
- `node scripts/check-work-queue-takeover.mjs .`
- `node scripts/check-task-governance.mjs . --require-structured-evidence`
- `node scripts/check-manifest.mjs`
- `git diff --cached --check`

The focused tests must prove normal handoff, immutable-source tamper rejection, and non-positive sequence rejection even after a digest is recomputed. Final evidence must bind the exact staged candidate.

## Rollback And Recovery

Before commit, remove only this bounded candidate from the index or reverse its explicit patch if any governance checker fails. Published Work Queue snapshots remain untouched; an invalid handoff is ignored fail-closed, leaving original source states intact. Do not recover by editing old evidence, weakening a checker, or deleting an observed failure.

## Completion Boundary

Completion requires exact Change Boundary agreement, focused tests, Manifest validation, current Work Queue uniqueness, downstream takeover agreement, Test Evidence, Execution Assurance, Completion Evidence, and closure review. This plan does not approve commit, push, release, or production.
