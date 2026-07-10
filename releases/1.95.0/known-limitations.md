# IntentOS 1.95.0 Known Limitations

- Operating State, Evidence Trace, and Authority Recommendation are computed
  read-only views. They are not persisted evidence and cannot replace strict
  source-system checks.
- A project installed before 1.95 may not have `projectEntryOrigin`; IntentOS
  then falls back to existing project signals and the natural-language goal.
- Natural-language operation routing is deterministic and conservative. An
  ambiguous goal may remain in continue/status review until the goal is made
  clearer.
- The Operating Model does not execute tests, judge test quality, verify
  production state, or prove product correctness.
- The Operating Model does not write project files, change task state, approve
  implementation or apply, install governance, or approve release/production.
- Existing projects still retain stricter valid project rules and controlled
  migration requirements where applicable.
