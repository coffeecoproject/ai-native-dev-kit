# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 18/18 required obligations covered by 31 evidence item(s).

## User Request

- Request: modularize scripts/resolve-operating-loop.mjs into cohesive internal modules while preserving workflow state, public CLI arguments, command output, subprocess ordering, exit codes, generated-project distribution, and resolver behavior
- Task ref: `task:8076c2a8a25ff7cf3510a05e8fe5654511690bc16aa43429a0b680daf0643630`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/119-resolve-operating-loop-modularity.md` | `VERIFICATION_PLAN_READY` | `sha256:2181d7df613ddfdc8bc46aee2ddb8973b1c8a3ecc9e0e4f67d5346ff751f3192` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/119-resolve-operating-loop-modularity.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:3223e0bb342b23e98a1e7f13be27c40cb570a99bae66b2052d4ee31c017b7dae` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-119-resolve-operating-loop-modularity.md` | `CHANGE_IMPACT_RECORDED` | `sha256:128a0915a3e83c37a64814b3d2ada00ba53551a627ee882598774ce178cc4aa5` |
| `business_universe_coverage` | `RECORDED` | `business-universe-coverage-reports/119-resolve-operating-loop-modularity.md` | `COVERAGE_READY` | `sha256:f1f330a3b6a7bdf863176aa842635318b9fdf553c8099be36f4389ea6dfca6a1` |
| `control_effectiveness` | `RECORDED` | `artifact:control-effectiveness-reports/119-resolve-operating-loop-modularity.md` | `CONTROL_PROVEN_EFFECTIVE` | `sha256:323ee25bde76eca528828e4ab796948cbe070a84b870fb845277b602a414db69` |
| `verification_run_manifest` | `RECORDED` | `artifact:verification-run-manifests/119-resolve-operating-loop-modularity.md` | `RUNTIME_TRUST_COMPLETE` | `sha256:b6b217888e17857dc5e3cf6747dc1b3afdbbc110207f62f0f0e5dc0a67ac74f5` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/119-resolve-operating-loop-modularity.md`
- Test evidence digest: `sha256:f1f9000fc71f3668760b1b8325442e37192769c046332bf627c41b790542e219`
- Verification plan ref: `artifact:verification-plans/119-resolve-operating-loop-modularity.md`
- Verification plan digest: `sha256:2181d7df613ddfdc8bc46aee2ddb8973b1c8a3ecc9e0e4f67d5346ff751f3192`
- Intent digest: `sha256:7c2e387d1e68deeaa956cdd690e69b3965d294aa1e7b4f65e4933002da307e4c`

## Verification Plan Binding

- Verification plan state: `VERIFICATION_PLAN_READY`
- Required obligations: `18`
- Covered obligations: `18`
- Missing obligations: `0`

## Runtime Trust Binding

| Field | Value |
| --- | --- |
| Requirement | `REQUIRED` |
| Status | `VERIFIED` |
| Run Manifest | `artifact:verification-run-manifests/119-resolve-operating-loop-modularity.md` |
| Run ID | `vrun-119-resolve-operating-loop-modularity-r49` |
| Task Ref | `task:8076c2a8a25ff7cf3510a05e8fe5654511690bc16aa43429a0b680daf0643630` |
| Intent Digest | `sha256:7c2e387d1e68deeaa956cdd690e69b3965d294aa1e7b4f65e4933002da307e4c` |
| Runtime Trust Level | `ISOLATED_RUNTIME` |
| Current Project Match | `Yes` |
| Current Task Match | `Yes` |
| Current Intent Match | `Yes` |
| Current Verification Plan Match | `Yes` |
| Reason | The exact current run passed the authoritative checker and consumer identity checks. |

## Control Effectiveness Binding

