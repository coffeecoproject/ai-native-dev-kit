# Plan Review Gate

Plan Review Gate makes implementation plans reviewable before Codex starts
coding.

It is for situations where a plan exists but the task is important enough that
the plan itself must be checked first: permissions, deletion, workflow state,
business rules, API contracts, data changes, release behavior, or other
high-impact work.

Plain-language outcome:

```text
I have a plan, but I still need to review the plan before writing code.
If the review finds gaps, I fix the plan first.
```

## How To Use

Create or review a plan:

```bash
node scripts/cli.mjs plan-review . --plan docs/example-plan.md --intent "change permission behavior"
```

Check recorded plan review reports:

```bash
node scripts/cli.mjs plan-review-check . --allow-empty
```

Reports live under:

```text
plan-review-reports/
```

## What It Decides

It decides whether the implementation plan has passed the pre-implementation
review prerequisite.

It does not decide that implementation is authorized.

Even when the state is `PLAN_REVIEW_PASSED`, Codex must still respect Task
Governance, project authority, approvals, apply plans, readiness records,
runtime gates, and human-owned decisions.

## What Must Back A High-Impact Pass

For high-impact or possible-high-impact tasks, a passing plan review must be
backed by:

- Task Governance;
- project-native Review Surface authority or equivalent;
- Verification Plan evidence;
- Business Rule Closure when business-rule surfaces are required;
- Change Impact Coverage when destructive data or frontend/backend consistency
  surfaces are required.

The report may include a derived review-surface matrix, but that matrix is not
enough by itself. It is a helper view, not the authority.

When read-only subagent review is recommended, `PLAN_REVIEW_PASSED` requires the
subagent route to be closed or explicitly skipped through the approved route. A
fallback explanation is not enough to turn an unfinished recommended subagent
review into a passing plan review.

## User Experience

For a plan with gaps:

```text
The plan is not ready yet. I found required gaps and will revise the plan
before coding.
```

For a reviewed plan:

```text
The plan review passed. I can move to implementation review under the approved
scope. This review itself still does not approve code changes, commit, push, or
release.
```

## Non-Goals

Plan Review Gate does not:

- replace Task Governance;
- replace Review Surface Governance;
- replace Business Rule Closure;
- replace Change Impact Coverage;
- replace Verification Plan;
- execute tests;
- rewrite implementation plans by default;
- write implementation files;
- approve implementation;
- approve release or production;
- ask users to choose technical review surfaces.
