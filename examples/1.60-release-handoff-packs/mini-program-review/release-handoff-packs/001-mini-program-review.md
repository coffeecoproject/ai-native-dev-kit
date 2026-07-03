# Release Handoff Pack

## Human Summary
| Field | Value |
| --- | --- |
| Pack ID | `mini-program-review-handoff` |
| Recipe ID | `mini-program-review-handoff` |
| Release Target | `mini-program-review` |
| Execution Level | `PRODUCTION_HANDOFF` |
| Release Owner | HUMAN_REQUIRED: mini program release owner |
| Handoff State | `READY_FOR_HANDOFF_REVIEW` |
| Safe Next Step | Ready for handoff review, not release approval. Review with the release owner; high-risk actions remain human/external-system-owned. |

## Selected Recipe

| field | value |
| --- | --- |
| Recipe ID | `mini-program-review-handoff` |
| Recipe Status | `STRICT` |
| Platform Family | `mini-program` |
| Selection Confidence | `HIGH` |
| Safe First Target | `mini-program-review` |
| Recipe Ref | generated:resolve-platform-release-recipe |
| Notes | Explicit recipe requested: mini-program-review-handoff. |

## Required Approval

| field | value |
| --- | --- |
| Approval Type | `RELEASE_APPROVAL` |
| Approval Status | `APPROVED` |
| Release Target | mini-program-review |
| Approved Scope | mini program review handoff only |
| Approved By | HUMAN_REQUIRED: mini program release owner |
| Approval Time | 2026-07-03T00:00:00Z |
| Allowed Codex Actions | LOCAL_READ_ONLY inspect release checklist |
| Blocked Actions | upload, submit review, release reviewed version, secrets, provider API |
| Evidence Path | release-handoff-packs/001-mini-program-review.md |
| Expiry / Reconfirm By | 2026-07-10T00:00:00Z |

## Required Inputs

| input | minimumQuality |
| --- | --- |
| Release owner | HUMAN_REQUIRED: mini program release owner |
| Release SOP | docs/mini-program-release-sop.md |
| Rollback | docs/mini-program-rollback.md owned by mini program release owner restore condition: keep previous approved version |
| Monitoring | docs/mini-program-monitoring.md log owned by mini program release owner |

## Preflight Steps

| step | owner | riskClass |
| --- | --- | --- |
| Prepare mini-program review handoff checklist | CODEX_MAY_PREPARE | PREVIEW_PREPARE |

## Codex May Run

| action | riskClass | condition |
| --- | --- | --- |
| LOCAL_READ_ONLY inspect release checklist | LOCAL_READ_ONLY | Allowed only within structured approval, recipe policy, and stop conditions. |

## Human Must Run

| action | owner |
| --- | --- |
| Mini-program upload, review submission, release timing, rollback risk acceptance | HUMAN_REQUIRED |

## External System Must Run

| action | owner |
| --- | --- |
| Mini-program platform review and release controls | EXTERNAL_RELEASE_SYSTEM |

## Stop Conditions

| condition | response |
| --- | --- |
| Missing structured release approval | Stop for human decision. |
| Secret required | Stop for human or external system. |
| Remote-state mutation implied | Stop for human or external system. |
| Action outside pack execution level | Stop; this pack is PRODUCTION_HANDOFF. |

## Evidence To Capture

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Structured release approval | PASS | release-handoff-packs/001-mini-program-review.md | Approval type, target, scope, owner, allowed actions, blocked actions, evidence, and expiry. |
| Release SOP | PASS | docs/mini-program-release-sop.md | Project release procedure or owner-owned path. |
| Environment | PASS | mini program review environment reference | Target environment and non-secret setup reference. |
| Verification output | PASS | release-handoff-packs/001-mini-program-review.md | Command, timestamp, result, and path. |

## Rollback Evidence

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Rollback path | PASS | docs/mini-program-rollback.md owned by mini program release owner restore condition: keep previous approved version | Path, owner, and restoration condition. |

