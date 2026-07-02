# Release Execution Review

Use this checklist before accepting a Release Execution Plan.

## Required

- Launch Review View is referenced.
- Human Release Approval is referenced for any real release execution mode.
- Release owner is explicit.
- Release SOP or project release procedure is explicit.
- Rollback, monitoring, and post-launch smoke evidence are explicit.
- Execution mode is one of `PLAN_ONLY`, `HUMAN_EXECUTION_HANDOFF`, `ASSISTED_EXECUTION`, or `BLOCKED`.
- High-risk production steps are `HUMAN_REQUIRED`, `EXTERNAL_RELEASE_SYSTEM`, or `STOP_FOR_HUMAN`.
- Evidence capture lists launch review, approval, verification, release handoff, monitoring, smoke, and rollback evidence.
- Boundaries all remain `No`.

## Must Reject

- A plan that treats Launch Review View as release approval.
- `ASSISTED_EXECUTION` without explicit human release approval.
- Any production deploy, app submission, mini-program publish, migration, secrets, DNS, payment, permissions, or production config step assigned to Codex auto execution.
- Any claim that IntentOS, Codex, or this plan approved production release.
- Any plan that makes Codex the release owner.
