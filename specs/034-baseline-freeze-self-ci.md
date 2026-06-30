# Spec: Baseline Freeze And Self CI

## Status

Ready

## Source

Request: `requests/034-baseline-freeze-self-ci.md`

Preflight: `preflight/034-baseline-freeze-self-ci.md`

Productization plan: `docs/plans/productization-hardcut-1.0-plan.md`

## Problem

The repository needs its own productization safety net before larger hardcuts such as manifest authority, CLI front door, schema/frontmatter, and init/update plan execution.

## User Story

As a maintainer, I want first-party CI and baseline evidence so that every future productization change is checked against the current green dev-kit behavior.

## Scope

Included:

- Add repository PR CI and release CI workflow files.
- Add repository PR template.
- Add CODEOWNERS draft guidance.
- Add CONTRIBUTING and SECURITY docs.
- Record `0.33.0` baseline freeze evidence.
- Record `0.34.0` phase evidence and final report.
- Update version records to `0.34.0`.
- Extend `check-dev-kit` so required productization phase assets and dev-kit CI are checked.

Excluded:

- CLI implementation.
- Manifest implementation.
- Artifact schema/frontmatter implementation.
- Init/update dry-run, plan, backup, or apply-plan implementation.
- Industrial pack maturity lifecycle implementation.
- License rewrite.

## Non-goals

This phase does not make the dev kit installable. It creates the safety gate for later installability work.

## Data Model Impact

No persisted data model changes.

## API / Interface Contract

No public CLI, package, or target-project API contract changes in this phase.

Repository CI contract:

```text
PR CI checks dev-kit self-check, fixture suite, recursive script syntax, output quality, glossary usage, and generated-project smoke.
Release CI checks the same base plus broader recursive syntax coverage.
```

## UI States

Not applicable. This is repository and CI productization work.

## Permission Rules

Repository governance files must not grant release or security authority automatically. Ownership and enforcement remain human decisions.

## Observability

CI logs and release evidence files provide observability for this phase.

## Acceptance Criteria

- `.github/workflows/dev-kit-pr-checks.yml` exists and includes the required PR CI commands.
- `.github/workflows/dev-kit-release-checks.yml` exists and includes release-tier checks.
- `.github/pull_request_template.md`, `.github/CODEOWNERS`, `CONTRIBUTING.md`, and `SECURITY.md` exist.
- `releases/0.33.0/baseline-freeze.md` and `releases/0.33.0/self-check-report.md` exist.
- `VERSION.md`, `templates/version-record.md`, and `templates/workflow-version.json` show `0.34.0`.
- `node scripts/check-dev-kit.mjs` passes.
- `git diff --check` passes.

## Test Plan

- Run `git diff --check`.
- Run `node scripts/check-dev-kit.mjs`.
- Run `node scripts/check-fixtures.mjs`.
- Run recursive script syntax check with `find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check`.
- Run generated-project smoke locally.
- Run task-scoped workflow artifact, goal mode, subagent orchestration, review loop, next-step boundary, and output quality checks for this phase.

## Rollback Notes

Remove the new `.github/` workflows and repository governance files, remove `releases/0.33.0/` and `releases/0.34.0/` evidence files, and revert version metadata from `0.34.0` to `0.33.0`.
