---
schema_version: 1.0
artifact_type: eval
number: 181
slug: real-adoption-calibration
title: Real Adoption Calibration
spec: specs/181-real-adoption-calibration.md
status: done
created_at: 2026-06-27
---
# Eval: 1.8.1 Real Adoption Calibration

## Related Spec

`specs/181-real-adoption-calibration.md`

## Must Pass

- [x] `node --check scripts/check-patch-classification.mjs`
- [x] `node scripts/check-patch-classification.mjs .`
- [x] `node scripts/check-fixtures.mjs`
- [x] `node scripts/check-manifest.mjs`
- [x] `node scripts/check-product-baseline.mjs .`
- [x] `node scripts/check-claim-control.mjs .`
- [x] `node scripts/check-intentos.mjs`
- [x] `git diff --check`

## Spec Alignment

- [x] Implementation matches acceptance criteria.
- [x] Implementation respects non-goals.
- [x] API / interface contract remains read-only.
- [x] UI states are not applicable.
- [x] Observability is covered by checker output and release evidence.

## Permission / Data Checks

- [x] No target project write is introduced.
- [x] No automatic target scanner is introduced.
- [x] False-positive records do not approve implementation.
- [x] Public records do not include private target project details.

## Manual Review Checklist

- Confirm `high-risk-change` is not listed as a source-level Recommended Profile.
- Confirm false-positive records cannot accept real high-risk impact.
- Confirm docs say `real-adoption` checks recorded reports.
- Confirm release wording does not claim new real-project coverage.

## Reject Conditions

Reject if:

- false-positive records approve implementation
- false-positive records accept real high-risk impact
- docs imply `real-adoption` auto-generates target reports
- governance map keeps `high-risk-change` under Recommended Profiles

## Required Evidence

- Command output summary: full checks passed.
- Release evidence: `releases/1.8.1/self-check-report.md`.
- Final report: `final-reports/181-real-adoption-calibration.md`.
