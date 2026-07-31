---
schema_version: 1.0
artifact_type: preflight
number: 244
slug: bootstrap-receipt-managed-ownership-recovery
title: "bootstrap receipt managed ownership recovery"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/244-bootstrap-receipt-managed-ownership-recovery.md
task_level: L2
---
# Preflight: 244-bootstrap-receipt-managed-ownership-recovery

## Source Request

`requests/244-bootstrap-receipt-managed-ownership-recovery.md`

## Clarity

READY

## Problem Summary

The update planner relies only on `.intentos/version.json#managedAssetDigests`
for per-file ownership. A verified legacy bootstrap transaction can therefore
be ignored even when its exact action and current target digest match, causing
a false `PRESERVE_UNMANAGED` blocker.

## Missing Information

- None. The source, target, receipt, plan action, version declaration, and
  current digest are all locally observable.

## Assumptions

- A bootstrap receipt is eligible only after the existing strict receipt
  validator passes for the canonical project root.
- The receipt must bind the canonical `.intentos/bootstrap-plan.json` digest.
- Exactly one plan create action and one applied receipt action must bind the
  same id, path, and current hash.

## Direction Risks

- Weak receipt parsing could let a forged or stale record authorize overwrite.
- Broad directory ownership inference could absorb project-owned files.
- Reusing receipt evidence after local edits could overwrite user work.

## Over-design Risks

- Do not redesign project entry trust or migrate all legacy version records.
- Do not infer ownership from Git history, filenames, directories, or source
  similarity alone.

## MVP Recommendation

Add one narrowly scoped fallback in the existing per-file ownership resolver.
Prefer current managed digests; otherwise accept one exact create action from
the digest-bound bootstrap plan plus one exact action from a strictly validated
bootstrap receipt. Return the existing ownership state so downstream behavior
remains unchanged.

## Non-goals

- No Pawcode writes.
- No weakening of `PRESERVE_UNMANAGED` for missing or mismatched evidence.
- No update to receipt schemas, entry-trust activation, apply execution, or
  production/release behavior.

## Domain Model Draft

- Existing version record: declares workflow paths and current managed digests.
- Verified bootstrap receipt: project-bound transaction evidence.
- Receipt action: exact path, `APPLIED` result, and `hash_after`.

## Permission / Security Risks

- Receipt and target paths must reject symlinks or out-of-root resolution via
  the existing strict loader.
- Self-declared, invalid-digest, wrong-root, stale, duplicate, or mismatched
  actions must not establish ownership.

## First Vertical Slice

```text
current request -> dry-run plan -> version digest lookup -> verified bootstrap
receipt fallback -> exact path/hash match -> UPDATE_MANAGED or preserve/block
```

## Suggested Specs

- `specs/244-bootstrap-receipt-managed-ownership-recovery.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The issue is reproducible from a real target and has a bounded implementation
surface, explicit negative cases, rollback by reverting one source commit, and
no external or user decision dependency.
