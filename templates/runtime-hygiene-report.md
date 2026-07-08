# Runtime Hygiene Report

This report classifies Git, push, CI, artifact, bundle, or release-runtime blockers.

It does not approve commit, push, release, production, artifact deletion, gate bypass, or force push.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | `<plain summary>` |
| Plain next step | `<plain next step>` |
| Operation | `<commit/push/ci/release/artifact-cleanup/bundle-slimming>` |
| Runtime class | `<runtime class>` |
| Decision state | `<decision state>` |
| Technical terms required | `No` |

## Task Binding

| Field | Value |
| --- | --- |
| Task ref | `<task ref or N/A>` |
| Work Queue item ref | `<ref or N/A>` |
| Task Governance ref | `<ref or N/A>` |

## Git Context

| Field | Value |
| --- | --- |
| Branch | `<branch>` |
| Upstream | `<upstream or N/A>` |
| Origin main fresh | `<Yes/No/Unknown>` |
| Ahead count | `<number>` |
| Behind count | `<number>` |
| Current task commit isolated | `<Yes/No/Unknown>` |
| Force push required | `<Yes/No/Unknown>` |

## Gate Context

| Field | Value |
| --- | --- |
| Gate name | `<gate or N/A>` |
| Exit code | `<0/nonzero/Unknown>` |
| Failure class | `<class or N/A>` |
| Current task related | `<Yes/No/Unknown>` |
| Bypass recommended | `No` |

## Release Context

| Field | Value |
| --- | --- |
| Lane state | `<PREFLIGHT_ONLY/BUNDLE_CREATED/TEST_LANE_STARTED/PROD_FREEZE_ENTERED/PROD_DEPLOY_STARTED/PROD_DEPLOY_DONE/UNKNOWN>` |
| Production touched | `<Yes/No/Unknown>` |
| Release ID reusable | `<Yes/No/Unknown>` |
| Release owner required | `<Yes/No>` |

## Artifact Context

| Field | Value |
| --- | --- |
| Artifact quota blocked | `<Yes/No/Unknown>` |
| Artifact deletion required | `<Yes/No/Unknown>` |
| Artifact deletion irreversible | `<Yes/No/N/A>` |
| Preserve evidence artifacts | `Yes` |
| Preserve latest production bundle | `<Yes/No/Unknown>` |

## Bundle Context

| Field | Value |
| --- | --- |
| Bundle size status | `<OK/WARN/BLOCKED/Unknown>` |
| Suspected non-runtime content | `<items or []>` |
| Evidence removed | `No` |
| Bundle slimming recommended | `<Yes/No>` |

## Boundaries

- This report writes target files: No
- This report approves commit or push: No
- This report approves release or production: No
- This report bypasses gates: No
- This report deletes artifacts: No
- This report changes production: No
- This report force pushes: No

## Required Approval

| Field | Value |
| --- | --- |
| Approval required | `<Yes/No>` |
| Approval reason | `<reason or N/A>` |
| Approval scope | `<scope or N/A>` |

## Task Continuation

| Field | Value |
| --- | --- |
| Task remains open | `<Yes/No>` |
| Resume action | `<next action>` |
| Work Queue update required | `<Yes/No>` |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.86.0",
  "artifact_type": "runtime_hygiene",
  "runtime_hygiene_ref": "runtime-hygiene-reports/generated.md",
  "runtime_hygiene_digest": "sha256:<64 hex>",
  "task_ref": "task:<id>",
  "work_queue_item_ref": "N/A",
  "task_governance_ref": "N/A",
  "operation": "push",
  "runtime_class": "PRE_PUSH_GATE_FAILED",
  "decision_state": "CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR",
  "plain_user_summary": "<plain summary>",
  "plain_next_step": "<plain next step>",
  "technical_terms_required": "No",
  "git_context": {
    "branch": "<branch>",
    "upstream": "N/A",
    "origin_main_fresh": "Unknown",
    "ahead_count": 0,
    "behind_count": 0,
    "current_task_commit_isolated": "Unknown",
    "force_push_required": "No"
  },
  "gate_context": {
    "gate_name": "N/A",
    "exit_code": "Unknown",
    "failure_class": "N/A",
    "current_task_related": "Unknown",
    "bypass_recommended": "No"
  },
  "release_context": {
    "lane_state": "PREFLIGHT_ONLY",
    "production_touched": "No",
    "release_id_reusable": "Unknown",
    "release_owner_required": "No"
  },
  "artifact_context": {
    "artifact_quota_blocked": "No",
    "artifact_deletion_required": "No",
    "artifact_deletion_irreversible": "N/A",
    "preserve_evidence_artifacts": "Yes",
    "preserve_latest_production_bundle": "Unknown"
  },
  "bundle_context": {
    "bundle_size_status": "OK",
    "suspected_non_runtime_content": [],
    "evidence_removed": "No",
    "bundle_slimming_recommended": "No"
  },
  "boundaries": {
    "writes_target_files": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "bypasses_gates": "No",
    "deletes_artifacts": "No",
    "changes_production": "No",
    "force_pushes": "No"
  },
  "required_approval": {
    "approval_required": "No",
    "approval_reason": "N/A",
    "approval_scope": "N/A"
  },
  "task_continuation": {
    "task_remains_open": "Yes",
    "resume_action": "<next action>",
    "work_queue_update_required": "No"
  },
  "outcome": "CAN_CONTINUE_AFTER_PROJECT_GATE_REPAIR"
}
```

## Outcome

`<decision state>`
