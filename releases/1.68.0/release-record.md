# Release 1.68.0

## Theme

Product Adoption Simplification / Public Entry Consolidation.

## Summary

1.68.0 makes IntentOS easier to approach as a product without weakening the governance system.

The public entry now leads with:

```bash
node scripts/cli.mjs start <project>
node scripts/cli.mjs next <project>
node scripts/cli.mjs doctor <project>
```

Advanced workflow commands remain available for maintainers, CI, release evidence, and debugging.

## Changes

- Reworked README and README.zh-CN first-screen content around product positioning and the three-command public entry.
- Added short front-door docs:
  - `docs/start-here.md`
  - `docs/minimal-adoption.md`
  - `docs/for-existing-projects.md`
  - `docs/for-maintainers.md`
- Updated docs index pages so new users see the short adoption path before deep governance references.
- Grouped CLI help into:
  - Primary entry commands
  - Common user-facing decisions
  - Advanced commands
- Added `docs/plans/product-adoption-simplification-1.68-plan.md`.

## Allowed Claims

- 1.68.0 simplifies the public entry surface.
- 1.68.0 keeps advanced commands available.
- 1.68.0 does not remove existing workflow capabilities.
- 1.68.0 does not change target-project write authorization.
- 1.68.0 keeps old-project asset migration gated by Native Migration, Existing Rule Reconciliation, apply plan, approval, and readiness checks.

## Forbidden Claims

1.68.0 does not:

- publish an npm package;
- add a new installer, TUI, dashboard, or hosted service;
- rewrite the CLI parser;
- reduce release, migration, hook, baseline, approval, or apply boundaries;
- approve implementation, release, production, CI, hooks, secrets, migrations, payment, permissions, or governance replacement;
- make IntentOS Operating Mode a write permission.

## Evidence Status

- README and README.zh-CN point to the 1.68.0 release record.
- `docs/README.md` and `docs/index.md` link the new front-door docs first.
- CLI help prints primary, common, and advanced command groups.
- `scripts/check-intentos.mjs` checks the new docs and CLI help markers.
- `intentos-manifest.json` includes the new public-entry docs and release evidence.

## Compatibility

- Existing commands remain available.
- Existing generated project assets remain compatible.
- This release changes presentation, documentation, and public-entry diagnosis routing only; it does not alter target-project write authority.

## Known Limitations

- 1.68.0 does not solve package distribution, security disclosure workflow, commercial licensing, runtime sandboxing, or command schema hardening.
- Advanced governance concepts still exist; this release only moves them behind a simpler public entry.

## Verification

- `node --check scripts/cli.mjs` verifies the CLI remains syntactically valid.
- `node scripts/cli.mjs --help` verifies the public entry is grouped into primary, common, and advanced commands.
- `node scripts/cli.mjs start .` and `node scripts/cli.mjs next .` verify the IntentOS source repository is still recognized as the source repository, not a target project.
- `node scripts/cli.mjs doctor .` verifies public diagnosis routes IntentOS source work to `check-intentos` instead of target-project bootstrap checks.
- `node scripts/check-manifest.mjs`, `npm --silent run verify:governance`, `node scripts/check-intentos.mjs`, and `git diff --check` verify the release record, manifest, governance checks, and formatting boundaries.
- The detailed command outcome is recorded in [self-check-report.md](self-check-report.md).
