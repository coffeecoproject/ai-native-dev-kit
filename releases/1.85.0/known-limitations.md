# IntentOS 1.85.0 Known Limitations

- 1.85.0 is a consumer integration layer, not a task execution layer.
- Strict flags are opt-in so historical reports remain compatible.
- Strict mode requires recorded Work Queue and Task Governance artifacts; it
  does not create those artifacts automatically.
- Task Entry Binding proves identity and tier consistency, not product
  correctness.
- User-facing status remains a derived view; project-native reviewers and
  release owners remain authoritative.
- HIGH task completion still requires source-system evidence outside this
  helper. The helper only checks that the consumer acknowledges the high-impact
  evidence-chain status.
- Existing projects may map project-native task systems, but stale or missing
  bindings cannot be used for done claims in strict mode.
