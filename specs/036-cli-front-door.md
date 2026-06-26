# Spec: CLI Front Door

## Status

Ready

## Source

Request: `requests/036-cli-front-door.md`

Preflight: `preflight/036-cli-front-door.md`

Productization plan: `docs/productization-hardcut-1.0-plan.md`

Decision brief: `decision-briefs/036-cli-front-door.md`

## Problem

The dev kit needs a stable human-facing CLI before later phases make manifest assets authoritative, add safer init/update plans, and introduce migration behavior.

## User Story

As a maintainer or project adopter, I want one `ai-native` entry point so I can initialize, update, inspect, check, and self-check the workflow without memorizing every lower-level script.

## Scope

Included:

- Add `package.json`.
- Add `scripts/cli.mjs`.
- Add CLI help, version, dry-run, command routing, and write-command display.
- Add package scripts for `check`, `self-check`, `fixtures`, and `smoke:init`.
- Update README guidance to prefer CLI for human usage.
- Keep direct `scripts/*.mjs` references documented as lower-level commands.
- Add CLI behavior checks to `scripts/check-dev-kit.mjs`.
- Update version metadata to `0.36.0`.
- Add `0.36.0` workflow artifacts and phase release evidence.

Excluded:

- npm publishing.
- dependency installation.
- manifest authority.
- migration command implementation.
- init/update dry-run, plan, backup, or apply-plan behavior.
- artifact frontmatter or schema enforcement.
- target-project bootstrap semantic changes.
- license rewrite.

## Non-goals

The CLI is not a second workflow engine. It is a stable command facade over existing scripts.

## Data Model Impact

Adds package metadata and a CLI command registry in `scripts/cli.mjs`. The manifest remains read-only and is used only for display metadata.

## API / Interface Contract

Adds:

```bash
node scripts/cli.mjs --help
node scripts/cli.mjs --version
node scripts/cli.mjs init --starter generic-project --target <project>
node scripts/cli.mjs update --target <project>
node scripts/cli.mjs next <project>
node scripts/cli.mjs check <project> --mode core
node scripts/cli.mjs doctor <project>
node scripts/cli.mjs new <args>
node scripts/cli.mjs fixtures
node scripts/cli.mjs self-check
```

`migrate` is listed as planned-only and exits without modifying files.

## Permission Rules

- Write commands must print the underlying command before execution.
- Dry-run must print commands without running them.
- CLI must not grant release, migration, production, or risk approval.
- CLI must not bypass lower-level script failures.

## UI States

Not applicable as a visual interface. CLI states are help output, version output, dry-run output, delegated command output, planned-only command output, and failure output from lower-level scripts.

## Observability

CLI help, dry-run output, self-check output, and `releases/0.36.0/phase-report.md` provide observability.

## Acceptance Criteria

- `node scripts/cli.mjs --help` lists all phase commands and lower-level script guidance.
- `node scripts/cli.mjs --version` matches `VERSION.md`.
- `node scripts/cli.mjs next .` delegates to `workflow-next`.
- `node scripts/cli.mjs fixtures` delegates to fixture checks.
- `node scripts/cli.mjs self-check --dry-run` maps to `scripts/check-dev-kit.mjs`.
- `node scripts/cli.mjs init --starter generic-project --target /tmp/ai-native-cli-test` initializes a project that passes core workflow check.
- `scripts/check-dev-kit.mjs` covers CLI behavior.
- README and Chinese README explain the CLI in plain language.

## Test Plan

- Run `git diff --check`.
- Run recursive script syntax check.
- Run CLI help, version, next, fixtures, self-check dry-run, update dry-run, doctor dry-run, and init smoke.
- Run task-scoped workflow artifact, goal mode, subagent orchestration, review loop, next-step boundary, and output quality checks.
- Run `node scripts/check-manifest.mjs`.
- Run `node scripts/check-fixtures.mjs`.
- Run `node scripts/check-dev-kit.mjs`.

## Rollback Notes

Remove `package.json`, `scripts/cli.mjs`, `0.36.0` phase artifacts, README CLI guidance, CLI checks in `scripts/check-dev-kit.mjs`, and revert version metadata from `0.36.0` to `0.35.0`.
