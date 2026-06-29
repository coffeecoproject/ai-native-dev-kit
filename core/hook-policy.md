# Project Hook Policy Governance

Project Hook Policy Governance defines which hooks a project allows, who must
approve them, and how they are disabled or rolled back.

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
release automation signals. A human must review the policy before any hook work.

`GOVERNED_POLICY_PRESENT`

The project already has a hook policy or equivalent governance document. Codex
must map to it instead of replacing it.

`BLOCKED_BY_EXISTING_HOOK_RISK`

Existing hook behavior appears blocking, external, release-related, secret-like,
or production-sensitive. Codex must stop for a human decision.

## Hook Class Policy

`H0_AUTO_READ_ONLY`

Allowed only for local, read-only, non-blocking checks that do not write files,
call external services, alter CI, alter release behavior, or treat output as
approval.

`H1_AUTO_SUGGESTION`

Allowed only for recommendations, plans, and review packets. Suggestions are not
permission to install hooks.

`H2_REQUIRES_CONFIRMATION`

Requires human confirmation before any project-file change, local Git hook,
Husky/Lefthook/pre-commit configuration, non-blocking workflow step, or package
script hook is added.

`H3_EXPLICIT_APPROVAL_REQUIRED`

Requires explicit human approval, named owner, rollback plan, and evidence
before any blocking gate, CI mutation, scheduled job, external API call,
auto-fix behavior, release hook, production-adjacent hook, or token/secret
storage is added.

## Required Policy Contents

A Project Hook Policy must include:

- policy state
- existing hook / CI / scheduler / script sources
- allowed hook classes
- approval matrix
- rollback / disable policy
- forbidden automatic actions
- relationship to Hook Orchestration
- human decisions needed
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
