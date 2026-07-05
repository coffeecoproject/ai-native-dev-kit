# 1.74.2 Known Limitations

- 1.74.2 is a hardening patch, not a new assurance model.
- Execution Assurance reports still use `schema_version: 1.74.0`; this is
  intentional because the artifact shape remains compatible.
- Resolver-generated reports remain conservative drafts. They do not prove task
  completion unless task-scoped evidence, source-system binding, a resolvable
  execution plan, planned target paths, review, and strict checks support the
  claim.
- `approval_refs` document bounded approval sources. They do not approve extra
  scope, target writes, commit/push, release, production, secrets, migrations,
  provider actions, or governance replacement.
- Generated-project smoke proves installed assets and same-report checking are
  runnable; it does not prove a real external project has adopted IntentOS or
  completed a feature.
- IntentOS still does not approve target-project writes, implementation,
  commit/push, release, production, CI/hooks, secrets, migrations, provider
  actions, or high-risk business decisions.
