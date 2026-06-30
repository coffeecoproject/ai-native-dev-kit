# Unified Apply Plan: <name>

## Human Decision Summary

One-sentence conclusion:

Recommended choice:

Can Codex write now: No

Need from human:

If nothing is approved:

## Apply Readiness

| Field | Value |
|---|---|
| State | `PLAN_ONLY` |
| Can apply now? | No |
| Can AI write now? | No |
| Why |  |
| Recommended next step |  |

## Source Evidence

| Evidence | Ref | Status |
|---|---|---|
| Workflow Guidance Card |  | missing / present / not applicable |
| Workflow Adoption Map |  | missing / present / not applicable |
| Baseline Decision Card |  | missing / present / not applicable |
| Document Archive Apply Plan |  | missing / present / not applicable |
| Hook Policy / Hook Plan |  | missing / present / not applicable |
| Execution Closure Report |  | missing / present / not applicable |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.41.0",
  "artifact_type": "unified_apply_plan",
  "artifact_id": "<apply-plan-id>",
  "plan_digest": "sha256:<computed-from-canonical-json-with-plan_digest-omitted>",
  "intent": "<human-readable intent>",
  "state": "PLAN_ONLY",
  "can_apply_now": false,
  "can_codex_write_now": false,
  "actions": [
    {
      "id": "A-001",
      "action_type": "WORKFLOW_ASSET_UPDATE",
      "target_paths": ["<exact-relative-path>"],
      "risk_level": "STANDARD",
      "status": "PLAN_ONLY",
      "will_write_now": false,
      "approval_required": true,
      "rollback_required": true
    }
  ],
  "preconditions": ["<precondition>"],
  "rollback": {
    "required": true,
    "path": "<backup-or-rollback-evidence-path>",
    "step": "<rollback step>",
    "verification": "<rollback verification>"
  },
  "verification": [
    {
      "command_or_method": "<command or manual method>",
      "required_before_apply": true,
      "required_after_apply": true,
      "evidence_path": "<evidence-path>",
      "owner": "Codex"
    }
  ],
  "boundary": {
    "writes_files_now": false,
    "authorizes_apply": false,
    "approves_implementation": false,
    "approves_release_or_production": false,
    "modifies_ci_or_hooks_now": false,
    "changes_source_of_truth_now": false
  },
  "outcome": "NEEDS_HUMAN_DECISION"
}
```

## Planned Actions

| ID | Action type | Target paths | Reason | Status | Will write now | Approval required | Rollback required |
|---|---|---|---|---|---|---|---|
| A-001 | WORKFLOW_ASSET_UPDATE | `.ai-native`, `scripts/*` |  | PLAN_ONLY | No | Yes | Yes |

## Human-Only / Blocked Actions

| ID | Action type | Reason | Required owner | Status |
|---|---|---|---|---|
| H-001 |  |  | human | HUMAN_APPROVAL_REQUIRED |

## Preconditions

- Target project exists:
- Existing project rules reviewed:
- Dirty work reviewed:
- Required evidence linked:
- High-risk actions separated:

## Backup / Rollback Plan

| Action | Backup required | Backup path | Rollback step | Rollback verification |
|---|---|---|---|---|
| A-001 | Yes |  |  |  |

## Verification Plan

| Step | Command or method | Required before apply | Required after apply | Evidence path | Owner |
|---|---|---|---|---|---|
| Pre-apply check |  | Yes | No |  | Codex |
| Post-apply check |  | No | Yes |  | Codex |

## Human Decisions Needed

| Decision | Why it matters | Options | Recommended option | Owner | Status |
|---|---|---|---|---|---|
| Approve apply scope | Writes require explicit approval | approve / narrow / reject | narrow if unclear | human | PENDING |

## Boundary

- This plan writes files now: No
- This plan authorizes apply: No
- This plan approves implementation: No
- This plan approves release or production: No
- This plan modifies CI or hooks now: No
- This plan deletes or archives files now: No
- This plan changes source of truth now: No
- This plan grants Codex permission to continue beyond scope: No

## Outcome

`NEEDS_HUMAN_DECISION`
