# Review Packet: Manifest Authoritative Asset Source

## Status

Task: `tasks/037-manifest-authoritative.md`

Related Spec: `specs/037-manifest-authoritative.md`

Related Eval: `evals/037-manifest-authoritative.md`

Task Level: L2

Review requested for: Productization Hardcut phase `0.37.0`

## Human Summary

Review whether manifest is authoritative for asset groups and safe static copy rules, whether generated projects receive the manifest and loader, and whether approval-sensitive behavior remains guarded.

## Review Scope

Included:

- `dev-kit-manifest.json`
- `schemas/dev-kit-manifest.schema.json`
- `scripts/lib/manifest.mjs`
- `scripts/check-manifest.mjs`
- `scripts/init-project.mjs`
- `scripts/check-ai-workflow.mjs`
- `scripts/workflow-next.mjs`
- `scripts/check-dev-kit.mjs`
- version metadata
- phase workflow artifacts for `037-manifest-authoritative`

Excluded:

- init/update plan, backup, or dry-run behavior
- migration command implementation
- package publishing
- PR template approval behavior changes
- AGENTS approval behavior changes
- industrial pack selection behavior changes
- license rewrite

## Evidence To Inspect

| Evidence | Ref |
|---|---|
| Manifest | `dev-kit-manifest.json` |
| Manifest schema | `schemas/dev-kit-manifest.schema.json` |
| Manifest loader | `scripts/lib/manifest.mjs` |
| Manifest checker | `scripts/check-manifest.mjs` |
| Init/update static copy consumption | `scripts/init-project.mjs` |
| Target required path consumption | `scripts/check-ai-workflow.mjs` |
| Workflow readiness path consumption | `scripts/workflow-next.mjs` |
| Source required path consumption | `scripts/check-dev-kit.mjs` |
| Final report | `final-reports/037-manifest-authoritative.md` |

## Reviewer Instructions

- Stay read-only.
- Check that manifest mode is `authoritative`.
- Check that generated-project manifest and loader are copied.
- Check that manifest-added target paths are reported by generated-project checks.
- Treat PR template, AGENTS, or industrial pack selection semantic changes as blocking.
- Treat package publishing or migration behavior as out-of-scope drift.

## Expected Review Questions

- Does `check-manifest` validate copyRules and script consumption?
- Do generated projects include `.ai-native/dev-kit-manifest.json`?
- Do generated projects include `scripts/lib/manifest.mjs`?
- Does `check-dev-kit` use manifest for source required files?
- Does `init-project` keep approval-sensitive behavior outside copyRules?

## Known Boundaries

- Manifest authority is limited to asset lists and safe static copies.
- Init/update safety plans are deferred to `0.38.0`.
- Package publishing remains deferred.
