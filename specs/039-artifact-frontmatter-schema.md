# Spec: Artifact Frontmatter + Schema

## Status

Ready

## Source

Request: `requests/039-artifact-frontmatter-schema.md`

Preflight: `preflight/039-artifact-frontmatter-schema.md`

Productization plan: `docs/plans/productization-hardcut-1.0-plan.md`

Decision brief: `decision-briefs/039-artifact-frontmatter-schema.md`

## Problem

Artifact files are readable but too section-dependent for stable automation. Metadata should become explicit without removing Markdown sections.

## User Story

As a maintainer, I want new workflow artifacts to carry validated metadata so Codex and checkers can reason about artifact type, status, task level, and references consistently.

## Scope

Included:

- Add `schemas/artifacts/` for request, preflight, spec, eval, task, review loop report, goal card, and subagent run plan.
- Add `scripts/lib/frontmatter.mjs`.
- Update `new-workflow-item.mjs` to write frontmatter for schema-backed artifact types.
- Update `check-workflow-artifacts.mjs` to validate frontmatter and prefer metadata refs when present.
- Add `--strict-schema` to fail legacy artifacts without frontmatter.
- Keep legacy no-frontmatter artifacts as warnings by default in `0.39.x`.
- Copy schemas and frontmatter helper into generated projects.

Excluded:

- Full migration of existing examples.
- Default strict schema for all artifacts.
- External JSON schema dependency.
- Checker library refactor.
- Fixture matrix expansion.

## Non-goals

This phase does not replace Markdown sections. Frontmatter helps machines; Markdown remains the human source of explanation.

## Data Model Impact

New artifact frontmatter includes fields such as `schema_version`, `artifact_type`, `number`, `slug`, `title`, `status`, `created_at`, references, and `task_level` when applicable.

## API / Interface Contract

New generated artifacts from `scripts/new-workflow-item.mjs` include frontmatter.

`scripts/check-workflow-artifacts.mjs` accepts:

```bash
node scripts/check-workflow-artifacts.mjs . --mode ready
node scripts/check-workflow-artifacts.mjs . --mode draft --strict-schema
```

Default mode warns for old artifacts without frontmatter. Strict schema mode fails them.

## UI States

Not applicable as a visual interface. CLI states are pass, fail, warn legacy frontmatter, invalid frontmatter, and strict-schema failure.

## Permission Rules

- Frontmatter does not approve implementation, risk, release, migration, or Human Approval.
- Section checks remain active.
- Missing or invalid frontmatter fields fail when frontmatter exists.
- Old artifacts without frontmatter warn by default and fail under `--strict-schema`.

## Observability

Self-check covers generated frontmatter, invalid frontmatter, legacy warning, and strict-schema rejection. Release evidence records the phase.

## Acceptance Criteria

- New artifacts include valid frontmatter.
- Invalid frontmatter required fields fail.
- Old artifacts without frontmatter warn by default.
- `--strict-schema` fails old artifacts without frontmatter.
- Generated projects receive schemas and `scripts/lib/frontmatter.mjs`.
- Existing examples still pass default checks.

## Test Plan

- Run `git diff --check`.
- Run recursive script syntax check.
- Run `node scripts/check-manifest.mjs`.
- Run task-scoped workflow artifact, goal mode, subagent orchestration, review loop, next-step boundary, and output quality checks.
- Run `node scripts/check-fixtures.mjs`.
- Run `node scripts/check-dev-kit.mjs`.

## Rollback Notes

Revert frontmatter helper, artifact schemas, generator metadata emission, checker strict-schema behavior, manifest copy additions, `0.39.0` phase artifacts, and version metadata to `0.38.0`.
