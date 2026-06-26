# Goal + Subagent L2 Feature Example

This is a simulated dogfood example for Goal Mode and Subagent Orchestration.

It is not real project validation and it does not prove that any production codebase is ready. Its purpose is to show how an L2 feature can move through route selection, workflow artifacts, helper-agent planning, review, auto-fix, human decision routing, and final reporting.

## Scenario

Add a status filter to a project list screen.

The example uses a small feature because the workflow is the subject:

- `ProjectStatus` is the internal domain type.
- API query values remain strings at the boundary.
- UI labels are mapped from a controlled status table.
- A backend-managed lookup table is proposed as future work, not done in this task.

## Flow

```text
Goal Planner
-> Engineering Baseline Agent
-> Spec Agent
-> Builder
-> Reviewer
-> Repair
-> Reporter
```

The Subagent Run Plan records that every helper agent is `CLOSED` or `SKIPPED`. No helper agent remains `RUNNING` after handoff.

## Review Loop

The example includes two review findings:

- `F1` is `AUTO_FIX`: the first review asked for clearer evidence linkage in the eval and final report.
- `F2` is `NEEDS_HUMAN_DECISION`: whether status definitions should move to a backend-managed lookup table.

Only `F1` is automatically fixed. `F2` is routed to a follow-up proposal and is not implemented here.

## Checks

Run these from the dev-kit root:

```bash
node scripts/check-goal-mode.mjs examples/goal-subagent-l2-feature
node scripts/check-subagent-orchestration.mjs examples/goal-subagent-l2-feature
node scripts/check-engineering-baseline.mjs examples/goal-subagent-l2-feature --strict
node scripts/check-workflow-artifacts.mjs examples/goal-subagent-l2-feature --mode ready --task tasks/001-project-status-filter.md
node scripts/check-review-loop.mjs examples/goal-subagent-l2-feature --task tasks/001-project-status-filter.md
node scripts/check-next-step-boundary.mjs examples/goal-subagent-l2-feature --task tasks/001-project-status-filter.md
node scripts/score-output-quality.mjs examples/goal-subagent-l2-feature --min-score 80
```
