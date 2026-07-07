# User Delivery Console Source Signal Calibration 1.79.4 Plan

## Goal

Make User Delivery Console intermediate source signals current-task aware.

## Problem

Before `1.79.4`, Completion Evidence was already bound to the current
`--intent`, but intermediate signals were still directory-level counts:

- Business Rule Closure;
- Change Impact Coverage;
- Verification Plan;
- Test Evidence;
- Execution Assurance.

That meant another task's evidence could make the current task's status card
show planning, test evidence, or execution proof as recorded.

## Scope

This patch does:

1. compute a current intent digest from `--intent`;
2. match Business Rule Closure by `source_request_digest`;
3. match Change Impact Coverage by current intent or current Business Rule
   Closure refs/digests;
4. match Verification Plan by `intent_digest` or current Business Rule Closure
   refs/digests;
5. match Test Evidence by `intent_digest` or current Verification Plan refs;
6. match Execution Assurance by `intent_digest` or current Test Evidence refs;
7. expose `sourceSignals` in JSON with current-task and other-task counts;
8. keep other-task records visible in Technical Trace without counting them as
   current-task evidence;
9. add checker regression coverage for wrong-task source signals.

This patch does not:

- add a new completion gate;
- replace Business Rule Closure, Change Impact Coverage, Verification Plan,
  Test Evidence, Execution Assurance, or Completion Evidence;
- write target files;
- approve implementation, commit, push, release, or production;
- prove real-user stability.

## Acceptance

The implementation is acceptable when:

- `status <project> --intent "<matching task>" --json` shows matching source
  records as current-task signals;
- `status <project> --intent "<different task>" --json` leaves intermediate
  user-facing fields as `No` and records other-task counts under
  `sourceSignals`;
- Technical Trace distinguishes current-task records from other-task records;
- `status-check` and `check-intentos` include wrong-task regression coverage;
- `check-intentos`, `npm run verify`, and `git diff --check` pass.

## Boundary

User Delivery Console remains a derived status view. It explains source systems
in ordinary language but does not become the authoritative gate for those source
systems.
