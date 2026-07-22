# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 27/27 required obligations covered by 33 evidence item(s).

## User Request

- Request: Add append-only Work Queue task state transitions so published task snapshots remain immutable while exactly one successor becomes current.
- Task ref: `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/114-work-queue-state-transition-governance.md` | `VERIFICATION_PLAN_READY` | `sha256:862b949eee7fd3c79fa59d26761cf3949307184d3f8562c34662ac0b6c7acede` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/114-work-queue-state-transition-governance.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:e6331b53b9851b4f2e773ef743d126166724e33b7dea642589c34e6dca1efc8a` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-114-work-queue-state-transition-governance.md` | `CHANGE_IMPACT_RECORDED` | `sha256:bbe000c75f4f2c4f7848110e943e08f90aa1f8c6d387cd18f9d9d262d9d8958d` |
| `business_universe_coverage` | `RECORDED` | `artifact:business-universe-coverage-reports/114-work-queue-state-transition-governance.md` | `COVERAGE_READY` | `sha256:a85391d153990d3afca06de44cf289cf2fc626d64fbf7745b2d65e9dfdc2ddb6` |
| `control_effectiveness` | `NOT_PROVIDED` | `N/A` | `NOT_APPLICABLE_WITH_REASON` | `N/A` |
| `verification_run_manifest` | `RECORDED` | `artifact:verification-run-manifests/114-work-queue-state-transition-governance.md` | `RUNTIME_TRUST_COMPLETE` | `sha256:3c8c4183cd5a9cf500641ea39970b92490e1ccc75388296f880f5f8e42c3a203` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/114-work-queue-state-transition-governance.md`
- Test evidence digest: `sha256:bb07c58810cd877dae6439b7444d13455b184738429da75b76c3d894ecf99c9a`
- Verification plan ref: `artifact:verification-plans/114-work-queue-state-transition-governance.md`
- Verification plan digest: `sha256:862b949eee7fd3c79fa59d26761cf3949307184d3f8562c34662ac0b6c7acede`
- Intent digest: `sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121`

## Verification Plan Binding

- Verification plan state: `VERIFICATION_PLAN_READY`
- Required obligations: `27`
- Covered obligations: `27`
- Missing obligations: `0`

## Runtime Trust Binding

| Field | Value |
| --- | --- |
| Requirement | `REQUIRED` |
| Status | `VERIFIED` |
| Run Manifest | `artifact:verification-run-manifests/114-work-queue-state-transition-governance.md` |
| Run ID | `vrun-114-work-queue-transition-r4` |
| Task Ref | `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739` |
| Intent Digest | `sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121` |
| Runtime Trust Level | `ISOLATED_RUNTIME` |
| Current Project Match | `Yes` |
| Current Task Match | `Yes` |
| Current Intent Match | `Yes` |
| Current Verification Plan Match | `Yes` |
| Reason | The exact current run passed the authoritative checker and consumer identity checks. |

## Control Effectiveness Binding

- Requirement: `NOT_REQUIRED`
- Status: `NOT_REQUIRED`
- Report: `N/A`
- Report digest: `N/A`
- Required claims: N/A
- Assessment outcome: `NOT_APPLICABLE_WITH_REASON`
- Reason: The current task does not rely on a control as proof for its adoption, plan, verification, release-readiness, or completion claim.

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
| `coverage-scenario:62567cdf836ba48477a8f448` | `verify:universe-77a8f448-expected`, `verify:universe-77a8f448-negative` | `verify:universe-77a8f448-expected`, `verify:universe-77a8f448-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f9debc91cb43fd9fba77`, `evidence:runtime-observed-proof-e1365db60763a7d95146` |
| `coverage-scenario:740a71757b14288ae4141c50` | `verify:universe-e4141c50-expected`, `verify:universe-e4141c50-negative` | `verify:universe-e4141c50-expected`, `verify:universe-e4141c50-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-4806d70d10581ebece9c`, `evidence:runtime-observed-proof-43849896249e48251b01` |
| `coverage-scenario:d7545e8b22bb9bfa081a836f` | `verify:universe-081a836f-expected`, `verify:universe-081a836f-negative` | `verify:universe-081a836f-expected`, `verify:universe-081a836f-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-28883e750e05f58e7ec8`, `evidence:runtime-observed-proof-a1dac7b2b51b0cea0a3a` |
| `coverage-scenario:c8256b97414d3a4b1abf3bf4` | `verify:universe-1abf3bf4-expected`, `verify:universe-1abf3bf4-negative` | `verify:universe-1abf3bf4-expected`, `verify:universe-1abf3bf4-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-14e4ee8fa0d71501e4dc`, `evidence:runtime-observed-proof-0a34fd6b36431e429926` |
| `coverage-scenario:cfd07c06b02bfbc6d630cfd9` | `verify:universe-d630cfd9-expected`, `verify:universe-d630cfd9-negative` | `verify:universe-d630cfd9-expected`, `verify:universe-d630cfd9-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-15283ff44232463b62d2`, `evidence:runtime-observed-proof-4dce3290bf54711b05d2` |
| `coverage-scenario:ffb9bbaca3043be408850f5d` | `verify:universe-08850f5d-expected`, `verify:universe-08850f5d-negative` | `verify:universe-08850f5d-expected`, `verify:universe-08850f5d-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-57fd8ea95271a4eb9332`, `evidence:runtime-observed-proof-b2f668c1e31403ae7677` |
| `coverage-scenario:79c17acfcbaca9b2d0e72ece` | `verify:universe-d0e72ece-expected`, `verify:universe-d0e72ece-negative` | `verify:universe-d0e72ece-expected`, `verify:universe-d0e72ece-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-6e9c12dd40bceff20ea0`, `evidence:runtime-observed-proof-69fe80d561e49fd38816` |
| `coverage-scenario:eb423e2eba675f15d896a585` | `verify:universe-d896a585-expected`, `verify:universe-d896a585-negative` | `verify:universe-d896a585-expected`, `verify:universe-d896a585-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-c29c55a0dda69b281495`, `evidence:runtime-observed-proof-e1c3ed4a94562dc69b6f` |
| `coverage-scenario:067b89b0642246adf9542c4e` | `verify:universe-f9542c4e-expected`, `verify:universe-f9542c4e-negative` | `verify:universe-f9542c4e-expected`, `verify:universe-f9542c4e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-6810949d4f9b89dbad4b`, `evidence:runtime-observed-proof-5da77e34e453e3012573` |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `runtime:self-runtime-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-negative.log` | node scripts/verification-runtime-self-service.mjs negative | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:f0c64473ca16c97068e2393d7f02614f1f9f2b296a302b5011292ccaf4de4727` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-runtime-positive` | `COMMAND_OUTPUT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-positive.log` | node scripts/verification-runtime-self-service.mjs positive | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:83b643a0c09cea403e50a540703805d32d1e9352fa2e2f6ea4cbbfaf90aec786` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-candidate-verification` | `COMMAND_OUTPUT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-candidate-verification.log` | npm run verify:pre-runtime | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:4b46e35d4e35f9efcc85fd43155b9eb94b1448257e70d07afe7510bda92301a0` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-obligation-evidence` | `COMMAND_OUTPUT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-`, `verify:background-work-integration-contract-check-scheduled-queued-retr`, `verify:data-model-data-model-check-data-model-historical-records-migrat`, `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb`, `verify:test-coverage-regression-smoke-task-specific-verification-exists`, `verify:universe-081a836f-expected`, `verify:universe-081a836f-negative`, `verify:universe-08850f5d-expected`, `verify:universe-08850f5d-negative`, `verify:universe-1abf3bf4-expected`, `verify:universe-1abf3bf4-negative`, `verify:universe-77a8f448-expected`, `verify:universe-77a8f448-negative`, `verify:universe-d0e72ece-expected`, `verify:universe-d0e72ece-negative`, `verify:universe-d630cfd9-expected`, `verify:universe-d630cfd9-negative`, `verify:universe-d896a585-expected`, `verify:universe-d896a585-negative`, `verify:universe-e4141c50-expected`, `verify:universe-e4141c50-negative`, `verify:universe-f9542c4e-expected`, `verify:universe-f9542c4e-negative`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af`, `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-runtime-behavior` | `COMMAND_OUTPUT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:e69d77d7f2fde7ffe20db743fb1f4ff65458df600aef3526a4f1a0aefd6cfe40` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `evidence:runtime-observed-proof-f9debc91cb43fd9fba77` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-77a8f448-expected` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 1. |
| `evidence:runtime-observed-proof-e1365db60763a7d95146` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-77a8f448-negative` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 2. |
| `evidence:runtime-observed-proof-4806d70d10581ebece9c` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-e4141c50-expected` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 3. |
| `evidence:runtime-observed-proof-43849896249e48251b01` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-e4141c50-negative` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 4. |
| `evidence:runtime-observed-proof-28883e750e05f58e7ec8` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-081a836f-expected` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 5. |
| `evidence:runtime-observed-proof-a1dac7b2b51b0cea0a3a` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-081a836f-negative` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 6. |
| `evidence:runtime-observed-proof-14e4ee8fa0d71501e4dc` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-1abf3bf4-expected` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 7. |
| `evidence:runtime-observed-proof-0a34fd6b36431e429926` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-1abf3bf4-negative` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 8. |
| `evidence:runtime-observed-proof-15283ff44232463b62d2` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d630cfd9-expected` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 9. |
| `evidence:runtime-observed-proof-4dce3290bf54711b05d2` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d630cfd9-negative` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 10. |
| `evidence:runtime-observed-proof-57fd8ea95271a4eb9332` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-08850f5d-expected` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 11. |
| `evidence:runtime-observed-proof-b2f668c1e31403ae7677` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-08850f5d-negative` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 12. |
| `evidence:runtime-observed-proof-6e9c12dd40bceff20ea0` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d0e72ece-expected` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 13. |
| `evidence:runtime-observed-proof-69fe80d561e49fd38816` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d0e72ece-negative` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 14. |
| `evidence:runtime-observed-proof-c29c55a0dda69b281495` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d896a585-expected` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 15. |
| `evidence:runtime-observed-proof-e1c3ed4a94562dc69b6f` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d896a585-negative` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 16. |
| `evidence:runtime-observed-proof-6810949d4f9b89dbad4b` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f9542c4e-expected` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 17. |
| `evidence:runtime-observed-proof-5da77e34e453e3012573` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f9542c4e-negative` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 18. |
| `evidence:runtime-observed-proof-7e57146c97af4b0355d7` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 19. |
| `evidence:runtime-observed-proof-6af9c34895421d56b6f8` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 20. |
| `evidence:runtime-observed-proof-dae5d7677c9ddf10bb50` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 21. |
| `evidence:runtime-observed-proof-ca157f99c8d2ce7c4170` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:data-model-data-model-check-data-model-historical-records-migrat` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 22. |
| `evidence:runtime-observed-proof-d79a87508d83cc649982` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 23. |
| `evidence:runtime-observed-proof-0a08a3cf10ddad8cbf10` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 24. |
| `evidence:runtime-observed-proof-0c4884efc79b8d8c3af0` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 25. |
| `evidence:runtime-observed-proof-da8428f054049989a031` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 26. |
| `evidence:runtime-observed-proof-c09b4fea50117763fc5a` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:e69d77d7f2fde7ffe20db743fb1f4ff65458df600aef3526a4f1a0aefd6cfe40` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1. |
| `evidence:runtime-observed-proof-9bee70657ad5a425abeb` | `LOG_EXCERPT` | `PASSED` | `artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:e69d77d7f2fde7ffe20db743fb1f4ff65458df600aef3526a4f1a0aefd6cfe40` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:universe-77a8f448-expected` | `COVERED` | `evidence:runtime-observed-proof-f9debc91cb43fd9fba77` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-77a8f448-negative` | `COVERED` | `evidence:runtime-observed-proof-e1365db60763a7d95146` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-e4141c50-expected` | `COVERED` | `evidence:runtime-observed-proof-4806d70d10581ebece9c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-e4141c50-negative` | `COVERED` | `evidence:runtime-observed-proof-43849896249e48251b01` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-081a836f-expected` | `COVERED` | `evidence:runtime-observed-proof-28883e750e05f58e7ec8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-081a836f-negative` | `COVERED` | `evidence:runtime-observed-proof-a1dac7b2b51b0cea0a3a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-1abf3bf4-expected` | `COVERED` | `evidence:runtime-observed-proof-14e4ee8fa0d71501e4dc` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-1abf3bf4-negative` | `COVERED` | `evidence:runtime-observed-proof-0a34fd6b36431e429926` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d630cfd9-expected` | `COVERED` | `evidence:runtime-observed-proof-15283ff44232463b62d2` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d630cfd9-negative` | `COVERED` | `evidence:runtime-observed-proof-4dce3290bf54711b05d2` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-08850f5d-expected` | `COVERED` | `evidence:runtime-observed-proof-57fd8ea95271a4eb9332` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-08850f5d-negative` | `COVERED` | `evidence:runtime-observed-proof-b2f668c1e31403ae7677` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d0e72ece-expected` | `COVERED` | `evidence:runtime-observed-proof-6e9c12dd40bceff20ea0` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d0e72ece-negative` | `COVERED` | `evidence:runtime-observed-proof-69fe80d561e49fd38816` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d896a585-expected` | `COVERED` | `evidence:runtime-observed-proof-c29c55a0dda69b281495` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d896a585-negative` | `COVERED` | `evidence:runtime-observed-proof-e1c3ed4a94562dc69b6f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f9542c4e-expected` | `COVERED` | `evidence:runtime-observed-proof-6810949d4f9b89dbad4b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f9542c4e-negative` | `COVERED` | `evidence:runtime-observed-proof-5da77e34e453e3012573` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:runtime-observed-proof-7e57146c97af4b0355d7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:runtime-observed-proof-6af9c34895421d56b6f8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-` | `COVERED` | `evidence:runtime-observed-proof-dae5d7677c9ddf10bb50` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:data-model-data-model-check-data-model-historical-records-migrat` | `COVERED` | `evidence:runtime-observed-proof-ca157f99c8d2ce7c4170` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `COVERED` | `evidence:runtime-observed-proof-d79a87508d83cc649982` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `COVERED` | `evidence:runtime-observed-proof-c09b4fea50117763fc5a`, `evidence:runtime-observed-proof-9bee70657ad5a425abeb` | A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation. |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `COVERED` | `evidence:runtime-observed-proof-0a08a3cf10ddad8cbf10` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:runtime-observed-proof-0c4884efc79b8d8c3af0` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:runtime-observed-proof-da8428f054049989a031` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:ui-only-not-enough` | `BACKEND_RULE` | `SATISFIED` | `runtime:self-current-obligation-evidence`, `evidence:runtime-observed-proof-dae5d7677c9ddf10bb50` | Evidence is mapped to related Verification Plan obligations. |
| `control:generated-test-review-required` | `TEST_COVERAGE` | `SATISFIED` | `runtime:self-current-obligation-evidence`, `evidence:runtime-observed-proof-da8428f054049989a031` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:runtime-observed-proof-da8428f054049989a031` | Evidence is mapped to related Verification Plan obligations. |

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
  "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
  "intent": "Add append-only Work Queue task state transitions so published task snapshots remain immutable while exactly one successor becomes current.",
  "intent_digest": "sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121",
  "test_evidence_ref": "artifact:test-evidence-reports/114-work-queue-state-transition-governance.md",
  "test_evidence_digest": "sha256:bb07c58810cd877dae6439b7444d13455b184738429da75b76c3d894ecf99c9a",
  "verification_plan_ref": "artifact:verification-plans/114-work-queue-state-transition-governance.md",
  "verification_plan_digest": "sha256:862b949eee7fd3c79fa59d26761cf3949307184d3f8562c34662ac0b6c7acede",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/114-work-queue-state-transition-governance.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:862b949eee7fd3c79fa59d26761cf3949307184d3f8562c34662ac0b6c7acede"
    },
    {
      "name": "business_rule_closure",
      "status": "RECORDED",
      "ref": "artifact:business-rule-closures/114-work-queue-state-transition-governance.md",
      "source_outcome": "READY_FOR_IMPACT_COVERAGE",
      "digest": "sha256:e6331b53b9851b4f2e773ef743d126166724e33b7dea642589c34e6dca1efc8a"
    },
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/preflight-114-work-queue-state-transition-governance.md",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "digest": "sha256:bbe000c75f4f2c4f7848110e943e08f90aa1f8c6d387cd18f9d9d262d9d8958d"
    },
    {
      "name": "business_universe_coverage",
      "status": "RECORDED",
      "ref": "artifact:business-universe-coverage-reports/114-work-queue-state-transition-governance.md",
      "source_outcome": "COVERAGE_READY",
      "digest": "sha256:a85391d153990d3afca06de44cf289cf2fc626d64fbf7745b2d65e9dfdc2ddb6"
    },
    {
      "name": "control_effectiveness",
      "status": "NOT_PROVIDED",
      "ref": "N/A",
      "source_outcome": "NOT_APPLICABLE_WITH_REASON",
      "digest": "N/A"
    },
    {
      "name": "verification_run_manifest",
      "status": "RECORDED",
      "ref": "artifact:verification-run-manifests/114-work-queue-state-transition-governance.md",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "digest": "sha256:3c8c4183cd5a9cf500641ea39970b92490e1ccc75388296f880f5f8e42c3a203"
    }
  ],
  "runtime_trust_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "run_manifest_ref": "artifact:verification-run-manifests/114-work-queue-state-transition-governance.md",
    "run_manifest_digest": "sha256:3c8c4183cd5a9cf500641ea39970b92490e1ccc75388296f880f5f8e42c3a203",
    "run_id": "vrun-114-work-queue-transition-r4",
    "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
    "intent_digest": "sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121",
    "runtime_trust_level": "ISOLATED_RUNTIME",
    "runtime_plan_ref": "artifact:verification-runtime-plans/114-work-queue-state-transition-governance.md",
    "runtime_plan_digest": "sha256:72282748ab322b2e537ca4a7f168ce7e2fcc075dd0a43f9d0be19112bb424810",
    "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md",
    "lifecycle_plan_digest": "sha256:3cba47bfff828f6e7378e26bfa4251c899c736bcbd2b11ada4e854aacdf4911d",
    "verification_plan_ref": "artifact:verification-plans/114-work-queue-state-transition-governance.md",
    "verification_plan_digest": "sha256:862b949eee7fd3c79fa59d26761cf3949307184d3f8562c34662ac0b6c7acede",
    "current_project_match": "Yes",
    "current_task_match": "Yes",
    "current_intent_match": "Yes",
    "current_verification_plan_match": "Yes",
    "checker": "scripts/check-verification-run-manifest.mjs --require-complete",
    "reason": "The exact current run passed the authoritative checker and consumer identity checks."
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
    "reason": "The current task does not rely on a control as proof for its adoption, plan, verification, release-readiness, or completion claim."
  },
  "authority_binding": {
    "binding_version": "1.91.0",
    "project": {
      "kind": "GIT",
      "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
      "revision": "sha256:b31b155286370c44f3cac0fe18cef4314e7d01b704fb910bc84a03abc5a4568a"
    },
    "task": {
      "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
      "intent_digest": "sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121"
    },
    "sources": [
      {
        "ref": "artifact:verification-plans/114-work-queue-state-transition-governance.md",
        "relative_path": "verification-plans/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:435ba891240927ffb7c0b85a568fd572979e0557ede54fcb8a7bcbaf3d44f6b0"
      },
      {
        "ref": "artifact:business-rule-closures/114-work-queue-state-transition-governance.md",
        "relative_path": "business-rule-closures/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:e14bc14b1655373cc2c6d3f35fb07f23d5bdc4529e22559f6fbbdb77b1e86e77"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/preflight-114-work-queue-state-transition-governance.md",
        "relative_path": "change-impact-coverage-reports/preflight-114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:908ce0b614a41c846f4d0316d8844d72fe4d272cd07ed39c9e335411c2e2f883"
      },
      {
        "ref": "artifact:business-universe-coverage-reports/114-work-queue-state-transition-governance.md",
        "relative_path": "business-universe-coverage-reports/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:44707fc8d2ccf93c9772d28ca375f226719997ff9ba811c1168e7280bb93e7f0"
      },
      {
        "ref": "artifact:verification-run-manifests/114-work-queue-state-transition-governance.md",
        "relative_path": "verification-run-manifests/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:be5bbb7a59cf10cdaca6133b485a0647fe8bcbd68baf20438252babff7490031"
      },
      {
        "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-negative.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:f0c64473ca16c97068e2393d7f02614f1f9f2b296a302b5011292ccaf4de4727"
      },
      {
        "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-positive.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:83b643a0c09cea403e50a540703805d32d1e9352fa2e2f6ea4cbbfaf90aec786"
      },
      {
        "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-candidate-verification.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:4b46e35d4e35f9efcc85fd43155b9eb94b1448257e70d07afe7510bda92301a0"
      },
      {
        "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a"
      },
      {
        "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log",
        "relative_path": ".intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:e69d77d7f2fde7ffe20db743fb1f4ff65458df600aef3526a4f1a0aefd6cfe40"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "runtime:self-runtime-negative",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-negative.log",
      "command": "node scripts/verification-runtime-self-service.mjs negative",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T05:54:45.380Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:f0c64473ca16c97068e2393d7f02614f1f9f2b296a302b5011292ccaf4de4727",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-runtime-positive",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-runtime-positive.log",
      "command": "node scripts/verification-runtime-self-service.mjs positive",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T05:54:45.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:83b643a0c09cea403e50a540703805d32d1e9352fa2e2f6ea4cbbfaf90aec786",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-candidate-verification",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-candidate-verification.log",
      "command": "npm run verify:pre-runtime",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.167Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:4b46e35d4e35f9efcc85fd43155b9eb94b1448257e70d07afe7510bda92301a0",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-obligation-evidence",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-",
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:data-model-data-model-check-data-model-historical-records-migrat",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-081a836f-expected",
        "verify:universe-081a836f-negative",
        "verify:universe-08850f5d-expected",
        "verify:universe-08850f5d-negative",
        "verify:universe-1abf3bf4-expected",
        "verify:universe-1abf3bf4-negative",
        "verify:universe-77a8f448-expected",
        "verify:universe-77a8f448-negative",
        "verify:universe-d0e72ece-expected",
        "verify:universe-d0e72ece-negative",
        "verify:universe-d630cfd9-expected",
        "verify:universe-d630cfd9-negative",
        "verify:universe-d896a585-expected",
        "verify:universe-d896a585-negative",
        "verify:universe-e4141c50-expected",
        "verify:universe-e4141c50-negative",
        "verify:universe-f9542c4e-expected",
        "verify:universe-f9542c4e-negative",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-runtime-behavior",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.966Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:e69d77d7f2fde7ffe20db743fb1f4ff65458df600aef3526a4f1a0aefd6cfe40",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "evidence:runtime-observed-proof-f9debc91cb43fd9fba77",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-77a8f448-expected"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-e1365db60763a7d95146",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-77a8f448-negative"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 2."
    },
    {
      "id": "evidence:runtime-observed-proof-4806d70d10581ebece9c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-e4141c50-expected"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 3."
    },
    {
      "id": "evidence:runtime-observed-proof-43849896249e48251b01",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-e4141c50-negative"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 4."
    },
    {
      "id": "evidence:runtime-observed-proof-28883e750e05f58e7ec8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-081a836f-expected"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 5."
    },
    {
      "id": "evidence:runtime-observed-proof-a1dac7b2b51b0cea0a3a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-081a836f-negative"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 6."
    },
    {
      "id": "evidence:runtime-observed-proof-14e4ee8fa0d71501e4dc",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-1abf3bf4-expected"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 7."
    },
    {
      "id": "evidence:runtime-observed-proof-0a34fd6b36431e429926",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-1abf3bf4-negative"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 8."
    },
    {
      "id": "evidence:runtime-observed-proof-15283ff44232463b62d2",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d630cfd9-expected"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 9."
    },
    {
      "id": "evidence:runtime-observed-proof-4dce3290bf54711b05d2",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d630cfd9-negative"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 10."
    },
    {
      "id": "evidence:runtime-observed-proof-57fd8ea95271a4eb9332",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-08850f5d-expected"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 11."
    },
    {
      "id": "evidence:runtime-observed-proof-b2f668c1e31403ae7677",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-08850f5d-negative"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 12."
    },
    {
      "id": "evidence:runtime-observed-proof-6e9c12dd40bceff20ea0",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d0e72ece-expected"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 13."
    },
    {
      "id": "evidence:runtime-observed-proof-69fe80d561e49fd38816",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d0e72ece-negative"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 14."
    },
    {
      "id": "evidence:runtime-observed-proof-c29c55a0dda69b281495",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d896a585-expected"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 15."
    },
    {
      "id": "evidence:runtime-observed-proof-e1c3ed4a94562dc69b6f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d896a585-negative"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 16."
    },
    {
      "id": "evidence:runtime-observed-proof-6810949d4f9b89dbad4b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f9542c4e-expected"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 17."
    },
    {
      "id": "evidence:runtime-observed-proof-5da77e34e453e3012573",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f9542c4e-negative"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 18."
    },
    {
      "id": "evidence:runtime-observed-proof-7e57146c97af4b0355d7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 19."
    },
    {
      "id": "evidence:runtime-observed-proof-6af9c34895421d56b6f8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 20."
    },
    {
      "id": "evidence:runtime-observed-proof-dae5d7677c9ddf10bb50",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 21."
    },
    {
      "id": "evidence:runtime-observed-proof-ca157f99c8d2ce7c4170",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:data-model-data-model-check-data-model-historical-records-migrat"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 22."
    },
    {
      "id": "evidence:runtime-observed-proof-d79a87508d83cc649982",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 23."
    },
    {
      "id": "evidence:runtime-observed-proof-0a08a3cf10ddad8cbf10",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 24."
    },
    {
      "id": "evidence:runtime-observed-proof-0c4884efc79b8d8c3af0",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 25."
    },
    {
      "id": "evidence:runtime-observed-proof-da8428f054049989a031",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.892Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:6d5976b06eff4b00edf9c5b73b5dd368b8533dd2afe099f3fa8898327097d60a",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 26."
    },
    {
      "id": "evidence:runtime-observed-proof-c09b4fea50117763fc5a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.966Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:e69d77d7f2fde7ffe20db743fb1f4ff65458df600aef3526a4f1a0aefd6cfe40",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-9bee70657ad5a425abeb",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:.intentos/runtime-runs/vrun-114-work-queue-transition-r4/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T06:02:05.966Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:e69d77d7f2fde7ffe20db743fb1f4ff65458df600aef3526a4f1a0aefd6cfe40",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:universe-77a8f448-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f9debc91cb43fd9fba77"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-77a8f448-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e1365db60763a7d95146"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-e4141c50-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4806d70d10581ebece9c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-e4141c50-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-43849896249e48251b01"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-081a836f-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-28883e750e05f58e7ec8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-081a836f-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a1dac7b2b51b0cea0a3a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-1abf3bf4-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-14e4ee8fa0d71501e4dc"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-1abf3bf4-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0a34fd6b36431e429926"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d630cfd9-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-15283ff44232463b62d2"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d630cfd9-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4dce3290bf54711b05d2"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-08850f5d-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-57fd8ea95271a4eb9332"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-08850f5d-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b2f668c1e31403ae7677"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d0e72ece-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6e9c12dd40bceff20ea0"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d0e72ece-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-69fe80d561e49fd38816"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d896a585-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c29c55a0dda69b281495"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d896a585-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e1c3ed4a94562dc69b6f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f9542c4e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6810949d4f9b89dbad4b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f9542c4e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5da77e34e453e3012573"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7e57146c97af4b0355d7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6af9c34895421d56b6f8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:backend-rule-backend-rule-test-server-domain-logic-enforces-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-dae5d7677c9ddf10bb50"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:data-model-data-model-check-data-model-historical-records-migrat",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ca157f99c8d2ce7c4170"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:background-work-integration-contract-check-scheduled-queued-retr",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d79a87508d83cc649982"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c09b4fea50117763fc5a",
        "evidence:runtime-observed-proof-9bee70657ad5a425abeb"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation."
    },
    {
      "obligation_id": "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0a08a3cf10ddad8cbf10"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0c4884efc79b8d8c3af0"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-da8428f054049989a031"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    }
  ],
  "business_universe_binding": {
    "required": "Yes",
    "routing_result": "REQUIRED_WITH_EVIDENCE",
    "business_universe_ref": "artifact:business-universe-coverage-reports/114-work-queue-state-transition-governance.md",
    "business_universe_digest": "sha256:a85391d153990d3afca06de44cf289cf2fc626d64fbf7745b2d65e9dfdc2ddb6",
    "business_universe_state": "COVERAGE_READY",
    "coverage_scenario_ids": [
      "coverage-scenario:62567cdf836ba48477a8f448",
      "coverage-scenario:740a71757b14288ae4141c50",
      "coverage-scenario:d7545e8b22bb9bfa081a836f",
      "coverage-scenario:c8256b97414d3a4b1abf3bf4",
      "coverage-scenario:cfd07c06b02bfbc6d630cfd9",
      "coverage-scenario:ffb9bbaca3043be408850f5d",
      "coverage-scenario:79c17acfcbaca9b2d0e72ece",
      "coverage-scenario:eb423e2eba675f15d896a585",
      "coverage-scenario:067b89b0642246adf9542c4e"
    ],
    "coverage_mapping_status": "COMPLETE"
  },
  "scenario_coverage_map": [
    {
      "coverage_scenario_id": "coverage-scenario:62567cdf836ba48477a8f448",
      "required_obligation_ids": [
        "verify:universe-77a8f448-expected",
        "verify:universe-77a8f448-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-77a8f448-expected",
        "verify:universe-77a8f448-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f9debc91cb43fd9fba77",
        "evidence:runtime-observed-proof-e1365db60763a7d95146"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:740a71757b14288ae4141c50",
      "required_obligation_ids": [
        "verify:universe-e4141c50-expected",
        "verify:universe-e4141c50-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-e4141c50-expected",
        "verify:universe-e4141c50-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4806d70d10581ebece9c",
        "evidence:runtime-observed-proof-43849896249e48251b01"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:d7545e8b22bb9bfa081a836f",
      "required_obligation_ids": [
        "verify:universe-081a836f-expected",
        "verify:universe-081a836f-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-081a836f-expected",
        "verify:universe-081a836f-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-28883e750e05f58e7ec8",
        "evidence:runtime-observed-proof-a1dac7b2b51b0cea0a3a"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:c8256b97414d3a4b1abf3bf4",
      "required_obligation_ids": [
        "verify:universe-1abf3bf4-expected",
        "verify:universe-1abf3bf4-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-1abf3bf4-expected",
        "verify:universe-1abf3bf4-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-14e4ee8fa0d71501e4dc",
        "evidence:runtime-observed-proof-0a34fd6b36431e429926"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:cfd07c06b02bfbc6d630cfd9",
      "required_obligation_ids": [
        "verify:universe-d630cfd9-expected",
        "verify:universe-d630cfd9-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-d630cfd9-expected",
        "verify:universe-d630cfd9-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-15283ff44232463b62d2",
        "evidence:runtime-observed-proof-4dce3290bf54711b05d2"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ffb9bbaca3043be408850f5d",
      "required_obligation_ids": [
        "verify:universe-08850f5d-expected",
        "verify:universe-08850f5d-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-08850f5d-expected",
        "verify:universe-08850f5d-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-57fd8ea95271a4eb9332",
        "evidence:runtime-observed-proof-b2f668c1e31403ae7677"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:79c17acfcbaca9b2d0e72ece",
      "required_obligation_ids": [
        "verify:universe-d0e72ece-expected",
        "verify:universe-d0e72ece-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-d0e72ece-expected",
        "verify:universe-d0e72ece-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6e9c12dd40bceff20ea0",
        "evidence:runtime-observed-proof-69fe80d561e49fd38816"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:eb423e2eba675f15d896a585",
      "required_obligation_ids": [
        "verify:universe-d896a585-expected",
        "verify:universe-d896a585-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-d896a585-expected",
        "verify:universe-d896a585-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c29c55a0dda69b281495",
        "evidence:runtime-observed-proof-e1c3ed4a94562dc69b6f"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:067b89b0642246adf9542c4e",
      "required_obligation_ids": [
        "verify:universe-f9542c4e-expected",
        "verify:universe-f9542c4e-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-f9542c4e-expected",
        "verify:universe-f9542c4e-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6810949d4f9b89dbad4b",
        "evidence:runtime-observed-proof-5da77e34e453e3012573"
      ]
    }
  ],
  "test_quality_controls": [
    {
      "id": "control:ui-only-not-enough",
      "applies_to": "BACKEND_RULE",
      "status": "SATISFIED",
      "evidence_ids": [
        "runtime:self-current-obligation-evidence",
        "evidence:runtime-observed-proof-dae5d7677c9ddf10bb50"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:generated-test-review-required",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "runtime:self-current-obligation-evidence",
        "evidence:runtime-observed-proof-da8428f054049989a031"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-da8428f054049989a031"
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
