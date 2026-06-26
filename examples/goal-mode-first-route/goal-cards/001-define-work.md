# Goal Card: define work

## Human Summary

One-sentence conclusion:

The request is broad enough that Codex should define the work path before implementation.

## Goal

Goal: Turn a broad product request into a scoped workflow path.

Source: Human conversation.

Non-goals: No implementation, dependency change, release, or production change is allowed from this card.

## Goal Mode

Selected: DEFINE_WORK

Why: The request needs request, preflight, spec, eval, and task artifacts before implementation.

## Project State

Project state: BOOTSTRAPPED_PROJECT

Workflow state: BOOTSTRAPPED

Adoption mode: STANDARD

Current `workflow-next` result:

```text
NEXT_ACTION: READY_FOR_FIRST_REQUEST
CAN_WRITE_WORKFLOW_ASSETS: not_without_more_input
MUST_STOP_FOR_HUMAN: yes
```

## Risk And Level

Task level: L1

Baseline level: BL1_STANDARD

Risk reason: The goal is not high-risk yet, but it is not small enough to implement directly.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: No

If yes, related decision area:

- not applicable

Engineering baseline status: Not required before defining the initial request.

Decision Brief needed: No

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | Yes | requests/001-define-work.md | Capture the user goal |
| Preflight | Yes | preflight/001-define-work.md | Decide readiness and missing information |
| Spec | Yes | specs/001-define-work.md | Define expected behavior |
| Eval | Yes | evals/001-define-work.md | Define acceptance checks |
| Task | Yes | tasks/001-define-work.md | Create an executable unit |
| Review Packet | No | Not needed for L1 planning | Review is not active yet |
| Review Loop Report | No | Not needed for L1 planning | Review is not active yet |
| Decision Brief | No | Not needed | No human-only baseline decision is active |
| Final Report / Handoff | No | Not needed | No completed work to report |

## Allowed Actions

- Create request, preflight, spec, eval, and task artifacts for this goal.
- Ask focused questions for missing acceptance criteria.
- Run non-destructive workflow artifact checks after artifacts are drafted.

## Forbidden Actions

- Do not treat this Goal Card as approval to implement.
- Do not bypass request, preflight, spec, eval, task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.
- Do not widen scope, accept risk, approve release, change production config, add dependencies, change migrations, change permission model, or modify architecture.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Confirm first request scope | human | task execution | Pending |

## Next Safe Step

Next action: Create `requests/001-define-work.md`.

## Technical Details

Related files:

- `core/goal-mode.md`
- `templates/goal-card.md`

Commands run:

```text
node scripts/check-goal-mode.mjs examples/goal-mode-first-route
```

## Audit Notes

- Goal Card is a routing artifact, not execution approval.
- Subagent orchestration is not activated by this card.
