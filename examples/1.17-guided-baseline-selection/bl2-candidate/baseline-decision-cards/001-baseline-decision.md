# Baseline Decision Card: bl2-candidate

## Human Summary

I think this is a Web admin project with permission and data risk.

I recommend BL2_INDUSTRIAL only as a candidate path pending evidence and internal readiness.

Codex can recommend next steps, but this card does not approve writes or implementation.

## Project State

- Project state: Existing light project
- Why: Web admin, permission, and data signals exist, but BL2 evidence has not been confirmed.
- Default adoption mode: gap review first
- Can Codex write now: No

## Platform And Scope

- Detected platform: web-app + internal-admin
- Platform state summary: web-app: selected-confirmed; internal-admin: selected-confirmed; backend-api: present-needs-confirmation
- Backend/API scope: possible; needs confirmation
- Production sensitivity: possible
- High-risk scope: permission, data

## Recommended Baseline Level

- Recommended level: BL2_INDUSTRIAL
- Why: Permission and data risk may require BL2, but this is only a candidate until evidence exists.
- Current selected level: none
- BL2 status: candidate only

## Platform States

| Profile | State | Reason |
|---|---|---|
| web-app | selected-confirmed | Web admin project scope is explicit. |
| wechat-miniprogram | not-detected | Mini Program scope is not part of this card. |
| ios-app | not-detected | iOS scope is not part of this card. |
| android-app | not-detected | Android scope is not part of this card. |
| backend-api | present-needs-confirmation | Compatibility state: Backend/API scope is possible but lacks project-owned evidence. |
| internal-admin | selected-confirmed | Internal admin scope is explicit. |

## Recommended Standard Packs

- web-runtime-standard
- internal-admin-standard
- environment-standard

## Candidate Industrial Packs

Candidate only, not selected:

- web-app-industrial
- internal-admin-industrial
- auth-permission-industrial
- data-storage-industrial

## Not Selected

| Pack | Reason |
|---|---|
| backend-api-standard | not selected until backend/API scope is confirmed. |
| payment-value-transfer-industrial | not selected because payment or value transfer scope is not confirmed. |
| high-risk-change-industrial | not selected because migration or irreversible change is not confirmed. |

## Human Decisions Needed

1. Does this phase include real permission or role management?
2. Does this phase read or write customer or business data?
3. Should BL2_INDUSTRIAL be the target state, or should Codex start with a BL1 gap review?
4. Which evidence should Codex collect before any industrial pack is enabled?
5. May Codex write any baseline files after a controlled apply plan?

## Safe Next Actions

- Codex can prepare a BL2 evidence gap report before enabling any industrial pack.
- Candidate industrial packs stay inactive until evidence, compatibility, and internal readiness exist.

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
| Permission and data signals | admin routes, permission notes, data model notes | PENDING |
| BL2 evidence gap | PENDING | PENDING |
