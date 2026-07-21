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
- High-risk Android work requires stricter internal planning, review,
  verification, and rollback evidence. Codex owns keystore integration,
  manifest, architecture, security, and release-readiness decisions.
- No merge without verification evidence.
- Local build, signing configuration, and bundle/APK preparation are technical
  work. A real Play Console upload, testing-track distribution, production
  release, or other external effect requires exact consent after rollback and
  verification are ready.
