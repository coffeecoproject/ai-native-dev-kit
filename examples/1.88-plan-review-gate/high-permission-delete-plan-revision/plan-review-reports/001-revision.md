# Plan Review Report

## Human Summary

- Plain summary: The plan is not ready yet. I found 3 issue(s) that must be fixed before coding.
- Plain next step: Update the plan to close the blocking gaps, then run the plan review again.
- Plan review state: `PLAN_REVISION_REQUIRED`
- Ready for implementation review: No
- This report authorizes implementation: No

## Plan Identity

| Field | Value |
| --- | --- |
| Plan ref | docs/example-plan.md |
| Plan digest | sha256:4d6416200445aa54b7499d2883485da9a8c8d1051ad24b1fc60343a501508f81 |
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
| Review surface ref | derived:plan-review-surface-matrix |
| Review surface digest | sha256:7bbc389b1f90fe5ff320462765e2d11b2e725695141e55b8fac54bf417b5afc1 |
| Source | derived_plan_review_matrix |
| Derived by Plan Review | Yes |
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
| review_surface_matrix | artifact:review_surface_matrix/generated.md | sha256:370f707e129b6ff2690db83441f44d11ed7aad0f6d6a65bd740364cbe0846064 | READY | Yes | No | codex |
| verification_plan | artifact:verification_plan/generated.md | sha256:c18a71d8a51bd6604e2a234af178361d3aed6b0c7bff3628d9aab6097163a696 | READY | Yes | No | codex |
| business_rule_closure | artifact:business_rule_closure/generated.md | sha256:69bcd50544c479a92ae7a799df4bd6d088123fa0fab82056a33c9c823501e3ef | READY | Yes | No | internal-domain |
| change_impact_coverage | artifact:change_impact_coverage/generated.md | sha256:026be7facbd8d7ab2a498fb002604e9e23686cbdc69d93585c4892d9b3c1f459 | READY | Yes | No | codex |

## Reviewed Surfaces

| Surface | Reviewed | Finding count | Notes |
| --- | --- | --- | --- |
| scope | Yes | 0 | Surface was reviewed against the plan. |
| verification | Yes | 0 | Surface was reviewed against the plan. |
| permission | Yes | 1 | Surface was reviewed against the plan. |
| data_destructive | Yes | 1 | Surface was reviewed against the plan. |
| business_rule | Yes | 0 | Surface was reviewed against the plan. |
| frontend_backend_consistency | Yes | 1 | Surface was reviewed against the plan. |

## Findings

| ID | Severity | Surface | Summary | Required action | Resolved | Accepted |
| --- | --- | --- | --- | --- | --- | --- |
| P1-001 | P1 | permission | Permission plan does not cover existence leakage or error priority. | Specify the unauthorized actor error order before coding. | No | No |
| P1-002 | P1 | data_destructive | Deletion plan does not cover historical associations and audit-before-delete. | Specify historical guards and audit sequencing before coding. | No | No |
| P2-001 | P2 | frontend_backend_consistency | Frontend/backend authority boundary is weak. | Make backend authority and capability source explicit. | No | No |

## Revision Loop

| Field | Value |
| --- | --- |
| Round | 1 |
| Max automatic rounds | 2 |
| Requires revision | Yes |
| Previous plan digest | sha256:4d6416200445aa54b7499d2883485da9a8c8d1051ad24b1fc60343a501508f81 |
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
| All subagents closed or skipped | Unknown |

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

`PLAN_REVISION_REQUIRED`

## Machine-Readable Evidence

