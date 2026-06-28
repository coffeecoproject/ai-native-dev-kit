# 1.12 Change Boundary, Guided Delivery Check & Baseline State Example

This example shows the 1.12 checks in a simulated appointment-app first slice.

It proves only source-level workflow behavior:

- Guided Delivery keeps one current mainline and parks side ideas.
- Change Boundary records intended scope and changed files.
- Baseline State keeps no-code recommendations proposed or evidence-required.

It does not prove production readiness, industrial compliance, release approval, or hard write prevention.

## Checks

```bash
node scripts/check-guided-delivery-loop.mjs examples/1.12-change-boundary-baseline-state
node scripts/check-change-boundary.mjs examples/1.12-change-boundary-baseline-state --report change-boundary-reports/001-appointment-first-slice.md
node scripts/check-baseline-state.mjs examples/1.12-change-boundary-baseline-state --report baseline-state-reports/001-no-code-baseline.md
```

