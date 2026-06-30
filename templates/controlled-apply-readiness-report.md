# Controlled Apply Readiness Report: <title>

## Human Decision Summary

Conclusion: `<NOT_READY | READY_FOR_HUMAN_APPROVED_APPLY | HUMAN_ONLY | BLOCKED | NO_APPLY_PLAN>`

Recommended choice: `<what the human should decide next>`

Can Codex apply now: No

What I need from you: `<approval / missing evidence / owner decision / no decision yet>`

## Apply Plan Reference

| Field | Value |
|---|---|
| Unified Apply Plan | `<path>` |
| Plan readable | Yes / No |
| Plan authorizes apply | No |
| Plan writes files now | No |
| Plan says Codex can write now | No |

## Readiness State

| Field | Value |
|---|---|
| State | `<NOT_READY | READY_FOR_HUMAN_APPROVED_APPLY | HUMAN_ONLY | BLOCKED | NO_APPLY_PLAN>` |
| Candidate for human-approved apply | Yes / No |
| Requires explicit human approval | Yes |
| Can proceed without new approval | No |

## Action Classification

| Action type | Target paths | Classification | Reason |
|---|---|---|---|
| `<ACTION_TYPE>` | `<paths>` | LOW_RISK_CANDIDATE / HUMAN_ONLY / BLOCKED | `<reason>` |

## Preconditions

| Precondition | Status | Evidence |
|---|---|---|
| Apply plan exists | pass / fail | `<path>` |
| Git state safe | pass / fail / not checked | `<evidence>` |
| Target paths bounded | pass / fail | `<evidence>` |
| Backup plan exists | pass / fail | `<evidence>` |
| Rollback plan exists | pass / fail | `<evidence>` |
| Verification plan exists | pass / fail | `<evidence>` |
| Human approval recorded | pass / fail | `<evidence>` |

## Human-Only / Blocked Items

| Item | Reason | Owner |
|---|---|---|
| `<item>` | `<reason>` | Human / Codex |

## Backup / Rollback Readiness

| Field | Value |
|---|---|
| Backup required | Yes / No |
| Backup path | `<path or N/A>` |
| Rollback step | `<step>` |
| Rollback verification | `<command or method>` |

## Verification Readiness

| Field | Value |
|---|---|
| Pre-apply verification | `<command or method>` |
| Post-apply verification | `<command or method>` |
| Evidence path | `<path>` |
| Missing verification | Yes / No |

## Boundary

- This readiness report writes files now: No
- This readiness report authorizes apply: No
- This readiness report approves implementation: No
- This readiness report approves release or production: No
- This readiness report installs hooks or changes CI: No
- This readiness report changes source of truth: No
- This readiness report enables high-risk actions: No

## Outcome

`READINESS_RECORDED | NEEDS_HUMAN_DECISION | BLOCKED`
