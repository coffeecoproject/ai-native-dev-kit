# IntentOS 1.79.2 Known Limitations

## Scope

This patch binds User Delivery Console completion status to the current request
intent. It does not create missing lower-level evidence.

## Current Limitations

- Intent matching is based on exact `intent_digest`, not semantic similarity.
- If the user restates the same task with different wording, Codex may need to
  identify or reuse the canonical task intent before `status` can show done.
- Other-task completion records are visible as project context, but they do not
  complete the current request.
- Launch review readiness is not release approval.
- Real-user stability still requires project-specific runtime, monitoring, and
  release evidence outside this card.
