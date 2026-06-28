# Baseline Decision Card: existing-light-web

## Human Summary

I think this is an existing light Web project.

I recommend BL1_STANDARD for this phase.

Codex can recommend next steps, but this card does not approve writes or implementation.

## Project State

- Project state: Existing light project
- Why: Web project files exist, but strong governance or production release assets are not detected.
- Default adoption mode: gap review first
- Can Codex write now: No

## Platform And Scope

- Detected platform: web-app
- Backend/API scope: not detected
- Production sensitivity: not detected
- High-risk scope: none detected

## Recommended Baseline Level

- Recommended level: BL1_STANDARD
- Why: Existing Web projects should get a standard baseline gap review before new AI-led changes.
- Current selected level: none
- BL2 status: not selected

## Recommended Standard Packs

- web-runtime-standard
- environment-standard

## Candidate Industrial Packs

Candidate only, not selected:

- none

## Not Selected

| Pack | Reason |
|---|---|
| backend-api-standard | not selected until backend/API scope is confirmed. |
| internal-admin-standard | not selected because admin scope is not confirmed. |
| web-app-industrial | not selected because BL2 is not confirmed. |

## Human Decisions Needed

1. Is this project already serving real users?
2. Does the next task include backend/API/database changes?
3. Should Codex only produce a gap review first?
4. May Codex write baseline files after you review a plan?

## Safe Next Actions

- Codex can prepare a baseline gap review before changing project files.
- Codex should use plan-first apply before writing target-project files.

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
| Project files | package.json, src/ | DONE |
| Baseline evidence gap | PENDING | PENDING |
