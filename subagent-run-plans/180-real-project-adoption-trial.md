# Subagent Run Plan: 1.8 Real Project Read-only Adoption Trial

## Human Summary

Use subagents only as bounded reviewers. The main thread remains the only writer and no target project write is allowed.

## Goal

Goal: use subagents as bounded readers/reviewers for 1.8 Real Project Read-only Adoption Trial.

Related Goal Card: `goal-cards/180-real-project-adoption-trial.md`

Related Task: `tasks/180-real-project-adoption-trial.md`

Non-goals: subagents do not write files, approve risk, approve release, or apply changes to target projects.

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

Why subagents are useful: independent review helps catch overclaim, target-write leakage, and patch-classification overreach.

Why a single main thread alone is not enough: real-project adoption has privacy and scope risks that benefit from a separate reviewer pass.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| 1.8-planning-reviewer | planning reviewer | READ_ONLY | SKIPPED | none | plan already reviewed by attached external review | external review consumed |
| 1.8-final-reviewer | final reviewer | READ_ONLY | SKIPPED | none | local full-check review used instead of live subagent | check results recorded in review loop |

## Writer Control

Many readers, one writer: Yes

Current writer: main thread

Single active writer: Yes

Disjoint write ownership used: No

If disjoint write ownership is used, human-approved exception:

| Agent ID | Path Scope | Reason | Owner | Expiry |
|---|---|---|---|---|
| Not applicable | Not applicable | Not applicable | human | Not applicable |

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure notes: no live subagent remained open; skipped reviewers are explicitly recorded.

## Allowed Actions

- Open only the subagents listed in the Role Roster if needed.
- Keep reviewer, planner, and baseline agents read-only.
- Allow only the current writer to modify approved dev-kit source paths.
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
| 1.8-planning-reviewer | confirm 1.8 should be read-only real-project adoption plus patch classification, with public evidence sanitized | implementation plan | Skipped live run; external review consumed |
| 1.8-final-reviewer | local full-check review is used for final verification | review loop | Skipped live run |

## Human Decisions Needed

| Decision | Reason | Owner | Needed Before | Status |
|---|---|---|---|---|
| None for dev-kit source update | repository change already scoped | human | final response | Not needed |
| Target project write approval | any future bridge application to a real project | human | before target write | Deferred |

## Next Safe Step

Next action: rerun targeted governance checks and final self-check.

## Technical Details

Commands run:

```text
node scripts/check-dev-kit.mjs
```

Related files:

- `review-loop-reports/180-real-project-adoption-trial.md`
- `final-reports/180-real-project-adoption-trial.md`

## Audit Notes

- Subagent output is input, not authority.
- Main thread remains responsible for all writes and final reporting.
- All subagents must be closed or skipped before final task response.
