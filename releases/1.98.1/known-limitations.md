# IntentOS 1.98.1 Known Limitations

- Human approval is a structured project record; IntentOS does not
  cryptographically authenticate the named human.
- Project and Git digests describe observable local state, not external
  provider, database, app-store, or production state.
- Apply rollback covers approved project-local writes only and cannot reverse
  prohibited external side effects.
- Launch Review and Release Approval can authorize review or handoff within
  project policy, but IntentOS does not become the release owner.
- Draft standard and industrial packs remain evidence-requiring guidance, not
  security, privacy, compliance, or production certification.
- Full adoption proves the recorded workflow activation and agent entry, not
  that every future model response will be error-free.
