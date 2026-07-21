# Plan Review Report

## Human Summary

- Plain summary:
- Plain next step:
- Plan review state:
- Ready for implementation review:
- This report authorizes implementation: No

## Plan Identity

| Field | Value |
| --- | --- |
| Plan ref |  |
| Plan digest |  |
| Plan task match |  |
| Task ref |  |

## Task Governance Binding

| Field | Value |
| --- | --- |
| Task Governance ref |  |
| Task Governance digest |  |
| Task impact |  |
| Plan review required |  |
| Current task match |  |

## Plan Content Review

| Field | Value |
| --- | --- |
| Status |  |
| Scope section present |  |
| Boundaries section present |  |
| Implementation sequence present |  |
| Verification section present |  |
| Rollback/recovery section present |  |
| Concrete target refs |  |
| Implementation step count |  |
| Missing requirements |  |

## Review Surface Analysis

| Field | Value |
| --- | --- |
| Review surface ref |  |
| Review surface digest |  |
| Source |  |
| Derived by Plan Review |  |
| Current task match |  |
| User selected surfaces | No |

## Review Surface Matrix

| Surface | Required | Before implementation | After implementation | Reviewed | Human decision needed | Findings | Blocking |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Source Chain

| Source kind | Ref | Digest | State | Current task match | Project-native equivalent | Owner | Contradicts plan |
| --- | --- | --- | --- | --- | --- | --- | --- |

For `HIGH` or `POSSIBLE_HIGH` `PLAN_REVIEW_PASSED`, source chain must include
Task Governance, Review Surface authority, Verification Plan, and any required
Business Rule Closure / Change Impact Coverage evidence. A derived review
surface matrix alone is not enough.

## Reviewed Surfaces

| Surface | Reviewed | Finding count | Notes |
| --- | --- | --- | --- |

## Findings

| ID | Severity | Surface | Summary | Required action | Resolved | Accepted |
| --- | --- | --- | --- | --- | --- | --- |

## Revision Loop

| Field | Value |
| --- | --- |
| Round |  |
| Max automatic rounds | 2 |
| Requires revision |  |
| Previous plan digest |  |

## Verification Command Review

| Field | Value |
| --- | --- |
| Commands reviewed |  |
| Commands exist in project |  |
| Commands are project-native |  |
| Commands target required behavior |  |
| Commands executed by this report | No |
| Requires Test Evidence later |  |
| Fake or unstable command found |  |
| Working directory verified |  |
| All commands authoritative |  |

Each command is statically resolved against the project. Unknown executables,
missing package scripts, unsafe working-directory changes, or commands that do
not target required behavior block `PLAN_REVIEW_PASSED`.

## Subagent Review Routing

| Field | Value |
| --- | --- |
| Subagent review recommended |  |
| Run plan required |  |
| Run plan ref |  |
| All subagents read-only | Yes |
| Subagent output is authority | No |
| All subagents closed or skipped |  |
| Fallback used |  |
| Fallback reason |  |

Fallback cannot substitute for recommended subagent review when the outcome is
`PLAN_REVIEW_PASSED`.

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

`PLAN_REVIEW_REQUIRED`

## Machine-Readable Evidence

```json
{}
```
