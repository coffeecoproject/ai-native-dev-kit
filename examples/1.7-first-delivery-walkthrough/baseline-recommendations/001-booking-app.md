# Baseline Recommendation: Booking Mini App

## Human Summary

Start light. The first slice is a local demo and should use `BL0_LIGHTWEIGHT` until platform, backend, payment, privacy, and release decisions are confirmed.

## Recommendation

- Adoption mode: `NEW_PROJECT`
- Task level: `L1`
- Baseline level: `BL0_LIGHTWEIGHT`
- Platform profile: mini program candidate
- Industrial packs: none selected

## Why

The first slice is a demo of the booking flow. It does not touch payment, production data, migration, or deployment.

## Human Decisions

| Decision | Status | Notes |
|---|---|---|
| Use mini program first | `Confirmed` | User wants customer booking on mobile |
| Defer payment | `Confirmed` | Payment becomes a later scope decision |
| Start BL0 | `Confirmed` | Enough for local demo |

## Must Not Do

- Do not claim production readiness.
- Do not add payment or privacy-sensitive storage without a new decision.
- Do not select BL2 or industrial packs by default.
