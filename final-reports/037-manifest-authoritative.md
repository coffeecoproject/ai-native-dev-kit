# Final Report: Manifest Authoritative Asset Source

## Human Summary

Phase `0.37.0` makes the manifest the source of truth for dev-kit asset lists and safe static copy rules. The important boundary is that manifest authority does not approve risky mutations: PR template governance, AGENTS governance, industrial pack selection, migration, package publishing, and init/update plan behavior stay outside this phase.

## Completed

- Changed `dev-kit-manifest.json` to authoritative mode.
- Added manifest `copyRules`.
- Updated manifest schema for authoritative mode and copy rules.
- Updated manifest loader helpers.
- Updated `check-ai-workflow.mjs` to read target required paths from manifest.
- Updated `workflow-next.mjs` to read workflow readiness paths from manifest.
- Updated `check-dev-kit.mjs` to read source required files from manifest.
- Updated `init-project.mjs` to read safe static copy rules, workflow directories, and workflow version assets from manifest.
- Generated projects now receive `.ai-native/dev-kit-manifest.json` and `scripts/lib/manifest.mjs`.
- Updated `scripts/check-manifest.mjs` for authoritative checks.
- Updated version metadata to `0.37.0`.
- Added phase Goal Card, Subagent Run Plan, Decision Brief, Review Packet, Review Loop Report, Final Report, and release phase evidence.

## Verified

Commands run:

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

Result: PASS.

Evidence refs: `dev-kit-manifest.json`, `scripts/check-manifest.mjs`, `scripts/check-dev-kit.mjs`, `scripts/init-project.mjs`, and `review-loop-reports/037-manifest-authoritative.md`.

## Not Changed

- PR template migration approval behavior was not changed.
- AGENTS governance migration approval behavior was not changed.
- Industrial pack concrete selection behavior was not changed.
- Init/update plan, backup, or dry-run behavior was not added.
- Migration command was not implemented.
- Package was not published.
- No dependency was added.
- No license terms were rewritten.

## Risks Remaining

Manifest authority now centralizes asset lists, but init/update still performs direct writes for approved static assets. Plan-first init/update safety remains the next productization risk to handle in `0.38.0`.

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare phase `0.38.0` init/update safety after this phase is reviewed | This is the next productization phase, but outside current task scope | No | follow-up proposal or new request | Human approval of phase scope required |
| N2 | DO_NOT_PROCEED | Do not add init/update plan behavior, migration, or package publishing inside `0.37.0` | Those changes exceed this phase | No | do not proceed | Separate approval required |

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Make manifest authoritative for static assets in `0.37.0` | Confirmed by task scope | Repository owner | `decision-briefs/037-manifest-authoritative.md` |
| Add init/update plan-first behavior later | Deferred | Repository owner | Future `0.38.0` task |
| Publish package later | Deferred | Repository owner | Future distribution decision |

## Next Safe Action

Review the `0.37.0` phase evidence and only then start `0.38.0` from a new task card and follow-up request.

## Technical Details

The manifest loader resolves root `dev-kit-manifest.json` in the source repository and `.ai-native/dev-kit-manifest.json` in generated projects. The generated-project scripts use the copied manifest and loader, so required target assets can be added through manifest without editing the check and next-step scripts.

## Audit Notes

- Task level: L2.
- Review loop final status: DONE.
- No external GPT/API reviewer automation was used.
- No helper role remains open after handoff.
