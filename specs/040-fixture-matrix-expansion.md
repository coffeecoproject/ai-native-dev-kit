---
schema_version: 1.0
artifact_type: spec
number: "040"
slug: fixture-matrix-expansion
title: Fixture Matrix Expansion
status: ready
created_at: "2026-06-26"
devkit_version: 0.40.0
request: requests/040-fixture-matrix-expansion.md
preflight: preflight/040-fixture-matrix-expansion.md
---
# Spec: Fixture Matrix Expansion

## Status

Ready

## Source

Request: `requests/040-fixture-matrix-expansion.md`

Preflight: `preflight/040-fixture-matrix-expansion.md`

## Problem

The dev-kit has many checkers, but fixture coverage is still harder to reason about than the product surface. Before checker internals are refactored, fixture coverage needs to be explicit, typed, and easier to diagnose.

## User Story

As a dev-kit maintainer, I want fixture cases grouped by purpose and reported with clear expectations so I can refactor checker internals later without accidentally changing behavior.

## Scope

Included:

- Organize `test-fixtures/` into typed fixture areas.
- Expand `fixture-cases.json` with case type, checker, expected output, and repair guidance.
- Add generated-project setup support for target-project checkers.
- Add migration setup support for manifest version mismatch.
- Add migration fixtures for artifact frontmatter and workflow version behavior.
- Update source inventory and version metadata.

Excluded:

- No checker library refactor.
- No production checker semantic change.
- No source-code scanning.
- No generated target-project snapshot committed to the repository.

## Non-goals

- Do not make strict schema default.
- Do not implement the migration CLI command.
- Do not change industrial pack maturity.

## Data Model Impact

`fixture-cases.json` gains explicit metadata:

- `type`
- `checker`
- `setup`
- `expectStatus`
- expected output fields
- `howToFix`

## API / Interface Contract

`node scripts/check-fixtures.mjs` remains the primary command.

Supported behavior:

- `--case <name>` still runs one case.
- `--json` includes matrix summaries.
- default output lists pass/fail rows and coverage summaries.

## UI States

Command-line output must remain readable:

- pass rows show type and checker
- failure output includes command, expected output, actual output, and repair guidance
- success output includes coverage by type and checker

## Permission Rules

The fixture runner may create temporary directories under the OS temp directory and must clean them up.

## Observability

Verification evidence is captured in `final-reports/040-fixture-matrix-expansion.md` and `releases/0.40.0/phase-report.md`.

## Acceptance Criteria

- Fixture directories exist for golden, bad, migrations, CLI, init/update, and output-quality.
- Existing bad fixtures are moved under `test-fixtures/bad/`.
- Fixture registry includes typed cases and repair guidance.
- Fixture runner validates typed metadata.
- Fixture runner reports type/checker coverage.
- Migration cases cover frontmatter warning, workflow version mismatch, manifest version mismatch, and BL2 skip behavior.
- CLI/init-update cases cover user-facing command entry points.
- `node scripts/check-fixtures.mjs` passes.
- `node scripts/check-dev-kit.mjs` passes.

## Test Plan

- Syntax-check changed scripts.
- Run fixture suite.
- Run manifest check.
- Run workflow artifact, Goal Mode, Subagent Orchestration, Review Loop, Next-Step, output quality, and full dev-kit checks.

## Rollback Notes

Rollback by reverting fixture directory movement, fixture registry changes, runner setup/reporting changes, source inventory updates, and `0.40.0` phase artifacts.
