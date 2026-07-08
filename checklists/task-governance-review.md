# Task Governance Review Checklist

- Task impact is classified as `LOW`, `MEDIUM`, `POSSIBLE_HIGH`, or `HIGH`.
- LOW/MEDIUM classifications include concrete reasons and excluded
  high-impact surface evidence.
- LOW tasks do not touch API, DB, permissions, runtime state, business rules,
  release, production, CI, gates, or test behavior.
- MEDIUM tasks do not hide public API, DTO/domain, persistence, permission, or
  runtime-state changes.
- POSSIBLE_HIGH tasks do not proceed without clarification or read-only
  inspection evidence.
- HIGH tasks require Business Rule Closure, Change Impact Coverage, Execution
  Plan, and Verification Plan before implementation review.
- HIGH completion claims require Test Evidence, Execution Assurance, and
  Completion Evidence through existing systems.
- Project-native evidence is mapped with refs, digest expectations, task match,
  and preservation of stronger rules.
- The report does not authorize implementation, commit, push, release,
  production, CI/hook changes, migrations, or tests.
- User-facing prompts are plain language and do not ask users to choose
  internal IntentOS subsystem names.

