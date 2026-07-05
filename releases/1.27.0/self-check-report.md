# 1.27.0 Self-Check Report

Status: PASS

## Checks

```bash
node --check scripts/resolve-debt-handoff.mjs
node --check scripts/check-debt-handoff.mjs
node scripts/resolve-debt-handoff.mjs . --json
node scripts/check-debt-handoff.mjs .
node scripts/check-debt-handoff.mjs examples/1.27-debt-knowledge-handoff
node scripts/check-debt-handoff.mjs test-fixtures/bad/bad-debt-handoff-forgives-debt
node scripts/check-debt-handoff.mjs test-fixtures/bad/bad-debt-handoff-missing-handoff
node scripts/check-manifest.mjs
npm run verify:syntax
npm run verify:governance
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Result

PASS. Local release verification completed for Debt & Knowledge Handoff.

Full verification included source protocol checks, example checks, bad-fixture
rejections, manifest checks, generated-project coverage through `check-intentos`,
and the full `npm run verify` suite.
