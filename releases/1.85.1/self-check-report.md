# IntentOS 1.85.1 Self-Check Report

## Scope

This self-check covers Task Entry Joint Binding And Source Validation.

## Checked Areas

- Work Queue source structured evidence validation.
- Task Governance source structured evidence validation.
- Work Queue item to Task Governance joint binding.
- Closure Decision task ref strict binding.
- User Delivery Console task ref strict binding.
- Resume review structured fields.
- 1.85 positive examples upgraded from minimal stubs to schema-valid source
  evidence.

## Verification Commands

```bash
node scripts/check-execution-assurance.mjs examples/1.85-task-governance-consumer-integration/high-workflow-rule --require-structured-evidence --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-completion-evidence.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --report completion-evidence-reports/001-possible-high-blocked.md --require-structured-evidence --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-closure-decision.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-user-delivery-console.mjs examples/1.85-task-governance-consumer-integration/possible-high-blocked --require-task-governance --require-work-queue --strict-task-consumer
node scripts/check-intentos.mjs
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
npm run verify:syntax
npm run verify:examples
npm run verify:release
git diff --check
```

## Result

PASS. Local verification completed.

The initial full self-check exposed a manifest drift for
`docs/plans/execution-release-runtime-hygiene-1.86-plan.md`. That plan file was
already indexed from `docs/plans/README.md`, so the manifest was updated to
track it as a source-required plan asset. After that correction, manifest,
example, product baseline, claim control, syntax, self-check, and release
verification all passed.
