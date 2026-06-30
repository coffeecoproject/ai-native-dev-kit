# Subagent Run Plan: Guided Adoption Entry

## Human Summary

One-sentence conclusion:

Use optional read-only review and repair-analysis helpers, but keep the main thread as the only writer and close all helpers after handoff.

## Goal

Goal: Implement and review the 1.1.0 Guided Adoption Entry.

Related Goal Card: `goal-cards/110-guided-adoption-entry.md`

Related Task: `tasks/110-guided-adoption-entry.md`

Non-goals:

- No persistent subagents.
- No external GPT/API reviewer automation.

## Orchestration Mode

Selected: REVIEW_LOOP

Allowed values:

```text
READ_ONLY_RESEARCH
PLAN_THEN_BUILD
REVIEW_LOOP
AUTO_FIX_REPAIR
REPORTING
```

Why subagents are useful: A reviewer can inspect whether the new entry stays read-only and whether the examples match the checker.

Why a single main thread alone is not enough: Independent review reduces missed governance regressions for generated-project assets.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Reviewer | READ_ONLY | CLOSED | none | findings handed off to main thread | Review Loop Report updated |
| A2 | Repair analysis | READ_ONLY_DRAFT | SKIPPED | none | no separate repair helper needed | Main thread handled repairs |

## Writer Control

Many readers, one writer: Yes

Current writer: main thread

Single active writer: Yes

Disjoint write ownership used: No

If disjoint write ownership is used, human-approved exception:

| Agent ID | Path Scope | Reason | Owner | Expiry |
|---|---|---|---|---|
| none | none | none | human | not applicable |

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure notes: Helper usage is bounded to review and is closed or skipped before release reporting.

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

- Open only the subagents listed in the Role Roster.
- Keep reviewer, planner, and baseline agents read-only.
- Allow only the current writer to modify approved paths.
- Close or mark each subagent `CLOSED` or `SKIPPED` immediately after handoff.

## Forbidden Actions

- Do not leave subagents running after their work is handed off.
- Do not leave `RUNNING` agents in a committed run plan.
- Do not keep standby subagents open for future work.
- Do not run multiple active writers on the same files.
- Do not let reviewer agents edit files.
- Do not let repair agents handle `NEEDS_HUMAN_DECISION`.
- Do not bypass Goal Mode, task cards, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.
- Do not create persistent monitors, schedules, active Skills, automations, or external GPT/API reviewer calls from this run plan.

## Handoff / Findings

| Agent ID | Output | Routed To | Status |
|---|---|---|---|
| A1 | Read-only review findings | Review Loop Report | Closed |
| A2 | Not used | no action | Closed |

## Human Decisions Needed

| Decision | Reason | Owner | Needed Before | Status |
|---|---|---|---|---|
| None | Implementation stays inside approved 1.1.0 scope | human | final response | Not needed |

## Next Safe Step

Next action: Run self-check and update final report evidence.

## Technical Details

Commands run:

```text
Pending during task planning.
```

Related files:

- `review-loop-reports/110-guided-adoption-entry.md`

## Audit Notes

- Subagent output is input, not authority.
- Main thread remains responsible for all writes and final reporting.
- All subagents must be closed or skipped before final task response.
