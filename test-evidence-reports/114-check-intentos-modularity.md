# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 26/26 required obligations covered by 53 evidence item(s).

## User Request

- Request: make a local structural split of scripts/check-intentos.mjs into domain suites while preserving output order and exit status
- Task ref: `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/114-check-intentos-modularity.md` | `VERIFICATION_PLAN_READY` | `sha256:82711125cbe3f6d40b4ef934e383c47bcf0eb77284f1c6dac6cf3229f517e48f` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/114-check-intentos-modularity.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:c2a19b2a88ec88ff60e69ffa108a5f47e73677be9bcf8049094accb0c6bd44c3` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-114-check-intentos-modularity.md` | `CHANGE_IMPACT_RECORDED` | `sha256:17ca4ec824c2e74f7ab53c36826203ed4cb004d53a2566d15fd2edfd14fe5805` |
| `business_universe_coverage` | `RECORDED` | `artifact:business-universe-coverage-reports/114-check-intentos-modularity.md` | `COVERAGE_READY` | `sha256:3f37e20e2089089cf1a2757fe1be13a08d3297ca76c22b39ff92e8d95dc9a779` |
| `control_effectiveness` | `RECORDED` | `artifact:control-effectiveness-reports/114-check-intentos-modularity.md` | `CONTROL_PROVEN_EFFECTIVE` | `sha256:fdf02744c8a89600e03ad4308f3bfa934e1322369ec2806c65fb9268dae3750d` |
| `verification_run_manifest` | `RECORDED` | `artifact:verification-run-manifests/114-check-intentos-modularity.md` | `RUNTIME_TRUST_COMPLETE` | `sha256:fe3db04ab5b3c06961e3283edf83baa6339ff07b718a473f7640f3ed23a28209` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/114-check-intentos-modularity.md`
- Test evidence digest: `sha256:7586a5f7b420e13588ed07c1f3cc9d0a2a29ff22339b958c8c8a34594a67b715`
- Verification plan ref: `artifact:verification-plans/114-check-intentos-modularity.md`
- Verification plan digest: `sha256:82711125cbe3f6d40b4ef934e383c47bcf0eb77284f1c6dac6cf3229f517e48f`
- Intent digest: `sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9`

## Verification Plan Binding

- Verification plan state: `VERIFICATION_PLAN_READY`
- Required obligations: `26`
- Covered obligations: `26`
- Missing obligations: `0`

## Runtime Trust Binding

| Field | Value |
| --- | --- |
| Requirement | `REQUIRED` |
| Status | `VERIFIED` |
| Run Manifest | `artifact:verification-run-manifests/114-check-intentos-modularity.md` |
| Run ID | `vrun-114-check-intentos-modularity-r5` |
| Task Ref | `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2` |
| Intent Digest | `sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9` |
| Runtime Trust Level | `TARGETED_SERVICE_IDENTITY` |
| Current Project Match | `Yes` |
| Current Task Match | `Yes` |
| Current Intent Match | `Yes` |
| Current Verification Plan Match | `Yes` |
| Reason | The exact current run passed the authoritative checker and consumer identity checks. |

## Control Effectiveness Binding

- Requirement: `REQUIRED`
- Status: `VERIFIED`
- Report: `artifact:control-effectiveness-reports/114-check-intentos-modularity.md`
- Report digest: `sha256:fdf02744c8a89600e03ad4308f3bfa934e1322369ec2806c65fb9268dae3750d`
- Required claims: `claim:package-script-verify-candidate`, `claim:package-script-verify-consumer-chain-candidate`, `claim:file-scripts-check-adoption-assurance-mjs`, `claim:file-scripts-check-ai-workflow-mjs`, `claim:file-scripts-check-apply-execution-receipt-mjs`, `claim:file-scripts-check-apply-plan-mjs`, `claim:file-scripts-check-approval-record-mjs`, `claim:file-scripts-check-baseline-enforcement-mjs`
- Assessment outcome: `CONTROL_PROVEN_EFFECTIVE`
- Reason: The exact current report proves every relied-on bounded control claim.

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
| `coverage-scenario:01d578497ee5964233f79b03` | `verify:universe-33f79b03-expected`, `verify:universe-33f79b03-negative` | `verify:universe-33f79b03-expected`, `verify:universe-33f79b03-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-a7db5697eaf0071a961e`, `evidence:observed-proof-9041068c33ac34f23d6f`, `evidence:runtime-observed-proof-f3fc1574b8d38dac1b9f`, `evidence:observed-proof-5bc8f6e927f79c5c1c45` |
| `coverage-scenario:9b4a4ff97feb8d5006f53a6d` | `verify:universe-06f53a6d-expected`, `verify:universe-06f53a6d-negative` | `verify:universe-06f53a6d-expected`, `verify:universe-06f53a6d-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-62c209cdbef5f80301a0`, `evidence:observed-proof-1238a1aaa17bbbe2993c`, `evidence:runtime-observed-proof-0e78487fbf01eb6ae23d`, `evidence:observed-proof-8a219fe3dbde68666d9c` |
| `coverage-scenario:7f0e56b0e62657c56bce3aca` | `verify:universe-6bce3aca-expected`, `verify:universe-6bce3aca-negative` | `verify:universe-6bce3aca-expected`, `verify:universe-6bce3aca-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-90f522fb3f39bec9160b`, `evidence:observed-proof-3a2a1b29715729b136d9`, `evidence:runtime-observed-proof-8358cc1818e9096259d3`, `evidence:observed-proof-fc97f697b390c494e350` |
| `coverage-scenario:303aba3df26da849267360df` | `verify:universe-267360df-expected`, `verify:universe-267360df-negative` | `verify:universe-267360df-expected`, `verify:universe-267360df-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f44b30eac9a365210ad8`, `evidence:observed-proof-2b43d9a428490082613b`, `evidence:runtime-observed-proof-0ff12c3847670c22b7cc`, `evidence:observed-proof-e7294bc2373d0e4d9000` |
| `coverage-scenario:7498182880c709117e157cbe` | `verify:universe-7e157cbe-expected`, `verify:universe-7e157cbe-negative` | `verify:universe-7e157cbe-expected`, `verify:universe-7e157cbe-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d8c267998992894a7bde`, `evidence:observed-proof-021b518037ae396ab980`, `evidence:runtime-observed-proof-81a576981ce9d2dcc956`, `evidence:observed-proof-b9047194ba1104b7b57c` |
| `coverage-scenario:5696811b3d45e0a14c6a26a6` | `verify:universe-4c6a26a6-expected`, `verify:universe-4c6a26a6-negative` | `verify:universe-4c6a26a6-expected`, `verify:universe-4c6a26a6-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-511ebc38db56ebe97e1a`, `evidence:observed-proof-82c6c24455d77d20e0de`, `evidence:runtime-observed-proof-c091bdd7531ca8f7e40f`, `evidence:observed-proof-fb05f348a82dbd4c366e` |
| `coverage-scenario:c53e9fdd0c1684bdf256ee46` | `verify:universe-f256ee46-expected`, `verify:universe-f256ee46-negative` | `verify:universe-f256ee46-expected`, `verify:universe-f256ee46-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-e3b6e3fe3966197b692e`, `evidence:observed-proof-eba971b1105442e79b17`, `evidence:runtime-observed-proof-fa8a1cbbc5f3a1a862af`, `evidence:observed-proof-cba7323d4bc53dce3878` |
| `coverage-scenario:ecda09645d937df4ad616f84` | `verify:universe-ad616f84-expected`, `verify:universe-ad616f84-negative` | `verify:universe-ad616f84-expected`, `verify:universe-ad616f84-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-f79dbb28a193d88d075f`, `evidence:observed-proof-bf903960f7fd0068f8d7`, `evidence:runtime-observed-proof-0ace619d9174686a7338`, `evidence:observed-proof-fc99fc6fec7fdd2f6fb8` |
| `coverage-scenario:53bcc8749ab68010a8dfc71b` | `verify:universe-a8dfc71b-expected`, `verify:universe-a8dfc71b-negative` | `verify:universe-a8dfc71b-expected`, `verify:universe-a8dfc71b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-bcc025bbfdd6ab5f13aa`, `evidence:observed-proof-acec8182644ab931990d`, `evidence:runtime-observed-proof-72cafc3e8aa6bd85c7e5`, `evidence:observed-proof-fb1b68fc33a7866da7c7` |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `runtime:self-runtime-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-negative.log` | node scripts/verification-runtime-self-service.mjs negative | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` |  | `sha256:2decd2154843f9cc073ff588ebdea8463e8e670de46ac8f7cc19773d6b4b3fa6` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-runtime-positive` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-positive.log` | node scripts/verification-runtime-self-service.mjs positive | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` |  | `sha256:6ddfa1ce953e3428b2ea291499155f284c3f40cbe3b46f3ca42b2c2b60a0afd8` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-candidate-verification` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-candidate-verification.log` | npm run verify:pre-runtime | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` |  | `sha256:c426f825486299b686c1d6c08c21b08e5b0e2df6c3ea0d9a65485a513f264041` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-obligation-evidence` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr`, `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb`, `verify:test-coverage-regression-smoke-task-specific-verification-exists`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af`, `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-modularity-evidence` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:release-impact-release-smoke-check-release-rollback-monitoring-o`, `verify:universe-06f53a6d-expected`, `verify:universe-06f53a6d-negative`, `verify:universe-267360df-expected`, `verify:universe-267360df-negative`, `verify:universe-33f79b03-expected`, `verify:universe-33f79b03-negative`, `verify:universe-4c6a26a6-expected`, `verify:universe-4c6a26a6-negative`, `verify:universe-6bce3aca-expected`, `verify:universe-6bce3aca-negative`, `verify:universe-7e157cbe-expected`, `verify:universe-7e157cbe-negative`, `verify:universe-a8dfc71b-expected`, `verify:universe-a8dfc71b-negative`, `verify:universe-ad616f84-expected`, `verify:universe-ad616f84-negative`, `verify:universe-f256ee46-expected`, `verify:universe-f256ee46-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-runtime-behavior` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:41fc0b6618413bd0c425b723db8adc8c7daa0642c3393e3ea33d0cf1011bb06e` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `evidence:114-check-intentos-obligation-tests` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-33f79b03-expected`, `verify:universe-33f79b03-negative`, `verify:universe-06f53a6d-expected`, `verify:universe-06f53a6d-negative`, `verify:universe-6bce3aca-expected`, `verify:universe-6bce3aca-negative`, `verify:universe-267360df-expected`, `verify:universe-267360df-negative`, `verify:universe-7e157cbe-expected`, `verify:universe-7e157cbe-negative`, `verify:universe-4c6a26a6-expected`, `verify:universe-4c6a26a6-negative`, `verify:universe-f256ee46-expected`, `verify:universe-f256ee46-negative`, `verify:universe-ad616f84-expected`, `verify:universe-ad616f84-negative`, `verify:universe-a8dfc71b-expected`, `verify:universe-a8dfc71b-negative`, `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Local structural and fail-closed behavior proof only; no production or external release action was performed. |
| `evidence:runtime-observed-proof-ef29096077685f733f86` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 19. |
| `evidence:runtime-observed-proof-c778736e6d308a943f70` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 20. |
| `evidence:runtime-observed-proof-c2c6e6879609f2ec3a1b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr` | `sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 23. |
| `evidence:runtime-observed-proof-eb5d11d612f900880fb7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 24. |
| `evidence:runtime-observed-proof-5d4f305dfa6913ba1a4a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 25. |
| `evidence:runtime-observed-proof-eb0190248336072e134a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 26. |
| `evidence:runtime-observed-proof-a7db5697eaf0071a961e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-33f79b03-expected` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name foundation.mjs remains present at its exact unified-entry position; source line 1. |
| `evidence:runtime-observed-proof-f3fc1574b8d38dac1b9f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-33f79b03-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runFoundationChecks is rejected by the exact-order contract; source line 2. |
| `evidence:runtime-observed-proof-62c209cdbef5f80301a0` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-06f53a6d-expected` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name adoption.mjs remains present at its exact unified-entry position; source line 3. |
| `evidence:runtime-observed-proof-0e78487fbf01eb6ae23d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-06f53a6d-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runAdoptionChecks is rejected by the exact-order contract; source line 4. |
| `evidence:runtime-observed-proof-90f522fb3f39bec9160b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-6bce3aca-expected` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name evidence.mjs remains present at its exact unified-entry position; source line 5. |
| `evidence:runtime-observed-proof-8358cc1818e9096259d3` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-6bce3aca-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runEvidenceChecks is rejected by the exact-order contract; source line 6. |
| `evidence:runtime-observed-proof-f44b30eac9a365210ad8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-267360df-expected` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name architecture.mjs remains present at its exact unified-entry position; source line 7. |
| `evidence:runtime-observed-proof-0ff12c3847670c22b7cc` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-267360df-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runArchitectureChecks is rejected by the exact-order contract; source line 8. |
| `evidence:runtime-observed-proof-d8c267998992894a7bde` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-7e157cbe-expected` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name release.mjs remains present at its exact unified-entry position; source line 9. |
| `evidence:runtime-observed-proof-81a576981ce9d2dcc956` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-7e157cbe-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runReleaseChecks is rejected by the exact-order contract; source line 10. |
| `evidence:runtime-observed-proof-511ebc38db56ebe97e1a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-4c6a26a6-expected` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name distribution.mjs remains present at its exact unified-entry position; source line 11. |
| `evidence:runtime-observed-proof-c091bdd7531ca8f7e40f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-4c6a26a6-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runDistributionChecks is rejected by the exact-order contract; source line 12. |
| `evidence:runtime-observed-proof-e3b6e3fe3966197b692e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-f256ee46-expected` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name generated-project-e2e.mjs remains present at its exact unified-entry position; source line 13. |
| `evidence:runtime-observed-proof-fa8a1cbbc5f3a1a862af` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-f256ee46-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runGeneratedProjectE2ECheck is rejected by the exact-order contract; source line 14. |
| `evidence:runtime-observed-proof-f79dbb28a193d88d075f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-ad616f84-expected` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name shared runtime exposes the one fail-closed state consumed by the entry; source line 15. |
| `evidence:runtime-observed-proof-0ace619d9174686a7338` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-ad616f84-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name a recorded suite failure produces a non-zero shared exit decision; source line 16. |
| `evidence:runtime-observed-proof-bcc025bbfdd6ab5f13aa` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-a8dfc71b-expected` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name the complete unified candidate verification passed through all ordered suites; source line 17. |
| `evidence:runtime-observed-proof-72cafc3e8aa6bd85c7e5` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:universe-a8dfc71b-negative` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omission duplication and reordering all fail the unified order contract; source line 18. |
| `evidence:runtime-observed-proof-3fdfc5a04f9008940d01` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name candidate remains local and does not modify hosted release automation; source line 19. |
| `evidence:runtime-observed-proof-6d28cb9676930d90b259` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:41fc0b6618413bd0c425b723db8adc8c7daa0642c3393e3ea33d0cf1011bb06e` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1. |
| `evidence:runtime-observed-proof-4809c919dc7b48ea23f7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | TARGETED_SERVICE_IDENTITY | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:41fc0b6618413bd0c425b723db8adc8c7daa0642c3393e3ea33d0cf1011bb06e` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2. |
| `evidence:observed-proof-9041068c33ac34f23d6f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-33f79b03-expected` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name foundation.mjs remains present at its exact unified-entry position; source line 15. |
| `evidence:observed-proof-5bc8f6e927f79c5c1c45` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-33f79b03-negative` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runFoundationChecks is rejected by the exact-order contract; source line 16. |
| `evidence:observed-proof-1238a1aaa17bbbe2993c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-06f53a6d-expected` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name adoption.mjs remains present at its exact unified-entry position; source line 17. |
| `evidence:observed-proof-8a219fe3dbde68666d9c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-06f53a6d-negative` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runAdoptionChecks is rejected by the exact-order contract; source line 18. |
| `evidence:observed-proof-3a2a1b29715729b136d9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-6bce3aca-expected` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name evidence.mjs remains present at its exact unified-entry position; source line 19. |
| `evidence:observed-proof-fc97f697b390c494e350` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-6bce3aca-negative` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runEvidenceChecks is rejected by the exact-order contract; source line 20. |
| `evidence:observed-proof-2b43d9a428490082613b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-267360df-expected` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name architecture.mjs remains present at its exact unified-entry position; source line 21. |
| `evidence:observed-proof-e7294bc2373d0e4d9000` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-267360df-negative` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runArchitectureChecks is rejected by the exact-order contract; source line 22. |
| `evidence:observed-proof-021b518037ae396ab980` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-7e157cbe-expected` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name release.mjs remains present at its exact unified-entry position; source line 23. |
| `evidence:observed-proof-b9047194ba1104b7b57c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-7e157cbe-negative` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runReleaseChecks is rejected by the exact-order contract; source line 24. |
| `evidence:observed-proof-82c6c24455d77d20e0de` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-4c6a26a6-expected` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name distribution.mjs remains present at its exact unified-entry position; source line 25. |
| `evidence:observed-proof-fb05f348a82dbd4c366e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-4c6a26a6-negative` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runDistributionChecks is rejected by the exact-order contract; source line 26. |
| `evidence:observed-proof-eba971b1105442e79b17` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-f256ee46-expected` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name generated-project-e2e.mjs remains present at its exact unified-entry position; source line 27. |
| `evidence:observed-proof-cba7323d4bc53dce3878` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-f256ee46-negative` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runGeneratedProjectE2ECheck is rejected by the exact-order contract; source line 28. |
| `evidence:observed-proof-bf903960f7fd0068f8d7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-ad616f84-expected` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name shared runtime exposes the one fail-closed state consumed by the entry; source line 29. |
| `evidence:observed-proof-fc99fc6fec7fdd2f6fb8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-ad616f84-negative` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name a recorded suite failure produces a non-zero shared exit decision; source line 30. |
| `evidence:observed-proof-acec8182644ab931990d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-a8dfc71b-expected` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name the complete unified candidate verification passed through all ordered suites; source line 31. |
| `evidence:observed-proof-fb1b68fc33a7866da7c7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:universe-a8dfc71b-negative` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omission duplication and reordering all fail the unified order contract; source line 32. |
| `evidence:observed-proof-4ce38e6acbb39d3aef8e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/114-check-intentos-obligation-tests.log` | node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs | Codex local verification | LOCAL_CONTROLLED | `0` | `Yes` | `Yes` | `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3` | N/A | Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name candidate remains local and does not modify hosted release automation; source line 33. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:universe-33f79b03-expected` | `COVERED` | `evidence:runtime-observed-proof-a7db5697eaf0071a961e`, `evidence:observed-proof-9041068c33ac34f23d6f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-33f79b03-negative` | `COVERED` | `evidence:runtime-observed-proof-f3fc1574b8d38dac1b9f`, `evidence:observed-proof-5bc8f6e927f79c5c1c45` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-06f53a6d-expected` | `COVERED` | `evidence:runtime-observed-proof-62c209cdbef5f80301a0`, `evidence:observed-proof-1238a1aaa17bbbe2993c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-06f53a6d-negative` | `COVERED` | `evidence:runtime-observed-proof-0e78487fbf01eb6ae23d`, `evidence:observed-proof-8a219fe3dbde68666d9c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6bce3aca-expected` | `COVERED` | `evidence:runtime-observed-proof-90f522fb3f39bec9160b`, `evidence:observed-proof-3a2a1b29715729b136d9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6bce3aca-negative` | `COVERED` | `evidence:runtime-observed-proof-8358cc1818e9096259d3`, `evidence:observed-proof-fc97f697b390c494e350` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-267360df-expected` | `COVERED` | `evidence:runtime-observed-proof-f44b30eac9a365210ad8`, `evidence:observed-proof-2b43d9a428490082613b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-267360df-negative` | `COVERED` | `evidence:runtime-observed-proof-0ff12c3847670c22b7cc`, `evidence:observed-proof-e7294bc2373d0e4d9000` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7e157cbe-expected` | `COVERED` | `evidence:runtime-observed-proof-d8c267998992894a7bde`, `evidence:observed-proof-021b518037ae396ab980` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7e157cbe-negative` | `COVERED` | `evidence:runtime-observed-proof-81a576981ce9d2dcc956`, `evidence:observed-proof-b9047194ba1104b7b57c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4c6a26a6-expected` | `COVERED` | `evidence:runtime-observed-proof-511ebc38db56ebe97e1a`, `evidence:observed-proof-82c6c24455d77d20e0de` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4c6a26a6-negative` | `COVERED` | `evidence:runtime-observed-proof-c091bdd7531ca8f7e40f`, `evidence:observed-proof-fb05f348a82dbd4c366e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f256ee46-expected` | `COVERED` | `evidence:runtime-observed-proof-e3b6e3fe3966197b692e`, `evidence:observed-proof-eba971b1105442e79b17` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f256ee46-negative` | `COVERED` | `evidence:runtime-observed-proof-fa8a1cbbc5f3a1a862af`, `evidence:observed-proof-cba7323d4bc53dce3878` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ad616f84-expected` | `COVERED` | `evidence:runtime-observed-proof-f79dbb28a193d88d075f`, `evidence:observed-proof-bf903960f7fd0068f8d7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-ad616f84-negative` | `COVERED` | `evidence:runtime-observed-proof-0ace619d9174686a7338`, `evidence:observed-proof-fc99fc6fec7fdd2f6fb8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a8dfc71b-expected` | `COVERED` | `evidence:runtime-observed-proof-bcc025bbfdd6ab5f13aa`, `evidence:observed-proof-acec8182644ab931990d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a8dfc71b-negative` | `COVERED` | `evidence:runtime-observed-proof-72cafc3e8aa6bd85c7e5`, `evidence:observed-proof-fb1b68fc33a7866da7c7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:runtime-observed-proof-ef29096077685f733f86` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:runtime-observed-proof-c778736e6d308a943f70` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `COVERED` | `evidence:runtime-observed-proof-3fdfc5a04f9008940d01`, `evidence:observed-proof-4ce38e6acbb39d3aef8e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `COVERED` | `evidence:runtime-observed-proof-c2c6e6879609f2ec3a1b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `COVERED` | `evidence:runtime-observed-proof-6d28cb9676930d90b259`, `evidence:runtime-observed-proof-4809c919dc7b48ea23f7` | A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation. |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `COVERED` | `evidence:runtime-observed-proof-eb5d11d612f900880fb7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:runtime-observed-proof-5d4f305dfa6913ba1a4a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:runtime-observed-proof-eb0190248336072e134a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:generated-test-review-required` | `TEST_COVERAGE` | `SATISFIED` | `runtime:self-current-obligation-evidence`, `evidence:runtime-observed-proof-eb0190248336072e134a` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:runtime-observed-proof-eb0190248336072e134a` | Evidence is mapped to related Verification Plan obligations. |

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
  "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
  "intent": "make a local structural split of scripts/check-intentos.mjs into domain suites while preserving output order and exit status",
  "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9",
  "test_evidence_ref": "artifact:test-evidence-reports/114-check-intentos-modularity.md",
  "test_evidence_digest": "sha256:7586a5f7b420e13588ed07c1f3cc9d0a2a29ff22339b958c8c8a34594a67b715",
  "verification_plan_ref": "artifact:verification-plans/114-check-intentos-modularity.md",
  "verification_plan_digest": "sha256:82711125cbe3f6d40b4ef934e383c47bcf0eb77284f1c6dac6cf3229f517e48f",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/114-check-intentos-modularity.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:82711125cbe3f6d40b4ef934e383c47bcf0eb77284f1c6dac6cf3229f517e48f"
    },
    {
      "name": "business_rule_closure",
      "status": "RECORDED",
      "ref": "artifact:business-rule-closures/114-check-intentos-modularity.md",
      "source_outcome": "READY_FOR_IMPACT_COVERAGE",
      "digest": "sha256:c2a19b2a88ec88ff60e69ffa108a5f47e73677be9bcf8049094accb0c6bd44c3"
    },
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/preflight-114-check-intentos-modularity.md",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "digest": "sha256:17ca4ec824c2e74f7ab53c36826203ed4cb004d53a2566d15fd2edfd14fe5805"
    },
    {
      "name": "business_universe_coverage",
      "status": "RECORDED",
      "ref": "artifact:business-universe-coverage-reports/114-check-intentos-modularity.md",
      "source_outcome": "COVERAGE_READY",
      "digest": "sha256:3f37e20e2089089cf1a2757fe1be13a08d3297ca76c22b39ff92e8d95dc9a779"
    },
    {
      "name": "control_effectiveness",
      "status": "RECORDED",
      "ref": "artifact:control-effectiveness-reports/114-check-intentos-modularity.md",
      "source_outcome": "CONTROL_PROVEN_EFFECTIVE",
      "digest": "sha256:fdf02744c8a89600e03ad4308f3bfa934e1322369ec2806c65fb9268dae3750d"
    },
    {
      "name": "verification_run_manifest",
      "status": "RECORDED",
      "ref": "artifact:verification-run-manifests/114-check-intentos-modularity.md",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "digest": "sha256:fe3db04ab5b3c06961e3283edf83baa6339ff07b718a473f7640f3ed23a28209"
    }
  ],
  "runtime_trust_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "run_manifest_ref": "artifact:verification-run-manifests/114-check-intentos-modularity.md",
    "run_manifest_digest": "sha256:fe3db04ab5b3c06961e3283edf83baa6339ff07b718a473f7640f3ed23a28209",
    "run_id": "vrun-114-check-intentos-modularity-r5",
    "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
    "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9",
    "runtime_trust_level": "TARGETED_SERVICE_IDENTITY",
    "runtime_plan_ref": "artifact:verification-runtime-plans/114-check-intentos-modularity.md",
    "runtime_plan_digest": "sha256:70e35d4f3a43c1c4e8e903f004ef81bddd67d1a3e3e7c81c98a8a1a36caaacb6",
    "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/114-check-intentos-modularity.md",
    "lifecycle_plan_digest": "sha256:e052ba735dc42dcd5542568dc7540f6abbaa64f477d5ab982f3abe65f04e0b02",
    "verification_plan_ref": "artifact:verification-plans/114-check-intentos-modularity.md",
    "verification_plan_digest": "sha256:82711125cbe3f6d40b4ef934e383c47bcf0eb77284f1c6dac6cf3229f517e48f",
    "current_project_match": "Yes",
    "current_task_match": "Yes",
    "current_intent_match": "Yes",
    "current_verification_plan_match": "Yes",
    "checker": "scripts/check-verification-run-manifest.mjs --require-complete",
    "reason": "The exact current run passed the authoritative checker and consumer identity checks."
  },
  "control_effectiveness_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "report_ref": "artifact:control-effectiveness-reports/114-check-intentos-modularity.md",
    "report_digest": "sha256:fdf02744c8a89600e03ad4308f3bfa934e1322369ec2806c65fb9268dae3750d",
    "required_claim_ids": [
      "claim:package-script-verify-candidate",
      "claim:package-script-verify-consumer-chain-candidate",
      "claim:file-scripts-check-adoption-assurance-mjs",
      "claim:file-scripts-check-ai-workflow-mjs",
      "claim:file-scripts-check-apply-execution-receipt-mjs",
      "claim:file-scripts-check-apply-plan-mjs",
      "claim:file-scripts-check-approval-record-mjs",
      "claim:file-scripts-check-baseline-enforcement-mjs"
    ],
    "assessment_outcome": "CONTROL_PROVEN_EFFECTIVE",
    "current_project_match": "Yes",
    "current_task_match": "Yes",
    "current_intent_match": "Yes",
    "checker": "scripts/check-control-effectiveness.mjs --require-effective",
    "reason": "The exact current report proves every relied-on bounded control claim."
  },
  "authority_binding": {
    "binding_version": "1.91.0",
    "project": {
      "kind": "GIT",
      "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
      "revision": "sha256:816381d68be80abd210ab1cc364c3c0317a666ad197e6061bce1bfe176307175"
    },
    "task": {
      "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
      "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9"
    },
    "sources": [
      {
        "ref": "artifact:verification-plans/114-check-intentos-modularity.md",
        "relative_path": "verification-plans/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:d3079dbcf49977b17d733bacac12a2bb40dc9bd004b7ac2e54f49e0a2b34cd8b"
      },
      {
        "ref": "artifact:business-rule-closures/114-check-intentos-modularity.md",
        "relative_path": "business-rule-closures/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:fcf7f6128cb67c248e4f9fa5e29ceb88c6646fdb823b8af17072f366ea12123d"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/preflight-114-check-intentos-modularity.md",
        "relative_path": "change-impact-coverage-reports/preflight-114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:6221a9a2b68f72f2a9fff0721337c107afc7ae277a839ac8926d4103e6a59cb2"
      },
      {
        "ref": "artifact:business-universe-coverage-reports/114-check-intentos-modularity.md",
        "relative_path": "business-universe-coverage-reports/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:daac118a7b255bbe39bdfbd1f42d98b769f9521c9236be9a4afd84a4b6526afd"
      },
      {
        "ref": "artifact:control-effectiveness-reports/114-check-intentos-modularity.md",
        "relative_path": "control-effectiveness-reports/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:614aaf468169598964d53992f85425f08d3d6e60ca0f718552b96c63d19b1a7a"
      },
      {
        "ref": "artifact:verification-run-manifests/114-check-intentos-modularity.md",
        "relative_path": "verification-run-manifests/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:03f79d1c7d22f7a83632334e79d9e4a93e514b9c66ab86e73900b12d44a450e7"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:2decd2154843f9cc073ff588ebdea8463e8e670de46ac8f7cc19773d6b4b3fa6"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:6ddfa1ce953e3428b2ea291499155f284c3f40cbe3b46f3ca42b2c2b60a0afd8"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:c426f825486299b686c1d6c08c21b08e5b0e2df6c3ea0d9a65485a513f264041"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
        "raw_file_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:41fc0b6618413bd0c425b723db8adc8c7daa0642c3393e3ea33d0cf1011bb06e"
      },
      {
        "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
        "relative_path": "evidence/114-check-intentos-obligation-tests.log",
        "raw_file_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "runtime:self-runtime-negative",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-negative.log",
      "command": "node scripts/verification-runtime-self-service.mjs negative",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:41:54.036Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:2decd2154843f9cc073ff588ebdea8463e8e670de46ac8f7cc19773d6b4b3fa6",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-runtime-positive",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-runtime-positive.log",
      "command": "node scripts/verification-runtime-self-service.mjs positive",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:41:54.077Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:6ddfa1ce953e3428b2ea291499155f284c3f40cbe3b46f3ca42b2c2b60a0afd8",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-candidate-verification",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-candidate-verification.log",
      "command": "npm run verify:pre-runtime",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:13.473Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:c426f825486299b686c1d6c08c21b08e5b0e2df6c3ea0d9a65485a513f264041",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-obligation-evidence",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.297Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-modularity-evidence",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
        "verify:universe-06f53a6d-expected",
        "verify:universe-06f53a6d-negative",
        "verify:universe-267360df-expected",
        "verify:universe-267360df-negative",
        "verify:universe-33f79b03-expected",
        "verify:universe-33f79b03-negative",
        "verify:universe-4c6a26a6-expected",
        "verify:universe-4c6a26a6-negative",
        "verify:universe-6bce3aca-expected",
        "verify:universe-6bce3aca-negative",
        "verify:universe-7e157cbe-expected",
        "verify:universe-7e157cbe-negative",
        "verify:universe-a8dfc71b-expected",
        "verify:universe-a8dfc71b-negative",
        "verify:universe-ad616f84-expected",
        "verify:universe-ad616f84-negative",
        "verify:universe-f256ee46-expected",
        "verify:universe-f256ee46-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-runtime-behavior",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.542Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:41fc0b6618413bd0c425b723db8adc8c7daa0642c3393e3ea33d0cf1011bb06e",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "evidence:114-check-intentos-obligation-tests",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-33f79b03-expected",
        "verify:universe-33f79b03-negative",
        "verify:universe-06f53a6d-expected",
        "verify:universe-06f53a6d-negative",
        "verify:universe-6bce3aca-expected",
        "verify:universe-6bce3aca-negative",
        "verify:universe-267360df-expected",
        "verify:universe-267360df-negative",
        "verify:universe-7e157cbe-expected",
        "verify:universe-7e157cbe-negative",
        "verify:universe-4c6a26a6-expected",
        "verify:universe-4c6a26a6-negative",
        "verify:universe-f256ee46-expected",
        "verify:universe-f256ee46-negative",
        "verify:universe-ad616f84-expected",
        "verify:universe-ad616f84-negative",
        "verify:universe-a8dfc71b-expected",
        "verify:universe-a8dfc71b-negative",
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Local structural and fail-closed behavior proof only; no production or external release action was performed."
    },
    {
      "id": "evidence:runtime-observed-proof-ef29096077685f733f86",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.297Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 19."
    },
    {
      "id": "evidence:runtime-observed-proof-c778736e6d308a943f70",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.297Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 20."
    },
    {
      "id": "evidence:runtime-observed-proof-c2c6e6879609f2ec3a1b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.297Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
      ],
      "output_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 23."
    },
    {
      "id": "evidence:runtime-observed-proof-eb5d11d612f900880fb7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.297Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb"
      ],
      "output_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 24."
    },
    {
      "id": "evidence:runtime-observed-proof-5d4f305dfa6913ba1a4a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.297Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 25."
    },
    {
      "id": "evidence:runtime-observed-proof-eb0190248336072e134a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.297Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:cdf585c77280de344fc93df6f1821cc686166e7e71abe5206405f05098404973",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 26."
    },
    {
      "id": "evidence:runtime-observed-proof-a7db5697eaf0071a961e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-33f79b03-expected"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name foundation.mjs remains present at its exact unified-entry position; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-f3fc1574b8d38dac1b9f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-33f79b03-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runFoundationChecks is rejected by the exact-order contract; source line 2."
    },
    {
      "id": "evidence:runtime-observed-proof-62c209cdbef5f80301a0",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-06f53a6d-expected"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name adoption.mjs remains present at its exact unified-entry position; source line 3."
    },
    {
      "id": "evidence:runtime-observed-proof-0e78487fbf01eb6ae23d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-06f53a6d-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runAdoptionChecks is rejected by the exact-order contract; source line 4."
    },
    {
      "id": "evidence:runtime-observed-proof-90f522fb3f39bec9160b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6bce3aca-expected"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name evidence.mjs remains present at its exact unified-entry position; source line 5."
    },
    {
      "id": "evidence:runtime-observed-proof-8358cc1818e9096259d3",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6bce3aca-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runEvidenceChecks is rejected by the exact-order contract; source line 6."
    },
    {
      "id": "evidence:runtime-observed-proof-f44b30eac9a365210ad8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-267360df-expected"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name architecture.mjs remains present at its exact unified-entry position; source line 7."
    },
    {
      "id": "evidence:runtime-observed-proof-0ff12c3847670c22b7cc",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-267360df-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runArchitectureChecks is rejected by the exact-order contract; source line 8."
    },
    {
      "id": "evidence:runtime-observed-proof-d8c267998992894a7bde",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7e157cbe-expected"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name release.mjs remains present at its exact unified-entry position; source line 9."
    },
    {
      "id": "evidence:runtime-observed-proof-81a576981ce9d2dcc956",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7e157cbe-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runReleaseChecks is rejected by the exact-order contract; source line 10."
    },
    {
      "id": "evidence:runtime-observed-proof-511ebc38db56ebe97e1a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4c6a26a6-expected"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name distribution.mjs remains present at its exact unified-entry position; source line 11."
    },
    {
      "id": "evidence:runtime-observed-proof-c091bdd7531ca8f7e40f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4c6a26a6-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runDistributionChecks is rejected by the exact-order contract; source line 12."
    },
    {
      "id": "evidence:runtime-observed-proof-e3b6e3fe3966197b692e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f256ee46-expected"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name generated-project-e2e.mjs remains present at its exact unified-entry position; source line 13."
    },
    {
      "id": "evidence:runtime-observed-proof-fa8a1cbbc5f3a1a862af",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f256ee46-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runGeneratedProjectE2ECheck is rejected by the exact-order contract; source line 14."
    },
    {
      "id": "evidence:runtime-observed-proof-f79dbb28a193d88d075f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ad616f84-expected"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name shared runtime exposes the one fail-closed state consumed by the entry; source line 15."
    },
    {
      "id": "evidence:runtime-observed-proof-0ace619d9174686a7338",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ad616f84-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name a recorded suite failure produces a non-zero shared exit decision; source line 16."
    },
    {
      "id": "evidence:runtime-observed-proof-bcc025bbfdd6ab5f13aa",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a8dfc71b-expected"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name the complete unified candidate verification passed through all ordered suites; source line 17."
    },
    {
      "id": "evidence:runtime-observed-proof-72cafc3e8aa6bd85c7e5",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a8dfc71b-negative"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omission duplication and reordering all fail the unified order contract; source line 18."
    },
    {
      "id": "evidence:runtime-observed-proof-3fdfc5a04f9008940d01",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-modularity-evidence.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.459Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o"
      ],
      "output_digest": "sha256:a0fc88b79d73a2893158679d19d5960e7cf2d666761cc2aac41a0049efa2f7a8",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name candidate remains local and does not modify hosted release automation; source line 19."
    },
    {
      "id": "evidence:runtime-observed-proof-6d28cb9676930d90b259",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.542Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:41fc0b6618413bd0c425b723db8adc8c7daa0642c3393e3ea33d0cf1011bb06e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-4809c919dc7b48ea23f7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-114-check-intentos-modularity-r5/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "TARGETED_SERVICE_IDENTITY",
      "ran_at": "2026-07-22T16:50:14.542Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:41fc0b6618413bd0c425b723db8adc8c7daa0642c3393e3ea33d0cf1011bb06e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2."
    },
    {
      "id": "evidence:observed-proof-9041068c33ac34f23d6f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-33f79b03-expected"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name foundation.mjs remains present at its exact unified-entry position; source line 15."
    },
    {
      "id": "evidence:observed-proof-5bc8f6e927f79c5c1c45",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-33f79b03-negative"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runFoundationChecks is rejected by the exact-order contract; source line 16."
    },
    {
      "id": "evidence:observed-proof-1238a1aaa17bbbe2993c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-06f53a6d-expected"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name adoption.mjs remains present at its exact unified-entry position; source line 17."
    },
    {
      "id": "evidence:observed-proof-8a219fe3dbde68666d9c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-06f53a6d-negative"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runAdoptionChecks is rejected by the exact-order contract; source line 18."
    },
    {
      "id": "evidence:observed-proof-3a2a1b29715729b136d9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6bce3aca-expected"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name evidence.mjs remains present at its exact unified-entry position; source line 19."
    },
    {
      "id": "evidence:observed-proof-fc97f697b390c494e350",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6bce3aca-negative"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runEvidenceChecks is rejected by the exact-order contract; source line 20."
    },
    {
      "id": "evidence:observed-proof-2b43d9a428490082613b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-267360df-expected"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name architecture.mjs remains present at its exact unified-entry position; source line 21."
    },
    {
      "id": "evidence:observed-proof-e7294bc2373d0e4d9000",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-267360df-negative"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runArchitectureChecks is rejected by the exact-order contract; source line 22."
    },
    {
      "id": "evidence:observed-proof-021b518037ae396ab980",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7e157cbe-expected"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name release.mjs remains present at its exact unified-entry position; source line 23."
    },
    {
      "id": "evidence:observed-proof-b9047194ba1104b7b57c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7e157cbe-negative"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runReleaseChecks is rejected by the exact-order contract; source line 24."
    },
    {
      "id": "evidence:observed-proof-82c6c24455d77d20e0de",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4c6a26a6-expected"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name distribution.mjs remains present at its exact unified-entry position; source line 25."
    },
    {
      "id": "evidence:observed-proof-fb05f348a82dbd4c366e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4c6a26a6-negative"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runDistributionChecks is rejected by the exact-order contract; source line 26."
    },
    {
      "id": "evidence:observed-proof-eba971b1105442e79b17",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f256ee46-expected"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name generated-project-e2e.mjs remains present at its exact unified-entry position; source line 27."
    },
    {
      "id": "evidence:observed-proof-cba7323d4bc53dce3878",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f256ee46-negative"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omitting runGeneratedProjectE2ECheck is rejected by the exact-order contract; source line 28."
    },
    {
      "id": "evidence:observed-proof-bf903960f7fd0068f8d7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ad616f84-expected"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name shared runtime exposes the one fail-closed state consumed by the entry; source line 29."
    },
    {
      "id": "evidence:observed-proof-fc99fc6fec7fdd2f6fb8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-ad616f84-negative"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name a recorded suite failure produces a non-zero shared exit decision; source line 30."
    },
    {
      "id": "evidence:observed-proof-acec8182644ab931990d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a8dfc71b-expected"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name the complete unified candidate verification passed through all ordered suites; source line 31."
    },
    {
      "id": "evidence:observed-proof-fb1b68fc33a7866da7c7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a8dfc71b-negative"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name omission duplication and reordering all fail the unified order contract; source line 32."
    },
    {
      "id": "evidence:observed-proof-4ce38e6acbb39d3aef8e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/114-check-intentos-obligation-tests.log",
      "command": "node --test --test-concurrency=1 evidence/114-check-intentos-obligation-evidence.test.mjs",
      "owner": "Codex local verification",
      "environment": "LOCAL_CONTROLLED",
      "ran_at": "2026-07-22T15:09:19.955Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o"
      ],
      "output_digest": "sha256:9a831121b422b6b6b5ad1173c941ababbb2b70457acb85c85330be0b66132ef3",
      "failure_reason": "N/A",
      "limitations": "Observed test target evidence/114-check-intentos-obligation-evidence.test.mjs; test name candidate remains local and does not modify hosted release automation; source line 33."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:universe-33f79b03-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a7db5697eaf0071a961e",
        "evidence:observed-proof-9041068c33ac34f23d6f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-33f79b03-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f3fc1574b8d38dac1b9f",
        "evidence:observed-proof-5bc8f6e927f79c5c1c45"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-06f53a6d-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-62c209cdbef5f80301a0",
        "evidence:observed-proof-1238a1aaa17bbbe2993c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-06f53a6d-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0e78487fbf01eb6ae23d",
        "evidence:observed-proof-8a219fe3dbde68666d9c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6bce3aca-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-90f522fb3f39bec9160b",
        "evidence:observed-proof-3a2a1b29715729b136d9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6bce3aca-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8358cc1818e9096259d3",
        "evidence:observed-proof-fc97f697b390c494e350"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-267360df-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f44b30eac9a365210ad8",
        "evidence:observed-proof-2b43d9a428490082613b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-267360df-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0ff12c3847670c22b7cc",
        "evidence:observed-proof-e7294bc2373d0e4d9000"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7e157cbe-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d8c267998992894a7bde",
        "evidence:observed-proof-021b518037ae396ab980"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7e157cbe-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-81a576981ce9d2dcc956",
        "evidence:observed-proof-b9047194ba1104b7b57c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4c6a26a6-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-511ebc38db56ebe97e1a",
        "evidence:observed-proof-82c6c24455d77d20e0de"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4c6a26a6-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c091bdd7531ca8f7e40f",
        "evidence:observed-proof-fb05f348a82dbd4c366e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f256ee46-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e3b6e3fe3966197b692e",
        "evidence:observed-proof-eba971b1105442e79b17"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f256ee46-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fa8a1cbbc5f3a1a862af",
        "evidence:observed-proof-cba7323d4bc53dce3878"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ad616f84-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f79dbb28a193d88d075f",
        "evidence:observed-proof-bf903960f7fd0068f8d7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-ad616f84-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0ace619d9174686a7338",
        "evidence:observed-proof-fc99fc6fec7fdd2f6fb8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a8dfc71b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-bcc025bbfdd6ab5f13aa",
        "evidence:observed-proof-acec8182644ab931990d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a8dfc71b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-72cafc3e8aa6bd85c7e5",
        "evidence:observed-proof-fb1b68fc33a7866da7c7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ef29096077685f733f86"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c778736e6d308a943f70"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3fdfc5a04f9008940d01",
        "evidence:observed-proof-4ce38e6acbb39d3aef8e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:background-work-integration-contract-check-scheduled-queued-retr",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-c2c6e6879609f2ec3a1b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6d28cb9676930d90b259",
        "evidence:runtime-observed-proof-4809c919dc7b48ea23f7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation."
    },
    {
      "obligation_id": "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-eb5d11d612f900880fb7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5d4f305dfa6913ba1a4a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-eb0190248336072e134a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    }
  ],
  "business_universe_binding": {
    "required": "Yes",
    "routing_result": "REQUIRED_WITH_EVIDENCE",
    "business_universe_ref": "artifact:business-universe-coverage-reports/114-check-intentos-modularity.md",
    "business_universe_digest": "sha256:3f37e20e2089089cf1a2757fe1be13a08d3297ca76c22b39ff92e8d95dc9a779",
    "business_universe_state": "COVERAGE_READY",
    "coverage_scenario_ids": [
      "coverage-scenario:01d578497ee5964233f79b03",
      "coverage-scenario:9b4a4ff97feb8d5006f53a6d",
      "coverage-scenario:7f0e56b0e62657c56bce3aca",
      "coverage-scenario:303aba3df26da849267360df",
      "coverage-scenario:7498182880c709117e157cbe",
      "coverage-scenario:5696811b3d45e0a14c6a26a6",
      "coverage-scenario:c53e9fdd0c1684bdf256ee46",
      "coverage-scenario:ecda09645d937df4ad616f84",
      "coverage-scenario:53bcc8749ab68010a8dfc71b"
    ],
    "coverage_mapping_status": "COMPLETE"
  },
  "scenario_coverage_map": [
    {
      "coverage_scenario_id": "coverage-scenario:01d578497ee5964233f79b03",
      "required_obligation_ids": [
        "verify:universe-33f79b03-expected",
        "verify:universe-33f79b03-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-33f79b03-expected",
        "verify:universe-33f79b03-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a7db5697eaf0071a961e",
        "evidence:observed-proof-9041068c33ac34f23d6f",
        "evidence:runtime-observed-proof-f3fc1574b8d38dac1b9f",
        "evidence:observed-proof-5bc8f6e927f79c5c1c45"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:9b4a4ff97feb8d5006f53a6d",
      "required_obligation_ids": [
        "verify:universe-06f53a6d-expected",
        "verify:universe-06f53a6d-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-06f53a6d-expected",
        "verify:universe-06f53a6d-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-62c209cdbef5f80301a0",
        "evidence:observed-proof-1238a1aaa17bbbe2993c",
        "evidence:runtime-observed-proof-0e78487fbf01eb6ae23d",
        "evidence:observed-proof-8a219fe3dbde68666d9c"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:7f0e56b0e62657c56bce3aca",
      "required_obligation_ids": [
        "verify:universe-6bce3aca-expected",
        "verify:universe-6bce3aca-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-6bce3aca-expected",
        "verify:universe-6bce3aca-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-90f522fb3f39bec9160b",
        "evidence:observed-proof-3a2a1b29715729b136d9",
        "evidence:runtime-observed-proof-8358cc1818e9096259d3",
        "evidence:observed-proof-fc97f697b390c494e350"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:303aba3df26da849267360df",
      "required_obligation_ids": [
        "verify:universe-267360df-expected",
        "verify:universe-267360df-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-267360df-expected",
        "verify:universe-267360df-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f44b30eac9a365210ad8",
        "evidence:observed-proof-2b43d9a428490082613b",
        "evidence:runtime-observed-proof-0ff12c3847670c22b7cc",
        "evidence:observed-proof-e7294bc2373d0e4d9000"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:7498182880c709117e157cbe",
      "required_obligation_ids": [
        "verify:universe-7e157cbe-expected",
        "verify:universe-7e157cbe-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-7e157cbe-expected",
        "verify:universe-7e157cbe-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d8c267998992894a7bde",
        "evidence:observed-proof-021b518037ae396ab980",
        "evidence:runtime-observed-proof-81a576981ce9d2dcc956",
        "evidence:observed-proof-b9047194ba1104b7b57c"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:5696811b3d45e0a14c6a26a6",
      "required_obligation_ids": [
        "verify:universe-4c6a26a6-expected",
        "verify:universe-4c6a26a6-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-4c6a26a6-expected",
        "verify:universe-4c6a26a6-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-511ebc38db56ebe97e1a",
        "evidence:observed-proof-82c6c24455d77d20e0de",
        "evidence:runtime-observed-proof-c091bdd7531ca8f7e40f",
        "evidence:observed-proof-fb05f348a82dbd4c366e"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:c53e9fdd0c1684bdf256ee46",
      "required_obligation_ids": [
        "verify:universe-f256ee46-expected",
        "verify:universe-f256ee46-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-f256ee46-expected",
        "verify:universe-f256ee46-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e3b6e3fe3966197b692e",
        "evidence:observed-proof-eba971b1105442e79b17",
        "evidence:runtime-observed-proof-fa8a1cbbc5f3a1a862af",
        "evidence:observed-proof-cba7323d4bc53dce3878"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ecda09645d937df4ad616f84",
      "required_obligation_ids": [
        "verify:universe-ad616f84-expected",
        "verify:universe-ad616f84-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-ad616f84-expected",
        "verify:universe-ad616f84-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f79dbb28a193d88d075f",
        "evidence:observed-proof-bf903960f7fd0068f8d7",
        "evidence:runtime-observed-proof-0ace619d9174686a7338",
        "evidence:observed-proof-fc99fc6fec7fdd2f6fb8"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:53bcc8749ab68010a8dfc71b",
      "required_obligation_ids": [
        "verify:universe-a8dfc71b-expected",
        "verify:universe-a8dfc71b-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-a8dfc71b-expected",
        "verify:universe-a8dfc71b-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-bcc025bbfdd6ab5f13aa",
        "evidence:observed-proof-acec8182644ab931990d",
        "evidence:runtime-observed-proof-72cafc3e8aa6bd85c7e5",
        "evidence:observed-proof-fb1b68fc33a7866da7c7"
      ]
    }
  ],
  "test_quality_controls": [
    {
      "id": "control:generated-test-review-required",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "runtime:self-current-obligation-evidence",
        "evidence:runtime-observed-proof-eb0190248336072e134a"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-eb0190248336072e134a"
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
