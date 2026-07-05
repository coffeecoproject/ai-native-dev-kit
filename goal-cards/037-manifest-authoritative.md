# Goal Card: Manifest Authoritative Asset Source

## Human Summary

Route phase `0.37.0` as an implementation task: make manifest authoritative for asset lists and safe static copy rules, while keeping approval-sensitive behavior in code.

## Goal

Implement `tasks/037-manifest-authoritative.md` without changing PR template migration, AGENTS governance migration, industrial pack selection, init/update plan behavior, package publishing, or release approval.

## Goal Mode

Selected: IMPLEMENT_TASK

Reason: The phase has a defined request, preflight, spec, eval, task, and acceptance checks.

## Project State

Project state: DEV_KIT_PRODUCTIZATION

Adoption mode: Not applicable because this work changes the intentos repository itself, not a target project.

Workflow state: Phase `0.36.0` is committed; phase `0.37.0` has request, preflight, spec, eval, task, decision brief, review packet, and review loop evidence.

## Risk And Level

Task level: L2

Risk summary: Manifest authority changes internal asset-source behavior. It does not change secrets, permissions, production configuration, migration, destructive operation, value transfer, release approval, package publishing, or target business behavior.

## Engineering Baseline Touch

Engineering baseline checked: Yes

Baseline ref: `core/engineering-baseline.md`

Impact: Manifest authority is repository tooling structure. It centralizes asset contracts but does not create project-specific engineering conventions.

## Required Artifacts

| Artifact | Required | Ref |
|---|---|---|
| Request | Yes | `requests/037-manifest-authoritative.md` |
| Preflight | Yes | `preflight/037-manifest-authoritative.md` |
| Spec | Yes | `specs/037-manifest-authoritative.md` |
| Eval | Yes | `evals/037-manifest-authoritative.md` |
| Task | Yes | `tasks/037-manifest-authoritative.md` |
| Decision Brief | Yes | `decision-briefs/037-manifest-authoritative.md` |
| Review Packet | Yes | `review-packets/037-manifest-authoritative.md` |
| Review Loop Report | Yes | `review-loop-reports/037-manifest-authoritative.md` |
| Final Report | Yes | `final-reports/037-manifest-authoritative.md` |

## Allowed Actions

- Make manifest authoritative for asset groups and safe static copy rules.
- Update checker and init scripts to consume manifest helpers.
- Add generated-project manifest and loader assets.
- Update version metadata from `0.36.0` to `0.37.0`.
- Record phase evidence under `releases/0.37.0/`.

## Forbidden Actions

- Goal Card is route selection only and not approval for release, risk acceptance, Human Approval, Approval scope changes, or gate bypass.
- Do not change task scope without human approval.
- Do not bypass Risk Gate requirements.
- Do not change PR template or AGENTS approval semantics.
- Do not implement migration command or init/update plan behavior.
- Do not publish package.
- Do not add dependencies.

## Human Decisions Needed

| Decision | Required Now | Route |
|---|---|---|
| Keep approval-sensitive operations outside raw copy rules | Yes | `decision-briefs/037-manifest-authoritative.md` |
| Whether to add init/update dry-run and plans | No | Future `0.38.0` task |

## Next Safe Step

Run authoritative manifest checks and generated-project smoke for `tasks/037-manifest-authoritative.md`.

## Technical Details

Execution route: Goal Card -> Decision Brief -> Request -> Preflight -> Spec -> Eval -> Task -> Review Packet -> Review Loop Report -> Final Report.

Manifest authority covers static asset contracts. It does not approve higher-risk project mutations.

## Audit Notes

- This is an implementation phase with bounded productization scope.
- L2 review artifacts are required.
- Init/update safety planning remains deferred.
