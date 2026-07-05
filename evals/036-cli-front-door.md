# Eval: CLI Front Door

## Related Spec

Spec: `specs/036-cli-front-door.md`

## Must Pass

- CLI help and version commands pass.
- CLI `next` delegates to `workflow-next` and keeps stop-condition output visible.
- CLI `fixtures` delegates to fixture checks.
- CLI `self-check --dry-run` maps to `scripts/check-intentos.mjs`.
- CLI `init` prints the underlying write command and creates a project that passes core workflow checks.
- Dev-kit self-check passes.
- Manifest check passes.
- Fixture suite passes.
- Recursive script syntax check passes.
- Phase workflow artifacts pass task-scoped checks.

## Spec Alignment

The implementation must stay inside phase `0.36.0`. It must not introduce package publishing, manifest authority, migration implementation, init/update safety plans, artifact schema enforcement, or target-project bootstrap semantic changes.

## Permission / Data Checks

- No secrets, auth, production configuration, migration, destructive operation, value transfer, or dependency addition.
- Write commands must show the underlying command.
- `migrate` must remain explicitly planned-only.
- The CLI must not hide underlying script failures.

## Manual Review Checklist

- Confirm `scripts/cli.mjs` is a thin facade.
- Confirm `package.json` is private.
- Confirm CLI help lists commands in plain language.
- Confirm write commands print underlying commands.
- Confirm self-check does not recurse during intentos self-check.
- Confirm README explains CLI while preserving lower-level scripts.

## Reject Conditions

- CLI reimplements checker logic.
- CLI changes target-project bootstrap semantics.
- CLI treats `migrate` as implemented.
- CLI hides `workflow-next` output or failures.
- Package publishing metadata is treated as approved release distribution.

## Required Evidence

Workflow evidence: `tasks/036-cli-front-door.md`, `decision-briefs/036-cli-front-door.md`, `review-packets/036-cli-front-door.md`, and `review-loop-reports/036-cli-front-door.md`.

CLI evidence: `package.json`, `scripts/cli.mjs`, README CLI guidance, and `scripts/check-intentos.mjs` CLI checks.

Final evidence: `final-reports/036-cli-front-door.md` and `releases/0.36.0/phase-report.md`.
