# Change Impact Coverage Report

## Human Summary

Summarize what may be incomplete if this change is implemented in only one layer.

## User Request

- Request:
- Task ref:
- Project/profile:

## Change Type

- Mode: `preflight / closure`
- Primary type:
- Risk level:
- Reason:

## Changed Files

- None provided.

## Affected Surface Map

| Surface | Status | Reason | Expected Evidence |
|---|---|---|---|
| `USER_FLOW` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |
| `FRONTEND_UI` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |
| `API_CONTRACT` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |
| `BACKEND_RULE` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |
| `DATA_MODEL` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |
| `ERROR_COPY` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |
| `TEST_COVERAGE` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |
| `DOCS_HANDOFF` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |
| `PERMISSION_RISK` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |
| `RELEASE_IMPACT` | `REQUIRED / OPTIONAL / NOT_APPLICABLE / NEEDS_HUMAN_DECISION` |  |  |

## Out-of-Scope Decisions

| Surface | Decision | Reason | Owner / Follow-up |
|---|---|---|---|
|  |  |  |  |

## Human Decisions Needed

1. None recorded yet.

## Implementation Coverage

| Surface | Status | Evidence | Reason |
|---|---|---|---|
| `USER_FLOW` | `NOT_STARTED` |  | Pre-execution report. |
| `FRONTEND_UI` | `NOT_STARTED` |  | Pre-execution report. |
| `API_CONTRACT` | `NOT_STARTED` |  | Pre-execution report. |
| `BACKEND_RULE` | `NOT_STARTED` |  | Pre-execution report. |
| `DATA_MODEL` | `NOT_STARTED` |  | Pre-execution report. |
| `ERROR_COPY` | `NOT_STARTED` |  | Pre-execution report. |
| `TEST_COVERAGE` | `NOT_STARTED` |  | Pre-execution report. |
| `DOCS_HANDOFF` | `NOT_STARTED` |  | Pre-execution report. |
| `PERMISSION_RISK` | `NOT_STARTED` |  | Pre-execution report. |
| `RELEASE_IMPACT` | `NOT_STARTED` |  | Pre-execution report. |

## Verification Coverage

| Surface | Verification | Evidence | Status |
|---|---|---|---|
| `TEST_COVERAGE` |  |  | `NOT_STARTED` |

## Missed Surface Review

- Missed surfaces found: No
- If yes, list each missed surface and whether it is AUTO_FIX, OUT_OF_SCOPE, or NEEDS_HUMAN_DECISION.

## Boundaries

- This report writes target files: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report replaces human product judgment: No
- This report proves every possible impact was found: No

## Machine-Readable Evidence

```json
{
  "schema_version": "1.49.0",
  "artifact_type": "change_impact_coverage",
  "artifact_id": "change-impact-example",
  "impact_digest": "sha256:<computed>",
  "mode": "preflight",
  "user_request": {
    "intent": "<request>",
    "task_ref": "<task ref or not provided>",
    "project_profile": "<project/profile>"
  },
  "change_type": {
    "primary_type": "VALIDATION_OR_BUSINESS_RULE",
    "risk_level": "low",
    "reason": "<reason>"
  },
  "changed_files": [],
  "affected_surface_map": [],
  "implementation_coverage": [],
  "verification_coverage": [],
  "missed_surface_review": {
    "missed_surfaces_found": "No",
    "notes": "<notes>"
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
