# Decision Brief: Manifest Authority Boundary

## Human Summary

The decision for phase `0.37.0` is to let manifest become authoritative for asset inventories and safe static copy rules. This does not mean every project mutation becomes data-driven. Approval-sensitive behavior, such as PR template migration, AGENTS governance, and industrial pack concrete selection, stays under existing guarded code paths.

## Current Status

- Decision: manifest may become authoritative for asset groups and safe static copy rules in phase `0.37.0`.
- Evidence: `dev-kit-manifest.json`, `schemas/dev-kit-manifest.schema.json`, `scripts/check-manifest.mjs`, `scripts/init-project.mjs`, `scripts/check-ai-workflow.mjs`, `scripts/workflow-next.mjs`, and `scripts/check-dev-kit.mjs`.
- Risk level: medium, because manifest authority changes internal behavior used by generated projects.

## What I Need From You

No additional decision is needed to close this phase. A future human decision is needed before init/update plan behavior, migration command behavior, package publishing, or license/distribution changes.

## Recommended Next Step

Close `0.37.0` after authoritative manifest checks and generated-project smoke pass, then start `0.38.0` init/update safety from a new request and task card.

## What AI Can Do Safely

- Make manifest authoritative for required file lists and static copy mappings.
- Copy manifest and loader into generated projects.
- Verify a manifest-added target path is reported by target checks.
- Keep guarded operations in existing code paths.
- Record deferred init/update safety work.

## What AI Must Not Do

- Do not replace PR template or AGENTS governance with raw copy rules.
- Do not copy concrete industrial packs without explicit selection or installed state.
- Do not add init/update dry-run, backup, or apply-plan behavior in this phase.
- Do not implement migration command behavior.
- Do not publish package or add dependencies.
- Do not treat manifest authority as release or risk approval.

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Make manifest authoritative for static assets in `0.37.0` | Confirmed by this task scope | Repository owner | `tasks/037-manifest-authoritative.md` |
| Add init/update plan-first behavior later | Deferred | Repository owner | Future `0.38.0` task |
| Publish package later | Deferred | Repository owner | Future distribution decision |

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare `0.38.0` init/update safety after this phase is reviewed | This is the next productization phase, not part of current task | No | follow-up proposal or new request | Human approval of phase scope required |
| N2 | DO_NOT_PROCEED | Do not move AGENTS or PR template approval behavior into raw copyRules | It would weaken existing safety behavior | No | do not proceed | separate human approval required |
| N3 | DO_NOT_PROCEED | Do not implement migration or package publishing inside `0.37.0` | Those changes exceed this phase | No | do not proceed | separate human approval required |

## Technical Details

Manifest authority covers `groups.sourceRequired`, `groups.targetCore`, `groups.targetFull`, `groups.workflowDirs`, `groups.workflowVersionAssets`, and `copyRules`. Existing approval-sensitive functions remain in code and are verified by generated-project smoke and self-check.

Evidence refs: `dev-kit-manifest.json`, `scripts/check-manifest.mjs`, `scripts/check-dev-kit.mjs`, `scripts/init-project.mjs`, and `releases/0.37.0/phase-report.md`.

## Audit Notes

- This brief is an authority-boundary decision, not release approval.
- No package publishing is approved.
- No license terms are changed.
- No target business behavior is changed.
