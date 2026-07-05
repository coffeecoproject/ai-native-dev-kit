# Business Rule Closure Card

This card is a read-only business-rule interpretation. It does not write target files, authorize implementation, approve release, or replace domain-owner decisions.

## Human Summary

| Field | Value |
| --- | --- |
| Business Rule State | `READY_FOR_IMPACT_COVERAGE` |
| Primary Rule Type | `VALIDATION_RULE` |
| Can Enter Impact Coverage | `Yes` |
| Can Codex Write Now | `No` |
| Safe Next Step | Run Change Impact Coverage with this business_rule_ref. |

## User Request

appointment requests must include a service time

## Codex Understanding

- Appointment creation and rescheduling should require a service time.
- Existing appointments are not changed automatically.
- Change Impact Coverage must check UI, API, backend, error copy, tests, and real-environment evidence.

## Rule Identity

| Field | Value |
| --- | --- |
| Business Rule ID | `business-rule:appointment-requests-must-include-a-service-time` |
| Business Rule Ref | `artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md` |
| Source Request Digest | `sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28` |
| Business Rule Digest | `sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee` |
| Closure Digest | `sha256:2474b972678fa1f1c65828c2d0a131a20f28370a86047089fb51b9f1fb7b1a80` |

## Business Rule Dimensions

| Dimension | Status | Summary | Evidence / Decision |
| --- | --- | --- | --- |
| `ACTOR` | `CLOSED` | Customer, operator, or authorized user triggers the rule. | human-decision:rule-understanding |
| `TRIGGER_SCENARIO` | `CLOSED` | Appointment create and reschedule flows. | human-decision:rule-understanding |
| `INPUT_CONDITION` | `CLOSED` | appointment requests must include a service time | human-decision:rule-understanding |
| `SUCCESS_PATH` | `CLOSED` | Valid input continues through the normal user flow. | human-decision:rule-understanding |
| `FAILURE_PATH` | `CLOSED` | Invalid input is blocked with a user-facing explanation. | human-decision:rule-understanding |
| `USER_FEEDBACK` | `CLOSED` | Show a clear inline error, toast, or operator-facing message. | human-decision:rule-understanding |
| `SERVER_ENFORCEMENT` | `CLOSED` | Backend/domain/API enforcement is expected; UI-only validation is not enough. | human-decision:rule-understanding |
| `DATA_BEHAVIOR` | `DEFAULTED_WITH_REASON` | Do not batch-change existing records unless a user/domain owner explicitly approves it. | human-decision:rule-understanding, default:existing-records |
| `EFFECTIVE_TIME` | `DEFAULTED_WITH_REASON` | Apply the rule to new records and future edits/reschedules/submissions. | human-decision:rule-understanding, default:effective-time |
| `EXCEPTION_POLICY` | `DEFAULTED_WITH_REASON` | No bypass or exemption is assumed unless the user/domain owner confirms it. | human-decision:rule-understanding, default:no-implicit-exemptions |
| `PRECEDENCE` | `NOT_APPLICABLE_WITH_REASON` | No conflicting priority rule is known from the current request. | human-decision:rule-understanding |
| `ROLE_PERMISSION` | `NOT_APPLICABLE_WITH_REASON` | No role-specific behavior is explicit in the request. | human-decision:rule-understanding |
| `CROSS_SURFACE_CONSISTENCY` | `CLOSED` | No multi-client conflict is known; impact coverage must still check project signals. | human-decision:rule-understanding |
| `AUDIT_LOGGING` | `NOT_APPLICABLE_WITH_REASON` | No audit-specific behavior is explicit. | human-decision:rule-understanding |
| `IDEMPOTENCY_CONCURRENCY` | `NOT_APPLICABLE_WITH_REASON` | No retry or concurrent workflow is explicit. | human-decision:rule-understanding |
| `DOWNSTREAM_EFFECT` | `CLOSED` | Reports, exports, notifications, dashboards, and integrations must be checked during impact coverage. | human-decision:rule-understanding |
| `TENANCY_DATA_BOUNDARY` | `NOT_APPLICABLE_WITH_REASON` | No tenant or data-isolation change is explicit in the request. | human-decision:rule-understanding |
| `LOCALIZATION_REGION` | `NOT_APPLICABLE_WITH_REASON` | No regional variation is explicit. | human-decision:rule-understanding |
| `SOURCE_RULE_CONFLICT` | `CLOSED` | No existing rule conflict is recorded. | human-decision:rule-understanding |
| `REAL_ENVIRONMENT_VALIDATION` | `CLOSED` | Local smoke evidence first; staging or internal trial before release review when available. | human-decision:rule-understanding |
| `OUT_OF_SCOPE` | `CLOSED` | Release, production, and batch data mutation are out of scope for this closure. | human-decision:rule-understanding |
| `HUMAN_DECISION` | `CLOSED` | No blocking human decision remains for low-risk validation semantics. | human-decision:rule-understanding |

