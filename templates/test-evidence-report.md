# Test Evidence Report

## Human Summary

Summarize whether the Verification Plan obligations are covered by concrete evidence.

## User Request

- Request:
- Task ref:

## Source Systems

| Source | Status | Ref | Outcome | Digest |
|---|---|---|---|---|
| `verification_plan` | `RECORDED` | `artifact:verification-plans/001.md` | `VERIFICATION_PLAN_READY` | `sha256:...` |
| `business_rule_closure` | `RECORDED` | `artifact:business-rule-closures/001.md` | `READY_FOR_IMPACT_COVERAGE` | `sha256:...` |
| `change_impact_coverage` | `RECORDED` | `artifact:change-impact-coverage-reports/001.md` | `CHANGE_IMPACT_RECORDED` | `sha256:...` |

## Test Evidence Identity

- Test evidence ref:
- Test evidence digest:
- Verification plan ref:
- Verification plan digest:
- Intent digest:

## Verification Plan Binding

- Verification plan state:
- Required obligations:
- Covered obligations:
- Missing obligations:

## Evidence Items

| ID | Type | Result State | Ref | Command | Owner | Environment | Exit Code | Ran After Change | Current Task Match | Covers Obligations | Output Digest | Failure Reason | Limitations |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `evidence:api-negative` | `COMMAND_OUTPUT` | `PASSED` | `artifact:evidence/api-negative.txt` | `npm test -- api-negative` | automated-test-command | local-dev | `0` | `Yes` | `Yes` | `verify:api-negative` | `sha256:...` | not recorded | None |

## Coverage Map

| Obligation ID | Coverage State | Evidence IDs | Reason |
|---|---|---|---|
| `verify:api-negative` | `COVERED` | `evidence:api-negative` | Task-specific negative API evidence recorded. |

## Test Quality Controls

| ID | Applies To | Status | Evidence IDs | Reason |
|---|---|---|---|---|
| `control:broad-command-not-proof` | `TEST_COVERAGE` | `SATISFIED` | `evidence:api-negative` | Evidence maps to obligations, not only broad command success. |

## Known Gaps

| Gap ID | Severity | Reason | Required Follow-up |
|---|---|---|---|
| `none` | `NONE` | No known gaps recorded. | Not required. |

## Manual Verification

| ID | Owner | Decision Ref | Evidence Ref | Status | Reason |
|---|---|---|---|---|---|
| `none` | None | `not required` | `not required` | `NOT_REQUIRED` | No manual verification required. |

## Existing Project Mapping

- Status:
- Ref:
- Reason:

## Boundaries

- This report writes target files: No
- This report executes tests: No
- This report fabricates evidence: No
- This report authorizes implementation: No
- This report approves release or production: No
- This report proves product correctness: No
- This report proves real-environment behavior: No

## Evidence Authority

For strict current-task evidence, include an `authority_binding` in the
machine-readable record. It binds project identity, task identity, and the raw
digests of consumed local source files. It is not approval or release authority.

## Machine-Readable Evidence

```json
{}
```

## Outcome

`TEST_EVIDENCE_BLOCKED`

## Next Step

Attach real evidence or mark missing obligations before claiming completion.
