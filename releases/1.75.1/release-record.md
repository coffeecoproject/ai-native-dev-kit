# Release 1.75.1 - Business Rule Ref Binding

## Summary

1.75.1 tightens the binding between Business Rule Closure and Change Impact Coverage.

1.75.0 introduced Business Rule Closure and allowed Change Impact Coverage to carry `business_rule_ref`. This patch makes that link checkable:

- Business Rule Closure reports must self-reference the current report file.
- Change Impact Coverage resolver carries `business_rule_digest` and `business_rule_state` when `--business-rule-ref` resolves.
- Change Impact Coverage checker can require a resolvable READY Business Rule Closure with matching digest and state.

This is a binding hardening patch. It does not add a new workflow layer and does not change the Business Rule Closure schema version.

## Added

- `check-change-impact-coverage --require-business-rule-ref`
- `check-change-impact-coverage --require-business-rule-ready`
- Change Impact Coverage machine evidence fields:
  - `business_rule_digest`
  - `business_rule_state`
- Business Rule Closure self-reference validation.
- Self-check coverage for BRC -> CIC ready binding.

## Changed

- The appointment service-time positive example report filename now matches its `business_rule_ref`.
- `resolve-change-impact-coverage` resolves referenced Business Rule Closure reports when available and carries digest/state into output.
- `check-change-impact-coverage` validates referenced Business Rule Closure evidence under explicit strict flags.

## Compatibility

- Existing Change Impact Coverage reports remain valid by default.
- `business_rule_digest` and `business_rule_state` are optional schema fields.
- Strict BRC -> CIC binding is required only when `--require-business-rule-ref` or `--require-business-rule-ready` is used.
- Business Rule Closure evidence keeps schema version `1.75.0`; this patch tightens binding checks rather than changing the artifact shape.

## Allowed Claims

- Codex can prove that a Change Impact Coverage report consumed a specific Business Rule Closure report when strict binding flags pass.
- Codex can carry `business_rule_ref`, `business_rule_digest`, and `business_rule_state` forward for later evidence chains.
- Codex can reject a Business Rule Closure report whose `business_rule_ref` points to a different report.

## Forbidden Claims

- This patch does not authorize implementation.
- This patch does not prove the implementation is complete.
- This patch does not approve release or production.
- This patch does not approve finance, tax, HR, legal, payment, privacy, compliance, migration, production, customer-data, or other high-risk domain decisions.
- A READY Business Rule Closure still only means the rule can enter Change Impact Coverage.

## Verification

Planned verification for this release:

```bash
node --check scripts/check-business-rule-closure.mjs
node --check scripts/check-change-impact-coverage.mjs
node --check scripts/resolve-change-impact-coverage.mjs
node scripts/check-business-rule-closure.mjs examples/1.75-business-rule-closure/appointment-service-time --require-structured-evidence
node scripts/resolve-change-impact-coverage.mjs examples/1.75-business-rule-closure/appointment-service-time --intent "appointment requests must include a service time" --business-rule-ref artifact:business-rule-closures/001-appointment-requests-must-include-a-service-time.md --json
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Known Limitations

- Strict Change Impact Coverage binding verifies the referenced Business Rule Closure artifact, not real-world business correctness.
- It verifies READY state and digest/state matching, but it does not prove implementation or runtime behavior.
- It does not replace later Execution Assurance, Review Surface, Product Completeness, or release readiness evidence.
- Existing projects with undocumented business rules can still need Existing Rule Reconciliation or human/domain-owner review.

## Evidence Status

Evidence status: passed local verification.

See `self-check-report.md` for the final command outcomes. The release evidence confirms:

- Business Rule Closure self-reference validation passes.
- Change Impact Coverage carries `business_rule_ref`, `business_rule_digest`, and `business_rule_state`.
- Change Impact Coverage strict mode verifies a READY referenced Business Rule Closure.
- `check-intentos`, `npm run verify`, and `git diff --check` pass.
