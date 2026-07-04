# Release Core Model

Release Core Model turns the 1.57-1.66 release assets into one user-facing Release Plan.

It is a pure view model. It summarizes lower-level source systems and explains the next release-facing step, but it is not a new release authority, not an execution system, and not a source of truth.

## Source Systems Stay Authoritative

The Release Plan can read and summarize these systems:

- Release Adapter
- Release Guide
- Platform Release Recipe
- Launch Review View
- Release Handoff Pack
- Release Execution Protocol
- Native Migration Plan
- Existing Rule Reconciliation
- Unified Apply Plan
- Controlled Apply Readiness
- Approval Record

The Release Plan never replaces or overrides those systems. If a source system is stricter, missing, blocked, or requires a human decision, the Release Plan must show that instead of smoothing it over.

## Pure View Model Contract

A Release Plan must state:

- Release Plan is a computed read-only projection.
- Release Plan does not approve release or production.
- Release Plan does not write target-project files.
- Release Plan does not change command behavior.
- Release Plan Trace explains the decision only; it does not control execution.
- Release Plan State is a summary state only; it does not drive workflow behavior.
- IntentOS Operating Mode does not grant write permission.
- Codex is not the release owner.

## Existing Projects

For existing projects, IntentOS has two separate decisions:

1. IntentOS Operating Mode: how Codex works.
2. Project Asset Migration Depth: how much project governance/file structure may be changed.

IntentOS Operating Mode may become active immediately for planning, task work, review, rule comparison, and controlled apply planning.

Project Asset Migration Depth is not maximized by default. Codex must compare existing engineering baselines, environment rules, release rules, CI, hooks, document source of truth, and protected domain constraints against IntentOS expectations, then recommend the most suitable path.

## Existing Rule Comparison Contract

Existing project rules are not ignored. They are compared against IntentOS using these postures:

- `KEEP_EXISTING`
- `KEEP_EXISTING_AS_STRICTER`
- `ADOPT_INTENTOS_GAP`
- `MERGE_AFTER_REVIEW`
- `GAP_SUGGESTION`
- `NEEDS_HUMAN_DECISION`
- `BLOCKED_BY_PROJECT_AUTHORITY`

Release, production, security, privacy, compliance, payment, tax, finance, HR, legal, customer data, permissions, migrations, provider state, and business rules remain project-owned unless an explicit human approval and apply plan says otherwise.

## Release Plan Trace

Trace is explanation only. It must show:

- which lower-level system contributed input
- whether the input was present, missing, blocked, or generated
- what it contributed to the final view
- that it has no control authority

## Summary State

Release Plan State is a summary state, not a workflow engine state. Allowed states:

- `NEEDS_RELEASE_SHAPE`
- `NEEDS_PLATFORM_RECIPE`
- `NEEDS_LAUNCH_REVIEW`
- `NEEDS_STRUCTURED_APPROVAL`
- `READY_FOR_HANDOFF_REVIEW`
- `READY_FOR_LOCAL_ASSIST`
- `READY_FOR_PREVIEW_HANDOFF`
- `READY_FOR_STAGING_HANDOFF`
- `READY_FOR_PRODUCTION_HANDOFF`
- `BLOCKED_BY_HUMAN_DECISION`
- `BLOCKED_BY_EXTERNAL_SYSTEM`
- `BLOCKED_BY_HIGH_RISK_SURFACE`
- `BLOCKED_BY_PROJECT_AUTHORITY`

## Boundaries

Release Plan must never:

- approve release
- approve production
- deploy, publish, submit, migrate, upload, or mutate remote state
- ask for or store secrets
- edit CI, hooks, DNS, payment, permissions, production data, or production config
- replace lower-level release systems
- replace existing project governance
- treat old-project IntentOS Operating Mode as file-write permission

