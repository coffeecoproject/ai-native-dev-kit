# Apply Execution Receipt: <id>

## Human Summary

Result: `<receipt-state>`

What changed: `<plain changed-file summary>`

Verification: `<plain verification result>`

Next safe action: `<next action>`

## Machine-Readable Evidence

```json
{
  "schema_version": "1.92.0",
  "artifact_type": "apply_execution_receipt",
  "artifact_id": "<id>",
  "receipt_state": "APPLY_VERIFIED",
  "project_identity": {
    "root_digest": "sha256:<project-root-identity>",
    "git_repository": true,
    "git_branch_before": "<branch-or-N/A>",
    "git_head_before": "<head-or-N/A>",
    "git_head_after": "<head-or-N/A>"
  },
  "execution_plan": {
    "path": "apply-execution-plans/<plan>.json",
    "plan_digest": "sha256:<plan-digest>",
    "intentos_version": "<version>",
    "manifest_digest": "sha256:<manifest-digest>"
  },
  "approval_record": {
    "path": "approval-records/<approval>.md",
    "artifact_id": "<approval-id>",
    "approved_by": "<specific-human>",
    "expires_at": "<future-date>"
  },
  "readiness_report": {
    "path": "apply-readiness-reports/<readiness>.md",
    "artifact_id": "<readiness-id>",
    "evidence_digest": "sha256:<evidence-digest>",
    "readiness_state": "READY_FOR_HUMAN_APPROVED_APPLY"
  },
  "actions": [],
  "unexpected_changed_paths": [],
  "activation": {
    "status": "VERIFIED",
    "workflow_next_exit_code": "0",
    "output_digest": "sha256:<output-digest>",
    "project_state": "<state>",
    "next_action": "<action>",
    "read_only": true
  },
  "rollback": {
    "required": true,
    "attempted": false,
    "verified": true,
    "backup_paths": []
  },
  "boundary": {
    "only_approved_actions_executed": true,
    "approves_business_implementation": false,
    "approves_release_or_production": false,
    "modifies_ci_or_hooks": false,
    "changes_project_authority": false,
    "proves_product_correctness": false
  },
  "outcome": "APPLY_VERIFIED"
}
```

## Boundary

- This receipt approves business implementation: No
- This receipt approves release or production: No
- This receipt modifies CI or hooks: No
- This receipt changes project authority: No
- This receipt proves product correctness: No

