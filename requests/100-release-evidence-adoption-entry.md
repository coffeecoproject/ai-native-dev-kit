---
schema_version: 1.0
artifact_type: request
number: 100
slug: release-evidence-adoption-entry
title: "release evidence adoption entry"
status: ready
created_at: 2026-06-27
intentos_version: 0.42.0
priority: P0
task_level: L3
---
# Request: 100-release-evidence-adoption-entry

## Raw Request

Continue from Productization Hardcut `0.42.0` into `1.0.0`: Release Evidence + Adoption Entry Criteria.

## User / Customer

IntentOS users, maintainers, and Codex operators who need a clear 1.0 release boundary and adoption evidence standard.

## Problem

The productization phases are implemented, but the repository still needs durable 1.0 release evidence and explicit adoption entry criteria before it can be treated as a 1.0 minimum release.

## Current Workflow

The roadmap lists required release evidence assets, but they do not yet exist for `1.0.0`.

## Desired Outcome

- Record 1.0 release evidence.
- Add adoption evidence and productization trial templates.
- Make clear that 1.0 minimum release is not a 10/10 real-project evidence release.
- Update version metadata to `1.0.0`.
- Keep migration apply, industrial pack promotion, package publishing, and external automation out of scope.

## Constraints

- Do not claim 10/10 real-project validation.
- Do not promote industrial packs.
- Do not implement migration apply.
- Do not add dependencies.
- Do not publish a package.
- Do not change license terms.

## Priority

P0

## Suggested Task Level

L3

## Deadline

Current productization continuation.

## Notes

This task is evidence and release-boundary work, not a new governance layer.
