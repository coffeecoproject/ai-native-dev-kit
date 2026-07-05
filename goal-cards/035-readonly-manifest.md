# Goal Card: Read-only IntentOS Manifest

## Human Summary

Route phase `0.35.0` as a baseline decision: introduce a central manifest but keep it read-only and non-authoritative. This card does not approve CLI work, manifest authority, init/update changes, or schema enforcement.

## Goal

Implement `tasks/035-readonly-manifest.md` while preserving the decision that manifest is only inventory and drift evidence in this phase.

## Goal Mode

Selected: BASELINE_DECISION

Reason: The phase defines a new productization baseline asset and its authority boundary.

## Project State

Project state: DEV_KIT_PRODUCTIZATION

Adoption mode: Not applicable because this work changes the intentos repository itself, not a target project.

Workflow state: Phase `0.34.0` is committed; phase `0.35.0` has request, preflight, spec, eval, task, and decision brief.

## Risk And Level

Task level: L2

Risk summary: The work adds repository inventory and drift checks. It does not change target-project bootstrap behavior, runtime behavior, release authority, permissions, secrets, migration, or production configuration.

## Engineering Baseline Touch

Engineering baseline checked: Yes

Baseline ref: `core/engineering-baseline.md`

Impact: The manifest is a repository inventory contract. It does not create platform-specific code standards or source-code scanning gates.

## Required Artifacts

| Artifact | Required | Ref |
|---|---|---|
| Request | Yes | `requests/035-readonly-manifest.md` |
| Preflight | Yes | `preflight/035-readonly-manifest.md` |
| Spec | Yes | `specs/035-readonly-manifest.md` |
| Eval | Yes | `evals/035-readonly-manifest.md` |
| Task | Yes | `tasks/035-readonly-manifest.md` |
| Decision Brief | Yes | `decision-briefs/035-readonly-manifest.md` |
| Review Packet | Yes | `review-packets/035-readonly-manifest.md` |
| Review Loop Report | Yes | `review-loop-reports/035-readonly-manifest.md` |
| Final Report | Yes | `final-reports/035-readonly-manifest.md` |

## Allowed Actions

- Add and validate read-only manifest assets.
- Run local manifest and intentos checks.
- Update CI to include explicit manifest checks.
- Update version metadata from `0.34.0` to `0.35.0`.
- Record phase evidence under `releases/0.35.0/`.

## Forbidden Actions

- Goal Card is route selection only and not approval for release, risk acceptance, Human Approval, Approval scope changes, or gate bypass.
- Do not change task scope without human approval.
- Do not bypass Risk Gate requirements.
- Do not implement CLI.
- Do not make manifest authoritative.
- Do not change init/update/check behavior to consume manifest.
- Do not add artifact schema enforcement or target-project bootstrap changes.

## Human Decisions Needed

| Decision | Required Now | Route |
|---|---|---|
| Keep manifest read-only until a later authority phase | Yes | `decision-briefs/035-readonly-manifest.md` |
| Whether manifest can become authoritative | No | Future `0.37.0` decision |

## Next Safe Step

Run manifest validation and task-scoped checks for `tasks/035-readonly-manifest.md`.

## Technical Details

Execution route: Goal Card -> Decision Brief -> Request -> Preflight -> Spec -> Eval -> Task -> Review Packet -> Review Loop Report -> Final Report.

The manifest checker compares manifest groups against existing script/template lists. Existing scripts still own runtime behavior.

## Audit Notes

- This is a baseline decision and bounded implementation phase.
- L2 review artifacts are required.
- Manifest authority remains deferred.
