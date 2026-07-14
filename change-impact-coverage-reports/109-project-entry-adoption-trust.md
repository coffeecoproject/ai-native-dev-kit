# Change Impact Coverage Report

## Human Summary

Change type GENERAL_PRODUCT_CHANGE; 6 required surfaces were identified. Risk level is high.

## User Request

- Request: IntentOS project entry must reject invalid identity, guidance, authority, or evidence; controlled adoption writes must be atomic; activation must run from project-local assets; current work must remain preserved.
- Task ref: not provided
- Project/profile: inferred from project signals
- Business rule closure ref: artifact:business-rule-closures/109-project-entry-adoption-trust.md
- Business rule digest: sha256:656a30ecfb1ea425e599bb9da5bf752ae2aeb766c89354599ca7bf8f6c64954b
- Business rule state: READY_FOR_IMPACT_COVERAGE
- Business Universe ref: N/A
- Business Universe digest: N/A

## Business Universe Scenario Impact

| Mapping ID | Source coverage scenarios | Affected surfaces | State |
|---|---|---|---|
| N/A | N/A | N/A | NOT_REQUIRED |

## Change Type

- Mode: `preflight`
- Primary type: `GENERAL_PRODUCT_CHANGE`
- Risk level: high
- Reason: IntentOS project-entry, adoption, apply, and activation control-plane contracts change across public consumers.

## Changed Files

- `scripts/cli.mjs`
- `scripts/start-project.mjs`
- `scripts/resolve-operating-loop.mjs`
- `scripts/resolve-project-identity.mjs`
- `scripts/resolve-active-guidance.mjs`
- `scripts/resolve-native-migration.mjs`
- `scripts/resolve-existing-workflow.mjs`
- `scripts/resolve-existing-rule-reconciliation.mjs`
- `scripts/resolve-governance-convergence.mjs`
- `scripts/resolve-adoption-assurance.mjs`
- `scripts/resolve-controlled-apply-readiness.mjs`
- `scripts/init-project.mjs`
- `scripts/check-workflow-adoption-map.mjs`
- `intentos-manifest.json`
- `schemas/artifacts/project-entry-calibration.schema.json`
- `scripts/check-project-entry-calibration.mjs`
- `tests/project-entry-adoption-trust.test.mjs`
- `tests/project-entry-adoption-consumer-chain.test.mjs`
- `tests/project-entry-new-project-transaction.test.mjs`
- `tests/project-entry-generated-parity.test.mjs`
- `tests/project-entry-business-universe-binding.test.mjs`
- `tests/project-entry-calibration.test.mjs`

## Affected Surface Map

| Surface | Status | Reason | Expected Evidence |
|---|---|---|---|
| `USER_FLOW` | `REQUIRED` | The user-facing behavior or task flow may change. | Screen, command, journey, or behavior evidence. |
| `FRONTEND_UI` | `NOT_APPLICABLE` | This repository exposes CLI and structured report behavior, not a rendered frontend. | Repository topology and plan scope. |
| `API_CONTRACT` | `REQUIRED` | Client/server expectations may need to stay aligned. | API/DTO/schema evidence or not-applicable reason. |
| `BACKEND_RULE` | `REQUIRED` | The rule should be enforced outside the UI when server/domain logic exists. | Domain/service validation evidence or not-applicable reason. |
| `ERROR_COPY` | `REQUIRED` | Users need a clear message when the rule blocks input. | Error copy, validation message, or not-applicable reason. |
| `DATA_MODEL` | `NOT_APPLICABLE` | Artifact schemas change, but no business or production data model is migrated. | Exact changed-file and release boundary. |
| `PERMISSION_RISK` | `NOT_APPLICABLE` | No permission, privacy, payment, or compliance change is indicated by current wording. | Reason recorded. |
| `RELEASE_IMPACT` | `NOT_APPLICABLE` | Version publication is a later close-out step and this report authorizes no release action. | Explicit release boundary. |
| `TEST_COVERAGE` | `REQUIRED` | The change needs evidence that required behavior was checked. | Unit, integration, smoke, behavior, fixture, or manual evidence. |
| `DOCS_HANDOFF` | `REQUIRED` | The rule and any exclusions need to be understandable later. | Docs, handoff note, final report, or decision record. |

