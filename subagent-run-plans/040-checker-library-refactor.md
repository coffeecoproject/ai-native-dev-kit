---
schema_version: 1.0
artifact_type: subagent-run-plan
number: "040"
slug: checker-library-refactor
title: Checker Library Refactor
status: ready
created_at: "2026-06-27"
devkit_version: 0.40.1
subagent_mode: REVIEW_LOOP
---
# Subagent Run Plan: Checker Library Refactor

## Human Summary

Use a bounded review-loop pattern for 0.40.1; no helper agent may remain open after handoff.

## Goal

Goal: Refactor shared checker plumbing without changing checker behavior.

Related Goal Card: `goal-cards/040-checker-library-refactor.md`

Related Task: `tasks/040-checker-library-refactor.md`

Non-goals: subagents do not approve behavior drift, dependencies, releases, risk acceptance, or hidden background execution.

## Orchestration Mode

Selected: REVIEW_LOOP

Why subagents are useful: this phase benefits from a separate read-only review perspective on behavior drift and helper boundaries.

Why a single main thread alone is enough for writes: the code changes are tightly scoped and the main thread remains the only writer.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | route selected | `goal-cards/040-checker-library-refactor.md` |
| A2 | Refactor Implementer | WRITER_LIMITED | CLOSED | `scripts/`, manifest, version, docs, phase artifacts | implementation and checks complete | main thread owns writes |
| A3 | Reviewer | READ_ONLY | CLOSED | none | behavior-drift review recorded | `review-loop-reports/040-checker-library-refactor.md` |
| A4 | Reporter | READ_ONLY_DRAFT | CLOSED | final report and release evidence | closure evidence written | `final-reports/040-checker-library-refactor.md` |

## Writer Control

Many readers, one writer: Yes

Current writer: main thread

Single active writer: Yes

Disjoint write ownership used: No

Human-approved owner / expiry if disjoint ownership is used: Not applicable

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure notes: No external helper process is kept open. Review-loop roles are recorded as closed once their findings are consumed.

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

- Use read-only review to inspect behavior drift, helper abstraction boundaries, and phase evidence.
- Keep the main thread as the only writer.
- Close or skip every helper role after handoff.
- Run `node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/040-checker-library-refactor.md` before commit.

## Forbidden Actions

- Do not leave subagents running after handoff.
- Do not send a final response while RUNNING agents exist.
- Do not keep standby subagents open.
- Do not run multiple active writers.
- Do not let reviewer agents edit files.
- Do not use subagents to resolve NEEDS_HUMAN_DECISION items.
- Do not create persistent monitors, automations, hooks, or external GPT/API reviewer calls from this plan.

## Handoff / Findings

| Agent ID | Handoff Summary | Findings / Output Ref | Main Thread Decision |
|---|---|---|---|
| A1 | Phase routed to IMPLEMENT_TASK | `goal-cards/040-checker-library-refactor.md` | proceed |
| A2 | Main thread performs bounded refactor | `tasks/040-checker-library-refactor.md` | proceed |
| A3 | Read-only review recorded after checks | `review-loop-reports/040-checker-library-refactor.md` | consume findings |
| A4 | Closure evidence recorded | `final-reports/040-checker-library-refactor.md` | report result |

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Approve checker semantic behavior drift | human | before changing fixture expectations for new behavior | Not needed |
| Approve any dependency addition | human | before changing dependencies | Not needed |

## Next Safe Step

Implement shared helper libraries, migrate covered checker scripts, then close the review loop with verification evidence.

## Technical Details

Related files:

- `scripts/lib/`
- `scripts/check-fixtures.mjs`
- `review-loop-reports/040-checker-library-refactor.md`

Commands run:

```text
node scripts/new-workflow-item.mjs --type subagent-run-plan --number 040 --name checker-library-refactor --subagent-mode REVIEW_LOOP
```

## Audit Notes

- Subagent output is input, not authority.
- Main thread remains responsible for all writes and final reporting.
- All subagents are closed or skipped before final task response.
