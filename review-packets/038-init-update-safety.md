# Review Packet: Init/Update Safety

## Human Summary

Review phase `0.38.0` for whether init/update is safer without becoming over-heavy for ordinary already bootstrapped projects.

## Task

Task: `tasks/038-init-update-safety.md`

Spec: `specs/038-init-update-safety.md`

Eval: `evals/038-init-update-safety.md`

Task level: L2

## Change Summary

- `scripts/init-project.mjs` adds dry-run, write-plan, apply-plan, backup-dir, plan JSON, fingerprint validation, and direct-update gate.
- `scripts/cli.mjs` separates global dry-run from command-level init/update dry-run.
- `scripts/check-intentos.mjs` adds safety smoke tests for no-write preview, plan-only write, apply-plan, stale plan rejection, backup, and legacy plan-first adoption.
- Version, manifest, roadmap, and phase evidence move to `0.38.0`.

## Review Focus

- Does dry-run truly avoid target writes?
- Does write-plan only write the requested plan file?
- Does apply-plan fail when target files changed after plan creation?
- Are governed, production, dirty, or unbootstrapped existing projects blocked from direct update?
- Are bootstrapped generated projects still easy to update?
- Does backup-dir preserve overwritten managed assets?

## Evidence To Check

- `scripts/init-project.mjs`
- `scripts/cli.mjs`
- `scripts/check-intentos.mjs`
- `tasks/038-init-update-safety.md`
- `evals/038-init-update-safety.md`
- `final-reports/038-init-update-safety.md`

## Known Boundaries

- Migration command is not implemented.
- Artifact frontmatter/schema is not implemented.
- External GPT/API reviewer automation is not implemented.
- PR template and AGENTS governance migrations still require explicit flags.
- Industrial pack concrete selection rules remain unchanged.

## Open Questions

None blocking for this phase.

## Reviewer Instruction

Reviewer is read-only. Report findings only. Do not edit files.
