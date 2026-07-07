# IntentOS 1.81.2 Self-Check Report

## Scope

This self-check covers the public entry split between `start` and `adopt`.

## Checks Run

- `node --check scripts/start-project.mjs`
- `node --check scripts/cli.mjs`
- `node scripts/cli.mjs --help`
- `node scripts/cli.mjs start .`
- `node scripts/cli.mjs adopt . --intent "connect existing project"`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Boundary Assertions

- `start` writes target-project files: No
- `start` applies workflow assets: No
- `start` enters safe adoption autopilot: No
- `adopt` writes target-project files: No
- Project authority changes: No
- Release or production approval: No

## Result

Passed.

The public CLI help now exposes `adopt` as a primary entry. `start` prints a
Public Entry Boundary, records the same boundary in JSON, and no longer
recommends direct workflow-asset apply actions. `adopt` still prints the
read-only Existing Project Adoption Autopilot card.
