# Verification Plan

## Human Summary

Verification state VERIFICATION_PLAN_READY; 7 affected surfaces require 26 obligations, including 23 blocking obligations.

## User Request

- Request: modularize scripts/init-project.mjs into focused internal modules while preserving CLI arguments, output, plan and receipt formats, mutation ordering, rollback behavior, and exit codes
- Task ref: `task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/115-init-project-modularity.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:ecd8231f572d0c14ae11e29c1c1e84830c1f35b8d504013d17ec0b49501480fc` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | `CHANGE_IMPACT_RECORDED` | `sha256:f2ef5bb6f318c90b83e3a53899fcb6cab1ba61a885e563aadaaea191e970fc29` |
| `business_universe_coverage` | `RECORDED` | `business-universe-coverage-reports/115-init-project-modularity.md` | `COVERAGE_READY` | `sha256:9b6b440a74d414e59be7f4755ef84f0adc7bd6746a0cf23313a346c88f00af86` |
| `control_effectiveness` | `RECORDED` | `artifact:control-effectiveness-reports/115-init-project-modularity.md` | `CONTROL_PROVEN_EFFECTIVE` | `sha256:0bc352601aee287a2ca7bda78436af8fad6b1aab1422dfab2f7e3630671f9081` |

## Control Effectiveness Binding

- Requirement: `REQUIRED`
- Status: `VERIFIED`
- Report: `artifact:control-effectiveness-reports/115-init-project-modularity.md`
- Required claims: `claim:package-script-verify-candidate`, `claim:package-script-verify-consumer-chain-candidate`, `claim:package-script-verify-planning-closure`, `claim:file-scripts-check-adoption-assurance-mjs`, `claim:file-scripts-check-ai-workflow-mjs`, `claim:file-scripts-check-apply-execution-receipt-mjs`, `claim:file-scripts-check-apply-plan-mjs`, `claim:file-scripts-check-approval-record-mjs`
- Reason: The exact current report proves every relied-on bounded control claim.

## Verification Plan Identity

- Verification plan ref: `artifact:verification-plans/115-init-project-modularity.md`
- Verification plan digest: `sha256:0fce1a7acacd420fe207617a33d2b2b5a6eb409e5d18fc180ea786c1e4716e5d`
- Intent digest: `sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435`

## Project Calibration

- Project level: `BL1`
- Platform profiles: `generic`
- Change kind: `REFACTOR`
- Risk domains: `modularize-scripts-init-project-mjs-into`, `release`

## Affected Surface Inputs

| Surface | Status | Reason | Expected Evidence |
|---|---|---|---|
| `TEST_COVERAGE` | `REQUIRED` | The change needs evidence that required behavior was checked. | Unit, integration, smoke, behavior, fixture, or manual evidence. |
| `DOCS_HANDOFF` | `REQUIRED` | The rule and any exclusions need to be understandable later. | Docs, handoff note, final report, or decision record. |
| `USER_FLOW` | `REQUIRED` | A task-bound Business Universe scenario changes project-native behavior. | Project-native behavior evidence mapped to exact coverage scenario IDs. |
| `DATA_MODEL` | `NOT_APPLICABLE` | No data model or persistence change is indicated by current wording. | Reason recorded. |
| `PERMISSION_RISK` | `NOT_APPLICABLE` | No permission, privacy, payment, or compliance change is indicated by current wording. | Reason recorded. |
| `RELEASE_IMPACT` | `REQUIRED` | Deployment, rollback, migration, or production behavior may be affected. | Release, rollback, and monitoring evidence, or a project-native explicit exclusion. Concrete external execution still requires real-world consent. |
| `BACKGROUND_WORK` | `REQUIRED` | The change touches asynchronous, scheduled, queued, or background execution. | Worker/job trigger, idempotency, retry, and failure-path evidence. |
| `RUNTIME_BEHAVIOR` | `REQUIRED` | The change touches runtime process, service, session, cache, container, or startup behavior. | Current-run service identity and runtime behavior evidence. |
| `ROLLBACK_RECOVERY` | `REQUIRED` | The change can require rollback, restore, compensation, retry, or recovery behavior. | Rollback or recovery path plus failure-safe evidence. |

## Verification Obligations

