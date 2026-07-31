---
schema_version: 1.0
artifact_type: preflight
number: 242
slug: native-authority-source-boundary
title: "native authority source boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
request: requests/242-native-authority-source-boundary.md
task_level: L2
---
# Preflight: 242-native-authority-source-boundary

## Source Request

`requests/242-native-authority-source-boundary.md`

## Clarity

READY

## Problem Summary

Source-only adoption lacks an authority-source boundary. It over-collects
IntentOS-owned files and under-parses real project baseline content, producing
a fail-closed result for the wrong evidence.

## Missing Information

- None. The branch authority, target path, dirty-worktree constraint, and real
  failing evidence are available.

## Assumptions

- The authoritative source manifest may prove distribution mappings.
- A target version digest proves prior managed ownership only when the current
  digest and declared workflow path both match.
- IntentOS workflow record directories are evidence containers, not active
  native governance sources.

## Direction Risks

- Excluding by filename or target manifest declaration alone could hide
  customized project authority.
- Treating low-signal project rules as harmless could silently omit constraints.
- Broad extractor changes could alter CI YAML or ordinary Markdown behavior.

## Over-design Risks

- Do not redesign the migration or reconciliation schemas.
- Do not auto-replace unknown project rules.
- Do not repair Pawcode artifacts in this source task.

## MVP Recommendation

Add one evidence-backed source partition, parse simple tables under governance
context, classify substantive text under governance headings, and treat
deterministically recognized sentinel-only declarations as resolved
non-rules for reconciliation coverage.

## Non-goals

- No Pawcode writes or adoption apply.
- No new dependencies, CI/hooks, release, or production behavior.
- No archive/delete of historical records.
- No weakening of blocking behavior for unclosed fences, skipped tables, or
  genuinely unclassified content.

## Domain Model Draft

- `native authority source`: project-owned candidate or proven IntentOS-owned
  artifact.
- `source boundary evidence`: verified version digest, exact source-distribution
  match, or authoritative workflow-record directory membership.
- `resolved non-rule`: exact sentinel-only declaration retained in coverage.

## Permission / Security Risks

- Governance authority is safety-sensitive: false exclusion can hide a project
  rule. Every exclusion therefore needs deterministic evidence and drift must
  remain project-owned.

## First Vertical Slice

```text
source manifest + target evidence -> authority partition -> rule extraction ->
reconciliation coverage -> read-only Pawcode assurance
```

## Suggested Specs

- `specs/242-native-authority-source-boundary.md`

## Suggested Task Level

L2

## Decision

READY_FOR_SPEC

## Rationale

The defect is reproducible, the safe ownership proofs already exist, target
writes are forbidden, and acceptance can be tested with fixtures plus the real
Pawcode read-only chain.
