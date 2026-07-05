# Decision Brief: Read-only IntentOS Manifest

## Human Summary

The decision for phase `0.35.0` is to introduce a central manifest now, but keep it read-only. The manifest can describe current assets and detect drift. It must not become the source of truth for init, update, checks, or generated-project behavior until a later approved phase.

## Current Status

- Decision: keep manifest read-only in phase `0.35.0`.
- Evidence: `intentos-manifest.json`, `schemas/intentos-manifest.schema.json`, and `scripts/check-manifest.mjs`.
- Risk level: medium, because manifest authority would affect many future workflows if introduced too early.

## What I Need From You

No additional decision is needed to close this phase. A future human decision is needed before phase `0.37.0` can make the manifest authoritative.

## Recommended Next Step

Close `0.35.0` after manifest checks pass, then start `0.36.0` CLI front door only from a new request and task card.

## What AI Can Do Safely

- Validate the read-only manifest.
- Report drift between manifest groups and existing script lists.
- Keep existing scripts on their current lists.
- Record manifest authority as deferred.

## What AI Must Not Do

- Do not make manifest authoritative in this phase.
- Do not remove existing script lists.
- Do not make init/update/check behavior read from manifest.
- Do not start CLI implementation inside this task.

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Keep manifest read-only for `0.35.0` | Confirmed by this task scope | Repository owner | `tasks/035-readonly-manifest.md` |
| Make manifest authoritative later | Deferred | Repository owner | Future `0.37.0` decision |

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare `0.36.0` CLI front door after this phase is reviewed | This is the next productization phase, not part of the current decision | No | follow-up proposal or new request | Human approval of phase scope required |
| N2 | DO_NOT_PROCEED | Do not make manifest authoritative in `0.35.0` | Authority would change init/update/check behavior beyond this task | No | do not proceed | Separate approval required for `0.37.0` |

## Technical Details

The manifest is allowed to mirror `check-intentos.mjs`, `check-ai-workflow.mjs`, `init-project.mjs`, and `templates/workflow-version.json`. The checker may compare those lists and report drift, but existing scripts continue to execute from their current lists.

Evidence refs: `intentos-manifest.json`, `scripts/check-manifest.mjs`, `scripts/check-intentos.mjs`, and `releases/0.35.0/phase-report.md`.

## Audit Notes

- This brief is a decision boundary, not release approval.
- No license terms are changed.
- No target-project behavior is changed.
