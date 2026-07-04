# Existing Rule Reconciliation Review Checklist

- The report says it is a recommendation, not permission to change files.
- `Can Codex write now` is `No`.
- `Reconciliation Authority` is `RECOMMENDATION_ONLY`.
- Business authority remains `PROJECT_OWNED`.
- Production authority remains `HUMAN_OR_EXTERNAL_SYSTEM`.
- Release / production items do not use `ADOPT_INTENTOS` or `MERGE`.
- `ADOPT_INTENTOS` is limited to low/medium-risk engineering baseline gaps.
- `MERGE` includes existing rule ref, IntentOS ref, merge reason, preserved
  terms, added terms, human decision, and apply-plan target action.
- Protected constraints have owner / authority / human decision.
- `GAP_SUGGESTION` does not imply release approval.
- Machine-readable evidence uses `schema_version: 1.69.2` and
  `evidence_profile: existing-rule-reconciliation-1.69.2`.
- Every `reconciliation_items[].existing_rule_ref` resolves to
  `existing_rule_source[].rule_ref`.
- Every `reconciliation_items[].intentos_reference_ref` resolves to
  `intentos_reference_source[].reference_ref`.
- The report includes `AI Native Adoption Recommendation` with Recommendation,
  Migration Depth, Can Codex write now, Human Confirmation, Preserve, Merge,
  Replace After Approval, and Blocked.
- Proposed next steps include Unified Apply Plan, Controlled Apply Readiness,
  Approval Record, and relevant release handoff review before writes.
- Boundaries reject target writes, governance replacement, implementation,
  release, production, CI, hooks, provider calls, secrets, migrations, payment,
  permissions, data, and business-rule changes.
