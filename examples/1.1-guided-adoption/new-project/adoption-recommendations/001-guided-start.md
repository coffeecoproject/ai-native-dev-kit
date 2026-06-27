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
| BL level | BL0 first; BL1 or BL2 only after platform and risk confirmation |
| Profiles | Decide platform profile from project intent before init |
| Industrial packs | None by default; BL2 requires explicit human confirmation |
| Goal mode | ADOPTION |
| Plan first required | false |
| Adoption mode | guided-init |
| Risk level | low |

## Why This Path

- The target is empty enough to treat as a new project.
- AI can prepare the init command, but the human still confirms platform and intent before writing.

## Decisions Needed From Human

- Confirm this is the intended new project directory.
- Choose platform scope.
- Confirm whether to initialize workflow assets now.

## Safe Next Actions

| Action | Command | Writes | Requires human confirmation |
| --- | --- | --- | --- |
| Preview init | `node scripts/cli.mjs init --target <project> --dry-run` | No | No |
| Write init plan | `node scripts/init-project.mjs --target <project> --write-plan adoption-plan.json` | Plan file only | Yes |
| Apply reviewed init plan | `node scripts/init-project.mjs --apply-plan adoption-plan.json` | Yes | Yes |

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
| Project root | /tmp/new-project |
| workflow-next status | PASS |
| workflow-next next action | INIT_WITH_STARTER |
| workflow-next adoption mode | STANDARD |
| core workflow check | SKIPPED_NOT_BOOTSTRAPPED |
| core workflow check summary | Core workflow check skipped because the project is not bootstrapped yet. |
| target files written by start | No |

## Final Recommendation

Ask the human to confirm project type and platform, then create an init plan before applying anything.
