# Spec: Manifest Authoritative Asset Source

## Status

Ready

## Source

Request: `requests/037-manifest-authoritative.md`

Preflight: `preflight/037-manifest-authoritative.md`

Productization plan: `docs/productization-hardcut-1.0-plan.md`

Decision brief: `decision-briefs/037-manifest-authoritative.md`

## Problem

Asset lists are still repeated across scripts. The manifest must become authoritative so future asset additions can be made in one place and then verified by checkers.

## User Story

As a maintainer, I want required asset lists and safe static copy rules to come from `dev-kit-manifest.json` so future workflow asset additions do not require coordinated edits across multiple scripts.

## Scope

Included:

- Change manifest mode to authoritative.
- Add manifest copy rules for safe static assets.
- Make `check-ai-workflow.mjs` read target required paths from manifest.
- Make `workflow-next.mjs` read workflow readiness paths from manifest.
- Make `check-dev-kit.mjs` read source required files from manifest.
- Make `init-project.mjs` read safe static copy rules, workflow directories, and workflow version assets from manifest.
- Copy `.ai-native/dev-kit-manifest.json` and `scripts/lib/manifest.mjs` into generated projects.
- Update manifest schema and manifest checker for authoritative mode.
- Update version metadata to `0.37.0`.
- Add `0.37.0` workflow artifacts and release evidence.

Excluded:

- PR template migration behavior changes.
- AGENTS governance migration behavior changes.
- Industrial pack selection behavior changes.
- Init/update plan, backup, or dry-run behavior.
- Migration command implementation.
- Artifact frontmatter or schema enforcement.
- Package publishing.
- License rewrite.

## Non-goals

This phase does not make every governed operation data-only. It only makes asset lists and safe static copies manifest-driven.

## Data Model Impact

`dev-kit-manifest.json` changes from `mode: read-only` to `mode: authoritative` and adds `copyRules.directories` and `copyRules.files`.

## API / Interface Contract

Existing commands keep their public behavior:

```bash
node scripts/check-ai-workflow.mjs <project> --mode core
node scripts/workflow-next.mjs <project>
node scripts/init-project.mjs --starter generic-project --target <project>
node scripts/check-dev-kit.mjs
```

The internal source of required asset lists changes to manifest.

## Permission Rules

- Manifest authority does not approve release, migration, production, destructive operations, package publishing, or risk acceptance.
- PR template and AGENTS changes still require their existing explicit apply flags.
- Industrial concrete packs still require explicit selection, installed pack state, or selected baseline evidence.

## UI States

Not applicable as a visual interface. CLI and script output states are pass, fail, missing manifest, missing required asset, and workflow update required.

## Observability

`scripts/check-manifest.mjs`, generated-project smoke checks, and `releases/0.37.0/phase-report.md` provide observability.

## Acceptance Criteria

- `node scripts/check-manifest.mjs` passes in authoritative mode.
- `node scripts/check-dev-kit.mjs` passes.
- Generated-project smoke passes.
- Generated projects include `.ai-native/dev-kit-manifest.json` and `scripts/lib/manifest.mjs`.
- A manifest-added target path is reported by both `check-ai-workflow` and `workflow-next`.
- Version metadata and workflow version assets match `0.37.0`.

## Test Plan

- Run `git diff --check`.
- Run recursive script syntax check.
- Run `node scripts/check-manifest.mjs`.
- Run CLI init smoke and generated-project core check.
- Run task-scoped workflow artifact, goal mode, subagent orchestration, review loop, next-step boundary, and output quality checks.
- Run `node scripts/check-fixtures.mjs`.
- Run `node scripts/check-dev-kit.mjs`.

## Rollback Notes

Revert manifest mode and schema to read-only, remove copyRules, restore script-owned asset lists as the active source, remove generated-project manifest/loader requirements, remove `0.37.0` phase artifacts, and revert version metadata to `0.36.0`.
