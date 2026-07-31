---
schema_version: 1.0
artifact_type: spec
number: 245
slug: request-bound-bootstrap-ownership-consumer
title: "request bound bootstrap ownership consumer"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/245-request-bound-bootstrap-ownership-consumer.md
preflight: preflight/245-request-bound-bootstrap-ownership-consumer.md
---
# Spec 245: request bound bootstrap ownership consumer

## Status

Ready

## Source

- Request: `requests/245-request-bound-bootstrap-ownership-consumer.md`
- Preflight: `preflight/245-request-bound-bootstrap-ownership-consumer.md`

## Problem

`scripts/init-project/plan.mjs` can now recover exact bootstrap-managed
ownership omitted by a legacy version record. The downstream
`request-bound-apply-authority` consumer independently checks only the version
record and rejects the same proven action, making a safe plan non-executable.

## User Story

As a Pawcode owner,
I want the controlled apply authority to consume the planner's exact verified
bootstrap ownership,
so that the workflow update can proceed without risking project-owned files.

## Scope

Included:

- Move or expose the strict bootstrap plan/receipt ownership verifier through an existing shared module.
- Make planner and request-bound authority consume that verifier.
- Require action ownership to equal the independently recomputed result.
- Add positive and fail-closed consumer tests.
- Recheck the exact Pawcode plan graph read-only.

## Non-goals

- No Pawcode apply or product/UI implementation in this task.
- No new authority state, dependency, schema, allowed path, action type, or external effect.
- No filename, Git-history, or content-similarity inference.

## Data Model Impact

New entities: none.

Changed contract: the existing bootstrap managed-ownership proof becomes a
shared verifier consumed by both planning and request-bound apply preflight.

## API / Interface Contract

### Verify prior bootstrap-managed ownership

Input:

```json
{
  "projectRoot": "/canonical/project",
  "targetPath": "scripts/example.mjs",
  "currentHash": "sha256:..."
}
```

Output:

```json
{
  "state": "VERIFIED_PRIOR_INTENTOS_MANAGED",
  "evidence_ref": ".intentos/bootstrap-receipt.json#actions:A-764",
  "managed_digest": "sha256:..."
}
```

Errors:

- Return `null` / unproven when any root, version origin, receipt, plan digest,
  action identity/path/type/state, symlink, duplicate, or hash condition fails.

## UI States

Not applicable; this is a source-only governance consumer.

## Permission Rules

- Request-bound authority may accept only a current version-record proof or an
  independently recomputed bootstrap proof identical to `action.ownership`.
- Existing project-owned, locally edited, or forged actions remain forbidden.

## Observability

- Logs: existing preflight errors remain explicit.
- Metrics: not applicable.
- Audit events: existing authority/readiness/receipt chain remains unchanged.

## Acceptance Criteria

- Shared verifier reproduces the Task 244 exact bootstrap plan/receipt checks.
- Planner retains version-record ownership as the primary path.
- Request-bound authority accepts the exact Pawcode A-754 action.
- Missing/forged action ownership, local edit, duplicate action, or plan drift is rejected.
- Existing unmanaged workflow-script regression remains rejected.
- Focused tests, project-entry suite, manifest, workflow gates, diff, and full source self-check pass.

## Test Plan

- Unit: request-bound authority positive and fail-closed bootstrap cases.
- Integration: project-entry suite and exact Pawcode plan graph validation.
- E2E: full IntentOS self-check.
- Manual: inspect allowed paths and verify zero Pawcode dirty-write overlap.

## Rollback Notes

Revert only the Task 245 source commit. The previously written Pawcode plan is
not executable and does not alter managed assets.

## Open Questions

- None.
