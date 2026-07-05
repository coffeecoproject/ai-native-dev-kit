# 1.74.3 Self-Check Report

## Scope

This self-check covers the 1.74.3 Execution Assurance log and Markdown
consistency patch.

## Required Evidence

- Version metadata updated to `1.74.3`.
- Execution Assurance self-check output labels describe the combined 1.72-1.74
  assurance line.
- Execution Assurance checker cross-checks Markdown `Execution Plan Binding`
  against JSON `execution_plan`.
- Execution Assurance checker cross-checks Markdown `Actual Diff Binding`
  against JSON `actual_diff`.
- Execution Assurance checker cross-checks Markdown `Evidence Binding` against
  JSON `evidence_bindings`.
- Bad fixture coverage includes Markdown/JSON plan-ref mismatch.
- Release evidence is present under `releases/1.74.3/`.

## Commands

```bash
node --check scripts/check-execution-assurance.mjs
node --check scripts/check-intentos.mjs
node scripts/check-execution-assurance.mjs examples/1.72-execution-assurance-chain/feature-contract-validation --require-structured-evidence --require-evidence-refs --require-review --require-actual-diff --require-precise-evidence
node scripts/check-execution-assurance.mjs test-fixtures/bad/bad-execution-assurance-markdown-json-plan-mismatch --require-structured-evidence
node scripts/check-intentos.mjs
node scripts/check-manifest.mjs
npm run verify
git diff --check
```

## Expected Result

All positive checks pass. The Markdown/JSON mismatch fixture fails with a
focused mismatch error.

## Boundary

This self-check does not approve real project implementation, target-project
writes, commit, push, release, production, CI/hook mutation, secrets,
migrations, provider actions, or high-risk business decisions.
