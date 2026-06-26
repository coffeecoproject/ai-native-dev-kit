# Review Packet: Project Status Filter

## Human Summary

This packet gives a reviewer the exact input needed to review the simulated L2 status filter task. The reviewer should verify scope, status typing, API boundary handling, evidence, and next-step boundaries.

## Task

Task: `tasks/001-project-status-filter.md`

## Related Spec

Spec: `specs/001-project-status-filter.md`

## Related Eval

Eval: `evals/001-project-status-filter.md`

## Review Scope

Review only the simulated project status filter flow.

In scope:

- Status filter behavior.
- `ProjectStatus` internal type boundary.
- API query string mapping.
- Empty state evidence.
- Review loop and next-step classification.

Out of scope:

- Backend-managed lookup table implementation.
- Schema, migration, permission, production configuration, release, or dependency changes.

## Changes Under Review

| Area | Summary | Evidence |
|---|---|---|
| Domain status | Uses `ProjectStatus` for active, paused, and done | `docs/engineering-baseline.md` |
| API boundary | Keeps query values as strings and parses before domain use | `specs/001-project-status-filter.md` |
| UI states | Covers selected, loading, and empty result states | `evals/001-project-status-filter.md` |
| Workflow closure | Includes review packet, review loop, and final report | `review-loop-reports/001-project-status-filter.md` |

## Evidence

Commands intended for this simulated example:

```bash
node scripts/check-goal-mode.mjs examples/goal-subagent-l2-feature
node scripts/check-subagent-orchestration.mjs examples/goal-subagent-l2-feature
node scripts/check-engineering-baseline.mjs examples/goal-subagent-l2-feature --strict
node scripts/check-workflow-artifacts.mjs examples/goal-subagent-l2-feature --mode ready --task tasks/001-project-status-filter.md
node scripts/check-review-loop.mjs examples/goal-subagent-l2-feature --task tasks/001-project-status-filter.md
node scripts/check-next-step-boundary.mjs examples/goal-subagent-l2-feature --task tasks/001-project-status-filter.md
node scripts/score-output-quality.mjs examples/goal-subagent-l2-feature --min-score 80
```

Expected result: all checks pass after F1 evidence wording is fixed.

## Reviewer Instructions

- Read only.
- Do not edit files.
- Classify each finding as `AUTO_FIX`, `NEEDS_HUMAN_DECISION`, `NEEDS_CLARIFICATION`, or `NO_ACTION`.
- Do not classify backend lookup administration as `AUTO_FIX`.
- Do not approve release, risk acceptance, Human Approval, or Approval scope changes.

## Known Risks

- Backend-managed status configuration is a valid future direction but outside this task.
- The example is simulated and must not be treated as production validation.

## Open Questions

| Question | Route |
|---|---|
| Should status options become backend-managed later | `follow-up-proposals/001-status-filter-lookup-admin.md` |

## Audit Notes

Review Packet is input to review. Review Loop Report records findings and closure.
