# Goal Card: Baseline Freeze And Self CI

## Human Summary

Start Productization Hardcut phase `0.34.0` by freezing the current `0.33.0` baseline and adding first-party repository CI. This card chooses the execution route only; it does not approve releases, change license terms, or start later manifest and CLI phases.

## Goal

Implement `tasks/034-baseline-freeze-self-ci.md` so the IntentOS has baseline release evidence, PR and release CI, repository governance files, and self-check coverage for the new assets.

## Goal Mode

Selected: IMPLEMENT_TASK

Reason: The request, preflight, spec, eval, and task card exist and define a bounded implementation phase.

## Project State

Project state: DEV_KIT_PRODUCTIZATION

Adoption mode: Not applicable because this work changes the intentos repository itself, not a target project.

Workflow state: Request, preflight, spec, eval, task, and phase plan exist for `0.34.0`.

## Risk And Level

Task level: L2

Risk summary: The work touches repository CI and release evidence, but it does not change target-project bootstrap behavior, manifest authority, CLI behavior, schemas, industrial pack maturity, secrets, deployment, or production configuration.

## Engineering Baseline Touch

Engineering baseline checked: Yes

Baseline ref: `core/engineering-baseline.md`

Impact: This phase adds repository governance and checker coverage only. It does not introduce a new source-code standard, database convention, or platform-specific engineering rule.

## Required Artifacts

| Artifact | Required | Ref |
|---|---|---|
| Request | Yes | `requests/034-baseline-freeze-self-ci.md` |
| Preflight | Yes | `preflight/034-baseline-freeze-self-ci.md` |
| Spec | Yes | `specs/034-baseline-freeze-self-ci.md` |
| Eval | Yes | `evals/034-baseline-freeze-self-ci.md` |
| Task | Yes | `tasks/034-baseline-freeze-self-ci.md` |
| Review Packet | Yes | `review-packets/034-baseline-freeze-self-ci.md` |
| Review Loop Report | Yes | `review-loop-reports/034-baseline-freeze-self-ci.md` |
| Final Report | Yes | `final-reports/034-baseline-freeze-self-ci.md` |

## Allowed Actions

- Add and update files that are listed in `tasks/034-baseline-freeze-self-ci.md`.
- Run local intentos checks and generated-project smoke checks.
- Extend `scripts/check-intentos.mjs` to validate the new productization CI and governance assets.
- Update version metadata from `0.33.0` to `0.34.0`.
- Record baseline and phase evidence under `releases/`.

## Forbidden Actions

- Goal Card is route selection only and not approval for release, risk acceptance, Human Approval, Approval scope changes, or gate bypass.
- Do not change task scope without human approval.
- Do not bypass Risk Gate requirements.
- Do not implement CLI, manifest authority, artifact schemas, init/update dry-run, backup, or apply-plan behavior.
- Do not change target-project bootstrap semantics.
- Do not rewrite license terms or promote draft industrial packs.

## Human Decisions Needed

| Decision | Required Now | Route |
|---|---|---|
| Replace draft CODEOWNERS guidance with real maintainer handles | No | Future release governance task |
| Change license wording beyond current CC BY-NC 4.0 statement | No | Separate human license decision |

## Next Safe Step

Complete the task-scoped artifacts and run `node scripts/check-intentos.mjs` plus the phase-specific checks listed in `tasks/034-baseline-freeze-self-ci.md`.

## Technical Details

Execution route: Goal Card -> Request -> Preflight -> Spec -> Eval -> Task -> Subagent Run Plan -> Review Packet -> Review Loop Report -> Final Report -> Release evidence.

The main thread owns file edits and verification. Helper-agent roles are represented in the run plan and must be closed or skipped before handoff.

## Audit Notes

- This is intentos productization work, not real target-project adoption evidence.
- L2 review artifacts are required because the phase changes CI and release evidence.
- Later 0.35 and 0.36 work remains out of scope.
