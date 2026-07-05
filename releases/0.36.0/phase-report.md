# Release Phase Report: 0.36.0 CLI Front Door

## Summary

Phase `0.36.0` adds the first product-style command entry point for `intentos`: `scripts/cli.mjs`, exposed as `intentos` through local package metadata.

The CLI is intentionally thin. It delegates to existing scripts and does not replace their behavior.

## Completed

- Added `package.json`.
- Added `scripts/cli.mjs`.
- Added CLI help, version, dry-run, command routing, and write-command display.
- Added planned-only `migrate` command behavior.
- Added package scripts: `check`, `self-check`, `fixtures`, and `smoke:init`.
- Updated README and README.zh-CN CLI guidance.
- Added CLI checks to `scripts/check-intentos.mjs`.
- Updated version metadata to `0.36.0`.
- Added phase workflow artifacts.

## Verification

Required local checks:

```bash
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/cli.mjs --help
node scripts/cli.mjs --version
node scripts/cli.mjs next .
node scripts/cli.mjs fixtures
node scripts/cli.mjs self-check --dry-run
node scripts/cli.mjs update --target /tmp/intentos-cli-dry-run --dry-run
node scripts/cli.mjs doctor . --dry-run
node scripts/cli.mjs init --starter generic-project --target /tmp/intentos-cli-test
node /tmp/intentos-cli-test/scripts/check-ai-workflow.mjs /tmp/intentos-cli-test --mode core
node scripts/check-manifest.mjs
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
```

Result: PASS.

## Boundaries Preserved

- No package publishing.
- No dependency addition.
- No manifest authority.
- No migration implementation.
- No init/update safety plan implementation.
- No artifact schema enforcement.
- No target-project bootstrap semantic changes.
- No license wording change.

## Review

Review Packet: `review-packets/036-cli-front-door.md`

Review Loop Report: `review-loop-reports/036-cli-front-door.md`

Final Report: `final-reports/036-cli-front-door.md`

## Rollback

Rollback requires removing `package.json`, `scripts/cli.mjs`, CLI README guidance, CLI self-check coverage, `0.36.0` phase artifacts, and reverting version metadata to `0.35.0`.
