# Goal Card: <goal-name>

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Discuss only | Clarify goal without executing | No | low | Choose when direction is not settled |
| B | Define work | Create request, preflight, spec, eval, or task artifacts | Workflow records only | low/medium | Choose when the idea needs structure before code |
| C | Implement approved task | Execute within the approved task boundary | Approved task files only | medium | Choose when scope, baseline, and evidence are ready |
| D | Stop for decision | Pause because goal mode or authority is unclear | No, unless decision record is saved | medium/high | Choose when the message changes risk or scope |

Recommended reason:

What happens if you do nothing:

## Human Summary

One-sentence conclusion:

This card records the selected workflow route before Codex creates artifacts, implements, reviews, repairs, decides, or reports.

## Goal

Goal:

Source:

Non-goals:

## Goal Mode

Selected: DEFINE_WORK

Allowed values:

```text
DISCUSS_ONLY
ADOPT_PROJECT
DEFINE_WORK
IMPLEMENT_TASK
REVIEW_TASK
REPAIR_TASK
BASELINE_DECISION
HANDOFF_OR_REPORT
```

Why:

## Project State

Project state:

Workflow state:

Adoption mode:

Current `workflow-next` result:

```text
NEXT_ACTION:
CAN_WRITE_WORKFLOW_ASSETS:
MUST_STOP_FOR_HUMAN:
```

## Risk And Level

Task level: L1

Baseline level: BL0_LIGHTWEIGHT / BL1_STANDARD / BL2_INDUSTRIAL / not selected

Risk reason:

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: Yes / No

If yes, related decision area:

- structure / module boundary
- DTO / schema / domain boundary
- enum / string / lookup / state-machine
- API contract / generated type
- permission / migration / dependency / cross-module state

Engineering baseline status:

Decision Brief needed: Yes / No

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | Yes / No |  |  |
| Preflight | Yes / No |  |  |
| Spec | Yes / No |  |  |
| Eval | Yes / No |  |  |
| Task | Yes / No |  |  |
| Review Packet | Yes / No |  |  |
| Review Loop Report | Yes / No |  |  |
| Decision Brief | Yes / No |  |  |
| Final Report / Handoff | Yes / No |  |  |

## Allowed Actions

- Read project and workflow files needed to route the goal.
- Create or update only the artifacts listed as required after the selected mode permits writes.
- Run non-destructive local checks referenced by the selected route.

## Forbidden Actions

- Do not treat this Goal Card as approval to implement.
- Do not bypass request, preflight, spec, eval, task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.
- Do not widen scope, accept risk, approve release, change production config, add dependencies, change migrations, change permission model, or modify architecture without the required human decision.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Confirm selected goal mode if risk or write authority is unclear | human | next action | Pending / Not needed |

## Next Safe Step

Next action:

## Technical Details

Related files:

- 

Commands run:

```text

```

## Audit Notes

- Goal Card is a routing artifact, not execution approval.
- Subagent orchestration is not activated by this card.
