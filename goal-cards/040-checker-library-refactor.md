---
schema_version: 1.0
artifact_type: goal-card
number: "040"
slug: checker-library-refactor
title: Checker Library Refactor
status: ready
created_at: "2026-06-27"
intentos_version: 0.40.1
goal_mode: IMPLEMENT_TASK
task_level: L2
---
# Goal Card: Checker Library Refactor

## Human Summary

Route `0.40.1` as a bounded implementation phase for internal checker refactoring after fixture coverage is in place.

## Goal

Goal: Extract shared checker utility libraries while preserving existing checker behavior.

Source: `docs/plans/productization-hardcut-1.0-plan.md`

Non-goals: new workflow concepts, checker semantic changes, dependency additions, migration command implementation, generated project snapshots.

## Goal Mode

Selected: IMPLEMENT_TASK

Why: The roadmap entry is approved, the user asked to start, and the phase requires concrete source changes plus verification.

## Project State

Project state: intentos repository

Workflow state: productization hardcut active

Adoption mode: repository maintenance

Current `workflow-next` result:

```text
NEXT_ACTION: execute phase 0.40.1
CAN_WRITE_WORKFLOW_ASSETS: yes_with_task
MUST_STOP_FOR_HUMAN: no
```

## Risk And Level

Task level: L2

Baseline level: not selected

Risk reason: shared checker helpers touch many scripts, but the work is internal and protected by the 0.40.0 fixture matrix.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: No

If yes, related decision area:

- none

Engineering baseline status: not applicable for internal intentos checker refactor

Decision Brief needed: Yes, as boundary evidence that this phase is not a semantic checker change.

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | Yes | `requests/040-checker-library-refactor.md` | phase intent |
| Preflight | Yes | `preflight/040-checker-library-refactor.md` | scope validation |
| Spec | Yes | `specs/040-checker-library-refactor.md` | helper contract |
| Eval | Yes | `evals/040-checker-library-refactor.md` | acceptance checks |
| Task | Yes | `tasks/040-checker-library-refactor.md` | execution boundary |
| Review Packet | Yes | `review-packets/040-checker-library-refactor.md` | behavior-drift review input |
| Review Loop Report | Yes | `review-loop-reports/040-checker-library-refactor.md` | review closure |
| Decision Brief | Yes | `decision-briefs/040-checker-library-refactor.md` | boundary record |
| Final Report / Handoff | Yes | `final-reports/040-checker-library-refactor.md` | closure evidence |

## Allowed Actions

- Update shared script helpers and covered checker scripts.
- Update manifest, version, README notes, and release evidence.
- Run local non-destructive checks.
- Record review loop findings and bounded next-step suggestions.

## Forbidden Actions

- Do not treat this Goal Card as approval for checker semantic changes.
- Do not bypass request, preflight, spec, eval, task, Review Loop, Risk Gate, Human Approval, or Approval scope.
- Do not add dependencies, create migration command behavior, change production config, change baseline policy, or commit generated project snapshots.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Permit checker semantic behavior drift | human | before any fixture expectation change | Not needed |
| Approve dependency addition | human | before package changes beyond version | Not needed |

## Next Safe Step

Implement shared helper libraries and migrate covered checker scripts in small steps, then run fixture and intentos checks.

## Technical Details

Related files:

- `scripts/lib/`
- `scripts/check-*.mjs`
- `scripts/workflow-next.mjs`
- `scripts/score-output-quality.mjs`

Commands run:

```text
node scripts/new-workflow-item.mjs --type goal-card --number 040 --name checker-library-refactor --goal-mode IMPLEMENT_TASK
```

## Audit Notes

- Goal Card is routing evidence, not release approval.
- Subagent orchestration is tracked separately.
