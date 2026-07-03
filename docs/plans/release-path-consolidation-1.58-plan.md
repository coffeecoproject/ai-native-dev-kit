# 1.58.0 Release Guide Consolidation Plan

## Goal

Make release preparation usable through one beginner-facing entry.

1.55 added Launch Review View.
1.56 added Release Execution Protocol.
1.57 added Guided Release Adapter.

1.58 consolidates those paths behind:

```bash
node scripts/cli.mjs release-guide <project> --intent "help me launch"
```

## User Outcome

A beginner user should not need to know whether Codex should run `release-adapter`, `launch-view`, or `release-execution`.

Codex should:

- read the project release shape
- route to the correct release stage
- show one plain Release Guide Card
- require structured release approval before execution readiness
- split assisted execution into explicit levels
- classify release command risk
- distinguish evidence visibility from evidence quality
- keep release authority human-owned or external-system-owned

## Scope

In scope:

- `release-guide`
- `release-guide-check`
- Release Guide Card template
- Release Approval Record template
- assist level classification
- command risk classification
- structured release approval gate
- evidence quality map
- examples and bad fixtures

Out of scope:

- platform release recipes
- release handoff packs
- provider API calls
- deployment automation
- CI/CD mutation
- secret handling
- production release execution

## Protocol Shape

```text
Natural language release intent
  -> Release Guide
  -> Release Adapter / Launch Review / Release Execution routing
  -> Structured Release Approval gate
  -> Evidence quality map
  -> PLAN_ONLY release execution bridge
```

## Rules

- Release Guide is an orchestration entry, not release authority.
- Free-form "approved" text is not release approval.
- Structured release approval requires target, scope, owner, allowed actions, blocked actions, evidence path, and expiry.
- Unknown release commands default to `NO_RUN`.
- Provider API calls, uploads, preview publication, remote-state mutation, and CI/CD triggers are not local-safe.
- Production, stores, mini-program release, migrations, DNS, payment, permissions, secrets, and production config remain human or external-system owned.

## Acceptance

- README / VERSION / package / manifest report `1.58.0`
- `release-guide` and `release-guide-check` are available through CLI
- `release-guide` routes to existing release systems without exposing internal command choice to beginner users
- structured release approval is required for execution readiness
- assist levels and command risk classes are present
- evidence quality rejects placeholder PASS evidence
- source example passes
- bad fixtures fail for:
  - unstructured release approval
  - production handoff assigned to Codex
  - remote-side-effect command classified as local-safe
  - weak evidence marked PASS
- `npm run verify` passes
- `git diff --check` passes
