# Execution Assurance Log And Markdown Consistency 1.74.3 Plan

## Goal

Close the 1.74 Execution Assurance hardening line without adding a new workflow
layer.

This patch improves maintainer readability and audit consistency:

- self-check output should describe the full 1.72-1.74 Execution Assurance
  line, not only the original 1.72 phase;
- human-readable Markdown binding tables must match the machine-readable JSON
  evidence.

## Inputs

- 1.72 Execution Assurance Chain.
- 1.74.0 Execution Assurance Strict Binding.
- 1.74.1 vocabulary and docs sync.
- 1.74.2 runtime naming and plan-ref binding.
- Review finding: self-check logs still used `1.72 execution assurance` labels
  even though the check covers 1.72 through 1.74.
- Review finding: Markdown `Execution Plan Binding`, `Actual Diff Binding`, and
  `Evidence Binding` tables were not cross-checked against structured JSON.

## Implementation Scope

- Rename Execution Assurance self-check output labels to `1.72-1.74 execution
  assurance`.
- Cross-check Markdown `Execution Plan Binding` table fields against JSON
  `execution_plan`.
- Cross-check Markdown `Actual Diff Binding` table fields against JSON
  `actual_diff`.
- Cross-check Markdown `Evidence Binding` table rows against JSON
  `evidence_bindings`.
- Add a bad fixture for Markdown/JSON plan-ref mismatch.
- Update release evidence and version metadata to `1.74.3`.

## Non-Goals

- Do not change the Execution Assurance artifact schema shape.
- Do not create a new assurance artifact type.
- Do not change resolver behavior or generate different report fields.
- Do not make Markdown the source of truth; JSON remains authoritative.
- Do not authorize target-project writes, implementation, commit, push,
  release, production, CI/hook mutation, secrets, migrations, provider actions,
  or governance replacement.

## Acceptance

- `scripts/check-intentos.mjs` no longer emits misleading `1.72 execution
  assurance` labels for the 1.72-1.74 combined assurance line.
- Positive Execution Assurance examples pass existing strict checks.
- A Markdown/JSON plan-ref mismatch fixture is rejected.
- Version metadata is `1.74.3` across README, VERSION, package, manifest, and
  workflow version template.
- `node scripts/check-intentos.mjs`, `node scripts/check-manifest.mjs`,
  `npm run verify`, and `git diff --check` pass.
