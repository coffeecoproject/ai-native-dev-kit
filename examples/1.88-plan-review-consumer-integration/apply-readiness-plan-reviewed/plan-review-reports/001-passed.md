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
| Plan digest | sha256:92fbfc7e505af46ce750614be97656d0910c5a2632b5ac2c07bf0e986c7f8b28 |
| Plan task match | Yes |
| Task ref | task:change-permission-delete-behavior |

## Task Governance Binding

| Field | Value |
| --- | --- |
| Task Governance ref | artifact:task-governance-reports/generated.md |
| Task Governance digest | sha256:edf1d4633d2ac9cd0614dff8b13ce9337f5a8d4f7dacef89d0a7d40470b97dc1 |
| Task impact | HIGH |
| Plan review required | Yes |
| Current task match | Yes |

## Review Surface Analysis

| Field | Value |
| --- | --- |
| Review surface ref | artifact:review-surface-cards/generated.md |
| Review surface digest | sha256:c8357f92e2b0c299d24d2e0bb79942743b0119eb9623cecb4c0feb896ca4279f |
| Source | review_surface_card |
| Derived by Plan Review | No |
| Current task match | Yes |
| User selected surfaces | No |

## Review Surface Matrix

| Surface | Required | Before implementation | After implementation | Reviewed | Human decision needed | Findings | Blocking |
| --- | --- | --- | --- | --- | --- | --- | --- |
| scope | Yes | Yes | Yes | Yes | No | 0 | No |
| verification | Yes | Yes | Yes | Yes | No | 0 | No |
| permission | Yes | Yes | Yes | Yes | Yes | 0 | No |
| data_destructive | Yes | Yes | Yes | Yes | Yes | 0 | No |
| business_rule | Yes | Yes | Yes | Yes | Yes | 0 | No |
| frontend_backend_consistency | Yes | Yes | Yes | Yes | No | 0 | No |

## Source Chain

| Source kind | Ref | Digest | State | Current task match | Project-native equivalent | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| task_governance | artifact:task_governance/generated.md | sha256:b6e9765fb99582bd1a8ad78baf3c939ddd59a72fbbb7dde2af9f6c60910c999a | READY | Yes | Yes | codex |
| review_surface_card | artifact:review_surface_card/generated.md | sha256:17db363b5e050911d12c5a6010da7bc908119b4e56cf8476502f7b2fb3d99f22 | READY | Yes | No | codex |
| verification_plan | artifact:verification_plan/generated.md | sha256:ab2f688dbefa3848e4433f4fdd3d5464560cf479ce8344bc971d12440bbeb87e | READY | Yes | No | codex |
| business_rule_closure | artifact:business_rule_closure/generated.md | sha256:69bcd50544c479a92ae7a799df4bd6d088123fa0fab82056a33c9c823501e3ef | READY | Yes | No | internal-domain |
| change_impact_coverage | artifact:change_impact_coverage/generated.md | sha256:026be7facbd8d7ab2a498fb002604e9e23686cbdc69d93585c4892d9b3c1f459 | READY | Yes | No | codex |

## Reviewed Surfaces

