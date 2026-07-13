# Guided Adoption Recommendation

## Decision Responsibility Summary

Conclusion:

Next automatic action:

Can AI continue now: yes / limited / no

User decision class: <NO_USER_ACTION | BUSINESS_FACT_NEEDED | REAL_WORLD_CONSENT_NEEDED | EXTERNAL_FACT_NEEDED>

What I need from you: <plain bounded input or nothing>

Recommended reason:

What happens if you do nothing:

## Plain Summary

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
| Industrial packs | None by default; Codex selects only evidence-backed BL2 overlays |
| Goal mode | <ADOPTION | ADOPTION_READ_ONLY | TASK_OR_ADOPTION | DISCUSS_ONLY> |
| Plan first required | <true | false> |
| Adoption mode | <mode> |
| Risk level | <risk> |

## Why This Path

- <evidence-based reason>

## User Input Needed

- <one of the four user-input classes, or NO_USER_ACTION>

## Internal Next Actions

| Action | Command | Writes | Internal readiness required |
| --- | --- | --- | --- |
| Inspect only | `node scripts/cli.mjs start <project>` | No | No |
| Write plan | `node scripts/init-project.mjs --target <project> --write-plan adoption-plan.json` | Plan file only | Internal plan evidence |

## Actions AI Must Not Take Yet

- Do not write workflow assets from start; start is read-only by default.
- Do not install all industrial packs by default.
- Do not enable BL2 or any industrial pack without evidence-backed selection and strict internal review.
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
