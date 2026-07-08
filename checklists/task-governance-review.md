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
- Review policy matches the task tier: LOW = `LIGHTWEIGHT`, MEDIUM =
  `TARGETED`, POSSIBLE_HIGH = `BLOCKING_CLARIFICATION`, HIGH = `FULL`.
- LOW still has a self-check review before completion claim.
- MEDIUM still has targeted review or checker-backed validation before
  completion claim.
- POSSIBLE_HIGH blocks implementation review until clarification or read-only
  inspection resolves the tier.
- HIGH requires independent review through Review Loop or project-native review
  evidence.
- Project-native evidence is mapped with a resolvable `artifact:` ref, matching
  digest, owner, scope, current-task match, plain summary, and preservation of
  stronger rules.
- `MATCHED` or `STRONGER` project-native mappings must not use unresolved refs,
  stale digests, unknown owners, unknown scope, or `project_native_task_match`
  values other than `Yes`.
- `MISSING` project-native mappings must be explicit `N/A` records and explain
  what evidence is missing.
- The report does not authorize implementation, commit, push, release,
  production, CI/hook changes, migrations, or tests.
- User-facing prompts are plain language and do not ask users to choose
  internal IntentOS subsystem names.
