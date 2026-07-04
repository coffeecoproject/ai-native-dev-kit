# Release 1.69.2

## Theme

Existing Rule Reconciliation Evidence Consistency.

## Summary

1.69.2 tightens old-project rule reconciliation evidence so Codex can recommend
an IntentOS-native adoption path without hiding missing source references.

This is a patch release. It does not change write authority, migration
semantics, release authority, CI, hooks, or target-project behavior.

## Changes

- Updated Existing Rule Reconciliation structured evidence to
  `schema_version: 1.69.2`.
- Added `evidence_profile: existing-rule-reconciliation-1.69.2`.
- Made the report template internally consistent: the human matrix and JSON
  evidence now describe the same reconciliation item.
- Updated the governed web-admin example so every referenced existing rule and
  IntentOS reference resolves to a source record.
- Added strict checker validation for:
  - `reconciliation_items[].existing_rule_ref` resolving to
    `existing_rule_source[].rule_ref`;
  - `reconciliation_items[].intentos_reference_ref` resolving to
    `intentos_reference_source[].reference_ref`;
  - required human-readable `AI Native Adoption Recommendation` content.
- Updated schema, core docs, user docs, checklist, and agent prompt.
- Calibrated CLI help so `--dry-run` explains read-only doctor routing preview.

## Boundaries

- No target-project writes.
- No governance replacement approval.
- No implementation approval.
- No release or production approval.
- No CI, hook, provider, secret, migration, payment, permission, data, or
  production configuration changes.

## Allowed Claims

- 1.69.2 makes Existing Rule Reconciliation strict evidence internally
  consistent.
- Strict reports require `schema_version: 1.69.2` and
  `evidence_profile: existing-rule-reconciliation-1.69.2`.
- Strict checks verify that every reconciliation item resolves its existing
  rule reference and IntentOS reference to recorded source records.
- The human-facing AI Native Adoption Recommendation section is required.
- `doctor --dry-run` help now explains that old-project diagnosis may run
  read-only workflow routing preview.
- The release remains recommendation-only and does not authorize target-project
  writes.

## Forbidden Claims

- Do not claim 1.69.2 automatically migrates old projects.
- Do not claim 1.69.2 installs `.ai-native` into existing projects.
- Do not claim source reference coverage proves business correctness.
- Do not claim a recommendation is approval to write, commit, push, release, or
  deploy.
- Do not claim IntentOS replaces existing project rules, baselines, release
  SOPs, CI, hooks, production controls, secrets, migrations, payment,
  permissions, data, provider state, legal, tax, finance, HR, security,
  privacy, or compliance behavior.
- Do not claim GitHub Release publication is covered by source verification.

## Verification

Required commands:

```bash
node --check scripts/resolve-existing-rule-reconciliation.mjs
node --check scripts/check-existing-rule-reconciliation.mjs
node scripts/check-existing-rule-reconciliation.mjs examples/1.66-existing-rule-reconciliation/governed-web-admin --require-structured-evidence
node scripts/check-existing-rule-reconciliation.mjs .
npm run verify
```

## Evidence Status

- Version metadata points to `1.69.2`.
- Manifest version points to `1.69.2`.
- Strict governed web-admin example validation is expected to pass.
- The new missing-source-ref bad fixture is expected to fail strict
  reconciliation validation.
- Source verification evidence is recorded in
  [self-check-report.md](self-check-report.md).
- GitHub Release publication remains outside source verification.

Results are recorded in
`releases/1.69.2/self-check-report.md`.

## Known Limitations

- This release is source-only. It does not publish an npm package or GitHub
  Release by itself.
- Source reference coverage proves traceability, not domain correctness.
- Older Markdown reports remain readable by default but should be regenerated
  before strict adoption review.
- See [known-limitations.md](known-limitations.md).

## Outcome

`RELEASE_RECORDED`
