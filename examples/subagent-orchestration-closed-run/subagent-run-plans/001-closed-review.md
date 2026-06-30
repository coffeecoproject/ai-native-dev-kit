# Subagent Run Plan: closed review

## Human Summary

One-sentence conclusion:

Two read-only helpers and one builder were used, all outputs were handed off, and every subagent is closed.

## Goal

Goal: demonstrate closed helper-agent lifecycle.

Related Goal Card: `goal-cards/001-closed-review.md`

Related Task: `tasks/001-closed-review.md`

Non-goals: no persistent agents, no automation, no external GPT/API review.

## Orchestration Mode

Selected: PLAN_THEN_BUILD

Why subagents are useful: planning and review are separated from the writer.

Why a single main thread alone is not enough: independent read-only review reduces task closure risk.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | route summary handed off to main thread | Handoff recorded in this plan |
| A2 | Builder | WRITER | CLOSED | tasks/001-closed-review.md scope only | verification passed and final report drafted | Verification recorded in final report |
| A3 | Reviewer | READ_ONLY | CLOSED | none | findings handed off to Review Loop | Review summary recorded |

## Writer Control

Many readers, one writer: Yes

Current writer: none

Single active writer: Yes

Disjoint write ownership used: No

If disjoint write ownership is used, human-approved exception:

| Agent ID | Path Scope | Reason | Owner | Expiry |
|---|---|---|---|---|
| none | none | not used | human | not used |

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure notes: All helper outputs were consumed by the main thread and the helpers were closed.

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

Recovery notes: All helpers were closed before the final response and no stale helper remains for a future dispatch.

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
| A1 | Route summary | no action | Closed |
| A2 | Task changes and verification | Final Report | Closed |
| A3 | Read-only findings | Review Loop | Closed |

## Human Decisions Needed

| Decision | Reason | Owner | Needed Before | Status |
|---|---|---|---|---|
| none | no human decision remained | human | final response | Not needed |

## Next Safe Step

Next action: main thread can send final response with subagent closure summary.

## Technical Details

Commands run:

```text
node scripts/check-subagent-orchestration.mjs examples/subagent-orchestration-closed-run
```

Related files:

- `core/subagent-orchestration.md`

## Audit Notes

- Subagent output is input, not authority.
- Main thread remains responsible for all writes and final reporting.
- All subagents must be closed or skipped before final task response.
