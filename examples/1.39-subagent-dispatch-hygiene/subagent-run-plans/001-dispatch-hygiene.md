# Subagent Run Plan: dispatch hygiene

## Human Summary

One-sentence conclusion:

Helpers were recovered before dispatch, no stale task helper remains, and a new read-only reviewer can be used safely.

## Goal

Goal: demonstrate recover-before-dispatch hygiene before a review helper is used.

Related Goal Card: `goal-cards/001-dispatch-hygiene.md`

Related Task: `tasks/001-dispatch-hygiene.md`

Non-goals: no real subagent scheduler, no external GPT/API review, no target-project write approval.

## Orchestration Mode

Selected: REVIEW_LOOP

Why subagents are useful: a read-only reviewer can inspect closure evidence independently.

Why a single main thread alone is not enough: independent read-only review reduces closure risk.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | route summary handed off to main thread | Handoff recorded in this plan |
| A2 | Builder | WRITER | CLOSED | tasks/001-dispatch-hygiene.md scope only | verification passed and output handed off | Verification recorded in final report |
| A3 | Reviewer | READ_ONLY | SKIPPED | none | not needed after main-thread review | Skipped after task drift check |

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

Closure notes: Completed helpers are closed, unused helper is skipped, and no helper remains open as standby.

## Dispatch Hygiene

Before dispatch checked: Yes

Idle subagents recovered: Yes

Completed subagents closed: Yes

Unused planned subagents skipped: Yes

Stale task subagents closed or skipped: Yes

Task drift checked: Yes

Active writer count: 0

Dispatch allowed: Yes

Dispatch block reason: N/A

Recovery notes: Main thread confirmed no stale helper remains before any further review helper could be opened.

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
| A3 | Not needed | no action | Closed |

## Human Decisions Needed

| Decision | Reason | Owner | Needed Before | Status |
|---|---|---|---|---|
| none | no human decision remained | human | final response | Not needed |

## Next Safe Step

Next action: main thread can proceed without opening another helper, or create a new run plan if the task changes.

## Technical Details

Commands run:

```text
node scripts/check-subagent-orchestration.mjs examples/1.39-subagent-dispatch-hygiene
```

Related files:

- `core/subagent-orchestration.md`
- `core/subagent-dispatch-hygiene.md`

## Audit Notes

- Subagent output is input, not authority.
- Main thread remains responsible for all writes and final reporting.
- All subagents must be closed or skipped before final task response.
- Recover before dispatch is required before another helper is opened.
