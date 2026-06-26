# Eval: Artifact Frontmatter + Schema

## Related Spec

Spec: `specs/039-artifact-frontmatter-schema.md`

## Must Pass

- Generated request artifacts include frontmatter.
- Missing required frontmatter field fails.
- Legacy no-frontmatter artifact warns by default.
- Legacy no-frontmatter artifact fails with `--strict-schema`.
- Manifest check passes with schemas and frontmatter helper copied to targets.
- Dev-kit self-check passes.

## Spec Alignment

Implementation must stay inside `0.39.0`. It must not migrate all examples, make strict schema default, refactor checker internals broadly, or add dependencies.

## Permission / Data Checks

- No secrets, auth, production configuration, migration, destructive operation, value transfer, or dependency addition.
- Frontmatter must not bypass Markdown section checks.
- Frontmatter must not approve implementation or Human Approval.

## Manual Review Checklist

- Confirm schemas exist under `schemas/artifacts/`.
- Confirm `new-workflow-item.mjs` emits frontmatter for schema-backed types.
- Confirm `check-workflow-artifacts.mjs` has `--strict-schema`.
- Confirm generated projects receive `scripts/lib/frontmatter.mjs`.
- Confirm legacy compatibility has an explicit end condition in the roadmap.

## Reject Conditions

- Old artifacts fail by default in `0.39.x`.
- Invalid frontmatter passes silently.
- Markdown section checks are removed or weakened.
- New dependency is added for schema validation.
- Full fixture matrix expansion is implemented inside this phase.

## Required Evidence

Workflow evidence: `tasks/039-artifact-frontmatter-schema.md`, `review-packets/039-artifact-frontmatter-schema.md`, and `review-loop-reports/039-artifact-frontmatter-schema.md`.

Implementation evidence: `schemas/artifacts/`, `scripts/lib/frontmatter.mjs`, `scripts/new-workflow-item.mjs`, `scripts/check-workflow-artifacts.mjs`, and `scripts/check-dev-kit.mjs`.

Final evidence: `final-reports/039-artifact-frontmatter-schema.md` and `releases/0.39.0/phase-report.md`.
