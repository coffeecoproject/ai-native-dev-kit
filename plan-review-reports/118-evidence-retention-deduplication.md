# Plan Review Report

## Human Summary

- Plain summary: The plan review passed. I can move to implementation review if the project workflow also allows it.
- Plain next step: Move to implementation review under the approved project scope; this report still does not approve implementation by itself.
- Plan review state: `PLAN_REVIEW_PASSED`
- Ready for implementation review: Yes
- This report authorizes implementation: No

## Plan Identity

| Field | Value |
| --- | --- |
| Plan ref | implementation-plans/118-evidence-retention-deduplication.md |
| Plan digest | sha256:53fe6c5d12ef61945d596f9eb90266afb655dbaa0e54256049af673d0d5a4433 |
| Plan task match | Yes |
| Task ref | task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f |

## Task Governance Binding

| Field | Value |
| --- | --- |
| Task Governance ref | artifact:task-governance-reports/118-evidence-retention-deduplication.md |
| Task Governance digest | sha256:3d759ef3304acccf870f88cc04ab50b0e0b1f6a1251504623197029de117ee6a |
| Task impact | HIGH |
| Plan review required | Yes |
| Current task match | Yes |

## Plan Content Review

| Field | Value |
| --- | --- |
| Status | COMPLETE |
| Scope section present | Yes |
| Boundaries section present | Yes |
| Implementation sequence present | Yes |
| Verification section present | Yes |
| Rollback/recovery section present | Yes |
| Concrete target refs | .intentos/evidence-retention-policy.json, scripts/check-evidence-retention.mjs, scripts/lib/evidence-retention.mjs, scripts/resolve-business-universe-coverage.mjs, templates/workflow-version.json, tests/evidence-retention.test.mjs |
| Implementation step count | 8 |
| Missing requirements | N/A |

## Business Universe Binding

| Field | Value |
| --- | --- |
| Required | Yes |
| Routing result | REQUIRED_WITH_EVIDENCE |
| Coverage ref | artifact:business-universe-coverage-reports/118-evidence-retention-deduplication.md |
| Coverage digest | sha256:9e2514fbde77b9a5b32d0da2f8cc0df1deda875a04c34ba75a4f996cef43b823 |
| Coverage state | COVERAGE_READY |
| Coverage scenarios | coverage-scenario:066f1fee0cdbf5f993e4686c, coverage-scenario:a109f7bce060ab502118bb89, coverage-scenario:4959cf4953da04a02020517d, coverage-scenario:c7983fd3a2b96b768140bff0, coverage-scenario:b378ce917c0d0bb34193ff31 |
| Scenario review | COMPLETE |
| Lifecycle review | COMPLETE |
| Provenance review | COMPLETE |
| Challenger required | Yes |
| Challenger status | PASSED |

## Control Effectiveness Binding

| Field | Value |
| --- | --- |
| Requirement | NOT_REQUIRED |
| Status | NOT_REQUIRED |
| Report ref | N/A |
| Report digest | N/A |
| Required claims | N/A |
| Assessment outcome | NOT_APPLICABLE_WITH_REASON |
| Reason | The current task does not rely on a control as proof for its adoption, plan, verification, release-readiness, or completion claim. |

## Business Universe Scenario Reviews

