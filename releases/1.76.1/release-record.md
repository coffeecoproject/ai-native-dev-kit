# IntentOS 1.76.1 Release Record

## Summary

IntentOS 1.76.1 hardens Verification Plan source-chain consistency. It does not
add a new workflow layer; it tightens the 1.76.0 Verification Plan checker so a
plan cannot mix a Business Rule Closure from one chain with a Change Impact
Coverage report from another chain.

## Allowed Claims

- Strict Verification Plan checks now compare the Change Impact Coverage
  `business_rule_ref`, `business_rule_digest`, and `business_rule_state`
  against the Verification Plan's top-level Business Rule Closure fields.
- `source_systems[]` entries now must match the top-level business-rule and
  impact refs, digests, and outcomes.
- Bad fixtures cover mismatched impact chains, missing impact business-rule
  binding, mismatched source-system digest, and mismatched source-system ref.
- README capability tables now name Verification Plan Governance directly.

## Forbidden Claims

- This release does not execute tests.
- This release does not add Test Evidence Report.
- This release does not approve implementation, release, production, migration,
  secrets, payment, provider, CI, hooks, or customer-data actions.
- This release does not prove product correctness or real-environment behavior.

## Evidence Status

- `scripts/check-verification-plan.mjs` enforces the new consistency checks.
- `scripts/check-intentos.mjs` includes the 1.76.1 bad fixtures in self-check.
- `test-fixtures/bad/bad-verification-plan-impact-bound-to-different-business-rule`
  proves mismatched BRC/CIC chains are rejected.
- `test-fixtures/bad/bad-verification-plan-impact-missing-business-rule-binding`
  proves missing CIC business-rule binding is rejected.
- `test-fixtures/bad/bad-verification-plan-source-systems-digest-mismatch`
  proves `source_systems[]` digest drift is rejected.
- `test-fixtures/bad/bad-verification-plan-source-systems-ref-mismatch`
  proves `source_systems[]` ref drift is rejected.

## Known Limitations

- Verification Plan Markdown/JSON table cross-checking is still not complete;
  JSON evidence remains the machine authority for 1.76.x.
- This patch does not bind actual test results. Test Evidence Binding remains a
  later layer.

## Verification

Expected local verification:

```bash
node --check scripts/check-verification-plan.mjs
node scripts/check-verification-plan.mjs examples/1.76-verification-plan/appointment-service-time --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-intentos.mjs
npm run verify
```
