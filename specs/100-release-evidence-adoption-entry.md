---
schema_version: 1.0
artifact_type: spec
number: 100
slug: release-evidence-adoption-entry
title: "release evidence adoption entry"
status: ready
created_at: 2026-06-27
intentos_version: 0.42.0
request: requests/100-release-evidence-adoption-entry.md
preflight: preflight/100-release-evidence-adoption-entry.md
---
# Spec 100: release evidence adoption entry

## Status

Ready

## Source

- Request: `requests/100-release-evidence-adoption-entry.md`
- Preflight: `preflight/100-release-evidence-adoption-entry.md`

## Problem

The IntentOS needs formal 1.0 release evidence and adoption entry criteria. Without those files and
checks, 1.0 would be only a version bump.

## User Story

As a maintainer, I want 1.0 release evidence so that the release boundary is auditable.

As a user, I want known limitations and adoption evidence criteria so that I know what 1.0 proves
and what it does not prove.

## Scope

Included:

- required `releases/1.0.0/` evidence files
- `templates/adoption-evidence-report.md`
- `templates/productization-trial-report.md`
- version metadata bump to `1.0.0`
- manifest updates for new assets
- self-check coverage for release evidence completeness
- workflow artifacts and final report

## Non-goals

- no package publishing
- no migration apply
- no industrial pack promotion
- no external GPT/API or hook automation
- no legal advice or license term change
- no claim of complete real-project validation

## Data Model Impact

New release evidence files:

- `release-record.md`
- `self-check-report.md`
- `generated-project-smoke.md`
- `update-smoke.md`
- `migration-matrix.md`
- `known-limitations.md`
- `adoption-evidence.md`

New templates:

- `adoption-evidence-report.md`
- `productization-trial-report.md`

Version metadata changes:

- `VERSION.md`
- `package.json`
- `intentos-manifest.json`
- `templates/workflow-version.json`
- `templates/version-record.md`

## API / Interface Contract

No new runtime API.

Release evidence must make these command surfaces visible:

```text
node scripts/cli.mjs self-check
node scripts/cli.mjs fixtures
node scripts/cli.mjs init --starter generic-project --target /tmp/intentos-1-test
node scripts/cli.mjs update --target /tmp/intentos-1-test --dry-run
node scripts/cli.mjs migrate --target /tmp/intentos-1-test --from 0.33.0 --to 1.0.0 --dry-run
```

## UI States

- Not applicable. This task changes docs, metadata, and local CLI evidence only.

## Permission Rules

- No package publishing.
- No target-project mutation except generated smoke target under `/tmp`.
- `update --dry-run` must not mutate target files.
- `migrate --dry-run` must not mutate target files.
- No production configuration changes.

## Observability

- Release evidence files under `releases/1.0.0/`.
- Self-check output.
- Generated project smoke output.
- Update dry-run output.
- Migration dry-run output.
- Final report and review loop report.

## Acceptance Criteria

- `VERSION.md`, `package.json`, `intentos-manifest.json`, and `templates/workflow-version.json` show `1.0.0`.
- Release evidence files exist and state the 1.0 minimum boundary.
- Adoption evidence file says 10/10 real-project evidence is not achieved.
- Known limitations state industrial packs remain draft and migration apply is absent.
- Migration matrix documents `0.33.0 -> 1.0.0`.
- Self-check validates release evidence completeness.
- Required 1.0 commands pass or expected safety failures are recorded.

## Test Plan

- Syntax: `node --check scripts/check-intentos.mjs`.
- Manifest: `node scripts/check-manifest.mjs .`.
- Fixtures: `node scripts/check-fixtures.mjs`.
- Self-check: `node scripts/check-intentos.mjs`.
- Generated smoke: init `/tmp/intentos-1-test` and run generated core check.
- Update smoke: `node scripts/cli.mjs update --target /tmp/intentos-1-test --dry-run`.
- Migration smoke: `node scripts/cli.mjs migrate --target /tmp/intentos-1-test --from 0.33.0 --to 1.0.0 --dry-run`.
- Workflow: task-scoped workflow artifact, review loop, next-step, goal, and subagent checks.

## Rollback Notes

Revert 1.0 release evidence, version metadata, self-check release-evidence rules, templates, manifest
updates, and workflow artifacts in one commit.

## Open Questions

- Which real project should supply the first adoption evidence after 1.0 minimum release?
