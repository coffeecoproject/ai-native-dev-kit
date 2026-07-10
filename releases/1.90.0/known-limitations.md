# Release 1.90.0 Known Limitations

- Verification text is still not a canonical command/test receipt. 1.91 should
  bind test and command evidence to project, task, and source revision.
- Human Decision records are checked for distinct, meaningful project-local
  evidence, but do not yet use one universal structured approval schema.
- Existing Closure Decisions without 1.90 Input Verification stay readable but
  cannot support a verified `DONE` claim.
- 1.90 does not redesign Execution Assurance, full task-tier routing, baseline
  selection, existing-project native apply, or release execution.
