---
schema_version: 1.0
artifact_type: subagent-run-plan
number: "040"
slug: fixture-matrix-expansion
title: Fixture Matrix Expansion
status: ready
created_at: "2026-06-26"
devkit_version: 0.40.0
subagent_mode: REVIEW_LOOP
---
# Subagent Run Plan: Fixture Matrix Expansion

## Human Summary

Use bounded helper roles to plan fixture coverage, implement runner plumbing, review behavior drift, and report closure.

## Goal

Goal: Expand fixture matrix coverage without changing production checker behavior.

Related Goal Card: `goal-cards/040-fixture-matrix-expansion.md`

Related Task: `tasks/040-fixture-matrix-expansion.md`

Non-goals: checker library refactor, dependency addition, source-code scanning.

## Orchestration Mode

Selected: REVIEW_LOOP

Why subagents are useful: fixture expansion benefits from separate coverage planning and read-only review.

Why a single main thread alone is not enough: independent review reduces the risk of changing checker semantics while adding fixtures.

## Role Roster

| Agent ID | Role | Authority | Status | Write Scope | Close Condition | Closure Evidence |
|---|---|---|---|---|---|---|
| A1 | Goal Planner | READ_ONLY | CLOSED | none | Route selected | `goal-cards/040-fixture-matrix-expansion.md` |
| A2 | Fixture Agent | WRITER_LIMITED | CLOSED | `test-fixtures/`, `scripts/check-fixtures.mjs` | fixture suite passes | `final-reports/040-fixture-matrix-expansion.md` |
| A3 | Manifest Agent | WRITER_LIMITED | CLOSED | `dev-kit-manifest.json`, version metadata | manifest check passes | `releases/0.40.0/phase-report.md` |
| A4 | Reviewer | READ_ONLY | CLOSED | none | findings recorded | `review-loop-reports/040-fixture-matrix-expansion.md` |
| A5 | Reporter | READ_ONLY_DRAFT | CLOSED | reports and release evidence | final report complete | `final-reports/040-fixture-matrix-expansion.md` |

## Writer Control

Many readers, one writer: Yes

Current writer: main thread

Single active writer: Yes

Disjoint write ownership used: No

## Lifecycle Closure

All subagents closed: Yes

Closure required before final response: Yes

No background or standing agents: Yes

No subagent left occupying a slot after handoff: Yes

Closure notes: No helper role remains running after handoff.

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

- Use helper roles to inspect fixture coverage and review outputs.
- Keep all writes inside approved 0.40 fixture, runner, manifest, version, and evidence scope.
- Run local checks only.

## Forbidden Actions

- Do not leave subagents running after their work is handed off.
- Do not leave `RUNNING` agents in a committed run plan.
- Do not keep standby subagents open for future work.
- Do not run multiple active writers on the same files.
- Do not let reviewer agents edit files.
- Do not let repair agents handle `NEEDS_HUMAN_DECISION`.
- Do not bypass Goal Mode, task cards, Engineering Baseline, Review Loop, Risk Gate, Human Approval, or Approval scope.
- Do not create persistent monitors.
- Do not create automations.
- Do not create external GPT/API reviewer calls from this run plan.

## Handoff / Findings

| Agent ID | Output | Routed To | Status |
|---|---|---|---|
| A1 | phase route | task artifacts | Closed |
| A2 | fixture matrix updates | review loop | Closed |
| A3 | manifest/version updates | verification | Closed |
| A4 | read-only review | review loop report | Closed |

## Human Decisions Needed

| Decision | Reason | Owner | Needed Before | Status |
|---|---|---|---|---|
| Start `0.40.1` checker refactor | separate roadmap phase | human | next phase | Pending |

## Next Safe Step

Run `node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/040-fixture-matrix-expansion.md`.

## Technical Details

Commands run:

```text
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/040-fixture-matrix-expansion.md
```

Related files:

- `test-fixtures/fixture-cases.json`
- `scripts/check-fixtures.mjs`

## Audit Notes

- Subagent output is input, not authority.
- All subagents are closed or skipped before final task response.
