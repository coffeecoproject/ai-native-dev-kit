---
schema_version: 1.0
artifact_type: request
number: 244
slug: bootstrap-receipt-managed-ownership-recovery
title: "bootstrap receipt managed ownership recovery"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
priority: P1
task_level: L2
---
# Request: 244-bootstrap-receipt-managed-ownership-recovery

## Raw Request

原始需求：

Use `codex/source-only-external-adoption-hardening` as Guidance Authority and
repair Pawcode IntentOS without overwriting its dirty worktree. The controlled
update dry-run must not treat an exact `APPLY_VERIFIED` bootstrap-created asset
as unowned merely because a legacy version record omitted its managed digest.

## User / Customer

The zero-experience Pawcode owner and Codex's controlled IntentOS updater.

## Problem

Pawcode's verified bootstrap plan and receipt prove that
`scripts/check-release-execution-topology.mjs` was created by IntentOS and its
current digest is unchanged. The legacy `.intentos/version.json` omits only
that file from `managedAssetDigests`, so the updater emits
`PRESERVE_UNMANAGED` and blocks an otherwise non-overlapping update.

## Current Workflow

Codex can only run read-only diagnosis. Editing Pawcode's version record by
hand would create a second authority path and bypass the controlled apply
chain.

## Desired Outcome

The planner accepts a validated, project-bound, `APPLY_VERIFIED` bootstrap
receipt action as per-file managed-ownership evidence only when its exact
digest-bound bootstrap plan declares the create action and the current digest
matches both records. Missing, forged, stale, mismatched, or duplicate evidence
remains blocked.

## Constraints

- Source branch only; do not write Pawcode while implementing this fix.
- Preserve fail-closed handling for ordinary project-owned or locally edited files.
- No dependencies, CI/hooks, release, business code, schema, or production changes.
- Keep the change reversible and covered by focused and full source checks.

## Priority

P1

## Suggested Task Level

L2

## Deadline

No external deadline; this blocks the current Pawcode IntentOS repair.

## Notes

Observed evidence: bootstrap action `A-764`, receipt result `APPLIED`, and the
current target file all bind digest
`sha256:46976f600ad200d469bba156fb410cc5c37bd997d48e7ee2e9557939c7451a7f`.
