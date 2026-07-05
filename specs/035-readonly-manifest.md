# Spec: Read-only IntentOS Manifest

## Status

Ready

## Source

Request: `requests/035-readonly-manifest.md`

Preflight: `preflight/035-readonly-manifest.md`

Productization plan: `docs/plans/productization-hardcut-1.0-plan.md`

Decision brief: `decision-briefs/035-readonly-manifest.md`

## Problem

The IntentOS needs a central product inventory before later phases can safely introduce CLI, manifest authority, init/update safety, and schema-backed artifacts.

## User Story

As a maintainer, I want a read-only manifest and drift checker so I can see when asset lists diverge before the manifest becomes authoritative.

## Scope

Included:

- Add `intentos-manifest.json`.
- Add `schemas/intentos-manifest.schema.json`.
- Add `scripts/lib/manifest.mjs`.
- Add `scripts/check-manifest.mjs`.
- Add task-scoped workflow artifacts for phase `0.35.0`.
- Add decision brief for the read-only authority boundary.
- Update `scripts/check-intentos.mjs` to run manifest checks and negative manifest cases.
- Update version metadata to `0.35.0`.
- Update intentos CI workflows to run `node scripts/check-manifest.mjs`.
- Add `releases/0.35.0/phase-report.md`.

Excluded:

- CLI implementation.
- Manifest authority for init, update, workflow-next, or workflow checks.
- Artifact frontmatter or schema enforcement.
- Init/update dry-run, plan, backup, or apply-plan behavior.
- Target-project bootstrap semantic changes.
- Industrial pack maturity changes.
- License rewrite.

## Non-goals

This phase does not remove duplicate asset lists. It creates a safe comparison point before later refactors.

## Data Model Impact

Adds a repository-level JSON manifest with `schemaVersion`, `intentOSVersion`, `mode`, `compatibilityPolicy`, and grouped asset lists.

## API / Interface Contract

Adds one local checker command:

```bash
node scripts/check-manifest.mjs
```

The command validates manifest shape, checks version consistency, and reports drift between manifest groups and existing script/template lists.

## UI States

Not applicable. This is repository productization work.

## Permission Rules

The manifest must not grant approval, release authority, or runtime authority. It is inventory and drift evidence only.

## Observability

Manifest checker output and `releases/0.35.0/phase-report.md` provide observability.

## Acceptance Criteria

- `node scripts/check-manifest.mjs` passes.
- `node scripts/check-intentos.mjs` runs manifest validation.
- Invalid manifest structure fails before drift checking.
- Extra or missing manifest assets produce a clear drift report.
- CI includes explicit manifest check steps.
- Existing target-project init/update/check behavior is unchanged.

## Test Plan

- Run `git diff --check`.
- Run recursive script syntax check with `find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check`.
- Run `node scripts/check-manifest.mjs`.
- Run task-scoped workflow artifact, goal mode, subagent orchestration, review loop, next-step boundary, and output quality checks for this phase.
- Run `node scripts/check-fixtures.mjs`.
- Run `node scripts/check-intentos.mjs`.

## Rollback Notes

Remove `intentos-manifest.json`, `schemas/intentos-manifest.schema.json`, `scripts/lib/manifest.mjs`, `scripts/check-manifest.mjs`, the `0.35.0` phase artifacts, the CI manifest-check steps, and revert version metadata from `0.35.0` to `0.34.0`.
