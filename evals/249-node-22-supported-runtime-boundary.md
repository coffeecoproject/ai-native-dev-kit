---
schema_version: 1.0
artifact_type: eval
number: 249
slug: node-22-supported-runtime-boundary
title: "node 22 supported runtime boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/249-node-22-supported-runtime-boundary.md
---
# Eval: node 22 supported runtime boundary

## Related Spec

`specs/249-node-22-supported-runtime-boundary.md`

## Must Pass

- [x] modified JavaScript syntax passes under Node 22.22.3
- [x] workflow artifact and manifest checks pass for the current task
- [x] full source self-check passes under Node 22.22.3
- [x] diff and change-boundary checks pass
- [x] no unrelated files changed
- [x] no unapproved dependency added

## Spec Alignment

- [x] Implementation matches acceptance criteria
- [x] Implementation respects non-goals
- [x] package engine contract matches spec
- [x] UI is confirmed not applicable
- [x] self-check output covers the runtime contract

## Permission / Data Checks

- [x] permissions are confirmed unchanged
- [x] target-project ownership is confirmed unchanged
- [x] target-project scope isolation is confirmed unchanged
- [x] no new error response or sensitive-data surface exists

## Manual Review Checklist

- Confirm both first-party workflows still specify `node-version: 22`.
- Confirm active user and maintainer entry documents no longer claim open-ended Node `>=22` support.
- Confirm no Node 23 compatibility fix or checker refactor entered the diff.

## Reject Conditions

Reject if:

- data can leak across users or authorized resource scopes
- permission checks only exist in frontend
- implementation modifies forbidden modules
- tests are missing for the highest-risk behavior
- task added unapproved dependencies
- task violates non-goals

## Required Evidence

- Command output summary: Node 22 syntax, current-task workflow artifacts, manifest, change boundary, full source self-check, and diff check.
- Screenshots / traces if UI: Not applicable; no UI change.
- Review notes: Compare the exact changed-file list with Task 249 and preserve Task 248 behavior and evidence.
