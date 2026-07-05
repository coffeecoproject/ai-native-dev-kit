# 1.61.0 Release Path Hardening Plan

## Goal

1.61 hardens the 1.58-1.60 release path without adding another release subsystem.

The goal is to keep the user path simple:

```text
help me launch
  -> Release Guide
  -> Platform Release Recipe
  -> Release Handoff Pack
  -> Release Execution Plan, only when handoff is ready
```

## Problem

1.60 correctly introduced Release Handoff Packs, but two risks remain:

- Release Handoff and Release Execution can both look like the source of release owner, rollback, monitoring, stop-condition, and evidence truth.
- Release evidence is still mostly Markdown quality, not structured enough to prove it belongs to the handoff package.

## Non-goals

1.61 does not:

- add provider API integration
- add deployment execution
- install hooks or CI gates
- make Codex the release owner
- approve release or production
- execute preview, staging, production, app-store, mini-program, migration, DNS, payment, permission, or production-config actions
- require users to learn lower-level release commands

## Design

### 1. Handoff / Execution Boundary

Release Handoff Pack becomes the release-package source of truth.

```text
Release Handoff Pack = selected recipe + structured approval + release owner + evidence + ownership boundaries
Release Execution Plan = optional plan-only consumer of the handoff package
```

Release Execution must not redefine owner, rollback, monitoring, or high-risk executor facts when a handoff pack exists.

### 2. Structured Release Evidence

Add `schemas/artifacts/release-handoff-evidence.schema.json`.

Strict handoff evidence covers:

- selected pack and recipe
- structured approval
- release owner
- rollback path / owner / restoration condition
- monitoring path / owner / signal type
- post-release smoke target / owner / read-only proof
- handoff/execution boundary

Markdown remains compatible by default. `--require-structured-evidence` is strict mode.

### 3. Lazy Release Guide Routing

Release Guide should not generate a blocked handoff pack too early.

If adapter, recipe, launch review, approval, or release evidence is not ready, Release Guide should show:

```text
Release Handoff Pack: DEFERRED
```

It should explain what is missing and only bridge into `release-handoff` after prerequisites are ready.

### 4. Safer User Language

`READY_FOR_HANDOFF_REVIEW` must always mean:

```text
Ready for handoff review, not release approval.
```

The human-facing text must not imply that a release is approved or ready to run.

## Implementation Scope

- Update Release Handoff Pack docs and template.
- Update Release Execution docs to consume handoff truth.
- Add structured release handoff evidence schema.
- Add Machine-Readable Evidence to generated handoff packs.
- Add strict structured evidence checks to `check-release-handoff-pack.mjs`.
- Update `release-guide` lazy routing and output language.
- Update examples and bad fixtures.
- Update README, VERSION, package, manifest, and release evidence.
- Update `check-intentos` coverage.

## Acceptance

1. `release-guide` default output defers handoff when prerequisites are missing.
2. `release-handoff` ready output says ready for handoff review, not release approval.
3. Strict example handoff packs pass `--require-structured-evidence`.
4. A handoff pack without Machine-Readable Evidence fails strict mode.
5. A handoff pack whose structured boundary says execution redefines owner/evidence fails.
6. `npm run verify` passes.
