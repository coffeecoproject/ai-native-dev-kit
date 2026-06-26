# Goal Card: CLI Front Door

## Human Summary

Route phase `0.36.0` as an implementation task: create a stable CLI entry point while preserving existing scripts as the real execution layer.

## Goal

Implement `tasks/036-cli-front-door.md` without changing manifest authority, target-project semantics, migration behavior, package publishing, or workflow gates.

## Goal Mode

Selected: IMPLEMENT_TASK

Reason: The phase has a defined request, preflight, spec, eval, task, and acceptance checks.

## Project State

Project state: DEV_KIT_PRODUCTIZATION

Adoption mode: Not applicable because this work changes the dev-kit repository itself, not a target project.

Workflow state: Phase `0.35.0` is committed; phase `0.36.0` has request, preflight, spec, eval, task, decision brief, review packet, and review loop evidence.

## Risk And Level

Task level: L2

Risk summary: The work adds repository tooling and smoke checks. It does not change target-project bootstrap semantics, manifest authority, permissions, secrets, migration, production configuration, or release authority.

## Engineering Baseline Touch

Engineering baseline checked: Yes

Baseline ref: `core/engineering-baseline.md`

Impact: CLI command routing is tooling structure. It must preserve existing source-of-truth scripts and avoid new platform-specific code standards.

## Required Artifacts

| Artifact | Required | Ref |
|---|---|---|
| Request | Yes | `requests/036-cli-front-door.md` |
| Preflight | Yes | `preflight/036-cli-front-door.md` |
| Spec | Yes | `specs/036-cli-front-door.md` |
| Eval | Yes | `evals/036-cli-front-door.md` |
| Task | Yes | `tasks/036-cli-front-door.md` |
| Decision Brief | Yes | `decision-briefs/036-cli-front-door.md` |
| Review Packet | Yes | `review-packets/036-cli-front-door.md` |
| Review Loop Report | Yes | `review-loop-reports/036-cli-front-door.md` |
| Final Report | Yes | `final-reports/036-cli-front-door.md` |

## Allowed Actions

- Add the CLI facade and private package metadata.
- Add local CLI smoke checks.
- Update README usage guidance.
- Update version metadata from `0.35.0` to `0.36.0`.
- Record phase evidence under `releases/0.36.0/`.

## Forbidden Actions

- Goal Card is route selection only and not approval for release, risk acceptance, Human Approval, Approval scope changes, or gate bypass.
- Do not change task scope without human approval.
- Do not bypass Risk Gate requirements.
- Do not publish a package.
- Do not make manifest authoritative.
- Do not implement migration behavior.
- Do not add dependencies.
- Do not change target-project bootstrap semantics.

## Human Decisions Needed

| Decision | Required Now | Route |
|---|---|---|
| Keep package private and unpublished in this phase | Yes | `decision-briefs/036-cli-front-door.md` |
| Whether to publish a package later | No | Future package distribution decision |

## Next Safe Step

Run CLI smoke checks and task-scoped workflow checks for `tasks/036-cli-front-door.md`.

## Technical Details

Execution route: Goal Card -> Decision Brief -> Request -> Preflight -> Spec -> Eval -> Task -> Review Packet -> Review Loop Report -> Final Report.

The CLI command registry delegates to existing scripts and uses manifest data only for basic display metadata.

## Audit Notes

- This is an implementation phase with bounded productization scope.
- L2 review artifacts are required.
- Package publication remains deferred.
