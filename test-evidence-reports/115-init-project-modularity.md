# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 26/26 required obligations covered by 33 evidence item(s).

## User Request

- Request: modularize scripts/init-project.mjs into focused internal modules while preserving CLI arguments, output, plan and receipt formats, mutation ordering, rollback behavior, and exit codes
- Task ref: `task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/115-init-project-modularity.md` | `VERIFICATION_PLAN_READY` | `sha256:0fce1a7acacd420fe207617a33d2b2b5a6eb409e5d18fc180ea786c1e4716e5d` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/115-init-project-modularity.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:ecd8231f572d0c14ae11e29c1c1e84830c1f35b8d504013d17ec0b49501480fc` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | `CHANGE_IMPACT_RECORDED` | `sha256:f2ef5bb6f318c90b83e3a53899fcb6cab1ba61a885e563aadaaea191e970fc29` |
| `business_universe_coverage` | `RECORDED` | `business-universe-coverage-reports/115-init-project-modularity.md` | `COVERAGE_READY` | `sha256:9b6b440a74d414e59be7f4755ef84f0adc7bd6746a0cf23313a346c88f00af86` |
| `control_effectiveness` | `RECORDED` | `artifact:control-effectiveness-reports/115-init-project-modularity.md` | `CONTROL_PROVEN_EFFECTIVE` | `sha256:0bc352601aee287a2ca7bda78436af8fad6b1aab1422dfab2f7e3630671f9081` |
| `verification_run_manifest` | `RECORDED` | `artifact:verification-run-manifests/115-init-project-modularity.md` | `RUNTIME_TRUST_COMPLETE` | `sha256:d9cfb812a4f464c6c72f2fc5f6f2a91c7d0cc11998cf0dbbb119281f19be6a98` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/115-init-project-modularity.md`
- Test evidence digest: `sha256:3a2beaa81ca12793e45d8aaf606c22dca0b9a1ad58222607c86af7976618af12`
- Verification plan ref: `artifact:verification-plans/115-init-project-modularity.md`
- Verification plan digest: `sha256:0fce1a7acacd420fe207617a33d2b2b5a6eb409e5d18fc180ea786c1e4716e5d`
- Intent digest: `sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435`

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
| Run Manifest | `artifact:verification-run-manifests/115-init-project-modularity.md` |
| Run ID | `vrun-115-init-project-modularity-r2` |
| Task Ref | `task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e` |
| Intent Digest | `sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435` |
| Runtime Trust Level | `ISOLATED_RUNTIME` |
| Current Project Match | `Yes` |
| Current Task Match | `Yes` |
| Current Intent Match | `Yes` |
| Current Verification Plan Match | `Yes` |
| Reason | The exact current run passed the authoritative checker and consumer identity checks. |

## Control Effectiveness Binding

