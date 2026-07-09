# Controlled Apply Readiness Report: <title>

## Human Decision Summary

Conclusion: `<NOT_READY | READY_FOR_HUMAN_APPROVED_APPLY | HUMAN_ONLY | BLOCKED | NO_APPLY_PLAN>`

Recommended choice: `<what the human should decide next>`

Can Codex apply now: No

What I need from you: `<approval / missing evidence / owner decision / no decision yet>`

## Apply Plan Reference

| Field | Value |
|---|---|
| Unified Apply Plan | `<path>` |
| Plan readable | Yes / No |
| Plan authorizes apply | No |
| Plan writes files now | No |
| Plan says Codex can write now | No |

## Readiness State

| Field | Value |
|---|---|
| State | `<NOT_READY | READY_FOR_HUMAN_APPROVED_APPLY | HUMAN_ONLY | BLOCKED | NO_APPLY_PLAN>` |
| Candidate for human-approved apply | Yes / No |
| Requires explicit human approval | Yes |
| Can proceed without new approval | No |

## Action Classification

| Action type | Target paths | Classification | Reason |
|---|---|---|---|
| `<ACTION_TYPE>` | `<paths>` | LOW_RISK_CANDIDATE / HUMAN_ONLY / BLOCKED | `<reason>` |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.41.0",
  "artifact_type": "controlled_apply_readiness",
  "artifact_id": "<readiness-id>",
  "readiness_state": "NOT_READY",
  "can_codex_apply_now": false,
  "requires_explicit_human_approval": true,
  "can_proceed_without_new_approval": false,
  "apply_plan": {
    "path": "<apply-plan-path>",
    "plan_digest": "sha256:<matching-apply-plan-digest>"
  },
  "actions": [
    {
      "id": "A-001",
      "classification": "LOW_RISK_CANDIDATE",
      "target_paths": ["<exact-relative-path>"]
    }
  ],
  "preconditions": [
    { "name": "Apply plan exists", "status": "pass" }
  ],
  "rollback": {
    "required": true,
    "path": "<backup-or-rollback-evidence-path>",
    "step": "<rollback step>",
    "verification": "<rollback verification>"
  },
  "verification": {
    "pre_apply": "<pre-apply verification>",
    "post_apply": "<post-apply verification>",
    "evidence_path": "<evidence-path>"
  },
  "plan_review_binding": {
    "required": "No",
    "plan_review_ref": "N/A",
    "plan_review_digest": "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    "plan_review_state": "NO_PLAN_REQUIRED",
    "plan_ref": "N/A",
    "plan_digest": "N/A",
    "task_ref": "N/A",
    "current_task_match": "N/A",
    "ready_for_implementation_review": "No",
    "implementation_authorized_by_this_report": "No",
    "reason": "Plan Review Gate is not required for this readiness report."
  },
  "boundary": {
    "writes_files_now": false,
    "authorizes_apply": false,
    "approves_implementation": false,
    "approves_release_or_production": false,
    "installs_hooks_or_changes_ci": false,
    "enables_high_risk_actions": false
  },
  "outcome": "READINESS_RECORDED"
}
```

## Preconditions

| Precondition | Status | Evidence |
|---|---|---|
| Apply plan exists | pass / fail | `<path>` |
| Git state safe | pass / fail / not checked | `<evidence>` |
| Target paths bounded | pass / fail | `<evidence>` |
| Backup plan exists | pass / fail | `<evidence>` |
| Rollback plan exists | pass / fail | `<evidence>` |
| Verification plan exists | pass / fail | `<evidence>` |
| Human approval recorded | pass / fail | `<evidence>` |

## Human-Only / Blocked Items

| Item | Reason | Owner |
|---|---|---|
| `<item>` | `<reason>` | Human / Codex |

## Backup / Rollback Readiness

| Field | Value |
|---|---|
| Backup required | Yes / No |
| Backup path | `<path or N/A>` |
| Rollback step | `<step>` |
| Rollback verification | `<command or method>` |

## Verification Readiness

| Field | Value |
|---|---|
| Pre-apply verification | `<command or method>` |
| Post-apply verification | `<command or method>` |
| Evidence path | `<path>` |
| Missing verification | Yes / No |

## Plan Review Binding

| Field | Value |
|---|---|
| Required | Yes / No |
| Plan Review Ref | `<artifact:plan-review-reports/...>` |
| Plan Review State | `<PLAN_REVIEW_PASSED | NO_PLAN_REQUIRED | blocked state>` |
| Current Task Match | Yes / No / N/A |
| Ready For Implementation Review | Yes / No |
| Implementation Authorized By This Report | No |

## Boundary

- This readiness report writes files now: No
- This readiness report authorizes apply: No
- This readiness report approves implementation: No
- This readiness report approves release or production: No
- This readiness report installs hooks or changes CI: No
- This readiness report changes source of truth: No
- This readiness report enables high-risk actions: No

## Outcome

`READINESS_RECORDED | NEEDS_HUMAN_DECISION | BLOCKED`
