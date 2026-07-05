# Release 1.68.2

## Theme

Product Adoption Trust Finalization.

## Summary

1.68.2 is a narrow public-adoption trust patch after 1.68.1.

It does not add a new governance layer. It clarifies how source-only users start, aligns command alias wording, corrects dirty-project wording, and prepares release evidence for GitHub Release publication.

## Changes

- Source-only adoption now lists required local tools: Node.js `>=22`, npm, and git.
- CLI help and command help now show `Command: intentos`.
- 1.68.1 self-check wording now matches actual dirty-project behavior: dirty projects stop first; after human review, workflow asset updates remain plan-first.
- Added `docs/plans/product-adoption-trust-finalization-1.68.2-plan.md`.
- Recorded the future `docs/plans/existing-project-native-adoption-decision-1.69-plan.md` so 1.69 execution can start from a fixed plan instead of conversation memory.
- Added 1.68.2 release evidence.

## Allowed Claims

- 1.68.2 improves public source-only adoption trust.
- 1.68.2 clarifies environment prerequisites.
- 1.68.2 aligns command alias wording.
- 1.68.2 clarifies dirty-project stop-first behavior.
- 1.68.2 prepares release evidence for GitHub Release publication.

## Forbidden Claims

1.68.2 does not:

- publish an npm package;
- add an installer, TUI, dashboard, hosted service, or GitHub Action;
- implement the 1.69 existing-project native adoption decision layer;
- claim the 1.69 plan has been executed;
- approve implementation, release, production, CI, hooks, secrets, migrations, payment, permissions, or governance replacement;
- make Codex the release owner;
- replace existing project governance.

## Evidence Status

- Version metadata points to `1.68.2`.
- CLI help prints `Command: intentos`.
- Source-only adoption documents Node.js `>=22`, npm, and git prerequisites.
- 1.68.1 dirty-project self-check wording has been corrected to match stop-first behavior.
- 1.69 planning is recorded as future execution guidance only; no 1.69 behavior is active in this release.
- GitHub Release publication is expected after source verification and tag creation.

## Known Limitations

- No npm package, installer, dashboard, hosted service, TUI, or GitHub Action is published by this release.
- Source-only adoption still requires cloning the repository and running local Node scripts.
- GitHub Release publication is a repository operation outside source files.
- 1.69 existing-project native adoption decision behavior is not included in this patch.
- Dirty-project protection stops before higher-risk actions; it cannot identify the human owner of every local change by itself.

## Verification

- `node --check scripts/cli.mjs`
- `node --check scripts/check-intentos.mjs`
- `node scripts/cli.mjs --version`
- `node scripts/cli.mjs --help`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `git diff --check`

Detailed results are recorded in [self-check-report.md](self-check-report.md).
