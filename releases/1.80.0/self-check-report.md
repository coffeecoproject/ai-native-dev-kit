# IntentOS 1.80.0 Self-Check Report

## Scope

Release Evidence Gate implementation and calibration.

## Commands

```bash
node --check scripts/resolve-release-evidence-gate.mjs
node --check scripts/check-release-evidence-gate.mjs
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/admin-production-review-blocked --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-user-note-treated-as-smoke --require-structured-evidence
```

## Result

Targeted checks pass for positive and blocked examples. Bad fixtures are
expected to fail.

## Boundary

This self-check does not approve release, deploy, submit store review, execute
migrations, mutate external systems, or prove real-user stability.
