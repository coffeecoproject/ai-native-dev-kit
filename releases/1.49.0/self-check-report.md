# IntentOS 1.49.0 Self-Check Report

## Human Summary

1.49.0 was checked as a non-executing governance upgrade. The expected result is that structured impact coverage is visible in schema, docs, template, resolver, checker, examples, fixtures, release evidence, and full repository verification.

## Commands

```bash
node --check scripts/resolve-change-impact-coverage.mjs
node --check scripts/check-change-impact-coverage.mjs
node scripts/cli.mjs impact-coverage examples/mvp-booking-web-app --intent "add contract input restriction"
node scripts/check-change-impact-coverage.mjs examples/1.48-change-impact-coverage/contract-input-rule
node scripts/check-change-impact-coverage.mjs examples/1.49-structured-impact-coverage/contract-input-rule --require-structured-evidence --mode closure --strict-evidence
node scripts/check-execution-closure.mjs .
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
npm run verify
```

## Expected Result

- Resolver prints a read-only report with `Machine-Readable Evidence`.
- Source repo checker passes while no source reports are present.
- 1.48 legacy Markdown example still passes default mode.
- 1.49 structured example passes strict closure mode.
- Bad fixtures fail for missing structured evidence, placeholder evidence, and closure surfaces left `NOT_STARTED`.
- Full repository verification passes.

## Boundaries

- This self-check does not prove real-project production readiness.
- This self-check does not authorize implementation, apply, release, production, hooks, CI, migrations, payment, permission, data, privacy, security, tax, legal, or compliance decisions.
- This self-check does not prove every possible impact can be discovered automatically.
