---
schema_version: 1.0
artifact_type: eval
number: 244
slug: bootstrap-receipt-managed-ownership-recovery
title: "bootstrap receipt managed ownership recovery"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/244-bootstrap-receipt-managed-ownership-recovery.md
---
# Eval: bootstrap receipt managed ownership recovery

## Related Spec

`specs/244-bootstrap-receipt-managed-ownership-recovery.md`

## Must Pass

- [x] syntax and diff checks pass
- [x] receipt ownership focused tests pass
- [x] project-entry verification passes
- [x] full source self-check passes
- [x] no unrelated files changed
- [x] no dependency added

## Spec Alignment

- [x] Implementation matches acceptance criteria
- [x] Implementation respects non-goals
- [x] Primary version-digest ownership remains preferred
- [x] Receipt fallback is exact-plan, exact-action, exact-path, and exact-hash only
- [x] Pawcode dry-run has no dirty-file write overlap

## Permission / Data Checks

- [x] Canonical project-root binding is enforced by strict receipt validation
- [x] Invalid, stale, duplicate, and plan/receipt-mismatched evidence stays unproven
- [x] Symlink and outside-root receipt paths remain rejected
- [x] Ordinary project-owned and locally edited files remain protected

## Manual Review Checklist

- Inspect the ownership evidence reference emitted for the valid fallback.
- Confirm no receipt or version file is modified during planning.
- Re-run the real Pawcode dry-run after focused tests.

## Reject Conditions

Reject if:

- any receipt-like JSON can prove ownership without strict validation
- exact plan-digest binding, action identity, or current hash is optional
- duplicate or stale actions can establish ownership
- implementation modifies forbidden modules
- tests are missing for the highest-risk behavior
- task adds a dependency
- task violates non-goals

## Required Evidence

- Command output summary: focused Node tests, project-entry suite, manifest,
  full self-check, task/review/change-boundary and diff checks.
- Screenshots / traces if UI: not applicable.
- Review notes: include real Pawcode plan overlap/conflict summary.
