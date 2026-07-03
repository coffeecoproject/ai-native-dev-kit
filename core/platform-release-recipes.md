# Platform Release Recipes

Platform Release Recipes answer one question:

```text
For this platform, what does a safe release path usually need?
```

They do not answer:

```text
Go deploy this project now.
```

## Position

```text
Release Guide
  -> Platform Release Recipe
  -> Launch Review View / Unified Closure
  -> Structured Release Approval
  -> Release Execution Plan
  -> Release Handoff Pack
```

Recipes are read-only maps. They are not release approval, provider automation, CI/CD setup, secret validation, or production execution. A recipe does not approve release and does not execute release commands.

## Strict And Draft Recipes

1.59 starts with three strict recipes:

| Recipe ID | Purpose |
|---|---|
| `web-hosted-preview` | preview-first hosted web release path |
| `backend-api-handoff` | backend/API release handoff with migrations, rollback, monitoring, and owner boundaries |
| `mini-program-review-handoff` | mini-program upload/review/release path with human-owned submission |

Draft recipes can describe future support, but they must not pass strict recipe checks until owner, rollback, monitoring, evidence, platform constraints, and Codex boundaries are complete.

## Recipe Selection

Recipe selection is confidence-based:

| Confidence | Behavior |
|---|---|
| `HIGH` | select recipe and explain why |
| `MEDIUM` | suggest recipe and ask user to confirm |
| `LOW` | show top candidates and ask one decision question |
| `CONFLICT` | stop and ask the user to choose |

## Recipe Contract

Each recipe must define:

- platform signals
- safe first target
- supported targets
- required inputs
- preflight checks
- human decisions
- Codex allowed actions
- Codex blocked actions
- required evidence
- rollback requirements
- monitoring requirements
- release owner expectations
- post-release smoke expectations
- release execution bridge
- known limits

## Boundaries

Platform Release Recipes do not:

- approve release or production
- deploy, publish, upload, submit, migrate, or release by themselves
- ask for or store secrets
- inspect live cloud consoles
- mutate CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, production data, or production config
- replace project release SOPs, owners, rollback owners, or incident owners
- turn provider assumptions into certainty
- make Codex the release owner

## Principle

A recipe can make the next release conversation safer.

It cannot make the release decision.
