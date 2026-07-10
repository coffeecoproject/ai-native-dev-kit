# Verification Plan

## Human Summary

Summarize the verification state in plain language.

## User Request

- Request:
- Task ref:

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/001.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:...` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/001.md` | `CHANGE_IMPACT_RECORDED` | `sha256:...` |

## Verification Plan Identity

- Verification plan ref:
- Verification plan digest:
- Intent digest:

## Project Calibration

- Project level:
- Platform profiles:
- Change kind:
- Risk domains:

## Affected Surface Inputs

| Surface | Status | Reason | Expected Evidence |
|---|---|---|---|
| `API_CONTRACT` | `REQUIRED` | Reason | Expected evidence |

## Verification Obligations

| ID | Surface | Type | Required | Priority | Behavior Under Test | Expected Evidence | Broad Command Only | Source Refs |
|---|---|---|---|---|---|---|---|---|
| `verify:api-negative` | `API_CONTRACT` | `API_NEGATIVE_TEST` | `Yes` | `BLOCKING` | Invalid request fails. | API negative evidence. | `No` | `artifact:business-rule-closures/001.md` |

## Test Correctness Controls

| ID | Applies To | Required | Reason |
|---|---|---|---|
| `control:negative-path-required` | `API_CONTRACT` | `Yes` | Validation rules require failure-path proof. |

## Manual Verification

| ID | Owner | Decision Ref | Expected Manual Evidence | Blocking |
|---|---|---|---|---|
| `none` | None | `not required` | Not required. | `No` |

## Not Applicable Obligations

| Surface | Reason |
|---|---|
| `none` | No not-applicable obligations recorded. |

## Boundaries

- This plan writes target files: No
- This plan executes tests: No
- This plan authorizes implementation: No
- This plan approves release or production: No
- This plan proves product correctness: No
- This plan proves real-environment behavior: No

## Evidence Authority

For strict current-task evidence, include an `authority_binding` in the
machine-readable record. It binds project identity, task identity, and the raw
digests of consumed local source files. It is not approval or release authority.

## Machine-Readable Evidence

```json
{}
```

## Outcome

`VERIFICATION_PLAN_READY`

## Next Step

Use this plan during execution, then bind actual test evidence later.
