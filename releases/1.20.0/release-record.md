# Release 1.20.0: Existing Project Workflow Adapter

## Human Summary

1.20.0 adds a read-only workflow adapter path for existing projects.

It helps Codex explain how IntentOS workflow should connect to a project that
already has its own rules, docs, gates, release process, evidence, or hooks,
without copying a second workflow system over it.

## What Changed

- Added `core/existing-project-workflow-adapter.md`.
- Added `docs/existing-project-workflow-adapter.md`.
- Added `templates/workflow-adoption-map.md`.
- Added `checklists/workflow-adoption-map-review.md`.
- Added `prompts/workflow-adapter-agent.md`.
- Added `workflow-adoption-maps/` as the report directory.
- Added `scripts/resolve-existing-workflow.mjs` for read-only workflow mapping.
- Added `scripts/check-workflow-adoption-map.mjs` for recorded map validation.
- Added CLI entries: `workflow-map` and `workflow-map-check`.
- Added an example and bad fixtures for workflow adoption maps.

## Allowed Claims

- 1.20.0 helps Codex recommend workflow use for existing projects before writes.
- 1.20.0 maps existing workflow assets to IntentOS workflow concepts.
- 1.20.0 keeps adapter recommendations read-only by default.
- 1.20.0 checks recorded maps for write authorization and overclaim risks.

## Forbidden Claims

- Do not claim 1.20.0 installs workflow assets into target projects.
- Do not claim 1.20.0 changes hooks, CI, PR templates, or release workflow.
- Do not claim 1.20.0 approves implementation, release, production, security,
  privacy, compliance, payment, finance, tax, HR, migration, permission, or data
  decisions.
- Do not claim 1.20.0 replaces existing project governance.
- Do not claim 1.20.0 solves doc lifecycle, work queue, or hook orchestration;
  those remain later phases.

## Evidence Status

- Evidence is based on local repository checks, examples, bad fixtures, and
  source self-check.
- No real target project was modified by this release.
- No production or commercial readiness is claimed.

## Known Limitations

- `workflow-map` prints a read-only recommendation; it does not write a report
  into the target project.
- 1.20.0 does not install target-project workflow assets.
- 1.20.0 does not change hooks or CI.
- 1.20.0 does not approve implementation, release, production, security,
  privacy, compliance, payment, finance, tax, HR, migration, permission, or data
  decisions.
- It inventories file and directory signals, but it does not fully parse every
  project-specific governance rule.
- Doc lifecycle, work queue, and hook orchestration remain later phases.

## Verification

Required checks:

```bash
node scripts/resolve-existing-workflow.mjs .
node scripts/resolve-existing-workflow.mjs . --json
node scripts/check-workflow-adoption-map.mjs .
node scripts/check-workflow-adoption-map.mjs examples/1.20-existing-project-workflow-adapter
npm run verify:release
npm run verify
git diff --check
```

## Next

Next work may deepen doc lifecycle, work queue, or hook orchestration as separate
phases. Do not fold them into 1.20 retroactively.
