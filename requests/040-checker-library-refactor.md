---
schema_version: 1.0
artifact_type: request
number: "040"
slug: checker-library-refactor
title: Checker Library Refactor
status: ready
created_at: "2026-06-27"
devkit_version: 0.40.1
priority: P1
task_level: L2
---
# Request: 040-checker-library-refactor

## Raw Request

Start Productization Hardcut phase `0.40.1` after `0.40.0` fixture matrix expansion. Reduce repeated checker plumbing through shared libraries while preserving existing checker behavior and output.

## User / Customer

Repository maintainer and future Codex users who need the dev-kit scripts to stay maintainable as the checker count grows.

## Problem

Multiple checker scripts duplicate the same `parseArgs`, Markdown section extraction, and recursive file walking logic. This makes future changes more error-prone because a small behavior fix must be repeated across many scripts.

## Current Workflow

Maintainers currently update each checker script directly. The `0.40.0` fixture matrix protects behavior, but internal checker utilities are still copied in many places.

## Desired Outcome

Add shared checker libraries and migrate covered scripts so duplicated plumbing is reduced without changing checker semantics, command output, target project requirements, or workflow gates.

## Constraints

- Keep all changes inside dev-kit source, docs, scripts, manifests, and phase evidence.
- Do not add runtime dependencies.
- Do not change checker pass/fail semantics unless explicitly documented and covered by fixture expectation changes.
- Do not implement migration command behavior.
- Do not change generated project structure except copying the new shared script libraries through existing manifest-driven asset flow.

## Priority

P1

## Suggested Task Level

L2

## Deadline

No external deadline. This phase should land before `0.41.0` so later industrial pack and license work builds on cleaner checker internals.

## Notes

The previous phase intentionally stopped before checker refactoring. This request starts that deferred work now that fixture coverage exists.
