# Final Report: 1.8 Real Project Read-only Adoption Trial

## Human Summary

Added a 1.8 read-only real-project adoption layer and patch classification layer so Codex can inspect governed existing projects without overwriting them, and can classify repair scale before using patch-style fixes.

## Completed

- Added Real Project Read-only Adoption Trial core protocol, template, checklist, prompt, directory, checker, source evidence, sanitized example, and bad fixtures.
- Added Patch Classification Governance core protocol, template, checklist, prompt, directory, checker, source evidence, sanitized example, and bad fixtures.
- Added existing-governance-map bridge guidance.
- Improved existing-project baseline detection for non-canonical baseline document names.
- Added CLI, CI, manifest, workflow-version, README, reference docs, platform adapters, and self-check integration.
- Updated version to `1.8.0`.

## Verified

- `node --check scripts/check-real-adoption-trial.mjs`
- `node --check scripts/check-patch-classification.mjs`
- `node scripts/check-real-adoption-trial.mjs .`
- `node scripts/check-patch-classification.mjs .`
- `node scripts/check-real-adoption-trial.mjs examples/1.8-real-project-readonly`
- `node scripts/check-patch-classification.mjs examples/1.8-real-project-readonly`
- `node scripts/check-manifest.mjs`
- `node scripts/check-fixtures.mjs`
- `node scripts/check-product-baseline.mjs .`
- `node scripts/check-claim-control.mjs .`
- `node scripts/check-context-governance.mjs .`
- `node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/180-real-project-adoption-trial.md`
- `node scripts/check-review-loop.mjs . --task tasks/180-real-project-adoption-trial.md`
- `node scripts/check-next-step-boundary.mjs . --task tasks/180-real-project-adoption-trial.md`
- `node scripts/check-intentos.mjs`
- `git diff --check`

## Not Changed

- No target project files were modified.
- No private target project identity was published.
- No production validation or launch approval was claimed.
- No security, privacy, compliance, migration, payment, or release approval was added.
- No external GPT/API hook automation was added.
- No industrial pack was promoted.

## Risks Remaining

- One sanitized real-project read-only trial does not prove every existing project path.
- Checkers validate recorded evidence, not unrecorded private project context.
- Future docs-only or operational bridge application still requires human approval.
- Patch classification reduces patch drift risk but cannot guarantee design quality without proper spec and review.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | `DIRECT_FOLLOW_UP` | Run additional private read-only trials on Mini Program, iOS, Android, and lightly governed Web projects | Future evidence coverage after this first real read-only trial | No | New request | Human must choose the project and approve read-only inspection |
| N2 | `DIRECT_FOLLOW_UP` | For a selected target project, generate a reviewed docs-only bridge plan before any write | Future target adoption | No | New request | Human decision and target write approval required |
| N3 | `DO_NOT_PROCEED` | Overwrite an existing governed production project with intentos assets | Outside current evidence and forbidden by 1.8 | No | Do not proceed | High risk |

## Human Decisions Needed

None for the repository update. Future target-project writes require separate human selection and approval.

## Next Safe Action

Review the 1.8 changes, then decide whether to commit and push.
