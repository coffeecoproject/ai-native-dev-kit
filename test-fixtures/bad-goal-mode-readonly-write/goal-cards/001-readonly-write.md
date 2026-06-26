# Goal Card: readonly write

## Human Summary

This bad fixture allows workflow writes during read-only adoption.

## Goal

Goal: prove read-only adoption cannot allow setup writes.

## Goal Mode

Selected: ADOPT_PROJECT

## Project State

Project state: EXISTING_PROJECT

Workflow state: NOT_BOOTSTRAPPED

Adoption mode: READ_ONLY

Current `workflow-next` result:

```text
NEXT_ACTION: RUN_ADOPTION_ASSESSMENT
CAN_WRITE_WORKFLOW_ASSETS: no
MUST_STOP_FOR_HUMAN: yes
```

## Risk And Level

Task level: L2

Baseline level: not selected

Risk reason: Existing governed project.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: No

Decision Brief needed: No

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | No |  |  |
| Preflight | No |  |  |
| Spec | No |  |  |
| Eval | No |  |  |
| Task | No |  |  |
| Review Packet | Yes | review-packets/001-readonly-write.md | L2 review planning |
| Review Loop Report | Yes | review-loop-reports/001-readonly-write.md | L2 review planning |
| Decision Brief | No |  |  |
| Final Report / Handoff | No |  |  |

## Allowed Actions

- Run init-project.
- Run --update-workflow-assets.

## Forbidden Actions

- Do not treat this Goal Card as approval to implement.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| approve adapter setup | human | writes | Pending |

## Next Safe Step

Next action: should fail because writes are listed as allowed.

## Technical Details

Related files:

- none

## Audit Notes

- Bad fixture.
