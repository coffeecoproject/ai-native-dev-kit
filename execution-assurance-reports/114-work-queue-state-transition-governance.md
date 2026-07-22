# Execution Assurance Report

This report is a read-only derived verification view. It does not write target files, authorize writes, approve release, or replace source systems.

## Human Summary

| Field | Value |
| --- | --- |
| Execution Kind | `WORKFLOW_CAPABILITY` |
| Assurance State | `VERIFIED_DONE` |
| Can Claim Done | `Yes` |
| Can Codex Write Now | `No` |
| Safe Next Step | Prepare final response with evidence summary; do not claim release or production approval. |

## Execution Kind

`WORKFLOW_CAPABILITY`

## Intent Lock

| Field | Value |
| --- | --- |
| User Intent | Add append-only Work Queue task state transitions so published task snapshots remain immutable while exactly one successor becomes current. |
| Normalized Intent | WORKFLOW_CAPABILITY: Add append-only Work Queue task state transitions so published task snapshots remain immutable while exactly one successor becomes current. |
| Task Ref | `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739` |
| Drift Policy | Scope changes require Work Queue or Conversation Drift review. |

## Completion Contract

| Criterion | Status | Evidence | Notes |
| --- | --- | --- | --- |
| criterion:workflow-capability | `DONE` | `artifact:test-evidence-reports/114-work-queue-state-transition-governance.md` | Bound to current task evidence. |

## Planned Impact Map

| Surface | Expected | Status | Evidence | Notes |
| --- | --- | --- | --- |
| user_flow | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md` | Planned surface. |
| frontend_ui | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md` | Planned surface. |
| api_contract | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md` | Planned surface. |
| backend_rule | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md` | Planned surface. |
| tests | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md` | Planned surface. |
| docs | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md` | Planned surface. |

## Execution Plan Binding

| Field | Value |
| --- | --- |
| Plan Ref | `artifact:implementation-plans/114-work-queue-state-transition-governance.md` |
| Risk Classification | `HIGH` |
| Planned Target Paths | `.intentos/runtime-runs/vrun-114-work-queue-transition-r3/evidence/cleanup-after.txt, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/evidence/cleanup-before.txt, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/evidence/preflight.txt, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/evidence/resources.txt, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/lifecycle-journal.jsonl, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-current-candidate-verification.log, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-current-obligation-evidence.log, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-current-runtime-behavior.log, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-runtime-negative.log, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-runtime-positive.log, .intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-runtime-service.log, .intentos/verification-runtime-lifecycle.json, business-rule-closures/114-work-queue-state-transition-governance.md, business-universe-coverage-reports/114-work-queue-state-transition-governance.md, change-impact-coverage-reports/preflight-114-work-queue-state-transition-governance.md, checklists/work-queue-state-transition-review.md, core/work-queue.md, docs/work-queue.md, execution-assurance-reports/114-work-queue-state-transition-governance.md, implementation-plans/114-work-queue-state-transition-governance.md, intentos-manifest.json, package.json, plan-review-reports/114-work-queue-state-transition-governance.md, planning-closure-reports/114-work-queue-state-transition-governance.md, review-summaries/114-work-queue-state-transition-governance-business-universe-challenger.md, review-surface-cards/114-work-queue-state-transition-governance.md, schemas/artifacts/work-queue-state-transition.schema.json, scripts/check-work-queue-transition.mjs, scripts/check-work-queue.mjs, scripts/cli.mjs, scripts/lib/artifact-schema.mjs, scripts/lib/work-queue-transition.mjs, scripts/resolve-work-queue-takeover.mjs, scripts/resolve-work-queue-transition.mjs, scripts/resolve-work-queue.mjs, task-governance-reports/114-work-queue-state-transition-governance.md, templates/work-queue-state-transition.md, templates/workflow-version.json, test-evidence-reports/114-work-queue-state-transition-governance.md, tests/114-work-queue-transition-obligation-evidence.test.mjs, tests/work-queue-transition.test.mjs, verification-plans/114-work-queue-state-transition-governance.md, verification-run-manifests/114-work-queue-state-transition-governance.md, verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md, verification-runtime-plans/114-work-queue-state-transition-governance.md, work-queue-takeover-reports/114-work-queue-state-transition-governance.md, work-queue-transitions/.gitkeep, work-queue-transitions/001-113-to-114-transition-governance.md, work-queue/114-work-queue-state-transition-governance.md` |
| Approval Ref | `N/A` |
| Restore Strategy | Use task-scoped revert or reviewed restore plan if verification fails. |

