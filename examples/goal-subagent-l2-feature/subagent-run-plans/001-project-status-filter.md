# Subagent Run Plan: Project Status Filter

## Human Summary

This plan shows how helper agents would be used for the simulated L2 status filter task. All helper agents are closed or skipped before final reporting.

## Goal

Use helper agents to inspect baseline, prepare task artifacts, review the result, route allowed repair, and produce a final report for `tasks/001-project-status-filter.md`.

## Orchestration Mode

Selected: REVIEW_LOOP

Reason: The example includes independent review, one auto-fix item, and one human-decision item.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | Goal Card route selected | Handoff recorded in `goal-cards/001-project-status-filter.md` |
| A2 | Engineering Baseline Agent | READ_ONLY | CLOSED | none | Baseline checked | Finding recorded in `docs/engineering-baseline.md` |
| A3 | Spec Agent | READ_ONLY_DRAFT | CLOSED | `requests/`, `preflight/`, `specs/`, `evals/`, `tasks/` example artifacts | Task graph prepared | Artifacts linked from `tasks/001-project-status-filter.md` |
| A4 | Builder | WRITER | CLOSED | simulated example implementation notes only | Scope applied and checks listed | Evidence recorded in `review-packets/001-project-status-filter.md` |
| A5 | Reviewer | READ_ONLY | CLOSED | none | Review findings handed off | Findings recorded in `review-loop-reports/001-project-status-filter.md` |
| A6 | Repair | WRITER_LIMITED | CLOSED | eval and final report evidence wording inside this example | `AUTO_FIX` F1 resolved | Verification recorded in `review-loop-reports/001-project-status-filter.md` |
| A7 | Reporter | READ_ONLY_DRAFT | CLOSED | `final-reports/`, `review-summaries/`, `follow-up-proposals/` example artifacts | Human-facing report written | Output recorded in `final-reports/001-project-status-filter.md` |

## Writer Control

Many readers, one writer: Yes

Single active writer: Yes

Disjoint write ownership used: No

Active writer rule: The main thread owns final file changes and verification; helper-agent outputs are input only.

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure evidence: Each row in Role Roster has a concrete handoff artifact.

## Allowed Actions

- Use read-only helper agents to inspect workflow artifacts and baseline.
- Use one bounded repair pass for `AUTO_FIX` F1.
- Keep all writes inside the example artifact directories named in Role Roster.
- Hand findings back to the main thread for verification and final report.

## Forbidden Actions

- Do not leave subagents running.
- Do not keep `RUNNING` agents after handoff.
- Do not keep standby subagents.
- Do not use multiple active writers.
- Do not let reviewer agents edit files.
- Do not resolve `NEEDS_HUMAN_DECISION` by implementation.
- Do not create persistent monitors.
- Do not create automations.
- Do not call external GPT/API reviewers from this run plan.

## Handoff / Findings

| Finding | Owner | Result |
|---|---|---|
| F1 evidence wording was too weak | Repair | Auto-fixed inside approved artifact scope |
| F2 backend-managed lookup table needs owner decision | Main thread | Routed to follow-up proposal |

## Human Decisions Needed

| Decision | Status | Route |
|---|---|---|
| Should status options be backend-managed | Deferred outside current task | `follow-up-proposals/001-status-filter-lookup-admin.md` |

## Next Safe Step

Run `node scripts/check-subagent-orchestration.mjs examples/goal-subagent-l2-feature` and keep all helper agents closed.

## Technical Details

The run plan demonstrates many-reader, one-writer coordination. It does not launch real subagents or external reviewers.

## Audit Notes

- Simulated dogfood only.
- No external GPT/API automation is used.
- No helper agent remains open after handoff.
