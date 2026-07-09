# Plan Review Gate Review Checklist

- Confirm the report is read-only and non-authorizing.
- Confirm Task Governance is the task-impact source of truth.
- Confirm high-impact plans include Task Governance binding.
- Confirm high-impact passed plans include Review Surface authority, not only a derived matrix.
- Confirm high-impact passed plans include Verification Plan source-chain evidence.
- Confirm Business Rule Closure / Change Impact Coverage are included when required surfaces need them.
- Confirm all required review surfaces are reviewed before `PLAN_REVIEW_PASSED`.
- Confirm unresolved `P0`/`P1` findings block pass.
- Confirm blocking `P2` acceptance has a human or domain-owner decision ref.
- Confirm subagent review is read-only, input-only, has a run plan when recommended, and is closed or skipped before pass.
- Confirm fallback is not used as a substitute for recommended subagent review in `PLAN_REVIEW_PASSED`.
- Confirm verification command review is static and does not claim test execution.
- Confirm the user-facing summary is plain and does not ask the user to choose technical surfaces.
