# IntentOS 1.80.3 Self-Check Report

## Scope

This self-check covers Release Evidence Gate completion-set binding, owner
readiness structure, source-repository assets, examples, bad fixtures, and
version synchronization.

## Commands

```bash
node --check scripts/resolve-release-evidence-gate.mjs
node --check scripts/check-release-evidence-gate.mjs
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/admin-production-review-blocked --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-second-completion-unchecked --report release-evidence-gate-reports/001-web-preview.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-completion-task-not-in-release-scope --report release-evidence-gate-reports/001-web-preview.md --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-production-without-risk-owner-ref --report release-evidence-gate-reports/001-mini-program-review.md --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-approval-ref-implies-release-approved --report release-evidence-gate-reports/001-web-preview.md --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Expected Result

- Syntax checks pass.
- Positive Release Evidence examples pass.
- The unchecked second Completion Evidence fixture fails as expected.
- The completion task outside release scope fixture fails as expected.
- The production-like target without risk owner fixture fails as expected.
- The invalid release approval ref fixture fails as expected.
- Full IntentOS self-check passes.
- Full `npm run verify` passes.
- `git diff --check` passes.

## Boundary

This release hardens release-review evidence precision only. It does not approve
release, deploy, submit to app-store or mini-program review, execute migrations,
record secrets, change DNS/payment/CI, or prove real-user stability.
