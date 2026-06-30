# Execution Review Closure

## Purpose

Execution Review Closure defines what Codex must report after it finishes a task or change.

It prevents "done" claims that skip scope review, verification evidence, debt, changed-file boundaries, or commit readiness.

## Product Rule

Codex must close execution before claiming a task is ready to hand off.

The user should not need to ask for a technical postmortem. Codex should produce or summarize an Execution Closure Report when work has been performed, when the worktree is dirty, or when the user asks to commit, push, finish, close, or review the result.

## Execution Closure Report

An Execution Closure Report is post-execution review only.

It does not:

- approve implementation
- approve release or production
- approve security, privacy, compliance, payment, migration, or data decisions
- authorize commit or push
- change task state
- forgive debt
- replace Review Loop
- replace Safe Launch

Boundary lines must include:

- This closure writes target files: No
- This closure approves implementation: No
- This closure approves release or production: No
- This closure changes task state: No
- This closure forgives debt: No
- This closure replaces Review Loop: No
- This closure replaces Safe Launch: No
- This closure authorizes commit or push: No
- This closure approves security/privacy/compliance/payment/migration decisions: No

## Closure States

| State | Meaning |
|---|---|
| `NOT_READY_TO_CLOSE` | Work exists but verification, scope, or evidence is incomplete. |
| `CLOSE_WITH_LIMITATIONS` | Work can be summarized, but explicit limitations remain. |
| `READY_FOR_COMMIT_REVIEW` | The changed scope and verification evidence are clear enough to prepare a commit review. |
| `NEEDS_HUMAN_DECISION` | Risk, scope, verification, debt, or release impact requires a human decision. |
| `BLOCKED` | Closure cannot be trusted because the project or evidence cannot be read. |

`READY_FOR_COMMIT_REVIEW` does not authorize commit or push. It only means Codex may prepare a commit summary for human review if the current task already permits it.

## Required Closure Areas

Every Execution Closure Report must include:

- evidence links
- change summary
- review surface closure
- verification closure
- scope boundary closure
- debt closure
- commit readiness
- human decisions
- explicit boundaries

Every report must name all unverified items.

## Evidence-Linked Closure

Execution Closure is evidence-linked.

Changed files prove that work happened. They do not prove that functionality works, code was reviewed, or selected review surfaces are closed.

Codex must not mark `FUNCTIONAL_REVIEW` or `CODE_REVIEW` as `pass` only because changed files exist.

Evidence links may include:

- Review Surface Card: defines which review surfaces must close
- Review Loop / reviewer evidence: can close functional, code, UX, data, permission, and other selected review surfaces
- Change Boundary Report: can close scope boundary
- Verification note or verification file: can close verification review
- Debt & Knowledge Handoff: can close debt review when non-blocking
- Delivery Path Report: can carry delivery state, but does not replace Safe Launch

`READY_FOR_COMMIT_REVIEW` requires:

- changed scope exists or the task/change is explicitly provided
- verification status is `pass`
- selected review surfaces are closed with evidence
- functional/code pass is backed by review-loop or reviewer evidence, not changed files alone
- changed files are inside a passing change boundary when files changed
- debt is non-blocking or explicitly handed off
- no high-risk decision is implicitly approved

## Relationship To Other Workflow Layers

Execution Review Closure consumes or references:

- Review Surface Governance
- Delivery Path Governance
- Debt & Knowledge Handoff
- Change Boundary
- Claim Control
- Review Loop

It does not replace those layers. It is the final task-level summary that says which evidence exists, what remains open, and whether the result can be handed to commit review.

## Stop Conditions

Codex must stop for human decision when:

- high-risk surfaces were touched without explicit verification evidence
- changed files exceed the approved task boundary
- verification failed or was not run for a high-risk task
- debt blocks release review
- production, release, CI, hook, migration, payment, auth, or data impact is unclear
- the user asks to commit, push, or continue while closure is not ready
