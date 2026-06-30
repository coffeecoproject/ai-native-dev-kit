# Unified Apply Plan: <name>

## Human Decision Summary

One-sentence conclusion:

Recommended choice:

Can Codex write now: No

Need from human:

If nothing is approved:

## Apply Readiness

| Field | Value |
|---|---|
| State | `PLAN_ONLY` |
| Can apply now? | No |
| Can AI write now? | No |
| Why |  |
| Recommended next step |  |

## Source Evidence

| Evidence | Ref | Status |
|---|---|---|
| Workflow Guidance Card |  | missing / present / not applicable |
| Workflow Adoption Map |  | missing / present / not applicable |
| Baseline Decision Card |  | missing / present / not applicable |
| Document Archive Apply Plan |  | missing / present / not applicable |
| Hook Policy / Hook Plan |  | missing / present / not applicable |
| Execution Closure Report |  | missing / present / not applicable |

## Planned Actions

| ID | Action type | Target paths | Reason | Status | Will write now | Approval required | Rollback required |
|---|---|---|---|---|---|---|---|
| A-001 | WORKFLOW_ASSET_UPDATE | `.ai-native`, `scripts/*` |  | PLAN_ONLY | No | Yes | Yes |

## Human-Only / Blocked Actions

| ID | Action type | Reason | Required owner | Status |
|---|---|---|---|---|
| H-001 |  |  | human | HUMAN_APPROVAL_REQUIRED |

## Preconditions

- Target project exists:
- Existing project rules reviewed:
- Dirty work reviewed:
- Required evidence linked:
- High-risk actions separated:

## Backup / Rollback Plan

| Action | Backup required | Backup path | Rollback step | Rollback verification |
|---|---|---|---|---|
| A-001 | Yes |  |  |  |

## Verification Plan

| Step | Command or method | Required before apply | Required after apply | Evidence path | Owner |
|---|---|---|---|---|---|
| Pre-apply check |  | Yes | No |  | Codex |
| Post-apply check |  | No | Yes |  | Codex |

## Human Decisions Needed

| Decision | Why it matters | Options | Recommended option | Owner | Status |
|---|---|---|---|---|---|
| Approve apply scope | Writes require explicit approval | approve / narrow / reject | narrow if unclear | human | PENDING |

## Boundary

- This plan writes files now: No
- This plan authorizes apply: No
- This plan approves implementation: No
- This plan approves release or production: No
- This plan modifies CI or hooks now: No
- This plan deletes or archives files now: No
- This plan changes source of truth now: No
- This plan grants Codex permission to continue beyond scope: No

## Outcome

`NEEDS_HUMAN_DECISION`
