# Baseline Decision Card: dirty-worktree

## Human Summary

I think this project has a dirty worktree.

I recommend BL1_STANDARD only after current uncommitted changes are handled.

Codex can recommend next steps, but this card does not approve writes or implementation.

## Project State

- Project state: Dirty worktree
- Why: Git reports uncommitted files, so Codex must not write before the human decides how to handle current changes.
- Default adoption mode: read-only
- Can Codex write now: No

## Platform And Scope

- Detected platform: web-app
- Platform state summary: web-app: selected-confirmed
- Backend/API scope: not detected
- Production sensitivity: possible
- High-risk scope: none detected

## Recommended Baseline Level

- Recommended level: BL1_STANDARD
- Why: A standard baseline may be appropriate later, but current worktree state blocks write actions.
- Current selected level: none
- BL2 status: not selected

## Platform States

| Profile | State | Reason |
|---|---|---|
| web-app | selected-confirmed | Web project scope is explicit, but writes are blocked by dirty worktree state. |
| wechat-miniprogram | not-detected | Mini Program scope is not part of this card. |
| ios-app | not-detected | iOS scope is not part of this card. |
| android-app | not-detected | Android scope is not part of this card. |
| backend-api | not-detected | Backend/API scope is not confirmed. |
| internal-admin | not-detected | Internal admin scope is not confirmed. |

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
| web-app-industrial | not selected because BL2 is not confirmed. |

## Human Decisions Needed

1. Should Codex continue read-only, create a plan only, or wait until current changes are committed?
2. Which current changes belong to the user and must not be touched?
3. May Codex generate a baseline decision card file after the worktree is clean?

## Safe Next Actions

- Codex should stay read-only until the human decides how to handle uncommitted changes.
- After that decision, Codex can prepare a write plan instead of applying changes directly.

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
| Git worktree | changed files detected | PENDING |
| Baseline evidence gap | PENDING | PENDING |
