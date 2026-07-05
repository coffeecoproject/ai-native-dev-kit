# IntentOS 1.76.1 Self-Check Report

## Scope

This self-check covers Verification Plan source-chain consistency, including
Business Rule Closure to Change Impact Coverage to Verification Plan binding,
`source_systems[]` top-level consistency, bad fixtures, version metadata, and
release evidence.

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

- Verification Plan referencing a BRC while the CIC is bound to another BRC.
- Verification Plan referencing a BRC while the CIC has missing BRC binding.
- `source_systems[]` digest drift from top-level business-rule fields.
- `source_systems[]` ref drift from top-level impact fields.

## Outcome

Passed in the release working tree.

## Notes

Validation confirmed the positive 1.76 example still passes strict source
binding. Four bad fixtures now fail for the intended reasons: mismatched CIC
business-rule ref, missing CIC business-rule binding, source-system digest
drift, and source-system ref drift.
