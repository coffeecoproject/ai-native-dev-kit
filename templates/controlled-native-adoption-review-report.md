# Controlled Native Adoption Review Report

This report is a read-only maturity and adoption-depth recommendation. It does
not change the target project.

## Human Summary

| Field | Value |
| --- | --- |
| Project maturity | `<plain maturity summary>` |
| Recommendation | `<plain recommendation>` |
| Codex can write now | `No` |
| Native apply allowed | `No` |
| Full adoption claim | `No` |

## Maturity Evidence

| Signal | Status |
| --- | --- |
| `<signal>` | `<present/missing/unknown>` |

## Source Authority

| Source | Role | Authority | Status |
| --- | --- | --- | --- |
| `<source>` | `<role>` | `<derived_view/source_evidence/project_signal>` | `<status>` |

## Recommended Actions

- `<plain plan-only action>`

## Blocked Actions

- `<blocked action and reason>`

## Human Decisions

- `<plain decision>`

## Risk / Verification / Rollback

| Field | Value |
| --- | --- |
| Risk summary | `<plain risk>` |
| Verification required | `<plain verification>` |
| Rollback plan required | `<plain rollback>` |

## Boundaries

| Boundary | Value |
| --- | --- |
| Writes target files | `No` |
| Installs IntentOS assets | `No` |
| Changes AGENTS or CI | `No` |
| Native apply allowed | `No` |
| Approves implementation | `No` |
| Approves release or production | `No` |

## Machine-Readable Evidence

```json
{
  "schema_version": "1.82.0",
  "artifact_type": "controlled_native_adoption_review",
  "intent": "<intent>",
  "intent_digest": "sha256:<64 hex>",
  "review_ref": "native-adoption-review-reports/<id>.md",
  "review_digest": "sha256:<64 hex>",
  "governance_maturity": {
    "state": "WEAK_GOVERNANCE_PROJECT",
    "confidence": "medium",
    "signals_present": [],
    "signals_missing": [],
    "production_sensitivity": "unknown",
    "recommended_adoption_depth": "GOVERNANCE_REPAIR_THEN_SELECTED_NATIVE_PLAN"
  },
  "adoption_recommendation": {
    "state": "RECOMMEND_GOVERNANCE_REPAIR",
    "current_adoption_state": "READY_FOR_RULE_ENTRY_REVIEW",
    "recommendation_class": "GOVERNANCE_REPAIR_THEN_SELECTED_NATIVE_PLAN",
    "recommended_user_choice": "Let Codex prepare a low-risk governance repair plan.",
    "safe_to_apply_now": false,
    "native_apply_allowed": false,
    "reason": "<reason>"
  },
  "recommended_actions": [],
  "blocked_actions": [],
  "human_decisions": [],
  "source_chain": [],
  "risk_verification_rollback": {
    "risk_summary": "<risk>",
    "verification_required": "<verification>",
    "rollback_plan_required": "<rollback>"
  },
  "boundaries": {
    "writes_target_files": "No",
    "installs_intentos": "No",
    "changes_agents_or_ci": "No",
    "native_apply_allowed": "No",
    "approves_implementation": "No",
    "approves_release_or_production": "No",
    "full_adoption_claim": "No"
  },
  "outcome": "RECOMMEND_GOVERNANCE_REPAIR"
}
```

## Outcome

`<same as adoption_recommendation.state>`
