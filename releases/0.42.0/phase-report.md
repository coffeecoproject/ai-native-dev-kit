# Release Phase Report: 0.42.0

## Phase

Productization Hardcut phase `0.42.0`: Docs Information Architecture + Migration Command.

## Completed

- Slimmed README and README.zh-CN into short entry pages.
- Added operator manual, references, adoption playbooks, migration docs, FAQ, and troubleshooting.
- Added `scripts/migrate-project.mjs`.
- Routed `intentos migrate` through the CLI front door.
- Kept migration plan-only:
  - `--dry-run` prints a plan and writes nothing.
  - `--write-plan <file>` writes only the requested JSON plan.
  - direct migrate without either flag fails.
- Updated intentos self-check coverage for migrate safety and docs IA pointers.
- Updated manifest, workflow version template, package version, VERSION, and roadmap phase status.

## Verification

Final command evidence is recorded in:

- `review-loop-reports/042-docs-ia-migration-command.md`
- `final-reports/042-docs-ia-migration-command.md`

## Not Changed

- No migration apply behavior was added.
- No target project files are modified by `migrate`.
- No new dependency was added.
- No license term was changed.
- No industrial pack was promoted.
- No new workflow concept was added.

## Remaining Risk

- `migrate` is intentionally conservative and may produce broad plan recommendations instead of exact file-level diffs.
- Full 1.0 adoption still needs release evidence and real adoption entry criteria.
- Future migration apply behavior requires a separate human decision and reviewed implementation phase.

## Rollback

Revert the 0.42.0 docs, migrate script, CLI route, self-check changes, manifest/version updates, workflow evidence, and this phase report in one commit.
