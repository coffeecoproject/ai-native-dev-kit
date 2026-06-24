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
- No high-risk implementation without explicit human approval.
- No merge without verification evidence.
- No release without rollback notes.

