---
schema_version: 1.0
artifact_type: task
number: 181
slug: real-adoption-calibration
title: Real Adoption Calibration
spec: specs/181-real-adoption-calibration.md
eval: evals/181-real-adoption-calibration.md
task_level: L1
status: done
created_at: 2026-06-27
---
# Task 181: Real Adoption Calibration

## Task Level

L1

## Related Spec

`specs/181-real-adoption-calibration.md`

## Related Eval

`evals/181-real-adoption-calibration.md`

## Goal

Apply 1.8 review calibration without adding a new heavy governance layer.

## Scope

Allowed:

- Dev-kit docs, templates, checker, fixtures, manifest, and release evidence.

Not allowed:

- target project writes
- automatic real-project scanner
- implementation approval
- weakening high-risk defaults

## Acceptance Criteria

- Governance map separates profiles from risk/capability packs.
- Patch false-positive records are available and checked.
- Usage docs clarify recorded-report behavior.
- Full dev-kit checks pass.

## Commands

Run:

```bash
node --check scripts/check-patch-classification.mjs
node scripts/check-patch-classification.mjs .
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/181-real-adoption-calibration.md
node scripts/check-next-step-boundary.mjs . --task tasks/181-real-adoption-calibration.md
node scripts/check-dev-kit.mjs
git diff --check
```

## AI Budget

Max agent runs: 1
Max repair runs: 2
Use high reasoning model: No
Stop if: a change requires target project writes, automatic real-project scanning, implementation approval, or weakening high-risk patch defaults.

## Risk Gate

This task touches:

- [ ] auth
- [ ] permission
- [ ] migration
- [ ] regulated operation
- [ ] irreversible operation
- [ ] value transfer
- [ ] safety-critical behavior
- [ ] data deletion
- [ ] production config
- [ ] secrets
- [ ] personal data
- [ ] regulated data
- [ ] external side effect
- [ ] privileged operation
- [ ] app signing / platform release
- [ ] cloud function / access rule
- [ ] form interaction
- [ ] api failure
- [ ] accessibility
- [ ] performance
- [ ] dependency change

If any item is checked, implementation requires explicit human approval before code changes.

## Baseline References

Engineering Baseline touched: No

Environment Baseline touched: No

Baseline refs:

- `docs/engineering-baseline.md` / Not applicable
- `docs/environment-baseline.md` / Not applicable

Baseline decisions introduced:

- No

## Human Approval

Required: No
Status: Not Required
Approval scope: Not Required
Approved by:
Approved at:
Approval notes:

## Stop Conditions

Stop and report if:

- checker changes would allow false positives to bypass real high-risk impact
- docs imply automatic target scanning
- release wording claims new real-project coverage
- target project writes are needed

## Final Report Required

- Completed
- Verified
- Not Changed
- Risks Remaining
- Next-Step Suggestions
- Human Decisions Needed
- Next Safe Action
