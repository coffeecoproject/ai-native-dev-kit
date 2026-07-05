# Final Report: Checker Library Refactor

Use this file when a task result needs a durable final report beyond the chat response.

This report does not approve release, risk, scope expansion, or future work. Next-step suggestions must follow `core/next-step-boundary.md`.

## Human Summary

0.40.1 is complete locally: checker scripts now share common helper libraries, generated projects receive those helpers, and the full intentos self-check passes.

## Completed

- Added shared helper libraries under `scripts/lib/` for args, Markdown, result recording, git state, and project signals.
- Migrated covered checker scripts away from duplicated `parseArgs`, `sectionBody`, git state, and file-walking helpers.
- Kept `init-project.mjs` and `new-workflow-item.mjs` local helper behavior where it is script-specific.
- Updated manifest, workflow version templates, version metadata, README notes, and 0.40.1 phase evidence.
- Confirmed generated project update paths include the new helper libraries.

## Verified

| Check | Command / Evidence | Result |
|---|---|---|
| Script syntax | `find scripts -name '*.mjs' -exec node --check {} \;` | PASS |
| Fixture matrix | `node scripts/check-fixtures.mjs` | PASS |
| Manifest | `node scripts/check-manifest.mjs` | PASS |
| Goal Mode | `node scripts/check-goal-mode.mjs . --goal-card goal-cards/040-checker-library-refactor.md` | PASS |
| Subagent Orchestration | `node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/040-checker-library-refactor.md` | PASS |
| Workflow artifacts | `node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/040-checker-library-refactor.md` | PASS |
| Dev-kit self-check | `node scripts/check-intentos.mjs` | PASS |

## Not Changed

- No checker semantic redesign.
- No dependency addition.
- No migration command implementation.
- No generated project snapshot.
- No platform or industrial baseline policy change.

## Risks Remaining

- Push is blocked until the GitHub credential has `workflow` scope.
- Some local helper code remains in special scripts by design; this is intentional because their parsing or section behavior differs from generic checker plumbing.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Start `0.41.0` industrial pack maturity and license boundary after 0.40.1 is reviewed | next roadmap phase | No | new request or task card | license wording and maturity claims may need human decision |
| N2 | RISK_DECISION | Update GitHub token with `workflow` scope if this environment should push commits that include workflow files | delivery of committed work | No | human decision | credential scope decision |

## Human Decisions Needed

| Decision | Reason | Options | Recommended | Owner | Status |
|---|---|---|---|---|---|
| GitHub push credential scope | GitHub rejected push because token lacks `workflow` scope | provide scoped token / push manually / skip push now | provide scoped token if Codex should push | human | PENDING |
| Start `0.41.0` | separate roadmap phase after 0.40.1 | start now / wait for external review | wait for review if desired | human | PENDING |

## Next Safe Action

Commit 0.40.1 locally. Push only after the GitHub token issue is resolved.

## Technical Details

Task: `tasks/040-checker-library-refactor.md`

Spec: `specs/040-checker-library-refactor.md`

Eval: `evals/040-checker-library-refactor.md`

Review Packet: `review-packets/040-checker-library-refactor.md`

Review Loop Report: `review-loop-reports/040-checker-library-refactor.md`

Commands run:

```text
node --check scripts/lib/args.mjs
find scripts -name '*.mjs' -exec node --check {} \;
node scripts/check-fixtures.mjs
node scripts/check-manifest.mjs
node scripts/check-goal-mode.mjs . --goal-card goal-cards/040-checker-library-refactor.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/040-checker-library-refactor.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/040-checker-library-refactor.md
node scripts/check-intentos.mjs
```

Changed files:

- shared helper libraries
- checker scripts and workflow-next
- manifest and workflow version templates
- version, README, package metadata
- 0.40.1 workflow and release evidence

Evidence refs:

- `releases/0.40.1/phase-report.md`
- `review-packets/040-checker-library-refactor.md`
- `review-loop-reports/040-checker-library-refactor.md`

## Audit Notes

Approvals:

- Behavior-preserving 0.40.1 execution was requested by the repository owner in chat.

Exceptions:

- No external GPT/API review used.

Residual risks:

- Remote push requires credential scope update.
