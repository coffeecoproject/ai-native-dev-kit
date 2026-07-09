# Plan Review Gate Review Checklist

- Confirm the report is read-only and non-authorizing.
- Confirm Task Governance is the task-impact source of truth.
- Confirm high-impact plans include Task Governance binding.
- Confirm high-impact plans include review-surface analysis or an explicitly derived matrix.
- Confirm all required review surfaces are reviewed before `PLAN_REVIEW_PASSED`.
- Confirm unresolved `P0`/`P1` findings block pass.
- Confirm blocking `P2` acceptance has a human or domain-owner decision ref.
- Confirm subagent review is read-only, input-only, and closed or skipped before pass.
- Confirm verification command review is static and does not claim test execution.
- Confirm the user-facing summary is plain and does not ask the user to choose technical surfaces.

