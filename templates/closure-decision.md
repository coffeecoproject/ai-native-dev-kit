# Unified Closure Decision

## Human Summary

Conclusion:

Recommended next step:

What I need from you:

## Closure Decision

| Field | Value |
|---|---|
| Decision | `NEEDS_EVIDENCE` |
| Task ref | `{{TASK_REF}}` |
| Can count as done | No |
| Plain reason | Evidence is not complete enough to mark this task done. |
| Final closure source | `UNIFIED_CLOSURE_DECISION` |

## Decision Inputs

| Input | Status | Required | Verified | Ref | Checker | Finding |
|---|---|---|---|---|---|---|
| Change Impact Coverage | `MISSING` | Yes / No | No / N/A | N/A | `check-change-impact-coverage` / N/A | Related surfaces were not confirmed. |
| Execution Closure | `MISSING` | Yes | No | N/A | `check-execution-closure --report` | Execution closure evidence was not confirmed. |
| Guided Closure | `OPTIONAL` | No | N/A | N/A | N/A | User-facing summary can be prepared after decision. |
| Verification | `MISSING` | Yes | No | N/A | verification record | Passing verification is not recorded. |
| Human Decision | `N/A` | Yes / No | No / N/A | N/A | distinct human decision record / N/A | No high-risk decision is recorded. |

## Decision Trace

| Step | Input | Status | Effect |
|---|---|---|---|
| 1 | Change Impact Coverage | `MISSING` | Dominant reason: this input sets final decision to NEEDS_IMPACT_COVERAGE. |
| 2 | Execution Closure | `MISSING` | Stricter than done, but lower precedence than Change Impact Coverage. |
| 3 | Verification | `MISSING` | Stricter than done, but lower precedence than Change Impact Coverage. |

## Dominant Reason

| Field | Value |
|---|---|
| Input | Change Impact Coverage |
| Status | `MISSING` |
| Result | `NEEDS_IMPACT_COVERAGE` |
| Why this decides | Related-surface coverage outranks a completion claim when behavior or rule changes may affect more than one surface. |

## Conflict Summary

| Field | Value |
|---|---|
| Inputs disagree | Yes |
| Stricter input | Change Impact Coverage |
| Summary | Some closure inputs may pass, but missing related-surface coverage controls the final result; stricter result wins. |

## Single Source Rule

This decision is the single closure source for this task: Yes

If lower-level close-out artifacts disagree, this decision uses the stricter result: Yes

## Task Entry Binding

| Field | Value |
|---|---|
| Work Queue Item Ref | `artifact:work-queue-takeover-reports/001-current.md#WQ-001` |
| Work Queue Item Digest | `sha256:0000000000000000000000000000000000000000000000000000000000000000` |
| Work Queue Item State | `CURRENT` |
| Work Queue Item Current Task Match | `Yes` |
| Approved Resume Review | `No` |
| Resume Review Ref | N/A |
| Resume Review Digest | N/A |
| Resume Review Owner | N/A |
| Resume Review Task Match | N/A |
| Task Governance Ref | `artifact:task-governance-reports/001-task-governance.md` |
| Task Governance Digest | `sha256:0000000000000000000000000000000000000000000000000000000000000000` |
| Task Governance Tier | `MEDIUM` |
| Task Governance Review Level | `TARGETED` |
| Task Governance Task Match | `Yes` |
| Minimal Verification Status | `N/A` |
| Targeted Verification Status | `RECORDED` |
| High Impact Evidence Chain Complete | `N/A` |
| Task Governance Blocks Completion | `Yes` |
| Tier Completion Requirements Satisfied | `No` |
| Unresolved Task Governance Blockers | targeted verification missing |
| Plain User Blocker | This task still needs targeted verification before it can be called done. |

## Required Next Action

1. Record or run verification.

## Input Verification

| Input | Required | Verified | Evidence ref | Checker |
|---|---|---|---|---|
| Change Impact Coverage | Yes / No | Yes / No / N/A | N/A | `check-change-impact-coverage --report --require-precise-evidence` / N/A |
| Execution Closure | Yes | Yes / No | N/A | `check-execution-closure --report --require-impact-coverage --require-precise-evidence` |
| Verification | Yes | Yes / No | N/A | verification record |
| Human Decision | Yes / No | Yes / No / N/A | N/A | distinct human decision record / N/A |

## Evidence Map

| Evidence | Status | Verified | Ref | Checker |
|---|---|---|---|---|
| Impact coverage | `MISSING` | No / N/A | N/A | `check-change-impact-coverage` / N/A |
| Execution closure | `MISSING` | No | N/A | `check-execution-closure --report` |
| Verification | `MISSING` | No | N/A | verification record |
| Human decision | `N/A` | N/A | N/A | distinct human decision record / N/A |

## Boundaries

- This decision writes target files: No
- This decision authorizes apply: No
- This decision approves implementation: No
- This decision approves commit or push: No
- This decision approves release or production: No
- This decision modifies CI or hooks: No
- This decision changes task state: No
- This decision replaces Review Loop: No
- This decision replaces Safe Launch: No
- This decision approves security/privacy/compliance/payment/migration decisions: No

## Outcome

`CLOSURE_DECISION_RECORDED`
