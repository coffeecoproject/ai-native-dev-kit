---
schema_version: 1.0
artifact_type: spec
number: 244
slug: bootstrap-receipt-managed-ownership-recovery
title: "bootstrap receipt managed ownership recovery"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/244-bootstrap-receipt-managed-ownership-recovery.md
preflight: preflight/244-bootstrap-receipt-managed-ownership-recovery.md
---
# Spec 244: bootstrap receipt managed ownership recovery

## Status

Ready

## Source

- Request: `requests/244-bootstrap-receipt-managed-ownership-recovery.md`
- Preflight: `preflight/244-bootstrap-receipt-managed-ownership-recovery.md`

## Problem

`priorManagedAssetOwnership` treats an existing file as managed only when the
current version record contains an exact digest. Legacy bootstrap output can
omit a file from that digest map even though a canonical project-bound
`APPLY_VERIFIED` bootstrap receipt records the exact create action and current
hash. The false negative blocks controlled workflow updates.

## User Story

As a zero-experience project owner,
I want IntentOS to recover exact managed ownership from its verified bootstrap
receipt,
so that a safe controlled update can proceed without overwriting project-owned
or locally edited files.

## Scope

Included:

- Export or otherwise make the per-file ownership resolver testable.
- Keep `.intentos/version.json#managedAssetDigests` as the primary proof.
- Add a fallback for `projectEntryOrigin: NEW_PROJECT` that loads the existing
  strictly validated bootstrap receipt and its exact digest-bound plan.
- Require exactly one plan `CREATE` action and one receipt action with the same
  id and path.
- Require `sourceHash`, `expectedHashAfter`, and `hash_after` to equal the
  current file digest, with `willWrite`/`executionSupported` and `APPLIED`
  states intact.
- Return evidence identifying the receipt and action.
- Add positive and fail-closed negative tests.

## Non-goals

- Writing Pawcode or changing its legacy records directly.
- Directory-wide or name-based ownership inference.
- Accepting a receipt or plan without strict validation, current-root and plan
  digest binding, exact action id/path, or exact hash.
- Changing apply authority, execution, rollback, release, or business behavior.

## Data Model Impact

No persisted entity or schema changes. The in-memory ownership evidence may
include a bootstrap receipt reference and action id.

## API / Interface Contract

### `priorManagedAssetOwnership(targetPath, targetRel, currentHash)`

Input:

```json
{
  "targetPath": "/canonical/project",
  "targetRel": "scripts/check-release-execution-topology.mjs",
  "currentHash": "sha256:<64 hex>"
}
```

Output:

```json
{
  "state": "VERIFIED_PRIOR_INTENTOS_MANAGED",
  "evidence_ref": ".intentos/bootstrap-receipt.json#actions:A-764",
  "managed_digest": "sha256:<64 hex>"
}
```

Errors:

- Missing/invalid/stale receipt or plan, duplicate action, non-applied action,
  or hash mismatch returns the existing
  `UNPROVEN_PROJECT_OWNED` state.

## UI States

Not applicable; this is an internal planner trust boundary.

## Permission Rules

- Receipt validation remains project-root bound and fail-closed.
- A receipt may prove only the exact file action and digest it records.
- Local edits invalidate receipt ownership immediately.

## Observability

- Logs: existing plan JSON exposes ownership state and evidence reference.
- Metrics: not applicable.
- Audit events: the generated action graph and later apply receipt remain the
  audit surface.

## Acceptance Criteria

- A valid project-bound `APPLY_VERIFIED` bootstrap receipt and its exact
  digest-bound bootstrap plan can recover ownership for one file whose current
  digest exactly matches both actions.
- Primary version-digest proof still wins when available.
- Invalid receipt digest/root/activation, invalid or mismatched plan digest,
  missing or duplicate action, non-applied result, and hash mismatch remain
  unproven.
- Existing edited-file protection remains covered.
- Pawcode dry-run no longer reports the exact receipt-backed file in
  `ownershipConflicts` and does not create any dirty-file write overlap.
- Focused tests, project-entry verification, manifest check, full source
  self-check, task/review checks, and diff checks pass.

## Test Plan

- Unit: valid and invalid bootstrap ownership evidence cases.
- Integration: init-project dry-run classification and existing unproven local
  edit rejection.
- E2E: `npm run verify:project-entry` and `node scripts/check-intentos.mjs`.
- Manual: read-only Pawcode action graph confirms zero ownership conflicts and
  no write overlap with dirty files.

## Rollback Notes

Revert the source commit; no Pawcode file is changed by this task.

## Open Questions

- None.