| Review ID | Source scenarios | Surfaces | Lifecycle | Provenance | Negative/reverse | State |
| --- | --- | --- | --- | --- | --- | --- |
| plan-scenario-review:1-93e4686c | coverage-scenario:066f1fee0cdbf5f993e4686c | scope, verification, permission, data_destructive, business_rule, frontend_backend_consistency, release, business_universe_scenario_review | Yes | Yes | Yes | REVIEWED |
| plan-scenario-review:2-2118bb89 | coverage-scenario:a109f7bce060ab502118bb89 | scope, verification, permission, data_destructive, business_rule, frontend_backend_consistency, release, business_universe_scenario_review | Yes | Yes | Yes | REVIEWED |
| plan-scenario-review:3-2020517d | coverage-scenario:4959cf4953da04a02020517d | scope, verification, permission, data_destructive, business_rule, frontend_backend_consistency, release, business_universe_scenario_review | Yes | Yes | Yes | REVIEWED |
| plan-scenario-review:4-8140bff0 | coverage-scenario:c7983fd3a2b96b768140bff0 | scope, verification, permission, data_destructive, business_rule, frontend_backend_consistency, release, business_universe_scenario_review | Yes | Yes | Yes | REVIEWED |
| plan-scenario-review:5-4193ff31 | coverage-scenario:b378ce917c0d0bb34193ff31 | scope, verification, permission, data_destructive, business_rule, frontend_backend_consistency, release, business_universe_scenario_review | Yes | Yes | Yes | REVIEWED |

## Review Surface Analysis

| Field | Value |
| --- | --- |
| Review surface ref | artifact:review-surface-cards/118-evidence-retention-deduplication.md |
| Review surface digest | sha256:3e97ff0e71568b042e0a35f097f93da9b0f538dc0ab64109e765132dc90d8717 |
| Source | review_surface_card |
| Derived by Plan Review | No |
| Current task match | Yes |
| User selected surfaces | No |

## Review Surface Matrix

| Surface | Required | Before implementation | After implementation | Reviewed | Human decision needed | Findings | Blocking |
| --- | --- | --- | --- | --- | --- | --- | --- |
| scope | Yes | Yes | Yes | Yes | No | 0 | No |
| verification | Yes | Yes | Yes | Yes | No | 0 | No |
| permission | Yes | Yes | Yes | Yes | No | 0 | No |
| data_destructive | Yes | Yes | Yes | Yes | No | 0 | No |
| business_rule | Yes | Yes | Yes | Yes | No | 0 | No |
| frontend_backend_consistency | Yes | Yes | Yes | Yes | No | 0 | No |
| release | Yes | Yes | Yes | Yes | No | 0 | No |
| business_universe_scenario_review | Yes | Yes | Yes | Yes | No | 0 | No |

## Source Chain

| Source kind | Ref | Digest | State | Current task match | Project-native equivalent | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| task_governance | artifact:task-governance-reports/118-evidence-retention-deduplication.md | sha256:789464dcc61bc3865a32ce19d0cf451128a68ae68e03b8fcbeb3bf63e5dfe9e4 | HIGH_REQUIRES_FULL_GOVERNANCE | Yes | No | intentos-governance |
| review_surface_card | artifact:review-surface-cards/118-evidence-retention-deduplication.md | sha256:3e97ff0e71568b042e0a35f097f93da9b0f538dc0ab64109e765132dc90d8717 | RECORDED | N/A | Yes | project-review-evidence |
| verification_plan | artifact:verification-plans/118-evidence-retention-deduplication.md | sha256:d29e767295f6fa2f455b1b3cc7bdce7404c59f0ba2be7687580aba342cb59ba7 | VERIFICATION_PLAN_READY | Yes | No | codex |
| business_rule_closure | artifact:business-rule-closures/118-evidence-retention-deduplication.md | sha256:0461ce55d4322962ec5fe32c0ecdbf651b729fb3e2a51967adaf09d1db3731c5 | READY_FOR_IMPACT_COVERAGE | Yes | No | project-business-evidence |
| change_impact_coverage | artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md | sha256:0cdf1a1ddac44d157a4fe64697110cf37bad5a2952df65f4a1e8efd44a9e9865 | CHANGE_IMPACT_RECORDED | Yes | No | codex |
| business_universe_coverage | artifact:business-universe-coverage-reports/118-evidence-retention-deduplication.md | sha256:28431bdc8483af2bf5a012f4a823b814ae4240a630e190d1c2b7950f233e2095 | COVERAGE_READY | Yes | No | codex |

## Reviewed Surfaces

