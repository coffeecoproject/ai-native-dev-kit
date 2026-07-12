# Release Execution Protocol

Release Execution Protocol answers one user question:

```text
If launch review is ready and the current user consented to the exact external effect, what should happen next?
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
  -> structured current-user Release Approval Record
  -> Release Execution Plan
  -> Controlled Codex Execution / Existing-System Handoff
  -> Release Evidence
  -> Post-launch Close-out
```

Release Execution depends on the exact structured Release Approval
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
| `HUMAN_EXECUTION_HANDOFF` | Existing release system executes; Codex prepares the handoff and evidence checklist. |
| `ASSISTED_EXECUTION` | Codex may execute only approved local verification, build, packaging, evidence, and read-only smoke actions. The current user or existing release system performs the prepared external effect. |
| `BLOCKED` | Required launch review, consent, rollback, monitoring, SOP, or smoke evidence is missing. |

## Required Gates

Real release execution readiness requires:

- current project and Git identity
- exact release candidate, target, source revision, and package identity
- strict Release Evidence Gate: ready
- strict Runtime Hygiene: `RELEASE_PREFLIGHT_READY`
- strict Release Channel Policy: source-bound
- strict Platform Recipe and Release Handoff Pack when required
- Release Approval Record: current `APPROVED`, with `CURRENT_CONVERSATION_USER` or another specific confirmer
- exact consent confirmer reference (legacy schemas may call this `release_owner_ref`)
- release SOP / project release procedure
- rollback path
- monitoring / observation path
- post-launch smoke path
- platform-specific release constraints

## Step Ownership

| Step Type | Default Executor |
|---|---|
| verification / build / static checks | `CODEX_MAY_RUN_AFTER_APPROVAL` only when project policy allows |
| production deployment / publication / submission | `CODEX_MAY_RUN_AFTER_APPROVAL` only for the exact approved effect under the project SOP; otherwise `EXTERNAL_RELEASE_SYSTEM` |
| database migration / secrets / DNS / payment / permissions / production config | `CODEX_MAY_RUN_AFTER_APPROVAL` only with exact scoped consent, verified rollback, and project policy; otherwise blocked |
| post-launch smoke observation | `CODEX_MAY_RUN_AFTER_APPROVAL` only when read-only or project policy allows |
| rollback execution | `CODEX_MAY_RUN_AFTER_APPROVAL` when the approved project SOP defines it; otherwise existing release system |

## Boundaries

Release Execution Protocol does not:

- approve release or production
- deploy, publish, submit, migrate, or release from technical readiness alone
- change CI/CD, hooks, production config, secrets, DNS, payment, permissions, app-store setup, mini-program setup, or database migrations
- replace Launch Review View, Unified Closure, Safe Launch, release SOPs, rollback evidence, or incident controls
- treat internal responsibility labels as additional people the solo user must find
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

Current-user consent to one concrete real-world effect opens the matching Release Execution workflow.

It does not automatically authorize every release action.

Release handoff readiness is not release approval.
