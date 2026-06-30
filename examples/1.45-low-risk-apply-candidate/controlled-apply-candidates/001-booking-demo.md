# Low-Risk Controlled Apply Candidate

## Human Summary

The proposed change is to adjust local booking demo copy inside the example app. It is small, local, reversible, and still needs human approval before any apply plan.

## Candidate Scope

| Field | Value |
|---|---|
| Candidate type | local demo |
| Exact target paths | `examples/mvp-booking-web-app/src/app.js` |
| Why this is low risk | It only affects the local demo example and avoids high-risk surfaces. |
| Human decision needed | Yes |

## Required Evidence

| Evidence | Status | Notes |
|---|---|---|
| First-slice scope | Present | `examples/mvp-booking-web-app/ordinary-first-slices/001-booking-web-app.md` |
| Verification plan | Present | `npm test --prefix examples/mvp-booking-web-app` |
| Rollback path | Present | Revert the exact target path. |

## Allowed Actions

- Ask the human whether to prepare a separate apply plan.
- Prepare a separate apply plan only after the human agrees.

## Forbidden Actions

- Do not write target files from this candidate.
- Do not apply changes automatically.
- Do not change CI or hooks.
- Do not touch payment, secrets, production, migration, data, or permissions.

## Verification And Rollback

Verification:

- Run `npm test --prefix examples/mvp-booking-web-app`.

Rollback:

- Revert only `examples/mvp-booking-web-app/src/app.js`.

## Boundaries

- This candidate writes files now: No
- This candidate authorizes apply: No
- This candidate approves implementation: No
- This candidate approves release or production: No
- This candidate changes CI or hooks: No
- This candidate touches payment, secrets, production, migration, data, or permissions: No

## Outcome

`LOW_RISK_APPLY_CANDIDATE_RECORDED`