| Surface | Reviewed | Finding count | Notes |
| --- | --- | --- | --- |
| scope | Yes | 0 | Surface was reviewed against the plan. |
| verification | Yes | 0 | Surface was reviewed against the plan. |
| permission | Yes | 0 | Surface was reviewed against the plan. |
| data_destructive | Yes | 0 | Surface was reviewed against the plan. |
| business_rule | Yes | 0 | Surface was reviewed against the plan. |
| frontend_backend_consistency | Yes | 0 | Surface was reviewed against the plan. |
| release | Yes | 0 | Surface was reviewed against the plan. |
| business_universe_scenario_review | Yes | 0 | Surface was reviewed against the plan. |

## Findings

| ID | Severity | Surface | Summary | Required action | Resolved | Accepted |
| --- | --- | --- | --- | --- | --- | --- |
| N/A | P3 | none | No blocking findings. | N/A | Yes | No |

## Revision Loop

| Field | Value |
| --- | --- |
| Round | 0 |
| Max automatic rounds | 2 |
| Requires revision | No |
| Previous plan digest | N/A |
| Rewrites original plan | No |

## Verification Command Review

| Field | Value |
| --- | --- |
| Commands reviewed | Yes |
| Commands exist in project | Yes |
| Commands are project-native | Yes |
| Commands target required behavior | Yes |
| Commands executed by this report | No |
| Requires Test Evidence later | Yes |
| Fake or unstable command found | No |
| Working directory verified | Yes |
| All commands authoritative | Yes |

| Command | Kind | Exists | Project-native | Working directory safe | Targets required behavior | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| node --test tests/evidence-retention.test.mjs | project_tool | Yes | Yes | Yes | Yes | Project-local Node test target tests/evidence-retention.test.mjs exists. |
| node --test tests/118-evidence-retention-governance-obligations.test.mjs | project_tool | Yes | Yes | Yes | Yes | Project-local Node test target tests/118-evidence-retention-governance-obligations.test.mjs exists. |
| node --test tests/business-universe-coverage.test.mjs | project_tool | Yes | Yes | Yes | Yes | Project-local Node test target tests/business-universe-coverage.test.mjs exists. |
| node scripts/check-evidence-retention.mjs . --strict | node_script | Yes | Yes | Yes | Yes | Project-local Node script scripts/check-evidence-retention.mjs exists. |
| node scripts/check-manifest.mjs . | node_script | Yes | Yes | Yes | Yes | Project-local Node script scripts/check-manifest.mjs exists. |
| npm run verify:pre-runtime | package_script | Yes | Yes | Yes | Yes | package.json defines script verify:pre-runtime. |
| npm run verify:candidate | package_script | Yes | Yes | Yes | Yes | package.json defines script verify:candidate. |
| npm run verify:consumer-chain:final | package_script | Yes | Yes | Yes | Yes | package.json defines script verify:consumer-chain:final. |
| git diff --check | project_tool | Yes | Yes | Yes | Yes | Git diff validation is bounded to the current project working tree. |

## Subagent Review Routing

| Field | Value |
| --- | --- |
| Subagent review recommended | Yes |
| Run plan required | Yes |
| All subagents read-only | Yes |
| Subagent output is authority | No |
| All subagents closed or skipped | Yes |

## Boundaries

| Boundary | Value |
| --- | --- |
| This report writes target files | No |
| This report authorizes implementation | No |
| This report approves commit or push | No |
| This report approves release or production | No |
| This report executes tests | No |
| This report changes production | No |

## Outcome

`PLAN_REVIEW_PASSED`

## Machine-Readable Evidence

