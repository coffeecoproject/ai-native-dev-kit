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
| User Intent | make a local structural split of scripts/check-intentos.mjs into domain suites while preserving output order and exit status |
| Normalized Intent | WORKFLOW_CAPABILITY: make a local structural split of scripts/check-intentos.mjs into domain suites while preserving output order and exit status |
| Task Ref | `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2` |
| Drift Policy | Scope changes require Work Queue or Conversation Drift review. |

## Completion Contract

| Criterion | Status | Evidence | Notes |
| --- | --- | --- | --- |
| criterion:workflow-capability | `DONE` | `artifact:test-evidence-reports/114-check-intentos-modularity.md` | Bound to current task evidence. |

## Planned Impact Map

| Surface | Expected | Status | Evidence | Notes |
| --- | --- | --- | --- |
| user_flow | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-check-intentos-modularity.md` | Planned surface. |
| frontend_ui | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-check-intentos-modularity.md` | Planned surface. |
| api_contract | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-check-intentos-modularity.md` | Planned surface. |
| backend_rule | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-check-intentos-modularity.md` | Planned surface. |
| tests | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-check-intentos-modularity.md` | Planned surface. |
| docs | `Yes` | `DONE` | `artifact:change-impact-coverage-reports/114-check-intentos-modularity.md` | Planned surface. |

## Execution Plan Binding

| Field | Value |
| --- | --- |
| Plan Ref | `artifact:implementation-plans/114-check-intentos-modularity.md` |
| Risk Classification | `MEDIUM` |
| Planned Target Paths | `.intentos/verification-runtime-lifecycle.json, business-rule-closures/114-check-intentos-modularity.md, business-universe-coverage-reports/114-check-intentos-modularity.md, change-boundary-reports/114-check-intentos-modularity.md, change-impact-coverage-reports/114-check-intentos-modularity.md, change-impact-coverage-reports/preflight-114-check-intentos-modularity.md, closure-decisions/114-check-intentos-modularity.md, completion-evidence-reports/114-check-intentos-modularity.md, control-effectiveness-reports/114-check-intentos-modularity.md, evidence/114-check-intentos-control-inventory.json, evidence/114-check-intentos-focused-tests.log, evidence/114-check-intentos-full-verification.log, evidence/114-check-intentos-obligation-evidence.test.mjs, evidence/114-check-intentos-obligation-tests.log, execution-assurance-reports/114-check-intentos-modularity.md, implementation-plans/114-check-intentos-modularity.md, intentos-manifest.json, package.json, plan-review-reports/114-check-intentos-modularity.md, planning-closure-reports/114-check-intentos-modularity.md, review-summaries/114-check-intentos-modularity-business-universe-challenger.md, review-surface-cards/114-check-intentos-modularity.md, scripts/check-consumer-chain.mjs, scripts/check-intentos.mjs, scripts/check-manifest.mjs, scripts/self-check/adoption.mjs, scripts/self-check/architecture.mjs, scripts/self-check/distribution.mjs, scripts/self-check/evidence.mjs, scripts/self-check/foundation.mjs, scripts/self-check/generated-project-e2e.mjs, scripts/self-check/release.mjs, scripts/self-check/runtime.mjs, task-governance-reports/114-check-intentos-modularity.md, test-evidence-reports/114-check-intentos-modularity.md, tests/check-intentos-modularity.test.mjs, tests/execution-distribution-trust.test.mjs, verification-plans/114-check-intentos-modularity.md, verification-run-manifests/114-check-intentos-modularity.md, verification-runtime-lifecycle-plans/114-check-intentos-modularity.md, verification-runtime-plans/114-check-intentos-modularity.md, work-queue-takeover-reports/114-check-intentos-modularity.md, work-queue-transitions/002-114-to-check-intentos-modularity.md, work-queue/114-check-intentos-modularity.md` |
| Approval Ref | `N/A` |
| Restore Strategy | Use task-scoped revert or reviewed restore plan if verification fails. |

## Actual Diff Binding

| Field | Value |
| --- | --- |
| Diff Source | `git:cached` |
| Base Revision | `4d15088900419919b8fa64eeb9b1b78a880f27c9` |
| Changed Files | `intentos-manifest.json, package.json, scripts/check-consumer-chain.mjs, scripts/check-intentos.mjs, scripts/check-manifest.mjs, scripts/self-check/adoption.mjs, scripts/self-check/architecture.mjs, scripts/self-check/distribution.mjs, scripts/self-check/evidence.mjs, scripts/self-check/foundation.mjs, scripts/self-check/generated-project-e2e.mjs, scripts/self-check/release.mjs, scripts/self-check/runtime.mjs, tests/check-intentos-modularity.test.mjs, tests/execution-distribution-trust.test.mjs, work-queue-transitions/002-114-to-check-intentos-modularity.md` |
| Unexpected Files | `none` |
| Target Diff Status | `MATCHED_PLAN` |

## Pre-Write Revalidation

| Field | Value |
| --- | --- |
| Status | `VERIFIED` |
| Checked At | `2026-07-22T16:51:43.671Z` |
| Planning Closure | `artifact:planning-closure-reports/114-check-intentos-modularity.md` |
| Source Revision | `sha256:816381d68be80abd210ab1cc364c3c0317a666ad197e6061bce1bfe176307175` |
| Candidate Base | `4d15088900419919b8fa64eeb9b1b78a880f27c9` |
| Planned Paths Digest | `sha256:1f59a87ac090c825c195ca95d641de5490667f4f1a07ee21a3e891ee2e74e630` |
| Changed Paths Digest | `sha256:7354833a6a69f78f7d33956713b9abac43af02fa6c333f17ed2c8ffd6f2e5025` |
| Result | `PRE_WRITE_SNAPSHOT_REPLAYED` |
| Reason | The immutable Planning Closure source snapshot, Execution Entry Contract, candidate base, current project identity, planned target set, and observed changed-path set were replayed without widening authority. |

## Evidence Binding

| Criterion | Evidence Ref | Resolved | Current Task Match |
| --- | --- | --- | --- |
| criterion:workflow-capability | `artifact:test-evidence-reports/114-check-intentos-modularity.md` | `Yes` | `Yes` |
| criterion:planning-closure | `artifact:planning-closure-reports/114-check-intentos-modularity.md` | `Yes` | `Yes` |
| criterion:runtime-trust | `artifact:verification-run-manifests/114-check-intentos-modularity.md` | `Yes` | `Yes` |

## Task Entry Binding

- Work Queue item: `artifact:work-queue-takeover-reports/114-check-intentos-modularity.md#WQ-004`
- Task Governance: `artifact:task-governance-reports/114-check-intentos-modularity.md`
- Task impact: `MEDIUM`
- Completion requirements satisfied: `Yes`

