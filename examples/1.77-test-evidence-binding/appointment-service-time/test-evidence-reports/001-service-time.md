# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 9/9 required obligations covered by 18 evidence item(s).

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
- Test evidence digest: `sha256:014aad900f4fd73b7fd986f97d588d5c275e45bf52c1d167a7164100776ca714`
- Verification plan ref: `artifact:verification-plans/001-service-time.md`
- Verification plan digest: `sha256:417e7eba332b2d5b4e987a5472095c2bb069e6de0e781a0231398130337acc79`
- Intent digest: `sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28`

## Verification Plan Binding

- Verification plan state: `VERIFICATION_PLAN_READY`
- Required obligations: `9`
- Covered obligations: `9`
- Missing obligations: `0`

## Runtime Trust Binding

| Field | Value |
| --- | --- |
| Requirement | `NOT_REQUIRED` |
| Status | `NOT_REQUIRED` |
| Run Manifest | `N/A` |
| Run ID | `N/A` |
| Task Ref | `N/A` |
| Intent Digest | `N/A` |
| Runtime Trust Level | `N/A` |
| Current Project Match | `N/A` |
| Current Task Match | `N/A` |
| Current Intent Match | `N/A` |
| Current Verification Plan Match | `N/A` |
| Reason | The current Verification Plan does not require runtime-trusted behavior proof. |

## Control Effectiveness Binding

