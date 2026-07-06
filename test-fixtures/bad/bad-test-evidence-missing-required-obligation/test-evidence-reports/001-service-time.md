# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 9/9 required obligations covered by 5 evidence item(s).

## User Request

- Request: appointment requests must include a service time
- Task ref: `tasks/001-appointment-requests-must-include-a-service-time.md`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/001-service-time.md` | `VERIFICATION_PLAN_READY` | `sha256:417e7eba332b2d5b4e987a5472095c2bb069e6de0e781a0231398130337acc79` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/001-service-time.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:572b9f64afe07d801c4f7484fb1fdd5b9edef51864a0dee0e170fa70c8e7e9ee` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/001-service-time.md` | `CHANGE_IMPACT_RECORDED` | `sha256:962de697d19764eb000b4b53fff112c488100327c03146b4d50f60c2ec40d77d` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/001-service-time.md`
- Test evidence digest: `sha256:d6d9c6aa887aeede1fc1b03d5b0a6b44d7b4bc18af2f42da2219c6e3023170cc`
- Verification plan ref: `artifact:verification-plans/001-service-time.md`
- Verification plan digest: `sha256:417e7eba332b2d5b4e987a5472095c2bb069e6de0e781a0231398130337acc79`
- Intent digest: `sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28`

## Verification Plan Binding

- Verification plan state: `VERIFICATION_PLAN_READY`
- Required obligations: `9`
- Covered obligations: `9`
- Missing obligations: `0`

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `evidence:user-flow` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/user-flow.txt` | npm run test:user-flow -- appointment-service-time | automated-test-command | local-ci-node-20 | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:8c9962c815a7aa7ff215a9c3dd8ca5e06f47d8e93ae9cafb6c3b9cf54bb54f29` | Local CI simulation only; not production traffic. |
| `evidence:frontend-ui` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/frontend-ui.txt` | npm run test:ui -- appointment-service-time | automated-test-command | local-ci-node-20 | `Yes` | `Yes` | `verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-`, `verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-` | `sha256:7c174b3ec8acf9261ed1f6fdb1ecc8df2c75e1e57487fd40c008952ff76cf930` | Component-level UI evidence; browser visual regression is not included. |
| `evidence:api-contract` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/api-contract.txt` | npm run test:api -- appointment-service-time | automated-test-command | local-ci-node-20 | `Yes` | `Yes` | `verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t`, `verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-` | `sha256:07b28ee90ca69d56d136522baa34647399583657f725bdead76e5d21c9ed1f96` | Local API evidence; does not prove production behavior. |
| `evidence:backend-rule` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/backend-rule.txt` | npm run test:domain -- appointment-service-time | automated-test-command | local-ci-node-20 | `Yes` | `Yes` | `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-` | `sha256:83aae0e7f7a4ab49042136325d0c38633d943c0fe01adf28fd111e694ba99619` | Domain/service evidence; database migration is not part of this task. |
| `evidence:handoff` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/handoff.txt` | npm run docs:check -- appointment-service-time | automated-test-command | local-ci-node-20 | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:e977643b7d93946f22d7a8da34455b28874eee2b576f4e3983007a69e44b24ad` | Handoff evidence only; release approval is out of scope. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:user-flow` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:user-flow` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-` | `COVERED` | `evidence:frontend-ui` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t` | `COVERED` | `evidence:api-contract` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-` | `COVERED` | `evidence:api-contract` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-` | `COVERED` | `evidence:backend-rule` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-` | `COVERED` | `evidence:frontend-ui` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:handoff` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:handoff` | Task-specific evidence explicitly covers this Verification Plan obligation. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:negative-path-required` | `API_CONTRACT` | `SATISFIED` | `evidence:user-flow`, `evidence:frontend-ui`, `evidence:api-contract`, `evidence:backend-rule`, `evidence:handoff` | Evidence is mapped to Verification Plan obligations. |
| `control:ui-only-not-enough` | `BACKEND_RULE` | `SATISFIED` | `evidence:user-flow`, `evidence:frontend-ui`, `evidence:api-contract`, `evidence:backend-rule`, `evidence:handoff` | Evidence is mapped to Verification Plan obligations. |
| `control:cross-surface-required` | `FRONTEND_UI,BACKEND_RULE` | `SATISFIED` | `evidence:user-flow`, `evidence:frontend-ui`, `evidence:api-contract`, `evidence:backend-rule`, `evidence:handoff` | Evidence is mapped to Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:user-flow`, `evidence:frontend-ui`, `evidence:api-contract`, `evidence:backend-rule`, `evidence:handoff` | Evidence is mapped to Verification Plan obligations. |

## Known Gaps

| Gap ID | Severity | Reason | Required Follow-up |
|---|---|---|---|
| `none` | `NONE` | No known gaps recorded. | Not required. |

## Manual Verification

| ID | Owner | Decision Ref | Evidence Ref | Status | Reason |
|---|---|---|---|---|---|
| `none` | None | `not required` | `not required` | `NOT_REQUIRED` | No manual verification required by the Verification Plan. |

## Existing Project Mapping

- Status: `NOT_APPLICABLE`
- Ref: `not provided`
- Reason: No existing-project mapping was provided for this Test Evidence Report.

## Boundaries

