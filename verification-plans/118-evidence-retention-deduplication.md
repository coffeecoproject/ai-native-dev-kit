# Verification Plan

## Human Summary

Verification state VERIFICATION_PLAN_READY; 6 affected surfaces require 17 obligations, including 14 blocking obligations.

## User Request

- Request: establish a forward-only evidence retention and deduplication rule for runtime state that preserves authoritative reports and the final trusted runtime while preventing duplicate aggregate logs, stale retry archives, and unbounded per-task evidence growth without rewriting released evidence
- Task ref: `task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f`

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/118-evidence-retention-deduplication.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:7b127a380f8177084e8fc6dc0a4ace14b7571c135d8e2dd3370ed8fba72bc6c0` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md` | `CHANGE_IMPACT_RECORDED` | `sha256:ca9e2f6da4b8de3fd112ee74dc4506100c9b2540f4b5bfeef39f9863d4508ee8` |
| `business_universe_coverage` | `RECORDED` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md` | `COVERAGE_READY` | `sha256:9e2514fbde77b9a5b32d0da2f8cc0df1deda875a04c34ba75a4f996cef43b823` |
| `control_effectiveness` | `NOT_PROVIDED` | `N/A` | `NOT_APPLICABLE_WITH_REASON` | `N/A` |

## Control Effectiveness Binding

- Requirement: `NOT_REQUIRED`
- Status: `NOT_REQUIRED`
- Report: `N/A`
- Required claims: N/A
- Reason: The current task does not rely on a control as proof for its adoption, plan, verification, release-readiness, or completion claim.

## Verification Plan Identity

- Verification plan ref: `artifact:verification-plans/118-evidence-retention-deduplication.md`
- Verification plan digest: `sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727`
- Intent digest: `sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652`

## Project Calibration

- Project level: `BL1`
- Platform profiles: `generic`
- Change kind: `BUSINESS_RULE`
- Risk domains: `establish-a-forward-only-evidence-retent`, `release`

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
| `verify:universe-93e4686c-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Every newly generated project receives the retention policy, checker, documentation, and shared retention library through declared manifest projections. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:6b0e3cd96ba50c5a7943db9b`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:066f1fee0cdbf5f993e4686c` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-93e4686c-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | A missing or stale declaration must fail manifest or generated-project verification instead of silently omitting governance files. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:6b0e3cd96ba50c5a7943db9b`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:066f1fee0cdbf5f993e4686c` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-2118bb89-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | The standard pre-runtime command invokes strict evidence-retention validation and propagates its non-zero exit status. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:3fef7fb99b0b44d53dbd8205`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:a109f7bce060ab502118bb89` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-2118bb89-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | An invalid retention state must stop pre-runtime verification; no alternate standard command may bypass the gate. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:3fef7fb99b0b44d53dbd8205`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:a109f7bce060ab502118bb89` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-2020517d-expected` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Evidence for tasks at or after 1.118 is checked for one final durable runtime, forbidden aggregate logs, exact raw duplicates, per-file limits, and task-total limits. | A project-native test proves the expected path against the current task and code. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:1934fa6f88b5d8409fb5e924`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:4959cf4953da04a02020517d` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-2020517d-negative` | `PROJECT_NATIVE_BEHAVIOR` | `UNIT_BEHAVIOR_TEST` | `Yes` | `BLOCKING` | Released evidence before 1.118 remains immutable and out of the new budget; the evaluator never deletes, truncates, uploads, or rewrites evidence. | A project-native test proves the negative, reverse, failure, or compensation path against the current task and code. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:1934fa6f88b5d8409fb5e924`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:4959cf4953da04a02020517d` | `PROJECT_NATIVE_BEHAVIOR_PROOF` |
| `verify:universe-8140bff0-expected` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | The generated workflow contract names the retention policy, checker, documentation, and shared library as required project surfaces. | Current-source structural evidence proves the expected path. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:7908f302322371cc26b710ee`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:c7983fd3a2b96b768140bff0` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-8140bff0-negative` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Template drift or omission must be detected by manifest validation and generated-project characterization tests. | Current-source structural evidence proves the negative, reverse, failure, or compensation path. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:7908f302322371cc26b710ee`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:c7983fd3a2b96b768140bff0` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-4193ff31-expected` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Valid forward-only retention state and generated-project state pass deterministic tests and strict checking. | Current-source structural evidence proves the expected path. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:9d80fac10164c9ddf98f3e26`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:b378ce917c0d0bb34193ff31` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:universe-4193ff31-negative` | `PROJECT_NATIVE_BEHAVIOR` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Multiple final runs, aggregate logs, duplicate raw evidence, exceeded budgets, and unbound runtime directories each fail with a specific finding while preserving inputs. | Current-source structural evidence proves the negative, reverse, failure, or compensation path. | `No` | `business-universe-coverage-reports/118-evidence-retention-deduplication.md`, `locator:9d80fac10164c9ddf98f3e26`, `locator:213447abfe4cdc4e3b0d22ce` | `coverage-scenario:b378ce917c0d0bb34193ff31` | `STRUCTURAL_SOURCE_PROOF` |
| `verify:user-flow-ui-interaction-test-the-primary-user-flow-follows-the-` | `USER_FLOW` | `UI_INTERACTION_TEST` | `Yes` | `BLOCKING` | The primary user flow follows the requested rule. | Behavior, screen, or journey evidence for the success path. | `No` | `artifact:business-rule-closures/118-evidence-retention-deduplication.md`, `artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md` | N/A | `NOT_APPLICABLE` |
| `verify:user-flow-regression-smoke-existing-critical-flow-still-works-af` | `USER_FLOW` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | Existing critical flow still works after the change. | Task-specific smoke evidence mapped to this flow. | `No` | `artifact:business-rule-closures/118-evidence-retention-deduplication.md`, `artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md` | N/A | `NOT_APPLICABLE` |
| `verify:background-work-integration-contract-check-scheduled-queued-retr` | `BACKGROUND_WORK` | `INTEGRATION_CONTRACT_CHECK` | `Yes` | `BLOCKING` | Scheduled, queued, retried, or asynchronous work preserves the current business rule and remains idempotent. | Current-task worker, scheduler, retry, duplicate-delivery, and failure-path evidence. | `No` | `artifact:business-rule-closures/118-evidence-retention-deduplication.md`, `artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md` | N/A | `NOT_APPLICABLE` |
| `verify:runtime-behavior-regression-smoke-the-current-code-runs-through-` | `RUNTIME_BEHAVIOR` | `REGRESSION_SMOKE` | `Yes` | `BLOCKING` | The current code runs through the intended service, process, or platform path without stale-runtime substitution. | Runtime-trusted current-task evidence bound to the current code, service identity, environment, and command output. | `No` | `artifact:business-rule-closures/118-evidence-retention-deduplication.md`, `artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md` | N/A | `NOT_APPLICABLE` |
| `verify:rollback-recovery-release-smoke-check-failure-interruption-rollb` | `ROLLBACK_RECOVERY` | `RELEASE_SMOKE_CHECK` | `Yes` | `BLOCKING` | Failure, interruption, rollback, and recovery preserve or restore the exact bounded state. | Current-task rollback or recovery proof including partial-failure and ownership-safe cleanup behavior. | `No` | `artifact:business-rule-closures/118-evidence-retention-deduplication.md`, `artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md` | N/A | `NOT_APPLICABLE` |
| `verify:docs-handoff-regression-smoke-the-rule-and-exclusions-are-unders` | `DOCS_HANDOFF` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | The rule and exclusions are understandable for future work. | Handoff, doc update, or final report evidence. | `No` | `artifact:business-rule-closures/118-evidence-retention-deduplication.md`, `artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md` | N/A | `NOT_APPLICABLE` |
| `verify:test-coverage-regression-smoke-task-specific-verification-exists` | `TEST_COVERAGE` | `REGRESSION_SMOKE` | `Yes` | `REQUIRED` | Task-specific verification exists beyond broad command success. | Specific obligation-to-evidence mapping; broad commands alone are not enough. | `No` | `artifact:business-rule-closures/118-evidence-retention-deduplication.md`, `artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md` | N/A | `NOT_APPLICABLE` |

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
  "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
  "intent": "establish a forward-only evidence retention and deduplication rule for runtime state that preserves authoritative reports and the final trusted runtime while preventing duplicate aggregate logs, stale retry archives, and unbounded per-task evidence growth without rewriting released evidence",
  "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652",
  "verification_plan_ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
  "verification_plan_digest": "sha256:18298b46c95c604a55925c9eb7bb5040758f792835f4e78e839a00f7f842b727",
  "business_rule_ref": "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
  "business_rule_digest": "sha256:7b127a380f8177084e8fc6dc0a4ace14b7571c135d8e2dd3370ed8fba72bc6c0",
  "business_rule_state": "READY_FOR_IMPACT_COVERAGE",
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
  "impact_ref": "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md",
  "impact_digest": "sha256:ca9e2f6da4b8de3fd112ee74dc4506100c9b2540f4b5bfeef39f9863d4508ee8",
  "source_systems": [
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
    }
  ],
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
        "ref": "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
        "relative_path": "business-rule-closures/118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:0461ce55d4322962ec5fe32c0ecdbf651b729fb3e2a51967adaf09d1db3731c5"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md",
        "relative_path": "change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md",
        "raw_file_digest": "sha256:0cdf1a1ddac44d157a4fe64697110cf37bad5a2952df65f4a1e8efd44a9e9865"
      }
    ]
  },
  "project_level": "BL1",
  "platform_profiles": [
    "generic"
  ],
  "change_kind": "BUSINESS_RULE",
  "risk_domains": [
    "establish-a-forward-only-evidence-retent",
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
      "id": "verify:universe-93e4686c-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Every newly generated project receives the retention policy, checker, documentation, and shared retention library through declared manifest projections.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:6b0e3cd96ba50c5a7943db9b",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:066f1fee0cdbf5f993e4686c"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-93e4686c-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "A missing or stale declaration must fail manifest or generated-project verification instead of silently omitting governance files.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:6b0e3cd96ba50c5a7943db9b",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:066f1fee0cdbf5f993e4686c"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-2118bb89-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "The standard pre-runtime command invokes strict evidence-retention validation and propagates its non-zero exit status.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:3fef7fb99b0b44d53dbd8205",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:a109f7bce060ab502118bb89"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-2118bb89-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "An invalid retention state must stop pre-runtime verification; no alternate standard command may bypass the gate.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:3fef7fb99b0b44d53dbd8205",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:a109f7bce060ab502118bb89"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-2020517d-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Evidence for tasks at or after 1.118 is checked for one final durable runtime, forbidden aggregate logs, exact raw duplicates, per-file limits, and task-total limits.",
      "expected_evidence": "A project-native test proves the expected path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:1934fa6f88b5d8409fb5e924",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:4959cf4953da04a02020517d"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-2020517d-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "UNIT_BEHAVIOR_TEST",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Released evidence before 1.118 remains immutable and out of the new budget; the evaluator never deletes, truncates, uploads, or rewrites evidence.",
      "expected_evidence": "A project-native test proves the negative, reverse, failure, or compensation path against the current task and code.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:1934fa6f88b5d8409fb5e924",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:4959cf4953da04a02020517d"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF"
    },
    {
      "id": "verify:universe-8140bff0-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "The generated workflow contract names the retention policy, checker, documentation, and shared library as required project surfaces.",
      "expected_evidence": "Current-source structural evidence proves the expected path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:7908f302322371cc26b710ee",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:c7983fd3a2b96b768140bff0"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-8140bff0-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Template drift or omission must be detected by manifest validation and generated-project characterization tests.",
      "expected_evidence": "Current-source structural evidence proves the negative, reverse, failure, or compensation path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:7908f302322371cc26b710ee",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:c7983fd3a2b96b768140bff0"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-4193ff31-expected",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Valid forward-only retention state and generated-project state pass deterministic tests and strict checking.",
      "expected_evidence": "Current-source structural evidence proves the expected path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:9d80fac10164c9ddf98f3e26",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:b378ce917c0d0bb34193ff31"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
    },
    {
      "id": "verify:universe-4193ff31-negative",
      "source_surface": "PROJECT_NATIVE_BEHAVIOR",
      "verification_type": "INTEGRATION_CONTRACT_CHECK",
      "required": "Yes",
      "priority": "BLOCKING",
      "behavior_under_test": "Multiple final runs, aggregate logs, duplicate raw evidence, exceeded budgets, and unbound runtime directories each fail with a specific finding while preserving inputs.",
      "expected_evidence": "Current-source structural evidence proves the negative, reverse, failure, or compensation path.",
      "test_correctness_risk": "Must assert intended behavior rather than implementation details.",
      "suggested_command": "",
      "broad_command_only": "No",
      "source_refs": [
        "business-universe-coverage-reports/118-evidence-retention-deduplication.md",
        "locator:9d80fac10164c9ddf98f3e26",
        "locator:213447abfe4cdc4e3b0d22ce"
      ],
      "owner": "",
      "decision_ref": "",
      "not_applicable_reason": "",
      "source_coverage_scenario_ids": [
        "coverage-scenario:b378ce917c0d0bb34193ff31"
      ],
      "required_proof_strength": "STRUCTURAL_SOURCE_PROOF"
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
        "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
        "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md"
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
        "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
        "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md"
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
        "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
        "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md"
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
        "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
        "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md"
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
        "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
        "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md"
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
        "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
        "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md"
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
        "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
        "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md"
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
