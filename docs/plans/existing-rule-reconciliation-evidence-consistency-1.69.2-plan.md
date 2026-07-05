# Existing Rule Reconciliation Evidence Consistency 1.69.2 Plan

## Goal

Harden Existing Rule Reconciliation so old-project IntentOS adoption advice is
traceable and understandable.

This patch does not add a new migration mode. It tightens the evidence required
before Codex recommends how an old project should move toward IntentOS-native
work.

## Problem

1.69.1 correctly blocked selected native adoption when extracted rules were
omitted, but the reconciliation evidence still had two weak spots:

- human-readable tables could list rule references that were missing from
  `existing_rule_source` or `intentos_reference_source`;
- the template could show one reconciliation item while the machine-readable
  JSON contained empty source and item arrays;
- the user-facing IntentOS Adoption Recommendation was not required by the
  checker;
- `doctor --dry-run` help wording implied command printing only, even though
  old-project diagnosis may run a read-only workflow routing preview.

## Scope

Update:

- Existing Rule Reconciliation template
- governed old-project example
- reconciliation schema
- reconciliation resolver
- reconciliation checker
- review checklist and agent prompt
- CLI help wording
- README / VERSION / manifest / release evidence

Do not:

- write target-project files
- change native migration depth semantics
- approve governance replacement
- approve implementation
- approve release or production
- add CI / hook / workflow authority

## Design

Strict Existing Rule Reconciliation reports now use:

```text
schema_version: 1.69.2
evidence_profile: existing-rule-reconciliation-1.69.2
```

The checker requires:

```text
reconciliation_items[].existing_rule_ref
  -> existing_rule_source[].rule_ref

reconciliation_items[].intentos_reference_ref
  -> intentos_reference_source[].reference_ref
```

The human report requires:

```text
IntentOS Adoption Recommendation
- Recommendation
- Migration Depth
- Can Codex write now
- Human Confirmation
- Preserve
- Merge
- Replace After Approval
- Blocked
```

## Execution Plan

1. Make the report template internally consistent.
2. Update the governed web-admin example so every referenced rule/ref resolves
   to a source record.
3. Add `evidence_profile` and 1.69.2 schema version requirements.
4. Add source reference coverage checks to
   `scripts/check-existing-rule-reconciliation.mjs`.
5. Require `IntentOS Adoption Recommendation` in the checker.
6. Calibrate CLI help for `doctor --dry-run`.
7. Update version, manifest, release record, and self-check evidence.

## Acceptance

Must pass:

```bash
node --check scripts/resolve-existing-rule-reconciliation.mjs
node --check scripts/check-existing-rule-reconciliation.mjs
node scripts/check-existing-rule-reconciliation.mjs examples/1.66-existing-rule-reconciliation/governed-web-admin --require-structured-evidence
node scripts/check-existing-rule-reconciliation.mjs .
npm run verify
```

Manual review:

- template JSON is not empty when the human table has reconciliation rows;
- example source arrays cover every matrix item reference;
- strict checker fails if a reconciliation item references a missing source;
- user-facing recommendation remains recommendation-only and keeps
  `Can Codex write now: No`.

## Expected Result

Old-project rule reconciliation becomes easier to trust:

- Codex can still recommend an IntentOS-native migration path;
- humans see a plain recommendation summary;
- maintainers get machine-checkable source traceability;
- no project writes happen without the later apply-plan and approval chain.
