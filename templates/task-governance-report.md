# Task Governance Report

This report classifies task impact and routes required governance. It does not
authorize implementation or completion.

It does not authorize implementation.

## Human Summary

| Field | Value |
| --- | --- |
| Task impact | `<LOW/MEDIUM/POSSIBLE_HIGH/HIGH>` |
| Plain next step | `<plain next step>` |
| Ready for implementation review | `No` |
| Implementation authorized by this report | `No` |
| Can claim done | `No` |
| Review level | `<LIGHTWEIGHT/TARGETED/BLOCKING_CLARIFICATION/FULL>` |

## Impact Classification

| Field | Value |
| --- | --- |
| Confidence | `<low/medium/high>` |
| Task kind | `<docs_only/test_docs_only/copy/visual_only/code_behavior/config_behavior/release_behavior/migration_behavior/unknown>` |
| Triggered surfaces | `<surfaces>` |
| Low impact reason | `<reason or N/A>` |
| Medium impact reason | `<reason or N/A>` |
| Upgrade history | `<history or none>` |

## Excluded High-Impact Surfaces

| Surface | Excluded | Reason |
| --- | --- | --- |
| API contract | `Yes` | `<reason>` |

## Required Before Implementation Review

| Requirement | Required |
| --- | --- |
| Scope check | `<Yes/No>` |
| Short plan | `<Yes/No>` |
| Business Rule Closure | `<Yes/No>` |
| Change Impact Coverage | `<Yes/No>` |
| Execution Plan | `<Yes/No>` |
| Verification Plan | `<Yes/No>` |

## Required Before Completion Claim

| Requirement | Required |
| --- | --- |
| Test Evidence | `<Yes/No>` |
| Execution Assurance | `<Yes/No>` |
| Completion Evidence | `<Yes/No>` |

## Review Policy

| Field | Value |
| --- | --- |
| Review level | `<LIGHTWEIGHT/TARGETED/BLOCKING_CLARIFICATION/FULL>` |
| Codex self-check required | `Yes` |
| Independent review required | `<Yes/No/Conditional>` |
| Review must happen before | `<completion_claim/implementation_review/implementation_and_completion>` |
| Review source | `<codex_self_check/targeted_checker_or_project_review/human_or_read_only_inspection/review_loop_or_project_native_review>` |
| Review must cover | `<plain coverage items>` |
| Skip full review reason | `<why full review is or is not required>` |

## Existing Project Mapping

| Required Behavior | Project-Native Evidence | Digest | Owner | Scope | Task Match | State | Stronger Rule Preserved | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<behavior>` | `<artifact/ref>` | `<sha256 or N/A>` | `<owner or N/A>` | `<task_specific/project_wide/release_wide/N/A>` | `<Yes/No/Unknown/N/A>` | `<MATCHED/WEAKER/STRONGER/MISSING/NEEDS_OWNER>` | `<Yes/No/N/A>` | `<reason>` |

## Source Chain

| Source | Status | Ref | Task Match |
| --- | --- | --- | --- |
| `<source>` | `<status>` | `<ref>` | `<Yes/No/Unknown>` |

## Lightweight Close-Out

| Field | Value |
| --- | --- |
| Scope unchanged | `<Yes/No/N/A>` |
| Minimal verification done | `<Yes/No/N/A>` |
| Targeted verification done | `<Yes/No/N/A>` |
| Unrelated edits | `No` |
| Remaining risk | `<risk or none>` |

## Readiness

| Field | Value |
| --- | --- |
| Governance prerequisites satisfied | `<Yes/No>` |
| Ready for implementation review | `No` |
| Implementation authorized by this report | `No` |
| Can claim done | `No` |
| Blocked by | `<missing items>` |

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
  "schema_version": "1.83.2",
  "artifact_type": "task_governance",
  "intent": "<intent>",
  "intent_digest": "sha256:<64 hex>",
  "task_governance_ref": "task-governance-reports/<id>.md",
  "task_governance_digest": "sha256:<64 hex>",
  "task_ref": "task:<id>",
  "project_adoption_mode": "partial",
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
    "triggered_surfaces": [],
    "trigger_evidence": [],
    "excluded_high_impact_surfaces": [],
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
  },
  "source_chain": [],
  "existing_project_mapping": [
    {
      "required_behavior": "Business Rule Closure",
      "project_native_evidence_ref": "artifact:docs/project-rfc.md",
      "project_native_evidence_digest": "sha256:<64 hex>",
      "project_native_evidence_owner": "Project owner",
      "project_native_evidence_scope": "task_specific",
      "project_native_task_match": "Yes",
      "project_native_evidence_summary": "Project RFC records the user-visible rule, edge cases, and verification expectations.",
      "mapping_state": "MATCHED",
      "stronger_project_rule_preserved": "N/A",
      "reason": "Project RFC covers the required behavior."
    }
  ],
  "readiness": {
    "governance_prerequisites_satisfied": "No",
    "ready_for_implementation_review": "No",
    "implementation_authorized_by_this_report": "No",
    "can_claim_done": "No",
    "blocked_by": []
  },
  "lightweight_closeout": {
    "scope_unchanged": "N/A",
    "minimal_verification_done": "N/A",
    "targeted_verification_done": "N/A",
    "unrelated_edits": "No",
    "remaining_risk": ""
  },
  "user_prompt": {
    "plain_next_step": "<plain next step>",
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

`<outcome>`
