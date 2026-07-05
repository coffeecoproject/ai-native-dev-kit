---
schema_version: 1.0
artifact_type: spec
number: 042
slug: docs-ia-migration-command
title: "docs ia migration command"
status: ready
created_at: 2026-06-27
intentos_version: 0.41.0
request: requests/042-docs-ia-migration-command.md
preflight: preflight/042-docs-ia-migration-command.md
---
# Spec 042: docs ia migration command

## Status

Ready

## Source

- Request: `requests/042-docs-ia-migration-command.md`
- Preflight: `preflight/042-docs-ia-migration-command.md`

## Problem

The IntentOS needs a shorter first-entry path and a safe migration command. Users should not need to
read a long README before choosing new project, existing light project, governed read-only project,
or production adapter adoption. The migrate command must be useful without being dangerous.

## User Story

As a user, I want a short README and clear playbooks so that I can choose the right path quickly.

As a maintainer, I want complete references outside README so that product depth is preserved.

As a Codex operator, I want `intentos migrate` to generate a dry-run or migration plan so that old
projects can be assessed without mutating them.

## Scope

Included:

- Slim README into a 3-minute entry that links to complete references.
- Add operator manual, reference docs, adoption playbooks, migration docs, troubleshooting, and FAQ.
- Add a non-mutating migration command and CLI route.
- Add self-check coverage for migration dry-run/write-plan/no-direct-write safety.
- Update manifest, version, roadmap, release evidence, and workflow artifacts.

## Non-goals

- Do not implement apply migration.
- Do not mutate target projects from migrate.
- Do not add source-code migration or language-specific migration.
- Do not add new workflow concepts.
- Do not change license terms.

## Data Model Impact

New or changed entities:

- Migration plan JSON:
  - `schemaVersion`
  - `command`
  - `fromVersion`
  - `toVersion`
  - `target`
  - `generatedAt`
  - `state`
  - `signals`
  - `actions`
  - `humanDecisions`
  - `blockedApply`
  - `nextCommand`

## API / Interface Contract

### `intentos migrate`

Input:

```text
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --dry-run
node scripts/cli.mjs migrate --target ../project --from 0.33.0 --to 1.0.0 --write-plan migration-plan.json
```

Output:

```json
{
  "schemaVersion": "1.0",
  "command": "migrate",
  "fromVersion": "0.33.0",
  "toVersion": "1.0.0",
  "blockedApply": true,
  "actions": []
}
```

Errors:

- Missing `--target`.
- Missing `--from` or `--to`.
- Unsupported version range.
- No `--dry-run` and no `--write-plan`.
- Both `--dry-run` and `--write-plan` supplied.
- Unsafe plan path.

## UI States

- Not applicable. This is CLI and documentation work.

## Permission Rules

- `migrate` may read target project files.
- `migrate --dry-run` must not write.
- `migrate --write-plan` may write only the requested plan file.
- `migrate` must never apply changes to target project files in this phase.

## Observability

- Logs: CLI stdout/stderr.
- Metrics: number of planned actions and human decisions in plan JSON.
- Audit events: release report, review loop report, final report.

## Acceptance Criteria

- README answers what this is, when to use it, path choice, smallest command, and what not to do in
  about 3 minutes.
- README links to all full references.
- Target docs listed in the roadmap exist.
- Migration docs list added assets, removed assets, renamed assets, CI impact, AGENTS impact, PR
  template impact, human approvals, and rollback.
- `intentos migrate --dry-run` prints a migration plan without writing.
- `intentos migrate --write-plan <file>` writes a migration plan JSON and does not mutate target.
- `intentos migrate` without dry-run or write-plan fails.
- Existing self-check passes.

## Test Plan

- Unit: `node --check scripts/cli.mjs` and `node --check scripts/migrate-project.mjs`.
- CLI: migrate missing safety flag fails.
- CLI: migrate dry-run succeeds and prints JSON.
- CLI: migrate write-plan creates a JSON plan.
- Integration: `node scripts/check-manifest.mjs .`.
- Integration: `node scripts/check-intentos.mjs`.
- Workflow: implementation artifact, review loop, goal, subagent, and next-step checks.

## Rollback Notes

Revert migrate command, CLI route, docs IA files, manifest/version/readme updates, release evidence,
and workflow artifacts in one commit.

## Open Questions

- Apply migration remains intentionally out of scope until a later decision.
