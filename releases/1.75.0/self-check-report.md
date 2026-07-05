# Self-Check Report - 1.75.0

## Scope

This self-check covers the Business Rule Closure release:

- source assets
- generated-project assets
- CLI commands
- structured evidence schema
- positive example
- bad fixtures
- Change Impact Coverage `business_rule_ref` binding
- manifest and workflow-version sync

## Commands

Final verification commands:

```bash
node --check scripts/resolve-business-rule-closure.mjs
node --check scripts/check-business-rule-closure.mjs
node --check scripts/resolve-change-impact-coverage.mjs
node scripts/cli.mjs business-rule . --intent "appointment requests must include a service time"
node scripts/cli.mjs business-rule-check . --allow-empty
node scripts/check-business-rule-closure.mjs . --allow-empty
node scripts/check-business-rule-closure.mjs examples/1.75-business-rule-closure/appointment-service-time --require-structured-evidence
node scripts/resolve-change-impact-coverage.mjs examples/mvp-booking-web-app --intent "appointment requests must include a service time" --business-rule-ref artifact:business-rule-closures/001-appointment-service-time.md --json
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Result

Passed local verification.

Final command outcomes:

- `node --check scripts/resolve-business-rule-closure.mjs`: pass
- `node --check scripts/check-business-rule-closure.mjs`: pass
- `node --check scripts/resolve-change-impact-coverage.mjs`: pass
- `node scripts/cli.mjs business-rule . --intent "appointment requests must include a service time"`: pass
- `node scripts/cli.mjs business-rule-check . --allow-empty`: pass
- `node scripts/check-business-rule-closure.mjs . --allow-empty`: pass
- `node scripts/check-business-rule-closure.mjs examples/1.75-business-rule-closure/appointment-service-time --require-structured-evidence`: pass
- `node scripts/resolve-change-impact-coverage.mjs examples/mvp-booking-web-app --intent "appointment requests must include a service time" --business-rule-ref artifact:business-rule-closures/001-appointment-service-time.md --json`: pass
- `node scripts/check-manifest.mjs`: pass
- `node scripts/check-intentos.mjs`: pass
- `npm run verify`: pass
- `git diff --check`: pass

## Notes

- The appointment service-time example is a neutral business-rule example.
- Contract, tax, finance, HR, legal, payment, privacy, compliance, migration, production, and customer-data wording is treated as risk calibration and negative fixture coverage, not as the actual business scope of 1.75.0.
- Business Rule Closure remains read-only and non-authorizing.