## Actual Diff Binding

| Field | Value |
| --- | --- |
| Diff Source | `git:cached` |
| Base Revision | `212c7e1c8eca0839b2b212af692c5863ecb722f8` |
| Changed Files | `checklists/work-queue-state-transition-review.md, core/work-queue.md, docs/work-queue.md, intentos-manifest.json, package.json, schemas/artifacts/work-queue-state-transition.schema.json, scripts/check-work-queue-transition.mjs, scripts/check-work-queue.mjs, scripts/cli.mjs, scripts/lib/artifact-schema.mjs, scripts/lib/work-queue-transition.mjs, scripts/resolve-work-queue-takeover.mjs, scripts/resolve-work-queue-transition.mjs, scripts/resolve-work-queue.mjs, templates/work-queue-state-transition.md, templates/workflow-version.json, tests/114-work-queue-transition-obligation-evidence.test.mjs, tests/work-queue-transition.test.mjs, work-queue-transitions/.gitkeep, work-queue-transitions/001-113-to-114-transition-governance.md` |
| Unexpected Files | `none` |
| Target Diff Status | `MATCHED_PLAN` |

## Pre-Write Revalidation

| Field | Value |
| --- | --- |
| Status | `VERIFIED` |
| Checked At | `2026-07-22T06:22:05.243Z` |
| Planning Closure | `artifact:planning-closure-reports/114-work-queue-state-transition-governance.md` |
| Source Revision | `sha256:b31b155286370c44f3cac0fe18cef4314e7d01b704fb910bc84a03abc5a4568a` |
| Candidate Base | `212c7e1c8eca0839b2b212af692c5863ecb722f8` |
| Planned Paths Digest | `sha256:02d68ee1577f0e72d60a5e03fc86eb336ab918c0bbbd8f1611baed99a9b3720d` |
| Changed Paths Digest | `sha256:6d7cb9cd0fe0a4f20bf14ce96ed0132ca4f6e615d3a40676b45452f42903f850` |
| Result | `PRE_WRITE_SNAPSHOT_REPLAYED` |
| Reason | The immutable Planning Closure source snapshot, Execution Entry Contract, candidate base, current project identity, planned target set, and observed changed-path set were replayed without widening authority. |

## Evidence Binding

| Criterion | Evidence Ref | Resolved | Current Task Match |
| --- | --- | --- | --- |
| criterion:workflow-capability | `artifact:test-evidence-reports/114-work-queue-state-transition-governance.md` | `Yes` | `Yes` |
| criterion:planning-closure | `artifact:planning-closure-reports/114-work-queue-state-transition-governance.md` | `Yes` | `Yes` |
| criterion:runtime-trust | `artifact:verification-run-manifests/114-work-queue-state-transition-governance.md` | `Yes` | `Yes` |

## Task Entry Binding

- Work Queue item: `artifact:work-queue-takeover-reports/114-work-queue-state-transition-governance.md#WQ-004`
- Task Governance: `artifact:task-governance-reports/114-work-queue-state-transition-governance.md`
- Task impact: `HIGH`
- Completion requirements satisfied: `Yes`

## Plan Review Binding

- Review: `artifact:plan-review-reports/114-work-queue-state-transition-governance.md`
- State: `PLAN_REVIEW_PASSED`
- Current task match: `Yes`

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
- Assessment outcome: `NOT_APPLICABLE_WITH_REASON`
- Reason: The current task does not rely on a control as proof for its adoption, plan, verification, release-readiness, or completion claim.

## Business Universe Assurance

| Field | Value |
| --- | --- |
| Required | `Yes` |
| Routing Result | `REQUIRED_WITH_EVIDENCE` |
| Coverage Ref | `artifact:business-universe-coverage-reports/114-work-queue-state-transition-governance.md` |
| Coverage State | `COVERAGE_READY` |
| Mapping Status | `COMPLETE` |

