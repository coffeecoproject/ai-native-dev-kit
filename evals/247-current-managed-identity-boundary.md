---
schema_version: 1.0
artifact_type: eval
number: 247
slug: current-managed-identity-boundary
title: "current managed identity boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/247-current-managed-identity-boundary.md
---
# Eval: current managed identity boundary

## Related Spec

`specs/247-current-managed-identity-boundary.md`

## Must Pass

- [x] syntax and diff checks pass
- [x] generated controlled-update regression passes
- [x] project-entry verification passes
- [x] full source self-check passes
- [x] no unrelated files changed
- [x] no unapproved dependency added

## Spec Alignment

- [x] Implementation matches acceptance criteria
- [x] Implementation respects non-goals
- [x] current asset-set contract matches spec
- [x] retired file remains preserved
- [x] current asset tamper remains fail-closed

## Permission / Data Checks

- [x] no permission or data behavior changed
- [x] missing current evidence fails closed
- [x] current hash drift fails closed
- [x] unsafe current paths fail closed

## Manual Review Checklist

- Confirm Pawcode `workflowAssets` excludes `scripts/verify.sh`.
- Confirm v3 bootstrap/update evidence mismatch list contains only that retired path.

## Reject Conditions

Reject if:

- data can leak across users or authorized resource scopes
- permission checks only exist in frontend
- implementation modifies forbidden modules
- tests are missing for the highest-risk behavior
- task added unapproved dependencies
- task violates non-goals

## Required Evidence

- Command output summary: focused generated parity, project-entry, manifest, full self-check.
- Screenshots / traces if UI: not applicable.
- Review notes: real Pawcode evidence diagnosis plus current-tamper regression.
