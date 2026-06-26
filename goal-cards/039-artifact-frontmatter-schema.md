# Goal Card: Artifact Frontmatter + Schema

## Human Summary

Route phase `0.39.0` as `BASELINE_DECISION` followed by implementation: add artifact metadata without breaking human-readable Markdown or old artifacts.

## Goal

Implement `tasks/039-artifact-frontmatter-schema.md` with a time-boxed legacy compatibility policy.

## Goal Mode

Selected: IMPLEMENT_TASK

Reason: The roadmap decision is already scoped; this card authorizes the implementation route, not release or migration approval.

## Project State

Project state: DEV_KIT_PRODUCTIZATION

Workflow state: Phase `0.38.0` is committed; phase `0.39.0` implements artifact metadata.

Adoption mode: Not applicable.

## Risk And Level

Task level: L2

Risk reason: Checker behavior changes, but default legacy compatibility avoids breaking existing examples.

## Engineering Baseline Touch

Does this goal touch project-wide engineering decisions: Yes

Engineering baseline status: Checked against `core/engineering-baseline.md`

Decision Brief needed: No, because roadmap already records the compatibility decision.

## Required Artifacts

| Artifact | Required | Path / Status | Reason |
|---|---|---|---|
| Request | Yes | `requests/039-artifact-frontmatter-schema.md` | phase request |
| Preflight | Yes | `preflight/039-artifact-frontmatter-schema.md` | scope check |
| Spec | Yes | `specs/039-artifact-frontmatter-schema.md` | implementation contract |
| Eval | Yes | `evals/039-artifact-frontmatter-schema.md` | acceptance checks |
| Task | Yes | `tasks/039-artifact-frontmatter-schema.md` | execution scope |
| Review Packet | Yes | `review-packets/039-artifact-frontmatter-schema.md` | review input |
| Review Loop Report | Yes | `review-loop-reports/039-artifact-frontmatter-schema.md` | review closure |
| Final Report | Yes | `final-reports/039-artifact-frontmatter-schema.md` | final evidence |

## Allowed Actions

- Add schemas, frontmatter helper, generator metadata, checker validation, and self-check coverage.
- Update version metadata and release evidence.

## Forbidden Actions

- Do not treat this Goal Card as approval to migrate every example.
- Do not make strict schema default.
- Do not add dependencies.
- Do not bypass existing Markdown artifact checks.
- Do not implement fixture matrix expansion.

## Human Decisions Needed

| Decision | Owner | Needed Before | Current Status |
|---|---|---|---|
| Strict schema default timing | human | later release | Deferred |

## Next Safe Step

Run the `0.39.0` verification commands in `tasks/039-artifact-frontmatter-schema.md`.

## Technical Details

Frontmatter is metadata. Markdown sections remain active and required.

## Audit Notes

No helper agent remains open after handoff.
