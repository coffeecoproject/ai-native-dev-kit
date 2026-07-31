---
schema_version: 1.0
artifact_type: preflight
number: 243
slug: source-repository-platform-gate-boundary
title: "source repository platform gate boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
request: requests/243-source-repository-platform-gate-boundary.md
task_level: L1
---
# Preflight: 243-source-repository-platform-gate-boundary

## Source Request

`requests/243-source-repository-platform-gate-boundary.md`

## Clarity

READY

## Problem Summary

The target-application platform gate is incorrectly applied to the IntentOS
source distribution and makes its own L2 governance path self-blocking.

## Missing Information

- None; authoritative source identity is already defined by manifest mode,
  compatibility authority, package name, and source-only files.

## Assumptions

- Only the authoritative source checkout is exempt from target platform selection.
- All non-platform workflow gates still apply.

## Direction Risks

- Weak source detection could let an ordinary project bypass platform gates.

## Over-design Risks

- Do not change platform inference or target-project baseline requirements.

## MVP Recommendation

Reuse strict source-checkout identity at the workflow-artifact implementation
gate and add positive/negative regression coverage.

## Non-goals

- No changes to target platform resolver, profiles, packs, CI, or dependencies.

## Domain Model Draft

- `authoritative source checkout`: source manifest is authoritative, package is
  `intentos`, and source core files exist.

## Permission / Security Risks

- A false positive would weaken a target-project gate; tests must prove near
  misses do not bypass it.

## First Vertical Slice

```text
implementation task -> strict source identity -> source-only exemption or
unchanged target platform gate -> remaining workflow checks
```

## Suggested Specs

- `specs/243-source-repository-platform-gate-boundary.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The change is narrow, locally reversible, and testable without external facts.
