# Natural Language Workflow Orchestrator

## Purpose

Natural Language Workflow Orchestrator is the plain-language front door for AI Native Dev Kit.

It does not add a new governance layer. It routes a user's natural-language goal to existing workflow capabilities and returns one human-readable Workflow Guidance Card.

## Product Rule

Users should not need to choose commands or know internal workflow names.

The user can say:

- I want to build an appointment app.
- Please read this existing project first and do not change files.
- Pause this task and help me handle another issue.
- I want this project to become usable by real people.

Codex must translate that into the safest existing workflow path.

## Default User Mode

Default output mode is `plain`.

Allowed modes:

- `plain`: user-facing, non-specialist, no internal jargon.
- `developer`: short technical detail is allowed after the recommendation.
- `maintainer`: commands, checkers, and file paths are allowed.

Plain mode must avoid these terms in user-facing sections:

- `BL2`
- `industrial overlay`
- `workflow-map`
- `hook orchestration`
- `source of truth`
- `dirty worktree`
- `adapter`

Plain replacements:

| Internal term | Plain wording |
|---|---|
| BL2 | high-risk candidate path |
| industrial overlay | extra high-risk protection |
| workflow-map | read the project's existing rules first |
| hook orchestration | automatic trigger risk review |
| source of truth | which document should be trusted |
| dirty worktree | project has unfinished changes |
| adapter | connect to the existing process without replacing it |
| release readiness | whether the project can enter launch review |

## Delivery Path State

Every Workflow Guidance Card must include one Delivery Path State:

- `IDEA_ONLY`
- `NEEDS_PROJECT_READING`
- `READY_FOR_PLAN`
- `READY_FOR_LOCAL_BUILD`
- `READY_FOR_SELF_TEST`
- `READY_FOR_INTERNAL_TRIAL`
- `READY_FOR_RELEASE_REVIEW`
- `BLOCKED_BY_RISK`
- `BLOCKED_BY_DIRTY_WORK`
- `BLOCKED_BY_MISSING_DECISION`

These states do not approve production launch.

## Routing Rules

Codex should choose existing capabilities internally:

| Situation | Internal capability | Plain user meaning |
|---|---|---|
| New project | baseline decision and standard baseline recommendation | Start small with basic rules |
| Existing project | workflow adoption mapping and baseline decision | Read existing rules before changing anything |
| Production-sensitive project | workflow mapping, hook plan, and launch readiness | Stay read-only and protect release/CI/production |
| Existing unfinished changes | work queue and workflow mapping | Do not mix tasks until current changes are understood |
| Conflicting documents | document lifecycle | Mark stale or duplicate docs without deleting them |
| Hook/CI automation | hook plan | Review automatic trigger risk without installing anything |
| Interrupted work | work queue | Pause, park, or resume work with review |
| Near delivery | launch readiness | Check if it can be self-tested, trialed, or reviewed for launch |

## Question Limit

Codex may ask at most 3 questions by default.

Codex may ask at most 5 questions only when high-risk scope is detected.

Allowed question categories:

- Whether the project already has users.
- Whether the work involves login, payment, data, release, or migration.
- Whether Codex may generate a plan without changing files.
- Whether to continue, pause, or switch the current task.
- Whether the target is local run, self-test, internal trial, or launch review.

Codex must not ask users to choose internal workflow names.

## Conservative Defaults

When the user is unsure, Codex must default to:

- Treat unknown usage as if someone may already use the project.
- Do not write files; generate a plan first.
- Do not change CI.
- Do not install hooks.
- Do not delete or archive documents.
- Do not resume stale work without review.
- Do not claim production readiness.
- Treat unknown risk as needing human confirmation.

## Boundary

A Workflow Guidance Card does not:

- write target files
- modify CI
- install hooks
- delete or archive documents
- change task state
- approve implementation
- approve release or production
- approve security, privacy, compliance, payment, migration, or data decisions

## Output Contract

The card must answer:

- What did Codex understand?
- What is the current delivery state?
- What is the safest next step?
- What will Codex not do?
- What is missing before the project can be used by real people?
- What few decisions does the human need to confirm?
