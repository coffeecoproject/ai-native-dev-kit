# IntentOS 1.85.1 Known Limitations

- 1.85.1 validates structured source evidence; it does not prove source-system
  business correctness.
- 1.85.1 proves joint Work Queue / Task Governance identity, but it does not
  authorize implementation, completion, commit, push, release, or production.
- Resume review structure is checked only when `approved_resume_review` is
  `Yes`; it does not approve resuming work by itself.
- HIGH task completion still depends on the full source evidence chain consumed
  by Execution Assurance and Completion Evidence.

