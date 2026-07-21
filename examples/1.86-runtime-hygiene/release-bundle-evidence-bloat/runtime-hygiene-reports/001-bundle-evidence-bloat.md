# Runtime Hygiene Report

This report classifies Git, push, CI, artifact, bundle, or release-runtime blockers.

It does not approve commit, push, release, production, artifact deletion, gate bypass, or force push.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | The release bundle is too large because it appears to include non-runtime files. Evidence must be preserved outside the runtime bundle. |
| Plain next step | Narrow the runtime bundle and keep evidence indexed and hashed outside the bundle. |
| Operation | `bundle-slimming` |
| Runtime class | `RELEASE_BUNDLE_OVERSIZED` |
| Decision state | `NEEDS_PLAIN_USER_APPROVAL` |
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
| Bundle size status | `BLOCKED` |
| Suspected non-runtime content | `["docs/evidence","screenshots/videos/PDFs"]` |
| Evidence removed | `No` |
| Bundle slimming recommended | `Yes` |

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
| Approval required | `Yes` |
| Approval reason | Bundle contents need narrowing while preserving evidence. |
| Approval scope | exclude non-runtime evidence archives from runtime bundle |

## Task Continuation

| Field | Value |
| --- | --- |
| Task remains open | `Yes` |
| Resume action | Narrow the runtime bundle and keep evidence indexed and hashed outside the bundle. |
| Work Queue update required | `No` |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.86.0",
  "artifact_type": "runtime_hygiene",
  "runtime_hygiene_ref": "runtime-hygiene-reports/001-bundle-evidence-bloat.md",
  "runtime_hygiene_digest": "sha256:65e39cd543fd8c2331088aa9f37a341071d0b0705752165ccd8c700e9d202e04",
  "task_ref": "task:current",
  "intent_digest": "N/A",
  "work_queue_item_ref": "N/A",
  "task_governance_ref": "N/A",
  "operation": "bundle-slimming",
  "runtime_class": "RELEASE_BUNDLE_OVERSIZED",
  "decision_state": "NEEDS_PLAIN_USER_APPROVAL",
  "plain_user_summary": "The release bundle is too large because it appears to include non-runtime files. Evidence must be preserved outside the runtime bundle.",
  "plain_next_step": "Narrow the runtime bundle and keep evidence indexed and hashed outside the bundle.",
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
    "bundle_size_status": "BLOCKED",
    "suspected_non_runtime_content": [
      "docs/evidence",
      "screenshots/videos/PDFs"
    ],
    "evidence_removed": "No",
    "bundle_slimming_recommended": "Yes"
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
    "approval_required": "Yes",
    "approval_reason": "Bundle contents need narrowing while preserving evidence.",
    "approval_scope": "exclude non-runtime evidence archives from runtime bundle"
  },
  "task_continuation": {
    "task_remains_open": "Yes",
    "resume_action": "Narrow the runtime bundle and keep evidence indexed and hashed outside the bundle.",
    "work_queue_update_required": "No"
  },
  "outcome": "NEEDS_PLAIN_USER_APPROVAL"
}
```

## Outcome

`NEEDS_PLAIN_USER_APPROVAL`
