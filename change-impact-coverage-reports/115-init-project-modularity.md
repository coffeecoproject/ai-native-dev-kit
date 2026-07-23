# Change Impact Coverage Report

## Human Summary

Change type VALIDATION_OR_BUSINESS_RULE; 7 required surfaces were identified. Risk level is high.

## User Request

- Request: modularize scripts/init-project.mjs into focused internal modules while preserving CLI arguments, output, plan and receipt formats, mutation ordering, rollback behavior, and exit codes
- Task ref: task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e
- Project/profile: inferred from project signals
- Business rule closure ref: artifact:business-rule-closures/115-init-project-modularity.md
- Business rule digest: sha256:ecd8231f572d0c14ae11e29c1c1e84830c1f35b8d504013d17ec0b49501480fc
- Business rule state: READY_FOR_IMPACT_COVERAGE
- Business Universe ref: business-universe-coverage-reports/115-init-project-modularity.md
- Business Universe digest: sha256:9b6b440a74d414e59be7f4755ef84f0adc7bd6746a0cf23313a346c88f00af86

## Business Universe Scenario Impact

| Mapping ID | Source coverage scenarios | Affected surfaces | State |
|---|---|---|---|
| `impact-mapping:1-a6e545d4` | coverage-scenario:8436e1d4a9c2ab91a6e545d4 | USER_FLOW, TEST_COVERAGE, DOCS_HANDOFF | `MAPPED` |
| `impact-mapping:2-33f16b20` | coverage-scenario:6b8a64e0ae567bd533f16b20 | USER_FLOW, TEST_COVERAGE, DOCS_HANDOFF | `MAPPED` |
| `impact-mapping:3-fb5f6fb1` | coverage-scenario:29c41b694e2a25b5fb5f6fb1 | USER_FLOW, TEST_COVERAGE, DOCS_HANDOFF | `MAPPED` |
| `impact-mapping:4-61e14285` | coverage-scenario:53e237fc9cea90ed61e14285 | USER_FLOW, TEST_COVERAGE, DOCS_HANDOFF | `MAPPED` |
| `impact-mapping:5-e1e69a79` | coverage-scenario:573d43f84fcad189e1e69a79 | USER_FLOW, TEST_COVERAGE, DOCS_HANDOFF | `MAPPED` |
| `impact-mapping:6-a11c3ecc` | coverage-scenario:dca2a70d980c86f4a11c3ecc | USER_FLOW, TEST_COVERAGE, DOCS_HANDOFF | `MAPPED` |
| `impact-mapping:7-f3a2b88d` | coverage-scenario:63fcddf585d8dd27f3a2b88d | USER_FLOW, TEST_COVERAGE, DOCS_HANDOFF | `MAPPED` |
| `impact-mapping:8-d653660b` | coverage-scenario:6330c97be1602986d653660b | USER_FLOW, TEST_COVERAGE, DOCS_HANDOFF | `MAPPED` |
| `impact-mapping:9-7b2145c0` | coverage-scenario:d93095e30021697e7b2145c0 | USER_FLOW, TEST_COVERAGE, DOCS_HANDOFF | `MAPPED` |

## Change Type

- Mode: `closure`
- Primary type: `VALIDATION_OR_BUSINESS_RULE`
- Risk level: high
- Reason: High-risk signals: production-release, dependency-package.

## Changed Files

- `.intentos/verification-runtime-lifecycle.json`
- `intentos-manifest.json`
- `package.json`
- `scripts/check-manifest.mjs`
- `scripts/init-project.mjs`
- `scripts/init-project/assets.mjs`
- `scripts/init-project/plan.mjs`
- `scripts/init-project/apply.mjs`
- `scripts/init-project/cli.mjs`
- `tests/115-init-project-obligation-evidence.test.mjs`
- `tests/active-guidance-distribution-closeout.test.mjs`
- `tests/init-project-modularity.test.mjs`
- `work-queue-transitions/003-check-intentos-to-init-project-modularity.md`

## Affected Surface Map

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

## Out-of-Scope Decisions

