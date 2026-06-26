# Decision Brief: CLI Front Door Distribution Boundary

## Human Summary

The decision for phase `0.36.0` is to add a local CLI front door now, but keep package distribution and migration behavior deferred. The CLI can make the dev kit easier to use, but it must stay a facade over existing scripts and must not become a second workflow engine.

## Current Status

- Decision: add private package metadata and a local CLI facade in phase `0.36.0`.
- Evidence: `package.json`, `scripts/cli.mjs`, README CLI guidance, and `scripts/check-dev-kit.mjs` CLI smoke checks.
- Risk level: medium, because package metadata can be mistaken for approval to publish and a CLI can accidentally hide lower-level script behavior.

## What I Need From You

No additional decision is needed to close this phase. A future human decision is needed before public package publishing, package namespace selection, migration implementation, or install/distribution guidance.

## Recommended Next Step

Close `0.36.0` after CLI smoke checks and dev-kit self-check pass, then start `0.37.0` manifest authoritative asset source only from a new request and task card.

## What AI Can Do Safely

- Add local private package metadata.
- Add a CLI facade that delegates to existing scripts.
- Add dry-run and write-command display.
- Document CLI usage in README.
- Keep `migrate` visible as a planned-only command.
- Record package publishing and migration as deferred decisions.

## What AI Must Not Do

- Do not publish or advertise an installable package in this phase.
- Do not add dependencies or package-manager lockfiles.
- Do not implement migration behavior.
- Do not make manifest authoritative.
- Do not bypass lower-level script failures.
- Do not treat CLI routing as release or risk approval.

## Human Decisions Needed

| Decision | Status | Owner | Route |
|---|---|---|---|
| Keep package private in `0.36.0` | Confirmed by this task scope | Repository owner | `tasks/036-cli-front-door.md` |
| Publish package later | Deferred | Repository owner | Future distribution decision |
| Choose package namespace later | Deferred | Repository owner | Future distribution decision |
| Implement migration later | Deferred | Repository owner | Future migration task |

## Next-Step Suggestions

| ID | Type | Suggestion | Relation to current task | Can AI do now? | Required entry | Risk / approval |
|---|---|---|---|---|---|---|
| N1 | DIRECT_FOLLOW_UP | Prepare `0.37.0` manifest authoritative source after this phase is reviewed | This is the next productization phase, not part of the current decision | No | follow-up proposal or new request | Human approval of phase scope required |
| N2 | RISK_DECISION | Decide package publishing name and distribution policy later | Related to CLI productization but outside current task | No | decision brief | package distribution and license approval required |
| N3 | DO_NOT_PROCEED | Do not publish or advertise an installable npm package in `0.36.0` | It would exceed the approved scope | No | do not proceed | separate human approval required |

## Technical Details

The CLI command registry may map commands to existing scripts and read manifest metadata for display. It must not read manifest groups as an authoritative asset source in this phase. Write commands must print their underlying command before execution, and recursive commands such as `self-check` must be covered through dry-run inside dev-kit self-check.

Evidence refs: `package.json`, `scripts/cli.mjs`, `scripts/check-dev-kit.mjs`, `README.md`, `README.zh-CN.md`, and `releases/0.36.0/phase-report.md`.

## Audit Notes

- This brief is a distribution and command-boundary decision, not release approval.
- No package publishing is approved.
- No license terms are changed.
- No target-project behavior is changed.
