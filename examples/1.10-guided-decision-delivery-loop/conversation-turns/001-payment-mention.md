# Conversation Turn Classification: 001-payment-mention

## Human Decision Summary

| Recommended choice | What it means | Can AI continue now? | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Park payment for later | Yes, for current demo slice | Current first-slice artifacts only | low if respected | Payment is not needed now |
| B | Start payment decision brief | No current implementation | Decision brief only | high | Payment must be considered now |
| C | Stop | No | No | low | Direction is unclear |

Recommended choice: A

What I need from you: confirm payment stays out of the first demo.

## Human Summary

The payment mention is a future high-risk topic, not permission to add payment to the current first slice.

## User Message

```text
It may need payment later.
```

## Active Work

- Current goal: appointment mini app first demo
- Current task: first-slice definition
- Current approved scope: service list, appointment submission, appointment records

## Mainline Placement

| Bucket | Value |
|---|---|
| Current Mainline | appointment demo slice |
| Parking Lot | payment |
| Decision Needed | whether payment stays out of first slice |
| Stop Item | payment implementation in current task |

## Intent Classification

`DIRECT_FOLLOW_UP`

## Relation To Current Task

`OUT_OF_SCOPE`

## Risk / Scope Impact

Payment touches value transfer, external provider, compliance, refund, release, and production risk. It must not enter current implementation silently.

## Selected Action

Park payment and continue only after the user confirms the first demo excludes it.

## Can Continue Current Task?

`No`

## Required Human Decision

Confirm payment is excluded from the first demo.

## Audit Notes

This routes through Conversation Drift Control and Decision Delegation Boundary. Payment needs a separate decision brief before implementation.
