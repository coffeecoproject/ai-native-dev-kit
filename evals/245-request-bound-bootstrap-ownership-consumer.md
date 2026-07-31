---
schema_version: 1.0
artifact_type: eval
number: 245
slug: request-bound-bootstrap-ownership-consumer
title: "request bound bootstrap ownership consumer"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/245-request-bound-bootstrap-ownership-consumer.md
---
# Eval: request bound bootstrap ownership consumer

## Related Spec

`specs/245-request-bound-bootstrap-ownership-consumer.md`

## Must Pass

- [x] syntax and diff checks pass
- [x] request-bound authority focused tests pass
- [x] project-entry verification passes
- [x] full source self-check passes
- [x] no unrelated files changed
- [x] no dependency added

## Spec Alignment

- [x] Implementation matches acceptance criteria
- [x] Implementation respects non-goals
- [x] shared verifier is consumed by planner and request-bound authority
- [x] action ownership must exactly match independently recomputed evidence
- [x] Pawcode exact plan has zero request-bound graph errors and dirty-write overlap

## Permission / Data Checks

- [x] version-record ownership remains primary
- [x] forged/missing ownership, local edit, duplicate action, and plan drift fail closed
- [x] unmanaged workflow scripts remain protected
- [x] symlink and outside-root evidence remains rejected

## Manual Review Checklist

- Inspect the exact Pawcode A-754 ownership binding and authority result.
- Confirm no Pawcode managed asset was applied during this task.

## Reject Conditions

Reject if:

- action.ownership can authorize itself without independent evidence
- shared verification weakens any Task 244 exact binding
- implementation modifies forbidden modules
- tests are missing for the highest-risk behavior
- task added unapproved dependencies
- task violates non-goals

## Required Evidence

- Command output summary: focused tests, project-entry suite, manifest, full self-check.
- Screenshots / traces if UI: not applicable.
- Review notes: exact Pawcode plan graph and overlap summary.
