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
```

## Required Assets

- `requests/`: raw structured request
- `preflight/`: readiness and risk analysis
- `specs/`: engineering contract
- `evals/`: proof standard
- `tasks/`: small implementation cards
- `ai-logs/`: learning loop
- `releases/`: release evidence

## Gate Rules

- No vague implementation without preflight.
- No non-trivial implementation without acceptance criteria.
- High-risk implementation requires stricter internal planning, review,
  verification, and rollback evidence. Codex owns the technical decision and
  asks the user only for an unavailable business/external fact or consent to a
  prepared real-world effect.
- No merge without verification evidence.
- Local release preparation is technical work. A real publish, store/provider
  upload, production change, or other external effect requires exact consent
  after rollback and verification are ready.
