# Baseline Decision Card: existing-governed-readonly

## Human Summary

I think this is an existing governed Web project.

I recommend BL1_STANDARD mapping first.

Codex can recommend next steps, but this card does not approve writes or implementation.

## Project State

- Project state: Existing governed project
- Why: Existing AGENTS, CI, release docs, or baseline docs are present.
- Default adoption mode: read-only mapping first
- Can Codex write now: No

## Platform And Scope

- Detected platform: web-app + internal-admin
- Platform state summary: web-app: selected-confirmed; internal-admin: selected-confirmed; backend-api: present-needs-confirmation
- Backend/API scope: possible; needs confirmation
- Production sensitivity: possible
- High-risk scope: permission, data pending confirmation

## Recommended Baseline Level

- Recommended level: BL1_STANDARD
- Why: Existing governance should be mapped before BL2 or any workflow asset change is considered.
- Current selected level: none
- BL2 status: not selected

## Platform States

| Profile | State | Reason |
|---|---|---|
| web-app | selected-confirmed | Existing governed project is a Web project. |
| wechat-miniprogram | not-detected | Mini Program scope is not part of this card. |
| ios-app | not-detected | iOS scope is not part of this card. |
| android-app | not-detected | Android scope is not part of this card. |
| backend-api | present-needs-confirmation | Backend/API scope is possible and needs mapping against existing governance. |
| internal-admin | selected-confirmed | Internal admin scope is present in the governed project shape. |

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
| data-storage-industrial | not selected because BL2 and data-risk evidence are not confirmed. |

## Human Decisions Needed

1. Which existing governance files are the authority for this project?
2. Should Codex stay read-only and produce an adapter map first?
3. Does the next phase include backend, permission, or data changes?
4. May Codex write any baseline files after a reviewed plan?

## Safe Next Actions

- Codex can prepare a read-only governance map before any controlled apply.
- Codex should not change existing governance assets until the human approves a specific plan.

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
| Existing governance | AGENTS.md, .github/workflows/*, docs/*baseline* | DONE |
| Baseline evidence gap | PENDING | PENDING |
