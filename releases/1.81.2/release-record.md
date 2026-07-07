# IntentOS 1.81.2 Release Record

## Theme

Public Entry Adoption Integration.

## Summary

1.81.2 makes the public entry split explicit:

- `start <target>` is read-only orientation only.
- `adopt <target> --intent "<goal>"` is the old-project safe adoption entry.

This prevents users from accidentally moving toward migration or workflow asset
application when they only asked Codex to read a project.

## Changed

- CLI help now lists `adopt` as a primary entry command.
- `start` command description says it does not enter adoption or write flow.
- `start` recommendation output includes a Public Entry Boundary section.
- `start` safe next actions no longer directly recommend writing or applying
  workflow assets.
- old-project docs point users to `adopt` instead of internal migration
  commands as the first public adoption entry.
- self-check coverage verifies the `start` / `adopt` boundary.

## Allowed Claims

- IntentOS has a public entry split for project orientation versus old-project
  safe adoption.
- `start` can classify and explain the target without writing target files.
- `adopt` can run the read-only Existing Project Safe Adoption Autopilot.
- Later workflow writes still require apply-plan approval and readiness.

## Forbidden Claims

- This release does not make `start` write project files.
- This release does not make `adopt` write project files.
- This release does not install `.intentos/`.
- This release does not apply workflow assets.
- This release does not replace project rules, CI, hooks, release SOPs, secrets,
  migrations, production config, business code, or project authority.
- This release does not approve implementation, commit, push, release,
  production, app-store review, or mini-program review.

## Evidence Status

- Script syntax checks cover `scripts/start-project.mjs`,
  `scripts/cli.mjs`, and `scripts/check-intentos.mjs`.
- CLI help evidence confirms `adopt` is a primary entry command.
- `start` human output evidence confirms the Public Entry Boundary section is
  present and no direct apply-plan action is recommended.
- `start --json` evidence confirms `writesTargetProjectFiles`,
  `startsAdoptionAutopilot`, and `appliesWorkflowAssets` are all `No`.
- `adopt` resolver evidence confirms the Existing Project Safe Adoption
  Autopilot still produces a read-only result card.
- `scripts/check-intentos.mjs` now includes regression checks for the
  `start` / `adopt` public entry split.
- `scripts/check-manifest.mjs` confirms new release and plan files are in the
  source manifest.

## Known Limitations

- `start` is orientation only and does not create an adoption record.
- `adopt` remains read-only; it summarizes safe adoption status but does not
  approve or apply migration.
- Existing projects still need rule comparison, convergence evidence,
  adoption assurance, Unified Apply Plan, explicit approval, and readiness
  before target-project workflow assets can change.
- 1.81.2 changes public entry semantics and self-check coverage only; it does
  not add a new migration engine.

## Verification

Required verification:

```bash
node --check scripts/start-project.mjs
node --check scripts/cli.mjs
node scripts/cli.mjs --help
node scripts/cli.mjs start .
node scripts/cli.mjs adopt . --intent "connect existing project"
node scripts/check-manifest.mjs
node scripts/check-intentos.mjs
git diff --check
```
