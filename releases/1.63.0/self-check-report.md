# 1.63.0 Self-Check Report

## Status

PASS

## Verification

```bash
node --check scripts/lib/native-rule-extraction.mjs
node --check scripts/resolve-native-migration.mjs
node --check scripts/check-native-migration.mjs
node --check scripts/check-workflow-adoption-map.mjs
node --check scripts/check-dev-kit.mjs
node scripts/cli.mjs native-migration . --json
node scripts/check-native-migration.mjs .
node scripts/check-native-migration.mjs examples/1.63-native-migration-precision/mixed-agent-rules --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-mixed-rules-collapsed --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-missing-line-range --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-structured-evidence-mismatch --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-schema-invalid --require-structured-evidence
node scripts/check-workflow-adoption-map.mjs test-fixtures/bad/bad-workflow-map-adapter-endpoint
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Required Bad Fixture Coverage

The release must reject unsafe records that:

- collapse mixed old-project rules into one broad workflow row
- omit source line ranges
- mismatch Markdown summary and structured evidence
- drift structured evidence schema version
- treat Workflow Adoption Map as the final native adoption endpoint

## Final Result

PASS.

1.63.0 is accepted as a rule-level precision hardening release. It does not authorize target-project writes, direct governance overwrite, production changes, or implementation work.
