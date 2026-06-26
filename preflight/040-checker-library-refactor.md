---
schema_version: 1.0
artifact_type: preflight
number: "040"
slug: checker-library-refactor
title: Checker Library Refactor
status: ready
created_at: "2026-06-27"
devkit_version: 0.40.1
request: requests/040-checker-library-refactor.md
task_level: L2
---
# Preflight: 040-checker-library-refactor

## Source Request

`requests/040-checker-library-refactor.md`

## Clarity

READY

## Problem Summary

The dev-kit has enough fixture coverage to begin reducing repeated checker utility code. The work is internal and should preserve external behavior.

## Missing Information

- No missing product requirement.
- No missing platform decision.
- No missing permission decision.

## Assumptions

- Existing fixture expectations represent the behavior contract for this phase.
- Shared helpers should stay dependency-free and ESM-compatible.
- Scripts with special behavior may keep local code until the behavior is safely covered.

## Direction Risks

- A helper abstraction could accidentally hide script-specific behavior.
- CLI output could drift during refactor.
- A broad one-shot rewrite could make failures harder to diagnose.

## Over-design Risks

- Building a framework instead of small shared functions would add unnecessary complexity.
- Refactoring scripts with weak fixture coverage would increase risk without enough benefit.
- Adding new dependencies for simple parsing and walking would make the kit heavier.

## MVP Recommendation

Implement the shared libraries listed in the 0.40.1 roadmap and migrate repeated plumbing in checker scripts where the fixture matrix covers behavior. Keep each helper small, dependency-free, and easy to inspect.

## Non-goals

- Do not change checker semantics.
- Do not add package dependencies.
- Do not implement `ai-native migrate`.
- Do not rewrite the CLI front door.
- Do not change platform or industrial baseline policy.

## Domain Model Draft

- `args` helper: converts CLI argv into positional values and flags.
- `markdown` helper: extracts Markdown sections and simple table content.
- `check-result` helper: standardizes pass, fail, pending, and JSON result recording.
- `git` helper: reads changed files and repository state for checkers that already need git context.
- `project-signals` helper: centralizes project signal file and directory detection.

## Permission / Security Risks

No runtime permission, secret, auth, payment, production config, or data access behavior is changed. The only remote action attempted before this phase was `git push`, which failed because the token lacks `workflow` scope.

## First Vertical Slice

```text
developer runs checker -> checker uses shared helper -> output stays stable -> fixture matrix proves no behavior drift
```

## Suggested Specs

- `specs/040-checker-library-refactor.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The task is bounded, the previous fixture phase provides behavior protection, and the main risk can be controlled by small refactor steps plus fixture and self-check verification.
