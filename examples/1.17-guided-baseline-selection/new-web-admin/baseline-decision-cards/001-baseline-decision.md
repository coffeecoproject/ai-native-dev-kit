# Baseline Decision Card: new-web-admin

## Human Summary

I think this is a new Web internal admin project.

I recommend BL1_STANDARD for this phase.

Codex can recommend next steps, but this card does not approve writes or implementation.

## Project State

- Project state: New empty project
- Why: The project is being started from scratch and needs platform, admin, and environment rules.
- Default adoption mode: guided-init after confirmation
- Can Codex write now: No

## Platform And Scope

- Detected platform: web-app + internal-admin
- Platform state summary: web-app: selected-confirmed; internal-admin: selected-confirmed; backend-api: present-needs-confirmation
- Backend/API scope: pending confirmation
- Production sensitivity: not detected
- High-risk scope: permission pending confirmation

## Recommended Baseline Level

- Recommended level: BL1_STANDARD
- Why: Web admin work needs structure, UI state, permission boundary, and environment commands before implementation.
- Current selected level: none
- BL2 status: not selected

## Platform States

| Profile | State | Reason |
|---|---|---|
| web-app | selected-confirmed | User intent selects Web project scope. |
| wechat-miniprogram | not-detected | Mini Program scope is not part of this card. |
| ios-app | not-detected | iOS scope is not part of this card. |
| android-app | not-detected | Android scope is not part of this card. |
| backend-api | present-needs-confirmation | Backend/API connection still needs confirmation. |
| internal-admin | selected-confirmed | User intent selects internal admin scope. |

## Recommended Standard Packs

- web-runtime-standard
- internal-admin-standard
- environment-standard

## Candidate Industrial Packs

Candidate only, not selected:

- none

## Not Selected

| Pack | Reason |
|---|---|
| backend-api-standard | not selected until backend/API scope is confirmed. |
| release-rollback-standard | not selected until release or rollback scope is confirmed. |
| auth-permission-industrial | not selected because BL2 and permission-risk evidence are not confirmed. |

## Human Decisions Needed

1. Is this admin project connected to a real backend now?
2. Does this phase include permission or role management?
3. Is this already tied to real users or production data?
4. May Codex write baseline files after you review a plan?

## Safe Next Actions

- Codex can prepare standard baseline files for Web, internal admin, and environment after confirmation.
- Codex must keep BL2 and permission industrial packs inactive until risk evidence exists.

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
