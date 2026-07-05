# 1.28.0 Self-Check Report

Status: PASS

## Checks

```bash
node --check scripts/resolve-document-archive-apply.mjs
node --check scripts/check-document-archive-apply.mjs
node scripts/resolve-document-archive-apply.mjs . --json
node scripts/check-document-archive-apply.mjs .
node scripts/check-document-archive-apply.mjs examples/1.28-document-archive-apply
node scripts/check-document-archive-apply.mjs test-fixtures/bad/bad-archive-apply-authorizes-archive
node scripts/check-document-archive-apply.mjs test-fixtures/bad/bad-archive-apply-missing-index
node scripts/check-manifest.mjs
npm run verify:syntax
npm run verify:governance
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Result

PASS. The 1.28 Document Archive Apply assets, scripts, examples, fixtures,
manifest entries, generated-project copy rules, CLI routes, README references,
and governance checks passed release verification.
