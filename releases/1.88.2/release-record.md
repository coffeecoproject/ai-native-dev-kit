# Release 1.88.2: Plan Review Consumer Integration

## Summary

1.88.2 connects Plan Review Gate to downstream execution consumers.

Execution Assurance, Completion Evidence, and Controlled Apply Readiness can now
run with `--require-plan-review`. In that mode, they must include
`plan_review_binding` and prove the referenced Plan Review report is:

- local and resolvable;
- `PLAN_REVIEW_PASSED`;
- bound to the same task;
- bound to the referenced plan digest;
- non-authorizing.

## Changed Assets

- `scripts/lib/plan-review-binding.mjs`
- `scripts/check-execution-assurance.mjs`
- `scripts/check-completion-evidence.mjs`
- `scripts/check-controlled-apply-readiness.mjs`
- `schemas/artifacts/execution-assurance.schema.json`
- `schemas/artifacts/completion-evidence.schema.json`
- `schemas/artifacts/controlled-apply-readiness.schema.json`
- `scripts/init-project.mjs`
- `intentos-manifest.json`
- `templates/workflow-version.json`
- `package.json`
- `examples/1.88-plan-review-consumer-integration/*`
- `test-fixtures/bad/bad-execution-assurance-missing-plan-review-binding/*`
- `test-fixtures/bad/bad-completion-evidence-missing-plan-review-binding/*`
- `test-fixtures/bad/bad-controlled-apply-plan-review-not-passed/*`

## Allowed Claims

- IntentOS can check whether downstream consumer reports bind to a passed Plan
  Review report.
- Strict consumer mode can reject missing, stale, not-passed, or mismatched Plan
  Review bindings.
- The feature is compatibility-safe for older reports unless
  `--require-plan-review` is used.

## Forbidden Claims

- 1.88.2 does not approve implementation.
- 1.88.2 does not approve apply.
- 1.88.2 does not approve commit, push, release, production, tests,
  migrations, provider actions, or project-owner decisions.
- `PLAN_REVIEW_PASSED` remains a prerequisite signal only.

## Evidence Status

- Positive Execution Assurance consumer example added.
- Positive Completion Evidence consumer example added.
- Positive Controlled Apply Readiness consumer example added.
- Bad fixtures added for missing binding and not-passed binding.

## Known Limitations

- Consumer binding only validates recorded local Plan Review evidence; it does
  not execute implementation work, tests, apply operations, or release actions.
- Existing reports remain compatible unless a checker is run with
  `--require-plan-review`; projects must opt into strict consumer enforcement.
- A passed consumer binding is still not human approval and does not override
  project owner, runtime, release, CI, or production authority.

## Verification

Expected verification:

```bash
node scripts/check-execution-assurance.mjs examples/1.88-plan-review-consumer-integration/high-execution-assurance --require-structured-evidence --require-plan-review --require-actual-diff --require-precise-evidence
node scripts/check-completion-evidence.mjs examples/1.88-plan-review-consumer-integration/completion-evidence-plan-reviewed --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs --require-ready --require-plan-review
node scripts/check-controlled-apply-readiness.mjs examples/1.88-plan-review-consumer-integration/apply-readiness-plan-reviewed --require-structured-evidence --require-plan-review
node scripts/check-intentos.mjs
npm run verify:syntax
npm run verify:examples
npm run verify:release
```
