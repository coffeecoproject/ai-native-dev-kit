# Guided Adoption Recommendation

## Human Summary

Project type: NEW_PROJECT. Recommended mode: guided-init. start is read-only by default; no target project files were written.

## Project Classification

| Field | Value |
| --- | --- |
| Project type | NEW_PROJECT |
| Risk level | low |
| Adoption mode | guided-init |
| Can AI write now | No |
| Confidence | high |

## Recommended Adoption Path

| Field | Value |
| --- | --- |
| O level | O0/O1 |
| BL level | Codex selects BL1 by default for maintained products and BL2 only for concrete industrial risk |
| Profiles | Codex derives platform profiles from the product goal before init |
| Industrial packs | None by default; BL2 requires evidence-backed selection and strict internal review |
| Goal mode | ADOPTION |
| Plan first required | false |
| Adoption mode | guided-init |
| Risk level | low |

## Why This Path

- The target is empty enough to treat as a new project.
- Codex derives the platform and technical setup, then uses the controlled plan and readiness chain before writing.

## User Input Needed

- NO_USER_ACTION by default; request only an unavailable business goal detail.

## Internal Next Actions

| Action | Command | Writes | Internal readiness required |
| --- | --- | --- | --- |
| Preview init | `node scripts/cli.mjs init --target <project> --dry-run` | No | No |
| Write init plan | `node scripts/init-project.mjs --target <project> --write-plan adoption-plan.json` | Plan file only | Yes |
| Apply reviewed init plan | `node scripts/init-project.mjs --apply-plan adoption-plan.json` | Yes | Yes |

## Actions AI Must Not Take Yet

- Do not write workflow assets from start; start is read-only by default.
- Do not install all industrial packs by default.
- Do not enable BL2 or any industrial pack without evidence-backed selection and strict internal review.
- Do not change business code, deployment settings, secrets, migrations, permissions, or production configuration during adoption recommendation.

## Generated Plan / Report Refs

- adoption-recommendations/001-guided-start.md
- docs/first-hour.md

## Technical Evidence

| Field | Value |
| --- | --- |
| Project root | /tmp/new-project |
| workflow-next status | PASS |
| workflow-next next action | INIT_WITH_STARTER |
| workflow-next adoption mode | STANDARD |
| core workflow check | SKIPPED_NOT_BOOTSTRAPPED |
| core workflow check summary | Core workflow check skipped because the project is not bootstrapped yet. |
| target files written by start | No |

## Final Recommendation

Codex derives project type and platform, then creates and validates an init plan before controlled apply.
