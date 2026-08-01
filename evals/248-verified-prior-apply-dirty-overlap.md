---
schema_version: 1.0
artifact_type: eval
number: 248
slug: verified-prior-apply-dirty-overlap
title: "verified prior apply dirty overlap"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
spec: specs/248-verified-prior-apply-dirty-overlap.md
---
# Eval: verified prior apply dirty overlap

## Related Spec

`specs/248-verified-prior-apply-dirty-overlap.md`

## Must Pass

- [x] syntax and diff checks pass
- [x] dirty activation unit matrix passes
- [x] consecutive controlled-update integration passes, including re-digested proof tampering
- [x] execution/distribution verification passes (72/72)
- [x] project-entry verification passes after the final test-only change (114/114)
- [x] full source self-check passes
- [x] no unrelated files changed
- [x] no unapproved dependency added

## Spec Alignment

- [x] Implementation matches acceptance criteria
- [x] Implementation respects non-goals
- [x] canonical fingerprint contract matches spec
- [x] strict prior receipt validator is the only path source
- [x] proof paths exactly equal the recomputed dirty/write intersection
- [x] prior receipt, plan, action ID, and hash bindings are canonical and current
- [x] plan tampering remains rejected by canonical rebuild

## Permission / Data Checks

- [x] request-bound apply authority remains required
- [x] unproved project-owned overlap fails closed
- [x] directory and inexact overlap fail closed
- [x] current hash drift removes prior-transaction ownership

## Manual Review Checklist

- [x] Pawcode v3 receipt validates strictly; its `.intentos/version.json` action is `APPLIED` and its current `hash_after` matches v4 `hashBefore`.
- [x] Pawcode v4 has only two managed writes plus its receipt, has no business path, lacks the new proof, remains rejected, and was not executed or reused.

## Reject Conditions

Reject if:

- data can leak across users or authorized resource scopes
- permission checks only exist in frontend
- implementation modifies forbidden modules
- tests are missing for the highest-risk behavior
- task added unapproved dependencies
- task violates non-goals

## Required Evidence

- Command output summary: focused unit/integration, execution/distribution, project-entry, manifest, full self-check.
- Screenshots / traces if UI: not applicable.
- Review notes: Pawcode v3/v4 exact receipt, hash, action, and overlap evidence.
