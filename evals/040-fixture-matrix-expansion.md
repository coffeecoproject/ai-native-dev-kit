---
schema_version: 1.0
artifact_type: eval
number: "040"
slug: fixture-matrix-expansion
title: Fixture Matrix Expansion
status: ready
created_at: "2026-06-26"
devkit_version: 0.40.0
spec: specs/040-fixture-matrix-expansion.md
---
# Eval: Fixture Matrix Expansion

## Related Spec

Spec: `specs/040-fixture-matrix-expansion.md`

## Must Pass

- Fixture runner syntax passes.
- Fixture matrix passes.
- Manifest check passes.
- Dev-kit self-check passes.

## Spec Alignment

- Typed fixture areas exist.
- Fixture cases carry type, checker, expected output, and repair guidance.
- Runner supports bounded temporary setup without changing checker semantics.

## Permission / Data Checks

- No network access required.
- No secrets or production config touched.
- Temporary projects are created only under temp directories and removed by the runner.

## Manual Review Checklist

- Verify the fixture matrix did not become harder to read.
- Verify generated-project setup does not commit generated project snapshots.
- Verify `check-dev-kit.mjs` is not used as a fixture case.

## Reject Conditions

- Production checker behavior changes just to satisfy new fixtures.
- Fixture runner recursively runs the full dev-kit self-check.
- Generated target project files are committed as fixture snapshots.

## Required Evidence

Syntax checks: `node --check scripts/check-fixtures.mjs`

Fixture matrix: `node scripts/check-fixtures.mjs`

Manifest: `node scripts/check-manifest.mjs`

Self-check: `node scripts/check-dev-kit.mjs`
