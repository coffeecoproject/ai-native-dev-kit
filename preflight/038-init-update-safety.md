# Preflight: Init/Update Safety

## Source Request

Request: `requests/038-init-update-safety.md`

## Clarity

READY

## Problem Summary

Init/update can write workflow assets into target projects, but unbootstrapped, dirty, or first-adoption projects need a reviewable plan before writes.

## Missing Information

- Migration command behavior is intentionally deferred.
- Artifact frontmatter and schema enforcement are intentionally deferred.
- Package publishing and distribution policy remain deferred.
- External reviewer automation remains out of scope.

## Assumptions

- Already bootstrapped low-risk projects can still use direct update.
- `workflow-next` can classify risky target states before direct update.
- A local JSON plan is enough for review and deterministic apply.
- Target fingerprint validation can reject stale plans without adding dependencies.
- Backup-dir support is recoverability, not approval to overwrite business code.

## Direction Risks

- Plan generation could be mistaken for human approval.
- Direct update could still silently mutate a risky existing project.
- Apply-plan could run after target files changed.
- CLI dry-run could become ambiguous between command preview and plan preview.

## Over-design Risks

- Implementing full migration command belongs to a later phase.
- Adding a general static-analysis scanner would exceed workflow productization.
- Adding dependencies or a command framework is not needed.
- Requiring plan-first for every bootstrapped low-risk update would make normal maintenance too heavy.

## MVP Recommendation

Add dry-run, write-plan, apply-plan, backup-dir, stale-plan validation, and direct-update blocking for risky targets. Keep normal direct update for already bootstrapped low-risk targets.

## Non-goals

- No migration command.
- No artifact schema/frontmatter.
- No source-code scanning gate.
- No package publishing.
- No external GPT/API reviewer automation.
- No PR template or AGENTS approval behavior change.
- No industrial pack selection behavior change.

## Domain Model Draft

- Init/update plan: JSON record of operation, target, arguments, fingerprint, preconditions, and actions.
- Target fingerprint: target existence, git state, dirty summary, and file hashes for relevant paths.
- Apply-plan: execution mode that validates the fingerprint before writes.
- Backup-dir: target-relative or absolute location for preserving overwritten managed assets.
- Direct-update gate: `workflow-next` check that stops risky targets before direct writes.

## Permission / Security Risks

No secrets, auth, permissions, production configuration, data migration, destructive operation, value transfer, or dependency addition are touched.

## First Vertical Slice

Generate an update plan for a legacy existing project, verify direct update is blocked, apply the plan, and confirm governed files are not modified unless explicit apply flags are used.

## Suggested Specs

Spec: `specs/038-init-update-safety.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The scope is bounded, locally verifiable, and follows directly after the authoritative manifest phase.