| Coverage Scenario | Required Obligations | Covered Obligations | Test Evidence | Required Proof | Test State | Assurance State |
| --- | --- | --- | --- | --- | --- | --- |
| `coverage-scenario:62567cdf836ba48477a8f448` | `verify:universe-77a8f448-expected, verify:universe-77a8f448-negative` | `verify:universe-77a8f448-expected, verify:universe-77a8f448-negative` | `evidence:runtime-observed-proof-f9debc91cb43fd9fba77, evidence:runtime-observed-proof-e1365db60763a7d95146` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:740a71757b14288ae4141c50` | `verify:universe-e4141c50-expected, verify:universe-e4141c50-negative` | `verify:universe-e4141c50-expected, verify:universe-e4141c50-negative` | `evidence:runtime-observed-proof-4806d70d10581ebece9c, evidence:runtime-observed-proof-43849896249e48251b01` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:d7545e8b22bb9bfa081a836f` | `verify:universe-081a836f-expected, verify:universe-081a836f-negative` | `verify:universe-081a836f-expected, verify:universe-081a836f-negative` | `evidence:runtime-observed-proof-28883e750e05f58e7ec8, evidence:runtime-observed-proof-a1dac7b2b51b0cea0a3a` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:c8256b97414d3a4b1abf3bf4` | `verify:universe-1abf3bf4-expected, verify:universe-1abf3bf4-negative` | `verify:universe-1abf3bf4-expected, verify:universe-1abf3bf4-negative` | `evidence:runtime-observed-proof-14e4ee8fa0d71501e4dc, evidence:runtime-observed-proof-0a34fd6b36431e429926` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:cfd07c06b02bfbc6d630cfd9` | `verify:universe-d630cfd9-expected, verify:universe-d630cfd9-negative` | `verify:universe-d630cfd9-expected, verify:universe-d630cfd9-negative` | `evidence:runtime-observed-proof-15283ff44232463b62d2, evidence:runtime-observed-proof-4dce3290bf54711b05d2` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:ffb9bbaca3043be408850f5d` | `verify:universe-08850f5d-expected, verify:universe-08850f5d-negative` | `verify:universe-08850f5d-expected, verify:universe-08850f5d-negative` | `evidence:runtime-observed-proof-57fd8ea95271a4eb9332, evidence:runtime-observed-proof-b2f668c1e31403ae7677` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:79c17acfcbaca9b2d0e72ece` | `verify:universe-d0e72ece-expected, verify:universe-d0e72ece-negative` | `verify:universe-d0e72ece-expected, verify:universe-d0e72ece-negative` | `evidence:runtime-observed-proof-6e9c12dd40bceff20ea0, evidence:runtime-observed-proof-69fe80d561e49fd38816` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:eb423e2eba675f15d896a585` | `verify:universe-d896a585-expected, verify:universe-d896a585-negative` | `verify:universe-d896a585-expected, verify:universe-d896a585-negative` | `evidence:runtime-observed-proof-c29c55a0dda69b281495, evidence:runtime-observed-proof-e1c3ed4a94562dc69b6f` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:067b89b0642246adf9542c4e` | `verify:universe-f9542c4e-expected, verify:universe-f9542c4e-negative` | `verify:universe-f9542c4e-expected, verify:universe-f9542c4e-negative` | `evidence:runtime-observed-proof-6810949d4f9b89dbad4b, evidence:runtime-observed-proof-5da77e34e453e3012573` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |

## Independent Review Binding

| Field | Value |
| --- | --- |
| Review Required | `Yes` |
| Review Refs | `artifact:plan-review-reports/114-work-queue-state-transition-governance.md` |
| All Reviewers Closed | `Yes` |

## Patch Assessment

| Field | Value |
| --- | --- |
| Patch State | `NOT_A_PATCH` |
| Reason | Normal planned execution. |

## Source System Trace

