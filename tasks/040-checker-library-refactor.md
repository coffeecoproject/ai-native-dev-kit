---
schema_version: 1.0
artifact_type: task
number: "040"
slug: checker-library-refactor
title: Checker Library Refactor
status: ready
created_at: "2026-06-27"
devkit_version: 0.40.1
spec: specs/040-checker-library-refactor.md
eval: evals/040-checker-library-refactor.md
task_level: L2
---
# Task 040: Checker Library Refactor

## Task Level

L2

## Related Spec

Spec: `specs/040-checker-library-refactor.md`

## Related Eval

Eval: `evals/040-checker-library-refactor.md`

## Goal

Execute Productization Hardcut phase `0.40.1` by extracting shared checker utilities and migrating covered scripts without changing checker behavior.

## Scope

Allowed:

- Add `scripts/lib/args.mjs`, `scripts/lib/markdown.mjs`, `scripts/lib/check-result.mjs`, `scripts/lib/git.mjs`, and `scripts/lib/project-signals.mjs`.
- Refactor repeated checker plumbing in scripts covered by the fixture matrix.
- Update manifest/source inventory, version metadata, README notes, and phase evidence.
- Run local non-destructive verification commands.

Not allowed:

- Do not change checker semantics.
- Do not add dependencies.
- Do not implement migration command behavior.
- Do not change generated project snapshots.
- Do not alter platform or industrial baseline policy.

## Acceptance Criteria

- Shared checker libraries exist and are used by migrated scripts.
- Fixture matrix passes.
- `node scripts/check-dev-kit.mjs` passes.
- Existing CLI output remains stable unless reviewed and documented.
- No new package dependency is added.
- 0.40.1 evidence files, manifest, version metadata, and release report are complete.

## Commands

```bash
node --check scripts/lib/args.mjs
node --check scripts/lib/markdown.mjs
node --check scripts/lib/check-result.mjs
node --check scripts/lib/git.mjs
node --check scripts/lib/project-signals.mjs
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
git diff --check
find scripts -name '*.mjs' -exec node --check {} \;
node scripts/check-goal-mode.mjs . --goal-card goal-cards/040-checker-library-refactor.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/040-checker-library-refactor.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/040-checker-library-refactor.md
node scripts/check-review-loop.mjs . --task tasks/040-checker-library-refactor.md
node scripts/check-next-step-boundary.mjs . --task tasks/040-checker-library-refactor.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-dev-kit.mjs
```

## AI Budget

Max agent runs: 6

Max repair runs: 2

Stop if: a helper abstraction requires changing checker semantics or makes checker output harder to diagnose.

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

Approved by: Not Required

Approved at: Not Required

## Stop Conditions

- Stop if fixture expectations must change for unreviewed behavior drift.
- Stop if shared helpers hide script-specific behavior.
- Stop if a generated project snapshot appears in the diff.
- Stop if a package dependency would be needed.

## Final Report Required

Yes. Final report: `final-reports/040-checker-library-refactor.md`
