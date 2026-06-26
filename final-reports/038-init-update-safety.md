# Final Report: Init/Update Safety

## Human Summary

Phase `0.38.0` makes init/update safer. Codex can now show what it will do, save that as a plan, apply the plan only if the target did not change, and keep backups before managed overwrites.

## Completed

- Added `--dry-run` plan preview to `scripts/init-project.mjs`.
- Added `--write-plan <file>` and `--apply-plan <file>`.
- Added machine-readable plan JSON with target fingerprint, expected preconditions, and actions.
- Added stale-plan rejection before writes.
- Added `--backup-dir <dir>` for overwritten managed assets.
- Added direct-update blocking for dirty or unbootstrapped existing projects.
- Preserved direct update for already bootstrapped generated projects.
- Updated `scripts/cli.mjs` so global dry-run prints commands and command-level init/update dry-run emits plan preview.
- Updated `scripts/check-dev-kit.mjs` with init/update safety coverage.
- Updated version metadata, manifest, roadmap status, and phase evidence to `0.38.0`.

## Verified

Commands run:

```bash
node --check scripts/init-project.mjs
node --check scripts/cli.mjs
node scripts/check-manifest.mjs
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-goal-mode.mjs . --goal-card goal-cards/038-init-update-safety.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/038-init-update-safety.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/038-init-update-safety.md
node scripts/check-review-loop.mjs . --task tasks/038-init-update-safety.md
node scripts/check-next-step-boundary.mjs . --task tasks/038-init-update-safety.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-fixtures.mjs
node scripts/check-dev-kit.mjs
```

Result: PASS after final verification.

## Not Changed

- Migration command was not implemented.
- Artifact schema/frontmatter was not added.
- External GPT/API reviewer automation was not added.
- Package was not published.
- No dependency was added.
- PR template and AGENTS governance approval semantics were not weakened.
- Industrial pack concrete selection behavior was not changed.

## Risks Remaining

Plans are local files and should be stored outside the target repository when the target is a dirty or production git worktree, unless the plan file itself is intentionally part of the review. This is acceptable for `0.38.0` because the command validates target fingerprints before apply.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare phase `0.39.0` artifact frontmatter and schema after `0.38.0` is reviewed | This is the next productization phase, outside current task scope | No | follow-up proposal or new request | Human approval of phase scope required |
| N2 | DO_NOT_PROCEED | Do not implement migration command or package publishing inside `0.38.0` | Those changes exceed this phase | No | do not proceed | Separate approval required |

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Add init/update plan-first safety in `0.38.0` | Confirmed by task scope | Repository owner | `tasks/038-init-update-safety.md` |
| Add artifact schema/frontmatter next | Deferred | Repository owner | Future `0.39.0` task |
| Implement migration command later | Deferred | Repository owner | Future `0.42.0` task |

## Next Safe Action

Review the `0.38.0` phase evidence, commit the phase, then start `0.39.0` from a new task card.

## Technical Details

Plan apply validates target existence, git repository state, branch, HEAD, dirty file count, and hashes for files referenced by the plan. Apply fails before writes when those preconditions change.

## Audit Notes

- Task level: L2.
- Review loop final status: DONE.
- No external GPT/API reviewer automation was used.
- No helper role remains open after handoff.
