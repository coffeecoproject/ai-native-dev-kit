# Release Phase Report: 0.38.0 Init/Update Safety

## Summary

Phase `0.38.0` makes workflow setup safer for real projects by adding plan-first init/update behavior.

The phase keeps normal bootstrapped-project updates usable while requiring a reviewable plan for dirty or unbootstrapped existing projects.

## Completed

- Added init/update dry-run plan preview.
- Added write-plan and apply-plan modes.
- Added plan target fingerprint validation.
- Added stale-plan rejection.
- Added backup-dir support for overwritten managed files.
- Added direct-update gate through `workflow-next`.
- Updated CLI dry-run routing.
- Added self-check coverage for dry-run, write-plan, apply-plan, stale plan rejection, backup, and legacy plan-first adoption.
- Version metadata updated to `0.38.0`.

## Verification

Required local checks:

```bash
node --check scripts/init-project.mjs
node --check scripts/cli.mjs
node scripts/check-manifest.mjs
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
```

Result: PASS.

## Boundaries Preserved

- No migration command implementation.
- No artifact schema/frontmatter implementation.
- No external GPT/API reviewer automation.
- No package publishing.
- No dependency addition.
- No license wording change.
- No PR template or AGENTS governance approval weakening.
- No industrial pack concrete selection change.

## Review

Review Packet: `review-packets/038-init-update-safety.md`

Review Loop Report: `review-loop-reports/038-init-update-safety.md`

Final Report: `final-reports/038-init-update-safety.md`

## Rollback

Rollback requires reverting `scripts/init-project.mjs`, `scripts/cli.mjs`, `scripts/check-dev-kit.mjs`, version metadata, manifest source-required entries, roadmap current phase, and `0.38.0` phase artifacts.
