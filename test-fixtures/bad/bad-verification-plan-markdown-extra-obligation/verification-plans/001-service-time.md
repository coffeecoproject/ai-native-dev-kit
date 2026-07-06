# Verification Plan

## Human Summary

Verification state VERIFICATION_PLAN_READY; 7 affected surfaces require 9 obligations, including 6 blocking obligations.

## User Request

- Request: appointment requests must include a service time
- Task ref: `tasks/001-appointment-requests-must-include-a-service-time.md`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/001-service-time.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/001-service-time.md` | `CHANGE_IMPACT_RECORDED` | `sha256:962de697d19764eb000b4b53fff112c488100327c03146b4d50f60c2ec40d77d` |

## Verification Plan Identity

- Verification plan ref: `artifact:verification-plans/001-service-time.md`
- Verification plan digest: `sha256:417e7eba332b2d5b4e987a5472095c2bb069e6de0e781a0231398130337acc79`
- Intent digest: `sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28`

## Project Calibration

- Project level: `BL1`
- Platform profiles: `web`, `backend`
- Change kind: `BUSINESS_RULE`
- Risk domains: `appointment-scheduling`

## Affected Surface Inputs

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

## Verification Obligations

| ID | Surface | Type | Required | Priority | Behavior Under Test | Expected Evidence | Broad Command Only | Source Refs |
|---|---|---|---|---|---|---|---|---|
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `USER_FLOW` | `UI_INTERACTION_TEST` | `Yes` | `BLOCKING` | The primary user flow follows the requested rule. | Behavior, screen, or journey evidence for the success path. | `No` | `artifact:business-rule-closures/001-service-time.md`, `artifact:change-impact-coverage-reports/001-service-time.md` |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `USER_FLOW` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | Existing critical flow still works after the change. | Task-specific smoke evidence mapped to this flow. | `No` | `artifact:business-rule-closures/001-service-time.md`, `artifact:change-impact-coverage-reports/001-service-time.md` |
| `verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-` | `FRONTEND_UI` | `UI_INTERACTION_TEST` | `Yes` | `BLOCKING` | Visible form or screen behavior enforces the rule. | UI interaction evidence, screenshot, or component behavior proof. | `No` | `artifact:business-rule-closures/001-service-time.md`, `artifact:change-impact-coverage-reports/001-service-time.md` |
| `verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t` | `API_CONTRACT` | `API_POSITIVE_TEST` | `Yes` | `BLOCKING` | Valid API request succeeds with the required data. | API positive-path evidence tied to the current task. | `No` | `artifact:business-rule-closures/001-service-time.md`, `artifact:change-impact-coverage-reports/001-service-time.md` |
| `verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-` | `API_CONTRACT` | `API_NEGATIVE_TEST` | `Yes` | `BLOCKING` | Invalid API request fails with a bounded validation error. | API request missing or violating the rule is rejected. | `No` | `artifact:business-rule-closures/001-service-time.md`, `artifact:change-impact-coverage-reports/001-service-time.md` |
| `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-` | `BACKEND_RULE` | `BACKEND_RULE_TEST` | `Yes` | `BLOCKING` | Server/domain logic enforces the rule even if UI is bypassed. | Domain, service, or handler validation evidence. | `No` | `artifact:business-rule-closures/001-service-time.md`, `artifact:change-impact-coverage-reports/001-service-time.md` |
| `verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-` | `ERROR_COPY` | `ERROR_COPY_CHECK` | `Yes` | `BLOCKING` | Blocked users receive clear bounded feedback. | Error copy, validation message, or not-applicable reason. | `No` | `artifact:business-rule-closures/001-service-time.md`, `artifact:change-impact-coverage-reports/001-service-time.md` |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `DOCS_HANDOFF` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | The rule and exclusions are understandable for future work. | Handoff, doc update, or final report evidence. | `No` | `artifact:business-rule-closures/001-service-time.md`, `artifact:change-impact-coverage-reports/001-service-time.md` |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `TEST_COVERAGE` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | Task-specific verification exists beyond broad command success. | Specific obligation-to-evidence mapping; broad commands alone are not enough. | `No` | `artifact:business-rule-closures/001-service-time.md`, `artifact:change-impact-coverage-reports/001-service-time.md` |

| `verify:extra-obligation` | `USER_FLOW` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | Extra row not in JSON. | Extra evidence. | `No` | `artifact:business-rule-closures/001-service-time.md` |

## Test Correctness Controls

| ID | Applies To | Required | Reason |
|---|---|---|---|
| `control:negative-path-required` | `API_CONTRACT` | `Yes` | Validation or API behavior requires failure-path proof. |
| `control:ui-only-not-enough` | `BACKEND_RULE` | `Yes` | Backend/domain rules must be verified outside the UI. |
| `control:cross-surface-required` | `FRONTEND_UI,BACKEND_RULE` | `Yes` | Cross-surface rules need UI and backend/API evidence. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `Yes` | Broad test commands must map to specific obligations. |

## Manual Verification

| ID | Owner | Decision Ref | Expected Manual Evidence | Blocking |
|---|---|---|---|---|
| `none` | None | `not required` | Not required. | `No` |

## Not Applicable Obligations

| Surface | Reason |
|---|---|
| `DATA_MODEL` | No data model or persistence change is indicated by current wording. |
| `PERMISSION_RISK` | No permission, privacy, payment, or compliance change is indicated by current wording. |
| `RELEASE_IMPACT` | No release, deployment, rollback, or production change is indicated by current wording. |

## Boundaries

- This plan writes target files: No
- This plan executes tests: No
- This plan authorizes implementation: No
- This plan approves release or production: No
- This plan proves product correctness: No
- This plan proves real-environment behavior: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.76.0",
  "artifact_type": "verification_plan",
  "task_ref": "tasks/001-appointment-requests-must-include-a-service-time.md",
  "intent": "appointment requests must include a service time",
  "intent_digest": "sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28",
  "verification_plan_ref": "artifact:verification-plans/001-service-time.md",
  "verification_plan_digest": "sha256:417e7eba332b2d5b4e987a5472095c2bb069e6de0e781a0231398130337acc79",
  "business_rule_ref": "artifact:business-rule-closures/001-service-time.md",
  "business_rule_digest": "sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee",
  "business_rule_state": "READY_FOR_IMPACT_COVERAGE",
  "impact_ref": "artifact:change-impact-coverage-reports/001-service-time.md",
  "impact_digest": "sha256:962de697d19764eb000b4b53fff112c488100327c03146b4d50f60c2ec40d77d",
  "source_systems": [
    {
      "name": "business_rule_closure",
      "status": "RECORDED",
      "ref": "artifact:business-rule-closures/001-service-time.md",
      "source_outcome": "READY_FOR_IMPACT_COVERAGE",
      "digest": "sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee"
    },
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/001-service-time.md",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "digest": "sha256:962de697d19764eb000b4b53fff112c488100327c03146b4d50f60c2ec40d77d"
    }
  ],
  "project_level": "BL1",
  "platform_profiles": [
    "web",
    "backend"
  ],
  "change_kind": "BUSINESS_RULE",
  "risk_domains": [
    "appointment-scheduling"
  ],
  "verification_state": "VERIFICATION_PLAN_READY",
  "affected_surfaces": [
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
  "verification_obligations": [
    {
      "id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "source_surface": "USER_FLOW",
      "verification_type": "UI_INTERACTION_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "The primary user flow follows the requested rule.",
      "expected_evidence": "Behavior, screen, or journey evidence for the success path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/001-service-time.md",
        "artifact:change-impact-coverage-reports/001-service-time.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": ""
    },
    {
      "id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "source_surface": "USER_FLOW",
      "verification_type": "REGRESSION_SMOKE",
      "required": "Yes",
      "priority": "REQUIRED",
      "behavior_under_test": "Existing critical flow still works after the change.",
      "expected_evidence": "Task-specific smoke evidence mapped to this flow.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/001-service-time.md",
        "artifact:change-impact-coverage-reports/001-service-time.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": ""
    },
    {
      "id": "verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-",
      "source_surface": "FRONTEND_UI",
      "verification_type": "UI_INTERACTION_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Visible form or screen behavior enforces the rule.",
      "expected_evidence": "UI interaction evidence, screenshot, or component behavior proof.",
      "test_correctness_risk": "API-only tests can miss user-facing behavior.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/001-service-time.md",
        "artifact:change-impact-coverage-reports/001-service-time.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": ""
    },
    {
      "id": "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t",
      "source_surface": "API_CONTRACT",
      "verification_type": "API_POSITIVE_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Valid API request succeeds with the required data.",
      "expected_evidence": "API positive-path evidence tied to the current task.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/001-service-time.md",
        "artifact:change-impact-coverage-reports/001-service-time.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": ""
    },
    {
      "id": "verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-",
      "source_surface": "API_CONTRACT",
      "verification_type": "API_NEGATIVE_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Invalid API request fails with a bounded validation error.",
      "expected_evidence": "API request missing or violating the rule is rejected.",
      "test_correctness_risk": "Must fail for invalid input, not only assert happy path.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/001-service-time.md",
        "artifact:change-impact-coverage-reports/001-service-time.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": ""
    },
    {
      "id": "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-",
      "source_surface": "BACKEND_RULE",
      "verification_type": "BACKEND_RULE_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Server/domain logic enforces the rule even if UI is bypassed.",
      "expected_evidence": "Domain, service, or handler validation evidence.",
      "test_correctness_risk": "UI-only tests can miss backend bypass paths.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/001-service-time.md",
        "artifact:change-impact-coverage-reports/001-service-time.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": ""
    },
    {
      "id": "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-",
      "source_surface": "ERROR_COPY",
      "verification_type": "ERROR_COPY_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Blocked users receive clear bounded feedback.",
      "expected_evidence": "Error copy, validation message, or not-applicable reason.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/001-service-time.md",
        "artifact:change-impact-coverage-reports/001-service-time.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": ""
    },
    {
      "id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "source_surface": "DOCS_HANDOFF",
      "verification_type": "REGRESSION_SMOKE",
      "required": "Yes",
      "priority": "REQUIRED",
      "behavior_under_test": "The rule and exclusions are understandable for future work.",
      "expected_evidence": "Handoff, doc update, or final report evidence.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/001-service-time.md",
        "artifact:change-impact-coverage-reports/001-service-time.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": ""
    },
    {
      "id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "source_surface": "TEST_COVERAGE",
      "verification_type": "REGRESSION_SMOKE",
      "required": "Yes",
      "priority": "REQUIRED",
      "behavior_under_test": "Task-specific verification exists beyond broad command success.",
      "expected_evidence": "Specific obligation-to-evidence mapping; broad commands alone are not enough.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "npm test or project-standard equivalent",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/001-service-time.md",
        "artifact:change-impact-coverage-reports/001-service-time.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": ""
    }
  ],
  "test_correctness_controls": [
    {
      "id": "control:negative-path-required",
      "applies_to": "API_CONTRACT",
      "required": "Yes",
      "reason": "Validation or API behavior requires failure-path proof."
    },
    {
      "id": "control:ui-only-not-enough",
      "applies_to": "BACKEND_RULE",
      "required": "Yes",
      "reason": "Backend/domain rules must be verified outside the UI."
    },
    {
      "id": "control:cross-surface-required",
      "applies_to": "FRONTEND_UI,BACKEND_RULE",
      "required": "Yes",
      "reason": "Cross-surface rules need UI and backend/API evidence."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "required": "Yes",
      "reason": "Broad test commands must map to specific obligations."
    }
  ],
  "manual_verification": [],
  "not_applicable_obligations": [
    {
      "source_surface": "DATA_MODEL",
      "reason": "No data model or persistence change is indicated by current wording."
    },
    {
      "source_surface": "PERMISSION_RISK",
      "reason": "No permission, privacy, payment, or compliance change is indicated by current wording."
    },
    {
      "source_surface": "RELEASE_IMPACT",
      "reason": "No release, deployment, rollback, or production change is indicated by current wording."
    }
  ],
  "boundaries": {
    "writes_target_files": "No",
    "executes_tests": "No",
    "authorizes_implementation": "No",
    "approves_release_or_production": "No",
    "proves_product_correctness": "No",
    "proves_real_environment_behavior": "No"
  },
  "next_step": "Use this plan during execution, then bind actual test evidence in a later Test Evidence Report."
}
```

## Outcome

`VERIFICATION_PLAN_READY`

## Next Step

Use this plan during execution, then bind actual test evidence in a later Test Evidence Report.
