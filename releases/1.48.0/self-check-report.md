# IntentOS 1.48.0 Self-Check Report

## Human Summary

1.48.0 was checked as a non-executing governance upgrade. The expected result is that Change Impact Coverage is visible in CLI, docs, templates, generated-project assets, examples, bad fixtures, CI references, and self-checks.

## Commands

```bash
node --check scripts/resolve-change-impact-coverage.mjs
node --check scripts/check-change-impact-coverage.mjs
node scripts/cli.mjs impact-coverage . --intent "add contract input restriction"
node scripts/check-change-impact-coverage.mjs .
node scripts/check-change-impact-coverage.mjs examples/1.48-change-impact-coverage/contract-input-rule
node scripts/check-dev-kit.mjs
npm run verify
```

## Expected Result

- Change Impact Coverage resolver prints a read-only report.
- Change Impact Coverage checker passes the source repo when no source reports are present and runs source evidence checks.
- The good example passes.
- Bad fixtures fail for backend-only, frontend-only, API-without-tests, high-risk not-applicable, and approval-overclaim cases.
- Full repository verification passes.

## Boundaries

- This self-check does not prove real-project production readiness.
- This self-check does not authorize implementation, apply, release, production, hooks, CI, migrations, payment, permission, data, privacy, security, tax, legal, or compliance decisions.
- This self-check does not prove every possible impact can be discovered automatically.
