# IntentOS 1.76.2 Release Record

## Summary

IntentOS 1.76.2 hardens Verification Plan Markdown/JSON consistency. It keeps
1.76 focused on planning verification obligations: the human-readable report
must now match the machine-readable evidence, so a report cannot tell users one
thing while JSON drives another.

## Allowed Claims

- Verification Plan checks now compare Markdown Source Systems, identity,
  project calibration, affected surfaces, verification obligations, manual
  verification, not-applicable obligations, and outcome against structured JSON
  evidence.
- Bad fixtures prove source digest drift, identity digest drift, surface status
  drift, missing Markdown obligation rows, and outcome drift are rejected.
- The 1.76.0 artifact schema remains compatible.

## Forbidden Claims

- This release does not execute tests.
- This release does not add Test Evidence Report.
- This release does not bind actual test results to execution completion.
- This release does not approve implementation, release, production, migration,
  secrets, payment, provider, CI, hooks, or customer-data actions.
- This release does not prove product correctness or real-environment behavior.

## Evidence Status

- `scripts/check-verification-plan.mjs` now parses Markdown report sections and
  compares them with JSON evidence.
- `scripts/check-intentos.mjs` includes 1.76.2 bad fixtures in self-check.
- `test-fixtures/bad/bad-verification-plan-markdown-source-digest-mismatch`
  proves Source Systems digest drift is rejected.
- `test-fixtures/bad/bad-verification-plan-markdown-identity-digest-mismatch`
  proves identity digest drift is rejected.
- `test-fixtures/bad/bad-verification-plan-markdown-surface-status-mismatch`
  proves affected surface drift is rejected.
- `test-fixtures/bad/bad-verification-plan-markdown-obligation-missing`
  proves missing obligation rows are rejected.
- `test-fixtures/bad/bad-verification-plan-markdown-outcome-mismatch`
  proves outcome drift is rejected.

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
