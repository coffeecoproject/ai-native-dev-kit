---
schema_version: 1.0
artifact_type: spec
number: 251
slug: verification-runtime-interruption-test-readiness
title: "verification runtime interruption test readiness"
status: ready
created_at: 2026-08-02
intentos_version: 1.113.0
request: requests/251-verification-runtime-interruption-test-readiness.md
preflight: preflight/251-verification-runtime-interruption-test-readiness.md
---
# Spec 251: Verification Runtime Interruption Test Readiness

## Status

Ready

## Source

- Request: `requests/251-verification-runtime-interruption-test-readiness.md`
- Preflight: `preflight/251-verification-runtime-interruption-test-readiness.md`

## Problem

The interruption test uses elapsed time as a proxy for descendant-process readiness. Under load, abort can occur after the verify action starts but before its Node fixture writes `descendant.pid`, so the test fails while the runtime still performs the expected cleanup.

## User Story

As an IntentOS maintainer,
I want the interruption test to synchronize on an observable fixture event,
so that a passing or failing result reflects process cleanup behavior rather than host scheduling speed.

## Scope

Included:

- one bounded helper for owned test temporary directories;
- one suite-level cleanup hook for those exact directories;
- one bounded wait helper for a fixture-created file;
- interruption only after `descendant.pid` exists;
- preservation of all existing cleanup, redaction and duration assertions.

## Non-goals

- production runtime changes;
- longer action timeouts or sleeps;
- weakening descendant-process validation;
- changes to other test suites, Task 250 implementation, Pawcode or release behavior.

## Data Model Impact

None. Test-local Sets, paths and timing state only.

## API / Interface Contract

### Test fixture readiness

Input:

```json
{
  "path": "<owned fixture root>/descendant.pid",
  "timeoutMs": 5000
}
```

Output:

```json
{
  "ready": true
}
```

Errors:

- fail with a descriptive bounded-timeout error when the fixture never becomes ready;
- abort and await the lifecycle execution before surfacing readiness failure, so the test itself does not leak processes.

## UI States

- Not applicable; test-only change.

## Permission Rules

- Cleanup may remove only exact temporary roots returned by this module's `mkdtempSync` helper.
- No project, target-project or user path is accepted as cleanup input.

## Observability

- Logs: existing lifecycle journal and command output.
- Metrics: elapsed time and test runner result.
- Audit events: existing `INTERRUPTED`, `PROCESS_CLEANED`, `RESOURCE_CLEANED` and `INTERRUPTED_CLEANED` journal events.

## Acceptance Criteria

- Abort occurs only after the descendant PID file exists.
- Readiness uses polling with a bounded deadline, not a larger fixed sleep.
- A readiness failure still aborts and awaits the lifecycle execution before failing.
- The existing descendant PID is read and verified absent after cleanup.
- Every temporary root created by this test module is removed by the suite hook.
- The exact interruption subtest and the complete lifecycle test file pass on Node 22.22.3.
- No production source file changes.

## Test Plan

- Syntax: `node --check tests/verification-runtime-lifecycle.test.mjs`.
- Focused: run the exact interruption test name.
- Integration: run the complete lifecycle test file.
- Hygiene: compare owned test-prefix directories before and after the complete test file.
- Repository: workflow artifact check and `git diff --check`.

## Rollback Notes

Revert the Task 251 test and evidence files. No production or target-project rollback is needed.

## Open Questions

- None.
