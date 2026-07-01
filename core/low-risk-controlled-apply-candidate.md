# Low-Risk Controlled Apply Candidate

This protocol records whether a proposed change is small enough to be considered for a future human-approved controlled apply step.

It is not an apply runner. It does not write files, approve implementation, approve release, install hooks, change CI, or touch production-sensitive surfaces.

## Purpose

Low-risk apply candidate review exists to reduce manual friction after a first slice is understood and reviewed:

1. Keep target writes exact and bounded.
2. Separate low-risk local edits from high-risk work.
3. Require rollback and verification before any later apply step.
4. Stop when the change touches production, permissions, payments, migrations, secrets, hooks, CI, or broad paths.

## Required Decision

The only allowed positive outcome is `LOW_RISK_APPLY_CANDIDATE_RECORDED`.

That means:

- The candidate may be shown to a human for approval later.
- Codex still may not apply it now.
- Any later write still needs a separate approval record or execution instruction.

## Required Sections

Every candidate record must include:

- Human Summary
- Candidate Scope
- Required Evidence
- Allowed Actions
- Forbidden Actions
- Verification And Rollback
- Boundaries
- Machine-Readable Evidence
- Outcome

`Machine-Readable Evidence` is required for new source examples and strict checks. Historical target-project Markdown records remain compatible unless strict mode is requested.

## Hard Stops

A candidate is not low risk when it:

- uses wildcard, parent traversal, absolute, home, or backslash paths
- changes CI, hooks, release, deployment, secrets, or production configuration
- touches payment, permission, authentication, data migration, database schema, legal, security, or privacy surfaces
- points at generated, dependency, ignored, symlink, CI workflow, or hook paths
- lacks rollback or verification
- claims that writing, applying, implementation, or release is already approved

In those cases, the outcome must be `NOT_READY` or `BLOCKED`.
