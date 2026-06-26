# Goal Card: Project Status Filter

## Human Summary

Route a simulated L2 feature from request to implementation-ready artifacts, then through review and final reporting. This card chooses execution route only; it does not approve implementation or expand the task scope.

## Goal

Implement the selected task card `tasks/001-project-status-filter.md` in the simulated example, using the linked spec and eval as the execution boundary.

## Goal Mode

Selected: IMPLEMENT_TASK

Reason: The task card, spec, eval, and review requirements are already present for this simulated L2 flow.

## Project State

Project state: BOOTSTRAPPED_EXAMPLE

Adoption mode: Not applicable to this example directory.

Workflow state: Request, preflight, spec, eval, task, review packet, and review loop report are present.

## Risk And Level

Task level: L2

Risk summary: The feature touches domain status typing, API query mapping, UI state, review closure, and follow-up decision routing, but does not touch production code or deployment.

## Engineering Baseline Touch

Engineering baseline checked: Yes

Baseline ref: `docs/engineering-baseline.md`

Impact: Follow the local `ProjectStatus` union and string API boundary rules. Do not create new project-wide engineering conventions.

## Required Artifacts

| Artifact | Required | Ref |
|---|---|---|
| Request | Yes | `requests/001-project-status-filter.md` |
| Preflight | Yes | `preflight/001-project-status-filter.md` |
| Spec | Yes | `specs/001-project-status-filter.md` |
| Eval | Yes | `evals/001-project-status-filter.md` |
| Task | Yes | `tasks/001-project-status-filter.md` |
| Review Packet | Yes | `review-packets/001-project-status-filter.md` |
| Review Loop Report | Yes | `review-loop-reports/001-project-status-filter.md` |
| Final Report | Yes | `final-reports/001-project-status-filter.md` |

## Allowed Actions

- Read the linked artifacts and engineering baseline.
- Implement only the selected task scope in the simulated example.
- Run the listed checks.
- Apply `AUTO_FIX` findings that stay inside the task scope.
- Produce final report and bounded follow-up proposal.

## Forbidden Actions

- Goal Card is route selection only and not approval for release, risk acceptance, Human Approval, Approval scope changes, or gate bypass.
- Do not change task scope without human approval.
- Do not bypass Risk Gate requirements.
- Do not implement backend lookup administration from a next-step suggestion.
- Do not create new platform or industrial baseline rules from this example.

## Human Decisions Needed

| Decision | Required Now | Route |
|---|---|---|
| Move status options to backend-managed lookup | No | `follow-up-proposals/001-status-filter-lookup-admin.md` |

## Next Safe Step

Run the task-scoped checks and review loop checks for `tasks/001-project-status-filter.md`.

## Technical Details

Execution route: Goal Card -> task artifacts -> Subagent Run Plan -> Review Packet -> Review Loop Report -> Final Report.

The main thread remains responsible for writes and verification. Helper agents provide read-only or bounded analysis only.

## Audit Notes

- This is a simulated dogfood example, not real project validation.
- All L2 review artifacts are present.
- Subagent closure is handled in `subagent-run-plans/001-project-status-filter.md`.
