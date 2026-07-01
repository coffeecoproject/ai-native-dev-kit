# IntentOS 1.51.0 Self-Check Report

## Scope

1.51.0 adds opt-in close-out evidence precision.

## Verification Plan

```bash
node --check scripts/check-change-impact-coverage.mjs
node --check scripts/check-execution-closure.mjs
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --report change-impact-coverage-reports/001-contract-input-rule.md --require-structured-evidence --mode closure --strict-evidence --resolve-evidence-refs --require-precise-evidence
node scripts/check-execution-closure.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-impact-coverage --require-precise-evidence
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Expected Result

- Exact report precision passes for the 1.49 structured example.
- Weak evidence files are rejected.
- Unresolved recorded artifact refs are rejected.
- Stale Change Impact Coverage links are rejected.
- Default compatibility remains unchanged.
