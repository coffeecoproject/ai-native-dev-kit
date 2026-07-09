# Plan Review Binding Hardening 1.88.3 Plan

## Purpose

1.88.3 hardens the 1.88.2 consumer integration.

The goal is to prove two things before downstream consumers can rely on Plan
Review Gate evidence:

```text
The referenced Plan Review report is digest-valid.
The consumer is using the same plan that was reviewed.
```

This remains a non-authorizing evidence check. It does not approve
implementation, apply, release, production, tests, migrations, or project-owner
decisions.

## Scope

1. Recompute referenced Plan Review digest
   - Consumers must validate the referenced Plan Review report with
     `plan_review_digest`.
   - A forged report whose self-declared digest does not match canonical
     evidence must be rejected.

2. Bind consumer plan to reviewed plan
   - Execution Assurance must match `execution_plan.plan_ref` to
     `plan_review_binding.plan_ref`.
   - Controlled Apply Readiness must match `apply_plan.path` and
     `apply_plan.plan_digest` to `plan_review_binding`.
   - Completion Evidence must match its `plan_review_binding` to the referenced
     Execution Assurance `plan_review_binding` when strict plan-review mode is
     used.

3. Add negative fixtures
   - forged Plan Review digest;
   - controlled apply readiness for a different plan;
   - completion evidence bound to a different plan-review task.

## Non-Goals

- Do not change `PLAN_REVIEW_PASSED` into implementation approval.
- Do not make Completion Evidence re-run Plan Review.
- Do not require low-risk `NO_PLAN_REQUIRED` tasks to have a passed plan review
  in this patch.
- Do not connect User Delivery Console, Unified Closure, or Launch Review View
  in this patch.

## Acceptance

- Positive 1.88.2 consumer examples still pass after stricter matching.
- Bad digest drift is rejected.
- Bad controlled apply other-plan binding is rejected.
- Bad completion evidence other-task binding is rejected.
- `npm run verify` is executed and recorded in release evidence.
