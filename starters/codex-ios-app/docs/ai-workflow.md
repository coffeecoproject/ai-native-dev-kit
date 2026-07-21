# AI Workflow

## Workflow

```text
Request
  -> Preflight
  -> Spec
  -> Eval
  -> Task
  -> Agent Execution
  -> Verification
  -> Review
  -> Release
  -> AI Task Log
  -> Workflow Retro
```

## Gate Rules

- No vague implementation without preflight.
- No non-trivial implementation without acceptance criteria.
- High-risk iOS work requires stricter internal planning, review, verification,
  and rollback evidence. Codex owns signing, entitlement, architecture,
  security, and release-readiness decisions.
- No merge without verification evidence.
- Local build, signing configuration, and archive preparation are technical
  work. A real App Store Connect upload, TestFlight distribution, App Store
  release, or other external effect requires exact consent after rollback and
  verification are ready.
