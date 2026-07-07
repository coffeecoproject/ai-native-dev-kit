# IntentOS 1.80.1 Self-Check Report

## Scope

Release Evidence Gate precision hardening.

## Commands Executed

```bash
node --check scripts/check-release-evidence-gate.mjs
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/admin-production-review-blocked --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-source-digest-mismatch --report release-evidence-gate-reports/001-bad.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-build-artifact-digest-mismatch --report release-evidence-gate-reports/001-bad.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-runtime-smoke-unresolved --report release-evidence-gate-reports/001-bad.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-completion-evidence-strict-check-fails --report release-evidence-gate-reports/001-bad.md --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify:governance
npm run verify:release
npm run verify:syntax
git diff --check
```

## Result

All positive checks passed, including the generated-project Release Evidence
Gate resolver/checker smoke added to `scripts/check-intentos.mjs`.

Bad fixture commands intentionally fail for source digest mismatch, build
artifact digest mismatch, unresolved runtime smoke, and failing strict
Completion Evidence validation. Those failures are the expected rejection
evidence for this hardening patch.

## Boundary

This self-check does not approve release, deploy, submit store review, execute
migrations, mutate external systems, or prove real-user stability.
