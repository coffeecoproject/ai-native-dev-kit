# Release Record: 1.1.0 Guided Adoption Entry

## Status

Verified.

## Release Theme

Guided Adoption Entry: make first project contact user-friendly and read-only by default.

## What Changed

- Added `node scripts/cli.mjs start <project>`.
- Added `scripts/start-project.mjs` for read-only adoption recommendations.
- Added `scripts/check-guided-adoption.mjs` for saved recommendation reports.
- Added `templates/adoption-recommendation-report.md`.
- Added `adoption-recommendations/` as a generated-project report directory.
- Added `docs/first-hour.md`.
- Added `examples/1.1-guided-adoption/`.
- Updated generated-project manifest, CI surface, and version metadata.

## Product Promise

The user should not need to know whether to run `next`, `doctor`, `init`, `update`, `dry-run`, or `write-plan` first.

The user gives a project path and confirms decisions. Codex inspects, recommends, and prepares safe next actions.

## Safety Boundary

- `start` is read-only by default.
- `start` does not write target project files.
- `start` does not apply init, update, migration, baseline setup, BL2, or industrial packs.
- BL2 and industrial packs require explicit human confirmation.
- Governed, production-sensitive, and dirty projects route to read-only or plan-first adoption.

## Verification

```text
node --check scripts/start-project.mjs
node --check scripts/check-guided-adoption.mjs
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/new-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/existing-light-project
node scripts/check-guided-adoption.mjs examples/1.1-guided-adoption/governed-readonly
node scripts/cli.mjs start .
node scripts/cli.mjs start . --json
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
```

Result: PASS.

## Known Limitations

- Project classification is heuristic and conservative.
- Real-project trial evidence is not claimed by this release.
- External GPT/API reviewer automation is not included.
