# Active Work Thread: 001-appointment-first-slice

## Human Decision Summary

| Recommended choice | What it means | Can AI continue now? | Writes project files? | Risk | What happens if you do nothing |
|---|---|---|---|---|---|
| A | Continue the demo appointment slice | Yes, after confirmation | Workflow/task files, then approved app files | low/medium | The project stays at planning stage |
| B | Include payment now | No | No | high | Payment needs a separate decision brief |
| C | Discuss only | No | No | low | No project files change |

Recommended choice: A

Decision needed: confirm the first demo slice.

## Human Summary

The current mainline is a small appointment demo: service list, appointment submission, and appointment records.

## Current Mainline

| Field | Value |
|---|---|
| Goal | appointment mini app first demo |
| Current task / artifact | first-slice definition |
| Delivery target | demo |
| Current status | active |
| Can AI continue now? | Limited |
| Why | Codex needs confirmation that payment and SMS stay out of the first slice |

## Latest User Input

```text
It may need payment and SMS later.
```

Intent classification:

```text
DIRECT_FOLLOW_UP
```

## Mainline Decision

| Decision | Owner | Status | Evidence / Ref |
|---|---|---|---|
| Keep payment and SMS out of first slice | human | Pending | user mentioned them as later needs |

## Parking Lot

| ID | Item | Type | Why parked | Re-entry path | Can AI do now? |
|---|---|---|---|---|---|
| P1 | payment | RISK_DECISION | value transfer and production risk | decision brief | No |
| P2 | SMS reminder | DIRECT_FOLLOW_UP | external service and cost decision | follow-up proposal | No |

## Decisions Needed

| Decision | Level | Owner | Needed before | Recommended path |
|---|---|---|---|---|
| Confirm first demo slice excludes payment/SMS | D1 | human | request/spec creation | choose A |

## Loop State

| Step | Status | Notes |
|---|---|---|
| Understand | done | appointment mini app |
| Place | done | first delivery walkthrough / define work |
| Recommend | done | demo slice |
| Confirm | pending | first slice confirmation |
| Execute | not started | wait for confirmation |
| Verify | pending | after implementation |
| Review | pending | after implementation |
| Update | pending | after confirmation |
| Continue | pending | next safe action after confirmation |

## What AI Can Do Safely

- Draft request/spec/eval/task for the first demo slice after confirmation.
- Keep payment and SMS in Parking Lot.

## What AI Must Not Do

- Do not implement payment or SMS.
- Do not approve production launch.
- Do not treat Parking Lot as approved backlog.

## Technical Details

Related artifacts:

- Request:
- Preflight:
- Spec:
- Eval:
- Task:
- Review Loop:
- Final Report:

Commands run:

```text
none; simulated example
```
