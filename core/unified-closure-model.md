# Unified Closure Model

The Unified Closure Model defines the single final close-out decision for one task.

It exists because several lower-level artifacts can describe close-out from different angles:

- Change Impact Coverage: which surfaces were affected and checked.
- Execution Closure: whether the execution run has verification, debt, and review evidence.
- Guided Closure: how to explain close-out status to a non-technical user.
- Evidence Precision: whether cited evidence belongs to the current task.

These artifacts are inputs. They are not competing sources of final truth.

## Closure Decision

Every task close-out should reduce to one of these decisions:

- `DONE`: the task can be treated as complete for the current workflow scope.
- `NOT_DONE`: the task has not reached completion.
- `NEEDS_EVIDENCE`: the task might be complete, but required evidence is missing or weak.
- `NEEDS_IMPACT_COVERAGE`: related surfaces have not been checked.
- `NEEDS_HUMAN_DECISION`: a human decision is required before close-out can continue.
- `BLOCKED`: closure cannot proceed until a blocking issue is fixed.

## Single Source Rule

One task must have one final closure truth.

The final closure truth is the latest applicable Unified Closure Decision for the task. Other close-out artifacts must feed into it or defer to it.

If Guided Closure, Execution Closure, and Change Impact Coverage disagree, Codex must report the disagreement and choose the stricter decision.

## Explain Trace

The final decision must be explainable.

Current Closure Decision records should include:

- Decision Trace: how each input affected the final decision.
- Dominant Reason: the one input that controls the final result.
- Conflict Summary: whether inputs disagreed and why the stricter result won.

The trace explains the decision. It does not create another final closure source.

## Input Roles

| Input | Role |
|---|---|
| Change Impact Coverage | Shows whether affected surfaces were checked. |
| Execution Closure | Shows execution evidence, verification, debt, and review readiness. |
| Guided Closure | Explains status in plain language. |
| Evidence Precision | Confirms evidence belongs to this task. |
| Human Decision | Confirms high-risk or ambiguous closure boundaries. |

## Precedence

Use the strictest applicable result:

1. `BLOCKED`
2. `NEEDS_HUMAN_DECISION`
3. `NEEDS_IMPACT_COVERAGE`
4. `NEEDS_EVIDENCE`
5. `NOT_DONE`
6. `DONE`

## Boundary

A Unified Closure Decision does not:

- write target files
- authorize apply
- approve implementation
- approve commit or push
- approve release or production
- modify CI or hooks
- replace Review Loop
- replace Safe Launch
- approve security, privacy, compliance, payment, migration, or production decisions