## User Confirmation Card

- No user confirmation is required before Change Impact Coverage.

## Safe Defaults

| Default | Recommendation | Requires User Acceptance | Accepted By User | Can Codex Apply Now |
| --- | --- | --- | --- | --- |
| `default:existing-records` | Do not batch-change existing records. | `No` | `No` | `No` |
| `default:effective-time` | Apply the new rule to new records and future edits or reschedules. | `No` | `No` | `No` |
| `default:no-implicit-exemptions` | Do not assume admin, legacy, regional, or special-customer exemptions. | `No` | `No` | `No` |

## Existing Rule Check

| Source | Status | Notes |
| --- | --- | --- |
| `N/A` | `NOT_FOUND` | No source rule conflict recorded. |

## Decisions Needed

- None before Change Impact Coverage.

## Out Of Scope

- Implementation
- Release or production approval
- Batch mutation of existing records
- Finance, tax, HR, legal, payment, privacy, compliance, migration, production, or customer-data decisions

## Real-Environment Validation Expectation

Local smoke evidence first; staging or internal trial evidence when available before release review.

## Next Step

`Run Change Impact Coverage with this business_rule_ref.`

## Boundaries

- This closure writes target files: No
- This closure authorizes implementation: No
- This closure approves release or production: No
- This closure approves finance, tax, HR, legal, payment, privacy, compliance, migration, production, or customer-data decisions: No
- This closure proves real-environment behavior: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.75.0",
  "artifact_type": "business_rule_closure",
  "task_ref": "tasks/001-appointment-requests-must-include-a-service-time.md",
  "user_request": "appointment requests must include a service time",
  "source_request_digest": "sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28",
  "business_rule_id": "business-rule:appointment-requests-must-include-a-service-time",
  "business_rule_ref": "artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md",
  "business_rule_digest": "sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee",
  "closure_digest": "sha256:2474b972678fa1f1c65828c2d0a131a20f28370a86047089fb51b9f1fb7b1a80",
  "primary_business_rule_type": "VALIDATION_RULE",
  "business_rule_types": [
    "VALIDATION_RULE"
  ],
  "risk_domains": [
    "appointment-scheduling"
  ],
  "state": "READY_FOR_IMPACT_COVERAGE",
  "can_enter_impact_coverage": "Yes",
  "can_codex_write_now": "No",
  "dimensions": [
    {
      "dimension": "ACTOR",
      "status": "CLOSED",
      "summary": "Customer, operator, or authorized user triggers the rule.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "TRIGGER_SCENARIO",
      "status": "CLOSED",
      "summary": "Appointment create and reschedule flows.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "INPUT_CONDITION",
      "status": "CLOSED",
      "summary": "appointment requests must include a service time",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "SUCCESS_PATH",
      "status": "CLOSED",
      "summary": "Valid input continues through the normal user flow.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "FAILURE_PATH",
      "status": "CLOSED",
      "summary": "Invalid input is blocked with a user-facing explanation.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "USER_FEEDBACK",
      "status": "CLOSED",
      "summary": "Show a clear inline error, toast, or operator-facing message.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "SERVER_ENFORCEMENT",
      "status": "CLOSED",
      "summary": "Backend/domain/API enforcement is expected; UI-only validation is not enough.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "DATA_BEHAVIOR",
      "status": "DEFAULTED_WITH_REASON",
      "summary": "Do not batch-change existing records unless a user/domain owner explicitly approves it.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [
        "default:existing-records"
      ],
      "notes": ""
    },
    {
      "dimension": "EFFECTIVE_TIME",
      "status": "DEFAULTED_WITH_REASON",
      "summary": "Apply the rule to new records and future edits/reschedules/submissions.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [
        "default:effective-time"
      ],
      "notes": ""
    },
    {
      "dimension": "EXCEPTION_POLICY",
      "status": "DEFAULTED_WITH_REASON",
      "summary": "No bypass or exemption is assumed unless the user/domain owner confirms it.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [
        "default:no-implicit-exemptions"
      ],
      "notes": ""
    },
    {
      "dimension": "PRECEDENCE",
      "status": "NOT_APPLICABLE_WITH_REASON",
      "summary": "No conflicting priority rule is known from the current request.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "ROLE_PERMISSION",
      "status": "NOT_APPLICABLE_WITH_REASON",
      "summary": "No role-specific behavior is explicit in the request.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "CROSS_SURFACE_CONSISTENCY",
      "status": "CLOSED",
      "summary": "No multi-client conflict is known; impact coverage must still check project signals.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "AUDIT_LOGGING",
      "status": "NOT_APPLICABLE_WITH_REASON",
      "summary": "No audit-specific behavior is explicit.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "IDEMPOTENCY_CONCURRENCY",
      "status": "NOT_APPLICABLE_WITH_REASON",
      "summary": "No retry or concurrent workflow is explicit.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "DOWNSTREAM_EFFECT",
      "status": "CLOSED",
      "summary": "Reports, exports, notifications, dashboards, and integrations must be checked during impact coverage.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "TENANCY_DATA_BOUNDARY",
      "status": "NOT_APPLICABLE_WITH_REASON",
      "summary": "No tenant or data-isolation change is explicit in the request.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "LOCALIZATION_REGION",
      "status": "NOT_APPLICABLE_WITH_REASON",
      "summary": "No regional variation is explicit.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "SOURCE_RULE_CONFLICT",
      "status": "CLOSED",
      "summary": "No existing rule conflict is recorded.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "REAL_ENVIRONMENT_VALIDATION",
      "status": "CLOSED",
      "summary": "Local smoke evidence first; staging or internal trial before release review when available.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "OUT_OF_SCOPE",
      "status": "CLOSED",
      "summary": "Release, production, and batch data mutation are out of scope for this closure.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    },
    {
      "dimension": "HUMAN_DECISION",
      "status": "CLOSED",
      "summary": "No blocking human decision remains for low-risk validation semantics.",
      "evidence_refs": [
        "human-decision:rule-understanding"
      ],
      "decision_refs": [],
      "safe_default_refs": [],
      "notes": ""
    }
  ],
  "decision_items": [],
  "safe_defaults": [
    {
      "id": "default:existing-records",
      "recommendation": "Do not batch-change existing records.",
      "reason": "Avoid silent historical data mutation.",
      "requires_user_acceptance": "No",
      "accepted_by_user": "No",
      "can_codex_apply_now": "No"
    },
    {
      "id": "default:effective-time",
      "recommendation": "Apply the new rule to new records and future edits or reschedules.",
      "reason": "This is conservative and avoids rewriting historical data.",
      "requires_user_acceptance": "No",
      "accepted_by_user": "No",
      "can_codex_apply_now": "No"
    },
    {
      "id": "default:no-implicit-exemptions",
      "recommendation": "Do not assume admin, legacy, regional, or special-customer exemptions.",
      "reason": "Hidden exceptions change business behavior and require explicit confirmation.",
      "requires_user_acceptance": "No",
      "accepted_by_user": "No",
      "can_codex_apply_now": "No"
    }
  ],
  "out_of_scope": [
    "Implementation",
    "Release or production approval",
    "Batch mutation of existing records",
    "Finance, tax, HR, legal, payment, privacy, compliance, migration, production, or customer-data decisions"
  ],
  "source_rule_refs": [],
  "conflicts": [],
  "unknown_authority_items": [],
  "real_environment_validation": {
    "expectation": "Local smoke evidence first; staging or internal trial evidence when available before release review.",
    "claims_verified": "No",
    "evidence_refs": []
  },
  "next_step": "Run Change Impact Coverage with this business_rule_ref.",
  "boundaries": {
    "writes_target_files": "No",
    "authorizes_implementation": "No",
    "approves_release_or_production": "No",
    "approves_high_risk_domain_decisions": "No",
    "proves_real_environment_behavior": "No"
  }
}
```
