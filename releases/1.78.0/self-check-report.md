# IntentOS 1.78.0 Self-Check Report

## Status

Passed.

## Commands

```bash
node --check scripts/resolve-completion-evidence.mjs
node --check scripts/check-completion-evidence.mjs
node --check scripts/check-intentos.mjs
node scripts/check-completion-evidence.mjs . --allow-empty
node scripts/check-completion-evidence.mjs examples/1.78-completion-evidence-gate/appointment-service-time --report completion-evidence-reports/001-service-time.md --require-structured-evidence --require-source-refs --require-ready
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Result

All listed checks passed.

Completion Evidence Gate validation confirmed:

- source repo empty-report mode passes only with explicit `--allow-empty`;
- positive example resolves and checks a ready source chain;
- bad fixtures reject missing Test Evidence, task mismatch, and unverified Execution Assurance;
- generated-project smoke can produce and check Completion Evidence after Business Rule Closure, Verification Plan, Test Evidence, and Execution Assurance;
- full IntentOS verification passes with 1.78.0 assets included.
