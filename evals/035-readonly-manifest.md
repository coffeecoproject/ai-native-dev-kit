# Eval: Read-only IntentOS Manifest

## Related Spec

Spec: `specs/035-readonly-manifest.md`

## Must Pass

- Manifest checker passes.
- Dev-kit self-check passes.
- Fixture suite passes.
- Recursive script syntax check passes.
- Phase workflow artifacts pass task-scoped checks.
- Manifest remains read-only and non-authoritative.
- CI includes explicit manifest check steps.

## Spec Alignment

The implementation must stay inside phase `0.35.0`. It must not introduce CLI, manifest authority, artifact frontmatter, schema-backed workflow artifacts, or init/update behavior changes.

## Permission / Data Checks

- No secrets, auth, permission, production configuration, migration, destructive operation, value transfer, or dependency addition.
- Manifest must not change target-project behavior.
- Decision brief must make the authority boundary explicit.

## Manual Review Checklist

- Confirm `intentos-manifest.json` has `mode: read-only`.
- Confirm `compatibilityPolicy.authoritative` is false.
- Confirm `check-manifest` validates structure before drift.
- Confirm `check-intentos` includes a positive manifest check and negative manifest checks.
- Confirm CI runs `node scripts/check-manifest.mjs`.

## Reject Conditions

- Manifest becomes the source of truth for init/update/check behavior in this phase.
- CLI is added.
- Existing script lists are removed or replaced.
- Drift checker requires changing target-project behavior.
- Manifest checker ignores invalid manifest structure.

## Required Evidence

Workflow evidence: `tasks/035-readonly-manifest.md`, `decision-briefs/035-readonly-manifest.md`, `review-packets/035-readonly-manifest.md`, and `review-loop-reports/035-readonly-manifest.md`.

Manifest evidence: `intentos-manifest.json`, `schemas/intentos-manifest.schema.json`, `scripts/lib/manifest.mjs`, and `scripts/check-manifest.mjs`.

Final evidence: `final-reports/035-readonly-manifest.md` and `releases/0.35.0/phase-report.md`.
