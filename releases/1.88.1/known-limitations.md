# IntentOS 1.88.1 Known Limitations

1.88.1 is a Plan Review Gate hardening patch.

Known limits:

- It does not execute tests. Verification command review remains static.
- It does not rewrite implementation plans automatically.
- It does not approve implementation, commit, push, release, production,
  migration, or owner decisions.
- It does not make subagent output authoritative.
- It does not replace project-native Review Surface cards; it only prevents a
  derived plan-review matrix from being the only authority for high-impact pass.
- It does not fully wire Plan Review Gate into every downstream consumer. Deeper
  consumer enforcement for Execution Assurance, Completion Evidence, Apply
  Readiness, and related gates remains a follow-up.

These limits are intentional. 1.88.1 strengthens correctness without expanding
runtime authority.

