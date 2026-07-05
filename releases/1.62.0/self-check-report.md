# 1.62.0 Self-Check Report

## Status

PASS

## Verification

```bash
node --check scripts/resolve-native-migration.mjs
node --check scripts/check-native-migration.mjs
node --check scripts/workflow-next.mjs
node --check scripts/check-intentos.mjs
node scripts/cli.mjs native-migration . --json
node scripts/check-native-migration.mjs .
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/light-web
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/governed-admin
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/production-maintained
node scripts/check-native-migration.mjs examples/1.62-native-first-existing-project/dirty-worktree
node scripts/check-product-baseline.mjs .
node scripts/check-claim-control.mjs .
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
npm run verify
git diff --check
```

## Required Bad Fixture Coverage

The release must reject unsafe plans that:

- drop business rules
- directly overwrite `AGENTS.md`
- keep old workflow and IntentOS as equal authority
- install hooks or change CI
- change production config
- skip human approval
- miss restore planning
- approve implementation
- act on unknown owner rules
- classify business rules as replaceable workflow rules
- classify production controls as engineering baseline
- omit source excerpts
- use broad target paths
- omit authority transition

## Final Result

PASS.

1.62.0 is accepted as a plan-first existing-project native migration release. It does not authorize target-project writes, direct governance overwrite, production changes, or implementation work.
