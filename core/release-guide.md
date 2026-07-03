# Release Guide

Release Guide is the unified release entry for beginner users.

It answers:

```text
The user wants to launch. What path should Codex guide them through next?
```

It does not answer:

```text
Codex may release this project.
```

## Role

Release Guide is an orchestration and explanation layer. It routes across:

- Guided Release Adapter
- Launch Review View
- Structured Release Approval
- Release Execution Protocol

It keeps those internal systems behind one user-facing question:

```text
Can this project move toward launch, and what is the safe next step?
```

## Authority

Release Guide is not release authority.

Release authority remains:

- the human release owner
- the project release SOP
- the external release system or platform owner

## Structured Approval

Release approval must be structured. Free-form text saying "approved" is not enough.

Required fields:

- Approval Type
- Approval Status
- Release Target
- Approved Scope
- Approved By
- Approval Time
- Allowed Codex Actions
- Blocked Actions
- Evidence Path
- Expiry / Reconfirm By

## Assist Levels

Release Guide uses explicit assist levels:

- `LOCAL_ASSIST`
- `PREVIEW_ASSIST`
- `STAGING_HANDOFF`
- `PRODUCTION_HANDOFF`

Production release, store submission, mini-program release, production migration, DNS, payment, permission, secret, and production-config actions remain human-owned or external-system-owned.

## Command Risk Classes

Release-related commands must be classified before Codex can run them.

- `NO_RUN`
- `LOCAL_READ_ONLY`
- `LOCAL_BUILD`
- `LOCAL_TEST`
- `PREVIEW_PREPARE`
- `PREVIEW_EXECUTE_BY_HUMAN`
- `PRODUCTION_HANDOFF_ONLY`

Unknown commands default to `NO_RUN`.
Unknown commands default to NO_RUN.

Commands that may contact provider APIs, upload artifacts, publish previews, mutate remote state, or trigger CI/CD cannot be treated as local-safe commands.
Release Guide does not call provider APIs.
Release Guide does not request, store, print, or infer secrets.

## Evidence Quality

Release Guide distinguishes visible evidence from quality evidence.

Release owner, rollback, monitoring, environment, post-launch smoke, and approval evidence must include concrete owner/path/scope/target details. A placeholder file is not enough.

## Boundaries

Release Guide does not:

- approve release
- deploy production
- publish previews by itself
- submit app-store or mini-program review
- run production migrations
- ask for or store secrets
- change CI/CD, hooks, DNS, payment, permissions, app-store state, mini-program state, or production config
- make Codex the release owner
