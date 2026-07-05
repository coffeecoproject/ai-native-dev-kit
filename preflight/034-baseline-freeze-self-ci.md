# Preflight: Baseline Freeze And Self CI

## Source Request

Request: `requests/034-baseline-freeze-self-ci.md`

## Clarity

READY

## Problem Summary

Phase 0.34.0 is the first executable productization hardcut phase. It should freeze the current `0.33.0` state and add intentos first-party CI without touching higher-risk productization work.

## Missing Information

No blocking information is missing. GitHub CI will be added as repository files; actual hosted CI execution happens after push.

## Assumptions

- The current baseline commit is `1acd7440f4ffc295cba9abd8324e943d06eb8099`.
- Node.js 22 is the intended runtime for productized CI.
- Existing intentos checks are the source of truth for this phase.
- CI files can be added before branch protection is configured.

## Direction Risks

- Adding CI that is too broad may slow routine PRs.
- Adding CI that is too narrow may miss intentos regressions.
- Repository governance files may imply review ownership before maintainers finalize owners.
- This phase could accidentally drift into CLI or manifest implementation if scope is not enforced.

## Over-design Risks

Do not build a custom CI runner, package CLI, manifest schema, or migration system in this phase. The first step is to freeze and verify the current baseline.

## MVP Recommendation

Add PR and release CI tiers, baseline evidence, repository PR/security/contribution files, and a task-scoped review loop.

## Non-goals

- No CLI.
- No manifest implementation.
- No schema/frontmatter implementation.
- No init/update dry-run or apply-plan implementation.
- No industrial pack maturity changes.
- No license rewrite.

## Domain Model Draft

Phase artifact model:

- `0.33.0` baseline evidence records the state before productization work.
- `0.34.0` task artifacts record the first productization execution phase.
- CI evidence becomes the gate for future phases.

## Permission / Security Risks

Security policy text must be clear but must not imply a managed vulnerability response team beyond repository maintainers.

## First Vertical Slice

One repository-level CI slice:

- syntax check for scripts
- intentos self-check
- fixture suite
- output quality score
- glossary usage check
- generated-project smoke

## Suggested Specs

Spec: `specs/034-baseline-freeze-self-ci.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The phase is bounded, low-risk compared with later manifest/schema refactors, and creates the evidence foundation needed before further productization.
