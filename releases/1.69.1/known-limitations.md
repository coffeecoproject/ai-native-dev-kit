# 1.69.1 Known Limitations

- `reconcile-rules --auto-native` remains read-only. It does not write a Native Migration Plan or Existing Rule Reconciliation report to the target project unless a separate future apply path is reviewed and approved.
- Rule reconciliation is bounded. When extracted rules are omitted, 1.69.1 blocks selected native adoption instead of guessing.
- `can_recommend_apply_plan_after_human_review` means a future plan may be prepared after the block is reviewed. It is not approval to write files now.
- The AI Native Adoption Recommendation is recommendation-only. It does not authorize apply, commit, release, production, provider, secret, migration, payment, permission, data, legal, tax, finance, HR, security, privacy, or compliance work.
- `doctor --dry-run` explains likely routing; it does not replace actual read-only diagnosis or project review evidence.
- 1.69.1 does not add an installer, hosted dashboard, npm publication, automatic apply runner, or GitHub Release automation.
