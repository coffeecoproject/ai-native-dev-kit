# Release Handoff Pack

## Human Summary
| Field | Value |
| --- | --- |
| Pack ID | `backend-api-release-handoff` |
| Recipe ID | `backend-api-handoff` |
| Release Target | `production-api-handoff` |
| Execution Level | `PRODUCTION_HANDOFF` |
| Release Owner | HUMAN_REQUIRED: backend release owner |
| Handoff State | `READY_FOR_HANDOFF_REVIEW` |
| Safe Next Step | Ready for handoff review, not release approval. Review with the release owner; high-risk actions remain human/external-system-owned. |

## Selected Recipe

| field | value |
| --- | --- |
| Recipe ID | `backend-api-handoff` |
| Recipe Status | `STRICT` |
| Platform Family | `backend-api` |
| Selection Confidence | `HIGH` |
| Safe First Target | `production-api-handoff` |
| Recipe Ref | generated:resolve-platform-release-recipe |
| Notes | Explicit recipe requested: backend-api-handoff. |

## Required Approval

| field | value |
| --- | --- |
| Approval Type | `RELEASE_APPROVAL` |
| Approval Status | `APPROVED` |
| Release Target | production-api-handoff |
| Approved Scope | backend api handoff only |
| Approved By | HUMAN_REQUIRED: backend release owner |
| Approval Time | 2026-07-03T00:00:00Z |
| Allowed Codex Actions | LOCAL_TEST npm test |
| Blocked Actions | production deploy, production migration, secrets, provider API, remote-state |
| Evidence Path | release-handoff-packs/001-backend-api-release.md |
| Expiry / Reconfirm By | 2026-07-10T00:00:00Z |

## Required Inputs

| input | minimumQuality |
| --- | --- |
| Release owner | HUMAN_REQUIRED: backend release owner |
| Release SOP | docs/backend-release-sop.md |
| Rollback | docs/backend-rollback.md owned by backend release owner restore condition: restore previous service version |
| Monitoring | docs/backend-monitoring.md healthcheck owned by backend release owner |

## Preflight Steps

| step | owner | riskClass |
| --- | --- | --- |
| Prepare backend verification, migration review, rollback, and monitoring handoff | CODEX_MAY_PREPARE | PREVIEW_PREPARE |

## Codex May Run

| action | riskClass | condition |
| --- | --- | --- |
| LOCAL_TEST npm test | LOCAL_TEST | Allowed only within structured approval, recipe policy, and stop conditions. |

## Human Must Run

| action | owner |
| --- | --- |
| Production deploy, production migration, data risk acceptance, rollback risk acceptance | HUMAN_REQUIRED |

## External System Must Run

| action | owner |
| --- | --- |
| Deployment platform, migration runner, monitoring and incident system | EXTERNAL_RELEASE_SYSTEM |

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
| Structured release approval | PASS | release-handoff-packs/001-backend-api-release.md | Approval type, target, scope, owner, allowed actions, blocked actions, evidence, and expiry. |
| Release SOP | PASS | docs/backend-release-sop.md | Project release procedure or owner-owned path. |
| Environment | PASS | production api environment reference without secrets | Target environment and non-secret setup reference. |
| Verification output | PASS | release-handoff-packs/001-backend-api-release.md | Command, timestamp, result, and path. |

## Rollback Evidence

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Rollback path | PASS | docs/backend-rollback.md owned by backend release owner restore condition: restore previous service version | Path, owner, and restoration condition. |

## Monitoring Evidence

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Monitoring path | PASS | docs/backend-monitoring.md healthcheck owned by backend release owner | Dashboard/log/check path and owner. |

## Post-release Smoke

| evidence | status | ref | minimumQuality |
| --- | --- | --- | --- |
| Post-release smoke | PASS | production read-only smoke checklist owned by backend release owner | Target level, owner, read-only checks, and result path. |

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
  "artifact_id": "backend-api-release-handoff-production-api-handoff",
  "handoff_evidence_digest": "sha256:e338087dca45664c8a57c032015c4b3e4340b55b3fd2c64bba7cb3f062879ff6",
  "handoff_pack": {
    "pack_id": "backend-api-release-handoff",
    "recipe_id": "backend-api-handoff",
    "release_target": "production-api-handoff",
    "execution_level": "PRODUCTION_HANDOFF",
    "handoff_state": "READY_FOR_HANDOFF_REVIEW",
    "handoff_review_only": true
  },
  "structured_approval": {
    "approval_type": "RELEASE_APPROVAL",
    "approval_status": "APPROVED",
    "release_target": "production-api-handoff",
    "approved_scope": "backend api handoff only",
    "approved_by": "HUMAN_REQUIRED: backend release owner",
    "approval_time": "2026-07-03T00:00:00Z",
    "allowed_codex_actions": [
      "LOCAL_TEST npm test"
    ],
    "blocked_actions": [
      "production deploy",
      "production migration",
      "secrets",
      "provider API",
      "remote-state"
    ],
    "evidence_path": "release-handoff-packs/001-backend-api-release.md",
    "expiry": "2026-07-10T00:00:00Z"
  },
  "release_owner": {
    "owner_type": "HUMAN_REQUIRED",
    "owner_ref": "HUMAN_REQUIRED: backend release owner"
  },
  "rollback": {
    "path": "docs/backend-rollback.md owned by backend release owner restore condition: restore previous service version",
    "owner": "backend release owner restore condition: restore previous service version",
    "restore_condition": "restore previous service version"
  },
  "monitoring": {
    "path": "docs/backend-monitoring.md healthcheck owned by backend release owner",
    "owner": "backend release owner",
    "signal_type": "healthcheck",
    "observation_path": "docs/backend-monitoring.md healthcheck owned by backend release owner"
  },
  "post_release_smoke": {
    "target_level": "production",
    "owner": "backend release owner",
    "read_only": true,
    "evidence_path": "production read-only smoke checklist owned by backend release owner"
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
node scripts/cli.mjs release-guide . --intent "help me launch backend api" --recipe-id backend-api-handoff --release-target production-api-handoff
```

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare release execution" --mode PLAN_ONLY --release-target production-api-handoff
```

## Known Limits

| limit |
| --- |
| Production migration and data-risk operations are never Codex-owned. |

## Boundaries

- This pack approves release: No
- This pack deploys, publishes, uploads, submits, migrates, or releases by itself: No
- This pack asks for or stores secrets: No
- This pack changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This pack makes Codex the release owner: No
- This pack treats structured approval as blanket authorization: No

## Outcome

`READY_FOR_HANDOFF_REVIEW`
