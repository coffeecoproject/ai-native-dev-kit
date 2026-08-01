---
schema_version: 1.0
artifact_type: spec
number: 248
slug: verified-prior-apply-dirty-overlap
title: "verified prior apply dirty overlap"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/248-verified-prior-apply-dirty-overlap.md
preflight: preflight/248-verified-prior-apply-dirty-overlap.md
---
# Spec 248: verified prior apply dirty overlap

## Status

Ready

## Source

- Request: `requests/248-verified-prior-apply-dirty-overlap.md`
- Preflight: `preflight/248-verified-prior-apply-dirty-overlap.md`

## Problem

第二次受控工作流更新的计划会再次写 `.intentos/version.json`。该文件已由第一次成功事务写入，因此 Git 显示 dirty；现有零重叠规则无法区分它与用户修改，导致已验证连续更新在激活阶段回滚。

## User Story

As a solo project maintainer,
I want consecutive controlled updates to recognize only exact files written by the latest still-valid apply receipt,
so that IntentOS can advance safely without weakening protection for project-owned dirty work.

## Scope

Included:

- Derive only the sorted exact intersection of current dirty paths and current planned writes.
- Prove every intersecting path from the newest currently valid Apply Receipt and its digest-valid execution plan, then record the receipt, plan, action, and hash bindings in the canonical target fingerprint.
- Permit dirty/write overlap only when the proof paths exactly equal the computed intersection and each current action is a supported managed update whose `hashBefore`, fingerprint hash, managed digest, and prior `hash_after` agree.
- Add unit rejection cases and a two-update generated-project integration regression.
- Record Task 248 review and change-boundary evidence.

## Non-goals

- No general dirty merge or directory overlap tolerance.
- No receipt, authority, readiness, workflow-state, or release schema redesign.
- No Pawcode business or product-file writes.
- No dependency, CI, hook, release, production, or external effects.

## Data Model Impact

New plan evidence field:

- `targetFingerprint.verifiedPriorApplyOverlap: object | null` — a canonical proof for the exact current dirty/write intersection. It binds the newest strictly valid prior Apply Receipt and execution plan by reference and digest, and binds each overlap path to its prior action ID and `hash_after`. It is `null` for clean or zero-overlap plans and whenever the full intersection cannot be proved.

## API / Interface Contract

### Canonical controlled-update plan

Input:

```json
{
  "targetRoot": "/project",
  "actions": []
}
```

Output:

```json
{
  "targetFingerprint": {
    "verifiedPriorApplyOverlap": {
      "state": "VERIFIED_PRIOR_APPLY_OVERLAP",
      "receiptRef": "artifact:apply-receipts/prior.md",
      "receiptFileDigest": "sha256:<receipt-bytes>",
      "executionPlanRef": "artifact:apply-execution-plans/prior.json",
      "executionPlanDigest": "sha256:<canonical-plan>",
      "paths": [
        {
          "path": ".intentos/version.json",
          "priorActionId": "A-999",
          "hashAfter": "sha256:<current-file>"
        }
      ]
    }
  }
}
```

Errors:

- Invalid/stale receipt or prior execution plan: contributes no proof.
- Missing or extra overlap path, current hash mismatch, action mismatch, or proof digest mismatch: contributes no proof and ordinary dirty overlap remains blocked.
- Unsafe, duplicate, unsorted, directory-level, non-managed, or inexact overlap: activation remains false.
- Canonical plan mismatch: apply validation rejects the plan.

## UI States

- Not applicable; source workflow logic only.

## Permission Rules

- No auth or user permission behavior changes.
- Request-bound apply and canonical-plan validation remain mandatory.

## Observability

- Logs: existing plan/apply diagnostic output.
- Metrics: not applicable.
- Audit events: plan fingerprint and Apply Receipt remain the durable evidence chain.

## Acceptance Criteria

- A first valid controlled update can be followed by a second update in the same dirty Git worktree.
- The second plan proves `.intentos/version.json` only when it is in the actual dirty/write intersection and the prior receipt and execution plan are fully valid and current.
- The exact prior-receipt-owned overlap passes activation; an unproved managed path, ancestor directory, malformed status row, unsupported action, or hash mismatch fails closed.
- Canonical plan validation recomputes the evidence so a hand-edited allowlist cannot authorize apply.
- Pawcode v4 remains rejected because it predates this canonical evidence field; any later Pawcode validation must generate a fresh plan and must not add a business path.
- Focused tests, execution/distribution suite, project-entry suite, manifest, diff and full source self-check pass.

## Test Plan

- Unit: extend dirty-worktree activation accept/reject matrix.
- Integration: generate, apply, then generate/apply a second controlled update while a dirty project-owned business file remains byte-for-byte unchanged.
- E2E: existing apply transaction and project-entry suites.
- Manual: validate Pawcode v3 receipt and confirm read-only that v4 is stale and still rejected; do not generate or apply a replacement plan in this task.

## Rollback Notes

Revert the bounded source commit. Pawcode v4 remains unapplied and cannot be reused regardless of the source result.

## Open Questions

- None.
