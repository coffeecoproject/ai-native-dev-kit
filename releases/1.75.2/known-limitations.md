# Known Limitations - 1.75.2

## Scope

1.75.2 hardens strict Business Rule Closure -> Change Impact Coverage binding.
It does not expand Codex authority.

## Limitations

- The patch verifies saved report binding. It does not prove the business rule is
  correct in the real world.
- It does not prove implementation completeness, test completeness, product
  correctness, production readiness, release approval, or customer-data safety.
- It does not replace domain-owner decisions for finance, tax, HR, legal,
  payment, privacy, compliance, migration, production, customer-data, or other
  high-risk rules.
- It does not add full Markdown/JSON cross-checking for every Business Rule
  Closure table. That remains a separate consistency-hardening step.
- It does not deeply parse arbitrary existing-project business-rule sources.
  Existing Rule Reconciliation remains the stronger path for old projects with
  undocumented, conflicting, or high-risk rules.

## Compatibility

- Existing Change Impact Coverage reports stay compatible unless strict BRC
  binding flags are explicitly enabled.
- Business Rule Closure schema version remains `1.75.0`.
- Change Impact Coverage schema remains `1.49.0`.
- `--require-business-rule-ready` now implies machine-readable Change Impact
  Coverage evidence. Reports without structured evidence fail under that strict
  flag by design.
