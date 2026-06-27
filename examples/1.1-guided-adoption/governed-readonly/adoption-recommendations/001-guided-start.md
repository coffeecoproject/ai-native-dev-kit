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
| Profiles | Infer only; confirm with human before writing |
| Industrial packs | None by default; BL2 requires explicit human confirmation |
| Goal mode | ADOPTION_READ_ONLY |
| Plan first required | true |
| Adoption mode | read-only-first |
| Risk level | medium-high |

## Why This Path

- Existing governance signals were detected.
- The safe path is assessment first, then a reviewable plan, then optional apply.

## Decisions Needed From Human

- Confirm who owns the existing governance rules and current changes.
- Confirm whether AI may prepare a read-only adoption assessment.
- Confirm whether any workflow write plan is allowed after assessment.

## Safe Next Actions

| Action | Command | Writes | Requires human confirmation |
| --- | --- | --- | --- |
| Read-only assessment | `node scripts/cli.mjs next <project>` | No | No |
| Prepare adoption assessment | `Use .ai-native/templates/adoption-assessment.md after assets are available, or draft the same structure manually.` | Report only | Yes |
| Write adoption plan later | `node scripts/init-project.mjs --target <project> --update-workflow-assets --write-plan adoption-plan.json` | Plan file only | Yes |

## Actions AI Must Not Take Yet

- Do not run direct init or direct update.
- Do not overwrite AGENTS.md, CI, PR template, or existing governance files.
- Do not change code, database, production settings, secrets, deployment files, or permissions.
- Do not enable BL2 or any industrial pack without explicit human confirmation.
- Do not install all industrial packs by default.

## Generated Plan / Report Refs

- adoption-recommendations/001-guided-start.md
- .ai-native/templates/adoption-assessment.md
- .ai-native/templates/existing-governance-map.md
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

Stay read-only. Produce an adoption assessment and ask for human confirmation before any write plan.
