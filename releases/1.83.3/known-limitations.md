# IntentOS 1.83.3 Known Limitations

- Task Governance remains a classifier, router, and review-policy gate.
- It does not globally block every execution or closure path yet.
- Verification status fields do not run tests or prove verification quality.
- Intent scanning is keyword-based and conservative.
- Project-native mapping can clear matching readiness blockers only when the
  mapping is matched or stronger and current-task matched.
- User-facing summaries are plain-language, but structured reports still
  contain technical evidence for Codex and reviewers.
- This release does not approve implementation, completion, commit/push,
  release, production, native apply, or full IntentOS adoption.