| Surface | Decision | Reason | Owner / Follow-up |
|---|---|---|---|
| None | None | Pre-execution report. | None |

## Human Decisions Needed

None. Codex derives technical surface coverage and asks only for a missing business fact or concrete real-world consent.

## Implementation Coverage

| Surface | Status | Evidence | Reason |
|---|---|---|---|
| `TEST_COVERAGE` | `DONE` | tests/115-init-project-obligation-evidence.test.mjs | The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface. |
| `DOCS_HANDOFF` | `DONE` | implementation-plans/115-init-project-modularity.md | The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface. |
| `USER_FLOW` | `DONE` | tests/115-init-project-obligation-evidence.test.mjs | The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface. |
| `DATA_MODEL` | `NOT_APPLICABLE` | tests/init-project-modularity.test.mjs | No data model or persistence change is indicated by current wording. |
| `PERMISSION_RISK` | `NOT_APPLICABLE` | tests/init-project-modularity.test.mjs | No permission, privacy, payment, or compliance change is indicated by current wording. |
| `RELEASE_IMPACT` | `DONE` | tests/115-init-project-obligation-evidence.test.mjs | The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface. |
| `BACKGROUND_WORK` | `DONE` | tests/work-queue-transition.test.mjs | The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface. |
| `RUNTIME_BEHAVIOR` | `DONE` | verification-run-manifests/115-init-project-modularity.md | The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface. |
| `ROLLBACK_RECOVERY` | `DONE` | tests/controlled-apply-transaction.test.mjs | The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface. |

## Verification Coverage

| Surface | Verification | Evidence | Status |
|---|---|---|---|
| `TEST_COVERAGE` | Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact. | tests/115-init-project-obligation-evidence.test.mjs | `DONE` |
| `DOCS_HANDOFF` | Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact. | implementation-plans/115-init-project-modularity.md | `DONE` |
| `USER_FLOW` | Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact. | tests/115-init-project-obligation-evidence.test.mjs | `DONE` |
| `RELEASE_IMPACT` | Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact. | tests/115-init-project-obligation-evidence.test.mjs | `DONE` |
| `BACKGROUND_WORK` | Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact. | tests/work-queue-transition.test.mjs | `DONE` |
| `RUNTIME_BEHAVIOR` | Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact. | verification-run-manifests/115-init-project-modularity.md | `DONE` |
| `ROLLBACK_RECOVERY` | Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact. | tests/controlled-apply-transaction.test.mjs | `DONE` |

## Missed Surface Review

- Missed surfaces found: `No`
- Notes: Every required surface is mapped to direct current source, focused public-entry behavior, or exact r2 runtime evidence; commit, push, release, production, and external effects remain outside scope.

## Boundaries

