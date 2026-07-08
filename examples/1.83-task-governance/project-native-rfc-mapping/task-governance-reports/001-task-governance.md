# Task Governance Report

This report classifies task impact and routes required governance. It does not authorize implementation or completion.

## Human Summary

| Field | Value |
| --- | --- |
| Plain user summary | 这个需求影响较大。我会先梳理业务规则、影响范围和验证方式，再进入实现。 |
| Task impact | `HIGH` |
| Plain next step | 这个任务影响较大。我会先整理业务规则、影响面、执行计划和验证清单，再进入实现评审。 |
| Ready for implementation review | `No` |
| Implementation authorized by this report | `No` |
| Can claim done | `No` |
| Review level | `FULL` |

## Impact Classification

| Field | Value |
| --- | --- |
| Confidence | `high` |
| Task kind | `code_behavior` |
| Triggered surfaces | runtime workflow state, review approval settlement |
| Low impact reason | N/A |
| Medium impact reason | N/A |
| Upgrade history | none |

## Excluded High-Impact Surfaces

| Surface | Excluded | Reason |
| --- | --- | --- |
| DB | Yes | No DB impact is indicated by the current classification. |
| API contract | Yes | No API contract impact is indicated by the current classification. |
| runtime state | No | runtime state is part of the triggered high-impact surface. |
| permission | Yes | No permission impact is indicated by the current classification. |
| business rule | No | business rule is part of the triggered high-impact surface. |
| release/production | Yes | No release/production impact is indicated by the current classification. |
| CI/hooks | Yes | No CI/hooks impact is indicated by the current classification. |
## Required Before Implementation Review

| Requirement | Required |
| --- | --- |
| Scope check | `Yes` |
| Short plan | `No` |
| Business Rule Closure | `Yes` |
| Change Impact Coverage | `Yes` |
| Execution Plan | `Yes` |
| Verification Plan | `Yes` |

## Required Before Completion Claim

| Requirement | Required |
| --- | --- |
| Test Evidence | `Yes` |
| Execution Assurance | `Yes` |
| Completion Evidence | `Yes` |

## Review Policy

| Field | Value |
| --- | --- |
| Review level | `FULL` |
| Codex self-check required | `Yes` |
| Independent review required | `Yes` |
| Review must happen before | `implementation_and_completion` |
| Review source | `review_loop_or_project_native_review` |
| Review must cover | business rule closure; change impact coverage; execution plan; verification plan; test evidence; execution assurance; completion evidence |
| Skip full review reason | HIGH tasks cannot skip the full review chain. |

## Existing Project Mapping

| Required Behavior | Project-Native Evidence | Digest | Owner | Scope | Task Match | State | Stronger Rule Preserved | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Business Rule Closure | artifact:docs/rfc-approval-review-workflow.md | sha256:167acefe4e69f6b28f85239930a412a5fdbababfd00e630e10973b66e572c899 | Project owner | task_specific | Yes | MATCHED | N/A | Project RFC describes user-visible behavior, backend rule, edge cases, audit behavior, and verification expectations. |
| Verification Plan | artifact:docs/rfc-approval-review-workflow.md | sha256:167acefe4e69f6b28f85239930a412a5fdbababfd00e630e10973b66e572c899 | Project owner | task_specific | Yes | MATCHED | N/A | Project RFC includes concrete transition, rejection, and settlement verification expectations. |

## Source Chain

| Source | Status | Ref | Task Match |
| --- | --- | --- | --- |
| task_intent | READY | intent:current-request | Yes |
| adoption_review | NOT_APPLICABLE | N/A | Unknown |

## Lightweight Close-Out

| Field | Value |
| --- | --- |
| Scope unchanged | `N/A` |
| Minimal verification status | `NOT_APPLICABLE_WITH_REASON` |
| Targeted verification status | `NOT_APPLICABLE_WITH_REASON` |
| Unrelated edits | `No` |
| Remaining risk | High-impact governance is required before implementation review. |

## Readiness

| Field | Value |
| --- | --- |
| Governance prerequisites satisfied | `No` |
| Ready for implementation review | `No` |
| Implementation authorized by this report | `No` |
| Can claim done | `No` |
| Blocked by | missing affected-surface map; missing durable execution plan; test proof is required before any done claim |

## Boundaries

