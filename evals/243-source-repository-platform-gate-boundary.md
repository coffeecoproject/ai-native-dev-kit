---
schema_version: 1.0
artifact_type: eval
number: 243
slug: source-repository-platform-gate-boundary
title: "source repository platform gate boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
spec: specs/243-source-repository-platform-gate-boundary.md
---
# Eval: source repository platform gate boundary

## Related Spec

`specs/243-source-repository-platform-gate-boundary.md`

## Must Pass

- [ ] lint passes
- [ ] typecheck passes
- [ ] relevant tests pass
- [ ] build passes if applicable
- [ ] no unrelated files changed
- [ ] no unapproved dependency added

## Spec Alignment

- [ ] Implementation matches acceptance criteria
- [ ] Implementation respects non-goals
- [ ] API / interface contract matches spec
- [ ] UI states are covered if applicable
- [ ] observability requirements are covered if applicable

## Permission / Data Checks

- [ ] Permission checks are server-side where applicable
- [ ] Resource ownership is enforced
- [ ] Resource/scope isolation is enforced
- [ ] Error responses do not leak sensitive data

## Manual Review Checklist

- Source identity is strict and cannot be asserted by a target-only file.
- Only the platform gate is exempted.
- Remaining task/review/eval gates still execute.
- Historical batch assertions do not claim Task 119 is current after the source
  candidate changes; explicit current checks still fail closed on revision
  mismatch.

## Reject Conditions

Reject if:

- an ordinary or installed project can bypass the platform gate
- any unrelated workflow gate is skipped
- tests omit near-miss identities
- a stale Task 119 report is accepted as current authority
- dependencies, CI, target files, or release behavior change

## Required Evidence

- Command output summary: focused tests, Task 243 and Task 242 implementation
  artifact checks, full source self-check, syntax and diff checks.
- Screenshots / traces if UI: Not applicable.
- Review notes: inspect fail-closed source recognition and unchanged gates.
