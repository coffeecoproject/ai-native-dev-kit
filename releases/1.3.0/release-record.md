# 1.3.0 Release Record

## Release Type

Guided Delivery Baseline release.

## Human Summary

1.3.0 fixes the product direction, claim boundary, and assumption handling for AI Native Dev Kit.

## Theme

Guided Delivery Baseline.

## Added

- Outcome Baseline.
- Product Baseline.
- Claim Control.
- Assumption Register.
- Product baseline checker.
- Claim control checker.
- Product/claim templates, checklists, and prompts.
- 1.3 examples and bad fixtures.

## Allowed Claims

- 1.3.0 adds deterministic checks for product boundary and claim wording.
- 1.3.0 makes assumptions visible when they affect reports or decisions.
- 1.3.0 keeps simulated dogfood separate from production evidence.
- 1.3.0 keeps reports, review packets, goal cards, and subagent outputs from becoming approvals.

## Forbidden Claims

- Do not claim production validation from 1.3.0.
- Do not claim guaranteed safe delivery.
- Do not claim the kit is suitable for every project without human judgment.
- Do not claim AI can approve launch, release, risk, or scope expansion.
- Do not claim draft packs are stable.

## Evidence Status

| Evidence | Status | Notes |
|---|---|---|
| Simulated dogfood | Present | 1.3 workflow artifacts exercise the phase. |
| Generated-project smoke | Expected | Covered by dev-kit self-check. |
| Controlled real-project trial | Not present | Requires later trial. |
| Production adoption evidence | Not present | Not claimed. |

## Known Limitations

- No Safe Launch / Delivery Readiness checker in this phase.
- No production project evidence in this phase.
- Claim control is deterministic and does not replace human public-language review.
- Assumption Register is lightweight and not mandatory for every ordinary task.
- External reviewer/API automation remains out of scope.

## Verification

```bash
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
```

## Related Artifacts

- docs/guided-delivery-baseline-1.3-plan.md
- requests/130-guided-delivery-baseline.md
- tasks/130-guided-delivery-baseline.md
- review-loop-reports/130-guided-delivery-baseline.md
- final-reports/130-guided-delivery-baseline.md