| Source System | Status | Ref | Source Task | Source Outcome | Current Task Match | Digest | Contribution | Authority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| change_impact_coverage | `RECORDED` | `artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md` | `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739` | `CHANGE_IMPACT_RECORDED` | `Yes` | `sha256:c94b561332450a2913bc632a65817abcbdf085e4f61057ec999eae73c3b2301a` | change-impact-coverage-reports evidence present. | Source system |
| test_evidence | `RECORDED` | `artifact:test-evidence-reports/114-work-queue-state-transition-governance.md` | `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739` | `TEST_EVIDENCE_COMPLETE` | `Yes` | `sha256:5ef64b4a08b58024cc59c7b50a02ba569c0ab79ded45eaf2b3db0ebf6420f055` | test-evidence-reports evidence present. | Source system |
| verification_run_manifest | `RECORDED` | `artifact:verification-run-manifests/114-work-queue-state-transition-governance.md` | `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739` | `RUNTIME_TRUST_COMPLETE` | `Yes` | `sha256:be5bbb7a59cf10cdaca6133b485a0647fe8bcbd68baf20438252babff7490031` | Authoritative current-run runtime evidence. | Source system |
| task_governance | `RECORDED` | `artifact:task-governance-reports/114-work-queue-state-transition-governance.md` | `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739` | `TASK_GOVERNANCE_RECORDED` | `Yes` | `sha256:186d167dcbdb3a496bba1d45927d59f24d8ecd6554621f38f70b639fb8df8c94` | Exact current-task task governance authority. | Source system |
| plan_review | `RECORDED` | `artifact:plan-review-reports/114-work-queue-state-transition-governance.md` | `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739` | `PLAN_REVIEW_PASSED` | `Yes` | `sha256:ba053a9cb6f3cb59c0ee5fe963ddcc89943904ae9fa2c26c5ab17931800ca78a` | Exact current-task plan review authority. | Source system |
| planning_closure | `RECORDED` | `artifact:planning-closure-reports/114-work-queue-state-transition-governance.md` | `task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739` | `PLANNING_READY` | `Yes` | `sha256:87411d4874a173275deafe5fca2c9d9245f0097dd9bc0c721706c8bc5673f818` | Exact current-task planning closure authority. | Source system |

## Closure Decision

`VERIFIED_DONE`

## Pending Human Decisions

- None.

## Forbidden Claims

- This report writes target files: No
- This report authorizes target-file writes: No
- This report approves implementation beyond recorded scope: No
- This report approves commit or push: No
- This report approves release or production: No
- This report replaces source systems: No
- This report proves product correctness: No
- This report transfers project authority to IntentOS: No

## Boundary

Execution Assurance is derived from recorded evidence and project facts. Source systems remain authoritative.

## Machine-Readable Evidence

