# Final Report: Read-only IntentOS Manifest

## Human Summary

Phase `0.35.0` adds a central intentos manifest, schema, loader, and drift checker. The manifest is intentionally read-only: it can describe current assets and report drift, but it does not drive init, update, workflow checks, CLI behavior, or generated-project behavior.

## Completed

- Added `intentos-manifest.json`.
- Added `schemas/intentos-manifest.schema.json`.
- Added `scripts/lib/manifest.mjs`.
- Added `scripts/check-manifest.mjs`.
- Added decision brief for the manifest authority boundary.
- Added phase Goal Card, Subagent Run Plan, Review Packet, Review Loop Report, and Final Report.
- Updated CI workflows to run `node scripts/check-manifest.mjs`.
- Updated `scripts/check-intentos.mjs` to run manifest checks and negative manifest cases.
- Updated version metadata to `0.35.0`.

## Verified

Commands run:

```bash
git diff --check
find scripts -name '*.mjs' -print0 | xargs -0 -n1 node --check
node scripts/check-manifest.mjs
node scripts/check-goal-mode.mjs . --goal-card goal-cards/035-readonly-manifest.md
node scripts/check-subagent-orchestration.mjs . --run-plan subagent-run-plans/035-readonly-manifest.md
node scripts/check-workflow-artifacts.mjs . --mode ready --task tasks/035-readonly-manifest.md
node scripts/check-review-loop.mjs . --task tasks/035-readonly-manifest.md
node scripts/check-next-step-boundary.mjs . --task tasks/035-readonly-manifest.md
node scripts/score-output-quality.mjs . --min-score 80
node scripts/check-fixtures.mjs
node scripts/check-intentos.mjs
```

Result: PASS.

Evidence refs: `intentos-manifest.json`, `scripts/check-manifest.mjs`, `decision-briefs/035-readonly-manifest.md`, and `review-loop-reports/035-readonly-manifest.md`.

## Not Changed

- No CLI was implemented.
- Manifest was not made authoritative.
- Existing init/update/check behavior was not changed to consume manifest.
- No artifact frontmatter or schema enforcement was added.
- No target-project bootstrap semantics changed.
- No industrial pack maturity state changed.
- No license terms were rewritten.

## Risks Remaining

Manifest authority remains a future risk because making it authoritative would affect many workflows. That decision is deferred to a later phase with separate approval.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare phase `0.36.0` CLI front door after this phase is reviewed | This is the next productization phase, but outside current task scope | No | follow-up proposal or new request | Human approval of phase scope required |
| N2 | DO_NOT_PROCEED | Do not switch init/update/check behavior to manifest in this phase | That would make manifest authoritative before the approved phase | No | do not proceed | Separate approval required for `0.37.0` |

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Keep manifest read-only in `0.35.0` | Confirmed by task scope | Repository owner | `decision-briefs/035-readonly-manifest.md` |
| Make manifest authoritative later | Deferred | Repository owner | Future `0.37.0` decision |

## Next Safe Action

Review the `0.35.0` phase evidence and only then start `0.36.0` from a new task card and follow-up request.

## Technical Details

The manifest checker validates manifest shape, checks `intentOSVersion` against `VERSION.md`, compares manifest groups to current script and template lists, and verifies that init-project workflow assets still match `templates/workflow-version.json`.

## Audit Notes

- Task level: L2.
- Review loop final status: DONE.
- No external GPT/API reviewer automation was used.
- No helper role remains open after handoff.
