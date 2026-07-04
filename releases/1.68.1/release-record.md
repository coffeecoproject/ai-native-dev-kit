# Release 1.68.1

## Theme

Product Adoption Trust Hardening.

## Summary

1.68.1 hardens the 1.68 public entry work.

It does not add a new governance layer. It improves release trust, old-project recommendations, dirty worktree handling, CLI alias consistency, source-only adoption guidance, and private security reporting guidance.

## Changes

- `workflow-next` now recommends `--write-plan` for workflow asset updates in existing, partially bootstrapped, governed, dirty, unbootstrapped, or version-mismatch projects.
- Dirty projects now stop before workflow asset updates, first-request creation, or task execution.
- `ai-native-dev-kit` is now declared as a package bin alias, matching CLI help.
- Added `docs/source-only-adoption.md` for the current GitHub clone usage path.
- Updated SECURITY.md with preferred private vulnerability reporting channels and security impact areas.
- Added `docs/plans/product-adoption-trust-hardening-1.68.1-plan.md`.

## Allowed Claims

- 1.68.1 hardens the public adoption path.
- 1.68.1 improves plan-first recommendations for old, dirty, governed, partial, or version-mismatch projects.
- 1.68.1 documents source-only adoption.
- 1.68.1 aligns CLI alias declarations with help text.
- 1.68.1 clarifies private security reporting.

## Forbidden Claims

1.68.1 does not:

- publish an npm package;
- add an installer, TUI, dashboard, hosted service, or GitHub Action;
- approve implementation, release, production, CI, hooks, secrets, migrations, payment, permissions, or governance replacement;
- make IntentOS Operating Mode a write permission;
- make Codex the release owner;
- replace existing project governance;
- remove existing advanced commands.

## Evidence Status

- Version files point to 1.68.1.
- Source-only adoption is documented and linked from public-entry docs.
- CLI help aliases match package bin declarations.
- `workflow-next` output and self-check fixtures cover dirty project stop behavior and plan-first workflow update recommendations.
- SECURITY.md includes concrete private-reporting guidance.

## Compatibility

- Existing commands remain available.
- Existing generated project assets remain compatible.
- This release changes diagnosis and recommendation behavior, not target-project write authority.

## Known Limitations

- 1.68.1 still does not publish an npm package or installer.
- GitHub Release publication remains an external repository operation.
- Private vulnerability reporting availability depends on GitHub repository settings.

## Verification

- `node --check scripts/workflow-next.mjs`, `node --check scripts/cli.mjs`, and `node --check scripts/check-dev-kit.mjs` verify changed scripts remain syntactically valid.
- `node scripts/cli.mjs --version` and `node scripts/cli.mjs --help` verify the public CLI reports 1.68.1 and includes the source-only adoption entry.
- `node scripts/check-manifest.mjs` verifies manifest version and required source assets.
- `npm --silent run verify:governance` verifies the governance-facing public entries still run.
- `node scripts/check-dev-kit.mjs` verifies plan-first workflow update recommendation, dirty worktree guard behavior, package bin aliases, README/docs pointers, and release evidence.
- `git diff --check` verifies whitespace boundaries.
- The detailed command outcome is recorded in [self-check-report.md](self-check-report.md).
