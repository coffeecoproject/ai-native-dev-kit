# Spec: Init/Update Safety

## Status

Ready

## Source

Request: `requests/038-init-update-safety.md`

Preflight: `preflight/038-init-update-safety.md`

Productization plan: `docs/plans/productization-hardcut-1.0-plan.md`

Decision brief: `decision-briefs/038-init-update-safety.md`

## Problem

Init/update can write many workflow assets into target projects, but old or governed projects need a reviewable plan before writes happen.

## User Story

As a maintainer or adopter, I want Codex to preview, save, validate, and apply workflow setup plans so existing projects can adopt IntentOS governance without silent mutation.

## Scope

Included:

- Add `--dry-run` to print an init/update plan without writing target files.
- Add `--write-plan <file>` to persist an init/update plan.
- Add `--apply-plan <file>` to apply a previously generated plan.
- Add `--backup-dir <dir>` to preserve overwritten managed assets.
- Add plan fingerprint validation for target existence, git state, dirty summary, and relevant file hashes.
- Block direct update for dirty or unbootstrapped existing projects.
- Update CLI dry-run behavior so command-level `init/update --dry-run` reaches init/update plan preview.
- Add intentos self-check coverage.
- Update version metadata to `0.38.0`.
- Add `0.38.0` workflow artifacts and release evidence.

Excluded:

- Migration command implementation.
- Artifact frontmatter or schema enforcement.
- Source-code scanning gate.
- External GPT/API reviewer automation.
- Package publishing.
- License rewrite.
- PR template or AGENTS governance approval behavior changes.
- Industrial pack concrete selection behavior changes.

## Non-goals

This phase does not create a migration product. It only makes init/update previewable, reviewable, validated, and recoverable.

## Data Model Impact

Init/update plan JSON is introduced with `planVersion`, `intentOSVersion`, `manifestVersion`, `operation`, `targetRoot`, `arguments`, `targetFingerprint`, `expectedPreconditions`, and `actions`.

## API / Interface Contract

New or changed command interfaces:

```bash
node scripts/init-project.mjs --target <project> --dry-run
node scripts/init-project.mjs --target <project> --write-plan <plan.json>
node scripts/init-project.mjs --apply-plan <plan.json>
node scripts/init-project.mjs --apply-plan <plan.json> --backup-dir <dir>
node scripts/cli.mjs --dry-run update --target <project>
node scripts/cli.mjs update --target <project> --dry-run
```

Plan actions use:

```text
CREATE
SKIP_EXISTING
UPDATE_MANAGED
NEEDS_HUMAN_APPROVAL
WRITE_MIGRATION_REPORT
BACKUP_THEN_UPDATE
FORBIDDEN
```

## Permission Rules

- Direct update must stop for dirty or unbootstrapped existing projects.
- Plan generation is not approval to apply PR template or AGENTS governance migrations.
- `FORBIDDEN` plan actions cannot be applied.
- Apply-plan must fail before writes if target preconditions changed.

## UI States

Not applicable as a visual interface. CLI/script states are plan preview, plan written, plan applied, plan rejected, direct update blocked, and update completed.

## Observability

`scripts/check-intentos.mjs`, generated target files, plan JSON, backup files, and `releases/0.38.0/phase-report.md` provide observability.

## Acceptance Criteria

- Dry-run does not create target files.
- Write-plan creates the plan and does not mutate the target.
- Apply-plan initializes or updates from the plan.
- Apply-plan fails when target fingerprint changes after plan creation.
- Backup-dir preserves overwritten managed assets.
- Legacy existing projects require plan-first update.
- Already bootstrapped generated projects can still update directly.
- Version metadata and manifest source-required entries match `0.38.0`.

## Test Plan

- Run `git diff --check`.
- Run recursive script syntax check.
- Run `node scripts/check-manifest.mjs`.
- Run task-scoped workflow artifact, goal mode, subagent orchestration, review loop, next-step boundary, and output quality checks.
- Run `node scripts/check-fixtures.mjs`.
- Run `node scripts/check-intentos.mjs`.

## Rollback Notes

Revert `scripts/init-project.mjs`, `scripts/cli.mjs`, and `scripts/check-intentos.mjs` to the `0.37.0` direct init/update behavior, remove `0.38.0` phase artifacts, and revert version metadata to `0.37.0`.
