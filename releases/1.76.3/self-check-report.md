# IntentOS 1.76.3 Self-Check Report

## Scope

This self-check covers Verification Plan consistency closure: bidirectional
Markdown/JSON row checks, Test Correctness Control consistency, READY
source-system status enforcement, bad fixtures, version metadata, and release
evidence.

## Executed Local Commands

```bash
node --check scripts/check-verification-plan.mjs
node --check scripts/check-intentos.mjs
node scripts/check-verification-plan.mjs examples/1.76-verification-plan/appointment-service-time --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-verification-plan.mjs test-fixtures/bad/bad-verification-plan-markdown-extra-obligation --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-verification-plan.mjs test-fixtures/bad/bad-verification-plan-markdown-extra-source-system --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-verification-plan.mjs test-fixtures/bad/bad-verification-plan-markdown-extra-surface --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-verification-plan.mjs test-fixtures/bad/bad-verification-plan-markdown-extra-not-applicable --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-verification-plan.mjs test-fixtures/bad/bad-verification-plan-markdown-test-control-mismatch --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-verification-plan.mjs test-fixtures/bad/bad-verification-plan-markdown-test-control-missing --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-verification-plan.mjs test-fixtures/bad/bad-verification-plan-ready-with-unresolved-source-system --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
git diff --check
node scripts/check-intentos.mjs
```

## Required Negative Coverage

Self-check must reject:

- Markdown-only extra Source Systems rows.
- Markdown-only extra Affected Surface Inputs rows.
- Markdown-only extra Verification Obligations rows.
- Markdown-only extra Not Applicable Obligations rows.
- Test Correctness Control mismatch between Markdown and JSON evidence.
- Missing Test Correctness Control Markdown rows.
- READY Verification Plans with unresolved BRC/CIC source-system records.

## Outcome

Passed in the release working tree.

## Notes

Validation confirmed the positive 1.76 Verification Plan example still passes
strict source binding, bidirectional Markdown/JSON consistency, and Test
Correctness Control checks. Seven new bad fixtures fail for the intended
reasons: Markdown-only extra rows, Test Correctness Control drift, missing Test
Correctness Control rows, and unresolved READY source-system records.

This patch keeps the Verification Plan artifact schema at `1.76.0` and does
not enter Test Evidence Binding.
