# Project Hook Policy Governance

Project Hook Policy Governance defines which hooks a project allows, which
evidence authority applies, and how they are disabled or rolled back.

It hardens Hook Orchestration. Hook Orchestration answers "what hook could be
useful?" Project Hook Policy answers "what hook is allowed in this project?"

## Core Rule

Hook policy is authorization planning only.

Codex may draft, classify, and check a Project Hook Policy. Codex must not use
the policy to install hooks, modify CI, add blocking gates, call external APIs,
store tokens, enable auto-fix, or change release behavior.

## Policy States

`NO_POLICY_FOUND`

No project hook policy is recorded yet. Codex may draft a policy recommendation.

`POLICY_DRAFT_READY`

A policy draft exists or can be generated, but it is not approved for
installation work.

`POLICY_REVIEW_REQUIRED`

The project has existing hooks, CI workflows, scheduled jobs, hook tooling, or
release automation signals. Codex must run the stricter internal review before any hook work.

`GOVERNED_POLICY_PRESENT`

The project already has a hook policy or equivalent governance document. Codex
must map to it instead of replacing it.

`BLOCKED_BY_EXISTING_HOOK_RISK`

Existing hook behavior appears blocking, external, release-related, secret-like,
or production-sensitive. Codex must stop the dependent action until evidence,
rollback, and review are sufficient; exact user consent is needed only for a
prepared real-world effect.

## Hook Class Policy

`H0_AUTO_READ_ONLY`

Allowed only for local, read-only, non-blocking checks that do not write files,
call external services, alter CI, alter release behavior, or treat output as
approval.

`H1_AUTO_SUGGESTION`

Allowed only for recommendations, plans, and review packets. Suggestions are not
permission to install hooks.

`H2_REQUIRES_CONFIRMATION`

Compatibility label for project-file changes, local Git hooks,
Husky/Lefthook/pre-commit configuration, non-blocking workflow steps, or package
script hooks. These require controlled apply, rollback, and verification rather
than user technical judgment.

`H3_EXPLICIT_APPROVAL_REQUIRED`

Compatibility label for blocking gates, CI mutation, scheduled jobs, external
API calls, auto-fix behavior, release hooks, production-adjacent hooks, or
token/secret storage. These require strict internal review, rollback, and
evidence; exact user consent is additionally required for the prepared external
effect.

## Required Policy Contents

A Project Hook Policy must include:

- policy state
- existing hook / CI / scheduler / script sources
- allowed hook classes
- evidence-authority and consent matrix
- rollback / disable policy
- forbidden automatic actions
- relationship to Hook Orchestration
- bounded user input needed
- boundary statement

## Boundary

Every Project Hook Policy must state:

- This policy installs hooks: No
- This policy modifies CI: No
- This policy adds blocking gates: No
- This policy calls external APIs: No
- This policy stores tokens or secrets: No
- This policy enables auto-fix: No
- This policy treats hook output as human approval: No
- This policy approves implementation, release, or production: No
- This policy replaces Hook Orchestration: No
