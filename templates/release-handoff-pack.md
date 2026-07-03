# Release Handoff Pack: <pack-id>

## Human Summary

| Field | Value |
|---|---|
| Pack ID | `<pack-id>` |
| Recipe ID | `<recipe-id>` |
| Release Target | `<preview/staging/production/review>` |
| Execution Level | `<PREVIEW_ASSIST/STAGING_HANDOFF/PRODUCTION_HANDOFF>` |
| Release Owner | `<HUMAN_REQUIRED or EXTERNAL_RELEASE_SYSTEM>` |
| Handoff State | `<BLOCKED_BY_STRUCTURED_APPROVAL/READY_FOR_HANDOFF_REVIEW>` |
| Meaning | Ready state means handoff review only, not release approval |

## Selected Recipe

| Field | Value |
|---|---|
| Recipe ID | `<recipe-id>` |
| Recipe Status | `<STRICT/DRAFT>` |
| Recipe Ref | `<path or generated ref>` |

## Required Approval

| Field | Value |
|---|---|
| Approval Type | `RELEASE_APPROVAL` |
| Approval Status | `<APPROVED/PENDING>` |
| Release Target | `<target>` |
| Approved Scope | `<scope>` |
| Approved By | `<person or role>` |
| Approval Time | `<timestamp>` |
| Allowed Codex Actions | `<local-safe actions or none>` |
| Blocked Actions | `<production/store/secret/remote actions>` |
| Evidence Path | `<path>` |
| Expiry / Reconfirm By | `<timestamp or condition>` |

## Required Inputs

| Input | Minimum Quality |
|---|---|
| Release owner | Named human owner or external release system |
| Release SOP | Documented path or owner-owned procedure |
| Rollback | Path, owner, and restoration condition |
| Monitoring | Dashboard/log/check path and owner |

## Preflight Steps

| Step | Owner | Risk Class |
|---|---|---|
| Inspect local release docs | `CODEX_MAY_RUN_AFTER_APPROVAL` | `LOCAL_READ_ONLY` |

## Codex May Run

| Action | Risk Class | Condition |
|---|---|---|
| None by default | `NO_RUN` | Requires structured approval, recipe policy, and local-safe classification |

## Human Must Run

| Action | Owner |
|---|---|
| Release approval and risk acceptance | `HUMAN_REQUIRED` |

## External System Must Run

| Action | Owner |
|---|---|
| Remote deploy / upload / submission when applicable | `EXTERNAL_RELEASE_SYSTEM` |

## Stop Conditions

| Condition | Response |
|---|---|
| Missing structured release approval | Stop for human decision |
| Secret required | Stop for human / external system |
| Remote-state mutation implied | Stop for human / external system |

## Evidence To Capture

| Evidence | Minimum Quality |
|---|---|
| Verification output | Command, timestamp, result, and path |
| Handoff owner | Named owner or external release system |

## Rollback Evidence

| Evidence | Minimum Quality |
|---|---|
| Rollback path | Path, owner, and restoration condition |

## Monitoring Evidence

| Evidence | Minimum Quality |
|---|---|
| Observation path | Dashboard/log/check path and owner |

## Post-release Smoke

| Smoke | Owner |
|---|---|
| Read-only smoke / observation | Human or Codex only if project policy explicitly allows |

## Post-release Close-out

| Item | Requirement |
|---|---|
| Final evidence | Record actual executor, result, rollback status, monitoring status, and unresolved decisions |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.61.0",
  "artifact_type": "release_handoff_evidence",
  "artifact_id": "<pack-id>",
  "handoff_evidence_digest": "sha256:<computed>",
  "handoff_pack": {
    "pack_id": "<pack-id>",
    "recipe_id": "<recipe-id>",
    "release_target": "<target>",
    "execution_level": "PREVIEW_ASSIST",
    "handoff_state": "READY_FOR_HANDOFF_REVIEW",
    "handoff_review_only": true
  },
  "structured_approval": {
    "approval_type": "RELEASE_APPROVAL",
    "approval_status": "APPROVED",
    "release_target": "<target>",
    "approved_scope": "<scope>",
    "approved_by": "<human owner>",
    "approval_time": "<timestamp>",
    "allowed_codex_actions": ["LOCAL_READ_ONLY"],
    "blocked_actions": ["production deploy", "provider API", "secrets"],
    "evidence_path": "<path>",
    "expiry": "<timestamp or condition>"
  },
  "release_owner": {
    "owner_type": "HUMAN_REQUIRED",
    "owner_ref": "<human owner>"
  },
  "rollback": {
    "path": "<rollback path>",
    "owner": "<rollback owner>",
    "restore_condition": "<when rollback is used>"
  },
  "monitoring": {
    "path": "<monitoring path>",
    "owner": "<monitoring owner>",
    "signal_type": "dashboard",
    "observation_path": "<observation path>"
  },
  "post_release_smoke": {
    "target_level": "preview",
    "owner": "<owner>",
    "read_only": true,
    "evidence_path": "<smoke evidence path>"
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
node scripts/cli.mjs release-guide . --intent "help me launch"
```

## Release Execution Bridge

```bash
node scripts/cli.mjs release-execution . --intent "prepare release execution" --mode PLAN_ONLY
```

## Known Limits

- This pack does not replace project release SOPs.
- This pack does not prove the release is correct.

## Boundaries

- This pack approves release: No
- This pack deploys, publishes, uploads, submits, migrates, or releases by itself: No
- This pack asks for or stores secrets: No
- This pack changes CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config: No
- This pack makes Codex the release owner: No
- This pack treats structured approval as blanket authorization: No

## Outcome

`HANDOFF_PACK_RECORDED`
