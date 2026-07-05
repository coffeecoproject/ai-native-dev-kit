---
schema_version: 1.0
artifact_type: task
number: "040"
slug: fixture-matrix-expansion
title: Fixture Matrix Expansion
status: ready
created_at: "2026-06-26"
intentos_version: 0.40.0
spec: specs/040-fixture-matrix-expansion.md
eval: evals/040-fixture-matrix-expansion.md
task_level: L2
---
# Task: Fixture Matrix Expansion

## Task Level

L2

## Related Spec

Spec: `specs/040-fixture-matrix-expansion.md`

## Related Eval

Eval: `evals/040-fixture-matrix-expansion.md`

## Goal

Execute Productization Hardcut phase `0.40.0` by expanding the fixture matrix and preserving current checker behavior before `0.40.1` refactoring.

## Scope

Allowed:

- Move negative fixtures under `test-fixtures/bad/`.
- Add typed fixture area directories.
- Expand `fixture-cases.json`.
- Update `scripts/check-fixtures.mjs` runner plumbing and reporting.
- Add lightweight migration fixtures.
- Update manifest/source inventory, version metadata, and phase evidence.

Not allowed:

- Do not refactor checker libraries.
- Do not change production checker semantics.
- Do not add dependencies.
- Do not commit generated project snapshots.
- Do not implement migration command.

## Acceptance Criteria

- Fixture matrix includes golden, bad, migration, CLI, init/update, and output-quality cases.
- Runner reports command, expected output, actual output, and repair guidance on failure.
- Runner reports coverage by type and checker on success.
- `node scripts/check-fixtures.mjs` passes.
- `node scripts/check-intentos.mjs` passes.

## Commands

```bash
node --check scripts/check-fixtures.mjs
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
git diff --check
find scripts -name '*.mjs' -exec node --check {} \;
node scripts/check-goal-mode.mjs . --goal-card goal-cards/040-fixture-matrix-expansion.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/040-fixture-matrix-expansion.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/040-fixture-matrix-expansion.md
node scripts/check-review-loop.mjs . --task tasks/040-fixture-matrix-expansion.md
node scripts/check-next-step-boundary.mjs . --task tasks/040-fixture-matrix-expansion.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-intentos.mjs
```

## AI Budget

Max agent runs: 6

Max repair runs: 2

Stop if: Fixture expansion requires changing production checker behavior or makes fixture output harder to diagnose.

## Risk Gate

- [ ] auth
- [ ] permission
- [ ] secrets
- [ ] production-config
- [ ] migration
- [ ] destructive-operation
- [ ] value-transfer
- [ ] dependency-addition

## Human Approval

Required: No

Status: Not Required

Approval scope: Not Required

Approved by:

Approved at:

## Stop Conditions

- Stop if checker semantics need to change.
- Stop if fixture runner setup writes outside temp directories.
- Stop if generated target project snapshots are added.
- Stop if `check-intentos.mjs` is added as a fixture case.

## Final Report Required

Yes. Final report: `final-reports/040-fixture-matrix-expansion.md`
