---
schema_version: 1.0
artifact_type: request
number: "040"
slug: fixture-matrix-expansion
title: Fixture Matrix Expansion
status: ready
created_at: "2026-06-26"
intentos_version: 0.40.0
priority: P1
task_level: L2
---
# Request Card: Fixture Matrix Expansion

## Raw Request

Execute Productization Hardcut phase `0.40.0` by expanding the intentos fixture matrix before checker refactoring.

## User / Customer

IntentOS maintainers and future project adopters.

## Problem

Checker behavior is now broad enough that future refactoring needs a clearer fixture matrix. Existing fixtures are useful but are not grouped by golden, bad, migration, CLI, init/update, and output-quality case types.

## Desired Outcome

Fixture coverage is easier to inspect, debug, and extend before `0.40.1` checker library refactoring starts.

## Constraints

- Do not change production checker semantics to satisfy fixtures.
- Do not start checker library refactoring.
- Do not add external dependencies.
- Do not copy generated target projects into the repository.

## Priority

P1

## Suggested Task Level

L2
