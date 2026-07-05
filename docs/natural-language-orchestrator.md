# Natural Language Workflow Orchestrator

This is the user-facing front door for IntentOS.

It lets Codex receive a natural-language goal, read the project in read-only mode, and return one plain Workflow Guidance Card.

## How Users Should Ask

Use normal language:

```text
Please read this project first. Do not change files. Tell me the safest next step to make it usable by real people.
```

Other examples:

```text
I want to build an appointment app from zero.
This is an existing project. Please inspect it first and do not overwrite anything.
This task is paused. I want to switch to another issue without losing context.
The docs are confusing. Tell me which docs look current and which may be stale.
```

## What Codex Does Internally

Codex can route to existing IntentOS capabilities:

- project start / workflow-next
- baseline decision
- standard baseline recommendation
- existing workflow mapping
- document lifecycle
- work queue
- hook plan
- launch readiness

The user should not need to choose those commands.

## Deep Guide

For normal use, start with:

```bash
node scripts/cli.mjs guide ../my-project
```

When the project is unclear, old, interrupted, or close to delivery, Codex can use:

```bash
node scripts/cli.mjs guide ../my-project --deep
```

When the user has named the actual goal, pass that goal too:

```bash
node scripts/cli.mjs guide ../my-project --deep --intent "我要加支付预约"
```

Intent-aware guide uses both the project and the goal. For example:

- "我要加支付预约" raises payment, data, permission, security/privacy, and release-impact review.
- "我要清理过期文档" routes toward document lifecycle without moving or deleting files.
- "这个任务暂停一下，下次继续" routes toward work queue and debt handoff.
- "我要上线前检查" routes toward delivery path, release impact, and hook policy boundaries.
- "这个任务做完了，准备提交" routes toward execution closure without authorizing commit or push.

Deep guide still returns one card. It only reads the project, then selectively checks the relevant areas:

- project baseline direction for new projects
- existing workflow mapping for existing projects
- review surfaces
- delivery path
- work queue when task-switching or unfinished work exists
- document lifecycle when docs need review
- hook policy when CI or automatic triggers exist
- debt handoff when the intent is pause, resume, bug fix, or handoff
- execution closure when the intent is finish, close, review result, commit, or push

It should not run every resolver just because it can. The goal is a smaller, clearer next step, not more output.

## What The User Sees

The user sees a Workflow Guidance Card:

- current project state in plain language
- current delivery path state
- recommended next step
- what Codex will not do
- what is missing before the project can be used
- up to 3 questions, or up to 5 for high-risk work
- what Codex checked in deep mode, written without forcing the user to choose workflow commands

## Delivery Path State

The card must use one of these states:

| State | Meaning |
|---|---|
| `IDEA_ONLY` | There is only an idea; no project has been read yet |
| `NEEDS_PROJECT_READING` | Codex needs to inspect the project first |
| `READY_FOR_PLAN` | Codex can prepare a plan without writing files |
| `READY_FOR_LOCAL_BUILD` | Next step is to make or verify a local runnable slice |
| `READY_FOR_SELF_TEST` | Next step is owner self-test |
| `READY_FOR_INTERNAL_TRIAL` | Next step is internal trial with evidence |
| `READY_FOR_RELEASE_REVIEW` | Next step is launch review, not launch approval |
| `BLOCKED_BY_RISK` | Risk needs human confirmation |
| `BLOCKED_BY_DIRTY_WORK` | Existing unfinished changes need review |
| `BLOCKED_BY_MISSING_DECISION` | A human decision is missing |

## Output Modes

| Mode | Audience | Detail |
|---|---|---|
| `plain` | ordinary user | no internal workflow jargon |
| `developer` | developer user | short technical detail allowed |
| `maintainer` | IntentOS maintainer | commands, checkers, and file paths allowed |

Default mode is `plain`.

## Boundaries

The orchestrator is read-only by default.

It does not:

- write files
- modify CI
- install hooks
- delete or archive documents
- change task state
- approve implementation
- approve release or production
- approve high-risk domain decisions

When the user is unsure, Codex chooses the conservative path: read-only analysis and a plan.