- Requirement: `REQUIRED`
- Status: `VERIFIED`
- Report: `artifact:control-effectiveness-reports/115-init-project-modularity.md`
- Report digest: `sha256:0bc352601aee287a2ca7bda78436af8fad6b1aab1422dfab2f7e3630671f9081`
- Required claims: `claim:package-script-verify-candidate`, `claim:package-script-verify-consumer-chain-candidate`, `claim:package-script-verify-planning-closure`, `claim:file-scripts-check-adoption-assurance-mjs`, `claim:file-scripts-check-ai-workflow-mjs`, `claim:file-scripts-check-apply-execution-receipt-mjs`, `claim:file-scripts-check-apply-plan-mjs`, `claim:file-scripts-check-approval-record-mjs`
- Assessment outcome: `CONTROL_PROVEN_EFFECTIVE`
- Reason: The exact current report proves every relied-on bounded control claim.

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
| `coverage-scenario:8436e1d4a9c2ab91a6e545d4` | `verify:universe-a6e545d4-expected`, `verify:universe-a6e545d4-negative` | `verify:universe-a6e545d4-expected`, `verify:universe-a6e545d4-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-0fd888a0cf8a233c7856`, `evidence:runtime-observed-proof-e3c5ef138a2ff11e95b8` |
| `coverage-scenario:6b8a64e0ae567bd533f16b20` | `verify:universe-33f16b20-expected`, `verify:universe-33f16b20-negative` | `verify:universe-33f16b20-expected`, `verify:universe-33f16b20-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-0f82f9e19596601cbebd`, `evidence:runtime-observed-proof-0b729e914227c927576d` |
| `coverage-scenario:29c41b694e2a25b5fb5f6fb1` | `verify:universe-fb5f6fb1-expected`, `verify:universe-fb5f6fb1-negative` | `verify:universe-fb5f6fb1-expected`, `verify:universe-fb5f6fb1-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-46cad4beb44775e715c8`, `evidence:runtime-observed-proof-92dbc91ca4a7ebdb0219` |
| `coverage-scenario:53e237fc9cea90ed61e14285` | `verify:universe-61e14285-expected`, `verify:universe-61e14285-negative` | `verify:universe-61e14285-expected`, `verify:universe-61e14285-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-29cf7de440d25d0cf872`, `evidence:runtime-observed-proof-f2ecf656a89c5c65a902` |
| `coverage-scenario:573d43f84fcad189e1e69a79` | `verify:universe-e1e69a79-expected`, `verify:universe-e1e69a79-negative` | `verify:universe-e1e69a79-expected`, `verify:universe-e1e69a79-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-965b6a4b66549bedf143`, `evidence:runtime-observed-proof-4c226671c7eacf021d3d` |
| `coverage-scenario:dca2a70d980c86f4a11c3ecc` | `verify:universe-a11c3ecc-expected`, `verify:universe-a11c3ecc-negative` | `verify:universe-a11c3ecc-expected`, `verify:universe-a11c3ecc-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-cc13aa9b68ae8366a686`, `evidence:runtime-observed-proof-25a2bb68f1cca278ab3f` |
| `coverage-scenario:63fcddf585d8dd27f3a2b88d` | `verify:universe-f3a2b88d-expected`, `verify:universe-f3a2b88d-negative` | `verify:universe-f3a2b88d-expected`, `verify:universe-f3a2b88d-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-cf7d3030396fd3f6cb47`, `evidence:runtime-observed-proof-76dabf6eb3a56e57158a` |
| `coverage-scenario:6330c97be1602986d653660b` | `verify:universe-d653660b-expected`, `verify:universe-d653660b-negative` | `verify:universe-d653660b-expected`, `verify:universe-d653660b-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-d6bd5267ad5ae38f7394`, `evidence:runtime-observed-proof-d36fc11b1688764346ac` |
| `coverage-scenario:d93095e30021697e7b2145c0` | `verify:universe-7b2145c0-expected`, `verify:universe-7b2145c0-negative` | `verify:universe-7b2145c0-expected`, `verify:universe-7b2145c0-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8f4af531a21990cb91ef`, `evidence:runtime-observed-proof-153d136cf5e56ca933c5` |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `runtime:self-runtime-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-negative.log` | node scripts/verification-runtime-self-service.mjs negative | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:a099966029e36f4108484546547520c281388cfc568dc4d14952164c03f8d82e` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-runtime-positive` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-positive.log` | node scripts/verification-runtime-self-service.mjs positive | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:410a14bdbc01735839ed40cc6361e8511df136fea1cbd21dfd5b7be1e951217a` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-candidate-verification` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-candidate-verification.log` | npm run verify:pre-runtime | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:3ee2fba6a083bd4d81892d544c6e4003bc7d00de9deff5a97a95131ae55a665b` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-obligation-evidence` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:release-impact-release-smoke-check-release-rollback-monitoring-o`, `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb`, `verify:test-coverage-regression-smoke-task-specific-verification-exists`, `verify:universe-33f16b20-expected`, `verify:universe-33f16b20-negative`, `verify:universe-61e14285-expected`, `verify:universe-61e14285-negative`, `verify:universe-7b2145c0-expected`, `verify:universe-7b2145c0-negative`, `verify:universe-a11c3ecc-expected`, `verify:universe-a11c3ecc-negative`, `verify:universe-a6e545d4-expected`, `verify:universe-a6e545d4-negative`, `verify:universe-d653660b-expected`, `verify:universe-d653660b-negative`, `verify:universe-e1e69a79-expected`, `verify:universe-e1e69a79-negative`, `verify:universe-f3a2b88d-expected`, `verify:universe-f3a2b88d-negative`, `verify:universe-fb5f6fb1-expected`, `verify:universe-fb5f6fb1-negative`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af`, `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-runtime-behavior` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:cbc76d1012a49ec7b120f8c9bea9b457c33a383a6a99f32192077a78bd00ab50` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `evidence:115-work-queue-transition` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/115-work-queue-transition-tests.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS local verification | local isolated Node process | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr` | `sha256:151da6e46507fe6cee679f171842617ff5ddb8e6db2cd965816c64b8f2c83f6c` | N/A | Bounded to the current staged Work Queue transition candidate; no external or production effect. |
| `evidence:runtime-observed-proof-0fd888a0cf8a233c7856` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a6e545d4-expected` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 1. |
| `evidence:runtime-observed-proof-e3c5ef138a2ff11e95b8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a6e545d4-negative` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 2. |
| `evidence:runtime-observed-proof-0f82f9e19596601cbebd` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-33f16b20-expected` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 3. |
| `evidence:runtime-observed-proof-0b729e914227c927576d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-33f16b20-negative` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 4. |
| `evidence:runtime-observed-proof-46cad4beb44775e715c8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-fb5f6fb1-expected` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 5. |
| `evidence:runtime-observed-proof-92dbc91ca4a7ebdb0219` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-fb5f6fb1-negative` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 6. |
| `evidence:runtime-observed-proof-29cf7de440d25d0cf872` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-61e14285-expected` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 7. |
| `evidence:runtime-observed-proof-f2ecf656a89c5c65a902` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-61e14285-negative` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 8. |
| `evidence:runtime-observed-proof-965b6a4b66549bedf143` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-e1e69a79-expected` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 9. |
| `evidence:runtime-observed-proof-4c226671c7eacf021d3d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-e1e69a79-negative` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 10. |
| `evidence:runtime-observed-proof-cc13aa9b68ae8366a686` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a11c3ecc-expected` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 11. |
| `evidence:runtime-observed-proof-25a2bb68f1cca278ab3f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a11c3ecc-negative` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 12. |
| `evidence:runtime-observed-proof-cf7d3030396fd3f6cb47` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f3a2b88d-expected` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 13. |
| `evidence:runtime-observed-proof-76dabf6eb3a56e57158a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f3a2b88d-negative` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 14. |
| `evidence:runtime-observed-proof-d6bd5267ad5ae38f7394` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d653660b-expected` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 15. |
| `evidence:runtime-observed-proof-d36fc11b1688764346ac` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-d653660b-negative` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 16. |
| `evidence:runtime-observed-proof-8f4af531a21990cb91ef` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7b2145c0-expected` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 17. |
| `evidence:runtime-observed-proof-153d136cf5e56ca933c5` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7b2145c0-negative` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 18. |
| `evidence:runtime-observed-proof-28167ac9169d858e4be9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 19. |
| `evidence:runtime-observed-proof-b728bd1e8113b0ecd6e9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 20. |
| `evidence:runtime-observed-proof-44dd78cdf7486b29308f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 21. |
| `evidence:runtime-observed-proof-61b4b56bb10b33496f69` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 22. |
| `evidence:runtime-observed-proof-586a707ea17ef41ac662` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 23. |
| `evidence:runtime-observed-proof-9980fe6e0b3053d6490c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log` | node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d` | N/A | Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 24. |
| `evidence:runtime-observed-proof-8078cad7be75c73bf876` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:cbc76d1012a49ec7b120f8c9bea9b457c33a383a6a99f32192077a78bd00ab50` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1. |
| `evidence:runtime-observed-proof-edceb0c3437a9427abbc` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:cbc76d1012a49ec7b120f8c9bea9b457c33a383a6a99f32192077a78bd00ab50` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2. |
| `evidence:observed-proof-fae11a65412766597094` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/115-work-queue-transition-tests.log` | node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs | IntentOS local verification | local isolated Node process | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr` | `sha256:151da6e46507fe6cee679f171842617ff5ddb8e6db2cd965816c64b8f2c83f6c` | N/A | Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 15. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:universe-a6e545d4-expected` | `COVERED` | `evidence:runtime-observed-proof-0fd888a0cf8a233c7856` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a6e545d4-negative` | `COVERED` | `evidence:runtime-observed-proof-e3c5ef138a2ff11e95b8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-33f16b20-expected` | `COVERED` | `evidence:runtime-observed-proof-0f82f9e19596601cbebd` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-33f16b20-negative` | `COVERED` | `evidence:runtime-observed-proof-0b729e914227c927576d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-fb5f6fb1-expected` | `COVERED` | `evidence:runtime-observed-proof-46cad4beb44775e715c8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-fb5f6fb1-negative` | `COVERED` | `evidence:runtime-observed-proof-92dbc91ca4a7ebdb0219` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-61e14285-expected` | `COVERED` | `evidence:runtime-observed-proof-29cf7de440d25d0cf872` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-61e14285-negative` | `COVERED` | `evidence:runtime-observed-proof-f2ecf656a89c5c65a902` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-e1e69a79-expected` | `COVERED` | `evidence:runtime-observed-proof-965b6a4b66549bedf143` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-e1e69a79-negative` | `COVERED` | `evidence:runtime-observed-proof-4c226671c7eacf021d3d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a11c3ecc-expected` | `COVERED` | `evidence:runtime-observed-proof-cc13aa9b68ae8366a686` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a11c3ecc-negative` | `COVERED` | `evidence:runtime-observed-proof-25a2bb68f1cca278ab3f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f3a2b88d-expected` | `COVERED` | `evidence:runtime-observed-proof-cf7d3030396fd3f6cb47` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f3a2b88d-negative` | `COVERED` | `evidence:runtime-observed-proof-76dabf6eb3a56e57158a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d653660b-expected` | `COVERED` | `evidence:runtime-observed-proof-d6bd5267ad5ae38f7394` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-d653660b-negative` | `COVERED` | `evidence:runtime-observed-proof-d36fc11b1688764346ac` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7b2145c0-expected` | `COVERED` | `evidence:runtime-observed-proof-8f4af531a21990cb91ef` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7b2145c0-negative` | `COVERED` | `evidence:runtime-observed-proof-153d136cf5e56ca933c5` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:runtime-observed-proof-28167ac9169d858e4be9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:runtime-observed-proof-b728bd1e8113b0ecd6e9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `COVERED` | `evidence:runtime-observed-proof-44dd78cdf7486b29308f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `COVERED` | `evidence:observed-proof-fae11a65412766597094` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `COVERED` | `evidence:runtime-observed-proof-8078cad7be75c73bf876`, `evidence:runtime-observed-proof-edceb0c3437a9427abbc` | A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation. |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `COVERED` | `evidence:runtime-observed-proof-61b4b56bb10b33496f69` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:runtime-observed-proof-586a707ea17ef41ac662` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:runtime-observed-proof-9980fe6e0b3053d6490c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:generated-test-review-required` | `TEST_COVERAGE` | `SATISFIED` | `runtime:self-current-obligation-evidence`, `evidence:runtime-observed-proof-9980fe6e0b3053d6490c` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:runtime-observed-proof-9980fe6e0b3053d6490c` | Evidence is mapped to related Verification Plan obligations. |

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
  "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
  "intent": "modularize scripts/init-project.mjs into focused internal modules while preserving CLI arguments, output, plan and receipt formats, mutation ordering, rollback behavior, and exit codes",
  "intent_digest": "sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435",
  "test_evidence_ref": "artifact:test-evidence-reports/115-init-project-modularity.md",
  "test_evidence_digest": "sha256:3a2beaa81ca12793e45d8aaf606c22dca0b9a1ad58222607c86af7976618af12",
  "verification_plan_ref": "artifact:verification-plans/115-init-project-modularity.md",
  "verification_plan_digest": "sha256:0fce1a7acacd420fe207617a33d2b2b5a6eb409e5d18fc180ea786c1e4716e5d",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/115-init-project-modularity.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:0fce1a7acacd420fe207617a33d2b2b5a6eb409e5d18fc180ea786c1e4716e5d"
    },
    {
      "name": "business_rule_closure",
      "status": "RECORDED",
      "ref": "artifact:business-rule-closures/115-init-project-modularity.md",
      "source_outcome": "READY_FOR_IMPACT_COVERAGE",
      "digest": "sha256:ecd8231f572d0c14ae11e29c1c1e84830c1f35b8d504013d17ec0b49501480fc"
    },
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "digest": "sha256:f2ef5bb6f318c90b83e3a53899fcb6cab1ba61a885e563aadaaea191e970fc29"
    },
    {
      "name": "business_universe_coverage",
      "status": "RECORDED",
      "ref": "business-universe-coverage-reports/115-init-project-modularity.md",
      "source_outcome": "COVERAGE_READY",
      "digest": "sha256:9b6b440a74d414e59be7f4755ef84f0adc7bd6746a0cf23313a346c88f00af86"
    },
    {
      "name": "control_effectiveness",
      "status": "RECORDED",
      "ref": "artifact:control-effectiveness-reports/115-init-project-modularity.md",
      "source_outcome": "CONTROL_PROVEN_EFFECTIVE",
      "digest": "sha256:0bc352601aee287a2ca7bda78436af8fad6b1aab1422dfab2f7e3630671f9081"
    },
    {
      "name": "verification_run_manifest",
      "status": "RECORDED",
      "ref": "artifact:verification-run-manifests/115-init-project-modularity.md",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "digest": "sha256:d9cfb812a4f464c6c72f2fc5f6f2a91c7d0cc11998cf0dbbb119281f19be6a98"
    }
  ],
  "runtime_trust_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "run_manifest_ref": "artifact:verification-run-manifests/115-init-project-modularity.md",
    "run_manifest_digest": "sha256:d9cfb812a4f464c6c72f2fc5f6f2a91c7d0cc11998cf0dbbb119281f19be6a98",
    "run_id": "vrun-115-init-project-modularity-r2",
    "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
    "intent_digest": "sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435",
    "runtime_trust_level": "ISOLATED_RUNTIME",
    "runtime_plan_ref": "artifact:verification-runtime-plans/115-init-project-modularity.md",
    "runtime_plan_digest": "sha256:0eb5bc5ef1fe19626c9d6f946ff7b72ac2ff63bb794799f0555531cf03af5f39",
    "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/115-init-project-modularity.md",
    "lifecycle_plan_digest": "sha256:29b08d7588934b84dd84a10d622096f959e6c25d178dc75dcd3fd8c7f7a9046d",
    "verification_plan_ref": "artifact:verification-plans/115-init-project-modularity.md",
    "verification_plan_digest": "sha256:0fce1a7acacd420fe207617a33d2b2b5a6eb409e5d18fc180ea786c1e4716e5d",
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
    "report_ref": "artifact:control-effectiveness-reports/115-init-project-modularity.md",
    "report_digest": "sha256:0bc352601aee287a2ca7bda78436af8fad6b1aab1422dfab2f7e3630671f9081",
    "required_claim_ids": [
      "claim:package-script-verify-candidate",
      "claim:package-script-verify-consumer-chain-candidate",
      "claim:package-script-verify-planning-closure",
      "claim:file-scripts-check-adoption-assurance-mjs",
      "claim:file-scripts-check-ai-workflow-mjs",
      "claim:file-scripts-check-apply-execution-receipt-mjs",
      "claim:file-scripts-check-apply-plan-mjs",
      "claim:file-scripts-check-approval-record-mjs"
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
      "revision": "sha256:74f2ade5f66be7d8cd52084fbe3c9af0aa64f217e97267ae998c21908b54c235"
    },
    "task": {
      "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
      "intent_digest": "sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435"
    },
    "sources": [
      {
        "ref": "artifact:verification-plans/115-init-project-modularity.md",
        "relative_path": "verification-plans/115-init-project-modularity.md",
        "raw_file_digest": "sha256:ab4fb28bd79062632900a03ca79967249dbe566eb88ff8660990307fd2058fc0"
      },
      {
        "ref": "artifact:business-rule-closures/115-init-project-modularity.md",
        "relative_path": "business-rule-closures/115-init-project-modularity.md",
        "raw_file_digest": "sha256:d2da83404f835c522f6a2c671728db5dd54bd8290082e0c79e02e66bcf667a34"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md",
        "relative_path": "change-impact-coverage-reports/preflight-115-init-project-modularity.md",
        "raw_file_digest": "sha256:f67c5ee64f82b041ed7d42d302e3e130fabad6623846b129c3da92bb128c30a2"
      },
      {
        "ref": "artifact:control-effectiveness-reports/115-init-project-modularity.md",
        "relative_path": "control-effectiveness-reports/115-init-project-modularity.md",
        "raw_file_digest": "sha256:9b9802db0b042d5e81e5cf220a15fcc639da92c62e2a05c38a0c9ce5c8a80c73"
      },
      {
        "ref": "artifact:verification-run-manifests/115-init-project-modularity.md",
        "relative_path": "verification-run-manifests/115-init-project-modularity.md",
        "raw_file_digest": "sha256:eccc583cbd0eff39d34e367502917c70f236c71fa16ed336e44621375f29dda0"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:a099966029e36f4108484546547520c281388cfc568dc4d14952164c03f8d82e"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:410a14bdbc01735839ed40cc6361e8511df136fea1cbd21dfd5b7be1e951217a"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:3ee2fba6a083bd4d81892d544c6e4003bc7d00de9deff5a97a95131ae55a665b"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:cbc76d1012a49ec7b120f8c9bea9b457c33a383a6a99f32192077a78bd00ab50"
      },
      {
        "ref": "artifact:evidence/115-work-queue-transition-tests.log",
        "relative_path": "evidence/115-work-queue-transition-tests.log",
        "raw_file_digest": "sha256:151da6e46507fe6cee679f171842617ff5ddb8e6db2cd965816c64b8f2c83f6c"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "runtime:self-runtime-negative",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-negative.log",
      "command": "node scripts/verification-runtime-self-service.mjs negative",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:17:25.347Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:a099966029e36f4108484546547520c281388cfc568dc4d14952164c03f8d82e",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-runtime-positive",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-runtime-positive.log",
      "command": "node scripts/verification-runtime-self-service.mjs positive",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:17:25.379Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:410a14bdbc01735839ed40cc6361e8511df136fea1cbd21dfd5b7be1e951217a",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-candidate-verification",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-candidate-verification.log",
      "command": "npm run verify:pre-runtime",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:24:21.499Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:3ee2fba6a083bd4d81892d544c6e4003bc7d00de9deff5a97a95131ae55a665b",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-obligation-evidence",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-33f16b20-expected",
        "verify:universe-33f16b20-negative",
        "verify:universe-61e14285-expected",
        "verify:universe-61e14285-negative",
        "verify:universe-7b2145c0-expected",
        "verify:universe-7b2145c0-negative",
        "verify:universe-a11c3ecc-expected",
        "verify:universe-a11c3ecc-negative",
        "verify:universe-a6e545d4-expected",
        "verify:universe-a6e545d4-negative",
        "verify:universe-d653660b-expected",
        "verify:universe-d653660b-negative",
        "verify:universe-e1e69a79-expected",
        "verify:universe-e1e69a79-negative",
        "verify:universe-f3a2b88d-expected",
        "verify:universe-f3a2b88d-negative",
        "verify:universe-fb5f6fb1-expected",
        "verify:universe-fb5f6fb1-negative",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-runtime-behavior",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.455Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:cbc76d1012a49ec7b120f8c9bea9b457c33a383a6a99f32192077a78bd00ab50",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "evidence:115-work-queue-transition",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/115-work-queue-transition-tests.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS local verification",
      "environment": "local isolated Node process",
      "ran_at": "2026-07-23T02:34:38+08:00",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
      ],
      "output_digest": "sha256:151da6e46507fe6cee679f171842617ff5ddb8e6db2cd965816c64b8f2c83f6c",
      "failure_reason": "N/A",
      "limitations": "Bounded to the current staged Work Queue transition candidate; no external or production effect."
    },
    {
      "id": "evidence:runtime-observed-proof-0fd888a0cf8a233c7856",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a6e545d4-expected"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-e3c5ef138a2ff11e95b8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a6e545d4-negative"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 2."
    },
    {
      "id": "evidence:runtime-observed-proof-0f82f9e19596601cbebd",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-33f16b20-expected"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 3."
    },
    {
      "id": "evidence:runtime-observed-proof-0b729e914227c927576d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-33f16b20-negative"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 4."
    },
    {
      "id": "evidence:runtime-observed-proof-46cad4beb44775e715c8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-fb5f6fb1-expected"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 5."
    },
    {
      "id": "evidence:runtime-observed-proof-92dbc91ca4a7ebdb0219",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-fb5f6fb1-negative"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 6."
    },
    {
      "id": "evidence:runtime-observed-proof-29cf7de440d25d0cf872",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-61e14285-expected"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 7."
    },
    {
      "id": "evidence:runtime-observed-proof-f2ecf656a89c5c65a902",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-61e14285-negative"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 8."
    },
    {
      "id": "evidence:runtime-observed-proof-965b6a4b66549bedf143",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-e1e69a79-expected"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 9."
    },
    {
      "id": "evidence:runtime-observed-proof-4c226671c7eacf021d3d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-e1e69a79-negative"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 10."
    },
    {
      "id": "evidence:runtime-observed-proof-cc13aa9b68ae8366a686",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a11c3ecc-expected"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 11."
    },
    {
      "id": "evidence:runtime-observed-proof-25a2bb68f1cca278ab3f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a11c3ecc-negative"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 12."
    },
    {
      "id": "evidence:runtime-observed-proof-cf7d3030396fd3f6cb47",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f3a2b88d-expected"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 13."
    },
    {
      "id": "evidence:runtime-observed-proof-76dabf6eb3a56e57158a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f3a2b88d-negative"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 14."
    },
    {
      "id": "evidence:runtime-observed-proof-d6bd5267ad5ae38f7394",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d653660b-expected"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 15."
    },
    {
      "id": "evidence:runtime-observed-proof-d36fc11b1688764346ac",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-d653660b-negative"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 16."
    },
    {
      "id": "evidence:runtime-observed-proof-8f4af531a21990cb91ef",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7b2145c0-expected"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 17."
    },
    {
      "id": "evidence:runtime-observed-proof-153d136cf5e56ca933c5",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7b2145c0-negative"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 18."
    },
    {
      "id": "evidence:runtime-observed-proof-28167ac9169d858e4be9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 19."
    },
    {
      "id": "evidence:runtime-observed-proof-b728bd1e8113b0ecd6e9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 20."
    },
    {
      "id": "evidence:runtime-observed-proof-44dd78cdf7486b29308f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 21."
    },
    {
      "id": "evidence:runtime-observed-proof-61b4b56bb10b33496f69",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 22."
    },
    {
      "id": "evidence:runtime-observed-proof-586a707ea17ef41ac662",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 23."
    },
    {
      "id": "evidence:runtime-observed-proof-9980fe6e0b3053d6490c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-obligation-evidence.log",
      "command": "node --test --test-concurrency=1 tests/115-init-project-obligation-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:617008a1905cef0ce355ea84080dcf8e3eaf1c8096aeb6d634be882737a4fd0d",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/115-init-project-obligation-evidence.test.mjs; test name final init-project public-entry and transaction suite passes; source line 24."
    },
    {
      "id": "evidence:runtime-observed-proof-8078cad7be75c73bf876",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.455Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:cbc76d1012a49ec7b120f8c9bea9b457c33a383a6a99f32192077a78bd00ab50",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-edceb0c3437a9427abbc",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-115-init-project-modularity-r2/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-22T18:29:20.455Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:cbc76d1012a49ec7b120f8c9bea9b457c33a383a6a99f32192077a78bd00ab50",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2."
    },
    {
      "id": "evidence:observed-proof-fae11a65412766597094",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/115-work-queue-transition-tests.log",
      "command": "node --test --test-concurrency=1 tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "owner": "IntentOS local verification",
      "environment": "local isolated Node process",
      "ran_at": "2026-07-23T02:34:38+08:00",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
      ],
      "output_digest": "sha256:151da6e46507fe6cee679f171842617ff5ddb8e6db2cd965816c64b8f2c83f6c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/114-work-queue-transition-obligation-evidence.test.mjs; test name focused Work Queue transition behavior and tamper paths pass; source line 15."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:universe-a6e545d4-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0fd888a0cf8a233c7856"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a6e545d4-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e3c5ef138a2ff11e95b8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-33f16b20-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0f82f9e19596601cbebd"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-33f16b20-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0b729e914227c927576d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-fb5f6fb1-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-46cad4beb44775e715c8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-fb5f6fb1-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-92dbc91ca4a7ebdb0219"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-61e14285-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-29cf7de440d25d0cf872"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-61e14285-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f2ecf656a89c5c65a902"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-e1e69a79-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-965b6a4b66549bedf143"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-e1e69a79-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-4c226671c7eacf021d3d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a11c3ecc-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cc13aa9b68ae8366a686"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a11c3ecc-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-25a2bb68f1cca278ab3f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f3a2b88d-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cf7d3030396fd3f6cb47"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f3a2b88d-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-76dabf6eb3a56e57158a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d653660b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d6bd5267ad5ae38f7394"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-d653660b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d36fc11b1688764346ac"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7b2145c0-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8f4af531a21990cb91ef"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7b2145c0-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-153d136cf5e56ca933c5"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-28167ac9169d858e4be9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b728bd1e8113b0ecd6e9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-44dd78cdf7486b29308f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:background-work-integration-contract-check-scheduled-queued-retr",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:observed-proof-fae11a65412766597094"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8078cad7be75c73bf876",
        "evidence:runtime-observed-proof-edceb0c3437a9427abbc"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation."
    },
    {
      "obligation_id": "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-61b4b56bb10b33496f69"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-586a707ea17ef41ac662"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9980fe6e0b3053d6490c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    }
  ],
  "business_universe_binding": {
    "required": "Yes",
    "routing_result": "REQUIRED_WITH_EVIDENCE",
    "business_universe_ref": "business-universe-coverage-reports/115-init-project-modularity.md",
    "business_universe_digest": "sha256:9b6b440a74d414e59be7f4755ef84f0adc7bd6746a0cf23313a346c88f00af86",
    "business_universe_state": "COVERAGE_READY",
    "coverage_scenario_ids": [
      "coverage-scenario:8436e1d4a9c2ab91a6e545d4",
      "coverage-scenario:6b8a64e0ae567bd533f16b20",
      "coverage-scenario:29c41b694e2a25b5fb5f6fb1",
      "coverage-scenario:53e237fc9cea90ed61e14285",
      "coverage-scenario:573d43f84fcad189e1e69a79",
      "coverage-scenario:dca2a70d980c86f4a11c3ecc",
      "coverage-scenario:63fcddf585d8dd27f3a2b88d",
      "coverage-scenario:6330c97be1602986d653660b",
      "coverage-scenario:d93095e30021697e7b2145c0"
    ],
    "coverage_mapping_status": "COMPLETE"
  },
  "scenario_coverage_map": [
    {
      "coverage_scenario_id": "coverage-scenario:8436e1d4a9c2ab91a6e545d4",
      "required_obligation_ids": [
        "verify:universe-a6e545d4-expected",
        "verify:universe-a6e545d4-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-a6e545d4-expected",
        "verify:universe-a6e545d4-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0fd888a0cf8a233c7856",
        "evidence:runtime-observed-proof-e3c5ef138a2ff11e95b8"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:6b8a64e0ae567bd533f16b20",
      "required_obligation_ids": [
        "verify:universe-33f16b20-expected",
        "verify:universe-33f16b20-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-33f16b20-expected",
        "verify:universe-33f16b20-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0f82f9e19596601cbebd",
        "evidence:runtime-observed-proof-0b729e914227c927576d"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:29c41b694e2a25b5fb5f6fb1",
      "required_obligation_ids": [
        "verify:universe-fb5f6fb1-expected",
        "verify:universe-fb5f6fb1-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-fb5f6fb1-expected",
        "verify:universe-fb5f6fb1-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-46cad4beb44775e715c8",
        "evidence:runtime-observed-proof-92dbc91ca4a7ebdb0219"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:53e237fc9cea90ed61e14285",
      "required_obligation_ids": [
        "verify:universe-61e14285-expected",
        "verify:universe-61e14285-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-61e14285-expected",
        "verify:universe-61e14285-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-29cf7de440d25d0cf872",
        "evidence:runtime-observed-proof-f2ecf656a89c5c65a902"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:573d43f84fcad189e1e69a79",
      "required_obligation_ids": [
        "verify:universe-e1e69a79-expected",
        "verify:universe-e1e69a79-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-e1e69a79-expected",
        "verify:universe-e1e69a79-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-965b6a4b66549bedf143",
        "evidence:runtime-observed-proof-4c226671c7eacf021d3d"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:dca2a70d980c86f4a11c3ecc",
      "required_obligation_ids": [
        "verify:universe-a11c3ecc-expected",
        "verify:universe-a11c3ecc-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-a11c3ecc-expected",
        "verify:universe-a11c3ecc-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cc13aa9b68ae8366a686",
        "evidence:runtime-observed-proof-25a2bb68f1cca278ab3f"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:63fcddf585d8dd27f3a2b88d",
      "required_obligation_ids": [
        "verify:universe-f3a2b88d-expected",
        "verify:universe-f3a2b88d-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-f3a2b88d-expected",
        "verify:universe-f3a2b88d-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cf7d3030396fd3f6cb47",
        "evidence:runtime-observed-proof-76dabf6eb3a56e57158a"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:6330c97be1602986d653660b",
      "required_obligation_ids": [
        "verify:universe-d653660b-expected",
        "verify:universe-d653660b-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-d653660b-expected",
        "verify:universe-d653660b-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d6bd5267ad5ae38f7394",
        "evidence:runtime-observed-proof-d36fc11b1688764346ac"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:d93095e30021697e7b2145c0",
      "required_obligation_ids": [
        "verify:universe-7b2145c0-expected",
        "verify:universe-7b2145c0-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-7b2145c0-expected",
        "verify:universe-7b2145c0-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8f4af531a21990cb91ef",
        "evidence:runtime-observed-proof-153d136cf5e56ca933c5"
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
        "evidence:runtime-observed-proof-9980fe6e0b3053d6490c"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9980fe6e0b3053d6490c"
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
