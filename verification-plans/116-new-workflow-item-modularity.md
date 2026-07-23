# Verification Plan

## Human Summary

Verification state VERIFICATION_PLAN_READY; 6 affected surfaces require 21 obligations, including 18 blocking obligations.

## User Request

- Request: modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes
- Task ref: `task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/116-new-workflow-item-modularity.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:b5c94a389405eb987cd51b1f105790cc1d4a05a50e30d0bff02fd80bb6d2ac99` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md` | `CHANGE_IMPACT_RECORDED` | `sha256:2cb7681b18ed9aa1c94ee961384f9279b70e574ad485b83c63e833237c8dd076` |
| `business_universe_coverage` | `RECORDED` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md` | `COVERAGE_READY` | `sha256:dbeb83d13aa2c4b91b254569ab469467b0c61ff0cde6be9cc63b19bdd3a8d884` |
| `control_effectiveness` | `RECORDED` | `artifact:control-effectiveness-reports/116-new-workflow-item-modularity.md` | `CONTROL_PROVEN_EFFECTIVE` | `sha256:abeb79b34425d17ef6ea1fc0e7b4947736dbebc101cb4d39cee8d51af2d8d4ac` |

## Control Effectiveness Binding

- Requirement: `REQUIRED`
- Status: `VERIFIED`
- Report: `artifact:control-effectiveness-reports/116-new-workflow-item-modularity.md`
- Required claims: `claim:package-script-verify-candidate`, `claim:package-script-verify-consumer-chain-candidate`, `claim:file-scripts-check-adoption-assurance-mjs`, `claim:file-scripts-check-ai-workflow-mjs`, `claim:file-scripts-check-apply-execution-receipt-mjs`, `claim:file-scripts-check-apply-plan-mjs`, `claim:file-scripts-check-approval-record-mjs`, `claim:file-scripts-check-baseline-enforcement-mjs`
- Reason: The exact current report proves every relied-on bounded control claim.

## Verification Plan Identity

- Verification plan ref: `artifact:verification-plans/116-new-workflow-item-modularity.md`
- Verification plan digest: `sha256:3c9ecf1380da2efe1407e3a4d2a892d88ae4a053cc710b390e80d76acb2dfa26`
- Intent digest: `sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e`

## Project Calibration

- Project level: `BL1`
- Platform profiles: `generic`
- Change kind: `REFACTOR`
- Risk domains: `modularize-scripts-new-workflow-item-mjs`, `release`

## Affected Surface Inputs

| Surface | Status | Reason | Expected Evidence |
|---|---|---|---|
| `TEST_COVERAGE` | `REQUIRED` | The change needs evidence that required behavior was checked. | Unit, integration, smoke, behavior, fixture, or manual evidence. |
| `DOCS_HANDOFF` | `REQUIRED` | The rule and any exclusions need to be understandable later. | Docs, handoff note, final report, or decision record. |
| `USER_FLOW` | `REQUIRED` | A task-bound Business Universe scenario changes project-native behavior. | Project-native behavior evidence mapped to exact coverage scenario IDs. |
| `DATA_MODEL` | `NOT_APPLICABLE` | No data model or persistence change is indicated by current wording. | Reason recorded. |
| `PERMISSION_RISK` | `NOT_APPLICABLE` | No permission, privacy, payment, or compliance change is indicated by current wording. | Reason recorded. |
| `RELEASE_IMPACT` | `NOT_APPLICABLE` | No release, deployment, rollback, or production change is indicated by current wording. | Reason recorded. |
| `BACKGROUND_WORK` | `REQUIRED` | The change touches asynchronous, scheduled, queued, or background execution. | Worker/job trigger, idempotency, retry, and failure-path evidence. |
| `RUNTIME_BEHAVIOR` | `REQUIRED` | The change touches runtime process, service, session, cache, container, or startup behavior. | Current-run service identity and runtime behavior evidence. |
| `ROLLBACK_RECOVERY` | `REQUIRED` | The change can require rollback, restore, compensation, retry, or recovery behavior. | Rollback or recovery path plus failure-safe evidence. |

