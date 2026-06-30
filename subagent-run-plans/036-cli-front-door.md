# Subagent Run Plan: CLI Front Door

## Human Summary

This plan records helper-agent roles for phase `0.36.0`. Helper roles inspect CLI scope and review behavior; the main thread owns file edits and verification.

## Goal

Use helper roles to inspect CLI boundaries, validate command routing, and confirm no helper agent remains open after `tasks/036-cli-front-door.md`.

## Orchestration Mode

Selected: PLAN_THEN_BUILD

Reason: The phase needs a small implementation after scope and command routing are planned.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | Implementation route selected | Handoff recorded in `goal-cards/036-cli-front-door.md` |
| A2 | CLI Planner | READ_ONLY_DRAFT | CLOSED | none | Command registry and boundaries drafted | Findings reflected in `specs/036-cli-front-door.md` |
| A3 | CLI Writer | WRITER_LIMITED | CLOSED | `package.json`, `scripts/cli.mjs`, README CLI guidance, and self-check wiring | CLI smoke checks pass | Evidence recorded in `final-reports/036-cli-front-door.md` |
| A4 | Reviewer | READ_ONLY | CLOSED | none | CLI facade reviewed against scope | Findings recorded in `review-loop-reports/036-cli-front-door.md` |
| A5 | Reporter | READ_ONLY_DRAFT | CLOSED | `final-reports/` and `releases/0.36.0/` evidence files | Human-facing report drafted | Output recorded in `final-reports/036-cli-front-door.md` |

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

Closure evidence: Each row in Role Roster has a concrete handoff artifact or evidence location.

## Dispatch Hygiene

Before dispatch checked: Yes

Idle subagents recovered: Yes

Completed subagents closed: Yes

Unused planned subagents skipped: N/A

Stale task subagents closed or skipped: Yes

Task drift checked: Yes

Active writer count: 0

Dispatch allowed: Yes

Dispatch block reason: N/A

Recovery notes: Historical run plan updated to record that no helper should be reused before cleanup.

## Allowed Actions

- Use planning and read-only review roles to inspect CLI scope.
- Let the main thread write approved phase files.
- Keep all writes inside phase `0.36.0` scope.
- Run the commands listed in `tasks/036-cli-front-door.md`.

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
| CLI must stay thin | Main thread | Enforced by delegation to existing scripts |
| Write commands must be visible | Main thread | Enforced by CLI output and self-check smoke |
| Package must remain private | Main thread | Enforced in `package.json` and decision brief |
| `migrate` must stay planned-only | Main thread | Enforced by CLI exit behavior and self-check smoke |

## Human Decisions Needed

| Decision | Status | Route |
|---|---|---|
| Keep package unpublished in this phase | Confirmed for this phase | `decision-briefs/036-cli-front-door.md` |
| Publish package later | Deferred | Future distribution decision |

## Next Safe Step

Run `node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/036-cli-front-door.md`.

## Technical Details

This run plan uses one limited writer role and closes all helper roles before final response, commit, or handoff.

## Audit Notes

- No external GPT/API automation is used.
- No helper role remains open after handoff.
- No persistent monitor or automation is created.
