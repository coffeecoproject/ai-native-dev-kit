# Approval Record: <title>

## Human Decision Summary

Approval status: `<DRAFT | PENDING_REVIEW | APPROVED | REVOKED | EXPIRED>`

Conclusion: `<what is approved or not approved>`

Can Codex apply now: No

What I need from you: `<approval details / missing scope / no action>`

## Approval Identity

| Field | Value |
|---|---|
| Approved by | `CURRENT_CONVERSATION_USER` |
| Approval owner type | HUMAN |
| Approval captured from | `<conversation / issue / PR / ticket>` |
| Approval captured at | `<YYYY-MM-DD HH:mm TZ>` |
| Recorded by | Codex |

## Approved Plan

| Field | Value |
|---|---|
| Unified Apply Plan | `<path>` |
| Controlled Apply Readiness Report | `<path or N/A>` |
| Plan hash | `sha256:<64 hex>` |
| Plan version/date | `<version or date>` |
| Plan changed after approval | No |

## Approved Action IDs

| Action ID | Action type | Target paths | Approved? | Notes |
|---|---|---|---|---|
| `<A-001>` | `<WORKFLOW_ASSET_UPDATE>` | `<exact relative paths; no wildcard / traversal / symlink>` | Yes / No | `<notes>` |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.41.0",
  "artifact_type": "approval_record",
  "artifact_id": "<approval-record-id>",
  "approval_status": "PENDING_REVIEW",
  "approved_by": "CURRENT_CONVERSATION_USER",
  "approval_owner_type": "HUMAN",
  "approved_plan": {
    "path": "<apply-plan-path>",
    "plan_digest": "sha256:<matching-apply-plan-digest>"
  },
  "approved_action_ids": ["A-001"],
  "approved_action_paths": [
    {
      "id": "A-001",
      "target_paths": ["<exact-relative-path>"]
    }
  ],
  "expires_at": "<YYYY-MM-DDTHH:mm:ssZ>",
  "plan_changed_after_approval": false,
  "risk_acceptance": {
    "high_risk_action_included": false,
    "human_only_action_included": false
  },
  "rollback_reviewed": false,
  "verification_reviewed": false,
  "boundary": {
    "writes_files_now": false,
    "authorizes_automatic_apply": false,
    "approves_implementation": false,
    "approves_release_or_production": false,
    "installs_hooks_or_changes_ci": false,
    "enables_high_risk_actions": false,
    "lets_codex_proceed_without_readiness": false
  }
}
```

## Approval Scope

| Field | Value |
|---|---|
| Included target paths | `<exact relative paths; no wildcard / traversal / symlink>` |
| Excluded target paths | `<exact paths or N/A>` |
| Max change size | `<files or lines>` |
| Timebox | `<date or duration>` |
| Applies to future changes | No |

## Risk Acceptance

| Field | Value |
|---|---|
| Risk level | LOW_RISK / MEDIUM_REVIEW / HUMAN_ONLY / BLOCKED |
| High-risk action included | No |
| Human-only action included | No |
| Risk accepted by human | Yes / No |

## Expiry

| Field | Value |
|---|---|
| Approval expires at | `<YYYY-MM-DD HH:mm TZ>` |
| Re-approval required after expiry | Yes |

## Rollback Acknowledgement

| Field | Value |
|---|---|
| Rollback plan reviewed | Yes / No |
| Rollback owner | Human / Codex |
| Rollback evidence | `<path or command>` |

## Verification Acknowledgement

| Field | Value |
|---|---|
| Verification plan reviewed | Yes / No |
| Required post-apply verification | `<command or method>` |
| Evidence path | `<path>` |

## Human Approval Statement

`<Human approves explicit action IDs for exact scope only.>`

## Non-Authorizations

- This approval record writes files now: No
- This approval record authorizes automatic apply: No
- This approval record approves implementation: No
- This approval record approves release or production: No
- This approval record installs hooks or changes CI: No
- This approval record changes source of truth: No
- This approval record enables high-risk actions: No
- This approval record lets Codex proceed without readiness: No

## Evidence Links

| Evidence | Path |
|---|---|
| Apply plan | `<path>` |
| Readiness report | `<path or N/A>` |
| Conversation / ticket | `<path or ref>` |

## Audit Notes

`<notes>`
