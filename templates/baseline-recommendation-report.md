# Baseline Recommendation Report: <project-name>

## User Input Summary

Conclusion:

Recommended choice: A / B / C / D

Can AI continue now: yes / limited / no

What I need from you:

| Option | What it means | What AI will do | Writes project files? | Risk | When to choose |
|---|---|---|---|---|---|
| A | Inspect only | Read current project signals and report baseline gaps | No | low | Choose when you only want diagnosis |
| B | Plan first | Draft a baseline plan for review | Plan/report only | low/medium | Choose when the project baseline should be confirmed before files change |
| C | Apply reviewed baseline | Apply authority-bound engineering/environment/profile docs | Yes, controlled baseline docs only | medium | Use only after readiness and rollback checks pass |
| D | Pause | Stop baseline setup and wait | No | low | Choose when the project direction is not ready |

Recommended reason:

What happens if you do nothing:

## Plain Summary

Can AI write now: No

Recommendation:

## Project Classification

| Field | Value |
|---|---|
| Project type |  |
| Risk level |  |
| Adoption mode |  |
| Recommended BL level |  |

## Profile Candidates

| Profile | Status | Evidence |
|---|---|---|
|  | CANDIDATE / PENDING_CONFIRMATION / REJECTED |  |

## Baseline State

| Layer | State | Ref | Notes |
|---|---|---|---|
| Engineering | MISSING / PENDING / PRESENT | `docs/engineering-baseline.md` |  |
| Environment | MISSING / PENDING / PRESENT | `docs/environment-baseline.md` |  |
| Platform | PENDING_CONFIRMATION | profiles |  |
| Industrial | NOT_APPLICABLE / PENDING_CONFIRMATION | selected packs only |  |

## Gap Summary

- 

## Pending User Input

- <one of the four user-input classes, or NO_USER_ACTION>

## High-risk Areas

- 

## Safe Next Actions

| Action | Command | Writes | Required authority/input |
|---|---|---|---|
| Read baseline recommendation | `node scripts/cli.mjs baseline <project>` | No | No |
| Write proposal | `node scripts/baseline-project.mjs <project> --write-plan baseline-recommendations/baseline-plan.json` | Project-local proposal file only | Internal plan evidence |
| Prepare controlled apply | `node scripts/init-project.mjs --target <project> --update-workflow-assets --profiles <profiles> --baseline-level <BL> --write-plan <project>/apply-execution-plans/baseline.json` | Exact plan file only | Yes |

## Actions AI Must Not Take Yet

- Do not create or edit `.env` files.
- Do not record secret values.
- Do not modify CI/CD, deployment, production config, AGENTS.md, PR templates, or industrial packs through baseline setup.
- Do not enable BL2 or install industrial packs without evidence-backed selection and strict internal review.

## Final Recommendation