- Requirement: `NOT_REQUIRED`
- Status: `NOT_REQUIRED`
- Report: `N/A`
- Report digest: `N/A`
- Required claims: N/A
- Assessment outcome: `NOT_APPLICABLE_WITH_REASON`
- Reason: The referenced pre-1.110 Verification Plan predates Control Effectiveness routing; no control-backed completion claim is inferred.

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
| N/A | N/A | N/A | NOT_APPLICABLE | NOT_COVERED | N/A |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `evidence:user-flow` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/user-flow.txt` | node --test --test-name-pattern "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:034646e69d4c2e194129e7a68443214c63c4e647d2dbd584219cc98e93276b2d` | N/A | Local Node behavior test; not production traffic. |
| `evidence:user-flow-regression` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/user-flow-regression.txt` | node --test --test-name-pattern "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:65806637334ac0c184ea9c1bab29041684694a0fe6ae08e15d381ee8e6966ffe` | N/A | Local regression behavior test; not production traffic. |
| `evidence:frontend-ui` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/frontend-ui.txt` | node --test --test-name-pattern "verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-` | `sha256:aa865e3eee5d7eb3061699a3036204d30e5f3ace6f3a19bdb96284a7c12a0e8c` | N/A | Form-state behavior evidence; browser visual regression is not included. |
| `evidence:error-copy` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/error-copy.txt` | node --test --test-name-pattern "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-` | `sha256:3ca27950b8c055dd61f53fc870228a76475eb143474ec51b607cc3fa0a8d82ff` | N/A | Bounded validation-copy evidence; localization is outside this example. |
| `evidence:api-contract-positive` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/api-contract.txt` | node --test --test-name-pattern "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t` | `sha256:0f1e070ec7309fc2071086fb53c67208b958e0239693a588cc281a9c46a176f5` | N/A | In-process API-contract behavior evidence; not production traffic. |
| `evidence:api-contract-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/api-contract-negative.txt` | node --test --test-name-pattern "verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-` | `sha256:71dd60fd6fc4f57065a89c10882dc121760e65b8984f1f9996dd78e1bb34ed04` | N/A | In-process API rejection evidence; not production traffic. |
| `evidence:backend-rule` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/backend-rule.txt` | node --test --test-name-pattern "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-` | `sha256:e7121dac450eeb48623d46832ba0c405e46a7c6d1bc07e992cff8b800697842b` | N/A | Domain validation evidence; database migration is outside this example. |
| `evidence:handoff` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/handoff.txt` | node --test --test-name-pattern "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:3e793591dbf0711c9a9144b1dd8b7cbb897ee8ae010fdc569c5d4ce8013725ab` | N/A | Task handoff evidence; release approval is outside this example. |
| `evidence:test-coverage` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/test-coverage.txt` | node --test --test-name-pattern "verify:test-coverage-regression-smoke-task-specific-verification-exists" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:859606440d58c48d2e72b477076ae6535c33201736cb25bff27afb197602e1d5` | N/A | Task-specific obligation declaration evidence; release approval is outside this example. |
| `evidence:observed-proof-837820499417a1ca345f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/user-flow.txt` | node --test --test-name-pattern "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:034646e69d4c2e194129e7a68443214c63c4e647d2dbd584219cc98e93276b2d` | N/A | Observed test target tests/appointment-service-time.test.mjs; test name valid appointment follows the service-time booking flow; source line 14. |
| `evidence:observed-proof-5a971d3e71ee383d634b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/user-flow-regression.txt` | node --test --test-name-pattern "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:65806637334ac0c184ea9c1bab29041684694a0fe6ae08e15d381ee8e6966ffe` | N/A | Observed test target tests/appointment-service-time.test.mjs; test name existing valid booking path remains available; source line 14. |
| `evidence:observed-proof-7c24796bcdb3d1a6b59e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/frontend-ui.txt` | node --test --test-name-pattern "verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-` | `sha256:aa865e3eee5d7eb3061699a3036204d30e5f3ace6f3a19bdb96284a7c12a0e8c` | N/A | Observed test target tests/appointment-service-time.test.mjs; test name form disables submission when service time is missing; source line 14. |
| `evidence:observed-proof-18211c50285f07e3ec78` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/error-copy.txt` | node --test --test-name-pattern "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-` | `sha256:3ca27950b8c055dd61f53fc870228a76475eb143474ec51b607cc3fa0a8d82ff` | N/A | Observed test target tests/appointment-service-time.test.mjs; test name blocked submission receives bounded error copy; source line 14. |
| `evidence:observed-proof-64d78f1208c8ac2589f1` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/api-contract.txt` | node --test --test-name-pattern "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t` | `sha256:0f1e070ec7309fc2071086fb53c67208b958e0239693a588cc281a9c46a176f5` | N/A | Observed test target tests/appointment-service-time.test.mjs; test name API accepts a request with service time; source line 14. |
| `evidence:observed-proof-aa23d13d61bd8fd265ed` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/api-contract-negative.txt` | node --test --test-name-pattern "verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-` | `sha256:71dd60fd6fc4f57065a89c10882dc121760e65b8984f1f9996dd78e1bb34ed04` | N/A | Observed test target tests/appointment-service-time.test.mjs; test name API rejects a request without service time; source line 14. |
| `evidence:observed-proof-e30468b3f5ebb22be4d5` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/backend-rule.txt` | node --test --test-name-pattern "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-` | `sha256:e7121dac450eeb48623d46832ba0c405e46a7c6d1bc07e992cff8b800697842b` | N/A | Observed test target tests/appointment-service-time.test.mjs; test name domain handler enforces the rule when UI is bypassed; source line 14. |
| `evidence:observed-proof-be086aded5c7015625d3` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/handoff.txt` | node --test --test-name-pattern "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:3e793591dbf0711c9a9144b1dd8b7cbb897ee8ae010fdc569c5d4ce8013725ab` | N/A | Observed test target tests/appointment-service-time.test.mjs; test name handoff explains the service-time rule and enforcement surfaces; source line 14. |
| `evidence:observed-proof-a3b2e7252f8fcbe26f06` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/test-coverage.txt` | node --test --test-name-pattern "verify:test-coverage-regression-smoke-task-specific-verification-exists" tests/appointment-service-time.test.mjs | automated-test-command | node-v23.11.0 | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:859606440d58c48d2e72b477076ae6535c33201736cb25bff27afb197602e1d5` | N/A | Observed test target tests/appointment-service-time.test.mjs; test name task-specific test target declares every required obligation; source line 14. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:observed-proof-837820499417a1ca345f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:observed-proof-5a971d3e71ee383d634b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-` | `COVERED` | `evidence:observed-proof-7c24796bcdb3d1a6b59e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t` | `COVERED` | `evidence:observed-proof-64d78f1208c8ac2589f1` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-` | `COVERED` | `evidence:observed-proof-aa23d13d61bd8fd265ed` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-` | `COVERED` | `evidence:observed-proof-e30468b3f5ebb22be4d5` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-` | `COVERED` | `evidence:observed-proof-18211c50285f07e3ec78` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:observed-proof-be086aded5c7015625d3` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:observed-proof-a3b2e7252f8fcbe26f06` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:negative-path-required` | `API_CONTRACT` | `SATISFIED` | `evidence:api-contract-positive`, `evidence:observed-proof-64d78f1208c8ac2589f1`, `evidence:api-contract-negative`, `evidence:observed-proof-aa23d13d61bd8fd265ed` | Evidence is mapped to related Verification Plan obligations. |
| `control:ui-only-not-enough` | `BACKEND_RULE` | `SATISFIED` | `evidence:backend-rule`, `evidence:observed-proof-e30468b3f5ebb22be4d5` | Evidence is mapped to related Verification Plan obligations. |
| `control:cross-surface-required` | `FRONTEND_UI,BACKEND_RULE` | `SATISFIED` | `evidence:frontend-ui`, `evidence:observed-proof-7c24796bcdb3d1a6b59e`, `evidence:backend-rule`, `evidence:observed-proof-e30468b3f5ebb22be4d5` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:observed-proof-a3b2e7252f8fcbe26f06` | Evidence is mapped to related Verification Plan obligations. |

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
  "schema_version": "1.110.0",
  "artifact_type": "test_evidence",
  "task_ref": "tasks/001-appointment-requests-must-include-a-service-time.md",
  "intent": "appointment requests must include a service time",
  "intent_digest": "sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28",
  "test_evidence_ref": "artifact:test-evidence-reports/001-service-time.md",
  "test_evidence_digest": "sha256:014aad900f4fd73b7fd986f97d588d5c275e45bf52c1d167a7164100776ca714",
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
  "runtime_trust_binding": {
    "requirement": "NOT_REQUIRED",
    "status": "NOT_REQUIRED",
    "run_manifest_ref": "N/A",
    "run_manifest_digest": "N/A",
    "run_id": "N/A",
    "task_ref": "N/A",
    "intent_digest": "N/A",
    "runtime_trust_level": "N/A",
    "runtime_plan_ref": "N/A",
    "runtime_plan_digest": "N/A",
    "lifecycle_plan_ref": "N/A",
    "lifecycle_plan_digest": "N/A",
    "verification_plan_ref": "N/A",
    "verification_plan_digest": "N/A",
    "current_project_match": "N/A",
    "current_task_match": "N/A",
    "current_intent_match": "N/A",
    "current_verification_plan_match": "N/A",
    "checker": "N/A",
    "reason": "The current Verification Plan does not require runtime-trusted behavior proof."
  },
  "control_effectiveness_binding": {
    "requirement": "NOT_REQUIRED",
    "status": "NOT_REQUIRED",
    "report_ref": "N/A",
    "report_digest": "N/A",
    "required_claim_ids": [],
    "assessment_outcome": "NOT_APPLICABLE_WITH_REASON",
    "current_project_match": "N/A",
    "current_task_match": "N/A",
    "current_intent_match": "N/A",
    "checker": "N/A",
    "reason": "The referenced pre-1.110 Verification Plan predates Control Effectiveness routing; no control-backed completion claim is inferred."
  },
  "authority_binding": {
    "binding_version": "1.91.0",
    "project": {
      "kind": "GIT",
      "fingerprint": "sha256:440c71d7d49defdc8cc268b2a5b3a216dafdcfb2cc0e5810535781c4437df603",
      "revision": "sha256:66b860b51a0086fbd684b5637240510efa8153109253cbaec830bc2f51f67934"
    },
    "task": {
      "task_ref": "tasks/001-appointment-requests-must-include-a-service-time.md",
      "intent_digest": "sha256:143276c5f789a88373a8f3de7c258b782f89df516ba8f5b4acb73f9cef38dd28"
    },
    "sources": [
      {
        "ref": "artifact:verification-plans/001-service-time.md",
        "relative_path": "verification-plans/001-service-time.md",
        "raw_file_digest": "sha256:1a854b671879d9a9a26c6b655d33c5f370411a8f99f0c6edd03227b187b111cc"
      },
      {
        "ref": "artifact:business-rule-closures/001-service-time.md",
        "relative_path": "business-rule-closures/001-service-time.md",
        "raw_file_digest": "sha256:67a1dcb523f941c0a0135313013dbb2590ca0c69498c90bf7ebd742e24b8a5e6"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/001-service-time.md",
        "relative_path": "change-impact-coverage-reports/001-service-time.md",
        "raw_file_digest": "sha256:a04d2e57a86cb0774eb24ab8748719719c205d43de1ae3d62433cf2c8bb8d957"
      },
      {
        "ref": "artifact:evidence/user-flow.txt",
        "relative_path": "evidence/user-flow.txt",
        "raw_file_digest": "sha256:034646e69d4c2e194129e7a68443214c63c4e647d2dbd584219cc98e93276b2d"
      },
      {
        "ref": "artifact:evidence/user-flow-regression.txt",
        "relative_path": "evidence/user-flow-regression.txt",
        "raw_file_digest": "sha256:65806637334ac0c184ea9c1bab29041684694a0fe6ae08e15d381ee8e6966ffe"
      },
      {
        "ref": "artifact:evidence/frontend-ui.txt",
        "relative_path": "evidence/frontend-ui.txt",
        "raw_file_digest": "sha256:aa865e3eee5d7eb3061699a3036204d30e5f3ace6f3a19bdb96284a7c12a0e8c"
      },
      {
        "ref": "artifact:evidence/error-copy.txt",
        "relative_path": "evidence/error-copy.txt",
        "raw_file_digest": "sha256:3ca27950b8c055dd61f53fc870228a76475eb143474ec51b607cc3fa0a8d82ff"
      },
      {
        "ref": "artifact:evidence/api-contract.txt",
        "relative_path": "evidence/api-contract.txt",
        "raw_file_digest": "sha256:0f1e070ec7309fc2071086fb53c67208b958e0239693a588cc281a9c46a176f5"
      },
      {
        "ref": "artifact:evidence/api-contract-negative.txt",
        "relative_path": "evidence/api-contract-negative.txt",
        "raw_file_digest": "sha256:71dd60fd6fc4f57065a89c10882dc121760e65b8984f1f9996dd78e1bb34ed04"
      },
      {
        "ref": "artifact:evidence/backend-rule.txt",
        "relative_path": "evidence/backend-rule.txt",
        "raw_file_digest": "sha256:e7121dac450eeb48623d46832ba0c405e46a7c6d1bc07e992cff8b800697842b"
      },
      {
        "ref": "artifact:evidence/handoff.txt",
        "relative_path": "evidence/handoff.txt",
        "raw_file_digest": "sha256:3e793591dbf0711c9a9144b1dd8b7cbb897ee8ae010fdc569c5d4ce8013725ab"
      },
      {
        "ref": "artifact:evidence/test-coverage.txt",
        "relative_path": "evidence/test-coverage.txt",
        "raw_file_digest": "sha256:859606440d58c48d2e72b477076ae6535c33201736cb25bff27afb197602e1d5"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "evidence:user-flow",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/user-flow.txt",
      "command": "node --test --test-name-pattern \"verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.431Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:034646e69d4c2e194129e7a68443214c63c4e647d2dbd584219cc98e93276b2d",
      "failure_reason": "N/A",
      "limitations": "Local Node behavior test; not production traffic."
    },
    {
      "id": "evidence:user-flow-regression",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/user-flow-regression.txt",
      "command": "node --test --test-name-pattern \"verify:user-flow-regression-smoke-existing-critical-flow-still-works-af\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.498Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:65806637334ac0c184ea9c1bab29041684694a0fe6ae08e15d381ee8e6966ffe",
      "failure_reason": "N/A",
      "limitations": "Local regression behavior test; not production traffic."
    },
    {
      "id": "evidence:frontend-ui",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/frontend-ui.txt",
      "command": "node --test --test-name-pattern \"verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.564Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-"
      ],
      "output_digest": "sha256:aa865e3eee5d7eb3061699a3036204d30e5f3ace6f3a19bdb96284a7c12a0e8c",
      "failure_reason": "N/A",
      "limitations": "Form-state behavior evidence; browser visual regression is not included."
    },
    {
      "id": "evidence:error-copy",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/error-copy.txt",
      "command": "node --test --test-name-pattern \"verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.630Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-"
      ],
      "output_digest": "sha256:3ca27950b8c055dd61f53fc870228a76475eb143474ec51b607cc3fa0a8d82ff",
      "failure_reason": "N/A",
      "limitations": "Bounded validation-copy evidence; localization is outside this example."
    },
    {
      "id": "evidence:api-contract-positive",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/api-contract.txt",
      "command": "node --test --test-name-pattern \"verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.695Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t"
      ],
      "output_digest": "sha256:0f1e070ec7309fc2071086fb53c67208b958e0239693a588cc281a9c46a176f5",
      "failure_reason": "N/A",
      "limitations": "In-process API-contract behavior evidence; not production traffic."
    },
    {
      "id": "evidence:api-contract-negative",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/api-contract-negative.txt",
      "command": "node --test --test-name-pattern \"verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.761Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-"
      ],
      "output_digest": "sha256:71dd60fd6fc4f57065a89c10882dc121760e65b8984f1f9996dd78e1bb34ed04",
      "failure_reason": "N/A",
      "limitations": "In-process API rejection evidence; not production traffic."
    },
    {
      "id": "evidence:backend-rule",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/backend-rule.txt",
      "command": "node --test --test-name-pattern \"verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.827Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-"
      ],
      "output_digest": "sha256:e7121dac450eeb48623d46832ba0c405e46a7c6d1bc07e992cff8b800697842b",
      "failure_reason": "N/A",
      "limitations": "Domain validation evidence; database migration is outside this example."
    },
    {
      "id": "evidence:handoff",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/handoff.txt",
      "command": "node --test --test-name-pattern \"verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.893Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:3e793591dbf0711c9a9144b1dd8b7cbb897ee8ae010fdc569c5d4ce8013725ab",
      "failure_reason": "N/A",
      "limitations": "Task handoff evidence; release approval is outside this example."
    },
    {
      "id": "evidence:test-coverage",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/test-coverage.txt",
      "command": "node --test --test-name-pattern \"verify:test-coverage-regression-smoke-task-specific-verification-exists\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.959Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:859606440d58c48d2e72b477076ae6535c33201736cb25bff27afb197602e1d5",
      "failure_reason": "N/A",
      "limitations": "Task-specific obligation declaration evidence; release approval is outside this example."
    },
    {
      "id": "evidence:observed-proof-837820499417a1ca345f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/user-flow.txt",
      "command": "node --test --test-name-pattern \"verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.431Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:034646e69d4c2e194129e7a68443214c63c4e647d2dbd584219cc98e93276b2d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/appointment-service-time.test.mjs; test name valid appointment follows the service-time booking flow; source line 14."
    },
    {
      "id": "evidence:observed-proof-5a971d3e71ee383d634b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/user-flow-regression.txt",
      "command": "node --test --test-name-pattern \"verify:user-flow-regression-smoke-existing-critical-flow-still-works-af\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.498Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:65806637334ac0c184ea9c1bab29041684694a0fe6ae08e15d381ee8e6966ffe",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/appointment-service-time.test.mjs; test name existing valid booking path remains available; source line 14."
    },
    {
      "id": "evidence:observed-proof-7c24796bcdb3d1a6b59e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/frontend-ui.txt",
      "command": "node --test --test-name-pattern \"verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.564Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-"
      ],
      "output_digest": "sha256:aa865e3eee5d7eb3061699a3036204d30e5f3ace6f3a19bdb96284a7c12a0e8c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/appointment-service-time.test.mjs; test name form disables submission when service time is missing; source line 14."
    },
    {
      "id": "evidence:observed-proof-18211c50285f07e3ec78",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/error-copy.txt",
      "command": "node --test --test-name-pattern \"verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.630Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-"
      ],
      "output_digest": "sha256:3ca27950b8c055dd61f53fc870228a76475eb143474ec51b607cc3fa0a8d82ff",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/appointment-service-time.test.mjs; test name blocked submission receives bounded error copy; source line 14."
    },
    {
      "id": "evidence:observed-proof-64d78f1208c8ac2589f1",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/api-contract.txt",
      "command": "node --test --test-name-pattern \"verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.695Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t"
      ],
      "output_digest": "sha256:0f1e070ec7309fc2071086fb53c67208b958e0239693a588cc281a9c46a176f5",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/appointment-service-time.test.mjs; test name API accepts a request with service time; source line 14."
    },
    {
      "id": "evidence:observed-proof-aa23d13d61bd8fd265ed",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/api-contract-negative.txt",
      "command": "node --test --test-name-pattern \"verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.761Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-"
      ],
      "output_digest": "sha256:71dd60fd6fc4f57065a89c10882dc121760e65b8984f1f9996dd78e1bb34ed04",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/appointment-service-time.test.mjs; test name API rejects a request without service time; source line 14."
    },
    {
      "id": "evidence:observed-proof-e30468b3f5ebb22be4d5",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/backend-rule.txt",
      "command": "node --test --test-name-pattern \"verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.827Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-"
      ],
      "output_digest": "sha256:e7121dac450eeb48623d46832ba0c405e46a7c6d1bc07e992cff8b800697842b",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/appointment-service-time.test.mjs; test name domain handler enforces the rule when UI is bypassed; source line 14."
    },
    {
      "id": "evidence:observed-proof-be086aded5c7015625d3",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/handoff.txt",
      "command": "node --test --test-name-pattern \"verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.893Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:3e793591dbf0711c9a9144b1dd8b7cbb897ee8ae010fdc569c5d4ce8013725ab",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/appointment-service-time.test.mjs; test name handoff explains the service-time rule and enforcement surfaces; source line 14."
    },
    {
      "id": "evidence:observed-proof-a3b2e7252f8fcbe26f06",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/test-coverage.txt",
      "command": "node --test --test-name-pattern \"verify:test-coverage-regression-smoke-task-specific-verification-exists\" tests/appointment-service-time.test.mjs",
      "owner": "automated-test-command",
      "environment": "node-v23.11.0",
      "ran_at": "2026-07-19T00:03:32.959Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:859606440d58c48d2e72b477076ae6535c33201736cb25bff27afb197602e1d5",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/appointment-service-time.test.mjs; test name task-specific test target declares every required obligation; source line 14."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-837820499417a1ca345f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-5a971d3e71ee383d634b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:frontend-ui-ui-interaction-test-visible-form-or-screen-behavior-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-7c24796bcdb3d1a6b59e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-64d78f1208c8ac2589f1"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-aa23d13d61bd8fd265ed"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-e30468b3f5ebb22be4d5"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-18211c50285f07e3ec78"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-be086aded5c7015625d3"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-a3b2e7252f8fcbe26f06"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    }
  ],
  "business_universe_binding": {
    "required": "No",
    "routing_result": "NOT_REQUIRED_WITH_REASON",
    "business_universe_ref": "N/A",
    "business_universe_digest": "N/A",
    "business_universe_state": "NOT_REQUIRED_WITH_REASON",
    "coverage_scenario_ids": [],
    "coverage_mapping_status": "NOT_REQUIRED"
  },
  "scenario_coverage_map": [],
  "test_quality_controls": [
    {
      "id": "control:negative-path-required",
      "applies_to": "API_CONTRACT",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:api-contract-positive",
        "evidence:observed-proof-64d78f1208c8ac2589f1",
        "evidence:api-contract-negative",
        "evidence:observed-proof-aa23d13d61bd8fd265ed"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:ui-only-not-enough",
      "applies_to": "BACKEND_RULE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:backend-rule",
        "evidence:observed-proof-e30468b3f5ebb22be4d5"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:cross-surface-required",
      "applies_to": "FRONTEND_UI,BACKEND_RULE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:frontend-ui",
        "evidence:observed-proof-7c24796bcdb3d1a6b59e",
        "evidence:backend-rule",
        "evidence:observed-proof-e30468b3f5ebb22be4d5"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:observed-proof-a3b2e7252f8fcbe26f06"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
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
