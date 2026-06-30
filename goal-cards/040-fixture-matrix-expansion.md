---
schema_version: 1.0
artifact_type: goal-card
number: "040"
slug: fixture-matrix-expansion
title: Fixture Matrix Expansion
status: ready
created_at: "2026-06-26"
devkit_version: 0.40.0
goal_mode: IMPLEMENT_TASK
task_level: L2
---
# Goal Card: Fixture Matrix Expansion

## Human Summary

Route `0.40.0` as a bounded implementation phase for fixture coverage, not checker refactoring.

## Goal

Goal: Expand fixture matrix coverage before checker internals are refactored.

Source: `docs/plans/productization-hardcut-1.0-plan.md`

Non-goals: checker library refactor, source-code scanning, dependency additions, generated project snapshots.

## Goal Mode

Selected: IMPLEMENT_TASK

Why: The phase has an approved roadmap entry and needs concrete file changes plus verification.

## Project State

Project state: dev-kit repository

Workflow state: productization hardcut active

Adoption mode: repository maintenance

Current `workflow-next` result:

```text
NEXT_ACTION: execute phase 0.40.0
CAN_WRITE_WORKFLOW_ASSETS: yes_with_task
MUST_STOP_FOR_HUMAN: no
```

## Risk And Level

Task level: L2

Baseline level: not selected

Risk reason: fixture runner and source inventory change, but no production checker semantics should change.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: No

If yes, related decision area:

- none

Engineering baseline status: not applicable for fixture matrix expansion

Decision Brief needed: Yes

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | Yes | `requests/040-fixture-matrix-expansion.md` | phase intent |
| Preflight | Yes | `preflight/040-fixture-matrix-expansion.md` | scope validation |
| Spec | Yes | `specs/040-fixture-matrix-expansion.md` | implementation contract |
| Eval | Yes | `evals/040-fixture-matrix-expansion.md` | acceptance checks |
| Task | Yes | `tasks/040-fixture-matrix-expansion.md` | execution boundary |
| Review Packet | Yes | `review-packets/040-fixture-matrix-expansion.md` | review input |
| Review Loop Report | Yes | `review-loop-reports/040-fixture-matrix-expansion.md` | review closure |
| Decision Brief | Yes | `decision-briefs/040-fixture-matrix-expansion.md` | boundary record |
| Final Report / Handoff | Yes | `final-reports/040-fixture-matrix-expansion.md` | closure evidence |

## Allowed Actions

- Update fixture files and fixture runner plumbing.
- Run local non-destructive checks.
- Update manifest/source inventory and version metadata.

## Forbidden Actions

- Do not treat this Goal Card as approval to refactor checkers.
- Do not change checker semantics to satisfy fixtures.
- Do not create persistent monitors or automations.
- Do not add dependencies.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Start checker library refactor | human | `0.40.1` | Deferred |

## Next Safe Step

Run `node scripts/check-fixtures.mjs` and complete review evidence.

## Technical Details

Related files:

- `test-fixtures/fixture-cases.json`
- `scripts/check-fixtures.mjs`

Commands run:

```text
node scripts/check-goal-mode.mjs . --goal-card goal-cards/040-fixture-matrix-expansion.md
```

## Audit Notes

- Goal Card is routing evidence, not release approval.
- Subagent orchestration is tracked separately.
