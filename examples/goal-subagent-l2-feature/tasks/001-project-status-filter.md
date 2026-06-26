# Task: Project Status Filter

## Task Level

L2

## Related Spec

Spec: `specs/001-project-status-filter.md`

## Related Eval

Eval: `evals/001-project-status-filter.md`

## Goal

Add a typed project status filter in the simulated feature flow and close the L2 review loop with bounded next-step routing.

## Scope

Allowed:

- Add local `ProjectStatus` status filter mapping.
- Add API query string parsing at the boundary.
- Add selected, loading, and empty state behavior.
- Add tests or simulated evidence for status parser and UI state behavior.
- Update review artifacts for `AUTO_FIX` findings inside this task.

Not allowed:

- Add backend-managed lookup table.
- Add schema or migration changes.
- Add permission policy changes.
- Add production configuration changes.
- Add release or rollback workflow changes.
- Implement any follow-up proposal inside this task.

## Acceptance Criteria

- The status filter supports active, paused, and done.
- Unknown query status is ignored instead of becoming a domain value.
- Empty state names the selected status.
- Review Packet and Review Loop Report are present.
- Next-step suggestion for backend-managed lookup is classified as future work.

## Commands

```bash
node scripts/check-workflow-artifacts.mjs examples/goal-subagent-l2-feature --mode ready --task tasks/001-project-status-filter.md
node scripts/check-review-loop.mjs examples/goal-subagent-l2-feature --task tasks/001-project-status-filter.md
node scripts/check-next-step-boundary.mjs examples/goal-subagent-l2-feature --task tasks/001-project-status-filter.md
node scripts/score-output-quality.mjs examples/goal-subagent-l2-feature --min-score 80
```

## AI Budget

Max agent runs: 7

Max repair runs: 2

Stop if: the same finding appears after the second repair run or any finding requires human decision.

## Risk Gate

- [ ] auth
- [ ] permission
- [ ] secrets
- [ ] production-config
- [ ] migration
- [ ] destructive-operation
- [ ] value-transfer
- [ ] dependency-addition

## Human Approval

Required: No

Status: Not Required

Approval scope: Not Required

Approved by:

Approved at:

## Stop Conditions

- Stop if a reviewer asks for backend-managed status configuration.
- Stop if status values need to be added beyond active, paused, and done.
- Stop if implementation requires schema, migration, permission, or production configuration changes.

## Final Report Required

Yes. Final report: `final-reports/001-project-status-filter.md`
