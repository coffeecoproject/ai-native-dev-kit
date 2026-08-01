---
schema_version: 1.0
artifact_type: eval
number: 246
slug: dirty-worktree-controlled-activation
title: "dirty worktree controlled activation"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/246-dirty-worktree-controlled-activation.md
---
# Eval: dirty worktree controlled activation

## Related Spec

`specs/246-dirty-worktree-controlled-activation.md`

## Must Pass

- [x] syntax and diff checks pass
- [x] focused activation regression passes
- [x] project-entry verification passes
- [x] full source self-check passes
- [x] no unrelated files changed
- [x] no unapproved dependency added

## Spec Alignment

- [x] Implementation matches acceptance criteria
- [x] Implementation respects non-goals
- [x] activation predicate contract matches spec
- [x] existing READY states remain unchanged
- [x] real Pawcode exact plan is activation-eligible and remains zero-overlap

## Permission / Data Checks

- [x] dirty state text cannot authorize itself without exact plan evidence
- [x] missing/malformed/count-drift evidence fails closed
- [x] exact and directory path overlap fails closed
- [x] ownership conflict and wrong operation fail closed

## Manual Review Checklist

- Inspect the Pawcode failure receipt and confirm rollback is verified.
- Confirm no managed Pawcode asset is changed during Task 246.

## Reject Conditions

Reject if:

- data can leak across users or authorized resource scopes
- permission checks only exist in frontend
- implementation modifies forbidden modules
- tests are missing for the highest-risk behavior
- task added unapproved dependencies
- task violates non-goals

## Required Evidence

- Command output summary: focused trust test, project-entry, manifest, full self-check.
- Screenshots / traces if UI: not applicable.
- Review notes: real Pawcode plan predicate plus zero-overlap summary.
