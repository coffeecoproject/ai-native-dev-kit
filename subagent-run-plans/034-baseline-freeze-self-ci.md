# Subagent Run Plan: Baseline Freeze And Self CI

## Human Summary

This plan records how helper-agent roles are used for Productization Hardcut phase `0.34.0`. All roles are closed or skipped before final reporting, and the main thread remains the only writer for repository files.

## Goal

Use helper-agent roles to inspect the phase plan, validate scope, review CI and release evidence, route deterministic repairs, and produce the final report for `tasks/034-baseline-freeze-self-ci.md`.

## Orchestration Mode

Selected: REVIEW_LOOP

Reason: The phase requires implementation, self-review, deterministic repair if checks fail, and final evidence.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | Goal route selected | Handoff recorded in `goal-cards/034-baseline-freeze-self-ci.md` |
| A2 | Productization Architect | READ_ONLY_DRAFT | CLOSED | phase artifacts only | Scope mapped to phase `0.34.0` | Boundaries recorded in `specs/034-baseline-freeze-self-ci.md` |
| A3 | CI Reviewer | READ_ONLY | CLOSED | none | CI commands reviewed for phase alignment | Findings recorded in `review-packets/034-baseline-freeze-self-ci.md` |
| A4 | Main Builder | WRITER | CLOSED | `.github/`, `releases/`, version files, phase artifacts, `scripts/check-intentos.mjs` | Files updated and checks executed | Verification recorded in `final-reports/034-baseline-freeze-self-ci.md` |
| A5 | Reviewer | READ_ONLY | CLOSED | none | Review loop findings handed off | Findings recorded in `review-loop-reports/034-baseline-freeze-self-ci.md` |
| A6 | Repair | WRITER_LIMITED | SKIPPED | phase artifacts and checker wording only | No bounded auto-fix finding required before final report | Skip evidence recorded in `review-loop-reports/034-baseline-freeze-self-ci.md` |
| A7 | Reporter | READ_ONLY_DRAFT | CLOSED | `final-reports/` and `releases/0.34.0/` evidence files | Human-facing report written | Output recorded in `final-reports/034-baseline-freeze-self-ci.md` |

## Writer Control

Many readers, one writer: Yes

Single active writer: Yes

Disjoint write ownership used: No

Active writer rule: The main thread owns final repository edits, verification, and release evidence. Helper-agent outputs are review inputs only.

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure evidence: Each row in Role Roster has a concrete handoff, report, or skip record.

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

- Use read-only helper roles to inspect the plan, CI files, and release evidence.
- Use the main builder role for bounded file edits inside the task scope.
- Use a repair role only for `AUTO_FIX` findings that stay inside phase `0.34.0`.
- Run the commands listed in `tasks/034-baseline-freeze-self-ci.md`.
- Close or skip every helper role before final response.

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
| Phase must stay inside `0.34.0` | Main builder | Enforced by task scope and review packet |
| CI must require no secrets | CI reviewer | Confirmed in CI workflow review |
| Later manifest and CLI work must remain out of scope | Reviewer | Recorded as boundary in review loop |

## Human Decisions Needed

| Decision | Status | Route |
|---|---|---|
| Real CODEOWNERS maintainer handles | Deferred outside current task | Future release governance task |
| License wording changes | Deferred outside current task | Separate human license decision |

## Next Safe Step

Run `node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/034-baseline-freeze-self-ci.md` and keep all helper roles closed or skipped.

## Technical Details

This plan demonstrates many-reader, one-writer coordination for the intentos repository. It does not launch external GPT/API automation and does not create persistent agents.

## Audit Notes

- Productization phase `0.34.0` only.
- No target-project files are modified.
- No helper role remains open after handoff.
