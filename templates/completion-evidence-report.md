# Completion Evidence Gate Report

This report is a read-only completion gate. It does not run tests, write target files, approve commits, or approve release.

## Human Summary

| Field | Value |
|---|---|
| Completion State | `BLOCKED_BY_MISSING_SOURCE` |
| Can Claim Complete | `No` |
| Safe Next Step | Attach the missing source artifacts before claiming completion. |

## User Request

- Request:
- Task ref:

## Completion Evidence Gate

| Check | Status | Source | Expected | Actual | Reason |
|---|---|---|---|---|---|
| `check:business_rule_closure` | `FAIL` | `business_rule_closure` | Business Rule Closure is READY_FOR_IMPACT_COVERAGE. | `NOT_PROVIDED` | Required source is missing. |
| `check:source-digest-consistency` | `FAIL` | `source_chain` | Source digests match referenced artifacts. | `No` | Required source artifacts are missing. |
| `check:intent-consistency` | `FAIL` | `source_chain` | Source intent digests match current completion intent. | `No` | Required source artifacts are missing. |
| `check:source-chain-binding` | `FAIL` | `source_chain` | BRC -> Verification Plan -> Test Evidence -> Execution Assurance refs and digests match. | `No` | Required source artifacts are missing. |

## Source Chain

| Source | Status | Ref | Task Ref | Intent Digest | Outcome | Ready | Digest | Reason |
|---|---|---|---|---|---|---|---|---|
| `business_rule_closure` | `NOT_PROVIDED` | `not provided` | `not provided` | `not provided` | `not provided` | `No` | `not provided` | Required source reference was not provided. |

## Task Consistency

- Expected task ref:
- All sources same task: `No`
- Reason:

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
| Plain User Blocker | This task still needs targeted verification before it can be called complete. |

## Plan Review Binding

| Field | Value |
|---|---|
| Required | `No` |
| Plan Review Ref | `N/A` |
| Plan Review State | `N/A` |
| Current Task Match | `N/A` |
| Ready For Implementation Review | `No` |
| Implementation Authorized By This Report | `No` |

## Missing Or Blocking Items

- Missing source artifacts.

## Boundaries

- This report writes target files: No
- This report runs tests: No
- This report fabricates evidence: No
- This report authorizes implementation: No
- This report approves commit or push: No
- This report approves release or production: No
- This report proves product correctness: No
- This report proves real-environment behavior: No
- This report replaces source systems: No

## Machine-Readable Evidence

```json
{}
```

## Outcome

`BLOCKED_BY_MISSING_SOURCE`

## Next Step

Attach the missing source artifacts before claiming completion.
