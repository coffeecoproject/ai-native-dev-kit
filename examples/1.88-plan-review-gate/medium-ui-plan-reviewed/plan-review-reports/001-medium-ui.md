# Plan Review Report

## Human Summary

- Plain summary: The plan review passed. I can move to implementation review if the project workflow also allows it.
- Plain next step: Move to implementation review under the approved project scope; this report still does not approve implementation by itself.
- Plan review state: `PLAN_REVIEW_PASSED`
- Ready for implementation review: Yes
- This report authorizes implementation: No

## Plan Identity

| Field | Value |
| --- | --- |
| Plan ref | docs/example-plan.md |
| Plan digest | sha256:0943c3742cbbd1ac3c65ea1c1ad6ee2554edf4f12523e0a4cef84c4d9cd3686c |
| Plan task match | Yes |
| Task ref | task:update-appointment-list-ui-label |

## Task Governance Binding

| Field | Value |
| --- | --- |
| Task Governance ref | artifact:task-governance-reports/generated.md |
| Task Governance digest | sha256:7bcf98ac73191d2dcbc86aecbd4b22b9c8a0a29b60449e6c447f9cde5bdf31aa |
| Task impact | MEDIUM |
| Plan review required | Yes |
| Current task match | Yes |

## Review Surface Analysis

| Field | Value |
| --- | --- |
| Review surface ref | derived:plan-review-surface-matrix |
| Review surface digest | sha256:a9c4369a6337b9e05cefd79c06b5362dff93b9c14bf8e8ac22e2e5a49470d655 |
| Source | derived_plan_review_matrix |
| Derived by Plan Review | Yes |
| Current task match | Yes |
| User selected surfaces | No |

## Review Surface Matrix

| Surface | Required | Before implementation | After implementation | Reviewed | Human decision needed | Findings | Blocking |
| --- | --- | --- | --- | --- | --- | --- | --- |
| scope | Yes | Yes | Yes | Yes | No | 0 | No |
| verification | Yes | Yes | Yes | Yes | No | 0 | No |
| frontend_backend_consistency | Yes | Yes | Yes | Yes | No | 0 | No |

## Source Chain

| Source kind | Ref | Digest | State | Current task match | Project-native equivalent | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| N/A | N/A | N/A | N/A | N/A | N/A | N/A |

## Reviewed Surfaces

| Surface | Reviewed | Finding count | Notes |
| --- | --- | --- | --- |
| scope | Yes | 0 | Surface was reviewed against the plan. |
| verification | Yes | 0 | Surface was reviewed against the plan. |
| frontend_backend_consistency | Yes | 0 | Surface was reviewed against the plan. |

## Findings

| ID | Severity | Surface | Summary | Required action | Resolved | Accepted |
| --- | --- | --- | --- | --- | --- | --- |
| N/A | P3 | none | No blocking findings. | N/A | Yes | No |

## Revision Loop

| Field | Value |
| --- | --- |
| Round | 0 |
| Max automatic rounds | 2 |
| Requires revision | No |
| Previous plan digest | N/A |
| Rewrites original plan | No |

## Verification Command Review

| Field | Value |
| --- | --- |
| Commands reviewed | Yes |
| Commands exist in project | Unknown |
| Commands are project-native | Unknown |
| Commands target required behavior | Unknown |
| Commands executed by this report | No |
| Requires Test Evidence later | Yes |
| Fake or unstable command found | No |

## Subagent Review Routing

| Field | Value |
| --- | --- |
| Subagent review recommended | No |
| Run plan required | No |
| All subagents read-only | N/A |
| Subagent output is authority | No |
| All subagents closed or skipped | N/A |

## Boundaries

| Boundary | Value |
| --- | --- |
| This report writes target files | No |
| This report authorizes implementation | No |
| This report approves commit or push | No |
| This report approves release or production | No |
| This report executes tests | No |
| This report changes production | No |

## Outcome

`PLAN_REVIEW_PASSED`

## Machine-Readable Evidence

