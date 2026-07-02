# Guided Closure Experience

## Purpose

Guided Closure Experience is the plain-language close-out entry for IntentOS.

It answers user questions like:

- Is this task done?
- Can this be considered complete?
- Help me close this task.
- What is still missing before I submit or hand off?

It does not add new authority. It routes to existing read-only governance and returns one Guided Closure Card.

## Product Rule

Users should not need to choose between close-out commands, strict evidence flags, or internal report types.

Codex must translate a close-out request into:

1. What was checked.
2. Whether the task can be treated as done.
3. What is still missing.
4. What Codex can do next.
5. What needs human decision.

## Default User Surface

The user-facing sections must stay plain.

Do not expose these in the main user surface:

- `--require-precise-evidence`
- `--resolve-evidence-refs`
- `--strict-evidence`
- `check-change-impact-coverage`
- `check-execution-closure`
- `artifact:`
- `human-decision:`
- `Machine-Readable Evidence`

Those may appear only in Technical Details, release records, or maintainer docs.

## Closure States

Every Guided Closure Card must use one of these states:

- `NO_TASK_TO_CLOSE`
- `NEEDS_VERIFICATION`
- `NEEDS_IMPACT_COVERAGE`
- `NEEDS_HUMAN_DECISION`
- `READY_FOR_REVIEW`
- `CLOSE_WITH_LIMITATIONS`
- `BLOCKED`

None of these states approve commit, push, release, or production.

## Internal Routing

Codex may inspect these existing capabilities internally:

| Situation | Internal capability | Plain meaning |
|---|---|---|
| User asks if work is done | execution closure | Check whether work can be closed |
| Business rule or behavior changed | change impact coverage | Check related surfaces |
| Evidence references exist | precise evidence checks | Make sure evidence belongs to this task |
| Work is high-risk | review surface and human decision boundary | Ask for risk decision |
| Work is incomplete or interrupted | debt handoff and work queue | Preserve what is unfinished |
| Project is close to handoff | delivery path | Decide if it is ready for self-test, trial, or launch review |

Routing is selective. Do not run every checker just because it exists.

## Human Decision Limit

Ask at most 3 human decisions by default.

Ask up to 5 only when high-risk work is detected.

Allowed decision categories:

- confirm the intended task;
- confirm whether verification evidence is acceptable;
- decide a high-risk scope boundary;
- decide whether to close with limitations;
- decide whether Codex may prepare a plan for missing work.

## Boundary

A Guided Closure Card does not:

- write target files
- authorize apply
- approve implementation
- approve commit or push
- approve release or production
- modify CI or hooks
- change task state
- forgive debt
- replace Review Loop
- replace Safe Launch
- approve high-risk domain decisions
