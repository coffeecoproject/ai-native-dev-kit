# Ordinary User First-Slice Card: booking app

## Human Summary

I understand you want: build a simple booking app.

I suggest the first version: a local web app where a visitor submits one booking request and an operator can view the submitted bookings.

Can Codex write files now: No

What I need from you: confirm Web is fine / confirm bookings can use local demo data first / confirm payment, login, SMS, production release, and complex permissions stay out of the first version

## First Version Scope

| Item | Included now? | Notes |
|---|---|---|
| Target user | Yes | visitor and operator |
| Core flow | Yes | visitor submits booking, operator views booking |
| Platform | Yes | Web |
| Data | Local only | demo browser storage first |

## Questions For Human

1. Is Web fine for the first version?
2. Can the first version use local demo data?
3. Should payment, login, SMS, production release, and complex permissions stay out of this version?

## What Codex Can Do Next

1. Create the smallest task scope for the booking flow.
2. Implement the local web demo after confirmation.
3. Run a smoke check for one booking submission and operator review.

## Backlog / Later

| Item | Why later |
|---|---|
| Payment | Not needed for the first local version |
| SMS notification | Not needed for the first local version |
| Login and roles | Not needed for the first local version |
| Production deployment | Not needed for the first local version |

## Verification Plan

| Check | Method | Evidence |
|---|---|---|
| Core flow | submit one booking and view it in the operator list | smoke output or final report |
| Backlog boundary | confirm risky items remain out of scope | first-slice card |

## Boundaries

- This card writes target files: No
- This card approves implementation: No
- This card approves release or production: No
- This card changes CI or hooks: No
- This card touches payment, secrets, production, migration, or permissions: No
- This card enables BL2 or industrial packs: No

## Outcome

`FIRST_SLICE_RECORDED`
