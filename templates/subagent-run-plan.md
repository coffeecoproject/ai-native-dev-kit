# Subagent Run Plan: <goal-name>

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Use read-only subagents | Let helpers research or review without writing | No, unless reports are saved | low | Choose when independent review is useful |
| B | Use controlled writer plan | Assign one bounded writer and close helpers after handoff | Approved scope only | medium | Choose for larger tasks with clear ownership |
| C | Stop for orchestration decision | Pause until roles, write scope, or closure are approved | Plan only | medium/high | Choose when multiple writers or sensitive files are involved |
| D | Do not use subagents | Keep work in the main thread | No | low | Choose when the task is small or slots should be preserved |

Recommended reason:

What happens if you do nothing:

## Human Summary

One-sentence conclusion:

This run plan records helper-agent usage, write authority, handoff, and closure before the main thread continues.

## Goal

Goal:

Related Goal Card:

Related Task:

Non-goals:

## Orchestration Mode

Selected: READ_ONLY_RESEARCH

Allowed values:

```text
READ_ONLY_RESEARCH
PLAN_THEN_BUILD
REVIEW_LOOP
AUTO_FIX_REPAIR
REPORTING
```

Why subagents are useful:

Why a single main thread alone is not enough:

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner / Engineering Baseline Agent / Spec Agent / Builder / Reviewer / Repair / Reporter | READ_ONLY / READ_ONLY_DRAFT / WRITER / WRITER_LIMITED | PLANNED / RUNNING / CLOSED / SKIPPED | none | output handed off to main thread |  |

## Writer Control

Many readers, one writer: Yes

Current writer:

Single active writer: Yes / No

Disjoint write ownership used: No

If disjoint write ownership is used, human-approved exception:

| Agent ID | Path Scope | Reason | Owner | Expiry |
|---|---|---|---|---|
|  |  |  |  |  |

## Lifecycle Closure

All subagents closed: No

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes / No

Closure notes:

## Dispatch Hygiene

Before dispatch checked: Yes / No

Idle subagents recovered: Yes / No / N/A

Completed subagents closed: Yes / No / N/A

Unused planned subagents skipped: Yes / No / N/A

Stale task subagents closed or skipped: Yes / No / N/A

Task drift checked: Yes / No

Active writer count: 0 / 1 / >1

Dispatch allowed: Yes / No

Dispatch block reason:

Recovery notes:

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
|  |  | Review Loop / Decision Brief / Follow-up Proposal / Final Report / Human Decisions Needed / no action | Open / Closed |

## Human Decisions Needed

| Decision | Reason | Owner | Needed Before | Status |
|---|---|---|---|---|
|  |  | human | next writer action / final response | Pending / Not needed |

## Next Safe Step

Next action:

## Technical Details

Commands run:

```text

```

Related files:

- 

## Audit Notes

- Subagent output is input, not authority.
- Main thread remains responsible for all writes and final reporting.
- All subagents must be closed or skipped before final task response.
