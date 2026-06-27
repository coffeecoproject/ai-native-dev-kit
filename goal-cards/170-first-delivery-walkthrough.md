# Goal Card: 1.7 First Delivery Walkthrough

## Human Summary

Route the user request into implementation of a complete simulated first-delivery walkthrough.

## Goal

Goal: add 1.7 First Delivery Walkthrough.

Source: Human conversation.

Non-goals: do not claim real-project production validation or approve release/risk decisions.

## Goal Mode

Selected: IMPLEMENT_TASK

Why: The user explicitly asked Codex to run the complete simulation using subagent orchestration.

## Project State

Project state: source repository

Workflow state: already governed

Adoption mode: not applicable

Current `workflow-next` result:

```text
NEXT_ACTION: IMPLEMENT_TASK
CAN_WRITE_WORKFLOW_ASSETS: Yes
MUST_STOP_FOR_HUMAN: No
```

## Risk And Level

Task level: L2

Baseline level: BL1_STANDARD

Risk reason: changes shared workflow assets, checkers, generated project behavior, and public release wording.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: No

If yes, related decision area:

- structure / module boundary
- DTO / schema / domain boundary
- enum / string / lookup / state-machine
- API contract / generated type
- permission / migration / dependency / cross-module state

Engineering baseline status: Not applicable

Decision Brief needed: No

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | Yes | `requests/170-first-delivery-walkthrough.md` | user request |
| Preflight | Yes | `preflight/170-first-delivery-walkthrough.md` | scope/risk |
| Spec | Yes | `specs/170-first-delivery-walkthrough.md` | intended behavior |
| Eval | Yes | `evals/170-first-delivery-walkthrough.md` | checks |
| Task | Yes | `tasks/170-first-delivery-walkthrough.md` | execution boundary |
| Review Packet | Yes | `review-packets/170-first-delivery-walkthrough.md` | L2 review input |
| Review Loop Report | Yes | `review-loop-reports/170-first-delivery-walkthrough.md` | L2 review closure |
| Decision Brief | No | Not applicable | no human decision needed |
| Final Report / Handoff | Yes | `final-reports/170-first-delivery-walkthrough.md` | closure |

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
| None | human | not applicable | Not needed |

## Next Safe Step

Next action: complete review loop, close subagents, and report verification.

## Technical Details

Related files:

- `tasks/170-first-delivery-walkthrough.md`
- `review-packets/170-first-delivery-walkthrough.md`
- `review-loop-reports/170-first-delivery-walkthrough.md`

Commands run:

```text
node scripts/check-dev-kit.mjs
```

## Audit Notes

- Goal Card is a routing artifact, not execution approval.
- Subagent orchestration is recorded separately.
