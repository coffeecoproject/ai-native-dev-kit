---
schema_version: 1.0
artifact_type: eval
number: 180
slug: real-project-adoption-trial
title: Real Project Read-only Adoption Trial
spec: specs/180-real-project-adoption-trial.md
status: done
created_at: 2026-06-27
---
# Eval: 1.8 Real Project Read-only Adoption Trial

## Related Spec

`specs/180-real-project-adoption-trial.md`

## Must Pass

- [x] `node --check scripts/check-real-adoption-trial.mjs`
- [x] `node --check scripts/check-patch-classification.mjs`
- [x] `node scripts/check-real-adoption-trial.mjs .`
- [x] `node scripts/check-patch-classification.mjs .`
- [x] `node scripts/check-real-adoption-trial.mjs examples/1.8-real-project-readonly`
- [x] `node scripts/check-patch-classification.mjs examples/1.8-real-project-readonly`
- [x] bad real adoption overclaim fixture fails as expected
- [x] bad real adoption target write fixture fails as expected
- [x] bad real adoption public name fixture fails as expected
- [x] bad patch safe-local high-risk fixture fails as expected
- [x] bad patch implementation authorization fixture fails as expected
- [x] bad patch do-not-patch done fixture fails as expected
- [x] `node scripts/check-manifest.mjs`
- [x] `node scripts/check-fixtures.mjs`
- [x] `node scripts/check-product-baseline.mjs .`
- [x] `node scripts/check-claim-control.mjs .`
- [x] `node scripts/check-context-governance.mjs .`
- [x] `node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/180-real-project-adoption-trial.md`
- [x] `node scripts/check-review-loop.mjs . --task tasks/180-real-project-adoption-trial.md`
- [x] `node scripts/check-next-step-boundary.mjs . --task tasks/180-real-project-adoption-trial.md`
- [x] `node scripts/check-dev-kit.mjs`
- [x] `git diff --check`

## Spec Alignment

- [x] Implementation matches acceptance criteria.
- [x] Implementation respects non-goals.
- [x] API / interface contract matches spec.
- [x] UI states are not applicable.
- [x] Observability requirements are covered by command and release evidence.

## Permission / Data Checks

- [x] No target project write is recorded or approved.
- [x] Public evidence is sanitized.
- [x] Patch classification does not authorize implementation.
- [x] High-risk patch surfaces require structural or human decision routing.

## Manual Review Checklist

- Confirm no private target project name or path is published.
- Confirm read-only adoption is not described as production validation.
- Confirm existing governance is mapped, not overwritten.
- Confirm patch classification is a boundary decision, not a patch permission slip.

## Reject Conditions

Reject if:

- target project writes are included
- private project identity appears without explicit public approval
- production validation, release approval, security approval, privacy approval, or compliance approval is claimed
- a high-risk surface is classified as `SAFE_LOCAL_FIX`
- `DO_NOT_PATCH` is marked done
- subagent entries remain open

## Required Evidence

- Command output summary: full checks passed.
- Review notes: `review-loop-reports/180-real-project-adoption-trial.md`.
- Release evidence: `releases/1.8.0/self-check-report.md`.