```json
{
  "schema_version": "1.113.0",
  "artifact_type": "execution_assurance_report",
  "execution_kind": "WORKFLOW_CAPABILITY",
  "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
  "intent_digest": "sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121",
  "assurance_state": "VERIFIED_DONE",
  "can_claim_done": "Yes",
  "can_codex_write_now": "No",
  "intent_lock": {
    "user_intent": "Add append-only Work Queue task state transitions so published task snapshots remain immutable while exactly one successor becomes current.",
    "normalized_intent": "WORKFLOW_CAPABILITY: Add append-only Work Queue task state transitions so published task snapshots remain immutable while exactly one successor becomes current.",
    "in_scope": [
      "intentos code",
      "fixtures",
      "docs",
      "release record",
      "self-check"
    ],
    "out_of_scope": [
      "release approval",
      "production deploy",
      "secrets",
      "payment",
      "legal/compliance decision"
    ]
  },
  "completion_contract": {
    "criteria": [
      {
        "id": "criterion:workflow-capability",
        "status": "DONE",
        "evidence_refs": [
          "artifact:test-evidence-reports/114-work-queue-state-transition-governance.md"
        ]
      }
    ]
  },
  "planned_impact_map": {
    "surfaces": [
      {
        "surface": "user_flow",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md"
        ]
      },
      {
        "surface": "frontend_ui",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md"
        ]
      },
      {
        "surface": "api_contract",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md"
        ]
      },
      {
        "surface": "backend_rule",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md"
        ]
      },
      {
        "surface": "tests",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md"
        ]
      },
      {
        "surface": "docs",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md"
        ]
      }
    ]
  },
  "execution_plan": {
    "plan_ref": "artifact:implementation-plans/114-work-queue-state-transition-governance.md",
    "planned_target_paths": [
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/evidence/cleanup-after.txt",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/evidence/cleanup-before.txt",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/evidence/preflight.txt",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/evidence/resources.txt",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/lifecycle-journal.jsonl",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-current-candidate-verification.log",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-current-obligation-evidence.log",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-current-runtime-behavior.log",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-runtime-negative.log",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-runtime-positive.log",
      ".intentos/runtime-runs/vrun-114-work-queue-transition-r3/outputs/self-runtime-service.log",
      ".intentos/verification-runtime-lifecycle.json",
      "business-rule-closures/114-work-queue-state-transition-governance.md",
      "business-universe-coverage-reports/114-work-queue-state-transition-governance.md",
      "change-impact-coverage-reports/preflight-114-work-queue-state-transition-governance.md",
      "checklists/work-queue-state-transition-review.md",
      "core/work-queue.md",
      "docs/work-queue.md",
      "execution-assurance-reports/114-work-queue-state-transition-governance.md",
      "implementation-plans/114-work-queue-state-transition-governance.md",
      "intentos-manifest.json",
      "package.json",
      "plan-review-reports/114-work-queue-state-transition-governance.md",
      "planning-closure-reports/114-work-queue-state-transition-governance.md",
      "review-summaries/114-work-queue-state-transition-governance-business-universe-challenger.md",
      "review-surface-cards/114-work-queue-state-transition-governance.md",
      "schemas/artifacts/work-queue-state-transition.schema.json",
      "scripts/check-work-queue-transition.mjs",
      "scripts/check-work-queue.mjs",
      "scripts/cli.mjs",
      "scripts/lib/artifact-schema.mjs",
      "scripts/lib/work-queue-transition.mjs",
      "scripts/resolve-work-queue-takeover.mjs",
      "scripts/resolve-work-queue-transition.mjs",
      "scripts/resolve-work-queue.mjs",
      "task-governance-reports/114-work-queue-state-transition-governance.md",
      "templates/work-queue-state-transition.md",
      "templates/workflow-version.json",
      "test-evidence-reports/114-work-queue-state-transition-governance.md",
      "tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "tests/work-queue-transition.test.mjs",
      "verification-plans/114-work-queue-state-transition-governance.md",
      "verification-run-manifests/114-work-queue-state-transition-governance.md",
      "verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md",
      "verification-runtime-plans/114-work-queue-state-transition-governance.md",
      "work-queue-takeover-reports/114-work-queue-state-transition-governance.md",
      "work-queue-transitions/.gitkeep",
      "work-queue-transitions/001-113-to-114-transition-governance.md",
      "work-queue/114-work-queue-state-transition-governance.md"
    ],
    "risk_classification": "HIGH",
    "approval_refs": [],
    "restore_strategy": "Use task-scoped revert or reviewed restore plan if verification fails."
  },
  "actual_diff": {
    "diff_source": "git:cached",
    "base_revision": "212c7e1c8eca0839b2b212af692c5863ecb722f8",
    "changed_files": [
      "checklists/work-queue-state-transition-review.md",
      "core/work-queue.md",
      "docs/work-queue.md",
      "intentos-manifest.json",
      "package.json",
      "schemas/artifacts/work-queue-state-transition.schema.json",
      "scripts/check-work-queue-transition.mjs",
      "scripts/check-work-queue.mjs",
      "scripts/cli.mjs",
      "scripts/lib/artifact-schema.mjs",
      "scripts/lib/work-queue-transition.mjs",
      "scripts/resolve-work-queue-takeover.mjs",
      "scripts/resolve-work-queue-transition.mjs",
      "scripts/resolve-work-queue.mjs",
      "templates/work-queue-state-transition.md",
      "templates/workflow-version.json",
      "tests/114-work-queue-transition-obligation-evidence.test.mjs",
      "tests/work-queue-transition.test.mjs",
      "work-queue-transitions/.gitkeep",
      "work-queue-transitions/001-113-to-114-transition-governance.md"
    ],
    "unexpected_files": [],
    "target_diff_status": "MATCHED_PLAN"
  },
  "evidence_bindings": [
    {
      "criterion_id": "criterion:workflow-capability",
      "evidence_ref": "artifact:test-evidence-reports/114-work-queue-state-transition-governance.md",
      "resolved": "Yes",
      "current_task_match": "Yes"
    },
    {
      "criterion_id": "criterion:planning-closure",
      "evidence_ref": "artifact:planning-closure-reports/114-work-queue-state-transition-governance.md",
      "resolved": "Yes",
      "current_task_match": "Yes"
    },
    {
      "criterion_id": "criterion:runtime-trust",
      "evidence_ref": "artifact:verification-run-manifests/114-work-queue-state-transition-governance.md",
      "resolved": "Yes",
      "current_task_match": "Yes"
    }
  ],
  "review": {
    "review_required": "Yes",
    "review_refs": [
      "artifact:plan-review-reports/114-work-queue-state-transition-governance.md"
    ],
    "all_reviewers_closed": "Yes"
  },
  "patch_assessment": {
    "state": "NOT_A_PATCH",
    "reason": "Normal planned execution."
  },
  "source_systems": [
    {
      "name": "change_impact_coverage",
      "status": "RECORDED",
      "ref": "artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md",
      "source_system_ref": "artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md",
      "source_task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "current_task_match": "Yes",
      "report_digest": "sha256:c94b561332450a2913bc632a65817abcbdf085e4f61057ec999eae73c3b2301a",
      "contribution": "change-impact-coverage-reports evidence present."
    },
    {
      "name": "test_evidence",
      "status": "RECORDED",
      "ref": "artifact:test-evidence-reports/114-work-queue-state-transition-governance.md",
      "source_system_ref": "artifact:test-evidence-reports/114-work-queue-state-transition-governance.md",
      "source_task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
      "source_outcome": "TEST_EVIDENCE_COMPLETE",
      "current_task_match": "Yes",
      "report_digest": "sha256:5ef64b4a08b58024cc59c7b50a02ba569c0ab79ded45eaf2b3db0ebf6420f055",
      "contribution": "test-evidence-reports evidence present."
    },
    {
      "name": "verification_run_manifest",
      "status": "RECORDED",
      "ref": "artifact:verification-run-manifests/114-work-queue-state-transition-governance.md",
      "source_system_ref": "artifact:verification-run-manifests/114-work-queue-state-transition-governance.md",
      "source_task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "current_task_match": "Yes",
      "report_digest": "sha256:be5bbb7a59cf10cdaca6133b485a0647fe8bcbd68baf20438252babff7490031",
      "contribution": "Authoritative current-run runtime evidence."
    },
    {
      "name": "task_governance",
      "status": "RECORDED",
      "ref": "artifact:task-governance-reports/114-work-queue-state-transition-governance.md",
      "source_system_ref": "artifact:task-governance-reports/114-work-queue-state-transition-governance.md",
      "source_task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
      "source_outcome": "TASK_GOVERNANCE_RECORDED",
      "current_task_match": "Yes",
      "report_digest": "sha256:186d167dcbdb3a496bba1d45927d59f24d8ecd6554621f38f70b639fb8df8c94",
      "contribution": "Exact current-task task governance authority."
    },
    {
      "name": "plan_review",
      "status": "RECORDED",
      "ref": "artifact:plan-review-reports/114-work-queue-state-transition-governance.md",
      "source_system_ref": "artifact:plan-review-reports/114-work-queue-state-transition-governance.md",
      "source_task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
      "source_outcome": "PLAN_REVIEW_PASSED",
      "current_task_match": "Yes",
      "report_digest": "sha256:ba053a9cb6f3cb59c0ee5fe963ddcc89943904ae9fa2c26c5ab17931800ca78a",
      "contribution": "Exact current-task plan review authority."
    },
    {
      "name": "planning_closure",
      "status": "RECORDED",
      "ref": "artifact:planning-closure-reports/114-work-queue-state-transition-governance.md",
      "source_system_ref": "artifact:planning-closure-reports/114-work-queue-state-transition-governance.md",
      "source_task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
      "source_outcome": "PLANNING_READY",
      "current_task_match": "Yes",
      "report_digest": "sha256:87411d4874a173275deafe5fca2c9d9245f0097dd9bc0c721706c8bc5673f818",
      "contribution": "Exact current-task planning closure authority."
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
  "scenario_assurance_map": [
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-f9debc91cb43fd9fba77",
        "evidence:runtime-observed-proof-e1365db60763a7d95146"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-4806d70d10581ebece9c",
        "evidence:runtime-observed-proof-43849896249e48251b01"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-28883e750e05f58e7ec8",
        "evidence:runtime-observed-proof-a1dac7b2b51b0cea0a3a"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-14e4ee8fa0d71501e4dc",
        "evidence:runtime-observed-proof-0a34fd6b36431e429926"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-15283ff44232463b62d2",
        "evidence:runtime-observed-proof-4dce3290bf54711b05d2"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-57fd8ea95271a4eb9332",
        "evidence:runtime-observed-proof-b2f668c1e31403ae7677"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-6e9c12dd40bceff20ea0",
        "evidence:runtime-observed-proof-69fe80d561e49fd38816"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-c29c55a0dda69b281495",
        "evidence:runtime-observed-proof-e1c3ed4a94562dc69b6f"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-6810949d4f9b89dbad4b",
        "evidence:runtime-observed-proof-5da77e34e453e3012573"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
    }
  ],
  "task_entry_binding": {
    "work_queue_item_ref": "artifact:work-queue-takeover-reports/114-work-queue-state-transition-governance.md#WQ-004",
    "work_queue_item_digest": "sha256:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
    "work_queue_item_state": "CURRENT",
    "work_queue_item_current_task_match": "Yes",
    "approved_resume_review": "No",
    "resume_review_ref": "N/A",
    "resume_review_digest": "N/A",
    "resume_review_owner": "N/A",
    "resume_review_task_match": "N/A",
    "task_governance_ref": "artifact:task-governance-reports/114-work-queue-state-transition-governance.md",
    "task_governance_digest": "sha256:48e382b08b4a109fe66ed415cdd5bc9e723a36f684ad2d6e79408efa51e93e86",
    "task_governance_tier": "HIGH",
    "task_governance_review_level": "FULL",
    "task_governance_task_match": "Yes",
    "minimal_verification_status": "NOT_APPLICABLE_WITH_REASON",
    "targeted_verification_status": "NOT_APPLICABLE_WITH_REASON",
    "high_impact_evidence_chain_complete": "Yes",
    "task_governance_blocks_completion": "No",
    "tier_completion_requirements_satisfied": "Yes",
    "unresolved_task_governance_blockers": [],
    "plain_user_blocker": "N/A"
  },
  "plan_review_binding": {
    "required": "Yes",
    "plan_review_ref": "artifact:plan-review-reports/114-work-queue-state-transition-governance.md",
    "plan_review_digest": "sha256:ab42056e3562fa9b5bf0d50f0f33799270523a95d4f32f320c6e178705f94be3",
    "plan_review_state": "PLAN_REVIEW_PASSED",
    "plan_ref": "implementation-plans/114-work-queue-state-transition-governance.md",
    "plan_digest": "sha256:d5e912104a1897780828633774f6cd4e63b78a3aa6725ba75281016cf43eaec9",
    "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
    "current_task_match": "Yes",
    "ready_for_implementation_review": "Yes",
    "implementation_authorized_by_this_report": "No",
    "reason": "Execution Assurance consumes the exact current-task Plan Review as a non-authorizing implementation review prerequisite."
  },
  "planning_closure_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "planning_closure_ref": "artifact:planning-closure-reports/114-work-queue-state-transition-governance.md",
    "planning_closure_report_digest": "sha256:be9f857fff9d584ebc6323dacc4c0510e46856021a9464a90404e966f202ae5e",
    "planning_closure_core_digest": "sha256:a7121d1c0139136cb133f284c2c3e6b9a4df5615e31a22d8da6dd5cc5ac03cc4",
    "planning_closure_outcome": "PLANNING_READY",
    "task_ref": "task:8dced81757c1775f86637f335ba7e3dd931646e51101dd75018424c210380739",
    "intent_digest": "sha256:a2328ace8561197fad207355fc58f05fb7e4df9cb744c8f44c2bcdc0cbd7b121",
    "current_project_match": "Yes",
    "current_task_match": "Yes",
    "current_intent_match": "Yes",
    "execution_entry_contract_digest": "sha256:ad48d86308660c046b3d908c4ebfb9a311714eb558115cc7f4694662064f21b6",
    "contract_non_authorizing": "Yes",
    "requires_pre_write_revalidation": "Yes",
    "checker": "scripts/check-planning-closure.mjs --require-ready + scripts/check-execution-entry-contract.mjs --require-contract",
    "reason": "The exact current-task Planning Closure and non-authorizing Execution Entry Contract passed their authoritative checkers."
  },
  "pre_write_revalidation": {
    "status": "VERIFIED",
    "checked_at": "2026-07-22T06:22:05.243Z",
    "project_identity": {
      "kind": "GIT",
      "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
      "revision": "sha256:b31b155286370c44f3cac0fe18cef4314e7d01b704fb910bc84a03abc5a4568a"
    },
    "planning_closure_ref": "artifact:planning-closure-reports/114-work-queue-state-transition-governance.md",
    "planning_closure_core_digest": "sha256:a7121d1c0139136cb133f284c2c3e6b9a4df5615e31a22d8da6dd5cc5ac03cc4",
    "execution_entry_contract_digest": "sha256:ad48d86308660c046b3d908c4ebfb9a311714eb558115cc7f4694662064f21b6",
    "source_revision_digest": "sha256:b31b155286370c44f3cac0fe18cef4314e7d01b704fb910bc84a03abc5a4568a",
    "source_git_commit": "212c7e1c8eca0839b2b212af692c5863ecb722f8",
    "candidate_base_revision": "212c7e1c8eca0839b2b212af692c5863ecb722f8",
    "planned_target_paths_digest": "sha256:02d68ee1577f0e72d60a5e03fc86eb336ab918c0bbbd8f1611baed99a9b3720d",
    "actual_changed_paths_digest": "sha256:6d7cb9cd0fe0a4f20bf14ce96ed0132ca4f6e615d3a40676b45452f42903f850",
    "result": "PRE_WRITE_SNAPSHOT_REPLAYED",
    "reason": "The immutable Planning Closure source snapshot, Execution Entry Contract, candidate base, current project identity, planned target set, and observed changed-path set were replayed without widening authority."
  },
  "pending_human_decisions": [],
  "forbidden_claims": [],
  "boundary": {
    "writes_target_files": "No",
    "authorizes_target_file_writes": "No",
    "approves_implementation_beyond_recorded_scope": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "replaces_source_systems": "No",
    "proves_product_correctness": "No",
    "transfers_project_authority_to_intentos": "No"
  },
  "outcome": "VERIFIED_DONE",
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
        "ref": "artifact:test-evidence-reports/114-work-queue-state-transition-governance.md",
        "relative_path": "test-evidence-reports/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:5ef64b4a08b58024cc59c7b50a02ba569c0ab79ded45eaf2b3db0ebf6420f055"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/114-work-queue-state-transition-governance.md",
        "relative_path": "change-impact-coverage-reports/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:c94b561332450a2913bc632a65817abcbdf085e4f61057ec999eae73c3b2301a"
      },
      {
        "ref": "artifact:implementation-plans/114-work-queue-state-transition-governance.md",
        "relative_path": "implementation-plans/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:d5e912104a1897780828633774f6cd4e63b78a3aa6725ba75281016cf43eaec9"
      },
      {
        "ref": "artifact:planning-closure-reports/114-work-queue-state-transition-governance.md",
        "relative_path": "planning-closure-reports/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:87411d4874a173275deafe5fca2c9d9245f0097dd9bc0c721706c8bc5673f818"
      },
      {
        "ref": "artifact:verification-run-manifests/114-work-queue-state-transition-governance.md",
        "relative_path": "verification-run-manifests/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:be5bbb7a59cf10cdaca6133b485a0647fe8bcbd68baf20438252babff7490031"
      },
      {
        "ref": "artifact:plan-review-reports/114-work-queue-state-transition-governance.md",
        "relative_path": "plan-review-reports/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:ba053a9cb6f3cb59c0ee5fe963ddcc89943904ae9fa2c26c5ab17931800ca78a"
      },
      {
        "ref": "artifact:task-governance-reports/114-work-queue-state-transition-governance.md",
        "relative_path": "task-governance-reports/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:186d167dcbdb3a496bba1d45927d59f24d8ecd6554621f38f70b639fb8df8c94"
      },
      {
        "ref": "artifact:verification-runtime-plans/114-work-queue-state-transition-governance.md",
        "relative_path": "verification-runtime-plans/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:a76d3a0400f9b27374b0af25d9b78b7d812edc13d66469432a147bb0c19f9bf7"
      },
      {
        "ref": "artifact:verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md",
        "relative_path": "verification-runtime-lifecycle-plans/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:49d8ca9b8d7399960cd977576cfef78a713bbb978347dd27a8a1c8d1dc04cdcd"
      },
      {
        "ref": "artifact:verification-plans/114-work-queue-state-transition-governance.md",
        "relative_path": "verification-plans/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:435ba891240927ffb7c0b85a568fd572979e0557ede54fcb8a7bcbaf3d44f6b0"
      },
      {
        "ref": "artifact:business-universe-coverage-reports/114-work-queue-state-transition-governance.md",
        "relative_path": "business-universe-coverage-reports/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:44707fc8d2ccf93c9772d28ca375f226719997ff9ba811c1168e7280bb93e7f0"
      },
      {
        "ref": "artifact:work-queue-takeover-reports/114-work-queue-state-transition-governance.md#WQ-004",
        "relative_path": "work-queue-takeover-reports/114-work-queue-state-transition-governance.md",
        "raw_file_digest": "sha256:fb8723a86c86eca2fccc0a7fe9e7873a8f5e6e677e36173ee17ca75841b6f833"
      }
    ]
  }
}
```
