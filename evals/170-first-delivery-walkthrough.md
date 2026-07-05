# Eval: 1.7 First Delivery Walkthrough

## Related Spec

`specs/170-first-delivery-walkthrough.md`

## Must Pass

- [x] `node --check scripts/check-first-delivery-walkthrough.mjs`
- [x] `node scripts/check-first-delivery-walkthrough.mjs .`
- [x] `node scripts/check-first-delivery-walkthrough.mjs examples/1.7-first-delivery-walkthrough`
- [x] bad missing final fixture fails as expected
- [x] bad missing launch fixture fails as expected
- [x] bad overclaim fixture fails as expected
- [x] `node scripts/check-manifest.mjs`
- [x] `node scripts/check-fixtures.mjs`
- [x] `node scripts/check-product-baseline.mjs .`
- [x] `node scripts/check-claim-control.mjs .`
- [x] `node scripts/check-intentos.mjs`

## Spec Alignment

- [x] Implementation matches acceptance criteria.
- [x] Implementation respects non-goals.
- [x] API / interface contract matches spec.
- [x] UI states are not applicable.
- [x] Observability requirements are covered by command and release evidence.

## Permission / Data Checks

- [x] Permission checks are not applicable to runtime product data.
- [x] Resource ownership is not changed.
- [x] Resource/scope isolation is not changed.
- [x] Error responses do not leak sensitive data.

## Manual Review Checklist

- Confirm simulated evidence is not described as real production evidence.
- Confirm `READY_FOR_DEMO` is not described as launch approval.
- Confirm subagents are closed after handoff.
- Confirm 1.7 does not default to BL2 or industrial packs.

## Reject Conditions

Reject if:

- simulated walkthrough is described as real project validation
- production readiness is claimed
- checker writes to target projects
- subagents remain open after handoff
- task violates non-goals

## Required Evidence

- Command output summary: full checks passed.
- Screenshots / traces if UI: not applicable.
- Review notes: `review-loop-reports/170-first-delivery-walkthrough.md`.
