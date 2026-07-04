# Release 1.71.0 - Adoption Execution Assurance

## Summary

1.71.0 adds Adoption Execution Assurance for existing projects.

The release prevents Codex from claiming an old project has fully adopted IntentOS unless required adoption surfaces are checked from evidence and a read-only simulated task proves the workflow route.

## Added

- `core/adoption-execution-assurance.md`
- `docs/adoption-execution-assurance.md`
- `templates/adoption-assurance-report.md`
- `schemas/artifacts/adoption-assurance.schema.json`
- `checklists/adoption-assurance-review.md`
- `prompts/adoption-assurance-agent.md`
- `adoption-assurance-reports/.gitkeep`
- `scripts/resolve-adoption-assurance.mjs`
- `scripts/check-adoption-assurance.mjs`
- `adoption-assurance` and `adoption-assurance-check` CLI commands
- positive examples for verified, partial, and blocked old-project adoption states
- bad fixtures for unsupported full adoption, unresolved evidence, write authorization, production approval, CI/hook mutation, release SOP replacement, stale diff, AI log spam, and empty N/A reasons

## Allowed Claims

- IntentOS can evaluate whether an existing project adoption is verified, partial, blocked, failed, or diagnosis-only.
- `VERIFIED_ACTIVE` requires required surfaces plus read-only simulation pass.
- Partial adoption can still be useful, but it remains plan-first.

## Forbidden Claims

- IntentOS does not automatically write target project files.
- IntentOS does not approve implementation, release, production, CI/hook mutation, release SOP replacement, or project authority transfer.
- Adoption assurance does not prove product correctness.
- Adoption assurance is not a production-proven guarantee.

## Evidence Status

- Resolver and checker added.
- Strict structured evidence is supported.
- Generated-project and source-repo commands remain read-only.
- Bad fixtures reject unsafe claims.

## Verification

Planned and run for this release:

- `node --check scripts/resolve-adoption-assurance.mjs`
- `node --check scripts/check-adoption-assurance.mjs`
- `node scripts/cli.mjs adoption-assurance .`
- `node scripts/cli.mjs adoption-assurance-check .`
- strict example checks
- bad fixture rejection checks
- `node scripts/check-manifest.mjs`
- `node scripts/check-dev-kit.mjs`
- `npm run verify`
- `git diff --check`

## Known Limitations

- Adoption assurance is read-only and does not apply migrations.
- It verifies adoption evidence and workflow routing, not product correctness.
- It does not approve production release, deployment, CI/hook mutation, release SOP replacement, or project authority transfer.
- Local real-project calibration may inform wording, but public release evidence must stay generic and sanitized.

See [known-limitations.md](known-limitations.md).
