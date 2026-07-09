# Plan Review Gate

Plan Review Gate is the pre-implementation review gate for implementation
plans.

It exists because a plan being written is not the same as a plan being safe to
implement.

Plain-language rule:

```text
For important work, Codex must review the plan before coding.
If the review finds blocking gaps, Codex fixes the plan first.
Only after the plan review passes may Codex move to implementation review.
```

## Position

Plan Review Gate consumes existing governance signals. It does not replace
them.

Inputs can include:

- Task Governance;
- Work Queue;
- Review Surface Governance;
- Business Rule Closure;
- Change Impact Coverage;
- Verification Plan;
- project-native equivalents;
- read-only subagent review output.

Task Governance remains the source of truth for task impact. Review Surface Governance remains the source of truth for review surfaces. Plan Review Gate
checks whether the implementation plan covers those requirements.

## State Model

| State | Meaning |
| --- | --- |
| `NO_PLAN_REQUIRED` | Task Governance supports lightweight execution and no implementation plan is required |
| `PLAN_REQUIRED` | A plan is required but not found |
| `PLAN_DRAFTED` | A plan exists but has not been reviewed |
| `PLAN_REVIEW_REQUIRED` | Review must run before implementation review |
| `PLAN_REVISION_REQUIRED` | The review found blocking gaps that must be fixed |
| `PLAN_REVIEW_PASSED` | The plan passed the pre-implementation review gate |
| `BLOCKED_BY_STALE_PLAN` | The plan digest or task binding no longer matches |
| `BLOCKED_BY_INCOMPLETE_REVIEW` | Required review surfaces were omitted |
| `BLOCKED_BY_USER_DECISION` | A real user, owner, or domain decision is missing |
| `BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE` | Automatic review/repair attempts reached the limit |
| `PLAN_REVIEW_REQUIRED_WITH_TASK_GOVERNANCE_RECHECK` | The plan shows risk signals that Task Governance did not classify |

`PLAN_REVIEW_PASSED` is a prerequisite signal only. It does not authorize
implementation, commit, push, release, production, migration, or risk
acceptance.

## Severity Model

| Severity | Meaning | Blocks implementation review |
| --- | --- | --- |
| `P0` | Unsafe, contradictory, or unauthorized plan | Yes |
| `P1` | Required before implementation review | Yes |
| `P2` | Should be fixed or explicitly accepted before implementation review | Yes for high-impact tasks unless accepted by a real owner |
| `P3` | Non-blocking improvement | No |

Codex cannot accept blocking `P2` findings on behalf of the user or domain
owner. Acceptance requires a human or owner decision reference, acceptance
reason, scope, expiry or revisit condition, and task impact.

## Required Review Surfaces

Every review checks:

- source task identity;
- current Work Queue item when present;
- Task Governance tier;
- plan digest;
- plan scope;
- excluded surfaces;
- implementation boundaries;
- verification command review;
- rollback or recovery expectations;
- whether the plan accidentally authorizes implementation.

High-impact plans also require explicit coverage for selected risk surfaces,
such as permissions, data-destructive behavior, business rules, workflow state,
frontend/backend consistency, release behavior, security, privacy, or
verification obligations.

The user should not be asked to choose technical review surfaces. Codex selects
and records them from the project and task evidence.

## Review Loop

The intended loop is:

```text
Draft plan
-> Review plan
-> Revise plan if P0/P1/blocking P2 findings exist
-> Re-run review
-> Produce PLAN_REVIEW_PASSED or a blocked state
```

The maximum automatic review/repair rounds is `2`. After that, the report must
use `BLOCKED_BY_REPEATED_PLAN_REVIEW_FAILURE`.

Plan Review Gate is read-only by default. It can recommend plan changes but
does not rewrite the original implementation plan unless a future explicit,
bounded documentation output mode is approved.

## Subagent Review

Subagents may be recommended for broad or high-impact plan review. They are
read-only inputs only.

Rules:

- reviewer subagents do not write implementation files;
- subagent output is not authority;
- launched subagents must be closed or skipped before `PLAN_REVIEW_PASSED`;
- subagents do not approve implementation, release, risk, or scope expansion.

## Verification Command Review

Plan Review Gate reviews commands statically. It does not execute tests.

The report must distinguish:

- whether commands are listed;
- whether commands appear project-native;
- whether commands appear to target the required behavior;
- whether later Test Evidence is still required;
- whether a fake or unstable command was found.

## Boundaries

Plan Review Gate:

- writes target files: No;
- authorizes implementation: No;
- approves commit or push: No;
- approves release or production: No;
- executes tests: No;
- changes production: No.

This report does not authorize implementation.
