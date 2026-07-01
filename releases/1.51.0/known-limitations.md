# IntentOS 1.51.0 Known Limitations

- Precision mode is opt-in and does not affect historical reports unless `--require-precise-evidence` is used.
- Resolved evidence file checks reject weak placeholders, but they do not prove the evidence is sufficient product proof.
- Task/intent matching is conservative string alignment, not a full semantic matcher.
- Recorded artifact and human-decision references prove a record exists; they do not approve implementation, release, production, or high-risk scope.
- Single-report checking through `--report` is read-only and does not select or generate the correct report automatically.