| Boundary | Value |
| --- | --- |
| Writes target files | `No` |
| Authorizes implementation | `No` |
| Approves commit or push | `No` |
| Approves release or production | `No` |
| Executes tests | `No` |
| Executes migrations | `No` |
| Changes CI or hooks | `No` |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.83.3",
  "artifact_type": "task_governance",
  "intent": "change approval review workflow state transition with project RFC evidence",
  "intent_digest": "sha256:c1d6bcf27a5e43e9573db4325acf17dc3213b20a8cac1c92c8c456bf63445039",
  "task_governance_ref": "task-governance-reports/001-task-governance.md",
  "task_governance_digest": "sha256:f05869018d386c7ed60e089c6ce7b61bc8c4d70d21239823e5943e197521a431",
  "task_ref": "task:change-approval-review-workflow-state-transition-with-projec",
  "project_adoption_mode": "unknown",
  "adoption_review": {
    "ref": "N/A",
    "digest": "N/A",
    "state": "N/A",
    "current_project_match": "Unknown",
    "blocks_task_governance": "No"
  },
  "impact_classification": {
    "task_impact": "HIGH",
    "confidence": "high",
    "task_kind": "code_behavior",
    "triggered_surfaces": [
      "runtime workflow state",
      "review approval settlement"
    ],
    "trigger_evidence": [
      "Intent matched high-impact surface: runtime workflow state",
      "Intent matched high-impact surface: review approval settlement"
    ],
    "excluded_high_impact_surfaces": [
      {
        "surface": "DB",
        "excluded": "Yes",
        "reason": "No DB impact is indicated by the current classification."
      },
      {
        "surface": "API contract",
        "excluded": "Yes",
        "reason": "No API contract impact is indicated by the current classification."
      },
      {
        "surface": "runtime state",
        "excluded": "No",
        "reason": "runtime state is part of the triggered high-impact surface."
      },
      {
        "surface": "permission",
        "excluded": "Yes",
        "reason": "No permission impact is indicated by the current classification."
      },
      {
        "surface": "business rule",
        "excluded": "No",
        "reason": "business rule is part of the triggered high-impact surface."
      },
      {
        "surface": "release/production",
        "excluded": "Yes",
        "reason": "No release/production impact is indicated by the current classification."
      },
      {
        "surface": "CI/hooks",
        "excluded": "Yes",
        "reason": "No CI/hooks impact is indicated by the current classification."
      }
    ],
    "low_impact_reason": "",
    "medium_impact_reason": "",
    "possible_high_resolution": {
      "initial_state": "N/A",
      "resolution": "N/A",
      "inspection_ref": "",
      "inspection_digest": "",
      "reason": ""
    },
    "upgrade_history": []
  },
  "required_before_implementation_review": {
    "scope_check_required": "Yes",
    "short_plan_required": "No",
    "business_rule_closure_required": "Yes",
    "change_impact_coverage_required": "Yes",
    "execution_plan_required": "Yes",
    "verification_plan_required": "Yes"
  },
  "required_before_completion_claim": {
    "test_evidence_required": "Yes",
    "execution_assurance_required": "Yes",
    "completion_evidence_required": "Yes"
  },
  "source_chain": [
    {
      "name": "task_intent",
      "status": "READY",
      "ref": "intent:current-request",
      "digest": "sha256:c1d6bcf27a5e43e9573db4325acf17dc3213b20a8cac1c92c8c456bf63445039",
      "state": "HIGH",
      "current_task_match": "Yes",
      "not_applicable_reason": ""
    },
    {
      "name": "adoption_review",
      "status": "NOT_APPLICABLE",
      "ref": "N/A",
      "digest": "N/A",
      "state": "N/A",
      "current_task_match": "Unknown",
      "not_applicable_reason": "No current Controlled Native Adoption Review report was found."
    }
  ],
  "existing_project_mapping": [
    {
      "required_behavior": "Business Rule Closure",
      "project_native_evidence_ref": "artifact:docs/rfc-approval-review-workflow.md",
      "mapping_state": "MATCHED",
      "stronger_project_rule_preserved": "N/A",
      "reason": "Project RFC describes user-visible behavior, backend rule, edge cases, audit behavior, and verification expectations.",
      "project_native_evidence_digest": "sha256:167acefe4e69f6b28f85239930a412a5fdbababfd00e630e10973b66e572c899",
      "project_native_evidence_owner": "Project owner",
      "project_native_evidence_scope": "task_specific",
      "project_native_task_match": "Yes",
      "project_native_evidence_summary": "Project RFC describes user-visible behavior, backend rule, edge cases, audit behavior, and verification expectations."
    },
    {
      "required_behavior": "Verification Plan",
      "project_native_evidence_ref": "artifact:docs/rfc-approval-review-workflow.md",
      "mapping_state": "MATCHED",
      "stronger_project_rule_preserved": "N/A",
      "reason": "Project RFC includes concrete transition, rejection, and settlement verification expectations.",
      "project_native_evidence_digest": "sha256:167acefe4e69f6b28f85239930a412a5fdbababfd00e630e10973b66e572c899",
      "project_native_evidence_owner": "Project owner",
      "project_native_evidence_scope": "task_specific",
      "project_native_task_match": "Yes",
      "project_native_evidence_summary": "Project RFC includes concrete transition, rejection, and settlement verification expectations."
    }
  ],
  "readiness": {
    "governance_prerequisites_satisfied": "No",
    "ready_for_implementation_review": "No",
    "implementation_authorized_by_this_report": "No",
    "can_claim_done": "No",
    "blocked_by": [
      "missing affected-surface map",
      "missing durable execution plan",
      "test proof is required before any done claim"
    ]
  },
  "lightweight_closeout": {
    "scope_unchanged": "N/A",
    "unrelated_edits": "No",
    "remaining_risk": "High-impact governance is required before implementation review.",
    "minimal_verification_status": "NOT_APPLICABLE_WITH_REASON",
    "targeted_verification_status": "NOT_APPLICABLE_WITH_REASON"
  },
  "user_prompt": {
    "plain_next_step": "这个任务影响较大。我会先整理业务规则、影响面、执行计划和验证清单，再进入实现评审。",
    "technical_terms_required": "No",
    "plain_user_summary": "这个需求影响较大。我会先梳理业务规则、影响范围和验证方式，再进入实现。"
  },
  "boundaries": {
    "writes_target_files": "No",
    "authorizes_implementation": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "executes_tests": "No",
    "executes_migrations": "No",
    "changes_ci_or_hooks": "No"
  },
  "outcome": "HIGH_REQUIRES_FULL_GOVERNANCE",
  "review_policy": {
    "review_level": "FULL",
    "codex_self_check_required": "Yes",
    "independent_review_required": "Yes",
    "review_must_happen_before": "implementation_and_completion",
    "review_must_cover": [
      "business rule closure",
      "change impact coverage",
      "execution plan",
      "verification plan",
      "test evidence",
      "execution assurance",
      "completion evidence"
    ],
    "review_source": "review_loop_or_project_native_review",
    "skip_full_review_reason": "HIGH tasks cannot skip the full review chain."
  }
}
```

## Outcome

`HIGH_REQUIRES_FULL_GOVERNANCE`
