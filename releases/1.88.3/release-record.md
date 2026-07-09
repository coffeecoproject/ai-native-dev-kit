# Release 1.88.3: Plan Review Binding Hardening

## Summary

1.88.3 hardens Plan Review consumer binding.

Downstream consumers now reject a Plan Review report whose
`plan_review_digest` does not match canonical Machine-Readable Evidence. They
also verify that the consumer's own plan reference or plan digest matches the
plan that passed Plan Review.

## Changed Assets

- `scripts/lib/plan-review-binding.mjs`
- `scripts/check-execution-assurance.mjs`
- `scripts/check-completion-evidence.mjs`
- `scripts/check-controlled-apply-readiness.mjs`
- `examples/1.88-plan-review-consumer-integration/*`
- `test-fixtures/bad/bad-execution-assurance-plan-review-digest-drift/*`
- `test-fixtures/bad/bad-controlled-apply-plan-review-other-plan/*`
- `test-fixtures/bad/bad-completion-evidence-plan-review-for-other-task/*`

## Allowed Claims

- IntentOS can reject a downstream Plan Review binding when the referenced Plan
  Review report has a stale or forged `plan_review_digest`.
- Execution Assurance strict mode can prove its `execution_plan.plan_ref`
  matches the reviewed plan.
- Controlled Apply Readiness strict mode can prove `apply_plan.path` and
  `apply_plan.plan_digest` match the reviewed plan.
- Completion Evidence strict mode can prove its Plan Review binding matches the
  referenced Execution Assurance Plan Review binding.

## Forbidden Claims

- 1.88.3 does not approve implementation.
- 1.88.3 does not approve apply.
- 1.88.3 does not approve commit, push, release, production, tests, migrations,
  provider actions, or project-owner decisions.
- A valid Plan Review binding remains prerequisite evidence only.

## Evidence Status

- Positive consumer examples were updated to use the reviewed plan consistently.
- Bad fixture added for forged referenced Plan Review digest.
- Bad fixture added for Controlled Apply Readiness using a different plan than
  the reviewed plan.
- Bad fixture added for Completion Evidence bound to a different Plan Review
  task than its referenced Execution Assurance.

## Known Limitations

- `NO_PLAN_REQUIRED` low-risk skip semantics remain a separate follow-up; this
  patch keeps `--require-plan-review` strict for consumers that require a passed
  plan review.
- User Delivery Console, Unified Closure, and Launch Review View do not yet
  surface Plan Review consumer blockers directly.
- The checks validate recorded evidence and local references; they still do not
  execute implementation, tests, apply, release, or production actions.

## Verification

Completed verification:

```bash
npm run verify > /tmp/intentos-verify-1.88.3.log 2>&1
git diff --check
```

- `npm run verify`: PASS, 33118 log lines, final line
  `IntentOS self-check passed.`
- `git diff --check`: PASS
