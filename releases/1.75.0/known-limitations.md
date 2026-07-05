# Known Limitations - 1.75.0

## Scope

Business Rule Closure improves task-level business-rule completeness before implementation. It does not turn IntentOS into a legal, compliance, tax, finance, HR, payment, privacy, migration, production, or release authority.

## Limitations

- The resolver infers rule dimensions from user wording and lightweight project signals. It can miss project-specific domain facts when those facts are not documented.
- The checker verifies the Business Rule Closure artifact, not real business correctness.
- Real-environment validation remains an expectation until separate evidence exists.
- Safe defaults reduce user burden, but they do not replace explicit user or domain-owner decisions when the rule is high-risk or project-owned.
- `READY_FOR_IMPACT_COVERAGE` means the rule is clear enough to map affected implementation surfaces. It does not authorize code changes.
- The first positive example uses an appointment service-time rule. Contract, tax, finance, HR, legal, or similar wording is present only as risk calibration and bad-fixture coverage.
- Business Rule Closure does not yet resolve every possible existing business rule source in arbitrary old projects. Existing-rule conflicts must still be handled by project-specific docs, Native Migration, Existing Rule Reconciliation, or human/domain-owner review when needed.

## Compatibility

- Default checks remain compatible with projects that have no saved Business Rule Closure report when `--allow-empty` is explicit.
- Strict task workflows can require a saved Business Rule Closure report with `--require-business-rule-closure`.
- Change Impact Coverage remains available without `--business-rule-ref` for older records, but new rule-heavy tasks should carry the reference when a Business Rule Closure Card exists.
