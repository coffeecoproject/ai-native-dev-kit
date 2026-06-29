# Delivery Path Governance

Delivery Path Governance defines how Codex reports progress from an idea or
project state toward something that can be used by real people.

It is a status and decision layer. It is not implementation approval, release
approval, production approval, or Safe Launch approval.

## Purpose

Codex must not only say what changed. Codex must also say:

- where the project is on the delivery path
- what the next safe state is
- what evidence is missing
- what blockers exist
- what the human needs to decide
- what Codex will not cross without approval

## Delivery Path States

| State | Meaning | Typical next step |
|---|---|---|
| `IDEA_ONLY` | The user has an idea, but no readable project or plan exists | clarify the first usable slice |
| `NEEDS_PROJECT_READING` | A project path or repo exists but has not been read enough | read project signals before planning |
| `READY_FOR_PLAN` | Codex can prepare a small plan | produce a scoped implementation plan |
| `READY_FOR_LOCAL_BUILD` | The project can move toward local build/run evidence | run or define local build evidence |
| `READY_FOR_SELF_TEST` | A user or Codex can perform a focused self-test | complete self-test evidence |
| `READY_FOR_INTERNAL_TRIAL` | The project may be ready for small internal trial after evidence review | prepare internal trial checklist |
| `READY_FOR_RELEASE_REVIEW` | The project may enter release readiness review | run Safe Launch / release readiness |
| `BLOCKED_BY_RISK` | Risk is unresolved | stop for human decision |
| `BLOCKED_BY_DIRTY_WORK` | Existing changes may be mixed with new work | classify current work before continuing |
| `BLOCKED_BY_MISSING_DECISION` | A required human decision is missing | ask for the smallest decision |

## Required Output

A Delivery Path Report must include:

- Human Decision Summary
- Project Reading
- Delivery Path State
- Distance To Useful Use
- State Evidence
- Blockers
- Next Safe Action
- User Decisions
- Boundaries
- Outcome

## Boundaries

Every Delivery Path Report must say:

- This report writes target files: No
- This report changes CI or hooks: No
- This report changes task state: No
- This report approves implementation: No
- This report approves release or production: No
- This report replaces Safe Launch: No
- This report proves real users can use the product: No

## Relationship To Other Protocols

Delivery Path Governance coordinates existing protocols:

- Natural Language Workflow Guidance chooses the broad safe route.
- Review Surface Governance decides what must be reviewed for a task.
- Work Queue handles interrupted or paused work.
- Document Lifecycle handles stale or conflicting documents.
- Hook Orchestration handles hook and CI automation risk.
- Safe Launch handles release readiness.

Delivery Path does not replace these protocols. It makes their current state
understandable to the human.

## Required Close-Out

After non-trivial work, Codex must report:

- current Delivery Path State
- next target state
- what was verified
- what was not verified
- whether the task is ready for self-test, internal trial, release review, or blocked
- whether debt or handoff records are needed