## Out-of-Scope Decisions

| Surface | Decision | Reason | Owner / Follow-up |
|---|---|---|---|
| None | None | Pre-execution report. | None |

## Human Decisions Needed

None. Codex derives technical surface coverage and asks only for a missing business fact or concrete real-world consent.

## Implementation Coverage

| Surface | Status | Evidence | Reason |
|---|---|---|---|
| `USER_FLOW` | `NOT_STARTED` | Not started | Pre-execution report. |
| `FRONTEND_UI` | `NOT_APPLICABLE` | Repository topology and plan scope. | No rendered frontend is in scope. |
| `API_CONTRACT` | `NOT_STARTED` | Not started | Pre-execution report. |
| `BACKEND_RULE` | `NOT_STARTED` | Not started | Pre-execution report. |
| `ERROR_COPY` | `NOT_STARTED` | Not started | Pre-execution report. |
| `DATA_MODEL` | `NOT_APPLICABLE` | Exact changed-file and release boundary. | No business or production data migration is in scope. |
| `PERMISSION_RISK` | `NOT_APPLICABLE` | Not started | No permission, privacy, payment, or compliance change is indicated by current wording. |
| `RELEASE_IMPACT` | `NOT_APPLICABLE` | Explicit release boundary. | No release action is authorized by this report. |
| `TEST_COVERAGE` | `NOT_STARTED` | Not started | Pre-execution report. |
| `DOCS_HANDOFF` | `NOT_STARTED` | Not started | Pre-execution report. |

## Verification Coverage

| Surface | Verification | Evidence | Status |
|---|---|---|---|
| `USER_FLOW` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `FRONTEND_UI` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `API_CONTRACT` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `BACKEND_RULE` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `ERROR_COPY` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |
| `TEST_COVERAGE` | Run task-appropriate tests or smoke evidence. | Not started | `NOT_STARTED` |
| `DOCS_HANDOFF` | Confirm surface-specific evidence after implementation. | Not started | `NOT_STARTED` |

## Missed Surface Review

- Missed surfaces found: No
- Notes: Pre-execution report; missed surfaces must be reviewed after implementation.

## Boundaries

