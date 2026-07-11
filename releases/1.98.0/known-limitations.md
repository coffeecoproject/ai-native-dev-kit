# IntentOS 1.98.0 Known Limitations

- Human approval remains a structured project record. Without an external
  identity authority, IntentOS cannot cryptographically prove who created it.
- Current-state digests detect observed project changes but do not prove that
  an external provider, database, store, or production environment is unchanged.
- Apply rollback covers approved and attempted project writes. It does not
  reverse external side effects, which remain prohibited from this path.
- Launch Review is independently required for release execution, but release
  approval and production execution remain owned by a human or external system.
- Draft baseline and industrial packs remain pending until project evidence is
  valid; installation alone is not certification.
- Git observation can fail because of environment or repository corruption. A
  failed observation blocks trust claims rather than inferring a clean tree.
- Repository and synthetic tests do not prove a real user journey, production
  runtime, external provider, or product outcome.