## Verification Obligations

| ID | Surface | Type | Required | Priority | Behavior Under Test | Expected Evidence | Broad Command Only | Source Refs | Coverage Scenario IDs | Required Proof Strength |
|---|---|---|---|---|---|---|---|---|---|---|
| `verify:universe-b8dd1d9c-expected` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | All 63 canonical artifact types retain their ordered directory, template, and default-name registration. | Current-source structural evidence proves the expected path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a` | `coverage-scenario:5d5dd7253dea631fb8dd1d9c` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-b8dd1d9c-negative` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | No registered type may disappear, reorder, or silently change its target contract. | Current-source structural evidence proves the negative, reverse, failure, or compensation path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a` | `coverage-scenario:5d5dd7253dea631fb8dd1d9c` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-56d2048a-expected` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | All 223 aliases resolve to the same canonical types before generation. | Current-source structural evidence proves the expected path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a` | `coverage-scenario:a23f1d0a5d1c735956d2048a` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-56d2048a-negative` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Unknown types remain rejected and aliases may not redirect to a different canonical type. | Current-source structural evidence proves the negative, reverse, failure, or compensation path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a` | `coverage-scenario:a23f1d0a5d1c735956d2048a` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-f7a09c69-expected` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Explicit and inferred request, preflight, spec, eval, task, log, and review-context references remain unchanged. | Current-source structural evidence proves the expected path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a`, `locator:f0c275dd42b817430a82de6d`, `locator:b1420ad3fe75951d951eeeeb` | `coverage-scenario:6cfe1456fd67ead5f7a09c69` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-f7a09c69-negative` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Missing or mismatched references retain their existing failure or fallback behavior. | Current-source structural evidence proves the negative, reverse, failure, or compensation path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a`, `locator:f0c275dd42b817430a82de6d`, `locator:b1420ad3fe75951d951eeeeb` | `coverage-scenario:6cfe1456fd67ead5f7a09c69` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-3dba46f4-expected` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Template selection, frontmatter, placeholder filling, and final file content remain byte-equivalent after normalization. | Current-source structural evidence proves the expected path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a`, `locator:dec7dea398ea7e0ce6330b1f` | `coverage-scenario:4e651a6e949e86963dba46f4` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-3dba46f4-negative` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | No filler may omit fields, change ordering, or introduce cross-type content drift. | Current-source structural evidence proves the negative, reverse, failure, or compensation path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a`, `locator:dec7dea398ea7e0ce6330b1f` | `coverage-scenario:4e651a6e949e86963dba46f4` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-540374ea-expected` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Exactly one safe project-relative artifact is created for a successful invocation. | Current-source structural evidence proves the expected path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a`, `locator:b1420ad3fe75951d951eeeeb` | `coverage-scenario:fca470fa395fd308540374ea` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-540374ea-negative` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Existing targets, unsafe paths, and invalid writes remain fail-closed without partial output. | Current-source structural evidence proves the negative, reverse, failure, or compensation path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a`, `locator:b1420ad3fe75951d951eeeeb` | `coverage-scenario:fca470fa395fd308540374ea` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-6819b2ed-expected` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Terminal streams, messages, and exit codes remain unchanged for success and failure paths. | Current-source structural evidence proves the expected path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a` | `coverage-scenario:bb941a6ee7bc281b6819b2ed` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-6819b2ed-negative` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | A failed invocation may not report success or leave a retry-obscuring partial artifact. | Current-source structural evidence proves the negative, reverse, failure, or compensation path. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:2622d9bd4435dd84c69c971a` | `coverage-scenario:bb941a6ee7bc281b6819b2ed` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-73185d04-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | The public entry is replayed across every canonical type plus representative aliases and negative cases. | A project-native test proves the expected path against the current task and code. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:7a8412edb11429e1acf915e5` | `coverage-scenario:75d81144f6ee703273185d04` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-73185d04-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Static structure alone cannot substitute for executable behavior parity. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md`, `locator:7a8412edb11429e1acf915e5` | `coverage-scenario:75d81144f6ee703273185d04` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `USER_FLOW` | `UI_INTERACTION_TEST` | `Yes` | `BLOCKING` | The primary user flow follows the requested rule. | Behavior, screen, or journey evidence for the success path. | `No` | `artifact:business-rule-closures/116-new-workflow-item-modularity.md`, `artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `USER_FLOW` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | Existing critical flow still works after the change. | Task-specific smoke evidence mapped to this flow. | `No` | `artifact:business-rule-closures/116-new-workflow-item-modularity.md`, `artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `BACKGROUND_WORK` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Scheduled, queued, retried, or asynchronous work preserves the current business rule and remains idempotent. | Current-task worker, scheduler, retry, duplicate-delivery, and failure-path evidence. | `No` | `artifact:business-rule-closures/116-new-workflow-item-modularity.md`, `artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `RUNTIME_BEHAVIOR` | `REGRESSION_SMOKE` | `Yes` | `BLOCKING` | The current code runs through the intended service, process, or platform path without stale-runtime substitution. | Runtime-trusted current-task evidence bound to the current code, service identity, environment, and command output. | `No` | `artifact:business-rule-closures/116-new-workflow-item-modularity.md`, `artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `ROLLBACK_RECOVERY` | `RELEASE_SMOKE_CHECK` | `Yes` | `BLOCKING` | Failure, interruption, rollback, and recovery preserve or restore the exact bounded state. | Current-task rollback or recovery proof including partial-failure and ownership-safe cleanup behavior. | `No` | `artifact:business-rule-closures/116-new-workflow-item-modularity.md`, `artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `DOCS_HANDOFF` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | The rule and exclusions are understandable for future work. | Handoff, doc update, or final report evidence. | `No` | `artifact:business-rule-closures/116-new-workflow-item-modularity.md`, `artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `TEST_COVERAGE` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | Task-specific verification exists beyond broad command success. | Specific obligation-to-evidence mapping; broad commands alone are not enough. | `No` | `artifact:business-rule-closures/116-new-workflow-item-modularity.md`, `artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md` | N/A | `NOT_APPLICABLE` |

## Test Correctness Controls

| ID | Applies To | Required | Reason |
|---|---|---|---|
| `control:generated-test-review-required` | `TEST_COVERAGE` | `Yes` | High-risk or BL2 work needs review signals for Codex-generated tests. |
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
  "schema_version": "1.110.0",
  "artifact_type": "verification_plan",
  "task_ref": "task:f54c065e8052a39e362ee5f674b77d6e8e0a1a25bd3dbe8254f9c5d5f5a997bf",
  "intent": "modularize scripts/new-workflow-item.mjs into focused internal modules while preserving workflow state, registered artifact types, aliases, generated paths, frontmatter, references, file content, terminal output, and exit codes",
  "intent_digest": "sha256:b8fc9217232c11eec220e5608964159059e5efaeb97b9e094c563e7beee03d9e",
  "verification_plan_ref": "artifact:verification-plans/116-new-workflow-item-modularity.md",
  "verification_plan_digest": "sha256:3c9ecf1380da2efe1407e3a4d2a892d88ae4a053cc710b390e80d76acb2dfa26",
  "business_rule_ref": "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
  "business_rule_digest": "sha256:b5c94a389405eb987cd51b1f105790cc1d4a05a50e30d0bff02fd80bb6d2ac99",
  "business_rule_state": "READY_FOR_IMPACT_COVERAGE",
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
  "impact_ref": "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md",
  "impact_digest": "sha256:2cb7681b18ed9aa1c94ee961384f9279b70e574ad485b83c63e833237c8dd076",
  "source_systems": [
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
    }
  ],
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
      }
    ]
  },
  "project_level": "BL1",
  "platform_profiles": [
    "generic"
  ],
  "change_kind": "REFACTOR",
  "risk_domains": [
    "modularize-scripts-new-workflow-item-mjs",
    "release"
  ],
  "verification_state": "VERIFICATION_PLAN_READY",
  "affected_surfaces": [
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
    },
    {
      "surface": "USER_FLOW",
      "status": "REQUIRED",
      "reason": "A task-bound Business Universe scenario changes project-native behavior.",
      "expected_evidence": "Project-native behavior evidence mapped to exact coverage scenario IDs."
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
      "surface": "BACKGROUND_WORK",
      "status": "REQUIRED",
      "reason": "The change touches asynchronous, scheduled, queued, or background execution.",
      "expected_evidence": "Worker/job trigger, idempotency, retry, and failure-path evidence."
    },
    {
      "surface": "RUNTIME_BEHAVIOR",
      "status": "REQUIRED",
      "reason": "The change touches runtime process, service, session, cache, container, or startup behavior.",
      "expected_evidence": "Current-run service identity and runtime behavior evidence."
    },
    {
      "surface": "ROLLBACK_RECOVERY",
      "status": "REQUIRED",
      "reason": "The change can require rollback, restore, compensation, retry, or recovery behavior.",
      "expected_evidence": "Rollback or recovery path plus failure-safe evidence."
    }
  ],
  "verification_obligations": [
    {
      "id": "verify:universe-b8dd1d9c-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "All 63 canonical artifact types retain their ordered directory, template, and default-name registration.",
      "expected_evidence": "Current-source structural evidence proves the expected path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:5d5dd7253dea631fb8dd1d9c"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-b8dd1d9c-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "No registered type may disappear, reorder, or silently change its target contract.",
      "expected_evidence": "Current-source structural evidence proves the negative, reverse, failure, or compensation path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:5d5dd7253dea631fb8dd1d9c"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-56d2048a-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "All 223 aliases resolve to the same canonical types before generation.",
      "expected_evidence": "Current-source structural evidence proves the expected path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:a23f1d0a5d1c735956d2048a"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-56d2048a-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Unknown types remain rejected and aliases may not redirect to a different canonical type.",
      "expected_evidence": "Current-source structural evidence proves the negative, reverse, failure, or compensation path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:a23f1d0a5d1c735956d2048a"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-f7a09c69-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Explicit and inferred request, preflight, spec, eval, task, log, and review-context references remain unchanged.",
      "expected_evidence": "Current-source structural evidence proves the expected path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a",
        "locator:f0c275dd42b817430a82de6d",
        "locator:b1420ad3fe75951d951eeeeb"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:6cfe1456fd67ead5f7a09c69"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-f7a09c69-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Missing or mismatched references retain their existing failure or fallback behavior.",
      "expected_evidence": "Current-source structural evidence proves the negative, reverse, failure, or compensation path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a",
        "locator:f0c275dd42b817430a82de6d",
        "locator:b1420ad3fe75951d951eeeeb"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:6cfe1456fd67ead5f7a09c69"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-3dba46f4-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Template selection, frontmatter, placeholder filling, and final file content remain byte-equivalent after normalization.",
      "expected_evidence": "Current-source structural evidence proves the expected path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a",
        "locator:dec7dea398ea7e0ce6330b1f"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:4e651a6e949e86963dba46f4"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-3dba46f4-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "No filler may omit fields, change ordering, or introduce cross-type content drift.",
      "expected_evidence": "Current-source structural evidence proves the negative, reverse, failure, or compensation path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a",
        "locator:dec7dea398ea7e0ce6330b1f"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:4e651a6e949e86963dba46f4"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-540374ea-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Exactly one safe project-relative artifact is created for a successful invocation.",
      "expected_evidence": "Current-source structural evidence proves the expected path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a",
        "locator:b1420ad3fe75951d951eeeeb"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:fca470fa395fd308540374ea"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-540374ea-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Existing targets, unsafe paths, and invalid writes remain fail-closed without partial output.",
      "expected_evidence": "Current-source structural evidence proves the negative, reverse, failure, or compensation path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a",
        "locator:b1420ad3fe75951d951eeeeb"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:fca470fa395fd308540374ea"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-6819b2ed-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Terminal streams, messages, and exit codes remain unchanged for success and failure paths.",
      "expected_evidence": "Current-source structural evidence proves the expected path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:bb941a6ee7bc281b6819b2ed"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-6819b2ed-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "A failed invocation may not report success or leave a retry-obscuring partial artifact.",
      "expected_evidence": "Current-source structural evidence proves the negative, reverse, failure, or compensation path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:2622d9bd4435dd84c69c971a"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:bb941a6ee7bc281b6819b2ed"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-73185d04-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "The public entry is replayed across every canonical type plus representative aliases and negative cases.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:7a8412edb11429e1acf915e5"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:75d81144f6ee703273185d04"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-73185d04-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Static structure alone cannot substitute for executable behavior parity.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-universe-coverage-reports/116-new-workflow-item-modularity.md",
        "locator:7a8412edb11429e1acf915e5"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:75d81144f6ee703273185d04"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
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
        "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [],
      "required_proof_strength": "NOT_APPLICABLE"
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
        "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [],
      "required_proof_strength": "NOT_APPLICABLE"
    },
    {
      "id": "verify:background-work-integration-contract-check-scheduled-queued-retr",
      "source_surface": "BACKGROUND_WORK",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Scheduled, queued, retried, or asynchronous work preserves the current business rule and remains idempotent.",
      "expected_evidence": "Current-task worker, scheduler, retry, duplicate-delivery, and failure-path evidence.",
      "test_correctness_risk": "Happy-path execution can miss retries, duplicate delivery, ordering, and idempotency failures.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md"
      ],
      "owner": "codex",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [],
      "required_proof_strength": "NOT_APPLICABLE"
    },
    {
      "id": "verify:runtime-behavior-regression-smoke-the-current-code-runs-through-",
      "source_surface": "RUNTIME_BEHAVIOR",
      "verification_type": "REGRESSION_SMOKE",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "The current code runs through the intended service, process, or platform path without stale-runtime substitution.",
      "expected_evidence": "Runtime-trusted current-task evidence bound to the current code, service identity, environment, and command output.",
      "test_correctness_risk": "Static or stale-process evidence can pass without exercising the current code and environment.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md"
      ],
      "owner": "codex",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [],
      "required_proof_strength": "NOT_APPLICABLE"
    },
    {
      "id": "verify:rollback-recovery-release-smoke-check-failure-interruption-rollb",
      "source_surface": "ROLLBACK_RECOVERY",
      "verification_type": "RELEASE_SMOKE_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Failure, interruption, rollback, and recovery preserve or restore the exact bounded state.",
      "expected_evidence": "Current-task rollback or recovery proof including partial-failure and ownership-safe cleanup behavior.",
      "test_correctness_risk": "Success-path tests can miss interruption, partial write, unsafe cleanup, and failed restoration.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md"
      ],
      "owner": "codex",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [],
      "required_proof_strength": "NOT_APPLICABLE"
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
        "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [],
      "required_proof_strength": "NOT_APPLICABLE"
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
        "artifact:business-rule-closures/116-new-workflow-item-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-116-new-workflow-item-modularity.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [],
      "required_proof_strength": "NOT_APPLICABLE"
    }
  ],
  "test_correctness_controls": [
    {
      "id": "control:generated-test-review-required",
      "applies_to": "TEST_COVERAGE",
      "required": "Yes",
      "reason": "High-risk or BL2 work needs review signals for Codex-generated tests."
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