- Requirement: `REQUIRED`
- Status: `VERIFIED`
- Report: `artifact:control-effectiveness-reports/119-resolve-operating-loop-modularity.md`
- Report digest: `sha256:323ee25bde76eca528828e4ab796948cbe070a84b870fb845277b602a414db69`
- Required claims: `claim:package-script-verify-candidate`, `claim:package-script-verify-consumer-chain-candidate`, `claim:file-scripts-check-adoption-assurance-mjs`, `claim:file-scripts-check-ai-workflow-mjs`, `claim:file-scripts-check-apply-execution-receipt-mjs`, `claim:file-scripts-check-apply-plan-mjs`, `claim:file-scripts-check-approval-record-mjs`, `claim:file-scripts-check-baseline-enforcement-mjs`
- Assessment outcome: `CONTROL_PROVEN_EFFECTIVE`
- Reason: The exact current report proves every relied-on bounded control claim.

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
| `coverage-scenario:54d5e4301d4c6638bf60f92e` | `verify:universe-bf60f92e-expected`, `verify:universe-bf60f92e-negative` | `verify:universe-bf60f92e-expected`, `verify:universe-bf60f92e-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-703dfab4965065f258a4`, `evidence:runtime-observed-proof-9bf05a3d0a64991aeeee` |
| `coverage-scenario:ecfcf7c958bb154d7ec23da9` | `verify:universe-7ec23da9-expected`, `verify:universe-7ec23da9-negative` | `verify:universe-7ec23da9-expected`, `verify:universe-7ec23da9-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-dc630192e15c78f445f8`, `evidence:runtime-observed-proof-fddce5575acac274cbc6` |
| `coverage-scenario:31cc3db857547fa9a3a9cbeb` | `verify:universe-a3a9cbeb-expected`, `verify:universe-a3a9cbeb-negative` | `verify:universe-a3a9cbeb-expected`, `verify:universe-a3a9cbeb-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-6a2b3fe699ee6c5e8724`, `evidence:runtime-observed-proof-bb3314afb6e6ad482afc` |
| `coverage-scenario:3ab1bd0537b3500e5517624a` | `verify:universe-5517624a-expected`, `verify:universe-5517624a-negative` | `verify:universe-5517624a-expected`, `verify:universe-5517624a-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-8f225615a16b09184942`, `evidence:runtime-observed-proof-ee123534c279a911ea2d` |
| `coverage-scenario:9bf19075a1d696dfaa06199b` | `verify:universe-aa06199b-expected`, `verify:universe-aa06199b-negative` | `verify:universe-aa06199b-expected`, `verify:universe-aa06199b-negative` | `STRUCTURAL_SOURCE_PROOF` | `COVERED` | `evidence:runtime-observed-proof-252b3c18cd0253e03125`, `evidence:runtime-observed-proof-3196822c10e408ff0d03` |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `runtime:self-runtime-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-runtime-negative.log` | node scripts/verification-runtime-self-service.mjs negative | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:d654604c2dca8fb114e24d49c283d1388e77db716a4ba505ee985e0986eff8c9` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-runtime-positive` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-runtime-positive.log` | node scripts/verification-runtime-self-service.mjs positive | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:4170019e48c801921d419524264b9b27a49659d1c0270a7ebeae38750dc3bda7` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-syntax` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-syntax.log` | npm run verify:syntax | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:8f2cc3b93d173e3426da27108fd63abea86cf46bbe6ea80f8eb5a28c479aa94c` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-consumer-syntax` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-consumer-syntax.log` | npm run verify:consumer-syntax | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:dc21f590749635488d3a7570f8ebb09f1565848865534d600e77ea2e20badae4` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-runtime-trust-core` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-trust-core.log` | npm run verify:runtime-trust:core | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:192ad5e0378b14c0b1fda722be2a9acfe159ff7af7cbe5bd5b2bfafd720b4822` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-evidence-retention` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-evidence-retention.log` | npm run verify:evidence-retention | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:0ecd72b9dfd7d6eecb6074f3822ec39780d39cfafc272471bf3bfe016ed9527c` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-governance-core` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-governance-core.log` | node --test tests/control-effectiveness.test.mjs tests/understanding-planning-closure.test.mjs tests/business-universe-coverage.test.mjs tests/manifest-authority.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:505e6243dbd937a829ceec95e54375cea6504e9f39f772d80cc0be39da4af22b` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-operating-core` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-operating-core.log` | node --test tests/operating-model.test.mjs tests/operating-entry-trust.test.mjs tests/review-context-authority.test.mjs tests/active-guidance-distribution-closeout.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:fa6426409b3366cb1837d4f61c1701575f9e3c557ad4b73a756c3cfa8c21fad2` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-distribution-trust` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-distribution-trust.log` | node --test tests/execution-distribution-trust.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:69c95386faf4eeccfc49bafc5eb0f53c8e644892e2a7175a579217f8b3e120e2` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-release-topology-consumer` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-release-topology-consumer.log` | node --test tests/release-topology-consumer.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:fb6e56b4f48481dfe6254946d3f2d01642c4fa8c5c36c2043e81a67188c4b61e` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-obligation-evidence` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr`, `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:release-impact-release-smoke-check-release-rollback-monitoring-o`, `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb`, `verify:test-coverage-regression-smoke-task-specific-verification-exists`, `verify:universe-5517624a-expected`, `verify:universe-5517624a-negative`, `verify:universe-7ec23da9-expected`, `verify:universe-7ec23da9-negative`, `verify:universe-a3a9cbeb-expected`, `verify:universe-a3a9cbeb-negative`, `verify:universe-aa06199b-expected`, `verify:universe-aa06199b-negative`, `verify:universe-bf60f92e-expected`, `verify:universe-bf60f92e-negative`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af`, `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-runtime-behavior` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:7ee63f76b3ead2fb4ffc68d458fb40da804ecc34a373766092116bbab2cc3d28` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `evidence:runtime-observed-proof-703dfab4965065f258a4` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-bf60f92e-expected` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name generated projects receive every operating-loop module; source line 1. |
| `evidence:runtime-observed-proof-9bf05a3d0a64991aeeee` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-bf60f92e-negative` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name missing distribution declarations remain fail-closed; source line 2. |
| `evidence:runtime-observed-proof-dc630192e15c78f445f8` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7ec23da9-expected` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name source orchestration preserves ordered consumers; source line 3. |
| `evidence:runtime-observed-proof-fddce5575acac274cbc6` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-7ec23da9-negative` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name source failures remain visible and non-zero; source line 4. |
| `evidence:runtime-observed-proof-6a2b3fe699ee6c5e8724` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a3a9cbeb-expected` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name public entry retains every internal contract; source line 5. |
| `evidence:runtime-observed-proof-bb3314afb6e6ad482afc` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-a3a9cbeb-negative` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name public failure and unknown-mode paths remain characterized; source line 6. |
| `evidence:runtime-observed-proof-8f225615a16b09184942` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-5517624a-expected` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name self-check consumes modular source graphs; source line 7. |
| `evidence:runtime-observed-proof-ee123534c279a911ea2d` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-5517624a-negative` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name extracted modules cannot hide legacy markers; source line 8. |
| `evidence:runtime-observed-proof-252b3c18cd0253e03125` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-aa06199b-expected` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name structural budgets and exports are enforced; source line 9. |
| `evidence:runtime-observed-proof-3196822c10e408ff0d03` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-aa06199b-negative` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name dependency and distribution regressions are rejected; source line 10. |
| `evidence:runtime-observed-proof-a39131c045bd9b5dea56` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name CLI flow remains executable without a rendered UI; source line 11. |
| `evidence:runtime-observed-proof-ee7fb34ddad6a4337713` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name characteristic coverage retains existing critical modes; source line 12. |
| `evidence:runtime-observed-proof-6cb79d40acd7ca084f4e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name split modules start no background work; source line 13. |
| `evidence:runtime-observed-proof-9bf0584c15f490b8fe7b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name split is a reversible internal boundary; source line 14. |
| `evidence:runtime-observed-proof-80521d8af04ad6ab62bf` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name structural batch remains source-only and performs no external release; source line 15. |
| `evidence:runtime-observed-proof-d6105dce91b530b96b09` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name plan records structural and non-authorizing boundaries; source line 16. |
| `evidence:runtime-observed-proof-84b5ea0432ff3c525c27` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log` | node --test tests/119-operating-loop-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25` | N/A | Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name task-specific positive and reverse proofs are mapped; source line 17. |
| `evidence:runtime-observed-proof-f4f612f14709ce647852` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:7ee63f76b3ead2fb4ffc68d458fb40da804ecc34a373766092116bbab2cc3d28` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1. |
| `evidence:runtime-observed-proof-aee4765e1175ccb134b2` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:7ee63f76b3ead2fb4ffc68d458fb40da804ecc34a373766092116bbab2cc3d28` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:universe-bf60f92e-expected` | `COVERED` | `evidence:runtime-observed-proof-703dfab4965065f258a4` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-bf60f92e-negative` | `COVERED` | `evidence:runtime-observed-proof-9bf05a3d0a64991aeeee` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7ec23da9-expected` | `COVERED` | `evidence:runtime-observed-proof-dc630192e15c78f445f8` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-7ec23da9-negative` | `COVERED` | `evidence:runtime-observed-proof-fddce5575acac274cbc6` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a3a9cbeb-expected` | `COVERED` | `evidence:runtime-observed-proof-6a2b3fe699ee6c5e8724` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-a3a9cbeb-negative` | `COVERED` | `evidence:runtime-observed-proof-bb3314afb6e6ad482afc` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-5517624a-expected` | `COVERED` | `evidence:runtime-observed-proof-8f225615a16b09184942` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-5517624a-negative` | `COVERED` | `evidence:runtime-observed-proof-ee123534c279a911ea2d` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-aa06199b-expected` | `COVERED` | `evidence:runtime-observed-proof-252b3c18cd0253e03125` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-aa06199b-negative` | `COVERED` | `evidence:runtime-observed-proof-3196822c10e408ff0d03` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:runtime-observed-proof-a39131c045bd9b5dea56` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:runtime-observed-proof-ee7fb34ddad6a4337713` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `COVERED` | `evidence:runtime-observed-proof-80521d8af04ad6ab62bf` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `COVERED` | `evidence:runtime-observed-proof-6cb79d40acd7ca084f4e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `COVERED` | `evidence:runtime-observed-proof-f4f612f14709ce647852`, `evidence:runtime-observed-proof-aee4765e1175ccb134b2` | A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation. |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `COVERED` | `evidence:runtime-observed-proof-9bf0584c15f490b8fe7b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:runtime-observed-proof-d6105dce91b530b96b09` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:runtime-observed-proof-84b5ea0432ff3c525c27` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:generated-test-review-required` | `TEST_COVERAGE` | `SATISFIED` | `runtime:self-current-obligation-evidence`, `evidence:runtime-observed-proof-84b5ea0432ff3c525c27` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:runtime-observed-proof-84b5ea0432ff3c525c27` | Evidence is mapped to related Verification Plan obligations. |

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
  "task_ref": "task:8076c2a8a25ff7cf3510a05e8fe5654511690bc16aa43429a0b680daf0643630",
  "intent": "modularize scripts/resolve-operating-loop.mjs into cohesive internal modules while preserving workflow state, public CLI arguments, command output, subprocess ordering, exit codes, generated-project distribution, and resolver behavior",
  "intent_digest": "sha256:7c2e387d1e68deeaa956cdd690e69b3965d294aa1e7b4f65e4933002da307e4c",
  "test_evidence_ref": "artifact:test-evidence-reports/119-resolve-operating-loop-modularity.md",
  "test_evidence_digest": "sha256:f1f9000fc71f3668760b1b8325442e37192769c046332bf627c41b790542e219",
  "verification_plan_ref": "artifact:verification-plans/119-resolve-operating-loop-modularity.md",
  "verification_plan_digest": "sha256:2181d7df613ddfdc8bc46aee2ddb8973b1c8a3ecc9e0e4f67d5346ff751f3192",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/119-resolve-operating-loop-modularity.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:2181d7df613ddfdc8bc46aee2ddb8973b1c8a3ecc9e0e4f67d5346ff751f3192"
    },
    {
      "name": "business_rule_closure",
      "status": "RECORDED",
      "ref": "artifact:business-rule-closures/119-resolve-operating-loop-modularity.md",
      "source_outcome": "READY_FOR_IMPACT_COVERAGE",
      "digest": "sha256:3223e0bb342b23e98a1e7f13be27c40cb570a99bae66b2052d4ee31c017b7dae"
    },
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/preflight-119-resolve-operating-loop-modularity.md",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "digest": "sha256:128a0915a3e83c37a64814b3d2ada00ba53551a627ee882598774ce178cc4aa5"
    },
    {
      "name": "business_universe_coverage",
      "status": "RECORDED",
      "ref": "business-universe-coverage-reports/119-resolve-operating-loop-modularity.md",
      "source_outcome": "COVERAGE_READY",
      "digest": "sha256:f1f330a3b6a7bdf863176aa842635318b9fdf553c8099be36f4389ea6dfca6a1"
    },
    {
      "name": "control_effectiveness",
      "status": "RECORDED",
      "ref": "artifact:control-effectiveness-reports/119-resolve-operating-loop-modularity.md",
      "source_outcome": "CONTROL_PROVEN_EFFECTIVE",
      "digest": "sha256:323ee25bde76eca528828e4ab796948cbe070a84b870fb845277b602a414db69"
    },
    {
      "name": "verification_run_manifest",
      "status": "RECORDED",
      "ref": "artifact:verification-run-manifests/119-resolve-operating-loop-modularity.md",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "digest": "sha256:b6b217888e17857dc5e3cf6747dc1b3afdbbc110207f62f0f0e5dc0a67ac74f5"
    }
  ],
  "runtime_trust_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "run_manifest_ref": "artifact:verification-run-manifests/119-resolve-operating-loop-modularity.md",
    "run_manifest_digest": "sha256:b6b217888e17857dc5e3cf6747dc1b3afdbbc110207f62f0f0e5dc0a67ac74f5",
    "run_id": "vrun-119-resolve-operating-loop-modularity-r49",
    "task_ref": "task:8076c2a8a25ff7cf3510a05e8fe5654511690bc16aa43429a0b680daf0643630",
    "intent_digest": "sha256:7c2e387d1e68deeaa956cdd690e69b3965d294aa1e7b4f65e4933002da307e4c",
    "runtime_trust_level": "ISOLATED_RUNTIME",
    "runtime_plan_ref": "artifact:verification-runtime-plans/119-resolve-operating-loop-modularity.md",
    "runtime_plan_digest": "sha256:8b2942e266a3f4ab543495e8077b4a9e9fe46f19ff241c6ba432a74dbe15f6fd",
    "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/119-resolve-operating-loop-modularity.md",
    "lifecycle_plan_digest": "sha256:f0acaa7f69160c14221d84fa338a64839f2f26c3285791c2c51b99349cd39e77",
    "verification_plan_ref": "artifact:verification-plans/119-resolve-operating-loop-modularity.md",
    "verification_plan_digest": "sha256:2181d7df613ddfdc8bc46aee2ddb8973b1c8a3ecc9e0e4f67d5346ff751f3192",
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
    "report_ref": "artifact:control-effectiveness-reports/119-resolve-operating-loop-modularity.md",
    "report_digest": "sha256:323ee25bde76eca528828e4ab796948cbe070a84b870fb845277b602a414db69",
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
      "revision": "sha256:7094b242ab450c9916bd008d6ae0e2df66503edd1893815abf5391d4135456b4"
    },
    "task": {
      "task_ref": "task:8076c2a8a25ff7cf3510a05e8fe5654511690bc16aa43429a0b680daf0643630",
      "intent_digest": "sha256:7c2e387d1e68deeaa956cdd690e69b3965d294aa1e7b4f65e4933002da307e4c"
    },
    "sources": [
      {
        "ref": "artifact:verification-plans/119-resolve-operating-loop-modularity.md",
        "relative_path": "verification-plans/119-resolve-operating-loop-modularity.md",
        "raw_file_digest": "sha256:be417b023ae4f0c5092a36a1b124d57be709a74f3b7bef9e71b44b0a00d46af0"
      },
      {
        "ref": "artifact:business-rule-closures/119-resolve-operating-loop-modularity.md",
        "relative_path": "business-rule-closures/119-resolve-operating-loop-modularity.md",
        "raw_file_digest": "sha256:21585ffe8ac44bcc15389b0bee0a4b6412ca40f4cad231a70bb0ec5220ddca93"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/preflight-119-resolve-operating-loop-modularity.md",
        "relative_path": "change-impact-coverage-reports/preflight-119-resolve-operating-loop-modularity.md",
        "raw_file_digest": "sha256:2d58c5ffb1c4dbe90c86388d4720764ebee3249a87a59fbf375aea80fae22ecd"
      },
      {
        "ref": "artifact:control-effectiveness-reports/119-resolve-operating-loop-modularity.md",
        "relative_path": "control-effectiveness-reports/119-resolve-operating-loop-modularity.md",
        "raw_file_digest": "sha256:8de8046d604473d1252ed2f74354ed83a40cbd2016ce639fc080807f74b8d92e"
      },
      {
        "ref": "artifact:verification-run-manifests/119-resolve-operating-loop-modularity.md",
        "relative_path": "verification-run-manifests/119-resolve-operating-loop-modularity.md",
        "raw_file_digest": "sha256:84c7b411ba8d23a55f7da8af48b0fc56b7d6c2ee5bc10853c5776ab9f0ae567a"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:d654604c2dca8fb114e24d49c283d1388e77db716a4ba505ee985e0986eff8c9"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:4170019e48c801921d419524264b9b27a49659d1c0270a7ebeae38750dc3bda7"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-syntax.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-syntax.log",
        "raw_file_digest": "sha256:8f2cc3b93d173e3426da27108fd63abea86cf46bbe6ea80f8eb5a28c479aa94c"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-consumer-syntax.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-consumer-syntax.log",
        "raw_file_digest": "sha256:dc21f590749635488d3a7570f8ebb09f1565848865534d600e77ea2e20badae4"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-trust-core.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-trust-core.log",
        "raw_file_digest": "sha256:192ad5e0378b14c0b1fda722be2a9acfe159ff7af7cbe5bd5b2bfafd720b4822"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-evidence-retention.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-evidence-retention.log",
        "raw_file_digest": "sha256:0ecd72b9dfd7d6eecb6074f3822ec39780d39cfafc272471bf3bfe016ed9527c"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-governance-core.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-governance-core.log",
        "raw_file_digest": "sha256:505e6243dbd937a829ceec95e54375cea6504e9f39f772d80cc0be39da4af22b"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-operating-core.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-operating-core.log",
        "raw_file_digest": "sha256:fa6426409b3366cb1837d4f61c1701575f9e3c557ad4b73a756c3cfa8c21fad2"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-distribution-trust.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-distribution-trust.log",
        "raw_file_digest": "sha256:69c95386faf4eeccfc49bafc5eb0f53c8e644892e2a7175a579217f8b3e120e2"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-release-topology-consumer.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-release-topology-consumer.log",
        "raw_file_digest": "sha256:fb6e56b4f48481dfe6254946d3f2d01642c4fa8c5c36c2043e81a67188c4b61e"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:7ee63f76b3ead2fb4ffc68d458fb40da804ecc34a373766092116bbab2cc3d28"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "runtime:self-runtime-negative",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-runtime-negative.log",
      "command": "node scripts/verification-runtime-self-service.mjs negative",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:24:43.455Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:d654604c2dca8fb114e24d49c283d1388e77db716a4ba505ee985e0986eff8c9",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-runtime-positive",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-runtime-positive.log",
      "command": "node scripts/verification-runtime-self-service.mjs positive",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:24:43.486Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:4170019e48c801921d419524264b9b27a49659d1c0270a7ebeae38750dc3bda7",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-syntax",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-syntax.log",
      "command": "npm run verify:syntax",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:24:47.529Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:8f2cc3b93d173e3426da27108fd63abea86cf46bbe6ea80f8eb5a28c479aa94c",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-consumer-syntax",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-consumer-syntax.log",
      "command": "npm run verify:consumer-syntax",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:25:22.530Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:dc21f590749635488d3a7570f8ebb09f1565848865534d600e77ea2e20badae4",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-runtime-trust-core",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-trust-core.log",
      "command": "npm run verify:runtime-trust:core",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:26:36.250Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:192ad5e0378b14c0b1fda722be2a9acfe159ff7af7cbe5bd5b2bfafd720b4822",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-evidence-retention",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-evidence-retention.log",
      "command": "npm run verify:evidence-retention",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:26:47.376Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:0ecd72b9dfd7d6eecb6074f3822ec39780d39cfafc272471bf3bfe016ed9527c",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-governance-core",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-governance-core.log",
      "command": "node --test tests/control-effectiveness.test.mjs tests/understanding-planning-closure.test.mjs tests/business-universe-coverage.test.mjs tests/manifest-authority.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:27:04.675Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:505e6243dbd937a829ceec95e54375cea6504e9f39f772d80cc0be39da4af22b",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-operating-core",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-operating-core.log",
      "command": "node --test tests/operating-model.test.mjs tests/operating-entry-trust.test.mjs tests/review-context-authority.test.mjs tests/active-guidance-distribution-closeout.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:32:47.383Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:fa6426409b3366cb1837d4f61c1701575f9e3c557ad4b73a756c3cfa8c21fad2",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-distribution-trust",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-distribution-trust.log",
      "command": "node --test tests/execution-distribution-trust.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:32.736Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:69c95386faf4eeccfc49bafc5eb0f53c8e644892e2a7175a579217f8b3e120e2",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-release-topology-consumer",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-release-topology-consumer.log",
      "command": "node --test tests/release-topology-consumer.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.794Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:fb6e56b4f48481dfe6254946d3f2d01642c4fa8c5c36c2043e81a67188c4b61e",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-obligation-evidence",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-5517624a-expected",
        "verify:universe-5517624a-negative",
        "verify:universe-7ec23da9-expected",
        "verify:universe-7ec23da9-negative",
        "verify:universe-a3a9cbeb-expected",
        "verify:universe-a3a9cbeb-negative",
        "verify:universe-aa06199b-expected",
        "verify:universe-aa06199b-negative",
        "verify:universe-bf60f92e-expected",
        "verify:universe-bf60f92e-negative",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-runtime-behavior",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.954Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:7ee63f76b3ead2fb4ffc68d458fb40da804ecc34a373766092116bbab2cc3d28",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "evidence:runtime-observed-proof-703dfab4965065f258a4",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-bf60f92e-expected"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name generated projects receive every operating-loop module; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-9bf05a3d0a64991aeeee",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-bf60f92e-negative"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name missing distribution declarations remain fail-closed; source line 2."
    },
    {
      "id": "evidence:runtime-observed-proof-dc630192e15c78f445f8",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7ec23da9-expected"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name source orchestration preserves ordered consumers; source line 3."
    },
    {
      "id": "evidence:runtime-observed-proof-fddce5575acac274cbc6",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-7ec23da9-negative"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name source failures remain visible and non-zero; source line 4."
    },
    {
      "id": "evidence:runtime-observed-proof-6a2b3fe699ee6c5e8724",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a3a9cbeb-expected"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name public entry retains every internal contract; source line 5."
    },
    {
      "id": "evidence:runtime-observed-proof-bb3314afb6e6ad482afc",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-a3a9cbeb-negative"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name public failure and unknown-mode paths remain characterized; source line 6."
    },
    {
      "id": "evidence:runtime-observed-proof-8f225615a16b09184942",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-5517624a-expected"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name self-check consumes modular source graphs; source line 7."
    },
    {
      "id": "evidence:runtime-observed-proof-ee123534c279a911ea2d",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-5517624a-negative"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name extracted modules cannot hide legacy markers; source line 8."
    },
    {
      "id": "evidence:runtime-observed-proof-252b3c18cd0253e03125",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-aa06199b-expected"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name structural budgets and exports are enforced; source line 9."
    },
    {
      "id": "evidence:runtime-observed-proof-3196822c10e408ff0d03",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-aa06199b-negative"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name dependency and distribution regressions are rejected; source line 10."
    },
    {
      "id": "evidence:runtime-observed-proof-a39131c045bd9b5dea56",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name CLI flow remains executable without a rendered UI; source line 11."
    },
    {
      "id": "evidence:runtime-observed-proof-ee7fb34ddad6a4337713",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name characteristic coverage retains existing critical modes; source line 12."
    },
    {
      "id": "evidence:runtime-observed-proof-6cb79d40acd7ca084f4e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name split modules start no background work; source line 13."
    },
    {
      "id": "evidence:runtime-observed-proof-9bf0584c15f490b8fe7b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name split is a reversible internal boundary; source line 14."
    },
    {
      "id": "evidence:runtime-observed-proof-80521d8af04ad6ab62bf",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:release-impact-release-smoke-check-release-rollback-monitoring-o"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name structural batch remains source-only and performs no external release; source line 15."
    },
    {
      "id": "evidence:runtime-observed-proof-d6105dce91b530b96b09",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name plan records structural and non-authorizing boundaries; source line 16."
    },
    {
      "id": "evidence:runtime-observed-proof-84b5ea0432ff3c525c27",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/119-operating-loop-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.881Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:1e1dffa4c05be17212682c89f3558bea754553ac4c9d0ae04c1d06261cd1de25",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/119-operating-loop-governance-obligations.test.mjs; test name task-specific positive and reverse proofs are mapped; source line 17."
    },
    {
      "id": "evidence:runtime-observed-proof-f4f612f14709ce647852",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.954Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:7ee63f76b3ead2fb4ffc68d458fb40da804ecc34a373766092116bbab2cc3d28",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-aee4765e1175ccb134b2",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-119-resolve-operating-loop-modularity-r49/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-25T13:34:34.954Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:7ee63f76b3ead2fb4ffc68d458fb40da804ecc34a373766092116bbab2cc3d28",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:universe-bf60f92e-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-703dfab4965065f258a4"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-bf60f92e-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9bf05a3d0a64991aeeee"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7ec23da9-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-dc630192e15c78f445f8"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-7ec23da9-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-fddce5575acac274cbc6"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a3a9cbeb-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6a2b3fe699ee6c5e8724"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-a3a9cbeb-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-bb3314afb6e6ad482afc"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-5517624a-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8f225615a16b09184942"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-5517624a-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ee123534c279a911ea2d"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-aa06199b-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-252b3c18cd0253e03125"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-aa06199b-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-3196822c10e408ff0d03"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a39131c045bd9b5dea56"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ee7fb34ddad6a4337713"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-80521d8af04ad6ab62bf"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:background-work-integration-contract-check-scheduled-queued-retr",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6cb79d40acd7ca084f4e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f4f612f14709ce647852",
        "evidence:runtime-observed-proof-aee4765e1175ccb134b2"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation."
    },
    {
      "obligation_id": "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-9bf0584c15f490b8fe7b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-d6105dce91b530b96b09"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-84b5ea0432ff3c525c27"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    }
  ],
  "business_universe_binding": {
    "required": "Yes",
    "routing_result": "REQUIRED_WITH_EVIDENCE",
    "business_universe_ref": "business-universe-coverage-reports/119-resolve-operating-loop-modularity.md",
    "business_universe_digest": "sha256:f1f330a3b6a7bdf863176aa842635318b9fdf553c8099be36f4389ea6dfca6a1",
    "business_universe_state": "COVERAGE_READY",
    "coverage_scenario_ids": [
      "coverage-scenario:54d5e4301d4c6638bf60f92e",
      "coverage-scenario:ecfcf7c958bb154d7ec23da9",
      "coverage-scenario:31cc3db857547fa9a3a9cbeb",
      "coverage-scenario:3ab1bd0537b3500e5517624a",
      "coverage-scenario:9bf19075a1d696dfaa06199b"
    ],
    "coverage_mapping_status": "COMPLETE"
  },
  "scenario_coverage_map": [
    {
      "coverage_scenario_id": "coverage-scenario:54d5e4301d4c6638bf60f92e",
      "required_obligation_ids": [
        "verify:universe-bf60f92e-expected",
        "verify:universe-bf60f92e-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-bf60f92e-expected",
        "verify:universe-bf60f92e-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-703dfab4965065f258a4",
        "evidence:runtime-observed-proof-9bf05a3d0a64991aeeee"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:ecfcf7c958bb154d7ec23da9",
      "required_obligation_ids": [
        "verify:universe-7ec23da9-expected",
        "verify:universe-7ec23da9-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-7ec23da9-expected",
        "verify:universe-7ec23da9-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-dc630192e15c78f445f8",
        "evidence:runtime-observed-proof-fddce5575acac274cbc6"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:31cc3db857547fa9a3a9cbeb",
      "required_obligation_ids": [
        "verify:universe-a3a9cbeb-expected",
        "verify:universe-a3a9cbeb-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-a3a9cbeb-expected",
        "verify:universe-a3a9cbeb-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-6a2b3fe699ee6c5e8724",
        "evidence:runtime-observed-proof-bb3314afb6e6ad482afc"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:3ab1bd0537b3500e5517624a",
      "required_obligation_ids": [
        "verify:universe-5517624a-expected",
        "verify:universe-5517624a-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-5517624a-expected",
        "verify:universe-5517624a-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-8f225615a16b09184942",
        "evidence:runtime-observed-proof-ee123534c279a911ea2d"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:9bf19075a1d696dfaa06199b",
      "required_obligation_ids": [
        "verify:universe-aa06199b-expected",
        "verify:universe-aa06199b-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-aa06199b-expected",
        "verify:universe-aa06199b-negative"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-252b3c18cd0253e03125",
        "evidence:runtime-observed-proof-3196822c10e408ff0d03"
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
        "evidence:runtime-observed-proof-84b5ea0432ff3c525c27"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-84b5ea0432ff3c525c27"
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
