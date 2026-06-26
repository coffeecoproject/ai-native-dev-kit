# Preflight: CLI Front Door

## Source Request

Request: `requests/036-cli-front-door.md`

## Clarity

READY

## Problem Summary

The repository needs a stable human-facing CLI entry point, but that CLI must stay a thin facade over existing scripts and avoid changing target-project behavior.

## Missing Information

- Public package publishing name and distribution policy are intentionally deferred.
- Migration command behavior is intentionally deferred to a later phase.
- Manifest authority remains intentionally deferred to `0.37.0`.

## Assumptions

- Existing scripts remain the source of runtime behavior.
- CLI can delegate to existing scripts without duplicating checker logic.
- Dry-run output is enough for self-check to verify recursive commands like `self-check`.
- A decision brief is appropriate because package metadata could be mistaken for publish approval.

## Direction Risks

- CLI could become a second implementation of checker or init/update rules.
- CLI could hide `workflow-next` stop conditions.
- Users could mistake package metadata for public package distribution.
- `migrate` could look available before migration is designed.

## Over-design Risks

- Adding dependencies or a command framework is not needed for this phase.
- Implementing install, publish, migration, or init/update plan behavior would exceed scope.
- Making manifest command registry authoritative would exceed the read-only manifest phase.

## MVP Recommendation

Add `package.json`, add `scripts/cli.mjs`, route commands to existing scripts, print underlying commands for writes, support dry-run, keep `migrate` planned-only, and add self-check coverage.

## Non-goals

- No package publishing.
- No dependency addition.
- No manifest authority.
- No migration implementation.
- No init/update safety plan behavior.
- No target-project bootstrap semantic change.

## Domain Model Draft

- CLI facade: user-facing command router.
- Command registry: local mapping from CLI commands to existing scripts.
- Dry-run: command display without execution.
- Write-command display: explicit underlying command before file writes.
- Planned command: visible future command that exits without pretending to work.

## Permission / Security Risks

No secrets, auth, permissions, production configuration, data migration, destructive operation, value transfer, or dependency addition are touched.

## First Vertical Slice

Create `scripts/cli.mjs`, run CLI help and route checks, initialize a generic target project through the CLI, and verify that target project with core workflow check.

## Suggested Specs

Spec: `specs/036-cli-front-door.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The scope is bounded, locally verifiable, and does not require changing generated-project behavior or making the manifest authoritative.
