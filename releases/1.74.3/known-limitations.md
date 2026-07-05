# 1.74.3 Known Limitations

- Execution Assurance reports continue to use schema version `1.74.0`.
- Markdown/JSON consistency checks cover Execution Plan Binding, Actual Diff
  Binding, and Evidence Binding. They do not make Markdown authoritative.
- The checker compares normalized comma-separated table values; reports with
  unusual table formatting may need to follow the standard template.
- This release does not prove product correctness, production readiness, or
  real-world release safety.
- This release does not authorize implementation, target-project writes, commit,
  push, release, production, CI/hook mutation, secrets, migrations, provider
  actions, or governance replacement.
