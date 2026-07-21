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
| Strict task entry binding | `<Yes/No; required before strict completion or delivery consumers>` |

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

## CI Context

| Field | Value |
| --- | --- |
| Retry policy allowed | `<Yes/No/Unknown>` |
| Production side effect checked | `<Yes/No/Unknown>` |
| CI log ref | `<ref or N/A>` |
| CI log digest | `sha256:<64 hex>` |

## Release Context

| Field | Value |
| --- | --- |
| Lane state | `<PREFLIGHT_ONLY/BUNDLE_CREATED/TEST_LANE_STARTED/PROD_FREEZE_ENTERED/PROD_DEPLOY_STARTED/PROD_DEPLOY_DONE/UNKNOWN>` |
| Production touched | `<Yes/No/Unknown>` |
| Release ID reusable | `<Yes/No/Unknown>` |
| Release owner required | `<Yes/No>` |

## Release Trust Binding

Use this section for `RELEASE_PREFLIGHT_READY`; otherwise record `N/A` values.

| Field | Value |
| --- | --- |
| Release candidate ref | `<project-relative file ref or N/A>` |
| Release candidate digest | `sha256:<64 hex>` |
| Candidate source revision | `<current Git revision or N/A>` |

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

## Runtime Source Trace

| Source | Ref | Digest | Present | Current task match |
| --- | --- | --- | --- | --- |
| `gate_output` | `<ref or N/A>` | `sha256:<64 hex>` | `<Yes/No>` | `<Yes/No/Unknown>` |
| `ci_log` | `<ref or N/A>` | `sha256:<64 hex>` | `<Yes/No>` | `<Yes/No/Unknown>` |
| `artifact_error` | `<ref or N/A>` | `sha256:<64 hex>` | `<Yes/No>` | `<Yes/No/Unknown>` |
| `bundle_summary` | `<ref or N/A>` | `sha256:<64 hex>` | `<Yes/No>` | `<Yes/No/Unknown>` |
| `release_event` | `<ref or N/A>` | `sha256:<64 hex>` | `<Yes/No>` | `<Yes/No/Unknown>` |

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
  "schema_version": "1.93.0",
  "artifact_type": "runtime_hygiene",
  "runtime_hygiene_ref": "runtime-hygiene-reports/generated.md",
  "runtime_hygiene_digest": "sha256:<64 hex>",
  "task_ref": "task:<id>",
  "intent_digest": "sha256:<64 hex>",
  "work_queue_item_ref": "N/A",
  "task_governance_ref": "N/A",
  "task_entry_binding": {
    "work_queue_item_ref": "N/A",
    "work_queue_item_digest": "sha256:<64 hex>",
    "work_queue_item_state": "CURRENT",
    "work_queue_item_current_task_match": "Unknown",
    "approved_resume_review": "No",
    "resume_review_ref": "N/A",
    "resume_review_digest": "sha256:<64 hex>",
    "resume_review_owner": "N/A",
    "resume_review_task_match": "No",
    "task_governance_ref": "N/A",
    "task_governance_digest": "sha256:<64 hex>",
    "task_governance_task_match": "Unknown",
    "task_governance_tier": "LOW",
    "task_governance_review_level": "LIGHTWEIGHT",
    "task_governance_blocks_completion": "No",
    "unresolved_task_governance_blockers": [],
    "tier_completion_requirements_satisfied": "Yes",
    "minimal_verification_status": "RECORDED",
    "targeted_verification_status": "NOT_APPLICABLE_WITH_REASON",
    "high_impact_evidence_chain_complete": "N/A",
    "plain_user_blocker": "N/A"
  },
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
  "ci_context": {
    "retry_policy_allowed": "Unknown",
    "production_side_effect_checked": "Unknown",
    "ci_log_ref": "N/A",
    "ci_log_digest": "sha256:<64 hex>"
  },
  "release_context": {
    "lane_state": "PREFLIGHT_ONLY",
    "production_touched": "No",
    "release_id_reusable": "Unknown",
    "release_owner_required": "No"
  },
  "release_trust_binding": {
    "release_candidate_ref": "N/A",
    "release_candidate_digest": "sha256:<64 hex>",
    "source_revision": "N/A"
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
  "runtime_source_trace": [
    {
      "source_kind": "gate_output",
      "source_ref": "N/A",
      "source_digest": "sha256:<64 hex>",
      "source_present": "No",
      "current_task_match": "Unknown"
    },
    {
      "source_kind": "ci_log",
      "source_ref": "N/A",
      "source_digest": "sha256:<64 hex>",
      "source_present": "No",
      "current_task_match": "Unknown"
    }
  ],
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
