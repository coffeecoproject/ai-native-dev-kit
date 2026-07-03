# Release Handoff Packs

Release Handoff Packs answer one question:

```text
Given this platform recipe and this approval, what exact steps can Codex help with, what must a human do, and what evidence must be recorded?
```

They do not answer:

```text
Codex may release this project.
```

## Position

```text
Release Guide
  -> Platform Release Recipe
  -> Structured Release Approval
  -> Release Handoff Pack
  -> Human / External Release System
  -> Evidence / Close-out
```

Handoff packs are bounded runbooks and evidence packages. They are not release approval, provider automation, CI/CD setup, secret validation, production execution, app-store submission, mini-program submission, or database migration execution.

## Pack Contract

Each pack must define:

- pack ID
- recipe ID
- release target
- execution level
- required approval
- required inputs
- preflight steps
- Codex may run
- human must run
- external system must run
- stop conditions
- evidence to capture
- rollback evidence
- monitoring evidence
- post-release smoke
- post-release close-out
- release guide bridge
- release execution bridge
- known limits

## Execution Levels

| Level | Meaning | Default owner |
|---|---|---|
| `PREVIEW_ASSIST` | Codex may prepare local-safe preview evidence, but preview publication remains human/external-system owned unless project policy explicitly allows it. | Codex prepare / human execute |
| `STAGING_HANDOFF` | Staging release action is handed to a human or external release system. | Human or external system |
| `PRODUCTION_HANDOFF` | Production, store, review, migration, DNS, payment, permissions, and config actions stay outside Codex execution. | Human or external system |

## Codex Command Rule

Codex may only run commands when all are true:

- command is explicitly listed in `Codex May Run`
- command is classified as `LOCAL_READ_ONLY`, `LOCAL_BUILD`, or `LOCAL_TEST`
- structured approval allows that action
- recipe policy allows that action
- no secret is required
- no production mutation is implied
- no provider API call, upload, preview publication, remote-state mutation, or CI/CD trigger is implied
- evidence output path exists or can be safely created
- stop conditions are clear

Default:

```text
Codex May Run: None unless explicitly allowed by structured approval, recipe policy, and command risk classification.
```

## Human-Owned Actions

These remain human-owned or external-system-owned by default:

- production deploy
- public customer rollout
- app-store submission
- mini-program review / release
- production database migration
- DNS changes
- payment changes
- permission changes
- production config changes
- secret setup
- rollback risk acceptance
- incident acceptance

## Boundaries

Release Handoff Packs do not:

- approve release or production
- deploy, publish, upload, submit, migrate, or release by themselves
- ask for or store secrets
- run provider APIs
- mutate CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config
- replace project release SOPs, owners, rollback owners, or incident owners
- turn structured approval into blanket authorization
- make Codex the release owner

## Principle

A handoff pack can make a release handoff precise.

It cannot make the release decision.
