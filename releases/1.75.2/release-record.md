# Release 1.75.2 - Business Rule Binding Enforcement

## Summary

1.75.2 closes the remaining Business Rule Closure binding enforcement gaps from
1.75.1.

This patch keeps the existing Business Rule Closure and Change Impact Coverage
schemas compatible. It does not add a new workflow layer. It makes explicit
strict business-rule checks behave as strict checks in source and generated
projects.

## Changed

- `check-change-impact-coverage --require-business-rule-ref` and
  `--require-business-rule-ready` now require Change Impact Coverage machine-readable evidence
  even when `--require-structured-evidence` is not passed separately.
- `resolve-business-rule-closure --out <relative-report-path>` now generates a
  `business_rule_ref` that points to the actual output path.
- Business Rule Closure risk classification now uses the current user intent
  for high-risk, permission, status, integration, tax, and appointment rule
  signals. Existing project documents remain context/source refs, but they do
  not automatically turn every rule into a domain-owner decision.
- Source self-check and generated-project smoke now write a Business Rule
  Closure report, write a linked Change Impact Coverage report, and verify the
  saved BRC -> CIC strict binding chain with `--require-business-rule-ready`.
- PR and release workflows now include the same generated-project strict binding
  smoke coverage.

## Compatibility

- Existing Business Rule Closure reports remain valid.
- Existing Change Impact Coverage reports remain valid unless explicit strict
  business-rule binding flags are used.
- Business Rule Closure evidence keeps schema version `1.75.0`.
- Change Impact Coverage evidence keeps schema version `1.49.0`.

## Allowed Claims

- Codex can reject strict business-rule binding checks when the Change Impact
  Coverage report has no machine-readable evidence.
- Codex can generate a Business Rule Closure report with `--out` and have the
  report self-reference that actual path.
- Generated projects can prove that a saved Change Impact Coverage report
  consumed a saved READY Business Rule Closure report.

## Forbidden Claims

- This patch does not authorize implementation.
- This patch does not prove implementation completeness.
- This patch does not approve commit, push, release, production, CI, hooks,
  secrets, migrations, provider actions, payment, permissions, or data changes.
- This patch does not prove real-world business correctness.
- This patch does not replace domain-owner decisions for finance, tax, HR,
  legal, payment, privacy, compliance, migration, production, customer-data, or
  other high-risk rules.

## Known Limitations

- It does not prove that a business rule is correct in the real world.
- It does not prove implementation completeness, test completeness, product
  correctness, production readiness, release approval, or customer-data safety.
- It does not add full Markdown/JSON cross-checking for every Business Rule
  Closure table. That remains a separate consistency-hardening step.
- It does not deeply parse arbitrary existing-project business-rule sources.
  Existing Rule Reconciliation remains the stronger path for old projects with
  undocumented, conflicting, or high-risk rules.
- Existing Change Impact Coverage reports stay compatible unless strict BRC
  binding flags are explicitly enabled.

## Verification

Planned verification for this release:

```bash
node --check scripts/resolve-business-rule-closure.mjs
node --check scripts/check-business-rule-closure.mjs
node --check scripts/resolve-change-impact-coverage.mjs
node --check scripts/check-change-impact-coverage.mjs
node scripts/check-business-rule-closure.mjs examples/1.75-business-rule-closure/appointment-service-time --require-structured-evidence
node scripts/check-change-impact-coverage.mjs <tmp-project> --report change-impact-coverage-reports/001-generated.md --require-business-rule-ready
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Evidence Status

Evidence status: passed local verification.

See `releases/1.75.2/self-check-report.md` for the recorded `check-intentos`,
`npm run verify`, manual strict-binding, and negative strict-binding evidence.
