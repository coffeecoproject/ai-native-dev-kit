# GPT Review Prompt: Project Status Filter

## Human Summary

Use this prompt only for read-only review of the simulated L2 status filter task. Do not edit files and do not approve implementation.

## Instructions

You are reviewing `review-packets/001-project-status-filter.md`.

Check:

- Whether task scope matches the spec and eval.
- Whether `ProjectStatus` is the internal type boundary.
- Whether API query values remain strings at the boundary.
- Whether backend-managed lookup administration is excluded from this task.
- Whether evidence and final reporting are clear enough.
- Whether next-step suggestions are bounded.

Return findings in this shape:

```text
ID:
Severity: P0 | P1 | P2
Category: AUTO_FIX | NEEDS_HUMAN_DECISION | NEEDS_CLARIFICATION | NO_ACTION
Finding:
Evidence:
Proposed action:
Owner:
Status:
```

## Boundaries

- `AUTO_FIX` may only cover deterministic wording, evidence-link, or artifact-consistency fixes inside the approved task scope.
- `NEEDS_HUMAN_DECISION` must be used for backend-managed lookup, scope expansion, architecture, dependency, schema, migration, permission, release, rollback, production configuration, Human Approval, or Approval scope changes.
- Do not mark future work as completed.

## Expected Output

One finding may ask for clearer evidence linkage.

One finding may route backend-managed lookup administration to human decision and follow-up proposal.
