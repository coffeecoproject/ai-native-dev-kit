# Eval: Manifest Authoritative Asset Source

## Related Spec

Spec: `specs/037-manifest-authoritative.md`

## Must Pass

- Manifest checker passes in authoritative mode.
- Dev-kit self-check passes.
- Fixture suite passes.
- Recursive script syntax check passes.
- Generated-project smoke passes.
- Phase workflow artifacts pass task-scoped checks.
- Manifest-added target required path is reported by generated-project `check-ai-workflow` and `workflow-next`.

## Spec Alignment

The implementation must stay inside phase `0.37.0`. It must not introduce init/update plan behavior, migration command behavior, artifact schema enforcement, package publishing, or governance behavior changes for PR template, AGENTS, or industrial pack selection.

## Permission / Data Checks

- No secrets, auth, production configuration, migration, destructive operation, value transfer, or dependency addition.
- Manifest authority must not bypass explicit apply flags.
- Generated-project behavior must remain checkable through existing commands.

## Manual Review Checklist

- Confirm manifest mode is `authoritative`.
- Confirm copyRules include manifest and loader copy targets.
- Confirm `check-ai-workflow`, `workflow-next`, `check-dev-kit`, and `init-project` consume manifest helpers.
- Confirm generated projects include `.ai-native/dev-kit-manifest.json`.
- Confirm generated projects include `scripts/lib/manifest.mjs`.
- Confirm migration reports for PR template and AGENTS remain unchanged.

## Reject Conditions

- Existing governed/production/dirty protection is weakened.
- PR template or AGENTS overwrite behavior changes without explicit approval.
- Industrial pack concrete packs are copied without selection.
- Manifest-added target path requires editing multiple scripts to be reported.
- Generated project checks fail because the manifest loader is missing.

## Required Evidence

Workflow evidence: `tasks/037-manifest-authoritative.md`, `decision-briefs/037-manifest-authoritative.md`, `review-packets/037-manifest-authoritative.md`, and `review-loop-reports/037-manifest-authoritative.md`.

Manifest evidence: `dev-kit-manifest.json`, `schemas/dev-kit-manifest.schema.json`, `scripts/lib/manifest.mjs`, `scripts/check-manifest.mjs`, `scripts/init-project.mjs`, `scripts/check-ai-workflow.mjs`, `scripts/workflow-next.mjs`, and `scripts/check-dev-kit.mjs`.

Final evidence: `final-reports/037-manifest-authoritative.md` and `releases/0.37.0/phase-report.md`.
