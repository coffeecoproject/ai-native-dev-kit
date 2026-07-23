# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 17/17 required obligations covered by 23 evidence item(s).

## User Request

- Request: establish a forward-only evidence retention and deduplication rule for runtime state that preserves authoritative reports and the final trusted runtime while preventing duplicate aggregate logs, stale retry archives, and unbounded per-task evidence growth without rewriting released evidence
- Task ref: `task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/118-evidence-retention-deduplication.md` | `VERIFICATION_PLAN_READY` | `sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/118-evidence-retention-deduplication.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:7b127a380f8177084e8fc6dc0a4ace14b7571c135d8e2dd3370ed8fba72bc6c0` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md` | `CHANGE_IMPACT_RECORDED` | `sha256:ca9e2f6da4b8de3fd112ee74dc4506100c9b2540f4b5bfeef39f9863d4508ee8` |
| `business_universe_coverage` | `RECORDED` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md` | `COVERAGE_READY` | `sha256:9e2514fbde77b9a5b32d0da2f8cc0df1deda875a04c34ba75a4f996cef43b823` |
| `control_effectiveness` | `NOT_PROVIDED` | `N/A` | `NOT_APPLICABLE_WITH_REASON` | `N/A` |
| `verification_run_manifest` | `RECORDED` | `artifact:verification-run-manifests/118-evidence-retention-deduplication.md` | `RUNTIME_TRUST_COMPLETE` | `sha256:975b22a586d9f6512452c8b1a4bbb54afb0baaf7392cf3ac8e77427ec79863aa` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/118-evidence-retention-deduplication.md`
- Test evidence digest: `sha256:d139481cefb8a24dd8d5e3ab1a76761a1acf5c03306343800e6c50965271a1d3`
- Verification plan ref: `artifact:verification-plans/118-evidence-retention-deduplication.md`
- Verification plan digest: `sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727`
- Intent digest: `sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652`

## Verification Plan Binding

- Verification plan state: `VERIFICATION_PLAN_READY`
- Required obligations: `17`
- Covered obligations: `17`
- Missing obligations: `0`

## Runtime Trust Binding

| Field | Value |
| --- | --- |
| Requirement | `REQUIRED` |
| Status | `VERIFIED` |
| Run Manifest | `artifact:verification-run-manifests/118-evidence-retention-deduplication.md` |
| Run ID | `vrun-118-evidence-retention-deduplication-r3` |
| Task Ref | `task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f` |
| Intent Digest | `sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652` |
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
| `coverage-scenario:066f1fee0cdbf5f993e4686c` | `verify:universe-93e4686c-expected`, `verify:universe-93e4686c-negative` | `verify:universe-93e4686c-expected`, `verify:universe-93e4686c-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-372edf67d39d15fbaa23`, `evidence:runtime-observed-proof-6308396ab9c94e2117dc` |
| `coverage-scenario:a109f7bce060ab502118bb89` | `verify:universe-2118bb89-expected`, `verify:universe-2118bb89-negative` | `verify:universe-2118bb89-expected`, `verify:universe-2118bb89-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-21fdf50b2d0c000c3435`, `evidence:runtime-observed-proof-38657b91c488918d4a4d` |
| `coverage-scenario:4959cf4953da04a02020517d` | `verify:universe-2020517d-expected`, `verify:universe-2020517d-negative` | `verify:universe-2020517d-expected`, `verify:universe-2020517d-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-a89285fd636a932c4766`, `evidence:runtime-observed-proof-a40311d70f208ac7e3ff` |
| `coverage-scenario:c7983fd3a2b96b768140bff0` | `verify:universe-8140bff0-expected`, `verify:universe-8140bff0-negative` | `verify:universe-8140bff0-expected`, `verify:universe-8140bff0-negative` | `STRUCTURAL_SOURCE_PROOF` | `COVERED` | `evidence:runtime-observed-proof-796b1daae7e1d2f3d924`, `evidence:runtime-observed-proof-810007b90e527085b718` |
| `coverage-scenario:b378ce917c0d0bb34193ff31` | `verify:universe-4193ff31-expected`, `verify:universe-4193ff31-negative` | `verify:universe-4193ff31-expected`, `verify:universe-4193ff31-negative` | `STRUCTURAL_SOURCE_PROOF` | `COVERED` | `evidence:runtime-observed-proof-cae6f2e0fb64f45df631`, `evidence:runtime-observed-proof-b96bb70db5fb2cb762cf` |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `runtime:self-runtime-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-negative.log` | node scripts/verification-runtime-self-service.mjs negative | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:fcdbbb4e1b81de2d9f4a695dfe3521aa4cc0bbe09df3f8876b75117480df5c7d` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-runtime-positive` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-positive.log` | node scripts/verification-runtime-self-service.mjs positive | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:b94c2fcfd61975f79536a5c335665c2de44c0318422760913a8a006939e35164` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-candidate-verification` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-candidate-verification.log` | npm run verify:pre-runtime | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:051e8340f8435ec56fc2bdffdf2c1aad7dcba02bf087126a2be1e4cab32e0493` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-obligation-evidence` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr`, `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb`, `verify:test-coverage-regression-smoke-task-specific-verification-exists`, `verify:universe-2020517d-expected`, `verify:universe-2020517d-negative`, `verify:universe-2118bb89-expected`, `verify:universe-2118bb89-negative`, `verify:universe-4193ff31-expected`, `verify:universe-4193ff31-negative`, `verify:universe-8140bff0-expected`, `verify:universe-8140bff0-negative`, `verify:universe-93e4686c-expected`, `verify:universe-93e4686c-negative`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af`, `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-runtime-behavior` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:9fae88f927c09283bb0e2f3ece30867b9620f91c059fa090992aea0ba7a7485e` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `evidence:runtime-observed-proof-372edf67d39d15fbaa23` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-93e4686c-expected` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name generated projects receive every retention surface; source line 1. |
| `evidence:runtime-observed-proof-6308396ab9c94e2117dc` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-93e4686c-negative` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name missing distribution declarations fail closed; source line 2. |
| `evidence:runtime-observed-proof-21fdf50b2d0c000c3435` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-2118bb89-expected` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name pre-runtime invokes the strict checker; source line 3. |
| `evidence:runtime-observed-proof-38657b91c488918d4a4d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-2118bb89-negative` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name checker violations propagate a non-zero exit; source line 4. |
| `evidence:runtime-observed-proof-a89285fd636a932c4766` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-2020517d-expected` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name policy enforces final-run, duplicate, and budget limits; source line 5. |
| `evidence:runtime-observed-proof-a40311d70f208ac7e3ff` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-2020517d-negative` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name historical evidence is immutable and evaluation is read-only; source line 6. |
| `evidence:runtime-observed-proof-796b1daae7e1d2f3d924` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8140bff0-expected` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name workflow template declares retention assets; source line 7. |
| `evidence:runtime-observed-proof-810007b90e527085b718` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-8140bff0-negative` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name manifest and generated-project tests detect template drift; source line 8. |
| `evidence:runtime-observed-proof-cae6f2e0fb64f45df631` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4193ff31-expected` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name valid source and generated fixtures are characterized; source line 9. |
| `evidence:runtime-observed-proof-b96bb70db5fb2cb762cf` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-4193ff31-negative` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name every governed rejection mode is characterized; source line 10. |
| `evidence:runtime-observed-proof-35ea5e51bb31141557f9` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name local maintainer receives explicit PASS or FAIL output; source line 11. |
| `evidence:runtime-observed-proof-368decf87acfcfc5960a` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name standard verification retains its existing prefix and adds one gate; source line 12. |
| `evidence:runtime-observed-proof-0dfcd040b24cdfc9b068` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name checker starts no background work; source line 13. |
| `evidence:runtime-observed-proof-32533f0b0af995fb2bb7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name failure preserves the bounded repository state; source line 15. |
| `evidence:runtime-observed-proof-a04d5a72d28c79de64a8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name documentation records budgets and cleanup order; source line 16. |
| `evidence:runtime-observed-proof-fbde99566b8fd1fc4d6e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log` | node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134` | N/A | Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name task-specific evidence covers positive and negative paths; source line 17. |
| `evidence:runtime-observed-proof-8cd052c99e2471279ec0` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:9fae88f927c09283bb0e2f3ece30867b9620f91c059fa090992aea0ba7a7485e` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1. |
| `evidence:runtime-observed-proof-4fc48b98e6aaaa2377b3` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:9fae88f927c09283bb0e2f3ece30867b9620f91c059fa090992aea0ba7a7485e` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:universe-93e4686c-expected` | `COVERED` | `evidence:runtime-observed-proof-372edf67d39d15fbaa23` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-93e4686c-negative` | `COVERED` | `evidence:runtime-observed-proof-6308396ab9c94e2117dc` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-2118bb89-expected` | `COVERED` | `evidence:runtime-observed-proof-21fdf50b2d0c000c3435` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-2118bb89-negative` | `COVERED` | `evidence:runtime-observed-proof-38657b91c488918d4a4d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-2020517d-expected` | `COVERED` | `evidence:runtime-observed-proof-a89285fd636a932c4766` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-2020517d-negative` | `COVERED` | `evidence:runtime-observed-proof-a40311d70f208ac7e3ff` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8140bff0-expected` | `COVERED` | `evidence:runtime-observed-proof-796b1daae7e1d2f3d924` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-8140bff0-negative` | `COVERED` | `evidence:runtime-observed-proof-810007b90e527085b718` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4193ff31-expected` | `COVERED` | `evidence:runtime-observed-proof-cae6f2e0fb64f45df631` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-4193ff31-negative` | `COVERED` | `evidence:runtime-observed-proof-b96bb70db5fb2cb762cf` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:runtime-observed-proof-35ea5e51bb31141557f9` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:runtime-observed-proof-368decf87acfcfc5960a` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `COVERED` | `evidence:runtime-observed-proof-0dfcd040b24cdfc9b068` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `COVERED` | `evidence:runtime-observed-proof-8cd052c99e2471279ec0`, `evidence:runtime-observed-proof-4fc48b98e6aaaa2377b3` | A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation. |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `COVERED` | `evidence:runtime-observed-proof-32533f0b0af995fb2bb7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:runtime-observed-proof-a04d5a72d28c79de64a8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:runtime-observed-proof-fbde99566b8fd1fc4d6e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:generated-test-review-required` | `TEST_COVERAGE` | `SATISFIED` | `runtime:self-current-obligation-evidence`, `evidence:runtime-observed-proof-fbde99566b8fd1fc4d6e` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:runtime-observed-proof-fbde99566b8fd1fc4d6e` | Evidence is mapped to related Verification Plan obligations. |

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
  "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
  "intent": "establish a forward-only evidence retention and deduplication rule for runtime state that preserves authoritative reports and the final trusted runtime while preventing duplicate aggregate logs, stale retry archives, and unbounded per-task evidence growth without rewriting released evidence",
  "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652",
  "test_evidence_ref": "artifact:test-evidence-reports/118-evidence-retention-deduplication.md",
  "test_evidence_digest": "sha256:d139481cefb8a24dd8d5e3ab1a76761a1acf5c03306343800e6c50965271a1d3",
  "verification_plan_ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
  "verification_plan_digest": "sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727"
    },
    {
      "name": "business_rule_closure",
      "status": "RECORDED",
      "ref": "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
      "source_outcome": "READY_FOR_IMPACT_COVERAGE",
      "digest": "sha256:7b127a380f8177084e8fc6dc0a4ace14b7571c135d8e2dd3370ed8fba72bc6c0"
    },
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "digest": "sha256:ca9e2f6da4b8de3fd112ee74dc4506100c9b2540f4b5bfeef39f9863d4508ee8"
    },
    {
      "name": "business_universe_coverage",
      "status": "RECORDED",
      "ref": "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
      "source_outcome": "COVERAGE_READY",
      "digest": "sha256:9e2514fbde77b9a5b32d0da2f8cc0df1deda875a04c34ba75a4f996cef43b823"
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
      "ref": "artifact:verification-run-manifests/118-evidence-retention-deduplication.md",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "digest": "sha256:975b22a586d9f6512452c8b1a4bbb54afb0baaf7392cf3ac8e77427ec79863aa"
    }
  ],
  "runtime_trust_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "run_manifest_ref": "artifact:verification-run-manifests/118-evidence-retention-deduplication.md",
    "run_manifest_digest": "sha256:975b22a586d9f6512452c8b1a4bbb54afb0baaf7392cf3ac8e77427ec79863aa",
    "run_id": "vrun-118-evidence-retention-deduplication-r3",
    "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
    "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652",
    "runtime_trust_level": "ISOLATED_RUNTIME",
    "runtime_plan_ref": "artifact:verification-runtime-plans/118-evidence-retention-deduplication.md",
    "runtime_plan_digest": "sha256:837fd0c0cb2419f3c88758ab581cacd8cc6fb0b0003660258814614d3804ec2d",
    "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/118-evidence-retention-deduplication.md",
    "lifecycle_plan_digest": "sha256:8271acb2c8adec9bf543746f1210c5c490ec3c62efbf57b4067dcb5b8aee221f",
    "verification_plan_ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
    "verification_plan_digest": "sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727",
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
      "revision": "sha256:6f2712d848daec60f6eb2b18e428e8c747e9d31bb2446a3b53115c74d70ad1fd"
    },
    "task": {
      "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
      "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652"
    },
    "sources": [
      {
        "ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
        "relative_path": "verification-plans/118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:d29e767295f6fa2f455b1b3cc7bdce7404c59f0ba2be7687580aba342cb59ba7"
      },
      {
        "ref": "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
        "relative_path": "business-rule-closures/118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:0461ce55d4322962ec5fe32c0ecdbf651b729fb3e2a51967adaf09d1db3731c5"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md",
        "relative_path": "change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:0cdf1a1ddac44d157a4fe64697110cf37bad5a2952df65f4a1e8efd44a9e9865"
      },
      {
        "ref": "artifact:verification-run-manifests/118-evidence-retention-deduplication.md",
        "relative_path": "verification-run-manifests/118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:2f530a7d67cdd7c50172a55f9938104642cec4b921fa30643a729d7a63c51a44"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:fcdbbb4e1b81de2d9f4a695dfe3521aa4cc0bbe09df3f8876b75117480df5c7d"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:b94c2fcfd61975f79536a5c335665c2de44c0318422760913a8a006939e35164"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:051e8340f8435ec56fc2bdffdf2c1aad7dcba02bf087126a2be1e4cab32e0493"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:9fae88f927c09283bb0e2f3ece30867b9620f91c059fa090992aea0ba7a7485e"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "runtime:self-runtime-negative",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-negative.log",
      "command": "node scripts/verification-runtime-self-service.mjs negative",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:09:13.112Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:fcdbbb4e1b81de2d9f4a695dfe3521aa4cc0bbe09df3f8876b75117480df5c7d",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-runtime-positive",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-runtime-positive.log",
      "command": "node scripts/verification-runtime-self-service.mjs positive",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:09:13.177Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:b94c2fcfd61975f79536a5c335665c2de44c0318422760913a8a006939e35164",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-candidate-verification",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-candidate-verification.log",
      "command": "npm run verify:pre-runtime",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:17:56.315Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:051e8340f8435ec56fc2bdffdf2c1aad7dcba02bf087126a2be1e4cab32e0493",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-obligation-evidence",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-2020517d-expected",
        "verify:universe-2020517d-negative",
        "verify:universe-2118bb89-expected",
        "verify:universe-2118bb89-negative",
        "verify:universe-4193ff31-expected",
        "verify:universe-4193ff31-negative",
        "verify:universe-8140bff0-expected",
        "verify:universe-8140bff0-negative",
        "verify:universe-93e4686c-expected",
        "verify:universe-93e4686c-negative",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-runtime-behavior",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.496Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:9fae88f927c09283bb0e2f3ece30867b9620f91c059fa090992aea0ba7a7485e",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "evidence:runtime-observed-proof-372edf67d39d15fbaa23",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-93e4686c-expected"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name generated projects receive every retention surface; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-6308396ab9c94e2117dc",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-93e4686c-negative"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name missing distribution declarations fail closed; source line 2."
    },
    {
      "id": "evidence:runtime-observed-proof-21fdf50b2d0c000c3435",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-2118bb89-expected"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name pre-runtime invokes the strict checker; source line 3."
    },
    {
      "id": "evidence:runtime-observed-proof-38657b91c488918d4a4d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-2118bb89-negative"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name checker violations propagate a non-zero exit; source line 4."
    },
    {
      "id": "evidence:runtime-observed-proof-a89285fd636a932c4766",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-2020517d-expected"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name policy enforces final-run, duplicate, and budget limits; source line 5."
    },
    {
      "id": "evidence:runtime-observed-proof-a40311d70f208ac7e3ff",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-2020517d-negative"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name historical evidence is immutable and evaluation is read-only; source line 6."
    },
    {
      "id": "evidence:runtime-observed-proof-796b1daae7e1d2f3d924",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8140bff0-expected"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name workflow template declares retention assets; source line 7."
    },
    {
      "id": "evidence:runtime-observed-proof-810007b90e527085b718",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-8140bff0-negative"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name manifest and generated-project tests detect template drift; source line 8."
    },
    {
      "id": "evidence:runtime-observed-proof-cae6f2e0fb64f45df631",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4193ff31-expected"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name valid source and generated fixtures are characterized; source line 9."
    },
    {
      "id": "evidence:runtime-observed-proof-b96bb70db5fb2cb762cf",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-4193ff31-negative"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name every governed rejection mode is characterized; source line 10."
    },
    {
      "id": "evidence:runtime-observed-proof-35ea5e51bb31141557f9",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name local maintainer receives explicit PASS or FAIL output; source line 11."
    },
    {
      "id": "evidence:runtime-observed-proof-368decf87acfcfc5960a",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name standard verification retains its existing prefix and adds one gate; source line 12."
    },
    {
      "id": "evidence:runtime-observed-proof-0dfcd040b24cdfc9b068",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name checker starts no background work; source line 13."
    },
    {
      "id": "evidence:runtime-observed-proof-32533f0b0af995fb2bb7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name failure preserves the bounded repository state; source line 15."
    },
    {
      "id": "evidence:runtime-observed-proof-a04d5a72d28c79de64a8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name documentation records budgets and cleanup order; source line 16."
    },
    {
      "id": "evidence:runtime-observed-proof-fbde99566b8fd1fc4d6e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/evidence-retention.test.mjs tests/118-evidence-retention-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.414Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:c09420bea8e7a81d467406d068e45b05fd26368d7de5f6517c58ac17502bd134",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/118-evidence-retention-governance-obligations.test.mjs; test name task-specific evidence covers positive and negative paths; source line 17."
    },
    {
      "id": "evidence:runtime-observed-proof-8cd052c99e2471279ec0",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.496Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:9fae88f927c09283bb0e2f3ece30867b9620f91c059fa090992aea0ba7a7485e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-4fc48b98e6aaaa2377b3",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-118-evidence-retention-deduplication-r3/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T14:18:07.496Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:9fae88f927c09283bb0e2f3ece30867b9620f91c059fa090992aea0ba7a7485e",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:universe-93e4686c-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-372edf67d39d15fbaa23"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-93e4686c-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6308396ab9c94e2117dc"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-2118bb89-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-21fdf50b2d0c000c3435"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-2118bb89-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-38657b91c488918d4a4d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-2020517d-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a89285fd636a932c4766"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-2020517d-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a40311d70f208ac7e3ff"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8140bff0-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-796b1daae7e1d2f3d924"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-8140bff0-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-810007b90e527085b718"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4193ff31-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cae6f2e0fb64f45df631"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-4193ff31-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b96bb70db5fb2cb762cf"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-35ea5e51bb31141557f9"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-368decf87acfcfc5960a"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:background-work-integration-contract-check-scheduled-queued-retr",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0dfcd040b24cdfc9b068"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8cd052c99e2471279ec0",
        "evidence:runtime-observed-proof-4fc48b98e6aaaa2377b3"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation."
    },
    {
      "obligation_id": "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-32533f0b0af995fb2bb7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a04d5a72d28c79de64a8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fbde99566b8fd1fc4d6e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    }
  ],
  "business_universe_binding": {
    "required": "Yes",
    "routing_result": "REQUIRED_WITH_EVIDENCE",
    "business_universe_ref": "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
    "business_universe_digest": "sha256:9e2514fbde77b9a5b32d0da2f8cc0df1deda875a04c34ba75a4f996cef43b823",
    "business_universe_state": "COVERAGE_READY",
    "coverage_scenario_ids": [
      "coverage-scenario:066f1fee0cdbf5f993e4686c",
      "coverage-scenario:a109f7bce060ab502118bb89",
      "coverage-scenario:4959cf4953da04a02020517d",
      "coverage-scenario:c7983fd3a2b96b768140bff0",
      "coverage-scenario:b378ce917c0d0bb34193ff31"
    ],
    "coverage_mapping_status": "COMPLETE"
  },
  "scenario_coverage_map": [
    {
      "coverage_scenario_id": "coverage-scenario:066f1fee0cdbf5f993e4686c",
      "required_obligation_ids": [
        "verify:universe-93e4686c-expected",
        "verify:universe-93e4686c-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-93e4686c-expected",
        "verify:universe-93e4686c-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-372edf67d39d15fbaa23",
        "evidence:runtime-observed-proof-6308396ab9c94e2117dc"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:a109f7bce060ab502118bb89",
      "required_obligation_ids": [
        "verify:universe-2118bb89-expected",
        "verify:universe-2118bb89-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-2118bb89-expected",
        "verify:universe-2118bb89-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-21fdf50b2d0c000c3435",
        "evidence:runtime-observed-proof-38657b91c488918d4a4d"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:4959cf4953da04a02020517d",
      "required_obligation_ids": [
        "verify:universe-2020517d-expected",
        "verify:universe-2020517d-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-2020517d-expected",
        "verify:universe-2020517d-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a89285fd636a932c4766",
        "evidence:runtime-observed-proof-a40311d70f208ac7e3ff"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:c7983fd3a2b96b768140bff0",
      "required_obligation_ids": [
        "verify:universe-8140bff0-expected",
        "verify:universe-8140bff0-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-8140bff0-expected",
        "verify:universe-8140bff0-negative"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-796b1daae7e1d2f3d924",
        "evidence:runtime-observed-proof-810007b90e527085b718"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:b378ce917c0d0bb34193ff31",
      "required_obligation_ids": [
        "verify:universe-4193ff31-expected",
        "verify:universe-4193ff31-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-4193ff31-expected",
        "verify:universe-4193ff31-negative"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cae6f2e0fb64f45df631",
        "evidence:runtime-observed-proof-b96bb70db5fb2cb762cf"
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
        "evidence:runtime-observed-proof-fbde99566b8fd1fc4d6e"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fbde99566b8fd1fc4d6e"
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
