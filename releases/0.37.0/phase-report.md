# Release Phase Report: 0.37.0 Manifest Authoritative Asset Source

## Summary

Phase `0.37.0` changes `intentos-manifest.json` from an inventory and drift-check file into the authoritative source for asset groups and safe static copy rules.

The phase keeps approval-sensitive behavior outside raw copy rules.

## Completed

- Manifest mode changed to `authoritative`.
- Manifest compatibility policy now records runtime asset behavior change.
- Manifest copy rules added for static directories and files.
- Generated projects now receive `.intentos/intentos-manifest.json`.
- Generated projects now receive `scripts/lib/manifest.mjs`.
- `check-ai-workflow.mjs` reads target required paths from manifest.
- `workflow-next.mjs` reads workflow readiness paths from manifest.
- `check-intentos.mjs` reads source required files from manifest.
- `init-project.mjs` reads copy rules, workflow directories, and workflow version assets from manifest.
- `check-manifest.mjs` validates authoritative behavior.
- Version metadata updated to `0.37.0`.

## Verification

Required local checks:

```bash
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-manifest.mjs
node scripts/cli.mjs init --starter generic-project --target /tmp/intentos-manifest-authoritative-test
node /tmp/intentos-manifest-authoritative-test/scripts/check-ai-workflow.mjs /tmp/intentos-manifest-authoritative-test --mode core
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
```

Result: PASS.

## Boundaries Preserved

- No PR template migration behavior change.
- No AGENTS governance migration behavior change.
- No industrial pack selection behavior change.
- No init/update plan or backup behavior.
- No migration command implementation.
- No package publishing.
- No dependency addition.
- No license wording change.

## Review

Review Packet: `review-packets/037-manifest-authoritative.md`

Review Loop Report: `review-loop-reports/037-manifest-authoritative.md`

Final Report: `final-reports/037-manifest-authoritative.md`

## Rollback

Rollback requires reverting manifest mode and schema to read-only, removing copyRules, restoring script-owned asset lists as active sources, removing generated-project manifest/loader requirements, removing `0.37.0` phase artifacts, and reverting version metadata to `0.36.0`.
