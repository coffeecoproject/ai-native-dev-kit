# 1.73.0 Self-Check Report

## Scope

Self-check for the IntentOS naming hardcut.

## Required Evidence

The release must verify:

- package identity uses `intentos`;
- CLI help uses `Command: intentos`;
- root manifest is `intentos-manifest.json`;
- manifest version field is `intentOSVersion`;
- generated workflow assets target `.intentos/`;
- the source self-check is `scripts/check-intentos.mjs`;
- old project assets are migration-planned, not silently accepted as normal
  runtime identity.

## Commands

```bash
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/cli.mjs --help
node scripts/cli.mjs doctor .
node scripts/cli.mjs start .
node scripts/cli.mjs next .
npm run verify
```

## Result

Passed.

Executed checks:

- `node scripts/check-manifest.mjs`: passed.
- `node scripts/check-intentos.mjs`: passed.
- `find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check`: passed.
- `git diff --check`: passed.
- `node scripts/cli.mjs --help`: passed and printed `Command: intentos`.
- `node scripts/cli.mjs doctor .`: passed and routed this repository to
  IntentOS source self-check.
- `node scripts/cli.mjs start .`: passed and classified this repository as
  IntentOS maintenance, without writing target-project files.
- `node scripts/cli.mjs next .`: passed and recommended IntentOS self-check.
- `npm run verify`: passed.

## Notes

- The active naming drift guard found no old active product identity in the
  checked public/runtime surfaces.
- Generated project smoke checks passed and produced `.intentos/` workflow
  assets.
- Existing-project naming migration remains plan-first and was not treated as
  automatic target-project write permission.