- This report writes target files: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report replaces human product judgment: No
- This report proves every possible impact was found: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.113.0",
  "artifact_type": "change_impact_coverage",
  "artifact_id": "modularize-scripts-init-project.mjs-into-focused-internal-module",
  "impact_digest": "sha256:b699d84736dcb210e8c74e54c2bb93fd18d37ad3bea4353b57354bcd1746ded1",
  "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
  "intent_digest": "sha256:7af7cae362f877411080859f0949df74dce0f47274ca75ef39e33bf2611ec435",
  "mode": "closure",
  "user_request": {
    "intent": "modularize scripts/init-project.mjs into focused internal modules while preserving CLI arguments, output, plan and receipt formats, mutation ordering, rollback behavior, and exit codes",
    "task_ref": "task:f82675870e9e2341f98b93432ad6faa433aea028d5228a2634502c9ef202c27e",
    "project_profile": "inferred from project signals"
  },
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
  "impact_scenario_mappings": [
    {
      "impact_mapping_id": "impact-mapping:1-a6e545d4",
      "source_coverage_scenario_ids": [
        "coverage-scenario:8436e1d4a9c2ab91a6e545d4"
      ],
      "affected_surfaces": [
        "USER_FLOW",
        "TEST_COVERAGE",
        "DOCS_HANDOFF"
      ],
      "mapping_state": "MAPPED"
    },
    {
      "impact_mapping_id": "impact-mapping:2-33f16b20",
      "source_coverage_scenario_ids": [
        "coverage-scenario:6b8a64e0ae567bd533f16b20"
      ],
      "affected_surfaces": [
        "USER_FLOW",
        "TEST_COVERAGE",
        "DOCS_HANDOFF"
      ],
      "mapping_state": "MAPPED"
    },
    {
      "impact_mapping_id": "impact-mapping:3-fb5f6fb1",
      "source_coverage_scenario_ids": [
        "coverage-scenario:29c41b694e2a25b5fb5f6fb1"
      ],
      "affected_surfaces": [
        "USER_FLOW",
        "TEST_COVERAGE",
        "DOCS_HANDOFF"
      ],
      "mapping_state": "MAPPED"
    },
    {
      "impact_mapping_id": "impact-mapping:4-61e14285",
      "source_coverage_scenario_ids": [
        "coverage-scenario:53e237fc9cea90ed61e14285"
      ],
      "affected_surfaces": [
        "USER_FLOW",
        "TEST_COVERAGE",
        "DOCS_HANDOFF"
      ],
      "mapping_state": "MAPPED"
    },
    {
      "impact_mapping_id": "impact-mapping:5-e1e69a79",
      "source_coverage_scenario_ids": [
        "coverage-scenario:573d43f84fcad189e1e69a79"
      ],
      "affected_surfaces": [
        "USER_FLOW",
        "TEST_COVERAGE",
        "DOCS_HANDOFF"
      ],
      "mapping_state": "MAPPED"
    },
    {
      "impact_mapping_id": "impact-mapping:6-a11c3ecc",
      "source_coverage_scenario_ids": [
        "coverage-scenario:dca2a70d980c86f4a11c3ecc"
      ],
      "affected_surfaces": [
        "USER_FLOW",
        "TEST_COVERAGE",
        "DOCS_HANDOFF"
      ],
      "mapping_state": "MAPPED"
    },
    {
      "impact_mapping_id": "impact-mapping:7-f3a2b88d",
      "source_coverage_scenario_ids": [
        "coverage-scenario:63fcddf585d8dd27f3a2b88d"
      ],
      "affected_surfaces": [
        "USER_FLOW",
        "TEST_COVERAGE",
        "DOCS_HANDOFF"
      ],
      "mapping_state": "MAPPED"
    },
    {
      "impact_mapping_id": "impact-mapping:8-d653660b",
      "source_coverage_scenario_ids": [
        "coverage-scenario:6330c97be1602986d653660b"
      ],
      "affected_surfaces": [
        "USER_FLOW",
        "TEST_COVERAGE",
        "DOCS_HANDOFF"
      ],
      "mapping_state": "MAPPED"
    },
    {
      "impact_mapping_id": "impact-mapping:9-7b2145c0",
      "source_coverage_scenario_ids": [
        "coverage-scenario:d93095e30021697e7b2145c0"
      ],
      "affected_surfaces": [
        "USER_FLOW",
        "TEST_COVERAGE",
        "DOCS_HANDOFF"
      ],
      "mapping_state": "MAPPED"
    }
  ],
  "change_type": {
    "primary_type": "VALIDATION_OR_BUSINESS_RULE",
    "risk_level": "high",
    "reason": "High-risk signals: production-release, dependency-package."
  },
  "changed_files": [
    ".intentos/verification-runtime-lifecycle.json",
    "intentos-manifest.json",
    "package.json",
    "scripts/check-manifest.mjs",
    "scripts/init-project.mjs",
    "scripts/init-project/assets.mjs",
    "scripts/init-project/plan.mjs",
    "scripts/init-project/apply.mjs",
    "scripts/init-project/cli.mjs",
    "tests/115-init-project-obligation-evidence.test.mjs",
    "tests/active-guidance-distribution-closeout.test.mjs",
    "tests/init-project-modularity.test.mjs",
    "work-queue-transitions/003-check-intentos-to-init-project-modularity.md"
  ],
  "affected_surface_map": [
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
  "implementation_coverage": [
    {
      "surface": "TEST_COVERAGE",
      "status": "DONE",
      "evidence": "tests/115-init-project-obligation-evidence.test.mjs",
      "reason": "The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface."
    },
    {
      "surface": "DOCS_HANDOFF",
      "status": "DONE",
      "evidence": "implementation-plans/115-init-project-modularity.md",
      "reason": "The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface."
    },
    {
      "surface": "USER_FLOW",
      "status": "DONE",
      "evidence": "tests/115-init-project-obligation-evidence.test.mjs",
      "reason": "The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface."
    },
    {
      "surface": "DATA_MODEL",
      "status": "NOT_APPLICABLE",
      "evidence": "tests/init-project-modularity.test.mjs",
      "reason": "No data model or persistence change is indicated by current wording."
    },
    {
      "surface": "PERMISSION_RISK",
      "status": "NOT_APPLICABLE",
      "evidence": "tests/init-project-modularity.test.mjs",
      "reason": "No permission, privacy, payment, or compliance change is indicated by current wording."
    },
    {
      "surface": "RELEASE_IMPACT",
      "status": "DONE",
      "evidence": "tests/115-init-project-obligation-evidence.test.mjs",
      "reason": "The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface."
    },
    {
      "surface": "BACKGROUND_WORK",
      "status": "DONE",
      "evidence": "tests/work-queue-transition.test.mjs",
      "reason": "The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface."
    },
    {
      "surface": "RUNTIME_BEHAVIOR",
      "status": "DONE",
      "evidence": "verification-run-manifests/115-init-project-modularity.md",
      "reason": "The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface."
    },
    {
      "surface": "ROLLBACK_RECOVERY",
      "status": "DONE",
      "evidence": "tests/controlled-apply-transaction.test.mjs",
      "reason": "The referenced current source, focused public-entry test, or exact r2 runtime artifact directly proves this surface."
    }
  ],
  "verification_coverage": [
    {
      "surface": "TEST_COVERAGE",
      "verification": "Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact.",
      "evidence": "tests/115-init-project-obligation-evidence.test.mjs",
      "status": "DONE"
    },
    {
      "surface": "DOCS_HANDOFF",
      "verification": "Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact.",
      "evidence": "implementation-plans/115-init-project-modularity.md",
      "status": "DONE"
    },
    {
      "surface": "USER_FLOW",
      "verification": "Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact.",
      "evidence": "tests/115-init-project-obligation-evidence.test.mjs",
      "status": "DONE"
    },
    {
      "surface": "RELEASE_IMPACT",
      "verification": "Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact.",
      "evidence": "tests/115-init-project-obligation-evidence.test.mjs",
      "status": "DONE"
    },
    {
      "surface": "BACKGROUND_WORK",
      "verification": "Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact.",
      "evidence": "tests/work-queue-transition.test.mjs",
      "status": "DONE"
    },
    {
      "surface": "RUNTIME_BEHAVIOR",
      "verification": "Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact.",
      "evidence": "verification-run-manifests/115-init-project-modularity.md",
      "status": "DONE"
    },
    {
      "surface": "ROLLBACK_RECOVERY",
      "verification": "Verify the surface against its direct current source, focused public-entry test, or exact r2 runtime artifact.",
      "evidence": "tests/controlled-apply-transaction.test.mjs",
      "status": "DONE"
    }
  ],
  "missed_surface_review": {
    "missed_surfaces_found": "No",
    "notes": "Every required surface is mapped to direct current source, focused public-entry behavior, or exact r2 runtime evidence; commit, push, release, production, and external effects remain outside scope."
  },
  "pending_decisions": [],
  "boundaries": {
    "writes_target_files": false,
    "authorizes_implementation": false,
    "approves_release_or_production": false,
    "replaces_human_product_judgment": false,
    "proves_every_possible_impact_was_found": false
  },
  "outcome": "CHANGE_IMPACT_RECORDED"
}
```

## Outcome

`CHANGE_IMPACT_RECORDED`
