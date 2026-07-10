# Release Execution Protocol

Release Execution Protocol answers one user question:

```text
If launch review is ready and a human approved release, what should happen next?
```

It creates a bounded release execution plan. It does not execute release by itself.

## Position

```text
Unified Closure Decision
  -> Launch Review View
  -> Release Evidence Gate
  -> Runtime Hygiene
  -> Release Channel Policy
  -> strict Platform Recipe / Handoff when required
  -> structured human Release Approval Record
  -> Release Execution Plan
  -> Controlled Execution / Human Handoff
  -> Release Evidence
  -> Post-launch Close-out
```

Release Execution depends on the exact structured Human Release Approval
Record. The record binds the current project and Git revision to one release
candidate, target, package identity, and strict upstream evidence set.

From 1.61 onward, Release Execution also consumes Release Handoff Pack facts when a handoff pack exists.

```text
Release Handoff Pack = owner / approval / rollback / monitoring / smoke / boundary truth
Release Execution Plan = plan-only consumer of that truth
```

Release Execution must not redefine release owner, rollback, monitoring, post-release smoke, or high-risk executor ownership when a handoff pack exists.

If Launch Review View is not `READY_FOR_RELEASE_REVIEW`, real release execution is blocked.

If the matching structured approval is missing, expired, copied, stale, or
invalidated, Release Execution may produce a blocked plan, but real release
execution is not allowed. Ordinary prose and command-line status flags are not
approval authority.

## Modes

| Mode | Meaning |
|---|---|
| `PLAN_ONLY` | Create a plan and evidence checklist only. |
| `HUMAN_EXECUTION_HANDOFF` | Human or existing release system executes; Codex prepares the handoff and evidence checklist. |
| `ASSISTED_EXECUTION` | Codex may assist with explicitly allowed low-risk commands after approval. |
| `BLOCKED` | Required launch review, approval, owner, rollback, monitoring, SOP, or smoke evidence is missing. |

## Required Gates

Real release execution readiness requires:

- current project and Git identity
- exact release candidate, target, source revision, and package identity
- strict Release Evidence Gate: ready
- strict Runtime Hygiene: `RELEASE_PREFLIGHT_READY`
- strict Release Channel Policy: source-bound
- strict Platform Recipe and Release Handoff Pack when required
- human Release Approval Record: current `APPROVED`
- release owner
- release SOP / project release procedure
- rollback path
- monitoring / observation path
- post-launch smoke path
- platform-specific release constraints

## Step Ownership

| Step Type | Default Executor |
|---|---|
| verification / build / static checks | `CODEX_MAY_RUN_AFTER_APPROVAL` only when project policy allows |
| production deployment / publication / submission | `HUMAN_REQUIRED` or `EXTERNAL_RELEASE_SYSTEM` |
| database migration / secrets / DNS / payment / permissions / production config | `STOP_FOR_HUMAN` |
| post-launch smoke observation | `CODEX_MAY_RUN_AFTER_APPROVAL` only when read-only or project policy allows |
| rollback execution | `HUMAN_REQUIRED` unless project SOP explicitly allows automation |

## Boundaries

Release Execution Protocol does not:

- approve release or production
- deploy, publish, submit, migrate, or release by itself
- change CI/CD, hooks, production config, secrets, DNS, payment, permissions, app-store setup, mini-program setup, or database migrations
- replace Launch Review View, Unified Closure, Safe Launch, release SOPs, release owners, rollback owners, or incident owners
- make Codex the release owner
- treat user confirmation as blanket approval for all production actions

## Required Output

A Release Execution Plan must show:

- exact release trust inputs and their explanation trace
- structured human Release Approval Record
- execution mode
- release owner and SOP
- execution steps and executor
- stop conditions
- evidence capture
- post-launch close-out
- boundaries
- outcome

## Principle

User approval opens the Release Execution workflow.

It does not automatically authorize every release action.

Release handoff readiness is not release approval.