```json
{
  "schema_version": "1.88.0",
  "artifact_type": "plan_review",
  "plan_review_ref": "plan-review-reports/001-medium-ui.md",
  "plan_review_digest": "sha256:b497b91e0319db30a6d55f5214cfd18e6b306e6b75f43f642864a3f1cf30a869",
  "task_ref": "task:update-appointment-list-ui-label",
  "work_queue_item_ref": "N/A",
  "work_queue_item_digest": "N/A",
  "review_surface_analysis": {
    "ref": "derived:plan-review-surface-matrix",
    "digest": "sha256:a9c4369a6337b9e05cefd79c06b5362dff93b9c14bf8e8ac22e2e5a49470d655",
    "source": "derived_plan_review_matrix",
    "derived_by_plan_review": "Yes",
    "current_task_match": "Yes",
    "user_selected_surfaces": "No"
  },
  "task_governance": {
    "ref": "artifact:task-governance-reports/generated.md",
    "digest": "sha256:7bcf98ac73191d2dcbc86aecbd4b22b9c8a0a29b60449e6c447f9cde5bdf31aa",
    "task_ref": "task:update-appointment-list-ui-label",
    "task_impact": "MEDIUM",
    "plan_review_required": "Yes",
    "current_task_match": "Yes"
  },
  "source_chain": [],
  "plan_ref": "docs/example-plan.md",
  "plan_digest": "sha256:0943c3742cbbd1ac3c65ea1c1ad6ee2554edf4f12523e0a4cef84c4d9cd3686c",
  "plan_task_match": "Yes",
  "plan_review_state": "PLAN_REVIEW_PASSED",
  "pre_implementation_review_prerequisite_satisfied": "Yes",
  "ready_for_implementation_review": "Yes",
  "implementation_authorized_by_this_report": "No",
  "implementation_allowed_by_full_authority": "Unknown",
  "task_impact": "MEDIUM",
  "skip_review": {
    "skip_allowed": "No",
    "skip_source": "task_governance",
    "skip_reason": "N/A",
    "task_impact": "MEDIUM"
  },
  "required_review_surfaces": [
    "scope",
    "verification",
    "frontend_backend_consistency"
  ],
  "review_surface_matrix": [
    {
      "surface": "scope",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "verification",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "frontend_backend_consistency",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    }
  ],
  "subagent_review_routing": {
    "subagent_review_recommended": "No",
    "reason": "Main-thread structured review is enough for this task class.",
    "run_plan_required": "No",
    "run_plan_ref": "N/A",
    "all_subagents_read_only": "N/A",
    "subagent_output_is_authority": "No",
    "writer_subagent_used": "No",
    "all_subagents_closed_or_skipped": "N/A",
    "fallback_used": "No",
    "fallback_reason": "N/A"
  },
  "reviewed_surfaces": [
    {
      "surface": "scope",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "verification",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "frontend_backend_consistency",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    }
  ],
  "findings": [],
  "revision_loop": {
    "round": 0,
    "max_auto_rounds": 2,
    "requires_revision": "No",
    "previous_plan_digest": "N/A",
    "rewrites_original_plan": "No",
    "revised_plan_ref": "N/A"
  },
  "verification_command_review": {
    "commands_reviewed": "Yes",
    "commands_exist_in_project": "Unknown",
    "commands_are_project_native": "Unknown",
    "commands_target_required_behavior": "Unknown",
    "commands_executed_by_this_report": "No",
    "requires_test_evidence_later": "Yes",
    "fake_or_unstable_command_found": "No",
    "notes": "Commands were statically reviewed only; no tests were executed by this report."
  },
  "plain_user_summary": "The plan review passed. I can move to implementation review if the project workflow also allows it.",
  "plain_next_step": "Move to implementation review under the approved project scope; this report still does not approve implementation by itself.",
  "technical_terms_required": "No",
  "boundaries": {
    "writes_target_files": "No",
    "authorizes_implementation": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "executes_tests": "No",
    "changes_production": "No"
  },
  "outcome": "PLAN_REVIEW_PASSED"
}
```