| Surface | Reviewed | Finding count | Notes |
| --- | --- | --- | --- |
| scope | Yes | 0 | Surface was reviewed against the plan. |
| verification | Yes | 0 | Surface was reviewed against the plan. |
| permission | Yes | 0 | Surface was reviewed against the plan. |
| data_destructive | Yes | 0 | Surface was reviewed against the plan. |
| business_rule | Yes | 0 | Surface was reviewed against the plan. |
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
| Subagent review recommended | Yes |
| Run plan required | Yes |
| All subagents read-only | Yes |
| Subagent output is authority | No |
| All subagents closed or skipped | Yes |

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
  "plan_review_ref": "plan-review-reports/001-passed.md",
  "plan_review_digest": "sha256:3e1dc6a2b1c0dfad72574ebab045bfd0aa8ffabb4c859f17c48fad9ea771af03",
  "task_ref": "task:change-permission-delete-behavior",
  "work_queue_item_ref": "N/A",
  "work_queue_item_digest": "N/A",
  "review_surface_analysis": {
    "ref": "artifact:review-surface-cards/generated.md",
    "digest": "sha256:c8357f92e2b0c299d24d2e0bb79942743b0119eb9623cecb4c0feb896ca4279f",
    "source": "review_surface_card",
    "derived_by_plan_review": "No",
    "current_task_match": "Yes",
    "user_selected_surfaces": "No"
  },
  "task_governance": {
    "ref": "artifact:task-governance-reports/generated.md",
    "digest": "sha256:edf1d4633d2ac9cd0614dff8b13ce9337f5a8d4f7dacef89d0a7d40470b97dc1",
    "task_ref": "task:change-permission-delete-behavior",
    "task_impact": "HIGH",
    "plan_review_required": "Yes",
    "current_task_match": "Yes"
  },
  "source_chain": [
    {
      "source_kind": "task_governance",
      "source_ref": "artifact:task_governance/generated.md",
      "source_digest": "sha256:b6e9765fb99582bd1a8ad78baf3c939ddd59a72fbbb7dde2af9f6c60910c999a",
      "source_state": "READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "Yes",
      "owner": "codex",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "review_surface_card",
      "source_ref": "artifact:review_surface_card/generated.md",
      "source_digest": "sha256:17db363b5e050911d12c5a6010da7bc908119b4e56cf8476502f7b2fb3d99f22",
      "source_state": "READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "codex",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "verification_plan",
      "source_ref": "artifact:verification_plan/generated.md",
      "source_digest": "sha256:ab2f688dbefa3848e4433f4fdd3d5464560cf479ce8344bc971d12440bbeb87e",
      "source_state": "READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "codex",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "business_rule_closure",
      "source_ref": "artifact:business_rule_closure/generated.md",
      "source_digest": "sha256:69bcd50544c479a92ae7a799df4bd6d088123fa0fab82056a33c9c823501e3ef",
      "source_state": "READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "internal-domain",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "change_impact_coverage",
      "source_ref": "artifact:change_impact_coverage/generated.md",
      "source_digest": "sha256:026be7facbd8d7ab2a498fb002604e9e23686cbdc69d93585c4892d9b3c1f459",
      "source_state": "READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "codex",
      "contradicts_plan": "No"
    }
  ],
  "plan_ref": "apply-plans/001-structured-workflow-assets.md",
  "plan_digest": "sha256:30367640e8ad8a78b31135c99636042f2de697212e3123fb9687d24622658e96",
  "plan_task_match": "Yes",
  "plan_review_state": "PLAN_REVIEW_PASSED",
  "pre_implementation_review_prerequisite_satisfied": "Yes",
  "ready_for_implementation_review": "Yes",
  "implementation_authorized_by_this_report": "No",
  "implementation_allowed_by_full_authority": "Unknown",
  "task_impact": "HIGH",
  "skip_review": {
    "skip_allowed": "No",
    "skip_source": "task_governance",
    "skip_reason": "N/A",
    "task_impact": "HIGH"
  },
  "required_review_surfaces": [
    "scope",
    "verification",
    "permission",
    "data_destructive",
    "business_rule",
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
      "surface": "permission",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "Yes",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "data_destructive",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "Yes",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "business_rule",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "Yes",
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
    "subagent_review_recommended": "Yes",
    "reason": "High-impact or broad plan review benefits from independent read-only review.",
    "run_plan_required": "Yes",
    "run_plan_ref": "artifact:subagent-run-plans/generated.md",
    "all_subagents_read_only": "Yes",
    "subagent_output_is_authority": "No",
    "writer_subagent_used": "No",
    "all_subagents_closed_or_skipped": "Yes",
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
      "surface": "permission",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "data_destructive",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "business_rule",
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
