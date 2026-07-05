# Change Impact Coverage Report

## Human Summary

Change type VALIDATION_OR_BUSINESS_RULE; 7 required surfaces were identified. Risk level is low.

## User Request

- Request: appointment requests must include a service time
- Task ref: not provided
- Project/profile: inferred from project signals
- Business rule closure ref: artifact:business-rule-closures/001-service-time.md
- Business rule digest: sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee
- Business rule state: READY_FOR_IMPACT_COVERAGE

## Change Type

- Mode: `preflight`
- Primary type: `VALIDATION_OR_BUSINESS_RULE`
- Risk level: low
- Reason: Validation or business-rule wording was detected.

## Changed Files

- None provided.

## Affected Surface Map

| Surface | Status | Reason | Expected Evidence |
|---|---|---|---|
| `USER_FLOW` | `REQUIRED` | The user-facing behavior or task flow may change. | Screen, command, journey, or behavior evidence. |
| `FRONTEND_UI` | `REQUIRED` | Input, form, state, or visible behavior may need to match the rule. | UI diff, screenshot, local behavior evidence, or not-applicable reason. |
| `API_CONTRACT` | `REQUIRED` | Client/server expectations may need to stay aligned. | API/DTO/schema evidence or not-applicable reason. |
| `BACKEND_RULE` | `REQUIRED` | The rule should be enforced outside the UI when server/domain logic exists. | Domain/service validation evidence or not-applicable reason. |
| `ERROR_COPY` | `REQUIRED` | Users need a clear message when the rule blocks input. | Error copy, validation message, or not-applicable reason. |
| `DATA_MODEL` | `NOT_APPLICABLE` | No data model or persistence change is indicated by current wording. | Reason recorded. |
| `PERMISSION_RISK` | `NOT_APPLICABLE` | No permission, privacy, payment, or compliance change is indicated by current wording. | Reason recorded. |
| `RELEASE_IMPACT` | `NOT_APPLICABLE` | No release, deployment, rollback, or production change is indicated by current wording. | Reason recorded. |
| `TEST_COVERAGE` | `REQUIRED` | The change needs evidence that required behavior was checked. | Unit, integration, smoke, behavior, fixture, or manual evidence. |
| `DOCS_HANDOFF` | `REQUIRED` | The rule and any exclusions need to be understandable later. | Docs, handoff note, final report, or decision record. |

## Out-of-Scope Decisions

| Surface | Decision | Reason | Owner / Follow-up |
|---|---|---|---|
| None | None | Pre-execution report. | None |

## Human Decisions Needed

1. Should this rule be enforced in both UI and backend/API, or only one layer?

## Implementation Coverage

| Surface | Status | Evidence | Reason |
|---|---|---|---|
| `USER_FLOW` | `NOT_STARTED` | Not started | Pre-execution report. |
| `FRONTEND_UI` | `NOT_STARTED` | Not started | Pre-execution report. |
| `API_CONTRACT` | `NOT_STARTED` | Not started | Pre-execution report. |
| `BACKEND_RULE` | `NOT_STARTED` | Not started | Pre-execution report. |
| `ERROR_COPY` | `NOT_STARTED` | Not started | Pre-execution report. |
| `DATA_MODEL` | `NOT_APPLICABLE` | Not started | No data model or persistence change is indicated by current wording. |
| `PERMISSION_RISK` | `NOT_APPLICABLE` | Not started | No permission, privacy, payment, or compliance change is indicated by current wording. |
| `RELEASE_IMPACT` | `NOT_APPLICABLE` | Not started | No release, deployment, rollback, or production change is indicated by current wording. |
| `TEST_COVERAGE` | `NOT_STARTED` | Not started | Pre-execution report. |
| `DOCS_HANDOFF` | `NOT_STARTED` | Not started | Pre-execution report. |

## Verification Coverage

| Surface | Verification | Evidence | Status |
|---|---|---|---|
| `USER_FLOW` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `FRONTEND_UI` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `API_CONTRACT` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `BACKEND_RULE` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `ERROR_COPY` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `TEST_COVERAGE` | Run task-appropriate tests or smoke evidence. | Not started | `NOT_STARTED` |
| `DOCS_HANDOFF` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |

## Missed Surface Review

- Missed surfaces found: No
- Notes: Pre-execution report; missed surfaces must be reviewed after implementation.

## Boundaries

