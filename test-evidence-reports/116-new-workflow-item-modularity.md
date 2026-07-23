# Test Evidence Report

## Human Summary

Test evidence state TEST_EVIDENCE_COMPLETE; 21/21 required obligations covered by 27 evidence item(s).

## User Request

- Request: modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes
- Task ref: `task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/116-new-workflow-item-modularity.md` | `VERIFICATION_PLAN_READY` | `sha256:3c9ecf1380da2efe1407e3a4d2a892d88ae4a053cc710b390e80d76acb2dfa26` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/116-new-workflow-item-modularity.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:b5c94a389405eb987cd51b1f105790cc1d4a05a50e30d0bff02fd80bb6d2ac99` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md` | `CHANGE_IMPACT_RECORDED` | `sha256:2cb7681b18ed9aa1c94ee961384f9279b70e574ad485b83c63e833237c8dd076` |
| `business_universe_coverage` | `RECORDED` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md` | `COVERAGE_READY` | `sha256:dbeb83d13aa2c4b91b254569ab469467b0c61ff0cde6be9cc63b19bdd3a8d884` |
| `control_effectiveness` | `RECORDED` | `artifact:control-effectiveness-reports/116-new-workflow-item-modularity.md` | `CONTROL_PROVEN_EFFECTIVE` | `sha256:abeb79b34425d17ef6ea1fc0e7b4947736dbebc101cb4d39cee8d51af2d8d4ac` |
| `verification_run_manifest` | `RECORDED` | `artifact:verification-run-manifests/116-new-workflow-item-modularity.md` | `RUNTIME_TRUST_COMPLETE` | `sha256:671ccb76490524bd69b75de287c56b1f016aab1cd73002c4d75de507f6fbf515` |

## Test Evidence Identity

- Test evidence ref: `artifact:test-evidence-reports/116-new-workflow-item-modularity.md`
- Test evidence digest: `sha256:db9d7d45139e3e9c1ae4d38d378df2228bf9572723ec8da6f56a4a9c2c032561`
- Verification plan ref: `artifact:verification-plans/116-new-workflow-item-modularity.md`
- Verification plan digest: `sha256:3c9ecf1380da2efe1407e3a4d2a892d88ae4a053cc710b390e80d76acb2dfa26`
- Intent digest: `sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e`

## Verification Plan Binding

- Verification plan state: `VERIFICATION_PLAN_READY`
- Required obligations: `21`
- Covered obligations: `21`
- Missing obligations: `0`

## Runtime Trust Binding

| Field | Value |
| --- | --- |
| Requirement | `REQUIRED` |
| Status | `VERIFIED` |
| Run Manifest | `artifact:verification-run-manifests/116-new-workflow-item-modularity.md` |
| Run ID | `vrun-116-new-workflow-item-modularity-r13` |
| Task Ref | `task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf` |
| Intent Digest | `sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e` |
| Runtime Trust Level | `ISOLATED_RUNTIME` |
| Current Project Match | `Yes` |
| Current Task Match | `Yes` |
| Current Intent Match | `Yes` |
| Current Verification Plan Match | `Yes` |
| Reason | The exact current run passed the authoritative checker and consumer identity checks. |

## Control Effectiveness Binding

- Requirement: `REQUIRED`
- Status: `VERIFIED`
- Report: `artifact:control-effectiveness-reports/116-new-workflow-item-modularity.md`
- Report digest: `sha256:abeb79b34425d17ef6ea1fc0e7b4947736dbebc101cb4d39cee8d51af2d8d4ac`
- Required claims: `claim:package-script-verify-candidate`, `claim:package-script-verify-consumer-chain-candidate`, `claim:file-scripts-check-adoption-assurance-mjs`, `claim:file-scripts-check-ai-workflow-mjs`, `claim:file-scripts-check-apply-execution-receipt-mjs`, `claim:file-scripts-check-apply-plan-mjs`, `claim:file-scripts-check-approval-record-mjs`, `claim:file-scripts-check-baseline-enforcement-mjs`
- Assessment outcome: `CONTROL_PROVEN_EFFECTIVE`
- Reason: The exact current report proves every relied-on bounded control claim.

## Business Universe Scenario Coverage

| Scenario ID | Required obligations | Covered obligations | Proof strength | Coverage state | Evidence IDs |
|---|---|---|---|---|---|
| `coverage-scenario:5d5dd7253dea631fb8dd1d9c` | `verify:universe-b8dd1d9c-expected`, `verify:universe-b8dd1d9c-negative` | `verify:universe-b8dd1d9c-expected`, `verify:universe-b8dd1d9c-negative` | `STRUCTURAL_SOURCE_PROOF` | `COVERED` | `evidence:runtime-observed-proof-b6fb37d2524a93f6d45e`, `evidence:runtime-observed-proof-2f19f9e11c7d348776a6` |
| `coverage-scenario:a23f1d0a5d1c735956d2048a` | `verify:universe-56d2048a-expected`, `verify:universe-56d2048a-negative` | `verify:universe-56d2048a-expected`, `verify:universe-56d2048a-negative` | `STRUCTURAL_SOURCE_PROOF` | `COVERED` | `evidence:runtime-observed-proof-e2de7fe82ecdaa4cf987`, `evidence:runtime-observed-proof-5d741fbad3f4c113a2b7` |
| `coverage-scenario:6cfe1456fd67ead5f7a09c69` | `verify:universe-f7a09c69-expected`, `verify:universe-f7a09c69-negative` | `verify:universe-f7a09c69-expected`, `verify:universe-f7a09c69-negative` | `STRUCTURAL_SOURCE_PROOF` | `COVERED` | `evidence:runtime-observed-proof-ff55c22a4a9802954480`, `evidence:runtime-observed-proof-801aa9600153325fa542` |
| `coverage-scenario:4e651a6e949e86963dba46f4` | `verify:universe-3dba46f4-expected`, `verify:universe-3dba46f4-negative` | `verify:universe-3dba46f4-expected`, `verify:universe-3dba46f4-negative` | `STRUCTURAL_SOURCE_PROOF` | `COVERED` | `evidence:runtime-observed-proof-5ccab8e48190c8466831`, `evidence:runtime-observed-proof-28311dc1cb9709896fb2` |
| `coverage-scenario:fca470fa395fd308540374ea` | `verify:universe-540374ea-expected`, `verify:universe-540374ea-negative` | `verify:universe-540374ea-expected`, `verify:universe-540374ea-negative` | `STRUCTURAL_SOURCE_PROOF` | `COVERED` | `evidence:runtime-observed-proof-0611bdefa2d5e619909b`, `evidence:runtime-observed-proof-15e2ffc4fc5cde1fa77f` |
| `coverage-scenario:bb941a6ee7bc281b6819b2ed` | `verify:universe-6819b2ed-expected`, `verify:universe-6819b2ed-negative` | `verify:universe-6819b2ed-expected`, `verify:universe-6819b2ed-negative` | `STRUCTURAL_SOURCE_PROOF` | `COVERED` | `evidence:runtime-observed-proof-474f7af15ead6f82396c`, `evidence:runtime-observed-proof-7753688356f76bc6e31b` |
| `coverage-scenario:75d81144f6ee703273185d04` | `verify:universe-73185d04-expected`, `verify:universe-73185d04-negative` | `verify:universe-73185d04-expected`, `verify:universe-73185d04-negative` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `evidence:runtime-observed-proof-34820933aab82a146531`, `evidence:runtime-observed-proof-f6fd9906cbc84b7428b5` |

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `runtime:self-runtime-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-negative.log` | node scripts/verification-runtime-self-service.mjs negative | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:020f3a617eac1f283925ae6282bdd7e0ab115b3bcc834ecc278dbf07968384d8` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-runtime-positive` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-positive.log` | node scripts/verification-runtime-self-service.mjs positive | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:ba8bc7e406cca934c993fb3fc931a0335c32f48245c5d3d917b8d371f5b4ffc8` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-candidate-verification` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-candidate-verification.log` | npm run verify:pre-runtime | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` |  | `sha256:bfd587e14db47c6e6c780da77a7b8b9d989b24fb0eb1446aa0c7192fd959125c` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-obligation-evidence` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr`, `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders`, `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb`, `verify:test-coverage-regression-smoke-task-specific-verification-exists`, `verify:universe-3dba46f4-expected`, `verify:universe-3dba46f4-negative`, `verify:universe-540374ea-expected`, `verify:universe-540374ea-negative`, `verify:universe-56d2048a-expected`, `verify:universe-56d2048a-negative`, `verify:universe-6819b2ed-expected`, `verify:universe-6819b2ed-negative`, `verify:universe-73185d04-expected`, `verify:universe-73185d04-negative`, `verify:universe-b8dd1d9c-expected`, `verify:universe-b8dd1d9c-negative`, `verify:universe-f7a09c69-expected`, `verify:universe-f7a09c69-negative`, `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af`, `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `runtime:self-current-runtime-behavior` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:d1812cbd6cc828fed3976237f25ac710e53fdb3f8f515abfb72b04289e2aa813` | N/A | Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window. |
| `evidence:runtime-observed-proof-245def1fc641e5bbfbb0` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:background-work-integration-contract-check-scheduled-queued-retr` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/116-new-workflow-item-governance-obligations.test.mjs; test name governance handoff starts no background worker; source line 1. |
| `evidence:runtime-observed-proof-38fb80fa1e2dd70b17aa` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/116-new-workflow-item-governance-obligations.test.mjs; test name recovery boundary remains explicit; source line 2. |
| `evidence:runtime-observed-proof-b6fb37d2524a93f6d45e` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-b8dd1d9c-expected` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name canonical registry remains complete and ordered; source line 5. |
| `evidence:runtime-observed-proof-2f19f9e11c7d348776a6` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-b8dd1d9c-negative` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name canonical registry drift remains rejected; source line 6. |
| `evidence:runtime-observed-proof-e2de7fe82ecdaa4cf987` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-56d2048a-expected` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name aliases retain canonical behavior; source line 7. |
| `evidence:runtime-observed-proof-5d741fbad3f4c113a2b7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-56d2048a-negative` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name unknown types remain rejected; source line 8. |
| `evidence:runtime-observed-proof-ff55c22a4a9802954480` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f7a09c69-expected` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name generated reference-bearing artifacts retain normalized content; source line 9. |
| `evidence:runtime-observed-proof-801aa9600153325fa542` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-f7a09c69-negative` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name missing required invocation context remains fail-closed; source line 10. |
| `evidence:runtime-observed-proof-5ccab8e48190c8466831` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3dba46f4-expected` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name normalized generated content remains byte-equivalent; source line 11. |
| `evidence:runtime-observed-proof-28311dc1cb9709896fb2` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-3dba46f4-negative` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name cross-type content drift remains detectable; source line 12. |
| `evidence:runtime-observed-proof-0611bdefa2d5e619909b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-540374ea-expected` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name successful invocation creates exactly one safe artifact; source line 13. |
| `evidence:runtime-observed-proof-15e2ffc4fc5cde1fa77f` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-540374ea-negative` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name existing targets remain fail-closed; source line 14. |
| `evidence:runtime-observed-proof-474f7af15ead6f82396c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6819b2ed-expected` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name success output and exit behavior remain locked; source line 15. |
| `evidence:runtime-observed-proof-7753688356f76bc6e31b` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-6819b2ed-negative` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name failed invocation cannot report success; source line 16. |
| `evidence:runtime-observed-proof-34820933aab82a146531` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-73185d04-expected` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name public entry replays every canonical type; source line 17. |
| `evidence:runtime-observed-proof-f6fd9906cbc84b7428b5` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:universe-73185d04-negative` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name executable parity remains mandatory; source line 18. |
| `evidence:runtime-observed-proof-a7144b98cf23435c970c` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name CLI user flow remains executable without a rendered UI; source line 19. |
| `evidence:runtime-observed-proof-2fdc84b458b0d1588de6` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name critical generator flow remains behavior-equivalent; source line 20. |
| `evidence:runtime-observed-proof-1bf195596294a1b87008` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name structural handoff boundary remains explicit; source line 21. |
| `evidence:runtime-observed-proof-b1ec9a14b52ec1145ba6` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log` | node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c` | N/A | Observed test target tests/new-workflow-item-characterization.test.mjs; test name task-specific characterization remains executable; source line 22. |
| `evidence:runtime-observed-proof-cf13946136b2aa105ff6` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:d1812cbd6cc828fed3976237f25ac710e53fdb3f8f515abfb72b04289e2aa813` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1. |
| `evidence:runtime-observed-proof-ca44532833e9fd444cc7` | `LOG_EXCERPT` | `PASSED` | `artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log` | node --test tests/113-runtime-behavior-evidence.test.mjs | IntentOS bounded verification runtime | ISOLATED_RUNTIME | `0` | `Yes` | `Yes` | `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `sha256:d1812cbd6cc828fed3976237f25ac710e53fdb3f8f515abfb72b04289e2aa813` | N/A | Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2. |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:universe-b8dd1d9c-expected` | `COVERED` | `evidence:runtime-observed-proof-b6fb37d2524a93f6d45e` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-b8dd1d9c-negative` | `COVERED` | `evidence:runtime-observed-proof-2f19f9e11c7d348776a6` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-56d2048a-expected` | `COVERED` | `evidence:runtime-observed-proof-e2de7fe82ecdaa4cf987` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-56d2048a-negative` | `COVERED` | `evidence:runtime-observed-proof-5d741fbad3f4c113a2b7` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f7a09c69-expected` | `COVERED` | `evidence:runtime-observed-proof-ff55c22a4a9802954480` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-f7a09c69-negative` | `COVERED` | `evidence:runtime-observed-proof-801aa9600153325fa542` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3dba46f4-expected` | `COVERED` | `evidence:runtime-observed-proof-5ccab8e48190c8466831` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-3dba46f4-negative` | `COVERED` | `evidence:runtime-observed-proof-28311dc1cb9709896fb2` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-540374ea-expected` | `COVERED` | `evidence:runtime-observed-proof-0611bdefa2d5e619909b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-540374ea-negative` | `COVERED` | `evidence:runtime-observed-proof-15e2ffc4fc5cde1fa77f` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6819b2ed-expected` | `COVERED` | `evidence:runtime-observed-proof-474f7af15ead6f82396c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-6819b2ed-negative` | `COVERED` | `evidence:runtime-observed-proof-7753688356f76bc6e31b` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-73185d04-expected` | `COVERED` | `evidence:runtime-observed-proof-34820933aab82a146531` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:universe-73185d04-negative` | `COVERED` | `evidence:runtime-observed-proof-f6fd9906cbc84b7428b5` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `COVERED` | `evidence:runtime-observed-proof-a7144b98cf23435c970c` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `COVERED` | `evidence:runtime-observed-proof-2fdc84b458b0d1588de6` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `COVERED` | `evidence:runtime-observed-proof-245def1fc641e5bbfbb0` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `COVERED` | `evidence:runtime-observed-proof-cf13946136b2aa105ff6`, `evidence:runtime-observed-proof-ca44532833e9fd444cc7` | A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation. |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `COVERED` | `evidence:runtime-observed-proof-38fb80fa1e2dd70b17aa` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `COVERED` | `evidence:runtime-observed-proof-1bf195596294a1b87008` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `COVERED` | `evidence:runtime-observed-proof-b1ec9a14b52ec1145ba6` | A passed observed log entry maps this obligation to a test target selected by the recorded command. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:generated-test-review-required` | `TEST_COVERAGE` | `SATISFIED` | `runtime:self-current-obligation-evidence`, `evidence:runtime-observed-proof-b1ec9a14b52ec1145ba6` | Evidence is mapped to related Verification Plan obligations. |
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:runtime-observed-proof-b1ec9a14b52ec1145ba6` | Evidence is mapped to related Verification Plan obligations. |

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
  "task_ref": "task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf",
  "intent": "modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes",
  "intent_digest": "sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e",
  "test_evidence_ref": "artifact:test-evidence-reports/116-new-workflow-item-modularity.md",
  "test_evidence_digest": "sha256:db9d7d45139e3e9c1ae4d38d378df2228bf9572723ec8da6f56a4a9c2c032561",
  "verification_plan_ref": "artifact:verification-plans/116-new-workflow-item-modularity.md",
  "verification_plan_digest": "sha256:3c9ecf1380da2efe1407e3a4d2a892d88ae4a053cc710b390e80d76acb2dfa26",
  "verification_plan_state": "VERIFICATION_PLAN_READY",
  "source_systems": [
    {
      "name": "verification_plan",
      "status": "RECORDED",
      "ref": "artifact:verification-plans/116-new-workflow-item-modularity.md",
      "source_outcome": "VERIFICATION_PLAN_READY",
      "digest": "sha256:3c9ecf1380da2efe1407e3a4d2a892d88ae4a053cc710b390e80d76acb2dfa26"
    },
    {
      "name": "business_rule_closure",
      "status": "RECORDED",
      "ref": "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
      "source_outcome": "READY_FOR_IMPACT_COVERAGE",
      "digest": "sha256:b5c94a389405eb987cd51b1f105790cc1d4a05a50e30d0bff02fd80bb6d2ac99"
    },
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "digest": "sha256:2cb7681b18ed9aa1c94ee961384f9279b70e574ad485b83c63e833237c8dd076"
    },
    {
      "name": "business_universe_coverage",
      "status": "RECORDED",
      "ref": "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
      "source_outcome": "COVERAGE_READY",
      "digest": "sha256:dbeb83d13aa2c4b91b254569ab469467b0c61ff0cde6be9cc63b19bdd3a8d884"
    },
    {
      "name": "control_effectiveness",
      "status": "RECORDED",
      "ref": "artifact:control-effectiveness-reports/116-new-workflow-item-modularity.md",
      "source_outcome": "CONTROL_PROVEN_EFFECTIVE",
      "digest": "sha256:abeb79b34425d17ef6ea1fc0e7b4947736dbebc101cb4d39cee8d51af2d8d4ac"
    },
    {
      "name": "verification_run_manifest",
      "status": "RECORDED",
      "ref": "artifact:verification-run-manifests/116-new-workflow-item-modularity.md",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "digest": "sha256:671ccb76490524bd69b75de287c56b1f016aab1cd73002c4d75de507f6fbf515"
    }
  ],
  "runtime_trust_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "run_manifest_ref": "artifact:verification-run-manifests/116-new-workflow-item-modularity.md",
    "run_manifest_digest": "sha256:671ccb76490524bd69b75de287c56b1f016aab1cd73002c4d75de507f6fbf515",
    "run_id": "vrun-116-new-workflow-item-modularity-r13",
    "task_ref": "task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf",
    "intent_digest": "sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e",
    "runtime_trust_level": "ISOLATED_RUNTIME",
    "runtime_plan_ref": "artifact:verification-runtime-plans/116-new-workflow-item-modularity.md",
    "runtime_plan_digest": "sha256:0cb43b70396d7c1df30def2740763ab763825520c02cd8033b328e9522200150",
    "lifecycle_plan_ref": "artifact:verification-runtime-lifecycle-plans/116-new-workflow-item-modularity.md",
    "lifecycle_plan_digest": "sha256:75bd9bb48b1890ca0c54aa7b208cf83271e6000f5a1b1bde99e7c5a20c5301ad",
    "verification_plan_ref": "artifact:verification-plans/116-new-workflow-item-modularity.md",
    "verification_plan_digest": "sha256:3c9ecf1380da2efe1407e3a4d2a892d88ae4a053cc710b390e80d76acb2dfa26",
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
    "report_ref": "artifact:control-effectiveness-reports/116-new-workflow-item-modularity.md",
    "report_digest": "sha256:abeb79b34425d17ef6ea1fc0e7b4947736dbebc101cb4d39cee8d51af2d8d4ac",
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
      "revision": "sha256:3097447006da6b73a1d03ff85c92856d4c68b2e0d488bc07d30ad3f208ed9807"
    },
    "task": {
      "task_ref": "task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf",
      "intent_digest": "sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e"
    },
    "sources": [
      {
        "ref": "artifact:verification-plans/116-new-workflow-item-modularity.md",
        "relative_path": "verification-plans/116-new-workflow-item-modularity.md",
        "raw_file_digest": "sha256:b9730d4c8635a6004b8f1ab6ffbd2214e00188f1400022e40632c5f660cd75e0"
      },
      {
        "ref": "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
        "relative_path": "business-rule-closures/116-new-workflow-item-modularity.md",
        "raw_file_digest": "sha256:224182b7c6f112e7cdec82be398076c8e83ab97c398a0150a9a7e522f23c1973"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md",
        "relative_path": "change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md",
        "raw_file_digest": "sha256:400a9c42ebfe742548111b32f90d1b3feeb66ab76c55b63751892a8c807d5efd"
      },
      {
        "ref": "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "relative_path": "business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "raw_file_digest": "sha256:3d13f226bd100ea40217d5883165f00dd535bd1939f20f8523b5a7ec51803a04"
      },
      {
        "ref": "artifact:control-effectiveness-reports/116-new-workflow-item-modularity.md",
        "relative_path": "control-effectiveness-reports/116-new-workflow-item-modularity.md",
        "raw_file_digest": "sha256:6e5398cdd1ddf2dc15984717e12d82fa53f71ab77e6d2556fe2ee092f0de1ddd"
      },
      {
        "ref": "artifact:verification-run-manifests/116-new-workflow-item-modularity.md",
        "relative_path": "verification-run-manifests/116-new-workflow-item-modularity.md",
        "raw_file_digest": "sha256:13e537d3143735b4b4db89d880b251b089f4cf36576551e10572e2148e42e730"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-negative.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-negative.log",
        "raw_file_digest": "sha256:020f3a617eac1f283925ae6282bdd7e0ab115b3bcc834ecc278dbf07968384d8"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-positive.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-positive.log",
        "raw_file_digest": "sha256:ba8bc7e406cca934c993fb3fc931a0335c32f48245c5d3d917b8d371f5b4ffc8"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-candidate-verification.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-candidate-verification.log",
        "raw_file_digest": "sha256:bfd587e14db47c6e6c780da77a7b8b9d989b24fb0eb1446aa0c7192fd959125c"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
        "raw_file_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c"
      },
      {
        "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log",
        "relative_path": "evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log",
        "raw_file_digest": "sha256:d1812cbd6cc828fed3976237f25ac710e53fdb3f8f515abfb72b04289e2aa813"
      }
    ]
  },
  "test_evidence_state": "TEST_EVIDENCE_COMPLETE",
  "evidence_items": [
    {
      "id": "runtime:self-runtime-negative",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-negative.log",
      "command": "node scripts/verification-runtime-self-service.mjs negative",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:47:27.362Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:020f3a617eac1f283925ae6282bdd7e0ab115b3bcc834ecc278dbf07968384d8",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-runtime-positive",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-runtime-positive.log",
      "command": "node scripts/verification-runtime-self-service.mjs positive",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:47:27.394Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:ba8bc7e406cca934c993fb3fc931a0335c32f48245c5d3d917b8d371f5b4ffc8",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-candidate-verification",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-candidate-verification.log",
      "command": "npm run verify:pre-runtime",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:31.199Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [],
      "output_digest": "sha256:bfd587e14db47c6e6c780da77a7b8b9d989b24fb0eb1446aa0c7192fd959125c",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-obligation-evidence",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr",
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
        "verify:test-coverage-regression-smoke-task-specific-verification-exists",
        "verify:universe-3dba46f4-expected",
        "verify:universe-3dba46f4-negative",
        "verify:universe-540374ea-expected",
        "verify:universe-540374ea-negative",
        "verify:universe-56d2048a-expected",
        "verify:universe-56d2048a-negative",
        "verify:universe-6819b2ed-expected",
        "verify:universe-6819b2ed-negative",
        "verify:universe-73185d04-expected",
        "verify:universe-73185d04-negative",
        "verify:universe-b8dd1d9c-expected",
        "verify:universe-b8dd1d9c-negative",
        "verify:universe-f7a09c69-expected",
        "verify:universe-f7a09c69-negative",
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "runtime:self-current-runtime-behavior",
      "evidence_type": "COMMAND_OUTPUT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.912Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:d1812cbd6cc828fed3976237f25ac710e53fdb3f8f515abfb72b04289e2aa813",
      "failure_reason": "N/A",
      "limitations": "Runtime execution proves observed behavior only for the recorded command, source, services, resources, and run window."
    },
    {
      "id": "evidence:runtime-observed-proof-245def1fc641e5bbfbb0",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:background-work-integration-contract-check-scheduled-queued-retr"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/116-new-workflow-item-governance-obligations.test.mjs; test name governance handoff starts no background worker; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-38fb80fa1e2dd70b17aa",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/116-new-workflow-item-governance-obligations.test.mjs; test name recovery boundary remains explicit; source line 2."
    },
    {
      "id": "evidence:runtime-observed-proof-b6fb37d2524a93f6d45e",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-b8dd1d9c-expected"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name canonical registry remains complete and ordered; source line 5."
    },
    {
      "id": "evidence:runtime-observed-proof-2f19f9e11c7d348776a6",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-b8dd1d9c-negative"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name canonical registry drift remains rejected; source line 6."
    },
    {
      "id": "evidence:runtime-observed-proof-e2de7fe82ecdaa4cf987",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-56d2048a-expected"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name aliases retain canonical behavior; source line 7."
    },
    {
      "id": "evidence:runtime-observed-proof-5d741fbad3f4c113a2b7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-56d2048a-negative"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name unknown types remain rejected; source line 8."
    },
    {
      "id": "evidence:runtime-observed-proof-ff55c22a4a9802954480",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f7a09c69-expected"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name generated reference-bearing artifacts retain normalized content; source line 9."
    },
    {
      "id": "evidence:runtime-observed-proof-801aa9600153325fa542",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-f7a09c69-negative"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name missing required invocation context remains fail-closed; source line 10."
    },
    {
      "id": "evidence:runtime-observed-proof-5ccab8e48190c8466831",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3dba46f4-expected"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name normalized generated content remains byte-equivalent; source line 11."
    },
    {
      "id": "evidence:runtime-observed-proof-28311dc1cb9709896fb2",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-3dba46f4-negative"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name cross-type content drift remains detectable; source line 12."
    },
    {
      "id": "evidence:runtime-observed-proof-0611bdefa2d5e619909b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-540374ea-expected"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name successful invocation creates exactly one safe artifact; source line 13."
    },
    {
      "id": "evidence:runtime-observed-proof-15e2ffc4fc5cde1fa77f",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-540374ea-negative"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name existing targets remain fail-closed; source line 14."
    },
    {
      "id": "evidence:runtime-observed-proof-474f7af15ead6f82396c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6819b2ed-expected"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name success output and exit behavior remain locked; source line 15."
    },
    {
      "id": "evidence:runtime-observed-proof-7753688356f76bc6e31b",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-6819b2ed-negative"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name failed invocation cannot report success; source line 16."
    },
    {
      "id": "evidence:runtime-observed-proof-34820933aab82a146531",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-73185d04-expected"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name public entry replays every canonical type; source line 17."
    },
    {
      "id": "evidence:runtime-observed-proof-f6fd9906cbc84b7428b5",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:universe-73185d04-negative"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name executable parity remains mandatory; source line 18."
    },
    {
      "id": "evidence:runtime-observed-proof-a7144b98cf23435c970c",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name CLI user flow remains executable without a rendered UI; source line 19."
    },
    {
      "id": "evidence:runtime-observed-proof-2fdc84b458b0d1588de6",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name critical generator flow remains behavior-equivalent; source line 20."
    },
    {
      "id": "evidence:runtime-observed-proof-1bf195596294a1b87008",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name structural handoff boundary remains explicit; source line 21."
    },
    {
      "id": "evidence:runtime-observed-proof-b1ec9a14b52ec1145ba6",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-obligation-evidence.log",
      "command": "node --test tests/new-workflow-item-characterization.test.mjs tests/116-new-workflow-item-governance-obligations.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.833Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:test-coverage-regression-smoke-task-specific-verification-exists"
      ],
      "output_digest": "sha256:beeb0875334c1b4c1715f52da60d61edaf80727071e552b17b39e514bd29817c",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/new-workflow-item-characterization.test.mjs; test name task-specific characterization remains executable; source line 22."
    },
    {
      "id": "evidence:runtime-observed-proof-cf13946136b2aa105ff6",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.912Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:d1812cbd6cc828fed3976237f25ac710e53fdb3f8f515abfb72b04289e2aa813",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name current run-owned service and data path complete a positive state transition; source line 1."
    },
    {
      "id": "evidence:runtime-observed-proof-ca44532833e9fd444cc7",
      "evidence_type": "LOG_EXCERPT",
      "result_state": "PASSED",
      "ref": "artifact:evidence/runtime-runs/vrun-116-new-workflow-item-modularity-r13/outputs/self-current-runtime-behavior.log",
      "command": "node --test tests/113-runtime-behavior-evidence.test.mjs",
      "owner": "IntentOS bounded verification runtime",
      "environment": "ISOLATED_RUNTIME",
      "ran_at": "2026-07-23T08:55:38.912Z",
      "exit_code": 0,
      "ran_after_change": "Yes",
      "current_task_match": "Yes",
      "covers_obligations": [
        "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-"
      ],
      "output_digest": "sha256:d1812cbd6cc828fed3976237f25ac710e53fdb3f8f515abfb72b04289e2aa813",
      "failure_reason": "N/A",
      "limitations": "Observed test target tests/113-runtime-behavior-evidence.test.mjs; test name stale and cross-run identities are rejected by the negative path; source line 2."
    }
  ],
  "coverage_map": [
    {
      "obligation_id": "verify:universe-b8dd1d9c-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b6fb37d2524a93f6d45e"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-b8dd1d9c-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2f19f9e11c7d348776a6"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-56d2048a-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e2de7fe82ecdaa4cf987"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-56d2048a-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5d741fbad3f4c113a2b7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f7a09c69-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ff55c22a4a9802954480"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-f7a09c69-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-801aa9600153325fa542"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3dba46f4-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5ccab8e48190c8466831"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-3dba46f4-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-28311dc1cb9709896fb2"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-540374ea-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0611bdefa2d5e619909b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-540374ea-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-15e2ffc4fc5cde1fa77f"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6819b2ed-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-474f7af15ead6f82396c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-6819b2ed-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-7753688356f76bc6e31b"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-73185d04-expected",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-34820933aab82a146531"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:universe-73185d04-negative",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-f6fd9906cbc84b7428b5"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-a7144b98cf23435c970c"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:user-flow-regression-smoke-existing-critical-flow-still-works-af",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-2fdc84b458b0d1588de6"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:background-work-integration-contract-check-scheduled-queued-retr",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-245def1fc641e5bbfbb0"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-cf13946136b2aa105ff6",
        "evidence:runtime-observed-proof-ca44532833e9fd444cc7"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed test entry from the authoritative current Verification Run Manifest covers this exact obligation."
    },
    {
      "obligation_id": "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-38fb80fa1e2dd70b17aa"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-1bf195596294a1b87008"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    },
    {
      "obligation_id": "verify:test-coverage-regression-smoke-task-specific-verification-exists",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b1ec9a14b52ec1145ba6"
      ],
      "verification_plan_required": "Yes",
      "reason": "A passed observed log entry maps this obligation to a test target selected by the recorded command."
    }
  ],
  "business_universe_binding": {
    "required": "Yes",
    "routing_result": "REQUIRED_WITH_EVIDENCE",
    "business_universe_ref": "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
    "business_universe_digest": "sha256:dbeb83d13aa2c4b91b254569ab469467b0c61ff0cde6be9cc63b19bdd3a8d884",
    "business_universe_state": "COVERAGE_READY",
    "coverage_scenario_ids": [
      "coverage-scenario:5d5dd7253dea631fb8dd1d9c",
      "coverage-scenario:a23f1d0a5d1c735956d2048a",
      "coverage-scenario:6cfe1456fd67ead5f7a09c69",
      "coverage-scenario:4e651a6e949e86963dba46f4",
      "coverage-scenario:fca470fa395fd308540374ea",
      "coverage-scenario:bb941a6ee7bc281b6819b2ed",
      "coverage-scenario:75d81144f6ee703273185d04"
    ],
    "coverage_mapping_status": "COMPLETE"
  },
  "scenario_coverage_map": [
    {
      "coverage_scenario_id": "coverage-scenario:5d5dd7253dea631fb8dd1d9c",
      "required_obligation_ids": [
        "verify:universe-b8dd1d9c-expected",
        "verify:universe-b8dd1d9c-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-b8dd1d9c-expected",
        "verify:universe-b8dd1d9c-negative"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b6fb37d2524a93f6d45e",
        "evidence:runtime-observed-proof-2f19f9e11c7d348776a6"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:a23f1d0a5d1c735956d2048a",
      "required_obligation_ids": [
        "verify:universe-56d2048a-expected",
        "verify:universe-56d2048a-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-56d2048a-expected",
        "verify:universe-56d2048a-negative"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-e2de7fe82ecdaa4cf987",
        "evidence:runtime-observed-proof-5d741fbad3f4c113a2b7"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:6cfe1456fd67ead5f7a09c69",
      "required_obligation_ids": [
        "verify:universe-f7a09c69-expected",
        "verify:universe-f7a09c69-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-f7a09c69-expected",
        "verify:universe-f7a09c69-negative"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-ff55c22a4a9802954480",
        "evidence:runtime-observed-proof-801aa9600153325fa542"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:4e651a6e949e86963dba46f4",
      "required_obligation_ids": [
        "verify:universe-3dba46f4-expected",
        "verify:universe-3dba46f4-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-3dba46f4-expected",
        "verify:universe-3dba46f4-negative"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-5ccab8e48190c8466831",
        "evidence:runtime-observed-proof-28311dc1cb9709896fb2"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:fca470fa395fd308540374ea",
      "required_obligation_ids": [
        "verify:universe-540374ea-expected",
        "verify:universe-540374ea-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-540374ea-expected",
        "verify:universe-540374ea-negative"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-0611bdefa2d5e619909b",
        "evidence:runtime-observed-proof-15e2ffc4fc5cde1fa77f"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:bb941a6ee7bc281b6819b2ed",
      "required_obligation_ids": [
        "verify:universe-6819b2ed-expected",
        "verify:universe-6819b2ed-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-6819b2ed-expected",
        "verify:universe-6819b2ed-negative"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-474f7af15ead6f82396c",
        "evidence:runtime-observed-proof-7753688356f76bc6e31b"
      ]
    },
    {
      "coverage_scenario_id": "coverage-scenario:75d81144f6ee703273185d04",
      "required_obligation_ids": [
        "verify:universe-73185d04-expected",
        "verify:universe-73185d04-negative"
      ],
      "covered_obligation_ids": [
        "verify:universe-73185d04-expected",
        "verify:universe-73185d04-negative"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "coverage_state": "COVERED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-34820933aab82a146531",
        "evidence:runtime-observed-proof-f6fd9906cbc84b7428b5"
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
        "evidence:runtime-observed-proof-b1ec9a14b52ec1145ba6"
      ],
      "reason": "Evidence is mapped to related Verification Plan obligations."
    },
    {
      "id": "control:broad-command-not-proof",
      "applies_to": "TEST_COVERAGE",
      "status": "SATISFIED",
      "evidence_ids": [
        "evidence:runtime-observed-proof-b1ec9a14b52ec1145ba6"
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
