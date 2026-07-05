---
schema_version: 1.0
artifact_type: preflight
number: "040"
slug: fixture-matrix-expansion
title: Fixture Matrix Expansion
status: ready
created_at: "2026-06-26"
intentos_version: 0.40.0
request: requests/040-fixture-matrix-expansion.md
task_level: L2
---
# Preflight Report: Fixture Matrix Expansion

## Source Request

Request: `requests/040-fixture-matrix-expansion.md`

## Clarity

READY

## Problem Summary

The fixture system needs a matrix shape and clearer diagnostics so checker behavior can be protected before internal refactoring.

## Missing Information

- None blocking.

## Assumptions

- Existing checker behavior is the source of truth.
- Generated-project fixture setup is acceptable as runner plumbing.
- `check-intentos.mjs` remains the full self-check and is not invoked as a fixture case to avoid recursion.

## Direction Risks

- Over-expanding fixtures into generated target-project snapshots would make maintenance worse.
- Changing checker behavior during fixture expansion would invalidate the purpose of the phase.

## Over-design Risks

- A full fixture DSL is unnecessary.
- Source-code scanning is outside the productization scope.

## MVP Recommendation

Add typed fixture cases, lightweight generated-project setup, migration setup, clearer failure output, and source inventory updates.

## Non-goals

- No checker library refactor.
- No static-analysis product.
- No generated project snapshot committed to `test-fixtures/`.

## Domain Model Draft

- Fixture case: one command, expected status, expected output, and repair guidance.
- Fixture type: golden, bad, migration, CLI, init/update, or output-quality.
- Fixture setup: bounded temporary project or temporary manifest input.

## Permission / Security Risks

No credentials, production config, network calls, or real project code are used.

## First Vertical Slice

Run `node scripts/check-fixtures.mjs` and get typed coverage summary with all expected cases passing.

## Suggested Specs

Spec: `specs/040-fixture-matrix-expansion.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

This is bounded productization work and has clear acceptance checks.
