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
