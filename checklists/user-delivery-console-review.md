# User Delivery Console Review Checklist

- User-facing sections avoid internal artifact names and strict command flags.
- Card answers first version, current state, task completion, product readiness,
  launch readiness, missing items, and safe next action.
- Human decisions are limited to three by default, five only for high-risk
  states.
- Technical trace explains lower-level source systems but does not become
  authority.
- Card does not approve implementation, commit, push, release, production,
  CI/hooks, migrations, payment, permissions, compliance, or security.
- Card does not claim real-user stability.
- Missing items and safe next action are concrete.
- Verification planning and actual test/check evidence are separate
  user-facing fields.
- Free-text user verification notes are separate from Test Evidence reports.
- Final task completion is not claimed unless lower-level completion evidence
  exists, passes strict Completion Evidence checks, and matches the current
  request intent.
- Intermediate source signals do not count other-task Business Rule Closure,
  Change Impact Coverage, Verification Plan, Test Evidence, or Execution
  Assurance as current-task evidence.
- User-facing sections use plain-language states instead of raw internal enums.
