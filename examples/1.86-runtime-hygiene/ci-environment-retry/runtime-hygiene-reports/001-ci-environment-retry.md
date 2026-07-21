# Runtime Hygiene Report

This report classifies Git, push, CI, artifact, bundle, or release-runtime blockers.

It does not approve commit, push, release, production, artifact deletion, gate bypass, or force push.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | The remote check failed for an environment or provider reason. The task stays open while I classify whether retry is safe. |
| Plain next step | Record the provider issue and retry only if project policy allows it. |
| Operation | `ci` |
| Runtime class | `CI_ENVIRONMENT_FAILURE` |
| Decision state | `CAN_CONTINUE_AUTOMATICALLY` |
| Technical terms required | `No` |

## Task Binding

| Field | Value |
| --- | --- |
| Task ref | `task:current` |
| Intent digest | `N/A` |
| Work Queue item ref | `N/A` |
| Task Governance ref | `N/A` |

## Git Context

| Field | Value |
| --- | --- |
| Branch | `main` |
| Upstream | `origin/main` |
| Origin main fresh | `Unknown` |
| Ahead count | `0` |
| Behind count | `0` |
| Current task commit isolated | `Unknown` |
| Force push required | `No` |

## Gate Context

| Field | Value |
| --- | --- |
| Gate name | `N/A` |
| Exit code | `Unknown` |
| Failure class | `N/A` |
| Current task related | `Unknown` |
| Bypass recommended | `No` |

## CI Context

| Field | Value |
| --- | --- |
| Retry policy allowed | `Yes` |
| Production side effect checked | `Yes` |
| CI log ref | `ci:run-123` |
| CI log digest | `sha256:0b298f65897f48e4c0f10f42f59c57e4d8e390392eb6774915eb8ccb30f6c75b` |

## Release Context

| Field | Value |
| --- | --- |
| Lane state | `PREFLIGHT_ONLY` |
| Production touched | `No` |
| Release ID reusable | `Yes` |
| Release owner required | `No` |

## Artifact Context

| Field | Value |
| --- | --- |
| Artifact quota blocked | `No` |
| Artifact deletion required | `No` |
| Artifact deletion irreversible | `N/A` |
| Preserve evidence artifacts | `Yes` |
| Preserve latest production bundle | `Unknown` |

## Bundle Context

| Field | Value |
| --- | --- |
| Bundle size status | `OK` |
| Suspected non-runtime content | `[]` |
| Evidence removed | `No` |
| Bundle slimming recommended | `No` |

## Runtime Source Trace

| Source | Ref | Digest | Present | Current task match |
| --- | --- | --- | --- | --- |
| `gate_output` | `N/A` | `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `No` | `Unknown` |
| `ci_log` | `file:evidence/ci-run-123.log` | `sha256:0c454bd4475239a817cd31c7933e9f46d5fb546ab3bb16eb0a454e22060d04a8` | `Yes` | `Unknown` |
| `artifact_error` | `N/A` | `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `No` | `Unknown` |
| `bundle_summary` | `N/A` | `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `No` | `Unknown` |
| `release_event` | `N/A` | `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `No` | `Unknown` |

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
| Approval required | `No` |
| Approval reason | N/A |
| Approval scope | N/A |

## Task Continuation

| Field | Value |
| --- | --- |
| Task remains open | `Yes` |
| Resume action | Record the provider issue and retry only if project policy allows it. |
| Work Queue update required | `No` |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.86.1",
  "artifact_type": "runtime_hygiene",
  "runtime_hygiene_ref": "runtime-hygiene-reports/001-ci-environment-retry.md",
  "runtime_hygiene_digest": "sha256:bfeda77439268892dea2c09e51d1ec72d60352267f48785509c6cbae5f8ea525",
  "task_ref": "task:current",
  "intent_digest": "N/A",
  "work_queue_item_ref": "N/A",
  "task_governance_ref": "N/A",
  "task_entry_binding": {
    "work_queue_item_ref": "N/A",
    "work_queue_item_digest": "sha256:e2f79e5b60330bba4c289962231b6ba2957d0b14e7deb3110417003c79dea635",
    "work_queue_item_state": "CURRENT",
    "work_queue_item_current_task_match": "Unknown",
    "approved_resume_review": "No",
    "resume_review_ref": "N/A",
    "resume_review_digest": "sha256:e2f79e5b60330bba4c289962231b6ba2957d0b14e7deb3110417003c79dea635",
    "resume_review_owner": "N/A",
    "resume_review_task_match": "No",
    "task_governance_ref": "N/A",
    "task_governance_digest": "sha256:e2f79e5b60330bba4c289962231b6ba2957d0b14e7deb3110417003c79dea635",
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
  "operation": "ci",
  "runtime_class": "CI_ENVIRONMENT_FAILURE",
  "decision_state": "CAN_CONTINUE_AUTOMATICALLY",
  "plain_user_summary": "The remote check failed for an environment or provider reason. The task stays open while I classify whether retry is safe.",
  "plain_next_step": "Record the provider issue and retry only if project policy allows it.",
  "technical_terms_required": "No",
  "git_context": {
    "branch": "main",
    "upstream": "origin/main",
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
    "retry_policy_allowed": "Yes",
    "production_side_effect_checked": "Yes",
    "ci_log_ref": "file:evidence/ci-run-123.log",
    "ci_log_digest": "sha256:0c454bd4475239a817cd31c7933e9f46d5fb546ab3bb16eb0a454e22060d04a8"
  },
  "release_context": {
    "lane_state": "PREFLIGHT_ONLY",
    "production_touched": "No",
    "release_id_reusable": "Yes",
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
  "runtime_source_trace": [
    {
      "source_kind": "gate_output",
      "source_ref": "N/A",
      "source_digest": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "source_present": "No",
      "current_task_match": "Unknown"
    },
    {
      "source_kind": "ci_log",
      "source_ref": "file:evidence/ci-run-123.log",
      "source_digest": "sha256:0c454bd4475239a817cd31c7933e9f46d5fb546ab3bb16eb0a454e22060d04a8",
      "source_present": "Yes",
      "current_task_match": "Unknown"
    },
    {
      "source_kind": "artifact_error",
      "source_ref": "N/A",
      "source_digest": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "source_present": "No",
      "current_task_match": "Unknown"
    },
    {
      "source_kind": "bundle_summary",
      "source_ref": "N/A",
      "source_digest": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "source_present": "No",
      "current_task_match": "Unknown"
    },
    {
      "source_kind": "release_event",
      "source_ref": "N/A",
      "source_digest": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
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
    "resume_action": "Record the provider issue and retry only if project policy allows it.",
    "work_queue_update_required": "No"
  },
  "outcome": "CAN_CONTINUE_AUTOMATICALLY"
}
```

## Outcome

`CAN_CONTINUE_AUTOMATICALLY`
