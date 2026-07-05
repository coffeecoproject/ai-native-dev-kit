# 1.64.0 Self-Check Report

## Status

PASS

## Verification

```bash
node --check scripts/lib/native-rule-extraction.mjs
node --check scripts/resolve-native-migration.mjs
node --check scripts/check-native-migration.mjs
node scripts/check-native-migration.mjs examples/1.63-native-migration-precision/mixed-agent-rules --require-structured-evidence
node scripts/check-native-migration.mjs examples/1.64-native-migration-parser-calibration/table-long-bilingual --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-rule-json-mismatch --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-line-range-mismatch --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-missing-skipped-block-reporting --require-structured-evidence
node scripts/check-native-migration.mjs test-fixtures/bad/bad-native-migration-structured-action-writes --require-structured-evidence
node scripts/check-workflow-adoption-map.mjs examples/1.20-existing-project-workflow-adapter
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Required Bad Fixture Coverage

The release must reject unsafe records that:

- mismatch Markdown and JSON rule class by `rule_id`
- mismatch Markdown and JSON source line range by `rule_id`
- omit skipped / low-signal block fields for 1.64 structured evidence
- claim a structured proposed action can write target files

## Final Result

PASS.

1.64.0 is accepted as a parser calibration and evidence consistency release. It does not authorize target-project writes, governance replacement, implementation, release, or production.
