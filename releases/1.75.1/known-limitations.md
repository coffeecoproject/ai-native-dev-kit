# Known Limitations - 1.75.1

## Scope

1.75.1 hardens evidence binding between Business Rule Closure and Change Impact Coverage. It does not expand Codex authority.

## Limitations

- The patch verifies that a Change Impact Coverage report references a concrete READY Business Rule Closure report with matching digest/state.
- It does not prove the business rule is correct in the real world.
- It does not prove implementation completeness, test completeness, production readiness, release approval, or customer-data safety.
- It does not replace domain-owner decisions for finance, tax, HR, legal, payment, privacy, compliance, migration, production, customer-data, or other high-risk rules.
- It does not yet add full Markdown/JSON cross-checking for every Business Rule Closure table. That remains a separate consistency-hardening step.
- It does not yet deeply parse arbitrary existing-project business-rule sources. Existing Rule Reconciliation remains the stronger path for old projects with undocumented or conflicting rules.

## Compatibility

- Existing Change Impact Coverage reports stay compatible unless strict BRC binding flags are explicitly enabled.
- Business Rule Closure schema version remains `1.75.0`.
- Change Impact Coverage schema keeps `1.49.0` and adds optional binding fields.
