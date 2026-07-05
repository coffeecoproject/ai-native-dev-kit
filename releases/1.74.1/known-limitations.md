# 1.74.1 Known Limitations

- 1.74.1 is a consistency patch, not a new assurance model.
- Execution Assurance reports still use `schema_version: 1.74.0`; this is
  intentional because the artifact shape remains compatible.
- Resolver-generated reports are conservative drafts. They do not prove task
  completion unless task-scoped evidence, source-system binding, planned target
  paths, review, and strict checks support the claim.
- Generated-project smoke proves installed assets and commands are runnable; it
  does not prove a real external project has adopted IntentOS or completed a
  feature.
- Naming hardcut catches active source identity drift, but historical release
  context and explicitly scoped migration-plan history can still exist where
  the current checker allows it.
- IntentOS still does not approve target-project writes, implementation,
  commit/push, release, production, CI/hooks, secrets, migrations, provider
  actions, or high-risk business decisions.
