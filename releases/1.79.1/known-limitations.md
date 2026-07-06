# IntentOS 1.79.1 Known Limitations

## Scope

This patch tightens how User Delivery Console reads existing evidence. It does not create missing Business Rule Closure, Verification Plan, Test Evidence, Execution Assurance, Completion Evidence, Release Plan, or launch evidence.

## Current Limitations

- Strict task-done status requires a local `scripts/check-completion-evidence.mjs` checker and a valid Completion Evidence report.
- If a project has only text-like completion signals or stale reports, `status` must remain conservative.
- Verification plans and test/check evidence are shown separately, but their source systems remain authoritative.
- Launch review readiness is not release approval.
- Real-user stability still requires project-specific runtime, monitoring, and release evidence outside this card.
