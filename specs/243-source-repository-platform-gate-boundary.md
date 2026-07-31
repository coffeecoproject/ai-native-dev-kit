---
schema_version: 1.0
artifact_type: spec
number: 243
slug: source-repository-platform-gate-boundary
title: "source repository platform gate boundary"
status: draft
created_at: 2026-07-31
intentos_version: 1.113.0
request: requests/243-source-repository-platform-gate-boundary.md
---
# Spec 243: source repository platform gate boundary

## Status

Ready

## Source

- Request: `requests/243-source-repository-platform-gate-boundary.md`
- Preflight: `preflight/243-source-repository-platform-gate-boundary.md`

## Problem

The workflow artifact checker calls target application platform-baseline gates
for the authoritative IntentOS source checkout. Examples/fixtures are then
misread as application signals and the source workflow cannot satisfy its own
implementation gate. The full source self-check also hard-codes Task 119
evidence as current authority, so any legitimate newer source candidate makes
two historical-batch regression assertions fail even though batch compatibility
and explicit stale-authority rejection both behave correctly.

## User Story

As an IntentOS maintainer, I want source tasks to use source-repository gates,
so that target platform requirements do not create a self-referential block.

## Scope

Included:

- Strict authoritative-source recognition.
- Platform gate exemption only for that source identity.
- Positive and near-miss regression coverage.
- Candidate-aware Task 119 regression assertions that accept exact current
  authority or require explicit stale-authority rejection.

## Non-goals

- Platform resolver changes.
- Installed/ordinary project exemptions.
- Any change to industrial, risk, review, eval, or artifact-quality gates.

## Data Model Impact

None.

## API / Interface Contract

### Implementation baseline gate

Input:

```json
{"projectRoot":"/authoritative/intentos","mode":"implementation"}
```

Output:

```json
{"platformGate":"NOT_APPLICABLE_SOURCE_REPOSITORY","otherGates":"UNCHANGED"}
```

Errors:

- A near-miss source identity follows the existing platform-baseline result.

## UI States

Not applicable; CLI checker only.

## Permission Rules

- No target-project bypass.

## Observability

- Logs: existing checker pass/fail output.
- Metrics: none.
- Audit events: none.

## Acceptance Criteria

- Current authoritative source Task 243 no longer fails only on platform baseline.
- Ordinary/installed project behavior is unchanged.
- Recognition fails closed when manifest authority or package identity is absent.
- No other implementation gates are bypassed.
- Historical batch mode remains readable while explicit current mode rejects a
  Task 119 report whose project revision no longer matches the source candidate.

## Test Plan

- Unit: strict source identity positive and near misses.
- Unit: Task 119 current/stale assertions derive expected behavior from the
  report's exact project authority binding.
- Integration: Task 243 implementation artifact check.
- E2E: Task 242 check proceeds past platform baseline.
- E2E: full source `check-intentos` completes without weakening production
  evidence-authority validation.
- Manual: inspect checker/test diff and result.

## Rollback Notes

Revert the checker/helper/test changes.

## Open Questions

- None.
