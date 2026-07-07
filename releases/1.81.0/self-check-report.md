# IntentOS 1.81.0 Self-Check Report

## Scope

This self-check covers the read-only Existing Project Safe Adoption Autopilot
implementation.

## Checks Run

- `node --check scripts/resolve-existing-project-adoption-autopilot.mjs`
- `node --check scripts/check-existing-project-adoption-autopilot.mjs`
- `node scripts/check-existing-project-adoption-autopilot.mjs examples/1.81-existing-project-adoption-autopilot/governed-readonly --require-structured-evidence`
- `node scripts/cli.mjs adopt . --intent "接入 IntentOS 老项目工作流"`
- `node scripts/check-manifest.mjs`
- `node scripts/check-intentos.mjs`
- `npm run verify`
- `git diff --check`

## Boundary Assertions

- Target-project writes: No
- Runtime changes: No
- Project authority changes: No
- Native asset installation: No
- Full adoption claim: No
- Release or production approval: No

## Result

Passed.

The generated-project workflow asset check now includes the 1.81 adoption
autopilot docs and scripts, and the release record includes claim-control
sections for allowed claims, forbidden claims, evidence status, and known
limitations.
