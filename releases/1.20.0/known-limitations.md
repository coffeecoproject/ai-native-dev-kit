# 1.20.0 Known Limitations

- `workflow-map` prints a read-only recommendation; it does not write a report
  into the target project.
- It inventories file and directory signals, but it does not fully parse every
  project-specific governance rule.
- It does not solve document lifecycle, stale-doc cleanup, work queues, task
  pause/resume, or hook orchestration.
- It does not approve target-project writes, implementation, release,
  production, security, privacy, compliance, payment, finance, tax, HR,
  migration, permission, or data decisions.
- Remote GitHub Actions evidence is not embedded until a run URL is recorded
  after push.