| ID | Surface | Type | Required | Priority | Behavior Under Test | Expected Evidence | Broad Command Only | Source Refs | Coverage Scenario IDs | Required Proof Strength |
|---|---|---|---|---|---|---|---|---|---|---|
| `verify:universe-a6e545d4-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | The existing executable accepts the same arguments and selects the same direct-init, plan-write, plan-apply, update rejection, or usage path. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:e27e31281a8d17d2d0cd4c93`, `locator:eb0f87abff1de33b8ad6946d` | `coverage-scenario:8436e1d4a9c2ab91a6e545d4` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-a6e545d4-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | No modular boundary may add, remove, rename, or reprioritize a CLI mode or change its usage exit status. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:e27e31281a8d17d2d0cd4c93`, `locator:eb0f87abff1de33b8ad6946d` | `coverage-scenario:8436e1d4a9c2ab91a6e545d4` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-33f16b20-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Plan construction preserves canonical action order, identifiers, digests, target fingerprints, and serialized plan shape. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:5f8fe537c6c52aad5c02950a`, `locator:d785a156be749b18ea7411c5` | `coverage-scenario:6b8a64e0ae567bd533f16b20` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-33f16b20-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | A split module must not reorder or deduplicate actions differently or produce a different plan digest for the same source and target. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:5f8fe537c6c52aad5c02950a`, `locator:d785a156be749b18ea7411c5` | `coverage-scenario:6b8a64e0ae567bd533f16b20` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-fb5f6fb1-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Apply validation continues to bind the exact current request, target, plan, source state, backup root, and single-use local authority. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:bfd0baf81bd14018deadee74`, `locator:ec8697c10640dde6e15af8ec`, `locator:d785a156be749b18ea7411c5` | `coverage-scenario:29c41b694e2a25b5fb5f6fb1` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-fb5f6fb1-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Refactoring must not weaken fail-closed checks, accept legacy file-authored approval, or authorize an unmatched plan. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:bfd0baf81bd14018deadee74`, `locator:ec8697c10640dde6e15af8ec`, `locator:d785a156be749b18ea7411c5` | `coverage-scenario:29c41b694e2a25b5fb5f6fb1` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-61e14285-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Controlled update replay prepares, applies, journals, validates, and commits the same exact approved action graph. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:bfd0baf81bd14018deadee74`, `locator:4180ff89c843b2d71af00068`, `locator:11d523ff0a0c45f8eb794ca9` | `coverage-scenario:53e237fc9cea90ed61e14285` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-61e14285-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | No mutation may occur outside the approved graph or before its existing preconditions and journal state are established. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:bfd0baf81bd14018deadee74`, `locator:4180ff89c843b2d71af00068`, `locator:11d523ff0a0c45f8eb794ca9` | `coverage-scenario:53e237fc9cea90ed61e14285` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-e1e69a79-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | New-project setup remains an atomic bootstrap with the same topology gate, action graph, activation verification, and committed installation. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:bfd0baf81bd14018deadee74`, `locator:0623c972dde84f0456b8e092`, `locator:91ee61a20a6bf830cfff16b8` | `coverage-scenario:573d43f84fcad189e1e69a79` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-e1e69a79-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | A non-empty or unsafe target must not be treated as a fresh project, and a partial bootstrap must not remain installed. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:bfd0baf81bd14018deadee74`, `locator:0623c972dde84f0456b8e092`, `locator:91ee61a20a6bf830cfff16b8` | `coverage-scenario:573d43f84fcad189e1e69a79` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-a11c3ecc-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Plan JSON, apply receipts, stdout, stderr, and process exit status remain byte- or contract-equivalent for the same scenario. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:e27e31281a8d17d2d0cd4c93`, `locator:bfd0baf81bd14018deadee74`, `locator:d785a156be749b18ea7411c5` | `coverage-scenario:dca2a70d980c86f4a11c3ecc` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-a11c3ecc-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | The split must not hide an error, move a message to the other stream, change a receipt field, or convert failure to success. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:e27e31281a8d17d2d0cd4c93`, `locator:bfd0baf81bd14018deadee74`, `locator:d785a156be749b18ea7411c5` | `coverage-scenario:dca2a70d980c86f4a11c3ecc` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-f3a2b88d-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Characterization and existing project-entry suites exercise positive, negative, interruption, and recovery behavior through the public executable. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:91ee61a20a6bf830cfff16b8`, `locator:d785a156be749b18ea7411c5`, `locator:11d523ff0a0c45f8eb794ca9`, `locator:eb0f87abff1de33b8ad6946d` | `coverage-scenario:63fcddf585d8dd27f3a2b88d` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-f3a2b88d-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Static import checks or fixture-only assertions cannot substitute for executable parity evidence. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:91ee61a20a6bf830cfff16b8`, `locator:d785a156be749b18ea7411c5`, `locator:11d523ff0a0c45f8eb794ca9`, `locator:eb0f87abff1de33b8ad6946d` | `coverage-scenario:63fcddf585d8dd27f3a2b88d` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-d653660b-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Interrupted or failed controlled apply restores preimages or safely resumes the exact verified transaction according to existing journal semantics. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:4180ff89c843b2d71af00068`, `locator:11d523ff0a0c45f8eb794ca9` | `coverage-scenario:6330c97be1602986d653660b` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-d653660b-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Recovery must not accept a foreign journal, delete unrelated changes, overwrite a newer receipt, or report success before verification. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:4180ff89c843b2d71af00068`, `locator:11d523ff0a0c45f8eb794ca9` | `coverage-scenario:6330c97be1602986d653660b` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-7b2145c0-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Failed or interrupted new-project bootstrap rolls back owned writes and leaves the prior target topology intact. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:0623c972dde84f0456b8e092`, `locator:91ee61a20a6bf830cfff16b8` | `coverage-scenario:d93095e30021697e7b2145c0` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-7b2145c0-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Rollback must not escape the target, remove unrelated content, or leave a partially activated project. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/115-init-project-modularity.md`, `locator:0623c972dde84f0456b8e092`, `locator:91ee61a20a6bf830cfff16b8` | `coverage-scenario:d93095e30021697e7b2145c0` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `USER_FLOW` | `UI_INTERACTION_TEST` | `Yes` | `BLOCKING` | The primary user flow follows the requested rule. | Behavior, screen, or journey evidence for the success path. | `No` | `artifact:business-rule-closures/115-init-project-modularity.md`, `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `USER_FLOW` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | Existing critical flow still works after the change. | Task-specific smoke evidence mapped to this flow. | `No` | `artifact:business-rule-closures/115-init-project-modularity.md`, `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:release-impact-release-smoke-check-release-rollback-monitoring-o` | `RELEASE_IMPACT` | `RELEASE_SMOKE_CHECK` | `Yes` | `BLOCKING` | Release, rollback, monitoring, or handoff impact is bounded. | Current release-path, rollback, monitoring, and handoff evidence; any concrete external release action still requires real-world consent. | `No` | `artifact:business-rule-closures/115-init-project-modularity.md`, `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `BACKGROUND_WORK` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Scheduled, queued, retried, or asynchronous work preserves the current business rule and remains idempotent. | Current-task worker, scheduler, retry, duplicate-delivery, and failure-path evidence. | `No` | `artifact:business-rule-closures/115-init-project-modularity.md`, `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `RUNTIME_BEHAVIOR` | `REGRESSION_SMOKE` | `Yes` | `BLOCKING` | The current code runs through the intended service, process, or platform path without stale-runtime substitution. | Runtime-trusted current-task evidence bound to the current code, service identity, environment, and command output. | `No` | `artifact:business-rule-closures/115-init-project-modularity.md`, `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `ROLLBACK_RECOVERY` | `RELEASE_SMOKE_CHECK` | `Yes` | `BLOCKING` | Failure, interruption, rollback, and recovery preserve or restore the exact bounded state. | Current-task rollback or recovery proof including partial-failure and ownership-safe cleanup behavior. | `No` | `artifact:business-rule-closures/115-init-project-modularity.md`, `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `DOCS_HANDOFF` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | The rule and exclusions are understandable for future work. | Handoff, doc update, or final report evidence. | `No` | `artifact:business-rule-closures/115-init-project-modularity.md`, `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | N/A | `NOT_APPLICABLE` |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `TEST_COVERAGE` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | Task-specific verification exists beyond broad command success. | Specific obligation-to-evidence mapping; broad commands alone are not enough. | `No` | `artifact:business-rule-closures/115-init-project-modularity.md`, `artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md` | N/A | `NOT_APPLICABLE` |

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
  "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
  "intent": "modularize scripts/init-project.mjs into focused internal modules while preserving CLI arguments, output, plan and receipt formats, mutation ordering, rollback behavior, and exit codes",
  "intent_digest": "sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435",
  "verification_plan_ref": "artifact:verification-plans/115-init-project-modularity.md",
  "verification_plan_digest": "sha256:0fce1a7acacd420fe207617a33d2b2b5a6eb409e5d18fc180ea786c1e4716e5d",
  "business_rule_ref": "artifact:business-rule-closures/115-init-project-modularity.md",
  "business_rule_digest": "sha256:ecd8231f572d0c14ae11e29c1c1e84830c1f35b8d504013d17ec0b49501480fc",
  "business_rule_state": "READY_FOR_IMPACT_COVERAGE",
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
  "impact_ref": "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md",
  "impact_digest": "sha256:f2ef5bb6f318c90b83e3a53899fcb6cab1ba61a885e563aadaaea191e970fc29",
  "source_systems": [
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
    }
  ],
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
      }
    ]
  },
  "project_level": "BL1",
  "platform_profiles": [
    "generic"
  ],
  "change_kind": "REFACTOR",
  "risk_domains": [
    "modularize-scripts-init-project-mjs-into",
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
      "status": "REQUIRED",
      "reason": "Deployment, rollback, migration, or production behavior may be affected.",
      "expected_evidence": "Release, rollback, and monitoring evidence, or a project-native explicit exclusion. Concrete external execution still requires real-world consent."
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
      "id": "verify:universe-a6e545d4-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "The existing executable accepts the same arguments and selects the same direct-init, plan-write, plan-apply, update rejection, or usage path.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:e27e31281a8d17d2d0cd4c93",
        "locator:eb0f87abff1de33b8ad6946d"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:8436e1d4a9c2ab91a6e545d4"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-a6e545d4-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "No modular boundary may add, remove, rename, or reprioritize a CLI mode or change its usage exit status.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:e27e31281a8d17d2d0cd4c93",
        "locator:eb0f87abff1de33b8ad6946d"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:8436e1d4a9c2ab91a6e545d4"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-33f16b20-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Plan construction preserves canonical action order, identifiers, digests, target fingerprints, and serialized plan shape.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:5f8fe537c6c52aad5c02950a",
        "locator:d785a156be749b18ea7411c5"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:6b8a64e0ae567bd533f16b20"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-33f16b20-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "A split module must not reorder or deduplicate actions differently or produce a different plan digest for the same source and target.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:5f8fe537c6c52aad5c02950a",
        "locator:d785a156be749b18ea7411c5"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:6b8a64e0ae567bd533f16b20"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-fb5f6fb1-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Apply validation continues to bind the exact current request, target, plan, source state, backup root, and single-use local authority.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:bfd0baf81bd14018deadee74",
        "locator:ec8697c10640dde6e15af8ec",
        "locator:d785a156be749b18ea7411c5"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:29c41b694e2a25b5fb5f6fb1"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-fb5f6fb1-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Refactoring must not weaken fail-closed checks, accept legacy file-authored approval, or authorize an unmatched plan.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:bfd0baf81bd14018deadee74",
        "locator:ec8697c10640dde6e15af8ec",
        "locator:d785a156be749b18ea7411c5"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:29c41b694e2a25b5fb5f6fb1"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-61e14285-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Controlled update replay prepares, applies, journals, validates, and commits the same exact approved action graph.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:bfd0baf81bd14018deadee74",
        "locator:4180ff89c843b2d71af00068",
        "locator:11d523ff0a0c45f8eb794ca9"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:53e237fc9cea90ed61e14285"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-61e14285-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "No mutation may occur outside the approved graph or before its existing preconditions and journal state are established.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:bfd0baf81bd14018deadee74",
        "locator:4180ff89c843b2d71af00068",
        "locator:11d523ff0a0c45f8eb794ca9"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:53e237fc9cea90ed61e14285"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-e1e69a79-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "New-project setup remains an atomic bootstrap with the same topology gate, action graph, activation verification, and committed installation.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:bfd0baf81bd14018deadee74",
        "locator:0623c972dde84f0456b8e092",
        "locator:91ee61a20a6bf830cfff16b8"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:573d43f84fcad189e1e69a79"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-e1e69a79-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "A non-empty or unsafe target must not be treated as a fresh project, and a partial bootstrap must not remain installed.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:bfd0baf81bd14018deadee74",
        "locator:0623c972dde84f0456b8e092",
        "locator:91ee61a20a6bf830cfff16b8"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:573d43f84fcad189e1e69a79"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-a11c3ecc-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Plan JSON, apply receipts, stdout, stderr, and process exit status remain byte- or contract-equivalent for the same scenario.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:e27e31281a8d17d2d0cd4c93",
        "locator:bfd0baf81bd14018deadee74",
        "locator:d785a156be749b18ea7411c5"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:dca2a70d980c86f4a11c3ecc"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-a11c3ecc-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "The split must not hide an error, move a message to the other stream, change a receipt field, or convert failure to success.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:e27e31281a8d17d2d0cd4c93",
        "locator:bfd0baf81bd14018deadee74",
        "locator:d785a156be749b18ea7411c5"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:dca2a70d980c86f4a11c3ecc"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-f3a2b88d-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Characterization and existing project-entry suites exercise positive, negative, interruption, and recovery behavior through the public executable.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:91ee61a20a6bf830cfff16b8",
        "locator:d785a156be749b18ea7411c5",
        "locator:11d523ff0a0c45f8eb794ca9",
        "locator:eb0f87abff1de33b8ad6946d"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:63fcddf585d8dd27f3a2b88d"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-f3a2b88d-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Static import checks or fixture-only assertions cannot substitute for executable parity evidence.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:91ee61a20a6bf830cfff16b8",
        "locator:d785a156be749b18ea7411c5",
        "locator:11d523ff0a0c45f8eb794ca9",
        "locator:eb0f87abff1de33b8ad6946d"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:63fcddf585d8dd27f3a2b88d"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-d653660b-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Interrupted or failed controlled apply restores preimages or safely resumes the exact verified transaction according to existing journal semantics.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:4180ff89c843b2d71af00068",
        "locator:11d523ff0a0c45f8eb794ca9"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:6330c97be1602986d653660b"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-d653660b-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Recovery must not accept a foreign journal, delete unrelated changes, overwrite a newer receipt, or report success before verification.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:4180ff89c843b2d71af00068",
        "locator:11d523ff0a0c45f8eb794ca9"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:6330c97be1602986d653660b"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-7b2145c0-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Failed or interrupted new-project bootstrap rolls back owned writes and leaves the prior target topology intact.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:0623c972dde84f0456b8e092",
        "locator:91ee61a20a6bf830cfff16b8"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:d93095e30021697e7b2145c0"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-7b2145c0-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Rollback must not escape the target, remove unrelated content, or leave a partially activated project.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/115-init-project-modularity.md",
        "locator:0623c972dde84f0456b8e092",
        "locator:91ee61a20a6bf830cfff16b8"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:d93095e30021697e7b2145c0"
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
        "artifact:business-rule-closures/115-init-project-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md"
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
        "artifact:business-rule-closures/115-init-project-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [],
      "required_proof_strength": "NOT_APPLICABLE"
    },
    {
      "id": "verify:release-impact-release-smoke-check-release-rollback-monitoring-o",
      "source_surface": "RELEASE_IMPACT",
      "verification_type": "RELEASE_SMOKE_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Release, rollback, monitoring, or handoff impact is bounded.",
      "expected_evidence": "Current release-path, rollback, monitoring, and handoff evidence; any concrete external release action still requires real-world consent.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "artifact:business-rule-closures/115-init-project-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md"
      ],
      "owner": "codex",
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
        "artifact:business-rule-closures/115-init-project-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md"
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
        "artifact:business-rule-closures/115-init-project-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md"
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
        "artifact:business-rule-closures/115-init-project-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md"
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
        "artifact:business-rule-closures/115-init-project-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md"
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
        "artifact:business-rule-closures/115-init-project-modularity.md",
        "artifact:change-impact-coverage-reports/preflight-115-init-project-modularity.md"
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
