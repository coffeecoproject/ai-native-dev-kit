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
- No high-risk iOS change without explicit human approval.
- No merge without verification evidence.
- No release/archive/upload without release approval and rollback notes.

