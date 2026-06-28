# Baseline Decision Card: production-sensitive

## Human Summary

I think this is a production-sensitive project.

I recommend BL2_INDUSTRIAL only as a candidate path pending evidence and human confirmation.

Codex can recommend next steps, but this card does not approve writes or implementation.

## Project State

- Project state: Production-sensitive project
- Why: Release, rollback, production, CI, or customer-data signals are present.
- Default adoption mode: adapter-only
- Can Codex write now: No

## Platform And Scope

- Detected platform: web-app + backend-api
- Backend/API scope: confirmed by project signals
- Production sensitivity: confirmed
- High-risk scope: data, migration/irreversible data

## Recommended Baseline Level

- Recommended level: BL2_INDUSTRIAL
- Why: Production and data-risk signals mean BL2 may be needed, but it is not active until evidence and human decisions are recorded.
- Current selected level: none
- BL2 status: candidate only

## Recommended Standard Packs

- web-runtime-standard
- backend-api-standard
- environment-standard

## Candidate Industrial Packs

Candidate only, not selected:

- web-app-industrial
- backend-api-industrial
- data-storage-industrial
- high-risk-change-industrial

## Not Selected

| Pack | Reason |
|---|---|
| payment-value-transfer-industrial | not selected because payment or value transfer scope is not confirmed. |
| auth-permission-industrial | not selected because permission risk is not confirmed. |
| release-rollback-standard | not selected until release or rollback scope is confirmed. |

## Human Decisions Needed

1. Is this project currently serving real users?
2. Which existing release and rollback process is authoritative?
3. Does this task touch database migration or irreversible data?
4. Do you approve BL2_INDUSTRIAL as a target state, or only a gap review?
5. May Codex write any files after a controlled apply plan?

## Safe Next Actions

- Codex can prepare a read-only governance map before any controlled apply.
- Codex can prepare a BL2 evidence gap report before enabling any industrial pack.
- Codex must not add gates, change CI, or change release flow without explicit approval.

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
| Production signals | release docs, CI workflow, deployment notes | DONE |
| BL2 evidence gap | PENDING | PENDING |