```json
{
  "schema_version": "1.88.0",
  "artifact_type": "plan_review",
  "plan_review_ref": "plan-review-reports/001-revision.md",
  "plan_review_digest": "sha256:30d0154163edb98838542453b4501723015e597ed2f0aeca6fd74bd078982660",
  "task_ref": "task:change-permission-delete-behavior",
  "intent": "change permission delete behavior",
  "intent_digest": "sha256:0855eea6547fddac76f211fc9807ced2560bc73115a2b4be30d3d6132a413547",
  "work_queue_item_ref": "N/A",
  "work_queue_item_digest": "N/A",
  "review_surface_analysis": {
    "ref": "derived:plan-review-surface-matrix",
    "digest": "sha256:7bbc389b1f90fe5ff320462765e2d11b2e725695141e55b8fac54bf417b5afc1",
    "source": "derived_plan_review_matrix",
    "derived_by_plan_review": "Yes",
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
      "source_kind": "review_surface_matrix",
      "source_ref": "artifact:review_surface_matrix/generated.md",
      "source_digest": "sha256:370f707e129b6ff2690db83441f44d11ed7aad0f6d6a65bd740364cbe0846064",
      "source_state": "READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "codex",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "verification_plan",
      "source_ref": "artifact:verification_plan/generated.md",
      "source_digest": "sha256:c18a71d8a51bd6604e2a234af178361d3aed6b0c7bff3628d9aab6097163a696",
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
  "plan_ref": "docs/example-plan.md",
  "plan_digest": "sha256:4d6416200445aa54b7499d2883485da9a8c8d1051ad24b1fc60343a501508f81",
  "plan_task_match": "Yes",
  "plan_review_state": "PLAN_REVISION_REQUIRED",
  "pre_implementation_review_prerequisite_satisfied": "No",
  "ready_for_implementation_review": "No",
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
    "all_subagents_closed_or_skipped": "Unknown",
    "fallback_used": "Yes",
    "fallback_reason": "No external subagent output is attached; main-thread structured review is recorded as fallback."
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
      "finding_count": 1,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "data_destructive",
      "reviewed": "Yes",
      "finding_count": 1,
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
      "finding_count": 1,
      "notes": "Surface was reviewed against the plan."
    }
  ],
  "findings": [
    {
      "id": "P1-001",
      "severity": "P1",
      "surface": "permission",
      "summary": "Permission plan does not cover existence leakage or error priority.",
      "required_action": "Specify the unauthorized actor error order before coding.",
      "resolved": "No",
      "accepted": "No",
      "accepted_by_ref": "N/A",
      "acceptance_reason": "N/A",
      "acceptance_scope": "N/A",
      "expires_at": "N/A",
      "allowed_for_task_impact": "N/A"
    },
    {
      "id": "P1-002",
      "severity": "P1",
      "surface": "data_destructive",
      "summary": "Deletion plan does not cover historical associations and audit-before-delete.",
      "required_action": "Specify historical guards and audit sequencing before coding.",
      "resolved": "No",
      "accepted": "No",
      "accepted_by_ref": "N/A",
      "acceptance_reason": "N/A",
      "acceptance_scope": "N/A",
      "expires_at": "N/A",
      "allowed_for_task_impact": "N/A"
    },
    {
      "id": "P2-001",
      "severity": "P2",
      "surface": "frontend_backend_consistency",
      "summary": "Frontend/backend authority boundary is weak.",
      "required_action": "Make backend authority and capability source explicit.",
      "resolved": "No",
      "accepted": "No",
      "accepted_by_ref": "N/A",
      "acceptance_reason": "N/A",
      "acceptance_scope": "N/A",
      "expires_at": "N/A",
      "allowed_for_task_impact": "N/A"
    }
  ],
  "revision_loop": {
    "round": 1,
    "max_auto_rounds": 2,
    "requires_revision": "Yes",
    "previous_plan_digest": "sha256:4d6416200445aa54b7499d2883485da9a8c8d1051ad24b1fc60343a501508f81",
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
  "plain_user_summary": "The plan is not ready yet. I found 3 issue(s) that must be fixed before coding.",
  "plain_next_step": "Update the plan to close the blocking gaps, then run the plan review again.",
  "technical_terms_required": "No",
  "boundaries": {
    "writes_target_files": "No",
    "authorizes_implementation": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "executes_tests": "No",
    "changes_production": "No"
  },
  "outcome": "PLAN_REVISION_REQUIRED"
}
```
