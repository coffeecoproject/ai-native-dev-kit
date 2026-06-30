# Subagent Run Plan: unclosed

## Human Summary

One helper remains running.

## Goal

Goal: prove unclosed subagents fail.

## Orchestration Mode

Selected: REVIEW_LOOP

Why subagents are useful: read-only review.

Why a single main thread alone is not enough: independent review.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Reviewer | READ_ONLY | RUNNING | none | findings handed off |  |

## Writer Control

Many readers, one writer: Yes

Current writer: none

Single active writer: Yes

Disjoint write ownership used: No

## Lifecycle Closure

All subagents closed: No

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: No

Closure notes: bad fixture.

## Dispatch Hygiene

Before dispatch checked: Yes

Idle subagents recovered: No

Completed subagents closed: Yes

Unused planned subagents skipped: N/A

Stale task subagents closed or skipped: Yes

Task drift checked: Yes

Active writer count: 0

Dispatch allowed: Yes

Dispatch block reason: running reviewer was ignored

Recovery notes: Bad fixture intentionally leaves one reviewer running.

## Allowed Actions

- Read files.

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
| A1 | findings | Review Loop | Open |

## Human Decisions Needed

| Decision | Reason | Owner | Needed Before | Status |
|---|---|---|---|---|
| close reviewer | reviewer still running | human | final response | Pending |

## Next Safe Step

Next action: close A1.

## Technical Details

Commands run:

```text

```

Related files:

- none

## Audit Notes

- Bad fixture.
