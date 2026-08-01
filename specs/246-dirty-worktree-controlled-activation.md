---
schema_version: 1.0
artifact_type: spec
number: 246
slug: dirty-worktree-controlled-activation
title: "dirty worktree controlled activation"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/246-dirty-worktree-controlled-activation.md
preflight: preflight/246-dirty-worktree-controlled-activation.md
---
# Spec 246: dirty worktree controlled activation

## Status

Ready

## Source

- Request: `requests/246-dirty-worktree-controlled-activation.md`
- Preflight: `preflight/246-dirty-worktree-controlled-activation.md`

## Problem

`isWorkflowActivationState` ignores its plan input and only accepts `READY_*`.
A verified controlled update on an intentionally dirty target instead returns
`REVIEW_DIRTY_WORKTREE`, so the transaction rolls back even when the exact
pre-apply fingerprint proves no dirty path will be overwritten.

## User Story

As a Codex operator for a zero-experience solo developer,
I want an exact zero-overlap dirty controlled update to count as an installed state,
so that IntentOS can activate without cleaning or overwriting unrelated work.

## Scope

Included:

- Add one fail-closed dirty controlled-update activation predicate.
- Reuse the exact plan operation, arguments, target fingerprint, actions, and ownership conflicts.
- Add positive and negative regression cases to the existing execution/distribution trust suite.
- Revalidate the real Pawcode plan read-only after implementation.

## Non-goals

- No new workflow state or authority artifact.
- No acceptance of `RUN_WORKFLOW_ASSET_UPDATE`, onboarding, baseline, or other pending actions.
- No Pawcode write/apply, dependency, schema, CI/hook, release, or business change.

## Data Model Impact

New or changed entities: None.

## API / Interface Contract

### `isWorkflowActivationState(state, plan)`

Input:

```json
{
  "state": { "nextAction": "REVIEW_DIRTY_WORKTREE" },
  "plan": { "operationKind": "CONTROLLED_UPDATE", "targetFingerprint": {}, "actions": [] }
}
```

Output:

```json
true
```

Errors:

- Returns `false` for missing, malformed, inconsistent, overlapping, conflicted, or non-update evidence.

## UI States

- Not applicable; no UI surface.

## Permission Rules

- Existing `READY_FOR_FIRST_REQUEST` and `READY_FOR_TASK_EXECUTION` behavior is unchanged.
- Dirty activation is derived only from the exact reviewed plan, never from state text alone.

## Observability

- Logs: existing apply receipt and activation reason.
- Metrics: not applicable.
- Audit events: existing controlled apply receipt only.

## Acceptance Criteria

- `READY_*` remains accepted without requiring a plan.
- `REVIEW_DIRTY_WORKTREE` is accepted only for `CONTROLLED_UPDATE` workflow-asset updates.
- The fingerprint must say dirty, contain a complete count-matching non-empty changed-file list, and every row must yield a safe relative path.
- No pre-existing dirty path may equal, contain, or be contained by any executable plan-write path.
- Ownership conflicts must be empty and all executable paths must be safe relative paths.
- Missing/malformed evidence, overlap, a clean fingerprint, other operation kinds, and other next actions return false.
- The real Pawcode plan becomes activation-eligible read-only while retaining zero dirty overlap.
- Focused regression, project-entry, manifest, workflow gates, diff, and full source self-check pass.

## Test Plan

- Unit: positive exact dirty plan plus missing, malformed, count drift, conflict, overlap, directory overlap, and wrong-operation negatives.
- Integration: existing project-entry suite and full source self-check.
- E2E: real Pawcode plan read-only predicate and later separate controlled apply.
- Manual: inspect failure receipt rollback and unchanged Pawcode dirty paths.

## Rollback Notes

Revert the bounded source commit; the Pawcode failed apply already rolled back.

## Open Questions

None.
