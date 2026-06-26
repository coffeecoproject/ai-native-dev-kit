# Review Packet: Read-only Dev Kit Manifest

## Status

Task: `tasks/035-readonly-manifest.md`

Related Spec: `specs/035-readonly-manifest.md`

Related Eval: `evals/035-readonly-manifest.md`

Task Level: L2

Review requested for: Productization Hardcut phase `0.35.0`

## Human Summary

Review whether the new manifest is read-only, schema-checked, drift-checked, and safely wired into dev-kit self-check without changing existing init/update/check behavior.

## Review Scope

Included:

- `dev-kit-manifest.json`
- `schemas/dev-kit-manifest.schema.json`
- `scripts/lib/manifest.mjs`
- `scripts/check-manifest.mjs`
- `scripts/check-dev-kit.mjs`
- `.github/workflows/dev-kit-pr-checks.yml`
- `.github/workflows/dev-kit-release-checks.yml`
- `decision-briefs/035-readonly-manifest.md`
- phase workflow artifacts for `035-readonly-manifest`

Excluded:

- CLI implementation
- authoritative manifest behavior
- init/update/check behavior changes
- artifact frontmatter or schema enforcement
- target-project bootstrap semantic changes
- license rewrite

## Evidence To Inspect

| Evidence | Ref |
|---|---|
| Manifest | `dev-kit-manifest.json` |
| Manifest schema | `schemas/dev-kit-manifest.schema.json` |
| Manifest checker | `scripts/check-manifest.mjs` |
| Manifest loader | `scripts/lib/manifest.mjs` |
| Decision brief | `decision-briefs/035-readonly-manifest.md` |
| Task card | `tasks/035-readonly-manifest.md` |
| Final report | `final-reports/035-readonly-manifest.md` |

## Reviewer Instructions

- Stay read-only.
- Check that manifest mode is `read-only`.
- Check that `compatibilityPolicy.authoritative` is false.
- Treat any manifest-driven init/update/check behavior as out-of-scope drift.
- Treat missing invalid-manifest and drift negative checks as blocking.
- Do not approve future manifest authority.

## Expected Review Questions

- Does `check-manifest` fail invalid shape before drift checking?
- Does `check-manifest` detect sourceRequired drift?
- Does `check-dev-kit` run `check-manifest`?
- Does CI run `node scripts/check-manifest.mjs`?
- Does version metadata match manifest version?

## Known Boundaries

- Manifest is not authoritative until a future phase.
- Existing duplicate asset lists remain in place.
- This phase is not package or CLI work.
