# Task Governance Report

This report classifies task impact and routes required governance. It does not authorize implementation or completion.

## Human Summary

| Field | Value |
| --- | --- |
| Task impact | `HIGH` |
| Plain next step | 这个任务影响较大。我会先整理业务规则、影响面、执行计划和验证清单，再进入实现评审。 |
| Ready for implementation review | `No` |
| Implementation authorized by this report | `No` |
| Can claim done | `No` |

## Impact Classification

| Field | Value |
| --- | --- |
| Confidence | `high` |
| Task kind | `code_behavior` |
| Triggered surfaces | DB / migration, API contract |
| Low impact reason | N/A |
| Medium impact reason | N/A |
| Upgrade history | none |

## Excluded High-Impact Surfaces

| Surface | Excluded | Reason |
| --- | --- | --- |
| DB | No | DB is part of the triggered high-impact surface. |
| API contract | No | API contract is part of the triggered high-impact surface. |
| runtime state | Yes | No runtime state impact is indicated by the current classification. |
| permission | Yes | No permission impact is indicated by the current classification. |
| business rule | Yes | No business rule impact is indicated by the current classification. |
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

## Existing Project Mapping

| Required Behavior | Project-Native Evidence | State | Stronger Rule Preserved | Reason |
| --- | --- | --- | --- | --- |
| Business Rule Closure | N/A | MISSING | N/A | No project-native business rule evidence was supplied to this classifier report. |
| Verification Plan | N/A | MISSING | N/A | No project-native verification plan evidence was supplied to this classifier report. |

## Source Chain

| Source | Status | Ref | Task Match |
| --- | --- | --- | --- |
| task_intent | READY | intent:current-request | Yes |
| adoption_review | NOT_APPLICABLE | N/A | Unknown |

## Lightweight Close-Out

| Field | Value |
| --- | --- |
| Scope unchanged | `N/A` |
| Minimal verification done | `N/A` |
| Targeted verification done | `N/A` |
| Unrelated edits | `No` |
| Remaining risk | High-impact governance is required before implementation review. |

## Readiness

| Field | Value |
| --- | --- |
| Governance prerequisites satisfied | `No` |
| Ready for implementation review | `No` |
| Implementation authorized by this report | `No` |
| Can claim done | `No` |
| Blocked by | missing clear business rule or project-native equivalent; missing affected-surface map; missing durable execution plan; missing verification checklist; test proof is required before any done claim |

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
  "schema_version": "1.83.0",
  "artifact_type": "task_governance",
  "intent": "add database field and public API contract for customer status shown in UI",
  "intent_digest": "sha256:7547f9e813cb5fee9ccbacf94c39d2571fcc9d29d499897b87ec2697abf2a7c6",
  "task_governance_ref": "task-governance-reports/001-task-governance.md",
  "task_governance_digest": "sha256:b669647c9b9351dd969d4bee764617663a9913690972a430a38c73525d3b0248",
  "task_ref": "task:add-database-field-and-public-api-contract-for-customer-stat",
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
      "DB / migration",
      "API contract"
    ],
    "trigger_evidence": [
      "Intent matched high-impact surface: DB / migration",
      "Intent matched high-impact surface: API contract"
    ],
    "excluded_high_impact_surfaces": [
      {
        "surface": "DB",
        "excluded": "No",
        "reason": "DB is part of the triggered high-impact surface."
      },
      {
        "surface": "API contract",
        "excluded": "No",
        "reason": "API contract is part of the triggered high-impact surface."
      },
      {
        "surface": "runtime state",
        "excluded": "Yes",
        "reason": "No runtime state impact is indicated by the current classification."
      },
      {
        "surface": "permission",
        "excluded": "Yes",
        "reason": "No permission impact is indicated by the current classification."
      },
      {
        "surface": "business rule",
        "excluded": "Yes",
        "reason": "No business rule impact is indicated by the current classification."
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
      "digest": "sha256:7547f9e813cb5fee9ccbacf94c39d2571fcc9d29d499897b87ec2697abf2a7c6",
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
      "project_native_evidence_ref": "N/A",
      "mapping_state": "MISSING",
      "stronger_project_rule_preserved": "N/A",
      "reason": "No project-native business rule evidence was supplied to this classifier report."
    },
    {
      "required_behavior": "Verification Plan",
      "project_native_evidence_ref": "N/A",
      "mapping_state": "MISSING",
      "stronger_project_rule_preserved": "N/A",
      "reason": "No project-native verification plan evidence was supplied to this classifier report."
    }
  ],
  "readiness": {
    "governance_prerequisites_satisfied": "No",
    "ready_for_implementation_review": "No",
    "implementation_authorized_by_this_report": "No",
    "can_claim_done": "No",
    "blocked_by": [
      "missing clear business rule or project-native equivalent",
      "missing affected-surface map",
      "missing durable execution plan",
      "missing verification checklist",
      "test proof is required before any done claim"
    ]
  },
  "lightweight_closeout": {
    "scope_unchanged": "N/A",
    "minimal_verification_done": "N/A",
    "targeted_verification_done": "N/A",
    "unrelated_edits": "No",
    "remaining_risk": "High-impact governance is required before implementation review."
  },
  "user_prompt": {
    "plain_next_step": "这个任务影响较大。我会先整理业务规则、影响面、执行计划和验证清单，再进入实现评审。",
    "technical_terms_required": "No"
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
  "outcome": "HIGH_REQUIRES_FULL_GOVERNANCE"
}
```

## Outcome

`HIGH_REQUIRES_FULL_GOVERNANCE`
