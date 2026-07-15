# Bounded Next-Step Protocol

Bounded Next-Step Protocol defines how Codex may suggest next steps after a task, review, baseline check, or workflow status report.

It does not forbid suggestions. It makes suggestions bounded, classified, and actionable.

Core principle:

```text
Codex may suggest next steps, but suggestions must be bounded, classified, and actionable.
```

## Why This Exists

Codex should not become a silent mechanical executor. It should still point out:

- verification that has not closed
- directly related risk
- missing tests or evidence
- adjacent issues exposed by implementation
- permitted business, real-world-consent, or external input needed before a dependent action
- safer paths for follow-up work

But a suggestion must not become implicit permission to continue, and a suggestion must not casually expand the project direction.

## Required Boundary

Every next-step suggestion must answer:

1. How is it related to the current task?
2. Is it inside the current task scope?
3. Can AI do it now?
4. If not, what entry point is required?
5. Does it need internal risk review or one permitted user-input class?

Use `scripts/check-next-step-boundary.mjs` whenever Final Reports, Review Loop Reports, review summaries, or follow-up proposals include next-step suggestions:

```bash
node scripts/check-next-step-boundary.mjs . --task tasks/<task>.md
node scripts/check-next-step-boundary.mjs . --mode implementation --task tasks/<task>.md
```

## Suggestion Types

Use only these types.

| Type | Meaning | Can AI do now? |
|---|---|---|
| IN_SCOPE_NEXT_STEP | The smallest safe next action inside the current task scope. | Yes, if it does not need new approval. |
| DIRECT_FOLLOW_UP | Directly related to the current task but outside current scope. | No. Create a new request or follow-up proposal. |
| RISK_DECISION | Requires stronger technical evidence/review, a missing business fact, an external fact, or consent to a prepared real-world effect. | No. Codex selects the internal path and asks only for a permitted missing input. |
| OUT_OF_SCOPE_OBSERVATION | Useful context observed during the task, but not recommended as immediate next work. | No. Record only. |
| DO_NOT_PROCEED | Explicitly unsafe or unauthorized under current scope. | No. Separate approval or changed goal is required. |

## Type Details

### IN_SCOPE_NEXT_STEP

Allowed only when all are true:

- it stays inside the approved task scope
- it does not add a feature
- it does not add a dependency
- it does not change architecture
- it does not change permissions, data model, migration, production config, release, or rollback behavior
- it does not need a new request

Examples:

- rerun verification
- fix a lint, typecheck, or test failure caused by the current task
- add a missing evidence ref already required by the task
- update the Review Loop Report
- write the AI task log

### DIRECT_FOLLOW_UP

Use when the idea is directly connected to the task result but not part of the task.

Examples:

- a similar field in the same form has inconsistent error messaging
- a neighboring loading or empty state should be aligned
- a similar API endpoint has the same error-handling pattern

Required entry:

- new request card, or
- follow-up proposal

Codex may record it. Codex must not implement it inside the current task.

### RISK_DECISION

Use when the suggestion needs human judgment.

Examples:

- introduce a new dependency
- abstract a shared component across modules
- change permission model
- change database schema
- change production config
- change release or rollback behavior
- change payment, refund, balance, or value-transfer behavior

Required entry:

- Codex technical decision and evidence first
- preflight before implementation
- task level escalation when applicable
- one permitted user-input class only when project evidence cannot supply it

### OUT_OF_SCOPE_OBSERVATION

Use when Codex notices context that may matter later but is not a recommended next task.

Examples:

- a global component may affect performance, but the current task does not touch it
- an old module appears inconsistent, but no current acceptance criterion depends on it
- a permission model may explain a UI state, but current scope is only visual copy

Codex may record it as background. Codex must not turn it into a recommendation unless the human asks to explore that area.

### DO_NOT_PROCEED

Use when the current scope or risk state forbids the action.

Examples:

- modify production config without approval
- add a dependency without approval
- change permissions without approval
- change migrations without approval
- change release or rollback behavior without approval
- implement a task non-goal

Codex must not execute this. If it is still important, it needs a separate request, preflight, task level, and approval.

## Required Output Format

When next-step suggestions are reported, use this table:

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | IN_SCOPE_NEXT_STEP |  |  | Yes / No | current task / new request / follow-up proposal / human decision / do not proceed |  |

Rules:

- `Type` must be one of the five allowed types.
- `Can AI do now?` must be `Yes` only for in-scope actions that need no new approval.
- `DIRECT_FOLLOW_UP` must name a required entry.
- `RISK_DECISION` must appear in Human Decisions Needed.
- `OUT_OF_SCOPE_OBSERVATION` must not be presented as immediate work.
- `DO_NOT_PROCEED` must not be marked done, implemented, or safe.

## Review Loop Relationship

Review Loop finding categories are not next-step suggestion categories.

Finding categories:

- AUTO_FIX
- NEEDS_HUMAN_DECISION
- NEEDS_CLARIFICATION
- NO_ACTION

Next-step suggestion categories:

- IN_SCOPE_NEXT_STEP
- DIRECT_FOLLOW_UP
- RISK_DECISION
- OUT_OF_SCOPE_OBSERVATION
- DO_NOT_PROCEED

Use this distinction:

```text
Finding = current task issue that must be handled by review protocol.
Suggestion = possible work or context after the current task.
```

Examples:

- Missing evidence ref required by the task = Finding / AUTO_FIX
- Future consistency improvement in a neighboring form = Suggestion / DIRECT_FOLLOW_UP
- New shared permission model = Suggestion / RISK_DECISION
- Direct production config edit without approval = Suggestion / DO_NOT_PROCEED

## Final Report Rule

Final reports should not use vague "Suggested next step" lines.

They should include:

- Completed
- Verified
- Not Changed
- Risks Remaining
- Next-Step Suggestions
- Human Decisions Needed
- Next Safe Action

The next safe action should be the smallest bounded action, not a broad roadmap.

## What Not To Do

- Do not use next-step suggestions to expand product scope casually.
- Do not list broad architecture changes without classification and entry point.
- Do not suggest production, release, migration, permission, payment, or data changes as ordinary follow-up.
- Do not turn reviewer future suggestions into AUTO_FIX findings.
- Do not implement DIRECT_FOLLOW_UP, RISK_DECISION, OUT_OF_SCOPE_OBSERVATION, or DO_NOT_PROCEED inside the current task.
