# Plan Review Gate Review Checklist

- Verify the report is read-only and non-authorizing.
- Verify Task Governance is the task-impact source of truth.
- Verify high-impact plans include Task Governance binding.
- Verify high-impact passed plans include Review Surface authority, not only a derived matrix.
- Verify high-impact passed plans include Verification Plan source-chain evidence.
- Verify Business Rule Closure / Change Impact Coverage are included when required surfaces need them.
- Recompute that the exact plan contains scope, boundaries, ordered
  implementation steps, verification, rollback/recovery, and concrete target
  references.
- Verify all required review surfaces are reviewed before `PLAN_REVIEW_PASSED`.
- Verify unresolved `P0`/`P1` findings block pass.
- Verify technical `P2` findings remain Codex-owned; any bounded user-input ref
  is limited to a missing business/external fact or exact real-world consent.
- Verify subagent review is read-only, input-only, has a run plan when recommended, and is closed or skipped before pass.
- Verify fallback is not used as a substitute for recommended subagent review in `PLAN_REVIEW_PASSED`.
- Verify each planned verification command resolves to a current project-native
  package script, local script, or project tool; `Unknown` and unsafe working
  directories block pass.
- Verify verification command review is static and does not claim test execution.
- Verify the user-facing summary is plain and does not ask the user to choose technical surfaces.
