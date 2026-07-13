# Plan Review Gate Review Checklist

- Verify the report is read-only and non-authorizing.
- Verify Task Governance is the task-impact source of truth.
- Verify high-impact plans include Task Governance binding.
- Verify high-impact passed plans include Review Surface authority, not only a derived matrix.
- Verify high-impact passed plans include Verification Plan source-chain evidence.
- Verify Business Rule Closure / Change Impact Coverage are included when required surfaces need them.
- Verify all required review surfaces are reviewed before `PLAN_REVIEW_PASSED`.
- Verify unresolved `P0`/`P1` findings block pass.
- Verify blocking `P2` acceptance has a valid evidence-authority or bounded user-input ref.
- Verify subagent review is read-only, input-only, has a run plan when recommended, and is closed or skipped before pass.
- Verify fallback is not used as a substitute for recommended subagent review in `PLAN_REVIEW_PASSED`.
- Verify verification command review is static and does not claim test execution.
- Verify the user-facing summary is plain and does not ask the user to choose technical surfaces.
