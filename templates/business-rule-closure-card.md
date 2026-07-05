# Business Rule Closure Card

This card is a read-only business-rule interpretation. It does not write target
files, authorize implementation, approve release, or replace domain-owner
decisions.

## Human Summary

| Field | Value |
| --- | --- |
| Business Rule State | `NEEDS_USER_CONFIRMATION` |
| Primary Rule Type | `VALIDATION_RULE` |
| Can Enter Impact Coverage | `No` |
| Can Codex Write Now | `No` |
| Safe Next Step | Confirm the pending business decision, then run Change Impact Coverage. |

## User Request

Appointment requests must include a service time.

## Codex Understanding

- Appointment creation and rescheduling need a service time.
- Existing appointments are not changed automatically.
- Rescheduling an existing appointment should apply the new rule.

## Rule Identity

| Field | Value |
| --- | --- |
| Business Rule ID | `business-rule:appointment-service-time` |
| Business Rule Ref | `artifact:business-rule-closures/001-appointment-service-time.md` |
| Source Request Digest | `sha256:<digest>` |
| Business Rule Digest | `sha256:<digest>` |
| Closure Digest | `sha256:<digest>` |

## Business Rule Dimensions

| Dimension | Status | Summary | Evidence / Decision |
| --- | --- | --- | --- |
| `ACTOR` | `CLOSED` | Customer or operator creates or reschedules an appointment. | `human-decision:rule-understanding` |
| `TRIGGER_SCENARIO` | `CLOSED` | Create and reschedule flows. | `human-decision:rule-understanding` |
| `INPUT_CONDITION` | `CLOSED` | Service time is required. | `human-decision:rule-understanding` |
| `REAL_ENVIRONMENT_VALIDATION` | `CLOSED` | Local smoke first; staging or internal trial if available. | `human-decision:validation-expectation` |

## User Confirmation Card

- Should existing appointments without service time be blocked from
  rescheduling?

## Safe Defaults

| Default | Recommendation | Requires User Acceptance | Accepted By User | Can Codex Apply Now |
| --- | --- | --- | --- | --- |
| `default:existing-appointments` | Do not batch-change existing appointments. | `No` | `No` | `No` |

## Existing Rule Check

| Source | Status | Notes |
| --- | --- | --- |
| `AGENTS.md` | `NOT_FOUND` | No source conflict recorded. |

## Decisions Needed

- Confirm rescheduling behavior for legacy appointments if this affects real
  users.

## Out Of Scope

- Production release.
- Batch mutation of existing appointment records.

## Real-Environment Validation Expectation

Local smoke evidence is expected before implementation closure. Staging or
internal trial evidence is expected before release review when available.

## Next Step

`NEEDS_USER_CONFIRMATION`

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
  "task_ref": "tasks/001-appointment-service-time.md",
  "user_request": "Appointment requests must include a service time.",
  "source_request_digest": "sha256:<digest>",
  "business_rule_id": "business-rule:appointment-service-time",
  "business_rule_ref": "artifact:business-rule-closures/001-appointment-service-time.md",
  "business_rule_digest": "sha256:<digest>",
  "closure_digest": "sha256:<digest>",
  "primary_business_rule_type": "VALIDATION_RULE",
  "business_rule_types": ["VALIDATION_RULE"],
  "risk_domains": ["appointment-scheduling"],
  "state": "NEEDS_USER_CONFIRMATION",
  "can_enter_impact_coverage": "No",
  "can_codex_write_now": "No",
  "dimensions": [],
  "decision_items": [],
  "safe_defaults": [],
  "out_of_scope": [],
  "source_rule_refs": [],
  "conflicts": [],
  "unknown_authority_items": [],
  "real_environment_validation": {
    "expectation": "Local smoke first; staging or internal trial if available.",
    "claims_verified": "No",
    "evidence_refs": []
  },
  "next_step": "Resolve pending business decisions before Change Impact Coverage.",
  "boundaries": {
    "writes_target_files": "No",
    "authorizes_implementation": "No",
    "approves_release_or_production": "No",
    "approves_high_risk_domain_decisions": "No",
    "proves_real_environment_behavior": "No"
  }
}
```
