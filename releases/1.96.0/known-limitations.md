# IntentOS 1.96.0 Known Limitations

- Operating Decision is a derived view, not a scheduler or execution engine.
- Source-system strict checkers remain authoritative for evidence validity.
- Task Governance may continue to report a prerequisite until its own source
  integration recognizes the completed current-task evidence.
- `canCodexContinueReadOnly` does not authorize a write or material action.
- Owner roles are recommendations; named owner resolution remains project-owned.
- Closure evidence may be supplied through advanced flags, but beginner users
  are not expected to select those flags or evidence refs.
- Project Identity Projection is not part of 1.96.
- Internal source-system commands remain available to maintainers and CI.
- No repository-only test proves a real project, provider, or production state.
