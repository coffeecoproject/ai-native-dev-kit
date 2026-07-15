# Goal Card: <goal-name>

## Human Decision Summary

Conclusion:

Codex-selected route:

Can AI continue now: yes / limited / no

Permitted input needed: NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED

Reason:

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

## Guided Decision Boundary

Decision level:

```text
D0 / D1 / D2 / D3 / D4
```

Current Mainline:

Parking Lot:

Permitted user input needed:

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
- Do not widen business scope without evidence, and do not change architecture,
  dependencies, migrations, permissions, production configuration, release, or
  rollback until the applicable technical gates and permitted user-input class
  are satisfied.

## Human Decisions Needed

Compatibility heading: list only the four permitted user-input classes. Do not
place architecture, workflow, risk treatment, or other technical choices here.

| Input class / blocker | Source | Needed Before | Current Status |
|---|---|---|---|
| NO_USER_ACTION / BUSINESS_FACT_NEEDED / REAL_WORLD_CONSENT_NEEDED / EXTERNAL_FACT_NEEDED | project evidence / user / external authority | dependent action | Pending / Not needed |

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