## Plan Review Binding

- Review: `artifact:plan-review-reports/114-check-intentos-modularity.md`
- State: `PLAN_REVIEW_PASSED`
- Current task match: `Yes`

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
- Assessment outcome: `CONTROL_PROVEN_EFFECTIVE`
- Reason: The exact current report proves every relied-on bounded control claim.

## Business Universe Assurance

| Field | Value |
| --- | --- |
| Required | `Yes` |
| Routing Result | `REQUIRED_WITH_EVIDENCE` |
| Coverage Ref | `artifact:business-universe-coverage-reports/114-check-intentos-modularity.md` |
| Coverage State | `COVERAGE_READY` |
| Mapping Status | `COMPLETE` |

| Coverage Scenario | Required Obligations | Covered Obligations | Test Evidence | Required Proof | Test State | Assurance State |
| --- | --- | --- | --- | --- | --- | --- |
| `coverage-scenario:01d578497ee5964233f79b03` | `verify:universe-33f79b03-expected, verify:universe-33f79b03-negative` | `verify:universe-33f79b03-expected, verify:universe-33f79b03-negative` | `evidence:runtime-observed-proof-a7db5697eaf0071a961e, evidence:observed-proof-9041068c33ac34f23d6f, evidence:runtime-observed-proof-f3fc1574b8d38dac1b9f, evidence:observed-proof-5bc8f6e927f79c5c1c45` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:9b4a4ff97feb8d5006f53a6d` | `verify:universe-06f53a6d-expected, verify:universe-06f53a6d-negative` | `verify:universe-06f53a6d-expected, verify:universe-06f53a6d-negative` | `evidence:runtime-observed-proof-62c209cdbef5f80301a0, evidence:observed-proof-1238a1aaa17bbbe2993c, evidence:runtime-observed-proof-0e78487fbf01eb6ae23d, evidence:observed-proof-8a219fe3dbde68666d9c` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:7f0e56b0e62657c56bce3aca` | `verify:universe-6bce3aca-expected, verify:universe-6bce3aca-negative` | `verify:universe-6bce3aca-expected, verify:universe-6bce3aca-negative` | `evidence:runtime-observed-proof-90f522fb3f39bec9160b, evidence:observed-proof-3a2a1b29715729b136d9, evidence:runtime-observed-proof-8358cc1818e9096259d3, evidence:observed-proof-fc97f697b390c494e350` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:303aba3df26da849267360df` | `verify:universe-267360df-expected, verify:universe-267360df-negative` | `verify:universe-267360df-expected, verify:universe-267360df-negative` | `evidence:runtime-observed-proof-f44b30eac9a365210ad8, evidence:observed-proof-2b43d9a428490082613b, evidence:runtime-observed-proof-0ff12c3847670c22b7cc, evidence:observed-proof-e7294bc2373d0e4d9000` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:7498182880c709117e157cbe` | `verify:universe-7e157cbe-expected, verify:universe-7e157cbe-negative` | `verify:universe-7e157cbe-expected, verify:universe-7e157cbe-negative` | `evidence:runtime-observed-proof-d8c267998992894a7bde, evidence:observed-proof-021b518037ae396ab980, evidence:runtime-observed-proof-81a576981ce9d2dcc956, evidence:observed-proof-b9047194ba1104b7b57c` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:5696811b3d45e0a14c6a26a6` | `verify:universe-4c6a26a6-expected, verify:universe-4c6a26a6-negative` | `verify:universe-4c6a26a6-expected, verify:universe-4c6a26a6-negative` | `evidence:runtime-observed-proof-511ebc38db56ebe97e1a, evidence:observed-proof-82c6c24455d77d20e0de, evidence:runtime-observed-proof-c091bdd7531ca8f7e40f, evidence:observed-proof-fb05f348a82dbd4c366e` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:c53e9fdd0c1684bdf256ee46` | `verify:universe-f256ee46-expected, verify:universe-f256ee46-negative` | `verify:universe-f256ee46-expected, verify:universe-f256ee46-negative` | `evidence:runtime-observed-proof-e3b6e3fe3966197b692e, evidence:observed-proof-eba971b1105442e79b17, evidence:runtime-observed-proof-fa8a1cbbc5f3a1a862af, evidence:observed-proof-cba7323d4bc53dce3878` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:ecda09645d937df4ad616f84` | `verify:universe-ad616f84-expected, verify:universe-ad616f84-negative` | `verify:universe-ad616f84-expected, verify:universe-ad616f84-negative` | `evidence:runtime-observed-proof-f79dbb28a193d88d075f, evidence:observed-proof-bf903960f7fd0068f8d7, evidence:runtime-observed-proof-0ace619d9174686a7338, evidence:observed-proof-fc99fc6fec7fdd2f6fb8` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |
| `coverage-scenario:53bcc8749ab68010a8dfc71b` | `verify:universe-a8dfc71b-expected, verify:universe-a8dfc71b-negative` | `verify:universe-a8dfc71b-expected, verify:universe-a8dfc71b-negative` | `evidence:runtime-observed-proof-bcc025bbfdd6ab5f13aa, evidence:observed-proof-acec8182644ab931990d, evidence:runtime-observed-proof-72cafc3e8aa6bd85c7e5, evidence:observed-proof-fb1b68fc33a7866da7c7` | `PROJECT_NATIVE_BEHAVIOR_PROOF` | `COVERED` | `ASSURED` |

## Independent Review Binding

| Field | Value |
| --- | --- |
| Review Required | `Yes` |
| Review Refs | `artifact:plan-review-reports/114-check-intentos-modularity.md` |
| All Reviewers Closed | `Yes` |

## Patch Assessment

| Field | Value |
| --- | --- |
| Patch State | `NOT_A_PATCH` |
| Reason | Normal planned execution. |

## Source System Trace

| Source System | Status | Ref | Source Task | Source Outcome | Current Task Match | Digest | Contribution | Authority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| change_impact_coverage | `RECORDED` | `artifact:change-impact-coverage-reports/114-check-intentos-modularity.md` | `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2` | `CHANGE_IMPACT_RECORDED` | `Yes` | `sha256:ae90b05e06b52ac4f012d218ed4f8c43633c2826ced3f8716a22b7e2f83a8c76` | change-impact-coverage-reports evidence present. | Source system |
| test_evidence | `RECORDED` | `artifact:test-evidence-reports/114-check-intentos-modularity.md` | `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2` | `TEST_EVIDENCE_COMPLETE` | `Yes` | `sha256:a92ebdb8bd02aa694dcb2ce4bdc7ba5ecd329b55a1e11cdb0070f1f6c7bb4192` | test-evidence-reports evidence present. | Source system |
| verification_run_manifest | `RECORDED` | `artifact:verification-run-manifests/114-check-intentos-modularity.md` | `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2` | `RUNTIME_TRUST_COMPLETE` | `Yes` | `sha256:03f79d1c7d22f7a83632334e79d9e4a93e514b9c66ab86e73900b12d44a450e7` | Authoritative current-run runtime evidence. | Source system |
| task_governance | `RECORDED` | `artifact:task-governance-reports/114-check-intentos-modularity.md` | `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2` | `TASK_GOVERNANCE_RECORDED` | `Yes` | `sha256:a198a3c23f4b442cacbd2b9935359d51a3df319bfa4173ad7f99abe9b965b7bb` | Exact current-task task governance authority. | Source system |
| plan_review | `RECORDED` | `artifact:plan-review-reports/114-check-intentos-modularity.md` | `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2` | `PLAN_REVIEW_PASSED` | `Yes` | `sha256:0b8afdc1cab456ab2157dd42e0247f867219eb7ad4bc410f4565be1ba0340946` | Exact current-task plan review authority. | Source system |
| planning_closure | `RECORDED` | `artifact:planning-closure-reports/114-check-intentos-modularity.md` | `task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2` | `PLANNING_READY` | `Yes` | `sha256:cfac99b0375f6387193424836d460e0abe551954174fe220c6409b2e91348600` | Exact current-task planning closure authority. | Source system |

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
  "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
  "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9",
  "assurance_state": "VERIFIED_DONE",
  "can_claim_done": "Yes",
  "can_codex_write_now": "No",
  "intent_lock": {
    "user_intent": "make a local structural split of scripts/check-intentos.mjs into domain suites while preserving output order and exit status",
    "normalized_intent": "WORKFLOW_CAPABILITY: make a local structural split of scripts/check-intentos.mjs into domain suites while preserving output order and exit status",
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
          "artifact:test-evidence-reports/114-check-intentos-modularity.md"
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
          "artifact:change-impact-coverage-reports/114-check-intentos-modularity.md"
        ]
      },
      {
        "surface": "frontend_ui",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-check-intentos-modularity.md"
        ]
      },
      {
        "surface": "api_contract",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-check-intentos-modularity.md"
        ]
      },
      {
        "surface": "backend_rule",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-check-intentos-modularity.md"
        ]
      },
      {
        "surface": "tests",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-check-intentos-modularity.md"
        ]
      },
      {
        "surface": "docs",
        "expected": "Yes",
        "status": "DONE",
        "evidence_refs": [
          "artifact:change-impact-coverage-reports/114-check-intentos-modularity.md"
        ]
      }
    ]
  },
  "execution_plan": {
    "plan_ref": "artifact:implementation-plans/114-check-intentos-modularity.md",
    "planned_target_paths": [
      ".intentos/verification-runtime-lifecycle.json",
      "business-rule-closures/114-check-intentos-modularity.md",
      "business-universe-coverage-reports/114-check-intentos-modularity.md",
      "change-boundary-reports/114-check-intentos-modularity.md",
      "change-impact-coverage-reports/114-check-intentos-modularity.md",
      "change-impact-coverage-reports/preflight-114-check-intentos-modularity.md",
      "closure-decisions/114-check-intentos-modularity.md",
      "completion-evidence-reports/114-check-intentos-modularity.md",
      "control-effectiveness-reports/114-check-intentos-modularity.md",
      "evidence/114-check-intentos-control-inventory.json",
      "evidence/114-check-intentos-focused-tests.log",
      "evidence/114-check-intentos-full-verification.log",
      "evidence/114-check-intentos-obligation-evidence.test.mjs",
      "evidence/114-check-intentos-obligation-tests.log",
      "execution-assurance-reports/114-check-intentos-modularity.md",
      "implementation-plans/114-check-intentos-modularity.md",
      "intentos-manifest.json",
      "package.json",
      "plan-review-reports/114-check-intentos-modularity.md",
      "planning-closure-reports/114-check-intentos-modularity.md",
      "review-summaries/114-check-intentos-modularity-business-universe-challenger.md",
      "review-surface-cards/114-check-intentos-modularity.md",
      "scripts/check-consumer-chain.mjs",
      "scripts/check-intentos.mjs",
      "scripts/check-manifest.mjs",
      "scripts/self-check/adoption.mjs",
      "scripts/self-check/architecture.mjs",
      "scripts/self-check/distribution.mjs",
      "scripts/self-check/evidence.mjs",
      "scripts/self-check/foundation.mjs",
      "scripts/self-check/generated-project-e2e.mjs",
      "scripts/self-check/release.mjs",
      "scripts/self-check/runtime.mjs",
      "task-governance-reports/114-check-intentos-modularity.md",
      "test-evidence-reports/114-check-intentos-modularity.md",
      "tests/check-intentos-modularity.test.mjs",
      "tests/execution-distribution-trust.test.mjs",
      "verification-plans/114-check-intentos-modularity.md",
      "verification-run-manifests/114-check-intentos-modularity.md",
      "verification-runtime-lifecycle-plans/114-check-intentos-modularity.md",
      "verification-runtime-plans/114-check-intentos-modularity.md",
      "work-queue-takeover-reports/114-check-intentos-modularity.md",
      "work-queue-transitions/002-114-to-check-intentos-modularity.md",
      "work-queue/114-check-intentos-modularity.md"
    ],
    "risk_classification": "MEDIUM",
    "approval_refs": [],
    "restore_strategy": "Use task-scoped revert or reviewed restore plan if verification fails."
  },
  "actual_diff": {
    "diff_source": "git:cached",
    "base_revision": "4d15088900419919b8fa64eeb9b1b78a880f27c9",
    "changed_files": [
      "intentos-manifest.json",
      "package.json",
      "scripts/check-consumer-chain.mjs",
      "scripts/check-intentos.mjs",
      "scripts/check-manifest.mjs",
      "scripts/self-check/adoption.mjs",
      "scripts/self-check/architecture.mjs",
      "scripts/self-check/distribution.mjs",
      "scripts/self-check/evidence.mjs",
      "scripts/self-check/foundation.mjs",
      "scripts/self-check/generated-project-e2e.mjs",
      "scripts/self-check/release.mjs",
      "scripts/self-check/runtime.mjs",
      "tests/check-intentos-modularity.test.mjs",
      "tests/execution-distribution-trust.test.mjs",
      "work-queue-transitions/002-114-to-check-intentos-modularity.md"
    ],
    "unexpected_files": [],
    "target_diff_status": "MATCHED_PLAN"
  },
  "evidence_bindings": [
    {
      "criterion_id": "criterion:workflow-capability",
      "evidence_ref": "artifact:test-evidence-reports/114-check-intentos-modularity.md",
      "resolved": "Yes",
      "current_task_match": "Yes"
    },
    {
      "criterion_id": "criterion:planning-closure",
      "evidence_ref": "artifact:planning-closure-reports/114-check-intentos-modularity.md",
      "resolved": "Yes",
      "current_task_match": "Yes"
    },
    {
      "criterion_id": "criterion:runtime-trust",
      "evidence_ref": "artifact:verification-run-manifests/114-check-intentos-modularity.md",
      "resolved": "Yes",
      "current_task_match": "Yes"
    }
  ],
  "review": {
    "review_required": "Yes",
    "review_refs": [
      "artifact:plan-review-reports/114-check-intentos-modularity.md"
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
      "ref": "artifact:change-impact-coverage-reports/114-check-intentos-modularity.md",
      "source_system_ref": "artifact:change-impact-coverage-reports/114-check-intentos-modularity.md",
      "source_task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
      "source_outcome": "CHANGE_IMPACT_RECORDED",
      "current_task_match": "Yes",
      "report_digest": "sha256:ae90b05e06b52ac4f012d218ed4f8c43633c2826ced3f8716a22b7e2f83a8c76",
      "contribution": "change-impact-coverage-reports evidence present."
    },
    {
      "name": "test_evidence",
      "status": "RECORDED",
      "ref": "artifact:test-evidence-reports/114-check-intentos-modularity.md",
      "source_system_ref": "artifact:test-evidence-reports/114-check-intentos-modularity.md",
      "source_task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
      "source_outcome": "TEST_EVIDENCE_COMPLETE",
      "current_task_match": "Yes",
      "report_digest": "sha256:a92ebdb8bd02aa694dcb2ce4bdc7ba5ecd329b55a1e11cdb0070f1f6c7bb4192",
      "contribution": "test-evidence-reports evidence present."
    },
    {
      "name": "verification_run_manifest",
      "status": "RECORDED",
      "ref": "artifact:verification-run-manifests/114-check-intentos-modularity.md",
      "source_system_ref": "artifact:verification-run-manifests/114-check-intentos-modularity.md",
      "source_task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
      "source_outcome": "RUNTIME_TRUST_COMPLETE",
      "current_task_match": "Yes",
      "report_digest": "sha256:03f79d1c7d22f7a83632334e79d9e4a93e514b9c66ab86e73900b12d44a450e7",
      "contribution": "Authoritative current-run runtime evidence."
    },
    {
      "name": "task_governance",
      "status": "RECORDED",
      "ref": "artifact:task-governance-reports/114-check-intentos-modularity.md",
      "source_system_ref": "artifact:task-governance-reports/114-check-intentos-modularity.md",
      "source_task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
      "source_outcome": "TASK_GOVERNANCE_RECORDED",
      "current_task_match": "Yes",
      "report_digest": "sha256:a198a3c23f4b442cacbd2b9935359d51a3df319bfa4173ad7f99abe9b965b7bb",
      "contribution": "Exact current-task task governance authority."
    },
    {
      "name": "plan_review",
      "status": "RECORDED",
      "ref": "artifact:plan-review-reports/114-check-intentos-modularity.md",
      "source_system_ref": "artifact:plan-review-reports/114-check-intentos-modularity.md",
      "source_task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
      "source_outcome": "PLAN_REVIEW_PASSED",
      "current_task_match": "Yes",
      "report_digest": "sha256:0b8afdc1cab456ab2157dd42e0247f867219eb7ad4bc410f4565be1ba0340946",
      "contribution": "Exact current-task plan review authority."
    },
    {
      "name": "planning_closure",
      "status": "RECORDED",
      "ref": "artifact:planning-closure-reports/114-check-intentos-modularity.md",
      "source_system_ref": "artifact:planning-closure-reports/114-check-intentos-modularity.md",
      "source_task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
      "source_outcome": "PLANNING_READY",
      "current_task_match": "Yes",
      "report_digest": "sha256:cfac99b0375f6387193424836d460e0abe551954174fe220c6409b2e91348600",
      "contribution": "Exact current-task planning closure authority."
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
  "scenario_assurance_map": [
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-a7db5697eaf0071a961e",
        "evidence:observed-proof-9041068c33ac34f23d6f",
        "evidence:runtime-observed-proof-f3fc1574b8d38dac1b9f",
        "evidence:observed-proof-5bc8f6e927f79c5c1c45"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-62c209cdbef5f80301a0",
        "evidence:observed-proof-1238a1aaa17bbbe2993c",
        "evidence:runtime-observed-proof-0e78487fbf01eb6ae23d",
        "evidence:observed-proof-8a219fe3dbde68666d9c"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-90f522fb3f39bec9160b",
        "evidence:observed-proof-3a2a1b29715729b136d9",
        "evidence:runtime-observed-proof-8358cc1818e9096259d3",
        "evidence:observed-proof-fc97f697b390c494e350"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-f44b30eac9a365210ad8",
        "evidence:observed-proof-2b43d9a428490082613b",
        "evidence:runtime-observed-proof-0ff12c3847670c22b7cc",
        "evidence:observed-proof-e7294bc2373d0e4d9000"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-d8c267998992894a7bde",
        "evidence:observed-proof-021b518037ae396ab980",
        "evidence:runtime-observed-proof-81a576981ce9d2dcc956",
        "evidence:observed-proof-b9047194ba1104b7b57c"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-511ebc38db56ebe97e1a",
        "evidence:observed-proof-82c6c24455d77d20e0de",
        "evidence:runtime-observed-proof-c091bdd7531ca8f7e40f",
        "evidence:observed-proof-fb05f348a82dbd4c366e"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-e3b6e3fe3966197b692e",
        "evidence:observed-proof-eba971b1105442e79b17",
        "evidence:runtime-observed-proof-fa8a1cbbc5f3a1a862af",
        "evidence:observed-proof-cba7323d4bc53dce3878"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-f79dbb28a193d88d075f",
        "evidence:observed-proof-bf903960f7fd0068f8d7",
        "evidence:runtime-observed-proof-0ace619d9174686a7338",
        "evidence:observed-proof-fc99fc6fec7fdd2f6fb8"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
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
      "test_evidence_ids": [
        "evidence:runtime-observed-proof-bcc025bbfdd6ab5f13aa",
        "evidence:observed-proof-acec8182644ab931990d",
        "evidence:runtime-observed-proof-72cafc3e8aa6bd85c7e5",
        "evidence:observed-proof-fb1b68fc33a7866da7c7"
      ],
      "required_proof_strength": "PROJECT_NATIVE_BEHAVIOR_PROOF",
      "test_evidence_state": "COVERED",
      "assurance_state": "ASSURED"
    }
  ],
  "task_entry_binding": {
    "work_queue_item_ref": "artifact:work-queue-takeover-reports/114-check-intentos-modularity.md#WQ-004",
    "work_queue_item_digest": "sha256:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
    "work_queue_item_state": "CURRENT",
    "work_queue_item_current_task_match": "Yes",
    "approved_resume_review": "No",
    "resume_review_ref": "N/A",
    "resume_review_digest": "N/A",
    "resume_review_owner": "N/A",
    "resume_review_task_match": "N/A",
    "task_governance_ref": "artifact:task-governance-reports/114-check-intentos-modularity.md",
    "task_governance_digest": "sha256:8543bca25101ba98c2a2404136f378f7f294b5921217c2caf882679e7c0c2f51",
    "task_governance_tier": "MEDIUM",
    "task_governance_review_level": "TARGETED",
    "task_governance_task_match": "Yes",
    "minimal_verification_status": "NOT_APPLICABLE_WITH_REASON",
    "targeted_verification_status": "RECORDED",
    "high_impact_evidence_chain_complete": "N/A",
    "task_governance_blocks_completion": "No",
    "tier_completion_requirements_satisfied": "Yes",
    "unresolved_task_governance_blockers": [],
    "plain_user_blocker": "N/A"
  },
  "plan_review_binding": {
    "required": "Yes",
    "plan_review_ref": "artifact:plan-review-reports/114-check-intentos-modularity.md",
    "plan_review_digest": "sha256:d904f6bdda658f8d0f582279cb99d75f574d9f315c781f0c53d54fa7f62ac2b5",
    "plan_review_state": "PLAN_REVIEW_PASSED",
    "plan_ref": "implementation-plans/114-check-intentos-modularity.md",
    "plan_digest": "sha256:ccc2358312286e0c2666e3f4b380edeca979dc3cf674a2ce99949397cce1c13a",
    "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
    "current_task_match": "Yes",
    "ready_for_implementation_review": "Yes",
    "implementation_authorized_by_this_report": "No",
    "reason": "Execution Assurance consumes the exact current-task Plan Review as a non-authorizing implementation review prerequisite."
  },
  "planning_closure_binding": {
    "requirement": "REQUIRED",
    "status": "VERIFIED",
    "planning_closure_ref": "artifact:planning-closure-reports/114-check-intentos-modularity.md",
    "planning_closure_report_digest": "sha256:0d0f8c09f03fcbb632baba078604c01c6ddb904d2e7d826362bf23470c8b84ec",
    "planning_closure_core_digest": "sha256:21d5ac9bb49ab744cef4d8751e47729bf9011560769f04f9169c8b8efff7b8b6",
    "planning_closure_outcome": "PLANNING_READY",
    "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
    "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9",
    "current_project_match": "Yes",
    "current_task_match": "Yes",
    "current_intent_match": "Yes",
    "execution_entry_contract_digest": "sha256:6f833b0e09a192d58a7eed7f6c7608f89f877be6ef6847b6866e74d191f17551",
    "contract_non_authorizing": "Yes",
    "requires_pre_write_revalidation": "Yes",
    "checker": "scripts/check-planning-closure.mjs --require-ready + scripts/check-execution-entry-contract.mjs --require-contract",
    "reason": "The exact current-task Planning Closure and non-authorizing Execution Entry Contract passed their authoritative checkers."
  },
  "pre_write_revalidation": {
    "status": "VERIFIED",
    "checked_at": "2026-07-22T16:51:43.671Z",
    "project_identity": {
      "kind": "GIT",
      "fingerprint": "sha256:4a77760d85b61ab83d59a03b95a53a3ef502e9467711cef8ca0603a585905d58",
      "revision": "sha256:816381d68be80abd210ab1cc364c3c0317a666ad197e6061bce1bfe176307175"
    },
    "planning_closure_ref": "artifact:planning-closure-reports/114-check-intentos-modularity.md",
    "planning_closure_core_digest": "sha256:21d5ac9bb49ab744cef4d8751e47729bf9011560769f04f9169c8b8efff7b8b6",
    "execution_entry_contract_digest": "sha256:6f833b0e09a192d58a7eed7f6c7608f89f877be6ef6847b6866e74d191f17551",
    "source_revision_digest": "sha256:816381d68be80abd210ab1cc364c3c0317a666ad197e6061bce1bfe176307175",
    "source_git_commit": "4d15088900419919b8fa64eeb9b1b78a880f27c9",
    "candidate_base_revision": "4d15088900419919b8fa64eeb9b1b78a880f27c9",
    "planned_target_paths_digest": "sha256:1f59a87ac090c825c195ca95d641de5490667f4f1a07ee21a3e891ee2e74e630",
    "actual_changed_paths_digest": "sha256:7354833a6a69f78f7d33956713b9abac43af02fa6c333f17ed2c8ffd6f2e5025",
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
      "revision": "sha256:816381d68be80abd210ab1cc364c3c0317a666ad197e6061bce1bfe176307175"
    },
    "task": {
      "task_ref": "task:12c82c109c92bf447d2fef6ab90654f6bed9f8d6a657e8a632d267297cf6c3a2",
      "intent_digest": "sha256:336b6588463f13f6d0e2a4c87e19884bfc24623655942589f1f6caf0d7753ae9"
    },
    "sources": [
      {
        "ref": "artifact:test-evidence-reports/114-check-intentos-modularity.md",
        "relative_path": "test-evidence-reports/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:a92ebdb8bd02aa694dcb2ce4bdc7ba5ecd329b55a1e11cdb0070f1f6c7bb4192"
      },
      {
        "ref": "artifact:change-impact-coverage-reports/114-check-intentos-modularity.md",
        "relative_path": "change-impact-coverage-reports/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:ae90b05e06b52ac4f012d218ed4f8c43633c2826ced3f8716a22b7e2f83a8c76"
      },
      {
        "ref": "artifact:implementation-plans/114-check-intentos-modularity.md",
        "relative_path": "implementation-plans/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:ccc2358312286e0c2666e3f4b380edeca979dc3cf674a2ce99949397cce1c13a"
      },
      {
        "ref": "artifact:planning-closure-reports/114-check-intentos-modularity.md",
        "relative_path": "planning-closure-reports/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:cfac99b0375f6387193424836d460e0abe551954174fe220c6409b2e91348600"
      },
      {
        "ref": "artifact:verification-run-manifests/114-check-intentos-modularity.md",
        "relative_path": "verification-run-manifests/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:03f79d1c7d22f7a83632334e79d9e4a93e514b9c66ab86e73900b12d44a450e7"
      },
      {
        "ref": "artifact:plan-review-reports/114-check-intentos-modularity.md",
        "relative_path": "plan-review-reports/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:0b8afdc1cab456ab2157dd42e0247f867219eb7ad4bc410f4565be1ba0340946"
      },
      {
        "ref": "artifact:task-governance-reports/114-check-intentos-modularity.md",
        "relative_path": "task-governance-reports/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:a198a3c23f4b442cacbd2b9935359d51a3df319bfa4173ad7f99abe9b965b7bb"
      },
      {
        "ref": "artifact:verification-runtime-plans/114-check-intentos-modularity.md",
        "relative_path": "verification-runtime-plans/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:6bb9f0859e746176d4713eae33ae8b7724609d21b1f207b1a5755820ff07eb46"
      },
      {
        "ref": "artifact:verification-runtime-lifecycle-plans/114-check-intentos-modularity.md",
        "relative_path": "verification-runtime-lifecycle-plans/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:3d87e90f9de56cb519ac3432bb35bcce0031c131a6ff1aecdaec3cf307ce2fb4"
      },
      {
        "ref": "artifact:verification-plans/114-check-intentos-modularity.md",
        "relative_path": "verification-plans/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:d3079dbcf49977b17d733bacac12a2bb40dc9bd004b7ac2e54f49e0a2b34cd8b"
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
        "ref": "artifact:work-queue-takeover-reports/114-check-intentos-modularity.md#WQ-004",
        "relative_path": "work-queue-takeover-reports/114-check-intentos-modularity.md",
        "raw_file_digest": "sha256:5b45aa55c3e347b459f7a98c3203647abaa065cbd8a9dc196227e9680aa7bbfa"
      }
    ]
  }
}
```
