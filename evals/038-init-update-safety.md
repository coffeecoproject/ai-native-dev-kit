# Eval: Init/Update Safety

## Related Spec

Spec: `specs/038-init-update-safety.md`

## Must Pass

- Dry-run emits an `INIT_PROJECT` or `UPDATE_WORKFLOW_ASSETS` plan and writes no target files.
- Write-plan writes only the plan file.
- Apply-plan initializes or updates from the plan.
- Apply-plan rejects a stale target with `Plan precondition failed`.
- Backup-dir preserves overwritten managed asset content.
- Legacy existing projects are blocked from direct update and can proceed through plan-first apply.
- Already bootstrapped generated projects can still update directly.
- CLI global dry-run prints the underlying command.
- CLI command-level update dry-run emits a plan preview.
- Dev-kit self-check passes.

## Spec Alignment

The implementation must stay inside phase `0.38.0`. It must not introduce migration command behavior, artifact schema enforcement, package publishing, source-code scanning, external reviewer automation, or governance behavior changes for PR template, AGENTS, or industrial pack selection.

## Permission / Data Checks

- No secrets, auth, production configuration, migration, destructive operation, value transfer, or dependency addition.
- Plan generation must not bypass explicit apply flags.
- Direct updates must be blocked when `workflow-next` reports a risky project state.
- Apply-plan must fail before writing if target preconditions changed.

## Manual Review Checklist

- Confirm `scripts/init-project.mjs` parses `--dry-run`, `--write-plan`, `--apply-plan`, and `--backup-dir`.
- Confirm plan JSON includes target fingerprint and action list.
- Confirm `FORBIDDEN` actions cannot be applied.
- Confirm direct update uses `workflow-next` gate.
- Confirm `scripts/cli.mjs` separates global dry-run from command-level dry-run.
- Confirm `scripts/check-dev-kit.mjs` includes safety smoke tests.

## Reject Conditions

- Dry-run or write-plan mutates target files.
- Apply-plan succeeds after a target file changes.
- Dirty or unbootstrapped existing projects can still update directly.
- Backups are missing for overwritten managed files when `--backup-dir` is supplied.
- Migration command, package publishing, or schema/frontmatter work is implemented inside this phase.

## Required Evidence

Workflow evidence: `tasks/038-init-update-safety.md`, `decision-briefs/038-init-update-safety.md`, `review-packets/038-init-update-safety.md`, and `review-loop-reports/038-init-update-safety.md`.

Implementation evidence: `scripts/init-project.mjs`, `scripts/cli.mjs`, and `scripts/check-dev-kit.mjs`.

Final evidence: `final-reports/038-init-update-safety.md` and `releases/0.38.0/phase-report.md`.
