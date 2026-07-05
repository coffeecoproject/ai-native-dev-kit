# Final Report: CLI Front Door

## Human Summary

Phase `0.36.0` adds a simple CLI front door for the IntentOS. The CLI gives people one place to start, but it still delegates to the existing scripts that already own init, update, next-step detection, checks, fixtures, and self-checks.

## Completed

- Added `package.json` with private package metadata, `intentos` bin mapping, and local scripts.
- Added `scripts/cli.mjs`.
- Added CLI help, version, dry-run, command routing, write-command display, and planned-only `migrate`.
- Updated README and README.zh-CN to prefer CLI for human usage.
- Kept lower-level scripts documented for CI, debugging, and exact evidence.
- Updated `scripts/check-intentos.mjs` with CLI smoke coverage.
- Updated version metadata to `0.36.0`.
- Added phase Goal Card, Subagent Run Plan, Decision Brief, Review Packet, Review Loop Report, Final Report, and release phase evidence.

## Verified

Commands run:

```bash
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/cli.mjs --help
node scripts/cli.mjs --version
node scripts/cli.mjs next .
node scripts/cli.mjs fixtures
node scripts/cli.mjs self-check --dry-run
node scripts/cli.mjs update --target /tmp/intentos-cli-dry-run --dry-run
node scripts/cli.mjs doctor . --dry-run
node scripts/cli.mjs init --starter generic-project --target /tmp/intentos-cli-test
node /tmp/intentos-cli-test/scripts/check-ai-workflow.mjs /tmp/intentos-cli-test --mode core
node scripts/check-manifest.mjs
node scripts/check-goal-mode.mjs . --goal-card goal-cards/036-cli-front-door.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/036-cli-front-door.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/036-cli-front-door.md
node scripts/check-review-loop.mjs . --task tasks/036-cli-front-door.md
node scripts/check-next-step-boundary.mjs . --task tasks/036-cli-front-door.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
```

Result: PASS.

Evidence refs: `scripts/cli.mjs`, `package.json`, `scripts/check-intentos.mjs`, `decision-briefs/036-cli-front-door.md`, and `review-loop-reports/036-cli-front-door.md`.

## Not Changed

- Package was not published.
- Manifest was not made authoritative.
- Migration command was not implemented.
- Init/update safety plan, backup, or apply-plan behavior was not added.
- Existing target-project bootstrap semantics were not changed.
- No artifact frontmatter or schema enforcement was added.
- No license terms were rewritten.

## Risks Remaining

The CLI is now a stable front door, but later phases still need to decide how manifest authority, migration, package distribution, and init/update safety should work.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare phase `0.37.0` manifest authoritative asset source after this phase is reviewed | This is the next productization phase, but outside current task scope | No | follow-up proposal or new request | Human approval of phase scope required |
| N2 | DO_NOT_PROCEED | Do not publish package, implement migration, or make manifest authoritative inside `0.36.0` | Those changes exceed this phase | No | do not proceed | Separate approval required |

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Keep package private in `0.36.0` | Confirmed by task scope | Repository owner | `decision-briefs/036-cli-front-door.md` |
| Publish package later | Deferred | Repository owner | Future distribution decision |
| Implement migration later | Deferred | Repository owner | Future migration task |

## Next Safe Action

Review the `0.36.0` phase evidence and only then start `0.37.0` from a new task card and follow-up request.

## Technical Details

The CLI has a local command registry, delegates execution to existing scripts, supports `--dry-run`, prints underlying commands for write actions, and reads manifest data only for help/version display.

## Audit Notes

- Task level: L2.
- Review loop final status: DONE.
- No external GPT/API reviewer automation was used.
- No helper role remains open after handoff.
