# Work Queue Takeover Report

This report provides the current Work Queue item consumed by the 1.85 example. It does not authorize implementation.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.84.1",
  "artifact_type": "work_queue_takeover",
  "source_inventory": [
    {
      "source_ref": "docs/sessions/S-001.md",
      "source_digest": "sha256:1111111111111111111111111111111111111111111111111111111111111111",
      "source_type": "session",
      "status": "CURRENT",
      "summary": "Current task session"
    }
  ],
  "queue_items": [
    {
      "item_id": "WQ-001",
      "state": "CURRENT",
      "title": "Change review workflow step policy after task submission",
      "source_item": "docs/sessions/S-001.md",
      "source_item_digest": "sha256:1111111111111111111111111111111111111111111111111111111111111111",
      "task_governance_ref": "task-governance-reports/001-task-governance.md",
      "task_governance_digest": "sha256:2222222222222222222222222222222222222222222222222222222222222222",
      "task_governance_binding_status": "VERIFIED",
      "execution_review_eligible_after_task_governance": "Yes",
      "execution_eligible": "Yes",
      "reason": "Current queue item is bound to Task Governance."
    }
  ]
}
```