- This report writes target files: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report replaces human product judgment: No
- This report proves every possible impact was found: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.108.0",
  "artifact_type": "change_impact_coverage",
  "artifact_id": "intentos-project-entry-must-reject-invalid-identity-guidance-aut",
  "impact_digest": "sha256:ab25b2608405f6f4450610ff2329e648bc739f0eff1f871664ead4a5c82fc466",
  "mode": "preflight",
  "user_request": {
    "intent": "IntentOS project entry must reject invalid identity, guidance, authority, or evidence; controlled adoption writes must be atomic; activation must run from project-local assets; current work must remain preserved.",
    "task_ref": "not provided",
    "project_profile": "inferred from project signals"
  },
  "business_rule_ref": "artifact:business-rule-closures/109-project-entry-adoption-trust.md",
  "business_rule_digest": "sha256:656a30ecfb1ea425e599bb9da5bf752ae2aeb766c89354599ca7bf8f6c64954b",
  "business_rule_state": "READY_FOR_IMPACT_COVERAGE",
  "business_universe_binding": {
    "required": "No",
    "routing_result": "NOT_REQUIRED_WITH_REASON",
    "business_universe_ref": "N/A",
    "business_universe_digest": "N/A",
    "business_universe_state": "NOT_REQUIRED_WITH_REASON",
    "coverage_scenario_ids": [],
    "coverage_mapping_status": "NOT_REQUIRED"
  },
  "impact_scenario_mappings": [],
  "change_type": {
    "primary_type": "GENERAL_PRODUCT_CHANGE",
    "risk_level": "high",
    "reason": "IntentOS project-entry, adoption, apply, and activation control-plane contracts change across public consumers."
  },
  "changed_files": [
    "scripts/cli.mjs",
    "scripts/start-project.mjs",
    "scripts/resolve-operating-loop.mjs",
    "scripts/resolve-project-identity.mjs",
    "scripts/resolve-active-guidance.mjs",
    "scripts/resolve-native-migration.mjs",
    "scripts/resolve-existing-workflow.mjs",
    "scripts/resolve-existing-rule-reconciliation.mjs",
    "scripts/resolve-governance-convergence.mjs",
    "scripts/resolve-adoption-assurance.mjs",
    "scripts/resolve-controlled-apply-readiness.mjs",
    "scripts/init-project.mjs",
    "scripts/check-workflow-adoption-map.mjs",
    "intentos-manifest.json",
    "schemas/artifacts/project-entry-calibration.schema.json",
    "scripts/check-project-entry-calibration.mjs",
    "tests/project-entry-adoption-trust.test.mjs",
    "tests/project-entry-adoption-consumer-chain.test.mjs",
    "tests/project-entry-new-project-transaction.test.mjs",
    "tests/project-entry-generated-parity.test.mjs",
    "tests/project-entry-business-universe-binding.test.mjs",
    "tests/project-entry-calibration.test.mjs"
  ],
  "affected_surface_map": [
    {
      "surface": "USER_FLOW",
      "status": "REQUIRED",
      "reason": "The user-facing behavior or task flow may change.",
      "expected_evidence": "Screen, command, journey, or behavior evidence."
    },
    {
      "surface": "FRONTEND_UI",
      "status": "NOT_APPLICABLE",
      "reason": "This repository exposes CLI and structured report behavior, not a rendered frontend.",
      "expected_evidence": "Repository topology and plan scope."
    },
    {
      "surface": "API_CONTRACT",
      "status": "REQUIRED",
      "reason": "Client/server expectations may need to stay aligned.",
      "expected_evidence": "API/DTO/schema evidence or not-applicable reason."
    },
    {
      "surface": "BACKEND_RULE",
      "status": "REQUIRED",
      "reason": "The rule should be enforced outside the UI when server/domain logic exists.",
      "expected_evidence": "Domain/service validation evidence or not-applicable reason."
    },
    {
      "surface": "ERROR_COPY",
      "status": "REQUIRED",
      "reason": "Users need a clear message when the rule blocks input.",
      "expected_evidence": "Error copy, validation message, or not-applicable reason."
    },
    {
      "surface": "DATA_MODEL",
      "status": "NOT_APPLICABLE",
      "reason": "Artifact schemas change, but no business or production data model is migrated.",
      "expected_evidence": "Exact changed-file and release boundary."
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
      "reason": "Version publication is a later close-out step and this report authorizes no release action.",
      "expected_evidence": "Explicit release boundary."
    },
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
    }
  ],
  "implementation_coverage": [
    {
      "surface": "USER_FLOW",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "FRONTEND_UI",
      "status": "NOT_APPLICABLE",
      "evidence": "Repository topology and plan scope.",
      "reason": "No rendered frontend is in scope."
    },
    {
      "surface": "API_CONTRACT",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "BACKEND_RULE",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "ERROR_COPY",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "DATA_MODEL",
      "status": "NOT_APPLICABLE",
      "evidence": "Exact changed-file and release boundary.",
      "reason": "No business or production data migration is in scope."
    },
    {
      "surface": "PERMISSION_RISK",
      "status": "NOT_APPLICABLE",
      "evidence": "",
      "reason": "No permission, privacy, payment, or compliance change is indicated by current wording."
    },
    {
      "surface": "RELEASE_IMPACT",
      "status": "NOT_APPLICABLE",
      "evidence": "Explicit release boundary.",
      "reason": "No release action is authorized by this report."
    },
    {
      "surface": "TEST_COVERAGE",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    },
    {
      "surface": "DOCS_HANDOFF",
      "status": "NOT_STARTED",
      "evidence": "",
      "reason": "Pre-execution report."
    }
  ],
  "verification_coverage": [
    {
      "surface": "USER_FLOW",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "FRONTEND_UI",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "API_CONTRACT",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "BACKEND_RULE",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "ERROR_COPY",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "TEST_COVERAGE",
      "verification": "Run task-appropriate tests or smoke evidence.",
      "evidence": "",
      "status": "NOT_STARTED"
    },
    {
      "surface": "DOCS_HANDOFF",
      "verification": "Confirm surface-specific evidence after implementation.",
      "evidence": "",
      "status": "NOT_STARTED"
    }
  ],
  "missed_surface_review": {
    "missed_surfaces_found": "No",
    "notes": "Pre-execution report; missed surfaces must be reviewed after implementation."
  },
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
