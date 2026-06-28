# Guided Adoption Recommendation

## Human Decision Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
| --- | --- | --- | --- | --- | --- |
| A | Inspect only | Read and report current adoption path | No | low | Choose when you only want diagnosis |
| B | Plan first | Draft an adoption plan or adapter report | Plan/report only | low/medium | Choose when the project should keep a durable decision record |
| C | Apply reviewed setup | Apply approved workflow assets or migration reports | Yes, approved assets only | medium/high | Choose only after reviewing the plan |
| D | Pause | Stop adoption and wait | No | low | Choose when the decision is not ready |

Recommended reason:

What happens if you do nothing:

## Human Summary

Project type: <NEW_PROJECT | EXISTING_LIGHT_PROJECT | GOVERNED_EXISTING_PROJECT | PRODUCTION_SENSITIVE_PROJECT | DIRTY_WORKTREE_PROJECT | ALREADY_BOOTSTRAPPED_PROJECT | UNKNOWN_NEEDS_DISCUSSION>. Recommended mode: <mode>. start is read-only by default; no target project files were written.

## Project Classification

| Field | Value |
| --- | --- |
| Project type | <project-type> |
| Risk level | <low | medium | medium-high | high> |
| Adoption mode | <guided-init | plan-first | read-only-first | doctor-then-next-task | discuss-only> |
| Can AI write now | No |
| Confidence | <low | medium | high> |

## Recommended Adoption Path

| Field | Value |
| --- | --- |
| O level | <O0/O1/O2/O3> |
| BL level | <BL0/BL1/BL2 decision> |
| Profiles | <candidate platform profiles or none yet> |
| Industrial packs | None by default; BL2 requires explicit human confirmation |
| Goal mode | <ADOPTION | ADOPTION_READ_ONLY | TASK_OR_ADOPTION | DISCUSS_ONLY> |
| Plan first required | <true | false> |
| Adoption mode | <mode> |
| Risk level | <risk> |

## Why This Path

- <evidence-based reason>

## Decisions Needed From Human

- <decision the human must make>

## Safe Next Actions

| Action | Command | Writes | Requires human confirmation |
| --- | --- | --- | --- |
| Inspect only | `node scripts/cli.mjs start <project>` | No | No |
| Write plan | `node scripts/init-project.mjs --target <project> --write-plan adoption-plan.json` | Plan file only | Yes |

## Actions AI Must Not Take Yet

- Do not write workflow assets from start; start is read-only by default.
- Do not install all industrial packs by default.
- Do not enable BL2 or any industrial pack without explicit human confirmation.
- Do not change business code, deployment settings, secrets, migrations, permissions, or production configuration during adoption recommendation.

## Generated Plan / Report Refs

- adoption-recommendations/<date>-guided-start.md
- docs/first-hour.md

## Technical Evidence

| Field | Value |
| --- | --- |
| Project root | <path> |
| workflow-next status | <PASS | FAIL> |
| workflow-next next action | <next-action> |
| workflow-next adoption mode | <mode> |
| core workflow check | <PASS | FAIL | SKIPPED_NOT_BOOTSTRAPPED> |
| core workflow check summary | <summary> |
| target files written by start | No |

## Final Recommendation

<one clear recommendation>
