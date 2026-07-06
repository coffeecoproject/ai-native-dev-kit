# IntentOS 1.78.2 Known Limitations

- Completion Evidence Gate remains a recorded-evidence checker. It does not run
  tests, inspect production systems, or verify live customer behavior.
- Top-level Execution Assurance `intent_digest` proves intent binding only; it
  does not prove implementation quality or product correctness.
- The Completion Evidence artifact schema remains `1.78.0`, and the Execution
  Assurance artifact schema remains `1.74.0`; 1.78.2 is a contract hardening
  patch within the existing artifact shapes.
- Release, production, deployment, migration, provider, secrets, payment, and
  compliance decisions remain outside this release.