- This report writes target files: No
- This report executes tests: No
- This report fabricates evidence: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report proves product correctness: No
- This report proves real-environment behavior: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.77.0",
  "artifact_type": "test_evidence",
  "task_ref": "tasks/001-appointment-requests-must-include-a-service-time.md",
  "intent": "appointment requests must include a service time",
  "intent_digest": "sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28",
  "test_evidence_ref": "artifact:test-evidence-reports/001-service-time.md",
  "test_evidence_digest": "sha256:d6d9c6aa887aeede1fc1b03d5b0a6b44d7b4bc18af2f42da2219c6e3023170cc",
  "verification_plan_ref": "artifact:verification-plans/001-service-time.md",
  "verification_plan_digest": "sha256:417e7eba332b2d5b4e987a5472095c2bb069e6de0e781a0231398130337acc79",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/001-service-time.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:417e7eba332b2d5b4e987a5472095c2bb069e6de0e781a0231398130337acc79"
    },
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
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "evidence:user-flow",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/user-flow.txt",
      "command": "npm run test:user-flow -- appointment-service-time",
      "owner": "automated-test-command",
      "environment": "local-ci-node-20",
      "ran_at": "2026-07-06T10:00:00Z",
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:8c9962c815a7aa7ff215a9c3dd8ca5e06f47d8e93ae9cafb6c3b9cf54bb54f29",
      "limitations": "Local CI simulation only; not production traffic."
    },
    {
      "id": "evidence:frontend-ui",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/frontend-ui.txt",
      "command": "npm run test:ui -- appointment-service-time",
      "owner": "automated-test-command",
      "environment": "local-ci-node-20",
      "ran_at": "2026-07-06T10:01:00Z",
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-",
        "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-"
      ],
      "output_digest": "sha256:7c174b3ec8acf9261ed1f6fdb1ecc8df2c75e1e57487fd40c008952ff76cf930",
      "limitations": "Component-level UI evidence; browser visual regression is not included."
    },
    {
      "id": "evidence:api-contract",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/api-contract.txt",
      "command": "npm run test:api -- appointment-service-time",
      "owner": "automated-test-command",
      "environment": "local-ci-node-20",
      "ran_at": "2026-07-06T10:02:00Z",
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t",
        "verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-"
      ],
      "output_digest": "sha256:07b28ee90ca69d56d136522baa34647399583657f725bdead76e5d21c9ed1f96",
      "limitations": "Local API evidence; does not prove production behavior."
    },
    {
      "id": "evidence:backend-rule",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/backend-rule.txt",
      "command": "npm run test:domain -- appointment-service-time",
      "owner": "automated-test-command",
      "environment": "local-ci-node-20",
      "ran_at": "2026-07-06T10:03:00Z",
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-"
      ],
      "output_digest": "sha256:83aae0e7f7a4ab49042136325d0c38633d943c0fe01adf28fd111e694ba99619",
      "limitations": "Domain/service evidence; database migration is not part of this task."
    },
    {
      "id": "evidence:handoff",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/handoff.txt",
      "command": "npm run docs:check -- appointment-service-time",
      "owner": "automated-test-command",
      "environment": "local-ci-node-20",
      "ran_at": "2026-07-06T10:04:00Z",
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:e977643b7d93946f22d7a8da34455b28874eee2b576f4e3983007a69e44b24ad",
      "limitations": "Handoff evidence only; release approval is out of scope."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:user-flow"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:user-flow"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:frontend-ui"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:api-contract"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:backend-rule"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:frontend-ui"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:handoff"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:handoff"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    }
  ],
  "test_quality_controls": [
    {
      "id": "control:negative-path-required",
      "applies_to": "API_CONTRACT",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:user-flow",
        "evidence:frontend-ui",
        "evidence:api-contract",
        "evidence:backend-rule",
        "evidence:handoff"
      ],
      "reason": "Evidence is mapped to Verification Plan obligations."
    },
    {
      "id": "control:ui-only-not-enough",
      "applies_to": "BACKEND_RULE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:user-flow",
        "evidence:frontend-ui",
        "evidence:api-contract",
        "evidence:backend-rule",
        "evidence:handoff"
      ],
      "reason": "Evidence is mapped to Verification Plan obligations."
    },
    {
      "id": "control:cross-surface-required",
      "applies_to": "FRONTEND_UI,BACKEND_RULE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:user-flow",
        "evidence:frontend-ui",
        "evidence:api-contract",
        "evidence:backend-rule",
        "evidence:handoff"
      ],
      "reason": "Evidence is mapped to Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:user-flow",
        "evidence:frontend-ui",
        "evidence:api-contract",
        "evidence:backend-rule",
        "evidence:handoff"
      ],
      "reason": "Evidence is mapped to Verification Plan obligations."
    }
  ],
  "known_gaps": [
    {
      "id": "none",
      "severity": "NONE",
      "reason": "No known gaps recorded.",
      "required_follow_up": "Not required."
    }
  ],
  "manual_verification": [
    {
      "id": "none",
      "owner": "None",
      "decision_ref": "not required",
      "evidence_ref": "not required",
      "status": "NOT_REQUIRED",
      "reason": "No manual verification required by the Verification Plan."
    }
  ],
  "existing_project_mapping": {
    "status": "NOT_APPLICABLE",
    "ref": "not provided",
    "reason": "No existing-project mapping was provided for this Test Evidence Report."
  },
  "boundaries": {
    "writes_target_files": "No",
    "executes_tests": "No",
    "fabricates_evidence": "No",
    "authorizes_implementation": "No",
    "approves_release_or_production": "No",
    "proves_product_correctness": "No",
    "proves_real_environment_behavior": "No"
  },
  "next_step": "Proceed to execution closure or finish check with this report as evidence."
}
```

## Outcome

`TEST_EVIDENCE_COMPLETE`

## Next Step

Proceed to execution closure or finish check with this report as evidence.