- This report writes target files: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report replaces human product judgment: No
- This report proves every possible impact was found: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.49.0",
  "artifact_type": "change_impact_coverage",
  "artifact_id": "appointment-requests-must-include-a-service-time",
  "impact_digest": "sha256:962de697d19764eb000b4b53fff112c488100327c03146b4d50f60c2ec40d77d",
  "mode": "preflight",
  "user_request": {
    "intent": "appointment requests must include a service time",
    "task_ref": "not provided",
    "project_profile": "inferred from project signals"
  },
  "business_rule_ref": "artifact:business-rule-closures/999-other-rule.md",
  "business_rule_digest": "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  "business_rule_state": "READY_FOR_IMPACT_COVERAGE",
  "change_type": {
    "primary_type": "VALIDATION_OR_BUSINESS_RULE",
    "risk_level": "low",
    "reason": "General product change wording was detected."
  },
  "changed_files": [],
  "affected_surface_map": [
    {
      "surface": "USER_FLOW",
      "status": "REQUIRED",
      "reason": "The user-facing behavior or task flow may change.",
      "expected_evidence": "Screen, command, journey, or behavior evidence."
    },
    {
      "surface": "FRONTEND_UI",
      "status": "REQUIRED",
      "reason": "Input, form, state, or visible behavior may need to match the rule.",
      "expected_evidence": "UI diff, screenshot, local behavior evidence, or not-applicable reason."
    },
    {
      "surface": "API_CONTRACT",
      "status": "REQUIRED",
      "reason": "Client/server expectations may need to stay aligned.",
      "expected_evidence": "API/DTO/schema evidence or not-applicable reason."
    },
    {
      "surface": "BACKEND_RULE",
      "status": "REQUIRED",
      "reason": "The rule should be enforced outside the UI when server/domain logic exists.",
      "expected_evidence": "Domain/service validation evidence or not-applicable reason."
    },
    {
      "surface": "ERROR_COPY",
      "status": "REQUIRED",
      "reason": "Users need a clear message when the rule blocks input.",
      "expected_evidence": "Error copy, validation message, or not-applicable reason."
    },
    {
      "surface": "DATA_MODEL",
      "status": "NOT_APPLICABLE",
      "reason": "No data model or persistence change is indicated by current wording.",
      "expected_evidence": "Reason recorded."
    },
    {
      "surface": "PERMISSION_RISK",
      "status": "NOT_APPLICABLE",
      "reason": "No permission, privacy, payment, or compliance change is indicated by current wording.",
      "expected_evidence": "Reason recorded."
    },
    {
      "surface": "RELEASE_IMPACT",
      "status": "NOT_APPLICABLE",
      "reason": "No release, deployment, rollback, or production change is indicated by current wording.",
      "expected_evidence": "Reason recorded."
    },
    {
      "surface": "TEST_COVERAGE",
      "status": "REQUIRED",
      "reason": "The change needs evidence that required behavior was checked.",
      "expected_evidence": "Unit, integration, smoke, behavior, fixture, or manual evidence."
    },
    {
      "surface": "DOCS_HANDOFF",
      "status": "REQUIRED",
      "reason": "The rule and any exclusions need to be understandable later.",
      "expected_evidence": "Docs, handoff note, final report, or decision record."
    }
  ],
  "implementation_coverage": [
    {
      "surface": "USER_FLOW",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "FRONTEND_UI",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "API_CONTRACT",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "BACKEND_RULE",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "ERROR_COPY",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "DATA_MODEL",
      "status": "NOT_APPLICABLE",
      "evidence": "",
      "reason": "No data model or persistence change is indicated by current wording."
    },
    {
      "surface": "PERMISSION_RISK",
      "status": "NOT_APPLICABLE",
      "evidence": "",
      "reason": "No permission, privacy, payment, or compliance change is indicated by current wording."
    },
    {
      "surface": "RELEASE_IMPACT",
      "status": "NOT_APPLICABLE",
      "evidence": "",
      "reason": "No release, deployment, rollback, or production change is indicated by current wording."
    },
    {
      "surface": "TEST_COVERAGE",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "DOCS_HANDOFF",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    }
  ],
  "verification_coverage": [
    {
      "surface": "USER_FLOW",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "FRONTEND_UI",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "API_CONTRACT",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "BACKEND_RULE",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "ERROR_COPY",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "TEST_COVERAGE",
      "verification": "Run task-appropriate tests or smoke evidence.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "DOCS_HANDOFF",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    }
  ],
  "missed_surface_review": {
    "missed_surfaces_found": "No",
    "notes": "Pre-execution report; missed surfaces must be reviewed after implementation."
  },
  "boundaries": {
    "writes_target_files": false,
    "authorizes_implementation": false,
    "approves_release_or_production": false,
    "replaces_human_product_judgment": false,
    "proves_every_possible_impact_was_found": false
  },
  "outcome": "CHANGE_IMPACT_RECORDED"
}
```

## Outcome

`CHANGE_IMPACT_RECORDED`
