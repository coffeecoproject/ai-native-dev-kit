# Review Packet: Artifact Frontmatter + Schema

## Human Summary

Review whether phase `0.39.0` adds schema-backed metadata without breaking readable Markdown or legacy artifacts.

## Task

Task: `tasks/039-artifact-frontmatter-schema.md`

Spec: `specs/039-artifact-frontmatter-schema.md`

Eval: `evals/039-artifact-frontmatter-schema.md`

Task level: L2

## Change Summary

- Added `schemas/artifacts/`.
- Added `scripts/lib/frontmatter.mjs`.
- Updated `new-workflow-item.mjs` to emit frontmatter for schema-backed artifacts.
- Updated `check-workflow-artifacts.mjs` to validate frontmatter and support `--strict-schema`.
- Updated generated-project copy/version assets.
- Added self-check coverage for generated, invalid, and legacy frontmatter behavior.

## Review Focus

- Does default mode keep legacy artifacts as warnings?
- Does `--strict-schema` fail old artifacts without frontmatter?
- Does invalid frontmatter fail?
- Do Markdown section checks remain active?
- Do generated projects receive schemas and frontmatter helper?

## Evidence To Check

- `schemas/artifacts/`
- `scripts/lib/frontmatter.mjs`
- `scripts/new-workflow-item.mjs`
- `scripts/check-workflow-artifacts.mjs`
- `scripts/check-intentos.mjs`
- `intentos-manifest.json`

## Known Boundaries

- Existing examples are not fully migrated.
- Strict schema is not default.
- No dependency is added.
- Fixture matrix expansion remains future work.

## Open Questions

None blocking for this phase.

## Reviewer Instruction

Reviewer is read-only. Report findings only. Do not edit files.
