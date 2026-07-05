# IntentOS 1.76.0 Self-Check Report

## Scope

This self-check covers Verification Plan Governance assets, CLI entry, schema, example, generated-project copy surface, release evidence, and strict source binding.

## Executed Local Commands

```bash
node --check scripts/resolve-verification-plan.mjs
node --check scripts/check-verification-plan.mjs
node --check scripts/resolve-change-impact-coverage.mjs
node --check scripts/check-intentos.mjs
node scripts/check-verification-plan.mjs examples/1.76-verification-plan/appointment-service-time --report verification-plans/001-service-time.md --require-structured-evidence --require-business-rule-ref --require-impact-ref --strict-source-binding
node scripts/check-manifest.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-intentos.mjs
npm run verify
```

## Required Negative Coverage

Self-check must reject:

- missing API negative test obligation
- broad-command-only required business proof
- task mismatch against Business Rule Closure
- blocking manual verification without owner

## Outcome

Passed in the release working tree.

## Governance Fix During Validation

Generated-project smoke initially exposed that Change Impact Coverage treated existing project governance filenames as if the current task touched permission or release scope. `scripts/resolve-change-impact-coverage.mjs` now separates project-context signals from task-impact signals: existing documentation may inform project context, but permission, data, release, and compliance surfaces are raised only by the user intent or explicit changed paths.

The follow-up reproduction confirmed:

- A normal appointment service-time rule resolves to `VERIFICATION_PLAN_READY`.
- A permission plus production rollback request resolves to `NEEDS_DOMAIN_OWNER`.