```json
{
  "schema_version": "1.113.0",
  "artifact_type": "plan_review",
  "plan_review_ref": "plan-review-reports/118-evidence-retention-deduplication.md",
  "plan_review_digest": "sha256:d9dcf6de9b8a9a0b1626dea581443d018c4c32cdcd96193080148aae1f000bb6",
  "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
  "intent": "establish a forward-only evidence retention and deduplication rule for runtime state that preserves authoritative reports and the final trusted runtime while preventing duplicate aggregate logs, stale retry archives, and unbounded per-task evidence growth without rewriting released evidence",
  "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652",
  "work_queue_item_ref": "artifact:work-queue-takeover-reports/118-evidence-retention-deduplication.md#WQ-009",
  "work_queue_item_digest": "sha256:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
  "review_surface_analysis": {
    "ref": "artifact:review-surface-cards/118-evidence-retention-deduplication.md",
    "digest": "sha256:3e97ff0e71568b042e0a35f097f93da9b0f538dc0ab64109e765132dc90d8717",
    "source": "review_surface_card",
    "derived_by_plan_review": "No",
    "current_task_match": "Yes",
    "user_selected_surfaces": "No"
  },
  "task_governance": {
    "ref": "artifact:task-governance-reports/118-evidence-retention-deduplication.md",
    "digest": "sha256:3d759ef3304acccf870f88cc04ab50b0e0b1f6a1251504623197029de117ee6a",
    "task_ref": "task:ba2fb4d662dc4a2c890495bf116dd903bd5e8511647a242df265469d870ca66f",
    "intent_digest": "sha256:30c2cb70ca3f62e98bc994b5377496d67acb3cc444f14899dae62863cd9f5652",
    "task_impact": "HIGH",
    "plan_review_required": "Yes",
    "current_task_match": "Yes",
    "outcome": "HIGH_REQUIRES_FULL_GOVERNANCE",
    "required_before_implementation_review": {
      "scope_check_required": "Yes",
      "short_plan_required": "Yes",
      "business_universe_coverage_required": "Yes",
      "control_effectiveness_required": "No",
      "business_rule_closure_required": "Yes",
      "change_impact_coverage_required": "Yes",
      "execution_plan_required": "Yes",
      "verification_plan_required": "Yes"
    },
    "required_before_completion_claim": {
      "test_evidence_required": "Yes",
      "execution_assurance_required": "Yes",
      "completion_evidence_required": "Yes"
    },
    "obligations_valid": "Yes"
  },
  "business_universe_binding": {
    "required": "Yes",
    "routing_result": "REQUIRED_WITH_EVIDENCE",
    "business_universe_ref": "artifact:business-universe-coverage-reports/118-evidence-retention-deduplication.md",
    "business_universe_digest": "sha256:9e2514fbde77b9a5b32d0da2f8cc0df1deda875a04c34ba75a4f996cef43b823",
    "business_universe_state": "COVERAGE_READY",
    "coverage_scenario_ids": [
      "coverage-scenario:066f1fee0cdbf5f993e4686c",
      "coverage-scenario:a109f7bce060ab502118bb89",
      "coverage-scenario:4959cf4953da04a02020517d",
      "coverage-scenario:c7983fd3a2b96b768140bff0",
      "coverage-scenario:b378ce917c0d0bb34193ff31"
    ],
    "coverage_mapping_status": "COMPLETE",
    "scenario_review_status": "COMPLETE",
    "lifecycle_review_status": "COMPLETE",
    "provenance_review_status": "COMPLETE",
    "challenger_required": "Yes",
    "challenger_status": "PASSED"
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
  "plan_scenario_reviews": [
    {
      "plan_scenario_review_id": "plan-scenario-review:1-93e4686c",
      "source_coverage_scenario_ids": [
        "coverage-scenario:066f1fee0cdbf5f993e4686c"
      ],
      "reviewed_surfaces": [
        "scope",
        "verification",
        "permission",
        "data_destructive",
        "business_rule",
        "frontend_backend_consistency",
        "release",
        "business_universe_scenario_review"
      ],
      "lifecycle_reviewed": "Yes",
      "provenance_reviewed": "Yes",
      "negative_or_reverse_reviewed": "Yes",
      "review_state": "REVIEWED"
    },
    {
      "plan_scenario_review_id": "plan-scenario-review:2-2118bb89",
      "source_coverage_scenario_ids": [
        "coverage-scenario:a109f7bce060ab502118bb89"
      ],
      "reviewed_surfaces": [
        "scope",
        "verification",
        "permission",
        "data_destructive",
        "business_rule",
        "frontend_backend_consistency",
        "release",
        "business_universe_scenario_review"
      ],
      "lifecycle_reviewed": "Yes",
      "provenance_reviewed": "Yes",
      "negative_or_reverse_reviewed": "Yes",
      "review_state": "REVIEWED"
    },
    {
      "plan_scenario_review_id": "plan-scenario-review:3-2020517d",
      "source_coverage_scenario_ids": [
        "coverage-scenario:4959cf4953da04a02020517d"
      ],
      "reviewed_surfaces": [
        "scope",
        "verification",
        "permission",
        "data_destructive",
        "business_rule",
        "frontend_backend_consistency",
        "release",
        "business_universe_scenario_review"
      ],
      "lifecycle_reviewed": "Yes",
      "provenance_reviewed": "Yes",
      "negative_or_reverse_reviewed": "Yes",
      "review_state": "REVIEWED"
    },
    {
      "plan_scenario_review_id": "plan-scenario-review:4-8140bff0",
      "source_coverage_scenario_ids": [
        "coverage-scenario:c7983fd3a2b96b768140bff0"
      ],
      "reviewed_surfaces": [
        "scope",
        "verification",
        "permission",
        "data_destructive",
        "business_rule",
        "frontend_backend_consistency",
        "release",
        "business_universe_scenario_review"
      ],
      "lifecycle_reviewed": "Yes",
      "provenance_reviewed": "Yes",
      "negative_or_reverse_reviewed": "Yes",
      "review_state": "REVIEWED"
    },
    {
      "plan_scenario_review_id": "plan-scenario-review:5-4193ff31",
      "source_coverage_scenario_ids": [
        "coverage-scenario:b378ce917c0d0bb34193ff31"
      ],
      "reviewed_surfaces": [
        "scope",
        "verification",
        "permission",
        "data_destructive",
        "business_rule",
        "frontend_backend_consistency",
        "release",
        "business_universe_scenario_review"
      ],
      "lifecycle_reviewed": "Yes",
      "provenance_reviewed": "Yes",
      "negative_or_reverse_reviewed": "Yes",
      "review_state": "REVIEWED"
    }
  ],
  "source_chain": [
    {
      "source_kind": "task_governance",
      "source_ref": "artifact:task-governance-reports/118-evidence-retention-deduplication.md",
      "source_digest": "sha256:789464dcc61bc3865a32ce19d0cf451128a68ae68e03b8fcbeb3bf63e5dfe9e4",
      "source_state": "HIGH_REQUIRES_FULL_GOVERNANCE",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "intentos-governance",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "review_surface_card",
      "source_ref": "artifact:review-surface-cards/118-evidence-retention-deduplication.md",
      "source_digest": "sha256:3e97ff0e71568b042e0a35f097f93da9b0f538dc0ab64109e765132dc90d8717",
      "source_state": "RECORDED",
      "current_task_match": "N/A",
      "project_native_equivalent": "Yes",
      "owner": "project-review-evidence",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "verification_plan",
      "source_ref": "artifact:verification-plans/118-evidence-retention-deduplication.md",
      "source_digest": "sha256:d29e767295f6fa2f455b1b3cc7bdce7404c59f0ba2be7687580aba342cb59ba7",
      "source_state": "VERIFICATION_PLAN_READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "codex",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "business_rule_closure",
      "source_ref": "artifact:business-rule-closures/118-evidence-retention-deduplication.md",
      "source_digest": "sha256:0461ce55d4322962ec5fe32c0ecdbf651b729fb3e2a51967adaf09d1db3731c5",
      "source_state": "READY_FOR_IMPACT_COVERAGE",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "project-business-evidence",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "change_impact_coverage",
      "source_ref": "artifact:change-impact-coverage-reports/preflight-118-evidence-retention-deduplication.md",
      "source_digest": "sha256:0cdf1a1ddac44d157a4fe64697110cf37bad5a2952df65f4a1e8efd44a9e9865",
      "source_state": "CHANGE_IMPACT_RECORDED",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "codex",
      "contradicts_plan": "No"
    },
    {
      "source_kind": "business_universe_coverage",
      "source_ref": "artifact:business-universe-coverage-reports/118-evidence-retention-deduplication.md",
      "source_digest": "sha256:28431bdc8483af2bf5a012f4a823b814ae4240a630e190d1c2b7950f233e2095",
      "source_state": "COVERAGE_READY",
      "current_task_match": "Yes",
      "project_native_equivalent": "No",
      "owner": "codex",
      "contradicts_plan": "No"
    }
  ],
  "plan_ref": "implementation-plans/118-evidence-retention-deduplication.md",
  "plan_digest": "sha256:53fe6c5d12ef61945d596f9eb90266afb655dbaa0e54256049af673d0d5a4433",
  "plan_task_match": "Yes",
  "plan_content_review": {
    "status": "COMPLETE",
    "scope_section_present": "Yes",
    "boundaries_section_present": "Yes",
    "implementation_sequence_present": "Yes",
    "verification_section_present": "Yes",
    "rollback_recovery_section_present": "Yes",
    "concrete_target_refs": [
      ".intentos/evidence-retention-policy.json",
      "scripts/check-evidence-retention.mjs",
      "scripts/lib/evidence-retention.mjs",
      "scripts/resolve-business-universe-coverage.mjs",
      "templates/workflow-version.json",
      "tests/evidence-retention.test.mjs"
    ],
    "implementation_step_count": 8,
    "missing_requirements": []
  },
  "plan_review_state": "PLAN_REVIEW_PASSED",
  "pre_implementation_review_prerequisite_satisfied": "Yes",
  "ready_for_implementation_review": "Yes",
  "implementation_authorized_by_this_report": "No",
  "implementation_allowed_by_full_authority": "Unknown",
  "task_impact": "HIGH",
  "skip_review": {
    "skip_allowed": "No",
    "skip_source": "task_governance",
    "skip_reason": "N/A",
    "task_impact": "HIGH"
  },
  "required_review_surfaces": [
    "scope",
    "verification",
    "permission",
    "data_destructive",
    "business_rule",
    "frontend_backend_consistency",
    "release",
    "business_universe_scenario_review"
  ],
  "review_surface_matrix": [
    {
      "surface": "scope",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "verification",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "permission",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "data_destructive",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "business_rule",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "frontend_backend_consistency",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "release",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    },
    {
      "surface": "business_universe_scenario_review",
      "required": "Yes",
      "required_before_implementation": "Yes",
      "required_after_implementation": "Yes",
      "reviewed": "Yes",
      "source": "task_governance",
      "human_decision_needed": "No",
      "finding_count": 0,
      "blocking": "No"
    }
  ],
  "subagent_review_routing": {
    "subagent_review_recommended": "Yes",
    "reason": "High-impact or broad plan review benefits from independent read-only review.",
    "run_plan_required": "Yes",
    "run_plan_ref": "artifact:subagent-run-plans/generated.md",
    "all_subagents_read_only": "Yes",
    "subagent_output_is_authority": "No",
    "writer_subagent_used": "No",
    "all_subagents_closed_or_skipped": "Yes",
    "fallback_used": "No",
    "fallback_reason": "N/A"
  },
  "reviewed_surfaces": [
    {
      "surface": "scope",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "verification",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "permission",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "data_destructive",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "business_rule",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "frontend_backend_consistency",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "release",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    },
    {
      "surface": "business_universe_scenario_review",
      "reviewed": "Yes",
      "finding_count": 0,
      "notes": "Surface was reviewed against the plan."
    }
  ],
  "findings": [],
  "revision_loop": {
    "round": 0,
    "max_auto_rounds": 2,
    "requires_revision": "No",
    "previous_plan_digest": "N/A",
    "rewrites_original_plan": "No",
    "revised_plan_ref": "N/A"
  },
  "verification_command_review": {
    "commands_reviewed": "Yes",
    "commands_exist_in_project": "Yes",
    "commands_are_project_native": "Yes",
    "commands_target_required_behavior": "Yes",
    "commands_executed_by_this_report": "No",
    "requires_test_evidence_later": "Yes",
    "fake_or_unstable_command_found": "No",
    "working_directory_verified": "Yes",
    "all_commands_authoritative": "Yes",
    "commands": [
      {
        "command": "node --test tests/evidence-retention.test.mjs",
        "kind": "project_tool",
        "executable_or_script_exists": "Yes",
        "project_native": "Yes",
        "working_directory_safe": "Yes",
        "targets_required_behavior": "Yes",
        "reason": "Project-local Node test target tests/evidence-retention.test.mjs exists."
      },
      {
        "command": "node --test tests/118-evidence-retention-governance-obligations.test.mjs",
        "kind": "project_tool",
        "executable_or_script_exists": "Yes",
        "project_native": "Yes",
        "working_directory_safe": "Yes",
        "targets_required_behavior": "Yes",
        "reason": "Project-local Node test target tests/118-evidence-retention-governance-obligations.test.mjs exists."
      },
      {
        "command": "node --test tests/business-universe-coverage.test.mjs",
        "kind": "project_tool",
        "executable_or_script_exists": "Yes",
        "project_native": "Yes",
        "working_directory_safe": "Yes",
        "targets_required_behavior": "Yes",
        "reason": "Project-local Node test target tests/business-universe-coverage.test.mjs exists."
      },
      {
        "command": "node scripts/check-evidence-retention.mjs . --strict",
        "kind": "node_script",
        "executable_or_script_exists": "Yes",
        "project_native": "Yes",
        "working_directory_safe": "Yes",
        "targets_required_behavior": "Yes",
        "reason": "Project-local Node script scripts/check-evidence-retention.mjs exists."
      },
      {
        "command": "node scripts/check-manifest.mjs .",
        "kind": "node_script",
        "executable_or_script_exists": "Yes",
        "project_native": "Yes",
        "working_directory_safe": "Yes",
        "targets_required_behavior": "Yes",
        "reason": "Project-local Node script scripts/check-manifest.mjs exists."
      },
      {
        "command": "npm run verify:pre-runtime",
        "kind": "package_script",
        "executable_or_script_exists": "Yes",
        "project_native": "Yes",
        "working_directory_safe": "Yes",
        "targets_required_behavior": "Yes",
        "reason": "package.json defines script verify:pre-runtime."
      },
      {
        "command": "npm run verify:candidate",
        "kind": "package_script",
        "executable_or_script_exists": "Yes",
        "project_native": "Yes",
        "working_directory_safe": "Yes",
        "targets_required_behavior": "Yes",
        "reason": "package.json defines script verify:candidate."
      },
      {
        "command": "npm run verify:consumer-chain:final",
        "kind": "package_script",
        "executable_or_script_exists": "Yes",
        "project_native": "Yes",
        "working_directory_safe": "Yes",
        "targets_required_behavior": "Yes",
        "reason": "package.json defines script verify:consumer-chain:final."
      },
      {
        "command": "git diff --check",
        "kind": "project_tool",
        "executable_or_script_exists": "Yes",
        "project_native": "Yes",
        "working_directory_safe": "Yes",
        "targets_required_behavior": "Yes",
        "reason": "Git diff validation is bounded to the current project working tree."
      }
    ],
    "notes": "Commands were resolved statically against the current project; no tests were executed by this report."
  },
  "plain_user_summary": "The plan review passed. I can move to implementation review if the project workflow also allows it.",
  "plain_next_step": "Move to implementation review under the approved project scope; this report still does not approve implementation by itself.",
  "technical_terms_required": "No",
  "boundaries": {
    "writes_target_files": "No",
    "authorizes_implementation": "No",
    "approves_commit_or_push": "No",
    "approves_release_or_production": "No",
    "executes_tests": "No",
    "changes_production": "No"
  },
  "outcome": "PLAN_REVIEW_PASSED"
}
```
