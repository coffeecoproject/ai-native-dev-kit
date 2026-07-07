# IntentOS 1.80.2 Self-Check Report

## Scope

This self-check covers Release Evidence Gate runtime digest precision,
Markdown/JSON consistency, source-repository assets, examples, bad fixtures, and
version synchronization.

## Commands

```bash
node --check scripts/resolve-release-evidence-gate.mjs
node --check scripts/check-release-evidence-gate.mjs
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/web-preview-handoff --require-structured-evidence --require-current-completion --strict-source-binding
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/mini-program-review-handoff --require-structured-evidence --require-platform-recipe
node scripts/check-release-evidence-gate.mjs examples/1.80-release-evidence-gate/admin-production-review-blocked --require-structured-evidence
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-runtime-smoke-digest-mismatch --require-structured-evidence --strict-source-binding
node scripts/check-release-evidence-gate.mjs test-fixtures/bad/bad-release-evidence-markdown-json-mismatch --require-structured-evidence --strict-source-binding
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Result

- Syntax checks passed.
- Positive Release Evidence examples passed.
- Runtime smoke digest mismatch fixture failed as expected.
- Markdown/JSON mismatch fixture failed as expected.
- Full IntentOS self-check passed.
- Full `npm run verify` passed.
- `git diff --check` passed.

## Boundary

This release hardens review-evidence precision only. It does not approve release,
deploy, submit to app-store or mini-program review, execute migrations, record
secrets, change DNS/payment/CI, or prove real-user stability.
