# IntentOS 1.76.3 Release Record

## Summary

IntentOS 1.76.3 closes the Verification Plan consistency line before Test
Evidence Binding. It keeps 1.76 focused on planning verification obligations:
the report users read and the JSON evidence checkers consume must now agree both
ways.

## Allowed Claims

- Verification Plan strict checks reject Markdown-only extra rows for Source
  Systems, Affected Surface Inputs, Verification Obligations, Manual
  Verification, and Not Applicable Obligations.
- Test Correctness Controls are now compared between Markdown and JSON evidence.
- `VERIFICATION_PLAN_READY` plans must use `RECORDED` Business Rule Closure and
  Change Impact Coverage source-system statuses.
- Bad fixtures prove extra Markdown rows, Test Correctness Control drift, and
  unresolved READY source systems are rejected.
- The 1.76.0 artifact schema remains compatible.

## Forbidden Claims

- This release does not execute tests.
- This release does not add Test Evidence Report.
- This release does not bind actual test results to execution completion.
- This release does not approve implementation, release, production, migration,
  secrets, payment, provider, CI, hooks, or customer-data actions.
- This release does not prove product correctness or real-environment behavior.

## Evidence Status

- `scripts/check-verification-plan.mjs` rejects Markdown-only extra rows in
  strict report sections.
- `scripts/check-verification-plan.mjs` cross-checks Test Correctness Controls.
- `scripts/check-verification-plan.mjs` requires READY source systems to be
  recorded for BRC/CIC source records.
- `scripts/check-intentos.mjs` includes 1.76.3 bad fixtures in self-check.
- `test-fixtures/bad/bad-verification-plan-markdown-extra-obligation` proves
  Markdown-only obligation rows are rejected.
- `test-fixtures/bad/bad-verification-plan-markdown-extra-source-system` proves
  Markdown-only source-system rows are rejected.
- `test-fixtures/bad/bad-verification-plan-markdown-extra-surface` proves
  Markdown-only affected-surface rows are rejected.
- `test-fixtures/bad/bad-verification-plan-markdown-extra-not-applicable`
  proves Markdown-only not-applicable rows are rejected.
- `test-fixtures/bad/bad-verification-plan-markdown-test-control-mismatch`
  proves Test Correctness Control drift is rejected.
- `test-fixtures/bad/bad-verification-plan-markdown-test-control-missing` proves
  missing Test Correctness Control Markdown rows are rejected.
- `test-fixtures/bad/bad-verification-plan-ready-with-unresolved-source-system`
  proves READY plans cannot use unresolved BRC/CIC source-system records.

## Known Limitations

- This patch does not introduce Test Evidence Binding.
- Verification Plan remains a planning artifact. Actual test results still
  belong in a future Test Evidence layer.

## Verification

Expected local verification:

```bash
node --check scripts/check-verification-plan.mjs
node scripts/check-verification-plan.mjs examples/1.76-verification-plan/appointment-service-time --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-intentos.mjs
npm run verify
```
