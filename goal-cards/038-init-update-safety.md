# Goal Card: Init/Update Safety

## Human Summary

Route phase `0.38.0` as an implementation task: make project initialization and workflow asset updates plan-first when risk is present, while preserving simple direct update for already bootstrapped low-risk projects.

## Goal

Implement `tasks/038-init-update-safety.md` without changing migration command behavior, package publishing, artifact schema/frontmatter, industrial pack selection, or approval-sensitive AGENTS/PR template semantics.

## Goal Mode

Selected: IMPLEMENT_TASK

Reason: The phase has a defined request, preflight, spec, eval, task, and productization roadmap entry.

## Project State

Project state: DEV_KIT_PRODUCTIZATION

Adoption mode: Not applicable because this work changes the dev-kit repository itself, not a target project.

Workflow state: Phase `0.37.0` is committed; phase `0.38.0` has request, preflight, spec, eval, task, review packet, review loop, and final report assets.

## Risk And Level

Task level: L2

Risk summary: Init/update behavior writes workflow assets into target projects. The risk is controlled by plan preview, fingerprint validation, backup, and direct-update blocking for risky targets.

## Engineering Baseline Touch

Engineering baseline checked: Yes

Baseline ref: `core/engineering-baseline.md`

Impact: This is dev-kit tooling behavior. It does not define project-specific coding conventions or source-code scanning.

## Required Artifacts

| Artifact | Required | Ref |
|---|---|---|
| Request | Yes | `requests/038-init-update-safety.md` |
| Preflight | Yes | `preflight/038-init-update-safety.md` |
| Spec | Yes | `specs/038-init-update-safety.md` |
| Eval | Yes | `evals/038-init-update-safety.md` |
| Task | Yes | `tasks/038-init-update-safety.md` |
| Review Packet | Yes | `review-packets/038-init-update-safety.md` |
| Review Loop Report | Yes | `review-loop-reports/038-init-update-safety.md` |
| Final Report | Yes | `final-reports/038-init-update-safety.md` |

## Allowed Actions

- Add dry-run, write-plan, apply-plan, backup-dir, and plan validation.
- Update CLI dry-run routing.
- Update dev-kit self-check scenarios.
- Update version metadata and release evidence to `0.38.0`.

## Forbidden Actions

- Goal Card is route selection only and not approval for release, package publishing, migration command, artifact schema, or license changes.
- Do not add dependencies.
- Do not call external GPT/API reviewers.
- Do not implement source-code scanning.
- Do not weaken existing governance migration approval behavior.

## Human Decisions Needed

| Decision | Required Now | Route |
|---|---|---|
| Add init/update plan-first safety | Yes | `tasks/038-init-update-safety.md` |
| Implement migration command | No | Future `0.42.0` phase |
| Add artifact schema/frontmatter | No | Future `0.39.0` phase |

## Next Safe Step

Run the `0.38.0` safety checks and self-check.

## Technical Details

Execution route: Goal Card -> Request -> Preflight -> Spec -> Eval -> Task -> Review Packet -> Review Loop Report -> Final Report.

## Audit Notes

- This is an implementation phase with bounded productization scope.
- No external reviewer automation is used.
- No helper agent may remain open after handoff.
