# Release 1.91.0 Known Limitations

- Evidence Authority Core proves identity and integrity of local evidence, not
  whether a command was semantically sufficient or a product behavior is right.
- A report written without a stable project-local output path remains a preview
  and cannot be treated as persisted authoritative evidence.
- Existing historical reports stay readable but need a new binding to satisfy
  `--require-evidence-authority`.
- Release ownership, apply approval, baseline selection, and provider actions
  remain separate systems with their own constraints.
