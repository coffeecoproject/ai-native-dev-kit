# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 8/8 required obligations covered by 2 evidence item(s).

## User Request

- Request: IntentOS project entry must reject invalid identity, guidance, authority, or evidence; controlled adoption writes must be atomic; activation must run from project-local assets; current work must remain preserved.
- Task ref: `task:implement-intentos-1-109-project-entry-and-behavior-complete`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/109-project-entry-adoption-trust.md` | `VERIFICATION_PLAN_READY` | `sha256:f931c375684d502e90ebf63c6c581ff0811f7cb1a58f02c0b456c778ec95a1a5` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/109-project-entry-adoption-trust.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:656a30ecfb1ea425e599bb9da5bf752ae2aeb766c89354599ca7bf8f6c64954b` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/109-project-entry-adoption-trust.md` | `CHANGE_IMPACT_RECORDED` | `sha256:ab25b2608405f6f4450610ff2329e648bc739f0eff1f871664ead4a5c82fc466` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/109-project-entry-adoption-trust.md`
- Test evidence digest: `sha256:27adc65072e22df25026a08a0301c2dcec5c0fdd5aa8ad0882761f3f44666cdf`
- Verification plan ref: `artifact:verification-plans/109-project-entry-adoption-trust.md`
- Verification plan digest: `sha256:f931c375684d502e90ebf63c6c581ff0811f7cb1a58f02c0b456c778ec95a1a5`
- Intent digest: `sha256:82fbf04d1c8004e5def93998b4fc6c976a2c6312f705d5d0f748e3e49d859f0d`

## Verification Plan Binding

