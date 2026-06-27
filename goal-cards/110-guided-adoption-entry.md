# Goal Card: Guided Adoption Entry

## Human Summary

One-sentence conclusion:

Route the 1.1.0 work as `ADOPT_PROJECT` tooling: create a read-only first-hour entry that recommends adoption paths without writing target project files.

## Goal

Goal: Implement Guided Adoption Entry for `1.1.0`.

Source: `requests/110-guided-adoption-entry.md`

Non-goals:

- No external reviewer automation.
- No platform-baseline deepening.
- No industrial-pack expansion.
- No package publishing.

## Goal Mode

Selected: ADOPT_PROJECT

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

Why: The work is about project adoption entry and routing, not a business feature.

## Project State

Project state: DEV_KIT_REPOSITORY

Workflow state: DEV_KIT_SOURCE

Adoption mode: NOT_APPLICABLE

Current `workflow-next` result:

```text
NEXT_ACTION: RUN_DEV_KIT_SELF_CHECK
CAN_WRITE_WORKFLOW_ASSETS: not_applicable
MUST_STOP_FOR_HUMAN: no
```

## Risk And Level

Task level: L2

Baseline level: not selected

Risk reason: The task changes generated-project workflow assets and CLI behavior.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: Yes

If yes, related decision area:

- structure / module boundary

Engineering baseline status: This is dev-kit product-surface tooling; no target-project engineering baseline is changed.

Decision Brief needed: No

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | Yes | `requests/110-guided-adoption-entry.md` | Scope source |
| Preflight | Yes | `preflight/110-guided-adoption-entry.md` | Risk routing |
| Spec | Yes | `specs/110-guided-adoption-entry.md` | Behavior definition |
| Eval | Yes | `evals/110-guided-adoption-entry.md` | Verification |
| Task | Yes | `tasks/110-guided-adoption-entry.md` | Implementation scope |
| Review Packet | Yes | `review-packets/110-guided-adoption-entry.md` | Review input |
| Review Loop Report | Yes | `review-loop-reports/110-guided-adoption-entry.md` | Review closure |
| Decision Brief | No | Not needed | Approved scope is clear |
| Final Report / Handoff | Yes | `final-reports/110-guided-adoption-entry.md` | Release summary |

## Allowed Actions

- Read project and workflow files needed to route the goal.
- Create or update only the artifacts listed as required after the selected mode permits writes.
- Run non-destructive local checks referenced by the selected route.

## Forbidden Actions

- Do not treat this Goal Card as approval to implement beyond the task scope.
- Do not bypass request, preflight, spec, eval, task, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.
- Do not widen scope, accept risk, approve release, change production config, add dependencies, change migrations, change permission model, or modify architecture without the required human decision.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Confirm 1.1.0 should focus on Guided Adoption Entry | human | implementation | Confirmed by request |

## Next Safe Step

Next action: Implement the task, then run review and self-check.

## Technical Details

Related files:

- `scripts/start-project.mjs`
- `scripts/check-guided-adoption.mjs`
- `templates/adoption-recommendation-report.md`
- `docs/first-hour.md`

Commands run:

```text
Pending during task planning.
```

## Audit Notes

- Goal Card is a routing artifact, not execution approval.
- Subagent orchestration is optional and must be closed if used.
