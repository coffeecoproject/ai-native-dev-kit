# Preflight 001: Mini Program Login Cloud Read

## Source Request

`requests/001-miniprogram-login-cloud-read.md`

## Clarity

READY

## Problem Summary

The project needs a Mini Program BL2 first slice that exercises login, cloud read boundary, denied state, runtime states, and review-readiness evidence.

## Missing Information

- Real project page route.
- Real cloud function or API name.
- Real verification command.

## Assumptions

- This is an example-only slice.
- Admin backend is out of scope and would require separate selected packs.
- Evidence refs are example docs, not production proof.

## Direction Risks

- Treating example evidence as production release approval.
- Expanding the slice into admin backend, payment, or production config.
- Relying on client-only filtering for protected data.

## Over-design Risks

- Selecting all industrial packs.
- Adding payment or admin packs without actual scope.
- Binding the example to a specific mini program framework or cloud vendor.

## MVP Recommendation

Use one read-only protected Mini Program flow with login, denied, failure, recovery, and review-readiness evidence.

## Non-goals

- Admin backend.
- Payment.
- Production release.
- Production config.
- Data migration.

## Domain Model Draft

- CurrentUserSession: login state and scoped identity.
- ProtectedReadResult: read-only result for the current user.
- RuntimeEvidence: evidence refs for states and cloud boundary.

## Permission / Security Risks

- Login state and protected record scope require review.
- Cloud access rule and denied state require evidence.
- No production credentials or real user data may be used.

## First Vertical Slice

Create request/spec/eval/task/evidence/release/log records for one protected Mini Program read flow.

## Suggested Specs

`specs/001-miniprogram-login-cloud-read.md`

## Suggested Task Level

L3

## Decision

READY_FOR_SPEC

## Rationale

The scope is narrow, evidence-backed, and does not require production, payment, or admin backend changes.
