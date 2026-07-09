# Plan Review Consumer Integration 1.88.2 Plan

## Purpose

1.88.2 connects Plan Review Gate to downstream execution consumers.

The goal is simple:

```text
If a task requires Plan Review, downstream consumers cannot claim execution,
completion, or apply readiness unless they bind to the passed Plan Review report.
```

This is not a new approval system. It is a consumer integration layer.

## Consumers

1. Execution Assurance
   - Consumes `plan_review_binding` when strict plan-review consumption is
     required.
   - A `VERIFIED_DONE` report can be checked with `--require-plan-review`.

2. Completion Evidence
   - Consumes the same `plan_review_binding` before a final completion claim.
   - It remains a completion gate and does not re-review the plan.

3. Controlled Apply Readiness
   - Consumes `plan_review_binding` before readiness is accepted in strict
     mode.
   - It still does not authorize apply; human approval remains required.

## Structured Field

Consumers may record:

```json
{
  "plan_review_binding": {
    "required": "Yes",
    "plan_review_ref": "artifact:plan-review-reports/001-passed.md",
    "plan_review_digest": "sha256:<64 hex>",
    "plan_review_state": "PLAN_REVIEW_PASSED",
    "plan_ref": "docs/example-plan.md",
    "plan_digest": "sha256:<64 hex>",
    "task_ref": "task:current",
    "current_task_match": "Yes",
    "ready_for_implementation_review": "Yes",
    "implementation_authorized_by_this_report": "No",
    "reason": "Plan Review Gate is consumed as prerequisite evidence."
  }
}
```

## Rules

- `--require-plan-review` requires `plan_review_binding`.
- Required binding must resolve to a local Plan Review report.
- Required binding must point to `PLAN_REVIEW_PASSED`.
- Required binding must match `plan_review_digest`, `plan_ref`, `plan_digest`,
  and `task_ref` from the referenced Plan Review report.
- The referenced Plan Review report must remain non-authorizing.
- `PLAN_REVISION_REQUIRED`, stale, incomplete, or user-decision blocked plan
  states cannot satisfy downstream consumers.

## Non-Goals

- Do not make Plan Review approve implementation.
- Do not make Completion Evidence re-run plan review.
- Do not force LOW/no-plan tasks into heavyweight review.
- Do not authorize apply, commit, push, release, production, migrations,
  provider actions, or project-owner decisions.

## Acceptance

- `check-execution-assurance.mjs` accepts `--require-plan-review`.
- `check-completion-evidence.mjs` accepts `--require-plan-review`.
- `check-controlled-apply-readiness.mjs` accepts `--require-plan-review`.
- Positive examples pass strict consumer checks.
- Bad fixtures fail when Plan Review binding is missing or not passed.
- `npm run verify:syntax`, `npm run verify:examples`, and
  `node scripts/check-intentos.mjs` pass.
