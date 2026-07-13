# Guided Adoption Recommendation

## Human Summary

Project type: GOVERNED_EXISTING_PROJECT. Recommended mode: read-only-first. start is read-only by default; no target project files were written.

## Project Classification

| Field | Value |
| --- | --- |
| Project type | GOVERNED_EXISTING_PROJECT |
| Risk level | medium-high |
| Adoption mode | read-only-first |
| Can AI write now | No |
| Confidence | high |

## Recommended Adoption Path

| Field | Value |
| --- | --- |
| O level | O0/O1 read-only adoption |
| BL level | Do not change baseline until existing governance is mapped |
| Profiles | Codex derives profiles from project-owned evidence before writing |
| Industrial packs | None by default; BL2 requires evidence-backed selection and strict internal review |
| Goal mode | ADOPTION_READ_ONLY |
| Plan first required | true |
| Adoption mode | read-only-first |
| Risk level | medium-high |

## Why This Path

- Existing governance signals were detected.
- The safe path is assessment first, then a reviewable plan, then optional apply.

## User Input Needed

- NO_USER_ACTION by default; request only a missing business fact, exact prepared real-world consent, or unavailable external authority fact.

## Internal Next Actions

| Action | Command | Writes | Internal readiness required |
| --- | --- | --- | --- |
| Read-only assessment | `node scripts/cli.mjs next <project>` | No | No |
| Prepare adoption assessment | `Use .intentos/templates/adoption-assessment.md after assets are available, or draft the same structure manually.` | Report only | Yes |
| Write adoption plan later | `node scripts/init-project.mjs --target <project> --update-workflow-assets --write-plan adoption-plan.json` | Plan file only | Yes |

## Actions AI Must Not Take Yet

- Do not run direct init or direct update.
- Do not overwrite AGENTS.md, CI, PR template, or existing governance files.
- Do not change code, database, production settings, secrets, deployment files, or permissions.
- Do not enable BL2 or any industrial pack without evidence-backed selection and strict internal review.
- Do not install all industrial packs by default.

## Generated Plan / Report Refs

- adoption-recommendations/001-guided-start.md
- .intentos/templates/adoption-assessment.md
- .intentos/templates/existing-governance-map.md
- docs/first-hour.md

## Technical Evidence

| Field | Value |
| --- | --- |
| Project root | /tmp/governed-readonly |
| workflow-next status | PASS |
| workflow-next next action | RUN_ADOPTION_ASSESSMENT |
| workflow-next adoption mode | READ_ONLY |
| core workflow check | SKIPPED_NOT_BOOTSTRAPPED |
| core workflow check summary | Core workflow check skipped because the project is not bootstrapped yet. |
| target files written by start | No |

## Final Recommendation

Stay read-only while Codex produces the adoption assessment, reconciles project authority, and prepares a bounded write plan only when readiness is proven.
