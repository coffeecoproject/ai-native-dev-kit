# Guided Adoption Recommendation

## Human Summary

Project type: EXISTING_LIGHT_PROJECT. Recommended mode: plan-first. start is read-only by default; no target project files were written.

## Project Classification

| Field | Value |
| --- | --- |
| Project type | EXISTING_LIGHT_PROJECT |
| Risk level | medium |
| Adoption mode | plan-first |
| Can AI write now | No |
| Confidence | medium |

## Recommended Adoption Path

| Field | Value |
| --- | --- |
| O level | O1 |
| BL level | BL0 first; BL1 after current stack is understood |
| Profiles | Infer candidate profiles from code, then ask human to confirm |
| Industrial packs | None by default; BL2 requires explicit human confirmation |
| Goal mode | ADOPTION |
| Plan first required | true |
| Adoption mode | plan-first |
| Risk level | medium |

## Why This Path

- The target has existing project signals but no strong governance or production-sensitive markers.
- A write plan lets the human review exactly what would be added before adoption.

## Decisions Needed From Human

- Confirm whether AI should only assess first or prepare a write plan.
- Confirm which project areas are in scope for initial workflow adoption.
- Confirm platform profile candidates before any baseline setup.

## Safe Next Actions

| Action | Command | Writes | Requires human confirmation |
| --- | --- | --- | --- |
| Inspect only | `node scripts/cli.mjs start <project>` | No | No |
| Write adoption plan | `node scripts/init-project.mjs --target <project> --update-workflow-assets --write-plan adoption-plan.json` | Plan file only | Yes |
| Apply reviewed plan | `node scripts/init-project.mjs --apply-plan adoption-plan.json` | Yes | Yes |

## Actions AI Must Not Take Yet

- Do not write workflow assets from start; start is read-only by default.
- Do not install all industrial packs by default.
- Do not enable BL2 or any industrial pack without explicit human confirmation.
- Do not change business code, deployment settings, secrets, migrations, permissions, or production configuration during adoption recommendation.

## Generated Plan / Report Refs

- adoption-recommendations/001-guided-start.md
- docs/first-hour.md

## Technical Evidence

| Field | Value |
| --- | --- |
| Project root | /tmp/existing-light-project |
| workflow-next status | PASS |
| workflow-next next action | RUN_WORKFLOW_ASSET_UPDATE |
| workflow-next adoption mode | STANDARD |
| core workflow check | SKIPPED_NOT_BOOTSTRAPPED |
| core workflow check summary | Core workflow check skipped because the project is not bootstrapped yet. |
| target files written by start | No |

## Final Recommendation

Prepare a write plan only after the human confirms the existing project should be adopted.