- Verification plan state: `VERIFICATION_PLAN_READY`
- Required obligations: `8`
- Covered obligations: `8`
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

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
| N/A | N/A | N/A | NOT_APPLICABLE | NOT_COVERED | N/A |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `evidence:109-project-entry-focused` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/109-project-entry-focused.txt` | npm run verify:project-entry | Codex | isolated release candidate /private/tmp/intentos-109-release.kFA0qD | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af`, `verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t`, `verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-`, `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-`, `verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-` | `sha256:f1ab4f4afbeec9c28212ff0744ad64ae196a46dfe3b2d03141cf07dc8c0677f2` | N/A | Repository-level project-entry behavior evidence; it does not prove a business product or production environment. |
| `evidence:109-intentos-self-check` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/109-intentos-self-check.txt` | node scripts/check-intentos.mjs | Codex | isolated release candidate /private/tmp/intentos-109-release.kFA0qD | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:77a84b6ab74dd2afdecee8cb30c9ca09f004d2af6f351b34145b8e7145647ba9` | N/A | Repository self-check evidence for the current task; it does not prove a product runtime or production environment. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:109-project-entry-focused` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:109-project-entry-focused` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t` | `COVERED` | `evidence:109-project-entry-focused` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-` | `COVERED` | `evidence:109-project-entry-focused` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-` | `COVERED` | `evidence:109-project-entry-focused` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-` | `COVERED` | `evidence:109-project-entry-focused` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:109-intentos-self-check` | Task-specific evidence explicitly covers this Verification Plan obligation. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:109-intentos-self-check` | Task-specific evidence explicitly covers this Verification Plan obligation. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:negative-path-required` | `API_CONTRACT` | `SATISFIED` | `evidence:109-project-entry-focused` | Evidence is mapped to related Verification Plan obligations. |
| `control:ui-only-not-enough` | `BACKEND_RULE` | `SATISFIED` | `evidence:109-project-entry-focused` | Evidence is mapped to related Verification Plan obligations. |
| `control:cross-surface-required` | `FRONTEND_UI,BACKEND_RULE` | `SATISFIED` | `evidence:109-project-entry-focused` | Evidence is mapped to related Verification Plan obligations. |
| `control:generated-test-review-required` | `TEST_COVERAGE` | `SATISFIED` | `evidence:109-intentos-self-check` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:109-intentos-self-check` | Evidence is mapped to related Verification Plan obligations. |

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
  "schema_version": "1.108.0",
  "artifact_type": "test_evidence",
  "task_ref": "task:implement-intentos-1-109-project-entry-and-behavior-complete",
  "intent": "IntentOS project entry must reject invalid identity, guidance, authority, or evidence; controlled adoption writes must be atomic; activation must run from project-local assets; current work must remain preserved.",
  "intent_digest": "sha256:82fbf04d1c8004e5def93998b4fc6c976a2c6312f705d5d0f748e3e49d859f0d",
  "test_evidence_ref": "artifact:test-evidence-reports/109-project-entry-adoption-trust.md",
  "test_evidence_digest": "sha256:27adc65072e22df25026a08a0301c2dcec5c0fdd5aa8ad0882761f3f44666cdf",
  "verification_plan_ref": "artifact:verification-plans/109-project-entry-adoption-trust.md",
  "verification_plan_digest": "sha256:f931c375684d502e90ebf63c6c581ff0811f7cb1a58f02c0b456c778ec95a1a5",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/109-project-entry-adoption-trust.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:f931c375684d502e90ebf63c6c581ff0811f7cb1a58f02c0b456c778ec95a1a5"
    },
    {
      "name": "business_rule_closure",
      "status": "RECORDED",
      "ref": "artifact:business-rule-closures/109-project-entry-adoption-trust.md",
      "source_outcome": "READY_FOR_IMPACT_COVERAGE",
      "digest": "sha256:656a30ecfb1ea425e599bb9da5bf752ae2aeb766c89354599ca7bf8f6c64954b"
    },
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/109-project-entry-adoption-trust.md",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "digest": "sha256:ab25b2608405f6f4450610ff2329e648bc739f0eff1f871664ead4a5c82fc466"
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
  "authority_binding": {
    "binding_version": "1.91.0",
    "project": {
      "kind": "GIT",
      "fingerprint": "sha256:d29cf8a8b406b72a196aa31354e54115008efa5402fddc3fe2d3417075c6a7ea",
      "revision": "sha256:b90b83d8cbc6cfbdaa92b7f2390b9849176d7ad36c9a9c4bfe2a70b5701c13c3"
    },
    "task": {
      "task_ref": "task:implement-intentos-1-109-project-entry-and-behavior-complete",
      "intent_digest": "sha256:82fbf04d1c8004e5def93998b4fc6c976a2c6312f705d5d0f748e3e49d859f0d"
    },
    "sources": [
      {
        "ref": "artifact:verification-plans/109-project-entry-adoption-trust.md",
        "relative_path": "verification-plans/109-project-entry-adoption-trust.md",
        "raw_file_digest": "sha256:38cf5241b8011788a4c084bd94163fb35b06d854685efbf46dc4a1e276d6bbbe"
      },
      {
        "ref": "artifact:business-rule-closures/109-project-entry-adoption-trust.md",
        "relative_path": "business-rule-closures/109-project-entry-adoption-trust.md",
        "raw_file_digest": "sha256:e9682ab8c7ae38330f8103ed4d96be402147e3852e846aa323a2f6d401cb96e3"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/109-project-entry-adoption-trust.md",
        "relative_path": "change-impact-coverage-reports/109-project-entry-adoption-trust.md",
        "raw_file_digest": "sha256:367ebd43924a760c0e5976aa7df7c0526ec5ccba943285e9f1384e8511212db4"
      },
      {
        "ref": "artifact:evidence/109-project-entry-focused.txt",
        "relative_path": "evidence/109-project-entry-focused.txt",
        "raw_file_digest": "sha256:f1ab4f4afbeec9c28212ff0744ad64ae196a46dfe3b2d03141cf07dc8c0677f2"
      },
      {
        "ref": "artifact:evidence/109-intentos-self-check.txt",
        "relative_path": "evidence/109-intentos-self-check.txt",
        "raw_file_digest": "sha256:77a84b6ab74dd2afdecee8cb30c9ca09f004d2af6f351b34145b8e7145647ba9"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "evidence:109-project-entry-focused",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/109-project-entry-focused.txt",
      "command": "npm run verify:project-entry",
      "owner": "Codex",
      "environment": "isolated release candidate /private/tmp/intentos-109-release.kFA0qD",
      "ran_at": "2026-07-15T05:01:54+08:00",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t",
        "verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-",
        "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-",
        "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-"
      ],
      "output_digest": "sha256:f1ab4f4afbeec9c28212ff0744ad64ae196a46dfe3b2d03141cf07dc8c0677f2",
      "failure_reason": "N/A",
      "limitations": "Repository-level project-entry behavior evidence; it does not prove a business product or production environment."
    },
    {
      "id": "evidence:109-intentos-self-check",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/109-intentos-self-check.txt",
      "command": "node scripts/check-intentos.mjs",
      "owner": "Codex",
      "environment": "isolated release candidate /private/tmp/intentos-109-release.kFA0qD",
      "ran_at": "2026-07-15T05:01:54+08:00",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:77a84b6ab74dd2afdecee8cb30c9ca09f004d2af6f351b34145b8e7145647ba9",
      "failure_reason": "N/A",
      "limitations": "Repository self-check evidence for the current task; it does not prove a product runtime or production environment."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:109-project-entry-focused"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:109-project-entry-focused"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:api-contract-api-positive-test-valid-api-request-succeeds-with-t",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:109-project-entry-focused"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:api-contract-api-negative-test-invalid-api-request-fails-with-a-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:109-project-entry-focused"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:109-project-entry-focused"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:error-copy-error-copy-check-blocked-users-receive-clear-bounded-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:109-project-entry-focused"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:109-intentos-self-check"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:109-intentos-self-check"
      ],
      "verification_plan_required": "Yes",
      "reason": "Task-specific evidence explicitly covers this Verification Plan obligation."
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
        "evidence:109-project-entry-focused"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:ui-only-not-enough",
      "applies_to": "BACKEND_RULE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:109-project-entry-focused"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:cross-surface-required",
      "applies_to": "FRONTEND_UI,BACKEND_RULE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:109-project-entry-focused"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:generated-test-review-required",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:109-intentos-self-check"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:109-intentos-self-check"
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
