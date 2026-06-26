# Task: Manifest Authoritative Asset Source

## Task Level

L2

## Related Spec

Spec: `specs/037-manifest-authoritative.md`

## Related Eval

Eval: `evals/037-manifest-authoritative.md`

## Goal

Execute Productization Hardcut phase `0.37.0` by making `dev-kit-manifest.json` authoritative for asset groups and safe static copy rules while preserving governance protections.

## Scope

Allowed:

- Change manifest mode and compatibility policy to authoritative.
- Add manifest copy rules.
- Make source required files, target required paths, workflow readiness paths, workflow version assets, workflow directories, and safe static copy rules read from manifest.
- Copy `.ai-native/dev-kit-manifest.json` and `scripts/lib/manifest.mjs` into generated projects.
- Update manifest schema and manifest checker.
- Update version metadata to `0.37.0`.
- Add `0.37.0` workflow artifacts and release evidence.

Not allowed:

- Do not change PR template or AGENTS migration approval behavior.
- Do not change industrial pack concrete selection behavior.
- Do not add init/update plan, backup, or dry-run behavior.
- Do not implement migration command.
- Do not add dependencies.
- Do not add artifact schema enforcement.
- Do not publish package.
- Do not rewrite license terms.

## Acceptance Criteria

- `node scripts/check-manifest.mjs` passes.
- `node scripts/check-dev-kit.mjs` passes and includes authoritative manifest checks.
- Generated-project smoke passes.
- Manifest-added target path is reported by both generated-project `check-ai-workflow` and `workflow-next`.
- Final report records verification results.

## Commands

```bash
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-manifest.mjs
node scripts/cli.mjs init --starter generic-project --target /tmp/ai-native-manifest-authoritative-test
node /tmp/ai-native-manifest-authoritative-test/scripts/check-ai-workflow.mjs /tmp/ai-native-manifest-authoritative-test --mode core
node scripts/check-goal-mode.mjs . --goal-card goal-cards/037-manifest-authoritative.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/037-manifest-authoritative.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/037-manifest-authoritative.md
node scripts/check-review-loop.mjs . --task tasks/037-manifest-authoritative.md
node scripts/check-next-step-boundary.mjs . --task tasks/037-manifest-authoritative.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
```

## AI Budget

Max agent runs: 6

Max repair runs: 2

Stop if: Work drifts into init/update plan behavior, migration command behavior, package publishing, or safety-governed overwrite behavior.

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

- Stop if manifest-driven copy changes existing PR template or AGENTS approval semantics.
- Stop if generated projects cannot run manifest-driven checks.
- Stop if manifest authority requires package publishing or dependency installation.
- Stop if existing governed/production/dirty protection is weakened.

## Final Report Required

Yes. Final report: `final-reports/037-manifest-authoritative.md`
