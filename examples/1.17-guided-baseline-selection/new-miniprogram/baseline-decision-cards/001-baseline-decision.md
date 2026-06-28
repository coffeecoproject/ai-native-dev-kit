# Baseline Decision Card: new-miniprogram

## Human Summary

I think this is a new empty project for a WeChat Mini Program.

I recommend BL1_STANDARD after the Mini Program scope is confirmed.

Codex can recommend next steps, but this card does not approve writes or implementation.

## Project State

- Project state: New empty project
- Why: The user wants to start a Mini Program, but backend and risk scope are not confirmed.
- Default adoption mode: guided-init after confirmation
- Can Codex write now: No

## Platform And Scope

- Detected platform: wechat-miniprogram
- Backend/API scope: pending confirmation
- Production sensitivity: not detected
- High-risk scope: none detected

## Recommended Baseline Level

- Recommended level: BL1_STANDARD
- Why: A normal Mini Program should have platform and environment rules before implementation.
- Current selected level: none
- BL2 status: not selected

## Recommended Standard Packs

- miniprogram-runtime-standard
- environment-standard

## Candidate Industrial Packs

Candidate only, not selected:

- none

## Not Selected

| Pack | Reason |
|---|---|
| backend-api-standard | not selected until backend/API scope is confirmed. |
| release-rollback-standard | not selected until release or rollback scope is confirmed. |
| wechat-miniprogram-industrial | not selected because BL2 is not confirmed. |

## Human Decisions Needed

1. Is this Mini Program only frontend for now?
2. Does this phase include cloud functions, backend/API, or database changes?
3. Should this phase use BL1_STANDARD, or stay BL0_LIGHTWEIGHT for a quick demo?
4. May Codex write baseline files after you review a plan?

## Safe Next Actions

- Codex can prepare a Mini Program standard baseline plan after platform confirmation.
- Codex should keep backend and BL2 inactive until the user confirms the scope.

## Boundary

- This card authorizes target-project writes: No
- This card approves implementation: No
- This card approves release or production: No
- This card approves security/privacy/compliance/payment/migration decisions: No
- This card proves real project evidence exists: No

This card is a recommendation only. Human confirmation is still required before Codex writes baseline files, enables BL2, applies industrial packs, changes business code, changes CI, changes release flow, or touches production-sensitive configuration.

## Evidence

| Evidence | Ref | Status |
|---|---|---|
| Project intent | conversation summary | PENDING |
| Baseline evidence gap | PENDING | PENDING |
