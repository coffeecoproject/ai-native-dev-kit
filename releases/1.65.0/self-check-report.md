# 1.65.0 Self-Check Report

## Scope

Native Migration Classification Calibration.

## Checks

- Parser syntax check: passed.
- Resolver syntax check: passed.
- Native Migration checker syntax check: passed.
- 1.63 strict fixture compatibility check: passed.
- 1.64 strict fixture compatibility check: passed.
- 1.65 positive fixture strict check: passed.
- 1.65 bad fixtures: rejected for intended reasons.
- Manifest check: passed.
- Dev Kit check: passed.
- Full verify: passed.
- Git whitespace check: passed.

## Real Project Calibration

Read-only real-project calibration is allowed only when a suitable local project
is available. It must not copy private project content into public fixtures and
must not write target-project files.

Status: completed against one local production governed project in read-only
mode. The resolver identified the target as an existing production project,
recommended a production-safe native overlay posture, kept Codex write authority
off, and did not write target-project files or copy private content into public
fixtures.

## Verification Commands

```bash
node --check scripts/lib/native-rule-extraction.mjs
node --check scripts/resolve-native-migration.mjs
node --check scripts/check-native-migration.mjs
node scripts/check-native-migration.mjs examples/1.63-native-migration-precision/mixed-agent-rules --require-structured-evidence
node scripts/check-native-migration.mjs examples/1.64-native-migration-parser-calibration/table-long-bilingual --require-structured-evidence
node scripts/check-native-migration.mjs examples/1.65-native-migration-classification-calibration/mixed-domain-bilingual --require-structured-evidence
node scripts/check-manifest.mjs
node scripts/check-dev-kit.mjs
npm run verify
git diff --check
```

## Boundary

No target-project writes, governance replacement, implementation, release,
production, CI, hook, provider, secret, migration, payment, permission, data,
or business-rule changes are authorized by this release.
