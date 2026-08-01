---
schema_version: 1.0
artifact_type: spec
number: 249
slug: node-22-supported-runtime-boundary
title: "node 22 supported runtime boundary"
status: ready
created_at: 2026-08-01
intentos_version: 1.113.0
request: requests/249-node-22-supported-runtime-boundary.md
preflight: preflight/249-node-22-supported-runtime-boundary.md
---
# Spec 249: node 22 supported runtime boundary

## Status

Ready

## Source

- Request: `requests/249-node-22-supported-runtime-boundary.md`
- Preflight: `preflight/249-node-22-supported-runtime-boundary.md`

## Problem

IntentOS CI 与最终可信源码自检使用 Node 22，但 `package.json` 和公开文档声明 Node `>=22`，把未完成完整兼容性验收的 Node 23 误列入正式支持范围。

## User Story

As a source user or maintainer,
I want the declared Node support boundary to match the runtime used for formal verification,
so that an unverified newer major is not mistaken for a stable supported environment.

## Scope

Included:

- Change the package engine range from `>=22` to `>=22 <23`.
- Describe the prerequisite as Node 22.x in the English, Chinese, source-only, maintainer, and contributor entry points.
- Make the source self-check require the exact supported range.
- Verify the unchanged source candidate under Node 22.22.3.

## Non-goals

- No Node 23 shutdown/deadlock repair or checker-DAG redesign.
- No change to GitHub workflows, dependencies, source-only adoption, controlled apply, receipts, target projects, releases, or production.

## Data Model Impact

No application data model changes. The package runtime compatibility contract changes from open-ended Node 22+ to the bounded Node 22 major line.

## API / Interface Contract

### Source runtime compatibility

Input:

```json
{ "nodeMajor": 22 }
```

Output:

```json
{ "supported": true, "engineRange": ">=22 <23" }
```

Errors:

- Node major below 22 or at/above 23 is outside the supported range.
- This contract does not prevent diagnostic experimentation; it prevents unsupported majors from being represented as formally verified.

## UI States

- Not applicable; no UI changes.

## Permission Rules

- No permission behavior changes.

## Observability

- Logs: existing self-check PASS/FAIL line for the package engine.
- Metrics: not applicable.
- Audit events: Task 249 evidence and Git commit history.

## Acceptance Criteria

- `package.json` declares `>=22 <23` and npm-compatible tooling can identify Node 23 as unsupported.
- Public English and Chinese entry points state Node 22.x.
- Source-only, contributor, and maintainer documentation state the same supported verification boundary.
- The self-check fails if the package engine drifts from `>=22 <23`.
- Existing CI remains pinned to Node 22.
- Targeted checks and the full source self-check pass with Node 22.22.3.
- Task 248 source-only adoption behavior is unchanged.

## Test Plan

- Unit: syntax-check the modified self-check module and inspect its engine assertion.
- Integration: run manifest and workflow-artifact checks plus the full source self-check with Node 22.22.3.
- E2E: rely on the already completed Task 248 remote-clone external-project simulation; this task does not alter that behavior.
- Manual: confirm CI workflows still use Node 22 and no Node 23 support claim remains on active entry surfaces.

## Rollback Notes

Revert the bounded Task 249 commit. This restores the previous open-ended support declaration but does not affect external projects or Task 248 implementation.

## Open Questions

- None.
