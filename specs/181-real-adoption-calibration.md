---
schema_version: 1.0
artifact_type: spec
number: 181
slug: real-adoption-calibration
title: Real Adoption Calibration
request: requests/181-real-adoption-calibration.md
preflight: preflight/181-real-adoption-calibration.md
status: done
created_at: 2026-06-27
---
# Spec 181: Real Adoption Calibration

## Status

Done

## Source

- Request: `requests/181-real-adoption-calibration.md`
- Preflight: `preflight/181-real-adoption-calibration.md`

## Problem

1.8 correctly introduced read-only real-project adoption and patch classification, but review found small calibration gaps in terminology, false-positive handling, and command usage expectations.

## User Story

As a Dev Kit user applying 1.8 to real projects,
I want profile recommendations, risk packs, and patch false positives to be clearly separated,
so Codex does not confuse project setup, risk overlays, or implementation approval.

## Scope

Included:

- Governance map wording calibration.
- Patch classification false-positive template, directory, source record, and bad fixture.
- Patch classification checker false-positive validation.
- Real adoption usage doc and reference updates.
- 1.8.1 version and release evidence.

## Non-goals

- Automatic real-project scanner.
- Target project writes.
- Implementation approval from false-positive reports.

## Data Model Impact

New workflow artifact directory:

- `patch-classification-false-positives/`

New template:

- `templates/patch-classification-false-positive.md`

No runtime product data model change.

## API / Interface Contract

`scripts/check-patch-classification.mjs` continues to accept:

```json
{
  "target": "project root",
  "flags": ["--json"]
}
```

The checker now also validates optional false-positive records when `patch-classification-false-positives/` exists.

## UI States

Not applicable.

## Permission Rules

- False-positive records do not authorize implementation.
- False-positive records cannot accept real high-risk API, permission, DB, environment, release, CI, or gate impact as safe.
- `real-adoption` remains a recorded-report checker, not an automatic target-project report generator.

## Observability

- Checker output records false-positive validation results.
- Fixture matrix records rejection of unsafe false-positive acceptance.
- Release evidence records boundaries and limitations.

## Acceptance Criteria

- `high-risk-change` is no longer mixed into source-level Recommended Profiles.
- False-positive reports are checked and cannot accept real high-risk impact.
- Docs state `real-adoption` checks recorded reports, not auto-generated reports.
- Full dev-kit self-check passes.

## Test Plan

- `node scripts/check-patch-classification.mjs .`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-manifest.mjs`
- `node scripts/check-dev-kit.mjs`
- `git diff --check`

## Rollback Notes

Revert 1.8.1 files, manifest entries, version changes, and checker false-positive validation if this calibration proves confusing or too heavy.
