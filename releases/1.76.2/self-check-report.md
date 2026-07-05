# IntentOS 1.76.2 Self-Check Report

## Scope

This self-check covers Verification Plan Markdown/JSON consistency, including
Source Systems, identity, project calibration, affected surfaces, verification
obligations, manual verification, not-applicable obligations, outcome, bad
fixtures, version metadata, and release evidence.

## Executed Local Commands

```bash
node --check scripts/check-verification-plan.mjs
node --check scripts/check-intentos.mjs
node scripts/check-verification-plan.mjs examples/1.76-verification-plan/appointment-service-time --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
npm run verify
```

## Required Negative Coverage

Self-check must reject:

- Markdown Source Systems digest drift from JSON evidence.
- Markdown Verification Plan identity digest drift from JSON evidence.
- Markdown affected surface status drift from JSON evidence.
- Markdown missing verification obligation rows.
- Markdown outcome drift from JSON evidence.

## Outcome

Passed in the release working tree.

## Notes

Validation confirmed the positive 1.76 Verification Plan example still passes
strict source binding and Markdown/JSON consistency. Five bad fixtures now fail
for the intended reasons: source digest drift, identity digest drift, affected
surface status drift, missing Markdown obligation row, and outcome drift.