## Monitoring Evidence

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Monitoring path | PASS | docs/mini-program-monitoring.md log owned by mini program release owner | Dashboard/log/check path and owner. |

## Post-release Smoke

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Post-release smoke | PASS | review smoke checklist owned by mini program release owner | Target level, owner, read-only checks, and result path. |

## Post-release Close-out

| item | requirement |
| --- | --- |
| Actual executor | Record human or external release system that ran the release action. |
| Result | Record pass/fail, timestamp, target, and evidence path. |
| Rollback status | Record whether rollback is still available and who owns it. |
| Monitoring status | Record observation path and owner. |
| Unresolved decisions | Record remaining human decisions or N/A reason. |
| Pack limit | This pack remains PRODUCTION_HANDOFF; it is not release approval. |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.61.0",
  "artifact_type": "release_handoff_evidence",
  "artifact_id": "mini-program-review-handoff-mini-program-review",
  "handoff_evidence_digest": "sha256:48cf2cf320cf744a85c2e99ad81310fd75a2d174dd8312eb9cde1c5452524478",
  "handoff_pack": {
    "pack_id": "mini-program-review-handoff",
    "recipe_id": "mini-program-review-handoff",
    "release_target": "mini-program-review",
    "execution_level": "PRODUCTION_HANDOFF",
    "handoff_state": "READY_FOR_HANDOFF_REVIEW",
    "handoff_review_only": true
  },
  "structured_approval": {
    "approval_type": "RELEASE_APPROVAL",
    "approval_status": "APPROVED",
    "release_target": "mini-program-review",
    "approved_scope": "mini program review handoff only",
    "approved_by": "HUMAN_REQUIRED: mini program release owner",
    "approval_time": "2026-07-03T00:00:00Z",
    "allowed_codex_actions": [
      "LOCAL_READ_ONLY inspect release checklist"
    ],
    "blocked_actions": [
      "upload",
      "submit review",
      "release reviewed version",
      "secrets",
      "provider API"
    ],
    "evidence_path": "release-handoff-packs/001-mini-program-review.md",
    "expiry": "2026-07-10T00:00:00Z"
  },
  "release_owner": {
    "owner_type": "HUMAN_REQUIRED",
    "owner_ref": "HUMAN_REQUIRED: mini program release owner"
  },
  "rollback": {
    "path": "docs/mini-program-rollback.md owned by mini program release owner restore condition: keep previous approved version",
    "owner": "mini program release owner restore condition: keep previous approved version",
    "restore_condition": "keep previous approved version"
  },
  "monitoring": {
    "path": "docs/mini-program-monitoring.md log owned by mini program release owner",
    "owner": "mini program release owner",
    "signal_type": "log",
    "observation_path": "docs/mini-program-monitoring.md log owned by mini program release owner"
  },
  "post_release_smoke": {
    "target_level": "review",
    "owner": "mini program release owner",
    "read_only": true,
    "evidence_path": "review smoke checklist owned by mini program release owner"
  },
  "handoff_execution_boundary": {
    "handoff_is_execution_input": true,
    "execution_redefines_owner_evidence": false,
    "approves_release": false,
    "executes_release_commands": false,
    "codex_release_owner": false,
    "high_risk_actions_human_or_external": true
  },
  "outcome": "READY_FOR_HANDOFF_REVIEW"
}
```

## Release Guide Bridge

```bash
node scripts/cli.mjs release-guide . --intent "help me launch mini program review" --recipe-id mini-program-review-handoff --release-target mini-program-review
```

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare release execution" --mode PLAN_ONLY --release-target mini-program-review
```

## Known Limits

| limit |
| --- |
| Upload, review submission, and release remain human/platform-owned. |

## Boundaries

- This pack approves release: No
- This pack deploys, publishes, uploads, submits, migrates, or releases by itself: No
- This pack asks for or stores secrets: No
- This pack changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This pack makes Codex the release owner: No
- This pack treats structured approval as blanket authorization: No

## Outcome

`READY_FOR_HANDOFF_REVIEW`
