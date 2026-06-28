---
artifact_type: baseline_decision_card
status: draft
---

# Baseline Decision Card: <name>

## Human Summary

I think this project is <project state>.

I recommend <BL0_LIGHTWEIGHT / BL1_STANDARD / BL2_INDUSTRIAL candidate path for human review> for this phase.

Codex can recommend next steps, but this card does not approve writes or implementation.

## Project State

- Project state: <new-empty / existing-light / existing-governed / production-sensitive / dirty-worktree / unknown>
- Why: <plain-language reason>
- Default adoption mode: <read-only / plan-first / guided-init / adapter-only>
- Can Codex write now: No

## Platform And Scope

- Detected platform: <web / mini program / iOS / Android / backend / internal admin / mixed / unknown>
- Platform state summary: <selected / present-needs-confirmation / present-inactive-or-deferred / not-detected>
- Backend/API scope: <confirmed / not detected / pending confirmation>
- Production sensitivity: <confirmed / possible / not detected / pending confirmation>
- High-risk scope: <permission / data / payment / finance / HR / tax / migration / none detected / pending confirmation>

## Recommended Baseline Level

- Recommended level: <BL0_LIGHTWEIGHT / BL1_STANDARD / BL2_INDUSTRIAL>
- Why: <plain-language reason>
- Current safe action: <BL0 discovery / BL1 read-only mapping / read-only until worktree decision>
- Target candidate level: <none / BL2_INDUSTRIAL>
- Current selected level: <none / pending / confirmed level>
- BL2 status: <not selected / candidate only / selected with evidence pending>

## Platform States

| Profile | State | Reason |
|---|---|---|
| <profile-id> | <selected-confirmed / selected-inferred / present-needs-confirmation / present-inactive-or-deferred / not-detected> | <evidence or reason> |

## Recommended Standard Packs

- <standard-pack-id or none>

## Candidate Industrial Packs

Candidate only, not selected:

- <industrial-pack-id or none>

## Not Selected

| Pack | Reason |
|---|---|
| <pack-id> | <why not selected> |

## Human Decisions Needed

1. <question>
2. <question>
3. <question>

## Safe Next Actions

- <safe next action>

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
| Project signals | <path or observation> | PENDING |
| Baseline evidence gap | <path or PENDING> | PENDING |
